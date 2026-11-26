import assert from "node:assert/strict";
import { test } from "node:test";
import { SITE_LOCALES } from "../src/lib/site-config.mjs";
import { emailCodeCopy } from "../src/translations/marketing/shared-account-email-code.ts";

test("email code sign-in copy covers all website locales and preserves its placeholders", () => {
  const fields = ["changeEmail", "codeLabel", "codeSent", "invalidCode", "resend", "resendCountdown", "sendCode", "signIn"];
  const placeholdersByField = { codeSent: ["{email}"], resendCountdown: ["{time}"] };
  const fullWidthParentheses = new Set(["ja", "zh-cn", "zh-tw"]);
  assert.deepEqual(Object.keys(emailCodeCopy).sort(), SITE_LOCALES.map(({ code }) => code).sort());

  for (const { code } of SITE_LOCALES) {
    const copy = emailCodeCopy[code];
    assert.deepEqual(Object.keys(copy).sort(), fields, code);
    for (const field of fields) {
      assert.ok(copy[field].trim(), `${code} ${field}`);
      if (code !== "en") assert.notEqual(copy[field], emailCodeCopy.en[field], `${code} ${field}`);
      const placeholders = copy[field].match(/\{[^}]+\}/g) ?? [];
      assert.deepEqual(placeholders, placeholdersByField[field] ?? [], `${code} ${field}`);
    }
    const expectedCountdown = fullWidthParentheses.has(code) ? `${copy.resend}（4:58）` : `${copy.resend} (4:58)`;
    assert.equal(copy.resendCountdown.replace("{time}", "4:58"), expectedCountdown, code);
  }
});
