import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Heart, Check, X, AlertTriangle, RefreshCcw, Loader2 } from 'lucide-react';
import { BirthDataForm } from '../Forms/BirthDataForm';
import { getMatchReport } from '../../services/api';
import type { BirthData, MatchSummary, KootaScore, DoshaResult } from '../../services/api';
import { RASHI_ENGLISH } from '../../lib/core/rashi';

interface Props {
  person: BirthData;
}

function verdictClass(v: MatchSummary['report']['verdict']): string {
  switch (v) {
    case 'excellent':       return 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40';
    case 'very good':       return 'bg-emerald-500/12 text-emerald-200 border-emerald-400/30';
    case 'good':            return 'bg-sky-500/15 text-sky-200 border-sky-400/30';
    case 'acceptable':      return 'bg-amber-500/15 text-amber-200 border-amber-400/30';
    case 'not recommended': return 'bg-rose-500/20 text-rose-200 border-rose-400/40';
  }
}

const ScoreGauge: React.FC<{ summary: MatchSummary }> = ({ summary }) => {
  const r = summary.report;
  const pct = r.percent;
  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-lg bg-rose-400/10 border border-rose-400/20 flex items-center justify-center">
          <Heart className="w-4 h-4 text-rose-300" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-white">Ashtakoot Milan</h3>
          <p className="text-[11px] text-white/40">Classical 8-fold compatibility scoring (BPHS)</p>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="text-5xl font-mono font-bold text-white tabular-nums">
          {r.totalObtained}
          <span className="text-2xl text-white/30">/{r.totalMax}</span>
        </div>
        <div className={`px-3 py-1.5 rounded-lg border text-xs font-semibold uppercase tracking-wider ${verdictClass(r.verdict)}`}>
          {r.verdict}
        </div>
      </div>

      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-rose-400 via-violet-400 to-emerald-400 transition-all" style={{ width: `${pct}%` }} />
      </div>
      <div className="grid grid-cols-2 gap-2 mt-4 text-[11px]">
        <div className="rounded-lg bg-black/30 border border-white/8 px-3 py-2">
          <div className="text-white/40 uppercase tracking-wider text-[10px]">Person</div>
          <div className="text-white">{RASHI_ENGLISH[summary.person.rashi]} · {summary.person.nakshatraName}</div>
          {summary.person.isManglik && <div className="text-amber-300 text-[10px] mt-0.5">Manglik</div>}
        </div>
        <div className="rounded-lg bg-black/30 border border-white/8 px-3 py-2">
          <div className="text-white/40 uppercase tracking-wider text-[10px]">Partner</div>
          <div className="text-white">{RASHI_ENGLISH[summary.partner.rashi]} · {summary.partner.nakshatraName}</div>
          {summary.partner.isManglik && <div className="text-amber-300 text-[10px] mt-0.5">Manglik</div>}
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
      <div className="h-1 bg-black/40 rounded-full overflow-hidden mb-2">
        <div className={`h-full ${k.passed ? 'bg-emerald-400' : 'bg-rose-400'}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-[11px] text-white/65 leading-relaxed">{k.reason}</p>
    </motion.div>
  );
};

const DoshaCard: React.FC<{ d: DoshaResult }> = ({ d }) => {
  const tone =
    !d.present                ? 'border-emerald-400/30 bg-emerald-500/6'
    : d.mitigated             ? 'border-amber-400/30 bg-amber-500/6'
                              : 'border-rose-400/30 bg-rose-500/6';
  const Icon = !d.present ? Check : d.mitigated ? AlertTriangle : X;
  const iconCol = !d.present ? 'text-emerald-300' : d.mitigated ? 'text-amber-300' : 'text-rose-300';
  const label = !d.present ? 'Absent' : d.mitigated ? 'Cancelled' : 'Present';
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

const ReasonList: React.FC<{ title: string; items: string[]; tone: 'good' | 'bad' }> = ({ title, items, tone }) => (
  <div className={`rounded-xl border p-3 ${tone === 'good' ? 'border-emerald-400/25 bg-emerald-500/5' : 'border-rose-400/25 bg-rose-500/5'}`}>
    <div className={`text-[11px] uppercase tracking-wider mb-2 ${tone === 'good' ? 'text-emerald-200/70' : 'text-rose-200/70'}`}>{title}</div>
    {items.length === 0 ? (
      <div className="text-[11px] text-white/40">None.</div>
    ) : (
      <ul className="space-y-1.5">
        {items.map((it, i) => (
          <li key={i} className="text-[11px] text-white/75 leading-relaxed flex gap-2">
            {tone === 'good' ? <Check className="w-3 h-3 mt-0.5 text-emerald-300/70 shrink-0" /> : <X className="w-3 h-3 mt-0.5 text-rose-300/70 shrink-0" />}
            <span>{it}</span>
          </li>
        ))}
      </ul>
    )}
  </div>
);

const ReportView: React.FC<{ summary: MatchSummary; onReset: () => void }> = ({ summary, onReset }) => {
  const r = summary.report;
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <ScoreGauge summary={summary} />

      <div className="glass-card rounded-2xl p-6 space-y-3">
        <h4 className="text-sm font-semibold text-white">8 Kootas — point-by-point</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {r.kootas.map((k, i) => <KootaCard key={k.name} k={k} index={i} />)}
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6 space-y-3">
        <h4 className="text-sm font-semibold text-white">Doshas (afflictions)</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {r.doshas.map(d => <DoshaCard key={d.name} d={d} />)}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <ReasonList title="Why it matches" items={r.whyMatching} tone="good" />
        <ReasonList title="Why it doesn't match" items={r.whyNotMatching} tone="bad" />
      </div>

      <div className="flex justify-end">
        <button onClick={onReset} className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 inline-flex items-center gap-1.5">
          <RefreshCcw className="w-3 h-3" /> Try a different partner
        </button>
      </div>
    </motion.div>
  );
};

export const MatchTab: React.FC<Props> = ({ person }) => {
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
              <h3 className="text-sm font-semibold text-white">Horoscope Matching</h3>
              <p className="text-[11px] text-white/40">Enter your partner's birth details for Ashtakoot Milan compatibility</p>
            </div>
          </div>
          <p className="text-[11px] text-white/50 leading-relaxed mb-4">
            Calculation uses the classical 8-koota system (Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot, Nadi)
            scoring out of 36, plus the Manglik / Bhakoot / Nadi dosha checks. Birth time is required for accurate results.
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
        <Loader2 className="w-4 h-4 animate-spin" /> Running Ashtakoot Milan…
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="glass-card rounded-2xl p-6">
        <div className="text-rose-300 text-sm mb-3">Failed to compute matching.</div>
        <button onClick={() => setPartner(null)} className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:bg-white/10">
          Try again
        </button>
      </div>
    );
  }

  return <ReportView summary={data} onReset={() => setPartner(null)} />;
};
