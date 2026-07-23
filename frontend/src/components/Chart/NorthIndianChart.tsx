import { useState } from 'react';
import { motion } from 'framer-motion';
import type { PlanetPosition } from '../../types/astrology';
import { RASHIS, PLANET_SYMBOLS, planetDisplayColor } from '../../types/astrology';
import { HouseDetailPanel } from './HouseDetailPanel';
import { useTheme } from '../../hooks/useTheme';
import { useLang } from '../../i18n/LanguageContext';
import { labelPlanet, labelPlanetShort, labelRashi } from '../../i18n/astroLabels';

const ACCENT = 'var(--c-accent)';

interface Props {
  planets: PlanetPosition[];
  ascendantRashi: number;
}

const HOUSE_POLYGONS: Record<number, string> = {
  1:  '50,0 100,0 100,50 75,25 50,50',
  2:  '100,0 150,0 100,50',
  3:  '150,0 150,50 100,50',
  4:  '150,50 150,100 100,100 100,50',
  5:  '150,100 150,150 100,100',
  6:  '150,150 100,150 100,100',
  7:  '100,150 50,150 50,100 75,125 100,100',
  8:  '50,150 0,150 50,100',
  9:  '0,150 0,100 50,100',
  10: '0,100 0,50 50,50 50,100',
  11: '0,50 0,0 50,50',
  12: '0,0 50,0 50,50',
};

const HOUSE_TEXT: Record<number, [number, number]> = {
  1:  [75, 20], 2:  [118, 18], 3:  [133, 38],
  4:  [125, 75], 5:  [133, 118], 6:  [118, 133],
  7:  [75, 135], 8:  [32, 133], 9:  [18, 118],
  10: [25, 75], 11: [18, 32], 12: [32, 18],
};

const PLANET_TEXT: Record<number, [number, number]> = {
  1:  [75, 32], 2:  [118, 30], 3:  [133, 52],
  4:  [122, 75], 5:  [133, 105], 6:  [118, 122],
  7:  [75, 125], 8:  [32, 122], 9:  [18, 105],
  10: [28, 75], 11: [18, 52], 12: [32, 30],
};

