import HugeIcon from "@/components/HugeIcon";
import { useLanguage } from "@/contexts/LanguageContext";

const ProSection = () => {
  const { t } = useLanguage();
  const benefits = [
    { id: "Text", icon: "language-square" },
    { id: "Voice", icon: "mic-01" },
    { id: "Knowledge", icon: "book" },
    { id: "Widget", icon: "book" },
  ];

  return (
    <section id="pro" aria-labelledby="pro-title" className="py-16 lg:py-20 scroll-mt-24">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto rounded-3xl bg-gradient-to-br from-blue-50 to-purple-50 p-6 sm:p-10 lg:p-14">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <p className="text-sm font-semibold text-blue-700 tracking-wide mb-4">{t("landing.proEyebrow")}</p>
            <h2 id="pro-title" className="text-3xl lg:text-5xl font-bold text-gray-900 leading-tight break-words mb-5">{t("landing.proTitle")}</h2>
            <p className="text-lg text-gray-600 leading-relaxed">{t("landing.proBody")}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {benefits.map(({ id, icon }) => (
              <div key={id} className="rounded-2xl bg-white/80 p-6 min-w-0">
                <HugeIcon name={icon} className="w-7 h-7 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{t(`landing.pro${id}Title`)}</h3>
                <p className="text-gray-600 leading-relaxed">{t(`landing.pro${id}Body`)}</p>
              </div>
            ))}
          </div>
          <div className="mt-9 text-center">
            <a href="https://apps.apple.com/by/app/any-translator-ai-translate/id6738693321" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white font-medium rounded-xl px-6 py-4 hover:bg-blue-700 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600">
              {t("landing.proCta")}
              <HugeIcon name="arrow-right-01-round" />
            </a>
            <p className="text-sm text-gray-600 leading-relaxed max-w-2xl mx-auto mt-4">{t("landing.proNote")}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProSection;
