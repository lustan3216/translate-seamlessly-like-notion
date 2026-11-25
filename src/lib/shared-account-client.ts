import { applyCreemReferral } from "./creem-referral.mjs";
import { sharedAccountPreviewEnabled } from "./shared-account-preview";
import type { BillingPeriod, CreemOffer } from "./shared-account-preview";

export type AccountBilling = {
  enabled?: boolean;
  entitlement: {
    source: string;
    plan: string;
    period?: BillingPeriod;
    offerId?: string | null;
    status: string;
    periodEndsAt?: string | null;
    expiresAt: string;
  } | null;
  subscription?: {
    offerId: CreemOffer["id"] | null;
    state: "active" | "scheduled_cancel" | "grace" | "expired";
    periodEndsAt: string | null;
    expiresAt: string | null;
    cancelAtPeriodEnd: boolean;
    pendingChange?: { offerId: CreemOffer["id"]; effectiveAt: string | null } | null;
  } | null;
  hasPortal?: boolean;
  appClaimEmailEnabled?: boolean;
  operationPending?: boolean;
};

export type AccountPlanQuota = {
  visible: boolean;
  translateCount: number;
  audioMinutes: number;
  voiceAgentMinutes: number;
  helperCount: number;
  quotaPeriod: "week" | "month";
  groupLevel?: number;
  features?: {
    id: string;
    quotaKey?: "translateCount" | "audioMinutes" | "voiceAgentMinutes" | "helperCount";
    maxPhotosPerBatch?: number;
    maxLanguages?: number;
  }[];
};

type AccountPlanDefinitions = {
  plans: Record<string, AccountPlanQuota>;
  billingOffers: Partial<Record<CreemOffer["id"], Pick<CreemOffer, "plan" | "period"> & { productId: string }>>;
};

export async function readAccountPlanQuotas(signal: AbortSignal): Promise<AccountPlanDefinitions> {
  const response = await fetch("/api/plan-quotas", { credentials: "omit", signal });
  if (!response.ok) throw new Error("request_failed");
  const { plans, billingOffers } = await response.json();
  if (!plans || typeof plans !== "object" || !billingOffers || typeof billingOffers !== "object") {
    throw new Error("request_failed");
  }
  return { plans, billingOffers };
}

export class AccountRequestError extends Error {
  constructor(readonly status: number, code: string) { super(code); }
}

export async function accountRequest<T>(path: string, body?: object, signal?: AbortSignal, idempotencyKey?: string): Promise<T> {
  const timeout = new AbortController();
  const cancel = () => timeout.abort();
  signal?.addEventListener("abort", cancel, { once: true });
  if (signal?.aborted) cancel();
  const timer = window.setTimeout(cancel, 20_000);
  try {
    const response = await fetch(`/api/account${path}`, {
      method: body ? "POST" : "GET",
      credentials: path === "/billing/guest-checkout" || path === "/billing/guest-resend" ? "omit" : "same-origin",
      cache: "no-store",
      signal: timeout.signal,
      ...(body ? {
        headers: { "Content-Type": "application/json", ...(idempotencyKey && { "Idempotency-Key": idempotencyKey }) },
        body: JSON.stringify(body),
      } : {}),
    });
    const data = response.status === 202 ? JSON.parse(await response.text() || "null") : await response.json();
    if (!response.ok) {
      throw new AccountRequestError(response.status, typeof data.error === "string" ? data.error : "request_failed");
    }
    return data;
  } finally {
    window.clearTimeout(timer);
    signal?.removeEventListener("abort", cancel);
  }
}

const creemOrigins = new Set(["https://creem.io", "https://www.creem.io", "https://checkout.creem.io"]);
const checkoutAttemptKey = "anytranslator.creem.checkoutAttempt";
const checkoutAttemptPattern = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const billingAttemptKey = "anytranslator.creem.billingAttempt";
const accountCheckoutReturnKey = "anytranslator.creem.accountCheckout";

export type SubscriptionAction = "change-plan" | "cancel-pending-change" | "cancel" | "resume";
export type BillingAttempt = { action: SubscriptionAction; key: string; offer?: CreemOffer };

export function readBillingAttempt(accountId: string): BillingAttempt | undefined {
  try {
    const saved = sessionStorage.getItem(`${billingAttemptKey}.${accountId}`);
    if (!saved) return;
    const attempt = JSON.parse(saved);
    if (!attempt || typeof attempt.key !== "string" || !checkoutAttemptPattern.test(attempt.key)) return;
    if (attempt.action === "cancel" || attempt.action === "resume" || attempt.action === "cancel-pending-change" ||
      (attempt.action === "change-plan" && typeof attempt.offer?.id === "string")) return attempt;
  } catch { /* Same-page retries keep their key when storage is unavailable. */ }
}

export function saveBillingAttempt(accountId: string, attempt?: BillingAttempt) {
  const key = `${billingAttemptKey}.${accountId}`;
  try {
    if (attempt) sessionStorage.setItem(key, JSON.stringify(attempt));
    else sessionStorage.removeItem(key);
  } catch { /* Same-page retries keep their key when storage is unavailable. */ }
}

export function readCheckoutAttempt(offerId?: string) {
  const key = offerId ? `${checkoutAttemptKey}.${offerId}` : checkoutAttemptKey;
  try {
    const stored = sessionStorage.getItem(key);
    if (stored && checkoutAttemptPattern.test(stored)) return stored;
  } catch { /* In-memory idempotency still covers retries. */ }
  const attempt = crypto.randomUUID();
  try { sessionStorage.setItem(key, attempt); } catch { /* Storage is optional. */ }
  return attempt;
}

export function clearStoredCheckoutAttempt(offerId?: string) {
  const key = offerId ? `${checkoutAttemptKey}.${offerId}` : checkoutAttemptKey;
  try { sessionStorage.removeItem(key); } catch { /* Storage is optional. */ }
}

export function isAccountCheckoutReturn(checkoutId: string) {
  try { return sessionStorage.getItem(accountCheckoutReturnKey) === checkoutId; }
  catch { return false; }
}

export function visitCreem(value: string, checkout: boolean | "account" = false) {
  const url = new URL(value);
  const liveCheckout = url.origin === "https://checkout.creem.io"
    ? /^\/ch_[A-Za-z0-9_-]+\/?$/.test(url.pathname)
    // Live Creem returns /checkout/<product>/<checkout> (seen 2026-11-23).
    : /^\/(payment|checkout\/prod_[A-Za-z0-9_-]+)\/ch_[A-Za-z0-9_-]+\/?$/.test(url.pathname);
  const livePortal = /^\/portal\/cust_[A-Za-z0-9_-]+\/?$/.test(url.pathname)
    || /^\/my-orders\/login\/[A-Za-z0-9_-]{8,256}\/?$/.test(url.pathname);
  const urlAllowed = sharedAccountPreviewEnabled
    ? checkout ? creemOrigins.has(url.origin) && url.pathname.startsWith("/test/")
      : url.protocol === "https:" && (url.hostname === "creem.io" || url.hostname.endsWith(".creem.io"))
    : creemOrigins.has(url.origin) && (checkout ? liveCheckout : livePortal);
  if (!urlAllowed || url.username || url.password) throw new Error("request_failed");
  if (checkout === "account") {
    const checkoutId = url.pathname.split("/").find((part) => /^ch_[A-Za-z0-9_-]+$/.test(part));
    try { if (checkoutId) sessionStorage.setItem(accountCheckoutReturnKey, checkoutId); }
    catch { /* The return page still gives safe recovery instructions. */ }
  }
  applyCreemReferral(url, Boolean(checkout));
  window.location.assign(url.href);
}
