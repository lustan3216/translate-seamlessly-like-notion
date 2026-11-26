import { useEffect, useState, type ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { localizedPath, SITE_URL } from "@/lib/site-config.mjs";
import { liveAccountOrigin, sharedAccountEnabled, sharedAccountLiveAccountEnabled, sharedAccountLiveEnabled, sharedAccountPreviewEnabled } from "@/lib/shared-account-preview";
import HugeIcon from "@/components/HugeIcon";
import AppStoreLink from "@/components/AppStoreLink";
import LanguagePicker from "./LanguagePicker";
import ThemeToggle from "./ThemeToggle";
import FooterMediaCredits from "./FooterMediaCredits";
import base from "@/translations/marketing/base.json";
import asia from "@/translations/marketing/asia.json";
import europeA from "@/translations/marketing/europe-a.json";
import europeB from "@/translations/marketing/europe-b.json";
import creemCopy from "@/translations/marketing/creem-preview.json";
import { emailCodeCopy } from "@/translations/marketing/shared-account-email-code";
import "@/marketing.css";
import "./PhotoStages.css";
import { featureDetails } from "@/data/feature-details";
import { currentMainCopies, getCurrentMainCopy } from "@/data/current-copy";
import { marketingCatalog } from "@/data/marketing-content.mjs";

export const marketingCopy: Record<string, Record<string, string>> = {
  ...base,
  ...asia,
  ...europeA,
  ...europeB,
  ...Object.fromEntries(Object.entries(currentMainCopies).map(([locale, copy]) => [locale, {
    ...({ ...base, ...asia, ...europeA, ...europeB } as Record<string, Record<string, string>>)[locale],
    ...copy.marketing,
  }])),
};
export function useMarketing() {
  const context = useLanguage();
  const details = featureDetails[context.currentLanguage.code];
  const m = (key: string) => key === "article.document"
    ? details.documentArticle.title
    : marketingCopy[context.currentLanguage.code]?.[key] || key;
  const href = (path: string) => {
    const localized = localizedPath(path, context.currentLanguage.code);
    return sharedAccountLiveAccountEnabled && path !== "/account" ? `${SITE_URL}${localized}` : localized;
  };
  const accountHref = `${sharedAccountEnabled ? "" : liveAccountOrigin}${href("/account")}`;
  return { ...context, ...marketingCatalog(context.currentLanguage.code), m, href, accountHref, details, copy: getCurrentMainCopy(context.currentLanguage.code) };
}
export const Arrow = () => (
  <HugeIcon name="arrow-right-01-round" className="mk-arrow" />
);
export function DownloadButtons({ source = "marketing" }: { source?: string }) {
  const { m } = useMarketing();
  return (
    <div className="mk-actions">
      <AppStoreLink source={`${source}-macos`} className="mk-button">
        {m("download.mac")}
        <Arrow />
      </AppStoreLink>
      <AppStoreLink
        source={`${source}-ios`}
        className="mk-button mk-button-secondary"
      >
        {m("download.ios")}
      </AppStoreLink>
    </div>
  );
}
export function MarketingNavigation({ liveMarketing = false }: { liveMarketing?: boolean }) {
  const { m, t, href, accountHref, currentLanguage } = useMarketing();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isPurchasePage = /^\/(?:pricing|account)\/?$/.test(location.pathname);
  const webPlans = sharedAccountPreviewEnabled || sharedAccountLiveAccountEnabled || liveMarketing;
  const showSignIn = !sharedAccountLiveAccountEnabled && !/^\/account(?:\/|$)/i.test(location.pathname);
  const signIn = emailCodeCopy[currentLanguage.code].signIn;
  useEffect(() => {
    const media = window.matchMedia("(max-width: 1100px)");
    const closeDesktopMenu = () => {
      if (!media.matches) setOpen(false);
    };
    media.addEventListener("change", closeDesktopMenu);
    return () => media.removeEventListener("change", closeDesktopMenu);
  }, []);
  useEffect(() => {
    setOpen(false);
  }, [location]);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        document.querySelector(
          "[data-marketing-language-menu][data-state='open']",
        )
      )
        return;
      if (event.key === "Escape") {
        setOpen(false);
        document.getElementById("mk-menu-toggle")?.focus();
      }
      if (event.key === "Tab") {
        const elements = [
          document.getElementById("mk-menu-toggle"),
          ...Array.from(
            document.querySelectorAll(
              "#mk-mobile-menu a, #mk-mobile-menu button",
            ),
          ),
        ] as HTMLElement[];
        const first = elements[0],
          last = elements.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);
  const links = [
    ["manifesto", "/manifesto"],
    ["features", "/features"],
    ["useCases", "/use-cases"],
    ["pricing", "/pricing"],
    ["blog", "/blog"],
  ];
  return (
    <header className="mk-header">
      <a href="#main-content" className="mk-skip">
        {m("skip")}
      </a>
      <div className={showSignIn ? "mk-wrap mk-nav mk-nav-with-sign-in" : "mk-wrap mk-nav"}>
        <Link to={href("/")} className="mk-brand" aria-label="AnyTranslator">
          <img src="/app-preview/logo.png" width="36" height="36" alt="" />
          <span>AnyTranslator</span>
        </Link>
        <nav className="mk-nav-links" aria-label={m("nav.menu")}>
          {links.map(([key, path]) => (
            <NavLink key={path} to={href(path)}>
              {m(`nav.${key}`)}
            </NavLink>
          ))}
        </nav>
        <div className="mk-nav-end">
          <ThemeToggle />
          <LanguagePicker />
          {showSignIn && (
            <a className="mk-button mk-button-secondary mk-nav-action mk-nav-sign-in" href={accountHref}>
              {signIn}
            </a>
          )}
          {(!webPlans || !isPurchasePage) && (
            <Link className="mk-button mk-nav-action" to={href(webPlans ? "/pricing" : "/download")}>
              {webPlans ? creemCopy[currentLanguage.code].seePlans : m("nav.download")}
              <Arrow />
            </Link>
          )}
          <button
            id="mk-menu-toggle"
            className="mk-menu-toggle"
            aria-expanded={open}
            aria-controls="mk-mobile-menu"
            onClick={() => setOpen(!open)}
          >
            <HugeIcon
              name="arrow-down-01-round"
              className={open ? "mk-menu-arrow is-open" : "mk-menu-arrow"}
            />
            <span className="mk-sr-only">{m("nav.menu")}</span>
          </button>
        </div>
      </div>
      {open && (
        <nav
          id="mk-mobile-menu"
          className="mk-mobile-menu"
          aria-label={m("nav.menu")}
        >
          {showSignIn && (
            <a href={accountHref}>
              {signIn}
              <Arrow />
            </a>
          )}
          {[
            ...links,
            ["about", "/about"],
            ["affiliate", "/affiliate"],
            ["contact", "/contact"],
            ["support", "/support"],
            ["download", "/download"],
          ].map(([key, path]) => (
            <NavLink key={path} to={href(path)}>
              {m(`nav.${key}`)}
              <Arrow />
            </NavLink>
          ))}
          <div className="mk-mobile-language">
            <p>{t("landing.language")}</p>
            <LanguagePicker full />
          </div>
        </nav>
      )}
    </header>
  );
}
export function MarketingFooter() {
  const { m, href, accountHref, t, currentLanguage } = useMarketing();
  const groups = [
    [
      "footer.product",
      [
        ["nav.features", "/features"],
        ["nav.useCases", "/use-cases"],
        ["nav.pricing", "/pricing"],
        ["nav.download", "/download"],
      ],
    ],
    [
      "footer.company",
      [
        ["nav.about", "/about"],
        ["nav.manifesto", "/manifesto"],
        ["nav.affiliate", "/affiliate"],
        ["nav.contact", "/contact"],
      ],
    ],
    [
      "footer.resources",
      [
        ["nav.blog", "/blog"],
        ["nav.support", "/support"],
      ],
    ],
    [
      "footer.legal",
      [
        ["landing.privacy", "/privacy-policy"],
        ["landing.terms", "/terms-of-service"],
      ],
    ],
  ] as const;
  return (
    <footer className="mk-footer">
      <div className="mk-wrap">
        <div className="mk-footer-grid">
          <Link to={href("/")} className="mk-brand">
            <img src="/app-preview/logo.png" width="36" height="36" alt="" />
            <span>AnyTranslator</span>
          </Link>
          {groups.map(([title, links]) => (
            <div key={title}>
              <h2>{m(title)}</h2>
              {links.map(([key, path]) => (
                <Link key={path} to={href(path)}>
                  {key.startsWith("landing.") ? t(key) : m(key)}
                </Link>
              ))}
              {title === "footer.resources" && (
                <>
                  {!sharedAccountEnabled && (
                    <a href={accountHref}>
                      {creemCopy[currentLanguage.code].manageSubscription}
                    </a>
                  )}
                  <a href="mailto:support@anytranslator.app">
                    <span style={{ overflowWrap: "anywhere" }}>
                      support@anytranslator.app
                    </span>
                  </a>
                </>
              )}
            </div>
          ))}
        </div>
        <div className="mk-footer-bottom">
          <span>
            © {new Date().getFullYear()} AnyTranslator. {m("footer.rights")}
          </span>
          <span>Shiny Technology Co., Ltd.</span>
        </div>
        <FooterMediaCredits language={currentLanguage.code} />
      </div>
    </footer>
  );
}
export function Closing({ liveMarketing }: { liveMarketing: boolean }) {
  const { m, href, currentLanguage } = useMarketing();
  const { pathname } = useLocation();
  const showPlans = (sharedAccountPreviewEnabled || liveMarketing)
    && (pathname === "/" || /^\/(?:features|use-cases|blog)(?:\/|$)/.test(pathname));
  return (
    <section className="mk-closing">
      <div className="mk-wrap">
        <img src="/app-preview/logo.png" width="64" height="64" alt="" />
        <h2>{m(showPlans ? "pricing.title" : "download.title")}</h2>
        {showPlans ? (
          <div className="mk-actions">
            <Link className="mk-button" to={href("/pricing")}>
              {creemCopy[currentLanguage.code].seePlans}<Arrow />
            </Link>
          </div>
        ) : (
          <DownloadButtons source="closing" />
        )}
      </div>
    </section>
  );
}
export default function MarketingShell({
  children,
  close = true,
}: {
  children: ReactNode;
  close?: boolean;
}) {
  const { pathname } = useLocation();
  const [liveMarketing, setLiveMarketing] = useState(false);
  useEffect(() => {
    setLiveMarketing(sharedAccountLiveEnabled && !sharedAccountLiveAccountEnabled && window.location.origin === SITE_URL);
  }, []);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return (
    <div className="marketing-site">
      <MarketingNavigation liveMarketing={liveMarketing} />
      <main id="main-content" tabIndex={-1}>
        {children}
        {close && <Closing liveMarketing={liveMarketing} />}
      </main>
      <MarketingFooter />
    </div>
  );
}
