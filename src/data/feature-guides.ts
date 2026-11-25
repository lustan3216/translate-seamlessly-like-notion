import demoVideos from "./app-demo-videos.json";
import type { faqTopics } from "./faq-topics";

type FeatureGuideOptions = {
  faq?: ReadonlyArray<(typeof faqTopics)[number]>;
  abilityShots?: Readonly<Partial<Record<number, string>>>;
};

export const featureGuideOptions: Readonly<Partial<Record<string, FeatureGuideOptions>>> = {
  text: { faq: ["Accuracy", "Free"] },
  photos: { faq: ["Free"] },
  voice: { faq: ["Agent", "Free"] },
  chat: { faq: ["Agent", "Accuracy"], abilityShots: { 0: "chat-entry" } },
  menu: { faq: ["Scan", "Free"] },
  document: { faq: ["Scan", "Free"], abilityShots: { 0: "original" } },
  table: { faq: ["Scan", "Free"] },
  helper: { faq: ["Accuracy", "Free"] },
  keyboard: { faq: ["Keyboard"] },
  widget: { faq: ["Free"] },
};

const videos: Record<string, Record<string, { src: string }>> = demoVideos;
const stepImageSize = { width: 720, height: 540 };

export function featureStepImage(feature: string, locale: string, index: number) {
  const video = videos[locale === "zh-tw" ? "zh-tw" : "en"][feature];
  if (!video) return undefined;
  return {
    src: video.src.replace(/\.mp4$/, `-step-${index + 1}.webp`),
    ...stepImageSize,
  };
}
