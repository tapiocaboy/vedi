/**
 * Plain-language summary of the running period.
 *
 * Turns the engine's structured output into a short, jargon-free reading for
 * someone with no astrology background: one headline, one line per life area,
 * what suits this phase and what to go easy on, and the exact dates the phases
 * change. Everything here is derived from numbers the engine already computed —
 * the builder adds wording and arithmetic (period boundaries), no new judgement.
 *
 * Deliberately framed as tendencies. Backtesting the period scores against 200
 * dated life events found no timing skill beyond chance (see backtest/), so the
 * summary never names events, only themes and sensible ways to use the phase.
 */

import { DASHA_SEQUENCE } from './dasha';
import { PERIOD_LINE, SUBPERIOD_LINE } from './text/readingText';
import { type Lang, joinAnd, pick, planetName } from './i18n';
import { PAIR_EFFECTS, type PairEffect } from './text/pairEffects';
import { INDICATOR_TEXT } from './text/indicatorText';
import type { IndicatorKey } from './classicalIndicators';
import {
  LABELS, BAND_HEADLINE, STANDING_ABOVE, STANDING_BELOW, PLANET_THEME, LEAD_MAIN, LEAD_SUB,
  NEXT_MAIN, NEXT_SUB, AREA_LINE, GOOD_FOR, GO_EASY_ON, CAUTION, MONTHS, DATE_PATTERN,
  OVERALL_NOW, OVERALL_FINE, OVERALL_SAME, COMBINATION, BACKDROP, AREA_TILT, COMBOS,
  type Band, type AreaKey, type TrendKey, type PlanetKey,
} from './text/plainSummaryText';

export type { Band, AreaKey, TrendKey };

export interface PlainSummaryInput {
  lang: Lang;
  /** Calibrated 1–10 decile rating of the period (10 = top tenth of periods). */
  overallRating: number;
  /** Share (0–100) of measured periods this one scores above. */
  overallPercentile?: number;
  predictions: Record<AreaKey, { trend: string }>;
  periods: {
    mahadasha: { lord: string; end: string };
    antardasha: { lord: string; end: string };
    pratyantardasha?: { lord: string; end: string } | null;
    sookshmaDasha?: { lord: string; end: string } | null;
  };
  /** Classical combinations already found active for this chart and period. */
  indicators?: { key: string; planet?: string }[];
}

export interface PlainSummary {
  band: Band;
  headline: string;
  /** Where the period stands among all periods, in words; null when no percentile was supplied. */
  standing: string | null;
  /** The mahadasha–antardasha (and finer) pairing, in words. Null outside English and Sinhala, where the pair table is written. */
  combination: string | null;
  /** Up to three classical combinations active in this window. */
  combos: string | null;
  areas: { area: AreaKey; trend: TrendKey; text: string }[];
  goodFor: string;
  goEasy: string;
  /** Main period, current sub-period, and what comes next — each with its exact date. */
  lead: string[];
  next: string;
  caution: string;
  labels: { title: string; goodFor: string; goEasy: string; dates: string };
}

const AREAS: AreaKey[] = ['career', 'wealth', 'relationships', 'health'];
const TRENDS: TrendKey[] = ['positive', 'neutral', 'mixed', 'negative'];

export function bandFor(rating: number): Band {
  if (rating >= 9) return 'high';
  if (rating >= 7) return 'good';
  if (rating >= 5) return 'steady';
  if (rating >= 3) return 'careful';
  return 'testing';
}

/**
 * What follows the current sub-period. The nine sub-periods of a main period run
 * through the dasha sequence starting from the main lord, so the last one is the
 * planet just before it — after which the next main period begins.
 */
export function nextPeriod(mahadasha: string, antardasha: string): { kind: 'sub' | 'main'; lord: string } {
  const idx = (lord: string) => DASHA_SEQUENCE.indexOf(lord);
  const lastSub = DASHA_SEQUENCE[(idx(mahadasha) + 8) % 9];
  if (antardasha === lastSub) return { kind: 'main', lord: DASHA_SEQUENCE[(idx(mahadasha) + 1) % 9] };
  return { kind: 'sub', lord: DASHA_SEQUENCE[(idx(antardasha) + 1) % 9] };
}

