/**
 * Synastry sentence composers — cross-chart aspects and house overlays.
 * Aspect prose reuses `aspectText.ts`'s nature/verb tables (the geometry is
 * identical to a natal aspect, only the two bodies now belong to different
 * charts) but frames it as "your X — their Y" rather than "X — Y", since a
 * synastry reading is read as a statement about a relationship, not a chart.
 */

import type { Lang } from '../../i18n';
import { pick } from '../../i18n';
import type { AspectType } from '../aspects';
import { westernPlanetName, planetKeywords } from './planetText';
import { ASPECT_NATURE_TEXT, ASPECT_VERB } from './aspectText';
import { WESTERN_HOUSE_DISPLAY } from './houseText';

/**
 * `youLabel`/`themLabel` are already possessive-form ("Your"/"their",
 * "ඔබේ"/"ඔවුන්ගේ") — the caller supplies grammar, not a name, since neither
 * `BirthData` carries one.
 */
export function composeInterAspectSentence(
  actingPlanet: string, receivingPlanet: string, type: AspectType,
  youLabel: string, themLabel: string, lang: Lang,
): string {
  const a = westernPlanetName(actingPlanet, lang);
  const b = westernPlanetName(receivingPlanet, lang);
  const verb = pick(ASPECT_VERB[type], lang);
  const nature = pick(ASPECT_NATURE_TEXT[type], lang);
  const kwA = planetKeywords(actingPlanet, lang, 2).join(lang === 'si' ? ', ' : ' and ');
  const kwB = planetKeywords(receivingPlanet, lang, 2).join(lang === 'si' ? ', ' : ' and ');
  if (lang === 'si') {
    return `${youLabel} ${a}, ${themLabel} ${b} ${verb}: ${nature}. මෙය ${youLabel} ${kwA} ${themLabel} ${kwB} සමඟ සම්බන්ධ කරයි.`;
  }
  return `${youLabel} ${a} ${verb} ${themLabel} ${b}: ${nature}. This links ${youLabel.toLowerCase()} ${kwA} with ${themLabel.toLowerCase()} ${kwB}.`;
}

/** "Your Venus falls in their 7th house — marriage, close partnerships, and open relationships of all kinds." */
export function composeOverlaySentence(
  actingPlanet: string, house: number, youLabel: string, themLabel: string, lang: Lang,
): string {
  const a = westernPlanetName(actingPlanet, lang);
  const theme = pick(WESTERN_HOUSE_DISPLAY[house].theme, lang);
  return lang === 'si'
    ? `${youLabel} ${a}, ${themLabel} ${house} වන භාවයේ වැටේ — ${theme}.`
    : `${youLabel} ${a} falls in ${themLabel.toLowerCase()} ${house}${ordinal(house)} house — ${theme}.`;
}

function ordinal(n: number): string {
  const v = n % 100;
  if (v >= 11 && v <= 13) return 'th';
  return ['th', 'st', 'nd', 'rd'][n % 10] ?? 'th';
}
