/**
 * The Graph tab, for a general audience: two pictures that need no astrology.
 *
 *   • Your life in chapters — every main period from birth to 90 as a band,
 *     named in plain words, with a "you are here" marker.
 *   • The year ahead — one line for the shape of the year (height = where the
 *     month stands among all periods), a ribbon for the short stretches, and a
 *     heatmap for the four life areas (colour = the trend, depth = how strong
 *     that standing is). The dates the periods change are marked on the line.
 *
 * Tapping a month opens its reading in plain words, with the astrology one tap
 * further down, exactly as on the Now and Timeline tabs. Each month is the
 * app's ordinary current-period reading taken on that date.
 */

import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, CircleDot, CalendarRange, Loader2, MinusCircle, Route } from 'lucide-react';
import { getYearAhead, type BirthData, type YearAhead, type MonthOutlook } from '../../services/api';
import { useLang } from '../../i18n/LanguageContext';
import { coreLang } from '../../i18n/translations';
import { useTheme } from '../../hooks/useTheme';
import { labelArea, labelPlanet, labelTrend } from '../../i18n/astroLabels';
import { LORD_HEX, TREND_HEX } from '../shared/BarCharts';
import { AreaReadingList } from '../shared/AreaReadingList';
import { PlainPeriodSummary } from '../shared/PlainPeriodSummary';
import { YEAR_TEXT } from '../../lib/core/text/readingText';
import { buildPlainSummary } from '../../lib/core/plainSummary';
import {
  monthYearLabel, monthShort, yearHeadline, yearContrast, groupStretches, changeLine,
  chapterHeadline, chapterInside, chapterSpan, ageRange, youAreHere, planetTheme, stretchCaption,
} from '../../lib/core/yearAhead';

const AREAS = ['career', 'wealth', 'relationships', 'health'] as const;
type TrendKey = keyof typeof TREND_HEX;

/** The overall rating's band, in the same four colours as the area trends. */
const ratingTrend = (r: number): TrendKey => (r >= 7 ? 'positive' : r >= 5 ? 'neutral' : r >= 3 ? 'mixed' : 'negative');
const trendOf = (t: string): TrendKey => (t in TREND_HEX ? (t as TrendKey) : 'neutral');

/** Trend colour as text. Gold and emerald stay readable on a light page. */
function toneText(tone: TrendKey, isLight: boolean): string {
  if (!isLight) return TREND_HEX[tone];
  if (tone === 'positive') return '#047857';
  if (tone === 'negative') return '#be123c';
  if (tone === 'mixed') return '#a16207';
  return '#475569';
}

/** Trend colour deepened by the month's standing (0–100). */
function depth(hex: string, pct: number): string {
  const t = Math.min(100, Math.max(0, pct)) / 100;
  const a = Math.round((0.55 + 0.45 * t) * 255).toString(16).padStart(2, '0');
  return `${hex}${a}`;
}

const SectionTitle: React.FC<{ icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; kicker: string; title: string; aside?: string }> = ({ icon: Icon, kicker, title, aside }) => (
  <div className="flex flex-wrap items-start justify-between gap-3">
    <div className="flex items-start gap-2.5 min-w-0">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: 'rgba(var(--c-accent-rgb),0.08)', border: '1px solid rgba(var(--c-accent-rgb),0.18)' }}
      >
        <Icon className="w-4 h-4" style={{ color: 'var(--c-accent-2)' } as React.CSSProperties} />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-white/45">{kicker}</div>
        <h3 className="text-base font-semibold text-white leading-snug">{title}</h3>
      </div>
    </div>
    {aside && <div className="text-xs text-white/50">{aside}</div>}
  </div>
);

// ── Life in chapters ────────────────────────────────────────────────────────

/** The lord being lived, and the different lord wrapped around it. */
function monthPair(m: MonthOutlook): { outer?: string; inner?: string } {
  const cp = m.prediction.currentPeriods;
  const ad = cp?.antardasha?.lord;
  const inner = cp?.pratyantardasha?.lord ?? ad;
  if (!inner) return {};
  const wrapped = ad && ad !== inner ? ad : cp?.mahadasha?.lord;
  return { outer: wrapped && wrapped !== inner ? wrapped : inner, inner };
}

