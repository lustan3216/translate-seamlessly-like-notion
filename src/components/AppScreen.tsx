import { useLanguage } from "@/contexts/LanguageContext";
import screens from "@/data/product-screens.json";

export type ScreenFeature = "agent" | "menu" | "document" | "keyboard" | "widget" | "voice" | "text" | "chat" | "helper";

const AppScreen = ({ feature, className = "", priority = false }: {
  feature: ScreenFeature;
  className?: string;
  priority?: boolean;
}) => {
  const { currentLanguage, t } = useLanguage();
  const localeScreens = screens[currentLanguage.code] || screens.en;
  const screen = localeScreens[feature];

  return (
    <img src={screen.src} width={screen.width} height={screen.height}
      alt={t(`landing.${feature}Title`)} loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={`block max-w-full h-auto object-contain ${className}`} />
  );
};

export default AppScreen;
