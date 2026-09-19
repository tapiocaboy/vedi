/**
 * Career / wealth layer.
 *
 * The first block uses the Libra-ascendant reference chart (1992-12-14 03:58,
 * Colombo) that the rest of the engine's regression tests are built on, so the
 * expectations below can be checked by hand against the same longitudes.
 */

import { describe, it, expect } from 'vitest';
import {
  induLagna, amatyakaraka, careerSignature, wealthSignature,
  assessCareerActivation, assessWealthActivation,
} from './careerWealth';
import type { StrengthInput } from './dashaStrength';
import { buildChartContext } from '../services/predictionService';
import { DashaPredictionEngine } from './predictions';
import type { PlanetPosition } from './ephemeris';

// ─── Reference chart ───────────────────────────────────────────────────────

const SIDEREAL: Record<string, [number, boolean]> = {
  SUN:       [238.422, false],
  MOON:      [110.406, false],
  MERCURY:   [218.161, false],
  VENUS:     [282.304, false],
  MARS:      [92.302,  true],
  JUPITER:   [167.783, false],
  SATURN:    [290.831, false],
  RAHU:      [237.738, true],
  KETU:      [57.738,  true],
  ASCENDANT: [206.251, false],
};

function position(lon: number, retrograde: boolean): PlanetPosition {
  return {
    longitude: lon, latitude: 0, distance: 1, speed: retrograde ? -1 : 1,
    rashi: Math.floor(lon / 30), rashiDegree: lon % 30,
    nakshatra: Math.floor(lon / (360 / 27)),
    nakshatraPada: Math.floor((lon % (360 / 27)) / (360 / 108)) + 1,
    isRetrograde: retrograde,
  };
}

const positions = Object.fromEntries(
  Object.entries(SIDEREAL).map(([k, [lon, r]]) => [k, position(lon, r)]),
) as Record<string, PlanetPosition>;

const REF = buildChartContext(positions);

describe('reference chart — Indu Lagna', () => {
  it('lands in Sagittarius, ruled by Jupiter, with no occupants', () => {
    // 9th from Libra = Gemini → Mercury (8 kalas); 9th from the Cancer Moon =
    // Pisces → Jupiter (10 kalas). 18 mod 12 = 6; the 6th from Cancer is Sagittarius.
    const indu = induLagna(REF)!;
    expect(indu.rashi).toBe(8);
    expect(indu.lord).toBe('Jupiter');
    expect(indu.occupants).toEqual([]);
  });
});

describe('reference chart — Amatyakaraka', () => {
  it('is Saturn — second-highest degree after the Sun', () => {
    // Sun 28.4°, Saturn 20.8°, Moon 20.4°, Jupiter 17.8° …
    expect(amatyakaraka(REF.planetLongitudes)).toBe('Saturn');
  });
  it('returns null without longitudes', () => {
    expect(amatyakaraka(undefined)).toBeNull();
  });
});

describe('reference chart — career signature', () => {
  const sig = careerSignature(REF, 'en')!;

  it('reads the vocation from the occupied 10th (Moon and Mars in Cancer)', () => {
    expect(sig.planets).toEqual(['Moon', 'Mars']);
    expect(sig.notes[0]).toContain('your 10th house');
    expect(sig.notes[0]).toContain('Moon and Mars');
  });

  it('draws its fields from those planets, not from any dasha lord', () => {
    expect(sig.fields.length).toBeGreaterThan(0);
    expect(sig.fields.some(f => ['nursing', 'hospitality', 'engineering', 'military'].includes(f))).toBe(true);
  });

  it('names Saturn as the Amatyakaraka', () => {
    expect(sig.amatyakaraka).toBe('Saturn');
    expect(sig.notes.some(n => n.includes('Saturn is your Amatyakaraka'))).toBe(true);
  });

  it('reads the dasamsa 10th when the D10 lagna is supplied', () => {
    expect(REF.divisionalRashis!.D10.Lagna).toBeDefined();
    const withoutLagna: StrengthInput = {
      ...REF,
      divisionalRashis: { D10: Object.fromEntries(Object.entries(REF.divisionalRashis!.D10).filter(([k]) => k !== 'Lagna')) },
    };
    const d10Notes = (s: ReturnType<typeof careerSignature>) => s!.notes.filter(n => n.includes('dasamsa (D10)'));
    expect(d10Notes(careerSignature(withoutLagna, 'en'))).toHaveLength(0);
  });

  it('is bilingual', () => {
    const si = careerSignature(REF, 'si')!;
    expect(si.notes[0]).toContain('වෘත්තීය ලකුණ');
    expect(si.notes[0]).toContain('චන්ද්‍ර');
  });
});

