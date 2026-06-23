import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { ShieldAlert, ShieldCheck, Loader2, Activity, AlertTriangle, CheckCircle2, Sparkles, CircleDot } from 'lucide-react';
import { getDoshas } from '../../services/api';
import type { BirthData, DoshaCheck, SadeSatiPeriod } from '../../services/api';
import { useTheme } from '../../hooks/useTheme';
import { useLang } from '../../i18n/LanguageContext';

const ACCENT = 'var(--c-accent)';

function fmtMonthYear(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
}

const SEVERITY_STYLE: Record<string, { chip: string; label: string }> = {
  none:     { chip: 'text-emerald-300 bg-emerald-500/12 border-emerald-400/30', label: 'Clear' },
  mild:     { chip: 'text-amber-300 bg-amber-500/12 border-amber-400/30',       label: 'Mild' },
  moderate: { chip: 'text-rose-200 bg-rose-500/12 border-rose-400/30',          label: 'Moderate' },
  strong:   { chip: 'text-rose-300 bg-rose-500/15 border-rose-400/40',          label: 'Strong' },
};

const STATUS_STYLE: Record<SadeSatiPeriod['status'], { chip: string; label: string }> = {
  past:     { chip: 'text-white/45 bg-white/5 border-white/12',                 label: 'Past' },
  current:  { chip: 'text-amber-200 bg-amber-500/15 border-amber-400/40',       label: 'Active now' },
  upcoming: { chip: 'text-violet-200 bg-violet-500/12 border-violet-400/30',    label: 'Upcoming' },
};

const PHASE_LABEL: Record<string, string> = { rising: '1 · Rising (12th)', peak: '2 · Peak (Moon)', setting: '3 · Setting (2nd)' };

function DoshaCard({ d, isLight }: { d: DoshaCheck; isLight: boolean }) {
  const sev = SEVERITY_STYLE[d.severity] ?? SEVERITY_STYLE.none;
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
            <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold shrink-0 ${sev.chip}`}>
              {d.present ? sev.label : 'Clear'}
            </span>
          </div>
          <p className={`text-xs leading-relaxed mt-1 ${isLight ? 'text-slate-600' : 'text-white/65'}`}>{d.summary}</p>
        </div>
      </div>

      {d.factors.length > 0 && (
        <div className="mt-3 pl-12">
          <div className="text-[10px] uppercase tracking-wider text-rose-300/70 mb-1.5 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Why it’s flagged
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
            <CheckCircle2 className="w-3 h-3" /> Cancellation (bhanga)
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

      <div className="mt-3 pl-12">
        <div className="text-[10px] uppercase tracking-wider text-violet-300/70 mb-1 flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> Remedy
        </div>
        <p className={`text-[11.5px] leading-relaxed ${isLight ? 'text-slate-600' : 'text-white/55'}`}>{d.remedy}</p>
      </div>
    </div>
  );
}

export const DoshaTab: React.FC<{ birthData: BirthData }> = ({ birthData }) => {
  const isLight = useTheme();
  const { t } = useLang();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['doshas', birthData],
    queryFn: () => getDoshas(birthData),
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
              {t('dosha.natalMoon')}: {ss.natalMoonSignName} · {ss.periods.length} {t('dosha.cycles')}
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
            const st = STATUS_STYLE[p.status];
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
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className={`text-xs font-bold ${isLight ? 'text-gray-800' : 'text-white'}`}>
                    {fmtMonthYear(p.start)} – {fmtMonthYear(p.end)}
                  </div>
                  <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold ${st.chip}`}>{st.label}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                  {p.phases.map((ph, j) => (
                    <div key={j} className="rounded-lg px-2.5 py-1.5"
                      style={{ background: isLight ? '#f1f5f9' : 'rgba(255,255,255,0.04)', border: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="flex items-center gap-1 text-[10px] font-bold" style={{ color: 'var(--c-accent-2)' }}>
                        <CircleDot className="w-2.5 h-2.5" /> {PHASE_LABEL[ph.phase]}
                      </div>
                      <div className={`text-[11px] font-semibold mt-0.5 ${isLight ? 'text-slate-700' : 'text-white/75'}`}>{ph.signName}</div>
                      <div className={`text-[10px] font-mono ${isLight ? 'text-slate-400' : 'text-white/35'}`}>
                        {fmtMonthYear(ph.start)} – {fmtMonthYear(ph.end)}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
        <p className={`mt-3 text-[10px] ${isLight ? 'text-slate-400' : 'text-white/25'}`}>{t('dosha.sadeSatiNote')}</p>
      </div>
    </div>
  );
};
