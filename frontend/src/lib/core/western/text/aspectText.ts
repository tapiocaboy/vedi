/**
 * Aspect-nature prose and the sentence composer every aspect-consuming
 * surface (natal grid, transits, synastry) calls into — one place that turns
 * "Mars square Saturn, orb 2°" into a readable sentence, so the three
 * surfaces don't each invent their own phrasing.
 */

import type { Bi, Lang } from '../../i18n';
import { pick } from '../../i18n';
import type { AspectType } from '../aspects';
import { westernPlanetName, planetKeywords } from './planetText';

export const ASPECT_NATURE_TEXT: Record<AspectType, Bi> = {
  conjunction: {
    en: 'a blending — the two merge into a single force, coloured by whichever of them is easier to express',
    si: 'මිශ්‍රණයක් — දෙදෙනාම එකම බලවේගයක් බවට එකතු වේ, ප්‍රකාශ කිරීමට පහසු එකෙකුගේ වර්ණයෙන්',
  },
  sextile: {
    en: 'an easy opening — genuinely supportive, but only pays off if you take the initiative to use it',
    si: 'පහසු ඉඩක් — සැබවින්ම සහායක, එහෙත් එය භාවිතා කිරීමට ඔබ මුලපිරිය යුතුයි',
  },
  square: {
    en: 'productive friction — real tension that pushes growth when worked with, and repeats itself when ignored',
    si: 'ඵලදායී ගැටීමක් — වැඩ කළහොත් වර්ධනයට තල්ලු කරන, නොසලකා හැරියොත් නැවත නැවත සිදුවන සැබෑ ආතතියක්',
  },
  trine: {
    en: 'a natural flow — talent that comes easily, sometimes too easily to feel earned or get exercised on purpose',
    si: 'ස්වාභාවික ගලායාමක් — පහසුවෙන් එන දක්ෂතාවක්, සමහර විට උපයාගත් බවක් හෝ හිතාමතා ව්‍යායාම කරන බවක් නොදැනෙන තරමට',
  },
  opposition: {
    en: 'a pull between two poles — awareness built through the push and pull, often projected onto other people before it\'s owned',
    si: 'ධ්‍රැව දෙකක් අතර ඇදීමක් — තල්ලුව හා ඇදීම හරහා ගොඩනැගෙන දැනුවත්භාවයක්, බොහෝවිට තමා තුළම දැනගැනීමට පෙර අන් අය මත පටවනු ලැබේ',
  },
  quincunx: {
    en: 'an awkward adjustment — two energies with little natural overlap, needing continual, deliberate rebalancing',
    si: 'අපහසු සීරුමාරුවක් — ස්වාභාවික සමානකමක් අඩු බලවේග දෙකක්, අඛණ්ඩව හිතාමතා නැවත සමතුලිත කළ යුතුයි',
  },
};

export const ASPECT_VERB: Record<AspectType, Bi> = {
  conjunction: { en: 'conjoins', si: 'සමඟ එකතු වේ' },
  sextile: { en: 'sextiles', si: 'සමඟ සෙක්ස්ටයිල් සම්බන්ධතාවයක් සාදයි' },
  square: { en: 'squares', si: 'සමඟ ස්කේවයර් සම්බන්ධතාවයක් සාදයි' },
  trine: { en: 'trines', si: 'සමඟ ත්‍රයින් සම්බන්ධතාවයක් සාදයි' },
  opposition: { en: 'opposes', si: 'ට විරුද්ධව සිටියි' },
  quincunx: { en: 'forms a quincunx to', si: 'සමඟ ක්වින්කන්ක්ස් සම්බන්ධතාවයක් සාදයි' },
};

/** "Venus trines Mars: a natural flow — ... This links your love, beauty with their drive, courage." */
export function composeAspectSentence(bodyA: string, bodyB: string, type: AspectType, lang: Lang): string {
  const a = westernPlanetName(bodyA, lang);
  const b = westernPlanetName(bodyB, lang);
  const verb = pick(ASPECT_VERB[type], lang);
  const nature = pick(ASPECT_NATURE_TEXT[type], lang);
  const kwA = planetKeywords(bodyA, lang, 2).join(lang === 'si' ? ', ' : ' and ');
  const kwB = planetKeywords(bodyB, lang, 2).join(lang === 'si' ? ', ' : ' and ');
  if (lang === 'si') {
    return `${a} ${b} ${verb}: ${nature}. මෙය ${kwA} ${kwB} සමඟ සම්බන්ධ කරයි.`;
  }
  return `${a} ${verb} ${b}: ${nature}. This links your ${kwA} with your ${kwB}.`;
}
