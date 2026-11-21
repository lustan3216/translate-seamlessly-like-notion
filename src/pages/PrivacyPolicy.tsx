import MarketingShell from "@/components/marketing/MarketingShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { getLegalCopy } from "@/data/legal-copy";
import { canonicalUrl } from "@/lib/site-config.mjs";
import "@/legal.css";
import SEO from "@/components/SEO";
import JsonLd, { createBreadcrumbSchema } from "@/components/JsonLd";

const sectionClass =
  "text-3xl font-bold text-gray-900 mt-12 mb-6 border-b-2 border-gray-200 pb-2";

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

      <div className="mk-wrap mk-legal">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-12 text-center">{" "}{l("t001")}{" "}</h1>
          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
            <div className="bg-green-50 border-l-4 border-green-500 p-6 mb-8">
              <p className="text-green-800 font-semibold mb-2">
                <strong>{" "}{l("t002")}{" "}</strong>{" "}{l("t003")}{" "}</p>
              <p className="text-green-700">
                <strong>{" "}{l("t004")}{" "}</strong>{" "}{l("t005")}{" "}</p>
            </div>

            <p className="text-lg text-gray-800 mb-4">{" "}{l("t006")}{" "}</p>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8">
              <p className="text-blue-900 font-semibold mb-2">{" "}{l("t007")}{" "}</p>
              <p className="text-blue-800 mb-0">{" "}{l("t008")}{" "}</p>
            </div>

            <h2 className={sectionClass}>{" "}{l("t009")}{" "}</h2>
            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">{" "}{l("t010")}{" "}</h3>
            <p>{" "}{l("t011")}{" "}</p>
            <ul className="list-disc pl-8 mb-6 space-y-2">
              <li>{" "}{l("t012")}{" "}</li>
              <li>{" "}{l("t013")}{" "}</li>
              <li>{" "}{l("t014")}{" "}</li>
              <li>{" "}{l("t015")}{" "}</li>
              <li>{" "}{l("t016")}{" "}</li>
            </ul>
            <p>{" "}{l("t017")}{" "}</p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">{" "}{l("t018")}{" "}</h3>
            <p>{" "}{l("t019")}{" "}</p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">{" "}{l("t020")}{" "}</h3>
            <p>{" "}{l("t021")}{" "}</p>
            <p>{" "}{l("t022")}{" "}</p>
            <h4 id="web-subscription-data" className="text-lg font-semibold text-gray-900 mt-6 mb-3">{l("webAccountTitle")}</h4>
            <p>{l("webAccountData")}</p>
            <p>{l("webSubscriptionData")}</p>
            <p><a href="https://www.creem.io/privacy">{l("creemPrivacyNotice")}</a></p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">{" "}{l("t023")}{" "}</h3>
            <p>{" "}{l("t024")}{" "}</p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">{" "}{l("t025")}{" "}</h3>
            <p>{" "}{l("t026")}{" "}</p>

            <h2 className={sectionClass}>{" "}{l("t027")}{" "}</h2>
            <ul className="list-disc pl-8 mb-6 space-y-2">
              <li>{" "}{l("t028")}{" "}</li>
              <li>{" "}{l("t029")}{" "}</li>
              <li>{" "}{l("t030")}{" "}</li>
              <li>{" "}{l("t031")}{" "}</li>
              <li>{" "}{l("t032")}{" "}</li>
              <li>{" "}{l("t033")}{" "}</li>
              <li>{" "}{l("t034")}{" "}</li>
            </ul>

            <h2 className={sectionClass}>{" "}{l("t035")}{" "}</h2>
            <p>{" "}{l("t036")}{" "}</p>
            <ul className="list-disc pl-8 mb-6 space-y-2">
              <li><strong>{" "}{l("t037")}{" "}</strong>{" "}{l("t038")}{" "}</li>
              <li><strong>{" "}{l("t039")}{" "}</strong>{" "}{l("t040")}{" "}</li>
              <li><strong>{" "}{l("t041")}{" "}</strong>{" "}{l("t042")}{" "}</li>
              <li><strong>{" "}{l("t043")}{" "}</strong>{" "}{l("t044")}{" "}</li>
              <li><strong>{" "}{l("t045")}{" "}</strong>{" "}{l("t046")}{" "}</li>
              <li><strong>{" "}{l("t047")}{" "}</strong>{" "}{l("t048")}{" "}</li>
            </ul>
            <p>{" "}{l("t049")}{" "}</p>

            <h2 className={sectionClass}>{" "}{l("t050")}{" "}</h2>
            <p>{" "}{l("t051")}{" "}</p>
            <p>{" "}{l("t052")}{" "}<strong>{" "}{l("t053")}{" "}</strong>{" "}{l("t054")}{" "}</p>

            <h2 className={sectionClass}>{" "}{l("t055")}{" "}</h2>
            <p>{" "}{l("t056")}{" "}</p>

            <h2 className={sectionClass}>{" "}{l("t057")}{" "}</h2>
            <ul className="list-disc pl-8 mb-6 space-y-2">
              <li>{" "}{l("t058")}{" "}<strong>{" "}{l("t059")}{" "}</strong>{" "}{l("t060")}{" "}</li>
              <li>{" "}{l("t061")}{" "}</li>
              <li>{" "}{l("t062")}{" "}</li>
              <li>{" "}{l("t063")}{" "}</li>
            </ul>
            <p>{" "}{l("t064")}{" "}</p>

            <h2 className={sectionClass}>{" "}{l("t065")}{" "}</h2>
            <p>{" "}{l("t066")}{" "}</p>

            <h2 className={sectionClass}>{" "}{l("t067")}{" "}</h2>
            <p>{" "}{l("t068")}{" "}</p>

            <h2 className={sectionClass}>{" "}{l("t069")}{" "}</h2>
            <p>{" "}{l("t070")}{" "}</p>

            <h2 className={sectionClass}>{" "}{l("t071")}{" "}</h2>
            <p>{" "}{l("t072")}{" "}{" "}
              <a href="mailto:support@anytranslator.app">{" "}{l("t073")}{" "}</a>{" "}{l("t074")}{" "}</p>

            <div className="text-center py-8 mt-12 border-t border-gray-200">
              <p className="text-sm text-gray-500">{" "}{l("t075")}{" "}</p>
            </div>
          </div>
        </div>
      </div>
    </MarketingShell>
  );
};

export default PrivacyPolicy;
