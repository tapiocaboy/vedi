import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  Heart, Check, X, AlertTriangle, RefreshCcw, Loader2,
  Brain, Flame, Sparkles, Scale, Info, User,
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
import { useTheme } from '../../hooks/useTheme';

interface Props {
  person: BirthData;
}

type MatchPane = 'overview' | 'planets' | 'more';

function useInk() {
  const isLight = useTheme();
  return {
    isLight,
    ink: isLight ? 'text-slate-900' : 'text-white',
    muted: isLight ? 'text-slate-500' : 'text-white/45',
    body: isLight ? 'text-slate-600' : 'text-white/70',
    faint: isLight ? 'text-slate-400' : 'text-white/35',
    inset: isLight ? 'bg-slate-50/90 border-slate-200/80' : 'bg-black/25 border-white/8',
  };
}

function severityClass(s: DoshaSeverity, isLight: boolean): string {
  switch (s) {
    case 'none':
      return isLight
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
        : 'bg-emerald-500/15 text-emerald-200 border-emerald-400/30';
    case 'mitigated':
      return isLight
        ? 'bg-amber-50 text-amber-700 border-amber-200'
        : 'bg-amber-500/15 text-amber-200 border-amber-400/30';
    case 'active':
      return isLight
        ? 'bg-rose-50 text-rose-700 border-rose-200'
        : 'bg-rose-500/20 text-rose-200 border-rose-400/40';
  }
}

function formatBirthStamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
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
  const { isLight, ink, muted, faint, inset } = useInk();
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
          : r.layer2Doshas.netA === 'mitigated' || r.layer2Doshas.netB === 'mitigated' ? 'mitigated' : 'none',
        isLight),
    },
    {
      label: t('match.layerPromise'),
      a: promiseBand(r.layer3Promise.a),
      b: promiseBand(r.layer3Promise.b),
      tone: isLight
        ? 'bg-rose-50 text-rose-700 border-rose-200'
        : 'bg-violet-500/15 text-violet-200 border-violet-400/30',
    },
  ];

  return (
    <div className="glass-card rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-rose-400/10 border border-rose-400/20 flex items-center justify-center">
          <Heart className="w-4 h-4 text-rose-400" />
        </div>
        <div className="flex-1">
          <h3 className={`text-sm font-semibold ${ink}`}>{t('match.ashtakootTitle')}</h3>
          <p className={`text-[11px] ${muted}`}>{t('match.ashtakootSubtitle')}</p>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-4 mb-1.5">
          <div className={`text-4xl font-mono font-bold tabular-nums ${ink}`}>
            {l1.total}
            <span className={`text-xl ${faint}`}>/36</span>
          </div>
          <div className={`px-3 py-1.5 rounded-lg border text-xs font-semibold uppercase tracking-wider ${
            pass
              ? (isLight ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-emerald-500/15 text-emerald-200 border-emerald-400/30')
              : (isLight ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-rose-500/20 text-rose-200 border-rose-400/40')}`}>
            {pass ? t('match.gatePass') : t('match.gateFail')}
          </div>
        </div>
        <p className={`text-[11px] leading-relaxed ${muted}`}>{t('match.gateCaveat')}</p>
      </div>

      <div className="space-y-1.5">
        {rows.map(row => (
          <div key={row.label} className="flex items-center gap-2 text-[11.5px]">
            <div className={`w-24 shrink-0 uppercase tracking-wider text-[10px] ${faint}`}>{row.label}</div>
            <div className={`px-2 py-0.5 rounded border text-[10.5px] ${row.tone}`}>{row.a}</div>
            <span className={faint}>·</span>
            <div className={`px-2 py-0.5 rounded border text-[10.5px] ${row.tone}`}>{row.b}</div>
          </div>
        ))}
        <div className="flex items-center gap-2 text-[11.5px]">
          <div className={`w-24 shrink-0 uppercase tracking-wider text-[10px] ${faint}`}>{t('match.layerSynastry')}</div>
          <div className={`px-2 py-0.5 rounded border text-[10.5px] ${
            r.layer4Synastry.asymmetric
              ? (isLight ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-amber-500/15 text-amber-200 border-amber-400/30')
              : (isLight ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-violet-500/15 text-violet-200 border-violet-400/30')}`}>
            {r.layer4Synastry.asymmetric ? t('match.nonMutual') : t('match.mutual')}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <div className={`rounded-lg border px-3 py-2 ${inset}`}>
          <div className={`uppercase tracking-wider text-[10px] ${faint}`}>{t('match.person')}</div>
          <div className={ink}>{labelRashiWestern(summary.person.rashi, lang, RASHI_ENGLISH[summary.person.rashi])} · {summary.person.nakshatraName}</div>
          {summary.person.isManglik && <div className="text-amber-500 text-[10px] mt-0.5">{t('match.manglik')}</div>}
        </div>
        <div className={`rounded-lg border px-3 py-2 ${inset}`}>
          <div className={`uppercase tracking-wider text-[10px] ${faint}`}>{t('match.partner')}</div>
          <div className={ink}>{labelRashiWestern(summary.partner.rashi, lang, RASHI_ENGLISH[summary.partner.rashi])} · {summary.partner.nakshatraName}</div>
          {summary.partner.isManglik && <div className="text-amber-500 text-[10px] mt-0.5">{t('match.manglik')}</div>}
        </div>
      </div>
    </div>
  );
};

