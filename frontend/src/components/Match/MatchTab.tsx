import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  Heart, Check, X, AlertTriangle, RefreshCcw, Loader2,
  ChevronDown, ChevronUp, Brain, Flame, Sparkles, Scale, Info,
} from 'lucide-react';
import { BirthDataForm } from '../Forms/BirthDataForm';
import { getMatchReport } from '../../services/api';
import type { BirthData, MatchSummary, KootaScore, DoshaResult } from '../../services/api';
import type {
  MatchDimension, DimensionBand, DimensionKey, MarriageProspect, Friction,
} from '../../lib/core/matchInsights';
import { RASHI_ENGLISH } from '../../lib/core/rashi';
import { BAR_PALETTE, ProgressBar } from '../shared/BarCharts';
import { useLang } from '../../i18n/LanguageContext';
import { labelMatchVerdict, labelRashiWestern } from '../../i18n/astroLabels';

interface Props {
  person: BirthData;
}

function verdictClass(v: MatchSummary['report']['verdict']): string {
  switch (v) {
    case 'excellent':       return 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40';
    case 'very good':       return 'bg-emerald-500/12 text-emerald-200 border-emerald-400/30';
    case 'good':            return 'bg-violet-500/15 text-violet-200 border-violet-400/30';
    case 'acceptable':      return 'bg-amber-500/15 text-amber-200 border-amber-400/30';
    case 'not recommended': return 'bg-rose-500/20 text-rose-200 border-rose-400/40';
  }
}

const ScoreGauge: React.FC<{ summary: MatchSummary }> = ({ summary }) => {
  const { lang, t } = useLang();
  const r = summary.report;
  const pct = r.percent;
  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-lg bg-rose-400/10 border border-rose-400/20 flex items-center justify-center">
          <Heart className="w-4 h-4 text-rose-300" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-white">{t('match.ashtakootTitle')}</h3>
          <p className="text-[11px] text-white/40">{t('match.ashtakootSubtitle')}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="text-5xl font-mono font-bold text-white tabular-nums">
          {r.totalObtained}
          <span className="text-2xl text-white/30">/{r.totalMax}</span>
        </div>
        <div className={`px-3 py-1.5 rounded-lg border text-xs font-semibold uppercase tracking-wider ${verdictClass(r.verdict)}`}>
          {labelMatchVerdict(r.verdict, lang)}
        </div>
      </div>

      <ProgressBar pct={pct} color={BAR_PALETTE.pink} index={0} />
      <div className="grid grid-cols-2 gap-2 mt-4 text-[11px]">
        <div className="rounded-lg bg-black/30 border border-white/8 px-3 py-2">
          <div className="text-white/40 uppercase tracking-wider text-[10px]">{t('match.person')}</div>
          <div className="text-white">{labelRashiWestern(summary.person.rashi, lang, RASHI_ENGLISH[summary.person.rashi])} · {summary.person.nakshatraName}</div>
          {summary.person.isManglik && <div className="text-amber-300 text-[10px] mt-0.5">{t('match.manglik')}</div>}
        </div>
        <div className="rounded-lg bg-black/30 border border-white/8 px-3 py-2">
          <div className="text-white/40 uppercase tracking-wider text-[10px]">{t('match.partner')}</div>
          <div className="text-white">{labelRashiWestern(summary.partner.rashi, lang, RASHI_ENGLISH[summary.partner.rashi])} · {summary.partner.nakshatraName}</div>
          {summary.partner.isManglik && <div className="text-amber-300 text-[10px] mt-0.5">{t('match.manglik')}</div>}
        </div>
      </div>
    </div>
  );
};

