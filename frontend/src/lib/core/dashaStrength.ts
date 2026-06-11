/**
 * Chart-aware strength assessment for dasha lords ("Vimsopaka-lite").
 *
 * Combines the classical factors that most strongly modulate how a dasha
 * lord delivers its results:
 *
 *   • Dignity        — exalted / own / friend / neutral / enemy / debilitated
 *   • Neecha Bhanga  — cancellation of debilitation (dispositor in kendra)
 *   • Functional nature — yogakaraka / benefic / malefic from house lordship
 *   • Natal house    — kendra / trikona / dusthana placement
 *   • Combustion     — proximity to the Sun dims a planet's significations
 *   • Retrogression  — chesta bala strength, but delayed / revised results
 *
 * Each factor contributes a numeric modifier plus a human-readable note.
 * The total (clamped to ±2.5) is folded into the prediction engine's
 * per-area scores so two people in the same dasha get different predictions
 * based on their actual charts.
 */

import { getDignity, RASHI_LORDS, type DignityLevel } from './planetaryAnalysis';
import { RASHIS } from './rashi';

export type FunctionalNature = 'yogakaraka' | 'functional-benefic' | 'neutral' | 'functional-malefic';

export interface StrengthInput {
  /** Natal rashi (0–11) per planet, keyed Sun/Moon/.../Ketu. */
  planetRashis?: Record<string, number>;
  /** Sidereal longitude (0–360) per planet — enables combustion detection. */
  planetLongitudes?: Record<string, number>;
  /** Natal retrograde flags per planet. */
  planetRetro?: Record<string, boolean>;
  /** Whole-sign natal house (1–12) per planet. */
  planetHouses?: Record<string, number>;
  /** Ascendant rashi (0–11). */
  ascendantRashi?: number;
  /** Natal Moon rashi (0–11) — used for neecha bhanga. */
  moonRashi?: number;
}

export interface PlanetStrength {
  planet: string;
  dignity: DignityLevel | null;
  dignityMod: number;
  neechaBhanga: boolean;
  isCombust: boolean;
  combustMod: number;
  isRetrograde: boolean;
  retroMod: number;
  natalHouse: number | null;
  houseMod: number;
  lordedHouses: number[];
  functionalNature: FunctionalNature | null;
  functionalMod: number;
  /** Sum of all modifiers, clamped to [−2.5, +2.5]. */
  total: number;
  /** Human-readable factor notes for surfacing in predictions. */
  notes: string[];
}

// ─── Dignity ────────────────────────────────────────────────────────────────

const DIGNITY_MODS: Record<DignityLevel, number> = {
  'exalted':      2.0,
  'own-sign':     1.5,
  'friend-sign':  0.75,
  'neutral-sign': 0,
  'enemy-sign':  -1.0,
  'debilitated': -2.0,
};

// ─── Combustion orbs (degrees from the Sun, classical values) ──────────────

const COMBUSTION_ORBS: Record<string, { direct: number; retro: number }> = {
  Moon:    { direct: 12, retro: 12 },
  Mars:    { direct: 17, retro: 17 },
  Mercury: { direct: 14, retro: 12 },
  Jupiter: { direct: 11, retro: 11 },
  Venus:   { direct: 10, retro: 8  },
  Saturn:  { direct: 15, retro: 15 },
};

