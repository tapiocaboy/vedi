/**
 * Engine-level i18n primitives.
 *
 * The prediction/analysis engines under `lib/core` emit finished prose, so they
 * need the language at generation time rather than at render time. Every prose
 * table in those engines is a `Bi` (single sentence) or `BiList` (bullet list)
 * holding both languages side by side; `pick` / `pickList` select one.
 *
 * Kept dependency-free so the engines stay usable outside React (export,
 * tests, AI chat context — all of which ask for `en` explicitly).
 */

import { RASHIS, RASHI_SI, RASHIS_TA, RASHIS_ZH, RASHIS_HI, RASHIS_JA, RASHIS_KO, RASHIS_AR, RASHIS_ML } from './rashi';

/**
 * `si` has been a first-class, required language here since the engine's
 * start — every `Bi`/`BiList` must carry it. The other seven are opt-in per
 * table: their fields are optional (see `Bi`/`BiList` below) so the many
 * prose tables across this engine that only ever populated en/si keep
 * type-checking unchanged. `pick`/`pickList` fall back to `en` for any field
 * a given table hasn't translated yet — the same graceful degradation the UI
 * layer already relies on for its own untranslated content.
 */
export type Lang = 'en' | 'si' | 'ta' | 'zh' | 'hi' | 'ja' | 'ko' | 'ar' | 'ml';

/** A single sentence, `en`/`si` required, the rest opt-in per table. */
export interface Bi {
  en: string; si: string;
  ta?: string; zh?: string; hi?: string; ja?: string; ko?: string; ar?: string; ml?: string;
}
/** A bullet list, same required/opt-in split as `Bi` — index-aligned per language. */
export interface BiList {
  en: string[]; si: string[];
  ta?: string[]; zh?: string[]; hi?: string[]; ja?: string[]; ko?: string[]; ar?: string[]; ml?: string[];
}

/** Same storage key the UI's LanguageContext writes. */
const LANG_KEY = 'trytellme_lang';

const STORED_LANGS: Lang[] = ['si', 'ta', 'zh', 'hi', 'ja', 'ko', 'ar', 'ml'];

/**
 * The user's saved language, read at call time. Engines run outside React, so
 * this is the default when a caller doesn't pass an explicit `lang`.
 */
export function getStoredLang(): Lang {
  try {
    const v = typeof localStorage !== 'undefined' ? localStorage.getItem(LANG_KEY) : null;
    return (v && (STORED_LANGS as string[]).includes(v)) ? (v as Lang) : 'en';
  } catch {
    return 'en';
  }
}

export function pick(b: Bi, lang: Lang): string {
  return b[lang] ?? b.en;
}

export function pickList(b: BiList, lang: Lang): string[] {
  return (b[lang] ?? b.en).slice();
}

/**
 * Large parts of this engine's text layer predate the wider `Lang` union and
 * are still only translated into English and Sinhala — their tables are
 * typed `Record<TableLang, V>` rather than `Bi`, so `en2si` narrows any of
 * the newer languages down to `en` before a lookup, the same fallback `pick`
 * gives `Bi`-typed tables.
 */
export type TableLang = 'en' | 'si';
export const en2si = (lang: Lang): TableLang => (lang === 'si' ? 'si' : 'en');

/** Convenience for tables shaped `{ details: BiList; remedies: BiList }`. */
export function pickSpec(
  spec: { details: BiList; remedies: BiList },
  lang: Lang,
): { details: string[]; remedies: string[] } {
  return { details: pickList(spec.details, lang), remedies: pickList(spec.remedies, lang) };
}

// ─── Shared vocabulary ─────────────────────────────────────────────────────

/**
 * Planet names as they read inside a sentence. Sinhala uses the standard Vedic
 * forms that Sri Lankan almanacs use, and these all combine bare with දශාව /
 * අන්තර් දශාව, so no case marking is needed at the call sites. Tamil, Hindi
 * and Malayalam have their own living Vedic-astrology traditions, so those use
 * the same Sanskrit-derived terms their own almanacs print. Chinese, Japanese,
 * Korean and Arabic don't — those use each language's standard astronomical
 * planet name, with Rahu/Ketu transliterated (there is no native term for the
 * lunar nodes in any of the four).
 */
