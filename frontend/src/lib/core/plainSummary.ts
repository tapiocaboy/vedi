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
import { type Lang, planetName } from './i18n';
import {
  LABELS, BAND_HEADLINE, STANDING_ABOVE, STANDING_BELOW, PLANET_THEME, LEAD_MAIN, LEAD_SUB,
  NEXT_MAIN, NEXT_SUB, AREA_LINE, GOOD_FOR, GO_EASY_ON, CAUTION, MONTHS, DATE_PATTERN,
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
  };
}

export interface PlainSummary {
  band: Band;
  headline: string;
  /** Where the period stands among all periods, in words; null when no percentile was supplied. */
  standing: string | null;
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

export function buildPlainSummary(input: PlainSummaryInput): PlainSummary {
  const { lang, overallRating, overallPercentile, predictions, periods } = input;
  const md = periods.mahadasha.lord as PlanetKey;
  const ad = periods.antardasha.lord as PlanetKey;
  const band = bandFor(overallRating);

  const standing = standingLine(overallPercentile, lang);

  const areas = AREAS.map(area => {
    const raw = predictions[area]?.trend as TrendKey;
    const trend: TrendKey = TRENDS.includes(raw) ? raw : 'neutral';
    return { area, trend, text: AREA_LINE[area][trend][lang] };
  });

  const next = nextPeriod(md, ad);
  const subEnd = formatPlainDate(periods.antardasha.end, lang);
  const mainEnd = formatPlainDate(periods.mahadasha.end, lang);

  return {
    band,
    headline: BAND_HEADLINE[band][lang],
    standing,
    areas,
    // The sub-period is the phase actually being lived day to day, so it sets the advice.
    goodFor: GOOD_FOR[ad][lang],
    goEasy: GO_EASY_ON[ad][lang],
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

/** "Mercury sets the tone — it brings out learning, communication, trade and deals." */
export function plainSubPeriodLine(lord: string, lang: Lang): string {
  const theme = PLANET_THEME[lord as PlanetKey];
  return fill(SUBPERIOD_LINE[lang], { planet: planetName(lord, lang), theme: theme ? theme[lang] : '' });
}
