import { isIP } from "node:net";

const liveWorker = "https://cloudflare.anytranslator.app";
const liveAccountHost = "account.anytranslator.app";
const billingCatalog = "billing/catalog";
const guestResend = "billing/guest-resend";
const guestBillingRoutes = new Set(["billing/guest-checkout", guestResend]);
const livePostRoutes = new Set(["email-access", "email-access/request"]);
const getRoutes = new Set(["session", "billing/status"]);
const postRoutes = new Set([
  "passkeys/register/options", "passkeys/register/verify",
  "passkeys/login/options", "passkeys/login/verify",
  "pair/preview", "pair/approve", "logout", "delete",
  "translate", "billing/portal", "billing/app-link", ...guestBillingRoutes,
]);
const prefix = "/api/account/";
const jsonType = "application/json";
const maxBodyBytes = 64 * 1024;
const ownedCookie = /^__Host-at_(?:session|flow)=/;
const setCookie = /^__Host-at_(?:session|flow)=(?:[A-Za-z0-9_-]{43})?; Max-Age=\d+; Path=\/; HttpOnly; Secure; SameSite=Strict$/;

/** @param {string | undefined} origin */
export function isPreviewWorkerOrigin(origin) {
  return /^https:\/\/[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.et3216-c0d\.workers\.dev$/.test(origin ?? "");
}

function routeFromPath(url = "", functionPath) {
  const delimiter = url.indexOf("?");
  const pathname = delimiter === -1 ? url : url.slice(0, delimiter);
  const query = new URLSearchParams(delimiter === -1 ? "" : url.slice(delimiter + 1));
  const rewritten = query.size === 1 ? query.get("account_route") : null;
  if (pathname.startsWith(prefix)) {
    const route = pathname.slice(prefix.length);
    // Vercel may keep the original pathname and append the rewrite parameter.
    return delimiter === -1 || rewritten === route ? route : null;
  }
  return pathname === functionPath ? rewritten : null;
}

function reply(res, status, error) {
  res.statusCode = status;
  res.end(JSON.stringify({ error }));
}

async function proxy(req, res, { vercelEnvironment, host, target, functionPath, publicBilling = false }) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Robots-Tag", "noindex, nofollow");
  res.setHeader("Referrer-Policy", "no-referrer");

  if (process.env.VERCEL_ENV !== vercelEnvironment || !host
    || req.headers.host !== host || (target && !/^[\x21-\x7e]{32,512}$/.test(target.token ?? ""))) {
    return reply(res, 404, "not_found");
  }
  if (!target?.backend) return reply(res, 503, "not_configured");

  const { backend, token } = target;
  const route = routeFromPath(req.url, functionPath);
  const catalog = route === billingCatalog;
  if (publicBilling && !catalog && !guestBillingRoutes.has(route)) return reply(res, 404, "not_found");
  const canPost = postRoutes.has(route) || (vercelEnvironment === "production" && livePostRoutes.has(route));
  const method = catalog || getRoutes.has(route) ? "GET" : canPost ? "POST" : null;
  if (!method) return reply(res, 404, "not_found");
  if (req.method !== method) {
    res.setHeader("Allow", method);
    return reply(res, 405, "method_not_allowed");
  }

  const origin = `https://${host}`;
  const { origin: requestOrigin, "sec-fetch-site": fetchSite } = req.headers;
  if ((requestOrigin !== undefined && requestOrigin !== origin)
    || (fetchSite !== undefined && fetchSite !== "same-origin") || (method === "POST" && requestOrigin !== origin)) {
    return reply(res, 403, "invalid_preview_request");
  }

  const headers = { Accept: jsonType, Origin: publicBilling ? `https://${liveAccountHost}` : origin, "X-AT-Account-Proxy-Token": token };
  const visitorIp = req.headers["x-vercel-forwarded-for"];
  if (vercelEnvironment === "production" && typeof visitorIp === "string" && isIP(visitorIp)) {
    headers["X-AT-Account-Client-IP"] = visitorIp;
  }
  const forwardCookies = !catalog && !guestBillingRoutes.has(route);
  if (forwardCookies) {
    const cookies = req.headers.cookie?.split(";").map((value) => value.trim()).filter((value) => ownedCookie.test(value));
    if (cookies?.length) headers.Cookie = cookies.join("; ");
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
    const response = await fetch(`${backend}/v1/account/${route}`, {
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

export default function previewAccountProxy(req, res) {
  const { VERCEL_URL: host, SHARED_ACCOUNT_PROXY_TOKEN: token, SHARED_ACCOUNT_PREVIEW_WORKER_ORIGIN: backend } = process.env;
  return proxy(req, res, {
    vercelEnvironment: "preview",
    host: /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.vercel\.app$/.test(host ?? "") ? host : null,
    target: { token, backend: isPreviewWorkerOrigin(backend) ? backend : undefined },
    functionPath: "/api/account-preview",
  });
}

function liveProxyTarget() {
  const {
    SHARED_ACCOUNT_LIVE_TEST_WORKER_ORIGIN: backend,
    SHARED_ACCOUNT_LIVE_TEST_PROXY_TOKEN: token,
  } = process.env;
  // shortcut: Creem Test backend until Creem Live approval; delete both Vercel vars (and this branch) after approval.
  if (backend === undefined && token === undefined) {
    return { backend: liveWorker, token: process.env.SHARED_ACCOUNT_LIVE_PROXY_TOKEN };
  }
  return isPreviewWorkerOrigin(backend) && token ? { backend, token } : undefined;
}

export function liveAccountProxy(req, res) {
  return proxy(req, res, {
    vercelEnvironment: "production", host: liveAccountHost,
    target: liveProxyTarget(),
    functionPath: "/api/account-live",
  });
}

export function liveCatalogProxy(req, res) {
  return proxy(req, res, {
    vercelEnvironment: "production", host: "www.anytranslator.app",
    target: liveProxyTarget(),
    functionPath: "/api/account-catalog", publicBilling: true,
  });
}
