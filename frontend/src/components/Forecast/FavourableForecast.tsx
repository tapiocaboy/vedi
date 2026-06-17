import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getFavourabilityForecast, FAVOURABLE_THRESHOLD } from '../../lib/core/favourability';
import type { Chart } from '../../types/astrology';
import { useLang } from '../../i18n/LanguageContext';

interface Props {
  chart: Chart | null;
  isLight: boolean;
  onClick?: () => void;
}

const MONTHS_AHEAD = 18;

/**
 * Header widget: a long month-by-month favourability bar chart spanning the
 * centre of the header, with a threshold line and good/bad colouring, plus a
 * headline saying how long until the next favourable window. Click opens the
 * monthly-transits modal. Hidden until a chart exists.
 */
export const FavourableForecast: React.FC<Props> = ({ chart, isLight, onClick }) => {
  const { t } = useLang();

  const moonRashi = chart?.planets.find(p => p.planet === 'MOON')?.rashiIndex ?? null;
  const lagnaRashi = chart?.ascendant.rashiIndex ?? null;
  const ayanamsa = chart?.birthData.ayanamsa;
  const enabled = chart != null && moonRashi != null && lagnaRashi != null && ayanamsa != null;

  const { data } = useQuery({
    queryKey: ['favourability', ayanamsa, moonRashi, lagnaRashi],
    queryFn: () => getFavourabilityForecast(ayanamsa!, moonRashi!, lagnaRashi!, MONTHS_AHEAD),
    enabled,
    staleTime: 60 * 60_000,
  });

  if (!enabled || !data) return null;

  const { months, nextFavourableIdx, monthsAway, bestIdx } = data;
  const highlightIdx = nextFavourableIdx ?? bestIdx;

  const headline =
    monthsAway === 0
      ? t('forecast.now')
      : monthsAway != null
        ? t('forecast.inMonths', { n: monthsAway })
        : t('forecast.bestIn', { n: bestIdx });

  const firstLabel = months[0]?.label ?? '';
  const lastLabel = months[months.length - 1]?.label ?? '';
  const targetLabel = months[highlightIdx]?.label ?? '';

  const mutedBar = isLight ? 'rgba(15,23,42,0.16)' : 'rgba(255,255,255,0.16)';

  const barColor = (score: number, isHi: boolean): string => {
    if (isHi) return 'var(--c-accent)';
    if (score >= FAVOURABLE_THRESHOLD) return 'rgba(16,185,129,0.65)'; // emerald — good
    if (score >= 4) return mutedBar;                                   // neutral
    return 'rgba(244,63,94,0.40)';                                     // rose — weak
  };

  return (
    <button
      onClick={onClick}
      title={t('forecast.tooltip')}
      className={`hidden md:flex items-center flex-1 min-w-[280px] max-w-[620px] mx-3 lg:mx-5 h-11 px-3 rounded-xl border transition-all duration-200 ${
        isLight
          ? 'bg-gray-100 border-gray-200 hover:bg-gray-200'
          : 'bg-white/5 border-white/8 hover:bg-white/10'
      }`}
    >
      {/* Headline block */}
      <div className={`shrink-0 text-left pr-3 mr-3 border-r ${isLight ? 'border-gray-300' : 'border-white/10'}`}>
        <div className={`text-[11px] font-semibold leading-tight ${isLight ? 'text-gray-800' : 'text-white/85'}`}>
          {headline}
        </div>
        <div className={`text-[9px] font-mono uppercase tracking-wide ${isLight ? 'text-gray-400' : 'text-white/40'}`}>
          {t('forecast.label')}
        </div>
      </div>

      {/* Long bar chart */}
      <div className="relative flex-1 h-7 self-center" aria-hidden>
        {/* Favourable-threshold line */}
        <div
          className={`absolute left-0 right-0 border-t border-dashed ${isLight ? 'border-emerald-500/40' : 'border-emerald-400/35'}`}
          style={{ bottom: `${(FAVOURABLE_THRESHOLD / 10) * 100}%` }}
        />
        <div className="absolute inset-0 flex items-end gap-[2px]">
          {months.map((m, i) => {
            const isHi = i === highlightIdx;
            return (
              <span
                key={i}
                style={{
                  height: `${Math.max(6, (m.score / 10) * 100)}%`,
                  backgroundColor: barColor(m.score, isHi),
                  borderRadius: '2px',
                }}
                className={`flex-1 ${isHi ? 'shadow-[0_0_6px_var(--c-accent)]' : ''}`}
              />
            );
          })}
        </div>
      </div>

      {/* Time axis end labels + target */}
      <div className={`shrink-0 text-right pl-3 ml-3 border-l ${isLight ? 'border-gray-300' : 'border-white/10'}`}>
        <div className="text-[10px] font-semibold leading-tight" style={{ color: 'var(--c-accent)' }}>
          {targetLabel}
        </div>
        <div className={`text-[9px] font-mono ${isLight ? 'text-gray-400' : 'text-white/35'}`}>
          {firstLabel}–{lastLabel}
        </div>
      </div>
    </button>
  );
};
