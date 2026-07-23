/**
 * Lagna reveal — the cinematic beat between "I understand — continue" and the
 * chart itself.
 *
 * A cloud of particles swirls in and assembles the figure of the ascendant sign
 * (a crab for Kataka, a lion for Simha, …), holds for a couple of seconds, then
 * comes apart — drifting outward and lifting away, particle by particle — as
 * the overlay fades off to reveal the chart underneath.
 *
 * Motion is a spring-damper plus a decaying vortex term rather than a straight
 * tween, and each particle is stroked from its previous position to its current
 * one. That is what produces the look: a still particle is a gold speck, a fast
 * one is a long curved dash, and the whole cloud reads as flowing rather than
 * sliding. Everything is gold on black.
 *
 * The figures are sampled, not drawn: the emoji is rendered once to an
 * offscreen canvas and every opaque pixel becomes a particle target, which is
 * why the silhouettes are real animals rather than the ♋-style glyphs. If a
 * platform has no colour emoji for a sign we fall back to its monochrome
 * zodiac glyph (U+FE0E), which every system ships.
 */

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLang } from '../i18n/LanguageContext';
import { labelRashi, labelRashiWestern } from '../i18n/astroLabels';
import { RASHIS, RASHI_ENGLISH } from '../lib/core/rashi';

/** The actual creature/figure behind each sign, index-aligned with RASHIS. */
const FIGURE_EMOJI = [
  '🐏', // Mesha      — ram
  '🐂', // Vrishabha  — bull
  '👬', // Mithuna    — twins
  '🦀', // Kataka     — crab
  '🦁', // Simha      — lion
  '👸', // Kanya      — maiden
  '⚖️', // Tula       — scales
  '🦂', // Vrischika  — scorpion
  '🏹', // Dhanu      — archer
  '🐐', // Makara     — sea-goat
  '🏺', // Kumbha     — water bearer
  '🐟🐟', // Meena    — the two fishes
] as const;

/** Monochrome zodiac glyphs — the fallback when a figure emoji renders blank. */
const SIGN_GLYPH = [
  '♈︎', '♉︎', '♊︎', '♋︎', '♌︎', '♍︎',
  '♎︎', '♏︎', '♐︎', '♑︎', '♒︎', '♓︎',
] as const;

// Phase durations (ms). The figure is legible for ASSEMBLE→+HOLD ≈ 3.0s,
// then disperses.
const ASSEMBLE = 1200;
const HOLD     = 1800;
const DISSOLVE = 1000;
const TOTAL    = ASSEMBLE + HOLD + DISSOLVE;

/**
 * Particle budget. At 1250 the silhouette sat ~8px between particles, which
 * reads as a scatter of dots rather than a figure; 2400 closes that to ~6px
 * and still strokes comfortably inside a frame.
 */
const MAX_PARTICLES = 2400;
/** Offscreen sampling resolution — larger = finer silhouette, slower sample. */
const SAMPLE_SIZE = 260;

/** Gold, three tiers: core, deep amber, pale highlight. */
const GOLD: [number, number, number][] = [
  [255, 203, 58],
  [246, 166, 35],
  [255, 236, 178],
];

interface Particle {
  /** Figure target, in canvas px. */
  fx: number; fy: number;
  /** Current position and the previous frame's, which the streak is drawn between. */
  x: number; y: number; px: number; py: number;
  /** Velocity, in px/frame at 60fps. */
  vx: number; vy: number;
  /** Fraction of ASSEMBLE to wait before the spring switches on. */
  delay: number;
  /** Fraction of DISSOLVE to wait before letting go. */
  release: number;
  /** How hard this particle is pushed outward as it disperses. */
  drift: number;
  flowPhase: number;
  size: number;
  tint: number;
  /** A tenth of the cloud runs brighter and longer — the "lead" dashes. */
  lead: boolean;
}

type Pt = { x: number; y: number };

