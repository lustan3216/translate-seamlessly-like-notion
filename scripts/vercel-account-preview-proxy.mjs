import { isIP } from "node:net";

const liveWorker = "https://cloudflare.anytranslator.app";
const liveAccountHost = "account.anytranslator.app";
const devAccountHost = "account-dev.anytranslator.app";
const liveMarketingHost = "www.anytranslator.app";
const billingCatalog = "billing/catalog";
const guestResend = "billing/guest-resend";
const guestStatus = "billing/guest-status";
const guestPostRoutes = new Set(["billing/guest-checkout", guestResend]);
const subscriptionWrites = new Set(["billing/change-plan", "billing/cancel-pending-change", "billing/cancel", "billing/resume"]);
const billingAccountPosts = new Set(["billing/checkout", ...subscriptionWrites]);
const getRoutes = new Set([billingCatalog, guestStatus, "session", "billing/status"]);
const postRoutes = new Set([
  "passkeys/register/options", "passkeys/register/verify",
  "passkeys/login/options", "passkeys/login/verify",
  "pair/preview", "pair/approve", "logout", "delete",
  "email-access", "email-access/request", "email-access/verify",
  "billing/portal", "billing/app-link", ...billingAccountPosts, ...guestPostRoutes,
]);
const prefix = "/api/account/";
const jsonType = "application/json";
const maxBodyBytes = 64 * 1024;
const ownedCookie = /^__Host-at_(?:session|flow)=/;
const sessionCookie = /^__Host-at_session=[A-Za-z0-9_-]{43}$/;
const idempotencyPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const setCookie = /^__Host-at_(?:session|flow)=(?:[A-Za-z0-9_-]{43})?; Max-Age=\d+; Path=\/; HttpOnly; Secure; SameSite=Strict$/;

