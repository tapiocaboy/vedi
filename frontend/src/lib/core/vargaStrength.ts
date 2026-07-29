/**
 * Cross-varga strength — Vimsopaka Bala (BPHS Ch. 8) plus vargottama.
 *
 * Every divisional chart in this app is currently read in isolation: the D9 card
 * describes marriage, the D10 card describes career, and nothing asks the one
 * question the vargas exist to answer — *which planet actually holds this chart
 * together?* A planet can look unremarkable in D1 and yet be dignified in varga
 * after varga, which is the classical signature of a life whose real engine is
 * not the one the rashi chart advertises. Read chart by chart, that pattern is
 * invisible; it only shows up when the vargas are scored together.
 *
 * Vimsopaka Bala is the classical instrument for exactly this. Each varga in the
 * scheme carries a fixed weight; a planet earns a fraction of each weight
 * according to its dignity there, and the total is its cross-varga standing.
 * This module uses the Shadvarga scheme (six divisions, weights summing to 20),
 * which is the scheme whose vargas this app already computes in full.
 *
 * Vargottama — the same sign in D1 and D9 — is reported alongside it. Its
 * *absence* is a finding too: a chart with no vargottama planet has less
 * lock-in everywhere, and reconfigures more across a life than one that has it.
 */

import { RASHI_LORDS, getDignity, inMoolatrikona, type DignityLevel } from './planetaryAnalysis';
import type { VargaChart, VargaCode } from './vargas';
import { type Lang, planetName, joinAnd, rashiName } from './i18n';
import { VS_FRAMES } from './text/vargaStrengthText';

/**
 * Saptavarga weights (BPHS Ch. 8, Vimsopaka Bala). D1 counts most — a planet's
 * rashi placement is still the primary statement — and the seven weights sum to
 * 20, which is what makes the result a score out of 20. Saptavarga is used
 * rather than Shadvarga because it is the largest classical scheme every one of
 * whose divisions this app computes; the larger Dasavarga and Shodasavarga
 * schemes need D16 and D20, which it does not.
 */
const SAPTAVARGA: Array<{ code: 'D1' | VargaCode; weight: number }> = [
  { code: 'D1',  weight: 5 },
  { code: 'D2',  weight: 2 },
  { code: 'D3',  weight: 3 },
  { code: 'D7',  weight: 2.5 },
  { code: 'D9',  weight: 4.5 },
  { code: 'D12', weight: 2 },
  { code: 'D30', weight: 1 },
];

const TOTAL_WEIGHT = SAPTAVARGA.reduce((s, v) => s + v.weight, 0); // 20

/**
 * The vargas scanned for *consistency*, as opposed to weighted strength.
 *
 * This is deliberately not the Vimsopaka scheme. Vimsopaka is a strength score
 * and its classical weightings do not include D10, so a planet dignified across
 * the career chart, the marriage chart and the adversity chart can score
 * mid-table on it. Those four charts are the ones classical practice actually
 * leans on for life direction, and a planet holding its own across them is
 * making a structural statement that no single chart reveals — so they get a
 * separate, plainly-named count rather than being forced into the Vimsopaka
 * weights where they do not belong.
 */
const CONSISTENCY_VARGAS: Array<'D1' | VargaCode> = ['D1', 'D9', 'D10', 'D30'];

/** Fraction of a varga's weight earned at each dignity. */
const DIGNITY_FRACTION: Record<DignityLevel, number> = {
  'exalted':      1.0,
  'own-sign':     1.0,
  'friend-sign':  0.75,
  'neutral-sign': 0.5,
  'enemy-sign':   0.25,
  'debilitated':  0,
};

/** Dignities that count as "holding its own" in a varga. */
const PILLAR_DIGNITIES = new Set<DignityLevel>(['own-sign', 'exalted']);

/**
 * Dignified in this many of the four consistency vargas is the *repetition*
 * condition for a pillar. It is necessary and not sufficient — see below.
 */
const PILLAR_MIN_VARGAS = 3;

export type VimsopakaGrade = 'exceptional' | 'strong' | 'moderate' | 'weak';

