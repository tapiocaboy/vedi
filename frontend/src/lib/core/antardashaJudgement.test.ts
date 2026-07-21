import { describe, it, expect } from 'vitest';
import { judgeAntardasha } from './antardashaJudgement';
import { assessPlanetStrength } from './dashaStrength';
import { computeAshtakavarga } from './ashtakavarga';
import { VimshottariDasha } from './dasha';
import type { ChartContext } from './predictions';

// Reference chart: 16 Sept 1986, 13:22, Kandy — Sagittarius lagna.
const LON: Record<string, number> = {
  Sun: 149.4896, Moon: 305.4194, Mercury: 158.4523, Venus: 193.6239,
  Mars: 265.4211, Jupiter: 323.472, Saturn: 220.6675,
  Rahu: 357.4126, Ketu: 177.4126,
};
const ASC_RASHI = 8;
const rashiOf = (l: number) => Math.floor(l / 30);

const CHART: ChartContext = {
  ashtakavarga: computeAshtakavarga({
    Lagna: ASC_RASHI, Sun: rashiOf(LON.Sun), Moon: rashiOf(LON.Moon), Mars: rashiOf(LON.Mars),
    Mercury: rashiOf(LON.Mercury), Jupiter: rashiOf(LON.Jupiter), Venus: rashiOf(LON.Venus),
    Saturn: rashiOf(LON.Saturn),
  }),
  planetRashis: Object.fromEntries(Object.entries(LON).map(([k, v]) => [k, rashiOf(v)])),
  planetHouses: Object.fromEntries(
    Object.entries(LON).map(([k, v]) => [k, ((rashiOf(v) - ASC_RASHI + 12) % 12) + 1]),
  ),
  planetLongitudes: LON,
  planetRetro: {},
  ascendantRashi: ASC_RASHI,
  moonRashi: rashiOf(LON.Moon),
};

const strengthOf = (p: string) => assessPlanetStrength(p, CHART);
const judge = (md: string, ad: string) =>
  judgeAntardasha({ mahadashaLord: md, antardashaLord: ad, ctx: CHART, strengthOf });

describe('judgeAntardasha — mutual disposition', () => {
  it('counts the antardasha lord from the mahadasha lord, not from the lagna', () => {
    // Ketu 177.41° (Kanya, 5) from Saturn 220.67° (Vrischika, 7) → 11th.
    expect(judge('Saturn', 'Ketu').houseFromLord).toBe(11);
    // ...and the reverse pairing is the 3rd.
    expect(judge('Ketu', 'Saturn').houseFromLord).toBe(3);
  });

  it('ranks an 11th-from-lord antardasha above a 12th-from-lord one', () => {
    const eleventh = judge('Saturn', 'Mercury');   // Mercury is 11th from Saturn
    const twelfth = judge('Saturn', 'Venus');      // Venus is 12th from Saturn
    expect(eleventh.houseFromLord).toBe(11);
    expect(twelfth.houseFromLord).toBe(12);
    expect(eleventh.score).toBeGreaterThan(twelfth.score);
  });

  it('flags the 6-8 axis between the two lords as shashtashtaka', () => {
    const s = judge('Mercury', 'Jupiter'); // Jupiter is 6th from Mercury
    expect(s.houseFromLord).toBe(6);
    expect(s.shashtashtaka).toBe(true);
    expect(s.factors[0].detail).toContain('6-8 axis');
  });

  it('does not flag shashtashtaka for supportive dispositions', () => {
    expect(judge('Saturn', 'Mercury').shashtashtaka).toBe(false);
  });

  it('treats a lord in its own sign as a merge rather than a variation', () => {
    const same = judge('Saturn', 'Saturn');
    expect(same.houseFromLord).toBe(1);
    expect(same.relationship).toBe('same');
  });
});

describe('judgeAntardasha — scoring', () => {
  it('stays inside 1–10', () => {
    const lords = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
    for (const md of lords) {
      for (const ad of lords) {
        const s = judge(md, ad).score;
        expect(s).toBeGreaterThanOrEqual(1);
        expect(s).toBeLessThanOrEqual(10);
      }
    }
  });

  it('distinguishes the nine antardashas inside a single mahadasha', () => {
    const calc = new VimshottariDasha(LON.Moon, new Date(Date.UTC(1986, 8, 16, 7, 52)));
    const saturnMd = calc.generateMahadashaTimeline().find(m => m.lord === 'Saturn')!;
    const scores = calc.calculateAntardasha(saturnMd).map(ad => judge('Saturn', ad.lord).score);

    // The bug this replaces gave all nine the same rating.
    expect(new Set(scores).size).toBeGreaterThanOrEqual(7);
    expect(Math.max(...scores) - Math.min(...scores)).toBeGreaterThan(3);
  });

  it('does not read every antardasha of a separative mahadasha as bad', () => {
    const calc = new VimshottariDasha(LON.Moon, new Date(Date.UTC(1986, 8, 16, 7, 52)));
    const saturnMd = calc.generateMahadashaTimeline().find(m => m.lord === 'Saturn')!;
    const verdicts = calc.calculateAntardasha(saturnMd).map(ad => judge('Saturn', ad.lord).verdict);
    expect(verdicts.some(v => v === 'excellent' || v === 'good')).toBe(true);
  });

  it('rates a doubled malefic lord as the hardest sub-period of its mahadasha', () => {
    const calc = new VimshottariDasha(LON.Moon, new Date(Date.UTC(1986, 8, 16, 7, 52)));
    const saturnMd = calc.generateMahadashaTimeline().find(m => m.lord === 'Saturn')!;
    const ranked = calc.calculateAntardasha(saturnMd)
      .map(ad => ({ lord: ad.lord, score: judge('Saturn', ad.lord).score }))
      .sort((a, b) => a.score - b.score);
    expect(ranked[0].lord).toBe('Saturn');
  });
});

describe('judgeAntardasha — explanation', () => {
  it('leads with the factor that moved the score most', () => {
    const j = judge('Saturn', 'Ketu');
    const top = [...j.factors].sort((a, b) => Math.abs(b.points) - Math.abs(a.points))[0];
    expect(j.headline).toBe(top.detail);
  });

  it('names both signs so the reasoning can be checked against the chart', () => {
    const j = judge('Saturn', 'Ketu');
    expect(j.headline).toContain('Kanya');     // Ketu's sign
    expect(j.headline).toContain('Vrischika'); // Saturn's sign
  });

  it('reports friendship between the lords', () => {
    expect(judge('Sun', 'Jupiter').relationship).toBe('friend');
    expect(judge('Sun', 'Saturn').relationship).toBe('enemy');
    expect(judge('Sun', 'Mercury').relationship).toBe('neutral');
  });

  it('degrades to a bare reading when no chart is available', () => {
    const j = judgeAntardasha({
      mahadashaLord: 'Saturn',
      antardashaLord: 'Ketu',
      ctx: { ashtakavarga: CHART.ashtakavarga },
      strengthOf: () => null,
    });
    expect(j.houseFromLord).toBeNull();
    expect(j.score).toBeGreaterThanOrEqual(1);
  });
});