const ChaptersCard: React.FC<{ data: YearAhead }> = ({ data }) => {
  const { lang } = useLang();
  const L = coreLang(lang);
  const now = data.chapters.find(c => c.isNow) ?? data.chapters[0];
  const sub = data.months[0]?.prediction.currentPeriods?.antardasha?.lord;
  const markerPct = Math.min(100, Math.max(0, (data.ageNow / data.lifeYears) * 100));

  return (
    <section className="glass-card rounded-2xl p-6 space-y-4">
      <SectionTitle
        icon={Route}
        kicker={YEAR_TEXT.chaptersTitle[L]}
        title={chapterHeadline(now.lord, L)}
        aside={chapterSpan(now.start, now.end, now.fromAge, now.toAge, L)}
      />
      {sub && <p className="text-[13px] text-white/75 leading-relaxed">{chapterInside(now.lord, sub, L)}</p>}

      <div className="overflow-x-auto pb-1">
        <div className="relative min-w-[720px] pt-8">
          <div className="absolute top-0 -translate-x-1/2" style={{ left: `${markerPct}%` }}>
            <span className="on-accent whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold text-white" style={{ background: 'var(--c-accent)' }}>
              {youAreHere(data.ageNow, L)}
            </span>
          </div>
          {/* A short pointer down to the band's edge — a full-height line would cut through the chapter's text. */}
          <div className="absolute top-6 h-2 w-0.5 rounded-full -translate-x-1/2" style={{ left: `${markerPct}%`, background: 'var(--c-accent)' }} aria-hidden />

          <div className="flex gap-[3px] h-[88px]">
            {data.chapters.map(c => {
              const years = Math.max(0.3, c.toAge - c.fromAge);
              const tiny = years < 2.5;
              const hex = LORD_HEX[c.lord] ?? '#94a3b8';
              return (
                <div
                  key={c.start}
                  title={`${labelPlanet(c.lord, lang)} — ${planetTheme(c.lord, L)}`}
                  className={`min-w-0 rounded-xl flex flex-col gap-1 overflow-hidden ${tiny ? '' : 'px-3 py-2.5'} ${c.isPast ? 'opacity-70' : ''}`}
                  style={{
                    flex: `${years} 1 0`,
                    background: `${hex}${c.isNow ? '33' : c.isPast ? '14' : '1f'}`,
                    border: c.isNow ? `2px solid ${hex}` : `1px solid ${hex}55`,
                  }}
                >
                  {!tiny && (
                    <>
                      <span className="text-sm font-semibold text-white truncate">{labelPlanet(c.lord, lang)}</span>
                      {c.isNow && sub && sub !== c.lord && (
                        <span className="text-[11px] font-medium truncate" style={{ color: LORD_HEX[sub] ?? '#fff' }}>{labelPlanet(sub, lang)}</span>
                      )}
                      <span className={`text-[11.5px] leading-snug text-white/70 ${c.isNow && sub && sub !== c.lord ? 'line-clamp-1' : 'line-clamp-2'}`}>{c.isNow && sub ? stretchCaption(c.lord, sub, L) : planetTheme(c.lord, L)}</span>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex gap-[3px] mt-2">
            {data.chapters.map(c => {
              const years = Math.max(0.3, c.toAge - c.fromAge);
              return (
                <div key={c.start} className="min-w-0 text-[11px] text-white/45 pl-1 whitespace-nowrap overflow-hidden" style={{ flex: `${years} 1 0` }}>
                  {years >= 2.5 ? ageRange(c.fromAge, c.toAge, L) : ''}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <p className="text-xs text-white/50">{YEAR_TEXT.chaptersHint[L]}</p>
    </section>
  );
};

// ── The year ahead ──────────────────────────────────────────────────────────

const PLOT = { w: 720, h: 156, l: 10, r: 10, t: 22, b: 8 };

const YearCard: React.FC<{ data: YearAhead; picked: number; onPick: (i: number) => void }> = ({ data, picked, onPick }) => {
  const { lang } = useLang();
  const isLight = useTheme();
  const L = coreLang(lang);
  const months = data.months;
  const n = months.length;

  const points = useMemo(() => months.map(m => {
    const pair = monthPair(m);
    return {
      year: m.year, month: m.month,
      percentile: m.prediction.overallPercentile ?? 50,
      main: pair.outer, sub: pair.inner,
    };
  }), [months]);
  const headline = useMemo(() => yearHeadline(points, L), [points, L]);
  const contrast = useMemo(() => yearContrast(points, L), [points, L]);
  const stretches = useMemo(() => groupStretches(months.map(m => {
    const { outer, inner } = monthPair(m);
    if (!inner) return undefined;
    return outer && outer !== inner ? `${outer}|${inner}` : inner;
  })), [months]);
  const changeAt = useMemo(() => {
    const hits = new Set<number>();
    for (const c of data.changes) {
      const d = new Date(c.date);
      const i = months.findIndex(m => m.year === d.getUTCFullYear() && m.month === d.getUTCMonth());
      if (i >= 0) hits.add(i);
    }
    return [...hits];
  }, [data.changes, months]);

  const spread = points.reduce((a, p) => Math.max(a, p.percentile), 0) - points.reduce((a, p) => Math.min(a, p.percentile), 100);
  const bestI = points.reduce((bi, p, i) => (p.percentile > points[bi].percentile ? i : bi), 0);
  const worstI = points.reduce((wi, p, i) => (p.percentile < points[wi].percentile ? i : wi), 0);

  const slot = (PLOT.w - PLOT.l - PLOT.r) / Math.max(1, n);
  const xAt = (i: number) => PLOT.l + slot * i + slot / 2;
  const yAt = (pct: number) => {
    const t = Math.min(100, Math.max(0, pct)) / 100;
    return PLOT.t + (PLOT.h - PLOT.t - PLOT.b) * (1 - t);
  };
  const floor = PLOT.h - PLOT.b;
  const line = points.map((p, i) => `${i ? 'L' : 'M'}${xAt(i).toFixed(1)},${yAt(p.percentile).toFixed(1)}`).join(' ');
  const area = n > 0 ? `${line} L${xAt(n - 1).toFixed(1)},${floor} L${xAt(0).toFixed(1)},${floor} Z` : '';
  const guide = isLight ? 'rgba(15,23,42,0.10)' : 'rgba(255,255,255,0.10)';
  const cols = `repeat(${n}, minmax(0, 1fr))`;

  return (
    <section className="glass-card rounded-2xl p-6 space-y-4">
      <SectionTitle icon={CalendarRange} kicker={YEAR_TEXT.yearTitle[L]} title={headline} />
      {contrast && <p className="text-[13px] text-white/75 leading-relaxed -mt-1">{contrast}</p>}

      <div className="flex flex-wrap gap-3 text-xs text-white/65">
        {(['positive', 'neutral', 'mixed', 'negative'] as TrendKey[]).map(k => (
          <span key={k} className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-[3px]" style={{ background: TREND_HEX[k] }} aria-hidden />
            {labelTrend(k, lang)}
          </span>
        ))}
      </div>

      <div className="overflow-x-auto pb-1">
        <div className="min-w-[520px] space-y-2.5">
          <div className="flex gap-2">
            <div className="w-16 shrink-0 flex flex-col">
              <div className="flex-1 flex items-center text-[11px] font-semibold leading-tight text-white">{YEAR_TEXT.overall[L]}</div>
              <div className="h-11 mt-1.5 shrink-0" aria-hidden />
            </div>
            <div className="flex-1 min-w-0">
              <div className="relative">
                <svg viewBox={`0 0 ${PLOT.w} ${PLOT.h}`} className="block w-full h-auto" aria-hidden>
                  <defs>
                    <linearGradient id="year-ahead-fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="var(--c-accent)" stopOpacity="0.38" />
                      <stop offset="1" stopColor="var(--c-accent)" stopOpacity="0.02" />
                    </linearGradient>
                  </defs>
                  {[25, 50, 75].map(g => (
                    <line key={g} x1={PLOT.l} x2={PLOT.w - PLOT.r} y1={yAt(g)} y2={yAt(g)} stroke={guide} strokeWidth="1" />
                  ))}
                  {n > 0 && (
                    <rect
                      x={PLOT.l + slot * picked}
                      y={PLOT.t - 6}
                      width={slot}
                      height={floor - PLOT.t + 6}
                      rx="8"
                      fill="var(--c-accent)"
                      opacity="0.12"
                    />
                  )}
                  {area && <path d={area} fill="url(#year-ahead-fill)" />}
                  {line && <path d={line} fill="none" stroke="var(--c-accent)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />}
                  {changeAt.map(i => (
                    <line
                      key={i}
                      x1={PLOT.l + slot * i}
                      x2={PLOT.l + slot * i}
                      y1={PLOT.t}
                      y2={floor}
                      stroke="var(--c-accent-2)"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />
                  ))}
                  {months.map((m, i) => {
                    const tone = ratingTrend(m.prediction.overallRating);
                    const y = yAt(points[i].percentile);
                    const extreme = spread >= 15 && (i === bestI || i === worstI);
                    return (
                      <g key={m.at}>
                        <circle
                          cx={xAt(i)}
                          cy={y}
                          r={i === picked ? 6.5 : 4.2}
                          fill={TREND_HEX[tone]}
                          stroke={extreme ? 'var(--c-accent-2)' : (isLight ? '#ffffff' : '#0b1220')}
                          strokeWidth={i === picked || extreme ? 2.2 : 1.4}
                        />
                        <text
                          x={xAt(i)}
                          y={y - 11}
                          textAnchor="middle"
                          fontSize="12"
                          fontWeight="700"
                          fontFamily="inherit"
                          fill={toneText(tone, isLight)}
                        >
                          {m.prediction.overallRating}
                        </text>
                      </g>
                    );
                  })}
                </svg>
                <div className="absolute inset-0 grid" style={{ gridTemplateColumns: cols }}>
                  {months.map((m, i) => (
                    <div key={m.at} className="cursor-pointer" onClick={() => onPick(i)} />
                  ))}
                </div>
              </div>
              <div className="grid gap-1 mt-1.5" style={{ gridTemplateColumns: cols }}>
                {months.map((m, i) => (
                  <button
                    key={m.at}
                    type="button"
                    onClick={() => onPick(i)}
                    aria-pressed={i === picked}
                    aria-label={`${monthYearLabel(m.year, m.month, L)}, ${YEAR_TEXT.overall[L]} ${m.prediction.overallRating}`}
                    className={`min-h-11 rounded-lg flex flex-col items-center justify-center ${
                      i === picked ? 'on-accent text-white' : 'text-white/70 hover:bg-white/[0.05]'
                    }`}
                    style={i === picked ? { background: 'var(--c-accent)' } : undefined}
                  >
                    <span className="text-[11px] font-semibold leading-none">{monthShort(m.month, L)}</span>
                    <span className="text-[10px] leading-none mt-0.5 opacity-75">
                      {m.isNow ? YEAR_TEXT.now[L] : (i === 0 || m.month === 0 ? String(m.year).slice(2) : '')}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {stretches.length > 0 && (
            <div className="flex gap-2">
              <div className="w-16 shrink-0 text-[10px] leading-tight text-white/45 pt-1">{YEAR_TEXT.stretches[L]}</div>
              <div className="flex-1 min-w-0 grid gap-1" style={{ gridTemplateColumns: cols }}>
                {stretches.map(s => {
                  const [host, fine] = s.lord.includes('|') ? s.lord.split('|') : [s.lord, s.lord];
                  const caption = stretchCaption(host, fine, L);
                  const name = labelPlanet(fine, lang);
                  const title = host !== fine ? `${name} · ${labelPlanet(host, lang)} — ${caption}` : caption;
                  const hex = LORD_HEX[fine] ?? '#94a3b8';
                  const live = picked >= s.start && picked < s.start + s.span;
                  return (
                    <div
                      key={`${s.lord}-${s.start}`}
                      title={title}
                      className="min-w-0 rounded-lg px-1.5 py-1"
                      style={{
                        gridColumn: `${s.start + 1} / span ${s.span}`,
                        background: `${hex}22`,
                        boxShadow: `inset 0 2px 0 ${hex}${live ? ', inset 0 0 0 1.5px var(--c-accent)' : ''}`,
                      }}
                    >
                      <span className="block text-[11px] font-semibold text-white truncate">{name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-1">
            {AREAS.map(area => (
              <div key={area} className="flex gap-2 items-center">
                <div className="w-16 shrink-0 text-[10px] leading-tight text-white/70 line-clamp-2" title={labelArea(area, lang)}>
                  {labelArea(area, lang)}
                </div>
                <div className="flex-1 min-w-0 grid gap-1" style={{ gridTemplateColumns: cols }}>
                  {months.map((m, i) => {
                    const p = m.prediction.predictions[area];
                    const tone = trendOf(p?.trend ?? 'neutral');
                    const pct = p?.explanation?.percentile ?? 50;
                    return (
                      <div
                        key={m.at}
                        title={`${labelArea(area, lang)} · ${monthYearLabel(m.year, m.month, L)} · ${labelTrend(tone, lang)}`}
                        onClick={() => onPick(i)}
                        className="h-8 rounded-md cursor-pointer"
                        style={{
                          background: depth(TREND_HEX[tone], pct),
                          boxShadow: i === picked ? 'inset 0 0 0 2px var(--c-accent)' : undefined,
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {data.changes.length > 0 && (
        <ul className="space-y-1.5 border-t border-white/8 pt-3">
          {data.changes.map(c => (
            <li key={c.date} className="flex items-start gap-2 text-[13px] text-white/75">
              <CircleDot className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: 'var(--c-accent-2)' } as React.CSSProperties} />
              <span>{changeLine(c, L)}</span>
            </li>
          ))}
        </ul>
      )}

      <p className="text-[11px] text-white/45 leading-relaxed">{YEAR_TEXT.footnote[L]}</p>
    </section>
  );
};

// ── The month you tapped ────────────────────────────────────────────────────

const MonthCard: React.FC<{ month: MonthOutlook }> = ({ month }) => {
  const { lang, t } = useLang();
  const L = coreLang(lang);
  const cp = month.prediction.currentPeriods;
  const s = useMemo(() => {
    if (!cp?.mahadasha?.end || !cp.antardasha?.end) return null;
    return buildPlainSummary({
      lang: L,
      overallRating: month.prediction.overallRating,
      overallPercentile: month.prediction.overallPercentile,
      predictions: month.prediction.predictions,
      periods: {
        mahadasha: cp.mahadasha,
        antardasha: cp.antardasha,
        pratyantardasha: cp.pratyantardasha,
        sookshmaDasha: cp.sookshmaDasha,
      },
      indicators: month.prediction.indicators,
    });
  }, [L, month, cp]);
  return (
    <section className="glass-card rounded-2xl p-6 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="text-[10px] uppercase tracking-wider text-white/45">
          {monthYearLabel(month.year, month.month, L)}{month.isNow ? ` · ${YEAR_TEXT.now[L]}` : ''}
        </div>
        <div className="text-right shrink-0">
          <div className="text-[10px] text-white/45">{t('dasha.rating')}</div>
          <div className="text-lg font-bold text-white">{month.prediction.overallRating}/10</div>
        </div>
      </div>
      {s ? (
        <>
          <h3 className="text-[15px] font-medium text-white leading-relaxed">{s.headline}</h3>
          {s.combination && <p className="text-[13px] text-white/75 leading-relaxed">{s.combination}</p>}
          {s.standing && <p className="text-xs text-white/60">{s.standing}</p>}
          {s.combos && <p className="text-[12px] text-white/60 leading-relaxed">{s.combos}</p>}
          <div className="grid sm:grid-cols-2 gap-2">
            <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/5 p-3">
              <div className="flex items-center gap-1.5 mb-1 text-[10px] uppercase tracking-wider text-emerald-300">
                <CheckCircle className="w-3 h-3" /> {s.labels.goodFor}
              </div>
              <p className="text-[13px] text-white/80 leading-relaxed">{s.goodFor}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <div className="flex items-center gap-1.5 mb-1 text-[10px] uppercase tracking-wider text-white/50">
                <MinusCircle className="w-3 h-3" /> {s.labels.goEasy}
              </div>
              <p className="text-[13px] text-white/80 leading-relaxed">{s.goEasy}</p>
            </div>
          </div>
        </>
      ) : (
        <PlainPeriodSummary prediction={month.prediction} className="-mt-3" />
      )}
      <AreaReadingList prediction={month.prediction} />
    </section>
  );
};

// ── Tab entry ───────────────────────────────────────────────────────────────

export const LifeOutlookTab: React.FC<{ birthData: BirthData }> = ({ birthData }) => {
  const { lang, t } = useLang();
  const L = coreLang(lang);
  const [picked, setPicked] = useState(0);

  const { data, isLoading, error } = useQuery({
    queryKey: ['yearAhead', birthData, lang],
    queryFn: () => getYearAhead(birthData, 12, L),
    staleTime: 30 * 60_000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-white/45 text-sm py-12 justify-center">
        <Loader2 className="w-4 h-4 animate-spin" /> {YEAR_TEXT.loading[L]}
      </div>
    );
  }
  if (error || !data || !data.months.length) {
    return <div className="glass-card rounded-2xl p-6 text-rose-300 text-sm">{t('now.failed')}</div>;
  }

  const month = data.months[Math.min(picked, data.months.length - 1)];
  return (
    <div className="space-y-4">
      <ChaptersCard data={data} />
      <YearCard data={data} picked={picked} onPick={setPicked} />
      <MonthCard month={month} />
    </div>
  );
};

export default LifeOutlookTab;
