/**
 * Turning a weighted sub-period map into a usable plan.
 *
 * Two honest questions follow from the weight analysis: *where does this
 * period carry the most force*, and *what does "profitable" even mean here*.
 * The second needs reframing rather than optimism — a separative pairing like
 * Saturn–Ketu subtracts by nature, so chasing acquisition against that current
 * produces forced losses. The profit available is consolidation: what you stop
 * losing, and the position you hold when the next antardasha opens.
 *
 * Everything below is derived from the chart — house lordships, natal dignity,
 * and the weight assessment — never from a fixed script.
 */

import { SEPARATIVE, type PeriodTone, type WeightBand } from './dashaWeight';
import type { PlanetStrength } from './dashaStrength';
import type { AntardashaJudgement } from './antardashaJudgement';
import { type Lang, en2si, planetName, houseLabel, joinAnd } from './i18n';
import { SIG_TEXT } from './text/predictionVocab';
import { housePhrase, DIGNITY_PHRASE, STRATEGY } from './text/strategyText';

export type Stance = 'accumulate' | 'consolidate' | 'mixed';

export interface StrategyWindow {
  lord: string;
  start: string;
  end: string;
  weight: number;
  band: WeightBand;
  tone: PeriodTone;
  /** Why this window earns its place in this list. */
  reason: string;
}

export interface PeriodStrategy {
  stance: Stance;
  /** The classical judgement the stance is derived from. */
  judgement: AntardashaJudgement;
  stanceHeadline: string;
  stanceBody: string;
  /** Where the force concentrates, in plain dates. */
  peaks: string;
  /** Dignified, supported windows — act through these. */
  actionWindows: StrategyWindow[];
  /** Heavy, testing windows — profit here is defensive. */
  defensiveWindows: StrategyWindow[];
  /** Long windows suited to deep, compounding, intangible work. */
  buildWindows: StrategyWindow[];
  /** What to guard while the period runs. */
  protect: string[];
  nextHarvest: { lord: string; start: string; end: string; note: string } | null;
  oneLine: string;
}

/** Minimal shape the strategy needs from a weighted pratyantardasha. */
export interface WeightedWindow {
  lord: string;
  start: Date;
  end: Date;
  days: number;
  weight: number;
  band: WeightBand;
  tone: PeriodTone;
}

export interface StrategyInput {
  mahadashaLord: string;
  antardashaLord: string;
  periods: WeightedWindow[];
  /** Classical judgement of this mahadasha/antardasha pair. */
  judgement: AntardashaJudgement;
  /** Natal condition lookup — null when the chart is unavailable. */
  strengthOf: (planet: string) => PlanetStrength | null;
  nextAntardasha: { lord: string; start: Date; end: Date } | null;
  lang?: Lang;
}

const ISO = (d: Date): string => d.toISOString();

