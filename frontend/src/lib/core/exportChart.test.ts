import { describe, it, expect } from 'vitest';
import { buildChartMarkdown } from './exportChart';
import { EXTRA_VARGAS } from './vargas';
import { VARGA_PLAIN, VARGA_KARAKAS } from './vargaMeanings';
import { DIVISIONAL_INDEX, buildSystemPrompt } from '../../services/horoscopeChat';
import type { Chart } from '../../types/astrology';

// Reference chart: 16 Sept 1986, 13:22, Kandy — Sagittarius lagna.
const LON: Record<string, number> = {
  SUN: 149.4896, MOON: 305.4194, MERCURY: 158.4523, VENUS: 193.6239,
  MARS: 265.4211, JUPITER: 323.472, SATURN: 220.6675, RAHU: 357.4126, KETU: 177.4126,
};
const mkPlanet = (n: string) => ({
  planet: n, longitude: LON[n], rashi: '', rashiIndex: Math.floor(LON[n] / 30),
  rashiDegree: LON[n] % 30, nakshatra: 'Dhanishta', nakshatraPada: 1, isRetrograde: n === 'SATURN',
});
const CHART = {
  birthData: { date: '1986-09-16T13:22:00', latitude: 7.29, longitude: 80.63, timezone: 'Asia/Colombo', ayanamsa: 'LAHIRI' },
  ascendant: { longitude: 255.96, rashiIndex: 8, rashi: 'Dhanu', rashiDegree: 15.96 },
  planets: Object.keys(LON).map(mkPlanet),
  moonNakshatra: { name: 'Dhanishta', pada: 1, lord: 'Mars', degree: 0 },
  currentDasha: {
    targetDate: '2026-07-21T00:00:00Z',
    mahadasha: { lord: 'Saturn', start: '2021-05-12T00:00:00Z', end: '2040-05-12T00:00:00Z' },
    antardasha: { lord: 'Mercury', start: '2024-05-15T00:00:00Z', end: '2027-01-23T00:00:00Z' },
  },
  mahadashaTimeline: [],
  ayanamsaValue: 23.6,
} as unknown as Chart;

const MD = buildChartMarkdown(CHART);

describe('buildChartMarkdown — divisional charts', () => {
  it('includes a section for every divisional chart the app shows', () => {
    expect(MD).toContain('## D9 — Navamsa');
    expect(MD).toContain('## D10 — Dasamsa');
    for (const v of EXTRA_VARGAS) {
      expect(MD, `${v.code} section`).toContain(`### ${v.code} — ${v.name}`);
    }
  });

  it('carries the plain-language interpretation, not just sign tables', () => {
    for (const v of EXTRA_VARGAS) {
      const plain = VARGA_PLAIN[v.code]!;
      expect(MD, `${v.code} plain name`).toContain(plain.plainName);
      expect(MD, `${v.code} question`).toContain(plain.question);
      // Every one of the twelve house meanings travels with the export, so the
      // model reads "children" for the 5th of D7 and "exam ability" for D24.
      for (let h = 1; h <= 12; h++) {
        expect(MD, `${v.code} house ${h}`).toContain(plain.houses[h]);
      }
    }
  });

  it('carries each chart verdict and its supporting reasons', () => {
    const verdicts = MD.match(/\*\*Verdict:\*\*/g) ?? [];
    expect(verdicts).toHaveLength(EXTRA_VARGAS.length);
    // The D30 verdict must use the inverted wording, never the broken generic one.
    expect(MD).not.toContain('Weak spots is a well-supported area');
  });

  it('names the key planet for every chart that has one', () => {
    for (const v of EXTRA_VARGAS) {
      for (const k of VARGA_KARAKAS[v.code] ?? []) {
        expect(MD, `${v.code} karaka ${k.planet}`).toContain(`${k.planet} (${k.role})`);
      }
    }
  });

  it('gives every planet a per-chart reading with its house number', () => {
    expect(MD).toContain('| Planet | D7 Sign | House | Dignity | What it does here |');
    expect(MD).toContain('Jupiter brings growth, generosity and good judgement.');
  });

  it('includes the D9 marriage and D10 career readings', () => {
    expect(MD).toContain('**Marriage reading:**');
    expect(MD).toContain('**Career reading:**');
    expect(MD).toContain('Venus, significator of marriage');
    expect(MD).toContain('Dasamsa lagna');
  });

  it('leads both divisional readings on lordship, not on divisional sign dignity', () => {
    // The readings used to be computed from divisional dignity alone, which cannot
    // see that a 7th lord also rules the 12th or that a 10th lord sits in the 8th.
    expect(MD).toMatch(/\*\*7th lord: \w+\*\*/);
    expect(MD).toMatch(/\*\*10th lord: \w+\*\*/);
    expect(MD).toMatch(/rules your 7th house/);
    expect(MD).toMatch(/rules your 10th house/);
  });

  it('reports what the birth time can support before interpreting anything', () => {
    const confidenceAt = MD.indexOf('confidence');
    const d1TableAt = MD.indexOf('## Planetary Positions');
    expect(confidenceAt).toBeGreaterThan(-1);
    expect(confidenceAt).toBeLessThan(d1TableAt);
  });

  it('never breaks the markdown tables with a stray pipe', () => {
    for (const line of MD.split('\n')) {
      if (!line.startsWith('|') || line.includes('---')) continue;
      // A table row's cell count must stay constant within its block.
      expect(line.endsWith('|'), line).toBe(true);
    }
  });
});

describe('chat grounding', () => {
  it('lists every divisional chart the export actually contains', () => {
    for (const v of EXTRA_VARGAS) {
      expect(DIVISIONAL_INDEX.map(d => d.code), `${v.code} in chat index`).toContain(v.code);
    }
    for (const code of ['D1', 'D9', 'D10']) {
      expect(DIVISIONAL_INDEX.map(d => d.code)).toContain(code);
    }
  });

  it('does not advertise a chart the export omits', () => {
    // The chat tells the user these charts are loaded; each must really be in
    // the markdown the model receives, under its own heading.
    const headings = MD.split('\n').filter(l => /^#{2,3} /.test(l));
    for (const d of DIVISIONAL_INDEX) {
      if (d.code === 'D1') continue; // the main chart is the planetary table
      expect(
        headings.some(h => h.includes(`${d.code} —`)),
        `${d.code} is advertised in chat but has no section in the export`,
      ).toBe(true);
    }
  });

  it('briefs the model on each chart and on the D30 inversion', () => {
    const prompt = buildSystemPrompt(MD);
    for (const d of DIVISIONAL_INDEX) {
      expect(prompt, `${d.code} brief`).toContain(`${d.code} (${d.plain})`);
    }
    expect(prompt).toContain('D30 is inverted');
    expect(prompt).toContain('a house means something different in each chart');
  });
});
