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
import { getDignity, getGandanta, type DignityLevel } from './planetaryAnalysis';
import { computeAshtakavarga, type Contributor, type Planet as AvPlanet } from './ashtakavarga';
import { type Lang, rashiName, joinAnd } from './i18n';
import { TP, TARA_DESC, RETRO_TEXT, joinPlanets, transitPlanet as P } from './text/transitText';

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/** Structural Title-case (keys getDignity etc.) — not a localised name. */
function titleCase(s: string): string {
  return s.charAt(0) + s.slice(1).toLowerCase();
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

/**
 * True if a position falls in the karmic water–fire junction (last/first 3°20').
 * Shares the natal band definition so transit and natal readings cannot drift.
 */
export function isGandanta(rashi: number, rashiDegree: number): boolean {
  return getGandanta(rashi, rashiDegree) !== null;
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

const TARA_FAVOURABLE: Record<number, boolean> = {
  1: false, 2: true, 3: false, 4: true, 5: false, 6: true, 7: false, 8: true, 9: true,
};

/**
 * Tara Bala: the transit Moon's nakshatra counted from the natal Moon's
 * nakshatra, reduced to the 9-fold tara cycle. A classical day-quality filter.
 */
export function computeTaraBala(natalNakshatra: number, transitNakshatra: number, lang: Lang = 'en'): TaraBala {
  const count = ((transitNakshatra - natalNakshatra + 27) % 27) + 1;
  const tara = ((count - 1) % 9) + 1;
  const entry = TARA_DESC[tara];
  return { tara, name: entry.name, favourable: TARA_FAVOURABLE[tara], description: lang === 'si' ? entry.desc.si : entry.desc.en };
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
export function applyVedha(transits: PlanetTransit[], natalMoonRashi: number, lang: Lang = 'en'): void {
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
      const msg = lang === 'si'
        ? `${P(obstructor, lang)} විසින් සුබ ප්‍රතිඵලය අවහිර කර ඇත (වේධ).`
        : `Auspicious result obstructed (vedha) by ${titleCase(obstructor)}.`;
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

export interface DashaLords { mahadasha?: string; antardasha?: string; }

function ordN(n: number, lang: Lang): string {
  if (lang === 'si') return `${n} වන`;
  return ordinal(n);
}

/** Generate interpretive transit predictions from the snapshot + sign analysis. */
export function buildTransitPredictions(
  g: GocharaSnapshot,
  signs: Record<number, SignInfo>,
  dasha?: DashaLords,
  lang: Lang = 'en',
): TransitPrediction[] {
  const preds: TransitPrediction[] = [];
  const lagna = g.natalLagnaRashi;
  const moon = g.natalMoonRashi;
  const t = (b: { en: string; si: string }) => (lang === 'si' ? b.si : b.en);

  // 1. Overall climate (occupancy valence balance)
  const good = g.transits.filter(t => t.valence > 0).length;
  const bad = g.transits.filter(t => t.valence < 0).length;
  const net = good - bad;
  preds.push({
    id: 'overall',
    tone: net >= 2 ? 'good' : net <= -2 ? 'bad' : 'neutral',
    title: t(TP.overallTitle),
    plainTitle: t(TP.overallPlainTitle),
    plain: TP.overallPlain(net, lang),
    text: TP.overallText(net, good, bad, lang),
  });

  // 1b. Dasha–Gochara synthesis — does transit "fire" the running dasha?
  if (dasha) {
    const describe = (role: 'Mahadasha' | 'Antardasha', lordRaw?: string) => {
      if (!lordRaw) return;
      const lordKey = lordRaw.toUpperCase();
      const tr = g.transits.find(t => t.planet === lordKey);
      if (!tr) return;
      const lord = P(lordKey, lang);
      const afflicted = !!tr.vedha || !!tr.war || !!tr.gandanta || !!tr.combust || tr.dignity === 'debilitated';
      const dignified = tr.dignity === 'exalted' || tr.dignity === 'own-sign';
      const isGood = !afflicted && (tr.valence > 0 || dignified);
      const isBad = !isGood && (tr.valence < 0 || afflicted);
      const kind: 'good' | 'bad' | 'neutral' = isGood ? 'good' : isBad ? 'bad' : 'neutral';
      preds.push({
        id: `dasha-${role}`,
        tone: kind,
        title: TP.dashaTitle(role, lord, lang),
        plainTitle: TP.dashaPlainTitle(lord, lang),
        plain: TP.dashaPlain(lord, kind, lang),
        text: TP.dashaPlain(lord, kind, lang),
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
      id: 'sadesati', tone: 'bad', title: t(TP.sadeSatiTitle),
      plainTitle: t(TP.sadeSatiPlainTitle),
      plain: t(TP.sadeSatiPlain),
      text: g.sadeSati.description,
    });
  }

  // 3. Jupiter blessing
  preds.push({
    id: 'guru',
    tone: g.jupiterBlessing.auspicious ? 'good' : 'neutral',
    title: t(TP.guruTitle),
    plainTitle: t(TP.guruPlainTitle),
    plain: TP.guruPlain(g.jupiterBlessing.auspicious, lang),
    text: g.jupiterBlessing.reason,
  });

  // 4. Strong aspects on the Lagna
  for (const a of signs[lagna].aspectsIn.filter(a => a.virupa >= 30).sort((x, y) => y.virupa - x.virupa).slice(0, 2)) {
    const planet = P(a.planet, lang);
    preds.push({
      id: `lagna-${a.planet}`,
      tone: a.benefic ? 'good' : 'bad',
      title: TP.lagnaAspectTitle(planet, aspectPct(a.virupa), lang),
      plainTitle: TP.lagnaAspectPlainTitle(planet, lang),
      plain: TP.lagnaAspectPlain(planet, a.benefic, lang),
      text: TP.lagnaAspectText(planet, a.benefic, lang),
    });
  }

  // 5. Strong aspects on the natal Moon sign
  for (const a of signs[moon].aspectsIn.filter(a => a.virupa >= 30).sort((x, y) => y.virupa - x.virupa).slice(0, 2)) {
    const planet = P(a.planet, lang);
    preds.push({
      id: `moon-${a.planet}`,
      tone: a.benefic ? 'good' : 'bad',
      title: TP.moonAspectTitle(planet, aspectPct(a.virupa), lang),
      plainTitle: TP.moonAspectPlainTitle(planet, lang),
      plain: TP.moonAspectPlain(planet, a.benefic, lang),
      text: TP.moonAspectText(planet, a.benefic, lang),
    });
  }

  // 6. Saturn special position (when not already Sade Sati)
  const saturn = g.transits.find(t => t.planet === 'SATURN');
  if (saturn?.note && !g.sadeSati.active) {
    preds.push({
      id: 'saturn', tone: saturn.valence > 0 ? 'good' : 'bad', title: t(TP.saturnTitle),
      plainTitle: t(TP.saturnPlainTitle),
      plain: TP.saturnPlain(saturn.valence > 0, lang),
      text: saturn.note,
    });
  }

  // 7. Retrogrades
  const retro = g.transits.filter(t => t.isRetrograde && RETRO_TEXT[t.planet]);
  if (retro.length) {
    preds.push({
      id: 'retro',
      tone: 'info',
      title: TP.retroTitle(joinPlanets(retro.map(r => r.planet), lang), lang),
      plainTitle: t(TP.retroPlainTitle),
      plain: t(TP.retroPlain),
      text: retro.map(r => `${P(r.planet, lang)} — ${lang === 'si' ? RETRO_TEXT[r.planet].si : RETRO_TEXT[r.planet].en}`).join(' '),
    });
  }

  // 8. Gandanta — planets at the karmic water–fire junction
  const gand = g.transits.filter(t => t.gandanta);
  if (gand.length) {
    const planets = joinPlanets(gand.map(t => t.planet), lang);
    preds.push({
      id: 'gandanta',
      tone: 'bad',
      title: t(TP.gandantaTitle),
      plainTitle: TP.gandantaPlainTitle(planets, lang),
      plain: t(TP.gandantaPlain),
      text: TP.gandantaText(planets, gand.length > 1, lang),
    });
  }

  // 9. Planetary war — tara grahas within 1°
  const seen = new Set<string>();
  const warPairs: string[] = [];
  for (const tr of g.transits) {
    if (!tr.war) continue;
    const key = [tr.planet, tr.war.with].sort().join('-');
    if (seen.has(key)) continue;
    seen.add(key);
    warPairs.push(`${P(tr.planet, lang)} ${lang === 'si' ? 'හා' : '&'} ${P(tr.war.with, lang)}`);
  }
  if (warPairs.length) {
    const pairs = joinAnd(warPairs, lang);
    preds.push({
      id: 'war',
      tone: 'bad',
      title: t(TP.warTitle),
      plainTitle: TP.warPlainTitle(pairs, lang),
      plain: t(TP.warPlain),
      text: TP.warText(pairs, warPairs.length > 1, lang),
    });
  }

  // 9a2. Ashtakavarga support — bindus of the transited signs
  const withBindus = g.transits.filter(t => t.bindus != null);
  if (withBindus.length) {
    const rich = withBindus.filter(t => t.bindus! >= 6);
    const poor = withBindus.filter(t => t.bindus! <= 2);
    if (rich.length || poor.length) {
      const richList = joinPlanets(rich.map(t => t.planet), lang);
      const poorList = joinPlanets(poor.map(t => t.planet), lang);
      const plainParts: string[] = [];
      const textParts: string[] = [];
      if (rich.length) {
        plainParts.push(lang === 'si'
          ? `${richList} ඔබ වෙනුවෙන් පූර්ණ ශක්තියෙන් ක්‍රියා කරයි — ${rich.length > 1 ? 'ඒවායේ' : 'එහි'} තේමා මත රැඳෙන්න`
          : `${richList} ${rich.length > 1 ? 'are' : 'is'} running on a full tank for you — lean on ${rich.length > 1 ? 'their' : 'its'} themes`);
        textParts.push(lang === 'si'
          ? `හොඳින් සහාය ලැබේ — ${rich.map(t => `${P(t.planet, lang)} (බින්දු ${t.bindus}/8)`).join(', ')}`
          : `Well supported — ${rich.map(t => `${P(t.planet, lang)} (${t.bindus}/8 bindus)`).join(', ')}`);
      }
      if (poor.length) {
        plainParts.push(lang === 'si'
          ? `${poorList} අඩු ශක්තියෙන් ක්‍රියා කරයි — දැන් ${poor.length > 1 ? 'ඒවායේ' : 'එහි'} ක්ෂේත්‍රවලින් වැඩිය අපේක්ෂා නොකරන්න`
          : `${poorList} ${poor.length > 1 ? 'are' : 'is'} running on low fuel — don’t expect much from ${poor.length > 1 ? 'their' : 'its'} areas right now`);
        textParts.push(lang === 'si'
          ? `දුර්වල ලෙස සහාය ලැබේ — ${poor.map(t => `${P(t.planet, lang)} (බින්දු ${t.bindus}/8)`).join(', ')}`
          : `Poorly supported — ${poor.map(t => `${P(t.planet, lang)} (${t.bindus}/8 bindus)`).join(', ')}`);
      }
      const avNote = lang === 'si'
        ? ' ග්‍රහයෙක් තම ජන්ම අෂ්ටකවර්ගයේ බින්දු 5+ක් දරන රාශියක් ගෝචරය කරන විට පීඩනය යටතේ පවා එහි යහ ප්‍රතිඵලය දෙයි; බින්දු 2ක් හෝ අඩු නම්, හිතකර භාවයක් වුවත් අල්ප ඵලයක් දෙයි.'
        : ' A planet transiting a sign where it holds 5+ bindus in your natal ashtakavarga delivers its good promise even under pressure; with 2 or fewer, even a favourable house yields little.';
      preds.push({
        id: 'ashtakavarga',
        tone: poor.length > rich.length ? 'bad' : rich.length ? 'good' : 'neutral',
        title: t(TP.avTitle),
        plainTitle: t(TP.avPlainTitle),
        plain: plainParts.join(lang === 'si' ? '; ' : '; ') + '.',
        text: `${textParts.join('. ')}.${avNote}`,
      });
    }
  }

  // 9b. Transit strength & state — dignity / combustion / stationary
  const strong = g.transits.filter(t => t.dignity === 'exalted' || t.dignity === 'own-sign');
  const weak = g.transits.filter(t => t.dignity === 'debilitated' || t.combust);
  const stationary = g.transits.filter(t => t.stationary);
  if (strong.length || weak.length || stationary.length) {
    const plainParts: string[] = [];
    const textParts: string[] = [];
    if (strong.length) {
      plainParts.push(lang === 'si'
        ? `${joinPlanets(strong.map(t => t.planet), lang)} පූර්ණ බලයෙන් සිටී — ${strong.length > 1 ? 'ඒවායේ' : 'එහි'} ජීවන ක්ෂේත්‍ර හොඳින් ගලා යයි`
        : `${joinPlanets(strong.map(t => t.planet), lang)} ${strong.length > 1 ? 'are' : 'is'} at full power — ${strong.length > 1 ? 'their' : 'its'} areas of life flow well`);
      textParts.push(lang === 'si'
        ? `ප්‍රබල — ${strong.map(t => `${P(t.planet, lang)} (${t.dignity === 'exalted' ? 'උච්ච' : 'ස්වක්ෂේත්‍ර'})`).join(', ')}`
        : `Strong — ${strong.map(t => `${P(t.planet, lang)} (${t.dignity === 'exalted' ? 'exalted' : 'own sign'})`).join(', ')}`);
    }
    if (weak.length) {
      plainParts.push(lang === 'si'
        ? `${joinPlanets(weak.map(t => t.planet), lang)} මොට වී ඇත — ${weak.length > 1 ? 'ඒවායේ' : 'එහි'} ක්ෂේත්‍රවල පහසුවෙන් කටයුතු කරන්න`
        : `${joinPlanets(weak.map(t => t.planet), lang)} ${weak.length > 1 ? 'are' : 'is'} dimmed — go easy on ${weak.length > 1 ? 'their' : 'its'} areas`);
      textParts.push(lang === 'si'
        ? `දුර්වල — ${weak.map(t => `${P(t.planet, lang)} (${t.combust ? 'අස්තංගත' : 'නීච'})`).join(', ')}`
        : `Weakened — ${weak.map(t => `${P(t.planet, lang)} (${t.combust ? 'combust' : 'debilitated'})`).join(', ')}`);
    }
    if (stationary.length) {
      plainParts.push(lang === 'si'
        ? `${joinPlanets(stationary.map(t => t.planet), lang)} නතර වී සිටී — ${stationary.length > 1 ? 'ඒවායේ' : 'එහි'} කරුණුවල හැරවුම් ලක්ෂ්‍යයකි`
        : `${joinPlanets(stationary.map(t => t.planet), lang)} ${stationary.length > 1 ? 'are' : 'is'} at a standstill — a turning point in ${stationary.length > 1 ? 'their' : 'its'} matters`);
      textParts.push(lang === 'si'
        ? `නිශ්චල/තීරණාත්මක — ${joinPlanets(stationary.map(t => t.planet), lang)}`
        : `Stationary/pivotal — ${joinPlanets(stationary.map(t => t.planet), lang)}`);
    }
    const strNote = lang === 'si'
      ? ' උච්ච/ස්වක්ෂේත්‍ර ග්‍රහයෝ උච්චතම ප්‍රතිඵල දෙති; අස්තංගත හෝ නීච ග්‍රහයෝ දුර්වල වන අතර සහාය අවශ්‍යය; නිශ්චල ග්‍රහයෝ අසාමාන්‍ය ලෙස බලවත් නමුත් දිශාව මාරු කරන විට අස්ථිරයි.'
      : ' Exalted/own planets deliver near-peak results; combust or debilitated planets are weakened and need support; stationary planets are unusually potent but unstable as they change direction.';
    preds.push({
      id: 'strength',
      tone: weak.length > strong.length ? 'bad' : strong.length ? 'good' : 'neutral',
      title: t(TP.strengthTitle),
      plainTitle: t(TP.strengthPlainTitle),
      plain: plainParts.join('; ') + '.',
      text: `${textParts.join('. ')}.${strNote}`,
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
        ? (lang === 'si'
            ? `${P(h.transit, lang)} ජන්ම ${P(h.natal, lang)} සමඟ එක් වේ (අංශක ${h.orb}ක් ඇතුළත)`
            : `${P(h.transit, lang)} conjoins natal ${P(h.natal, lang)} (${h.orb}° orb)`)
        : (lang === 'si'
            ? `${P(h.transit, lang)} ජන්ම ${P(h.natal, lang)} බලයි (${ordN(h.house, lang)}, ${aspectPct(h.virupa)}%)`
            : `${P(h.transit, lang)} aspects natal ${P(h.natal, lang)} (${ordinal(h.house)}, ${aspectPct(h.virupa)}%)`),
    );
    const tnNote = lang === 'si'
      ? ' මෙම සම්බන්ධතා අදාළ ග්‍රහයන්ගේ ජන්ම කරුණු සක්‍රිය කරයි — මෙම කාලයේ සිදුවීම්වලට පැහැදිලිම උත්තේජක.'
      : ' These contacts activate the natal significations of the planets involved — the clearest triggers for events during this period.';
    preds.push({
      id: 'transit-natal',
      tone: 'info',
      title: t(TP.tnTitle),
      plainTitle: t(TP.tnPlainTitle),
      plain: t(TP.tnPlain),
      text: `${items.join('; ')}.${tnNote}`,
    });
  }

  // 10. Daily Moon — tithi / paksha / illumination / nakshatra
  const tMoon = g.transits.find(t => t.planet === 'MOON');
  const mp = g.moonPhase;
  if (tMoon && mp) {
    const moodWord = tMoon.valence > 0
      ? (lang === 'si' ? 'සැහැල්ලු හා පහසු' : 'light and easy')
      : tMoon.valence < 0 ? (lang === 'si' ? 'තරමක් සංවේදී — ඔබටම කරුණාවන්ත වන්න' : 'a bit sensitive — be kind to yourself') : (lang === 'si' ? 'ස්ථාවර' : 'steady');
    const waxWord = mp.waxing
      ? (lang === 'si' ? 'චන්ද්‍රයා වැඩෙමින් — ආරම්භ කිරීමට හා සම්බන්ධ වීමට හොඳයි.' : 'The Moon is growing — good for starting and reaching out.')
      : (lang === 'si' ? 'චන්ද්‍රයා අඩු වෙමින් — නිම කිරීමට හා සන්සුන් වීමට හොඳයි.' : 'The Moon is shrinking — good for finishing and winding down.');
    const moodTextWord = tMoon.valence > 0 ? (lang === 'si' ? 'සැහැල්ලු හා සහායක' : 'lighter and supportive') : tMoon.valence < 0 ? (lang === 'si' ? 'සංවේදී හා අඩු ශක්තියක්' : 'sensitive and lower-energy') : (lang === 'si' ? 'ස්ථාවර' : 'steady');
    const waxTextPhrase = mp.waxing
      ? (lang === 'si' ? 'වැඩෙන, ගොඩනැගෙන අවධියකි — ආරම්භ, වර්ධනය හා සම්බන්ධතාවලට හිතකරයි.' : 'A waxing, building phase — favours initiating, growth and outreach.')
      : (lang === 'si' ? 'අඩුවන, මුදාහරින අවධියකි — නිම කිරීම, අත්හැරීම හා අභ්‍යන්තර වැඩවලට හිතකරයි.' : 'A waning, releasing phase — favours completing, letting go and inner work.');
    preds.push({
      id: 'tmoon',
      tone: tMoon.valence > 0 ? 'good' : tMoon.valence < 0 ? 'bad' : 'neutral',
      title: TP.moonTitle(mp.tithiName, mp.paksha, lang),
      plainTitle: t(TP.moonPlainTitle),
      plain: lang === 'si'
        ? `${waxWord} අද මනෝභාවය ${moodWord} ලෙස ගලා යයි. මෙය දින දෙක තුනකට වරක් වෙනස් වේ.`
        : `${waxWord} Today’s mood runs ${moodWord}. This changes every couple of days.`,
      text: lang === 'si'
        ? `චන්ද්‍රයා ${rashiName(tMoon.rashi, lang)} හි ${mp.illumination}% ක් ආලෝකමත් වී ඇත, ${mp.nakshatra} නක්ෂත්‍රයේ ${mp.pada} පාදයේ — ඔබේ ජන්ම චන්ද්‍රයාගෙන් ${ordN(tMoon.houseFromMoon, lang)}. ${waxTextPhrase} දෛනික මනෝභාවය ${moodTextWord} ලෙස දැනේ; චන්ද්‍රයා දින 2¼කින් පමණ රාශිය මාරු කරයි.`
        : `The Moon is ${mp.illumination}% lit in ${RASHIS[tMoon.rashi]}, nakshatra ${mp.nakshatra} pada ${mp.pada} — the ${ordinal(tMoon.houseFromMoon)} from your natal Moon. ${waxTextPhrase} Daily mood feels ${moodTextWord}; the Moon changes sign in ~2¼ days.`,
    });
  }

  // 10b. Tara Bala — the day's nakshatra quality from the janma nakshatra
  if (g.taraBala) {
    const tb = g.taraBala;
    preds.push({
      id: 'tarabala',
      tone: tb.favourable ? 'good' : 'bad',
      title: TP.taraTitle(tb.name, ordN(tb.tara, lang), lang),
      plainTitle: tb.favourable ? t(TP.taraPlainTitleGood) : t(TP.taraPlainTitleBad),
      plain: TP.taraPlain(tb.favourable, lang),
      text: lang === 'si'
        ? `අද චන්ද්‍රයා ඔබේ ${ordN(tb.tara, lang)} තාරාවේ ගමන් කරයි — ${tb.name}, ${tb.description} තාරා චක්‍රය සෑම නක්ෂත්‍ර 9කට වරක් (දින 9ක් පමණ) නැවත ක්‍රියාත්මක වේ, එබැවින් මෙම ගුණය දිනපතා වෙනස් වේ.`
        : `The Moon rides your ${ordinal(tb.tara)} tara today — ${tb.name}, ${tb.description} The tara cycle re-runs every 9 nakshatras (~9 days), so this quality shifts daily.`,
    });
  }

  // 9. Vedha (obstruction) — auspicious transits that got cancelled
  const vedhas = g.transits.filter(t => t.vedha);
  if (vedhas.length) {
    const planets = joinAnd(vedhas.map(v => P(v.planet, lang)), lang);
    preds.push({
      id: 'vedha',
      tone: 'neutral',
      title: t(TP.vedhaTitle),
      plainTitle: t(TP.vedhaPlainTitle),
      plain: TP.vedhaPlain(planets, vedhas.length > 1, lang),
      text: lang === 'si'
        ? `${vedhas.map(v => `${P(v.planet, lang)}ගේ හිතකර ගෝචරය ${P(v.vedha!.byPlanet, lang)} විසින් අවහිර වී ඇත`).join('; ')}. අවහිර වූ යහ ප්‍රතිඵලය දැනට අවලංගු වේ — එය මත අධික ලෙස රඳා නොසිටින්න.`
        : `${vedhas.map(v => `${P(v.planet, lang)}'s favourable transit is obstructed by ${P(v.vedha!.byPlanet, lang)}`).join('; ')}. The blocked good result is cancelled for now — don't over-rely on it.`,
    });
  }

  // 10. Nodal axis
  preds.push({
    id: 'nodes', tone: 'info', title: t(TP.nodesTitle),
    plainTitle: t(TP.nodesPlainTitle),
    plain: t(TP.nodesPlain),
    text: g.nodalShift.note,
  });

  return preds;
}
