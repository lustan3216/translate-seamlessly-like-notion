import MarketingShell from "@/components/marketing/MarketingShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { getLegalCopy } from "@/data/legal-copy";
import { canonicalUrl } from "@/lib/site-config.mjs";
import "@/legal.css";
import SEO from "@/components/SEO";
import JsonLd, { createBreadcrumbSchema } from "@/components/JsonLd";

const PrivacyPolicy = () => {
  const { currentLanguage } = useLanguage();
  const copy = getLegalCopy(currentLanguage.code);
  const page = copy.privacy;
  const l = (key: string) => page.nodes[key];
  const breadcrumbItems = [
    { name: copy.home, url: canonicalUrl("/", currentLanguage.code) },
    { name: page.title, url: canonicalUrl("/privacy-policy", currentLanguage.code) },
  ];

  return (
    <MarketingShell close={false}>
      <SEO
        title={page.title}
        description={page.description}
        keywords={page.keywords}
        url="/privacy-policy"
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
        <div className="mk-price-card mk-price-pro">
          <p><strong>{" "}{l("t007")}{" "}</strong></p>
          <p>{" "}{l("t008")}{" "}</p>
        </div>

        <section>
          <h2>{" "}{l("t009")}{" "}</h2>
          <h3>{" "}{l("t010")}{" "}</h3>
          <p>{" "}{l("t011")}{" "}</p>
          <ul>
            <li>{" "}{l("t012")}{" "}</li>
            <li>{" "}{l("t013")}{" "}</li>
            <li>{" "}{l("t014")}{" "}</li>
            <li>{" "}{l("t015")}{" "}</li>
            <li>{" "}{l("t016")}{" "}</li>
          </ul>
          <p>{" "}{l("t017")}{" "}</p>

          <h3>{" "}{l("t018")}{" "}</h3>
          <p>{" "}{l("t019")}{" "}</p>

          <h3>{" "}{l("t020")}{" "}</h3>
          <p>{" "}{l("t021")}{" "}</p>
          <p>{" "}{l("t022")}{" "}</p>
          <h4 id="web-subscription-data">{l("webAccountTitle")}</h4>
          <p>{l("webAccountData")}</p>
          <p>{l("webSubscriptionData")}</p>
          <p><a href="https://www.creem.io/privacy">{l("creemPrivacyNotice")}</a></p>

          <h3>{" "}{l("t023")}{" "}</h3>
          <p>{" "}{l("t024")}{" "}</p>

          <h3>{" "}{l("t025")}{" "}</h3>
          <p>{" "}{l("t026")}{" "}</p>
        </section>

        <section>
          <h2>{" "}{l("t027")}{" "}</h2>
          <ul>
            <li>{" "}{l("t028")}{" "}</li>
            <li>{" "}{l("t029")}{" "}</li>
            <li>{" "}{l("t030")}{" "}</li>
            <li>{" "}{l("t031")}{" "}</li>
            <li>{" "}{l("t032")}{" "}</li>
            <li>{" "}{l("t033")}{" "}</li>
            <li>{" "}{l("t034")}{" "}</li>
          </ul>
        </section>

        <section>
          <h2>{" "}{l("t035")}{" "}</h2>
          <p>{" "}{l("t036")}{" "}</p>
          <ul>
            <li><strong>{" "}{l("t037")}{" "}</strong>{" "}{l("t038")}{" "}</li>
            <li><strong>{" "}{l("t039")}{" "}</strong>{" "}{l("t040")}{" "}</li>
            <li><strong>{" "}{l("t041")}{" "}</strong>{" "}{l("t042")}{" "}</li>
            <li><strong>{" "}{l("t043")}{" "}</strong>{" "}{l("t044")}{" "}</li>
            <li><strong>{" "}{l("t045")}{" "}</strong>{" "}{l("t046")}{" "}</li>
            <li><strong>{" "}{l("t047")}{" "}</strong>{" "}{l("t048")}{" "}</li>
          </ul>
          <p>{" "}{l("t049")}{" "}</p>
        </section>

        <section>
          <h2>{" "}{l("t050")}{" "}</h2>
          <p>{" "}{l("t051")}{" "}</p>
          <p>{" "}{l("t052")}{" "}<strong>{" "}{l("t053")}{" "}</strong>{" "}{l("t054")}{" "}</p>
        </section>

        <section>
          <h2>{" "}{l("t055")}{" "}</h2>
          <p>{" "}{l("t056")}{" "}</p>
        </section>

        <section>
          <h2>{" "}{l("t057")}{" "}</h2>
          <ul>
            <li>{" "}{l("t058")}{" "}<strong>{" "}{l("t059")}{" "}</strong>{" "}{l("t060")}{" "}</li>
            <li>{" "}{l("t061")}{" "}</li>
            <li>{" "}{l("t062")}{" "}</li>
            <li>{" "}{l("t063")}{" "}</li>
          </ul>
          <p>{" "}{l("t064")}{" "}</p>
        </section>

        <section>
          <h2>{" "}{l("t065")}{" "}</h2>
          <p>{" "}{l("t066")}{" "}</p>
        </section>

        <section>
          <h2>{" "}{l("t067")}{" "}</h2>
          <p>{" "}{l("t068")}{" "}</p>
        </section>

        <section>
          <h2>{" "}{l("t069")}{" "}</h2>
          <p>{" "}{l("t070")}{" "}</p>
        </section>

        <section>
          <h2>{" "}{l("t071")}{" "}</h2>
          <p>{" "}{l("t072")}{" "}{" "}
            <a href="mailto:support@anytranslator.app">{" "}{l("t073")}{" "}</a>{" "}{l("t074")}{" "}</p>
        </section>

        <footer className="mk-small">
          <p>{" "}{l("t075")}{" "}</p>
        </footer>
      </article>
    </MarketingShell>
  );
};

export default PrivacyPolicy;
