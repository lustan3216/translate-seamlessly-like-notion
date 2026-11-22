import { createPrivateKey, sign } from "node:crypto";
import { readFile, rename, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ASC_ORIGIN = "https://api.appstoreconnect.apple.com";
const APP_ID = "6738693321";
const subscriptions = Object.freeze({
  "com.gpt.langpt.basic.1week": "6787902007",
  "com.gpt.langpt.basic.1month": "6787902429",
  "com.gpt.langpt.basic.1year": "6787902850",
  "com.gpt.langpt.voice.1week": "6788782988",
  "com.gpt.langpt.voice.1month": "6788782930",
  "com.gpt.langpt.voice.1year": "6788783049",
});

// ISO 3166-1 alpha-2/alpha-3 pairs from ICU. Apple returns XKS for Kosovo.
const countryPairs = `
  ADAND AEARE AFAFG AGATG AIAIA ALALB AMARM AOAGO AQATA ARARG ASASM ATAUT AUAUS AWABW AXALA AZAZE BABIH
  BBBRB BDBGD BEBEL BFBFA BGBGR BHBHR BIBDI BJBEN BLBLM BMBMU BNBRN BOBOL BQBES BRBRA BSBHS BTBTN BVBVT BWBWA
  BYBLR BZBLZ CACAN CCCCK CDCOD CFCAF CGCOG CHCHE CICIV CKCOK CLCHL CMCMR CNCHN COCOL CRCRI CUCUB
  CVCPV CWCUW CXCXR CYCYP CZCZE DEDEU DJDJI DKDNK DMDMA DODOM DZDZA ECECU EEEST EGEGY EHESH ERERI
  ESESP ETETH FIFIN FJFJI FKFLK FMFSM FOFRO FRFRA GAGAB GBGBR GDGRD GEGEO GFGUF GGGGY GHGHA GIGIB GLGRL GMGMB
  GNGIN GPGLP GQGNQ GRGRC GSSGS GTGTM GUGUM GWGNB GYGUY HKHKG HMHMD HNHND HRHRV HTHTI HUHUN IDIDN IEIRL
  ILISR IMIMN ININD IOIOT IQIRQ IRIRN ISISL ITITA JEJEY JMJAM JOJOR JPJPN KEKEN KGKGZ KHKHM KIKIR KMCOM KNKNA
  KPPRK KRKOR KWKWT KYCYM KZKAZ LALAO LBLBN LCLCA LILIE LKLKA LRLBR LSLSO LTLTU LULUX LVLVA LYLBY MAMAR MCMCO
  MDMDA MEMNE MFMAF MGMDG MHMHL MKMKD MLMLI MMMMR MNMNG MOMAC MPMNP MQMTQ MRMRT MSMSR MTMLT MUMUS MVMDV MWMWI
  MXMEX MYMYS MZMOZ NANAM NCNCL NENER NFNFK NGNGA NINIC NLNLD NONOR NPNPL NRNRU NUNIU NZNZL OMOMN PAPAN PEPER
  PFPYF PGPNG PHPHL PKPAK PLPOL PMSPM PNPCN PRPRI PSPSE PTPRT PWPLW PYPRY QAQAT REREU ROROU RSSRB RURUS RWRWA
  SASAU SBSLB SCSYC SDSDN SESWE SGSGP SHSHN SISVN SJSJM SKSVK SLSLE SMSMR SNSEN SOSOM SRSUR SSSSD STSTP SVSLV
  SXSXM SYSYR SZSWZ TCTCA TDTCD TFATF TGTGO THTHA TJTJK TKTKL TLTLS TMTKM TNTUN TOTON TRTUR TTTTO TVTUV
  TWTWN TZTZA UAUKR UGUGA UMUMI USUSA UYURY UZUZB VAVAT VCVCT VEVEN VGVGB VIVIR VNVNM VUVUT WFWLF WSWSM XKXKS
  YEYEM YTMYT ZAZAF ZMZMB ZWZWE
`;
const regionByTerritory = new Map(countryPairs.trim().split(/\s+/).map((pair) => [pair.slice(2), pair.slice(0, 2)]));

function makeClient({ keyId, issuerId, privateKey }, fetchImpl, timeoutMs) {
  if (!keyId || !privateKey) throw new Error("Missing App Store Connect credentials");
  const key = createPrivateKey(privateKey);
  const encode = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const header = encode({ alg: "ES256", kid: keyId, typ: "JWT" });
  const identity = issuerId ? { iss: issuerId } : { sub: "user" };

  return async function collection(path, query = {}) {
    const url = new URL(path, ASC_ORIGIN);
    for (const [name, value] of Object.entries(query)) url.searchParams.set(name, value);
    const time = Math.floor(Date.now() / 1000);
    // Apple's scope comparison ignores pagination fields. One scope per token
    // keeps tokens read-only and within Apple's size limit.
    const body = encode({
      ...identity,
      iat: time,
      exp: time + 120,
      aud: "appstoreconnect-v1",
      scope: [`GET ${path}${decodeURIComponent(url.search)}`],
    });
    const unsigned = `${header}.${body}`;
    const signature = sign("sha256", Buffer.from(unsigned), { key, dsaEncoding: "ieee-p1363" });
    const authorization = `Bearer ${unsigned}.${signature.toString("base64url")}`;
    url.searchParams.set("limit", "200");

    const rows = [];
    const included = [];
    const cursors = new Set();
    const signal = AbortSignal.timeout(timeoutMs);
    while (true) {
      const response = await fetchImpl(url, { method: "GET", headers: { authorization }, signal, redirect: "error" });
      if (!response.ok) throw new Error(`App Store Connect ${path} returned HTTP ${response.status}`);
      const page = await response.json();
      if (!Array.isArray(page.data)) throw new Error(`Invalid App Store Connect response for ${path}`);
      rows.push(...page.data);
      included.push(...(page.included ?? []));
      if (!page.links?.next) return { rows, included };

      const next = new URL(page.links.next);
      const cursor = next.searchParams.get("cursor");
      if (next.origin !== ASC_ORIGIN || next.pathname !== path || !cursor || cursors.has(cursor) || cursors.size >= 9) {
        throw new Error(`Invalid App Store Connect pagination for ${path}`);
      }
      cursors.add(cursor);
      url.searchParams.set("cursor", cursor);
    }
  };
}

function currentPrices({ rows, included }, now) {
  const points = new Map(included.filter((item) => item.type === "subscriptionPricePoints").map((item) => [item.id, item.attributes]));
  const currencies = new Map(included.filter((item) => item.type === "territories").map((item) => [item.id, item.attributes.currency]));
  const today = now.toISOString().slice(0, 10);
  const selected = new Map();
  for (const row of rows) {
    const { preserved, startDate, planType } = row.attributes;
    if (preserved !== false || planType !== "UPFRONT" || (startDate && startDate > today)) continue;
    const territory = row.relationships.territory.data.id;
    const point = points.get(row.relationships.subscriptionPricePoint.data.id);
    const amount = point?.customerPrice;
    const currency = currencies.get(territory);
    if (typeof amount !== "string" || !/^\d+(\.\d+)?$/.test(amount) || Number(amount) <= 0 || !/^[A-Z]{3}$/.test(currency ?? "")) {
      throw new Error(`Invalid ASC customer price for ${territory}`);
    }
    const date = startDate ?? "";
    const prior = selected.get(territory);
    if (prior?.date === date && (prior.amount !== amount || prior.currency !== currency)) {
      throw new Error(`Conflicting ASC customer prices for ${territory}`);
    }
    if (!prior || prior.date < date) selected.set(territory, { date, amount, currency });
  }
  return selected;
}

const listPrices = (collection, id, territory) => collection(`/v1/subscriptions/${id}/prices`, {
  include: "subscriptionPricePoint,territory",
  ...(territory ? { "filter[territory]": territory } : {}),
});

export async function fetchAscPrices(credentials, { now = new Date(), fetchImpl = fetch, timeoutMs = 12_000 } = {}) {
  const collection = makeClient(credentials, fetchImpl, timeoutMs);
  const plans = await Promise.all(Object.entries(subscriptions).map(async ([product, id]) => {
    const [prices, availability] = await Promise.all([
      listPrices(collection, id),
      collection(`/v1/subscriptionAvailabilities/${id}/availableTerritories`),
    ]);
    return { product, prices: currentPrices(prices, now), available: new Set(availability.rows.map(({ id: territory }) => territory)) };
  }));
  const app = await collection(`/v2/appAvailabilities/${APP_ID}/territoryAvailabilities`, { include: "territory" });
  const regions = {};
  for (const row of app.rows) {
    if (!row.attributes.available) continue;
    const territory = row.relationships.territory.data.id;
    const region = regionByTerritory.get(territory);
    if (!region) throw new Error(`Unknown ASC territory ${territory}`);
    const prices = {};
    let currency;
    for (const plan of plans) {
      if (!plan.available.has(territory)) continue;
      const quote = plan.prices.get(territory);
      if (!quote) continue;
      if (currency && currency !== quote.currency) throw new Error(`Conflicting ASC currencies for ${territory}`);
      currency = quote.currency;
      prices[plan.product] = quote.amount;
    }
    if (currency) regions[region] = { territory, currency, prices };
  }
  if (!Object.keys(regions).length) throw new Error("App Store Connect returned no published prices");
  return { fetchedAt: now.toISOString(), regions: Object.fromEntries(Object.entries(regions).sort(([a], [b]) => a.localeCompare(b, "en"))) };
}

export async function fetchAscRegionPrices(credentials, { regionInfo, now = new Date(), fetchImpl = fetch, timeoutMs = 6000 } = {}) {
  const { territory, currency, prices: availablePrices } = regionInfo ?? {};
  const region = regionByTerritory.get(territory);
  if (!region || !/^[A-Z]{3}$/.test(currency ?? "")) throw new Error("Invalid ASC storefront");
  const collection = makeClient(credentials, fetchImpl, timeoutMs);
  const entries = await Promise.all(Object.entries(subscriptions)
    .filter(([product]) => !availablePrices || Object.hasOwn(availablePrices, product))
    .map(async ([product, id]) => {
      const quote = currentPrices(await listPrices(collection, id, territory), now).get(territory);
      if (quote && quote.currency !== currency) throw new Error(`ASC currency changed for ${territory}`);
      return [product, quote?.amount];
    }));
  return { fetchedAt: now.toISOString(), region, territory, currency, prices: Object.fromEntries(entries.filter(([, amount]) => amount !== undefined)) };
}

async function main() {
  const output = fileURLToPath(new URL("../src/data/asc-prices.json", import.meta.url));
  const previous = await readFile(output, "utf8").then(JSON.parse).catch((error) => {
    if (error.code !== "ENOENT") throw error;
  });
  const scheduled = Object.values(previous?.scheduled?.regions ?? {});
  if (scheduled.some(({ effectiveAt }) => Date.now() < Date.parse(effectiveAt))) {
    throw new Error("Wait for scheduled App Store prices to take effect before replacing the snapshot.");
  }

  const keyId = process.env.ASC_KEY_ID || "Y9YW9L2DYD";
  const issuerId = process.env.ASC_ISSUER_ID ?? "b18a2a80-0cfc-4346-95ad-dc0c669e83c1";
  const keyFile = process.env.ASC_PRIVATE_KEY_FILE || `/Users/luyi/Github/MyProjects/translator/ios/fastlane/private_keys/AuthKey_${keyId}.p8`;
  const privateKey = await readFile(keyFile);
  const catalog = await fetchAscPrices({ keyId, issuerId, privateKey });
  const temp = `${output}.${process.pid}.tmp`;
  try {
    await writeFile(temp, `${JSON.stringify(catalog, null, 2)}\n`, { flag: "wx" });
    await rename(temp, output);
  } finally {
    await rm(temp, { force: true });
  }
  console.log(`Synced ${Object.keys(catalog.regions).length} App Store storefronts at ${catalog.fetchedAt}`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
