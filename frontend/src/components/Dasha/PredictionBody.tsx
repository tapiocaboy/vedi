/**
 * The antardasha outlook: life areas, remedies, and the activities guide.
 *
 * Deliberately headerless — the enclosing panel names the period once. All of
 * this content is governed by the mahadasha and antardasha lords, so it is
 * rendered exactly once per period and never repeated per sub-window.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, CheckCircle, AlertTriangle } from 'lucide-react';
// import { Gem } from 'lucide-react'; // used only by the hidden remedies section
import type { DashaPredictionData } from '../../services/api';
import { useLang } from '../../i18n/LanguageContext';
import { TapBadge, tapVars } from '../shared/tapTarget';
import { AreaReadingList } from '../shared/AreaReadingList';

interface Props {
  prediction: DashaPredictionData;
}

export const PredictionBody: React.FC<Props> = ({ prediction }) => {
  const { t } = useLang();
  const [showActivities, setShowActivities] = useState(false);

  return (
    <div>
      {/* Life areas — plain reading first; the astrology one level down */}
      <div className="p-4">
        <AreaReadingList prediction={prediction} title={t('dasha.lifeAreaOutlook')} />
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
          aria-expanded={showActivities}
          data-open={showActivities}
          className="tap-row tap-blink w-full py-3 pl-5 pr-2 flex items-center justify-between rounded-lg border border-white/6 transition-colors"
          style={tapVars('#34d399', 'rgba(255,255,255,0.03)')}
        >
          <span className="text-sm font-semibold text-white/70 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            {t('dasha.activitiesGuide')}
          </span>
          <TapBadge open={showActivities} direction="down" />
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
