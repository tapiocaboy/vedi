/**
 * Western birth-chart Markdown export — the Western counterpart to
 * `../exportChart.ts`. Assembles birth data, the Big 3, the full planet
 * table, house cusps, the aspect grid, and any aspect patterns into a
 * portable Markdown document.
 */

import type { WesternChart } from '../../../types/westernAstrology';
import type { WesternNatalReport } from './natal';
import { westernPlanetName } from './text/planetText';
import { PATTERN_TEXT } from './text/patternText';
import { DIGNITY_TEXT } from './text/dignityText';
import { formatOrb } from './aspects';
import { pick, type Lang } from '../i18n';

function fmtDateTime(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  return {
    date: iso.slice(0, 10),
    time: d.toISOString().slice(11, 16),
  };
}

export function buildWesternChartMarkdown(chart: WesternChart, natal: WesternNatalReport, lang: Lang = 'en'): string {
  const { date, time } = fmtDateTime(chart.birthData.date);
  const lines: string[] = [];

  lines.push(`# Western Birth Chart`);
  lines.push('');
  lines.push(`**Date:** ${date} · **Time:** ${time} · **Timezone:** ${chart.birthData.timezone}`);
  lines.push(`**Location:** ${chart.birthData.latitude.toFixed(4)}, ${chart.birthData.longitude.toFixed(4)}`);
  lines.push(`**System:** Western (tropical zodiac, Placidus houses)`);
  lines.push('');
  lines.push(`**Sun:** ${natal.meta.sunSign} · **Moon:** ${natal.meta.moonSign} · **Rising:** ${natal.meta.risingSign}`);
  lines.push('');

  lines.push(`## Planets`);
  lines.push('');
  lines.push(`| Body | Sign | Degree | House | Dignity | Retrograde |`);
  lines.push(`|---|---|---|---|---|---|`);
  for (const p of chart.planets) {
    lines.push(`| ${westernPlanetName(p.planet, lang)} | ${p.sign} | ${p.degreeInSign.toFixed(2)}° | ${p.house} | ${pick(DIGNITY_TEXT[p.dignity].label, lang)} | ${p.isRetrograde ? '℞' : '—'} |`);
  }
  lines.push(`| Ascendant | ${chart.ascendant.sign} | ${chart.ascendant.degreeInSign.toFixed(2)}° | 1 | — | — |`);
  lines.push(`| Midheaven | ${chart.midheaven.sign} | ${chart.midheaven.degreeInSign.toFixed(2)}° | 10 | — | — |`);
  lines.push('');

  lines.push(`## House Cusps (Placidus)`);
  lines.push('');
  lines.push(`| House | Sign | Degree |`);
  lines.push(`|---|---|---|`);
  for (const h of chart.houses) {
    lines.push(`| ${h.house} | ${h.sign} | ${h.degreeInSign.toFixed(2)}° |`);
  }
  lines.push('');

  lines.push(`## Aspects`);
  lines.push('');
  const shownAspects = chart.aspects.filter(a => a.strength >= 0.25);
  if (shownAspects.length === 0) {
    lines.push(`_None within orb._`);
  } else {
    lines.push(`| Body A | Aspect | Body B | Orb |`);
    lines.push(`|---|---|---|---|`);
    for (const a of shownAspects) {
      lines.push(`| ${westernPlanetName(a.bodyA, lang)} | ${a.type} | ${westernPlanetName(a.bodyB, lang)} | ${formatOrb(a.orb)} |`);
    }
  }
  lines.push('');

  lines.push(`## Aspect Patterns`);
  lines.push('');
  if (chart.patterns.length === 0) {
    lines.push(`_None detected._`);
  } else {
    for (const p of chart.patterns) {
      const text = PATTERN_TEXT[p.type];
      lines.push(`- **${pick(text.name, lang)}** — ${p.bodies.map(b => westernPlanetName(b, lang)).join(', ')}`);
    }
  }
  lines.push('');

  lines.push(`## Natal Reading`);
  lines.push('');
  for (const line of natal.lines) {
    lines.push(`### ${line.title}`);
    lines.push(line.summary);
    for (const s of line.sections) {
      lines.push('');
      lines.push(`**${s.heading}**`);
      if (s.body) lines.push(s.body);
      if (s.bullets) for (const b of s.bullets) lines.push(`- ${b}`);
    }
    lines.push('');
  }

  lines.push('---');
  lines.push('_Computed locally with Swiss Ephemeris · tropical Western analysis · for reflection, not deterministic prediction._');

  return lines.join('\n');
}

export function downloadWesternChartMarkdown(chart: WesternChart, natal: WesternNatalReport, lang: Lang = 'en'): void {
  const md = buildWesternChartMarkdown(chart, natal, lang);
  const { date } = fmtDateTime(chart.birthData.date);
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `western-chart-${date}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
