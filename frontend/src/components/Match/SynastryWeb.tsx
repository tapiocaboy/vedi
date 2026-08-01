/**
 * The synastry web, drawn as a scene rather than a diagram: the two charts are
 * rings of glowing planets facing each other inside a slowly turning wireframe
 * cube, and every contact the Layer 4 engine found is a neon arc strung
 * between them — a white-hot core inside a coloured glow, teal when the
 * contact helps, rose when it strains. Particles flow along each arc *from the
 * acting planet to the receiving one*: the engine is directional and the
 * motion is the arrow. Thickness and particle density are the engine's own
 * rank (weight class × orb strength). Planets with no contact sit dimmed,
 * which is itself information: those parts of the two charts do not touch.
 *
 * Interaction: drag rotates the cube; tapping a planet isolates everything it
 * touches; tapping an arc (or its sentence row) isolates that contact and
 * shows its reading — and the auto-rotation holds still while something is
 * selected so the reader can look at it. The expand button pops the scene
 * into a full-screen overlay (portaled to <body>, because the glass-card's
 * backdrop-filter traps position:fixed) with the contact list alongside.
 *
 * The scene is hand-projected onto a 2D canvas — no 3D library. In the mono
 * theme and under prefers-reduced-motion it renders a single static frame
 * (drag still works) with arrowheads standing in for the particle flow.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Maximize2, X } from 'lucide-react';
import type { SynastryContact, SynastryResult } from '../../lib/core/matchSynastry';
import { contactRank, formatOrb } from '../../lib/core/matchSynastry';
import { PLANET_SYMBOLS, planetDisplayColor } from '../../types/astrology';
import { useTheme } from '../../hooks/useTheme';
import { useLang } from '../../i18n/LanguageContext';
import { labelPlanet } from '../../i18n/astroLabels';

/** Traditional order, ascendant first — house contacts anchor to it. */
const CHIP_ORDER = ['Ascendant', 'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

/**
 * Theme-aware palette. Matching contacts draw as bold gold lines, straining
 * ones as thin dotted red — the line style itself carries the verdict, so the
 * picture stays legible even for colour-blind readers.
 */
const VALENCE_DARK = { supportive: '#f5c518', adverse: '#f87171', neutral: '#818cf8' } as const;
const VALENCE_LIGHT = { supportive: '#b8860b', adverse: '#dc2626', neutral: '#6366f1' } as const;
const valColor = (v: SynastryContact['valence'], isLight: boolean) =>
  (isLight ? VALENCE_LIGHT : VALENCE_DARK)[v];

/** How many contacts the picture shows. More becomes yarn, not information. */
const MAX_CONTACTS = 10;

/**
 * Which orb a contact's target anchors to. House targets anchor to the
 * ascendant — houses are counted from it, so "your 6th house" is a statement
 * about the ascendant's frame.
 */
function targetChip(target: string): string {
  const lordMatch = target.match(/^(\w+) \(7th lord\)$/);
  if (lordMatch) return lordMatch[1];
  if (/^\d+th house$/.test(target)) return 'Ascendant';
  return target;
}

/** Short plain-words label per engine contact type. */
const TYPE_KEY: Record<string, string> = {
  'node on 7th lord': 'match.web.type.nodeSeventhLord',
  'node on ascendant': 'match.web.type.nodeAscendant',
  'Moon on ascendant': 'match.web.type.moonAscendant',
  'Saturn on Moon/Venus': 'match.web.type.saturnPress',
  'Saturn opposite Moon/Venus': 'match.web.type.saturnPress',
  'graha in dusthana': 'match.web.type.hardHouse',
  'malefic in 7th house': 'match.web.type.marriageHouse',
  '7th lord to 7th lord': 'match.web.type.axisLink',
  'Venus–Mars cross contact': 'match.web.type.attraction',
  'Venus–Mars opposition': 'match.web.type.attraction',
  'Moon opposite Moon': 'match.web.type.moonPolarity',
  'luminary to luminary': 'match.web.type.luminary',
  'Jupiter to Moon/ascendant': 'match.web.type.protection',
  'benefic in supportive house': 'match.web.type.gentleHouse',
};

interface Placed {
  contact: SynastryContact;
  fromChip: string;
  toChip: string;
  /** True when the mover belongs to the left ("you") column. */
  leftToRight: boolean;
  rank: number;
}

type Side = 'left' | 'right';
interface Focus { side: Side; name: string }
interface V3 { x: number; y: number; z: number }

const chipOf = (p: Placed, side: Side) =>
  (side === 'left') === p.leftToRight ? p.fromChip : p.toChip;

// ── Scene geometry ───────────────────────────────────────────────────────────

const RING_X = 0.8;   // each chart's ring sits on one side of the cube
const RING_R = 0.62;
const CUBE_H = 1.0;   // half-edge of the wireframe cube
const FOCAL = 3.6;

function ringPos(side: Side, idx: number): V3 {
  const a = (idx / CHIP_ORDER.length) * Math.PI * 2;
  return { x: side === 'left' ? -RING_X : RING_X, y: RING_R * Math.cos(a), z: RING_R * Math.sin(a) };
}

/** Spin about the vertical axis, then tilt toward the viewer. */
function rotate(p: V3, spin: number, tilt: number): V3 {
  const cs = Math.cos(spin), sn = Math.sin(spin);
  const x = p.x * cs + p.z * sn;
  const z0 = -p.x * sn + p.z * cs;
  const ct = Math.cos(tilt), st = Math.sin(tilt);
  return { x, y: p.y * ct - z0 * st, z: p.y * st + z0 * ct };
}

function bez(a: V3, b: V3, c: V3, d: V3, t: number): V3 {
  const u = 1 - t;
  const w0 = u * u * u, w1 = 3 * u * u * t, w2 = 3 * u * t * t, w3 = t * t * t;
  return {
    x: w0 * a.x + w1 * b.x + w2 * c.x + w3 * d.x,
    y: w0 * a.y + w1 * b.y + w2 * c.y + w3 * d.y,
    z: w0 * a.z + w1 * b.z + w2 * c.z + w3 * d.z,
  };
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
/** Far things fade — the cheap cue that sells the depth. */
const depthFade = (s: number) => 0.35 + 0.65 * clamp01((s - 0.7) / 0.8);
/** Spring overshoot for the orb entrance. */
const backOut = (t: number) => { const c = 1.70158; const u = t - 1; return 1 + (c + 1) * u * u * u + c * u * u; };

const CUBE_EDGES: Array<[V3, V3]> = (() => {
  const v = (x: number, y: number, z: number): V3 => ({ x: x * CUBE_H, y: y * CUBE_H, z: z * CUBE_H });
  const edges: Array<[V3, V3]> = [];
  for (const y of [-1, 1]) {
    edges.push([v(-1, y, -1), v(1, y, -1)], [v(1, y, -1), v(1, y, 1)], [v(1, y, 1), v(-1, y, 1)], [v(-1, y, 1), v(-1, y, -1)]);
  }
  for (const x of [-1, 1]) for (const z of [-1, 1]) edges.push([v(x, -1, z), v(x, 1, z)]);
  return edges;
})();

interface Ambient { x: number; y: number; z: number; vy: number; ph: number; sp: number; spark: boolean }

interface OrbHit { side: Side; name: string; x: number; y: number; r: number }
interface LineHit { i: number; pts: Array<[number, number]> }
type Pick = { type: 'orb'; side: Side; name: string } | { type: 'line'; i: number } | null;

/** The mono chalkboard theme renders everything static. */
function useMonoTheme(): boolean {
  const [mono, setMono] = useState(() => document.documentElement.classList.contains('theme-mono'));
  useEffect(() => {
    const obs = new MutationObserver(() =>
      setMono(document.documentElement.classList.contains('theme-mono')));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);
  return mono;
}

// ── The canvas scene, shared by the card and the full-screen pop-out ─────────

interface SceneProps {
  visible: Placed[];
  selected: number | null;
  focus: Focus | null;
  onPick: (pick: Pick) => void;
  isLight: boolean;
  staticMode: boolean;
  chipLabels: Record<string, string>;
  youLabel: string;
  partnerLabel: string;
  ariaLabel: string;
  /** Card sits in the report flow; full fills the pop-out overlay. */
  variant: 'card' | 'full';
  className: string;
}

const CubeScene: React.FC<SceneProps> = (props) => {
  const { staticMode, variant } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  const accentRef = useRef('#8b5cf6');
  useEffect(() => {
    accentRef.current = getComputedStyle(document.documentElement).getPropertyValue('--c-accent').trim() || '#8b5cf6';
  });

  const poseRef = useRef({ spin: -0.9, tilt: -0.3, dragging: false, lastInteraction: 0 });
  const hitsRef = useRef<{ orbs: OrbHit[]; lines: LineHit[] }>({ orbs: [], lines: [] });
  const redrawRef = useRef<() => void>(() => {});
  const ambientRef = useRef<Ambient[] | null>(null);
  if (!ambientRef.current) {
    ambientRef.current = Array.from({ length: variant === 'full' ? 150 : 90 }, () => ({
      x: (Math.random() * 2 - 1) * CUBE_H,
      y: (Math.random() * 2 - 1) * CUBE_H,
      z: (Math.random() * 2 - 1) * CUBE_H,
      vy: 0.02 + Math.random() * 0.05,
      ph: Math.random() * Math.PI * 2,
      sp: 0.5 + Math.random() * 1.4,
      spark: Math.random() < 0.08,
    }));
  }

  useEffect(() => {
    const canvas = canvasRef.current, wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = { w: 0, h: 0 };
    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      size.w = wrap.clientWidth; size.h = wrap.clientHeight;
      canvas.width = Math.round(size.w * dpr);
      canvas.height = Math.round(size.h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    fit();

    const drawFrame = (time: number) => {
      const { visible, selected, focus, isLight, chipLabels, youLabel, partnerLabel } = propsRef.current;
      const { spin, tilt } = poseRef.current;
      const w = size.w, h = size.h;
      if (w === 0 || h === 0) return;
      const cx = w / 2, cy = h / 2 + 4;
      const unit = Math.min(w * 0.36, h * 0.36);
      const labelFont = Math.min(12.5, Math.max(9, unit * 0.072));
      const proj = (p: V3) => {
        const q = rotate(p, spin, tilt);
        const s = FOCAL / (FOCAL - q.z);
        return { x: cx + q.x * unit * s, y: cy - q.y * unit * s, s, z: q.z };
      };
      ctx.clearRect(0, 0, w, h);
      hitsRef.current = { orbs: [], lines: [] };

      const chipColor = (name: string) =>
        name === 'Ascendant' ? accentRef.current : planetDisplayColor(name.toUpperCase(), isLight);

      // Which orbs carry at least one visible contact, and which are lit by
      // the current selection.
      const active = { left: new Set<string>(), right: new Set<string>() };
      for (const p of visible) {
        active.left.add(chipOf(p, 'left'));
        active.right.add(chipOf(p, 'right'));
      }
      const lit = { left: new Set<string>(), right: new Set<string>() };
      if (selected != null && visible[selected]) {
        const p = visible[selected];
        lit.left.add(chipOf(p, 'left'));
        lit.right.add(chipOf(p, 'right'));
      }

      // ── Cube wireframe ──
      ctx.lineWidth = 1;
      for (const [a, b] of CUBE_EDGES) {
        const pa = proj(a), pb = proj(b);
        const fade = depthFade((pa.s + pb.s) / 2);
        ctx.globalAlpha = isLight ? 0.05 + 0.08 * fade : 0.06 + 0.12 * fade;
        ctx.strokeStyle = isLight ? '#475569' : '#7c8cf8';
        ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y); ctx.stroke();
      }

      // ── Ambient dust, with occasional bright sparks ──
      for (const a of ambientRef.current!) {
        const span = 2 * CUBE_H;
        const py = ((a.y + CUBE_H - time * a.vy) % span + span) % span - CUBE_H;
        const p = proj({ x: a.x, y: py, z: a.z });
        const tw = 0.5 + 0.5 * Math.sin(time * a.sp + a.ph);
        const base = (isLight ? 0.15 : 0.2) * (0.35 + 0.65 * tw) * depthFade(p.s);
        ctx.globalAlpha = a.spark ? Math.min(1, base * 1.8) : base;
        ctx.fillStyle = a.spark ? accentRef.current : (isLight ? '#64748b' : '#ffffff');
        ctx.beginPath(); ctx.arc(p.x, p.y, (a.spark ? 1.9 : 1.1) * p.s, 0, Math.PI * 2); ctx.fill();
      }

      // ── Contact arcs: neon tube (glow → colour → white-hot core) ──
      const N = 30;
      visible.forEach((p, i) => {
        const from = ringPos(p.leftToRight ? 'left' : 'right', CHIP_ORDER.indexOf(p.fromChip));
        const to = ringPos(p.leftToRight ? 'right' : 'left', CHIP_ORDER.indexOf(p.toChip));
        // Each arc bows through the interior on its own offset so overlapping
        // contacts separate in space instead of stacking.
        const lift = (i % 2 ? -1 : 1) * (0.14 + 0.07 * (i % 3));
        const cp1: V3 = { x: from.x * 0.32, y: from.y * 0.32 + lift, z: from.z * 0.32 + lift * 0.6 };
        const cp2: V3 = { x: to.x * 0.32, y: to.y * 0.32 + lift, z: to.z * 0.32 - lift * 0.6 };

        const grow = staticMode ? 1 : clamp01((time - 0.3 - i * 0.14) / 0.6);
        if (grow <= 0) return;

        const pts: Array<{ x: number; y: number; s: number }> = [];
        const shown = Math.max(2, Math.ceil(N * grow));
        for (let k = 0; k <= shown; k++) pts.push(proj(bez(from, cp1, cp2, to, k / N)));

        const color = valColor(p.contact.valence, isLight);
        const dim = selected != null && selected !== i;
        const isSel = selected === i;
        const isAdverse = p.contact.valence === 'adverse';
        // A slow breathing pulse keeps the web feeling alive without motion sickness.
        const pulse = staticMode || dim ? 1 : 0.9 + 0.1 * Math.sin(time * 1.7 + i * 1.9);
        const base = (dim ? 0.05 : isSel ? 1 : 0.55) * pulse;
        const hitPts: Array<[number, number]> = [];

        if (isAdverse) {
          // ── Not matching: a thin dotted red line ──
          // Dots spaced evenly in screen pixels along the arc; rank shows in
          // dot size rather than width so the line stays deliberately thin.
          const gapPx = 7;
          let carry = 0;
          ctx.fillStyle = color;
          for (let k = 1; k < pts.length; k++) {
            const a = pts[k - 1], b = pts[k];
            const segLen = Math.hypot(b.x - a.x, b.y - a.y) || 0.0001;
            let d = gapPx - carry;
            while (d <= segLen) {
              const tt = d / segLen;
              const x = a.x + (b.x - a.x) * tt, y = a.y + (b.y - a.y) * tt;
              const s = a.s + (b.s - a.s) * tt;
              const fade = depthFade(s);
              const r = (isSel ? 1.9 : 1.0 + p.rank * 0.6) * s;
              ctx.globalAlpha = base * fade * 0.95;
              if (isSel) { ctx.shadowColor = color; ctx.shadowBlur = 6 * s; }
              ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
              ctx.shadowBlur = 0;
              hitPts.push([x, y]);
              d += gapPx;
            }
            carry = (carry + segLen) % gapPx;
          }
        } else {
          // ── Matching: a bold gold neon tube (neutral keeps a slimmer one) ──
          const width = p.contact.valence === 'supportive' ? 1.9 + p.rank * 4 : 1.1 + p.rank * 2.6;
          for (let k = 0; k < pts.length - 1; k++) {
            const a = pts[k], b = pts[k + 1];
            const s = (a.s + b.s) / 2;
            const fade = depthFade(s);
            // Butt caps: round caps double-paint every joint into visible beads.
            ctx.lineCap = k === 0 || k === pts.length - 2 ? 'round' : 'butt';
            // Outer glow
            ctx.strokeStyle = color;
            ctx.globalAlpha = base * fade * (isSel ? 0.32 + 0.12 * Math.sin(time * 3) : 0.22);
            ctx.lineWidth = width * s * 3.2;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
            // Colour body
            ctx.globalAlpha = base * fade * 0.9;
            ctx.lineWidth = width * s;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
            // White-hot core
            ctx.strokeStyle = isLight ? '#ffffff' : '#fffbe8';
            ctx.globalAlpha = base * fade * 0.5;
            ctx.lineWidth = width * s * 0.34;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
            if (k % 2 === 0) hitPts.push([a.x, a.y]);
          }
        }
        if (!dim) hitsRef.current.lines.push({ i, pts: hitPts });

        // Comet head leading the draw-in.
        if (!staticMode && grow < 1) {
          const head = pts[pts.length - 1];
          ctx.globalAlpha = depthFade(head.s);
          ctx.shadowColor = color; ctx.shadowBlur = 12 * head.s;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath(); ctx.arc(head.x, head.y, (2.2 + p.rank * 2.5) * head.s, 0, Math.PI * 2); ctx.fill();
          ctx.shadowBlur = 0;
        }

        // Static frames get an arrowhead where the particle flow would be.
        if (staticMode && pts.length > 18) {
          const a = pts[16], b = pts[17];
          const ang = Math.atan2(b.y - a.y, b.x - a.x);
          const L = 7 * a.s;
          ctx.globalAlpha = base * depthFade(a.s);
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.moveTo(b.x, b.y);
          ctx.lineTo(b.x - L * Math.cos(ang - 0.45), b.y - L * Math.sin(ang - 0.45));
          ctx.lineTo(b.x - L * Math.cos(ang + 0.45), b.y - L * Math.sin(ang + 0.45));
          ctx.closePath(); ctx.fill();
        }

        // ── Particles flowing mover → receiver, with comet tails ──
        // The dotted adverse line keeps them sparse and small so the moving
        // dots stay distinguishable from the static ones.
        if (!staticMode && grow >= 1) {
          const count = isAdverse ? 2 : 3 + Math.min(3, Math.round(p.rank * 4));
          const speed = 0.1 + 0.11 * p.rank;
          for (let j = 0; j < count; j++) {
            const ft = (j / count + time * speed) % 1;
            const fadeEnds = Math.pow(Math.sin(Math.PI * ft), 0.7);
            const headA = (dim ? 0.1 : 1) * fadeEnds;
            for (const [dt, sc, aMul] of [[0, 1, 1], [0.016, 0.72, 0.45], [0.032, 0.5, 0.2]] as const) {
              const tt = ft - dt;
              if (tt <= 0) continue;
              const q = proj(bez(from, cp1, cp2, to, tt));
              const glowA = headA * aMul * depthFade(q.s);
              const r = (1.5 + p.rank * 2.2) * q.s * sc * (isAdverse ? 0.75 : 1);
              ctx.globalAlpha = glowA * 0.9;
              ctx.shadowColor = color; ctx.shadowBlur = 8 * q.s;
              ctx.fillStyle = color;
              ctx.beginPath(); ctx.arc(q.x, q.y, r, 0, Math.PI * 2); ctx.fill();
              ctx.shadowBlur = 0;
              if (dt === 0) {
                ctx.globalAlpha = glowA * 0.85;
                ctx.fillStyle = '#ffffff';
                ctx.beginPath(); ctx.arc(q.x, q.y, r * 0.45, 0, Math.PI * 2); ctx.fill();
              }
            }
          }
        }
      });

      // ── Planet orbs, far to near ──
      const orbs = ([] as Array<{ side: Side; name: string; idx: number }>).concat(
        CHIP_ORDER.map((name, idx) => ({ side: 'left' as Side, name, idx })),
        CHIP_ORDER.map((name, idx) => ({ side: 'right' as Side, name, idx })),
      )
        .map(o => ({ ...o, p: proj(ringPos(o.side, o.idx)) }))
        .sort((a, b) => a.p.z - b.p.z);

      for (const o of orbs) {
        const color = chipColor(o.name);
        const isOn = (o.side === 'left' ? active.left : active.right).has(o.name);
        const isFocused = focus != null && focus.side === o.side && focus.name === o.name;
        const isLit = (o.side === 'left' ? lit.left : lit.right).has(o.name);
        let alpha = isOn ? 1 : 0.28;
        if (selected != null) alpha = isLit ? 1 : 0.22;
        if (focus != null) alpha = isFocused || isOn ? 1 : 0.22;
        const appear = staticMode ? 1 : clamp01((time - 0.04 - o.idx * 0.045) / 0.45);
        alpha *= clamp01(appear * 2) * (0.55 + 0.45 * depthFade(o.p.s));
        if (alpha <= 0.01) continue;

        const pop = staticMode ? 1 : backOut(appear);
        const r = unit * 0.068 * o.p.s * (0.55 + 0.45 * pop);
        ctx.globalAlpha = alpha;
        if (isFocused) {
          ctx.strokeStyle = color; ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(o.p.x, o.p.y, r + 5 + (staticMode ? 0 : Math.sin(time * 3) * 1.6), 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.shadowColor = color; ctx.shadowBlur = (isOn ? 16 : 6) * o.p.s;
        const g = ctx.createRadialGradient(o.p.x - r * 0.3, o.p.y - r * 0.3, r * 0.1, o.p.x, o.p.y, r);
        g.addColorStop(0, isLight ? '#ffffff' : '#e8eaff');
        g.addColorStop(0.35, color);
        g.addColorStop(1, isLight ? color : '#0b0f1e');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(o.p.x, o.p.y, r, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;

        const glyph = PLANET_SYMBOLS[o.name.toUpperCase()] ?? 'Asc';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.font = `700 ${(o.name === 'Ascendant' ? r * 0.62 : r * 1.05)}px system-ui, sans-serif`;
        ctx.fillText(glyph, o.p.x, o.p.y + 0.5);

        // Labels radiate outward from the ring's centre so neighbouring
        // orbs' labels diverge instead of colliding at edge-on angles.
        const rc = proj({ x: o.side === 'left' ? -RING_X : RING_X, y: 0, z: 0 });
        const dx = o.p.x - rc.x, dy = o.p.y - rc.y;
        const dl = Math.hypot(dx, dy) || 1;
        ctx.globalAlpha = alpha * 0.8;
        ctx.fillStyle = isOn || isFocused ? color : (isLight ? '#94a3b8' : 'rgba(255,255,255,0.4)');
        ctx.font = `600 ${labelFont * o.p.s}px system-ui, sans-serif`;
        ctx.fillText(chipLabels[o.name], o.p.x + (dx / dl) * (r + 11 * o.p.s), o.p.y + (dy / dl) * (r + 11 * o.p.s) + 3);

        hitsRef.current.orbs.push({ side: o.side, name: o.name, x: o.p.x, y: o.p.y, r });
      }

      // ── Column titles, floating above each ring ──
      ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      for (const [side, label] of [['left', youLabel], ['right', partnerLabel]] as Array<[Side, string]>) {
        const p = proj({ x: side === 'left' ? -RING_X : RING_X, y: 0.98, z: 0 });
        ctx.globalAlpha = 0.55 + 0.35 * depthFade(p.s);
        ctx.fillStyle = isLight ? '#475569' : 'rgba(255,255,255,0.65)';
        ctx.font = `700 ${Math.min(13, Math.max(9.5, unit * 0.06)) * p.s}px system-ui, sans-serif`;
        ctx.fillText(label.toUpperCase(), p.x, p.y);
      }
      ctx.globalAlpha = 1;
    };

    const tState = { t: 0 };
    redrawRef.current = () => drawFrame(tState.t);

    const ro = new ResizeObserver(() => { fit(); drawFrame(tState.t); });
    ro.observe(wrap);

    let raf = 0;
    if (!staticMode) {
      let last = performance.now();
      const loop = (now: number) => {
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        tState.t += dt;
        const pose = poseRef.current;
        const { selected, focus } = propsRef.current;
        // Hold still while the reader is inspecting something.
        const inspecting = selected != null || focus != null;
        if (!pose.dragging && !inspecting && now - pose.lastInteraction > 2200) pose.spin += dt * 0.1;
        drawFrame(tState.t);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    } else {
      drawFrame(0);
    }
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [staticMode]);

  // Static mode repaints on every state/theme change instead of via the loop.
  useEffect(() => { if (staticMode) redrawRef.current(); });

  // ── Pointer: drag rotates, a click (no drag) selects ──
  const pointer = useRef({ x: 0, y: 0, moved: false, frame: false });
  const localXY = (e: React.PointerEvent) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };
  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
    const { x, y } = localXY(e);
    pointer.current = { x, y, moved: false, frame: false };
    poseRef.current.dragging = true;
    poseRef.current.lastInteraction = performance.now();
  };
  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!poseRef.current.dragging) return;
    const { x, y } = localXY(e);
    const dx = x - pointer.current.x, dy = y - pointer.current.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) pointer.current.moved = true;
    pointer.current.x = x; pointer.current.y = y;
    poseRef.current.spin += dx * 0.006;
    poseRef.current.tilt = Math.max(-0.85, Math.min(0.05, poseRef.current.tilt - dy * 0.004));
    poseRef.current.lastInteraction = performance.now();
    if (staticMode && !pointer.current.frame) {
      pointer.current.frame = true;
      requestAnimationFrame(() => { pointer.current.frame = false; redrawRef.current(); });
    }
  };
  const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    poseRef.current.dragging = false;
    poseRef.current.lastInteraction = performance.now();
    if (pointer.current.moved) return;
    const { x, y } = localXY(e);
    for (const o of hitsRef.current.orbs) {
      if (Math.hypot(x - o.x, y - o.y) <= o.r + 5) {
        propsRef.current.onPick({ type: 'orb', side: o.side, name: o.name });
        return;
      }
    }
    let best: number | null = null, bd = 11;
    for (const L of hitsRef.current.lines) {
      for (const [px, py] of L.pts) {
        const d = Math.hypot(x - px, y - py);
        if (d < bd) { bd = d; best = L.i; }
      }
    }
    propsRef.current.onPick(best != null ? { type: 'line', i: best } : null);
  };

  return (
    <div ref={wrapRef} className={props.className}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={props.ariaLabel}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        style={{ touchAction: variant === 'full' ? 'none' : 'pan-y' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => { poseRef.current.dragging = false; }}
      />
    </div>
  );
};

// ── The contact sentences, shared by the card and the pop-out ────────────────

const ContactRows: React.FC<{
  contacts: Placed[];
  selected: number | null;
  onSelect: (i: number) => void;
  isLight: boolean;
}> = ({ contacts, selected, onSelect, isLight }) => {
  const { lang, t } = useLang();
  const plainType = (c: SynastryContact) => t((TYPE_KEY[c.type] ?? 'match.web.type.other') as 'match.web.type.other');
  const faint = isLight ? 'rgba(15,23,42,0.1)' : 'rgba(255,255,255,0.07)';
  return (
    <div className="space-y-1.5">
      {contacts.map((p, i) => {
        const c = p.contact;
        const color = valColor(c.valence, isLight);
        const isSel = selected === i;
        return (
          <motion.button
            key={`${c.direction}-${c.graha}-${c.type}-${c.target}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.08 }}
            onClick={() => onSelect(i)}
            aria-pressed={isSel}
            className="w-full text-left rounded-lg px-3 py-2 transition-colors"
            style={{
              // The left edge repeats the line language: solid gold for a
              // matching contact, dotted red for a straining one.
              borderStyle: `solid solid solid ${c.valence === 'adverse' ? 'dotted' : 'solid'}`,
              borderWidth: '1px 1px 1px 3px',
              borderColor: isSel
                ? `${color} ${color} ${color} ${color}`
                : `${faint} ${faint} ${faint} ${color}`,
              background: isSel
                ? `${color}14`
                : isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)',
            }}
          >
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11.5px] font-bold" style={{ color }}>
                {labelPlanet(c.graha.toUpperCase(), lang)} → {c.target}
              </span>
              <span className="text-[9.5px] px-1.5 py-0.5 rounded-full font-semibold uppercase tracking-wide"
                style={{ background: `${color}1c`, color }}>
                {plainType(c)}
              </span>
              <span className="ml-auto text-[9.5px] font-mono text-white/30">
                {p.leftToRight ? t('match.web.yourSide') : t('match.web.partnerSide')}
                {c.orb != null ? ` · ${formatOrb(c.orb)}` : ''}
              </span>
            </div>
            {isSel && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="text-[11.5px] text-white/70 leading-relaxed mt-1.5 overflow-hidden"
              >
                {c.interpretation}
              </motion.p>
            )}
          </motion.button>
        );
      })}
    </div>
  );
};

// ── The section ──────────────────────────────────────────────────────────────

export const SynastryWeb: React.FC<{ synastry: SynastryResult }> = ({ synastry }) => {
  const isLight = useTheme();
  const mono = useMonoTheme();
  const reduced = useReducedMotion();
  const staticMode = mono || !!reduced;
  const { lang, t } = useLang();

  const [selected, setSelected] = useState<number | null>(null);
  const [focus, setFocus] = useState<Focus | null>(null);
  const [filter, setFilter] = useState<'all' | 'supportive' | 'adverse'>('all');
  const [expanded, setExpanded] = useState(false);

  const placed = useMemo<Placed[]>(() => {
    const all = [...synastry.aToB.contacts, ...synastry.bToA.contacts]
      .map(contact => ({
        contact,
        fromChip: contact.graha,
        toChip: targetChip(contact.target),
        leftToRight: contact.direction === 'a-to-b',
        rank: contactRank(contact),
      }))
      .sort((x, y) => y.rank - x.rank);
    return all.slice(0, MAX_CONTACTS);
  }, [synastry]);

  const visible = useMemo(() =>
    placed.filter(p =>
      (filter === 'all' || p.contact.valence === filter)
      && (!focus || chipOf(p, focus.side) === focus.name)),
    [placed, filter, focus]);

  const supportiveCount = placed.filter(p => p.contact.valence === 'supportive').length;
  const adverseCount = placed.filter(p => p.contact.valence === 'adverse').length;

  const chipLabels = useMemo(() => {
    const m: Record<string, string> = {};
    for (const name of CHIP_ORDER) {
      m[name] = name === 'Ascendant' ? t('match.web.asc') : labelPlanet(name.toUpperCase(), lang);
    }
    return m;
  }, [lang, t]);

  const onPick = (pick: Pick) => {
    if (pick == null) { setSelected(null); return; }
    if (pick.type === 'orb') {
      setSelected(null);
      setFocus(f => (f && f.side === pick.side && f.name === pick.name ? null : { side: pick.side, name: pick.name }));
    } else {
      setSelected(sel => (sel === pick.i ? null : pick.i));
    }
  };
  const toggleFilter = (v: 'supportive' | 'adverse') => {
    setSelected(null);
    setFilter(f => (f === v ? 'all' : v));
  };
  const selectRow = (i: number) => setSelected(sel => (sel === i ? null : i));

  // The pop-out: lock body scroll, close on Escape.
  useEffect(() => {
    if (!expanded) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setExpanded(false); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [expanded]);

  const sceneProps = {
    visible, selected, focus, onPick, isLight, staticMode, chipLabels,
    youLabel: t('match.web.you'), partnerLabel: t('match.web.partner'),
    ariaLabel: t('match.web.aria'),
  };

  const legend = (
    <>
      {([['supportive', supportiveCount, t('match.web.helpCount', { n: supportiveCount })],
         ['adverse', adverseCount, t('match.web.strainCount', { n: adverseCount })]] as Array<['supportive' | 'adverse', number, string]>)
        .map(([v, count, label]) => (
          <button
            key={v}
            onClick={() => toggleFilter(v)}
            disabled={count === 0}
            aria-pressed={filter === v}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-colors disabled:opacity-40 disabled:cursor-default"
            style={{
              borderColor: filter === v ? valColor(v, isLight) : 'transparent',
              background: `${valColor(v, isLight)}${filter === v ? '24' : '0f'}`,
            }}
          >
            {v === 'supportive'
              ? <span className="w-4 h-1.5 rounded-full" style={{ background: valColor(v, isLight) }} />
              : <span className="w-4 border-t-2 border-dotted" style={{ borderColor: valColor(v, isLight) }} />}
            <span className="text-white/65">{label}</span>
          </button>
        ))}
      {focus && (
        <button
          onClick={() => setFocus(null)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full border text-white/70"
          style={{ borderColor: 'rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)' }}
        >
          ✕ {chipLabels[focus.name]}
        </button>
      )}
    </>
  );

  return (
    <div>
      <div className="flex items-center gap-2 mb-2 text-[11px] flex-wrap">
        {legend}
        <span className="ml-auto text-white/35 hidden sm:inline">{t('match.web.dragHint')}</span>
      </div>

      <div className="relative">
        {!expanded && <CubeScene {...sceneProps} variant="card" className="w-full h-[340px] sm:h-[440px]" />}
        {!expanded && (
          <button
            onClick={() => setExpanded(true)}
            aria-label={t('match.web.expand')}
            title={t('match.web.expand')}
            className="absolute top-2 right-2 p-2 rounded-lg border transition-colors"
            style={{
              borderColor: isLight ? 'rgba(15,23,42,0.12)' : 'rgba(255,255,255,0.14)',
              background: isLight ? 'rgba(255,255,255,0.75)' : 'rgba(11,15,30,0.6)',
              color: isLight ? '#334155' : 'rgba(255,255,255,0.75)',
            }}
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="mt-3">
        <ContactRows contacts={visible} selected={selected} onSelect={selectRow} isLight={isLight} />
      </div>

      {/* Full-screen pop-out. Portaled to <body>: the glass-card's
          backdrop-filter would otherwise trap position:fixed. */}
      {expanded && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t('match.webTitle')}
          className="fixed inset-0 z-[80] flex flex-col"
          style={{ background: isLight ? '#f8fafc' : '#070914' }}
        >
          <div className="flex items-center gap-2 px-4 sm:px-6 pt-4 pb-2 flex-wrap">
            <div className="mr-2">
              <h3 className="text-sm font-semibold" style={{ color: isLight ? '#0f172a' : '#ffffff' }}>
                {t('match.webTitle')}
              </h3>
              <p className="text-[11px]" style={{ color: isLight ? '#64748b' : 'rgba(255,255,255,0.4)' }}>
                {t('match.web.dragHint')}
              </p>
            </div>
            <div className="flex items-center gap-2 text-[11px] flex-wrap">{legend}</div>
            <button
              onClick={() => setExpanded(false)}
              aria-label={t('match.web.close')}
              className="ml-auto p-2 rounded-lg border transition-colors"
              style={{
                borderColor: isLight ? 'rgba(15,23,42,0.12)' : 'rgba(255,255,255,0.14)',
                color: isLight ? '#334155' : 'rgba(255,255,255,0.75)',
              }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-3 px-3 sm:px-6 pb-4">
            <CubeScene {...sceneProps} variant="full" className="flex-1 min-h-0" />
            <div className="lg:w-[360px] shrink-0 overflow-y-auto min-h-0 max-h-[34vh] lg:max-h-none">
              <ContactRows contacts={visible} selected={selected} onSelect={selectRow} isLight={isLight} />
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
};
