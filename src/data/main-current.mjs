export const mainSourceCommit = "25040c54255b2f7dd073965a749f19ec378e9677";

// All website locales use the owner's approved current feature catalogue.
export const currentMainFeatures = [
  { id: "chat", icon: "bubble-chat-question", tone: "mint" },
  { id: "screen-translation", icon: "closed-caption", tone: "sky" },
  { id: "text", icon: "language-square", tone: "sand" },
  { id: "photos", icon: "image-01", tone: "peach" },
  { id: "voice", icon: "mic-01", tone: "sky" },
  { id: "menu", icon: "restaurant-01", tone: "peach" },
  { id: "document", icon: "file-search", tone: "sky" },
  { id: "table", icon: "table", tone: "sand" },
  { id: "keyboard", icon: "keyboard-01", tone: "sand" },
  { id: "helper", icon: "book", tone: "peach" },
  { id: "widget", icon: "clock-01", tone: "sand" },
];

export const currentMainCases = [
  { id: "travel", feature: "voice", tools: ["voice", "chat", "document"], tone: "sky" },
  { id: "work", feature: "text", tools: ["text", "helper", "chat"], tone: "sand" },
  { id: "dining", feature: "menu", tools: ["menu", "voice", "chat"], tone: "peach" },
  { id: "study", feature: "chat", tools: ["chat", "helper", "widget"], tone: "mint" },
  { id: "messages", feature: "keyboard", tools: ["keyboard", "text", "chat"], tone: "sand" },
  { id: "reading", feature: "document", tools: ["document", "table", "helper"], tone: "sky" },
  { id: "media", feature: "screen-translation", tools: ["screen-translation", "chat", "text"], tone: "sky" },
];

export const currentMainArticles = [
  { slug: "chat-language-practice", id: "chat", category: "learning", feature: "chat", tools: ["chat", "helper", "widget"] },
  { slug: "translate-other-apps", id: "screen", category: "guide", feature: "screen-translation", tools: ["screen-translation"] },
  { slug: "scan-and-read-documents", id: "document", category: "guide", feature: "document", tools: ["document", "table"] },
  { slug: "voice-translation-and-dictation", id: "voice", category: "guide", feature: "voice", tools: ["voice", "chat", "screen-translation"] },
  { slug: "read-a-menu", id: "menu", category: "travel", feature: "menu", tools: ["menu"] },
  { slug: "write-across-languages", id: "work", category: "work", feature: "text", tools: ["text", "keyboard", "helper"] },
  { slug: "learn-from-translations", id: "learning", category: "learning", feature: "helper", tools: ["helper", "chat", "widget"] },
  { slug: "anytranslator-on-mac", id: "mac", category: "guide", feature: "chat", tools: ["text", "document", "chat"] },
  { slug: "ios-translation-keyboard", id: "keyboard", category: "guide", feature: "keyboard", tools: ["keyboard", "text", "helper"] },
];

export const currentMainRelated = {
  text: ["helper", "chat", "keyboard"],
  photos: ["menu", "document", "table"],
  voice: ["screen-translation", "chat", "text"],
  menu: ["photos", "voice", "chat"],
  document: ["table", "photos", "helper"],
  table: ["document", "photos", "screen-translation"],
  keyboard: ["text", "helper", "chat"],
  chat: ["helper", "widget", "voice"],
  helper: ["text", "chat", "widget"],
  widget: ["chat", "helper", "text"],
  "screen-translation": ["photos", "voice", "chat"],
};

export const currentMainOnlyRoutes = [
  "/manifesto",
  "/features/screen-translation", "/features/table", "/use-cases/media",
  "/blog/chat-language-practice", "/blog/translate-other-apps",
];
