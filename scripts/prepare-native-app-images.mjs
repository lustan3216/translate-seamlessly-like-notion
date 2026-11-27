import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { constants, existsSync } from 'node:fs';
import { copyFile, mkdir, readFile, stat, utimes, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import sharp from 'sharp';
import { SITE_LOCALES } from '../src/lib/site-config.mjs';
import { currentMainFeatures, mainSourceCommit } from '../src/data/main-current.mjs';
import { additionalScreenTextSource } from './native-capture-review-policy.mjs';

export const websiteRoot = fileURLToPath(new URL('../', import.meta.url));
export const nativeLocales = SITE_LOCALES.map(({ code }) => code);
// browser-translation is shown only through its real-device demo video (app-demo-videos.json); no page renders a native still for it.
const videoOnlyFeatures = new Set(['browser-translation']);
export const requiredNativeFeatures = currentMainFeatures.map(({ id }) => id).filter((id) => !videoOnlyFeatures.has(id));
export const nativeFeatures = requiredNativeFeatures;
export const targetSourceCommit = mainSourceCommit;
export const requiredNativeLocales = ['zh-tw'];
export const requiredCurrentImages = new Set([
  ...requiredNativeFeatures.map((feature) => `zh-tw/${feature}/primary`),
  'zh-tw/chat/chat-entry', 'zh-tw/chat/chat-scenario',
  'zh-tw/screen-translation/screen-text', 'zh-tw/screen-translation/setup',
  'zh-tw/menu/options', 'zh-tw/menu/staff',
  'zh-tw/document/original', 'zh-tw/table/cell-source',
]);
export const nativeCaptureScope = '繁中本地 review';
export const deferredNativeLocales = nativeLocales.filter((locale) => !requiredNativeLocales.includes(locale));
export const pngSignature = '89504e470d0a1a0a';
export const digest = (data) => createHash('sha256').update(data).digest('hex');
const dateFormat = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Minsk', year: 'numeric', month: '2-digit', day: '2-digit' });
const platforms = ['ios-device', 'ios-simulator', 'macos-app'];
const methods = ['device-screenshot', 'devicectl-screenshot', 'iphone-mirroring', 'simctl-screenshot', 'native-window-screenshot'];
export const mirrorViewport = { left: 16, top: 77, width: 664, height: 1440 };
export const mirrorWindowSize = { width: 696, height: 1532 };
export const nativeMaxWidth = 1440;
export const responsiveWidth = 768;
const unsupportedSource = /(?:seed(?:ed)?|demo|fixture|golden|replay|synthetic|illustration|image[-_ ]?gen|\bai\b)/i;
export const captureShotId = (capture) => capture.shotId ?? 'primary';
export const captureStem = (capture) => `${capture.feature}${captureShotId(capture) === 'primary' ? '' : `-${captureShotId(capture)}`}`;
export const captureIdentity = (capture) => `${capture.locale}/${capture.feature}/${captureShotId(capture)}`;
export const isAdditionalReviewCapture = (capture) => targetSourceCommit === additionalScreenTextSource.baselineSourceCommit
  && captureIdentity(capture) === additionalScreenTextSource.identity && capture.sourceCommit === additionalScreenTextSource.sourceCommit;
export const captureFreshness = (capture) => capture.sourceCommit === targetSourceCommit
  ? capture.sourceVerification?.verified !== true ? 'source-unverified'
    : capture.replacementRequired ? 'current-main-low-resolution' : 'current-main'
  : isAdditionalReviewCapture(capture)
    ? capture.sourceVerification?.verified === true && capture.sourceVerification.sha256 === additionalScreenTextSource.artifactReceiptSHA256
      && capture.reviewSourceVerification?.verified === true && capture.reviewSourceVerification.sha256 === additionalScreenTextSource.reviewSourceProofSHA256
      && capture.installedSourceGuard?.verified === true && /^[a-f0-9]{64}$/.test(additionalScreenTextSource.installedSourceGuardSHA256 ?? '')
      && capture.installedSourceGuard.sha256 === additionalScreenTextSource.installedSourceGuardSHA256
      && !capture.replacementRequired ? 'verified-review-source' : 'source-unverified'
    : 'historical-draft';
export const screenIndexEntry = (capture) => ({ src: capture.src, width: capture.width, height: capture.height, sourceCommit: capture.sourceCommit, freshness: captureFreshness(capture), ...(capture.srcSet ? { srcSet: capture.srcSet } : {}), ...(capture.alt ? { alt: capture.alt } : {}) });

export function validateSourceIdentity(captures, previous) {
  const sources = new Map();
  for (const capture of previous) {
    const hash = capture.originalSHA256 ?? capture.sha256;
    const existing = sources.get(hash);
    if (existing) {
      assert.equal(capture.sourceCommit, existing.sourceCommit, 'Preserved provenance records disagree on the source of identical screenshot bytes.');
      assert.equal(capture.actualVersionBuild, existing.actualVersionBuild, 'Preserved provenance records disagree on the build of identical screenshot bytes.');
    }
    sources.set(hash, capture);
  }
  for (const capture of captures) {
    const original = sources.get(capture.originalSHA256 ?? capture.sha256);
    if (!original) continue;
    assert.equal(capture.sourceCommit, original.sourceCommit, `Existing screenshot bytes cannot be relabelled as another source commit: ${captureIdentity(capture)}`);
    assert.equal(capture.actualVersionBuild, original.actualVersionBuild, `Existing screenshot bytes cannot be relabelled as another installed build: ${captureIdentity(capture)}`);
  }
}

export async function readProvenanceArchives(archives = []) {
  const captures = [];
  for (const archive of archives) {
    assert.ok(typeof archive.path === 'string' && archive.path.startsWith('output/native-captures/provenance/') && !archive.path.split('/').includes('..') && archive.path.endsWith('.json'), 'Provenance archive must remain in private local capture output.');
    const bytes = await readFile(path.join(websiteRoot, archive.path));
    assert.equal(digest(bytes), archive.sha256, 'Original provenance archive hash mismatch.');
    const original = JSON.parse(bytes);
    assert.ok(Array.isArray(original.captures), 'Provenance archive needs its original captures.');
    captures.push(...original.captures);
  }
  return captures;
}

export async function validateSourceVerification(capture, basePath = websiteRoot) {
  if (!capture.sourceVerification) return null;
  const proof = capture.sourceVerification;
  assert.ok(typeof proof.path === 'string' && proof.path.endsWith('.safe.json') && !proof.path.split(/[\\/]/).includes('..') && !/\.secrets|private_keys|^[a-z][a-z0-9+.-]*:\/\//i.test(proof.path), `Source verification must be a local safe artifact receipt: ${captureIdentity(capture)}`);
  const originalPath = path.resolve(proof.path.startsWith('output/native-captures/') ? websiteRoot : basePath, proof.path);
  const bytes = await readFile(originalPath);
  assert.equal(digest(bytes), proof.sha256, `Source receipt hash mismatch: ${captureIdentity(capture)}`);
  const receipt = JSON.parse(bytes);
  assert.equal(receipt.sourceCommit, capture.sourceCommit, `Source receipt does not match capture commit: ${captureIdentity(capture)}`);
  assert.ok(!receipt.failures?.length, `Source artifact has verification failures: ${captureIdentity(capture)}`);
  const app = receipt.bundles?.find(({ bundleId }) => bundleId === 'com.gpt.langpt');
  assert.ok(app?.signatureVerified === true && app?.routingVerified === true, `Source receipt must verify the App signature and routing: ${captureIdentity(capture)}`);
  assert.equal(`${app.version}+${app.nativeBuild}`, capture.actualVersionBuild, `Source receipt does not match installed version/build: ${captureIdentity(capture)}`);
  assert.equal(receipt.routing?.environment, capture.environment, `Source receipt environment mismatch: ${captureIdentity(capture)}`);
  if (receipt.routing?.gatewayOverride) assert.equal(new URL(receipt.routing.gatewayOverride).hostname, capture.environmentHost, `Source receipt gateway mismatch: ${captureIdentity(capture)}`);
  else assert.equal(receipt.aotRoutingVerified, true, `Default gateway needs verified compiled routing: ${captureIdentity(capture)}`);
  const localPath = `output/native-captures/source-verification/${proof.sha256}.safe.json`;
  return { originalPath, bytes, descriptor: { path: localPath, sha256: proof.sha256, verified: true } };
}

export async function validateReviewSourceVerification(capture, basePath = websiteRoot) {
  if (!isAdditionalReviewCapture(capture)) {
    assert.ok(!capture.reviewSourceVerification && !capture.installedSourceGuard, 'Additional review proofs belong only to the explicitly approved screen-text identity/source.');
    return null;
  }
  const policy = additionalScreenTextSource;
  assert.equal(capture.originalSHA256 ?? capture.sha256, policy.approvedOriginalSHA256, 'Only the exact Root-approved screen-text PNG may use the additional source.');
  assert.match(policy.installedSourceGuardSHA256 ?? '', /^[a-f0-9]{64}$/, 'The additional source still awaits a successful fresh installed-source guard.');
  assert.notEqual(policy.installedSourceGuardSHA256, policy.failedR8PreflightSHA256, 'Failed r8 preflight cannot approve a screenshot.');
  assert.equal(capture.sourceVerification?.sha256, policy.artifactReceiptSHA256, 'Additional-source artifact receipt must match the approved actual build.');
  async function readProof(reference, expectedHash, directory) {
    assert.equal(reference?.sha256, expectedHash, 'Additional-source proof hash is not approved.');
    assert.ok(typeof reference.path === 'string' && reference.path.endsWith('.safe.json') && !reference.path.split(/[\\/]/).includes('..') && !/\.secrets|private_keys|^[a-z][a-z0-9+.-]*:\/\//i.test(reference.path), 'Additional-source proof must be a local safe JSON.');
    const originalPath = path.resolve(reference.path.startsWith('output/native-captures/') ? websiteRoot : basePath, reference.path);
    const bytes = await readFile(originalPath);
    assert.equal(digest(bytes), expectedHash, 'Additional-source proof bytes changed.');
    return { originalPath, bytes, data: JSON.parse(bytes), descriptor: { path: `${directory}/${expectedHash}.safe.json`, sha256: expectedHash, verified: true } };
  }
  const review = await readProof(capture.reviewSourceVerification, policy.reviewSourceProofSHA256, 'output/native-captures/review-source-verification');
  assert.equal(review.data.identity, policy.identity);
  assert.equal(review.data.baselineSourceCommit, targetSourceCommit);
  assert.equal(review.data.sourceCommit, capture.sourceCommit);
  assert.equal(review.data.artifactReceipt.sha256, policy.artifactReceiptSHA256);
  assert.equal(review.data.nativeSurfaceProof.sha256, policy.nativeSurfaceProofSHA256);
  assert.equal(review.data.captureEvidence.sha256, policy.approvedOriginalSHA256);
  assert.equal(review.data.captureEvidence.capturedAt, capture.capturedAt);
  assert.equal(review.data.captureEvidence.rootActuallyViewedAndApproved, true);
  assert.equal(review.data.captureEvidence.pixelEdited, false);
  const config = review.data.publicConfig;
  assert.equal(config.baselineGitSHA256, policy.baselinePublicConfigSHA256, 'Baseline public config differs from the fixed review source.');
  for (const field of ['currentGitSHA256', 'artifactBundledSHA256']) assert.equal(config[field], policy.publicConfigSHA256, `Actual public config differs: ${field}`);
  const allowedChanges = Object.entries(policy.publicConfigLabelChanges).map(([locale, [baseline, current]]) => ({
    path: ['uiInformation', 'toneOptions', 3, 'titles', locale],
    jsonPointer: `/uiInformation/toneOptions/3/titles/${locale}`, baseline, current,
  }));
  assert.equal(allowedChanges.length, 15, 'Only the 15 fixed tone-title changes were reviewed.');
  assert.equal(config.exactAllowedDifferences.length, allowedChanges.length);
  assert.deepEqual(config.exactAllowedDifferences, allowedChanges, 'Existing public config labels may differ only by the fixed tone-title text changes.');
  assert.deepEqual(config.exactAppendedToneOption, policy.appendedToneOption, 'The only appended config option must match the full fixed multilingual flirty object and canonical hash.');
  assert.equal(config.remainingContentStructurallyIdentical, true, 'Every other public config value must remain identical.');
  for (const field of ['baselineWithoutAllowedChangesSHA256', 'currentWithoutAllowedChangesSHA256']) assert.equal(config[field], policy.remainingPublicConfigSHA256, `Unchanged public config differs: ${field}`);
  assert.deepEqual(review.data.unchangedSurfaceFiles.map(({ path }) => path).sort(), [...policy.unchangedSurfacePaths].sort(), 'The exact approved Screen/PiP/Broadcast/theme/string/common-component files must be reviewed.');
  assert.ok(review.data.unchangedSurfaceFiles.every((file) => /^[a-f0-9]{64}$/.test(file.baselineSHA256) && file.baselineSHA256 === file.currentSHA256), 'The approved Screen/PiP/Broadcast/theme/string surface hashes must match.');
  const surface = await readProof(review.data.nativeSurfaceProof, policy.nativeSurfaceProofSHA256, 'output/native-captures/review-source-verification');
  assert.equal(surface.data.previousSourceCommit, targetSourceCommit);
  assert.equal(surface.data.currentSourceCommit, capture.sourceCommit);
  assert.deepEqual(surface.data.publicConfig, config, 'The independent surface/config proof must match the fixed review evidence.');
  assert.deepEqual(surface.data.unchangedSurfaceFiles, review.data.unchangedSurfaceFiles, 'The independent runtime-surface hashes must match the fixed review evidence.');
  for (const field of ['screenTextImplementationChanged', 'screenTextStringsChanged', 'screenBroadcastOrPipCodeChanged', 'appThemeFileChanged', 'pixelCompatibilityRelabellingAllowed']) assert.equal(surface.data[field], false, `Additional source surface changed: ${field}`);
  const guard = await readProof(capture.installedSourceGuard, policy.installedSourceGuardSHA256, 'output/native-captures/source-verification');
  assert.equal(guard.data.sourceCommit, capture.sourceCommit);
  assert.equal(`${guard.data.installedVersion}+${guard.data.installedBuild}`, capture.actualVersionBuild);
  assert.equal(guard.data.installedBundleUrlMatchesVerifiedDelivery, true);
  assert.equal(guard.data.installedOnly, true);
  assert.equal(guard.data.appRebuilt, false);
  assert.equal(guard.data.appReinstalled, false);
  assert.equal(guard.data.controllerReady, true, 'A source preflight alone does not prove that screenshot control became ready.');
  assert.equal(guard.data.httpStatus, 200);
  assert.deepEqual(guard.data.controllerStatusResponse, { status: 'ok' });
  assert.ok(Date.parse(guard.data.readyAt) <= Date.parse(capture.capturedAt), 'Screenshot predates controller readiness.');
  assert.ok(Date.parse(guard.data.checkedAt) <= Date.parse(capture.capturedAt), 'Screenshot predates its actual new-source guard.');
  const restoration = await readProof(review.data.restorationProof, policy.restorationProofSHA256, 'output/native-captures/source-verification');
  const batchEnd = await readProof(review.data.batchEndProof, policy.batchEndProofSHA256, 'output/native-captures/source-verification');
  assert.equal(restoration.data.sourceCommit, capture.sourceCommit);
  assert.equal(restoration.data.rootStopConfirmed, true);
  assert.equal(restoration.data.captureGuard.sha256, policy.installedSourceGuardSHA256);
  assert.equal(restoration.data.batchEnd.sha256, policy.batchEndProofSHA256);
  assert.equal(restoration.data.proxyPort22088Closed, true);
  assert.equal(restoration.data.buildLockIdleVerified, true);
  assert.equal(batchEnd.data.sourceCommit, capture.sourceCommit);
  assert.equal(batchEnd.data.installedAssociationUnchanged, true);
  assert.equal(batchEnd.data.installedBundleUrl, guard.data.installedBundleUrl);
  assert.equal(`${batchEnd.data.installedVersion}+${batchEnd.data.installedBuild}`, capture.actualVersionBuild);
  assert.equal(restoration.data.stopEvidence.sha256, policy.stopEvidenceSHA256);
  assert.equal(review.data.stopEvidence.sha256, policy.stopEvidenceSHA256);
  assert.equal(review.data.stopEvidence.rootActuallyViewedAndConfirmedStopped, true);
  assert.ok(Date.parse(capture.capturedAt) <= Date.parse(review.data.stopEvidence.capturedAt), 'Stopped-state evidence must follow this screenshot.');
  assert.ok(Date.parse(review.data.stopEvidence.capturedAt) <= Date.parse(batchEnd.data.checkedAt), 'Batch-end readback must follow the stopped state.');
  assert.ok(Date.parse(batchEnd.data.checkedAt) <= Date.parse(restoration.data.closedAt), 'Controller cleanup must follow the batch-end readback.');
  const stopPath = path.resolve(websiteRoot, restoration.data.stopEvidence.path);
  assert.ok(stopPath.startsWith(path.join(websiteRoot, 'output/native-captures') + path.sep) && stopPath.endsWith('.png'), 'Stopped-state PNG must remain in local capture output.');
  assert.equal(digest(await readFile(stopPath)), policy.stopEvidenceSHA256, 'Stopped-state PNG bytes changed.');
  return { review, surface, guard, restoration, batchEnd };
}

export function nativeCoverage(captures) {
  const primary = captures.filter((capture) => captureShotId(capture) === 'primary');
  const current = captures.filter((capture) => captureFreshness(capture) === 'current-main');
  const currentPrimary = current.filter((capture) => captureShotId(capture) === 'primary');
  const additional = captures.filter((capture) => captureFreshness(capture) === 'verified-review-source');
  const historical = captures.filter((capture) => captureFreshness(capture) === 'historical-draft');
  const verified = captures.filter((capture) => capture.sourceVerification?.verified === true);
  return {
    requiredCaptureCount: requiredNativeLocales.length * requiredNativeFeatures.length,
    verifiedCaptureCount: primary.length,
    verifiedImageCount: captures.length,
    sourceVerifiedCaptureCount: verified.filter((capture) => captureShotId(capture) === 'primary').length,
    sourceVerifiedImageCount: verified.length,
    currentMainCaptureCount: currentPrimary.length,
    currentMainImageCount: current.length,
    historicalDraftCaptureCount: historical.filter((capture) => captureShotId(capture) === 'primary').length,
    historicalDraftImageCount: historical.length,
    staleImageCount: captures.length - current.length - additional.length,
    ...(additional.length ? { verifiedReviewImageCount: current.length + additional.length } : {}),
  };
}

export function hasRequiredNativeImages(captures) {
  const identities = new Set(captures.map(captureIdentity));
  return captures.length === identities.size && identities.size === requiredCurrentImages.size
    && [...requiredCurrentImages].every((identity) => identities.has(identity));
}

export function validateCaptureSet(captures) {
  const identities = new Set();
  const paths = new Set();
  const groups = new Map();
  const scanHashes = new Map();
  for (const capture of captures) {
    const shotId = captureShotId(capture);
    assert.ok(typeof shotId === 'string' && /^[a-z][a-z0-9-]{0,39}$/.test(shotId), 'shotId must be a lowercase filename-safe slug of at most 40 characters.');
    const id = captureIdentity(capture);
    assert.ok(!identities.has(id), `Duplicate capture: ${id}`); identities.add(id);
    for (const stem of [captureStem(capture), `${captureStem(capture)}-${responsiveWidth}`]) {
      const asset = `${capture.locale}/${stem}`;
      assert.ok(!paths.has(asset), `Capture filename or responsive filename collision: ${asset}`); paths.add(asset);
    }
    const groupId = `${capture.locale}/${capture.feature}`;
    const group = groups.get(groupId) || [];
    assert.ok(!group.some(({ sha256 }) => sha256 === capture.sha256), `Primary and gallery need distinct original PNGs: ${groupId}`);
    group.push(capture); groups.set(groupId, group);
    if (['photos', 'menu', 'document', 'table'].includes(capture.feature)) {
      const hashId = `${capture.locale}/${capture.sha256}`;
      assert.ok(!scanHashes.has(hashId), `Photo/OCR, menu, document and table shots need distinct original PNGs: ${id} duplicates ${scanHashes.get(hashId)}`);
      scanHashes.set(hashId, id);
    }
  }
  for (const [id, group] of groups) assert.equal(group.filter((capture) => captureShotId(capture) === 'primary').length, 1, `Each feature gallery needs exactly one primary capture: ${id}`);
  return groups.size;
}

export function buildNativeIndex(captures) {
  const index = {};
  for (const capture of captures.filter((entry) => captureShotId(entry) === 'primary')) {
    // Publish reviewed native results while attributed photo/video examples remain withheld.
    const displayShot = { 'zh-tw/chat': 'chat-scenario', 'zh-tw/screen-translation': 'screen-text' }[`${capture.locale}/${capture.feature}`] ?? 'primary';
    const group = captures.filter((entry) => entry.locale === capture.locale && entry.feature === capture.feature);
    const display = group.find((entry) => captureShotId(entry) === displayShot);
    if (!display) continue;
    const gallery = group.filter((entry) => !['primary', displayShot].includes(captureShotId(entry)))
      .map((entry) => ({ shotId: captureShotId(entry), ...screenIndexEntry(entry) }));
    index[capture.locale] ||= {};
    index[capture.locale][capture.feature] = { ...screenIndexEntry(display), ...(gallery.length ? { gallery } : {}) };
  }
  return index;
}

export function validateBatchDate(date) {
  assert.ok(typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date), 'captureBatchDate must be an explicit YYYY-MM-DD date for this capture job.');
  assert.ok(Number.isFinite(Date.parse(`${date}T00:00:00Z`)) && new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) === date, 'Invalid captureBatchDate.');
  assert.ok(date <= dateFormat.format(new Date()), 'captureBatchDate cannot be in the future.');
}

export function validateNativeMetadata(capture, batchDate) {
  const label = `${capture.locale || 'unknown'}/${capture.feature || 'unknown'}/${captureShotId(capture)}`;
  if (capture.alt !== undefined) assert.ok(typeof capture.alt === 'string' && capture.alt.trim().length > 0, `Optional alt must be meaningful localized text: ${label}`);
  assert.ok(typeof captureShotId(capture) === 'string' && /^[a-z][a-z0-9-]{0,39}$/.test(captureShotId(capture)), `Invalid filename-safe shotId: ${label}`);
  assert.ok(nativeLocales.includes(capture.locale), `Unsupported exact locale: ${label}`);
  assert.ok(nativeFeatures.includes(capture.feature), `Unsupported feature: ${label}`);
  assert.equal(capture.captureType, 'native-app-screenshot', `Only native App screenshots are accepted: ${label}`);
  assert.ok(platforms.includes(capture.platform), `Missing or unsupported native platform: ${label}`);
  assert.ok(methods.includes(capture.captureMethod), `Missing or unsupported capture method: ${label}`);
  if (['device-screenshot', 'devicectl-screenshot'].includes(capture.captureMethod)) assert.equal(capture.platform, 'ios-device', `Device screenshot must identify its physical iPhone source: ${label}`);
  if (capture.captureMethod === 'simctl-screenshot') assert.equal(capture.platform, 'ios-simulator', `simctl capture must identify its Simulator platform: ${label}`);
  if (capture.captureMethod === 'iphone-mirroring') assert.equal(capture.platform, 'ios-device', `Mirroring must identify its physical iPhone source: ${label}`);
  if (capture.captureMethod === 'native-window-screenshot') assert.equal(capture.platform, 'macos-app', `Native Mac window capture must identify macOS: ${label}`);
  if (capture.captureMethod === 'iphone-mirroring') {
    assert.ok(typeof capture.originalWindowSHA256 === 'string' && /^[a-f0-9]{64}$/.test(capture.originalWindowSHA256), `Missing unchanged Mirroring JPEG SHA-256: ${label}`);
    assert.equal(capture.windowWidth, mirrorWindowSize.width, `Unverified Mirroring window width: ${label}`);
    assert.equal(capture.windowHeight, mirrorWindowSize.height, `Unverified Mirroring window height: ${label}`);
    assert.deepEqual(capture.viewportCrop, mirrorViewport, `Only the confirmed full iPhone viewport may be extracted: ${label}`);
  } else {
    assert.ok(!capture.viewportCrop && !capture.originalWindowPath && !capture.originalWindowSHA256, `Window extraction is only supported with verified iphone-mirroring provenance: ${label}`);
  }
  for (const field of ['captureType', 'captureMethod', 'sourceType', 'mode', 'dataMode', 'contentOrigin', 'evidenceType']) {
    if (typeof capture[field] === 'string') assert.ok(!unsupportedSource.test(capture[field]), `Non-native or seeded provenance (${field}): ${label}`);
  }
  for (const field of ['seeded', 'demoMode', 'fixture', 'golden', 'replay', 'aiGenerated', 'synthetic', 'pixelEdited']) {
    assert.ok(!capture[field], `Unsupported capture flag (${field}): ${label}`);
  }
  assert.ok(typeof capture.capturedAt === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(capture.capturedAt), `capturedAt must be a timezone-qualified ISO timestamp: ${label}`);
  const time = Date.parse(capture.capturedAt);
  assert.ok(Number.isFinite(time) && time <= Date.now(), `Invalid or future capturedAt: ${label}`);
  assert.ok(dateFormat.format(new Date(time)) >= batchDate, `Capture predates the declared capture job: ${label}`);
  assert.ok(typeof capture.actualVersionBuild === 'string' && /^\d+\.\d+\.\d+(?:-[\w.-]+)?\+\d+$/.test(capture.actualVersionBuild), `Missing actual installed version+build: ${label}`);
  assert.ok(typeof capture.sourceCommit === 'string' && /^[a-f0-9]{40}$/.test(capture.sourceCommit), `Missing exact source commit: ${label}`);
  assert.ok(['development', 'preview', 'production'].includes(capture.environment), `Missing verified environment: ${label}`);
  assert.ok(typeof capture.environmentHost === 'string' && /^(?=.{1,253}$)[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?\.[a-z0-9-]+$/i.test(capture.environmentHost) && !capture.environmentHost.includes('..'), `environmentHost must be a hostname without protocol, credentials, path or query: ${label}`);
  assert.ok(typeof capture.sha256 === 'string' && /^[a-f0-9]{64}$/.test(capture.sha256), `Missing original PNG SHA-256: ${label}`);
  assert.ok(Number.isInteger(capture.width) && capture.width > 0 && Number.isInteger(capture.height) && capture.height > 0, `Missing actual pixel dimensions: ${label}`);
}

export async function validateNonBlankImage(bytes, label) {
  const stats = await sharp(bytes).flatten({ background: '#ffffff' }).stats();
  assert.ok(stats.channels.some(({ stdev }) => stdev > 0.5), `Blank or near-uniform image rejected: ${label}. A successful capture command is not evidence of a usable App screen; unlock and inspect the actual result.`);
}

export async function validateNativePng(bytes, capture) {
  const label = `${capture.locale}/${capture.feature}`;
  assert.equal(bytes.subarray(0, 8).toString('hex'), pngSignature, `Source must be an actual PNG: ${label}`);
  assert.equal(digest(bytes), capture.sha256, `Original PNG hash mismatch: ${label}`);
  const image = await sharp(bytes).metadata();
  assert.equal(image.format, 'png');
  assert.ok(!image.pages || image.pages === 1, `Animated PNG is not a screenshot: ${label}`);
  assert.equal(image.width, capture.width, `Original PNG width mismatch: ${label}`);
  assert.equal(image.height, capture.height, `Original PNG height mismatch: ${label}`);
  await validateNonBlankImage(bytes, label);
}

export async function validateMirroringSource(windowBytes, screenBytes, capture, windowMtimeMs) {
  const label = `${capture.locale}/${capture.feature}`;
  assert.equal(digest(windowBytes), capture.originalWindowSHA256, `Unchanged Mirroring JPEG hash mismatch: ${label}`);
  const window = await sharp(windowBytes).metadata();
  assert.equal(window.format, 'jpeg', `Mirroring source must retain its original JPEG bytes: ${label}`);
  assert.equal(window.width, mirrorWindowSize.width); assert.equal(window.height, mirrorWindowSize.height);
  assert.equal(capture.windowWidth, window.width); assert.equal(capture.windowHeight, window.height);
  assert.ok(!window.orientation || window.orientation === 1, `Unexpected Mirroring JPEG orientation: ${label}`);
  assert.deepEqual(capture.viewportCrop, mirrorViewport, `Unverified App-content crop: ${label}`);
  assert.equal(capture.width, mirrorViewport.width); assert.equal(capture.height, mirrorViewport.height);
  assert.ok(Number.isFinite(windowMtimeMs) && Math.abs(Date.parse(capture.capturedAt) - windowMtimeMs) < 1, `capturedAt must use the original Mirroring JPEG mtime: ${label}`);
  assert.ok((await sharp(screenBytes).stats()).isOpaque, `Viewport PNG must preserve the opaque JPEG pixels without an alpha mask: ${label}`);
  const windowCrop = await sharp(windowBytes).extract(mirrorViewport).toColourspace('srgb').removeAlpha().raw().toBuffer();
  const screen = await sharp(screenBytes).toColourspace('srgb').removeAlpha().raw().toBuffer();
  assert.ok(windowCrop.equals(screen), `Extracted screen PNG does not exactly match the unchanged JPEG viewport RGB pixels: ${label}`);
  return digest(windowCrop);
}

export async function decodedRGB(bytes, width) {
  let image = sharp(bytes);
  if (width !== undefined) image = image.resize({ width, withoutEnlargement: true });
  return image.toColourspace('srgb').removeAlpha().raw().toBuffer();
}

export async function validateNativeWebp(bytes, original, maxWidth, label) {
  assert.equal(bytes.toString('ascii', 0, 4), 'RIFF', `Invalid WebP container: ${label}`);
  assert.equal(bytes.toString('ascii', 8, 12), 'WEBP', `Invalid WebP format: ${label}`);
  assert.equal(bytes.readUInt32LE(4) + 8, bytes.length, `Incomplete WebP container: ${label}`);
  const chunks = [];
  let offset = 12;
  while (offset + 8 <= bytes.length) {
    const size = bytes.readUInt32LE(offset + 4);
    chunks.push(bytes.toString('ascii', offset, offset + 4));
    offset += 8 + size + size % 2;
    assert.ok(offset <= bytes.length, `Incomplete WebP chunk: ${label}`);
  }
  assert.equal(offset, bytes.length, `Trailing WebP bytes: ${label}`);
  assert.ok(chunks.includes('VP8L') && !chunks.includes('VP8 '), `Native UI must use actual lossless WebP encoding: ${label}`);
  const source = await sharp(original).metadata();
  const output = await sharp(bytes).metadata();
  assert.equal(output.format, 'webp');
  assert.equal(output.width, Math.min(maxWidth, source.width), `Native image must preserve source resolution up to its cap without upscaling: ${label}`);
  assert.ok(Math.abs(output.height - source.height * output.width / source.width) <= 1, `Native output appears cropped or stretched: ${label}`);
  await validateNonBlankImage(bytes, `${label} WebP`);
  const expectedPixels = await decodedRGB(original, output.width);
  const outputPixels = await decodedRGB(bytes);
  assert.ok(expectedPixels.equals(outputPixels), `Lossless WebP RGB differs from the full-frame source raster: ${label}`);
  return { width: output.width, height: output.height, decodedRGBSHA256: digest(outputPixels) };
}

export async function encodeNativeWebp(original, maxWidth, label) {
  const data = await sharp(original).resize({ width: maxWidth, withoutEnlargement: true }).webp({ lossless: true, effort: 6 }).toBuffer();
  const pixels = await validateNativeWebp(data, original, maxWidth, label);
  return { data, ...pixels };
}

async function preserveOriginal(originalPath, destination, expectedHash, mtimeMs) {
  await mkdir(path.dirname(destination), { recursive: true });
  if (existsSync(destination)) assert.equal(digest(await readFile(destination)), expectedHash, 'Raw capture path already contains different bytes; use a new captureSetId.');
  else await copyFile(originalPath, destination, constants.COPYFILE_EXCL);
  assert.equal(digest(await readFile(destination)), expectedHash, 'Raw capture preservation failed.');
  if (mtimeMs !== undefined && originalPath !== destination) await utimes(destination, mtimeMs / 1000, mtimeMs / 1000);
}

async function prepare(inputFile, metadataOnly = false) {
  assert.ok(inputFile && !inputFile.startsWith('-'), 'Usage: node scripts/prepare-native-app-images.mjs /absolute/path/to/verified-capture-manifest.json [--metadata-only]');
  const inputPath = path.resolve(inputFile);
  const input = JSON.parse(await readFile(inputPath, 'utf8'));
  const previousPath = path.join(websiteRoot, 'public/app-preview/native/manifest.json');
  const previous = existsSync(previousPath) ? JSON.parse(await readFile(previousPath, 'utf8')) : { captures: [] };
  if (metadataOnly) {
    assert.equal(input.captureSetId, previous.captureSetId, 'Metadata-only refresh must retain the original capture set identity.');
    assert.equal(input.captureBatchDate, previous.captureBatchDate, 'Metadata-only refresh must retain the original capture batch date.');
  }
  const provenanceArchives = [...new Map([...(previous.provenanceArchives ?? []), ...(input.provenanceArchives ?? [])].map((archive) => [archive.sha256, archive])).values()];
  const previousCaptures = [...previous.captures, ...await readProvenanceArchives(provenanceArchives)];
  if (input.targetSourceCommit !== undefined) assert.equal(input.targetSourceCommit, targetSourceCommit, 'Input targetSourceCommit differs from the selected main source.');
  assert.ok(typeof input.captureSetId === 'string' && /^[a-z0-9][a-z0-9-]{0,79}$/.test(input.captureSetId), 'captureSetId must be a short lowercase alphanumeric/hyphen identifier.');
  validateBatchDate(input.captureBatchDate);
  if (input.scope !== undefined) assert.equal(input.scope, nativeCaptureScope, 'Input scope must match the explicitly authorized local review.');
  if (input.requiredLocales !== undefined) assert.deepEqual(input.requiredLocales, requiredNativeLocales, 'Input requiredLocales must match the explicitly authorized local review.');
  assert.ok(Array.isArray(input.captures) && input.captures.length > 0, 'No native captures supplied; nothing was changed.');
  const validated = [];
  for (const capture of input.captures) {
    validateNativeMetadata(capture, input.captureBatchDate);
    assert.ok(requiredNativeLocales.includes(capture.locale), `Locale is deferred until owner confirmation: ${capture.locale}`);
  }
  const primaryCount = validateCaptureSet(input.captures);
  validateSourceIdentity(input.captures, previousCaptures);
  for (const capture of input.captures) {
    const id = captureIdentity(capture);
    assert.ok(typeof capture.originalPath === 'string' && capture.originalPath.endsWith('.png') && !/^[a-z][a-z0-9+.-]*:\/\//i.test(capture.originalPath), `Missing original PNG path: ${id}`);
    const originalPath = path.resolve(path.dirname(inputPath), capture.originalPath);
    assert.ok(!/(?:\/|\\)(?:goldens?|replays?|imagegen|editorial|social-v2|screenshots-redesign)(?:\/|\\)/i.test(originalPath), `Source path identifies generated, replay, golden or excluded draft material: ${id}`);
    assert.ok(!originalPath.startsWith(path.join(websiteRoot, 'public', 'app-preview') + path.sep), `Already-published or legacy website assets are not capture originals: ${id}`);
    const screenBytes = await readFile(originalPath);
    await validateNativePng(screenBytes, capture);
    let originalWindowPath;
    if (capture.captureMethod === 'iphone-mirroring') {
      assert.ok(typeof capture.originalWindowPath === 'string' && capture.originalWindowPath && !/^[a-z][a-z0-9+.-]*:\/\//i.test(capture.originalWindowPath), `Missing original local Mirroring JPEG path: ${id}`);
      originalWindowPath = path.resolve(path.dirname(inputPath), capture.originalWindowPath);
      const windowStat = await stat(originalWindowPath);
      await validateMirroringSource(await readFile(originalWindowPath), screenBytes, capture, windowStat.mtimeMs);
    }
    const sourceVerification = await validateSourceVerification(capture, path.dirname(inputPath));
    const reviewSourceVerification = await validateReviewSourceVerification(capture, path.dirname(inputPath));
    if (metadataOnly) {
      const old = previous.captures.find((entry) => captureIdentity(entry) === id);
      assert.ok(old, `Metadata-only refresh cannot create a screenshot: ${id}`);
      for (const field of ['sourceCommit', 'actualVersionBuild', 'capturedAt', 'platform', 'environment', 'environmentHost', 'captureMethod', 'captureType']) assert.equal(capture[field], old[field], `Metadata-only refresh cannot alter ${field}: ${id}`);
      assert.equal(capture.sha256, old.originalSHA256, `Metadata-only refresh cannot replace image bytes: ${id}`);
    }
    validated.push({ capture, originalPath, originalWindowPath, sourceVerification, reviewSourceVerification });
  }

  // Validate the entire input before creating any active index or output file.
  const captures = [];
  for (const { capture, originalPath, originalWindowPath, sourceVerification, reviewSourceVerification } of validated) {
    if (sourceVerification) await preserveOriginal(sourceVerification.originalPath, path.join(websiteRoot, sourceVerification.descriptor.path), sourceVerification.descriptor.sha256);
    if (reviewSourceVerification) for (const proof of Object.values(reviewSourceVerification)) await preserveOriginal(proof.originalPath, path.join(websiteRoot, proof.descriptor.path), proof.descriptor.sha256);
    if (metadataOnly) {
      const old = previous.captures.find((entry) => captureIdentity(entry) === captureIdentity(capture));
      const retained = { ...old, ...(capture.alt ? { alt: capture.alt } : {}) };
      if (sourceVerification) retained.sourceVerification = sourceVerification.descriptor;
      else delete retained.sourceVerification;
      retained.freshness = captureFreshness(retained);
      captures.push(retained);
      continue;
    }
    const stem = captureStem(capture);
    const rawPath = `output/native-captures/${input.captureSetId}/${capture.locale}/${stem}.png`;
    const destination = path.join(websiteRoot, rawPath);
    const original = await readFile(originalPath);
    await validateNativePng(original, capture);
    let mirroring = {};
    if (originalWindowPath) {
      const windowStat = await stat(originalWindowPath);
      const windowBytes = await readFile(originalWindowPath);
      const viewportPixelSHA256 = await validateMirroringSource(windowBytes, original, capture, windowStat.mtimeMs);
      const rawWindowPath = `output/native-captures/${input.captureSetId}/${capture.locale}/${stem}-window.jpg`;
      await preserveOriginal(originalWindowPath, path.join(websiteRoot, rawWindowPath), capture.originalWindowSHA256, windowStat.mtimeMs);
      mirroring = { rawWindowPath, originalWindowSHA256: capture.originalWindowSHA256, windowWidth: capture.windowWidth,
        windowHeight: capture.windowHeight, viewportCrop: { ...mirrorViewport }, viewportPixelSHA256 };
    }
    await preserveOriginal(originalPath, destination, capture.sha256);
    const { data, width, height, decodedRGBSHA256 } = await encodeNativeWebp(original, nativeMaxWidth, `${capture.locale}/${capture.feature}`);
    const src = `/app-preview/native/${input.captureSetId}/${capture.locale}/${stem}.webp`;
    const outputPath = path.join(websiteRoot, 'public', src);
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, data);
    const responsiveVariants = [];
    if (capture.width > responsiveWidth) {
      const variant = await encodeNativeWebp(original, responsiveWidth, `${capture.locale}/${capture.feature} ${responsiveWidth}px`);
      if (variant.data.length < data.length) {
        const variantSrc = src.replace(/\.webp$/, `-${responsiveWidth}.webp`);
        await writeFile(path.join(websiteRoot, 'public', variantSrc), variant.data);
        responsiveVariants.push({ src: variantSrc, width: variant.width, height: variant.height, bytes: variant.data.length,
          sha256: digest(variant.data), encoding: 'lossless-webp', decodedRGBSHA256: variant.decodedRGBSHA256 });
      }
    }
    const srcSet = responsiveVariants.length ? `${responsiveVariants[0].src} ${responsiveVariants[0].width}w, ${src} ${width}w` : undefined;
    captures.push({ locale: capture.locale, feature: capture.feature, shotId: captureShotId(capture), ...(capture.alt ? { alt: capture.alt } : {}), captureType: capture.captureType, captureMethod: capture.captureMethod,
      capturedAt: capture.capturedAt, actualVersionBuild: capture.actualVersionBuild, sourceCommit: capture.sourceCommit,
      platform: capture.platform, environment: capture.environment, environmentHost: capture.environmentHost,
      ...mirroring, nativeCapture: true, originalSHA256: capture.sha256, originalWidth: capture.width, originalHeight: capture.height, rawPath,
      src, width, height, bytes: data.length, sha256: digest(data), encoding: 'lossless-webp', decodedRGBSHA256,
      originalRGBSHA256: digest(await decodedRGB(original)), fullResolutionPixelPreserved: capture.width <= nativeMaxWidth,
      responsiveVariants, ...(srcSet ? { srcSet } : {}),
      resolutionStatus: capture.captureMethod === 'iphone-mirroring' ? 'temporary-low-resolution-mirroring' : 'native-resolution',
      replacementRequired: capture.captureMethod === 'iphone-mirroring',
      ...(sourceVerification ? { sourceVerification: sourceVerification.descriptor } : {}),
      ...(reviewSourceVerification ? { reviewSourceVerification: reviewSourceVerification.review.descriptor, installedSourceGuard: reviewSourceVerification.guard.descriptor } : {}),
      processing: capture.captureMethod === 'iphone-mirroring' ? 'Exact full-phone viewport extraction from unchanged Mirroring JPEG; source crop RGB matches the preserved PNG exactly. Only outer Mac window chrome is excluded; App/status/home content is retained. Lossless full-viewport WebP preserves the 664px source without upscaling or UI repaint. Temporary lower-resolution source must be replaced by a native screenshot.' : 'Lossless full-frame WebP preserves native resolution up to 1440px width. A 768px responsive variant is published only when the source is wider and its encoded file is smaller than the full image. No crop, upscaling, UI alteration or edits to the preserved raw PNG; decoded RGB is byte-identical when no resize is needed.' });
  }
  for (const capture of captures) capture.freshness = captureFreshness(capture);
  const index = buildNativeIndex(captures);
  const coverage = nativeCoverage(captures);
  const complete = coverage.currentMainCaptureCount === coverage.requiredCaptureCount && coverage.staleImageCount === 0
    && hasRequiredNativeImages(captures);
  const manifest = { captureSetId: input.captureSetId, captureBatchDate: input.captureBatchDate,
    scope: nativeCaptureScope, requiredLocales: requiredNativeLocales, requiredFeatures: requiredNativeFeatures, deferredLocales: deferredNativeLocales,
    targetSourceCommit, captureSourceCommits: [...new Set(captures.map((capture) => capture.sourceCommit))].sort(),
    captureSourceImageCounts: Object.fromEntries([...new Set(captures.map((capture) => capture.sourceCommit))].sort().map((commit) => [commit, captures.filter((capture) => capture.sourceCommit === commit).length])),
    provenanceArchives, excludedCaptures: input.excludedCaptures ?? previous.excludedCaptures ?? [],
    generatedAt: new Date().toISOString(), status: complete ? 'complete' : 'partial', nativeCapture: true,
    ...coverage, captures };
  await mkdir(path.join(websiteRoot, 'src/data'), { recursive: true });
  await writeFile(path.join(websiteRoot, 'src/data/native-product-screens.json'), `${JSON.stringify(index, null, 2)}\n`);
  await writeFile(path.join(websiteRoot, 'public/app-preview/native/manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`${metadataOnly ? 'Refreshed metadata for' : 'Prepared'} ${primaryCount}/${coverage.requiredCaptureCount} draft primary captures and ${captures.length - primaryCount} gallery images; current main ${coverage.currentMainCaptureCount}/${coverage.requiredCaptureCount} (${targetSourceCommit}). ${deferredNativeLocales.length} other locales are deferred. No fallback or source relabelling. Run check-native-app-images.mjs for byte and current-main coverage checks.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  assert.ok(process.argv.slice(3).every((argument) => argument === '--metadata-only'), 'Unsupported native capture argument.');
  prepare(process.argv[2], process.argv.includes('--metadata-only')).catch((error) => { console.error(`Native capture import failed: ${error.message}`); process.exitCode = 1; });
}
