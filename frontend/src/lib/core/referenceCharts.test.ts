/**
 * Regression charts with independently published expected values.
 *
 * Three charts whose Vimsopaka Bala scores, dignities and divisional lagnas were
 * computed independently with Swiss Ephemeris and recorded before this suite
 * existed. That makes them the only tests here that can catch the cross-varga
 * layer being *wrong* rather than merely different — a self-consistent bug in a
 * scoring function passes every test written from its own output.
 *
 * Sidereal longitudes are Lahiri, whole-sign houses, true node.
 */

import { describe, it, expect } from 'vitest';
import { computeVargas } from './vargas';
import { assessVargaBackbone } from './vargaStrength';
import { getDignity } from './planetaryAnalysis';
import { assessPlanetStrength, type StrengthInput } from './dashaStrength';
import { assessNatalFoundation } from './natalFoundation';
import { assessMarriagePromise } from './matchPromise';
import {
  marriageInsights, careerInsights, type NatalVargaContext,
} from '../services/vargaService';

interface RefChart {
  name: string;
  ascendant: number;
  longitudes: Record<string, number>;
  retro: Record<string, boolean>;
  /** Published Vimsopaka Bala out of 20, to one decimal. */
  vimsopaka: Record<string, number>;
  d9Lagna: number;
  d10Lagna: number;
  vargottama: string[];
}

const sign = (rashi: number, deg: number) => rashi * 30 + deg;

/** Barack Obama — 4 Aug 1961 19:24 HST, Honolulu. Rodden AA. */
const OBAMA: RefChart = {
  name: 'Obama',
  ascendant: sign(9, 24.73),   // Makara 24.73°
  longitudes: {
    Sun: sign(3, 19.23), Moon: sign(1, 10.04), Mercury: sign(3, 9.01),
    Venus: sign(2, 8.47), Mars: sign(4, 29.26), Jupiter: sign(9, 7.54),
    Saturn: sign(9, 2.01), Rahu: sign(4, 3.99), Ketu: sign(10, 3.99),
  },
  retro: { Jupiter: true, Saturn: true, Rahu: true, Ketu: true },
  vimsopaka: {
    Saturn: 16.4, Moon: 15.0, Sun: 13.3, Ketu: 13.0, Mars: 11.9,
    Jupiter: 10.1, Venus: 10.1, Mercury: 9.5, Rahu: 8.9,
  },
  d9Lagna: 4,    // Simha
  d10Lagna: 1,   // Vrishabha
  vargottama: ['Saturn'],
};

/** Steve Jobs — 24 Feb 1955 19:15 PST, San Francisco. Rodden AA. */
const JOBS: RefChart = {
  name: 'Jobs',
  ascendant: sign(4, 29.06),   // Simha 29.06°
  longitudes: {
    Sun: sign(10, 12.51), Moon: sign(11, 14.51), Mercury: sign(9, 21.13),
    Venus: sign(8, 27.94), Mars: sign(0, 5.85), Jupiter: sign(2, 27.27),
    Saturn: sign(6, 27.93), Rahu: sign(8, 10.17), Ketu: sign(2, 10.17),
  },
  retro: { Mercury: true, Jupiter: true, Rahu: true, Ketu: true },
  vimsopaka: {
    Mars: 14.0, Saturn: 13.6, Mercury: 11.9, Moon: 10.8, Sun: 10.6,
    Jupiter: 10.1, Venus: 9.9, Ketu: 9.0, Rahu: 7.8,
  },
  d9Lagna: 8,    // Dhanu
  d10Lagna: 1,   // Vrishabha
  vargottama: ['Venus', 'Jupiter'],
};

