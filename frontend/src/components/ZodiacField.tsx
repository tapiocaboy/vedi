import { useEffect, useRef } from 'react';

/**
 * Ambient zodiac background — slowly drifting, gently rotating zodiac glyphs
 * over a field of twinkling stars. Replaces the old generic particle network
 * so the backdrop matches the astrology theme.
 *
 * U+FE0E after each glyph forces monochrome text rendering (no emoji), so the
 * canvas fillStyle colour applies on every platform.
 */

const GLYPHS = [
  '♈\uFE0E', '♉\uFE0E', '♊\uFE0E', '♋\uFE0E', '♌\uFE0E', '♍\uFE0E',
  '♎\uFE0E', '♏\uFE0E', '♐\uFE0E', '♑\uFE0E', '♒\uFE0E', '♓\uFE0E',
] as const;

// Planet glyphs sprinkled in for variety
const PLANET_GLYPHS = ['☉\uFE0E', '☽\uFE0E', '♂\uFE0E', '☿\uFE0E', '♃\uFE0E', '♀\uFE0E', '♄\uFE0E'] as const;

interface Glyph {
  glyph: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rot: number;
  rotSpeed: number;
  pulse: number;
  pulseSpeed: number;
  hueIdx: number;
  isPlanet: boolean;
}

interface Star {
  x: number;
  y: number;
  r: number;
  twinkle: number;
  twinkleSpeed: number;
}

const GLYPH_COUNT = 26;
const STAR_COUNT = 90;

// Warm celestial palette — dark theme (r,g,b)
const HUES_DARK: [number, number, number][] = [
  [255, 175, 97],   // warm orange (chart accent)
  [255, 46, 81],    // brand pink
  [200, 160, 255],  // soft violet
  [120, 200, 255],  // pale sky blue
  [255, 220, 130],  // pale gold
];

const HUES_LIGHT: [number, number, number][] = [
  [234, 120, 20],
  [220, 30, 70],
  [140, 90, 220],
  [30, 130, 200],
  [190, 140, 20],
];

function mulberry(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedGlyphs(w: number, h: number): Glyph[] {
  const rnd = mulberry(42);
  const out: Glyph[] = [];
  for (let i = 0; i < GLYPH_COUNT; i++) {
    const isPlanet = i % 4 === 3;
    const pool = isPlanet ? PLANET_GLYPHS : GLYPHS;
    const a = rnd() * Math.PI * 2;
    const speed = 0.08 + rnd() * 0.14;
    out.push({
      glyph: pool[i % pool.length],
      x: rnd() * (w || 1),
      y: rnd() * (h || 1),
      vx: Math.cos(a) * speed,
      vy: Math.sin(a) * speed * 0.7,
      size: 18 + rnd() * 30,
      rot: rnd() * Math.PI * 2,
      rotSpeed: (rnd() - 0.5) * 0.003,
      pulse: rnd() * Math.PI * 2,
      pulseSpeed: 0.006 + rnd() * 0.010,
      hueIdx: i % HUES_DARK.length,
      isPlanet,
    });
  }
  return out;
}

function seedStars(w: number, h: number): Star[] {
  const rnd = mulberry(7);
  const out: Star[] = [];
  for (let i = 0; i < STAR_COUNT; i++) {
    out.push({
      x: rnd() * (w || 1),
      y: rnd() * (h || 1),
      r: 0.5 + rnd() * 1.3,
      twinkle: rnd() * Math.PI * 2,
      twinkleSpeed: 0.01 + rnd() * 0.025,
    });
  }
  return out;
}

export const ZodiacField: React.FC<{ isLight: boolean }> = ({ isLight }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const glyphs = useRef<Glyph[]>([]);
  const stars = useRef<Star[]>([]);
  const raf = useRef(0);
  const lightRef = useRef(isLight);
  lightRef.current = isLight;

  useEffect(() => {
    const cvs = ref.current;
    if (!cvs) return;
    const ctx = cvs.getContext('2d', { alpha: true });
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      cvs.width = window.innerWidth * dpr;
      cvs.height = window.innerHeight * dpr;
      cvs.style.width = `${window.innerWidth}px`;
      cvs.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (glyphs.current.length === 0) {
        glyphs.current = seedGlyphs(window.innerWidth, window.innerHeight);
        stars.current = seedStars(window.innerWidth, window.innerHeight);
      }
    };

    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      const light = lightRef.current;
      const hues = light ? HUES_LIGHT : HUES_DARK;
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      // Twinkling stars
      for (const s of stars.current) {
        s.twinkle += s.twinkleSpeed;
        const a = (0.5 + Math.sin(s.twinkle) * 0.5) * (light ? 0.30 : 0.55);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = light ? `rgba(90,80,120,${a})` : `rgba(255,255,255,${a})`;
        ctx.fill();
      }

      // Drifting zodiac / planet glyphs
      for (const g of glyphs.current) {
        g.pulse += g.pulseSpeed;
        g.rot += g.rotSpeed;
        g.x += g.vx;
        g.y += g.vy;

        const margin = g.size * 1.5;
        if (g.x < -margin) g.x = w + margin;
        if (g.x > w + margin) g.x = -margin;
        if (g.y < -margin) g.y = h + margin;
        if (g.y > h + margin) g.y = -margin;

        const glow = 0.5 + Math.sin(g.pulse) * 0.5;
        const [r, gr, b] = hues[g.hueIdx];
        const alpha = (light ? 0.10 : 0.14) + glow * (light ? 0.08 : 0.12);

        ctx.save();
        ctx.translate(g.x, g.y);
        ctx.rotate(g.rot);
        ctx.font = `${g.size}px "Space Grotesk", "Inter", system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        if (!light) {
          ctx.shadowColor = `rgba(${r},${gr},${b},${0.35 + glow * 0.3})`;
          ctx.shadowBlur = 10 + glow * 10;
        }
        ctx.fillStyle = `rgba(${r},${gr},${b},${alpha})`;
        ctx.fillText(g.glyph, 0, 0);
        ctx.restore();
      }

      raf.current = requestAnimationFrame(draw);
    };

    raf.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener('resize', resize);
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
