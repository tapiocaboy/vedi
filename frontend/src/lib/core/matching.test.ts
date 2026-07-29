/**
 * Layer 1 and Layer 2 unit tests.
 *
 * The asymmetric kootas get explicit swap tests, because a symmetric
 * approximation of Varna, Vashya or Gana agrees with the real table on the
 * diagonal and quietly disagrees everywhere else — which is exactly the shape of
 * bug that survives a test suite that only ever checks one direction.
 */

import { describe, it, expect } from 'vitest';
import {
  computeGunaMilan, analyseChartDoshas, analyseManglik, mutualKujaCancellation,
  vashyaOf, planetRelation, mutualFriends, GUNA_GATE_THRESHOLD,
  type MatchInput,
} from './matching';

function person(moonRashi: number, moonNakshatra: number, extra: Partial<MatchInput> = {}): MatchInput {
  return {
    moonRashi, moonNakshatra,
    marsHouseFromLagna: 5, marsHouseFromMoon: 5,
    ...extra,
  };
}

describe('Layer 1 — structure and gate', () => {
  it('returns eight kootas with their declared maxima', () => {
    const r = computeGunaMilan(person(0, 0), person(4, 10));
    expect(r.kootas).toHaveLength(8);
    const maxes = [1, 2, 3, 4, 5, 6, 7, 8];
    r.kootas.forEach((k, i) => {
      expect(k.max).toBe(maxes[i]);
      expect(k.obtained).toBeGreaterThanOrEqual(0);
      expect(k.obtained).toBeLessThanOrEqual(k.max);
    });
  });

  it('emits a gate rather than a verdict or a percentage', () => {
    const r = computeGunaMilan(person(0, 0), person(4, 10));
    expect(['GATE_PASS', 'GATE_FAIL']).toContain(r.gate);
    // The spec is explicit: no single compatibility scalar leaves this layer.
    expect(r).not.toHaveProperty('verdict');
    expect(r).not.toHaveProperty('percent');
  });

  it('gates at 18', () => {
    expect(GUNA_GATE_THRESHOLD).toBe(18);
    const r = computeGunaMilan(person(3, 6), person(3, 6));
    expect(r.total).toBeGreaterThanOrEqual(18);
    expect(r.gate).toBe('GATE_PASS');
  });

  it('scores identical charts 36/36 — Janma tara is auspicious in this table', () => {
    // Only taras 3, 5 and 7 are inauspicious, so tara 1 both ways scores full.
    const r = computeGunaMilan(person(3, 6), person(3, 6));
    expect(r.kootas.find(k => k.name === 'Tara')!.obtained).toBe(3);
    expect(r.total).toBe(36);
  });
});

describe('Layer 1 — Varna', () => {
  it('passes when the first party ranks at least as high', () => {
    // Kataka (Brahmin, 4) against Kumbha (Shudra, 1).
    expect(computeGunaMilan(person(3, 0), person(10, 0)).kootas[0].obtained).toBe(1);
  });

  it('is asymmetric — the swap fails', () => {
    expect(computeGunaMilan(person(10, 0), person(3, 0)).kootas[0].obtained).toBe(0);
  });
});

describe('Layer 1 — Vashya', () => {
  it('splits Dhanu at 15°', () => {
    expect(vashyaOf(8, 3)).toBe('Manava');
    expect(vashyaOf(8, 20)).toBe('Chatushpada');
  });

  it('splits Makara at 15°', () => {
    expect(vashyaOf(9, 3)).toBe('Chatushpada');
    expect(vashyaOf(9, 20)).toBe('Jalachara');
  });

  it('changes the score when only the Moon’s degree moves', () => {
    // A degree-blind implementation returns the same score for both of these.
    const early = computeGunaMilan(person(8, 18, { moonDegreeInSign: 3 }), person(0, 0));
    const late = computeGunaMilan(person(8, 18, { moonDegreeInSign: 20 }), person(0, 0));
    expect(early.kootas[1].obtained).toBe(0.5);  // Manava → Chatushpada
    expect(late.kootas[1].obtained).toBe(2);     // Chatushpada → Chatushpada
  });

  it('is asymmetric — Manava/Chatushpada differs by direction', () => {
    const manavaBoy = computeGunaMilan(person(2, 0), person(0, 0)).kootas[1].obtained;
    const chatushpadaBoy = computeGunaMilan(person(0, 0), person(2, 0)).kootas[1].obtained;
    expect(manavaBoy).toBe(0.5);
    expect(chatushpadaBoy).toBe(1);
  });
});

