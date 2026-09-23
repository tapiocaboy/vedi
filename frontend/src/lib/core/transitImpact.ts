/**
 * Transit Impact — turns the major planets' sign changes (Saturn, Jupiter,
 * Rahu/Ketu, Mars, Sun) into dated segments and scores what each one does to
 * the native's predictions: classical gochara from the Moon, the house it
 * occupies and aspects from the Ascendant, Ashtakavarga support for the sign,
 * and whether the transiting planet is also running the dasha at the time.
 *
 * English only by design — this section is not part of the translated surface.
 */

import { valenceFromMoon } from './transits';
import { gocharaEffect } from './gocharaPhala';
import { RASHIS, RASHI_ENGLISH } from './rashi';

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

const ADVICE: Record<TransitBody, Record<ImpactTone, string>> = {
  SATURN: {
    good: 'Commit to long projects now. Steady, disciplined work compounds and is finally rewarded.',
    mixed: 'Keep routines tight and promises realistic. Slow progress is still progress.',
    bad: 'Reduce load, avoid big leaps and protect health. Patience, service and structure are the remedy.',
  },
  JUPITER: {
    good: 'Say yes to growth: learning, investing, marriage talks and new mentors all carry luck.',
    mixed: 'Expand carefully. Pick one opportunity and give it your full attention.',
    bad: 'Guard against over-optimism and over-spending. Put wisdom into practice rather than promises.',
  },
  RAHU: {
    good: 'Take bold, unconventional chances, especially with technology, foreign links and networks.',
    mixed: 'Ambition is high but so is noise. Verify facts before acting on excitement.',
    bad: 'Avoid shortcuts, schemes and obsessive choices. Stay grounded and double-check people.',
  },
  KETU: {
    good: 'Let go of what is finished. Research, healing and spiritual practice go deep now.',
    mixed: 'Expect detachment in this area. Simplify rather than force results.',
    bad: 'Sudden losses of interest or separations are possible. Do not make exits in haste.',
  },
  MARS: {
    good: 'Energy converts to results. Push competitive goals, property matters and physical training.',
    mixed: 'Channel the drive into work rather than arguments.',
    bad: 'Short fuse and accident risk. Drive carefully, avoid disputes and do not rush surgery or contracts.',
  },
  SUN: {
    good: 'A month for visibility. Ask for recognition and speak with authority.',
    mixed: 'Lead quietly this month and keep ego out of decisions.',
    bad: 'Energy and pride run low. Rest, avoid clashes with authority and keep a low profile.',
  },
};

