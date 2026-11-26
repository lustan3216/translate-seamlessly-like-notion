import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { setImmediate } from "node:timers/promises";
import { runInNewContext } from "node:vm";
import * as jsxRuntime from "react/jsx-runtime";
import ts from "typescript";
import { emailCodeCopy } from "../src/translations/marketing/shared-account-email-code.ts";

const source = await readFile(new URL("../src/pages/SharedAccountPage.tsx", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(`${source}\nexport { AccountManagement, EmailAccessForm };`, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 },
});

class AccountRequestError extends Error {
  constructor(status, code) {
    super(code);
    this.status = status;
  }
}

function* descendants(tree) {
  if (Array.isArray(tree)) {
    for (const child of tree) yield* descendants(child);
  } else if (tree?.props) {
    yield tree;
    yield* descendants(tree.props.children);
  }
}

function find(tree, selector) {
  return [...descendants(tree)].find(selector);
}

function text(tree) {
  if (Array.isArray(tree)) return tree.map(text).join("");
  if (tree?.props) return text(tree.props.children);
  return typeof tree === "string" ? tree : "";
}

const input = (tree) => find(tree, (node) => node.type === "input");
const button = (tree, label) => find(tree, (node) => node.type === "button" && text(node).startsWith(label));
const copy = emailCodeCopy.en;
const account = { id: "synthetic-account" };
const submit = (tree, email) => tree.props.onSubmit({ preventDefault() {}, currentTarget: { email } });

function setup({ reply, hash = "", preview = false, catalog = { webEmailAccessEnabled: true, loading: false } } = {}) {
  const instances = new Map();
  let slots;
  let index;
  let commit;
  let now = 1000;
  let attemptClears = 0;
  const calls = [];
  const intervals = new Set();
  const location = { hash, pathname: "/account", search: "" };
  const react = {
    useState(initial) {
      const slot = slots[index] ??= { value: typeof initial === "function" ? initial() : initial };
      index++;
      return [slot.value, (value) => { slot.value = typeof value === "function" ? value(slot.value) : value; }];
    },
    useRef(initial) { return react.useState(() => ({ current: initial }))[0]; },
    useCallback(callback) { return react.useState(() => callback)[0]; },
    useId: () => "code-field",
    useEffect(effect, dependencies) {
      const slot = slots[index++] ??= {};
      if (slot.dependencies?.length === dependencies.length && dependencies.every((value, i) => Object.is(value, slot.dependencies[i]))) return;
      commit.push(() => {
        slot.cleanup?.();
        slot.dependencies = dependencies;
        slot.cleanup = effect();
      });
    },
  };
  const exports = {};
  const modules = {
    react,
    "react/jsx-runtime": jsxRuntime,
    "react-helmet-async": { Helmet: "Helmet" },
    "react-router-dom": { useLocation: () => location, useNavigate: () => () => { location.hash = ""; } },
    "@/components/marketing/MarketingShell": {
      default: "MarketingShell",
      marketingCopy: { en: { "contact.email": "Your email" } },
      useMarketing: () => ({ currentLanguage: { code: "en" } }),
    },
    "@/lib/shared-account-client": {
      async accountRequest(path, body) {
        calls.push({ path, body });
        if (reply) return reply(path, body);
        if (path === "/session") return { account: null };
        if (path === "/billing/status") return { entitlement: null };
        if (path === "/email-access/request") return { accepted: true };
        if (path === "/email-access/verify") return { account };
        assert.fail(`unexpected request ${path}`);
      },
      AccountRequestError,
      clearStoredCheckoutAttempt() { attemptClears++; },
    },
    "@/lib/passkeys": {},
    "@/lib/shared-account-preview": { sharedAccountPreviewEnabled: preview, useCreemOffer: () => catalog },
    "@/translations/marketing/shared-account": { sharedAccountCopy: () => ({
      title: "Your account", signIn: "Sign in with a passkey", create: "Create account with a passkey",
      error: "Something went wrong. Try again.", retry: "Try again", approve: "Approve connection",
      pairDone: "Approved. Return to AnyTranslator.",
    }) },
    "@/translations/marketing/shared-account-delivery": { accountDeliveryCopy: { en: {} } },
    "@/translations/marketing/shared-account-email-code": { emailCodeCopy },
    "@/translations/marketing/shared-account-guest": {
      guestCheckoutCopy: { en: { emailSignIn: "Sign in by email", purchaseEmail: "Email used at checkout" } },
    },
    "@/translations/marketing/app-claim.json": { default: { en: {} } },
    "@/translations/marketing/creem-preview.json": { default: { en: { title: "Manage subscription" } } },
    "./BillingReturnPage": { default: "BillingReturnPage" },
    "./AccountSubscription": { default: "AccountSubscription" },
    "./SharedAccountPage.css": {},
  };
  runInNewContext(outputText, {
    exports, AbortController, DOMException, Error, URLSearchParams, PublicKeyCredential: class {},
    navigator: { credentials: {} },
    Date: class extends Date { static now() { return now; } },
    FormData: class { constructor(form) { this.form = form; } get(name) { return this.form[name]; } },
    window: {
      isSecureContext: true,
      addEventListener() {}, removeEventListener() {}, setTimeout() {}, clearTimeout() {},
      setInterval(callback) { intervals.add(callback); return callback; },
      clearInterval(callback) { intervals.delete(callback); },
    },
    require(name) { assert.ok(modules[name], name); return modules[name]; },
  });
  function render(name, props) {
    slots = instances.get(name) ?? [];
    instances.set(name, slots);
    index = 0;
    commit = [];
    const tree = exports[name](props);
    for (const effect of commit) effect();
    return tree;
  }
  return {
    calls, render, formType: exports.EmailAccessForm, cleared: () => attemptClears,
    hash: () => location.hash,
    advance(ms) {
      now += ms;
      for (const tick of intervals) tick();
    },
    dispose() {
      for (const hooks of instances.values()) for (const slot of hooks) slot.cleanup?.();
      assert.equal(intervals.size, 0);
    },
  };
}

