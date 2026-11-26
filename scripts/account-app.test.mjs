import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { loadAccountApp, takeAccountAppLaunch } from "../src/lib/account-app-entry.ts";
import { accountAppPath, SITE_LOCALES } from "../src/lib/site-config.mjs";
import { appAllowsPlanAction, appPlanOffers, planChangeTiming, subscriptionPortalAction } from "../src/pages/account-subscription-policy.ts";

const source = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const token = "Az_-".repeat(10) + "987";

function launchAt(url, saved = new Map()) {
  const location = new URL(url, "https://example.test");
  const routerState = { idx: 1 };
  const replacements = [];
  const history = {
    state: routerState,
    replaceState(state, _, path) {
      assert.equal(state, routerState);
      replacements.push(path);
      location.href = new URL(path, location.href);
    },
  };
  const launch = takeAccountAppLaunch(location, history, () => ({
    getItem: (key) => saved.get(key),
    setItem(key, value) {
      assert.equal(location.hash, "", "fragment is scrubbed before anything is persisted");
      saved.set(key, value);
    },
  }));
  return { launch, replacements, saved };
}

test("scrubs the initial App fragment and persists presentation without the single-use token", () => {
  const { launch, replacements, saved } = launchAt(`${accountAppPath}/?unused=yes#lang=zh_HK&access=${token}&theme=dark`);
  assert.deepEqual(launch, { access: token, theme: "dark", locale: "zh-tw" });
  assert.deepEqual(replacements, [accountAppPath]);
  assert.deepEqual([...saved.values()].map(JSON.parse), [{ theme: "dark", locale: "zh-tw" }]);
  assert.deepEqual(launchAt(accountAppPath, saved).launch, { access: undefined, theme: "dark", locale: "zh-tw" });
  assert.deepEqual(launchAt(`/account#access=${token}`).replacements, []);
  for (const invalid of ["", "invalid", `${token}&access=${token}`]) {
    const result = launchAt(`${accountAppPath}#access=${invalid}`);
    assert.equal(result.launch.access, null);
    assert.deepEqual(result.replacements, [accountAppPath]);
  }
});

test("matches every App interface locale across case and separators, with an English fallback", () => {
  // App interface locale codes are defined in lib/langs.dart in the App repository.
  const mapped = {
    en: ["en_US", "en_GB", "en_AU"], ko: ["ko"], ja: ["ja"],
    fr: ["fr_FR", "fr_CA"], de: ["de_DE", "de_AT", "de_CH"], es: ["es_ES", "es_419"],
    it: ["it"], "pt-br": ["pt_BR", "pt_PT"], fi: ["fi"], da: ["da"], nl: ["nl_NL", "nl_BE"],
    no: ["nb"], sv: ["sv"], "zh-cn": ["zh_CN"], "zh-tw": ["zh_TW", "zh_HK"],
    id: ["id"], vi: ["vi"], th: ["th"], ru: ["ru"],
  };
  const fallback = "hi ar ar_EG bn ur fa pa sw tr fil ms ta pl uk ro si ne km el hu kk zu cs sr he bg hy sk ka lt lv et af sq az eu be bs ca hr gl gu kn mk ml mr sl te".split(" ");
  assert.deepEqual(Object.keys(mapped).sort(), SITE_LOCALES.map(({ code }) => code).sort());
  assert.equal(new Set([...Object.values(mapped).flat(), ...fallback]).size, 76);

  for (const [locale, inputs] of [...Object.entries(mapped), ["en", fallback], ["zh-tw", ["zh-Hant-TW"]], ["no", ["nb_NO"]]]) {
    for (const input of inputs) {
      for (const variant of [input, input.toLowerCase().replaceAll("_", "-"), input.toUpperCase().replaceAll("-", "_")]) {
        const { saved } = launchAt(`${accountAppPath}#theme=dark`);
        const { launch } = launchAt(`${accountAppPath}#access=${token}&lang=${variant}`, saved);
        assert.deepEqual(launch, { access: token, theme: undefined, locale }, variant);
      }
    }
  }
});

