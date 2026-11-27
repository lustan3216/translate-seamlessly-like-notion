import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";
import { readAffiliate } from "../api/plan-quotas.mjs";
import { SITE_LOCALES, SITE_ROUTES, localesForPath } from "../src/lib/site-config.mjs";
import { marketingCatalog, features, cases, articles, relatedFeatures } from "../src/data/marketing-content.mjs";
import { mainSourceCommit, currentMainFeatures, currentMainCases, currentMainArticles, currentMainRelated } from "../src/data/main-current.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const toneLabelSourceCommit = "f4ce7f6b79cd749355150472dbbc0f59d33f79a3";
const websiteToneChoices = ["自動", "禮貌", "幽默", "書信", "朋友", "精簡"];
const read = (file) => readFileSync(path.join(root, file), "utf8");
const json = (file) => JSON.parse(read(file));
const pricingCopy = json("src/translations/marketing/pricing.json");
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const ids = (entries) => entries.map(({ id }) => id).sort();
const unique = (entries, label) => assert.equal(new Set(entries).size, entries.length, `Duplicate ${label}`);
const nonempty = (value, label) => {
  assert.equal(typeof value, "string", `Expected text: ${label}`);
  assert.ok(value.trim() && value !== label, `Missing text: ${label}`);
  assert.doesNotMatch(value, /\[NEED\]|\[TODO\]|lorem ipsum/i, `Placeholder: ${label}`);
};
const strings = (value) => typeof value === "string" ? [value]
  : Array.isArray(value) ? value.flatMap(strings)
  : Object.values(value).flatMap(strings);
const text = (html) => html
  .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
  .replace(/<[^>]*>/g, " ")
  .replace(/&(?:amp|lt|gt|quot|#x27|#39|nbsp);/g, (entity) => ({
    "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"',
    "&#x27;": "'", "&#39;": "'", "&nbsp;": " ",
  })[entity])
  .replace(/\s+/g, " ").trim();

