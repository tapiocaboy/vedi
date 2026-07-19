/**
 * Transit analysis — graded Vedic aspect maths + a refined favourability score
 * per sign, plus a set of plain-language transit predictions.
 *
 * Builds on the raw Gochara snapshot (positions + Moon-relative valence) from
 * transits.ts and adds:
 *   • Parashari graded drishti (virupa strength 0–60) incl. the special full
 *     aspects of Mars (4/8), Jupiter (5/9) and Saturn (3/10);
 *   • a per-sign favourability score that blends occupancy valence, the
 *     benefic/malefic aspects falling on the sign, and the sign's house nature
 *     from the Lagna (dusthana / trikona);
 *   • interpretive predictions (overall climate, Sade Sati, Guru, aspects on
 *     the Lagna and natal Moon, retrogrades, the daily Moon, the nodal axis).
 */

import type { GocharaSnapshot, PlanetTransit } from './transits';
import { RASHIS } from './rashi';
import { NAKSHATRAS } from './nakshatra';
import { getDignity, type DignityLevel } from './planetaryAnalysis';
import { computeAshtakavarga, type Contributor, type Planet as AvPlanet } from './ashtakavarga';

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/** Natural benefic (true) vs malefic (false). Moon & Mercury treated benefic. */
export const NATURAL_BENEFIC: Record<string, boolean> = {
  SUN: false, MOON: true, MARS: false, MERCURY: true,
  JUPITER: true, VENUS: true, SATURN: false, RAHU: false, KETU: false,
};

/** House offset (1–12) from `fromRashi` to `toRashi`; 1 = same sign. */
export function houseBetween(fromRashi: number, toRashi: number): number {
  return ((toRashi - fromRashi + 12) % 12) + 1;
}

/**
 * Parashari graded aspect strength in virupas (0–60) cast by `planet` sitting
 * in `fromRashi` onto `toRashi`. Special full aspects override the standard
 * graded values.
 */
export function aspectVirupa(planet: string, fromRashi: number, toRashi: number): number {
  const h = houseBetween(fromRashi, toRashi);
  if (h === 1) return 0;
  // Special full aspects
  if (planet === 'MARS' && (h === 4 || h === 8)) return 60;
  if (planet === 'JUPITER' && (h === 5 || h === 9)) return 60;
  if (planet === 'SATURN' && (h === 3 || h === 10)) return 60;
  // Standard Parashari drishti
  if (h === 7) return 60;                 // full
  if (h === 4 || h === 8) return 45;      // three-quarter
  if (h === 5 || h === 9) return 30;      // half
  if (h === 3 || h === 10) return 15;     // quarter
  return 0;
}

export const aspectPct = (virupa: number): number => Math.round((virupa / 60) * 100);

export interface GradedAspect { toRashi: number; offset: number; virupa: number; }

/** All non-zero graded aspects a planet in `fromRashi` casts. */
export function gradedAspects(planet: string, fromRashi: number): GradedAspect[] {
  const out: GradedAspect[] = [];
  for (let o = 2; o <= 12; o++) {
    const toRashi = (fromRashi + o - 1) % 12;
    const virupa = aspectVirupa(planet, fromRashi, toRashi);
    if (virupa > 0) out.push({ toRashi, offset: o, virupa });
  }
  return out;
}

export interface AspectIn { planet: string; fromRashi: number; virupa: number; benefic: boolean; offset: number; }
export interface SignInfo {
  rashi: number;
  houseFromLagna: number;
  planets: PlanetTransit[];
  aspectsIn: AspectIn[];
  occScore: number;
  aspectScore: number;
  houseScore: number;
  score: number;
  tone: 'good' | 'bad' | 'neutral';
}

/** Refined favourability analysis for all 12 signs. */
export function computeSignAnalysis(g: GocharaSnapshot): Record<number, SignInfo> {
  const lagna = g.natalLagnaRashi;
  const byRashi: Record<number, PlanetTransit[]> = {};
  for (let i = 0; i < 12; i++) byRashi[i] = [];
  g.transits.forEach(p => byRashi[p.rashi]?.push(p));

  const result: Record<number, SignInfo> = {};
  for (let rashi = 0; rashi < 12; rashi++) {
    const planets = byRashi[rashi];

    const aspectsIn: AspectIn[] = [];
    for (const p of g.transits) {
      if (p.rashi === rashi) continue;
      const virupa = aspectVirupa(p.planet, p.rashi, rashi);
      if (virupa > 0) {
        aspectsIn.push({ planet: p.planet, fromRashi: p.rashi, virupa, benefic: !!NATURAL_BENEFIC[p.planet], offset: houseBetween(p.rashi, rashi) });
      }
    }

    // Occupancy: Moon-relative valence, adjusted by each planet's transit
    // dignity (exalted/own strengthen, debilitated weakens), combustion, and
    // the ashtakavarga bindus it holds in this sign (≥5 helps, ≤3 hinders).
    const occScore = planets.reduce((s, p) => {
      let v = p.valence;
      if (p.dignity) v += DIGNITY_MOD[p.dignity];
      if (p.combust) v -= 0.4;
      if (p.bindus != null) v += (p.bindus - 4) * 0.1;
      return s + v;
    }, 0);
    const aspectScore = aspectsIn.reduce((s, a) => s + (a.benefic ? 1 : -1) * (a.virupa / 60), 0);
    const house = houseBetween(lagna, rashi);
    let houseScore = [6, 8, 12].includes(house) ? -0.35 : [1, 5, 9].includes(house) ? 0.2 : 0;
    // Sarvashtakavarga: signs rich in bindus absorb transits well (avg ≈ 28).
    if (g.sarvaBindus) {
      houseScore += Math.max(-0.25, Math.min(0.25, (g.sarvaBindus[rashi] - 28) * 0.03));
    }

    const score = occScore + 0.7 * aspectScore + houseScore;
    const tone: SignInfo['tone'] = score >= 0.5 ? 'good' : score <= -0.5 ? 'bad' : 'neutral';

    result[rashi] = { rashi, houseFromLagna: house, planets, aspectsIn, occScore, aspectScore, houseScore, score, tone };
  }
  return result;
}

