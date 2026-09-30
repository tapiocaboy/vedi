/**
 * Transit Impact — turns the major planets' sign changes (Saturn, Jupiter,
 * Rahu/Ketu, Mars, Sun) into dated segments and scores what each one does to
 * the native's predictions: classical gochara from the Moon, the house it
 * occupies and aspects from the Ascendant, Ashtakavarga support for the sign,
 * and whether the transiting planet is also running the dasha at the time.
 *
 * Prose comes from text/transitImpactText in all nine engine languages; the
 * English tables below stay as the stable source for exports and tests.
 */

import { valenceFromMoon } from './transits';
import { gocharaEffect } from './gocharaPhala';
import { RASHIS, RASHI_ENGLISH } from './rashi';
import { assessErashtaka, type ErashtakaChart } from './erashtaka';
import { type Lang, pick, planetName, rashiName, joinAnd, ordinalNum } from './i18n';
import {
  AREA_NAME, HOUSE_THEME_T, ADVICE_T, TAG_T, GRADED, STORY, houseThemeShort, type TagKey,
} from './text/transitImpactText';

export type TransitBody = 'SATURN' | 'JUPITER' | 'RAHU' | 'KETU' | 'MARS' | 'SUN';
export type ImpactArea = 'career' | 'wealth' | 'relationships' | 'health';
export type ImpactTone = 'good' | 'mixed' | 'bad';

export const IMPACT_AREAS: ImpactArea[] = ['career', 'wealth', 'relationships', 'health'];

export const AREA_LABEL: Record<ImpactArea, string> = {
  career: 'Career', wealth: 'Wealth', relationships: 'Relationships', health: 'Health',
};

export const BODY_LABEL: Record<TransitBody, string> = {
  SATURN: 'Saturn', JUPITER: 'Jupiter', RAHU: 'Rahu', KETU: 'Ketu', MARS: 'Mars', SUN: 'Sun',
};

/** Houses from the Ascendant that carry each life area. */
const AREA_HOUSES: Record<ImpactArea, number[]> = {
  career: [10, 6, 11],
  wealth: [2, 11, 9],
  relationships: [7, 5],
  health: [1, 6, 8],
};

/** Special (graha drishti) aspects counted from the transiting sign; every body also aspects the 7th. */
const SPECIAL_ASPECTS: Partial<Record<TransitBody, number[]>> = {
  SATURN: [3, 10], JUPITER: [5, 9], MARS: [4, 8], RAHU: [5, 9], KETU: [5, 9],
};

/** How much a body's transit colours the overall climate. Slow movers dominate. */
export const BODY_WEIGHT: Record<TransitBody, number> = {
  SATURN: 1, JUPITER: 1, RAHU: 0.7, KETU: 0.5, MARS: 0.4, SUN: 0.25,
};

const MALEFIC = new Set<TransitBody>(['SATURN', 'RAHU', 'KETU', 'MARS', 'SUN']);
const UPACHAYA = [3, 6, 10, 11];

export const HOUSE_THEME: Record<number, string> = {
  1: 'self, body and vitality',
  2: 'savings, family and speech',
  3: 'courage, effort and siblings',
  4: 'home, mother, property and peace of mind',
  5: 'children, romance, studies and speculation',
  6: 'work, competition, debts and illness',
  7: 'marriage, partners and contracts',
  8: 'sudden change, shared money and longevity',
  9: 'fortune, mentors, faith and long journeys',
  10: 'career, status and public reputation',
  11: 'income, gains and networks',
  12: 'expenses, sleep, foreign lands and letting go',
};

export interface TransitTag {
  /** Stable, language-independent id for the event (e.g. 'sadePeak'). */
  key: TagKey;
  label: string;
  kind: ImpactTone;
  note: string;
}

export interface DashaLink {
  level: 'Mahadasha' | 'Antardasha';
  lord: string;
}

