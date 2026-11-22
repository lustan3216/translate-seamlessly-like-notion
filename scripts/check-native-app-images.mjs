import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { websiteRoot, nativeLocales, nativeFeatures, requiredNativeFeatures, targetSourceCommit, requiredNativeLocales, requiredCurrentImages, hasRequiredNativeImages, nativeCaptureScope, deferredNativeLocales, digest, nativeMaxWidth, responsiveWidth, captureShotId, captureStem, captureIdentity, captureFreshness, nativeCoverage, validateSourceIdentity, readProvenanceArchives, validateSourceVerification, validateReviewSourceVerification, validateCaptureSet, buildNativeIndex, decodedRGB, validateBatchDate, validateNativeMetadata, validateNativePng, validateMirroringSource, validateNativeWebp } from './prepare-native-app-images.mjs';

const json = async (file, fallback) => existsSync(path.join(websiteRoot, file)) ? JSON.parse(await readFile(path.join(websiteRoot, file), 'utf8')) : fallback;
const label = (locale, feature) => `${locale}/${feature}`;
function checkRequiredNativeImageGate() {
  const captures = [...requiredCurrentImages].map((identity) => {
    const [locale, feature, shotId] = identity.split('/');
    return { locale, feature, shotId };
  });
  assert.ok(hasRequiredNativeImages(captures), 'All 19 required identities can be complete.');
  assert.ok(!hasRequiredNativeImages(captures.filter((capture) => captureIdentity(capture) !== 'zh-tw/screen-translation/screen-text')), '11 primaries with only 7 gallery shots must stay partial.');
  assert.ok(!hasRequiredNativeImages([...captures, captures[0]]), 'A duplicate cannot replace a required image.');
  assert.ok(!hasRequiredNativeImages([...captures, { locale: 'zh-tw', feature: 'chat', shotId: 'extra' }]), 'Unexpected images cannot pass the exact review set.');
}
function validateExcludedHistory(captures, excludedCaptures) {
  for (const excluded of excludedCaptures) {
    const active = captures.find((capture) => captureIdentity(capture) === excluded.identity);
    if (!active) continue;
    assert.ok(/^[a-f0-9]{64}$/.test(excluded.originalSHA256 ?? '') && /^[a-f0-9]{64}$/.test(active.originalSHA256 ?? ''), `Cannot distinguish historical and replacement screenshots without original SHA-256: ${excluded.identity}`);
    assert.notEqual(active.originalSHA256, excluded.originalSHA256, `Excluded historical screenshot is still active: ${excluded.identity}`);
  }
}
function checkExcludedHistoryGate() {
  const oldHash = 'a'.repeat(64), newHash = 'b'.repeat(64);
  const active = { locale: 'zh-tw', feature: 'chat', shotId: 'primary', originalSHA256: newHash };
  const excluded = { identity: 'zh-tw/chat/primary', originalSHA256: oldHash };
  assert.doesNotThrow(() => validateExcludedHistory([active], [excluded]));
  assert.throws(() => validateExcludedHistory([{ ...active, originalSHA256: oldHash }], [excluded]), /Excluded historical screenshot is still active/);
  assert.throws(() => validateExcludedHistory([active], [{ identity: excluded.identity }]), /without original SHA-256/);
  assert.throws(() => validateExcludedHistory([{ ...active, originalSHA256: undefined }], [excluded]), /without original SHA-256/);
}
function checkPublishedNativeSelection(captures, index) {
  for (const [feature, shotId] of [['chat', 'chat-scenario'], ['screen-translation', 'screen-text']]) {
    const selected = captures.find((capture) => capture.locale === 'zh-tw' && capture.feature === feature && captureShotId(capture) === shotId);
    const published = index['zh-tw']?.[feature];
    if (selected) {
      assert.equal(published?.src, selected.src, `Publish the reviewed native ${shotId} screenshot for ${feature}.`);
      assert.equal(published.alt, selected.alt, `Published description must match the actual ${shotId} screenshot.`);
      assert.ok(!published.gallery?.some((capture) => capture.src === selected.src), `The displayed ${feature} image must not repeat in its gallery.`);
      if (feature === 'screen-translation') assert.ok(published.gallery?.some((capture) => capture.shotId === 'setup'), 'The actual screen-text result must retain the verified setup screenshot in its gallery.');
    } else {
      assert.equal(published, undefined, `Missing reviewed ${feature} screenshot must not fall back to the withheld example.`);
    }
    const withoutSelected = captures.filter((capture) => !(capture.locale === 'zh-tw' && capture.feature === feature && captureShotId(capture) === shotId));
    assert.equal(buildNativeIndex(withoutSelected)['zh-tw']?.[feature], undefined, `Removing ${shotId} must hide ${feature}, never restore its withheld primary.`);
    const withheld = captures.find((capture) => capture.locale === 'zh-tw' && capture.feature === feature && captureShotId(capture) === 'primary');
    if (withheld) {
      for (const src of [withheld.src, ...(withheld.responsiveVariants ?? []).map((variant) => variant.src)]) {
        assert.ok(!JSON.stringify(index).includes(src), `Withheld media must not remain in the published image index: ${src}`);
      }
    }
  }
}
async function check() {
  checkRequiredNativeImageGate();
  checkExcludedHistoryGate();
  const manifest = await json('public/app-preview/native/manifest.json', { status: 'awaiting-capture', captures: [] });
  const index = await json('src/data/native-product-screens.json', {});
  assert.ok(Array.isArray(manifest.captures), 'Native manifest must contain captures[].');
  assert.equal(nativeLocales.length, 19); assert.equal(requiredNativeFeatures.length, 11); assert.ok(nativeFeatures.includes('table') && nativeFeatures.includes('screen-translation') && !nativeFeatures.includes('agent'));
  const required = requiredNativeLocales.length * requiredNativeFeatures.length;
  const verified = new Set();
  const verifiedImages = new Set();
  const currentMain = new Set();
  const verifiedReviewImages = new Set();
  if (manifest.captures.length) {
    validateBatchDate(manifest.captureBatchDate);
    assert.equal(manifest.nativeCapture, true, 'A populated native manifest must identify authentic native captures.');
    assert.equal(manifest.scope, nativeCaptureScope, 'Manifest scope must match the explicitly authorized local review.');
    assert.deepEqual(manifest.requiredLocales, requiredNativeLocales, 'Manifest required locales must match the explicitly authorized local review.');
    assert.deepEqual(manifest.deferredLocales, deferredNativeLocales, 'All other supported locales must remain deferred without fallback.');
    assert.deepEqual(manifest.requiredFeatures, requiredNativeFeatures, 'Required features must match the selected current main inventory.');
    assert.equal(manifest.targetSourceCommit, targetSourceCommit, 'Manifest must target the selected current main source.');
    validateSourceIdentity(manifest.captures, await readProvenanceArchives(manifest.provenanceArchives));
    validateCaptureSet(manifest.captures.map((capture) => ({ ...capture, sha256: capture.originalSHA256 })));
  }
  for (const capture of manifest.captures) {
    const id = captureIdentity(capture);
    const stem = captureStem(capture);
    assert.ok(!verifiedImages.has(id), `Duplicate native capture: ${id}`);
    const raw = { ...capture, sha256: capture.originalSHA256, width: capture.originalWidth, height: capture.originalHeight };
    validateNativeMetadata(raw, manifest.captureBatchDate);
    if (capture.sourceVerification) {
      assert.ok(capture.sourceVerification.path.startsWith('output/native-captures/source-verification/'), `Published metadata must not expose an absolute receipt path: ${id}`);
      const source = await validateSourceVerification(capture);
      assert.deepEqual(capture.sourceVerification, source.descriptor, `Source receipt must be independently verified rather than declared: ${id}`);
    }
    const reviewSource = await validateReviewSourceVerification(capture);
    if (reviewSource) {
      assert.deepEqual(capture.reviewSourceVerification, reviewSource.review.descriptor, `Additional source review proof was not verified: ${id}`);
      assert.deepEqual(capture.installedSourceGuard, reviewSource.guard.descriptor, `Additional source guard was not verified: ${id}`);
      await assert.rejects(validateReviewSourceVerification({ ...capture, reviewSourceVerification: { ...capture.reviewSourceVerification, sha256: '0'.repeat(64) } }), /proof hash is not approved/, 'A declared but wrong review-proof hash must fail.');
      await assert.rejects(validateReviewSourceVerification({ ...capture, installedSourceGuard: { ...capture.installedSourceGuard, sha256: '0'.repeat(64) } }), /proof hash is not approved/, 'A declared but wrong installed guard must fail.');
      await assert.rejects(validateReviewSourceVerification({ ...capture, originalSHA256: '0'.repeat(64) }), /exact Root-approved screen-text PNG/, 'A different screenshot cannot borrow the additional-source approval.');
      await assert.rejects(validateReviewSourceVerification({ ...capture, capturedAt: '2026-11-17T00:00:00Z' }), /strictly equal|predates|Expected values/, 'A screenshot cannot predate its own source/readiness evidence.');
    }
    assert.equal(capture.freshness, captureFreshness(capture), `Incorrect current-main freshness claim: ${id}`);
    assert.ok(requiredNativeLocales.includes(capture.locale), `A deferred locale cannot be included in this local review: ${id}`);
    assert.equal(capture.nativeCapture, true, `Non-native capture in native manifest: ${id}`);
    assert.ok(typeof capture.rawPath === 'string' && capture.rawPath.startsWith('output/native-captures/') && !capture.rawPath.split('/').includes('..'), `Raw PNG must remain in project capture output: ${id}`);
    assert.ok(capture.rawPath.endsWith(`/${capture.locale}/${stem}.png`), `Raw PNG path must match its locale, feature and shotId: ${id}`);
    const screenBytes = await readFile(path.join(websiteRoot, capture.rawPath));
    await validateNativePng(screenBytes, raw);
    if (capture.captureMethod === 'iphone-mirroring') {
      assert.ok(typeof capture.rawWindowPath === 'string' && capture.rawWindowPath.startsWith('output/native-captures/') && !capture.rawWindowPath.split('/').includes('..') && capture.rawWindowPath.endsWith(`/${capture.locale}/${stem}-window.jpg`), `Missing preserved original Mirroring JPEG: ${id}`);
      const windowPath = path.join(websiteRoot, capture.rawWindowPath);
      const windowStat = await stat(windowPath);
      const pixels = await validateMirroringSource(await readFile(windowPath), screenBytes, raw, windowStat.mtimeMs);
      assert.equal(pixels, capture.viewportPixelSHA256, `Viewport RGB proof differs from the verified source crop: ${id}`);
    }
    assert.ok(typeof capture.src === 'string' && capture.src.startsWith('/app-preview/native/') && !capture.src.split('/').includes('..'), `Native image cannot point to an old asset or another locale: ${id}`);
    assert.ok(capture.src.endsWith(`/${capture.locale}/${stem}.webp`), `Native path must match its exact locale, feature and shotId: ${id}`);
    const bytes = await readFile(path.join(websiteRoot, 'public', capture.src));
    assert.equal(bytes.length, capture.bytes, `WebP byte count mismatch: ${id}`);
    assert.equal(digest(bytes), capture.sha256, `WebP hash mismatch: ${id}`);
    assert.equal(capture.encoding, 'lossless-webp', `Native output must declare lossless encoding: ${id}`);
    const output = await validateNativeWebp(bytes, screenBytes, nativeMaxWidth, id);
    assert.equal(output.width, capture.width); assert.equal(output.height, capture.height);
    assert.equal(output.decodedRGBSHA256, capture.decodedRGBSHA256, `Output RGB proof differs from the verified source raster: ${id}`);
    assert.equal(digest(await decodedRGB(screenBytes)), capture.originalRGBSHA256, `Original RGB proof differs from the preserved PNG: ${id}`);
    assert.equal(capture.fullResolutionPixelPreserved, capture.originalWidth <= nativeMaxWidth, `Incorrect native pixel-preservation claim: ${id}`);
    if (capture.fullResolutionPixelPreserved) assert.equal(capture.decodedRGBSHA256, capture.originalRGBSHA256, `Native resolution WebP pixels must match the raw PNG exactly: ${id}`);
    const temporary = capture.captureMethod === 'iphone-mirroring';
    assert.equal(capture.resolutionStatus, temporary ? 'temporary-low-resolution-mirroring' : 'native-resolution', `Incorrect resolution status: ${id}`);
    assert.equal(capture.replacementRequired, temporary, `Mirroring must remain marked for native-resolution replacement: ${id}`);
    assert.ok(Array.isArray(capture.responsiveVariants), `Missing responsive variant records: ${id}`);
    assert.ok(capture.responsiveVariants.length <= (capture.originalWidth > responsiveWidth ? 1 : 0), `Incorrect responsive variant coverage: ${id}`);
    for (const variant of capture.responsiveVariants) {
      assert.equal(variant.src, capture.src.replace(/\.webp$/, `-${responsiveWidth}.webp`), `Responsive path must match its exact capture: ${id}`);
      assert.equal(variant.encoding, 'lossless-webp', `Responsive output must declare lossless encoding: ${id}`);
      const variantBytes = await readFile(path.join(websiteRoot, 'public', variant.src));
      assert.equal(variantBytes.length, variant.bytes, `Responsive WebP byte count mismatch: ${id}`);
      assert.ok(variant.bytes < capture.bytes, `Responsive WebP must save bytes over the full-resolution image: ${id}`);
      assert.equal(digest(variantBytes), variant.sha256, `Responsive WebP hash mismatch: ${id}`);
      const variantOutput = await validateNativeWebp(variantBytes, screenBytes, responsiveWidth, `${id} responsive`);
      assert.equal(variantOutput.width, variant.width); assert.equal(variantOutput.height, variant.height);
      assert.equal(variantOutput.decodedRGBSHA256, variant.decodedRGBSHA256, `Responsive RGB proof differs from the source raster: ${id}`);
    }
    const srcSet = capture.responsiveVariants.length ? `${capture.responsiveVariants[0].src} ${capture.responsiveVariants[0].width}w, ${capture.src} ${capture.width}w` : undefined;
    assert.equal(capture.srcSet, srcSet, `srcSet must reference exactly the verified responsive and full images: ${id}`);
    verifiedImages.add(id);
    if (['current-main', 'verified-review-source'].includes(captureFreshness(capture))) verifiedReviewImages.add(id);
    if (captureShotId(capture) === 'primary') verified.add(label(capture.locale, capture.feature));
    if (captureShotId(capture) === 'primary' && captureFreshness(capture) === 'current-main') currentMain.add(label(capture.locale, capture.feature));
  }
  assert.deepEqual(index, buildNativeIndex(manifest.captures), 'Native primary/gallery index differs from verified captures or contains a fallback.');
  checkPublishedNativeSelection(manifest.captures, index);
  if (manifest.captures.length) {
    assert.equal(manifest.requiredCaptureCount, required, 'Required coverage must match the explicitly authorized locales and all features.');
    assert.equal(manifest.verifiedCaptureCount, verified.size, 'Coverage must count only primary locale/feature captures.');
    if (manifest.verifiedImageCount !== undefined) assert.equal(manifest.verifiedImageCount, verifiedImages.size, 'Image count must include each primary and gallery shot exactly once.');
    for (const [field, count] of Object.entries(nativeCoverage(manifest.captures))) assert.equal(manifest[field], count, `Native source/freshness coverage differs: ${field}`);
  }
  validateExcludedHistory(manifest.captures, manifest.excludedCaptures ?? []);
  for (const [locale, entries] of Object.entries(index)) {
    assert.ok(nativeLocales.includes(locale), `Unknown native index locale: ${locale}`);
    assert.ok(entries && typeof entries === 'object' && !Array.isArray(entries), `Invalid native locale index: ${locale}`);
    for (const feature of Object.keys(entries)) assert.ok(verified.has(label(locale, feature)), `Unverified index entry or fallback: ${label(locale, feature)}`);
  }
  const missing = requiredNativeLocales.map((locale) => ({ locale, features: requiredNativeFeatures.filter((feature) => !verified.has(label(locale, feature))) })).filter(({ features }) => features.length);
  const currentMissing = requiredNativeLocales.map((locale) => ({ locale, features: requiredNativeFeatures.filter((feature) => !currentMain.has(label(locale, feature))) })).filter(({ features }) => features.length);
  const coverage = nativeCoverage(manifest.captures);
  if (coverage.verifiedReviewImageCount !== undefined) {
    assert.deepEqual(manifest.captureSourceCommits, [...new Set(manifest.captures.map((capture) => capture.sourceCommit))].sort(), 'The actual mixed-source set must be explicit.');
    assert.deepEqual(manifest.captureSourceImageCounts, Object.fromEntries(manifest.captureSourceCommits.map((commit) => [commit, manifest.captures.filter((capture) => capture.sourceCommit === commit).length])), 'Source counts must retain each actual screenshot commit.');
    assert.equal(coverage.verifiedReviewImageCount, verifiedReviewImages.size, 'Verified review count must include only the explicitly approved actual sources.');
  }
  const replacements = manifest.captures.filter(({ replacementRequired }) => replacementRequired);
  console.log(`Native source metadata/bytes: ${verified.size}/${required} draft primary captures and ${verifiedImages.size - verified.size} gallery images validated (${nativeCaptureScope}; requiredLocales=${JSON.stringify(requiredNativeLocales)} × ${requiredNativeFeatures.length} features).`);
  console.log(`Independent artifact source receipts: ${coverage.sourceVerifiedCaptureCount} primary captures, ${coverage.sourceVerifiedImageCount} total images.`);
  console.log(`Current main ${targetSourceCommit}: ${currentMain.size}/${required} primary captures, ${coverage.currentMainImageCount}/${verifiedImages.size} preserved images; ${coverage.historicalDraftCaptureCount} historical draft primaries and ${coverage.historicalDraftImageCount} historical images.`);
  const publishedImages = Object.values(index).flatMap((entries) => Object.values(entries).flatMap((entry) => [entry, ...(entry.gallery ?? [])]));
  console.log(`Published native App images: ${new Set(publishedImages.map((entry) => entry.src)).size} distinct screenshots; attributed photo/video examples stay withheld from the page index.`);
  if (coverage.verifiedReviewImageCount !== undefined) console.log(`Verified native review: ${coverage.verifiedReviewImageCount}/19 images; actual source counts ${JSON.stringify(manifest.captureSourceImageCounts)}. Additional-source images are not relabelled as the content baseline.`);
  console.log(`Deferred locales: ${deferredNativeLocales.length}; no fallback and no claim of completed screenshots for those locales.`);
  assert.deepEqual(verifiedReviewImages, requiredCurrentImages, `Native review requires all 19 exact zh-tw primary/gallery identities; missing: ${[...requiredCurrentImages].filter((id) => !verifiedReviewImages.has(id)).join(', ') || 'none'}.`);
  if (currentMissing.length || coverage.staleImageCount || replacements.length) {
    console.error(`Incomplete current-main capture set: ${required - currentMain.size} current-source primary captures missing, ${coverage.staleImageCount} active images are historical/source-unverified/low-resolution, ${replacements.length} temporary Mirroring captures need replacement; status=${manifest.status || 'unknown'}.`);
    for (const entry of currentMissing) console.error(`- current main missing ${entry.locale}: ${entry.features.join(', ')}`);
    for (const entry of missing) console.error(`- no draft image ${entry.locale}: ${entry.features.join(', ')}`);
    for (const entry of replacements) console.error(`- replace temporary lower-resolution capture: ${captureIdentity(entry)}`);
    process.exitCode = 1;
  } else {
    assert.equal(manifest.status, 'complete', 'Complete coverage must be marked complete by the verified importer.');
    console.log('Native App image checks passed: independently verified actual-source receipts, exact locale coverage, raw PNG hashes and full-frame WebP output. Actual screen content and interaction still need visual review.');
  }
}
check().catch((error) => { console.error(`Native App image verification failed: ${error.message}`); process.exitCode = 1; });
