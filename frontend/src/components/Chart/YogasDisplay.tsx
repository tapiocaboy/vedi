import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, Star, TrendingUp, Shield, AlertTriangle, Loader2, type LucideIcon } from 'lucide-react';
import { getPlanetPositions, getYogas } from '../../services/api';
import type { BirthData, YogaResult } from '../../services/api';
import { useLang } from '../../i18n/LanguageContext';
import { labelPlanet, labelPlanetShort, labelYogaCategory, labelYogaStrength } from '../../i18n/astroLabels';
import { useTheme } from '../../hooks/useTheme';
import { PLANET_SYMBOLS, planetDisplayColor } from '../../types/astrology';

interface Props {
  birthData: BirthData;
}

type YogaCategory = YogaResult['category'];
type YogaStrength = YogaResult['strength'];

const CATEGORY_ORDER: YogaCategory[] = ['rajayoga', 'mahapurusha', 'dhana', 'spiritual', 'special', 'daridra'];

const CATEGORY_META: Record<YogaCategory, { accent: string; icon: LucideIcon }> = {
  rajayoga:    { accent: '#a78bfa', icon: Star },
  mahapurusha: { accent: '#c084fc', icon: Sparkles },
  dhana:       { accent: '#34d399', icon: TrendingUp },
  spiritual:   { accent: '#e879f9', icon: Sparkles },
  special:     { accent: '#818cf8', icon: Shield },
  daridra:     { accent: '#fb7185', icon: AlertTriangle },
};

const STRENGTH_ORDER: YogaStrength[] = ['very strong', 'strong', 'medium', 'weak'];

const STRENGTH_FILL: Record<YogaStrength, string> = {
  'very strong': '#a78bfa',
  strong: '#34d399',
  medium: '#fbbf24',
  weak: '#94a3b8',
};

const CX = 320;
const CY = 228;
const HOUSE_R = 188;
const PLANET_R = 132;

function strengthText(strength: YogaStrength, isLight: boolean): string {
  if (strength === 'very strong') return isLight ? '#6d28d9' : '#ddd6fe';
  if (strength === 'strong') return isLight ? '#047857' : '#6ee7b7';
  if (strength === 'medium') return isLight ? '#b45309' : '#fcd34d';
  return isLight ? '#64748b' : 'rgba(255,255,255,0.5)';
}

function yogaKey(y: YogaResult): string {
  return `${y.name}|${y.planetsInvolved.join('-')}|${y.housesInvolved.join('.')}|${y.strengthScore}`;
}

function byStrength(a: YogaResult, b: YogaResult): number {
  return b.strengthScore - a.strengthScore;
}

/** House 1 sits at the top; houses continue clockwise, the way a chart is read. */
function onRing(house: number, radius: number, fan = 0): { x: number; y: number } {
  const theta = ((house - 1) / 12) * Math.PI * 2 + fan;
  return { x: CX + Math.sin(theta) * radius, y: CY - Math.cos(theta) * radius };
}

type Seat = { planet: string; house: number; x: number; y: number };

function seatsFor(yoga: YogaResult): { planet: string; house: number }[] {
  const planets = yoga.planetsInvolved;
  const houses = yoga.housesInvolved.filter(h => h > 0);
  if (!planets.length) return [];
  if (planets.length === houses.length) return planets.map((planet, i) => ({ planet, house: houses[i] }));
  if (houses.length <= 1) return planets.map(planet => ({ planet, house: houses[0] ?? 1 }));
  return planets.map((planet, i) => ({ planet, house: houses[Math.min(i, houses.length - 1)] }));
}

