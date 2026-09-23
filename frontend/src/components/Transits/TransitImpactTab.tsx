/**
 * Transit Impact — how the major sign changes (Saturn, Jupiter, the nodes,
 * Mars and the Sun) land on this chart's predictions, as a lane timeline with
 * a life-area heatmap underneath, "happening now" cards, a detail pane for the
 * chosen transit and a countdown to the big transitions ahead. English only.
 */

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Orbit, CalendarClock, RotateCcw, Sparkles, Compass, Lightbulb, Layers } from 'lucide-react';
import { getTransitImpact, getCurrentPrediction } from '../../services/api';
import type { BirthData, TransitImpactReport, TransitSegment, TransitBody, ImpactArea, ImpactTone } from '../../services/api';
import { IMPACT_AREAS, AREA_LABEL, BODY_LABEL, HOUSE_THEME } from '../../lib/core/transitImpact';
import TransitSky from './TransitSky';
import { PLANET_SYMBOLS } from '../../types/astrology';
import { LORD_HEX } from '../shared/BarCharts';
import { tapVars, TapHint } from '../shared/tapTarget';
import { useTheme } from '../../hooks/useTheme';

const DAY = 86_400_000;

const SIGN_GLYPH = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'].map(g => `${g}\uFE0E`);

const TONE_HEX: Record<ImpactTone, string> = { good: '#10b981', mixed: '#f59e0b', bad: '#ef4444' };
const TONE_LABEL: Record<ImpactTone, string> = { good: 'Supportive', mixed: 'Mixed', bad: 'Testing' };

const BODY_HEX: Record<TransitBody, string> = {
  SATURN: LORD_HEX.Saturn, JUPITER: LORD_HEX.Jupiter, RAHU: '#8b93a3',
  KETU: LORD_HEX.Ketu, MARS: LORD_HEX.Mars, SUN: LORD_HEX.Sun,
};

const MAJOR: TransitBody[] = ['SATURN', 'JUPITER', 'RAHU', 'KETU'];
const ALL_BODIES: TransitBody[] = ['SATURN', 'JUPITER', 'RAHU', 'KETU', 'MARS', 'SUN'];

type View = '12m' | '8y';

const ordinal = (n: number) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
};

const fmtDate = (ms: number | string) =>
  new Date(ms).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

const fmtMonth = (ms: number | string) =>
  new Date(ms).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });

function fmtSpan(ms: number): string {
  const days = Math.round(Math.abs(ms) / DAY);
  if (days < 14) return `${days} day${days === 1 ? '' : 's'}`;
  if (days < 60) return `${Math.round(days / 7)} weeks`;
  const months = Math.round(days / 30.44);
  if (months < 12) return `${months} months`;
  const y = Math.floor(months / 12), m = months % 12;
  return m ? `${y}y ${m}m` : `${y} year${y === 1 ? '' : 's'}`;
}

const areaWord = (v: number) => (v >= 0.2 ? 'Supportive' : v <= -0.2 ? 'Testing' : 'Mixed');
const areaHex = (v: number) => (v >= 0.2 ? TONE_HEX.good : v <= -0.2 ? TONE_HEX.bad : TONE_HEX.mixed);

function useTones(isLight: boolean) {
  return isLight
    ? { strong: 'text-slate-800', body: 'text-slate-600', muted: 'text-slate-400', panel: '#ffffff', line: 'rgba(15,23,42,0.06)', grid: 'rgba(15,23,42,0.06)', axis: 'rgba(15,23,42,0.42)', track: 'rgba(15,23,42,0.05)' }
    : { strong: 'text-white', body: 'text-white/70', muted: 'text-white/38', panel: 'rgba(255,255,255,0.04)', line: 'rgba(255,255,255,0.07)', grid: 'rgba(255,255,255,0.05)', axis: 'rgba(255,255,255,0.42)', track: 'rgba(255,255,255,0.04)' };
}

// ─── Section header ─────────────────────────────────────────────────────────

