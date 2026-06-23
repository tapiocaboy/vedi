/**
 * Specialised house readings for divisional charts.
 *
 * The same twelve houses carry different meanings depending on the varga:
 * in the Navamsa (D9) every house is read through the lens of marriage,
 * partnership, and dharma; in the Dasamsa (D10) through career, status,
 * and public life. Planet effects are likewise specialised and modulated
 * by the planet's dignity in that varga.
 */

import { RASHI_LORDS, type DignityLevel } from './planetaryAnalysis';
import { RASHIS, RASHI_ENGLISH } from './rashi';
import type { VargaPlanet } from './vargas';

export type VargaVariant = 'D9' | 'D10';

interface HouseTheme {
  theme: string;
  keywords: string[];
  reading: string;
}

const D9_HOUSES: HouseTheme[] = [
  {
    theme: 'Self as Partner',
    keywords: ['identity in marriage', 'approach to commitment', 'inner self'],
    reading: 'This is the navamsa lagna region — it describes who you become inside a committed relationship: your temperament as a partner, what you instinctively give, and how marriage matures your inner self.',
  },
  {
    theme: 'Sustenance of the Union',
    keywords: ['family wealth', 'shared values', 'speech at home'],
    reading: 'Governs the material and verbal nourishment of married life — pooled resources, the family you build together, and whether words at home feed or starve the bond.',
  },
  {
    theme: 'Courage Between Partners',
    keywords: ['effort', 'communication', 'siblings-in-law'],
    reading: 'Shows the day-to-day courage the relationship demands — initiative in resolving friction, short journeys together, and the role of siblings and in-laws in the marriage.',
  },
  {
    theme: 'Domestic Happiness',
    keywords: ['home', 'emotional security', 'inner contentment'],
    reading: 'The heart of domestic life — emotional security with the partner, the home you create together, and the depth of inner contentment marriage brings.',
  },
  {
    theme: 'Romance & Progeny',
    keywords: ['love', 'children', 'shared creativity'],
    reading: 'Governs the romantic spark inside commitment, children and what they bring to the union, and the creative projects partners build side by side.',
  },
  {
    theme: 'Frictions & Adjustments',
    keywords: ['conflicts', 'health of the bond', 'service'],
    reading: 'The testing ground of marriage — recurring disputes, adjustments each partner must make, and the quiet acts of service that either heal or erode the relationship.',
  },
  {
    theme: 'The Spouse',
    keywords: ['partner\'s nature', 'the bond itself', 'commitment'],
    reading: 'The most important house of the navamsa — it directly describes the spouse: their character, how they meet you, and the fundamental quality of the partnership itself.',
  },
  {
    theme: 'Depth & Longevity',
    keywords: ['intimacy', 'transformation', 'shared resources'],
    reading: 'Governs the hidden depths of the union — intimacy, joint finances and inheritance, the transformations marriage forces, and the staying power of the bond through crises.',
  },
  {
    theme: 'Shared Dharma',
    keywords: ['fortune', 'beliefs', 'spiritual alignment'],
    reading: 'Shows whether the partners walk the same dharmic road — shared beliefs, the luck that flows (or doesn\'t) after marriage, and growth through teachers and pilgrimage together.',
  },
  {
    theme: 'Marriage in the World',
    keywords: ['public face', 'duties', 'reputation'],
    reading: 'The public face of the union — how the couple is seen, duties marriage adds to your station, and the karmic work the partnership performs in society.',
  },
  {
    theme: 'Gains Through Union',
    keywords: ['fulfilled desires', 'friendships', 'support network'],
    reading: 'Governs what partnership earns you — the friend circle of the couple, elder siblings\' influence, and the desires that marriage helps fulfil.',
  },
  {
    theme: 'Bed Comforts & Sacrifice',
    keywords: ['private life', 'expenses', 'letting go'],
    reading: 'The most private house — bed comforts and conjugal happiness, what each partner silently sacrifices, expenses of married life, and connections to distant lands.',
  },
];

