import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation, useNavigate } from "react-router-dom";
import MarketingShell, { useMarketing } from "@/components/marketing/MarketingShell";
import { CreemBillingNotice } from "@/components/marketing/CreemBillingNotice";
import { accountRequest, AccountRequestError, clearStoredCheckoutAttempt, visitCreem } from "@/lib/shared-account-client";
import { createPasskey, getPasskey, type LoginOptions, type RegistrationOptions } from "@/lib/passkeys";
import { sharedAccountCopy } from "@/translations/marketing/shared-account";
import { formatCreemPrice, isLiveAccountHost, sharedAccountLiveAccountEnabled, sharedAccountPreviewEnabled, useCreemOffer } from "@/lib/shared-account-preview";
import { accountDeliveryCopy } from "@/translations/marketing/shared-account-delivery";
import { guestCheckoutCopy } from "@/translations/marketing/shared-account-guest";
import appClaimCopy from "@/translations/marketing/app-claim.json";
import creemCopy from "@/translations/marketing/creem-preview.json";
import pricingCopy from "@/translations/marketing/pricing.json";
import BillingReturnPage from "./BillingReturnPage";
import "./SharedAccountPage.css";

type Account = { id: string; display_name: string };
type Entitlement = { source: string; plan: string; expiresAt: string; status: string };
type Billing = {
  enabled: boolean;
  entitlement: Entitlement | null;
  hasPortal?: boolean;
  translationEnabled?: boolean;
  appClaimEmailEnabled?: boolean;
};
type Pairing = { confirmation_code: string; expires_at_ms: number };
type EmailAccessResult = { account: Account } | {
  error: "creem_web_link_unavailable" | "creem_web_account_conflict" | "request_failed";
};

function AccountSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section className="mk-account-section" aria-labelledby={id}>
      <h2 id={id} tabIndex={id === "delete" ? -1 : undefined}>{title}</h2>
      {children}
    </section>
  );
}

function EmailAccessForm({
  copy, disabled, onRequest,
}: { copy: (typeof guestCheckoutCopy)[keyof typeof guestCheckoutCopy]; disabled: boolean; onRequest: (address: string) => void }) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const address = new FormData(event.currentTarget).get("email");
    if (typeof address === "string" && address.trim()) onRequest(address.trim());
  }

  return (
    <form onSubmit={submit}>
      <div className="mk-field">
        <label htmlFor="account-purchase-email">{copy.purchaseEmail}</label>
        <input id="account-purchase-email" name="email" type="email" autoComplete="email" maxLength={254} required dir="ltr" />
      </div>
      <button className="mk-button" type="submit" disabled={disabled}>{copy.sendLink}</button>
    </form>
  );
}

export default function SharedAccountPage() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const checkoutId = params.get("checkout_id");
  return params.get("billing") === "return" && checkoutId
    ? <BillingReturnPage key={checkoutId} checkoutId={checkoutId} />
    : <AccountManagement />;
}

function AccountSkeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`mk-account-skeleton ${className}`} />;
}

