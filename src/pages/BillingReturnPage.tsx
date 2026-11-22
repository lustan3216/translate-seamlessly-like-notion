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

export default function BillingReturnPage({ checkoutId }: { checkoutId: string }) {
  const { currentLanguage } = useMarketing();
  const copy = returnCopy[currentLanguage.code as keyof typeof returnCopy];
  const download = claimCopy[currentLanguage.code as keyof typeof claimCopy].download;
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState(false);
  const request = useRef<AbortController | null>(null);
  const cooldown = useRef<number>();

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
      setResent(true);
      cooldown.current = window.setTimeout(() => {
        cooldown.current = undefined;
        setResent(false);
      }, 60_000);
    } catch {
      if (!controller.signal.aborted) setError(true);
    } finally {
      request.current = null;
      if (!controller.signal.aborted) setResending(false);
    }
  }

  return (
    <MarketingShell close={false}>
      <Helmet>
        <title>{copy.title} | AnyTranslator</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="referrer" content="no-referrer" />
      </Helmet>
      <div className="mk-wrap mk-account-page mk-billing-return-page">
        <section className="mk-account-section mk-billing-return" aria-labelledby="billing-return-title">
          <span className="mk-billing-return-badge">
            <HugeIcon name="tick-02" className="h-6 w-6" />
          </span>
          <h1 id="billing-return-title">{copy.title}</h1>
          <p className="mk-billing-return-copy">{copy.instructions}</p>
          <AppStoreLink source="billing-return" className="mk-button">{download}</AppStoreLink>
          <svg className="mk-billing-return-qr" viewBox={`0 0 ${qr.size} ${qr.size}`} aria-hidden="true" shapeRendering="crispEdges">
            <rect width={qr.size} height={qr.size} fill="white" />
            <path d={qr.path} fill="black" />
          </svg>
          <button className="mk-button mk-button-secondary" type="button" disabled={resending || resent}
            aria-busy={resending} onClick={() => void resend()}>{resent ? copy.resent : copy.resend}</button>
          <span className="mk-sr-only" role="status">{resent ? copy.resent : ""}</span>
          {error && <p role="alert">{sharedAccountCopy(currentLanguage.code).error}</p>}
        </section>
      </div>
    </MarketingShell>
  );
}
