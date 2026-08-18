import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Home, Sparkles, RotateCcw, Heart, Briefcase } from 'lucide-react';
import { analyzeVargaHouse, type VargaVariant } from '../../lib/core/vargaAnalysis';
import type { VargaPlanet } from '../../services/api';
import { useTheme } from '../../hooks/useTheme';
import { useLang } from '../../i18n/LanguageContext';
import {
  labelPlanet, labelRashi, labelRashiWestern, labelDignity, labelOrdinalHouse,
} from '../../i18n/astroLabels';

const ACCENT = 'var(--c-accent)';

const GLYPH: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mars: '♂', Mercury: '☿', Jupiter: '♃',
  Venus: '♀', Saturn: '♄', Rahu: '☊', Ketu: '☋',
};
const PLANET_COLOR: Record<string, string> = {
  Sun: '#f59e0b', Moon: '#94a3b8', Mars: '#ef4444', Mercury: '#22c55e',
  Jupiter: '#eab308', Venus: '#f472b6', Saturn: '#38bdf8', Rahu: '#a78bfa', Ketu: '#fb923c',
};

const DIGNITY_COLOR_DARK: Record<string, string> = {
  'exalted': '#34d399', 'own-sign': '#a78bfa', 'friend-sign': '#60a5fa',
  'neutral-sign': 'rgba(255,255,255,0.50)', 'enemy-sign': '#fbbf24', 'debilitated': '#f87171',
};
const DIGNITY_COLOR_LIGHT: Record<string, string> = {
  'exalted': '#059669', 'own-sign': '#7c3aed', 'friend-sign': '#2563eb',
  'neutral-sign': '#64748b', 'enemy-sign': '#d97706', 'debilitated': '#dc2626',
};

interface Props {
  variant: VargaVariant;
  rashiIndex: number | null;
  vargaAscendant: number;
  planets: VargaPlanet[];
  onClose: () => void;
}

