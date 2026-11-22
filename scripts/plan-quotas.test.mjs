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

test("requests web settings and returns only the whitelisted live plan quotas", async ({ mock }) => {
  const expected = structuredClone(snapshot.plans);
  Object.assign(expected.free, {
    quotaPeriod: "month", periodDays: 30, translateCount: 50, audioMinutes: 5, voiceAgentMinutes: 3,
  });
  Object.assign(expected[paidId], { audioMinutes: 730.5, visible: false });
  const subscription = structuredClone(expected);
  Object.assign(subscription.free, {
    newInstallations: { createdAtOrAfter: "2026-11-01T00:00:00+08:00", translateCount: 15 },
    newInstallationPlan: { createdAtOrAfter: "2026-11-22T10:30:00Z", translateCount: 75 },
    scheduledPolicy: { effectiveAt: "2026-12-07T00:00:00+03:00" },
  });
  subscription[paidId].tier = "basic";
  subscription.unrelated = { ...subscription[paidId] };
  mock.method(Date, "now", () => Date.parse("2026-11-22T11:00:00Z"));
  const fetch = mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(url, "https://cloudflare.anytranslator.app/v1/settings");
    assert.equal(options.method, "POST");
    assert.equal(options.headers["X-Settings-Key"], "anytranslator-settings-v1");
    assert.equal(options.headers["Content-Type"], "application/json");
    assert.deepEqual(JSON.parse(options.body), { surface: "web", locale: "en_US" });
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

test("returns 502 without requesting app settings when web settings return 400", async ({ mock }) => {
  const fetch = mock.method(globalThis, "fetch", async () =>
    Response.json({ error: "invalid surface" }, { status: 400 }));
  assertUnavailable(await request());
  assert.equal(fetch.mock.callCount(), 1);
  assert.deepEqual(JSON.parse(fetch.mock.calls[0].arguments[1].body), { surface: "web", locale: "en_US" });
});

test("returns 502 for unsuccessful or malformed settings", async ({ mock }) => {
  const configVersion = "v101";
  const invalid = structuredClone(snapshot.plans);
  invalid[paidId].audioMinutes = { unrelated: true };
  const missingVoiceMinutes = structuredClone(snapshot.plans);
  delete missingVoiceMinutes.free.voiceAgentMinutes;
  for (const response of [
    Response.json({ internal: "private" }, { status: 503 }),
    Response.json({ configVersion, subscription: snapshot.plans }, { status: 201 }),
    new Response("not JSON"),
    Response.json({ subscription: snapshot.plans }),
    Response.json({ configVersion, subscription: { free: snapshot.plans.free } }),
    Response.json({ configVersion, subscription: invalid }),
    Response.json({ configVersion, subscription: missingVoiceMinutes }),
  ]) {
    mock.method(globalThis, "fetch", async () => response);
    assertUnavailable(await request());
    mock.restoreAll();
  }
});

test("returns 502 when reading settings exceeds the four-second deadline", async ({ mock }) => {
  const controller = new AbortController();
  const timeout = mock.method(AbortSignal, "timeout", () => controller.signal);
  const json = mock.fn((signal) => new Promise((_resolve, reject) => {
    signal.addEventListener("abort", () => reject(signal.reason), { once: true });
    controller.abort(new DOMException("Deadline exceeded", "TimeoutError"));
  }));
  mock.method(globalThis, "fetch", async (_url, { signal }) => ({
    status: 200,
    json: () => json(signal),
  }));

  assertUnavailable(await request());
  assert.equal(timeout.mock.callCount(), 1);
  assert.deepEqual(timeout.mock.calls[0].arguments, [4_000]);
  assert.equal(json.mock.callCount(), 1);
});

test("rejects non-GET requests without reaching settings", async ({ mock }) => {
  const fetch = mock.method(globalThis, "fetch");
  const { status, headers } = await request("POST");
  assert.equal(status, 405);
  assert.equal(headers.get("allow"), "GET");
  assert.equal(fetch.mock.callCount(), 0);
});
