import { Helmet } from 'react-helmet-async';

interface JsonLdProps {
  data: object;
}

export const JsonLd = ({ data }: JsonLdProps) => (
  <Helmet>
    <script type="application/ld+json">
      {JSON.stringify(data, null, 2)}
    </script>
  </Helmet>
);

// Organization Schema
export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Shiny Technology Co., Ltd.",
  "url": "https://anytranslator.app",
  "logo": {
    "@type": "ImageObject",
    "url": "https://anytranslator.app/lovable-uploads/Logo.jpg",
    "width": 512,
    "height": 512
  },
  "sameAs": [
    "https://apps.apple.com/by/app/any-translator-ai-translate/id6738693321"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "availableLanguage": ["en", "ru", "es", "fr", "de", "ko", "ja", "zh", "pt", "it"]
  }
};

// Website Schema
export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "AnyTranslator",
  "url": "https://anytranslator.app",
  "description": "AI-powered translation app supporting 50+ languages with instant, accurate translations",
  "publisher": {
    "@type": "Organization",
    "name": "Shiny Technology Co., Ltd."
  },
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://anytranslator.app/?search={search_term_string}",
    "query-input": "required name=search_term_string"
  },
  "inLanguage": ["en", "ru", "es", "it", "fr", "de", "ko", "ja", "pt-br", "fi", "da", "nl", "no", "sv", "zh-cn", "zh-tw", "id", "vi", "th"]
};

// Mobile App Schema
export const mobileAppSchema = {
  "@context": "https://schema.org",
  "@type": "MobileApplication",
  "name": "AnyTranslator",
  "description": "AI-powered translation app supporting 50+ languages with instant, accurate translations",
  "url": "https://anytranslator.app",
  "applicationCategory": "ProductivityApplication",
  "operatingSystem": "iOS",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "1250",
    "bestRating": "5",
    "worstRating": "1"
  },
  "featureList": [
    "AI-powered translation",
    "50+ languages support",
    "Instant translation",
    "Voice translation",
    "Photo translation",
    "Text translation",
    "Keyboard translation",
    "Offline mode",
    "Pronunciation guide",
    "Conversation mode"
  ],
  "screenshot": [
    {
      "@type": "ImageObject",
      "url": "https://anytranslator.app/lovable-uploads/AI對話學習.png",
      "caption": "AI Learning Interface"
    },
    {
      "@type": "ImageObject",
      "url": "https://anytranslator.app/lovable-uploads/文字翻譯.png",
      "caption": "Text Translation"
    },
    {
      "@type": "ImageObject",
      "url": "https://anytranslator.app/lovable-uploads/語音翻譯.png",
      "caption": "Voice Translation"
    }
  ],
  "author": {
    "@type": "Organization",
    "name": "Shiny Technology Co., Ltd."
  },
  "downloadUrl": "https://apps.apple.com/by/app/any-translator-ai-translate/id6738693321"
};

// FAQ Schema
export const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How many languages does AnyTranslator support?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "AnyTranslator supports over 50 languages including English, Spanish, French, German, Chinese, Japanese, Korean, Russian, Portuguese, Italian, and many more."
      }
    },
    {
      "@type": "Question",
      "name": "Is AnyTranslator free to use?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "AnyTranslator offers both free and premium versions. The free version includes basic translation features, while the premium version offers unlimited translations, advanced features, and offline mode."
      }
    },
    {
      "@type": "Question",
      "name": "Can I use AnyTranslator offline?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, AnyTranslator Premium subscribers can download language packs for offline translation in selected language pairs."
      }
    },
    {
      "@type": "Question",
      "name": "How accurate are the translations?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "AnyTranslator uses advanced AI and machine learning algorithms to provide highly accurate translations. While we strive for the best accuracy, we recommend reviewing translations for important communications."
      }
    }
  ]
};

// Breadcrumb Schema
export const createBreadcrumbSchema = (items: Array<{name: string, url: string}>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url
  }))
});

export default JsonLd;
