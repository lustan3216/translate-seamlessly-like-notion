import { translations as en } from './en';
import { translations as ru } from './ru';
import { translations as es } from './es';
import { translations as it } from './it';
import { translations as fr } from './fr';
import { translations as de } from './de';
import { translations as ko } from './ko';
import { translations as ja } from './ja';
import { translations as ptBr } from './pt-br';
import { translations as fi } from './fi';
import { translations as da } from './da';
import { translations as nl } from './nl';
import { translations as no } from './no';
import { translations as sv } from './sv';
import { translations as zhCn } from './zh-cn';
import { translations as zhTw } from './zh-tw';
import { translations as id } from './id';
import { translations as vi } from './vi';
import { translations as th } from './th';
import { landingTranslations } from './landing';
import baseRefresh from './landing-refresh/base.json';
import groupARefresh from './landing-refresh/group-a.json';
import groupBRefresh from './landing-refresh/group-b.json';
import { featureDetails } from '@/data/feature-details';

export const landingRefreshTranslations: Record<string, Record<string, string>> = {
  ...baseRefresh,
  ...groupARefresh,
  ...groupBRefresh,
};

export const translations: Record<string, Record<string, string>> = {
  'en': en,
  'en-gb': en, // Use same as US English
  'ru': ru,
  'es': es,
  'it': it,
  'fr': fr,
  'de': de,
  'ko': ko,
  'ja': ja,
  'pt-br': ptBr,
  'fi': fi,
  'da': da,
  'nl': nl,
  'no': no,
  'sv': sv,
  'zh-cn': zhCn,
  'zh-tw': zhTw,
  'id': id,
  'vi': vi,
  'th': th
};

export const getTranslations = (languageCode: string): Record<string, string> => {
  const detail = featureDetails[languageCode === 'en-gb' ? 'en' : languageCode];
  const featureCopy = detail ? Object.fromEntries(Object.entries(detail.features).flatMap(([id, copy]) => [
    [`landing.${id}Title`, copy.title],
    [`landing.${id}Body`, copy.summary],
    ...copy.steps.map((step, index) => [`landing.${id}Step${index + 1}`, step]),
  ])) : {};
  return {
    ...(translations[languageCode] || translations['en']),
    ...(landingTranslations[languageCode] || landingTranslations['en']),
    ...(landingRefreshTranslations[languageCode] || landingRefreshTranslations.en),
    ...featureCopy,
    'landing.platform': 'iPhone · iPad',
  };
};