test("account email sign-in waits for accepted send, accepts pasted codes and opens existing subscription management", async (t) => {
  const send = Promise.withResolvers();
  const session = setup({ reply(path) {
    if (path === "/session") return { account: null };
    if (path === "/email-access/request") return send.promise;
    if (path === "/email-access/verify") return { account };
    if (path === "/billing/status") return { entitlement: null };
    assert.fail(path);
  } });
  t.after(session.dispose);
  const renderPage = () => session.render("AccountManagement");
  const renderForm = () => session.render("EmailAccessForm", find(renderPage(), (node) => node.type === session.formType).props);
  renderPage();
  await Promise.resolve();
  const signedOut = renderPage();
  assert.match(text(signedOut), /Sign in by email/);
  assert.doesNotMatch(text(signedOut), /passkey/);
  assert.equal([...descendants(signedOut)].filter((node) => node.type === session.formType).length, 1);
  const emailForm = renderForm();
  assert.equal(emailForm.props.className, "mk-account-email-code");
  assert.equal(text(find(emailForm, (node) => node.type === "label")), "Your email");
  assert.equal(input(emailForm).props.type, "email");
  assert.equal(input(emailForm).props.placeholder, "name@example.com");
  assert.equal([...descendants(emailForm)].filter((node) => node.props.type === "submit").length, 1);
  const sending = submit(renderForm(), "person@example.test");
  assert.equal(button(renderForm(), copy.sendCode).props.disabled, true);
  send.resolve({ accepted: true });
  await sending;

  let form = renderForm();
  assert.equal(form.props.className, emailForm.props.className);
  assert.match(text(form), /p•••@example\.test/);
  assert.doesNotMatch(text(form), /person@example\.test/);
  assert.equal(find(form, (node) => node.type === "bdi" && text(node).includes("@")).props.dir, "ltr");
  const field = input(form);
  assert.equal([...descendants(form)].filter((node) => node.type === "input").length, 1);
  assert.equal(field.props.inputMode, "numeric");
  assert.equal(field.props.autoComplete, "one-time-code");
  assert.equal(field.props.maxLength, 6);
  assert.ok(button(form, copy.signIn).props.disabled);
  await submit(form);
  assert.equal(session.calls.filter(({ path }) => path.endsWith("/verify")).length, 0);

  field.props.onPaste({ preventDefault() {}, clipboardData: { getData: () => " 000 123 " } });
  form = renderForm();
  assert.equal(input(form).props.value, "000123");
  assert.equal(button(form, copy.signIn).props.disabled, false);
  await submit(form);
  renderPage();
  await Promise.resolve();
  const signedIn = renderPage();
  assert.equal(find(signedIn, (node) => node.type === "AccountSubscription").props.accountId, account.id);
  assert.doesNotMatch(text(signedIn), /Sign in by email/);
  assert.equal(session.cleared(), 1);
  assert.equal(JSON.stringify(session.calls[1].body), JSON.stringify({ email: "person@example.test", locale: "en" }));
  assert.equal(JSON.stringify(session.calls[2].body), JSON.stringify({ email: "person@example.test", code: "000123" }));
});

