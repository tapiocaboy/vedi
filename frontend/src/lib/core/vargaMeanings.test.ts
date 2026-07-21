import { describe, it, expect } from 'vitest';
import { VARGA_PLAIN, VARGA_KARAKAS, karakaRoleFor, plainPlanetEffect, vargaVerdict } from './vargaMeanings';
import { analyzeExtraVargaHouse } from './vargaAnalysis';
import { EXTRA_VARGAS } from './vargas';
import type { VargaPlanet } from './vargas';

const planet = (name: string, rashi: number, dignity: string, retro = false) =>
  ({
    planet: name, longitude: 0, d1Rashi: 0, d1RashiName: '', d9Rashi: 0, d9RashiName: '',
    d9Dignity: 'neutral-sign', d10Rashi: 0, d10RashiName: '', d10Dignity: 'neutral-sign',
    isVargottama: false, isRetrograde: retro,
    divisions: { D7: { rashi, rashiName: '', dignity }, D2: { rashi, rashiName: '', dignity } },
  } as unknown as VargaPlanet);

describe('VARGA_PLAIN coverage', () => {
  it('covers every extra varga shown in the UI', () => {
    for (const v of EXTRA_VARGAS) {
      expect(VARGA_PLAIN[v.code], `missing plain meaning for ${v.code}`).toBeDefined();
    }
  });

  it('gives all twelve houses a meaning in every chart', () => {
    for (const [code, meaning] of Object.entries(VARGA_PLAIN)) {
      for (let h = 1; h <= 12; h++) {
        expect(meaning!.houses[h], `${code} house ${h}`).toBeTruthy();
      }
    }
  });

  it('says something different about the same house in different charts', () => {
    // The 5th means children in D7 and recklessness in D30 — if these collide
    // the whole plain-language layer is pointless.
    expect(VARGA_PLAIN.D7!.houses[5]).not.toBe(VARGA_PLAIN.D30!.houses[5]);
    expect(VARGA_PLAIN.D24!.houses[5]).not.toBe(VARGA_PLAIN.D7!.houses[5]);
  });

  it('avoids untranslated jargon in the reader-facing strings', () => {
    const jargon = /\b(varga|lagna|dusthana|kendra|trikona|bhava|rashi)\b/i;
    for (const [code, meaning] of Object.entries(VARGA_PLAIN)) {
      for (let h = 1; h <= 12; h++) {
        expect(meaning!.houses[h], `${code} h${h}`).not.toMatch(jargon);
      }
      expect(meaning!.question, `${code} question`).not.toMatch(jargon);
    }
  });
});

describe('VARGA_KARAKAS', () => {
  it('assigns a significator to every chart that has a plain meaning', () => {
    for (const code of Object.keys(VARGA_PLAIN)) {
      expect(VARGA_KARAKAS[code as keyof typeof VARGA_KARAKAS], code).toBeDefined();
    }
  });

  it('uses the classical significators', () => {
    expect(karakaRoleFor('D7', 'Jupiter')).toContain('children');
    expect(karakaRoleFor('D3', 'Mars')).toContain('courage');
    expect(karakaRoleFor('D12', 'Sun')).toContain('father');
    expect(karakaRoleFor('D12', 'Moon')).toContain('mother');
    expect(karakaRoleFor('D7', 'Saturn')).toBeNull();
  });
});

describe('plainPlanetEffect', () => {
  it('describes the planet without repeating the house meaning', () => {
    const e = plainPlanetEffect('Mars', 'exalted', false);
    expect(e).toContain('Mars brings energy');
    expect(e).toContain('full strength');
    // The house meaning is stated once, above the planet list.
    expect(e).not.toContain('children');
  });

  it('flags retrograde delivery', () => {
    expect(plainPlanetEffect('Saturn', 'debilitated', true)).toContain('second attempt');
    expect(plainPlanetEffect('Saturn', 'debilitated', false)).not.toContain('second attempt');
  });

  it('distinguishes a strong placement from a weak one', () => {
    expect(plainPlanetEffect('Venus', 'exalted', false)).toContain('unusually well');
    expect(plainPlanetEffect('Venus', 'debilitated', false)).toContain('sore spot');
  });

  it('tells the reader when the planet is the one that matters most here', () => {
    expect(plainPlanetEffect('Jupiter', 'exalted', false, 'D7')).toContain('key planet for this chart');
    expect(plainPlanetEffect('Jupiter', 'exalted', false, 'D7')).toContain('children and fertility');
    // A non-significator in the same chart gets no such claim.
    expect(plainPlanetEffect('Saturn', 'exalted', false, 'D7')).not.toContain('key planet');
  });
});