const easeOutCubic  = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);

/**
 * Render `text` to an offscreen canvas and return one point per opaque pixel
 * on a `stride` grid, in a normalised -0.5…0.5 box.
 */
function samplePoints(text: string, font: string, stride: number): Pt[] {
  const S = SAMPLE_SIZE;
  const c = document.createElement('canvas');
  c.width = S;
  c.height = S;
  const g = c.getContext('2d', { willReadFrequently: true });
  if (!g) return [];

  g.clearRect(0, 0, S, S);
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillStyle = '#ffffff';
  g.font = font;
  // maxWidth keeps two-glyph figures (the fishes, the twins) inside the box.
  g.fillText(text, S / 2, S / 2, S * 0.94);

  const data = g.getImageData(0, 0, S, S).data;
  const pts: Pt[] = [];
  for (let y = 0; y < S; y += stride) {
    for (let x = 0; x < S; x += stride) {
      if (data[(y * S + x) * 4 + 3] > 110) {
        pts.push({ x: x / S - 0.5, y: y / S - 0.5 });
      }
    }
  }
  return pts;
}

/**
 * Figure targets for a sign, with a monochrome-glyph fallback.
 *
 * The sample is thinned by taking every k-th point rather than the first N —
 * the raw points arrive in scan order, so slicing would light up the animal's
 * head and leave its legs dark.
 */
function figurePoints(rashiIndex: number): Pt[] {
  const emoji = FIGURE_EMOJI[rashiIndex] ?? FIGURE_EMOJI[0];
  const emojiFont = `${Math.round(SAMPLE_SIZE * 0.74)}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji","EmojiOne Color",sans-serif`;
  let pts = samplePoints(emoji, emojiFont, 2);
  if (pts.length < 260) {
    const glyph = SIGN_GLYPH[rashiIndex] ?? SIGN_GLYPH[0];
    pts = samplePoints(glyph, `${Math.round(SAMPLE_SIZE * 0.82)}px serif`, 2);
  }
  if (pts.length <= MAX_PARTICLES) return pts;

  const step = pts.length / MAX_PARTICLES;
  const thinned: Pt[] = [];
  for (let i = 0; i < MAX_PARTICLES; i++) thinned.push(pts[Math.floor(i * step)]);
  return thinned;
}

interface Props {
  /** Ascendant sign to reveal, or null when idle. */
  rashiIndex: number | null;
  onDone: () => void;
}

