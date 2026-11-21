import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { SITE_LOCALES, SITE_ROUTES } from "../src/lib/site-config.mjs";
import { checkMainContent } from "./check-main-content.mjs";
import {
  features,
  cases,
  articles,
  marketingRoutes,
  relatedFeatures,
} from "../src/data/marketing-content.mjs";

const read = (file) =>
  readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
const json = (file) => JSON.parse(read(file));
const localeCodes = SITE_LOCALES.map(({ code }) => code).sort();
assert.equal(localeCodes.length, 19);

// These labels are valid native words shared with English, rather than fallback sentences.
const sharedLabels = {
  "nav.blog": [
    "zh-tw",
    "id",
    "vi",
    "fr",
    "de",
    "es",
    "it",
    "pt-br",
    "da",
    "nl",
  ],
  "nav.menu": ["id", "fr", "it", "pt-br", "da", "nl"],
  "contact.message": ["fr"],
  "contact.feedback": ["de", "da", "nl"],
  "blog.guide": ["fr"],
  "footer.product": ["nl"],
};
const brandLabels = new Set(["hero.note", "feature.agent", "pricing.pro"]);
function translations(prefix) {
  const copy = {};
  for (const group of ["base", "asia", "europe-a", "europe-b"]) {
    const part = json(`src/translations/marketing/${prefix}${group}.json`);
    for (const [locale, values] of Object.entries(part)) {
      assert.ok(
        !Object.hasOwn(copy, locale),
        `Duplicate ${prefix} locale: ${locale}`,
      );
      copy[locale] = values;
    }
  }
  assert.deepEqual(
    Object.keys(copy).sort(),
    localeCodes,
    `Locale coverage: ${prefix || "marketing"}`,
  );
  const keys = Object.keys(copy.en).sort();
  for (const [locale, values] of Object.entries(copy)) {
    assert.deepEqual(
      Object.keys(values).sort(),
      keys,
      `Key coverage: ${prefix}${locale}`,
    );
    for (const [key, value] of Object.entries(values)) {
      assert.equal(typeof value, "string", `${locale}: ${key}`);
      assert.ok(
        value.trim() && value !== key,
        `Missing copy: ${locale}: ${key}`,
      );
      if (locale !== "en" && value === copy.en[key]) {
        assert.ok(
          !prefix &&
            (brandLabels.has(key) || sharedLabels[key]?.includes(locale)),
          `English fallback: ${prefix}${locale}: ${key}`,
        );
      }
    }
  }
  return copy;
}
const marketing = translations("");
const articleCopy = translations("articles-");
const featureCopy = Object.assign({}, ...["base", "asia", "europe-a", "europe-b"].map((group) =>
  json(`src/translations/marketing/feature-details-${group}.json`)));
assert.deepEqual(Object.keys(featureCopy).sort(), localeCodes, "Feature detail locale coverage");
function leaves(value, path = "") {
  if (typeof value === "string") return [[path, value]];
  return Object.entries(value).flatMap(([key, child]) => leaves(child, `${path}.${key}`));
}
const detailKeys = leaves(featureCopy.en).map(([key]) => key).sort();
for (const [locale, copy] of Object.entries(featureCopy)) {
  assert.deepEqual(leaves(copy).map(([key]) => key).sort(), detailKeys, `Feature structure: ${locale}`);
  for (const [key, value] of leaves(copy)) {
    assert.ok(value.trim(), `Empty feature detail: ${locale}${key}`);
    assert.ok(locale === "en" || value !== leaves(featureCopy.en).find(([path]) => path === key)?.[1],
      `English feature fallback: ${locale}${key}`);
  }
  assert.deepEqual(Object.keys(copy.features).sort(), features.map(({ id }) => id).sort());
  for (const [id, feature] of Object.entries(copy.features)) {
    assert.equal(feature.steps.length, 3, `Three feature-specific steps: ${locale}/${id}`);
    assert.equal(new Set(feature.steps).size, 3, `Repeated steps: ${locale}/${id}`);
    assert.notEqual(feature.body, feature.summary, `Detail must expand the summary: ${locale}/${id}`);
  }
  for (const item of cases) assert.equal(copy.workflows[item.id].length, item.tools.length,
    `Contextual case workflow: ${locale}/${item.id}`);
}
for (const locale of ["en", "zh-tw"]) {
  const steps = featureCopy[locale].features.document.steps.join(" ");
  assert.doesNotMatch(steps, /speak|listen|聆聽|說話|開啟麥克風/i,
    `Document workflow must describe scanning rather than voice: ${locale}`);
  assert.match(steps, /(?:10|\bten\b)/i, `Document batch limit: ${locale}`);
}

const pricing = json("src/translations/marketing/pricing.json");
assert.deepEqual(
  Object.keys(pricing).sort(),
  localeCodes,
  "Pricing locale coverage",
);
const pricingKeys = Object.keys(pricing.en).sort();
for (const key of ["perYear", "regionUnavailable", "priceUnavailable", "lastChecked", "subscribeStandard", "subscribeVoice", "subscribeInApp"]) {
  assert.ok(pricingKeys.includes(key), `Missing pricing label: ${key}`);
}
for (const [locale, values] of Object.entries(pricing)) {
  assert.deepEqual(
    Object.keys(values).sort(),
    pricingKeys,
    `Pricing key coverage: ${locale}`,
  );
  for (const [key, value] of Object.entries(values)) {
    assert.equal(typeof value, "string", `Pricing ${locale}: ${key}`);
    assert.ok(
      value.trim() && value !== key,
      `Missing pricing copy: ${locale}: ${key}`,
    );
    if (locale !== "en" && value === pricing.en[key]) {
      assert.ok(
        (key === "minutes" && value === "min") ||
          (locale === "nl" && key === "perWeek"),
        `English pricing fallback: ${locale}: ${key}`,
      );
    }
  }
}
const landingSource = read("src/translations/landing.ts");
const landing = JSON.parse(
  landingSource.slice(
    landingSource.indexOf("= ") + 2,
    landingSource.lastIndexOf(";"),
  ),
);
const unique = (items, label) =>
  assert.equal(new Set(items).size, items.length, `Duplicate ${label}`);
