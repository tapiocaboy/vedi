/**
 * The planet-pair pane — the detail view that expands out of the house panel
 * when a house holds more than one planet.
 *
 * The house panel answers "what is this part of my life"; this pane answers the
 * question a chart owner asks next: these two are sitting on top of each other,
 * so what does that actually do to me, how much does it help, what does it cost,
 * and when does it matter. Every number on screen comes from `conjunctions.ts`
 * and every one of them can be traced back to a named factor.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Flame, Swords, Clock, Infinity as InfinityIcon,
  Sparkles, AlertTriangle, X, Link2,
} from 'lucide-react';
import { TapBadge, TapHint, tapVars } from '../shared/tapTarget';
import type { HouseOccupant, PlanetPairAnalysis } from '../../lib/core/conjunctions';
import { PLANET_SYMBOLS, planetDisplayColor } from '../../types/astrology';
import { labelDignity, labelPlanet } from '../../i18n/astroLabels';
import { useLang } from '../../i18n/LanguageContext';
import {
  ACTIVATION_COLOR, DRAG_COLOR, POWER_COLOR, panelTokens, verdictColor,
} from './panelTokens';

type TFn = ReturnType<typeof useLang>['t'];
type LangCode = ReturnType<typeof useLang>['lang'];

const spring = { type: 'spring' as const, stiffness: 320, damping: 32 };

/* ── Small building blocks ────────────────────────────────────────────────── */

const Meter: React.FC<{
  pct: number; color: string; track: string; delay?: number;
}> = ({ pct, color, track, delay = 0 }) => (
  <div className="h-2.5 rounded-full overflow-hidden" style={{ background: track }}>
    <motion.div
      className="h-full rounded-full"
      style={{ background: color }}
      initial={{ width: 0 }}
      animate={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
    />
  </div>
);

/**
 * The two planets drawn on the 0°–30° span of their sign, with the gap between
 * them highlighted. A conjunction is an angle, and this is the one thing a
 * table of numbers cannot show: how close "in the same box" really is.
 */
const AngleDial: React.FC<{
  pair: PlanetPairAnalysis; isLight: boolean; lang: LangCode; t: TFn;
}> = ({ pair, isLight, lang, t }) => {
  const cx = 130, cy = 118, r = 96;
  const toXY = (deg: number, radius = r) => {
    const theta = ((180 - (deg / 30) * 180) * Math.PI) / 180;
    return { x: cx + radius * Math.cos(theta), y: cy - radius * Math.sin(theta) };
  };
  const arc = (from: number, to: number, radius = r) => {
    const a = toXY(from, radius);
    const b = toXY(to, radius);
    return `M ${a.x.toFixed(2)} ${a.y.toFixed(2)} A ${radius} ${radius} 0 0 1 ${b.x.toFixed(2)} ${b.y.toFixed(2)}`;
  };

  const colorA = planetDisplayColor(pair.a, isLight);
  const colorB = planetDisplayColor(pair.b, isLight);
  const accent = verdictColor(pair.verdict, isLight);
  const trackClr = isLight ? '#e2e8f0' : 'rgba(255,255,255,0.10)';
  const tickClr = isLight ? '#94a3b8' : 'rgba(255,255,255,0.30)';
  const titleClr = isLight ? '#0f172a' : '#ffffff';

  const posA = toXY(pair.degrees.a);
  const posB = toXY(pair.degrees.b);
  const labelA = toXY(pair.degrees.a, r + 20);
  const labelB = toXY(pair.degrees.b, r + 20);

  return (
    <svg viewBox="0 0 260 140" className="w-full h-auto max-w-[320px] mx-auto block" role="img"
      aria-label={`${labelPlanet(pair.a, lang)} ${pair.degrees.a.toFixed(2)}°, ${labelPlanet(pair.b, lang)} ${pair.degrees.b.toFixed(2)}°`}>
      {/* 0°–30° track */}
      <path d={arc(0, 30)} fill="none" stroke={trackClr} strokeWidth="3" strokeLinecap="round" />

      {/* the gap between the two planets */}
      <motion.path
        d={arc(Math.min(pair.degrees.a, pair.degrees.b), Math.max(pair.degrees.a, pair.degrees.b))}
        fill="none" stroke={accent} strokeWidth="5" strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* sign end ticks */}
      <text x={toXY(0).x - 4} y={cy + 14} textAnchor="middle" fontSize="8" fontFamily="monospace" fill={tickClr}>0°</text>
      <text x={toXY(30).x + 4} y={cy + 14} textAnchor="middle" fontSize="8" fontFamily="monospace" fill={tickClr}>30°</text>

      {[posA, posB].map((p, i) => (
        <motion.circle
          key={i} cx={p.x} cy={p.y} r="5"
          fill={i === 0 ? colorA : colorB}
          stroke={isLight ? '#ffffff' : '#08080f'} strokeWidth="1.5"
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ ...spring, delay: 0.3 + i * 0.08 }}
          style={{ transformOrigin: `${p.x}px ${p.y}px` }}
        />
      ))}

      {[{ p: labelA, c: colorA, s: PLANET_SYMBOLS[pair.a] }, { p: labelB, c: colorB, s: PLANET_SYMBOLS[pair.b] }].map((m, i) => (
        <motion.text
          key={i} x={m.p.x} y={m.p.y + 4} textAnchor="middle"
          fontSize="15" fontWeight="700" fill={m.c}
          initial={{ opacity: 0, y: m.p.y - 2 }} animate={{ opacity: 1, y: m.p.y + 4 }}
          transition={{ delay: 0.36 + i * 0.08 }}
        >
          {m.s}
        </motion.text>
      ))}

      {/* the number */}
      <motion.g initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
        <text x={cx} y={cy - 26} textAnchor="middle" fontSize="26" fontWeight="800"
          fontFamily="monospace" fill={titleClr}>
          {pair.separation.toFixed(2)}°
        </text>
        <text x={cx} y={cy - 10} textAnchor="middle" fontSize="9"
          fontFamily="monospace" fill={tickClr} className="uppercase">
          {t('pair.separation')}
        </text>
      </motion.g>
    </svg>
  );
};

