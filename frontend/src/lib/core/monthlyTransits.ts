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

const PLANET_LABEL: Record<string, string> = {
  SUN: 'Sun', MERCURY: 'Mercury', VENUS: 'Venus', MARS: 'Mars',
  JUPITER: 'Jupiter', SATURN: 'Saturn', RAHU: 'Rahu', KETU: 'Ketu',
};

const PLANET_SIGNIFIES: Record<string, string> = {
  SUN: 'authority, vitality, recognition and the father',
  MERCURY: 'communication, commerce, learning and quick thinking',
  VENUS: 'love, comfort, money, art and relationships',
  MARS: 'energy, courage, drive, property and conflict',
  JUPITER: 'wisdom, fortune, growth, dharma and mentors',
  SATURN: 'discipline, karma, patience, structure and hard work',
  RAHU: 'ambition, the unconventional, foreign matters and sudden surges',
  KETU: 'detachment, spirituality, endings and past-life karma',
};

// Per-house Gochara theme — what the moving planet now stirs up in daily life.
const HOUSE_THEME: Record<number, { label: string; favorable: string; challenging: string; areas: string[] }> = {
  1:  { label: 'self & vitality', favorable: 'a fresh sense of direction and presence', challenging: 'pressure on health, mood and self-image', areas: ['Health & energy', 'Personal initiatives'] },
  2:  { label: 'wealth, family & speech', favorable: 'gains through savings, family and measured words', challenging: 'strain on finances, food habits and family talk', areas: ['Finances & savings', 'Family & speech'] },
  3:  { label: 'courage, effort & communication', favorable: 'bold initiative, supportive siblings and effective communication', challenging: 'scattered effort and friction with siblings or peers', areas: ['Courage & initiative', 'Communication'] },
  4:  { label: 'home, mother & peace', favorable: 'comfort at home, property luck and inner calm', challenging: 'domestic stress, restlessness and matters around mother or vehicles', areas: ['Home & property', 'Inner peace'] },
  5:  { label: 'creativity, children & romance', favorable: 'creative flow, romance, good news around children and smart speculation', challenging: 'setbacks in romance, speculation or matters of children', areas: ['Romance & creativity', 'Children & learning'] },
  6:  { label: 'work, rivals & health', favorable: 'victory over rivals, debt clearance and steady service', challenging: 'conflicts, debts and small recurring health issues', areas: ['Competition & service', 'Debts & health'] },
  7:  { label: 'partnership & public dealings', favorable: 'harmony in partnership and productive deals', challenging: 'tension with spouse or partners and tricky negotiations', areas: ['Marriage & partnership', 'Business deals'] },
  8:  { label: 'transformation & hidden matters', favorable: 'research insight, inheritance and deep transformation', challenging: 'sudden upheavals, anxiety and hidden obstacles', areas: ['Sudden change', 'Shared resources & occult'] },
  9:  { label: 'fortune, dharma & higher learning', favorable: 'luck, blessings, travel and guidance from mentors', challenging: 'a dip in luck and questioning of beliefs or direction', areas: ['Luck & dharma', 'Travel & higher study'] },
  10: { label: 'career, status & action', favorable: 'career momentum, visibility and authority', challenging: 'pressure at work, reputation tests and heavier responsibility', areas: ['Career & status', 'Public reputation'] },
  11: { label: 'gains, income & networks', favorable: 'income, fulfilled desires and powerful connections', challenging: 'unmet expectations and unreliable gains or friends', areas: ['Income & gains', 'Friends & networks'] },
  12: { label: 'expenses, foreign lands & release', favorable: 'spiritual growth, rest and well-spent foreign or charitable expense', challenging: 'rising expenses, isolation, disturbed sleep and losses', areas: ['Expenses & loss', 'Spirituality & rest'] },
};

function buildIngressEffect(
  planet: string, fromRashi: number, toRashi: number, houseFromMoon: number, houseFromLagna: number, valence: number,
): { title: string; effect: string; themes: string[] } {
  const name = PLANET_LABEL[planet];
  const themeM = HOUSE_THEME[houseFromMoon];
  const themeL = HOUSE_THEME[houseFromLagna];
  const newLord = RASHI_LORDS[RASHIS[toRashi]];
  const fromName = RASHIS[fromRashi];
  const toName = RASHIS[toRashi];

  const title = `${name} enters ${toName} — ${houseFromMoon}th from Moon`;

  const orientation = valence > 0 ? themeM.favorable : valence < 0 ? themeM.challenging : `a blend of ${themeM.favorable} and ${themeM.challenging}`;

  const effect =
    `${name} leaves ${fromName} and moves into ${toName} (ruled by ${newLord}), now transiting your ` +
    `${houseFromMoon}th house from the natal Moon and ${houseFromLagna}th from the Lagna. ` +
    `This shifts the focus of ${PLANET_SIGNIFIES[planet]} toward ${themeM.label}, bringing ${orientation}. ` +
    `From the Lagna it colours ${themeL.label}, so ${valence >= 0 ? 'lean into' : 'stay measured around'} those affairs while ${name} holds this sign.`;

  const themes: string[] = [];
  const sideM = valence > 0 ? themeM.favorable : valence < 0 ? themeM.challenging : `${themeM.favorable}, but watch for ${themeM.challenging}`;
  themes.push(`${themeM.areas[0]}: ${capitalize(sideM)}.`);
  if (themeM.areas[1]) themes.push(`${themeM.areas[1]}: a clear theme for the weeks ${name} spends here.`);
  themes.push(`${themeL.areas[0]} (from Lagna): ${themeL.areas[0].toLowerCase().includes('career') ? 'visible activity' : 'noticeable movement'} around ${themeL.label}.`);
  return { title, effect, themes };
}

