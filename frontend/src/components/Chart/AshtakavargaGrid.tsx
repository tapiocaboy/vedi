import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Grid3x3, Loader2, Vote, Clock, ChevronDown } from 'lucide-react';
import { getAshtakavarga } from '../../services/api';
import type { BirthData } from '../../services/api';
import { PLANETS, bindusToLabel, sarvaToLabel, type Planet } from '../../lib/core/ashtakavarga';
import { RASHI_ENGLISH } from '../../lib/core/rashi';
import { useTheme } from '../../hooks/useTheme';
import { useLang } from '../../i18n/LanguageContext';
import { labelPlanet, labelPlanetTheme, labelRashiWestern, labelHouseTheme, labelHouseCovers } from '../../i18n/astroLabels';
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

// ─── Plain-language layer ──────────────────────────────────────────────────
// A sign's total (0–56, typically 18–40) read as how easily that life area
// comes. Colours avoid orange so the light theme stays on-brand.
type Band = 'veryStrong' | 'strong' | 'average' | 'weak' | 'veryWeak';
const BAND_OF: Record<ReturnType<typeof sarvaToLabel>, Band> = {
  'very strong': 'veryStrong', 'strong': 'strong', 'average': 'average', 'weak': 'weak', 'very weak': 'veryWeak',
};
const BAND_HEX: Record<Band, string> = {
  veryStrong: '#059669', strong: '#10b981', average: '#64748b', weak: '#fb7185', veryWeak: '#e11d48',
};
/** Scale for the life-area bars: 45 fills the track, 28 is the classical average. */
const BAR_MAX = 45;
const AVERAGE = 28;

