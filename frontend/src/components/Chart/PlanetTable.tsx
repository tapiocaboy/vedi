import { useState } from 'react';
import { motion } from 'framer-motion';
import type { PlanetPosition } from '../../types/astrology';
import { PLANET_SYMBOLS, PLANET_COLORS } from '../../types/astrology';
import { formatDegree } from '../../utils/dateUtils';
import { PlanetDetailPanel } from './PlanetDetailPanel';

interface Props {
  planets: PlanetPosition[];
  ascendant: PlanetPosition;
}

export const PlanetTable: React.FC<Props> = ({ planets, ascendant }) => {
  const [selected, setSelected] = useState<PlanetPosition | null>(null);

  const allPositions: PlanetPosition[] = [
    ...planets,
    { ...ascendant, planet: 'ASCENDANT' },
  ];

  const ascendantRashiIndex = ascendant.rashiIndex;

  return (
    <>
      <div className="overflow-x-auto">
        <p className="text-[11px] font-mono text-white/25 mb-3 px-1">
          Click any row to see planetary effects, house placement, and predictions
        </p>
        <motion.table
          className="w-full text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <thead>
            <tr className="bg-gradient-to-r from-violet-800 to-violet-600 text-white">
              <th className="px-4 py-3 text-left rounded-tl-lg font-medium">Planet</th>
              <th className="px-4 py-3 text-left font-medium">Rashi</th>
              <th className="px-4 py-3 text-left font-medium">Degree</th>
              <th className="px-4 py-3 text-left font-medium">Nakshatra</th>
              <th className="px-4 py-3 text-left font-medium">Pada</th>
              <th className="px-4 py-3 text-center rounded-tr-lg font-medium">℞</th>
            </tr>
          </thead>
          <tbody>
            {allPositions.map((planet, idx) => (
              <motion.tr
                key={planet.planet}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => setSelected(planet)}
                className={`
                  border-b border-white/6 cursor-pointer
                  ${idx % 2 === 0 ? 'bg-white/2' : 'bg-white/1'}
                  hover:bg-violet-900/20 hover:border-violet-500/20 transition-all duration-150
                  ${selected?.planet === planet.planet ? 'bg-violet-900/25 border-violet-500/30' : ''}
                `}
              >
                <td className="px-4 py-3 font-medium">
                  <div className="flex items-center gap-2">
                    <span className="text-lg" style={{ color: PLANET_COLORS[planet.planet] }}>
                      {PLANET_SYMBOLS[planet.planet]}
                    </span>
                    <span className="text-white">{planet.planet}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-white/75">
                  {planet.rashi}
                  <span className="text-white/35 text-xs ml-1 font-mono">({planet.rashiIndex + 1})</span>
                </td>
                <td className="px-4 py-3 font-mono text-violet-400">
                  {formatDegree(planet.rashiDegree)}
                </td>
                <td className="px-4 py-3 text-white/75">{planet.nakshatra}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-violet-800/50 text-violet-300 font-semibold text-xs border border-violet-600/30">
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
            ))}
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
