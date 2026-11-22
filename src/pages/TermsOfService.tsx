import MarketingShell from "@/components/marketing/MarketingShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { getLegalCopy } from "@/data/legal-copy";
import { canonicalUrl } from "@/lib/site-config.mjs";
import "@/legal.css";
import SEO from "@/components/SEO";
import JsonLd, { createBreadcrumbSchema } from "@/components/JsonLd";

const sectionClass =
  "text-3xl font-bold text-gray-900 mt-12 mb-6 border-b-2 border-gray-200 pb-2";

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

      <div className="mk-wrap mk-legal">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-12 text-center">{" "}{l("t001")}{" "}</h1>
          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8">
              <p className="text-blue-800 font-semibold mb-2">
                <strong>{" "}{l("t002")}{" "}</strong>{" "}{l("t003")}{" "}</p>
              <p className="text-blue-700">
                <strong>{" "}{l("t004")}{" "}</strong>{" "}{l("t005")}{" "}</p>
            </div>

            <p className="text-lg text-gray-800 mb-4">{" "}{l("t006")}{" "}</p>

            <h2 className={sectionClass}>{" "}{l("t007")}{" "}</h2>
            <p>{" "}{l("t008")}{" "}</p>
            <p>{" "}{l("t009")}{" "}</p>

            <h2 className={sectionClass}>{" "}{l("t010")}{" "}</h2>
            <p>{" "}{l("t011")}{" "}</p>
            <ul className="list-disc pl-8 mb-6 space-y-2">
              <li>{" "}{l("t012")}{" "}</li>
              <li>{" "}{l("t013")}{" "}</li>
              <li>{" "}{l("t014")}{" "}</li>
              <li>{" "}{l("t015")}{" "}</li>
              <li>{" "}{l("t016")}{" "}</li>
            </ul>
            <p>{" "}{l("t017")}{" "}</p>
            <h3 id="web-subscriptions" className="text-xl font-semibold text-gray-900 mt-8 mb-4">{l("webSubscriptionTitle")}</h3>
            <p>{l("webSubscriptionMerchant")}</p>
            <p>{l("webSubscriptionRenewal")}</p>
            <p>{l("webSubscriptionCancel")}</p>
            <p>{refundBefore}<a href="mailto:support@anytranslator.app">{l("t047")}</a>{refundAfter}</p>
            <p><a href="https://www.creem.io/buyer-terms">{l("creemBuyerTerms")}</a></p>

            <h2 className={sectionClass}>{" "}{l("t018")}{" "}</h2>
            <p>{" "}{l("t019")}{" "}</p>

            <h2 className={sectionClass}>{" "}{l("t020")}{" "}</h2>
            <p>{" "}{l("t021")}{" "}</p>
            <p>{" "}{l("t022")}{" "}</p>

            <h2 className={sectionClass}>{" "}{l("t023")}{" "}</h2>
            <p>{" "}{l("t024")}{" "}</p>

            <h2 className={sectionClass}>{" "}{l("t025")}{" "}</h2>
            <p>{" "}{l("t026")}{" "}</p>
            <ul className="list-disc pl-8 mb-6 space-y-2">
              <li>{" "}{l("t027")}{" "}</li>
              <li>{" "}{l("t028")}{" "}</li>
              <li>{" "}{l("t029")}{" "}</li>
              <li>{" "}{l("t030")}{" "}</li>
              <li>{" "}{l("t031")}{" "}</li>
              <li>{" "}{l("t032")}{" "}</li>
            </ul>

            <h2 className={sectionClass}>{" "}{l("t033")}{" "}</h2>
            <p>{" "}{l("t034")}{" "}</p>
            <p>{" "}{l("t035")}{" "}</p>

            <h2 className={sectionClass}>{" "}{l("t036")}{" "}</h2>
            <p>{" "}{l("t037")}{" "}</p>

            <h2 className={sectionClass}>{" "}{l("t038")}{" "}</h2>
            <p>{" "}{l("t039")}{" "}</p>

            <h2 className={sectionClass}>{" "}{l("t040")}{" "}</h2>
            <p>{" "}{l("t041")}{" "}</p>
            <p>{" "}{l("t042")}{" "}</p>

            <h2 className={sectionClass}>{" "}{l("t043")}{" "}</h2>
            <p>{" "}{l("t044")}{" "}</p>

            <h2 className={sectionClass}>{" "}{l("t045")}{" "}</h2>
            <p>{" "}{l("t046")}{" "}{" "}
              <a href="mailto:support@anytranslator.app">{" "}{l("t047")}{" "}</a>{" "}{l("t048")}{" "}</p>

            <div className="text-center py-8 mt-12 border-t border-gray-200">
              <p className="text-sm text-gray-500">{" "}{l("t049")}{" "}</p>
            </div>
          </div>
        </div>
      </div>
    </MarketingShell>
  );
};

export default TermsOfService;
