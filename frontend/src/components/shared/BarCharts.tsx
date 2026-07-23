import React from 'react';
import { motion } from 'framer-motion';

export const BAR_PALETTE = {
  pink: '#FF2E51',
  gold: '#ffcb3a',
  plum: '#1e1225',
} as const;

export const LORD_HEX: Record<string, string> = {
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

export const TREND_HEX = {
  positive: '#10b981',
  negative: '#ef4444',
  mixed:    BAR_PALETTE.gold,
  neutral:  '#94a3b8',
} as const;

export function fmtBarDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function daysToYMD(days: number): string {
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

interface ProgressBarProps {
  pct: number;
  color: string;
  height?: 'sm' | 'md' | 'lg';
  animate?: boolean;
  index?: number;
  showTick?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  pct,
  color,
  height = 'lg',
  animate = true,
  index = 0,
  showTick = false,
  className = '',
}) => {
  const clamped = Math.max(0, Math.min(100, pct));
  const hClass = height === 'lg' ? 'h-8' : height === 'md' ? 'h-4' : 'h-2';

  return (
    <div
      className={`relative ${hClass} rounded-xl overflow-hidden ${className}`}
      style={{ backgroundColor: BAR_PALETTE.plum }}
    >
      {animate ? (
        <motion.div
          className="absolute inset-y-0 left-0"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 1.1, delay: 0.15 + index * 0.1, ease: [0.4, 0, 0.2, 1] }}
        />
      ) : (
        <div
          className="absolute inset-y-0 left-0"
          style={{ width: `${clamped}%`, backgroundColor: color }}
        />
      )}
      {showTick && clamped > 2 && clamped < 97 && (
        <div
          className="absolute inset-y-[-1px] w-[2px] rounded-sm z-20"
          style={{ left: `calc(${clamped}% - 1px)`, backgroundColor: 'white' }}
        />
      )}
    </div>
  );
};

export interface DashaBarRowProps {
  label: string;
  /** Raw English planet name — LORD_HEX is keyed on it, so it must not be
      translated or every bar falls back to the default colour. */
  lord: string;
  /** Display name for the lord. Defaults to `lord` (i.e. English). */
  lordLabel?: string;
  start: string;
  end: string;
  nowMs: number;
  index?: number;
}

export const DashaBarRow: React.FC<DashaBarRowProps> = ({
  label, lord, lordLabel, start, end, nowMs, index = 0,
}) => {
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
          <span className="text-[9px] uppercase tracking-[0.18em] text-white/30">{label}</span>
          <span className="text-sm font-bold text-white">{lordLabel ?? lord}</span>
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

      <div
        className="relative h-8 rounded-xl overflow-hidden"
        style={{ backgroundColor: BAR_PALETTE.plum }}
      >
        <motion.div
          className="absolute inset-y-0 left-0"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.1, delay: 0.15 + index * 0.1, ease: [0.4, 0, 0.2, 1] }}
        />

        <div className="absolute inset-y-0 left-0 flex items-center z-10 pl-3 pointer-events-none">
          <span
            className="text-[9px] font-mono font-bold"
            style={{ color: pct > 18 ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.38)' }}
          >
            {startYear}
          </span>
        </div>

        <div className="absolute inset-y-0 right-0 flex items-center z-10 pr-3 pointer-events-none">
          <span className="text-[9px] font-mono" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {endYear}
          </span>
        </div>

        {pct > 2 && pct < 97 && (
          <div
            className="absolute inset-y-[-1px] w-[2px] rounded-sm z-20"
            style={{ left: `calc(${pct}% - 1px)`, backgroundColor: 'white' }}
          />
        )}
      </div>

      <div className="flex justify-between px-0.5">
        <span className="text-[9px] font-mono text-white/25">{fmtBarDate(start)}</span>
        <span className="text-[9px] font-mono text-white/25">{fmtBarDate(end)}</span>
      </div>
    </motion.div>
  );
};
