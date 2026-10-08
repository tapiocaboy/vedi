/**
 * The "astrology behind this" layer: score parts that add up, classical
 * indicators that fire on the textbook conditions, and reading text that exists
 * in all nine languages with the same placeholders as the English.
 *
 * Fixture: the reference chart of predictions.test.ts (1992-12-14 03:58 Colombo,
 * Libra ascendant, Moon and retrograde Mars in Cancer — the 10th house).
 */
import { describe, it, expect } from 'vitest';
import { buildChartContext } from '../services/predictionService';
import { DashaPredictionEngine } from './predictions';
import type { PlanetPosition } from './ephemeris';
import { activeIndicators, connectedTo, charaKarakas, transitSignsFrom, INDICATORS } from './classicalIndicators';
import { buildAreaReading, plainAreaLine, SHOW_EVIDENCE } from './areaReading';
import { plainPeriodHeader, plainSubPeriodLine } from './plainSummary';
import { INDICATOR_EVIDENCE, SCORE_EVIDENCE } from './evidenceTable';
import * as RT from './text/readingText';
import { INDICATOR_TEXT } from './text/indicatorText';
import type { Lang } from './i18n';

const SIDEREAL: Record<string, [number, boolean]> = {
  SUN: [238.422, false], MOON: [110.406, false], MERCURY: [218.161, false], VENUS: [282.304, false],
  MARS: [92.302, true], JUPITER: [167.783, false], SATURN: [290.831, false], RAHU: [237.738, true],
  KETU: [57.738, true], ASCENDANT: [206.251, false],
};
const pos = (lon: number, r: boolean): PlanetPosition => ({
  longitude: lon, latitude: 0, distance: 1, speed: r ? -1 : 1, rashi: Math.floor(lon / 30), rashiDegree: lon % 30,
  nakshatra: Math.floor(lon / (360 / 27)), nakshatraPada: Math.floor((lon % (360 / 27)) / (360 / 108)) + 1, isRetrograde: r,
});
const positions = Object.fromEntries(Object.entries(SIDEREAL).map(([k, [l, r]]) => [k, pos(l, r)])) as Record<string, PlanetPosition>;
const ctx = () => buildChartContext(positions);
const LANGS: Lang[] = ['en', 'si', 'ta', 'zh', 'hi', 'ja', 'ko', 'ar', 'ml'];

describe('score explanation', () => {
  const chains = [['Venus', 'Saturn', 'Mercury', 'Ketu'], ['Saturn', 'Mars', 'Rahu'], ['Jupiter', 'Venus'], ['Moon']];
  for (const chain of chains) {
    it(`parts add up to the area score (${chain.join('–')})`, () => {
      const p = new DashaPredictionEngine().generateCompletePrediction(chain[0], chain[1], chain[2], chain[3], ctx(), 'en');
      for (const area of ['career', 'wealth', 'relationships', 'health', 'general'] as const) {
        const r = p.predictions[area];
        const ex = r.explanation!;
        expect(ex).toBeDefined();
        const sum = ex.neutral + ex.parts.reduce((s, x) => s + x.points, 0);
        // Equal unless the 1–10 clamp bit.
        if (r.score > 1 && r.score < 10) expect(sum).toBeCloseTo(r.score, 6);
        expect(ex.percentile).toBeGreaterThanOrEqual(0);
        expect(ex.percentile).toBeLessThanOrEqual(100);
      }
    });
  }

  it('names every running lord once per area, top level first', () => {
    const p = new DashaPredictionEngine().generateCompletePrediction('Venus', 'Saturn', 'Mercury', undefined, ctx(), 'en');
    const dasha = p.predictions.career.explanation!.parts.filter(x => x.kind === 'dasha');
    expect(dasha.map(d => [d.planet, d.level])).toEqual([['Venus', 0], ['Saturn', 1], ['Mercury', 2]]);
    expect(dasha[0].lord?.lordedHouses).toEqual([1, 8]);           // Venus rules Libra and Taurus
  });
});

