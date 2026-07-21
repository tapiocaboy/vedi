/**
 * Transit reinforcement scanner for dasha windows.
 *
 * Classically a dasha describes *what* is due; a transit decides *when* it
 * fires. This module scans a date window (typically one antardasha) for the
 * events that actually land on a chart:
 *
 *   • Slow-planet conjunctions / oppositions to natal points (within 1°)
 *   • Sign ingresses of Saturn, Jupiter and the nodes
 *   • Retrograde / direct stations of Saturn and Jupiter
 *
 * Each hit carries a date so the weight engine can attribute it to the exact
 * pratyantardasha it falls inside.
 */

import { getBodyLongitudeSeries, type AyanamsaSystem } from './ephemeris';
import { RASHIS } from './rashi';

/** Bodies slow enough that a hit defines a period rather than a day. */
const SLOW_BODIES = ['Saturn', 'Jupiter', 'Rahu', 'Ketu'] as const;
export type SlowBody = (typeof SLOW_BODIES)[number];

export type TransitHitKind =
  | 'conjunction'
  | 'opposition'
  | 'ingress'
  | 'station-retrograde'
  | 'station-direct';

export interface NatalPoint {
  /** Display name — 'Ketu', 'Lagna', 'Moon'… */
  name: string;
  /** Sidereal longitude, 0–360. */
  longitude: number;
}

export interface TransitHit {
  /** Transiting body. */
  transiting: SlowBody;
  kind: TransitHitKind;
  /** Natal point struck — only for conjunction / opposition. */
  target?: string;
  /** Rashi index entered — only for ingress. */
  rashi?: number;
  /** ISO date of the exact event. */
  date: string;
  /** Human-readable one-liner for the UI. */
  detail: string;
}

const DAY_MS = 86400000;

function mod360(x: number): number {
  return ((x % 360) + 360) % 360;
}

/** Signed difference a − b folded into (−180, +180]. */
function wrap180(a: number, b: number): number {
  let d = mod360(a - b);
  if (d > 180) d -= 360;
  return d;
}

/** Linear interpolation of the instant where a signed difference crosses zero. */
function crossingDate(t0: Date, t1: Date, d0: number, d1: number): Date {
  const span = d0 - d1;
  const f = span === 0 ? 0.5 : d0 / span;
  return new Date(t0.getTime() + f * (t1.getTime() - t0.getTime()));
}

function fmt(date: Date): string {
  return date.toISOString();
}

/**
 * Sampling step in days. Saturn moves ~2'/day and Jupiter ~5'/day, so a 3-day
 * step still resolves an exact hit to well under a degree after interpolation,
 * while keeping the sample count bounded for multi-year windows.
 */
function stepDaysFor(totalDays: number): number {
  if (totalDays <= 200) return 1;
  if (totalDays <= 700) return 2;
  return 3;
}

/**
 * Scan `[start, end]` for slow-planet events touching `natalPoints`.
 * Returns hits sorted by date. Never throws — an ephemeris failure yields [].
 */
