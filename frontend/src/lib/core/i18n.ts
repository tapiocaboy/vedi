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

import { RASHIS, RASHI_SI } from './rashi';

export type Lang = 'en' | 'si';

/** A single sentence in both languages. */
export interface Bi { en: string; si: string }
/** A bullet list in both languages — `en` and `si` must stay index-aligned. */
export interface BiList { en: string[]; si: string[] }

/** Same storage key the UI's LanguageContext writes. */
const LANG_KEY = 'trytellme_lang';

/**
 * The user's saved language, read at call time. Engines run outside React, so
 * this is the default when a caller doesn't pass an explicit `lang`.
 */
export function getStoredLang(): Lang {
  try {
    return (typeof localStorage !== 'undefined' && localStorage.getItem(LANG_KEY) === 'si') ? 'si' : 'en';
  } catch {
    return 'en';
  }
}

export function pick(b: Bi, lang: Lang): string {
  return lang === 'si' ? b.si : b.en;
}

export function pickList(b: BiList, lang: Lang): string[] {
  return (lang === 'si' ? b.si : b.en).slice();
}

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
 * අන්තර් දශාව, so no case marking is needed at the call sites.
 */
const PLANET_NAME: Record<string, Bi> = {
  Sun:     { en: 'Sun',     si: 'සූර්ය' },
  Moon:    { en: 'Moon',    si: 'චන්ද්‍ර' },
  Mars:    { en: 'Mars',    si: 'කුජ' },
  Mercury: { en: 'Mercury', si: 'බුධ' },
  Jupiter: { en: 'Jupiter', si: 'ගුරු' },
  Venus:   { en: 'Venus',   si: 'ශුක්‍ර' },
  Saturn:  { en: 'Saturn',  si: 'ශනි' },
  Rahu:    { en: 'Rahu',    si: 'රාහු' },
  Ketu:    { en: 'Ketu',    si: 'කේතු' },
};

export function planetName(planet: string, lang: Lang): string {
  const b = PLANET_NAME[planet];
  return b ? pick(b, lang) : planet;
}

/** Dasha level names, for sentences that mention the level explicitly. */
export const LEVEL: Record<'maha' | 'antar' | 'pratyantar' | 'sookshma', Bi> = {
  maha:       { en: 'Mahadasha',       si: 'මහා දශාව' },
  antar:      { en: 'antardasha',      si: 'අන්තර් දශාව' },
  pratyantar: { en: 'pratyantardasha', si: 'ප්‍රත්‍යන්තර් දශාව' },
  sookshma:   { en: 'sookshma period', si: 'සූක්ෂ්ම දශාව' },
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
 * "10th house" / "10 වන භාවය".
 *
 * Note the Sinhala term is භාවය — the astrological house. (ගෘහය means a
 * physical building and reads as a mistranslation to any Sinhala speaker.)
 */
export function houseLabel(n: number, lang: Lang): string {
  return lang === 'si' ? `${n} වන භාවය` : `${n}${ordinalSuffix(n)} house`;
}

/** Same, in the locative — "in your 10th house" / "ඔබේ 10 වන භාවයේ". */
export function houseLabelLocative(n: number, lang: Lang): string {
  return lang === 'si' ? `${n} වන භාවයේ` : `${n}${ordinalSuffix(n)} house`;
}

/**
 * "Mula pada 1" / "මූල නැකත, පාදය 1".
 *
 * Nakshatra names stay in their standard transliterated form in both languages —
 * that is how Sri Lankan almanacs print them — so only the frame is localised.
 */
export function nakshatraPadaLabel(name: string, pada: number, lang: Lang): string {
  return lang === 'si' ? `${name} නැකත, පාදය ${pada}` : `${name} pada ${pada}`;
}

/** Rashi (sign) name by index 0–11, in the given language. */
export function rashiName(index: number, lang: Lang): string {
  return lang === 'si' ? RASHI_SI[index] : RASHIS[index];
}

/** Joins list items with the language's "and": "a, b and c" / "a, b සහ c". */
export function joinAnd(items: string[], lang: Lang): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  const head = items.slice(0, -1).join(', ');
  return lang === 'si' ? `${head} සහ ${items[items.length - 1]}` : `${head} and ${items[items.length - 1]}`;
}

/** Plain comma join — used where the source enumerated terms without "and". */
export function joinComma(items: string[]): string {
  return items.join(', ');
}