const account = { id: "test-account" };
const appSession = { account, session: { source: "app_link" } };
const billing = { subscription: { state: "active" } };

test("without a link exchange, billing starts only after an app_link session is confirmed", async () => {
  for (const session of [appSession, { account }, { account, session: { source: "web" } }, { account: null, session: null }]) {
    const calls = [];
    const request = async (path) => {
      calls.push(path);
      return path === "/session" ? session : billing;
    };
    const result = await loadAccountApp(request, undefined, new AbortController().signal);
    if (session === appSession) {
      assert.deepEqual(result, { phase: "ready", account, billing });
      assert.deepEqual(calls, ["/session", "/billing/status"]);
    } else {
      assert.deepEqual(result, { phase: "expired" });
      assert.deepEqual(calls, ["/session"]);
    }
  }
});

test("session and billing start in parallel after a successful exchange", async () => {
  const exchange = Promise.withResolvers();
  const session = Promise.withResolvers();
  const calls = [];
  const request = (path) => {
    calls.push(path);
    return path === "/session" ? session.promise : Promise.resolve(billing);
  };
  const result = loadAccountApp(request, exchange.promise, new AbortController().signal);
  assert.deepEqual(calls, []);

  exchange.resolve();
  await Promise.resolve();
  assert.deepEqual(calls, ["/session", "/billing/status"]);

  session.resolve(appSession);
  assert.deepEqual(await result, { phase: "ready", account, billing });
});

test("a failed or aborted exchange never starts billing", async () => {
  const request = () => assert.fail("no requests should start after an invalid or aborted exchange");
  const controller = new AbortController();
  const expired = await loadAccountApp(request, Promise.reject({ status: 410 }), controller.signal);
  assert.deepEqual(expired, { phase: "expired" });
  const unavailable = await loadAccountApp(request, Promise.reject({ status: 503 }), controller.signal);
  assert.deepEqual(unavailable, { phase: "exchange_error" });
  controller.abort();
  assert.equal(await loadAccountApp(request, Promise.resolve(), controller.signal), undefined);
});

test("unauthorized or non-App sessions expire even when the other parallel request fails", async () => {
  for (const [sessionResponse, billingResponse] of [
    [{ status: 401 }, { status: 500 }],
    [{ status: 500 }, { status: 401 }],
    [{ account, session: { source: "web" } }, { status: 500 }],
    [{ account: null, session: null }, billing],
  ]) {
    const request = async (path) => {
      const response = path === "/session" ? sessionResponse : billingResponse;
      if (response.status) throw response;
      return response;
    };
    assert.deepEqual(await loadAccountApp(request, Promise.resolve(), new AbortController().signal), { phase: "expired" });
  }
});

test("a billing 401 after confirming an existing App session expires the page", async () => {
  const request = async (path) => {
    if (path === "/session") return appSession;
    throw { status: 401 };
  };
  assert.deepEqual(await loadAccountApp(request, undefined, new AbortController().signal), { phase: "expired" });
});