/** "Stronger than about 64% of periods…" / "About 60% of periods are easier…", or null without a percentile. */
export function standingLine(percentile: number | undefined, lang: Lang): string | null {
  if (percentile == null) return null;
  const p = Math.round(percentile);
  return p >= 50
    ? fill(STANDING_ABOVE[lang], { n: Math.min(99, Math.max(50, p)) })
    : fill(STANDING_BELOW[lang], { n: Math.min(99, Math.max(50, 100 - p)) });
}

const fill = (template: string, vars: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));

/**
 * "24 July 2032" in the reader's language. Read in the viewer's local timezone,
 * like every other date on the Now tab, so a boundary falling late in the UTC day
 * shows the day the viewer will actually live it.
 */
export function formatPlainDate(iso: string, lang: Lang): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10);
  const months = MONTHS[lang];
  return fill(DATE_PATTERN[lang], {
    d: d.getDate(),
    m: months.length ? months[d.getMonth()] : d.getMonth() + 1,
    y: d.getFullYear(),
  });
}

/** Kept out of the plain layer: it names outcomes, and this summary only names tendencies. */
const EVENT = /\b(marriage|wedding|divorce|death|die|accident|promotion will|you will (get|marry|lose))\b/i;

function pairOf(a: string, b: string): PairEffect | null {
  return PAIR_EFFECTS[`${a}-${b}`] ?? null;
}

export function buildPlainSummary(input: PlainSummaryInput): PlainSummary {
  const { lang, overallRating, overallPercentile, predictions, periods } = input;
  const md = periods.mahadasha.lord as PlanetKey;
  const ad = periods.antardasha.lord as PlanetKey;
  const band = bandFor(overallRating);

  const standing = standingLine(overallPercentile, lang);

  // The planet in charge of the window the reader is actually in: sookshma,
  // else pratyantar, else the sub-period. Its partner is the period one level up.
  const fine = periods.sookshmaDasha ?? periods.pratyantardasha ?? null;
  const host = periods.sookshmaDasha
    ? (periods.pratyantardasha ?? periods.antardasha)
    : periods.antardasha;
  const focus = (fine?.lord ?? ad) as PlanetKey;
  const windowPair = fine ? pairOf(host.lord, fine.lord) : pairOf(md, ad);
  const widerPair = fine ? pairOf(md, ad) : null;

  const theme = (lord: string) => PLANET_THEME[lord as PlanetKey]?.[lang] ?? '';
  const headline = !fine
    ? fill(OVERALL_NOW[lang], {
        date: formatPlainDate(periods.antardasha.end, lang),
        sub: planetName(ad, lang),
        main: planetName(md, lang),
        subTheme: theme(ad),
        mainTheme: theme(md),
      })
    : fine.lord === host.lord
      ? fill(OVERALL_SAME[lang], {
          date: formatPlainDate(fine.end, lang),
          fine: planetName(fine.lord, lang),
          fineTheme: theme(fine.lord),
          main: planetName(md, lang),
          sub: planetName(ad, lang),
          subTheme: theme(ad),
        })
      : fill(OVERALL_FINE[lang], {
          date: formatPlainDate(fine.end, lang),
          fine: planetName(fine.lord, lang),
          fineTheme: theme(fine.lord),
          other: planetName(host.lord, lang),
          otherTheme: theme(host.lord),
        });

  const comboBits: string[] = [];
  if (lang === 'en' || lang === 'si') {
    const windowTheme = windowPair ? pick(windowPair.theme, lang) : '';
    if (windowTheme && !EVENT.test(windowTheme)) comboBits.push(fill(COMBINATION[lang], { theme: windowTheme }));
    const widerTheme = widerPair && widerPair !== windowPair ? pick(widerPair.theme, lang) : '';
    if (widerTheme && !EVENT.test(widerTheme)) comboBits.push(fill(BACKDROP[lang], { theme: widerTheme }));
  }

  const areas = AREAS.map(area => {
    const raw = predictions[area]?.trend as TrendKey;
    const trend: TrendKey = TRENDS.includes(raw) ? raw : 'neutral';
    const generic = AREA_LINE[area][trend][lang];
    const tilt = fill(AREA_TILT[lang], { planet: planetName(focus, lang), theme: theme(focus) });
    const specific = windowPair ? pick(windowPair[area], lang) : '';
    const text = specific && (lang === 'en' || lang === 'si') && !EVENT.test(specific)
      ? `${generic.split(':')[0]}: ${specific}. ${tilt}`
      : `${generic} ${tilt}`;
    return { area, trend, text };
  });

  const comboLines = (input.indicators ?? []).flatMap(hit => {
    const row = INDICATOR_TEXT[hit.key as IndicatorKey];
    if (!row) return [];
    const text = fill(row[lang], { planet: hit.planet ? planetName(hit.planet, lang) : '' });
    return text && !EVENT.test(text) ? [text] : [];
  }).slice(0, 3);

  const next = nextPeriod(md, ad);
  const subEnd = formatPlainDate(periods.antardasha.end, lang);
  const mainEnd = formatPlainDate(periods.mahadasha.end, lang);

  return {
    band,
    headline,
    standing,
    combination: comboBits.length ? comboBits.join(' ') : null,
    combos: comboLines.length ? fill(COMBOS[lang], { list: joinAnd(comboLines, lang) }) : null,
    areas,
    // Advice follows the planet in charge of this window, not the multi-year lord alone.
    goodFor: GOOD_FOR[focus][lang],
    goEasy: GO_EASY_ON[focus][lang],
    lead: [
      fill(LEAD_MAIN[lang], { planet: planetName(md, lang), date: mainEnd, theme: PLANET_THEME[md][lang] }),
      fill(LEAD_SUB[lang], { planet: planetName(ad, lang), date: subEnd, theme: PLANET_THEME[ad][lang] }),
    ],
    next: fill((next.kind === 'main' ? NEXT_MAIN : NEXT_SUB)[lang], { planet: planetName(next.lord, lang), date: subEnd }),
    caution: CAUTION[lang],
    labels: {
      title: LABELS.title[lang], goodFor: LABELS.goodFor[lang], goEasy: LABELS.goEasy[lang], dates: LABELS.dates[lang],
    },
  };
}

