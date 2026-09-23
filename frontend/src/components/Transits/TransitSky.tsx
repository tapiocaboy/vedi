/**
 * Transit Sky — a visual of the major transits that are happening right now
 * and how they colour the running dasha predictions. Planets sit in the house
 * they occupy from the natal Moon; beams run to the life areas they lift or
 * test. English only.
 */

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Lightbulb } from 'lucide-react';
import type { TransitImpactReport, TransitSegment, TransitBody, ImpactArea, ImpactTone, DashaPredictionData } from '../../services/api';
import {
  IMPACT_AREAS, AREA_LABEL, BODY_LABEL, HOUSE_THEME,
  overlayKind, overlaySentence, happeningHeadline, skyStory,
  type OverlayKind, type DashaTrend,
} from '../../lib/core/transitImpact';
import { RASHI_ENGLISH } from '../../lib/core/rashi';
import { PLANET_SYMBOLS } from '../../types/astrology';
import { LORD_HEX, TREND_HEX } from '../shared/BarCharts';

const TONE_HEX: Record<ImpactTone, string> = { good: '#10b981', mixed: '#f59e0b', bad: '#ef4444' };
const KIND_HEX: Record<OverlayKind, string> = {
  lifts: TONE_HEX.good, tests: TONE_HEX.bad, colours: TONE_HEX.mixed, quiet: '#94a3b8',
};
const KIND_WORD: Record<OverlayKind, string> = {
  lifts: 'Lifts', tests: 'Tests', colours: 'Colours', quiet: 'Quiet',
};
const BODY_HEX: Record<TransitBody, string> = {
  SATURN: LORD_HEX.Saturn, JUPITER: LORD_HEX.Jupiter, RAHU: '#8b93a3',
  KETU: LORD_HEX.Ketu, MARS: LORD_HEX.Mars, SUN: LORD_HEX.Sun,
};
const TREND_WORD: Record<string, string> = {
  positive: 'Favourable', negative: 'Challenging', mixed: 'Mixed', neutral: 'Steady',
};

const W = 720, H = 560, CX = 360, CY = 278;
const R_YOU = 46, R_AREA = 118, R_TICK = 188, R_ORBIT = 222;

const AREA_DEG: Record<ImpactArea, number> = {
  career: -90, relationships: 0, health: 90, wealth: 180,
};

const polar = (deg: number, r: number) => {
  const a = (deg * Math.PI) / 180;
  return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) };
};

const nth = (n: number) => {
  const v = n % 100;
  const s = ['th', 'st', 'nd', 'rd'];
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
};

function planetSlots(segs: TransitSegment[]): Map<string, { x: number; y: number; deg: number }> {
  const byHouse = new Map<number, TransitSegment[]>();
  for (const s of segs) {
    const list = byHouse.get(s.houseFromMoon) ?? [];
    list.push(s);
    byHouse.set(s.houseFromMoon, list);
  }
  const out = new Map<string, { x: number; y: number; deg: number }>();
  for (const [house, list] of byHouse) {
    list.forEach((s, i) => {
      const fan = (i - (list.length - 1) / 2) * 16;
      const deg = (house - 1) * 30 - 90 + fan;
      out.set(s.id, { ...polar(deg, R_ORBIT), deg });
    });
  }
  return out;
}

function dashaLabel(prediction?: DashaPredictionData | null): string | undefined {
  if (!prediction) return undefined;
  return [prediction.dashaLord, prediction.antardasha].filter(Boolean).join('–');
}

const tones = (isLight: boolean) => isLight
  ? { strong: 'text-slate-800', body: 'text-slate-600', muted: 'text-slate-400', panel: '#f8fafc', line: 'rgba(15,23,42,0.08)', ink: '#0f172a', faint: 'rgba(15,23,42,0.45)', track: 'rgba(15,23,42,0.06)' }
  : { strong: 'text-white', body: 'text-white/70', muted: 'text-white/35', panel: 'rgba(0,0,0,0.22)', line: 'rgba(255,255,255,0.07)', ink: '#fff', faint: 'rgba(255,255,255,0.45)', track: 'rgba(255,255,255,0.05)' };

