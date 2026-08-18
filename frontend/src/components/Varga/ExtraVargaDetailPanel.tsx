import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Home, Sparkles } from 'lucide-react';
import { analyzeExtraVargaHouse } from '../../lib/core/vargaAnalysis';
import type { VargaPlanet, VargaCode } from '../../lib/core/vargas';
import { useTheme } from '../../hooks/useTheme';
import { useLang } from '../../i18n/LanguageContext';
import { labelPlanet, labelDignity, labelOrdinalHouse } from '../../i18n/astroLabels';

const GLYPH: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mars: '♂', Mercury: '☿', Jupiter: '♃',
  Venus: '♀', Saturn: '♄', Rahu: '☊', Ketu: '☋',
};
const DIGNITY_COLOR_DARK: Record<string, string> = {
  'exalted': '#34d399', 'own-sign': '#a78bfa', 'friend-sign': '#60a5fa',
  'neutral-sign': 'rgba(255,255,255,0.50)', 'enemy-sign': '#fbbf24', 'debilitated': '#f87171',
};
const DIGNITY_COLOR_LIGHT: Record<string, string> = {
  'exalted': '#059669', 'own-sign': '#7c3aed', 'friend-sign': '#2563eb',
  'neutral-sign': '#64748b', 'enemy-sign': '#d97706', 'debilitated': '#dc2626',
};

export interface ExtraVargaSelection {
  code: VargaCode;
  name: string;
  significance: string;
  rashi: number;
}

interface Props {
  selection: ExtraVargaSelection | null;
  vargaAscendant: number;
  planets: VargaPlanet[];
  onClose: () => void;
}

export const ExtraVargaDetailPanel: React.FC<Props> = ({ selection, vargaAscendant, planets, onClose }) => {
  const isLight = useTheme();
  const { lang, t } = useLang();

  const a = selection
    ? analyzeExtraVargaHouse(selection.code, selection.name, selection.significance, selection.rashi, vargaAscendant, planets, lang)
    : null;

  const dignityColor = isLight ? DIGNITY_COLOR_LIGHT : DIGNITY_COLOR_DARK;
  const cardBg = isLight ? '#f8fafc' : 'rgba(255,255,255,0.03)';
  const cardBdr = isLight ? '#E2E8F0' : 'rgba(255,255,255,0.06)';

  return (
    <AnimatePresence>
      {selection && a && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-6"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative glass-card w-full max-w-lg max-h-[88vh] flex flex-col overflow-hidden rounded-t-2xl sm:rounded-2xl"
          >
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b shrink-0"
              style={{ borderColor: cardBdr }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: 'rgba(var(--c-accent-rgb),0.10)', border: '1px solid rgba(var(--c-accent-rgb),0.22)' }}>
                <Home className="w-4.5 h-4.5" style={{ color: 'var(--c-accent)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`text-sm font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                  {a.plainChartName} — {labelOrdinalHouse(a.houseNumber, lang)}
                </h3>
                <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-white/45'}`}>
                  {a.code} · {a.vargaName} · {a.rashiName}
                </p>
              </div>
              <button onClick={onClose} aria-label={t('monthly.close')}
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isLight ? 'text-slate-400 hover:bg-slate-100' : 'text-white/50 hover:bg-white/8'}`}>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto p-4 space-y-4">
              {/* What this box means, in ordinary words */}
              <div>
                <div className="text-[10px] uppercase tracking-wider mb-1.5" style={{ color: 'var(--c-accent-2)' }}>
                  {t('varga.thisBoxMeans')}
                </div>
                <p className={`text-[12.5px] leading-relaxed ${isLight ? 'text-slate-700' : 'text-white/80'}`}>{a.reading}</p>
              </div>

              {/* The question the whole chart answers, for orientation */}
              <p className={`text-[11px] leading-relaxed italic ${isLight ? 'text-slate-500' : 'text-white/40'}`}>
                {a.question}
              </p>

              {/* Keywords */}
              <div className="flex flex-wrap gap-1.5">
                {a.keywords.map(k => (
                  <span key={k} className="px-2 py-0.5 rounded-md text-[10px] font-semibold"
                    style={{ background: cardBg, border: `1px solid ${cardBdr}`, color: isLight ? '#475569' : 'rgba(255,255,255,0.6)' }}>
                    {k}
                  </span>
                ))}
              </div>

              {/* Occupant planets */}
              <div>
                <div className="text-[10px] uppercase tracking-wider mb-2" style={{ color: 'var(--c-accent-2)' }}>
                  {a.planetEffects.length > 0 ? t('varga.planetsHere') : t('varga.emptyHouse')}
                </div>
                {a.planetEffects.length > 0 ? (
                  <div className="space-y-2">
                    {a.planetEffects.map(pe => (
                      <div key={pe.planet} className="rounded-xl p-3" style={{ background: cardBg, border: `1px solid ${cardBdr}` }}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-base font-bold" style={{ color: 'var(--c-accent)' }}>{GLYPH[pe.planet]}</span>
                          <span className={`text-xs font-bold ${isLight ? 'text-gray-800' : 'text-white'}`}>
                            {labelPlanet(pe.planet, lang)}{pe.isRetrograde ? ' ℞' : ''}
                          </span>
                          <span className="ml-auto px-1.5 py-0.5 rounded text-[9px] font-bold"
                            style={{ color: dignityColor[pe.dignity], border: `1px solid ${dignityColor[pe.dignity]}55` }}>
                            {labelDignity(pe.dignity, lang)}
                          </span>
                        </div>
                        <p className={`text-[11.5px] leading-relaxed ${isLight ? 'text-slate-600' : 'text-white/60'}`}>{pe.effect}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={`text-[11.5px] leading-relaxed flex items-start gap-1.5 ${isLight ? 'text-slate-500' : 'text-white/50'}`}>
                    <Sparkles className="w-3.5 h-3.5 mt-0.5 shrink-0 text-violet-300/70" />
                    <span>{t('varga.emptyHouseNote', { lord: a.rashiLord })}</span>
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