export async function scanWindowTransits(
  start: Date,
  end: Date,
  natalPoints: NatalPoint[],
  ayanamsa: AyanamsaSystem = 'LAHIRI',
): Promise<TransitHit[]> {
  const totalDays = (end.getTime() - start.getTime()) / DAY_MS;
  if (!(totalDays > 0)) return [];

  const step = stepDaysFor(totalDays);
  const dates: Date[] = [];
  for (let t = start.getTime(); t <= end.getTime(); t += step * DAY_MS) {
    dates.push(new Date(t));
  }
  if (dates.length < 2) return [];

  let saturn: number[], jupiter: number[], rahu: number[];
  try {
    [saturn, jupiter, rahu] = await Promise.all([
      getBodyLongitudeSeries('SATURN', dates, ayanamsa),
      getBodyLongitudeSeries('JUPITER', dates, ayanamsa),
      getBodyLongitudeSeries('RAHU', dates, ayanamsa),
    ]);
  } catch {
    return [];
  }
  const ketu = rahu.map(l => mod360(l + 180));

  const series: Array<[SlowBody, number[]]> = [
    ['Saturn', saturn],
    ['Jupiter', jupiter],
    ['Rahu', rahu],
    ['Ketu', ketu],
  ];

  const hits: TransitHit[] = [];

  for (const [body, lons] of series) {
    // ── Aspects to natal points ──
    for (const point of natalPoints) {
      // Skip the degenerate self-comparison of a node with its own axis.
      for (const [kind, offset] of [
        ['conjunction', 0],
        ['opposition', 180],
      ] as Array<[TransitHitKind, number]>) {
        // A node's opposition to a point is its partner's conjunction — already covered.
        if (offset === 180 && (body === 'Rahu' || body === 'Ketu')) continue;

        for (let i = 0; i < lons.length - 1; i++) {
          const d0 = wrap180(lons[i], point.longitude + offset);
          const d1 = wrap180(lons[i + 1], point.longitude + offset);
          // Sign change with both endpoints near the target — guards against
          // the ±180 wrap being read as a crossing. An exact zero belongs to
          // the interval that arrives at it, so the hit is never counted twice.
          if ((d0 < 0 && d1 >= 0) || (d0 > 0 && d1 <= 0)) {
            if (Math.abs(d0) > 15 || Math.abs(d1) > 15) continue;
            const when = crossingDate(dates[i], dates[i + 1], d0, d1);
            hits.push({
              transiting: body,
              kind,
              target: point.name,
              date: fmt(when),
              detail:
                kind === 'conjunction'
                  ? `Transit ${body} crosses your natal ${point.name} (${point.longitude.toFixed(2)}° — ${RASHIS[Math.floor(point.longitude / 30)]})`
                  : `Transit ${body} opposes your natal ${point.name} (${RASHIS[Math.floor(point.longitude / 30)]})`,
            });
          }
        }
      }
    }

    // ── Sign ingresses ──
    for (let i = 0; i < lons.length - 1; i++) {
      const r0 = Math.floor(lons[i] / 30);
      const r1 = Math.floor(lons[i + 1] / 30);
      if (r0 === r1) continue;
      // Interpolate to the 30° boundary the body actually crossed: moving
      // forward it enters r1 from below, moving backward it leaves r0.
      const direct = wrap180(lons[i + 1], lons[i]) > 0;
      const boundary = (direct ? r1 : r0) * 30;
      const d0 = wrap180(lons[i], boundary);
      const d1 = wrap180(lons[i + 1], boundary);
      const when = crossingDate(dates[i], dates[i + 1], d0, d1);
      hits.push({
        transiting: body,
        kind: 'ingress',
        rashi: r1,
        date: fmt(when),
        detail: `${body} enters ${RASHIS[r1]}`,
      });
    }

    // ── Stations (Saturn and Jupiter only — the true node wobbles constantly) ──
    if (body === 'Saturn' || body === 'Jupiter') {
      for (let i = 1; i < lons.length - 1; i++) {
        const prev = wrap180(lons[i], lons[i - 1]);
        const next = wrap180(lons[i + 1], lons[i]);
        if (prev === 0 || (prev < 0) === (next < 0)) continue;
        hits.push({
          transiting: body,
          kind: next < 0 ? 'station-retrograde' : 'station-direct',
          date: fmt(dates[i]),
          detail:
            next < 0
              ? `${body} turns retrograde in ${RASHIS[Math.floor(lons[i] / 30)]}`
              : `${body} turns direct in ${RASHIS[Math.floor(lons[i] / 30)]}`,
        });
      }
    }
  }

  return hits.sort((a, b) => a.date.localeCompare(b.date));
}

/** Hits falling inside `[start, end]`. */
export function hitsWithin(hits: TransitHit[], start: Date, end: Date): TransitHit[] {
  const s = start.getTime();
  const e = end.getTime();
  return hits.filter(h => {
    const t = new Date(h.date).getTime();
    return t >= s && t <= e;
  });
}
