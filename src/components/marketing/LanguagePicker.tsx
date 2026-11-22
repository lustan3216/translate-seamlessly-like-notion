import HugeIcon from "@/components/HugeIcon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation } from "react-router-dom";
import { localesForPath } from "@/lib/site-config.mjs";

export default function LanguagePicker({ full = false }: { full?: boolean }) {
  const { t, languages, currentLanguage, setLanguage } = useLanguage();
  const { pathname } = useLocation();
  const available = localesForPath(pathname);

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={
            full ? "mk-language-full" : "mk-language mk-language-trigger"
          }
          aria-label={`${t("landing.language")}: ${currentLanguage.nativeName}`}
          data-testid={
            full ? "language-picker-mobile" : "language-picker-header"
          }
        >
          <HugeIcon name="language-square" />
          {full && <span>{currentLanguage.nativeName}</span>}
          {full && <HugeIcon name="arrow-down-01-round" />}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        collisionPadding={16}
        className="mk-language-menu"
        aria-label={t("landing.language")}
        data-marketing-language-menu
      >
        {languages.filter((language) => available.some(({ code }) => code === language.code)).map((language) => (
          <DropdownMenuItem
            key={language.code}
            role="menuitemradio"
            aria-checked={currentLanguage.code === language.code}
            textValue={language.nativeName}
            className="mk-language-option"
            onSelect={() => setLanguage(language)}
          >
            <span lang={language.code}>{language.nativeName}</span>
            {currentLanguage.code === language.code && (
              <HugeIcon name="tick-02" className="mk-language-check" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
