/**
 * Western natal report builder — the "Big 3" (Sun/Moon/Rising), the ten
 * planets, and the twelve houses, each as a click-to-expand line. Mirrors
 * `lib/core/natal.ts`'s shape and level of detail so the two systems' Natal
 * Chart modals feel like the same product, built for two different skies.
 */

import type { Lang } from '../i18n';
import { pick, pickList } from '../i18n';
import type { WesternChart, WesternPlanetPosition } from '../../../types/westernAstrology';
import { SIGNS, MODERN_RULER, TRADITIONAL_RULER, signElement, signModality, westernModalityLabel } from './signs';
import { WESTERN_HOUSE_DISPLAY } from './text/houseText';
import { SIGN_ESSENCE } from './text/signText';
import { westernPlanetName, planetKeywords } from './text/planetText';
import { DIGNITY_TEXT } from './text/dignityText';
import { composeAspectSentence } from './text/aspectText';
import type { AspectHit } from './aspects';

export type Tone = 'good' | 'bad' | 'neutral' | 'info';

export interface WesternNatalBadge { label: string; tone: Tone }
export interface WesternNatalSection { heading: string; body?: string; bullets?: string[]; tone?: Tone }
export interface WesternNatalLine {
  id: string;
  group: 'bigthree' | 'planet' | 'house';
  icon: string;
  title: string;
  subtitle: string;
  badges: WesternNatalBadge[];
  summary: string;
  sections: WesternNatalSection[];
}
export interface WesternNatalReport {
  meta: { sunSign: string; moonSign: string; risingSign: string; generatedAt: string };
  lines: WesternNatalLine[];
}

const dignityTone: Record<string, Tone> = { rulership: 'good', exaltation: 'good', detriment: 'bad', fall: 'bad', neutral: 'neutral' };

function rulerNote(sign: number, lang: Lang): string {
  const modern = MODERN_RULER[sign];
  const trad = TRADITIONAL_RULER[sign];
  const modernLabel = westernPlanetName(modern, lang);
  if (modern === trad) return modernLabel;
  const tradLabel = westernPlanetName(trad, lang);
  return lang === 'si' ? `${modernLabel} (සම්ප්‍රදායිකව ${tradLabel})` : `${modernLabel} (traditionally ${tradLabel})`;
}

function frameSun(sign: number, lang: Lang): string {
  const essence = pick(SIGN_ESSENCE[sign], lang);
  return lang === 'si'
    ? `ඔබේ සූර්යයා ${SIGNS[sign]} හි පිහිටා ඇත. එනම් ඔබේ හරයේ ඔබේ අනන්‍යතාව හා ජීවශක්තිය: ${essence}`
    : `Your Sun sits in ${SIGNS[sign]} — at the core of your identity and vitality, you are ${essence}`;
}

function frameMoon(sign: number, lang: Lang): string {
  const essence = pick(SIGN_ESSENCE[sign], lang);
  return lang === 'si'
    ? `ඔබේ චන්ද්‍රයා ${SIGNS[sign]} හි පිහිටා ඇත. එනම් හැඟීම්බරව හා අභ්‍යන්තරව ඔබ: ${essence}`
    : `Your Moon sits in ${SIGNS[sign]} — emotionally and instinctively, you are ${essence}`;
}

function frameRising(sign: number, lang: Lang): string {
  const essence = pick(SIGN_ESSENCE[sign], lang);
  return lang === 'si'
    ? `ඔබේ ලග්නය ${SIGNS[sign]} ය. එනම් මුල් හැඟීමකදී, පිටතින් පෙනෙන ඔබ: ${essence}`
    : `Your Ascendant is ${SIGNS[sign]} — the face you meet the world with, on first impression, is someone who is ${essence}`;
}

function aspectsFor(planet: string, aspects: AspectHit[], limit = 3): AspectHit[] {
  return aspects.filter(a => a.bodyA === planet || a.bodyB === planet).slice(0, limit);
}

function otherBody(hit: AspectHit, planet: string): string {
  return hit.bodyA === planet ? hit.bodyB : hit.bodyA;
}

// ─── Line builders ───────────────────────────────────────────────────────────

