import { copyFile, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { accountClaimPath, appClaimUrl } from "../src/lib/creem-app-claim.mjs";

const target = `https://account.anytranslator.app${accountClaimPath}`;
const claimPath = new URL(appClaimUrl).pathname;
const associationPath = "/.well-known/apple-app-site-association";
const artifact = await mkdtemp(path.join(tmpdir(), "anytranslator-vercel-app-claim-"));
const output = path.join(artifact, ".vercel", "output");
const staticRoot = path.join(output, "static");
const headers = {
  "Cache-Control": "private, no-store",
  "X-Robots-Tag": "noindex, nofollow",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "Content-Security-Policy": "default-src 'none'; script-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
};

try {
  await mkdir(path.join(staticRoot, ".well-known"), { recursive: true });
  await writeFile(path.join(staticRoot, associationPath), JSON.stringify({
    applinks: { details: [{ appIDs: ["2BTN62ZQ54.com.gpt.langpt"], components: [{ "/": claimPath }] }] },
  }) + "\n");
  await writeFile(path.join(staticRoot, "index.html"), `<!doctype html>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="referrer" content="no-referrer">
<title>AnyTranslator</title>
<script type="module" src="/retrieve.js"></script>
<a href="${target}" rel="noreferrer">AnyTranslator</a>
`);
  await copyFile(new URL("../src/lib/creem-app-claim.mjs", import.meta.url), path.join(staticRoot, "claim-link.js"));
  await writeFile(path.join(staticRoot, "retrieve.js"), `import { claimTokenFromHash } from "./claim-link.js";
const token = claimTokenFromHash(location.hash);
location.replace(${JSON.stringify(target)} + (token ? "#token=" + token : ""));
`);
  await writeFile(path.join(output, "config.json"), JSON.stringify({
    version: 3,
    routes: [
      { src: "^/\\.well-known/apple-app-site-association$", headers: { ...headers, "Content-Type": "application/json", "Cache-Control": "public, max-age=300" }, continue: true },
      { src: `^${claimPath}$`, dest: "/index.html", headers },
      { src: "^/(?:retrieve|claim-link)\\.js$", headers, continue: true },
      { handle: "filesystem" },
      { src: "^/.*$", status: 404, headers },
    ],
  }, null, 2) + "\n");
  console.log(artifact);
} catch (error) {
  await rm(artifact, { recursive: true, force: true });
  throw error;
}
