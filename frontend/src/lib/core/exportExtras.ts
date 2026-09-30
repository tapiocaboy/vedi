/**
 * Extra sections for the birth-chart Markdown export: the plain-language
 * life-strength map (Ashtakavarga), current transit notes, the graded Sade Sati
 * (Erashtaka) timeline with its dasha windows, the dosha checks and the
 * Transit Impact outlook. English, like the rest of the export.
 */

import type { Chart } from '../../types/astrology';
import type { DashaPredictionData } from '../../services/api';
import type { DoshaReport } from '../services/doshaService';
import type { TransitImpactReport } from '../services/transitImpactService';
import { computeAshtakavarga, sarvaToLabel, PLANETS, type Contributor } from './ashtakavarga';
import { RASHIS, RASHI_ENGLISH } from './rashi';
import { labelHouseTheme, labelHouseCovers, labelPlanetTheme } from '../../i18n/astroLabels';
import { happeningHeadline, houseTheme, areaLabel, IMPACT_AREAS, overlayKind } from './transitImpact';

type Push = (s?: string) => void;

const fmt = (iso: string | number) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? String(iso) : d.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: '2-digit' });
};
const fmtMonth = (iso: string | number) => new Date(iso).toLocaleDateString('en-GB', { year: 'numeric', month: 'short' });
const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
const ord = (n: number) => `${n}${['th', 'st', 'nd', 'rd'][(n % 100 >= 11 && n % 100 <= 13) ? 0 : n % 10] ?? 'th'}`;

const BAND_WORD: Record<ReturnType<typeof sarvaToLabel>, string> = {
  'very strong': 'Very easy', 'strong': 'Easy', 'average': 'Average', 'weak': 'Needs effort', 'very weak': 'Uphill',
};
const TONE_WORD: Record<string, string> = { good: 'Supportive', mixed: 'Mixed', bad: 'Testing' };
const BACKING = ['Little backing', 'Some backing', 'Fair backing', 'Good backing', 'Strong backing'];
const backingLevel = (b: number) => (b <= 2 ? 0 : b === 3 ? 1 : b === 4 ? 2 : b === 5 ? 3 : 4);

/** Life-strength map — Ashtakavarga read as life areas. Needs only the chart. */
export function pushLifeStrengthMap(push: Push, chart: Chart): void {
  const rashis = { Lagna: chart.ascendant.rashiIndex } as Record<Contributor, number>;
  for (const p of chart.planets) {
    const name = titleCase(p.planet) as Contributor;
    if ((PLANETS as readonly string[]).includes(name)) rashis[name] = p.rashiIndex;
  }
  if (PLANETS.some(p => rashis[p] == null)) return;
  const av = computeAshtakavarga(rashis);
  const lagna = chart.ascendant.rashiIndex;

  push('## Life-Strength Map (Ashtakavarga)');
  push();
  push('_Think of it as a vote: at birth the Sun, Moon, five planets and the Ascendant each cast up to 8 votes for every sign. Each sign’s total is read here as the life area (house) it falls in. High = that area comes more naturally; low = it takes more effort. The classical average is 28._');
  push();
  push('| House | Life area | Covers | Sign | Score | Reading |');
  push('| --- | --- | --- | --- | --- | --- |');
  for (let h = 1; h <= 12; h++) {
    const r = (lagna + h - 1) % 12;
    const s = av.sarva[r];
    push(`| ${h} | ${labelHouseTheme(h, 'en')} | ${labelHouseCovers(h, 'en')} | ${RASHIS[r]} (${RASHI_ENGLISH[r]}) | ${s} | ${BAND_WORD[sarvaToLabel(s)]} |`);
  }
  push();
  push('### How well each planet is backed');
  push();
  push('| Planet | Represents | Votes in its birth sign | Reading |');
  push('| --- | --- | --- | --- |');
  for (const p of [...PLANETS].sort((a, b) => av.selfStrength[b] - av.selfStrength[a])) {
    const b = av.selfStrength[p];
    push(`| ${p} | ${labelPlanetTheme(p, 'en')} | ${b}/8 | ${BACKING[backingLevel(b)]} |`);
  }
  push();
}