interface Props {
  report: TransitImpactReport;
  current: TransitSegment[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  isLight: boolean;
  prediction?: DashaPredictionData | null;
}

const TransitSky: React.FC<Props> = ({ report, current, selectedId, onSelect, isLight, prediction }) => {
  const t = tones(isLight);
  const [focusArea, setFocusArea] = useState<ImpactArea | null>(null);
  const selected = current.find(s => s.id === selectedId) ?? current[0] ?? null;
  const slots = useMemo(() => planetSlots(current), [current]);
  const now = Date.parse(report.asOf);
  const thisMonth = report.months.find(m => {
    const start = Date.parse(m.month);
    return start <= now && now < start + 31 * 86_400_000;
  });
  const period = dashaLabel(prediction);
  const events = current.filter(s => s.tags.length > 0);

  const areaPos = (area: ImpactArea) => polar(AREA_DEG[area], R_AREA);

  const beamActive = (seg: TransitSegment, area: ImpactArea) => {
    if (overlayKind(seg.areas[area]) === 'quiet') return false;
    if (focusArea && focusArea !== area) return false;
    return true;
  };

  const pickArea = (area: ImpactArea) => {
    setFocusArea(prev => (prev === area ? null : area));
    const id = thisMonth?.drivers[area][0];
    if (id) onSelect(id);
  };

  return (
    <div className="space-y-5">
      <div>
        {events.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {events.map(seg => (
              <button
                key={seg.id}
                type="button"
                onClick={() => onSelect(seg.id)}
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold border"
                style={{
                  color: TONE_HEX[seg.tags[0].kind],
                  background: `${TONE_HEX[seg.tags[0].kind]}14`,
                  borderColor: selected?.id === seg.id ? TONE_HEX[seg.tags[0].kind] : `${TONE_HEX[seg.tags[0].kind]}44`,
                }}
              >
                <span className="text-[12px]">{PLANET_SYMBOLS[seg.planet]}</span>
                {seg.tags[0].label}
              </button>
            ))}
          </div>
        )}

        <svg viewBox={`0 0 ${W} ${H}`} className="w-full select-none" role="img" aria-label="Transit sky showing how happening planets colour life-area predictions">
          <defs>
            <radialGradient id="sky-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--c-accent)" stopOpacity={isLight ? 0.16 : 0.22} />
              <stop offset="70%" stopColor="var(--c-accent)" stopOpacity="0.03" />
              <stop offset="100%" stopColor="var(--c-accent)" stopOpacity="0" />
            </radialGradient>
            <filter id="sky-halo" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="5" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <circle cx={CX} cy={CY} r={R_ORBIT + 28} fill="url(#sky-glow)" />
          <circle cx={CX} cy={CY} r={R_ORBIT} fill="none" stroke={t.line} strokeWidth="1.2" strokeDasharray="3 7" />
          <circle cx={CX} cy={CY} r={R_TICK} fill="none" stroke={t.line} strokeWidth="1" />

          {Array.from({ length: 12 }, (_, i) => {
            const house = i + 1;
            const deg = i * 30 - 90;
            const a = polar(deg, R_TICK);
            const b = polar(deg, R_TICK + 8);
            const label = polar(deg, R_TICK - 16);
            return (
              <g key={house}>
                <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={t.faint} strokeOpacity="0.45" strokeWidth="1" />
                <text x={label.x} y={label.y + 3.5} textAnchor="middle" fontSize="9" fill={t.faint} fontWeight="600">{house}</text>
              </g>
            );
          })}
          <text x={CX} y={36} textAnchor="middle" fontSize="10" fontWeight="700" letterSpacing="0.14em" fill={t.faint}>
            HOUSES FROM THE MOON
          </text>

          {current.flatMap(seg => IMPACT_AREAS.filter(area => beamActive(seg, area)).map(area => {
            const p = slots.get(seg.id);
            const a = areaPos(area);
            if (!p) return null;
            const kind = overlayKind(seg.areas[area]);
            const hex = KIND_HEX[kind];
            const dim = selected && selected.id !== seg.id && focusArea !== area;
            const mid = { x: (p.x + a.x) / 2, y: (p.y + a.y) / 2 };
            const ctrl = { x: CX + (mid.x - CX) * 0.42, y: CY + (mid.y - CY) * 0.42 };
            const w = 1.4 + 3.6 * Math.min(1, Math.abs(seg.areas[area]));
            return (
              <motion.path
                key={`${seg.id}-${area}`}
                d={`M ${p.x} ${p.y} Q ${ctrl.x} ${ctrl.y} ${a.x} ${a.y}`}
                fill="none"
                stroke={hex}
                strokeWidth={w}
                strokeLinecap="round"
                strokeOpacity={dim ? 0.12 : 0.28 + 0.45 * Math.min(1, Math.abs(seg.areas[area]))}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              />
            );
          }))}

          {IMPACT_AREAS.map(area => {
            const p = areaPos(area);
            const v = thisMonth?.areas[area] ?? 0;
            const hex = v >= 0.2 ? TONE_HEX.good : v <= -0.2 ? TONE_HEX.bad : TONE_HEX.mixed;
            const on = focusArea === area;
            return (
              <g key={area} onClick={() => pickArea(area)} style={{ cursor: 'pointer' }}>
                <circle cx={p.x} cy={p.y} r={on ? 28 : 24} fill={isLight ? '#fff' : 'color-mix(in srgb, var(--bg-page), white 6%)'}
                  stroke={hex} strokeWidth={on ? 2.4 : 1.6} />
                <circle cx={p.x} cy={p.y} r={on ? 22 : 18} fill={hex} fillOpacity={0.12 + 0.28 * Math.min(1, Math.abs(v))} />
                <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill={t.ink}>{AREA_LABEL[area]}</text>
                <title>{`${AREA_LABEL[area]} this month: ${v >= 0.2 ? 'supportive' : v <= -0.2 ? 'testing' : 'mixed'}`}</title>
              </g>
            );
          })}

          <g>
            <circle cx={CX} cy={CY} r={R_YOU} fill={isLight ? '#fff' : 'color-mix(in srgb, var(--bg-page), white 8%)'}
              stroke="var(--c-accent)" strokeWidth="1.8" />
            <text x={CX} y={CY - 8} textAnchor="middle" fontSize="11" fontWeight="800" letterSpacing="0.16em" fill="var(--c-accent)">YOU</text>
            <text x={CX} y={CY + 8} textAnchor="middle" fontSize="10" fontWeight="600" fill={t.faint}>
              Moon {RASHI_ENGLISH[report.moonRashi]}
            </text>
            <text x={CX} y={CY + 21} textAnchor="middle" fontSize="9" fill={t.faint}>
              Lagna {RASHI_ENGLISH[report.lagnaRashi]}
            </text>
          </g>

          {current.map(seg => {
            const p = slots.get(seg.id);
            if (!p) return null;
            const hex = BODY_HEX[seg.planet];
            const on = selected?.id === seg.id;
            const tagged = seg.tags.length > 0;
            const r = on ? 20 : 16;
            return (
              <g key={seg.id} onClick={() => onSelect(seg.id)} style={{ cursor: 'pointer' }} filter={tagged ? 'url(#sky-halo)' : undefined}>
                <circle cx={p.x} cy={p.y} r={r + 5} fill={hex} fillOpacity={on ? 0.22 : 0.1} />
                <circle cx={p.x} cy={p.y} r={r} fill={hex} stroke={on ? (isLight ? '#0f172a' : '#fff') : hex} strokeWidth={on ? 2 : 1} />
                <text x={p.x} y={p.y + 5} textAnchor="middle" fontSize={on ? 16 : 14} fill="#fff" fontWeight="700">
                  {PLANET_SYMBOLS[seg.planet]}
                </text>
                <text x={p.x} y={p.y + r + 13} textAnchor="middle" fontSize="11" fontWeight="700" fill={t.ink}>
                  {BODY_LABEL[seg.planet]}
                </text>
                <text x={p.x} y={p.y + r + 25} textAnchor="middle" fontSize="9" fill={t.faint}>
                  {seg.westernName}
                </text>
                <title>{happeningHeadline(seg)}</title>
              </g>
            );
          })}
        </svg>
        <p className={`text-[11px] leading-relaxed px-1 ${t.muted}`}>
          Planets sit in the house they occupy from your Moon. Beams show which predictions they are lifting or testing today.
          Tap a planet, an event chip, or a life area.
        </p>
      </div>

      <div>
        {selected ? (
          <SkyStory
            seg={selected}
            prediction={prediction}
            period={period}
            isLight={isLight}
            focusArea={focusArea}
          />
        ) : (
          <p className={`text-sm ${t.muted}`}>No major transits are in range right now.</p>
        )}
      </div>
    </div>
  );
};