/** A planet's own votes (0–8) in its birth sign → 0…4 backing level. */
const backingLevel = (b: number) => (b <= 2 ? 0 : b === 3 ? 1 : b === 4 ? 2 : b === 5 ? 3 : 4);
const BACKING_HEX = ['#e11d48', '#fb7185', '#64748b', '#10b981', '#059669'];

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
  const [showGrid, setShowGrid] = useState(false);
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

  const signName = (idx: number) => labelRashiWestern(idx, lang, RASHI_ENGLISH[idx]);

  // Each sign's score belongs to the life area (house) it falls in from the Lagna.
  const areas = Array.from({ length: 12 }, (_, i) => {
    const house = i + 1;
    const rashi = (data.lagnaRashi + i) % 12;
    const score = data.sarva[rashi];
    return { house, rashi, score, band: BAND_OF[sarvaToLabel(score)] };
  });
  const ranked = [...areas].sort((x, y) => y.score - x.score);
  const areaName = (h: number) => labelHouseTheme(h, lang);
  // Only name areas whose own label agrees (Easy / Needs effort); fall back to
  // the single extreme so the line is never empty or contradicts the bars.
  const strongOnes = ranked.filter(a => a.band === 'veryStrong' || a.band === 'strong').slice(0, 3);
  const weakOnes = [...ranked].reverse().filter(a => a.band === 'veryWeak' || a.band === 'weak').slice(0, 3);
  const easiest = (strongOnes.length ? strongOnes : ranked.slice(0, 1)).map(a => areaName(a.house)).join(', ');
  const hardest = (weakOnes.length ? weakOnes : ranked.slice(-1)).map(a => areaName(a.house)).join(', ');

  // Legend for the detailed grid: sample bindu value per quality band.
  const legend: { sample: number; label: string; range: string }[] = [
    { sample: 1, label: t('ashtakavarga.scale.weak'), range: '0–2' },
    { sample: 3, label: t('ashtakavarga.scale.belowAvg'), range: '3' },
    { sample: 4, label: t('ashtakavarga.scale.average'), range: '4' },
    { sample: 5, label: t('ashtakavarga.scale.good'), range: '5' },
    { sample: 7, label: t('ashtakavarga.scale.strong'), range: '6–8' },
  ];

  const panel = { background: isLight ? '#ffffff' : 'rgba(255,255,255,0.03)', border: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.08)' };
  const strongClr = isLight ? '#0f172a' : '#ffffff';
  const track = isLight ? 'rgba(15,23,42,0.06)' : 'rgba(255,255,255,0.07)';

  return (
    <div className="glass-card rounded-2xl p-6 space-y-5">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(var(--c-accent-rgb),0.10)', border: '1px solid rgba(var(--c-accent-rgb),0.22)' }}>
          <Grid3x3 className="w-4 h-4" style={{ color: ACCENT }} />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold" style={{ color: strongClr }}>{t('ashtakavarga.simpleTitle')}</h3>
          <p className="text-[11px]" style={{ color: mutedClr }}>{t('ashtakavarga.simpleSub')}</p>
        </div>
      </div>

      {/* The idea, in one analogy */}
      <div className="flex gap-3 rounded-xl p-4" style={{ background: 'rgba(var(--c-accent-rgb),0.05)', border: '1px solid rgba(var(--c-accent-rgb),0.2)' }}>
        <Vote className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--c-accent-2)' }} />
        <p className="text-[12.5px] leading-relaxed" style={{ color: bodyClr }}>{t('ashtakavarga.analogy')}</p>
      </div>

      {/* Life areas */}
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: labelClr }}>{t('ashtakavarga.areasTitle')}</div>
        <p className="text-[11px] mt-0.5 mb-3" style={{ color: mutedClr }}>{t('ashtakavarga.areasSub')}</p>
        <div className="grid sm:grid-cols-2 gap-2 mb-3">
          <div className="rounded-lg px-3 py-2 text-[12px]" style={{ ...panel, color: bodyClr }}>
            <span className="inline-block w-2 h-2 rounded-full mr-2 align-middle" style={{ background: BAND_HEX.veryStrong }} />
            {t('ashtakavarga.easiest', { list: easiest })}
          </div>
          <div className="rounded-lg px-3 py-2 text-[12px]" style={{ ...panel, color: bodyClr }}>
            <span className="inline-block w-2 h-2 rounded-full mr-2 align-middle" style={{ background: BAND_HEX.veryWeak }} />
            {t('ashtakavarga.hardest', { list: hardest })}
          </div>
        </div>
        <div className="space-y-1.5">
          {areas.map(a => {
            const hex = BAND_HEX[a.band];
            return (
              <div key={a.house} className="grid grid-cols-[minmax(0,10rem)_1fr_auto] sm:grid-cols-[minmax(0,15rem)_1fr_auto] items-center gap-3 rounded-lg px-3 py-2" style={panel}
                title={`${t('ashtakavarga.houseNo', { n: a.house })} · ${signName(a.rashi)} · ${a.score}/56`}>
                <div className="min-w-0">
                  <div className="text-[12px] font-semibold truncate" style={{ color: strongClr }}>{areaName(a.house)}</div>
                  <div className="text-[10.5px] truncate" style={{ color: mutedClr }}>{labelHouseCovers(a.house, lang)}</div>
                </div>
                <div className="relative h-2.5 rounded-full" style={{ background: track }}>
                  <motion.div className="absolute inset-y-0 left-0 rounded-full" style={{ background: hex }}
                    initial={{ width: 0 }} animate={{ width: `${Math.min(1, a.score / BAR_MAX) * 100}%` }} transition={{ duration: 0.6 }} />
                  <span className="absolute -top-1 -bottom-1 border-l border-dashed" style={{ left: `${(AVERAGE / BAR_MAX) * 100}%`, borderColor: mutedClr }} />
                </div>
                <div className="text-right w-24">
                  <div className="text-[11px] font-semibold" style={{ color: hex }}>{t(`ashtakavarga.band.${a.band}` as TranslationKey)}</div>
                  <div className="text-[10px] font-mono" style={{ color: mutedClr }}>{t('ashtakavarga.points', { n: a.score })}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Planet backing */}
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: labelClr }}>{t('ashtakavarga.planetsTitle')}</div>
        <p className="text-[11px] mt-0.5 mb-3" style={{ color: mutedClr }}>{t('ashtakavarga.planetsSub')}</p>
        <div className="grid sm:grid-cols-2 gap-2">
          {[...PLANETS].sort((x, y) => data.selfStrength[y] - data.selfStrength[x]).map(p => {
            const b = data.selfStrength[p];
            const lvl = backingLevel(b);
            return (
              <div key={p} className="flex items-center gap-3 rounded-lg px-3 py-2" style={panel}>
                <span className="text-lg leading-none w-5 text-center" style={{ color: ACCENT }}>{PLANET_GLYPH[p]}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-[12px] font-semibold" style={{ color: strongClr }}>{labelPlanet(p, lang)}</div>
                  <div className="text-[10.5px] truncate" style={{ color: mutedClr }}>{labelPlanetTheme(p, lang)}</div>
                </div>
                <div className="text-right">
                  <div className="flex gap-[3px] justify-end" aria-label={`${b}/8`}>
                    {Array.from({ length: 8 }, (_, i) => (
                      <span key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: i < b ? BACKING_HEX[lvl] : track }} />
                    ))}
                  </div>
                  <div className="text-[10.5px] font-semibold mt-1" style={{ color: BACKING_HEX[lvl] }}>{t(`ashtakavarga.backing.${lvl}` as TranslationKey)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Timing */}
      <div className="flex gap-3 rounded-xl p-4" style={panel}>
        <Clock className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--c-accent-2)' }} />
        <div>
          <div className="text-[12px] font-semibold mb-0.5" style={{ color: strongClr }}>{t('ashtakavarga.timingTitle')}</div>
          <p className="text-[12px] leading-relaxed" style={{ color: bodyClr }}>{t('ashtakavarga.timingText')}</p>
        </div>
      </div>

      {/* Technical detail, collapsed */}
      <button type="button" onClick={() => setShowGrid(v => !v)}
        className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-[12px] font-semibold"
        style={{ ...panel, color: labelClr }}>
        {showGrid ? t('ashtakavarga.hideGrid') : t('ashtakavarga.showGrid')}
        <ChevronDown className={`w-4 h-4 transition-transform ${showGrid ? 'rotate-180' : ''}`} />
      </button>

      {showGrid && (
      <div className="space-y-5">
      <p className="text-[11.5px] leading-relaxed" style={{ color: bodyClr }}>{t('ashtakavarga.gridIntro')}</p>

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
      )}
    </div>
  );
};
