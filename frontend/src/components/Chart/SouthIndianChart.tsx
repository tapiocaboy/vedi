import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { PlanetPosition } from '../../types/astrology';
import { RASHIS, RASHI_ENGLISH, PLANET_SYMBOLS } from '../../types/astrology';
import { HouseDetailPanel } from './HouseDetailPanel';
import { useTheme } from '../../hooks/useTheme';
import { useLang } from '../../i18n/LanguageContext';
import { labelPlanet, labelRashi, labelRashiWestern } from '../../i18n/astroLabels';

const ACCENT = 'var(--c-accent)';

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
  const isLight = useTheme();
  const { lang, t } = useLang();

  const planetsByRashi: Record<number, PlanetPosition[]> = {};
  for (let i = 0; i < 12; i++) planetsByRashi[i] = [];
  planets.forEach(p => {
    if (p.rashiIndex >= 0 && p.rashiIndex < 12) planetsByRashi[p.rashiIndex].push(p);
  });

  const rashiToHouse = (rashiIndex: number) =>
    ((rashiIndex - ascendantRashi + 12) % 12) + 1;

  // Theme-aware tokens
  const centerBg    = isLight ? '#f1f5f9' : 'rgba(10,5,20,0.92)';
  const lagnaBg     = isLight ? 'rgba(255,175,97,0.18)' : 'rgba(255,175,97,0.14)';
  const cellBgBase  = isLight ? '#ffffff' : 'rgba(255,255,255,0.015)';
  const cellBgSel   = isLight ? 'rgba(255,175,97,0.12)' : 'rgba(255,175,97,0.08)';
  const borderBase  = isLight ? 'rgba(209,220,229,0.9)' : 'rgba(255,175,97,0.12)';
  const borderAsc   = isLight ? 'rgba(255,175,97,0.7)'  : 'rgba(255,175,97,0.55)';
  const borderSel   = isLight ? 'rgba(255,175,97,0.5)'  : 'rgba(255,175,97,0.35)';
  const houseNumClr = isLight ? '#334155'                : 'rgba(255,255,255,0.55)';
  const planetClr   = isLight ? '#1e293b'                : 'rgba(255,255,255,0.82)';
  const gridBorder  = isLight ? 'rgba(255,175,97,0.45)'  : 'rgba(255,175,97,0.3)';
  const gridShadow  = isLight ? '0 0 0 1px rgba(255,175,97,0.2), 0 4px 20px rgba(0,0,0,0.08)' : '0 0 30px rgba(255,175,97,0.08)';

  const renderCell = (row: number, col: number) => {
    if (getCellType(row, col) === 'center') {
      if (row === 1 && col === 1) {
        return (
          <div className="flex items-center justify-center h-full" style={{ background: lagnaBg, borderRight: `1px solid ${borderBase}`, borderBottom: `1px solid ${borderBase}` }}>
            <div className="text-center p-2">
              <div className="text-xs font-mono uppercase tracking-wider font-extrabold" style={{ color: ACCENT }}>{t('chart.lagna')}</div>
              <div className="text-base font-extrabold mt-0.5" style={{ color: isLight ? '#0f172a' : '#ffffff' }}>{labelRashi(ascendantRashi, lang, RASHIS[ascendantRashi])}</div>
            </div>
          </div>
        );
      }
      return <div style={{ background: centerBg, border: `1px solid ${borderBase}` }} />;
    }

    const rashiIndex = getRashiForPosition(row, col);
    if (rashiIndex === null) return null;

    const planetsHere = planetsByRashi[rashiIndex];
    const isAscendant = rashiIndex === ascendantRashi;
    const houseNum = rashiToHouse(rashiIndex);

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: rashiIndex * 0.04 }}
        onClick={() => setSelectedHouse(houseNum)}
        className="relative h-full p-1.5 cursor-pointer transition-all duration-150 select-none"
        style={{
          border: isAscendant
            ? `1.5px solid ${borderAsc}`
            : selectedHouse === houseNum
            ? `1.5px solid ${borderSel}`
            : `1px solid ${borderBase}`,
          background: isAscendant
            ? isLight ? 'rgba(255,175,97,0.15)' : 'rgba(255,175,97,0.14)'
            : selectedHouse === houseNum
            ? cellBgSel
            : cellBgBase,
        }}
        title={t('chart.houseTooltip', {
          n: houseNum,
          rashi: labelRashi(rashiIndex, lang, RASHIS[rashiIndex]),
          english: labelRashiWestern(rashiIndex, lang, RASHI_ENGLISH[rashiIndex]),
        })}
      >
        {/* House number top-left */}
        <div className="absolute top-0.5 left-1 text-xs font-mono font-extrabold"
          style={{ color: isAscendant ? ACCENT : houseNumClr }}>
          {houseNum}
        </div>

        {/* Ascendant marker */}
        {isAscendant && (
          <div className="absolute top-0.5 right-1 text-xs font-extrabold" style={{ color: ACCENT }}>↑</div>
        )}

        {/* Planets */}
        <div className="flex flex-wrap gap-0.5 mt-3 justify-center">
          {planetsHere.map((planet, idx) => (
            <motion.div
              key={planet.planet}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + idx * 0.08 }}
              className="text-[15px] font-extrabold px-0.5 rounded"
              style={{ color: planet.isRetrograde ? '#e11d48' : planetClr, textShadow: '0 0 5px rgba(0,0,0,0.35)' }}
              title={`${labelPlanet(planet.planet, lang)}: ${planet.rashiDegree.toFixed(2)}°${planet.isRetrograde ? ' ℞' : ''}`}
            >
              {PLANET_SYMBOLS[planet.planet] || planet.planet.slice(0, 2)}
              {planet.isRetrograde && <span className="text-[8px] font-bold">℞</span>}
            </motion.div>
          ))}
        </div>

        {/* Rashi name bottom */}
        <div className="absolute bottom-0.5 left-0 right-0 text-center text-[10px] truncate px-1 font-mono font-bold"
          style={{ color: isLight ? '#475569' : 'rgba(255,255,255,0.55)' }}>
          {labelRashi(rashiIndex, lang, RASHIS[rashiIndex])}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <p
        className="text-sm font-bold mb-4 text-center tracking-wide"
        style={{ color: isLight ? '#1e293b' : '#ffffff' }}
      >
        {t('chart.clickHouseHint')}
      </p>
      <div className="grid grid-cols-4 gap-0 rounded-xl overflow-hidden aspect-square"
        style={{ border: `1px solid ${gridBorder}`, boxShadow: gridShadow }}>
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
      <div className="mt-4 flex flex-wrap justify-center gap-3 text-sm" style={{ color: isLight ? '#1e293b' : 'rgba(255,255,255,0.85)' }}>
        {Object.entries(PLANET_SYMBOLS).map(([planet, symbol]) => (
          <div key={planet} className="flex items-center gap-1.5">
            <span className="text-base font-bold" style={{ color: ACCENT, textShadow: `0 0 6px rgba(var(--c-accent-rgb),0.27)` }}>{symbol}</span>
            <span className="font-bold">{labelPlanet(planet, lang)}</span>
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
