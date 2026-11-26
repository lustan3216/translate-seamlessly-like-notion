import { accountAppPath, localeForCode, SITE_LOCALES } from "./site-config.mjs";
import type { AccountSession } from "./shared-account-client";

export type AccountAppLaunch = {
  access?: string | null;
  theme?: "light" | "dark";
  locale: string;
};

const preferenceKey = "anytranslator.account-app.presentation";

function appLocale(value?: string | null) {
  const code = value?.trim().toLowerCase().replace(/_/g, "-") ?? "";
  const [base, region] = code.split("-");
  if (base === "zh") return ["tw", "hk", "hant"].includes(region) ? "zh-tw" : "zh-cn";
  if (base === "pt") return "pt-br";
  if (base === "nb") return "no";
  return SITE_LOCALES.find((locale) => locale.code === code || locale.code === base)?.code ?? localeForCode().code;
}

export function takeAccountAppLaunch(
  location: Pick<Location, "pathname" | "search" | "hash">,
  history: Pick<History, "state" | "replaceState">,
  getStorage: () => Pick<Storage, "getItem" | "setItem">,
): AccountAppLaunch | undefined {
  if (location.pathname.replace(/\/$/, "") !== accountAppPath) return;
  const { hash } = location;
  if (hash || location.search || location.pathname !== accountAppPath) {
    history.replaceState(history.state, "", accountAppPath);
  }
  const params = new URLSearchParams(hash.slice(1));
  const accessValues = params.getAll("access");
  const access = accessValues.length === 0 ? undefined
    : accessValues.length === 1 && /^[A-Za-z0-9_-]{43}$/.test(accessValues[0]) ? accessValues[0] : null;
  const readPreferences = (theme?: string | null, lang?: string | null): Omit<AccountAppLaunch, "access"> => ({
    theme: theme === "light" || theme === "dark" ? theme : undefined,
    locale: appLocale(lang),
  });
  let presentation = readPreferences(params.get("theme"), params.get("lang"));
  try {
    const storage = getStorage();
    if (hash) storage.setItem(preferenceKey, JSON.stringify(presentation));
    else {
      const saved = JSON.parse(storage.getItem(preferenceKey) ?? "null");
      presentation = readPreferences(saved?.theme, typeof saved?.locale === "string" ? saved.locale : undefined);
    }
  } catch { /* The current page still uses its launch preferences without storage. */ }
  return { access, ...presentation };
}

export function appSessionAccount(session: AccountSession) {
  return session?.session?.source === "app_link" && session.account?.id ? session.account : null;
}

const appMessages = ["openSupport", "close", "statusChanged"] as const;
type AppMessage = typeof appMessages[number];

export function sendAppMessage(message: AppMessage, host: unknown = window): boolean {
  if (!appMessages.includes(message)) return false;
  const channel = (host as { AnyTranslatorApp?: { postMessage?: (message: string) => void } }).AnyTranslatorApp;
  if (typeof channel?.postMessage !== "function") return false;
  try {
    channel.postMessage(message);
    return true;
  } catch {
    return false;
  }
}
