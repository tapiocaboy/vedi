/** Nakshatra (Lunar Mansion) calculations — direct port of backend/src/core/nakshatra.py */

export const NAKSHATRAS: [string, string][] = [
  ['Ashwini','Ketu'],['Bharani','Venus'],['Krittika','Sun'],
  ['Rohini','Moon'],['Mrigashira','Mars'],['Ardra','Rahu'],
  ['Punarvasu','Jupiter'],['Pushya','Saturn'],['Ashlesha','Mercury'],
  ['Magha','Ketu'],['Purva Phalguni','Venus'],['Uttara Phalguni','Sun'],
  ['Hasta','Moon'],['Chitra','Mars'],['Swati','Rahu'],
  ['Vishakha','Jupiter'],['Anuradha','Saturn'],['Jyeshtha','Mercury'],
  ['Mula','Ketu'],['Purva Ashadha','Venus'],['Uttara Ashadha','Sun'],
  ['Shravana','Moon'],['Dhanishta','Mars'],['Shatabhisha','Rahu'],
  ['Purva Bhadrapada','Jupiter'],['Uttara Bhadrapada','Saturn'],['Revati','Mercury'],
];

export const NAKSHATRA_SPAN = 360 / 27;
export const PADA_SPAN = NAKSHATRA_SPAN / 4;

export const NAKSHATRA_DEITIES = [
  'Ashwini Kumaras','Yama','Agni','Brahma','Soma','Rudra','Aditi','Brihaspati',
  'Nagas','Pitris','Bhaga','Aryaman','Savitar','Vishwakarma','Vayu','Indra-Agni',
  'Mitra','Indra','Nirriti','Apas','Vishvadevas','Vishnu','Vasus','Varuna',
  'Aja Ekapada','Ahir Budhnya','Pushan',
];

export const NAKSHATRA_SYMBOLS = [
  "Horse's head","Yoni/Elephant","Razor/Flame","Cart/Chariot","Deer's head",
  "Teardrop/Diamond","Bow/Quiver","Flower/Circle","Serpent/Wheel","Royal throne",
  "Front legs of bed","Back legs of bed","Hand/Fist","Bright jewel/Pearl","Coral/Sword",
  "Triumphal arch","Lotus","Circular amulet","Roots/Lion's tail","Elephant tusk/Fan",
  "Elephant tusk/Planks","Ear/Three footprints","Drum/Flute","Empty circle",
  "Front of funeral cot","Back of funeral cot","Fish/Drum",
];

export const NAKSHATRA_GANAS = [
  'Deva','Manushya','Rakshasa','Deva','Deva','Manushya','Deva','Deva',
  'Rakshasa','Rakshasa','Manushya','Manushya','Deva','Rakshasa','Deva',
  'Rakshasa','Deva','Rakshasa','Rakshasa','Manushya','Manushya','Deva',
  'Rakshasa','Rakshasa','Manushya','Manushya','Deva',
];

export interface NakshatraData {
  index: number;
  name: string;
  lord: string;
  pada: number;
  degree: number;
  deity: string;
  symbol: string;
  gana: string;
}

export function getNakshatra(siderealLon: number): NakshatraData {
  const lon = ((siderealLon % 360) + 360) % 360;
  const idx = Math.min(Math.floor(lon / NAKSHATRA_SPAN), 26);
  const deg = lon % NAKSHATRA_SPAN;
  const pada = Math.min(Math.floor(deg / PADA_SPAN) + 1, 4);
  return {
    index: idx,
    name: NAKSHATRAS[idx][0],
    lord: NAKSHATRAS[idx][1],
    pada,
    degree: deg,
    deity: NAKSHATRA_DEITIES[idx],
    symbol: NAKSHATRA_SYMBOLS[idx],
    gana: NAKSHATRA_GANAS[idx],
  };
}

export function getNakshatraInfo(idx: number) {
  return {
    index: idx,
    name: NAKSHATRAS[idx][0],
    lord: NAKSHATRAS[idx][1],
    deity: NAKSHATRA_DEITIES[idx],
    symbol: NAKSHATRA_SYMBOLS[idx],
    gana: NAKSHATRA_GANAS[idx],
  };
}

export function getNakshatraByMoon(moonLon: number): NakshatraData {
  return getNakshatra(moonLon);
}
