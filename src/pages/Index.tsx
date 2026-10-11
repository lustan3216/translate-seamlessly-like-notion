import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import FeatureCards from "@/components/FeatureCards";
import DescriptionSection from "@/components/DescriptionSection";
import FeatureSection from "@/components/FeatureSection";
import DownloadSection from "@/components/DownloadSection";
import ProSection from "@/components/ProSection";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import JsonLd, { organizationSchema, websiteSchema, mobileAppSchema } from "@/components/JsonLd";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background" id="top">
      <SEO
        title={`${t("landing.heroTitle")} ${t("landing.heroAccent")}`}
        description={t("landing.heroBody")}
        image="https://anytranslator.app/app-preview/logo.png"
        url="/"
      />
      <JsonLd data={organizationSchema} />
      <JsonLd data={websiteSchema} />
      <JsonLd data={mobileAppSchema} />
      <Navigation />
      <main>
        <HeroSection />
        <DescriptionSection />
        <FeatureCards />
        <FeatureSection />
        <ProSection />
        <DownloadSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
