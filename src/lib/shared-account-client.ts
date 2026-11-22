import { sharedAccountPreviewEnabled } from "./shared-account-preview";

export class AccountRequestError extends Error {
  constructor(readonly status: number, code: string) { super(code); }
}

export async function accountRequest<T>(path: string, body?: object, signal?: AbortSignal): Promise<T> {
  const timeout = new AbortController();
  const cancel = () => timeout.abort();
  signal?.addEventListener("abort", cancel, { once: true });
  if (signal?.aborted) cancel();
  const timer = window.setTimeout(cancel, path === "/translate" ? 50_000 : 20_000);
  try {
    const response = await fetch(`/api/account${path}`, {
      method: body ? "POST" : "GET",
      credentials: path === "/billing/guest-checkout" || path === "/billing/guest-resend" ? "omit" : "same-origin",
      cache: "no-store",
      signal: timeout.signal,
      ...(body ? { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : {}),
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

export function visitCreem(value: string, checkout = false) {
  const url = new URL(value);
  const liveCheckout = url.origin === "https://checkout.creem.io"
    ? /^\/ch_[A-Za-z0-9_-]+\/?$/.test(url.pathname)
    : /^\/payment\/ch_[A-Za-z0-9_-]+\/?$/.test(url.pathname);
  const livePortal = /^\/portal\/cust_[A-Za-z0-9_-]+\/?$/.test(url.pathname)
    || /^\/my-orders\/login\/[A-Za-z0-9_-]{8,256}\/?$/.test(url.pathname);
  const urlAllowed = sharedAccountPreviewEnabled
    ? checkout ? creemOrigins.has(url.origin) && url.pathname.startsWith("/test/")
      : url.protocol === "https:" && (url.hostname === "creem.io" || url.hostname.endsWith(".creem.io"))
    : creemOrigins.has(url.origin) && (checkout ? liveCheckout : livePortal);
  if (!urlAllowed || url.username || url.password) throw new Error("request_failed");
  window.location.assign(url.href);
}
