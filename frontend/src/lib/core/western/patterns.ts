/**
 * Aspect-pattern detection — the Western analogue of the Vedic "Patterns"
 * (yogas) tab. Built directly on the aspect grid from `aspects.ts`, since
 * every one of these shapes is defined purely in terms of which aspects are
 * present between which bodies.
 */

import type { AspectHit, AspectBody } from './aspects';

export type WesternPatternType = 'stellium' | 'grandTrine' | 'tSquare' | 'grandCross' | 'yod' | 'kite';

export interface WesternPattern {
  type: WesternPatternType;
  bodies: string[];
  /** The focal point: the T-square's apex, the Yod's apex, the sign a stellium sits in doesn't need one. */
  apex?: string;
  /** Stellium only. */
  sign?: number;
}

function findHit(grid: AspectHit[], a: string, b: string, type: AspectHit['type']): AspectHit | undefined {
  return grid.find(h => h.type === type && ((h.bodyA === a && h.bodyB === b) || (h.bodyA === b && h.bodyB === a)));
}

/** 3+ bodies sharing a sign. Minimum group size is configurable — the natal chart uses 3, transits may want more. */
export function detectStelliums(signByBody: Record<string, number>, minSize = 3): WesternPattern[] {
  const bySign = new Map<number, string[]>();
  for (const [body, sign] of Object.entries(signByBody)) {
    if (!bySign.has(sign)) bySign.set(sign, []);
    bySign.get(sign)!.push(body);
  }
  const out: WesternPattern[] = [];
  for (const [sign, bodies] of bySign) {
    if (bodies.length >= minSize) out.push({ type: 'stellium', bodies, sign });
  }
  return out;
}

export function detectGrandTrines(bodies: AspectBody[], grid: AspectHit[]): WesternPattern[] {
  const out: WesternPattern[] = [];
  const names = bodies.map(b => b.name);
  for (let i = 0; i < names.length; i++) {
    for (let j = i + 1; j < names.length; j++) {
      if (!findHit(grid, names[i], names[j], 'trine')) continue;
      for (let k = j + 1; k < names.length; k++) {
        if (findHit(grid, names[j], names[k], 'trine') && findHit(grid, names[i], names[k], 'trine')) {
          out.push({ type: 'grandTrine', bodies: [names[i], names[j], names[k]] });
        }
      }
    }
  }
  return out;
}

export function detectTSquares(bodies: AspectBody[], grid: AspectHit[]): WesternPattern[] {
  const out: WesternPattern[] = [];
  const names = bodies.map(b => b.name);
  const oppositions = grid.filter(h => h.type === 'opposition');
  for (const opp of oppositions) {
    for (const apex of names) {
      if (apex === opp.bodyA || apex === opp.bodyB) continue;
      if (findHit(grid, opp.bodyA, apex, 'square') && findHit(grid, opp.bodyB, apex, 'square')) {
        out.push({ type: 'tSquare', bodies: [opp.bodyA, opp.bodyB, apex], apex });
      }
    }
  }
  return out;
}

/** Two independent oppositions whose four bodies are all mutually square around the ring. */
export function detectGrandCrosses(grid: AspectHit[]): WesternPattern[] {
  const out: WesternPattern[] = [];
  const oppositions = grid.filter(h => h.type === 'opposition');
  for (let i = 0; i < oppositions.length; i++) {
    for (let j = i + 1; j < oppositions.length; j++) {
      const [a, c] = [oppositions[i].bodyA, oppositions[i].bodyB];
      const [b, d] = [oppositions[j].bodyA, oppositions[j].bodyB];
      if (new Set([a, b, c, d]).size !== 4) continue;
      if (findHit(grid, a, b, 'square') && findHit(grid, b, c, 'square') &&
          findHit(grid, c, d, 'square') && findHit(grid, d, a, 'square')) {
        out.push({ type: 'grandCross', bodies: [a, b, c, d] });
      }
    }
  }
  return out;
}

export function detectYods(bodies: AspectBody[], grid: AspectHit[]): WesternPattern[] {
  const out: WesternPattern[] = [];
  const names = bodies.map(b => b.name);
  const sextiles = grid.filter(h => h.type === 'sextile');
  for (const sex of sextiles) {
    for (const apex of names) {
      if (apex === sex.bodyA || apex === sex.bodyB) continue;
      if (findHit(grid, sex.bodyA, apex, 'quincunx') && findHit(grid, sex.bodyB, apex, 'quincunx')) {
        out.push({ type: 'yod', bodies: [sex.bodyA, sex.bodyB, apex], apex });
      }
    }
  }
  return out;
}

/** A Grand Trine with a fourth body opposing one vertex and sextiling the other two. */
export function detectKites(bodies: AspectBody[], grid: AspectHit[], grandTrines: WesternPattern[]): WesternPattern[] {
  const out: WesternPattern[] = [];
  const names = bodies.map(b => b.name);
  for (const gt of grandTrines) {
    const [a, b, c] = gt.bodies;
    for (const tail of names) {
      if (gt.bodies.includes(tail)) continue;
      for (const [opposed, sexA, sexB] of [[a, b, c], [b, a, c], [c, a, b]] as [string, string, string][]) {
        if (findHit(grid, opposed, tail, 'opposition') &&
            findHit(grid, sexA, tail, 'sextile') && findHit(grid, sexB, tail, 'sextile')) {
          out.push({ type: 'kite', bodies: [a, b, c, tail], apex: tail });
        }
      }
    }
  }
  return out;
}

/** Runs every detector and returns the combined list (kites suppress their base Grand Trine from the plain list). */
export function detectAllPatterns(
  bodies: AspectBody[], grid: AspectHit[], signByBody: Record<string, number>,
): WesternPattern[] {
  const grandTrines = detectGrandTrines(bodies, grid);
  const kites = detectKites(bodies, grid, grandTrines);
  const kitedTrineKeys = new Set(kites.map(k => [...k.bodies].slice(0, 3).sort().join('|')));
  const plainTrines = grandTrines.filter(gt => !kitedTrineKeys.has([...gt.bodies].sort().join('|')));

  return [
    ...detectStelliums(signByBody),
    ...plainTrines,
    ...detectTSquares(bodies, grid),
    ...detectGrandCrosses(grid),
    ...detectYods(bodies, grid),
    ...kites,
  ];
}
