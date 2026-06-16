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

const ORDINAL = ['', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];

function titleCase(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ─── Per-sign rising (Lagna) character ───────────────────────────────────────
const LAGNA_TRAITS: Record<number, string> = {
  0:  'With Aries (Mesha) rising you meet life head-on — pioneering, energetic, competitive, and quick to act. A strong Mars makes you a natural starter who thrives on challenge but must temper impatience.',
  1:  'With Taurus (Vrishabha) rising you are steady, patient, and sensual — you value comfort, beauty, and security. Ruled by Venus, you build slowly and lastingly, though stubbornness can set in.',
  2:  'With Gemini (Mithuna) rising you are curious, communicative, and adaptable — a quick mind that loves variety. Ruled by Mercury, you excel at words and ideas but can scatter your focus.',
  3:  'With Cancer (Karka) rising you are sensitive, nurturing, and intuitive — deeply tied to home, family, and emotional security. Ruled by the Moon, your moods colour your whole outlook.',
  4:  'With Leo (Simha) rising you are dignified, warm, and naturally commanding — you seek recognition and lead from the heart. Ruled by the Sun, pride is your strength and your test.',
  5:  'With Virgo (Kanya) rising you are analytical, precise, and service-minded — discerning and health-conscious. Ruled by Mercury, you perfect details but can over-criticise yourself and others.',
  6:  'With Libra (Tula) rising you are gracious, diplomatic, and partnership-oriented — you seek balance, beauty, and fairness. Ruled by Venus, harmony matters, though indecision can stall you.',
  7:  'With Scorpio (Vrischika) rising you are intense, magnetic, and private — driven to probe beneath the surface and transform. Ruled by Mars, your willpower is formidable.',
  8:  'With Sagittarius (Dhanu) rising you are optimistic, philosophical, and freedom-loving — a seeker of meaning and far horizons. Ruled by Jupiter, you inspire but may overpromise.',
  9:  'With Capricorn (Makara) rising you are disciplined, ambitious, and responsible — a patient builder of lasting structures. Ruled by Saturn, you rise through perseverance.',
  10: 'With Aquarius (Kumbha) rising you are independent, humanitarian, and original — drawn to ideas, groups, and reform. Ruled by Saturn, you think ahead of your time.',
  11: 'With Pisces (Meena) rising you are compassionate, imaginative, and spiritual — porous to the moods around you. Ruled by Jupiter, you dream widely and feel deeply.',
};

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

function buildLagnaLine(ascRashi: number, lordHouse: number, lordDignityLabel: string): NatalLine {
  const lord = RASHI_LORDS[RASHIS[ascRashi]];
  const element = RASHI_ELEMENTS[RASHIS[ascRashi]];
  const modality = RASHI_MODALITIES[RASHIS[ascRashi]];
  return {
    id: 'lagna',
    group: 'lagna',
    icon: 'LAGNA',
    title: `Ascendant — ${RASHI_ENGLISH[ascRashi]} (${RASHIS[ascRashi]}) rising`,
    subtitle: `Chart ruler ${lord} · ${element} · ${modality}`,
    badges: [
      { label: RASHI_ENGLISH[ascRashi], tone: 'info' },
      { label: `${element}`, tone: 'info' },
      { label: `Ruler: ${lord}`, tone: 'info' },
    ],
    summary: `Your rising sign sets the lens through which you meet the world and frames every other house. ${RASHI_ENGLISH[ascRashi]} gives you a ${modality.toLowerCase()} ${element.toLowerCase()} nature.`,
    sections: [
      { heading: 'Your rising sign', body: LAGNA_TRAITS[ascRashi] },
      { heading: 'Element & mode', body: `A ${element} sign makes your core drive ${element === 'Fire' ? 'active, inspired and pioneering' : element === 'Earth' ? 'grounded, practical and reliable' : element === 'Air' ? 'mental, social and communicative' : 'emotional, intuitive and adaptive'}. Being ${modality} means you ${modality === 'Movable' ? 'initiate easily and prefer momentum and change' : modality === 'Fixed' ? 'hold firm, build steadily and resist being rushed' : 'adapt, mediate and move fluidly between options'}.` },
      { heading: 'Your chart ruler', body: `${lord} rules your Ascendant and is the single most important planet in your chart. It sits in your ${ORDINAL[lordHouse]} house and is ${lordDignityLabel.toLowerCase()} — so the affairs of the ${ORDINAL[lordHouse]} house become central to your life direction, and ${lord}'s condition strongly colours your overall vitality and fortune.` },
    ],
  };
}

// Heading shown for each nakshatra insight item inside the Natal modal.
const NAK_ITEM_HEADING: Record<string, string> = {
  overview: 'Your personality',
  lord: 'Ruling planet',
  gana: 'Temperament (Gana)',
  pada: 'Birth quarter (Pada)',
  deity: 'Presiding deity',
  symbol: 'Symbol',
};

function buildNakshatraLine(moonLon: number, moonSign: number): NatalLine {
  const nak = getNakshatra(moonLon);

  // Reuse the same rich, plain-language content as the Chart-tab nakshatra card
  // so both views stay consistent.
  const items = getNakshatraItems({
    index: nak.index, name: nak.name, lord: nak.lord, pada: nak.pada,
    degree: nak.degree, deity: nak.deity, symbol: nak.symbol, gana: nak.gana,
  });

  const sections: NatalSection[] = items.map(it => ({
    heading: NAK_ITEM_HEADING[it.key] ?? it.key,
    body: it.body,
    bullets: it.bullets,
  }));
  // Lead with how the nakshatra seeds the whole dasha timeline.
  sections.unshift({
    heading: 'Why your birth star matters',
    body: `The Moon occupies ${nak.name}, symbolised by the ${nak.symbol.toLowerCase()} and presided over by ${nak.deity}. This star shapes your emotional nature and instinctive mind, and it seeds the entire Vimshottari Dasha timeline that schedules your life's chapters.`,
  });

  return {
    id: 'nakshatra',
    group: 'nakshatra',
    icon: 'STAR',
    title: `Moon in ${nak.name} (Pada ${nak.pada})`,
    subtitle: `Birth star · ruled by ${nak.lord} · ${RASHIS[moonSign]}`,
    badges: [
      { label: `Lord: ${nak.lord}`, tone: 'info' },
      { label: `Pada ${nak.pada}`, tone: 'info' },
      { label: nak.gana, tone: 'info' },
    ],
    summary: `Your Moon's nakshatra describes your emotional nature and instinctive mind, and it seeds the entire Vimshottari Dasha timeline that schedules your life's chapters.`,
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
): NatalLine {
  const planet = titleCase(planetUpper); // 'Sun' — required for correct dignity lookup
  const a = analyzePlanet(planet, p.rashiIndex, ascRashi, p.isRetrograde, p.rashiDegree, context);

  const badges: NatalBadge[] = [
    { label: a.dignityInfo.label, tone: dignityTone(a.dignity) },
    { label: a.strength.verdictLabel, tone: verdictTone(a.strength.verdict) },
    { label: a.functional.label, tone: functionalTone(a.functional.nature) },
  ];
  if (a.isRetrograde) badges.push({ label: 'Retrograde', tone: 'info' });
  if (a.combustion?.isCombust) badges.push({ label: 'Combust', tone: 'bad' });
  if (a.neechaBhanga?.cancelled) badges.push({ label: 'Neecha Bhanga', tone: 'good' });

  const sections: NatalSection[] = [];

  sections.push({
    heading: 'What it governs',
    bullets: a.keywords.slice(0, 7).map(cap),
  });

  if (a.placement) {
    sections.push({ heading: `Why it matters in your ${a.houseData.name}`, body: a.placement.effect });
    if (a.placement.strengths.length) sections.push({ heading: 'Strengths to lean on', tone: 'good', bullets: a.placement.strengths });
    if (a.placement.challenges.length) sections.push({ heading: 'What to watch', tone: 'bad', bullets: a.placement.challenges });
  } else {
    sections.push({
      heading: `In your ${a.houseData.name}`,
      body: `${planet} sits in your ${a.houseData.name} (${a.houseData.theme}), directing its energy of ${(a.keywords.slice(0, 3).join(', '))} into ${a.houseData.rules.slice(0, 3).join(', ')}.`,
    });
  }

  sections.push({ heading: 'Strength in your chart', body: a.strength.summary });
  sections.push({ heading: 'Dignity & role', body: `${a.dignityInfo.desc} ${a.functional.desc}` });

  if (a.retrogradeEffect) {
    sections.push({ heading: 'Retrograde effect', tone: 'info', body: a.retrogradeEffect.general });
  }
  if (a.combustion?.isCombust) {
    sections.push({ heading: 'Combustion', tone: 'bad', body: a.combustion.desc });
  }
  if (a.neechaBhanga?.cancelled) {
    sections.push({ heading: 'Debilitation cancelled', tone: 'good', body: a.neechaBhanga.desc });
  }
  if (a.gemstone || a.mantra) {
    const parts: string[] = [];
    if (a.gemstone) parts.push(`Gemstone: ${a.gemstone}`);
    if (a.mantra) parts.push(`Mantra: ${a.mantra}`);
    sections.push({ heading: 'Supportive remedy', body: parts.join(' · ') });
  }

  return {
    id: `planet-${planetUpper}`,
    group: 'planet',
    icon: planetUpper,
    title: `${planet} in ${RASHIS[p.rashiIndex]} · ${a.houseData.name}`,
    subtitle: `${RASHI_ENGLISH[p.rashiIndex]} ${p.rashiDegree.toFixed(2)}° · ${a.dignityInfo.label}${a.isRetrograde ? ' · Retrograde' : ''}`,
    badges,
    summary: `${planet} carries ${a.keywords.slice(0, 3).join(', ')}. Placed in your ${a.houseData.name}, it is ${a.strength.verdictLabel.toLowerCase()} and acts as a ${a.functional.label.toLowerCase()} for your Ascendant.`,
    sections,
  };
}

function buildHouseLine(
  houseNumber: number,
  ascRashi: number,
  planetsForHouse: Array<{ planet: string; rashiIndex: number; isRetrograde: boolean }>,
  signByPlanetTitle: Record<string, number>,
): NatalLine {
  const h = analyzeHouse(houseNumber, ascRashi, planetsForHouse, signByPlanetTitle);

  const sections: NatalSection[] = [];
  sections.push({ heading: 'What this area of life covers', bullets: h.houseData.rules.map(cap) });
  sections.push({
    heading: 'The sign on this house',
    body: `${h.rashiName} (${h.rashiEnglish}) falls on your ${ORDINAL[houseNumber]} house, so its ruler ${h.rashiLord} governs these matters. The way ${h.rashiLord} is placed decides how these affairs unfold.`,
  });
  sections.push({
    heading: `Where the ruler (${h.rashiLord}) went`,
    body: `${h.lordHouseDesc} Its dignity there is ${h.lordDignity.replace('-', ' ')}, which ${dignityTone(h.lordDignity) === 'good' ? 'supports and strengthens' : dignityTone(h.lordDignity) === 'bad' ? 'tests and complicates' : 'gives mixed results to'} this house's themes.`,
  });
  if (h.planetEffects.length) {
    sections.push({ heading: 'Planets placed here', bullets: h.planetEffects.map(e => `${titleCase(e.planet)}: ${e.effect}`) });
  } else {
    sections.push({ heading: 'Planets placed here', body: `No planet occupies this house, so its results flow mainly through its ruler ${h.rashiLord} (described above) and any planets aspecting it. An empty house is not a weak house — read it through its lord.` });
  }
  if (h.combinationEffect) {
    sections.push({ heading: 'Combined effect', tone: 'info', body: h.combinationEffect });
  }

  const badges: NatalBadge[] = [
    { label: h.rashiEnglish, tone: 'info' },
    { label: `Ruler ${h.rashiLord} → ${ORDINAL[h.lordHouse] || '—'}`, tone: 'info' },
  ];
  if (h.planetsInHouse.length) badges.push({ label: `${h.planetsInHouse.length} planet${h.planetsInHouse.length > 1 ? 's' : ''}`, tone: 'neutral' });

  return {
    id: `house-${houseNumber}`,
    group: 'house',
    icon: String(houseNumber),
    title: `${h.houseData.name} — ${h.houseData.theme}`,
    subtitle: `${h.rashiName} · ruled by ${h.rashiLord}${h.planetsInHouse.length ? ` · ${h.planetsInHouse.map(titleCase).join(', ')}` : ' · empty'}`,
    badges,
    summary: `Your ${h.houseData.name} covers ${h.houseData.rules.slice(0, 3).join(', ')}. With ${h.rashiName} here, its ruler ${h.rashiLord} sits in the ${ORDINAL[h.lordHouse] || 'same'} house.`,
    sections,
  };
}

// ─── Main entry point ────────────────────────────────────────────────────────

export async function buildNatalReport(bd: BirthData): Promise<NatalReport> {
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
  const lordAnalysis = analyzePlanet(lordOfAsc, lordRashi, ascRashi, positions[lordUpper].isRetrograde, positions[lordUpper].rashiDegree);
  lines.push(buildLagnaLine(ascRashi, lordHouse, lordAnalysis.dignityInfo.label));

  // 2) Moon nakshatra (birth star).
  lines.push(buildNakshatraLine(positions.MOON.longitude, positions.MOON.rashi));

  // 3) The nine grahas.
  for (const name of PLANET_ORDER) {
    const pos = positions[name];
    lines.push(buildPlanetLine(name, {
      rashiIndex: pos.rashi,
      rashiDegree: pos.rashiDegree,
      longitude: pos.longitude,
      isRetrograde: pos.isRetrograde,
    }, ascRashi, { longitude: pos.longitude, sunLongitude, signByPlanet: signByPlanetTitle }));
  }

  // 4) The twelve bhavas.
  const planetsForHouse = PLANET_ORDER.map(name => ({
    planet: titleCase(name),
    rashiIndex: positions[name].rashi,
    isRetrograde: positions[name].isRetrograde,
  }));
  for (let house = 1; house <= 12; house++) {
    lines.push(buildHouseLine(house, ascRashi, planetsForHouse, signByPlanetTitle));
  }

  const nak = getNakshatra(positions.MOON.longitude);

  return {
    meta: {
      ascendantName: RASHIS[ascRashi],
      ascendantEnglish: RASHI_ENGLISH[ascRashi],
      moonSign: RASHIS[positions.MOON.rashi],
      moonNakshatra: nak.name,
      ayanamsa: bd.ayanamsa,
      generatedAt: new Date().toISOString(),
    },
    lines,
  };
}
