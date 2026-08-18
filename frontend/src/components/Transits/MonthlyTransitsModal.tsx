import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { CalendarRange, X, Loader2, ArrowRight, RotateCcw, Sparkles, AlertTriangle, TrendingUp, ChevronLeft, ChevronRight, RotateCw } from 'lucide-react';
import { getMonthlyTransits, type MonthlyTransitEvent } from '../../lib/core/monthlyTransits';
import type { Chart } from '../../types/astrology';
import { useLang } from '../../i18n/LanguageContext';
import { coreLang } from '../../i18n/translations';
import { labelPlanet } from '../../i18n/astroLabels';

interface Props {
  visible: boolean;
  onClose: () => void;
  chart: Chart | null;
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function valenceChip(v: number): { label: string; cls: string } {
  if (v > 0) return { label: 'Favourable', cls: 'text-emerald-300 bg-emerald-500/12 border-emerald-400/30' };
  if (v < 0) return { label: 'Demanding', cls: 'text-rose-300 bg-rose-500/12 border-rose-400/30' };
  return { label: 'Mixed', cls: 'text-amber-300 bg-amber-500/12 border-amber-400/30' };
}

const EventCard: React.FC<{ ev: MonthlyTransitEvent }> = ({ ev }) => {
  const { lang, t } = useLang();
  const chip = valenceChip(ev.valence);
  const Icon = ev.type === 'ingress' ? ArrowRight : RotateCcw;
  const accentBorder = ev.valence > 0 ? 'border-emerald-400/20' : ev.valence < 0 ? 'border-rose-400/20' : 'border-white/10';

  return (
    <div className={`rounded-xl border ${accentBorder} bg-black/30 p-4 space-y-2.5`}>
      <div className="flex items-start gap-2.5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
          style={{ background: 'rgba(var(--c-accent-rgb),0.10)', border: '1px solid rgba(var(--c-accent-rgb),0.22)' }}>
          <Icon className="w-4 h-4" style={{ color: 'var(--c-accent-2)' }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-semibold text-white leading-tight">
              {labelPlanet(ev.planet, lang)}{' '}
              {ev.type === 'ingress'
                ? <span className="text-white/60 font-normal">{t('monthly.enters')} {ev.toRashiName}</span>
                : <span className="text-white/60 font-normal">{ev.type === 'retrograde' ? t('monthly.retro') : t('monthly.direct')} · {ev.toRashiName}</span>}
            </h4>
            <span className="text-[10px] font-mono text-white/40 shrink-0">{fmtDate(ev.date)}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <span className={`px-2 py-0.5 rounded-md border text-[10px] font-semibold ${chip.cls}`}>{chip.label}</span>
            <span className="text-[10px] font-mono text-white/40">{ev.houseFromMoon}H {t('monthly.fromMoon')}</span>
            <span className="text-[10px] font-mono text-white/40">· {ev.houseFromLagna}H {t('monthly.fromLagna')}</span>
          </div>
        </div>
      </div>

      <div className="pl-[2.625rem] space-y-2">
        <p className="text-[12px] text-white/75 leading-relaxed">{ev.effect}</p>
        <ul className="space-y-1">
          {ev.themes.map((th, i) => (
            <li key={i} className="text-[11px] text-white/55 leading-relaxed flex gap-1.5">
              <span className="text-violet-400 shrink-0">•</span>
              <span>{th}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

/** First day of the month that is `offset` months from today (0 = current). */
function monthFromOffset(offset: number): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + offset, 1, 12, 0, 0);
}

const Body: React.FC<{ chart: Chart }> = ({ chart }) => {
  const { lang, t } = useLang();
  const moonRashi = chart.planets.find(p => p.planet === 'MOON')?.rashiIndex ?? 0;
  const lagnaRashi = chart.ascendant.rashiIndex;
  const ayanamsa = chart.birthData.ayanamsa;

  // Month offset relative to the current month — lets the user page through any
  // month and recompute that month's transitions.
  const [offset, setOffset] = useState(0);
  const target = monthFromOffset(offset);
  const monthKey = `${target.getFullYear()}-${target.getMonth() + 1}`;
  const monthLabel = target.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  const { data, isLoading, error } = useQuery({
    queryKey: ['monthly-transits', ayanamsa, moonRashi, lagnaRashi, monthKey, lang],
    queryFn: () => getMonthlyTransits(ayanamsa, moonRashi, lagnaRashi, target, coreLang(lang)),
    staleTime: 60 * 60_000, // an hour — ingress dates don't change
  });

  const Nav = (
    <div className="flex items-center justify-between gap-2 mb-1">
      <button
        onClick={() => setOffset(o => o - 1)}
        aria-label="Previous month"
        className="w-8 h-8 rounded-lg flex items-center justify-center text-white/55 hover:text-white hover:bg-white/8 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-white tabular-nums">{monthLabel}</span>
        {offset !== 0 && (
          <button
            onClick={() => setOffset(0)}
            title={t('monthly.thisMonth')}
            className="w-6 h-6 rounded-md flex items-center justify-center text-white/45 hover:text-white hover:bg-white/8 transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      <button
        onClick={() => setOffset(o => o + 1)}
        aria-label="Next month"
        className="w-8 h-8 rounded-lg flex items-center justify-center text-white/55 hover:text-white hover:bg-white/8 transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Nav}
        <div className="flex items-center gap-2 text-white/45 text-sm py-16 justify-center">
          <Loader2 className="w-4 h-4 animate-spin" /> {t('monthly.computing')}
        </div>
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="space-y-4">
        {Nav}
        <div className="text-rose-300 text-sm py-10 text-center">{t('now.failed')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Nav}
      {/* Overview — the synthesised monthly theme */}
      <div className="rounded-xl border p-4" style={{ borderColor: 'rgba(var(--c-accent-rgb),0.20)', background: 'rgba(var(--c-accent-rgb),0.05)' }}>
        <div className="flex items-center gap-2 mb-1.5">
          <TrendingUp className="w-3.5 h-3.5" style={{ color: 'var(--c-accent-2)' }} />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-white">{t('monthly.overview')}</span>
        </div>
        <p className="text-[12px] text-white/80 leading-relaxed">{data.overview}</p>
      </div>

      {/* The transition events — each with its effect */}
      {data.events.length === 0 ? (
        <div className="flex items-start gap-2 text-white/55 text-sm rounded-xl border border-white/8 bg-black/20 p-4">
          <Sparkles className="w-4 h-4 mt-0.5 shrink-0 text-violet-300/70" />
          <span>{t('monthly.noEvents')}</span>
        </div>
      ) : (
        <div className="space-y-2.5">
          {data.events.map((ev, i) => <EventCard key={`${ev.planet}-${ev.type}-${i}`} ev={ev} />)}
        </div>
      )}

      <p className="text-[10px] text-white/30 text-center pt-1">{t('monthly.disclaimer')}</p>
    </div>
  );
};

export const MonthlyTransitsModal: React.FC<Props> = ({ visible, onClose, chart }) => {
  const { t } = useLang();

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-start sm:items-center justify-center p-3 sm:p-6"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative glass-card rounded-2xl w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden mt-12 sm:mt-0"
          >
            {/* Header */}
            <div className="flex items-center gap-3 p-4 sm:p-5 border-b border-white/8 shrink-0">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: 'rgba(var(--c-accent-rgb),0.10)', border: '1px solid rgba(var(--c-accent-rgb),0.22)' }}>
                <CalendarRange className="w-4.5 h-4.5" style={{ color: 'var(--c-accent)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-white">{t('monthly.title')}</h3>
                <p className="text-[11px] text-white/45 truncate">{t('monthly.subtitle')}</p>
              </div>
              <button onClick={onClose} aria-label={t('monthly.close')}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/8 transition-colors shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable body — the "another section" with effects */}
            <div className="overflow-y-auto p-4 sm:p-5">
              {chart ? (
                <Body chart={chart} />
              ) : (
                <div className="flex flex-col items-center gap-3 text-center py-12 px-4">
                  <AlertTriangle className="w-7 h-7 text-amber-300/70" />
                  <p className="text-sm text-white/65 max-w-xs leading-relaxed">{t('monthly.needChart')}</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
