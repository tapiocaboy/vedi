/**
 * "The astrology behind this" for one life area: how the score adds up part by
 * part, the classical combinations active now (each with its measured track
 * record), the engine's own notes, and how the score held up against real lives.
 *
 * `AreaWhy` is the disclosure (a quiet text toggle under a plain reading);
 * `AreaWhyBody` is the content, for panels that are already an expander.
 * All wording comes from lib/core/areaReading.ts.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, CheckCircle2, AlertCircle, FlaskConical } from 'lucide-react';
import type { AreaReading, ReadingRow } from '../../lib/core/areaReading';

/** Points beyond this fill the whole contribution bar. */
const BAR_FULL = 1.5;

const signed = (x: number) => `${x > 0 ? '+' : x < 0 ? '−' : '±'}${Math.abs(x).toFixed(1)}`;

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-1.5">
    <div className="text-[10px] uppercase tracking-wider text-white/40">{title}</div>
    {children}
  </div>
);

const PartRow: React.FC<{ row: ReadingRow }> = ({ row }) => {
  const up = row.points >= 0;
  const width = `${Math.min(100, (Math.abs(row.points) / BAR_FULL) * 100)}%`;
  return (
    <li className="py-1.5 border-t border-white/5 first:border-t-0">
      <div className="flex items-start gap-2">
        <span className={`w-10 shrink-0 text-right font-mono text-[11px] ${up ? 'text-emerald-300' : 'text-rose-300'}`}>{signed(row.points)}</span>
        <div className="flex-1 min-w-0">
          <div className="text-[12px] text-white/85 leading-snug">{row.label}</div>
          {row.detail && <div className="text-[11px] text-white/45 leading-snug mt-0.5">{row.detail}</div>}
          {row.notes.length > 0 && (
            <ul className="mt-1 space-y-0.5">
              {row.notes.map((n, i) => <li key={i} className="text-[11px] text-white/50 leading-snug">{n}</li>)}
            </ul>
          )}
        </div>
        <div className="w-14 shrink-0 h-1.5 mt-1.5 rounded-full bg-white/5 overflow-hidden" aria-hidden>
          <div className={`h-full rounded-full ${up ? 'bg-emerald-400/60' : 'bg-rose-400/60'}`} style={{ width }} />
        </div>
      </div>
    </li>
  );
};

export const AreaWhyBody: React.FC<{ reading: AreaReading }> = ({ reading: r }) => (
  <div className="space-y-4">
    <Section title={r.labels.scoreBuild}>
      <div className="text-[12px] text-white/80 font-medium">{r.scoreLine}</div>
      <ul>
        <li className="py-1.5 flex items-center gap-2">
          <span className="w-10 shrink-0 text-right font-mono text-[11px] text-white/50">{r.start.value.toFixed(1)}</span>
          <span className="text-[12px] text-white/55">{r.start.label}</span>
        </li>
        {r.rows.map((row, i) => <PartRow key={i} row={row} />)}
      </ul>
    </Section>

    <Section title={r.labels.combos}>
      {r.indicators.length ? (
        <ul className="space-y-2">
          {r.indicators.map(ind => {
            const Icon = ind.tone === 'support' ? CheckCircle2 : AlertCircle;
            return (
              <li key={ind.key} className="flex items-start gap-2">
                <Icon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${ind.tone === 'support' ? 'text-emerald-300' : 'text-rose-300'}`} />
                <div className="min-w-0">
                  <div className="text-[12px] text-white/80 leading-snug">{ind.text}</div>
                  {ind.evidence && <div className="text-[11px] text-white/45 leading-snug mt-0.5">{ind.evidence}</div>}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-[11px] text-white/45">{r.indicatorsEmpty}</p>
      )}
      {r.noSkyNote && <p className="text-[11px] text-white/35">{r.noSkyNote}</p>}
    </Section>

    {r.notes.length > 0 && (
      <Section title={r.labels.notes}>
        <ul className="space-y-1">
          {r.notes.map((n, i) => (
            <li key={i} className="text-[11px] text-white/60 leading-relaxed flex gap-2">
              <span className="text-violet-400 shrink-0">•</span>
              <span>{n}</span>
            </li>
          ))}
        </ul>
      </Section>
    )}

    {(r.scoreEvidence || r.footnote) && (
      <Section title={r.labels.tested}>
        <div className="rounded-lg border border-white/8 bg-white/[0.02] p-2.5 space-y-1.5">
          {r.scoreEvidence && (
            <p className="text-[11px] text-white/60 leading-relaxed flex gap-2">
              <FlaskConical className="w-3.5 h-3.5 mt-0.5 shrink-0 text-white/40" />
              <span>{r.scoreEvidence}</span>
            </p>
          )}
          {r.footnote && <p className="text-[11px] text-white/45 leading-relaxed">{r.footnote}</p>}
        </div>
      </Section>
    )}
  </div>
);

/**
 * A quiet "The astrology behind this" toggle with collapsed content — the one
 * pattern every plain-first reading in the app uses for its technical layer.
 */
export const AstroDisclosure: React.FC<{
  showLabel: string;
  hideLabel: string;
  children: React.ReactNode;
  className?: string;
}> = ({ showLabel, hideLabel, children, className = '' }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium hover:opacity-90"
        style={{ color: 'var(--c-accent-2)' }}
      >
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
        {open ? hideLabel : showLabel}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-2 rounded-lg border border-white/8 bg-black/20 p-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const AreaWhy: React.FC<{ reading: AreaReading; label?: string; children?: React.ReactNode }> = ({ reading, label, children }) => (
  <AstroDisclosure showLabel={label ?? reading.labels.show} hideLabel={reading.labels.hide}>
    {children}
    <AreaWhyBody reading={reading} />
  </AstroDisclosure>
);

export default AreaWhy;