const D10_HOUSES: HouseTheme[] = [
  {
    theme: 'Professional Self',
    keywords: ['drive', 'work identity', 'initiative'],
    reading: 'This is the dasamsa lagna region — it describes your professional persona: the energy you bring to work, how colleagues first read you, and the instinctive style of your ambition.',
  },
  {
    theme: 'Earned Wealth',
    keywords: ['income', 'resources', 'value delivered'],
    reading: 'Governs what your career actually accumulates — salary and savings from work, the resources your profession commands, and how you speak for your value.',
  },
  {
    theme: 'Enterprise & Skill',
    keywords: ['courage', 'communication', 'self-promotion'],
    reading: 'The house of professional courage — pitches, negotiations, skills sharpened by practice, and the bold moves that separate the ambitious from the comfortable.',
  },
  {
    theme: 'Work Environment',
    keywords: ['workplace', 'stability', 'assets'],
    reading: 'Shows the conditions you work best in — office versus field, emotional satisfaction at work, and the fixed assets (property, vehicles) a career builds.',
  },
  {
    theme: 'Creative Authority',
    keywords: ['strategy', 'speculation', 'mentoring others'],
    reading: 'Governs intelligent risk in career — strategy, speculation, creative output, advisory positions, and the recognition that comes from original thinking.',
  },
  {
    theme: 'Service & Competition',
    keywords: ['daily grind', 'rivals', 'problem-solving'],
    reading: 'The battlefield house — competition, office politics, service rendered, debts and obligations, and the daily problems whose solving becomes your reputation.',
  },
  {
    theme: 'Partnerships & Clients',
    keywords: ['business partners', 'contracts', 'the public'],
    reading: 'Governs one-to-one professional bonds — business partners, key clients, contracts and deals, and how skilfully you handle the person across the table.',
  },
  {
    theme: 'Sudden Shifts & Research',
    keywords: ['transformation', 'others\' money', 'depth work'],
    reading: 'The house of professional metamorphosis — sudden career changes, handling other people\'s money, research and depth work, and rebirth after upheaval.',
  },
  {
    theme: 'Mentors & Fortune',
    keywords: ['luck', 'higher learning', 'guidance'],
    reading: 'Shows the grace in your career — mentors who open doors, advanced learning that lifts your trajectory, ethics in business, and long-distance opportunity.',
  },
  {
    theme: 'Karma & Status',
    keywords: ['achievement', 'authority', 'public standing'],
    reading: 'The summit of the dasamsa — your highest professional achievement, the authority you ultimately wield, and the mark your work leaves on the world.',
  },
  {
    theme: 'Income & Networks',
    keywords: ['gains', 'professional circle', 'ambitions'],
    reading: 'Governs the harvest — income streams, the professional network that multiplies your reach, and the steady fulfilment of long-held ambitions.',
  },
  {
    theme: 'Foreign & Behind-the-Scenes',
    keywords: ['overseas work', 'solitary work', 'expenses'],
    reading: 'The house of unseen work — foreign assignments, remote or behind-the-scenes roles, institutional work, costs of doing business, and eventual retreat from the stage.',
  },
];

const D9_PLANET_EFFECTS: Record<string, string> = {
  Sun: 'Brings dignity and authority into the relationship — a partner (or partnership dynamic) with strong self-respect. Ego must be consciously kept out of the bedroom and the kitchen.',
  Moon: 'Brings deep emotional currents — nurturing, moods, and a need to feel at home with the partner. The bond rises and falls with emotional honesty.',
  Mars: 'Brings passion and heat — physical chemistry, but also a quick fuse. Channelled well, it protects the marriage; unchannelled, it sparks recurring flare-ups.',
  Mercury: 'Brings playfulness and conversation — a youthful, communicative flavour. The relationship stays alive as long as the two of you keep genuinely talking.',
  Jupiter: 'Brings wisdom and blessing — growth, generosity, and dharmic protection to the union. One of the best influences a navamsa house can receive.',
  Venus: 'The karaka of marriage itself placed here — love, refinement, and sensual harmony concentrate in this area of the union. Its dignity matters more than any other.',
  Saturn: 'Brings duty and endurance — a mature, serious tone, sometimes delay or an age gap. What it slows down, it also makes nearly unbreakable.',
  Rahu: 'Brings intensity and unconventionality — fascination, foreign or unusual elements, and appetites that can tip into obsession. Needs conscious grounding.',
  Ketu: 'Brings detachment and a spiritual undertone — a feeling of past-life familiarity, but also absent-mindedness toward this area. Connection must be actively practised.',
};