// ── Moon phase (tithi / paksha / nakshatra) ─────────────────────────────────────

const TITHI_NAMES = [
  'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
  'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
  'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima',
];

export interface MoonPhase {
  tithi: number;        // 1..30
  tithiName: string;
  paksha: 'Shukla' | 'Krishna';
  waxing: boolean;
  illumination: number; // 0..100 (% lit)
  nakshatra: string;
  nakshatraIndex: number;
  pada: number;         // 1..4
}

/** Tithi, paksha, illumination and the transit Moon's nakshatra/pada. */
export function computeMoonPhase(sunLong: number, moonLong: number, moonNakIndex: number, moonPada: number): MoonPhase {
  const diff = (((moonLong - sunLong) % 360) + 360) % 360;
  const tithi = Math.floor(diff / 12) + 1; // 1..30
  const paksha: MoonPhase['paksha'] = tithi <= 15 ? 'Shukla' : 'Krishna';
  const tithiName = tithi === 30 ? 'Amavasya' : tithi === 15 ? 'Purnima' : TITHI_NAMES[(tithi - 1) % 15];
  const illumination = Math.round(((1 - Math.cos((diff * Math.PI) / 180)) / 2) * 100);
  return {
    tithi, tithiName, paksha, waxing: paksha === 'Shukla', illumination,
    nakshatra: NAKSHATRAS[moonNakIndex]?.[0] ?? '', nakshatraIndex: moonNakIndex, pada: moonPada,
  };
}

// ── Planetary war (graha yuddha) ────────────────────────────────────────────────

const TARA_GRAHAS = new Set(['MARS', 'MERCURY', 'JUPITER', 'VENUS', 'SATURN']);

/** Flag tara grahas (non-luminaries, non-nodes) that are within 1° in the same sign. */
export function annotateGrahaYuddha(transits: PlanetTransit[]): void {
  const tara = transits.filter(t => TARA_GRAHAS.has(t.planet));
  for (let i = 0; i < tara.length; i++) {
    for (let j = i + 1; j < tara.length; j++) {
      const a = tara[i], b = tara[j];
      if (a.rashi !== b.rashi) continue;
      const sep = Math.abs(a.longitude - b.longitude);
      if (Math.min(sep, 360 - sep) <= 1) {
        a.war = { with: b.planet };
        b.war = { with: a.planet };
      }
    }
  }
}

// ── Gandanta (water–fire sign junction) ─────────────────────────────────────────

const GANDANTA_WATER = new Set([3, 7, 11]); // Cancer, Scorpio, Pisces — last 3°20'
const GANDANTA_FIRE = new Set([0, 4, 8]);   // Aries, Leo, Sagittarius — first 3°20'

/** True if a position falls in the karmic water–fire junction (last/first 3°20'). */
export function isGandanta(rashi: number, rashiDegree: number): boolean {
  if (GANDANTA_WATER.has(rashi) && rashiDegree >= 26.6667) return true;
  if (GANDANTA_FIRE.has(rashi) && rashiDegree <= 3.3333) return true;
  return false;
}

export function annotateGandanta(transits: PlanetTransit[]): void {
  for (const t of transits) if (isGandanta(t.rashi, t.rashiDegree)) t.gandanta = true;
}

// ── Transit dignity & state (dignity / combustion / stationary) ──────────────────

/** Transit dignity reuses the natal dignity table (exalted/own/debilitated/…). */
export function transitDignity(planet: string, rashi: number): DignityLevel {
  return getDignity(titleCase(planet), rashi);
}

/** Standard combustion (asta) orbs in degrees from the Sun; tighter when retro. */
const COMBUSTION_ORB: Record<string, { direct: number; retro: number }> = {
  MOON:    { direct: 12, retro: 12 },
  MARS:    { direct: 17, retro: 17 },
  MERCURY: { direct: 14, retro: 12 },
  JUPITER: { direct: 11, retro: 11 },
  VENUS:   { direct: 10, retro: 8 },
  SATURN:  { direct: 15, retro: 15 },
};

