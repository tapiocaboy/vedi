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

/** Compact planet labels for tight chart cells (2–4 characters). */
const PLANET_SHORT_EN: Record<string, string> = {
  SUN: 'Su', MOON: 'Mo', MARS: 'Ma', MERCURY: 'Me', JUPITER: 'Ju',
  VENUS: 'Ve', SATURN: 'Sa', RAHU: 'Ra', KETU: 'Ke', ASCENDANT: 'As',
};
const PLANET_SHORT_SI: Record<string, string> = {
  SUN: 'රවි', MOON: 'සඳ', MARS: 'කුජ', MERCURY: 'බුධ', JUPITER: 'ගුරු',
  VENUS: 'සිකු', SATURN: 'ශනි', RAHU: 'රාහු', KETU: 'කේතු', ASCENDANT: 'ලග්',
};

export function labelPlanetShort(code: string, lang: Lang): string {
  const c = code.toUpperCase();
  return (lang === 'si' ? PLANET_SHORT_SI[c] : PLANET_SHORT_EN[c]) ?? code.slice(0, 2);
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

// ── Plain-language meanings (for the Knowledge Graph / general audience) ─────────

/** One-line plain meaning of each planet — what it represents in everyday life. */
const PLANET_THEME: Record<string, { en: string; si: string }> = {
  SUN:     { en: 'Identity, vitality & leadership',        si: 'ආත්මය, ජීවය හා නායකත්වය' },
  MOON:    { en: 'Emotions, mind & comfort',               si: 'හැඟීම්, මනස හා සැනසීම' },
  MARS:    { en: 'Energy, drive & courage',                si: 'ශක්තිය, ධෛර්යය හා නිර්භීතභාවය' },
  MERCURY: { en: 'Communication & intellect',              si: 'සන්නිවේදනය හා බුද්ධිය' },
  JUPITER: { en: 'Growth, wisdom & good fortune',          si: 'වර්ධනය, ඥානය හා වාසනාව' },
  VENUS:   { en: 'Love, beauty & pleasures',               si: 'ආදරය, සුන්දරත්වය හා සැප සම්පත්' },
  SATURN:  { en: 'Discipline, patience & life lessons',    si: 'විනය, ඉවසීම හා ජීවිත පාඩම්' },
  RAHU:    { en: 'Ambition & worldly desires',             si: 'අභිලාෂය හා ලෞකික ආශාවන්' },
  KETU:    { en: 'Detachment & spirituality',              si: 'වෙන්වීම හා අධ්‍යාත්මිකත්වය' },
};

export function labelPlanetTheme(code: string, lang: Lang): string {
  const t = PLANET_THEME[code.toUpperCase()];
  return t ? t[lang] : '';
}

/** Short one-word theme for each house (1–12) — for compact graph labels. */
const HOUSE_THEME: Record<number, { en: string; si: string }> = {
  1:  { en: 'Self',       si: 'ආත්මය' },
  2:  { en: 'Money',      si: 'ධනය' },
  3:  { en: 'Courage',    si: 'ධෛර්යය' },
  4:  { en: 'Home',       si: 'නිවස' },
  5:  { en: 'Creativity', si: 'නිර්මාණ' },
  6:  { en: 'Health',     si: 'සෞඛ්‍යය' },
  7:  { en: 'Partners',   si: 'සහකරු' },
  8:  { en: 'Change',     si: 'පරිවර්තනය' },
  9:  { en: 'Luck',       si: 'වාසනාව' },
  10: { en: 'Career',     si: 'වෘත්තිය' },
  11: { en: 'Gains',      si: 'ලාභ' },
  12: { en: 'Release',    si: 'මිදීම' },
};

export function labelHouseTheme(n: number, lang: Lang): string {
  const t = HOUSE_THEME[n];
  return t ? t[lang] : '';
}

/** Fuller plain description of what each house governs. */
const HOUSE_COVERS: Record<number, { en: string; si: string }> = {
  1:  { en: 'Personality, body & fresh starts',          si: 'පෞරුෂය, සිරුර හා නව ආරම්භ' },
  2:  { en: 'Income, savings, food & family',            si: 'ආදායම, ඉතිරිකිරීම්, ආහාර හා පවුල' },
  3:  { en: 'Effort, communication & siblings',          si: 'උත්සාහය, සන්නිවේදනය හා සහෝදරයන්' },
  4:  { en: 'Home, mother, property & peace of mind',     si: 'නිවස, මව, දේපළ හා සිතේ සැනසීම' },
  5:  { en: 'Romance, children, creativity & studies',   si: 'ආදරය, දරුවන්, නිර්මාණශීලීත්වය හා අධ්‍යාපනය' },
  6:  { en: 'Health, daily work, debts & rivals',        si: 'සෞඛ්‍යය, දෛනික වැඩ, ණය හා තරඟකරුවන්' },
  7:  { en: 'Marriage, partnerships & the public',        si: 'විවාහය, හවුල්කාරිත්ව හා මහජනතාව' },
  8:  { en: 'Change, shared money, secrets & longevity',  si: 'වෙනස්වීම්, හවුල් මුදල්, රහස් හා ආයුෂ' },
  9:  { en: 'Fortune, higher learning, travel & beliefs', si: 'වාසනාව, උසස් අධ්‍යාපනය, ගමන් හා විශ්වාස' },
  10: { en: 'Career, reputation & achievement',           si: 'වෘත්තිය, කීර්තිය හා සාර්ථකත්වය' },
  11: { en: 'Income, goals, networks & friends',          si: 'ආදායම, ඉලක්ක, සම්බන්ධතා හා මිතුරන්' },
  12: { en: 'Letting go, expenses, rest & spirituality',  si: 'අත්හැරීම, වියදම්, විවේකය හා අධ්‍යාත්මිකත්වය' },
};

export function labelHouseCovers(n: number, lang: Lang): string {
  const t = HOUSE_COVERS[n];
  return t ? t[lang] : '';
}

/** Plain explanation of how long each dasha level lasts. */
const DASHA_SCOPE: Record<string, { en: string; si: string }> = {
  'Mahadasha':       { en: 'Main life chapter (several years)',       si: 'ප්‍රධාන ජීවිත පරිච්ඡේදය (වසර කිහිපයක්)' },
  'Antardasha':      { en: 'Current sub-phase (months to years)',     si: 'වර්තමාන උප-අදියර (මාස කිහිපයක සිට වසර දක්වා)' },
  'Pratyantardasha': { en: 'Short window (weeks to months)',          si: 'කෙටි කාලය (සති සිට මාස දක්වා)' },
  'Sookshma Dasha':  { en: 'Fine-tuning phase (days to weeks)',       si: 'සියුම් අදියර (දින සිට සති දක්වා)' },
};

export function labelDashaScope(label: string, lang: Lang): string {
  const t = DASHA_SCOPE[label];
  return t ? t[lang] : '';
}
