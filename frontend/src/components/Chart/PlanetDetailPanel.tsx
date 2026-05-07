import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw, Home, ShieldAlert, ShieldCheck, Minus, ChevronRight } from 'lucide-react';
import type { PlanetPosition } from '../../types/astrology';
import { PLANET_SYMBOLS, PLANET_COLORS } from '../../types/astrology';
import { analyzePlanet, type DignityLevel } from '../../lib/core/planetaryAnalysis';

interface Props {
  planet: PlanetPosition | null;
  ascendantRashiIndex: number;
  onClose: () => void;
}

const DIGNITY_ICONS: Record<DignityLevel, React.ElementType> = {
  'exalted':      ShieldCheck,
  'own-sign':     ShieldCheck,
  'friend-sign':  ShieldCheck,
  'neutral-sign': Minus,
  'enemy-sign':   ShieldAlert,
  'debilitated':  ShieldAlert,
};

const AREA_ICONS: Record<string, string> = {
  health: '♥', wealth: '◆', career: '▲', relationships: '✦',
};

export const PlanetDetailPanel: React.FC<Props> = ({ planet, ascendantRashiIndex, onClose }) => {
  const analysis = planet && planet.planet !== 'ASCENDANT'
    ? analyzePlanet(planet.planet, planet.rashiIndex, ascendantRashiIndex, planet.isRetrograde)
    : null;

  const displayName = planet?.planet ?? '';
  const symbol = PLANET_SYMBOLS[displayName] ?? '';
  const color = PLANET_COLORS[displayName] ?? '#a78bfa';

  return (
    <AnimatePresence>
      {planet && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />

          {/* Panel */}
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
                <span className="text-3xl" style={{ color }}>{symbol}</span>
                <div>
                  <h2 className="text-lg font-display font-bold text-white">{displayName}</h2>
                  {analysis && (
                    <p className="text-xs text-white/40 font-mono">
                      {analysis.houseData.name} · {planet?.rashi} · {planet?.nakshatra} P{planet?.nakshatraPada}
                    </p>
                  )}
                </div>
              </div>
              <button onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/8 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            {displayName === 'ASCENDANT' ? (
              <AscendantContent planet={planet!} />
            ) : analysis ? (
              <AnalysisContent analysis={analysis} planet={planet!} color={color} />
            ) : null}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

/* ── Ascendant special view ─────────────────────────────────────────────── */
function AscendantContent({ planet }: { planet: PlanetPosition }) {
  return (
    <div className="p-6 space-y-5">
      <div className="rounded-xl p-5" style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)' }}>
        <div className="flex items-center gap-2 mb-3">
          <Home className="w-4 h-4 text-violet-400" />
          <span className="text-sm font-semibold text-violet-400">Ascendant (Lagna)</span>
        </div>
        <p className="text-sm text-white/70 leading-relaxed">
          Your Ascendant in <strong className="text-white">{planet.rashi}</strong> ({planet.nakshatra}, Pada {planet.nakshatraPada}) defines your outward personality, physical body, and the lens through which you experience life. It is the most personal point in the chart.
        </p>
      </div>
      <InfoRow label="Rashi" value={planet.rashi} />
      <InfoRow label="Nakshatra" value={`${planet.nakshatra} — Pada ${planet.nakshatraPada}`} />
      <InfoRow label="Degree" value={`${planet.rashiDegree.toFixed(2)}°`} />
      <p className="text-xs text-white/30 leading-relaxed border-t border-white/6 pt-4">
        The Ascendant lord's placement in the chart determines how your personality expresses itself, your overall health trajectory, and your fundamental approach to life.
      </p>
    </div>
  );
}

/* ── Full planet analysis view ──────────────────────────────────────────── */
function AnalysisContent({ analysis, planet, color }: {
  analysis: ReturnType<typeof analyzePlanet>;
  planet: PlanetPosition;
  color: string;
}) {
  const DignityIcon = DIGNITY_ICONS[analysis.dignity];

  return (
    <div className="p-6 space-y-5 pb-10">

      {/* Dignity + House strip */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2 mb-1">
            <DignityIcon className={`w-4 h-4 ${analysis.dignityInfo.color}`} />
            <span className={`text-xs font-semibold ${analysis.dignityInfo.color}`}>{analysis.dignityInfo.label}</span>
          </div>
          <div className="flex items-center gap-1 mt-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-1 flex-1 rounded-full"
                style={{ background: i < analysis.dignityInfo.strength ? color : 'rgba(255,255,255,0.08)' }} />
            ))}
          </div>
          <p className="text-[11px] text-white/40 mt-2 leading-snug">{analysis.dignityInfo.desc}</p>
        </div>

        <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2 mb-1">
            <Home className="w-4 h-4 text-violet-400" />
            <span className="text-xs font-semibold text-violet-400">{analysis.houseData.name}</span>
          </div>
          <p className="text-xs font-semibold text-white/80 mt-1">{analysis.houseData.theme}</p>
          <p className="text-[11px] text-white/40 mt-1 leading-snug">{analysis.houseData.rules.slice(0, 3).join(' · ')}</p>
        </div>
      </div>

      {/* Retrograde block */}
      {planet.isRetrograde && analysis.retrogradeEffect && (
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(244,114,182,0.2)' }}>
          <div className="px-4 py-3 flex items-center gap-2" style={{ background: 'rgba(244,114,182,0.08)' }}>
            <RotateCcw className="w-4 h-4 text-pink-400" />
            <span className="text-sm font-semibold text-pink-400">Retrograde — Internal Redirection</span>
          </div>
          <div className="px-4 pb-4 pt-3 space-y-3">
            <p className="text-sm text-white/65 leading-relaxed">{analysis.retrogradeEffect.general}</p>
            <div className="grid grid-cols-1 gap-2">
              {[
                { label: 'Health effect', text: analysis.retrogradeEffect.health },
                { label: 'Wealth effect', text: analysis.retrogradeEffect.wealth },
                { label: 'Career effect', text: analysis.retrogradeEffect.career },
                { label: 'Relationships', text: analysis.retrogradeEffect.relationships },
              ].map(({ label, text }) => (
                <div key={label} className="flex items-start gap-2">
                  <span className="text-[10px] text-pink-400/80 font-mono uppercase mt-0.5 w-20 shrink-0">{label}</span>
                  <p className="text-xs text-white/50 leading-snug">{text}</p>
                </div>
              ))}
            </div>
            {analysis.retrogradeEffect.intensified.length > 0 && (
              <div className="mt-3 rounded-lg px-3 py-2.5" style={{ background: 'rgba(244,114,182,0.06)', border: '1px solid rgba(244,114,182,0.1)' }}>
                <p className="text-[10px] text-pink-400/70 font-mono uppercase mb-1.5">Intensified effects</p>
                <ul className="space-y-1">
                  {analysis.retrogradeEffect.intensified.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-white/50">
                      <ChevronRight className="w-3 h-3 text-pink-400/50 mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* House placement */}
      {analysis.placement && (
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(139,92,246,0.15)' }}>
          <div className="px-4 py-3 flex items-center justify-between" style={{ background: 'rgba(139,92,246,0.08)' }}>
            <span className="text-sm font-semibold text-violet-300">{analysis.placement.keynote}</span>
            <span className="text-[10px] font-mono text-violet-400/60 uppercase">{analysis.houseData.name}</span>
          </div>
          <div className="px-4 pb-4 pt-3 space-y-4">
            <p className="text-sm text-white/65 leading-relaxed">{analysis.placement.effect}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-lg p-3" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)' }}>
                <p className="text-[10px] text-emerald-400 font-mono uppercase mb-2">Strengths</p>
                <ul className="space-y-1.5">
                  {analysis.placement.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-white/60">
                      <span className="text-emerald-400 mt-0.5">✓</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg p-3" style={{ background: 'rgba(251,113,133,0.06)', border: '1px solid rgba(251,113,133,0.15)' }}>
                <p className="text-[10px] text-rose-400 font-mono uppercase mb-2">Challenges</p>
                <ul className="space-y-1.5">
                  {analysis.placement.challenges.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-white/60">
                      <span className="text-rose-400 mt-0.5">•</span>{c}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Life area quick-read */}
      {analysis.retrogradeEffect && (
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="px-4 py-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <span className="text-xs font-mono uppercase text-white/40">Life Area Impact</span>
          </div>
          <div className="divide-y divide-white/5">
            {[
              { area: 'health', label: 'Health', text: analysis.retrogradeEffect.health },
              { area: 'wealth', label: 'Wealth', text: analysis.retrogradeEffect.wealth },
              { area: 'career', label: 'Career', text: analysis.retrogradeEffect.career },
              { area: 'relationships', label: 'Relationships', text: analysis.retrogradeEffect.relationships },
            ].map(({ area, label, text }) => (
              <div key={area} className="flex items-start gap-3 px-4 py-3">
                <span className="text-violet-400 font-mono text-xs mt-0.5 w-20 shrink-0">{AREA_ICONS[area]} {label}</span>
                <p className="text-xs text-white/55 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Keywords + body parts */}
      <div className="grid grid-cols-2 gap-3">
        {analysis.keywords.length > 0 && (
          <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-[10px] font-mono uppercase text-white/35 mb-2">Keywords</p>
            <div className="flex flex-wrap gap-1.5">
              {analysis.keywords.slice(0, 6).map(k => (
                <span key={k} className="px-2 py-0.5 rounded-full text-[11px] text-white/50 font-mono"
                  style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)' }}>
                  {k}
                </span>
              ))}
            </div>
          </div>
        )}
        {analysis.bodyParts.length > 0 && (
          <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-[10px] font-mono uppercase text-white/35 mb-2">Body Areas</p>
            <div className="flex flex-wrap gap-1.5">
              {analysis.bodyParts.slice(0, 5).map(b => (
                <span key={b} className="px-2 py-0.5 rounded-full text-[11px] text-white/50"
                  style={{ background: 'rgba(244,114,182,0.06)', border: '1px solid rgba(244,114,182,0.12)' }}>
                  {b}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Remedies */}
      {(analysis.gemstone || analysis.mantra || (planet.isRetrograde && analysis.retrogradeEffect?.remedies.length)) && (
        <div className="rounded-xl p-4" style={{ background: 'rgba(139,92,246,0.04)', border: '1px solid rgba(139,92,246,0.12)' }}>
          <p className="text-[10px] font-mono uppercase text-violet-400/60 mb-3">Remedies</p>
          <div className="space-y-2">
            {analysis.gemstone && (
              <div className="flex items-start gap-2">
                <span className="text-violet-400 text-xs mt-0.5">◆</span>
                <p className="text-xs text-white/60"><strong className="text-white/80">Gemstone:</strong> {analysis.gemstone}</p>
              </div>
            )}
            {analysis.mantra && (
              <div className="flex items-start gap-2">
                <span className="text-violet-400 text-xs mt-0.5">◎</span>
                <p className="text-xs text-white/60 font-mono"><strong className="text-white/80 font-sans">Affirmation:</strong> {analysis.mantra}</p>
              </div>
            )}
            {planet.isRetrograde && analysis.retrogradeEffect?.remedies.map((r, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-pink-400 text-xs mt-0.5">→</span>
                <p className="text-xs text-white/55">{r}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Degree detail */}
      <div className="flex flex-wrap gap-3">
        <InfoRow label="Degree in Rashi" value={`${planet.rashiDegree.toFixed(2)}°`} />
        <InfoRow label="House" value={`${analysis.house}${['st','nd','rd','th','th','th','th','th','th','th','th','th'][analysis.house - 1] ?? 'th'}`} />
        {planet.isRetrograde && <InfoRow label="Motion" value="Retrograde ℞" highlight />}
      </div>
    </div>
  );
}

function InfoRow({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
      <span className="text-[10px] font-mono uppercase text-white/30">{label}</span>
      <span className={`text-xs font-semibold ml-auto ${highlight ? 'text-pink-400' : 'text-white/75'}`}>{value}</span>
    </div>
  );
}
