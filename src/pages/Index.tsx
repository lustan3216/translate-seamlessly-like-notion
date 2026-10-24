import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import FeatureCards from "@/components/FeatureCards";
import DescriptionSection from "@/components/DescriptionSection";
import FeatureSection from "@/components/FeatureSection";
import DownloadSection from "@/components/DownloadSection";
import ProSection from "@/components/ProSection";
import FaqSection from "@/components/FaqSection";
import { faqTopics } from "@/data/faq-topics";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import JsonLd, { organizationSchema, websiteSchema, mobileAppSchema } from "@/components/JsonLd";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const { t, currentLanguage } = useLanguage();
  const featureIds = ["agent", "menu", "document", "keyboard", "voice", "text", "chat", "helper", "widget"];
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqTopics.map(topic => ({ "@type": "Question", name: t(`landing.faq${topic}Q`), acceptedAnswer: { "@type": "Answer", text: t(`landing.faq${topic}A`) } })),
  };

  return (
    <div className="min-h-screen bg-background" id="top">
      <SEO
        title={t("landing.seoTitle")}
        description={t("landing.seoDescription")}
        image={`https://www.anytranslator.app/app-preview/social/${currentLanguage.code}.jpg`}
        url="/"
      />
      <JsonLd data={organizationSchema} />
      <JsonLd data={websiteSchema} />
      <JsonLd data={{ ...mobileAppSchema, description: t("landing.seoDescription"), inLanguage: currentLanguage.code, featureList: featureIds.map(id => t(`landing.${id}Label`)) }} />
      <JsonLd data={faqSchema} />
      <Navigation />
      <main>
        <HeroSection />
        <DescriptionSection />
        <FeatureCards />
        <FeatureSection />
        <ProSection />
        <FaqSection />
        <DownloadSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