export interface VargaPlanetStrength {
  planet: string;
  /** Vimsopaka Bala, 0–20 on the Saptavarga scheme. */
  vimsopaka: number;
  grade: VimsopakaGrade;
  /**
   * Which of D1 / D9 / D10 / D30 the planet holds own-sign or exaltation in.
   * Three or more is the backbone signature.
   */
  dignifiedIn: Array<'D1' | VargaCode>;
  /** Same sign in D1 and D9 — placements that are locked in. */
  isVargottama: boolean;
  /** Plain-language reading of this planet's cross-varga standing. */
  desc: string;
}

export interface VargaBackbone {
  /** Every graha, strongest cross-varga standing first. */
  planets: VargaPlanetStrength[];
  /** Planets dignified in PILLAR_MIN_VARGAS or more of the six vargas. */
  pillars: string[];
  /** Planets in the same sign in D1 and D9. */
  vargottama: string[];
  /**
   * The chart's structural reading: which planet the vargas resolve back to, and
   * what the presence or absence of vargottama means for how fixed it all is.
   */
  notes: string[];
  /**
   * Set when the D9 lagna lord is itself dignified — the navamsa's own ruler
   * holding up the navamsa is the single strongest varga-level statement a chart
   * can make, and it is what a per-chart reading never gets to say.
   */
  navamsaAnchor: { planet: string; dignity: DignityLevel; inNavamsaLagna: boolean } | null;
}

const GRADE_FOR = (v: number): VimsopakaGrade =>
  v >= 15 ? 'exceptional' : v >= 12 ? 'strong' : v >= 8 ? 'moderate' : 'weak';

export interface VargaStrengthInput {
  chart: VargaChart;
  /** Sidereal longitude per planet — needed for Moolatrikona in D1. */
  longitudes: Record<string, number>;
}

/**
 * Score every graha across the Shadvarga and describe what the set says.
 * `chart` must come from `computeVargas`, which supplies all six divisions.
 */
