/**
 * Career and wealth — the classical layer the generic engine cannot see.
 *
 * The prediction engine already reads each dasha lord's dignity, house and
 * lordships, and the natal foundation already scores the 10th / 2nd / 11th as
 * standing bhavas. What neither does is apply the *timing* rules classical
 * texts use specifically for livelihood and money:
 *
 *   • A dasha lord that *occupies* or *aspects* the 10th acts on career
 *     directly, whether or not it rules anything (BPHS Ch. 46; Phaladeepika 20).
 *   • The 10th from the Moon (Chandra lagna) times visible career change as
 *     reliably as the 10th from the lagna, and often more so.
 *   • A yoga gives its fruit in the periods of the planets that form it
 *     (BPHS Ch. 36) — a dhana yoga in the chart is a promise; the dasha of one of
 *     its planets is the payment.
 *   • The running lord's dignity in the dasamsa (D10) governs *professional*
 *     results during its period, independent of its rashi-chart dignity.
 *   • The Amatyakaraka (Jaimini) is the livelihood significator; its periods
 *     set career direction.
 *   • The Indu Lagna (Uttara Kalamrita) is the wealth ascendant; the periods
 *     of its lord and occupants are when accumulation happens.
 *
 * The module also derives the chart's own vocation from the 10th house rather
 * than from the dasha lord's generic profession list, which is what the career
 * reading used to print — a Jupiter period told everyone "teaching, law,
 * banking" regardless of what their own 10th house said.
 *
 * All output is bounded so this layer adjusts the existing score rather than
 * replacing it.
 */

import type { StrengthInput } from './dashaStrength';
import { lordedHousesFor } from './dashaStrength';
import { RASHI_LORDS, getDignity, type DignityLevel } from './planetaryAnalysis';
import { aspectsRashi } from './natalFoundation';
import { YogaCalculator, type YogaResult } from './yogas';
import { type Lang, LEVEL, en2si, pick, pickList, planetName, houseLabel, rashiName, joinAnd, joinComma } from './i18n';
import { SIG_TEXT } from './text/predictionVocab';
import { F_DIGNITY_INLINE } from './text/foundationText';
import {
  F_CAREER_SIGNATURE, CAREER_SOURCE, F_D10_TENTH, F_AMATYAKARAKA,
  F_WEALTH_SIGNATURE, F_INDU_LAGNA, F_INDU_STRONG, WEALTH_CHANNEL,
  F_ACT_IN_HOUSE_CAREER, F_ACT_ASPECTS_CAREER, F_ACT_MOON_TENTH, F_ACT_AMATYAKARAKA,
  F_ACT_D10_STRONG, F_ACT_D10_WEAK, F_ACT_YOGA_CAREER,
  F_ACT_IN_HOUSE_WEALTH, F_ACT_ASPECTS_WEALTH, F_ACT_MOON_WEALTH, F_ACT_INDU, F_ACT_BHAGYA,
  F_ACT_TWELFTH_WEALTH, F_ACT_YOGA_WEALTH, F_ACT_DARIDRA,
} from './text/careerWealthText';

// ─── Constants ─────────────────────────────────────────────────────────────

/**
 * Weight of each chain level relative to the mahadasha. Mirrors the engine's
 * CHAIN_WEIGHTS (0.40 / 0.30 / 0.20 / 0.10) normalised to the top level.
 */
const LEVEL_WEIGHT = [1, 0.75, 0.5, 0.25];

/**
 * Bound on the total activation modifier per area, either direction. Set
 * below the chain and foundation terms it sits beside (≈ ±1.8 and ±2.1), so it
 * can tip a reading but not carry it.
 */
const ACTIVATION_CAP = 1.2;

/** Kalas of the planets, for the Indu Lagna (Uttara Kalamrita IV.4). */
const INDU_KALA: Record<string, number> = {
  Sun: 30, Moon: 16, Mars: 6, Mercury: 8, Jupiter: 10, Venus: 12, Saturn: 1,
};

