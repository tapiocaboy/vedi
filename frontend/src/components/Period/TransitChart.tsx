/**
 * TransitChart — a 12-box (South-Indian) chart of the CURRENT-date planetary
 * positions (gochara). Signs are colour-coded by favourability (green = good,
 * red = challenging, none = neutral), every sign is clickable to reveal the
 * planets there plus their Vedic aspects (drishti), and selecting a sign draws
 * the aspect lines its planets cast across the chart.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Orbit } from 'lucide-react';
import type { GocharaSnapshot, PlanetTransit } from '../../lib/core/transits';
import { RASHIS, RASHI_ENGLISH, PLANET_SYMBOLS, PLANET_COLORS } from '../../types/astrology';
import { useTheme } from '../../hooks/useTheme';
import { useLang } from '../../i18n/LanguageContext';
import { labelPlanet, labelRashi, labelRashiWestern } from '../../i18n/astroLabels';

const ACCENT = 'var(--c-accent)';

// Fixed South-Indian sign → grid cell (row, col) on the 4×4 board.
const RASHI_GRID: Record<number, [number, number]> = {
  0: [0, 1], 1: [0, 2], 2: [0, 3],
  3: [1, 3], 4: [2, 3], 5: [3, 3],
  6: [3, 2], 7: [3, 1], 8: [3, 0],
  9: [2, 0], 10: [1, 0], 11: [0, 0],
};

// Sign-centre in a 0–100 viewBox, for drawing aspect lines.
function signCenter(rashi: number): { x: number; y: number } {
  const [r, c] = RASHI_GRID[rashi];
  return { x: (c + 0.5) * 25, y: (r + 0.5) * 25 };
}

// Vedic graha drishti: every planet aspects the 7th; Mars +4/8, Jupiter +5/9,
// Saturn +3/10 (offsets are 1-indexed from the planet's own sign).
const ASPECT_OFFSETS: Record<string, number[]> = {
  MARS: [4, 7, 8], JUPITER: [5, 7, 9], SATURN: [3, 7, 10],
};
function aspectOffsets(planet: string): number[] {
  return ASPECT_OFFSETS[planet] ?? [7];
}
function aspectedSigns(planet: string, rashi: number): number[] {
  return aspectOffsets(planet).map(o => (rashi + o - 1) % 12);
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

interface Props {
  gochara: GocharaSnapshot;
}

export const TransitChart: React.FC<Props> = ({ gochara }) => {
  const isLight = useTheme();
  const { lang, t } = useLang();
  const [selected, setSelected] = useState<number | null>(null);

  const byRashi: Record<number, PlanetTransit[]> = {};
  for (let i = 0; i < 12; i++) byRashi[i] = [];
  gochara.transits.forEach(tr => byRashi[tr.rashi]?.push(tr));

  const lagna = gochara.natalLagnaRashi;
  const moon = gochara.natalMoonRashi;
  const houseOf = (rashi: number) => ((rashi - lagna + 12) % 12) + 1;
  const netValence = (rashi: number) => byRashi[rashi].reduce((s, p) => s + p.valence, 0);

  // Aspects relative to the current selection.
  const selPlanets = selected != null ? byRashi[selected] : [];
  const outgoing = new Set<number>();
  selPlanets.forEach(p => aspectedSigns(p.planet, p.rashi).forEach(s => outgoing.add(s)));
  const incoming = selected != null
    ? gochara.transits.filter(p => p.rashi !== selected && aspectedSigns(p.planet, p.rashi).includes(selected))
    : [];

  // Theme tokens
  const goodBg     = isLight ? 'rgba(16,185,129,0.14)' : 'rgba(16,185,129,0.18)';
  const goodBorder = isLight ? 'rgba(16,185,129,0.5)'  : 'rgba(16,185,129,0.42)';
  const badBg      = isLight ? 'rgba(244,63,94,0.12)'  : 'rgba(244,63,94,0.16)';
  const badBorder  = isLight ? 'rgba(244,63,94,0.45)'  : 'rgba(244,63,94,0.40)';
  const neutralBg  = isLight ? '#ffffff'               : 'rgba(255,255,255,0.02)';
  const baseBorder = isLight ? 'rgba(15,23,42,0.12)'   : 'rgba(255,255,255,0.10)';
  const centerBg   = isLight ? '#f1f5f9'               : 'rgba(10,5,20,0.9)';
  const houseClr   = isLight ? '#475569'               : 'rgba(255,255,255,0.5)';
  const rashiClr   = isLight ? '#475569'               : 'rgba(255,255,255,0.5)';

  const toneFor = (rashi: number): { bg: string; border: string } => {
    if (!byRashi[rashi].length) return { bg: neutralBg, border: baseBorder };
    const net = netValence(rashi);
    if (net > 0) return { bg: goodBg, border: goodBorder };
    if (net < 0) return { bg: badBg, border: badBorder };
    return { bg: neutralBg, border: baseBorder };
  };

  const renderCell = (row: number, col: number) => {
    const isCenter = (row === 1 || row === 2) && (col === 1 || col === 2);
    if (isCenter) {
      // The middle 2×2 is decorative; the date label is overlaid separately.
      return <div className="h-full w-full" style={{ background: centerBg, border: `1px solid ${baseBorder}` }} />;
    }
    const rashi = Object.keys(RASHI_GRID).map(Number).find(r => RASHI_GRID[r][0] === row && RASHI_GRID[r][1] === col);
    if (rashi == null) return <div className="h-full w-full" />;

    const planets = byRashi[rashi];
    const tone = toneFor(rashi);
    const isLagna = rashi === lagna;
    const isSel = selected === rashi;
    const isAspected = outgoing.has(rashi);

    return (
      <motion.button
        type="button"
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: rashi * 0.015 }}
        onClick={() => setSelected(isSel ? null : rashi)}
        className="relative h-full w-full p-1 text-left cursor-pointer transition-all duration-150 select-none focus:outline-none"
        style={{
          background: tone.bg,
          border: isSel
            ? `2px solid ${ACCENT}`
            : isLagna
              ? `1.5px solid ${ACCENT}`
              : isAspected
                ? `1.5px dashed rgba(var(--c-accent2-rgb),0.6)`
                : `1px solid ${tone.border}`,
        }}
        title={`${labelRashi(rashi, lang, RASHIS[rashi])} · ${t('now.transitHouseFromLagna', { n: houseOf(rashi) })}`}
      >
        {/* house number (from natal Lagna) */}
        <span className="absolute top-0.5 left-1 text-[10px] font-mono font-bold" style={{ color: isLagna ? ACCENT : houseClr }}>
          {houseOf(rashi)}
        </span>
        {isLagna && <span className="absolute top-0.5 right-1 text-[10px] font-bold" style={{ color: ACCENT }}>↑</span>}
        {rashi === moon && !isLagna && (
          <span className="absolute top-0.5 right-1 text-[10px]" title={t('now.transitNatalMoon')} style={{ color: isLight ? '#64748b' : 'rgba(255,255,255,0.55)' }}>☽</span>
        )}

        {/* transiting planets */}
        <div className="flex flex-wrap gap-0.5 mt-3 justify-center">
          {planets.map(p => (
            <span
              key={p.planet}
              className="text-[14px] font-bold leading-none"
              style={{ color: PLANET_COLORS[p.planet] ?? (isLight ? '#1e293b' : '#fff') }}
              title={`${labelPlanet(p.planet, lang)} ${p.rashiDegree.toFixed(1)}°${p.isRetrograde ? ' ℞' : ''}`}
            >
              {PLANET_SYMBOLS[p.planet] ?? p.planet.slice(0, 2)}
              {p.isRetrograde && <span className="text-[7px] align-super">℞</span>}
            </span>
          ))}
        </div>

        {/* rashi name */}
        <span className="absolute bottom-0.5 left-0 right-0 text-center text-[8.5px] font-mono font-bold truncate px-0.5" style={{ color: rashiClr }}>
          {labelRashi(rashi, lang, RASHIS[rashi])}
        </span>
      </motion.button>
    );
  };

  const dateLabel = new Date(gochara.asOf).toLocaleDateString(lang === 'si' ? 'si-LK' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  const selTone = selected != null ? netValence(selected) : 0;

  return (
    <div className="glass-card rounded-2xl p-3 sm:p-6">
      {/* Header */}
      <div className="flex items-start gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(var(--c-accent-rgb),0.08)', border: '1px solid rgba(var(--c-accent-rgb),0.18)' }}>
          <Orbit className="w-4 h-4" style={{ color: 'var(--c-accent-2)' }} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className={`text-sm font-bold ${isLight ? 'text-gray-800' : 'text-white'}`}>{t('now.transitChartTitle')}</h3>
          <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-white/30'}`}>{t('now.transitChartSubtitle')}</p>
        </div>
        <span className={`text-[10px] font-mono shrink-0 ${isLight ? 'text-slate-400' : 'text-white/35'}`}>{dateLabel}</span>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 items-start">
        {/* The 12-box board + aspect overlay */}
        <div className="w-full max-w-sm mx-auto">
          <div className="relative aspect-square">
            <div className="grid grid-cols-4 grid-rows-4 h-full w-full rounded-xl overflow-hidden"
              style={{ border: `1px solid ${baseBorder}`, boxShadow: isLight ? '0 4px 18px rgba(0,0,0,0.06)' : '0 0 24px rgba(0,0,0,0.3)' }}>
              {[0, 1, 2, 3].map(row => [0, 1, 2, 3].map(col => (
                <div key={`${row}-${col}`}>{renderCell(row, col)}</div>
              )))}
            </div>

            {/* Aspect (drishti) lines from the selected sign's planets */}
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none">
              {selected != null && selPlanets.map(p =>
                aspectedSigns(p.planet, p.rashi).map(target => {
                  const a = signCenter(p.rashi); const b = signCenter(target);
                  const col = PLANET_COLORS[p.planet] ?? '#94a3b8';
                  return (
                    <g key={`${p.planet}-${target}`}>
                      <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={col} strokeWidth={0.8} strokeOpacity={0.85} strokeDasharray="2 1.5" />
                      <circle cx={b.x} cy={b.y} r={1.6} fill={col} />
                    </g>
                  );
                })
              )}
            </svg>

            {/* Centre date pill */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className={`text-center px-2 ${isLight ? 'text-slate-500' : 'text-white/45'}`}>
                <div className="text-[9px] uppercase tracking-widest font-bold">{t('now.transitAsOfLabel')}</div>
                <div className="text-[11px] font-mono font-bold">{dateLabel}</div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-3 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[10px] font-medium" style={{ color: isLight ? '#64748b' : 'rgba(255,255,255,0.45)' }}>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: goodBg, border: `1px solid ${goodBorder}` }} />{t('now.transitFavourable')}</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: badBg, border: `1px solid ${badBorder}` }} />{t('now.transitChallenging')}</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: neutralBg, border: `1px solid ${baseBorder}` }} />{t('now.transitNeutral')}</span>
            <span className="flex items-center gap-1"><span className="inline-block w-3 border-t border-dashed" style={{ borderColor: 'var(--c-accent-2)' }} />{t('now.transitAspectLine')}</span>
          </div>
        </div>

        {/* Detail / aspect panel */}
        <div>
          {selected == null ? (
            <div className={`rounded-xl border p-4 text-xs leading-relaxed ${isLight ? 'border-slate-200 text-slate-500 bg-slate-50' : 'border-white/8 text-white/50 bg-black/20'}`}>
              {t('now.transitChartHint')}
            </div>
          ) : (
            <SignDetail
              rashi={selected} houseOf={houseOf} planets={byRashi[selected]}
              net={selTone} incoming={incoming} byRashi={byRashi} isLight={isLight}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// ── Selected-sign detail ────────────────────────────────────────────────────────

const SignDetail: React.FC<{
  rashi: number;
  houseOf: (r: number) => number;
  planets: PlanetTransit[];
  net: number;
  incoming: PlanetTransit[];
  byRashi: Record<number, PlanetTransit[]>;
  isLight: boolean;
}> = ({ rashi, houseOf, planets, net, incoming, byRashi, isLight }) => {
  const { lang, t } = useLang();
  const head = isLight ? 'text-gray-800' : 'text-white';
  const body = isLight ? 'text-slate-600' : 'text-white/65';
  const sub  = isLight ? 'text-slate-400' : 'text-white/35';

  const favLabel = net > 0 ? t('now.transitFavourable') : net < 0 ? t('now.transitChallenging') : t('now.transitNeutral');
  const favCls = net > 0 ? 'bg-emerald-500/15 text-emerald-400' : net < 0 ? 'bg-rose-500/15 text-rose-400' : (isLight ? 'bg-slate-200 text-slate-500' : 'bg-white/10 text-white/50');

  return (
    <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: 'rgba(var(--c-accent-rgb),0.22)', background: 'rgba(var(--c-accent-rgb),0.05)' }}>
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-sm font-bold ${head}`}>{labelRashi(rashi, lang, RASHIS[rashi])}</span>
        <span className={`text-[11px] ${sub}`}>{labelRashiWestern(rashi, lang, RASHI_ENGLISH[rashi])}</span>
        <span className={`text-[11px] font-mono ${sub}`}>· {t('now.transitHouseFromLagna', { n: houseOf(rashi) })}</span>
        <span className={`ml-auto text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${favCls}`}>{favLabel}</span>
      </div>

      {/* Planets transiting here */}
      {planets.length === 0 ? (
        <p className={`text-xs ${body}`}>{t('now.transitNoPlanets')}</p>
      ) : (
        <ul className="space-y-1.5">
          {planets.map(p => {
            const tone = p.valence > 0 ? 'text-emerald-400' : p.valence < 0 ? 'text-rose-400' : sub;
            return (
              <li key={p.planet} className="text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold" style={{ color: PLANET_COLORS[p.planet] }}>{PLANET_SYMBOLS[p.planet]}</span>
                  <span className={`font-semibold ${head}`}>{labelPlanet(p.planet, lang)}</span>
                  <span className={`font-mono ${sub}`}>{p.rashiDegree.toFixed(1)}°</span>
                  {p.isRetrograde && <span className="text-amber-400 text-[10px] font-mono">{t('now.transitRetro')}</span>}
                  <span className={`ml-auto text-[10px] font-mono ${tone}`}>{p.houseFromMoon}{t('now.transitFromMoonShort')}</span>
                </div>
                {p.note && <div className={`text-[11px] italic mt-0.5 ${body}`}>{p.note}</div>}
              </li>
            );
          })}
        </ul>
      )}

      {/* Drishti cast by planets here */}
      {planets.length > 0 && (
        <div className="pt-2 border-t" style={{ borderColor: isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.07)' }}>
          <div className={`text-[10px] uppercase tracking-wider mb-1.5 ${sub}`}>{t('now.transitAspectsCast')}</div>
          <ul className="space-y-1">
            {planets.map(p => (
              <li key={p.planet} className={`text-[11px] ${body}`}>
                <span className="font-semibold" style={{ color: PLANET_COLORS[p.planet] }}>{PLANET_SYMBOLS[p.planet]} {labelPlanet(p.planet, lang)}</span>
                {' → '}
                {aspectOffsets(p.planet).map((o, i) => {
                  const tgt = (p.rashi + o - 1) % 12;
                  const there = byRashi[tgt].map(x => PLANET_SYMBOLS[x.planet]).join('');
                  return (
                    <span key={o}>
                      {i > 0 && ', '}
                      {labelRashi(tgt, lang, RASHIS[tgt])} <span className={sub}>({ordinal(o)}{there ? ` · ${there}` : ''})</span>
                    </span>
                  );
                })}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Drishti received */}
      <div className="pt-2 border-t" style={{ borderColor: isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.07)' }}>
        <div className={`text-[10px] uppercase tracking-wider mb-1.5 ${sub}`}>{t('now.transitAspectedBy')}</div>
        {incoming.length === 0 ? (
          <p className={`text-[11px] ${body}`}>{t('now.transitNoneAspect')}</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {incoming.map(p => (
              <span key={p.planet} className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${isLight ? 'bg-slate-100 text-slate-600' : 'bg-white/8 text-white/65'}`}>
                <span style={{ color: PLANET_COLORS[p.planet] }}>{PLANET_SYMBOLS[p.planet]}</span> {labelPlanet(p.planet, lang)} <span className={sub}>({labelRashi(p.rashi, lang, RASHIS[p.rashi])})</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransitChart;
