/**
 * Dosha checker — Mangal (Kuja), Kaal Sarpa, Pitra, and the Sade Sati timeline.
 *
 * Each check returns whether the dosha is present, its strength, the factors
 * that cause it, and the classical cancellation (bhanga) rules that mitigate it.
 * Rules follow common Parashari practice; doshas describe tendencies to manage,
 * not fixed fates.
 */

import { RASHIS, RASHI_LORDS } from './rashi';

export interface DoshaPlanet {
  lon: number;    // sidereal longitude 0–360
  rashi: number;  // 0–11
}

/** Natal snapshot the synchronous checks operate on. */
export interface DoshaPositions {
  lagnaRashi: number;
  planets: Record<string, DoshaPlanet>; // Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu
}

export type DoshaSeverity = 'none' | 'mild' | 'moderate' | 'strong';

export interface DoshaCheck {
  key: 'mangal' | 'kaalsarpa' | 'pitra';
  name: string;
  present: boolean;
  severity: DoshaSeverity;
  summary: string;
  factors: string[];        // why it is flagged
  cancellations: string[];  // mitigating (bhanga) factors found
  remedy: string;
}

const ORD = ['', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];

function houseFrom(targetRashi: number, refRashi: number): number {
  return ((targetRashi - refRashi + 12) % 12) + 1;
}

function sameRashi(a: DoshaPlanet, b: DoshaPlanet): boolean {
  return a.rashi === b.rashi;
}

// Special aspects (graha drishti) as house offsets a planet looks at (incl. 7th).
const ASPECTS: Record<string, number[]> = {
  Mars: [4, 7, 8], Jupiter: [5, 7, 9], Saturn: [3, 7, 10], Rahu: [5, 7, 9], Ketu: [5, 7, 9],
};
function aspects(from: DoshaPlanet, fromName: string, to: DoshaPlanet): boolean {
  const offsets = ASPECTS[fromName] ?? [7];
  return offsets.includes(houseFrom(to.rashi, from.rashi));
}

function severityFromCount(factors: number, cancels: number): DoshaSeverity {
  if (factors === 0) return 'none';
  const net = factors - cancels;
  if (net <= 0) return 'mild';
  if (net === 1) return 'moderate';
  return 'strong';
}

// ─── Mangal (Kuja / Manglik) Dosha ───────────────────────────────────────────

const MANGAL_HOUSES = [1, 2, 4, 7, 8, 12];
// Signs in which Mars in a given dosha-house nullifies the dosha (common table).
const MANGAL_CANCEL_SIGN: Record<number, number[]> = {
  1: [0],          // Aries
  2: [2, 5],       // Gemini, Virgo
  4: [0, 7],       // Aries, Scorpio
  7: [9, 3],       // Capricorn, Cancer
  8: [8, 11],      // Sagittarius, Pisces
  12: [1, 6],      // Taurus, Libra
};

export function checkMangalDosha(pos: DoshaPositions): DoshaCheck {
  const { lagnaRashi, planets } = pos;
  const mars = planets.Mars, moon = planets.Moon, venus = planets.Venus;
  const jup = planets.Jupiter;

  const factors: string[] = [];
  const hL = houseFrom(mars.rashi, lagnaRashi);
  const hM = houseFrom(mars.rashi, moon.rashi);
  const hV = houseFrom(mars.rashi, venus.rashi);
  if (MANGAL_HOUSES.includes(hL)) factors.push(`Mars sits in the ${ORD[hL]} house from the Ascendant.`);
  if (MANGAL_HOUSES.includes(hM)) factors.push(`Mars is in the ${ORD[hM]} house from the Moon.`);
  if (MANGAL_HOUSES.includes(hV)) factors.push(`Mars is in the ${ORD[hV]} house from Venus.`);

  const cancellations: string[] = [];
  if (mars.rashi === 0 || mars.rashi === 7) cancellations.push('Mars is in its own sign (Aries/Scorpio) — the dosha is largely self-neutralised.');
  if (mars.rashi === 9) cancellations.push('Mars is exalted in Capricorn — this strongly mitigates the dosha.');
  if (MANGAL_HOUSES.includes(hL) && (MANGAL_CANCEL_SIGN[hL] ?? []).includes(mars.rashi)) {
    cancellations.push(`Mars occupies ${RASHIS[mars.rashi]} in the ${ORD[hL]} house — a classical nullifying sign for that house.`);
  }
  if (sameRashi(jup, mars)) cancellations.push('Jupiter is conjunct Mars — its benefic protection reduces the dosha.');
  else if (aspects(jup, 'Jupiter', mars)) cancellations.push('Jupiter aspects Mars — its grace tempers the dosha.');

  const present = factors.length > 0;
  const severity = severityFromCount(factors.length, cancellations.length);

  return {
    key: 'mangal',
    name: 'Mangal (Kuja / Manglik) Dosha',
    present,
    severity,
    summary: present
      ? `Mangal Dosha is present (${severity}). It is associated with friction, delay, or intensity in marriage and partnerships — best managed with patience and a compatible match.`
      : 'No Mangal Dosha — Mars does not occupy the sensitive houses for marriage.',
    factors,
    cancellations,
    remedy: 'Hanuman worship and reciting the Hanuman Chalisa on Tuesdays; matching with a partner of similar Mars placement traditionally neutralises it.',
  };
}