function shortDate(d: Date, lang: Lang): string {
  return d.toLocaleDateString(lang === 'si' ? 'si-LK' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Deep-work planets: their windows build expertise that compounds later. */
const DEEP_WORK = new Set(['Saturn', 'Ketu', 'Mercury', 'Jupiter']);

/** Houses whose activation genuinely means income rather than activity. */
const GAIN_HOUSES = [11, 2, 9, 10];

// ─── Stance ─────────────────────────────────────────────────────────────────

/**
 * Stance follows the classical judgement of the pair, not the bare nature of
 * the lords. Judging on separativeness alone made every antardasha of a Saturn
 * or Rahu mahadasha read "consolidate" for nineteen years at a stretch, which
 * is both useless and wrong: a Saturn mahadasha still has productive sub-
 * periods, and the classics identify them by mutual disposition.
 */
function deriveStance(judgement: AntardashaJudgement): Stance {
  if (judgement.score >= 6.5) return 'accumulate';
  if (judgement.score <= 4.3) return 'consolidate';
  return 'mixed';
}

/** "11th" / "11 වන" — an ordinal short-form for the disposition clause. */
function ordinalShort(n: number, lang: Lang): string {
  if (lang === 'si') return `${n} වන`;
  const v = n % 100;
  const suffix = (v >= 11 && v <= 13) ? 'th' : (['th', 'st', 'nd', 'rd'][n % 10] || 'th');
  return `${n}${suffix}`;
}

/** "the 11th from Saturn" — the classical reason, in one clause. */
function dispositionClause(md: string, ad: string, j: AntardashaJudgement, lang: Lang): string {
  if (j.houseFromLord == null) return '';
  return STRATEGY.dispositionClause(md, ad, j.houseFromLord, ordinalShort(j.houseFromLord, lang), j.shashtashtaka, lang);
}

function stanceProse(
  stance: Stance,
  md: string,
  ad: string,
  input: StrategyInput,
  lang: Lang,
): { headline: string; body: string } {
  const j = input.judgement;
  const mdN = planetName(md, lang);
  const adN = planetName(ad, lang);
  const separatives = [md, ad].filter(p => SEPARATIVE.has(p)).map(p => planetName(p, lang));
  const adStrength = input.strengthOf(ad);
  const gainHouses = (adStrength?.lordedHouses ?? []).filter(h => GAIN_HOUSES.includes(h));
  const disp = dispositionClause(mdN, adN, j, lang);

  if (stance === 'consolidate') {
    return {
      headline: STRATEGY.consolidateHeadline[en2si(lang)],
      body: STRATEGY.consolidateBody(mdN, adN, j.score, STRATEGY.separativeNote(separatives, lang), disp, lang),
    };
  }

  if (stance === 'accumulate') {
    const houseNote = gainHouses.length ? STRATEGY.accumulateHouseNote(adN, housePhrase(gainHouses, lang), lang) : '';
    return {
      headline: STRATEGY.accumulateHeadline[en2si(lang)],
      body: STRATEGY.accumulateBody(mdN, adN, j.score, houseNote, disp, lang),
    };
  }

  return {
    headline: STRATEGY.mixedHeadline[en2si(lang)],
    body: STRATEGY.mixedBody(mdN, adN, j.score, disp, lang),
  };
}

// ─── Window classification ──────────────────────────────────────────────────

function actionReason(w: WeightedWindow, s: PlanetStrength | null, lang: Lang): string {
  const lord = planetName(w.lord, lang);
  const bits: string[] = [];
  if (s?.dignity && DIGNITY_PHRASE[s.dignity]) {
    bits.push(STRATEGY.actionBitDignity(lord, DIGNITY_PHRASE[s.dignity][en2si(lang)], lang));
  }
  if (s?.functionalNature === 'yogakaraka') {
    bits.push(STRATEGY.actionBitYogakaraka[en2si(lang)]);
  }
  // Only the houses that actually argue for acting — a dusthana lordship is
  // not a reason to commit, so it stays out of the case for the window.
  const supportive = (s?.lordedHouses ?? []).filter(h => ![6, 8, 12].includes(h));
  if (supportive.length) {
    bits.push(STRATEGY.actionBitRules(housePhrase(supportive, lang), lang));
  }
  if (!bits.length) {
    bits.push(STRATEGY.actionBitClean(lord, lang));
  }
  return STRATEGY.actionReason(bits, lang);
}

function defensiveReason(w: WeightedWindow, lang: Lang): string {
  return SEPARATIVE.has(w.lord)
    ? STRATEGY.defensiveReasonSep(planetName(w.lord, lang), lang)
    : STRATEGY.defensiveReasonPile(lang);
}

function buildReason(w: WeightedWindow, lang: Lang): string {
  const focus = STRATEGY.deepWorkFocus[w.lord];
  return STRATEGY.buildReason(planetName(w.lord, lang), focus ? focus[en2si(lang)] : null, lang);
}

function toWindow(w: WeightedWindow, reason: string): StrategyWindow {
  return {
    lord: w.lord,
    start: ISO(w.start),
    end: ISO(w.end),
    weight: w.weight,
    band: w.band,
    tone: w.tone,
    reason,
  };
}

// ─── Protections ────────────────────────────────────────────────────────────

function deriveProtect(md: string, ad: string, stance: Stance, lang: Lang): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const lord of [md, ad]) {
    const sig = SIG_TEXT[lord];
    const diseases = sig ? (lang === 'si' ? sig.diseases.si : sig.diseases.en) : [];
    const area = joinAnd(diseases.slice(0, 2), lang);
    if (area && !seen.has(lord)) {
      seen.add(lord);
      out.push(STRATEGY.protectDisease(planetName(lord, lang), area, lang));
    }
  }
  if (SEPARATIVE.has(md) || SEPARATIVE.has(ad)) {
    out.push(STRATEGY.protectSeverance[en2si(lang)]);
  }
  if (stance !== 'accumulate') {
    out.push(STRATEGY.protectReserves[en2si(lang)]);
  }
  return out;
}