function layoutPlanets(yogas: YogaResult[], occupied: Map<string, number>): Map<string, Seat> {
  const byHouse = new Map<number, string[]>();
  const seen = new Set<string>();
  for (const yoga of yogas) {
    const fallback = seatsFor(yoga);
    for (const planet of yoga.planetsInvolved) {
      if (seen.has(planet)) continue;
      seen.add(planet);
      const house = occupied.get(planet) ?? fallback.find(s => s.planet === planet)?.house ?? 1;
      const list = byHouse.get(house) ?? [];
      list.push(planet);
      byHouse.set(house, list);
    }
  }
  const nodes = new Map<string, Seat>();
  for (const [house, planets] of byHouse) {
    planets.sort();
    planets.forEach((planet, i) => {
      const mid = (planets.length - 1) / 2;
      const fan = (i - mid) * 0.2;
      const radial = planets.length === 1 ? 0 : (i % 2 === 0 ? -14 : 14);
      const { x, y } = onRing(house, PLANET_R + radial, fan);
      nodes.set(planet, { planet, house, x, y });
    });
  }
  return nodes;
}

/** Arc bowed outward from the chart center, so overlapping pairs stay apart. */
function bowPath(a: Seat, b: Seat, bow: number): string {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  let px = -dy / len;
  let py = dx / len;
  const outward = px * (mx - CX) + py * (my - CY);
  if (outward < 0) { px = -px; py = -py; }
  const bend = a.house === b.house ? 22 : 36 + bow;
  return `M ${a.x} ${a.y} Q ${mx + px * bend} ${my + py * bend} ${b.x} ${b.y}`;
}

