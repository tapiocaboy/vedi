import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Grid3x3, Loader2, Sparkles } from 'lucide-react';
import { getAshtakavarga } from '../../services/api';
import type { BirthData } from '../../services/api';
import { PLANETS, bindusToLabel, sarvaToLabel, type Planet } from '../../lib/core/ashtakavarga';
import { RASHI_ENGLISH } from '../../lib/core/rashi';
import { useTheme } from '../../hooks/useTheme';
import { useLang } from '../../i18n/LanguageContext';
import { labelPlanet, labelPlanetTheme, labelRashiWestern } from '../../i18n/astroLabels';
import type { TranslationKey } from '../../i18n/translations';

const ACCENT = 'var(--c-accent)';

interface Props {
  birthData: BirthData;
}

const PLANET_GLYPH: Record<Planet, string> = {
  Sun: '☉', Moon: '☽', Mars: '♂', Mercury: '☿',
  Jupiter: '♃', Venus: '♀', Saturn: '♄',
};

// Localized quality word for a bindu count (0–8).
const BINDU_LABEL_KEY: Record<ReturnType<typeof bindusToLabel>, TranslationKey> = {
  'weak': 'ashtakavarga.scale.weak',
  'below average': 'ashtakavarga.scale.belowAvg',
  'average': 'ashtakavarga.scale.average',
  'good': 'ashtakavarga.scale.good',
  'strong': 'ashtakavarga.scale.strong',
};

// Localized quality word for a sarva total (0–56).
const SARVA_LABEL_KEY: Record<ReturnType<typeof sarvaToLabel>, TranslationKey> = {
  'very weak': 'ashtakavarga.scale.veryWeak',
  'weak': 'ashtakavarga.scale.weak',
  'average': 'ashtakavarga.scale.average',
  'strong': 'ashtakavarga.scale.strong',
  'very strong': 'ashtakavarga.scale.veryStrong',
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
  lang: ReturnType<typeof useLang>['lang'];
  t: ReturnType<typeof useLang>['t'];
}

