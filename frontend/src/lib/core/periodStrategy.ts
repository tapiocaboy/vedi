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

import { HOUSE_DATA } from './planetaryAnalysis';
import { PLANET_SIGNIFICATIONS } from './predictions';
import { SEPARATIVE, type PeriodTone, type WeightBand } from './dashaWeight';
import type { PlanetStrength } from './dashaStrength';
import type { AntardashaJudgement } from './antardashaJudgement';

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
}

const ISO = (d: Date): string => d.toISOString();

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

function shortDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** "the 9th house of fortune and the 11th house of gains" */
function housePhrase(houses: number[]): string {
  const parts = houses.map(h => `${ordinal(h)} house of ${HOUSE_DATA[h].theme.toLowerCase()}`);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0];
  return `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;
}

const DIGNITY_PHRASE: Record<string, string> = {
  'exalted': 'exalted',
  'own-sign': 'in its own sign',
  'friend-sign': "in a friend's sign",
  'neutral-sign': 'in a neutral sign',
  'enemy-sign': "in an enemy's sign",
  'debilitated': 'debilitated',
};

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

/** "the 11th from Saturn" — the classical reason, in one clause. */
function dispositionClause(md: string, ad: string, j: AntardashaJudgement): string {
  if (j.houseFromLord == null) return '';
  if (j.shashtashtaka) {
    return ` The reason is structural: ${ad} sits in the ${ordinal(j.houseFromLord)} from ${md}, ` +
      `putting the two lords on the 6-8 axis that the classics treat as the most obstructed pairing.`;
  }
  return ` The reason is structural: ${ad} sits in the ${ordinal(j.houseFromLord)} from ${md} in your chart, ` +
    `which is what governs how a sub-period delivers.`;
}

function stanceProse(
  stance: Stance,
  md: string,
  ad: string,
  input: StrategyInput,
): { headline: string; body: string } {
  const j = input.judgement;
  const separatives = [md, ad].filter(p => SEPARATIVE.has(p));
  const adStrength = input.strengthOf(ad);
  const gainHouses = (adStrength?.lordedHouses ?? []).filter(h => GAIN_HOUSES.includes(h));

  if (stance === 'consolidate') {
    // Two different reasons produce a consolidating stance, and they need
    // different advice: separative lords subtract, whereas a merely obstructed
    // pair is about timing rather than loss.
    const separativeNote = separatives.length
      ? `${separatives.length === 2 ? `Both ${md} and ${ad} are` : `${separatives[0]} is`} separative by nature — ` +
        `subtracting rather than adding. `
      : '';
    return {
      headline: 'Consolidation, not accumulation',
      body:
        `${md}–${ad} does not favour acquisition (${j.score}/10 on the classical reading). ${separativeNote}` +
        `Pushing for raw gain against this current usually produces frustration and forced losses.` +
        dispositionClause(md, ad, j) +
        ` The intelligent definition of profit here is consolidation and positioning: you bank ground now ` +
        `that pays out in the next period. This is where you clear the field and plant, not where you harvest.`,
    };
  }

  if (stance === 'accumulate') {
    const houseNote = gainHouses.length
      ? ` ${ad} rules your ${housePhrase(gainHouses)}, so the gain lands there specifically.`
      : '';
    return {
      headline: 'Acquisition is supported — press the advantage',
      body:
        `${md}–${ad} runs with the current rather than against it (${j.score}/10 on the classical reading).` +
        dispositionClause(md, ad, j) +
        `${houseNote} This is a period to commit rather than hedge. The risk here is not loss but under-use: ` +
        `periods like this close, and what you did not start during them becomes considerably harder afterwards.`,
    };
  }

  return {
    headline: 'Mixed current — selectivity beats volume',
    body:
      `${md}–${ad} pulls in two directions (${j.score}/10 on the classical reading): parts of it genuinely ` +
      `support acquisition and parts of it subtract.` +
      dispositionClause(md, ad, j) +
      ` Blanket optimism and blanket caution are both wrong here. The usable strategy is selectivity — ` +
      `concentrate decisive moves inside the supported windows below, and treat the heavy windows as ` +
      `defensive ground where the profit is what you avoid losing.`,
  };
}

// ─── Window classification ──────────────────────────────────────────────────

function actionReason(w: WeightedWindow, s: PlanetStrength | null): string {
  const bits: string[] = [];
  if (s?.dignity && DIGNITY_PHRASE[s.dignity]) {
    bits.push(`${w.lord} is ${DIGNITY_PHRASE[s.dignity]} natally`);
  }
  if (s?.functionalNature === 'yogakaraka') {
    bits.push(`it is your yogakaraka`);
  }
  // Only the houses that actually argue for acting — a dusthana lordship is
  // not a reason to commit, so it stays out of the case for the window.
  const supportive = (s?.lordedHouses ?? []).filter(h => ![6, 8, 12].includes(h));
  if (supportive.length) {
    bits.push(`it rules your ${housePhrase(supportive)}`);
  }
  if (!bits.length) {
    bits.push(`${w.lord} runs without natal affliction here`);
  }
  return `${bits.join(', and ')} — act through this window: finalise decisions, sign what needs signing, ship what you have built.`;
}

function defensiveReason(w: WeightedWindow): string {
  const sep = SEPARATIVE.has(w.lord);
  return sep
    ? `${w.lord} subtracts rather than adds. The gain available is real but defensive: cut dead weight, exit ` +
      `obligations that no longer earn their keep, clean up finances, close commitments that leak time or money. ` +
      `What you stop losing is this window's profit.`
    : `Several layers converge here at once, so events land harder than the calendar suggests. Hold reserves, ` +
      `avoid irreversible commitments, and let the window pass before re-committing capital or credibility.`;
}

