import { useEffect, useId, useRef, type ComponentPropsWithoutRef, type CSSProperties } from "react";
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

function AppDemoVideo({ className, width, height, priority, ...props }: ComponentPropsWithoutRef<"video"> & {
  width: number;
  height: number;
  priority: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const ring = useRef<SVGPathElement>(null);
  const paint = useId();
  useEffect(() => {
    const video = ref.current;
    const outline = ring.current;
    const screen = video?.parentElement;
    if (!video || !outline || !screen || !("IntersectionObserver" in window)) return;

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

    let frame = 0;
    let outlineWidth = 0;
    let outlineHeight = 0;
    const drawProgress = () => {
      const share = video.duration > 0 ? video.currentTime / video.duration : 0;
      const w = screen.clientWidth;
      const h = screen.clientHeight;
      if (w !== outlineWidth || h !== outlineHeight) {
        outlineWidth = w;
        outlineHeight = h;
        const inset = 2;
        const right = w - inset;
        const bottom = h - inset;
        const rx = Math.max(0, w * 0.135 - inset);
        const ry = Math.max(0, h * 0.0625 - inset);
        // Start at the top centre and trace clockwise in CSS pixels, including the corners.
        outline.setAttribute("d", [
          `M ${w / 2} ${inset} H ${right - rx}`,
          `A ${rx} ${ry} 0 0 1 ${right} ${inset + ry} V ${bottom - ry}`,
          `A ${rx} ${ry} 0 0 1 ${right - rx} ${bottom} H ${inset + rx}`,
          `A ${rx} ${ry} 0 0 1 ${inset} ${bottom - ry} V ${inset + ry}`,
          `A ${rx} ${ry} 0 0 1 ${inset + rx} ${inset} Z`,
        ].join(" "));
      }
      outline.setAttribute("stroke-dasharray", `${share} 1`);
      if (!video.paused) frame = requestAnimationFrame(drawProgress);
    };
    const onPlay = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(drawProgress); };
    video.addEventListener("play", onPlay);
    video.addEventListener("seeked", drawProgress);
    return () => {
      observer.disconnect();
      observer.takeRecords();
      reducedMotion.removeEventListener("change", onMotionChange);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("seeked", drawProgress);
      cancelAnimationFrame(frame);
      video.pause();
    };
  }, []);

  return (
    <span className={`${className ?? ""} app-demo-frame`} style={{ "--app-demo-ratio": width / height } as CSSProperties}>
      <video
        {...props}
        className="app-demo-video"
        width={width}
        height={height}
        ref={ref}
        muted
        playsInline
        loop
        preload={priority ? "metadata" : "none"}
        data-image-source="app-demo-video"
      />
      <svg className="app-demo-progress" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id={`${paint}-progress`} x1="12%" y1="0%" x2="68%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
          <filter id={`${paint}-glow`}>
            <feGaussianBlur stdDeviation="1.65" />
            <feComponentTransfer><feFuncA type="linear" slope="0.32" /></feComponentTransfer>
            <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <path
          ref={ring}
          fill="none"
          stroke={`url(#${paint}-progress)`}
          strokeWidth="2.25"
          strokeLinecap="round"
          pathLength="1"
          strokeDasharray="0 1"
          filter={`url(#${paint}-glow)`}
        />
      </svg>
    </span>
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

export default AppScreen;
