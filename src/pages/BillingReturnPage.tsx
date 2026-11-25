import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import AppStoreLink, { APP_STORE_URL } from "@/components/AppStoreLink";
import HugeIcon from "@/components/HugeIcon";
import MarketingShell, { useMarketing } from "@/components/marketing/MarketingShell";
import { appStoreQr } from "@/lib/app-store-qr";
import { accountRequest } from "@/lib/shared-account-client";
import { sharedAccountCopy } from "@/translations/marketing/shared-account";
import claimCopy from "@/translations/marketing/app-claim.json";
import returnCopy from "@/translations/marketing/billing-return.json";
import "./SharedAccountPage.css";

const qr = appStoreQr(APP_STORE_URL);

type PaymentStatus = "confirming" | "paid" | "delivered" | "processing";

export default function BillingReturnPage({ checkoutId }: { checkoutId: string }) {
  const { currentLanguage } = useMarketing();
  const copy = returnCopy[currentLanguage.code as keyof typeof returnCopy];
  const download = claimCopy[currentLanguage.code as keyof typeof claimCopy].download;
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("confirming");
  const [resending, setResending] = useState(false);
  const [resendAccepted, setResendAccepted] = useState(false);
  const [error, setError] = useState(false);
  const request = useRef<AbortController | null>(null);
  const cooldown = useRef<number>();

  useEffect(() => {
    const url = `/api/account/billing/guest-status?${new URLSearchParams({ checkoutId })}`;
    let stopped = false;
    let nextCheck: number | undefined;
    let statusRequest: AbortController | undefined;

    function stop() {
      stopped = true;
      window.clearTimeout(nextCheck);
      statusRequest?.abort();
    }

    const deadline = window.setTimeout(() => {
      stop();
      setPaymentStatus((current) => current === "confirming" ? "processing" : current);
    }, 120_000);

    async function checkStatus() {
      const controller = new AbortController();
      statusRequest = controller;
      const requestTimeout = window.setTimeout(() => controller.abort(), 20_000);
      try {
        const response = await fetch(url, { credentials: "omit", cache: "no-store", signal: controller.signal });
        if (response.ok) {
          const result = await response.json();
          if (!stopped && !controller.signal.aborted) {
            if (result?.state === "delivered") {
              setPaymentStatus("delivered");
              window.clearTimeout(deadline);
              return;
            }
            if (result?.state === "paid") setPaymentStatus("paid");
          }
        }
      } catch {
        // Keep the last confirmed status while retrying temporary failures.
      } finally {
        window.clearTimeout(requestTimeout);
        statusRequest = undefined;
      }
      if (!stopped) nextCheck = window.setTimeout(checkStatus, 3_000);
    }

    void checkStatus();
    return () => {
      window.clearTimeout(deadline);
      stop();
    };
  }, [checkoutId]);

  useEffect(() => () => {
    request.current?.abort();
    window.clearTimeout(cooldown.current);
  }, []);

  async function resend() {
    if (request.current || cooldown.current !== undefined) return;
    const controller = new AbortController();
    request.current = controller;
    setResending(true);
    setError(false);
    try {
      await accountRequest("/billing/guest-resend", { checkoutId }, controller.signal);
      if (controller.signal.aborted) return;
      setResendAccepted(true);
      cooldown.current = window.setTimeout(() => {
        cooldown.current = undefined;
        setResendAccepted(false);
      }, 60_000);
    } catch {
      if (!controller.signal.aborted) setError(true);
    } finally {
      request.current = null;
      if (!controller.signal.aborted) setResending(false);
    }
  }

  const { title, instructions } = {
    confirming: { title: copy.confirmingTitle, instructions: null },
    paid: { title: copy.paidTitle, instructions: copy.paidInstructions },
    delivered: { title: copy.title, instructions: copy.instructions },
    processing: { title: copy.processingTitle, instructions: copy.processingInstructions },
  }[paymentStatus];

  return (
    <MarketingShell close={false}>
      <Helmet>
        <title>{title} | AnyTranslator</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="referrer" content="no-referrer" />
      </Helmet>
      <div className="mk-wrap mk-account-page mk-billing-return-page">
        <section className="mk-account-section mk-billing-return" aria-labelledby="billing-return-title">
          <span className="mk-billing-return-badge" aria-hidden="true">
            <HugeIcon name={paymentStatus === "paid" || paymentStatus === "delivered" ? "tick-02" : "clock-01"} className="h-6 w-6" />
          </span>
          <h1 id="billing-return-title">{title}</h1>
          {instructions && <p className="mk-billing-return-copy">{instructions}</p>}
          <span className="mk-sr-only" role="status">{title} {instructions}</span>
          <AppStoreLink source="billing-return" className="mk-button">{download}</AppStoreLink>
          <svg className="mk-billing-return-qr" viewBox={`0 0 ${qr.size} ${qr.size}`} aria-hidden="true" shapeRendering="crispEdges">
            <rect width={qr.size} height={qr.size} fill="white" />
            <path d={qr.path} fill="black" />
          </svg>
          <button className="mk-button mk-button-secondary" type="button" disabled={resending || resendAccepted}
            aria-busy={resending} onClick={() => void resend()}>{resendAccepted ? copy.resent : copy.resend}</button>
          <span className="mk-sr-only" role="status">{resendAccepted ? copy.resent : ""}</span>
          {error && <p role="alert">{sharedAccountCopy(currentLanguage.code).error}</p>}
        </section>
      </div>
    </MarketingShell>
  );
}