describe('vargaVerdict', () => {
  it('reads well-dignified planets in good houses as strong', () => {
    const v = vargaVerdict('D2', [
      { planet: 'Jupiter', dignity: 'exalted', house: 5 },
      { planet: 'Venus', dignity: 'own-sign', house: 11 },
    ]);
    expect(v.standing).toBe('strong');
    expect(v.headline).toBe(VARGA_PLAIN.D2!.verdicts.strong);
    // Jupiter is the money karaka, so it earns its own leading reason; Venus
    // then appears in the supporting list.
    expect(v.reasons[0]).toContain('wealth and abundance');
    expect(v.reasons.join(' ')).toContain('Venus');
  });

  it('reads afflicted planets in difficult houses as needing effort', () => {
    const v = vargaVerdict('D2', [
      { planet: 'Saturn', dignity: 'debilitated', house: 6 },
      { planet: 'Mars', dignity: 'enemy-sign', house: 8 },
      { planet: 'Rahu', dignity: 'neutral-sign', house: 12 },
    ]);
    expect(v.standing).toBe('needs-effort');
    // It must not read as a doom verdict.
    expect(v.summary).toContain('not a verdict of failure');
  });

  it('names the everyday area rather than the Sanskrit chart name', () => {
    expect(vargaVerdict('D7', []).headline.toLowerCase()).toContain('children');
    expect(vargaVerdict('D24', []).headline.toLowerCase()).toContain('stud');
  });

  it('weighs the chart karaka above an ordinary placement', () => {
    // Jupiter is the significator for children; the same dignity on a
    // non-significator must not move the verdict as far.
    const karaka = vargaVerdict('D7', [{ planet: 'Jupiter', dignity: 'exalted', house: 5 }]);
    const ordinary = vargaVerdict('D7', [{ planet: 'Mercury', dignity: 'exalted', house: 5 }]);
    expect(karaka.reasons[0]).toContain('children and fertility');
    expect(karaka.reasons[0]).toContain('single best sign this chart can show');
    expect(ordinary.reasons[0]).not.toContain('stands for');
  });

  it('leads with the karaka when it is afflicted, without predicting denial', () => {
    const v = vargaVerdict('D7', [{ planet: 'Jupiter', dignity: 'debilitated', house: 6 }]);
    expect(v.reasons[0]).toContain('matters more than any other placement');
    expect(v.reasons[0]).toContain('not to be denied outright');
  });

  it('reports the varga rising-sign ruler as the chart\'s anchor', () => {
    const v = vargaVerdict('D2', [{ planet: 'Mars', dignity: 'exalted', house: 4 }], 'Mars');
    expect(v.reasons.some(r => r.includes('anchors this whole chart'))).toBe(true);
  });

  it('does not restate a planet already explained by a more specific rule', () => {
    const v = vargaVerdict('D7', [{ planet: 'Jupiter', dignity: 'exalted', house: 5 }], 'Jupiter');
    // Jupiter is both karaka and anchor here; it must not then reappear in the
    // generic "also strongly placed" list.
    expect(v.reasons.filter(r => r.includes('also strongly placed'))).toHaveLength(0);
  });

  it('inverts the adversity chart, where strength means less trouble', () => {
    const v = vargaVerdict('D30', [
      { planet: 'Mercury', dignity: 'exalted', house: 1 },
      { planet: 'Venus', dignity: 'own-sign', house: 5 },
    ]);
    expect(v.standing).toBe('strong');
    // The old generic phrasing said "Weak spots is a well-supported area for
    // you", which is both ungrammatical and the reverse of the truth.
    expect(v.headline).toContain('well defended');
    expect(v.headline).not.toContain('Weak spots is');
    expect(v.reasons.join(' ')).toContain('resilience');
    expect(v.reasons.join(' ')).not.toContain('supports weak spots');
  });

  it('uses grammatical headlines for every chart in every band', () => {
    for (const meaning of Object.values(VARGA_PLAIN)) {
      for (const line of Object.values(meaning!.verdicts)) {
        expect(line).toBeTruthy();
        expect(line).not.toMatch(/\bs is a\b/); // "Weak spots is a ..."
      }
    }
  });

  it('says so plainly when nothing stands out', () => {
    const v = vargaVerdict('D2', [{ planet: 'Mercury', dignity: 'neutral-sign', house: 3 }]);
    expect(v.standing).toBe('workable');
    expect(v.reasons[0]).toContain('close to average');
  });
});

describe('analyzeExtraVargaHouse — plain output', () => {
  it('leads with what the box means, not with chart mechanics', () => {
    const a = analyzeExtraVargaHouse('D7', 'Saptamsa', 'Children & progeny', 4, 0, [
      planet('Mars', 4, 'exalted'),
    ]);
    expect(a.houseNumber).toBe(5);
    expect(a.plainChartName).toBe('Children chart');
    expect(a.reading).toBe(VARGA_PLAIN.D7!.houses[5]);
    expect(a.question).toContain('children');
  });

  it('tells the reader where to look when a house is empty', () => {
    const a = analyzeExtraVargaHouse('D2', 'Hora', 'Wealth & resources', 10, 0, []);
    expect(a.reading).toContain('No planet sits here');
    expect(a.reading).toContain('Saturn'); // ruler of Kumbha
    expect(a.reading).toContain('look at how');
  });

  it('explains the rising sign of the chart in plain terms', () => {
    const a = analyzeExtraVargaHouse('D4', 'Chaturthamsa', 'Property & fortune', 3, 3, []);
    expect(a.isLagna).toBe(true);
    expect(a.reading).toContain(VARGA_PLAIN.D4!.lagnaMeaning);
    expect(a.reading).toContain('home & property chart');
  });
});
