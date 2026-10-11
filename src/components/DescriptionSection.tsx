import { useLanguage } from "@/contexts/LanguageContext";

const DescriptionSection = () => {
  const { t } = useLanguage();

  return (
    <section className="pt-12 pb-8 lg:pt-16 lg:pb-10">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-8 leading-tight">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{t('landing.featureTitle')}</span>
          </h2>

          <div className="space-y-2 text-lg lg:text-xl text-gray-600 leading-relaxed">
            <p>
              {t('landing.featureBody')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DescriptionSection;
