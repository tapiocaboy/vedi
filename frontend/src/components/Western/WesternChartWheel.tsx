/**
 * The Western birth-chart wheel — a circular SVG chart, the Western
 * counterpart to the Vedic North/South Indian square charts. Sign ring on the
 * outside, unequal Placidus house-cusp spokes inside it, planets placed by
 * exact tropical longitude, and the aspect grid drawn as lines through the
 * centre.
 *
 * Every planet, house, sign, and angle is clickable — a reader with no
 * astrology background can tap the thing they're curious about and get the
 * same click-to-expand reading the Natal Chart modal has, without first
 * having to know that modal exists. Content is looked up from a natal report
 * built once per chart/language (a pure, synchronous computation — cheap
 * enough to build eagerly rather than on demand).
 */

import { useMemo, useState } from 'react';
import type { WesternChart, WesternPlanetPosition, AspectHit } from '../../types/westernAstrology';
import {
  SIGN_GLYPHS, SIGNS, signElement, signModality, westernModalityLabel, MODERN_RULER, TRADITIONAL_RULER,
} from '../../lib/core/western/signs';
import { westernPlanetName, westernPlanetGlyph, westernPlanetColor } from '../../lib/core/western/text/planetText';
import { SIGN_ESSENCE } from '../../lib/core/western/text/signText';
import { buildWesternNatalReport, type WesternNatalLine } from '../../lib/core/western/natal';
import { pick, type Lang } from '../../lib/core/i18n';
import { WesternDetailPanel, type DetailContent } from './WesternDetailPanel';
import { useTheme } from '../../hooks/useTheme';
import { useLang } from '../../i18n/LanguageContext';
import { coreLang } from '../../i18n/translations';

const SIZE = 420;
const CX = SIZE / 2, CY = SIZE / 2;
const R_OUTER = 195;
const R_SIGN_IN = 165;
const R_HOUSE_LABEL = 148;
const R_CUSP_IN = 108;
const R_PLANET = 128;
const R_PLANET_FAR = 108;
const R_ASPECT = 108;

function toRad(deg: number): number { return (deg * Math.PI) / 180; }
function mod360(x: number): number { return ((x % 360) + 360) % 360; }

/** Ascendant fixed at the 9 o'clock point; longitude increases counter-clockwise from there. */
function screenAngle(longitude: number, ascLongitude: number): number {
  return mod360(180 + (longitude - ascLongitude));
}
function pointAt(longitude: number, ascLongitude: number, radius: number): { x: number; y: number } {
  const th = toRad(screenAngle(longitude, ascLongitude));
  return { x: CX + radius * Math.cos(th), y: CY - radius * Math.sin(th) };
}

const ASPECT_STROKE: Record<AspectHit['type'], { color: string; dash?: string }> = {
  conjunction: { color: '#94a3b8' },
  sextile: { color: '#34d399' },
  trine: { color: '#22c55e' },
  square: { color: '#f43f5e' },
  opposition: { color: '#f43f5e', dash: '2 3' },
  quincunx: { color: '#f59e0b', dash: '1 3' },
};

/** Two alternating radii for planets whose longitudes sit within this many degrees of the previous one. */
const COLLISION_GAP = 7;

function placePlanets(planets: WesternPlanetPosition[], ascLongitude: number) {
  const sorted = [...planets].sort((a, b) => a.longitude - b.longitude);
  let lastLon: number | null = null;
  let far = false;
  return sorted.map(p => {
    const gap = lastLon == null ? Infinity : Math.min(mod360(p.longitude - lastLon), mod360(lastLon - p.longitude));
    if (gap < COLLISION_GAP) far = !far; else far = false;
    lastLon = p.longitude;
    return { planet: p, ...pointAt(p.longitude, ascLongitude, far ? R_PLANET_FAR : R_PLANET) };
  });
}

type Selection =
  | { kind: 'line'; id: string }
  | { kind: 'sign'; index: number };

/** A `WesternNatalLine`'s fields are a superset of `DetailContent`'s — only the icon needs converting from a raw key ('SUN', a house number) to a rendered glyph. */
function lineToContent(line: WesternNatalLine): DetailContent {
  const icon = /^\d+$/.test(line.icon) ? line.icon : westernPlanetGlyph(line.icon);
  return { icon, title: line.title, subtitle: line.subtitle, badges: line.badges, summary: line.summary, sections: line.sections };
}

function rulerNote(sign: number, lang: Lang): string {
  const modern = MODERN_RULER[sign];
  const trad = TRADITIONAL_RULER[sign];
  const modernLabel = westernPlanetName(modern, lang);
  if (modern === trad) return modernLabel;
  const tradLabel = westernPlanetName(trad, lang);
  return lang === 'si' ? `${modernLabel} (සම්ප්‍රදායිකව ${tradLabel})` : `${modernLabel} (traditionally ${tradLabel})`;
}

