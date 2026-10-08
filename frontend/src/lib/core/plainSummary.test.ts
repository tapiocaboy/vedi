import { describe, it, expect } from 'vitest';
import type { Lang } from './i18n';
import { buildPlainSummary, nextPeriod, bandFor, formatPlainDate, type PlainSummaryInput } from './plainSummary';
import * as T from './text/plainSummaryText';

const LANGS: Lang[] = ['en', 'si', 'ta', 'zh', 'hi', 'ja', 'ko', 'ar', 'ml'];
const OTHER = LANGS.filter(l => l !== 'en');

const base = (lang: Lang, over: Partial<PlainSummaryInput> = {}): PlainSummaryInput => ({
  lang,
  overallRating: 8,
  overallPercentile: 74,
  predictions: {
    career: { trend: 'positive' }, wealth: { trend: 'neutral' },
    relationships: { trend: 'mixed' }, health: { trend: 'negative' },
  },
  periods: {
    mahadasha: { lord: 'Venus', end: '2032-07-24T12:00:00.000Z' },
    antardasha: { lord: 'Saturn', end: '2028-03-14T12:00:00.000Z' },
  },
  ...over,
});

describe('bandFor', () => {
  it('maps the 1–10 decile rating onto five bands', () => {
    expect([10, 9].map(bandFor)).toEqual(['high', 'high']);
    expect([8, 7].map(bandFor)).toEqual(['good', 'good']);
    expect([6, 5].map(bandFor)).toEqual(['steady', 'steady']);
    expect([4, 3].map(bandFor)).toEqual(['careful', 'careful']);
    expect([2, 1].map(bandFor)).toEqual(['testing', 'testing']);
  });
});

describe('nextPeriod', () => {
  it('moves to the next sub-period in the dasha sequence', () => {
    expect(nextPeriod('Venus', 'Saturn')).toEqual({ kind: 'sub', lord: 'Mercury' });
    expect(nextPeriod('Jupiter', 'Mercury')).toEqual({ kind: 'sub', lord: 'Ketu' });
  });

  it('starts the next MAIN period after a main period\'s last sub-period', () => {
    // Sub-periods of Venus run Venus…Ketu; Ketu is the planet before Venus in the sequence.
    expect(nextPeriod('Venus', 'Ketu')).toEqual({ kind: 'main', lord: 'Sun' });
    // Ketu's own main period ends with Mercury, and Venus follows Ketu.
    expect(nextPeriod('Ketu', 'Mercury')).toEqual({ kind: 'main', lord: 'Venus' });
  });
});

describe('buildPlainSummary (English)', () => {
  const s = buildPlainSummary(base('en'));

  it('headlines the calibrated band, not raw numbers', () => {
    expect(s.band).toBe('good');
    expect(s.headline).toBe('A favourable stretch');
  });

  it('gives one line per life area, in a fixed order, matching each trend', () => {
    expect(s.areas.map(a => a.area)).toEqual(['career', 'wealth', 'relationships', 'health']);
    expect(s.areas[0].text).toMatch(/^Career: a good stretch/);
    expect(s.areas[3].text).toMatch(/^Health: take extra care/);
  });

  it('states where the period stands among all periods', () => {
    expect(s.standing).toBe('Stronger than about 74% of periods in a typical life.');
    const low = buildPlainSummary(base('en', { overallPercentile: 20 }));
    expect(low.standing).toBe('About 80% of periods in a typical life are easier than this one.');
  });

  it('gives the exact dates of the main period, sub-period and next change', () => {
    expect(s.lead[0]).toContain('24 July 2032');
    expect(s.lead[1]).toContain('14 March 2028');
    expect(s.next).toBe('Next sub-period: Mercury, from 14 March 2028.');
  });

  it('flags a main-period change when the last sub-period is running', () => {
    const last = buildPlainSummary(base('en', {
      periods: { mahadasha: { lord: 'Venus', end: '2032-07-24T12:00:00.000Z' }, antardasha: { lord: 'Ketu', end: '2032-07-24T12:00:00.000Z' } },
    }));
    expect(last.next).toBe('Next main period: Sun, from 24 July 2032.');
  });

  it('takes practical advice from the sub-period lord', () => {
    expect(s.goodFor).toBe(T.GOOD_FOR.Saturn.en);
    expect(s.goEasy).toBe(T.GO_EASY_ON.Saturn.en);
  });

  it('never names events, and always says these are tendencies', () => {
    const all = [s.headline, s.standing, ...s.areas.map(a => a.text), s.goodFor, s.goEasy, ...s.lead, s.next].join(' ');
    expect(all).not.toMatch(/\b(marriage|wedding|divorce|death|die|accident|promotion will|you will (get|marry|lose))\b/i);
    expect(s.caution).toMatch(/tendencies/);
    expect(s.caution).toMatch(/not predictions of specific events/);
  });

  it('falls back to a neutral line for an unrecognised trend instead of throwing', () => {
    const odd = buildPlainSummary(base('en', { predictions: { career: { trend: '???' }, wealth: { trend: 'neutral' }, relationships: { trend: 'neutral' }, health: { trend: 'neutral' } } }));
    expect(odd.areas[0].trend).toBe('neutral');
  });
});

