import { describe, it, expect } from 'vitest';
import { buildPeriodStrategy, type WeightedWindow } from './periodStrategy';
import { assessPlanetStrength } from './dashaStrength';
import { judgeAntardasha } from './antardashaJudgement';
import { computeAshtakavarga } from './ashtakavarga';
import { VimshottariDasha } from './dasha';
import { assessWeight } from './dashaWeight';

// Reference chart: 16 Sept 1986, 13:22, Kandy — Sagittarius lagna, Dhanishta
// Moon (Mars birth dasha). Longitudes from Swiss Ephemeris, Lahiri sidereal.
const LON: Record<string, number> = {
  Sun: 149.4896, Moon: 305.4194, Mercury: 158.4523, Venus: 193.6239,
  Mars: 265.4211, Jupiter: 323.472, Saturn: 220.6675,
  Rahu: 357.4126, Ketu: 177.4126,
};
const ASC_RASHI = 8;
const BIRTH = new Date(Date.UTC(1986, 8, 16, 7, 52));

const rashiOf = (l: number) => Math.floor(l / 30);
const CHART = {
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

/** One antardasha of the Saturn mahadasha, weighted without transit input. */
function saturnAntardasha(adLord: string) {
  const calc = new VimshottariDasha(LON.Moon, BIRTH);
  const mds = calc.generateMahadashaTimeline();
  const saturnMd = mds.find(m => m.lord === 'Saturn')!;
  const ads = calc.calculateAntardasha(saturnMd);
  const ketuIdx = ads.findIndex(a => a.lord === adLord);
  const pds = calc.calculatePratyantardasha(ads[ketuIdx]);

  const periods: WeightedWindow[] = pds.map(pd => {
    const a = assessWeight({
      mahadashaLord: 'Saturn',
      antardashaLord: adLord,
      pratyantarLord: pd.lord,
      start: pd.start,
      end: pd.end,
      subLordStrength: strengthOf(pd.lord),
      transitHits: [],
      hotTargets: new Set(['Saturn', adLord, 'Sun', 'Moon', 'Lagna']),
    });
    return { lord: pd.lord, start: pd.start, end: pd.end, days: pd.days, weight: a.weight, band: a.band, tone: a.tone };
  });

  const next = ads[ketuIdx + 1];
  return buildPeriodStrategy({
    mahadashaLord: 'Saturn',
    antardashaLord: adLord,
    periods,
    judgement: judgeAntardasha({ mahadashaLord: 'Saturn', antardashaLord: adLord, ctx: CHART, strengthOf }),
    strengthOf,
    nextAntardasha: next ? { lord: next.lord, start: next.start, end: next.end } : null,
  });
}

describe('buildPeriodStrategy — Saturn–Ketu on the reference chart', () => {
  const strategy = saturnAntardasha('Ketu');

  it('does not blanket-condemn a separative pair when disposition redeems it', () => {
    // Ketu is in the 11th from Saturn — the most productive disposition — which
    // offsets the harsh Saturn–Ketu pair reading. Judging on separativeness
    // alone used to force 'consolidate' on all nine Saturn antardashas.
    expect(strategy.stance).toBe('mixed');
    expect(strategy.judgement.houseFromLord).toBe(11);
    expect(strategy.stanceBody).toContain('11th from Saturn');
  });

  it('names the doubled, nodal and closing windows as the peaks', () => {
    const peaks = strategy.peaks;
    expect(peaks).toContain('Saturn–Ketu–Ketu');
    expect(peaks).toContain('Saturn–Ketu–Rahu');
    expect(peaks).toContain('Saturn–Ketu–Saturn');
  });

  it('picks the Sun window for decisive action and explains why from the chart', () => {
    const sun = strategy.actionWindows.find(w => w.lord === 'Sun');
    expect(sun).toBeDefined();
    expect(sun!.reason).toContain('own sign');
    expect(sun!.reason).toContain('9th house');
  });

  it('omits dusthana lordship from the case for acting', () => {
    for (const w of strategy.actionWindows) {
      expect(w.reason).not.toContain('12th house');
      expect(w.reason).not.toContain('8th house');
    }
  });

  it('routes the heavy separative windows into defensive framing', () => {
    const lords = strategy.defensiveWindows.map(w => w.lord);
    expect(lords).toContain('Ketu');
    expect(lords).toContain('Saturn');
    expect(strategy.defensiveWindows[0].reason).toContain('What you stop losing');
  });

  it('points at the next antardasha by its house lordship', () => {
    expect(strategy.nextHarvest?.lord).toBe('Venus');
    expect(strategy.nextHarvest?.note).toContain('11th house');
  });

  it('keeps every window ordered by date within its list', () => {
    for (const list of [strategy.actionWindows, strategy.defensiveWindows, strategy.buildWindows]) {
      const dates = list.map(w => w.start);
      expect([...dates].sort()).toEqual(dates);
    }
  });
});

describe('buildPeriodStrategy — stance varies inside one mahadasha', () => {
  // The whole point of the judgement layer: a nineteen-year Saturn mahadasha
  // must not read the same for all nine of its antardashas.
  it('reads Saturn–Mercury as an acquisition period', () => {
    const s = saturnAntardasha('Mercury');
    expect(s.stance).toBe('accumulate');
    expect(s.judgement.houseFromLord).toBe(11);
    expect(s.stanceHeadline).toContain('Acquisition is supported');
    expect(s.oneLine).toContain('converts effort into result');
  });

  it('reads Saturn–Saturn as consolidation', () => {
    const s = saturnAntardasha('Saturn');
    expect(s.stance).toBe('consolidate');
    expect(s.stanceHeadline).toBe('Consolidation, not accumulation');
  });

  it('produces more than one stance across the mahadasha', () => {
    const stances = new Set(
      ['Saturn', 'Mercury', 'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter']
        .map(l => saturnAntardasha(l).stance),
    );
    expect(stances.size).toBeGreaterThan(1);
  });
});