export interface TransitSegment {
  id: string;
  planet: TransitBody;
  rashi: number;
  rashiName: string;
  westernName: string;
  start: string;
  end: string;
  /** Began before the sampled window, so `start` is the window edge rather than the ingress. */
  startClipped: boolean;
  /** Runs past the sampled window. */
  endClipped: boolean;
  houseFromMoon: number;
  houseFromLagna: number;
  /** Classical valence from the Moon: −1, 0 or +1. */
  valence: number;
  /** The planet's own Bhinnashtakavarga bindus in this sign (0–8), when it has one. */
  bindus?: number;
  /** Sarvashtakavarga total for the sign (typically 18–40). */
  sarva?: number;
  /** Combined score in [−1, +1]. */
  score: number;
  tone: ImpactTone;
  retroSpans: { start: string; end: string }[];
  tags: TransitTag[];
  effect: string;
  aspects: number[];
  areas: Record<ImpactArea, number>;
  dasha: DashaLink[];
  advice: string;
}

export interface NatalContext {
  moonRashi: number;
  lagnaRashi: number;
  /** Natal rashi of each body keyed by upper-case name (SUN, MOON, …, RAHU, KETU). */
  natalRashi: Record<string, number>;
  /** Bhinnashtakavarga per planet, keyed by title-case name (Sun, Mars, Jupiter, Saturn …). */
  bhinna?: Record<string, number[]>;
  sarva?: number[];
}

export interface DashaSpan {
  level: 'Mahadasha' | 'Antardasha';
  lord: string;
  start: string;
  end: string;
}

const DAY = 86_400_000;
const houseFrom = (rashi: number, ref: number) => ((rashi - ref + 12) % 12) + 1;
const clamp = (v: number, a = -1, b = 1) => Math.max(a, Math.min(b, v));
const titleCase = (p: string) => p.charAt(0) + p.slice(1).toLowerCase();

export function toneOf(score: number): ImpactTone {
  return score >= 0.25 ? 'good' : score <= -0.25 ? 'bad' : 'mixed';
}

/** Houses (from the Ascendant) that a body in `house` aspects, 7th included. */
export function aspectedHouses(planet: TransitBody, house: number): number[] {
  const offsets = [7, ...(SPECIAL_ASPECTS[planet] ?? [])];
  return offsets.map(o => ((house - 1 + o - 1) % 12) + 1);
}

/** Whether a body sitting in `house` from the Ascendant helps (+1) or strains (−1) that house by nature. */
function occupantDirection(planet: TransitBody, house: number): number {
  if (MALEFIC.has(planet)) return UPACHAYA.includes(house) ? 1 : -1;
  return [6, 8, 12].includes(house) ? -0.5 : 1;
}

function ashtakaModifier(bindus: number | undefined, sarva: number | undefined): number {
  if (bindus !== undefined) {
    if (bindus >= 5) return 0.35;
    if (bindus === 4) return 0.1;
    if (bindus === 3) return -0.1;
    return -0.35;
  }
  if (sarva !== undefined) {
    if (sarva >= 30) return 0.25;
    if (sarva < 25) return -0.25;
  }
  return 0;
}

function areaImpacts(planet: TransitBody, houseFromLagna: number, houseFromMoon: number, score: number): Record<ImpactArea, number> {
  const aspected = aspectedHouses(planet, houseFromLagna);
  const out = {} as Record<ImpactArea, number>;
  for (const area of IMPACT_AREAS) {
    const houses = AREA_HOUSES[area];
    let v = 0;
    if (houses.includes(houseFromLagna)) v += 0.5 * occupantDirection(planet, houseFromLagna) + 0.5 * score;
    if (houses.includes(houseFromMoon)) v += 0.25 * occupantDirection(planet, houseFromMoon) + 0.25 * score;
    if (aspected.some(h => houses.includes(h))) v += (MALEFIC.has(planet) ? -0.2 : 0.2) + 0.1 * score;
    out[area] = clamp(v);
  }
  return out;
}

