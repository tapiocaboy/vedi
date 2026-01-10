/**
 * Current Dasha display component
 */

import React from 'react';
import { motion } from 'framer-motion';
import type { CurrentDasha as CurrentDashaType } from '../../types/astrology';
import { DASHA_COLORS } from '../../types/astrology';
import { formatDate, formatDays } from '../../utils/dateUtils';

interface Props {
  currentDasha: CurrentDashaType;
}

export const CurrentDasha: React.FC<Props> = ({ currentDasha }) => {
  const { mahadasha, antardasha, pratyantardasha } = currentDasha;

  const DashaPill: React.FC<{
    label: string;
    lord: string;
    start: string;
    end: string;
    duration: string;
    delay?: number;
  }> = ({ label, lord, start, end, duration, delay = 0 }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-slate-400 font-medium">{label}</span>
        <span 
          className={`px-3 py-1 rounded-full text-sm font-semibold text-white ${DASHA_COLORS[lord] || 'bg-slate-600'}`}
        >
          {lord}
        </span>
      </div>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-500">Start:</span>
          <span className="text-slate-300 font-mono text-xs">{formatDate(start)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">End:</span>
          <span className="text-slate-300 font-mono text-xs">{formatDate(end)}</span>
        </div>
        <div className="flex justify-between pt-1 border-t border-slate-700/50">
          <span className="text-slate-500">Duration:</span>
          <span className="text-cyber-400 font-medium">{duration}</span>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-display font-semibold text-white">
        Currently Running Periods
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DashaPill
          label="Mahadasha"
          lord={mahadasha.lord}
          start={mahadasha.start}
          end={mahadasha.end}
          duration={`${mahadasha.durationYears.toFixed(1)} years`}
          delay={0}
        />
        
        <DashaPill
          label="Antardasha"
          lord={antardasha.lord}
          start={antardasha.start}
          end={antardasha.end}
          duration={formatDays(antardasha.durationDays)}
          delay={0.1}
        />
        
        {pratyantardasha && (
          <DashaPill
            label="Pratyantardasha"
            lord={pratyantardasha.lord}
            start={pratyantardasha.start}
            end={pratyantardasha.end}
            duration={formatDays(pratyantardasha.durationDays)}
            delay={0.2}
          />
        )}
      </div>

      {/* Combined display */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-cyber-600 to-neon-600 rounded-xl p-4 text-white text-center shadow-neon"
      >
        <div className="text-sm opacity-80 mb-1">Current Period</div>
        <div className="text-xl font-semibold">
          {mahadasha.lord} - {antardasha.lord}
          {pratyantardasha && ` - ${pratyantardasha.lord}`}
        </div>
      </motion.div>
    </div>
  );
};
