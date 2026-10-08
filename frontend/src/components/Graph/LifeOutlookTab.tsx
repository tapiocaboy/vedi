/**
 * The Graph tab, for a general audience: two pictures that need no astrology.
 *
 *   • Your life in chapters — every main period from birth to 90 as a band,
 *     named in plain words, with a "you are here" marker.
 *   • The year ahead — twelve months side by side: the overall reading and the
 *     four life areas as bars (height = where the month stands among all
 *     periods, colour = the trend label used everywhere in the app), the short
 *     stretches underneath, and the dates the periods change.
 *
 * Tapping a month opens its reading in plain words, with the astrology one tap
 * further down, exactly as on the Now and Timeline tabs. Each month is the
 * app's ordinary current-period reading taken on that date.
 */

import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Route, CalendarRange, CircleDot } from 'lucide-react';
import { getYearAhead, type BirthData, type YearAhead, type MonthOutlook } from '../../services/api';
import { useLang } from '../../i18n/LanguageContext';
import { coreLang } from '../../i18n/translations';
import { labelArea, labelPlanet, labelTrend } from '../../i18n/astroLabels';
import { LORD_HEX, TREND_HEX } from '../shared/BarCharts';
import { AreaReadingList } from '../shared/AreaReadingList';
import { PlainPeriodSummary } from '../shared/PlainPeriodSummary';
import { YEAR_TEXT } from '../../lib/core/text/readingText';
import { plainSubPeriodLine } from '../../lib/core/plainSummary';
import {
  monthYearLabel, monthShort, yearHeadline, groupStretches, changeLine,
  chapterHeadline, chapterSpan, ageRange, youAreHere, planetTheme,
} from '../../lib/core/yearAhead';

const AREAS = ['career', 'wealth', 'relationships', 'health'] as const;
type TrendKey = keyof typeof TREND_HEX;

/** The overall rating's band, in the same four colours as the area trends. */
const ratingTrend = (r: number): TrendKey => (r >= 7 ? 'positive' : r >= 5 ? 'neutral' : r >= 3 ? 'mixed' : 'negative');
const trendOf = (t: string): TrendKey => (t in TREND_HEX ? (t as TrendKey) : 'neutral');

/** Bar heights in px for a 0–100 standing. */
const OVERALL_H = 88, AREA_H = 36;
const barPx = (pct: number, max: number) => Math.max(4, Math.round((Math.min(100, Math.max(0, pct)) / 100) * max));

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

