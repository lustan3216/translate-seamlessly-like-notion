import type { ReactNode } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export const APP_STORE_URL = "https://apps.apple.com/app/id6738693321";

const AppStoreLink = ({ children, source, className = "" }: {
  children: ReactNode;
  source: string;
  className?: string;
}) => {
  const { currentLanguage } = useLanguage();

  const trackClick = () => {
    const detail = { source, language: currentLanguage.code, destination: "app_store" };
    window.dispatchEvent(new CustomEvent("anytranslator:download", { detail }));
    const analytics = window as Window & { dataLayer?: Array<Record<string, string>> };
    analytics.dataLayer?.push({ event: "app_store_click", ...detail });
  };

  return (
    <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer"
      data-download-source={source} onClick={trackClick} className={className}>
      {children}
    </a>
  );
};

export default AppStoreLink;
