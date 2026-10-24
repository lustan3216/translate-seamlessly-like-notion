import { useLanguage } from "@/contexts/LanguageContext";
import { Link, useLocation } from "react-router-dom";
const Footer = () => {
  const { t, currentLanguage, languages } = useLanguage();
  const { pathname } = useLocation();
  const languagePath = ["/terms-of-service", "/privacy-policy"].includes(pathname) ? "/" : pathname;
  return <footer className="border-t border-gray-100 py-9"><div className="container mx-auto px-4">
    <div className="flex flex-wrap items-center justify-between gap-5">
      <Link to={currentLanguage.code === "en" ? "/" : `/?lang=${currentLanguage.code}`} className="flex items-center gap-3 font-semibold text-gray-900"><img src="/app-preview/logo.png" alt="" width="28" height="28" className="rounded-lg" />AnyTranslator</Link>
      <div className="flex flex-wrap items-center gap-5 text-sm text-gray-500">
        <Link to={currentLanguage.code === "en" ? "/support" : `/support?lang=${currentLanguage.code}`} className="hover:text-blue-700">{t("footer.support")}</Link>
        <Link to="/terms-of-service" className="hover:text-blue-700">{t("footer.terms")}</Link>
        <Link to="/privacy-policy" className="hover:text-blue-700">{t("footer.privacy")}</Link>
      </div>
    </div>
    <nav aria-label={t("landing.language")} className="mt-7 flex flex-wrap justify-center gap-x-5 gap-y-3 text-xs text-gray-500">{languages.map(language => <a key={language.code} href={languagePath + (language.code === "en" ? "" : `?lang=${language.code}`)} hrefLang={language.code} lang={language.code} aria-current={language.code === currentLanguage.code ? "page" : undefined} className="hover:text-blue-700 aria-[current=page]:text-blue-700">{language.nativeName}</a>)}</nav>
  </div></footer>;
};
export default Footer;