function signContent(index: number, lang: Lang): DetailContent {
  const el = signElement(index);
  const mod = westernModalityLabel(signModality(index));
  return {
    icon: SIGN_GLYPHS[index],
    title: SIGNS[index],
    subtitle: `${el} · ${mod}`,
    badges: [{ label: el, tone: 'info' }, { label: mod, tone: 'info' }],
    summary: pick(SIGN_ESSENCE[index], lang),
    sections: [{
      heading: pick({ en: 'Ruling planet', si: 'අධිපති ග්‍රහයා' }, lang),
      body: pick({
        en: `${rulerNote(index, lang)} rules ${SIGNS[index]} — wherever this sign sits in a chart, that planet colours how its themes play out.`,
        si: `${SIGNS[index]} ${rulerNote(index, lang)} විසින් පාලනය කරනු ලැබේ — කේන්දරයේ මෙම රාශිය කවර භාවයක පිහිටියත්, එහි තේමා ප්‍රකාශ වන ආකාරය එම ග්‍රහයා විසින් වර්ණවත් කරයි.`,
      }, lang),
    }],
  };
}

interface Props { chart: WesternChart; minAspectStrength?: number }

export const WesternChartWheel: React.FC<Props> = ({ chart, minAspectStrength = 0.25 }) => {
  const isLight = useTheme();
  const { lang, t } = useLang();
  const ascLon = chart.ascendant.longitude;
  const [selection, setSelection] = useState<Selection | null>(null);

  const placedPlanets = useMemo(() => placePlanets(chart.planets, ascLon), [chart.planets, ascLon]);
  const planetPoint = useMemo(() => {
    const m = new Map<string, { x: number; y: number }>();
    for (const pp of placedPlanets) m.set(pp.planet.planet, pointAt(pp.planet.longitude, ascLon, R_ASPECT));
    return m;
  }, [placedPlanets, ascLon]);

  const natal = useMemo(() => buildWesternNatalReport(chart, coreLang(lang)), [chart, lang]);
  const lineById = useMemo(() => new Map(natal.lines.map(l => [l.id, l])), [natal]);

  const content = useMemo<DetailContent | null>(() => {
    if (!selection) return null;
    if (selection.kind === 'sign') return signContent(selection.index, coreLang(lang));
    const line = lineById.get(selection.id);
    return line ? lineToContent(line) : null;
  }, [selection, lineById, lang]);

  const ringStroke = isLight ? 'rgba(15,23,42,0.14)' : 'rgba(255,255,255,0.14)';
  const cuspStroke = isLight ? 'rgba(15,23,42,0.22)' : 'rgba(255,255,255,0.22)';
  const angularCuspStroke = 'var(--c-accent)';
  const bgFill = isLight ? '#ffffff' : 'rgba(255,255,255,0.02)';
  const signTextClr = isLight ? '#334155' : 'rgba(255,255,255,0.55)';
  const houseNumClr = isLight ? '#94a3b8' : 'rgba(255,255,255,0.32)';
  const hitFill = isLight ? 'rgba(15,23,42,0.035)' : 'rgba(255,255,255,0.035)';

  const shownAspects = chart.aspects.filter(a => a.strength >= minAspectStrength);

  const selectPlanet = (name: string) => setSelection({ kind: 'line', id: `planet-${name}` });
  const selectHouse = (num: number) => setSelection({ kind: 'line', id: `house-${num}` });
  const selectSign = (index: number) => setSelection({ kind: 'sign', index });
  const selectAngle = (label: 'ASC' | 'DESC' | 'MC' | 'IC') => {
    const id = label === 'ASC' ? 'rising' : label === 'DESC' ? 'house-7' : label === 'MC' ? 'house-10' : 'house-4';
    setSelection({ kind: 'line', id });
  };

  return (
    <div className="w-full flex flex-col items-center gap-2.5">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full max-w-[440px]" role="img" aria-label={t('western.chart.wheelTitle')}>
        <circle cx={CX} cy={CY} r={R_OUTER} fill={bgFill} stroke={ringStroke} strokeWidth={1} />
        <circle cx={CX} cy={CY} r={R_SIGN_IN} fill="none" stroke={ringStroke} strokeWidth={1} />
        <circle cx={CX} cy={CY} r={R_CUSP_IN} fill="none" stroke={ringStroke} strokeWidth={1} />

        {/* Sign ring: 12 boundaries + clickable glyphs */}
        {Array.from({ length: 12 }, (_, i) => {
          const boundary = i * 30;
          const b1 = pointAt(boundary, ascLon, R_SIGN_IN);
          const b2 = pointAt(boundary, ascLon, R_OUTER);
          const glyphPt = pointAt(boundary + 15, ascLon, (R_OUTER + R_SIGN_IN) / 2);
          return (
            <g key={`sign-${i}`}>
              <line x1={b1.x} y1={b1.y} x2={b2.x} y2={b2.y} stroke={ringStroke} strokeWidth={1} />
              <g
                onClick={() => selectSign(i)}
                className="cursor-pointer outline-none"
                role="button"
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') selectSign(i); }}
              >
                <circle cx={glyphPt.x} cy={glyphPt.y} r={13} fill={hitFill} />
                <text x={glyphPt.x} y={glyphPt.y} textAnchor="middle" dominantBaseline="central"
                  fontSize={15} fill={signTextClr} style={{ fontFamily: 'system-ui, sans-serif' }}>
                  {SIGN_GLYPHS[i]}
                </text>
              </g>
            </g>
          );
        })}

        {/* House cusps: unequal Placidus spokes, angular ones (1/4/7/10) highlighted, clickable numbers */}
        {chart.houses.map((h, i) => {
          const isAngular = h.house === 1 || h.house === 4 || h.house === 7 || h.house === 10;
          const p1 = pointAt(h.longitude, ascLon, R_CUSP_IN);
          const p2 = pointAt(h.longitude, ascLon, R_SIGN_IN);
          const next = chart.houses[(i + 1) % 12].longitude;
          const midLon = mod360(h.longitude + mod360(next - h.longitude) / 2);
          const labelPt = pointAt(midLon, ascLon, R_HOUSE_LABEL);
          const isSelected = selection?.kind === 'line' && selection.id === `house-${h.house}`;
          return (
            <g key={`house-${h.house}`}>
              <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                stroke={isAngular ? angularCuspStroke : cuspStroke} strokeWidth={isAngular ? 1.75 : 1} />
              <g
                onClick={() => selectHouse(h.house)}
                className="cursor-pointer outline-none"
                role="button"
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') selectHouse(h.house); }}
              >
                <circle cx={labelPt.x} cy={labelPt.y} r={11}
                  fill={isSelected ? 'rgba(var(--c-accent-rgb),0.22)' : hitFill}
                  stroke={isSelected ? 'var(--c-accent)' : 'none'} strokeWidth={1} />
                <text x={labelPt.x} y={labelPt.y} textAnchor="middle" dominantBaseline="central"
                  fontSize={10} fontWeight={700} fill={isSelected ? 'var(--c-accent)' : houseNumClr}>
                  {h.house}
                </text>
              </g>
            </g>
          );
        })}

        {/* Aspect lines through the centre */}
        {shownAspects.map((a, i) => {
          const p1 = planetPoint.get(a.bodyA), p2 = planetPoint.get(a.bodyB);
          if (!p1 || !p2) return null;
          const style = ASPECT_STROKE[a.type];
          return (
            <line key={`asp-${i}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
              stroke={style.color} strokeWidth={0.75 + a.strength * 1.25} strokeDasharray={style.dash}
              opacity={isLight ? 0.35 + a.strength * 0.35 : 0.3 + a.strength * 0.4} />
          );
        })}

        {/* Planet glyphs — clickable */}
        {placedPlanets.map(({ planet, x, y }) => {
          const color = westernPlanetColor(planet.planet, isLight);
          const isSelected = selection?.kind === 'line' && selection.id === `planet-${planet.planet}`;
          return (
            <g
              key={planet.planet}
              onClick={() => selectPlanet(planet.planet)}
              className="cursor-pointer outline-none"
              role="button"
              tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') selectPlanet(planet.planet); }}
            >
              <circle cx={x} cy={y} r={isSelected ? 13 : 11} fill={isLight ? '#ffffff' : '#0b0f1e'}
                stroke={color} strokeWidth={isSelected ? 2 : 1.25} />
              <text x={x} y={y + 0.5} textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700} fill={color}>
                {westernPlanetGlyph(planet.planet)}
              </text>
              <title>{`${westernPlanetName(planet.planet, coreLang(lang))} — ${SIGNS[planet.signIndex]} ${planet.degreeInSign.toFixed(1)}°, house ${planet.house}${planet.isRetrograde ? ' ℞' : ''}`}</title>
            </g>
          );
        })}

        {/* Angle markers (ASC/DESC/MC/IC) — clickable */}
        {(['ASC', 'DESC', 'MC', 'IC'] as const).map(label => {
          const lon = label === 'ASC' ? chart.ascendant.longitude
            : label === 'DESC' ? mod360(chart.ascendant.longitude + 180)
            : label === 'MC' ? chart.midheaven.longitude
            : mod360(chart.midheaven.longitude + 180);
          const pt = pointAt(lon, ascLon, R_OUTER + 12);
          return (
            <g
              key={label}
              onClick={() => selectAngle(label)}
              className="cursor-pointer outline-none"
              role="button"
              tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') selectAngle(label); }}
            >
              <circle cx={pt.x} cy={pt.y} r={10} fill={hitFill} />
              <text x={pt.x} y={pt.y} textAnchor="middle" dominantBaseline="central"
                fontSize={9} fontWeight={700} fill={isLight ? '#64748b' : 'rgba(255,255,255,0.4)'}>
                {label}
              </text>
            </g>
          );
        })}
      </svg>

      <p className="text-[11px] text-center" style={{ color: isLight ? '#94a3b8' : 'rgba(255,255,255,0.30)' }}>
        {t('western.chart.tapHint')}
      </p>

      <WesternDetailPanel content={content} onClose={() => setSelection(null)} />
    </div>
  );
};
