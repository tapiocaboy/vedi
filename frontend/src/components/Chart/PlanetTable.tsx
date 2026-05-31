import { useState } from 'react';
import { motion } from 'framer-motion';
import type { PlanetPosition } from '../../types/astrology';
import { PLANET_SYMBOLS, PLANET_COLORS } from '../../types/astrology';
import { formatDegree } from '../../utils/dateUtils';
import { PlanetDetailPanel } from './PlanetDetailPanel';
import { useTheme } from '../../hooks/useTheme';

const ACCENT = '#FF2E51';

interface Props {
  planets: PlanetPosition[];
  ascendant: PlanetPosition;
}

export const PlanetTable: React.FC<Props> = ({ planets, ascendant }) => {
  const [selected, setSelected] = useState<PlanetPosition | null>(null);
  const isLight = useTheme();

  const allPositions: PlanetPosition[] = [
    ...planets,
    { ...ascendant, planet: 'ASCENDANT' },
  ];

  const ascendantRashiIndex = ascendant.rashiIndex;

  // Theme tokens
  const headerBg    = isLight
    ? `linear-gradient(to right, #92400e, ${ACCENT})`
    : `linear-gradient(to right, #3b1a00, #c97a2a)`;
  const rowEven     = isLight ? '#ffffff'          : 'rgba(255,255,255,0.008)';
  const rowOdd      = isLight ? '#f8fafc'          : 'rgba(255,255,255,0.004)';
  const rowSel      = isLight ? 'rgba(255,175,97,0.14)' : 'rgba(255,175,97,0.10)';
  const rowHover    = isLight ? 'rgba(255,175,97,0.08)' : 'rgba(255,175,97,0.06)';
  const borderClr   = isLight ? '#e2e8f0'          : 'rgba(255,255,255,0.06)';
  const cellTxt     = isLight ? '#0f172a'          : 'rgba(255,255,255,0.88)';
  const mutedTxt    = isLight ? '#64748b'          : 'rgba(255,255,255,0.50)';
  const degreeTxt   = ACCENT;
  const padaBg      = isLight ? 'rgba(255,175,97,0.18)' : 'rgba(255,175,97,0.20)';
  const padaTxt     = isLight ? '#92400e'          : 'rgba(255,175,97,0.90)';
  const padaBorder  = isLight ? 'rgba(255,175,97,0.35)' : 'rgba(255,175,97,0.30)';

  return (
    <>
      <div className="overflow-x-auto">
        <p className="text-sm font-bold mb-3 px-1 tracking-wide" style={{ color: mutedTxt }}>
          Click any row to see planetary effects, house placement, and predictions
        </p>
        <motion.table
          className="w-full text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <thead>
            <tr style={{ background: headerBg }}>
              <th className="px-4 py-3 text-left rounded-tl-lg font-bold text-white">Planet</th>
              <th className="px-4 py-3 text-left font-bold text-white">Rashi</th>
              <th className="px-4 py-3 text-left font-bold text-white">Degree</th>
              <th className="px-4 py-3 text-left font-bold text-white">Nakshatra</th>
              <th className="px-4 py-3 text-left font-bold text-white">Pada</th>
              <th className="px-4 py-3 text-center rounded-tr-lg font-bold text-white">℞</th>
            </tr>
          </thead>
          <tbody>
            {allPositions.map((planet, idx) => {
              const isSel = selected?.planet === planet.planet;
              return (
                <motion.tr
                  key={planet.planet}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => setSelected(planet)}
                  className="cursor-pointer transition-colors duration-150"
                  style={{
                    background: isSel ? rowSel : idx % 2 === 0 ? rowEven : rowOdd,
                    borderBottom: `1px solid ${borderClr}`,
                  }}
                  onMouseEnter={e => { if (!isSel) (e.currentTarget as HTMLElement).style.background = rowHover; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = isSel ? rowSel : idx % 2 === 0 ? rowEven : rowOdd; }}
                >
                  <td className="px-4 py-3 font-bold">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl font-bold" style={{ color: PLANET_COLORS[planet.planet], textShadow: `0 0 8px ${PLANET_COLORS[planet.planet]}55` }}>
                        {PLANET_SYMBOLS[planet.planet]}
                      </span>
                      <span className="text-[15px] font-bold" style={{ color: cellTxt }}>{planet.planet}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold" style={{ color: cellTxt }}>
                    {planet.rashi}
                    <span className="text-xs ml-1 font-mono font-medium" style={{ color: isLight ? '#64748b' : 'rgba(255,255,255,0.45)' }}>
                      ({planet.rashiIndex + 1})
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono font-semibold" style={{ color: degreeTxt }}>
                    {formatDegree(planet.rashiDegree)}
                  </td>
                  <td className="px-4 py-3 font-semibold" style={{ color: cellTxt }}>{planet.nakshatra}</td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex items-center justify-center w-6 h-6 rounded-full font-semibold text-xs"
                      style={{ background: padaBg, color: padaTxt, border: `1px solid ${padaBorder}` }}
                    >
                      {planet.nakshatraPada}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {planet.isRetrograde && (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-pink-500/20 text-pink-400 font-bold text-xs border border-pink-500/30">
                        ℞
                      </span>
                    )}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </motion.table>
      </div>

      <PlanetDetailPanel
        planet={selected}
        ascendantRashiIndex={ascendantRashiIndex}
        onClose={() => setSelected(null)}
      />
    </>
  );
};
