/**
 * Nakshatra information display component
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Star, Sparkles, User } from 'lucide-react';
import type { NakshatraInfo as NakshatraInfoType } from '../../types/astrology';

interface Props {
  nakshatra: NakshatraInfoType;
  title?: string;
}

export const NakshatraInfo: React.FC<Props> = ({ nakshatra, title = "Moon's Nakshatra (Janma Nakshatra)" }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl p-5"
    >
      <h3 className="text-sm text-slate-400 mb-3 flex items-center gap-2">
        <Star className="w-4 h-4 text-cyber-400" />
        {title}
      </h3>

      <div className="flex items-center gap-4 mb-4">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyber-600/20 to-neon-600/20 flex items-center justify-center border border-cyber-500/30">
          <Sparkles className="w-7 h-7 text-cyber-400" />
        </div>
        <div>
          <div className="text-xl font-display font-bold text-white">{nakshatra.name}</div>
          <div className="text-sm text-slate-400 font-mono">
            Nakshatra #{nakshatra.index + 1} • Pada {nakshatra.pada}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
          <div className="text-slate-500 text-xs mb-1 uppercase tracking-wider">Ruling Planet</div>
          <div className="font-semibold text-white">{nakshatra.lord}</div>
        </div>
        
        {nakshatra.deity && (
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
            <div className="text-slate-500 text-xs mb-1 uppercase tracking-wider">Deity</div>
            <div className="font-semibold text-white">{nakshatra.deity}</div>
          </div>
        )}
        
        {nakshatra.gana && (
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
            <div className="text-slate-500 text-xs mb-1 flex items-center gap-1 uppercase tracking-wider">
              <User className="w-3 h-3" />
              Gana
            </div>
            <div className="font-semibold text-white">{nakshatra.gana}</div>
          </div>
        )}
        
        {nakshatra.symbol && (
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
            <div className="text-slate-500 text-xs mb-1 uppercase tracking-wider">Symbol</div>
            <div className="font-semibold text-white text-xs">{nakshatra.symbol}</div>
          </div>
        )}
      </div>

      <div className="mt-3 text-xs text-slate-500 font-mono">
        Position: {nakshatra.degree.toFixed(2)}° within nakshatra
      </div>
    </motion.div>
  );
};
