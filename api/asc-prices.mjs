import { readFileSync } from "node:fs";
import { fetchAscRegionPrices } from "../scripts/sync-asc-prices.mjs";
import { snapshotQuote } from "../src/data/asc-price-snapshot.mjs";

const snapshot = JSON.parse(readFileSync(new URL("../src/data/asc-prices.json", import.meta.url), "utf8"));
const fiveMinutes = 5 * 60 * 1000;
const cached = new Map();
const pending = new Map();

function reply(res, status, body, cache = "private, no-store") {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", cache);
  res.end(JSON.stringify(body));
}

function isCountryCode(code) {
  return typeof code === "string" && /^[A-Z]{2}$/.test(code) && code !== "XX";
}

function liveCredentials() {
  const { ASC_PRICE_KEY_ID: keyId, ASC_PRICE_ISSUER_ID: issuerId, ASC_PRICE_PRIVATE_KEY: privateKey } = process.env;
  return keyId && privateKey ? { keyId, issuerId, privateKey } : null;
}

async function loadPrices(region, credentials) {
  const regionInfo = snapshotQuote(snapshot, region);
  const fallback = { ...regionInfo, source: "snapshot" };
  const effectiveAt = snapshot.scheduled?.regions[region]?.effectiveAt;
  if (!credentials || (effectiveAt && Date.now() < Date.parse(effectiveAt))) return fallback;

  const previous = cached.get(region);
  if (previous && Date.now() - previous.checkedAt < fiveMinutes) return previous.data;
  if (!pending.has(region)) {
    const request = fetchAscRegionPrices(credentials, { region, regionInfo, timeoutMs: 5_000 })
      .then((data) => {
        // Apple can mark an old price as preserved before its replacement starts.
        if (!Object.keys(regionInfo.prices).every((product) => Object.hasOwn(data.prices, product))) {
          throw new Error("Incomplete App Store Connect price quote");
        }
        return { ...data, region, source: "app-store-connect" };
      })
      .catch(() => {
        console.warn("App Store Connect pricing refresh failed", { region });
        return previous?.data.fetchedAt >= fallback.fetchedAt ? { ...previous.data, source: "snapshot" } : fallback;
      })
      .then((data) => {
        cached.set(region, { data, checkedAt: Date.now() });
        return data;
      })
      .finally(() => pending.delete(region));
    pending.set(region, request);
  }
  return pending.get(region);
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return reply(res, 405, { error: "method_not_allowed" });
  }
  const regions = new URL(req.url, "http://localhost").searchParams.getAll("region");
  if (regions.length === 0) {
    const country = req.headers["x-vercel-ip-country"];
    return reply(res, 200, { region: isCountryCode(country) ? country : null });
  }
  const [region] = regions;
  if (regions.length !== 1 || !isCountryCode(region) || !Object.hasOwn(snapshot.regions, region)) {
    return reply(res, 400, { error: "unknown_storefront" });
  }

  const data = await loadPrices(region, liveCredentials());
  return reply(res, 200, data, data.source === "app-store-connect"
    ? "public, max-age=0, s-maxage=300, stale-while-revalidate=60"
    : "public, max-age=0, s-maxage=60");
}
