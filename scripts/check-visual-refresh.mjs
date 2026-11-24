import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, realpathSync, statSync } from "node:fs";
import { sep } from "node:path";
import sharp from "sharp";
import { SITE_LOCALES } from "../src/lib/site-config.mjs";

const root = new URL("../", import.meta.url);
const read = (file) => readFileSync(new URL(file, root));
const source = (file) => read(file).toString("utf8");
const json = (file) => JSON.parse(source(file));
const sha = (bytes) => createHash("sha256").update(bytes).digest("hex");
const localeCodes = SITE_LOCALES.map(({ code }) => code).sort();
const unique = (values, message) =>
  assert.equal(new Set(values).size, values.length, message);
const asset = async (entry) => {
  assert.ok(
    entry.src.startsWith("/"),
    `Expected local public asset: ${entry.src}`,
  );
  const bytes = read(`public${entry.src}`);
  assert.equal(
    bytes.length,
    entry.bytes,
    `Asset byte count changed: ${entry.src}`,
  );
  assert.equal(sha(bytes), entry.sha256, `Asset hash changed: ${entry.src}`);
  const image = await sharp(bytes).metadata();
  assert.equal(image.width, entry.width, `Asset width mismatch: ${entry.src}`);
  assert.equal(
    image.height,
    entry.height,
    `Asset height mismatch: ${entry.src}`,
  );
};

