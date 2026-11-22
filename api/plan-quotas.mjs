import { readFileSync } from "node:fs";

const settingsUrl = "https://cloudflare.anytranslator.app/v1/settings";
const successCache = "public, s-maxage=300, stale-while-revalidate=3600";
const snapshot = JSON.parse(readFileSync(new URL("../src/data/main-pricing.json", import.meta.url), "utf8"));
const planIds = Object.keys(snapshot.plans);

function reply(res, status, body, cache = "private, no-store") {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", cache);
  res.end(JSON.stringify(body));
}

function readPlan(plan, id) {
  const { visible, audioMinutes, helperCount, quotaPeriod, periodDays, newInstallations } = plan ?? {};
  const voiceAgentMinutes = plan?.voiceAgentMinutes ?? audioMinutes;
  // A website visitor's installation would start now. Settings has already applied the scheduled policy.
  const translateCount = id === "free" && Math.floor(Date.now() / 1_000) >= Date.parse(newInstallations?.createdAtOrAfter) / 1_000
    ? newInstallations.translateCount : plan?.translateCount;
  if (typeof visible !== "boolean"
    || ![translateCount, audioMinutes, voiceAgentMinutes, helperCount].every((value) => Number.isFinite(value) && value >= -1)
    || !["week", "month"].includes(quotaPeriod)
    || ((id === "free" || periodDays !== undefined) && !(Number.isInteger(periodDays) && periodDays > 0))) {
    throw new Error("Invalid subscription quota");
  }

  return {
    visible, translateCount, audioMinutes, voiceAgentMinutes, helperCount, quotaPeriod,
    ...(periodDays !== undefined && { periodDays }),
  };
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return reply(res, 405, { error: "method_not_allowed" });
  }

  let plans;
  try {
    const response = await fetch(settingsUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Settings-Key": "anytranslator-settings-v1",
      },
      body: JSON.stringify({ surface: "app", locale: "en_US" }),
      redirect: "error",
      signal: AbortSignal.timeout(4_000),
    });
    if (!response.ok) throw new Error("Settings request failed");
    const { subscription } = await response.json();
    plans = Object.fromEntries(planIds.map((id) => [id, readPlan(subscription?.[id], id)]));
  } catch {
    return reply(res, 502, { error: "settings_unavailable" });
  }
  return reply(res, 200, { plans }, successCache);
}