/** Current transit notes (Gochara) — includes the graded Erashtaka lines. */
export function pushCurrentTransits(push: Push, prediction: DashaPredictionData): void {
  if (!prediction.importantTransits?.length) return;
  push('## Current Transits (Gochara)');
  push();
  push('_Where the slow planets sit today relative to the natal Moon and Ascendant. ▲ marks a factor that makes Saturn’s pressure heavier for this chart, ▼ one that eases it._');
  push();
  for (const n of prediction.importantTransits) push(`- ${n}`);
  push();
}

/** Graded Sade Sati (Erashtaka) timeline plus the dosha checks. */
export function pushDoshas(push: Push, report: DoshaReport): void {
  const ss = report.sadeSati;
  push('## Saturn’s 7½-Year Transit (Sade Sati / Erashtaka)');
  push();
  push(`_Saturn over the 12th, 1st and 2nd signs from the natal Moon (${ss.natalMoonSignName}). Each phase is graded 0–10 for this chart — Saturn’s dignity, the Moon sign, the Lagna, Ashtakavarga and natal Moon strength — and each antardasha inside a phase is graded again with the transiting Jupiter and nodes. Dates are approximate (±2 weeks)._`);
  push();
  // Saturn's retrograde loops split one cycle into several short periods and
  // make phases alternate; merge them so each cycle reads once, phase by phase.
  type PhaseRow = { phase: string; sign: string; start: string; end: string; grade?: NonNullable<typeof ss.periods[number]['phases'][number]['grade']>; windows: NonNullable<typeof ss.periods[number]['phases'][number]['grade']>['windows'] };
  const cycles = new Map<number, { start: string; end: string; status: string; phases: PhaseRow[] }>();
  for (const p of ss.periods) {
    const c = cycles.get(p.cycle ?? 0) ?? { start: p.start, end: p.end, status: 'past', phases: [] };
    c.end = p.end;
    if (p.status === 'current' || (p.status === 'upcoming' && c.status !== 'current')) c.status = p.status;
    for (const ph of p.phases) {
      const row = c.phases.find(r => r.phase === ph.phase);
      if (row) {
        if (ph.start < row.start) row.start = ph.start;
        if (ph.end > row.end) row.end = ph.end;
        row.windows.push(...(ph.grade?.windows ?? []));
      } else {
        c.phases.push({ phase: ph.phase, sign: ph.signName, start: ph.start, end: ph.end, grade: ph.grade, windows: [...(ph.grade?.windows ?? [])] });
      }
    }
    cycles.set(p.cycle ?? 0, c);
  }
  const ORDER: Record<string, number> = { rising: 0, peak: 1, setting: 2 };
  // Detail only where it is actionable: the running cycle and the next one.
  const detailed = new Set<number>();
  const running = [...cycles.entries()].find(([, c]) => c.status === 'current')?.[0];
  const next = [...cycles.entries()].find(([, c]) => c.status === 'upcoming')?.[0];
  if (running != null) detailed.add(running);
  if (next != null) detailed.add(next);

  for (const [n, c] of cycles) {
    const status = c.status === 'current' ? ' — **active now**' : c.status === 'upcoming' ? ' — upcoming' : '';
    push(`### Cycle ${n}: ${fmtMonth(c.start)} – ${fmtMonth(c.end)}${status}`);
    push();
    for (const r of c.phases.sort((x, y) => ORDER[x.phase] - ORDER[y.phase])) {
      const g = r.grade;
      push(`- **${titleCase(r.phase)} phase** — Saturn in ${r.sign} (${fmtMonth(r.start)} – ${fmtMonth(r.end)})${g ? ` · **${g.levelLabel}** (${g.intensity.toFixed(1)}/10)` : ''}`);
      if (!g || !detailed.has(n)) continue;
      for (const f of g.aggravating.slice(0, 3)) push(`  - ▲ ${f}`);
      for (const f of g.mitigating.slice(0, 3)) push(`  - ▼ ${f}`);
      // Merge the same dasha window when a retrograde loop split it.
      const wins = [...r.windows].sort((x, y) => x.start.localeCompare(y.start))
        .reduce<typeof r.windows>((acc, w) => {
          const last = acc[acc.length - 1];
          if (last && last.maha === w.maha && last.antar === w.antar) {
            if (w.end > last.end) last.end = w.end;
            if (w.intensity > last.intensity) Object.assign(last, { intensity: w.intensity, verdictLabel: w.verdictLabel, drivers: w.drivers });
          } else acc.push({ ...w });
          return acc;
        }, []);
      for (const w of wins) {
        push(`  - ${fmtMonth(w.start)} – ${fmtMonth(w.end)} · ${w.maha}–${w.antar} dasha · ${w.verdictLabel} (${w.intensity.toFixed(1)})${w.drivers.length ? ` — ${w.drivers.join(' ')}` : ''}`);
      }
    }
    push();
  }

  push('## Doshas');
  push();
  push('| Dosha | Present | Severity | Summary |');
  push('| --- | --- | --- | --- |');
  for (const d of report.doshas) {
    push(`| ${d.name} | ${d.present ? 'Yes' : 'No'} | ${d.present ? d.severity : '—'} | ${d.summary} |`);
  }
  push();
  for (const d of report.doshas.filter(x => x.present)) {
    push(`**${d.name}**`);
    for (const f of d.factors) push(`- Why: ${f}`);
    for (const c of d.cancellations) push(`- Cancellation: ${c}`);
    push();
  }
}

