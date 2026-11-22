import common from "@/translations/marketing/main-common-zh-tw.json";
import chat from "@/translations/marketing/main-chat-zh-tw.json";
import screen from "@/translations/marketing/main-screen-zh-tw.json";

export const currentMainCopy = {
  marketing: { ...common.marketing, ...chat.marketing, ...screen.marketing },
  features: { ...common.features, ...chat.features, ...screen.features },
  workflows: { ...common.workflows, ...chat.workflows, ...screen.workflows },
  articles: { ...common.articles, ...chat.articles, ...screen.articles },
  scan: common.scan,
  documentArticle: common.documentArticle,
  pricing: common.pricing,
};
