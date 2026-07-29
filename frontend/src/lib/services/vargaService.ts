/**
 * Varga service — D9/D10 divisional charts and the marriage and career readings
 * derived from them.
 *
 * These readings used to take only a `VargaChart`, which carries divisional signs
 * and nothing else. That made a whole class of conclusion unreachable: a chart
 * whose 7th lord also rules the 12th, or whose 10th lord sits in the 8th, read as
 * uniformly positive because sign dignity was the only input available. Divisional
 * dignity is a refinement of a judgement that starts from lordship and house, so
 * the natal context is now required rather than optional — a reading that cannot
 * see the 10th lord's house should not be produced at all.
 */

import { getPlanetPositions } from '../core/ephemeris';
import { computeVargas, type VargaChart } from '../core/vargas';
import { RASHIS, RASHI_ENGLISH } from '../core/rashi';
import { RASHI_LORDS, getDignity, getCombustion, type DignityLevel } from '../core/planetaryAnalysis';
import type { BirthData } from '../../types/astrology';

export interface VargaInsight {
  title: string;
  tone: 'positive' | 'neutral' | 'challenging';
  text: string;
}

/**
 * The D1 facts the divisional readings need. Without these, lordship and natal
 * house placement are invisible and the reading collapses to sign dignity.
 */
export interface NatalVargaContext {
  /** D1 ascendant rashi (0–11). Sets the whole house framework. */
  ascendantRashi: number;
  /** D1 rashi per planet, keyed Sun/Moon/…/Ketu. */
  planetRashis: Record<string, number>;
  /** Sidereal longitudes — enables combustion of the 7th and 10th lords. */
  planetLongitudes?: Record<string, number>;
  planetRetro?: Record<string, boolean>;
}

export interface VargaReport {
  chart: VargaChart;
  d9AscendantName: string;
  d10AscendantName: string;
  marriageInsights: VargaInsight[];
  careerInsights: VargaInsight[];
}

const STRONG: DignityLevel[] = ['exalted', 'own-sign', 'friend-sign'];
const WEAK: DignityLevel[] = ['enemy-sign', 'debilitated'];
const DUSTHANAS = [6, 8, 12];

const DIGNITY_TEXT: Record<DignityLevel, string> = {
  'exalted': 'exalted',
  'own-sign': 'in its own sign',
  'friend-sign': 'in a friendly sign',
  'neutral-sign': 'in a neutral sign',
  'enemy-sign': 'in an enemy sign',
  'debilitated': 'debilitated',
};

function ordinal(n: number): string {
  const v = n % 100;
  if (v >= 11 && v <= 13) return `${n}th`;
  return `${n}${['th', 'st', 'nd', 'rd'][n % 10] ?? 'th'}`;
}

/** Houses (1–12) a planet rules from the given ascendant. */
function rulesHouses(planet: string, ascendantRashi: number): number[] {
  const out: number[] = [];
  for (let h = 1; h <= 12; h++) {
    if (RASHI_LORDS[(ascendantRashi + h - 1) % 12] === planet) out.push(h);
  }
  return out;
}

/** Condition of a bhava's lord in the D1, which is where judgement starts. */
interface LordCondition {
  lord: string;
  rules: number[];
  /** Houses it rules other than the one being judged. */
  alsoRules: number[];
  /** Dusthanas among those — the decisive negative. */
  dusthanaRuled: number[];
  house: number | null;
  dignity: DignityLevel | null;
  inDusthana: boolean;
  combust: boolean;
  retrograde: boolean;
  /** Occupies the very house it rules. */
  inOwnBhava: boolean;
}

