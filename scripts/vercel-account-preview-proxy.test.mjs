import assert from "node:assert/strict";
import { Readable } from "node:stream";
import { test } from "node:test";
import handler, { liveAccountProxy, liveCatalogProxy } from "./vercel-account-preview-proxy.mjs";

test("account sessions and public billing stay on their assigned origins", async (context) => {
  const env = {
    VERCEL_ENV: "preview",
    VERCEL_URL: "account-preview-abc.vercel.app",
    SHARED_ACCOUNT_PROXY_TOKEN: "server-token-12345678901234567890123456",
    SHARED_ACCOUNT_LIVE_PROXY_TOKEN: "separate-live-token-123456789012345678",
  };
  const original = Object.fromEntries(Object.keys(env).map((key) => [key, process.env[key]]));
  Object.assign(process.env, env);
  context.after(() => {
    for (const [key, old] of Object.entries(original)) {
      if (old === undefined) delete process.env[key];
      else process.env[key] = old;
    }
  });
  const origin = `https://${env.VERCEL_URL}`;
  const accountCookie = `__Host-at_session=${"c".repeat(43)}`;
  const session = `${accountCookie}; Max-Age=2592000; Path=/; HttpOnly; Secure; SameSite=Strict`;
  const clear = "__Host-at_flow=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Strict";
  let request;
  let upstreamStatus = 200;
  const offers = ["standard", "voice"].flatMap((plan) =>
    ["weekly", "monthly", "yearly"].map((period) => ({
      id: `${plan}-${period}`, plan, period, amount: 999, currency: "USD", taxMode: "exclusive",
      updatedAt: "2026-11-21T00:00:00Z",
    })),
  );
  const upstream = context.mock.method(globalThis, "fetch", async (url, options) => {
    request = { url, ...options };
    const headers = [
      ["set-cookie", session], ["set-cookie", clear], ["set-cookie", "unrelated=discard"],
      ["set-cookie", "__Host-at_session=invalid; Domain=vercel.app"], ["location", "https://example.invalid"],
    ];
    if (url.endsWith("/billing/guest-resend")) {
      return new Response(null, { status: 202, headers });
    }
    const payload = url.endsWith("/billing/catalog")
      ? { offers, guestCheckoutEnabled: true }
      : url.endsWith("/billing/guest-checkout")
        ? { checkoutUrl: "https://checkout.creem.io/ch_fixture", checkoutId: "ch_fixture" }
        : { account: {} };
    return Response.json(payload, { status: upstreamStatus, headers });
  });

  async function call({
    method = "POST", url = "/api/account/passkeys/login/options", body = Buffer.from("{}"), headers = {}, proxy = handler,
  } = {}) {
    const req = Object.assign(Readable.from([body]), {
      method, url,
      headers: { host: env.VERCEL_URL, origin, "sec-fetch-site": "same-origin", "content-type": "application/json", ...headers },
    });
    const res = {
      statusCode: 200, headers: {},
      setHeader(name, value) { this.headers[name.toLowerCase()] = value; },
      end(data) { this.body = JSON.parse(data); },
    };
    await proxy(req, res);
    return res;
  }

  const allowed = await call({ headers: {
    cookie: `deployment-cookie=never-forward; ${accountCookie}`,
    "x-at-account-proxy-token": "spoofed", "x-at-account-client-ip": "spoofed",
    "x-forwarded-host": "spoofed", authorization: "spoofed",
  } });
  assert.equal(allowed.statusCode, 200);
  assert.deepEqual(allowed.headers["set-cookie"], [session, clear]);
  assert.equal(allowed.headers.location, undefined);
  assert.equal(allowed.headers["cache-control"], "private, no-store");
  assert.equal(request.url, "https://codex-creem-shared-account-anytranslator-api-dev.et3216-c0d.workers.dev/v1/account/passkeys/login/options");
  assert.equal(request.redirect, "manual");
  assert.equal(request.body.toString(), "{}");
  assert.deepEqual(request.headers, {
    Accept: "application/json", Origin: origin, "X-AT-Account-Proxy-Token": env.SHARED_ACCOUNT_PROXY_TOKEN,
    Cookie: accountCookie, "Content-Type": "application/json",
  });

  assert.equal((await call({ method: "GET", url: "/api/account-preview?account_route=billing%2Fstatus" })).statusCode, 200);
  assert.match(request.url, /\/billing\/status$/);
  assert.equal((await call({ method: "GET", url: "/api/account/session?account_route=session" })).statusCode, 200);
  assert.equal(request.body, undefined);
  const previewCatalog = await call({ method: "GET", url: "/api/account/billing/catalog", headers: { cookie: accountCookie } });
  assert.deepEqual(previewCatalog.body, { offers, guestCheckoutEnabled: true });
  assert.equal(previewCatalog.headers["set-cookie"], undefined);
  assert.equal(request.headers.Cookie, undefined);

  for (const [options, status] of [
    [{ headers: { host: "www.anytranslator.app", "x-forwarded-host": env.VERCEL_URL } }, 404],
    [{ headers: { origin: "https://other.vercel.app" } }, 403],
    [{ headers: { origin: undefined } }, 403],
    [{ headers: { "sec-fetch-site": "same-site" } }, 403],
    [{ url: "/api/account/%2e%2e/webhooks/creem-test" }, 404],
    [{ url: "/api/account-preview?account_route=session&account_route=delete" }, 404],
    [{ url: "/api/account/session?account_route=delete" }, 404],
    [{ url: "/api/account/pair/start" }, 404],
    [{ url: "/api/account/billing/app-link" }, 404],
    [{ url: "/api/account/billing/guest-checkout" }, 404],
    [{ url: "/api/account/billing/guest-resend" }, 404],
    [{ url: "/api/account/email-access" }, 404],
    [{ url: "/api/account/email-access/request" }, 404],
    [{ method: "GET" }, 405],
    [{ headers: { "content-type": "text/plain" } }, 415],
    [{ body: Buffer.alloc(65_537) }, 413],
  ]) {
    assert.equal((await call(options)).statusCode, status);
  }
  process.env.VERCEL_ENV = "production";
  assert.equal((await call()).statusCode, 404);
  process.env.VERCEL_ENV = "preview";
  delete process.env.SHARED_ACCOUNT_PROXY_TOKEN;
  assert.equal((await call()).statusCode, 404);
  process.env.SHARED_ACCOUNT_PROXY_TOKEN = env.SHARED_ACCOUNT_PROXY_TOKEN;
  assert.equal(upstream.mock.callCount(), 4);

  for (const [status, expected] of [[401, 401], [302, 502], [500, 502]]) {
    upstreamStatus = status;
    const response = await call();
    assert.equal(response.statusCode, expected);
    assert.equal(response.headers["set-cookie"], undefined);
    assert.equal(response.headers.location, undefined);
  }

  const liveAccount = {
    proxy: liveAccountProxy,
    headers: {
      host: "account.anytranslator.app", origin: "https://account.anytranslator.app",
      cookie: accountCookie, "x-vercel-forwarded-for": "2001:db8::12", "x-at-account-client-ip": "spoofed",
    },
    url: "/api/account-live?account_route=billing%2Fcheckout",
  };
  const liveCatalog = {
    proxy: liveCatalogProxy, method: "GET",
    url: "/api/account/billing/catalog?account_route=billing%2Fcatalog",
    headers: { host: "www.anytranslator.app", origin: "https://www.anytranslator.app", cookie: accountCookie },
  };
  assert.equal((await call(liveAccount)).statusCode, 404);
  assert.equal((await call(liveCatalog)).statusCode, 404);
  process.env.VERCEL_ENV = "production";
  upstreamStatus = 200;
  assert.equal((await call(liveAccount)).statusCode, 200);
  assert.equal(request.url, "https://cloudflare.anytranslator.app/v1/account/billing/checkout");
  assert.equal(request.headers["X-AT-Account-Proxy-Token"], env.SHARED_ACCOUNT_LIVE_PROXY_TOKEN);
  assert.equal(request.headers["X-AT-Account-Client-IP"], "2001:db8::12");
  assert.equal(request.headers.Cookie, accountCookie);
  assert.equal((await call({ ...liveAccount, headers: { ...liveAccount.headers, origin: "https://www.anytranslator.app" } })).statusCode, 403);
  const resend = { ...liveAccount, url: "/api/account/billing/app-link", body: Buffer.from('{"locale":"zh-tw"}') };
  assert.equal((await call(resend)).statusCode, 200);
  assert.equal(request.url, "https://cloudflare.anytranslator.app/v1/account/billing/app-link");
  assert.equal(request.body.toString(), '{"locale":"zh-tw"}');
  assert.equal(request.headers.Cookie, accountCookie);
  assert.equal((await call({ ...resend, method: "GET" })).statusCode, 405);
  assert.equal((await call({ ...resend, headers: { ...resend.headers, origin: undefined } })).statusCode, 403);
  for (const route of ["billing/guest-checkout", "email-access", "email-access/request"]) {
    const guest = { ...liveAccount, url: `/api/account/${route}`, headers: { ...liveAccount.headers, cookie: undefined } };
    const response = await call(guest);
    assert.equal(response.statusCode, 200);
    assert.equal(request.url, `https://cloudflare.anytranslator.app/v1/account/${route}`);
    assert.equal(request.headers.Cookie, undefined);
    assert.equal(response.headers["cache-control"], "private, no-store");
    assert.equal((await call({ ...guest, method: "GET" })).statusCode, 405);
    assert.equal((await call({ ...guest, headers: { ...guest.headers, origin: "https://www.anytranslator.app" } })).statusCode, 403);
  }
  const catalog = await call(liveCatalog);
  assert.equal(catalog.statusCode, 200);
  assert.deepEqual(catalog.body, { offers, guestCheckoutEnabled: true });
  assert.equal(request.url, "https://cloudflare.anytranslator.app/v1/account/billing/catalog");
  assert.equal(request.headers.Origin, "https://account.anytranslator.app");
  assert.equal(request.headers.Cookie, undefined);
  assert.equal(catalog.headers["set-cookie"], undefined);
  const publicCheckout = {
    ...liveCatalog, method: "POST", url: "/api/account/billing/guest-checkout",
    body: Buffer.from(JSON.stringify({ attemptId: "local-fixture", offer: offers[1], locale: "zh-tw" })),
    headers: {
      ...liveCatalog.headers, "x-vercel-forwarded-for": "2001:db8::13", "x-at-account-client-ip": "spoofed",
    },
  };
  const checkout = await call(publicCheckout);
  assert.equal(checkout.statusCode, 200);
  assert.deepEqual(checkout.body, { checkoutUrl: "https://checkout.creem.io/ch_fixture", checkoutId: "ch_fixture" });
  assert.equal(checkout.headers["cache-control"], "private, no-store");
  assert.equal(checkout.headers["set-cookie"], undefined);
  assert.equal(request.url, "https://cloudflare.anytranslator.app/v1/account/billing/guest-checkout");
  assert.equal(request.body.toString(), publicCheckout.body.toString());
  assert.deepEqual(request.headers, {
    Accept: "application/json", Origin: "https://account.anytranslator.app",
    "X-AT-Account-Proxy-Token": env.SHARED_ACCOUNT_LIVE_PROXY_TOKEN,
    "X-AT-Account-Client-IP": "2001:db8::13", "Content-Type": "application/json",
  });
  const rewrite = await call({ ...publicCheckout, url: "/api/account-catalog?account_route=billing%2Fguest-checkout" });
  assert.equal(rewrite.statusCode, 200);
  const guestResend = {
    ...publicCheckout,
    url: "/api/account/billing/guest-resend",
    body: Buffer.from('{"checkoutId":"ch_fixture"}'),
  };
  for (const options of [
    guestResend,
    { ...guestResend, url: "/api/account-catalog?account_route=billing%2Fguest-resend" },
    { ...liveAccount, url: guestResend.url, body: guestResend.body },
  ]) {
    const response = await call(options);
    assert.equal(response.statusCode, 202);
    assert.deepEqual(response.body, {});
    assert.equal(response.headers["set-cookie"], undefined);
    assert.equal(request.headers.Cookie, undefined);
    assert.equal(request.url, "https://cloudflare.anytranslator.app/v1/account/billing/guest-resend");
    assert.equal(request.body.toString(), guestResend.body.toString());
  }
  const accepted = upstream.mock.callCount();
  assert.equal((await call({ ...guestResend, method: "GET" })).statusCode, 405);
  assert.equal((await call({ ...guestResend, headers: { ...guestResend.headers, origin: undefined } })).statusCode, 403);
  assert.equal((await call({ ...guestResend, headers: { ...guestResend.headers, origin: "https://account.anytranslator.app" } })).statusCode, 403);
  for (const [options, status] of [
    [{ method: "GET" }, 405],
    [{ headers: { ...publicCheckout.headers, origin: undefined } }, 403],
    [{ headers: { ...publicCheckout.headers, origin: "https://account.anytranslator.app" } }, 403],
    [{ headers: { ...publicCheckout.headers, "sec-fetch-site": "cross-site" } }, 403],
    [{ headers: { ...publicCheckout.headers, "content-type": "text/plain" } }, 415],
    [{ body: Buffer.alloc(65_537) }, 413],
    ...["session", "billing/checkout", "billing/status", "billing/portal", "billing/app-link", "email-access", "email-access/request"]
      .map((route) => [{ url: `/api/account/${route}` }, 404]),
  ]) {
    assert.equal((await call({ ...publicCheckout, ...options })).statusCode, status);
  }
  assert.equal((await call({ ...liveCatalog, method: "POST" })).statusCode, 405);
  delete process.env.SHARED_ACCOUNT_LIVE_PROXY_TOKEN;
  assert.equal((await call(liveAccount)).statusCode, 404);
  assert.equal((await call(liveCatalog)).statusCode, 404);
  assert.equal(upstream.mock.callCount(), accepted);
});