/** Diana, Princess of Wales — 1 Jul 1961 18:45 UT, Sandringham. Rodden A. */
const DIANA: RefChart = {
  name: 'Diana',
  ascendant: sign(7, 25.11),   // Vrischika 25.11°
  longitudes: {
    Sun: sign(2, 16.35), Moon: sign(10, 1.72), Mercury: sign(2, 9.88),
    Venus: sign(1, 1.08), Mars: sign(4, 8.33), Jupiter: sign(9, 11.78),
    Saturn: sign(9, 4.50), Rahu: sign(4, 4.86), Ketu: sign(10, 4.86),
  },
  retro: { Mercury: true, Jupiter: true, Saturn: true, Rahu: true, Ketu: true },
  // Only the extremes are published for this chart.
  vimsopaka: { Saturn: 16.4, Jupiter: 7.5 },
  d9Lagna: -1,   // not published
  d10Lagna: -1,
  vargottama: [],
};

function backboneFor(c: RefChart) {
  const vargas = computeVargas({
    longitudes: c.longitudes, retro: c.retro, ascendantLongitude: c.ascendant,
  });
  return { vargas, backbone: assessVargaBackbone({ chart: vargas, longitudes: c.longitudes }) };
}

describe.each([OBAMA, JOBS, DIANA])('$name — cross-varga standing', chart => {
  const { vargas, backbone } = backboneFor(chart);
  const byPlanet = Object.fromEntries(backbone.planets.map(p => [p.planet, p]));

  for (const [planet, expected] of Object.entries(chart.vimsopaka)) {
    it(`${planet} scores ${expected}/20`, () => {
      expect(Math.round(byPlanet[planet].vimsopaka * 10) / 10).toBe(expected);
    });
  }

  it('ranks the planets in the published order', () => {
    const published = Object.keys(chart.vimsopaka);
    if (published.length < 9) return;   // Diana publishes only the extremes
    expect(backbone.planets.map(p => p.planet)).toEqual(published);
  });

  if (chart.d9Lagna >= 0) {
    it('places the D9 and D10 lagnas where the reference does', () => {
      expect(vargas.d9Ascendant).toBe(chart.d9Lagna);
      expect(vargas.d10Ascendant).toBe(chart.d10Lagna);
    });
  }

  it('identifies the same vargottama planets', () => {
    expect(backbone.vargottama.sort()).toEqual([...chart.vargottama].sort());
  });
});

describe('Obama — the pillar must not contradict its own score', () => {
  const { backbone } = backboneFor(OBAMA);

  it('leads on Saturn, never on a bottom-ranked planet', () => {
    // The reported bug: the selector ranked purely by how many divisions a planet
    // held own-sign or exalted, so Mercury at 9.5/20 — the second-lowest scorer in
    // the chart — was announced as "this chart's structural pillar" in a sentence
    // that quoted 9.5/20 immediately afterwards.
    //
    // Mercury holds own sign in D9, D10 and D30, so the repetition is genuine and
    // still gets reported. What it must never do is lead, or be called a pillar.
    expect(backbone.pillars).not.toContain('Mercury');
    expect(backbone.notes[0]).toContain('Saturn');
    expect(backbone.notes[0]).not.toContain('Mercury');
  });

  it('demotes Mercury to repetition-without-strength rather than dropping it', () => {
    const mercuryNote = backbone.notes.find(n => n.includes('Mercury'))!;
    expect(mercuryNote).toContain('D9, D10, D30');
    expect(mercuryNote).toContain('is not strength');
  });

  it('has no pillar at all — nothing holds both repetition and strength', () => {
    // Saturn has the strength (16.4, vargottama) but only two of the four
    // load-bearing vargas. Reporting "no pillar" is the honest answer.
    expect(backbone.pillars).toEqual([]);
    expect(backbone.notes[0]).toContain('no single structural pillar');
  });

  it('never quotes a pillar score below the chart median', () => {
    const scores = backbone.planets.map(p => p.vimsopaka).sort((a, b) => a - b);
    const median = scores[Math.floor(scores.length / 2)];
    for (const name of backbone.pillars) {
      const p = backbone.planets.find(x => x.planet === name)!;
      expect(p.vimsopaka, `${name} claimed as a pillar`).toBeGreaterThanOrEqual(median);
    }
  });

  it('reports Saturn as vargottama and top of the table', () => {
    expect(backbone.planets[0].planet).toBe('Saturn');
    expect(backbone.planets[0].isVargottama).toBe(true);
    expect(backbone.planets[0].grade).toBe('exceptional');
  });
});

