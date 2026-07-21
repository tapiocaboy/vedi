/**
 * Dasha Timeline component - shows Mahadashas with expandable Antardashas and predictions
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Eye } from 'lucide-react';
import type { DashaWithAntardashas, BirthData } from '../../types/astrology';
import { DASHA_COLORS } from '../../types/astrology';
import { formatDate, formatYears, formatDays } from '../../utils/dateUtils';
import { parseISO, isWithinInterval } from 'date-fns';
import { useLang } from '../../i18n/LanguageContext';
import { labelPlanet } from '../../i18n/astroLabels';
import { AntardashaPanel } from './AntardashaPanel';

interface Props {
  timeline: DashaWithAntardashas[];
  birthData?: BirthData;
  currentDate?: Date;
}


export const DashaTimeline: React.FC<Props> = ({ timeline, birthData, currentDate = new Date() }) => {
  const { lang, t } = useLang();
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
        <p className="text-xs text-white/25 font-mono">{t('dasha.timelineHint')}</p>
      </div>

      {timeline.map((item, idx) => {
        const { mahadasha, antardashas } = item;
        const key = `${mahadasha.lord}-${idx}`;
        const isExpanded = expandedDasha === key;
        const isMdCurrent = isCurrent(mahadasha.start, mahadasha.end);

        return (
          <motion.div
            key={key}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="rounded-xl overflow-hidden border border-white/6"
          >
            {/* Mahadasha header */}
            <div
              onClick={() => toggleExpand(mahadasha.lord, idx)}
              className={`
                dasha-md-header
                p-4 cursor-pointer flex items-center justify-between
                transition-all hover:brightness-110
                ${DASHA_COLORS[mahadasha.lord] || 'bg-slate-600'}
                ${isMdCurrent ? 'ring-2 ring-violet-400 ring-offset-2 ring-offset-slate-900' : ''}
              `}
            >
              <div className="flex items-center gap-3">
                <span className="text-white font-bold text-lg">
                  {labelPlanet(mahadasha.lord, lang)}
                </span>
                {mahadasha.isBirthDasha && (
                  <span className="px-2 py-0.5 bg-white/20 rounded text-xs text-white font-mono">
                    {t('dasha.birthBadge')}
                  </span>
                )}
                {isMdCurrent && (
                  <span className="px-2 py-0.5 bg-violet-500 rounded text-xs text-white font-semibold">
                    {t('dasha.currentBadge')}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-white">
                <div className="text-right text-sm">
                  <div className="opacity-80 font-mono text-xs">
                    {formatDate(mahadasha.start)} – {formatDate(mahadasha.end)}
                  </div>
                  <div className="font-semibold">
                    {formatYears(mahadasha.durationYears)}
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
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
                  className="bg-[#1a0800]/60"
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
                            className={`
                              p-3 rounded-lg flex items-center justify-between
                              bg-white/3 border
                              ${isAdCurrent ? 'border-violet-400' : 'border-white/6'}
                              ${birthData ? 'cursor-pointer hover:bg-white/4 transition-all' : ''}
                              ${isSelected ? 'ring-2 ring-violet-500 bg-white/4' : ''}
                            `}
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className={`
                                  dasha-dot
                                  w-3 h-3 rounded-full
                                  ${DASHA_COLORS[ad.lord] || 'bg-slate-500'}
                                `}
                              />
                              <span className="font-medium text-white">
                                {labelPlanet(mahadasha.lord, lang)} - {labelPlanet(ad.lord, lang)}
                              </span>
                              {isAdCurrent && (
                                <span className="px-2 py-0.5 bg-violet-500 rounded text-xs text-white">
                                  {t('dasha.nowBadge')}
                                </span>
                              )}
                              {birthData && (
                                <Eye className={`w-4 h-4 ${isSelected ? 'text-violet-400' : 'text-white/25'}`} />
                              )}
                            </div>
                            
                            <div className="text-right text-sm text-white/50">
                              <div className="font-mono text-xs">{formatDate(ad.start)} – {formatDate(ad.end)}</div>
                              <div className="font-medium text-white/70">{formatDays(ad.durationDays)}</div>
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
