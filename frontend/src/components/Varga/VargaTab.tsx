import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Layers, Loader2, Heart, Briefcase, Sparkles, MousePointerClick, CheckCircle2, AlertTriangle, MinusCircle } from 'lucide-react';
import { getVargas } from '../../services/api';
import type { BirthData } from '../../services/api';
import type { VargaPlanet, VargaInsight } from '../../services/api';
import { RASHIS } from '../../lib/core/rashi';
import { RASHI_LORDS } from '../../lib/core/planetaryAnalysis';
import { EXTRA_VARGAS, type VargaCode } from '../../lib/core/vargas';
import { VARGA_PLAIN, VARGA_KARAKAS, vargaVerdict, type VargaStanding } from '../../lib/core/vargaMeanings';
import { useTheme } from '../../hooks/useTheme';
import { useLang } from '../../i18n/LanguageContext';
import { labelDignity, labelPlanet } from '../../i18n/astroLabels';
import { VargaHouseDetailPanel } from './VargaHouseDetailPanel';
import { ExtraVargaDetailPanel, type ExtraVargaSelection } from './ExtraVargaDetailPanel';
import type { VargaVariant } from '../../lib/core/vargaAnalysis';

const ACCENT = 'var(--c-accent)';

const GLYPH: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mars: '♂', Mercury: '☿', Jupiter: '♃',
  Venus: '♀', Saturn: '♄', Rahu: '☊', Ketu: '☋',
};

// Fixed South-Indian layout: rashi index per 4×4 grid cell (null = centre)
const SI_LAYOUT: (number | null)[] = [
  11, 0, 1, 2,
  10, null, null, 3,
  9, null, null, 4,
  8, 7, 6, 5,
];

