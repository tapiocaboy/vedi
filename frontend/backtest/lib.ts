/**
 * Shared backtest plumbing: load the famous-people set, cast each chart with the
 * app's own ephemeris + context builder, and walk each life on a date grid.
 * Run with: TZ=UTC npx vite-node --config backtest/vite.config.ts backtest/<script>.ts
 */
import { readFileSync } from 'fs';
import path from 'path';
import { getPlanetPositions, type PlanetPosition } from '../src/lib/core/ephemeris';
import { buildChartContext } from '../src/lib/services/predictionService';
import { VimshottariDasha } from '../src/lib/core/dasha';
import type { ChartContext } from '../src/lib/core/predictions';

export type Cat = 'A' | 'M' | 'C' | 'U' | 'T';
export interface PersonEvent { date: string; text: string; cats: Cat[]; posthumous: boolean }
export interface Person {
  id: number; name: string; famousFor: string;
  /** Profession group from the "Famous For" text (550 set only). */
  profession?: string;
  /** Julian-calendar birth date — the ephemeris takes Gregorian, so these are skipped. */
  julian?: boolean;
  /** One of the 50 lives of the first study (550 set only). */
  inEarlierStudy?: boolean;
  localBirth: string; utcBirth: string; offsetMin: number; tzLabel: string;
  place: string; country: string; lat: number; lon: number; rodden: string;
  events: PersonEvent[]; death: string | null; deathKind: 'living' | 'died' | 'missing';
}

/**
 * Which set to load: the original 50 (`data/people.json`, default) or the 550
 * (`BT_DATA=people550`). The 550 set drops Julian-calendar births and the three
 * birth times rated below A (DD / C), leaving 544 lives.
 */
export const DATASET = process.env.BT_DATA ?? 'people';
const ALL: Person[] = JSON.parse(
  readFileSync(path.resolve(__dirname, `data/${DATASET}.json`), 'utf-8'));
const USABLE: Person[] = DATASET === 'people'
  ? ALL
  : ALL.filter(p => !p.julian && (p.rodden === 'AA' || p.rodden === 'A'));

/**
 * The fixed split of the 550 set, decided before any chart in it was computed:
 *  - 'earlier'       the 50 lives every rule in rules.ts was written around
 *  - 'discovery'     a seeded half of the new lives — free to explore
 *  - 'confirmation'  the other half — touched once, to test what discovery found
 */
export type Split = 'earlier' | 'discovery' | 'confirmation';
const NEW_IDS = ALL.filter(p => !p.inEarlierStudy).map(p => p.id);
{
  const r = mulberry32(550);
  for (let i = NEW_IDS.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [NEW_IDS[i], NEW_IDS[j]] = [NEW_IDS[j], NEW_IDS[i]]; }
}
const DISCOVERY = new Set(NEW_IDS.slice(0, NEW_IDS.length >> 1));
export function splitOf(p: Person): Split {
  if (DATASET === 'people' || p.inEarlierStudy) return 'earlier';
  return DISCOVERY.has(p.id) ? 'discovery' : 'confirmation';
}
/** `BT_SPLIT=discovery,confirmation` restricts every script to those splits. */
const WANT = process.env.BT_SPLIT?.split(',') as Split[] | undefined;
export const PEOPLE: Person[] = WANT ? USABLE.filter(p => WANT.includes(splitOf(p))) : USABLE;

export const DAY = 86400000;
export const YEAR = 365.25 * DAY;
/** Day-of-event instant: events carry no clock time, so use midday UTC. */
export const at = (iso: string) => new Date(iso + 'T12:00:00Z');

export interface Cast {
  person: Person;
  birth: Date;
  positions: Record<string, PlanetPosition>;
  ctx: ChartContext;
  dasha: VimshottariDasha;
  lagna: number;           // 0-11
  moonRashi: number;
  planetRashi: Record<string, number>;   // Sun..Ketu title-case
}

export async function cast(p: Person): Promise<Cast> {
  const positions = await getPlanetPositions(p.utcBirth, p.lat, p.lon, 'UTC', 'LAHIRI');
  const birth = new Date(p.utcBirth + 'Z');
  const ctx = buildChartContext(positions);
  const dasha = new VimshottariDasha(positions.MOON.longitude, birth);
  const planetRashi: Record<string, number> = {};
  for (const k of ['SUN','MOON','MARS','MERCURY','JUPITER','VENUS','SATURN','RAHU','KETU']) {
    planetRashi[k.charAt(0) + k.slice(1).toLowerCase()] = positions[k].rashi;
  }
  return { person: p, birth, positions, ctx, dasha, lagna: positions.ASCENDANT.rashi, moonRashi: positions.MOON.rashi, planetRashi };
}

export interface Chain { md: string; ad: string; pd: string; sd?: string }

export function chainAt(c: Cast, when: Date): Chain | null {
  const r = c.dasha.getCurrentPeriods(when);
  if ('error' in r) return null;
  return { md: r.mahadasha.lord, ad: r.antardasha.lord, pd: r.pratyantardasha?.lord ?? r.antardasha.lord, sd: r.sookshmaDasha?.lord };
}

/** The adult span we score against: from age 18 to death, or to the cut-off for the living. */
export function lifeSpan(p: Person, birth: Date, today = new Date('2026-10-08T00:00:00Z')): [Date, Date] {
  const from = new Date(birth.getTime() + 18 * YEAR);
  const end = p.death ? at(p.death) : new Date(Math.min(today.getTime(), birth.getTime() + 85 * YEAR));
  return [from, end];
}

export function grid(from: Date, to: Date, stepDays: number): Date[] {
  const out: Date[] = [];
  for (let t = from.getTime(); t <= to.getTime(); t += stepDays * DAY) out.push(new Date(t));
  return out;
}

// ── stats ────────────────────────────────────────────────────────────────────
export function mulberry32(seed: number) {
  return () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

/** Mid-rank percentile of x within a sorted array (0..1). */
export function percentile(sorted: number[], x: number): number {
  let lo = 0, hi = sorted.length;
  while (lo < hi) { const m = (lo + hi) >> 1; if (sorted[m] < x) lo = m + 1; else hi = m; }
  const less = lo;
  let eq = 0; for (let i = lo; i < sorted.length && sorted[i] === x; i++) eq++;
  return (less + eq / 2) / sorted.length;
}

/** Mean of per-person means, with a person-level bootstrap 95% interval. */
export function clusterMean(byPerson: Map<number, number[]>, seed = 7, B = 2000): { mean: number; lo: number; hi: number; n: number; people: number } {
  const groups = [...byPerson.values()].filter(g => g.length);
  const all = groups.flat();
  const mean = all.reduce((a, b) => a + b, 0) / (all.length || 1);
  const rnd = mulberry32(seed);
  const boots: number[] = [];
  for (let b = 0; b < B; b++) {
    let s = 0, n = 0;
    for (let i = 0; i < groups.length; i++) { const g = groups[Math.floor(rnd() * groups.length)]; for (const v of g) { s += v; n++; } }
    boots.push(s / (n || 1));
  }
  boots.sort((a, b) => a - b);
  return { mean, lo: boots[Math.floor(B * 0.025)], hi: boots[Math.floor(B * 0.975)], n: all.length, people: groups.length };
}