/** The seven Jaimini charakaraka candidates (the nodes are excluded in this scheme). */
const KARAKA_PLANETS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

const NATURAL_BENEFICS = new Set(['Jupiter', 'Venus', 'Mercury', 'Moon']);
const NODES = new Set(['Rahu', 'Ketu']);

/** Yogas that pay out through adversity — real, but late and at reduced weight. */
const DEFERRED_YOGAS = new Set(['Neecha Bhanga Rajayoga', 'Viparita Rajayoga']);

const D10_DIGNITY_POINTS: Record<DignityLevel, number> = {
  'exalted': 0.5, 'own-sign': 0.45, 'friend-sign': 0.2, 'neutral-sign': 0, 'enemy-sign': -0.25, 'debilitated': -0.55,
};

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

// ─── Chart geometry helpers ────────────────────────────────────────────────

/** Rashi (0–11) of the Nth house counted from a reference rashi. */
function rashiOfHouseFrom(ref: number, house: number): number {
  return (ref + house - 1) % 12;
}

function occupantsOfRashi(rashi: number, input: StrengthInput): string[] {
  return Object.entries(input.planetRashis ?? {})
    .filter(([, r]) => r === rashi)
    .map(([p]) => p);
}

/** Localised profession terms for a planet (first `n`). */
function professionsOf(planet: string, lang: Lang, n: number): string[] {
  const sig = SIG_TEXT[planet];
  return sig ? pickList(sig.professions, lang).slice(0, n) : [];
}

function dedupe<T>(xs: T[]): T[] { return [...new Set(xs)]; }

// ─── Indu Lagna ────────────────────────────────────────────────────────────

export interface InduLagna {
  /** Rashi (0–11) of the wealth ascendant. */
  rashi: number;
  lord: string;
  occupants: string[];
}

/**
 * Indu Lagna: add the kalas of the 9th lord from the lagna and the 9th lord
 * from the Moon, reduce mod 12 (0 → 12), and count that many signs from the
 * Moon. The lord and occupants of the resulting sign time wealth.
 */
export function induLagna(input: StrengthInput): InduLagna | null {
  const asc = input.ascendantRashi;
  const moon = input.moonRashi ?? input.planetRashis?.Moon;
  if (asc == null || moon == null || !input.planetRashis) return null;

  const ninthFromLagna = RASHI_LORDS[rashiOfHouseFrom(asc, 9)];
  const ninthFromMoon = RASHI_LORDS[rashiOfHouseFrom(moon, 9)];
  const kalaA = INDU_KALA[ninthFromLagna];
  const kalaB = INDU_KALA[ninthFromMoon];
  if (kalaA == null || kalaB == null) return null;

  let n = (kalaA + kalaB) % 12;
  if (n === 0) n = 12;
  const rashi = rashiOfHouseFrom(moon, n);
  return { rashi, lord: RASHI_LORDS[rashi], occupants: occupantsOfRashi(rashi, input) };
}

// ─── Amatyakaraka ──────────────────────────────────────────────────────────

/**
 * Jaimini's livelihood significator: the planet with the second-highest degree
 * within its sign among the seven classical planets. Null when fewer than two
 * planets have longitudes.
 */
export function amatyakaraka(longitudes?: Record<string, number>): string | null {
  if (!longitudes) return null;
  const ranked = KARAKA_PLANETS
    .filter(p => longitudes[p] != null)
    .map(p => ({ p, deg: ((longitudes[p] % 360) + 360) % 360 % 30 }))
    .sort((a, b) => b.deg - a.deg);
  return ranked.length >= 2 ? ranked[1].p : null;
}

// ─── Yogas by member planet ────────────────────────────────────────────────

const upper = (o: Record<string, number | boolean>) =>
  Object.fromEntries(Object.entries(o).map(([k, v]) => [k.toUpperCase(), v]));

/**
 * Detected yogas, memoised on the chart's rashi map. The timeline view runs the
 * engine once per mahadasha and antardasha over the same chart, and the yogas
 * do not change between those calls.
 */
