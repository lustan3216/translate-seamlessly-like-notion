export const appClaimUrl = "https://link.anytranslator.app/app/claim";
export const accountClaimPath = "/retrieve";

export function claimTokenFromHash(hash) {
  return hash.length === 50 ? /^#token=([A-Za-z0-9_-]{43})$/.exec(hash)?.[1] ?? null : null;
}
