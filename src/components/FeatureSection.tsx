import { useLanguage } from "@/contexts/LanguageContext";
import HugeIcon from "@/components/HugeIcon";
const FeatureSection = () => {
  const { t } = useLanguage();
  return <section className="scroll-mt-24 py-10 lg:py-16" id="everyday" aria-labelledby="everyday-title"><div className="container mx-auto px-4">
    <h2 id="everyday-title" className="mx-auto mb-8 max-w-4xl text-center text-2xl sm:text-3xl font-bold leading-tight text-gray-950">{t("landing.everydayTitle")}</h2>
    <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">{[{ id: "photos", icon: "image-01" }, { id: "knowledge", icon: "book" }, { id: "history", icon: "clock-01" }].map(({ id, icon }) => <article key={id} data-feature={id} className="min-w-0 rounded-2xl bg-gray-50 p-6">
      <HugeIcon name={icon} className="mb-4 h-6 w-6 text-blue-600" /><h3 className="text-xl font-semibold leading-snug text-gray-950">{t(`landing.${id}Title`)}</h3><p className="mt-3 text-base leading-relaxed text-gray-600">{t(`landing.${id}Body`)}</p>
    </article>)}</div>
  </div></section>;
};
export default FeatureSection;
