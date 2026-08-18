import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Home, Sparkles, RotateCcw, Info } from 'lucide-react';
import type { CurrentDasha, DashaPeriod, PlanetPosition } from '../../types/astrology';
import { PLANET_SYMBOLS, PLANET_COLORS } from '../../types/astrology';
import { analyzeHouse } from '../../lib/core/houseAnalysis';
import { analyzeHousePairs } from '../../lib/core/conjunctions';
import { useTheme } from '../../hooks/useTheme';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useLang } from '../../i18n/LanguageContext';
import { coreLang } from '../../i18n/translations';
import {
  labelPlanet, labelRashi, labelRashiWestern, labelDignity, labelOrdinalHouse,
  labelHouseCovers, labelPlanetTheme,
} from '../../i18n/astroLabels';
import { PairDetail, PairListCard } from './PlanetPairPanel';
import { panelTokens } from './panelTokens';

interface Props {
  houseNumber: number | null;
  ascendantRashiIndex: number;
  planets: PlanetPosition[];
  onClose: () => void;
  /** Enables the "right now" reading on planet pairs. */
  currentDasha?: CurrentDasha | null;
  /** Enables the lifetime peak-window timeline on planet pairs. */
  mahadashaTimeline?: DashaPeriod[] | null;
  /** Birth date ISO — lets the pair pane say how old the reader is now. */
  birthDate?: string | null;
}

const DIGNITY_COLOR_DARK: Record<string, string> = {
  'exalted':      '#34d399',
  'own-sign':     '#a78bfa',
  'friend-sign':  '#60a5fa',
  'neutral-sign': 'rgba(255,255,255,0.50)',
  'enemy-sign':   '#fbbf24',
  'debilitated':  '#f87171',
};
const DIGNITY_COLOR_LIGHT: Record<string, string> = {
  'exalted':      '#059669',
  'own-sign':     '#7c3aed',
  'friend-sign':  '#2563eb',
  'neutral-sign': '#64748b',
  'enemy-sign':   '#d97706',
  'debilitated':  '#dc2626',
};

const ACCENT = 'var(--c-accent)';

/** Width of the pair pane on a wide screen — the panel and pane fit side by side. */
const PANE_WIDTH = 440;

const spring = { type: 'spring' as const, stiffness: 320, damping: 32 };

