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
      className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-xl p-5 text-white"
    >
      <h3 className="text-sm opacity-80 mb-3 flex items-center gap-2">
        <Star className="w-4 h-4" />
        {title}
      </h3>

      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-yellow-300" />
        </div>
        <div>
          <div className="text-2xl font-display font-bold">{nakshatra.name}</div>
          <div className="text-sm opacity-80">
            Nakshatra #{nakshatra.index + 1} • Pada {nakshatra.pada}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-white/10 rounded-lg p-3">
          <div className="opacity-70 mb-1">Ruling Planet</div>
          <div className="font-semibold">{nakshatra.lord}</div>
        </div>
        
        {nakshatra.deity && (
          <div className="bg-white/10 rounded-lg p-3">
            <div className="opacity-70 mb-1">Deity</div>
            <div className="font-semibold">{nakshatra.deity}</div>
          </div>
        )}
        
        {nakshatra.gana && (
          <div className="bg-white/10 rounded-lg p-3">
            <div className="opacity-70 mb-1 flex items-center gap-1">
              <User className="w-3 h-3" />
              Gana
            </div>
            <div className="font-semibold">{nakshatra.gana}</div>
          </div>
        )}
        
        {nakshatra.symbol && (
          <div className="bg-white/10 rounded-lg p-3">
            <div className="opacity-70 mb-1">Symbol</div>
            <div className="font-semibold text-xs">{nakshatra.symbol}</div>
          </div>
        )}
      </div>

      <div className="mt-3 text-xs opacity-60">
        Position: {nakshatra.degree.toFixed(2)}° within nakshatra
      </div>
    </motion.div>
  );
};

