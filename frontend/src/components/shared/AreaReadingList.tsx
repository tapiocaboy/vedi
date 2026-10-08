/**
 * The life areas of a period, plain language first.
 *
 * Each row reads on its own: the area, a one-line plain reading and its trend.
 * Opening a row gives the full plain reading and what mainly drives it; the
 * astrology (score parts, classical combinations, the engine's notes) sits one
 * level further down, behind "The astrology behind this", for whoever wants it.
 *
 * Used wherever a period's life areas are listed (Timeline → Outlook, Insights).
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, CheckCircle, AlertTriangle, MinusCircle, Heart, Wallet, Briefcase, Users } from 'lucide-react';
import type { DashaPredictionData } from '../../services/api';
import { useLang } from '../../i18n/LanguageContext';
import { labelArea, labelTrend } from '../../i18n/astroLabels';
import { useAreaReadings, AREA_ORDER as ORDER } from './useAreaReadings';
import { TapBadge, tapVars } from './tapTarget';
import { AreaWhy, AstroDisclosure } from './AreaWhy';
import { coreLang } from '../../i18n/translations';
import { plainAreaLine } from '../../lib/core/areaReading';
import { READING_LABELS } from '../../lib/core/text/readingText';

const TREND_ICONS = {
  positive: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  negative: { icon: AlertTriangle, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' },
  mixed: { icon: MinusCircle, color: 'text-violet-300', bg: 'bg-violet-400/10', border: 'border-violet-400/30' },
  neutral: { icon: MinusCircle, color: 'text-white/50', bg: 'bg-slate-500/10', border: 'border-slate-500/30' },
};

const AREA_CONFIG = {
  career: { icon: Briefcase, color: 'text-violet-400', bgColor: 'bg-violet-500/10' },
  wealth: { icon: Wallet, color: 'text-emerald-400', bgColor: 'bg-emerald-500/10' },
  relationships: { icon: Users, color: 'text-pink-400', bgColor: 'bg-pink-500/10' },
  health: { icon: Heart, color: 'text-rose-400', bgColor: 'bg-rose-500/10' },
  general: { icon: Sparkles, color: 'text-purple-400', bgColor: 'bg-purple-500/10' },
} as const;

const TrendBadge: React.FC<{ trend: string }> = ({ trend }) => {
  const { lang } = useLang();
  const c = TREND_ICONS[trend as keyof typeof TREND_ICONS] ?? TREND_ICONS.neutral;
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${c.bg} ${c.color} border ${c.border}`}>
      <Icon className="w-3 h-3" />
      {labelTrend(trend, lang)}
    </span>
  );
};

export const AreaReadingList: React.FC<{ prediction: DashaPredictionData; title?: string }> = ({ prediction, title }) => {
  const { lang } = useLang();
  const L = coreLang(lang);
  const [open, setOpen] = useState<string | null>(null);
  const readings = useAreaReadings(prediction);

  return (
    <div className="space-y-2">
      {title && <h5 className="text-sm font-semibold text-white/70 mb-3">{title}</h5>}
      {ORDER.map(area => {
        const data = prediction.predictions[area];
        if (!data) return null;
        // Without a score breakdown (older data) the plain line still leads and
        // the engine's notes stand in for the astrology.
        const reading = readings[area];
        const plainLine = reading?.plainLine ?? plainAreaLine(area, data.trend, L);
        const cfg = AREA_CONFIG[area];
        const Icon = cfg.icon;
        const isOpen = open === area;
        return (
          <div key={area} className="rounded-lg border border-white/6 overflow-hidden bg-white/3">
            <button
              onClick={() => setOpen(isOpen ? null : area)}
              aria-expanded={isOpen}
              data-open={isOpen}
              className="tap-row tap-blink w-full py-3 pl-5 pr-2 flex items-center justify-between gap-3 text-left transition-colors"
              style={tapVars(undefined, 'rgba(255,255,255,0.03)')}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`p-1.5 rounded-lg ${cfg.bgColor} border border-violet-800/25 shrink-0`}>
                  <Icon className={`w-4 h-4 ${cfg.color}`} />
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-white text-sm">{labelArea(area, lang)}</div>
                  <div className={`text-xs text-white/55 ${isOpen ? '' : 'line-clamp-1'}`}>{plainLine}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <TrendBadge trend={data.trend} />
                <TapBadge open={isOpen} direction="down" />
              </div>
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-white/6"
                >
                  <div className="p-4 bg-white/3">
                    {reading?.why && <p className="text-sm text-white/75 leading-relaxed">{reading.why}</p>}
                    {reading ? (
                      <AreaWhy reading={reading} />
                    ) : data.details.length > 0 && (
                      <AstroDisclosure showLabel={READING_LABELS.showWhy[L]} hideLabel={READING_LABELS.hideWhy[L]}>
                        <ul className="space-y-1">
                          {data.details.slice(0, 6).map((d, i) => (
                            <li key={i} className="text-[11px] text-white/60 leading-relaxed flex gap-2">
                              <span className="text-violet-400 shrink-0">•</span>
                              <span>{d}</span>
                            </li>
                          ))}
                        </ul>
                      </AstroDisclosure>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};

export default AreaReadingList;
