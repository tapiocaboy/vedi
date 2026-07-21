/**
 * Plain-language meanings for the divisional charts.
 *
 * The generic reading ("Mars acts on career & status within siblings, courage
 * and co-borns") is technically derived but useless to a reader who does not
 * already know the system. A house means something *different* inside each
 * varga: the 5th of the Saptamsa is your children, the 5th of the Chaturvimsamsa
 * is how you learn, the 5th of the Trimsamsa is where you are reckless. This
 * module states that difference in ordinary words.
 *
 * Every string here is written to be understood with no prior knowledge of
 * Vedic astrology.
 */

import type { DignityLevel } from './planetaryAnalysis';
import type { VargaCode } from './vargas';

export interface VargaPlainMeaning {
  /** Everyday name for the chart. */
  plainName: string;
  /** The single question this chart answers. */
  question: string;
  /** What the chart is, in one sentence, for someone new to this. */
  intro: string;
  /** What the rising sign of this chart sets up. */
  lagnaMeaning: string;
  /** Plain meaning of each of the twelve houses, inside this chart's domain. */
  houses: Record<number, string>;
  /**
   * Headline for each verdict band, written per chart. Generic phrasing breaks
   * down here: "Weak spots is a well-supported area for you" is both
   * ungrammatical and backwards — in the adversity chart, strength means less
   * trouble, not more.
   */
  verdicts: { strong: string; workable: string; needsEffort: string };
  /**
   * The noun to use inside sentences like "supports ___" and "progress in ___".
   * Usually the plain name, but the adversity chart needs inverting: planets
   * there support your *resilience*, not your weak spots.
   */
  reasonArea: string;
}

