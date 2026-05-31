import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Grid3x3, Loader2 } from 'lucide-react';
import { getAshtakavarga } from '../../services/api';
import type { BirthData } from '../../services/api';
import { PLANETS, bindusToLabel, sarvaToLabel, type Planet } from '../../lib/core/ashtakavarga';
import { RASHI_ENGLISH } from '../../lib/core/rashi';

interface Props {
  birthData: BirthData;
}

const PLANET_GLYPH: Record<Planet, string> = {
  Sun: '☉', Moon: '☽', Mars: '♂', Mercury: '☿',
  Jupiter: '♃', Venus: '♀', Saturn: '♄',
};

function bhinnaCellClass(b: number): string {
  if (b <= 2) return 'bg-rose-500/15 text-rose-300 border-rose-400/30';
  if (b === 3) return 'bg-amber-500/12 text-amber-300 border-amber-400/30';
  if (b === 4) return 'bg-white/5 text-white/70 border-white/10';
  if (b === 5) return 'bg-sky-500/12 text-sky-300 border-sky-400/30';
  return 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30';
}

function sarvaCellClass(s: number): string {
  if (s < 20) return 'bg-rose-500/20 text-rose-200 border-rose-400/40';
  if (s < 25) return 'bg-amber-500/15 text-amber-200 border-amber-400/35';
  if (s < 30) return 'bg-white/5 text-white/70 border-white/10';
  if (s < 35) return 'bg-sky-500/15 text-sky-200 border-sky-400/35';
  return 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40';
}

const BhinnaMiniGrid: React.FC<{ planet: Planet; row: number[]; selfRashi: number }> = ({ planet, row, selfRashi }) => {
  const total = row.reduce((a, b) => a + b, 0);
  const selfBindus = row[selfRashi];
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-white/8 bg-black/40 p-3"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-violet-300 text-base leading-none">{PLANET_GLYPH[planet]}</span>
          <span className="text-xs font-semibold text-white">{planet}</span>
        </div>
        <div className="text-[10px] font-mono text-white/40">
          Σ {total} · self <span className="text-white/80">{selfBindus}</span>
        </div>
      </div>
      <div className="grid grid-cols-12 gap-[2px]">
        {row.map((b, idx) => (
          <div
            key={idx}
            title={`${RASHI_ENGLISH[idx]}: ${b} bindus (${bindusToLabel(b)})${idx === selfRashi ? ' — natal position' : ''}`}
            className={`aspect-square rounded-sm border text-[10px] font-mono leading-none flex items-center justify-center ${bhinnaCellClass(b)} ${idx === selfRashi ? 'ring-1 ring-violet-300' : ''}`}
          >
            {b}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export const AshtakavargaGrid: React.FC<Props> = ({ birthData }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['ashtakavarga', birthData],
    queryFn: () => getAshtakavarga(birthData),
    staleTime: Infinity,
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-white/40 text-sm py-6 justify-center">
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
        <div className="w-8 h-8 rounded-lg bg-violet-400/10 border border-violet-400/20 flex items-center justify-center">
          <Grid3x3 className="w-4 h-4 text-violet-300" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-white">Ashtakavarga</h3>
          <p className="text-[11px] text-white/40">Benefic-point grid (0–8 per planet, 0–56 sarva). Higher = stronger.</p>
        </div>
        <div className="text-[10px] font-mono text-white/40 text-right">
          Total bindus: <span className="text-white/80">{sarvaTotal}</span>
          <span className="text-white/25"> / 337</span>
        </div>
      </div>

      {/* Sarvashtakavarga */}
      <div>
        <div className="text-[11px] uppercase tracking-wider text-white/30 mb-2">Sarvashtakavarga (sum of 7)</div>
        <div className="grid grid-cols-12 gap-1">
          {data.sarva.map((s, idx) => (
            <div
              key={idx}
              title={`${RASHI_ENGLISH[idx]}: ${s} bindus (${sarvaToLabel(s)})`}
              className={`rounded border text-[11px] font-mono py-1.5 text-center ${sarvaCellClass(s)}`}
            >
              {s}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-12 gap-1 mt-1">
          {RASHI_ENGLISH.map((r, idx) => (
            <div key={idx} className="text-[9px] text-white/30 text-center truncate" title={r}>
              {r.slice(0, 3)}
            </div>
          ))}
        </div>
      </div>

      {/* Bhinnashtakavargas */}
      <div>
        <div className="text-[11px] uppercase tracking-wider text-white/30 mb-2">Bhinnashtakavargas</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PLANETS.map(p => (
            <BhinnaMiniGrid key={p} planet={p} row={data.bhinna[p]} selfRashi={data.natalRashi[p]} />
          ))}
        </div>
      </div>

      <p className="text-[10px] text-white/30 leading-relaxed">
        The highlighted cell in each planet's row marks its natal rashi (self-strength).
        Planets with 5+ bindus in their own rashi are strong; ≤3 bindus indicates weakness.
        Sarva ≥30 in a rashi marks a flourishing house.
      </p>
    </div>
  );
};
