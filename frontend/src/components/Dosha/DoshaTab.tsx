import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { ShieldAlert, ShieldCheck, Loader2, Activity, AlertTriangle, CheckCircle2, /* Sparkles, */ CircleDot, ChevronDown } from 'lucide-react';
import { getDoshas } from '../../services/api';
import type { BirthData, DoshaCheck, SadeSatiPeriod, SadeSatiPhase } from '../../services/api';
import { useTheme } from '../../hooks/useTheme';
import { useLang } from '../../i18n/LanguageContext';
import type { TranslationKey } from '../../i18n/translations';
import { labelPlanet, labelRashi } from '../../i18n/astroLabels';

const ACCENT = 'var(--c-accent)';

const DATE_LOCALE: Record<string, string> = {
  en: 'en-GB', si: 'si-LK', ta: 'ta-IN', zh: 'zh-CN', hi: 'hi-IN', ja: 'ja-JP', ko: 'ko-KR', ar: 'ar', ml: 'ml-IN',
};

function fmtMonthYear(iso: string, lang = 'en'): string {
  return new Date(iso).toLocaleDateString(DATE_LOCALE[lang] ?? 'en-GB', { month: 'short', year: 'numeric' });
}

const SEVERITY_CHIP: Record<string, string> = {
  none:     'text-emerald-300 bg-emerald-500/12 border-emerald-400/30',
  mild:     'text-amber-300 bg-amber-500/12 border-amber-400/30',
  moderate: 'text-rose-200 bg-rose-500/12 border-rose-400/30',
  strong:   'text-rose-300 bg-rose-500/15 border-rose-400/40',
};
const SEVERITY_KEY: Record<string, TranslationKey> = {
  none: 'dosha.severity.clear', mild: 'dosha.severity.mild', moderate: 'dosha.severity.moderate', strong: 'dosha.severity.strong',
};

const STATUS_CHIP: Record<SadeSatiPeriod['status'], string> = {
  past:     'text-white/45 bg-white/5 border-white/12',
  current:  'text-amber-200 bg-amber-500/15 border-amber-400/40',
  upcoming: 'text-violet-200 bg-violet-500/12 border-violet-400/30',
};
const STATUS_KEY: Record<SadeSatiPeriod['status'], TranslationKey> = {
  past: 'dosha.status.past', current: 'dosha.status.current', upcoming: 'dosha.status.upcoming',
};

/** Erashtaka grade → chip. Reuses the dosha severity palette, one notch up for severe. */
const LEVEL_CHIP: Record<string, string> = {
  mild:     SEVERITY_CHIP.mild.replace(/amber/g, 'emerald'),
  moderate: SEVERITY_CHIP.mild,
  strong:   SEVERITY_CHIP.moderate,
  severe:   SEVERITY_CHIP.strong,
};

