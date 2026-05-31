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
}

const PARTICLE_COUNT = 55;
const CONNECT_DIST = 120;
const SPEED = 0.25;

function seed(w: number, h: number): Particle[] {
  const out: Particle[] = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const angle = Math.PI * 2 * (i / PARTICLE_COUNT) + (i * 1.618);
    out.push({
      x: Math.abs((i * 7919 + 3571) % (w || 1)),
      y: Math.abs((i * 6271 + 1949) % (h || 1)),
      vx: Math.cos(angle) * SPEED * (0.5 + (i % 3) * 0.3),
      vy: Math.sin(angle) * SPEED * (0.5 + (i % 4) * 0.25),
      r: 1 + (i % 3) * 0.6,
      alpha: 0.3 + (i % 5) * 0.12,
      pulse: (i * 0.73) % (Math.PI * 2),
      pulseSpeed: 0.008 + (i % 7) * 0.003,
    });
  }
  return out;
}

export const ParticleField: React.FC<{ isLight: boolean }> = ({ isLight }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const raf = useRef(0);

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
      if (particles.current.length === 0) {
        particles.current = seed(window.innerWidth, window.innerHeight);
      }
    };

    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      const pts = particles.current;

      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += p.pulseSpeed;

        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;
      }

      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECT_DIST) {
            const opacity = (1 - dist / CONNECT_DIST) * 0.18;
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = isLight
              ? `rgba(255,46,81,${opacity * 0.7})`
              : `rgba(255,46,81,${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        const glow = 0.5 + Math.sin(p.pulse) * 0.5;
        const a = p.alpha * (0.6 + glow * 0.4);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r + glow * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = isLight
          ? `rgba(255,46,81,${a * 0.55})`
          : `rgba(255,46,81,${a})`;
        ctx.fill();

        if (p.r > 1.2) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
          ctx.fillStyle = isLight
            ? `rgba(255,46,81,${a * 0.06})`
            : `rgba(255,46,81,${a * 0.12})`;
          ctx.fill();
        }
      }

      raf.current = requestAnimationFrame(draw);
    };

    raf.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener('resize', resize);
    };
  }, [isLight]);

  return (
    <canvas
      ref={ref}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden
    />
  );
};
