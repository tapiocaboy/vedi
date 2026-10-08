/**
 * Everything about one antardasha, in a single panel — plain language first.
 *
 * Every view leads with what a reader with no astrology needs (a headline, one
 * sentence per sub-period, what to do when), and keeps the technical layer —
 * weights, transit hits, house lordships, the classical judgement — behind
 * "The astrology behind this".
 *
 * The period's outlook, remedies and activities are governed by the mahadasha
 * and antardasha lords, so they are stated once under "Outlook". The nine
 * pratyantardashas below carry only what actually varies between them —
 * weight, tone, the transits that land in each, and any shift they cause.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  Loader2,
  Scale,
  Target,
  Scissors,
  Hammer,
  ShieldCheck,
  ArrowRight,
  Orbit,
  Layers,
  Star,
  Shuffle,
  CalendarRange,
  Compass,
} from 'lucide-react';
import type {
  BirthData,
  AntardashaDepthReport,
  WeightedPratyantardasha,
  StrategyWindow,
  TransitHit,
} from '../../services/api';
import { getAntardashaDepth } from '../../services/api';
import { DASHA_COLORS, planetDisplayColor } from '../../types/astrology';
import { TapBadge, tapVars } from '../shared/tapTarget';
import { formatDate, formatDays } from '../../utils/dateUtils';
import { useLang } from '../../i18n/LanguageContext';
import { coreLang } from '../../i18n/translations';
import { labelPlanet, labelArea, labelTrend } from '../../i18n/astroLabels';
import { useTheme } from '../../hooks/useTheme';
import { PredictionBody } from './PredictionBody';
import { AstroDisclosure, AreaWhyBody } from '../shared/AreaWhy';
import { plainPeriodHeader, plainSubPeriodLine } from '../../lib/core/plainSummary';
import { buildAreaReading } from '../../lib/core/areaReading';
import { READING_LABELS, SUBPERIODS_INTRO, WINDOW_PLAIN } from '../../lib/core/text/readingText';

/** Matches the app-level tab pills so the accent stays theme-driven. */
const ACCENT = 'var(--c-accent)';

interface Props {
  birthData: BirthData;
  mahadashaLord: string;
  antardashaLord: string;
  /** ISO start of the exact antardasha instance being expanded. */
  antardashaStart: string;
}

type Tab = 'periods' | 'outlook' | 'strategy';

