import { describe, it, expect } from 'vitest';
import {
  analyzeHousePairs,
  angularSeparation,
  antardashaWindow,
  blendIntensity,
  isApplying,
  orbBandFor,
  pairRelation,
} from './conjunctions';
import { DASHA_YEARS, DAYS_PER_YEAR, TOTAL_DASHA_YEARS } from './dasha';
import type { CurrentDasha, DashaPeriod, PlanetPosition } from '../../types/astrology';

// rashi indices: 0=Aries 1=Taurus 2=Gemini 3=Cancer 4=Leo 5=Virgo
//                6=Libra 7=Scorpio 8=Sagittarius 9=Capricorn 10=Aquarius 11=Pisces

function planet(
  name: string,
  rashiIndex: number,
  rashiDegree: number,
  extra: Partial<PlanetPosition> = {},
): PlanetPosition {
  return {
    planet: name,
    longitude: rashiIndex * 30 + rashiDegree,
    latitude: 0,
    rashi: '',
    rashiIndex,
    rashiDegree,
    nakshatra: '',
    nakshatraIndex: 0,
    nakshatraPada: 1,
    isRetrograde: false,
    speed: 1,
    ...extra,
  };
}

describe('angle between two planets', () => {
  it('measures the short way round the zodiac', () => {
    expect(angularSeparation(10, 4)).toBeCloseTo(6, 6);
    expect(angularSeparation(359, 1)).toBeCloseTo(2, 6);
    expect(angularSeparation(0, 200)).toBeCloseTo(160, 6);
  });

  it('is symmetric', () => {
    expect(angularSeparation(123.4, 200.1)).toBeCloseTo(angularSeparation(200.1, 123.4), 6);
  });
});

describe('applying vs separating', () => {
  it('is applying when the faster planet is still catching up from behind', () => {
    // Mercury at 10° moving 1.4°/day, Sun ahead at 14° moving 1°/day — closing.
    const merc = { longitude: 10, speed: 1.4 };
    const sun = { longitude: 14, speed: 1.0 };
    expect(isApplying(merc, sun)).toBe(true);
  });

  it('is separating once the faster planet has passed', () => {
    const merc = { longitude: 16, speed: 1.4 };
    const sun = { longitude: 14, speed: 1.0 };
    expect(isApplying(merc, sun)).toBe(false);
  });
});

describe('orb bands', () => {
  it('calls a sub-degree pair of star-planets a planetary war', () => {
    expect(orbBandFor(0.4, 'Mars', 'Saturn')).toBe('yuddha');
  });

  it('never puts the luminaries or nodes into a war', () => {
    expect(orbBandFor(0.4, 'Sun', 'Mercury')).toBe('exact');
    expect(orbBandFor(0.2, 'Rahu', 'Venus')).toBe('exact');
  });

  it('widens through exact → close → moderate → wide', () => {
    expect(orbBandFor(2, 'Venus', 'Jupiter')).toBe('exact');
    expect(orbBandFor(7, 'Venus', 'Jupiter')).toBe('close');
    expect(orbBandFor(12, 'Venus', 'Jupiter')).toBe('moderate');
    expect(orbBandFor(24, 'Venus', 'Jupiter')).toBe('wide');
  });
});

describe('blend intensity', () => {
  it('peaks at an exact conjunction and falls off with distance', () => {
    expect(blendIntensity(0)).toBe(100);
    expect(blendIntensity(15)).toBeLessThan(blendIntensity(5));
    expect(blendIntensity(29)).toBeLessThan(blendIntensity(15));
  });

  it('never drops to nothing — a same-sign pair still counts', () => {
    expect(blendIntensity(29.9)).toBeGreaterThanOrEqual(8);
  });
});

describe('natural friendship between the pair', () => {
  it('reads mutual friends as friends', () => {
    expect(pairRelation('Sun', 'Jupiter')).toBe('friend');
  });

  it('reads mutual enemies as enemies', () => {
    expect(pairRelation('Sun', 'Saturn')).toBe('enemy');
    expect(pairRelation('Moon', 'Rahu')).toBe('enemy');
  });

  it('flags a one-sided friendship as mixed', () => {
    // Mercury counts the Moon an enemy while the Moon counts Mercury a friend.
    expect(pairRelation('Mercury', 'Moon')).toBe('mixed');
  });
});

