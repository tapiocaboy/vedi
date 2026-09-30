/**
 * KnowledgeGraph — a plain-language relationship map of the influences shaping
 * the current period, written for a general audience (no astrology background
 * needed).
 *
 *   • A left-to-right board, not a ring of orbs. Guiding planets sit on the
 *     left with the life themes they touch beside them. The running period is
 *     the middle card. Life areas sit on the right, marked by how they trend.
 *   • Yogas and remedies share a row above the board; transits sit below.
 *     Each is wired to the planet or the period it belongs to.
 *
 * Anything that needs attention is highlighted. A plain-English summary, a
 * tap-for-details panel, and "good to do / avoid" tips make it understandable
 * at a glance. "Expand" pops out the graph alone — the canvas at full screen
 * height — leaving the surrounding cards on the page rather than duplicating
 * them into a modal.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Maximize2, X, Share2, AlertTriangle, Sparkles, CheckCircle2, Ban, Info, MousePointerClick } from 'lucide-react';
import { getCurrentPrediction, getAshtakavarga, getYogas, getGochara } from '../../services/api';
import type { BirthData, DashaPredictionData, LordStrengthData } from '../../services/api';
import type { Chart, PlanetPosition } from '../../types/astrology';
import type { AshtakavargaResult } from '../../lib/core/ashtakavarga';
import type { YogaResult } from '../../lib/core/yogas';
import type { GocharaSnapshot } from '../../lib/core/transits';
import { NAKSHATRAS } from '../../lib/core/nakshatra';
import {
  judgeLordPair, houseOfRashi, houseClass, aspectedHouses, type LordPairJudgement,
} from '../../lib/core/dashaLordRelation';
import { LORD_HEX, TREND_HEX } from '../shared/BarCharts';
import { useTheme } from '../../hooks/useTheme';
import { useChart } from '../../hooks/useChart';
import { useLang } from '../../i18n/LanguageContext';
import { coreLang, type Lang } from '../../i18n/translations';
import {
  labelPlanet, labelArea, labelDignity, labelTrend, labelRashi, labelOrdinalHouse,
  labelPlanetTheme, labelHouseTheme, labelHouseCovers, labelDashaScope,
  labelYogaCategory, labelYogaStrength,
} from '../../i18n/astroLabels';

const ACCENT = 'var(--c-accent)';

const PLANET_GLYPH: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mars: '♂', Mercury: '☿', Jupiter: '♃',
  Venus: '♀', Saturn: '♄', Rahu: '☊', Ketu: '☋',
};
const TREND_ARROW: Record<string, string> = {
  positive: '↑', mixed: '↗', neutral: '→', negative: '↓',
};
const DUSTHANA = new Set([6, 8, 12]);
type Tr = (k: any, v?: any) => string;

/** Yoga families, coloured and glyphed so the top ring reads at a glance. */
const YOGA_HEX: Record<string, string> = {
  rajayoga: '#fbbf24', mahapurusha: '#a78bfa', dhana: '#34d399',
  daridra: '#f43f5e', spiritual: '#60a5fa', special: '#e879f9',
};
const YOGA_GLYPH: Record<string, string> = {
  rajayoga: '♛', mahapurusha: '✦', dhana: '◈', daridra: '◇', spiritual: '☸', special: '✧',
};
/** Slow movers whose gochara is read against the natal Moon for a period. */
const GOCHARA_BODIES = ['SATURN', 'JUPITER', 'RAHU', 'KETU'] as const;
const REMEDY_GLYPH = { gemstone: '◆', mantra: 'ॐ', deity: '✺' } as const;

/**
 * Which houses feed each life area — the bhavas a Jyotishi checks when asked
 * about that area. A running lord that sits in, rules, or aspects one of them
 * is wired to the area on the canvas.
 */
const AREA_HOUSES: Record<string, number[]> = {
  career: [10, 6], wealth: [2, 11], relationships: [7, 5], health: [1, 6, 8],
};
const FOUNDATION_KEY: Record<string, string> = {
  career: 'career', wealth: 'wealth', relationships: 'relationship', health: 'health',
};

const ellipsis = (s: string, max: number) => (s.length > max ? `${s.slice(0, max - 1)}…` : s);

// ── Plain-language helpers ──────────────────────────────────────────────────────

function strengthInfo(score: number, t: Tr) {
  const pct = ((score + 2.5) / 5) * 100;
  const raw = `${score > 0 ? '+' : ''}${score.toFixed(1)} / ±2.5`;
  if (score >= 1)  return { pct, raw, label: t('graph.strength.strong'),     color: '#34d399' };
  if (score >= 0)  return { pct, raw, label: t('graph.strength.steady'),     color: '#ffcb3a' };
  if (score >= -1) return { pct, raw, label: t('graph.strength.weak'),       color: '#fb923c' };
  return            { pct, raw, label: t('graph.strength.challenged'), color: '#f43f5e' };
}

// Each band gets its own colour. "Excellent" and "Good" previously shared one
// green, so a 6/10 was indistinguishable from a 9/10 at a glance — the number
// was the only thing separating them and the eye reads the colour first.
function outlookInfo(rating: number, t: Tr) {
  if (rating >= 8) return { word: t('graph.outlook.excellent'),   color: '#34d399' };
  if (rating >= 6) return { word: t('graph.outlook.good'),        color: '#a3d977' };
  if (rating >= 4) return { word: t('graph.outlook.mixed'),       color: '#ffcb3a' };
  return            { word: t('graph.outlook.challenging'), color: '#f43f5e' };
}

function fmtUntil(iso: string, lang: Lang, t: Tr): string {
  try {
    const d = new Date(iso).toLocaleDateString(lang === 'si' ? 'si-LK' : 'en-US', { month: 'short', year: 'numeric' });
    return t('graph.until', { date: d });
  } catch { return ''; }
}

// ── Graph model ─────────────────────────────────────────────────────────────────

type NodeType = 'period' | 'planet' | 'house' | 'area' | 'yoga' | 'transit' | 'remedy';

interface NodeDetail {
  meaning?: string;
  strength?: { pct: number; label: string; color: string; raw: string };
  trend?: { label: string; color: string };
  lines: string[];
  chips: string[];
  takeaway?: string;
}
interface GNode {
  id: string; type: NodeType; glyph: string; label: string; tooltip: string;
  x: number; y: number; r: number; color: string;
  critical: boolean; important: boolean; demanding?: boolean; detail: NodeDetail;
  /** Small satellite disc on the node's rim — the centre wears the rating,
      the life areas wear their birth-chart footing. */
  badge?: { text: string; color: string };
  /** Label drawn above the node instead of below (the top ring). */
  labelAbove?: boolean;
}
interface GEdge {
  from: string; to: string; critical: boolean; dashed?: boolean;
  /** Fixed stroke instead of the source→target gradient (the MD–AD bond). */
  color?: string;
  /** Static link — no flow or packet. The outer-ring relations are facts about
      the chart rather than influence travelling, and every animated edge costs
      frames; the live ones are kept for the dasha chain itself. */
  quiet?: boolean;
}
interface Summary {
  main?: { label: string; meaning: string; strengthLabel: string; critical: boolean; color: string };
  sub?: { label: string; meaning: string };
  outlook: { word: string; color: string; rating: number };
  theme: string;
  goingWell: string[];
  needsCare: string[];
  /** Classical judgement of the Mahadasha–Antardasha pair. */
  bond?: { verdict: string; color: string; lines: string[] };
}

const BOND_HEX: Record<LordPairJudgement['verdict'], string> = {
  good: '#34d399', mixed: '#f59e0b', bad: '#f43f5e',
};

const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
interface Graph { nodes: GNode[]; edges: GEdge[]; criticals: GNode[]; summary: Summary; }

type ExtraLayer = 'yoga' | 'transit' | 'remedy';
const CORE_TYPES: NodeType[] = ['period', 'planet', 'house', 'area'];

function filterGraph(graph: Graph, extras: ReadonlySet<ExtraLayer>): Graph {
  const allowed = new Set<NodeType>([...CORE_TYPES, ...extras]);
  const nodes = graph.nodes.filter(n => allowed.has(n.type));
  const ids = new Set(nodes.map(n => n.id));
  const edges = graph.edges.filter(e => ids.has(e.from) && ids.has(e.to));
  return { nodes, edges, criticals: nodes.filter(n => n.critical), summary: graph.summary };
}

// Seed positions. placeBoard() then lays the nodes out as a left-to-right board.
const CX = 420, CY = 345, R1 = 148, R3 = 296;

/**
 * The centre "now" node. On light surfaces it stays on the brand accent; on
 * dark it burns luminous indigo instead, which separates the one node that is
 * not an influence from the palette every other node draws from.
 */
