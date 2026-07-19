/**
 * TransitChart — a 12-box (South-Indian) chart of the CURRENT-date planetary
 * positions (gochara). Signs are colour-coded by a refined favourability score
 * (occupancy valence + graded benefic/malefic aspects + house nature), every
 * sign is clickable to reveal its planets and full graded drishti, and a
 * Transit Predictions panel interprets the current sky.
 */

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Orbit, Sparkles, Share2 } from 'lucide-react';
import type { GocharaSnapshot, PlanetTransit, NatalPlacement } from '../../lib/core/transits';
import {
  computeSignAnalysis, gradedAspects, aspectPct, buildTransitPredictions, computeTransitNatal,
  type SignInfo, type DashaLords, type TransitNatalHit,
} from '../../lib/core/transitAnalysis';
import { gocharaEffect } from '../../lib/core/gocharaPhala';
import { ZodiacEffectsCard } from '../Transits/ZodiacEffectsCard';
import { TransitPredictionCards } from '../shared/TransitPredictionCards';
import { RASHIS, RASHI_ENGLISH, PLANET_SYMBOLS, PLANET_COLORS } from '../../types/astrology';
import { useTheme } from '../../hooks/useTheme';
import { useLang } from '../../i18n/LanguageContext';
import { labelPlanet, labelRashi, labelRashiWestern, labelDignity } from '../../i18n/astroLabels';

const ACCENT = 'var(--c-accent)';

const RASHI_GRID: Record<number, [number, number]> = {
  0: [0, 1], 1: [0, 2], 2: [0, 3],
  3: [1, 3], 4: [2, 3], 5: [3, 3],
  6: [3, 2], 7: [3, 1], 8: [3, 0],
  9: [2, 0], 10: [1, 0], 11: [0, 0],
};
function signCenter(rashi: number): { x: number; y: number } {
  const [r, c] = RASHI_GRID[rashi];
  return { x: (c + 0.5) * 25, y: (r + 0.5) * 25 };
}
function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

interface Props { gochara: GocharaSnapshot; dasha?: DashaLords; }

