import HugeIcon from "@/components/HugeIcon";
import { useLanguage } from "@/contexts/LanguageContext";

const FeatureCards = () => {
  const { t, currentLanguage } = useLanguage();
  const screenshotLocale = currentLanguage.code === "ru" ? "ru" : "en";
  const cards = [
    { id: "menu", screen: "menu", icon: "restaurant-01", gradient: "from-pink-100/70 to-pink-50/50", accent: "bg-pink-100 text-pink-700" },
    { id: "agent", screen: "agent", icon: "bot", gradient: "from-green-100/70 to-green-50/50", accent: "bg-green-100 text-green-700" },
    { id: "document", screen: "document", icon: "file-search", gradient: "from-purple-100/50 to-purple-50/30", accent: "bg-purple-100 text-purple-700" },
    { id: "voice", screen: "voice", icon: "mic-01", gradient: "from-orange-100/50 to-orange-50/30", accent: "bg-orange-100 text-orange-700" },
    { id: "text", screen: "translate", icon: "language-square", gradient: "from-blue-100/50 to-blue-50/30", accent: "bg-blue-100 text-blue-700" },
    { id: "chat", screen: "chat", icon: "bubble-chat-question", gradient: "from-indigo-100/50 to-indigo-50/30", accent: "bg-indigo-100 text-indigo-700" },
  ];
  const menuSource = currentLanguage.code === "ru"
    ? "https://commons.wikimedia.org/wiki/File:Menu_(Brunch)_-_Mange_Tout.jpg"
    : "https://commons.wikimedia.org/wiki/File:Цены_на_кофе_в_Москве_(ЦАО,_декабрь_2016).jpg";
  const menuLicense = currentLanguage.code === "ru" ? "CC0" : "CC BY-SA 4.0";
  const menuCredit = t("landing.sampleCredit").split(menuLicense);

  return (
    <section className="pb-12 lg:pb-16 scroll-mt-24" id="features">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {cards.map((card) => {
              const featured = card.id === "menu" || card.id === "agent";
              const title = t(`landing.${card.id}Title`);

              return (
                <article key={card.id} data-feature={card.id} className={`min-w-0 rounded-3xl bg-gradient-to-br ${card.gradient} p-6 ${featured ? "xl:col-span-2 sm:p-8" : ""}`}>
                  <div className={featured ? "grid gap-8 xl:grid-cols-[minmax(0,1fr)_200px] xl:items-center h-full" : "flex flex-col h-full"}>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        <span className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${card.accent}`}>
                          <HugeIcon name={card.icon} className="h-5 w-5" />
                          {featured && t(`landing.${card.id}Label`)}
                        </span>
                      </div>
                      <h3 className={`font-semibold text-gray-900 mb-3 leading-snug break-words ${featured ? "text-2xl xl:text-3xl" : "text-xl"}`}>{title}</h3>
                      <p className="text-gray-600 leading-relaxed">{t(`landing.${card.id}Body`)}</p>
                      <a href="https://apps.apple.com/by/app/any-translator-ai-translate/id6738693321" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-blue-700 hover:text-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600">
                        {t("features.tryIt")}
                        <HugeIcon name="arrow-right-01-round" />
                      </a>
                    </div>
                    <div className={`flex justify-center ${featured ? "" : "mt-auto pt-6"}`}>
                      <img
                        src={`/app-preview/screens/${screenshotLocale}/${card.screen}.png`}
                        alt={title}
                        className={`max-w-full h-auto object-contain rounded-[24px] border border-black/5 shadow-xl ${featured ? "w-[224px] xl:w-[200px]" : "w-[200px] xl:w-[180px]"}`}
                        width="1320" height="2868" loading="lazy" decoding="async"
                      />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          <p className="mt-5 text-center text-xs text-text-muted leading-relaxed">
            <a href={menuSource} target="_blank" rel="noopener noreferrer" className="underline">{menuCredit[0]}</a>
            <a href={menuLicense === "CC0" ? "https://creativecommons.org/publicdomain/zero/1.0/" : "https://creativecommons.org/licenses/by-sa/4.0/"} target="_blank" rel="noopener noreferrer" className="underline">{menuLicense}</a>{menuCredit[1]}
            <br />
            <a href="https://www.nps.gov/zion/planyourvisit/publications.htm" target="_blank" rel="noopener noreferrer" className="underline">{t("landing.documentCredit")}</a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default FeatureCards;