const SectionTitle: React.FC<{ icon: React.ElementType; title: string; sub?: string; isLight: boolean; right?: React.ReactNode }> = ({ icon: Icon, title, sub, isLight, right }) => (
  <div className="flex items-start gap-2.5 mb-4">
    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
      style={{ background: 'rgba(var(--c-accent-rgb),0.08)', border: '1px solid rgba(var(--c-accent-rgb),0.18)' }}>
      <Icon className="w-4 h-4" style={{ color: 'var(--c-accent-2)' }} />
    </div>
    <div className="min-w-0 flex-1">
      <h3 className={`text-sm font-semibold ${isLight ? 'text-slate-800' : 'text-white'}`}>{title}</h3>
      {sub && <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-white/40'}`}>{sub}</p>}
    </div>
    {right}
  </div>
);

const TonePill: React.FC<{ tone: ImpactTone; small?: boolean }> = ({ tone, small }) => (
  <span className={`inline-flex items-center gap-1 rounded-full font-semibold ${small ? 'text-[10px] px-2 py-0.5' : 'text-[11px] px-2.5 py-0.5'}`}
    style={{ color: TONE_HEX[tone], background: `${TONE_HEX[tone]}1a`, border: `1px solid ${TONE_HEX[tone]}40` }}>
    <span className="w-1.5 h-1.5 rounded-full" style={{ background: TONE_HEX[tone] }} />
    {TONE_LABEL[tone]}
  </span>
);

const Glyph: React.FC<{ body: TransitBody; size?: number }> = ({ body, size = 36 }) => (
  <span className="rounded-full flex items-center justify-center shrink-0 font-semibold"
    style={{ width: size, height: size, fontSize: size * 0.5, color: '#fff', background: BODY_HEX[body], boxShadow: `0 0 0 3px ${BODY_HEX[body]}26` }}>
    {PLANET_SYMBOLS[body]}
  </span>
);

// ─── Climate now ────────────────────────────────────────────────────────────

const ClimateGauge: React.FC<{ area: ImpactArea; value: number; isLight: boolean }> = ({ area, value, isLight }) => {
  const r = 26, c = Math.PI * r;
  const frac = (value + 1) / 2;
  const hex = areaHex(value);
  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 64 38" className="w-20 h-12">
        <path d="M6 34 A26 26 0 0 1 58 34" fill="none" stroke={isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.08)'} strokeWidth="6" strokeLinecap="round" />
        <motion.path d="M6 34 A26 26 0 0 1 58 34" fill="none" stroke={hex} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c * (1 - frac) }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} />
        <text x="32" y="33" textAnchor="middle" fontSize="11" fontWeight="700" fill={hex}>
          {value >= 0 ? '+' : '−'}{Math.round(Math.abs(value) * 100)}
        </text>
      </svg>
      <span className={`text-xs font-semibold mt-0.5 ${isLight ? 'text-slate-700' : 'text-white/85'}`}>{AREA_LABEL[area]}</span>
      <span className="text-[10px] font-medium" style={{ color: hex }}>{areaWord(value)}</span>
    </div>
  );
};

// ─── Now cards ──────────────────────────────────────────────────────────────

const NowCard: React.FC<{ seg: TransitSegment; now: number; selected: boolean; onSelect: () => void; isLight: boolean }> = ({ seg, now, selected, onSelect, isLight }) => {
  const s = Date.parse(seg.start), e = Date.parse(seg.end);
  const pct = Math.max(0, Math.min(1, (now - s) / (e - s)));
  const tones = useTones(isLight);
  const retroNow = seg.retroSpans.some(r => Date.parse(r.start) <= now && Date.parse(r.end) > now);
  return (
    <button type="button" onClick={onSelect} data-open={selected}
      className="tap-card text-left rounded-xl p-3.5 border transition-colors"
      style={{ ...tapVars(BODY_HEX[seg.planet]), background: selected ? `${BODY_HEX[seg.planet]}14` : tones.panel }}>
      <div className="flex items-center gap-2.5">
        <Glyph body={seg.planet} size={32} />
        <div className="min-w-0 flex-1">
          <div className={`text-sm font-semibold truncate ${tones.strong}`}>
            {BODY_LABEL[seg.planet]} in {seg.westernName}
            {retroNow && <span className="ml-1.5 text-[10px] font-bold align-middle" style={{ color: BODY_HEX[seg.planet] }}>℞</span>}
          </div>
          <div className={`text-[11px] ${tones.muted}`}>{ordinal(seg.houseFromMoon)} from Moon · {ordinal(seg.houseFromLagna)} from Asc</div>
        </div>
        <TonePill tone={seg.tone} small />
      </div>
      <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: tones.track }}>
        <motion.div className="h-full rounded-full" style={{ background: BODY_HEX[seg.planet] }}
          initial={{ width: 0 }} animate={{ width: `${pct * 100}%` }} transition={{ duration: 0.8 }} />
      </div>
      <div className={`mt-1.5 flex justify-between text-[10px] font-mono ${tones.muted}`}>
        <span>{seg.startClipped ? `before ${fmtMonth(s)}` : fmtMonth(s)}</span>
        <span>{fmtSpan(e - now)} left</span>
      </div>
      {seg.tags[0] && (
        <div className="mt-2 text-[10px] font-semibold" style={{ color: TONE_HEX[seg.tags[0].kind] }}>{seg.tags[0].label}</div>
      )}
    </button>
  );
};

// ─── Timeline + heatmap ─────────────────────────────────────────────────────

const W = 960, L = 96, R = 14;
const LANE_H = 26, LANE_GAP = 7, HEAT_H = 15, HEAT_GAP = 3;

