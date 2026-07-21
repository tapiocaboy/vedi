/**
 * Sub-period "weight" — how much of the chart points at the same theme at once.
 *
 * Weight is not vague heaviness. A sub-period carries weight when several
 * independent layers stack on the same signification:
 *
 *   1. Repetition across dasha levels — the pratyantar lord is also the
 *      antardasha or mahadasha lord, so one planet speaks at two or three
 *      levels and its signification compounds.
 *   2. Nodal activation — a node runs the sub-period, and more so when its
 *      partner holds one of the levels above it (the whole axis lights up).
 *   3. Transit reinforcement — a slow planet strikes a sensitive natal point,
 *      changes sign, or stations inside the window.
 *   4. Natal condition of the sub-lord — a decisively strong or decisively
 *      afflicted sub-lord both raise weight; they differ in *tone*, not force.
 *   5. The classical pair effect of the antardasha–pratyantardasha combination.
 *
 * `weight` (0–10) answers "how loud", `tone` answers "in which direction".
 */

import type { PlanetStrength } from './dashaStrength';
import { pairRatingMod, PLANET_SIGNIFICATIONS } from './predictions';
import { hitsWithin, type TransitHit } from './dashaTransits';

export type WeightBand = 'heavy' | 'strong' | 'moderate' | 'light';
export type PeriodTone = 'constructive' | 'testing' | 'mixed';

export type WeightFactorKind =
  | 'repetition'
  | 'nodal'
  | 'transit'
  | 'strength'
  | 'pair';

export interface WeightFactor {
  kind: WeightFactorKind;
  label: string;
  detail: string;
  /** Contribution to the weight score. */
  points: number;
}

export interface WeightAssessment {
  /** 0–10; how many layers converge on this window. */
  weight: number;
  band: WeightBand;
  tone: PeriodTone;
  factors: WeightFactor[];
}

/** The nodes, which are separative by nature and always raise weight. */
const NODES = new Set(['Rahu', 'Ketu']);

/** Planets whose periods subtract before they add. */
export const SEPARATIVE = new Set(['Saturn', 'Rahu', 'Ketu']);

function partnerNode(lord: string): string | null {
  if (lord === 'Rahu') return 'Ketu';
  if (lord === 'Ketu') return 'Rahu';
  return null;
}

function bandFor(weight: number): WeightBand {
  if (weight >= 7) return 'heavy';
  if (weight >= 5) return 'strong';
  if (weight >= 3.5) return 'moderate';
  return 'light';
}

/** How much a single transit hit adds, before the per-window cap. */
function transitPoints(hit: TransitHit, hotTargets: Set<string>): number {
  switch (hit.kind) {
    case 'conjunction':
      return hit.target && hotTargets.has(hit.target) ? 1.4 : 0.7;
    case 'opposition':
      return hit.target && hotTargets.has(hit.target) ? 0.9 : 0.45;
    case 'ingress':
      return hit.transiting === 'Saturn' ? 0.8 : 0.5;
    case 'station-retrograde':
    case 'station-direct':
      return hit.transiting === 'Saturn' ? 0.7 : 0.4;
    default:
      return 0;
  }
}

export interface WeightInput {
  mahadashaLord: string;
  antardashaLord: string;
  pratyantarLord: string;
  start: Date;
  end: Date;
  /** Natal condition of the pratyantar lord, if the chart is available. */
  subLordStrength: PlanetStrength | null;
  /** All transit hits for the enclosing antardasha window. */
  transitHits: TransitHit[];
  /**
   * Natal points whose activation matters most for this dasha — typically the
   * natal positions of the mahadasha, antardasha and pratyantar lords plus the
   * luminaries and lagna.
   */
  hotTargets: Set<string>;
}

