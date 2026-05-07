/**
 * DeepInsights — Sookshma Dasha timeline + enhanced multi-level predictions
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  Loader2, Layers, ChevronRight, AlertTriangle, Sparkles,
  Heart, Briefcase, Wallet, Users, Star, Zap, Info,
} from 'lucide-react';
import { getSookshmaPeriods, getCurrentPrediction } from '../../services/api';
import type { BirthData, DashaPredictionData } from '../../services/api';

interface Props {
  birthData: BirthData;
}

const PLANET_COLOR: Record<string, string> = {
  Sun:     'bg-violet-500',
  Moon:    'bg-slate-400',
  Mars:    'bg-red-500',
  Mercury: 'bg-green-500',
  Jupiter: 'bg-violet-400',
  Venus:   'bg-pink-500',
  Saturn:  'bg-indigo-500',
  Rahu:    'bg-slate-600',
  Ketu:    'bg-violet-700',
};

const PLANET_LIGHT: Record<string, string> = {
  Sun:     'text-violet-400',
  Moon:    'text-slate-300',
  Mars:    'text-red-400',
  Mercury: 'text-green-400',
  Jupiter: 'text-violet-300',
  Venus:   'text-pink-400',
  Saturn:  'text-indigo-400',
  Rahu:    'text-slate-400',
  Ketu:    'text-violet-600',
};

const TREND_STYLES = {
  positive: { bar: 'bg-green-500', label: 'Favorable', text: 'text-green-400' },
  negative: { bar: 'bg-red-500',   label: 'Challenging', text: 'text-red-400' },
  mixed:    { bar: 'bg-violet-400', label: 'Mixed', text: 'text-violet-300' },
  neutral:  { bar: 'bg-white/30',  label: 'Neutral', text: 'text-white/50' },
};

const AREA_META = {
  health:        { icon: Heart,    label: 'Health',        weight: 15 },
  wealth:        { icon: Wallet,   label: 'Wealth',        weight: 25 },
  career:        { icon: Briefcase,label: 'Career',        weight: 30 },
  relationships: { icon: Users,    label: 'Relationships', weight: 20 },
  general:       { icon: Sparkles, label: 'General',       weight: 10 },
};

// ── Dasha Hierarchy Card ──────────────────────────────────────────────────────

function HierarchyCard({ prediction }: { prediction: DashaPredictionData }) {
  const { currentPeriods: p } = prediction;
  if (!p) return null;

  const levels = [
    { label: 'Mahadasha',       lord: p.mahadasha.lord,          start: p.mahadasha.start,          end: p.mahadasha.end,          depth: 0 },
    ...(p.antardasha        ? [{ label: 'Antardasha',       lord: p.antardasha.lord,         start: p.antardasha.start,         end: p.antardasha.end,         depth: 1 }] : []),
    ...(p.pratyantardasha   ? [{ label: 'Pratyantardasha',  lord: p.pratyantardasha.lord,    start: p.pratyantardasha.start,    end: p.pratyantardasha.end,    depth: 2 }] : []),
    ...(p.sookshmaDasha     ? [{ label: 'Sookshma Dasha',  lord: p.sookshmaDasha.lord,      start: p.sookshmaDasha.start,      end: p.sookshmaDasha.end,      depth: 3 }] : []),
  ];

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Layers className="w-4 h-4 text-violet-400" />
        <span className="text-sm font-semibold text-white">Active Dasha Periods</span>
        <span className="ml-auto text-xs text-white/30 font-mono">4-level Vimshottari</span>
      </div>

      <div className="space-y-0">
        {levels.map((lvl, i) => {
          const dot = PLANET_COLOR[lvl.lord] ?? 'bg-violet-500';
          const col = PLANET_LIGHT[lvl.lord] ?? 'text-violet-400';
          const startStr = lvl.start.split('T')[0];
          const endStr   = lvl.end.split('T')[0];
          const isLast   = i === levels.length - 1;

          return (
            <div key={lvl.label} className="flex items-start gap-3">
              {/* connector column */}
              <div className="flex flex-col items-center" style={{ width: 20 + lvl.depth * 12 }}>
                {i > 0 && <div className="w-px flex-1 bg-violet-500/20" style={{ minHeight: 8 }} />}
                <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${dot}`} />
                {!isLast && <div className="w-px flex-1 bg-violet-500/20" style={{ minHeight: 8 }} />}
              </div>

              {/* content */}
              <div className={`flex-1 pb-3 ${isLast ? '' : ''}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-white/35 font-mono uppercase tracking-widest">{lvl.label}</span>
                    <div className={`text-base font-bold ${col}`}>{lvl.lord}</div>
                  </div>
                  <div className="text-right text-[10px] text-white/30 font-mono">
                    <div>{startStr}</div>
                    <div className="text-white/20">→ {endStr}</div>
                  </div>
                </div>
                {isLast && (
                  <div className="mt-2 flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-violet-400" />
                    <span className="text-xs text-violet-300/70">Finest active period</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* overall rating bar */}
      <div className="mt-4 pt-4 border-t border-white/5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-white/40">Period Strength</span>
          <span className="text-sm font-bold text-white">{prediction.overallRating}<span className="text-white/30 font-normal">/10</span></span>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${prediction.overallRating * 10}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full rounded-full bg-gradient-to-r from-violet-600 to-violet-300"
          />
        </div>
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
        <div className="flex items-start gap-3 p-3 rounded-xl border border-violet-400/20 bg-violet-400/5">
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

// ── Area Breakdown ────────────────────────────────────────────────────────────

function AreaBreakdown({ prediction }: { prediction: DashaPredictionData }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Star className="w-4 h-4 text-violet-400" />
        <span className="text-sm font-semibold text-white">Life Area Insights</span>
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
                    <span className="text-sm font-medium text-white/80">{meta.label}</span>
                    <span className={`text-xs font-mono ${ts.text}`}>{ts.label}</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${ts.bar}`} style={{ width: `${meta.weight * 3}%` }} />
                  </div>
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
                            <span key={i} className="px-2 py-0.5 rounded-full text-[10px] bg-violet-500/8 text-violet-300/60 border border-violet-500/15">
                              {kw}
                            </span>
                          ))}
                        </div>
                      )}

                      {data.remedies.length > 0 && (
                        <div className="pt-1 border-t border-white/5">
                          <p className="text-[10px] text-white/25 uppercase tracking-widest mb-1.5">Remedies</p>
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
  const { data, isLoading, error } = useQuery({
    queryKey: ['sookshma', birthData],
    queryFn: () => getSookshmaPeriods(birthData),
    enabled: !!birthData.date,
    staleTime: 10 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="glass-card rounded-2xl p-5 flex items-center gap-3">
        <Loader2 className="w-4 h-4 animate-spin text-violet-500" />
        <span className="text-sm text-white/40 font-mono">Calculating Sookshma periods…</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="glass-card rounded-2xl p-5">
        <p className="text-sm text-white/30">Sookshma data unavailable.</p>
      </div>
    );
  }

  const today = new Date();

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-1">
        <Zap className="w-4 h-4 text-violet-400" />
        <span className="text-sm font-semibold text-white">Sookshma Dasha Timeline</span>
      </div>
      <p className="text-[11px] text-white/30 font-mono mb-4">
        {data.mahadasha} · {data.antardasha} · {data.pratyantardasha} Pratyantardasha
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
                  <span className={`text-sm font-semibold ${isCurrent ? col : 'text-white/70'}`}>{sd.lord}</span>
                  {isCurrent && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-500/15 text-violet-300 font-mono">NOW</span>
                  )}
                  {isPast && <span className="text-[10px] text-white/20">past</span>}
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
          Sookshma Dasha is the 4th and finest level of Vimshottari. Each period lasts only a few days and indicates the micro-influence of planets on daily life.
        </p>
      </div>
    </div>
  );
}

// ── Remedies Summary ──────────────────────────────────────────────────────────

function RemediesSummary({ prediction }: { prediction: DashaPredictionData }) {
  const { remedies, favorableActivities, unfavorableActivities } = prediction;
  const hasRemedies = !!remedies.gemstone || !!remedies.mantra;
  if (!hasRemedies && !favorableActivities.length) return null;

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-violet-300" />
        <span className="text-sm font-semibold text-white">Guidance</span>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {hasRemedies && (
          <div className="space-y-3">
            <p className="text-[10px] text-white/30 uppercase tracking-widest font-mono">Recommendations</p>
            {remedies.gemstone && (
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-sm bg-purple-400" />
                </div>
                <div>
                  <p className="text-[10px] text-white/30 uppercase tracking-wider">Gemstone</p>
                  <p className="text-sm text-white/80">{remedies.gemstone}</p>
                </div>
              </div>
            )}
            {remedies.mantra && (
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded bg-violet-500/20 border border-violet-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-violet-400" />
                </div>
                <div>
                  <p className="text-[10px] text-white/30 uppercase tracking-wider">Affirmation</p>
                  <p className="text-sm text-white/80">{remedies.mantra}</p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="space-y-3">
          {favorableActivities.length > 0 && (
            <div>
              <p className="text-[10px] text-white/30 uppercase tracking-widest font-mono mb-2">Favorable Now</p>
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
              <p className="text-[10px] text-white/30 uppercase tracking-widest font-mono mb-2">Avoid</p>
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
  const { data: prediction, isLoading, error } = useQuery({
    queryKey: ['currentPrediction', birthData],
    queryFn: () => getCurrentPrediction(birthData),
    enabled: !!birthData.date,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-16">
        <Loader2 className="w-5 h-5 animate-spin text-violet-500 mr-3" />
        <span className="text-sm text-white/40 font-mono">Loading deep insights…</span>
      </div>
    );
  }

  if (error || !prediction) {
    return (
      <div className="p-5 bg-red-500/8 border border-red-500/20 rounded-xl text-red-400 text-sm">
        Failed to load insights.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 4-level hierarchy + strength */}
      <HierarchyCard prediction={prediction} />

      {/* Combination alerts */}
      <CombinationEffects prediction={prediction} />

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
