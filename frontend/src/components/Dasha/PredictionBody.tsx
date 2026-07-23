/**
 * The antardasha outlook: life areas, remedies, and the activities guide.
 *
 * Deliberately headerless — the enclosing panel names the period once. All of
 * this content is governed by the mahadasha and antardasha lords, so it is
 * rendered exactly once per period and never repeated per sub-window.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  MinusCircle,
  // Gem, // used only by the hidden remedies section
  Heart,
  Wallet,
  Briefcase,
  Users,
} from 'lucide-react';
import type { DashaPredictionData } from '../../services/api';
import { useLang } from '../../i18n/LanguageContext';
import { labelArea, labelTrend } from '../../i18n/astroLabels';

const TREND_ICONS = {
  positive: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  negative: { icon: AlertTriangle, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' },
  mixed: { icon: MinusCircle, color: 'text-violet-300', bg: 'bg-violet-400/10', border: 'border-violet-400/30' },
  neutral: { icon: MinusCircle, color: 'text-white/50', bg: 'bg-slate-500/10', border: 'border-slate-500/30' },
};

const AREA_CONFIG = {
  health: { icon: Heart, color: 'text-rose-400', bgColor: 'bg-rose-500/10' },
  wealth: { icon: Wallet, color: 'text-emerald-400', bgColor: 'bg-emerald-500/10' },
  career: { icon: Briefcase, color: 'text-violet-400', bgColor: 'bg-violet-500/10' },
  relationships: { icon: Users, color: 'text-pink-400', bgColor: 'bg-pink-500/10' },
  general: { icon: Sparkles, color: 'text-purple-400', bgColor: 'bg-purple-500/10' },
};

interface Props {
  prediction: DashaPredictionData;
}

export const PredictionBody: React.FC<Props> = ({ prediction }) => {
  const { lang, t } = useLang();
  const [expandedArea, setExpandedArea] = useState<string | null>(null);
  const [showActivities, setShowActivities] = useState(false);

  const renderTrendBadge = (trend: string) => {
    const config = TREND_ICONS[trend as keyof typeof TREND_ICONS] || TREND_ICONS.neutral;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.color} border ${config.border}`}>
        <Icon className="w-3 h-3" />
        {labelTrend(trend, lang)}
      </span>
    );
  };

  return (
    <div>
      {/* Life Areas Grid */}
      <div className="p-4 space-y-2">
        <h5 className="text-sm font-semibold text-white/70 mb-3">{t('dasha.lifeAreaOutlook')}</h5>

        {Object.entries(prediction.predictions).map(([area, data]) => {
          const config = AREA_CONFIG[area as keyof typeof AREA_CONFIG];
          if (!config) return null;

          const Icon = config.icon;
          const isExpanded = expandedArea === area;

          return (
            <div key={area} className="rounded-lg border border-white/6 overflow-hidden bg-white/3">
              <button
                onClick={() => setExpandedArea(isExpanded ? null : area)}
                className="w-full p-3 flex items-center justify-between hover:bg-white/4 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${config.bgColor} border border-violet-800/25`}>
                    <Icon className={`w-4 h-4 ${config.color}`} />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-white text-sm">{labelArea(area, lang)}</div>
                    <div className="text-xs text-white/50 line-clamp-1 max-w-xs">{data.summary}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {renderTrendBadge(data.trend)}
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-white/25" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-white/25" />
                  )}
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-white/6"
                  >
                    <div className="p-4 bg-white/3 space-y-4">
                      {/* Details */}
                      <div>
                        <h6 className="font-medium text-white/70 text-sm mb-2">{t('common.details')}</h6>
                        <ul className="space-y-1">
                          {data.details.slice(0, 5).map((detail, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-white/50">
                              <span className="text-violet-400 mt-0.5">•</span>
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Remedies — hidden for now, kept for when they come back
                      {data.remedies.length > 0 && (
                        <div>
                          <h6 className="font-medium text-white/70 text-sm mb-2">{t('common.remedies')}</h6>
                          <ul className="space-y-1">
                            {data.remedies.slice(0, 3).map((remedy, i) => (
                              <li key={i} className="flex items-start gap-2 text-xs text-white/50">
                                <span className="text-emerald-400">✓</span>
                                <span>{remedy}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      */}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Activities */}
      <div className="px-4 pb-4 space-y-3">
        {/* Main Remedies — hidden for now, kept for when they come back
        <div className="p-3 bg-white/3 rounded-lg border border-white/6">
          <h5 className="text-sm font-semibold text-white/70 mb-2 flex items-center gap-2">
            <Gem className="w-4 h-4 text-purple-400" />
            {t('dasha.recommendedRemedies')}
          </h5>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {prediction.remedies.gemstone && (
              <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <div className="text-purple-400 font-medium">{t('remedy.gemstone')}</div>
                <div className="text-white/70">{prediction.remedies.gemstone}</div>
              </div>
            )}
            {prediction.remedies.mantra && (
              <div className="p-2 bg-violet-500/10 rounded-lg border border-violet-500/20">
                <div className="text-violet-400 font-medium">{t('remedy.affirmation')}</div>
                <div className="text-white/70 truncate">{prediction.remedies.mantra}</div>
              </div>
            )}
            {prediction.remedies.deity && (
              <div className="p-2 bg-violet-400/10 rounded-lg border border-violet-400/20">
                <div className="text-violet-300 font-medium">{t('remedy.focus')}</div>
                <div className="text-white/70">{prediction.remedies.deity}</div>
              </div>
            )}
          </div>
        </div>
        */}

        {/* Activities */}
        <button
          onClick={() => setShowActivities(!showActivities)}
          className="w-full p-3 flex items-center justify-between bg-white/3 rounded-lg border border-white/6 hover:bg-white/5 transition-colors"
        >
          <span className="text-sm font-semibold text-white/70 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            {t('dasha.activitiesGuide')}
          </span>
          {showActivities ? <ChevronUp className="w-4 h-4 text-white/25" /> : <ChevronDown className="w-4 h-4 text-white/25" />}
        </button>

        <AnimatePresence>
          {showActivities && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="grid grid-cols-2 gap-3"
            >
              <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
                <h6 className="font-medium text-emerald-400 text-xs mb-2 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> {t('dasha.favorable')}
                </h6>
                <ul className="space-y-1">
                  {prediction.favorableActivities.slice(0, 4).map((activity, i) => (
                    <li key={i} className="text-xs text-white/70 flex items-start gap-1">
                      <span className="text-emerald-400">✓</span>
                      <span>{activity}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-3 bg-rose-500/10 rounded-lg border border-rose-500/30">
                <h6 className="font-medium text-rose-400 text-xs mb-2 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> {t('dasha.avoid')}
                </h6>
                <ul className="space-y-1">
                  {prediction.unfavorableActivities.slice(0, 4).map((activity, i) => (
                    <li key={i} className="text-xs text-white/70 flex items-start gap-1">
                      <span className="text-rose-400">✗</span>
                      <span>{activity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PredictionBody;
