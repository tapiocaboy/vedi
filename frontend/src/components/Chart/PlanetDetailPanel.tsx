import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw, Home, ShieldAlert, ShieldCheck, Minus, ChevronRight, Flame } from 'lucide-react';
import type { PlanetPosition } from '../../types/astrology';
import { PLANET_SYMBOLS, PLANET_COLORS } from '../../types/astrology';
import { analyzePlanet, type DignityLevel } from '../../lib/core/planetaryAnalysis';
import { useTheme } from '../../hooks/useTheme';
import { ProgressBar } from '../shared/BarCharts';
import { useLang } from '../../i18n/LanguageContext';
import { labelPlanet, labelRashi, labelDignity, labelArea, labelOrdinalHouse } from '../../i18n/astroLabels';

const ACCENT = '#FF2E51';

interface Props {
  planet: PlanetPosition | null;
  ascendantRashiIndex: number;
  onClose: () => void;
  /** All grahas — enables combustion + Neecha Bhanga analysis. */
  allPlanets?: PlanetPosition[];
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

const VERDICT_COLORS: Record<string, string> = {
  'very-strong': '#10b981', 'strong': '#22c55e', 'moderate': '#eab308', 'weak': '#f59e0b', 'very-weak': '#ef4444',
};
const FUNCTIONAL_COLORS: Record<string, string> = {
  'yogakaraka': '#10b981', 'benefic': '#22c55e', 'neutral': '#94a3b8', 'mixed': '#eab308', 'malefic': '#f43f5e', 'maraka': '#ef4444',
};

export const PlanetDetailPanel: React.FC<Props> = ({ planet, ascendantRashiIndex, onClose, allPlanets }) => {
  const isLight = useTheme();
  const { lang, t } = useLang();

  // Chart context for combustion (Sun's longitude) + Neecha Bhanga (all signs).
  const chartContext = allPlanets && planet
    ? {
        longitude: planet.longitude,
        sunLongitude: allPlanets.find(p => p.planet === 'Sun')?.longitude,
        signByPlanet: Object.fromEntries(allPlanets.map(p => [p.planet, p.rashiIndex])),
      }
    : undefined;

  const analysis = planet && planet.planet !== 'ASCENDANT'
    ? analyzePlanet(planet.planet, planet.rashiIndex, ascendantRashiIndex, planet.isRetrograde, planet.rashiDegree, chartContext)
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
                  <h2 className="text-lg font-display font-bold" style={{ color: titleClr }}>{labelPlanet(displayName, lang)}</h2>
                  {analysis && (
                    <p className="text-xs font-mono" style={{ color: subClr }}>
                      {analysis.houseData.name} · {labelRashi(planet.rashiIndex, lang, planet.rashi)} · {planet.nakshatra} {t('nakshatra.pada', { n: planet.nakshatraPada })}
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
              <AscendantContent planet={planet!} lang={lang} t={t} isLight={isLight}
                panelBg={panelBg} titleClr={titleClr} bodyClr={bodyClr} mutedClr={mutedClr}
                cardBg={cardBg} cardBdr={cardBdr} />
            ) : analysis ? (
              <AnalysisContent analysis={analysis} planet={planet!} color={color} lang={lang} t={t} isLight={isLight}
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

type TFn = ReturnType<typeof useLang>['t'];

/* ── Ascendant special view ─────────────────────────────────────────────── */
function AscendantContent({ planet, lang, t, isLight, panelBg, titleClr, bodyClr, mutedClr, cardBg, cardBdr }: ThemeProps & { planet: PlanetPosition; lang: ReturnType<typeof useLang>['lang']; t: TFn }) {
  void panelBg;
  return (
    <div className="p-6 space-y-5">
      <div className="rounded-xl p-5"
        style={{ background: 'rgba(255,175,97,0.08)', border: '1px solid rgba(255,175,97,0.25)' }}>
        <div className="flex items-center gap-2 mb-3">
          <Home className="w-4 h-4" style={{ color: ACCENT }} />
          <span className="text-sm font-semibold" style={{ color: ACCENT }}>{t('planet.ascendantTitle')}</span>
        </div>
        <p className="text-sm leading-relaxed" style={{ color: bodyClr }}>
          {t('planet.ascendantDesc')}
        </p>
      </div>
      <InfoRow label={t('planet.rashi')}      value={labelRashi(planet.rashiIndex, lang, planet.rashi)}                                       isLight={isLight} cardBg={cardBg} cardBdr={cardBdr} titleClr={titleClr} mutedClr={mutedClr} />
      <InfoRow label={t('planet.nakshatra')}  value={`${planet.nakshatra} — ${t('nakshatra.pada', { n: planet.nakshatraPada })}`} isLight={isLight} cardBg={cardBg} cardBdr={cardBdr} titleClr={titleClr} mutedClr={mutedClr} />
      <InfoRow label={t('planet.degree')}     value={`${planet.rashiDegree.toFixed(2)}°`}               isLight={isLight} cardBg={cardBg} cardBdr={cardBdr} titleClr={titleClr} mutedClr={mutedClr} />
      <p className="text-xs leading-relaxed pt-4" style={{ color: mutedClr, borderTop: `1px solid ${cardBdr}` }}>
        {t('planet.ascendantFooter')}
      </p>
    </div>
  );
}

/* ── Full planet analysis view ──────────────────────────────────────────── */
interface AnalysisProps extends ThemeProps {
  analysis: ReturnType<typeof analyzePlanet>;
  planet: PlanetPosition;
  color: string;
  lang: ReturnType<typeof useLang>['lang'];
  t: TFn;
  subClr: string; secBg: string; secBdr: string; divClr: string;
}

function AnalysisContent({ analysis, planet, color, lang, t, isLight,
  panelBg, titleClr, bodyClr, mutedClr, subClr: _subClr, cardBg, cardBdr, secBg, secBdr, divClr }: AnalysisProps) {
  const DignityIcon = DIGNITY_ICONS[analysis.dignity];
  const verdictClr = VERDICT_COLORS[analysis.strength.verdict] ?? ACCENT;
  const funcClr = FUNCTIONAL_COLORS[analysis.functional.nature] ?? ACCENT;

  return (
    <div className="p-6 space-y-5 pb-10">

      {/* Overall strength — combined Sthana + Dig + Functional + Cheshta balas */}
      <div className="rounded-xl p-4" style={{ background: cardBg, border: `1px solid ${cardBdr}` }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono uppercase" style={{ color: mutedClr }}>{t('planet.overallStrength')}</span>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ color: verdictClr, background: `${verdictClr}1A`, border: `1px solid ${verdictClr}40` }}>
            {analysis.strength.verdictLabel}
          </span>
        </div>
        <div className="flex items-end gap-2 mb-2">
          <span className="text-3xl font-display font-black leading-none" style={{ color: titleClr }}>{analysis.strength.score}</span>
          <span className="text-xs mb-0.5" style={{ color: mutedClr }}>/ 100</span>
          {analysis.moolatrikona && (
            <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ color: '#8b5cf6', background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)' }}>
              ★ {t('planet.moolatrikona')}
            </span>
          )}
        </div>
        <ProgressBar pct={analysis.strength.score} color={verdictClr} height="md" index={0} />
        <p className="text-[11px] mt-2 leading-snug" style={{ color: bodyClr }}>{analysis.strength.summary}</p>
        <div className="mt-3 space-y-1.5">
          {analysis.strength.factors.map((f, i) => (
            <div key={f.label} className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase w-20 shrink-0" style={{ color: mutedClr }}>{f.label}</span>
              <div className="flex-1"><ProgressBar pct={Math.round(f.value * 100)} color={color} height="sm" index={i} /></div>
            </div>
          ))}
        </div>
      </div>

      {/* Functional nature (from the Ascendant) + Dig Bala */}
      <div className="rounded-xl p-4" style={{ background: cardBg, border: `1px solid ${cardBdr}` }}>
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <span className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ color: funcClr, background: `${funcClr}1A`, border: `1px solid ${funcClr}40` }}>
            {analysis.functional.label}
          </span>
          <span className="text-[10px] font-mono uppercase" style={{ color: mutedClr }}>{t('planet.functionalNature')}</span>
          {analysis.functional.rulesHouses.length > 0 && (
            <span className="text-[10px] font-mono ml-auto" style={{ color: mutedClr }}>
              {t('planet.rulesHouses')}: {analysis.functional.rulesHouses.join(', ')}
            </span>
          )}
        </div>
        <p className="text-xs leading-snug" style={{ color: bodyClr }}>{analysis.functional.desc}</p>
        {analysis.digBala.level !== 'na' && (
          <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${cardBdr}` }}>
            <span className="text-[10px] font-mono uppercase" style={{ color: mutedClr }}>{t('planet.digBala')}</span>
            <p className="text-[11px] mt-1 leading-snug" style={{ color: bodyClr }}>{analysis.digBala.desc}</p>
          </div>
        )}
      </div>

      {/* Neecha Bhanga — only when the planet is debilitated */}
      {analysis.neechaBhanga?.applies && (
        <div className="rounded-xl p-4" style={{
          background: analysis.neechaBhanga.cancelled ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)',
          border: `1px solid ${analysis.neechaBhanga.cancelled ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
        }}>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{
              color: analysis.neechaBhanga.cancelled ? '#10b981' : '#ef4444',
              background: analysis.neechaBhanga.cancelled ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
              border: `1px solid ${analysis.neechaBhanga.cancelled ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'}`,
            }}>
              {analysis.neechaBhanga.statusLabel}
            </span>
            <span className="text-[10px] font-mono uppercase" style={{ color: mutedClr }}>{t('planet.neechaBhanga')}</span>
          </div>
          <p className="text-xs leading-snug" style={{ color: bodyClr }}>{analysis.neechaBhanga.desc}</p>
          {analysis.neechaBhanga.reasons.length > 0 && (
            <ul className="mt-2 space-y-1">
              {analysis.neechaBhanga.reasons.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-[11px]" style={{ color: bodyClr }}>
                  <span style={{ color: '#10b981' }} className="mt-0.5">✓</span>{r}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Combustion — only when the planet is burnt by the Sun */}
      {analysis.combustion?.isCombust && (
        <div className="rounded-xl p-4" style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.28)' }}>
          <div className="flex items-center gap-2 mb-1.5">
            <Flame className="w-4 h-4" style={{ color: '#f59e0b' }} />
            <span className="text-xs font-bold" style={{ color: '#f59e0b' }}>{t('planet.combust')}</span>
            <span className="text-[10px] font-mono ml-auto" style={{ color: mutedClr }}>
              {analysis.combustion.separation.toFixed(1)}° / {analysis.combustion.limit}°
            </span>
          </div>
          <p className="text-xs leading-snug" style={{ color: bodyClr }}>{analysis.combustion.desc}</p>
        </div>
      )}

      {/* Dignity + House strip */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl p-4" style={{ background: cardBg, border: `1px solid ${cardBdr}` }}>
          <div className="flex items-center gap-2 mb-1">
            <DignityIcon className={`w-4 h-4 ${analysis.dignityInfo.color}`} />
            <span className={`text-xs font-semibold ${analysis.dignityInfo.color}`}>{labelDignity(analysis.dignity, lang)}</span>
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
            <span className="text-sm font-semibold text-pink-500">{t('planet.retrogradeTitle')}</span>
          </div>
          <div className="px-4 pb-4 pt-3 space-y-3" style={{ background: panelBg }}>
            <p className="text-sm leading-relaxed" style={{ color: bodyClr }}>{analysis.retrogradeEffect.general}</p>
            <div className="grid grid-cols-1 gap-2">
              {([
                { area: 'health', text: analysis.retrogradeEffect.health },
                { area: 'wealth', text: analysis.retrogradeEffect.wealth },
                { area: 'career', text: analysis.retrogradeEffect.career },
                { area: 'relationships', text: analysis.retrogradeEffect.relationships },
              ] as const).map(({ area, text }) => (
                <div key={area} className="flex items-start gap-2">
                  <span className="text-[10px] text-pink-500 font-mono uppercase mt-0.5 w-20 shrink-0">{labelArea(area, lang)}</span>
                  <p className="text-xs leading-snug" style={{ color: bodyClr }}>{text}</p>
                </div>
              ))}
            </div>
            {analysis.retrogradeEffect.intensified.length > 0 && (
              <div className="mt-3 rounded-lg px-3 py-2.5" style={{ background: 'rgba(244,114,182,0.06)', border: '1px solid rgba(244,114,182,0.12)' }}>
                <p className="text-[10px] text-pink-500 font-mono uppercase mb-1.5">{t('planet.intensifiedEffects')}</p>
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
                <p className="text-[10px] font-mono uppercase mb-2" style={{ color: isLight ? '#059669' : '#34d399' }}>{t('planet.strengths')}</p>
                <ul className="space-y-1.5">
                  {analysis.placement.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs" style={{ color: bodyClr }}>
                      <span style={{ color: isLight ? '#059669' : '#34d399' }} className="mt-0.5">✓</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg p-3" style={{ background: 'rgba(251,113,133,0.06)', border: '1px solid rgba(251,113,133,0.18)' }}>
                <p className="text-[10px] font-mono uppercase mb-2 text-rose-500">{t('planet.challenges')}</p>
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
            <span className="text-xs font-mono uppercase" style={{ color: mutedClr }}>{t('planet.lifeAreaImpact')}</span>
          </div>
          <div style={{ background: panelBg }}>
            {([
              { area: 'health', text: analysis.retrogradeEffect.health },
              { area: 'wealth', text: analysis.retrogradeEffect.wealth },
              { area: 'career', text: analysis.retrogradeEffect.career },
              { area: 'relationships', text: analysis.retrogradeEffect.relationships },
            ] as const).map(({ area, text }) => (
              <div key={area} className="flex items-start gap-3 px-4 py-3"
                style={{ borderBottom: `1px solid ${divClr}` }}>
                <span className="font-mono text-xs mt-0.5 w-24 shrink-0" style={{ color: ACCENT }}>
                  {AREA_ICONS[area]} {labelArea(area, lang)}
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
            <p className="text-[10px] font-mono uppercase mb-2" style={{ color: mutedClr }}>{t('planet.keywords')}</p>
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
            <p className="text-[10px] font-mono uppercase mb-2" style={{ color: mutedClr }}>{t('planet.bodyAreas')}</p>
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
          <p className="text-[10px] font-mono uppercase mb-3" style={{ color: mutedClr }}>{t('planet.remedies')}</p>
          <div className="space-y-2">
            {analysis.gemstone && (
              <div className="flex items-start gap-2">
                <span style={{ color: ACCENT }} className="text-xs mt-0.5">◆</span>
                <p className="text-xs" style={{ color: bodyClr }}>
                  <strong style={{ color: titleClr }}>{t('planet.gemstone')}:</strong> {analysis.gemstone}
                </p>
              </div>
            )}
            {analysis.mantra && (
              <div className="flex items-start gap-2">
                <span style={{ color: ACCENT }} className="text-xs mt-0.5">◎</span>
                <p className="text-xs font-mono" style={{ color: bodyClr }}>
                  <strong className="font-sans" style={{ color: titleClr }}>{t('planet.affirmation')}:</strong> {analysis.mantra}
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
        <InfoRow label={t('planet.degreeInRashi')} value={`${planet.rashiDegree.toFixed(2)}°`}
          isLight={isLight} cardBg={cardBg} cardBdr={cardBdr} titleClr={titleClr} mutedClr={mutedClr} />
        <InfoRow label={t('planet.house')}
          value={labelOrdinalHouse(analysis.house, lang)}
          isLight={isLight} cardBg={cardBg} cardBdr={cardBdr} titleClr={titleClr} mutedClr={mutedClr} />
        {planet.isRetrograde && (
          <InfoRow label={t('planet.motion')} value={t('planet.retrograde')} highlight
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
