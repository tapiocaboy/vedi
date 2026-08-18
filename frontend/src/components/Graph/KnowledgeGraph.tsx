/**
 * KnowledgeGraph — a plain-language relationship map of the influences shaping
 * the current period, written for a general audience (no astrology background
 * needed).
 *
 *   • The centre is "now" with an overall outlook score.
 *   • Guiding planets (the active dasha lords) sit on the left, each described
 *     in everyday terms ("Saturn — discipline & life lessons").
 *   • The life themes (houses) each planet affects orbit it, labelled by what
 *     they actually cover ("Career", "Home", "Money").
 *   • Life areas (career, wealth, relationships, health) sit on the right,
 *     colour-coded by how they're trending.
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
import { getCurrentPrediction } from '../../services/api';
import type { BirthData, DashaPredictionData, LordStrengthData } from '../../services/api';
import { LORD_HEX, TREND_HEX } from '../shared/BarCharts';
import { useTheme } from '../../hooks/useTheme';
import { useLang } from '../../i18n/LanguageContext';
import { coreLang, type Lang } from '../../i18n/translations';
import {
  labelPlanet, labelArea, labelDignity, labelTrend,
  labelPlanetTheme, labelHouseTheme, labelHouseCovers, labelDashaScope,
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

type NodeType = 'period' | 'planet' | 'house' | 'area';

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
}
interface GEdge { from: string; to: string; critical: boolean; dashed?: boolean; }
interface Summary {
  main?: { label: string; meaning: string; strengthLabel: string; critical: boolean; color: string };
  sub?: { label: string; meaning: string };
  outlook: { word: string; color: string; rating: number };
  theme: string;
  goingWell: string[];
  needsCare: string[];
}
interface Graph { nodes: GNode[]; edges: GEdge[]; criticals: GNode[]; summary: Summary; }

const W = 700, H = 520, CX = 350, CY = 255, R1 = 150, R2 = 86;

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

function buildGraph(prediction: DashaPredictionData, lang: Lang, t: Tr, isLight: boolean): Graph {
  const nodes: GNode[] = [];
  const edges: GEdge[] = [];
  const lords = prediction.lordStrengths ?? [];
  const cp = prediction.currentPeriods;
  const outlook = outlookInfo(prediction.overallRating, t);

  // ── Centre: now ──────────────────────────────────────────────────────────
  const periodTake = prediction.overallRating >= 6 ? t('graph.take.periodGood')
    : prediction.overallRating >= 4 ? t('graph.take.periodMixed') : t('graph.take.periodHard');
  nodes.push({
    id: 'period', type: 'period', glyph: String(prediction.overallRating),
    label: t('graph.period'), tooltip: `${t('graph.outlookLabel')}: ${outlook.word}`,
    x: CX, y: CY, r: 38, color: isLight ? PERIOD_LIGHT : PERIOD_DARK,
    critical: false, important: false,
    detail: {
      meaning: `${outlook.word} · ${prediction.overallRating}/10`,
      strength: { pct: prediction.overallRating * 10, label: outlook.word, color: outlook.color, raw: `${prediction.overallRating}/10` },
      lines: prediction.overallTheme ? [prediction.overallTheme] : [],
      chips: [], takeaway: periodTake,
    },
  });

  // ── Guiding planets (left arc) ─────────────────────────────────────────────
  const chain: { lord: string; role: 'mahadasha' | 'antardasha'; level: string; end?: string }[] = [];
  if (cp) {
    chain.push({ lord: cp.mahadasha.lord, role: 'mahadasha', level: 'Mahadasha', end: cp.mahadasha.end });
    if (cp.antardasha)      chain.push({ lord: cp.antardasha.lord,      role: 'antardasha', level: 'Antardasha',      end: cp.antardasha.end });
    if (cp.pratyantardasha) chain.push({ lord: cp.pratyantardasha.lord, role: 'antardasha', level: 'Pratyantardasha', end: cp.pratyantardasha.end });
    if (cp.sookshmaDasha)   chain.push({ lord: cp.sookshmaDasha.lord,   role: 'antardasha', level: 'Sookshma Dasha',  end: cp.sookshmaDasha.end });
  }
  const n = chain.length;
  const planetIds: string[] = [];

  chain.forEach((d, i) => {
    const deg = n === 1 ? 180 : 106 + ((250 - 106) * i) / (n - 1);
    const { x, y } = polar(CX, CY, R1, deg);
    const ls = lords.find(l => l.planet === d.lord && l.role === d.role) ?? lords.find(l => l.planet === d.lord);
    const { critical, important, demanding } = classifyPlanet(d.lord, ls);
    const id = `planet-${i}`;
    planetIds.push(id);

    const meaning = labelPlanetTheme(d.lord, lang);
    const lines: string[] = [];
    const scope = labelDashaScope(d.level, lang);
    lines.push([scope, d.end ? fmtUntil(d.end, lang, t) : ''].filter(Boolean).join(' · '));
    const chips: string[] = [];
    let strength;
    if (ls) {
      strength = strengthInfo(ls.strengthScore, t);
      if (ls.dignity) chips.push(labelDignity(ls.dignity, lang));
      if (ls.lordedHouses.length)
        lines.push(t('graph.influences', { areas: ls.lordedHouses.map(h => labelHouseTheme(h, lang)).join(', ') }));
      if (ls.natalHouse != null)
        lines.push(t('graph.sitsIn', { area: labelHouseTheme(ls.natalHouse, lang) }));
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

    // Life themes (houses) this planet activates
    if (ls) {
      const houseMap = new Map<number, { rules: boolean; placed: boolean }>();
      ls.lordedHouses.forEach(h => houseMap.set(h, { rules: true, placed: houseMap.get(h)?.placed ?? false }));
      if (ls.natalHouse != null)
        houseMap.set(ls.natalHouse, { rules: houseMap.get(ls.natalHouse)?.rules ?? false, placed: true });
      // Only two fit around a planet, so choose which two rather than taking
      // whichever happened to be inserted first: where the planet actually sits
      // matters most, and a sensitive (dusthana) theme must never be the one
      // silently dropped.
      const houses = [...houseMap.entries()]
        .sort(([ha, ra], [hb, rb]) => {
          const rank = (h: number, rel: { placed: boolean }) =>
            (rel.placed ? 0 : 2) + (DUSTHANA.has(h) ? 0 : 1);
          return rank(ha, ra) - rank(hb, rb);
        })
        .slice(0, 2);
      const hN = houses.length;
      houses.forEach(([h, rel], k) => {
        const hDeg = deg + (hN === 1 ? 0 : 30 * (k - (hN - 1) / 2));
        const hp = polar(x, y, R2, hDeg);
        const dusthana = DUSTHANA.has(h);
        const relation = rel.rules ? t('graph.relRules') : t('graph.relPlaced');
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
        edges.push({ from: id, to: hid, critical: dusthana || critical });
      });
    }
  });

  // Dasha hierarchy chain (subtle dashed links)
  for (let i = 0; i < planetIds.length - 1; i++)
    edges.push({ from: planetIds[i], to: planetIds[i + 1], critical: false, dashed: true });

  // ── Life areas (right arc) ─────────────────────────────────────────────────
  const areas = (['career', 'wealth', 'relationships', 'health'] as const)
    .map(key => ({ key, data: prediction.predictions[key] }))
    .filter(a => a.data);
  const m = areas.length;
  areas.forEach((a, i) => {
    const deg = m === 1 ? 0 : -64 + (128 * i) / (m - 1);
    const { x, y } = polar(CX, CY, R1, deg);
    const trend = a.data.trend;
    const trendLabel = labelTrend(trend, lang);
    const id = `area-${a.key}`;
    const take = trend === 'positive' ? t('graph.take.areaGood')
      : trend === 'negative' ? t('graph.take.areaBad')
      : trend === 'mixed' ? t('graph.take.areaMixed') : '';
    nodes.push({
      id, type: 'area', glyph: TREND_ARROW[trend] ?? '→',
      label: labelArea(a.key, lang),
      tooltip: `${labelArea(a.key, lang)} — ${trendLabel}`,
      x, y, r: 27, color: TREND_HEX[trend] ?? TREND_HEX.neutral,
      critical: trend === 'negative', important: trend === 'positive',
      detail: {
        trend: { label: trendLabel, color: TREND_HEX[trend] ?? TREND_HEX.neutral },
        lines: [a.data.summary, ...(a.data.details?.slice(0, 1) ?? [])].filter(Boolean),
        // Remedy chip hidden for now, kept for when remedies come back
        // chips: a.data.remedies?.slice(0, 1) ?? [],
        chips: [],
        takeaway: take,
      },
    });
    edges.push({ from: 'period', to: id, critical: trend === 'negative' });
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
  };

  return { nodes, edges, criticals: nodes.filter(node => node.critical), summary };
}

// ── Canvas ────────────────────────────────────────────────────────────────────

/**
 * True when nothing on this canvas should move: the chalkboard theme (whose
 * whole contract is that nothing animates) or an explicit reduced-motion
 * preference. Framer's own reducedMotion only suppresses transform/layout
 * animations, and neither it nor CSS `animation: none` touches the SMIL packets
 * or the stroke-dash flow here, so they need this opt-out.
 */
