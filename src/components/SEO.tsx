import { Helmet } from 'react-helmet-async';
import { useLanguage } from '@/contexts/LanguageContext';
import HreflangLinks from './HreflangLinks';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  noIndex?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
}

const SEO = ({
  title,
  description,
  keywords,
  image = 'https://anytranslator.app/cute.jpg',
  url,
  type = 'website',
  noIndex = false,
  publishedTime,
  modifiedTime
}: SEOProps) => {
  const { currentLanguage } = useLanguage();
  
  const siteTitle = 'AnyTranslator';
  const defaultDescription = 'Your smart companion for instant, accurate translations in 50+ languages';
  const defaultKeywords = 'translator, translation, language, AI, multilingual, instant translation, voice translation, photo translation, text translation';
  
  const pageTitle = title ? `${title} | ${siteTitle}` : `${siteTitle} - Smart Translation App`;
  const pageDescription = description || defaultDescription;
  const pageKeywords = keywords || defaultKeywords;
  const pageUrl = url ? `https://anytranslator.app${url}` : 'https://anytranslator.app/';
  const canonicalUrl = pageUrl + (currentLanguage.code !== 'en' ? `?lang=${currentLanguage.code}` : '');

  return (
    <>
      <Helmet>
        {/* Basic Meta Tags */}
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={pageKeywords} />
        <meta name="author" content="Shiny Technology Co., Ltd." />
        <meta name="robots" content={noIndex ? 'noindex,nofollow' : 'index,follow'} />
        
        {/* Language and Locale */}
        <html lang={currentLanguage.code} />
        <meta name="language" content={currentLanguage.code} />
        
        {/* Canonical URL */}
        <link rel="canonical" href={canonicalUrl} />
        
        {/* Open Graph Tags */}
        <meta property="og:type" content={type} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={image} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content={siteTitle} />
        <meta property="og:locale" content={currentLanguage.code === 'en' ? 'en_US' : `${currentLanguage.code.replace('-', '_')}_${currentLanguage.code.replace('-', '_').toUpperCase()}`} />
        
        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={image} />
        <meta name="twitter:site" content="@anytranslator" />
        <meta name="twitter:creator" content="@anytranslator" />
        
        {/* Article Meta (for blog posts/articles) */}
        {type === 'article' && publishedTime && (
          <meta property="article:published_time" content={publishedTime} />
        )}
        {type === 'article' && modifiedTime && (
          <meta property="article:modified_time" content={modifiedTime} />
        )}
        
        {/* App Meta Tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content={siteTitle} />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content={siteTitle} />
        
        {/* iOS App Store Link */}
        <meta property="al:ios:app_store_id" content="6738693321" />
        <meta property="al:ios:app_name" content="AnyTranslator" />
        <meta property="al:ios:url" content="anytranslator://open" />
        
        {/* Performance optimizations */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href="https://apps.apple.com" />
        <link rel="dns-prefetch" href="https://play.google.com" />
        
        {/* Viewport meta tag for mobile optimization */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        
        {/* Theme color for mobile browsers */}
        <meta name="theme-color" content="#3B82F6" />
        <meta name="msapplication-TileColor" content="#3B82F6" />
      </Helmet>
      
      {/* Hreflang Links */}
      <HreflangLinks path={url} />
    </>
  );
};

export default SEO;
