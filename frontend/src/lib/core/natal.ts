/**
 * Natal Chart report builder.
 *
 * Assembles a full, click-to-expand natal reading from high-precision Swiss
 * Ephemeris positions. Every "line" (the Ascendant, the Moon's nakshatra, each
 * of the nine grahas, and each of the twelve bhavas) carries a plain-language
 * summary plus a stack of detailed sections, so tapping a line reveals an
 * understandable yet thorough prediction.
 *
 * The heavy astrological logic (dignity, Shadbala-style strength, Dig Bala,
 * functional nature, combustion, Neecha Bhanga, house lordship) is reused from
 * `planetaryAnalysis` and `houseAnalysis`; this module orchestrates them and
 * turns the raw analysis into readable prose.
 */

import { getPlanetPositions } from './ephemeris';
import type { BirthData } from '../../types/astrology';
import { RASHIS, RASHI_ENGLISH, RASHI_LORDS, RASHI_ELEMENTS, RASHI_MODALITIES } from './rashi';
import { getNakshatra } from './nakshatra';
import { getNakshatraItems } from './nakshatraInsights';
import { analyzePlanet } from './planetaryAnalysis';
import { analyzeHouse } from './houseAnalysis';
import { type Lang, pick, pickList, planetName, rashiName as siRashiName } from './i18n';
import { SIG_TEXT } from './text/predictionVocab';
import { HOUSE_DISPLAY } from './text/planetaryText';
import {
  LAGNA_TRAITS, NAK_ITEM_HEADING, H, NATAL,
  elementLabel, modalityLabel, houseOrdinal, houseOrdinalShort,
} from './text/natalText';

export type Tone = 'good' | 'bad' | 'neutral' | 'info';

export interface NatalBadge { label: string; tone: Tone; }
export interface NatalSection { heading: string; body?: string; bullets?: string[]; tone?: Tone; }

export interface NatalLine {
  id: string;
  group: 'lagna' | 'nakshatra' | 'planet' | 'house';
  icon: string;            // planet key ('SUN'…), or 'LAGNA' / 'STAR' / a house number
  title: string;
  subtitle: string;
  badges: NatalBadge[];
  summary: string;         // plain-language one/two-liner, always visible
  sections: NatalSection[]; // detailed reading, revealed on click
}

export interface NatalReport {
  meta: {
    ascendantName: string;
    ascendantEnglish: string;
    moonSign: string;
    moonNakshatra: string;
    ayanamsa: string;
    generatedAt: string;
  };
  lines: NatalLine[];
}

const PLANET_ORDER = ['SUN', 'MOON', 'MARS', 'MERCURY', 'JUPITER', 'VENUS', 'SATURN', 'RAHU', 'KETU'] as const;

