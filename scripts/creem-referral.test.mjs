import assert from "node:assert/strict";
import { test } from "node:test";
import { applyCreemReferral, captureCreemReferral } from "../src/lib/creem-referral.mjs";

const checkoutUrl = "https://checkout.creem.io/ch_test?locale=ja";

function mockWindow(context) {
  const stored = new Map();
  globalThis.window = {
    location: { search: "" },
    localStorage: {
      getItem: (key) => stored.get(key) ?? null,
      setItem: (key, value) => stored.set(key, value),
    },
  };
  context.after(() => { delete globalThis.window; });
}

function landWith(token) {
  window.location.search = `?lang=ja&${new URLSearchParams({ creem_ref: token })}`;
  captureCreemReferral();
}

test("captures the referral on landing and keeps it for checkout after navigation", (context) => {
  mockWindow(context);
  landWith("aB09._~-");
  window.location.search = "?term=month";
  captureCreemReferral();

  const checkout = new URL(checkoutUrl);
  applyCreemReferral(checkout, true);
  assert.equal(checkout.searchParams.get("creem_ref"), "aB09._~-");
  assert.equal(checkout.searchParams.get("locale"), "ja");
});

test("ignores invalid tokens without replacing a valid referral", (context) => {
  mockWindow(context);
  for (const token of ["", "a".repeat(2049), "a/b", "a+b", "a b", "a\n", "中文"]) {
    landWith(token);
    const checkout = new URL(checkoutUrl);
    applyCreemReferral(checkout, true);
    assert.equal(checkout.href, checkoutUrl);
  }

  landWith("a");
  landWith("bad/token");
  const checkout = new URL(checkoutUrl);
  applyCreemReferral(checkout, true);
  assert.equal(checkout.searchParams.get("creem_ref"), "a");
});

test("expires the referral at 90 days", (context) => {
  mockWindow(context);
  let now = Date.UTC(2026, 8, 1);
  context.mock.method(Date, "now", () => now);
  landWith("a");

  now += 90 * 24 * 60 * 60 * 1000 - 1;
  const fresh = new URL(checkoutUrl);
  applyCreemReferral(fresh, true);
  assert.equal(fresh.searchParams.get("creem_ref"), "a");

  now += 1;
  const expired = new URL(checkoutUrl);
  applyCreemReferral(expired, true);
  assert.equal(expired.href, checkoutUrl);
});

test("leaves checkout unchanged when storage access, reads, or writes throw", (context) => {
  mockWindow(context);
  const denied = () => { throw new Error("Storage blocked"); };
  for (const get of [denied, () => ({ getItem: denied, setItem: denied })]) {
    Object.defineProperty(window, "localStorage", { get, configurable: true });
    assert.doesNotThrow(() => landWith("a"));

    const checkout = new URL(checkoutUrl);
    assert.doesNotThrow(() => applyCreemReferral(checkout, true));
    assert.equal(checkout.href, checkoutUrl);
  }
});

test("does not attach a referral to the customer portal", (context) => {
  mockWindow(context);
  landWith("a");

  const portal = new URL("https://creem.io/portal/cust_test?locale=ja");
  applyCreemReferral(portal, false);
  assert.equal(portal.href, "https://creem.io/portal/cust_test?locale=ja");
});

test("the latest click replaces the saved and preexisting checkout referrals", (context) => {
  mockWindow(context);
  landWith("old");
  const latest = "a".repeat(2048);
  landWith(latest);

  const checkout = new URL(`${checkoutUrl}&creem_ref=old&creem_ref=other`);
  applyCreemReferral(checkout, true);
  assert.deepEqual(checkout.searchParams.getAll("creem_ref"), [latest]);
});
