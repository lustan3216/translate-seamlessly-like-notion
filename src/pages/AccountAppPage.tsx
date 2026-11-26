import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useMarketing } from "@/components/marketing/MarketingShell";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { finishAccountAppSession, loadAccountApp, sendAppMessage, type AccountAppLaunch, type AccountAppLoad } from "@/lib/account-app-entry";
import { accountRequest, AccountRequestError, type AccountBilling, type SharedAccount } from "@/lib/shared-account-client";
import { useCreemOffer } from "@/lib/shared-account-preview";
import { localeForCode } from "@/lib/site-config.mjs";
import { sharedAccountCopy } from "@/translations/marketing/shared-account";
import creemCopy from "@/translations/marketing/creem-preview.json";
import AccountSubscription from "./AccountSubscription";
import "./AccountAppPage.css";

const defaultLaunch: AccountAppLaunch = { locale: localeForCode().code };

export default function AccountAppPage({ launch = defaultLaunch }: { launch?: AccountAppLaunch }) {
  return <LanguageProvider languageCode={launch.locale}><AccountAppContent launch={launch} /></LanguageProvider>;
}

function AccountAppContent({ launch }: { launch: AccountAppLaunch }) {
  const { m, currentLanguage } = useMarketing();
  const title = creemCopy[currentLanguage.code].manageSubscription;
  const messages = sharedAccountCopy(currentLanguage.code);
  const navigate = useNavigate();
  const page = useRef<HTMLElement>(null);
  const exchange = useRef<Promise<unknown>>();
  const expiryHandled = useRef(false);
  const [refresh, setRefresh] = useState(0);
  const [load, setLoad] = useState<AccountAppLoad>({ phase: "loading" });
  const [systemDark, setSystemDark] = useState(() => window.matchMedia("(prefers-color-scheme: dark)").matches);

  useEffect(() => {
    if (launch.theme) return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => setSystemDark(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, [launch.theme]);

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

  useEffect(() => {
    if (load.phase !== "expired" || expiryHandled.current) return;
    expiryHandled.current = true;
    finishAccountAppSession((path) => navigate(path, { replace: true }));
  }, [load.phase, navigate]);

  const tag = localeForCode(currentLanguage.code).tag;
  return (
    <main className="app-account" ref={page} lang={tag} dir="ltr" data-app-theme={launch.theme ?? (systemDark ? "dark" : "light")}
      aria-label={title} aria-busy={load.phase === "loading"}>
      <Helmet htmlAttributes={{ lang: tag }}>
        <title>{title}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="app-account-content">
        {load.phase === "ready" ? <AppBilling key={load.account.id} account={load.account} initialBilling={load.billing}
          onSessionExpired={() => setLoad({ phase: "expired" })}
          dialogContainer={page.current} /> : load.phase === "loading" ? (
          <div className="app-account-block app-account-placeholder" aria-hidden="true" />
        ) : (
          <div className="app-account-block">
            <p role="alert">{load.phase === "expired" ? messages.pairExpired : messages.error}</p>
            {load.phase === "error" && <button type="button" className="app-account-action" onClick={() => {
              setLoad({ phase: "loading" });
              setRefresh((value) => value + 1);
            }}>{messages.retry}</button>}
          </div>
        )}
        {load.phase !== "loading" && (
          <a className="app-account-action" href="mailto:support@anytranslator.app" onClick={(event) => {
            if (sendAppMessage("openSupport")) event.preventDefault();
          }}>{m("contact.support")}</a>
        )}
      </div>
    </main>
  );
}

function AppBilling({ account, initialBilling, dialogContainer, onSessionExpired }: {
  account: SharedAccount;
  initialBilling: AccountBilling;
  dialogContainer: HTMLElement | null;
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
    <div className="app-account-content" aria-busy={busy}>
      {error && <p className="app-account-block" role="alert">{error}</p>}
      <AccountSubscription accountId={account.id} billing={billing} catalog={catalog} busy={busy} allowActions allowCheckout
        appPage={{ dialogContainer }} run={run} onBillingChange={setBilling} />
    </div>
  );
}