function angularSeparation(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

// ─── House placement quality ───────────────────────────────────────────────

const HOUSE_MODS: Record<number, number> = {
  1: 0.5, 2: 0.25, 3: 0.25, 4: 0.5, 5: 1.0, 6: -0.5,
  7: 0.5, 8: -1.0, 9: 1.0, 10: 0.75, 11: 0.5, 12: -0.75,
};

const KENDRAS = [4, 7, 10];   // excluding 1; lagna lordship handled separately
const TRIKONAS = [5, 9];      // excluding 1

// ─── House lordship / functional nature ────────────────────────────────────

/** Houses (1–12) ruled by `planet` for the given ascendant rashi. */
export function lordedHousesFor(planet: string, ascendantRashi: number): number[] {
  const houses: number[] = [];
  for (let h = 1; h <= 12; h++) {
    const rashi = (ascendantRashi + h - 1) % 12;
    if (RASHI_LORDS[rashi] === planet) houses.push(h);
  }
  return houses;
}

/**
 * Functional nature of a planet for a given lagna, per the classical
 * kendra-trikona lordship rules (BPHS Ch. 34). Rahu/Ketu rule no signs
 * and return 'neutral'.
 */
export function functionalNatureFor(planet: string, ascendantRashi: number): FunctionalNature {
  const lords = lordedHousesFor(planet, ascendantRashi);
  if (lords.length === 0) return 'neutral';

  const lordsKendra = lords.some(h => KENDRAS.includes(h));
  const lordsTrikona = lords.some(h => TRIKONAS.includes(h));
  const lordsLagna = lords.includes(1);
  const lordsDusthana = lords.some(h => [6, 8, 12].includes(h));

  if (lordsKendra && lordsTrikona) return 'yogakaraka';
  if (lordsTrikona || lordsLagna) return 'functional-benefic';
  if (lordsDusthana) return 'functional-malefic';
  return 'neutral';
}

const FUNCTIONAL_MODS: Record<FunctionalNature, number> = {
  'yogakaraka':         1.25,
  'functional-benefic': 0.75,
  'neutral':            0,
  'functional-malefic': -0.75,
};

// ─── Neecha Bhanga (cancellation of debilitation, simplified) ──────────────

function hasNeechaBhanga(planet: string, input: StrengthInput): boolean {
  const rashis = input.planetRashis;
  if (!rashis) return false;
  const planetRashi = rashis[planet];
  if (planetRashi == null) return false;

  const dispositor = RASHI_LORDS[planetRashi];
  const dispositorRashi = rashis[dispositor];
  if (dispositorRashi == null) return false;

  const inKendraFrom = (refRashi: number | undefined): boolean => {
    if (refRashi == null) return false;
    const house = ((dispositorRashi - refRashi + 12) % 12) + 1;
    return [1, 4, 7, 10].includes(house);
  };

  return inKendraFrom(input.ascendantRashi) || inKendraFrom(input.moonRashi);
}

// ─── Main assessment ────────────────────────────────────────────────────────

const ORDINAL = (n: number): string => {
  const v = n % 100;
  if (v >= 11 && v <= 13) return `${n}th`;
  switch (n % 10) {
    case 1: return `${n}st`;
    case 2: return `${n}nd`;
    case 3: return `${n}rd`;
    default: return `${n}th`;
  }
};

export function assessPlanetStrength(planet: string, input: StrengthInput): PlanetStrength {
  const notes: string[] = [];

  // ── Dignity ──
  let dignity: DignityLevel | null = null;
  let dignityMod = 0;
  let neechaBhanga = false;
  const rashi = input.planetRashis?.[planet];
  if (rashi != null) {
    dignity = getDignity(planet, rashi);
    dignityMod = DIGNITY_MODS[dignity];
    if (dignity === 'debilitated') {
      neechaBhanga = hasNeechaBhanga(planet, input);
      if (neechaBhanga) {
        dignityMod = 0.5; // cancellation turns weakness into latent strength
        notes.push(`${planet} is debilitated in ${RASHIS[rashi]} but Neecha Bhanga (cancellation) applies — early struggles in its periods transform into unusual strength.`);
      } else {
        notes.push(`${planet} is debilitated in ${RASHIS[rashi]} natally — its significations need conscious effort and remedial support during this period.`);
      }
    } else if (dignity === 'exalted') {
      notes.push(`${planet} is exalted in ${RASHIS[rashi]} natally — it delivers results at near-peak capacity during its periods.`);
    } else if (dignity === 'own-sign') {
      notes.push(`${planet} occupies its own sign (${RASHIS[rashi]}) natally — stable, reliable results throughout this period.`);
    } else if (dignity === 'enemy-sign') {
      notes.push(`${planet} sits in an enemy's sign (${RASHIS[rashi]}) natally — results come with friction and require persistence.`);
    }
  }

  // ── Combustion ──
  let isCombust = false;
  let combustMod = 0;
  const lons = input.planetLongitudes;
  if (lons && planet !== 'Sun' && planet !== 'Rahu' && planet !== 'Ketu') {
    const sunLon = lons['Sun'];
    const pLon = lons[planet];
    const orb = COMBUSTION_ORBS[planet];
    if (sunLon != null && pLon != null && orb) {
      const sep = angularSeparation(sunLon, pLon);
      const limit = input.planetRetro?.[planet] ? orb.retro : orb.direct;
      if (sep <= limit) {
        isCombust = true;
        combustMod = -1.0;
        notes.push(`${planet} is combust (within ${Math.round(sep)}° of the Sun) natally — its outward expression is dimmed; inner development of its themes matters more than external results.`);
      }
    }
  }

  // ── Retrogression ──
  const isRetrograde = input.planetRetro?.[planet] ?? false;
  let retroMod = 0;
  if (isRetrograde && planet !== 'Rahu' && planet !== 'Ketu') {
    retroMod = 0.25; // chesta bala — retrograde planets are strong but indirect
    notes.push(`${planet} is retrograde natally — strong (chesta bala) but its results arrive through revision, delay, or second attempts.`);
  }

  // ── Natal house placement ──
  const natalHouse = input.planetHouses?.[planet] ?? null;
  const houseMod = natalHouse ? (HOUSE_MODS[natalHouse] ?? 0) : 0;

  // ── Functional nature from lagna ──
  let lordedHouses: number[] = [];
  let functionalNature: FunctionalNature | null = null;
  let functionalMod = 0;
  if (input.ascendantRashi != null) {
    lordedHouses = lordedHousesFor(planet, input.ascendantRashi);
    functionalNature = functionalNatureFor(planet, input.ascendantRashi);
    functionalMod = FUNCTIONAL_MODS[functionalNature];
    if (functionalNature === 'yogakaraka') {
      notes.push(`${planet} is the yogakaraka for your ascendant (rules both a kendra and a trikona: ${lordedHouses.map(ORDINAL).join(' & ')} houses) — its periods are among the most productive of your life.`);
    } else if (functionalNature === 'functional-malefic' && lordedHouses.length) {
      notes.push(`${planet} rules your ${lordedHouses.map(ORDINAL).join(' & ')} house${lordedHouses.length > 1 ? 's' : ''} — challenging house lordship means its period tests before it rewards.`);
    }
  }

  const raw = dignityMod + combustMod + retroMod + houseMod + functionalMod;
  const total = Math.max(-2.5, Math.min(2.5, raw));

  return {
    planet,
    dignity, dignityMod, neechaBhanga,
    isCombust, combustMod,
    isRetrograde, retroMod,
    natalHouse, houseMod,
    lordedHouses, functionalNature, functionalMod,
    total, notes,
  };
}
