/**
 * The specification's worked reference case, end to end.
 *
 *   Boy  (Party A): 1986-09-16 13:22, Kandy    — Dhanu lagna 15.96°
 *   Girl (Party B): 1987-08-06 09:02, Colombo  — Kanya lagna 3.22°
 *
 * Sidereal longitudes are Swiss Ephemeris values (Lahiri, true node) for those
 * moments, treated as fixed inputs so these tests exercise the four layers rather
 * than the ephemeris. Ashtakoot reads only the Moon, so the girl's Colombo lagna
 * rather than Kandy changes no whole-sign result in this case.
 *
 * This is the case the spec publishes expected values for, which makes it the one
 * test that can catch a layer being silently wrong rather than merely different.
 */

import { describe, it, expect } from 'vitest';
import { computeGunaMilan, analyseChartDoshas, type MatchInput } from './matching';
import { buildLayeredReport } from './matchReport';
import { assessMarriagePromise, arudhaPada, findDarakaraka } from './matchPromise';
import { computeSynastry, formatOrb } from './matchSynastry';
import { getNakshatra } from './nakshatra';
import { navamsaRashi, computeVargas } from './vargas';

const BOY_LON: Record<string, number> = {
  Sun: 149.4896, Moon: 305.4194, Mercury: 158.4523, Venus: 193.6239,
  Mars: 265.4211, Jupiter: 323.4720, Saturn: 220.6675,
  Rahu: 357.4126, Ketu: 177.4126,
};
const BOY_ASC = 255.9601;
const BOY_RETRO: Record<string, boolean> = { Jupiter: true, Rahu: true, Ketu: true };

const GIRL_LON: Record<string, number> = {
  Sun: 109.4825, Moon: 243.0395, Mercury: 94.9546, Venus: 104.7704,
  Mars: 115.7103, Jupiter: 5.7374, Saturn: 230.9901,
  Rahu: 339.9671, Ketu: 159.9671,
};
const GIRL_ASC = 153.2165;
const GIRL_RETRO: Record<string, boolean> = { Saturn: true, Rahu: true, Ketu: true };

function build(lons: Record<string, number>, ascLon: number, retro: Record<string, boolean>): MatchInput {
  const rashis: Record<string, number> = {};
  for (const [p, l] of Object.entries(lons)) rashis[p] = Math.floor(l / 30);
  const ascRashi = Math.floor(ascLon / 30);
  const moonNak = getNakshatra(lons.Moon);

  const vargas = computeVargas({ longitudes: lons, retro, ascendantLongitude: ascLon });
  const d9Rashis: Record<string, number> = {};
  const d30Rashis: Record<string, number> = {};
  for (const p of vargas.planets) {
    d9Rashis[p.planet] = p.d9Rashi;
    d30Rashis[p.planet] = p.divisions.D30.rashi;
  }

  return {
    moonRashi: rashis.Moon,
    moonNakshatra: moonNak.index,
    moonDegreeInSign: lons.Moon % 30,
    moonPada: moonNak.pada,
    moonNakshatraLord: moonNak.lord,
    moonNavamsa: navamsaRashi(lons.Moon),
    marsHouseFromLagna: ((rashis.Mars - ascRashi + 12) % 12) + 1,
    marsHouseFromMoon: ((rashis.Mars - rashis.Moon + 12) % 12) + 1,
    ascendantRashi: ascRashi,
    ascendantLongitude: ascLon,
    planetRashis: rashis,
    planetLongitudes: lons,
    planetRetro: retro,
    d9Rashis,
    d9Ascendant: vargas.d9Ascendant,
    d30Rashis,
  };
}

const boy = build(BOY_LON, BOY_ASC, BOY_RETRO);
const girl = build(GIRL_LON, GIRL_ASC, GIRL_RETRO);

// Party A is the boy, Party B the girl, so `aIsFemale` is false.
const report = buildLayeredReport(boy, girl, { aIsFemale: false });

describe('reference case — chart inputs', () => {
  it('places the two lagnas and Moons where the spec does', () => {
    expect(boy.ascendantRashi).toBe(8);              // Dhanu
    expect(boy.moonRashi).toBe(10);                  // Kumbha
    expect(getNakshatra(BOY_LON.Moon).name).toBe('Dhanishta');
    expect(getNakshatra(BOY_LON.Moon).pada).toBe(4);

    expect(girl.ascendantRashi).toBe(5);             // Kanya
    expect(girl.moonRashi).toBe(8);                 // Dhanu
    expect(getNakshatra(GIRL_LON.Moon).name).toBe('Mula');
    expect(getNakshatra(GIRL_LON.Moon).pada).toBe(1);
  });
});

