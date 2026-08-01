import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  Heart, Check, X, AlertTriangle, RefreshCcw, Loader2,
  Brain, Flame, Sparkles, Scale, Info,
} from 'lucide-react';
import { BirthDataForm } from '../Forms/BirthDataForm';
import { getMatchReport } from '../../services/api';
import type {
  BirthData, MatchSummary, KootaScore, DoshaResult, DoshaSeverity, Conflict,
  MarriagePromise, SynastryContact,
} from '../../services/api';
import type { PoruthamCheck } from '../../lib/core/matchPorutham';
import { MatchVerdict } from './MatchVerdict';
import { SynastryWeb } from './SynastryWeb';
import type {
  MatchDimension, DimensionBand, DimensionKey, Friction,
} from '../../lib/core/matchInsights';
import { formatOrb } from '../../lib/core/matchSynastry';
import { RASHI_ENGLISH } from '../../lib/core/rashi';
import { BAR_PALETTE, ProgressBar } from '../shared/BarCharts';
import { useLang } from '../../i18n/LanguageContext';
import { labelRashiWestern } from '../../i18n/astroLabels';
import { TapBadge } from '../shared/tapTarget';

interface Props {
  person: BirthData;
}

function severityClass(s: DoshaSeverity): string {
  switch (s) {
    case 'none':      return 'bg-emerald-500/15 text-emerald-200 border-emerald-400/30';
    case 'mitigated': return 'bg-amber-500/15 text-amber-200 border-amber-400/30';
    case 'active':    return 'bg-rose-500/20 text-rose-200 border-rose-400/40';
  }
}

/**
 * The four-layer header.
 *
 * Deliberately not a single score. The koota total leads only as a gate, labelled
 * with what it measures, because a lone 29.5/36 with a verdict badge is read as a
 * grade for the relationship when it is a filter over two Moon positions. The
 * layer strip and the conflicts below it are the actual reading.
 */