test("the standalone page keeps expired sessions on the page and offers email support", async () => {
  const page = await source("src/pages/AccountAppPage.tsx");
  assert.match(page, /load\.phase === "expired" \? subscriptionCopy\[locale\]\.appLinkExpired/);
  assert.match(page, /onSessionExpired=\{\(\) => setLoad\(\{ phase: "expired" \}\)\}/);
  assert.doesNotMatch(page, /\b(?:useNavigate|Navigate|MarketingNavigation|MarketingFooter)\b|<MarketingShell/);
  assert.match(page, /<div className="mk-brand"><img src="\/app-preview\/logo\.png"/);
  assert.deepEqual([...page.matchAll(/href="([^"]*)"/g)].map(([, href]) => href), ["mailto:support@anytranslator.app"]);
});

test("the App plan selector admits deferred options only when purchases are disabled", async () => {
  const current = { groupLevel: 4, period: "monthly" };
  const candidates = [
    { id: "upgrade", groupLevel: 3, period: "monthly" },
    { id: "downgrade", groupLevel: 5, period: "monthly" },
    { id: "cross-period", groupLevel: 4, period: "yearly" },
    { id: "upgrade-cross-period", groupLevel: 3, period: "yearly" },
    { id: "unknown", period: "yearly" },
  ];
  const timing = (candidate) => planChangeTiming(current, candidate);
  assert.deepEqual(appPlanOffers(candidates, timing).map(({ id }) => id), ["downgrade", "cross-period"]);
  assert.deepEqual(appPlanOffers(candidates, timing, "cross-period"), []);
  assert.equal(appAllowsPlanAction("checkout"), false);
  const page = await source("src/pages/AccountSubscription.tsx");
  assert.match(page, /const visibleOffers = !appPage \|\| canCheckout \? offers : canCancel\s*\? appPlanOffers\(/);
  assert.match(page, /appAllowsPlanAction\("checkout"\)/);
  assert.match(page, /appAllowsPlanAction\(attempt\.timing\)/);
  assert.match(page, /if \(appPage && attempt\.action === "change-plan" && attempt\.offer\) \{\s*const latest = await accountRequest<AccountBilling>\("\/billing\/status"\);[\s\S]*?appAllowsPlanAction\(latestTiming\)/);
});

test("App grace uses a plain notice while browser grace retains the payment action", async () => {
  for (const state of ["inUse", "scheduledCancel"]) {
    assert.equal(subscriptionPortalAction(true, true, state), "portalDetails");
    assert.equal(subscriptionPortalAction(false, true, state), "portalDetails");
  }
  assert.equal(subscriptionPortalAction(true, true, "grace"), undefined);
  assert.equal(subscriptionPortalAction(true, true, "expired"), undefined);
  assert.equal(subscriptionPortalAction(true, false, "inUse"), undefined);
  assert.equal(subscriptionPortalAction(false, true, "grace"), "updatePayment");

  const page = await source("src/pages/AccountSubscription.tsx");
  assert.match(page, /appPage && state === "grace" && <p className="mk-account-notice" role="alert">\{copy\.appGracePayment\}<\/p>/);
  assert.match(page, /portalAction && \(\s*<button[\s\S]*?openPortal\(\)/);
});

test("App quota failures offer a features retry without the general billing error card", async () => {
  const page = await source("src/pages/AccountSubscription.tsx");
  assert.match(page, /const retryAppQuotas = appPage && quotaQuery\.isError && !quotaQuery\.data/);
  const retry = page.match(/\{retryAppQuotas \? \(\s*(<section[\s\S]*?<\/section>)/)?.[1];
  assert.ok(retry);
  assert.match(retry, /onClick=\{\(\) => void quotaQuery\.refetch\(\)\}>\{messages\.retry\}/);
  assert.doesNotMatch(retry, /mk-account-notice|messages\.error/);
  assert.match(page, /const webQuotaProblem = !appPage && \(quotaQuery\.isError/);
  assert.match(page, /\{\(webQuotaProblem \|\| catalogUnavailable\) && \(/);
});

test("web passkey registration sends the default name and exposes no editable or signed-in name", async () => {
  const [page, client] = await Promise.all([source("src/pages/SharedAccountPage.tsx"), source("src/lib/shared-account-client.ts")]);
  assert.match(client, /const passkeyRegistrationBody = \{ display_name: "AnyTranslator" \};/);
  assert.match(page, /kind === "register"\s*\? await createPasskey\(\(await accountRequest<\{ options: RegistrationOptions \}>\(\s*`\$\{prefix\}\/options`, passkeyRegistrationBody/);
  assert.doesNotMatch(page, /account-name|account\.display_name|displayName\.current/);
  assert.match(page, /onClick=\{\(\) => void signOut\(\)\}/);
});
