import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Orbit, X, Loader2, ChevronDown, AlertTriangle, Sparkles } from 'lucide-react';
import { buildNatalReport, type NatalLine, type NatalSection, type Tone } from '../../lib/core/natal';
import { PLANET_SYMBOLS } from '../../types/astrology';
import type { BirthData } from '../../types/astrology';
import { useLang } from '../../i18n/LanguageContext';

interface Props {
  visible: boolean;
  onClose: () => void;
  birthData: BirthData | null;
}

const TONE_TEXT: Record<Tone, string> = {
  good: 'text-emerald-300',
  bad: 'text-rose-300',
  neutral: 'text-white/55',
  info: 'text-violet-300',
};
const TONE_CHIP: Record<Tone, string> = {
  good: 'text-emerald-300 bg-emerald-500/12 border-emerald-400/30',
  bad: 'text-rose-300 bg-rose-500/12 border-rose-400/30',
  neutral: 'text-white/60 bg-white/5 border-white/12',
  info: 'text-violet-300 bg-violet-500/12 border-violet-400/30',
};
const TONE_BULLET: Record<Tone, string> = {
  good: 'text-emerald-400',
  bad: 'text-rose-400',
  neutral: 'text-violet-400',
  info: 'text-violet-400',
};

function LineIcon({ icon }: { icon: string }) {
  const symbol = PLANET_SYMBOLS[icon];
  let glyph: string;
  if (symbol) glyph = symbol;
  else if (icon === 'LAGNA') glyph = '↑';
  else if (icon === 'STAR') glyph = '✦';
  else glyph = icon; // house number
  return (
    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm font-semibold"
      style={{ background: 'rgba(var(--c-accent-rgb),0.10)', border: '1px solid rgba(var(--c-accent-rgb),0.22)', color: 'var(--c-accent)' }}>
      {glyph}
    </div>
  );
}

const Section: React.FC<{ s: NatalSection }> = ({ s }) => (
  <div className="space-y-1">
    <div className={`text-[10px] uppercase tracking-wider font-semibold ${s.tone ? TONE_TEXT[s.tone] : 'text-white/40'}`}>{s.heading}</div>
    {s.body && <p className="text-[12px] text-white/75 leading-relaxed">{s.body}</p>}
    {s.bullets && s.bullets.length > 0 && (
      <ul className="space-y-1">
        {s.bullets.map((b, i) => (
          <li key={i} className="text-[11.5px] text-white/65 leading-relaxed flex gap-1.5">
            <span className={`shrink-0 ${s.tone ? TONE_BULLET[s.tone] : 'text-violet-400'}`}>•</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>
    )}
  </div>
);

const LineRow: React.FC<{ line: NatalLine; open: boolean; onToggle: () => void }> = ({ line, open, onToggle }) => (
  <div className={`rounded-xl border bg-black/30 overflow-hidden transition-colors ${open ? 'border-[rgba(var(--c-accent-rgb),0.35)]' : 'border-white/8'}`}>
    <button onClick={onToggle} className="w-full flex items-start gap-3 p-3 text-left hover:bg-white/[0.03] transition-colors">
      <LineIcon icon={line.icon} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-sm font-semibold text-white leading-tight">{line.title}</h4>
          <ChevronDown className={`w-4 h-4 text-white/40 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
        <p className="text-[11px] text-white/45 mt-0.5">{line.subtitle}</p>
        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          {line.badges.map((b, i) => (
            <span key={i} className={`px-2 py-0.5 rounded-md border text-[10px] font-semibold ${TONE_CHIP[b.tone]}`}>{b.label}</span>
          ))}
        </div>
        {!open && <p className="text-[11.5px] text-white/55 leading-relaxed mt-2">{line.summary}</p>}
      </div>
    </button>
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden"
        >
          <div className="px-3 pb-3.5 pl-[3.25rem] space-y-3">
            <p className="text-[12px] text-white/80 leading-relaxed border-l-2 pl-3" style={{ borderColor: 'rgba(var(--c-accent-rgb),0.35)' }}>{line.summary}</p>
            {line.sections.map((s, i) => <Section key={i} s={s} />)}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const GROUP_LABEL: Record<NatalLine['group'], string> = {
  lagna: 'Ascendant & Birth Star',
  nakshatra: 'Ascendant & Birth Star',
  planet: 'The Nine Planets',
  house: 'The Twelve Houses',
};

const Body: React.FC<{ birthData: BirthData }> = ({ birthData }) => {
  const { t } = useLang();
  const [openId, setOpenId] = useState<string | null>('lagna');

  const { data, isLoading, error } = useQuery({
    queryKey: ['natal-report', birthData],
    queryFn: () => buildNatalReport(birthData),
    staleTime: Infinity, // a natal chart never changes
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-white/45 text-sm py-16 justify-center">
        <Loader2 className="w-4 h-4 animate-spin" /> {t('natal.computing')}
      </div>
    );
  }
  if (error || !data) {
    return <div className="text-rose-300 text-sm py-10 text-center">{t('now.failed')}</div>;
  }

  // Render groups in order, with a header before each new group.
  const groupsRendered = new Set<string>();
  return (
    <div className="space-y-4">
      <div className="rounded-xl border p-3.5" style={{ borderColor: 'rgba(var(--c-accent-rgb),0.20)', background: 'rgba(var(--c-accent-rgb),0.05)' }}>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--c-accent-2)' }} />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-white">{data.meta.ascendantEnglish} Ascendant · Moon in {data.meta.moonNakshatra}</span>
        </div>
        <p className="text-[12px] text-white/70 leading-relaxed">{t('natal.intro')}</p>
      </div>

      {data.lines.map(line => {
        const label = GROUP_LABEL[line.group];
        const showHeader = !groupsRendered.has(label);
        if (showHeader) groupsRendered.add(label);
        return (
          <React.Fragment key={line.id}>
            {showHeader && (
              <div className="text-[11px] font-semibold uppercase tracking-wider text-white/40 pt-1 px-0.5">{label}</div>
            )}
            <LineRow line={line} open={openId === line.id} onToggle={() => setOpenId(openId === line.id ? null : line.id)} />
          </React.Fragment>
        );
      })}

      <p className="text-[10px] text-white/30 text-center pt-1">{t('natal.disclaimer')}</p>
    </div>
  );
};

export const NatalChartModal: React.FC<Props> = ({ visible, onClose, birthData }) => {
  const { t } = useLang();
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-start sm:items-center justify-center p-3 sm:p-6"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative glass-card rounded-2xl w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden mt-12 sm:mt-0"
          >
            <div className="flex items-center gap-3 p-4 sm:p-5 border-b border-white/8 shrink-0">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: 'rgba(var(--c-accent-rgb),0.10)', border: '1px solid rgba(var(--c-accent-rgb),0.22)' }}>
                <Orbit className="w-4.5 h-4.5" style={{ color: 'var(--c-accent)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-white">{t('natal.title')}</h3>
                <p className="text-[11px] text-white/45 truncate">{t('natal.subtitle')}</p>
              </div>
              <button onClick={onClose} aria-label={t('monthly.close')}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/8 transition-colors shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto p-4 sm:p-5">
              {birthData ? (
                <Body birthData={birthData} />
              ) : (
                <div className="flex flex-col items-center gap-3 text-center py-12 px-4">
                  <AlertTriangle className="w-7 h-7 text-amber-300/70" />
                  <p className="text-sm text-white/65 max-w-xs leading-relaxed">{t('natal.needChart')}</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
