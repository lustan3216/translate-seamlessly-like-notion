import assert from "node:assert/strict";
import { Readable } from "node:stream";
import { test } from "node:test";
import handler, { devAccountProxy, liveAccountProxy, liveCatalogProxy } from "./vercel-account-preview-proxy.mjs";

test("account sessions and public billing stay on their assigned origins", async (context) => {
  const env = {
    VERCEL_ENV: "preview",
    VERCEL_URL: "account-preview-abc.vercel.app",
    SHARED_ACCOUNT_PROXY_TOKEN: "server-token-12345678901234567890123456",
    SHARED_ACCOUNT_PREVIEW_WORKER_ORIGIN: "https://fixture-dev.et3216-c0d.workers.dev",
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
    if (new URL(url).pathname.endsWith("/billing/guest-status")) {
      return Response.json({ state: "delivered" }, { headers });
    }
    if (url.endsWith("/billing/cancel-pending-change") && upstreamStatus === 202) {
      return Response.json({ subscription: { pendingChange: { offerId: "standard-monthly", effectiveAt: null } },
        operationPending: true }, { status: 202, headers });
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
  assert.equal(request.url, `${env.SHARED_ACCOUNT_PREVIEW_WORKER_ORIGIN}/v1/account/passkeys/login/options`);
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

  const redemption = await call({
    url: "/api/account/email-access",
    body: Buffer.from(JSON.stringify({ token: "A".repeat(43) })),
  });
  assert.equal(redemption.statusCode, 200);
  assert.equal(request.url, `${env.SHARED_ACCOUNT_PREVIEW_WORKER_ORIGIN}/v1/account/email-access`);
  assert.deepEqual(redemption.headers["set-cookie"], [session, clear]);
  assert.equal(redemption.headers["cache-control"], "private, no-store");
  assert.equal(redemption.headers["referrer-policy"], "no-referrer");

  for (const [options, status] of [
    [{ headers: { host: "www.anytranslator.app", "x-forwarded-host": env.VERCEL_URL } }, 404],
    [{ headers: { origin: "https://other.vercel.app" } }, 403],
    [{ headers: { origin: undefined } }, 403],
    [{ headers: { "sec-fetch-site": "same-site" } }, 403],
    [{ url: "/api/account/%2e%2e/webhooks/creem-test" }, 404],
    [{ url: "/api/account-preview?account_route=session&account_route=delete" }, 404],
    [{ url: "/api/account/session?account_route=delete" }, 404],
    [{ url: "/api/account/pair/start" }, 404],
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

  delete process.env.SHARED_ACCOUNT_PREVIEW_WORKER_ORIGIN;
  for (const invalidOrigin of [
    undefined, "", "http://fixture-dev.et3216-c0d.workers.dev", "https://et3216-c0d.workers.dev",
    "https://nested.fixture-dev.et3216-c0d.workers.dev", "https://-fixture.et3216-c0d.workers.dev",
    "https://fixture-dev.et3216-c0d.workers.dev.example.invalid", "https://cloudflare.anytranslator.app",
    "https://user@fixture-dev.et3216-c0d.workers.dev",
    ...[":443", "/", "/account", "?", "#", "\n"].map((suffix) => `${env.SHARED_ACCOUNT_PREVIEW_WORKER_ORIGIN}${suffix}`),
  ]) {
    if (invalidOrigin !== undefined) process.env.SHARED_ACCOUNT_PREVIEW_WORKER_ORIGIN = invalidOrigin;
    const response = await call();
    assert.equal(response.statusCode, 503, JSON.stringify(invalidOrigin));
    assert.deepEqual(response.body, { error: "not_configured" });
  }
  process.env.SHARED_ACCOUNT_PREVIEW_WORKER_ORIGIN = env.SHARED_ACCOUNT_PREVIEW_WORKER_ORIGIN;
  assert.equal(upstream.mock.callCount(), 5);

  const guestOffer = Buffer.from(JSON.stringify({ attemptId: "local-fixture", offer: offers[1], locale: "zh-tw" }));
  for (const { route, body, status, payload, authenticated } of [
    { route: "billing/guest-checkout", body: guestOffer, status: 200,
      payload: { checkoutUrl: "https://checkout.creem.io/ch_fixture", checkoutId: "ch_fixture" } },
    { route: "billing/guest-resend", body: Buffer.from('{"checkoutId":"ch_fixture"}'), status: 202, payload: {} },
    { route: "billing/app-link", body: Buffer.from('{"locale":"zh-tw"}'), status: 200, payload: { account: {} }, authenticated: true },
  ]) {
    const options = {
      url: `/api/account-preview?account_route=${encodeURIComponent(route)}`,
      body,
      headers: { cookie: `deployment-cookie=never-forward; ${accountCookie}` },
    };
    const response = await call(options);
    assert.equal(response.statusCode, status);
    assert.deepEqual(response.body, payload);
    assert.equal(request.url, `${env.SHARED_ACCOUNT_PREVIEW_WORKER_ORIGIN}/v1/account/${route}`);
    assert.equal(request.headers.Origin, origin);
    assert.deepEqual(request.body, body);
    assert.equal(request.headers.Cookie, authenticated ? accountCookie : undefined);
    assert.deepEqual(response.headers["set-cookie"], authenticated ? [session, clear] : undefined);

    const accepted = upstream.mock.callCount();
    assert.equal((await call({ ...options, method: "GET" })).statusCode, 405);
    assert.equal((await call({ ...options, headers: { origin: undefined } })).statusCode, 403);
    assert.equal((await call({ ...options, headers: { origin: "https://other.vercel.app" } })).statusCode, 403);
    assert.equal((await call({ ...options, headers: { "sec-fetch-site": "cross-site" } })).statusCode, 403);
    assert.equal(upstream.mock.callCount(), accepted);
  }

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
    url: "/api/account-live?account_route=billing%2Fportal",
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
  assert.equal(request.url, "https://cloudflare.anytranslator.app/v1/account/billing/portal");
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
  assert.equal(request.headers["X-AT-Account-Proxy-Token"], env.SHARED_ACCOUNT_LIVE_PROXY_TOKEN);
  assert.equal(request.headers.Origin, "https://account.anytranslator.app");
  assert.equal(request.headers.Cookie, undefined);
  assert.equal(catalog.headers["set-cookie"], undefined);
  const publicCheckout = {
    ...liveCatalog, method: "POST", url: "/api/account/billing/guest-checkout",
    body: guestOffer,
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

  const directStatus = "/api/account/billing/guest-status";
  const statusQuery = "checkoutId=ch_fixture%2Btest";
  const statusRewrite = "account_route=billing%2Fguest-status";
  for (const { options, domain, environment, functionPath } of [
    { options: liveCatalog, domain: "https://cloudflare.anytranslator.app", environment: "production", functionPath: "/api/account-catalog" },
    { options: liveAccount, domain: "https://cloudflare.anytranslator.app", environment: "production", functionPath: "/api/account-live" },
    { options: { headers: { cookie: accountCookie } }, domain: env.SHARED_ACCOUNT_PREVIEW_WORKER_ORIGIN,
      environment: "preview", functionPath: "/api/account-preview" },
  ]) {
    process.env.VERCEL_ENV = environment;
    for (const url of [
      `${directStatus}?${statusQuery}`,
      `${directStatus}?${statusQuery}&${statusRewrite}`,
      `${functionPath}?${statusRewrite}&${statusQuery}`,
    ]) {
      const response = await call({ ...options, method: "GET", url, headers: { ...options.headers, origin: undefined } });
      assert.equal(response.statusCode, 200);
      assert.deepEqual(response.body, { state: "delivered" });
      assert.equal(response.headers["cache-control"], "private, no-store");
      assert.equal(response.headers["set-cookie"], undefined);
      assert.equal(request.url, `${domain}/v1/account/billing/guest-status?${statusQuery}`);
      assert.equal(request.method, "GET");
      assert.equal(request.body, undefined);
      assert.equal(request.headers.Cookie, undefined);
      assert.equal(request.headers.Origin, environment === "preview" ? origin : "https://account.anytranslator.app");
    }
    const attempted = upstream.mock.callCount();
    const url = `${directStatus}?${statusQuery}`;
    const wrongMethod = await call({ ...options, url, method: "POST" });
    assert.equal(wrongMethod.statusCode, 405);
    assert.equal(wrongMethod.headers.allow, "GET");
    assert.equal((await call({ ...options, url, method: "GET", headers: { ...options.headers, "sec-fetch-site": "cross-site" } })).statusCode, 403);
    for (const invalid of [
      directStatus,
      `${directStatus}?checkoutId=`,
      `${directStatus}?${statusQuery}&checkoutId=other`,
      `${directStatus}?${statusQuery}&other=unexpected`,
      `${directStatus}?${statusQuery}&account_route=billing%2Fstatus`,
      `${functionPath}?${statusRewrite}&${statusRewrite}&${statusQuery}`,
    ]) {
      assert.equal((await call({ ...options, method: "GET", url: invalid })).statusCode, 404, invalid);
    }
    assert.equal(upstream.mock.callCount(), attempted);
  }
  process.env.VERCEL_ENV = "production";

  const accountWrites = [
    ["checkout", { offer: offers[1], locale: "zh-tw" }],
    ["change-plan", { offer: offers[4] }],
    ["cancel-pending-change", {}],
    ["cancel", {}],
    ["resume", {}],
  ];
  for (const [operation, payload] of accountWrites) {
    const route = `billing/${operation}`;
    const url = `/api/account/${route}`;
    const body = Buffer.from(JSON.stringify(payload));
    const key = "01234567-89ab-4def-8901-23456789abcd";
    const requestKey = operation !== "checkout" ? key : undefined;
    assert.equal((await call({ ...publicCheckout, url, body })).statusCode, 404);
    for (const [envName, options, functionPath, backend] of [
      ["production", liveAccount, "/api/account-live", "https://cloudflare.anytranslator.app"],
      ["preview", { headers: { cookie: accountCookie } }, "/api/account-preview", env.SHARED_ACCOUNT_PREVIEW_WORKER_ORIGIN],
    ]) {
      process.env.VERCEL_ENV = envName;
      const scopedHeaders = { ...options.headers, cookie: `unrelated=discard; ${accountCookie}`, "idempotency-key": key };
      for (const incoming of [url, `${functionPath}?account_route=${encodeURIComponent(route)}`]) {
        const response = await call({ ...options, url: incoming, body, headers: scopedHeaders });
        assert.equal(response.statusCode, 200);
        assert.equal(response.headers["cache-control"], "private, no-store");
        assert.equal(request.url, `${backend}/v1/account/${route}`);
        assert.equal(request.headers.Cookie, accountCookie);
        assert.equal(request.headers["Idempotency-Key"], requestKey);
        assert.deepEqual(JSON.parse(request.body), payload);
      }
      const calls = upstream.mock.callCount();
      const get = await call({ ...options, url, method: "GET" });
      assert.equal(get.statusCode, 405);
      assert.equal(get.headers.allow, "POST");
      for (const origin of [undefined, "https://foreign.example"]) {
        assert.equal((await call({ ...options, url, body, headers: { ...scopedHeaders, origin } })).statusCode, 403);
      }
      assert.equal((await call({ ...options, url, body, headers: { ...scopedHeaders, "sec-fetch-site": "cross-site" } })).statusCode, 403);
      for (const cookie of [undefined, "unrelated=discard", "__Host-at_session=invalid", "__Host-at_flow=flow"]) {
        assert.equal((await call({ ...options, url, body, headers: { ...scopedHeaders, cookie } })).statusCode, 401);
      }
      if (requestKey) {
        for (const key of [undefined, "invalid", [requestKey, requestKey]]) {
          assert.equal((await call({ ...options, url, body, headers: { ...scopedHeaders, "idempotency-key": key } })).statusCode, 400);
        }
      }
      assert.equal(upstream.mock.callCount(), calls);
      upstreamStatus = 401;
      assert.equal((await call({ ...options, url, body, headers: scopedHeaders })).statusCode, 401);
      if (operation === "cancel-pending-change") {
        upstreamStatus = 202;
        const response = await call({ ...options, url, body, headers: scopedHeaders });
        assert.equal(response.statusCode, 202);
        assert.equal(response.body.operationPending, true);
        assert.equal(response.body.subscription.pendingChange.offerId, "standard-monthly");
        assert.equal(request.headers["Idempotency-Key"], key);
      }
      upstreamStatus = 200;
    }
    process.env.VERCEL_ENV = "production";
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
    ...["session", "billing/status", "billing/portal", "billing/app-link", "email-access", "email-access/request"]
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

test("the fixed Dev host uses the preview Worker and its account rules", async (context) => {
  const env = {
    VERCEL_ENV: "production",
    VERCEL_URL: "account-dev-fixture.vercel.app",
    SHARED_ACCOUNT_PROXY_TOKEN: "fixture-dev-proxy-token-12345678901234",
    SHARED_ACCOUNT_PREVIEW_WORKER_ORIGIN: "https://fixture-dev.et3216-c0d.workers.dev",
    SHARED_ACCOUNT_LIVE_PROXY_TOKEN: "fixture-live-proxy-token-1234567890123",
  };
  const original = Object.fromEntries(Object.keys(env).map((key) => [key, process.env[key]]));
  Object.assign(process.env, env);
  context.after(() => {
    for (const [key, old] of Object.entries(original)) {
      if (old === undefined) delete process.env[key];
      else process.env[key] = old;
    }
  });

  const host = "account-dev.anytranslator.app";
  const origin = `https://${host}`;
  const accountCookie = `__Host-at_session=${"d".repeat(43)}`;
  const session = `${accountCookie}; Max-Age=60; Path=/; HttpOnly; Secure; SameSite=Strict`;
  const upstream = context.mock.method(globalThis, "fetch", async () => Response.json({ account: {} }, {
    headers: [["set-cookie", session], ["set-cookie", "unrelated=discard"]],
  }));

  async function call({ url = "/api/account-dev?account_route=session", method = "GET", requestHost = host } = {}) {
    const req = Object.assign(Readable.from([Buffer.from("{}")]), {
      method, url,
      headers: {
        host: requestHost, origin, "sec-fetch-site": "same-origin", "content-type": "application/json",
        cookie: `unrelated=discard; ${accountCookie}`,
        "x-vercel-forwarded-for": "2001:db8::12", "x-at-account-client-ip": "spoofed",
      },
    });
    const headers = {};
    const res = { setHeader(name, value) { headers[name.toLowerCase()] = value; }, end() {} };
    await devAccountProxy(req, res);
    return { status: res.statusCode, headers };
  }

  const sessionResponse = await call();
  assert.equal(sessionResponse.status, 200);
  assert.deepEqual(sessionResponse.headers["set-cookie"], [session]);
  const [sessionUrl, sessionRequest] = upstream.mock.calls[0].arguments;
  assert.equal(sessionUrl, `${env.SHARED_ACCOUNT_PREVIEW_WORKER_ORIGIN}/v1/account/session`);
  assert.deepEqual(sessionRequest.headers, {
    Accept: "application/json", Origin: origin, "X-AT-Account-Proxy-Token": env.SHARED_ACCOUNT_PROXY_TOKEN,
    Cookie: accountCookie,
  });

  assert.equal((await call({ method: "POST", url: "/api/account/passkeys/login/options" })).status, 200);
  const [loginUrl, loginRequest] = upstream.mock.calls[1].arguments;
  assert.equal(loginUrl, `${env.SHARED_ACCOUNT_PREVIEW_WORKER_ORIGIN}/v1/account/passkeys/login/options`);
  assert.equal(loginRequest.body.toString(), "{}");
  assert.equal(loginRequest.headers["X-AT-Account-Client-IP"], undefined);

  assert.equal((await call({ requestHost: env.VERCEL_URL })).status, 404);
  process.env.VERCEL_ENV = "preview";
  assert.equal((await call()).status, 404);
  process.env.VERCEL_ENV = env.VERCEL_ENV;
  process.env.SHARED_ACCOUNT_PREVIEW_WORKER_ORIGIN = "https://cloudflare.anytranslator.app";
  assert.equal((await call()).status, 503);
  process.env.SHARED_ACCOUNT_PREVIEW_WORKER_ORIGIN = env.SHARED_ACCOUNT_PREVIEW_WORKER_ORIGIN;
  delete process.env.SHARED_ACCOUNT_PROXY_TOKEN;
  assert.equal((await call()).status, 404);
  assert.equal(upstream.mock.callCount(), 2);
});

test("email code access is POST-only on Dev, Preview, and live account hosts", async (context) => {
  const previewHost = "code-preview-fixture.vercel.app";
  const previewWorker = "https://code-fixture.et3216-c0d.workers.dev";
  const liveWorker = "https://cloudflare.anytranslator.app";
  const env = {
    VERCEL_ENV: "preview",
    VERCEL_URL: previewHost,
    SHARED_ACCOUNT_PROXY_TOKEN: "fixture-proxy-token-123456789012345",
    SHARED_ACCOUNT_PREVIEW_WORKER_ORIGIN: previewWorker,
    SHARED_ACCOUNT_LIVE_PROXY_TOKEN: "fixture-live-token-1234567890123456",
  };
  const original = Object.fromEntries(Object.keys(env).map((key) => [key, process.env[key]]));
  Object.assign(process.env, env);
  context.after(() => {
    for (const [key, old] of Object.entries(original)) {
      if (old === undefined) delete process.env[key];
      else process.env[key] = old;
    }
  });

  const visitorIp = "2001:db8::42";
  const accountCookie = `__Host-at_session=${"e".repeat(43)}`;
  const session = `${accountCookie}; Max-Age=60; Path=/; HttpOnly; Secure; SameSite=Strict`;
  const account = { id: "account-fixture" };
  const codes = {
    410: "creem_web_code_invalid",
    409: "creem_web_account_conflict",
  };
  let verifyStatus = 200;
  const upstream = context.mock.method(globalThis, "fetch", async (url) => url.endsWith("/request")
    ? Response.json({ accepted: true })
    : Response.json(verifyStatus === 200 ? { account } : { error: codes[verifyStatus] }, {
      status: verifyStatus,
      headers: [["set-cookie", session], ["set-cookie", "unrelated=discard"]],
    }));

  for (const [proxy, host, functionName, backend] of [
    [handler, previewHost, "account-preview", previewWorker],
    [devAccountProxy, "account-dev.anytranslator.app", "account-dev", previewWorker],
    [liveAccountProxy, "account.anytranslator.app", "account-live", liveWorker],
  ]) {
    process.env.VERCEL_ENV = proxy === handler ? "preview" : "production";
    const origin = `https://${host}`;
    for (const [action, payload] of [
      ["request", { email: "visitor@example.test", locale: "zh-tw" }],
      ["verify", { email: "visitor@example.test", code: "012345" }],
    ]) {
      const route = `email-access/${action}`;
      async function call({ url = `/api/account/${route}`, method = "POST", headers = {}, invoke = proxy } = {}) {
        const req = Object.assign(Readable.from([Buffer.from(JSON.stringify(payload))]), {
          method, url,
          headers: {
            host, origin, "sec-fetch-site": "same-origin", "content-type": "application/json",
            "x-vercel-forwarded-for": visitorIp, "x-at-account-client-ip": "192.0.2.42", ...headers,
          },
        });
        const res = {
          headers: {},
          setHeader(name, value) { this.headers[name.toLowerCase()] = value; },
          end(data) { this.body = JSON.parse(data); },
        };
        await invoke(req, res);
        return res;
      }

      for (const url of [undefined, `/api/${functionName}?account_route=${encodeURIComponent(route)}`]) {
        const response = await call({ url, headers: { cookie: "unrelated=discard" } });
        assert.equal(response.statusCode, 200, `${functionName}/${action}`);
        assert.deepEqual(response.body, action === "request" ? { accepted: true } : { account });
        assert.deepEqual(response.headers["set-cookie"], action === "verify" ? [session] : undefined);
        const [upstreamUrl, request] = upstream.mock.calls.at(-1).arguments;
        assert.equal(upstreamUrl, `${backend}/v1/account/${route}`);
        assert.equal(request.headers.Origin, origin);
        assert.equal(request.headers.Cookie, undefined);
        assert.equal(request.headers["X-AT-Account-Client-IP"], proxy === liveAccountProxy ? visitorIp : undefined);
        assert.deepEqual(JSON.parse(request.body), payload);
      }

      const beforeRejections = upstream.mock.callCount();
      const get = await call({ method: "GET" });
      assert.equal(get.statusCode, 405);
      assert.equal(get.headers.allow, "POST");
      assert.equal((await call({ headers: { origin: undefined } })).statusCode, 403);
      assert.equal((await call({ headers: { "sec-fetch-site": "cross-site" } })).statusCode, 403);
      assert.equal((await call({ headers: { host: "other.example.test" } })).statusCode, 404);
      if (proxy === liveAccountProxy) {
        assert.equal((await call({ invoke: liveCatalogProxy, headers: {
          host: "www.anytranslator.app", origin: "https://www.anytranslator.app",
        } })).statusCode, 404);
      }
      assert.equal(upstream.mock.callCount(), beforeRejections);

      if (action === "verify") {
        for (const status of [410, 409]) {
          verifyStatus = status;
          const response = await call({ headers: { cookie: `unrelated=discard; ${accountCookie}` } });
          assert.equal(response.statusCode, status);
          assert.deepEqual(response.body, { error: codes[status] });
          assert.equal(response.headers["set-cookie"], undefined);
          assert.equal(upstream.mock.calls.at(-1).arguments[1].headers.Cookie, accountCookie);
        }
        verifyStatus = 200;
      }
    }
  }
});
