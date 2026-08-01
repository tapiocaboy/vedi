import { useState } from 'react';
import { motion } from 'framer-motion';
import type { PlanetPosition } from '../../types/astrology';
import { PLANET_SYMBOLS, PLANET_COLORS } from '../../types/astrology';
import { formatDegree } from '../../utils/dateUtils';
import { PlanetDetailPanel } from './PlanetDetailPanel';
import { useLang } from '../../i18n/LanguageContext';
import { labelPlanet, labelRashi, labelDignity } from '../../i18n/astroLabels';
import { analyzePlanet, getGandanta, type DignityLevel } from '../../lib/core/planetaryAnalysis';
import { useTheme } from '../../hooks/useTheme';
import { TapBadge, TapHint, tapVars } from '../shared/tapTarget';

const ACCENT = 'var(--c-accent)';

interface Props {
  planets: PlanetPosition[];
  ascendant: PlanetPosition;
}

const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

interface Badge { short: string; title: string; color: string }
interface PlanetCondition { dignity: DignityLevel | null; badges: Badge[] }

/** Colour per dignity, matched to the detail panel's scale. */
const DIGNITY_COLOR: Record<DignityLevel, string> = {
  'exalted': '#10b981', 'own-sign': '#22c55e', 'friend-sign': '#60a5fa',
  'neutral-sign': '#94a3b8', 'enemy-sign': '#f59e0b', 'debilitated': '#f43f5e',
};

function gandantaBadge(gan: NonNullable<ReturnType<typeof getGandanta>>, t: ReturnType<typeof useLang>['t']): Badge {
  return {
    short: t('planet.gandantaShort'),
    title: `${t('planet.gandanta')} — ${gan.fromJunction.toFixed(2)}°`,
    color: '#a855f7',
  };
}

