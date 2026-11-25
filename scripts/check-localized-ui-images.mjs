import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import sharp from "sharp";
import { SITE_LOCALES } from "../src/lib/site-config.mjs";
import { localizedUiAspectLimit } from "./localized-ui-aspect-policy.mjs";

const root = new URL("../", import.meta.url);
const read = (file) => readFileSync(new URL(file, root));
const json = (file) => JSON.parse(read(file).toString("utf8"));
const sha = (bytes) => createHash("sha256").update(bytes).digest("hex");
const registry = json("src/data/localized-ui-screens.json");
const adopted = json("output/imagegen-localization-220/adopted.json");
const native = json("public/app-preview/native/manifest.json");
const index = json("src/data/native-product-screens.json");
const sourcesFor = (entries) => Object.values(entries).flatMap((screen) =>
  [screen.src, ...(screen.gallery || []).map((shot) => shot.src)]);
const publishedSources = new Set(Object.values(index).flatMap(sourcesFor));
const approvedKeyboard = registry["zh-tw"]?.find((image) => native.captures.some((capture) => capture.src === image.sourceNative && capture.feature === "keyboard"));
const seen = new Set();
let count = 0;
for (const [locale, images] of Object.entries(registry)) {
  assert.ok(SITE_LOCALES.some(({ code }) => code === locale), "Unknown localized image locale.");
  for (const image of images) {
    assert.deepEqual(Object.keys(image).sort(), [...(image.displayCropBottom ? ["displayCropBottom"] : []), "height", "kind", "sourceNative", "src", "width"]);
    assert.equal(image.kind, "gpt-image-ui-edit");
    assert.match(image.src, /^\/app-preview\/localized-ui\/[a-z0-9/-]+\.webp$/);
    assert.match(image.sourceNative, /^\/app-preview\/native\/[a-z0-9/-]+\.webp$/);
    assert.ok(publishedSources.has(image.sourceNative), `Localized image refers to an unselected native source: ${image.sourceNative}`);
    const identity = `${locale}:${image.sourceNative}`;
    assert.ok(!seen.has(identity), "Each locale/source pair can have only one approved derivative.");
    seen.add(identity);
    const proof = adopted.images.find((entry) => entry.src === image.src && entry.sourceNative === image.sourceNative);
    assert.ok(proof, `Missing local review metadata: ${image.src}`);
    assert.equal(proof.review.status, "visually-accepted");
    if (locale !== "zh-tw") assert.equal(proof.review.localizationPolicy, "ui-explanations-and-results-v1", "The UI-only pilot is not a complete localized demonstration.");
    const capture = native.captures.find((entry) => entry.src === image.sourceNative);
    assert.ok(capture, `Original native source is missing: ${image.sourceNative}`);
    assert.equal(capture.originalSHA256, proof.sourceRawSHA256);
    assert.equal(sha(read(proof.sourceRaw)), proof.sourceRawSHA256, "Original screenshot changed.");
    assert.equal(sha(read(`public${image.sourceNative}`)), capture.sha256, "Original native WebP changed.");
    const edited = read(`output/imagegen-localization-220/${proof.preservedGenerated}`);
    assert.equal(sha(edited), proof.editedSHA256, "Preserved GPT Image output changed.");
    const editedSize = await sharp(edited).metadata();
    const bytes = read(`public${image.src}`);
    assert.equal(sha(bytes), proof.output.sha256, "Localized UI output changed.");
    assert.equal(bytes.length, proof.output.bytes);
    const size = await sharp(bytes).metadata();
    await sharp(bytes).raw().toBuffer();
    assert.equal(size.format, "webp");
    assert.equal(size.width, image.width);
    assert.equal(size.height, image.height);
    assert.equal(size.width, editedSize.width, "Do not upscale the generated output.");
    assert.equal(size.height, editedSize.height);
    assert.ok(size.width >= 2 * 360, "Localized UI must cover the 360px display at 2x density.");
    const crop = image.displayCropBottom || 0;
    assert.ok(Number.isInteger(crop) && crop >= 0 && crop < size.height);
    if (crop) {
      assert.equal(crop, proof.review.displayCropBottom, "Display crop must have visual approval.");
      assert.deepEqual(proof.review.contentBounds, { left: 0, top: 0, width: size.width, height: size.height - crop });
    }
    const keyboardLayoutEdit = capture.feature === "keyboard" && proof.review.geometryChange === "native-keyboard-replacement";
    const reference = keyboardLayoutEdit && locale !== "zh-tw"
      ? { left: 0, top: 0, width: approvedKeyboard.width, height: approvedKeyboard.height - (approvedKeyboard.displayCropBottom || 0) }
      : { width: proof.sourceWidth, height: proof.sourceHeight };
    if (proof.review.displayReferenceBounds) assert.deepEqual(proof.review.displayReferenceBounds, reference, "Keyboard composition must follow the approved replacement, not the old native layout.");
    const ratioError = Math.abs((size.width / (size.height - crop)) / (reference.width / reference.height) - 1);
    const actualInputTargetSHA256 = locale === "pt-br" && capture.feature === "widget" && proof.inputTarget ? sha(read(proof.inputTarget)) : undefined;
    const ratioLimit = localizedUiAspectLimit({ locale, id: capture.feature, sourceNative: image.sourceNative, sourceRawSHA256: proof.sourceRawSHA256, inputTargetSHA256: proof.inputTargetSHA256, actualInputTargetSHA256, editedSHA256: proof.editedSHA256, sourceWidth: proof.sourceWidth, sourceHeight: proof.sourceHeight, width: size.width, height: size.height, crop, keyboardLayoutEdit });
    assert.ok(ratioError < ratioLimit, "Edited UI display aspect ratio differs from its approved composition.");
    count++;
  }
}
if (process.argv.includes("--complete")) {
  const shared = new Set(json("src/data/shared-example-screens.json"));
  const sources = sourcesFor(index["zh-tw"]);
  for (const { code } of SITE_LOCALES.filter(({ code }) => code !== "zh-tw"))
    for (const source of sources)
      assert.ok(shared.has(source) || registry[code]?.some((image) => image.sourceNative === source), `Missing reviewed localized image: ${code}:${source}`);
  console.log(`Presentation image coverage passed: ${SITE_LOCALES.length} locales; native source language stays explicit for shared document examples.`);
}
console.log(`Localized UI checks passed: ${count} reviewed derivative(s), exact native source/hash, generated-output hash, actual dimensions and aspect ratio. These are edited UI images, not unedited native captures.`);
