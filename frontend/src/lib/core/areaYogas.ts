/**
 * Classical combinations (yogas) mapped onto the four life areas.
 *
 * A yoga is a statement about a *set* of placements that none of those
 * placements makes on its own. The foundation layer scores each bhava, bhavesha
 * and karaka separately, so a chart whose wealth rests on a recognised dhana
 * combination gets described purely by the individual weaknesses of the planets
 * involved — a debilitated occupant here, a combust lord there — and reads as a
 * deficit when the classical verdict is the opposite.
 *
 * This module is the missing layer. It runs the yoga detector, decides which
 * areas each result bears on, and hands back a bounded per-area modifier so a
 * chart with many yogas is lifted but not launched.
 *
 * Areas are assigned two ways:
 *
 *   • by category, where the category fixes the meaning — a dhana yoga is about
 *     wealth wherever its houses happen to fall, a mahapurusha yoga is about
 *     standing and profession. When a category pins the area like this, it is
 *     the *only* route: a dhana yoga that happens to involve the 1st house is
 *     still not a statement about health.
 *   • by houses involved, for the categories that carry no fixed area of their
 *     own, at reduced weight since the link is structural rather than definitional.
 */

import { YogaCalculator, type YogaResult, type YogaRefinements } from './yogas';
import type { LifeArea } from './natalFoundation';

/** The houses that define each area — kept in step with natalFoundation's AREA_SPEC. */
const AREA_HOUSES: Record<LifeArea, number[]> = {
  career: [10, 6],
  wealth: [2, 11],
  relationship: [7, 5],
  health: [1, 6],
};

/** Areas a yoga category is about by definition, regardless of houses. */
const CATEGORY_AREAS: Record<YogaResult['category'], LifeArea[]> = {
  dhana: ['wealth'],
  daridra: ['wealth'],
  mahapurusha: ['career'],
  rajayoga: ['career'],
  spiritual: [],
  special: [],
};

/** Categories whose presence *subtracts* — the poverty / affliction combinations. */
const NEGATIVE_CATEGORIES = new Set<YogaResult['category']>(['daridra']);

/**
 * Yogas that pay out through adversity rather than in spite of it. Neecha
 * Bhanga and Viparita Rajayoga both promise a rise, but a rise reached late and
 * by way of crisis — scoring them like an ordinary asset makes a hard chart read
 * as a comfortable one, so they carry a fraction of the weight and say why.
 */
const DEFERRED_YOGAS = new Set(['Neecha Bhanga Rajayoga', 'Viparita Rajayoga']);

/**
 * Points at full strength (score 10), by how the match was made.
 *
 * Deliberately modest. The bhava / bhavesha / karaka triad is the primary
 * instrument; this layer exists to correct for the specific thing that triad
 * cannot see, and a yoga bonus large enough to swamp it would replace one
 * blindness with another.
 */
const WEIGHT_BY_DEFINITION = 0.7;
const WEIGHT_BY_HOUSE = 0.35;
const WEIGHT_DEFERRED = 0.25;

/** Ceiling on the total yoga contribution to one area, either direction. */
const AREA_CAP = 0.9;

/**
 * A yoga is only as good as the planets forming it. The detectors work on
 * whole-sign geometry, so a raja yoga built from a combust lord and a
 * debilitated one scores identically to a pristine version of itself unless the
 * condition of its members is applied afterwards.
 */
const COMBUST_DISCOUNT = 0.85;
const DEBILITATED_DISCOUNT = 0.7;

export interface AreaYoga {
  name: string;
  /** The yoga's classical identity — several detected instances share one kind. */
  kind: string;
  planets: string[];
  /** Signed points this yoga contributes to the area. */
  points: number;
  /** True when the match came from the yoga's category rather than its houses. */
  byDefinition: boolean;
  /** True for the adversity-mediated yogas — the gain is real but late. */
  deferred: boolean;
}

export interface AreaYogaResult {
  /** Bounded signed modifier for the area. */
  points: number;
  /** The contributing yogas, strongest first. */
  yogas: AreaYoga[];
}