function useStill(): boolean {
  const read = () =>
    document.documentElement.classList.contains('theme-mono') ||
    (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);

  const [still, setStill] = useState(read);
  useEffect(() => {
    const update = () => setStill(read());
    const obs = new MutationObserver(update);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    mq?.addEventListener?.('change', update);
    return () => { obs.disconnect(); mq?.removeEventListener?.('change', update); };
  }, []);
  return still;
}

/** Evenly spaced tick marks around a circle, as a dash pattern. */
const dialDashes = (r: number, ticks: number) => {
  const circumference = 2 * Math.PI * r;
  const gap = circumference / ticks;
  return `2 ${gap - 2}`;
};

/**
 * Four corner arcs around a circle of radius r — a camera-style focus reticle.
 * Rendered as a dash pattern that repeats exactly four times, rotated 45° so the
 * brackets sit on the diagonals and never collide with a node's label.
 */
const reticleDashes = (r: number) => {
  const quarter = (2 * Math.PI * r) / 4;
  return `${quarter * 0.30} ${quarter * 0.70}`;
};

/**
 * Spin/scale about the element's own centre. Without `transform-box: fill-box`
 * an SVG transform-origin resolves against the whole viewBox, so a ring nested
 * in a translated <g> would orbit the canvas corner instead of turning in place.
 */