// ─── Next-period harvest ────────────────────────────────────────────────────

function deriveHarvest(input: StrategyInput, stance: Stance, lang: Lang): PeriodStrategy['nextHarvest'] {
  const next = input.nextAntardasha;
  if (!next) return null;
  const s = input.strengthOf(next.lord);
  const houses = s?.lordedHouses ?? [];
  const gainHouses = houses.filter(h => GAIN_HOUSES.includes(h));
  const nextN = planetName(next.lord, lang);

  const note = gainHouses.length
    ? STRATEGY.harvestGain(nextN, housePhrase(gainHouses, lang), lang)
    : houses.length
      ? STRATEGY.harvestHouses(nextN, housePhrase(houses, lang), shortDate(next.start, lang), lang)
      : STRATEGY.harvestPlain(planetName(input.mahadashaLord, lang), nextN, shortDate(next.start, lang), lang);

  return {
    lord: next.lord,
    start: ISO(next.start),
    end: ISO(next.end),
    note: stance === 'consolidate' ? `${note}${STRATEGY.harvestPositionSuffix[en2si(lang)]}` : note,
  };
}

// ─── Main ───────────────────────────────────────────────────────────────────

export function buildPeriodStrategy(input: StrategyInput): PeriodStrategy {
  const { mahadashaLord: md, antardashaLord: ad, periods, judgement, lang = 'en' } = input;
  const mdN = planetName(md, lang);
  const adN = planetName(ad, lang);
  const stance = deriveStance(judgement);
  const { headline, body } = stanceProse(stance, md, ad, input, lang);

  const byWeight = [...periods].sort((a, b) => b.weight - a.weight);
  const peakList = byWeight.slice(0, 3).sort((a, b) => a.start.getTime() - b.start.getTime());
  const peaks = peakList.length
    ? STRATEGY.peaks(peakList
        .map(p => STRATEGY.peakWindow(mdN, adN, planetName(p.lord, lang), shortDate(p.start, lang), shortDate(p.end, lang)))
        .join(', '), lang)
    : '';

  const actionWindows = periods
    .filter(p => {
      const s = input.strengthOf(p.lord);
      return p.tone === 'constructive' || (s != null && s.total >= 0.75);
    })
    .sort((a, b) => (input.strengthOf(b.lord)?.total ?? 0) - (input.strengthOf(a.lord)?.total ?? 0))
    .slice(0, 3)
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .map(p => toWindow(p, actionReason(p, input.strengthOf(p.lord), lang)));

  const defensiveWindows = periods
    .filter(p => (p.band === 'heavy' || p.band === 'strong') && p.tone !== 'constructive')
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 4)
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .map(p => toWindow(p, defensiveReason(p, lang)));

  const actionLords = new Set(actionWindows.map(w => w.lord));
  const buildWindows = periods
    .filter(p => DEEP_WORK.has(p.lord) && p.days >= 25 && !actionLords.has(p.lord))
    .sort((a, b) => b.days - a.days)
    .slice(0, 2)
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .map(p => toWindow(p, buildReason(p, lang)));

  const nextHarvest = deriveHarvest(input, stance, lang);

  const firstAction = actionWindows[0];
  let oneLine: string;
  if (stance === 'consolidate' && nextHarvest) {
    const gh = input.strengthOf(nextHarvest.lord)?.lordedHouses.filter(h => GAIN_HOUSES.includes(h)) ?? [];
    const phrase = gh.length ? joinAnd(gh.map(h => houseLabel(h, lang)), lang) : STRATEGY.oneLineNextFallback[en2si(lang)];
    oneLine = STRATEGY.oneLineConsolidate(mdN, adN, planetName(nextHarvest.lord, lang), phrase, lang);
  } else if (stance === 'accumulate') {
    const windowPhrase = firstAction ? STRATEGY.oneLineActionWindow(planetName(firstAction.lord, lang), lang) : STRATEGY.oneLineSupportedWindows[en2si(lang)];
    oneLine = STRATEGY.oneLineAccumulate(mdN, adN, windowPhrase, lang);
  } else {
    oneLine = STRATEGY.oneLineMixed(mdN, adN, lang);
  }

  return {
    stance,
    judgement,
    stanceHeadline: headline,
    stanceBody: body,
    peaks,
    actionWindows,
    defensiveWindows,
    buildWindows,
    protect: deriveProtect(md, ad, stance, lang),
    nextHarvest,
    oneLine,
  };
}