const DIGNITY_STYLE: Record<string, { dark: string; light: string }> = {
  'exalted':      { dark: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30', light: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  'own-sign':     { dark: 'bg-violet-500/15 text-violet-300 border-violet-400/30',    light: 'bg-violet-100 text-violet-800 border-violet-300' },
  'friend-sign':  { dark: 'bg-blue-500/15 text-blue-300 border-blue-400/30',          light: 'bg-blue-100 text-blue-800 border-blue-300' },
  'neutral-sign': { dark: 'bg-white/8 text-white/60 border-white/15',                 light: 'bg-slate-100 text-slate-600 border-slate-300' },
  'enemy-sign':   { dark: 'bg-amber-500/15 text-amber-300 border-amber-400/30',       light: 'bg-amber-100 text-amber-800 border-amber-300' },
  'debilitated':  { dark: 'bg-rose-500/15 text-rose-300 border-rose-400/30',          light: 'bg-rose-100 text-rose-800 border-rose-300' },
};

const TONE_BORDER: Record<VargaInsight['tone'], string> = {
  positive: 'rgba(16,185,129,0.35)',
  neutral: 'rgba(148,163,184,0.30)',
  challenging: 'rgba(244,63,94,0.35)',
};

function DignityBadge({ dignity, isLight, lang }: { dignity: string; isLight: boolean; lang: ReturnType<typeof useLang>['lang'] }) {
  const s = DIGNITY_STYLE[dignity] ?? DIGNITY_STYLE['neutral-sign'];
  return (
    <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold border ${isLight ? s.light : s.dark}`}>
      {labelDignity(dignity, lang)}
    </span>
  );
}

function VargaGrid({
  title, subtitle, hint, ascRashi, planetsByRashi, isLight, onCellClick, ascMarker,
}: {
  title: string;
  subtitle: string;
  hint: string;
  ascRashi: number;
  planetsByRashi: Record<number, VargaPlanet[]>;
  isLight: boolean;
  onCellClick: (rashi: number) => void;
  ascMarker: string;
}) {
  return (
    <div className="rounded-xl p-3 sm:p-4" style={{
      background: isLight ? '#ffffff' : 'rgba(0,0,0,0.35)',
      border: isLight ? '1px solid #D1DCE5' : '1px solid rgba(255,255,255,0.08)',
    }}>
      <div className="mb-3">
        <h4 className={`text-sm font-bold ${isLight ? 'text-gray-800' : 'text-white'}`}>{title}</h4>
        <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-white/35'}`}>{subtitle}</p>
      </div>
      <div className="grid grid-cols-4 gap-1">
        {SI_LAYOUT.map((rashi, i) => {
          if (rashi === null) {
            // Render the 2×2 centre block once, from the first centre cell
            if (i === 5) {
              return (
                <div key={i} className="col-span-2 row-span-2 flex items-center justify-center">
                  <span className={`text-[10px] font-bold tracking-widest uppercase ${isLight ? 'text-slate-300' : 'text-white/15'}`}>
                    {title.split(' ')[0]}
                  </span>
                </div>
              );
            }
            return null;
          }
          const isAsc = rashi === ascRashi;
          const occupants = planetsByRashi[rashi] ?? [];
          return (
            <motion.button
              key={i}
              type="button"
              onClick={() => onCellClick(rashi)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="aspect-square rounded-md p-1 flex flex-col min-w-0 text-left cursor-pointer transition-colors"
              style={{
                border: isAsc ? `1.5px solid ${ACCENT}` : isLight ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.07)',
                background: isAsc
                  ? (isLight ? 'rgba(var(--c-accent-rgb),0.06)' : 'rgba(var(--c-accent-rgb),0.10)')
                  : 'transparent',
              }}
              onMouseEnter={e => {
                if (!isAsc) e.currentTarget.style.background = isLight ? 'rgba(var(--c-accent-rgb),0.04)' : 'rgba(255,255,255,0.05)';
                e.currentTarget.style.borderColor = ACCENT;
              }}
              onMouseLeave={e => {
                if (!isAsc) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = isLight ? '#E2E8F0' : 'rgba(255,255,255,0.07)';
                } else {
                  e.currentTarget.style.borderColor = ACCENT;
                }
              }}
            >
              <span className={`text-[8px] font-bold leading-none flex items-center justify-between gap-0.5 ${isLight ? 'text-slate-400' : 'text-white/30'}`}>
                <span className="truncate">
                  {RASHIS[rashi].slice(0, 3)}
                  {isAsc && <span style={{ color: ACCENT }}> ·{ascMarker}</span>}
                </span>
                {/* Persistent affordance: every box opens a reading */}
                <MousePointerClick className="w-2.5 h-2.5 shrink-0 opacity-45" style={{ color: ACCENT }} />
              </span>
              <div className="flex flex-wrap gap-x-1 items-start content-start flex-1 mt-0.5">
                {occupants.map(p => (
                  <span
                    key={p.planet}
                    className="text-[11px] sm:text-sm font-bold leading-tight"
                    style={{
                      color: isLight ? '#1e293b' : '#fff',
                      textShadow: isLight ? 'none' : '0 0 6px rgba(255,255,255,0.35)',
                    }}
                    title={p.planet}
                  >
                    {GLYPH[p.planet]}
                  </span>
                ))}
              </div>
            </motion.button>
          );
        })}
      </div>
      <p
        className="mt-2.5 flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-center text-[11px] font-bold tracking-wide"
        style={{
          color: ACCENT,
          background: 'rgba(var(--c-accent-rgb),0.07)',
          border: '1px solid rgba(var(--c-accent-rgb),0.18)',
        }}
      >
        <MousePointerClick className="w-3 h-3 shrink-0" />
        {hint}
      </p>
    </div>
  );
}

const STANDING_STYLE: Record<VargaStanding, { icon: React.ElementType; color: string; bg: string }> = {
  'strong':       { icon: CheckCircle2,  color: '#10b981', bg: 'rgba(16,185,129,0.10)' },
  'workable':     { icon: MinusCircle,   color: '#8b93a7', bg: 'rgba(148,163,184,0.10)' },
  'needs-effort': { icon: AlertTriangle, color: '#f43f5e', bg: 'rgba(244,63,94,0.10)' },
};

