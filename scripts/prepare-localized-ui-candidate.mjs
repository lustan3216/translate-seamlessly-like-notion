import assert from "node:assert/strict";
import { readFile, writeFile, mkdir, copyFile, rename } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import sharp from "sharp";
import { SITE_LOCALES } from "../src/lib/site-config.mjs";
import { localizedUiAspectLimit } from "./localized-ui-aspect-policy.mjs";

// Only packages an already generated and visually reviewed output; never edits UI pixels.
const [locale, id, generatedPath, reviewPath] = process.argv.slice(2);
assert.ok(SITE_LOCALES.some(({ code }) => code === locale) && locale !== "zh-tw", "Expected an assigned new locale.");
const json = async (file) => JSON.parse(await readFile(file, "utf8"));
const sha = (bytes) => createHash("sha256").update(bytes).digest("hex");
const catalog = await json("output/imagegen-localization-all/catalog.json");
const source = catalog.find((item) => item.id === id && !item.sharedExample);
assert.ok(source, "Unknown or shared-only source.");
const review = await json(reviewPath);
assert.equal(review.status, "visually-accepted");
assert.equal(review.locale, locale);
assert.equal(review.sourceNative, source.sourceNative);
assert.equal(review.localizationPolicy, source.localizationPolicy, "Use the current full localization policy, not the earlier UI-only pilots.");
assert.ok(review.reviewedBy && review.comparison && review.uiTranslations && review.contentTranslations && review.protectedContent && review.prompt);
const original = await readFile(source.sourceRaw);
assert.equal(sha(original), source.sourceRawSHA256);
const input = await readFile(source.inputTarget);
assert.equal(sha(input), source.inputTargetSHA256);
const generated = await readFile(generatedPath);
const size = await sharp(generated).metadata();
assert.equal(size.format, "png", "Preserve the actual generated PNG.");
assert.ok(size.width >= 720, "Output must cover a 360 CSS px display at 2x.");
const crop = review.displayCropBottom || 0;
assert.ok(Number.isInteger(crop) && crop >= 0 && crop < size.height);
assert.deepEqual(review.contentBounds, { left: 0, top: 0, width: size.width, height: size.height - crop });
const keyboardLayoutEdit = source.feature === "keyboard" && source.geometryChange === "native-keyboard-replacement" && review.geometryChange === source.geometryChange;
// Localizations follow the approved replacement keyboard, whose height changed from the native capture.
const reference = keyboardLayoutEdit ? source.inputDisplayBounds : { width: source.sourceWidth, height: source.sourceHeight };
assert.ok(reference?.width > 0 && reference?.height > 0);
const ratioError = Math.abs((size.width / (size.height - crop)) / (reference.width / reference.height) - 1);
const ratioLimit = localizedUiAspectLimit({ locale, id, sourceNative: source.sourceNative, sourceRawSHA256: source.sourceRawSHA256, inputTargetSHA256: source.inputTargetSHA256, actualInputTargetSHA256: sha(input), editedSHA256: sha(generated), sourceWidth: source.sourceWidth, sourceHeight: source.sourceHeight, width: size.width, height: size.height, crop, keyboardLayoutEdit });
assert.ok(ratioError < ratioLimit, "Display aspect ratio differs from approved composition.");
const folder = `output/imagegen-localization-all/${locale}`;
const publicFolder = `public/app-preview/localized-ui/20261118/${locale}`;
await mkdir(folder, { recursive: true });
await mkdir(publicFolder, { recursive: true });
const generatedCopy = `${folder}/${id}.generated.png`;
assert.notEqual(path.resolve(generatedPath), path.resolve(generatedCopy));
await copyFile(generatedPath, generatedCopy);
const bytes = await sharp(generated).webp({ lossless: true }).toBuffer();
const src = `/app-preview/localized-ui/20261118/${locale}/${id}.webp`;
await writeFile(`public${src}`, bytes);
const registry = { src, width: size.width, height: size.height, sourceNative: source.sourceNative, kind: "gpt-image-ui-edit", ...(crop ? { displayCropBottom: crop } : {}) };
const proof = {
  ...registry, sourceRaw: source.sourceRaw, sourceRawSHA256: source.sourceRawSHA256,
  sourceWidth: source.sourceWidth, sourceHeight: source.sourceHeight, sourceCommit: source.sourceCommit,
  generatedSourcePath: generatedPath, preservedGenerated: path.relative("output/imagegen-localization-220", generatedCopy),
  editedSHA256: sha(generated), inputTarget: source.inputTarget, inputTargetSHA256: source.inputTargetSHA256,
  prompt: review.prompt, review: { ...review, ...(keyboardLayoutEdit ? { displayReferenceBounds: reference } : {}), displayAspectRatioError: ratioError },
  output: { width: size.width, height: size.height, bytes: bytes.length, sha256: sha(bytes), encoding: "lossless-webp-from-gpt-image-output", upscaled: false },
};
await writeFile(`${folder}/${id}.adoptable.json.tmp`, JSON.stringify({ registry, proof }, null, 2) + "\n");
await rename(`${folder}/${id}.adoptable.json.tmp`, `${folder}/${id}.adoptable.json`);
console.log(JSON.stringify({ locale, id, src, width: size.width, height: size.height, crop, bytes: bytes.length }));