const BhinnaMiniGrid: React.FC<MiniGridProps> = ({ planet, row, selfRashi, isLight, lang, t }) => {
  const selfBindus = row[selfRashi];
  const cellClass = isLight ? bhinnaCellClassLight : bhinnaCellClassDark;
  const selfQuality = t(BINDU_LABEL_KEY[bindusToLabel(selfBindus)]);

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
      <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-base leading-none" style={{ color: ACCENT }}>{PLANET_GLYPH[planet]}</span>
          <span className="text-xs font-semibold" style={{ color: isLight ? '#0f172a' : '#ffffff' }}>
            {labelPlanet(planet, lang)}
          </span>
        </div>
        {/* Plain-language: how well the planet is supported where it was born */}
        <div
          className="text-[10px]"
          style={{ color: isLight ? '#334155' : 'rgba(255,255,255,0.70)' }}
          title={t('ashtakavarga.selfTip', { planet: labelPlanet(planet, lang) })}
        >
          {t('ashtakavarga.selfLine')}{' '}
          <span className="font-bold" style={{ color: isLight ? '#0f172a' : '#ffffff' }}>
            {selfBindus}/8 · {selfQuality}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-12 gap-[2px]">
        {row.map((b, idx) => (
          <div
            key={idx}
            title={`${labelRashiWestern(idx, lang, RASHI_ENGLISH[idx])}: ${b}/8 — ${t(BINDU_LABEL_KEY[bindusToLabel(b)])}${idx === selfRashi ? ` · ${t('ashtakavarga.natalHere')}` : ''}`}
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
  const { lang, t } = useLang();
  const { data, isLoading, error } = useQuery({
    queryKey: ['ashtakavarga', birthData],
    queryFn: () => getAshtakavarga(birthData),
    staleTime: Infinity,
  });

  const mutedClr  = isLight ? '#334155' : 'rgba(255,255,255,0.70)';
  const labelClr  = isLight ? '#475569' : 'rgba(255,255,255,0.55)';
  const bodyClr   = isLight ? '#374151' : 'rgba(255,255,255,0.72)';
  const sarvaCell = isLight ? sarvaCellClassLight : sarvaCellClassDark;
  const bhinnaCell = isLight ? bhinnaCellClassLight : bhinnaCellClassDark;

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm py-6 justify-center" style={{ color: mutedClr }}>
        <Loader2 className="w-4 h-4 animate-spin" /> {t('ashtakavarga.computing')}
      </div>
    );
  }
  if (error || !data) {
    return <div className="text-rose-400 text-sm py-4">{t('ashtakavarga.failed')}</div>;
  }

  // Plain-language highlights computed from the grid.
  const signName = (idx: number) => labelRashiWestern(idx, lang, RASHI_ENGLISH[idx]);
  const bestSign = data.sarva.indexOf(Math.max(...data.sarva));
  const worstSign = data.sarva.indexOf(Math.min(...data.sarva));
  const byStrength = [...PLANETS].sort((a, b) => data.selfStrength[b] - data.selfStrength[a]);
  const strongPlanet = byStrength[0];
  const weakPlanet = byStrength[byStrength.length - 1];

  const highlights: { text: string; tone: 'good' | 'bad' }[] = [
    { tone: 'good', text: t('ashtakavarga.plainBest', { sign: signName(bestSign), n: data.sarva[bestSign] }) },
    { tone: 'bad', text: t('ashtakavarga.plainWorst', { sign: signName(worstSign), n: data.sarva[worstSign] }) },
    { tone: 'good', text: t('ashtakavarga.plainPlanetStrong', { planet: labelPlanet(strongPlanet, lang), n: data.selfStrength[strongPlanet], theme: labelPlanetTheme(strongPlanet, lang) }) },
    { tone: 'bad', text: t('ashtakavarga.plainPlanetWeak', { planet: labelPlanet(weakPlanet, lang), n: data.selfStrength[weakPlanet], theme: labelPlanetTheme(weakPlanet, lang) }) },
  ];

  // Legend: sample bindu value per quality band, coloured like the cells.
  const legend: { sample: number; label: string; range: string }[] = [
    { sample: 1, label: t('ashtakavarga.scale.weak'), range: '0–2' },
    { sample: 3, label: t('ashtakavarga.scale.belowAvg'), range: '3' },
    { sample: 4, label: t('ashtakavarga.scale.average'), range: '4' },
    { sample: 5, label: t('ashtakavarga.scale.good'), range: '5' },
    { sample: 7, label: t('ashtakavarga.scale.strong'), range: '6–8' },
  ];

  return (
    <div className="glass-card rounded-2xl p-6 space-y-5">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(var(--c-accent-rgb),0.10)', border: '1px solid rgba(var(--c-accent-rgb),0.22)' }}>
          <Grid3x3 className="w-4 h-4" style={{ color: ACCENT }} />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold" style={{ color: isLight ? '#0f172a' : '#ffffff' }}>
            {t('ashtakavarga.title')}
          </h3>
          <p className="text-[11px]" style={{ color: mutedClr }}>
            {t('ashtakavarga.subtitle')}
          </p>
        </div>
      </div>

      {/* How to read this */}
      <p className="text-[12px] leading-relaxed" style={{ color: bodyClr }}>
        {t('ashtakavarga.howTo')}
      </p>

      {/* What this means for you — computed highlights */}
      <div className="rounded-xl p-4" style={{ background: 'rgba(var(--c-accent-rgb),0.05)', border: '1px solid rgba(var(--c-accent-rgb),0.2)' }}>
        <div className="flex items-center gap-1.5 mb-2">
          <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--c-accent-2)' }} />
          <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: labelClr }}>
            {t('ashtakavarga.plainTitle')}
          </span>
        </div>
        <ul className="space-y-1.5">
          {highlights.map((h, i) => (
            <li key={i} className="flex items-start gap-2 text-[12px] leading-relaxed" style={{ color: bodyClr }}>
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: h.tone === 'good' ? '#10b981' : '#f43f5e' }} />
              {h.text}
            </li>
          ))}
        </ul>
      </div>

      {/* Colour legend */}
      <div className="flex flex-wrap items-center gap-2">
        {legend.map(l => (
          <span key={l.range} className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] ${bhinnaCell(l.sample)}`}>
            <span className="font-mono">{l.range}</span> {l.label}
          </span>
        ))}
      </div>

      {/* Sarvashtakavarga */}
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: labelClr }}>
          {t('ashtakavarga.sarvaTitle')}
        </div>
        <div className="grid grid-cols-12 gap-1">
          {data.sarva.map((s, idx) => (
            <div
              key={idx}
              title={`${signName(idx)}: ${s}/56 — ${t(SARVA_LABEL_KEY[sarvaToLabel(s)])}`}
              className={`rounded border text-[11px] font-mono py-1.5 text-center ${sarvaCell(s)}`}
            >
              {s}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-12 gap-1 mt-1">
          {RASHI_ENGLISH.map((r, idx) => (
            <div key={idx} className="text-[9px] font-semibold text-center truncate" style={{ color: labelClr }} title={labelRashiWestern(idx, lang, r)}>
              {labelRashiWestern(idx, lang, r).slice(0, 3)}
            </div>
          ))}
        </div>
      </div>

      {/* Bhinnashtakavargas */}
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: labelClr }}>
          {t('ashtakavarga.bhinnaTitle')}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PLANETS.map(p => (
            <BhinnaMiniGrid
              key={p} planet={p}
              row={data.bhinna[p]}
              selfRashi={data.natalRashi[p]}
              isLight={isLight}
              lang={lang}
              t={t}
            />
          ))}
        </div>
      </div>

      <p className="text-[10px] font-medium leading-relaxed" style={{ color: labelClr }}>
        {t('ashtakavarga.footer')}
      </p>
    </div>
  );
};
