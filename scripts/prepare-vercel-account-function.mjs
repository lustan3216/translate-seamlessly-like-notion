import { copyFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const liveFunctions = {
  "account-catalog": "liveCatalogProxy",
  "account-live": "liveAccountProxy",
};

export async function writeLiveAccountFunction(output, name) {
  const handler = liveFunctions[name];
  if (!handler) throw new Error("Unknown account function");
  const dir = path.join(output, "functions", "api", `${name}.func`);
  await mkdir(dir, { recursive: true });
  await copyFile(new URL("./vercel-account-preview-proxy.mjs", import.meta.url), path.join(dir, "proxy.mjs"));
  await writeFile(path.join(dir, "handler.mjs"), `export { ${handler} as default } from "./proxy.mjs";\n`);
  await writeFile(path.join(dir, ".vc-config.json"), JSON.stringify({
    runtime: "nodejs24.x", handler: "handler.mjs", launcherType: "Nodejs", maxDuration: 60,
  }) + "\n");
}