describe('classical indicators', () => {
  it('connection: occupying, ruling and aspecting the 10th all count', () => {
    const r = ctx().planetRashis!;
    expect(connectedTo(r, 'Mars', [10], 6)).toBe(true);    // Mars sits in Cancer, the 10th
    expect(connectedTo(r, 'Moon', [10], 6)).toBe(true);    // Moon rules (and sits in) the 10th
    expect(connectedTo(r, 'Venus', [10], 6)).toBe(true);   // Venus in Capricorn aspects Cancer
    expect(connectedTo(r, 'Mercury', [10], 6)).toBe(false);
  });

  it('chara karakas run from the highest degree-in-sign down', () => {
    expect(charaKarakas(ctx().planetLongitudes!)).toEqual({ AK: 'Sun', AmK: 'Saturn', BK: 'Moon', MK: 'Jupiter', PK: 'Venus', GK: 'Mercury', DK: 'Mars' });
  });

  it('Sade Sati phases follow Saturn around the natal Moon (Cancer)', () => {
    const at = (saturn: number) => activeIndicators(['Venus', 'Saturn'], ctx(), { Jupiter: 0, Saturn: saturn, Rahu: 0 }).map(a => a.def.key);
    expect(at(2)).toContain('sadeSatiRising');
    expect(at(3)).toContain('sadeSatiPeak');
    expect(at(4)).toContain('sadeSatiSetting');
    expect(at(10)).toContain('ashtamaShani');
    expect(at(9)).toContain('kantakaShani');
    expect(at(5)).toContain('saturnFromMoonGood');          // 3rd from the Moon
  });

  it('career: a Saturn period is a karaka period and Saturn is the Amatyakaraka', () => {
    const keys = activeIndicators(['Saturn', 'Mars'], ctx()).map(a => a.def.key);
    expect(keys).toEqual(expect.arrayContaining(['careerKarakaPeriod', 'careerAmatyakaraka', 'careerAdLinked']));
  });

  it('transit indicators need the sky; without it only dasha ones are listed', () => {
    const noSky = activeIndicators(['Venus', 'Saturn'], ctx());
    expect(noSky.every(a => !a.def.needsSky)).toBe(true);
    expect(transitSignsFrom([{ planet: 'JUPITER', rashi: 2 }, { planet: 'SATURN', rashi: 11 }, { planet: 'RAHU', rashi: 0 }]))
      .toEqual({ Jupiter: 2, Saturn: 11, Rahu: 0 });
    expect(transitSignsFrom([{ planet: 'JUPITER', rashi: 2 }])).toBeUndefined();
  });

  it('every indicator has a backtest record and text', () => {
    for (const d of INDICATORS) {
      expect(INDICATOR_EVIDENCE[d.evidence], d.evidence).toBeDefined();
      expect(INDICATOR_TEXT[d.key], d.key).toBeDefined();
    }
  });

  it('the engine attaches indicators when a sky is given', () => {
    const c = ctx();
    c.transitSigns = { Jupiter: 9, Saturn: 3, Rahu: 0 };
    const p = new DashaPredictionEngine().generateCompletePrediction('Venus', 'Saturn', undefined, undefined, c, 'en');
    expect(p.indicators?.map(i => i.key)).toContain('sadeSatiPeak');
  });
});