function titleCase(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Localised keywords for a planet (for "what it governs" bullets). */
function localKeywords(planetKey: string, lang: Lang): string[] {
  const sig = SIG_TEXT[planetKey];
  if (!sig) return [];
  return lang === 'si' ? sig.keywords.si.slice() : sig.keywords.en.map(cap);
}

// ─── Badge helpers ───────────────────────────────────────────────────────────
function dignityTone(d: string): Tone {
  if (d === 'exalted' || d === 'own-sign' || d === 'friend-sign') return 'good';
  if (d === 'debilitated' || d === 'enemy-sign') return 'bad';
  return 'neutral';
}
function verdictTone(v: string): Tone {
  if (v === 'very-strong' || v === 'strong') return 'good';
  if (v === 'weak' || v === 'very-weak') return 'bad';
  return 'neutral';
}
function functionalTone(n: string): Tone {
  if (n === 'yogakaraka' || n === 'benefic') return 'good';
  if (n === 'malefic' || n === 'maraka') return 'bad';
  return 'neutral';
}

// ─── Line builders ───────────────────────────────────────────────────────────

function buildLagnaLine(ascRashi: number, lordHouse: number, lordDignityLabel: string, lang: Lang): NatalLine {
  const lordKey = RASHI_LORDS[RASHIS[ascRashi]];
  const lord = planetName(lordKey, lang);
  const element = RASHI_ELEMENTS[RASHIS[ascRashi]];
  const modality = RASHI_MODALITIES[RASHIS[ascRashi]];
  const elLabel = elementLabel(element, lang);
  const mLabel = modalityLabel(modality, lang);
  const english = RASHI_ENGLISH[ascRashi];
  const rashiLabel = lang === 'si' ? siRashiName(ascRashi, lang) : RASHIS[ascRashi];
  const lordHouseLabel = houseOrdinal(lordHouse, lang);
  return {
    id: 'lagna',
    group: 'lagna',
    icon: 'LAGNA',
    title: NATAL.lagnaTitle(english, rashiLabel, lang),
    subtitle: NATAL.lagnaSubtitle(lord, elLabel, mLabel, lang),
    badges: [
      { label: english, tone: 'info' },
      { label: elLabel, tone: 'info' },
      { label: NATAL.rulerBadge(lord, lang), tone: 'info' },
    ],
    summary: NATAL.lagnaSummary(english, mLabel, elLabel, lang),
    sections: [
      { heading: pick(H.risingSign, lang), body: pick(LAGNA_TRAITS[ascRashi], lang) },
      { heading: pick(H.elementMode, lang), body: NATAL.elementModeBody(element, modality, lang) },
      { heading: pick(H.chartRuler, lang), body: NATAL.chartRulerBody(lord, lordHouseLabel, lordDignityLabel, lang) },
    ],
  };
}

function buildNakshatraLine(moonLon: number, moonSign: number, lang: Lang): NatalLine {
  const nak = getNakshatra(moonLon);

  // Reuse the same rich, plain-language content as the Chart-tab nakshatra card
  // so both views stay consistent.
  const items = getNakshatraItems({
    index: nak.index, name: nak.name, lord: nak.lord, pada: nak.pada,
    degree: nak.degree, deity: nak.deity, symbol: nak.symbol, gana: nak.gana,
  }, lang);

  const sections: NatalSection[] = items.map(it => ({
    heading: NAK_ITEM_HEADING[it.key] ? pick(NAK_ITEM_HEADING[it.key], lang) : it.key,
    body: it.body,
    bullets: it.bullets,
  }));
  // Lead with how the nakshatra seeds the whole dasha timeline.
  sections.unshift({
    heading: pick(H.whyBirthStar, lang),
    body: NATAL.nakWhyBody(nak.name, nak.symbol, nak.deity, lang),
  });

  const rashiLabel = lang === 'si' ? siRashiName(moonSign, lang) : RASHIS[moonSign];
  return {
    id: 'nakshatra',
    group: 'nakshatra',
    icon: 'STAR',
    title: NATAL.nakTitle(nak.name, nak.pada, lang),
    subtitle: NATAL.nakSubtitle(nak.lord, rashiLabel, lang),
    badges: [
      { label: NATAL.nakLordBadge(nak.lord, lang), tone: 'info' },
      { label: NATAL.nakPadaBadge(nak.pada, lang), tone: 'info' },
      { label: nak.gana, tone: 'info' },
    ],
    summary: NATAL.nakSummary(lang),
    sections,
  };
}

interface PlanetCtx {
  rashiIndex: number;
  rashiDegree: number;
  longitude: number;
  isRetrograde: boolean;
}

function buildPlanetLine(
  planetUpper: string,
  p: PlanetCtx,
  ascRashi: number,
  context: { longitude: number; sunLongitude: number; signByPlanet: Record<string, number> },
  lang: Lang,
): NatalLine {
  const planetKey = titleCase(planetUpper); // 'Sun' — required for correct dignity lookup
  const a = analyzePlanet(planetKey, p.rashiIndex, ascRashi, p.isRetrograde, p.rashiDegree, context, lang);
  const planetLabel = planetName(planetKey, lang);
  const houseName = pick(HOUSE_DISPLAY[a.house].name, lang);
  const houseTheme = pick(HOUSE_DISPLAY[a.house].theme, lang);
  const houseRules = pickList(HOUSE_DISPLAY[a.house].rules, lang);
  const keywords = localKeywords(planetKey, lang);
  const rashiLabel = lang === 'si' ? siRashiName(p.rashiIndex, lang) : RASHIS[p.rashiIndex];

  const badges: NatalBadge[] = [
    { label: a.dignityInfo.label, tone: dignityTone(a.dignity) },
    { label: a.strength.verdictLabel, tone: verdictTone(a.strength.verdict) },
    { label: a.functional.label, tone: functionalTone(a.functional.nature) },
  ];
  if (a.isRetrograde) badges.push({ label: pick(NATAL.retrogradeBadge, lang), tone: 'info' });
  if (a.combustion?.isCombust) badges.push({ label: pick(NATAL.combustBadge, lang), tone: 'bad' });
  if (a.neechaBhanga?.cancelled) badges.push({ label: pick(NATAL.neechaBhangaBadge, lang), tone: 'good' });

  const sections: NatalSection[] = [];

  sections.push({
    heading: pick(H.whatItGoverns, lang),
    bullets: keywords.slice(0, 7),
  });

  if (a.placement) {
    sections.push({ heading: NATAL.whyMattersHeading(houseName, lang), body: a.placement.effect });
    if (a.placement.strengths.length) sections.push({ heading: pick(H.strengthsToLean, lang), tone: 'good', bullets: a.placement.strengths });
    if (a.placement.challenges.length) sections.push({ heading: pick(H.whatToWatch, lang), tone: 'bad', bullets: a.placement.challenges });
  } else {
    sections.push({
      heading: NATAL.inYourHouseHeading(houseName, lang),
      body: NATAL.inYourHouseBody(planetLabel, houseName, houseTheme, keywords.slice(0, 3).join(', '), houseRules.slice(0, 3).join(', '), lang),
    });
  }

  sections.push({ heading: pick(H.strengthInChart, lang), body: a.strength.summary });
  sections.push({ heading: pick(H.dignityRole, lang), body: NATAL.dignityRoleBody(a.dignityInfo.desc, a.functional.desc) });

  if (a.retrogradeEffect) {
    sections.push({ heading: pick(H.retrogradeEffect, lang), tone: 'info', body: a.retrogradeEffect.general });
  }
  if (a.combustion?.isCombust) {
    sections.push({ heading: pick(H.combustion, lang), tone: 'bad', body: a.combustion.desc });
  }
  if (a.neechaBhanga?.cancelled) {
    sections.push({ heading: pick(H.debilitationCancelled, lang), tone: 'good', body: a.neechaBhanga.desc });
  }
  if (a.gemstone || a.mantra) {
    const parts: string[] = [];
    const sig = SIG_TEXT[planetKey];
    if (a.gemstone) parts.push(NATAL.gemstoneLabel(sig ? pick(sig.gemstone, lang) : a.gemstone, lang));
    if (a.mantra) parts.push(NATAL.mantraLabel(sig ? pick(sig.mantra, lang) : a.mantra, lang));
    sections.push({ heading: pick(H.supportiveRemedy, lang), body: NATAL.supportiveRemedyBody(parts) });
  }

  return {
    id: `planet-${planetUpper}`,
    group: 'planet',
    icon: planetUpper,
    title: NATAL.planetTitle(planetLabel, rashiLabel, houseName, lang),
    subtitle: NATAL.planetSubtitle(RASHI_ENGLISH[p.rashiIndex], p.rashiDegree.toFixed(2), a.dignityInfo.label, a.isRetrograde, lang),
    badges,
    summary: NATAL.planetSummary(planetLabel, keywords.slice(0, 3).join(', '), houseName, a.strength.verdictLabel, a.functional.label, lang),
    sections,
  };
}

function buildHouseLine(
  houseNumber: number,
  ascRashi: number,
  planetsForHouse: Array<{ planet: string; rashiIndex: number; isRetrograde: boolean }>,
  signByPlanetTitle: Record<string, number>,
  lang: Lang,
): NatalLine {
  const h = analyzeHouse(houseNumber, ascRashi, planetsForHouse, signByPlanetTitle, lang);
  const houseName = pick(HOUSE_DISPLAY[houseNumber].name, lang);
  const houseTheme = pick(HOUSE_DISPLAY[houseNumber].theme, lang);
  const houseRules = pickList(HOUSE_DISPLAY[houseNumber].rules, lang);
  const rashiLordLabel = planetName(h.rashiLord, lang);
  const rashiLabel = lang === 'si' ? siRashiName(h.rashiIndex, lang) : h.rashiName;
  const houseLabel = houseOrdinal(houseNumber, lang);

  const sections: NatalSection[] = [];
  sections.push({ heading: pick(H.whatAreaCovers, lang), bullets: houseRules.map(r => lang === 'si' ? r : cap(r)) });
  sections.push({
    heading: pick(H.signOnHouse, lang),
    body: NATAL.signOnHouseBody(rashiLabel, h.rashiEnglish, houseLabel, rashiLordLabel, lang),
  });
  sections.push({
    heading: NATAL.whereRulerHeading(rashiLordLabel, lang),
    body: NATAL.whereRulerBody(h.lordHouseDesc, h.lordDignity, dignityTone(h.lordDignity) as 'good' | 'bad' | 'neutral', lang),
  });
  if (h.planetEffects.length) {
    sections.push({ heading: pick(H.planetsPlacedHere, lang), bullets: h.planetEffects.map(e => NATAL.planetHereBullet(planetName(titleCase(e.planet), lang), e.effect)) });
  } else {
    sections.push({ heading: pick(H.planetsPlacedHere, lang), body: NATAL.noPlanetBody(rashiLordLabel, lang) });
  }
  if (h.combinationEffect) {
    sections.push({ heading: pick(H.combinedEffect, lang), tone: 'info', body: h.combinationEffect });
  }

  const lordHouseOrd = houseOrdinalShort(h.lordHouse, lang) || pick(NATAL.emptyOrdinal, lang);
  const planetsLabel = h.planetsInHouse.length ? h.planetsInHouse.map(pl => planetName(titleCase(pl), lang)).join(', ') : null;
  const badges: NatalBadge[] = [
    { label: h.rashiEnglish, tone: 'info' },
    { label: NATAL.rulerHouseBadge(rashiLordLabel, lordHouseOrd, lang), tone: 'info' },
  ];
  if (h.planetsInHouse.length) badges.push({ label: NATAL.planetsCountBadge(h.planetsInHouse.length, lang), tone: 'neutral' });

  const summaryLordOrd = houseOrdinalShort(h.lordHouse, lang) || pick(NATAL.sameHouseWord, lang);
  return {
    id: `house-${houseNumber}`,
    group: 'house',
    icon: String(houseNumber),
    title: NATAL.houseTitle(houseName, houseTheme, lang),
    subtitle: NATAL.houseSubtitle(rashiLabel, rashiLordLabel, planetsLabel, lang),
    badges,
    summary: NATAL.houseSummary(houseName, houseRules.slice(0, 3).join(', '), rashiLabel, rashiLordLabel, summaryLordOrd, lang),
    sections,
  };
}

// ─── Main entry point ────────────────────────────────────────────────────────

export async function buildNatalReport(bd: BirthData, lang: Lang = 'en'): Promise<NatalReport> {
  const positions = await getPlanetPositions(bd.date, bd.latitude, bd.longitude, bd.timezone, bd.ayanamsa);
  const ascRashi = positions.ASCENDANT.rashi;

  // TitleCase sign map (planetaryAnalysis / houseAnalysis key dignity by 'Sun'…).
  const signByPlanetTitle: Record<string, number> = {};
  for (const name of PLANET_ORDER) signByPlanetTitle[titleCase(name)] = positions[name].rashi;

  const sunLongitude = positions.SUN.longitude;

  const lines: NatalLine[] = [];

  // 1) Ascendant — compute its ruler's house & dignity for the lagna line.
  const lordOfAsc = RASHI_LORDS[RASHIS[ascRashi]]; // 'Mars'…
  const lordUpper = PLANET_ORDER.find(n => titleCase(n) === lordOfAsc) ?? 'SUN';
  const lordRashi = positions[lordUpper].rashi;
  const lordHouse = ((lordRashi - ascRashi + 12) % 12) + 1;
  const lordAnalysis = analyzePlanet(lordOfAsc, lordRashi, ascRashi, positions[lordUpper].isRetrograde, positions[lordUpper].rashiDegree, undefined, lang);
  lines.push(buildLagnaLine(ascRashi, lordHouse, lordAnalysis.dignityInfo.label, lang));

  // 2) Moon nakshatra (birth star).
  lines.push(buildNakshatraLine(positions.MOON.longitude, positions.MOON.rashi, lang));

  // 3) The nine grahas.
  for (const name of PLANET_ORDER) {
    const pos = positions[name];
    lines.push(buildPlanetLine(name, {
      rashiIndex: pos.rashi,
      rashiDegree: pos.rashiDegree,
      longitude: pos.longitude,
      isRetrograde: pos.isRetrograde,
    }, ascRashi, { longitude: pos.longitude, sunLongitude, signByPlanet: signByPlanetTitle }, lang));
  }

  // 4) The twelve bhavas.
  const planetsForHouse = PLANET_ORDER.map(name => ({
    planet: titleCase(name),
    rashiIndex: positions[name].rashi,
    isRetrograde: positions[name].isRetrograde,
  }));
  for (let house = 1; house <= 12; house++) {
    lines.push(buildHouseLine(house, ascRashi, planetsForHouse, signByPlanetTitle, lang));
  }

  const nak = getNakshatra(positions.MOON.longitude);

  return {
    meta: {
      ascendantName: lang === 'si' ? siRashiName(ascRashi, lang) : RASHIS[ascRashi],
      ascendantEnglish: RASHI_ENGLISH[ascRashi],
      moonSign: lang === 'si' ? siRashiName(positions.MOON.rashi, lang) : RASHIS[positions.MOON.rashi],
      moonNakshatra: nak.name,
      ayanamsa: bd.ayanamsa,
      generatedAt: new Date().toISOString(),
    },
    lines,
  };
}
