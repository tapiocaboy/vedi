import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Heart, Loader2, RefreshCcw, Info } from 'lucide-react';
import { BirthDataForm } from '../Forms/BirthDataForm';
import { getWesternMatchReport } from '../../services/api';
import type { BirthData } from '../../types/astrology';
import type { WesternMatchSummary } from '../../services/api';
import type { WesternSynastryContact } from '../../lib/core/western/synastry';
import { formatOrb } from '../../lib/core/western/aspects';
import { westernPlanetName } from '../../lib/core/western/text/planetText';
import { useLang } from '../../i18n/LanguageContext';

interface Props { person: BirthData }

const VALENCE_STYLE: Record<WesternSynastryContact['valence'], { border: string; bg: string; text: string }> = {
  supportive: { border: 'border-emerald-400/30', bg: 'bg-emerald-500/6', text: 'text-emerald-300' },
  adverse: { border: 'border-rose-400/30', bg: 'bg-rose-500/6', text: 'text-rose-300' },
  neutral: { border: 'border-white/10', bg: 'bg-white/3', text: 'text-white/50' },
};

function ordinal(n: number): string {
  const v = n % 100;
  if (v >= 11 && v <= 13) return 'th';
  return ['th', 'st', 'nd', 'rd'][n % 10] ?? 'th';
}
function houseLabel(house: number | undefined, lang: 'en' | 'si'): string {
  if (!house) return '';
  return lang === 'si' ? `${house} වන භාවය` : `house ${house}${ordinal(house)}`;
}

const ContactRow: React.FC<{ c: WesternSynastryContact; index: number }> = ({ c, index }) => {
  const { lang } = useLang();
  const style = VALENCE_STYLE[c.valence];
  const target = c.kind === 'aspect' ? westernPlanetName(c.target, lang) : houseLabel(c.house, lang);
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.02 }}
      className={`rounded-lg border px-3 py-2 ${style.border} ${style.bg}`}
    >
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-[11.5px] font-semibold ${style.text}`}>
          {westernPlanetName(c.body, lang)} {c.kind === 'aspect' ? '↔' : '→'} {target}
        </span>
        {c.orb != null && <span className="text-[10px] font-mono text-white/30 ml-auto">{formatOrb(c.orb)}</span>}
      </div>
      <p className="text-[11px] text-white/60 leading-relaxed mt-1">{c.interpretation}</p>
    </motion.div>
  );
};

const DirectionColumn: React.FC<{ title: string; net: number; contacts: WesternSynastryContact[]; expanded: boolean }> = ({ title, net, contacts, expanded }) => {
  const shown = expanded ? contacts : contacts.slice(0, 6);
  return (
    <div className="rounded-xl border border-white/8 bg-black/25 p-3">
      <div className="flex items-baseline justify-between mb-1.5">
        <div className="text-[10px] uppercase tracking-wider text-white/35">{title}</div>
        <div className={`text-[10px] font-mono ${net < 0 ? 'text-rose-300/70' : net > 0 ? 'text-emerald-300/70' : 'text-white/30'}`}>
          {net > 0 ? '+' : ''}{net.toFixed(2)}
        </div>
      </div>
      <div className="space-y-1.5">
        {shown.map((c, i) => <ContactRow key={`${c.direction}-${c.body}-${c.target}-${i}`} c={c} index={i} />)}
      </div>
    </div>
  );
};

const ReportView: React.FC<{ data: WesternMatchSummary; onReset: () => void }> = ({ data, onReset }) => {
  const { t } = useLang();
  const [expanded, setExpanded] = useState(false);
  const s = data.synastry;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="glass-card rounded-2xl p-6 space-y-3">
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="rounded-lg bg-black/30 border border-white/8 px-3 py-2">
            <div className="text-white/40 uppercase tracking-wider text-[10px]">{t('western.match.you')}</div>
            <div className="text-white">{data.personChart.planets.find(p => p.planet === 'SUN')?.sign} Sun · {data.personChart.ascendant.sign} Rising</div>
          </div>
          <div className="rounded-lg bg-black/30 border border-white/8 px-3 py-2">
            <div className="text-white/40 uppercase tracking-wider text-[10px]">{t('western.match.partner')}</div>
            <div className="text-white">{data.partnerChart.planets.find(p => p.planet === 'SUN')?.sign} Sun · {data.partnerChart.ascendant.sign} Rising</div>
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <Info className="w-4 h-4 mt-0.5 shrink-0 text-violet-300" />
          <p className="text-[12px] text-white/75 leading-relaxed">{s.summary}</p>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6 space-y-2.5">
        <div>
          <h4 className="text-sm font-semibold text-white">{t('western.match.definingTitle')}</h4>
          <p className="text-[11px] text-white/40">{t('western.match.definingSubtitle')}</p>
        </div>
        <div className="space-y-1.5">
          {s.defining.map((c, i) => <ContactRow key={`def-${i}`} c={c} index={i} />)}
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6 space-y-3">
        <h4 className="text-sm font-semibold text-white">{t('western.match.contactsTitle')}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          <DirectionColumn title={t('western.match.aToB')} net={s.aToB.netValence} contacts={s.aToB.contacts} expanded={expanded} />
          <DirectionColumn title={t('western.match.bToA')} net={s.bToA.netValence} contacts={s.bToA.contacts} expanded={expanded} />
        </div>
        <button
          onClick={() => setExpanded(v => !v)}
          className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:bg-white/10"
        >
          {expanded ? t('western.match.hideDetail') : t('western.match.showDetail')}
        </button>
      </div>

      <div className="flex justify-end">
        <button onClick={onReset} className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 inline-flex items-center gap-1.5">
          <RefreshCcw className="w-3 h-3" /> {t('western.match.tryDifferentPartner')}
        </button>
      </div>
    </motion.div>
  );
};

export const WesternMatchTab: React.FC<Props> = ({ person }) => {
  const { lang, t } = useLang();
  const [partner, setPartner] = useState<BirthData | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['western-match', person, partner, lang],
    queryFn: () => getWesternMatchReport(person, partner!, lang),
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
              <h3 className="text-sm font-semibold text-white">{t('western.match.title')}</h3>
              <p className="text-[11px] text-white/40">{t('western.match.subtitle')}</p>
            </div>
          </div>
          <p className="text-[11px] text-white/50 leading-relaxed mb-4">{t('western.match.explanation')}</p>
        </div>
        <div className="glass-card rounded-2xl p-6">
          <BirthDataForm onSubmit={setPartner} lockSystem="WESTERN" />
        </div>
      </motion.div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-white/40 text-sm py-12 justify-center">
        <Loader2 className="w-4 h-4 animate-spin" /> {t('western.match.computing')}
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="glass-card rounded-2xl p-6">
        <div className="text-rose-300 text-sm mb-3">{t('western.match.failed')}</div>
        <button onClick={() => setPartner(null)} className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:bg-white/10">
          {t('common.tryAgain')}
        </button>
      </div>
    );
  }

  return <ReportView data={data} onReset={() => setPartner(null)} />;
};
