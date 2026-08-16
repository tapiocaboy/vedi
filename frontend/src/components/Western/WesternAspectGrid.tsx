import { motion } from 'framer-motion';
import type { AspectHit } from '../../types/westernAstrology';
import { formatOrb } from '../../lib/core/western/aspects';
import { composeAspectSentence } from '../../lib/core/western/text/aspectText';
import { westernPlanetName } from '../../lib/core/western/text/planetText';
import { useTheme } from '../../hooks/useTheme';
import { useLang } from '../../i18n/LanguageContext';

const ASPECT_GLYPH: Record<AspectHit['type'], string> = {
  conjunction: '☌', sextile: '⚹', square: '□', trine: '△', opposition: '☍', quincunx: '⚻',
};
const ASPECT_COLOR: Record<AspectHit['type'], string> = {
  conjunction: '#94a3b8', sextile: '#34d399', trine: '#22c55e', square: '#f43f5e', opposition: '#f43f5e', quincunx: '#f59e0b',
};

interface Props { aspects: AspectHit[]; minStrength?: number }

export const WesternAspectGrid: React.FC<Props> = ({ aspects, minStrength = 0.25 }) => {
  const isLight = useTheme();
  const { lang, t } = useLang();
  const shown = aspects.filter(a => a.strength >= minStrength);
  const mutedTxt = isLight ? '#64748b' : 'rgba(255,255,255,0.45)';
  const rowBg = (i: number) => (i % 2 === 0 ? (isLight ? '#ffffff' : 'rgba(255,255,255,0.008)') : (isLight ? '#f8fafc' : 'rgba(255,255,255,0.004)'));
  const borderClr = isLight ? '#e2e8f0' : 'rgba(255,255,255,0.06)';

  if (!shown.length) {
    return <p className="text-xs" style={{ color: mutedTxt }}>{t('common.none')}</p>;
  }

  return (
    <div className="space-y-1.5">
      {shown.map((a, i) => (
        <motion.div
          key={`${a.bodyA}-${a.bodyB}-${a.type}`}
          initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
          className="rounded-lg px-3 py-2"
          style={{ background: rowBg(i), border: `1px solid ${borderClr}` }}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold" style={{ color: ASPECT_COLOR[a.type] }}>{ASPECT_GLYPH[a.type]}</span>
            <span className="text-[11.5px] font-semibold" style={{ color: isLight ? '#0f172a' : 'rgba(255,255,255,0.85)' }}>
              {westernPlanetName(a.bodyA, lang)} — {westernPlanetName(a.bodyB, lang)}
            </span>
            <span className="text-[10px] font-mono ml-auto" style={{ color: mutedTxt }}>
              {formatOrb(a.orb)} {a.applying ? '↗' : '↘'}
            </span>
          </div>
          <p className="text-[11px] mt-1 leading-relaxed" style={{ color: isLight ? '#475569' : 'rgba(255,255,255,0.6)' }}>
            {composeAspectSentence(a.bodyA, a.bodyB, a.type, lang)}
          </p>
        </motion.div>
      ))}
    </div>
  );
};
