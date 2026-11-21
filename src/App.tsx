import { Toaster } from "@/components/ui/toaster";
import { lazy, Suspense } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { MarketingThemeProvider } from "./components/marketing/ThemeToggle";
import { accountClaimPath } from "./lib/creem-app-claim.mjs";
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
const AppClaimPage = sharedAccountLiveAccountEnabled
  ? lazy(() => import("./pages/AppClaimPage"))
  : null;

const App = ({ helmetContext = {} }: { helmetContext?: object }) => (
  <MarketingThemeProvider>
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
            {AppClaimPage && isLiveAccountHost() && (
              <Route path={accountClaimPath} element={<Suspense fallback={null}><AppClaimPage /></Suspense>} />
            )}
            <Route path="*" element={<MissingPage />} />
          </Routes>
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  </HelmetProvider>
  </MarketingThemeProvider>
);

export default App;
