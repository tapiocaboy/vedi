/**
 * Per-planet keyword/meaning tables — the compositional unit every other
 * Western text module (sign, house, aspect, transit, synastry) builds
 * sentences from, the same way the Vedic side's `SIG_TEXT` feeds
 * `natalText.ts`. Kept self-contained (not reusing `lib/core/i18n.ts`'s
 * `PLANET_NAME`) since that table doesn't cover Uranus/Neptune/Pluto and this
 * module should not need to touch shared Vedic-used code to grow.
 */

import type { Bi, Lang } from '../../i18n';
import { PLANET_SYMBOLS, PLANET_COLORS, planetDisplayColor } from '../../../../types/astrology';

export const WESTERN_PLANET_NAME: Record<string, Bi> = {
  SUN: { en: 'Sun', si: 'සූර්ය' },
  MOON: { en: 'Moon', si: 'චන්ද්‍ර' },
  MERCURY: { en: 'Mercury', si: 'බුධ' },
  VENUS: { en: 'Venus', si: 'ශුක්‍ර' },
  MARS: { en: 'Mars', si: 'කුජ' },
  JUPITER: { en: 'Jupiter', si: 'ගුරු' },
  SATURN: { en: 'Saturn', si: 'ශනි' },
  URANUS: { en: 'Uranus', si: 'යුරේනස්' },
  NEPTUNE: { en: 'Neptune', si: 'නෙප්චූන්' },
  PLUTO: { en: 'Pluto', si: 'ප්ලූටෝ' },
  ASCENDANT: { en: 'Ascendant', si: 'ලග්නය' },
  MIDHEAVEN: { en: 'Midheaven', si: 'මධ්‍යාකාශය' },
};

export function westernPlanetName(planet: string, lang: Lang): string {
  const b = WESTERN_PLANET_NAME[planet.toUpperCase()];
  return b ? (lang === 'si' ? b.si : b.en) : planet;
}

/** What each body governs — a short keyword list, English + Sinhala index-aligned. */
export const PLANET_KEYWORDS: Record<string, { en: string[]; si: string[] }> = {
  SUN: {
    en: ['identity', 'vitality', 'ego', 'purpose', 'self-expression', 'father figures'],
    si: ['අනන්‍යතාව', 'ජීවශක්තිය', 'අහංකාරය', 'අරමුණ', 'ස්වයං ප්‍රකාශනය', 'පියා'],
  },
  MOON: {
    en: ['emotions', 'instinct', 'home', 'the inner world', 'habits', 'mother figures'],
    si: ['හැඟීම්', 'සහජබුද්ධිය', 'නිවස', 'අභ්‍යන්තර ලෝකය', 'පුරුදු', 'මව'],
  },
  MERCURY: {
    en: ['communication', 'thought', 'learning', 'short trips', 'siblings', 'negotiation'],
    si: ['සන්නිවේදනය', 'චින්තනය', 'ඉගෙනීම', 'කෙටි ගමන්', 'සහෝදර සහෝදරියන්', 'සාකච්ඡා'],
  },
  VENUS: {
    en: ['love', 'attraction', 'beauty', 'money', 'values', 'harmony'],
    si: ['ආදරය', 'ආකර්ෂණය', 'සුන්දරත්වය', 'මුදල්', 'වටිනාකම්', 'සමගිය'],
  },
  MARS: {
    en: ['drive', 'assertion', 'desire', 'conflict', 'courage', 'physical energy'],
    si: ['තෙරපුම', 'දැඩි ස්වභාවය', 'ආශාව', 'ගැටුම', 'නිර්භීතකම', 'ශාරීරික ශක්තිය'],
  },
  JUPITER: {
    en: ['growth', 'optimism', 'belief', 'travel', 'higher learning', 'luck'],
    si: ['වර්ධනය', 'ශුභවාදීත්වය', 'විශ්වාසය', 'සංචාරය', 'උසස් අධ්‍යාපනය', 'භාග්‍යය'],
  },
  SATURN: {
    en: ['discipline', 'responsibility', 'limitation', 'time', 'structure', 'maturity'],
    si: ['විනය', 'වගකීම', 'සීමාව', 'කාලය', 'ව්‍යුහය', 'පරිණතභාවය'],
  },
  URANUS: {
    en: ['change', 'rebellion', 'originality', 'sudden events', 'technology', 'independence'],
    si: ['වෙනස', 'කැරලිකාරී ස්වභාවය', 'නිර්මාණශීලීත්වය', 'හදිසි සිදුවීම්', 'තාක්ෂණය', 'ස්වාධීනත්වය'],
  },
  NEPTUNE: {
    en: ['imagination', 'spirituality', 'illusion', 'compassion', 'dissolution', 'dreams'],
    si: ['පරිකල්පනය', 'අධ්‍යාත්මිකත්වය', 'මායාව', 'කරුණාව', 'දිය වීම', 'සිහින'],
  },
  PLUTO: {
    en: ['transformation', 'power', 'the unconscious', 'intensity', 'regeneration', 'endings'],
    si: ['පරිවර්තනය', 'බලය', 'අවිඥානය', 'තීව්‍රතාව', 'පුනර්ජීවනය', 'අවසන්කිරීම්'],
  },
};

export function planetKeywords(planet: string, lang: Lang, count = 4): string[] {
  const k = PLANET_KEYWORDS[planet.toUpperCase()];
  if (!k) return [];
  return (lang === 'si' ? k.si : k.en).slice(0, count);
}

/** Traditional benefic/malefic classification, used to colour conjunctions and general valence. */
export const WESTERN_BENEFICS = new Set(['VENUS', 'JUPITER']);
export const WESTERN_MALEFICS = new Set(['MARS', 'SATURN', 'PLUTO']);

/**
 * Glyph/colour for the three outer planets and Midheaven, which the shared
 * Vedic `PLANET_SYMBOLS`/`PLANET_COLORS` (`types/astrology.ts`) don't define
 * — those tables are iterated wholesale to build the Vedic chart legend, so
 * adding entries there leaks Western-only symbols into it. Kept local here
 * instead; `westernPlanetGlyph`/`westernPlanetColor` fall back to the shared
 * tables for the eight bodies both systems recognise.
 */
const EXTRA_GLYPH: Record<string, string> = { URANUS: '♅', NEPTUNE: '♆', PLUTO: '♇', MIDHEAVEN: 'MC' };
const EXTRA_COLOR: Record<string, string> = { URANUS: '#22d3ee', NEPTUNE: '#38bdf8', PLUTO: '#94a3b8', MIDHEAVEN: '#fbbf24' };

export function westernPlanetGlyph(planet: string): string {
  const p = planet.toUpperCase();
  return EXTRA_GLYPH[p] ?? PLANET_SYMBOLS[p] ?? p;
}

export function westernPlanetColor(planet: string, isLight: boolean): string {
  const p = planet.toUpperCase();
  if (EXTRA_COLOR[p]) return EXTRA_COLOR[p];
  return PLANET_COLORS[p] ? planetDisplayColor(p, isLight) : '#8b5cf6';
}
