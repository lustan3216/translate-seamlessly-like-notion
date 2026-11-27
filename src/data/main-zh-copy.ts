import common from "@/translations/marketing/main-common-zh-tw.json";
import chat from "@/translations/marketing/main-chat-zh-tw.json";
import screen from "@/translations/marketing/main-screen-zh-tw.json";
import current from "@/translations/marketing/current/zh-tw.json";

const { guide: _guide, ...browser } = current.features["browser-translation"];

export const currentMainCopy = {
  marketing: {
    ...common.marketing, ...chat.marketing, ...screen.marketing,
    "feature.browser-translation": current.marketing["feature.browser-translation"],
  },
  features: { ...common.features, ...chat.features, ...screen.features, "browser-translation": browser },
  workflows: { ...common.workflows, ...chat.workflows, ...screen.workflows },
  articles: { ...common.articles, ...chat.articles, ...screen.articles },
  scan: common.scan,
  documentArticle: common.documentArticle,
  pricing: common.pricing,
};
