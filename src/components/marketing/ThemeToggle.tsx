import { useEffect, useState, type ReactNode } from "react";
import { ThemeProvider, useTheme } from "next-themes";
import HugeIcon from "@/components/HugeIcon";
import { useLanguage } from "@/contexts/LanguageContext";
import { getCurrentMainCopy } from "@/data/current-copy";

export function MarketingThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="data-theme"
      storageKey="anytranslator-website-theme"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      themes={["light", "dark"]}
    >
      {children}
    </ThemeProvider>
  );
}

export default function ThemeToggle() {
  const { currentLanguage } = useLanguage();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const copy = getCurrentMainCopy(currentLanguage.code).extras.theme;
  const dark = mounted && resolvedTheme === "dark";
  return (
    <button
      type="button"
      className="mk-theme-toggle"
      data-testid="theme-toggle"
      aria-label={copy.darkMode}
      aria-pressed={mounted ? dark : undefined}
      title={dark ? copy.lightAction : copy.darkAction}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <HugeIcon name="moon" className="mk-theme-icon" />
    </button>
  );
}
