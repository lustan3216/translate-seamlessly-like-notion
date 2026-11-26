import MarketingShell from "@/components/marketing/MarketingShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { getLegalCopy } from "@/data/legal-copy";
import { canonicalUrl } from "@/lib/site-config.mjs";
import "@/legal.css";
import SEO from "@/components/SEO";
import JsonLd, { createBreadcrumbSchema } from "@/components/JsonLd";

const TermsOfService = () => {
  const { currentLanguage } = useLanguage();
  const copy = getLegalCopy(currentLanguage.code);
  const page = copy.terms;
  const l = (key: string) => page.nodes[key];
  const [refundBefore, refundAfter] = l("webSubscriptionRefund").split("{support}");
  const breadcrumbItems = [
    { name: copy.home, url: canonicalUrl("/", currentLanguage.code) },
    { name: page.title, url: canonicalUrl("/terms-of-service", currentLanguage.code) },
  ];

  return (
    <MarketingShell close={false}>
      <SEO
        title={page.title}
        description={page.description}
        keywords={page.keywords}
        url="/terms-of-service"
        type="article"
        publishedTime="2026-09-02T00:00:00Z"
        modifiedTime="2026-11-21T00:00:00Z"
      />
      <JsonLd data={createBreadcrumbSchema(breadcrumbItems)} />

      <header className="mk-page-intro mk-wrap" data-enter>
        <h1>{" "}{l("t001")}{" "}</h1>
      </header>
      <article className="mk-wrap mk-article mk-legal">
        <div className="mk-price-card mk-price-pro">
          <p>
            <strong>{" "}{l("t002")}{" "}</strong>{" "}{l("t003")}{" "}</p>
          <p>
            <strong>{" "}{l("t004")}{" "}</strong>{" "}{l("t005")}{" "}</p>
        </div>

        <p>{" "}{l("t006")}{" "}</p>

        <section>
          <h2>{" "}{l("t007")}{" "}</h2>
          <p>{" "}{l("t008")}{" "}</p>
          <p>{" "}{l("t009")}{" "}</p>
        </section>

        <section>
          <h2>{" "}{l("t010")}{" "}</h2>
          <p>{" "}{l("t011")}{" "}</p>
          <ul>
            <li>{" "}{l("t012")}{" "}</li>
            <li>{" "}{l("t013")}{" "}</li>
            <li>{" "}{l("t014")}{" "}</li>
            <li>{" "}{l("t015")}{" "}</li>
            <li>{" "}{l("t016")}{" "}</li>
          </ul>
          <p>{" "}{l("t017")}{" "}</p>
          <h3 id="web-subscriptions">{l("webSubscriptionTitle")}</h3>
          <p>{l("webSubscriptionMerchant")}</p>
          <p>{l("webSubscriptionRenewal")}</p>
          <p>{l("webSubscriptionCancel")}</p>
          <p>{refundBefore}<a href="mailto:support@anytranslator.app">{l("t047")}</a>{refundAfter}</p>
          <p><a href="https://www.creem.io/buyer-terms">{l("creemBuyerTerms")}</a></p>
        </section>

        <section>
          <h2>{" "}{l("t018")}{" "}</h2>
          <p>{" "}{l("t019")}{" "}</p>
        </section>

        <section>
          <h2>{" "}{l("t020")}{" "}</h2>
          <p>{" "}{l("t021")}{" "}</p>
          <p>{" "}{l("t022")}{" "}</p>
        </section>

        <section>
          <h2>{" "}{l("t023")}{" "}</h2>
          <p>{" "}{l("t024")}{" "}</p>
        </section>

        <section>
          <h2>{" "}{l("t025")}{" "}</h2>
          <p>{" "}{l("t026")}{" "}</p>
          <ul>
            <li>{" "}{l("t027")}{" "}</li>
            <li>{" "}{l("t028")}{" "}</li>
            <li>{" "}{l("t029")}{" "}</li>
            <li>{" "}{l("t030")}{" "}</li>
            <li>{" "}{l("t031")}{" "}</li>
            <li>{" "}{l("t032")}{" "}</li>
          </ul>
        </section>

        <section>
          <h2>{" "}{l("t033")}{" "}</h2>
          <p>{" "}{l("t034")}{" "}</p>
          <p>{" "}{l("t035")}{" "}</p>
        </section>

        <section>
          <h2>{" "}{l("t036")}{" "}</h2>
          <p>{" "}{l("t037")}{" "}</p>
        </section>

        <section>
          <h2>{" "}{l("t038")}{" "}</h2>
          <p>{" "}{l("t039")}{" "}</p>
        </section>

        <section>
          <h2>{" "}{l("t040")}{" "}</h2>
          <p>{" "}{l("t041")}{" "}</p>
          <p>{" "}{l("t042")}{" "}</p>
        </section>

        <section>
          <h2>{" "}{l("t043")}{" "}</h2>
          <p>{" "}{l("t044")}{" "}</p>
        </section>

        <section>
          <h2>{" "}{l("t045")}{" "}</h2>
          <p>{" "}{l("t046")}{" "}{" "}
            <a href="mailto:support@anytranslator.app">{" "}{l("t047")}{" "}</a>{" "}{l("t048")}{" "}</p>
        </section>

        <footer className="mk-small">
          <p>{" "}{l("t049")}{" "}</p>
        </footer>
      </article>
    </MarketingShell>
  );
};

export default TermsOfService;
