/**
 * Reading an Ashtakoot result as something two people can actually use.
 *
 * The raw 36-point score is a classical instrument, but it is a poor answer to
 * the question people are really asking. "Varna 1/1, Vashya 0.5/2, Tara 1.5/3…"
 * tells you nothing about what living with this person would be like, and the
 * eight kootas do not map onto eight separate concerns — they cluster.
 *
 * This module does three things the score alone cannot:
 *
 *   1. Regroups the eight kootas into five dimensions a couple recognises —
 *      emotional rhythm, minds, physical chemistry, health and children, and
 *      day-to-day fit. The point totals are preserved exactly (13+8+4+8+3 = 36),
 *      so nothing is invented; only the framing changes.
 *   2. Reads each person's own marriage indications — the 7th house, its lord,
 *      Venus as the marriage significator, and the Navamsa. Ashtakoot ignores
 *      all of this, yet classically it outranks guna count.
 *   3. Turns frictions into something actionable: what it looks like day to
 *      day, and what actually helps.
 *
 * Tone matters here more than anywhere else in the app. This is honest, not
 * fatalistic and not falsely reassuring: a low score is reported plainly, with
 * what it does and does not mean.
 */

import { getDignity, RASHI_LORDS, type DignityLevel } from './planetaryAnalysis';
import { RASHIS, RASHI_ENGLISH } from './rashi';
import { analyseManglik, type KootaScore, type MatchInput, type MatchReport } from './matching';

// ─── Dimensions ────────────────────────────────────────────────────────────

export type DimensionKey = 'emotional' | 'mental' | 'physical' | 'vitality' | 'everyday';
export type DimensionBand = 'strong' | 'workable' | 'strained';

export interface MatchDimension {
  key: DimensionKey;
  /** Everyday label — no Sanskrit. */
  label: string;
  /** The question this dimension answers. */
  question: string;
  obtained: number;
  max: number;
  band: DimensionBand;
  /** What the chart says, in plain words. */
  summary: string;
  /** What that tends to look like in daily life. */
  inPractice: string;
  /** The classical kootas folded in here, for anyone who wants to check. */
  from: string[];
}

function bandFor(obtained: number, max: number): DimensionBand {
  const pct = obtained / max;
  if (pct >= 0.75) return 'strong';
  if (pct >= 0.45) return 'workable';
  return 'strained';
}

// Temperament types, described without the Sanskrit.
const GANA_PLAIN: Record<string, string> = {
  Deva: 'gentle, idealistic and inclined to give way',
  Manushya: 'practical and even-handed, with a mix of motives',
  Rakshasa: 'forceful and blunt, quick to act on your own judgement',
};

function ganaOf(reason: string, which: 'A' | 'B'): string {
  // The koota reason carries "Ganas: A=Deva, B=Manushya".
  const m = reason.match(/A=(\w+), B=(\w+)/);
  return m ? (which === 'A' ? m[1] : m[2]) : '';
}

function bhakootPattern(a: MatchInput, b: MatchInput): { name: string; meaning: string } | null {
  const d = (x: number, y: number) => ((y - x + 12) % 12) + 1;
  const dAB = d(a.moonRashi, b.moonRashi);
  const dBA = d(b.moonRashi, a.moonRashi);
  const is = (p: number, q: number) => (dAB === p && dBA === q) || (dAB === q && dBA === p);
  if (is(6, 8)) {
    return {
      name: '6–8',
      meaning:
        'the pattern classical texts warn about most. It points at money and health being the places ' +
        'strain shows up, rather than at the affection between you',
    };
  }
  if (is(2, 12)) {
    return {
      name: '2–12',
      meaning:
        'one of you tends to give more than you receive, and the imbalance shows up in money and energy ' +
        'rather than in feeling',
    };
  }
  if (is(5, 9)) {
    return {
      name: '5–9',
      meaning:
        'the mildest of the three. It touches children and creative plans; in every other respect this ' +
        'pattern is considered spiritually well matched',
    };
  }
  return null;
}