function lordConditionFor(house: number, ctx: NatalVargaContext): LordCondition | null {
  const houseRashi = (ctx.ascendantRashi + house - 1) % 12;
  const lord = RASHI_LORDS[houseRashi];
  const lordRashi = ctx.planetRashis[lord];
  const rules = rulesHouses(lord, ctx.ascendantRashi);
  const alsoRules = rules.filter(h => h !== house);
  const lordHouse = lordRashi != null ? ((lordRashi - ctx.ascendantRashi + 12) % 12) + 1 : null;

  const lons = ctx.planetLongitudes;
  const retro = ctx.planetRetro?.[lord] ?? false;
  const comb = lons?.[lord] != null && lons?.Sun != null
    ? getCombustion(lord, lons[lord], lons.Sun, retro) : null;

  return {
    lord,
    rules,
    alsoRules,
    dusthanaRuled: alsoRules.filter(h => DUSTHANAS.includes(h)),
    house: lordHouse,
    dignity: lordRashi != null ? getDignity(lord, lordRashi) : null,
    inDusthana: lordHouse != null && DUSTHANAS.includes(lordHouse),
    combust: comb?.isCombust ?? false,
    retrograde: retro,
    inOwnBhava: lordHouse === house,
  };
}

/** Occupants of a whole-sign house in the D1, split benefic / malefic. */
const MALEFICS = ['Sun', 'Mars', 'Saturn', 'Rahu', 'Ketu'];
function occupantsOf(house: number, ctx: NatalVargaContext) {
  const rashi = (ctx.ascendantRashi + house - 1) % 12;
  const all = Object.entries(ctx.planetRashis).filter(([, r]) => r === rashi).map(([p]) => p);
  return {
    all,
    malefics: all.filter(p => MALEFICS.includes(p)),
    benefics: all.filter(p => !MALEFICS.includes(p)),
  };
}

/**
 * Marriage reading. Leads on the 7th lord's lordship and house, because that is
 * the statement the rest qualifies — a 7th lord that also rules a dusthana is the
 * single most important fact about a marriage chart, and no amount of good
 * divisional dignity overturns it.
 */
