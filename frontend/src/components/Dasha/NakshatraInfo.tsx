import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Sparkles } from 'lucide-react';
import type { NakshatraInfo as NakshatraInfoType } from '../../types/astrology';
import { getNakshatraItems, type NakshatraItem } from '../../lib/core/nakshatraInsights';
import { useLang } from '../../i18n/LanguageContext';
import { labelPlanet } from '../../i18n/astroLabels';
import { TapBadge, TapHint, tapVars } from '../shared/tapTarget';

interface Props {
  nakshatra: NakshatraInfoType;
  title?: string;
}

const ItemRow: React.FC<{ item: NakshatraItem; open: boolean; onToggle: () => void; displayValue: string }>
  = ({ item, open, onToggle, displayValue }) => {
  const { t } = useLang();
  return (
    <div className={`rounded-lg border bg-white/3 overflow-hidden transition-colors ${open ? 'border-violet-400/35' : 'border-white/6'}`}>
      <button
        onClick={onToggle}
        aria-expanded={open}
        data-open={open}
        className="tap-row tap-blink w-full flex items-center gap-3 pl-5 pr-2.5 py-2.5 text-left transition-colors"
        style={tapVars(undefined, 'rgba(255,255,255,0.03)')}
      >
        <div className="flex-1 min-w-0">
          <div className="text-[10px] text-white/30 uppercase tracking-wider">{t(item.labelKey)}</div>
          <div className="font-semibold text-white text-sm truncate">{displayValue}</div>
        </div>
        <TapBadge open={open} direction="down" />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-2">
              <p className="text-[12px] text-white/75 leading-relaxed">{item.body}</p>
              {item.bullets && item.bullets.length > 0 && (
                <ul className="space-y-1">
                  {item.bullets.map((b, i) => (
                    <li key={i} className="text-[11.5px] text-white/60 leading-relaxed flex gap-1.5">
                      <span className="text-violet-400 shrink-0">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const NakshatraInfo: React.FC<Props> = ({ nakshatra, title }) => {
  const { lang, t } = useLang();
  const [openKey, setOpenKey] = useState<string | null>('overview');
  const items = getNakshatraItems(nakshatra, lang);

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

      <div className="flex items-center gap-4 mb-3">
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

      <p className="text-[11px] text-white/35 mb-3 flex items-center gap-2 flex-wrap">
        {t('nakshatra.tapHint')}
        <TapHint label={t('common.tapToExpand')} />
      </p>

      <div className="space-y-2">
        {items.map(item => {
          const display = item.key === 'lord' ? labelPlanet(nakshatra.lord, lang) : item.value;
          return (
            <ItemRow
              key={item.key}
              item={item}
              displayValue={display}
              open={openKey === item.key}
              onToggle={() => setOpenKey(openKey === item.key ? null : item.key)}
            />
          );
        })}
      </div>

      <div className="mt-3 text-[10px] text-white/20 font-mono">
        {t('nakshatra.position', { deg: nakshatra.degree.toFixed(2) })}
      </div>
    </motion.div>
  );
};