const ChaptersCard: React.FC<{ data: YearAhead }> = ({ data }) => {
  const { lang } = useLang();
  const L = coreLang(lang);
  const now = data.chapters.find(c => c.isNow) ?? data.chapters[0];
  const markerPct = Math.min(100, Math.max(0, (data.ageNow / data.lifeYears) * 100));

  return (
    <section className="glass-card rounded-2xl p-6 space-y-4">
      <SectionTitle
        icon={Route}
        kicker={YEAR_TEXT.chaptersTitle[L]}
        title={chapterHeadline(now.lord, L)}
        aside={chapterSpan(now.start, now.end, now.fromAge, now.toAge, L)}
      />

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
                      <span className="text-[11.5px] leading-snug text-white/70 line-clamp-2">{planetTheme(c.lord, L)}</span>
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

const YearCard: React.FC<{ data: YearAhead; picked: number; onPick: (i: number) => void }> = ({ data, picked, onPick }) => {
  const { lang } = useLang();
  const L = coreLang(lang);
  const months = data.months;

  const headline = useMemo(() => yearHeadline(
    months.map(m => ({ year: m.year, month: m.month, percentile: m.prediction.overallPercentile ?? 50 })), L,
  ), [months, L]);
  const stretches = useMemo(() => groupStretches(months.map(m => m.prediction.currentPeriods?.pratyantardasha?.lord)), [months]);

  const cellBg = (i: number) => (i === picked ? 'bg-white/[0.06] rounded-lg' : '');
  const grid: React.CSSProperties = { gridTemplateColumns: `7.5rem repeat(${months.length}, minmax(0, 1fr))` };

  return (
    <section className="glass-card rounded-2xl p-6 space-y-4">
      <SectionTitle icon={CalendarRange} kicker={YEAR_TEXT.yearTitle[L]} title={headline} />

      <div className="flex flex-wrap gap-3 text-xs text-white/65">
        {(['positive', 'neutral', 'mixed', 'negative'] as TrendKey[]).map(k => (
          <span key={k} className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-[3px]" style={{ background: TREND_HEX[k] }} aria-hidden />
            {labelTrend(k, lang)}
          </span>
        ))}
      </div>

      <div className="overflow-x-auto pb-1">
        <div className="grid min-w-[720px] gap-x-1.5 gap-y-1.5 items-end" style={grid}>
          <div />
          {months.map((m, i) => (
            <button
              key={m.at}
              type="button"
              onClick={() => onPick(i)}
              aria-pressed={i === picked}
              aria-label={monthYearLabel(m.year, m.month, L)}
              className={`min-h-[44px] rounded-lg flex flex-col items-center justify-center border transition-colors ${
                i === picked ? 'on-accent text-white border-transparent' : 'border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.07]'
              }`}
              style={i === picked ? { background: 'var(--c-accent)' } : undefined}
            >
              <span className="text-xs font-semibold">{monthShort(m.month, L)}</span>
              <span className="text-[10px] opacity-75">{m.isNow ? YEAR_TEXT.now[L] : String(m.year).slice(2)}</span>
            </button>
          ))}

          <div className="text-[13px] font-semibold text-white pb-1">{YEAR_TEXT.overall[L]}</div>
          {months.map((m, i) => (
            <div key={m.at} className={`flex flex-col justify-end ${cellBg(i)}`} style={{ height: OVERALL_H + 6 }}>
              <div
                className="mx-1.5 rounded-t-md rounded-b-sm"
                style={{ height: barPx(m.prediction.overallPercentile ?? 50, OVERALL_H), background: TREND_HEX[ratingTrend(m.prediction.overallRating)] }}
              />
            </div>
          ))}

          {AREAS.map(area => (
            <React.Fragment key={area}>
              <div className="text-xs text-white/70 pb-0.5">{labelArea(area, lang)}</div>
              {months.map((m, i) => {
                const p = m.prediction.predictions[area];
                return (
                  <div key={m.at} className={`flex flex-col justify-end ${cellBg(i)}`} style={{ height: AREA_H + 4 }}>
                    <div
                      className="mx-2 rounded-t rounded-b-sm"
                      style={{ height: barPx(p?.explanation?.percentile ?? 50, AREA_H), background: TREND_HEX[trendOf(p?.trend ?? 'neutral')] }}
                    />
                  </div>
                );
              })}
            </React.Fragment>
          ))}

          <div className="text-[11px] text-white/45 self-start pt-2">{YEAR_TEXT.stretches[L]}</div>
          {stretches.map(s => (
            <div
              key={`${s.lord}-${s.start}`}
              className="self-start min-w-0 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2 flex flex-col gap-0.5"
              style={{ gridColumn: `${s.start + 2} / span ${s.span}` }}
              title={planetTheme(s.lord, L)}
            >
              <span className="text-xs font-semibold text-white truncate">{labelPlanet(s.lord, lang)}</span>
              {/* A one-month column is too narrow for the theme; it stays in the tooltip. */}
              {s.span > 1 && <span className="text-[11px] leading-snug text-white/60 line-clamp-2">{planetTheme(s.lord, L)}</span>}
            </div>
          ))}
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
  const pd = month.prediction.currentPeriods?.pratyantardasha?.lord;
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
      <PlainPeriodSummary prediction={month.prediction} extraLine={pd ? plainSubPeriodLine(pd, L) : undefined} className="-mt-3" />
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