describe('antardasha windows', () => {
  const saturnMaha: DashaPeriod = {
    lord: 'Saturn',
    start: '2000-01-01T00:00:00.000Z',
    end: '2019-01-01T00:00:00.000Z',
    durationYears: 19,
    durationDays: 19 * DAYS_PER_YEAR,
    isBirthDasha: false,
  };

  it('opens with the mahadasha lord’s own sub-period', () => {
    const own = antardashaWindow(saturnMaha, 'Saturn');
    expect(own).not.toBeNull();
    expect(own!.start.toISOString()).toBe(saturnMaha.start);
    const expectedDays = (19 * DASHA_YEARS.Saturn * DAYS_PER_YEAR) / TOTAL_DASHA_YEARS;
    const actualDays = (own!.end.getTime() - own!.start.getTime()) / 86_400_000;
    expect(actualDays).toBeCloseTo(expectedDays, 3);
  });

  it('follows the Vimshottari order for later sub-periods', () => {
    // After Saturn comes Mercury in the sequence.
    const merc = antardashaWindow(saturnMaha, 'Mercury');
    const own = antardashaWindow(saturnMaha, 'Saturn');
    expect(merc!.start.getTime()).toBe(own!.end.getTime());
    const expectedDays = (19 * DASHA_YEARS.Mercury * DAYS_PER_YEAR) / TOTAL_DASHA_YEARS;
    expect((merc!.end.getTime() - merc!.start.getTime()) / 86_400_000).toBeCloseTo(expectedDays, 3);
  });

  it('reconstructs sub-periods of the birth dasha from its full length, not the balance', () => {
    // Only 4 of Saturn's 19 years remain at birth, so its own sub-period is
    // already over — the window must be reported as missing rather than
    // squeezed into the remaining four years.
    const birthDasha: DashaPeriod = {
      lord: 'Saturn',
      start: '1990-01-01T00:00:00.000Z',
      end: '1994-01-01T00:00:00.000Z',
      durationYears: 4,
      durationDays: 4 * DAYS_PER_YEAR,
      isBirthDasha: true,
    };
    expect(antardashaWindow(birthDasha, 'Saturn')).toBeNull();
    expect(antardashaWindow(birthDasha, 'Venus')).toBeNull();

    // Rahu's sub-period straddles the birth date, so it is clipped to it.
    const rahu = antardashaWindow(birthDasha, 'Rahu');
    expect(rahu).not.toBeNull();
    expect(rahu!.start.toISOString()).toBe(birthDasha.start);

    // Jupiter's falls entirely after birth and runs to the end of the mahadasha.
    const jupiter = antardashaWindow(birthDasha, 'Jupiter');
    expect(jupiter).not.toBeNull();
    expect(jupiter!.start.getTime()).toBeGreaterThan(new Date(birthDasha.start).getTime());
    expect(jupiter!.end.getTime()).toBeCloseTo(new Date(birthDasha.end).getTime(), -5);
  });
});