export function marriageInsights(chart: VargaChart, ctx: NatalVargaContext): VargaInsight[] {
  const insights: VargaInsight[] = [];
  const find = (p: string) => chart.planets.find(x => x.planet === p);

  // ── The 7th lord in the D1 ──
  const seventh = lordConditionFor(7, ctx);
  if (seventh) {
    const d9 = find(seventh.lord);
    const parts: string[] = [];
    let tone: VargaInsight['tone'] = 'neutral';

    parts.push(
      `${seventh.lord} rules your 7th house` +
      (seventh.house ? ` and sits in the ${ordinal(seventh.house)}` : '') +
      (seventh.dignity ? `, ${DIGNITY_TEXT[seventh.dignity]}` : '') + '.');

    if (seventh.dusthanaRuled.length) {
      tone = 'challenging';
      parts.push(
        `It also rules your ${seventh.dusthanaRuled.map(ordinal).join(' and ')} — ` +
        `the house of marriage and the house of ${seventh.dusthanaRuled.includes(12) ? 'loss' : seventh.dusthanaRuled.includes(8) ? 'upheaval' : 'conflict'} ` +
        'share one ruler, so the same planet carries both significations wherever it goes. ' +
        'This is a structural feature of the chart and it is not cancelled by good dignity.');
    }
    if (seventh.inOwnBhava) {
      parts.push(
        `It occupies the very house it rules, which classically over-charges the matter rather than ` +
        `strengthening it (karako bhava nashaya).`);
      if (tone === 'neutral') tone = 'challenging';
    }
    if (seventh.inDusthana) {
      tone = 'challenging';
      parts.push(`Placed in a dusthana, its results are delayed, hidden or reached indirectly.`);
    }
    if (seventh.combust) {
      tone = 'challenging';
      parts.push(`It is combust, which burns its outward expression — invisible to any sign-only reading.`);
    }
    if (seventh.retrograde) parts.push('Retrograde: partnership matters resolve on a second attempt.');

    // Navamsa dignity of the 7th lord outranks its rashi dignity for marriage.
    if (d9) {
      const d9Strong = STRONG.includes(d9.d9Dignity);
      const d9Weak = WEAK.includes(d9.d9Dignity);
      parts.push(
        `In the navamsa it is ${DIGNITY_TEXT[d9.d9Dignity]} in ${d9.d9RashiName}, which outranks its ` +
        `rashi-chart dignity for marriage.`);
      if (d9Weak) tone = 'challenging';
      else if (d9Strong && tone === 'neutral') tone = 'positive';
      else if (d9Strong && tone === 'challenging') {
        parts.push('That is a genuine mitigant against the above, not a cancellation of it.');
      }
    }

    insights.push({ title: `7th lord: ${seventh.lord}`, tone, text: parts.join(' ') });
  }

  // ── The 7th house itself ──
  const occ = occupantsOf(7, ctx);
  if (occ.all.length) {
    insights.push({
      title: '7th house occupants',
      tone: occ.malefics.length > occ.benefics.length ? 'challenging'
        : occ.benefics.length ? 'positive' : 'neutral',
      text: occ.malefics.length
        ? `${occ.malefics.join(' and ')} ${occ.malefics.length > 1 ? 'occupy' : 'occupies'} your 7th house. ` +
          'A natural malefic there does not predict failure, but the partnership asks more and the partner tends to have a strong will of their own.'
        : `${occ.benefics.join(' and ')} ${occ.benefics.length > 1 ? 'occupy' : 'occupies'} your 7th house — a natural benefic there is protective of the partnership.`,
    });
  }

  // ── Venus, with its natal house and combustion, not sign alone ──
  const venus = find('Venus');
  const venusRashi = ctx.planetRashis.Venus;
  if (venus && venusRashi != null) {
    const house = ((venusRashi - ctx.ascendantRashi + 12) % 12) + 1;
    const lons = ctx.planetLongitudes;
    const comb = lons?.Venus != null && lons?.Sun != null
      ? getCombustion('Venus', lons.Venus, lons.Sun, ctx.planetRetro?.Venus ?? false) : null;
    const strong = STRONG.includes(venus.d9Dignity);
    const weak = WEAK.includes(venus.d9Dignity) || (comb?.isCombust ?? false);

    insights.push({
      title: 'Venus, significator of marriage',
      tone: weak ? 'challenging' : strong ? 'positive' : 'neutral',
      text:
        `Venus sits in your ${ordinal(house)} house and is ${DIGNITY_TEXT[venus.d9Dignity]} in ${venus.d9RashiName} navamsa.` +
        (comb?.isCombust
          ? ` It is combust at ${comb.separation.toFixed(2)}° from the Sun, which dims what it can deliver outwardly however good its sign.`
          : '') +
        (strong && !weak
          ? ' The underlying promise for affection and partnership is sound.'
          : weak
            ? ' Affection needs tending rather than assuming here.'
            : ' Partnership results are steady and shaped by mutual effort.'),
    });
  }

  // ── Navamsa lagna lord ──
  const d9LagnaLord = RASHI_LORDS[chart.d9Ascendant];
  const lordPos = find(d9LagnaLord);
  if (lordPos) {
    const strong = STRONG.includes(lordPos.d9Dignity);
    insights.push({
      title: `Navamsa lagna: ${RASHIS[chart.d9Ascendant]} (lord ${d9LagnaLord})`,
      tone: strong ? 'positive' : WEAK.includes(lordPos.d9Dignity) ? 'challenging' : 'neutral',
      text:
        `The navamsa rises in ${RASHI_ENGLISH[chart.d9Ascendant]} and its lord ${d9LagnaLord} is ` +
        `${DIGNITY_TEXT[lordPos.d9Dignity]} in the navamsa` +
        (lordPos.d9Rashi === chart.d9Ascendant ? ', in the navamsa lagna itself' : '') + '. ' +
        (strong
          ? 'That is a real mitigant for partnership whatever the rashi chart shows.'
          : WEAK.includes(lordPos.d9Dignity)
            ? 'Inner growth through relationship comes with tests.'
            : 'Partnership karma unfolds at an even pace.'),
    });
  }

  // ── Vargottama, stated without overclaiming ──
  if (chart.vargottamaPlanets.length) {
    const relevant = chart.vargottamaPlanets.filter(p => p === 'Venus' || p === seventh?.lord);
    insights.push({
      title: 'Vargottama planets',
      tone: relevant.length ? 'positive' : 'neutral',
      text:
        `${chart.vargottamaPlanets.join(', ')} hold the same sign in D1 and D9. ` +
        (relevant.length
          ? `${relevant.join(' and ')} ${relevant.length > 1 ? 'are' : 'is'} directly relevant here — a vargottama 7th lord or Venus is a genuine stabiliser.`
          : 'None of them is the 7th lord or Venus, so the effect on marriage specifically is indirect. ' +
            'Vargottama status locks a placement in; it does not make a weak placement strong.'),
    });
  }

  return insights;
}