interface TimelineProps {
  report: TransitImpactReport;
  view: View;
  selectedId: string | null;
  onSelect: (id: string) => void;
  isLight: boolean;
}

const TransitTimeline: React.FC<TimelineProps> = ({ report, view, selectedId, onSelect, isLight }) => {
  const tones = useTones(isLight);
  const now = Date.parse(report.asOf);
  const t0 = view === '12m' ? now - 45 * DAY : Date.parse(report.windowStart);
  const t1 = view === '12m' ? now + 365 * DAY : Date.parse(report.windowEnd);
  const bodies = view === '12m' ? ALL_BODIES : MAJOR;
  const x = (t: number) => L + ((Math.max(t0, Math.min(t1, t)) - t0) / (t1 - t0)) * (W - L - R);

  const top = 22;
  const dashaY = top;
  const lanesY = dashaY + LANE_H * 0.7 + LANE_GAP + 10;
  const laneY = (i: number) => lanesY + i * (LANE_H + LANE_GAP);
  const heatY = laneY(bodies.length) + 18;
  const heatRowY = (i: number) => heatY + i * (HEAT_H + HEAT_GAP);
  const H = heatRowY(IMPACT_AREAS.length) + 22;

  const segs = report.segments.filter(s => bodies.includes(s.planet) && Date.parse(s.end) > t0 && Date.parse(s.start) < t1);
  const ads = report.dasha.filter(d => d.level === 'Antardasha' && Date.parse(d.end) > t0 && Date.parse(d.start) < t1);
  const months = report.months.filter(m => { const t = Date.parse(m.month); return t + 27 * DAY > t0 && t < t1; });

  const sadeSati = useMemo(() => {
    const ss = report.segments.filter(s => s.planet === 'SATURN' && s.tags.some(t => t.label.startsWith('Sade Sati')));
    if (!ss.length) return null;
    return { start: Math.min(...ss.map(s => Date.parse(s.start))), end: Math.max(...ss.map(s => Date.parse(s.end))) };
  }, [report]);

  const ticks: { t: number; label: string; major: boolean }[] = [];
  const d0 = new Date(t0);
  if (view === '12m') {
    for (let m = 1; m <= 14; m++) {
      const t = Date.UTC(d0.getUTCFullYear(), d0.getUTCMonth() + m, 1);
      if (t > t1) break;
      const d = new Date(t);
      ticks.push({ t, label: d.getUTCMonth() === 0 ? String(d.getUTCFullYear()) : d.toLocaleDateString('en-GB', { month: 'short' }), major: d.getUTCMonth() === 0 });
    }
  } else {
    for (let y = d0.getUTCFullYear() + 1; ; y++) {
      const t = Date.UTC(y, 0, 1);
      if (t > t1) break;
      ticks.push({ t, label: String(y), major: true });
    }
  }

  const hatch = isLight ? 'rgba(15,23,42,0.28)' : 'rgba(255,255,255,0.35)';
  const pickArea = (monthIdx: number, area: ImpactArea) => {
    const id = months[monthIdx]?.drivers[area][0];
    if (id) onSelect(id);
  };

  return (
    <div className="overflow-x-auto -mx-1 px-1">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[720px] select-none" role="img" aria-label="Transit timeline">
        <defs>
          <pattern id="ti-retro" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="6" stroke={hatch} strokeWidth="2" />
          </pattern>
        </defs>

        {ticks.map(tk => (
          <g key={tk.t}>
            <line x1={x(tk.t)} x2={x(tk.t)} y1={top - 6} y2={H - 18} stroke={tones.grid} strokeWidth={tk.major ? 1.2 : 1} />
            <text x={x(tk.t) + 3} y={H - 6} fontSize="10" fill={tones.axis} fontWeight={tk.major ? 700 : 500}>{tk.label}</text>
          </g>
        ))}

        {/* Dasha lane */}
        <text x={8} y={dashaY + LANE_H * 0.35 + 4} fontSize="10.5" fontWeight="600" fill={tones.axis}>Dasha</text>
        {ads.map(d => {
          const a = x(Date.parse(d.start)), b = x(Date.parse(d.end));
          const hex = LORD_HEX[d.lord] ?? '#94a3b8';
          return (
            <g key={d.start}>
              <rect x={a + 0.5} y={dashaY} width={Math.max(1, b - a - 1)} height={LANE_H * 0.7} rx={4} fill={hex} fillOpacity={0.22} stroke={hex} strokeOpacity={0.5} />
              {b - a > 44 && <text x={a + 6} y={dashaY + LANE_H * 0.35 + 3.5} fontSize="9.5" fontWeight="600" fill={hex}>{d.lord}</text>}
              <title>{`Antardasha of ${d.lord}: ${fmtDate(d.start)} to ${fmtDate(d.end)}`}</title>
            </g>
          );
        })}

        {/* Planet lanes */}
        {bodies.map((body, i) => {
          const y = laneY(i);
          return (
            <g key={body}>
              <circle cx={16} cy={y + LANE_H / 2} r={8} fill={BODY_HEX[body]} />
              <text x={16} y={y + LANE_H / 2 + 3.5} textAnchor="middle" fontSize="10" fill="#fff" fontWeight="700">{PLANET_SYMBOLS[body]}</text>
              <text x={30} y={y + LANE_H / 2 + 4} fontSize="11" fontWeight="600" fill={isLight ? '#334155' : 'rgba(255,255,255,0.8)'}>{BODY_LABEL[body]}</text>
              <rect x={L} y={y} width={W - L - R} height={LANE_H} rx={6} fill={tones.track} />
            </g>
          );
        })}

        {sadeSati && view === '8y' && (() => {
          const a = x(sadeSati.start), b = x(sadeSati.end);
          if (b - a < 2) return null;
          const y = laneY(0) - 5;
          return (
            <g>
              <path d={`M${a} ${y + 3} V${y} H${b} V${y + 3}`} fill="none" stroke={TONE_HEX.bad} strokeWidth="1.5" />
              <text x={(a + b) / 2} y={y - 3} textAnchor="middle" fontSize="9" fontWeight="700" fill={TONE_HEX.bad}>SADE SATI</text>
            </g>
          );
        })()}

        {segs.map(seg => {
          const i = bodies.indexOf(seg.planet);
          const y = laneY(i);
          const a = x(Date.parse(seg.start)), b = x(Date.parse(seg.end));
          const w = Math.max(1.5, b - a - 1.5);
          const hex = TONE_HEX[seg.tone];
          const sel = seg.id === selectedId;
          const opacity = seg.tone === 'mixed' ? 0.4 : 0.3 + 0.5 * Math.abs(seg.score);
          return (
            <g key={seg.id} onClick={() => onSelect(seg.id)} style={{ cursor: 'pointer' }}>
              <rect x={a + 0.75} y={y + 1} width={w} height={LANE_H - 2} rx={5} fill={hex} fillOpacity={opacity}
                stroke={sel ? (isLight ? '#0f172a' : '#fff') : hex} strokeWidth={sel ? 2 : 1} strokeOpacity={sel ? 1 : 0.6} />
              {seg.retroSpans.map(r => {
                const ra = x(Date.parse(r.start)), rb = x(Date.parse(r.end));
                return rb - ra > 1 ? <rect key={r.start} x={ra} y={y + 1} width={rb - ra} height={LANE_H - 2} fill="url(#ti-retro)" pointerEvents="none" /> : null;
              })}
              {w > 15 && (
                <text x={a + w / 2 + 0.75} y={y + LANE_H / 2 + 4} textAnchor="middle" fontSize="11" fontWeight="600"
                  fill={isLight ? '#0f172a' : '#fff'} pointerEvents="none">
                  {SIGN_GLYPH[seg.rashi]}{w > 78 ? ` ${seg.westernName}` : ''}
                </text>
              )}
              {seg.tags.length > 0 && w > 8 && (
                <circle cx={a + w - 3} cy={y + 4.5} r={2.6} fill={TONE_HEX[seg.tags[0].kind]} pointerEvents="none" />
              )}
              <title>{`${BODY_LABEL[seg.planet]} in ${seg.westernName} (${seg.rashiName}) · ${fmtDate(seg.start)} to ${fmtDate(seg.end)} · ${TONE_LABEL[seg.tone]}`}</title>
            </g>
          );
        })}

        {/* Life-area heatmap */}
        <text x={8} y={heatY - 5} fontSize="9" fontWeight="700" letterSpacing="0.08em" fill={tones.axis}>LIFE AREAS</text>
        {IMPACT_AREAS.map((area, r) => (
          <g key={area}>
            <text x={8} y={heatRowY(r) + HEAT_H / 2 + 3.5} fontSize="10.5" fontWeight="500" fill={isLight ? '#475569' : 'rgba(255,255,255,0.65)'}>{AREA_LABEL[area]}</text>
            {months.map((m, c) => {
              const ms = Date.parse(m.month);
              const me = Date.UTC(new Date(ms).getUTCFullYear(), new Date(ms).getUTCMonth() + 1, 1);
              const a = x(ms), b = x(me);
              const v = m.areas[area];
              const hex = v >= 0 ? TONE_HEX.good : TONE_HEX.bad;
              return (
                <rect key={m.month} x={a + 0.5} y={heatRowY(r)} width={Math.max(1, b - a - 1)} height={HEAT_H} rx={2.5}
                  fill={Math.abs(v) < 0.04 ? tones.track : hex} fillOpacity={Math.abs(v) < 0.04 ? 1 : 0.14 + 0.8 * Math.min(1, Math.abs(v))}
                  style={{ cursor: 'pointer' }} onClick={() => pickArea(c, area)}>
                  <title>{`${AREA_LABEL[area]} · ${fmtMonth(ms)}: ${areaWord(v)} (${v >= 0 ? '+' : '−'}${Math.round(Math.abs(v) * 100)})`}</title>
                </rect>
              );
            })}
          </g>
        ))}

        {/* Today */}
        <line x1={x(now)} x2={x(now)} y1={top - 10} y2={H - 18} stroke="var(--c-accent)" strokeWidth="1.5" strokeDasharray="4 3" />
        <rect x={x(now) - 21} y={2} width={42} height={14} rx={7} fill="var(--c-accent)" />
        <text x={x(now)} y={12} textAnchor="middle" fontSize="9" fontWeight="700" fill="#fff">TODAY</text>
      </svg>
    </div>
  );
};