function PhaseDetail({ ph, isLight }: { ph: SadeSatiPhase; isLight: boolean }) {
  const { t, lang } = useLang();
  const g = ph.grade;
  if (!g) return null;
  const muted = isLight ? 'text-slate-600' : 'text-white/60';
  const list = (items: string[], mark: string, cls: string) => (
    <ul className="space-y-0.5">
      {items.slice(0, 4).map((x, i) => (
        <li key={i} className={`text-[11px] leading-relaxed flex gap-1.5 ${muted}`}>
          <span className={`${cls} shrink-0`}>{mark}</span><span>{x}</span>
        </li>
      ))}
    </ul>
  );
  return (
    <div className="rounded-lg p-2.5 space-y-2"
      style={{ background: isLight ? '#f8fafc' : 'rgba(255,255,255,0.025)', border: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-center justify-between gap-2">
        <div className="text-[10px] font-bold" style={{ color: 'var(--c-accent-2)' }}>
          {PHASE_ORDER[ph.phase]} · {t(PHASE_KEY[ph.phase])} · {labelRashi(ph.sign, lang, ph.signName)}
        </div>
        <span className={`px-1.5 py-0.5 rounded border text-[10px] font-bold ${LEVEL_CHIP[g.level]}`}>
          {g.levelLabel} · {g.intensity.toFixed(1)}/10
        </span>
      </div>
      <p className={`text-[11px] leading-relaxed ${muted}`}>{g.summary}</p>
      {g.aggravating.length > 0 && (
        <div>
          <div className="text-[10px] uppercase tracking-wider text-rose-300/70 mb-0.5">{t('dosha.aggravates')}</div>
          {list(g.aggravating, '▲', 'text-rose-400')}
        </div>
      )}
      {g.mitigating.length > 0 && (
        <div>
          <div className="text-[10px] uppercase tracking-wider text-emerald-300/70 mb-0.5">{t('dosha.mitigates')}</div>
          {list(g.mitigating, '▼', 'text-emerald-400')}
        </div>
      )}
      {g.context.length > 0 && list(g.context, '•', isLight ? 'text-slate-400' : 'text-white/35')}
      {g.windows.length > 0 && (
        <div>
          <div className={`text-[10px] uppercase tracking-wider mb-1 ${isLight ? 'text-slate-400' : 'text-white/40'}`}>{t('dosha.windows')}</div>
          <div className="space-y-1">
            {g.windows.map((w, i) => (
              <div key={i} className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-[11px]">
                <span className={`font-mono text-[10px] ${isLight ? 'text-slate-400' : 'text-white/35'}`}>
                  {fmtMonthYear(w.start, lang)} – {fmtMonthYear(w.end, lang)}
                </span>
                <span className={`font-semibold ${isLight ? 'text-slate-700' : 'text-white/80'}`}>{labelPlanet(w.maha, lang)}–{labelPlanet(w.antar, lang)}</span>
                <span className={`px-1.5 rounded border text-[10px] font-bold ${LEVEL_CHIP[w.level]}`}>
                  {w.verdictLabel} · {w.intensity.toFixed(1)}
                </span>
                {w.drivers.length > 0 && <span className={`basis-full text-[10.5px] ${muted}`}>{w.drivers.join(' ')}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const PHASE_KEY: Record<string, TranslationKey> = { rising: 'dosha.phase.rising', peak: 'dosha.phase.peak', setting: 'dosha.phase.setting' };
const PHASE_ORDER: Record<string, string> = { rising: '1', peak: '2', setting: '3' };
const PHASE_HOUSE: Record<string, TranslationKey> = { rising: 'dosha.house.rising', peak: 'dosha.house.peak', setting: 'dosha.house.setting' };

function DoshaCard({ d, isLight }: { d: DoshaCheck; isLight: boolean }) {
  const { t } = useLang();
  const chip = SEVERITY_CHIP[d.severity] ?? SEVERITY_CHIP.none;
  const sevLabel = t(SEVERITY_KEY[d.severity] ?? SEVERITY_KEY.none);
  const Icon = d.present ? ShieldAlert : ShieldCheck;
  const iconColor = d.present ? '#fb7185' : '#34d399';
  return (
    <div className="glass-card rounded-2xl p-4 sm:p-5">
      <div className="flex items-start gap-3 mb-2">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `${iconColor}14`, border: `1px solid ${iconColor}33` }}>
          <Icon className="w-4.5 h-4.5" style={{ color: iconColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className={`text-sm font-bold ${isLight ? 'text-gray-800' : 'text-white'}`}>{d.name}</h3>
            <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold shrink-0 ${chip}`}>
              {d.present ? sevLabel : t('dosha.severity.clear')}
            </span>
          </div>
          <p className={`text-xs leading-relaxed mt-1 ${isLight ? 'text-slate-600' : 'text-white/65'}`}>{d.summary}</p>
        </div>
      </div>

      {d.factors.length > 0 && (
        <div className="mt-3 pl-12">
          <div className="text-[10px] uppercase tracking-wider text-rose-300/70 mb-1.5 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> {t('dosha.whyFlagged')}
          </div>
          <ul className="space-y-1">
            {d.factors.map((f, i) => (
              <li key={i} className={`text-[11.5px] leading-relaxed flex gap-1.5 ${isLight ? 'text-slate-600' : 'text-white/60'}`}>
                <span className="text-rose-400 shrink-0">•</span><span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {d.cancellations.length > 0 && (
        <div className="mt-3 pl-12">
          <div className="text-[10px] uppercase tracking-wider text-emerald-300/70 mb-1.5 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> {t('dosha.cancellationBhanga')}
          </div>
          <ul className="space-y-1">
            {d.cancellations.map((c, i) => (
              <li key={i} className={`text-[11.5px] leading-relaxed flex gap-1.5 ${isLight ? 'text-slate-600' : 'text-white/60'}`}>
                <span className="text-emerald-400 shrink-0">✓</span><span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Remedy — hidden for now, kept for when they come back
      <div className="mt-3 pl-12">
        <div className="text-[10px] uppercase tracking-wider text-violet-300/70 mb-1 flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> Remedy
        </div>
        <p className={`text-[11.5px] leading-relaxed ${isLight ? 'text-slate-600' : 'text-white/55'}`}>{d.remedy}</p>
      </div>
      */}
    </div>
  );
}

export const DoshaTab: React.FC<{ birthData: BirthData }> = ({ birthData }) => {
  const isLight = useTheme();
  const { lang, t } = useLang();
  // Expanded cycle: defaults to the running one, else the next upcoming.
  const [openIdx, setOpenIdx] = useState<number | null | undefined>(undefined);
  const { data, isLoading, isError } = useQuery({
    queryKey: ['doshas', birthData, lang],
    queryFn: () => getDoshas(birthData, lang),
    staleTime: Infinity,
  });

  if (isLoading) {
    return (
      <div className="glass-card rounded-2xl p-10 text-center">
        <Loader2 className="w-6 h-6 mx-auto animate-spin mb-3" style={{ color: ACCENT }} />
        <span className={`font-mono text-sm ${isLight ? 'text-slate-400' : 'text-white/30'}`}>{t('dosha.computing')}</span>
      </div>
    );
  }
  if (isError || !data) {
    return <div className="glass-card rounded-2xl p-8 text-center text-rose-400 text-sm">{t('dosha.failed')}</div>;
  }

  const ss = data.sadeSati;
  const defaultOpen = (() => {
    const cur = ss.periods.findIndex(p => p.status === 'current');
    return cur >= 0 ? cur : ss.periods.findIndex(p => p.status === 'upcoming');
  })();
  const expanded = openIdx === undefined ? defaultOpen : openIdx;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="glass-card rounded-2xl p-3 sm:p-6">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(var(--c-accent-rgb),0.08)', border: '1px solid rgba(var(--c-accent-rgb),0.18)' }}>
            <ShieldAlert className="w-4 h-4" style={{ color: 'var(--c-accent-2)' }} />
          </div>
          <h3 className={`text-sm font-bold ${isLight ? 'text-gray-800' : 'text-white'}`}>{t('dosha.title')}</h3>
        </div>
        <p className={`text-xs ml-[2.625rem] ${isLight ? 'text-slate-500' : 'text-white/30'}`}>{t('dosha.subtitle')}</p>
      </div>

      {/* Dosha cards */}
      <div className="grid grid-cols-1 gap-4">
        {data.doshas.map(d => <DoshaCard key={d.key} d={d} isLight={isLight} />)}
      </div>

      {/* Sade Sati timeline */}
      <div className="glass-card rounded-2xl p-4 sm:p-5">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(var(--c-accent-rgb),0.08)', border: '1px solid rgba(var(--c-accent-rgb),0.18)' }}>
            <Activity className="w-4 h-4" style={{ color: 'var(--c-accent-2)' }} />
          </div>
          <div className="flex-1">
            <h3 className={`text-sm font-bold ${isLight ? 'text-gray-800' : 'text-white'}`}>{t('dosha.sadeSatiTitle')}</h3>
            <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-white/40'}`}>
              {t('dosha.natalMoon')}: {labelRashi(ss.natalMoonSign, lang, ss.natalMoonSignName)} · {ss.periods.length} {t('dosha.cycles')}
            </p>
          </div>
          {ss.currentlyActive && (
            <span className="px-2.5 py-1 rounded-md border text-[10px] font-bold text-amber-200 bg-amber-500/15 border-amber-400/40">
              {t('dosha.activeNow')}
            </span>
          )}
        </div>

        <div className="space-y-2.5 mt-4">
          {ss.periods.map((p, i) => {
            const stChip = STATUS_CHIP[p.status];
            const stLabel = t(STATUS_KEY[p.status]);
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="rounded-xl border p-3"
                style={{
                  background: isLight ? '#ffffff' : 'rgba(0,0,0,0.30)',
                  borderColor: p.status === 'current' ? 'rgba(251,191,36,0.4)' : isLight ? '#E2E8F0' : 'rgba(255,255,255,0.08)',
                }}
              >
                <button type="button" onClick={() => setOpenIdx(expanded === i ? null : i)}
                  className="w-full flex items-center justify-between gap-2 mb-2 text-left">
                  <div className={`text-xs font-bold ${isLight ? 'text-gray-800' : 'text-white'}`}>
                    {fmtMonthYear(p.start, lang)} – {fmtMonthYear(p.end, lang)}
                    {p.cycle && <span className={`ml-2 font-normal text-[10px] ${isLight ? 'text-slate-400' : 'text-white/40'}`}>{t('dosha.cycle')} {p.cycle}</span>}
                  </div>
                  <span className="flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold ${stChip}`}>{stLabel}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded === i ? 'rotate-180' : ''} ${isLight ? 'text-slate-400' : 'text-white/40'}`} />
                  </span>
                </button>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                  {p.phases.map((ph, j) => (
                    <div key={j} className="rounded-lg px-2.5 py-1.5"
                      style={{ background: isLight ? '#f1f5f9' : 'rgba(255,255,255,0.04)', border: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="flex items-center gap-1 text-[10px] font-bold" style={{ color: 'var(--c-accent-2)' }}>
                        <CircleDot className="w-2.5 h-2.5" /> {PHASE_ORDER[ph.phase]} · {t(PHASE_KEY[ph.phase])} {t(PHASE_HOUSE[ph.phase])}
                      </div>
                      <div className={`text-[11px] font-semibold mt-0.5 ${isLight ? 'text-slate-700' : 'text-white/75'}`}>{labelRashi(ph.sign, lang, ph.signName)}</div>
                      <div className={`text-[10px] font-mono ${isLight ? 'text-slate-400' : 'text-white/35'}`}>
                        {fmtMonthYear(ph.start, lang)} – {fmtMonthYear(ph.end, lang)}
                      </div>
                      {ph.grade && (
                        <span className={`inline-block mt-1 px-1.5 rounded border text-[10px] font-bold ${LEVEL_CHIP[ph.grade.level]}`}>
                          {ph.grade.levelLabel}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                {expanded === i && (
                  <div className="mt-2.5 space-y-2">
                    {p.phases.map((ph, j) => <PhaseDetail key={j} ph={ph} isLight={isLight} />)}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
        <p className={`mt-3 text-[10px] ${isLight ? 'text-slate-400' : 'text-white/25'}`}>{t('dosha.sadeSatiNote')}</p>
      </div>
    </div>
  );
};