function buildBigThreeLine(
  id: string, icon: string, titleKey: string, planet: WesternPlanetPosition,
  frame: (sign: number, lang: Lang) => string, lang: Lang,
): WesternNatalLine {
  const sign = planet.signIndex;
  const el = signElement(sign), mod = signModality(sign);
  const houseTheme = pick(WESTERN_HOUSE_DISPLAY[planet.house].theme, lang);
  const dignity = DIGNITY_TEXT[planet.dignity];
  return {
    id, group: 'bigthree', icon,
    title: `${titleKey} ${SIGNS[sign]}`,
    subtitle: lang === 'si'
      ? `${planet.house} වන භාවයේ · ${pick(dignity.label, lang)}`
      : `${planet.house}${ordinal(planet.house)} house · ${pick(dignity.label, lang)}`,
    badges: [
      { label: SIGNS[sign], tone: 'info' },
      { label: el, tone: 'info' },
      { label: westernModalityLabel(mod), tone: 'info' },
      { label: pick(dignity.label, lang), tone: dignityTone[planet.dignity] },
    ],
    summary: frame(sign, lang),
    sections: [
      { heading: lang === 'si' ? 'රාශියේ ස්වභාවය' : 'The sign\'s essence', body: frame(sign, lang) },
      {
        heading: lang === 'si' ? `${planet.house} වන භාවයේ` : `In your ${ordinalWord(planet.house)} house`,
        body: lang === 'si'
          ? `මෙය ${houseTheme} පිළිබඳ ජීවන ක්ෂේත්‍රයේ ප්‍රකාශ වේ.`
          : `This expresses itself through the life area of ${houseTheme}.`,
      },
      { heading: lang === 'si' ? 'බලය' : 'Dignity', body: `${westernPlanetName(planet.planet, lang)} ${pick(dignity.description, lang)}`, tone: dignityTone[planet.dignity] },
    ],
  };
}

function buildPlanetLine(planet: WesternPlanetPosition, chart: WesternChart, lang: Lang): WesternNatalLine {
  const sign = planet.signIndex;
  const houseDisplay = WESTERN_HOUSE_DISPLAY[planet.house];
  const dignity = DIGNITY_TEXT[planet.dignity];
  const keywords = planetKeywords(planet.planet, lang, 6);
  const hits = aspectsFor(planet.planet, chart.aspects);

  const sections: WesternNatalSection[] = [
    { heading: pick({ en: 'What it governs', si: 'එය පාලනය කරන දෑ' }, lang), bullets: keywords },
    {
      heading: lang === 'si' ? `${pick(houseDisplay.name, lang)} තුළ` : `In your ${pick(houseDisplay.name, lang)}`,
      body: lang === 'si'
        ? `${westernPlanetName(planet.planet, lang)} ${SIGNS[sign]} රාශියේ, ${planet.house} වන භාවයේ (${pick(houseDisplay.theme, lang)}) පිහිටා ඇත.`
        : `${westernPlanetName(planet.planet, lang)} sits in ${SIGNS[sign]}, in your ${planet.house}${ordinal(planet.house)} house — ${pick(houseDisplay.theme, lang)}.`,
    },
    { heading: pick({ en: 'Dignity', si: 'බලය' }, lang), body: `${westernPlanetName(planet.planet, lang)} ${pick(dignity.description, lang)}`, tone: dignityTone[planet.dignity] },
  ];
  if (planet.isRetrograde) {
    sections.push({
      heading: pick({ en: 'Retrograde', si: 'වක්‍ර' }, lang), tone: 'info',
      body: pick({
        en: 'This planet was retrograde at birth — its themes tend to turn inward, processed and re-worked internally before they show outwardly.',
        si: 'ජනනයේදී මෙම ග්‍රහයා වක්‍ර විය — එහි තේමා බාහිරව පෙන්වීමට පෙර අභ්‍යන්තරව සැකසී නැවත වැඩ කරනු ලැබේ.',
      }, lang),
    });
  }
  if (hits.length) {
    sections.push({
      heading: pick({ en: 'Major aspects', si: 'ප්‍රධාන යෝග' }, lang),
      bullets: hits.map(h => composeAspectSentence(planet.planet, otherBody(h, planet.planet), h.type, lang)),
    });
  }

  const badges: WesternNatalBadge[] = [
    { label: SIGNS[sign], tone: 'info' },
    { label: `${planet.house}${lang === 'si' ? ' වන' : ordinal(planet.house)}`, tone: 'info' },
    { label: pick(dignity.label, lang), tone: dignityTone[planet.dignity] },
  ];
  if (planet.isRetrograde) badges.push({ label: pick({ en: 'Retrograde', si: 'වක්‍ර' }, lang), tone: 'info' });

  return {
    id: `planet-${planet.planet}`,
    group: 'planet',
    icon: planet.planet,
    title: `${westernPlanetName(planet.planet, lang)} ${lang === 'si' ? 'හි' : 'in'} ${SIGNS[sign]}`,
    subtitle: lang === 'si'
      ? `${planet.house} වන භාවය · ${pick(dignity.label, lang)}`
      : `${planet.house}${ordinal(planet.house)} house · ${pick(dignity.label, lang)}`,
    badges,
    summary: lang === 'si'
      ? `${westernPlanetName(planet.planet, lang)} ${SIGNS[sign]} රාශියේ, ${planet.house} වන භාවයේ (${pick(houseDisplay.theme, lang)}) පිහිටා ඇත.`
      : `${westernPlanetName(planet.planet, lang)} in ${SIGNS[sign]}, house ${planet.house} — governing ${keywords.slice(0, 3).join(', ')}.`,
    sections,
  };
}