// ─── Kaal Sarpa Dosha ────────────────────────────────────────────────────────

const KSD_TYPES: Record<number, string> = {
  1: 'Anant', 2: 'Kulik', 3: 'Vasuki', 4: 'Shankhpal', 5: 'Padma', 6: 'Mahapadma',
  7: 'Takshak', 8: 'Karkotak', 9: 'Shankhachur', 10: 'Ghatak', 11: 'Vishdhar', 12: 'Sheshnag',
};
const KSD_PLANETS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

export function checkKaalSarpaDosha(pos: DoshaPositions): DoshaCheck {
  const { lagnaRashi, planets } = pos;
  const rahuLon = planets.Rahu.lon;

  // Angular distance of each planet forward from Rahu (0–360).
  const diffs = KSD_PLANETS.map(p => ({ p, d: ((planets[p].lon - rahuLon) % 360 + 360) % 360 }));
  const allForward = diffs.every(x => x.d > 0 && x.d < 180);
  const allBackward = diffs.every(x => x.d > 180 && x.d < 360);
  const present = allForward || allBackward;

  // How close any planet sits to the nodal axis (a near-conjunction can break it).
  const nearAxis = Math.min(...diffs.map(x => Math.min(Math.abs(x.d), Math.abs(180 - x.d), Math.abs(360 - x.d))));
  const outsideCount = present ? 0 : diffs.filter(x => (allForward ? !(x.d > 0 && x.d < 180) : !(x.d > 180 && x.d < 360))).length;

  const rahuHouse = houseFrom(planets.Rahu.rashi, lagnaRashi);
  const type = KSD_TYPES[rahuHouse];

  const factors: string[] = [];
  if (present) {
    factors.push(`All seven planets are hemmed between Rahu and Ketu — a complete Kaal Sarpa yoga (${type}, Rahu in the ${ORD[rahuHouse]} house).`);
  } else {
    factors.push(`Not all planets fall on one side of the Rahu–Ketu axis (${outsideCount} outside) — no complete Kaal Sarpa.`);
  }

  const cancellations: string[] = [];
  if (present && nearAxis < 8) cancellations.push('A planet sits within 8° of the nodal axis — the "loop" is loosely held, weakening the yoga.');
  if (!present) cancellations.push('Because a planet escapes the Rahu–Ketu loop, the classical Kaal Sarpa is broken (at most a partial effect).');

  const severity: DoshaSeverity = present ? (nearAxis < 8 ? 'moderate' : 'strong') : 'none';

  return {
    key: 'kaalsarpa',
    name: 'Kaal Sarpa Dosha',
    present,
    severity,
    summary: present
      ? `Kaal Sarpa yoga is present — the ${type} type. It can bring intensity, delays, and sudden ups and downs, but also unusual drive and eventual mastery.`
      : 'No complete Kaal Sarpa yoga — the planets are not fully enclosed by the nodal axis.',
    factors,
    cancellations,
    remedy: 'Rahu–Ketu shanti, worship of Lord Shiva (Mahamrityunjaya mantra), and pilgrimage to Naga shrines are the traditional remedies.',
  };
}

// ─── Pitra Dosha ─────────────────────────────────────────────────────────────