const YOGA_CACHE = new WeakMap<Record<string, number>, YogaResult[]>();

function presentYogas(input: StrengthInput): YogaResult[] {
  if (!input.planetRashis || input.ascendantRashi == null) return [];
  const cached = YOGA_CACHE.get(input.planetRashis);
  if (cached) return cached;
  const calc = new YogaCalculator(
    upper(input.planetRashis) as Record<string, number>,
    input.ascendantRashi,
    {
      longitudes: input.planetLongitudes ? (upper(input.planetLongitudes) as Record<string, number>) : undefined,
      retro: input.planetRetro ? (upper(input.planetRetro) as Record<string, boolean>) : undefined,
    },
  );
  const present = calc.detectAllYogas().filter(y => y.isPresent);
  YOGA_CACHE.set(input.planetRashis, present);
  return present;
}

/** Strongest present yoga of the given categories that `planet` helps form. */
function strongestYogaFor(planet: string, yogas: YogaResult[], categories: Set<YogaResult['category']>): YogaResult | null {
  const key = planet.toUpperCase();
  return yogas
    .filter(y => categories.has(y.category) && y.planetsInvolved.includes(key))
    .sort((a, b) => b.strengthScore - a.strengthScore)[0] ?? null;
}

// ─── Signatures (standing chart facts) ─────────────────────────────────────

export interface CareerSignature {
  /** Planets the vocation is read from, most important first. */
  planets: string[];
  /** Localised profession terms — for keywords and prose. */
  fields: string[];
  amatyakaraka: string | null;
  notes: string[];
}

/**
 * The chart's own vocation, read the classical way: planets in the 10th from
 * the lagna; failing that, planets in the 10th from the Moon; failing that,
 * the 10th lord. The dasamsa's 10th and the Amatyakaraka are added as
 * corroborating voices.
 */
export function careerSignature(input: StrengthInput, lang: Lang = 'en'): CareerSignature | null {
  const asc = input.ascendantRashi;
  const rashis = input.planetRashis;
  if (asc == null || !rashis) return null;
  const L = en2si(lang);
  const notes: string[] = [];

  const tenthRashi = rashiOfHouseFrom(asc, 10);
  const tenthLord = RASHI_LORDS[tenthRashi];
  const moon = input.moonRashi ?? rashis.Moon;

  let planets = occupantsOfRashi(tenthRashi, input);
  let source: keyof typeof CAREER_SOURCE = 'tenth';
  if (!planets.length && moon != null) {
    planets = occupantsOfRashi(rashiOfHouseFrom(moon, 10), input);
    source = 'tenthFromMoon';
  }
  if (!planets.length) {
    planets = [tenthLord];
    source = 'tenthLord';
  }
  // The 10th lord always has a say, even when occupants lead.
  planets = dedupe([...planets, tenthLord]).slice(0, 3);

  const perPlanet = planets.length >= 3 ? 2 : 3;
  const fields = dedupe(planets.flatMap(p => professionsOf(p, lang, perPlanet))).slice(0, 5);
  if (fields.length) {
    notes.push(F_CAREER_SIGNATURE[L](
      CAREER_SOURCE[source][L],
      joinAnd(planets.map(p => planetName(p, lang)), lang),
      joinComma(fields),
    ));
  }

  // The dasamsa's own 10th house, when the D10 lagna is known.
  const d10 = input.divisionalRashis?.D10;
  const d10Lagna = d10?.Lagna;
  if (d10 && d10Lagna != null) {
    const d10TenthRashi = rashiOfHouseFrom(d10Lagna, 10);
    const d10Tenth = Object.entries(d10)
      .filter(([p, r]) => p !== 'Lagna' && r === d10TenthRashi)
      .map(([p]) => p)
      .slice(0, 2);
    if (d10Tenth.length) {
      const d10Fields = dedupe(d10Tenth.flatMap(p => professionsOf(p, lang, 2))).slice(0, 4);
      notes.push(F_D10_TENTH[L](joinAnd(d10Tenth.map(p => planetName(p, lang)), lang), joinComma(d10Fields)));
    }
  }

  const amk = amatyakaraka(input.planetLongitudes);
  if (amk) {
    notes.push(F_AMATYAKARAKA[L](planetName(amk, lang), joinComma(professionsOf(amk, lang, 3))));
  }

  return { planets, fields, amatyakaraka: amk, notes };
}

