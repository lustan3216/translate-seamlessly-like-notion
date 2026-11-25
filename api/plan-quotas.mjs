import { readFileSync } from "node:fs";

const settingsUrl = "https://cloudflare.anytranslator.app/v1/settings";
const successCache = "public, s-maxage=300, stale-while-revalidate=3600";
const snapshot = JSON.parse(readFileSync(new URL("../src/data/main-pricing.json", import.meta.url), "utf8"));
const planIds = Object.keys(snapshot.plans);
const quotaKeys = new Set(["translateCount", "audioMinutes", "voiceAgentMinutes", "helperCount"]);

function reply(res, status, body, cache = "private, no-store") {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", cache);
  res.end(JSON.stringify(body));
}

function readPlan(plan, id) {
  const { visible, translateCount, audioMinutes, voiceAgentMinutes, helperCount, quotaPeriod, periodDays, features, groupLevel } = plan ?? {};
  if (typeof visible !== "boolean"
    || ![translateCount, audioMinutes, voiceAgentMinutes, helperCount].every((value) => Number.isFinite(value) && value >= -1)
    || !["week", "month"].includes(quotaPeriod)
    || ((id === "free" || periodDays !== undefined) && !(Number.isInteger(periodDays) && periodDays > 0))) {
    throw new Error("Invalid subscription quota");
  }

  return {
    visible, translateCount, audioMinutes, voiceAgentMinutes, helperCount, quotaPeriod,
    ...(periodDays !== undefined && { periodDays }),
    ...(Number.isSafeInteger(groupLevel) && groupLevel > 0 && { groupLevel }),
    ...(Array.isArray(features) && { features: features.flatMap((feature) => {
      const { id, quotaKey, maxPhotosPerBatch, maxLanguages } = feature ?? {};
      if (typeof id !== "string" || !/^[a-z][A-Za-z]{0,39}$/.test(id)) return [];
      return [{
        id,
        ...(quotaKeys.has(quotaKey) && { quotaKey }),
        ...(Number.isSafeInteger(maxPhotosPerBatch) && maxPhotosPerBatch > 0 && { maxPhotosPerBatch }),
        ...(Number.isSafeInteger(maxLanguages) && maxLanguages > 0 && { maxLanguages }),
      }];
    }) }),
  };
}

function readBillingOffers(offers) {
  return Object.fromEntries(Object.entries(offers).flatMap(([id, offer]) => {
    const { plan, period, productId } = offer ?? {};
    if (!["standard", "voice"].includes(plan) || !["weekly", "monthly", "yearly"].includes(period)
      || id !== `${plan}-${period}` || productId === "free" || !planIds.includes(productId)) return [];
    return [[id, { plan, period, productId }]];
  }));
}

export function readAffiliate(affiliate) {
  const { commissionPercent, commissionMonths, attributionDays, joinUrl } = affiliate ?? {};
  const integerInRange = (value, max) => Number.isInteger(value) && value >= 1 && value <= max;
  if (!integerInRange(commissionPercent, 100)
    || !integerInRange(commissionMonths, 120)
    || !integerInRange(attributionDays, 365)
    || typeof joinUrl !== "string" || !joinUrl.startsWith("https://affiliates.creem.io/join/")) {
    throw new Error("Invalid affiliate settings");
  }
  return { commissionPercent, commissionMonths, attributionDays, joinUrl };
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return reply(res, 405, { error: "method_not_allowed" });
  }

  let body;
  try {
    const response = await fetch(settingsUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Settings-Key": "anytranslator-settings-v1",
      },
      body: JSON.stringify({ surface: "web", locale: "en_US" }),
      redirect: "error",
      signal: AbortSignal.timeout(4_000),
    });
    if (response.status !== 200) throw new Error("Settings request failed");
    const { configVersion, subscription, affiliate, billingOffers } = await response.json();
    if (typeof configVersion !== "string" || !configVersion.trim()) throw new Error("Invalid settings version");
    body = {
      plans: Object.fromEntries(planIds.map((id) => [id, readPlan(subscription?.[id], id)])),
      affiliate: readAffiliate(affiliate),
      ...(billingOffers && typeof billingOffers === "object" && !Array.isArray(billingOffers)
        && { billingOffers: readBillingOffers(billingOffers) }),
    };
  } catch {
    return reply(res, 502, { error: "settings_unavailable" });
  }
  return reply(res, 200, body, successCache);
}
