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
  const current = { id: "voice-monthly", plan: "voice", period: "monthly" };
  const target = { id: "standard-monthly", plan: "standard", period: "monthly" };
  const offers = [current, target];
  const billing = { entitlement: { source: "creem_live" }, subscription: { state: "active", offerId: current.id } };
  const plans = { [current.id]: { groupLevel: 1 }, [target.id]: { groupLevel: 2 } };
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
    "@tanstack/react-query": { useQuery: () => ({ data: { plans, billingOffers } }) },
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
    "@/translations/marketing/shared-account": { sharedAccountCopy: () => ({ cancel: "Cancel" }) },
    "@/translations/marketing/shared-account-subscription": { subscriptionCopy },
    "@/translations/marketing/pricing.json": { default: { en: {} } },
    "@/translations/marketing/creem-preview.json": { default: { en: {} } },
    "./account-subscription-policy": policy,
  };
  const exports = {};
  runInNewContext(outputText, { exports, crypto, require: (name) => {
    assert.ok(modules[name], name);
    return modules[name];
  } });
  return {
    target, requests,
    render() {
      hook = 0;
      return exports.default({
        appPage, billing, accountId: "test-account", catalog: { offers }, busy: false, allowActions: true, allowCheckout: true,
        run: (action) => { operation = action(); return operation; }, onBillingChange: () => {},
      });
    },
    operation: () => operation,
  };
}

for (const appPage of [true, false]) {
  test(`${appPage ? "/account/app" : "/account"} requires explicit selection and dialog confirmation before changing plan`, async () => {
    const { target, requests, render, operation } = mountSubscription(appPage);
    const primary = (tree) => find(tree, (node) => node.props.className === "mk-subscription-primary");
    const trigger = (tree) => find(primary(tree), (node) => node.type === "AlertDialogTrigger");
    const radio = (tree) => find(tree, (node) => node.props.type === "radio");

    let tree = render();
    assert.equal(radio(tree).props.checked, false);
    assert.equal(trigger(tree).props.children.props.disabled, true);

    if (!appPage) {
      const standard = find(tree, (node) => node.type === "button" && node.props.children === "Standard");
      standard.props.onClick();
      tree = render();
      assert.equal(radio(tree).props.checked, false);
      assert.equal(trigger(tree).props.children.props.disabled, true);
    }

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
  });
}