test("signed-out email login handles an unavailable catalog and can retry it", async (t) => {
  let retries = 0;
  const catalog = { webEmailAccessEnabled: false, loading: true, refetch: () => { retries++; } };
  const session = setup({ catalog });
  t.after(session.dispose);
  const renderPage = () => session.render("AccountManagement");
  renderPage();
  await Promise.resolve();
  const loading = renderPage();
  assert.equal(find(loading, (node) => node.type === "div" && node.props["aria-busy"]).props["aria-busy"], true);
  assert.equal(find(loading, (node) => node.type === session.formType), undefined);
  assert.equal(button(loading, "Try again"), undefined);
  catalog.loading = false;
  const unavailable = renderPage();
  assert.equal(text(find(unavailable, (node) => node.props.role === "alert")), "Something went wrong. Try again.");
  assert.doesNotMatch(text(unavailable), /passkey/);
  button(unavailable, "Try again").props.onClick();
  assert.equal(retries, 1);
  catalog.webEmailAccessEnabled = true;
  assert.ok(find(renderPage(), (node) => node.type === session.formType));
});

test("preview pairing can be approved after signing in with an email code", async (t) => {
  const session = setup({ preview: true, hash: "#pair=synthetic", reply(path) {
    if (path === "/session") return { account: null };
    if (path === "/pair/preview") return { confirmation_code: "123456", expires_at_ms: 60_000 };
    if (path === "/email-access/request") return { accepted: true };
    if (path === "/email-access/verify") return { account };
    if (path === "/pair/approve") return { ok: true };
    assert.fail(path);
  } });
  t.after(session.dispose);
  const renderPage = () => session.render("AccountManagement");
  const renderForm = () => session.render("EmailAccessForm", find(renderPage(), (node) => node.type === session.formType).props);
  renderPage();
  await setImmediate();
  assert.match(text(renderPage()), /123456/);
  assert.equal(button(renderPage(), "Approve connection"), undefined);
  await submit(renderForm(), "person@example.test");
  input(renderForm()).props.onChange({ currentTarget: { value: "123456" } });
  await submit(renderForm());
  button(renderPage(), "Approve connection").props.onClick();
  await setImmediate();
  assert.match(text(renderPage()), /Approved\. Return to AnyTranslator\./);
  assert.equal(session.calls.at(-1).path, "/pair/approve");
});

