/**
 * Synastry — two-chart overlay. Two techniques, combined:
 *
 * **Interaspects** are mutual by construction (A's Venus trine B's Mars *is*
 * B's Mars trine A's Venus — the same geometric fact), so the aspect grid is
 * computed once and read from both directions.
 *
 * **House overlays** — whose planet falls in whose house — are genuinely
 * directional (A's Venus in B's 7th house is not the same statement as B's
 * Venus in A's 7th house), which is why `asymmetric` below is driven entirely
 * by the overlay half: the aspect half contributes identically to both
 * directions by construction, same principle as `matchSynastry.ts`'s Vedic
 * Layer 4, applied to Western technique instead of nakshatra/graha rules.
 */

import type { Lang } from '../i18n';
import type { WesternChart } from '../../../types/westernAstrology';
import { computeCrossAspects, type AspectBody, type AspectHit, ALL_ASPECTS } from './aspects';
import { ASPECT_NATURE } from './aspects';
import { houseOfLongitude, angularityOf } from './houses';
import { WESTERN_BENEFICS, WESTERN_MALEFICS } from './text/planetText';
import { composeInterAspectSentence, composeOverlaySentence } from './text/synastryText';

export type ContactValence = 'supportive' | 'adverse' | 'neutral';

export interface WesternSynastryContact {
  direction: 'a-to-b' | 'b-to-a';
  body: string;
  target: string;
  kind: 'aspect' | 'houseOverlay';
  house?: number;
  orb: number | null;
  strength: number;
  valence: ContactValence;
  interpretation: string;
}

export interface DirectedEdges {
  contacts: WesternSynastryContact[];
  netValence: number;
}

export interface WesternSynastryResult {
  aToB: DirectedEdges;
  bToA: DirectedEdges;
  defining: WesternSynastryContact[];
  asymmetric: boolean;
  summary: string;
}

const VALENCE_SIGN: Record<ContactValence, number> = { supportive: 1, adverse: -1, neutral: 0 };
const ASYMMETRY_THRESHOLD = 1.0;
const STRENGTH_FLOOR = 0.15;

/** Houses whose thematic weight tilts a same-strength overlay toward ease or strain. */
const SUPPORTIVE_HOUSES = new Set([1, 4, 5, 7, 9, 11]);
const ADVERSE_HOUSES = new Set([6, 8, 12]);

function aspectValence(type: AspectHit['type'], bodyA: string, bodyB: string): ContactValence {
  const nature = ASPECT_NATURE[type];
  if (nature === 'harmonious') return 'supportive';
  if (nature === 'challenging') return 'adverse';
  // Conjunction: read through whether a traditional malefic is involved.
  const hasMalefic = WESTERN_MALEFICS.has(bodyA) || WESTERN_MALEFICS.has(bodyB);
  const hasBenefic = WESTERN_BENEFICS.has(bodyA) || WESTERN_BENEFICS.has(bodyB);
  if (hasMalefic && !hasBenefic) return 'adverse';
  if (hasBenefic && !hasMalefic) return 'supportive';
  return 'neutral';
}

function houseValence(house: number): ContactValence {
  if (SUPPORTIVE_HOUSES.has(house)) return 'supportive';
  if (ADVERSE_HOUSES.has(house)) return 'adverse';
  return 'neutral';
}

function toAspectBodies(chart: WesternChart): AspectBody[] {
  return [
    ...chart.planets.map(p => ({ name: p.planet, longitude: p.longitude, speed: p.speed })),
    { name: chart.ascendant.planet, longitude: chart.ascendant.longitude, speed: 0 },
    { name: chart.midheaven.planet, longitude: chart.midheaven.longitude, speed: 0 },
  ];
}

