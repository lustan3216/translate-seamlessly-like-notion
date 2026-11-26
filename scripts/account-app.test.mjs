import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { appSessionAccount, sendAppMessage, takeAccountAppLaunch } from "../src/lib/account-app-entry.ts";
import { accountAppPath } from "../src/lib/site-config.mjs";
import { appAllowsPlanAction, planChangeTiming } from "../src/pages/account-subscription-policy.ts";

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

test("matches App locale variants to the website and resets unspecified theme on a new launch", () => {
  for (const [input, output] of Object.entries({
    en_GB: "en", fr_CA: "fr", es_419: "es", pt_PT: "pt-br", zh_CN: "zh-cn",
    "zh-Hant-TW": "zh-tw", nb_NO: "no", nl_BE: "nl", de_CH: "de", ar: "en",
  })) {
    const { saved } = launchAt(`${accountAppPath}#theme=dark`);
    const { launch } = launchAt(`${accountAppPath}#access=${token}&lang=${input}`, saved);
    assert.deepEqual(launch, { access: token, theme: undefined, locale: output });
  }
});

test("only an app_link session proceeds to billing; rejected sessions replace the route with /account", async () => {
  const account = { id: "test-account" };
  assert.equal(appSessionAccount({ account, session: { source: "app_link" } }), account);
  for (const session of [{ account }, { account, session: { source: "web" } }, { account: null, session: null }]) {
    assert.equal(appSessionAccount(session), null);
  }
  const page = await source("src/pages/AccountAppPage.tsx");
  assert.match(page, /appSessionAccount\(session\);\s*if \(!account\) return update\(\{ phase: "redirect" \}\);\s*const billing/);
  assert.match(page, /load\.phase === "redirect"\) return <Navigate to="\/account" replace/);
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
  assert.deepEqual(candidates.filter((candidate) => appAllowsPlanAction(planChangeTiming(current, candidate)))
    .map(({ id }) => id), ["downgrade", "cross-period"]);
  assert.equal(appAllowsPlanAction("checkout"), false);
  const page = await source("src/pages/AccountSubscription.tsx");
  assert.match(page, /const appOffers = offers\.filter[\s\S]*?return appAllowsPlanAction\(candidateTiming\)/);
  assert.match(page, /appAllowsPlanAction\("checkout"\)/);
  assert.match(page, /appAllowsPlanAction\(attempt\.timing\)/);
  assert.match(page, /if \(appPage && attempt\.action === "change-plan" && attempt\.offer\) \{\s*const latest = await accountRequest<AccountBilling>\("\/billing\/status"\);[\s\S]*?appAllowsPlanAction\(latestTiming\)/);
});

test("the bridge only posts the three plain string messages", () => {
  const sent = [];
  const host = { AnyTranslatorApp: { postMessage: (...args) => sent.push(args) } };
  for (const message of ["openSupport", "close", "statusChanged"]) assert.equal(sendAppMessage(message, host), true);
  for (const message of ["statusChanged:account", { message: "openSupport" }, "", undefined]) {
    assert.equal(sendAppMessage(message, host), false);
  }
  assert.equal(sendAppMessage("openSupport", {}), false);
  assert.deepEqual(sent, [["openSupport"], ["close"], ["statusChanged"]]);
});

test("web passkey registration sends the default name and exposes no editable or signed-in name", async () => {
  const [page, client] = await Promise.all([source("src/pages/SharedAccountPage.tsx"), source("src/lib/shared-account-client.ts")]);
  assert.match(client, /const passkeyRegistrationBody = \{ display_name: "AnyTranslator" \};/);
  assert.match(page, /kind === "register"\s*\? await createPasskey\(\(await accountRequest<\{ options: RegistrationOptions \}>\(\s*`\$\{prefix\}\/options`, passkeyRegistrationBody/);
  assert.doesNotMatch(page, /account-name|account\.display_name|displayName\.current/);
  assert.match(page, /onClick=\{\(\) => void signOut\(\)\}/);
});