const PERIOD_LIGHT = 'var(--c-accent)';
const PERIOD_DARK  = '#818cf8';

function polar(cx: number, cy: number, r: number, deg: number) {
  const t = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(t), y: cy + r * Math.sin(t) };
}

/**
 * Planets that work by subtraction. A dignified Saturn is genuinely strong, but
 * marking it plain "Supportive" mislabels the period being lived: its dignity
 * makes results durable, not comfortable. These get their own band so a strong
 * separative lord reads as demanding rather than as good news.
 */
const SEPARATIVE = new Set(['Saturn', 'Rahu', 'Ketu']);

function classifyPlanet(lord: string, ls?: LordStrengthData) {
  if (!ls) return { critical: false, important: false, demanding: false };
  const critical =
    ls.strengthScore < 0 || ls.dignity === 'debilitated' || ls.dignity === 'enemy-sign' ||
    ls.isCombust || ls.functionalNature === 'functional-malefic';
  const capable =
    ls.strengthScore >= 1 || ls.dignity === 'exalted' || ls.dignity === 'own-sign' ||
    ls.functionalNature === 'yogakaraka' || ls.functionalNature === 'functional-benefic';
  const demanding = !critical && SEPARATIVE.has(lord);
  return { critical, important: capable && !demanding, demanding: demanding && capable };
}

