import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw, Home, ShieldAlert, ShieldCheck, Minus, ChevronRight } from 'lucide-react';
import type { PlanetPosition } from '../../types/astrology';
import { PLANET_SYMBOLS, PLANET_COLORS } from '../../types/astrology';
import { analyzePlanet, type DignityLevel } from '../../lib/core/planetaryAnalysis';
import { useTheme } from '../../hooks/useTheme';
import { ProgressBar } from '../shared/BarCharts';

const ACCENT = '#FF2E51';

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
  const isLight = useTheme();

  const analysis = planet && planet.planet !== 'ASCENDANT'
    ? analyzePlanet(planet.planet, planet.rashiIndex, ascendantRashiIndex, planet.isRetrograde)
    : null;

  const displayName = planet?.planet ?? '';
  const symbol = PLANET_SYMBOLS[displayName] ?? '';
  const color = PLANET_COLORS[displayName] ?? ACCENT;

  // Panel theme tokens
  const panelBg   = isLight ? '#ffffff'                : 'rgba(8,8,16,0.98)';
  const panelBdr  = isLight ? '#D1DCE5'                : 'rgba(139,92,246,0.2)';
  const headerBg  = isLight ? 'rgba(255,255,255,0.97)' : 'rgba(8,8,16,0.95)';
  const headerBdr = isLight ? '#E2E8F0'                : 'rgba(139,92,246,0.12)';
  const titleClr  = isLight ? '#0f172a'                : '#ffffff';
  const subClr    = isLight ? '#64748b'                : 'rgba(255,255,255,0.40)';
  const bodyClr   = isLight ? '#374151'                : 'rgba(255,255,255,0.65)';
  const mutedClr  = isLight ? '#94a3b8'                : 'rgba(255,255,255,0.35)';
  const cardBg    = isLight ? '#f8fafc'                : 'rgba(255,255,255,0.03)';
  const cardBdr   = isLight ? '#E2E8F0'                : 'rgba(255,255,255,0.06)';
  const secBg     = isLight ? '#f1f5f9'                : 'rgba(255,255,255,0.04)';
  const secBdr    = isLight ? '#D1DCE5'                : 'rgba(255,255,255,0.07)';
  const divClr    = isLight ? '#E2E8F0'                : 'rgba(255,255,255,0.05)';
  const backdropBg = isLight ? 'rgba(15,23,42,0.25)'   : 'rgba(0,0,0,0.50)';

  return (
    <AnimatePresence>
      {planet && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 backdrop-blur-sm"
            style={{ background: backdropBg }}
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
                <span className="text-4xl font-black" style={{ color, textShadow: `0 0 12px ${color}55` }}>{symbol}</span>
                <div>
                  <h2 className="text-lg font-display font-bold" style={{ color: titleClr }}>{displayName}</h2>
                  {analysis && (
                    <p className="text-xs font-mono" style={{ color: subClr }}>
                      {analysis.houseData.name} · {planet?.rashi} · {planet?.nakshatra} P{planet?.nakshatraPada}
                    </p>
                  )}
                </div>
              </div>
              <button onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                style={{ color: subClr }}
                onMouseEnter={e => (e.currentTarget.style.background = secBg)}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <X className="w-4 h-4" />
              </button>
            </div>

            {displayName === 'ASCENDANT' ? (
              <AscendantContent planet={planet!} isLight={isLight}
                panelBg={panelBg} titleClr={titleClr} bodyClr={bodyClr} mutedClr={mutedClr}
                cardBg={cardBg} cardBdr={cardBdr} />
            ) : analysis ? (
              <AnalysisContent analysis={analysis} planet={planet!} color={color} isLight={isLight}
                panelBg={panelBg} titleClr={titleClr} bodyClr={bodyClr} mutedClr={mutedClr} subClr={subClr}
                cardBg={cardBg} cardBdr={cardBdr} secBg={secBg} secBdr={secBdr} divClr={divClr} />
            ) : null}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

/* ── Shared props ─────────────────────────────────────────────────────────── */
interface ThemeProps {
  isLight: boolean;
  panelBg: string; titleClr: string; bodyClr: string; mutedClr: string;
  cardBg: string; cardBdr: string;
}

/* ── Ascendant special view ─────────────────────────────────────────────── */
function AscendantContent({ planet, isLight, panelBg, titleClr, bodyClr, mutedClr, cardBg, cardBdr }: ThemeProps & { planet: PlanetPosition }) {
  void panelBg;
  return (
    <div className="p-6 space-y-5">
      <div className="rounded-xl p-5"
        style={{ background: 'rgba(255,175,97,0.08)', border: '1px solid rgba(255,175,97,0.25)' }}>
        <div className="flex items-center gap-2 mb-3">
          <Home className="w-4 h-4" style={{ color: ACCENT }} />
          <span className="text-sm font-semibold" style={{ color: ACCENT }}>Ascendant (Lagna)</span>
        </div>
        <p className="text-sm leading-relaxed" style={{ color: bodyClr }}>
          Your Ascendant in <strong style={{ color: titleClr }}>{planet.rashi}</strong> ({planet.nakshatra}, Pada {planet.nakshatraPada}) defines your outward personality, physical body, and the lens through which you experience life. It is the most personal point in the chart.
        </p>
      </div>
      <InfoRow label="Rashi"      value={planet.rashi}                                       isLight={isLight} cardBg={cardBg} cardBdr={cardBdr} titleClr={titleClr} mutedClr={mutedClr} />
      <InfoRow label="Nakshatra"  value={`${planet.nakshatra} — Pada ${planet.nakshatraPada}`} isLight={isLight} cardBg={cardBg} cardBdr={cardBdr} titleClr={titleClr} mutedClr={mutedClr} />
      <InfoRow label="Degree"     value={`${planet.rashiDegree.toFixed(2)}°`}               isLight={isLight} cardBg={cardBg} cardBdr={cardBdr} titleClr={titleClr} mutedClr={mutedClr} />
      <p className="text-xs leading-relaxed pt-4" style={{ color: mutedClr, borderTop: `1px solid ${cardBdr}` }}>
        The Ascendant lord's placement in the chart determines how your personality expresses itself, your overall health trajectory, and your fundamental approach to life.
      </p>
    </div>
  );
}

/* ── Full planet analysis view ──────────────────────────────────────────── */
interface AnalysisProps extends ThemeProps {
  analysis: ReturnType<typeof analyzePlanet>;
  planet: PlanetPosition;
  color: string;
  subClr: string; secBg: string; secBdr: string; divClr: string;
}

function AnalysisContent({ analysis, planet, color, isLight,
  panelBg, titleClr, bodyClr, mutedClr, subClr: _subClr, cardBg, cardBdr, secBg, secBdr, divClr }: AnalysisProps) {
  const DignityIcon = DIGNITY_ICONS[analysis.dignity];

  return (
    <div className="p-6 space-y-5 pb-10">

      {/* Dignity + House strip */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl p-4" style={{ background: cardBg, border: `1px solid ${cardBdr}` }}>
          <div className="flex items-center gap-2 mb-1">
            <DignityIcon className={`w-4 h-4 ${analysis.dignityInfo.color}`} />
            <span className={`text-xs font-semibold ${analysis.dignityInfo.color}`}>{analysis.dignityInfo.label}</span>
          </div>
          <ProgressBar
            pct={analysis.dignityInfo.strength * 10}
            color={color}
            height="md"
            index={0}
            className="mt-2"
          />
          <p className="text-[11px] mt-2 leading-snug" style={{ color: mutedClr }}>{analysis.dignityInfo.desc}</p>
        </div>

        <div className="rounded-xl p-4" style={{ background: cardBg, border: `1px solid ${cardBdr}` }}>
          <div className="flex items-center gap-2 mb-1">
            <Home className="w-4 h-4" style={{ color: ACCENT }} />
            <span className="text-xs font-semibold" style={{ color: ACCENT }}>{analysis.houseData.name}</span>
          </div>
          <p className="text-xs font-semibold mt-1" style={{ color: titleClr }}>{analysis.houseData.theme}</p>
          <p className="text-[11px] mt-1 leading-snug" style={{ color: mutedClr }}>{analysis.houseData.rules.slice(0, 3).join(' · ')}</p>
        </div>
      </div>

      {/* Retrograde block */}
      {planet.isRetrograde && analysis.retrogradeEffect && (
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(244,114,182,0.25)' }}>
          <div className="px-4 py-3 flex items-center gap-2" style={{ background: 'rgba(244,114,182,0.08)' }}>
            <RotateCcw className="w-4 h-4 text-pink-500" />
            <span className="text-sm font-semibold text-pink-500">Retrograde — Internal Redirection</span>
          </div>
          <div className="px-4 pb-4 pt-3 space-y-3" style={{ background: panelBg }}>
            <p className="text-sm leading-relaxed" style={{ color: bodyClr }}>{analysis.retrogradeEffect.general}</p>
            <div className="grid grid-cols-1 gap-2">
              {[
                { label: 'Health', text: analysis.retrogradeEffect.health },
                { label: 'Wealth', text: analysis.retrogradeEffect.wealth },
                { label: 'Career', text: analysis.retrogradeEffect.career },
                { label: 'Relations', text: analysis.retrogradeEffect.relationships },
              ].map(({ label, text }) => (
                <div key={label} className="flex items-start gap-2">
                  <span className="text-[10px] text-pink-500 font-mono uppercase mt-0.5 w-20 shrink-0">{label}</span>
                  <p className="text-xs leading-snug" style={{ color: bodyClr }}>{text}</p>
                </div>
              ))}
            </div>
            {analysis.retrogradeEffect.intensified.length > 0 && (
              <div className="mt-3 rounded-lg px-3 py-2.5" style={{ background: 'rgba(244,114,182,0.06)', border: '1px solid rgba(244,114,182,0.12)' }}>
                <p className="text-[10px] text-pink-500 font-mono uppercase mb-1.5">Intensified effects</p>
                <ul className="space-y-1">
                  {analysis.retrogradeEffect.intensified.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs" style={{ color: bodyClr }}>
                      <ChevronRight className="w-3 h-3 text-pink-400 mt-0.5 shrink-0" />
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
        <div className="rounded-xl overflow-hidden" style={{ border: `1px solid rgba(255,175,97,0.25)` }}>
          <div className="px-4 py-3 flex items-center justify-between" style={{ background: 'rgba(255,175,97,0.08)' }}>
            <span className="text-sm font-semibold" style={{ color: isLight ? '#92400e' : ACCENT }}>{analysis.placement.keynote}</span>
            <span className="text-[10px] font-mono uppercase" style={{ color: mutedClr }}>{analysis.houseData.name}</span>
          </div>
          <div className="px-4 pb-4 pt-3 space-y-4" style={{ background: panelBg }}>
            <p className="text-sm leading-relaxed" style={{ color: bodyClr }}>{analysis.placement.effect}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-lg p-3" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.18)' }}>
                <p className="text-[10px] font-mono uppercase mb-2" style={{ color: isLight ? '#059669' : '#34d399' }}>Strengths</p>
                <ul className="space-y-1.5">
                  {analysis.placement.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs" style={{ color: bodyClr }}>
                      <span style={{ color: isLight ? '#059669' : '#34d399' }} className="mt-0.5">✓</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg p-3" style={{ background: 'rgba(251,113,133,0.06)', border: '1px solid rgba(251,113,133,0.18)' }}>
                <p className="text-[10px] font-mono uppercase mb-2 text-rose-500">Challenges</p>
                <ul className="space-y-1.5">
                  {analysis.placement.challenges.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs" style={{ color: bodyClr }}>
                      <span className="text-rose-500 mt-0.5">•</span>{c}
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
        <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${secBdr}` }}>
          <div className="px-4 py-3" style={{ background: secBg }}>
            <span className="text-xs font-mono uppercase" style={{ color: mutedClr }}>Life Area Impact</span>
          </div>
          <div style={{ background: panelBg }}>
            {[
              { area: 'health', label: 'Health', text: analysis.retrogradeEffect.health },
              { area: 'wealth', label: 'Wealth', text: analysis.retrogradeEffect.wealth },
              { area: 'career', label: 'Career', text: analysis.retrogradeEffect.career },
              { area: 'relationships', label: 'Relationships', text: analysis.retrogradeEffect.relationships },
            ].map(({ area, label, text }) => (
              <div key={area} className="flex items-start gap-3 px-4 py-3"
                style={{ borderBottom: `1px solid ${divClr}` }}>
                <span className="font-mono text-xs mt-0.5 w-24 shrink-0" style={{ color: ACCENT }}>
                  {AREA_ICONS[area]} {label}
                </span>
                <p className="text-xs leading-relaxed" style={{ color: bodyClr }}>{text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Keywords + body parts */}
      <div className="grid grid-cols-2 gap-3">
        {analysis.keywords.length > 0 && (
          <div className="rounded-xl p-4" style={{ background: cardBg, border: `1px solid ${cardBdr}` }}>
            <p className="text-[10px] font-mono uppercase mb-2" style={{ color: mutedClr }}>Keywords</p>
            <div className="flex flex-wrap gap-1.5">
              {analysis.keywords.slice(0, 6).map(k => (
                <span key={k} className="px-2 py-0.5 rounded-full text-[11px] font-mono"
                  style={{ background: 'rgba(255,175,97,0.10)', border: '1px solid rgba(255,175,97,0.22)', color: isLight ? '#92400e' : ACCENT }}>
                  {k}
                </span>
              ))}
            </div>
          </div>
        )}
        {analysis.bodyParts.length > 0 && (
          <div className="rounded-xl p-4" style={{ background: cardBg, border: `1px solid ${cardBdr}` }}>
            <p className="text-[10px] font-mono uppercase mb-2" style={{ color: mutedClr }}>Body Areas</p>
            <div className="flex flex-wrap gap-1.5">
              {analysis.bodyParts.slice(0, 5).map(b => (
                <span key={b} className="px-2 py-0.5 rounded-full text-[11px]"
                  style={{ background: 'rgba(244,114,182,0.08)', border: '1px solid rgba(244,114,182,0.18)', color: isLight ? '#be185d' : '#f9a8d4' }}>
                  {b}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Remedies */}
      {(analysis.gemstone || analysis.mantra || (planet.isRetrograde && analysis.retrogradeEffect?.remedies.length)) && (
        <div className="rounded-xl p-4" style={{ background: 'rgba(255,175,97,0.06)', border: '1px solid rgba(255,175,97,0.20)' }}>
          <p className="text-[10px] font-mono uppercase mb-3" style={{ color: mutedClr }}>Remedies</p>
          <div className="space-y-2">
            {analysis.gemstone && (
              <div className="flex items-start gap-2">
                <span style={{ color: ACCENT }} className="text-xs mt-0.5">◆</span>
                <p className="text-xs" style={{ color: bodyClr }}>
                  <strong style={{ color: titleClr }}>Gemstone:</strong> {analysis.gemstone}
                </p>
              </div>
            )}
            {analysis.mantra && (
              <div className="flex items-start gap-2">
                <span style={{ color: ACCENT }} className="text-xs mt-0.5">◎</span>
                <p className="text-xs font-mono" style={{ color: bodyClr }}>
                  <strong className="font-sans" style={{ color: titleClr }}>Affirmation:</strong> {analysis.mantra}
                </p>
              </div>
            )}
            {planet.isRetrograde && analysis.retrogradeEffect?.remedies.map((r, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-pink-500 text-xs mt-0.5">→</span>
                <p className="text-xs" style={{ color: bodyClr }}>{r}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Degree detail */}
      <div className="flex flex-wrap gap-3">
        <InfoRow label="Degree in Rashi" value={`${planet.rashiDegree.toFixed(2)}°`}
          isLight={isLight} cardBg={cardBg} cardBdr={cardBdr} titleClr={titleClr} mutedClr={mutedClr} />
        <InfoRow label="House"
          value={`${analysis.house}${['st','nd','rd','th','th','th','th','th','th','th','th','th'][analysis.house - 1] ?? 'th'}`}
          isLight={isLight} cardBg={cardBg} cardBdr={cardBdr} titleClr={titleClr} mutedClr={mutedClr} />
        {planet.isRetrograde && (
          <InfoRow label="Motion" value="Retrograde ℞" highlight
            isLight={isLight} cardBg={cardBg} cardBdr={cardBdr} titleClr={titleClr} mutedClr={mutedClr} />
        )}
      </div>
    </div>
  );
}

interface InfoRowProps {
  label: string; value: string; highlight?: boolean;
  isLight: boolean; cardBg: string; cardBdr: string; titleClr: string; mutedClr: string;
}
function InfoRow({ label, value, highlight = false, cardBg, cardBdr, titleClr, mutedClr }: InfoRowProps) {
  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ background: cardBg, border: `1px solid ${cardBdr}` }}>
      <span className="text-[10px] font-mono uppercase" style={{ color: mutedClr }}>{label}</span>
      <span className="text-xs font-semibold ml-auto" style={{ color: highlight ? '#e11d48' : titleClr }}>{value}</span>
    </div>
  );
}
