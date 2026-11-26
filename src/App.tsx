import { Toaster } from "@/components/ui/toaster";
import { lazy, Suspense } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, useMatch } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { MarketingThemeProvider } from "./components/marketing/ThemeToggle";
import { accountClaimPath } from "./lib/creem-app-claim.mjs";
import { accountAppPath } from "./lib/site-config.mjs";
import type { AccountAppLaunch } from "./lib/account-app-entry";
import { isLiveAccountHost, sharedAccountEnabled, sharedAccountLiveAccountEnabled } from "./lib/shared-account-preview";

import {
  HomePage,
  FeaturesPage,
  FeaturePage,
  UseCasesPage,
  UseCasePage,
  PricingPage,
  DownloadPage,
  AboutPage,
  AffiliatePage,
  ContactPage,
  BlogPage,
  ArticlePage,
  HelpPage,
  MissingPage,
} from "./pages/MarketingPages";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import { ManifestoPage } from "./pages/Manifesto";

const queryClient = new QueryClient();
const SharedAccountPage = sharedAccountEnabled
  ? lazy(() => import("./pages/SharedAccountPage"))
  : null;
const AccountAppPage = sharedAccountEnabled
  ? lazy(() => import("./pages/AccountAppPage"))
  : null;
const AppClaimPage = sharedAccountLiveAccountEnabled
  ? lazy(() => import("./pages/AppClaimPage"))
  : null;

function App({ helmetContext = {}, accountAppLaunch }: { helmetContext?: object; accountAppLaunch?: AccountAppLaunch }) {
  const accountAppRoute = useMatch(accountAppPath);
  return <MarketingThemeProvider forcedTheme={accountAppRoute ? accountAppLaunch?.theme : undefined}>
  <HelmetProvider context={helmetContext}>
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/features/:id" element={<FeaturePage />} />
            <Route path="/use-cases" element={<UseCasesPage />} />
            <Route path="/use-cases/:id" element={<UseCasePage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/download" element={<DownloadPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/manifesto" element={<ManifestoPage />} />
            <Route path="/affiliate" element={<AffiliatePage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<ArticlePage />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/support" element={<HelpPage />} />
            {SharedAccountPage && (!sharedAccountLiveAccountEnabled || isLiveAccountHost()) && (
              <Route path="/account" element={<Suspense fallback={null}><SharedAccountPage /></Suspense>} />
            )}
            {AccountAppPage && (!sharedAccountLiveAccountEnabled || isLiveAccountHost()) && (
              <Route path={accountAppPath} element={<Suspense fallback={null}><AccountAppPage launch={accountAppLaunch} /></Suspense>} />
            )}
            {AppClaimPage && isLiveAccountHost() && (
              <Route path={accountClaimPath} element={<Suspense fallback={null}><AppClaimPage /></Suspense>} />
            )}
            <Route path="*" element={<MissingPage />} />
          </Routes>
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  </HelmetProvider>
  </MarketingThemeProvider>;
}

export default App;
