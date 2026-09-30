/**
 * Erashtaka (ඒරාෂ්ටක ශනි — Sade Sati) and its siblings Ashtama / Kantaka Shani,
 * graded for a specific chart rather than treated as one flat "bad" signal.
 *
 * Classical texts agree the 7½-year transit is not equally heavy for everyone.
 * What decides it:
 *   • Saturn's own condition in the sign it transits (exalted / own / enemy / debilitated)
 *   • the natal Moon sign — per zodiac: Saturn is gentle on the signs of his
 *     friends (Taurus, Libra, Gemini, Virgo) and his own (Capricorn, Aquarius),
 *     harsh on the Sun/Moon/Mars signs (Leo, Cancer, Aries, Scorpio); and he is
 *     a yogakaraka counted from a Taurus or Libra Moon
 *   • Saturn's functional role for the natal Lagna (yogakaraka for Taurus/Libra Lagna)
 *   • Ashtakavarga — Saturn's own bindus and the Sarva total in the transited sign
 *   • concurrent transits — Jupiter's aspect on the Moon/Saturn relieves;
 *     Rahu/Ketu on the Moon or with Saturn aggravates
 *   • the running dasha — a Saturn/Moon/Rahu period or a malefic lord doubles
 *     it; a strong benefic lord carries the native through
 *   • natal Moon strength (paksha bala) and natal Jupiter's protection of the Moon
 *   • which cycle of life it is (1st, 2nd, 3rd)
 *
 * Everything here is pure and synchronous so the same scorer serves the
 * current-period prediction, the lifetime timeline and the transit segments.
 */

import { type Lang, type Bi, pick, rashiName, planetName, houseLabel, joinAnd, LEVEL } from './i18n';
import { getDignity, getFunctionalNature, RASHI_LORDS } from './planetaryAnalysis';
import { PLANETARY_RELATIONSHIPS } from './predictions';
import { computeAshtakavarga, type Contributor } from './ashtakavarga';
import {
  ERASHTAKA_NAME, LEVEL_WORD, PHASE_FOCUS, PHASE_AREAS, areaNote, summary,
  FACTOR, LAGNA_HOUSE_THEME, WINDOW_NOTE,
} from './text/erashtakaText';

export type ErashtakaPhase = 'rising' | 'peak' | 'setting' | 'ashtama' | 'kantaka';
export type ErashtakaKind = 'sadeSati' | 'ashtama' | 'kantaka';
export type ErashtakaLevel = 'mild' | 'moderate' | 'strong' | 'severe';
export type ErashtakaArea = 'health' | 'wealth' | 'career' | 'relationships';

/** The natal side — all keys title case (Sun … Ketu). */
export interface ErashtakaChart {
  moonRashi: number;
  lagnaRashi: number;
  natalRashis?: Record<string, number>;
  natalLongitudes?: Record<string, number>;
  /** Saturn's Bhinnashtakavarga (12 entries). */
  saturnBhinna?: number[];
  /** Sarvashtakavarga (12 entries). */
  sarva?: number[];
}

/** The sky at the moment (or window) being judged. */
export interface ErashtakaSky {
  saturnRashi: number;
  jupiterRashi?: number;
  rahuRashi?: number;
  ketuRashi?: number;
}

/** Running dasha lords, title case. */
export interface ErashtakaDasha {
  maha?: string;
  antar?: string;
}

export interface ErashtakaFactor {
  text: string;
  /** + aggravates, − mitigates (intensity points on a 0–10 scale). */
  weight: number;
}

export interface ErashtakaAssessment {
  kind: ErashtakaKind;
  phase: ErashtakaPhase;
  houseFromMoon: number;
  houseFromLagna: number;
  name: string;
  /** 0 (negligible) … 10 (as hard as it gets). */
  intensity: number;
  level: ErashtakaLevel;
  levelLabel: string;
  /** Prediction-score modifier (always ≤ 0), ≈ −0.1 … −1.2. */
  scoreMod: number;
  summary: string;
  aggravating: ErashtakaFactor[];
  mitigating: ErashtakaFactor[];
  /** Informational context (Lagna house, natal planets crossed, cycle). */
  context: string[];
  areas: { area: ErashtakaArea; note: string }[];
}

