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
 * one. That is what produces the look: a still particle is a speck, a fast one
 * is a long curved dash, and the whole cloud reads as flowing rather than
 * sliding. The assemble/hold/dissolve physics is shared by every theme; only
 * the *skin* changes per `theme` — palette, backdrop, label colour, and for
 * two of them the render primitive itself:
 *   - default (dark theme):  gold streaks, unchanged from the original.
 *   - chalk (mono theme):    chalk-yellow strokes with a hand-trembled jitter.
 *   - terminal (terminal):   phosphor-green monospace characters — digital
 *                             rain assembling into the glyph, not dots.
 *   - aqua (azure theme):    blue droplets with a specular highlight, plus a
 *                             couple of expanding ripples once the figure lands.
 *   - petals (light theme):  rose-pink petals that tumble as they fly, in the
 *                             app's own accent colour. The backdrop here is
 *                             pale rather than dark, so this variant also
 *                             swaps the 'lighter' glow blending (which needs
 *                             a dark backdrop to read as glow) for ordinary
 *                             alpha compositing — overlapping petals layer
 *                             instead of blowing out to white.
 *
 * The figures are sampled, not drawn: the emoji is rendered once to an
 * offscreen canvas and every opaque pixel becomes a particle target, which is
 * why the silhouettes are real animals rather than the ♋-style glyphs. If a
 * platform has no colour emoji for a sign we fall back to its monochrome
 * zodiac glyph (U+FE0E), which every system ships.
 */

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
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
  '💃', // Kanya      — the maiden (a whole figure; 👸 is a head and reads as a blob)
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
 * reads as a scatter of dots rather than a figure; 3000 closes that to ~5px
 * and still strokes comfortably inside a frame.
 */
const MAX_PARTICLES = 3000;
/** Phone budget — half the points over roughly half the figure diameter. */
const MOBILE_PARTICLES = 1500;
/**
 * Petals is a different look on purpose: individually-readable rose petals
 * sketching the figure rather than a fine dust of specks — but enough of
 * them, small enough, that the silhouette itself still reads clearly at a
 * glance. Fewer than the other variants' budget, each one drawn bigger — see
 * the 'petals' branch in the draw loop below.
 */
const PETAL_PARTICLES = 1100;
const PETAL_PARTICLES_MOBILE = 550;
/**
 * Offscreen sampling resolution and grid step. 420/2 gives roughly four times
 * the candidate points of the original 260/3, so thinning has real detail to
 * choose from instead of inventing it.
 */
const SAMPLE_SIZE = 420;
const SAMPLE_STRIDE = 2;
/**
 * How the particle budget is split. The contour identifies the figure — a
 * crab's claws, the archer's bow — so it takes the largest share; interior
 * detail lines come next; flat fill gets the remainder.
 */
const OUTLINE_SHARE = 0.44;
const DETAIL_SHARE  = 0.31;
/** Alpha above which a pixel counts as ink, and the luminance step that marks
    an internal feature line. */
const ALPHA_MIN = 110;
const LUM_STEP  = 46;

type Variant = 'default' | 'chalk' | 'terminal' | 'aqua' | 'petals';

/** Which reveal skin each theme id gets. Anything unrecognised is 'default'. */
function variantFor(theme: string | undefined): Variant {
  if (theme === 'mono') return 'chalk';
  if (theme === 'terminal') return 'terminal';
  if (theme === 'azure') return 'aqua';
  if (theme === 'light') return 'petals';
  return 'default';
}

/** Three tiers per variant: core, deep, pale highlight — same shape as the original GOLD table. */
const PALETTE: Record<Variant, [number, number, number][]> = {
  default:  [[255, 203, 58], [246, 166, 35], [255, 236, 178]], // gold
  chalk:    [[240, 220, 148], [217, 192, 121], [250, 249, 242]], // chalk yellow, matches the chalkboard theme's accent
  terminal: [[51, 255, 102], [34, 204, 77], [207, 255, 223]], // phosphor green, matches the terminal theme's accent
  aqua:     [[37, 99, 235], [29, 78, 216], [147, 197, 253]], // azure blue, matches the azure theme's accent
  petals:   [[255, 46, 81], [219, 39, 119], [255, 214, 224]], // rose — the light theme's own accent (#FF2E51), a deeper magenta, and a pale blush
};

