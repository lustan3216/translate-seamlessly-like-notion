import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { APP_STORE_URL } from "@/components/AppStoreLink";
import LanguagePicker from "@/components/marketing/LanguagePicker";
import ThemeToggle from "@/components/marketing/ThemeToggle";
import { useLanguage } from "@/contexts/LanguageContext";
import { appClaimUrl, claimTokenFromHash } from "@/lib/creem-app-claim.mjs";
import claimCopy from "@/translations/marketing/app-claim.json";
import "@/marketing.css";
import "./SharedAccountPage.css";

export default function AppClaimPage() {
  const { currentLanguage } = useLanguage();
  const { hash } = useLocation();
  const copy = claimCopy[currentLanguage.code as keyof typeof claimCopy];
  const token = claimTokenFromHash(hash);

  return (
    <main className="marketing-site">
      <Helmet htmlAttributes={{ lang: currentLanguage.code }}>
        <title>{copy.title} · AnyTranslator</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="referrer" content="no-referrer" />
      </Helmet>
      <div className="mk-wrap mk-account-page mk-account-result-page">
        <div className="mk-account-actions">
          <ThemeToggle />
          <LanguagePicker />
        </div>
        <section className="mk-account-section mk-price-card mk-price-pro" aria-labelledby="app-claim-title">
          <h1 id="app-claim-title">{copy.title}</h1>
          <p>{token ? copy.openHelp : copy.invalid}</p>
          {token && (
            <div className="mk-account-actions">
              <a className="mk-button" href={`${appClaimUrl}#token=${token}`} referrerPolicy="no-referrer">{copy.open}</a>
              <a className="mk-button mk-button-secondary" href={APP_STORE_URL} rel="noreferrer">{copy.download}</a>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
