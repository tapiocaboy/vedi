/** Rashi (Zodiac Sign) calculations — direct port of backend/src/core/rashi.py */

export const RASHIS = [
  'Mesha', 'Vrishabha', 'Mithuna', 'Karka',
  'Simha', 'Kanya', 'Tula', 'Vrischika',
  'Dhanu', 'Makara', 'Kumbha', 'Meena',
] as const;

export const RASHI_ENGLISH = [
  'Aries','Taurus','Gemini','Cancer',
  'Leo','Virgo','Libra','Scorpio',
  'Sagittarius','Capricorn','Aquarius','Pisces',
] as const;

export const RASHI_LORDS: Record<string, string> = {
  Mesha:'Mars', Vrishabha:'Venus', Mithuna:'Mercury', Karka:'Moon',
  Simha:'Sun', Kanya:'Mercury', Tula:'Venus', Vrischika:'Mars',
  Dhanu:'Jupiter', Makara:'Saturn', Kumbha:'Saturn', Meena:'Jupiter',
};

export const RASHI_ELEMENTS: Record<string, string> = {
  Mesha:'Fire', Vrishabha:'Earth', Mithuna:'Air', Karka:'Water',
  Simha:'Fire', Kanya:'Earth', Tula:'Air', Vrischika:'Water',
  Dhanu:'Fire', Makara:'Earth', Kumbha:'Air', Meena:'Water',
};

export const RASHI_MODALITIES: Record<string, string> = {
  Mesha:'Movable', Vrishabha:'Fixed', Mithuna:'Dual', Karka:'Movable',
  Simha:'Fixed', Kanya:'Dual', Tula:'Movable', Vrischika:'Fixed',
  Dhanu:'Dual', Makara:'Movable', Kumbha:'Fixed', Meena:'Dual',
};

export function getRashi(siderealLon: number): [number, string, number] {
  const lon = ((siderealLon % 360) + 360) % 360;
  const idx = Math.floor(lon / 30);
  return [idx, RASHIS[idx], lon % 30];
}

export function getRashiInfo(rashiIndex: number) {
  const name = RASHIS[rashiIndex];
  return {
    index: rashiIndex,
    name,
    english: RASHI_ENGLISH[rashiIndex],
    lord: RASHI_LORDS[name],
    element: RASHI_ELEMENTS[name],
    modality: RASHI_MODALITIES[name],
  };
}

export function getOppositRashi(idx: number): number { return (idx + 6) % 12; }
export function getTrineRashis(idx: number): number[] { return [idx, (idx+4)%12, (idx+8)%12]; }
export function getSquareRashis(idx: number): number[] { return [(idx+3)%12, (idx+9)%12]; }
