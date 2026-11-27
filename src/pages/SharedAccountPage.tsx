import { useCallback, useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate } from "react-router-dom";
import MarketingShell, { marketingCopy, useMarketing } from "@/components/marketing/MarketingShell";
import {
  accountRequest, AccountRequestError, clearStoredCheckoutAttempt, isAccountCheckoutReturn, passkeyRegistrationBody,
  type AccountBilling, type AccountSession, type SharedAccount as Account,
} from "@/lib/shared-account-client";
import { createPasskey, getPasskey, type LoginOptions, type RegistrationOptions } from "@/lib/passkeys";
import { sharedAccountCopy } from "@/translations/marketing/shared-account";
import { isLiveAccountHost, sharedAccountLiveAccountEnabled, sharedAccountPreviewEnabled, useCreemOffer } from "@/lib/shared-account-preview";
import { accountDeliveryCopy } from "@/translations/marketing/shared-account-delivery";
import { emailCodeCopy } from "@/translations/marketing/shared-account-email-code";
import { guestCheckoutCopy } from "@/translations/marketing/shared-account-guest";
import appClaimCopy from "@/translations/marketing/app-claim.json";
import creemCopy from "@/translations/marketing/creem-preview.json";
import BillingReturnPage from "./BillingReturnPage";
import AccountSubscription from "./AccountSubscription";
import "./SharedAccountPage.css";

type Pairing = { confirmation_code: string; expires_at_ms: number };
type EmailAccessResult = { account: Account } | {
  error: "creem_web_link_unavailable" | "creem_web_account_conflict" | "request_failed";
};

function AccountSection({ id, title, children, plain = false, connect = false }: {
  id: string; title: string; children: ReactNode; plain?: boolean; connect?: boolean;
}) {
  return (
    <section className={`mk-account-section${plain ? "" : " mk-price-card mk-price-pro"}${connect ? " mk-account-connect" : ""}`}
      aria-labelledby={id}>
      <h2 id={id} tabIndex={id === "delete" ? -1 : undefined}>{title}</h2>
      {children}
    </section>
  );
}

const emailResendCooldownMs = 5 * 60_000;

function secondsUntil(deadline: number) {
  return Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
}

