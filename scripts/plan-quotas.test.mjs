import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import handler from "../api/plan-quotas.mjs";

const snapshot = JSON.parse(readFileSync(new URL("../src/data/main-pricing.json", import.meta.url), "utf8"));
const paidId = "com.gpt.langpt.basic.1month";

async function request(method = "GET") {
  const headers = new Headers();
  const res = {
    setHeader: (name, value) => headers.set(name, value),
    end: (body) => { res.body = JSON.parse(body); },
  };
  await handler({ method }, res);
  return { status: res.statusCode, headers, body: res.body };
}

function assertUnavailable({ status, headers, body }) {
  assert.equal(status, 502);
  assert.equal(headers.get("cache-control"), "private, no-store");
  assert.deepEqual(body, { error: "settings_unavailable" });
}

test("requests public settings and returns only the whitelisted live plan quotas", async ({ mock }) => {
  const subscription = structuredClone(snapshot.plans);
  const expected = structuredClone(subscription);
  Object.assign(subscription.free, {
    translateCount: 25,
    newInstallations: { createdAtOrAfter: "2026-11-01T00:00:00+08:00", translateCount: 15 },
    scheduledPolicy: { effectiveAt: "2026-12-07T00:00:00+03:00" },
  });
  Object.assign(subscription[paidId], { audioMinutes: 730.5, visible: false, tier: "basic" });
  delete subscription[paidId].voiceAgentMinutes;
  subscription.unrelated = { ...subscription[paidId] };
  Object.assign(expected[paidId], { audioMinutes: 730.5, voiceAgentMinutes: 730.5, visible: false });
  expected.free.translateCount = 15;
  mock.method(Date, "now", () => Date.parse("2026-11-22T00:00:00Z"));
  const fetch = mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(url, "https://cloudflare.anytranslator.app/v1/settings");
    assert.equal(options.method, "POST");
    assert.equal(options.headers["X-Settings-Key"], "anytranslator-settings-v1");
    assert.equal(options.headers["Content-Type"], "application/json");
    assert.deepEqual(JSON.parse(options.body), { surface: "app", locale: "en_US" });
    assert.ok(options.signal instanceof AbortSignal);
    return Response.json({ subscription, configVersion: "internal", uiInformation: { hidden: true } });
  });

  const { status, headers, body } = await request();
  assert.equal(status, 200);
  assert.equal(headers.get("cache-control"), "public, s-maxage=300, stale-while-revalidate=3600");
  assert.equal(headers.get("content-type"), "application/json; charset=utf-8");
  assert.deepEqual(body, { plans: expected });
  assert.equal(fetch.mock.callCount(), 1);
});

test("keeps the base count before the new-installation cutoff and supports the activated monthly policy", async ({ mock }) => {
  const subscription = structuredClone(snapshot.plans);
  Object.assign(subscription.free, {
    translateCount: 25,
    newInstallations: { createdAtOrAfter: "2026-11-01T00:00:00+08:00", translateCount: 15 },
  });
  let now = Date.parse("2026-10-31T15:59:59Z");
  mock.method(Date, "now", () => now);
  mock.method(globalThis, "fetch", async () => Response.json({ subscription }));
  let result = await request();
  assert.equal(result.status, 200);
  assert.equal(result.body.plans.free.translateCount, 25);

  now = Date.parse("2026-10-31T16:00:00Z");
  result = await request();
  assert.equal(result.status, 200);
  assert.equal(result.body.plans.free.translateCount, 15);

  now = Date.parse("2026-12-07T00:00:00+03:00");
  delete subscription.free.newInstallations;
  Object.assign(subscription.free, { quotaPeriod: "month", periodDays: 30, voiceAgentMinutes: 5 });
  result = await request();
  assert.equal(result.status, 200);
  assert.deepEqual(result.body.plans.free, subscription.free);
});

test("returns 502 for unsuccessful or malformed settings", async ({ mock }) => {
  const invalid = structuredClone(snapshot.plans);
  invalid[paidId].audioMinutes = { unrelated: true };
  for (const response of [
    Response.json({ internal: "private" }, { status: 503 }),
    new Response("not JSON"),
    Response.json({ subscription: { free: snapshot.plans.free } }),
    Response.json({ subscription: invalid }),
  ]) {
    mock.method(globalThis, "fetch", async () => response);
    assertUnavailable(await request());
    mock.restoreAll();
  }
});

test("returns 502 when reading settings exceeds the four-second deadline", async ({ mock }) => {
  const controller = new AbortController();
  const timeout = mock.method(AbortSignal, "timeout", (delay) => {
    assert.equal(delay, 4_000);
    return controller.signal;
  });
  mock.method(globalThis, "fetch", async (_url, { signal }) => ({
    ok: true,
    json: () => new Promise((_resolve, reject) => {
      signal.addEventListener("abort", () => reject(signal.reason), { once: true });
      controller.abort(new DOMException("Deadline exceeded", "TimeoutError"));
    }),
  }));

  assertUnavailable(await request());
  assert.equal(timeout.mock.callCount(), 1);
});

test("rejects non-GET requests without reaching settings", async ({ mock }) => {
  const fetch = mock.method(globalThis, "fetch");
  const { status, headers } = await request("POST");
  assert.equal(status, 405);
  assert.equal(headers.get("allow"), "GET");
  assert.equal(fetch.mock.callCount(), 0);
});