const PHASE_BY_HOUSE: Record<number, ErashtakaPhase> = { 12: 'rising', 1: 'peak', 2: 'setting', 8: 'ashtama', 4: 'kantaka' };

/** Base intensity before chart factors. The peak and the 8th are the heaviest. */
const BASE: Record<ErashtakaPhase, number> = { rising: 5, peak: 6.5, setting: 4.5, ashtama: 6, kantaka: 4 };

const houseFrom = (target: number, ref: number) => ((target - ref + 12) % 12) + 1;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const round1 = (v: number) => Math.round(v * 10) / 10;

export function erashtakaPhase(saturnRashi: number, moonRashi: number): ErashtakaPhase | null {
  return PHASE_BY_HOUSE[houseFrom(saturnRashi, moonRashi)] ?? null;
}

export function levelOf(intensity: number): ErashtakaLevel {
  if (intensity < 3.5) return 'mild';
  if (intensity < 5.5) return 'moderate';
  if (intensity < 7.5) return 'strong';
  return 'severe';
}

/** Jupiter (special aspects 5/7/9) sees or joins `target` from `jupRashi`. */
function jupiterSees(jupRashi: number, target: number): boolean {
  return [1, 5, 7, 9].includes(houseFrom(target, jupRashi));
}

const BENEFIC_NATURES = new Set(['yogakaraka', 'benefic']);

export interface AssessOptions {
  /** 1-based count of the Sade Sati cycle in this lifetime. */
  cycle?: number;
}

/**
 * Grade the Saturn-from-Moon affliction running under `sky` for this chart.
 * Returns null when Saturn is not in the 12th/1st/2nd/4th/8th from the Moon.
 */
