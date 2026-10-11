import { useLanguage } from "@/contexts/LanguageContext";
import HugeIcon from "@/components/HugeIcon";

const FeatureSection = () => {
  const { t } = useLanguage();
  
  const features = [
    { id: 'helper', icon: 'bubble-chat-question' },
    { id: 'photos', icon: 'image-01' },
    { id: 'keyboard', icon: 'keyboard-01' },
    { id: 'widget', icon: 'book' },
    { id: 'knowledge', icon: 'book' },
    { id: 'history', icon: 'clock-01' },
  ];

  return (
    <section className="py-12 lg:py-16 scroll-mt-24" id="everyday" aria-labelledby="everyday-title">
      <div className="container mx-auto px-4">
        <h2 id="everyday-title" className="text-3xl lg:text-4xl font-bold text-gray-900 text-center leading-tight max-w-4xl mx-auto mb-10">{t('landing.everydayTitle')}</h2>
        <div className="grid md:grid-cols-2 gap-xl max-w-5xl mx-auto">
          {features.map((feature) => (
            <article key={feature.id} data-feature={feature.id} className="flex items-start gap-4 min-w-0">
              <div className="flex-shrink-0">
                <HugeIcon name={feature.icon} className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1 space-y-4">
                <h3 className="text-notion-xl font-medium text-text-primary leading-relaxed">
                  {t(`landing.${feature.id}Title`)}
                </h3>
                <p className="text-notion-base text-text-secondary whitespace-pre-line">
                  {t(`landing.${feature.id}Body`)}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