describe('Layer 1 — Tara', () => {
  it('treats only 3, 5 and 7 as inauspicious', () => {
    // Nakshatras 4 apart → taras 5 and 6: one inauspicious, one not.
    const r = computeGunaMilan(person(0, 22), person(0, 18));
    const tara = r.kootas.find(k => k.name === 'Tara')!;
    expect(tara.detail!.taraForward).toBe(5);
    expect(tara.detail!.taraReverse).toBe(6);
    expect(tara.obtained).toBe(1.5);
  });
});

describe('Layer 1 — Yoni', () => {
  it('scores identical yonis 4', () => {
    // Rohini and Mrigashira are both Sarpa.
    expect(computeGunaMilan(person(0, 3), person(0, 4)).kootas[3].obtained).toBe(4);
  });

  it('scores an attested bitter pair 0', () => {
    // Uttara Phalguni (Gau) against Chitra (Vyaghra).
    const k = computeGunaMilan(person(0, 11), person(0, 13)).kootas[3];
    expect(k.obtained).toBe(0);
    expect(k.detail!.provenance).toBe('attested');
  });

  it('defaults an unlisted cross pair to neutral 2', () => {
    // Dhanishta (Simha) against Mula (Shwan) — predator/predator, unlisted.
    const k = computeGunaMilan(person(0, 22), person(0, 18)).kootas[3];
    expect(k.obtained).toBe(2);
    expect(k.detail!.band).toBe('neutral');
  });

  it('reports gender polarity inversion as a flag, not a score change', () => {
    // Boy Krittika (Mesha, F) · girl Pushya (Mesha, M) — same yoni, inverted.
    const r = computeGunaMilan(person(0, 2), person(0, 7));
    expect(r.kootas[3].obtained).toBe(4);
    expect(r.flags.join(' ')).toMatch(/polarity is inverted/);
  });
});

describe('Layer 1 — Gana', () => {
  it('is asymmetric across Manushya and Rakshasa', () => {
    // Bharani is Manushya, Krittika is Rakshasa.
    const rakshasaBoy = computeGunaMilan(person(0, 2), person(0, 1)).kootas[5];
    const manushyaBoy = computeGunaMilan(person(0, 1), person(0, 2)).kootas[5];
    expect(rakshasaBoy.detail!.rawScore).toBe(3);
    expect(manushyaBoy.detail!.rawScore).toBe(0);
  });

  it('is asymmetric across Deva and Rakshasa', () => {
    // Ashwini is Deva, Krittika is Rakshasa.
    expect(computeGunaMilan(person(0, 0), person(0, 2)).kootas[5].detail!.rawScore).toBe(1);
    expect(computeGunaMilan(person(0, 2), person(0, 0)).kootas[5].detail!.rawScore).toBe(0);
  });

  it('cancels the shortfall when the Moon-sign lords are mutual friends', () => {
    // Simha (Sun) and Dhanu (Jupiter) are mutual naisargika friends. Magha is
    // Rakshasa and Purva Ashadha Manushya, so the raw score is the asymmetric 3.
    const k = computeGunaMilan(
      person(4, 9, { moonNakshatraLord: 'Ketu' }),
      person(8, 19, { moonNakshatraLord: 'Venus' }),
    ).kootas[5];
    expect(k.detail!.rawScore).toBe(3);
    expect(k.obtained).toBe(6);
    expect(k.detail!.cancelled).toBe(true);
  });

  it('cancels when both Moons share a navamsa', () => {
    const k = computeGunaMilan(
      person(0, 2, { moonNavamsa: 4 }),
      person(0, 1, { moonNavamsa: 4 }),
    ).kootas[5];
    expect(k.obtained).toBe(6);
  });
});