export function runWesternSynastry(
  chartA: WesternChart, chartB: WesternChart,
  youLabel: string, themLabel: string, lang: Lang = 'en',
): WesternSynastryResult {
  const bodiesA = toAspectBodies(chartA);
  const bodiesB = toAspectBodies(chartB);
  const hits = computeCrossAspects(bodiesA, bodiesB, ALL_ASPECTS).filter(h => h.strength >= STRENGTH_FLOOR);

  const aToBAspects: WesternSynastryContact[] = [];
  const bToAAspects: WesternSynastryContact[] = [];
  for (const h of hits) {
    const valence = aspectValence(h.type, h.bodyA, h.bodyB);
    aToBAspects.push({
      direction: 'a-to-b', body: h.bodyA, target: h.bodyB, kind: 'aspect',
      orb: h.orb, strength: h.strength, valence,
      interpretation: composeInterAspectSentence(h.bodyA, h.bodyB, h.type, youLabel, themLabel, lang),
    });
    bToAAspects.push({
      direction: 'b-to-a', body: h.bodyB, target: h.bodyA, kind: 'aspect',
      orb: h.orb, strength: h.strength, valence,
      interpretation: composeInterAspectSentence(h.bodyB, h.bodyA, h.type, themLabel, youLabel, lang),
    });
  }

  const cuspsA = chartA.houses.map(hs => hs.longitude);
  const cuspsB = chartB.houses.map(hs => hs.longitude);

  const aToBOverlay: WesternSynastryContact[] = chartA.planets.map(p => {
    const house = houseOfLongitude(p.longitude, cuspsB);
    const valence = houseValence(house);
    const strength = angularityOf(house) === 'angular' ? 1 : angularityOf(house) === 'succedent' ? 0.6 : 0.4;
    return {
      direction: 'a-to-b', body: p.planet, target: `house-${house}`, kind: 'houseOverlay', house,
      orb: null, strength, valence,
      interpretation: composeOverlaySentence(p.planet, house, youLabel, themLabel, lang),
    };
  });
  const bToAOverlay: WesternSynastryContact[] = chartB.planets.map(p => {
    const house = houseOfLongitude(p.longitude, cuspsA);
    const valence = houseValence(house);
    const strength = angularityOf(house) === 'angular' ? 1 : angularityOf(house) === 'succedent' ? 0.6 : 0.4;
    return {
      direction: 'b-to-a', body: p.planet, target: `house-${house}`, kind: 'houseOverlay', house,
      orb: null, strength, valence,
      interpretation: composeOverlaySentence(p.planet, house, themLabel, youLabel, lang),
    };
  });

  const netOf = (contacts: WesternSynastryContact[]) =>
    contacts.reduce((sum, c) => sum + VALENCE_SIGN[c.valence] * c.strength, 0);

  const aToB: DirectedEdges = { contacts: [...aToBAspects, ...aToBOverlay].sort((x, y) => y.strength - x.strength), netValence: 0 };
  const bToA: DirectedEdges = { contacts: [...bToAAspects, ...bToAOverlay].sort((x, y) => y.strength - x.strength), netValence: 0 };
  aToB.netValence = Math.round(netOf(aToB.contacts) * 100) / 100;
  bToA.netValence = Math.round(netOf(bToA.contacts) * 100) / 100;

  const defining = [...aToBAspects, ...aToBOverlay, ...bToAOverlay]
    .sort((x, y) => y.strength - x.strength)
    .slice(0, 5);

  const asymmetric = Math.abs(aToB.netValence - bToA.netValence) > ASYMMETRY_THRESHOLD;

  const summary = composeSynastrySummary(aToB.netValence, bToA.netValence, asymmetric, youLabel, themLabel, lang);

  return { aToB, bToA, defining, asymmetric, summary };
}

function composeSynastrySummary(
  netAB: number, netBA: number, asymmetric: boolean, youLabel: string, themLabel: string, lang: Lang,
): string {
  const avg = (netAB + netBA) / 2;
  const overall = avg > 1.5
    ? (lang === 'si' ? 'මෙම යුගලයෙන් වඩාත් සහායක සම්බන්ධතා ගණනාවක් පවතී.' : 'This pairing carries more supportive contacts than straining ones.')
    : avg < -1.5
      ? (lang === 'si' ? 'මෙම යුගලය සැලකිය යුතු ආතති සම්බන්ධතා කිහිපයක් රැගෙන එයි — වැඩ කිරීමට හැකි, එහෙත් නොසලකා හැරිය නොහැක.' : 'This pairing brings some real friction to work with — workable, but not to be ignored.')
      : (lang === 'si' ? 'මෙම යුගලය සහායක හා අභියෝගාත්මක යන දෙකම මිශ්‍ර ලෙස රඳවා ගනී.' : 'This pairing holds a genuine mix of ease and challenge.');
  const asymmetryNote = asymmetric
    ? (lang === 'si'
      ? ` ${youLabel} ${themLabel} දෙස දකින ආකාරය, ${themLabel} ${youLabel} දෙස දකින ආකාරයට වඩා කැපී පෙනෙන ලෙස වෙනස් වේ — දෙපැත්තම කියවීම වටී.`
      : ` How ${youLabel} experiences ${themLabel} differs noticeably from how ${themLabel} experiences ${youLabel} — worth reading both directions rather than averaging them.`)
    : '';
  return overall + asymmetryNote;
}
