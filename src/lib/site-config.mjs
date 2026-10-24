export const SITE_URL = 'https://www.anytranslator.app';
export const SITE_ROUTES = ['/', '/support', '/terms-of-service', '/privacy-policy'];
export const SITE_LOCALES = [
  { code: 'en', tag: 'en-US', ogLocale: 'en_US' },
  { code: 'ko', tag: 'ko-KR', ogLocale: 'ko_KR' },
  { code: 'ja', tag: 'ja-JP', ogLocale: 'ja_JP' },
  { code: 'fr', tag: 'fr-FR', ogLocale: 'fr_FR' },
  { code: 'de', tag: 'de-DE', ogLocale: 'de_DE' },
  { code: 'es', tag: 'es-ES', ogLocale: 'es_ES' },
  { code: 'it', tag: 'it-IT', ogLocale: 'it_IT' },
  { code: 'pt-br', tag: 'pt-BR', ogLocale: 'pt_BR' },
  { code: 'fi', tag: 'fi-FI', ogLocale: 'fi_FI' },
  { code: 'da', tag: 'da-DK', ogLocale: 'da_DK' },
  { code: 'nl', tag: 'nl-NL', ogLocale: 'nl_NL' },
  { code: 'no', tag: 'nb-NO', ogLocale: 'nb_NO' },
  { code: 'sv', tag: 'sv-SE', ogLocale: 'sv_SE' },
  { code: 'zh-cn', tag: 'zh-CN', ogLocale: 'zh_CN' },
  { code: 'zh-tw', tag: 'zh-TW', ogLocale: 'zh_TW' },
  { code: 'id', tag: 'id-ID', ogLocale: 'id_ID' },
  { code: 'vi', tag: 'vi-VN', ogLocale: 'vi_VN' },
  { code: 'th', tag: 'th-TH', ogLocale: 'th_TH' },
  { code: 'ru', tag: 'ru-RU', ogLocale: 'ru_RU' },
];

export function localeForCode(code) {
  return SITE_LOCALES.find((locale) => locale.code === code) || SITE_LOCALES[0];
}

export function languageFromSearch(search) {
  return localeForCode(new URLSearchParams(search).get('lang')).code;
}

export function normalizedPath(pathname = '/') {
  return new URL(pathname, SITE_URL).pathname.replace(/\/$/, '') || '/';
}

export function localesForPath(pathname) {
  return ['/terms-of-service', '/privacy-policy'].includes(normalizedPath(pathname))
    ? [SITE_LOCALES[0]] : SITE_LOCALES;
}

export function languageForLocation(pathname, search) {
  return localesForPath(pathname).length === 1 ? 'en' : languageFromSearch(search);
}

export function localizedPath(pathname = '/', code = 'en') {
  const path = normalizedPath(pathname);
  const language = localesForPath(path).length === 1 ? 'en' : localeForCode(code).code;
  return `${path}${language === 'en' ? '' : `?lang=${language}`}`;
}

export function canonicalUrl(pathname = '/', code = 'en') {
  return `${SITE_URL}${localizedPath(pathname, code)}`;
}

export function outputPath(pathname, code) {
  return `_localized/${code}${pathname === '/' ? '' : pathname}/index.html`;
}
