import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import * as react from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as jsxRuntime from "react/jsx-runtime";
import ts from "typescript";
import * as siteConfig from "../src/lib/site-config.mjs";
import { emailCodeCopy } from "../src/translations/marketing/shared-account-email-code.ts";

const source = await readFile(new URL("../src/components/marketing/MarketingShell.tsx", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 },
});
const liveAccountOrigin = "https://account.anytranslator.app";
const creemCopy = JSON.parse(await readFile(new URL("../src/translations/marketing/creem-preview.json", import.meta.url), "utf8"));
const marketingPacks = Object.fromEntries(await Promise.all(["base", "asia", "europe-a", "europe-b"].map(async (name) => {
  const copy = JSON.parse(await readFile(new URL(`../src/translations/marketing/${name}.json`, import.meta.url), "utf8"));
  return [`@/translations/marketing/${name}.json`, { default: copy }];
})));
const marketingCopy = Object.assign({}, ...Object.values(marketingPacks).map((pack) => pack.default));

function renderShell({ code = "en", pathname = "/", preview = false, accountHost = false, liveMarketing = false, menuOpen = false } = {}) {
  const Link = ({ to, children, ...props }) => react.createElement("a", { ...props, href: to }, children);
  const modules = {
    react: menuOpen ? { ...react, useState: () => react.useState(true) } : react,
    "react/jsx-runtime": jsxRuntime,
    "react-router-dom": { Link, NavLink: Link, useLocation: () => ({ pathname }) },
    "@/contexts/LanguageContext": { useLanguage: () => ({ currentLanguage: { code }, t: (key) => key }) },
    "@/lib/site-config.mjs": siteConfig,
    "@/lib/shared-account-preview": {
      liveAccountOrigin,
      sharedAccountPreviewEnabled: preview,
      sharedAccountLiveAccountEnabled: accountHost,
      sharedAccountEnabled: preview || accountHost,
    },
    "@/components/HugeIcon": { default: () => null },
    "@/components/AppStoreLink": { default: ({ source }) => react.createElement("a", { "data-source": source }) },
    "./LanguagePicker": { default: () => null },
    "./ThemeToggle": { default: () => null },
    "./FooterMediaCredits": { default: () => null },
    ...marketingPacks,
    "@/translations/marketing/creem-preview.json": { default: creemCopy },
    "@/translations/marketing/shared-account-email-code": { emailCodeCopy },
    "@/marketing.css": {},
    "./PhotoStages.css": {},
    "@/data/feature-details": { featureDetails: {} },
    "@/data/current-copy": { currentMainCopies: {}, getCurrentMainCopy: () => ({}) },
    "@/data/marketing-content.mjs": { marketingCatalog: () => ({}) },
  };
  const exports = {};
  runInNewContext(outputText, { exports, require: (name) => {
    assert.ok(modules[name], name);
    return modules[name];
  } });
  return {
    header: renderToStaticMarkup(react.createElement(exports.MarketingNavigation, { liveMarketing })),
    footer: renderToStaticMarkup(react.createElement(exports.MarketingFooter)),
    closing: renderToStaticMarkup(react.createElement(exports.Closing, { liveMarketing })),
  };
}

test("marketing site renders full localized header actions and preserves checkout visibility", () => {
  for (const { code } of siteConfig.SITE_LOCALES) {
    const { header, footer, closing } = renderShell({ code });
    const accountHref = `${liveAccountOrigin}${siteConfig.localizedPath("/account", code)}`;
    assert.ok(header.includes(`mk-nav-sign-in" href="${accountHref}">${emailCodeCopy[code].signIn}</a>`), code);
    assert.ok(footer.includes(`href="${accountHref}">${creemCopy[code].manageSubscription}</a>`), code);
    assert.ok(header.includes(`href="${siteConfig.localizedPath("/download", code)}">${marketingCopy[code]["nav.download"]}</a>`), code);
    assert.ok(closing.includes('data-source="closing-ios"'), code);
    const liveHeader = renderShell({ code, liveMarketing: true }).header;
    assert.ok(liveHeader.includes(`href="${siteConfig.localizedPath("/pricing", code)}">${creemCopy[code].seePlans}</a>`), code);
  }
});

test("the expanded mobile menu offers the localized account sign-in link", () => {
  for (const { code } of siteConfig.SITE_LOCALES) {
    const { header } = renderShell({ code, menuOpen: true });
    const accountHref = `${liveAccountOrigin}${siteConfig.localizedPath("/account", code)}`;
    assert.ok(header.includes('aria-expanded="true" aria-controls="mk-mobile-menu"'), code);
    assert.ok(header.includes(`class="mk-mobile-menu" aria-label="${marketingCopy[code]["nav.menu"]}"><a href="${accountHref}">${emailCodeCopy[code].signIn}</a>`), code);
  }
});

test("the live purchase flag independently retains the existing plan CTA behavior", () => {
  const { header, footer, closing } = renderShell({ liveMarketing: true });
  assert.ok(header.includes('href="/pricing">See plans</a>'));
  assert.ok(footer.includes(`href="${liveAccountOrigin}/account">Manage subscription</a>`));
  assert.ok(closing.includes('href="/pricing">See plans</a>'));
  assert.ok(!renderShell({ liveMarketing: true, pathname: "/pricing" }).header.includes('>See plans</a>'));
});

test("preview keeps account navigation isolated and account pages avoid self-links", () => {
  const { header, footer } = renderShell({ code: "zh-tw", preview: true, menuOpen: true });
  assert.ok(header.includes('mk-nav-sign-in" href="/account?lang=zh-tw">登入</a>'));
  assert.ok(header.includes('><a href="/account?lang=zh-tw">登入</a>'));
  assert.ok(!footer.includes("/account"));
  for (const settings of [{ preview: true }, { accountHost: true }]) {
    const { header, footer } = renderShell({ ...settings, pathname: "/account/", menuOpen: true });
    assert.ok(!header.includes("/account"));
    assert.ok(!footer.includes("/account"));
  }
});