function buildHouseLine(houseNum: number, chart: WesternChart, lang: Lang): WesternNatalLine {
  const cusp = chart.houses[houseNum - 1];
  const display = WESTERN_HOUSE_DISPLAY[houseNum];
  const planetsHere = chart.planets.filter(p => p.house === houseNum);
  const ruler = rulerNote(cusp.signIndex, lang);

  const sections: WesternNatalSection[] = [
    { heading: pick({ en: 'What this area of life covers', si: 'මෙම ජීවන ක්ෂේත්‍රය ආවරණය කරන දෑ' }, lang), bullets: pickList(display.rules, lang) },
    {
      heading: pick({ en: 'The sign on this house', si: 'මෙම භාවයේ රාශිය' }, lang),
      body: lang === 'si'
        ? `${SIGNS[cusp.signIndex]} මෙම භාවයේ කූප්සයේ පිහිටා ඇත, ${ruler} විසින් පාලනය කරනු ලැබේ.`
        : `${SIGNS[cusp.signIndex]} sits on the cusp of this house, ruled by ${ruler}.`,
    },
  ];
  if (planetsHere.length) {
    sections.push({
      heading: pick({ en: 'Planets placed here', si: 'මෙහි පිහිටි ග්‍රහයෝ' }, lang),
      bullets: planetsHere.map(p => lang === 'si'
        ? `${westernPlanetName(p.planet, lang)} — ${SIGNS[p.signIndex]} රාශියේ`
        : `${westernPlanetName(p.planet, lang)} — in ${SIGNS[p.signIndex]}`),
    });
  } else {
    sections.push({
      heading: pick({ en: 'Planets placed here', si: 'මෙහි පිහිටි ග්‍රහයෝ' }, lang),
      body: pick({
        en: 'No planet sits here — this house is read through its ruler\'s placement instead.',
        si: 'මෙහි ග්‍රහයෙකු නොමැත — මෙම භාවය එහි අධිපතියාගේ පිහිටීම හරහා කියවනු ලැබේ.',
      }, lang),
    });
  }

  return {
    id: `house-${houseNum}`,
    group: 'house',
    icon: String(houseNum),
    title: `${pick(display.name, lang)}`,
    subtitle: lang === 'si' ? `${SIGNS[cusp.signIndex]} · ${ruler}` : `${SIGNS[cusp.signIndex]} · ruled by ${ruler}`,
    badges: [
      { label: SIGNS[cusp.signIndex], tone: 'info' },
      { label: ruler, tone: 'info' },
      ...(planetsHere.length ? [{ label: `${planetsHere.length} ${lang === 'si' ? 'ග්‍රහ' : 'planets'}`, tone: 'neutral' as Tone }] : []),
    ],
    summary: lang === 'si'
      ? `${pick(display.theme, lang)}. ${SIGNS[cusp.signIndex]} මෙහි කූප්සයේ, ${ruler} විසින් පාලනය කෙරේ.`
      : `${pick(display.theme, lang)}. ${SIGNS[cusp.signIndex]} on the cusp, ruled by ${ruler}.`,
    sections,
  };
}

function ordinal(n: number): string {
  const v = n % 100;
  if (v >= 11 && v <= 13) return 'th';
  return ['th', 'st', 'nd', 'rd'][n % 10] ?? 'th';
}
function ordinalWord(n: number): string { return `${n}${ordinal(n)}`; }

// ─── Main entry point ────────────────────────────────────────────────────────

export function buildWesternNatalReport(chart: WesternChart, lang: Lang = 'en'): WesternNatalReport {
  const sun = chart.planets.find(p => p.planet === 'SUN')!;
  const moon = chart.planets.find(p => p.planet === 'MOON')!;
  const asc = chart.ascendant;

  const lines: WesternNatalLine[] = [
    buildBigThreeLine('sun', 'SUN', lang === 'si' ? 'සූර්යයා' : 'Sun in', sun, frameSun, lang),
    buildBigThreeLine('moon', 'MOON', lang === 'si' ? 'චන්ද්‍රයා' : 'Moon in', moon, frameMoon, lang),
    buildBigThreeLine('rising', 'ASCENDANT', lang === 'si' ? 'ලග්නය' : 'Rising', asc, frameRising, lang),
    ...chart.planets.map(p => buildPlanetLine(p, chart, lang)),
    ...Array.from({ length: 12 }, (_, i) => buildHouseLine(i + 1, chart, lang)),
  ];

  return {
    meta: {
      sunSign: SIGNS[sun.signIndex], moonSign: SIGNS[moon.signIndex], risingSign: SIGNS[asc.signIndex],
      generatedAt: new Date().toISOString(),
    },
    lines,
  };
}