// Only the extra vargas need this; D9 and D10 already have bespoke readings.
export const VARGA_PLAIN: Partial<Record<VargaCode, VargaPlainMeaning>> = {
  D2: {
    plainName: 'Money chart',
    question: 'How does money actually behave in your life?',
    intro: 'Splits every sign in two to look purely at earning, holding and losing money — separate from career.',
    lagnaMeaning: 'Sets your basic relationship with money: whether you are a natural earner, saver, spender or provider.',
    houses: {
      1: 'Your instinct with money — how you personally handle it before anyone advises you.',
      2: 'What you actually accumulate and keep. Savings, valuables, the balance that survives the month.',
      3: 'Money you make through your own effort and hustle — side work, small deals, initiative.',
      4: 'Money tied up in home, land and vehicles. The comfort your income buys.',
      5: 'Speculative money — investments, markets, bets, and windfalls from creative work.',
      6: 'Debt, loans and money lost to disputes or bills. Also money earned by grinding service work.',
      7: 'Money that comes through partners, spouses and joint ventures.',
      8: 'Money you do not control: inheritance, insurance, tax, other people\'s funds, sudden loss or gain.',
      9: 'Lucky money — fortune, support from elders, gains from travel or teaching.',
      10: 'Money that arrives because of your reputation and position.',
      11: 'Income and profit. The clearest indicator of what actually lands in your hands.',
      12: 'Where money leaks — expenses, foreign spending, and what you give away.',
    },
    verdicts: {
      strong: 'Money tends to work in your favour',
      workable: 'Money is workable, with some friction',
      needsEffort: 'Money is an area that asks for effort',
    },
    reasonArea: 'your money life',
  },
  D3: {
    plainName: 'Siblings & courage chart',
    question: 'How much drive do you have, and how do your siblings and peers figure in your life?',
    intro: 'Splits every sign in three to examine nerve, initiative, and your relationships with brothers, sisters and close peers.',
    lagnaMeaning: 'Sets your baseline nerve — how readily you start things, push back, and back yourself.',
    houses: {
      1: 'Your own courage and self-starting energy.',
      2: 'How you speak up for yourself, and the resources your siblings bring.',
      3: 'Younger siblings, and your raw appetite for effort and risk.',
      4: 'Whether home life supports or dampens your drive.',
      5: 'Creative nerve — the confidence to make something and show it.',
      6: 'Rivalry and conflict, including friction with siblings.',
      7: 'How your drive plays out with partners — collaborative or competitive.',
      8: 'Where your courage gets tested by crisis, and hidden strain with siblings.',
      9: 'Elder siblings, mentors, and courage that comes from belief.',
      10: 'How your initiative shows up in work and public life.',
      11: 'What your effort gains you, and the peer network you build.',
      12: 'Where drive drains away — burnout, isolation, or distance from siblings.',
    },
    verdicts: {
      strong: 'You have solid drive, and good backing from those around you',
      workable: 'Your drive is workable, with some friction',
      needsEffort: 'Drive and sibling support ask for effort',
    },
    reasonArea: 'your drive and sibling ties',
  },
  D4: {
    plainName: 'Home & property chart',
    question: 'What kind of home, land and inner security do you build?',
    intro: 'Splits every sign in four to look at property, roots, and the settled contentment a home provides.',
    lagnaMeaning: 'Sets how naturally you find a place that feels like yours.',
    houses: {
      1: 'Your sense of being settled — whether you feel rooted or perpetually temporary.',
      2: 'Property held as an asset, and what the home contributes to your finances.',
      3: 'Moving house, short relocations, and property dealings that take effort.',
      4: 'The main indicator: your actual home, land, and peace of mind within it.',
      5: 'Property that grows in value, and the joy your home brings.',
      6: 'Property disputes, mortgages, repairs and the burdens of ownership.',
      7: 'Property held jointly, and how a partner shapes where you live.',
      8: 'Inherited property, and sudden upheavals to where you live.',
      9: 'Fortunate property, ancestral land, and homes far from where you started.',
      10: 'Property connected to your work, and the status your address confers.',
      11: 'Gains from property — rent, sale, appreciation.',
      12: 'Property abroad, homes let go, and what maintaining a home costs you.',
    },
    verdicts: {
      strong: 'Home and property tend to work in your favour',
      workable: 'Home and property are workable, with some friction',
      needsEffort: 'Home and property ask for effort',
    },
    reasonArea: 'home and property',
  },
  D7: {
    plainName: 'Children chart',
    question: 'What is your relationship with children and with what you create?',
    intro: 'Splits every sign in seven to examine children, fertility, and the things you bring into being and nurture.',
    lagnaMeaning: 'Sets how central children and creative output are to your life.',
    houses: {
      1: 'Your own capacity and appetite for raising or creating something.',
      2: 'What children add to family life and resources.',
      3: 'The effort of raising children, and relations between them.',
      4: 'The emotional home you give a child, and your own mothering instinct.',
      5: 'The main indicator: children themselves, conception, and creative output.',
      6: 'Difficulties around children — health worries, strain, delayed conception.',
      7: 'How a partner figures in having and raising children.',
      8: 'Hidden or difficult chapters around children; interruptions and losses.',
      9: 'The values you pass down, and a child\'s good fortune.',
      10: 'A child\'s standing in the world, and children\'s effect on your work.',
      11: 'Fulfilment through children, and what they eventually bring you.',
      12: 'Distance from children, children abroad, and what raising them costs.',
    },
    verdicts: {
      strong: 'Children and creative output are well supported',
      workable: 'Children and creative output are workable, with some friction',
      needsEffort: 'Children and creative output ask for effort',
    },
    reasonArea: 'children and what you create',
  },
  D12: {
    plainName: 'Parents & ancestry chart',
    question: 'What did you inherit from your parents and the generations behind them?',
    intro: 'Splits every sign in twelve to examine parents, family lineage, and the patterns handed down to you.',
    lagnaMeaning: 'Sets how strongly your family of origin shapes who you became.',
    houses: {
      1: 'How much you carry your parents in your own character.',
      2: 'Family wealth, values and what was materially handed down.',
      3: 'The family\'s appetite for effort, and your parents\' siblings.',
      4: 'Your mother, and the emotional climate of your childhood home.',
      5: 'Inherited talent and intelligence; what runs in the family.',
      6: 'Family friction, inherited health patterns and old obligations.',
      7: 'How your parents\' relationship shaped what you expect from partnership.',
      8: 'Hidden family history, secrets, and inheritance matters.',
      9: 'Your father, the family\'s beliefs, and ancestral fortune.',
      10: 'The family name, and how your parents\' standing affects yours.',
      11: 'What the family network gains you.',
      12: 'Family distance, migration, and what you have let go of from your lineage.',
    },
    verdicts: {
      strong: 'Your family inheritance is a source of strength',
      workable: 'Your family inheritance is mixed',
      needsEffort: 'Your family inheritance carries some weight to work through',
    },
    reasonArea: 'what your family passes on',
  },
  D24: {
    plainName: 'Learning chart',
    question: 'How do you actually learn, and how far does formal study take you?',
    intro: 'Splits every sign in twenty-four to examine study, qualifications, and how your mind takes in knowledge.',
    lagnaMeaning: 'Sets your natural learning style and how easily study comes to you.',
    houses: {
      1: 'Your raw aptitude and how you prefer to learn.',
      2: 'Retention — what you actually remember and can use.',
      3: 'Self-teaching, skills picked up by doing, short courses.',
      4: 'Schooling and the environment you studied in.',
      5: 'The main indicator: intelligence, quick grasp, exam ability.',
      6: 'Competitive study, entrance exams, and where learning is a grind.',
      7: 'Learning with others — tutors, study partners, collaboration.',
      8: 'Research, hidden subjects, and study that gets interrupted.',
      9: 'Higher education, degrees, teachers and study abroad.',
      10: 'Qualifications that convert into a career.',
      11: 'What your education gains you — networks, credentials, income.',
      12: 'Study far from home, solitary learning, and knowledge pursued for its own sake.',
    },
    verdicts: {
      strong: 'Study and learning come readily to you',
      workable: 'Study is workable, with some friction',
      needsEffort: 'Study and learning ask for effort',
    },
    reasonArea: 'your learning',
  },
  D30: {
    plainName: 'Weak spots chart',
    question: 'Where are you most likely to run into trouble, and what kind?',
    intro: 'Splits every sign in thirty to expose vulnerabilities — the recurring difficulties and moral pressure points in a life. It is a map of what to watch, not a verdict.',
    lagnaMeaning: 'Sets the kind of trouble that tends to find you, and your basic resilience to it.',
    houses: {
      1: 'Trouble that comes from your own temperament and choices.',
      2: 'Money trouble, and words that get you into difficulty.',
      3: 'Trouble from impulsiveness, and friction with those close in age.',
      4: 'Domestic unrest and lack of peace at home.',
      5: 'Trouble from risk-taking, romance, or speculation.',
      6: 'Illness, enemies, debt and legal difficulty — the classic problem house.',
      7: 'Trouble arriving through partners and close relationships.',
      8: 'Crisis, upheaval and the things that arrive without warning.',
      9: 'Trouble from misplaced belief, bad advice, or travel.',
      10: 'Professional setbacks and damage to reputation.',
      11: 'Trouble from the wrong crowd, or from wanting too much.',
      12: 'Losses, isolation, and self-undermining habits.',
    },
    verdicts: {
      strong: 'You are well defended against the troubles this chart tracks',
      workable: 'You have moderate resistance to the troubles this chart tracks',
      needsEffort: 'This chart\'s troubles find you more easily than most',
    },
    reasonArea: 'your resilience',
  },
  D60: {
    plainName: 'Deep karma chart',
    question: 'What underlying pattern is running beneath everything else?',
    intro: 'Splits every sign into sixty — the finest division classical astrology uses. It is treated as the deepest layer, and needs an exact birth time to be reliable.',
    lagnaMeaning: 'Sets the underlying theme your life keeps returning to, whatever the surface circumstances.',
    houses: {
      1: 'The core pattern you were born carrying.',
      2: 'Deep patterns around security, worth and what you hold onto.',
      3: 'Deep patterns around effort, will and self-assertion.',
      4: 'Deep patterns around belonging and emotional safety.',
      5: 'Deep patterns around creativity, children and self-expression.',
      6: 'Long-running obligations, debts and service you owe.',
      7: 'Deep patterns in how you bond with others.',
      8: 'The transformations your life keeps putting you through.',
      9: 'Your underlying beliefs and the fortune that follows them.',
      10: 'The work you are, at bottom, here to do.',
      11: 'What ultimately comes to you, and why.',
      12: 'What you are meant to release rather than hold.',
    },
    verdicts: {
      strong: 'The deep pattern under your life runs in your favour',
      workable: 'The deep pattern under your life is mixed',
      needsEffort: 'The deep pattern under your life asks for conscious work',
    },
    reasonArea: 'the deep pattern under your life',
  },
};

