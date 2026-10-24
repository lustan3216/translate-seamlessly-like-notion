import { useLanguage } from "@/contexts/LanguageContext";
import HugeIcon from "@/components/HugeIcon";
import AppStoreLink from "@/components/AppStoreLink";
import AppScreen from "@/components/AppScreen";

const HeroSection = () => {
  const { t } = useLanguage();
  const actions = (source: string) => <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
    <AppStoreLink source={source} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600">{t("landing.navDownload")}<HugeIcon name="arrow-right-01-round" /></AppStoreLink>
    <a href="#features" className="inline-flex min-h-12 items-center gap-2 rounded-xl px-4 py-3 font-medium text-blue-700 hover:bg-blue-50">{t("landing.explore")}<HugeIcon name="arrow-down-01-round" /></a>
  </div>;
  return <section className="pt-10 pb-12 sm:pt-14 lg:pt-20 lg:pb-20">
    <div className="container mx-auto px-4"><div className="grid items-center gap-8 lg:grid-cols-[1fr_1.12fr] lg:gap-12">
      <div className="min-w-0 text-center lg:text-left">
        <p className="mb-4 text-xs sm:text-sm font-semibold tracking-wide text-blue-700">{t("landing.eyebrow")}</p>
        <h1 className="text-4xl sm:text-5xl xl:text-6xl font-bold leading-[1.16] tracking-tight text-gray-950 break-words">{t("landing.heroTitle")}<br /><span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{t("landing.heroAccent")}</span></h1>
        <p className="mx-auto mt-5 max-w-xl text-base sm:text-lg leading-relaxed text-gray-600 lg:mx-0">{t("landing.heroBody")}</p>
        <div className="mt-7 hidden lg:block">{actions("hero")}</div>
        <p className="mt-4 hidden text-sm text-gray-500 lg:block">{t("landing.heroNote")}</p>
        <p className="mt-3 text-xs sm:text-sm font-medium text-gray-500">{t("landing.platform")}</p>
      </div>
      <div className="min-w-0 rounded-3xl bg-gradient-to-br from-blue-50 via-purple-50/70 to-pink-50 px-3 pt-5 pb-6 sm:px-6 sm:pt-7 sm:pb-8" aria-label={t("landing.explore")}>
        <div className="grid grid-cols-3 items-start gap-3 sm:gap-5">{(["agent", "menu", "keyboard"] as const).map((feature, index) => <a key={feature} href={`#feature-${feature}`} className="group min-w-0 rounded-2xl text-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600">
          <p className="mb-3 min-h-9 text-xs sm:text-sm font-semibold leading-snug text-gray-800 [overflow-wrap:anywhere]">{t(`landing.${feature}Label`)}</p>
          <AppScreen feature={feature} priority={index === 0} className="w-full rounded-xl sm:rounded-2xl shadow-[0_10px_24px_-12px_rgba(15,23,42,0.25)] transition-transform duration-200 motion-safe:group-hover:-translate-y-1" />
        </a>)}</div>
      </div>
      <div className="-mt-1 text-center lg:hidden">{actions("hero-mobile")}<p className="mt-3 text-xs text-gray-500">{t("landing.heroNote")}</p></div>
    </div></div>
  </section>;
};
export default HeroSection;
