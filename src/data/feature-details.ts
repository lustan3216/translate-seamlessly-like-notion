import base from "@/translations/marketing/feature-details-base.json";
import asia from "@/translations/marketing/feature-details-asia.json";
import europeA from "@/translations/marketing/feature-details-europe-a.json";
import europeB from "@/translations/marketing/feature-details-europe-b.json";
import { currentMainCopies } from "@/data/current-copy";

interface FeatureGuideSection {
  title: string;
  items: Array<{ title: string; body: string }>;
}

export interface FeatureDetail {
  title: string;
  summary: string;
  heading: string;
  body: string;
  steps: string[];
  guide: {
    steps: FeatureGuideSection;
    abilities: FeatureGuideSection;
    situations: FeatureGuideSection;
  };
}
export interface FeatureCopy {
  scan: { title: string; body: string };
  practiceTitle: string;
  features: Record<string, FeatureDetail>;
  workflows: Record<string, string[]>;
  documentArticle: { title: string; intro: string; tip: string; limit: string };
}
const baseline: Record<string, Pick<FeatureCopy, "practiceTitle">> = { ...base, ...asia, ...europeA, ...europeB };
export const featureDetails: Record<string, FeatureCopy> = Object.fromEntries(
  Object.entries(currentMainCopies).map(([locale, copy]) => [locale, {
    practiceTitle: baseline[locale].practiceTitle, features: copy.features, workflows: copy.workflows,
    scan: copy.scan, documentArticle: copy.documentArticle,
  }]),
);