const KootaCard: React.FC<{ k: KootaScore; index: number }> = ({ k, index }) => {
  const pct = (k.obtained / k.max) * 100;
  const tone = k.passed ? 'border-emerald-400/30 bg-emerald-500/6' : 'border-rose-400/30 bg-rose-500/6';
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}
      className={`rounded-xl border ${tone} p-3`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          {k.passed ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <X className="w-3.5 h-3.5 text-rose-300" />}
          <span className="text-xs font-semibold text-white">{k.name}</span>
        </div>
        <div className="text-[11px] font-mono text-white/60">{k.obtained}<span className="text-white/30">/{k.max}</span></div>
      </div>
      <ProgressBar
        pct={pct}
        color={k.passed ? BAR_PALETTE.gold : BAR_PALETTE.pink}
        height="md"
        index={index}
        className="mb-2"
      />
      <p className="text-[11px] text-white/65 leading-relaxed">{k.reason}</p>
    </motion.div>
  );
};

const DoshaCard: React.FC<{ d: DoshaResult }> = ({ d }) => {
  const { t } = useLang();
  const tone =
    !d.present                ? 'border-emerald-400/30 bg-emerald-500/6'
    : d.mitigated             ? 'border-amber-400/30 bg-amber-500/6'
                              : 'border-rose-400/30 bg-rose-500/6';
  const Icon = !d.present ? Check : d.mitigated ? AlertTriangle : X;
  const iconCol = !d.present ? 'text-emerald-300' : d.mitigated ? 'text-amber-300' : 'text-rose-300';
  const label = !d.present ? t('match.dosha.absent') : d.mitigated ? t('match.dosha.cancelled') : t('match.dosha.present');
  return (
    <div className={`rounded-xl border ${tone} p-3`}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Icon className={`w-3.5 h-3.5 ${iconCol}`} />
          <span className="text-xs font-semibold text-white">{d.name}</span>
        </div>
        <span className={`text-[10px] uppercase tracking-wider ${iconCol}`}>{label}</span>
      </div>
      <p className="text-[11px] text-white/65 leading-relaxed">{d.description}</p>
    </div>
  );
};


const BAND_STYLE: Record<DimensionBand, { border: string; bg: string; text: string; icon: string }> = {
  strong:   { border: 'border-emerald-400/30', bg: 'bg-emerald-500/6', text: 'text-emerald-300', icon: 'text-emerald-300' },
  workable: { border: 'border-violet-400/30',  bg: 'bg-violet-500/6',  text: 'text-violet-200',  icon: 'text-violet-300' },
  strained: { border: 'border-rose-400/30',    bg: 'bg-rose-500/6',    text: 'text-rose-300',    icon: 'text-rose-300' },
};

const DIMENSION_ICON: Record<DimensionKey, React.ElementType> = {
  emotional: Heart,
  mental: Brain,
  physical: Flame,
  vitality: Sparkles,
  everyday: Scale,
};