const PatternWheel: React.FC<{
  yogas: YogaResult[];
  occupied: Map<string, number>;
  selectedKey: string;
  onSelect: (key: string) => void;
  isLight: boolean;
}> = ({ yogas, occupied, selectedKey, onSelect, isLight }) => {
  const { lang } = useLang();
  const nodes = useMemo(() => layoutPlanets(yogas, occupied), [yogas, occupied]);
  const selected = yogas.find(y => yogaKey(y) === selectedKey) ?? yogas[0];
  const selectedPlanets = new Set(selected?.planetsInvolved ?? []);

  const drawings = useMemo(() => {
    const bowCount = new Map<string, number>();
    return yogas.map(yoga => {
      const meta = CATEGORY_META[yoga.category] ?? CATEGORY_META.special;
      const involved = seatsFor(yoga)
        .map(s => nodes.get(s.planet))
        .filter((n): n is Seat => !!n);
      const unique = [...new Map(involved.map(n => [n.planet, n])).values()]
        .sort((a, b) => a.house - b.house || a.planet.localeCompare(b.planet));
      const edges: { d: string; key: string }[] = [];
      if (unique.length >= 2) {
        for (let i = 0; i < unique.length; i++) {
          const a = unique[i];
          const b = unique[(i + 1) % unique.length];
          if (unique.length === 2 && i > 0) break;
          const pair = [a.planet, b.planet].sort().join('|');
          const n = bowCount.get(pair) ?? 0;
          bowCount.set(pair, n + 1);
          edges.push({ d: bowPath(a, b, n * 18), key: `${pair}-${n}` });
        }
      }
      return { yoga, meta, unique, edges };
    });
  }, [yogas, nodes]);

  const ring = isLight ? '#cbd5e1' : 'rgba(255,255,255,0.14)';
  const houseInk = isLight ? '#94a3b8' : 'rgba(255,255,255,0.32)';
  const nodeFill = isLight ? '#ffffff' : '#12151f';

  return (
    <svg viewBox="0 0 640 460" className="w-full h-auto" role="img" aria-label="Planetary patterns on the twelve houses">
      <circle cx={CX} cy={CY} r={HOUSE_R} fill="none" stroke={ring} strokeWidth="1" />
      <circle cx={CX} cy={CY} r={PLANET_R - 36} fill="none" stroke={ring} strokeWidth="1" strokeDasharray="2 6" />
      {Array.from({ length: 12 }, (_, i) => {
        const house = i + 1;
        const label = onRing(house, HOUSE_R + 16);
        return (
          <g key={house}>
            <line
              x1={onRing(house, HOUSE_R - 10).x}
              y1={onRing(house, HOUSE_R - 10).y}
              x2={onRing(house, HOUSE_R + 6).x}
              y2={onRing(house, HOUSE_R + 6).y}
              stroke={ring}
              strokeWidth="1"
            />
            <text
              x={label.x}
              y={label.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={houseInk}
              fontSize="11"
              fontFamily="ui-monospace, monospace"
            >
              {house}
            </text>
          </g>
        );
      })}

      {drawings.map(({ yoga, meta, unique, edges }) => {
        const on = yogaKey(yoga) === selectedKey;
        const width = 1.4 + (yoga.strengthScore / 10) * 2.4;
        if (unique.length < 2) {
          const seat = unique[0];
          if (!seat) return null;
          return (
            <circle
              key={yogaKey(yoga)}
              cx={seat.x}
              cy={seat.y}
              r={on ? 28 : 24}
              fill="none"
              stroke={meta.accent}
              strokeWidth={on ? width : 1.25}
              opacity={on ? 1 : 0.35}
              pointerEvents="none"
            />
          );
        }
        return (
          <g key={yogaKey(yoga)}>
            {edges.map(edge => (
              <g key={edge.key}>
                <path
                  d={edge.d}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="16"
                  className="cursor-pointer"
                  onClick={() => onSelect(yogaKey(yoga))}
                >
                  <title>{yoga.name}</title>
                </path>
                {on ? (
                  <motion.path
                    d={edge.d}
                    fill="none"
                    stroke={meta.accent}
                    strokeWidth={width}
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.45, ease: 'easeOut' }}
                    pointerEvents="none"
                  />
                ) : (
                  <path
                    d={edge.d}
                    fill="none"
                    stroke={meta.accent}
                    strokeWidth={width}
                    strokeLinecap="round"
                    opacity={isLight ? 0.62 : 0.5}
                    pointerEvents="none"
                  />
                )}
              </g>
            ))}
          </g>
        );
      })}

      {[...nodes.values()].map(seat => {
        const color = planetDisplayColor(seat.planet, isLight);
        const lit = selectedPlanets.has(seat.planet);
        return (
          <g
            key={seat.planet}
            transform={`translate(${seat.x} ${seat.y})`}
            className="cursor-pointer"
            opacity={lit ? 1 : 0.72}
            onClick={() => {
              const hit = yogas.filter(y => y.planetsInvolved.includes(seat.planet)).sort(byStrength)[0];
              if (hit) onSelect(yogaKey(hit));
            }}
          >
            <circle r="18" fill={nodeFill} stroke={color} strokeWidth={lit ? 2 : 1} />
            <text
              textAnchor="middle"
              dominantBaseline="central"
              y="-1"
              fill={color}
              fontSize="15"
            >
              {PLANET_SYMBOLS[seat.planet] ?? '●'}
            </text>
            <text
              textAnchor="middle"
              y="30"
              fill={isLight ? '#475569' : 'rgba(255,255,255,0.7)'}
              fontSize="10"
              fontFamily="ui-monospace, monospace"
            >
              {labelPlanetShort(seat.planet, lang)}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

export const YogasDisplay: React.FC<Props> = ({ birthData }) => {
  const { lang, t } = useLang();
  const isLight = useTheme();
  const { data: yogas, isLoading, error } = useQuery({
    queryKey: ['yogas', birthData],
    queryFn: () => getYogas(birthData),
    enabled: !!birthData.date,
    staleTime: 30 * 60 * 1000,
  });
  const { data: positions, isLoading: positionsLoading } = useQuery({
    queryKey: ['planet-positions', birthData],
    queryFn: () => getPlanetPositions(birthData),
    enabled: !!birthData.date,
    staleTime: 30 * 60 * 1000,
  });
  const occupied = useMemo(() => {
    const map = new Map<string, number>();
    if (!positions) return map;
    const asc = positions.ascendant.rashiIndex;
    for (const planet of positions.planets) {
      map.set(planet.planet, ((planet.rashiIndex - asc + 12) % 12) + 1);
    }
    return map;
  }, [positions]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const title = isLight ? '#0f172a' : '#f8fafc';
  const muted = isLight ? '#64748b' : 'rgba(255,255,255,0.42)';
  const body = isLight ? '#475569' : 'rgba(255,255,255,0.72)';
  const line = isLight ? '#e2e8f0' : 'rgba(255,255,255,0.08)';
  const panel = isLight ? '#ffffff' : 'rgba(255,255,255,0.03)';

  if (isLoading || positionsLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-5 h-5 animate-spin mr-2" style={{ color: 'var(--c-accent)' }} />
        <span className="font-mono text-sm" style={{ color: muted }}>{t('yogas.loading')}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-500/8 border border-red-500/20 rounded-xl text-red-400 text-sm">
        {t('yogas.failed')}
      </div>
    );
  }

  if (!yogas || yogas.length === 0) {
    return (
      <div className="p-8 text-center" style={{ color: muted }}>
        <Sparkles className="w-8 h-8 mx-auto mb-3 opacity-40" />
        <p className="text-sm">{t('yogas.emptyTitle')}</p>
        <p className="text-xs mt-1 opacity-70">{t('yogas.emptyHint')}</p>
      </div>
    );
  }

  const present = CATEGORY_ORDER.filter(cat => yogas.some(y => y.category === cat));
  const filtered = (activeCategory === 'all' ? yogas : yogas.filter(y => y.category === activeCategory))
    .slice()
    .sort(byStrength);
  const selected = filtered.find(y => yogaKey(y) === selectedKey) ?? filtered[0];
  const meta = CATEGORY_META[selected.category] ?? CATEGORY_META.special;
  const Icon = meta.icon;
  const cat = labelYogaCategory(selected.category, lang);
  const occupiedHouses = selected.planetsInvolved
    .map(p => occupied.get(p))
    .filter((h): h is number => typeof h === 'number' && h > 0);
  const houses = [...new Set(occupiedHouses.length ? occupiedHouses : selected.housesInvolved.filter(h => h > 0))]
    .sort((a, b) => a - b);

  const strongCount = yogas.filter(y => y.strength === 'very strong' || y.strength === 'strong').length;
  const avgScore = yogas.reduce((s, y) => s + y.strengthScore, 0) / yogas.length;
  const strengthCounts = STRENGTH_ORDER.map(strength => ({
    strength,
    count: yogas.filter(y => y.strength === strength).length,
  })).filter(s => s.count > 0);

  const chip = (on: boolean, accent?: string): React.CSSProperties => ({
    color: on ? (accent ?? 'var(--c-accent)') : muted,
    background: on ? `${accent ?? '#a78bfa'}18` : 'transparent',
    border: `1px solid ${on ? (accent ?? 'var(--c-accent)') : line}`,
  });

  return (
    <div className="space-y-4">
      <div className="rounded-xl p-3 sm:p-4" style={{ background: panel, border: `1px solid ${line}` }}>
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {[
            { value: String(yogas.length), label: t('yogas.summaryDetected'), color: title },
            { value: String(strongCount), label: t('yogas.summaryStrong'), color: isLight ? '#6d28d9' : '#c4b5fd' },
            { value: avgScore.toFixed(1), label: t('yogas.summaryAvgScore'), color: isLight ? '#0f172a' : '#e9d5ff' },
          ].map(stat => (
            <div key={stat.label} className="min-w-0">
              <div className="text-2xl font-semibold tabular-nums leading-none" style={{ color: stat.color }}>{stat.value}</div>
              <div className="text-[10px] uppercase tracking-wider mt-1.5 truncate" style={{ color: muted }}>{stat.label}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 h-1.5 rounded-full flex overflow-hidden" style={{ background: isLight ? '#f1f5f9' : 'rgba(255,255,255,0.06)' }}>
          {strengthCounts.map(s => (
            <div key={s.strength} style={{ width: `${(s.count / yogas.length) * 100}%`, background: STRENGTH_FILL[s.strength] }} />
          ))}
        </div>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        <button
          type="button"
          onClick={() => setActiveCategory('all')}
          className="px-3 py-1.5 rounded-full text-xs font-medium"
          style={chip(activeCategory === 'all')}
        >
          {t('yogas.filterAll')} ({yogas.length})
        </button>
        {present.map(c => {
          const m = CATEGORY_META[c];
          const count = yogas.filter(y => y.category === c).length;
          const on = activeCategory === c;
          return (
            <button
              key={c}
              type="button"
              onClick={() => setActiveCategory(c)}
              className="px-3 py-1.5 rounded-full text-xs font-medium inline-flex items-center gap-1.5"
              style={chip(on, m.accent)}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: m.accent }} />
              {labelYogaCategory(c, lang).label} ({count})
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: panel, border: `1px solid ${line}` }}>
        <PatternWheel
          yogas={filtered}
          occupied={occupied}
          selectedKey={yogaKey(selected)}
          onSelect={setSelectedKey}
          isLight={isLight}
        />
        <div className="px-3 sm:px-4 pb-4 -mt-2">
          <div className="flex flex-wrap gap-1.5 mb-3">
            {filtered.map(y => {
              const on = yogaKey(y) === yogaKey(selected);
              const c = CATEGORY_META[y.category] ?? CATEGORY_META.special;
              const shared = filtered.filter(o => o.name === y.name).length > 1;
              const who = y.planetsInvolved.map(p => labelPlanetShort(p, lang)).join('–');
              return (
                <button
                  key={yogaKey(y)}
                  type="button"
                  onClick={() => setSelectedKey(yogaKey(y))}
                  className="px-2.5 py-1 rounded-full text-[11px] font-medium"
                  style={chip(on, c.accent)}
                >
                  {shared ? `${y.name} · ${who}` : y.name}
                </button>
              );
            })}
          </div>
          <div className="flex items-start gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: `${meta.accent}18`, border: `1px solid ${meta.accent}55` }}
            >
              <Icon className="w-4 h-4" style={{ color: meta.accent }} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-sm font-semibold leading-snug" style={{ color: title }}>{selected.name}</h4>
                  <div className="text-[10px] font-semibold uppercase tracking-wider mt-0.5" style={{ color: meta.accent }}>
                    {cat.label}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[11px] font-semibold" style={{ color: strengthText(selected.strength, isLight) }}>
                    {labelYogaStrength(selected.strength, lang)}
                  </div>
                  <div className="text-[10px] font-mono mt-0.5" style={{ color: muted }}>{selected.strengthScore}/10</div>
                </div>
              </div>
              <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: isLight ? '#e2e8f0' : 'rgba(255,255,255,0.08)' }}>
                <div className="h-full rounded-full" style={{ width: `${selected.strengthScore * 10}%`, background: STRENGTH_FILL[selected.strength] }} />
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {selected.planetsInvolved.map(p => {
                  const color = planetDisplayColor(p, isLight);
                  return (
                    <span
                      key={p}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium"
                      style={{ color, background: `${color}18`, border: `1px solid ${color}40` }}
                    >
                      <span aria-hidden>{PLANET_SYMBOLS[p] ?? '●'}</span>
                      {labelPlanet(p, lang)}
                    </span>
                  );
                })}
                {houses.map(h => (
                  <span
                    key={h}
                    className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-mono"
                    style={{ color: muted, border: `1px solid ${line}` }}
                  >
                    {h}H
                  </span>
                ))}
              </div>
              <p className="text-sm leading-relaxed mt-2.5" style={{ color: body }}>{selected.effects}</p>
              <p className="text-[11px] leading-relaxed mt-1.5" style={{ color: muted }}>{cat.description}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
