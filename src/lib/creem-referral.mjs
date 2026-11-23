const referralParam = "creem_ref";
const storageKey = "anytranslator.creem.referral";

function isReferralToken(token) {
  return typeof token === "string" && /^[A-Za-z0-9._~-]{1,2048}$/.test(token);
}

export function captureCreemReferral() {
  const token = new URLSearchParams(window.location.search).get(referralParam);
  if (!isReferralToken(token)) return;

  try {
    window.localStorage.setItem(storageKey, JSON.stringify({ token }));
  } catch { /* Storage is optional. */ }
}

export function applyCreemReferral(url, checkout) {
  if (!checkout) return;

  try {
    const referral = JSON.parse(window.localStorage.getItem(storageKey) ?? "null");
    if (isReferralToken(referral?.token)) url.searchParams.set(referralParam, referral.token);
  } catch { /* Storage is optional. */ }
}
