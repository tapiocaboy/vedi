/**
 * South Indian style Vedic birth chart visualization
 */

import React from 'react';
import { motion } from 'framer-motion';
import type { PlanetPosition } from '../../types/astrology';
import { RASHIS, RASHI_ENGLISH, PLANET_SYMBOLS } from '../../types/astrology';

interface Props {
  planets: PlanetPosition[];
  ascendantRashi: number;
}

// South Indian chart: Fixed positions for each rashi
// The grid is 4x4, outer ring only (inner 2x2 is empty/info)
const RASHI_GRID_POSITIONS: Record<number, [number, number]> = {
  0: [0, 1],  // Mesha - top row, 2nd from left
  1: [0, 2],  // Vrishabha
  2: [0, 3],  // Mithuna
  3: [1, 3],  // Karka - right column
  4: [2, 3],  // Simha
  5: [3, 3],  // Kanya
  6: [3, 2],  // Tula - bottom row
  7: [3, 1],  // Vrischika
  8: [3, 0],  // Dhanu
  9: [2, 0],  // Makara - left column
  10: [1, 0], // Kumbha
  11: [0, 0], // Meena
};

// Determine cell type based on position
function getCellType(row: number, col: number): 'corner' | 'edge' | 'center' {
  if ((row === 1 || row === 2) && (col === 1 || col === 2)) {
    return 'center';
  }
  return 'edge';
}

// Get rashi index for a grid position
function getRashiForPosition(row: number, col: number): number | null {
  for (const [rashi, [r, c]] of Object.entries(RASHI_GRID_POSITIONS)) {
    if (r === row && c === col) {
      return parseInt(rashi);
    }
  }
  return null;
}

export const SouthIndianChart: React.FC<Props> = ({ planets, ascendantRashi }) => {
  // Group planets by rashi
  const planetsByRashi: Record<number, PlanetPosition[]> = {};
  for (let i = 0; i < 12; i++) {
    planetsByRashi[i] = [];
  }
  planets.forEach(p => {
    if (p.rashiIndex >= 0 && p.rashiIndex < 12) {
      planetsByRashi[p.rashiIndex].push(p);
    }
  });

  // Render a house cell
  const renderCell = (row: number, col: number) => {
    const cellType = getCellType(row, col);
    const rashiIndex = getRashiForPosition(row, col);
    
    // Center cells - show chart info
    if (cellType === 'center') {
      if (row === 1 && col === 1) {
        return (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-saffron-50 to-maroon-50">
            <div className="text-center p-2">
              <div className="text-xs text-maroon-600 font-medium">Lagna</div>
              <div className="text-sm font-bold text-maroon-800">{RASHIS[ascendantRashi]}</div>
            </div>
          </div>
        );
      }
      return <div className="bg-gradient-to-br from-saffron-50 to-maroon-50" />;
    }

    if (rashiIndex === null) return null;

    const planetsHere = planetsByRashi[rashiIndex];
    const isAscendant = rashiIndex === ascendantRashi;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: rashiIndex * 0.05 }}
        className={`
          relative h-full p-1.5 border border-saffron-300
          ${isAscendant ? 'bg-saffron-100 ring-2 ring-saffron-400' : 'bg-white/90'}
          hover:bg-saffron-50 transition-colors cursor-pointer
        `}
        title={`${RASHIS[rashiIndex]} (${RASHI_ENGLISH[rashiIndex]})`}
      >
        {/* Rashi number/name */}
        <div className="absolute top-0.5 left-1 text-[10px] text-maroon-400 font-medium">
          {rashiIndex + 1}
        </div>
        
        {/* Ascendant marker */}
        {isAscendant && (
          <div className="absolute top-0.5 right-1 text-[10px] text-saffron-600 font-bold">
            ↑
          </div>
        )}

        {/* Planets */}
        <div className="flex flex-wrap gap-0.5 mt-3 justify-center">
          {planetsHere.map((planet, idx) => (
            <motion.div
              key={planet.planet}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + idx * 0.1 }}
              className={`
                text-xs font-semibold px-1 py-0.5 rounded
                ${planet.isRetrograde ? 'text-red-600' : 'text-maroon-700'}
              `}
              title={`${planet.planet}: ${planet.rashiDegree.toFixed(2)}° ${planet.isRetrograde ? '(R)' : ''}`}
            >
              {PLANET_SYMBOLS[planet.planet] || planet.planet.slice(0, 2)}
              {planet.isRetrograde && <span className="text-[8px]">ᴿ</span>}
            </motion.div>
          ))}
        </div>

        {/* Rashi name at bottom */}
        <div className="absolute bottom-0.5 left-0 right-0 text-center text-[8px] text-gray-500 truncate px-1">
          {RASHIS[rashiIndex]}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="grid grid-cols-4 gap-0 border-2 border-maroon-600 rounded-lg overflow-hidden shadow-lg aspect-square">
        {[0, 1, 2, 3].map(row => (
          <React.Fragment key={row}>
            {[0, 1, 2, 3].map(col => (
              <div key={`${row}-${col}`} className="aspect-square">
                {renderCell(row, col)}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
      
      {/* Legend */}
      <div className="mt-4 flex flex-wrap justify-center gap-3 text-xs text-gray-600">
        {Object.entries(PLANET_SYMBOLS).map(([planet, symbol]) => (
          <div key={planet} className="flex items-center gap-1">
            <span className="font-bold text-maroon-600">{symbol}</span>
            <span>{planet}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