function AccountManagement() {
  const { currentLanguage, languages, copy, href } = useMarketing();
  const location = useLocation();
  const navigate = useNavigate();
  const messages = sharedAccountCopy(currentLanguage.code);
  const delivery = accountDeliveryCopy[currentLanguage.code];
  const email = appClaimCopy[currentLanguage.code as keyof typeof appClaimCopy];
  const webPricing = creemCopy[currentLanguage.code];
  const guest = guestCheckoutCopy[currentLanguage.code];
  const catalog = useCreemOffer();
  const offer = catalog.isError ? undefined : catalog.offers?.find(({ id }) => id === "standard-monthly");
  const planPrice = offer && `${formatCreemPrice(currentLanguage.code, offer)} ${pricingCopy[currentLanguage.code].perMonth}`;
  const manageSubscription = sharedAccountPreviewEnabled ? messages.portal : webPricing.manageSubscription;
  const billingUnavailable = sharedAccountPreviewEnabled ? messages.billingUnavailable : webPricing.unavailable;
  const [account, setAccount] = useState<Account | null>();
  const [billing, setBilling] = useState<Billing>();
  const [pair, setPair] = useState<Pairing>();
  const [pairProblem, setPairProblem] = useState<"expired" | "failed">();
  const [pairRefresh, setPairRefresh] = useState(0);
  const [pairApproved, setPairApproved] = useState(false);
  const [confirmDeletion, setConfirmDeletion] = useState(location.hash === "#delete");
  const [sessionError, setSessionError] = useState(false);
  const [billingError, setBillingError] = useState(false);
  const [emailAccess, setEmailAccess] = useState<Promise<EmailAccessResult> | null>(null);
  const [emailReauthentication, setEmailReauthentication] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState(false);
  const [leavingForCheckout, setLeavingForCheckout] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [target, setTarget] = useState(currentLanguage.code === "en" ? "zh-tw" : currentLanguage.code);
  const [text, setText] = useState("");
  const [translation, setTranslation] = useState<{ text: string; language: string } | null>(null);
  const lock = useRef(false);
  const displayName = useRef<HTMLInputElement>(null);
  const result = useRef<HTMLParagraphElement>(null);
  const handlingEmailFragment = useRef(false);
  const fragment = new URLSearchParams(location.hash.slice(1));
  const pairCode = sharedAccountPreviewEnabled ? fragment.get("pair") : null;
  const showBilling = !fragment.has("pair");
  const allowAccountUse = showBilling && location.hash !== "#delete";
  const params = new URLSearchParams(location.search);
  const billingReturn = params.get("billing") === "return";
  const allowPurchase = allowAccountUse && !billingReturn;
  const selections = params.getAll("subscribe");
  const selectedPurchase = selections.length === 1 && selections[0] === "standard-monthly";
  const unavailablePurchase = selections.length > 0 && !selectedPurchase;
  const legacyPurchase = sharedAccountLiveAccountEnabled && allowPurchase && selections.length > 0;
  const guestReturning = sharedAccountLiveAccountEnabled && billingReturn;
  const pageTitle = legacyPurchase ? webPricing.title : messages.title;
  const emailAccessHash = sharedAccountLiveAccountEnabled && /^#access(?:=|$)/.test(location.hash) ? location.hash : "";
  const emailAccessPending = Boolean(emailAccessHash || emailAccess);
  const sessionLoading = !legacyPurchase && (emailAccessPending || (account === undefined && !sessionError));
  const hasPasskeys = typeof window !== "undefined" && window.isSecureContext
    && typeof PublicKeyCredential !== "undefined" && !!navigator.credentials;

  useEffect(() => {
    if (!emailAccessHash) {
      handlingEmailFragment.current = false;
      return;
    }
    if (handlingEmailFragment.current || emailAccess) return;
    handlingEmailFragment.current = true;
    const token = /^#access=([A-Za-z0-9_-]{43})$/.exec(emailAccessHash)?.[1];
    navigate({ pathname: location.pathname, search: location.search }, { replace: true });
    setError("");
    setFeedback("");
    setEmailAccess(token
      ? accountRequest<{ account: Account }>("/email-access", { token }).catch((failure): EmailAccessResult => {
          if (failure instanceof AccountRequestError) {
            if (failure.message === "creem_web_account_conflict") return { error: "creem_web_account_conflict" };
            if ([400, 401, 409, 410].includes(failure.status)) return { error: "creem_web_link_unavailable" };
          }
          return { error: "request_failed" };
        })
      : Promise.resolve({ error: "creem_web_link_unavailable" }));
  }, [emailAccess, emailAccessHash, location.pathname, location.search, navigate]);

  useEffect(() => {
    if (!emailAccess) return;
    let active = true;
    emailAccess.then((result) => {
      if (!active) return;
      if ("account" in result) {
        setAccount(result.account);
        setTranslation(null);
        setText("");
        setEmailReauthentication(false);
        clearStoredCheckoutAttempt();
      } else {
        setError(result.error);
      }
      setEmailAccess(null);
    });
    return () => { active = false; };
  }, [emailAccess]);

  useEffect(() => {
    if (emailAccessPending || legacyPurchase) return;
    const controller = new AbortController();
    setSessionError(false);
    accountRequest<{ account: Account | null }>("/session", undefined, controller.signal)
      .then(({ account: active }) => { if (!controller.signal.aborted) setAccount(active); })
      .catch(() => { if (!controller.signal.aborted) setSessionError(true); });
    return () => controller.abort();
  }, [refresh, emailAccessPending, legacyPurchase]);

  useEffect(() => {
    setBilling(undefined);
    setBillingError(false);
    if (!account || !showBilling) return;
    const controller = new AbortController();
    let timer: number | undefined;
    let attempts = 0;
    function loadBilling() {
      accountRequest<Billing>("/billing/status", undefined, controller.signal)
        .then((status) => {
          if (controller.signal.aborted) return;
          // On checkout return, allow the provider webhook to finish before rendering purchase controls.
          if (billingReturn && !status.entitlement && attempts < 3) {
            attempts++;
            timer = window.setTimeout(loadBilling, attempts * 1000);
            return;
          }
          setBilling(status);
        })
        .catch(() => { if (!controller.signal.aborted) setBillingError(true); });
    }
    loadBilling();
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [account, billingReturn, refresh, showBilling]);

  useEffect(() => {
    setPair(undefined);
    setPairProblem(undefined);
    setPairApproved(false);
    if (!pairCode) return;
    const controller = new AbortController();
    accountRequest<Pairing>("/pair/preview", { code: pairCode }, controller.signal)
      .then((status) => { if (!controller.signal.aborted) setPair(status); })
      .catch((failure) => {
        if (!controller.signal.aborted) {
          setPairProblem(failure instanceof AccountRequestError && [400, 404].includes(failure.status) ? "expired" : "failed");
        }
      });
    return () => controller.abort();
  }, [pairCode, pairRefresh]);

  useEffect(() => {
    if (!pair || pairApproved) return;
    const timer = window.setTimeout(() => setPairProblem("expired"), Math.max(0, pair.expires_at_ms - Date.now()));
    return () => window.clearTimeout(timer);
  }, [pair, pairApproved]);

  useEffect(() => {
    if (translation) result.current?.focus();
  }, [translation]);

  useEffect(() => {
    if (account && location.hash === "#delete") document.getElementById("delete")?.focus();
  }, [account, location.hash]);

  useEffect(() => {
    const restoreBilling = (event: PageTransitionEvent) => {
      if (event.persisted) {
        setLeavingForCheckout(false);
        setRefresh((value) => value + 1);
      }
    };
    window.addEventListener("pageshow", restoreBilling);
    return () => window.removeEventListener("pageshow", restoreBilling);
  }, []);

  async function run(action: () => Promise<void>) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    setFeedback("");
    try { await action(); }
    catch (failure) {
      if (failure instanceof DOMException && failure.name === "NotAllowedError") setError("passkey_cancelled");
      else setError(failure instanceof Error ? failure.message : "request_failed");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  async function authenticate(kind: "register" | "login") {
    const prefix = `/passkeys/${kind}`;
    const credential = kind === "register"
      ? await createPasskey((await accountRequest<{ options: RegistrationOptions }>(
        `${prefix}/options`, { display_name: displayName.current?.value.trim() },
      )).options)
      : await getPasskey((await accountRequest<{ options: LoginOptions }>(`${prefix}/options`, {})).options);
    const data = await accountRequest<{ account: Account }>(`${prefix}/verify`, { credential });
    if (account && account.id !== data.account.id) setConfirmDeletion(false);
    setAccount(data.account);
    setTranslation(null);
  }

  function signOut() {
    return run(async () => {
      await accountRequest("/logout", {});
      setAccount(null);
      setText("");
      setTranslation(null);
    });
  }

  function deleteAccount() {
    return run(async () => {
      try {
        await accountRequest("/delete", {});
      } catch (failure) {
        if (failure instanceof AccountRequestError && failure.message === "recent_email_access_required") {
          setEmailReauthentication(true);
        }
        throw failure;
      }
      setAccount(null);
      setText("");
      setTranslation(null);
      setConfirmDeletion(false);
      setEmailReauthentication(false);
      setFeedback("deleted");
    });
  }

  function approvePair() {
    return run(async () => {
      await accountRequest("/pair/approve", { code: pairCode });
      setPairApproved(true);
    });
  }

  function resendAppLink() {
    return run(async () => {
      await accountRequest("/billing/app-link", { locale: currentLanguage.code });
      setFeedback("app_link_requested");
    });
  }

  function requestEmailLink(address: string) {
    return run(async () => {
      await accountRequest("/email-access/request", { email: address, locale: currentLanguage.code });
      setFeedback("email_link_requested");
    });
  }

  function startCheckout() {
    if (!allowPurchase || !offer || unavailablePurchase || leavingForCheckout
      || !billing?.enabled || billing.entitlement) return;
    return run(async () => {
      try {
        const { checkoutUrl } = await accountRequest<{ checkoutUrl: string }>(
          "/billing/checkout", sharedAccountPreviewEnabled ? {} : { offer, locale: currentLanguage.code },
        );
        visitCreem(checkoutUrl, true);
        setLeavingForCheckout(true);
      } catch (failure) {
        if (failure instanceof AccountRequestError && failure.status === 409) {
          setRefresh((value) => value + 1);
          if (!sharedAccountPreviewEnabled) await catalog.refetch();
        }
        throw failure;
      }
    });
  }

  function sendTranslation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    return run(async () => {
      setTranslation(null);
      const { translation: output } = await accountRequest<{ translation: string }>("/translate", {
        text: text.trim(), source_language: "auto", target_language: target === "no" ? "nb" : target,
      });
      setTranslation({ text: output, language: target });
    });
  }

  const errorText = error === "recent_passkey_required" ? messages.reauthenticate
    : error === "recent_email_access_required" ? guest.reauthenticate
    : error === "creem_web_link_unavailable" ? guest.linkUnavailable
    : error === "creem_web_account_conflict" ? guest.linkConflict
    : error === "pairing_unavailable" ? messages.pairExpired
    : ["billing_needs_attention", "account_has_active_billing", "billing_cancellation_required"].includes(error)
      ? sharedAccountPreviewEnabled ? messages.billingBlock : webPricing.deletionBlocked
    : error === "Manage the existing Test Mode subscription first" || error === "creem_manage_existing" ? manageSubscription
    : error === "creem_quote_changed" ? webPricing.quoteChanged
    : error === "passkey_cancelled" ? messages.passkeyCancelled
    : error === "web_text_quota_exceeded" ? messages.quotaReached
    : error === "sign_in_required" ? messages.signIn
    : messages.error;
  const expiry = billing?.entitlement ? new Date(billing.entitlement.expiresAt) : null;
  const paidAccess = allowAccountUse && expiry && expiry.getTime() > Date.now();
  const showLiveAppDelivery = paidAccess && isLiveAccountHost()
    && billing?.appClaimEmailEnabled === true && billing.entitlement?.source === "creem_live";
  const showPreviewAppDelivery = paidAccess && sharedAccountPreviewEnabled && billing?.entitlement?.source === "creem_test";

  return (
    <MarketingShell close={false}>
      <Helmet>
        <title>{sessionLoading ? "AnyTranslator" : `${pageTitle} | AnyTranslator`}</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="referrer" content="no-referrer" />
      </Helmet>
      <header className="mk-page-intro mk-wrap">
        {sessionLoading ? <AccountSkeleton className="mk-account-skeleton-title" /> : <h1>{pageTitle}</h1>}
      </header>
      <div className="mk-wrap mk-account-page" aria-busy={busy || leavingForCheckout || sessionLoading}>
        {(busy || leavingForCheckout || emailAccessPending) && <AccountSkeleton />}
        {error && <p role="alert" className="mk-account-notice">{errorText}</p>}
        {feedback === "deleted" && <p role="status" className="mk-account-notice">{messages.deleted}</p>}
        {feedback === "email_link_requested" && <p role="status" className="mk-account-notice">{guest.linkRequested}</p>}
        {legacyPurchase && !emailAccessPending && (
          <div className="mk-account-section">
            <a className="mk-button" href={href("/pricing")}>{webPricing.seePlans}</a>
          </div>
        )}
        {sharedAccountPreviewEnabled && allowPurchase && unavailablePurchase && (
          <AccountSection id="account-selection" title={webPricing.unavailable}>
            <Link className="mk-button mk-button-secondary" to={href("/pricing")}>{webPricing.seePlans}</Link>
          </AccountSection>
        )}
        {sharedAccountPreviewEnabled && allowPurchase && selectedPurchase && !account && !emailAccessPending && (
          <AccountSection id="account-selection" title={copy.pricing.standardTitle}>
            {offer ? (
              <>
                <p>{planPrice}</p>
                <p>{webPricing.testMode}</p>
              </>
            ) : catalog.loading ? <AccountSkeleton /> : <p>{billingUnavailable}</p>}
          </AccountSection>
        )}
        {guestReturning && account === null && !emailAccessPending && (
          <p role="status" className="mk-account-notice">{guest.checkInbox}</p>
        )}
        {catalog.webEmailAccessEnabled && !billingReturn && account === null && !emailAccessPending && !legacyPurchase && (
          <AccountSection id="account-email-sign-in" title={guest.emailSignIn}>
            <EmailAccessForm copy={guest} disabled={busy} onRequest={requestEmailLink} />
          </AccountSection>
        )}
        {pairCode && (
          <AccountSection id="account-pairing" title={messages.pairTitle}>
            {pairApproved ? <p role="status">{messages.pairDone}</p>
              : pairProblem === "expired" ? <p role="alert">{messages.pairExpired}</p>
              : pairProblem === "failed" ? (
                <>
                  <p role="alert">{messages.error}</p>
                  <button className="mk-button mk-button-secondary" type="button" onClick={() => setPairRefresh((value) => value + 1)}>{messages.retry}</button>
                </>
              )
              : pair ? (
                <>
                  <p>{messages.pairHelp}</p>
                  <strong className="mk-account-code" dir="ltr">{pair.confirmation_code}</strong>
                  {account && <button type="button" className="mk-button" disabled={busy} onClick={() => void approvePair()}>{messages.approve}</button>}
                </>
              ) : <AccountSkeleton />}
          </AccountSection>
        )}
        {emailAccessPending || legacyPurchase ? null : sessionError ? (
          <div className="mk-account-notice">
            <p role="alert">{messages.error}</p>
            <button className="mk-button mk-button-secondary" type="button" onClick={() => setRefresh((value) => value + 1)}>{messages.retry}</button>
          </div>
        ) : account === undefined ? <AccountSkeleton />
          : account ? (
            <>
              <AccountSection id="account-session" title={account.display_name}>
                <button type="button" className="mk-button mk-button-secondary" disabled={busy} onClick={() => void signOut()}>{messages.signOut}</button>
              </AccountSection>
              {showBilling && <AccountSection id="account-billing" title={sharedAccountPreviewEnabled ? messages.testBilling : webPricing.title}>
                {billingError ? (
                  <>
                    <p role="alert">{messages.error}</p>
                    <button className="mk-button mk-button-secondary" type="button" onClick={() => setRefresh((value) => value + 1)}>{messages.retry}</button>
                  </>
                ) : billing === undefined ? <AccountSkeleton />
                  : (
                      <>
                        {billing.entitlement && (
                          <>
                            <p><strong>{copy.pricing.standardTitle}</strong></p>
                            {expiry && Number.isFinite(expiry.getTime()) && (
                              <p>{messages.paidUntil.replace("{date}", new Intl.DateTimeFormat(currentLanguage.code, { dateStyle: "medium" }).format(expiry))}</p>
                            )}
                          </>
                        )}
                        {allowAccountUse && billingReturn && !billing.entitlement && (
                          <>
                            <p role="status">{delivery.paymentPending}</p>
                            <button type="button" className="mk-button mk-button-secondary" disabled={busy}
                              onClick={() => setRefresh((value) => value + 1)}>{messages.retry}</button>
                          </>
                        )}
                        {allowPurchase && !billing.entitlement && !unavailablePurchase && (!billing.enabled ? <p>{billingUnavailable}</p> : offer ? (
                          <>
                            <p><strong>{copy.pricing.standardTitle}</strong> · {planPrice}</p>
                            {sharedAccountPreviewEnabled ? <p>{webPricing.testMode}</p> : <CreemBillingNotice offer={offer} />}
                          </>
                        ) : catalog.loading ? <AccountSkeleton /> : <p>{billingUnavailable}</p>)}
                        <div className="mk-account-actions">
                          {billing.enabled && allowPurchase && !billing.entitlement && !unavailablePurchase && offer && (
                            <button className="mk-button" type="button" disabled={busy || leavingForCheckout || catalog.isFetching} onClick={() => void startCheckout()}>
                              {!sharedAccountPreviewEnabled || selectedPurchase ? webPricing.continueCheckout : messages.checkout}
                            </button>
                          )}
                          {(billing.entitlement || billing.hasPortal) && (
                            <button className="mk-button mk-button-secondary" type="button" disabled={busy} onClick={() => void run(async () => {
                              const data = await accountRequest<{ portalUrl: string }>("/billing/portal", {});
                              visitCreem(data.portalUrl);
                            })}>{manageSubscription}</button>
                          )}
                        </div>
                      </>
                    )}
              </AccountSection>}
              {showPreviewAppDelivery && (
                <AccountSection id="account-app-delivery" title={messages.pairTitle}>
                  <p>{webPricing.testMode}</p>
                  <p>{delivery.bindHelp}</p>
                </AccountSection>
              )}
              {showLiveAppDelivery && (
                <AccountSection id="account-app-delivery" title={email.title}>
                  <p>{email.delivery}</p>
                  <button type="button" className="mk-button" disabled={busy} onClick={() => void resendAppLink()}>{email.resend}</button>
                  {feedback === "app_link_requested" && <p role="status">{email.requested}</p>}
                </AccountSection>
              )}
              {allowAccountUse && (sharedAccountPreviewEnabled || billing?.translationEnabled) && <AccountSection id="account-translate" title={messages.translateTitle}>
                <form onSubmit={sendTranslation}>
                  <div className="mk-field">
                    <label htmlFor="account-text">{messages.sourceText}</label>
                    <textarea id="account-text" maxLength={billing?.entitlement ? 5000 : 800} rows={4} value={text} onChange={(event) => setText(event.target.value)} required dir="auto" />
                  </div>
                  <div className="mk-field">
                    <label htmlFor="account-target">{messages.targetLanguage}</label>
                    <select id="account-target" value={target} onChange={(event) => setTarget(event.target.value)}>
                      {languages.map(({ code, nativeName }) => <option key={code} value={code} lang={code}>{nativeName}</option>)}
                    </select>
                  </div>
                  <button className="mk-button" type="submit" disabled={busy || !text.trim()}>{messages.translateAction}</button>
                </form>
                {translation && (
                  <p className="mk-account-translation" role="group" tabIndex={-1} ref={result} lang={translation.language} dir="auto" aria-label={messages.translation}>
                    {translation.text}
                  </p>
                )}
              </AccountSection>}
              <AccountSection id="delete" title={messages.deleteAccount}>
                {confirmDeletion ? (
                  <>
                    <p>{messages.deleteHelp}</p>
                    <div className="mk-account-actions">
                      <button className="mk-button" type="button" disabled={busy} onClick={() => void deleteAccount()}>{messages.deleteConfirm}</button>
                      <button className="mk-button mk-button-secondary" type="button" disabled={busy} onClick={() => {
                        setConfirmDeletion(false);
                        setEmailReauthentication(false);
                      }}>{messages.cancel}</button>
                    </div>
                    {error === "recent_passkey_required" && (
                      <button className="mk-button mk-button-secondary" type="button" disabled={busy || !hasPasskeys} onClick={() => void run(() => authenticate("login"))}>{messages.signIn}</button>
                    )}
                    {emailReauthentication && <EmailAccessForm copy={guest} disabled={busy} onRequest={requestEmailLink} />}
                  </>
                ) : (
                  <button className="mk-button mk-button-secondary" type="button" disabled={busy} onClick={() => setConfirmDeletion(true)}>{messages.deleteAccount}</button>
                )}
              </AccountSection>
            </>
          ) : guestReturning ? null : (
            <AccountSection id="account-sign-in" title={messages.signIn}>
              {confirmDeletion && <p>{messages.reauthenticate}</p>}
              {!hasPasskeys && <p role="status">{messages.passkeyUnavailable}</p>}
              <button className="mk-button" type="button" disabled={busy || !hasPasskeys} onClick={() => void run(() => authenticate("login"))}>{messages.signIn}</button>
              {!confirmDeletion && (
                <form onSubmit={(event) => { event.preventDefault(); void run(() => authenticate("register")); }}>
                  <div className="mk-field">
                    <label htmlFor="account-name">{messages.name}</label>
                    <input id="account-name" ref={displayName} autoComplete="name" maxLength={64} required dir="auto" />
                  </div>
                  <button className="mk-button mk-button-secondary" type="submit" disabled={busy || !hasPasskeys}>{messages.create}</button>
                </form>
              )}
            </AccountSection>
          )}
      </div>
    </MarketingShell>
  );
}
