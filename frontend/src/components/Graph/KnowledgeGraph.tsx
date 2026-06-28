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
 * at a glance. Renders inline with an "Expand" button for a full-screen view.
 */

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Maximize2, X, Share2, AlertTriangle, Sparkles, CheckCircle2, Ban, Info } from 'lucide-react';
import { getCurrentPrediction } from '../../services/api';
import type { BirthData, DashaPredictionData, LordStrengthData } from '../../services/api';
import { LORD_HEX, TREND_HEX } from '../shared/BarCharts';
import { useTheme } from '../../hooks/useTheme';
import { useLang } from '../../i18n/LanguageContext';
import type { Lang } from '../../i18n/translations';
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

function outlookInfo(rating: number, t: Tr) {
  if (rating >= 8) return { word: t('graph.outlook.excellent'),   color: '#34d399' };
  if (rating >= 6) return { word: t('graph.outlook.good'),        color: '#34d399' };
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
  critical: boolean; important: boolean; detail: NodeDetail;
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

function polar(cx: number, cy: number, r: number, deg: number) {
  const t = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(t), y: cy + r * Math.sin(t) };
}

function classifyPlanet(ls?: LordStrengthData) {
  if (!ls) return { critical: false, important: false };
  return {
    critical:
      ls.strengthScore < 0 || ls.dignity === 'debilitated' || ls.dignity === 'enemy-sign' ||
      ls.isCombust || ls.functionalNature === 'functional-malefic',
    important:
      ls.strengthScore >= 1 || ls.dignity === 'exalted' || ls.dignity === 'own-sign' ||
      ls.functionalNature === 'yogakaraka' || ls.functionalNature === 'functional-benefic',
  };
}

function buildGraph(prediction: DashaPredictionData, lang: Lang, t: Tr): Graph {
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
    x: CX, y: CY, r: 38, color: 'var(--c-accent)', critical: false, important: false,
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
    const { critical, important } = classifyPlanet(ls);
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
    }
    const takeaway = critical ? t('graph.take.planetWeak') : important ? t('graph.take.planetStrong') : t('graph.take.planetSteady');

    nodes.push({
      id, type: 'planet', glyph: PLANET_GLYPH[d.lord] ?? '●',
      label: labelPlanet(d.lord, lang),
      tooltip: `${labelPlanet(d.lord, lang)} — ${meaning}`,
      x, y, r: 28, color: LORD_HEX[d.lord] ?? '#94a3b8',
      critical, important,
      detail: { meaning, strength, lines: lines.filter(Boolean), chips, takeaway },
    });
    edges.push({ from: 'period', to: id, critical });

    // Life themes (houses) this planet activates
    if (ls) {
      const houseMap = new Map<number, { rules: boolean; placed: boolean }>();
      ls.lordedHouses.forEach(h => houseMap.set(h, { rules: true, placed: houseMap.get(h)?.placed ?? false }));
      if (ls.natalHouse != null)
        houseMap.set(ls.natalHouse, { rules: houseMap.get(ls.natalHouse)?.rules ?? false, placed: true });
      const houses = [...houseMap.entries()].slice(0, 2);
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
        chips: a.data.remedies?.slice(0, 1) ?? [],
        takeaway: take,
      },
    });
    edges.push({ from: 'period', to: id, critical: trend === 'negative' });
  });

  // ── Plain summary ───────────────────────────────────────────────────────────
  const mainLs = cp ? (lords.find(l => l.planet === cp.mahadasha.lord && l.role === 'mahadasha') ?? lords.find(l => l.planet === cp.mahadasha.lord)) : undefined;
  const mainCls = classifyPlanet(mainLs);
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

