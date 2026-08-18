import { motion } from 'framer-motion';
import { Stars } from 'lucide-react';
import type { WesternChart, WesternPattern } from '../../types/westernAstrology';
import { PATTERN_TEXT } from '../../lib/core/western/text/patternText';
import { westernPlanetName } from '../../lib/core/western/text/planetText';
import { pick } from '../../lib/core/i18n';
import { useTheme } from '../../hooks/useTheme';
import { useLang } from '../../i18n/LanguageContext';
import { coreLang } from '../../i18n/translations';

interface Props { chart: WesternChart }

const PatternCard: React.FC<{ p: WesternPattern; index: number }> = ({ p, index }) => {
  const isLight = useTheme();
  const { lang } = useLang();
  const text = PATTERN_TEXT[p.type];
  const bodies = p.bodies.map(b => westernPlanetName(b, coreLang(lang))).join(' · ');
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
      className="rounded-xl border p-4"
      style={{
        borderColor: isLight ? 'rgba(139,92,246,0.25)' : 'rgba(139,92,246,0.28)',
        background: isLight ? 'rgba(139,92,246,0.04)' : 'rgba(139,92,246,0.06)',
      }}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
          <h4 className="text-sm font-semibold" style={{ color: 'var(--c-accent)' }}>{pick(text.name, coreLang(lang))}</h4>
          {p.apex && <span className="text-[10px] uppercase tracking-wider font-semibold text-white/40">apex: {westernPlanetName(p.apex, coreLang(lang))}</span>}
      </div>
      <p className="text-[11px] font-mono mb-2" style={{ color: isLight ? '#64748b' : 'rgba(255,255,255,0.4)' }}>{bodies}</p>
        <p className="text-[12px] leading-relaxed" style={{ color: isLight ? '#334155' : 'rgba(255,255,255,0.72)' }}>{pick(text.description, coreLang(lang))}</p>
    </motion.div>
  );
};

export const WesternPatternsTab: React.FC<Props> = ({ chart }) => {
  const { t } = useLang();
  return (
    <div className="glass-card rounded-2xl p-3 sm:p-6">
      <div className="flex items-center gap-2.5 mb-1">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(var(--c-accent-rgb),0.08)', border: '1px solid rgba(var(--c-accent-rgb),0.18)' }}>
          <Stars className="w-4 h-4" style={{ color: 'var(--c-accent-2)' }} />
        </div>
        <h3 className="text-sm font-semibold text-white">{t('western.patterns.title')}</h3>
      </div>
      <p className="text-xs mb-5 ml-[2.625rem] text-white/25">{t('western.patterns.subtitle')}</p>

      {chart.patterns.length === 0 ? (
        <p className="text-xs text-white/40 ml-[2.625rem]">{t('western.patterns.none')}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {chart.patterns.map((p, i) => <PatternCard key={`${p.type}-${p.bodies.join('-')}`} p={p} index={i} />)}
        </div>
      )}
    </div>
  );
};