export const VargaHouseDetailPanel: React.FC<Props> = ({
  variant, rashiIndex, vargaAscendant, planets, onClose,
}) => {
  const isLight = useTheme();
  const { lang, t } = useLang();

  const analysis = rashiIndex !== null
    ? analyzeVargaHouse(variant, rashiIndex, vargaAscendant, planets, lang)
    : null;

  const isD9 = variant === 'D9';
  const VariantIcon = isD9 ? Heart : Briefcase;
  const variantColor = isD9 ? '#f472b6' : '#38bdf8';
  const variantLabel = isD9 ? t('varga.navamsaChartLabel') : t('varga.dasamsaChartLabel');
  const chartName = isD9 ? 'navamsa' : 'dasamsa';

  const panelBg = isLight ? '#ffffff' : 'rgba(8,8,16,0.98)';
  const panelBdr = isLight ? '#D1DCE5' : 'rgba(139,92,246,0.2)';
  const headerBg = isLight ? 'rgba(255,255,255,0.97)' : 'rgba(8,8,16,0.95)';
  const headerBdr = isLight ? '#E2E8F0' : 'rgba(139,92,246,0.12)';
  const titleClr = isLight ? '#0f172a' : '#ffffff';
  const subClr = isLight ? '#64748b' : 'rgba(255,255,255,0.40)';
  const bodyClr = isLight ? '#374151' : 'rgba(255,255,255,0.65)';
  const mutedClr = isLight ? '#94a3b8' : 'rgba(255,255,255,0.35)';
  const cardBg = isLight ? '#f8fafc' : 'rgba(255,255,255,0.03)';
  const cardBdr = isLight ? '#E2E8F0' : 'rgba(255,255,255,0.07)';
  const sectionBg = isLight ? '#f1f5f9' : 'rgba(255,255,255,0.04)';
  const sectionBdr = isLight ? '#D1DCE5' : 'rgba(255,255,255,0.07)';
  const divClr = isLight ? '#E2E8F0' : 'rgba(255,255,255,0.05)';
  const dignityClr = isLight ? DIGNITY_COLOR_LIGHT : DIGNITY_COLOR_DARK;

  const rashiIdx = rashiIndex ?? 0;

  return (
    <AnimatePresence>
      {rashiIndex !== null && analysis && (
        <>
          <motion.div
            key="varga-bd"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 backdrop-blur-sm"
            style={{ background: isLight ? 'rgba(15,23,42,0.25)' : 'rgba(0,0,0,0.50)' }}
          />

          <motion.div
            key="varga-panel"
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
                  style={{ background: `${variantColor}14`, border: `1px solid ${variantColor}40` }}>
                  <span className="text-sm font-bold font-mono" style={{ color: variantColor }}>{analysis.houseNumber}</span>
                </div>
                <div>
                  <h2 className="text-lg font-display font-bold" style={{ color: titleClr }}>
                    {labelOrdinalHouse(analysis.houseNumber, lang)} — {analysis.theme}
                  </h2>
                  <p className="text-xs font-mono flex items-center gap-1.5" style={{ color: subClr }}>
                    <VariantIcon className="w-3 h-3" style={{ color: variantColor }} />
                    {variantLabel} · {labelRashi(rashiIdx, lang, analysis.rashiName)} ({labelRashiWestern(rashiIdx, lang, analysis.rashiEnglish)}) · {t('house.lordOf', { lord: labelPlanet(analysis.rashiLord, lang) })}
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
                style={{ background: `${variantColor}0d`, border: `1px solid ${variantColor}30` }}>
                {analysis.keywords.map(k => (
                  <span key={k} className="px-2 py-1 rounded-full text-xs font-mono"
                    style={{
                      background: isLight ? '#ffffff' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${variantColor}30`,
                      color: isLight ? '#475569' : 'rgba(255,255,255,0.65)',
                    }}>
                    {k}
                  </span>
                ))}
              </div>

              {/* Lagna badge */}
              {analysis.isLagna && (
                <div className="rounded-xl px-4 py-3 flex items-center gap-2"
                  style={{ background: 'rgba(var(--c-accent-rgb),0.08)', border: '1px solid rgba(var(--c-accent-rgb),0.25)' }}>
                  <Home className="w-4 h-4" style={{ color: ACCENT }} />
                  <p className="text-sm font-semibold" style={{ color: isLight ? '#9f1239' : ACCENT }}>
                    {isD9 ? t('varga.navamsaLagnaBadge') : t('varga.dasamsaLagnaBadge')}
                  </p>
                </div>
              )}

              {/* Specialised reading */}
              <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${sectionBdr}` }}>
                <div className="px-4 py-3" style={{ background: sectionBg }}>
                  <span className="text-xs font-mono uppercase" style={{ color: mutedClr }}>
                    {isD9 ? t('varga.marriageReading') : t('varga.careerReading')}
                  </span>
                </div>
                <div className="px-4 py-3" style={{ background: panelBg }}>
                  <p className="text-sm leading-relaxed" style={{ color: bodyClr }}>{analysis.reading}</p>
                </div>
              </div>

              {/* House lord placement */}
              <div className="rounded-xl px-4 py-3 flex items-center justify-between"
                style={{ background: cardBg, border: `1px solid ${cardBdr}` }}>
                <span className="text-xs font-mono uppercase" style={{ color: mutedClr }}>{t('varga.houseLord')}</span>
                <span className="text-sm font-bold" style={{ color: titleClr }}>
                  {labelPlanet(analysis.rashiLord, lang)}
                  {analysis.lordHouse > 0 && (
                    <span className="text-xs font-mono font-normal ml-2" style={{ color: mutedClr }}>
                      {t('varga.lordSitsIn', { house: labelOrdinalHouse(analysis.lordHouse, lang) })}
                    </span>
                  )}
                </span>
              </div>

              {/* Planets in this varga house */}
              {analysis.planetEffects.length > 0 ? (
                <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${sectionBdr}` }}>
                  <div className="px-4 py-3" style={{ background: sectionBg }}>
                    <span className="text-xs font-mono uppercase" style={{ color: mutedClr }}>
                      {isD9
                        ? t('varga.planetsHereMarriage', { n: analysis.planetEffects.length })
                        : t('varga.planetsHereCareer', { n: analysis.planetEffects.length })}
                    </span>
                  </div>
                  <div style={{ borderTop: `1px solid ${divClr}` }}>
                    {analysis.planetEffects.map(({ planet, effect, dignity, isVargottama, isRetrograde }) => (
                      <div key={planet} className="px-4 py-3 flex items-start gap-3"
                        style={{ borderBottom: `1px solid ${divClr}` }}>
                        <span className="text-2xl font-bold shrink-0 mt-0.5"
                          style={{ color: PLANET_COLOR[planet], textShadow: `0 0 8px ${PLANET_COLOR[planet]}55` }}>
                          {GLYPH[planet]}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-sm font-bold" style={{ color: titleClr }}>{labelPlanet(planet, lang)}</span>
                            <span className="text-xs font-semibold" style={{ color: dignityClr[dignity] }}>
                              {labelDignity(dignity, lang)}
                            </span>
                            {isVargottama && (
                              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                                style={{ color: ACCENT, background: 'rgba(var(--c-accent-rgb),0.08)', border: '1px solid rgba(var(--c-accent-rgb),0.25)' }}>
                                <Sparkles className="w-2.5 h-2.5" /> {t('varga.vargottama')}
                              </span>
                            )}
                            {isRetrograde && (
                              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-pink-500"
                                style={{ background: 'rgba(244,114,182,0.10)', border: '1px solid rgba(244,114,182,0.25)' }}>
                                <RotateCcw className="w-2.5 h-2.5" />{t('planet.retrograde')}
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
                    <p className="text-sm font-semibold" style={{ color: bodyClr }}>{t('house.emptyTitle')}</p>
                    <p className="text-xs mt-1 leading-relaxed" style={{ color: mutedClr }}>
                      {t('varga.emptyBody', {
                        chart: chartName,
                        lord: labelPlanet(analysis.rashiLord, lang),
                        placement: analysis.lordHouse > 0
                          ? t('varga.emptyPlacement', { house: labelOrdinalHouse(analysis.lordHouse, lang) })
                          : '',
                      })}
                    </p>
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
