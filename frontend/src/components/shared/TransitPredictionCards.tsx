/**
 * TransitPredictionCards — renders transit predictions ordinary-people-first:
 * a summary strip (how many things are helping / need care / good to know),
 * then one card per prediction led by its jargon-free headline and takeaway,
 * with the technical astrology (Sanskrit term + full reading) tucked behind a
 * per-card "astro detail" toggle.
 */

import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, Info, ChevronDown } from 'lucide-react';
import type { TransitPrediction } from '../../lib/core/transitAnalysis';
import { useTheme } from '../../hooks/useTheme';
import { useLang } from '../../i18n/LanguageContext';

const TONE_COLOR: Record<TransitPrediction['tone'], string> = {
  good: '#10b981',
  bad: '#f43f5e',
  neutral: '#94a3b8',
  info: 'var(--c-accent-2)',
};

const ToneIcon: React.FC<{ tone: TransitPrediction['tone'] }> = ({ tone }) => {
  const cls = 'w-3.5 h-3.5 shrink-0 mt-0.5';
  const style = { color: TONE_COLOR[tone] };
  if (tone === 'good') return <CheckCircle2 className={cls} style={style} />;
  if (tone === 'bad') return <AlertTriangle className={cls} style={style} />;
  return <Info className={cls} style={style} />;
};

interface Props { predictions: TransitPrediction[]; }

export const TransitPredictionCards: React.FC<Props> = ({ predictions }) => {
  const isLight = useTheme();
  const { t } = useLang();
  const [open, setOpen] = useState<Set<string>>(() => new Set());

  const head = isLight ? 'text-gray-800' : 'text-white';
  const body = isLight ? 'text-slate-600' : 'text-white/70';
  const sub = isLight ? 'text-slate-400' : 'text-white/35';
  const cardCls = isLight ? 'border-slate-200 bg-slate-50' : 'border-white/8 bg-black/20';

  const goodN = predictions.filter(p => p.tone === 'good').length;
  const badN = predictions.filter(p => p.tone === 'bad').length;
  const infoN = predictions.length - goodN - badN;

  const toggle = (id: string) =>
    setOpen(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });

  const pill = (n: number, label: string, tone: TransitPrediction['tone']) => (
    <span
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
      style={{ color: TONE_COLOR[tone], background: `${tone === 'info' ? 'rgba(var(--c-accent2-rgb,139,92,246),0.12)' : TONE_COLOR[tone] + '1f'}` }}
    >
      <ToneIcon tone={tone} /> {n} {label}
    </span>
  );

  return (
    <div>
      {/* Summary strip — the one-glance verdict */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {goodN > 0 && pill(goodN, t('now.predHelping'), 'good')}
        {badN > 0 && pill(badN, t('now.predWatch'), 'bad')}
        {infoN > 0 && pill(infoN, t('now.predInfo'), 'info')}
      </div>

      <div className="grid sm:grid-cols-2 gap-2">
        {predictions.map(p => {
          const isOpen = open.has(p.id);
          return (
            <div
              key={p.id}
              className={`rounded-xl border p-3 flex flex-col ${cardCls}`}
              style={{ borderLeft: `3px solid ${TONE_COLOR[p.tone]}` }}
            >
              <div className="flex items-start gap-1.5 mb-1">
                <ToneIcon tone={p.tone} />
                <span className={`text-xs font-bold leading-snug ${head}`}>{p.plainTitle}</span>
              </div>
              <p className={`text-[12px] leading-relaxed ${body}`}>{p.plain}</p>

              <button
                type="button"
                onClick={() => toggle(p.id)}
                aria-expanded={isOpen}
                className={`mt-2 self-start flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider ${sub}`}
              >
                {t('now.predDetail')}
                <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              {isOpen && (
                <div className="mt-1.5 pt-2 border-t" style={{ borderColor: isLight ? 'rgba(15,23,42,0.06)' : 'rgba(255,255,255,0.06)' }}>
                  <span
                    className="inline-block px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider mb-1"
                    style={{ color: 'var(--c-accent-2)', background: 'rgba(var(--c-accent-rgb),0.08)' }}
                  >
                    {p.title}
                  </span>
                  <p className={`text-[11px] leading-relaxed ${sub}`}>{p.text}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TransitPredictionCards;
