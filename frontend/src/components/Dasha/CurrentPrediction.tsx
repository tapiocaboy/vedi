/**
 * Current Period Prediction component - displays predictions for the running Dasha period
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { getCurrentPrediction, type BirthData } from '../../services/api';
import DashaPrediction from './DashaPrediction';
import { Loader2, Calendar, Moon, Star } from 'lucide-react';
import { useLang } from '../../i18n/LanguageContext';
import { labelDashaLevel, labelPlanet } from '../../i18n/astroLabels';

interface Props {
  birthData: BirthData;
}

export const CurrentPrediction: React.FC<Props> = ({ birthData }) => {
  const { lang, t } = useLang();
  const { data: prediction, isLoading, error } = useQuery({
    queryKey: ['currentPrediction', birthData],
    queryFn: () => getCurrentPrediction(birthData),
    enabled: !!birthData.date,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 glass-card rounded-xl">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
        <span className="ml-3 text-white/50 font-mono text-sm">{t('dasha.loadingPredictions')}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
        <p>{t('dasha.loadFailed')}</p>
      </div>
    );
  }

  if (!prediction) return null;

  // Transform the API response to match the component's expected format
  const formattedPrediction = {
    dasha_lord: prediction.dashaLord,
    period_type: prediction.periodType,
    overall_theme: prediction.overallTheme,
    overall_rating: prediction.overallRating,
    predictions: {
      health: prediction.predictions.health,
      wealth: prediction.predictions.wealth,
      career: prediction.predictions.career,
      relationships: prediction.predictions.relationships,
      general: prediction.predictions.general,
    },
    favorable_activities: prediction.favorableActivities,
    unfavorable_activities: prediction.unfavorableActivities,
    remedies: prediction.remedies,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Current Period Header */}
      {prediction.currentPeriods && (
        <div className="glass-card rounded-xl p-4 border border-violet-600/30">
          <h3 className="text-lg font-display font-semibold mb-4 flex items-center gap-2 text-white">
            <Calendar className="w-5 h-5 text-violet-400" />
            {t('dasha.currentPeriodsTitle')}
          </h3>
          
          <div className="grid md:grid-cols-3 gap-4">
            {/* Mahadasha */}
            <div className="bg-white/3 rounded-lg p-3 border border-white/6">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-violet-300" />
                <span className="text-sm text-white/50">{labelDashaLevel('Mahadasha', lang)}</span>
              </div>
              <div className="text-xl font-bold text-white">
                {labelPlanet(prediction.currentPeriods.mahadasha?.lord ?? '', lang)}
              </div>
              <div className="text-xs text-white/25 mt-1 font-mono">
                {prediction.currentPeriods.mahadasha?.start?.split('T')[0]} {t('common.dateTo')}{' '}
                {prediction.currentPeriods.mahadasha?.end?.split('T')[0]}
              </div>
            </div>

            {/* Antardasha */}
            {prediction.currentPeriods.antardasha && (
              <div className="bg-white/3 rounded-lg p-3 border border-white/6">
                <div className="flex items-center gap-2 mb-2">
                  <Moon className="w-4 h-4 text-violet-400" />
                  <span className="text-sm text-white/50">{labelDashaLevel('Antardasha', lang)}</span>
                </div>
                <div className="text-xl font-bold text-white">
                  {labelPlanet(prediction.currentPeriods.antardasha?.lord ?? '', lang)}
                </div>
                <div className="text-xs text-white/25 mt-1 font-mono">
                  {prediction.currentPeriods.antardasha?.start?.split('T')[0]} {t('common.dateTo')}{' '}
                  {prediction.currentPeriods.antardasha?.end?.split('T')[0]}
                </div>
              </div>
            )}

            {/* Pratyantardasha */}
            {prediction.currentPeriods.pratyantardasha && (
              <div className="bg-white/3 rounded-lg p-3 border border-white/6">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-violet-300" />
                  <span className="text-sm text-white/50">{labelDashaLevel('Pratyantardasha', lang)}</span>
                </div>
                <div className="text-xl font-bold text-white">
                  {labelPlanet(prediction.currentPeriods.pratyantardasha?.lord ?? '', lang)}
                </div>
                <div className="text-xs text-white/25 mt-1 font-mono">
                  {prediction.currentPeriods.pratyantardasha?.start?.split('T')[0]} {t('common.dateTo')}{' '}
                  {prediction.currentPeriods.pratyantardasha?.end?.split('T')[0]}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Detailed Prediction */}
      <DashaPrediction prediction={formattedPrediction} />
    </motion.div>
  );
};

export default CurrentPrediction;
