/**
 * Varga service — computes D9/D10 divisional charts from birth data and
 * derives marriage (D9) and career (D10) insights.
 */

import { getPlanetPositions } from '../core/ephemeris';
import { computeVargas, type VargaChart } from '../core/vargas';
import { RASHIS } from '../core/rashi';
import { RASHI_LORDS, type DignityLevel } from '../core/planetaryAnalysis';
import type { BirthData } from '../../types/astrology';

export interface VargaInsight {
  title: string;
  tone: 'positive' | 'neutral' | 'challenging';
  text: string;
}

export interface VargaReport {
  chart: VargaChart;
  d9AscendantName: string;
  d10AscendantName: string;
  marriageInsights: VargaInsight[];
  careerInsights: VargaInsight[];
}

const STRONG: DignityLevel[] = ['exalted', 'own-sign', 'friend-sign'];
const WEAK: DignityLevel[] = ['enemy-sign', 'debilitated'];

const DIGNITY_TEXT: Record<DignityLevel, string> = {
  'exalted': 'exalted',
  'own-sign': 'in its own sign',
  'friend-sign': 'in a friendly sign',
  'neutral-sign': 'in a neutral sign',
  'enemy-sign': 'in an enemy sign',
  'debilitated': 'debilitated',
};

function marriageInsights(chart: VargaChart): VargaInsight[] {
  const insights: VargaInsight[] = [];
  const find = (p: string) => chart.planets.find(x => x.planet === p);

  const venus = find('Venus');
  if (venus) {
    const strong = STRONG.includes(venus.d9Dignity);
    const weak = WEAK.includes(venus.d9Dignity);
    insights.push({
      title: 'Venus in Navamsa',
      tone: strong ? 'positive' : weak ? 'challenging' : 'neutral',
      text: strong
        ? `Venus is ${DIGNITY_TEXT[venus.d9Dignity]} in ${venus.d9RashiName} navamsa — strong promise of love, harmony, and a refined partner; marriage tends to flourish.`
        : weak
          ? `Venus is ${DIGNITY_TEXT[venus.d9Dignity]} in ${venus.d9RashiName} navamsa — relationship satisfaction needs conscious work; choose a partner for values, not surface charm.`
          : `Venus sits in ${venus.d9RashiName} navamsa — partnership results are steady and shaped by mutual effort.`,
    });
  }

  const jupiter = find('Jupiter');
  if (jupiter) {
    const strong = STRONG.includes(jupiter.d9Dignity);
    insights.push({
      title: 'Jupiter in Navamsa',
      tone: strong ? 'positive' : WEAK.includes(jupiter.d9Dignity) ? 'challenging' : 'neutral',
      text: strong
        ? `Jupiter is ${DIGNITY_TEXT[jupiter.d9Dignity]} in ${jupiter.d9RashiName} navamsa — wisdom and dharma protect the marriage; the spouse brings genuine blessing.`
        : WEAK.includes(jupiter.d9Dignity)
          ? `Jupiter is ${DIGNITY_TEXT[jupiter.d9Dignity]} in ${jupiter.d9RashiName} navamsa — guard against over-expectation in marriage; shared ethics matter more than shared comforts.`
          : `Jupiter occupies ${jupiter.d9RashiName} navamsa — a stabilising, principled influence on long-term commitment.`,
    });
  }

  // Navamsa lagna lord condition
  const d9LagnaLord = RASHI_LORDS[chart.d9Ascendant];
  const lordPos = find(d9LagnaLord);
  if (lordPos) {
    const strong = STRONG.includes(lordPos.d9Dignity);
    insights.push({
      title: `Navamsa Lagna: ${RASHIS[chart.d9Ascendant]} (lord ${d9LagnaLord})`,
      tone: strong ? 'positive' : WEAK.includes(lordPos.d9Dignity) ? 'challenging' : 'neutral',
      text: strong
        ? `The navamsa ascendant lord ${d9LagnaLord} is ${DIGNITY_TEXT[lordPos.d9Dignity]} — the inner self matures gracefully through committed partnership.`
        : WEAK.includes(lordPos.d9Dignity)
          ? `The navamsa ascendant lord ${d9LagnaLord} is ${DIGNITY_TEXT[lordPos.d9Dignity]} — inner growth through relationships comes with tests; patience is the remedy.`
          : `The navamsa ascendant lord ${d9LagnaLord} is ${DIGNITY_TEXT[lordPos.d9Dignity]} — partnership karma unfolds at an even pace.`,
    });
  }

  if (chart.vargottamaPlanets.length) {
    insights.push({
      title: 'Vargottama Planets',
      tone: 'positive',
      text: `${chart.vargottamaPlanets.join(', ')} occupy the same sign in D1 and D9 (vargottama) — these planets deliver their promises with unusual consistency across both outer and inner life.`,
    });
  }

  return insights;
}