export function assessErashtaka(
  sky: ErashtakaSky,
  chart: ErashtakaChart,
  dasha: ErashtakaDasha = {},
  opts: AssessOptions = {},
  lang: Lang = 'en',
): ErashtakaAssessment | null {
  const phase = erashtakaPhase(sky.saturnRashi, chart.moonRashi);
  if (!phase) return null;
  const t = (b: Bi) => pick(b, lang);
  const factors: ErashtakaFactor[] = [];
  const context: string[] = [];
  const add = (weight: number, b: Bi) => factors.push({ weight, text: t(b) });

  const satSign = rashiName(sky.saturnRashi, lang);
  const moonSign = rashiName(chart.moonRashi, lang);

  // 1. Saturn's dignity in the transited sign.
  switch (getDignity('Saturn', sky.saturnRashi)) {
    case 'exalted':     add(-1.5, FACTOR.saturnExalted(satSign)); break;
    case 'own-sign':    add(-1,   FACTOR.saturnOwn(satSign)); break;
    case 'friend-sign': add(-0.5, FACTOR.saturnFriend(satSign)); break;
    case 'enemy-sign':  add(0.5,  FACTOR.saturnEnemy(satSign)); break;
    case 'debilitated': add(1.5,  FACTOR.saturnDebilitated(satSign)); break;
  }

  // 2. Per zodiac: how Saturn relates to the lord of the natal Moon sign.
  const moonLord = RASHI_LORDS[chart.moonRashi];
  const satRel = PLANETARY_RELATIONSHIPS.Saturn;
  if (moonLord === 'Saturn') add(-1, FACTOR.moonSignSaturnOwn(moonSign));
  else if (satRel.friends.includes(moonLord)) add(-0.5, FACTOR.moonSignFriend(moonSign));
  else if (satRel.enemies.includes(moonLord)) add(0.5, FACTOR.moonSignEnemy(moonSign));

  // Saturn's role counted from the Moon (Chandra Lagna).
  const fromMoon = getFunctionalNature('Saturn', chart.moonRashi);
  if (fromMoon.isYogakaraka) add(-0.75, FACTOR.yogakarakaFromMoon);
  else if (fromMoon.nature === 'malefic') add(0.5, FACTOR.maleficFromMoon);

  // 3. Saturn's role for the natal Lagna.
  const satForLagna = getFunctionalNature('Saturn', chart.lagnaRashi);
  if (satForLagna.isYogakaraka) add(-1, FACTOR.yogakarakaFromLagna);
  else if (satForLagna.nature === 'benefic') add(-0.5, FACTOR.beneficFromLagna);
  else if (satForLagna.nature === 'malefic') add(0.5, FACTOR.maleficFromLagna);

  // 4. Ashtakavarga support in the transited sign.
  const b = chart.saturnBhinna?.[sky.saturnRashi];
  if (b != null) {
    if (b >= 5) add(-Math.min(1.5, 0.5 * (b - 4)), FACTOR.bindusHigh(b));
    else if (b <= 2) add(Math.min(1.5, 0.75 + 0.5 * (2 - b)), FACTOR.bindusLow(b));
  }
  const s = chart.sarva?.[sky.saturnRashi];
  if (s != null) {
    if (s >= 30) add(-0.5, FACTOR.sarvaHigh(s));
    else if (s < 25) add(0.5, FACTOR.sarvaLow(s));
  }

  // 5. Concurrent transits.
  if (sky.jupiterRashi != null) {
    if (jupiterSees(sky.jupiterRashi, chart.moonRashi)) add(-1, FACTOR.jupiterOnMoon);
    if (jupiterSees(sky.jupiterRashi, sky.saturnRashi)) add(-0.5, FACTOR.jupiterOnSaturn);
  }
  for (const [node, r] of [['Rahu', sky.rahuRashi], ['Ketu', sky.ketuRashi]] as const) {
    if (r == null) continue;
    const nm = planetName(node, lang);
    if (r === chart.moonRashi) add(0.75, FACTOR.nodeOnMoon(nm));
    else if (r === sky.saturnRashi) add(0.5, FACTOR.nodeWithSaturn(nm));
  }

  // 6. The running dasha.
  for (const [lord, levelKey, w] of [[dasha.maha, 'maha', 1], [dasha.antar, 'antar', 0.6]] as const) {
    // Same lord in both slots (e.g. Saturn–Saturn) counts once, at full weight.
    if (!lord || (levelKey === 'antar' && lord === dasha.maha)) continue;
    const lvl = pick(LEVEL[levelKey], lang);
    const pn = planetName(lord, lang);
    const fn = getFunctionalNature(lord, chart.lagnaRashi);
    if (lord === 'Saturn') {
      if (BENEFIC_NATURES.has(fn.nature)) context.push(t(FACTOR.dashaSaturnGood(lvl)));
      else add(1 * w, FACTOR.dashaSaturn(lvl));
    } else if (lord === 'Moon' || lord === 'Rahu') {
      add(0.5 * w, FACTOR.dashaSensitive(pn, lvl));
    } else if (BENEFIC_NATURES.has(fn.nature)) {
      add(-0.75 * w, FACTOR.dashaBenefic(pn, lvl));
    } else if (fn.nature === 'malefic') {
      add(0.5 * w, FACTOR.dashaMalefic(pn, lvl));
    }
  }

  // 7. Natal Moon strength and natal Jupiter's guard.
  const sunLon = chart.natalLongitudes?.Sun, moonLon = chart.natalLongitudes?.Moon;
  if (sunLon != null && moonLon != null) {
    const elong = (moonLon - sunLon + 360) % 360;
    if (elong >= 120 && elong <= 240) add(-0.5, FACTOR.moonBright);
    else if (elong < 48 || elong > 312) add(0.5, FACTOR.moonDark);
  }
  const natalJup = chart.natalRashis?.Jupiter;
  if (natalJup != null && jupiterSees(natalJup, chart.moonRashi)) add(-0.5, FACTOR.natalJupiterGuardsMoon);

  // 8. Saturn's house from the Lagna — where the pressure lands outwardly.
  const hl = houseFrom(sky.saturnRashi, chart.lagnaRashi);
  if ([3, 6, 11].includes(hl)) add(-0.5, FACTOR.lagnaHouse(houseLabel(hl, lang), LAGNA_HOUSE_THEME[hl]));
  else if ([1, 4, 7, 8].includes(hl)) add(0.25, FACTOR.lagnaHouse(houseLabel(hl, lang), LAGNA_HOUSE_THEME[hl]));
  else context.push(t(FACTOR.lagnaHouse(houseLabel(hl, lang), LAGNA_HOUSE_THEME[hl])));

  // Natal planets Saturn walks over (Moon excluded — that is the peak itself).
  if (chart.natalRashis) {
    const crossed = Object.entries(chart.natalRashis)
      .filter(([p, r]) => r === sky.saturnRashi && p !== 'Moon' && p !== 'Ascendant')
      .map(([p]) => p);
    if (crossed.length) {
      const text = t(FACTOR.crossesNatal(joinAnd(crossed.map(p => planetName(p, lang)), lang)));
      if (crossed.includes('Sun') || crossed.includes('Mars')) factors.push({ weight: 0.25, text });
      else context.push(text);
    }
  }

  // 9. Which cycle of life.
  if (phase !== 'ashtama' && phase !== 'kantaka' && opts.cycle) {
    if (opts.cycle === 1) context.push(t(FACTOR.cycle1));
    else if (opts.cycle === 2) add(-0.5, FACTOR.cycle2);
    else add(0.75, FACTOR.cycle3);
  }

  const intensity = round1(clamp(BASE[phase] + factors.reduce((a, f) => a + f.weight, 0), 0, 10));
  const level = levelOf(intensity);
  const levelLabel = pick(LEVEL_WORD[level], lang);
  const name = pick(ERASHTAKA_NAME[phase], lang);
  const byWeight = (a: ErashtakaFactor, b2: ErashtakaFactor) => Math.abs(b2.weight) - Math.abs(a.weight);

  return {
    kind: phase === 'ashtama' ? 'ashtama' : phase === 'kantaka' ? 'kantaka' : 'sadeSati',
    phase,
    houseFromMoon: houseFrom(sky.saturnRashi, chart.moonRashi),
    houseFromLagna: hl,
    name,
    intensity,
    level,
    levelLabel,
    scoreMod: -Math.round(12 * intensity) / 100,
    summary: summary(name, levelLabel, pick(PHASE_FOCUS[phase], lang), lang),
    aggravating: factors.filter(f => f.weight > 0).sort(byWeight),
    mitigating: factors.filter(f => f.weight < 0).sort(byWeight),
    context,
    areas: PHASE_AREAS[phase].map(area => ({ area, note: areaNote(area, name, levelLabel, lang) })),
  };
}

