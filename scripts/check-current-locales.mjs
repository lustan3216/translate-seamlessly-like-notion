import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createServer } from "vite";
import { SITE_LOCALES, SITE_ROUTES, localizedPath, localesForPath } from "../src/lib/site-config.mjs";
import { marketingCatalog } from "../src/data/marketing-content.mjs";

const readJson = (file) => JSON.parse(readFileSync(new URL(`../${file}`, import.meta.url), "utf8"));
const source = readJson("src/translations/marketing/current/zh-tw.json");
const legalSource = readJson("src/translations/legal/en.json");
const returnCopy = readJson("src/translations/marketing/billing-return.json");
const liveCheckout = process.env.VITE_SHARED_ACCOUNT_LIVE === "1";
const placeholders = (value) => [...value.matchAll(/\{[a-zA-Z]+\}/g)].map(([match]) => match).sort();
function compare(value, reference, label) {
  if (typeof reference === "string") {
    assert.equal(typeof value, "string", `Expected text: ${label}`);
    assert.ok(value.trim(), `Empty translation: ${label}`);
    assert.doesNotMatch(value, /\[TODO\]|\[NEED\]|lorem ipsum|98\.3%/, `Unfinished or unsupported copy: ${label}`);
    assert.deepEqual(placeholders(value), placeholders(reference), `Changed placeholders: ${label}`);
    assert.equal(value.split("\n").length, reference.split("\n").length, `Changed editorial line breaks: ${label}`);
    if (label.endsWith(".id")) assert.equal(value, reference, `Changed stable ID: ${label}`);
  } else if (Array.isArray(reference)) {
    assert.ok(Array.isArray(value), `Expected array: ${label}`);
    assert.equal(value.length, reference.length, `Missing list items: ${label}`);
    reference.forEach((item, index) => compare(value[index], item, `${label}.${index}`));
  } else {
    const optionalGuide = /^[^.]+\.features\.[^.]+$/.test(label);
    const requiredKeys = (object) => Object.keys(object).filter((key) => !optionalGuide || key !== "guide").sort();
    assert.deepEqual(requiredKeys(value), requiredKeys(reference), `Translation key coverage: ${label}`);
    for (const key of requiredKeys(reference)) compare(value[key], reference[key], `${label}.${key}`);
    if (optionalGuide && Object.hasOwn(value, "guide")) {
      for (const [key, block] of Object.entries(value.guide)) {
        assert.ok(["steps", "abilities", "situations", "faq"].includes(key), `Unknown guide block: ${label}.${key}`);
        compare(block, reference.guide?.[key] ?? block, `${label}.guide.${key}`);
      }
    }
  }
}
assert.deepEqual(Object.keys(returnCopy).sort(), SITE_LOCALES.map(({ code }) => code).sort(), "Payment return locale coverage");
for (const [locale, copy] of Object.entries(returnCopy)) compare(copy, returnCopy.en, `${locale}.billingReturn`);
const packs = Object.fromEntries(SITE_LOCALES.map(({ code }) => {
  const copy = readJson(`src/translations/marketing/current/${code}.json`);
  compare(copy, source, code);
  return [code, copy];
}));
const legalPacks = Object.fromEntries(SITE_LOCALES.map(({ code }) => {
  const copy = readJson(`src/translations/legal/${code}.json`);
  compare(copy, legalSource, `${code}.legal`);
  for (const page of ["terms", "privacy"]) {
    assert.equal(Object.keys(copy[page].nodes).length, page === "terms" ? 55 : 79);
    assert.equal(copy[page].nodes.t001, copy[page].title, `Consistent legal title: ${code}/${page}`);
    assert.equal(Object.values(copy[page].nodes).filter((value) => value === "support@anytranslator.app").length, 1, `Preserve legal contact: ${code}/${page}`);
  }
  return [code, copy];
}));
process.env.NODE_ENV = "development";
const server = await createServer({ mode: "production", server: { middlewareMode: true, hmr: false }, appType: "custom", optimizeDeps: { noDiscovery: true, include: [] }, ssr: { noExternal: ["react-helmet-async"] } });
const visible = (html) => html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, " ").replace(/<[^>]*>/g, " ")
  .replace(/&(?:amp|lt|gt|quot|#x27|#39|nbsp);/g, (s) => ({ "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#x27;": "'", "&#39;": "'", "&nbsp;": " " })[s]).replace(/\s+/g, " ").trim();
let pages = 0;
try {
  const { render } = await server.ssrLoadModule("/src/entry-server.tsx");
  for (const locale of SITE_LOCALES) {
    const copy = packs[locale.code], catalog = marketingCatalog(locale.code);
    const check = (route, required = []) => {
      const url = localizedPath(route, locale.code), result = render(url), text = visible(result.html);
      for (const value of required) assert.ok(text.includes(visible(value)), `Missing rendered translation: ${url}: ${value.slice(0, 70)}`);
      assert.ok(result.htmlAttributes.includes(`lang="${locale.tag}"`), `Wrong HTML language: ${url}`);
      assert.doesNotMatch(result.html + result.head, /data-developer-accuracy|98\.3%|mk-developer-accuracy/, `Removed accuracy panel: ${url}`);
      assert.doesNotMatch(result.html, /href="\/features\/agent(?:[?"/#])/, `Retired Agent link: ${url}`);
      assert.match(result.html, /<footer\b[\s\S]*?href="mailto:support@anytranslator\.app"[\s\S]*?<\/footer>/, `Direct support link: ${url}`);
      assert.doesNotMatch(text, /(?:^|\s)(?:nav|hero|feature|faq|article)\.[a-zA-Z][\w.-]*(?:\s|$)/, `Untranslated key: ${url}`);
      return { ...result, text };
    };
    const home = check("/", [copy.marketing["hero.title"], copy.marketing["hero.accent"], ...copy.extras.homeScenarios.map((group) => group.title), copy.extras.askAi.title]);
    assert.doesNotMatch(home.html.match(/<section\b[^>]*mk-home-hero[\s\S]*?<\/section>/)?.[0] ?? "", /iPhone · iPad|mk-note-divider/, `Removed download caption: ${locale.code}`);
    assert.equal((home.html.match(/data-home-scenario=/g) || []).length, 10, `All everyday scenarios: ${locale.code}`);
    for (const feature of catalog.features) {
      const detail = copy.features[feature.id];
      const guide = detail.guide;
      const hasGuideSteps = Boolean(guide?.steps?.items.length);
      const stepsAndGuide = [
        ...(hasGuideSteps ? [] : detail.steps),
        ...[guide?.steps, guide?.abilities, guide?.situations].flatMap((section) => section?.items.length
          ? [section.title, ...section.items.flatMap((item) => [item.title, item.body])]
          : []),
        ...(guide?.faq ?? []).flatMap((topic) => [copy.marketing[`faq.${topic}Q`], copy.marketing[`faq.${topic}A`]].filter(Boolean)),
      ];
      const { html } = check(`/features/${feature.id}`, [detail.title, detail.heading, detail.body, ...stepsAndGuide, ...(detail.sections || []).flatMap((section) => [section.title, section.body, ...(section.items || [])])]);
      assert.equal(html.includes('class="mk-step-list"'), !hasGuideSteps, `Feature step layout: ${locale.code}/${feature.id}`);
      assert.equal((html.match(/<summary>/g) ?? []).length, guide?.faq?.length ?? 0, `Feature FAQ topics: ${locale.code}/${feature.id}`);
      for (const { image } of guide?.steps?.items ?? []) {
        assert.ok(html.includes(`src="${image.src}"`), `Missing step image: ${locale.code}/${feature.id}: ${image.src}`);
      }
    }
    for (const item of catalog.cases) check(`/use-cases/${item.id}`, copy.workflows[item.id]);
    for (const article of catalog.articles) check(`/blog/${article.slug}`, ["intro", "tip", "limit"].map((part) => article.id === "document" ? copy.documentArticle[part] : copy.articles[`${article.id}.${part}`]));
    check("/manifesto", [...copy.extras.manifesto.chapters.flatMap((chapter) => [chapter.title, ...chapter.paragraphs]), copy.extras.manifesto.closeBody]);
    const legal = legalPacks[locale.code];
    const terms = check("/terms-of-service", Object.values(legal.terms.nodes).map((value) =>
      value.replace("{support}", ` ${legal.terms.nodes.t047} `)));
    assert.match(terms.html, /id="web-subscriptions"/, `Web subscription section: ${locale.code}`);
    assert.match(terms.html, /href="https:\/\/www\.creem\.io\/buyer-terms"/, `Creem buyer terms: ${locale.code}`);
    const privacy = check("/privacy-policy", Object.values(legal.privacy.nodes));
    assert.match(privacy.html, /id="web-subscription-data"/, `Web account data section: ${locale.code}`);
    assert.match(privacy.html, /href="https:\/\/www\.creem\.io\/privacy"/, `Creem privacy notice: ${locale.code}`);
    const pricing = check("/pricing", [copy.pricing.freeAllowance, copy.pricing.quotaNote, copy.pricing.standardTitle, copy.pricing.voiceTitle]);
    const appPlans = pricing.html.match(/<section class="mk-wrap mk-pricing-grid"[^>]*>([\s\S]*?)<\/section>/)?.[1];
    assert.ok(appPlans, `App Store pricing section: ${locale.code}`);
    assert.equal((appPlans.match(/<article class="mk-price-card/g) || []).length, 3, `Three current plans: ${locale.code}`);
    const p = readJson("src/translations/marketing/pricing.json")[locale.code], number = new Intl.NumberFormat(locale.code);
    assert.doesNotMatch(pricing.html, /mk-live-subscription|pricing-storefront/, `Retired web card and storefront picker: ${locale.code}`);
    assert.match(appPlans, /data-download-source="pricing-free-/, `Preserve the App download: ${locale.code}`);
    if (liveCheckout) {
      assert.equal((appPlans.match(/mk-price-action-placeholder/g) || []).length, 2, `Wait for the catalog: ${locale.code}`);
    } else {
      assert.equal((appPlans.match(/data-download-source="pricing-(?:basic|voice)-/g) || []).length, 2, `Apple fallback: ${locale.code}`);
      assert.ok(visible(appPlans).includes(visible(p.subscribeInApp)), `Localized Apple CTA: ${locale.code}`);
    }
    const planData = readJson("src/data/main-pricing.json").plans;
    for (const tier of ["basic", "voice"]) {
      const plan = planData[`com.gpt.langpt.${tier}.1month`];
      for (const minutes of [plan.audioMinutes, plan.voiceAgentMinutes])
        assert.ok(pricing.text.includes(visible(`${number.format(minutes)} ${p.minutes} ${p.perMonth}`)), `Current monthly minutes: ${locale.code}/${tier}/${minutes}`);
    }
    for (const route of SITE_ROUTES.filter((route) => localesForPath(route).some(({ code }) => code === locale.code))) {
      check(route);
      pages++;
    }
  }
} finally { await server.close(); }
console.log(`Current localization checks passed: ${SITE_LOCALES.length} complete locale packs, exact keys/lists/IDs/placeholders, all current feature/case/article/manifesto copy, 10 home scenarios and current plan minutes; ${pages} localized route renders. Image and browser acceptance remain separate gates.`);