function tagsFor(planet: TransitBody, rashi: number, hm: number, hl: number, n: NatalContext, lang: Lang = 'en'): TransitTag[] {
  const tags: TransitTag[] = [];
  const natal = n.natalRashi;
  const add = (key: TagKey, kind: ImpactTone, body = '') =>
    tags.push({ key, kind, label: sel(TAG_T[key].label(body), lang), note: sel(TAG_T[key].note, lang) });
  const bodyName = (b: TransitBody) => planetName(titleCase(b), lang);
  if (planet === 'SATURN') {
    if (hm === 12) add('sadeRising', 'bad');
    if (hm === 1) add('sadePeak', 'bad');
    if (hm === 2) add('sadeSetting', 'bad');
    if (hm === 8) add('ashtama', 'bad');
    if (hm === 4) add('kantaka', 'bad');
    if (natal.SATURN === rashi) add('saturnReturn', 'mixed');
    if (natal.SUN === rashi) add('saturnOverSun', 'bad');
  }
  if (planet === 'JUPITER') {
    if (natal.JUPITER === rashi) add('jupiterReturn', 'good');
    if (hm === 1) add('jupiterOverMoon', 'mixed');
    if ([5, 7, 9].includes(hm)) add('guruBala', 'good');
    if (hl === 1 || hl === 7) add('jupiterAxis', 'good');
  }
  if (planet === 'RAHU' || planet === 'KETU') {
    if (rashi === n.moonRashi) add('nodeOverMoon', 'bad', bodyName(planet));
    if (rashi === n.lagnaRashi) add('nodeOnAsc', 'mixed', bodyName(planet));
    if (planet === 'RAHU' && natal.RAHU === rashi) add('nodalReturn', 'mixed');
    if (planet === 'RAHU' && natal.KETU === rashi) add('nodalReversal', 'mixed');
  }
  if (planet === 'SUN' && natal.SUN === rashi) add('solarReturn', 'good');
  if (planet === 'MARS') {
    if (rashi === n.moonRashi) add('marsOverMoon', 'bad');
    if ([1, 7, 8].includes(hl)) add('kujaTransit', 'bad');
  }
  return tags;
}

const sel = (r: Record<Lang, string>, lang: Lang) => r[lang] ?? r.en;

/** Localised labels — the English AREA_LABEL / BODY_LABEL / HOUSE_THEME stay for callers that want them. */
export const areaLabel = (a: ImpactArea, lang: Lang = 'en') => sel(AREA_NAME[a], lang);
export const bodyLabel = (b: TransitBody, lang: Lang = 'en') => planetName(titleCase(b), lang);
export const houseTheme = (h: number, lang: Lang = 'en') => sel(HOUSE_THEME_T[h], lang);
export { houseThemeShort };

function dashaLinks(planet: TransitBody, startMs: number, endMs: number, spans: DashaSpan[]): DashaLink[] {
  const lord = titleCase(planet);
  const hits: DashaLink[] = [];
  for (const s of spans) {
    if (s.lord !== lord) continue;
    const a = Date.parse(s.start), b = Date.parse(s.end);
    if (a < endMs && b > startMs && !hits.some(h => h.level === s.level)) hits.push({ level: s.level, lord });
  }
  return hits;
}

/** NatalContext (upper-case keys) → the Erashtaka scorer's chart shape. */
function erashtakaChartFromNatal(n: NatalContext): ErashtakaChart {
  const natalRashis: Record<string, number> = {};
  for (const [k, r] of Object.entries(n.natalRashi)) {
    if (k !== 'ASCENDANT') natalRashis[titleCase(k)] = r;
  }
  return { moonRashi: n.moonRashi, lagnaRashi: n.lagnaRashi, natalRashis, saturnBhinna: n.bhinna?.Saturn, sarva: n.sarva };
}

/**
 * Split a daily longitude series into sign segments and score each one.
 * `lons` must align with `dates`; the nodes' retrograde motion is not tracked
 * because they are always retrograde.
 */