describe('analyzeHousePairs', () => {
  const asc = 0; // Aries ascendant → house 1 = Aries, house 5 = Leo

  it('returns nothing when a house holds fewer than two planets', () => {
    const res = analyzeHousePairs({
      houseNumber: 1,
      ascendantRashiIndex: asc,
      planets: [planet('MARS', 0, 10)],
    });
    expect(res.pairs).toEqual([]);
    expect(res.groupHeadline).toBeNull();
  });

  it('pairs every combination in the house and flags a stellium', () => {
    const res = analyzeHousePairs({
      houseNumber: 1,
      ascendantRashiIndex: asc,
      planets: [planet('MARS', 0, 10), planet('SUN', 0, 12), planet('MERCURY', 0, 14)],
    });
    expect(res.pairs).toHaveLength(3);
    expect(res.groupHeadline).toContain('3 planets');
  });

  it('ignores the Ascendant as an occupant', () => {
    const res = analyzeHousePairs({
      houseNumber: 1,
      ascendantRashiIndex: asc,
      planets: [planet('MARS', 0, 10), planet('ASCENDANT', 0, 4)],
    });
    expect(res.pairs).toEqual([]);
  });

  it('returns occupants ordered by position in the sign, with the gaps between them', () => {
    const res = analyzeHousePairs({
      houseNumber: 1,
      ascendantRashiIndex: asc,
      planets: [planet('SATURN', 0, 22), planet('MOON', 0, 3), planet('MARS', 0, 11)],
    });

    expect(res.occupants.map(o => o.planet)).toEqual(['MOON', 'MARS', 'SATURN']);
    expect(res.occupants.map(o => o.degreeInSign)).toEqual([3, 11, 22]);

    // one gap fewer than occupants, each between neighbours
    expect(res.gaps).toHaveLength(2);
    expect(res.gaps[0]).toMatchObject({ from: 'MOON', to: 'MARS' });
    expect(res.gaps[0].degrees).toBeCloseTo(8, 6);
    expect(res.gaps[1]).toMatchObject({ from: 'MARS', to: 'SATURN' });
    expect(res.gaps[1].degrees).toBeCloseTo(11, 6);
    expect(res.gaps.every(g => g.degrees > 0)).toBe(true);
  });

  it('still reports the single occupant of a house, with no gaps', () => {
    const res = analyzeHousePairs({
      houseNumber: 1,
      ascendantRashiIndex: asc,
      planets: [planet('MARS', 0, 10)],
    });
    expect(res.occupants).toHaveLength(1);
    expect(res.gaps).toEqual([]);
  });

  it('measures the real angle rather than assuming a same-sign pair is exact', () => {
    const res = analyzeHousePairs({
      houseNumber: 1,
      ascendantRashiIndex: asc,
      planets: [planet('JUPITER', 0, 2), planet('VENUS', 0, 27)],
    });
    const pair = res.pairs[0];
    expect(pair.separation).toBeCloseTo(25, 6);
    expect(pair.orbBand).toBe('wide');
    expect(pair.intensity).toBeLessThan(50);
  });

  it('orders the pair by position in the sign', () => {
    const res = analyzeHousePairs({
      houseNumber: 1,
      ascendantRashiIndex: asc,
      planets: [planet('SATURN', 0, 22), planet('MOON', 0, 3)],
    });
    expect(res.pairs[0].a).toBe('MOON');
    expect(res.pairs[0].b).toBe('SATURN');
  });

  it('detects combustion when the Sun burns its companion', () => {
    const res = analyzeHousePairs({
      houseNumber: 1,
      ascendantRashiIndex: asc,
      planets: [planet('SUN', 0, 10), planet('MERCURY', 0, 13)],
    });
    const pair = res.pairs[0];
    expect(pair.combustion).not.toBeNull();
    expect(pair.combustion!.planet).toBe('Mercury');
    expect(pair.combustion!.separation).toBeCloseTo(3, 6);
  });

  it('leaves a far-enough companion uncombust', () => {
    const res = analyzeHousePairs({
      houseNumber: 1,
      ascendantRashiIndex: asc,
      planets: [planet('SUN', 0, 2), planet('SATURN', 0, 25)],
    });
    expect(res.pairs[0].combustion).toBeNull();
  });

  it('awards a planetary war to the more northerly planet', () => {
    const res = analyzeHousePairs({
      houseNumber: 1,
      ascendantRashiIndex: asc,
      planets: [
        planet('MARS', 0, 10.0, { latitude: 1.2 }),
        planet('SATURN', 0, 10.6, { latitude: -0.4 }),
      ],
    });
    const pair = res.pairs[0];
    expect(pair.orbBand).toBe('yuddha');
    expect(pair.grahaYuddha).not.toBeNull();
    expect(pair.grahaYuddha!.winner).toBe('Mars');
    expect(pair.grahaYuddha!.loser).toBe('Saturn');
  });

  it('rates a benefic friendly pair above a malefic hostile one', () => {
    const friendly = analyzeHousePairs({
      houseNumber: 5,
      ascendantRashiIndex: asc,
      planets: [planet('JUPITER', 4, 10), planet('MOON', 4, 12)],
    }).pairs[0];

    const hostile = analyzeHousePairs({
      houseNumber: 5,
      ascendantRashiIndex: asc,
      planets: [planet('SATURN', 4, 10), planet('SUN', 4, 12)],
    }).pairs[0];

    expect(friendly.harmony).toBeGreaterThan(hostile.harmony);
    expect(friendly.power).toBeGreaterThan(hostile.power);
    expect(hostile.drag).toBeGreaterThan(friendly.drag);
  });

  it('names the classical combination when there is one', () => {
    const res = analyzeHousePairs({
      houseNumber: 1,
      ascendantRashiIndex: asc,
      planets: [planet('JUPITER', 0, 10), planet('MOON', 0, 12)],
    });
    expect(res.pairs[0].name).toContain('Gaja Kesari');
  });

  it('explains why every score moved', () => {
    const pair = analyzeHousePairs({
      houseNumber: 8,
      ascendantRashiIndex: asc,
      planets: [planet('SATURN', 7, 10), planet('MARS', 7, 11)],
    }).pairs[0];
    expect(pair.dragFactors.length).toBeGreaterThan(0);
    expect(pair.dragFactors.every(f => f.text.length > 0)).toBe(true);
  });
});