export function checkPitraDosha(pos: DoshaPositions): DoshaCheck {
  const { lagnaRashi, planets } = pos;
  const sun = planets.Sun, rahu = planets.Rahu, ketu = planets.Ketu, sat = planets.Saturn, jup = planets.Jupiter;

  const factors: string[] = [];
  if (sameRashi(sun, rahu)) factors.push('Sun is conjunct Rahu (Surya–Rahu / a Grahan-yoga) — a classic Pitra Dosha signature.');
  if (sameRashi(sun, ketu)) factors.push('Sun is conjunct Ketu — affliction to the solar/paternal significator.');
  if (sameRashi(sun, sat)) factors.push('Sun is conjunct Saturn — strain on the father and ancestral line.');

  const rahuH = houseFrom(rahu.rashi, lagnaRashi);
  const ketuH = houseFrom(ketu.rashi, lagnaRashi);
  if (rahuH === 9) factors.push('Rahu occupies the 9th house — the house of father, dharma and ancestors is afflicted.');
  if (ketuH === 9) factors.push('Ketu occupies the 9th house — unresolved ancestral karma is indicated.');

  // 9th lord afflicted by Rahu/Ketu/Saturn (conjunction or aspect).
  const ninthRashi = (lagnaRashi + 8) % 12;
  const ninthLordName = RASHI_LORDS[RASHIS[ninthRashi]];
  const ninthLord = planets[ninthLordName];
  if (ninthLord) {
    for (const [mName, m] of [['Rahu', rahu], ['Ketu', ketu], ['Saturn', sat]] as [string, DoshaPlanet][]) {
      if (sameRashi(ninthLord, m)) factors.push(`The 9th lord (${ninthLordName}) is conjunct ${mName} — the dharma/ancestral house is compromised.`);
      else if (aspects(m, mName, ninthLord)) factors.push(`${mName} aspects the 9th lord (${ninthLordName}) — ancestral pressure on fortune.`);
    }
  }

  const cancellations: string[] = [];
  if (sameRashi(jup, sun)) cancellations.push('Jupiter is conjunct the Sun — its blessing soothes the ancestral karma.');
  else if (aspects(jup, 'Jupiter', sun)) cancellations.push('Jupiter aspects the Sun — a strong protective influence.');
  if (houseFrom(jup.rashi, lagnaRashi) === 9) cancellations.push('Jupiter occupies the 9th house — powerful protection for the dharma/ancestral house.');

  const present = factors.length > 0;
  const severity = severityFromCount(factors.length, cancellations.length);

  return {
    key: 'pitra',
    name: 'Pitra Dosha',
    present,
    severity,
    summary: present
      ? `Pitra Dosha is indicated (${severity}) — a karmic debt linked to ancestors that can surface as obstacles in fortune, progeny, or the paternal line.`
      : 'No clear Pitra Dosha — the Sun and the 9th house are free of the usual afflictions.',
    factors,
    cancellations,
    remedy: 'Shraddha and Tarpan for ancestors (especially in Pitru Paksha), feeding crows and brahmins, and charity in the father’s name are the classical remedies.',
  };
}

// ─── Sade Sati timeline ──────────────────────────────────────────────────────

export type SadeSatiPhaseName = 'rising' | 'peak' | 'setting';

export interface SadeSatiPhase {
  phase: SadeSatiPhaseName;
  sign: number;
  signName: string;
  houseFromMoon: number; // 12, 1, or 2
  start: string;         // ISO
  end: string;           // ISO
}

export interface SadeSatiPeriod {
  start: string;
  end: string;
  phases: SadeSatiPhase[];
  status: 'past' | 'current' | 'upcoming';
}

const PHASE_BY_HOUSE: Record<number, SadeSatiPhaseName> = { 12: 'rising', 1: 'peak', 2: 'setting' };

/**
 * Build Sade Sati periods from a Saturn rashi time-series. `samples` must be in
 * ascending date order and dense enough to catch each sign change (≈30-day
 * steps work — Saturn holds a sign ≈2.5 years).
 */
export function buildSadeSatiTimeline(
  natalMoonRashi: number,
  samples: { date: Date; rashi: number }[],
  now: Date = new Date(),
): SadeSatiPeriod[] {
  const inZone = (rashi: number) => [12, 1, 2].includes(houseFrom(rashi, natalMoonRashi));

  const periods: SadeSatiPeriod[] = [];
  let cur: { phases: SadeSatiPhase[]; phaseStartIdx: number } | null = null;
  let phaseHouse = -1;
  let phaseStart: Date | null = null;
  let phaseSign = -1;

  const closePhase = (endDate: Date) => {
    if (cur && phaseStart && phaseHouse !== -1) {
      cur.phases.push({
        phase: PHASE_BY_HOUSE[phaseHouse],
        sign: phaseSign,
        signName: RASHIS[phaseSign],
        houseFromMoon: phaseHouse,
        start: phaseStart.toISOString(),
        end: endDate.toISOString(),
      });
    }
  };

  for (let i = 0; i < samples.length; i++) {
    const s = samples[i];
    const active = inZone(s.rashi);
    const house = houseFrom(s.rashi, natalMoonRashi);

    if (active) {
      if (!cur) { cur = { phases: [], phaseStartIdx: i }; phaseHouse = -1; }
      if (house !== phaseHouse) {
        closePhase(s.date);
        phaseHouse = house;
        phaseStart = s.date;
        phaseSign = s.rashi;
      }
    } else if (cur) {
      closePhase(s.date);
      const start = cur.phases[0]?.start ?? samples[cur.phaseStartIdx].date.toISOString();
      const end = cur.phases[cur.phases.length - 1]?.end ?? s.date.toISOString();
      periods.push({ start, end, phases: cur.phases, status: 'past' });
      cur = null; phaseHouse = -1; phaseStart = null;
    }
  }
  // Close an open period running past the sample window.
  if (cur) {
    closePhase(samples[samples.length - 1].date);
    const start = cur.phases[0]?.start ?? samples[cur.phaseStartIdx].date.toISOString();
    const end = cur.phases[cur.phases.length - 1]?.end ?? samples[samples.length - 1].date.toISOString();
    periods.push({ start, end, phases: cur.phases, status: 'past' });
  }

  // Tag each period relative to now.
  const nowMs = now.getTime();
  for (const p of periods) {
    const s = new Date(p.start).getTime();
    const e = new Date(p.end).getTime();
    p.status = nowMs < s ? 'upcoming' : nowMs > e ? 'past' : 'current';
  }
  return periods;
}