export function buildSegments(
  planet: TransitBody,
  dates: Date[],
  lons: number[],
  natal: NatalContext,
  dashaSpans: DashaSpan[] = [],
  lang: Lang = 'en',
): TransitSegment[] {
  const out: TransitSegment[] = [];
  if (dates.length === 0) return out;
  const trackRetro = planet !== 'RAHU' && planet !== 'KETU';

  let segStart = 0;
  const flush = (endIdx: number, clippedEnd: boolean) => {
    const rashi = Math.floor(lons[segStart] / 30) % 12;
    const startMs = dates[segStart].getTime();
    const endMs = clippedEnd ? dates[endIdx].getTime() + DAY : dates[endIdx + 1].getTime();

    const retroSpans: { start: string; end: string }[] = [];
    if (trackRetro) {
      let rs = -1;
      for (let i = segStart + 1; i <= endIdx; i++) {
        const d = ((lons[i] - lons[i - 1] + 540) % 360) - 180;
        if (d < 0 && rs < 0) rs = i - 1;
        if (d >= 0 && rs >= 0) { retroSpans.push({ start: dates[rs].toISOString(), end: dates[i].toISOString() }); rs = -1; }
      }
      if (rs >= 0) retroSpans.push({ start: dates[rs].toISOString(), end: new Date(endMs).toISOString() });
    }

    const hm = houseFrom(rashi, natal.moonRashi);
    const hl = houseFrom(rashi, natal.lagnaRashi);
    const valence = valenceFromMoon(planet, hm);
    const bindus = natal.bhinna?.[titleCase(planet)]?.[rashi];
    const sarva = natal.sarva?.[rashi];
    let score = clamp(0.7 * valence + ashtakaModifier(bindus, sarva));
    const tags = tagsFor(planet, rashi, hm, hl, natal, lang);

    // Saturn 12/1/2/4/8 from the Moon: the chart-specific Erashtaka grade
    // (dignity, Moon sign, lagna role, bindus, natal Moon) replaces the flat
    // valence — it already folds the bindus in.
    if (planet === 'SATURN') {
      const er = assessErashtaka({ saturnRashi: rashi }, erashtakaChartFromNatal(natal), {}, {}, lang);
      if (er) {
        score = clamp(-er.intensity / 10);
        const tag = tags.find(t => ['sadeRising', 'sadePeak', 'sadeSetting', 'ashtama', 'kantaka'].includes(t.key));
        if (tag) tag.note += GRADED(er.levelLabel, er.intensity.toFixed(1), lang);
      }
    }
    const tone = toneOf(score);

    out.push({
      id: `${planet}-${dates[segStart].toISOString().slice(0, 10)}`,
      planet, rashi,
      rashiName: RASHIS[rashi],
      westernName: RASHI_ENGLISH[rashi],
      start: new Date(startMs).toISOString(),
      end: new Date(endMs).toISOString(),
      startClipped: segStart === 0,
      endClipped: clippedEnd,
      houseFromMoon: hm,
      houseFromLagna: hl,
      valence, bindus, sarva, score, tone,
      retroSpans,
      tags,
      effect: gocharaEffect(planet, hm, lang),
      aspects: aspectedHouses(planet, hl),
      areas: areaImpacts(planet, hl, hm, score),
      dasha: dashaLinks(planet, startMs, endMs, dashaSpans),
      advice: sel(ADVICE_T[planet][tone], lang),
    });
  };

  for (let i = 1; i < dates.length; i++) {
    const prev = Math.floor(lons[i - 1] / 30) % 12;
    const cur = Math.floor(lons[i] / 30) % 12;
    if (cur !== prev) { flush(i - 1, false); segStart = i; }
  }
  flush(dates.length - 1, true);
  return out;
}

export interface MonthImpact {
  /** ISO of the month's first day. */
  month: string;
  areas: Record<ImpactArea, number>;
  /** Segment ids driving each area this month, strongest first. */
  drivers: Record<ImpactArea, string[]>;
}

export type OverlayKind = 'lifts' | 'tests' | 'colours' | 'quiet';
export type DashaTrend = 'positive' | 'negative' | 'mixed' | 'neutral';

/** Sign name for prose: the Western name in English (as before), the localised rashi otherwise. */
const signName = (seg: TransitSegment, lang: Lang) => (lang === 'en' ? seg.westernName : rashiName(seg.rashi, lang));

function joinAreas(areas: ImpactArea[], lang: Lang): string {
  return joinAnd(areas.map(a => (lang === 'en' ? areaLabel(a, lang).toLowerCase() : areaLabel(a, lang))), lang);
}