describe('Diana — dignities the reference records', () => {
  it('has Jupiter debilitated and Saturn in own sign, both in Makara', () => {
    expect(getDignity('Jupiter', 9)).toBe('debilitated');
    expect(getDignity('Saturn', 9)).toBe('own-sign');
  });

  it('makes Jupiter the weakest and Saturn the strongest across vargas', () => {
    const { backbone } = backboneFor(DIANA);
    expect(backbone.planets[0].planet).toBe('Saturn');
    expect(backbone.planets[backbone.planets.length - 1].planet).toBe('Jupiter');
  });
});

describe('Diana — the D9 and D10 readings the export got wrong', () => {
  // Vrischika lagna. Venus rules the 7th (Vrishabha) and the 12th (Tula) and sits
  // in the 7th. Sun rules the 10th (Simha) and sits in the 8th. Both facts were
  // invisible to a reading that only looked at divisional sign dignity, which is
  // how the export produced "marriage tends to flourish" and a uniformly positive
  // career section for this chart.
  const ctx: NatalVargaContext = {
    ascendantRashi: 7,
    planetRashis: Object.fromEntries(
      Object.entries(DIANA.longitudes).map(([p, l]) => [p, Math.floor(l / 30)])),
    planetLongitudes: DIANA.longitudes,
    planetRetro: DIANA.retro,
  };
  const { vargas } = backboneFor(DIANA);
  const marriage = marriageInsights(vargas, ctx);
  const career = careerInsights(vargas, ctx);
  const marriageText = marriage.map(i => i.text).join(' ');

  it('names Venus as ruling both the 7th and the 12th', () => {
    const lead = marriage.find(i => i.title.startsWith('7th lord'))!;
    expect(lead.title).toContain('Venus');
    expect(lead.text).toContain('rules your 7th house');
    expect(lead.text).toContain('12th');
    expect(lead.tone).toBe('challenging');
  });

  it('flags Venus occupying the house it rules', () => {
    expect(marriageText).toContain('karako bhava nashaya');
  });

  it('no longer claims the marriage flourishes or that the spouse is a blessing', () => {
    expect(marriageText).not.toContain('marriage tends to flourish');
    expect(marriageText).not.toContain('genuine blessing');
  });

  it('notices the 10th lord is in the 8th', () => {
    const lead = career.find(i => i.title.startsWith('10th lord'))!;
    expect(lead.title).toContain('Sun');
    expect(lead.text).toContain('sits in the 8th');
    expect(lead.tone).toBe('challenging');
  });

  it('does not return a uniformly positive career reading', () => {
    expect(career.some(i => i.tone === 'challenging')).toBe(true);
  });

  it('caps a strong dasamsa karaka when the career house is compromised', () => {
    // Saturn is strong in Diana's dasamsa. Uncapped, that printed "you become an
    // institution in your field" on a chart whose 10th lord sits in the 8th.
    const saturn = career.find(i => i.title.startsWith('Saturn'));
    if (saturn && saturn.text.includes('institution in your field')) {
      expect(saturn.text).toContain('capacity rather than delivery');
      expect(saturn.tone).not.toBe('positive');
    }
  });

  it('does not let vargottama overclaim when it misses the relevant planets', () => {
    const v = marriage.find(i => i.title === 'Vargottama planets');
    if (v) expect(v.text).toContain('does not make a weak placement strong');
  });
});

