import React from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import type { CurrentDasha as CurrentDashaType } from '../../types/astrology';
import { BAR_PALETTE, DashaBarRow } from '../shared/BarCharts';
import { useLang } from '../../i18n/LanguageContext';
import { labelDashaLevel, labelPlanet } from '../../i18n/astroLabels';

interface Props {
  currentDasha: CurrentDashaType;
}

export const CurrentDasha: React.FC<Props> = ({ currentDasha }) => {
  const { lang, t } = useLang();
  const { mahadasha, antardasha, pratyantardasha, sookshmaDasha, targetDate } = currentDasha;
  const nowMs = new Date(targetDate).getTime();

  const rows = [
    { label: labelDashaLevel('Mahadasha', lang),      lord: mahadasha.lord,      start: mahadasha.start,      end: mahadasha.end      },
    { label: labelDashaLevel('Antardasha', lang),     lord: antardasha.lord,     start: antardasha.start,     end: antardasha.end     },
    ...(pratyantardasha
      ? [{ label: labelDashaLevel('Pratyantardasha', lang), lord: pratyantardasha.lord, start: pratyantardasha.start, end: pratyantardasha.end }]
      : []),
    ...(sookshmaDasha
      ? [{ label: labelDashaLevel('Sookshma Dasha', lang),  lord: sookshmaDasha.lord,   start: sookshmaDasha.start,   end: sookshmaDasha.end   }]
      : []),
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/3 rounded-2xl border border-white/8 p-5"
    >
      <div className="flex items-center gap-2.5 mb-5">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{
            background: `${BAR_PALETTE.plum}cc`,
            border: `1px solid ${BAR_PALETTE.pink}30`,
          }}
        >
          <Clock className="w-3.5 h-3.5" style={{ color: BAR_PALETTE.gold }} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">{t('dasha.activeTitle')}</h3>
          <p className="text-[11px] text-white/35">
            {rows.map(r => labelPlanet(r.lord, lang)).join(' · ')}
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {rows.map((r, i) => (
          <DashaBarRow key={r.label} {...r} lordLabel={labelPlanet(r.lord, lang)} nowMs={nowMs} index={i} />
        ))}
      </div>
    </motion.div>
  );
};
