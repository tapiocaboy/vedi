/**
 * Wording and grouping for the Graph tab's "life in chapters" and "year ahead"
 * views. Pure functions over numbers the engine already produced — the data
 * itself comes from lib/services/yearAheadService.ts.
 */
import { type Lang, planetName } from './i18n';
import { MONTHS, PLANET_THEME, type PlanetKey } from './text/plainSummaryText';
import { YEAR_TEXT, MONTH_SHORT } from './text/readingText';
import { formatPlainDate } from './plainSummary';

const fill = (t: string, v: Record<string, string | number>) => t.replace(/\{(\w+)\}/g, (m, k: string) => (k in v ? String(v[k]) : m));
const theme = (lord: string, lang: Lang) => PLANET_THEME[lord as PlanetKey]?.[lang] ?? '';

/** "October 2026" / "2026年10月" / "2026년 10월". */
export function monthYearLabel(year: number, month: number, lang: Lang): string {
  const names = MONTHS[lang];
  if (names.length) return `${names[month]} ${year}`;
  if (lang === 'ko') return `${year}년 ${month + 1}월`;
  return `${year}年${month + 1}月`;
}

export const monthShort = (month: number, lang: Lang) => MONTH_SHORT[lang][month];

/**
 * One line for the whole year: where it peaks and where it dips. When the
 * months sit close together (a spread under 15 percentile points) there is no
 * honest peak to name, so it says the year is even instead.
 */
export function yearHeadline(months: { year: number; month: number; percentile: number }[], lang: Lang): string {
  if (!months.length) return '';
  const best = months.reduce((a, b) => (b.percentile > a.percentile ? b : a));
  const worst = months.reduce((a, b) => (b.percentile < a.percentile ? b : a));
  if (best.percentile - worst.percentile < 15) return YEAR_TEXT.yearFlat[lang];
  return fill(YEAR_TEXT.yearHeadline[lang], {
    best: monthYearLabel(best.year, best.month, lang),
    worst: monthYearLabel(worst.year, worst.month, lang),
  });
}

/** Consecutive months under the same short-period lord, as grid spans. */
export function groupStretches(lords: (string | undefined)[]): { lord: string; start: number; span: number }[] {
  const out: { lord: string; start: number; span: number }[] = [];
  lords.forEach((lord, i) => {
    if (!lord) return;
    const last = out[out.length - 1];
    if (last && last.lord === lord && last.start + last.span === i) last.span += 1;
    else out.push({ lord, start: i, span: 1 });
  });
  return out;
}

export interface PeriodChange { date: string; level: 'main' | 'sub'; from: string; to: string }

/** "23 January 2027 — the Mercury sub-period ends and a Ketu sub-period begins (…)." */
export function changeLine(c: PeriodChange, lang: Lang): string {
  return fill(YEAR_TEXT[c.level === 'main' ? 'mainChange' : 'subChange'][lang], {
    date: formatPlainDate(c.date, lang), from: planetName(c.from, lang), to: planetName(c.to, lang), theme: theme(c.to, lang),
  });
}

export function chapterHeadline(lord: string, lang: Lang): string {
  return fill(YEAR_TEXT.chapterNow[lang], { planet: planetName(lord, lang), theme: theme(lord, lang) });
}

export function chapterSpan(start: string, end: string, fromAge: number, toAge: number, lang: Lang): string {
  return fill(YEAR_TEXT.chapterSpan[lang], {
    start: formatPlainDate(start, lang), end: formatPlainDate(end, lang), a: Math.floor(fromAge), b: Math.floor(toAge),
  });
}

export const ageRange = (fromAge: number, toAge: number, lang: Lang) =>
  fill(YEAR_TEXT.ageRange[lang], { a: Math.floor(fromAge), b: Math.floor(toAge) });

export const youAreHere = (age: number, lang: Lang) => fill(YEAR_TEXT.youAreHere[lang], { age: Math.floor(age) });

export const planetTheme = theme;