unique(
  features.map(({ id }) => id),
  "feature ID",
);
unique(
  cases.map(({ id }) => id),
  "case ID",
);
unique(
  articles.map(({ id }) => id),
  "article ID",
);
unique(
  articles.map(({ slug }) => slug),
  "article slug",
);
unique(marketingRoutes, "marketing route");
unique(SITE_ROUTES, "site route");
for (const route of marketingRoutes.filter((route) => route !== "/features/agent"))
  assert.ok(SITE_ROUTES.includes(route), `Missing prerender route: ${route}`);

for (const { code } of SITE_LOCALES) {
  for (const feature of features) {
    assert.ok(marketingRoutes.includes(`/features/${feature.id}`));
    assert.ok(
      marketing[code][`feature.${feature.id}`]?.trim(),
      `Missing feature copy: ${code}: ${feature.id}`,
    );
    for (const suffix of ["Title", "Body"])
      assert.ok(
        landing[code]?.[`landing.${feature.id}${suffix}`]?.trim(),
        `Missing feature detail: ${code}: ${feature.id}${suffix}`,
      );
  }
  for (const item of cases) {
    assert.ok(marketingRoutes.includes(`/use-cases/${item.id}`));
    for (const suffix of ["title", "body"])
      assert.ok(
        marketing[code][`case.${item.id}.${suffix}`]?.trim(),
        `Missing case copy: ${code}: ${item.id}.${suffix}`,
      );
  }
  for (const article of articles) {
    assert.ok(marketingRoutes.includes(`/blog/${article.slug}`));
    assert.ok(
      (article.id === "document" ? featureCopy[code].documentArticle.title : marketing[code][`article.${article.id}`])?.trim(),
      `Missing article title: ${code}: ${article.id}`,
    );
    assert.ok(
      marketing[code][`blog.${article.category}`]?.trim(),
      `Missing article category: ${code}: ${article.category}`,
    );
    for (const suffix of ["intro", "tip", "limit"])
      assert.ok(
        (article.id === "document" ? featureCopy[code].documentArticle[suffix] : articleCopy[code][`${article.id}.${suffix}`])?.trim(),
        `Missing article body: ${code}: ${article.id}.${suffix}`,
      );
  }
}
for (const feature of features) {
  const related = relatedFeatures[feature.id];
  assert.equal(related.length, 3, `Related features: ${feature.id}`);
  for (const id of related) assert.ok(id !== feature.id && features.some((item) => item.id === id),
    `Invalid related feature: ${feature.id}/${id}`);
}
for (const item of [...cases, ...articles]) {
  for (const id of [item.feature, ...item.tools])
    assert.ok(
      features.some((feature) => feature.id === id),
      `Unknown feature reference: ${id}`,
    );
}
for (const icon of new Set([
  ...features.map(({ icon }) => icon),
  "arrow-right-01-round",
  "arrow-down-01-round",
  "tick-02",
  "language-square",
])) {
  assert.ok(
    read(`public/app-preview/icons/${icon}.svg`).includes("<svg"),
    `Missing icon: ${icon}`,
  );
}
assert.ok(
  readFileSync(new URL("../public/app-preview/logo.png", import.meta.url))
    .length,
);

const appStoreSource = read("src/components/AppStoreLink.tsx");
const appStoreUrl = appStoreSource.match(
  /export const APP_STORE_URL\s*=\s*["']([^"']+)["']/,
)?.[1];
assert.equal(
  appStoreUrl,
  "https://apps.apple.com/app/id6738693321",
  "Downloads must use the existing AnyTranslator App Store listing.",
);
assert.match(appStoreSource, /href=\{APP_STORE_URL\}/);
const shell = read("src/components/marketing/MarketingShell.tsx");
const pages = read("src/pages/MarketingPages.tsx");
assert.match(
  shell,
  /<AppStoreLink\b[^>]*source\s*=\s*\{`\$\{source\}-macos`\}/,
  "macOS CTA must reuse AppStoreLink.",
);
assert.match(shell, /m\(\s*["']download\.mac["']\s*\)/);
assert.match(
  pages,
  /<AppStoreLink\b[^>]*source\s*=\s*\{`download-page-\$\{platform\}`\}/,
);
assert.ok(
  !/https?:[^\s"'<>`]+\.(?:dmg|pkg)(?:[\s"'<>`?#]|$)/i.test(
    shell + pages + appStoreSource,
  ),
  "Do not invent a direct Mac installer.",
);

assert.ok(!pages.includes('m(`features.step${number}`)'), "Do not reuse a generic workflow across features.");
assert.ok(pages.includes("details.features[feature.id]"), "Feature pages must use the audited detail source.");
await checkMainContent();

console.log(
  `Legacy marketing baseline checks passed: ${localeCodes.length} locales, ${Object.keys(marketing.en).length} UI strings, ${Object.keys(articleCopy.en).length} article paragraphs and ${pricingKeys.length} pricing strings per locale, ${features.length} feature pages, ${cases.length} case pages, ${articles.length} articles, icons, and App Store macOS/iOS downloads. Native screenshot coverage is checked separately by check:visuals.`,
);
