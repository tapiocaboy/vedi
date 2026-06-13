/** Astrology label helpers — planets, rashis, dignity, trends, etc. */

import { translations, type Lang, type TranslationKey } from './translations';

const LANG_KEY = 'trytellme_lang';

export function getStoredLang(): Lang {
  try {
    return localStorage.getItem(LANG_KEY) === 'si' ? 'si' : 'en';
  } catch {
    return 'en';
  }
}

export function tKey(key: TranslationKey, lang: Lang): string {
  return translations[lang][key] ?? translations.en[key];
}

const PLANET_KEYS: Record<string, TranslationKey> = {
  SUN: 'planet.sun',
  MOON: 'planet.moon',
  MARS: 'planet.mars',
  MERCURY: 'planet.mercury',
  JUPITER: 'planet.jupiter',
  VENUS: 'planet.venus',
  SATURN: 'planet.saturn',
  RAHU: 'planet.rahu',
  KETU: 'planet.ketu',
  ASCENDANT: 'planet.ascendant',
};

export function labelPlanet(code: string, lang: Lang): string {
  const key = PLANET_KEYS[code.toUpperCase()];
  if (key) return tKey(key, lang);
  const title = code.charAt(0).toUpperCase() + code.slice(1).toLowerCase();
  const titleKey = PLANET_KEYS[title];
  return titleKey ? tKey(titleKey, lang) : code;
}

/** Sanskrit rashi names (Mesha … Meena) */
export const RASHI_SANSKRIT_SI = [
  'මේෂ', 'වෘෂභ', 'මිථුන', 'කර්ක',
  'සිංහ', 'කන්‍යා', 'තුලා', 'වෘශ්චික',
  'ධනු', 'මකර', 'කුම්භ', 'මීන',
] as const;

/** Western zodiac names */
export const RASHI_WESTERN_SI = [
  'ඔව්', 'වෘෂභ', 'මිථුන', 'කර්කටක',
  'සිංහ', 'කන්‍යා', 'තුලා', 'වෘශ්චික',
  'ධනු', 'මකර', 'කුම්භ', 'මීන',
] as const;

export function labelRashi(index: number, lang: Lang, sanskritName: string): string {
  if (lang === 'si' && index >= 0 && index < 12) return RASHI_SANSKRIT_SI[index];
  return sanskritName;
}

export function labelRashiWestern(index: number, lang: Lang, englishName: string): string {
  if (lang === 'si' && index >= 0 && index < 12) return RASHI_WESTERN_SI[index];
  return englishName;
}

const DIGNITY_KEYS: Record<string, TranslationKey> = {
  exalted: 'dignity.exalted',
  'own-sign': 'dignity.ownSign',
  'friend-sign': 'dignity.friendly',
  'neutral-sign': 'dignity.neutral',
  'enemy-sign': 'dignity.enemy',
  debilitated: 'dignity.debilitated',
  Exalted: 'dignity.exalted',
  'Own Sign': 'dignity.ownSign',
  Own: 'dignity.ownSign',
  Friendly: 'dignity.friendly',
  Friend: 'dignity.friendly',
  Neutral: 'dignity.neutral',
  'Enemy Sign': 'dignity.enemy',
  Enemy: 'dignity.enemy',
  Debilitated: 'dignity.debilitated',
};

export function labelDignity(key: string, lang: Lang): string {
  const tk = DIGNITY_KEYS[key];
  return tk ? tKey(tk, lang) : key;
}

const TREND_KEYS: Record<string, TranslationKey> = {
  positive: 'trend.favorable',
  favorable: 'trend.favorable',
  Favorable: 'trend.favorable',
  negative: 'trend.challenging',
  challenging: 'trend.challenging',
  Challenging: 'trend.challenging',
  mixed: 'trend.mixed',
  Mixed: 'trend.mixed',
  neutral: 'trend.neutral',
  Neutral: 'trend.neutral',
};

export function labelTrend(key: string, lang: Lang): string {
  const tk = TREND_KEYS[key];
  return tk ? tKey(tk, lang) : key;
}

const AREA_KEYS: Record<string, TranslationKey> = {
  health: 'area.health',
  Health: 'area.health',
  wealth: 'area.wealth',
  Wealth: 'area.wealth',
  career: 'area.career',
  Career: 'area.career',
  relationships: 'area.relationships',
  Relationships: 'area.relationships',
  relations: 'area.relationships',
  Relations: 'area.relationships',
  general: 'area.general',
  General: 'area.general',
};

export function labelArea(key: string, lang: Lang): string {
  const tk = AREA_KEYS[key];
  return tk ? tKey(tk, lang) : key;
}

const DASHA_LEVEL_KEYS: Record<string, TranslationKey> = {
  Mahadasha: 'dasha.mahadasha',
  Antardasha: 'dasha.antardasha',
  Pratyantardasha: 'dasha.pratyantardasha',
  'Sookshma Dasha': 'dasha.sookshma',
};

export function labelDashaLevel(label: string, lang: Lang): string {
  const tk = DASHA_LEVEL_KEYS[label];
  return tk ? tKey(tk, lang) : label;
}

const ORDINAL_SI = ['', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

export function labelOrdinalHouse(n: number, lang: Lang): string {
  if (lang === 'si') return `${ORDINAL_SI[n]} වන ගෘහ`;
  const en = ['', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];
  return `${en[n]} House`;
}

const YOGA_CAT_KEYS: Record<string, { label: TranslationKey; desc: TranslationKey }> = {
  rajayoga:    { label: 'yogas.cat.rajayoga',    desc: 'yogas.cat.rajayogaDesc' },
  mahapurusha: { label: 'yogas.cat.mahapurusha', desc: 'yogas.cat.mahapurushaDesc' },
  dhana:       { label: 'yogas.cat.dhana',       desc: 'yogas.cat.dhanaDesc' },
  spiritual:   { label: 'yogas.cat.spiritual',   desc: 'yogas.cat.spiritualDesc' },
  special:     { label: 'yogas.cat.special',     desc: 'yogas.cat.specialDesc' },
  daridra:     { label: 'yogas.cat.daridra',     desc: 'yogas.cat.daridraDesc' },
};

export function labelYogaCategory(cat: string, lang: Lang): { label: string; description: string } {
  const cfg = YOGA_CAT_KEYS[cat] ?? YOGA_CAT_KEYS.special;
  return { label: tKey(cfg.label, lang), description: tKey(cfg.desc, lang) };
}

const YOGA_STRENGTH_KEYS: Record<string, TranslationKey> = {
  'very strong': 'yogas.strength.veryStrong',
  strong: 'yogas.strength.strong',
  medium: 'yogas.strength.medium',
  weak: 'yogas.strength.weak',
};

export function labelYogaStrength(strength: string, lang: Lang): string {
  const tk = YOGA_STRENGTH_KEYS[strength];
  return tk ? tKey(tk, lang) : strength;
}

const MATCH_VERDICT_KEYS: Record<string, TranslationKey> = {
  excellent: 'match.verdict.excellent',
  'very good': 'match.verdict.veryGood',
  good: 'match.verdict.good',
  acceptable: 'match.verdict.acceptable',
  'not recommended': 'match.verdict.notRecommended',
};

export function labelMatchVerdict(v: string, lang: Lang): string {
  const tk = MATCH_VERDICT_KEYS[v];
  return tk ? tKey(tk, lang) : v;
}
