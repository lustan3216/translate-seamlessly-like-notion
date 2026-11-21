import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, writeFile, rename } from "node:fs/promises";
import { SITE_LOCALES } from "../src/lib/site-config.mjs";

// Root runs this after reviewing the agents' accepted batches. Incomplete locales stay incomplete.
const json = async (file) => JSON.parse(await readFile(file, "utf8"));
const sha = (bytes) => createHash("sha256").update(bytes).digest("hex");
const registryPath = "src/data/localized-ui-screens.json";
const proofPath = "output/imagegen-localization-220/adopted.json";
const registry = await json(registryPath);
const adopted = await json(proofPath);
adopted.scope = "Reviewed website UI derivatives; original native captures and the independent capture gate are unchanged.";
const catalog = await json("output/imagegen-localization-all/catalog.json");
let added = 0;
for (const { code } of SITE_LOCALES.filter(({ code }) => code !== "zh-tw")) {
  for (const source of catalog) {
    const candidatePath = `output/imagegen-localization-all/${code}/${source.id}.adoptable.json`;
    let candidate;
    try { candidate = await json(candidatePath); }
    catch (error) { if (error.code === "ENOENT") continue; throw error; }
    const { registry: entry, proof } = candidate;
    if (proof.review.status !== "visually-accepted") continue;
    assert.equal(proof.review.locale, code, candidatePath);
    assert.equal(proof.review.localizationPolicy, "ui-explanations-and-results-v1", candidatePath);
    assert.equal(entry.sourceNative, source.sourceNative, candidatePath);
    assert.equal(proof.sourceRawSHA256, source.sourceRawSHA256, candidatePath);
    assert.equal(entry.src, `/app-preview/localized-ui/20261118/${code}/${source.id}.webp`);
    assert.equal(proof.src, entry.src);
    assert.equal(sha(await readFile(`public${entry.src}`)), proof.output.sha256, candidatePath);
    assert.equal(sha(await readFile(`output/imagegen-localization-220/${proof.preservedGenerated}`)), proof.editedSHA256, candidatePath);
    assert.equal(sha(await readFile(proof.sourceRaw)), source.sourceRawSHA256, candidatePath);
    const images = registry[code] ||= [];
    const index = images.findIndex((image) => image.sourceNative === entry.sourceNative);
    if (index === -1) { images.push(entry); added++; }
    else images[index] = entry;
    adopted.images = adopted.images.filter((image) => image.src !== entry.src);
    adopted.images.push(proof);
  }
}
for (const [file, data] of [[proofPath, adopted], [registryPath, registry]]) {
  await writeFile(`${file}.tmp`, JSON.stringify(data, null, 2) + "\n");
  await rename(`${file}.tmp`, file);
}
console.log(JSON.stringify({ added, accepted: Object.fromEntries(SITE_LOCALES.map(({ code }) => [code, registry[code]?.length || 0])), requiredPerTranslatedLocale: catalog.length }));