describe('reference chart — wealth signature', () => {
  const sig = wealthSignature(REF, 'en')!;

  it('leads with the 2nd and 11th lords (Mars, Sun) then the 2nd-house occupants', () => {
    expect(sig.planets).toEqual(['Mars', 'Sun', 'Mercury']);
    expect(sig.notes[0]).toContain('Income channels');
  });

  it('states the Indu Lagna', () => {
    expect(sig.indu?.lord).toBe('Jupiter');
    expect(sig.notes.some(n => n.includes('Indu Lagna') && n.includes('Dhanu') && n.includes('Jupiter'))).toBe(true);
  });
});

describe('reference chart — activation during Venus / Saturn', () => {
  const chain = ['Venus', 'Saturn'];
  const career = assessCareerActivation(chain, REF, 'en')!;
  const wealth = assessWealthActivation(chain, REF, 'en')!;

  it('finds career engaged: both lords aspect the 10th from Capricorn, Saturn is the Amatyakaraka', () => {
    expect(career.points).toBeGreaterThan(0);
    expect(career.notes.some(n => n.startsWith('Venus') && n.includes('aspect onto your 10th'))).toBe(true);
    expect(career.notes.some(n => n.includes('Saturn, your Amatyakaraka'))).toBe(true);
  });

  it('credits the Kendra-Trikona Rajayoga (Venus + Saturn) as fructifying — once, not once per member', () => {
    const yogaNotes = career.notes.filter(n => n.includes('Kendra-Trikona Rajayoga') && n.includes('forming it'));
    expect(yogaNotes).toHaveLength(1);
    expect(yogaNotes[0]).toContain('Venus'); // the higher level keeps the credit
  });

  it('stays within the cap', () => {
    expect(Math.abs(career.points)).toBeLessThanOrEqual(1.2);
    expect(Math.abs(wealth.points)).toBeLessThanOrEqual(1.2);
  });

  it('counts a planet once when it holds two levels', () => {
    const once = assessCareerActivation(['Venus'], REF, 'en')!;
    const twice = assessCareerActivation(['Venus', 'Venus'], REF, 'en')!;
    expect(twice.points).toBe(once.points);
  });

  it('returns null without a chart', () => {
    expect(assessCareerActivation(chain, {}, 'en')).toBeNull();
    expect(assessWealthActivation([], REF, 'en')).toBeNull();
  });
});

// ─── Synthetic chart, Aries ascendant ──────────────────────────────────────

/**
 * Aries lagna. 2nd = Taurus (Venus), 11th = Aquarius (Saturn), 12th = Pisces.
 * Jupiter in Aquarius (11th); Sun in Pisces (12th); Venus and Saturn together in
 * Gemini — the 2nd and 11th lords conjunct, a Dhana Yoga; Mars in Scorpio.
 */
const ARIES: StrengthInput = {
  ascendantRashi: 0,
  moonRashi: 0,
  planetRashis: { Sun: 11, Moon: 0, Mars: 7, Mercury: 0, Jupiter: 10, Venus: 2, Saturn: 2, Rahu: 4, Ketu: 10 },
  planetHouses: { Sun: 12, Moon: 1, Mars: 8, Mercury: 1, Jupiter: 11, Venus: 3, Saturn: 3, Rahu: 5, Ketu: 11 },
};