function careerInsights(chart: VargaChart): VargaInsight[] {
  const insights: VargaInsight[] = [];
  const find = (p: string) => chart.planets.find(x => x.planet === p);

  const checks: { planet: string; strongText: string; weakText: string }[] = [
    {
      planet: 'Sun',
      strongText: 'authority, visibility, and recognition build steadily — leadership roles suit you',
      weakText: 'recognition arrives later than effort deserves — let work quality speak before seeking titles',
    },
    {
      planet: 'Saturn',
      strongText: 'long-term, structural career success — you become an institution in your field',
      weakText: 'professional discipline is tested; systems and routines are your safeguard',
    },
    {
      planet: 'Mercury',
      strongText: 'commerce, analysis, and communication professions are strongly supported',
      weakText: 'double-check contracts and communications at work — precision protects reputation',
    },
  ];

  for (const c of checks) {
    const p = find(c.planet);
    if (!p) continue;
    const strong = STRONG.includes(p.d10Dignity);
    const weak = WEAK.includes(p.d10Dignity);
    insights.push({
      title: `${c.planet} in Dasamsa`,
      tone: strong ? 'positive' : weak ? 'challenging' : 'neutral',
      text: `${c.planet} is ${DIGNITY_TEXT[p.d10Dignity]} in ${p.d10RashiName} dasamsa — ${strong ? c.strongText : weak ? c.weakText : 'career results in its significations track your consistency'}.`,
    });
  }

  const d10LagnaLord = RASHI_LORDS[chart.d10Ascendant];
  const lordPos = find(d10LagnaLord);
  if (lordPos) {
    const strong = STRONG.includes(lordPos.d10Dignity);
    insights.push({
      title: `Dasamsa Lagna: ${RASHIS[chart.d10Ascendant]} (lord ${d10LagnaLord})`,
      tone: strong ? 'positive' : WEAK.includes(lordPos.d10Dignity) ? 'challenging' : 'neutral',
      text: strong
        ? `The dasamsa ascendant lord ${d10LagnaLord} is ${DIGNITY_TEXT[lordPos.d10Dignity]} — your professional identity is well-founded and gains momentum with age.`
        : WEAK.includes(lordPos.d10Dignity)
          ? `The dasamsa ascendant lord ${d10LagnaLord} is ${DIGNITY_TEXT[lordPos.d10Dignity]} — career direction clarifies through trial; early shifts are part of the design.`
          : `The dasamsa ascendant lord ${d10LagnaLord} is ${DIGNITY_TEXT[lordPos.d10Dignity]} — public standing grows in proportion to sustained effort.`,
    });
  }

  return insights;
}

const PLANET_KEYS = ['SUN','MOON','MARS','MERCURY','JUPITER','VENUS','SATURN','RAHU','KETU'] as const;

export async function getVargaReport(bd: BirthData): Promise<VargaReport> {
  const positions = await getPlanetPositions(bd.date, bd.latitude, bd.longitude, bd.timezone, bd.ayanamsa);

  const longitudes: Record<string, number> = {};
  const retro: Record<string, boolean> = {};
  for (const k of PLANET_KEYS) {
    const p = positions[k];
    if (!p) continue;
    const name = k.charAt(0) + k.slice(1).toLowerCase();
    longitudes[name] = p.longitude;
    retro[name] = p.isRetrograde;
  }

  const chart = computeVargas({
    longitudes,
    retro,
    ascendantLongitude: positions['ASCENDANT'].longitude,
  });

  return {
    chart,
    d9AscendantName: RASHIS[chart.d9Ascendant],
    d10AscendantName: RASHIS[chart.d10Ascendant],
    marriageInsights: marriageInsights(chart),
    careerInsights: careerInsights(chart),
  };
}
