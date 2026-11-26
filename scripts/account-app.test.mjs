import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { finishAccountAppSession, loadAccountApp, sendAppMessage, takeAccountAppLaunch } from "../src/lib/account-app-entry.ts";
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

test("an expired App page sends close and stays on the page even if the bridge cannot deliver", () => {
  const messages = [];
  const redirect = () => assert.fail("an App page must never open the general account page");
  finishAccountAppSession(redirect, { AnyTranslatorApp: { postMessage: (message) => messages.push(message) } });
  assert.deepEqual(messages, ["close"]);
  finishAccountAppSession(redirect, { AnyTranslatorApp: {} });
  finishAccountAppSession(redirect, { AnyTranslatorApp: { postMessage() { throw new Error("bridge unavailable"); } } });
});

test("an expired page in a regular browser redirects to the general account page", () => {
  const redirects = [];
  finishAccountAppSession((path) => redirects.push(path), {});
  assert.deepEqual(redirects, ["/account"]);
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
