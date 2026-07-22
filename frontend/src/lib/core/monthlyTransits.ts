/**
 * Monthly Gochara transitions.
 *
 * Detects the planetary "transitions" that actually happen during the current
 * calendar month — sign ingresses (a planet moving from one rashi to the next)
 * and retrograde / direct stations — then turns each one into a detailed,
 * chart-specific prediction by reading the destination house from the person's
 * natal Moon and Lagna (the classical Gochara reference points).
 *
 * Everything is computed locally from the Swiss-Ephemeris WASM build, so the
 * dates are accurate to within a few hours of the real ingress.
 */

import { getPlanetPositions } from './ephemeris';
import { valenceFromMoon, type AyanamsaSystem } from './transits';
import { RASHIS, RASHI_LORDS } from './rashi';
import { type Lang, getStoredLang, planetName } from './i18n';
import {
  MONTHLY, signifies, houseTheme, planetLabelM, monthLabelFor, localRashi,
} from './text/monthlyText';

export type TransitEventType = 'ingress' | 'retrograde' | 'direct';

export interface MonthlyTransitEvent {
  planet: string;            // 'SATURN', 'JUPITER', …
  type: TransitEventType;
  date: string;              // ISO timestamp of the event
  fromRashi: number | null;  // ingress only
  toRashi: number;           // sign the planet is in after the event
  toRashiName: string;
  houseFromMoon: number;     // 1-12
  houseFromLagna: number;    // 1-12
  valence: number;           // -2 … +2
  title: string;             // one-line headline
  effect: string;            // detailed prediction paragraph
  themes: string[];          // life-area specific bullet predictions
}

export interface MonthlyTransitReport {
  monthLabel: string;        // "June 2026"
  rangeStart: string;        // ISO
  rangeEnd: string;          // ISO
  natalMoonRashi: number;
  natalLagnaRashi: number;
  events: MonthlyTransitEvent[];
  overview: string;          // synthesised monthly theme
  netValence: number;        // sum of event valences
}

// Slow-to-medium movers worth flagging. The Moon is deliberately excluded —
// it changes sign every ~2.25 days and would bury the meaningful ingresses.
const INGRESS_PLANETS = ['SUN', 'MERCURY', 'VENUS', 'MARS', 'JUPITER', 'SATURN', 'RAHU', 'KETU'] as const;
// Bodies that can station retrograde / direct (nodes are always retrograde; the
// luminaries never retrograde).
const STATION_PLANETS = ['MERCURY', 'VENUS', 'MARS', 'JUPITER', 'SATURN'] as const;

function houseFrom(targetRashi: number, referenceRashi: number): number {
  return ((targetRashi - referenceRashi + 12) % 12) + 1;
}

// Moon-relative valence is shared with the live Gochara engine (transits.ts)
// so the monthly and upcoming views agree with the Sky Right Now analysis.

// ─── Prediction text generators ──────────────────────────────────────────────

function buildIngressEffect(
  planet: string, fromRashi: number, toRashi: number, houseFromMoon: number, houseFromLagna: number, valence: number, lang: Lang,
): { title: string; effect: string; themes: string[] } {
  const name = planetLabelM(planet, lang);
  const themeM = houseTheme(houseFromMoon, lang);
  const themeL = houseTheme(houseFromLagna, lang);
  const newLord = planetName(RASHI_LORDS[RASHIS[toRashi]], lang);
  const fromName = localRashi(fromRashi, lang);
  const toName = localRashi(toRashi, lang);

  const title = MONTHLY.ingressTitle(name, toName, houseFromMoon, lang);
  const blend = lang === 'si'
    ? `${themeM.favorable} හා ${themeM.challenging} මිශ්‍රණයක්`
    : `a blend of ${themeM.favorable} and ${themeM.challenging}`;
  const orientation = valence > 0 ? themeM.favorable : valence < 0 ? themeM.challenging : blend;

  const effect = MONTHLY.ingressEffect(
    name, fromName, toName, newLord, houseFromMoon, houseFromLagna,
    signifies(planet, lang), themeM.label, orientation, themeL.label, valence, lang,
  );

  const themes: string[] = [];
  const watchFor = lang === 'si' ? `${themeM.favorable}, නමුත් ${themeM.challenging} ගැන අවධානයෙන්` : `${themeM.favorable}, but watch for ${themeM.challenging}`;
  const sideM = valence > 0 ? themeM.favorable : valence < 0 ? themeM.challenging : watchFor;
  themes.push(MONTHLY.ingressThemeMain(themeM.areas[0], sideM, lang));
  if (themeM.areas[1]) themes.push(MONTHLY.ingressThemeSecondary(themeM.areas[1], name, lang));
  const isCareer = HOUSE_THEME_CAREER.has(houseFromLagna);
  themes.push(MONTHLY.ingressThemeLagna(themeL.areas[0], themeL.label, isCareer, lang));
  return { title, effect, themes };
}

// The Lagna 10th house theme is career-facing (drives the wording of the bullet).
const HOUSE_THEME_CAREER = new Set([10]);

