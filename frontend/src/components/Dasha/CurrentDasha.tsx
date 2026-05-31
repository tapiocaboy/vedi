import React from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import type { CurrentDasha as CurrentDashaType } from '../../types/astrology';

const PALETTE = {
  pink: '#ff44f6',
  gold: '#ffcb3a',
  plum: '#511d47',
};

const LORD_HEX: Record<string, string> = {
  Sun:     '#f59e0b',
  Moon:    '#94a3b8',
  Mars:    '#ef4444',
  Mercury: '#10b981',
  Jupiter: '#eab308',
  Venus:   '#f472b6',
  Saturn:  '#38bdf8',
  Rahu:    '#6b7280',
  Ketu:    '#f97316',
};

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function daysToYMD(days: number): string {
  if (days <= 0) return '0d';
  const y = Math.floor(days / 365);
  const rem = days % 365;
  const m = Math.floor(rem / 30);
  const d = rem % 30;
  const parts: string[] = [];
  if (y > 0) parts.push(`${y}yr`);
  if (m > 0) parts.push(`${m}mo`);
  if (d > 0 || parts.length === 0) parts.push(`${d}d`);
  return parts.join(' ');
}

// Deterministic particle positions so there's no random flicker on re-render
const PARTICLES: { dx: number[]; dy: number[]; delay: number; color: string }[] = [
  { dx: [-5,  9, -5], dy: [-7,  1, -7], delay: 0.00, color: PALETTE.pink },
  { dx: [ 7, -3,  7], dy: [-3,  7, -3], delay: 0.35, color: PALETTE.gold },
  { dx: [-2,  7, -2], dy: [ 7, -7,  7], delay: 0.70, color: PALETTE.pink },
  { dx: [ 9, -5,  9], dy: [ 1, -5,  1], delay: 1.05, color: PALETTE.gold },
  { dx: [-7,  3, -7], dy: [-1,  9, -1], delay: 1.40, color: PALETTE.pink },
  { dx: [ 3, -9,  3], dy: [ 5, -1,  5], delay: 0.50, color: PALETTE.gold },
];


interface BarRowProps {
  label: string;
  lord: string;
  start: string;
  end: string;
  nowMs: number;
  index: number;
}

const BarRow: React.FC<BarRowProps> = ({ label, lord, start, end, nowMs, index }) => {
  const startMs  = new Date(start).getTime();
  const endMs    = new Date(end).getTime();
  const total    = endMs - startMs;
  const elapsed  = Math.max(0, Math.min(nowMs - startMs, total));
  const pct      = total > 0 ? (elapsed / total) * 100 : 0;
  const daysLeft = Math.max(0, Math.round((endMs - nowMs) / 86_400_000));
  const color    = LORD_HEX[lord] ?? '#38bdf8';

  const startYear = new Date(start).getFullYear();
  const endYear   = new Date(end).getFullYear();
  const timeLeft  = daysToYMD(daysLeft);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="space-y-1.5"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
          <span className="text-[9px] uppercase tracking-[0.18em] text-white/30">{label}</span>
          <span className="text-sm font-bold text-white">{lord}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold tabular-nums" style={{ color }}>
            {pct.toFixed(0)}%
          </span>
          <span
            className="text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded-md"
            style={{ background: color + '22', color }}
          >
            {timeLeft}
          </span>
        </div>
      </div>

      {/* Bar */}
      <div
        className="relative h-8 rounded-xl overflow-hidden"
        style={{ backgroundColor: PALETTE.plum }}
      >
        {/* Solid fill */}
        <motion.div
          className="absolute inset-y-0 left-0"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.1, delay: 0.15 + index * 0.1, ease: [0.4, 0, 0.2, 1] }}
        />

        {/* Start year — shows on fill when pct>18, else on plum bg */}
        <div className="absolute inset-y-0 left-0 flex items-center z-10 pl-3 pointer-events-none">
          <span
            className="text-[9px] font-mono font-bold"
            style={{ color: pct > 18 ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.38)' }}
          >
            {startYear}
          </span>
        </div>

        {/* End year */}
        <div className="absolute inset-y-0 right-0 flex items-center z-10 pr-3 pointer-events-none">
          <span className="text-[9px] font-mono" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {endYear}
          </span>
        </div>

        {/* "Now" tick */}
        {pct > 2 && pct < 97 && (
          <div
            className="absolute inset-y-[-1px] w-[2px] rounded-sm z-20"
            style={{ left: `calc(${pct}% - 1px)`, backgroundColor: 'white' }}
          />
        )}
      </div>

      {/* Full date range */}
      <div className="flex justify-between px-0.5">
        <span className="text-[9px] font-mono text-white/25">{fmtDate(start)}</span>
        <span className="text-[9px] font-mono text-white/25">{fmtDate(end)}</span>
      </div>
    </motion.div>
  );
};

interface Props {
  currentDasha: CurrentDashaType;
}

export const CurrentDasha: React.FC<Props> = ({ currentDasha }) => {
  const { mahadasha, antardasha, pratyantardasha, sookshmaDasha, targetDate } = currentDasha;
  const nowMs = new Date(targetDate).getTime();

  const rows = [
    { label: 'Mahadasha',      lord: mahadasha.lord,      start: mahadasha.start,      end: mahadasha.end      },
    { label: 'Antardasha',     lord: antardasha.lord,     start: antardasha.start,     end: antardasha.end     },
    ...(pratyantardasha
      ? [{ label: 'Pratyantardasha', lord: pratyantardasha.lord, start: pratyantardasha.start, end: pratyantardasha.end }]
      : []),
    ...(sookshmaDasha
      ? [{ label: 'Sookshma Dasha',  lord: sookshmaDasha.lord,   start: sookshmaDasha.start,   end: sookshmaDasha.end   }]
      : []),
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/3 rounded-2xl border border-white/8 p-5"
    >
      {/* Card header */}
      <div className="flex items-center gap-2.5 mb-5">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{
            background: `${PALETTE.plum}cc`,
            border: `1px solid ${PALETTE.pink}30`,
          }}
        >
          <Clock className="w-3.5 h-3.5" style={{ color: PALETTE.gold }} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Active Dasha Periods</h3>
          <p className="text-[11px] text-white/35">
            {rows.map(r => r.lord).join(' · ')}
          </p>
        </div>
      </div>

      {/* Bar rows */}
      <div className="space-y-5">
        {rows.map((r, i) => (
          <BarRow key={r.label} {...r} nowMs={nowMs} index={i} />
        ))}
      </div>
    </motion.div>
  );
};