export const PlanetTable: React.FC<Props> = ({ planets, ascendant }) => {
  const [selected, setSelected] = useState<PlanetPosition | null>(null);
  const isLight = useTheme();
  const { lang, t } = useLang();

  const allPositions: PlanetPosition[] = [
    ...planets,
    { ...ascendant, planet: 'ASCENDANT' },
  ];

  const ascendantRashiIndex = ascendant.rashiIndex;

  // Condition per row. Sign and degree alone hide debilitation, combustion and
  // sign-junction knots — states that change the reading of a planet completely
  // and that a reader scanning this table has no other way to notice.
  const sunLongitude = planets.find(p => p.planet === 'SUN')?.longitude;
  const signByPlanet = Object.fromEntries(planets.map(p => [titleCase(p.planet), p.rashiIndex]));

  const conditionFor = (p: PlanetPosition): PlanetCondition | null => {
    if (p.planet === 'ASCENDANT') {
      const gan = getGandanta(p.rashiIndex, p.rashiDegree, p.nakshatra, lang);
      return gan ? { dignity: null, badges: [gandantaBadge(gan, t)] } : null;
    }
    const a = analyzePlanet(
      p.planet, p.rashiIndex, ascendantRashiIndex, p.isRetrograde, p.rashiDegree,
      { longitude: p.longitude, sunLongitude, signByPlanet, nakshatraName: p.nakshatra }, lang,
    );
    const badges: Badge[] = [];
    if (a.combustion?.isCombust) {
      badges.push({
        short: t('planet.combustShort'),
        title: `${t('planet.combust')} — ${a.combustion.separation.toFixed(2)}° / ${a.combustion.limit}°`,
        color: '#f59e0b',
      });
    }
    if (a.gandanta) badges.push(gandantaBadge(a.gandanta, t));
    if (a.neechaBhanga?.cancelled) {
      badges.push({ short: t('planet.nbShort'), title: t('planet.neechaBhanga'), color: '#10b981' });
    }
    return { dignity: a.dignity, badges };
  };

  // Theme tokens
  const headerBg    = isLight
    ? `linear-gradient(to right, #92400e, ${ACCENT})`
    : `linear-gradient(to right, #3b1a00, #c97a2a)`;
  const rowEven     = isLight ? '#ffffff'          : 'rgba(255,255,255,0.008)';
  const rowOdd      = isLight ? '#f8fafc'          : 'rgba(255,255,255,0.004)';
  const borderClr   = isLight ? '#e2e8f0'          : 'rgba(255,255,255,0.06)';
  const cellTxt     = isLight ? '#0f172a'          : 'rgba(255,255,255,0.88)';
  const mutedTxt    = isLight ? '#64748b'          : 'rgba(255,255,255,0.50)';
  const degreeTxt   = ACCENT;
  const padaBg      = isLight ? 'rgba(255,175,97,0.18)' : 'rgba(255,175,97,0.20)';
  const padaTxt     = isLight ? '#92400e'          : 'rgba(255,175,97,0.90)';
  const padaBorder  = isLight ? 'rgba(255,175,97,0.35)' : 'rgba(255,175,97,0.30)';

  return (
    <>
      <div className="overflow-x-auto">
        <p className="text-sm font-bold mb-3 px-1 tracking-wide flex items-center gap-2 flex-wrap" style={{ color: mutedTxt }}>
          {t('chart.table.hint')}
          <TapHint label={t('common.tapToOpen')} />
        </p>
        <motion.table
          className="w-full text-xs sm:text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <thead>
            <tr style={{ background: headerBg }}>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left rounded-tl-lg font-bold text-white">{t('chart.table.colPlanet')}</th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold text-white">{t('chart.table.colRashi')}</th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold text-white">{t('chart.table.colDegree')}</th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold text-white hidden sm:table-cell">{t('chart.table.colNakshatra')}</th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold text-white">{t('chart.table.colPada')}</th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-center font-bold text-white">℞</th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left rounded-tr-lg font-bold text-white">{t('chart.table.colCondition')}</th>
            </tr>
          </thead>
          <tbody>
            {allPositions.map((planet, idx) => {
              const isSel = selected?.planet === planet.planet;
              const cond = conditionFor(planet);
              return (
                <motion.tr
                  key={planet.planet}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => setSelected(planet)}
                  data-open={isSel}
                  className="tap-tr tap-blink transition-colors duration-150"
                  style={{
                    borderBottom: `1px solid ${borderClr}`,
                    ...tapVars(PLANET_COLORS[planet.planet], idx % 2 === 0 ? rowEven : rowOdd),
                  }}
                >
                  <td className="px-2 sm:px-4 py-2 sm:py-3 font-bold">
                    <div className="flex items-center gap-1.5 sm:gap-2.5">
                      <span className="text-lg sm:text-xl font-bold" style={{ color: PLANET_COLORS[planet.planet], textShadow: `0 0 8px ${PLANET_COLORS[planet.planet]}55` }}>
                        {PLANET_SYMBOLS[planet.planet]}
                      </span>
                      <span className="text-xs sm:text-[15px] font-bold" style={{ color: cellTxt }}>{labelPlanet(planet.planet, lang)}</span>
                    </div>
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 font-semibold" style={{ color: cellTxt }}>
                    {labelRashi(planet.rashiIndex, lang, planet.rashi)}
                    <span className="text-[10px] sm:text-xs ml-1 font-mono font-medium" style={{ color: isLight ? '#64748b' : 'rgba(255,255,255,0.45)' }}>
                      ({planet.rashiIndex + 1})
                    </span>
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 font-mono font-semibold" style={{ color: degreeTxt }}>
                    {formatDegree(planet.rashiDegree)}
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 font-semibold hidden sm:table-cell" style={{ color: cellTxt }}>{planet.nakshatra}</td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3">
                    <span
                      className="inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full font-semibold text-[10px] sm:text-xs"
                      style={{ background: padaBg, color: padaTxt, border: `1px solid ${padaBorder}` }}
                    >
                      {planet.nakshatraPada}
                    </span>
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                    {planet.isRetrograde && (
                      <span className="inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-pink-500/20 text-pink-400 font-bold text-[10px] sm:text-xs border border-pink-500/30">
                        ℞
                      </span>
                    )}
                  </td>
                  <td className="relative px-2 sm:px-4 py-2 sm:py-3">
                    <div className="flex flex-wrap items-center gap-1 pr-9">
                      {cond?.dignity && (
                        <span className="text-[10px] sm:text-xs font-semibold whitespace-nowrap"
                          style={{ color: DIGNITY_COLOR[cond.dignity] }}>
                          {labelDignity(cond.dignity, lang)}
                        </span>
                      )}
                      {cond?.badges.map(b => (
                        <span
                          key={b.short}
                          title={b.title}
                          className="inline-flex items-center px-1.5 py-0.5 rounded font-bold text-[9px] sm:text-[10px] whitespace-nowrap"
                          style={{ color: b.color, background: `${b.color}1f`, border: `1px solid ${b.color}55` }}
                        >
                          {b.short}
                        </span>
                      ))}
                      {!cond?.dignity && !cond?.badges.length && (
                        <span className="text-xs" style={{ color: mutedTxt }}>—</span>
                      )}
                    </div>
                    {/* Absolute so a long condition list cannot push the
                        affordance off the right edge of a narrow table. */}
                    <TapBadge open={isSel} className="absolute right-2 top-1/2 -translate-y-1/2" />
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </motion.table>
      </div>

      <PlanetDetailPanel
        planet={selected}
        ascendantRashiIndex={ascendantRashiIndex}
        allPlanets={planets}
        onClose={() => setSelected(null)}
      />
    </>
  );
};
