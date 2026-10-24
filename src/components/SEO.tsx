import { Helmet } from 'react-helmet-async';
import { useLanguage } from '@/contexts/LanguageContext';
import HreflangLinks from './HreflangLinks';
import { useLocation } from 'react-router-dom';
import { SITE_URL, canonicalUrl as getCanonicalUrl, localeForCode } from '@/lib/site-config.mjs';

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
  image = 'https://www.anytranslator.app/app-preview/screens/en/translate.png',
  url,
  type = 'website',
  noIndex = false,
  publishedTime,
  modifiedTime
}: SEOProps) => {
  const { currentLanguage, t } = useLanguage();
  const { pathname } = useLocation();
  const locale = localeForCode(currentLanguage.code);

  const siteTitle = 'AnyTranslator';
  const defaultDescription = t('meta.description');

  const pageTitle = title ? `${title} | ${siteTitle}` : `${siteTitle} - Smart Translation App`;
  const pageDescription = description || defaultDescription;
  const canonicalUrl = getCanonicalUrl(url || pathname, currentLanguage.code);
  const imageUrl = image.replace(/^https:\/\/(?:www\.)?anytranslator\.app/, SITE_URL);

  return (
    <>
      <Helmet>
        {/* Basic Meta Tags */}
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        {keywords && <meta name="keywords" content={keywords} />}
        <meta name="author" content="Shiny Technology Co., Ltd." />
        <meta name="robots" content={noIndex ? 'noindex,nofollow' : 'index,follow'} />

        {/* Language and Locale */}
        <html lang={locale.tag} />
        <meta name="language" content={currentLanguage.code} />

        {/* Canonical URL */}
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph Tags */}
        <meta property="og:type" content={type} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content={siteTitle} />
        <meta property="og:locale" content={locale.ogLocale} />

        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={imageUrl} />
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
        <meta property="al:ios:url" content="translator://text" />

        {/* Performance optimizations */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href="https://apps.apple.com" />


        {/* Viewport meta tag for mobile optimization */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />

        {/* Theme color for mobile browsers */}
        <meta name="theme-color" content="#3B82F6" />
        <meta name="msapplication-TileColor" content="#3B82F6" />
      </Helmet>

      {/* Hreflang Links */}
      {!noIndex && <HreflangLinks path={url || pathname} />}
    </>
  );
};

export default SEO;