function buildGraph(
  prediction: DashaPredictionData, chart: Chart | undefined, av: AshtakavargaResult | undefined,
  yogas: YogaResult[] | undefined, gochara: GocharaSnapshot | undefined,
  lang: Lang, t: Tr, isLight: boolean,
): Graph {
  const nodes: GNode[] = [];
  const edges: GEdge[] = [];
  const lords = prediction.lordStrengths ?? [];
  const cp = prediction.currentPeriods;
  const outlook = outlookInfo(prediction.overallRating, t);

  // Natal placements, when the chart is available. Everything below degrades
  // to the prediction's own data when it is not.
  const asc = chart?.ascendant.rashiIndex;
  const natal = (lord: string): PlanetPosition | undefined =>
    chart?.planets.find(p => p.planet.toUpperCase() === lord.toUpperCase());

  // ── Centre: the running Mahadasha ─────────────────────────────────────────
  // The centre names the period the way a Jyotishi would — by its Mahadasha
  // lord — and wears the outlook rating as a badge. Its detail carries the
  // first thing read for any sub-period: how the Antardasha lord stands to the
  // Mahadasha lord by natural friendship and by mutual placement.
  const md = cp?.mahadasha.lord;
  const ad = cp?.antardasha?.lord;
  const mdName = md ? labelPlanet(md, lang) : '';
  const adName = ad ? labelPlanet(ad, lang) : '';

  let bond: LordPairJudgement | null = null;
  if (md && ad) {
    const a = natal(md); const b = natal(ad);
    if (a && b) bond = judgeLordPair(md, ad, a.rashiIndex, b.rashiIndex);
  }
  const bondLines: string[] = bond
    ? [t(`graph.maitri.${bond.maitri}`, { a: mdName, b: adName }), t(`graph.mutual.${bond.placement}`)]
    : [];
  const bondVerdict = bond ? t(`graph.bond.${bond.verdict}`) : '';

  const centreLines: string[] = [];
  if (md && ad) {
    const untilAd = cp?.antardasha?.end ? fmtUntil(cp.antardasha.end, lang, t) : '';
    centreLines.push([t('graph.periodName', { md: mdName, ad: adName }), untilAd].filter(Boolean).join(' · '));
  }
  centreLines.push(...bondLines);
  if (prediction.overallTheme) centreLines.push(prediction.overallTheme);

  const periodTake = prediction.overallRating >= 6 ? t('graph.take.periodGood')
    : prediction.overallRating >= 4 ? t('graph.take.periodMixed') : t('graph.take.periodHard');
  nodes.push({
    id: 'period', type: 'period',
    glyph: md ? (PLANET_GLYPH[md] ?? '●') : String(prediction.overallRating),
    label: md ? t('graph.mahadashaOf', { planet: mdName }) : t('graph.period'),
    tooltip: `${t('graph.outlookLabel')}: ${outlook.word}`,
    x: CX, y: CY, r: 38, color: isLight ? PERIOD_LIGHT : PERIOD_DARK,
    critical: false, important: false,
    badge: { text: String(prediction.overallRating), color: outlook.color },
    detail: {
      meaning: `${outlook.word} · ${prediction.overallRating}/10`,
      strength: { pct: prediction.overallRating * 10, label: outlook.word, color: outlook.color, raw: `${prediction.overallRating}/10` },
      lines: centreLines,
      chips: bondVerdict ? [bondVerdict] : [],
      takeaway: periodTake,
    },
  });

  // ── Guiding planets (left arc) ─────────────────────────────────────────────
  const levels: { lord: string; role: 'mahadasha' | 'antardasha'; level: string; end?: string }[] = [];
  if (cp) {
    levels.push({ lord: cp.mahadasha.lord, role: 'mahadasha', level: 'Mahadasha', end: cp.mahadasha.end });
    if (cp.antardasha)      levels.push({ lord: cp.antardasha.lord,      role: 'antardasha', level: 'Antardasha',      end: cp.antardasha.end });
    if (cp.pratyantardasha) levels.push({ lord: cp.pratyantardasha.lord, role: 'antardasha', level: 'Pratyantardasha', end: cp.pratyantardasha.end });
    if (cp.sookshmaDasha)   levels.push({ lord: cp.sookshmaDasha.lord,   role: 'antardasha', level: 'Sookshma Dasha',  end: cp.sookshmaDasha.end });
  }

  // One node per planet, however many levels it holds. Every sub-level of
  // Vimshottari restarts the cycle from its parent's lord, so the same planet
  // recurring deeper in the chain (Saturn → Mercury → Saturn → Mercury) is
  // routine — but drawing it as a second planet with a second copy of its
  // houses made the map look duplicated. The planet keeps the role of the
  // highest level it holds, and its detail lists every level.
  const chain: { lord: string; role: 'mahadasha' | 'antardasha'; levels: { level: string; end?: string }[] }[] = [];
  for (const d of levels) {
    const existing = chain.find(c => c.lord === d.lord);
    if (existing) existing.levels.push({ level: d.level, end: d.end });
    else chain.push({ lord: d.lord, role: d.role, levels: [{ level: d.level, end: d.end }] });
  }
  const n = chain.length;
  const planetIds: string[] = [];
  type Rel = { rules: boolean; placed: boolean; aspects: boolean };
  /** Every house each lord touches, kept so the life areas can be wired to
      the lords that actually feed them. */
  const lordHouses: { id: string; lord: string; map: Map<number, Rel> }[] = [];

  chain.forEach((d, i) => {
    // 128°–232°: kept clear of the outer ring's top and bottom arcs so a lord's
    // house fan never lands on a yoga or a transit node.
    const deg = n === 1 ? 180 : 128 + ((232 - 128) * i) / (n - 1);
    const { x, y } = polar(CX, CY, R1, deg);
    const ls = lords.find(l => l.planet === d.lord && l.role === d.role) ?? lords.find(l => l.planet === d.lord);
    const { critical, important, demanding } = classifyPlanet(d.lord, ls);
    const id = `planet-${i}`;
    planetIds.push(id);

    const meaning = labelPlanetTheme(d.lord, lang);
    const lines: string[] = [];
    for (const lv of d.levels) {
      const scope = labelDashaScope(lv.level, lang);
      lines.push([scope, lv.end ? fmtUntil(lv.end, lang, t) : ''].filter(Boolean).join(' · '));
    }
    const chips: string[] = [];
    let strength;
    if (ls) {
      strength = strengthInfo(ls.strengthScore, t);
      if (ls.dignity) chips.push(labelDignity(ls.dignity, lang));
    }

    // Natal placement read from the chart: sign and degree, house and its
    // bhava class, nakshatra and its lord, and the houses it aspects. These
    // are the facts a reading of the lord starts from.
    const np = natal(d.lord);
    const house = np && asc != null ? houseOfRashi(np.rashiIndex, asc) : ls?.natalHouse ?? null;
    const aspected = np && asc != null ? aspectedHouses(d.lord, np.rashiIndex, asc) : [];
    if (np && house != null) {
      lines.push(t('graph.placement', {
        rashi: labelRashi(np.rashiIndex, lang, np.rashi),
        deg: String(Math.floor(np.rashiDegree)),
        house: labelOrdinalHouse(house, lang),
        theme: labelHouseTheme(house, lang),
      }));
      const nak = NAKSHATRAS[np.nakshatraIndex];
      if (nak) lines.push(t('graph.nakshatraLine', { nakshatra: np.nakshatra, lord: labelPlanet(nak[1], lang) }));
      const cls = houseClass(house);
      if (cls !== 'other') chips.push(t(`graph.houseClass.${cls}`));
    } else if (house != null) {
      lines.push(t('graph.sitsIn', { area: labelHouseTheme(house, lang) }));
    }
    if (ls?.lordedHouses.length)
      lines.push(t('graph.influences', { areas: ls.lordedHouses.map(h => labelHouseTheme(h, lang)).join(', ') }));
    if (aspected.length)
      lines.push(t('graph.aspectsHouses', { areas: aspected.map(h => labelHouseTheme(h, lang)).join(', ') }));

    const bindus = av?.selfStrength[titleCase(d.lord) as keyof typeof av.selfStrength];
    if (bindus != null) chips.push(t('graph.bindus', { n: bindus }));
    if (ls) {
      if (ls.isCombust)    chips.push(t('insights.combust'));
      if (ls.isRetrograde) chips.push(t('planet.retrograde'));
      if (ls.neechaBhanga) chips.push(t('insights.neechaBhanga'));
      if (demanding)       chips.push(t('graph.demanding'));
    }
    const takeaway = critical ? t('graph.take.planetWeak')
      : demanding ? t('graph.take.planetDemanding')
      : important ? t('graph.take.planetStrong') : t('graph.take.planetSteady');

    nodes.push({
      id, type: 'planet', glyph: PLANET_GLYPH[d.lord] ?? '●',
      label: labelPlanet(d.lord, lang),
      tooltip: `${labelPlanet(d.lord, lang)} — ${meaning}`,
      x, y, r: 28, color: LORD_HEX[d.lord] ?? '#94a3b8',
      critical, important, demanding,
      detail: { meaning, strength, lines: lines.filter(Boolean), chips, takeaway },
    });
    edges.push({ from: 'period', to: id, critical });

    // Life themes (houses) this planet activates: where it sits, what it rules,
    // and what it aspects by graha drishti.
    const houseMap = new Map<number, Rel>();
    const rel = (h: number): Rel => houseMap.get(h) ?? { rules: false, placed: false, aspects: false };
    (ls?.lordedHouses ?? []).forEach(h => houseMap.set(h, { ...rel(h), rules: true }));
    if (house != null) houseMap.set(house, { ...rel(house), placed: true });
    aspected.forEach(h => houseMap.set(h, { ...rel(h), aspects: true }));
    lordHouses.push({ id, lord: d.lord, map: houseMap });

    // Only a few fit around a planet, so choose which rather than taking
    // whichever happened to be inserted first: where the planet actually sits
    // matters most, then what it rules, then what it merely aspects — and a
    // sensitive (dusthana) theme must never be the one silently dropped.
    const maxHouses = n <= 2 ? 3 : 2;
    const houses = [...houseMap.entries()]
      .sort(([ha, ra], [hb, rb]) => {
        const rank = (h: number, r: Rel) =>
          (r.placed ? 0 : r.rules ? 2 : 4) + (DUSTHANA.has(h) ? 0 : 1);
        return rank(ha, ra) - rank(hb, rb);
      })
      .slice(0, maxHouses);
    const hN = houses.length;
    // Three satellites need a wider fan than two, or their labels touch.
    const fan = hN >= 3 ? 58 : 38;
    houses.forEach(([h, r], k) => {
      const hDeg = deg + (hN === 1 ? 0 : fan * (k - (hN - 1) / 2));
      const hp = polar(x, y, hN >= 3 ? 98 : 86, hDeg);
      const dusthana = DUSTHANA.has(h);
      const relation = r.placed ? t('graph.relPlaced') : r.rules ? t('graph.relRules') : t('graph.relAspects');
      const aspectOnly = !r.placed && !r.rules;
      const hid = `house-${i}-${h}`;
      nodes.push({
        id: hid, type: 'house', glyph: String(h),
        label: labelHouseTheme(h, lang),
        tooltip: `${labelHouseTheme(h, lang)} — ${labelHouseCovers(h, lang)}`,
        x: hp.x, y: hp.y, r: 18, color: dusthana ? '#fb7185' : '#64748b',
        critical: dusthana, important: false,
        detail: {
          meaning: labelHouseCovers(h, lang),
          lines: [t('graph.activatedBy', { planet: labelPlanet(d.lord, lang), relation })],
          chips: dusthana ? [t('graph.sensitiveArea')] : [],
          takeaway: dusthana ? t('graph.take.houseSensitive') : t('graph.take.houseFocus'),
        },
      });
      edges.push({ from: id, to: hid, critical: dusthana || critical, dashed: aspectOnly });
    });
  });

  // Dasha hierarchy chain. The first link is the Mahadasha–Antardasha bond and
  // takes the colour of its classical verdict; deeper links stay subtle.
  for (let i = 0; i < planetIds.length - 1; i++) {
    const isBond = i === 0 && bond != null && chain[0].lord === md && chain[1].lord === ad;
    edges.push({
      from: planetIds[i], to: planetIds[i + 1], critical: false, dashed: true,
      color: isBond && bond ? BOND_HEX[bond.verdict] : undefined,
    });
  }

  // ── Life areas (right arc) ─────────────────────────────────────────────────
  const areas = (['career', 'wealth', 'relationships', 'health'] as const)
    .map(key => ({ key, data: prediction.predictions[key] }))
    .filter(a => a.data);
  const m = areas.length;
  const foundation = prediction.natalFoundation ?? [];
  areas.forEach((a, i) => {
    const deg = m === 1 ? 0 : -64 + (128 * i) / (m - 1);
    const { x, y } = polar(CX, CY, R1, deg);
    const trend = a.data.trend;
    const trendLabel = labelTrend(trend, lang);
    const id = `area-${a.key}`;
    const take = trend === 'positive' ? t('graph.take.areaGood')
      : trend === 'negative' ? t('graph.take.areaBad')
      : trend === 'mixed' ? t('graph.take.areaMixed') : '';

    // The birth chart's standing promise for this area rides on the node as a
    // badge (−3…+3), so a good period on a weak footing — or the reverse — is
    // visible without opening anything.
    const f = foundation.find(row => row.area === FOUNDATION_KEY[a.key]);
    const footing = f
      ? f.weak ? { color: '#f43f5e', label: t('graph.foundation.weak') }
        : f.strong ? { color: '#34d399', label: t('graph.foundation.strong') }
        : { color: '#ffcb3a', label: t('graph.foundation.mixed') }
      : undefined;
    const lines = [a.data.summary];
    if (f && footing) lines.push(t('graph.footing', { label: footing.label }), ...(f.notes.slice(0, 1)));

    // Wire each running lord that sits in, rules, or aspects one of this
    // area's houses — the causal path from the dasha to the outcome.
    const chips: string[] = [];
    for (const lh of lordHouses) {
      const hit = AREA_HOUSES[a.key]
        .map(h => ({ h, r: lh.map.get(h) }))
        .filter((e): e is { h: number; r: Rel } => !!e.r)
        .sort((p, q) => (p.r.placed ? 0 : p.r.rules ? 1 : 2) - (q.r.placed ? 0 : q.r.rules ? 1 : 2))[0];
      if (!hit) continue;
      const key = hit.r.placed ? 'graph.drivesPlaced' : hit.r.rules ? 'graph.drivesRules' : 'graph.drivesAspects';
      // Name the bhava, not just its theme: the 6th feeds career as the house
      // of service, and "Health" alone would read as the wrong area.
      lines.push(t(key, {
        planet: labelPlanet(lh.lord, lang),
        house: `${labelOrdinalHouse(hit.h, lang)} (${labelHouseTheme(hit.h, lang)})`,
      }));
      chips.push(labelPlanet(lh.lord, lang));
      edges.push({ from: lh.id, to: id, critical: false, dashed: !hit.r.placed && !hit.r.rules, quiet: true });
    }
    lines.push(...(a.data.details?.slice(0, 1) ?? []));

    nodes.push({
      id, type: 'area', glyph: TREND_ARROW[trend] ?? '→',
      label: labelArea(a.key, lang),
      tooltip: `${labelArea(a.key, lang)} — ${trendLabel}`,
      x, y, r: 27, color: TREND_HEX[trend] ?? TREND_HEX.neutral,
      critical: trend === 'negative', important: trend === 'positive',
      badge: f && footing ? { text: `${f.score < 0 ? '−' : '+'}${Math.abs(f.score).toFixed(1)}`, color: footing.color } : undefined,
      detail: {
        trend: { label: trendLabel, color: TREND_HEX[trend] ?? TREND_HEX.neutral },
        lines: lines.filter(Boolean),
        chips,
        takeaway: take,
      },
    });
    edges.push({ from: 'period', to: id, critical: trend === 'negative' });
  });

  // ── Outer ring, top: classical yogas the running lords form ────────────────
  // A yoga pays out in the periods of the planets that form it, so the ones
  // involving a running lord come first and are wired to that lord; the rest
  // hang off the centre as standing promises of the chart.
  const chainLords = new Set(chain.map(c => c.lord.toUpperCase()));
  const lordNode = (p: string) => lordHouses.find(lh => lh.lord.toUpperCase() === p.toUpperCase())?.id;
  const rankedYogas = (yogas ?? [])
    .filter(y => y.isPresent)
    .map(y => ({ y, active: y.planetsInvolved.filter(p => chainLords.has(p.toUpperCase())) }))
    .sort((p, q) => (q.active.length > 0 ? 1 : 0) - (p.active.length > 0 ? 1 : 0) || q.y.strengthScore - p.y.strengthScore)
    .slice(0, 3);
  const yN = rankedYogas.length;
  rankedYogas.forEach(({ y, active }, i) => {
    const deg = yN === 1 ? 270 : 236 + ((304 - 236) * i) / (yN - 1);
    const { x, y: py } = polar(CX, CY, R3, deg);
    const id = `yoga-${i}`;
    const color = YOGA_HEX[y.category] ?? YOGA_HEX.special;
    const cat = labelYogaCategory(y.category, lang);
    const bad = y.category === 'daridra';
    const isActive = active.length > 0;
    const lines = [
      cat.description,
      t('graph.yogaFormedBy', {
        planets: y.planetsInvolved.map(p => labelPlanet(p, lang)).join(', '),
        houses: y.housesInvolved.join(', '),
      }),
      isActive ? t('graph.yogaActive', { planet: labelPlanet(active[0], lang) }) : t('graph.yogaDormant'),
      y.effects,
    ].filter(Boolean);
    nodes.push({
      id, type: 'yoga', glyph: YOGA_GLYPH[y.category] ?? '✧',
      label: ellipsis(y.name, 24), tooltip: `${y.name} — ${cat.label}`,
      x, y: py, r: 22, color, labelAbove: true,
      critical: bad && isActive, important: !bad && isActive && y.strengthScore >= 6,
      detail: {
        meaning: `${cat.label} · ${labelYogaStrength(y.strength, lang)}`,
        strength: { pct: y.strengthScore * 10, label: labelYogaStrength(y.strength, lang), color, raw: `${y.strengthScore}/10` },
        lines, chips: [cat.label, ...(isActive ? active.map(p => labelPlanet(p, lang)) : [])],
        takeaway: bad ? t('graph.take.yogaBad') : t('graph.take.yogaGood'),
      },
    });
    const targets = active.map(lordNode).filter((v): v is string => !!v);
    if (targets.length) targets.forEach(to => edges.push({ from: id, to, critical: bad, color }));
    else edges.push({ from: id, to: 'period', critical: false, dashed: true, quiet: true, color });
  });

  // ── Outer ring, bottom: gochara of the slow movers against the natal Moon ──
  // Saturn, Jupiter and the nodes hold a sign for a year or more, so their
  // transit colours the whole sub-period. Each is judged from the Moon by the
  // classical table; the running lord's own transit is wired to its natal node
  // because a dasha lord's gochara is the one felt most.
  const transits = GOCHARA_BODIES
    .map(p => gochara?.transits.find(tr => tr.planet.toUpperCase() === p))
    .filter((tr): tr is NonNullable<typeof tr> => !!tr);
  const tN = transits.length;
  transits.forEach((tr, i) => {
    const deg = tN === 1 ? 90 : 58 + ((122 - 58) * i) / (tN - 1);
    const { x, y } = polar(CX, CY, R3, deg);
    const id = `transit-${i}`;
    const lord = titleCase(tr.planet);
    const own = lordNode(tr.planet);
    const isSaturn = tr.planet.toUpperCase() === 'SATURN';
    const sade = isSaturn && gochara?.sadeSati.active ? gochara.sadeSati : undefined;
    const color = tr.valence > 0 ? '#34d399' : tr.valence < 0 ? '#f43f5e' : '#94a3b8';
    const critical = tr.valence < 0 && (!!own || !!sade || tr.houseFromMoon === 8);
    const lines = [
      t('graph.transitLine', {
        rashi: labelRashi(tr.rashi, lang, tr.rashiName),
        fromMoon: labelOrdinalHouse(tr.houseFromMoon, lang),
        fromLagna: labelOrdinalHouse(tr.houseFromLagna, lang),
      }),
      tr.note ?? '',
      sade?.description ?? '',
      own ? t('graph.transitOwnLord') : '',
      tr.planet.toUpperCase() === 'JUPITER' && gochara?.jupiterBlessing.auspicious ? gochara.jupiterBlessing.reason : '',
    ].filter(Boolean);
    const chips = [
      tr.valence > 0 ? t('graph.transitFavourable') : tr.valence < 0 ? t('graph.transitAdverse') : '',
      sade && sade.phase !== 'none' ? t(`graph.sadeSati.${sade.phase}`) : '',
      tr.dignity ? labelDignity(tr.dignity, lang) : '',
      tr.isRetrograde ? t('planet.retrograde') : '',
      tr.vedha ? t('graph.vedha', { planet: labelPlanet(tr.vedha.byPlanet, lang) }) : '',
    ].filter(Boolean);
    nodes.push({
      id, type: 'transit', glyph: PLANET_GLYPH[lord] ?? '●',
      label: t('graph.transitLabel', { planet: labelPlanet(lord, lang) }),
      tooltip: `${t('graph.transitLabel', { planet: labelPlanet(lord, lang) })} — ${labelRashi(tr.rashi, lang, tr.rashiName)}`,
      x, y, r: 22, color,
      critical, important: tr.valence > 0 && !!own,
      detail: {
        meaning: labelPlanetTheme(lord, lang),
        lines, chips,
        takeaway: tr.valence > 0 ? t('graph.take.transitGood') : tr.valence < 0 ? t('graph.take.transitBad') : t('graph.take.transitNeutral'),
      },
    });
    if (own) edges.push({ from: id, to: own, critical, color });
    else edges.push({ from: id, to: 'period', critical: false, dashed: true, quiet: true, color });
  });

  // ── Outer ring, right: remedies for the Mahadasha lord ─────────────────────
  const remedies = (['gemstone', 'mantra', 'deity'] as const)
    .map(k => ({ k, value: prediction.remedies?.[k] }))
    .filter((r): r is { k: typeof r.k; value: string } => !!r.value);
  const rN = remedies.length;
  const remedyColor = md ? LORD_HEX[md] ?? '#c4b5fd' : '#c4b5fd';
  remedies.forEach((r, i) => {
    const deg = rN === 1 ? 0 : -28 + (56 * i) / (rN - 1);
    const { x, y } = polar(CX, CY, R3, deg);
    const id = `remedy-${r.k}`;
    nodes.push({
      id, type: 'remedy', glyph: REMEDY_GLYPH[r.k],
      label: ellipsis(r.value, 20), tooltip: `${t(`graph.remedy.${r.k}`)} — ${r.value}`,
      x, y, r: 19, color: remedyColor,
      critical: false, important: false,
      detail: {
        meaning: t(`graph.remedy.${r.k}`),
        lines: [r.value, md ? t('graph.remedyFor', { planet: mdName }) : ''].filter(Boolean),
        chips: md ? [mdName] : [],
        takeaway: t('graph.take.remedy'),
      },
    });
    edges.push({ from: id, to: 'period', critical: false, dashed: true, quiet: true });
  });

  // ── Plain summary ───────────────────────────────────────────────────────────
  const mainLs = cp ? (lords.find(l => l.planet === cp.mahadasha.lord && l.role === 'mahadasha') ?? lords.find(l => l.planet === cp.mahadasha.lord)) : undefined;
  const mainCls = cp ? classifyPlanet(cp.mahadasha.lord, mainLs) : { critical: false, important: false, demanding: false };
  const summary: Summary = {
    main: cp ? {
      label: labelPlanet(cp.mahadasha.lord, lang),
      meaning: labelPlanetTheme(cp.mahadasha.lord, lang),
      strengthLabel: mainLs ? strengthInfo(mainLs.strengthScore, t).label : '',
      critical: mainCls.critical, color: LORD_HEX[cp.mahadasha.lord] ?? '#94a3b8',
    } : undefined,
    sub: cp?.antardasha ? {
      label: labelPlanet(cp.antardasha.lord, lang),
      meaning: labelPlanetTheme(cp.antardasha.lord, lang),
    } : undefined,
    outlook: { ...outlook, rating: prediction.overallRating },
    theme: prediction.overallTheme,
    goingWell: areas.filter(a => a.data.trend === 'positive').map(a => labelArea(a.key, lang)),
    needsCare: areas.filter(a => a.data.trend === 'negative').map(a => labelArea(a.key, lang)),
    bond: bond ? { verdict: bondVerdict, color: BOND_HEX[bond.verdict], lines: bondLines } : undefined,
  };

  placeBoard(nodes, edges);
  return { nodes, edges, criticals: nodes.filter(node => node.critical), summary };
}

