import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/contexts/LanguageContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link } from "react-router-dom";

const Navigation = () => {
  const { currentLanguage, setLanguage, t, languages } = useLanguage();
  const isMobile = useIsMobile();

  return (
    <nav className="border-b border-border-light bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between py-4 px-4">
        <a 
          href="https://apps.apple.com/by/app/any-translator-ai-translate/id6738693321"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0"
        >
          <img 
            src="/lovable-uploads/Logo.jpg" 
            alt="AnyTranslator" 
            className="h-8 w-8 rounded-[5px]"
          />
          <span className="text-notion-xl font-semibold text-text-primary">
            AnyTranslator
          </span>
        </a>
        
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="sm" className="font-medium text-xs sm:text-sm px-2 sm:px-3">
                <span className="mr-1 sm:mr-2">{currentLanguage.flag}</span>
                {isMobile ? '' : t('nav.language')}
                <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {languages.map((language) => (
                <DropdownMenuItem
                  key={language.code}
                  onClick={() => setLanguage(language)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <span>{language.flag}</span>
                  <span>{language.nativeName}</span>
                  {currentLanguage.code === language.code && (
                    <span className="ml-auto text-blue-600">✓</span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <a 
            href="https://apps.apple.com/by/app/any-translator-ai-translate/id6738693321"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="primary" size="sm" className="font-medium text-white text-xs sm:text-sm px-2 sm:px-3">
              {isMobile ? t('nav.openApp').split(' ')[0] : t('nav.openApp')}
            </Button>
          </a>
          <Link to="/support">
            <Button variant="ghost" size="sm" className="font-medium text-xs sm:text-sm px-2 sm:px-3 text-text-secondary hover:text-text-primary">
              {t('footer.support')}
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;