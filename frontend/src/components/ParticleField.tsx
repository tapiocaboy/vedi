import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  alpha: number;
  pulse: number;
  pulseSpeed: number;
  colorIdx: number;
  wobblePhase: number;
  wobbleAmp: number;
}

const COUNT = 55;
const LINK_DIST = 150;
const MAX_DPR = 1.5;
const FRAME_INTERVAL = 1000 / 30; // cap at 30fps regardless of display refresh rate
const SPRITE_SIZE = 96; // pre-rendered bloom sprite, reused every frame

const COLORS_DARK = [
  [255, 46, 81],    // pink
  [255, 230, 0],    // luminous yellow
  [0, 255, 135],    // luminous green
  [255, 140, 0],    // luminous orange
  [0, 220, 255],    // electric cyan
  [180, 60, 255],   // vivid purple
];

const COLORS_LIGHT = [
  [230, 25, 65],
  [210, 180, 0],
  [0, 180, 90],
  [220, 110, 0],
  [0, 160, 220],
  [140, 40, 220],
];

function seed(w: number, h: number): Particle[] {
  const out: Particle[] = [];
  for (let i = 0; i < COUNT; i++) {
    const group = i % 6;
    const base = 0.6 + (i % 5) * 0.25;
    let vx = 0, vy = 0;

    if (group === 0) { vx = base; vy = ((i % 3) - 1) * base * 0.3; }
    else if (group === 1) { vx = -base; vy = ((i % 3) - 1) * base * 0.35; }
    else if (group === 2) { vx = ((i % 5) - 2) * base * 0.35; vy = -base; }
    else if (group === 3) { vx = ((i % 5) - 2) * base * 0.35; vy = base * 0.8; }
    else if (group === 4) {
      const s = i % 2 === 0 ? 1 : -1;
      vx = base * 0.85 * s;
      vy = base * 0.65 * (i % 3 === 0 ? -1 : 1);
    } else {
      const a = (i * 2.399) % (Math.PI * 2);
      vx = Math.cos(a) * base * 0.9;
      vy = Math.sin(a) * base * 0.9;
    }

    out.push({
      x: (i * 7919 + 3571) % (w || 1),
      y: (i * 6271 + 1949) % (h || 1),
      vx, vy,
      r: 1.2 + (i % 5) * 0.55,
      alpha: 0.45 + (i % 4) * 0.12,
      pulse: (i * 0.91) % (Math.PI * 2),
      pulseSpeed: 0.025 + (i % 6) * 0.008,
      colorIdx: i % COLORS_DARK.length,
      wobblePhase: (i * 1.37) % (Math.PI * 2),
      wobbleAmp: 0.15 + (i % 4) * 0.1,
    });
  }
  return out;
}

// Pre-rasterize each color's radial bloom once so the hot loop can drawImage()
// a cached sprite instead of allocating + filling a new gradient per particle
// per frame (the single biggest CPU/GPU cost in this component).
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

