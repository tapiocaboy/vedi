import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Grid3x3, Loader2 } from 'lucide-react';
import { getAshtakavarga } from '../../services/api';
import type { BirthData } from '../../services/api';
import { PLANETS, bindusToLabel, sarvaToLabel, type Planet } from '../../lib/core/ashtakavarga';
import { RASHI_ENGLISH } from '../../lib/core/rashi';
import { useTheme } from '../../hooks/useTheme';

const ACCENT = '#FF2E51';

interface Props {
  birthData: BirthData;
}

const PLANET_GLYPH: Record<Planet, string> = {
  Sun: '☉', Moon: '☽', Mars: '♂', Mercury: '☿',
  Jupiter: '♃', Venus: '♀', Saturn: '♄',
};

// Dark-mode cell classes (existing)
function bhinnaCellClassDark(b: number): string {
  if (b <= 2) return 'bg-rose-500/20 text-rose-200 border-rose-400/35';
  if (b === 3) return 'bg-amber-500/18 text-amber-200 border-amber-400/35';
  if (b === 4) return 'bg-white/8 text-white border-white/15';
  if (b === 5) return 'bg-violet-500/15 text-violet-200 border-violet-400/35';
  return 'bg-emerald-500/20 text-emerald-200 border-emerald-400/35';
}

function sarvaCellClassDark(s: number): string {
  if (s < 20) return 'bg-rose-500/25 text-rose-100 border-rose-400/45';
  if (s < 25) return 'bg-amber-500/20 text-amber-100 border-amber-400/40';
  if (s < 30) return 'bg-white/8 text-white border-white/15';
  if (s < 35) return 'bg-violet-500/18 text-violet-100 border-violet-400/40';
  return 'bg-emerald-500/25 text-emerald-100 border-emerald-400/45';
}

// Light-mode cell classes — solid, opaque, readable
function bhinnaCellClassLight(b: number): string {
  if (b <= 2) return 'bg-rose-100 text-rose-800 border-rose-300 font-semibold';
  if (b === 3) return 'bg-amber-100 text-amber-800 border-amber-300 font-semibold';
  if (b === 4) return 'bg-slate-100 text-slate-700 border-slate-300 font-semibold';
  if (b === 5) return 'bg-blue-100 text-blue-800 border-blue-300 font-semibold';
  return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold';
}

function sarvaCellClassLight(s: number): string {
  if (s < 20) return 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
  if (s < 25) return 'bg-amber-100 text-amber-800 border-amber-300 font-bold';
  if (s < 30) return 'bg-slate-100 text-slate-700 border-slate-300 font-bold';
  if (s < 35) return 'bg-blue-100 text-blue-800 border-blue-300 font-bold';
  return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold';
}

interface MiniGridProps {
  planet: Planet;
  row: number[];
  selfRashi: number;
  isLight: boolean;
}

