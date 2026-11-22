import { useLanguage } from "@/contexts/LanguageContext";
import nativeScreens from "@/data/native-product-screens.json";
import localizedUiScreens from "@/data/localized-ui-screens.json";
import { featureDetails } from "@/data/feature-details";
import sharedExampleScreens from "@/data/shared-example-screens.json";
import { getCurrentMainCopy } from "@/data/current-copy";

export type ScreenFeature =
  | "agent"
  | "menu"
  | "document"
  | "keyboard"
  | "widget"
  | "voice"
  | "text"
  | "photos"
  | "chat"
  | "helper"
  | "table"
  | "screen-translation";
type NativeScreen = { src: string; srcSet?: string; width: number; height: number; alt?: string };
type NativeProductScreen = NativeScreen & {
  gallery?: Array<NativeScreen & { shotId: string }>;
};
const screens: Record<
  string,
  Partial<Record<ScreenFeature, NativeProductScreen>>
> = nativeScreens;
const localizedScreens: Record<string, Array<NativeScreen & { sourceNative: string; kind: string; displayCropBottom?: number }>> = localizedUiScreens;

const AppScreen = ({
  feature,
  alt,
  className = "",
  priority = false,
  shotId,
}: {
  feature: ScreenFeature;
  alt?: string;
  className?: string;
  priority?: boolean;
  shotId?: string;
}) => {
  const { currentLanguage, t } = useLanguage();
  const nativeLocale = screens[currentLanguage.code]?.[feature] ? currentLanguage.code : "zh-tw";
  const product = screens[nativeLocale]?.[feature];
  const screen = shotId
    ? product?.gallery?.find((shot) => shot.shotId === shotId)
    : product;
  // A missing new capture stays absent instead of silently displaying an old or generated App UI.
  if (!screen) return <span hidden data-native-capture-pending={feature} />;
  const localizedScreen = localizedScreens[currentLanguage.code]?.find((entry) =>
    entry.sourceNative === screen.src && entry.kind === "gpt-image-ui-edit"
  );
  const sharedExample = sharedExampleScreens.includes(screen.src);
  if (nativeLocale !== currentLanguage.code && !localizedScreen && !sharedExample)
    return <span hidden data-localized-capture-pending={`${currentLanguage.code}/${feature}/${shotId || "primary"}`} />;
  const displayedScreen = localizedScreen || screen;
  return (
    <img
      src={displayedScreen.src}
      srcSet={localizedScreen ? undefined : screen.srcSet}
      sizes="(max-width: 767px) calc(100vw - 48px), 360px"
      width={displayedScreen.width}
      height={displayedScreen.height}
      alt={alt || getCurrentMainCopy(currentLanguage.code).extras.imageAlt[`${feature}.${shotId || "primary"}`] || featureDetails[currentLanguage.code]?.features[feature]?.title || t(`landing.${feature}Title`)}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      data-image-source={localizedScreen ? "gpt-image-ui-edit" : "native-app-screenshot"}
      data-source-native={localizedScreen?.sourceNative}
      data-native-locale={localizedScreen ? undefined : nativeLocale}
      data-example-languages={sharedExample ? "en,zh-Hant" : undefined}
      data-display-crop-bottom={localizedScreen?.displayCropBottom}
      data-feature={feature}
      data-native-shot={shotId || "primary"}
      style={localizedScreen?.displayCropBottom ? {
        aspectRatio: `${localizedScreen.width} / ${localizedScreen.height - localizedScreen.displayCropBottom}`,
        height: "auto",
        objectFit: "cover",
        objectPosition: "top",
      } : undefined}
      className={`native-app-screen block max-w-full h-auto object-contain ${className}`}
    />
  );
};

export function AppScreenGallery({
  feature,
  className = "",
}: {
  feature: ScreenFeature;
  className?: string;
}) {
  const { currentLanguage, t } = useLanguage();
  const shots = (screens[currentLanguage.code] || screens["zh-tw"])?.[feature]?.gallery;
  if (!shots?.length) return null;
  const title = t(`landing.${feature}Title`);
  return (
    <div
      className={`mk-native-gallery ${className}`}
      data-count={shots.length}
      role="group"
      aria-label={title}
    >
      {shots.map((shot) => (
        <div className="mk-native-gallery-item mk-photo-stage mk-photo-stage--shore" key={shot.shotId}>
          <AppScreen feature={feature} shotId={shot.shotId} />
        </div>
      ))}
    </div>
  );
}
export default AppScreen;