export const ParticleField: React.FC<{ isLight: boolean }> = ({ isLight }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const pts = useRef<Particle[]>([]);
  const raf = useRef(0);
  const lightRef = useRef(isLight);
  lightRef.current = isLight;

  useEffect(() => {
    const cvs = ref.current;
    if (!cvs) return;

    // Respect the OS-level motion preference outright: don't just hide the
    // canvas visually (CSS already does that below 640px / reduced-motion),
    // skip running the animation loop at all so it costs zero CPU.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = cvs.getContext('2d', { alpha: true });
    if (!ctx) return;

    const spritesDark = buildSprites(COLORS_DARK);
    const spritesLight = buildSprites(COLORS_LIGHT);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      cvs.width = window.innerWidth * dpr;
      cvs.height = window.innerHeight * dpr;
      cvs.style.width = `${window.innerWidth}px`;
      cvs.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (pts.current.length === 0)
        pts.current = seed(window.innerWidth, window.innerHeight);
    };

    resize();
    window.addEventListener('resize', resize);

    let lastFrame = 0;

    const draw = (now: number) => {
      raf.current = requestAnimationFrame(draw);
      if (now - lastFrame < FRAME_INTERVAL) return;
      lastFrame = now;

      const light = lightRef.current;
      const pal = light ? COLORS_LIGHT : COLORS_DARK;
      const sprites = light ? spritesLight : spritesDark;
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      const p = pts.current;

      // Move
      for (let i = 0; i < p.length; i++) {
        const pt = p[i];
        pt.wobblePhase += 0.02;
        pt.pulse += pt.pulseSpeed;
        pt.x += pt.vx + Math.sin(pt.wobblePhase) * pt.wobbleAmp;
        pt.y += pt.vy + Math.cos(pt.wobblePhase * 0.7) * pt.wobbleAmp * 0.6;

        if (pt.x < -20) pt.x = w + 20;
        if (pt.x > w + 20) pt.x = -20;
        if (pt.y < -20) pt.y = h + 20;
        if (pt.y > h + 20) pt.y = -20;
      }

      // Links
      for (let i = 0; i < p.length; i++) {
        for (let j = i + 1; j < p.length; j++) {
          const dx = p[i].x - p[j].x;
          const dy = p[i].y - p[j].y;
          const d2 = dx * dx + dy * dy;
          if (d2 < LINK_DIST * LINK_DIST) {
            const dist = Math.sqrt(d2);
            const fade = 1 - dist / LINK_DIST;
            const op = fade * fade * (light ? 0.14 : 0.24);
            const ci = pal[p[i].colorIdx];
            const cj = pal[p[j].colorIdx];
            const r = (ci[0] + cj[0]) >> 1;
            const g = (ci[1] + cj[1]) >> 1;
            const b = (ci[2] + cj[2]) >> 1;
            ctx.beginPath();
            ctx.moveTo(p[i].x, p[i].y);
            ctx.lineTo(p[j].x, p[j].y);
            ctx.strokeStyle = `rgba(${r},${g},${b},${op})`;
            ctx.lineWidth = 0.7 + fade * 0.5;
            ctx.stroke();
          }
        }
      }

      // Particles
      for (let i = 0; i < p.length; i++) {
        const pt = p[i];
        const glow = 0.5 + Math.sin(pt.pulse) * 0.5;
        const a = pt.alpha * (0.55 + glow * 0.45);
        const c = pal[pt.colorIdx];
        const m = light ? 0.55 : 1;
        const rad = pt.r + glow * 1.2;

        // Outer bloom — cached sprite, just blitted (no gradient allocation)
        const bloomR = rad * 5;
        ctx.globalAlpha = a * m * 0.25;
        ctx.drawImage(sprites[pt.colorIdx], pt.x - bloomR, pt.y - bloomR, bloomR * 2, bloomR * 2);
        ctx.globalAlpha = 1;

        // Core dot
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, rad, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${a * m})`;
        ctx.fill();

        // Sparkle cross on bright peaks
        if (glow > 0.8 && pt.r > 1.4) {
          const len = rad * 3;
          const sa = a * m * 0.4;
          ctx.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},${sa})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(pt.x - len, pt.y);
          ctx.lineTo(pt.x + len, pt.y);
          ctx.moveTo(pt.x, pt.y - len);
          ctx.lineTo(pt.x, pt.y + len);
          ctx.stroke();
        }
      }
    };

    raf.current = requestAnimationFrame(draw);

    // Stop burning CPU/GPU entirely while the tab isn't visible — rAF is
    // throttled in background tabs by most browsers but not reliably to zero.
    const handleVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf.current);
      } else {
        lastFrame = 0;
        raf.current = requestAnimationFrame(draw);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="fixed inset-0 pointer-events-none z-0 particle-field-canvas"
      aria-hidden
    />
  );
};