const BACKDROP: Record<Variant, string> = {
  default:  'radial-gradient(ellipse at center, #0a0803 0%, #000000 68%)',
  chalk:    'radial-gradient(ellipse at center, #232320 0%, #141413 70%)',
  terminal: 'radial-gradient(ellipse at center, #04140a 0%, #000000 70%)',
  aqua:     'radial-gradient(ellipse at center, #0a2a5c 0%, #020817 72%)',
  petals:   'radial-gradient(ellipse at center, #fff7f8 0%, #ffe3ea 55%, #ffcdda 100%)',
};

const LABEL_COLOR: Record<Variant, { tag: string; title: string; sub: string }> = {
  default:  { tag: 'rgba(255,203,58,0.8)',  title: '#ffecb2', sub: 'rgba(246,166,35,0.55)' },
  chalk:    { tag: 'rgba(240,220,148,0.85)', title: '#faf9f2', sub: 'rgba(217,192,121,0.6)' },
  terminal: { tag: 'rgba(51,255,102,0.85)',  title: '#cfffdf', sub: 'rgba(51,255,102,0.55)' },
  aqua:     { tag: 'rgba(96,165,250,0.9)',   title: '#dbeafe', sub: 'rgba(147,197,253,0.65)' },
  petals:   { tag: 'rgba(190,24,93,0.8)',    title: '#9d174d', sub: 'rgba(157,23,77,0.6)' },
};

/** ASCII-only so canvas monospace metrics stay predictable across platforms. */
const RAIN_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%&*<>/\\+=-_'.split('');
const randomRainChar = () => RAIN_CHARS[Math.floor(Math.random() * RAIN_CHARS.length)];

/** Ripple ring timing for the aqua variant's "splash" once the figure lands. */
const RIPPLE_LIFE = 750;
const RIPPLE_DELAYS = [0, 160, 340];

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
  /** Terminal variant only — the glyph this particle draws instead of a dot. */
  char?: string;
}

type Pt = { x: number; y: number };

const easeOutCubic  = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);

/**
 * Render `text` to an offscreen canvas and return its opaque pixels on a
 * `stride` grid, in a normalised -0.5…0.5 box, split into three tiers:
 *
 *   outline — a pixel with a transparent neighbour: the silhouette
 *   detail  — an interior pixel sitting on a luminance step: eyes, fins, the
 *             crab's shell seams, the lion's muzzle inside its mane
 *   fill    — flat interior
 *
 * Sampling on alpha alone throws away everything inside the shape, which is why
 * a face-type emoji (Leo is a lion's *head*) came out as a featureless blob.
 * Reading luminance as well recovers the internal drawing, and spending the
 * budget outline-first, detail-second keeps the figure legible instead of
 * pouring particles into flat interior.
 */
function samplePoints(text: string, font: string, stride: number): {
  outline: Pt[]; detail: Pt[]; fill: Pt[];
} {
  const S = SAMPLE_SIZE;
  const c = document.createElement('canvas');
  c.width = S;
  c.height = S;
  const g = c.getContext('2d', { willReadFrequently: true });
  if (!g) return { outline: [], detail: [], fill: [] };

  g.clearRect(0, 0, S, S);
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillStyle = '#ffffff';
  g.font = font;
  // maxWidth keeps two-glyph figures (the fishes, the twins) inside the box.
  g.fillText(text, S / 2, S / 2, S * 0.94);

  const d = g.getImageData(0, 0, S, S).data;
  const inside = (x: number, y: number) => x >= 0 && y >= 0 && x < S && y < S;
  const alphaAt = (x: number, y: number) => (inside(x, y) ? d[(y * S + x) * 4 + 3] : 0);
  const lumAt = (x: number, y: number) => {
    const i = (y * S + x) * 4;
    return 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
  };

  const outline: Pt[] = [];
  const detail: Pt[] = [];
  const fill: Pt[] = [];
  const NEIGHBOURS: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];

  for (let y = 0; y < S; y += stride) {
    for (let x = 0; x < S; x += stride) {
      if (alphaAt(x, y) <= ALPHA_MIN) continue;
      const pt = { x: x / S - 0.5, y: y / S - 0.5 };

      let onOutline = false;
      for (const [dx, dy] of NEIGHBOURS) {
        if (alphaAt(x + dx * stride, y + dy * stride) <= ALPHA_MIN) { onOutline = true; break; }
      }
      if (onOutline) { outline.push(pt); continue; }

      const l = lumAt(x, y);
      let onDetail = false;
      for (const [dx, dy] of NEIGHBOURS) {
        const nx = x + dx * stride, ny = y + dy * stride;
        if (!inside(nx, ny)) continue;
        if (Math.abs(l - lumAt(nx, ny)) > LUM_STEP) { onDetail = true; break; }
      }
      (onDetail ? detail : fill).push(pt);
    }
  }
  return { outline, detail, fill };
}

