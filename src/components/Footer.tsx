import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";

const Footer = () => {
  const { t, currentLanguage } = useLanguage();
  return (
    <footer className="border-t border-border-light py-lg">
      <div className="container mx-auto flex items-center justify-center px-4">
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8">
          <a 
            href="https://apps.apple.com/by/app/any-translator-ai-translate/id6738693321"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <img 
              src="/lovable-uploads/Logo.jpg" 
              alt="AnyTranslator" 
              className="h-6 w-6 rounded-[5px]"
            />
            <span className="text-notion-base font-medium text-text-primary">
              AnyTranslator
            </span>
          </a>
          
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <Link to={`/support?lang=${currentLanguage.code}`} className="text-notion-sm text-text-muted hover:text-text-secondary transition-colors">
              {t('footer.support')}
            </Link>
            <Link to={`/terms-of-service?lang=${currentLanguage.code}`} className="text-notion-sm text-text-muted hover:text-text-secondary transition-colors">
              {t('footer.terms')}
            </Link>
            <Link to={`/privacy-policy?lang=${currentLanguage.code}`} className="text-notion-sm text-text-muted hover:text-text-secondary transition-colors">
              {t('footer.privacy')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
