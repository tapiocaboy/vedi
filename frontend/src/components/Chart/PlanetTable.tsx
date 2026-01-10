/**
 * Planet positions table component
 */

import React from 'react';
import { motion } from 'framer-motion';
import type { PlanetPosition } from '../../types/astrology';
import { PLANET_SYMBOLS, PLANET_COLORS } from '../../types/astrology';
import { formatDegree } from '../../utils/dateUtils';

interface Props {
  planets: PlanetPosition[];
  ascendant: PlanetPosition;
}

export const PlanetTable: React.FC<Props> = ({ planets, ascendant }) => {
  const allPositions = [...planets, { ...ascendant, planet: 'ASCENDANT' }];

  return (
    <div className="overflow-x-auto">
      <motion.table 
        className="w-full text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <thead>
          <tr className="bg-gradient-to-r from-cyber-700 to-cyber-600 text-white">
            <th className="px-4 py-3 text-left rounded-tl-lg font-medium">Planet</th>
            <th className="px-4 py-3 text-left font-medium">Rashi</th>
            <th className="px-4 py-3 text-left font-medium">Degree</th>
            <th className="px-4 py-3 text-left font-medium">Nakshatra</th>
            <th className="px-4 py-3 text-left font-medium">Pada</th>
            <th className="px-4 py-3 text-center rounded-tr-lg font-medium">R</th>
          </tr>
        </thead>
        <tbody>
          {allPositions.map((planet, idx) => (
            <motion.tr
              key={planet.planet}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`
                border-b border-slate-700/50
                ${idx % 2 === 0 ? 'bg-slate-800/30' : 'bg-slate-800/10'}
                hover:bg-cyber-900/30 transition-colors
              `}
            >
              <td className="px-4 py-3 font-medium">
                <div className="flex items-center gap-2">
                  <span 
                    className="text-lg"
                    style={{ color: PLANET_COLORS[planet.planet] }}
                  >
                    {PLANET_SYMBOLS[planet.planet]}
                  </span>
                  <span className="text-white">{planet.planet}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-slate-300">
                {planet.rashi}
                <span className="text-slate-500 text-xs ml-1 font-mono">
                  ({planet.rashiIndex + 1})
                </span>
              </td>
              <td className="px-4 py-3 font-mono text-cyber-400">
                {formatDegree(planet.rashiDegree)}
              </td>
              <td className="px-4 py-3 text-slate-300">
                {planet.nakshatra}
              </td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-cyber-800/50 text-cyber-300 font-semibold text-xs border border-cyber-600/30">
                  {planet.nakshatraPada}
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                {planet.isRetrograde && (
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-pink-500/20 text-pink-400 font-bold text-xs border border-pink-500/30">
                    R
                  </span>
                )}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </motion.table>
    </div>
  );
};