function buildStationEffect(
  planet: string, type: 'retrograde' | 'direct', toRashi: number, houseFromMoon: number, lang: Lang,
): { title: string; effect: string; themes: string[] } {
  const name = planetLabelM(planet, lang);
  const themeM = houseTheme(houseFromMoon, lang);
  const sign = localRashi(toRashi, lang);
  if (type === 'retrograde') {
    return {
      title: MONTHLY.retroTitle(name, sign, lang),
      effect: MONTHLY.retroEffect(name, sign, houseFromMoon, signifies(planet, lang), themeM.label, lang),
      themes: [MONTHLY.retroTheme1(themeM.areas[0], lang), MONTHLY.retroTheme2(themeM.label, lang)],
    };
  }
  return {
    title: MONTHLY.directTitle(name, sign, lang),
    effect: MONTHLY.directEffect(name, sign, houseFromMoon, signifies(planet, lang), themeM.label, lang),
    themes: [MONTHLY.directTheme1(themeM.areas[0], lang), MONTHLY.directTheme2(themeM.label, lang)],
  };
}

// ─── Sampling helpers ────────────────────────────────────────────────────────

function isoSecond(d: Date): string {
  return d.toISOString().slice(0, 19);
}

interface Sample { rashi: number; speed: number; }

async function sampleAt(date: Date, planet: string, ayanamsa: AyanamsaSystem): Promise<Sample> {
  // Location barely affects sidereal longitude of these bodies; sample at UTC.
  const positions = await getPlanetPositions(isoSecond(date), 0, 0, 'UTC', ayanamsa);
  const p = positions[planet];
  return { rashi: p.rashi, speed: p.speed };
}

/** Bisect between two instants to pin the moment a planet's rashi changes. */
async function refineIngress(
  planet: string, ayanamsa: AyanamsaSystem, before: Date, after: Date, targetRashi: number,
): Promise<Date> {
  let lo = before.getTime(), hi = after.getTime();
  for (let i = 0; i < 7; i++) {
    const mid = new Date((lo + hi) / 2);
    const s = await sampleAt(mid, planet, ayanamsa);
    if (s.rashi === targetRashi) hi = mid.getTime();
    else lo = mid.getTime();
  }
  return new Date(hi);
}

/** Bisect to pin the moment a planet's speed crosses zero (a station). */
async function refineStation(
  planet: string, ayanamsa: AyanamsaSystem, before: Date, after: Date, wantNegative: boolean,
): Promise<Date> {
  let lo = before.getTime(), hi = after.getTime();
  for (let i = 0; i < 7; i++) {
    const mid = new Date((lo + hi) / 2);
    const s = await sampleAt(mid, planet, ayanamsa);
    const isNeg = s.speed < 0;
    if (isNeg === wantNegative) hi = mid.getTime();
    else lo = mid.getTime();
  }
  return new Date(hi);
}

// ─── Range scanner (shared by monthly + upcoming views) ──────────────────────

/** Detect every ingress and station in [start, end) with full effect text. */
async function scanTransitEvents(
  ayanamsa: AyanamsaSystem,
  natalMoonRashi: number,
  natalLagnaRashi: number,
  start: Date,
  end: Date,
  lang: Lang,
): Promise<MonthlyTransitEvent[]> {
  // Daily snapshots across the range (one extra at the end boundary).
  const stepMs = 24 * 60 * 60 * 1000;
  const dates: Date[] = [];
  for (let t = start.getTime(); t <= end.getTime(); t += stepMs) dates.push(new Date(t));

  const snapshots: Record<string, Sample>[] = [];
  for (const d of dates) {
    const positions = await getPlanetPositions(isoSecond(d), 0, 0, 'UTC', ayanamsa);
    const snap: Record<string, Sample> = {};
    for (const name of INGRESS_PLANETS) snap[name] = { rashi: positions[name].rashi, speed: positions[name].speed };
    snapshots.push(snap);
  }

  const events: MonthlyTransitEvent[] = [];

  // Ingress detection
  for (const planet of INGRESS_PLANETS) {
    for (let i = 1; i < snapshots.length; i++) {
      const prev = snapshots[i - 1][planet];
      const cur = snapshots[i][planet];
      if (prev.rashi !== cur.rashi) {
        const at = await refineIngress(planet, ayanamsa, dates[i - 1], dates[i], cur.rashi);
        if (at < start || at >= end) continue;
        const houseFromMoon = houseFrom(cur.rashi, natalMoonRashi);
        const houseFromLagna = houseFrom(cur.rashi, natalLagnaRashi);
        const valence = valenceFromMoon(planet, houseFromMoon);
        const built = buildIngressEffect(planet, prev.rashi, cur.rashi, houseFromMoon, houseFromLagna, valence, lang);
        events.push({
          planet, type: 'ingress', date: at.toISOString(),
          fromRashi: prev.rashi, toRashi: cur.rashi, toRashiName: localRashi(cur.rashi, lang),
          houseFromMoon, houseFromLagna, valence, ...built,
        });
      }
    }
  }

  // Retrograde / direct stations
  for (const planet of STATION_PLANETS) {
    for (let i = 1; i < snapshots.length; i++) {
      const prevNeg = snapshots[i - 1][planet].speed < 0;
      const curNeg = snapshots[i][planet].speed < 0;
      if (prevNeg !== curNeg) {
        const at = await refineStation(planet, ayanamsa, dates[i - 1], dates[i], curNeg);
        if (at < start || at >= end) continue;
        const toRashi = snapshots[i][planet].rashi;
        const houseFromMoon = houseFrom(toRashi, natalMoonRashi);
        const houseFromLagna = houseFrom(toRashi, natalLagnaRashi);
        const type: TransitEventType = curNeg ? 'retrograde' : 'direct';
        // A retrograde slows benefic flow; clamp the valence to non-positive.
        const baseV = valenceFromMoon(planet, houseFromMoon);
        const valence = type === 'retrograde' ? Math.min(0, baseV) : baseV;
        const built = buildStationEffect(planet, type, toRashi, houseFromMoon, lang);
        events.push({
          planet, type, date: at.toISOString(),
          fromRashi: null, toRashi, toRashiName: localRashi(toRashi, lang),
          houseFromMoon, houseFromLagna, valence, ...built,
        });
      }
    }
  }

  events.sort((a, b) => a.date.localeCompare(b.date));
  return events;
}