function emotionalDimension(k: Record<string, KootaScore>, a: MatchInput, b: MatchInput): MatchDimension {
  const bhakoot = k.Bhakoot;
  const gana = k.Gana;
  const obtained = bhakoot.obtained + gana.obtained;
  const pattern = bhakootPattern(a, b);

  const ga = ganaOf(gana.reason, 'A');
  const gb = ganaOf(gana.reason, 'B');
  const ganaLine =
    ga && gb
      ? ga === gb
        ? `Temperamentally you are alike: both ${GANA_PLAIN[ga]}.`
        : `You are ${GANA_PLAIN[ga]}; your partner is ${GANA_PLAIN[gb]}.`
      : '';

  const moonLine = pattern
    ? `Your Moon signs (${RASHI_ENGLISH[a.moonRashi]} and ${RASHI_ENGLISH[b.moonRashi]}) fall in the ${pattern.name} pattern — ${pattern.meaning}.`
    : `Your Moon signs (${RASHI_ENGLISH[a.moonRashi]} and ${RASHI_ENGLISH[b.moonRashi]}) sit at a distance the tradition reads as harmonious, so the emotional baseline between you is steady.`;

  const band = bandFor(obtained, 13);
  const inPractice =
    band === 'strong'
      ? 'Ordinary days should feel easy. You are likely to recover from arguments quickly and to want similar things from home life.'
      : band === 'workable'
        ? 'Most of the time this works. Expect a recurring flashpoint rather than constant friction — usually the same argument in different clothes.'
        : 'This is the dimension to take seriously. Moods are likely to collide rather than settle each other, and family occasions may amplify it rather than smooth it over.';

  return {
    key: 'emotional',
    label: 'Emotional rhythm & family life',
    question: 'Do your moods and your ideas of home fit together?',
    obtained,
    max: 13,
    band,
    summary: `${moonLine} ${ganaLine}`.trim(),
    inPractice,
    from: ['Bhakoot', 'Gana'],
  };
}

function mentalDimension(k: Record<string, KootaScore>): MatchDimension {
  const gm = k['Graha Maitri'];
  const tara = k.Tara;
  const obtained = gm.obtained + tara.obtained;
  const band = bandFor(obtained, 8);

  const lords = gm.reason.match(/A=(\w+), B=(\w+)/);
  const lordLine = lords
    ? `Your two Moon signs are ruled by ${lords[1]} and ${lords[2]}, and how those two planets get on is what governs whether your minds meet easily.`
    : 'The rulers of your Moon signs set how easily your minds meet.';

  const taraLine =
    tara.obtained === 3
      ? 'Counted from each other’s birth star, you each fall in a fortunate position for the other — the tradition reads this as bringing luck both ways.'
      : tara.obtained > 0
        ? 'Counted from each other’s birth star, one direction is fortunate and the other is not: one of you is likely to feel more supported by the pairing than the other does.'
        : 'Counted from each other’s birth star, neither direction is fortunate, which the tradition reads as timing repeatedly working against you rather than for you.';

  return {
    key: 'mental',
    label: 'Minds & conversation',
    question: 'Do you think alike, and do you bring each other luck?',
    obtained,
    max: 8,
    band,
    summary: `${lordLine} ${taraLine}`,
    inPractice:
      band === 'strong'
        ? 'Conversation should come easily and you are likely to reach decisions together without much negotiation.'
        : band === 'workable'
          ? 'You will understand each other with a little effort. Say things out loud rather than assuming they are obvious.'
          : 'Expect to be talking past each other more often than either of you intends. Neither of you is being difficult — you are simply reading the same situation differently.',
    from: ['Graha Maitri', 'Tara'],
  };
}

