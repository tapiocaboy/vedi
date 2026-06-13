/**
 * DeepInsights — Sookshma Dasha timeline + enhanced multi-level predictions
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  Loader2, Layers, ChevronRight, AlertTriangle, Sparkles,
  Heart, Briefcase, Wallet, Users, Star, Zap, Info, Orbit,
} from 'lucide-react';
import { getSookshmaPeriods, getCurrentPrediction } from '../../services/api';
import type { BirthData, DashaPredictionData, LordStrengthData } from '../../services/api';
import { BAR_PALETTE, DashaBarRow, LORD_HEX, ProgressBar, TREND_HEX } from '../shared/BarCharts';
import { useLang } from '../../i18n/LanguageContext';
import {
  labelArea, labelTrend, labelDashaLevel, labelPlanet, labelDignity, labelOrdinalHouse,
} from '../../i18n/astroLabels';

interface Props {
  birthData: BirthData;
}

const PLANET_COLOR: Record<string, string> = {
  Sun:     'bg-amber-500',
  Moon:    'bg-slate-400',
  Mars:    'bg-red-500',
  Mercury: 'bg-emerald-500',
  Jupiter: 'bg-yellow-500',
  Venus:   'bg-pink-500',
  Saturn:  'bg-sky-500',
  Rahu:    'bg-slate-600',
  Ketu:    'bg-orange-500',
};

const PLANET_LIGHT: Record<string, string> = {
  Sun:     'text-amber-400',
  Moon:    'text-slate-300',
  Mars:    'text-red-400',
  Mercury: 'text-emerald-400',
  Jupiter: 'text-yellow-400',
  Venus:   'text-pink-400',
  Saturn:  'text-sky-400',
  Rahu:    'text-slate-400',
  Ketu:    'text-orange-400',
};

const TREND_STYLES = {
  positive: { color: TREND_HEX.positive, text: 'text-green-400' },
  negative: { color: TREND_HEX.negative, text: 'text-red-400' },
  mixed:    { color: TREND_HEX.mixed,    text: 'text-amber-300' },
  neutral:  { color: TREND_HEX.neutral,  text: 'text-white/50' },
};

const AREA_META = {
  health:        { icon: Heart,    weight: 15 },
  wealth:        { icon: Wallet,   weight: 25 },
  career:        { icon: Briefcase,weight: 30 },
  relationships: { icon: Users,    weight: 20 },
  general:       { icon: Sparkles, weight: 10 },
};

// ── Dasha Hierarchy Card (bar chart) ─────────────────────────────────────────

function HierarchyCard({ prediction }: { prediction: DashaPredictionData }) {
  const { lang, t } = useLang();
  const p = prediction.currentPeriods;
  if (!p) return null;

  const nowMs = Date.now();

  const rows = [
    { label: labelDashaLevel('Mahadasha', lang),      lord: p.mahadasha.lord,      start: p.mahadasha.start,      end: p.mahadasha.end      },
    ...(p.antardasha      ? [{ label: labelDashaLevel('Antardasha', lang),     lord: p.antardasha.lord,     start: p.antardasha.start,     end: p.antardasha.end     }] : []),
    ...(p.pratyantardasha ? [{ label: labelDashaLevel('Pratyantardasha',lang), lord: p.pratyantardasha.lord,start: p.pratyantardasha.start,end: p.pratyantardasha.end }] : []),
    ...(p.sookshmaDasha   ? [{ label: labelDashaLevel('Sookshma Dasha', lang), lord: p.sookshmaDasha.lord,  start: p.sookshmaDasha.start,  end: p.sookshmaDasha.end  }] : []),
  ];

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-5">
        <Layers className="w-4 h-4 text-violet-400" />
        <span className="text-sm font-semibold text-white">{t('dasha.activeTitle')}</span>
        <span className="ml-auto text-[10px] text-white/30 font-mono">{t('insights.vimshottariNote')}</span>
      </div>

      <div className="space-y-5">
        {rows.map((r, i) => (
          <DashaBarRow key={r.label} {...r} lord={labelPlanet(r.lord, lang)} nowMs={nowMs} index={i} />
        ))}
      </div>

      <div className="mt-5 pt-4 border-t border-white/5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-white/40">{t('insights.periodStrength')}</span>
          <span className="text-sm font-bold text-white">{prediction.overallRating}<span className="text-white/30 font-normal">/10</span></span>
        </div>
        <ProgressBar pct={prediction.overallRating * 10} color={BAR_PALETTE.gold} index={rows.length} />
        <p className="text-xs text-white/50 mt-2 leading-relaxed">{prediction.overallTheme}</p>
      </div>
    </div>
  );
}

// ── Combination Effects ───────────────────────────────────────────────────────

function CombinationEffects({ prediction }: { prediction: DashaPredictionData }) {
  if (!prediction.combinationWarning && !prediction.combinationBonus) return null;

  return (
    <div className="space-y-2">
      {prediction.combinationBonus && (
        <div className="flex items-start gap-3 p-3 rounded-xl border border-violet-400/20 bg-violet-500/5">
          <Sparkles className="w-4 h-4 text-violet-300 shrink-0 mt-0.5" />
          <p className="text-sm text-violet-200/80">{prediction.combinationBonus}</p>
        </div>
      )}
      {prediction.combinationWarning && (
        <div className="flex items-start gap-3 p-3 rounded-xl border border-red-500/20 bg-red-500/5">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-200/70">{prediction.combinationWarning}</p>
        </div>
      )}
    </div>
  );
}

// ── Dasha Lord Strength ───────────────────────────────────────────────────────

const DIGNITY_BADGE_CLS: Record<string, string> = {
  'exalted':      'bg-emerald-500/15 text-emerald-300 border-emerald-400/30',
  'own-sign':     'bg-violet-500/15 text-violet-300 border-violet-400/30',
  'friend-sign':  'bg-sky-500/15 text-sky-300 border-sky-400/30',
  'neutral-sign': 'bg-white/8 text-white/60 border-white/15',
  'enemy-sign':   'bg-amber-500/15 text-amber-300 border-amber-400/30',
  'debilitated':  'bg-rose-500/15 text-rose-300 border-rose-400/30',
};

const FUNCTIONAL_BADGE: Record<string, { key: 'insights.functional.yogakaraka' | 'insights.functional.benefic' | 'insights.functional.malefic'; cls: string }> = {
  'yogakaraka':         { key: 'insights.functional.yogakaraka',      cls: 'bg-yellow-500/15 text-yellow-300 border-yellow-400/35' },
  'functional-benefic': { key: 'insights.functional.benefic', cls: 'bg-emerald-500/12 text-emerald-300 border-emerald-400/25' },
  'functional-malefic': { key: 'insights.functional.malefic', cls: 'bg-red-500/12 text-red-300 border-red-400/25' },
};


function strengthBarColor(score: number): string {
  if (score >= 1) return '#34d399';   // strong — emerald
  if (score >= 0) return BAR_PALETTE.gold;
  if (score >= -1) return '#fb923c';  // weak — orange
  return '#f43f5e';                   // very weak — rose
}

function LordStrengthRow({ lord, index }: { lord: LordStrengthData; index: number }) {
  const { lang, t } = useLang();
  const dignityCls = lord.dignity ? DIGNITY_BADGE_CLS[lord.dignity] : null;
  const functional = lord.functionalNature ? FUNCTIONAL_BADGE[lord.functionalNature] : null;
  // Normalize −2.5…+2.5 → 0…100
  const pct = ((lord.strengthScore + 2.5) / 5) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="rounded-xl border border-white/6 p-4 space-y-3"
    >
      <div className="flex items-center gap-2.5 flex-wrap">
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{ backgroundColor: LORD_HEX[lord.planet] ?? '#FF2E51' }}
        />
        <span className="text-sm font-bold text-white">{labelPlanet(lord.planet, lang)}</span>
        <span className="text-[10px] font-mono uppercase text-white/35">
          {lord.role === 'mahadasha' ? t('insights.lordRole.mahadasha') : t('insights.lordRole.antardasha')}
        </span>
        <span className="ml-auto text-sm font-bold text-white">
          {lord.strengthScore > 0 ? '+' : ''}{lord.strengthScore.toFixed(1)}
          <span className="text-white/30 font-normal text-xs"> / ±2.5</span>
        </span>
      </div>

      <ProgressBar pct={pct} color={strengthBarColor(lord.strengthScore)} height="sm" index={index} />

      <div className="flex flex-wrap gap-1.5">
        {lord.dignity && dignityCls && (
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${dignityCls}`}>
            {labelDignity(lord.dignity, lang)}
          </span>
        )}
        {lord.neechaBhanga && (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold border bg-cyan-500/12 text-cyan-300 border-cyan-400/25">
            {t('insights.neechaBhanga')}
          </span>
        )}
        {functional && (
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${functional.cls}`}>
            {t(functional.key)}
          </span>
        )}
        {lord.isCombust && (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold border bg-orange-500/12 text-orange-300 border-orange-400/25">
            {t('insights.combust')}
          </span>
        )}
        {lord.isRetrograde && (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold border bg-pink-500/12 text-pink-300 border-pink-400/25">
            {t('planet.retrograde')}
          </span>
        )}
        {lord.natalHouse != null && (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold border bg-white/6 text-white/55 border-white/12">
            {t('insights.inHouse', { n: lord.natalHouse })}
          </span>
        )}
        {lord.lordedHouses.length > 0 && (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold border bg-white/6 text-white/55 border-white/12">
            {t('insights.rulesHouses', { houses: lord.lordedHouses.map(h => labelOrdinalHouse(h, lang)).join(' & ') })}
          </span>
        )}
      </div>

      {lord.notes.length > 0 && (
        <p className="text-xs text-white/45 leading-relaxed">{lord.notes[0]}</p>
      )}
    </motion.div>
  );
}

function LordStrengthCard({ prediction }: { prediction: DashaPredictionData }) {
  const { t } = useLang();
  const lords = prediction.lordStrengths ?? [];
  if (!lords.length) return null;

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-1">
        <Star className="w-4 h-4 text-violet-400" />
        <span className="text-sm font-semibold text-white">{t('insights.lordStrengthTitle')}</span>
      </div>
      <p className="text-[11px] text-white/30 font-mono mb-4">
        {t('insights.lordStrengthSubtitle')}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {lords.map((lord, i) => (
          <LordStrengthRow key={lord.planet + lord.role} lord={lord} index={i} />
        ))}
      </div>
    </div>
  );
}

// ── Current Transits ──────────────────────────────────────────────────────────

function CurrentTransitsCard({ prediction }: { prediction: DashaPredictionData }) {
  const { t } = useLang();
  const transits = prediction.importantTransits ?? [];
  if (!transits.length) return null;

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-1">
        <Orbit className="w-4 h-4 text-violet-400" />
        <span className="text-sm font-semibold text-white">{t('now.transitsTitle')}</span>
      </div>
      <p className="text-[11px] text-white/30 font-mono mb-4">
        {t('insights.transitsSubtitle')}
      </p>
      <ul className="space-y-2">
        {transits.map((t, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-start gap-2.5 text-sm text-white/70 leading-relaxed"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400/60 mt-2 shrink-0" />
            {t}
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

// ── Area Breakdown ────────────────────────────────────────────────────────────

function AreaBreakdown({ prediction }: { prediction: DashaPredictionData }) {
  const { lang, t } = useLang();
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Star className="w-4 h-4 text-violet-400" />
        <span className="text-sm font-semibold text-white">{t('insights.lifeAreaTitle')}</span>
      </div>

      <div className="space-y-2">
        {Object.entries(prediction.predictions).map(([area, data]) => {
          const meta = AREA_META[area as keyof typeof AREA_META];
          if (!meta) return null;
          const Icon = meta.icon;
          const ts = TREND_STYLES[data.trend] ?? TREND_STYLES.neutral;
          const isOpen = expanded === area;

          return (
            <div key={area} className="rounded-xl border border-white/5 overflow-hidden">
              <button
                onClick={() => setExpanded(isOpen ? null : area)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/3 transition-colors text-left"
              >
                <Icon className="w-4 h-4 text-white/40 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-white/80">{labelArea(area, lang)}</span>
                    <span className={`text-xs font-mono ${ts.text}`}>{labelTrend(data.trend, lang)}</span>
                  </div>
                  <ProgressBar pct={meta.weight * 3} color={ts.color} height="sm" index={0} animate={false} />
                </div>
                <ChevronRight className={`w-3.5 h-3.5 text-white/25 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-white/5"
                  >
                    <div className="px-4 py-3 space-y-3">
                      <p className="text-sm text-white/60 leading-relaxed">{data.summary}</p>

                      {data.details.length > 0 && (
                        <ul className="space-y-1">
                          {data.details.map((d, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-white/45">
                              <span className="text-violet-400 mt-0.5 shrink-0">›</span>
                              <span>{d}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {data.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {data.keywords.map((kw, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-full text-[10px] bg-violet-500/8 text-violet-300 border border-violet-500/15">
                              {kw}
                            </span>
                          ))}
                        </div>
                      )}

                      {data.remedies.length > 0 && (
                        <div className="pt-1 border-t border-white/5">
                          <p className="text-[10px] text-white/25 uppercase tracking-widest mb-1.5">{t('common.remedies')}</p>
                          <ul className="space-y-1">
                            {data.remedies.map((r, i) => (
                              <li key={i} className="flex items-start gap-2 text-xs text-green-300/60">
                                <span className="mt-0.5">✓</span>
                                <span>{r}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Sookshma Timeline ─────────────────────────────────────────────────────────

function SookshmaTimeline({ birthData }: { birthData: BirthData }) {
  const { lang, t } = useLang();
  const { data, isLoading, error } = useQuery({
    queryKey: ['sookshma', birthData],
    queryFn: () => getSookshmaPeriods(birthData),
    enabled: !!birthData.date,
    staleTime: 10 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="glass-card rounded-2xl p-5 flex items-center gap-3">
        <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
        <span className="text-sm text-white/40 font-mono">{t('insights.sookshmaLoading')}</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="glass-card rounded-2xl p-5">
        <p className="text-sm text-white/30">{t('insights.sookshmaUnavailable')}</p>
      </div>
    );
  }

  const today = new Date();

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-1">
        <Zap className="w-4 h-4 text-violet-400" />
        <span className="text-sm font-semibold text-white">{t('insights.sookshmaTitle')}</span>
      </div>
      <p className="text-[11px] text-white/30 font-mono mb-4">
        {labelPlanet(data.mahadasha, lang)} · {labelPlanet(data.antardasha, lang)} · {labelPlanet(data.pratyantardasha, lang)} {labelDashaLevel('Pratyantardasha', lang)}
      </p>

      <div className="space-y-1.5">
        {data.sookshmas.map((sd, i) => {
          const dot  = PLANET_COLOR[sd.lord] ?? 'bg-violet-500';
          const col  = PLANET_LIGHT[sd.lord] ?? 'text-violet-400';
          const sdStart = new Date(sd.start);
          const sdEnd   = new Date(sd.end);
          const isPast    = sdEnd < today;
          const isCurrent = sd.isCurrent;
          const isFuture  = sdStart > today;
          const days = Math.round(sd.days);
          const startStr = sd.start.split('T')[0];
          const endStr   = sd.end.split('T')[0];

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                isCurrent
                  ? 'bg-violet-500/10 border border-violet-500/25'
                  : isPast
                  ? 'opacity-35'
                  : isFuture
                  ? 'border border-white/4'
                  : ''
              }`}
            >
              <div className={`w-2 h-2 rounded-full shrink-0 ${dot} ${isCurrent ? 'ring-2 ring-violet-400/50 ring-offset-1 ring-offset-black' : ''}`} />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${isCurrent ? col : 'text-white/70'}`}>{labelPlanet(sd.lord, lang)}</span>
                  {isCurrent && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-500/15 text-violet-300 font-mono">{t('dasha.nowBadge').toUpperCase()}</span>
                  )}
                  {isPast && <span className="text-[10px] text-white/20">{t('insights.past')}</span>}
                </div>
                <div className="text-[10px] text-white/25 font-mono mt-0.5">
                  {startStr} → {endStr}
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs text-white/30 font-mono">{days}d</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-white/5 flex items-start gap-2">
        <Info className="w-3 h-3 text-white/20 shrink-0 mt-0.5" />
        <p className="text-[10px] text-white/25 leading-relaxed">
          {t('insights.sookshmaNote')}
        </p>
      </div>
    </div>
  );
}

// ── Remedies Summary ──────────────────────────────────────────────────────────

function RemediesSummary({ prediction }: { prediction: DashaPredictionData }) {
  const { t } = useLang();
  const { remedies, favorableActivities, unfavorableActivities } = prediction;
  const hasRemedies = !!remedies.gemstone || !!remedies.mantra;
  if (!hasRemedies && !favorableActivities.length) return null;

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-violet-300" />
        <span className="text-sm font-semibold text-white">{t('insights.guidanceTitle')}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {hasRemedies && (
          <div className="space-y-3">
            <p className="text-[10px] text-white/30 uppercase tracking-widest font-mono">{t('insights.recommendations')}</p>
            {remedies.gemstone && (
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded bg-violet-500/15 border border-violet-500/25 flex items-center justify-center shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-sm bg-violet-400" />
                </div>
                <div>
                  <p className="text-[10px] text-white/30 uppercase tracking-wider">{t('remedy.gemstone')}</p>
                  <p className="text-sm text-white/80">{remedies.gemstone}</p>
                </div>
              </div>
            )}
            {remedies.mantra && (
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded bg-violet-500/15 border border-violet-500/25 flex items-center justify-center shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-violet-400" />
                </div>
                <div>
                  <p className="text-[10px] text-white/30 uppercase tracking-wider">{t('remedy.affirmation')}</p>
                  <p className="text-sm text-white/80">{remedies.mantra}</p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="space-y-3">
          {favorableActivities.length > 0 && (
            <div>
              <p className="text-[10px] text-white/30 uppercase tracking-widest font-mono mb-2">{t('insights.favorableNow')}</p>
              <ul className="space-y-1">
                {favorableActivities.slice(0, 5).map((a, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-green-300/60">
                    <span className="shrink-0 mt-0.5">✓</span>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {unfavorableActivities.length > 0 && (
            <div>
              <p className="text-[10px] text-white/30 uppercase tracking-widest font-mono mb-2">{t('dasha.avoid')}</p>
              <ul className="space-y-1">
                {unfavorableActivities.slice(0, 4).map((a, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-red-300/50">
                    <span className="shrink-0 mt-0.5">✗</span>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export const DeepInsights: React.FC<Props> = ({ birthData }) => {
  const { t } = useLang();
  const { data: prediction, isLoading, error } = useQuery({
    queryKey: ['currentPrediction', birthData],
    queryFn: () => getCurrentPrediction(birthData),
    enabled: !!birthData.date,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-16">
        <Loader2 className="w-5 h-5 animate-spin text-violet-400 mr-3" />
        <span className="text-sm text-white/40 font-mono">{t('insights.loading')}</span>
      </div>
    );
  }

  if (error || !prediction) {
    return (
      <div className="p-5 bg-red-500/8 border border-red-500/20 rounded-xl text-red-400 text-sm">
        {t('insights.failed')}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 4-level hierarchy + strength */}
      <HierarchyCard prediction={prediction} />

      {/* Dasha lord natal strength */}
      <LordStrengthCard prediction={prediction} />

      {/* Combination alerts */}
      <CombinationEffects prediction={prediction} />

      {/* Live transits feeding the prediction */}
      <CurrentTransitsCard prediction={prediction} />

      {/* Sookshma timeline */}
      <SookshmaTimeline birthData={birthData} />

      {/* Area breakdown */}
      <AreaBreakdown prediction={prediction} />

      {/* Remedies */}
      <RemediesSummary prediction={prediction} />
    </div>
  );
};

export default DeepInsights;