const GraphCanvas: React.FC<{ graph: Graph; isLight: boolean; selected: string | null; onSelect: (id: string | null) => void }> =
({ graph, isLight, selected, onSelect }) => {
  const byId = useMemo(() => Object.fromEntries(graph.nodes.map(node => [node.id, node])), [graph]);
  const edgeBase = isLight ? 'rgba(15,23,42,0.16)' : 'rgba(255,255,255,0.13)';
  const labelFill = isLight ? '#334155' : 'rgba(255,255,255,0.72)';

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none" role="img" onClick={() => onSelect(null)}>
      {graph.edges.map((e, i) => {
        const a = byId[e.from]; const b = byId[e.to];
        if (!a || !b) return null;
        return (
          <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
            stroke={e.critical ? 'rgba(244,63,94,0.5)' : edgeBase}
            strokeWidth={e.critical ? 2 : 1.25} strokeDasharray={e.dashed ? '4 4' : undefined} />
        );
      })}

      {graph.nodes.map((node, i) => {
        const isSel = selected === node.id;
        const ring = node.critical ? '#f43f5e' : node.important ? '#34d399' : 'transparent';
        return (
          <g key={node.id} transform={`translate(${node.x},${node.y})`} className="cursor-pointer"
            onClick={ev => { ev.stopPropagation(); onSelect(isSel ? null : node.id); }}>
            <title>{node.tooltip}</title>
            {node.critical && (
              <motion.circle r={node.r + 5} fill="none" stroke="#f43f5e" strokeWidth={1.5}
                initial={{ opacity: 0.5, scale: 1 }}
                animate={{ opacity: [0.5, 0, 0.5], scale: [1, 1.35, 1] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                style={{ originX: '0px', originY: '0px' } as React.CSSProperties} />
            )}
            {(node.critical || node.important || isSel) && (
              <circle r={node.r + 4} fill="none" stroke={isSel ? 'var(--c-accent)' : ring} strokeWidth={2} />
            )}
            <motion.circle r={node.r} fill={node.color} fillOpacity={node.type === 'period' ? 0.95 : 0.9}
              stroke={isLight ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.35)'} strokeWidth={1.5}
              initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.02, type: 'spring', stiffness: 260, damping: 20 }} />
            <text textAnchor="middle" dominantBaseline="central"
              fontSize={node.type === 'period' ? 22 : node.type === 'house' ? 14 : node.type === 'area' ? 22 : 19}
              fontWeight={700} fill={node.type === 'house' ? '#fff' : 'rgba(0,0,0,0.78)'}
              style={{ pointerEvents: 'none' }}>
              {node.glyph}
            </text>
            <text y={node.r + 14} textAnchor="middle" fontSize={11.5} fontWeight={600} fill={labelFill}
              style={{ pointerEvents: 'none' }}>
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
          {node.important && !node.critical && (
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

// ── Shared inner view ─────────────────────────────────────────────────────────

const GraphView: React.FC<{ graph: Graph; prediction: DashaPredictionData; isLight: boolean }> = ({ graph, prediction, isLight }) => {
  const { t } = useLang();
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <div className="space-y-4">
      <SummaryBanner summary={graph.summary} isLight={isLight} />
      <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-500' : 'text-white/40'}`}>{t('graph.howToRead')}</p>
      <div className="rounded-2xl p-2 sm:p-3"
        style={{ background: isLight ? 'rgba(15,23,42,0.02)' : 'rgba(0,0,0,0.25)', border: isLight ? '1px solid rgba(15,23,42,0.06)' : '1px solid rgba(255,255,255,0.05)' }}>
        <GraphCanvas graph={graph} isLight={isLight} selected={selected} onSelect={setSelected} />
      </div>
      <Legend isLight={isLight} />
      <DetailPanel graph={graph} selected={selected} isLight={isLight} />
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
    queryKey: ['currentPrediction', birthData],
    queryFn: () => getCurrentPrediction(birthData),
    enabled: !!birthData.date,
    staleTime: 5 * 60 * 1000,
  });

  const graph = useMemo(() => (prediction ? buildGraph(prediction, lang, t) : null), [prediction, lang, t]);

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

      <AnimatePresence>
        {expanded && (
          <motion.div className="fixed inset-0 z-[60] flex items-start sm:items-center justify-center p-3 sm:p-6"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setExpanded(false)} />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="relative glass-card rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden mt-12 sm:mt-0">
              <div className="flex items-center gap-3 p-4 sm:p-5 border-b border-white/8 shrink-0">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(var(--c-accent-rgb),0.10)', border: '1px solid rgba(var(--c-accent-rgb),0.22)' }}>
                  <Share2 className="w-4 h-4" style={{ color: 'var(--c-accent)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`text-sm font-semibold ${isLight ? 'text-gray-800' : 'text-white'}`}>{t('graph.title')}</h3>
                  <p className={`text-[11px] truncate ${isLight ? 'text-slate-500' : 'text-white/45'}`}>{t('graph.subtitle')}</p>
                </div>
                <button onClick={() => setExpanded(false)} aria-label={t('graph.close')}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/8 transition-colors shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="overflow-y-auto p-4 sm:p-5">
                <GraphView graph={graph} prediction={prediction} isLight={isLight} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KnowledgeGraph;
