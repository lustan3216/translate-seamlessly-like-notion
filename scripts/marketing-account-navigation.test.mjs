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
const signOutLabels = { en: "Sign out", "zh-tw": "登出" };
const sharedAccountCopy = (code) => ({ signOut: signOutLabels[code] ?? signOutLabels.en });
const creemCopy = JSON.parse(await readFile(new URL("../src/translations/marketing/creem-preview.json", import.meta.url), "utf8"));
const marketingPacks = Object.fromEntries(await Promise.all(["base", "asia", "europe-a", "europe-b"].map(async (name) => {
  const copy = JSON.parse(await readFile(new URL(`../src/translations/marketing/${name}.json`, import.meta.url), "utf8"));
  return [`@/translations/marketing/${name}.json`, { default: copy }];
})));
const marketingCopy = Object.assign({}, ...Object.values(marketingPacks).map((pack) => pack.default));

function renderShell({
  code = "en", pathname = "/", preview = false, accountHost = false, liveMarketing = false,
  menuOpen = false, signedIn = false, accountSession,
} = {}) {
  const Link = ({ to, children, ...props }) => react.createElement("a", { ...props, href: to }, children);
  let firstState = true;
  const modules = {
    react: menuOpen ? { ...react, useState(initial) {
      const open = firstState || initial;
      firstState = false;
      return react.useState(open);
    } } : react,
    "react/jsx-runtime": jsxRuntime,
    "react-router-dom": { Link, NavLink: Link, useLocation: () => ({ pathname }) },
    "@/contexts/LanguageContext": { useLanguage: () => ({ currentLanguage: { code }, t: (key) => key }) },
    sonner: { toast: { error() {} } },
    "@/lib/site-config.mjs": siteConfig,
    "@/lib/shared-account-client": {
      useAccountSession(enabled, origin) {
        assert.equal(enabled, !accountSession && (preview || accountHost || liveMarketing));
        assert.equal(origin, liveMarketing ? liveAccountOrigin : "");
        return { account: enabled && signedIn ? { id: "fixture" } : null };
      },
    },
    "@/lib/shared-account-preview": {
      liveAccountOrigin,
      isLiveAccountHost: () => accountHost,
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
    "@/translations/marketing/shared-account": { sharedAccountCopy },
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
    header: renderToStaticMarkup(react.createElement(exports.MarketingNavigation, { liveMarketing, accountSession })),
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

test("preview and live account sites link to their own account page when signed out", () => {
  const { header, footer } = renderShell({ code: "zh-tw", preview: true, menuOpen: true });
  assert.ok(header.includes('mk-nav-sign-in" href="/account?lang=zh-tw">登入</a>'));
  assert.ok(header.includes('><a href="/account?lang=zh-tw">登入</a>'));
  assert.ok(!footer.includes("/account"));
  for (const settings of [{ preview: true }, { accountHost: true }]) {
    const { header, footer } = renderShell({ ...settings, pathname: "/account/", menuOpen: true });
    assert.ok(header.includes('mk-nav-sign-in" href="/account">Sign in</a>'));
    assert.ok(header.includes('><a href="/account">Sign in</a>'));
    assert.ok(!footer.includes("/account"));
  }
});

test("localized sign-out replaces the account link on desktop and mobile", () => {
  for (const [code, label] of Object.entries(signOutLabels)) {
    for (const settings of [
      { liveMarketing: true, signedIn: true },
      { accountHost: true, pathname: "/account", accountSession: { signedIn: true, busy: true } },
    ]) {
      const { header } = renderShell({ code, menuOpen: true, ...settings });
      assert.ok(header.includes(`mk-nav-sign-in"${settings.accountSession ? ' disabled=""' : ""}>${label}</button>`), code);
      assert.equal(header.split(`>${label}</button>`).length - 1, 2);
      assert.ok(!header.includes('mk-nav-sign-in" href='));
    }
  }
});
