import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { ShieldAlert, ShieldCheck, Loader2, Activity, AlertTriangle, CheckCircle2, ChevronDown } from 'lucide-react';
import { getDoshas } from '../../services/api';
import type { BirthData, DoshaCheck, SadeSatiPeriod, SadeSatiPhase } from '../../services/api';
import { useTheme } from '../../hooks/useTheme';
import { useLang } from '../../i18n/LanguageContext';
import type { TranslationKey } from '../../i18n/translations';
import { labelPlanet, labelRashi } from '../../i18n/astroLabels';
import { TapHint, tapVars } from '../shared/tapTarget';

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
const SEVERITY_RANK: Record<string, number> = { strong: 0, moderate: 1, mild: 2, none: 3 };

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
const LEVEL_BAR: Record<string, string> = {
  mild: '#34d399', moderate: '#fbbf24', strong: '#fb7185', severe: '#e11d48',
};

const PHASE_KEY: Record<string, TranslationKey> = { rising: 'dosha.phase.rising', peak: 'dosha.phase.peak', setting: 'dosha.phase.setting' };
const PHASE_ORDER: Record<string, string> = { rising: '1', peak: '2', setting: '3' };
const PHASE_HOUSE: Record<string, TranslationKey> = { rising: 'dosha.house.rising', peak: 'dosha.house.peak', setting: 'dosha.house.setting' };

type SaturnFilter = SadeSatiPeriod['status'];

function toneFor(d: DoshaCheck): string {
  if (!d.present || d.severity === 'none') return '#34d399';
  if (d.severity === 'mild') return '#fbbf24';
  return '#fb7185';
}

function phaseNow(period: SadeSatiPeriod, now = Date.now()): SadeSatiPhase | undefined {
  return period.phases.find(ph => Date.parse(ph.start) <= now && now <= Date.parse(ph.end));
}

/** Retrograde loops split one transit into a few months. The real cycle runs for years. */
function isFullCycle(period: SadeSatiPeriod): boolean {
  return Date.parse(period.end) - Date.parse(period.start) > 2 * 365.25 * 86_400_000;
}

