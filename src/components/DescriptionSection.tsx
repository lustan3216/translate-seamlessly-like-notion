import { useLanguage } from "@/contexts/LanguageContext";
const DescriptionSection = () => {
  const { t } = useLanguage();
  return <section className="pt-5 pb-8 lg:pt-8 lg:pb-10"><div className="container mx-auto px-4 text-center">
    <h2 className="mx-auto max-w-4xl text-3xl sm:text-4xl font-bold leading-tight tracking-tight text-gray-950">{t("landing.featureTitle")}</h2>
    <p className="mx-auto mt-4 max-w-2xl text-base sm:text-lg leading-relaxed text-gray-600">{t("landing.featureBody")}</p>
  </div></section>;
};
export default DescriptionSection;