// ── Board layout ──────────────────────────────────────────────────────────────
// Planets on the left, the period in the middle, life areas on the right.
// House themes sit in a slim column beside the planet that touches them.

const PLANET_INK: Record<string, string> = {
  '☉': '#c2410c', '☽': '#64748b', '♂': '#b91c1c', '☿': '#0f766e',
  '♃': '#a16207', '♀': '#9d174d', '♄': '#1e3a8a', '☊': '#44403c', '☋': '#9a3412',
};
const AREA_INK: Record<string, string> = {
  '↑': '#0f766e', '↗': '#a16207', '→': '#57534e', '↓': '#be123c',
};

function cardSize(type: NodeType): { w: number; h: number } {
  switch (type) {
    case 'period': return { w: 200, h: 64 };
    case 'planet': return { w: 150, h: 48 };
    case 'area': return { w: 180, h: 48 };
    case 'house': return { w: 112, h: 30 };
    case 'yoga': return { w: 158, h: 36 };
    case 'transit': return { w: 136, h: 34 };
    case 'remedy': return { w: 148, h: 32 };
  }
}

function placeBoard(nodes: GNode[], edges: GEdge[]) {
  const of = (type: NodeType) => nodes.filter(n => n.type === type);
  const planets = of('planet');
  const areas = of('area');
  const yogas = of('yoga');
  const transits = of('transit');
  const remedies = of('remedy');
  const period = of('period')[0];

  const housesOf = (planetId: string) => {
    const ids = new Set(edges.filter(e => e.from === planetId).map(e => e.to));
    return nodes.filter(n => n.type === 'house' && ids.has(n.id));
  };
  const maxHouses = Math.max(0, ...planets.map(p => housesOf(p.id).length));
  const rowGap = maxHouses > 0 ? 78 + maxHouses * 36 : 96;
  const rows = Math.max(planets.length, areas.length, 1);
  const top = yogas.length || remedies.length ? 92 : 58;
  const body = rows * rowGap;
  const width = 960;

  const planetX = 150;
  const periodX = 470;
  const areaX = 790;
  const yOf = (i: number, count: number) =>
    top + rowGap * i + rowGap / 2 + ((rows - count) * rowGap) / 2;

  planets.forEach((p, i) => {
    if (PLANET_INK[p.glyph]) p.color = PLANET_INK[p.glyph];
    p.x = planetX;
    p.y = yOf(i, planets.length);
    const houses = housesOf(p.id);
    houses.forEach((h, k) => {
      h.color = h.critical ? '#e11d48' : '#78716c';
      h.x = p.x;
      h.y = p.y + 46 + k * 36;
    });
  });
  areas.forEach((a, i) => {
    if (AREA_INK[a.glyph]) a.color = AREA_INK[a.glyph];
    a.x = areaX;
    a.y = yOf(i, areas.length);
  });
  if (period) {
    period.color = 'var(--c-accent)';
    period.x = periodX;
    period.y = top + body / 2;
  }
  [...yogas, ...remedies].forEach((n, i, all) => {
    if (n.type === 'remedy') n.color = '#b45309';
    n.x = 130 + ((width - 240) * (i + 0.5)) / all.length;
    n.y = 36;
    n.labelAbove = false;
  });
  transits.forEach((n, i) => {
    n.x = 130 + ((width - 240) * (i + 0.5)) / transits.length;
    n.y = top + body + 30;
  });
}