function physicalDimension(k: Record<string, KootaScore>): MatchDimension {
  const yoni = k.Yoni;
  const band = bandFor(yoni.obtained, 4);
  const animals = yoni.reason.match(/(\w+)[/ ](?:and )?(\w+) yoni/i);

  return {
    key: 'physical',
    label: 'Physical chemistry',
    question: 'Is there instinctive physical attraction between you?',
    obtained: yoni.obtained,
    max: 4,
    band,
    summary:
      band === 'strong'
        ? 'Your birth stars share the same animal symbol, which is the tradition’s strongest reading for physical and instinctive compatibility.'
        : band === 'workable'
          ? `Your birth stars carry different animal symbols${animals ? ` (${animals[1]} and ${animals[2]})` : ''} that neither clash nor especially match — physical compatibility is ordinary rather than remarkable.`
          : `Your birth stars carry animal symbols the tradition treats as naturally opposed${animals ? ` (${animals[1]} and ${animals[2]})` : ''}, which points at friction in intimacy.`,
    inPractice:
      band === 'strong'
        ? 'Attraction is unlikely to be the problem in this relationship.'
        : band === 'workable'
          ? 'Attraction will follow the state of the relationship rather than lead it — when other things are well, this is well.'
          : 'This tends to show up as mismatched appetite or timing rather than absence of attraction. It responds to being talked about directly, which is exactly what most couples avoid doing.',
    from: ['Yoni'],
  };
}

function vitalityDimension(k: Record<string, KootaScore>): MatchDimension {
  const nadi = k.Nadi;
  const band = bandFor(nadi.obtained, 8);
  const cancelled = /cancels/.test(nadi.reason);

  return {
    key: 'vitality',
    label: 'Health & children',
    question: 'Do your constitutions complement each other?',
    obtained: nadi.obtained,
    max: 8,
    band,
    summary:
      band === 'strong'
        ? cancelled
          ? 'You share the same constitutional type, but a classical exception applies here and cancels the concern.'
          : 'Your birth stars fall in different constitutional types, which the tradition reads as a healthy complement for vitality and for children.'
        : 'You share the same constitutional type, which is the single heaviest concern in classical matching — it carries eight of the thirty-six points on its own, and the texts read it as bearing on health and on children.',
    inPractice:
      band === 'strong'
        ? 'No particular caution flagged here.'
        : 'It is worth knowing that the modern equivalent of this caution is genetic compatibility, which is a medical question rather than an astrological one. Traditional practice offers remedies; a doctor offers testing. They are not in competition.',
    from: ['Nadi'],
  };
}

function everydayDimension(k: Record<string, KootaScore>): MatchDimension {
  const varna = k.Varna;
  const vashya = k.Vashya;
  const obtained = varna.obtained + vashya.obtained;
  const band = bandFor(obtained, 3);

  return {
    key: 'everyday',
    label: 'Day-to-day fit',
    question: 'Who leads, and does that sit comfortably?',
    obtained,
    max: 3,
    band,
    summary:
      band === 'strong'
        ? 'Your working styles and the natural balance of influence between you line up — neither of you has to fight for room.'
        : band === 'workable'
          ? 'The balance of influence between you is slightly uneven, but not in a way the tradition treats as serious.'
          : 'The tradition reads an imbalance in who naturally gives way to whom. This is the lightest-weighted part of the whole system — three points out of thirty-six — so it is worth noting rather than worrying about.',
    inPractice:
      band === 'strong'
        ? 'Practical decisions should not become power struggles.'
        : 'Watch for one of you routinely deferring on small decisions. It is harmless until it becomes the pattern for large ones.',
    from: ['Varna', 'Vashya'],
  };
}

export function buildDimensions(report: MatchReport, a: MatchInput, b: MatchInput): MatchDimension[] {
  const k: Record<string, KootaScore> = Object.fromEntries(report.kootas.map(x => [x.name, x]));
  return [
    emotionalDimension(k, a, b),
    mentalDimension(k),
    physicalDimension(k),
    vitalityDimension(k),
    everydayDimension(k),
  ];
}

// ─── Each person's own marriage indications ────────────────────────────────

const MALEFICS = ['Sun', 'Mars', 'Saturn', 'Rahu', 'Ketu'];
const BENEFICS = ['Jupiter', 'Venus', 'Moon', 'Mercury'];

export interface MarriageProspect {
  /** Sign on the 7th house — the house of marriage and partnership. */
  seventhRashi: number;
  seventhRashiName: string;
  seventhLord: string;
  /** House (1–12) the 7th lord occupies. */
  seventhLordHouse: number | null;
  beneficsInSeventh: string[];
  maleficsInSeventh: string[];
  /** Venus is the significator of marriage and of the spouse. */
  venusDignity: DignityLevel | null;
  venusHouse: number | null;
  /** The Navamsa ascendant — classically the foundation of the marriage chart. */
  d9Ascendant: number | null;
  d9AscendantLord: string | null;
  headline: string;
  notes: string[];
}

