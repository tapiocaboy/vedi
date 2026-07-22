import { HOUSE_DATA, RASHI_LORDS, getDignity } from './planetaryAnalysis';
import { RASHIS, RASHI_ENGLISH } from '../../types/astrology';
import { type Lang, pick, planetName } from './i18n';
import { SIG_TEXT } from './text/predictionVocab';
import { HOUSE_DISPLAY } from './text/planetaryText';
import { HOUSE_LORD_IN_HOUSE, NOTABLE_COMBOS, HOUSE_FRAMES } from './text/houseText';

export { HOUSE_DATA };

// ─── Public API ────────────────────────────────────────────────────────────

export interface HouseAnalysis {
  houseNumber: number;
  rashiIndex: number;
  rashiName: string;
  rashiEnglish: string;
  houseData: typeof HOUSE_DATA[1];
  rashiLord: string;
  lordDignity: ReturnType<typeof getDignity>;
  lordHouse: number;
  lordHouseDesc: string;
  planetsInHouse: string[];
  planetEffects: Array<{ planet: string; effect: string; isRetrograde: boolean }>;
  combinationEffect: string | null;
  isAscendant: boolean;
  isEmpty: boolean;
}

/** Localised planet-combination reading for the planets sharing a house. */
function planetCombinationEffect(planetNames: string[], houseNumber: number, lang: Lang): string | null {
  if (planetNames.length < 2) return null;
  const sorted = [...planetNames].sort();
  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      const combo = NOTABLE_COMBOS[`${sorted[i]}-${sorted[j]}`] ?? NOTABLE_COMBOS[`${sorted[j]}-${sorted[i]}`];
      if (combo) return pick(combo, lang);
    }
  }
  if (planetNames.length >= 3) {
    const areaName = lang === 'si' ? pick(HOUSE_DISPLAY[houseNumber].theme, lang) : (HOUSE_DATA[houseNumber]?.name ?? 'this area');
    return HOUSE_FRAMES.stellium(planetNames.length, areaName, lang);
  }
  return null;
}

export function analyzeHouse(
  houseNumber: number,
  ascendantRashiIndex: number,
  planets: Array<{ planet: string; rashiIndex: number; isRetrograde: boolean }>,
  allPlanetRashiMap: Record<string, number>,
  lang: Lang = 'en',
): HouseAnalysis {
  const rashiIndex = (ascendantRashiIndex + houseNumber - 1) % 12;
  // rashiName stays the canonical Sanskrit form; UI callers localise it via
  // labelRashi. natal.ts localises through the rashiIndex instead.
  const rashiName: string = RASHIS[rashiIndex] ?? '';
  const rashiEnglish: string = (RASHI_ENGLISH as readonly string[])[rashiIndex] ?? '';
  const houseData = HOUSE_DATA[houseNumber] ?? HOUSE_DATA[1];
  const rashiLord = RASHI_LORDS[rashiIndex] ?? 'Unknown';
  const rashiLordLabel = planetName(rashiLord, lang);

  // Where is the rashi lord placed?
  const lordRashiIndex = allPlanetRashiMap[rashiLord] ?? -1;
  const lordHouse = lordRashiIndex >= 0
    ? ((lordRashiIndex - ascendantRashiIndex + 12) % 12) + 1
    : 0;
  const lordDignity = lordRashiIndex >= 0 ? getDignity(rashiLord, lordRashiIndex) : 'neutral-sign';

  const lordDesc = HOUSE_LORD_IN_HOUSE[houseNumber]?.[lordHouse];
  const lordHouseDesc = lordDesc
    ? pick(lordDesc, lang)
    : HOUSE_FRAMES.lordFallback(rashiLordLabel, houseNumber, lordHouse, lang);

  // Planets in this house
  const planetsInHouse = planets
    .filter(p => p.rashiIndex === rashiIndex && p.planet !== 'ASCENDANT')
    .map(p => p.planet);

  const houseTheme = pick(HOUSE_DISPLAY[houseNumber].theme, lang).toLowerCase();
  const planetEffects = planetsInHouse.map(pName => {
    const sig = SIG_TEXT[pName];
    const keywords = sig ? (lang === 'si' ? sig.keywords.si : sig.keywords.en).slice(0, 3).join(', ') : '';
    const isRetro = planets.find(p => p.planet === pName)?.isRetrograde ?? false;
    return {
      planet: pName,
      isRetrograde: isRetro,
      effect: HOUSE_FRAMES.planetEffect(planetName(pName, lang), keywords, houseTheme, isRetro, lang),
    };
  });

  const combinationEffect = planetEffects.length >= 2
    ? planetCombinationEffect(planetsInHouse, houseNumber, lang)
    : null;

  return {
    houseNumber,
    rashiIndex,
    rashiName,
    rashiEnglish,
    houseData,
    rashiLord,
    lordDignity,
    lordHouse,
    lordHouseDesc,
    planetsInHouse,
    planetEffects,
    combinationEffect,
    isAscendant: rashiIndex === ascendantRashiIndex,
    isEmpty: planetsInHouse.length === 0,
  };
}
