/**
 * PlainSummaryCard — the running period in everyday words, for the top of the
 * Now tab: a one-line headline, one sentence per life area, what suits this
 * phase and what to go easy on, and the exact dates the phases change.
 *
 * Built client-side from the same prediction the rest of the tab shows (see
 * lib/core/plainSummary.ts); it adds wording, not new judgement. Each area —
 * and the overall rating — opens onto "the astrology behind this": how its score
 * adds up, the classical combinations active now and how they held up against
 * real lives (lib/core/areaReading.ts).
 */

import React, { useMemo } from 'react';
import { Lightbulb, Briefcase, Wallet, Users, Heart, CheckCircle, MinusCircle, CalendarClock } from 'lucide-react';
import type { PeriodSnapshot } from '../../services/api';
import { buildPlainSummary, type AreaKey, type TrendKey } from '../../lib/core/plainSummary';
import { buildAreaReading, type AreaReading } from '../../lib/core/areaReading';
import { AreaWhy } from '../shared/AreaWhy';
import { useLang } from '../../i18n/LanguageContext';
import { coreLang } from '../../i18n/translations';

const AREA_ICON: Record<AreaKey, React.ComponentType<{ className?: string }>> = {
  career: Briefcase, wealth: Wallet, relationships: Users, health: Heart,
};

/** Left-edge tone of each area row. Data colours stay the same in every theme. */
const TREND_BAR: Record<TrendKey, string> = {
  positive: 'bg-emerald-400/70',
  neutral: 'bg-slate-400/50',
  mixed: 'bg-violet-400/60',
  negative: 'bg-rose-400/70',
};

function ratingColor(r: number): string {
  if (r >= 8) return 'text-emerald-300 bg-emerald-500/15 border-emerald-400/30';
  if (r >= 6) return 'text-violet-300 bg-violet-500/15 border-violet-400/30';
  if (r >= 4) return 'text-amber-300 bg-amber-500/15 border-amber-400/30';
  return 'text-rose-300 bg-rose-500/15 border-rose-400/30';
}

export const PlainSummaryCard: React.FC<{ snap: PeriodSnapshot }> = ({ snap }) => {
  const { lang } = useLang();
  const { prediction, currentPeriods } = snap;

  const s = useMemo(() => buildPlainSummary({
    lang: coreLang(lang),
    overallRating: prediction.overallRating,
    overallPercentile: prediction.overallPercentile,
    predictions: prediction.predictions,
    periods: { mahadasha: currentPeriods.mahadasha, antardasha: currentPeriods.antardasha },
  }), [lang, prediction, currentPeriods]);

  // The Now tab is read against today's sky, so transit combinations apply.
  const readings = useMemo(() => {
    const out: Partial<Record<AreaKey | 'general', AreaReading>> = {};
    for (const area of ['career', 'wealth', 'relationships', 'health', 'general'] as const) {
      const p = prediction.predictions[area];
      // The headline is the overall rating, so its "why" is the overall breakdown.
      const overall = area === 'general' && !!prediction.overallExplanation;
      const r = p && buildAreaReading({
        area, lang: coreLang(lang), trend: p.trend, details: p.details,
        score: overall ? (prediction.overallScore ?? p.score ?? 5) : (p.score ?? 5),
        explanation: overall ? prediction.overallExplanation : p.explanation,
        indicators: prediction.indicators, hasSky: true, mahadasha: prediction.dashaLord, overall,
      });
      if (r) out[area] = r;
    }
    return out;
  }, [lang, prediction]);

  return (
    <section className="glass-card rounded-2xl p-6 space-y-5" aria-label={s.labels.title}>
      <div className="flex items-center gap-2.5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(var(--c-accent-rgb),0.08)', border: '1px solid rgba(var(--c-accent-rgb),0.18)' }}
        >
          <Lightbulb className="w-4 h-4" style={{ color: 'var(--c-accent-2)' }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-wider text-white/40">{s.labels.title}</div>
          <h3 className="text-base font-semibold text-white leading-snug">{s.headline}</h3>
        </div>
        <div className={`px-2.5 py-1 rounded-md border text-[11px] font-mono shrink-0 ${ratingColor(prediction.overallRating)}`}>
          {prediction.overallRating}/10
        </div>
      </div>

      {(s.standing || readings.general) && (
        <div className="-mt-2">
          {s.standing && <p className="text-xs text-white/60">{s.standing}</p>}
          {readings.general?.why && <p className="text-xs text-white/50 mt-1">{readings.general.why}</p>}
          {readings.general && <AreaWhy reading={readings.general} label={readings.general.labels.whyRating} />}
        </div>
      )}

      <ul className="space-y-2">
        {s.areas.map(a => {
          const Icon = AREA_ICON[a.area];
          const r = readings[a.area];
          return (
            <li key={a.area} className="relative flex items-start gap-2.5 rounded-xl border border-white/8 bg-black/30 py-2.5 pl-5 pr-3">
              <span className={`absolute left-1.5 top-2.5 bottom-2.5 w-[3px] rounded-full ${TREND_BAR[a.trend]}`} aria-hidden />
              <Icon className="w-3.5 h-3.5 mt-0.5 shrink-0 text-white/40" />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-white/85 leading-relaxed">{a.text}</p>
                {r?.why && <p className="text-[12px] text-white/50 leading-relaxed mt-0.5">{r.why}</p>}
                {r && <AreaWhy reading={r} />}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="grid sm:grid-cols-2 gap-2">
        <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/5 p-3">
          <div className="flex items-center gap-1.5 mb-1 text-[10px] uppercase tracking-wider text-emerald-300">
            <CheckCircle className="w-3 h-3" /> {s.labels.goodFor}
          </div>
          <p className="text-[13px] text-white/80 leading-relaxed">{s.goodFor}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <div className="flex items-center gap-1.5 mb-1 text-[10px] uppercase tracking-wider text-white/50">
            <MinusCircle className="w-3 h-3" /> {s.labels.goEasy}
          </div>
          <p className="text-[13px] text-white/80 leading-relaxed">{s.goEasy}</p>
        </div>
      </div>

      <div className="rounded-xl border border-white/8 bg-black/20 p-3 space-y-1.5">
        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-white/40">
          <CalendarClock className="w-3 h-3" /> {s.labels.dates}
        </div>
        {[...s.lead, s.next].map((line, i) => (
          <p key={i} className="text-[12px] text-white/70 leading-relaxed">{line}</p>
        ))}
      </div>

      <p className="text-[11px] text-white/40 leading-relaxed border-t border-white/6 pt-3">{s.caution}</p>
    </section>
  );
};

export default PlainSummaryCard;