const PLANET_NAME: Record<string, Bi> = {
  Sun:     { en: 'Sun',     si: 'සූර්ය',    ta: 'சூரியன்', zh: '太阳',   hi: 'सूर्य',    ja: '太陽',   ko: '태양',   ar: 'الشمس',   ml: 'സൂര്യൻ' },
  Moon:    { en: 'Moon',    si: 'චන්ද්‍ර',   ta: 'சந்திரன்', zh: '月亮',   hi: 'चंद्र',    ja: '月',    ko: '달',    ar: 'القمر',   ml: 'ചന്ദ്രൻ' },
  Mars:    { en: 'Mars',    si: 'කුජ',      ta: 'செவ்வாய்', zh: '火星',   hi: 'मंगल',    ja: '火星',   ko: '화성',   ar: 'المريخ',  ml: 'ചൊവ്വ' },
  Mercury: { en: 'Mercury', si: 'බුධ',      ta: 'புதன்',   zh: '水星',   hi: 'बुध',     ja: '水星',   ko: '수성',   ar: 'عطارد',   ml: 'ബുധൻ' },
  Jupiter: { en: 'Jupiter', si: 'ගුරු',     ta: 'குரு',    zh: '木星',   hi: 'बृहस्पति', ja: '木星',   ko: '목성',   ar: 'المشتري', ml: 'വ്യാഴം' },
  Venus:   { en: 'Venus',   si: 'ශුක්‍ර',    ta: 'சுக்கிரன்', zh: '金星',   hi: 'शुक्र',    ja: '金星',   ko: '금성',   ar: 'الزهرة',  ml: 'ശുക്രൻ' },
  Saturn:  { en: 'Saturn',  si: 'ශනි',      ta: 'சனி',     zh: '土星',   hi: 'शनि',     ja: '土星',   ko: '토성',   ar: 'زحل',    ml: 'ശനി' },
  Rahu:    { en: 'Rahu',    si: 'රාහු',     ta: 'ராகு',    zh: '罗睺',   hi: 'राहु',     ja: 'ラーフ',  ko: '라후',   ar: 'راهو',   ml: 'രാഹു' },
  Ketu:    { en: 'Ketu',    si: 'කේතු',     ta: 'கேது',    zh: '计都',   hi: 'केतु',     ja: 'ケートゥ', ko: '케투',   ar: 'كيتو',   ml: 'കേതു' },
};

export function planetName(planet: string, lang: Lang): string {
  const b = PLANET_NAME[planet];
  return b ? pick(b, lang) : planet;
}

/**
 * Dasha level names. These are Sanskrit technical terms with no real
 * equivalent outside the Vedic tradition, so every language keeps them as a
 * transliteration in its own script rather than translating the meaning —
 * the same choice English makes by not calling it a "great period" either.
 */
export const LEVEL: Record<'maha' | 'antar' | 'pratyantar' | 'sookshma', Bi> = {
  maha:       { en: 'Mahadasha',       si: 'මහා දශාව',       ta: 'மகாதசை',        zh: '玛哈达沙',   hi: 'महादशा',       ja: 'マハーダシャー',   ko: '마하다샤',   ar: 'ماهاداشا',     ml: 'മഹാദശ' },
  antar:      { en: 'antardasha',      si: 'අන්තර් දශාව',    ta: 'அந்தர்தசை',      zh: '安塔尔达沙',  hi: 'अंतर्दशा',      ja: 'アンタルダシャー', ko: '안타르다샤',  ar: 'أنتارداشا',    ml: 'അന്തർദശ' },
  pratyantar: { en: 'pratyantardasha', si: 'ප්‍රත්‍යන්තර් දශාව', ta: 'பிரத்யந்தர்தசை', zh: '普拉提安塔尔达沙', hi: 'प्रत्यंतर्दशा',  ja: 'プラティアンタルダシャー', ko: '프라티안타르다샤', ar: 'براتيانتارداشا', ml: 'പ്രത്യന്തർദശ' },
  sookshma:   { en: 'sookshma period', si: 'සූක්ෂ්ම දශාව',   ta: 'சூக்ஷ்ம தசை',    zh: '苏克什马期',  hi: 'सूक्ष्म दशा',    ja: 'スークシュマ期',   ko: '숙슈마기',   ar: 'فترة سوكشما', ml: 'സൂക്ഷ്മ ദശ' },
};