function ordinal(n: number): string {
  const v = n % 100;
  if (v >= 11 && v <= 13) return `${n}th`;
  switch (n % 10) {
    case 1: return `${n}st`;
    case 2: return `${n}nd`;
    case 3: return `${n}rd`;
    default: return `${n}th`;
  }
}

/** What the person's own chart says about marriage, before any partner is considered. */
export function marriageProspect(m: MatchInput): MarriageProspect | null {
  const asc = m.ascendantRashi;
  const rashis = m.planetRashis;
  if (asc == null || !rashis) return null;

  const houseOf = (r: number) => ((r - asc + 12) % 12) + 1;
  const seventhRashi = (asc + 6) % 12;
  const seventhLord = RASHI_LORDS[seventhRashi];
  const lordRashi = rashis[seventhLord];
  const seventhLordHouse = lordRashi != null ? houseOf(lordRashi) : null;

  const occupants = Object.entries(rashis)
    .filter(([, r]) => r === seventhRashi)
    .map(([p]) => p);
  const beneficsInSeventh = occupants.filter(p => BENEFICS.includes(p));
  const maleficsInSeventh = occupants.filter(p => MALEFICS.includes(p));

  const venusRashi = rashis.Venus;
  const venusDignity = venusRashi != null ? getDignity('Venus', venusRashi) : null;
  const venusHouse = venusRashi != null ? houseOf(venusRashi) : null;

  const d9Ascendant = m.d9Ascendant ?? null;
  const d9AscendantLord = d9Ascendant != null ? RASHI_LORDS[d9Ascendant] : null;

  const notes: string[] = [];

  notes.push(
    `Your house of marriage carries ${RASHI_ENGLISH[seventhRashi]} (${RASHIS[seventhRashi]}), ruled by ${seventhLord}` +
    (seventhLordHouse
      ? `, and ${seventhLord} sits in your ${ordinal(seventhLordHouse)} house — that is where your partnership life is most active.`
      : '.'),
  );

  if (beneficsInSeventh.length) {
    notes.push(
      `${beneficsInSeventh.join(' and ')} ${beneficsInSeventh.length > 1 ? 'occupy' : 'occupies'} your house of marriage. ` +
      'The tradition reads a natural benefic there as protective — the relationship tends to be looked after.',
    );
  }
  if (maleficsInSeventh.length) {
    notes.push(
      `${maleficsInSeventh.join(' and ')} ${maleficsInSeventh.length > 1 ? 'occupy' : 'occupies'} your house of marriage. ` +
      'That does not predict failure; it points at a partnership that asks more of you, and often at a partner with a strong will of their own.',
    );
  }
  if (!occupants.length) {
    notes.push(
      `No planet sits in your house of marriage, which is the ordinary case. Your partnership life is read through ${seventhLord} instead` +
      (seventhLordHouse ? `, in your ${ordinal(seventhLordHouse)} house.` : '.'),
    );
  }

  if (venusDignity && venusHouse) {
    const venusLine: Record<DignityLevel, string> = {
      'exalted': 'Venus, the significator of marriage, is at full strength in your chart — a strong indication for partnership generally.',
      'own-sign': 'Venus, the significator of marriage, is on home ground in your chart, which supports partnership steadily.',
      'friend-sign': 'Venus, the significator of marriage, is well supported in your chart.',
      'neutral-sign': 'Venus, the significator of marriage, is neither helped nor hindered in your chart.',
      'enemy-sign': 'Venus, the significator of marriage, is under some strain in your chart — affection needs tending rather than assuming.',
      'debilitated': 'Venus, the significator of marriage, is weakened in your chart. This is worth knowing rather than fearing: it tends to mean you undervalue what you have, more than that you lack it.',
    };
    notes.push(`${venusLine[venusDignity]} It sits in your ${ordinal(venusHouse)} house.`);
  }

  if (d9Ascendant != null) {
    notes.push(
      `Your Navamsa — the divisional chart that classically governs marriage — rises in ${RASHI_ENGLISH[d9Ascendant]}, ruled by ${d9AscendantLord}. ` +
      'This is the lens the tradition reads a marriage through once the surface promises of the main chart are set aside.',
    );
  }

  const supportive = beneficsInSeventh.length + (venusDignity === 'exalted' || venusDignity === 'own-sign' ? 1 : 0);
  const testing = maleficsInSeventh.length + (venusDignity === 'debilitated' ? 1 : 0);
  const headline =
    supportive > testing
      ? 'Your own chart supports partnership'
      : testing > supportive
        ? 'Your own chart asks more of partnership'
        : 'Your own chart is balanced on partnership';

  return {
    seventhRashi,
    seventhRashiName: RASHIS[seventhRashi],
    seventhLord,
    seventhLordHouse,
    beneficsInSeventh,
    maleficsInSeventh,
    venusDignity,
    venusHouse,
    d9Ascendant,
    d9AscendantLord,
    headline,
    notes,
  };
}