// ─── Plain headers for any period (Timeline, Insights) ──────────────────────

export interface PlainPeriodHeader {
  band: Band;
  headline: string;
  /** "The Mercury sub-period of your Saturn main period — it brings out…" */
  line: string;
  standing: string | null;
}

/**
 * The plain-language header of a period: a headline from its calibrated rating,
 * one sentence on what the running sub-period is about, and where it stands
 * among all periods. No house numbers, no Sanskrit — the astrology lives in the
 * expandable section beneath it.
 */
export function plainPeriodHeader(input: {
  lang: Lang;
  mahadasha: string;
  antardasha?: string;
  overallRating: number;
  overallPercentile?: number;
}): PlainPeriodHeader {
  const { lang, mahadasha, antardasha, overallRating, overallPercentile } = input;
  const band = bandFor(overallRating);
  const sub = (antardasha ?? mahadasha) as PlanetKey;
  const line = antardasha
    ? fill(PERIOD_LINE[lang], { sub: planetName(sub, lang), main: planetName(mahadasha, lang), theme: PLANET_THEME[sub][lang] })
    : fill(SUBPERIOD_LINE[lang], { planet: planetName(mahadasha, lang), theme: PLANET_THEME[mahadasha as PlanetKey][lang] });
  return { band, headline: BAND_HEADLINE[band][lang], line, standing: standingLine(overallPercentile, lang) };
}

/**
 * The area sentence for this exact period (the pairing in charge, plus what that
 * planet leans toward). Null when the period has no dated sub-period to read.
 * The "Career:" lead-in is stripped, matching plainAreaLine.
 */
export function specificAreaLine(
  input: {
    lang: Lang;
    overallRating: number;
    predictions: PlainSummaryInput['predictions'];
    periods: PlainSummaryInput['periods'];
  },
  area: AreaKey,
): string | null {
  if (!input.periods.antardasha?.end) return null;
  const text = buildPlainSummary({ ...input, overallPercentile: undefined }).areas.find(a => a.area === area)?.text;
  if (!text) return null;
  return text.replace(/^[^:：]{1,24}[:：]\s*/, '');
}

/** "Mercury sets the tone — it brings out learning, communication, trade and deals." */
export function plainSubPeriodLine(lord: string, lang: Lang): string {
  const theme = PLANET_THEME[lord as PlanetKey];
  return fill(SUBPERIOD_LINE[lang], { planet: planetName(lord, lang), theme: theme ? theme[lang] : '' });
}