const SPIN_IN_PLACE: React.CSSProperties = {
  transformBox: 'fill-box',
  transformOrigin: 'center',
};

const GraphCanvas: React.FC<{
  graph: Graph; isLight: boolean; selected: string | null;
  onSelect: (id: string | null) => void;
  /** Cap the drawing height (expanded view). preserveAspectRatio keeps the
      scene centred and undistorted inside whatever box it ends up with. */
  maxHeight?: string;
}> = ({ graph, isLight, selected, onSelect, maxHeight }) => {
  const byId = useMemo(() => Object.fromEntries(graph.nodes.map(node => [node.id, node])), [graph]);
  const still = useStill();
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

  const edgeBase  = isLight ? 'rgba(15,23,42,0.14)' : 'rgba(255,255,255,0.10)';
  const labelFill = isLight ? '#334155' : 'rgba(255,255,255,0.80)';
  const labelHalo = isLight ? 'rgba(255,255,255,0.92)' : 'rgba(0,0,0,0.62)';
  const gridLine  = isLight ? 'rgba(15,23,42,0.055)' : 'rgba(var(--c-accent-rgb),0.10)';
  const orbitLine = isLight ? 'rgba(15,23,42,0.10)'  : 'rgba(var(--c-accent-rgb),0.16)';
  const hudLine   = isLight ? 'rgba(15,23,42,0.20)'  : 'rgba(var(--c-accent-rgb),0.35)';
  const glowAmt   = isLight ? 0.22 : 0.55;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none" role="img"
      style={maxHeight ? { maxHeight, height: '100%', width: 'auto', maxWidth: '100%' } : undefined}
      preserveAspectRatio="xMidYMid meet"
      onClick={() => onSelect(null)}>
      <defs>
        {/* Wide, soft halo under each node. This is the only blur filter in the
            scene: edges and packets fake their glow with a wide translucent
            stroke under a narrow bright one, because a real filter on ~40
            continuously animating elements is what actually costs frames. */}
        <filter id="kg-halo" x="-120%" y="-120%" width="340%" height="340%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        {/* Spherical shading — colour-independent, so one pair serves every node */}
        <radialGradient id="kg-hi" cx="32%" cy="26%" r="72%">
          <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="55%"  stopColor="#ffffff" stopOpacity="0.07" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="kg-sh" cx="72%" cy="80%" r="70%">
          <stop offset="0%"   stopColor="#000000" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
        {/* Dot-matrix over hairlines — reads as a sensor field rather than
            graph paper. */}
        <pattern id="kg-grid" width="28" height="28" patternUnits="userSpaceOnUse">
          <path d="M28 0H0v28" fill="none" stroke={gridLine} strokeWidth="0.5" />
          <circle cx="0" cy="0" r="0.9" fill={gridLine} />
          <circle cx="28" cy="28" r="0.9" fill={gridLine} />
        </pattern>
        {/* Sweep band — a soft bar of light that crosses the field on a cycle */}
        <linearGradient id="kg-sweep" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="var(--c-accent)" stopOpacity="0" />
          <stop offset="45%"  stopColor="var(--c-accent)" stopOpacity={isLight ? 0.05 : 0.10} />
          <stop offset="55%"  stopColor="var(--c-accent)" stopOpacity={isLight ? 0.05 : 0.10} />
          <stop offset="100%" stopColor="var(--c-accent)" stopOpacity="0" />
        </linearGradient>
        {/* One gradient per edge: it fades from the source node's colour into
            the target's, so a link reads as influence travelling along it. */}
        {graph.edges.map((e, i) => {
          const a = byId[e.from]; const b = byId[e.to];
          if (!a || !b) return null;
          return (
            <linearGradient key={i} id={`kg-e${i}`} gradientUnits="userSpaceOnUse"
              x1={a.x} y1={a.y} x2={b.x} y2={b.y}>
              <stop offset="0%"   stopColor={a.color} stopOpacity={isLight ? 0.55 : 0.75} />
              <stop offset="100%" stopColor={b.color} stopOpacity={isLight ? 0.55 : 0.75} />
            </linearGradient>
          );
        })}
      </defs>

      {/* ── Backdrop: grid, orbit rings, and a slowly turning outer dial ── */}
      <rect width={W} height={H} fill="url(#kg-grid)" />

      {/* Sweep — the field being read, left to right, on a long cycle */}
      {!still && (
        <motion.rect
          y={0} width={190} height={H} fill="url(#kg-sweep)"
          initial={{ x: -190 }}
          animate={{ x: W }}
          transition={{ duration: 5.5, repeat: Infinity, repeatDelay: 3.5, ease: 'linear' }}
        />
      )}
      <circle cx={CX} cy={CY} r={R1} fill="none" stroke={orbitLine} strokeWidth="1" strokeDasharray="1 7" />
      <circle cx={CX} cy={CY} r={R2} fill="none" stroke={orbitLine} strokeWidth="1" strokeDasharray="1 7" />
      <circle cx={CX} cy={CY} r={R1 + 34} fill="none" stroke={orbitLine} strokeWidth="0.75" />

      <motion.g
        style={SPIN_IN_PLACE}
        animate={still ? undefined : { rotate: 360 }}
        transition={{ duration: 90, repeat: Infinity, ease: 'linear' }}
      >
        <circle cx={CX} cy={CY} r={R1 + 34} fill="none" stroke={hudLine} strokeWidth="3"
          strokeDasharray={dialDashes(R1 + 34, 48)} strokeLinecap="round" opacity={0.5} />
      </motion.g>

      {/* HUD corner brackets */}
      {([[14, 14, 1, 1], [W - 14, 14, -1, 1], [W - 14, H - 14, -1, -1], [14, H - 14, 1, -1]] as const)
        .map(([x, y, sx, sy], i) => (
          <path key={i} d={`M${x} ${y + sy * 22} L${x} ${y} L${x + sx * 22} ${y}`}
            fill="none" stroke={hudLine} strokeWidth="1.25" strokeLinecap="round" opacity={0.7} />
        ))}

      {/* ── Edges ── */}
      {graph.edges.map((e, i) => {
        const a = byId[e.from]; const b = byId[e.to];
        if (!a || !b) return null;
        const stroke = e.critical ? 'rgba(244,63,94,0.85)' : `url(#kg-e${i})`;
        const lit = !focus || focus === e.from || focus === e.to;
        return (
          <g key={i} opacity={lit ? 1 : 0.28} style={{ transition: 'opacity 0.2s ease' }}>
            {/* The rail a packet rides. Also the motion path for the packet. */}
            <path id={`kg-p${i}`} d={`M${a.x} ${a.y}L${b.x} ${b.y}`}
              fill="none" stroke={edgeBase} strokeWidth={e.critical ? 2.5 : 1.5} />
            {/* Live signal — a wide soft pass under a narrow bright one */}
            <motion.line
              x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke={stroke} strokeWidth={e.critical ? 7 : 5} strokeLinecap="round"
              strokeDasharray={e.dashed ? '3 10' : '5 14'}
              opacity={isLight ? 0.14 : 0.20}
              animate={still ? undefined : { strokeDashoffset: [0, e.critical ? -38 : -19] }}
              transition={{ duration: e.critical ? 1.1 : 2.2, repeat: Infinity, ease: 'linear' }}
            />
            <motion.line
              x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke={stroke} strokeWidth={e.critical ? 2.5 : 1.75} strokeLinecap="round"
              strokeDasharray={e.dashed ? '3 10' : '5 14'}
              opacity={isLight ? 0.75 : 0.95}
              animate={still ? undefined : { strokeDashoffset: [0, e.critical ? -38 : -19] }}
              transition={{ duration: e.critical ? 1.1 : 2.2, repeat: Infinity, ease: 'linear' }}
            />
            {/* Packet — a bead of data actually travelling the link. SMIL rather
                than a JS tween: the browser drives it without touching React,
                and the halo is a translucent stroke rather than a blur. */}
            {!still && (
              <circle r={e.critical ? 2.6 : 2}
                fill={e.critical ? '#f43f5e' : b.color}
                stroke={e.critical ? '#f43f5e' : b.color} strokeWidth={3} strokeOpacity={0.28}>
                <animateMotion dur={`${e.critical ? 1.8 : 3.2}s`} repeatCount="indefinite"
                  begin={`${(i % 6) * 0.45}s`}>
                  <mpath href={`#kg-p${i}`} xlinkHref={`#kg-p${i}`} />
                </animateMotion>
              </circle>
            )}
          </g>
        );
      })}

      {/* ── Nodes ── */}
      {graph.nodes.map((node, i) => {
        const isSel = selected === node.id;
        const isHot = hot === node.id;
        const live = isSel || isHot;
        const isCore = node.type === 'period';
        // Connected to whatever is focused — the astrological link being shown.
        const isLinked = !!focus && focus !== node.id && !!related?.has(node.id);
        const isMuted  = !!focus && focus !== node.id && !isLinked;
        const ring = node.critical ? '#f43f5e'
          : node.demanding ? '#f59e0b'
          : node.important ? '#34d399' : 'transparent';
        return (
          <g key={node.id} transform={`translate(${node.x},${node.y})`}
            className="cursor-pointer focus:outline-none"
            role="button" tabIndex={0} aria-label={node.tooltip}
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
            opacity={isMuted ? 0.3 : 1}
            style={{ transition: 'opacity 0.2s ease' }}
          >
            <title>{node.tooltip}</title>

            {/* Everything circular lifts together on hover/focus. The scale
                lives on an inner group because a CSS transform would otherwise
                override this element's translate() attribute outright, and the
                node would snap to the canvas origin. The label stays outside so
                text does not grow with it. */}
            <motion.g
              animate={{ scale: live ? 1.09 : 1 }}
              transition={{ type: 'spring', stiffness: 420, damping: 26 }}
              style={SPIN_IN_PLACE}
            >
              {/* Halo — the node sits in its own pool of light, brighter when
                  live. The centre burns hotter on dark: it is the one node that
                  is a reading rather than an influence, so it should read as the
                  light source of the scene. */}
              <circle r={node.r * (isCore && !isLight ? 1.7 : 1.35)} fill={node.color}
                opacity={(live ? Math.min(1, glowAmt + 0.3) : glowAmt) * (isCore && !isLight ? 1.5 : 1)}
                filter="url(#kg-halo)"
                style={{ transition: 'opacity 0.2s ease' }} />

              {/* Clickability. Every node carries a faint four-bracket reticle
                  at rest, which brightens on hover/focus. It does not spin: a
                  ring orbiting a node implies a relationship the chart is not
                  actually claiming, and there is nothing here for it to mean. */}
              <circle
                r={node.r + 8} fill="none"
                transform="rotate(45)"
                stroke={live ? 'var(--c-accent)' : hudLine}
                strokeWidth={live ? 2 : 1.1}
                strokeDasharray={reticleDashes(node.r + 8)}
                strokeLinecap="round"
                opacity={live ? 1 : 0.55}
                /* The reticle is already the node's clickability mark, so the
                   permanent tap pulse rides on it rather than on the node body —
                   pulsing the bodies would strobe the whole graph. */
                className={live ? undefined : 'tap-svg-blink'}
                style={{ transition: 'stroke 0.18s ease, opacity 0.18s ease' }}
              />

              {/* Connected to what is focused: a solid ring in the focused
                  node's direction of influence. This is the one ring on the
                  canvas that carries meaning — it marks the chain the reading
                  actually runs along. */}
              {isLinked && (
                <circle r={node.r + 5} fill="none" stroke="var(--c-accent)" strokeWidth={1.5}
                  opacity={0.75} />
              )}

              {node.critical && (
                <motion.circle r={node.r + 5} fill="none" stroke="#f43f5e" strokeWidth={1.5}
                  initial={{ opacity: 0.5, scale: 1 }}
                  animate={still ? undefined : { opacity: [0.5, 0, 0.5], scale: [1, 1.35, 1] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                  style={SPIN_IN_PLACE} />
              )}

              {/* Open node — a solid accent ring, held still */}
              {isSel && (
                <circle r={node.r + 13} fill="none" stroke="var(--c-accent)" strokeWidth={2} opacity={0.9} />
              )}
              {(node.critical || node.important || node.demanding) && (
                <circle r={node.r + 4} fill="none" stroke={ring} strokeWidth={2} />
              )}

              {/* Body: flat fill, then colour-independent sphere shading, then rim */}
              <motion.g
                initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.02, type: 'spring', stiffness: 260, damping: 20 }}
                style={SPIN_IN_PLACE}
              >
                <circle r={node.r} fill={node.color} fillOpacity={isCore ? 0.98 : 0.94} />
                <circle r={node.r} fill="url(#kg-hi)" />
                <circle r={node.r} fill="url(#kg-sh)" />
                <circle r={node.r} fill="none" strokeWidth={1.25}
                  stroke={isLight ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.45)'} />

                {/* The centre gets an instrument dial around it, tinted to its
                    own colour so the indigo carries through on dark. */}
                {isCore && (
                  <>
                    <circle r={node.r + 7} fill="none" strokeWidth="1"
                      stroke={isLight ? hudLine : node.color} opacity={isLight ? 1 : 0.75}
                      strokeDasharray={dialDashes(node.r + 7, 24)} strokeLinecap="round" />
                    <circle r={node.r + 12} fill="none" strokeWidth="0.75"
                      stroke={isLight ? hudLine : node.color} opacity={isLight ? 0.7 : 0.45} />
                  </>
                )}
              </motion.g>

              <text textAnchor="middle" dominantBaseline="central"
                fontSize={isCore ? 22 : node.type === 'house' ? 14 : node.type === 'area' ? 22 : 19}
                fontWeight={700} fill={node.type === 'house' ? '#fff' : 'rgba(0,0,0,0.80)'}
                style={{ pointerEvents: 'none' }}>
                {node.glyph}
              </text>

              {/* "+" badge — the unambiguous "there is more behind this" cue,
                  language-free, and only while the node is live. */}
              {live && (
                <g transform={`translate(${(node.r + 8) * 0.707},${(node.r + 8) * 0.707})`}
                  style={{ pointerEvents: 'none' }}>
                  <circle r={7} fill="var(--c-accent)" />
                  <path d="M-3 0H3M0 -3V3" stroke={isLight ? '#fff' : '#0b0e18'}
                    strokeWidth={1.8} strokeLinecap="round" />
                </g>
              )}
            </motion.g>

            {/* Labels are knocked out of the background so they stay readable
                where they cross an edge or a halo. */}
            <text y={node.r + 17} textAnchor="middle" fontSize={11.5}
              fontWeight={live ? 700 : 600}
              fill={live ? 'var(--c-accent)' : labelFill}
              className="si-svg-label"
              style={{
                pointerEvents: 'none',
                paintOrder: 'stroke',
                stroke: labelHalo,
                strokeWidth: 3,
                strokeLinejoin: 'round',
              }}>
              {node.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

// ── Plain-language summary banner ───────────────────────────────────────────────

const SummaryBanner: React.FC<{ summary: Summary; isLight: boolean }> = ({ summary, isLight }) => {
  const { t } = useLang();
  const head = isLight ? 'text-gray-800' : 'text-white';
  const sub = isLight ? 'text-slate-500' : 'text-white/45';
  const body = isLight ? 'text-slate-600' : 'text-white/65';

  return (
    <div className="rounded-2xl border p-4"
      style={{ borderColor: 'rgba(var(--c-accent-rgb),0.20)', background: 'rgba(var(--c-accent-rgb),0.05)' }}>
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--c-accent-2)' }} />
        <span className={`text-xs font-bold uppercase tracking-wider ${head}`}>{t('graph.summaryTitle')}</span>
        <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full"
          style={{ color: summary.outlook.color, background: `${summary.outlook.color}1f` }}>
          {summary.outlook.word} · {summary.outlook.rating}/10
        </span>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {summary.main && (
          <div>
            <div className={`text-[10px] uppercase tracking-wider mb-0.5 ${sub}`}>{t('graph.mainLabel')}</div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: summary.main.color }} />
              <span className={`text-sm font-bold ${head}`}>{summary.main.label}</span>
              {summary.main.strengthLabel && (
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${summary.main.critical ? 'bg-rose-500/15 text-rose-400' : 'bg-emerald-500/12 text-emerald-400'}`}>
                  {summary.main.strengthLabel}
                </span>
              )}
            </div>
            <div className={`text-xs ${body}`}>{summary.main.meaning}</div>
          </div>
        )}
        {summary.sub && (
          <div>
            <div className={`text-[10px] uppercase tracking-wider mb-0.5 ${sub}`}>{t('graph.subLabel')}</div>
            <div className={`text-sm font-bold ${head}`}>{summary.sub.label}</div>
            <div className={`text-xs ${body}`}>{summary.sub.meaning}</div>
          </div>
        )}
      </div>

      {summary.theme && <p className={`text-xs mt-3 leading-relaxed ${body}`}>{summary.theme}</p>}

      {(summary.goingWell.length > 0 || summary.needsCare.length > 0) && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 pt-3 border-t"
          style={{ borderColor: isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.07)' }}>
          {summary.goingWell.length > 0 && (
            <span className="flex items-center gap-1.5 text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className={sub}>{t('graph.goingWell')}:</span>
              <span className="font-semibold text-emerald-400">{summary.goingWell.join(', ')}</span>
            </span>
          )}
          {summary.needsCare.length > 0 && (
            <span className="flex items-center gap-1.5 text-xs">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span className={sub}>{t('graph.needsCare')}:</span>
              <span className="font-semibold text-rose-400">{summary.needsCare.join(', ')}</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

// ── Legend ──────────────────────────────────────────────────────────────────

const Legend: React.FC<{ isLight: boolean }> = ({ isLight }) => {
  const { t } = useLang();
  const txt = isLight ? 'text-slate-500' : 'text-white/45';
  const items = [
    { c: '#f43f5e', k: 'graph.critical' as const },
    { c: '#f59e0b', k: 'graph.demanding' as const },
    { c: '#34d399', k: 'graph.important' as const },
    { c: '#64748b', k: 'graph.legendTheme' as const },
    { c: 'var(--c-accent)', k: 'graph.legendPeriod' as const },
  ];
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
      {items.map(it => (
        <span key={it.k} className={`flex items-center gap-1.5 text-[11px] font-medium ${txt}`}>
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: it.c }} />
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
            <span key={c.id} className="px-2 py-0.5 rounded-full text-[11px] font-semibold border bg-rose-500/12 text-rose-300 border-rose-400/25">
              {c.glyph} {c.label}
            </span>
          ))}
        </div>
      )}
      <p className={`text-[10px] mt-2.5 ${isLight ? 'text-slate-400' : 'text-white/30'}`}>{t('graph.tapHint')}</p>
    </div>
  );
};

// ── Natal foundation ────────────────────────────────────────────────────────────

/**
 * The chart's standing footing per life area. Without this the graph shows a
 * supportive dasha chain next to a middling outlook and gives no account of the
 * gap — which is precisely the part a reader needs in order to trust the number.
 */
const FoundationCard: React.FC<{ prediction: DashaPredictionData; isLight: boolean }> = ({ prediction, isLight }) => {
  const { lang, t } = useLang();
  const rows = prediction.natalFoundation ?? [];
  if (!rows.length) return null;

  const head = isLight ? 'text-gray-800' : 'text-white';
  const sub = isLight ? 'text-slate-500' : 'text-white/45';
  const body = isLight ? 'text-slate-600' : 'text-white/60';

  const info = (f: (typeof rows)[number]) =>
    f.weak ? { color: '#f43f5e', label: t('graph.foundation.weak') }
    : f.strong ? { color: '#34d399', label: t('graph.foundation.strong') }
    : { color: '#ffcb3a', label: t('graph.foundation.mixed') };

  return (
    <div className="rounded-2xl border p-4"
      style={{ borderColor: 'rgba(var(--c-accent-rgb),0.20)', background: 'rgba(var(--c-accent-rgb),0.04)' }}>
      <div className="flex items-center gap-2 mb-1">
        <Info className="w-3.5 h-3.5" style={{ color: 'var(--c-accent-2)' }} />
        <span className={`text-xs font-bold uppercase tracking-wider ${head}`}>{t('graph.foundationTitle')}</span>
      </div>
      <p className={`text-[11px] leading-relaxed mb-3 ${sub}`}>{t('graph.foundationHint')}</p>

      <div className="space-y-2.5">
        {rows.map(f => {
          const { color, label } = info(f);
          // −3…+3 mapped onto the bar's width.
          const pct = ((f.score + 3) / 6) * 100;
          return (
            <div key={f.area}>
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className={`text-xs font-semibold ${head}`}>
                  {labelArea(f.area === 'relationship' ? 'relationships' : f.area, lang)}
                </span>
                <span className="text-[10px] font-semibold" style={{ color }}>{label}</span>
              </div>
              <div className={`h-1.5 rounded-full overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-white/10'}`}>
                <div className="h-full rounded-full" style={{ width: `${Math.max(3, Math.min(100, pct))}%`, backgroundColor: color }} />
              </div>
              {f.notes[0] && <p className={`text-[11px] leading-relaxed mt-1 ${body}`}>{f.notes[0]}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Good-to-do / avoid tips ─────────────────────────────────────────────────────

const ActivitiesCard: React.FC<{ prediction: DashaPredictionData; isLight: boolean }> = ({ prediction, isLight }) => {
  const { t } = useLang();
  const good = prediction.favorableActivities?.slice(0, 3) ?? [];
  const bad = prediction.unfavorableActivities?.slice(0, 3) ?? [];
  if (!good.length && !bad.length) return null;
  const head = isLight ? 'text-gray-700' : 'text-white/80';

  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {good.length > 0 && (
        <div className="rounded-xl border p-3" style={{ borderColor: 'rgba(16,185,129,0.25)', background: 'rgba(16,185,129,0.05)' }}>
          <div className="flex items-center gap-1.5 mb-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className={`text-[11px] font-bold uppercase tracking-wider ${head}`}>{t('graph.goodToDo')}</span>
          </div>
          <ul className="space-y-1">
            {good.map((a, i) => <li key={i} className="flex items-start gap-1.5 text-xs text-emerald-300/80"><span className="mt-0.5 shrink-0">✓</span>{a}</li>)}
          </ul>
        </div>
      )}
      {bad.length > 0 && (
        <div className="rounded-xl border p-3" style={{ borderColor: 'rgba(244,63,94,0.22)', background: 'rgba(244,63,94,0.05)' }}>
          <div className="flex items-center gap-1.5 mb-2">
            <Ban className="w-3.5 h-3.5 text-rose-400" />
            <span className={`text-[11px] font-bold uppercase tracking-wider ${head}`}>{t('graph.avoid')}</span>
          </div>
          <ul className="space-y-1">
            {bad.map((a, i) => <li key={i} className="flex items-start gap-1.5 text-xs text-rose-300/75"><span className="mt-0.5 shrink-0">✗</span>{a}</li>)}
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
const GraphStage: React.FC<{ graph: Graph; isLight: boolean; big?: boolean }> =
({ graph, isLight, big = false }) => {
  const { t } = useLang();
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <div className={big ? 'flex flex-col h-full min-h-0 gap-3' : 'space-y-4'}>
      {/* The canvas sits in a lit well rather than a flat box — a faint accent
          bloom from the centre, an accent hairline, and an inner edge.
          `relative` anchors the interactive-hint chip to its corner. */}
      <div className={`relative rounded-2xl p-2 sm:p-3 overflow-hidden ${big ? 'flex-1 min-h-0 flex items-center justify-center' : ''}`}
        style={{
          background: isLight
            ? 'radial-gradient(ellipse 80% 70% at 50% 45%, rgba(var(--c-accent-rgb),0.05) 0%, rgba(15,23,42,0.02) 70%)'
            : 'radial-gradient(ellipse 80% 70% at 50% 45%, rgba(var(--c-accent-rgb),0.09) 0%, rgba(0,0,0,0.32) 70%)',
          border: isLight
            ? '1px solid rgba(var(--c-accent-rgb),0.14)'
            : '1px solid rgba(var(--c-accent-rgb),0.18)',
          boxShadow: isLight
            ? 'inset 0 1px 0 rgba(255,255,255,0.6)'
            : 'inset 0 0 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}>
        {/* The nodes are the primary interaction and the hint for it used to sit
            far below in the criticals card, where it was easy to miss. Put it on
            the canvas, and retire it once the user has actually opened a node. */}
        <AnimatePresence>
          {!selected && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full pointer-events-none"
              style={{
                background: isLight ? 'rgba(255,255,255,0.82)' : 'rgba(0,0,0,0.45)',
                border: '1px solid rgba(var(--c-accent-rgb),0.35)',
                backdropFilter: 'blur(6px)',
              }}
            >
              <MousePointerClick className="w-3 h-3 shrink-0" style={{ color: 'var(--c-accent)' }} />
              <span className={`text-[10.5px] font-semibold ${isLight ? 'text-slate-600' : 'text-white/75'}`}>
                {t('graph.tapHint')}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* graph-scroll: below 700px the canvas keeps a legible minimum width
            and pans sideways rather than shrinking its labels to ~5px. */}
        <div className={`graph-scroll w-full ${big ? 'h-full flex items-center justify-center' : ''}`}>
          <GraphCanvas graph={graph} isLight={isLight} selected={selected} onSelect={setSelected}
            maxHeight={big ? '100%' : undefined} />
        </div>
      </div>

      <div className={big ? 'shrink-0 overflow-y-auto max-h-[38vh] sm:max-h-[30vh] space-y-3 pr-1' : 'space-y-4'}>
        <Legend isLight={isLight} />
        <DetailPanel graph={graph} selected={selected} isLight={isLight} />
      </div>
    </div>
  );
};

// ── Shared inner view ─────────────────────────────────────────────────────────

const GraphView: React.FC<{ graph: Graph; prediction: DashaPredictionData; isLight: boolean }> = ({ graph, prediction, isLight }) => {
  const { t } = useLang();
  return (
    <div className="space-y-4">
      <SummaryBanner summary={graph.summary} isLight={isLight} />
      <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-500' : 'text-white/40'}`}>{t('graph.howToRead')}</p>
      <GraphStage graph={graph} isLight={isLight} />
      <FoundationCard prediction={prediction} isLight={isLight} />
      <ActivitiesCard prediction={prediction} isLight={isLight} />
    </div>
  );
};

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

  const graph = useMemo(
    () => (prediction ? buildGraph(prediction, lang, t, isLight) : null),
    [prediction, lang, t, isLight],
  );

  if (isLoading) {
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
    <div className="glass-card rounded-2xl p-3 sm:p-6">
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
          className={`flex items-center gap-1.5 text-xs px-2.5 h-8 rounded-xl font-semibold transition-colors shrink-0 ${
            isLight ? 'bg-gray-100 border border-gray-200 text-gray-600 hover:bg-gray-200' : 'bg-white/5 border border-white/8 text-white/55 hover:bg-white/10 hover:text-white'
          }`}>
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
                <GraphStage graph={graph} isLight={isLight} big />
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