describe('reading builder', () => {
  const p = (() => {
    const c = ctx();
    c.transitSigns = { Jupiter: 9, Saturn: 3, Rahu: 0 };
    return new DashaPredictionEngine().generateCompletePrediction('Venus', 'Saturn', 'Mercury', undefined, c, 'en');
  })();

  for (const lang of LANGS) {
    it(`builds every area in ${lang}`, () => {
      for (const area of ['career', 'wealth', 'relationships', 'health', 'general'] as const) {
        const r = p.predictions[area];
        const rd = buildAreaReading({ area, lang, score: r.score, trend: r.trend, explanation: r.explanation, details: r.details, indicators: p.indicators, hasSky: true, mahadasha: 'Venus', showEvidence: true })!;
        expect(rd.rows.length).toBeGreaterThan(0);
        const text = [rd.why ?? '', rd.scoreLine, ...rd.rows.map(x => x.label + (x.detail ?? '')), ...rd.indicators.map(i => i.text + (i.evidence ?? '')), rd.scoreEvidence ?? '', rd.footnote ?? ''].join(' ');
        expect(text).not.toMatch(/\{\w+\}/);                   // every placeholder filled
        if (area !== 'general') expect(rd.plainLine).toBeTruthy();
      }
    });
  }

  it('the "why" sentence names the largest part', () => {
    const r = p.predictions.career;
    const top = [...r.explanation!.parts].sort((a, b) => Math.abs(b.points) - Math.abs(a.points))[0];
    const rd = buildAreaReading({ area: 'career', lang: 'en', score: r.score, trend: r.trend, explanation: r.explanation, hasSky: true })!;
    if (Math.abs(top.points) >= 0.15 && top.planet) expect(rd.why).toContain(top.planet);
    if (Math.abs(top.points) < 0.15) expect(rd.why).toBeNull();
  });

  it('calls a difference clear only at |z| >= 3, and reports the health score the wrong way round', () => {
    const r = p.predictions.health;
    const rd = buildAreaReading({ area: 'health', lang: 'en', score: r.score, trend: r.trend, explanation: r.explanation, indicators: p.indicators, hasSky: true, showEvidence: true })!;
    for (const ind of rd.indicators) {
      const def = INDICATORS.find(d => d.key === ind.key)!;
      const z = INDICATOR_EVIDENCE[def.evidence].z;
      expect(ind.verdict).toBe(Math.abs(z) >= 3 ? (z > 0 ? 'more' : 'less') : 'none');
    }
    const e = SCORE_EVIDENCE.health;
    expect(rd.scoreEvidence).toContain(e.lo > 0.5 ? 'wrong way round' : 'chance');
  });

  it('hides every evidence line by default', () => {
    expect(SHOW_EVIDENCE).toBe(false);
    for (const area of ['career', 'wealth', 'relationships', 'health', 'general'] as const) {
      const r = p.predictions[area];
      const rd = buildAreaReading({ area, lang: 'en', score: r.score, trend: r.trend, explanation: r.explanation, indicators: p.indicators, hasSky: true })!;
      expect(rd.scoreEvidence).toBeNull();
      expect(rd.footnote).toBeNull();
      expect(rd.indicators.every(i => i.evidence === null && i.verdict === null)).toBe(true);
    }
  });

  it('plain area lines drop their "Career:" lead-in in every language', () => {
    for (const lang of LANGS) {
      for (const area of ['career', 'wealth', 'relationships', 'health'] as const) {
        expect(plainAreaLine(area, 'positive', lang)).not.toMatch(/^[^:：]{1,24}[:：]/);
      }
    }
  });
});

describe('reading text', () => {
  const tokens = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join(',');
  const tables: [string, Record<string, Record<Lang, string>>][] = [
    ['READING_LABELS', RT.READING_LABELS], ['PART_LABEL', RT.PART_LABEL], ['LORD_BITS', RT.LORD_BITS], ['WHY', RT.WHY],
    ['EVENT_NAME', RT.EVENT_NAME], ['VERDICT', RT.VERDICT], ['AREA_NAME', RT.AREA_NAME], ['INDICATOR_TEXT', INDICATOR_TEXT],
    ['singles', { SCORE_LINE: RT.SCORE_LINE, INDICATOR_EVIDENCE_LINE: RT.INDICATOR_EVIDENCE_LINE, SCORE_EVIDENCE_LINE: RT.SCORE_EVIDENCE_LINE, EVIDENCE_FOOTNOTE: RT.EVIDENCE_FOOTNOTE }],
    ['LEVEL_NAME', Object.fromEntries(RT.LEVEL_NAME.map((l, i) => [i, l]))],
    ['GENERAL_LINE', RT.GENERAL_LINE], ['WINDOW_PLAIN', RT.WINDOW_PLAIN], ['PLAYBOOK_TEXT', RT.PLAYBOOK_TEXT],
    ['plain singles', { PERIOD_LINE: RT.PERIOD_LINE, SUBPERIOD_LINE: RT.SUBPERIOD_LINE, SUBPERIODS_INTRO: RT.SUBPERIODS_INTRO }],
    ['WEEKDAY', Object.fromEntries(RT.WEEKDAY.map((l, i) => [i, l]))],
  ];
  for (const [name, table] of tables) {
    it(`${name}: all nine languages, no English fallback, same placeholders`, () => {
      for (const [key, row] of Object.entries(table)) {
        for (const lang of LANGS) {
          expect(row[lang], `${name}.${key}.${lang}`).toBeTruthy();
          expect(tokens(row[lang]), `${name}.${key}.${lang}`).toBe(tokens(row.en));
          // Pure placeholder rows ("{planet} · {level}") are the same everywhere by design.
          if (lang !== 'en' && /[a-z]{3}/i.test(row.en.replace(/\{\w+\}/g, ''))) {
            expect(row[lang], `${name}.${key}.${lang}`).not.toBe(row.en);
          }
        }
      }
    });
  }
});