function buildStationEffect(
  planet: string, type: 'retrograde' | 'direct', toRashi: number, houseFromMoon: number,
): { title: string; effect: string; themes: string[] } {
  const name = PLANET_LABEL[planet];
  const themeM = HOUSE_THEME[houseFromMoon];
  const sign = RASHIS[toRashi];
  if (type === 'retrograde') {
    const title = `${name} turns retrograde in ${sign}`;
    const effect =
      `${name} stations retrograde in ${sign}, in your ${houseFromMoon}th house from the Moon. ` +
      `Matters of ${PLANET_SIGNIFIES[planet]} tied to ${themeM.label} slow down, double back and ask to be revisited. ` +
      `Favour review, repair and revisiting rather than launching anything new in this area until it turns direct.`;
    return { title, effect, themes: [
      `${themeM.areas[0]}: revisit and refine rather than start fresh.`,
      `Expect delays and second thoughts around ${themeM.label}.`,
    ] };
  }
  const title = `${name} turns direct in ${sign}`;
  const effect =
    `${name} stations direct in ${sign}, in your ${houseFromMoon}th house from the Moon. ` +
    `The backlog around ${themeM.label} and ${PLANET_SIGNIFIES[planet]} begins to clear and move forward again. ` +
    `Plans that were stalled can now be re-committed with better clarity.`;
  return { title, effect, themes: [
    `${themeM.areas[0]}: momentum returns — green light to proceed.`,
    `Stalled matters of ${themeM.label} start resolving.`,
  ] };
}

function capitalize(s: string): string { return s.charAt(0).toUpperCase() + s.slice(1); }

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
        const built = buildIngressEffect(planet, prev.rashi, cur.rashi, houseFromMoon, houseFromLagna, valence);
        events.push({
          planet, type: 'ingress', date: at.toISOString(),
          fromRashi: prev.rashi, toRashi: cur.rashi, toRashiName: RASHIS[cur.rashi],
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
        const built = buildStationEffect(planet, type, toRashi, houseFromMoon);
        events.push({
          planet, type, date: at.toISOString(),
          fromRashi: null, toRashi, toRashiName: RASHIS[toRashi],
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
): Promise<MonthlyTransitReport> {
  const now = asOf ?? new Date();
  const start = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1, 0, 0, 0));
  const end = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0)); // exclusive

  const events = await scanTransitEvents(ayanamsa, natalMoonRashi, natalLagnaRashi, start, end);

  const netValence = events.reduce((s, e) => s + e.valence, 0);
  const monthLabel = start.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  const overview = buildOverview(events, netValence, monthLabel);

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
): Promise<UpcomingTransitReport> {
  const start = asOf ?? new Date();
  const end = new Date(start.getTime() + horizonDays * 24 * 60 * 60 * 1000);

  const events = await scanTransitEvents(ayanamsa, natalMoonRashi, natalLagnaRashi, start, end);

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

function buildOverview(events: MonthlyTransitEvent[], netValence: number, monthLabel: string): string {
  if (events.length === 0) {
    return `In ${monthLabel} the slow planets hold their signs — no major ingresses or stations land this month, so the themes already running in your chart simply continue without a sharp turn.`;
  }
  const ingresses = events.filter(e => e.type === 'ingress');
  const stations = events.filter(e => e.type !== 'ingress');
  const good = events.filter(e => e.valence > 0).length;
  const tough = events.filter(e => e.valence < 0).length;

  const tone =
    netValence > 1 ? 'Overall the month leans supportive — more doors open than close.'
      : netValence < -1 ? 'Overall the month asks for patience and care — several transits add friction before they add reward.'
      : 'Overall the month is mixed — gains and tests arrive in roughly equal measure, so timing matters.';

  const heavy = events.find(e => e.planet === 'SATURN' || e.planet === 'JUPITER' || e.planet === 'RAHU' || e.planet === 'KETU');
  const heavyLine = heavy
    ? ` The most significant shift is ${PLANET_LABEL[heavy.planet]} ${heavy.type === 'ingress' ? `entering ${heavy.toRashiName}` : `turning ${heavy.type}`}, which resets a long-running theme.`
    : '';

  return `In ${monthLabel} there ${events.length === 1 ? 'is' : 'are'} ${events.length} notable transit${events.length === 1 ? '' : 's'}` +
    ` (${ingresses.length} sign change${ingresses.length === 1 ? '' : 's'}, ${stations.length} station${stations.length === 1 ? '' : 's'}):` +
    ` ${good} broadly favourable and ${tough} more demanding. ${tone}${heavyLine}`;
}