// ─── Navamsa cross-check ───────────────────────────────────────────────────

export interface NavamsaHarmony {
  aLagna: number;
  bLagna: number;
  aLord: string;
  bLord: string;
  relation: 'same' | 'friend' | 'neutral' | 'enemy';
  summary: string;
}

const PLANET_FRIENDS: Record<string, string[]> = {
  Sun: ['Moon', 'Mars', 'Jupiter'], Moon: ['Sun', 'Mercury'],
  Mars: ['Sun', 'Moon', 'Jupiter'], Mercury: ['Sun', 'Venus'],
  Jupiter: ['Sun', 'Moon', 'Mars'], Venus: ['Mercury', 'Saturn'],
  Saturn: ['Mercury', 'Venus'],
};
const PLANET_ENEMIES: Record<string, string[]> = {
  Sun: ['Venus', 'Saturn'], Moon: [],
  Mars: ['Mercury'], Mercury: ['Moon'],
  Jupiter: ['Mercury', 'Venus'], Venus: ['Sun', 'Moon'],
  Saturn: ['Sun', 'Moon', 'Mars'],
};

/**
 * The Navamsa is the chart classical astrology actually reads a marriage
 * through. Ashtakoot never looks at it, so a pairing can score well on gunas
 * and still be poorly matched at the level that matters most.
 */
export function navamsaHarmony(a: MatchInput, b: MatchInput): NavamsaHarmony | null {
  if (a.d9Ascendant == null || b.d9Ascendant == null) return null;
  const aLord = RASHI_LORDS[a.d9Ascendant];
  const bLord = RASHI_LORDS[b.d9Ascendant];

  let relation: NavamsaHarmony['relation'] = 'neutral';
  if (aLord === bLord) relation = 'same';
  else if ((PLANET_FRIENDS[aLord] ?? []).includes(bLord) && (PLANET_FRIENDS[bLord] ?? []).includes(aLord)) relation = 'friend';
  else if ((PLANET_ENEMIES[aLord] ?? []).includes(bLord) || (PLANET_ENEMIES[bLord] ?? []).includes(aLord)) relation = 'enemy';

  const summary =
    relation === 'same'
      ? `Both your Navamsa charts are ruled by ${aLord}. At the level the tradition reads marriage through, you are working from the same foundation.`
      : relation === 'friend'
        ? `Your Navamsa charts are ruled by ${aLord} and ${bLord}, which are natural friends — the marriage chart itself is well matched, independently of the guna score.`
        : relation === 'enemy'
          ? `Your Navamsa charts are ruled by ${aLord} and ${bLord}, which are natural opponents. This is the layer classical astrology weights above guna count, so it deserves more attention than the headline number.`
          : `Your Navamsa charts are ruled by ${aLord} and ${bLord}, which are neutral to each other — the marriage chart neither helps nor hinders.`;

  return { aLagna: a.d9Ascendant, bLagna: b.d9Ascendant, aLord, bLord, relation, summary };
}

// ─── Synthesis ─────────────────────────────────────────────────────────────

