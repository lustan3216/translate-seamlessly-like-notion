import assert from "node:assert/strict";
import { test } from "node:test";
import { appNextCharge, planChangeTiming } from "../src/pages/account-subscription-policy.ts";
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

const now = Date.parse("2026-11-26T12:00:00Z");
const currentOffer = { id: "voice-monthly", amount: 1999, currency: "USD" };
const targetOffer = { id: "standard-yearly", amount: 7999, currency: "USD" };
const offers = [currentOffer, targetOffer];
const active = {
  state: "active",
  offerId: currentOffer.id,
  periodEndsAt: "2026-12-01T12:00:00Z",
  expiresAt: "2026-12-05T12:00:00Z",
  cancelAtPeriodEnd: false,
};
const pendingChange = { offerId: targetOffer.id, effectiveAt: "2026-12-02T12:00:00Z" };

test("the App shows the current renewal date and quote, or both from the scheduled change", () => {
  assert.deepEqual(appNextCharge(active, offers, now), {
    date: Date.parse(active.periodEndsAt), offer: currentOffer,
  });
  assert.deepEqual(appNextCharge({ ...active, pendingChange }, offers, now), {
    date: Date.parse(pendingChange.effectiveAt), offer: targetOffer,
  });
  assert.deepEqual(appNextCharge({ ...active, state: "grace", pendingChange }, offers, now), {
    date: Date.parse(pendingChange.effectiveAt), offer: targetOffer,
  });
});

test("the App hides the next charge when renewal has stopped or the date or quote is unknown", () => {
  for (const state of ["scheduled_cancel", "expired"]) {
    assert.equal(appNextCharge({ ...active, state, pendingChange }, offers, now), undefined, state);
  }
  assert.equal(appNextCharge({ ...active, cancelAtPeriodEnd: true }, offers, now), undefined);
  assert.equal(appNextCharge({ ...active, state: "grace", periodEndsAt: "2026-11-25T12:00:00Z" }, offers, now), undefined);
  assert.equal(appNextCharge(active, [], now), undefined);
  assert.equal(appNextCharge(null, offers, now), undefined);
  assert.equal(appNextCharge({ ...active, pendingChange }, [currentOffer], now), undefined);
  for (const effectiveAt of [null, "invalid", new Date(now).toISOString()]) {
    assert.equal(appNextCharge({ ...active, pendingChange: { ...pendingChange, effectiveAt } }, offers, now), undefined);
  }
});

test("all 19 account subscription translations preserve date, amount, plan and quota placeholders", () => {
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
  for (const [locale, copy] of Object.entries(subscriptionCopy)) {
    compare(copy, subscriptionCopy.en, locale);
    assert.deepEqual(extract(copy.nextCharge), ["{amount}", "{date}"], `${locale}.nextCharge`);
  }
});
