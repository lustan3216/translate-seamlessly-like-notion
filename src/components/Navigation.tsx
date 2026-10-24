import HugeIcon from "@/components/HugeIcon";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import AppStoreLink from "@/components/AppStoreLink";

const Navigation = () => {
  const { currentLanguage, setLanguage, t, languages } = useLanguage();

  return (
    <nav className="border-b border-border-light bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between py-4 px-4">
        <Link
          to={currentLanguage.code === "en" ? "/" : `/?lang=${currentLanguage.code}`}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0"
        >
          <img 
            src="/lovable-uploads/Logo.jpg" 
            alt="AnyTranslator" 
            className="h-8 w-8 rounded-[5px]"
          />
          <span className="hidden sm:inline text-base sm:text-notion-xl font-semibold text-text-primary">
            AnyTranslator
          </span>
        </Link>
        
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="sm" className="font-medium text-xs sm:text-sm px-2 sm:px-3" aria-label={t('landing.language')}>
                <HugeIcon name="language-square" className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">{currentLanguage.nativeName}</span>
                <HugeIcon name="arrow-down-01-round" className="hidden sm:inline-block sm:h-4 sm:w-4 sm:ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {languages.map((language) => (
                <DropdownMenuItem
                  key={language.code}
                  onClick={() => setLanguage(language)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <span>{language.nativeName}</span>
                  {currentLanguage.code === language.code && (
                    <HugeIcon name="tick-02" className="ml-auto h-4 w-4 text-blue-600" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <AppStoreLink source="navigation" className="inline-flex min-h-10 max-w-[55vw] items-center justify-center rounded-lg bg-blue-600 px-3 sm:px-4 text-center text-xs sm:text-sm font-semibold leading-tight text-white hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600">{t("landing.navDownload")}</AppStoreLink>
          <Link to={currentLanguage.code === "en" ? "/support" : `/support?lang=${currentLanguage.code}`} className="hidden md:inline-flex min-h-10 items-center rounded-lg px-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-950">{t("footer.support")}</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
