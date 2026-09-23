import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { CurrentDasha, DashaPeriod, PlanetPosition } from '../../types/astrology';
import { RASHIS, RASHI_ENGLISH, PLANET_SYMBOLS, planetDisplayColor } from '../../types/astrology';
import { HouseDetailPanel } from './HouseDetailPanel';
import { useTheme } from '../../hooks/useTheme';
import { useLang } from '../../i18n/LanguageContext';
import { labelPlanet, labelPlanetShort, labelRashi, labelRashiWestern } from '../../i18n/astroLabels';
import { TapHint, tapVars } from '../shared/tapTarget';
import { ZodiacSymbol } from '../shared/ZodiacSymbol';

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
  // Dark surfaces mix from the theme's own page colour so Terminal, Chalkboard
  // and the default dark each get cells in their own tone.
  const lagnaBg     = isLight ? '#fff6ec' : 'color-mix(in srgb, var(--bg-page), rgb(255,175,97) 7%)';
  const cellBgBase  = isLight ? '#ffffff' : 'color-mix(in srgb, var(--bg-page), #ffffff 3%)';
  const cellBgSel   = isLight ? '#fff4e8' : 'color-mix(in srgb, var(--bg-page), rgb(255,175,97) 11%)';
  const lineClr     = isLight ? 'rgba(148,163,184,0.45)' : 'rgba(255,175,97,0.16)';
  const ascRing     = isLight ? 'rgba(234,120,20,0.75)'  : 'rgba(255,175,97,0.70)';
  const selRing     = isLight ? 'rgba(234,120,20,0.45)'  : 'rgba(255,175,97,0.40)';
  const houseNumClr = isLight ? '#64748b'                : 'rgba(255,255,255,0.50)';
  const planetClr   = isLight ? '#1e293b'                : 'rgba(255,255,255,0.88)';
  const glyphClr    = isLight ? 'rgba(234,120,20,0.16)'  : 'rgba(255,175,97,0.14)';
  const glyphAscClr = isLight ? 'rgba(234,120,20,0.30)'  : 'rgba(255,175,97,0.28)';
  const gridShadow  = isLight
    ? '0 1px 2px rgba(15,23,42,0.06), 0 12px 32px -12px rgba(15,23,42,0.18)'
    : '0 12px 40px -12px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,175,97,0.10)';

  // The four middle squares are one space in the South Indian chart — the
  // centre panel spans them rather than filling one and leaving three blank.
  const renderCentre = () => {
    const lagnaPlanets = planetsByRashi[ascendantRashi];
    return (
      <motion.div
        className="flex flex-col items-center justify-center text-center p-3"
        style={{
          gridRow: '2 / 4', gridColumn: '2 / 4',
          background: isLight
            ? 'radial-gradient(circle at 50% 45%, #fff7ee 0%, #ffffff 70%)'
            : 'radial-gradient(circle at 50% 45%, color-mix(in srgb, var(--bg-page), rgb(255,175,97) 8%) 0%, var(--bg-page) 75%)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <ZodiacSymbol
          index={ascendantRashi}
          color={isLight ? 'rgba(234,120,20,0.85)' : 'rgba(255,220,160,0.92)'}
          className="w-[4.5rem] h-[4.5rem] sm:w-24 sm:h-24"
          title={labelRashiWestern(ascendantRashi, lang, RASHI_ENGLISH[ascendantRashi])}
        />
        <div className="mt-2 text-[10px] font-mono uppercase tracking-[0.2em] font-bold" style={{ color: ACCENT }}>
          {t('chart.lagna')}
        </div>
        <div className="text-lg font-extrabold leading-tight" style={{ color: isLight ? '#0f172a' : '#ffffff' }}>
          {labelRashi(ascendantRashi, lang, RASHIS[ascendantRashi])}
        </div>
        <div className="text-[11px] font-medium" style={{ color: houseNumClr }}>
          {labelRashiWestern(ascendantRashi, lang, RASHI_ENGLISH[ascendantRashi])}
          {lagnaPlanets.length > 0 && ` · ${lagnaPlanets.map(p => PLANET_SYMBOLS[p.planet] ?? '').join(' ')}`}
        </div>
      </motion.div>
    );
  };

  const renderCell = (rashiIndex: number) => {
    const [row, col] = RASHI_GRID_POSITIONS[rashiIndex];
    const planetsHere = planetsByRashi[rashiIndex];
    const isAscendant = rashiIndex === ascendantRashi;
    const houseNum = rashiToHouse(rashiIndex);
    const isSelected = selectedHouse === houseNum;

    return (
      <motion.div
        key={rashiIndex}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: rashiIndex * 0.03, duration: 0.3 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setSelectedHouse(houseNum)}
        role="button"
        tabIndex={0}
        data-open={isSelected}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedHouse(houseNum); } }}
        className="tap-row tap-cell tap-blink relative aspect-square py-1.5 pl-2 pr-1.5 select-none overflow-hidden"
        style={{
          gridRow: row + 1, gridColumn: col + 1,
          ...tapVars(undefined, isSelected ? cellBgSel : isAscendant ? lagnaBg : cellBgBase),
          boxShadow: isAscendant
            ? `inset 0 0 0 1.5px ${ascRing}`
            : isSelected
            ? `inset 0 0 0 1.5px ${selRing}`
            : undefined,
        }}
        title={t('chart.houseTooltip', {
          n: houseNum,
          rashi: labelRashi(rashiIndex, lang, RASHIS[rashiIndex]),
          english: labelRashiWestern(rashiIndex, lang, RASHI_ENGLISH[rashiIndex]),
        })}
      >
        {/* Zodiac glyph watermark — instant sign recognition */}
        <ZodiacSymbol
          index={rashiIndex}
          color={isAscendant ? glyphAscClr : glyphClr}
          className="absolute inset-[18%] pointer-events-none"
        />

        {/* House number badge top-left */}
        <div
          className="absolute top-1.5 left-1.5 min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-[10px] font-mono font-bold"
          style={{
            color: isAscendant ? '#ffffff' : houseNumClr,
            background: isAscendant
              ? 'rgb(234,120,20)'
              : isLight ? 'rgba(15,23,42,0.05)' : 'rgba(255,255,255,0.06)',
          }}
        >
          {houseNum}
        </div>

        {isAscendant && (
          <div className="absolute top-1.5 right-1.5 text-[9px] font-mono font-bold uppercase tracking-wider"
            style={{ color: ACCENT }}>
            Asc
          </div>
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
                className="flex items-baseline gap-[3px] px-1.5 py-0.5 rounded-full leading-none border"
                style={{
                  background: isLight ? '#ffffff' : 'rgba(18,15,26,0.92)',
                  borderColor: isLight ? `${color}40` : `${color}50`,
                  boxShadow: isLight ? '0 1px 2px rgba(15,23,42,0.06)' : undefined,
                }}
                title={`${labelPlanet(planet.planet, lang)}: ${planet.rashiDegree.toFixed(2)}°${planet.isRetrograde ? ' ℞' : ''}`}
              >
                <span className="text-[14px] font-extrabold" style={{ color }}>
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
        <div className="absolute bottom-1.5 left-0 right-0 text-center text-[10px] truncate px-1 font-medium tracking-wide"
          style={{ color: isLight ? '#64748b' : 'rgba(255,255,255,0.50)' }}>
          {labelRashi(rashiIndex, lang, RASHIS[rashiIndex])}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <p
        className="text-sm font-bold mb-4 flex items-center justify-center gap-2 flex-wrap tracking-wide"
        style={{ color: isLight ? '#1e293b' : '#ffffff' }}
      >
        {t('chart.clickHouseHint')}
        <TapHint label={t('common.tapToOpen')} />
      </p>
      {/* A 1px gap over a line-coloured backing draws every grid line once,
          at one weight — per-cell borders doubled up into 2px seams. */}
      <div className="grid grid-cols-4 grid-rows-4 gap-px rounded-2xl overflow-hidden aspect-square p-px"
        style={{ background: lineClr, boxShadow: gridShadow }}>
        {Array.from({ length: 12 }, (_, i) => renderCell(i))}
        {renderCentre()}
      </div>

      {/* Legend — same colors as the chart cells */}
      <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-xs font-medium" style={{ color: isLight ? '#475569' : 'rgba(255,255,255,0.70)' }}>
        {Object.entries(PLANET_SYMBOLS).map(([planet, symbol]) => (
          <div key={planet} className="flex items-center gap-1">
            <span className="text-sm font-bold" style={{ color: planetDisplayColor(planet, isLight) }}>{symbol}</span>
            <span>{labelPlanet(planet, lang)}</span>
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
