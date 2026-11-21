import zh from "@/translations/marketing/current/zh-tw.json";
import type { FeatureDetail } from "./feature-details";

export type CurrentCopy = Omit<typeof zh, "marketing" | "features" | "workflows" | "articles" | "extras"> & {
  marketing: Record<string, string>;
  features: Record<string, FeatureDetail>;
  workflows: Record<string, string[]>;
  articles: Record<string, string>;
  extras: Omit<typeof zh.extras, "reviews" | "imageAlt"> & {
    reviews: Omit<typeof zh.extras.reviews, "quotesById"> & { quotesById: Record<string, string> };
    imageAlt: Record<string, string>;
  };
};

const modules = import.meta.glob("../translations/marketing/current/*.json", { eager: true, import: "default" });
export const currentMainCopies: Record<string, CurrentCopy> = Object.fromEntries(
  Object.entries(modules).map(([path, copy]) => [path.split("/").at(-1)!.replace(/\.json$/, ""), copy as CurrentCopy]),
);

export function getCurrentMainCopy(locale: string): CurrentCopy {
  const copy = currentMainCopies[locale];
  if (!copy) throw new Error(`Current website translation is missing: ${locale}`);
  return copy;
}
