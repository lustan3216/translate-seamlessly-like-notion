import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { localesForPath, canonicalUrl } from '@/lib/site-config.mjs';

const HreflangLinks = ({ path }: { path?: string }) => {
  const { pathname } = useLocation();
  const pagePath = path || pathname;
  return (
    <Helmet>
      <link rel="alternate" hrefLang="x-default" href={canonicalUrl(pagePath, 'en')} />
      {localesForPath(pagePath).map(({ code, tag }) => (
        <link key={code} rel="alternate" hrefLang={tag} href={canonicalUrl(pagePath, code)} />
      ))}
    </Helmet>
  );
};

export default HreflangLinks;