export function assessWeight(input: WeightInput): WeightAssessment & { transitHits: TransitHit[] } {
  const { mahadashaLord: md, antardashaLord: ad, pratyantarLord: pd } = input;
  const factors: WeightFactor[] = [];

  // Every sub-period carries some baseline presence.
  let weight = 1.8;

  // ── 1. Repetition across levels ──
  const repeatsAd = pd === ad;
  const repeatsMd = pd === md;
  if (repeatsAd && repeatsMd) {
    const points = 4.0;
    weight += points;
    factors.push({
      kind: 'repetition',
      label: 'Tripled lord',
      detail: `${pd} holds all three levels — mahadasha, antardasha and pratyantardasha. Its signification is at maximum concentration; nothing else dilutes it.`,
      points,
    });
  } else if (repeatsAd) {
    const points = 2.5;
    weight += points;
    factors.push({
      kind: 'repetition',
      label: 'Doubled sub-lord',
      detail: `${pd} runs both the antardasha and the pratyantardasha. The same planet speaking at two levels compounds rather than blends — this is the opening jolt of the ${ad} period.`,
      points,
    });
  } else if (repeatsMd) {
    const points = 2.0;
    weight += points;
    factors.push({
      kind: 'repetition',
      label: 'Mahadasha lord returns',
      detail: `${pd} also rules the mahadasha, so the whole ${md} arc reasserts itself briefly inside the ${ad} sub-period.`,
      points,
    });
  }

  // ── 2. Nodal activation ──
  if (NODES.has(pd)) {
    const partner = partnerNode(pd)!;
    const axisLit = ad === partner || md === partner;
    const points = axisLit ? 1.6 : 0.8;
    weight += points;
    factors.push({
      kind: 'nodal',
      label: axisLit ? 'Full nodal axis' : 'Nodal sub-period',
      detail: axisLit
        ? `${pd} runs the sub-period while ${partner} holds a level above it — the entire nodal axis is lit. Events feel fated and arrive from outside your control.`
        : `${pd} is a shadow planet: separative, sudden, and indifferent to plans. Its windows subtract before they add.`,
      points,
    });
  }

  // ── 3. Transit reinforcement ──
  const windowHits = hitsWithin(input.transitHits, input.start, input.end);
  if (windowHits.length) {
    const raw = windowHits.reduce((sum, h) => sum + transitPoints(h, input.hotTargets), 0);
    const points = Math.min(3, raw);
    weight += points;
    factors.push({
      kind: 'transit',
      label: windowHits.length === 1 ? 'Transit reinforcement' : `${windowHits.length} transit events`,
      detail: windowHits.slice(0, 3).map(h => h.detail).join('; ') +
        (windowHits.length > 3 ? `; and ${windowHits.length - 3} more` : '') + '.',
      points,
    });
  }

  // ── 4. Natal condition of the sub-lord ──
  const strength = input.subLordStrength;
  if (strength && Math.abs(strength.total) >= 0.5) {
    const points = Math.abs(strength.total) * 0.5;
    weight += points;
    const strong = strength.total > 0;
    factors.push({
      kind: 'strength',
      label: strong ? 'Dignified sub-lord' : 'Afflicted sub-lord',
      detail: strength.notes[0] ??
        (strong
          ? `${pd} is well placed natally, so it delivers cleanly rather than through friction.`
          : `${pd} is under natal pressure, so its window asks for effort before it concedes results.`),
      points,
    });
  }

  // ── 5. Classical pair effect of the AD–PD combination ──
  const pairMod = pairRatingMod(ad, pd);
  if (pairMod !== 0) {
    const points = Math.abs(pairMod) * 0.5;
    weight += points;
    factors.push({
      kind: 'pair',
      label: pairMod > 0 ? 'Supportive combination' : 'Difficult combination',
      detail: `The classical ${ad}–${pd} combination reads ${pairMod > 0 ? 'favourably' : 'as a stress point'} (${pairMod > 0 ? '+' : ''}${pairMod} to the period rating).`,
      points,
    });
  }

  weight = Math.min(10, Math.round(weight * 10) / 10);

  // ── Tone: which direction the weight pushes ──
  const nature = (PLANET_SIGNIFICATIONS[pd]?.nature as string) ?? 'neutral';
  let toneScore = pairMod + (strength?.total ?? 0);
  if (nature === 'benefic') toneScore += 0.5;
  else if (nature === 'malefic') toneScore -= 0.5;
  if (SEPARATIVE.has(pd)) toneScore -= 0.5;
  if (repeatsAd || repeatsMd) toneScore *= 1.25; // repetition amplifies whichever way it leans

  const tone: PeriodTone =
    toneScore >= 0.75 ? 'constructive' : toneScore <= -0.75 ? 'testing' : 'mixed';

  return { weight, band: bandFor(weight), tone, factors, transitHits: windowHits };
}

/** One-line reason this window ranks where it does, for compact UI rows. */
export function weightHeadline(a: WeightAssessment, lord: string): string {
  const top = [...a.factors].sort((x, y) => y.points - x.points)[0];
  if (!top) return `${lord} runs quietly — no layer of the chart singles this window out.`;
  return top.detail;
}
