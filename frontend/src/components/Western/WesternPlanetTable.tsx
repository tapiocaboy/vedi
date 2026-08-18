import { motion } from 'framer-motion';
import type { WesternPlanetPosition } from '../../types/westernAstrology';
import { westernPlanetName, westernPlanetGlyph, westernPlanetColor } from '../../lib/core/western/text/planetText';
import { DIGNITY_TEXT } from '../../lib/core/western/text/dignityText';
import { formatSignDegree, degreeInSign } from '../../lib/core/western/signs';
import { useTheme } from '../../hooks/useTheme';
import { useLang } from '../../i18n/LanguageContext';
import { coreLang } from '../../i18n/translations';
import { pick } from '../../lib/core/i18n';

const ACCENT = 'var(--c-accent)';

interface Props {
  planets: WesternPlanetPosition[];
  ascendant: WesternPlanetPosition;
  midheaven: WesternPlanetPosition;
}

const DIGNITY_COLOR: Record<string, string> = {
  rulership: '#22c55e', exaltation: '#10b981', detriment: '#f59e0b', fall: '#f43f5e', neutral: '#94a3b8',
};

export const WesternPlanetTable: React.FC<Props> = ({ planets, ascendant, midheaven }) => {
  const isLight = useTheme();
  const { lang, t } = useLang();
  const rows = [ascendant, ...planets, midheaven];

  const headerBg = isLight ? `linear-gradient(to right, #1e3a8a, ${ACCENT})` : `linear-gradient(to right, #0b1a3b, #3b5bdb)`;
  const rowEven = isLight ? '#ffffff' : 'rgba(255,255,255,0.008)';
  const rowOdd = isLight ? '#f8fafc' : 'rgba(255,255,255,0.004)';
  const borderClr = isLight ? '#e2e8f0' : 'rgba(255,255,255,0.06)';
  const cellTxt = isLight ? '#0f172a' : 'rgba(255,255,255,0.88)';
  const mutedTxt = isLight ? '#64748b' : 'rgba(255,255,255,0.50)';

  return (
    <div className="overflow-x-auto">
      <motion.table
        className="w-full text-xs sm:text-sm"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
      >
        <thead>
          <tr style={{ background: headerBg }}>
            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left rounded-tl-lg font-bold text-white">{t('western.table.colBody')}</th>
            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold text-white">{t('western.table.colSign')}</th>
            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold text-white">{t('western.table.colDegree')}</th>
            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold text-white hidden sm:table-cell">{t('western.table.colHouse')}</th>
            <th className="px-2 sm:px-4 py-2 sm:py-3 text-center font-bold text-white">℞</th>
            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left rounded-tr-lg font-bold text-white">{t('western.table.colDignity')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p, idx) => (
            <motion.tr
              key={p.planet}
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.04 }}
              style={{ borderBottom: `1px solid ${borderClr}`, background: idx % 2 === 0 ? rowEven : rowOdd }}
            >
              <td className="px-2 sm:px-4 py-2 sm:py-3 font-bold">
                <div className="flex items-center gap-1.5 sm:gap-2.5">
                  <span className="text-lg sm:text-xl font-bold" style={{ color: westernPlanetColor(p.planet, isLight), textShadow: `0 0 8px ${westernPlanetColor(p.planet, isLight)}55` }}>
                    {westernPlanetGlyph(p.planet)}
                  </span>
                  <span className="text-xs sm:text-[15px] font-bold" style={{ color: cellTxt }}>{westernPlanetName(p.planet, coreLang(lang))}</span>
                </div>
              </td>
              <td className="px-2 sm:px-4 py-2 sm:py-3 font-semibold" style={{ color: cellTxt }}>{p.sign}</td>
              <td className="px-2 sm:px-4 py-2 sm:py-3 font-mono font-semibold" style={{ color: ACCENT }}>
                {degreeInSign(p.longitude).toFixed(2)}°
              </td>
              <td className="px-2 sm:px-4 py-2 sm:py-3 font-semibold hidden sm:table-cell" style={{ color: cellTxt }}>{p.house}</td>
              <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                {p.isRetrograde && (
                  <span className="inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-pink-500/20 text-pink-400 font-bold text-[10px] sm:text-xs border border-pink-500/30">℞</span>
                )}
              </td>
              <td className="px-2 sm:px-4 py-2 sm:py-3">
                {p.planet !== 'ASCENDANT' && p.planet !== 'MIDHEAVEN' ? (
                  <span className="text-[10px] sm:text-xs font-semibold whitespace-nowrap" style={{ color: DIGNITY_COLOR[p.dignity] }}>
                    {pick(DIGNITY_TEXT[p.dignity].label, coreLang(lang))}
                  </span>
                ) : <span className="text-xs" style={{ color: mutedTxt }}>—</span>}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </motion.table>
      <p className="mt-2 px-1 text-[10px] font-mono" style={{ color: mutedTxt }}>
        {formatSignDegree(ascendant.longitude)} {t('western.table.risingLabel')} · {formatSignDegree(midheaven.longitude)} MC
      </p>
    </div>
  );
};