describe('Layer 1 — the spec’s expected koota scores', () => {
  const l1 = computeGunaMilan(boy, girl);
  const by = Object.fromEntries(l1.kootas.map(k => [k.name, k.obtained]));

  it('Varna 0 — Kumbha (Shudra) against Dhanu (Kshatriya)', () => expect(by.Varna).toBe(0));
  it('Vashya 2 — both Manava, the girl’s Dhanu Moon being under 15°', () => expect(by.Vashya).toBe(2));
  it('Tara 1.5 — one direction auspicious', () => expect(by.Tara).toBe(1.5));
  it('Yoni 2 — Simha against Shwan, an unlisted cross pair', () => expect(by.Yoni).toBe(2));
  it('Graha Maitri 3 — Saturn and Jupiter, mutually neutral', () => expect(by['Graha Maitri']).toBe(3));
  it('Gana 6 — both Rakshasa', () => expect(by.Gana).toBe(6));
  it('Bhakoot 7 — the 3/11 axis', () => expect(by.Bhakoot).toBe(7));
  it('Nadi 8 — Madhya against Adi', () => expect(by.Nadi).toBe(8));

  it('totals 29.5 and passes the gate', () => {
    expect(l1.total).toBe(29.5);
    expect(l1.gate).toBe('GATE_PASS');
  });
});

describe('Layer 2 — the spec’s expected dosha reading', () => {
  it('finds the boy’s Kuja dosha from the lagna only', () => {
    const d = analyseChartDoshas(boy).manglik;
    expect(d.fromLagna).toBe(true);      // Mars in Dhanu, the 1st
    expect(d.fromMoon).toBe(false);
    expect(d.isManglik).toBe(true);
  });

  it('finds the girl’s from the Moon and Venus, not the lagna', () => {
    const d = analyseChartDoshas(girl).manglik;
    expect(d.fromLagna).toBe(false);     // Mars in the 11th from Kanya
    expect(d.fromMoon).toBe(true);       // 8th from Dhanu
    expect(d.fromVenus).toBe(true);      // same sign as Venus
    expect(d.intensity).toBe(2);
  });

  it('notes the girl’s Mars as debilitated and combust', () => {
    const d = analyseChartDoshas(girl).manglik;
    expect(d.cancellations.join(' ')).toMatch(/debilitated/);
    // Mars at Kataka 25.71°, 6.2° from the Sun — inside the 17° orb.
    const sep = Math.abs(GIRL_LON.Mars - GIRL_LON.Sun);
    expect(sep).toBeLessThan(17);
    expect(sep).toBeCloseTo(6.23, 1);
  });

  it('applies mutual cancellation and leaves both parties mitigated', () => {
    expect(report.layer2Doshas.mutualKuja.applies).toBe(true);
    expect(report.layer2Doshas.netA).toBe('mitigated');
    expect(report.layer2Doshas.netB).toBe('mitigated');
  });
});

describe('Layer 3 — the spec’s expected promise reading', () => {
  it('reads the boy’s 7th lord as exalted in a kendra, but combust', () => {
    const p = assessMarriagePromise(boy, false)!;
    expect(p.seventhLord).toBe('Mercury');
    // Kanya is both Mercury's own sign and its exaltation sign; exaltation
    // outranks, so the spec's looser "own sign" reads as exalted here.
    expect(p.seventhLordDignity).toBe('exalted');
    expect(p.seventhLordHouse).toBe(10);
    // §4.1: a combust 7th lord materially changes the reading and is invisible
    // to Layer 1. Mercury is 8.96° from the Sun against a 14° orb.
    expect(p.seventhLordCombust).toBe(true);
    expect(p.dimensions.find(d => d.key === 'seventhLord')!.band).toBe('supportive');
  });

  it('lets the boy’s navamsa overrule his rashi chart, per §4.2', () => {
    // The spec's §9 summary calls Party A "strong" on the strength of a D1-only
    // reading — 7th lord in own sign in a kendra. But §4.2 states that navamsa
    // dignity of the 7th lord *outranks* its rashi dignity, and Mercury is
    // debilitated in the navamsa (Meena). Applying the rule the spec gives, the
    // chart reads mixed rather than strong. The rule is followed over the
    // worked example's prose, because §4.2 is what §9's own summary omits.
    const p = assessMarriagePromise(boy, false)!;
    expect(p.seventhLordD9Dignity).toBe('debilitated');
    expect(p.dimensions.find(d => d.key === 'navamsa')!.band).toBe('testing');

    const supportive = p.dimensions.filter(d => d.band === 'supportive').length;
    const testing = p.dimensions.filter(d => d.band === 'testing').length;
    expect(supportive).toBe(testing);   // mixed overall, not strong
  });

  it('reads the boy as the stronger of the two charts regardless', () => {
    // Which is the substantive claim §9 is making: A is better disposed than B.
    const a = assessMarriagePromise(boy, false)!;
    const b = assessMarriagePromise(girl, true)!;
    const net = (p: typeof a) =>
      p.dimensions.filter(d => d.band === 'supportive').length
      - p.dimensions.filter(d => d.band === 'testing').length;
    expect(net(a)).toBeGreaterThan(net(b));
  });

  it('reads the girl weaker — 7th lord Jupiter in the 8th with Rahu in the 7th', () => {
    const p = assessMarriagePromise(girl, true)!;
    expect(p.seventhLord).toBe('Jupiter');
    expect(p.seventhLordHouse).toBe(8);
    expect(p.dimensions.find(d => d.key === 'seventhHouse')!.band).toBe('testing');
  });

  it('surfaces the girl’s navamsa lagna lord Saturn in own sign as a mitigant', () => {
    const p = assessMarriagePromise(girl, true)!;
    // D9 lagna is Makara and Saturn holds it in its own sign.
    expect(p.dimensions.find(d => d.key === 'navamsa')!.notes.join(' ')).toMatch(/Saturn/);
  });

  it('computes a Darakaraka for each chart', () => {
    expect(findDarakaraka(boy)!.planet).toBeTruthy();
    expect(findDarakaraka(girl)!.planet).toBeTruthy();
  });

  it('applies the arudha self/7th exception', () => {
    // Lord in the same sign as the house: distance 0, so the raw arudha is the
    // house itself and the 10th from it must be taken.
    expect(arudhaPada(3, 3)).toBe(0);
    // Lord 6 signs on: raw arudha lands on the 7th from the house.
    expect(arudhaPada(0, 6)).toBe(9);
    // An ordinary case passes straight through.
    expect(arudhaPada(0, 1)).toBe(2);
  });

  it('emits no total for the layer', () => {
    const p = assessMarriagePromise(boy, false)!;
    expect(p).not.toHaveProperty('score');
    expect(p).not.toHaveProperty('total');
  });
});

