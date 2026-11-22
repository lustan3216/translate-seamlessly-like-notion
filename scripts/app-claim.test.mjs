import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile, rm } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";
import { SITE_LOCALES } from "../src/lib/site-config.mjs";
import { accountClaimPath, appClaimUrl, claimTokenFromHash } from "../src/lib/creem-app-claim.mjs";

test("email links preserve only the exact fragment, with an isolated AASA and complete localized fallback", async (context) => {
  const token = "a".repeat(43);
  const valid = `#token=${token}`;
  for (const invalid of ["", `?token=${token}`, `${valid}&redirect=evil`, `${valid}\n`, `#token=${token.slice(1)}`, "#token=%2F"]) {
    assert.equal(claimTokenFromHash(invalid), null);
  }
  assert.equal(claimTokenFromHash(valid), token);

  const copy = JSON.parse(await readFile(new URL("../src/translations/marketing/app-claim.json", import.meta.url), "utf8"));
  assert.deepEqual(Object.keys(copy).sort(), SITE_LOCALES.map(({ code }) => code).sort());
  for (const messages of Object.values(copy)) {
    assert.deepEqual(Object.keys(messages).sort(), Object.keys(copy.en).sort());
    assert.ok(Object.values(messages).every(message => typeof message === "string" && message.trim()));
  }

  const script = fileURLToPath(new URL("./prepare-vercel-app-claim.mjs", import.meta.url));
  const artifact = execFileSync(process.execPath, [script], { encoding: "utf8" }).trim();
  context.after(() => rm(artifact, { recursive: true, force: true }));
  const output = path.join(artifact, ".vercel", "output");
  const staticRoot = path.join(output, "static");
  const association = "/.well-known/apple-app-site-association";
  const config = JSON.parse(await readFile(path.join(output, "config.json"), "utf8"));
  const associationRoute = config.routes.find(route => route.src && new RegExp(route.src).test(association));
  assert.equal(associationRoute.headers["Content-Type"], "application/json");
  assert.equal(associationRoute.dest, undefined);
  const claimPath = new URL(appClaimUrl).pathname;
  assert.deepEqual(JSON.parse(await readFile(path.join(staticRoot, association), "utf8")), {
    applinks: { details: [{ appIDs: ["2BTN62ZQ54.com.gpt.langpt"], components: [{ "/": claimPath }] }] },
  });
  const claimRoute = config.routes.find(route => route.dest === "/index.html");
  assert.equal(claimRoute.src, `^${claimPath}$`);
  assert.equal(claimRoute.headers["Referrer-Policy"], "no-referrer");
  assert.equal(claimRoute.headers["Cache-Control"], "private, no-store");
  const redirect = (await readFile(path.join(staticRoot, "retrieve.js"), "utf8")).split("\n").slice(1).join("\n");
  const retrieveUrl = `https://account.anytranslator.app${accountClaimPath}`;
  for (const [hash, expected] of [[valid, `${retrieveUrl}${valid}`], [`${valid}&extra=yes`, retrieveUrl]]) {
    let target;
    runInNewContext(redirect, { claimTokenFromHash, location: { hash, replace: value => { target = value; } } });
    assert.equal(target, expected);
  }
});