/** Take n points spread evenly through the list rather than the first n. */
function thin(pts: Pt[], n: number): Pt[] {
  if (n <= 0) return [];
  if (pts.length <= n) return pts;
  const step = pts.length / n;
  const out: Pt[] = [];
  for (let i = 0; i < n; i++) out.push(pts[Math.floor(i * step)]);
  return out;
}

/**
 * Figure targets for a sign — outline, then interior detail, then flat fill,
 * with a monochrome-glyph fallback. The two counts tell the caller where each
 * tier starts so it can render them at different weights.
 */
function figurePoints(rashiIndex: number, budget: number): { pts: Pt[]; outlineCount: number; detailCount: number } {
  const emoji = FIGURE_EMOJI[rashiIndex] ?? FIGURE_EMOJI[0];
  const emojiFont = `${Math.round(SAMPLE_SIZE * 0.74)}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji","EmojiOne Color",sans-serif`;
  let s = samplePoints(emoji, emojiFont, SAMPLE_STRIDE);
  if (s.outline.length + s.detail.length + s.fill.length < 400) {
    const glyph = SIGN_GLYPH[rashiIndex] ?? SIGN_GLYPH[0];
    s = samplePoints(glyph, `${Math.round(SAMPLE_SIZE * 0.82)}px serif`, SAMPLE_STRIDE);
  }

  const outline = thin(s.outline, Math.round(budget * OUTLINE_SHARE));
  const detail  = thin(s.detail,  Math.round(budget * DETAIL_SHARE));
  const fill    = thin(s.fill,    budget - outline.length - detail.length);
  return {
    pts: [...outline, ...detail, ...fill],
    outlineCount: outline.length,
    detailCount: detail.length,
  };
}

interface Props {
  /** Ascendant sign to reveal, or null when idle. */
  rashiIndex: number | null;
  onDone: () => void;
  /** Active app theme id — picks the reveal's palette/backdrop/render style. */
  theme?: string;
}