const SkyStory: React.FC<{
  seg: TransitSegment;
  prediction?: DashaPredictionData | null;
  period?: string;
  isLight: boolean;
  focusArea: ImpactArea | null;
}> = ({ seg, prediction, period, isLight, focusArea }) => {
  const t = tones(isLight);
  const hex = BODY_HEX[seg.planet];
  const areas = focusArea ? [focusArea] : IMPACT_AREAS.filter(a => overlayKind(seg.areas[a]) !== 'quiet');
  const shown = areas.length ? areas : IMPACT_AREAS;

  return (
    <div className="rounded-2xl border p-4 sm:p-5" style={{ borderColor: `${hex}55`, background: `color-mix(in srgb, var(--bg-page), ${hex} ${isLight ? 4 : 7}%)` }}>
      <div className="flex items-start gap-3">
        <span className="w-11 h-11 rounded-full flex items-center justify-center text-lg font-semibold text-white shrink-0"
          style={{ background: hex, boxShadow: `0 0 0 3px ${hex}26` }}>
          {PLANET_SYMBOLS[seg.planet]}
        </span>
        <div className="min-w-0">
          <div className={`text-sm font-semibold ${t.strong}`}>{happeningHeadline(seg)}</div>
          <div className={`text-[11px] mt-0.5 ${t.muted}`}>
            {nth(seg.houseFromMoon)} from Moon · {nth(seg.houseFromLagna)} from Ascendant · {HOUSE_THEME[seg.houseFromLagna].split(',')[0]}
            {period && <> · Period {period}</>}
          </div>
        </div>
      </div>

      {seg.tags[0] && (
        <div className="mt-3 flex gap-2 items-start rounded-xl px-3 py-2" style={{ background: `${TONE_HEX[seg.tags[0].kind]}12`, border: `1px solid ${TONE_HEX[seg.tags[0].kind]}33` }}>
          <Sparkles className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: TONE_HEX[seg.tags[0].kind] }} />
          <p className={`text-xs leading-relaxed ${t.body}`}>{seg.tags[0].note}</p>
        </div>
      )}

      <p className={`text-sm leading-relaxed mt-3 ${t.body}`}>{skyStory(seg, period)}</p>

      <div className={`text-[10px] uppercase tracking-wider font-semibold mt-4 mb-2 ${t.muted}`}>
        How this colours the predictions
      </div>
      <div className="space-y-2">
        {shown.map(area => {
          const kind = overlayKind(seg.areas[area]);
          const pred = prediction?.predictions[area];
          const trend = pred?.trend as DashaTrend | undefined;
          return (
            <div key={area} className="rounded-xl px-3 py-2.5" style={{ background: t.panel, border: `1px solid ${t.line}` }}>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-xs font-semibold ${t.strong}`}>{AREA_LABEL[area]}</span>
                {trend && (
                  <span className="text-[10px] font-semibold rounded-full px-2 py-0.5"
                    style={{ color: TREND_HEX[trend], background: `${TREND_HEX[trend]}1a` }}>
                    Period · {TREND_WORD[trend]}
                  </span>
                )}
                <span className="text-[10px] font-semibold rounded-full px-2 py-0.5"
                  style={{ color: KIND_HEX[kind], background: `${KIND_HEX[kind]}1a` }}>
                  Transit · {KIND_WORD[kind]}
                </span>
              </div>
              <p className={`text-xs leading-relaxed mt-1 ${t.body}`}>{overlaySentence(seg, area, trend)}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex gap-2.5 rounded-xl px-3 py-2.5" style={{ background: t.panel, border: `1px solid ${t.line}` }}>
        <Lightbulb className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--c-accent-2)' }} />
        <p className={`text-xs leading-relaxed ${t.body}`}>{seg.advice}</p>
      </div>
    </div>
  );
};

export default TransitSky;
