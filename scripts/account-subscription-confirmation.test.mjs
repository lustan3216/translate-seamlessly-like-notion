import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import * as jsxRuntime from "react/jsx-runtime";
import ts from "typescript";
import * as policy from "../src/pages/account-subscription-policy.ts";
import { subscriptionCopy } from "../src/translations/marketing/shared-account-subscription.ts";

const source = await readFile(new URL("../src/pages/AccountSubscription.tsx", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 },
});

function find(node, predicate) {
  if (Array.isArray(node)) {
    for (const child of node) {
      const match = find(child, predicate);
      if (match) return match;
    }
  } else if (node?.props) {
    return predicate(node) ? node : find(node.props.children, predicate);
  }
}

function mountSubscription(appPage) {
  const current = { id: "voice-yearly", plan: "voice", period: "yearly" };
  const target = { id: "voice-monthly", plan: "voice", period: "monthly" };
  const standard = { id: "standard-monthly", plan: "standard", period: "monthly" };
  const offers = [current, target, standard];
  const billing = { entitlement: { source: "creem_live" }, subscription: { state: "active", offerId: current.id } };
  const plans = {
    [current.id]: { groupLevel: 1, features: [{ id: "translation" }], translateCount: -1 },
    [target.id]: { groupLevel: 1 },
    [standard.id]: { groupLevel: 2 },
  };
  const billingOffers = Object.fromEntries(offers.map((offer) => [offer.id, { ...offer, productId: offer.id }]));
  const requests = [];
  const state = [];
  let hook = 0;
  let operation;
  const modules = {
    react: {
      useState(initial) {
        const index = hook++;
        if (!(index in state)) state[index] = typeof initial === "function" ? initial() : initial;
        return [state[index], (value) => { state[index] = value; }];
      },
    },
    "react/jsx-runtime": jsxRuntime,
    "@tanstack/react-query": { useQuery: () => quotaQuery },
    "@/components/HugeIcon": { default: "HugeIcon" },
    "@/components/marketing/MarketingShell": {
      useMarketing: () => ({ currentLanguage: { code: "en" }, copy: { pricing: {} }, m: (key) => key }),
    },
    "@/components/ui/alert-dialog": Object.fromEntries(
      ["AlertDialog", "AlertDialogTrigger", "AlertDialogContent", "AlertDialogTitle", "AlertDialogDescription",
        "AlertDialogCancel", "AlertDialogAction"].map((name) => [name, name]),
    ),
    "@/lib/shared-account-client": {
      accountRequest: async (path, body) => {
        requests.push({ path, body });
        return billing;
      },
      readBillingAttempt: () => undefined,
      saveBillingAttempt: () => {},
    },
    "@/lib/shared-account-preview": { formatCreemPrice: () => "USD 10.00" },
    "@/translations/marketing/shared-account": { sharedAccountCopy: () => ({ cancel: "Cancel", retry: "Retry" }) },
    "@/translations/marketing/shared-account-subscription": { subscriptionCopy },
    "@/translations/marketing/pricing.json": { default: { en: {} } },
    "@/translations/marketing/creem-preview.json": { default: { en: {} } },
    "./account-subscription-policy": policy,
  };
  let quotaQuery;
  const exports = {};
  runInNewContext(outputText, { exports, crypto, require: (name) => {
    assert.ok(modules[name], name);
    return modules[name];
  } });
  return {
    billing, current, target, requests,
    render(currentBilling = billing, quotas = { data: { plans, billingOffers } }) {
      hook = 0;
      quotaQuery = quotas;
      return exports.default({
        appPage, billing: currentBilling, accountId: "test-account", catalog: { offers }, busy: false, allowActions: true, allowCheckout: true,
        run: (action) => { operation = action(); return operation; }, onBillingChange: () => {},
      });
    },
    operation: () => operation,
  };
}

