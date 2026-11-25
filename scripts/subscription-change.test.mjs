import assert from "node:assert/strict";
import { test } from "node:test";
import { planChangeTiming } from "../src/pages/account-subscription-policy.ts";
import { subscriptionCopy } from "../src/translations/marketing/shared-account-subscription.ts";
import { SITE_LOCALES } from "../src/lib/site-config.mjs";

test("compares App Store group level first and the paid period only between equal levels", () => {
  const current = { groupLevel: 4, period: "monthly" };
  assert.equal(planChangeTiming(current, { groupLevel: 3, period: "yearly" }), "immediate", "higher level");
  assert.equal(planChangeTiming(current, { groupLevel: 5, period: "monthly" }), "deferred", "lower level");
  assert.equal(planChangeTiming(current, { groupLevel: 4, period: "monthly" }), "immediate", "same level and period");
  assert.equal(planChangeTiming(current, { groupLevel: 4, period: "yearly" }), "deferred", "same level, different period");
});

test("enables no change timing from an invalid or missing group level or billing period", () => {
  const valid = { groupLevel: 4, period: "monthly" };
  for (const invalid of [
    { period: "monthly" }, { groupLevel: 0, period: "monthly" },
    { groupLevel: 1.5, period: "monthly" }, { groupLevel: 3 },
  ]) {
    assert.equal(planChangeTiming(valid, invalid), undefined);
    assert.equal(planChangeTiming(invalid, valid), undefined);
  }
});

test("all 19 account subscription translations preserve date, plan and quota placeholders", () => {
  const extract = (value) => [...value.matchAll(/\{\w+\}/g)].map(([match]) => match).sort();
  function compare(actual, english, label) {
    if (typeof english === "string") {
      assert.ok(typeof actual === "string" && actual.trim(), label);
      assert.deepEqual(extract(actual), extract(english), label);
    } else {
      assert.deepEqual(Object.keys(actual).sort(), Object.keys(english).sort(), label);
      for (const [key, value] of Object.entries(english)) compare(actual[key], value, `${label}.${key}`);
    }
  }
  assert.deepEqual(Object.keys(subscriptionCopy).sort(), SITE_LOCALES.map(({ code }) => code).sort());
  for (const [locale, copy] of Object.entries(subscriptionCopy)) compare(copy, subscriptionCopy.en, locale);
});