describe('Diana — maraka lordship, which the export never computed', () => {
  // Vrischika lagna: the 2nd is Dhanu and the 7th is Vrishabha, so Jupiter and
  // Venus are the primary marakas. The reference's whole account of the final
  // period turns on Jupiter being the 2nd lord; the engine had no maraka concept
  // at all, and Jupiter's 2nd/5th rulership classified it as a functional benefic,
  // which is where the quality was being lost.
  const input: StrengthInput = {
    ascendantRashi: 7,
    planetRashis: Object.fromEntries(
      Object.entries(DIANA.longitudes).map(([p, l]) => [p, Math.floor(l / 30)])),
    planetLongitudes: DIANA.longitudes,
    planetRetro: DIANA.retro,
    moonRashi: 10,
  };

  it('identifies Jupiter as the 2nd lord and a maraka', () => {
    const j = assessPlanetStrength('Jupiter', input);
    expect(j.lordedHouses).toContain(2);
    expect(j.isMaraka).toBe(true);
    expect(j.marakaHouses).toEqual([2]);
  });

  it('identifies Venus as the 7th lord and a maraka', () => {
    const v = assessPlanetStrength('Venus', input);
    expect(v.lordedHouses).toEqual([7, 12]);
    expect(v.isMaraka).toBe(true);
    expect(v.marakaHouses).toEqual([7]);
  });

  it('keeps maraka independent of the functional classification', () => {
    // Jupiter rules a trikona too, so it classifies benefic. Folding maraka into
    // the same enum let the benefic reading win and the maraka quality vanish.
    const j = assessPlanetStrength('Jupiter', input);
    expect(j.functionalNature).toBe('functional-benefic');
    expect(j.isMaraka).toBe(true);
  });

  it('frames it as health-sensitive timing, not as a malefic or a death claim', () => {
    const note = assessPlanetStrength('Jupiter', input).notes.find(n => n.includes('maraka'))!;
    expect(note).toContain('not a malefic classification');
    expect(note).toContain('vitality');
    expect(note).not.toMatch(/death|die|fatal|longevity/i);
  });

  it('applies no score penalty for maraka lordship', () => {
    const j = assessPlanetStrength('Jupiter', input);
    // Jupiter is debilitated in Makara and that is what should move the score.
    expect(j.dignity).toBe('debilitated');
    expect(j.functionalMod).toBeGreaterThan(0);   // still credited as a trikona lord
  });

  it('leaves a chart with no 2nd/7th rulership unflagged', () => {
    const sun = assessPlanetStrength('Sun', input);   // rules the 10th only
    expect(sun.isMaraka).toBe(false);
    expect(sun.marakaHouses).toEqual([]);
  });
});

/**
 * Kandy 1986 chart — Dhanu lagna 15.96°, Moon Kumbha 5.42° (Dhanishta pada 4).
 *
 * Its 7th and 10th lord is one planet, Mercury, exalted in the 10th in the rashi
 * chart — and combust, debilitated in the navamsa, and in an enemy sign in the
 * dasamsa. That combination is why it is kept here: a D1-only reading calls both
 * marriage and career strong, while the charts that classical practice defers to
 * for those areas both contradict it. Only the chart geometry is recorded.
 */
const KANDY_1986 = {
  ascendant: sign(8, 15.96),
  longitudes: {
    Sun: sign(4, 29.49), Moon: sign(10, 5.42), Mercury: sign(5, 8.45),
    Venus: sign(6, 13.62), Mars: sign(8, 25.42), Jupiter: sign(10, 23.47),
    Saturn: sign(7, 10.67), Rahu: sign(11, 27.41), Ketu: sign(5, 27.41),
  },
  retro: { Jupiter: true, Rahu: true, Ketu: true } as Record<string, boolean>,
};