function linkPath(a: GNode, b: GNode, period?: GNode): string {
  const as = cardSize(a.type);
  const bs = cardSize(b.type);
  if (Math.abs(a.x - b.x) < 8) {
    const dir = Math.sign(b.y - a.y) || 1;
    return `M ${a.x} ${a.y + dir * as.h / 2} L ${b.x} ${b.y - dir * bs.h / 2}`;
  }
  const leftToRight = b.x > a.x;
  const x1 = a.x + (leftToRight ? as.w / 2 : -as.w / 2);
  const x2 = b.x + (leftToRight ? -bs.w / 2 : bs.w / 2);
  const y1 = a.y;
  const y2 = b.y;
  const dx = x2 - x1;
  let bow = 0;
  if (period && a.type !== 'period' && b.type !== 'period' && x1 < period.x && x2 > period.x) {
    const mid = (y1 + y2) / 2;
    if (Math.abs(mid - period.y) < cardSize('period').h) bow = mid <= period.y ? -48 : 48;
  }
  return `M ${x1} ${y1} C ${x1 + dx * 0.45} ${y1 + bow}, ${x2 - dx * 0.45} ${y2 + bow}, ${x2} ${y2}`;
}

const GraphCanvas: React.FC<{
  graph: Graph; isLight: boolean; selected: string | null;
  onSelect: (id: string | null) => void;
  /** Cap the drawing height (expanded view). preserveAspectRatio keeps the
      scene centred and undistorted inside whatever box it ends up with. */
  maxHeight?: string;
}> = ({ graph, isLight, selected, onSelect, maxHeight }) => {
  const { t } = useLang();
  const byId = useMemo(() => Object.fromEntries(graph.nodes.map(node => [node.id, node])), [graph]);
  // Pointer hover and keyboard focus drive the same "this is interactive" state.
  const [hot, setHot] = useState<string | null>(null);

  /** Who is wired to whom — drives the connection highlight on hover/select. */
  const neighbours = useMemo(() => {
    const map: Record<string, Set<string>> = {};
    for (const e of graph.edges) {
      (map[e.from] ??= new Set()).add(e.to);
      (map[e.to] ??= new Set()).add(e.from);
    }
    return map;
  }, [graph]);

  // Hovering or selecting a node isolates its actual chain of influence: the
  // node, whatever it connects to, and the links between them stay lit while
  // everything else recedes.
  const focus = hot ?? selected;
  const related = focus ? neighbours[focus] : undefined;

  const paper = isLight ? '#fffcfa' : '#14161e';
  const ink = isLight ? '#1c1917' : '#f5f5f4';
  const quiet = isLight ? '#a8a29e' : 'rgba(255,255,255,0.38)';
  const hair = isLight ? '#e7e5e4' : 'rgba(255,255,255,0.10)';
  const linkInk = isLight ? '#d6d3d1' : 'rgba(255,255,255,0.16)';

  const bounds = useMemo(() => {
    let minX = 40, minY = 16, maxX = 200, maxY = 120;
    for (const n of graph.nodes) {
      const { w, h } = cardSize(n.type);
      minX = Math.min(minX, n.x - w / 2);
      minY = Math.min(minY, n.y - h / 2);
      maxX = Math.max(maxX, n.x + w / 2);
      maxY = Math.max(maxY, n.y + h / 2);
    }
    const pad = 28;
    return { x: minX - pad, y: minY - pad - 8, w: maxX - minX + pad * 2, h: maxY - minY + pad * 2 + 8 };
  }, [graph]);

  const captions = [
    graph.nodes.some(n => n.type === 'planet') ? { x: 150, label: t('graph.legendPlanet') } : null,
    graph.nodes.some(n => n.type === 'period') ? { x: 470, label: t('graph.layerNow') } : null,
    graph.nodes.some(n => n.type === 'area') ? { x: 790, label: t('graph.legendArea') } : null,
  ].filter((c): c is { x: number; label: string } => !!c);
  const captionY = Math.min(...graph.nodes.filter(n => n.type === 'planet' || n.type === 'period' || n.type === 'area').map(n => n.y - cardSize(n.type).h / 2)) - 16;

  return (
    <svg viewBox={`${bounds.x} ${bounds.y} ${bounds.w} ${bounds.h}`} className="w-full h-auto select-none" role="img"
      style={maxHeight ? { maxHeight, height: '100%', width: 'auto', maxWidth: '100%' } : undefined}
      preserveAspectRatio="xMidYMid meet"
      onClick={() => onSelect(null)}>
      {captions.map(c => (
        <text key={c.label} x={c.x} y={captionY} textAnchor="middle"
          fill={quiet} fontSize="11" fontWeight={700}
          style={{ letterSpacing: '0.08em', textTransform: 'uppercase', pointerEvents: 'none' }}>
          {c.label}
        </text>
      ))}

      {graph.edges.map((e, i) => {
        const a = byId[e.from]; const b = byId[e.to];
        if (!a || !b) return null;
        const lit = !focus || focus === e.from || focus === e.to;
        const asked = !!focus && lit;
        // Planet-to-area links are the fine wiring. They appear when that
        // planet or area is open, so the board itself stays a single flow.
        if (e.quiet && !asked) return null;
        const stroke = e.critical ? '#e11d48' : asked ? (a.color.startsWith('#') ? a.color : 'var(--c-accent)') : linkInk;
        return (
          <path key={i} d={linkPath(a, b, byId['period'])} fill="none"
            stroke={stroke}
            strokeWidth={asked ? 2 : e.quiet ? 1 : 1.35}
            strokeDasharray={e.dashed ? '4 5' : undefined}
            strokeLinecap="round"
            opacity={lit ? 1 : 0.12}
            style={{ transition: 'opacity 0.2s ease' }}
          />
        );
      })}

      {graph.nodes.map(node => {
        const isSel = selected === node.id;
        const isHot = hot === node.id;
        const live = isSel || isHot;
        const isLinked = !!focus && focus !== node.id && !!related?.has(node.id);
        const isMuted = !!focus && focus !== node.id && !isLinked;
        const { w, h } = cardSize(node.type);
        const mark = node.critical ? '#e11d48' : node.demanding ? '#d97706' : node.color;
        const border = live ? mark : isLinked ? mark : hair;
        return (
          <g key={node.id} transform={`translate(${node.x},${node.y})`}
            className="cursor-pointer focus:outline-none"
            role="button" tabIndex={0} aria-label={node.tooltip}
            opacity={isMuted ? 0.32 : 1}
            style={{ transition: 'opacity 0.2s ease' }}
            onClick={ev => { ev.stopPropagation(); onSelect(isSel ? null : node.id); }}
            onKeyDown={ev => {
              if (ev.key === 'Enter' || ev.key === ' ') {
                ev.preventDefault(); ev.stopPropagation();
                onSelect(isSel ? null : node.id);
              }
            }}
            onMouseEnter={() => setHot(node.id)}
            onMouseLeave={() => setHot(h => (h === node.id ? null : h))}
            onFocus={() => setHot(node.id)}
            onBlur={() => setHot(h => (h === node.id ? null : h))}
          >
            <title>{node.tooltip}</title>
            <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={node.type === 'house' ? 8 : 14}
              fill={paper} stroke={border} strokeWidth={live ? 1.75 : 1} />
            <rect x={-w / 2} y={-h / 2 + 8} width={3} height={h - 16} rx={1.5} fill={mark} />
            <text x={-w / 2 + 16} y={node.badge ? -1 : 0} textAnchor="start" dominantBaseline="middle"
              fontSize={node.type === 'house' ? 12 : 15} fill={mark} style={{ pointerEvents: 'none' }}>
              {node.glyph}
            </text>
            <text x={-w / 2 + (node.type === 'house' ? 34 : 38)} y={node.badge ? -1 : 0}
              textAnchor="start" dominantBaseline="middle"
              fontSize={node.type === 'period' ? 13 : node.type === 'house' ? 11 : 12.5}
              fontWeight={650} fill={ink} className="si-svg-label"
              style={{ pointerEvents: 'none' }}>
              {node.label}
            </text>
            {node.badge && (
              <text x={w / 2 - 12} y={1} textAnchor="end" dominantBaseline="middle"
                fontSize={11} fontWeight={700} fill={node.badge.color} style={{ pointerEvents: 'none' }}>
                {node.badge.text}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};

/** Compact period strip for the side rail — the long banner used to repeat
 *  everything the map already shows. */
const NowCard: React.FC<{ summary: Summary; isLight: boolean }> = ({ summary, isLight }) => {
  const { t } = useLang();
  const head = isLight ? 'text-gray-800' : 'text-white';
  const muted = isLight ? 'text-slate-500' : 'text-white/45';
  return (
    <div className="rounded-xl border p-3.5"
      style={{ borderColor: 'rgba(var(--c-accent-rgb),0.18)', background: 'rgba(var(--c-accent-rgb),0.05)' }}>
      <div className="flex items-center gap-2 mb-2.5">
        <span className={`text-[11px] font-bold uppercase tracking-wider ${head}`}>{t('graph.summaryTitle')}</span>
        <span className="ml-auto text-[11px] font-bold px-2 py-0.5 rounded-full"
          style={{ color: summary.outlook.color, background: `${summary.outlook.color}1f` }}>
          {summary.outlook.word} · {summary.outlook.rating}/10
        </span>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {summary.main && (
          <div>
            <div className={`text-[10px] uppercase tracking-wider ${muted}`}>{t('graph.mainLabel')}</div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: summary.main.color }} />
              <span className={`text-sm font-semibold ${head}`}>{summary.main.label}</span>
            </div>
          </div>
        )}
        {summary.sub && (
          <div>
            <div className={`text-[10px] uppercase tracking-wider ${muted}`}>{t('graph.subLabel')}</div>
            <span className={`text-sm font-semibold ${head}`}>{summary.sub.label}</span>
          </div>
        )}
      </div>
      {(summary.goingWell.length > 0 || summary.needsCare.length > 0) && (
        <div className="mt-2.5 space-y-1">
          {summary.goingWell.length > 0 && (
            <p className="flex items-center gap-1.5 text-xs">
              <CheckCircle2 className={`w-3 h-3 shrink-0 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
              <span className={`font-semibold ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>{summary.goingWell.join(', ')}</span>
            </p>
          )}
          {summary.needsCare.length > 0 && (
            <p className="flex items-center gap-1.5 text-xs">
              <AlertTriangle className={`w-3 h-3 shrink-0 ${isLight ? 'text-rose-600' : 'text-rose-400'}`} />
              <span className={`font-semibold ${isLight ? 'text-rose-700' : 'text-rose-400'}`}>{summary.needsCare.join(', ')}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// ── Legend ──────────────────────────────────────────────────────────────────

const Legend: React.FC<{ isLight: boolean; extras: ReadonlySet<ExtraLayer> }> = ({ isLight, extras }) => {
  const { t } = useLang();
  const txt = isLight ? 'text-slate-500' : 'text-white/45';
  const items: { c: string; k: 'graph.critical' | 'graph.important' | 'graph.legendTheme' | 'graph.legendYoga' | 'graph.legendTransit' | 'graph.legendRemedy' }[] = [
    { c: '#f43f5e', k: 'graph.critical' },
    { c: '#34d399', k: 'graph.important' },
    { c: '#64748b', k: 'graph.legendTheme' },
  ];
  if (extras.has('yoga')) items.push({ c: '#fbbf24', k: 'graph.legendYoga' });
  if (extras.has('transit')) items.push({ c: '#60a5fa', k: 'graph.legendTransit' });
  if (extras.has('remedy')) items.push({ c: '#c4b5fd', k: 'graph.legendRemedy' });
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      {items.map(it => (
        <span key={it.k} className={`flex items-center gap-1.5 text-[10.5px] font-medium ${txt}`}>
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: it.c }} />
          {t(it.k)}
        </span>
      ))}
    </div>
  );
};

// ── Strength meter ──────────────────────────────────────────────────────────────

const Meter: React.FC<{ pct: number; color: string; label: string; raw: string; isLight: boolean }> = ({ pct, color, label, raw, isLight }) => (
  <div>
    <div className="flex items-center justify-between mb-1">
      <span className="text-xs font-semibold" style={{ color }}>{label}</span>
      <span className={`text-[10px] font-mono ${isLight ? 'text-slate-400' : 'text-white/35'}`}>{raw}</span>
    </div>
    <div className={`h-1.5 rounded-full overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-white/10'}`}>
      <div className="h-full rounded-full" style={{ width: `${Math.max(4, Math.min(100, pct))}%`, backgroundColor: color }} />
    </div>
  </div>
);

// ── Detail / critical summary ──────────────────────────────────────────────────

const DetailPanel: React.FC<{ graph: Graph; selected: string | null; isLight: boolean }> = ({ graph, selected, isLight }) => {
  const { t } = useLang();
  const node = selected ? graph.nodes.find(x => x.id === selected) : null;
  const head = isLight ? 'text-gray-800' : 'text-white';
  const body = isLight ? 'text-slate-600' : 'text-white/60';

  if (node) {
    const d = node.detail;
    return (
      <div className="rounded-xl border p-4 space-y-3"
        style={{
          borderColor: node.critical ? 'rgba(244,63,94,0.3)' : 'rgba(var(--c-accent-rgb),0.22)',
          background: node.critical ? 'rgba(244,63,94,0.06)' : 'rgba(var(--c-accent-rgb),0.05)',
        }}>
        <div className="flex items-center gap-2">
          <span className="text-base leading-none" aria-hidden>{node.glyph}</span>
          <span className={`text-sm font-bold ${head}`}>{node.label}</span>
          {node.critical && (
            <span className="ml-auto text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400">
              {t('graph.critical')}
            </span>
          )}
          {node.demanding && !node.critical && (
            <span className="ml-auto text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400">
              {t('graph.demanding')}
            </span>
          )}
          {node.important && !node.critical && !node.demanding && (
            <span className="ml-auto text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/12 text-emerald-400">
              {t('graph.important')}
            </span>
          )}
        </div>

        {d.meaning && <p className={`text-xs ${body}`}>{d.meaning}</p>}
        {d.trend && (
          <span className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ color: d.trend.color, background: `${d.trend.color}1f` }}>
            {d.trend.label}
          </span>
        )}
        {d.strength && <Meter {...d.strength} isLight={isLight} />}

        {d.lines.length > 0 && (
          <ul className="space-y-1">
            {d.lines.map((m, i) => (
              <li key={i} className={`text-xs leading-relaxed flex items-start gap-1.5 ${body}`}>
                <span className="mt-0.5 shrink-0" style={{ color: 'var(--c-accent)' }}>›</span>{m}
              </li>
            ))}
          </ul>
        )}
        {d.chips.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {d.chips.map((c, i) => (
              <span key={i} className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${isLight ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-white/6 text-white/60 border-white/12'}`}>{c}</span>
            ))}
          </div>
        )}
        {d.takeaway && (
          <div className="flex items-start gap-2 pt-2 border-t" style={{ borderColor: isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.07)' }}>
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: 'var(--c-accent-2)' }} />
            <p className={`text-xs leading-relaxed ${body}`}><span className="font-semibold">{t('graph.whatThisMeans')}: </span>{d.takeaway}</p>
          </div>
        )}
      </div>
    );
  }

  // Default: critical-entity summary in plain language
  return (
    <div className="rounded-xl border p-4"
      style={{
        borderColor: graph.criticals.length ? 'rgba(244,63,94,0.25)' : 'rgba(16,185,129,0.25)',
        background: graph.criticals.length ? 'rgba(244,63,94,0.05)' : 'rgba(16,185,129,0.05)',
      }}>
      <div className="flex items-center gap-2 mb-2">
        {graph.criticals.length ? <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> : <Sparkles className="w-3.5 h-3.5 text-emerald-400" />}
        <span className={`text-xs font-bold uppercase tracking-wider ${head}`}>{t('graph.criticalTitle')}</span>
      </div>
      {graph.criticals.length === 0 ? (
        <p className={`text-xs ${body}`}>{t('graph.criticalEmpty')}</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {graph.criticals.map(c => (
            <span key={c.id} className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border bg-rose-500/10 ${isLight ? 'text-rose-700 border-rose-300' : 'text-rose-300 border-rose-400/25'}`}>
              {c.glyph} {c.label}
            </span>
          ))}
        </div>
      )}
      <p className={`text-[10px] mt-2.5 ${isLight ? 'text-slate-400' : 'text-white/30'}`}>{t('graph.tapHint')}</p>
    </div>
  );
};

const ActivitiesCard: React.FC<{ prediction: DashaPredictionData; isLight: boolean }> = ({ prediction, isLight }) => {
  const { t } = useLang();
  const good = prediction.favorableActivities?.slice(0, 3) ?? [];
  const bad = prediction.unfavorableActivities?.slice(0, 3) ?? [];
  if (!good.length && !bad.length) return null;
  const head = isLight ? 'text-gray-700' : 'text-white/75';
  const goodTxt = isLight ? 'text-emerald-700' : 'text-emerald-300/85';
  const badTxt = isLight ? 'text-rose-700' : 'text-rose-300/80';

  return (
    <div className="rounded-xl border p-3.5 grid grid-cols-1 sm:grid-cols-2 gap-3"
      style={{ borderColor: isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.08)' }}>
      {good.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <CheckCircle2 className={`w-3.5 h-3.5 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
            <span className={`text-[10px] font-bold uppercase tracking-wider ${head}`}>{t('graph.goodToDo')}</span>
          </div>
          <ul className="space-y-1">
            {good.map((a, i) => <li key={i} className={`text-xs leading-relaxed ${goodTxt}`}>{a}</li>)}
          </ul>
        </div>
      )}
      {bad.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <Ban className={`w-3.5 h-3.5 ${isLight ? 'text-rose-600' : 'text-rose-400'}`} />
            <span className={`text-[10px] font-bold uppercase tracking-wider ${head}`}>{t('graph.avoid')}</span>
          </div>
          <ul className="space-y-1">
            {bad.map((a, i) => <li key={i} className={`text-xs leading-relaxed ${badTxt}`}>{a}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
};

// ── Graph stage ───────────────────────────────────────────────────────────────

/**
 * The canvas itself plus everything that belongs to it: the interaction hint,
 * the legend and the panel for whatever node is open. Kept separate from the
 * page view so the Expand button can pop out just the graph — the summary and
 * the guidance cards stay behind on the page rather than being duplicated into
 * a modal that then has to scroll.
 *
 * Selection is local, so the expanded stage starts fresh and closing it does
 * not disturb what was open underneath.
 */
const LayerBar: React.FC<{
  source: Graph; extras: ReadonlySet<ExtraLayer>;
  onToggle: (layer: ExtraLayer) => void; isLight: boolean;
}> = ({ source, extras, onToggle, isLight }) => {
  const { t } = useLang();
  const layers = (
    [
      { id: 'yoga' as const, label: t('graph.layerYogas') },
      { id: 'transit' as const, label: t('graph.layerTransits') },
      { id: 'remedy' as const, label: t('graph.layerRemedies') },
    ] satisfies { id: ExtraLayer; label: string }[]
  ).filter(l => source.nodes.some(n => n.type === l.id));
  if (!layers.length) return null;
  return (
    <div className="tab-bar inline-flex flex-wrap gap-1 p-1 rounded-xl">
      <span className="px-2.5 h-7 rounded-lg text-[11px] font-semibold flex items-center text-[var(--c-accent)] bg-[rgba(var(--c-accent-rgb),0.14)]">
        {t('graph.layerNow')}
      </span>
      {layers.map(l => {
        const on = extras.has(l.id);
        return (
          <button key={l.id} type="button" onClick={() => onToggle(l.id)}
            className={`px-2.5 h-7 rounded-lg text-[11px] font-semibold transition-colors ${
              on
                ? 'text-[var(--c-accent)] bg-[rgba(var(--c-accent-rgb),0.14)]'
                : isLight ? 'text-slate-500 hover:text-slate-800' : 'text-white/45 hover:text-white'
            }`}>
            {on ? l.label : `+ ${l.label}`}
          </button>
        );
      })}
    </div>
  );
};

const GraphStage: React.FC<{
  graph: Graph; isLight: boolean; big?: boolean; prediction?: DashaPredictionData;
}> = ({ graph, isLight, big = false, prediction }) => {
  const { t } = useLang();
  const [selected, setSelected] = useState<string | null>(null);
  const [extras, setExtras] = useState<Set<ExtraLayer>>(() => new Set());
  const view = useMemo(() => filterGraph(graph, extras), [graph, extras]);

  useEffect(() => {
    if (selected && !view.nodes.some(n => n.id === selected)) setSelected(null);
  }, [view, selected]);

  const toggle = (layer: ExtraLayer) => {
    setExtras(prev => {
      const next = new Set(prev);
      if (next.has(layer)) next.delete(layer); else next.add(layer);
      return next;
    });
  };

  const canvas = (
    <div className={`relative rounded-2xl overflow-hidden ${
      big
        ? 'flex-1 min-h-0 flex items-center justify-center p-2'
        : 'p-1 sm:p-2 flex items-center justify-center'
    }`}
      style={{
        background: isLight
          ? 'radial-gradient(ellipse 70% 60% at 50% 45%, rgba(var(--c-accent-rgb),0.04) 0%, transparent 70%)'
          : 'radial-gradient(ellipse 70% 60% at 50% 45%, rgba(var(--c-accent-rgb),0.07) 0%, rgba(0,0,0,0.22) 75%)',
        border: isLight
          ? '1px solid rgba(15,23,42,0.08)'
          : '1px solid rgba(255,255,255,0.07)',
      }}>
      <AnimatePresence>
        {!selected && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full pointer-events-none"
            style={{
              background: isLight ? 'rgba(255,255,255,0.88)' : 'rgba(0,0,0,0.45)',
              border: isLight ? '1px solid rgba(15,23,42,0.08)' : '1px solid rgba(255,255,255,0.10)',
            }}
          >
            <MousePointerClick className="w-3 h-3 shrink-0" style={{ color: 'var(--c-accent)' }} />
            <span className={`text-[10.5px] font-semibold ${isLight ? 'text-slate-600' : 'text-white/75'}`}>
              {t('graph.tapHint')}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
      <div className={`graph-scroll w-full ${big ? 'h-full flex items-center justify-center' : ''}`}>
        <GraphCanvas graph={view} isLight={isLight} selected={selected} onSelect={setSelected}
          maxHeight={big ? '100%' : undefined} />
      </div>
    </div>
  );

  const rail = (
    <div className={big
      ? 'shrink-0 overflow-y-auto max-h-[38vh] sm:max-h-[30vh] pr-1 space-y-3'
      : 'grid grid-cols-1 md:grid-cols-2 gap-3'
    }>
      <NowCard summary={graph.summary} isLight={isLight} />
      <DetailPanel graph={view} selected={selected} isLight={isLight} />
      {prediction && (
        <div className={big ? undefined : 'md:col-span-2'}>
          <ActivitiesCard prediction={prediction} isLight={isLight} />
        </div>
      )}
    </div>
  );

  if (big) {
    return (
      <div className="flex flex-col h-full min-h-0 gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <LayerBar source={graph} extras={extras} onToggle={toggle} isLight={isLight} />
          <Legend isLight={isLight} extras={extras} />
        </div>
        {canvas}
        {rail}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
        <LayerBar source={graph} extras={extras} onToggle={toggle} isLight={isLight} />
        <Legend isLight={isLight} extras={extras} />
      </div>
      {canvas}
      {rail}
    </div>
  );
};

const GraphView: React.FC<{ graph: Graph; prediction: DashaPredictionData; isLight: boolean }> = ({ graph, prediction, isLight }) => (
  <GraphStage graph={graph} prediction={prediction} isLight={isLight} />
);

// ── Tab entry ─────────────────────────────────────────────────────────────────

export const KnowledgeGraph: React.FC<{ birthData: BirthData }> = ({ birthData }) => {
  const isLight = useTheme();
  const { lang, t } = useLang();
  const [expanded, setExpanded] = useState(false);

  const { data: prediction, isLoading, error } = useQuery({
    queryKey: ['currentPrediction', birthData, lang],
    queryFn: () => getCurrentPrediction(birthData, undefined, coreLang(lang)),
    enabled: !!birthData.date,
    staleTime: 5 * 60 * 1000,
  });
  // The natal chart (already cached from generation) and the Ashtakavarga
  // supply the placements the graph reads: sign, house, nakshatra, aspects,
  // bindus, and the Mahadasha–Antardasha bond. Both are optional — the graph
  // still builds from the prediction alone if either fails.
  const { data: chart, isLoading: chartLoading } = useChart(birthData.date ? birthData : null);
  const { data: av } = useQuery({
    queryKey: ['ashtakavarga', birthData],
    queryFn: () => getAshtakavarga(birthData),
    enabled: !!birthData.date,
    staleTime: 60 * 60 * 1000,
  });
  // The outer ring: yogas (natal, cached with the chart) and today's gochara.
  // Both optional as well — the ring is simply empty without them.
  const { data: yogas } = useQuery({
    queryKey: ['yogas', birthData],
    queryFn: () => getYogas(birthData),
    enabled: !!birthData.date,
    staleTime: 60 * 60 * 1000,
  });
  const { data: gochara } = useQuery({
    queryKey: ['gochara', birthData, new Date().toISOString().slice(0, 10), lang],
    queryFn: () => getGochara(birthData, undefined, coreLang(lang)),
    enabled: !!birthData.date,
    staleTime: 60 * 60 * 1000,
  });

  const graph = useMemo(
    () => (prediction ? buildGraph(prediction, chart, av, yogas, gochara, lang, t, isLight) : null),
    [prediction, chart, av, yogas, gochara, lang, t, isLight],
  );

  if (isLoading || chartLoading) {
    return (
      <div className="glass-card rounded-2xl p-10 text-center">
        <Loader2 className="w-6 h-6 mx-auto animate-spin mb-3" style={{ color: ACCENT }} />
        <span className={`font-mono text-sm ${isLight ? 'text-slate-400' : 'text-white/30'}`}>{t('graph.loading')}</span>
      </div>
    );
  }
  if (error || !graph || !prediction) {
    return <div className="glass-card rounded-2xl p-8 text-center text-rose-400 text-sm">{t('graph.failed')}</div>;
  }

  return (
    <div className="glass-card rounded-2xl p-3 sm:p-4">
      <div className="flex items-start gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: 'rgba(var(--c-accent-rgb),0.08)', border: '1px solid rgba(var(--c-accent-rgb),0.18)' }}>
          <Share2 className="w-4 h-4" style={{ color: 'var(--c-accent-2)' }} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className={`text-sm font-bold ${isLight ? 'text-gray-800' : 'text-white'}`}>{t('graph.title')}</h3>
          <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-white/30'}`}>{t('graph.subtitle')}</p>
        </div>
        <button onClick={() => setExpanded(true)} title={t('graph.expand')}
          className="chrome-btn flex items-center gap-1.5 text-xs px-2.5 h-8 rounded-xl font-semibold shrink-0">
          <Maximize2 className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">{t('graph.expand')}</span>
        </button>
      </div>

      <GraphView graph={graph} prediction={prediction} isLight={isLight} />

      {/* The card above is a `.glass-card`, and its backdrop-filter makes that
          card the containing block for any `position: fixed` descendant — the
          expanded view was clipping to the card and painting under the sticky
          app header instead of the viewport. Portalling to <body> is what
          makes "fixed" mean the viewport here (same fix as HouseDetailPanel,
          WesternDetailPanel, SynastryWeb's expand). The portal call itself
          must wrap AnimatePresence, not sit inside it as a conditional child —
          AnimatePresence clones its children to track exit animations, and it
          can't clone a ReactPortal node, so the content silently never mounts
          if `expanded && createPortal(...)` is placed inside it. */}
      {createPortal(
        <AnimatePresence>
        {expanded && (
          <motion.div className="fixed inset-0 z-[60] flex items-start justify-center p-2 sm:p-3"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setExpanded(false)} />
            {/* Expand pops out the GRAPH, not the whole tab. The summary banner
                and guidance cards stay on the page behind it; duplicating them
                here just produced a second scrolling copy of the page in which
                the graph was no bigger than before. */}
            {/* Height is 95dvh where supported — a mobile browser's toolbars
                shrink the visual viewport, so vh overshoots the screen. Engines
                that do not know dvh drop the inline value and fall back to the
                h-[95vh] class. */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              style={{ height: '95dvh' }}
              className="relative glass-card rounded-2xl w-full max-w-[1500px] h-[95vh] flex flex-col overflow-hidden">
              <div className="flex items-center gap-3 px-4 sm:px-5 py-3 border-b border-white/8 shrink-0">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(var(--c-accent-rgb),0.10)', border: '1px solid rgba(var(--c-accent-rgb),0.22)' }}>
                  <Share2 className="w-4 h-4" style={{ color: 'var(--c-accent)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`text-sm font-semibold ${isLight ? 'text-gray-800' : 'text-white'}`}>{t('graph.title')}</h3>
                  <p className={`text-[11px] truncate ${isLight ? 'text-slate-500' : 'text-white/45'}`}>{t('graph.subtitle')}</p>
                </div>
                {/* A background chip + border + full-opacity icon, not just faint
                    text colour — a `text-white/50` glyph on nothing reads fine on
                    the default navy card but all but disappears against a stark
                    black-on-black/green surface (chalkboard, terminal). */}
                <button onClick={() => setExpanded(false)} aria-label={t('graph.close')}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0 border ${
                    isLight
                      ? 'text-slate-700 bg-black/5 border-black/10 hover:text-slate-900 hover:bg-black/10'
                      : 'text-white bg-white/10 border-white/15 hover:bg-white/20'
                  }`}>
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 min-h-0 p-3 sm:p-4">
                <GraphStage graph={graph} prediction={prediction} isLight={isLight} big />
              </div>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default KnowledgeGraph;