/**
 * Career reading. Leads on the 10th lord's house, because a 10th lord in a
 * dusthana is the fact that decides the tone — a reading that opens with
 * "you become an institution in your field" while the 10th lord sits in the 8th
 * is describing a different chart.
 */
export function careerInsights(chart: VargaChart, ctx: NatalVargaContext): VargaInsight[] {
  const insights: VargaInsight[] = [];
  const find = (p: string) => chart.planets.find(x => x.planet === p);

  // ── The 10th lord in the D1 ──
  const tenth = lordConditionFor(10, ctx);
  let tenthCompromised = false;
  if (tenth) {
    const parts: string[] = [];
    let tone: VargaInsight['tone'] = 'neutral';

    parts.push(
      `${tenth.lord} rules your 10th house` +
      (tenth.house ? ` and sits in the ${ordinal(tenth.house)}` : '') +
      (tenth.dignity ? `, ${DIGNITY_TEXT[tenth.dignity]}` : '') + '.');

    if (tenth.inDusthana) {
      tone = 'challenging';
      tenthCompromised = true;
      parts.push(
        `The lord of career in a dusthana is the most consequential single fact here: standing is ` +
        `reached indirectly, is vulnerable to reversal, and does not arrive in proportion to visible effort.`);
    }
    if (tenth.dusthanaRuled.length) {
      tenthCompromised = true;
      if (tone === 'neutral') tone = 'challenging';
      parts.push(`It also rules your ${tenth.dusthanaRuled.map(ordinal).join(' and ')}, so career and that house move together.`);
    }
    if (tenth.combust) {
      tenthCompromised = true;
      tone = 'challenging';
      parts.push('It is combust — recognition lags the work, and a sign-only reading cannot see this.');
    }
    if (WEAK.includes(tenth.dignity ?? 'neutral-sign')) {
      tenthCompromised = true;
      if (tone === 'neutral') tone = 'challenging';
    }
    if (!tenthCompromised && STRONG.includes(tenth.dignity ?? 'neutral-sign')) {
      tone = 'positive';
      parts.push('The foundation for professional standing is sound.');
    }
    insights.push({ title: `10th lord: ${tenth.lord}`, tone, text: parts.join(' ') });
  }

  // ── The 10th house itself ──
  const occ = occupantsOf(10, ctx);
  insights.push({
    title: '10th house',
    tone: occ.benefics.length && !occ.malefics.length ? 'positive'
      : occ.malefics.length ? 'neutral' : 'neutral',
    text: occ.all.length
      ? `${occ.all.join(', ')} ${occ.all.length > 1 ? 'occupy' : 'occupies'} your 10th house.` +
        (occ.malefics.length
          ? ' Malefics in the 10th are classically constructive for career — they build through effort and friction rather than ease.'
          : ' Benefics here support reputation directly.')
      : `Your 10th house is empty, so career is read through its lord ${tenth?.lord ?? ''} rather than through occupants. ` +
        'An empty 10th is the ordinary case and is not itself a weakness.',
  });

  // ── D10 dignity of the career karakas, with the tone capped ──
  const checks: { planet: string; strongText: string; weakText: string }[] = [
    { planet: 'Sun', strongText: 'authority, visibility and recognition build steadily — leadership roles suit you', weakText: 'recognition arrives later than effort deserves — let the work speak before seeking titles' },
    { planet: 'Saturn', strongText: 'long-term, structural career success — you become an institution in your field', weakText: 'professional discipline is tested; systems and routines are the safeguard' },
    { planet: 'Mercury', strongText: 'commerce, analysis and communication professions are strongly supported', weakText: 'double-check contracts and communications at work — precision protects reputation' },
  ];

  for (const c of checks) {
    const p = find(c.planet);
    if (!p) continue;
    const strong = STRONG.includes(p.d10Dignity);
    const weak = WEAK.includes(p.d10Dignity);
    // A strong karaka cannot promise more than the 10th lord can deliver. Left
    // uncapped, this is what produced uniformly positive career readings on
    // charts whose career house was demonstrably compromised.
    const tone: VargaInsight['tone'] = strong && !tenthCompromised ? 'positive' : weak ? 'challenging' : 'neutral';
    insights.push({
      title: `${c.planet} in dasamsa`,
      tone,
      text:
        `${c.planet} is ${DIGNITY_TEXT[p.d10Dignity]} in ${p.d10RashiName} dasamsa — ` +
        `${strong ? c.strongText : weak ? c.weakText : 'results in its significations track your consistency'}.` +
        (strong && tenthCompromised
          ? ` Read against the 10th lord above, though: this is capacity rather than delivery, and the career house is the constraint.`
          : ''),
    });
  }

  // ── Dasamsa lagna lord ──
  const d10LagnaLord = RASHI_LORDS[chart.d10Ascendant];
  const lordPos = find(d10LagnaLord);
  if (lordPos) {
    const strong = STRONG.includes(lordPos.d10Dignity);
    insights.push({
      title: `Dasamsa lagna: ${RASHIS[chart.d10Ascendant]} (lord ${d10LagnaLord})`,
      tone: strong && !tenthCompromised ? 'positive' : WEAK.includes(lordPos.d10Dignity) ? 'challenging' : 'neutral',
      text:
        `The dasamsa rises in ${RASHI_ENGLISH[chart.d10Ascendant]} and its lord ${d10LagnaLord} is ` +
        `${DIGNITY_TEXT[lordPos.d10Dignity]} in the dasamsa. ` +
        (strong
          ? 'Professional identity is well founded and gains momentum with age.'
          : WEAK.includes(lordPos.d10Dignity)
            ? 'Career direction clarifies through trial; early shifts are part of the design.'
            : 'Public standing grows in proportion to sustained effort.'),
    });
  }

  return insights;
}