function PhaseDetail({ ph, isLight }: { ph: SadeSatiPhase; isLight: boolean }) {
  const { t, lang } = useLang();
  const [showAll, setShowAll] = useState(false);
  const g = ph.grade;
  if (!g) return null;
  const muted = isLight ? 'text-slate-600' : 'text-white/60';
  const windows = showAll ? g.windows : g.windows.slice(0, 4);
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
    <div className="inset-surface rounded-lg border p-3 space-y-2.5">
      <div>
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className={`text-[10px] font-bold ${isLight ? 'text-slate-500' : 'text-white/45'}`}>
            {g.intensity.toFixed(1)}/10
          </span>
          <span className={`px-1.5 py-0.5 rounded border text-[10px] font-bold ${LEVEL_CHIP[g.level]}`}>
            {g.levelLabel}
          </span>
        </div>
        <div className="h-1 rounded-full overflow-hidden" style={{ background: isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.08)' }}>
          <div className="h-full rounded-full" style={{ width: `${Math.min(100, g.intensity * 10)}%`, background: LEVEL_BAR[g.level] ?? ACCENT }} />
        </div>
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
          <div className="space-y-1.5">
            {windows.map((w, i) => (
              <div key={i} className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-[11px]">
                <span className={`font-mono text-[10px] ${isLight ? 'text-slate-400' : 'text-white/35'}`}>
                  {fmtMonthYear(w.start, lang)} – {fmtMonthYear(w.end, lang)}
                </span>
                <span className={`font-semibold ${isLight ? 'text-slate-700' : 'text-white/80'}`}>{labelPlanet(w.maha, lang)}–{labelPlanet(w.antar, lang)}</span>
                <span className={`px-1.5 rounded border text-[10px] font-bold ${LEVEL_CHIP[w.level]}`}>
                  {w.verdictLabel} · {w.intensity.toFixed(1)}
                </span>
                {w.drivers.length > 0 && <span className={`basis-full text-[11px] ${muted}`}>{w.drivers.join(' ')}</span>}
              </div>
            ))}
          </div>
          {g.windows.length > 4 && (
            <button
              type="button"
              onClick={() => setShowAll(v => !v)}
              className="mt-1.5 text-[11px] font-semibold"
              style={{ color: ACCENT }}
            >
              {showAll ? t('common.hide') : `${t('common.show')} (${g.windows.length})`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function DoshaCard({
  d, isLight, open, onToggle,
}: {
  d: DoshaCheck;
  isLight: boolean;
  open: boolean;
  onToggle: () => void;
}) {
  const { t } = useLang();
  const chip = SEVERITY_CHIP[d.present ? d.severity : 'none'] ?? SEVERITY_CHIP.none;
  const sevLabel = d.present ? t(SEVERITY_KEY[d.severity] ?? SEVERITY_KEY.none) : t('dosha.severity.clear');
  const Icon = d.present ? ShieldAlert : ShieldCheck;
  const tone = toneFor(d);
  const hasDetail = d.factors.length > 0 || d.cancellations.length > 0;
  const headerClass = `w-full text-left p-4 sm:p-5 ${hasDetail ? 'tap-row tap-blink' : ''}`;
  const header = (
    <>
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: `${tone}18`, border: `1px solid ${tone}44` }}>
            <Icon className="w-4 h-4" style={{ color: tone }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className={`text-sm font-bold leading-snug ${isLight ? 'text-gray-800' : 'text-white'}`}>{d.name}</h3>
              <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold shrink-0 ${chip}`}>{sevLabel}</span>
            </div>
            <p className={`text-xs leading-relaxed mt-1 ${isLight ? 'text-slate-600' : 'text-white/65'}`}>{d.summary}</p>
          </div>
          {hasDetail && (
            <ChevronDown className={`w-4 h-4 shrink-0 mt-1 transition-transform ${open ? 'rotate-180' : ''} ${isLight ? 'text-slate-500' : 'text-white/50'}`} />
          )}
        </div>
    </>
  );
  return (
    <div id={`dosha-${d.key}`} className="glass-card rounded-2xl overflow-hidden scroll-mt-28">
      {hasDetail ? (
        <button type="button" onClick={onToggle} aria-expanded={open} className={headerClass} style={tapVars(tone)}>
          {header}
        </button>
      ) : (
        <div className={headerClass}>{header}</div>
      )}

      {open && hasDetail && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
          className="px-4 sm:px-5 pb-4 sm:pb-5 space-y-3"
        >
          {d.factors.length > 0 && (
            <div>
              <div className="text-[10px] uppercase tracking-wider text-rose-300/70 mb-1.5 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {t('dosha.whyFlagged')}
              </div>
              <ul className="space-y-1">
                {d.factors.map((f, i) => (
                  <li key={i} className={`text-[12px] leading-relaxed flex gap-1.5 ${isLight ? 'text-slate-600' : 'text-white/65'}`}>
                    <span className="text-rose-400 shrink-0">•</span><span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {d.cancellations.length > 0 && (
            <div>
              <div className="text-[10px] uppercase tracking-wider text-emerald-300/70 mb-1.5 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> {t('dosha.cancellationBhanga')}
              </div>
              <ul className="space-y-1">
                {d.cancellations.map((c, i) => (
                  <li key={i} className={`text-[12px] leading-relaxed flex gap-1.5 ${isLight ? 'text-slate-600' : 'text-white/65'}`}>
                    <span className="text-emerald-400 shrink-0">✓</span><span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

export const DoshaTab: React.FC<{ birthData: BirthData }> = ({ birthData }) => {
  const isLight = useTheme();
  const { lang, t } = useLang();
  // undefined = follow the default (strongest active dosha, the live Saturn cycle).
  const [openDosha, setOpenDosha] = useState<string | null | undefined>(undefined);
  const [filter, setFilter] = useState<SaturnFilter | null>(null);
  const [cycleOverride, setCycleOverride] = useState<string | null | undefined>(undefined);
  const [phaseOverride, setPhaseOverride] = useState<string | null | undefined>(undefined);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['doshas', birthData, lang],
    queryFn: () => getDoshas(birthData, lang),
    staleTime: Infinity,
  });

  if (isLoading) {
    return (
      <div className="glass-card rounded-2xl p-10 text-center">
        <Loader2 className="w-6 h-6 mx-auto animate-spin mb-3" style={{ color: ACCENT }} />
        <span className={`font-mono text-sm ${isLight ? 'text-slate-400' : 'text-white/40'}`}>{t('dosha.computing')}</span>
      </div>
    );
  }
  if (isError || !data) {
    return <div className="glass-card rounded-2xl p-8 text-center text-rose-400 text-sm">{t('dosha.failed')}</div>;
  }

  const ss = data.sadeSati;
  const ranked = [...data.doshas].sort((a, b) => {
    if (a.present !== b.present) return a.present ? -1 : 1;
    return (SEVERITY_RANK[a.severity] ?? 3) - (SEVERITY_RANK[b.severity] ?? 3);
  });
  const lead = ranked.find(d => d.present);
  const doshaOpen = openDosha === undefined ? (lead?.key ?? null) : openDosha;

  const counts: Record<SaturnFilter, number> = { current: 0, upcoming: 0, past: 0 };
  ss.periods.forEach(p => { counts[p.status] += 1; });
  const filters = (['current', 'upcoming', 'past'] as const).filter(id => counts[id] > 0);
  const activeFilter: SaturnFilter = filter && counts[filter] > 0
    ? filter
    : counts.current ? 'current' : counts.upcoming ? 'upcoming' : 'past';
  const visible = ss.periods.filter(p => p.status === activeFilter);

  const currentPeriod = ss.periods.find(p => p.status === 'current');
  const nextPeriod = ss.periods.find(p => p.status === 'upcoming' && isFullCycle(p))
    ?? ss.periods.find(p => p.status === 'upcoming');
  const livePhase = currentPeriod ? phaseNow(currentPeriod) : undefined;

  const defaultCycle = activeFilter === 'past'
    ? null
    : (visible.find(isFullCycle)?.start ?? visible[0]?.start ?? null);
  const openCycle = cycleOverride === undefined ? defaultCycle : cycleOverride;
  const defaultPhase = (() => {
    if (!openCycle || activeFilter !== 'current' || !livePhase || currentPeriod?.start !== openCycle) return null;
    return `${openCycle}:${livePhase.phase}:${livePhase.start}`;
  })();
  const openPhase = phaseOverride === undefined ? defaultPhase : phaseOverride;

  const focusDosha = (key: string) => {
    setOpenDosha(key);
    requestAnimationFrame(() => {
      document.getElementById(`dosha-${key}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const saturnLine = livePhase
    ? `${t('dosha.status.current')} · ${t(PHASE_KEY[livePhase.phase])} ${t(PHASE_HOUSE[livePhase.phase])}`
    : nextPeriod
      ? `${t('dosha.status.upcoming')} · ${fmtMonthYear(nextPeriod.start, lang)}`
      : t('dosha.status.past');

  return (
    <div className="space-y-4">
      <div className="glass-card rounded-2xl p-4 sm:p-5">
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'rgba(var(--c-accent-rgb),0.08)', border: '1px solid rgba(var(--c-accent-rgb),0.18)' }}>
            <ShieldAlert className="w-4 h-4" style={{ color: 'var(--c-accent-2)' }} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={`text-sm font-bold ${isLight ? 'text-gray-800' : 'text-white'}`}>{t('dosha.title')}</h3>
              <TapHint label={t('common.tapToOpen')} />
            </div>
            <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-white/45'}`}>{t('dosha.subtitle')}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
          {ranked.map(d => {
            const tone = toneFor(d);
            const selected = doshaOpen === d.key;
            return (
              <button
                key={d.key}
                type="button"
                onClick={() => focusDosha(d.key)}
                aria-pressed={selected}
                className="tap-card tap-blink rounded-xl px-2.5 py-2 text-left min-h-11"
                style={tapVars(tone, isLight ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.03)')}
              >
                <div className={`text-[11px] font-bold leading-snug line-clamp-2 ${isLight ? 'text-slate-800' : 'text-white'}`}>{d.name}</div>
                <div className="mt-1 text-[10px] font-bold" style={{ color: tone }}>
                  {d.present ? t(SEVERITY_KEY[d.severity] ?? SEVERITY_KEY.none) : t('dosha.severity.clear')}
                </div>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => document.getElementById('sade-sati')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="tap-card tap-blink rounded-xl px-2.5 py-2 text-left min-h-11"
            style={tapVars(ss.currentlyActive ? '#fbbf24' : ACCENT, isLight ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.03)')}
          >
            <div className={`text-[11px] font-bold leading-snug line-clamp-2 ${isLight ? 'text-slate-800' : 'text-white'}`}>{t('dosha.sadeSatiTitle')}</div>
            <div className="mt-1 text-[10px] font-bold" style={{ color: ss.currentlyActive ? '#fbbf24' : ACCENT }}>
              {saturnLine}
            </div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {ranked.map(d => (
          <DoshaCard
            key={d.key}
            d={d}
            isLight={isLight}
            open={doshaOpen === d.key}
            onToggle={() => setOpenDosha(doshaOpen === d.key ? null : d.key)}
          />
        ))}
      </div>

      <div id="sade-sati" className="glass-card rounded-2xl p-4 sm:p-5 scroll-mt-28">
        <div className="flex items-start gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'rgba(var(--c-accent-rgb),0.08)', border: '1px solid rgba(var(--c-accent-rgb),0.18)' }}>
            <Activity className="w-4 h-4" style={{ color: 'var(--c-accent-2)' }} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`text-sm font-bold ${isLight ? 'text-gray-800' : 'text-white'}`}>{t('dosha.sadeSatiTitle')}</h3>
            <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-white/45'}`}>
              {t('dosha.natalMoon')}: {labelRashi(ss.natalMoonSign, lang, ss.natalMoonSignName)} · {new Set(ss.periods.map(p => p.cycle).filter(c => c != null)).size || ss.periods.length} {t('dosha.cycles')}
            </p>
          </div>
        </div>

        {filters.length > 1 && (
          <div className="flex flex-wrap gap-1.5 mb-3" role="tablist">
            {filters.map(id => {
              const selected = id === activeFilter;
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => { setFilter(id); setCycleOverride(undefined); setPhaseOverride(undefined); }}
                  className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-bold transition-colors ${
                    selected ? 'on-accent text-white border-transparent' : isLight ? 'text-slate-600 border-slate-200' : 'text-white/55 border-white/10'
                  }`}
                  style={selected ? { background: ACCENT } : undefined}
                >
                  {t(STATUS_KEY[id])}
                  <span className={`ml-1.5 font-mono ${selected ? 'opacity-80' : 'opacity-60'}`}>{counts[id]}</span>
                </button>
              );
            })}
          </div>
        )}

        <div className="space-y-2.5">
          {visible.map((p, i) => {
            const open = openCycle === p.start;
            const here = phaseNow(p);
            return (
              <motion.div
                key={p.start}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i, 6) * 0.04 }}
                className="rounded-xl border p-3"
                style={{
                  background: isLight ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.03)',
                  borderColor: p.status === 'current' ? 'rgba(251,191,36,0.45)' : 'var(--border-subtle)',
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setCycleOverride(open ? null : p.start);
                    setPhaseOverride(undefined);
                  }}
                  aria-expanded={open}
                  className="w-full flex items-center justify-between gap-2 text-left"
                >
                  <div className="min-w-0">
                    <div className={`text-xs font-bold ${isLight ? 'text-gray-800' : 'text-white'}`}>
                      {fmtMonthYear(p.start, lang)} – {fmtMonthYear(p.end, lang)}
                    </div>
                    {p.cycle != null && (
                      <div className={`text-[10px] mt-0.5 ${isLight ? 'text-slate-400' : 'text-white/40'}`}>
                        {t('dosha.cycle')} {p.cycle}
                        {here ? ` · ${t(PHASE_KEY[here.phase])}` : ''}
                      </div>
                    )}
                  </div>
                  <span className="flex items-center gap-1.5 shrink-0">
                    <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold ${STATUS_CHIP[p.status]}`}>{t(STATUS_KEY[p.status])}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''} ${isLight ? 'text-slate-400' : 'text-white/45'}`} />
                  </span>
                </button>

                {open && (
                  <div className="mt-3 space-y-2">
                    <div className="grid grid-cols-3 gap-1.5">
                      {(['rising', 'peak', 'setting'] as const).map(name => {
                        const parts = p.phases.filter(ph => ph.phase === name);
                        return (
                          <div key={name} className="space-y-1 min-w-0">
                            <div className="text-[10px] font-bold leading-tight px-0.5" style={{ color: 'var(--c-accent-2)' }}>
                              {PHASE_ORDER[name]} · {t(PHASE_KEY[name])} {t(PHASE_HOUSE[name])}
                            </div>
                            {parts.length === 0 && (
                              <div className={`text-[10px] px-0.5 ${isLight ? 'text-slate-300' : 'text-white/25'}`}>—</div>
                            )}
                            {parts.map((ph, pi) => {
                              const key = `${p.start}:${ph.phase}:${ph.start}`;
                              const selected = openPhase === key;
                              const live = here?.start === ph.start && p.status === 'current';
                              return (
                                <button
                                  key={ph.start}
                                  type="button"
                                  aria-pressed={selected}
                                  onClick={() => setPhaseOverride(selected ? null : key)}
                                  className="w-full rounded-lg px-2 py-1.5 text-left min-h-11 transition-colors"
                                  style={{
                                    background: selected
                                      ? 'rgba(var(--c-accent-rgb),0.12)'
                                      : isLight ? 'rgba(15,23,42,0.03)' : 'rgba(255,255,255,0.04)',
                                    border: `1px solid ${live ? 'rgba(251,191,36,0.55)' : selected ? 'rgba(var(--c-accent-rgb),0.45)' : 'var(--border-subtle)'}`,
                                  }}
                                >
                                  <div className={`text-[11px] font-semibold truncate ${isLight ? 'text-slate-700' : 'text-white/80'}`}>
                                    {labelRashi(ph.sign, lang, ph.signName)}
                                  </div>
                                  <div className={`text-[10px] font-mono mt-0.5 ${isLight ? 'text-slate-400' : 'text-white/35'}`}>
                                    {fmtMonthYear(ph.start, lang)}{parts.length > 1 ? ` · ${pi + 1}` : ''}
                                  </div>
                                  {ph.grade && (
                                    <span className={`inline-block mt-1 px-1.5 rounded border text-[10px] font-bold ${LEVEL_CHIP[ph.grade.level]}`}>
                                      {ph.grade.levelLabel}
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                    {p.phases.filter(ph => openPhase === `${p.start}:${ph.phase}:${ph.start}`).map(ph => (
                      <PhaseDetail key={ph.start} ph={ph} isLight={isLight} />
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
        <p className={`mt-3 text-[10px] leading-relaxed ${isLight ? 'text-slate-400' : 'text-white/30'}`}>{t('dosha.sadeSatiNote')}</p>
      </div>
    </div>
  );
};
