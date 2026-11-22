export const features = [
  { id: "text", icon: "language-square", tone: "sand" },
  { id: "photos", icon: "image-01", tone: "peach" },
  { id: "voice", icon: "mic-01", tone: "sky" },
  { id: "agent", icon: "bot", tone: "mint" },
  { id: "menu", icon: "restaurant-01", tone: "peach" },
  { id: "document", icon: "file-search", tone: "sky" },
  { id: "keyboard", icon: "keyboard-01", tone: "sand" },
  { id: "chat", icon: "bubble-chat-question", tone: "mint" },
  { id: "helper", icon: "book", tone: "peach" },
  { id: "widget", icon: "clock-01", tone: "sand" },
];
export const cases = [
  {
    id: "travel",
    feature: "voice",
    tools: ["voice", "agent", "document"],
    tone: "sky",
  },
  {
    id: "work",
    feature: "text",
    tools: ["text", "helper", "chat"],
    tone: "sand",
  },
  {
    id: "dining",
    feature: "menu",
    tools: ["menu", "voice", "agent"],
    tone: "peach",
  },
  {
    id: "study",
    feature: "widget",
    tools: ["helper", "widget", "chat"],
    tone: "mint",
  },
  {
    id: "messages",
    feature: "keyboard",
    tools: ["keyboard", "text", "chat"],
    tone: "sand",
  },
  {
    id: "reading",
    feature: "document",
    tools: ["document", "helper", "chat"],
    tone: "sky",
  },
];
export const articles = [
  {
    slug: "scan-and-read-documents",
    id: "document",
    category: "guide",
    feature: "document",
    tools: ["document"],
  },
  {
    slug: "voice-translation-and-dictation",
    id: "voice",
    category: "guide",
    feature: "voice",
    tools: ["voice", "text", "keyboard"],
  },
  {
    slug: "read-a-menu",
    id: "menu",
    category: "travel",
    feature: "menu",
    tools: ["menu"],
  },
  {
    slug: "write-across-languages",
    id: "work",
    category: "work",
    feature: "text",
    tools: ["text", "keyboard", "helper"],
  },
  {
    slug: "learn-from-translations",
    id: "learning",
    category: "learning",
    feature: "widget",
    tools: ["helper", "chat", "widget"],
  },
  {
    slug: "anytranslator-on-mac",
    id: "mac",
    category: "guide",
    feature: "chat",
    tools: ["text", "document", "chat"],
  },
  {
    slug: "ios-translation-keyboard",
    id: "keyboard",
    category: "guide",
    feature: "keyboard",
    tools: ["keyboard", "text", "helper"],
  },
];
export const marketingRoutes = [
  "/features",
  ...features.map((x) => `/features/${x.id}`),
  "/use-cases",
  ...cases.map((x) => `/use-cases/${x.id}`),
  "/pricing",
  "/download",
  "/about",
  "/affiliate",
  "/contact",
  "/blog",
  ...articles.map((x) => `/blog/${x.slug}`),
];

export const relatedFeatures = {
  text: ["helper", "chat", "keyboard"],
  photos: ["menu", "document", "text"],
  voice: ["agent", "text", "chat"],
  agent: ["voice", "menu", "text"],
  menu: ["photos", "document", "voice"],
  document: ["photos", "helper", "chat"],
  keyboard: ["text", "helper", "chat"],
  chat: ["text", "helper", "photos"],
  helper: ["text", "chat", "widget"],
  widget: ["helper", "text", "chat"],
};
import { currentMainFeatures, currentMainCases, currentMainArticles, currentMainRelated } from "./main-current.mjs";


export function marketingCatalog(locale) {
  return { features: currentMainFeatures, cases: currentMainCases, articles: currentMainArticles, relatedFeatures: currentMainRelated };
}