// ─── Dasha windows inside a phase ────────────────────────────────────────────

export interface DashaSpanLite {
  maha: string;
  antar: string;
  start: string;
  end: string;
}

export interface ErashtakaWindow {
  maha: string;
  antar: string;
  start: string;
  end: string;
  intensity: number;
  level: ErashtakaLevel;
  verdict: 'hardest' | 'harder' | 'steady' | 'relief';
  verdictLabel: string;
  /** The one or two factors that moved this window off the phase baseline. */
  drivers: string[];
}

/**
 * Split a phase into the antardashas running inside it and grade each one —
 * this is where the transit meets the time period. `skyAt` supplies the
 * transit Jupiter / node signs at a window's midpoint (Jupiter changes sign
 * yearly and the nodes every ~18 months, so they genuinely vary across a
 * 2½-year phase).
 */
export function erashtakaWindows(
  phaseStart: string,
  phaseEnd: string,
  saturnRashi: number,
  chart: ErashtakaChart,
  spans: DashaSpanLite[],
  skyAt: (d: Date) => Omit<ErashtakaSky, 'saturnRashi'>,
  opts: AssessOptions = {},
  lang: Lang = 'en',
): ErashtakaWindow[] {
  const a = Date.parse(phaseStart), b = Date.parse(phaseEnd);
  const baseline = assessErashtaka({ saturnRashi }, chart, {}, opts, lang);
  if (!baseline) return [];
  const baseTexts = new Set([...baseline.aggravating, ...baseline.mitigating].map(f => f.text));

  const out: ErashtakaWindow[] = [];
  for (const s of spans) {
    const sa = Math.max(a, Date.parse(s.start)), sb = Math.min(b, Date.parse(s.end));
    if (sb - sa < 20 * 86_400_000) continue; // ignore sliver overlaps
    const mid = new Date((sa + sb) / 2);
    const r = assessErashtaka(
      { ...skyAt(mid), saturnRashi }, chart, { maha: s.maha, antar: s.antar }, opts, lang,
    )!;
    const delta = r.intensity - baseline.intensity;
    const drivers = [...r.aggravating, ...r.mitigating]
      .filter(f => !baseTexts.has(f.text))
      .sort((x, y) => Math.abs(y.weight) - Math.abs(x.weight))
      .slice(0, 2)
      .map(f => f.text);
    out.push({
      maha: s.maha, antar: s.antar,
      start: new Date(sa).toISOString(), end: new Date(sb).toISOString(),
      intensity: r.intensity, level: r.level,
      verdict: delta >= 1 ? 'harder' : delta <= -0.75 ? 'relief' : 'steady',
      verdictLabel: '',
      drivers,
    });
  }
  // The single heaviest window gets called out when it is genuinely heavy.
  const worst = out.reduce<ErashtakaWindow | null>((m, w) => (!m || w.intensity > m.intensity ? w : m), null);
  if (worst && (worst.level === 'strong' || worst.level === 'severe') && worst.verdict !== 'relief') worst.verdict = 'hardest';
  for (const w of out) w.verdictLabel = pick(WINDOW_NOTE[w.verdict], lang);
  return out;
}