// ─── Plain-language planet effects ─────────────────────────────────────────

/** What each planet does, in ordinary words. */
const PLANET_PLAIN: Record<string, string> = {
  Sun:     'drive, authority and the wish to be recognised',
  Moon:    'feelings, comfort-seeking and the need for security',
  Mars:    'energy, push and a willingness to fight for it',
  Mercury: 'thinking, talking and dealmaking',
  Jupiter: 'growth, generosity and good judgement',
  Venus:   'enjoyment, taste and the pull towards ease and beauty',
  Saturn:  'patience, restriction and the long slow grind',
  Rahu:    'hunger, ambition and a pull towards the unconventional',
  Ketu:    'detachment, specialisation and a tendency to lose interest',
};

/** How well the planet can express itself where it sits. */
const DIGNITY_PLAIN: Record<DignityLevel, string> = {
  'exalted':      'It is at full strength here, so this works unusually well for you.',
  'own-sign':     'It is on home ground here, so this works steadily and reliably.',
  'friend-sign':  'It is well supported here, so this generally goes your way.',
  'neutral-sign': 'It is neither helped nor hindered here — results are about average.',
  'enemy-sign':   'It is under strain here, so results need more effort than they should.',
  'debilitated':  'It is weakened here. This is a sore spot, and it improves only with conscious work.',
};