// ─── Main entry points ───────────────────────────────────────────────────────

export async function getMonthlyTransits(
  ayanamsa: AyanamsaSystem,
  natalMoonRashi: number,
  natalLagnaRashi: number,
  asOf?: Date,
  lang: Lang = getStoredLang(),
): Promise<MonthlyTransitReport> {
  const now = asOf ?? new Date();
  const start = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1, 0, 0, 0));
  const end = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0)); // exclusive

  const events = await scanTransitEvents(ayanamsa, natalMoonRashi, natalLagnaRashi, start, end, lang);

  const netValence = events.reduce((s, e) => s + e.valence, 0);
  const monthLabel = monthLabelFor(start, lang);
  const overview = buildOverview(events, netValence, monthLabel, lang);

  return {
    monthLabel,
    rangeStart: start.toISOString(),
    rangeEnd: end.toISOString(),
    natalMoonRashi,
    natalLagnaRashi,
    events,
    overview,
    netValence,
  };
}

export interface UpcomingTransitEvent extends MonthlyTransitEvent {
  /** Whole days from "now" until the event (0 = today). */
  daysUntil: number;
}

export interface UpcomingTransitReport {
  rangeStart: string;   // ISO — now
  rangeEnd: string;     // ISO — now + horizon
  horizonDays: number;
  events: UpcomingTransitEvent[];
}

/**
 * Forward-looking transit calendar: every sign ingress and station in the next
 * `horizonDays` days (default 45), each tagged with how it lands for this
 * chart (valence from the natal Moon) and a day countdown.
 */
export async function getUpcomingTransits(
  ayanamsa: AyanamsaSystem,
  natalMoonRashi: number,
  natalLagnaRashi: number,
  horizonDays = 45,
  asOf?: Date,
  lang: Lang = getStoredLang(),
): Promise<UpcomingTransitReport> {
  const start = asOf ?? new Date();
  const end = new Date(start.getTime() + horizonDays * 24 * 60 * 60 * 1000);

  const events = await scanTransitEvents(ayanamsa, natalMoonRashi, natalLagnaRashi, start, end, lang);

  const dayMs = 24 * 60 * 60 * 1000;
  const upcoming: UpcomingTransitEvent[] = events.map(e => ({
    ...e,
    daysUntil: Math.max(0, Math.floor((new Date(e.date).getTime() - start.getTime()) / dayMs)),
  }));

  return {
    rangeStart: start.toISOString(),
    rangeEnd: end.toISOString(),
    horizonDays,
    events: upcoming,
  };
}

function buildOverview(events: MonthlyTransitEvent[], netValence: number, monthLabel: string, lang: Lang): string {
  if (events.length === 0) return MONTHLY.overviewEmpty(monthLabel, lang);
  const ingresses = events.filter(e => e.type === 'ingress');
  const stations = events.filter(e => e.type !== 'ingress');
  const good = events.filter(e => e.valence > 0).length;
  const tough = events.filter(e => e.valence < 0).length;

  const tone = MONTHLY.overviewTone(netValence, lang);

  const heavy = events.find(e => e.planet === 'SATURN' || e.planet === 'JUPITER' || e.planet === 'RAHU' || e.planet === 'KETU');
  const heavyLine = heavy
    ? MONTHLY.overviewHeavy(planetLabelM(heavy.planet, lang), heavy.type === 'ingress', localRashi(heavy.toRashi, lang), heavy.type, lang)
    : '';

  return MONTHLY.overviewMain(monthLabel, events.length, ingresses.length, stations.length, good, tough, tone, heavyLine, lang);
}
