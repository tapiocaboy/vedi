import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { CurrentDasha, DashaPeriod, PlanetPosition } from '../../types/astrology';
import { RASHIS, RASHI_ENGLISH, PLANET_SYMBOLS, planetDisplayColor } from '../../types/astrology';
import { HouseDetailPanel } from './HouseDetailPanel';
import { useTheme } from '../../hooks/useTheme';
import { useLang } from '../../i18n/LanguageContext';
import { labelPlanet, labelPlanetShort, labelRashi, labelRashiWestern } from '../../i18n/astroLabels';

const ACCENT = 'var(--c-accent)';

interface Props {
  planets: PlanetPosition[];
  ascendantRashi: number;
  /** Passed through to the house panel so planet pairs can be timed. */
  currentDasha?: CurrentDasha | null;
  mahadashaTimeline?: DashaPeriod[] | null;
  birthDate?: string | null;
}

const RASHI_GRID_POSITIONS: Record<number, [number, number]> = {
  0: [0, 1], 1: [0, 2], 2: [0, 3],
  3: [1, 3], 4: [2, 3], 5: [3, 3],
  6: [3, 2], 7: [3, 1], 8: [3, 0],
  9: [2, 0], 10: [1, 0], 11: [0, 0],
};

// Western zodiac glyph per rashi — used as a watermark in each box.
// U+FE0E forces text (monochrome) presentation so the CSS colour applies
// instead of the platform's multicolour emoji glyph.
const RASHI_GLYPHS = ['♈\uFE0E', '♉\uFE0E', '♊\uFE0E', '♋\uFE0E', '♌\uFE0E', '♍\uFE0E', '♎\uFE0E', '♏\uFE0E', '♐\uFE0E', '♑\uFE0E', '♒\uFE0E', '♓\uFE0E'] as const;

function getCellType(row: number, col: number): 'center' | 'edge' {
  return (row === 1 || row === 2) && (col === 1 || col === 2) ? 'center' : 'edge';
}

function getRashiForPosition(row: number, col: number): number | null {
  for (const [rashi, [r, c]] of Object.entries(RASHI_GRID_POSITIONS)) {
    if (r === row && c === col) return parseInt(rashi);
  }
  return null;
}

