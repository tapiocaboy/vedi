/**
 * Current Period Prediction component - displays predictions for the running Dasha period
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { getCurrentPrediction, type DashaPredictionData, type BirthData } from '../../services/api';
import DashaPrediction from './DashaPrediction';
import { Loader2, Calendar, Moon, Star } from 'lucide-react';

interface Props {
  birthData: BirthData;
}

export const CurrentPrediction: React.FC<Props> = ({ birthData }) => {
  const { data: prediction, isLoading, error } = useQuery({
    queryKey: ['currentPrediction', birthData],
    queryFn: () => getCurrentPrediction(birthData),
    enabled: !!birthData.date,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 bg-white rounded-xl shadow-sm">
        <Loader2 className="w-8 h-8 animate-spin text-saffron-600" />
        <span className="ml-3 text-gray-600">Loading predictions...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-xl text-red-700">
        <p>Failed to load predictions. Please try again.</p>
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
        <div className="bg-gradient-to-r from-maroon-600 to-maroon-800 rounded-xl p-4 text-white">
          <h3 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Currently Running Periods
          </h3>
          
          <div className="grid md:grid-cols-3 gap-4">
            {/* Mahadasha */}
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-gold-400" />
                <span className="text-sm text-maroon-200">Mahadasha</span>
              </div>
              <div className="text-xl font-bold">
                {prediction.currentPeriods.mahadasha?.lord}
              </div>
              <div className="text-xs text-maroon-200 mt-1">
                {prediction.currentPeriods.mahadasha?.start?.split('T')[0]} to{' '}
                {prediction.currentPeriods.mahadasha?.end?.split('T')[0]}
              </div>
            </div>

            {/* Antardasha */}
            {prediction.currentPeriods.antardasha && (
              <div className="bg-white/10 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Moon className="w-4 h-4 text-saffron-400" />
                  <span className="text-sm text-maroon-200">Antardasha</span>
                </div>
                <div className="text-xl font-bold">
                  {prediction.currentPeriods.antardasha?.lord}
                </div>
                <div className="text-xs text-maroon-200 mt-1">
                  {prediction.currentPeriods.antardasha?.start?.split('T')[0]} to{' '}
                  {prediction.currentPeriods.antardasha?.end?.split('T')[0]}
                </div>
              </div>
            )}

            {/* Pratyantardasha */}
            {prediction.currentPeriods.pratyantardasha && (
              <div className="bg-white/10 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-saffron-300" />
                  <span className="text-sm text-maroon-200">Pratyantardasha</span>
                </div>
                <div className="text-xl font-bold">
                  {prediction.currentPeriods.pratyantardasha?.lord}
                </div>
                <div className="text-xs text-maroon-200 mt-1">
                  {prediction.currentPeriods.pratyantardasha?.start?.split('T')[0]} to{' '}
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