export interface WealthSignature {
  planets: string[];
  indu: InduLagna | null;
  notes: string[];
}

/** Income channels from the 2nd and 11th houses, plus the Indu Lagna. */
export function wealthSignature(input: StrengthInput, lang: Lang = 'en'): WealthSignature | null {
  const asc = input.ascendantRashi;
  const rashis = input.planetRashis;
  if (asc == null || !rashis) return null;
  const L = en2si(lang);
  const notes: string[] = [];

  const second = rashiOfHouseFrom(asc, 2);
  const eleventh = rashiOfHouseFrom(asc, 11);
  const lords = dedupe([RASHI_LORDS[second], RASHI_LORDS[eleventh]]);
  const occupants = dedupe([...occupantsOfRashi(second, input), ...occupantsOfRashi(eleventh, input)]);
  const planets = dedupe([...lords, ...occupants]).slice(0, 3);

  const perPlanet = planets.length >= 3 ? 1 : 2;
  const channels = dedupe(planets.flatMap(p => {
    const c = WEALTH_CHANNEL[p];
    return c ? pickList(c, lang).slice(0, perPlanet) : [];
  })).slice(0, 4);
  if (channels.length) {
    notes.push(F_WEALTH_SIGNATURE[L](joinAnd(planets.map(p => planetName(p, lang)), lang), joinComma(channels)));
  }

  const indu = induLagna(input);
  if (indu) {
    notes.push(F_INDU_LAGNA[L](
      rashiName(indu.rashi, lang),
      planetName(indu.lord, lang),
      indu.occupants.length ? joinAnd(indu.occupants.map(p => planetName(p, lang)), lang) : '',
    ));
    const dignified = indu.occupants.find(p =>
      NATURAL_BENEFICS.has(p) && ['exalted', 'own-sign'].includes(getDignity(p, rashis[p])));
    if (dignified) notes.push(F_INDU_STRONG[L](planetName(dignified, lang)));
  }

  return { planets, indu, notes };
}

// ─── Dasha activation ──────────────────────────────────────────────────────

export interface Activation {
  /** Bounded signed modifier for the area score. */
  points: number;
  /** Why — strongest factors first. */
  notes: string[];
}

interface Hit { points: number; note: string | null }

const levelName = (i: number, lang: Lang) =>
  pick([LEVEL.maha, LEVEL.antar, LEVEL.pratyantar, LEVEL.sookshma][i] ?? LEVEL.sookshma, lang);

/**
 * Walk the chain once, top level first, skipping a planet that already
 * appeared at a higher level (Venus–Venus counts Venus once, at full weight).
 */
function eachLord(chain: string[], fn: (planet: string, weight: number, level: string) => void, lang: Lang) {
  const seen = new Set<string>();
  chain.forEach((planet, i) => {
    if (!planet || seen.has(planet)) return;
    seen.add(planet);
    fn(planet, LEVEL_WEIGHT[i] ?? 0.25, levelName(i, lang));
  });
}

/**
 * One yoga, one credit. A Kendra-Trikona Rajayoga formed by Venus and Saturn is
 * a single fact; when both hold levels of the chain it must not be paid twice.
 * The chain is walked top-down, so the first hit for a kind is the one at the
 * highest level and keeps the larger weight.
 */
class YogaHits {
  private byKind = new Map<string, Hit>();
  add(kind: string, hit: Hit) {
    const prev = this.byKind.get(kind);
    if (!prev || Math.abs(hit.points) > Math.abs(prev.points)) this.byKind.set(kind, hit);
  }
  drain(into: Hit[]) { into.push(...this.byKind.values()); }
}

