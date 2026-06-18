/**
 * Birth-chart Markdown export.
 *
 * Assembles a portable Markdown document from a generated chart: birth
 * date/time/location, Sun & Moon positions, the full D1 planetary table, the
 * D9 (Navamsa) and D10 (Dasamsa) divisional charts, and the dasha periods.
 */

import type { Chart } from '../../types/astrology';
import { RASHIS, RASHI_ENGLISH } from './rashi';
import { computeVargas } from './vargas';

function titleCase(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

function houseFrom(rashiIndex: number, ascIndex: number): number {
  return ((rashiIndex - ascIndex + 12) % 12) + 1;
}

function fmtDateTime(iso: string): { date: string; time: string } {
  const [datePart = '', rest = ''] = iso.split('T');
  const time = rest.replace('Z', '').slice(0, 5) || '—';
  return { date: datePart || '—', time };
}

function fmtIsoDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: '2-digit' });
}

function dignityLabel(d: string): string {
  return d.split('-').map(titleCase).join(' ');
}

export function buildChartMarkdown(chart: Chart): string {
  const bd = chart.birthData;
  const asc = chart.ascendant;
  const ascIndex = asc.rashiIndex;
  const { date, time } = fmtDateTime(bd.date);

  // Divisional charts (D9 / D10).
  const longitudes: Record<string, number> = {};
  const retro: Record<string, boolean> = {};
  for (const p of chart.planets) {
    longitudes[titleCase(p.planet)] = p.longitude;
    retro[titleCase(p.planet)] = p.isRetrograde;
  }
  const vargas = computeVargas({ longitudes, retro, ascendantLongitude: asc.longitude });

  const L: string[] = [];
  const push = (s = '') => L.push(s);

  // ── Header ────────────────────────────────────────────────────────────
  push('# Birth Chart (Janma Kundali)');
  push();
  push(`_Exported from TryTellMe on ${new Date().toLocaleString('en-GB')}_`);
  push();

  // ── Birth details ─────────────────────────────────────────────────────
  push('## Birth Details');
  push();
  push('| Field | Value |');
  push('| --- | --- |');
  push(`| Date | ${date} |`);
  push(`| Time | ${time} |`);
  push(`| Latitude | ${bd.latitude}° |`);
  push(`| Longitude | ${bd.longitude}° |`);
  push(`| Timezone | ${bd.timezone} |`);
  push(`| Ayanamsa | ${bd.ayanamsa} (${chart.ayanamsaValue.toFixed(4)}°) |`);
  push();

  // ── Ascendant + Sun & Moon ────────────────────────────────────────────
  const sun = chart.planets.find(p => p.planet === 'SUN');
  const moon = chart.planets.find(p => p.planet === 'MOON');
  const nak = chart.moonNakshatra;

  push('## Key Positions');
  push();
  push(`- **Ascendant (Lagna):** ${asc.rashi} (${RASHI_ENGLISH[ascIndex]}) ${asc.rashiDegree.toFixed(2)}°`);
  if (sun) {
    push(`- **Sun (Surya):** ${sun.rashi} (${RASHI_ENGLISH[sun.rashiIndex]}) ${sun.rashiDegree.toFixed(2)}° · House ${houseFrom(sun.rashiIndex, ascIndex)} · ${sun.nakshatra}${sun.isRetrograde ? ' · Retrograde' : ''}`);
  }
  if (moon) {
    push(`- **Moon (Chandra):** ${moon.rashi} (${RASHI_ENGLISH[moon.rashiIndex]}) ${moon.rashiDegree.toFixed(2)}° · House ${houseFrom(moon.rashiIndex, ascIndex)} · ${moon.nakshatra}`);
  }
  push(`- **Moon Nakshatra:** ${nak.name} (Pada ${nak.pada}) · Lord ${nak.lord}${nak.deity ? ` · Deity ${nak.deity}` : ''}${nak.gana ? ` · ${nak.gana}` : ''}`);
  push();

  // ── D1 planetary table ────────────────────────────────────────────────
  push('## Planetary Positions (D1 / Rashi)');
  push();
  push('| Planet | Sign | Degree | House | Nakshatra | Pada | Retro |');
  push('| --- | --- | --- | --- | --- | --- | --- |');
  for (const p of chart.planets) {
    push(`| ${titleCase(p.planet)} | ${p.rashi} | ${p.rashiDegree.toFixed(2)}° | ${houseFrom(p.rashiIndex, ascIndex)} | ${p.nakshatra} | ${p.nakshatraPada} | ${p.isRetrograde ? 'R' : '—'} |`);
  }
  push();

  // ── D9 Navamsa ────────────────────────────────────────────────────────
  push(`## D9 — Navamsa Chart (Marriage & Dharma)`);
  push();
  push(`**Navamsa Lagna:** ${RASHIS[vargas.d9Ascendant]} (${RASHI_ENGLISH[vargas.d9Ascendant]})`);
  push();
  push('| Planet | D9 Sign | Dignity | Vargottama |');
  push('| --- | --- | --- | --- |');
  for (const p of vargas.planets) {
    push(`| ${p.planet} | ${p.d9RashiName} | ${dignityLabel(p.d9Dignity)} | ${p.isVargottama ? 'Yes' : '—'} |`);
  }
  push();

  // ── D10 Dasamsa ───────────────────────────────────────────────────────
  push(`## D10 — Dasamsa Chart (Career & Status)`);
  push();
  push(`**Dasamsa Lagna:** ${RASHIS[vargas.d10Ascendant]} (${RASHI_ENGLISH[vargas.d10Ascendant]})`);
  push();
  push('| Planet | D10 Sign | Dignity |');
  push('| --- | --- | --- |');
  for (const p of vargas.planets) {
    push(`| ${p.planet} | ${p.d10RashiName} | ${dignityLabel(p.d10Dignity)} |`);
  }
  push();

  // ── Dashas ────────────────────────────────────────────────────────────
  const cd = chart.currentDasha;
  push('## Vimshottari Dasha');
  push();
  push(`_Current periods as of ${fmtIsoDate(cd.targetDate)}_`);
  push();
  push('| Level | Lord | From | To |');
  push('| --- | --- | --- | --- |');
  push(`| Mahadasha | ${cd.mahadasha.lord} | ${fmtIsoDate(cd.mahadasha.start)} | ${fmtIsoDate(cd.mahadasha.end)} |`);
  push(`| Antardasha | ${cd.antardasha.lord} | ${fmtIsoDate(cd.antardasha.start)} | ${fmtIsoDate(cd.antardasha.end)} |`);
  if (cd.pratyantardasha) {
    push(`| Pratyantardasha | ${cd.pratyantardasha.lord} | ${fmtIsoDate(cd.pratyantardasha.start)} | ${fmtIsoDate(cd.pratyantardasha.end)} |`);
  }
  if (cd.sookshmaDasha) {
    push(`| Sookshma | ${cd.sookshmaDasha.lord} | ${fmtIsoDate(cd.sookshmaDasha.start)} | ${fmtIsoDate(cd.sookshmaDasha.end)} |`);
  }
  push();

  if (chart.mahadashaTimeline?.length) {
    push('### Mahadasha Timeline');
    push();
    push('| Lord | From | To | Years |');
    push('| --- | --- | --- | --- |');
    for (const m of chart.mahadashaTimeline) {
      push(`| ${m.lord} | ${fmtIsoDate(m.start)} | ${fmtIsoDate(m.end)} | ${m.durationYears.toFixed(1)} |`);
    }
    push();
  }

  push('---');
  push();
  push('_Computed locally with Swiss Ephemeris · sidereal Vedic astrology · for reflection, not deterministic prediction._');

  return L.join('\n');
}

/** Trigger a browser download of the chart as a .md file. */
export function downloadChartMarkdown(chart: Chart): void {
  const md = buildChartMarkdown(chart);
  const { date } = fmtDateTime(chart.birthData.date);
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `birth-chart-${date || 'export'}.md`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
