/**
 * Reference chart: 1987-08-06 09:02, Colombo (6.9271 N, 79.8612 E), Lahiri.
 *
 * Virgo ascendant. Sidereal longitudes are Swiss Ephemeris values for that
 * moment, treated as fixed inputs so these tests exercise interpretation rather
 * than the ephemeris.
 *
 * Kept as a regression case because it exposed four separate blind spots at
 * once, all of the same kind — states the engine computed or could compute but
 * that never reached a reading:
 *
 *   • a debilitated, combust Mars (3rd/8th lord) reported as sign and degree only
 *   • a combust Venus (2nd/9th lord) likewise
 *   • a gandanta Moon in Mula pada 1 — not detected at all, in a Moon Mahadasha
 *   • four planets in the 11th including the 2nd, 9th, 1st and 10th lords,
 *     scored as a wealth deficit (−1.16, "Weak") because no layer could see the
 *     dhana combination they form
 *
 * and one whose halves were being averaged into nonsense: an exalted Jupiter
 * transiting the natal 11th-house stellium while Saturn ran Kantaka Shani from
 * the Moon.
 */

import { describe, it, expect } from 'vitest';
import { buildChartContext } from '../services/predictionService';
import {
  analyzePlanet, getGandanta, assessStrength, getDigBala, getFunctionalNature,
} from './planetaryAnalysis';
import { assessNatalFoundation } from './natalFoundation';
import { computeVargas } from './vargas';
import { assessVargaBackbone } from './vargaStrength';
import { areaYogas } from './areaYogas';
import { summarizeGocharaForPrediction, type GocharaSnapshot } from './transits';
import { DashaPredictionEngine } from './predictions';
import type { PlanetPosition } from './ephemeris';