export const NorthIndianChart: React.FC<Props> = ({ planets, ascendantRashi }) => {
  const [selectedHouse, setSelectedHouse] = useState<number | null>(null);
  const isLight = useTheme();
  const { lang, t } = useLang();

  const planetsByHouse: Record<number, PlanetPosition[]> = {};
  for (let i = 1; i <= 12; i++) planetsByHouse[i] = [];
  planets.forEach(p => {
    const house = ((p.rashiIndex - ascendantRashi + 12) % 12) + 1;
    planetsByHouse[house].push(p);
  });

  const rashiForHouse = (h: number) => (ascendantRashi + h - 1) % 12;

  // Theme tokens
  const svgBg       = isLight ? '#F4F7F9' : '#080810';
  const centerBg    = isLight ? '#e8edf3' : '#10101a';
  const lineStroke  = isLight ? 'rgba(100,116,139,0.35)' : 'rgba(255,175,97,0.35)';
  const outerBorder = ACCENT;
  const houseNumClr = (h: number) => h === 1 ? ACCENT : (isLight ? '#1e293b' : 'rgba(255,255,255,0.65)');
  const planetFill  = (retro: boolean) => retro ? '#e11d48' : (isLight ? '#1e293b' : 'rgba(255,255,255,0.85)');
  const ascLabelClr = ACCENT;
  const ascRashiClr = isLight ? '#0f172a' : '#ffffff';


  const fillForHouse = (house: number, selected: boolean) => {
    if (selected) return isLight ? 'rgba(255,175,97,0.22)' : 'rgba(255,175,97,0.20)';
    if (house === 1) return isLight ? 'rgba(255,175,97,0.18)' : 'rgba(255,175,97,0.16)';
    if (planetsByHouse[house].length > 0) return isLight ? 'rgba(255,175,97,0.06)' : 'rgba(255,175,97,0.05)';
    return 'transparent';
  };

  const hoverFill = isLight ? 'rgba(255,175,97,0.14)' : 'rgba(255,175,97,0.14)';

  return (
    <div className="w-full max-w-md mx-auto">
      <p
        className="text-sm font-bold mb-4 text-center tracking-wide"
        style={{ color: isLight ? '#1e293b' : '#ffffff' }}
      >
        {t('chart.clickHouseHint')}
      </p>

      <svg viewBox="0 0 150 150" className="w-full h-auto"
        style={{ filter: `drop-shadow(0 4px 20px rgba(255,175,97,${isLight ? '0.12' : '0.20'}))` }}>

        <rect x="0" y="0" width="150" height="150" fill={svgBg} rx="8" />

        <rect x="0" y="0" width="150" height="150" fill="none"
          stroke={outerBorder} strokeWidth="1.5" rx="8"
          style={{ filter: `drop-shadow(0 0 8px rgba(255,175,97,${isLight ? '0.25' : '0.40'}))` }}
        />

        {/* Structure lines */}
        {[
          '0,0 50,50', '150,0 100,50', '0,150 50,100', '150,150 100,100',
          '50,0 50,50', '100,0 100,50', '50,100 50,150', '100,100 100,150',
          '0,50 50,50', '100,50 150,50', '0,100 50,100', '100,100 150,100',
        ].map((pts, i) => {
          const [x1y1, x2y2] = pts.split(' ');
          const [x1, y1] = x1y1.split(',').map(Number);
          const [x2, y2] = x2y2.split(',').map(Number);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={lineStroke} strokeWidth="0.5" />;
        })}

        {/* Center diamond */}
        <polygon points="50,50 100,50 100,100 50,100"
          fill={centerBg} stroke={lineStroke} strokeWidth="0.5" />

        {/* Clickable house regions */}
        {Array.from({ length: 12 }, (_, i) => i + 1).map(house => {
          const isSelected = selectedHouse === house;
          return (
            <polygon
              key={house}
              points={HOUSE_POLYGONS[house]}
              fill={fillForHouse(house, isSelected)}
              stroke="transparent"
              strokeWidth="4"
              className="cursor-pointer"
              style={{ transition: 'fill 0.15s' }}
              onClick={() => setSelectedHouse(house)}
              onMouseEnter={e => (e.target as SVGElement).setAttribute('fill', hoverFill)}
              onMouseLeave={e => (e.target as SVGElement).setAttribute('fill', fillForHouse(house, isSelected))}
            />
          );
        })}

        {/* House rashi numbers */}
        {Array.from({ length: 12 }, (_, i) => i + 1).map(house => {
          const [tx, ty] = HOUSE_TEXT[house];
          const rashi = rashiForHouse(house);
          return (
            <text key={house} x={tx} y={ty} textAnchor="middle"
              fill={houseNumClr(house)}
              fontSize="9" fontWeight="800" fontFamily="monospace"
              className="pointer-events-none select-none">
              {rashi + 1}
            </text>
          );
        })}

        {/* Planets per house — colored glyph + short name so each is identifiable */}
        {Array.from({ length: 12 }, (_, i) => i + 1).map(house => {
          const [px, py] = PLANET_TEXT[house];
          return planetsByHouse[house].map((planet, idx) => {
            const color = planetDisplayColor(planet.planet, isLight);
            return (
              <motion.text
                key={planet.planet}
                x={px} y={py + idx * 9.5}
                textAnchor="middle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 + idx * 0.08 }}
                fontSize="8.5" fontWeight="900"
                fontFamily="monospace"
                className="select-none si-svg-label-s"
                style={{ paintOrder: 'stroke', stroke: isLight ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.55)', strokeWidth: 0.6 }}
              >
                <title>{`${labelPlanet(planet.planet, lang)}: ${planet.rashiDegree.toFixed(2)}°${planet.isRetrograde ? ' ℞' : ''}`}</title>
                <tspan fill={color}>{PLANET_SYMBOLS[planet.planet] || ''}</tspan>
                <tspan dx="1" fill={planetFill(false)}>{labelPlanetShort(planet.planet, lang)}</tspan>
                {planet.isRetrograde && <tspan dx="0.5" fontSize="6" fill="#e11d48">℞</tspan>}
              </motion.text>
            );
          });
        })}

        {/* Center ASC label */}
        <text x="75" y="70" textAnchor="middle" fontSize="10"
          fill={ascLabelClr} fontFamily="monospace" fontWeight="900"
          className="pointer-events-none select-none si-svg-label-s">
          {t('chart.ascAbbrev')}
        </text>
        <text x="75" y="84" textAnchor="middle" fontSize="11" fontWeight="900"
          fill={ascRashiClr} className="pointer-events-none select-none si-svg-label">
          {labelRashi(ascendantRashi, lang, RASHIS[ascendantRashi])}
        </text>
      </svg>

      {/* Legend — same colors as the chart */}
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
        onClose={() => setSelectedHouse(null)}
      />
    </div>
  );
};