export const HouseDetailPanel: React.FC<Props> = ({
  houseNumber, ascendantRashiIndex, planets, onClose,
  currentDasha = null, mahadashaTimeline = null, birthDate = null,
}) => {
  const isLight = useTheme();
  const { lang, t } = useLang();
  const isWide = useMediaQuery('(min-width: 1024px)');
  const [pairIndex, setPairIndex] = useState<number | null>(null);

  // A different house means a different set of pairs — leaving the old index
  // selected would open the pane on an unrelated pair.
  useEffect(() => { setPairIndex(null); }, [houseNumber]);

  const allPlanetRashiMap: Record<string, number> = {};
  planets.forEach(p => { allPlanetRashiMap[p.planet] = p.rashiIndex; });

  const analysis = houseNumber
    ? analyzeHouse(houseNumber, ascendantRashiIndex, planets, allPlanetRashiMap, coreLang(lang))
    : null;

  const pairResult = useMemo(
    () => houseNumber
      ? analyzeHousePairs({
          houseNumber, ascendantRashiIndex, planets,
          currentDasha, mahadashaTimeline, birthDate, lang: coreLang(lang),
        })
      : null,
    [houseNumber, ascendantRashiIndex, planets, currentDasha, mahadashaTimeline, birthDate, lang],
  );

  const pairs = pairResult?.pairs ?? [];
  const selectedPair = pairIndex !== null ? pairs[pairIndex] ?? null : null;

  const tk = panelTokens(isLight);
  const tagBg      = isLight ? 'rgba(255,175,97,0.12)' : 'rgba(139,92,246,0.10)';
  const tagBdr     = isLight ? 'rgba(255,175,97,0.30)' : 'rgba(139,92,246,0.20)';
  const tagClr     = isLight ? '#92400e'               : '#c4b5fd';
  const dignityClr = isLight ? DIGNITY_COLOR_LIGHT     : DIGNITY_COLOR_DARK;

  const rashiIdx = analysis ? (ascendantRashiIndex + (houseNumber! - 1)) % 12 : 0;
  const planetCount = analysis?.planetEffects.length ?? 0;
  const occupancyLine = planetCount === 0
    ? t('house.plainEmpty')
    : planetCount === 1
      ? t('house.plainOne')
      : t('house.plainMany', { n: planetCount });

  const closeAll = () => { setPairIndex(null); onClose(); };

  // The chart sits inside a `.glass-card`, and its backdrop-filter makes that
  // card the containing block for any `position: fixed` descendant — a panel
  // rendered in place is clipped to the card and painted under the app header.
  // Portalling to <body> is what makes "fixed" mean the viewport here.
  return createPortal(
    <AnimatePresence>
      {houseNumber && analysis && (
        <>
          <motion.div
            key="bd"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={closeAll}
            className="fixed inset-0 z-[70] backdrop-blur-sm"
            style={{ background: tk.backdropBg }}
          />

          {/* Anchored to the right edge: the house panel is the left column and
              the pair pane expands out of it to the right. */}
          <div className="fixed right-0 top-0 bottom-0 z-[80] flex items-stretch pointer-events-none">
            <motion.div
              key="panel"
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={spring}
              className="pointer-events-auto w-screen max-w-lg overflow-y-auto"
              style={{ background: tk.panelBg, borderLeft: `1px solid ${tk.panelBdr}` }}
            >
              {/* Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4"
                style={{ background: tk.headerBg, borderBottom: `1px solid ${tk.headerBdr}`, backdropFilter: 'blur(12px)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(255,175,97,0.12)', border: `1px solid rgba(255,175,97,0.30)` }}>
                    <span className="text-sm font-bold font-mono" style={{ color: ACCENT }}>{houseNumber}</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-display font-bold" style={{ color: tk.titleClr }}>
                      {labelOrdinalHouse(houseNumber, lang)} — {analysis.themeLabel}
                    </h2>
                    <p className="text-xs font-mono" style={{ color: tk.subClr }}>
                      {labelRashi(rashiIdx, lang, analysis.rashiName)} ({labelRashiWestern(rashiIdx, lang, analysis.rashiEnglish)}) · {t('house.lordOf', { lord: labelPlanet(analysis.rashiLord, lang) })}
                    </p>
                  </div>
                </div>
                <button onClick={closeAll}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                  style={{ color: tk.subClr }}
                  onMouseEnter={e => (e.currentTarget.style.background = tk.secBg)}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-5 pb-10">

                {/* Plain-language opener — the whole house in two sentences */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-xl px-4 py-4"
                  style={{ background: 'rgba(255,175,97,0.08)', border: '1px solid rgba(255,175,97,0.25)' }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-3.5 h-3.5" style={{ color: ACCENT }} />
                    <span className="text-[10px] font-mono uppercase tracking-wide" style={{ color: ACCENT }}>
                      {t('house.plainTitle')}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: tk.bodyClr }}>
                    {t('house.plainBody', { covers: labelHouseCovers(houseNumber, lang).toLowerCase() })}{' '}
                    {occupancyLine}
                  </p>
                </motion.div>

                {/* Keyword chips — the same ground as "areas governed" below, but
                    scannable. Sourced from the localised list so the Sinhala UI
                    does not fall back to English tags. */}
                <div className="rounded-xl p-4" style={{ background: tagBg, border: `1px solid ${tagBdr}` }}>
                  <p className="text-[11px] mb-2.5 leading-relaxed" style={{ color: tk.mutedClr }}>{t('house.areasHint')}</p>
                  <div className="flex flex-wrap gap-2">
                  {analysis.ruleLabels.map(k => (
                    <span key={k} className="px-2 py-1 rounded-full text-xs"
                      style={{ background: isLight ? '#fff7ed' : 'rgba(139,92,246,0.10)', border: `1px solid ${tagBdr}`, color: tagClr }}>
                      {k}
                    </span>
                  ))}
                  </div>
                </div>

                {/* Ascendant badge */}
                {analysis.isAscendant && (
                  <div className="rounded-xl px-4 py-3 flex items-center gap-2"
                    style={{ background: 'rgba(255,175,97,0.10)', border: `1px solid rgba(255,175,97,0.30)` }}>
                    <Home className="w-4 h-4" style={{ color: ACCENT }} />
                    <p className="text-sm font-semibold" style={{ color: isLight ? '#92400e' : ACCENT }}>
                      {t('house.ascendantBadge')}
                    </p>
                  </div>
                )}

                {/* Planet pairs — the expanding detail */}
                <PairListCard
                  pairs={pairs}
                  occupants={pairResult?.occupants ?? []}
                  gaps={pairResult?.gaps ?? []}
                  groupHeadline={pairResult?.groupHeadline ?? null}
                  selectedIndex={pairIndex}
                  onSelect={i => setPairIndex(prev => (prev === i ? null : i))}
                  isLight={isLight}
                />

                {/* Planets in house */}
                {analysis.planetEffects.length > 0 ? (
                  <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${tk.secBdr}` }}>
                    <div className="px-4 py-3" style={{ background: tk.secBg }}>
                      <span className="text-xs font-mono uppercase" style={{ color: tk.mutedClr }}>
                        {t('house.planetsCount', { n: analysis.planetEffects.length })}
                      </span>
                      <p className="text-[11px] mt-1 leading-relaxed" style={{ color: tk.mutedClr }}>
                        {t('house.planetsHint')}
                      </p>
                    </div>
                    <div style={{ borderTop: `1px solid ${tk.divClr}` }}>
                      {analysis.planetEffects.map(({ planet, effect, isRetrograde }) => (
                        <div key={planet} className="px-4 py-3 flex items-start gap-3"
                          style={{ borderBottom: `1px solid ${tk.divClr}` }}>
                          <span className="text-2xl font-bold shrink-0 mt-0.5" style={{ color: PLANET_COLORS[planet], textShadow: `0 0 8px ${PLANET_COLORS[planet]}55` }}>
                            {PLANET_SYMBOLS[planet]}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-sm font-bold" style={{ color: tk.titleClr }}>{labelPlanet(planet, lang)}</span>
                              {isRetrograde && (
                                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-pink-500"
                                  style={{ background: 'rgba(244,114,182,0.10)', border: '1px solid rgba(244,114,182,0.25)' }}>
                                  <RotateCcw className="w-2.5 h-2.5" />{t('planet.retrograde')}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] mb-1.5" style={{ color: tk.mutedClr }}>
                              {labelPlanetTheme(planet, lang)}
                            </p>
                            <p className="text-xs leading-relaxed" style={{ color: tk.bodyClr }}>{effect}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl px-4 py-4 flex items-start gap-3"
                    style={{ background: tk.cardBg, border: `1px solid ${tk.cardBdr}` }}>
                    <Sparkles className="w-4 h-4 mt-0.5 shrink-0" style={{ color: tk.mutedClr }} />
                    <div>
                      <p className="text-sm font-semibold" style={{ color: tk.bodyClr }}>{t('house.emptyTitle')}</p>
                      <p className="text-xs mt-1 leading-relaxed" style={{ color: tk.mutedClr }}>
                        {t('house.emptyBody')}
                      </p>
                    </div>
                  </div>
                )}

                {/* House lord placement */}
                <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${tk.secBdr}` }}>
                  <div className="px-4 py-3" style={{ background: tk.secBg }}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono uppercase" style={{ color: tk.mutedClr }}>{t('house.lordPlacement')}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold" style={{ color: tk.titleClr }}>{labelPlanet(analysis.rashiLord, lang)}</span>
                        {analysis.lordHouse > 0 && (
                          <span className="text-xs font-mono" style={{ color: tk.mutedClr }}>{t('house.lordInHouse', { house: labelOrdinalHouse(analysis.lordHouse, lang) })}</span>
                        )}
                        <span className="text-xs font-semibold" style={{ color: dignityClr[analysis.lordDignity] }}>
                          {labelDignity(analysis.lordDignity, lang)}
                        </span>
                      </div>
                    </div>
                    <p className="text-[11px] mt-1.5 leading-relaxed" style={{ color: tk.mutedClr }}>
                      {t('house.lordHint')}
                    </p>
                  </div>
                  <div className="px-4 py-3" style={{ background: tk.panelBg }}>
                    <p className="text-sm leading-relaxed" style={{ color: tk.bodyClr }}>{analysis.lordHouseDesc}</p>
                  </div>
                </div>

                {/* Body part */}
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{ background: tk.cardBg, border: `1px solid ${tk.cardBdr}` }}>
                  <span className="text-[10px] font-mono uppercase" style={{ color: tk.mutedClr }}>{t('house.bodyCorrespondence')}</span>
                  <span className="text-xs ml-auto font-semibold" style={{ color: tk.bodyClr }}>{analysis.houseData.bodyPart}</span>
                </div>

              </div>
            </motion.div>

            {/* Wide screens: the pane grows out to the right of the panel */}
            {isWide && (
              <AnimatePresence>
                {selectedPair && (
                  <motion.div
                    key="pair-pane"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: PANE_WIDTH, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ ...spring, opacity: { duration: 0.2 } }}
                    className="pointer-events-auto overflow-hidden"
                    style={{ borderLeft: `1px solid ${tk.panelBdr}` }}
                  >
                    <div style={{ width: PANE_WIDTH, height: '100%' }}>
                      <PairDetail
                        pair={selectedPair}
                        variant="pane"
                        isLight={isLight}
                        onBack={() => setPairIndex(null)}
                        onClose={() => setPairIndex(null)}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>

          {/* Narrow screens: the pane takes over the screen, with a back arrow */}
          {!isWide && (
            <AnimatePresence>
              {selectedPair && (
                <motion.div
                  key="pair-overlay"
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={spring}
                  className="fixed inset-0 z-[90]"
                  style={{ background: tk.panelBg }}
                >
                  <PairDetail
                    pair={selectedPair}
                    variant="overlay"
                    isLight={isLight}
                    onBack={() => setPairIndex(null)}
                    onClose={closeAll}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
};