describe('Layer 1 — Bhakoot', () => {
  it('scores the benign axes 7', () => {
    for (const [a, b] of [[0, 0], [0, 2], [0, 3], [0, 6]]) {
      expect(computeGunaMilan(person(a, 0), person(b, 0)).kootas[6].obtained).toBe(7);
    }
  });

  it('scores 6/8, 2/12 and 5/9 as zero absent cancellation', () => {
    // Mars-ruled Mesha against Saturn-ruled Makara: 5 apart → 6/8, lords unfriendly.
    const k = computeGunaMilan(
      person(0, 0, { moonNakshatraLord: 'Ketu' }),
      person(5, 12, { moonNakshatraLord: 'Sun' }),
    ).kootas[6];
    expect(k.obtained).toBe(0);
    expect(k.detail!.axis).toBe('6/8');
  });

  it('cancels when the two Moon signs share a lord', () => {
    // Mesha and Vrischika are both Mars-ruled and sit 8 apart → 6/8 axis.
    const k = computeGunaMilan(person(0, 0), person(7, 16)).kootas[6];
    expect(k.detail!.adverse).toBe(true);
    expect(k.detail!.cancelled).toBe(true);
    expect(k.obtained).toBe(7);
  });

  it('cancels when both Moons share a nakshatra lord', () => {
    const k = computeGunaMilan(
      person(0, 0, { moonNakshatraLord: 'Ketu' }),
      person(5, 9, { moonNakshatraLord: 'Ketu' }),
    ).kootas[6];
    expect(k.obtained).toBe(7);
  });
});

describe('Layer 1 — Nadi', () => {
  it('scores different nadi 8', () => {
    // Ashwini is Adi, Bharani is Madhya.
    expect(computeGunaMilan(person(0, 0), person(2, 1)).kootas[7].obtained).toBe(8);
  });

  it('scores the same nadi 0 absent any cancellation', () => {
    // Ashwini and Ardra are both Adi, different rashis and nakshatras.
    const k = computeGunaMilan(
      person(0, 0, { moonNakshatraLord: 'Ketu', moonPada: 1 }),
      person(2, 5, { moonNakshatraLord: 'Rahu', moonPada: 2 }),
    ).kootas[7];
    expect(k.obtained).toBe(0);
  });

  it('cancels on same rashi with different nakshatras', () => {
    // Both in Mesha: Ashwini (Adi) and Bharani would differ in nadi, so use
    // Ashwini and a same-nadi star that also falls in Mesha's span — Ashwini and
    // Ardra share Adi, so force the rashi equal to exercise the rule.
    const k = computeGunaMilan(
      person(0, 0, { moonPada: 1 }),
      person(0, 5, { moonPada: 2 }),
    ).kootas[7];
    expect(k.obtained).toBe(8);
    expect(k.detail!.cancelled).toBe(true);
  });

  it('cancels on same nakshatra with different padas', () => {
    const k = computeGunaMilan(
      person(0, 0, { moonPada: 1 }),
      person(2, 0, { moonPada: 3 }),
    ).kootas[7];
    expect(k.obtained).toBe(8);
  });

  it('cancels when the nakshatra lords are mutual friends', () => {
    // Ardra (Rahu) and Shatabhisha (Rahu) are both Adi; identical lords count as friends.
    const k = computeGunaMilan(
      person(2, 5, { moonNakshatraLord: 'Rahu', moonPada: 1 }),
      person(10, 23, { moonNakshatraLord: 'Rahu', moonPada: 2 }),
    ).kootas[7];
    expect(k.obtained).toBe(8);
  });
});

describe('naisargika relationships', () => {
  it('is asymmetric where the classical table is', () => {
    // Mercury counts Venus a friend; Venus counts Mercury a friend too, but
    // Sun/Mercury is the asymmetric case: Sun neutral to Mercury, Mercury friendly to Sun.
    expect(planetRelation('Mercury', 'Sun')).toBe('friend');
    expect(planetRelation('Sun', 'Mercury')).toBe('neutral');
    expect(mutualFriends('Sun', 'Mercury')).toBe(false);
    // The Moon counts Mercury a friend, but Mercury counts the Moon an enemy —
    // so this pair is not mutual, and the cancellations that turn on mutual
    // friendship must not fire for it.
    expect(planetRelation('Moon', 'Mercury')).toBe('friend');
    expect(planetRelation('Mercury', 'Moon')).toBe('enemy');
    expect(mutualFriends('Moon', 'Mercury')).toBe(false);
    // Sun and Jupiter are genuinely mutual.
    expect(mutualFriends('Sun', 'Jupiter')).toBe(true);
  });
});

