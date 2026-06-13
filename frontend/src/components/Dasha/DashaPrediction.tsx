/**
 * Dasha Prediction component - displays detailed predictions for a Dasha period
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Wallet, 
  Briefcase, 
  Users, 
  Sparkles, 
  ChevronDown, 
  ChevronUp,
  AlertTriangle,
  CheckCircle,
  MinusCircle,
  Gem,
  Moon,
  Star
} from 'lucide-react';
import { useLang } from '../../i18n/LanguageContext';
import { labelArea, labelTrend, labelDashaLevel, labelPlanet } from '../../i18n/astroLabels';

interface AreaPrediction {
  trend: 'positive' | 'negative' | 'mixed' | 'neutral';
  intensity: string;
  summary: string;
  details: string[];
  remedies: string[];
  keywords: string[];
}

interface Remedies {
  gemstone: string | null;
  mantra: string | null;
  deity: string | null;
}

interface DashaPredictionData {
  dasha_lord: string;
  period_type: string;
  overall_theme: string;
  overall_rating: number;
  predictions: {
    health: AreaPrediction;
    wealth: AreaPrediction;
    career: AreaPrediction;
    relationships: AreaPrediction;
    general: AreaPrediction;
  };
  favorable_activities: string[];
  unfavorable_activities: string[];
  remedies: Remedies;
}

interface Props {
  prediction: DashaPredictionData;
  compact?: boolean;
}

const TREND_ICONS = {
  positive: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  negative: { icon: AlertTriangle, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' },
  mixed: { icon: MinusCircle, color: 'text-violet-300', bg: 'bg-violet-400/10', border: 'border-violet-400/30' },
  neutral: { icon: MinusCircle, color: 'text-white/50', bg: 'bg-slate-500/10', border: 'border-slate-500/30' },
};

const AREA_CONFIG = {
  health: { icon: Heart, color: 'text-rose-400' },
  wealth: { icon: Wallet, color: 'text-emerald-400' },
  career: { icon: Briefcase, color: 'text-violet-400' },
  relationships: { icon: Users, color: 'text-pink-400' },
  general: { icon: Sparkles, color: 'text-purple-400' },
};

export const DashaPrediction: React.FC<Props> = ({ prediction, compact = false }) => {
  const { lang, t } = useLang();
  const [expandedArea, setExpandedArea] = useState<string | null>(null);
  const [showRemedies, setShowRemedies] = useState(false);
  const [showActivities, setShowActivities] = useState(false);

  const renderRating = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 10; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${i < rating ? 'text-violet-300 fill-violet-300' : 'text-slate-600'}`}
        />
      );
    }
    return <div className="flex gap-0.5">{stars}</div>;
  };

  const renderTrendBadge = (trend: string) => {
    const config = TREND_ICONS[trend as keyof typeof TREND_ICONS] || TREND_ICONS.neutral;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color} border ${config.border}`}>
        <Icon className="w-3 h-3" />
        {labelTrend(trend, lang)}
      </span>
    );
  };

  const renderAreaPrediction = (area: string, data: AreaPrediction) => {
    const config = AREA_CONFIG[area as keyof typeof AREA_CONFIG];
    const Icon = config.icon;
    const isExpanded = expandedArea === area;
    const trendStyle = TREND_ICONS[data.trend] ?? TREND_ICONS.neutral;

    return (
      <div key={area} className="border border-white/6 rounded-lg overflow-hidden bg-white/3">
        <button
          onClick={() => setExpandedArea(isExpanded ? null : area)}
          className="w-full p-4 flex items-center justify-between hover:bg-white/4 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${trendStyle.bg} border ${trendStyle.border}`}>
              <Icon className={`w-5 h-5 ${config.color}`} />
            </div>
            <div className="text-left">
              <div className="font-semibold text-white">{labelArea(area, lang)}</div>
              <div className="text-sm text-white/50 max-w-md truncate">{data.summary}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {renderTrendBadge(data.trend)}
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-white/25" />
            ) : (
              <ChevronDown className="w-5 h-5 text-white/25" />
            )}
          </div>
        </button>

        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="border-t border-white/6 p-4 bg-white/3"
          >
            <div className="space-y-4">
              {/* Details */}
              <div>
                <h5 className="font-medium text-white/70 mb-2">{t('common.details')}</h5>
                <ul className="space-y-1.5">
                  {data.details.map((detail, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-white/50">
                      <span className="text-violet-400 mt-1">•</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Remedies */}
              {data.remedies.length > 0 && (
                <div>
                  <h5 className="font-medium text-white/70 mb-2">{t('common.remedies')}</h5>
                  <ul className="space-y-1.5">
                    {data.remedies.map((remedy, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-white/50">
                        <span className="text-emerald-400 mt-1">✓</span>
                        <span>{remedy}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Keywords */}
              {data.keywords.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {data.keywords.map((keyword, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-white/4 text-white/50 text-xs rounded-full border border-white/8"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    );
  };

  if (compact) {
    return (
      <div className="p-4 bg-white/3 rounded-lg border border-white/6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-white/50">{t('dasha.overallRating')}</span>
          {renderRating(prediction.overall_rating)}
        </div>
        <p className="text-sm text-white/70 line-clamp-2">{prediction.overall_theme}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {Object.entries(prediction.predictions).slice(0, 4).map(([area, data]) => {
            const trendStyle = TREND_ICONS[data.trend] ?? TREND_ICONS.neutral;
            return (
              <span
                key={area}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${trendStyle.bg} ${trendStyle.color} border ${trendStyle.border}`}
              >
                {labelArea(area, lang)}: {labelTrend(data.trend, lang)}
              </span>
            );
          })}
        </div>
      </div>
    );
  }

  const periodLabel = prediction.period_type === 'mahadasha'
    ? labelDashaLevel('Mahadasha', lang)
    : t('dasha.periodPredictions');

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-violet-800 to-violet-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-display font-semibold text-white">
              {labelPlanet(prediction.dasha_lord, lang)} {periodLabel}
            </h3>
            <p className="text-white/70 text-sm">
              {t('dasha.periodPredictions')}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-white/70 mb-1">{t('dasha.overallRating')}</div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white">{prediction.overall_rating}/10</span>
            </div>
          </div>
        </div>
        <p className="text-white/80">{prediction.overall_theme}</p>
      </div>

      {/* Predictions by Area */}
      <div className="p-6 space-y-3">
        <h4 className="font-semibold text-white mb-4">{t('dasha.lifeAreaPredictions')}</h4>
        {Object.entries(prediction.predictions).map(([area, data]) =>
          renderAreaPrediction(area, data)
        )}
      </div>

      {/* Remedies Section */}
      <div className="px-6 pb-6">
        <button
          onClick={() => setShowRemedies(!showRemedies)}
          className="w-full p-4 flex items-center justify-between bg-gradient-to-r from-purple-900/30 to-violet-900/20 rounded-lg hover:from-purple-800/40 hover:to-violet-800/30 transition-colors border border-purple-500/20"
        >
          <div className="flex items-center gap-3">
            <Gem className="w-5 h-5 text-purple-400" />
            <span className="font-semibold text-white">{t('dasha.recommendedRemedies')}</span>
          </div>
          {showRemedies ? (
            <ChevronUp className="w-5 h-5 text-white/50" />
          ) : (
            <ChevronDown className="w-5 h-5 text-white/50" />
          )}
        </button>

        {showRemedies && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="mt-3 p-4 bg-white/3 rounded-lg border border-white/6 space-y-4"
          >
            {prediction.remedies.gemstone && (
              <div className="flex items-start gap-3">
                <Gem className="w-5 h-5 text-purple-400 mt-0.5" />
                <div>
                  <span className="font-medium text-white">{t('remedy.gemstone')}:</span>
                  <p className="text-white/50">{prediction.remedies.gemstone}</p>
                </div>
              </div>
            )}
            {prediction.remedies.mantra && (
              <div className="flex items-start gap-3">
                <Moon className="w-5 h-5 text-violet-400 mt-0.5" />
                <div>
                  <span className="font-medium text-white">{t('remedy.affirmation')}:</span>
                  <p className="text-white/50">{prediction.remedies.mantra}</p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Activities Section */}
      <div className="px-6 pb-6">
        <button
          onClick={() => setShowActivities(!showActivities)}
          className="w-full p-4 flex items-center justify-between bg-gradient-to-r from-emerald-900/30 to-violet-900/20 rounded-lg hover:from-emerald-800/40 hover:to-violet-800/30 transition-colors border border-emerald-500/20"
        >
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <span className="font-semibold text-white">{t('dasha.activitiesGuide')}</span>
          </div>
          {showActivities ? (
            <ChevronUp className="w-5 h-5 text-white/50" />
          ) : (
            <ChevronDown className="w-5 h-5 text-white/50" />
          )}
        </button>

        {showActivities && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="mt-3 grid md:grid-cols-2 gap-4"
          >
            <div className="p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
              <h5 className="font-medium text-emerald-400 mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> {t('dasha.favorableActivities')}
              </h5>
              <ul className="space-y-1.5">
                {prediction.favorable_activities.map((activity, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                    <span className="text-emerald-400">✓</span>
                    <span>{activity}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-rose-500/10 rounded-lg border border-rose-500/30">
              <h5 className="font-medium text-rose-400 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> {t('dasha.avoid')}
              </h5>
              <ul className="space-y-1.5">
                {prediction.unfavorable_activities.map((activity, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                    <span className="text-rose-400">✗</span>
                    <span>{activity}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DashaPrediction;