// ─── Detail pane ────────────────────────────────────────────────────────────

const AreaBar: React.FC<{ area: ImpactArea; value: number; isLight: boolean }> = ({ area, value, isLight }) => {
  const hex = value >= 0 ? TONE_HEX.good : TONE_HEX.bad;
  const pct = Math.min(1, Math.abs(value)) * 50;
  return (
    <div className="flex items-center gap-3">
      <span className={`w-24 text-xs font-medium ${isLight ? 'text-slate-600' : 'text-white/70'}`}>{AREA_LABEL[area]}</span>
      <div className="relative flex-1 h-2.5 rounded-full" style={{ background: isLight ? 'rgba(15,23,42,0.06)' : 'rgba(255,255,255,0.06)' }}>
        <span className="absolute top-[-3px] bottom-[-3px] left-1/2 w-px" style={{ background: isLight ? 'rgba(15,23,42,0.25)' : 'rgba(255,255,255,0.25)' }} />
        <motion.span className="absolute top-0 bottom-0 rounded-full" style={{ background: hex, [value >= 0 ? 'left' : 'right']: '50%' }}
          initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }} />
      </div>
      <span className="w-16 text-right text-[11px] font-semibold" style={{ color: Math.abs(value) < 0.05 ? undefined : hex }}>
        {Math.abs(value) < 0.05 ? <span className={isLight ? 'text-slate-400' : 'text-white/30'}>Quiet</span> : areaWord(value)}
      </span>
    </div>
  );
};