export function assessVargaBackbone(input: VargaStrengthInput, lang: Lang = 'en'): VargaBackbone {
  const { chart, longitudes } = input;

  /** Dignity of a planet in one varga, D1 included. */
  const dignityIn = (p: VargaChart['planets'][number], code: 'D1' | VargaCode): DignityLevel =>
    code === 'D1' ? getDignity(p.planet, p.d1Rashi) : p.divisions[code].dignity;

  const planets: VargaPlanetStrength[] = chart.planets.map(p => {
    let earned = 0;
    for (const { code, weight } of SAPTAVARGA) {
      const dignity = dignityIn(p, code);

      // Moolatrikona ranks between own-sign and exaltation, and both already
      // earn the full weight — so it only matters where it lifts a placement
      // that would otherwise score less. Only D1 has the degree needed for it.
      const lon = longitudes[p.planet];
      const moola = code === 'D1' && lon != null
        && inMoolatrikona(p.planet, p.d1Rashi, lon % 30, dignity);

      earned += weight * (moola ? 1.0 : DIGNITY_FRACTION[dignity]);
    }

    const dignifiedIn = CONSISTENCY_VARGAS.filter(code => PILLAR_DIGNITIES.has(dignityIn(p, code)));
    const vimsopaka = Math.round((earned / TOTAL_WEIGHT) * 20 * 100) / 100;
    const grade = GRADE_FOR(vimsopaka);
    return {
      planet: p.planet,
      vimsopaka,
      grade,
      dignifiedIn,
      isVargottama: p.isVargottama,
      desc: VS_FRAMES.planet({
        planet: planetName(p.planet, lang),
        vimsopaka: vimsopaka.toFixed(1),
        grade,
        dignifiedIn: dignifiedIn.map(String),
        isVargottama: p.isVargottama,
        lang,
      }),
    };
  }).sort((a, b) => b.vimsopaka - a.vimsopaka);

  // A pillar needs repetition *and* strength.
  //
  // Ranking on repetition alone is a real bug with a real symptom: a planet can
  // hold own sign in three minor divisions while scoring near the bottom on
  // Vimsopaka, and then gets announced as "this chart's structural pillar" in a
  // sentence that quotes its own low score two clauses later. Counting divisions
  // is a proxy for strength, and Vimsopaka is the measurement — so the proxy
  // cannot be allowed to overrule it.
  //
  // The median is the bar rather than a fixed score because Vimsopaka is only
  // meaningful within a chart: charts differ in overall level, and "strong here"
  // is a claim about this chart's own distribution.
  const sorted = [...planets].map(p => p.vimsopaka).sort((a, b) => a - b);
  const medianVimsopaka = sorted[Math.floor(sorted.length / 2)] ?? 0;

  const pillarPlanets = planets
    .filter(p => p.dignifiedIn.length >= PILLAR_MIN_VARGAS && p.vimsopaka >= medianVimsopaka)
    .sort((a, b) => b.vimsopaka - a.vimsopaka);
  const pillars = pillarPlanets.map(p => p.planet);

  // Repetition without strength is still worth reporting — it is a genuine
  // pattern — but as the narrower statement it actually is.
  const repeatersWithoutStrength = planets
    .filter(p => p.dignifiedIn.length >= PILLAR_MIN_VARGAS && p.vimsopaka < medianVimsopaka);

  const vargottama = planets.filter(p => p.isVargottama).map(p => p.planet);

  // The navamsa's own lord. When the D9 lagna lord is dignified in D9 — and
  // especially when it sits in the navamsa lagna itself — the whole varga
  // structure resolves back to that planet.
  const d9LagnaLord = RASHI_LORDS[chart.d9Ascendant];
  const d9LordCell = chart.planets.find(p => p.planet === d9LagnaLord);
  const navamsaAnchor = d9LordCell && (d9LordCell.d9Dignity === 'own-sign' || d9LordCell.d9Dignity === 'exalted')
    ? {
        planet: d9LagnaLord,
        dignity: d9LordCell.d9Dignity,
        inNavamsaLagna: d9LordCell.d9Rashi === chart.d9Ascendant,
      }
    : null;

  const notes: string[] = [];

  // The strongest planet by the measure leads, always. Whether it is also a
  // pillar is a refinement of that statement, never a replacement for it.
  const strongest = planets[0];
  if (pillarPlanets.length) {
    const top = pillarPlanets[0];
    notes.push(VS_FRAMES.pillar({
      planet: planetName(top.planet, lang),
      vargas: top.dignifiedIn.map(String),
      vimsopaka: top.vimsopaka.toFixed(1),
      lang,
    }));
  } else if (strongest) {
    notes.push(VS_FRAMES.strongest({
      planet: planetName(strongest.planet, lang),
      vimsopaka: strongest.vimsopaka.toFixed(1),
      grade: strongest.grade,
      vargottama: strongest.isVargottama,
      dignifiedIn: strongest.dignifiedIn.map(String),
      lang,
    }));
  }

  for (const r of repeatersWithoutStrength) {
    notes.push(VS_FRAMES.repetitionWithoutStrength({
      planet: planetName(r.planet, lang),
      vargas: r.dignifiedIn.map(String),
      vimsopaka: r.vimsopaka.toFixed(1),
      lang,
    }));
  }

  if (navamsaAnchor) {
    notes.push(VS_FRAMES.navamsaAnchor({
      planet: planetName(navamsaAnchor.planet, lang),
      navamsaLagna: rashiName(chart.d9Ascendant, lang),
      exalted: navamsaAnchor.dignity === 'exalted',
      inLagna: navamsaAnchor.inNavamsaLagna,
      lang,
    }));
  }

  notes.push(vargottama.length
    ? VS_FRAMES.vargottamaPresent(joinAnd(vargottama.map(p => planetName(p, lang)), lang), vargottama.length > 1, lang)
    : VS_FRAMES.vargottamaAbsent(lang));

  const weakest = planets[planets.length - 1];
  if (weakest && weakest.vimsopaka < 8) {
    notes.push(VS_FRAMES.weakest(planetName(weakest.planet, lang), weakest.vimsopaka.toFixed(1), lang));
  }

  return { planets, pillars, vargottama, notes, navamsaAnchor };
}