export interface Friction {
  area: string;
  whatItLooksLike: string;
  whatHelps: string;
}

export interface Strength {
  label: string;
  text: string;
}

export interface MatchGuidance {
  /** An honest paragraph on what this score does and does not mean. */
  framing: string;
  /** What genuinely works, as consequences rather than scores. */
  strengths: Strength[];
  /** Frictions, each with a concrete picture and a concrete response. */
  frictions: Friction[];
}

export interface MatchInsights {
  dimensions: MatchDimension[];
  guidance: MatchGuidance;
  navamsa: NavamsaHarmony | null;
  personProspect: MarriageProspect | null;
  partnerProspect: MarriageProspect | null;
}

function framingFor(report: MatchReport): string {
  const score = `${report.totalObtained} of 36`;
  switch (report.verdict) {
    case 'excellent':
    case 'very good':
      return `${score}. On the classical count this is a strong match, and the areas below say where that strength actually sits. A high guna score is a good starting position, not a guarantee — it describes compatibility of temperament, not the effort either of you will put in.`;
    case 'good':
      return `${score}. This clears the threshold the tradition treats as a sound match. Most established marriages sit in this range rather than at the top of it.`;
    case 'acceptable':
      return `${score}. This is a workable match with identifiable weak points rather than a poor one. The dimensions below show which parts carry the shortfall, and those are the parts worth being deliberate about.`;
    case 'not recommended':
      return `${score}. Classical matching does not endorse this pairing, and it is more honest to say so plainly than to soften it. What that means in practice: the tradition is flagging specific, named difficulties — not predicting unhappiness. Many couples with low guna scores build good marriages, usually by knowing where the friction lies and dealing with it directly rather than being surprised by it. Read the frictions below as a list of things to discuss, not a verdict on the two of you.`;
  }
}