const DetailPane: React.FC<{ seg: TransitSegment; report: TransitImpactReport; isLight: boolean }> = ({ seg, report, isLight }) => {
  const tones = useTones(isLight);
  const now = Date.parse(report.asOf);
  const s = Date.parse(seg.start), e = Date.parse(seg.end);
  const status = now < s ? `Starts in ${fmtSpan(s - now)}` : now >= e ? `Ended ${fmtSpan(now - e)} ago` : `Happening now · ${fmtSpan(e - now)} left`;
  const mid = Math.max(s, Math.min(e, now >= s && now < e ? now : (s + e) / 2));
  const running = report.dasha.filter(d => Date.parse(d.start) <= mid && Date.parse(d.end) > mid);
  const md = running.find(d => d.level === 'Mahadasha')?.lord;
  const ad = running.find(d => d.level === 'Antardasha')?.lord;
  const hex = BODY_HEX[seg.planet];

  const strength = seg.bindus !== undefined
    ? { label: `${seg.bindus}/8 bindus`, note: seg.bindus >= 5 ? 'Strong support. Results are boosted.' : seg.bindus <= 2 ? 'Weak support. Results are dampened.' : 'Average support.' }
    : seg.sarva !== undefined
      ? { label: `Sign strength ${seg.sarva}`, note: seg.sarva >= 30 ? 'A well-supported sign for you.' : seg.sarva < 25 ? 'A weaker sign for you. Tread carefully.' : 'An average sign for you.' }
      : null;

  return (
    <motion.div key={seg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className="rounded-2xl border p-4 sm:p-5" style={{ borderColor: `${hex}55`, background: `color-mix(in srgb, var(--bg-page), ${hex} ${isLight ? 4 : 7}%)` }}>
      <div className="flex flex-wrap items-center gap-3">
        <Glyph body={seg.planet} size={44} />
        <div className="min-w-0 flex-1">
          <div className={`text-base font-semibold ${tones.strong}`}>
            {BODY_LABEL[seg.planet]} in {seg.westernName} <span className={`font-normal ${tones.muted}`}>({seg.rashiName})</span>
          </div>
          <div className={`text-xs ${tones.body}`}>
            {seg.startClipped ? `Before ${fmtDate(s)}` : fmtDate(s)} → {seg.endClipped ? `after ${fmtDate(e)}` : fmtDate(e)} · {fmtSpan(e - s)}
          </div>
          <div className="text-[11px] font-semibold mt-0.5" style={{ color: hex }}>{status}</div>
        </div>
        <TonePill tone={seg.tone} />
      </div>

      <div className="grid sm:grid-cols-3 gap-2 mt-4">
        {[
          { k: 'From your Moon', v: `${ordinal(seg.houseFromMoon)} house`, n: seg.valence > 0 ? 'Classically favourable' : seg.valence < 0 ? 'Classically challenging' : 'Classically neutral' },
          { k: 'From your Ascendant', v: `${ordinal(seg.houseFromLagna)} house`, n: HOUSE_THEME[seg.houseFromLagna] },
          ...(strength ? [{ k: 'Ashtakavarga', v: strength.label, n: strength.note }] : []),
        ].map(c => (
          <div key={c.k} className="rounded-xl px-3 py-2.5" style={{ background: tones.panel, border: `1px solid ${tones.line}` }}>
            <div className={`text-[10px] uppercase tracking-wider font-semibold ${tones.muted}`}>{c.k}</div>
            <div className={`text-sm font-semibold ${tones.strong}`}>{c.v}</div>
            <div className={`text-[11px] leading-snug ${tones.body}`}>{c.n}</div>
          </div>
        ))}
      </div>

      {seg.tags.length > 0 && (
        <div className="mt-4 space-y-2">
          {seg.tags.map(tag => (
            <div key={tag.label} className="flex gap-2.5 items-start rounded-xl px-3 py-2" style={{ background: `${TONE_HEX[tag.kind]}12`, border: `1px solid ${TONE_HEX[tag.kind]}33` }}>
              <Sparkles className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: TONE_HEX[tag.kind] }} />
              <div>
                <div className="text-xs font-bold" style={{ color: TONE_HEX[tag.kind] }}>{tag.label}</div>
                <div className={`text-xs ${tones.body}`}>{tag.note}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4 mt-4">
        <div className="space-y-3">
          <div>
            <div className={`text-[10px] uppercase tracking-wider font-semibold mb-1 ${tones.muted}`}>Classical reading</div>
            <p className={`text-sm leading-relaxed ${tones.body}`}>{seg.effect}</p>
          </div>
          <div>
            <div className={`text-[10px] uppercase tracking-wider font-semibold mb-1 ${tones.muted}`}>Where it lands</div>
            <p className={`text-sm leading-relaxed ${tones.body}`}>
              It moves through your {ordinal(seg.houseFromLagna)} house of {HOUSE_THEME[seg.houseFromLagna]}, and aspects your{' '}
              {seg.aspects.map((h, i) => (
                <span key={h}>{i > 0 && (i === seg.aspects.length - 1 ? ' and ' : ', ')}<b className={tones.strong}>{ordinal(h)}</b> ({HOUSE_THEME[h].split(',')[0]})</span>
              ))}.
            </p>
          </div>
          {seg.retroSpans.length > 0 && (
            <div className={`flex gap-2 text-xs ${tones.body}`}>
              <RotateCcw className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: hex }} />
              <span>
                Retrograde {seg.retroSpans.map(r => `${fmtDate(r.start)} to ${fmtDate(r.end)}`).join('; ')}. Expect reviews, delays and unfinished business coming back.
              </span>
            </div>
          )}
          <div className={`flex gap-2 text-xs ${tones.body}`}>
            <Layers className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: hex }} />
            <span>
              {seg.dasha.length > 0
                ? <>{BODY_LABEL[seg.planet]} also runs your <b className={tones.strong}>{seg.dasha.map(d => d.level).join(' and ')}</b> during this transit, so its results are <b className={tones.strong}>amplified</b>.</>
                : md
                  ? <>Running dasha at the time: <b style={{ color: LORD_HEX[md] }}>{md}</b>{ad && <> / <b style={{ color: LORD_HEX[ad] }}>{ad}</b></>}. The transit colours how that period plays out; it does not override it.</>
                  : 'Outside the calculated dasha range.'}
            </span>
          </div>
        </div>

        <div>
          <div className={`text-[10px] uppercase tracking-wider font-semibold mb-2 ${tones.muted}`}>Effect on your predictions</div>
          <div className="space-y-2.5">
            {IMPACT_AREAS.map(a => <AreaBar key={a} area={a} value={seg.areas[a]} isLight={isLight} />)}
          </div>
          <div className="mt-4 flex gap-2.5 rounded-xl px-3 py-2.5" style={{ background: tones.panel, border: `1px solid ${tones.line}` }}>
            <Lightbulb className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--c-accent-2)' }} />
            <p className={`text-xs leading-relaxed ${tones.body}`}>{seg.advice}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Upcoming ───────────────────────────────────────────────────────────────

interface Upcoming { t: number; segs: TransitSegment[] }

const UpcomingList: React.FC<{ report: TransitImpactReport; onSelect: (id: string) => void; selectedId: string | null; isLight: boolean }> = ({ report, onSelect, selectedId, isLight }) => {
  const tones = useTones(isLight);
  const now = Date.parse(report.asOf);
  const items = useMemo(() => {
    const out: Upcoming[] = [];
    const future = report.segments
      .filter(s => MAJOR.includes(s.planet) && !s.startClipped && Date.parse(s.start) > now)
      .sort((a, b) => Date.parse(a.start) - Date.parse(b.start));
    for (const s of future) {
      const t = Date.parse(s.start);
      const same = out.find(o => Math.abs(o.t - t) < 3 * DAY && o.segs.every(x => x.planet === 'RAHU' || x.planet === 'KETU') && (s.planet === 'RAHU' || s.planet === 'KETU'));
      if (same) same.segs.push(s); else out.push({ t, segs: [s] });
    }
    return out.slice(0, 7);
  }, [report, now]);

  if (!items.length) return null;
  return (
    <div className="relative pl-5">
      <span className="absolute left-[7px] top-2 bottom-2 w-px" style={{ background: tones.line }} />
      <div className="space-y-2.5">
        {items.map(item => {
          const lead = item.segs[0];
          const sel = item.segs.some(s => s.id === selectedId);
          return (
            <button key={lead.id} type="button" onClick={() => onSelect(lead.id)} data-open={sel}
              className="tap-row relative w-full text-left rounded-xl pl-4 pr-3 py-2.5 border"
              style={{ ...tapVars(BODY_HEX[lead.planet], tones.panel), borderColor: sel ? BODY_HEX[lead.planet] : tones.line }}>
              <span className="absolute -left-[17px] top-4 w-2.5 h-2.5 rounded-full" style={{ background: TONE_HEX[lead.tone], boxShadow: `0 0 0 3px ${TONE_HEX[lead.tone]}30` }} />
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className={`text-[11px] font-mono w-24 ${tones.muted}`}>{fmtDate(item.t)}</span>
                <span className="flex items-center gap-2 flex-1 min-w-0">
                  {item.segs.map(s => (
                    <span key={s.id} className={`flex items-center gap-1.5 text-sm font-semibold ${tones.strong}`}>
                      <Glyph body={s.planet} size={22} />
                      {BODY_LABEL[s.planet]} → {s.westernName}
                    </span>
                  ))}
                </span>
                <span className="text-[11px] font-semibold" style={{ color: BODY_HEX[lead.planet] }}>in {fmtSpan(item.t - now)}</span>
                <TonePill tone={lead.tone} small />
              </div>
              <div className={`text-xs mt-1 ml-0 sm:ml-[6.75rem] ${tones.body}`}>
                {ordinal(lead.houseFromMoon)} from Moon, {ordinal(lead.houseFromLagna)} from Ascendant ({HOUSE_THEME[lead.houseFromLagna].split(',')[0]}).
                {lead.tags[0] && <span className="font-semibold" style={{ color: TONE_HEX[lead.tags[0].kind] }}> {lead.tags[0].label}.</span>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ─── Tab ────────────────────────────────────────────────────────────────────

const TransitImpactTab: React.FC<{ birthData: BirthData }> = ({ birthData }) => {
  const isLight = useTheme();
  const tones = useTones(isLight);
  const [view, setView] = useState<View>('8y');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: report, isLoading, error } = useQuery({
    queryKey: ['transitImpact', birthData, new Date().toISOString().slice(0, 10)],
    queryFn: () => getTransitImpact(birthData),
    staleTime: 1000 * 60 * 60,
  });
  const { data: prediction } = useQuery({
    queryKey: ['currentPrediction', birthData, new Date().toISOString().slice(0, 10)],
    queryFn: () => getCurrentPrediction(birthData, undefined, 'en'),
    staleTime: 1000 * 60 * 60,
  });

  const now = report ? Date.parse(report.asOf) : Date.now();
  const current = useMemo(() => {
    if (!report) return [];
    return ALL_BODIES
      .map(b => report.segments.find(s => s.planet === b && Date.parse(s.start) <= now && Date.parse(s.end) > now))
      .filter((s): s is TransitSegment => !!s);
  }, [report, now]);

  const selected = report?.segments.find(s => s.id === selectedId) ?? current[0] ?? null;
  const thisMonth = report?.months.find(m => {
    const t = Date.parse(m.month);
    return t <= now && now < t + 31 * DAY;
  });

  const select = (id: string, scroll = true) => {
    setSelectedId(id);
    if (scroll) {
      requestAnimationFrame(() => document.getElementById('transit-detail')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }));
    }
  };

  if (isLoading) {
    return (
      <div className="glass-card rounded-2xl p-10 text-center">
        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3" style={{ color: 'var(--c-accent)' }} />
        <span className={`text-sm ${tones.muted}`}>Tracing the planets across eight years…</span>
      </div>
    );
  }
  if (error || !report) {
    return <div className="glass-card rounded-2xl p-8 text-center text-rose-400 text-sm">Could not calculate transits.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="glass-card rounded-2xl p-4 sm:p-6">
        <SectionTitle icon={Orbit} isLight={isLight} title="Transit Impact"
          sub="How Saturn, Jupiter, Rahu, Ketu, Mars and the Sun moving through the signs shape your predictions. Scored from your Moon sign, Ascendant, Ashtakavarga and running dasha." />
        {thisMonth && (
          <div className="rounded-2xl px-3 py-4" style={{ background: tones.panel, border: `1px solid ${tones.line}` }}>
            <div className={`text-[10px] uppercase tracking-wider font-semibold text-center mb-2 ${tones.muted}`}>
              Transit climate for {fmtMonth(thisMonth.month)}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {IMPACT_AREAS.map(a => <ClimateGauge key={a} area={a} value={thisMonth.areas[a]} isLight={isLight} />)}
            </div>
          </div>
        )}
      </div>

      <div className="glass-card rounded-2xl p-4 sm:p-6">
        <SectionTitle icon={Sparkles} isLight={isLight} title="Sky right now"
          sub="Saturn, Jupiter, the nodes, Mars and the Sun as they sit today — and how each one colours the running predictions. English only." />
        <TransitSky
          report={report}
          current={current}
          selectedId={selected?.id ?? null}
          onSelect={(id) => select(id, false)}
          isLight={isLight}
          prediction={prediction}
        />
      </div>

      <div className="glass-card rounded-2xl p-4 sm:p-6">
        <SectionTitle icon={Compass} isLight={isLight} title="Happening now" sub="Where each major planet sits for you today, and how far through the sign it is."
          right={<TapHint label="Tap to open" />} />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {current.map(seg => (
            <NowCard key={seg.id} seg={seg} now={now} selected={selected?.id === seg.id} onSelect={() => select(seg.id)} isLight={isLight} />
          ))}
        </div>
      </div>

      <div className="glass-card rounded-2xl p-4 sm:p-6">
        <SectionTitle icon={CalendarClock} isLight={isLight} title="Transit timeline"
          sub="Each bar is one sign. Colour shows how it treats you, stripes mark retrograde spells, and the grid below shows the combined effect on each life area month by month."
          right={
            <div className="flex rounded-lg p-0.5 border shrink-0" style={{ borderColor: tones.line, background: tones.panel }}>
              {(['12m', '8y'] as View[]).map(v => (
                <button key={v} type="button" onClick={() => setView(v)}
                  className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-colors ${view === v ? 'text-white' : tones.muted}`}
                  style={view === v ? { background: 'var(--c-accent)' } : undefined}>
                  {v === '12m' ? 'Next 12 months' : '8 years'}
                </button>
              ))}
            </div>
          } />
        <TransitTimeline report={report} view={view} selectedId={selected?.id ?? null} onSelect={select} isLight={isLight} />
        <div className={`flex flex-wrap gap-x-4 gap-y-1.5 mt-3 text-[11px] ${tones.muted}`}>
          {(Object.keys(TONE_HEX) as ImpactTone[]).map(t => (
            <span key={t} className="flex items-center gap-1.5"><span className="w-3 h-3 rounded" style={{ background: TONE_HEX[t], opacity: 0.7 }} />{TONE_LABEL[t]}</span>
          ))}
          <span className="flex items-center gap-1.5">
            <svg width="14" height="12"><rect width="14" height="12" rx="2" fill={isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.08)'} /><path d="M0 12 L12 0 M4 12 L14 2 M-2 6 L4 0" stroke={isLight ? 'rgba(15,23,42,0.35)' : 'rgba(255,255,255,0.45)'} strokeWidth="1.6" /></svg>
            Retrograde
          </span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: TONE_HEX.bad }} />Key event (Sade Sati, returns and similar)</span>
          <span>Tap any bar or heatmap cell for details.</span>
        </div>
      </div>

      <div id="transit-detail" className="scroll-mt-4">
        <AnimatePresence mode="wait">
          {selected && <DetailPane key={selected.id} seg={selected} report={report} isLight={isLight} />}
        </AnimatePresence>
      </div>

      <div className="glass-card rounded-2xl p-4 sm:p-6">
        <SectionTitle icon={Sparkles} isLight={isLight} title="Major transitions ahead" sub="The next sign changes of the slow planets, which set the tone for months or years." />
        <UpcomingList report={report} onSelect={select} selectedId={selected?.id ?? null} isLight={isLight} />
      </div>
    </div>
  );
};

export default TransitImpactTab;
