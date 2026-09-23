/**
 * Dasha Timeline component - shows Mahadashas with expandable Antardashas and predictions
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DashaWithAntardashas, BirthData } from '../../types/astrology';
import { PLANET_SYMBOLS } from '../../types/astrology';
import { formatDate, formatYears, formatDays } from '../../utils/dateUtils';
import { parseISO, isWithinInterval } from 'date-fns';
import { useLang } from '../../i18n/LanguageContext';
import { useTheme } from '../../hooks/useTheme';
import { labelPlanet } from '../../i18n/astroLabels';
import { AntardashaPanel } from './AntardashaPanel';
import { TapBadge, TapHint, tapVars } from '../shared/tapTarget';
import { LORD_HEX } from '../shared/BarCharts';

/** Same palette as the "Active Dasha Periods" bars above the timeline. */
const lordHex = (lord: string) => LORD_HEX[lord] ?? '#94a3b8';

interface Props {
  timeline: DashaWithAntardashas[];
  birthData?: BirthData;
  currentDate?: Date;
}


export const DashaTimeline: React.FC<Props> = ({ timeline, birthData, currentDate = new Date() }) => {
  const { lang, t } = useLang();
  const isLight = useTheme();
  const [expandedDasha, setExpandedDasha] = useState<string | null>(null);
  const [selectedAntardasha, setSelectedAntardasha] = useState<{
    mahadasha: string;
    antardasha: string;
    /** ISO start — identifies which instance of this lord pair is open. */
    start: string;
    key: string;
  } | null>(null);

  // Check if a period contains the current date
  const isCurrent = (start: string, end: string): boolean => {
    try {
      return isWithinInterval(currentDate, {
        start: parseISO(start),
        end: parseISO(end),
      });
    } catch {
      return false;
    }
  };

  // Toggle expansion
  const toggleExpand = (lord: string, index: number) => {
    const key = `${lord}-${index}`;
    if (expandedDasha === key) {
      setExpandedDasha(null);
      setSelectedAntardasha(null);
    } else {
      setExpandedDasha(key);
      setSelectedAntardasha(null);
    }
  };

  // Handle Antardasha click
  const handleAntardashaClick = (
    mahadasha: string,
    antardasha: string,
    start: string,
    mdIdx: number,
    adIdx: number,
  ) => {
    const key = `${mahadasha}-${antardasha}-${mdIdx}-${adIdx}`;
    if (selectedAntardasha?.key === key) {
      setSelectedAntardasha(null);
    } else {
      setSelectedAntardasha({ mahadasha, antardasha, start, key });
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-display font-semibold text-white">
          {t('dasha.timelineTitle')}
        </h3>
        <div className="flex items-center gap-2">
          <p className="text-xs text-white/25 font-mono">{t('dasha.timelineHint')}</p>
          <TapHint label={t('common.tapToExpand')} />
        </div>
      </div>

      {timeline.map((item, idx) => {
        const { mahadasha, antardashas } = item;
        const key = `${mahadasha.lord}-${idx}`;
        const isExpanded = expandedDasha === key;
        const isMdCurrent = isCurrent(mahadasha.start, mahadasha.end);
        const hex = lordHex(mahadasha.lord);
        const edge = isMdCurrent ? `${hex}99` : isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.06)';

        return (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.03 }}
            className="rounded-xl overflow-hidden border"
            style={{
              borderColor: edge,
              boxShadow: isMdCurrent ? `0 0 0 3px ${hex}1f` : undefined,
            }}
          >
            {/* Mahadasha header: a neutral row that carries the lord's colour
                as a glyph disc and a soft wash, rather than a full-saturation
                slab per period. */}
            <div
              onClick={() => toggleExpand(mahadasha.lord, idx)}
              role="button"
              tabIndex={0}
              aria-expanded={isExpanded}
              data-open={isExpanded}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleExpand(mahadasha.lord, idx); } }}
              className="dasha-md-header tap-row tap-blink py-3 pl-4 pr-3 flex items-center justify-between gap-3"
              style={tapVars(hex, isLight
                ? `color-mix(in srgb, ${hex} ${isMdCurrent ? 10 : 5}%, #ffffff)`
                : `color-mix(in srgb, ${hex} ${isMdCurrent ? 14 : 7}%, var(--bg-page))`)}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="dasha-dot w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-lg font-bold"
                  style={{ background: hex, color: 'rgba(0,0,0,0.75)' }}>
                  {PLANET_SYMBOLS[mahadasha.lord.toUpperCase()] ?? mahadasha.lord.slice(0, 2)}
                </span>
                <span className="text-white font-bold text-base truncate">
                  {labelPlanet(mahadasha.lord, lang)}
                </span>
                {mahadasha.isBirthDasha && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${isLight ? 'bg-slate-900/5 text-slate-500' : 'bg-white/8 text-white/60'}`}>
                    {t('dasha.birthBadge')}
                  </span>
                )}
                {isMdCurrent && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                    style={{ background: hex, color: 'rgba(0,0,0,0.78)' }}>
                    {t('dasha.currentBadge')}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <div className={`font-mono text-[11px] ${isLight ? 'text-slate-500' : 'text-white/50'}`}>
                    {formatDate(mahadasha.start)} – {formatDate(mahadasha.end)}
                  </div>
                  <div className="text-sm font-semibold text-white">
                    {formatYears(mahadasha.durationYears)}
                  </div>
                </div>
                <TapBadge open={isExpanded} direction="down" />
              </div>
            </div>

            {/* Antardashas */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ background: isLight ? '#f8fafc' : 'rgba(0,0,0,0.22)' }}
                >
                  <div className="p-3 space-y-2">
                    {antardashas.map((ad, adIdx) => {
                      const isAdCurrent = isCurrent(ad.start, ad.end);
                      const adKey = `${mahadasha.lord}-${ad.lord}-${idx}-${adIdx}`;
                      const isSelected = selectedAntardasha?.key === adKey;
                      
                      return (
                        <div key={`${ad.lord}-${adIdx}`}>
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: adIdx * 0.03 }}
                            onClick={() => birthData && handleAntardashaClick(mahadasha.lord, ad.lord, ad.start, idx, adIdx)}
                            role={birthData ? 'button' : undefined}
                            tabIndex={birthData ? 0 : undefined}
                            aria-expanded={birthData ? isSelected : undefined}
                            data-open={isSelected}
                            className={`
                              py-2.5 pl-4 pr-3 rounded-lg flex items-center justify-between border
                              ${birthData ? 'tap-row tap-blink' : ''}
                            `}
                            style={{
                              borderColor: isAdCurrent ? `${lordHex(ad.lord)}99` : isLight ? 'rgba(15,23,42,0.07)' : 'rgba(255,255,255,0.05)',
                              ...(birthData
                                ? tapVars(lordHex(ad.lord), isLight ? '#ffffff' : 'rgba(255,255,255,0.025)')
                                : { background: isLight ? '#ffffff' : 'rgba(255,255,255,0.025)' }),
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <span className="dasha-dot w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ background: lordHex(ad.lord) }} />
                              <span className="text-sm font-medium text-white">
                                {labelPlanet(mahadasha.lord, lang)} – {labelPlanet(ad.lord, lang)}
                              </span>
                              {isAdCurrent && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                                  style={{ background: lordHex(ad.lord), color: 'rgba(0,0,0,0.78)' }}>
                                  {t('dasha.nowBadge')}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <div className={`font-mono text-[11px] ${isLight ? 'text-slate-500' : 'text-white/45'}`}>{formatDate(ad.start)} – {formatDate(ad.end)}</div>
                                <div className="text-xs font-medium text-white/70">{formatDays(ad.durationDays)}</div>
                              </div>
                              {birthData && <TapBadge open={isSelected} direction="down" />}
                            </div>
                          </motion.div>

                          {/* Everything about the selected antardasha, in one panel */}
                          <AnimatePresence>
                            {isSelected && birthData && (
                              <AntardashaPanel
                                birthData={birthData}
                                mahadashaLord={mahadasha.lord}
                                antardashaLord={ad.lord}
                                antardashaStart={ad.start}
                              />
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
};