export function buildGuidance(
  report: MatchReport,
  dimensions: MatchDimension[],
  a: MatchInput,
  b: MatchInput,
  navamsa: NavamsaHarmony | null,
): MatchGuidance {
  const strengths: Strength[] = [];
  const frictions: Friction[] = [];

  // Strengths — the consequence, not the score.
  for (const d of dimensions) {
    if (d.band === 'strong') strengths.push({ label: d.label, text: d.inPractice });
  }
  if (navamsa && (navamsa.relation === 'same' || navamsa.relation === 'friend')) {
    strengths.push({ label: 'The marriage chart itself', text: navamsa.summary });
  }
  const manglik = report.doshas.find(d => d.name.startsWith('Mangal'));
  if (manglik && !manglik.present) {
    strengths.push({
      label: 'No Mangal Dosha',
      text: 'The Mars affliction that classical matching treats as a deal-breaker is absent from both charts.',
    });
  } else if (manglik?.mitigated) {
    strengths.push({ label: 'Mangal Dosha resolved', text: manglik.description });
  }

  // Frictions — concrete picture, concrete response.
  //
  // Two quite different things can drag this dimension down, and they need
  // different advice: a Bhakoot mismatch is about money, health and giving,
  // whereas a Gana mismatch is about temperament. Giving money advice for a
  // temperament clash would be worse than saying nothing.
  const emotional = dimensions.find(d => d.key === 'emotional')!;
  const kootas: Record<string, KootaScore> = Object.fromEntries(report.kootas.map(x => [x.name, x]));
  if (emotional.band !== 'strong') {
    const pattern = kootas.Bhakoot.passed ? null : bhakootPattern(a, b);
    if (pattern) {
      frictions.push({
        area: emotional.label,
        whatItLooksLike:
          pattern.name === '6–8'
            ? 'Money and health are where this surfaces — an illness, a debt, or one person quietly carrying a burden the other does not see.'
            : pattern.name === '2–12'
              ? 'One of you steadily gives more — time, money, or emotional labour — and it goes unremarked until it becomes resentment.'
              : 'Disagreement about children, or about a creative or financial risk one of you wants to take.',
        whatHelps:
          pattern.name === '5–9'
            ? 'Decide the question of children explicitly rather than assuming you already agree. On everything else this pattern is considered well matched.'
            : 'Keep money and health visible to each other rather than managed separately. Most of the damage in this pattern comes from one person not knowing, not from the thing itself.',
      });
    } else {
      // Bhakoot is fine, so the shortfall is temperament.
      const ga = ganaOf(kootas.Gana.reason, 'A');
      const gb = ganaOf(kootas.Gana.reason, 'B');
      const opposed = (ga === 'Deva' && gb === 'Rakshasa') || (ga === 'Rakshasa' && gb === 'Deva');
      frictions.push({
        area: emotional.label,
        whatItLooksLike: opposed
          ? 'One of you moves gently and gives way; the other moves fast and says the blunt thing. In an argument the first goes quiet and the second presses — and both read the other as being unreasonable.'
          : 'A recurring mismatch of pace: one of you wants to settle a disagreement now, the other wants to leave it alone until it cools.',
        whatHelps: opposed
          ? 'Agree in advance that going quiet is not agreement and that bluntness is not contempt. Naming the pattern while calm takes most of the force out of it.'
          : 'Give the slower one a stated deadline rather than an open one — "let’s talk about it tomorrow" rather than "later".',
      });
    }
  }

  const vitality = dimensions.find(d => d.key === 'vitality')!;
  if (vitality.band === 'strained') {
    frictions.push({
      area: vitality.label,
      whatItLooksLike:
        'The classical concern is health and children. It is the heaviest single item in the system, so it drags the total score down sharply on its own.',
      whatHelps:
        'Traditional practice has remedies for this. The modern counterpart is straightforward: if children are part of the plan, ordinary pre-conception genetic screening addresses the substance of what the tradition was pointing at.',
    });
  }

  const mental = dimensions.find(d => d.key === 'mental')!;
  if (mental.band === 'strained') {
    frictions.push({
      area: mental.label,
      whatItLooksLike:
        'Repeatedly discovering you meant different things by the same conversation. Plans agreed in good faith come apart on the detail.',
      whatHelps:
        'Confirm decisions in writing between you — dates, amounts, who is doing what. It sounds unromantic and it removes most of this friction.',
    });
  }

  const physical = dimensions.find(d => d.key === 'physical')!;
  if (physical.band === 'strained') {
    frictions.push({
      area: physical.label,
      whatItLooksLike: physical.inPractice,
      whatHelps: 'This is one of the few areas where the classical reading and ordinary relationship advice agree completely: it improves by being spoken about, and worsens by being left alone.',
    });
  }

  if (manglik?.present && !manglik.mitigated) {
    frictions.push({
      area: 'Mangal (Manglik) Dosha',
      whatItLooksLike:
        'One chart carries the Mars affliction and the other does not. The tradition reads this as an imbalance of drive and temper between the two of you rather than as a curse.',
      whatHelps:
        'The classical counsel is Mars remedies and not marrying young. The practical translation is that this pairing does better with a longer runway — time to see each other under pressure before committing.',
    });
  }

  if (navamsa?.relation === 'enemy') {
    frictions.push({
      area: 'The marriage chart itself',
      whatItLooksLike:
        'The Navamsa is the chart classical astrology reads a marriage through, and yours are ruled by planets at odds. This can sit underneath an otherwise decent guna score.',
      whatHelps:
        'Nothing mechanical fixes this one. It is a reason to weigh the lived evidence — how you actually handle a bad week together — above the headline number.',
    });
  }

  if (!strengths.length) {
    strengths.push({
      label: 'Nothing scores strongly on the classical count',
      text: 'That is worth stating plainly rather than padding the list — but it describes eight traditional measures taken from birth data, not the two of you.',
    });
  }

  return { framing: framingFor(report), strengths, frictions };
}

export function buildMatchInsights(report: MatchReport, a: MatchInput, b: MatchInput): MatchInsights {
  const dimensions = buildDimensions(report, a, b);
  const navamsa = navamsaHarmony(a, b);
  return {
    dimensions,
    navamsa,
    guidance: buildGuidance(report, dimensions, a, b, navamsa),
    personProspect: marriageProspect(a),
    partnerProspect: marriageProspect(b),
  };
}

/** Re-exported so callers can grade a single chart's Mars affliction. */
export { analyseManglik };