const PLANET_KEYS = ['SUN', 'MOON', 'MARS', 'MERCURY', 'JUPITER', 'VENUS', 'SATURN', 'RAHU', 'KETU'] as const;

export async function getVargaReport(bd: BirthData): Promise<VargaReport> {
  const positions = await getPlanetPositions(bd.date, bd.latitude, bd.longitude, bd.timezone, bd.ayanamsa);

  const longitudes: Record<string, number> = {};
  const retro: Record<string, boolean> = {};
  const planetRashis: Record<string, number> = {};
  for (const k of PLANET_KEYS) {
    const p = positions[k];
    if (!p) continue;
    const name = k.charAt(0) + k.slice(1).toLowerCase();
    longitudes[name] = p.longitude;
    retro[name] = p.isRetrograde;
    planetRashis[name] = p.rashi;
  }

  const chart = computeVargas({
    longitudes,
    retro,
    ascendantLongitude: positions['ASCENDANT'].longitude,
  });

  const ctx: NatalVargaContext = {
    ascendantRashi: positions['ASCENDANT'].rashi,
    planetRashis,
    planetLongitudes: longitudes,
    planetRetro: retro,
  };

  return {
    chart,
    d9AscendantName: RASHIS[chart.d9Ascendant],
    d10AscendantName: RASHIS[chart.d10Ascendant],
    marriageInsights: marriageInsights(chart, ctx),
    careerInsights: careerInsights(chart, ctx),
  };
}
