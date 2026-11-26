import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { loadConfigFromFile } from "vite";

test("local account preview proxies only anonymous GET requests for public plan quotas", async () => {
  // Loading the configuration does not start a server or parse the TLS files.
  const fixtureFile = fileURLToPath(import.meta.url);
  Object.assign(process.env, {
    VITE_SHARED_ACCOUNT_PREVIEW: "1",
    VITE_SHARED_ACCOUNT_LIVE: "0",
    ACCOUNT_WEB_ORIGIN: "https://localhost:8443",
    SHARED_ACCOUNT_API_TARGET: "http://127.0.0.1:8444",
    SHARED_ACCOUNT_PROXY_TOKEN: "local-fixture-token-without-credentials",
    SHARED_ACCOUNT_PREVIEW_TLS_CERT: fixtureFile,
    SHARED_ACCOUNT_PREVIEW_TLS_KEY: fixtureFile,
  });

  const key = "^/api/plan-quotas$";
  const { config } = await loadConfigFromFile({ command: "serve", mode: "account-preview", isPreview: true });
  const rule = config.preview.proxy[key];
  assert.equal(rule.target, "https://www.anytranslator.app");
  assert.equal(rule.changeOrigin, true);
  assert.equal(rule.followRedirects, false);
  assert.ok(new RegExp(key).test("/api/plan-quotas"));
  assert.doesNotMatch("/api/plan-quotas?foo=bar", new RegExp(key));
  assert.doesNotMatch("/api/plan-quotas/anything", new RegExp(key));
  const request = { method: "GET", headers: {
    cookie: "session=fixture", authorization: "Bearer sample", "x-at-account-proxy-token": "sample",
    "x-api-key": "sample", expect: "100-continue", origin: "https://localhost:8443",
  } };
  assert.equal(rule.bypass(request), undefined);
  assert.deepEqual(request.headers, { accept: "application/json" });
  assert.equal(rule.bypass({ method: "POST", headers: {} }), false);
  assert.equal(rule.bypass({ method: "GET", headers: { "content-length": "1" } }), false);
  assert.equal(rule.bypass({ method: "GET", headers: { "transfer-encoding": "chunked" } }), false);

  const proxy = new EventEmitter();
  rule.configure(proxy);
  const response = { headers: {
    "set-cookie": ["session=fixture"], location: "https://example.invalid", "content-type": "application/json",
  } };
  proxy.emit("proxyRes", response);
  assert.deepEqual(response.headers, { "content-type": "application/json" });

  // The same mode's Vercel build path does not add a local proxy.
  for (const mode of ["account-preview", "production"]) {
    const build = await loadConfigFromFile({ command: "build", mode });
    assert.equal(build.config.preview?.proxy?.[key], undefined);
  }
  process.env.ACCOUNT_WEB_ORIGIN = "http://localhost:8080";
  const development = await loadConfigFromFile({ command: "serve", mode: "development" });
  assert.equal(development.config.server.proxy[key], undefined);
});
