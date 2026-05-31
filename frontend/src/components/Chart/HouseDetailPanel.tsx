import { motion, AnimatePresence } from 'framer-motion';
import { X, Home, AlertTriangle, Sparkles, RotateCcw } from 'lucide-react';
import type { PlanetPosition } from '../../types/astrology';
import { PLANET_SYMBOLS, PLANET_COLORS } from '../../types/astrology';
import { analyzeHouse } from '../../lib/core/houseAnalysis';
import { useTheme } from '../../hooks/useTheme';

interface Props {
  houseNumber: number | null;
  ascendantRashiIndex: number;
  planets: PlanetPosition[];
  onClose: () => void;
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
const DIGNITY_LABEL: Record<string, string> = {
  'exalted':      'Exalted',
  'own-sign':     'Own Sign',
  'friend-sign':  'Friendly',
  'neutral-sign': 'Neutral',
  'enemy-sign':   'Enemy Sign',
  'debilitated':  'Debilitated',
};

const ACCENT = '#ffaf61';

export const HouseDetailPanel: React.FC<Props> = ({
  houseNumber, ascendantRashiIndex, planets, onClose,
}) => {
  const isLight = useTheme();

  const allPlanetRashiMap: Record<string, number> = {};
  planets.forEach(p => { allPlanetRashiMap[p.planet] = p.rashiIndex; });

  const analysis = houseNumber
    ? analyzeHouse(houseNumber, ascendantRashiIndex, planets, allPlanetRashiMap)
    : null;

  const ordinals = ['','1st','2nd','3rd','4th','5th','6th','7th','8th','9th','10th','11th','12th'];

  // Panel theme tokens
  const panelBg    = isLight ? '#ffffff'               : 'rgba(8,8,16,0.98)';
  const panelBdr   = isLight ? '#D1DCE5'               : 'rgba(139,92,246,0.2)';
  const headerBg   = isLight ? 'rgba(255,255,255,0.97)' : 'rgba(8,8,16,0.95)';
  const headerBdr  = isLight ? '#E2E8F0'               : 'rgba(139,92,246,0.12)';
  const titleClr   = isLight ? '#0f172a'               : '#ffffff';
  const subClr     = isLight ? '#64748b'               : 'rgba(255,255,255,0.40)';
  const bodyClr    = isLight ? '#374151'               : 'rgba(255,255,255,0.65)';
  const mutedClr   = isLight ? '#94a3b8'               : 'rgba(255,255,255,0.35)';
  const cardBg     = isLight ? '#f8fafc'               : 'rgba(255,255,255,0.03)';
  const cardBdr    = isLight ? '#E2E8F0'               : 'rgba(255,255,255,0.07)';
  const sectionBg  = isLight ? '#f1f5f9'               : 'rgba(255,255,255,0.04)';
  const sectionBdr = isLight ? '#D1DCE5'               : 'rgba(255,255,255,0.07)';
  const tagBg      = isLight ? 'rgba(255,175,97,0.12)' : 'rgba(139,92,246,0.10)';
  const tagBdr     = isLight ? 'rgba(255,175,97,0.30)' : 'rgba(139,92,246,0.20)';
  const tagClr     = isLight ? '#92400e'               : '#c4b5fd';
  const dignityClr = isLight ? DIGNITY_COLOR_LIGHT     : DIGNITY_COLOR_DARK;
  const divClr     = isLight ? '#E2E8F0'               : 'rgba(255,255,255,0.05)';
  const bulletClr  = isLight ? ACCENT                  : 'rgba(139,92,246,0.60)';

  return (
    <AnimatePresence>
      {houseNumber && analysis && (
        <>
          <motion.div
            key="bd"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 backdrop-blur-sm"
            style={{ background: isLight ? 'rgba(15,23,42,0.25)' : 'rgba(0,0,0,0.50)' }}
          />

          <motion.div
            key="panel"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-lg overflow-y-auto"
            style={{ background: panelBg, borderLeft: `1px solid ${panelBdr}` }}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4"
              style={{ background: headerBg, borderBottom: `1px solid ${headerBdr}`, backdropFilter: 'blur(12px)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(255,175,97,0.12)', border: `1px solid rgba(255,175,97,0.30)` }}>
                  <span className="text-sm font-bold font-mono" style={{ color: ACCENT }}>{houseNumber}</span>
                </div>
                <div>
                  <h2 className="text-lg font-display font-bold" style={{ color: titleClr }}>
                    {ordinals[houseNumber]} House — {analysis.houseData.theme}
                  </h2>
                  <p className="text-xs font-mono" style={{ color: subClr }}>
                    {analysis.rashiName} ({analysis.rashiEnglish}) · Lord: {analysis.rashiLord}
                  </p>
                </div>
              </div>
              <button onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                style={{ color: subClr }}
                onMouseEnter={e => (e.currentTarget.style.background = sectionBg)}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5 pb-10">

              {/* Keywords */}
              <div className="rounded-xl p-4 flex flex-wrap gap-2"
                style={{ background: tagBg, border: `1px solid ${tagBdr}` }}>
                {analysis.houseData.keywords.map(k => (
                  <span key={k} className="px-2 py-1 rounded-full text-xs font-mono"
                    style={{ background: isLight ? '#fff7ed' : 'rgba(139,92,246,0.10)', border: `1px solid ${tagBdr}`, color: tagClr }}>
                    {k}
                  </span>
                ))}
              </div>

              {/* Ascendant badge */}
              {analysis.isAscendant && (
                <div className="rounded-xl px-4 py-3 flex items-center gap-2"
                  style={{ background: 'rgba(255,175,97,0.10)', border: `1px solid rgba(255,175,97,0.30)` }}>
                  <Home className="w-4 h-4" style={{ color: ACCENT }} />
                  <p className="text-sm font-semibold" style={{ color: isLight ? '#92400e' : ACCENT }}>
                    Ascendant (Lagna) — this is your rising sign and the foundation of the entire chart
                  </p>
                </div>
              )}

              {/* House lord placement */}
              <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${sectionBdr}` }}>
                <div className="px-4 py-3 flex items-center justify-between" style={{ background: sectionBg }}>
                  <span className="text-xs font-mono uppercase" style={{ color: mutedClr }}>House Lord Placement</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold" style={{ color: titleClr }}>{analysis.rashiLord}</span>
                    {analysis.lordHouse > 0 && (
                      <span className="text-xs font-mono" style={{ color: mutedClr }}>→ {ordinals[analysis.lordHouse]}</span>
                    )}
                    <span className="text-xs font-semibold" style={{ color: dignityClr[analysis.lordDignity] }}>
                      {DIGNITY_LABEL[analysis.lordDignity]}
                    </span>
                  </div>
                </div>
                <div className="px-4 py-3" style={{ background: panelBg }}>
                  <p className="text-sm leading-relaxed" style={{ color: bodyClr }}>{analysis.lordHouseDesc}</p>
                </div>
              </div>

              {/* Planets in house */}
              {analysis.planetEffects.length > 0 ? (
                <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${sectionBdr}` }}>
                  <div className="px-4 py-3" style={{ background: sectionBg }}>
                    <span className="text-xs font-mono uppercase" style={{ color: mutedClr }}>
                      {analysis.planetEffects.length} Planet{analysis.planetEffects.length > 1 ? 's' : ''} in This House
                    </span>
                  </div>
                  <div style={{ borderTop: `1px solid ${divClr}` }}>
                    {analysis.planetEffects.map(({ planet, effect, isRetrograde }) => (
                      <div key={planet} className="px-4 py-3 flex items-start gap-3"
                        style={{ borderBottom: `1px solid ${divClr}` }}>
                        <span className="text-xl shrink-0 mt-0.5" style={{ color: PLANET_COLORS[planet] }}>
                          {PLANET_SYMBOLS[planet]}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold" style={{ color: titleClr }}>{planet}</span>
                            {isRetrograde && (
                              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-pink-500"
                                style={{ background: 'rgba(244,114,182,0.10)', border: '1px solid rgba(244,114,182,0.25)' }}>
                                <RotateCcw className="w-2.5 h-2.5" />℞ Retrograde
                              </span>
                            )}
                          </div>
                          <p className="text-xs leading-relaxed" style={{ color: bodyClr }}>{effect}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-xl px-4 py-4 flex items-start gap-3"
                  style={{ background: cardBg, border: `1px solid ${cardBdr}` }}>
                  <Sparkles className="w-4 h-4 mt-0.5 shrink-0" style={{ color: mutedClr }} />
                  <div>
                    <p className="text-sm font-semibold" style={{ color: bodyClr }}>Empty house</p>
                    <p className="text-xs mt-1 leading-relaxed" style={{ color: mutedClr }}>
                      No planets occupy this house. The house lord ({analysis.rashiLord}) placed in the {ordinals[analysis.lordHouse]} house
                      carries the full responsibility for activating this house's themes.
                    </p>
                  </div>
                </div>
              )}

              {/* Combination yoga */}
              {analysis.combinationEffect && (
                <div className="rounded-xl px-4 py-4 flex items-start gap-3"
                  style={{ background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.20)' }}>
                  <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-mono uppercase mb-1 text-yellow-600">Planetary Combination</p>
                    <p className="text-sm leading-relaxed" style={{ color: bodyClr }}>{analysis.combinationEffect}</p>
                  </div>
                </div>
              )}

              {/* Life areas governed */}
              <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${sectionBdr}` }}>
                <div className="px-4 py-3" style={{ background: sectionBg }}>
                  <span className="text-xs font-mono uppercase" style={{ color: mutedClr }}>Areas Governed by This House</span>
                </div>
                <div className="px-4 py-3" style={{ background: panelBg }}>
                  <ul className="space-y-2">
                    {analysis.houseData.rules.map((rule, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm" style={{ color: bodyClr }}>
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: bulletClr }} />
                        {rule.charAt(0).toUpperCase() + rule.slice(1)}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Body part */}
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ background: cardBg, border: `1px solid ${cardBdr}` }}>
                <span className="text-[10px] font-mono uppercase" style={{ color: mutedClr }}>Body Correspondence</span>
                <span className="text-xs ml-auto font-semibold" style={{ color: bodyClr }}>{analysis.houseData.bodyPart}</span>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