test("invalid or conflicting codes show the same error and stay on the code step", async (t) => {
  const session = setup({ reply(path, body) {
    if (path.endsWith("/request")) return { accepted: true };
    if (body.code === "000001") throw new AccountRequestError(410, "creem_web_code_invalid");
    throw new AccountRequestError(409, "creem_web_account_conflict");
  } });
  t.after(session.dispose);
  const render = () => session.render("EmailAccessForm", {
    locale: "en", disabled: false, run: (action) => action(), onAuthenticated: () => assert.fail("must stay signed out"),
  });
  await submit(render(), "person@example.test");
  for (const value of ["000001", "000002"]) {
    input(render()).props.onChange({ currentTarget: { value } });
    assert.equal(find(render(), (node) => node.props.role === "alert"), undefined);
    await submit(render());
    const result = render();
    assert.equal(input(result).props["aria-invalid"], true);
    assert.equal(text(find(result, (node) => node.props.role === "alert")), copy.invalidCode);
  }
});

test("resend waits five minutes even after returning to the same email", async (t) => {
  const session = setup();
  t.after(session.dispose);
  const render = (locale = "en") => session.render("EmailAccessForm", {
    locale, disabled: false, run: (action) => action(), onAuthenticated: () => assert.fail("must stay signed out"),
  });
  await submit(render(), "person@example.test");
  assert.equal(text(button(render(), copy.resend)), `${copy.resend} (5:00)`);
  session.advance(2_000);
  const localized = render("zh-tw");
  const actions = localized.props.children.filter((node) => node?.props?.className === "mk-text-link");
  assert.deepEqual(Array.from(actions, text), ["重寄（4:58）", "改用其他 email"]);
  assert.equal(actions[0].props.disabled, true);
  assert.equal(actions[1].props.disabled, false);
  session.advance(297_999);
  assert.equal(text(button(render(), copy.resend)), `${copy.resend} (0:01)`);
  assert.equal(button(render(), copy.resend).props.disabled, true);
  button(render(), copy.changeEmail).props.onClick();
  assert.equal(input(render()).props.name, "email");
  await submit(render(), "PERSON@example.test");
  assert.equal(session.calls.length, 1);
  assert.equal(button(render(), copy.resend).props.disabled, true);
  session.advance(1);
  assert.equal(button(render(), copy.resend).props.disabled, false);
  await button(render(), copy.resend).props.onClick();
  assert.equal(session.calls.length, 2);
  assert.equal(text(button(render(), copy.resend)), `${copy.resend} (5:00)`);
  button(render(), copy.changeEmail).props.onClick();
  await submit(render(), "another@example.test");
  assert.equal(session.calls.length, 3);
});

test("resend is available if the tab was inactive before the countdown was mounted", async (t) => {
  const session = setup();
  t.after(session.dispose);
  const render = () => session.render("EmailAccessForm", {
    locale: "en", disabled: false, run: (action) => action(), onAuthenticated: () => assert.fail("must stay signed out"),
  });
  await submit(render(), "person@example.test");
  session.advance(300_000);
  render();
  const resend = button(render(), copy.resend);
  assert.equal(resend.props.disabled, false);
  assert.equal(text(resend), copy.resend);
});

test("the email link still clears the fragment and opens subscription management", async (t) => {
  const token = "z".repeat(43);
  let active = null;
  const session = setup({ hash: `#access=${token}`, reply(path, body) {
    if (path === "/email-access") {
      assert.equal(body.token, token);
      active = account;
      return { account };
    }
    if (path === "/session") return { account: active };
    if (path === "/billing/status") return { entitlement: null };
    assert.fail(path);
  } });
  t.after(session.dispose);
  const render = () => session.render("AccountManagement");
  assert.equal(find(render(), (node) => node.type === session.formType), undefined);
  render();
  await setImmediate();
  render();
  await setImmediate();
  assert.equal(session.hash(), "");
  assert.equal(find(render(), (node) => node.type === "AccountSubscription").props.accountId, account.id);
  assert.equal(session.calls.filter(({ path }) => path === "/email-access").length, 1);
  assert.equal(session.cleared(), 1);
});