describe('Layer 2 — Kuja dosha', () => {
  const chart = (marsRashi: number, extra: Partial<MatchInput> = {}): MatchInput => ({
    moonRashi: 0, moonNakshatra: 0,
    marsHouseFromLagna: 7, marsHouseFromMoon: 5,
    ascendantRashi: 0,
    planetRashis: { Mars: marsRashi, Venus: 4, Jupiter: 2, Saturn: 6, Rahu: 8, Ketu: 2 },
    ...extra,
  });

  it('includes the 2nd house among the afflicting houses', () => {
    const d = analyseManglik({
      moonRashi: 0, moonNakshatra: 0, marsHouseFromLagna: 2, marsHouseFromMoon: 5,
      planetRashis: { Mars: 4, Venus: 0 },
    });
    expect(d.fromLagna).toBe(true);
  });

  it('applies the sign exemption for the 7th in Makara', () => {
    // Mars in Makara in the 7th is exempt, and exalted besides.
    const d = analyseManglik({
      moonRashi: 0, moonNakshatra: 0, marsHouseFromLagna: 7, marsHouseFromMoon: 5,
      planetRashis: { Mars: 9, Venus: 0 },
    });
    expect(d.fromLagna).toBe(false);
    expect(d.exemptions.join(' ')).toMatch(/sign-exempt/);
  });

  it('grades by how many reference points fire', () => {
    const one = analyseManglik(chart(4));
    expect(one.intensity).toBeGreaterThanOrEqual(1);
    const three = analyseManglik({
      moonRashi: 0, moonNakshatra: 0, marsHouseFromLagna: 7, marsHouseFromMoon: 4,
      planetRashis: { Mars: 4, Venus: 4 },
    });
    expect(three.intensity).toBe(3);
  });

  it('counts a debilitated Mars as a reduction', () => {
    const d = analyseManglik(chart(3));
    expect(d.cancellations.join(' ')).toMatch(/debilitated/);
  });

  it('counts a Saturn aspect as a cancellation, not only Jupiter', () => {
    // Mars in Mithuna (no dignity cancellation of its own); Saturn in Mesha is
    // 3 signs away, which is one of Saturn's special aspects.
    const d = analyseManglik({
      moonRashi: 0, moonNakshatra: 0, marsHouseFromLagna: 4, marsHouseFromMoon: 5,
      planetRashis: { Mars: 2, Venus: 0, Saturn: 0, Jupiter: 5 },
    });
    expect(d.cancellations.join(' ')).toMatch(/Saturn aspects Mars/);
  });

  it('emits a three-band severity and no numeric score', () => {
    const r = analyseChartDoshas(chart(4));
    expect(['none', 'mitigated', 'active']).toContain(r.netSeverity);
    for (const d of r.doshas) expect(d).not.toHaveProperty('score');
  });

  it('cancels mutually when both charts carry the dosha', () => {
    const a = analyseManglik(chart(4));
    const b = analyseManglik(chart(4));
    expect(mutualKujaCancellation(a, b).applies).toBe(true);
  });

  it('does not cancel a one-sided dosha', () => {
    const afflicted = analyseManglik(chart(4));
    const clean = analyseManglik({
      moonRashi: 0, moonNakshatra: 0, marsHouseFromLagna: 3, marsHouseFromMoon: 3,
      planetRashis: { Mars: 2, Venus: 0 },   // Mars is 3rd from Venus, not afflicting
    });
    expect(afflicted.isManglik).toBe(true);
    expect(clean.isManglik).toBe(false);
    expect(mutualKujaCancellation(afflicted, clean).applies).toBe(false);
  });

  it('does not promote a node in the 7th to a named dosha', () => {
    // Rahu in the 7th is a real affliction but not a classical dosha. Emitting it
    // here made every such chart read "active", which then survived mutual Kuja
    // cancellation and reported a mitigated pair as afflicted. Layer 3 assesses
    // the 7th house's occupants instead.
    const r = analyseChartDoshas({
      moonRashi: 0, moonNakshatra: 0, marsHouseFromLagna: 3, marsHouseFromMoon: 3,
      ascendantRashi: 5, planetRashis: { Mars: 2, Venus: 0, Rahu: 11, Ketu: 5 },
    });
    expect(r.doshas.find(d => d.name.includes('in the 7th'))).toBeUndefined();
    expect(r.netSeverity).toBe('none');
  });
});