export function isCombust(planet: string, planetLong: number, sunLong: number, retrograde: boolean): boolean {
  const orb = COMBUSTION_ORB[planet];
  if (!orb) return false;
  const sep = (((planetLong - sunLong) % 360) + 360) % 360;
  const d = Math.min(sep, 360 - sep);
  return d <= (retrograde ? orb.retro : orb.direct);
}

/** A planet is "stationary" near a retrograde/direct station — |speed| ≈ 0. */
const STATION_THRESHOLD: Record<string, number> = {
  MERCURY: 0.15, VENUS: 0.15, MARS: 0.06, JUPITER: 0.015, SATURN: 0.008,
};

export function isStationary(planet: string, speed: number): boolean {
  const th = STATION_THRESHOLD[planet];
  return th != null && Math.abs(speed) < th;
}

/** Annotate dignity, combustion and stationary state on each transit in place. */
export function annotateDignityState(transits: PlanetTransit[], sunLong: number): void {
  for (const t of transits) {
    t.dignity = transitDignity(t.planet, t.rashi);
    if (t.planet !== 'SUN') t.combust = isCombust(t.planet, t.longitude, sunLong, t.isRetrograde);
    t.stationary = isStationary(t.planet, t.speed);
  }
}

/** Per-dignity contribution to the favourability score. */
const DIGNITY_MOD: Record<DignityLevel, number> = {
  'exalted': 0.5, 'own-sign': 0.3, 'friend-sign': 0.15,
  'neutral-sign': 0, 'enemy-sign': -0.15, 'debilitated': -0.5,
};

// ── Ashtakavarga bindus for transits ────────────────────────────────────────────

const AV_KEY: Record<string, AvPlanet> = {
  SUN: 'Sun', MOON: 'Moon', MARS: 'Mars', MERCURY: 'Mercury',
  JUPITER: 'Jupiter', VENUS: 'Venus', SATURN: 'Saturn',
};

/**
 * Annotate each transit with the bindus (0–8) the planet holds in its current
 * sign per the natal Bhinnashtakavarga — the classical strength filter for
 * gochara results (Phaladeepika: a transit through a sign with 5+ bindus gives
 * good results even in an adverse house; ≤2 bindus spoils even a good house).
 * Returns the natal Sarvashtakavarga vector, or undefined when the natal
 * rashis are incomplete. Nodes have no ashtakavarga and stay unannotated.
 */
export function annotateBindus(
  transits: PlanetTransit[],
  natalRashis: Record<string, number>,
): number[] | undefined {
  const positions = {} as Record<Contributor, number>;
  for (const [key, av] of Object.entries(AV_KEY)) {
    if (natalRashis[key] == null) return undefined;
    positions[av] = natalRashis[key];
  }
  if (natalRashis['ASCENDANT'] == null) return undefined;
  positions['Lagna'] = natalRashis['ASCENDANT'];

  const av = computeAshtakavarga(positions);
  for (const t of transits) {
    const key = AV_KEY[t.planet];
    if (key) t.bindus = av.bhinna[key][t.rashi];
  }
  return av.sarva;
}

// ── Tara Bala (nakshatra strength of the day) ───────────────────────────────────

export interface TaraBala {
  /** 1–9 position in the tara cycle counted from the janma nakshatra. */
  tara: number;
  name: string;
  favourable: boolean;
  description: string;
}

const TARAS: [name: string, favourable: boolean, description: string][] = [
  ['Janma',        false, 'the birth-star day — body and mind are sensitive; routine over risk.'],
  ['Sampat',       true,  'a wealth star — favourable for gains, purchases and beginnings.'],
  ['Vipat',        false, 'a danger star — avoid risks, journeys and confrontation.'],
  ['Kshema',       true,  'a well-being star — protective and prosperous; good for most matters.'],
  ['Pratyak',      false, 'an obstacle star — plans meet resistance; postpone what can wait.'],
  ['Sadhana',      true,  'an achievement star — efforts succeed; act on goals.'],
  ['Naidhana',     false, 'the most adverse star — keep the day light and defer key decisions.'],
  ['Mitra',        true,  'a friendly star — cooperation, meetings and support flow.'],
  ['Parama Mitra', true,  'the best-friend star — highly supportive for anything important.'],
];

/**
 * Tara Bala: the transit Moon's nakshatra counted from the natal Moon's
 * nakshatra, reduced to the 9-fold tara cycle. A classical day-quality filter.
 */
export function computeTaraBala(natalNakshatra: number, transitNakshatra: number): TaraBala {
  const count = ((transitNakshatra - natalNakshatra + 27) % 27) + 1;
  const tara = ((count - 1) % 9) + 1;
  const [name, favourable, description] = TARAS[tara - 1];
  return { tara, name, favourable, description };
}

// ── Vedha (obstruction) ─────────────────────────────────────────────────────────