/** Transit Impact — what is happening now and the next big sign changes. */
export function pushTransitImpact(push: Push, report: TransitImpactReport): void {
  const now = Date.parse(report.asOf);
  const current = report.segments.filter(s => Date.parse(s.start) <= now && Date.parse(s.end) > now);
  const upcoming = report.segments
    .filter(s => ['SATURN', 'JUPITER', 'RAHU', 'KETU'].includes(s.planet) && !s.startClipped && Date.parse(s.start) > now)
    .sort((a, b) => Date.parse(a.start) - Date.parse(b.start))
    .slice(0, 8);

  push('## Transit Impact');
  push();
  push('_How the major sign changes land on this chart’s predictions, scored from the Moon sign, Ascendant, Ashtakavarga and the running dasha._');
  push();
  if (current.length) {
    push('### Happening now');
    push();
    push('| Transit | Until | From Moon / Asc | Tone | Lifts | Tests |');
    push('| --- | --- | --- | --- | --- | --- |');
    for (const s of current) {
      const lifts = IMPACT_AREAS.filter(a => overlayKind(s.areas[a]) === 'lifts').map(a => areaLabel(a)).join(', ') || '—';
      const tests = IMPACT_AREAS.filter(a => overlayKind(s.areas[a]) === 'tests').map(a => areaLabel(a)).join(', ') || '—';
      push(`| ${happeningHeadline(s)} | ${s.endClipped ? 'beyond window' : fmt(s.end)} | ${ord(s.houseFromMoon)} / ${ord(s.houseFromLagna)} (${houseTheme(s.houseFromLagna)}) | ${TONE_WORD[s.tone]} | ${lifts} | ${tests} |`);
    }
    push();
    for (const s of current.filter(x => x.tags.length)) {
      for (const t of s.tags) push(`- **${t.label}:** ${t.note}`);
    }
    if (current.some(x => x.tags.length)) push();
  }
  if (upcoming.length) {
    push('### Major transitions ahead');
    push();
    push('| Date | Change | From Moon / Asc | Tone | Advice |');
    push('| --- | --- | --- | --- | --- |');
    for (const s of upcoming) {
      push(`| ${fmt(s.start)} | ${happeningHeadline(s)} | ${ord(s.houseFromMoon)} / ${ord(s.houseFromLagna)} (${houseTheme(s.houseFromLagna)}) | ${TONE_WORD[s.tone]} | ${s.advice} |`);
    }
    push();
  }
}