/** How strongly a transit is rewriting one life-area prediction. */
export function overlayKind(value: number): OverlayKind {
  if (value >= 0.22) return 'lifts';
  if (value <= -0.22) return 'tests';
  if (Math.abs(value) >= 0.07) return 'colours';
  return 'quiet';
}

/** One-line title for a happening transit, with the named event if there is one. */
export function happeningHeadline(seg: TransitSegment, lang: Lang = 'en'): string {
  return STORY.headline(bodyLabel(seg.planet, lang), signName(seg, lang), seg.tags[0]?.label, lang);
}

/** How this transit colours one dasha prediction. */
export function overlaySentence(
  seg: TransitSegment,
  area: ImpactArea,
  dashaTrend?: DashaTrend,
  lang: Lang = 'en',
): string {
  const kind = overlayKind(seg.areas[area]);
  const name = bodyLabel(seg.planet, lang);
  const areaName = lang === 'en' ? areaLabel(area, lang).toLowerCase() : areaLabel(area, lang);
  const house = STORY.house(ordinalNum(seg.houseFromLagna, lang), houseTheme(seg.houseFromLagna, lang), lang);
  const period = dashaTrend ? STORY.period(areaName, dashaTrend, lang) : null;
  if (kind === 'lifts') return STORY.lifts(period, name, areaName, house, lang);
  if (kind === 'tests') return STORY.tests(period, name, areaName, house, lang);
  if (kind === 'colours') return STORY.colours(period, name, areaName, house, lang);
  return STORY.quiet(name, areaName, lang);
}

/**
 * Short story of a happening transit against the running dasha: where it
 * sits, which predictions it rewrites, and whether it is amplified.
 */
export function skyStory(seg: TransitSegment, dashaLabel?: string, lang: Lang = 'en'): string {
  const name = bodyLabel(seg.planet, lang);
  const tag = seg.tags[0];
  const loc = STORY.loc({
    sign: signName(seg, lang), hm: ordinalNum(seg.houseFromMoon, lang), hl: ordinalNum(seg.houseFromLagna, lang),
    theme: houseTheme(seg.houseFromLagna, lang),
  }, lang);
  const lifts = IMPACT_AREAS.filter(a => overlayKind(seg.areas[a]) === 'lifts');
  const tests = IMPACT_AREAS.filter(a => overlayKind(seg.areas[a]) === 'tests');

  const lead = tag ? STORY.leadTag(tag.label, name, loc, lang) : STORY.lead(name, loc, lang);
  const hit = lifts.length && tests.length ? STORY.both(joinAreas(lifts, lang), joinAreas(tests, lang), lang)
    : lifts.length ? STORY.liftsOnly(joinAreas(lifts, lang), lang)
      : tests.length ? STORY.testsOnly(joinAreas(tests, lang), lang)
        : pick(STORY.tints, lang);
  const dasha = seg.dasha.length
    ? STORY.amplified(name, joinAnd(seg.dasha.map(d => pick(STORY.levelName[d.level], lang)), lang), lang)
    : dashaLabel ? STORY.period2(dashaLabel, lang) : '';

  return [lead, hit, dasha].filter(Boolean).join(' ');
}
export function monthlyImpact(segments: TransitSegment[], from: Date, months: number): MonthImpact[] {
  const out: MonthImpact[] = [];
  for (let m = 0; m < months; m++) {
    const first = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth() + m, 1));
    const mid = first.getTime() + 14 * DAY;
    const active = segments.filter(s => Date.parse(s.start) <= mid && Date.parse(s.end) > mid);
    const areas = {} as Record<ImpactArea, number>;
    const drivers = {} as Record<ImpactArea, string[]>;
    for (const area of IMPACT_AREAS) {
      const contrib = active
        .map(s => ({ id: s.id, v: s.areas[area] * BODY_WEIGHT[s.planet] }))
        .filter(c => Math.abs(c.v) > 0.02)
        .sort((a, b) => Math.abs(b.v) - Math.abs(a.v));
      areas[area] = Math.tanh(contrib.reduce((sum, c) => sum + c.v, 0) / 1.75);
      drivers[area] = contrib.slice(0, 3).map(c => c.id);
    }
    out.push({ month: first.toISOString(), areas, drivers });
  }
  return out;
}