export interface TransitTag {
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

function tagsFor(planet: TransitBody, rashi: number, hm: number, hl: number, n: NatalContext): TransitTag[] {
  const tags: TransitTag[] = [];
  const natal = n.natalRashi;
  if (planet === 'SATURN') {
    if (hm === 12) tags.push({ label: 'Sade Sati · rising', kind: 'bad', note: 'The first 2.5 years of Sade Sati: expenses, disturbed sleep and hidden worries build up.' });
    if (hm === 1) tags.push({ label: 'Sade Sati · peak', kind: 'bad', note: 'The heaviest phase of Sade Sati. Mind, health and status are all tested; simplify and endure.' });
    if (hm === 2) tags.push({ label: 'Sade Sati · setting', kind: 'bad', note: 'The closing phase of Sade Sati. Family and money are tested, then pressure lifts.' });
    if (hm === 8) tags.push({ label: 'Ashtama Shani', kind: 'bad', note: 'Saturn 8th from the Moon: obstacles, chronic complaints and delays. Patience is the remedy.' });
    if (hm === 4) tags.push({ label: 'Kantaka Shani', kind: 'bad', note: 'Saturn 4th from the Moon: pressure at home, over property, vehicles or the mother.' });
    if (natal.SATURN === rashi) tags.push({ label: 'Saturn return', kind: 'mixed', note: 'Saturn back in its birth sign: a maturity checkpoint that rewards responsibility.' });
    if (natal.SUN === rashi) tags.push({ label: 'Saturn over natal Sun', kind: 'bad', note: 'Authority, father and confidence come under Saturn’s pressure.' });
  }
  if (planet === 'JUPITER') {
    if (natal.JUPITER === rashi) tags.push({ label: 'Jupiter return', kind: 'good', note: 'Jupiter back in its birth sign: a 12-year renewal of faith, learning and opportunity.' });
    if (hm === 1) tags.push({ label: 'Jupiter over Moon', kind: 'mixed', note: 'Jupiter on the natal Moon: emotional growth, but classically a restless, expense-heavy year.' });
    if ([5, 7, 9].includes(hm)) tags.push({ label: 'Guru bala', kind: 'good', note: 'Jupiter trine or opposite the Moon: the classic window for marriage, children and good fortune.' });
    if (hl === 1 || hl === 7) tags.push({ label: 'Jupiter on Ascendant axis', kind: 'good', note: 'Jupiter on the 1st/7th axis protects health and blesses partnerships.' });
  }
  if (planet === 'RAHU' || planet === 'KETU') {
    if (rashi === n.moonRashi) tags.push({ label: `${BODY_LABEL[planet]} over Moon`, kind: 'bad', note: 'A node on the natal Moon unsettles the mind and emotions; keep routines steady.' });
    if (rashi === n.lagnaRashi) tags.push({ label: `${BODY_LABEL[planet]} on Ascendant`, kind: 'mixed', note: 'A node on the Ascendant rewires identity and direction over about 18 months.' });
    if (planet === 'RAHU' && natal.RAHU === rashi) tags.push({ label: 'Nodal return', kind: 'mixed', note: 'The nodes return to their birth positions (about every 18.6 years): a destiny reset.' });
    if (planet === 'RAHU' && natal.KETU === rashi) tags.push({ label: 'Nodal reversal', kind: 'mixed', note: 'The nodes sit on their birth opposites: old patterns are turned inside out.' });
  }
  if (planet === 'SUN' && natal.SUN === rashi) {
    tags.push({ label: 'Solar return', kind: 'good', note: 'The Sun back in its birth sign: your birthday month and a fresh annual cycle.' });
  }
  if (planet === 'MARS') {
    if (rashi === n.moonRashi) tags.push({ label: 'Mars over Moon', kind: 'bad', note: 'Mars on the natal Moon: irritability, heat and haste. Cool down before acting.' });
    if ([1, 7, 8].includes(hl)) tags.push({ label: 'Kuja transit', kind: 'bad', note: 'Mars through the 1st, 7th or 8th: arguments, accidents and inflammation need care.' });
  }
  return tags;
}

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
    const score = clamp(0.7 * valence + ashtakaModifier(bindus, sarva));
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
      tags: tagsFor(planet, rashi, hm, hl, natal),
      effect: gocharaEffect(planet, hm),
      aspects: aspectedHouses(planet, hl),
      areas: areaImpacts(planet, hl, hm, score),
      dasha: dashaLinks(planet, startMs, endMs, dashaSpans),
      advice: ADVICE[planet][tone],
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

const TREND_WORD: Record<DashaTrend, string> = {
  positive: 'favourable',
  negative: 'challenging',
  mixed: 'mixed',
  neutral: 'steady',
};

function ordinalEn(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
}

function joinAreas(areas: ImpactArea[]): string {
  const names = areas.map(a => AREA_LABEL[a].toLowerCase());
  if (names.length <= 1) return names[0] ?? '';
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

/** How strongly a transit is rewriting one life-area prediction. */
export function overlayKind(value: number): OverlayKind {
  if (value >= 0.22) return 'lifts';
  if (value <= -0.22) return 'tests';
  if (Math.abs(value) >= 0.07) return 'colours';
  return 'quiet';
}

/** One-line title for a happening transit, with the named event if there is one. */
export function happeningHeadline(seg: TransitSegment): string {
  const tag = seg.tags[0];
  return tag
    ? `${BODY_LABEL[seg.planet]} in ${seg.westernName} — ${tag.label}`
    : `${BODY_LABEL[seg.planet]} in ${seg.westernName}`;
}

/**
 * How this transit colours one dasha prediction. English only — the Transits
 * sky is not on the translated surface.
 */
export function overlaySentence(
  seg: TransitSegment,
  area: ImpactArea,
  dashaTrend?: DashaTrend,
): string {
  const kind = overlayKind(seg.areas[area]);
  const name = BODY_LABEL[seg.planet];
  const areaName = AREA_LABEL[area].toLowerCase();
  const house = `${ordinalEn(seg.houseFromLagna)} house (${HOUSE_THEME[seg.houseFromLagna]})`;
  const period = dashaTrend
    ? `The running period looks ${TREND_WORD[dashaTrend]} for ${areaName}`
    : null;

  if (kind === 'lifts') {
    return period
      ? `${period}. ${name} from the ${house} adds a tailwind — results can come through more easily than the period alone would suggest.`
      : `${name} is lifting ${areaName} from the ${house}.`;
  }
  if (kind === 'tests') {
    return period
      ? `${period}. ${name} from the ${house} is testing this area — expect slower or heavier results than the period alone would suggest.`
      : `${name} is testing ${areaName} from the ${house}.`;
  }
  if (kind === 'colours') {
    return period
      ? `${period}. ${name} tints the result through the ${house} without taking over.`
      : `${name} is colouring ${areaName} through the ${house}, without taking over.`;
  }
  return `${name} is not the main driver of ${areaName} right now.`;
}

/**
 * Short English story of a happening transit against the running dasha:
 * where it sits, which predictions it rewrites, and whether it is amplified.
 */
export function skyStory(seg: TransitSegment, dashaLabel?: string): string {
  const name = BODY_LABEL[seg.planet];
  const tag = seg.tags[0];
  const loc = `in ${seg.westernName}, the ${ordinalEn(seg.houseFromMoon)} house from your Moon and the ${ordinalEn(seg.houseFromLagna)} from the Ascendant (${HOUSE_THEME[seg.houseFromLagna]})`;
  const lifts = IMPACT_AREAS.filter(a => overlayKind(seg.areas[a]) === 'lifts');
  const tests = IMPACT_AREAS.filter(a => overlayKind(seg.areas[a]) === 'tests');

  const lead = tag
    ? `${tag.label} is happening now: ${name} is ${loc}.`
    : `${name} is ${loc}.`;

  let hit: string;
  if (lifts.length && tests.length) {
    hit = `That supports ${joinAreas(lifts)} while testing ${joinAreas(tests)} — so the running predictions in those areas will not land exactly as the dasha alone says.`;
  } else if (lifts.length) {
    hit = `That lifts ${joinAreas(lifts)} above what the running period alone would give.`;
  } else if (tests.length) {
    hit = `That tests ${joinAreas(tests)} — the running predictions in those areas come through more slowly or heavily.`;
  } else {
    hit = 'It tints the climate rather than rewriting any one prediction.';
  }

  const dasha = seg.dasha.length
    ? `${name} is also the lord of your ${seg.dasha.map(d => d.level.toLowerCase()).join(' and ')}, so this transit is amplified.`
    : dashaLabel
      ? `Your running period is ${dashaLabel}. This transit colours that period; it does not replace it.`
      : '';

  return [lead, hit, dasha].filter(Boolean).join(' ');
}

/** Month-by-month life-area climate from every transit active at mid-month. */
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
