import HugeIcon from "@/components/HugeIcon";
import AppScreen, { type ScreenFeature } from "@/components/AppScreen";
import AppStoreLink from "@/components/AppStoreLink";
import { useLanguage } from "@/contexts/LanguageContext";
const cards: Array<{ id: ScreenFeature; icon: string; background: string }> = [
  { id: "agent", icon: "bot", background: "from-green-50 to-emerald-50/40" },
  { id: "menu", icon: "restaurant-01", background: "from-pink-50 to-rose-50/40" },
  { id: "document", icon: "file-search", background: "from-purple-50 to-violet-50/40" },
  { id: "keyboard", icon: "keyboard-01", background: "from-blue-50 to-sky-50/40" },
  { id: "widget", icon: "book", background: "from-amber-50 to-yellow-50/40" },
  { id: "voice", icon: "mic-01", background: "from-orange-50 to-amber-50/40" },
  { id: "text", icon: "language-square", background: "from-sky-50 to-blue-50/40" },
  { id: "chat", icon: "bubble-chat-question", background: "from-indigo-50 to-purple-50/40" },
  { id: "helper", icon: "book", background: "from-teal-50 to-green-50/40" },
];
const FeatureCards = () => {
  const { t } = useLanguage();
  return <section className="scroll-mt-24 pb-8 lg:pb-12" id="features"><div className="container mx-auto px-4"><div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 md:grid-cols-6 lg:gap-6">
    {cards.map(({ id, icon, background }, index) => {
      const featured = id === "agent" || id === "menu";
      return <article key={id} id={`feature-${id}`} data-feature={id} className={`min-w-0 scroll-mt-24 overflow-hidden rounded-3xl bg-gradient-to-br ${background} p-6 sm:p-7 ${index < 6 ? "md:col-span-3" : "md:col-span-2"}`}>
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-600"><HugeIcon name={icon} className="h-5 w-5" />{t(`landing.${id}Label`)}</div>
        <h3 className={`font-semibold leading-snug tracking-tight text-gray-950 ${featured ? "text-2xl sm:text-3xl" : "text-2xl"}`}>{t(`landing.${id}Title`)}</h3>
        <p className="mt-3 text-base leading-relaxed text-gray-600">{t(`landing.${id}Body`)}</p>
        {featured && <ol className="mt-5 grid grid-cols-3 gap-3 break-words text-xs sm:text-sm leading-snug text-gray-600" aria-label={t(`landing.${id}Label`)}>{[1, 2, 3].map(step => <li key={step}><span className="mb-2 block text-lg font-semibold text-blue-600">{step.toString().padStart(2, "0")}</span>{t(`landing.${id}Step${step}`)}</li>)}</ol>}
        <div className={`mx-auto mt-7 flex justify-center ${featured ? "h-[420px] sm:h-[460px]" : "h-[360px] sm:h-[390px]"}`}><AppScreen feature={id} className="max-h-full w-auto rounded-2xl shadow-[0_12px_28px_-16px_rgba(15,23,42,0.3)]" /></div>
        <AppStoreLink source={`feature-${id}`} className="mt-6 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600">{t("landing.navDownload")}<HugeIcon name="arrow-right-01-round" /></AppStoreLink>
      </article>;
    })}
  </div></div></section>;
};
export default FeatureCards;