function finish(hits: Hit[]): Activation {
  hits.sort((a, b) => Math.abs(b.points) - Math.abs(a.points));
  const total = hits.reduce((s, h) => s + h.points, 0);
  return {
    points: clamp(Math.round(total * 100) / 100, -ACTIVATION_CAP, ACTIVATION_CAP),
    notes: dedupe(hits.map(h => h.note).filter((n): n is string => !!n)),
  };
}

const CAREER_YOGAS = new Set<YogaResult['category']>(['rajayoga', 'mahapurusha']);
const DHANA_YOGAS = new Set<YogaResult['category']>(['dhana']);
const DARIDRA_YOGAS = new Set<YogaResult['category']>(['daridra']);

/**
 * How much the running chain bears on career, beyond what the lords' generic
 * scores and lordships already say.
 */
export function assessCareerActivation(chain: string[], input: StrengthInput, lang: Lang = 'en'): Activation | null {
  const asc = input.ascendantRashi;
  const rashis = input.planetRashis;
  if (asc == null || !rashis || !chain.length) return null;
  const L = en2si(lang);
  const hits: Hit[] = [];

  const tenthRashi = rashiOfHouseFrom(asc, 10);
  const moon = input.moonRashi ?? rashis.Moon;
  const moonTenthRashi = moon != null ? rashiOfHouseFrom(moon, 10) : null;
  const amk = amatyakaraka(input.planetLongitudes);
  const yogas = presentYogas(input);
  const yogaHits = new YogaHits();
  const d10 = input.divisionalRashis?.D10;

  eachLord(chain, (planet, w, level) => {
    const pName = planetName(planet, lang);
    const rashi = rashis[planet];
    if (rashi == null) return;

    // Occupies, or aspects, the 10th from the lagna.
    if (rashi === tenthRashi) {
      hits.push({ points: 0.6 * w, note: F_ACT_IN_HOUSE_CAREER[L](pName, level) });
    } else if (aspectsRashi(planet, rashi, tenthRashi)) {
      hits.push({ points: 0.25 * w, note: F_ACT_ASPECTS_CAREER[L](pName, level) });
    }

    // The 10th from the Moon, when it is a different sign from the lagna's 10th.
    if (moonTenthRashi != null && moonTenthRashi !== tenthRashi) {
      const isLord = RASHI_LORDS[moonTenthRashi] === planet;
      if (isLord || rashi === moonTenthRashi) {
        hits.push({ points: (isLord ? 0.35 : 0.3) * w, note: F_ACT_MOON_TENTH[L](pName, level) });
      }
    }

    if (amk === planet) {
      hits.push({ points: 0.4 * w, note: F_ACT_AMATYAKARAKA[L](pName, level) });
    }

    // Dignity in the dasamsa.
    const d10Rashi = d10?.[planet];
    if (d10Rashi != null && !NODES.has(planet)) {
      const dignity = getDignity(planet, d10Rashi);
      const pts = D10_DIGNITY_POINTS[dignity] * w;
      const word = F_DIGNITY_INLINE[dignity][L];
      const note = dignity === 'exalted' || dignity === 'own-sign'
        ? F_ACT_D10_STRONG[L](pName, level, word)
        : dignity === 'debilitated' ? F_ACT_D10_WEAK[L](pName, level, word) : null;
      if (pts !== 0) hits.push({ points: pts, note });
    }

    // A raja / mahapurusha yoga this planet forms is fructifying.
    const yoga = strongestYogaFor(planet, yogas, CAREER_YOGAS);
    if (yoga) {
      const weight = DEFERRED_YOGAS.has(yoga.sanskritName) ? 0.25 : 0.6;
      yogaHits.add(yoga.sanskritName, {
        points: (yoga.strengthScore / 10) * weight * w,
        note: F_ACT_YOGA_CAREER[L](yoga.name, pName, level),
      });
    }
  }, lang);

  yogaHits.drain(hits);
  return finish(hits);
}

