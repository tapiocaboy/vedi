/**
 * The one place that says "this thing opens something".
 *
 * Every panel in the app has content that expands — a planet row, a yoga card,
 * a dasha period, a transit. Rendered as plain content they are invisible as
 * controls, and readers miss most of the app. The `.tap-row` / `.tap-card`
 * styles in index.css carry the visual side (a lit rail or edge, a permanent
 * pulse); this module carries the parts that have to come from a component:
 * the colour, and the chevron badge that sits at the end of the row.
 *
 * A target with a meaning of its own — a verdict, a planet, a severity — passes
 * that colour through `tapVars`, so the highlight matches the content next to it
 * instead of adding a second one. Everything else inherits the theme accent.
 */

import { ChevronRight, ChevronDown, MousePointerClick } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Per-target colour for the `.tap-row` / `.tap-card` CSS. The tint, open state
 * and glow are all derived from `--tap-clr` in the stylesheet, so a caller only
 * ever sets the hue.
 *
 * `base` is the target's resting surface: it has to travel as a variable rather
 * than an inline `background`, because an inline declaration outranks the
 * `:hover` rule and would kill the highlight.
 */
export const tapVars = (color?: string, base?: string): React.CSSProperties => ({
  ...(color ? { ['--tap-clr' as string]: color } : {}),
  ...(base ? { ['--tap-base' as string]: base } : {}),
});

/**
 * The chevron at the end of a tappable row. Filled rather than hairline — at
 * the far edge of a dense row an outline glyph reads as decoration.
 */
export const TapBadge: React.FC<{
  /** Open targets get a solid badge; closed ones a tinted one. */
  open?: boolean;
  /** Down-chevron for in-place disclosures, right-chevron for panes. */
  direction?: 'right' | 'down';
  /** The pulse; off for targets already open. */
  blink?: boolean;
  className?: string;
}> = ({ open = false, direction = 'right', blink = true, className = '' }) => {
  const Icon = direction === 'down' ? ChevronDown : ChevronRight;
  return (
    <motion.span
      animate={direction === 'down' ? { rotate: open ? 180 : 0 } : { x: open ? 3 : 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 32 }}
      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${blink && !open ? 'tap-badge-blink' : ''} ${className}`}
      style={{
        background: open ? 'var(--tap-clr)' : 'var(--tap-tint-strong)',
        border: '1px solid var(--tap-clr)',
      }}
    >
      <Icon className="w-4 h-4" style={{ color: open ? '#ffffff' : 'var(--tap-clr)' }} />
    </motion.span>
  );
};

/**
 * The chip that labels a section holding tappable targets, so the section says
 * outright that it is interactive before anyone has to infer it from a chevron.
 */
export const TapHint: React.FC<{ label: string; className?: string }> = ({ label, className = '' }) => (
  <span className={`tap-hint ${className}`}>
    <MousePointerClick className="w-2.5 h-2.5 shrink-0" />
    {label}
  </span>
);
