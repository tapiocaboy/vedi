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

import { RASHI_LORDS } from './planetaryAnalysis';
import { RASHI_ENGLISH } from './rashi';
import { analyseManglik, type KootaScore, type MatchInput, type GunaMilanDetail } from './matching';
import type { LayeredMatchReport } from './matchReport';

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

/** Structured koota inputs. Never parse `reason` — see KootaScore.detail. */
function str(k: KootaScore | undefined, field: string): string {
  const v = k?.detail?.[field];
  return typeof v === 'string' ? v : '';
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

  const ga = str(gana, 'boyGana');
  const gb = str(gana, 'girlGana');
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

  const boyLord = str(gm, 'boyLord'), girlLord = str(gm, 'girlLord');
  const lordLine = boyLord && girlLord
    ? `Your two Moon signs are ruled by ${boyLord} and ${girlLord}, and how those two planets get on is what governs whether your minds meet easily.`
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
  const animals = [str(yoni, 'boyAnimal'), str(yoni, 'girlAnimal')];

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
          ? `Your birth stars carry different animal symbols${animals[0] ? ` (${animals[0]} and ${animals[1]})` : ''} that neither clash nor especially match — physical compatibility is ordinary rather than remarkable.`
          : `Your birth stars carry animal symbols the tradition treats as naturally opposed${animals[0] ? ` (${animals[0]} and ${animals[1]})` : ''}, which points at friction in intimacy.`,
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
  const cancelled = nadi.detail?.cancelled === true;

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

export function buildDimensions(layer1: GunaMilanDetail, a: MatchInput, b: MatchInput): MatchDimension[] {
  const k: Record<string, KootaScore> = Object.fromEntries(layer1.kootas.map((x: KootaScore) => [x.name, x]));
  return [
    emotionalDimension(k, a, b),
    mentalDimension(k),
    physicalDimension(k),
    vitalityDimension(k),
    everydayDimension(k),
  ];
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
  /** What Layer 1 does and does not measure, stated before anything else. */
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
}

/**
 * The framing paragraph.
 *
 * It leads on what the koota total is *for*, because the number is the thing
 * users over-read. Guna Milan is a gate over one variable — the Moon — and
 * saying so up front is the difference between a reader treating 29.5/36 as a
 * grade and treating it as a filter that has been passed.
 */
function framingFor(report: LayeredMatchReport): string {
  const l1 = report.layer1Temperament;
  const count = `${l1.total} of 36`;
  const gate = l1.gate === 'GATE_PASS'
    ? `${count}, which clears the classical gate of 18.`
    : `${count}, which falls below the classical gate of 18.`;

  const scope =
    'That number measures one thing: whether two temperaments run on a compatible rhythm. It is computed ' +
    'entirely from the position of the two Moons, so it says nothing about either chart’s own promise for ' +
    'marriage, nothing about afflictions, and nothing about what happens when the two charts are overlaid. ' +
    'Those are the three layers below, and classically they carry more weight than this count does.';

  const conflictNote = report.conflicts.length
    ? ' The layers do not all agree here — see the conflicts, which are the most useful part of this reading.'
    : ' The layers broadly agree with each other here.';

  return `${gate} ${scope}${conflictNote}`;
}

export function buildGuidance(
  report: LayeredMatchReport,
  dimensions: MatchDimension[],
  navamsa: NavamsaHarmony | null,
): MatchGuidance {
  const strengths: Strength[] = [];
  const frictions: Friction[] = [];
  const kootas: Record<string, KootaScore> = Object.fromEntries(
    report.layer1Temperament.kootas.map((x: KootaScore) => [x.name, x]));

  for (const d of dimensions) {
    if (d.band === 'strong') strengths.push({ label: d.label, text: d.inPractice });
  }
  if (navamsa && (navamsa.relation === 'same' || navamsa.relation === 'friend')) {
    strengths.push({ label: 'The marriage chart itself', text: navamsa.summary });
  }

  // Layer 2 — Kuja dosha, read from the per-chart analysis rather than a pair score.
  const { a: doshaA, b: doshaB, mutualKuja, netA, netB } = report.layer2Doshas;
  if (!doshaA.manglik.isManglik && !doshaB.manglik.isManglik) {
    strengths.push({
      label: 'No Kuja dosha',
      text: 'The Mars affliction classical matching treats as decisive is absent from both charts.',
    });
  } else if (mutualKuja.applies) {
    strengths.push({ label: 'Kuja dosha mutually cancelled', text: mutualKuja.description });
  }

  // Layer 3 — each chart's own promise, which Ashtakoot cannot see at all.
  for (const [label, promise] of [['First chart', report.layer3Promise.a], ['Second chart', report.layer3Promise.b]] as const) {
    if (!promise) continue;
    const supportive = promise.dimensions.filter(d => d.band === 'supportive');
    const testing = promise.dimensions.filter(d => d.band === 'testing');
    if (supportive.length > testing.length) {
      strengths.push({ label: `${label}: own marriage promise`, text: promise.synthesis });
    } else if (testing.length > supportive.length) {
      frictions.push({
        area: `${label}: own marriage promise`,
        whatItLooksLike:
          `${testing.map(d => d.label).join(', ')} read as testing in this chart, independently of the pairing. ` +
          (promise.seventhLordCombust ? 'The 7th lord is combust, which guna matching cannot see. ' : '') +
          promise.synthesis,
        whatHelps:
          'This is a property of the chart, not of the match — it would show up against any partner. ' +
          'Treat it as something to be aware of in this person rather than as a reason about the two of you.',
      });
    }
  }

  // Emotional dimension — Bhakoot and Gana pull it down for different reasons and
  // need different advice, so the cause decides the counsel.
  const emotional = dimensions.find(d => d.key === 'emotional')!;
  if (emotional.band !== 'strong') {
    const axis = String(kootas.Bhakoot?.detail?.axis ?? '');
    const bhakootStands = kootas.Bhakoot?.obtained === 0;
    if (bhakootStands) {
      frictions.push({
        area: emotional.label,
        whatItLooksLike:
          axis === '6/8'
            ? 'Money and health are where this surfaces — an illness, a debt, or one person quietly carrying a burden the other does not see.'
            : axis === '2/12'
              ? 'One of you steadily gives more — time, money, or emotional labour — and it goes unremarked until it becomes resentment.'
              : 'Disagreement about children, or about a creative or financial risk one of you wants to take.',
        whatHelps:
          axis === '5/9'
            ? 'Decide the question of children explicitly rather than assuming you already agree. On everything else this axis is considered well matched.'
            : 'Keep money and health visible to each other rather than managed separately. Most of the damage in this pattern comes from one person not knowing.',
      });
    } else {
      const ga = str(kootas.Gana, 'boyGana');
      const gb = str(kootas.Gana, 'girlGana');
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
        'The classical concern is health and children. It is the heaviest single koota, 8 of 36 points on its own.',
      whatHelps:
        'Traditional practice has remedies for this. The modern counterpart is straightforward: if children are part of ' +
        'the plan, ordinary pre-conception genetic screening addresses the substance of what the tradition was pointing at.',
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
      whatHelps:
        'This is one of the few areas where the classical reading and ordinary relationship advice agree completely: ' +
        'it improves by being spoken about, and worsens by being left alone.',
    });
  }

  // Layer 2 frictions — only where the dosha is genuinely active after cancellation.
  for (const [label, net, chart] of [['First chart', netA, doshaA], ['Second chart', netB, doshaB]] as const) {
    if (net !== 'active') continue;
    const active = chart.doshas.filter(d => d.severity === 'active');
    frictions.push({
      area: `${label}: ${active.map(d => d.name).join(', ')}`,
      whatItLooksLike: active.map(d => d.description).join(' '),
      whatHelps:
        'The classical counsel for an active Mars affliction is Mars remedies and not marrying young. The practical ' +
        'translation is a longer runway — time to see each other under pressure before committing.',
    });
  }

  // Layer 4 — the overlay. This is the layer with the highest diagnostic value,
  // so an adverse defining contact gets named rather than averaged away.
  const { defining, asymmetric, aToB, bToA } = report.layer4Synastry;
  const adverseDefining = defining.filter(c => c.valence === 'adverse');
  if (adverseDefining.length) {
    frictions.push({
      area: 'The chart overlay (synastry)',
      whatItLooksLike: adverseDefining.map(c => c.interpretation).join(' '),
      whatHelps:
        'Contacts like these describe a structural pull rather than a behaviour, so there is nothing to fix directly. ' +
        'What helps is recognising the pattern when it recurs instead of treating each instance as a fresh argument.',
    });
  } else if (defining.length) {
    strengths.push({
      label: 'The chart overlay (synastry)',
      text: defining.map(c => c.interpretation).join(' '),
    });
  }
  if (asymmetric) {
    frictions.push({
      area: 'Non-mutual overlay',
      whatItLooksLike:
        `One direction of the overlay reads ${aToB.netValence.toFixed(2)} and the other ${bToA.netValence.toFixed(2)}. ` +
        'In practice that is one partner feeling more met by the relationship than the other does, without either of them doing anything wrong.',
      whatHelps:
        'Ask the question directly rather than inferring it: whether each of you feels the relationship gives back what you put in. ' +
        'An asymmetry that is named is manageable; one that is not tends to surface as unexplained resentment.',
    });
  }

  if (!strengths.length) {
    strengths.push({
      label: 'Nothing scores strongly across the four layers',
      text: 'That is worth stating plainly rather than padding the list — but it describes four classical instruments applied to birth data, not the two of you.',
    });
  }

  return { framing: framingFor(report), strengths, frictions };
}

export function buildMatchInsights(
  report: LayeredMatchReport,
  a: MatchInput,
  b: MatchInput,
): MatchInsights {
  const dimensions = buildDimensions(report.layer1Temperament, a, b);
  const navamsa = navamsaHarmony(a, b);
  return {
    dimensions,
    navamsa,
    guidance: buildGuidance(report, dimensions, navamsa),
  };
}

/** Re-exported so callers can grade a single chart's Mars affliction. */
export { analyseManglik };