export interface AreaYogaInput {
  /** Natal rashi (0–11) per planet, keyed as Sun/Moon/… (title case). */
  planetRashis: Record<string, number>;
  ascendantRashi: number;
  planetLongitudes?: Record<string, number>;
  planetRetro?: Record<string, boolean>;
}

const upper = (o: Record<string, number | boolean>) =>
  Object.fromEntries(Object.entries(o).map(([k, v]) => [k.toUpperCase(), v]));

/**
 * Per-area yoga modifiers for a chart. Returns null when the detector cannot
 * run, so callers can distinguish "no yogas" from "not assessed".
 */
export function areaYogas(input: AreaYogaInput): Record<LifeArea, AreaYogaResult> | null {
  const { planetRashis, ascendantRashi } = input;
  if (!planetRashis || ascendantRashi == null) return null;

  const refinements: YogaRefinements = {
    longitudes: input.planetLongitudes ? (upper(input.planetLongitudes) as Record<string, number>) : undefined,
    retro: input.planetRetro ? (upper(input.planetRetro) as Record<string, boolean>) : undefined,
  };
  const calc = new YogaCalculator(
    upper(planetRashis) as Record<string, number>,
    ascendantRashi,
    refinements,
  );
  const detected = calc.detectAllYogas();

  /** Multiplier for the condition of the planets forming a yoga. */
  const conditionFactor = (planets: string[]): number => planets.reduce((f, p) => {
    const c = calc.planetCondition(p);
    return f * (c.debilitated ? DEBILITATED_DISCOUNT : 1) * (c.combust ? COMBUST_DISCOUNT : 1);
  }, 1);

  const out = {} as Record<LifeArea, AreaYogaResult>;
  for (const area of Object.keys(AREA_HOUSES) as LifeArea[]) {
    const houses = AREA_HOUSES[area];
    const yogas: AreaYoga[] = [];

    for (const y of detected) {
      const pinned = CATEGORY_AREAS[y.category];
      // A category that fixes the meaning is the only route in. Falling through
      // to house matching here is what lets a Dhana Yoga involving the 1st house
      // register as a statement about health.
      const byDefinition = pinned.includes(area);
      if (pinned.length > 0 ? !byDefinition : !y.housesInvolved.some(h => houses.includes(h))) continue;

      const deferred = DEFERRED_YOGAS.has(y.sanskritName);
      const weight = deferred ? WEIGHT_DEFERRED : byDefinition ? WEIGHT_BY_DEFINITION : WEIGHT_BY_HOUSE;
      const magnitude = (y.strengthScore / 10) * weight * conditionFactor(y.planetsInvolved);
      yogas.push({
        name: y.name,
        kind: y.sanskritName,
        planets: y.planetsInvolved,
        points: NEGATIVE_CATEGORIES.has(y.category) ? -magnitude : magnitude,
        byDefinition,
        deferred,
      });
    }

    yogas.sort((a, b) => Math.abs(b.points) - Math.abs(a.points));

    // One structural fact, counted once. The detectors report a separate result
    // per qualifying pair, so a single planet bridging an angle and a trine can
    // yield three Kendra-Trikona Rajayogas, and four wealth-house lords in one
    // arrangement four Dhana Yogas. Summing those multiplies one arrangement into
    // several — so only the strongest instance of each *kind* is scored, while
    // every instance is still returned for display.
    const strongestOfKind = new Map<string, AreaYoga>();
    for (const y of yogas) {
      if (!strongestOfKind.has(y.kind)) strongestOfKind.set(y.kind, y);
    }

    // Diminishing returns on top of that: the strongest kind counts in full, each
    // further kind for half as much again.
    let total = 0;
    [...strongestOfKind.values()].forEach((y, i) => { total += y.points / 2 ** i; });
    out[area] = { points: Math.max(-AREA_CAP, Math.min(AREA_CAP, total)), yogas };
  }
  return out;
}