describe('Kandy 1986 — the area varga must outrank the rashi chart', () => {
  const ascR = 8;
  const rashis = Object.fromEntries(
    Object.entries(KANDY_1986.longitudes).map(([p, l]) => [p, Math.floor(l / 30)]));
  const houses = Object.fromEntries(
    Object.entries(rashis).map(([p, r]) => [p, ((r - ascR + 12) % 12) + 1]));
  const vargas = computeVargas({
    longitudes: KANDY_1986.longitudes, retro: KANDY_1986.retro,
    ascendantLongitude: KANDY_1986.ascendant,
  });
  const divisionalRashis: Record<string, Record<string, number>> = {};
  for (const code of ['D2', 'D9', 'D10', 'D30'] as const) {
    divisionalRashis[code] = Object.fromEntries(
      vargas.planets.map(p => [p.planet, p.divisions[code].rashi]));
  }
  const withVargas: StrengthInput = {
    planetRashis: rashis, planetLongitudes: KANDY_1986.longitudes, planetRetro: KANDY_1986.retro,
    planetHouses: houses, ascendantRashi: ascR, moonRashi: rashis.Moon, divisionalRashis,
  };
  const withoutVargas: StrengthInput = { ...withVargas, divisionalRashis: undefined };

  it('has one planet ruling both the 7th and the 10th, exalted in the 10th', () => {
    const m = assessPlanetStrength('Mercury', withVargas);
    expect(m.lordedHouses).toEqual([7, 10]);
    expect(m.dignity).toBe('exalted');
    expect(m.natalHouse).toBe(10);
    expect(m.isCombust).toBe(true);      // 8.96° from the Sun, inside the 14° orb
    expect(m.isMaraka).toBe(true);       // rules the 7th
  });

  it('places that same Mercury debilitated in D9 and in an enemy sign in D10', () => {
    expect(getDignity('Mercury', divisionalRashis.D9.Mercury)).toBe('debilitated');
    expect(getDignity('Mercury', divisionalRashis.D10.Mercury)).toBe('enemy-sign');
  });

  it('calls relationship and career strong when only the rashi chart is available', () => {
    // The defect, reproduced: with no divisional input the foundation layer can
    // only see an exalted 7th/10th lord in the 10th.
    const f = assessNatalFoundation(withoutVargas)!;
    expect(f.relationship.strong).toBe(true);
    expect(f.career.strong).toBe(true);
  });

  it('withdraws "strong" once the navamsa and dasamsa are supplied', () => {
    const f = assessNatalFoundation(withVargas)!;
    expect(f.relationship.strong).toBe(false);
    expect(f.career.strong).toBe(false);
    // Withdrawn, not inverted — the rashi promise is real, just unconfirmed.
    expect(f.relationship.weak).toBe(false);
    expect(f.career.weak).toBe(false);
  });

  it('lowers the relationship score rather than only clearing the flag', () => {
    const before = assessNatalFoundation(withoutVargas)!.relationship.score;
    const after = assessNatalFoundation(withVargas)!.relationship.score;
    expect(after).toBeLessThan(before);
  });

  it('explains the precedence in words, and reads as a sentence', () => {
    const f = assessNatalFoundation(withVargas)!;
    const note = f.relationship.notes.find(n => n.includes('D9'))!;
    expect(note).toContain('outranks its rashi-chart dignity');
    expect(note).toContain('debilitated in the D9');
    // The display labels are title-cased and read wrongly mid-clause.
    expect(note).not.toContain('Debilitated in the D9');
    expect(note).not.toContain('Enemy Sign');
  });

  it('words combustion for the area it is describing', () => {
    const f = assessNatalFoundation(withVargas)!;
    const rel = f.relationship.notes.join(' ');
    expect(rel).toContain('combust');
    // "retention rather than acquisition" is a claim about money and was being
    // printed verbatim for partnership and health.
    expect(rel).not.toContain('acquisition');
    expect(rel).toContain('sustained with difficulty');
  });

  it('agrees with the matching engine’s Layer 3 on the same chart', () => {
    // The two subsystems used to disagree: Layer 3 correctly read the 7th lord as
    // testing while the foundation layer called relationship strong.
    const promise = assessMarriagePromise({
      moonRashi: rashis.Moon, moonNakshatra: 22,
      marsHouseFromLagna: houses.Mars, marsHouseFromMoon: 1,
      ascendantRashi: ascR, planetRashis: rashis,
      planetLongitudes: KANDY_1986.longitudes, planetRetro: KANDY_1986.retro,
      d9Rashis: divisionalRashis.D9, d9Ascendant: vargas.d9Ascendant,
    }, false)!;
    expect(promise.seventhLordD9Dignity).toBe('debilitated');
    expect(promise.dimensions.find(d => d.key === 'seventhLord')!.band).not.toBe('supportive');
    expect(assessNatalFoundation(withVargas)!.relationship.strong).toBe(false);
  });
});
