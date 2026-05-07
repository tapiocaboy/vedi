import { motion, AnimatePresence } from 'framer-motion';
import { X, Home, AlertTriangle, Sparkles, RotateCcw } from 'lucide-react';
import type { PlanetPosition } from '../../types/astrology';
import { PLANET_SYMBOLS, PLANET_COLORS } from '../../types/astrology';
import { analyzeHouse } from '../../lib/core/houseAnalysis';

interface Props {
  houseNumber: number | null;
  ascendantRashiIndex: number;
  planets: PlanetPosition[];
  onClose: () => void;
}

const DIGNITY_COLOR: Record<string, string> = {
  'exalted':      'text-emerald-400',
  'own-sign':     'text-violet-400',
  'friend-sign':  'text-blue-400',
  'neutral-sign': 'text-white/50',
  'enemy-sign':   'text-amber-400',
  'debilitated':  'text-rose-400',
};

const DIGNITY_LABEL: Record<string, string> = {
  'exalted':      'Exalted',
  'own-sign':     'Own Sign',
  'friend-sign':  'Friendly',
  'neutral-sign': 'Neutral',
  'enemy-sign':   'Enemy Sign',
  'debilitated':  'Debilitated',
};

export const HouseDetailPanel: React.FC<Props> = ({
  houseNumber, ascendantRashiIndex, planets, onClose,
}) => {
  const allPlanetRashiMap: Record<string, number> = {};
  planets.forEach(p => { allPlanetRashiMap[p.planet] = p.rashiIndex; });

  const analysis = houseNumber
    ? analyzeHouse(houseNumber, ascendantRashiIndex, planets, allPlanetRashiMap)
    : null;

  const ordinals = ['','1st','2nd','3rd','4th','5th','6th','7th','8th','9th','10th','11th','12th'];

  return (
    <AnimatePresence>
      {houseNumber && analysis && (
        <>
          <motion.div
            key="bd"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />

          <motion.div
            key="panel"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-lg overflow-y-auto"
            style={{ background: 'rgba(8,8,16,0.98)', borderLeft: '1px solid rgba(139,92,246,0.2)' }}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4"
              style={{ background: 'rgba(8,8,16,0.95)', borderBottom: '1px solid rgba(139,92,246,0.12)', backdropFilter: 'blur(12px)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)' }}>
                  <span className="text-sm font-bold text-violet-400 font-mono">{houseNumber}</span>
                </div>
                <div>
                  <h2 className="text-lg font-display font-bold text-white">
                    {ordinals[houseNumber]} House — {analysis.houseData.theme}
                  </h2>
                  <p className="text-xs text-white/40 font-mono">
                    {analysis.rashiName} ({analysis.rashiEnglish}) · Lord: {analysis.rashiLord}
                  </p>
                </div>
              </div>
              <button onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/8 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5 pb-10">

              {/* House keywords */}
              <div className="rounded-xl p-4 flex flex-wrap gap-2"
                style={{ background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.12)' }}>
                {analysis.houseData.keywords.map(k => (
                  <span key={k} className="px-2 py-1 rounded-full text-xs text-violet-300 font-mono"
                    style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}>
                    {k}
                  </span>
                ))}
              </div>

              {/* Ascendant badge */}
              {analysis.isAscendant && (
                <div className="rounded-xl px-4 py-3 flex items-center gap-2"
                  style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.25)' }}>
                  <Home className="w-4 h-4 text-violet-400" />
                  <p className="text-sm text-violet-300 font-semibold">
                    Ascendant (Lagna) — this is your rising sign and the foundation of the entire chart
                  </p>
                </div>
              )}

              {/* House lord placement */}
              <div className="rounded-xl overflow-hidden"
                style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="px-4 py-3 flex items-center justify-between"
                  style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <span className="text-xs font-mono uppercase text-white/40">House Lord Placement</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{analysis.rashiLord}</span>
                    {analysis.lordHouse > 0 && (
                      <span className="text-xs text-white/40 font-mono">→ {ordinals[analysis.lordHouse]}</span>
                    )}
                    <span className={`text-xs font-semibold ${DIGNITY_COLOR[analysis.lordDignity]}`}>
                      {DIGNITY_LABEL[analysis.lordDignity]}
                    </span>
                  </div>
                </div>
                <div className="px-4 py-3">
                  <p className="text-sm text-white/65 leading-relaxed">{analysis.lordHouseDesc}</p>
                </div>
              </div>

              {/* Planets in house */}
              {analysis.planetEffects.length > 0 ? (
                <div className="rounded-xl overflow-hidden"
                  style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="px-4 py-3" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <span className="text-xs font-mono uppercase text-white/40">
                      {analysis.planetEffects.length} Planet{analysis.planetEffects.length > 1 ? 's' : ''} in This House
                    </span>
                  </div>
                  <div className="divide-y divide-white/5">
                    {analysis.planetEffects.map(({ planet, effect, isRetrograde }) => (
                      <div key={planet} className="px-4 py-3 flex items-start gap-3">
                        <span className="text-xl shrink-0 mt-0.5"
                          style={{ color: PLANET_COLORS[planet] }}>
                          {PLANET_SYMBOLS[planet]}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-white">{planet}</span>
                            {isRetrograde && (
                              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-pink-400"
                                style={{ background: 'rgba(244,114,182,0.1)', border: '1px solid rgba(244,114,182,0.2)' }}>
                                <RotateCcw className="w-2.5 h-2.5" />℞ Retrograde
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-white/55 leading-relaxed">{effect}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-xl px-4 py-4 flex items-start gap-3"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <Sparkles className="w-4 h-4 text-white/20 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm text-white/50 font-semibold">Empty house</p>
                    <p className="text-xs text-white/35 mt-1 leading-relaxed">
                      No planets occupy this house. The house lord ({analysis.rashiLord}) placed in the {ordinals[analysis.lordHouse]} house
                      carries the full responsibility for activating this house's themes.
                    </p>
                  </div>
                </div>
              )}

              {/* Combination yoga */}
              {analysis.combinationEffect && (
                <div className="rounded-xl px-4 py-4 flex items-start gap-3"
                  style={{ background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.15)' }}>
                  <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-mono uppercase text-yellow-400/70 mb-1">Planetary Combination</p>
                    <p className="text-sm text-white/70 leading-relaxed">{analysis.combinationEffect}</p>
                  </div>
                </div>
              )}

              {/* Life areas governed */}
              <div className="rounded-xl overflow-hidden"
                style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="px-4 py-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <span className="text-xs font-mono uppercase text-white/35">Areas Governed by This House</span>
                </div>
                <div className="px-4 py-3">
                  <ul className="space-y-2">
                    {analysis.houseData.rules.map((rule, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-white/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-500/60 shrink-0" />
                        {rule.charAt(0).toUpperCase() + rule.slice(1)}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Body part */}
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <span className="text-[10px] font-mono uppercase text-white/30">Body Correspondence</span>
                <span className="text-xs text-white/65 ml-auto">{analysis.houseData.bodyPart}</span>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