export const LagnaIntro: React.FC<Props> = ({ rashiIndex, onDone }) => {
  const { lang, t } = useLang();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Kept in a ref so the animation loop never restarts when the parent re-renders.
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  const active = rashiIndex !== null;

  useEffect(() => {
    if (rashiIndex === null) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0, h = 0, scale = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const figure = figurePoints(rashiIndex);
    const count = Math.min(MAX_PARTICLES, figure.length);

    const particles: Particle[] = [];

    const layout = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // The figure occupies ~62% of the smaller viewport axis, capped so it
      // never becomes a wall of particles on a desktop monitor.
      scale = Math.min(Math.min(w, h) * 0.62, 460);
    };

    const seed = () => {
      particles.length = 0;
      const cxp = w / 2, cyp = h / 2;
      const ring = Math.hypot(w, h) * 0.55;
      for (let i = 0; i < count; i++) {
        const f = figure[i];
        const a = (i / count) * Math.PI * 2 + Math.random() * 0.8;
        const r = ring * (0.75 + Math.random() * 0.6);
        const sx = cxp + Math.cos(a) * r;
        const sy = cyp + Math.sin(a) * r;
        // Launch tangentially, so the cloud spirals in instead of falling in
        // radially — that swirl is what draws the long curved dashes.
        const spin = 1.6 + Math.random() * 1.4;
        particles.push({
          fx: cxp + f.x * scale,
          fy: cyp + f.y * scale,
          x: sx, y: sy, px: sx, py: sy,
          vx: -Math.sin(a) * spin,
          vy:  Math.cos(a) * spin,
          // Stagger the arrival top-to-bottom so the figure "prints" downward.
          delay: (f.y + 0.5) * 0.3 + Math.random() * 0.12,
          // …and stagger the release bottom-up, so it comes apart the other way.
          release: (0.5 - f.y) * 0.34 + Math.random() * 0.14,
          drift: 0.6 + Math.random() * 1.1,
          flowPhase: Math.random() * Math.PI * 2,
          size: 1.0 + Math.random() * 1.0,
          tint: i % 5 === 0 ? 2 : i % 3 === 0 ? 1 : 0,
          lead: i % 10 === 0,
        });
      }
    };

    layout();
    seed();

    const onResize = () => { layout(); seed(); };
    window.addEventListener('resize', onResize);

    let raf = 0;
    let finished = false;
    const t0 = performance.now();
    let last = t0;

    const frame = (now: number) => {
      const elapsed = now - t0;
      // Physics runs in 60fps-equivalent steps so the motion looks identical on
      // a 120Hz display; the phase clock stays on wall time either way.
      const dt = Math.min(2.5, Math.max(0.4, (now - last) / 16.667));
      last = now;

      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';

      const pAssemble = clamp01(elapsed / ASSEMBLE);
      const pDissolve = clamp01((elapsed - ASSEMBLE - HOLD) / DISSOLVE);
      const inHold    = elapsed > ASSEMBLE && elapsed < ASSEMBLE + HOLD;
      const cxp = w / 2, cyp = h / 2;

      // Vortex strength: strong while the cloud spirals in, gone once it has
      // settled, then back a little to curl the dispersal.
      const curl = pDissolve > 0 ? 0.014 * pDissolve
        : 0.042 * (1 - easeOutCubic(pAssemble));
      const flowT = elapsed * 0.0009;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.px = p.x;
        p.py = p.y;

        let stiff: number, damp: number;
        let tx: number, ty: number;
        // Per-particle fade during the dispersal, so the figure crumbles into
        // sparks instead of the whole cloud dimming in lockstep.
        let selfAlpha = 1;

        if (pDissolve > 0) {
          // Let go: the figure breaks up, drifts outward and lifts away.
          stiff = 0;
          damp = 0.99;
          tx = p.fx; ty = p.fy;
          const live = clamp01((pDissolve - p.release) / (1 - p.release));
          const dx = p.x - cxp, dy = p.y - cyp;
          const d = Math.hypot(dx, dy) || 1;
          p.vx += (dx / d) * 0.42 * live * p.drift * dt;
          p.vy += ((dy / d) * 0.42 * live * p.drift - 0.10 * live) * dt;
          selfAlpha = 1 - easeInOutCubic(live);
        } else if (inHold) {
          stiff = 0.045; damp = 0.80;
          tx = p.fx; ty = p.fy;
          // Ambient flow so the settled figure keeps shimmering rather than
          // freezing — a cheap curl field, not true noise.
          const n = Math.sin(p.x * 0.011 + flowT + p.flowPhase)
                  + Math.cos(p.y * 0.013 - flowT * 1.3);
          p.vx += Math.cos(n * Math.PI) * 0.16 * dt;
          p.vy += Math.sin(n * Math.PI) * 0.16 * dt;
        } else {
          // Assembling: the spring switches on per-particle, staggered.
          const live = clamp01((pAssemble - p.delay) / (1 - p.delay));
          stiff = 0.022 * live; damp = 0.94;
          tx = p.fx; ty = p.fy;
        }

        if (stiff > 0) {
          p.vx += (tx - p.x) * stiff * dt;
          p.vy += (ty - p.y) * stiff * dt;
        }
        if (curl > 0) {
          // Perpendicular pull about the centre — the swirl.
          p.vx += -(p.y - cyp) * curl * dt * 0.06;
          p.vy +=  (p.x - cxp) * curl * dt * 0.06;
        }

        const d = Math.pow(damp, dt);
        p.vx *= d;
        p.vy *= d;
        p.x += p.vx * dt;
        p.y += p.vy * dt;

        // Draw. Speed sets the streak length, but NOT the base brightness —
        // tying the two together dimmed the figure precisely when it settled
        // into shape, which is the one moment it has to read clearly.
        const speed = Math.hypot(p.x - p.px, p.y - p.py);
        const [r, g, b] = GOLD[p.tint];
        const base = p.lead ? 0.95 : 0.74;
        const a = Math.min(1, base + speed * 0.05) * selfAlpha;
        if (a <= 0.01) continue;

        if (speed > 0.6) {
          // Stretch the streak back along the travel direction; lead particles
          // pull longer tails. Capped, or the fastest particles mid-flight
          // stop reading as dashes and turn into beams across the screen.
          const maxLen = p.lead ? 34 : 22;
          const tail = Math.min(p.lead ? 2.2 : 1.4, maxLen / speed);
          ctx.strokeStyle = `rgba(${r},${g},${b},${a})`;
          ctx.lineWidth = p.size * (p.lead ? 1.5 : 1.1);
          ctx.beginPath();
          ctx.moveTo(p.x - (p.x - p.px) * tail, p.y - (p.y - p.py) * tail);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        } else {
          ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 1.15, 0, Math.PI * 2);
          ctx.fill();
        }
        // Soft halo under every particle. On 'lighter' compositing the overlaps
        // are what give the settled figure its glow rather than a dot screen.
        ctx.fillStyle = `rgba(${r},${g},${b},${a * (p.lead ? 0.16 : 0.10)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (p.lead ? 3.4 : 2.6), 0, Math.PI * 2);
        ctx.fill();
      }

      if (elapsed >= TOTAL) {
        if (!finished) {
          finished = true;
          doneRef.current();
        }
        return;
      }
      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, [rashiIndex]);

  const sanskrit = rashiIndex !== null ? labelRashi(rashiIndex, lang, RASHIS[rashiIndex]) : '';
  const western  = rashiIndex !== null ? labelRashiWestern(rashiIndex, lang, RASHI_ENGLISH[rashiIndex]) : '';

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="lagna-intro"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          // The backdrop dissolves a touch slower than it arrived, so the chart
          // underneath is revealed rather than uncovered.
          exit={{ opacity: 0, transition: { duration: 0.65, ease: 'easeInOut' } }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[70] flex items-center justify-center overflow-hidden pointer-events-none"
        >
          {/* The backdrop starts clearing while the figure is still coming
              apart, so the chart bleeds through the last of the sparks instead
              of waiting behind a black screen. */}
          <motion.div
            className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse at center, #0a0803 0%, #000000 68%)' }}
            initial={{ opacity: 1 }}
            animate={{ opacity: [1, 1, 0] }}
            transition={{
              duration: TOTAL / 1000,
              times: [0, (ASSEMBLE + HOLD + 250) / TOTAL, 1],
              ease: 'easeInOut',
            }}
          />

          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

          <motion.div
            className="absolute left-0 right-0 z-10 text-center pointer-events-none select-none"
            style={{ bottom: '13vh' }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: [0, 1, 1, 0], y: 0 }}
            transition={{ duration: TOTAL / 1000, times: [0, 0.3, 0.72, 0.95] }}
          >
            <p className="text-[11px] font-mono uppercase tracking-[0.4em] mb-2"
              style={{ color: 'rgba(255,203,58,0.8)' }}>
              {t('chart.lagna')}
            </p>
            <p className="text-3xl font-display font-bold" style={{ color: '#ffecb2' }}>{sanskrit}</p>
            <p className="text-sm mt-1" style={{ color: 'rgba(246,166,35,0.55)' }}>{western}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