/**
 * Maps each planet's auspicious transit house (from the natal Moon) to the
 * "vedha" (obstruction) house. When another planet occupies the vedha house,
 * the auspicious result is cancelled. Source: Phaladeepika, Gochara chapter.
 */
export const VEDHA_FOR_GOOD: Record<string, Record<number, number>> = {
  SUN:     { 3: 9, 6: 12, 10: 4, 11: 5 },
  MOON:    { 1: 5, 3: 9, 6: 12, 7: 2, 10: 4, 11: 8 },
  MARS:    { 3: 12, 6: 9, 11: 5 },
  MERCURY: { 2: 5, 4: 3, 6: 9, 8: 1, 10: 8, 11: 12 },
  JUPITER: { 2: 12, 5: 4, 7: 3, 9: 10, 11: 8 },
  VENUS:   { 1: 8, 2: 7, 3: 1, 4: 10, 5: 9, 8: 5, 9: 11, 11: 3, 12: 6 },
  SATURN:  { 3: 12, 6: 9, 11: 5 },
};

/** No vedha occurs between these planet pairs (Sun–Saturn, Moon–Mercury). */
export const VEDHA_EXEMPT: Record<string, string> = {
  SUN: 'SATURN', SATURN: 'SUN', MOON: 'MERCURY', MERCURY: 'MOON',
};

/**
 * Apply Gochara vedha in place: if a planet sits in an auspicious house from the
 * Moon but another (non-exempt) planet occupies its vedha house, the auspicious
 * result is obstructed — valence drops to neutral and a `vedha` marker is set.
 * Rahu/Ketu neither cause nor receive vedha (no classical rule).
 */
export function applyVedha(transits: PlanetTransit[], natalMoonRashi: number): void {
  const occupants: Record<number, string[]> = {};
  for (const tr of transits) {
    if (VEDHA_FOR_GOOD[tr.planet]) (occupants[tr.rashi] ??= []).push(tr.planet);
  }
  for (const tr of transits) {
    if (tr.valence <= 0) continue; // only auspicious results are obstructed
    const vHouse = VEDHA_FOR_GOOD[tr.planet]?.[tr.houseFromMoon];
    if (!vHouse) continue;
    const vedhaRashi = (natalMoonRashi + vHouse - 1) % 12;
    const obstructor = (occupants[vedhaRashi] ?? []).find(q => q !== tr.planet && VEDHA_EXEMPT[tr.planet] !== q);
    if (obstructor) {
      tr.valence = 0;
      tr.vedha = { byPlanet: obstructor, house: vHouse };
      const msg = `Auspicious result obstructed (vedha) by ${titleCase(obstructor)}.`;
      tr.note = tr.note ? `${tr.note} · ${msg}` : msg;
    }
  }
}

// ── Transit → Natal (bi-wheel contacts) ─────────────────────────────────────────

export interface TransitNatalHit {
  transit: string;      // transiting planet
  natal: string;        // natal planet/point
  natalRashi: number;
  kind: 'conjunction' | 'aspect';
  house: number;        // sign offset transit→natal (1 = conjunction)
  virupa: number;       // 60 for conjunction; graded strength for aspect
  orb?: number;         // degrees between the two (conjunction only)
}

function angularSep(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

/** All transit→natal conjunctions and aspects, strongest first. */
export function computeTransitNatal(g: GocharaSnapshot): TransitNatalHit[] {
  const hits: TransitNatalHit[] = [];
  for (const tr of g.transits) {
    for (const n of g.natalPlanets) {
      if (tr.rashi === n.rashi) {
        hits.push({
          transit: tr.planet, natal: n.planet, natalRashi: n.rashi, kind: 'conjunction',
          house: 1, virupa: 60, orb: Math.round(angularSep(tr.longitude, n.longitude) * 10) / 10,
        });
      } else {
        const virupa = aspectVirupa(tr.planet, tr.rashi, n.rashi);
        if (virupa > 0) {
          hits.push({ transit: tr.planet, natal: n.planet, natalRashi: n.rashi, kind: 'aspect', house: houseBetween(tr.rashi, n.rashi), virupa });
        }
      }
    }
  }
  return hits.sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === 'conjunction' ? -1 : 1;
    if (a.kind === 'conjunction') return (a.orb ?? 99) - (b.orb ?? 99);
    return b.virupa - a.virupa;
  });
}

// ── Predictions ───────────────────────────────────────────────────────────────

export interface TransitPrediction {
  id: string;
  tone: 'good' | 'bad' | 'neutral' | 'info';
  /** Technical label (Sanskrit term / astro shorthand) — shown as a small tag. */
  title: string;
  /** Full astrological explanation — the fine print. */
  text: string;
  /** Jargon-free headline an ordinary reader understands at a glance. */
  plainTitle: string;
  /** One-sentence everyday-language takeaway: what it means and what to do. */
  plain: string;
}

function titleCase(s: string): string {
  return s.charAt(0) + s.slice(1).toLowerCase();
}

