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
          <tr className="bg-gradient-to-r from-maroon-600 to-maroon-700 text-white">
            <th className="px-4 py-3 text-left rounded-tl-lg">Planet</th>
            <th className="px-4 py-3 text-left">Rashi</th>
            <th className="px-4 py-3 text-left">Degree</th>
            <th className="px-4 py-3 text-left">Nakshatra</th>
            <th className="px-4 py-3 text-left">Pada</th>
            <th className="px-4 py-3 text-center rounded-tr-lg">R</th>
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
                border-b border-saffron-100
                ${idx % 2 === 0 ? 'bg-white' : 'bg-saffron-50/50'}
                hover:bg-saffron-100/50 transition-colors
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
                  <span className="text-maroon-700">{planet.planet}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-gray-700">
                {planet.rashi}
                <span className="text-gray-400 text-xs ml-1">
                  ({planet.rashiIndex + 1})
                </span>
              </td>
              <td className="px-4 py-3 font-mono text-gray-600">
                {formatDegree(planet.rashiDegree)}
              </td>
              <td className="px-4 py-3 text-gray-700">
                {planet.nakshatra}
              </td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-saffron-200 text-saffron-800 font-semibold text-xs">
                  {planet.nakshatraPada}
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                {planet.isRetrograde && (
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-600 font-bold text-xs">
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