export const LagnaIntro: React.FC<Props> = ({ rashiIndex, onDone, theme }) => {
  const { lang, t } = useLang();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Kept in a ref so the animation loop never restarts when the parent re-renders.
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  const active = rashiIndex !== null;
  const variant = variantFor(theme);
  const palette = PALETTE[variant];

  useEffect(() => {
    if (rashiIndex === null) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0, h = 0, scale = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Phones do this on a smaller canvas and a tighter power budget, and the
    // figure is physically smaller there, so it needs fewer points to read.
    const mobile = window.innerWidth < 640;
    const budget = variant === 'petals'
      ? (mobile ? PETAL_PARTICLES_MOBILE : PETAL_PARTICLES)
      : (mobile ? MOBILE_PARTICLES : MAX_PARTICLES);
    const { pts: figure, outlineCount, detailCount } = figurePoints(rashiIndex, budget);
    const count = Math.min(budget, figure.length);

    const particles: Particle[] = [];
    // Terminal font per tier — set once, then cached across the run rather
    // than re-parsed every fillText call (tiers stay contiguous in the array,
    // so this changes at most twice per frame).
    const termFonts = ['13px', '11px', '9px'].map(
      size => `${size} "JetBrains Mono", ui-monospace, monospace`,
    );
    // Aqua "splash" rings, triggered once the figure finishes assembling.
    const ripples = variant === 'aqua' ? RIPPLE_DELAYS.map(delay => ({ start: -1, delay })) : [];

    // A real rose petal: a shallow notch at the top where it met the bud,
    // shoulders that bow outward, tapering to a rounded point — not a plain
    // symmetric oval. Traced in local space (already translated/rotated to
    // the particle) so it's one path definition reused for every petal.
    const petalPath = (len: number, wid: number) => {
      ctx.moveTo(0, -len * 0.82);
      ctx.bezierCurveTo(wid * 0.15, -len, wid, -len * 0.6, wid, -len * 0.16);
      ctx.bezierCurveTo(wid * 1.05, len * 0.28, wid * 0.55, len * 0.86, 0, len);
      ctx.bezierCurveTo(-wid * 0.55, len * 0.86, -wid * 1.05, len * 0.28, -wid, -len * 0.16);
      ctx.bezierCurveTo(-wid, -len * 0.6, -wid * 0.15, -len, 0, -len * 0.82);
    };

    const layout = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // The figure occupies ~62% of the smaller viewport axis, capped so it
      // never becomes a wall of particles on a desktop monitor.
      scale = Math.min(Math.min(w, h) * (w < 640 ? 0.72 : 0.62), 460);
    };

    const seed = () => {
      particles.length = 0;
      const cxp = w / 2, cyp = h / 2;
      const ring = Math.hypot(w, h) * 0.55;
      for (let i = 0; i < count; i++) {
        const f = figure[i];
        // 0 = silhouette, 1 = interior feature line, 2 = flat fill
        const tier = i < outlineCount ? 0 : i < outlineCount + detailCount ? 1 : 2;
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
          // Weighted by tier: the silhouette is drawn boldest, feature lines
          // sit just under it, flat fill is the faintest wash.
          size: tier === 0 ? 1.05 + Math.random() * 0.85
              : tier === 1 ? 0.85 + Math.random() * 0.6
              : 0.7 + Math.random() * 0.55,
          tint: tier === 0 ? (i % 4 === 0 ? 2 : 0) : tier === 1 ? 0 : 1,
          lead: tier === 0 && i % 8 === 0,
          char: variant === 'terminal' ? randomRainChar() : undefined,
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
    let fontTier = -1;

    const frame = (now: number) => {
      const elapsed = now - t0;
      // Physics runs in 60fps-equivalent steps so the motion looks identical on
      // a 120Hz display; the phase clock stays on wall time either way.
      const dt = Math.min(2.5, Math.max(0.4, (now - last) / 16.667));
      last = now;

      ctx.clearRect(0, 0, w, h);
      // 'lighter' additive blending is what makes overlapping particles read
      // as glow — but that only works over a dark backdrop. Petals sit on a
      // pale one, so it stays plain alpha compositing: petals layer over each
      // other like real ones instead of blowing out toward white.
      ctx.globalCompositeOperation = variant === 'petals' ? 'source-over' : 'lighter';
      ctx.lineCap = 'round';
      if (variant === 'terminal') { ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; }

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
        const [r, g, b] = palette[p.tint];
        const base = p.lead ? 0.95 : 0.74;
        const a = Math.min(1, base + speed * 0.05) * selfAlpha;
        if (a <= 0.01) continue;

        if (variant === 'terminal' && p.char) {
          // Digital rain: a glyph, not a dot — a faint flicker keeps the
          // characters cycling like a real terminal feed. No ctx.shadow* here:
          // canvas shadow blur is a full convolution pass per call, and at
          // thousands of particles a frame it stretched a 4s reveal past 10s.
          // The plain fillText below is exactly as cheap as the dot/arc path
          // the other variants use.
          if (Math.random() < 0.02) p.char = randomRainChar();
          if (p.tint !== fontTier) { ctx.font = termFonts[p.tint]; fontTier = p.tint; }
          ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
          ctx.fillText(p.char, p.x, p.y);
          continue;
        }

        if (variant === 'petals') {
          // A petal, not a dot or a streak: a slow continuous tumble (not
          // tied to velocity, which flickers near-zero when the figure is
          // holding still) plus a little wobble, so the cloud reads as
          // petals turning in the air rather than sparks flying. Large and
          // few rather than fine dust — this variant runs on PETAL_PARTICLES,
          // a fraction of the other variants' budget, specifically so each
          // one is big enough to read as an actual petal.
          const flutter = p.flowPhase + elapsed * 0.0011;
          const rot = flutter * 1.1 + Math.sin(flutter * 1.6) * 0.35;
          const len = p.size * (p.lead ? 6.5 : 5);
          const wid = len * 0.58;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(rot);

          ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
          ctx.beginPath();
          petalPath(len, wid);
          ctx.fill();

          // A soft rose-edge outline — real petals have a visible, slightly
          // deeper-toned rim, not a hard vector edge.
          const [dr, dg, db] = palette[1];
          ctx.lineWidth = 0.9;
          ctx.strokeStyle = `rgba(${dr},${dg},${db},${a * 0.35})`;
          ctx.stroke();

          // A smaller, paler petal nested toward the tip stands in for the
          // gradient a real petal shows toward its curled outer edge —
          // cheaper than an actual canvas gradient, and reads the same at
          // this size.
          const [hr, hg, hb] = palette[2];
          ctx.translate(0, len * 0.2);
          ctx.scale(0.55, 0.6);
          ctx.fillStyle = `rgba(${hr},${hg},${hb},${a * 0.55})`;
          ctx.beginPath();
          petalPath(len, wid);
          ctx.fill();

          ctx.restore();
          continue;
        }

        // Chalk trembles very slightly as it's drawn — a hand is not a plotter.
        const jx = variant === 'chalk' ? Math.sin(p.flowPhase + elapsed * 0.006) * 0.5 : 0;
        const jy = variant === 'chalk' ? Math.cos(p.flowPhase * 1.3 + elapsed * 0.005) * 0.5 : 0;
        const dx0 = p.x + jx, dy0 = p.y + jy;

        if (speed > 0.6) {
          // Stretch the streak back along the travel direction; lead particles
          // pull longer tails. Capped, or the fastest particles mid-flight
          // stop reading as dashes and turn into beams across the screen.
          const maxLen = p.lead ? 34 : 22;
          const tail = Math.min(p.lead ? 2.2 : 1.4, maxLen / speed);
          ctx.strokeStyle = `rgba(${r},${g},${b},${a})`;
          ctx.lineWidth = p.size * (p.lead ? 1.5 : 1.1);
          ctx.beginPath();
          ctx.moveTo(dx0 - (p.x - p.px) * tail, dy0 - (p.y - p.py) * tail);
          ctx.lineTo(dx0, dy0);
          ctx.stroke();
        } else {
          ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
          ctx.beginPath();
          ctx.arc(dx0, dy0, p.size * 1.15, 0, Math.PI * 2);
          ctx.fill();

          // Aqua droplets get a small pale specular highlight when at rest —
          // outline/detail tiers only, so the flat fill doesn't double the cost.
          if (variant === 'aqua' && p.tint !== 1) {
            const [hr, hg, hb] = palette[2];
            ctx.fillStyle = `rgba(${hr},${hg},${hb},${a * 0.6})`;
            ctx.beginPath();
            ctx.arc(dx0 - p.size * 0.4, dy0 - p.size * 0.4, p.size * 0.4, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        // Soft halo under every particle. On 'lighter' compositing the overlaps
        // are what give the settled figure its glow rather than a dot screen.
        ctx.fillStyle = `rgba(${r},${g},${b},${a * (p.lead ? 0.16 : 0.10)})`;
        ctx.beginPath();
        ctx.arc(dx0, dy0, p.size * (p.lead ? 3.4 : 2.6), 0, Math.PI * 2);
        ctx.fill();
      }

      // Aqua: a couple of expanding, fading rings once the figure lands —
      // the "splash" the droplets made on arrival.
      if (variant === 'aqua') {
        const maxR = scale * 0.6;
        for (const ripple of ripples) {
          if (ripple.start < 0 && elapsed >= ASSEMBLE + ripple.delay) ripple.start = elapsed;
          if (ripple.start < 0) continue;
          const age = elapsed - ripple.start;
          if (age >= RIPPLE_LIFE) continue;
          const p = easeOutCubic(clamp01(age / RIPPLE_LIFE));
          const [r, g, b] = palette[2];
          ctx.strokeStyle = `rgba(${r},${g},${b},${0.32 * (1 - p)})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(cxp, cyp, 10 + p * maxR, 0, Math.PI * 2);
          ctx.stroke();
        }
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
  }, [rashiIndex, variant]);

  const sanskrit = rashiIndex !== null ? labelRashi(rashiIndex, lang, RASHIS[rashiIndex]) : '';
  const western  = rashiIndex !== null ? labelRashiWestern(rashiIndex, lang, RASHI_ENGLISH[rashiIndex]) : '';
  const labelColor = LABEL_COLOR[variant];

  return (
    // The theme this reveal is playing under may itself run with reduced
    // motion (chalkboard sets it app-wide) — this moment should always fade
    // smoothly regardless; only the OS-level preference (checked before this
    // component is ever mounted) should suppress it.
    <MotionConfig reducedMotion="never">
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
            style={{ background: BACKDROP[variant] }}
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
            <p className="text-[11px] font-mono uppercase tracking-[0.4em] mb-2" style={{ color: labelColor.tag }}>
              {t('chart.lagna')}
            </p>
            <p className="text-3xl font-display font-bold" style={{ color: labelColor.title }}>{sanskrit}</p>
            <p className="text-sm mt-1" style={{ color: labelColor.sub }}>{western}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </MotionConfig>
  );
};
