/**
 * Every month of the header forecast, with the best window explained first.
 * The strip in the header only names the window; this is the reading of all 18.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { CalendarRange, X, Loader2 } from 'lucide-react';
import { getFavourabilityForecast, FAVOURABLE_THRESHOLD } from '../../lib/core/favourability';
import type { Chart } from '../../types/astrology';
import { useLang } from '../../i18n/LanguageContext';

interface Props {
  visible: boolean;
  onClose: () => void;
  chart: Chart | null;
}

const MONTHS_AHEAD = 18;
const HILITE = '#10b981';

function localeFor(lang: string): string {
  if (lang === 'si') return 'si-LK';
  if (lang === 'zh') return 'zh-CN';
  if (lang === 'ja') return 'ja-JP';
  if (lang === 'ko') return 'ko-KR';
  if (lang === 'hi') return 'hi-IN';
  if (lang === 'ta') return 'ta-IN';
  if (lang === 'ml') return 'ml-IN';
  return lang === 'ar' ? 'ar' : 'en-US';
}

const Body: React.FC<{ chart: Chart }> = ({ chart }) => {
  const { lang, t } = useLang();
  const moonRashi = chart.planets.find(p => p.planet === 'MOON')?.rashiIndex ?? null;
  const lagnaRashi = chart.ascendant.rashiIndex;
  const ayanamsa = chart.birthData.ayanamsa;

  const { data, isLoading, error } = useQuery({
    queryKey: ['favourability', ayanamsa, moonRashi, lagnaRashi],
    queryFn: () => getFavourabilityForecast(ayanamsa, moonRashi!, lagnaRashi, MONTHS_AHEAD),
    enabled: moonRashi != null,
    staleTime: 60 * 60_000,
  });

  if (isLoading || moonRashi == null) {
    return (
      <div className="flex items-center gap-2 text-white/45 text-sm py-16 justify-center">
        <Loader2 className="w-4 h-4 animate-spin" /> {t('monthly.computing')}
      </div>
    );
  }
  if (error || !data) {
    return <div className="text-rose-300 text-sm py-10 text-center">{t('now.failed')}</div>;
  }

  const { months, nextFavourableIdx, bestIdx } = data;
  const locale = localeFor(lang);
  const long = (iso: string) => new Date(iso).toLocaleDateString(locale, { month: 'long', year: 'numeric' });
  const best = months[bestIdx];
  const next = nextFavourableIdx != null ? months[nextFavourableIdx] : null;
  const explanation = next
    ? (nextFavourableIdx === bestIdx
      ? t('forecast.explainSame', { month: long(next.date), score: next.score })
      : t('forecast.explainNext', { month: long(next.date), score: next.score, best: long(best.date), bestScore: best.score }))
    : t('forecast.explainNone', { threshold: FAVOURABLE_THRESHOLD, best: long(best.date), bestScore: best.score });

  return (
    <div className="space-y-4">
      <div className="rounded-xl border p-4" style={{ borderColor: 'rgba(16,185,129,0.35)', background: 'rgba(16,185,129,0.08)' }}>
        <p className="text-[13px] text-white/85 leading-relaxed">{explanation}</p>
        <p className="text-[11px] text-white/45 mt-2">{t('forecast.label')}</p>
      </div>

      <ul className="space-y-1.5">
        {months.map((m, i) => {
          const isBest = i === bestIdx;
          const clears = m.favourable;
          return (
            <li
              key={m.date}
              className="rounded-xl border px-3 py-2.5 flex items-center gap-3"
              style={{
                borderColor: isBest ? 'rgba(16,185,129,0.45)' : 'rgba(255,255,255,0.08)',
                background: isBest ? 'rgba(16,185,129,0.08)' : 'rgba(0,0,0,0.20)',
              }}
            >
              <div className="w-[8.5rem] shrink-0">
                <div className="text-xs font-semibold text-white leading-tight">{long(m.date)}</div>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {i === 0 && <span className="text-[10px] text-white/45">{t('dasha.nowBadge')}</span>}
                  {isBest && (
                    <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded" style={{ color: HILITE, background: 'rgba(16,185,129,0.15)' }}>
                      {t('forecast.best')}
                    </span>
                  )}
                  {clears && !isBest && (
                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded text-emerald-300/90 bg-emerald-500/10">
                      {t('forecast.clears')}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden" aria-hidden>
                <div className="h-full rounded-full" style={{ width: `${Math.max(6, m.score * 10)}%`, background: clears || isBest ? HILITE : 'rgba(255,255,255,0.35)' }} />
              </div>
              <div className="w-8 text-right text-xs font-bold tabular-nums text-white">{m.score}</div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export const WindowsModal: React.FC<Props> = ({ visible, onClose, chart }) => {
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
            <div className="flex items-center gap-3 p-4 sm:p-5 border-b border-white/8 shrink-0">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.28)' }}>
                <CalendarRange className="w-4 h-4" style={{ color: HILITE }} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-white">{t('forecast.windowsTitle')}</h3>
                <p className="text-[11px] text-white/45 truncate">{t('forecast.label')}</p>
              </div>
              <button onClick={onClose} aria-label={t('monthly.close')}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/8 transition-colors shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-y-auto p-4 sm:p-5">
              {chart ? <Body chart={chart} /> : null}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
