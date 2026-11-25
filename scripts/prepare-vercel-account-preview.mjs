import { spawnSync } from "node:child_process";
import { copyFile, cp, lstat, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SITE_ROUTES } from "../src/lib/site-config.mjs";
import { accountClaimPath } from "../src/lib/creem-app-claim.mjs";
import { writeLiveAccountFunction } from "./prepare-vercel-account-function.mjs";

const website = fileURLToPath(new URL("../", import.meta.url));
const args = process.argv.slice(2);
const live = args[0] === "--live";
if (live) args.shift();
if (args.length > 1 || args[0]?.startsWith("-")) {
  throw new Error("Usage: node scripts/prepare-vercel-account-preview.mjs [--live] [marketing build output]");
}
const production = path.resolve(args[0] ?? path.join(website, "output/vercel-release/.vercel/output"));
const productionStatic = path.join(production, "static");
const mode = live ? "account-live" : "account-preview";
const preview = await mkdtemp(path.join(tmpdir(), `anytranslator-vercel-${mode}-`));
const output = path.join(preview, ".vercel", "output");
const staticRoot = path.join(output, "static");
const proxy = path.join(output, "functions", "api", "account-preview.func");
const quotaFunction = "functions/api/plan-quotas.func";
const presentationAssets = live ? ["app-preview/icons"] : [
  "app-preview/backgrounds/abstract-mist-v3.webp",
  "app-preview/examples/screen-translation-safari.webp",
  "app-preview/examples/screen-translation-safari-768.webp",
  "app-preview/icons",
  "app-preview/native",
  "app-preview/localized-ui",
];
const documentPaths = live ? ["/account", accountClaimPath] : [...SITE_ROUTES.filter((route) => route !== "/"), "/account"];
const escapePattern = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const headers = {
  "Cache-Control": "private, no-store",
  "X-Robots-Tag": "noindex, nofollow",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "Content-Security-Policy": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
};
const routes = [
  { src: "^/.*$", headers, continue: true },
  { src: `^/api/${mode}(?:/.*)?$`, status: 404 },
  ...(live ? [{ src: "^/$", status: 307, headers: { Location: "/account" } }] : [{ src: "^/$", dest: "/index.html" }]),
  { src: `^(?:${documentPaths.map(escapePattern).join("|")})/?$`, dest: "/index.html" },
  { src: "^/api/account/([a-z-]+(?:/[a-z-]+)*)$", dest: `/api/${mode}?account_route=$1` },
  { handle: "filesystem" },
  { src: "^/.*$", status: 404 },
];

async function copyPresentationAssets() {
  const config = JSON.parse(await readFile(path.join(production, "config.json"), "utf8"));
  const index = await readFile(path.join(productionStatic, "index.html"), "utf8");
  if (config.version !== 3 || !Array.isArray(config.routes) || !index.includes('data-prerendered="true"')
    || !(await lstat(productionStatic)).isDirectory()) {
    throw new Error("Supply the checked production Build Output directory for approved presentation assets");
  }
  for (const relative of presentationAssets) {
    const source = path.join(productionStatic, relative);
    const target = path.join(staticRoot, relative);
    await mkdir(path.dirname(target), { recursive: true });
    await cp(source, target, {
      recursive: true,
      async filter(file) {
        const entry = await lstat(file);
        if (entry.isSymbolicLink()) throw new Error(`Unexpected symlink in presentation assets: ${file}`);
        const parts = path.relative(productionStatic, file).split(path.sep);
        if (parts.some((part) => part.startsWith(".") || /^(?:raw|private|proof|native-captures)$/i.test(part))) return false;
        return entry.isDirectory() || (entry.isFile() && /\.(?:svg|webp)$/i.test(file));
      },
    });
  }
}

try {
  const env = {
    ...process.env, VITE_SHARED_ACCOUNT_PREVIEW: live ? "0" : "1", VITE_SHARED_ACCOUNT_LIVE: live ? "1" : "0",
  };
  delete env.SHARED_ACCOUNT_PROXY_TOKEN;
  delete env.SHARED_ACCOUNT_LIVE_PROXY_TOKEN;
  const build = spawnSync(process.execPath, [
    path.join(website, "node_modules", "vite", "bin", "vite.js"),
    "build", "--mode", mode, "--outDir", staticRoot,
  ], { cwd: website, env, stdio: ["ignore", process.stderr, process.stderr] });
  if (build.error) throw build.error;
  if (build.status !== 0) throw new Error("Account preview build failed");
  const indexFile = path.join(staticRoot, "index.html");
  const previewHtml = await readFile(indexFile, "utf8");
  if (!previewHtml.includes("/assets/")) {
    throw new Error("Account preview is missing its compiled entry point");
  }
  // The isolated page uses only same-origin resources under its existing CSP.
  await writeFile(indexFile, previewHtml
    .replace(/<!-- Crisp Chat Support -->\s*<script\b[^>]*>[\s\S]*?<\/script>/, "")
    .replace(/<link\b[^>]*\bhref="https:\/\/[^\"]+"[^>]*>\s*/g, ""));
  await copyPresentationAssets();
  await cp(path.join(production, quotaFunction), path.join(output, quotaFunction), {
    recursive: true,
    async filter(file) {
      const entry = await lstat(file);
      if (!entry.isDirectory() && !entry.isFile()) throw new Error(`Unexpected quota function input: ${file}`);
      return true;
    },
  });
  if (live) await writeLiveAccountFunction(output, "account-live");
  else {
    await mkdir(proxy, { recursive: true });
    await copyFile(path.join(website, "scripts", "vercel-account-preview-proxy.mjs"), path.join(proxy, "handler.mjs"));
    await writeFile(path.join(proxy, ".vc-config.json"), JSON.stringify({
      runtime: "nodejs24.x", handler: "handler.mjs", launcherType: "Nodejs", maxDuration: 60,
    }) + "\n");
  }
  await writeFile(path.join(output, "config.json"), JSON.stringify({ version: 3, routes }, null, 2) + "\n");
  console.log(preview);
} catch (error) {
  await rm(preview, { recursive: true, force: true });
  throw error;
}