const LayerPanel: React.FC<{ summary: MatchSummary }> = ({ summary }) => {
  const { lang, t } = useLang();
  const r = summary.report;
  const l1 = r.layer1Temperament;
  const pass = l1.gate === 'GATE_PASS';

  const promiseBand = (p: MarriagePromise | null): string => {
    if (!p) return '—';
    const sup = p.dimensions.filter(d => d.band === 'supportive').length;
    const test = p.dimensions.filter(d => d.band === 'testing').length;
    return sup > test ? t('match.promiseSupportive') : test > sup ? t('match.promiseTesting') : t('match.promiseMixed');
  };

  const rows: Array<{ label: string; a: string; b: string; tone: string }> = [
    {
      label: t('match.layerDoshas'),
      a: t(`match.severity.${r.layer2Doshas.netA}`),
      b: t(`match.severity.${r.layer2Doshas.netB}`),
      tone: severityClass(
        r.layer2Doshas.netA === 'active' || r.layer2Doshas.netB === 'active' ? 'active'
          : r.layer2Doshas.netA === 'mitigated' || r.layer2Doshas.netB === 'mitigated' ? 'mitigated' : 'none'),
    },
    {
      label: t('match.layerPromise'),
      a: promiseBand(r.layer3Promise.a),
      b: promiseBand(r.layer3Promise.b),
      tone: 'bg-violet-500/15 text-violet-200 border-violet-400/30',
    },
  ];

  return (
    <div className="glass-card rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-rose-400/10 border border-rose-400/20 flex items-center justify-center">
          <Heart className="w-4 h-4 text-rose-300" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-white">{t('match.ashtakootTitle')}</h3>
          <p className="text-[11px] text-white/40">{t('match.ashtakootSubtitle')}</p>
        </div>
      </div>

      {/* Layer 1 — a gate, and labelled as one. */}
      <div>
        <div className="flex items-center gap-4 mb-1.5">
          <div className="text-4xl font-mono font-bold text-white tabular-nums">
            {l1.total}
            <span className="text-xl text-white/30">/36</span>
          </div>
          <div className={`px-3 py-1.5 rounded-lg border text-xs font-semibold uppercase tracking-wider ${
            pass ? 'bg-emerald-500/15 text-emerald-200 border-emerald-400/30'
                 : 'bg-rose-500/20 text-rose-200 border-rose-400/40'}`}>
            {pass ? t('match.gatePass') : t('match.gateFail')}
          </div>
        </div>
        <p className="text-[11px] text-white/45 leading-relaxed">{t('match.gateCaveat')}</p>
      </div>

      {/* Layers 2–4 at a glance. */}
      <div className="space-y-1.5">
        {rows.map(row => (
          <div key={row.label} className="flex items-center gap-2 text-[11.5px]">
            <div className="w-24 shrink-0 text-white/40 uppercase tracking-wider text-[10px]">{row.label}</div>
            <div className={`px-2 py-0.5 rounded border text-[10.5px] ${row.tone}`}>{row.a}</div>
            <span className="text-white/20">·</span>
            <div className={`px-2 py-0.5 rounded border text-[10.5px] ${row.tone}`}>{row.b}</div>
          </div>
        ))}
        <div className="flex items-center gap-2 text-[11.5px]">
          <div className="w-24 shrink-0 text-white/40 uppercase tracking-wider text-[10px]">{t('match.layerSynastry')}</div>
          <div className={`px-2 py-0.5 rounded border text-[10.5px] ${
            r.layer4Synastry.asymmetric
              ? 'bg-amber-500/15 text-amber-200 border-amber-400/30'
              : 'bg-violet-500/15 text-violet-200 border-violet-400/30'}`}>
            {r.layer4Synastry.asymmetric ? t('match.nonMutual') : t('match.mutual')}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px]">
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

/** Cross-layer conflicts — the most informative field in the report. */
const ConflictStrip: React.FC<{ conflicts: Conflict[] }> = ({ conflicts }) => {
  const { t } = useLang();
  if (!conflicts.length) return null;
  return (
    <div className="glass-card rounded-2xl p-5 space-y-2.5">
      <div>
        <h4 className="text-sm font-semibold text-white">{t('match.conflictsTitle')}</h4>
        <p className="text-[11px] text-white/40">{t('match.conflictsSubtitle')}</p>
      </div>
      {conflicts.map(c => (
        <div key={c.code} className="rounded-xl border border-amber-400/25 bg-amber-500/5 p-3 flex gap-2">
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-300/80" />
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-amber-200/60 mb-0.5">{c.code}</div>
            <p className="text-[11.5px] text-white/70 leading-relaxed">{c.explanation}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

/** One chart's own marriage promise — Layer 3, which guna matching cannot see. */
const PromiseCard: React.FC<{ title: string; p: MarriagePromise }> = ({ title, p }) => {
  const bandTone: Record<string, string> = {
    supportive: 'text-emerald-300/80', mixed: 'text-white/45', testing: 'text-rose-300/80',
  };
  return (
    <div className="rounded-xl border border-white/8 bg-black/25 p-3">
      <div className="text-[10px] uppercase tracking-wider text-white/35 mb-1">{title}</div>
      <div className="space-y-1 mb-2">
        {p.dimensions.map(d => (
          <div key={d.key} className="flex items-baseline gap-2 text-[11px]">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${
              d.band === 'supportive' ? 'bg-emerald-400/70' : d.band === 'testing' ? 'bg-rose-400/70' : 'bg-white/25'}`} />
            <span className="text-white/55 flex-1">{d.label}</span>
            <span className={bandTone[d.band]}>{d.band}</span>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-white/60 leading-relaxed">{p.synthesis}</p>
      <ul className="mt-2 space-y-1">
        {p.dimensions.flatMap(d => d.notes).slice(0, 4).map((n, i) => (
          <li key={i} className="text-[10.5px] text-white/45 leading-relaxed flex gap-1.5">
            <span className="text-violet-300/50 shrink-0">•</span><span>{n}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

/** Layer 4 — one direction of the overlay, with orb and strength shown. */
const SynastryList: React.FC<{ title: string; contacts: SynastryContact[]; net: number }> = ({ title, contacts, net }) => {
  const { t } = useLang();
  return (
    <div className="rounded-xl border border-white/8 bg-black/25 p-3">
      <div className="flex items-baseline justify-between mb-1.5">
        <div className="text-[10px] uppercase tracking-wider text-white/35">{title}</div>
        <div className={`text-[10px] font-mono ${net < 0 ? 'text-rose-300/70' : net > 0 ? 'text-emerald-300/70' : 'text-white/30'}`}>
          {net > 0 ? '+' : ''}{net.toFixed(2)}
        </div>
      </div>
      {contacts.length === 0 ? (
        <div className="text-[11px] text-white/35">{t('common.none')}</div>
      ) : (
        <ul className="space-y-1.5">
          {contacts.slice(0, 6).map((c, i) => (
            <li key={i} className="text-[11px] leading-relaxed">
              <div className="flex items-baseline gap-1.5">
                <span className={c.valence === 'adverse' ? 'text-rose-300/80' : c.valence === 'supportive' ? 'text-emerald-300/80' : 'text-white/50'}>
                  {c.graha} → {c.target}
                </span>
                <span className="text-white/25 text-[10px] font-mono">
                  {c.orb != null ? formatOrb(c.orb) : '—'} · {c.strength.toFixed(2)}
                </span>
              </div>
              <div className="text-white/50 text-[10.5px]">{c.interpretation}</div>
            </li>
          ))}
        </ul>
      )}
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

/**
 * The four Southern-tradition star checks. Rajju leads and is marked critical —
 * for the readership this app serves, it is the check a family matcher reads
 * before any point total.
 */
const PoruthamCard: React.FC<{ checks: PoruthamCheck[] }> = ({ checks }) => {
  const { t } = useLang();
  return (
    <div className="glass-card rounded-2xl p-6 space-y-2.5">
      <div>
        <h4 className="text-sm font-semibold text-white">{t('match.poruthamTitle')}</h4>
        <p className="text-[11px] text-white/40">{t('match.poruthamSubtitle')}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {checks.map((c, i) => {
          const color = c.passed ? (c.partial ? '#fbbf24' : '#34d399') : '#fb7185';
          const Icon = c.passed ? (c.partial ? AlertTriangle : Check) : X;
          return (
            <motion.div
              key={c.key}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-xl border p-3"
              style={{ borderColor: `${color}40`, background: `${color}0a` }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-3.5 h-3.5 shrink-0" style={{ color }} />
                <span className="text-xs font-semibold text-white">
                  {t(`match.porutham.${c.key}` as 'match.porutham.rajju')}
                </span>
                {c.importance === 'critical' && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-wide font-bold"
                    style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)' }}>
                    {t('match.poruthamCritical')}
                  </span>
                )}
                <span className="ml-auto text-[10px] uppercase tracking-wider font-semibold" style={{ color }}>
                  {c.passed ? (c.partial ? t('match.poruthamPartial') : t('match.poruthamPass')) : t('match.poruthamFail')}
                </span>
              </div>
              <p className="text-[11px] text-white/65 leading-relaxed">{c.reason}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

const ReportView: React.FC<{ summary: MatchSummary; onReset: () => void }> = ({ summary, onReset }) => {
  const { t } = useLang();
  const [showClassical, setShowClassical] = useState(false);
  const [showSynDetail, setShowSynDetail] = useState(false);
  const r = summary.report;
  const ins = summary.insights;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      {/* The plain-words opening: dial, headline and the four layer checks. */}
      <MatchVerdict summary={summary} />

      <LayerPanel summary={summary} />

      {/* An honest paragraph on what the number does and does not mean —
          shown before any of the detail, because it frames all of it. */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-start gap-2.5">
          <Info className="w-4 h-4 mt-0.5 shrink-0 text-violet-300" />
          <div>
            <p className="text-[12px] text-white/75 leading-relaxed">{ins.guidance.framing}</p>
          </div>
        </div>
      </div>

      <ConflictStrip conflicts={r.conflicts} />

      {/* Which planets get along — the overlay drawn as a picture. */}
      <div className="glass-card rounded-2xl p-6">
        <div className="mb-3">
          <h4 className="text-sm font-semibold text-white">{t('match.webTitle')}</h4>
          <p className="text-[11px] text-white/40">{t('match.webSubtitle')}</p>
        </div>
        <SynastryWeb synastry={r.layer4Synastry} />
      </div>

      {/* The Sri Lankan / Southern star checks Ashtakoot cannot see. */}
      <PoruthamCard checks={r.poruthams.checks} />

      {/* The five dimensions — the Layer 1 reading, regrouped. */}
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

      {/* Layer 3 — each chart's own promise, which Layer 1 cannot see. */}
      {(r.layer3Promise.a || r.layer3Promise.b) && (
        <div className="glass-card rounded-2xl p-6 space-y-3">
          <div>
            <h4 className="text-sm font-semibold text-white">{t('match.promiseTitle')}</h4>
            <p className="text-[11px] text-white/40">{t('match.promiseSubtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {r.layer3Promise.a && <PromiseCard title={t('match.yourChart')} p={r.layer3Promise.a} />}
            {r.layer3Promise.b && <PromiseCard title={t('match.partnerChart')} p={r.layer3Promise.b} />}
          </div>
        </div>
      )}

      {/* Layer 4 — the directional detail behind the web, folded away because
          the picture above already tells the story; this is the arithmetic. */}
      <div className="glass-card rounded-2xl p-4">
        <button
          onClick={() => setShowSynDetail(v => !v)}
          aria-expanded={showSynDetail}
          data-open={showSynDetail}
          className="tap-row tap-blink w-full flex items-center justify-between text-left rounded-lg py-2 pl-5 pr-2"
        >
          <span className="text-xs font-semibold text-white/70">
            {showSynDetail ? t('match.hideSynDetail') : t('match.showSynDetail')}
          </span>
          <TapBadge open={showSynDetail} direction="down" />
        </button>
        {showSynDetail && (
          <div className="space-y-3 mt-3">
            <p className="text-[11.5px] text-white/70 leading-relaxed">{r.layer4Synastry.summary}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              <SynastryList title={t('match.aToB')} contacts={r.layer4Synastry.aToB.contacts} net={r.layer4Synastry.aToB.netValence} />
              <SynastryList title={t('match.bToA')} contacts={r.layer4Synastry.bToA.contacts} net={r.layer4Synastry.bToA.netValence} />
            </div>
          </div>
        )}
      </div>

      <div className="glass-card rounded-2xl p-6 space-y-3">
        <h4 className="text-sm font-semibold text-white">{t('match.doshasTitle')}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {([['match.yourChart', r.layer2Doshas.a], ['match.partnerChart', r.layer2Doshas.b]] as const).map(([key, chart]) => (
            <div key={key} className="space-y-2">
              <div className="text-[10px] uppercase tracking-wider text-white/35">{t(key)}</div>
              {chart.doshas.map(d => <DoshaCard key={d.name} d={d} />)}
            </div>
          ))}
        </div>
        <p className="text-[11px] text-white/50 leading-relaxed">{r.layer2Doshas.mutualKuja.description}</p>
      </div>

      {/* The raw 8-koota breakdown, folded away. Every point in it is already
          accounted for in the five dimensions above; it is here for anyone who
          wants to check the arithmetic, not as the primary reading. */}
      <div className="glass-card rounded-2xl p-4">
        <button
          onClick={() => setShowClassical(v => !v)}
          aria-expanded={showClassical}
          data-open={showClassical}
          className="tap-row tap-blink w-full flex items-center justify-between text-left rounded-lg py-2 pl-5 pr-2"
        >
          <span className="text-xs font-semibold text-white/70">
            {showClassical ? t('match.hideClassical') : t('match.showClassical')}
          </span>
          <TapBadge open={showClassical} direction="down" />
        </button>
        {showClassical && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
            {r.layer1Temperament.kootas.map((k: KootaScore, i: number) => <KootaCard key={k.name} k={k} index={i} />)}
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