describe('timing', () => {
  const asc = 0;
  const planets = [planet('JUPITER', 4, 10), planet('MOON', 4, 12)];

  const dashaAt = (maha: string, antar: string): CurrentDasha => ({
    targetDate: '2026-01-01T00:00:00.000Z',
    mahadasha: {
      lord: maha, start: '2020-01-01T00:00:00.000Z', end: '2036-01-01T00:00:00.000Z',
      durationYears: 16, durationDays: 16 * DAYS_PER_YEAR, isBirthDasha: false,
    },
    antardasha: {
      lord: antar, start: '2025-01-01T00:00:00.000Z', end: '2027-01-01T00:00:00.000Z',
      durationDays: 730, mahadashaLord: maha,
    },
  });

  it('reports a peak when both planets run the main and sub period', () => {
    const pair = analyzeHousePairs({
      houseNumber: 5, ascendantRashiIndex: asc, planets,
      currentDasha: dashaAt('Jupiter', 'Moon'),
      now: new Date('2026-01-01T00:00:00.000Z'),
    }).pairs[0];
    expect(pair.now.level).toBe('peak');
    expect(pair.now.score).toBe(100);
  });

  it('reports partial activation when only one of the two is running', () => {
    const pair = analyzeHousePairs({
      houseNumber: 5, ascendantRashiIndex: asc, planets,
      currentDasha: dashaAt('Saturn', 'Moon'),
      now: new Date('2026-01-01T00:00:00.000Z'),
    }).pairs[0];
    expect(pair.now.level).toBe('high');
    expect(pair.now.score).toBeLessThan(100);
  });

  it('falls back to background when neither planet is in the running chain', () => {
    const pair = analyzeHousePairs({
      houseNumber: 5, ascendantRashiIndex: asc, planets,
      currentDasha: dashaAt('Saturn', 'Mercury'),
      now: new Date('2026-01-01T00:00:00.000Z'),
    }).pairs[0];
    expect(pair.now.level).toBe('background');
  });

  it('lists the lifetime windows where the pair runs together', () => {
    const timeline: DashaPeriod[] = [
      { lord: 'Jupiter', start: '2020-01-01T00:00:00.000Z', end: '2036-01-01T00:00:00.000Z', durationYears: 16, durationDays: 16 * DAYS_PER_YEAR, isBirthDasha: false },
      { lord: 'Saturn', start: '2036-01-01T00:00:00.000Z', end: '2055-01-01T00:00:00.000Z', durationYears: 19, durationDays: 19 * DAYS_PER_YEAR, isBirthDasha: false },
      { lord: 'Moon', start: '2074-01-01T00:00:00.000Z', end: '2084-01-01T00:00:00.000Z', durationYears: 10, durationDays: 10 * DAYS_PER_YEAR, isBirthDasha: false },
    ];
    const pair = analyzeHousePairs({
      houseNumber: 5, ascendantRashiIndex: asc, planets,
      mahadashaTimeline: timeline,
      now: new Date('2026-01-01T00:00:00.000Z'),
    }).pairs[0];

    const peaks = pair.lifetime.windows.filter(w => w.kind === 'peak');
    expect(peaks).toHaveLength(2);            // Jupiter/Moon and Moon/Jupiter
    expect(peaks.every(w => w.end > w.start)).toBe(true);
    expect(pair.lifetime.windows.some(w => w.state === 'current')).toBe(true);
  });

  it('states when the pair next switches fully on', () => {
    const timeline: DashaPeriod[] = [
      { lord: 'Saturn', start: '2020-01-01T00:00:00.000Z', end: '2039-01-01T00:00:00.000Z', durationYears: 19, durationDays: 19 * DAYS_PER_YEAR, isBirthDasha: false },
      { lord: 'Jupiter', start: '2039-01-01T00:00:00.000Z', end: '2055-01-01T00:00:00.000Z', durationYears: 16, durationDays: 16 * DAYS_PER_YEAR, isBirthDasha: false },
    ];
    const pair = analyzeHousePairs({
      houseNumber: 5, ascendantRashiIndex: asc, planets,
      currentDasha: dashaAt('Saturn', 'Mercury'),
      mahadashaTimeline: timeline,
      now: new Date('2026-01-01T00:00:00.000Z'),
    }).pairs[0];
    expect(pair.now.nextText).toBeTruthy();
    expect(pair.now.nextText).toContain('2');   // carries a date
  });
});
