import { useState } from 'react';
import { motion } from 'framer-motion';
import type { PlanetPosition } from '../../types/astrology';
import { RASHIS, PLANET_SYMBOLS } from '../../types/astrology';
import { HouseDetailPanel } from './HouseDetailPanel';

interface Props {
  planets: PlanetPosition[];
  ascendantRashi: number;
}

// SVG hit-area polygons for each of the 12 houses in the 150×150 diamond chart
const HOUSE_POLYGONS: Record<number, string> = {
  1:  '50,0 100,0 100,50 75,25 50,50',          // top-center triangle
  2:  '100,0 150,0 100,50',                       // top-right corner
  3:  '150,0 150,50 100,50',                      // right-top edge
  4:  '150,50 150,100 100,100 100,50',            // right-center
  5:  '150,100 150,150 100,100',                  // right-bottom corner
  6:  '150,150 100,150 100,100',                  // bottom-right edge
  7:  '100,150 50,150 50,100 75,125 100,100',     // bottom-center triangle
  8:  '50,150 0,150 50,100',                      // bottom-left corner
  9:  '0,150 0,100 50,100',                       // left-bottom edge
  10: '0,100 0,50 50,50 50,100',                  // left-center
  11: '0,50 0,0 50,50',                           // left-top corner
  12: '0,0 50,0 50,50',                           // top-left edge
};

// Text label positions per house
const HOUSE_TEXT: Record<number, [number, number]> = {
  1:  [75, 20], 2:  [118, 18], 3:  [133, 38],
  4:  [125, 75], 5:  [133, 118], 6:  [118, 133],
  7:  [75, 135], 8:  [32, 133], 9:  [18, 118],
  10: [25, 75], 11: [18, 32], 12: [32, 18],
};

// Planet label positions per house
const PLANET_TEXT: Record<number, [number, number]> = {
  1:  [75, 32], 2:  [118, 30], 3:  [133, 52],
  4:  [122, 75], 5:  [133, 105], 6:  [118, 122],
  7:  [75, 125], 8:  [32, 122], 9:  [18, 105],
  10: [28, 75], 11: [18, 52], 12: [32, 30],
};

export const NorthIndianChart: React.FC<Props> = ({ planets, ascendantRashi }) => {
  const [selectedHouse, setSelectedHouse] = useState<number | null>(null);

  const planetsByHouse: Record<number, PlanetPosition[]> = {};
  for (let i = 1; i <= 12; i++) planetsByHouse[i] = [];
  planets.forEach(p => {
    const house = ((p.rashiIndex - ascendantRashi + 12) % 12) + 1;
    planetsByHouse[house].push(p);
  });

  const rashiForHouse = (h: number) => (ascendantRashi + h - 1) % 12;

  return (
    <div className="w-full max-w-md mx-auto">
      <p className="text-[11px] font-mono text-white/25 mb-3 text-center">
        Click any house to see its reading and planets
      </p>

      <svg viewBox="0 0 150 150" className="w-full h-auto"
        style={{ filter: 'drop-shadow(0 4px 20px rgba(139,92,246,0.25))' }}>

        {/* Background */}
        <rect x="0" y="0" width="150" height="150" fill="#080810" rx="8" />

        {/* Outer border */}
        <rect x="0" y="0" width="150" height="150" fill="none"
          stroke="#8b5cf6" strokeWidth="1.5" rx="8"
          style={{ filter: 'drop-shadow(0 0 8px rgba(139,92,246,0.45))' }}
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
            stroke="#8b5cf6" strokeWidth="0.5" strokeOpacity="0.5" />;
        })}

        {/* Center diamond */}
        <polygon points="50,50 100,50 100,100 50,100"
          fill="#10101a" stroke="#8b5cf6" strokeWidth="0.5" strokeOpacity="0.4" />

        {/* Clickable house regions */}
        {Array.from({ length: 12 }, (_, i) => i + 1).map(house => {
          const isSelected = selectedHouse === house;
          const isAsc = house === 1;
          const hasPlanets = planetsByHouse[house].length > 0;
          return (
            <polygon
              key={house}
              points={HOUSE_POLYGONS[house]}
              fill={isSelected
                ? 'rgba(139,92,246,0.18)'
                : isAsc
                ? 'rgba(139,92,246,0.12)'
                : hasPlanets
                ? 'rgba(139,92,246,0.04)'
                : 'transparent'}
              stroke="transparent"
              strokeWidth="4"
              className="cursor-pointer"
              style={{ transition: 'fill 0.15s' }}
              onClick={() => setSelectedHouse(house)}
              onMouseEnter={e => {
                (e.target as SVGElement).setAttribute('fill', 'rgba(139,92,246,0.15)');
              }}
              onMouseLeave={e => {
                (e.target as SVGElement).setAttribute('fill',
                  isSelected ? 'rgba(139,92,246,0.18)'
                  : isAsc ? 'rgba(139,92,246,0.12)'
                  : hasPlanets ? 'rgba(139,92,246,0.04)'
                  : 'transparent');
              }}
            />
          );
        })}

        {/* House rashi numbers */}
        {Array.from({ length: 12 }, (_, i) => i + 1).map(house => {
          const [tx, ty] = HOUSE_TEXT[house];
          const rashi = rashiForHouse(house);
          return (
            <text key={house} x={tx} y={ty} textAnchor="middle"
              fill={house === 1 ? '#a78bfa' : '#475569'}
              fontSize="7" fontFamily="monospace"
              className="pointer-events-none select-none">
              {rashi + 1}
            </text>
          );
        })}

        {/* Planet symbols per house */}
        {Array.from({ length: 12 }, (_, i) => i + 1).map(house => {
          const [px, py] = PLANET_TEXT[house];
          const planetsHere = planetsByHouse[house];
          return planetsHere.map((planet, idx) => (
            <motion.text
              key={planet.planet}
              x={px}
              y={py + idx * 9}
              textAnchor="middle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 + idx * 0.08 }}
              fontSize="8"
              fontWeight="bold"
              fill={planet.isRetrograde ? '#f472b6' : '#a78bfa'}
              fontFamily="monospace"
              className="pointer-events-none select-none"
            >
              {PLANET_SYMBOLS[planet.planet] || planet.planet.slice(0, 2)}
              {planet.isRetrograde ? '℞' : ''}
            </motion.text>
          ));
        })}

        {/* Center: ASC label */}
        <text x="75" y="72" textAnchor="middle" fontSize="8"
          fill="#8b5cf6" fontFamily="monospace" className="pointer-events-none select-none">
          ASC
        </text>
        <text x="75" y="83" textAnchor="middle" fontSize="9" fontWeight="bold"
          fill="#ffffff" className="pointer-events-none select-none">
          {RASHIS[ascendantRashi]}
        </text>
      </svg>

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