export const SouthIndianChart: React.FC<Props> = ({
  planets, ascendantRashi, currentDasha = null, mahadashaTimeline = null, birthDate = null,
}) => {
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
  const lagnaBg     = isLight
    ? 'linear-gradient(135deg, rgba(255,175,97,0.22), rgba(255,175,97,0.10))'
    : 'linear-gradient(135deg, rgba(255,175,97,0.20), rgba(255,175,97,0.06))';
  const cellBgBase  = isLight ? '#ffffff' : 'rgba(255,255,255,0.015)';
  const cellBgSel   = isLight ? 'rgba(255,175,97,0.12)' : 'rgba(255,175,97,0.09)';
  const borderBase  = isLight ? 'rgba(203,213,225,1)'    : 'rgba(255,175,97,0.20)';
  const borderAsc   = isLight ? 'rgba(255,150,50,0.85)'  : 'rgba(255,175,97,0.75)';
  const borderSel   = isLight ? 'rgba(255,150,50,0.6)'   : 'rgba(255,175,97,0.5)';
  const houseNumClr = isLight ? '#475569'                : 'rgba(255,255,255,0.60)';
  const planetClr   = isLight ? '#1e293b'                : 'rgba(255,255,255,0.88)';
  const glyphClr    = isLight ? 'rgba(234,120,20,0.28)'  : 'rgba(255,175,97,0.30)';
  const glyphAscClr = isLight ? 'rgba(234,120,20,0.40)'  : 'rgba(255,175,97,0.45)';
  const gridBorder  = isLight ? 'rgba(255,175,97,0.55)'  : 'rgba(255,175,97,0.40)';
  const gridShadow  = isLight
    ? '0 0 0 1px rgba(255,175,97,0.25), 0 8px 32px rgba(0,0,0,0.10)'
    : '0 0 0 1px rgba(255,175,97,0.12), 0 0 40px rgba(255,175,97,0.10)';

  const renderCell = (row: number, col: number) => {
    if (getCellType(row, col) === 'center') {
      if (row === 1 && col === 1) {
        return (
          <motion.div
            className="flex items-center justify-center h-full"
            style={{ background: lagnaBg, borderRight: `1px solid ${borderBase}`, borderBottom: `1px solid ${borderBase}` }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            <div className="text-center p-2">
              <div className="text-xs font-mono uppercase tracking-wider font-extrabold" style={{ color: ACCENT }}>{t('chart.lagna')}</div>
              <div className="text-base font-extrabold mt-0.5" style={{ color: isLight ? '#0f172a' : '#ffffff' }}>{labelRashi(ascendantRashi, lang, RASHIS[ascendantRashi])}</div>
            </div>
          </motion.div>
        );
      }
      return <div style={{ background: centerBg, border: `1px solid ${borderBase}` }} />;
    }

    const rashiIndex = getRashiForPosition(row, col);
    if (rashiIndex === null) return null;

    const planetsHere = planetsByRashi[rashiIndex];
    const isAscendant = rashiIndex === ascendantRashi;
    const houseNum = rashiToHouse(rashiIndex);
    const isSelected = selectedHouse === houseNum;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: rashiIndex * 0.05, type: 'spring', stiffness: 300, damping: 24 }}
        whileHover={{ scale: 1.04, zIndex: 10 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setSelectedHouse(houseNum)}
        className="relative h-full p-1.5 cursor-pointer select-none overflow-hidden"
        style={{
          border: isAscendant
            ? `1.5px solid ${borderAsc}`
            : isSelected
            ? `1.5px solid ${borderSel}`
            : `1px solid ${borderBase}`,
          background: isAscendant
            ? lagnaBg
            : isSelected
            ? cellBgSel
            : cellBgBase,
          boxShadow: isAscendant
            ? `inset 0 0 18px rgba(255,175,97,${isLight ? '0.12' : '0.10'})`
            : isSelected
            ? `inset 0 0 14px rgba(255,175,97,${isLight ? '0.10' : '0.08'})`
            : undefined,
          transition: 'border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease',
        }}
        title={t('chart.houseTooltip', {
          n: houseNum,
          rashi: labelRashi(rashiIndex, lang, RASHIS[rashiIndex]),
          english: labelRashiWestern(rashiIndex, lang, RASHI_ENGLISH[rashiIndex]),
        })}
      >
        {/* Zodiac glyph watermark — instant sign recognition */}
        <div
          aria-hidden
          className="absolute inset-0 flex items-center justify-center pointer-events-none text-[52px] leading-none font-bold"
          style={{
            color: isAscendant ? glyphAscClr : glyphClr,
            textShadow: isLight ? 'none' : '0 0 14px rgba(255,175,97,0.25)',
          }}
        >
          {RASHI_GLYPHS[rashiIndex]}
        </div>

        {/* House number badge top-left */}
        <div
          className="absolute top-1 left-1 w-[18px] h-[18px] rounded-md flex items-center justify-center text-[10px] font-mono font-extrabold"
          style={{
            color: isAscendant ? '#ffffff' : houseNumClr,
            background: isAscendant
              ? 'rgba(255,150,50,0.9)'
              : isLight ? 'rgba(15,23,42,0.05)' : 'rgba(255,255,255,0.07)',
          }}
        >
          {houseNum}
        </div>

        {/* Ascendant marker */}
        {isAscendant && (
          <motion.div
            className="absolute top-1 right-1 text-xs font-extrabold"
            style={{ color: ACCENT }}
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            ↑
          </motion.div>
        )}

        {/* Planets — colored glyph + short name + degree so each is identifiable at a glance */}
        <div className="relative flex flex-wrap gap-x-1 gap-y-0.5 mt-5 justify-center content-start">
          {planetsHere.map((planet, idx) => {
            const color = planetDisplayColor(planet.planet, isLight);
            return (
              <motion.div
                key={planet.planet}
                initial={{ opacity: 0, y: 8, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.45 + rashiIndex * 0.03 + idx * 0.09, type: 'spring', stiffness: 380, damping: 22 }}
                whileHover={{ scale: 1.12 }}
                className="flex items-baseline gap-[3px] px-1.5 py-0.5 rounded-md leading-none border"
                style={{
                  background: isLight ? '#ffffff' : 'rgba(18,15,26,0.92)',
                  borderColor: isLight ? `${color}44` : `${color}55`,
                  boxShadow: isLight ? `0 1px 4px ${color}22` : `0 0 8px ${color}22`,
                }}
                title={`${labelPlanet(planet.planet, lang)}: ${planet.rashiDegree.toFixed(2)}°${planet.isRetrograde ? ' ℞' : ''}`}
              >
                <span className="text-[15px] font-extrabold" style={{ color, textShadow: isLight ? 'none' : `0 0 8px ${color}88` }}>
                  {PLANET_SYMBOLS[planet.planet] || planet.planet.slice(0, 2)}
                </span>
                <span className="text-[10px] font-bold" style={{ color: planetClr }}>
                  {labelPlanetShort(planet.planet, lang)}
                </span>
                <span className="text-[9px] font-mono font-semibold" style={{ color: isLight ? '#64748b' : 'rgba(255,255,255,0.60)' }}>
                  {Math.floor(planet.rashiDegree)}°
                </span>
                {planet.isRetrograde && <span className="text-[9px] font-extrabold" style={{ color: '#e11d48' }}>℞</span>}
              </motion.div>
            );
          })}
        </div>

        {/* Rashi name bottom */}
        <div className="absolute bottom-1 left-0 right-0 text-center text-[10px] truncate px-1 font-mono font-bold"
          style={{ color: isLight ? '#475569' : 'rgba(255,255,255,0.60)' }}>
          {labelRashi(rashiIndex, lang, RASHIS[rashiIndex])}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="w-full max-w-lg mx-auto">
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

      {/* Legend — same colors as the chart cells */}
      <div className="mt-4 flex flex-wrap justify-center gap-3 text-sm" style={{ color: isLight ? '#1e293b' : 'rgba(255,255,255,0.85)' }}>
        {Object.entries(PLANET_SYMBOLS).map(([planet, symbol]) => (
          <div key={planet} className="flex items-center gap-1.5">
            <span className="text-base font-bold" style={{ color: planetDisplayColor(planet, isLight) }}>{symbol}</span>
            <span className="font-bold">{labelPlanet(planet, lang)}</span>
          </div>
        ))}
      </div>

      <HouseDetailPanel
        houseNumber={selectedHouse}
        ascendantRashiIndex={ascendantRashi}
        planets={planets}
        currentDasha={currentDasha}
        mahadashaTimeline={mahadashaTimeline}
        birthDate={birthDate}
        onClose={() => setSelectedHouse(null)}
      />
    </div>
  );
};
