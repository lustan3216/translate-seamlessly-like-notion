import { Link } from "react-router-dom";
import type { CreemOffer } from "@/lib/shared-account-preview";
import creemCopy from "@/translations/marketing/creem-preview.json";
import { useMarketing } from "./MarketingShell";

export function CreemBillingNotice({ offer }: { offer: CreemOffer }) {
  const { href, t, currentLanguage } = useMarketing();
  const messages = creemCopy[currentLanguage.code];
  return (
    <p className="mk-small">
      {messages.livePayment} {offer.taxMode === "inclusive" ? messages.taxIncluded : messages.taxAtCheckout}
      <br />
      <Link to={`${href("/terms-of-service")}#web-subscriptions`}>{t("landing.terms")}</Link>
      {" · "}
      <Link to={`${href("/privacy-policy")}#web-subscription-data`}>{t("landing.privacy")}</Link>
      {" · "}
      <a href="https://www.creem.io/buyer-terms" rel="noreferrer">{messages.buyerTerms}</a>
    </p>
  );
}