const D10_PLANET_EFFECTS: Record<string, string> = {
  Sun: 'Brings leadership and visibility — authority roles, government or institutional favour, and a career that needs a stage. Recognition is the fuel.',
  Moon: 'Brings public connection — careers facing people: care, hospitality, brands, the public mood. Roles may fluctuate; adaptability is the strength.',
  Mars: 'Brings drive and technical edge — engineering, defence, surgery, sport, competition. Best where decisiveness under pressure is rewarded.',
  Mercury: 'Brings commerce and intellect — writing, analytics, trade, consulting. The career grows on the quality of communication and detail.',
  Jupiter: 'Brings counsel and expansion — teaching, law, finance, advisory. Seniority arrives naturally; wisdom becomes the product.',
  Venus: 'Brings aesthetics and diplomacy — arts, design, luxury, partnerships, negotiation. The career flourishes where taste and relationships matter.',
  Saturn: 'Brings the long climb — structure, persistence, mastery through repetition. Slow early years compound into late, durable authority.',
  Rahu: 'Brings unconventional ascent — technology, foreign companies, new industries, sudden elevations. High reward, but guard against shortcuts.',
  Ketu: 'Brings the specialist\'s path — research, esoteric or technical depth, behind-the-scenes mastery. Influence without the need for spotlight.',
};

const STRONG: DignityLevel[] = ['exalted', 'own-sign', 'friend-sign'];
const WEAK: DignityLevel[] = ['enemy-sign', 'debilitated'];

function dignityClause(planet: string, dignity: DignityLevel, variant: VargaVariant): string {
  const area = variant === 'D9' ? 'this side of the marriage' : 'this side of the career';
  if (dignity === 'exalted') return ` Exalted here, ${planet} delivers its very best — ${area} becomes a signature strength.`;
  if (STRONG.includes(dignity)) return ` Well-placed (${dignity.replace('-', ' ')}), it supports ${area} reliably.`;
  if (dignity === 'debilitated') return ` Debilitated here, its gifts arrive only after conscious remedial effort — be patient with ${area}.`;
  if (WEAK.includes(dignity)) return ` In an enemy sign, its results are mixed — ${area} asks for extra deliberate work.`;
  return '';
}

export interface VargaPlanetEffect {
  planet: string;
  effect: string;
  dignity: DignityLevel;
  isVargottama: boolean;
  isRetrograde: boolean;
}

export interface VargaHouseAnalysis {
  variant: VargaVariant;
  houseNumber: number; // 1–12 from the varga lagna
  rashiIndex: number;
  rashiName: string;
  rashiEnglish: string;
  rashiLord: string;
  lordHouse: number; // house (from varga lagna) where the lord of this sign sits; 0 if unknown
  theme: string;
  keywords: string[];
  reading: string;
  planetEffects: VargaPlanetEffect[];
  isLagna: boolean;
}

export function analyzeVargaHouse(
  variant: VargaVariant,
  rashiIndex: number,
  vargaAscendant: number,
  planets: VargaPlanet[],
): VargaHouseAnalysis {
  const houseNumber = ((rashiIndex - vargaAscendant + 12) % 12) + 1;
  const themes = variant === 'D9' ? D9_HOUSES : D10_HOUSES;
  const effects = variant === 'D9' ? D9_PLANET_EFFECTS : D10_PLANET_EFFECTS;
  const theme = themes[houseNumber - 1];

  const rashiOf = (p: VargaPlanet) => (variant === 'D9' ? p.d9Rashi : p.d10Rashi);
  const dignityOf = (p: VargaPlanet) => (variant === 'D9' ? p.d9Dignity : p.d10Dignity);

  const occupants = planets.filter(p => rashiOf(p) === rashiIndex);
  const planetEffects: VargaPlanetEffect[] = occupants.map(p => ({
    planet: p.planet,
    dignity: dignityOf(p),
    isVargottama: p.isVargottama,
    isRetrograde: p.isRetrograde,
    effect: (effects[p.planet] ?? '') + dignityClause(p.planet, dignityOf(p), variant),
  }));

  const lord = RASHI_LORDS[rashiIndex];
  const lordPos = planets.find(p => p.planet === lord);
  const lordHouse = lordPos ? ((rashiOf(lordPos) - vargaAscendant + 12) % 12) + 1 : 0;

  return {
    variant,
    houseNumber,
    rashiIndex,
    rashiName: RASHIS[rashiIndex],
    rashiEnglish: RASHI_ENGLISH[rashiIndex],
    rashiLord: lord,
    lordHouse,
    theme: theme.theme,
    keywords: theme.keywords,
    reading: theme.reading,
    planetEffects,
    isLagna: houseNumber === 1,
  };
}