for (const appPage of [true, false]) {
  test(`${appPage ? "/account/app" : "/account"} requires explicit selection and dialog confirmation before changing plan`, async () => {
    const { current, target, requests, render, operation } = mountSubscription(appPage);
    const primary = (tree) => find(tree, (node) => node.props.className === "mk-subscription-primary");
    const trigger = (tree) => find(primary(tree), (node) => node.type === "AlertDialogTrigger");
    const radio = (tree) => find(tree, (node) => node.props.type === "radio" && node.props.value === target.id);

    let tree = render();
    assert.equal(radio(tree).props.checked, false);
    assert.equal(trigger(tree).props.children.props.disabled, true);

    assert.equal(radio(tree).props.value, target.id);
    radio(tree).props.onChange();
    tree = render();
    assert.equal(radio(tree).props.checked, true);
    const dialogTrigger = trigger(tree);
    assert.equal(dialogTrigger.props.children.props.disabled, false);
    // Radix owns opening and canceling. The trigger itself has no billing handler.
    assert.equal(dialogTrigger.props.asChild, true);
    assert.equal(dialogTrigger.props.children.props.onClick, undefined);
    const content = find(primary(tree), (node) => node.type === "AlertDialogContent");
    assert.ok(content);
    assert.equal(find(content, (node) => node.type === "AlertDialogTitle").props.children, "Switch at renewal");
    assert.ok(find(content, (node) => node.type === "AlertDialogCancel"));
    assert.deepEqual(requests, []);

    const action = find(content, (node) => node.type === "AlertDialogAction");
    assert.equal(action.props.disabled, false);
    action.props.onClick();
    await operation();
    const mutations = requests.filter(({ body }) => body);
    assert.equal(mutations.length, 1);
    assert.equal(mutations[0].path, "/billing/change-plan");
    assert.equal(mutations[0].body.offer, target);
    assert.equal(radio(render()).props.checked, false);

    const standard = find(tree, (node) => node.type === "button" && node.props.children === "Standard");
    standard.props.onClick();
    assert.equal(radio(render()), undefined);
    assert.equal(trigger(render()).props.children.props.disabled, true);
    const voice = find(render(), (node) => node.type === "button" && node.props.children === "Voice");
    voice.props.onClick();
    assert.ok(find(render(), (node) => node.props.type === "radio" && node.props.value === current.id));
  });

  test(`${appPage ? "/account/app" : "/account"} lists the current Voice annual plan without accepting it as a selection`, () => {
    const { current, requests, render } = mountSubscription(appPage);
    const tree = render();
    const row = find(tree, (node) => node.type === "label" && find(node, (child) => child.props.value === current.id));
    assert.ok(row);
    assert.ok(find(row, (node) => node.props.children === subscriptionCopy.en.inUse));
    const radio = find(row, (node) => node.props.type === "radio");
    assert.equal(radio.props.disabled, true);
    assert.equal(radio.props.checked, false);
    assert.equal(radio.props.onChange, undefined);
    const primary = find(tree, (node) => node.props.className === "mk-subscription-primary");
    assert.equal(find(primary, (node) => node.type === "AlertDialogTrigger").props.children.props.disabled, true);
    const confirm = find(primary, (node) => node.type === "AlertDialogAction");
    assert.equal(confirm.props.disabled, true);
    confirm.props.onClick();
    assert.deepEqual(requests, []);
  });
}

test("the web account can still purchase an expired plan again", () => {
  const { current, render } = mountSubscription(false);
  const expired = { enabled: true, entitlement: null, subscription: { state: "expired", offerId: current.id } };
  const tree = render(expired);
  const radio = find(tree, (node) => node.props.type === "radio" && node.props.value === current.id);
  assert.equal(radio.props.disabled, false);
  radio.props.onChange();
  assert.equal(find(render(), (node) => node.props.type === "radio" && node.props.value === current.id).props.checked, false);
  assert.equal(find(render(expired), (node) => node.props.type === "radio" && node.props.value === current.id).props.checked, true);
});

test("the app keeps benefits in a closed disclosure and can retry a failed quota request", () => {
  const { current, render } = mountSubscription(true);
  const details = find(render(), (node) => node.type === "details");
  assert.equal(details.props.open, undefined);
  assert.equal(find(details, (node) => node.type === "summary").props.children, "nav.features");
  assert.ok(find(details, (node) => node.props.children === subscriptionCopy.en.benefits.translation));

  let retried = false;
  const failed = render(undefined, { isError: true, refetch: () => { retried = true; } });
  assert.equal(find(failed, (node) => node.type === "details"), undefined);
  assert.equal(find(failed, (node) => node.props.value === current.id).props.disabled, true);
  const retry = find(failed, (node) => node.type === "button" && node.props.children === "Retry");
  retry.props.onClick();
  assert.equal(retried, true);
});

test("the app offers resume as the primary action while cancellation is scheduled", async () => {
  const { billing, requests, render, operation } = mountSubscription(true);
  const tree = render({ ...billing, subscription: { ...billing.subscription, state: "scheduled_cancel" } });
  const primary = find(tree, (node) => node.props.className === "mk-subscription-primary");
  const resume = find(primary, (node) => node.type === "button");
  assert.equal(resume.props.children, subscriptionCopy.en.resumeSubscription);
  assert.equal(find(tree, (node) => node.props.type === "radio"), undefined);
  resume.props.onClick();
  await operation();
  assert.equal(requests[0].path, "/billing/resume");
});