function sourceSnapshot() {
  const snapshot = json("src/data/main-pricing.json");
  assert.match(snapshot.sourceCommit, /^[a-f0-9]{40}$/, "Full pricing source commit");
  assert.match(snapshot.publicConfigSHA256, /^[a-f0-9]{64}$/, "Full public config SHA256");
  assert.deepEqual(snapshot.affiliate, readAffiliate(snapshot.affiliate), "Affiliate snapshot must contain only the public settings");
  const planIds = ["free", ...["basic", "voice"].flatMap((tier) =>
    ["week", "month", "year"].map((period) => `com.gpt.langpt.${tier}.1${period}`))].sort();
  assert.deepEqual(Object.keys(snapshot.plans).sort(), planIds, "Current plan snapshot coverage");
  const fields = ["visible", "translateCount", "audioMinutes", "voiceAgentMinutes", "quotaPeriod", "periodDays", "helperCount"];
  for (const [id, plan] of Object.entries(snapshot.plans)) {
    assert.ok(Object.keys(plan).every((key) => fields.includes(key)), `Unknown snapshot field: ${id}`);
    assert.equal(typeof plan.visible, "boolean", `Plan visibility: ${id}`);
    for (const key of ["translateCount", "audioMinutes", "voiceAgentMinutes", "helperCount"])
      assert.ok(Number.isInteger(plan[key]) && plan[key] >= -1, `Plan quantity: ${id}/${key}`);
    assert.ok(["week", "month"].includes(plan.quotaPeriod), `Quota period: ${id}`);
    if (id === "free" || plan.periodDays !== undefined)
      assert.ok(Number.isInteger(plan.periodDays) && plan.periodDays > 0, `Period days: ${id}`);
    if (id !== "free") {
      assert.ok(plan.visible, `Unavailable advertised plan: ${id}`);
      assert.equal(plan.translateCount, -1, `Unlimited paid translation: ${id}`);
      assert.equal(plan.quotaPeriod, id.endsWith("1week") ? "week" : "month", `Paid quota renewal: ${id}`);
    }
  }

  const icons = json("docs/main-icons-20261116.json");
  assert.equal(icons.sourceCommit, mainSourceCommit, "Icon source commit");
  assert.deepEqual(icons.icons.map(({ name }) => name).sort(), ["closed-caption", "table"]);
  for (const icon of icons.icons) {
    assert.equal(icon.source, `assets/icons/Stroke/${icon.name}.svg`, `Official icon source: ${icon.name}`);
    assert.match(icon.sha256, /^[a-f0-9]{64}$/);
    const output = readFileSync(path.join(root, "public/app-preview/icons", `${icon.name}.svg`));
    assert.equal(sha256(output), icon.sha256, `Icon output bytes: ${icon.name}`);
    assert.match(output.toString("utf8"), /<svg\b/, `SVG icon: ${icon.name}`);
  }

  // A website worktree can have an old parent HEAD; always read the selected Git object.
  const appRepo = process.env.ANYTRANSLATOR_APP_REPO
    ? path.resolve(process.env.ANYTRANSLATOR_APP_REPO)
    : path.resolve(root, "..");
  const hasAppRepo = existsSync(path.join(appRepo, ".git"));
  assert.ok(hasAppRepo || !process.env.ANYTRANSLATOR_APP_REPO,
    "ANYTRANSLATOR_APP_REPO must point to the App Git checkout");
  let scan = { free: 1, paid: 10 };
  let toneChoices = { "zh-tw": websiteToneChoices };
  if (hasAppRepo) {
    const source = (file, commit = mainSourceCommit) => execFileSync("git", ["-C", appRepo, "show", `${commit}:${file}`], { maxBuffer: 16 * 1024 * 1024 });
    const raw = source("anytranslator-api/config/default-prompt.public.json");
    const config = JSON.parse(raw.toString("utf8"));
    const ui = config.uiInformation;
    const toneConfig = JSON.parse(source("anytranslator-api/config/default-prompt.public.json", toneLabelSourceCommit));
    const { toneOptions } = toneConfig.uiInformation;
    assert.deepEqual(toneOptions.map(({ id }) => id), ["polite", "humor", "letter", "oral", "concise"],
      "Five configured tones beside the App's automatic option");
    const localeSource = source("lib/locales/translations.dart", toneLabelSourceCommit).toString("utf8");
    const automaticLabels = Object.fromEntries(
      [...localeSource.matchAll(/^ {6}'(\w+)': \{\n([\s\S]*?)^ {6}\},/gm)].map(([, locale, copy]) =>
        [locale, copy.match(/^ {8}'Automatic': '([^']+)',/m)?.[1]]),
    );
    toneChoices = Object.fromEntries(SITE_LOCALES.map(({ code, ogLocale }) => {
      const language = ogLocale.split("_")[0];
      const choices = [
        automaticLabels[ogLocale] ?? automaticLabels[language],
        ...toneOptions.map(({ titles }) => titles[ogLocale] ?? titles[language]),
      ];
      for (const choice of choices) nonempty(choice, `App tone: ${code}`);
      return [code, choices];
    }));
    assert.deepEqual(toneChoices["zh-tw"], websiteToneChoices, "Traditional Chinese tone choices match the App release");
    for (const [id, title] of [["grammar", "文法"], ["commonMistake", "常見錯誤"], ["wordByWord", "逐詞解析"]]) {
      const preset = ui.helperPresets.find((item) => item.id === id);
      assert.equal((preset?.title ?? preset?.titles)?.zh_TW, title, `Current Helper preset: ${id}`);
      assert.equal(preset.maxInputTokens, 60, `Short-sentence Helper scope: ${id}`);
    }
    assert.equal(config.configVersion, "v101", "Current Chat start-chip config");
    const startChips = ui.chatChips.normal.chips.filter(({ id, action }) => id !== "continuePractice" && action !== "lesson");
    assert.deepEqual(startChips.map(({ id, action, label }) => [id, action, label.zh_TW]), [
      ["voice", "voice", "語音對話"],
      ["chatPractice", "send", "陪我用{language}聊天"],
      ["interpret", "send", "幫我即時口譯"],
      ["photo", "camera", "拍照讓 AI 看懂"],
    ], "Four current Chat start suggestions");
    assert.ok(!ui.chatChips.normal.chips.some(({ id }) => id === "translateTo"), "Removed fill-only translation chip");
    assert.equal(startChips.find(({ id }) => id === "chatPractice").text, undefined, "Practice chip sends its resolved label");
    assert.match(startChips.find(({ id }) => id === "interpret").text.zh_TW, /我的語言.*\{language\}.*互譯/, "Interpret chip names the language pair");
    assert.deepEqual(ui.chatChips.normal.chips.filter(({ action, target }) => action === "lesson" && ["goal", "scenario"].includes(target)).map(({ target }) => target).sort(), ["goal", "scenario"], "Current Chat entry chips");
    assert.ok(!ui.chatChips.normal.chips.some(({ action }) => action === "mode"), "Removed normal Chat mode chip");
    assert.equal(ui.chatLessonCatalog.goals.length, 8, "Current goal catalogue");
    assert.equal(ui.chatLessonCatalog.scenarios.length, 13, "Current scenario catalogue");
    const chatSource = source("lib/screens/translation_chat_screen.dart").toString("utf8");
    assert.deepEqual(ui.chatLessonCatalog.modes.map(({ id, title }) => [id, title.zh_TW]), [["normal", "智慧對話"], ["goal", "目標練習"], ["scenario", "場景練習"]], "Current three Chat modes");
    assert.deepEqual(Object.keys(ui.chatChips).sort(), ["normal", "scenario", "sentence", "version"], "Current chip sets exclude the retired tutor set");
    assert.equal(ui.chatChips.normal.max, 4, "Smart Chat chip cap");
    assert.deepEqual(ui.chatChips.scenario.chips.map(({ id }) => id), ["hint", "explainGrammar"], "Scenario chips keep role-play focused");
    assert.deepEqual(ui.chatChips.sentence.chips.map(({ id }) => id), ["hint", "explainGrammar", "moreExamples"], "Sentence chips use the card playback control");
    for (const token of ["_entryChips", "_showModes", "_modeSummary", "ChatModesView", "ChatSetupStart", "ChatIntro", "ChatIntroLearn"])
      assert.ok(chatSource.includes(token), `Pinned three-mode Chat entry implementation: ${token}`);
    assert.doesNotMatch(chatSource, /_openPicker|_takeCustomRequest|ChatLessonPickerCard/, "Removed in-thread custom-request picker");
    const widgets = source("lib/chat/chat_lesson_widgets.dart").toString("utf8");
    for (const token of ["ChatCustomText-$kind", "ChatGoalExample-$index"])
      assert.ok(widgets.includes(token), `Current custom-input sheet control: ${token}`);
    assert.match(chatSource, /mine:\s*false/, "My sentences is no longer a standalone Chat entry");
    assert.match(chatSource, /practice == null\s*\?\s*_historyLanguage\s*:\s*_voiceLanguageName\(practice\)/, "Start suggestions prefer the practice language");
    assert.ok(chatSource.includes("_sendChip(view.text, keepVoice: _activeLesson == null)"), "Normal send chips preserve an active voice session");
    const sendChipSource = chatSource.slice(chatSource.indexOf("Future<void> _sendChip("), chatSource.indexOf("void _explain("));
    assert.ok(sendChipSource.includes("_voice.state.value == ConversationVoiceState.active"), "Start chips must not enable voice that was off");
    assert.ok(sendChipSource.includes("(keepVoice || _activeLesson != null)"), "Voice resume covers normal chat as well as lessons");
    const guideSource = source("lib/locales/chat_guide_translations.dart").toString("utf8");
    assert.ok(guideSource.includes("我是你的 AI 語言助手，可以直接說，也可以打字跟我聊"), "Current AI language assistant intro");
    assert.ok(guideSource.includes("也可以透過以下兩種方式學語言："), "Learning-entry guide remains visible");
    // The fallback describes a fresh installation at the pinned source date.
    const pricingRaw = source("anytranslator-api/config/default-prompt.public.json", snapshot.sourceCommit);
    assert.equal(sha256(pricingRaw), snapshot.publicConfigSHA256, "Pinned pricing public config bytes");
    const { subscription, affiliate } = JSON.parse(pricingRaw.toString("utf8"));
    assert.deepEqual(snapshot.affiliate, readAffiliate(affiliate), "Affiliate snapshot must match the pinned public settings");
    const sourceTime = Date.parse(execFileSync("git", ["-C", appRepo, "show", "-s", "--format=%cI", snapshot.sourceCommit], { encoding: "utf8" }).trim());
    const { newInstallationPlan, scheduledPolicy, newInstallations, ...rawFree } = subscription.free;
    let free = rawFree;
    if (newInstallationPlan && sourceTime >= Date.parse(newInstallationPlan.createdAtOrAfter)) {
      free = { ...rawFree, ...newInstallationPlan };
    } else if (scheduledPolicy && sourceTime >= Date.parse(scheduledPolicy.effectiveAt)) {
      free = { ...rawFree, ...scheduledPolicy };
    } else if (newInstallations && sourceTime >= Date.parse(newInstallations.createdAtOrAfter)) {
      free = { ...rawFree, translateCount: newInstallations.translateCount };
    }
    const selected = Object.fromEntries(planIds.map((id) => {
      const plan = id === "free" ? free : subscription[id];
      assert.ok(plan, `Missing source plan: ${id}`);
      return [id, Object.fromEntries(fields.filter((key) => Object.hasOwn(plan, key)).map((key) => [key, plan[key]]))];
    }));
    assert.deepEqual(snapshot.plans, selected, "Pricing snapshot must match the pinned public quotas for a new installation");
    const scanSource = source("lib/models/smart_scan_document.dart").toString("utf8");
    scan = {
      free: Number(scanSource.match(/smartScanFreePhotoLimit\s*=\s*(\d+)/)?.[1]),
      paid: Number(scanSource.match(/smartScanProPhotoLimit\s*=\s*(\d+)/)?.[1]),
    };
    assert.ok(Number.isInteger(scan.free) && Number.isInteger(scan.paid), "Pinned Smart Scan limits");
    for (const icon of icons.icons)
      assert.equal(sha256(source(icon.source)), icon.sha256, `Pinned official icon bytes: ${icon.name}`);
    console.log(`Pricing source verified from Git object ${snapshot.sourceCommit}: public config SHA256, fresh-installation plan quotas and affiliate settings.`);
    console.log(`Main content verified from Git object ${mainSourceCommit}: Smart Scan limits, two official SVGs and current three-mode Chat entry flow.`);
  } else {
    console.log("App Git checkout unavailable: pricing/icon snapshot schema and local output hashes checked only; pinned App source and Smart Scan constants remain unverified in this standalone checkout.");
  }
  return { snapshot, scan, toneChoices, sourceVerified: hasAppRepo };
}

export async function checkMainContent() {
  const { snapshot, scan, toneChoices, sourceVerified } = sourceSnapshot();
  const zh = marketingCatalog("zh-tw");
  assert.deepEqual(zh, { features: currentMainFeatures, cases: currentMainCases, articles: currentMainArticles, relatedFeatures: currentMainRelated });
  assert.equal(zh.features.length, 12);
  assert.equal(zh.cases.length, 7);
  assert.equal(zh.articles.length, 9);
  unique(ids(zh.features), "main feature");
  unique(ids(zh.cases), "main case");
  unique(ids(zh.articles), "main article");
  unique(zh.articles.map(({ slug }) => slug), "main article slug");
  const known = new Set(ids(zh.features));
  assert.ok(!known.has("agent"), "Retired Agent cannot be a current feature");
  assert.deepEqual(Object.keys(zh.relatedFeatures).sort(), [...known].sort());
  for (const [id, related] of Object.entries(zh.relatedFeatures)) {
    assert.equal(related.length, 3, `Main related features: ${id}`);
    unique(related, `main related feature: ${id}`);
    for (const target of related) assert.ok(target !== id && known.has(target), `Unknown related feature: ${id}/${target}`);
  }
  for (const item of [...zh.cases, ...zh.articles])
    for (const id of [item.feature, ...item.tools]) assert.ok(known.has(id), `Unknown main feature reference: ${item.id}/${id}`);
  for (const locale of SITE_LOCALES.filter(({ code }) => code !== "zh-tw"))
    assert.deepEqual(marketingCatalog(locale.code), zh, `Current catalogue parity: ${locale.code}`);

  // Match Vite JSXDEV with the React runtime, as in prerender.mjs.
  process.env.NODE_ENV = "development";
  const server = await createServer({ root, mode: "production", server: { middlewareMode: true, hmr: false }, appType: "custom", optimizeDeps: { noDiscovery: true, include: [] }, ssr: { noExternal: ["react-helmet-async"] } });
  try {
    const { currentMainCopy: copy } = await server.ssrLoadModule("/src/data/main-zh-copy.ts");
    const { homeScenarioGroups } = await server.ssrLoadModule("/src/data/home-scenarios.ts");
    const nativeScreens = json("src/data/native-product-screens.json")["zh-tw"];
    for (const scenario of homeScenarioGroups.flatMap((group) => group.scenarios)) {
      const screen = nativeScreens?.[scenario.feature];
      assert.ok(screen, `Missing native capture for home scenario: ${scenario.id}/${scenario.feature}`);
      if (scenario.shotId) assert.ok(screen.gallery?.some((shot) => shot.shotId === scenario.shotId), `Missing native gallery capture for home scenario: ${scenario.id}/${scenario.feature}/${scenario.shotId}`);
    }
    assert.deepEqual(Object.keys(copy).sort(), ["articles", "documentArticle", "features", "marketing", "pricing", "scan", "workflows"]);
    assert.deepEqual(Object.keys(copy.features).sort(), [...known].sort(), "Complete current feature copy");
    assert.deepEqual(Object.keys(copy.workflows).sort(), ids(zh.cases), "Complete current case workflows");
    const baseMarketing = json("src/translations/marketing/base.json")["zh-tw"];
    const marketing = { ...baseMarketing, ...copy.marketing };
    const expectedArticleKeys = zh.articles.filter(({ id }) => id !== "document").flatMap(({ id }) => ["intro", "tip", "limit"].map((suffix) => `${id}.${suffix}`)).sort();
    assert.deepEqual(Object.keys(copy.articles).sort(), expectedArticleKeys, "Complete current article paragraphs");
    for (const feature of zh.features) {
      const detail = copy.features[feature.id];
      nonempty(marketing[`feature.${feature.id}`], `feature.${feature.id}`);
      for (const key of ["title", "summary", "heading", "body"]) nonempty(detail[key], `${feature.id}.${key}`);
      assert.notEqual(detail.body, detail.summary, `Detail expands summary: ${feature.id}`);
      assert.equal(detail.steps.length, 3, `Three current steps: ${feature.id}`);
      unique(detail.steps, `current steps: ${feature.id}`);
      detail.steps.forEach((value, i) => nonempty(value, `${feature.id}.step${i + 1}`));
      assert.equal(detail.sections, undefined, `Unused main feature sections: ${feature.id}`);
    }
    for (const item of zh.cases) {
      for (const suffix of ["title", "body"]) nonempty(marketing[`case.${item.id}.${suffix}`], `case.${item.id}.${suffix}`);
      assert.equal(copy.workflows[item.id].length, item.tools.length, `Current workflow: ${item.id}`);
      unique(copy.workflows[item.id], `workflow step: ${item.id}`);
    }
    for (const article of zh.articles) {
      nonempty(article.id === "document" ? copy.documentArticle.title : marketing[`article.${article.id}`], `article.${article.id}`);
      for (const suffix of ["intro", "tip", "limit"])
        nonempty(article.id === "document" ? copy.documentArticle[suffix] : copy.articles[`${article.id}.${suffix}`], `${article.id}.${suffix}`);
    }
    for (const value of strings(copy)) {
      nonempty(value, "current main copy");
      assert.doesNotMatch(value, /Tools\s*(?:→|->)\s*Chat|TextResultChatButton|(?:文字)?譯文旁.{0,8}(?:Chat|AI\s*助手|聊天).{0,5}(?:按鈕|圖示|鈕)/i, "Retired Text/Tools Chat entry promise");
      assert.doesNotMatch(value, /五(?:種|個)(?:對話)?模式|我的句子|自由練習/, "Removed Chat mode or My sentences entry promise");
      assert.doesNotMatch(value, /沒有即時口譯按鈕|沒有新增的即時翻譯模式按鈕/, "The current Chat has an interpreting start suggestion");
    }
    assert.ok(!Object.keys(copy.marketing).some((key) => key.startsWith("accuracy.")), "Removed public benchmark copy must not return");
    assert.doesNotMatch(strings(copy).join(" "), /98\.3|開發者自述/, "Removed internal benchmark statement must stay out of public Chinese copy");
    assert.doesNotMatch(copy.features.text.body, /自動校對|自動修正/, "Translation is separate from requested grammar correction");
    for (const label of ["文法", "常見錯誤", "逐詞解析"])
      assert.ok(copy.features.helper.body.includes(label), `Helper correction/explanation route: ${label}`);
    for (const key of ["title", "body"]) nonempty(copy.scan[key], `scan.${key}`);
    for (const [key, value] of Object.entries(copy.pricing)) nonempty(value, `pricing.${key}`);
    assert.doesNotMatch(copy.pricing.freeAllowance, /每週|每月|每日|每天/, "Do not fix one reset policy for every Free user");
    const numbers = (value) => (value.match(/\d[\d,]*/g) ?? []).map((n) => Number(n.replaceAll(",", "")));
    for (const [key, id] of [["standardWeeklyAllowance", "basic.1week"], ["standardMonthlyAllowance", "basic.1month"], ["voiceWeeklyAllowance", "voice.1week"], ["voiceMonthlyAllowance", "voice.1month"]]) {
      const plan = snapshot.plans[`com.gpt.langpt.${id}`];
      assert.deepEqual(numbers(copy.pricing[key]), [plan.audioMinutes, plan.voiceAgentMinutes], `Chinese plan allowances: ${key}`);
    }
    assert.deepEqual(numbers(copy.pricing.freeScan), [scan.free]);
    assert.deepEqual(numbers(copy.pricing.scanAllowance), [scan.paid]);
    assert.deepEqual(numbers(copy.pricing.freeHelper), [snapshot.plans.free.helperCount]);
    assert.deepEqual(numbers(copy.pricing.helperAllowance), [snapshot.plans["com.gpt.langpt.basic.1month"].helperCount]);
    assert.match(copy.pricing.quotaNote, /AI\s*助手\s*語音.*AI\s*助手.*分鐘/);
    assert.match(copy.pricing.quotaNote, /影片字幕.*語音翻譯.*共用.*語音分鐘/);
    assert.match(copy.pricing.annualQuotaNote, /按月/);

    // Check the real data adapters and rendered text, not only the JSON inputs.
    const { featureDetails } = await server.ssrLoadModule("/src/data/feature-details.ts");
    const { render } = await server.ssrLoadModule("/src/entry-server.tsx");
    const checkRendered = (url, required) => {
      const result = render(url);
      const visible = text(result.html);
      const localizedHtml = result.html.replace(/<(blockquote|p|dl)\b[^>]*\blang="en"[^>]*>[\s\S]*?<\/\1>/g, " ");
      const humanAttributes = [...localizedHtml.matchAll(/\b(?:aria-label|alt|title|placeholder)="([^"]*)"/g)].map((match) => text(match[1]));
      const seoCopy = [...result.head.matchAll(/<meta\b[^>]*(?:name|property)="(?:description|keywords|og:title|og:description|twitter:title|twitter:description)"[^>]*content="([^"]*)"/g)].map((match) => text(match[1]));
      assert.doesNotMatch([text(localizedHtml), text(result.head), ...humanAttributes, ...seoCopy].join(" "), /\bChat\b/, `Chinese visible assistant naming: ${url}`);
      for (const value of required) assert.ok(visible.includes(text(value)), `Missing rendered copy: ${url}: ${value.slice(0, 55)}`);
      assert.doesNotMatch(result.html, /href="\/features\/agent(?:[?"/#])/, `Retired current Agent link: ${url}`);
      assert.doesNotMatch(visible, /Tools\s*(?:→|->)\s*Chat|(?:文字)?譯文旁.{0,8}(?:Chat|AI\s*助手|聊天).{0,5}(?:按鈕|圖示|鈕)/i, `Retired current Chat entry: ${url}`);
      assert.doesNotMatch(visible, /五(?:種|個)(?:對話)?模式|我的句子|自由練習/, `Removed current Chat modes or My sentences entry: ${url}`);
      assert.doesNotMatch(result.html + result.head, /98\.3|開發者自述|data-developer-accuracy|mk-developer-accuracy/, `Removed public benchmark panel: ${url}`);
      return result.html;
    };
    checkRendered("/?lang=zh-tw", zh.features.map(({ id }) => marketing[`feature.${id}`]));
    for (const feature of zh.features) {
      const { guide, ...detail } = featureDetails["zh-tw"].features[feature.id];
      assert.deepEqual(detail, copy.features[feature.id], `Feature adapter: ${feature.id}`);
      assert.ok(guide?.steps?.items.length, `Missing guided layout: ${feature.id}`);
      checkRendered(`/features/${feature.id}?lang=zh-tw`, [detail.title, detail.body]);
    }
    const chatGuide = strings(featureDetails["zh-tw"].features.chat.guide).join(" ");
    for (const term of ["開口", "對話", "口譯", "照片", "重點", "下一步"])
      assert.ok(chatGuide.includes(term), `Current Chat guide copy: ${term}`);
    for (const [locale, choices] of Object.entries(toneChoices)) {
      const abilities = featureDetails[locale].features.text.guide.abilities.items;
      assert.ok(abilities.some(({ body }) => choices.every((choice) => body.includes(choice))),
        `Text guide uses all six App tone labels: ${locale}`);
    }
    console.log(`Six tone labels checked for ${Object.keys(toneChoices).length} locales${sourceVerified ? ` against App release ${toneLabelSourceCommit}` : ""}.`);
    for (const item of zh.cases) checkRendered(`/use-cases/${item.id}?lang=zh-tw`, copy.workflows[item.id]);
    for (const article of zh.articles)
      checkRendered(`/blog/${article.slug}?lang=zh-tw`, ["intro", "tip", "limit"].map((suffix) => article.id === "document" ? copy.documentArticle[suffix] : copy.articles[`${article.id}.${suffix}`]));
    for (const url of ["/", "/features/text"])
      assert.doesNotMatch(render(url).html, /data-developer-accuracy|98\.3%/, `Removed unverified accuracy panel: ${url}`);
    const pricingCopy = json("src/translations/marketing/pricing.json");
    const zhPricing = pricingCopy["zh-tw"];
    const currentPricing = checkRendered("/pricing?lang=zh-tw", [copy.pricing.freeAllowance, copy.pricing.quotaNote]);
    const priceCards = (html) => [...html.matchAll(/<article\b[^>]*class="[^"]*mk-price-card[^"]*"[^>]*>([\s\S]*?)<\/article>/g)].map((match) => text(match[1]));
    const currentCards = priceCards(currentPricing);
    assert.equal(currentCards.length, 3, "Current pricing card count");
    assert.doesNotMatch(currentCards[0], /每週|每月|每日|每天/, "Current Free card must leave reset policy conditional");
    const comparisonTable = (html) => html.match(/<table\b[^>]*class="mk-price-comparison-table"[^>]*>([\s\S]*?)<\/table>/)?.[1];
    const table = comparisonTable(currentPricing);
    assert.ok(table, "Current pricing has a semantic comparison table");
    assert.doesNotMatch([...currentCards, text(table)].join(" "), /Voice Agent|語音代理/, "Current pricing must describe Chat instead of the retired Agent");
    const zhNumber = new Intl.NumberFormat("zh-tw");
    const headers = [...table.matchAll(/<th scope="col">([\s\S]*?)<\/th>/g)].map((match) => text(match[1]));
    assert.deepEqual(headers, [marketing["nav.features"], marketing["pricing.free"], copy.pricing.standardTitle, copy.pricing.voiceTitle]);
    const rows = new Map([...table.matchAll(/<th scope="row">([\s\S]*?)<\/th>([\s\S]*?)<\/tr>/g)].map((match) => [
      text(match[1]), [...match[2].matchAll(/<td>([\s\S]*?)<\/td>/g)].map((cell) => text(cell[1])),
    ]));
    assert.equal(rows.size, 9, "Current pricing comparison row count");
    for (const values of rows.values()) assert.equal(values.length, 3, "Each feature compares all three plans");
    assert.deepEqual(rows.get(pricingCopy["zh-tw"].shareRecordings), ["—", "—", pricingCopy["zh-tw"].included], "Only Voice shares conversation links with recordings");
    const free = snapshot.plans.free;
    const zhPeriod = free.periodDays === 1 ? "每天" : free.periodDays === 7 ? "每週" :
      free.periodDays === 30 ? "每月" : `每 ${zhNumber.format(free.periodDays)} 天`;
    for (const label of [marketing["feature.text"], marketing["feature.photos"], copy.pricing.aiTextLabel])
      assert.equal(rows.get(label)?.[0], `${zhPeriod} ${zhNumber.format(free.translateCount)} 次`, `Shared Free translation allowance: ${label}`);
    for (const [label, value] of [[copy.pricing.voiceLabel, free.audioMinutes], [copy.pricing.chatVoiceLabel, free.voiceAgentMinutes]])
      assert.equal(rows.get(label)?.[0], `${zhPeriod} ${zhNumber.format(value)} 分鐘`, `Free minutes: ${label}`);
    const english = render("/pricing").html;
    assert.match(text(comparisonTable(english)), /\b1 photo per batch 10 photos per batch 10 photos per batch\b/, "English scan allowance singular and plural");
    for (const [index, tier, title] of [[1, "basic", copy.pricing.standardTitle], [2, "voice", copy.pricing.voiceTitle]]) {
      const plan = snapshot.plans[`com.gpt.langpt.${tier}.1month`];
      assert.ok(currentCards[index].includes(title), `Current rendered plan name: ${tier}`);
      for (const [label, value] of [[copy.pricing.voiceLabel, plan.audioMinutes], [copy.pricing.chatVoiceLabel, plan.voiceAgentMinutes]])
        assert.equal(rows.get(label)?.[index], text(`${zhNumber.format(value)} ${zhPricing.minutes} ${zhPricing.perMonth}`), `Current monthly allowance: ${tier}/${value}`);
      for (const period of ["week", "month", "year"])
        assert.equal(snapshot.plans[`com.gpt.langpt.${tier}.1${period}`].helperCount, plan.helperCount, `Shared rendered Helper count across billing: ${tier}/${period}`);
    }
    for (const [index, helper, photos] of [[0, snapshot.plans.free.helperCount, scan.free], [1, snapshot.plans["com.gpt.langpt.basic.1month"].helperCount, scan.paid], [2, snapshot.plans["com.gpt.langpt.voice.1month"].helperCount, scan.paid]]) {
      assert.equal(rows.get(zhPricing.profiles)?.[index], zhNumber.format(helper), `Current rendered Helper allowance: ${index}`);
      assert.equal(rows.get(copy.pricing.scanLabel)?.[index], text(`${photos} 張／批`), `Current rendered scan allowance: ${index}`);
      if (index !== 0) assert.equal(rows.get(copy.pricing.aiTextLabel)?.[index], zhPricing.unlimited, `Current assistant text/photo scope: ${index}`);
      assert.equal(rows.get(marketing["feature.widget"])?.[index], text(index === 0 ? copy.pricing.freeWidget : copy.pricing.widgetAllowance), `Current Widget upgrade benefit: ${index}`);
    }
    const currentRoutes = SITE_ROUTES.filter((route) => localesForPath(route).some(({ code }) => code === "zh-tw"));
    for (const route of currentRoutes) {
      const html = checkRendered(`${route}?lang=zh-tw`, []);
      assert.doesNotMatch(text(html), /Voice Agent|語音代理/, `Retired Agent wording on current Chinese route: ${route}`);
    }
    console.log(`Scanned all ${currentRoutes.length} current Chinese routes: no retired Voice Agent, Text/Tools Chat, five-mode or My sentences entry promises.`);
  } finally {
    await server.close();
  }
  console.log(`Current-main Chinese content passed: 12 features, 7 workflows, 9 articles, actual rendered adapters, pricing/icon snapshots${sourceVerified ? " verified against pinned App Git objects" : " checked for schema/local output only"}; localized content parity is checked separately. Native screenshot coverage is checked separately.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await checkMainContent();