/** @param {string | undefined} origin */
export function isPreviewWorkerOrigin(origin) {
  return /^https:\/\/[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.et3216-c0d\.workers\.dev$/.test(origin ?? "");
}

function routeFromPath(url = "", functionPath) {
  const delimiter = url.indexOf("?");
  const pathname = delimiter === -1 ? url : url.slice(0, delimiter);
  const query = new URLSearchParams(delimiter === -1 ? "" : url.slice(delimiter + 1));
  const rewritten = query.get("account_route");
  const direct = pathname.startsWith(prefix);
  const route = direct ? pathname.slice(prefix.length) : pathname === functionPath ? rewritten : null;
  if (!route) return null;

  // Vercel may keep the original pathname and append the rewrite parameter.
  if (route === guestStatus) {
    const checkoutId = query.get("checkoutId");
    if (!checkoutId?.trim() || query.size !== (rewritten === null ? 1 : 2)
      || (rewritten !== null && rewritten !== route)) return null;
    return { route, search: `?${new URLSearchParams({ checkoutId })}` };
  }
  return (direct && delimiter === -1) || (query.size === 1 && rewritten === route) ? { route, search: "" } : null;
}

function reply(res, status, error) {
  res.statusCode = status;
  res.end(JSON.stringify({ error }));
}

async function proxy(req, res, { vercelEnvironment, host, token, backend, functionPath, live = false, publicBilling = false, marketingOrigin }) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Robots-Tag", "noindex, nofollow");
  res.setHeader("Referrer-Policy", "no-referrer");

  if (process.env.VERCEL_ENV !== vercelEnvironment || !host
    || req.headers.host !== host || !/^[\x21-\x7e]{32,512}$/.test(token ?? "")) {
    return reply(res, 404, "not_found");
  }
  if (!backend) return reply(res, 503, "not_configured");

  const destination = routeFromPath(req.url, functionPath);
  if (!destination) return reply(res, 404, "not_found");
  const { route, search } = destination;
  const publicRoute = route === billingCatalog || route === guestStatus || guestPostRoutes.has(route);
  if (publicBilling && !publicRoute) return reply(res, 404, "not_found");
  const method = getRoutes.has(route) ? "GET" : postRoutes.has(route) ? "POST" : null;
  if (!method) return reply(res, 404, "not_found");

  const origin = `https://${host}`;
  const { origin: requestOrigin, "sec-fetch-site": fetchSite } = req.headers;
  const marketingRoute = marketingOrigin && (route === "session" || route === "logout");
  const fromMarketing = marketingRoute && requestOrigin === marketingOrigin && fetchSite === "same-site";
  const preflight = fromMarketing && route === "logout" && req.method === "OPTIONS";
  if (marketingRoute) res.setHeader("Vary", "Origin");
  if (req.method !== method && !preflight) {
    res.setHeader("Allow", method);
    return reply(res, 405, "method_not_allowed");
  }
  if (!fromMarketing && ((requestOrigin !== undefined && requestOrigin !== origin)
    || (fetchSite !== undefined && fetchSite !== "same-origin") || (method === "POST" && requestOrigin !== origin))) {
    return reply(res, 403, "invalid_preview_request");
  }
  if (preflight) {
    const requestedHeaders = req.headers["access-control-request-headers"];
    if (req.headers["access-control-request-method"] !== "POST"
      || (requestedHeaders !== undefined && (typeof requestedHeaders !== "string" || requestedHeaders.toLowerCase() !== "content-type"))) {
      return reply(res, 403, "invalid_preview_request");
    }
  }
  if (fromMarketing) {
    res.setHeader("Access-Control-Allow-Origin", marketingOrigin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }
  if (preflight) {
    res.setHeader("Access-Control-Allow-Methods", "POST");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.statusCode = 204;
    return res.end();
  }

  const headers = { Accept: jsonType, Origin: publicBilling ? `https://${liveAccountHost}` : origin, "X-AT-Account-Proxy-Token": token };
  const visitorIp = req.headers["x-vercel-forwarded-for"];
  if (live && typeof visitorIp === "string" && isIP(visitorIp)) {
    headers["X-AT-Account-Client-IP"] = visitorIp;
  }
  const forwardCookies = !publicRoute;
  if (forwardCookies) {
    const cookies = req.headers.cookie?.split(";").map((value) => value.trim()).filter((value) => ownedCookie.test(value));
    if (billingAccountPosts.has(route) && !cookies?.some((cookie) => sessionCookie.test(cookie))) {
      return reply(res, 401, "sign_in_required");
    }
    if (cookies?.length) headers.Cookie = cookies.join("; ");
  }
  if (subscriptionWrites.has(route)) {
    const key = req.headers["idempotency-key"];
    if (typeof key !== "string" || !idempotencyPattern.test(key)) {
      return reply(res, 400, "creem_invalid_idempotency_key");
    }
    headers["Idempotency-Key"] = key;
  }

  try {
    let body;
    if (method === "POST") {
      if (req.headers["content-type"]?.split(";")[0].trim().toLowerCase() !== jsonType) {
        return reply(res, 415, "json_body_required");
      }
      const chunks = [];
      let bytes = 0;
      for await (const chunk of req) {
        bytes += chunk.length;
        if (bytes > maxBodyBytes) return reply(res, 413, "body_too_large");
        chunks.push(chunk);
      }
      body = Buffer.concat(chunks);
      headers["Content-Type"] = jsonType;
    }
    const response = await fetch(`${backend}/v1/account/${route}${search}`, {
      method, headers, body, redirect: "manual", signal: AbortSignal.timeout(50_000),
    });
    if (route === guestResend && response.status === 202) {
      await response.body?.cancel();
      res.statusCode = 202;
      return res.end("{}");
    }
    if (response.status < 200 || (response.status >= 300 && response.status < 400) || response.status >= 500
      || response.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== jsonType) {
      return reply(res, 502, "request_failed");
    }
    const result = await response.text();
    const outgoing = forwardCookies && response.ok && response.headers.getSetCookie().filter((value) => setCookie.test(value));
    if (outgoing?.length) res.setHeader("Set-Cookie", outgoing);
    res.statusCode = response.status;
    res.end(result);
  } catch {
    reply(res, 502, "request_failed");
  }
}

function previewWorkerProxy(req, res, { vercelEnvironment, host, functionPath }) {
  const { SHARED_ACCOUNT_PROXY_TOKEN: token, SHARED_ACCOUNT_PREVIEW_WORKER_ORIGIN: backend } = process.env;
  return proxy(req, res, {
    vercelEnvironment, host, functionPath, token, backend: isPreviewWorkerOrigin(backend) ? backend : undefined,
  });
}

export default function previewAccountProxy(req, res) {
  const host = process.env.VERCEL_URL;
  return previewWorkerProxy(req, res, {
    vercelEnvironment: "preview",
    host: /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.vercel\.app$/.test(host ?? "") ? host : null,
    functionPath: "/api/account-preview",
  });
}

export function devAccountProxy(req, res) {
  return previewWorkerProxy(req, res, {
    vercelEnvironment: "production", host: devAccountHost, functionPath: "/api/account-dev",
  });
}

export function liveAccountProxy(req, res) {
  return proxy(req, res, {
    vercelEnvironment: "production", host: liveAccountHost,
    token: process.env.SHARED_ACCOUNT_LIVE_PROXY_TOKEN, backend: liveWorker,
    functionPath: "/api/account-live", live: true, marketingOrigin: `https://${liveMarketingHost}`,
  });
}

export function liveCatalogProxy(req, res) {
  return proxy(req, res, {
    vercelEnvironment: "production", host: liveMarketingHost,
    token: process.env.SHARED_ACCOUNT_LIVE_PROXY_TOKEN, backend: liveWorker,
    functionPath: "/api/account-catalog", live: true, publicBilling: true,
  });
}
