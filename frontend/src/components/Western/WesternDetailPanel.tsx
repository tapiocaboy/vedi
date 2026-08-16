/**
 * The side panel the chart wheel opens when a planet, house, sign, or angle
 * is tapped — the same click-to-expand content already in the Natal Chart
 * modal, surfaced directly from the visual so a reader who doesn't know to
 * look for a separate "Natal Chart" button still gets the explanation.
 *
 * Follows the Vedic side-panel convention (`Chart/HouseDetailPanel.tsx`):
 * theme-aware via `panelTokens`, portaled to `document.body` since the
 * `.glass-card` ancestor's `backdrop-filter` traps `position:fixed`.
 */

import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { panelTokens } from '../Chart/panelTokens';
import type { Tone } from '../../lib/core/western/natal';

export interface DetailSection { heading: string; body?: string; bullets?: string[]; tone?: Tone }
export interface DetailBadge { label: string; tone: Tone }
export interface DetailContent {
  icon: string;
  title: string;
  subtitle: string;
  badges: DetailBadge[];
  summary: string;
  sections: DetailSection[];
}

const TONE_HEX: Record<Tone, string> = {
  good: '#22c55e', bad: '#f43f5e', neutral: '#94a3b8', info: 'var(--c-accent)',
};

const spring = { type: 'spring' as const, stiffness: 320, damping: 32 };

export const WesternDetailPanel: React.FC<{ content: DetailContent | null; onClose: () => void }> = ({ content, onClose }) => {
  const isLight = useTheme();
  const tk = panelTokens(isLight);

  return createPortal(
    <AnimatePresence>
      {content && (
        <>
          <motion.div
            key="bd"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[70] backdrop-blur-sm"
            style={{ background: tk.backdropBg }}
          />
          <div className="fixed right-0 top-0 bottom-0 z-[80] flex items-stretch pointer-events-none">
            <motion.div
              key="panel"
              initial={{ x: '100%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '100%', opacity: 0 }}
              transition={spring}
              className="pointer-events-auto w-screen max-w-md overflow-y-auto"
              style={{ background: tk.panelBg, borderLeft: `1px solid ${tk.panelBdr}` }}
            >
              <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-5 py-4"
                style={{ background: tk.headerBg, borderBottom: `1px solid ${tk.headerBdr}`, backdropFilter: 'blur(12px)' }}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold"
                    style={{ background: 'rgba(var(--c-accent-rgb),0.10)', border: '1px solid rgba(var(--c-accent-rgb),0.28)', color: 'var(--c-accent)' }}>
                    {content.icon}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base font-display font-bold truncate" style={{ color: tk.titleClr }}>{content.title}</h2>
                    <p className="text-xs font-mono truncate" style={{ color: tk.subClr }}>{content.subtitle}</p>
                  </div>
                </div>
                <button onClick={onClose} aria-label="Close"
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors"
                  style={{ color: tk.subClr }}
                  onMouseEnter={e => (e.currentTarget.style.background = tk.secBg)}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-4 pb-10">
                <p className="text-sm leading-relaxed border-l-2 pl-3" style={{ color: tk.bodyClr, borderColor: 'rgba(var(--c-accent-rgb),0.35)' }}>
                  {content.summary}
                </p>

                {content.badges.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {content.badges.map((b, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md text-[10px] font-semibold"
                        style={{ color: TONE_HEX[b.tone], background: `${colorAlpha(TONE_HEX[b.tone])}`, border: `1px solid ${TONE_HEX[b.tone]}55` }}>
                        {b.label}
                      </span>
                    ))}
                  </div>
                )}

                {content.sections.map((s, i) => (
                  <div key={i} className="space-y-1">
                    <div className="text-[10px] uppercase tracking-wider font-semibold"
                      style={{ color: s.tone ? TONE_HEX[s.tone] : tk.mutedClr }}>
                      {s.heading}
                    </div>
                    {s.body && <p className="text-[13px] leading-relaxed" style={{ color: tk.bodyClr }}>{s.body}</p>}
                    {s.bullets && s.bullets.length > 0 && (
                      <ul className="space-y-1">
                        {s.bullets.map((b, j) => (
                          <li key={j} className="text-[12.5px] leading-relaxed flex gap-1.5" style={{ color: tk.bodyClr }}>
                            <span className="shrink-0" style={{ color: s.tone ? TONE_HEX[s.tone] : 'var(--c-accent)' }}>•</span>
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
};

/** `var(--c-accent)` can't be string-sliced for an alpha channel, so info badges get a fixed translucent tint. */
function colorAlpha(hex: string): string {
  return hex.startsWith('#') ? `${hex}1a` : 'rgba(var(--c-accent-rgb),0.10)';
}