const DimensionCard: React.FC<{ d: MatchDimension; index: number }> = ({ d, index }) => {
  const { t } = useLang();
  const style = BAND_STYLE[d.band];
  const Icon = DIMENSION_ICON[d.key];
  const pct = (d.obtained / d.max) * 100;
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
      className={`rounded-xl border ${style.border} ${style.bg} p-3.5`}
    >
      <div className="flex items-start justify-between gap-3 mb-1.5">
        <div className="flex items-start gap-2.5 min-w-0">
          <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${style.icon}`} />
          <div className="min-w-0">
            <div className="text-xs font-semibold text-white">{d.label}</div>
            <div className="text-[11px] text-white/40">{d.question}</div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className={`text-[10px] uppercase tracking-wider font-semibold ${style.text}`}>
            {t(`match.band.${d.band}` as 'match.band.strong')}
          </div>
          <div className="text-[11px] font-mono text-white/60">{d.obtained}<span className="text-white/30">/{d.max}</span></div>
        </div>
      </div>

      <ProgressBar
        pct={pct}
        color={d.band === 'strained' ? BAR_PALETTE.pink : BAR_PALETTE.gold}
        height="md"
        index={index}
        className="mb-2.5"
      />

      <p className="text-[11.5px] text-white/70 leading-relaxed">{d.summary}</p>
      <p className="text-[11.5px] text-white/55 leading-relaxed mt-1.5">
        <span className="text-white/35 uppercase tracking-wider text-[10px] mr-1.5">{t('match.inPractice')}</span>
        {d.inPractice}
      </p>
      <div className="text-[10px] text-white/25 mt-2">{t('match.fromKootas')}: {d.from.join(' + ')}</div>
    </motion.div>
  );
};

const FrictionCard: React.FC<{ f: Friction }> = ({ f }) => {
  const { t } = useLang();
  return (
    <div className="rounded-xl border border-rose-400/25 bg-rose-500/5 p-3">
      <div className="text-xs font-semibold text-white mb-1.5">{f.area}</div>
      <p className="text-[11.5px] text-white/70 leading-relaxed">
        <span className="text-rose-200/60 uppercase tracking-wider text-[10px] mr-1.5">{t('match.whatItLooksLike')}</span>
        {f.whatItLooksLike}
      </p>
      <p className="text-[11.5px] text-white/70 leading-relaxed mt-1.5">
        <span className="text-emerald-200/60 uppercase tracking-wider text-[10px] mr-1.5">{t('match.whatHelps')}</span>
        {f.whatHelps}
      </p>
    </div>
  );
};

const ProspectCard: React.FC<{ title: string; p: MarriageProspect }> = ({ title, p }) => (
  <div className="rounded-xl border border-white/8 bg-black/25 p-3">
    <div className="text-[10px] uppercase tracking-wider text-white/35 mb-0.5">{title}</div>
    <div className="text-xs font-semibold text-white mb-2">{p.headline}</div>
    <ul className="space-y-1.5">
      {p.notes.map((n, i) => (
        <li key={i} className="text-[11px] text-white/60 leading-relaxed flex gap-1.5">
          <span className="text-violet-300/60 shrink-0">•</span>
          <span>{n}</span>
        </li>
      ))}
    </ul>
  </div>
);

const ReportView: React.FC<{ summary: MatchSummary; onReset: () => void }> = ({ summary, onReset }) => {
  const { t } = useLang();
  const [showClassical, setShowClassical] = useState(false);
  const r = summary.report;
  const ins = summary.insights;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <ScoreGauge summary={summary} />

      {/* An honest paragraph on what the number does and does not mean —
          shown before any of the detail, because it frames all of it. */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-start gap-2.5">
          <Info className="w-4 h-4 mt-0.5 shrink-0 text-violet-300" />
          <div>
            <p className="text-[12px] text-white/75 leading-relaxed">{ins.guidance.framing}</p>
            {r.overrideNote && (
              <p className="text-[11.5px] text-rose-200/80 leading-relaxed mt-2">{r.overrideNote}</p>
            )}
          </div>
        </div>
      </div>

      {/* The five dimensions — the headline reading. */}
      <div className="glass-card rounded-2xl p-6 space-y-3">
        <div>
          <h4 className="text-sm font-semibold text-white">{t('match.dimensionsTitle')}</h4>
          <p className="text-[11px] text-white/40">{t('match.dimensionsSubtitle')}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {ins.dimensions.map((d, i) => <DimensionCard key={d.key} d={d} index={i} />)}
        </div>
      </div>

      {/* What works / where the friction is — actionable, not a score dump. */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-xl border border-emerald-400/25 bg-emerald-500/5 p-3">
          <div className="text-[11px] uppercase tracking-wider mb-2 text-emerald-200/70">{t('match.strengthsTitle')}</div>
          <ul className="space-y-2">
            {ins.guidance.strengths.map((sgt, i) => (
              <li key={i} className="text-[11.5px] text-white/70 leading-relaxed flex gap-2">
                <Check className="w-3 h-3 mt-1 text-emerald-300/70 shrink-0" />
                <span><span className="text-white font-semibold">{sgt.label}</span> — {sgt.text}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-2">
          <div className="text-[11px] uppercase tracking-wider text-rose-200/70 px-1">{t('match.frictionsTitle')}</div>
          {ins.guidance.frictions.length === 0 ? (
            <div className="rounded-xl border border-white/8 bg-black/25 p-3 text-[11px] text-white/40">
              {t('common.none')}
            </div>
          ) : (
            ins.guidance.frictions.map((f, i) => <FrictionCard key={i} f={f} />)
          )}
        </div>
      </div>

      {/* The Navamsa — the layer classical astrology weighs above guna count. */}
      {ins.navamsa && (
        <div className="glass-card rounded-2xl p-5">
          <h4 className="text-sm font-semibold text-white mb-1.5">{t('match.navamsaTitle')}</h4>
          <p className="text-[11.5px] text-white/70 leading-relaxed">{ins.navamsa.summary}</p>
        </div>
      )}

      {/* Each chart read on its own, before the pairing. */}
      {(ins.personProspect || ins.partnerProspect) && (
        <div className="glass-card rounded-2xl p-6 space-y-3">
          <div>
            <h4 className="text-sm font-semibold text-white">{t('match.prospectsTitle')}</h4>
            <p className="text-[11px] text-white/40">{t('match.prospectsSubtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {ins.personProspect && <ProspectCard title={t('match.yourChart')} p={ins.personProspect} />}
            {ins.partnerProspect && <ProspectCard title={t('match.partnerChart')} p={ins.partnerProspect} />}
          </div>
        </div>
      )}

      <div className="glass-card rounded-2xl p-6 space-y-3">
        <h4 className="text-sm font-semibold text-white">{t('match.doshasTitle')}</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {r.doshas.map(d => <DoshaCard key={d.name} d={d} />)}
        </div>
      </div>

      {/* The raw 8-koota breakdown, folded away. Every point in it is already
          accounted for in the five dimensions above; it is here for anyone who
          wants to check the arithmetic, not as the primary reading. */}
      <div className="glass-card rounded-2xl p-4">
        <button
          onClick={() => setShowClassical(v => !v)}
          className="w-full flex items-center justify-between text-left"
        >
          <span className="text-xs font-semibold text-white/70">
            {showClassical ? t('match.hideClassical') : t('match.showClassical')}
          </span>
          {showClassical ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />}
        </button>
        {showClassical && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
            {r.kootas.map((k, i) => <KootaCard key={k.name} k={k} index={i} />)}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button onClick={onReset} className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 inline-flex items-center gap-1.5">
          <RefreshCcw className="w-3 h-3" /> {t('match.tryDifferentPartner')}
        </button>
      </div>
    </motion.div>
  );
};

export const MatchTab: React.FC<Props> = ({ person }) => {
  const { t } = useLang();
  const [partner, setPartner] = useState<BirthData | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['match', person, partner],
    queryFn: () => getMatchReport(person, partner!),
    enabled: !!partner,
    staleTime: Infinity,
  });

  if (!partner) {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-lg bg-rose-400/10 border border-rose-400/20 flex items-center justify-center">
              <Heart className="w-4 h-4 text-rose-300" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">{t('match.title')}</h3>
              <p className="text-[11px] text-white/40">{t('match.subtitle')}</p>
            </div>
          </div>
          <p className="text-[11px] text-white/50 leading-relaxed mb-4">
            {t('match.explanation')}
          </p>
        </div>
        <div className="glass-card rounded-2xl p-6">
          <BirthDataForm onSubmit={setPartner} />
        </div>
      </motion.div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-white/40 text-sm py-12 justify-center">
        <Loader2 className="w-4 h-4 animate-spin" /> {t('match.computing')}
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="glass-card rounded-2xl p-6">
        <div className="text-rose-300 text-sm mb-3">{t('match.failed')}</div>
        <button onClick={() => setPartner(null)} className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:bg-white/10">
          {t('common.tryAgain')}
        </button>
      </div>
    );
  }

  return <ReportView summary={data} onReset={() => setPartner(null)} />;
};
