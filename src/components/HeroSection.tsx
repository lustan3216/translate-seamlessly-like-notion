import { useLanguage } from "@/contexts/LanguageContext";
import HugeIcon from "@/components/HugeIcon";

const HeroSection = () => {
  const { t } = useLanguage();
  
  return (
    <section className="py-16 lg:py-20">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="min-w-0 text-center lg:text-left">
            
            <p className="text-sm font-semibold text-blue-700 mb-5 tracking-wide">{t('landing.eyebrow')}</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-text-primary mb-6 tracking-tight break-words leading-[1.12]">
              {t('landing.heroTitle')}
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {t('landing.heroAccent')}
              </span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-text-secondary mb-8 max-w-3xl lg:max-w-none mx-auto leading-relaxed">
              {t('landing.heroBody')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
              <div className="flex flex-col items-center lg:items-start">
                <a 
                  href="https://apps.apple.com/by/app/any-translator-ai-translate/id6738693321"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block hover:opacity-80 transition-opacity"
                >
                  <img 
                    src="/lovable-uploads/Download_on_the_App_Store_Badge.svg.png" 
                    alt={t('download.appStore')}
                    className="h-14 w-auto"
                  />
                </a>
                <p className="text-sm text-gray-600 mt-4 text-center lg:text-left">
                  {t('landing.heroNote')}
                </p>
              </div>
              <a href="#pro" className="inline-flex items-center gap-2 text-blue-700 font-medium py-3 px-4 rounded-lg hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600">
                {t('landing.proExplore')}
                <HugeIcon name="arrow-right-01-round" />
              </a>
            </div>
          </div>
          
          {/* Right Image */}
          <div className="hidden lg:block">
            <div className="relative">
              <img 
                src="/lovable-uploads/cute.jpg" 
                alt=""
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