const social = json("public/app-preview/social-v2/manifest.json");
assert.equal(social.nativeCapture, false);
assert.equal(social.artworkKind, "marketing-illustration");
assert.equal(social.images.length, 19);
assert.deepEqual(social.images.map(({ locale }) => locale).sort(), localeCodes);
assert.equal(
  sha(read(`public${social.inputs.logo}`)),
  social.inputs.logoSHA256,
  "Social logo input changed.",
);
for (const image of social.images) {
  assert.equal(image.nativeCapture, false);
  assert.equal(image.artworkKind, "marketing-illustration");
  assert.equal(image.src, `/app-preview/social-v2/${image.locale}.jpg`);
  assert.equal(image.source, `/app-preview/social-v2/${image.locale}.svg`);
  assert.equal(image.width, 1200);
  assert.equal(image.height, 630);
  assert.equal(
    sha(read(`public${image.source}`)),
    image.sourceSHA256,
    `Social SVG source changed: ${image.locale}`,
  );
  assert.ok(
    !/app-preview\/(?:screens|product|social)\//.test(
      source(`public${image.source}`),
    ),
    `Old App visual referenced in social source: ${image.locale}`,
  );
  await asset(image);
}
unique(
  social.images.map(({ sha256 }) => sha256),
  "Localized social cards should have distinct copy.",
);
const pages = source("src/pages/MarketingPages.tsx");
const context = json("src/data/screen-translation-example.json");
assert.deepEqual(Object.keys(context.copy).sort(), localeCodes, "Safari example locale coverage");
for (const [locale, copy] of Object.entries(context.copy)) {
  assert.match(copy.label, /^Safari · .+/, `Missing Safari context label: ${locale}`);
  assert.match(copy.alt, /AnyTranslator/u, `Missing localized translation context: ${locale}`);
}
assert.match(pages, /mk-card-translation-context/);
assert.doesNotMatch(pages, /screen-translation-driving|mk-example-source/);
const contextSrcSet = context.image.srcSet.split(", ");
for (const source of contextSrcSet) {
  const [src, width] = source.split(" ");
  const image = await sharp(read(`public${src}`)).metadata();
  assert.equal(image.width, Number.parseInt(width, 10), `Safari srcset width: ${src}`);
  assert.equal(image.height, Math.round(image.width * context.image.height / context.image.width),
    `Safari screenshot must retain the complete capture: ${src}`);
}
assert.ok(contextSrcSet.includes(`${context.image.src} ${context.image.width}w`));
const screen = source("src/components/AppScreen.tsx");
const seo = source("src/components/SEO.tsx");
const schema = source("src/components/JsonLd.tsx");
for (const [file, text] of [
  ["MarketingPages.tsx", pages],
  ["AppScreen.tsx", screen],
  ["SEO.tsx", seo],
  ["JsonLd.tsx", schema],
]) {
  assert.ok(
    !/app-preview\/(?:screens|product|social)\//.test(text),
    `${file} references obsolete product imagery.`,
  );
  assert.ok(
    !/FeatureArtwork|EditorialImage|\/editorial\//.test(text),
    `${file} references rejected concept imagery.`,
  );
}
assert.ok(screen.includes("native-product-screens.json"));
assert.ok(screen.includes("localized-ui-screens.json"));
assert.match(screen, /entry\.sourceNative === screen\.src/);
assert.match(screen, /data-image-source=\{localizedScreen \? "gpt-image-ui-edit" : "native-app-screenshot"\}/);
assert.ok(
  !/screens\.en|["']@\/data\/product-screens\.json|feature-artwork/.test(screen),
  "Do not substitute another language or a legacy image.",
);
assert.ok(
  !/\bscreenshot\s*:/.test(schema),
  "Do not claim pending captures in structured data.",
);
assert.ok(seo.includes("/app-preview/social-v2/"));

const publicAssets = new URL("public/", root);
const publicPath = `${realpathSync(publicAssets)}${sep}`;
const isRecord = (value) => value && typeof value === "object" && !Array.isArray(value);
const checkDemoAsset = (src, maxBytes, label) => {
  assert.ok(typeof src === "string" && /^\/(?!\/)[^\\?#\s]+$/.test(src), `Expected a local public path for ${label}: ${src}`);
  const file = new URL(`.${src}`, publicAssets);
  assert.ok(file.href.startsWith(publicAssets.href), `Asset must be inside public/ for ${label}: ${src}`);
  const info = statSync(file, { throwIfNoEntry: false });
  assert.ok(info?.isFile(), `Missing public file for ${label}: ${src}`);
  assert.ok(realpathSync(file).startsWith(publicPath), `Asset must resolve inside public/ for ${label}: ${src}`);
  assert.ok(info.size <= maxBytes, `${label} exceeds ${maxBytes} bytes (${info.size}): ${src}`);
};
const screenFeatureType = screen.match(/export type ScreenFeature\s*=\s*([^;]+);/);
assert.ok(screenFeatureType, "AppScreen must declare ScreenFeature.");
const screenFeatures = new Set([...screenFeatureType[1].matchAll(/"([^"]+)"/g)].map(([, feature]) => feature));
assert.ok(screenFeatures.size > 0, "ScreenFeature must contain feature names.");
const demoVideos = json("src/data/app-demo-videos.json");
assert.ok(isRecord(demoVideos), "App demo videos must be grouped by locale.");
let videoCount = 0;
for (const [locale, entries] of Object.entries(demoVideos)) {
  assert.ok(locale === "zh-tw" || locale === "en", `Unknown App demo video locale: ${locale}`);
  assert.ok(isRecord(entries), `App demo videos for ${locale} must be grouped by feature.`);
  for (const [feature, entry] of Object.entries(entries)) {
    const label = `${locale}/${feature}`;
    assert.ok(screenFeatures.has(feature), `Unknown App demo video feature: ${label}`);
    assert.ok(isRecord(entry), `Expected an App demo video entry for ${label}.`);
    assert.match(entry.src ?? "", /\.mp4$/, `Expected an MP4 file for ${label}.`);
    checkDemoAsset(entry.src, 3_000_000, `${label} video`);
    checkDemoAsset(entry.poster, 200_000, `${label} poster`);
    videoCount += 1;
  }
}
console.log(`App demo video checks passed: ${videoCount} configured entries.`);

await import("./check-localized-ui-images.mjs");
console.log(
  "Brand/source checks passed: 19 original localized brand cards, no active rejected or obsolete imagery. Native screenshot coverage is checked separately.",
);