function EmailAccessForm({ locale, disabled, run, onAuthenticated, signIn = false }: {
  locale: keyof typeof emailCodeCopy;
  disabled: boolean;
  run: (action: () => Promise<void>) => Promise<void>;
  onAuthenticated: (account: Account) => void;
  signIn?: boolean;
}) {
  const copy = emailCodeCopy[locale];
  const fieldId = useId();
  const field = useRef<HTMLInputElement>(null);
  const focusField = useRef(false);
  const [resendDeadlines] = useState(() => new Map<string, number>());
  const [challenge, setChallenge] = useState<{ address: string; resendAt: number }>();
  const [remaining, setRemaining] = useState(0);
  const [code, setCode] = useState("");
  const [invalid, setInvalid] = useState(false);
  const resendAt = challenge?.resendAt;

  useEffect(() => {
    if (resendAt === undefined) return;
    const remainingSeconds = secondsUntil(resendAt);
    setRemaining(remainingSeconds);
    if (!remainingSeconds) return;
    const interval = window.setInterval(() => {
      const seconds = secondsUntil(resendAt);
      setRemaining(seconds);
      if (!seconds) window.clearInterval(interval);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [resendAt]);

  useEffect(() => {
    if (!focusField.current) return;
    focusField.current = false;
    field.current?.focus();
  }, [challenge]);

  function requestCode(address: string) {
    if (disabled) return;
    const key = address.toLowerCase();
    function showChallenge(deadline: number) {
      focusField.current = true;
      setChallenge({ address, resendAt: deadline });
      setRemaining(secondsUntil(deadline));
      setCode("");
      setInvalid(false);
    }

    const existing = resendDeadlines.get(key);
    if (existing && secondsUntil(existing)) {
      if (!challenge) showChallenge(existing);
      return;
    }
    return run(async () => {
      const result = await accountRequest<{ accepted: boolean }>("/email-access/request", { email: address, locale });
      if (result?.accepted !== true) throw new Error("request_failed");
      const deadline = Date.now() + emailResendCooldownMs;
      resendDeadlines.set(key, deadline);
      showChallenge(deadline);
    });
  }

  function submitEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const address = new FormData(event.currentTarget).get("email");
    if (typeof address === "string" && address.trim()) return requestCode(address.trim());
  }

  function submitCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (disabled || !challenge || !/^[0-9]{6}$/.test(code)) return;
    setInvalid(false);
    return run(async () => {
      try {
        const { account } = await accountRequest<{ account: Account }>("/email-access/verify", { email: challenge.address, code });
        if (!account?.id) throw new Error("request_failed");
        onAuthenticated(account);
      } catch (failure) {
        if (failure instanceof AccountRequestError && ["creem_web_code_invalid", "creem_web_account_conflict"].includes(failure.message)) {
          setInvalid(true);
          return;
        }
        throw failure;
      }
    });
  }

  function updateCode(value: string) {
    setCode(value.replace(/[^0-9]/g, "").slice(0, 6));
    setInvalid(false);
  }

  if (challenge) {
    const domain = challenge.address.slice(challenge.address.lastIndexOf("@"));
    const masked = `${challenge.address[0]}•••${domain}`;
    const [sentPrefix, sentSuffix] = copy.codeSent.split("{email}");
    const countdown = `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`;
    return (
      <form className="mk-account-email-code" onSubmit={submitCode}>
        <p role="status" className="mk-small">{sentPrefix}<bdi dir="ltr">{masked}</bdi>{sentSuffix}</p>
        <div className="mk-field">
          <label htmlFor={fieldId}>{copy.codeLabel}</label>
          <input ref={field} id={fieldId} name="code" type="text" inputMode="numeric" autoComplete="one-time-code"
            maxLength={6} pattern="[0-9]{6}" required dir="ltr" value={code} readOnly={disabled}
            aria-invalid={invalid || undefined} aria-describedby={invalid ? `${fieldId}-error` : undefined}
            onChange={(event) => updateCode(event.currentTarget.value)}
            onPaste={(event) => {
              if (disabled) return;
              event.preventDefault();
              updateCode(event.clipboardData.getData("text"));
            }} />
          {invalid && <p role="alert" className="mk-error" id={`${fieldId}-error`}>{copy.invalidCode}</p>}
        </div>
        <button className="mk-button" type="submit" disabled={disabled || code.length !== 6}>{copy.signIn}</button>
        <button className="mk-text-link" type="button" disabled={disabled || remaining > 0}
          onClick={() => requestCode(challenge.address)}>
          {remaining > 0 ? copy.resendCountdown.replace("{time}", countdown) : copy.resend}
        </button>
        <button className="mk-text-link" type="button" disabled={disabled} onClick={() => {
          focusField.current = true;
          setChallenge(undefined);
          setCode("");
          setInvalid(false);
        }}>{copy.changeEmail}</button>
      </form>
    );
  }

  return (
    <form className={signIn ? "mk-account-email-code" : undefined} onSubmit={submitEmail}>
      <div className="mk-field">
        <label htmlFor={fieldId}>
          {signIn ? marketingCopy[locale]["contact.email"] : guestCheckoutCopy[locale].purchaseEmail}
        </label>
        <input ref={field} id={fieldId} name="email" type="email" autoComplete="email" maxLength={254} required dir="ltr"
          placeholder={signIn ? "name@example.com" : undefined} />
      </div>
      <button className="mk-button" type="submit" disabled={disabled}>{copy.sendCode}</button>
    </form>
  );
}

export default function SharedAccountPage() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const checkoutId = params.get("checkout_id");
  return params.get("billing") === "return" && checkoutId && !isAccountCheckoutReturn(checkoutId)
    ? <BillingReturnPage key={checkoutId} checkoutId={checkoutId} />
    : <AccountManagement />;
}

function AccountSkeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`mk-account-skeleton ${className}`} />;
}

