import { useEffect, useRef, type ComponentPropsWithoutRef, type CSSProperties } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import appDemoVideos from "@/data/app-demo-videos.json";
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
type DemoVideo = NativeScreen & { poster: string };
const demoVideos: Partial<Record<"zh-tw" | "en", Partial<Record<ScreenFeature, DemoVideo>>>> = appDemoVideos;
const screens: Record<
  string,
  Partial<Record<ScreenFeature, NativeProductScreen>>
> = nativeScreens;
const localizedScreens: Record<string, Array<NativeScreen & { sourceNative: string; kind: string; displayCropBottom?: number }>> = localizedUiScreens;

function AppDemoVideo({ priority, ...props }: ComponentPropsWithoutRef<"video"> & { priority: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = ref.current;
    if (!video || !("IntersectionObserver" in window)) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let inView = false;
    const syncPlayback = () => {
      if (inView && !reducedMotion.matches) {
        video.muted = true;
        void video.play().catch((error: DOMException) => {
          if (error.name !== "AbortError" && video.isConnected) video.load();
        });
      } else {
        video.pause();
      }
    };
    const onMotionChange = () => {
      if (reducedMotion.matches) video.load(); // Reset to the poster even after playback began.
      else syncPlayback();
    };
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      syncPlayback();
    });
    observer.observe(video);
    reducedMotion.addEventListener("change", onMotionChange);
    return () => {
      observer.disconnect();
      observer.takeRecords();
      reducedMotion.removeEventListener("change", onMotionChange);
      video.pause();
    };
  }, []);

  return (
    <video
      {...props}
      ref={ref}
      muted
      playsInline
      loop
      preload={priority ? "metadata" : "none"}
      data-image-source="app-demo-video"
    />
  );
}

const AppScreen = ({
  feature,
  alt,
  className = "",
  priority = false,
  shotId,
  still = false,
}: {
  feature: ScreenFeature;
  alt?: string;
  className?: string;
  priority?: boolean;
  shotId?: string;
  still?: boolean;
}) => {
  const { currentLanguage, t } = useLanguage();
  const video = !shotId && !still
    ? demoVideos[currentLanguage.code === "zh-tw" ? "zh-tw" : "en"]?.[feature]
    : undefined;
  const nativeLocale = screens[currentLanguage.code]?.[feature] ? currentLanguage.code : "zh-tw";
  const product = screens[nativeLocale]?.[feature];
  const screen = shotId
    ? product?.gallery?.find((shot) => shot.shotId === shotId)
    : product;
  // A missing new capture stays absent instead of silently displaying an old or generated App UI.
  const localizedScreen = screen && localizedScreens[currentLanguage.code]?.find((entry) =>
    entry.sourceNative === screen.src && entry.kind === "gpt-image-ui-edit"
  );
  const displayedScreen = video || localizedScreen || screen;
  if (!displayedScreen) return <span hidden data-native-capture-pending={feature} />;
  const sharedExample = screen && sharedExampleScreens.includes(screen.src);
  if (!video && nativeLocale !== currentLanguage.code && !localizedScreen && !sharedExample)
    return <span hidden data-localized-capture-pending={`${currentLanguage.code}/${feature}/${shotId || "primary"}`} />;
  const label = alt || getCurrentMainCopy(currentLanguage.code).extras.imageAlt[`${feature}.${shotId || "primary"}`] || featureDetails[currentLanguage.code]?.features[feature]?.title || t(`landing.${feature}Title`);
  const style: CSSProperties | undefined = localizedScreen?.displayCropBottom ? {
    aspectRatio: `${localizedScreen.width} / ${localizedScreen.height - localizedScreen.displayCropBottom}`,
    height: "auto",
    objectFit: "cover",
    objectPosition: "top",
  } : undefined;
  const mediaProps = {
    width: displayedScreen.width,
    height: displayedScreen.height,
    "data-feature": feature,
    "data-native-shot": shotId || "primary",
    style,
    className: `native-app-screen block max-w-full h-auto object-contain ${className}`,
  };
  if (video) {
    return (
      <AppDemoVideo
        {...mediaProps}
        key={video.src}
        src={video.src}
        poster={video.poster}
        aria-label={label}
        priority={priority}
      />
    );
  }
  return (
    <img
      {...mediaProps}
      src={displayedScreen.src}
      srcSet={localizedScreen ? undefined : screen?.srcSet}
      sizes="(max-width: 767px) calc(100vw - 48px), 360px"
      alt={label}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      data-image-source={localizedScreen ? "gpt-image-ui-edit" : "native-app-screenshot"}
      data-source-native={localizedScreen?.sourceNative}
      data-native-locale={localizedScreen ? undefined : nativeLocale}
      data-example-languages={sharedExample ? "en,zh-Hant" : undefined}
      data-display-crop-bottom={localizedScreen?.displayCropBottom}
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
