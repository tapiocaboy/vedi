import { useEffect, useRef } from 'react';
import { loadZodiacImages, sampleZodiacFigure } from '../lib/core/zodiacFigures';

interface Star {
  x: number;
  y: number;
  r: number;
  alpha: number;
  colorIdx: number;
}

const STAR_COUNT = 36;
const MAX_DPR = 1.25;
const SPRITE_SIZE = 96;
const FIGURE_BUDGET = 160;

const COLORS_DARK = [
  [255, 46, 81],
  [255, 230, 0],
  [0, 255, 135],
  [255, 140, 0],
  [0, 220, 255],
  [180, 60, 255],
];

const COLORS_LIGHT = [
  [230, 25, 65],
  [210, 180, 0],
  [0, 180, 90],
  [220, 110, 0],
  [0, 160, 220],
  [140, 40, 220],
];

function thin<T>(pts: T[], n: number): T[] {
  if (n <= 0 || pts.length === 0) return [];
  if (pts.length <= n) return pts;
  const step = pts.length / n;
  return Array.from({ length: n }, (_, i) => pts[Math.floor(i * step)]);
}

function seedStars(w: number, h: number): Star[] {
  const out: Star[] = [];
  for (let i = 0; i < STAR_COUNT; i++) {
    out.push({
      x: (i * 7919 + 3571) % (w || 1),
      y: (i * 6271 + 1949) % (h || 1),
      r: 1.1 + (i % 4) * 0.4,
      alpha: 0.28 + (i % 4) * 0.08,
      colorIdx: i % COLORS_DARK.length,
    });
  }
  return out;
}

function buildSprites(colors: number[][]): HTMLCanvasElement[] {
  const center = SPRITE_SIZE / 2;
  return colors.map(([r, g, b]) => {
    const c = document.createElement('canvas');
    c.width = SPRITE_SIZE;
    c.height = SPRITE_SIZE;
    const cx = c.getContext('2d')!;
    const grad = cx.createRadialGradient(center, center, 0, center, center, center);
    grad.addColorStop(0, `rgba(${r},${g},${b},1)`);
    grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
    cx.fillStyle = grad;
    cx.beginPath();
    cx.arc(center, center, center, 0, Math.PI * 2);
    cx.fill();
    return c;
  });
}

function stamp(
  ctx: CanvasRenderingContext2D,
  sprites: HTMLCanvasElement[],
  pal: number[][],
  x: number,
  y: number,
  r: number,
  colorIdx: number,
  alpha: number,
) {
  const c = pal[colorIdx];
  const bloomR = r * 4.2;
  ctx.globalAlpha = alpha * 0.22;
  ctx.drawImage(sprites[colorIdx], x - bloomR, y - bloomR, bloomR * 2, bloomR * 2);
  ctx.globalAlpha = 1;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${alpha})`;
  ctx.fill();
}

/**
 * Still star field with the twelve pictorial signs (Sagittarius is the
 * archer-centaur). Painted once so it does not warm the laptop.
 */
export const ParticleField: React.FC<{ isLight: boolean }> = ({ isLight }) => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cvs = ref.current;
    if (!cvs) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = cvs.getContext('2d', { alpha: true, desynchronized: true });
    if (!ctx) return;

    const sprites = buildSprites(isLight ? COLORS_LIGHT : COLORS_DARK);
    const pal = isLight ? COLORS_LIGHT : COLORS_DARK;
    let figures: { x: number; y: number }[][] = Array.from({ length: 12 }, () => []);
    let cancelled = false;

    const paint = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const w = window.innerWidth;
      const h = window.innerHeight;
      cvs.width = Math.round(w * dpr);
      cvs.height = Math.round(h * dpr);
      cvs.style.width = `${w}px`;
      cvs.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const stars = seedStars(w, h);
      const m = isLight ? 0.42 : 0.85;
      for (const st of stars) {
        stamp(ctx, sprites, pal, st.x, st.y, st.r, st.colorIdx, st.alpha * m);
      }

      const cx = w * 0.54;
      const cy = h * 0.52;
      const rad = Math.min(w, h) * 0.36;
      const size = Math.min(w, h) * 0.20;

      for (let i = 0; i < 12; i++) {
        const a = (i * 30 - 90) * (Math.PI / 180);
        const ox = cx + Math.cos(a) * rad;
        const oy = cy + Math.sin(a) * rad;
        const colorIdx = i % pal.length;
        const alpha = (isLight ? 0.32 : 0.52) * m;
        for (const pt of figures[i]) {
          stamp(
            ctx, sprites, pal,
            ox + pt.x * size,
            oy + pt.y * size,
            1.15,
            colorIdx,
            alpha,
          );
        }
      }
    };

    void loadZodiacImages()
      .then(() => {
        if (cancelled) return;
        figures = Array.from({ length: 12 }, (_, i) => {
          const s = sampleZodiacFigure(i, 280, 3);
          return thin([...s.outline, ...s.detail, ...s.fill], FIGURE_BUDGET);
        });
        paint();
      })
      .catch(() => { if (!cancelled) paint(); });

    window.addEventListener('resize', paint);
    return () => {
      cancelled = true;
      window.removeEventListener('resize', paint);
    };
  }, [isLight]);

  return (
    <canvas
      ref={ref}
      className="fixed inset-0 pointer-events-none z-0 particle-field-canvas"
      aria-hidden
    />
  );
};