describe('formatPlainDate', () => {
  const iso = '2032-07-24T12:00:00.000Z';   // midday UTC: the same calendar day in every timezone from −11 to +11
  it.each([
    ['en', '24 July 2032'], ['si', '2032 ජූලි 24'], ['ta', '24 ஜூலை 2032'], ['zh', '2032年7月24日'],
    ['hi', '24 जुलाई 2032'], ['ja', '2032年7月24日'], ['ko', '2032년 7월 24일'], ['ar', '24 يوليو 2032'], ['ml', '2032 ജൂലൈ 24'],
  ] as const)('writes %s as %s', (lang, want) => {
    expect(formatPlainDate(iso, lang)).toBe(want);
  });

  it('never leaks an English month name into another language', () => {
    for (const lang of OTHER) expect(formatPlainDate(iso, lang)).not.toMatch(/[A-Za-z]/);
  });

  it('has twelve month names for every language that writes the month as a word', () => {
    for (const lang of LANGS) expect([0, 12]).toContain(T.MONTHS[lang].length);
    expect(OTHER.filter(l => T.MONTHS[l].length === 0).sort()).toEqual(['ja', 'ko', 'zh']);
  });

  it('degrades to the ISO date rather than "Invalid Date"', () => {
    expect(formatPlainDate('not a date', 'en')).toBe('not a date');
  });
});

describe('plain-summary translations', () => {
  // Every table in the text module, flattened to [label, record].
  const tables: Array<[string, Record<Lang, string>]> = [];
  const walk = (name: string, v: unknown) => {
    if (typeof v !== 'object' || v === null || Array.isArray(v)) return;   // MONTHS is checked on its own below
    const rec = v as Record<string, unknown>;
    if (typeof rec.en === 'string') { tables.push([name, rec as Record<Lang, string>]); return; }
    for (const [k, child] of Object.entries(rec)) walk(`${name}.${k}`, child);
  };
  for (const [name, v] of Object.entries(T)) if (typeof v === 'object' && v) walk(name, v);

  it('covers every table in all nine languages', () => {
    // 4 labels + 5 headlines + 2 standing + 9 themes + 4 lead/next + 16 area lines + 9 + 9 advice + 1 caution + 1 date pattern
    expect(tables.length).toBe(60);
    for (const [name, rec] of tables) for (const l of LANGS) expect(rec[l], `${name}.${l}`).toBeTruthy();
  });

  it.each(OTHER)('%s has no English fallback', lang => {
    // DATE_PATTERN is a layout, not prose: "day month year" is correct in several languages.
    for (const [name, rec] of tables) if (name !== 'DATE_PATTERN') expect(rec[lang], name).not.toBe(rec.en);
  });

  it.each(OTHER)('%s keeps every {placeholder} the English has', lang => {
    const holders = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join(',');
    for (const [name, rec] of tables) expect(holders(rec[lang]), name).toBe(holders(rec.en));
  });

  it.each(LANGS)('%s builds a complete summary with no unfilled placeholders', lang => {
    const s = buildPlainSummary(base(lang));
    const all = [s.headline, s.standing!, ...s.areas.map(a => a.text), s.goodFor, s.goEasy, ...s.lead, s.next, s.caution, ...Object.values(s.labels)];
    for (const t of all) { expect(t).toBeTruthy(); expect(t).not.toMatch(/\{\w+\}/); }
    if (lang !== 'en') expect(s.headline).not.toBe(buildPlainSummary(base('en')).headline);
  });
});
