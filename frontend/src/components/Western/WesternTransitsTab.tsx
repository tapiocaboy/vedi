import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Compass, Loader2 } from 'lucide-react';
import type { BirthData } from '../../types/astrology';
import { getWesternTransitsSnapshot } from '../../services/api';
import { composeTransitAspectSentence, composeTransitHouseSentence } from '../../lib/core/western/text/transitText';
import { westernPlanetName, westernPlanetGlyph, westernPlanetColor } from '../../lib/core/western/text/planetText';
import { formatOrb } from '../../lib/core/western/aspects';
import { useTheme } from '../../hooks/useTheme';
import { useLang } from '../../i18n/LanguageContext';

interface Props { birthData: BirthData }

export const WesternTransitsTab: React.FC<Props> = ({ birthData }) => {
  const isLight = useTheme();
  const { lang, t } = useLang();

  const { data, isLoading, error } = useQuery({
    queryKey: ['western-transits', birthData, lang],
    queryFn: () => getWesternTransitsSnapshot(birthData),
    staleTime: 1000 * 60 * 5,
  });

  const mutedTxt = isLight ? '#64748b' : 'rgba(255,255,255,0.45)';

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-white/40 text-sm py-12 justify-center">
        <Loader2 className="w-4 h-4 animate-spin" /> {t('western.transits.title')}
      </div>
    );
  }
  if (error || !data) {
    return <div className="glass-card rounded-2xl p-6 text-rose-300 text-sm">{t('now.failed')}</div>;
  }

  const strongHits = data.hits.filter(h => h.strength >= 0.25).slice(0, 12);

  return (
    <div className="space-y-4">
      <div className="glass-card rounded-2xl p-3 sm:p-6">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(var(--c-accent-rgb),0.08)', border: '1px solid rgba(var(--c-accent-rgb),0.18)' }}>
            <Compass className="w-4 h-4" style={{ color: 'var(--c-accent-2)' }} />
          </div>
          <h3 className="text-sm font-semibold text-white">{t('western.transits.title')}</h3>
        </div>
        <p className="text-xs mb-4 ml-[2.625rem]" style={{ color: mutedTxt }}>{t('western.transits.subtitle')}</p>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {data.transiting.map((tp, i) => (
            <motion.div
              key={tp.planet}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="rounded-lg p-2.5 text-center"
              style={{ border: `1px solid ${isLight ? '#e2e8f0' : 'rgba(255,255,255,0.08)'}`, background: isLight ? '#f8fafc' : 'rgba(255,255,255,0.02)' }}
            >
              <span className="text-lg font-bold" style={{ color: westernPlanetColor(tp.planet, isLight) }}>
                {westernPlanetGlyph(tp.planet)}
              </span>
              <div className="text-[11px] font-semibold mt-1" style={{ color: isLight ? '#0f172a' : 'rgba(255,255,255,0.85)' }}>
                {tp.sign}{tp.isRetrograde ? ' ℞' : ''}
              </div>
              <div className="text-[10px]" style={{ color: mutedTxt }}>
                {t('western.transits.natalHouseLabel')} {tp.natalHouse}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="glass-card rounded-2xl p-3 sm:p-6">
        <h4 className="text-sm font-semibold text-white mb-3">{t('western.transits.aspectsHeading')}</h4>
        {strongHits.length === 0 ? (
          <p className="text-xs" style={{ color: mutedTxt }}>{t('western.transits.noHits')}</p>
        ) : (
          <div className="space-y-2">
            {strongHits.map((h, i) => (
              <motion.div
                key={`${h.bodyA}-${h.bodyB}-${h.type}`}
                initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="rounded-lg px-3 py-2"
                style={{ border: `1px solid ${isLight ? '#e2e8f0' : 'rgba(255,255,255,0.07)'}` }}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11.5px] font-semibold" style={{ color: isLight ? '#0f172a' : 'rgba(255,255,255,0.85)' }}>
                    {westernPlanetName(h.bodyA, lang)} → {westernPlanetName(h.bodyB, lang)}
                  </span>
                  <span className="text-[10px] font-mono ml-auto" style={{ color: mutedTxt }}>{formatOrb(h.orb)}</span>
                </div>
                <p className="text-[11px] mt-1 leading-relaxed" style={{ color: isLight ? '#475569' : 'rgba(255,255,255,0.6)' }}>
                  {composeTransitAspectSentence(h, lang)}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div className="glass-card rounded-2xl p-3 sm:p-6">
        <h4 className="text-sm font-semibold text-white mb-3">{t('western.transits.housesHeading')}</h4>
        <div className="space-y-1.5">
          {data.transiting.map(tp => (
            <p key={tp.planet} className="text-[11.5px] leading-relaxed" style={{ color: isLight ? '#475569' : 'rgba(255,255,255,0.6)' }}>
              {composeTransitHouseSentence(tp.planet, tp.natalHouse, lang)}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};