const SIDEREAL: Record<string, [number, boolean]> = {
  SUN:       [109.4825, false],
  MOON:      [243.0395, false],
  MERCURY:   [94.9546,  false],
  VENUS:     [104.7704, false],
  MARS:      [115.7103, false],
  JUPITER:   [5.7374,   false],
  SATURN:    [230.9901, true],
  RAHU:      [339.9671, true],
  KETU:      [159.9671, true],
  ASCENDANT: [153.2165, false],
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

const ctx = buildChartContext(positions);
const ASC_RASHI = positions.ASCENDANT.rashi;

const analyse = (key: string) => {
  const p = positions[key];
  return analyzePlanet(key, p.rashi, ASC_RASHI, p.isRetrograde, p.rashiDegree, {
    longitude: p.longitude,
    sunLongitude: positions.SUN.longitude,
    signByPlanet: ctx.planetRashis!,
  });
};

describe('Virgo reference chart — the chart itself', () => {
  it('is a Virgo ascendant with a four-planet 11th house', () => {
    expect(ASC_RASHI).toBe(5);
    const inEleventh = Object.entries(ctx.planetHouses!).filter(([, h]) => h === 11).map(([p]) => p);
    expect(inEleventh.sort()).toEqual(['Mars', 'Mercury', 'Sun', 'Venus']);
  });
});

describe('planet keys are accepted in either casing', () => {
  // The chart layer keys planets upper case ('MARS'); the dignity, relationship
  // and signification tables are title case ('Mars'). A miss returns a
  // plausible neutral result rather than throwing, so this mismatch reported
  // every planet as dignity-neutral and never detected combustion or Neecha
  // Bhanga at all — silently, for every chart.
  it('reads the same dignity for MARS and Mars', () => {
    expect(analyzePlanet('MARS', 3, 5, false, 25.71).dignity).toBe('debilitated');
    expect(analyzePlanet('Mars', 3, 5, false, 25.71).dignity).toBe('debilitated');
  });

  it('resolves relationship-derived dignity in either casing', () => {
    // Venus in Cancer is an enemy sign — that needs the relationship table.
    expect(analyzePlanet('VENUS', 3, 5, false, 14.77).dignity).toBe('enemy-sign');
    expect(analyzePlanet('Venus', 3, 5, false, 14.77).dignity).toBe('enemy-sign');
  });

  it('finds Neecha Bhanga from an upper-cased sign map', () => {
    const upper = Object.fromEntries(
      Object.entries(ctx.planetRashis!).map(([k, v]) => [k.toUpperCase(), v]),
    );
    const a = analyzePlanet('MARS', 3, 5, false, 25.71, { signByPlanet: upper });
    expect(a.neechaBhanga?.cancelled).toBe(true);
  });

  it('carries per-planet significations across in either casing', () => {
    expect(analyzePlanet('SATURN', 7, 5, true, 20.99).gemstone).toBe('Blue Sapphire');
  });
});

describe('combustion reaches the reading', () => {
  it('reports Mars combust — 6.2° from the Sun against a 17° orb', () => {
    const c = analyse('MARS').combustion!;
    expect(c.isCombust).toBe(true);
    expect(c.separation).toBeCloseTo(6.23, 1);
    expect(c.limit).toBe(17);
  });

  it('reports Venus combust — 4.7° against a 10° orb', () => {
    const c = analyse('VENUS').combustion!;
    expect(c.isCombust).toBe(true);
    expect(c.separation).toBeCloseTo(4.71, 1);
  });

  it('leaves Mercury clear — 14.53° against a 14° orb, a half-degree margin', () => {
    const c = analyse('MERCURY').combustion!;
    expect(c.isCombust).toBe(false);
    expect(c.separation).toBeCloseTo(14.53, 1);
    expect(c.separation - c.limit).toBeLessThan(1);
  });

  it('costs a combust planet strength even where its dignity is unremarkable', () => {
    // Venus is in an enemy sign and combust; the two must both register.
    const combust = analyse('VENUS').strength.score;
    const ifClear = assessStrength({
      planet: 'Venus', dignity: 'enemy-sign', moolatrikona: false,
      dig: getDigBala('Venus', 11), functional: getFunctionalNature('Venus', ASC_RASHI),
      isRetrograde: false, combust: false,
    }).score;
    expect(combust).toBeLessThan(ifClear);
    expect(analyse('VENUS').strength.verdict).toBe('very-weak');
  });
});

describe('debilitation and its cancellation', () => {
  it('reports Mars debilitated with Neecha Bhanga applying', () => {
    const a = analyse('MARS');
    expect(a.dignity).toBe('debilitated');
    expect(a.neechaBhanga?.applies).toBe(true);
    expect(a.neechaBhanga?.cancelled).toBe(true);
  });

  it('names the dispositor route — the Moon in a kendra from the Lagna', () => {
    expect(analyse('MARS').neechaBhanga!.reasons.join(' ')).toContain('Moon');
  });

  it('does not let the cancellation read as an ordinary career asset', () => {
    // Neecha Bhanga pays out late and through crisis. Scoring it like a clean
    // yoga is what turns a hard chart into a comfortable-sounding one.
    const yogas = areaYogas({
      planetRashis: ctx.planetRashis!,
      ascendantRashi: ctx.ascendantRashi!,
      planetLongitudes: ctx.planetLongitudes,
      planetRetro: ctx.planetRetro,
    })!;
    const nb = yogas.career.yogas.find(y => y.kind === 'Neecha Bhanga Rajayoga');
    expect(nb).toBeDefined();
    expect(nb!.deferred).toBe(true);
    const strongest = Math.max(...yogas.career.yogas.map(y => y.points));
    expect(nb!.points).toBeLessThan(strongest);
  });
});

describe('gandanta — the Moon at the Scorpio/Sagittarius junction', () => {
  it('detects the Moon in the sign-junction band', () => {
    const g = getGandanta(positions.MOON.rashi, positions.MOON.rashiDegree, 'Mula');
    expect(g).not.toBeNull();
    expect(g!.side).toBe('fire-start');
    expect(g!.fromJunction).toBeCloseTo(3.04, 1);
  });

  it('grades a placement near the band edge as shallow, not deep', () => {
    // 3.04° into Sagittarius is inside the band but not at the knot.
    expect(getGandanta(8, 3.04)!.severity).toBe('mild');
    expect(getGandanta(8, 0.5)!.severity).toBe('deep');
    expect(getGandanta(7, 29.5)!.severity).toBe('deep');
  });

  it('leaves positions clear of the junction alone', () => {
    // Mars at Cancer 25.71° is close to deep debilitation but not gandanta.
    expect(getGandanta(3, 25.71)).toBeNull();
    // Earth and air signs have no junction band at all.
    expect(getGandanta(5, 0.5)).toBeNull();
  });

  it('leads the health reasons with it — it outranks the house bookkeeping', () => {
    const f = assessNatalFoundation(ctx)!;
    expect(f.health.notes[0]).toContain('gandanta');
    expect(f.health.notes[0]).toContain('Mula');
  });
});

describe('wealth is not a deficit — the 11th-house dhana combination', () => {
  const f = assessNatalFoundation(ctx)!;

  it('no longer rates wealth as weak', () => {
    // Was −1.16 ("Weak"): four planets in the 11th including the 2nd, 9th, 1st
    // and 10th lords, scored purely on their individual dignities.
    expect(f.wealth.weak).toBe(false);
    expect(f.wealth.score).toBeGreaterThan(-0.75);
  });

  it('detects the 2nd lord deposited in the 11th', () => {
    const yogas = areaYogas({
      planetRashis: ctx.planetRashis!,
      ascendantRashi: ctx.ascendantRashi!,
      planetLongitudes: ctx.planetLongitudes,
      planetRetro: ctx.planetRetro,
    })!;
    expect(yogas.wealth.yogas.some(y => y.kind === 'Dhana Yoga')).toBe(true);
    expect(yogas.wealth.points).toBeGreaterThan(0);
  });

  it('describes the 2nd lord in the 11th as placed well but weak in itself', () => {
    // The old note read "under strain (placed in your 11th house)", which blames
    // the placement for a problem belonging to the dignity — and the 11th is the
    // best house a 2nd lord can occupy.
    const note = f.wealth.notes.find(n => n.includes('lord of your 2nd house'))!;
    expect(note).toContain('well placed');
    expect(note).not.toContain('under strain');
  });

  it('attributes the real weakness to retention rather than acquisition', () => {
    expect(f.wealth.notes.join(' ')).toContain('retention');
  });

  it('counts the stellium as concentration rather than four separate defects', () => {
    expect(f.wealth.notes.join(' ')).toContain('4 planets are gathered');
  });
});

describe('cross-varga standing finds the chart’s backbone', () => {
  const vargas = computeVargas({
    longitudes: Object.fromEntries(
      Object.entries(SIDEREAL)
        .filter(([k]) => k !== 'ASCENDANT')
        .map(([k, [lon]]) => [k.charAt(0) + k.slice(1).toLowerCase(), lon]),
    ),
    retro: ctx.planetRetro,
    ascendantLongitude: positions.ASCENDANT.longitude,
  });
  const backbone = assessVargaBackbone({ chart: vargas, longitudes: ctx.planetLongitudes! });

  it('names Saturn the single pillar — own sign in D9, D10 and D30', () => {
    expect(backbone.pillars).toEqual(['Saturn']);
    const saturn = backbone.planets.find(p => p.planet === 'Saturn')!;
    expect(saturn.dignifiedIn.sort()).toEqual(['D10', 'D30', 'D9']);
  });

  it('resolves the navamsa back to its own lord', () => {
    expect(backbone.navamsaAnchor).not.toBeNull();
    expect(backbone.navamsaAnchor!.planet).toBe('Saturn');
    expect(backbone.navamsaAnchor!.inNavamsaLagna).toBe(true);
  });

  it('reports the absence of vargottama as a finding in its own right', () => {
    expect(backbone.vargottama).toEqual([]);
    expect(backbone.notes.join(' ')).toContain('No planet is vargottama');
  });

  it('does not let a lucky minor-varga placement outrank a pillar', () => {
    // Saturn's Vimsopaka is mid-table because the classical Saptavarga weights
    // exclude D10. The pillar list must not be derived from that score.
    const saturn = backbone.planets.find(p => p.planet === 'Saturn')!;
    const sun = backbone.planets.find(p => p.planet === 'Sun')!;
    expect(sun.vimsopaka).toBeGreaterThan(saturn.vimsopaka);
    expect(backbone.pillars).not.toContain('Sun');
  });
});

describe('dasha-lord resonance', () => {
  it('flags Ketu ruling the birth nakshatra and occupying the Lagna at once', () => {
    const pred = new DashaPredictionEngine()
      .generateCompletePrediction('Moon', 'Ketu', undefined, undefined, ctx, 'en');
    const general = pred.predictions.general.details.join(' ');
    expect(general).toContain('lord of your birth nakshatra');
    expect(general).toContain('Mula');
    expect(general).toContain('sits in your Ascendant');
    expect(general).toContain('2 separate structural ties');
  });

  it('stays quiet when the running lord has no such tie', () => {
    const pred = new DashaPredictionEngine()
      .generateCompletePrediction('Moon', 'Jupiter', undefined, undefined, ctx, 'en');
    const general = pred.predictions.general.details.join(' ');
    expect(general).not.toContain('lord of your birth nakshatra');
  });

  it('supplies the Moon’s nakshatra lord from the chart context', () => {
    expect(ctx.moonNakshatraLord).toBe('Ketu');
    expect(ctx.moonNakshatraName).toBe('Mula');
  });
});

describe('transits are read from the Lagna as well as the Moon', () => {
  // Mid-2026: Jupiter exalted in Cancer over the natal 11th-house stellium,
  // Saturn in Pisces — the 4th from the natal Moon (Kantaka Shani) and over
  // natal Rahu in the 7th.
  const TRANSIT: Record<string, { rashi: number; lon: number; retro: boolean }> = {
    SUN:     { rashi: 3,  lon: 102, retro: false },
    MOON:    { rashi: 6,  lon: 190, retro: false },
    MARS:    { rashi: 5,  lon: 165, retro: false },
    MERCURY: { rashi: 3,  lon: 108, retro: false },
    JUPITER: { rashi: 3,  lon: 96,  retro: false },
    VENUS:   { rashi: 2,  lon: 75,  retro: false },
    SATURN:  { rashi: 11, lon: 355, retro: false },
    RAHU:    { rashi: 10, lon: 320, retro: true },
    KETU:    { rashi: 4,  lon: 140, retro: true },
  };

  const snapshot = {
    asOf: '2026-07-29T00:00:00Z',
    natalMoonRashi: positions.MOON.rashi,
    natalLagnaRashi: ASC_RASHI,
    transits: Object.entries(TRANSIT).map(([planet, t]) => ({
      planet, rashi: t.rashi, rashiName: '', rashiDegree: t.lon % 30, longitude: t.lon, speed: 1,
      nakshatra: 0, nakshatraPada: 1,
      houseFromMoon: ((t.rashi - positions.MOON.rashi + 12) % 12) + 1,
      houseFromLagna: ((t.rashi - ASC_RASHI + 12) % 12) + 1,
      valence: 0,
      note: planet === 'SATURN' ? 'Kantaka Shani — stress on home, mother, vehicles' : null,
      isRetrograde: t.retro,
      dignity: planet === 'JUPITER' ? ('exalted' as const) : ('neutral-sign' as const),
    })),
    natalPlanets: Object.entries(ctx.planetRashis!).map(([planet, rashi]) => ({
      planet: planet.toUpperCase(), rashi,
      longitude: ctx.planetLongitudes![planet], isRetrograde: ctx.planetRetro![planet] ?? false,
    })),
    sadeSati: { active: false, phase: 'none' as const, description: 'Not currently in Sade Sati.' },
    jupiterBlessing: { auspicious: false, reason: 'Guru is transiting your 8th from Moon.' },
    nodalShift: { rahuRashi: 10, ketuRashi: 4, note: '' },
    moonPhase: { phase: 'waxing', tithi: 1, tithiName: '', paksha: 'shukla', illumination: 0.5, desc: '' },
  } as unknown as GocharaSnapshot;

  const summary = summarizeGocharaForPrediction(snapshot, 'en');

  it('reports the exalted Jupiter transit that a Moon-only reading misses', () => {
    const notes = summary.notes.join(' ');
    expect(notes).toContain('exalted');
    expect(notes).toContain('11th house');
  });

  it('reports the pass over the natal stellium', () => {
    const notes = summary.notes.join(' ');
    expect(notes).toContain('passing over your natal');
    for (const p of ['Sun', 'Mercury', 'Venus', 'Mars']) expect(notes).toContain(p);
  });

  it('keeps the outward and inward readings apart instead of averaging them away', () => {
    expect(summary.outwardMod).toBeGreaterThan(0.5);
    expect(summary.inwardMod).toBeLessThan(0);
    expect(summary.diverges).toBe(true);
  });

  it('says outright that the period is split', () => {
    expect(summary.notes.join(' ')).toContain('This period is split');
  });

  it('still keeps the Moon-side pressure visible', () => {
    expect(summary.notes.join(' ')).toContain('Kantaka Shani');
  });

  it('surfaces the split in the prediction itself', () => {
    const pred = new DashaPredictionEngine().generateCompletePrediction(
      'Moon', 'Ketu', undefined, undefined,
      { ...ctx, transitDiverges: true, transitNotes: summary.notes, transitScoreMod: summary.scoreMod },
      'en',
    );
    expect(pred.predictions.general.details.join(' ')).toContain('pulling in two directions');
  });
});