/**
 * The whole house drawn as one 0°–30° strip: every planet at its true degree,
 * with the angle between each neighbouring pair bracketed underneath.
 *
 * This is the view that answers "how far apart are they" at a glance, without
 * opening anything — the per-pair dial in the detail pane is the close-up.
 */
const AngleStrip: React.FC<{
  occupants: HouseOccupant[];
  gaps: Array<{ from: string; to: string; degrees: number }>;
  isLight: boolean;
}> = ({ occupants, gaps, isLight }) => {
  const { lang } = useLang();
  const tk = panelTokens(isLight);

  const W = 300, L = 20, R = 280;
  const AXIS_Y = 58;
  const H = 92;
  const toX = (deg: number) => L + (Math.max(0, Math.min(30, deg)) / 30) * (R - L);

  const axisClr = isLight ? '#cbd5e1' : 'rgba(255,255,255,0.16)';
  const tickClr = isLight ? '#94a3b8' : 'rgba(255,255,255,0.32)';
  const gapClr = 'var(--c-accent)';

  // A planet label needs this much room; anything closer has to move up a tier.
  const LABEL_W = 30;
  const TIER_Y = [36, 22, 8];

  // Greedy tier assignment: take the lowest row that still has clearance. A
  // fixed two-row alternation breaks down in a stellium, where three or four
  // planets can sit inside a couple of degrees.
  const lastX: number[] = [];
  const tiers = occupants.map(o => {
    const x = toX(o.degreeInSign);
    for (let t = 0; t < TIER_Y.length; t++) {
      if (lastX[t] === undefined || x - lastX[t] >= LABEL_W) { lastX[t] = x; return t; }
    }
    lastX[TIER_Y.length - 1] = x;
    return TIER_Y.length - 1;
  });

  // Gap labels alternate between two rows for the same reason.
  const gapRow = gaps.map((_, i) => i % 2);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img"
      aria-label={occupants.map(o => `${labelPlanet(o.planet, lang)} ${o.degreeInSign.toFixed(1)}°`).join(', ')}>
      {/* the sign, 0° to 30° */}
      <motion.line
        x1={L} y1={AXIS_Y} x2={R} y2={AXIS_Y}
        stroke={axisClr} strokeWidth="1.5" strokeLinecap="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      />
      {[0, 10, 20, 30].map(d => (
        <g key={d}>
          <line x1={toX(d)} y1={AXIS_Y - 3} x2={toX(d)} y2={AXIS_Y + 3} stroke={axisClr} strokeWidth="1" />
          <text x={toX(d)} y={AXIS_Y + 13} textAnchor="middle" fontSize="7"
            fontFamily="monospace" fill={tickClr}>{d}°</text>
        </g>
      ))}

      {/* the angle between each neighbouring pair */}
      {gaps.map((g, i) => {
        const x1 = toX(occupants[i].degreeInSign);
        const x2 = toX(occupants[i + 1].degreeInSign);
        const mid = (x1 + x2) / 2;
        const y = gapRow[i] === 0 ? 70 : 83;
        // Park the number beside a bracket too narrow to hold it.
        const label = x2 - x1 >= 26 ? mid : x2 + 16;
        return (
          <motion.g key={`${g.from}-${g.to}`}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.35 + i * 0.07 }}
          >
            <line x1={x1} y1={AXIS_Y + 4} x2={x1} y2={y} stroke={gapClr} strokeWidth="0.75" opacity="0.5" />
            <line x1={x2} y1={AXIS_Y + 4} x2={x2} y2={y} stroke={gapClr} strokeWidth="0.75" opacity="0.5" />
            <line x1={x1} y1={y} x2={x2} y2={y} stroke={gapClr} strokeWidth="1" />
            {x2 - x1 >= 26 && (
              <rect x={mid - 13} y={y - 5} width="26" height="10" rx="3"
                fill={isLight ? '#ffffff' : '#0a0a12'} />
            )}
            <text x={label} y={y + 2.5} textAnchor="middle" fontSize="7.5" fontWeight="700"
              fontFamily="monospace" fill={gapClr}>{g.degrees.toFixed(1)}°</text>
          </motion.g>
        );
      })}

      {/* each planet at its true degree */}
      {occupants.map((o, i) => {
        const x = toX(o.degreeInSign);
        const color = planetDisplayColor(o.planet, isLight);
        const glyphY = TIER_Y[tiers[i]];
        return (
          <motion.g key={o.planet}
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 + i * 0.08, type: 'spring', stiffness: 340, damping: 24 }}
          >
            <line x1={x} y1={glyphY + 5} x2={x} y2={AXIS_Y} stroke={color} strokeWidth="1" opacity="0.45" />
            <circle cx={x} cy={AXIS_Y} r="3" fill={color} stroke={isLight ? '#fff' : '#0a0a12'} strokeWidth="1.2" />
            <text x={x} y={glyphY} textAnchor="middle" fontSize="12" fontWeight="700" fill={color}>
              {PLANET_SYMBOLS[o.planet]}
            </text>
            <text x={x} y={glyphY + 8} textAnchor="middle" fontSize="6.5"
              fontFamily="monospace" fill={tk.mutedClr}>
              {o.degreeInSign.toFixed(1)}°{o.isRetrograde ? '℞' : ''}
            </text>
          </motion.g>
        );
      })}
    </svg>
  );
};

