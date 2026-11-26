import { useEffect, useRef, useState, type ReactElement } from "react";
import { Helmet } from "react-helmet-async";
import { useMarketing } from "@/components/marketing/MarketingShell";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { loadAccountApp, type AccountAppLaunch, type AccountAppLoad } from "@/lib/account-app-entry";
import { accountRequest, AccountRequestError, type AccountBilling, type SharedAccount } from "@/lib/shared-account-client";
import { useCreemOffer } from "@/lib/shared-account-preview";
import { localeForCode } from "@/lib/site-config.mjs";
import { sharedAccountCopy } from "@/translations/marketing/shared-account";
import { subscriptionCopy } from "@/translations/marketing/shared-account-subscription";
import creemCopy from "@/translations/marketing/creem-preview.json";
import AccountSubscription from "./AccountSubscription";
import "./SharedAccountPage.css";

const defaultLaunch: AccountAppLaunch = { locale: localeForCode().code };

export default function AccountAppPage({ launch = defaultLaunch }: { launch?: AccountAppLaunch }) {
  return <LanguageProvider languageCode={launch.locale}><AccountAppContent launch={launch} /></LanguageProvider>;
}

function AccountAppContent({ launch }: { launch: AccountAppLaunch }) {
  const { m, currentLanguage } = useMarketing();
  const locale = currentLanguage.code;
  const title = creemCopy[locale].manageSubscription;
  const messages = sharedAccountCopy(locale);
  const exchange = useRef<Promise<unknown>>();
  const [refresh, setRefresh] = useState(0);
  const [load, setLoad] = useState<AccountAppLoad>({ phase: "loading" });
  useEffect(() => {
    const controller = new AbortController();
    const { access } = launch;
    // The token is single-use. Reuse the exchange if the effect restarts.
    if (access) exchange.current ??= accountRequest("/email-access", { token: access });
    void loadAccountApp(accountRequest, access === null ? null : exchange.current, controller.signal).then((result) => {
      if (result && !controller.signal.aborted) setLoad(result);
    });
    return () => controller.abort();
  }, [launch, refresh]);

  const tag = localeForCode(locale).tag;
  const support = <a className="mk-button mk-button-secondary" href="mailto:support@anytranslator.app">{m("contact.support")}</a>;
  return (
    <main className="marketing-site" lang={tag} dir="ltr" aria-labelledby="account-management-title" aria-busy={load.phase === "loading"}>
      <Helmet htmlAttributes={{ lang: tag }}>
        <title>{`${title} | AnyTranslator`}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="mk-wrap mk-account-page mk-account-management">
        <header className="mk-page-intro">
          <div className="mk-brand"><img src="/app-preview/logo.png" width="36" height="36" alt="AnyTranslator" /></div>
          <h1 id="account-management-title">{title}</h1>
        </header>
        {load.phase === "ready" ? <AppBilling key={load.account.id} account={load.account} initialBilling={load.billing}
          support={support}
          onSessionExpired={() => setLoad({ phase: "expired" })} /> : load.phase === "loading" ? (
          <div className="mk-account-skeleton mk-account-management-loading" aria-hidden="true">
            <span /><span /><span /><span />
          </div>
        ) : (
          <div className="mk-account-notice">
            <p role="alert">{load.phase === "expired" ? subscriptionCopy[locale].appLinkExpired : messages.error}</p>
            {load.phase === "error" && <button type="button" className="mk-button mk-button-secondary" onClick={() => {
              setLoad({ phase: "loading" });
              setRefresh((value) => value + 1);
            }}>{messages.retry}</button>}
          </div>
        )}
        {load.phase !== "loading" && load.phase !== "ready" && (
          <div className="mk-account-actions mk-subscription-secondary">{support}</div>
        )}
      </div>
    </main>
  );
}

function AppBilling({ account, initialBilling, support, onSessionExpired }: {
  account: SharedAccount;
  initialBilling: AccountBilling;
  support: ReactElement;
  onSessionExpired: () => void;
}) {
  const { currentLanguage } = useMarketing();
  const messages = sharedAccountCopy(currentLanguage.code);
  const catalog = useCreemOffer();
  const [billing, setBilling] = useState(initialBilling);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);

  async function run(action: () => Promise<void>) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      await action();
    } catch (failure) {
      if (failure instanceof AccountRequestError && failure.status === 401) {
        onSessionExpired();
      } else {
        setError(failure instanceof AccountRequestError && failure.message === "creem_quote_changed"
          ? creemCopy[currentLanguage.code].quoteChanged : messages.error);
      }
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  return (
    <div className="mk-subscription" aria-busy={busy}>
      {error && <p className="mk-account-notice" role="alert">{error}</p>}
      <AccountSubscription accountId={account.id} billing={billing} catalog={catalog} busy={busy} allowActions allowCheckout
        appPage secondaryActions={support} run={run} onBillingChange={setBilling} />
    </div>
  );
}