/** Cross-layer conflicts — the most informative field in the report. */
const ConflictStrip: React.FC<{ conflicts: Conflict[] }> = ({ conflicts }) => {
  const { t } = useLang();
  const { isLight, ink, muted, body } = useInk();
  if (!conflicts.length) return null;
  return (
    <div className="glass-card rounded-2xl p-5 space-y-2.5">
      <div>
        <h4 className={`text-sm font-semibold ${ink}`}>{t('match.conflictsTitle')}</h4>
        <p className={`text-[11px] ${muted}`}>{t('match.conflictsSubtitle')}</p>
      </div>
      {conflicts.map(c => (
        <div key={c.code} className={`rounded-xl border p-3 flex gap-2 ${
          isLight ? 'border-amber-200 bg-amber-50/70' : 'border-amber-400/25 bg-amber-500/5'}`}>
          <AlertTriangle className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${isLight ? 'text-amber-600' : 'text-amber-300/80'}`} />
          <div>
            <div className={`text-[10px] font-mono uppercase tracking-wider mb-0.5 ${isLight ? 'text-amber-700/70' : 'text-amber-200/60'}`}>{c.code}</div>
            <p className={`text-[11.5px] leading-relaxed ${body}`}>{c.explanation}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

/** One chart's own marriage promise — Layer 3, which guna matching cannot see. */
const PromiseCard: React.FC<{ title: string; p: MarriagePromise }> = ({ title, p }) => {
  const { faint, body, inset } = useInk();
  const bandTone: Record<string, string> = {
    supportive: 'text-emerald-500', mixed: faint, testing: 'text-rose-400',
  };
  return (
    <div className={`rounded-xl border p-3 ${inset}`}>
      <div className={`text-[10px] uppercase tracking-wider mb-1 ${faint}`}>{title}</div>
      <div className="space-y-1 mb-2">
        {p.dimensions.map(d => (
          <div key={d.key} className="flex items-baseline gap-2 text-[11px]">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${
              d.band === 'supportive' ? 'bg-emerald-400/70' : d.band === 'testing' ? 'bg-rose-400/70' : 'bg-current opacity-25'}`} />
            <span className={`${body} flex-1`}>{d.label}</span>
            <span className={bandTone[d.band]}>{d.band}</span>
          </div>
        ))}
      </div>
      <p className={`text-[11px] leading-relaxed ${body}`}>{p.synthesis}</p>
      <ul className="mt-2 space-y-1">
        {p.dimensions.flatMap(d => d.notes).slice(0, 4).map((n, i) => (
          <li key={i} className={`text-[10.5px] leading-relaxed flex gap-1.5 ${faint}`}>
            <span className="text-rose-400/60 shrink-0">•</span><span>{n}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

/** Layer 4 — one direction of the overlay, with orb and strength shown. */
const SynastryList: React.FC<{ title: string; contacts: SynastryContact[]; net: number }> = ({ title, contacts, net }) => {
  const { t } = useLang();
  const { faint, body, inset } = useInk();
  return (
    <div className={`rounded-xl border p-3 ${inset}`}>
      <div className="flex items-baseline justify-between mb-1.5">
        <div className={`text-[10px] uppercase tracking-wider ${faint}`}>{title}</div>
        <div className={`text-[10px] font-mono ${net < 0 ? 'text-rose-400' : net > 0 ? 'text-emerald-500' : faint}`}>
          {net > 0 ? '+' : ''}{net.toFixed(2)}
        </div>
      </div>
      {contacts.length === 0 ? (
        <div className={`text-[11px] ${faint}`}>{t('common.none')}</div>
      ) : (
        <ul className="space-y-1.5">
          {contacts.slice(0, 6).map((c, i) => (
            <li key={i} className="text-[11px] leading-relaxed">
              <div className="flex items-baseline gap-1.5">
                <span className={c.valence === 'adverse' ? 'text-rose-400' : c.valence === 'supportive' ? 'text-emerald-500' : body}>
                  {c.graha} → {c.target}
                </span>
                <span className={`text-[10px] font-mono ${faint}`}>
                  {c.orb != null ? formatOrb(c.orb) : '—'} · {c.strength.toFixed(2)}
                </span>
              </div>
              <div className={`text-[10.5px] ${body}`}>{c.interpretation}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const KootaCard: React.FC<{ k: KootaScore; index: number }> = ({ k, index }) => {
  const { isLight, ink, body, faint } = useInk();
  const pct = (k.obtained / k.max) * 100;
  const tone = k.passed
    ? (isLight ? 'border-emerald-200 bg-emerald-50/70' : 'border-emerald-400/30 bg-emerald-500/6')
    : (isLight ? 'border-rose-200 bg-rose-50/70' : 'border-rose-400/30 bg-rose-500/6');
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}
      className={`rounded-xl border ${tone} p-3`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          {k.passed ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <X className="w-3.5 h-3.5 text-rose-400" />}
          <span className={`text-xs font-semibold ${ink}`}>{k.name}</span>
        </div>
        <div className={`text-[11px] font-mono ${body}`}>{k.obtained}<span className={faint}>/{k.max}</span></div>
      </div>
      <ProgressBar
        pct={pct}
        color={k.passed ? BAR_PALETTE.gold : BAR_PALETTE.pink}
        height="md"
        index={index}
        className="mb-2"
      />
      <p className={`text-[11px] leading-relaxed ${body}`}>{k.reason}</p>
    </motion.div>
  );
};

const DoshaCard: React.FC<{ d: DoshaResult }> = ({ d }) => {
  const { t } = useLang();
  const { isLight, ink, body } = useInk();
  const tone =
    !d.present
      ? (isLight ? 'border-emerald-200 bg-emerald-50/70' : 'border-emerald-400/30 bg-emerald-500/6')
      : d.mitigated
        ? (isLight ? 'border-amber-200 bg-amber-50/70' : 'border-amber-400/30 bg-amber-500/6')
        : (isLight ? 'border-rose-200 bg-rose-50/70' : 'border-rose-400/30 bg-rose-500/6');
  const Icon = !d.present ? Check : d.mitigated ? AlertTriangle : X;
  const iconCol = !d.present ? 'text-emerald-500' : d.mitigated ? 'text-amber-500' : 'text-rose-400';
  const label = !d.present ? t('match.dosha.absent') : d.mitigated ? t('match.dosha.cancelled') : t('match.dosha.present');
  return (
    <div className={`rounded-xl border ${tone} p-3`}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Icon className={`w-3.5 h-3.5 ${iconCol}`} />
          <span className={`text-xs font-semibold ${ink}`}>{d.name}</span>
        </div>
        <span className={`text-[10px] uppercase tracking-wider ${iconCol}`}>{label}</span>
      </div>
      <p className={`text-[11px] leading-relaxed ${body}`}>{d.description}</p>
    </div>
  );
};

function bandLook(band: DimensionBand, isLight: boolean) {
  if (band === 'strong') {
    return {
      box: isLight ? 'border-emerald-200 bg-emerald-50/70' : 'border-emerald-400/30 bg-emerald-500/6',
      text: isLight ? 'text-emerald-700' : 'text-emerald-300',
    };
  }
  if (band === 'workable') {
    return {
      box: isLight ? 'border-rose-200 bg-rose-50/70' : 'border-violet-400/30 bg-violet-500/6',
      text: isLight ? 'text-rose-700' : 'text-violet-200',
    };
  }
  return {
    box: isLight ? 'border-rose-200 bg-rose-50/80' : 'border-rose-400/30 bg-rose-500/6',
    text: isLight ? 'text-rose-700' : 'text-rose-300',
  };
}

const DIMENSION_ICON: Record<DimensionKey, React.ElementType> = {
  emotional: Heart,
  mental: Brain,
  physical: Flame,
  vitality: Sparkles,
  everyday: Scale,
};

const DimensionCard: React.FC<{ d: MatchDimension; index: number }> = ({ d, index }) => {
  const { t } = useLang();
  const { isLight, ink, muted, body, faint } = useInk();
  const style = bandLook(d.band, isLight);
  const Icon = DIMENSION_ICON[d.key];
  const pct = (d.obtained / d.max) * 100;
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
      className={`rounded-xl border ${style.box} p-3.5`}
    >
      <div className="flex items-start justify-between gap-3 mb-1.5">
        <div className="flex items-start gap-2.5 min-w-0">
          <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${style.text}`} />
          <div className="min-w-0">
            <div className={`text-xs font-semibold ${ink}`}>{d.label}</div>
            <div className={`text-[11px] ${muted}`}>{d.question}</div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className={`text-[10px] uppercase tracking-wider font-semibold ${style.text}`}>
            {t(`match.band.${d.band}` as 'match.band.strong')}
          </div>
          <div className={`text-[11px] font-mono ${body}`}>{d.obtained}<span className={faint}>/{d.max}</span></div>
        </div>
      </div>

      <ProgressBar
        pct={pct}
        color={d.band === 'strained' ? BAR_PALETTE.pink : BAR_PALETTE.gold}
        height="md"
        index={index}
        className="mb-2.5"
      />

      <p className={`text-[11.5px] leading-relaxed ${body}`}>{d.summary}</p>
      <p className={`text-[11.5px] leading-relaxed mt-1.5 ${body}`}>
        <span className={`uppercase tracking-wider text-[10px] mr-1.5 ${faint}`}>{t('match.inPractice')}</span>
        {d.inPractice}
      </p>
      <div className={`text-[10px] mt-2 ${faint}`}>{t('match.fromKootas')}: {d.from.join(' + ')}</div>
    </motion.div>
  );
};

const FrictionCard: React.FC<{ f: Friction }> = ({ f }) => {
  const { t } = useLang();
  const { isLight, ink, body } = useInk();
  return (
    <div className={`rounded-xl border p-3 ${isLight ? 'border-rose-200 bg-rose-50/70' : 'border-rose-400/25 bg-rose-500/5'}`}>
      <div className={`text-xs font-semibold mb-1.5 ${ink}`}>{f.area}</div>
      <p className={`text-[11.5px] leading-relaxed ${body}`}>
        <span className="text-rose-400 uppercase tracking-wider text-[10px] mr-1.5">{t('match.whatItLooksLike')}</span>
        {f.whatItLooksLike}
      </p>
      <p className={`text-[11.5px] leading-relaxed mt-1.5 ${body}`}>
        <span className="text-emerald-500 uppercase tracking-wider text-[10px] mr-1.5">{t('match.whatHelps')}</span>
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
  const { isLight, ink, muted, body } = useInk();
  return (
    <div className="glass-card rounded-2xl p-6 space-y-2.5">
      <div>
        <h4 className={`text-sm font-semibold ${ink}`}>{t('match.poruthamTitle')}</h4>
        <p className={`text-[11px] ${muted}`}>{t('match.poruthamSubtitle')}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {checks.map((c, i) => {
          const color = c.passed ? (c.partial ? '#d97706' : '#059669') : '#e11d48';
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
                <span className={`text-xs font-semibold ${ink}`}>
                  {t(`match.porutham.${c.key}` as 'match.porutham.rajju')}
                </span>
                {c.importance === 'critical' && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-wide font-bold ${
                    isLight ? 'bg-slate-100 text-slate-500' : 'bg-white/6 text-white/45'}`}>
                    {t('match.poruthamCritical')}
                  </span>
                )}
                <span className="ml-auto text-[10px] uppercase tracking-wider font-semibold" style={{ color }}>
                  {c.passed ? (c.partial ? t('match.poruthamPartial') : t('match.poruthamPass')) : t('match.poruthamFail')}
                </span>
              </div>
              <p className={`text-[11px] leading-relaxed ${body}`}>{c.reason}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

const PairChip: React.FC<{ title: string; rashi: number; nakshatra: string; manglik: boolean }> = ({
  title, rashi, nakshatra, manglik,
}) => {
  const { lang, t } = useLang();
  const { ink, faint, inset } = useInk();
  return (
    <div className={`rounded-xl border px-3 py-2 min-w-0 ${inset}`}>
      <div className={`uppercase tracking-wider text-[10px] ${faint}`}>{title}</div>
      <div className={`text-[12px] font-semibold truncate ${ink}`}>
        {labelRashiWestern(rashi, lang, RASHI_ENGLISH[rashi])} · {nakshatra}
      </div>
      {manglik && <div className="text-amber-500 text-[10px] mt-0.5">{t('match.manglik')}</div>}
    </div>
  );
};

const ReportView: React.FC<{ summary: MatchSummary; onReset: () => void }> = ({ summary, onReset }) => {
  const { t } = useLang();
  const { isLight, ink, muted, body, faint, inset } = useInk();
  const [pane, setPane] = useState<MatchPane>('overview');
  const [showClassical, setShowClassical] = useState(false);
  const [showSynDetail, setShowSynDetail] = useState(false);
  const r = summary.report;
  const ins = summary.insights;

  const tabs: Array<{ id: MatchPane; label: string }> = [
    { id: 'overview', label: t('match.tabOverview') },
    { id: 'planets', label: t('match.tabPlanets') },
    { id: 'more', label: t('match.tabMore') },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="glass-card rounded-2xl p-4 sm:p-5 space-y-3">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <PairChip title={t('match.person')} rashi={summary.person.rashi} nakshatra={summary.person.nakshatraName} manglik={summary.person.isManglik} />
          <div className="w-9 h-9 rounded-full bg-rose-400/12 border border-rose-400/25 flex items-center justify-center">
            <Heart className="w-4 h-4 text-rose-400" />
          </div>
          <PairChip title={t('match.partner')} rashi={summary.partner.rashi} nakshatra={summary.partner.nakshatraName} manglik={summary.partner.isManglik} />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="tab-bar inline-flex gap-1 p-1 rounded-xl">
            {tabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setPane(tab.id)}
                className={`px-3 h-8 rounded-lg text-[12px] font-semibold transition-colors ${
                  pane === tab.id
                    ? 'text-[var(--c-accent)] bg-[rgba(var(--c-accent-rgb),0.14)]'
                    : isLight ? 'text-slate-500 hover:text-slate-800' : 'text-white/45 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <button
            onClick={onReset}
            className="chrome-btn ml-auto inline-flex items-center gap-1.5 text-xs px-3 h-8 rounded-xl font-semibold"
          >
            <RefreshCcw className="w-3 h-3" /> {t('match.tryDifferentPartner')}
          </button>
        </div>
      </div>

      {pane === 'overview' && (
        <div className="space-y-4">
          <MatchVerdict summary={summary} />

          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-start gap-2.5">
              <Info className="w-4 h-4 mt-0.5 shrink-0 text-rose-400" />
              <p className={`text-[12px] leading-relaxed ${body}`}>{ins.guidance.framing}</p>
            </div>
          </div>

          <ConflictStrip conflicts={r.conflicts} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className={`rounded-2xl border p-4 ${isLight ? 'border-emerald-200 bg-emerald-50/60' : 'border-emerald-400/25 bg-emerald-500/5'}`}>
              <div className="text-[11px] uppercase tracking-wider mb-2 text-emerald-600">{t('match.strengthsTitle')}</div>
              <ul className="space-y-2">
                {ins.guidance.strengths.map((sgt, i) => (
                  <li key={i} className={`text-[11.5px] leading-relaxed flex gap-2 ${body}`}>
                    <Check className="w-3 h-3 mt-1 text-emerald-500 shrink-0" />
                    <span><span className={`font-semibold ${ink}`}>{sgt.label}</span> — {sgt.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-2">
              <div className="text-[11px] uppercase tracking-wider text-rose-400 px-1">{t('match.frictionsTitle')}</div>
              {ins.guidance.frictions.length === 0 ? (
                <div className={`rounded-xl border p-3 text-[11px] ${inset} ${faint}`}>
                  {t('common.none')}
                </div>
              ) : (
                ins.guidance.frictions.map((f, i) => <FrictionCard key={i} f={f} />)
              )}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 space-y-3">
            <div>
              <h4 className={`text-sm font-semibold ${ink}`}>{t('match.dimensionsTitle')}</h4>
              <p className={`text-[11px] ${muted}`}>{t('match.dimensionsSubtitle')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {ins.dimensions.map((d, i) => <DimensionCard key={d.key} d={d} index={i} />)}
            </div>
          </div>
        </div>
      )}

      {pane === 'planets' && (
        <div className="space-y-4">
          <div className="glass-card rounded-2xl p-5 sm:p-6">
            <div className="mb-3">
              <h4 className={`text-sm font-semibold ${ink}`}>{t('match.webTitle')}</h4>
              <p className={`text-[11px] ${muted}`}>{t('match.webSubtitle')}</p>
            </div>
            <SynastryWeb synastry={r.layer4Synastry} />
          </div>

          <PoruthamCard checks={r.poruthams.checks} />

          <div className="glass-card rounded-2xl p-4">
            <button
              onClick={() => setShowSynDetail(v => !v)}
              aria-expanded={showSynDetail}
              data-open={showSynDetail}
              className="tap-row tap-blink w-full flex items-center justify-between text-left rounded-lg py-2 pl-5 pr-2"
            >
              <span className={`text-xs font-semibold ${body}`}>
                {showSynDetail ? t('match.hideSynDetail') : t('match.showSynDetail')}
              </span>
              <TapBadge open={showSynDetail} direction="down" />
            </button>
            {showSynDetail && (
              <div className="space-y-3 mt-3">
                <p className={`text-[11.5px] leading-relaxed ${body}`}>{r.layer4Synastry.summary}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  <SynastryList title={t('match.aToB')} contacts={r.layer4Synastry.aToB.contacts} net={r.layer4Synastry.aToB.netValence} />
                  <SynastryList title={t('match.bToA')} contacts={r.layer4Synastry.bToA.contacts} net={r.layer4Synastry.bToA.netValence} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {pane === 'more' && (
        <div className="space-y-4">
          <LayerPanel summary={summary} />

          {ins.navamsa && (
            <div className="glass-card rounded-2xl p-5">
              <h4 className={`text-sm font-semibold mb-1.5 ${ink}`}>{t('match.navamsaTitle')}</h4>
              <p className={`text-[11.5px] leading-relaxed ${body}`}>{ins.navamsa.summary}</p>
            </div>
          )}

          {(r.layer3Promise.a || r.layer3Promise.b) && (
            <div className="glass-card rounded-2xl p-6 space-y-3">
              <div>
                <h4 className={`text-sm font-semibold ${ink}`}>{t('match.promiseTitle')}</h4>
                <p className={`text-[11px] ${muted}`}>{t('match.promiseSubtitle')}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {r.layer3Promise.a && <PromiseCard title={t('match.yourChart')} p={r.layer3Promise.a} />}
                {r.layer3Promise.b && <PromiseCard title={t('match.partnerChart')} p={r.layer3Promise.b} />}
              </div>
            </div>
          )}

          <div className="glass-card rounded-2xl p-6 space-y-3">
            <h4 className={`text-sm font-semibold ${ink}`}>{t('match.doshasTitle')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {([['match.yourChart', r.layer2Doshas.a], ['match.partnerChart', r.layer2Doshas.b]] as const).map(([key, chart]) => (
                <div key={key} className="space-y-2">
                  <div className={`text-[10px] uppercase tracking-wider ${faint}`}>{t(key)}</div>
                  {chart.doshas.map(d => <DoshaCard key={d.name} d={d} />)}
                </div>
              ))}
            </div>
            <p className={`text-[11px] leading-relaxed ${muted}`}>{r.layer2Doshas.mutualKuja.description}</p>
          </div>

          <div className="glass-card rounded-2xl p-4">
            <button
              onClick={() => setShowClassical(v => !v)}
              aria-expanded={showClassical}
              data-open={showClassical}
              className="tap-row tap-blink w-full flex items-center justify-between text-left rounded-lg py-2 pl-5 pr-2"
            >
              <span className={`text-xs font-semibold ${body}`}>
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
        </div>
      )}
    </motion.div>
  );
};

export const MatchTab: React.FC<Props> = ({ person }) => {
  const { t } = useLang();
  const { ink, muted, body, faint, inset } = useInk();
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
        <div className="glass-card rounded-2xl p-6 overflow-hidden relative">
          <div
            className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full blur-3xl"
            style={{ background: 'rgba(var(--c-accent-rgb),0.12)' }}
          />
          <div className="relative flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-rose-400/12 border border-rose-400/25 flex items-center justify-center">
              <Heart className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h3 className={`text-base font-semibold ${ink}`}>{t('match.title')}</h3>
              <p className={`text-[12px] ${muted}`}>{t('match.subtitle')}</p>
            </div>
          </div>
          <p className={`relative text-[12px] leading-relaxed ${body}`}>
            {t('match.explanation')}
          </p>
        </div>

        <div className="glass-card rounded-2xl p-4 sm:p-5">
          <div className="grid grid-cols-1 min-[420px]:grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-3">
            <div className={`rounded-xl border px-3 py-3 min-w-0 ${inset}`}>
              <div className={`flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold mb-1 ${faint}`}>
                <User className="w-3 h-3" /> {t('match.person')}
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className={`text-[13px] font-semibold truncate ${ink}`}>{t('match.youReady')}</span>
              </div>
              <p className={`text-[11px] mt-1 truncate ${body}`}>{formatBirthStamp(person.date)}</p>
              <p className={`text-[10px] truncate ${faint}`}>{person.timezone}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-rose-400/12 border border-rose-400/25 flex items-center justify-center shrink-0">
              <Heart className="w-4 h-4 text-rose-400" />
            </div>
            <div className={`rounded-xl border px-3 py-3 min-w-0 ${inset}`}>
              <div className={`text-[10px] uppercase tracking-wider font-semibold mb-1 ${faint}`}>{t('match.partner')}</div>
              <p className={`text-[13px] font-semibold ${ink}`}>{t('match.partnerNeeded')}</p>
              <p className={`text-[11px] mt-1 ${muted}`}>{t('match.subtitle')}</p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-3 sm:p-4">
          <BirthDataForm onSubmit={setPartner} lockSystem="VEDIC" />
        </div>
      </motion.div>
    );
  }

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 text-sm py-12 justify-center ${muted}`}>
        <Loader2 className="w-4 h-4 animate-spin" /> {t('match.computing')}
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="glass-card rounded-2xl p-6">
        <div className="text-rose-400 text-sm mb-3">{t('match.failed')}</div>
        <button onClick={() => setPartner(null)} className="chrome-btn text-xs px-3 h-8 rounded-xl font-semibold">
          {t('common.tryAgain')}
        </button>
      </div>
    );
  }

  return <ReportView summary={data} onReset={() => setPartner(null)} />;
};