// ─── Generic reading for the minor divisional charts (D2, D3, …, D60) ────────
// Rather than hand-authoring twelve house meanings for every extra varga, the
// reading is composed from the varga's life-area, the universal bhava theme of
// the clicked house, and the planets that occupy it (with their varga dignity).

import { HOUSE_DATA } from './planetaryAnalysis';
import type { VargaCode } from './vargas';

const ORD = ['', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];

const DIGNITY_TONE: Record<DignityLevel, string> = {
  'exalted': 'and does so with exceptional strength here',
  'own-sign': 'comfortably and reliably here',
  'friend-sign': 'with steady support here',
  'neutral-sign': 'with average results here',
  'enemy-sign': 'but is somewhat strained here',
  'debilitated': 'though it struggles and needs conscious effort here',
};

export interface ExtraVargaPlanetEffect {
  planet: string;
  dignity: DignityLevel;
  isRetrograde: boolean;
  effect: string;
}

export interface ExtraVargaHouseAnalysis {
  code: VargaCode;
  vargaName: string;
  significance: string;
  houseNumber: number;
  rashiIndex: number;
  rashiName: string;
  rashiEnglish: string;
  rashiLord: string;
  houseTheme: string;
  keywords: string[];
  reading: string;
  planetEffects: ExtraVargaPlanetEffect[];
  isLagna: boolean;
}

export function analyzeExtraVargaHouse(
  code: VargaCode,
  vargaName: string,
  significance: string,
  rashiIndex: number,
  vargaAscendant: number,
  planets: VargaPlanet[],
): ExtraVargaHouseAnalysis {
  const houseNumber = ((rashiIndex - vargaAscendant + 12) % 12) + 1;
  const bhava = HOUSE_DATA[houseNumber] ?? HOUSE_DATA[1];
  const area = significance.toLowerCase();

  const occupants = planets.filter(p => p.divisions[code].rashi === rashiIndex);
  const planetEffects: ExtraVargaPlanetEffect[] = occupants.map(p => {
    const dignity = p.divisions[code].dignity;
    return {
      planet: p.planet,
      dignity,
      isRetrograde: p.isRetrograde,
      effect: `${p.planet} acts on ${bhava.theme.toLowerCase()} within ${area} ${DIGNITY_TONE[dignity]}.`,
    };
  });

  const isLagna = houseNumber === 1;
  const reading = isLagna
    ? `This is the ${vargaName} lagna (${code}) — the lens through which ${area} is read. ${RASHIS[rashiIndex]} rising here sets the tone for how the whole ${area} chart expresses itself.`
    : `In the ${vargaName} chart (${code}), which examines ${area}, this is the ${ORD[houseNumber]} house in ${RASHIS[rashiIndex]}. ` +
      `It governs ${bhava.rules.slice(0, 4).join(', ')} — read specifically as it bears on ${area}.` +
      (occupants.length ? '' : ` No planet sits here, so its results flow through its sign lord ${RASHI_LORDS[rashiIndex]}.`);

  return {
    code, vargaName, significance,
    houseNumber, rashiIndex,
    rashiName: RASHIS[rashiIndex],
    rashiEnglish: RASHI_ENGLISH[rashiIndex],
    rashiLord: RASHI_LORDS[rashiIndex],
    houseTheme: bhava.theme,
    keywords: bhava.keywords,
    reading,
    planetEffects,
    isLagna,
  };
}