function AccountManagement() {
  const { currentLanguage } = useMarketing();
  const location = useLocation();
  const navigate = useNavigate();
  const messages = sharedAccountCopy(currentLanguage.code);
  const delivery = accountDeliveryCopy[currentLanguage.code];
  const email = appClaimCopy[currentLanguage.code as keyof typeof appClaimCopy];
  const webPricing = creemCopy[currentLanguage.code];
  const guest = guestCheckoutCopy[currentLanguage.code];
  const emailCode = emailCodeCopy[currentLanguage.code];
  const catalog = useCreemOffer();
  const { webEmailAccessEnabled } = catalog;
  const [account, setAccount] = useState<Account | null>();
  const [billing, setBilling] = useState<AccountBilling>();
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
  const [refresh, setRefresh] = useState(0);
  const lock = useRef(false);
  const sessionRead = useRef<AbortController>();
  const handlingEmailFragment = useRef(false);
  const fragment = new URLSearchParams(location.hash.slice(1));
  const pairCode = sharedAccountPreviewEnabled ? fragment.get("pair") : null;
  const showBilling = !fragment.has("pair");
  const allowAccountUse = showBilling && location.hash !== "#delete";
  const params = new URLSearchParams(location.search);
  const billingReturn = params.get("billing") === "return";
  const guestReturning = sharedAccountLiveAccountEnabled && billingReturn;
  const emailAccessHash = /^#access(?:=|$)/.test(location.hash) ? location.hash : "";
  const emailAccessPending = Boolean(emailAccessHash || emailAccess);
  const sessionLoading = emailAccessPending || (account === undefined && !sessionError);
  const hasPasskeys = typeof window !== "undefined" && window.isSecureContext
    && typeof PublicKeyCredential !== "undefined" && !!navigator.credentials;

  const completeEmailAccess = useCallback((active: Account) => {
    sessionRead.current?.abort();
    setSessionError(false);
    setAccount(active);
    setEmailReauthentication(false);
    clearStoredCheckoutAttempt();
  }, []);

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
        completeEmailAccess(result.account);
      } else {
        setError(result.error);
      }
      setEmailAccess(null);
    });
    return () => { active = false; };
  }, [emailAccess, completeEmailAccess]);

  useEffect(() => {
    if (emailAccessPending) return;
    const controller = new AbortController();
    sessionRead.current = controller;
    setSessionError(false);
    accountRequest<AccountSession>("/session", undefined, controller.signal)
      .then(({ account: active }) => { if (!controller.signal.aborted) setAccount(active); })
      .catch(() => { if (!controller.signal.aborted) setSessionError(true); });
    return () => controller.abort();
  }, [refresh, emailAccessPending]);

  useEffect(() => {
    setBilling(undefined);
    setBillingError(false);
    if (!account || !showBilling) return;
    const controller = new AbortController();
    let timer: number | undefined;
    let attempts = 0;
    function loadBilling() {
      accountRequest<AccountBilling>("/billing/status", undefined, controller.signal)
        .then((status) => {
          if (controller.signal.aborted) return;
          // On checkout return, allow the provider webhook to finish before showing a pending payment.
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
    if (account && location.hash === "#delete") document.getElementById("delete")?.focus();
  }, [account, location.hash]);

  useEffect(() => {
    const restoreBilling = (event: PageTransitionEvent) => {
      if (event.persisted) setRefresh((value) => value + 1);
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
        `${prefix}/options`, passkeyRegistrationBody,
      )).options)
      : await getPasskey((await accountRequest<{ options: LoginOptions }>(`${prefix}/options`, {})).options);
    const data = await accountRequest<{ account: Account }>(`${prefix}/verify`, { credential });
    if (account && account.id !== data.account.id) setConfirmDeletion(false);
    setAccount(data.account);
  }

  function signOut() {
    return run(async () => {
      await accountRequest("/logout", {});
      setAccount(null);
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

  const errorText = error === "recent_passkey_required" ? messages.reauthenticate
    : error === "recent_email_access_required" ? guest.reauthenticate
    : error === "creem_web_link_unavailable" ? guest.linkUnavailable
    : error === "creem_web_account_conflict" ? guest.linkConflict
    : error === "pairing_unavailable" ? messages.pairExpired
    : ["billing_needs_attention", "account_has_active_billing", "billing_cancellation_required"].includes(error)
      ? sharedAccountPreviewEnabled ? messages.billingBlock : webPricing.deletionBlocked
    : error === "creem_quote_changed" ? webPricing.quoteChanged
    : error === "passkey_cancelled" ? messages.passkeyCancelled
    : error === "sign_in_required" ? account === null ? emailCode.signIn : messages.signIn
    : messages.error;
  const expiry = billing?.entitlement ? new Date(billing.entitlement.expiresAt) : null;
  const paidAccess = allowAccountUse && expiry && expiry.getTime() > Date.now();
  const showPreviewAppDelivery = paidAccess && sharedAccountPreviewEnabled && billing?.entitlement?.source === "creem_test";
  const canResendAppLink = paidAccess && billing?.appClaimEmailEnabled === true
    && (showPreviewAppDelivery || (isLiveAccountHost() && billing.entitlement?.source === "creem_live"));
  const signedOut = account === null && !emailAccessPending && !sessionError && !guestReturning;
  const showSignInIntro = signedOut && !pairCode;
  const signInLoading = signedOut && catalog.loading;
  const canSignOut = !!account && !emailAccessPending && !sessionError;
  const introClass = showSignInIntro ? " mk-account-login-intro" : canSignOut ? " mk-account-header" : "";

  return (
    <MarketingShell close={false}>
      <Helmet>
        <title>{sessionLoading ? "AnyTranslator" : `${messages.title} | AnyTranslator`}</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="referrer" content="no-referrer" />
      </Helmet>
      <header className={`mk-page-intro mk-wrap${introClass}`}>
        {sessionLoading ? <AccountSkeleton className="mk-account-skeleton-title" /> : <h1>{messages.title}</h1>}
        {canSignOut && <button type="button" className="mk-button mk-button-secondary" disabled={busy} onClick={() => void signOut()}>{messages.signOut}</button>}
        {showSignInIntro && <p className="mk-lead">{confirmDeletion ? messages.deleteAccount : guest.emailSignIn}</p>}
      </header>
      <div className={showSignInIntro ? "mk-wrap mk-account-page mk-account-login" : "mk-wrap mk-account-page"}
        aria-busy={busy || sessionLoading || signInLoading}>
        {(busy || emailAccessPending) && <AccountSkeleton />}
        {error && <p role="alert" className="mk-account-notice">{errorText}</p>}
        {feedback === "deleted" && <p role="status" className="mk-account-notice">{messages.deleted}</p>}
        {guestReturning && account === null && !emailAccessPending && (
          <p role="status" className="mk-account-notice">{guest.checkInbox}</p>
        )}
        {signedOut && (signInLoading ? <AccountSkeleton />
          : webEmailAccessEnabled ? (
            <EmailAccessForm locale={currentLanguage.code} disabled={busy} run={run} onAuthenticated={completeEmailAccess} signIn />
          ) : (
            <div className="mk-account-notice">
              <p role="alert">{messages.error}</p>
              <button className="mk-button mk-button-secondary" type="button" onClick={() => void catalog.refetch()}>{messages.retry}</button>
            </div>
          ))}
        {pairCode && (
          <AccountSection id="account-pairing" title={messages.pairTitle} connect>
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
        {emailAccessPending ? null : sessionError ? (
          <div className="mk-account-notice">
            <p role="alert">{messages.error}</p>
            <button className="mk-button mk-button-secondary" type="button" onClick={() => setRefresh((value) => value + 1)}>{messages.retry}</button>
          </div>
        ) : account === undefined ? <AccountSkeleton />
          : account ? (
            <>
              {showBilling && <AccountSection id="account-billing" title={sharedAccountPreviewEnabled ? messages.testBilling : webPricing.title}
                plain={billing !== undefined && !billingError}>
                {billingError ? (
                  <>
                    <p role="alert">{messages.error}</p>
                    <button className="mk-button mk-button-secondary" type="button" onClick={() => setRefresh((value) => value + 1)}>{messages.retry}</button>
                  </>
                ) : billing === undefined ? <AccountSkeleton />
                  : (
                      <>
                        {allowAccountUse && billingReturn && !billing.entitlement && (
                          <>
                            <p role="status">{delivery.paymentPending}</p>
                            <button type="button" className="mk-button mk-button-secondary" disabled={busy}
                              onClick={() => setRefresh((value) => value + 1)}>{messages.retry}</button>
                          </>
                        )}
                        <AccountSubscription key={account.id} accountId={account.id} billing={billing} catalog={catalog} busy={busy}
                          allowActions={allowAccountUse} allowCheckout={!billingReturn} run={run} onBillingChange={setBilling} />
                      </>
                    )}
              </AccountSection>}
              {(showPreviewAppDelivery || canResendAppLink) && (
                <AccountSection id="account-app-delivery" title={showPreviewAppDelivery ? messages.pairTitle : email.title}
                  connect={showPreviewAppDelivery}>
                  {showPreviewAppDelivery && <><p>{webPricing.testMode}</p><p>{delivery.bindHelp}</p></>}
                  {canResendAppLink && (
                    <>
                      <p>{email.delivery}</p>
                      <button type="button" className="mk-button" disabled={busy} onClick={() => void resendAppLink()}>{email.resend}</button>
                      {feedback === "app_link_requested" && <p role="status">{email.requested}</p>}
                    </>
                  )}
                </AccountSection>
              )}
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
                    {emailReauthentication && (
                      <EmailAccessForm locale={currentLanguage.code} disabled={busy} run={run} onAuthenticated={completeEmailAccess} />
                    )}
                  </>
                ) : (
                  <button className="mk-button mk-button-secondary" type="button" disabled={busy} onClick={() => setConfirmDeletion(true)}>{messages.deleteAccount}</button>
                )}
              </AccountSection>
            </>
          ) : null}
      </div>
    </MarketingShell>
  );
}