/* ── The list that lives inside the house panel ──────────────────────────── */

export const PairListCard: React.FC<{
  pairs: PlanetPairAnalysis[];
  occupants: HouseOccupant[];
  gaps: Array<{ from: string; to: string; degrees: number }>;
  groupHeadline: string | null;
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  isLight: boolean;
}> = ({ pairs, occupants, gaps, groupHeadline, selectedIndex, onSelect, isLight }) => {
  const { lang, t } = useLang();
  const tk = panelTokens(isLight);
  if (pairs.length === 0) return null;

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${tk.secBdr}` }}>
      <div className="px-4 py-3" style={{ background: tk.secBg }}>
        <div className="flex items-center gap-2">
          <Link2 className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--c-accent)' }} />
          <span className="text-xs font-mono uppercase" style={{ color: tk.mutedClr }}>
            {t('house.combinationsTitle')}
          </span>
          <TapHint label={t('common.tapToOpen')} className="ml-auto shrink-0" />
        </div>
        <p className="text-[11px] mt-1.5 leading-relaxed" style={{ color: tk.mutedClr }}>
          {t('house.combinationsHint')}
        </p>
      </div>

      {/* Where they actually sit in the sign, and how far apart */}
      <div className="px-4 pt-3.5 pb-1" style={{ background: tk.panelBg, borderTop: `1px solid ${tk.divClr}` }}>
        <AngleStrip occupants={occupants} gaps={gaps} isLight={isLight} />
      </div>

      {groupHeadline && (
        <div className="px-4 pb-3 text-xs leading-relaxed"
          style={{ background: tk.panelBg, color: tk.bodyClr }}>
          {groupHeadline}
        </div>
      )}

      <div style={{ borderTop: `1px solid ${tk.divClr}` }}>
        {pairs.map((pair, i) => {
          const selected = selectedIndex === i;
          const accent = verdictColor(pair.verdict, isLight);
          return (
            <motion.button
              key={`${pair.a}-${pair.b}`}
              onClick={() => onSelect(i)}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 + i * 0.06 }}
              whileTap={{ scale: 0.985 }}
              aria-expanded={selected}
              aria-label={`${labelPlanet(pair.a, lang)} + ${labelPlanet(pair.b, lang)} — ${t('house.pairOpen')}`}
              data-open={selected}
              className="tap-row tap-blink w-full text-left pl-5 pr-3 py-3 flex items-center gap-3 transition-colors"
              style={{ borderBottom: `1px solid ${tk.divClr}`, ...tapVars(accent) }}
            >
              <div className="flex items-center shrink-0" style={{ width: 46 }}>
                <span className="text-xl font-bold" style={{ color: planetDisplayColor(pair.a, isLight) }}>
                  {PLANET_SYMBOLS[pair.a]}
                </span>
                <span className="text-xl font-bold -ml-0.5" style={{ color: planetDisplayColor(pair.b, isLight) }}>
                  {PLANET_SYMBOLS[pair.b]}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold truncate" style={{ color: tk.titleClr }}>
                    {labelPlanet(pair.a, lang)} + {labelPlanet(pair.b, lang)}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md tabular-nums"
                    style={{ background: `${accent}1f`, color: accent }}>
                    {t('house.pairApart', { deg: pair.separation.toFixed(1) })}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: tk.secBg }}>
                    <motion.div className="h-full rounded-full" style={{ background: POWER_COLOR }}
                      initial={{ width: 0 }} animate={{ width: `${pair.power}%` }}
                      transition={{ duration: 0.7, delay: 0.15 + i * 0.06 }} />
                  </div>
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: tk.secBg }}>
                    <motion.div className="h-full rounded-full" style={{ background: DRAG_COLOR }}
                      initial={{ width: 0 }} animate={{ width: `${pair.drag}%` }}
                      transition={{ duration: 0.7, delay: 0.2 + i * 0.06 }} />
                  </div>
                  <span className="text-[10px] font-semibold shrink-0" style={{ color: accent }}>
                    {pair.verdictLabel}
                  </span>
                </div>
              </div>

              <TapBadge open={selected} />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

/* ── The detail pane ─────────────────────────────────────────────────────── */

const Section: React.FC<{
  title: string; hint?: string; icon?: React.ElementType; delay: number;
  isLight: boolean; children: React.ReactNode; accent?: string;
}> = ({ title, hint, icon: Icon, delay, isLight, children, accent }) => {
  const tk = panelTokens(isLight);
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-xl overflow-hidden"
      style={{ border: `1px solid ${tk.secBdr}` }}
    >
      <div className="px-4 py-3" style={{ background: tk.secBg }}>
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-3.5 h-3.5" style={{ color: accent ?? 'var(--c-accent)' }} />}
          <span className="text-xs font-mono uppercase" style={{ color: tk.mutedClr }}>{title}</span>
        </div>
        {hint && <p className="text-[11px] mt-1 leading-relaxed" style={{ color: tk.mutedClr }}>{hint}</p>}
      </div>
      <div className="px-4 py-3.5" style={{ background: tk.panelBg }}>{children}</div>
    </motion.section>
  );
};

const FactorChips: React.FC<{ factors: { key: string; text: string }[]; color: string; isLight: boolean }> = ({ factors, color, isLight }) => (
  <div className="flex flex-wrap gap-1.5">
    {factors.slice(0, 6).map((f, i) => (
      <motion.span
        key={f.key + i}
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.25 + i * 0.05 }}
        className="text-[10px] px-2 py-1 rounded-full font-medium"
        style={{
          background: `${color}${isLight ? '14' : '1a'}`,
          border: `1px solid ${color}40`,
          color: isLight ? color : `${color}`,
        }}
      >
        {f.text}
      </motion.span>
    ))}
  </div>
);

export const PairDetail: React.FC<{
  pair: PlanetPairAnalysis;
  onBack: () => void;
  onClose: () => void;
  /** Wide screens show a Close button; the phone overlay shows Back. */
  variant: 'pane' | 'overlay';
  isLight: boolean;
}> = ({ pair, onBack, onClose, variant, isLight }) => {
  const { lang, t } = useLang();
  const tk = panelTokens(isLight);
  const [showTech, setShowTech] = useState(false);

  const accent = verdictColor(pair.verdict, isLight);
  const activationClr = ACTIVATION_COLOR[pair.now.level];
  const colorA = planetDisplayColor(pair.a, isLight);
  const colorB = planetDisplayColor(pair.b, isLight);

  const windows = [
    ...pair.lifetime.windows.filter(w => w.state === 'current'),
    ...pair.lifetime.windows.filter(w => w.state === 'future'),
    ...pair.lifetime.windows.filter(w => w.state === 'past').slice(-2),
  ].slice(0, 6);

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString(lang === 'si' ? 'si-LK' : undefined, { year: 'numeric', month: 'short' });

  const stateLabel: Record<string, string> = {
    past: t('pair.past'), current: t('pair.current'), future: t('pair.future'),
  };
  const stateColor: Record<string, string> = {
    past: tk.mutedClr, current: accent, future: isLight ? '#2563eb' : '#60a5fa',
  };

  return (
    <div className="h-full flex flex-col" style={{ background: tk.panelBg }}>
      {/* Header */}
      <div className="sticky top-0 z-10 px-5 py-4 flex items-start gap-3"
        style={{ background: tk.headerBg, borderBottom: `1px solid ${tk.headerBdr}`, backdropFilter: 'blur(12px)' }}>
        {variant === 'overlay' && (
          <button onClick={onBack} aria-label={t('pair.back')}
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
            style={{ color: tk.subClr, background: tk.secBg }}>
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-1">
            <span className="text-2xl font-bold leading-none" style={{ color: colorA }}>{PLANET_SYMBOLS[pair.a]}</span>
            <span className="text-2xl font-bold leading-none" style={{ color: colorB }}>{PLANET_SYMBOLS[pair.b]}</span>
            <span className="text-sm font-bold ml-1.5 truncate" style={{ color: tk.titleClr }}>
              {labelPlanet(pair.a, lang)} + {labelPlanet(pair.b, lang)}
            </span>
          </div>
          <p className="text-xs leading-snug" style={{ color: accent }}>{pair.name}</p>
        </div>

        <button onClick={onClose} aria-label={t('pair.close')}
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ color: tk.subClr }}>
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 pb-12">
        {/* Angle */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-xl px-4 pt-4 pb-3"
          style={{ background: tk.cardBg, border: `1px solid ${tk.cardBdr}` }}
        >
          <AngleDial pair={pair} isLight={isLight} lang={lang} t={t} />
          <div className="flex items-center justify-between gap-2 mt-1">
            <span className="text-[11px] font-semibold px-2 py-1 rounded-md"
              style={{ background: `${accent}1f`, color: accent }}>
              {pair.orbLabel}
            </span>
            <span className="text-[11px]" style={{ color: tk.mutedClr }}>
              {t('pair.blend')} {pair.intensity}%
            </span>
          </div>
          <p className="text-xs leading-relaxed mt-2.5" style={{ color: tk.bodyClr }}>{pair.orbText}</p>
        </motion.div>

        {/* Meaning */}
        <Section title={t('pair.whatItMeans')} icon={Sparkles} delay={0.06} isLight={isLight}>
          <p className="text-sm leading-relaxed" style={{ color: tk.bodyClr }}>{pair.plain}</p>
          <p className="text-xs leading-relaxed mt-3 pt-3" style={{ color: tk.mutedClr, borderTop: `1px solid ${tk.divClr}` }}>
            {pair.headline}
          </p>
        </Section>

        {/* Power & friction */}
        <Section title={t('pair.balance')} icon={Link2} delay={0.1} isLight={isLight} accent={accent}>
          <div className="space-y-4">
            <div>
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-xs font-semibold" style={{ color: tk.titleClr }}>{t('pair.power')}</span>
                <span className="text-sm font-bold font-mono tabular-nums" style={{ color: POWER_COLOR }}>{pair.power}</span>
              </div>
              <Meter pct={pair.power} color={POWER_COLOR} track={tk.secBg} delay={0.15} />
              <p className="text-[11px] mt-1.5" style={{ color: tk.mutedClr }}>{t('pair.powerHint')}</p>
              {pair.powerFactors.length > 0 && (
                <div className="mt-2.5">
                  <p className="text-[10px] font-mono uppercase mb-1.5" style={{ color: tk.mutedClr }}>{t('pair.whyPower')}</p>
                  <FactorChips factors={pair.powerFactors} color={POWER_COLOR} isLight={isLight} />
                </div>
              )}
            </div>

            <div className="pt-3" style={{ borderTop: `1px solid ${tk.divClr}` }}>
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-xs font-semibold" style={{ color: tk.titleClr }}>{t('pair.drag')}</span>
                <span className="text-sm font-bold font-mono tabular-nums" style={{ color: DRAG_COLOR }}>{pair.drag}</span>
              </div>
              <Meter pct={pair.drag} color={DRAG_COLOR} track={tk.secBg} delay={0.22} />
              <p className="text-[11px] mt-1.5" style={{ color: tk.mutedClr }}>{t('pair.dragHint')}</p>
              {pair.dragFactors.length > 0 && (
                <div className="mt-2.5">
                  <p className="text-[10px] font-mono uppercase mb-1.5" style={{ color: tk.mutedClr }}>{t('pair.whyDrag')}</p>
                  <FactorChips factors={pair.dragFactors} color={DRAG_COLOR} isLight={isLight} />
                </div>
              )}
            </div>
          </div>
        </Section>

        {/* Gift / cost */}
        {(pair.gift || pair.cost) && (
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14, duration: 0.35 }}
            className="grid gap-3"
          >
            {pair.gift && (
              <div className="rounded-xl px-4 py-3.5 flex items-start gap-3"
                style={{ background: `${POWER_COLOR}${isLight ? '0f' : '14'}`, border: `1px solid ${POWER_COLOR}33` }}>
                <Sparkles className="w-4 h-4 mt-0.5 shrink-0" style={{ color: POWER_COLOR }} />
                <div>
                  <p className="text-[10px] font-mono uppercase mb-1" style={{ color: POWER_COLOR }}>{t('pair.gift')}</p>
                  <p className="text-sm leading-relaxed" style={{ color: tk.bodyClr }}>{pair.gift}</p>
                </div>
              </div>
            )}
            {pair.cost && (
              <div className="rounded-xl px-4 py-3.5 flex items-start gap-3"
                style={{ background: `${DRAG_COLOR}${isLight ? '0f' : '14'}`, border: `1px solid ${DRAG_COLOR}33` }}>
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: DRAG_COLOR }} />
                <div>
                  <p className="text-[10px] font-mono uppercase mb-1" style={{ color: DRAG_COLOR }}>{t('pair.cost')}</p>
                  <p className="text-sm leading-relaxed" style={{ color: tk.bodyClr }}>{pair.cost}</p>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Special conditions */}
        {(pair.combustion || pair.grahaYuddha) && (
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.35 }}
            className="space-y-3"
          >
            {pair.combustion && (
              <div className="rounded-xl px-4 py-3.5 flex items-start gap-3"
                style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.28)' }}>
                <Flame className="w-4 h-4 mt-0.5 shrink-0 text-yellow-500" />
                <div>
                  <p className="text-[10px] font-mono uppercase mb-1 text-yellow-600">{t('pair.combust')}</p>
                  <p className="text-sm leading-relaxed" style={{ color: tk.bodyClr }}>{pair.combustion.text}</p>
                </div>
              </div>
            )}
            {pair.grahaYuddha && (
              <div className="rounded-xl px-4 py-3.5 flex items-start gap-3"
                style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.28)' }}>
                <Swords className="w-4 h-4 mt-0.5 shrink-0" style={{ color: DRAG_COLOR }} />
                <div>
                  <p className="text-[10px] font-mono uppercase mb-1" style={{ color: DRAG_COLOR }}>{t('pair.war')}</p>
                  <p className="text-sm leading-relaxed" style={{ color: tk.bodyClr }}>{pair.grahaYuddha.text}</p>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Right now */}
        <Section title={t('pair.rightNow')} icon={Clock} delay={0.22} isLight={isLight} accent={activationClr}>
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-xs font-semibold" style={{ color: activationClr }}>{pair.now.label}</span>
            <span className="text-sm font-bold font-mono tabular-nums" style={{ color: activationClr }}>
              {pair.now.score}%
            </span>
          </div>
          <Meter pct={pair.now.score} color={activationClr} track={tk.secBg} delay={0.3} />
          <p className="text-sm leading-relaxed mt-3" style={{ color: tk.bodyClr }}>{pair.now.text}</p>
          {pair.now.nextText && (
            <p className="text-xs leading-relaxed mt-2.5 pt-2.5" style={{ color: tk.mutedClr, borderTop: `1px solid ${tk.divClr}` }}>
              {pair.now.nextText}
            </p>
          )}
        </Section>

        {/* Whole life */}
        <Section title={t('pair.acrossLife')} icon={InfinityIcon} delay={0.26} isLight={isLight}>
          <p className="text-sm leading-relaxed" style={{ color: tk.bodyClr }}>{pair.lifetime.summary}</p>

          <div className="mt-3.5 pt-3.5" style={{ borderTop: `1px solid ${tk.divClr}` }}>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-mono uppercase" style={{ color: tk.mutedClr }}>{t('pair.maturity')}</span>
              {pair.lifetime.currentAge !== null && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-md font-mono"
                  style={{ background: tk.secBg, color: tk.subClr }}>
                  {t('pair.yourAge', { n: pair.lifetime.currentAge })}
                </span>
              )}
            </div>
            <p className="text-xs leading-relaxed" style={{ color: tk.bodyClr }}>{pair.lifetime.maturityText}</p>
          </div>

          <div className="mt-3.5 pt-3.5" style={{ borderTop: `1px solid ${tk.divClr}` }}>
            <p className="text-xs leading-relaxed" style={{ color: tk.bodyClr }}>{pair.fusionText}</p>
          </div>
        </Section>

        {/* Windows */}
        {windows.length > 0 && (
          <Section title={t('pair.windows')} hint={t('pair.windowsHint')} icon={Clock} delay={0.3} isLight={isLight}>
            <div className="space-y-2">
              {windows.map((w, i) => (
                <motion.div
                  key={`${w.label}-${w.start}`}
                  initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.34 + i * 0.05 }}
                  className="rounded-lg px-3 py-2.5 flex items-center gap-3"
                  style={{
                    background: w.state === 'current' ? `${accent}12` : tk.cardBg,
                    border: `1px solid ${w.state === 'current' ? `${accent}44` : tk.cardBdr}`,
                  }}
                >
                  <span className="w-1.5 h-8 rounded-full shrink-0"
                    style={{ background: w.kind === 'peak' ? accent : tk.mutedClr, opacity: w.state === 'past' ? 0.4 : 1 }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold leading-snug" style={{ color: tk.titleClr }}>{w.label}</p>
                    <p className="text-[10px] font-mono mt-0.5" style={{ color: tk.mutedClr }}>
                      {fmt(w.start)} → {fmt(w.end)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-[9px] font-bold uppercase tracking-wide" style={{ color: stateColor[w.state] }}>
                      {stateLabel[w.state]}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded"
                      style={{ background: tk.secBg, color: tk.mutedClr }}>
                      {w.kind === 'peak' ? t('pair.peak') : t('pair.chapter')}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </Section>
        )}

        {/* Technical detail — folded away so the plain reading stays clean */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.34 }}
          className="rounded-xl overflow-hidden" style={{ border: `1px solid ${tk.secBdr}` }}
        >
          <button
            onClick={() => setShowTech(v => !v)}
            aria-expanded={showTech}
            data-open={showTech}
            className="tap-row tap-blink w-full pl-5 pr-3 py-3 flex items-center justify-between gap-2"
            style={tapVars(accent, tk.secBg)}
          >
            <span className="text-xs font-mono uppercase" style={{ color: tk.mutedClr }}>{t('pair.technical')}</span>
            <span className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: accent }}>
                {showTech ? t('common.hide') : t('common.show')}
              </span>
              <TapBadge open={showTech} direction="down" />
            </span>
          </button>
          <AnimatePresence initial={false}>
            {showTech && (
              <motion.div
                key="tech"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                style={{ overflow: 'hidden', background: tk.panelBg }}
              >
                <div className="px-4 py-3 space-y-2">
                  {[
                    [t('pair.separation'), `${pair.separation.toFixed(4)}°`],
                    [t('pair.blend'), `${pair.intensity}%`],
                    [t('pair.relationship'), pair.relationLabel],
                    [t('pair.motionAtBirth'), pair.applying ? t('pair.applying') : t('pair.separating')],
                    [t('pair.degreeInSign'), `${labelPlanet(pair.a, lang)} ${pair.degrees.a.toFixed(2)}° · ${labelPlanet(pair.b, lang)} ${pair.degrees.b.toFixed(2)}°`],
                    [t('pair.condition'), `${labelPlanet(pair.a, lang)} ${labelDignity(pair.dignity.a, lang)} · ${labelPlanet(pair.b, lang)} ${labelDignity(pair.dignity.b, lang)}`],
                    [t('pair.strength'), `${labelPlanet(pair.a, lang)} ${pair.strength.a} · ${labelPlanet(pair.b, lang)} ${pair.strength.b}`],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-start justify-between gap-3">
                      <span className="text-[11px] shrink-0" style={{ color: tk.mutedClr }}>{label}</span>
                      <span className="text-[11px] font-mono text-right" style={{ color: tk.bodyClr }}>{value}</span>
                    </div>
                  ))}
                  <p className="text-[11px] leading-relaxed pt-2" style={{ color: tk.mutedClr, borderTop: `1px solid ${tk.divClr}` }}>
                    {pair.orderText} {pair.motionText}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};