const DIGNITY_RANK: Record<DignityLevel, number> = {
  'exalted': 2, 'own-sign': 1.5, 'friend-sign': 0.75,
  'neutral-sign': 0, 'enemy-sign': -1, 'debilitated': -2,
};

/**
 * A plain sentence for one planet sitting in a house of a varga.
 *
 * Deliberately says nothing about what the house means — the panel states that
 * once, above the planet list. Repeating it per planet is how the old reading
 * became unreadable.
 */
export function plainPlanetEffect(
  planet: string,
  dignity: DignityLevel,
  isRetrograde: boolean,
  /** When given, flags the planet if it is this chart's significator. */
  code?: VargaCode,
): string {
  const role = PLANET_PLAIN[planet] ?? 'its own significations';
  const retroNote = isRetrograde
    ? ' Being retrograde, its results tend to arrive late, or on a second attempt.'
    : '';

  // The chart's karaka carries more weight than any other planet in it, and a
  // reader has no way to know that unless it is said.
  const karakaRole = code ? karakaRoleFor(code, planet) : null;
  const karakaNote = karakaRole
    ? ` This is the key planet for this chart — it stands for ${karakaRole}, so its condition here counts for more than any other placement.`
    : '';

  return `${planet} brings ${role}. ${DIGNITY_PLAIN[dignity]}${retroNote}${karakaNote}`;
}

// ─── Karakas — each chart's significator planet ────────────────────────────

export interface VargaKaraka {
  planet: string;
  /** What this planet stands for inside this chart, in plain words. */
  role: string;
}

/**
 * The classical significator(s) for each divisional chart. Judging a varga
 * begins with its karaka: Jupiter's condition in the Saptamsa says more about
 * children than any single house does. Weighted above ordinary placements in
 * the verdict, and flagged in the house readings.
 */
export const VARGA_KARAKAS: Partial<Record<VargaCode, VargaKaraka[]>> = {
  D2:  [{ planet: 'Jupiter', role: 'wealth and abundance' }],
  D3:  [{ planet: 'Mars', role: 'courage and siblings' }],
  D4:  [{ planet: 'Moon', role: 'home and contentment' }, { planet: 'Mars', role: 'land and property' }],
  D7:  [{ planet: 'Jupiter', role: 'children and fertility' }],
  D12: [{ planet: 'Sun', role: 'your father' }, { planet: 'Moon', role: 'your mother' }],
  D24: [{ planet: 'Mercury', role: 'intellect and study' }, { planet: 'Jupiter', role: 'wisdom and higher learning' }],
  D30: [{ planet: 'Saturn', role: 'endurance under adversity' }],
  D60: [{ planet: 'Jupiter', role: 'accumulated karma' }],
};

