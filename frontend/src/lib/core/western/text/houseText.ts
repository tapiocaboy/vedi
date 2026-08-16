/**
 * The twelve Western houses — angular/succedent/cadent psychological
 * astrology framing, distinct from the Vedic bhava text in `../../text/
 * planetaryText.ts` (which reads the same twelve life-areas through karaka
 * and lordship rules rather than the angle-based Placidus tradition).
 */

import type { Bi, BiList } from '../../i18n';

export interface WesternHouseDisplay { name: Bi; theme: Bi; rules: BiList }

export const WESTERN_HOUSE_DISPLAY: Record<number, WesternHouseDisplay> = {
  1: {
    name: { en: 'House of Self', si: 'ස්වයං භාවය' },
    theme: { en: 'identity, appearance, and how you meet the world', si: 'අනන්‍යතාව, පෙනුම, හා ලෝකයට මුහුණ දෙන ආකාරය' },
    rules: {
      en: ['physical appearance', 'first impressions', 'how you initiate', 'general vitality'],
      si: ['ශාරීරික පෙනුම', 'මුල් හැඟීම්', 'ආරම්භ කරන ආකාරය', 'සාමාන්‍ය ජීවශක්තිය'],
    },
  },
  2: {
    name: { en: 'House of Value', si: 'වටිනාකමේ භාවය' },
    theme: { en: 'money, possessions, and self-worth', si: 'මුදල්, දේපළ, හා ස්වයං වටිනාකම' },
    rules: {
      en: ['income and earning', 'possessions', 'self-esteem', 'material security'],
      si: ['ආදායම හා ඉපැයීම', 'දේපළ', 'ස්වයං ගරුත්වය', 'ද්‍රව්‍යමය සුරක්ෂිතභාවය'],
    },
  },
  3: {
    name: { en: 'House of Communication', si: 'සන්නිවේදන භාවය' },
    theme: { en: 'everyday communication, siblings, and immediate surroundings', si: 'එදිනෙදා සන්නිවේදනය, සහෝදර සහෝදරියන්, හා ආසන්න පරිසරය' },
    rules: {
      en: ['communication style', 'siblings and neighbours', 'short trips', 'early learning'],
      si: ['සන්නිවේදන ශෛලිය', 'සහෝදර සහෝදරියන් හා අසල්වාසීන්', 'කෙටි ගමන්', 'මුල් අධ්‍යාපනය'],
    },
  },
  4: {
    name: { en: 'House of Home', si: 'නිවසේ භාවය' },
    theme: { en: 'family, roots, and your emotional foundation', si: 'පවුල, මූලයන්, හා ඔබේ හැඟීම්බර පදනම' },
    rules: {
      en: ['home and family', 'one parent (traditionally)', 'roots and ancestry', 'private, inner life'],
      si: ['නිවස හා පවුල', 'දෙමාපියන්ගෙන් එක් අයෙක් (සම්ප්‍රදායිකව)', 'මූලයන් හා පරම්පරාව', 'පෞද්ගලික අභ්‍යන්තර ජීවිතය'],
    },
  },
  5: {
    name: { en: 'House of Pleasure', si: 'ප්‍රීතියේ භාවය' },
    theme: { en: 'romance, creativity, and self-expression', si: 'ආදර සබඳතා, නිර්මාණශීලීත්වය, හා ස්වයං ප්‍රකාශනය' },
    rules: {
      en: ['romance and dating', 'creative self-expression', 'children', 'pleasure and play'],
      si: ['ආදර සබඳතා', 'නිර්මාණශීලී ස්වයං ප්‍රකාශනය', 'දරුවන්', 'විනෝදය හා ක්‍රීඩාව'],
    },
  },
  6: {
    name: { en: 'House of Work', si: 'රැකියාවේ භාවය' },
    theme: { en: 'daily routine, health, and service', si: 'දෛනික චර්යාව, සෞඛ්‍යය, හා සේවය' },
    rules: {
      en: ['daily work and routine', 'physical health habits', 'service to others', 'coworkers'],
      si: ['දෛනික රැකියාව හා චර්යාව', 'ශාරීරික සෞඛ්‍ය පුරුදු', 'අන් අයට සේවය', 'සේවා සගයන්'],
    },
  },
  7: {
    name: { en: 'House of Partnership', si: 'හවුල්කාරිත්වයේ භාවය' },
    theme: { en: 'marriage, close partnerships, and open relationships of all kinds', si: 'විවාහය, සමීප හවුල්කාරිත්ව, හා සියලු ආකාරයේ විවෘත සබඳතා' },
    rules: {
      en: ['marriage and committed partnership', 'business partners', 'what you seek in others', 'open, known rivals'],
      si: ['විවාහය හා කැපවූ හවුල්කාරිත්වය', 'ව්‍යාපාරික හවුල්කරුවන්', 'අන් අය තුළ ඔබ සොයන දේ', 'විවෘත, දන්නා ප්‍රතිවාදීන්'],
    },
  },
  8: {
    name: { en: 'House of Transformation', si: 'පරිවර්තනයේ භාවය' },
    theme: { en: 'intimacy, shared resources, and deep psychological change', si: 'සමීපත්වය, බෙදාගත් සම්පත්, හා ගැඹුරු මානසික වෙනස්කම්' },
    rules: {
      en: ['intimacy and merging', 'shared and inherited money', 'crisis and deep change', 'the psychological undercurrent'],
      si: ['සමීපත්වය හා එකතුවීම', 'බෙදාගත් හා උරුම මුදල්', 'අර්බුද හා ගැඹුරු වෙනස්කම්', 'මානසික යටිතලය'],
    },
  },
  9: {
    name: { en: 'House of Philosophy', si: 'දර්ශනයේ භාවය' },
    theme: { en: 'belief, higher learning, and the long journey outward', si: 'විශ්වාසය, උසස් අධ්‍යාපනය, හා බාහිර දිගු ගමන' },
    rules: {
      en: ['higher education', 'long-distance travel', 'belief systems and philosophy', 'publishing and teaching'],
      si: ['උසස් අධ්‍යාපනය', 'දුර ගමන්', 'විශ්වාස පද්ධති හා දර්ශනය', 'ප්‍රකාශනය හා ඉගැන්වීම'],
    },
  },
  10: {
    name: { en: 'House of Career', si: 'වෘත්තියේ භාවය' },
    theme: { en: 'career, reputation, and public standing', si: 'වෘත්තිය, කීර්තිය, හා ප්‍රසිද්ධ තත්ත්වය' },
    rules: {
      en: ['career and vocation', 'public reputation', 'authority figures', 'one parent (traditionally)'],
      si: ['වෘත්තිය', 'ප්‍රසිද්ධ කීර්තිය', 'බලධාරීන්', 'දෙමාපියන්ගෙන් එක් අයෙක් (සම්ප්‍රදායිකව)'],
    },
  },
  11: {
    name: { en: 'House of Community', si: 'ප්‍රජාවේ භාවය' },
    theme: { en: 'friendship, groups, and hopes for the future', si: 'මිත්‍රත්වය, කණ්ඩායම්, හා අනාගතය පිළිබඳ බලාපොරොත්තු' },
    rules: {
      en: ['friendships', 'group and community involvement', 'hopes and long-term wishes', 'humanitarian causes'],
      si: ['මිත්‍රත්වය', 'කණ්ඩායම් හා ප්‍රජා සම්බන්ධතා', 'බලාපොරොත්තු හා දිගුකාලීන ආශාවන්', 'මානුෂීය කටයුතු'],
    },
  },
  12: {
    name: { en: 'House of the Unconscious', si: 'අවිඥානයේ භාවය' },
    theme: { en: 'what stays hidden — the subconscious, retreat, and endings', si: 'සැඟවී පවතින දේ — අවිඥානය, හුදෙකලාව, හා අවසන්කිරීම්' },
    rules: {
      en: ['the subconscious', 'solitude and retreat', 'hidden strengths and weaknesses', 'endings and letting go'],
      si: ['අවිඥානය', 'හුදෙකලාව', 'සැඟවුණු ශක්තීන් හා දුර්වලතා', 'අවසන්කිරීම් හා අත්හැරීම'],
    },
  },
};