/** What deep work actually looks like under each of the long-form lords. */
const DEEP_WORK_FOCUS: Record<string, string> = {
  Saturn: 'sustained, unglamorous mastery — the hard problem you keep deferring, structured and finished',
  Ketu: 'research, investigation, and specialisation to the point where you are the person who knows',
  Mercury: 'writing, systems, documentation, and anything that turns know-how into a transferable asset',
  Jupiter: 'teaching, advisory depth, and formalising what you know into something others can be charged for',
};

function buildReason(w: WeightedWindow): string {
  const focus = DEEP_WORK_FOCUS[w.lord];
  return `A long ${w.lord} window suits deep, solitary work${focus ? `: ${focus}` : ''}. ` +
    `${w.lord === 'Ketu' ? 'Ketu makes you a specialist' : 'This is where specialisation forms'}, and anything you go ` +
    `deep on now compounds into the next period. It is the most reliable profit the stretch offers.`;
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

function deriveProtect(md: string, ad: string, stance: Stance): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const lord of [md, ad]) {
    const diseases = (PLANET_SIGNIFICATIONS[lord]?.diseases as string[] | undefined) ?? [];
    const area = diseases.slice(0, 2).join(' and ');
    if (area && !seen.has(lord)) {
      seen.add(lord);
      out.push(`${lord} taxes ${area} — treat sleep, movement and routine as productivity infrastructure, not luxuries.`);
    }
  }
  if (SEPARATIVE.has(md) || SEPARATIVE.has(ad)) {
    out.push('Do not make impulsive severances in frustration — cutting under pressure is the characteristic failure mode of separative periods, and it usually cuts the wrong thing.');
  }
  if (stance !== 'accumulate') {
    out.push('Keep reserves liquid and avoid over-leverage. Avoided losses are this period\'s clearest profit.');
  }
  return out;
}

// ─── Next-period harvest ────────────────────────────────────────────────────

function deriveHarvest(input: StrategyInput, stance: Stance): PeriodStrategy['nextHarvest'] {
  const next = input.nextAntardasha;
  if (!next) return null;
  const s = input.strengthOf(next.lord);
  const houses = s?.lordedHouses ?? [];
  const gainHouses = houses.filter(h => GAIN_HOUSES.includes(h));

  const note = gainHouses.length
    ? `${next.lord} rules your ${housePhrase(gainHouses)} — that is the window the current period is positioning toward. ` +
      `Ground banked now converts there.`
    : houses.length
      ? `${next.lord} rules your ${housePhrase(houses)}, so the emphasis shifts to those areas from ${shortDate(next.start)}.`
      : `${input.mahadashaLord}–${next.lord} opens on ${shortDate(next.start)} and takes over the theme from there.`;

  return {
    lord: next.lord,
    start: ISO(next.start),
    end: ISO(next.end),
    note: stance === 'consolidate' ? `${note} Position now; win there.` : note,
  };
}

// ─── Main ───────────────────────────────────────────────────────────────────

export function buildPeriodStrategy(input: StrategyInput): PeriodStrategy {
  const { mahadashaLord: md, antardashaLord: ad, periods, judgement } = input;
  const stance = deriveStance(judgement);
  const { headline, body } = stanceProse(stance, md, ad, input);

  const byWeight = [...periods].sort((a, b) => b.weight - a.weight);
  const peakList = byWeight.slice(0, 3).sort((a, b) => a.start.getTime() - b.start.getTime());
  const peaks = peakList.length
    ? `Force concentrates in ${peakList
        .map(p => `${md}–${ad}–${p.lord} (${shortDate(p.start)} – ${shortDate(p.end)})`)
        .join(', ')}. Those are the windows to plan around; the rest of the period runs quieter than its reputation.`
    : '';

  const actionWindows = periods
    .filter(p => {
      const s = input.strengthOf(p.lord);
      return p.tone === 'constructive' || (s != null && s.total >= 0.75);
    })
    .sort((a, b) => (input.strengthOf(b.lord)?.total ?? 0) - (input.strengthOf(a.lord)?.total ?? 0))
    .slice(0, 3)
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .map(p => toWindow(p, actionReason(p, input.strengthOf(p.lord))));

  const defensiveWindows = periods
    .filter(p => (p.band === 'heavy' || p.band === 'strong') && p.tone !== 'constructive')
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 4)
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .map(p => toWindow(p, defensiveReason(p)));

  const actionLords = new Set(actionWindows.map(w => w.lord));
  const buildWindows = periods
    .filter(p => DEEP_WORK.has(p.lord) && p.days >= 25 && !actionLords.has(p.lord))
    .sort((a, b) => b.days - a.days)
    .slice(0, 2)
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .map(p => toWindow(p, buildReason(p)));

  const nextHarvest = deriveHarvest(input, stance);

  const firstAction = actionWindows[0];
  const oneLine =
    stance === 'consolidate' && nextHarvest
      ? `Don't try to win inside ${md}–${ad} — position here so you win when ${md}–${nextHarvest.lord} opens your ${
          input.strengthOf(nextHarvest.lord)?.lordedHouses.filter(h => GAIN_HOUSES.includes(h)).map(ordinal).join(' and ') || 'next'
        } house.`
      : stance === 'accumulate'
        ? `${md}–${ad} converts effort into result — commit early, and use ${firstAction ? `the ${firstAction.lord} window` : 'the supported windows'} for anything irreversible.`
        : `Be selective inside ${md}–${ad}: act decisively in the supported windows, hold ground in the heavy ones, and let the rest pass.`;

  return {
    stance,
    judgement,
    stanceHeadline: headline,
    stanceBody: body,
    peaks,
    actionWindows,
    defensiveWindows,
    buildWindows,
    protect: deriveProtect(md, ad, stance),
    nextHarvest,
    oneLine,
  };
}
