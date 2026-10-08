import { describe, it, expect } from 'vitest';
import { monthYearLabel, monthShort, yearHeadline, groupStretches, changeLine, chapterHeadline, chapterSpan } from './yearAhead';
import { YEAR_TEXT, MONTH_SHORT } from './text/readingText';
import type { Lang } from './i18n';

const LANGS: Lang[] = ['en', 'si', 'ta', 'zh', 'hi', 'ja', 'ko', 'ar', 'ml'];

describe('year ahead wording', () => {
  it('names the peak and the dip when the year has them', () => {
    const months = [
      { year: 2026, month: 9, percentile: 33 }, { year: 2026, month: 10, percentile: 48 },
      { year: 2027, month: 0, percentile: 50 }, { year: 2027, month: 1, percentile: 5 },
    ];
    expect(yearHeadline(months, 'en')).toBe('Strongest around January 2027; most demanding around February 2027.');
    expect(yearHeadline(months, 'ja')).toBe('最も強いのは2027年1月ごろ、最も負担が大きいのは2027年2月ごろ。');
  });

  it('calls a flat year flat instead of inventing a peak', () => {
    const months = [{ year: 2026, month: 9, percentile: 50 }, { year: 2026, month: 10, percentile: 58 }];
    expect(yearHeadline(months, 'en')).toBe('An even year — no month stands far apart from the rest.');
  });

  it('groups consecutive months under one short-period lord', () => {
    expect(groupStretches(['Saturn', 'Saturn', 'Ketu', 'Venus', 'Venus', 'Saturn'])).toEqual([
      { lord: 'Saturn', start: 0, span: 2 }, { lord: 'Ketu', start: 2, span: 1 },
      { lord: 'Venus', start: 3, span: 2 }, { lord: 'Saturn', start: 5, span: 1 },
    ]);
    expect(groupStretches([undefined, 'Moon'])).toEqual([{ lord: 'Moon', start: 1, span: 1 }]);
  });

  it('describes period changes in plain words', () => {
    const line = changeLine({ date: '2027-01-23T12:00:00Z', level: 'sub', from: 'Mercury', to: 'Ketu' }, 'en');
    expect(line).toMatch(/^23 January 2027 — the Mercury sub-period ends and a Ketu sub-period begins \(/);
    expect(changeLine({ date: '2040-05-12T12:00:00Z', level: 'main', from: 'Saturn', to: 'Mercury' }, 'en'))
      .toMatch(/a new main period begins: Mercury/);
  });

  it('fills every template in every language', () => {
    for (const lang of LANGS) {
      const texts = [
        monthYearLabel(2027, 1, lang), monthShort(1, lang), chapterHeadline('Saturn', lang),
        chapterSpan('2021-05-12T00:00:00Z', '2040-05-12T00:00:00Z', 34.6, 53.6, lang),
        changeLine({ date: '2027-01-23T12:00:00Z', level: 'sub', from: 'Mercury', to: 'Ketu' }, lang),
      ];
      for (const s of texts) {
        expect(s, lang).toBeTruthy();
        expect(s, lang).not.toMatch(/\{\w+\}/);
      }
    }
  });

  it('YEAR_TEXT and MONTH_SHORT exist in all nine languages with matching placeholders', () => {
    const tokens = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join(',');
    for (const [key, row] of Object.entries(YEAR_TEXT)) {
      for (const lang of LANGS) {
        expect(row[lang], `${key}.${lang}`).toBeTruthy();
        expect(tokens(row[lang]), `${key}.${lang}`).toBe(tokens(row.en));
        if (lang !== 'en' && /[a-z]{3}/i.test(row.en.replace(/\{\w+\}/g, ''))) expect(row[lang], `${key}.${lang}`).not.toBe(row.en);
      }
    }
    for (const lang of LANGS) expect(MONTH_SHORT[lang]).toHaveLength(12);
  });
});