// ─── Chart adapter ───────────────────────────────────────────────────────────

/**
 * Build the natal side from raw ephemeris positions (upper-case keys, as the
 * services hold them). Computes the Ashtakavarga so callers need not.
 */
export function erashtakaChartFromPositions(
  positions: Record<string, { rashi: number; longitude: number }>,
): ErashtakaChart {
  const natalRashis: Record<string, number> = {};
  const natalLongitudes: Record<string, number> = {};
  for (const k of ['SUN', 'MOON', 'MARS', 'MERCURY', 'JUPITER', 'VENUS', 'SATURN', 'RAHU', 'KETU']) {
    const p = positions[k];
    if (!p) continue;
    const name = k.charAt(0) + k.slice(1).toLowerCase();
    natalRashis[name] = p.rashi;
    natalLongitudes[name] = p.longitude;
  }
  const chart: ErashtakaChart = {
    moonRashi: positions.MOON.rashi,
    lagnaRashi: positions.ASCENDANT.rashi,
    natalRashis,
    natalLongitudes,
  };
  const avPlanets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'] as const;
  if (avPlanets.every(p => natalRashis[p] != null)) {
    const av = computeAshtakavarga({ ...Object.fromEntries(avPlanets.map(p => [p, natalRashis[p]])), Lagna: chart.lagnaRashi } as Record<Contributor, number>);
    chart.saturnBhinna = av.bhinna.Saturn;
    chart.sarva = av.sarva;
  }
  return chart;
}