const BAND_STYLE: Record<string, { bar: string; chip: string }> = {
  heavy:    { bar: 'bg-rose-400',   chip: 'bg-rose-500/10 text-rose-400 border-rose-500/30' },
  strong:   { bar: 'bg-violet-400', chip: 'bg-violet-400/10 text-violet-300 border-violet-400/30' },
  moderate: { bar: 'bg-violet-500', chip: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
  light:    { bar: 'bg-white/25',   chip: 'bg-white/4 text-white/50 border-white/8' },
};

const TONE_STYLE: Record<string, string> = {
  constructive: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  testing:      'bg-rose-500/10 text-rose-400 border-rose-500/30',
  mixed:        'bg-violet-400/10 text-violet-300 border-violet-400/30',
};

const HIT_ICON: Record<string, string> = {
  conjunction: '☌',
  opposition: '☍',
  ingress: '→',
  'station-retrograde': '℞',
  'station-direct': 'D',
};

// ─── Sub-period row ─────────────────────────────────────────────────────────

const PeriodRow: React.FC<{
  period: WeightedPratyantardasha;
  mahadashaLord: string;
  antardashaLord: string;
}> = ({ period, mahadashaLord, antardashaLord }) => {
  const { lang, t } = useLang();
  const [expanded, setExpanded] = useState(false);

  const band = BAND_STYLE[period.band] ?? BAND_STYLE.light;
  const stack = `${labelPlanet(mahadashaLord, lang)} – ${labelPlanet(antardashaLord, lang)} – ${labelPlanet(period.lord, lang)}`;
  const hasDetail =
    period.factors.length > 0 ||
    period.transitHits.length > 0 ||
    period.trendShifts.length > 0 ||
    period.addedDetails.length > 0;

  return (
    <div className={`rounded-lg border overflow-hidden ${period.isCurrent ? 'border-violet-400' : 'border-white/6'} bg-white/3`}>
      <button
        onClick={() => setExpanded(!expanded)}
        disabled={!hasDetail}
        aria-expanded={hasDetail ? expanded : undefined}
        data-open={expanded}
        className={`w-full py-3 pr-3 text-left transition-colors ${hasDetail ? 'tap-row tap-blink pl-5' : 'cursor-default pl-3'}`}
        style={hasDetail ? tapVars(planetDisplayColor(period.lord.toUpperCase(), false)) : undefined}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`dasha-dot w-2.5 h-2.5 rounded-full ${DASHA_COLORS[period.lord] || 'bg-slate-500'}`} />
              <span className="font-medium text-white text-sm">{stack}</span>
              {period.isCurrent && (
                <span className="px-2 py-0.5 bg-violet-500 rounded text-xs text-white">{t('dasha.nowBadge')}</span>
              )}
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${band.chip}`}>
                {t(`depth.band.${period.band}` as 'depth.band.heavy')}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${TONE_STYLE[period.tone]}`}>
                {t(`depth.tone.${period.tone}` as 'depth.tone.mixed')}
              </span>
            </div>
            <div className="mt-1.5 font-mono text-xs text-white/50">
              {formatDate(period.start)} – {formatDate(period.end)} · {formatDays(period.days)}
            </div>
            <p className={`mt-1.5 text-xs text-white/65 ${expanded ? '' : 'line-clamp-2'}`}>{plainSubPeriodLine(period.lord, coreLang(lang))}</p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {hasDetail && <TapBadge open={expanded} direction="down" />}
          </div>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/6"
          >
            <div className="p-3 space-y-3">
              {/* What moves relative to the period outlook — in plain words */}
              {period.trendShifts.length > 0 && (
                <div>
                  <h6 className="text-xs font-semibold text-white/70 mb-2 flex items-center gap-1.5">
                    <Shuffle className="w-3.5 h-3.5 text-violet-400" />
                    {t('depth.changes')}
                  </h6>
                  <ul className="space-y-1">
                    {period.trendShifts.map((s, i) => (
                      <li key={`t${i}`} className="flex items-center gap-2 text-xs text-white/50">
                        <span className="text-white/70 font-medium">{labelArea(s.area, lang)}</span>
                        <span className="text-white/40">{labelTrend(s.from, lang)}</span>
                        <ArrowRight className="w-3 h-3 text-violet-400" />
                        <span className="text-violet-300">{labelTrend(s.to, lang)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <AstroDisclosure showLabel={READING_LABELS.showWhy[coreLang(lang)]} hideLabel={READING_LABELS.hideWhy[coreLang(lang)]}>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-white/50">{t('depth.weight')}</span>
                    <span className="font-mono font-bold text-white">{period.weight.toFixed(1)}</span>
                    <div className="w-16 h-1.5 rounded-full bg-white/8 overflow-hidden">
                      <div className={`h-full rounded-full ${band.bar}`} style={{ width: `${period.weight * 10}%` }} />
                    </div>
                  </div>
                  <p className="text-xs text-white/55">{period.headline}</p>

                  {period.factors.length > 0 && (
                    <div>
                      <h6 className="text-xs font-semibold text-white/70 mb-2 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-violet-400" />
                        {t('depth.factors')}
                      </h6>
                      <ul className="space-y-1.5">
                        {period.factors.map((f, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs">
                            <span className="font-mono text-violet-400 shrink-0 w-10 text-right">+{f.points.toFixed(1)}</span>
                            <span className="text-white/50">
                              <span className="text-white/70 font-medium">{f.label}</span> — {f.detail}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {period.transitHits.length > 0 && (
                    <div>
                      <h6 className="text-xs font-semibold text-white/70 mb-2 flex items-center gap-1.5">
                        <Orbit className="w-3.5 h-3.5 text-violet-400" />
                        {t('depth.transitEvents')}
                      </h6>
                      <ul className="space-y-1">
                        {period.transitHits.map((h: TransitHit, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-white/50">
                            <span className="font-mono text-violet-300 shrink-0">{HIT_ICON[h.kind] ?? '•'}</span>
                            <span className="font-mono text-white/40 shrink-0">{formatDate(h.date)}</span>
                            <span>{h.detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {period.addedDetails.length > 0 && (
                    <ul className="space-y-1">
                      {period.addedDetails.map((d, i) => (
                        <li key={`d${i}`} className="flex items-start gap-2 text-xs text-white/50">
                          <span className="text-violet-400 mt-0.5">•</span>
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </AstroDisclosure>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Strategy window list ───────────────────────────────────────────────────

const WindowList: React.FC<{
  title: string;
  /** What this kind of window is for, in plain words — said once for the list. */
  plain: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  windows: StrategyWindow[];
}> = ({ title, plain, icon: Icon, accent, windows }) => {
  const { lang } = useLang();
  if (!windows.length) return null;
  return (
    <div className="p-3 bg-white/3 rounded-lg border border-white/6">
      <h6 className={`text-xs font-semibold mb-1 flex items-center gap-1.5 ${accent}`}>
        <Icon className="w-3.5 h-3.5" />
        {title}
      </h6>
      <p className="text-xs text-white/60 mb-2">{plain}</p>
      <ul className="space-y-1.5">
        {windows.map((w, i) => (
          <li key={i} className="text-xs flex items-center gap-2 flex-wrap">
            <span className={`dasha-dot w-2 h-2 rounded-full ${DASHA_COLORS[w.lord] || 'bg-slate-500'}`} />
            <span className="text-white/70 font-medium">{labelPlanet(w.lord, lang)}</span>
            <span className="font-mono text-white/40">{formatDate(w.start)} – {formatDate(w.end)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

/** The classical judgement of the pair: score, verdict, headline and its factors. */
const ClassicalReading: React.FC<{ judgement: AntardashaDepthReport['judgement'] }> = ({ judgement }) => {
  const { t } = useLang();
  return (
    <div>
      <h5 className="text-xs font-semibold text-white/70 mb-1.5 flex items-center gap-2">
        <Scale className="w-3.5 h-3.5 text-violet-400" />
        {t('depth.classicalReading')} · {judgement.score}/10 · {t(`depth.verdict.${judgement.verdict}` as 'depth.verdict.mixed')}
      </h5>
      <p className="text-xs text-white/65">{judgement.headline}</p>
      {judgement.factors.length > 0 && (
        <div className="mt-2">
          <h6 className="text-xs font-semibold text-white/60 mb-1.5">{t('depth.whyThisPeriod')}</h6>
          <ul className="space-y-1.5">
            {judgement.factors.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-xs">
                <span className={`font-mono shrink-0 w-11 text-right ${f.points > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {f.points > 0 ? '+' : ''}{f.points}
                </span>
                <span className="text-white/50">
                  <span className="text-white/70 font-medium">{f.label}</span> — {f.detail}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// ─── Main ───────────────────────────────────────────────────────────────────

export const AntardashaPanel: React.FC<Props> = ({
  birthData,
  mahadashaLord,
  antardashaLord,
  antardashaStart,
}) => {
  const { lang, t } = useLang();
  const isLight = useTheme();
  const [tab, setTab] = useState<Tab>('periods');

  const { data: report, isLoading } = useQuery<AntardashaDepthReport | null>({
    queryKey: ['antardashaDepth', antardashaStart, birthData, lang],
    queryFn: () => getAntardashaDepth(birthData, antardashaStart, undefined, coreLang(lang)),
    staleTime: 10 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="mt-3 p-6 glass-card rounded-lg flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-violet-500 mr-2" />
        <span className="text-sm text-white/50 font-mono">{t('depth.loading')}</span>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="mt-3 p-4 glass-card rounded-lg">
        <p className="text-sm text-white/50">{t('depth.unavailable')}</p>
      </div>
    );
  }

  const { strategy, prediction, judgement } = report;
  const L = coreLang(lang);
  const header = plainPeriodHeader({
    lang: L, mahadasha: mahadashaLord, antardasha: antardashaLord,
    overallRating: prediction.overallRating, overallPercentile: prediction.overallPercentile,
  });
  const overallReading = prediction.overallExplanation
    ? buildAreaReading({
        area: 'general', lang: L, score: prediction.overallScore ?? prediction.overallRating, trend: prediction.predictions.general?.trend ?? 'neutral',
        explanation: prediction.overallExplanation, indicators: prediction.indicators, hasSky: false, mahadasha: mahadashaLord, overall: true,
      })
    : null;
  const showWhy = READING_LABELS.showWhy[L];
  const hideWhy = READING_LABELS.hideWhy[L];

  const TABS: Array<{ id: Tab; label: string; icon: React.ElementType }> = [
    { id: 'periods', label: t('depth.tabPeriods'), icon: CalendarRange },
    { id: 'outlook', label: t('depth.tabOutlook'), icon: Compass },
    { id: 'strategy', label: t('depth.tabStrategy'), icon: Target },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3 glass-card rounded-lg overflow-hidden"
    >
      {/* Period header — stated once for the whole panel, in plain words */}
      <div className="p-4 bg-gradient-to-r from-violet-800 to-violet-700">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h4 className="font-display font-semibold text-lg text-white">
              {labelPlanet(mahadashaLord, lang)} – {labelPlanet(antardashaLord, lang)}
            </h4>
            <div className="font-mono text-xs text-white/70 mt-0.5">
              {formatDate(report.start)} – {formatDate(report.end)} · {formatDays(report.days)}
            </div>
            <p className="text-white text-sm font-semibold mt-2">{header.headline}</p>
            <p className="text-white/80 text-sm mt-0.5">{header.line}</p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-white/70 text-xs">{t('dasha.rating')}</div>
            <div className="flex items-center gap-1 justify-end">
              <Star className="w-4 h-4 text-violet-300 fill-violet-300" />
              <span className="font-bold text-lg text-white">{prediction.overallRating}/10</span>
            </div>
          </div>
        </div>
      </div>

      {/* Where the period stands, and the astrology behind the headline */}
      <div className="px-4 pt-3 pb-1">
        {header.standing && <p className="text-xs text-white/55">{header.standing}</p>}
        <AstroDisclosure showLabel={showWhy} hideLabel={hideWhy}>
          <div className="space-y-4">
            <p className="text-xs text-white/65 leading-relaxed">{prediction.overallTheme}</p>
            <ClassicalReading judgement={judgement} />
            {overallReading && <AreaWhyBody reading={overallReading} />}
          </div>
        </AstroDisclosure>
      </div>

      {/* Tabs — a segmented control on its own track, so the whole strip reads
          as clickable rather than as a row of labels. */}
      <div className="p-2 border-b border-white/6">
        <div
          className={`flex gap-1.5 rounded-xl p-1.5 ${
            isLight ? 'bg-gray-200/70' : 'bg-black/30'
          }`}
          role="tablist"
        >
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                role="tab"
                aria-selected={active}
                onClick={() => setTab(id)}
                // Every tab carries its own surface, so the whole strip reads as
                // three buttons rather than one button and two labels.
                className={`relative flex-1 flex items-center justify-center gap-1.5 rounded-lg px-2 py-2.5 text-xs font-semibold tracking-wide border transition-colors duration-200 ${
                  active
                    ? 'text-white on-accent border-transparent shadow-sm'
                    : isLight
                      ? 'bg-white border-gray-300 text-gray-600 shadow-sm hover:bg-gray-50 hover:text-gray-900'
                      : 'bg-white/10 border-white/15 text-white/75 hover:bg-white/20 hover:text-white'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId={`ad-tab-pill-${antardashaStart}`}
                    className="absolute inset-0 rounded-lg shadow-sm"
                    style={{ backgroundColor: ACCENT }}
                    transition={{ type: 'spring', stiffness: 480, damping: 38 }}
                  />
                )}
                <Icon className="relative z-10 w-3.5 h-3.5 shrink-0" />
                <span className="relative z-10">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sub-periods */}
      {tab === 'periods' && (
        <div>
          <div className="p-4 pb-0">
            <p className="text-xs text-white/55">{SUBPERIODS_INTRO[L]}</p>
          </div>

          <div className="p-4 space-y-2">
            {report.periods.map(period => (
              <PeriodRow
                key={period.start}
                period={period}
                mahadashaLord={mahadashaLord}
                antardashaLord={antardashaLord}
              />
            ))}
          </div>

          <div className="px-4 pb-4">
            <AstroDisclosure showLabel={showWhy} hideLabel={hideWhy}>
              <div className="space-y-3">
                {strategy.peaks && (
                  <div>
                    <h5 className="text-xs font-semibold text-violet-300 mb-1">{t('depth.peaks')}</h5>
                    <p className="text-xs text-white/65">{strategy.peaks}</p>
                  </div>
                )}
                <div>
                  <h5 className="text-xs font-semibold text-white/70 mb-1.5 flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-violet-400" />
                    {t('depth.whatIsWeight')}
                  </h5>
                  <ul className="space-y-1.5">
                    {report.weightDefinition.map((line, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-white/50">
                        <span className="text-violet-400 mt-0.5">•</span>
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </AstroDisclosure>
          </div>
        </div>
      )}

      {/* Outlook — stated once for the period */}
      {tab === 'outlook' && <PredictionBody prediction={prediction} />}

      {/* Strategy — what to do, in plain words; the classical reasoning underneath */}
      {tab === 'strategy' && (
        <div className="p-4 space-y-3">
          <div className="p-3 bg-violet-500/10 rounded-lg border border-violet-500/25">
            <h6 className="text-xs font-semibold text-violet-300 mb-1">{t('depth.oneLine')}</h6>
            <p className="text-sm text-white/85">{strategy.oneLine}</p>
          </div>

          <div className="p-3 bg-white/3 rounded-lg border border-white/6">
            <h5 className="text-sm font-semibold text-white/70 mb-1 flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" />
              {t('depth.profitTitle')}
            </h5>
            <div className="text-sm font-medium text-white mt-1">{strategy.stanceHeadline}</div>
          </div>

          <WindowList
            title={t('depth.actionWindows')}
            plain={WINDOW_PLAIN.action[L]}
            icon={Target}
            accent="text-emerald-400"
            windows={strategy.actionWindows}
          />
          <WindowList
            title={t('depth.defensiveWindows')}
            plain={WINDOW_PLAIN.defensive[L]}
            icon={Scissors}
            accent="text-rose-400"
            windows={strategy.defensiveWindows}
          />
          <WindowList
            title={t('depth.buildWindows')}
            plain={WINDOW_PLAIN.build[L]}
            icon={Hammer}
            accent="text-violet-300"
            windows={strategy.buildWindows}
          />

          {strategy.protect.length > 0 && (
            <div className="p-3 bg-white/3 rounded-lg border border-white/6">
              <h6 className="text-xs font-semibold text-white/70 mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-violet-400" />
                {t('depth.protect')}
              </h6>
              <ul className="space-y-1">
                {strategy.protect.map((line, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-white/50">
                    <span className="text-violet-400 mt-0.5">•</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {strategy.nextHarvest && (
            <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
              <h6 className="text-xs font-semibold text-emerald-400 mb-1 flex items-center gap-1.5">
                <ArrowRight className="w-3.5 h-3.5" />
                {t('depth.nextHarvest')}
              </h6>
              <div className="text-xs text-white/70">
                <span className="font-medium">
                  {labelPlanet(mahadashaLord, lang)} – {labelPlanet(strategy.nextHarvest.lord, lang)}
                </span>
                <span className="font-mono text-white/40 ml-2">
                  {formatDate(strategy.nextHarvest.start)} – {formatDate(strategy.nextHarvest.end)}
                </span>
              </div>
              <p className="text-xs text-white/50 mt-1">{strategy.nextHarvest.note}</p>
            </div>
          )}

          <AstroDisclosure showLabel={showWhy} hideLabel={hideWhy}>
            <div className="space-y-4">
              <ClassicalReading judgement={judgement} />
              <p className="text-xs text-white/60 leading-relaxed">{strategy.stanceBody}</p>
              {[...strategy.actionWindows, ...strategy.defensiveWindows, ...strategy.buildWindows].length > 0 && (
                <ul className="space-y-2">
                  {[...strategy.actionWindows, ...strategy.defensiveWindows, ...strategy.buildWindows].map((w, i) => (
                    <li key={i} className="text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`dasha-dot w-2 h-2 rounded-full ${DASHA_COLORS[w.lord] || 'bg-slate-500'}`} />
                        <span className="text-white/70 font-medium">{labelPlanet(w.lord, lang)}</span>
                        <span className="font-mono text-white/40">{formatDate(w.start)}</span>
                      </div>
                      <p className="text-white/50 mt-0.5 pl-4">{w.reason}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </AstroDisclosure>
        </div>
      )}
    </motion.div>
  );
};

export default AntardashaPanel;
