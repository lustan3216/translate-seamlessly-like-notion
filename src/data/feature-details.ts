import base from "@/translations/marketing/feature-details-base.json";
import asia from "@/translations/marketing/feature-details-asia.json";
import europeA from "@/translations/marketing/feature-details-europe-a.json";
import europeB from "@/translations/marketing/feature-details-europe-b.json";
import { currentMainCopies } from "@/data/current-copy";

interface FeatureGuideSection {
  title: string;
  items: Array<{ title: string; body: string; shotId?: string }>;
}

export interface FeatureDetail {
  title: string;
  summary: string;
  heading: string;
  body: string;
  steps: string[];
  sections?: Array<{ title: string; body: string; items?: string[] }>;
  guide?: {
    steps?: {
      title: string;
      items: Array<{ title: string; body: string; image: { src: string; width: number; height: number } }>;
    };
    abilities?: FeatureGuideSection;
    situations?: FeatureGuideSection;
    faq?: Array<(typeof import("@/data/faq-topics").faqTopics)[number]>;
  };
}
export interface FeatureCopy {
  scan: { title: string; body: string };
  practiceTitle: string;
  features: Record<string, FeatureDetail>;
  workflows: Record<string, string[]>;
  documentArticle: { title: string; intro: string; tip: string; limit: string };
}
const baseline: Record<string, FeatureCopy> = { ...base, ...asia, ...europeA, ...europeB };
export const featureDetails: Record<string, FeatureCopy> = Object.fromEntries(
  Object.entries(currentMainCopies).map(([locale, copy]) => [locale, {
    ...baseline[locale], features: copy.features, workflows: copy.workflows,
    scan: copy.scan, documentArticle: copy.documentArticle,
  }]),
);
