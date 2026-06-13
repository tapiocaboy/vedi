import React from 'react';
import { motion } from 'framer-motion';
import { Star, Sparkles, User } from 'lucide-react';
import type { NakshatraInfo as NakshatraInfoType } from '../../types/astrology';
import { useLang } from '../../i18n/LanguageContext';
import { labelPlanet } from '../../i18n/astroLabels';

interface Props {
  nakshatra: NakshatraInfoType;
  title?: string;
}

export const NakshatraInfo: React.FC<Props> = ({ nakshatra, title }) => {
  const { lang, t } = useLang();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl p-5"
    >
      <h3 className="text-xs text-white/30 mb-3 flex items-center gap-2 uppercase tracking-widest font-mono">
        <Star className="w-3.5 h-3.5 text-violet-400" />
        {title ?? t('nakshatra.title')}
      </h3>

      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl bg-violet-500/8 border border-violet-500/15 flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-violet-400" />
        </div>
        <div>
          <div className="text-xl font-bold text-white">{nakshatra.name}</div>
          <div className="text-xs text-white/30 font-mono mt-0.5">
            #{nakshatra.index + 1} &middot; {t('nakshatra.pada', { n: nakshatra.pada })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="bg-white/3 rounded-lg p-3 border border-white/6">
          <div className="text-[10px] text-white/30 mb-1 uppercase tracking-wider">{t('nakshatra.rulingPlanet')}</div>
          <div className="font-semibold text-white">{labelPlanet(nakshatra.lord, lang)}</div>
        </div>

        {nakshatra.gana && (
          <div className="bg-white/3 rounded-lg p-3 border border-white/6">
            <div className="text-[10px] text-white/30 mb-1 flex items-center gap-1 uppercase tracking-wider">
              <User className="w-3 h-3" /> {t('nakshatra.nature')}
            </div>
            <div className="font-semibold text-white">{nakshatra.gana}</div>
          </div>
        )}

        {nakshatra.symbol && (
          <div className="bg-white/3 rounded-lg p-3 border border-white/6 col-span-2">
            <div className="text-[10px] text-white/30 mb-1 uppercase tracking-wider">{t('nakshatra.symbol')}</div>
            <div className="font-semibold text-white text-sm">{nakshatra.symbol}</div>
          </div>
        )}
      </div>

      <div className="mt-3 text-[10px] text-white/20 font-mono">
        {t('nakshatra.position', { deg: nakshatra.degree.toFixed(2) })}
      </div>
    </motion.div>
  );
};
