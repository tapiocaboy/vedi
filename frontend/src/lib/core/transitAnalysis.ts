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
    // dignity (exalted/own strengthen, debilitated weakens) and combustion.
    const occScore = planets.reduce((s, p) => {
      let v = p.valence;
      if (p.dignity) v += DIGNITY_MOD[p.dignity];
      if (p.combust) v -= 0.4;
      return s + v;
    }, 0);
    const aspectScore = aspectsIn.reduce((s, a) => s + (a.benefic ? 1 : -1) * (a.virupa / 60), 0);
    const house = houseBetween(lagna, rashi);
    const houseScore = [6, 8, 12].includes(house) ? -0.35 : [1, 5, 9].includes(house) ? 0.2 : 0;

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

// ── Vedha (obstruction) ─────────────────────────────────────────────────────────

/**
 * Maps each planet's auspicious transit house (from the natal Moon) to the
 * "vedha" (obstruction) house. When another planet occupies the vedha house,
 * the auspicious result is cancelled. Source: Phaladeepika, Gochara chapter.
 */
const VEDHA_FOR_GOOD: Record<string, Record<number, number>> = {
  SUN:     { 3: 9, 6: 12, 10: 4, 11: 5 },
  MOON:    { 1: 5, 3: 9, 6: 12, 7: 2, 10: 4, 11: 8 },
  MARS:    { 3: 12, 6: 9, 11: 5 },
  MERCURY: { 2: 5, 4: 3, 6: 9, 8: 1, 10: 8, 11: 12 },
  JUPITER: { 2: 12, 5: 4, 7: 3, 9: 10, 11: 8 },
  VENUS:   { 1: 8, 2: 7, 3: 1, 4: 10, 5: 9, 8: 5, 9: 11, 11: 3, 12: 6 },
  SATURN:  { 3: 12, 6: 9, 11: 5 },
};

/** No vedha occurs between these planet pairs (Sun–Saturn, Moon–Mercury). */
const VEDHA_EXEMPT: Record<string, string> = {
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
  title: string;
  text: string;
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
    preds.push({ id: 'sadesati', tone: 'bad', title: 'Sade Sati active', text: g.sadeSati.description });
  }

  // 3. Jupiter blessing
  preds.push({
    id: 'guru',
    tone: g.jupiterBlessing.auspicious ? 'good' : 'neutral',
    title: 'Jupiter (Guru) transit',
    text: g.jupiterBlessing.reason,
  });

  // 4. Strong aspects on the Lagna
  for (const a of signs[lagna].aspectsIn.filter(a => a.virupa >= 30).sort((x, y) => y.virupa - x.virupa).slice(0, 2)) {
    preds.push({
      id: `lagna-${a.planet}`,
      tone: a.benefic ? 'good' : 'bad',
      title: `${titleCase(a.planet)} aspects your Lagna (${aspectPct(a.virupa)}%)`,
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
      text: a.benefic
        ? `${titleCase(a.planet)} aspects your natal Moon — emotional steadiness and support; mood and relationships feel easier.`
        : `${titleCase(a.planet)} aspects your natal Moon — peace of mind is tested; guard against stress, reactivity and broken sleep.`,
    });
  }

  // 6. Saturn special position (when not already Sade Sati)
  const saturn = g.transits.find(t => t.planet === 'SATURN');
  if (saturn?.note && !g.sadeSati.active) {
    preds.push({ id: 'saturn', tone: saturn.valence > 0 ? 'good' : 'bad', title: 'Saturn transit', text: saturn.note });
  }

  // 7. Retrogrades
  const retro = g.transits.filter(t => t.isRetrograde && RETRO_TEXT[t.planet]);
  if (retro.length) {
    preds.push({
      id: 'retro',
      tone: 'info',
      title: `Retrograde: ${retro.map(r => titleCase(r.planet)).join(', ')}`,
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
      text: `${wars.join('; ')} ${wars.length > 1 ? 'are' : 'is'} within 1° — a planetary war. Their significations clash and the weaker planet's results are compromised while they stay this close.`,
    });
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
      text: `The Moon is ${mp.illumination}% lit in ${RASHIS[tMoon.rashi]}, nakshatra ${mp.nakshatra} pada ${mp.pada} — the ${ordinal(tMoon.houseFromMoon)} from your natal Moon. ${mp.waxing ? 'A waxing, building phase — favours initiating, growth and outreach.' : 'A waning, releasing phase — favours completing, letting go and inner work.'} Daily mood feels ${tMoon.valence > 0 ? 'lighter and supportive' : tMoon.valence < 0 ? 'sensitive and lower-energy' : 'steady'}; the Moon changes sign in ~2¼ days.`,
    });
  }

  // 9. Vedha (obstruction) — auspicious transits that got cancelled
  const vedhas = g.transits.filter(t => t.vedha);
  if (vedhas.length) {
    preds.push({
      id: 'vedha',
      tone: 'neutral',
      title: 'Vedha (obstruction)',
      text: `${vedhas.map(v => `${titleCase(v.planet)}'s favourable transit is obstructed by ${titleCase(v.vedha!.byPlanet)}`).join('; ')}. The blocked good result is cancelled for now — don't over-rely on it.`,
    });
  }

  // 10. Nodal axis
  preds.push({ id: 'nodes', tone: 'info', title: 'Rahu–Ketu axis', text: g.nodalShift.note });

  return preds;
}