const BhinnaMiniGrid: React.FC<MiniGridProps> = ({ planet, row, selfRashi, isLight }) => {
  const total = row.reduce((a, b) => a + b, 0);
  const selfBindus = row[selfRashi];
  const cellClass = isLight ? bhinnaCellClassLight : bhinnaCellClassDark;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl p-3"
      style={{
        background: isLight ? '#ffffff' : 'rgba(0,0,0,0.40)',
        border: isLight ? '1px solid #D1DCE5' : '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-base leading-none" style={{ color: ACCENT }}>{PLANET_GLYPH[planet]}</span>
          <span className="text-xs font-semibold" style={{ color: isLight ? '#0f172a' : '#ffffff' }}>
            {planet}
          </span>
        </div>
        <div className="text-[10px] font-mono" style={{ color: isLight ? '#334155' : 'rgba(255,255,255,0.70)' }}>
          Σ {total} · self{' '}
          <span style={{ color: isLight ? '#0f172a' : '#ffffff' }}>{selfBindus}</span>
        </div>
      </div>
      <div className="grid grid-cols-12 gap-[2px]">
        {row.map((b, idx) => (
          <div
            key={idx}
            title={`${RASHI_ENGLISH[idx]}: ${b} bindus (${bindusToLabel(b)})${idx === selfRashi ? ' — natal position' : ''}`}
            className={`aspect-square rounded-sm border text-[10px] font-mono leading-none flex items-center justify-center ${cellClass(b)} ${idx === selfRashi ? 'ring-1' : ''}`}
            style={idx === selfRashi ? { outline: `1.5px solid ${ACCENT}` } : undefined}
          >
            {b}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export const AshtakavargaGrid: React.FC<Props> = ({ birthData }) => {
  const isLight = useTheme();
  const { data, isLoading, error } = useQuery({
    queryKey: ['ashtakavarga', birthData],
    queryFn: () => getAshtakavarga(birthData),
    staleTime: Infinity,
  });

  const mutedClr  = isLight ? '#334155' : 'rgba(255,255,255,0.70)';
  const strongClr = isLight ? '#0f172a' : '#ffffff';
  const labelClr  = isLight ? '#475569' : 'rgba(255,255,255,0.55)';
  const sarvaCell = isLight ? sarvaCellClassLight : sarvaCellClassDark;

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm py-6 justify-center" style={{ color: mutedClr }}>
        <Loader2 className="w-4 h-4 animate-spin" /> Computing Ashtakavarga…
      </div>
    );
  }
  if (error || !data) {
    return <div className="text-rose-400 text-sm py-4">Failed to compute Ashtakavarga.</div>;
  }

  const sarvaTotal = data.sarva.reduce((a, b) => a + b, 0);

  return (
    <div className="glass-card rounded-2xl p-6 space-y-5">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(255,46,81,0.10)', border: '1px solid rgba(255,46,81,0.22)' }}>
          <Grid3x3 className="w-4 h-4" style={{ color: ACCENT }} />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold" style={{ color: isLight ? '#0f172a' : '#ffffff' }}>
            Ashtakavarga
          </h3>
          <p className="text-[11px]" style={{ color: mutedClr }}>
            Benefic-point grid (0–8 per planet, 0–56 sarva). Higher = stronger.
          </p>
        </div>
        <div className="text-[10px] font-mono text-right" style={{ color: mutedClr }}>
          Total bindus: <span style={{ color: strongClr }}>{sarvaTotal}</span>
          <span style={{ color: isLight ? '#64748b' : 'rgba(255,255,255,0.50)' }}> / 337</span>
        </div>
      </div>

      {/* Sarvashtakavarga */}
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: labelClr }}>
          Sarvashtakavarga (sum of 7)
        </div>
        <div className="grid grid-cols-12 gap-1">
          {data.sarva.map((s, idx) => (
            <div
              key={idx}
              title={`${RASHI_ENGLISH[idx]}: ${s} bindus (${sarvaToLabel(s)})`}
              className={`rounded border text-[11px] font-mono py-1.5 text-center ${sarvaCell(s)}`}
            >
              {s}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-12 gap-1 mt-1">
          {RASHI_ENGLISH.map((r, idx) => (
            <div key={idx} className="text-[9px] font-semibold text-center truncate" style={{ color: labelClr }} title={r}>
              {r.slice(0, 3)}
            </div>
          ))}
        </div>
      </div>

      {/* Bhinnashtakavargas */}
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: labelClr }}>
          Bhinnashtakavargas
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PLANETS.map(p => (
            <BhinnaMiniGrid
              key={p} planet={p}
              row={data.bhinna[p]}
              selfRashi={data.natalRashi[p]}
              isLight={isLight}
            />
          ))}
        </div>
      </div>

      <p className="text-[10px] font-medium leading-relaxed" style={{ color: labelClr }}>
        The highlighted cell in each planet's row marks its natal rashi (self-strength).
        Planets with 5+ bindus in their own rashi are strong; ≤3 bindus indicates weakness.
        Sarva ≥30 in a rashi marks a flourishing house.
      </p>
    </div>
  );
};