describe('synthetic Aries chart — wealth activation', () => {
  it('credits a lord sitting in the 11th', () => {
    const a = assessWealthActivation(['Jupiter'], ARIES, 'en')!;
    expect(a.points).toBeGreaterThan(0);
    expect(a.notes[0]).toContain('sits natally in your 11th house');
  });

  it('penalises a 12th-house lord that rules no wealth house', () => {
    const a = assessWealthActivation(['Sun'], ARIES, 'en')!;
    expect(a.points).toBeLessThan(0);
    expect(a.notes.some(n => n.includes('12th house') && n.includes('expenditure'))).toBe(true);
  });

  it('fires the Dhana Yoga when one of its lords runs', () => {
    const a = assessWealthActivation(['Venus'], ARIES, 'en')!;
    expect(a.notes.some(n => n.includes('Dhana Yoga') && n.includes('Venus'))).toBe(true);
    expect(a.points).toBeGreaterThan(0);
  });

  it('credits the Indu Lagna lord or occupant', () => {
    // 9th from Aries and from the Aries Moon are both Sagittarius → Jupiter,
    // 10 + 10 = 20 → 8; the 8th from Aries is Scorpio, where Mars stands.
    const indu = induLagna(ARIES)!;
    expect(indu.rashi).toBe(7);
    expect(indu.lord).toBe('Mars');
    expect(indu.occupants).toEqual(['Mars']);
    const a = assessWealthActivation(['Mars'], ARIES, 'en')!;
    expect(a.notes.some(n => n.includes('Indu Lagna'))).toBe(true);
  });

  it('weights an antardasha lord below a mahadasha lord', () => {
    const asMaha = assessWealthActivation(['Jupiter'], ARIES, 'en')!;
    const asAntar = assessWealthActivation(['Mercury', 'Jupiter'], ARIES, 'en')!;
    const mercuryAlone = assessWealthActivation(['Mercury'], ARIES, 'en')!;
    expect(asAntar.points - mercuryAlone.points).toBeLessThan(asMaha.points);
  });
});

describe('Indu Lagna — remainder zero counts twelve', () => {
  it('Scorpio lagna with the Moon in Libra: Moon (16) + Mercury (8) = 24 → the 12th from the Moon', () => {
    const input: StrengthInput = {
      ascendantRashi: 7, moonRashi: 6,
      planetRashis: { Sun: 0, Moon: 6, Mars: 1, Mercury: 2, Jupiter: 3, Venus: 4, Saturn: 5, Rahu: 8, Ketu: 2 },
    };
    const indu = induLagna(input)!;
    expect(indu.rashi).toBe(5); // Virgo
    expect(indu.lord).toBe('Mercury');
  });
});

// ─── Engine integration ────────────────────────────────────────────────────

describe('engine — career and wealth blocks carry the new layer', () => {
  const pred = new DashaPredictionEngine().generateCompletePrediction('Venus', 'Saturn', undefined, undefined, REF, 'en');

  it('opens career with the chart signature, not the dasha lord’s profession list', () => {
    const career = pred.predictions.career;
    expect(career.details[0]).toContain('Career signature');
    expect(career.details.some(d => d.includes('Amatyakaraka'))).toBe(true);
    expect(career.details.some(d => d.includes('Favorable career areas'))).toBe(true);
    expect(career.keywords).toContain('job');
  });

  it('carries income channels and the Indu Lagna in wealth, ahead of the dasha lord’s generic copy', () => {
    const d = pred.predictions.wealth.details;
    const channels = d.findIndex(x => x.includes('Income channels'));
    const indu = d.findIndex(x => x.includes('Indu Lagna'));
    const generic = d.findIndex(x => x.includes('Luxury goods, comfort'));
    expect(channels).toBeGreaterThanOrEqual(0);
    expect(indu).toBeGreaterThan(channels);
    expect(generic).toBeGreaterThan(indu);
  });

  it('keeps the activation layer out of the other areas', () => {
    for (const area of ['health', 'relationships'] as const) {
      expect(pred.predictions[area].details.some(d => d.includes('Indu Lagna') || d.includes('Career signature'))).toBe(false);
    }
  });

  it('moves the area scores by a bounded amount relative to a chart-less reading of the same chain', () => {
    // Without a chart there is no activation (and no foundation), so this is a
    // loose sanity bound: the layer tips a reading, it does not carry it.
    const bare = new DashaPredictionEngine().generateCompletePrediction('Venus', 'Saturn', undefined, undefined, undefined, 'en');
    expect(Math.abs(pred.overallScore - bare.overallScore)).toBeLessThan(3);
  });

  it('renders in Sinhala end to end', () => {
    const si = new DashaPredictionEngine().generateCompletePrediction('Venus', 'Saturn', undefined, undefined, REF, 'si');
    expect(si.predictions.career.details[0]).toContain('වෘත්තීය ලකුණ');
    expect(si.predictions.wealth.details.some(d => d.includes('ඉන්දු ලග්නය'))).toBe(true);
  });
});