describe('Layer 4 — the spec’s expected synastry', () => {
  const syn = computeSynastry(boy, girl);

  it('names the node-on-7th-lord contact as defining', () => {
    // The girl's Ketu at Kanya 9.97° against the boy's 7th lord Mercury at
    // Kanya 8.45° — orb 1°31', the highest weight class.
    const lead = syn.defining[0];
    expect(lead.type).toBe('node on 7th lord');
    expect(lead.graha).toBe('Ketu');
    expect(lead.direction).toBe('b-to-a');
    expect(lead.orb).toBeCloseTo(1.51, 2);
    expect(formatOrb(lead.orb!)).toBe("1°31'");
  });

  it('decays that contact to ~0.775 at sigma 3.0', () => {
    // exp(-(1.5148/3)^2) = 0.7749. The spec rounds this to 0.78.
    expect(syn.defining[0].strength).toBeCloseTo(0.775, 3);
  });

  it('places the girl’s Moon in the boy’s 1st and the boy’s Moon in the girl’s 6th', () => {
    // Girl's Moon in Dhanu, boy's lagna Dhanu → his 1st.
    expect(((girl.moonRashi - boy.ascendantRashi! + 12) % 12) + 1).toBe(1);
    // Boy's Moon in Kumbha, girl's lagna Kanya → her 6th.
    expect(((boy.moonRashi - girl.ascendantRashi! + 12) % 12) + 1).toBe(6);
    // And the 6th-house placement is reported as adverse.
    const inSixth = syn.aToB.contacts.find(c => c.graha === 'Moon' && c.target === '6th house');
    expect(inSixth?.valence).toBe('adverse');
  });

  it('keeps the two directions separate and finds them asymmetric', () => {
    expect(syn.aToB.netValence).not.toBeCloseTo(syn.bToA.netValence, 2);
    expect(syn.asymmetric).toBe(true);
  });

  it('drops contacts below the strength floor rather than reporting them faintly', () => {
    for (const c of [...syn.aToB.contacts, ...syn.bToA.contacts]) {
      expect(c.strength).toBeGreaterThanOrEqual(0.15);
    }
  });
});

describe('the output contract', () => {
  it('emits no overall compatibility percentage or verdict', () => {
    expect(report).not.toHaveProperty('percent');
    expect(report).not.toHaveProperty('verdict');
    expect(report).not.toHaveProperty('totalObtained');
    expect(JSON.stringify(report)).not.toMatch(/"percent"/);
  });

  it('detects the spec’s two expected conflicts', () => {
    const codes = report.conflicts.map(c => c.code);
    expect(codes).toContain('layer1_strong_layer4_adverse');
    expect(codes).toContain('synastry_asymmetric');
  });

  it('reports the mutual dosha cancellation as a conflict entry', () => {
    expect(report.conflicts.map(c => c.code)).toContain('dosha_mutual_cancel');
  });

  it('synthesises across the layers in prose rather than a number', () => {
    expect(report.synthesis).toMatch(/Temperament: 29.5\/36/);
    expect(report.synthesis).toMatch(/conflicts were detected|conflict was detected/);
  });

  it('keeps all four layers addressable', () => {
    expect(report.layer1Temperament.kootas).toHaveLength(8);
    expect(report.layer2Doshas.a.doshas.length).toBeGreaterThan(0);
    expect(report.layer3Promise.a).not.toBeNull();
    expect(report.layer4Synastry.defining.length).toBeGreaterThan(0);
  });
});