describe('reading notes', () => {
  it('does not repeat a note already shown under a score part', () => {
    const c = buildChartContext(positions);
    const p = new DashaPredictionEngine().generateCompletePrediction('Saturn', 'Mercury', 'Sun', 'Rahu', c, 'en');
    const r = p.predictions.career;
    const rd = buildAreaReading({ area: 'career', lang: 'en', score: r.score, trend: r.trend, explanation: r.explanation, details: r.details, hasSky: false })!;
    const partNotes = rd.rows.flatMap(x => x.notes);
    for (const n of rd.notes) expect(partNotes.some(pn => n.includes(pn))).toBe(false);
  });
});

describe('overall rating explanation', () => {
  it('weighted areas, pairing and transits add up to the overall score', () => {
    const c = buildChartContext(positions);
    c.transitScoreMod = -0.4;
    c.transitNotes = ['Sade Sati peak'];
    const p = new DashaPredictionEngine().generateCompletePrediction('Venus', 'Saturn', 'Mercury', undefined, c, 'en');
    const ex = p.overallExplanation!;
    const sum = ex.neutral + ex.parts.reduce((s, x) => s + x.points, 0);
    if (p.overallScore > 1 && p.overallScore < 10) expect(sum).toBeCloseTo(p.overallScore, 6);
    expect(ex.percentile).toBe(p.overallPercentile);
    expect(ex.parts.find(x => x.kind === 'transit')?.points).toBeCloseTo(-0.4, 6);
    const rd = buildAreaReading({ area: 'general', lang: 'en', score: p.overallScore, trend: 'neutral', explanation: ex, hasSky: true, overall: true, showEvidence: true })!;
    expect(rd.rows.map(r => r.label)).toContain('Today’s transits (Saturn, Jupiter and the nodes as they stand now)');
    expect(rd.scoreEvidence).toContain('1300');
  });
});

describe('plain period headers', () => {
  it('a sub-period header names both lords and the sub-period theme, with no jargon', () => {
    for (const lang of LANGS) {
      const h = plainPeriodHeader({ lang, mahadasha: 'Saturn', antardasha: 'Mercury', overallRating: 7, overallPercentile: 64 });
      expect(h.band).toBe('good');
      expect(h.line).not.toMatch(/\{\w+\}/);
      expect(h.standing).toBeTruthy();
    }
    const en = plainPeriodHeader({ lang: 'en', mahadasha: 'Saturn', antardasha: 'Mercury', overallRating: 2 });
    expect(en.headline).toBe('A testing stretch — go slowly');
    expect(en.line).toMatch(/^The Mercury sub-period of your Saturn main period — /);
    expect(en.line).not.toMatch(/house|bindu|Ashtakavarga|Budha|Shani/i);
    expect(en.standing).toBeNull();
  });

  it('sub-sub-period lines and the general area line are plain', () => {
    expect(plainSubPeriodLine('Ketu', 'en')).toMatch(/^Ketu sets the tone — /);
    for (const lang of LANGS) {
      expect(plainSubPeriodLine('Venus', lang)).not.toMatch(/\{\w+\}/);
      for (const trend of ['positive', 'neutral', 'mixed', 'negative']) expect(plainAreaLine('general', trend, lang)).toBeTruthy();
    }
  });
});