export function karakaRoleFor(code: VargaCode, planet: string): string | null {
  return VARGA_KARAKAS[code]?.find(k => k.planet === planet)?.role ?? null;
}

// ─── Overall verdict for a whole divisional chart ──────────────────────────

export type VargaStanding = 'strong' | 'workable' | 'needs-effort';

export interface VargaVerdict {
  standing: VargaStanding;
  /** Plain headline, e.g. "Money is a well-supported area for you". */
  headline: string;
  /** Two or three plain sentences explaining the headline. */
  summary: string;
  /** The specific placements the verdict rests on. */
  reasons: string[];
}

export interface VerdictPlanet {
  planet: string;
  dignity: DignityLevel;
  /** House this planet occupies in this varga (1–12). */
  house: number;
}

/**
 * A whole-chart read: how well supported this area of life is, judged the
 * classical way — the karaka first, the varga lagna lord second, and the
 * general spread of dignities and houses after that. Deliberately coarse —
 * three bands — because a finer number would imply precision this does not have.
 */
export function vargaVerdict(
  code: VargaCode,
  planets: VerdictPlanet[],
  /** Lord of this varga's rising sign — anchors the whole chart when given. */
  lagnaLord?: string,
): VargaVerdict {
  const meaning = VARGA_PLAIN[code];
  const area = meaning?.reasonArea ?? (meaning ? meaning.plainName.replace(/ chart$/, '').toLowerCase() : 'this area');

  const strong = planets.filter(p => p.dignity === 'exalted' || p.dignity === 'own-sign');
  const weak = planets.filter(p => p.dignity === 'debilitated');
  const strained = planets.filter(p => p.dignity === 'enemy-sign');

  // Planets in the 6th, 8th and 12th of a varga drag on its affairs.
  const inTroubleHouses = planets.filter(p => [6, 8, 12].includes(p.house));
  const inGoodHouses = planets.filter(p => [1, 4, 5, 7, 9, 10, 11].includes(p.house));

  let score =
    planets.reduce((sum, p) => sum + DIGNITY_RANK[p.dignity], 0) / Math.max(1, planets.length) +
    (inGoodHouses.length - inTroubleHouses.length) * 0.15;

  const reasons: string[] = [];
  // Planets already explained by a more specific rule; the generic dignity
  // lists below skip them rather than saying the same thing twice.
  const covered = new Set<string>();

  // ── The karaka — the planet the whole chart is judged by ──
  const karakas = (VARGA_KARAKAS[code] ?? [])
    .map(k => ({ ...k, placed: planets.find(p => p.planet === k.planet) }))
    .filter(k => k.placed);
  for (const k of karakas) {
    const p = k.placed!;
    const rank = DIGNITY_RANK[p.dignity];
    const houseMod = [6, 8, 12].includes(p.house) ? -0.5 : [1, 5, 9, 10, 11].includes(p.house) ? 0.3 : 0;
    // Karaka condition weighs more than any single ordinary placement.
    score += (rank * 0.45 + houseMod) / karakas.length;

    if (rank >= 1.5) {
      covered.add(p.planet);
      reasons.unshift(
        `${p.planet} — the planet that stands for ${k.role} in this chart — is ${p.dignity === 'exalted' ? 'at full strength' : 'on home ground'} here. ` +
        `That is the single best sign this chart can show.`,
      );
    } else if (rank <= -2) {
      covered.add(p.planet);
      reasons.unshift(
        `${p.planet} — the planet that stands for ${k.role} in this chart — is weakened here. ` +
        `This matters more than any other placement: expect this area to develop late or through real effort, not to be denied outright.`,
      );
    } else if ([6, 8, 12].includes(p.house)) {
      covered.add(p.planet);
      reasons.unshift(
        `${p.planet}, which stands for ${k.role}, falls in one of this chart's difficult houses — ` +
        `${area} tends to carry an ongoing complication that needs managing rather than solving.`,
      );
    }
  }

  // ── The varga lagna lord — the anchor of the chart itself ──
  const anchor = lagnaLord ? planets.find(p => p.planet === lagnaLord) : undefined;
  if (anchor) {
    const rank = DIGNITY_RANK[anchor.dignity];
    score += rank * 0.25 + ([6, 8, 12].includes(anchor.house) ? -0.25 : 0);
    if (rank >= 1.5) {
      covered.add(anchor.planet);
      reasons.push(
        `${anchor.planet}, which anchors this whole chart as its rising-sign ruler, is strongly placed — ` +
        `the foundation under ${area} is solid even when individual parts wobble.`,
      );
    } else if (rank <= -2 || [6, 8, 12].includes(anchor.house)) {
      covered.add(anchor.planet);
      reasons.push(
        `${anchor.planet}, which anchors this whole chart as its rising-sign ruler, is under pressure — ` +
        `${area} rests on a foundation that needs shoring up before building on it.`,
      );
    }
  }

  const standing: VargaStanding = score >= 0.55 ? 'strong' : score <= -0.4 ? 'needs-effort' : 'workable';

  const restStrong = strong.filter(p => !covered.has(p.planet));
  const restWeak = weak.filter(p => !covered.has(p.planet));
  const restStrained = strained.filter(p => !covered.has(p.planet));

  if (restStrong.length) {
    reasons.push(
      `${listOf(restStrong.map(p => p.planet))} ${restStrong.length > 1 ? 'are' : 'is'} also strongly placed here, ` +
      `which supports ${area} further.`,
    );
  }
  if (restWeak.length) {
    reasons.push(
      `${listOf(restWeak.map(p => p.planet))} ${restWeak.length > 1 ? 'are' : 'is'} weakened here — the part of ${area} ` +
      `${restWeak.length > 1 ? 'they govern needs' : 'it governs needs'} deliberate attention.`,
    );
  }
  if (restStrained.length && !restWeak.length) {
    reasons.push(
      `${listOf(restStrained.map(p => p.planet))} ${restStrained.length > 1 ? 'sit' : 'sits'} under some strain here, so ` +
      `progress in ${area} costs more effort than it should.`,
    );
  }
  if (inTroubleHouses.length >= 3) {
    reasons.push(
      `${inTroubleHouses.length} planets fall in the difficult houses of this chart, which is why ${area} ` +
      `tends to come with complications attached.`,
    );
  }
  if (!reasons.length) {
    reasons.push(`Nothing in this chart stands out sharply either way — ${area} runs close to average for you.`);
  }

  // Per-chart wording: generic phrasing produces both bad grammar
  // ("Weak spots is a well-supported area") and, for the adversity chart,
  // the reverse of the truth.
  const headline = meaning
    ? standing === 'strong'
      ? meaning.verdicts.strong
      : standing === 'needs-effort'
        ? meaning.verdicts.needsEffort
        : meaning.verdicts.workable
    : standing === 'strong'
      ? `${capitalise(area)} is a well-supported area for you`
      : standing === 'needs-effort'
        ? `${capitalise(area)} is an area that asks for effort`
        : `${capitalise(area)} is workable, with some friction`;

  const summary =
    standing === 'strong'
      ? `The planets governing ${area} are mostly well placed in this division. Where this area is concerned you ` +
        `tend to get a fair return on what you put in, and setbacks recover quickly.`
      : standing === 'needs-effort'
        ? `The planets governing ${area} are mostly under pressure in this division. This is not a verdict of ` +
          `failure — it means results here come from deliberate, sustained work rather than from luck, and that ` +
          `expecting things to simply fall into place will disappoint you.`
        : `The planets governing ${area} are mixed in this division. Parts of it run smoothly and parts of it ` +
          `resist, so outcomes depend a good deal on which specific aspect of it you are dealing with.`;

  return { standing, headline, summary, reasons };
}

// ─── helpers ───────────────────────────────────────────────────────────────

function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function listOf(items: string[]): string {
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}