function ordinalSuffix(n: number): string {
  const v = n % 100;
  if (v >= 11 && v <= 13) return 'th';
  switch (n % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

/**
 * "10th house" in whichever language. Chinese/Japanese/Korean/Arabic don't
 * inflect for ordinals the way English does, so those use each language's own
 * "house number N" framing instead of forcing an English-shaped ordinal onto
 * them. Tamil, Hindi and Malayalam use their own ordinal-suffix conventions.
 *
 * Note the Sinhala term is භාවය — the astrological house. (ගෘහය means a
 * physical building and reads as a mistranslation to any Sinhala speaker.)
 * Tamil/Malayalam follow the same distinction (வீடு/ഭാവം are the astrological
 * terms, not a literal building).
 */
export function houseLabel(n: number, lang: Lang): string {
  switch (lang) {
    case 'si': return `${n} වන භාවය`;
    case 'ta': return `${n}-ஆம் வீடு`;
    case 'zh': return `第${n}宫`;
    case 'hi': return `${n}वां भाव`;
    case 'ja': return `第${n}ハウス`;
    case 'ko': return `제${n}하우스`;
    case 'ar': return `البيت رقم ${n}`;
    case 'ml': return `${n}-ാം ഭാവം`;
    default:   return `${n}${ordinalSuffix(n)} house`;
  }
}

/** Same, in the locative — "in your 10th house". Languages that don't case-mark
    nouns (en, zh, ja, ko, ar) reuse the base form; the sentence's own "in"
    carries that meaning instead. */
export function houseLabelLocative(n: number, lang: Lang): string {
  switch (lang) {
    case 'si': return `${n} වන භාවයේ`;
    case 'ta': return `${n}-ஆம் வீட்டில்`;
    case 'hi': return `${n}वें भाव में`;
    case 'ml': return `${n}-ാം ഭാവത്തിൽ`;
    default:   return houseLabel(n, lang);
  }
}

/**
 * "Mula pada 1" / "මූල නැකත, පාදය 1".
 *
 * Nakshatra names stay in their standard transliterated form in every
 * language — that is how each tradition's own almanacs print them — so only
 * the frame ("pada N") is localised. Chinese/Japanese/Korean/Arabic
 * transliterate "pada" itself too, since none of the four has a native term
 * for a nakshatra quarter.
 */
export function nakshatraPadaLabel(name: string, pada: number, lang: Lang): string {
  switch (lang) {
    case 'si': return `${name} නැකත, පාදය ${pada}`;
    case 'ta': return `${name} பாதம் ${pada}`;
    case 'zh': return `${name} 第${pada}分`;
    case 'hi': return `${name} पद ${pada}`;
    case 'ja': return `${name} パダ${pada}`;
    case 'ko': return `${name} 파다 ${pada}`;
    case 'ar': return `${name} بادا ${pada}`;
    case 'ml': return `${name} പാദം ${pada}`;
    default:   return `${name} pada ${pada}`;
  }
}

/** Rashi (sign) name by index 0–11, in the given language. */
export function rashiName(index: number, lang: Lang): string {
  switch (lang) {
    case 'si': return RASHI_SI[index];
    case 'ta': return RASHIS_TA[index];
    case 'zh': return RASHIS_ZH[index];
    case 'hi': return RASHIS_HI[index];
    case 'ja': return RASHIS_JA[index];
    case 'ko': return RASHIS_KO[index];
    case 'ar': return RASHIS_AR[index];
    case 'ml': return RASHIS_ML[index];
    default:   return RASHIS[index];
  }
}

const AND_WORD: Partial<Record<Lang, string>> = {
  si: 'සහ', ta: 'மற்றும்', zh: '和', hi: 'और', ja: 'と', ko: '그리고', ar: 'و', ml: 'ഒപ്പം',
};

/** Joins list items with the language's "and": "a, b and c" / "a, b සහ c". */
export function joinAnd(items: string[], lang: Lang): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  const head = items.slice(0, -1).join(', ');
  const last = items[items.length - 1];
  const and = AND_WORD[lang];
  return and ? `${head} ${and} ${last}` : `${head} and ${last}`;
}

/** Plain comma join — used where the source enumerated terms without "and". */
export function joinComma(items: string[]): string {
  return items.join(', ');
}