const RETRO_TEXT: Record<string, string> = {
  MERCURY: 'review communication, contracts, travel and devices — double-check details before committing.',
  VENUS: 'revisit relationships, finances and values; reconnect and refine rather than starting anew.',
  MARS: 'channel energy with care; avoid impulsive conflict and rushed decisions.',
  JUPITER: 'turn growth inward — reflect on beliefs, learning and long-term direction.',
  SATURN: 'revisit duties and structures; consolidate and complete rather than expand.',
};

export interface DashaLords { mahadasha?: string; antardasha?: string; }

/** Generate interpretive transit predictions from the snapshot + sign analysis. */
export function buildTransitPredictions(
  g: GocharaSnapshot,
  signs: Record<number, SignInfo>,
  dasha?: DashaLords,
): TransitPrediction[] {
  const preds: TransitPrediction[] = [];
  const lagna = g.natalLagnaRashi;
  const moon = g.natalMoonRashi;

  // 1. Overall climate (occupancy valence balance)
  const good = g.transits.filter(t => t.valence > 0).length;
  const bad = g.transits.filter(t => t.valence < 0).length;
  const net = good - bad;
  preds.push({
    id: 'overall',
    tone: net >= 2 ? 'good' : net <= -2 ? 'bad' : 'neutral',
    title: 'Overall transit climate',
    plainTitle: 'The overall weather right now',
    plain: net >= 2
      ? 'More planets are helping you than testing you — a good time to start things and say yes.'
      : net <= -2
        ? 'More planets are testing you than helping — keep life simple and don’t take on extra battles.'
        : 'The sky is mixed — some things flow, some drag. Pick your moments.',
    text: net >= 2
      ? `A broadly supportive period — ${good} planets are in favourable transit versus ${bad} under pressure. Good momentum for initiating plans.`
      : net <= -2
        ? `A demanding stretch — ${bad} planets are in challenging transit versus ${good} favourable. Focus on essentials and avoid overreach.`
        : `A mixed period — ${good} favourable and ${bad} challenging transits. Pick your moments and stay flexible.`,
  });

  // 1b. Dasha–Gochara synthesis — does transit "fire" the running dasha?
  if (dasha) {
    const describe = (role: 'Mahadasha' | 'Antardasha', lordRaw?: string) => {
      if (!lordRaw) return;
      const lord = lordRaw.toUpperCase();
      const tr = g.transits.find(t => t.planet === lord);
      if (!tr) return;
      const afflicted = !!tr.vedha || !!tr.war || !!tr.gandanta || !!tr.combust || tr.dignity === 'debilitated';
      const dignified = tr.dignity === 'exalted' || tr.dignity === 'own-sign';
      const good = !afflicted && (tr.valence > 0 || dignified);
      const bad = !good && (tr.valence < 0 || afflicted);
      const lower = role.toLowerCase();
      const place = `transiting the ${ordinal(tr.houseFromMoon)} from your Moon and the ${ordinal(tr.houseFromLagna)} from the Lagna${tr.isRetrograde ? ', retrograde' : ''}`;
      const flags = [
        tr.dignity === 'exalted' && 'exalted', tr.dignity === 'own-sign' && 'in own sign',
        tr.dignity === 'debilitated' && 'debilitated', tr.combust && 'combust',
        tr.stationary && 'stationary', tr.vedha && 'vedha-obstructed',
        tr.war && 'in planetary war', tr.gandanta && 'in gandanta',
      ].filter(Boolean).join(', ');
      const verdict = good
        ? `is well placed in transit (${place}${flags ? `, ${flags}` : ''}) — it actively "fires" the running ${lower}, so its promised results are supported now. A good window to act on its themes.`
        : bad
          ? `is under pressure in transit (${place}${flags ? `, ${flags}` : ''}) — the ${lower}'s results are subdued or delayed for now; be patient and avoid forcing outcomes.`
          : `is neutrally placed in transit (${place}) — the ${lower} ticks along steadily, neither strongly activated nor blocked.`;
      preds.push({
        id: `dasha-${role}`,
        tone: good ? 'good' : bad ? 'bad' : 'neutral',
        title: `${role} lord ${titleCase(lord)} in transit`,
        plainTitle: `${titleCase(lord)}, the planet running your current life chapter`,
        plain: good
          ? `${titleCase(lord)} is in a strong position right now — the themes of your current period get a green light. Act on them.`
          : bad
            ? `${titleCase(lord)} is having a hard time in the sky right now — results from your current period may feel slow. Don’t force it.`
            : `${titleCase(lord)} is coasting — your current period runs steadily, with no big push either way.`,
        text: `Your ${lower} lord ${titleCase(lord)} ${verdict}`,
      });
    };
    describe('Mahadasha', dasha.mahadasha);
    if (dasha.antardasha && dasha.antardasha.toUpperCase() !== (dasha.mahadasha ?? '').toUpperCase()) {
      describe('Antardasha', dasha.antardasha);
    }
  }

  // 2. Sade Sati
  if (g.sadeSati.active) {
    preds.push({
      id: 'sadesati', tone: 'bad', title: 'Sade Sati active',
      plainTitle: 'Saturn’s long 7½-year test is on',
      plain: 'Life feels heavier and slower than usual in this phase. It passes — keep routines simple, rest well and avoid shortcuts.',
      text: g.sadeSati.description,
    });
  }

  // 3. Jupiter blessing
  preds.push({
    id: 'guru',
    tone: g.jupiterBlessing.auspicious ? 'good' : 'neutral',
    title: 'Jupiter (Guru) transit',
    plainTitle: 'Jupiter — your luck and growth planet',
    plain: g.jupiterBlessing.auspicious
      ? 'Jupiter is smiling on you right now — growth, opportunities and help from others come easier. Use this window.'
      : 'Jupiter is in teaching mode rather than gifting mode — growth comes through lessons, not luck. Learn, don’t chase.',
    text: g.jupiterBlessing.reason,
  });

  // 4. Strong aspects on the Lagna
  for (const a of signs[lagna].aspectsIn.filter(a => a.virupa >= 30).sort((x, y) => y.virupa - x.virupa).slice(0, 2)) {
    preds.push({
      id: `lagna-${a.planet}`,
      tone: a.benefic ? 'good' : 'bad',
      title: `${titleCase(a.planet)} aspects your Lagna (${aspectPct(a.virupa)}%)`,
      plainTitle: `${titleCase(a.planet)} is shining on your body & confidence`,
      plain: a.benefic
        ? `${titleCase(a.planet)}’s gaze boosts your energy and presence — a good stretch to be seen, speak up and take initiative.`
        : `${titleCase(a.planet)}’s gaze presses on your energy and self-image — pace yourself, sleep enough and don’t overcommit.`,
      text: a.benefic
        ? `${titleCase(a.planet)} casts a strong aspect on your ascendant — supports vitality, confidence and how you show up. A window to put yourself forward.`
        : `${titleCase(a.planet)} casts a strong aspect on your ascendant — adds pressure to health, energy and self-image. Pace yourself and protect your wellbeing.`,
    });
  }

  // 5. Strong aspects on the natal Moon sign
  for (const a of signs[moon].aspectsIn.filter(a => a.virupa >= 30).sort((x, y) => y.virupa - x.virupa).slice(0, 2)) {
    preds.push({
      id: `moon-${a.planet}`,
      tone: a.benefic ? 'good' : 'bad',
      title: `${titleCase(a.planet)} aspects your Moon sign (${aspectPct(a.virupa)}%)`,
      plainTitle: `${titleCase(a.planet)} is influencing your mood`,
      plain: a.benefic
        ? `${titleCase(a.planet)}’s influence steadies your emotions — relationships and peace of mind feel easier now.`
        : `${titleCase(a.planet)}’s influence stirs your emotions — expect more stress than usual; protect sleep and don’t react in the moment.`,
      text: a.benefic
        ? `${titleCase(a.planet)} aspects your natal Moon — emotional steadiness and support; mood and relationships feel easier.`
        : `${titleCase(a.planet)} aspects your natal Moon — peace of mind is tested; guard against stress, reactivity and broken sleep.`,
    });
  }

  // 6. Saturn special position (when not already Sade Sati)
  const saturn = g.transits.find(t => t.planet === 'SATURN');
  if (saturn?.note && !g.sadeSati.active) {
    preds.push({
      id: 'saturn', tone: saturn.valence > 0 ? 'good' : 'bad', title: 'Saturn transit',
      plainTitle: 'Saturn — the discipline planet',
      plain: saturn.valence > 0
        ? 'Saturn is on your side for now — steady, patient effort gets rewarded. Keep showing up.'
        : 'Saturn is testing you in one area of life — expect delays there and answer with patience, not force.',
      text: saturn.note,
    });
  }

  // 7. Retrogrades
  const retro = g.transits.filter(t => t.isRetrograde && RETRO_TEXT[t.planet]);
  if (retro.length) {
    preds.push({
      id: 'retro',
      tone: 'info',
      title: `Retrograde: ${retro.map(r => titleCase(r.planet)).join(', ')}`,
      plainTitle: 'Some planets are in “review mode”',
      plain: 'A backward-moving planet favours finishing, fixing and double-checking over brand-new starts in its areas.',
      text: retro.map(r => `${titleCase(r.planet)} — ${RETRO_TEXT[r.planet]}`).join(' '),
    });
  }

  // 8. Gandanta — planets at the karmic water–fire junction
  const gand = g.transits.filter(t => t.gandanta);
  if (gand.length) {
    const isAre = gand.length > 1 ? 'are' : 'is';
    preds.push({
      id: 'gandanta',
      tone: 'bad',
      title: 'Gandanta (sign junction)',
      plainTitle: `${gand.map(t => titleCase(t.planet)).join(' & ')} at a delicate turning point`,
      plain: 'Things connected to this planet feel shaky for a few days — hold off on big commitments there until it settles.',
      text: `${gand.map(t => titleCase(t.planet)).join(', ')} ${isAre} in gandanta — the karmic water–fire junction. Matters ruled by ${gand.length > 1 ? 'these planets' : 'this planet'} feel unstable and tender now; avoid major commitments through ${gand.length > 1 ? 'them' : 'it'}.`,
    });
  }

  // 9. Planetary war — tara grahas within 1°
  const seen = new Set<string>();
  const wars: string[] = [];
  for (const t of g.transits) {
    if (!t.war) continue;
    const key = [t.planet, t.war.with].sort().join('-');
    if (seen.has(key)) continue;
    seen.add(key);
    wars.push(`${titleCase(t.planet)} & ${titleCase(t.war.with)}`);
  }
  if (wars.length) {
    preds.push({
      id: 'war',
      tone: 'bad',
      title: 'Planetary war (Graha Yuddha)',
      plainTitle: `${wars.join(' and ')} are clashing in the sky`,
      plain: 'Two planets are crowding each other, so the things they stand for pull in opposite directions for a short while — expect friction there.',
      text: `${wars.join('; ')} ${wars.length > 1 ? 'are' : 'is'} within 1° — a planetary war. Their significations clash and the weaker planet's results are compromised while they stay this close.`,
    });
  }

  // 9a2. Ashtakavarga support — bindus of the transited signs
  const withBindus = g.transits.filter(t => t.bindus != null);
  if (withBindus.length) {
    const rich = withBindus.filter(t => t.bindus! >= 6);
    const poor = withBindus.filter(t => t.bindus! <= 2);
    if (rich.length || poor.length) {
      const parts: string[] = [];
      if (rich.length) parts.push(`Well supported — ${rich.map(t => `${titleCase(t.planet)} (${t.bindus}/8 bindus)`).join(', ')}`);
      if (poor.length) parts.push(`Poorly supported — ${poor.map(t => `${titleCase(t.planet)} (${t.bindus}/8 bindus)`).join(', ')}`);
      preds.push({
        id: 'ashtakavarga',
        tone: poor.length > rich.length ? 'bad' : rich.length ? 'good' : 'neutral',
        title: 'Ashtakavarga support',
        plainTitle: 'How much backing each planet has from your birth chart',
        plain: [
          rich.length ? `${rich.map(t => titleCase(t.planet)).join(', ')} ${rich.length > 1 ? 'are' : 'is'} running on a full tank for you — lean on ${rich.length > 1 ? 'their' : 'its'} themes` : '',
          poor.length ? `${poor.map(t => titleCase(t.planet)).join(', ')} ${poor.length > 1 ? 'are' : 'is'} running on low fuel — don’t expect much from ${poor.length > 1 ? 'their' : 'its'} areas right now` : '',
        ].filter(Boolean).join('; ') + '.',
        text: `${parts.join('. ')}. A planet transiting a sign where it holds 5+ bindus in your natal ashtakavarga delivers its good promise even under pressure; with 2 or fewer, even a favourable house yields little.`,
      });
    }
  }

  // 9b. Transit strength & state — dignity / combustion / stationary
  const strong = g.transits.filter(t => t.dignity === 'exalted' || t.dignity === 'own-sign');
  const weak = g.transits.filter(t => t.dignity === 'debilitated' || t.combust);
  const stationary = g.transits.filter(t => t.stationary);
  if (strong.length || weak.length || stationary.length) {
    const parts: string[] = [];
    if (strong.length) parts.push(`Strong — ${strong.map(t => `${titleCase(t.planet)} (${t.dignity === 'exalted' ? 'exalted' : 'own sign'})`).join(', ')}`);
    if (weak.length) parts.push(`Weakened — ${weak.map(t => `${titleCase(t.planet)} (${t.combust ? 'combust' : 'debilitated'})`).join(', ')}`);
    if (stationary.length) parts.push(`Stationary/pivotal — ${stationary.map(t => titleCase(t.planet)).join(', ')}`);
    preds.push({
      id: 'strength',
      tone: weak.length > strong.length ? 'bad' : strong.length ? 'good' : 'neutral',
      title: 'Transit strength & state',
      plainTitle: 'Which planets are strong or weak right now',
      plain: [
        strong.length ? `${strong.map(t => titleCase(t.planet)).join(', ')} ${strong.length > 1 ? 'are' : 'is'} at full power — ${strong.length > 1 ? 'their' : 'its'} areas of life flow well` : '',
        weak.length ? `${weak.map(t => titleCase(t.planet)).join(', ')} ${weak.length > 1 ? 'are' : 'is'} dimmed — go easy on ${weak.length > 1 ? 'their' : 'its'} areas` : '',
        stationary.length ? `${stationary.map(t => titleCase(t.planet)).join(', ')} ${stationary.length > 1 ? 'are' : 'is'} at a standstill — a turning point in ${stationary.length > 1 ? 'their' : 'its'} matters` : '',
      ].filter(Boolean).join('; ') + '.',
      text: `${parts.join('. ')}. Exalted/own planets deliver near-peak results; combust or debilitated planets are weakened and need support; stationary planets are unusually potent but unstable as they change direction.`,
    });
  }

  // 9c. Transit → Natal contacts — the clearest event triggers
  const SLOW = new Set(['SATURN', 'JUPITER', 'RAHU', 'KETU', 'MARS']);
  const KEY_NATAL = new Set(['SUN', 'MOON', 'ASCENDANT']);
  const tnHits = computeTransitNatal(g).filter(h =>
    ((h.kind === 'conjunction' && (h.orb ?? 99) <= 10) || h.virupa >= 45) &&
    (SLOW.has(h.transit) || KEY_NATAL.has(h.natal)) &&
    h.transit !== h.natal,
  );
  if (tnHits.length) {
    const items = tnHits.slice(0, 4).map(h =>
      h.kind === 'conjunction'
        ? `${titleCase(h.transit)} conjoins natal ${titleCase(h.natal)} (${h.orb}° orb)`
        : `${titleCase(h.transit)} aspects natal ${titleCase(h.natal)} (${ordinal(h.house)}, ${aspectPct(h.virupa)}%)`,
    );
    preds.push({
      id: 'transit-natal',
      tone: 'info',
      title: 'Transit → Natal contacts',
      plainTitle: 'Planets touching sensitive spots in your birth chart',
      plain: 'When a moving planet touches a planet you were born with, real events tend to follow in that part of life — these are the contacts to watch.',
      text: `${items.join('; ')}. These contacts activate the natal significations of the planets involved — the clearest triggers for events during this period.`,
    });
  }

  // 10. Daily Moon — tithi / paksha / illumination / nakshatra
  const tMoon = g.transits.find(t => t.planet === 'MOON');
  const mp = g.moonPhase;
  if (tMoon && mp) {
    preds.push({
      id: 'tmoon',
      tone: tMoon.valence > 0 ? 'good' : tMoon.valence < 0 ? 'bad' : 'neutral',
      title: `Moon: ${mp.tithiName} (${mp.paksha} paksha)`,
      plainTitle: 'Today’s Moon — your day-to-day mood',
      plain: `${mp.waxing ? 'The Moon is growing — good for starting and reaching out.' : 'The Moon is shrinking — good for finishing and winding down.'} Today’s mood runs ${tMoon.valence > 0 ? 'light and easy' : tMoon.valence < 0 ? 'a bit sensitive — be kind to yourself' : 'steady'}. This changes every couple of days.`,
      text: `The Moon is ${mp.illumination}% lit in ${RASHIS[tMoon.rashi]}, nakshatra ${mp.nakshatra} pada ${mp.pada} — the ${ordinal(tMoon.houseFromMoon)} from your natal Moon. ${mp.waxing ? 'A waxing, building phase — favours initiating, growth and outreach.' : 'A waning, releasing phase — favours completing, letting go and inner work.'} Daily mood feels ${tMoon.valence > 0 ? 'lighter and supportive' : tMoon.valence < 0 ? 'sensitive and lower-energy' : 'steady'}; the Moon changes sign in ~2¼ days.`,
    });
  }

  // 10b. Tara Bala — the day's nakshatra quality from the janma nakshatra
  if (g.taraBala) {
    const tb = g.taraBala;
    preds.push({
      id: 'tarabala',
      tone: tb.favourable ? 'good' : 'bad',
      title: `Tara Bala: ${tb.name} (${ordinal(tb.tara)} tara)`,
      plainTitle: tb.favourable ? 'Today’s star is friendly to you' : 'Today’s star is not on your side',
      plain: tb.favourable
        ? 'By your personal day-star cycle, today favours important moves — sign, book, ask, begin.'
        : 'By your personal day-star cycle, today is better for routine than risk — big decisions can wait a day or two.',
      text: `The Moon rides your ${ordinal(tb.tara)} tara today — ${tb.name}, ${tb.description} The tara cycle re-runs every 9 nakshatras (~9 days), so this quality shifts daily.`,
    });
  }

  // 9. Vedha (obstruction) — auspicious transits that got cancelled
  const vedhas = g.transits.filter(t => t.vedha);
  if (vedhas.length) {
    preds.push({
      id: 'vedha',
      tone: 'neutral',
      title: 'Vedha (obstruction)',
      plainTitle: 'A good influence is temporarily on hold',
      plain: `${vedhas.map(v => titleCase(v.planet)).join(' and ')} would normally be helping you now, but another planet is blocking the benefit — don’t count on it until the block passes.`,
      text: `${vedhas.map(v => `${titleCase(v.planet)}'s favourable transit is obstructed by ${titleCase(v.vedha!.byPlanet)}`).join('; ')}. The blocked good result is cancelled for now — don't over-rely on it.`,
    });
  }

  // 10. Nodal axis
  preds.push({
    id: 'nodes', tone: 'info', title: 'Rahu–Ketu axis',
    plainTitle: 'Where obsession and letting-go live right now',
    plain: 'Rahu marks where life pulls hardest at your ambition; Ketu marks what you’re being asked to release. They stay put for about 18 months.',
    text: g.nodalShift.note,
  });

  return preds;
}
