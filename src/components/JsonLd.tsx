import { Helmet } from 'react-helmet-async';

export const JsonLd = ({ data }: { data: object }) => (
  <Helmet>
    <script type="application/ld+json">{JSON.stringify(data)}</script>
  </Helmet>
);

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Shiny Technology Co., Ltd.',
  url: 'https://anytranslator.app/',
  logo: 'https://anytranslator.app/app-preview/logo.png',
};

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'AnyTranslator',
  url: 'https://anytranslator.app/',
  inLanguage: ['en', 'ko', 'ja', 'fr', 'de', 'es', 'it', 'pt-BR', 'fi', 'da', 'nl', 'no', 'sv', 'zh-CN', 'zh-TW', 'id', 'vi', 'th', 'ru'],
};

export const mobileAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'MobileApplication',
  name: 'AnyTranslator',
  url: 'https://anytranslator.app/',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'iOS, iPadOS, macOS',
  downloadUrl: 'https://apps.apple.com/app/id6738693321',
  featureList: ['Text translation', 'Voice translation', 'Photo translation', 'Chat', 'Helper explanations', 'Custom knowledge', 'Translation keyboard', 'Learning widgets', 'Translation history'],
  screenshot: ['translate', 'voice', 'chat'].map((name) => `https://anytranslator.app/app-preview/screens/en/${name}.png`),
};

export const createBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem', position: index + 1, name: item.name, item: item.url,
  })),
});

export default JsonLd;
