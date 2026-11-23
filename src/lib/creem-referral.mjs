const referralParam = "creem_ref";
const storageKey = "anytranslator.creem.referral";
// shortcut: 90 天是我們這端上限，實際有效期由 Creem 後台追蹤天數判定
const maxAge = 90 * 24 * 60 * 60 * 1000;

function isReferralToken(token) {
  return typeof token === "string" && /^[A-Za-z0-9._~-]{1,2048}$/.test(token);
}

export function captureCreemReferral() {
  const token = new URLSearchParams(window.location.search).get(referralParam);
  if (!isReferralToken(token)) return;

  try {
    window.localStorage.setItem(storageKey, JSON.stringify({ token, capturedAt: Date.now() }));
  } catch { /* Storage is optional. */ }
}

export function applyCreemReferral(url, checkout) {
  if (!checkout) return;

  try {
    const referral = JSON.parse(window.localStorage.getItem(storageKey) ?? "null");
    if (!isReferralToken(referral?.token) || !Number.isFinite(referral.capturedAt)) return;

    const age = Date.now() - referral.capturedAt;
    if (age >= 0 && age < maxAge) url.searchParams.set(referralParam, referral.token);
  } catch { /* Storage is optional. */ }
}