/**
 * How much the running chain bears on wealth, beyond the lords' generic scores
 * and 2nd / 11th lordships.
 */
export function assessWealthActivation(chain: string[], input: StrengthInput, lang: Lang = 'en'): Activation | null {
  const asc = input.ascendantRashi;
  const rashis = input.planetRashis;
  if (asc == null || !rashis || !chain.length) return null;
  const L = en2si(lang);
  const hits: Hit[] = [];

  const second = rashiOfHouseFrom(asc, 2);
  const eleventh = rashiOfHouseFrom(asc, 11);
  const twelfth = rashiOfHouseFrom(asc, 12);
  const moon = input.moonRashi ?? rashis.Moon;
  const moonWealth: Array<[number, number]> = moon != null
    ? [[rashiOfHouseFrom(moon, 11), 11], [rashiOfHouseFrom(moon, 2), 2]]
    : [];
  const indu = induLagna(input);
  const yogas = presentYogas(input);
  const yogaHits = new YogaHits();

  eachLord(chain, (planet, w, level) => {
    const pName = planetName(planet, lang);
    const rashi = rashis[planet];
    if (rashi == null) return;
    const lorded = lordedHousesFor(planet, asc);
    const rulesWealth = lorded.includes(2) || lorded.includes(11);

    // Occupies, or aspects, a wealth house from the lagna.
    if (rashi === eleventh) {
      hits.push({ points: 0.45 * w, note: F_ACT_IN_HOUSE_WEALTH[L](pName, level, houseLabel(11, lang)) });
    } else if (rashi === second) {
      hits.push({ points: 0.4 * w, note: F_ACT_IN_HOUSE_WEALTH[L](pName, level, houseLabel(2, lang)) });
    } else if (aspectsRashi(planet, rashi, eleventh)) {
      hits.push({ points: 0.2 * w, note: F_ACT_ASPECTS_WEALTH[L](pName, level, houseLabel(11, lang)) });
    } else if (aspectsRashi(planet, rashi, second)) {
      hits.push({ points: 0.15 * w, note: F_ACT_ASPECTS_WEALTH[L](pName, level, houseLabel(2, lang)) });
    }

    // Wealth houses from the Moon, where they differ from the lagna's.
    for (const [mRashi, mHouse] of moonWealth) {
      if (mRashi === second || mRashi === eleventh) continue;
      const isLord = RASHI_LORDS[mRashi] === planet;
      if (isLord || rashi === mRashi) {
        hits.push({ points: (isLord ? 0.3 : 0.25) * w, note: F_ACT_MOON_WEALTH[L](pName, level, houseLabel(mHouse, lang)) });
        break;
      }
    }

    if (indu && (indu.lord === planet || rashi === indu.rashi)) {
      hits.push({ points: 0.45 * w, note: F_ACT_INDU[L](pName, level) });
    }

    if (lorded.includes(9)) {
      hits.push({ points: 0.2 * w, note: F_ACT_BHAGYA[L](pName, level) });
    }

    // Expenditure: sitting in the 12th with no wealth lordship to offset it.
    if (rashi === twelfth && !rulesWealth) {
      hits.push({ points: -0.3 * w, note: F_ACT_TWELFTH_WEALTH[L](pName, level) });
    }

    const dhana = strongestYogaFor(planet, yogas, DHANA_YOGAS);
    if (dhana) {
      yogaHits.add(dhana.sanskritName, { points: (dhana.strengthScore / 10) * 0.6 * w, note: F_ACT_YOGA_WEALTH[L](dhana.name, pName, level) });
    }
    const daridra = strongestYogaFor(planet, yogas, DARIDRA_YOGAS);
    if (daridra) {
      yogaHits.add(daridra.sanskritName, { points: -(daridra.strengthScore / 10) * 0.5 * w, note: F_ACT_DARIDRA[L](daridra.name, pName, level) });
    }
  }, lang);

  yogaHits.drain(hits);
  return finish(hits);
}
