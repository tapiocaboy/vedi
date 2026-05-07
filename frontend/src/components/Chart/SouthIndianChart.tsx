import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { PlanetPosition } from '../../types/astrology';
import { RASHIS, RASHI_ENGLISH, PLANET_SYMBOLS } from '../../types/astrology';
import { HouseDetailPanel } from './HouseDetailPanel';

interface Props {
  planets: PlanetPosition[];
  ascendantRashi: number;
}

const RASHI_GRID_POSITIONS: Record<number, [number, number]> = {
  0: [0, 1], 1: [0, 2], 2: [0, 3],
  3: [1, 3], 4: [2, 3], 5: [3, 3],
  6: [3, 2], 7: [3, 1], 8: [3, 0],
  9: [2, 0], 10: [1, 0], 11: [0, 0],
};

function getCellType(row: number, col: number): 'center' | 'edge' {
  return (row === 1 || row === 2) && (col === 1 || col === 2) ? 'center' : 'edge';
}

function getRashiForPosition(row: number, col: number): number | null {
  for (const [rashi, [r, c]] of Object.entries(RASHI_GRID_POSITIONS)) {
    if (r === row && c === col) return parseInt(rashi);
  }
  return null;
}

export const SouthIndianChart: React.FC<Props> = ({ planets, ascendantRashi }) => {
  const [selectedHouse, setSelectedHouse] = useState<number | null>(null);

  const planetsByRashi: Record<number, PlanetPosition[]> = {};
  for (let i = 0; i < 12; i++) planetsByRashi[i] = [];
  planets.forEach(p => {
    if (p.rashiIndex >= 0 && p.rashiIndex < 12) planetsByRashi[p.rashiIndex].push(p);
  });

  const rashiToHouse = (rashiIndex: number) =>
    ((rashiIndex - ascendantRashi + 12) % 12) + 1;

  const renderCell = (row: number, col: number) => {
    if (getCellType(row, col) === 'center') {
      if (row === 1 && col === 1) {
        return (
          <div className="flex items-center justify-center h-full" style={{ background: 'rgba(10,5,20,0.9)' }}>
            <div className="text-center p-2">
              <div className="text-[10px] text-violet-400 font-mono uppercase tracking-wider">Lagna</div>
              <div className="text-sm font-bold text-white">{RASHIS[ascendantRashi]}</div>
            </div>
          </div>
        );
      }
      return <div style={{ background: 'rgba(10,5,20,0.9)' }} />;
    }

    const rashiIndex = getRashiForPosition(row, col);
    if (rashiIndex === null) return null;

    const planetsHere = planetsByRashi[rashiIndex];
    const isAscendant = rashiIndex === ascendantRashi;
    const houseNum = rashiToHouse(rashiIndex);

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: rashiIndex * 0.04 }}
        onClick={() => setSelectedHouse(houseNum)}
        className={`relative h-full p-1.5 cursor-pointer transition-all duration-150 select-none
          ${isAscendant
            ? 'ring-1 ring-violet-500/40'
            : ''
          }
          ${selectedHouse === houseNum ? 'ring-1 ring-violet-400/60' : ''}
        `}
        style={{
          border: '1px solid rgba(139,92,246,0.2)',
          background: isAscendant
            ? 'rgba(139,92,246,0.1)'
            : selectedHouse === houseNum
            ? 'rgba(139,92,246,0.08)'
            : 'rgba(255,255,255,0.015)',
        }}
        whileHover={{ backgroundColor: 'rgba(139,92,246,0.07)' }}
        title={`House ${houseNum} — ${RASHIS[rashiIndex]} (${RASHI_ENGLISH[rashiIndex]})`}
      >
        {/* House number top-left */}
        <div className="absolute top-0.5 left-1 text-[9px] text-violet-400/50 font-mono font-bold">
          {houseNum}
        </div>

        {/* Ascendant marker */}
        {isAscendant && (
          <div className="absolute top-0.5 right-1 text-[9px] text-violet-400 font-bold">↑</div>
        )}

        {/* Planets */}
        <div className="flex flex-wrap gap-0.5 mt-3 justify-center">
          {planetsHere.map((planet, idx) => (
            <motion.div
              key={planet.planet}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + idx * 0.08 }}
              className={`text-xs font-semibold px-0.5 rounded
                ${planet.isRetrograde ? 'text-pink-400' : 'text-violet-300'}`}
              title={`${planet.planet}: ${planet.rashiDegree.toFixed(2)}°${planet.isRetrograde ? ' ℞' : ''}`}
            >
              {PLANET_SYMBOLS[planet.planet] || planet.planet.slice(0, 2)}
              {planet.isRetrograde && <span className="text-[7px]">℞</span>}
            </motion.div>
          ))}
        </div>

        {/* Rashi name bottom */}
        <div className="absolute bottom-0.5 left-0 right-0 text-center text-[8px] text-slate-500 truncate px-1 font-mono">
          {RASHIS[rashiIndex]}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <p className="text-[11px] font-mono text-white/25 mb-3 text-center">
        Click any house to see its reading and planets
      </p>
      <div className="grid grid-cols-4 gap-0 rounded-xl overflow-hidden aspect-square"
        style={{ border: '1px solid rgba(139,92,246,0.3)', boxShadow: '0 0 30px rgba(139,92,246,0.1)' }}>
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
      <div className="mt-4 flex flex-wrap justify-center gap-3 text-xs text-slate-500">
        {Object.entries(PLANET_SYMBOLS).map(([planet, symbol]) => (
          <div key={planet} className="flex items-center gap-1">
            <span className="font-bold text-violet-400">{symbol}</span>
            <span>{planet}</span>
          </div>
        ))}
      </div>

      <HouseDetailPanel
        houseNumber={selectedHouse}
        ascendantRashiIndex={ascendantRashi}
        planets={planets}
        onClose={() => setSelectedHouse(null)}
      />
    </div>
  );
};
