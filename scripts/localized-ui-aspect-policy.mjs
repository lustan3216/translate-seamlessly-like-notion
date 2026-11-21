import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Root visually approved this full-frame PNG; do not resize it or extend the exception to another edit.
const reviewedPtBrWidget = Object.freeze({
  locale: "pt-br",
  id: "widget",
  sourceNative: "/app-preview/native/20261117-zh-tw-main25040-r5/zh-tw/widget.webp",
  sourceRawSHA256: "87b9ca889e4e3ded18979bb9418866e94c96251272b7b5aa17e6df9b947c96bb",
  inputTargetSHA256: "ca5d3c370d4564c438cb4bd26e1b80ab5b093d786552efc1a573c3e8cddb2c32",
  actualInputTargetSHA256: "ca5d3c370d4564c438cb4bd26e1b80ab5b093d786552efc1a573c3e8cddb2c32",
  editedSHA256: "c41e8545dd4438379f1a1022667315839285fa8dd710eeb00617c48fd185e28c",
  sourceWidth: 1290,
  sourceHeight: 2796,
  width: 853,
  height: 1844,
  crop: 0,
});

export function localizedUiAspectLimit(context) {
  if (!context.keyboardLayoutEdit && Object.entries(reviewedPtBrWidget).every(([key, value]) => context[key] === value)) return 0.0027;
  return context.keyboardLayoutEdit ? 0.03 : context.crop ? 0.005 : 0.002;
}

function selfTest() {
  assert.equal(localizedUiAspectLimit(reviewedPtBrWidget), 0.0027);
  for (const key of ["sourceRawSHA256", "inputTargetSHA256", "actualInputTargetSHA256", "editedSHA256"])
    assert.equal(localizedUiAspectLimit({ ...reviewedPtBrWidget, [key]: "0".repeat(64) }), 0.002, `Wrong ${key} must not receive the exception.`);
  for (const [key, value] of [["locale", "en"], ["id", "text"], ["sourceNative", "/app-preview/native/other/widget.webp"], ["width", 852], ["height", 1846], ["sourceWidth", 852], ["sourceHeight", 1846]])
    assert.equal(localizedUiAspectLimit({ ...reviewedPtBrWidget, [key]: value }), 0.002, `Wrong ${key} must not receive the exception.`);
  assert.equal(localizedUiAspectLimit({ ...reviewedPtBrWidget, crop: 1 }), 0.005, "A crop uses only the existing crop rule.");
  assert.equal(localizedUiAspectLimit({ ...reviewedPtBrWidget, keyboardLayoutEdit: true }), 0.03, "Keyboard rule stays unchanged.");
  assert.equal(localizedUiAspectLimit({}), 0.002);
  assert.equal(localizedUiAspectLimit({ crop: 10 }), 0.005);
  assert.equal(localizedUiAspectLimit({ keyboardLayoutEdit: true }), 0.03);
  const error = Math.abs((853 / 1844) / (1290 / 2796) - 1);
  assert.ok(error > 0.002 && error < localizedUiAspectLimit(reviewedPtBrWidget));
  console.log("Localized aspect policy self-test passed: exact reviewed PNG only; wrong hashes/locale/id/source/dimensions cannot borrow its tolerance; normal/crop/keyboard limits unchanged.");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  assert.equal(process.argv[2], "--self-test", "Usage: node scripts/localized-ui-aspect-policy.mjs --self-test");
  selfTest();
}