/** Plain-English verdict for a whole divisional chart. */
function VargaVerdictCard({
  code, planets, ascendant, isLight,
}: {
  code: VargaCode;
  planets: VargaPlanet[];
  ascendant: number;
  isLight: boolean;
}) {
  const { lang, t } = useLang();
  const plain = VARGA_PLAIN[code];
  const verdict = vargaVerdict(
    code,
    planets.map(p => ({
      planet: p.planet,
      dignity: p.divisions[code].dignity,
      house: ((p.divisions[code].rashi - ascendant + 12) % 12) + 1,
    })),
    RASHI_LORDS[ascendant],
  );
  const style = STANDING_STYLE[verdict.standing];
  const Icon = style.icon;

  return (
    <div className="rounded-xl p-3 sm:p-4 mb-4" style={{ background: style.bg, border: `1px solid ${style.color}40` }}>
      <div className="flex items-start gap-2.5">
        <Icon className="w-4 h-4 mt-0.5 shrink-0" style={{ color: style.color }} />
        <div className="min-w-0">
          <div className={`text-xs font-bold ${isLight ? 'text-gray-800' : 'text-white'}`}>{verdict.headline}</div>
          {plain && (
            <>
              <p className={`text-[11px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-white/40'}`}>{plain.question}</p>
              <p className={`text-[11px] mt-1 ${isLight ? 'text-slate-500' : 'text-white/40'}`}>{plain.intro}</p>
            </>
          )}
          <p className={`text-[11.5px] leading-relaxed mt-1.5 ${isLight ? 'text-slate-600' : 'text-white/60'}`}>
            {verdict.summary}
          </p>
          <ul className="mt-2 space-y-1">
            {verdict.reasons.map((r, i) => (
              <li key={i} className={`text-[11px] leading-relaxed flex items-start gap-1.5 ${isLight ? 'text-slate-500' : 'text-white/45'}`}>
                <span style={{ color: style.color }}>•</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>

          {/* The planet this chart is judged by — the first thing a reader
              should look for in the grid below. */}
          {(VARGA_KARAKAS[code] ?? []).length > 0 && (
            <p className={`text-[11px] mt-2 pt-2 border-t ${isLight ? 'text-slate-500 border-slate-200' : 'text-white/40 border-white/8'}`}>
              {t('varga.keyPlanet')}{' '}
              {(VARGA_KARAKAS[code] ?? []).map((k, i, arr) => (
                <React.Fragment key={k.planet}>
                  <strong className={isLight ? 'text-slate-700' : 'text-white/70'}>{labelPlanet(k.planet, lang)}</strong>
                  {` (${k.role})`}{i < arr.length - 1 ? ', ' : ''}
                </React.Fragment>
              ))}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function InsightCard({
  title, icon: Icon, color, insights, isLight,
}: {
  title: string;
  icon: React.ElementType;
  color: string;
  insights: VargaInsight[];
  isLight: boolean;
}) {
  return (
    <div className="glass-card rounded-2xl p-3 sm:p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: `${color}14`, border: `1px solid ${color}30` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        <h3 className={`text-sm font-bold ${isLight ? 'text-gray-800' : 'text-white'}`}>{title}</h3>
      </div>
      <div className="space-y-2.5">
        {insights.map((ins, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-xl p-3"
            style={{
              background: isLight ? '#ffffff' : 'rgba(0,0,0,0.30)',
              border: `1px solid ${TONE_BORDER[ins.tone]}`,
            }}
          >
            <div className={`text-xs font-bold mb-1 ${isLight ? 'text-gray-800' : 'text-white'}`}>{ins.title}</div>
            <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-white/55'}`}>{ins.text}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export const VargaTab: React.FC<{ birthData: BirthData }> = ({ birthData }) => {
  const isLight = useTheme();
  const { lang, t } = useLang();
  const [selected, setSelected] = useState<{ variant: VargaVariant; rashi: number } | null>(null);
  const [moreVarga, setMoreVarga] = useState<VargaCode>('D2');
  const [extraSel, setExtraSel] = useState<ExtraVargaSelection | null>(null);
  const { data, isLoading, isError } = useQuery({
    queryKey: ['vargas', birthData],
    queryFn: () => getVargas(birthData),
    staleTime: Infinity,
  });

  if (isLoading) {
    return (
      <div className="glass-card rounded-2xl p-10 text-center">
        <Loader2 className="w-6 h-6 mx-auto animate-spin mb-3" style={{ color: ACCENT }} />
        <span className={`font-mono text-sm ${isLight ? 'text-slate-400' : 'text-white/30'}`}>
          {t('varga.computing')}
        </span>
      </div>
    );
  }
  if (isError || !data) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center text-rose-400 text-sm">
        {t('varga.failed')}
      </div>
    );
  }

  const d9ByRashi: Record<number, VargaPlanet[]> = {};
  const d10ByRashi: Record<number, VargaPlanet[]> = {};
  for (const p of data.chart.planets) {
    (d9ByRashi[p.d9Rashi] ??= []).push(p);
    (d10ByRashi[p.d10Rashi] ??= []).push(p);
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="glass-card rounded-2xl p-3 sm:p-6">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(var(--c-accent-rgb),0.08)', border: '1px solid rgba(var(--c-accent-rgb),0.18)' }}>
            <Layers className="w-4 h-4" style={{ color: 'var(--c-accent-2)' }} />
          </div>
          <h3 className={`text-sm font-bold ${isLight ? 'text-gray-800' : 'text-white'}`}>{t('varga.title')}</h3>
        </div>
        <p className={`text-xs mb-5 ml-[2.625rem] ${isLight ? 'text-slate-500' : 'text-white/30'}`}>
          {t('varga.subtitle')}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <VargaGrid
            title={t('varga.d9Title')}
            subtitle={`${t('varga.lagna')}: ${data.d9AscendantName} — ${t('varga.d9Subtitle')}`}
            hint={t('varga.d9Hint')}
            ascRashi={data.chart.d9Ascendant}
            planetsByRashi={d9ByRashi}
            isLight={isLight}
            onCellClick={rashi => setSelected({ variant: 'D9', rashi })}
            ascMarker={t('varga.ascMarker')}
          />
          <VargaGrid
            title={t('varga.d10Title')}
            subtitle={`${t('varga.lagna')}: ${data.d10AscendantName} — ${t('varga.d10Subtitle')}`}
            hint={t('varga.d10Hint')}
            ascRashi={data.chart.d10Ascendant}
            planetsByRashi={d10ByRashi}
            isLight={isLight}
            onCellClick={rashi => setSelected({ variant: 'D10', rashi })}
            ascMarker={t('varga.ascMarker')}
          />
        </div>

        {/* Planet table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className={`text-left text-[10px] uppercase tracking-wider font-bold ${isLight ? 'text-slate-500' : 'text-white/35'}`}>
                <th className="px-2 py-2">{t('varga.colPlanet')}</th>
                <th className="px-2 py-2">{t('varga.colD1')}</th>
                <th className="px-2 py-2">{t('varga.colD9')}</th>
                <th className="px-2 py-2">{t('varga.colD10')}</th>
                <th className="px-2 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {data.chart.planets.map(p => (
                <tr key={p.planet} className={`border-t ${isLight ? 'border-slate-100' : 'border-white/5'}`}>
                  <td className="px-2 py-2">
                    <span className="font-bold mr-1.5" style={{ color: ACCENT }}>{GLYPH[p.planet]}</span>
                    <span className={`font-bold ${isLight ? 'text-gray-800' : 'text-white'}`}>
                      {labelPlanet(p.planet, lang)}{p.isRetrograde ? ' ℞' : ''}
                    </span>
                  </td>
                  <td className={`px-2 py-2 font-semibold ${isLight ? 'text-slate-600' : 'text-white/60'}`}>{p.d1RashiName}</td>
                  <td className="px-2 py-2">
                    <span className={`font-semibold mr-1.5 ${isLight ? 'text-slate-600' : 'text-white/60'}`}>{p.d9RashiName}</span>
                    <DignityBadge dignity={p.d9Dignity} isLight={isLight} lang={lang} />
                  </td>
                  <td className="px-2 py-2">
                    <span className={`font-semibold mr-1.5 ${isLight ? 'text-slate-600' : 'text-white/60'}`}>{p.d10RashiName}</span>
                    <DignityBadge dignity={p.d10Dignity} isLight={isLight} lang={lang} />
                  </td>
                  <td className="px-2 py-2">
                    {p.isVargottama && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold border"
                        style={{ color: ACCENT, borderColor: `rgba(var(--c-accent-rgb),0.31)`, background: `rgba(var(--c-accent-rgb),0.06)` }}>
                        <Sparkles className="w-2.5 h-2.5" /> {t('varga.vargottama')}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* More divisional charts (D2, D3, D4, D7, D12, D24, D30, D60) */}
      {(() => {
        const def = EXTRA_VARGAS.find(v => v.code === moreVarga) ?? EXTRA_VARGAS[0];
        const asc = data.chart.ascendants[def.code];
        const byRashi: Record<number, VargaPlanet[]> = {};
        for (const p of data.chart.planets) (byRashi[p.divisions[def.code].rashi] ??= []).push(p);
        return (
          <div className="glass-card rounded-2xl p-3 sm:p-6">
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(var(--c-accent-rgb),0.08)', border: '1px solid rgba(var(--c-accent-rgb),0.18)' }}>
                <Layers className="w-4 h-4" style={{ color: 'var(--c-accent-2)' }} />
              </div>
              <h3 className={`text-sm font-bold ${isLight ? 'text-gray-800' : 'text-white'}`}>{t('varga.moreTitle')}</h3>
            </div>
            <p className={`text-xs mb-3 ml-[2.625rem] ${isLight ? 'text-slate-500' : 'text-white/30'}`}>{t('varga.moreSubtitle')}</p>

            {/* What a divisional chart is, for a first-time reader */}
            <div className="rounded-xl p-3 mb-4"
              style={{ background: isLight ? '#f8fafc' : 'rgba(255,255,255,0.03)', border: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.06)' }}>
              <p className={`text-[11.5px] leading-relaxed ${isLight ? 'text-slate-600' : 'text-white/55'}`}>
                {t('varga.whatIsVarga')}
              </p>
            </div>

            {/* Chart selector chips — named in plain words, not just codes */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {EXTRA_VARGAS.map(v => {
                const active = v.code === moreVarga;
                const plainName = VARGA_PLAIN[v.code]?.plainName ?? v.significance;
                return (
                  <button
                    key={v.code}
                    onClick={() => setMoreVarga(v.code)}
                    title={VARGA_PLAIN[v.code]?.question ?? `${v.name} — ${v.significance}`}
                    className={`px-2.5 py-2 rounded-lg text-[11px] font-bold transition-colors border ${
                      active
                        ? 'text-white on-accent'
                        : isLight ? 'bg-white text-gray-600 border-gray-300 shadow-sm hover:bg-gray-50 hover:text-gray-900' : 'bg-white/10 text-white/75 border-white/15 hover:bg-white/20 hover:text-white'
                    }`}
                    style={active ? { backgroundColor: ACCENT, borderColor: ACCENT } : undefined}
                  >
                    <span className="opacity-70 mr-1">{v.code}</span>
                    {plainName.replace(/ chart$/, '')}
                  </button>
                );
              })}
            </div>

            {/* Plain-English verdict for the selected chart */}
            <VargaVerdictCard code={def.code} planets={data.chart.planets} ascendant={asc} isLight={isLight} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 items-start">
              <VargaGrid
                title={`${def.code} · ${VARGA_PLAIN[def.code]?.plainName ?? def.name}`}
                subtitle={`${t('varga.lagna')}: ${RASHIS[asc]} — ${def.significance}`}
                hint={t('varga.tapAnyBox')}
                ascRashi={asc}
                planetsByRashi={byRashi}
                isLight={isLight}
                onCellClick={rashi => setExtraSel({ code: def.code, name: def.name, significance: def.significance, rashi })}
                ascMarker={t('varga.ascMarker')}
              />

              {/* Compact placement table for the selected varga */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm">
                  <thead>
                    <tr className={`text-left text-[10px] uppercase tracking-wider font-bold ${isLight ? 'text-slate-500' : 'text-white/35'}`}>
                      <th className="px-2 py-2">{t('varga.colPlanet')}</th>
                      <th className="px-2 py-2">{def.code}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.chart.planets.map(p => {
                      const cell = p.divisions[def.code];
                      return (
                        <tr key={p.planet} className={`border-t ${isLight ? 'border-slate-100' : 'border-white/5'}`}>
                          <td className="px-2 py-2">
                            <span className="font-bold mr-1.5" style={{ color: ACCENT }}>{GLYPH[p.planet]}</span>
                            <span className={`font-bold ${isLight ? 'text-gray-800' : 'text-white'}`}>
                              {labelPlanet(p.planet, lang)}{p.isRetrograde ? ' ℞' : ''}
                            </span>
                          </td>
                          <td className="px-2 py-2">
                            <span className={`font-semibold mr-1.5 ${isLight ? 'text-slate-600' : 'text-white/60'}`}>{cell.rashiName}</span>
                            <DignityBadge dignity={cell.dignity} isLight={isLight} lang={lang} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <InsightCard title={t('varga.marriageTitle')} icon={Heart} color="#f472b6"
          insights={data.marriageInsights} isLight={isLight} />
        <InsightCard title={t('varga.careerTitle')} icon={Briefcase} color="#38bdf8"
          insights={data.careerInsights} isLight={isLight} />
      </div>

      {/* Slide-in specialised reading panel */}
      <VargaHouseDetailPanel
        variant={selected?.variant ?? 'D9'}
        rashiIndex={selected?.rashi ?? null}
        vargaAscendant={selected?.variant === 'D10' ? data.chart.d10Ascendant : data.chart.d9Ascendant}
        planets={data.chart.planets}
        onClose={() => setSelected(null)}
      />

      {/* Detail reading for the extra divisional charts (D2–D60) */}
      <ExtraVargaDetailPanel
        selection={extraSel}
        vargaAscendant={extraSel ? data.chart.ascendants[extraSel.code] : 0}
        planets={data.chart.planets}
        onClose={() => setExtraSel(null)}
      />
    </div>
  );
};