export const TransitChart: React.FC<Props> = ({ gochara, dasha }) => {
  const isLight = useTheme();
  const { lang, t } = useLang();
  const [selected, setSelected] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);

  const signs = useMemo(() => computeSignAnalysis(gochara), [gochara]);
  const predictions = useMemo(() => buildTransitPredictions(gochara, signs, dasha), [gochara, signs, dasha]);
  const mp = gochara.moonPhase;

  const byRashi: Record<number, PlanetTransit[]> = {};
  for (let i = 0; i < 12; i++) byRashi[i] = signs[i].planets;

  // Natal planets per sign (bi-wheel overlay) + transit→natal contacts.
  const natalByRashi = useMemo(() => {
    const m: Record<number, NatalPlacement[]> = {};
    for (let i = 0; i < 12; i++) m[i] = [];
    gochara.natalPlanets.forEach(n => m[n.rashi]?.push(n));
    return m;
  }, [gochara]);
  const transitNatal = useMemo(() => computeTransitNatal(gochara), [gochara]);

  const lagna = gochara.natalLagnaRashi;
  const moon = gochara.natalMoonRashi;
  const houseOf = (rashi: number) => signs[rashi].houseFromLagna;

  // Aspect lines: hover previews and click pins the active sign; the "Show all
  // aspects" toggle draws every transiting planet's significant aspects at once.
  const activeSign = hovered ?? selected;
  const outgoing = new Set<number>();
  if (activeSign != null) {
    byRashi[activeSign].forEach(p => gradedAspects(p.planet, p.rashi).filter(a => a.virupa >= 45).forEach(a => outgoing.add(a.toRashi)));
  }
  const aspectSources = showAll ? gochara.transits : activeSign != null ? byRashi[activeSign] : [];
  const aspectLines = aspectSources.flatMap(p =>
    gradedAspects(p.planet, p.rashi).filter(a => a.virupa >= 45).map(a => ({ p, a })),
  );

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
    const tone = signs[rashi].tone;
    if (tone === 'good') return { bg: goodBg, border: goodBorder };
    if (tone === 'bad') return { bg: badBg, border: badBorder };
    return { bg: neutralBg, border: baseBorder };
  };

  const renderCell = (row: number, col: number) => {
    const isCenter = (row === 1 || row === 2) && (col === 1 || col === 2);
    if (isCenter) return <div className="h-full w-full" style={{ background: centerBg, border: `1px solid ${baseBorder}` }} />;

    const rashi = Object.keys(RASHI_GRID).map(Number).find(r => RASHI_GRID[r][0] === row && RASHI_GRID[r][1] === col);
    if (rashi == null) return <div className="h-full w-full" />;

    const planets = byRashi[rashi];
    const natalHere = natalByRashi[rashi];
    const tone = toneFor(rashi);
    const isLagna = rashi === lagna;
    const isSel = selected === rashi;
    const isAspected = outgoing.has(rashi);

    // Rich hover tooltip.
    const favWord = signs[rashi].tone === 'good' ? t('now.transitFavourable') : signs[rashi].tone === 'bad' ? t('now.transitChallenging') : t('now.transitNeutral');
    const tip = [
      `${labelRashi(rashi, lang, RASHIS[rashi])} · ${t('now.transitHouseFromLagna', { n: houseOf(rashi) })} · ${favWord}`,
      planets.length ? `△ ${planets.map(p => `${PLANET_SYMBOLS[p.planet]} ${labelPlanet(p.planet, lang)}${p.isRetrograde ? ' ℞' : ''}`).join(', ')}` : '',
      natalHere.length ? `${t('now.transitNatal')}: ${natalHere.map(n => labelPlanet(n.planet, lang)).join(', ')}` : '',
    ].filter(Boolean).join('\n');

    return (
      <motion.button
        type="button"
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: rashi * 0.015 }}
        onClick={() => setSelected(isSel ? null : rashi)}
        onMouseEnter={() => setHovered(rashi)}
        onMouseLeave={() => setHovered(h => (h === rashi ? null : h))}
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
        title={tip}
      >
        <span className="absolute top-0.5 left-1 text-[10px] font-mono font-bold" style={{ color: isLagna ? ACCENT : houseClr }}>
          {houseOf(rashi)}
        </span>
        {isLagna && <span className="absolute top-0.5 right-1 text-[10px] font-bold" style={{ color: ACCENT }}>↑</span>}
        {rashi === moon && !isLagna && (
          <span className="absolute top-0.5 right-1 text-[10px]" title={t('now.transitNatalMoon')} style={{ color: isLight ? '#64748b' : 'rgba(255,255,255,0.55)' }}>☽</span>
        )}

        {/* Transiting planets (bright) */}
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

        {/* Natal planets (dim overlay — the bi-wheel) */}
        {natalByRashi[rashi].length > 0 && (
          <div className="flex flex-wrap gap-0.5 justify-center mt-0.5 opacity-55">
            {natalByRashi[rashi].map(n => (
              <span
                key={n.planet}
                className="text-[9px] font-semibold leading-none"
                style={{ color: PLANET_COLORS[n.planet] ?? '#94a3b8' }}
                title={`natal ${labelPlanet(n.planet, lang)}`}
              >
                {PLANET_SYMBOLS[n.planet] ?? n.planet.slice(0, 2)}
              </span>
            ))}
          </div>
        )}

        <span className="absolute bottom-0.5 left-0 right-0 text-center text-[8.5px] font-mono font-bold truncate px-0.5" style={{ color: rashiClr }}>
          {labelRashi(rashi, lang, RASHIS[rashi])}
        </span>
      </motion.button>
    );
  };

  const dateLabel = new Date(gochara.asOf).toLocaleDateString(lang === 'si' ? 'si-LK' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' });

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

      {/* Moon detail strip — tithi / paksha / illumination / nakshatra */}
      {mp && (
        <div className={`flex flex-wrap items-center gap-x-2 gap-y-0.5 mb-4 text-[11px] ${isLight ? 'text-slate-600' : 'text-white/60'}`}>
          <span className="font-bold">☽ {t('now.transitMoonWord')}:</span>
          <span className="font-semibold">{mp.tithiName}</span>
          <span className={isLight ? 'text-slate-400' : 'text-white/35'}>· {mp.paksha} paksha · {mp.illumination}% {t('now.transitLit')}</span>
          <span className={isLight ? 'text-slate-400' : 'text-white/35'}>· {mp.nakshatra} {t('now.transitPada')} {mp.pada}</span>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-4 items-start">
        {/* Board + aspect overlay */}
        <div className="w-full max-w-sm mx-auto">
          <div className="relative aspect-square">
            <div className="grid grid-cols-4 grid-rows-4 h-full w-full rounded-xl overflow-hidden"
              style={{ border: `1px solid ${baseBorder}`, boxShadow: isLight ? '0 4px 18px rgba(0,0,0,0.06)' : '0 0 24px rgba(0,0,0,0.3)' }}>
              {[0, 1, 2, 3].map(row => [0, 1, 2, 3].map(col => (
                <div key={`${row}-${col}`}>{renderCell(row, col)}</div>
              )))}
            </div>

            {/* Graded drishti lines — active sign (hover/click) and/or all planets */}
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none">
              {aspectLines.map(({ p, a }) => {
                const from = signCenter(p.rashi), to = signCenter(a.toRashi);
                const col = PLANET_COLORS[p.planet] ?? '#94a3b8';
                const isActive = activeSign != null && p.rashi === activeSign;
                const base = 0.35 + 0.55 * (a.virupa / 60);
                // In "show all" mode, fade lines that aren't from the active sign.
                const opacity = showAll ? (activeSign == null ? base * 0.5 : isActive ? base : 0.08) : base;
                return (
                  <g key={`${p.planet}-${p.rashi}-${a.toRashi}`}>
                    <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={col} strokeWidth={a.virupa >= 60 ? 1 : 0.7} strokeOpacity={opacity} strokeDasharray="2 1.5" />
                    <circle cx={to.x} cy={to.y} r={1.6} fill={col} fillOpacity={Math.min(1, opacity + 0.15)} />
                  </g>
                );
              })}
            </svg>

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className={`text-center px-2 ${isLight ? 'text-slate-500' : 'text-white/45'}`}>
                <div className="text-[9px] uppercase tracking-widest font-bold">{t('now.transitAsOfLabel')}</div>
                <div className="text-[11px] font-mono font-bold">{dateLabel}</div>
              </div>
            </div>
          </div>

          {/* Show all aspects toggle + hover hint */}
          <div className="mt-3 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setShowAll(v => !v)}
              aria-pressed={showAll}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-colors ${
                showAll
                  ? 'text-white border-transparent'
                  : isLight ? 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200' : 'bg-white/5 border-white/8 text-white/55 hover:bg-white/10 hover:text-white'
              }`}
              style={showAll ? { backgroundColor: 'var(--c-accent)' } : undefined}
            >
              <Share2 className="w-3 h-3" /> {t('now.transitShowAll')}
            </button>
            <span className={`text-[9px] font-mono ${isLight ? 'text-slate-400' : 'text-white/30'}`}>{t('now.transitHoverHint')}</span>
          </div>

          {/* Legend */}
          <div className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[10px] font-medium" style={{ color: isLight ? '#64748b' : 'rgba(255,255,255,0.45)' }}>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: goodBg, border: `1px solid ${goodBorder}` }} />{t('now.transitFavourable')}</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: badBg, border: `1px solid ${badBorder}` }} />{t('now.transitChallenging')}</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: neutralBg, border: `1px solid ${baseBorder}` }} />{t('now.transitNeutral')}</span>
            <span className="flex items-center gap-1"><span className="inline-block w-3 border-t border-dashed" style={{ borderColor: 'var(--c-accent-2)' }} />{t('now.transitAspectLine')}</span>
            {gochara.natalPlanets.length > 0 && (
              <span className="flex items-center gap-1"><span className="text-[11px] opacity-55" style={{ color: PLANET_COLORS.SATURN }}>♄</span>{t('now.transitNatal')}</span>
            )}
          </div>
        </div>

        {/* Detail / aspect panel */}
        <div>
          {selected == null ? (
            <div className={`rounded-xl border p-4 text-xs leading-relaxed ${isLight ? 'border-slate-200 text-slate-500 bg-slate-50' : 'border-white/8 text-white/50 bg-black/20'}`}>
              {t('now.transitChartHint')}
            </div>
          ) : (
            <SignDetail info={signs[selected]} byRashi={byRashi} natalByRashi={natalByRashi} isLight={isLight} />
          )}
        </div>
      </div>

      {/* Transit → Natal contacts (bi-wheel) */}
      <TransitNatalCard hits={transitNatal} isLight={isLight} />

      {/* Transit predictions */}
      <TransitPredictions predictions={predictions} isLight={isLight} />

      {/* Classical gochara phala for all 12 Moon signs */}
      <ZodiacEffectsCard gochara={gochara} />
    </div>
  );
};

// ── Transit → Natal contacts ────────────────────────────────────────────────────

const TransitNatalCard: React.FC<{ hits: TransitNatalHit[]; isLight: boolean }> = ({ hits, isLight }) => {
  const { lang, t } = useLang();
  const top = hits.filter(h => h.transit !== h.natal && (h.kind === 'conjunction' ? (h.orb ?? 99) <= 12 : h.virupa >= 30)).slice(0, 12);
  if (!top.length) return null;
  const head = isLight ? 'text-gray-800' : 'text-white';
  const sub = isLight ? 'text-slate-400' : 'text-white/35';

  return (
    <div className="mt-4 pt-4 border-t" style={{ borderColor: isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.07)' }}>
      <div className="flex items-center gap-2 mb-3">
        <Orbit className="w-3.5 h-3.5" style={{ color: 'var(--c-accent-2)' }} />
        <span className={`text-xs font-bold uppercase tracking-wider ${head}`}>{t('now.transitToNatal')}</span>
      </div>
      <div className="grid sm:grid-cols-2 gap-1.5">
        {top.map((h, i) => (
          <div key={i} className={`flex items-center gap-1.5 text-[11px] rounded-lg border p-2 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-white/8 bg-black/20'}`}>
            <span className="font-bold" style={{ color: PLANET_COLORS[h.transit] }}>{PLANET_SYMBOLS[h.transit]}</span>
            <span className={isLight ? 'text-slate-700' : 'text-white/75'}>{labelPlanet(h.transit, lang)}</span>
            <span className={sub}>{h.kind === 'conjunction' ? '☌' : '▷'}</span>
            <span className="font-bold opacity-70" style={{ color: PLANET_COLORS[h.natal] }}>{PLANET_SYMBOLS[h.natal]}</span>
            <span className={isLight ? 'text-slate-700' : 'text-white/75'}>{labelPlanet(h.natal, lang)}</span>
            <span className={`ml-auto font-mono ${sub}`}>
              {h.kind === 'conjunction' ? `${h.orb}°` : `${ordinal(h.house)} · ${aspectPct(h.virupa)}%`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Selected-sign detail ────────────────────────────────────────────────────────

const SignDetail: React.FC<{
  info: SignInfo;
  byRashi: Record<number, PlanetTransit[]>;
  natalByRashi: Record<number, NatalPlacement[]>;
  isLight: boolean;
}> = ({ info, byRashi, natalByRashi, isLight }) => {
  const { lang, t } = useLang();
  const head = isLight ? 'text-gray-800' : 'text-white';
  const body = isLight ? 'text-slate-600' : 'text-white/65';
  const sub  = isLight ? 'text-slate-400' : 'text-white/35';
  const divider = isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.07)';
  const rashi = info.rashi;
  const natalHere = natalByRashi[rashi] ?? [];

  const favLabel = info.tone === 'good' ? t('now.transitFavourable') : info.tone === 'bad' ? t('now.transitChallenging') : t('now.transitNeutral');
  const favCls = info.tone === 'good' ? 'bg-emerald-500/15 text-emerald-400' : info.tone === 'bad' ? 'bg-rose-500/15 text-rose-400' : (isLight ? 'bg-slate-200 text-slate-500' : 'bg-white/10 text-white/50');

  return (
    <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: 'rgba(var(--c-accent-rgb),0.22)', background: 'rgba(var(--c-accent-rgb),0.05)' }}>
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-sm font-bold ${head}`}>{labelRashi(rashi, lang, RASHIS[rashi])}</span>
        <span className={`text-[11px] ${sub}`}>{labelRashiWestern(rashi, lang, RASHI_ENGLISH[rashi])}</span>
        <span className={`text-[11px] font-mono ${sub}`}>· {t('now.transitHouseFromLagna', { n: info.houseFromLagna })}</span>
        <span className={`ml-auto text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${favCls}`}>
          {favLabel} · {info.score > 0 ? '+' : ''}{info.score.toFixed(1)}
        </span>
      </div>

      {/* Natal planets sitting in this sign (bi-wheel) */}
      {natalHere.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`text-[10px] uppercase tracking-wider ${sub}`}>{t('now.transitNatal')}:</span>
          {natalHere.map(n => (
            <span key={n.planet} className="text-[11px] font-semibold flex items-center gap-1">
              <span style={{ color: PLANET_COLORS[n.planet] }}>{PLANET_SYMBOLS[n.planet]}</span>
              <span className={body}>{labelPlanet(n.planet, lang)}</span>
            </span>
          ))}
        </div>
      )}

      {/* Planets transiting here */}
      {info.planets.length === 0 ? (
        <p className={`text-xs ${body}`}>{t('now.transitNoPlanets')}</p>
      ) : (
        <ul className="space-y-1.5">
          {info.planets.map(p => {
            const tone = p.valence > 0 ? 'text-emerald-400' : p.valence < 0 ? 'text-rose-400' : sub;
            return (
              <li key={p.planet} className="text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold" style={{ color: PLANET_COLORS[p.planet] }}>{PLANET_SYMBOLS[p.planet]}</span>
                  <span className={`font-semibold ${head}`}>{labelPlanet(p.planet, lang)}</span>
                  <span className={`font-mono ${sub}`}>{p.rashiDegree.toFixed(1)}°</span>
                  {p.isRetrograde && <span className="text-amber-400 text-[10px] font-mono">{t('now.transitRetro')}</span>}
                  {p.vedha && (
                    <span className="text-amber-400 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-500/15"
                      title={`${t('now.transitVedha')} · ${labelPlanet(p.vedha.byPlanet, lang)}`}>
                      {t('now.transitVedha')}
                    </span>
                  )}
                  {p.war && (
                    <span className="text-rose-400 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-rose-500/15"
                      title={`${t('now.transitWar')} · ${labelPlanet(p.war.with, lang)}`}>
                      {t('now.transitWar')}
                    </span>
                  )}
                  {p.gandanta && (
                    <span className="text-amber-400 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-500/15">
                      {t('now.transitGandanta')}
                    </span>
                  )}
                  {(p.dignity === 'exalted' || p.dignity === 'own-sign' || p.dignity === 'debilitated') && (
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                      p.dignity === 'debilitated' ? 'text-rose-400 bg-rose-500/15'
                        : p.dignity === 'exalted' ? 'text-emerald-400 bg-emerald-500/15'
                        : 'text-violet-400 bg-violet-500/15'}`}>
                      {labelDignity(p.dignity, lang)}
                    </span>
                  )}
                  {p.combust && (
                    <span className="text-orange-400 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-orange-500/15">
                      {t('now.transitCombust')}
                    </span>
                  )}
                  {p.stationary && (
                    <span className="text-sky-400 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-sky-500/15">
                      {t('now.transitStationary')}
                    </span>
                  )}
                  {p.bindus != null && (
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                        p.bindus >= 5 ? 'text-emerald-400 bg-emerald-500/15' : p.bindus <= 2 ? 'text-rose-400 bg-rose-500/15' : (isLight ? 'text-slate-500 bg-slate-200' : 'text-white/50 bg-white/10')}`}
                      title={t('now.transitBindus')}
                    >
                      {p.bindus}/8
                    </span>
                  )}
                  <span className={`ml-auto text-[10px] font-mono ${tone}`}>{p.houseFromMoon}{t('now.transitFromMoonShort')}</span>
                </div>
                <div className={`text-[11px] mt-0.5 ${body}`}>{gocharaEffect(p.planet, p.houseFromMoon)}</div>
                {p.note && <div className={`text-[11px] italic mt-0.5 ${body}`}>{p.note}</div>}
              </li>
            );
          })}
        </ul>
      )}

      {/* Drishti cast by planets here (graded) */}
      {info.planets.length > 0 && (
        <div className="pt-2 border-t" style={{ borderColor: divider }}>
          <div className={`text-[10px] uppercase tracking-wider mb-1.5 ${sub}`}>{t('now.transitAspectsCast')}</div>
          <ul className="space-y-1">
            {info.planets.map(p => (
              <li key={p.planet} className={`text-[11px] ${body}`}>
                <span className="font-semibold" style={{ color: PLANET_COLORS[p.planet] }}>{PLANET_SYMBOLS[p.planet]} {labelPlanet(p.planet, lang)}</span>{' → '}
                {gradedAspects(p.planet, p.rashi).map((a, i) => {
                  const there = byRashi[a.toRashi].map(x => PLANET_SYMBOLS[x.planet]).join('');
                  return (
                    <span key={a.toRashi}>
                      {i > 0 && ', '}
                      {labelRashi(a.toRashi, lang, RASHIS[a.toRashi])} <span className={sub}>({ordinal(a.offset)} · {aspectPct(a.virupa)}%{there ? ` · ${there}` : ''})</span>
                    </span>
                  );
                })}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Drishti received (graded, strongest first) */}
      <div className="pt-2 border-t" style={{ borderColor: divider }}>
        <div className={`text-[10px] uppercase tracking-wider mb-1.5 ${sub}`}>{t('now.transitAspectedBy')}</div>
        {info.aspectsIn.length === 0 ? (
          <p className={`text-[11px] ${body}`}>{t('now.transitNoneAspect')}</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {[...info.aspectsIn].sort((a, b) => b.virupa - a.virupa).map(a => (
              <span key={a.planet} className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${isLight ? 'bg-slate-100 text-slate-600' : 'bg-white/8 text-white/65'}`}>
                <span style={{ color: PLANET_COLORS[a.planet] }}>{PLANET_SYMBOLS[a.planet]}</span> {labelPlanet(a.planet, lang)}
                <span className={a.benefic ? 'text-emerald-400' : 'text-rose-400'}> {a.benefic ? '▲' : '▼'}</span>
                <span className={sub}> {aspectPct(a.virupa)}%</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Predictions ───────────────────────────────────────────────────────────────

const TransitPredictions: React.FC<{
  predictions: ReturnType<typeof buildTransitPredictions>;
  isLight: boolean;
}> = ({ predictions, isLight }) => {
  const { t } = useLang();
  const head = isLight ? 'text-gray-800' : 'text-white';
  const sub = isLight ? 'text-slate-400' : 'text-white/35';

  return (
    <div className="mt-4 pt-4 border-t" style={{ borderColor: isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.07)' }}>
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--c-accent-2)' }} />
        <span className={`text-xs font-bold uppercase tracking-wider ${head}`}>{t('now.transitPredictionsTitle')}</span>
      </div>
      <p className={`text-[11px] mb-3 ${sub}`}>{t('now.transitPredictionsSubtitle')}</p>
      <TransitPredictionCards predictions={predictions} />
    </div>
  );
};

export default TransitChart;
