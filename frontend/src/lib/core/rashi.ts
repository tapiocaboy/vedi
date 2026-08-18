/** Rashi (Zodiac Sign) calculations — direct port of backend/src/core/rashi.py */

export const RASHIS = [
  'Mesha', 'Vrishabha', 'Mithuna', 'Kataka',
  'Simha', 'Kanya', 'Tula', 'Vrischika',
  'Dhanu', 'Makara', 'Kumbha', 'Meena',
] as const;

export const RASHI_ENGLISH = [
  'Aries','Taurus','Gemini','Cancer',
  'Leo','Virgo','Libra','Scorpio',
  'Sagittarius','Capricorn','Aquarius','Pisces',
] as const;

/** Sinhala (Sanskrit-derived) rashi names, index-aligned with RASHIS. */
export const RASHI_SI = [
  'මේෂ', 'වෘෂභ', 'මිථුන', 'කටක',
  'සිංහ', 'කන්‍යා', 'තුලා', 'වෘශ්චික',
  'ධනු', 'මකර', 'කුම්භ', 'මීන',
] as const;

/** Tamil (Sanskrit-derived) rashi names, index-aligned with RASHIS. */
export const RASHIS_TA = [
  'மேஷம்', 'ரிஷபம்', 'மிதுனம்', 'கடகம்',
  'சிம்மம்', 'கன்னி', 'துலாம்', 'விருச்சிகம்',
  'தனுசு', 'மகரம்', 'கும்பம்', 'மீனம்',
] as const;

/** Chinese zodiac-sign names, the standard terms used regardless of sidereal/tropical framing. */
export const RASHIS_ZH = [
  '白羊座', '金牛座', '双子座', '巨蟹座',
  '狮子座', '处女座', '天秤座', '天蝎座',
  '射手座', '摩羯座', '水瓶座', '双鱼座',
] as const;

/** Hindi (Sanskrit-derived) rashi names, index-aligned with RASHIS. */
export const RASHIS_HI = [
  'मेष', 'वृषभ', 'मिथुन', 'कर्क',
  'सिंह', 'कन्या', 'तुला', 'वृश्चिक',
  'धनु', 'मकर', 'कुंभ', 'मीन',
] as const;

/** Japanese zodiac-sign names — no native Vedic tradition, so the standard Western-derived terms. */
export const RASHIS_JA = [
  '牡羊座', '牡牛座', '双子座', '蟹座',
  '獅子座', '乙女座', '天秤座', '蠍座',
  '射手座', '山羊座', '水瓶座', '魚座',
] as const;

/** Korean zodiac-sign names — no native Vedic tradition, so the standard Western-derived terms. */
export const RASHIS_KO = [
  '양자리', '황소자리', '쌍둥이자리', '게자리',
  '사자자리', '처녀자리', '천칭자리', '전갈자리',
  '사수자리', '염소자리', '물병자리', '물고기자리',
] as const;

/** Arabic zodiac-sign names. */
export const RASHIS_AR = [
  'الحمل', 'الثور', 'الجوزاء', 'السرطان',
  'الأسد', 'العذراء', 'الميزان', 'العقرب',
  'القوس', 'الجدي', 'الدلو', 'الحوت',
] as const;

/** Malayalam rashi names — the same Sanskrit-derived terms Kerala's own calendar months use. */
export const RASHIS_ML = [
  'മേടം', 'ഇടവം', 'മിഥുനം', 'കർക്കടകം',
  'ചിങ്ങം', 'കന്നി', 'തുലാം', 'വൃശ്ചികം',
  'ധനു', 'മകരം', 'കുംഭം', 'മീനം',
] as const;

export const RASHI_LORDS: Record<string, string> = {
  Mesha:'Mars', Vrishabha:'Venus', Mithuna:'Mercury', Kataka:'Moon',
  Simha:'Sun', Kanya:'Mercury', Tula:'Venus', Vrischika:'Mars',
  Dhanu:'Jupiter', Makara:'Saturn', Kumbha:'Saturn', Meena:'Jupiter',
};

export const RASHI_ELEMENTS: Record<string, string> = {
  Mesha:'Fire', Vrishabha:'Earth', Mithuna:'Air', Kataka:'Water',
  Simha:'Fire', Kanya:'Earth', Tula:'Air', Vrischika:'Water',
  Dhanu:'Fire', Makara:'Earth', Kumbha:'Air', Meena:'Water',
};

export const RASHI_MODALITIES: Record<string, string> = {
  Mesha:'Movable', Vrishabha:'Fixed', Mithuna:'Dual', Kataka:'Movable',
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
