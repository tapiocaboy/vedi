/**
 * Birth-chart Markdown export.
 *
 * Assembles a portable Markdown document from a generated chart: birth
 * date/time/location, Sun & Moon positions, the full D1 planetary table, all
 * the divisional (varga) charts D2–D60, the dasha periods, and — when a
 * current-period prediction is supplied — the Knowledge Graph section.
 */

import type { Chart } from '../../types/astrology';
import type { DashaPredictionData } from '../../services/api';
import { RASHIS, RASHI_ENGLISH } from './rashi';
import { computeVargas, EXTRA_VARGAS } from './vargas';
import { VARGA_PLAIN, VARGA_KARAKAS, vargaVerdict, plainPlanetEffect } from './vargaMeanings';
import { RASHI_LORDS, analyzePlanet } from './planetaryAnalysis';
import { assessVargaBackbone } from './vargaStrength';
import { assessChartConfidence } from './chartConfidence';
import { buildKnowledgeGraphMarkdown } from './knowledgeGraph';
import { marriageInsights, careerInsights } from '../services/vargaService';
import { getCurrentPeriodPrediction } from '../services/predictionService';
import { getAscendantSamples } from './ephemeris';

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

function ordSuffix(n: number): string {
  const v = n % 100;
  if (v >= 11 && v <= 13) return 'th';
  return ['th', 'st', 'nd', 'rd'][n % 10] ?? 'th';
}

export function buildChartMarkdown(
  chart: Chart,
  prediction?: DashaPredictionData,
  /** Measured ascendant samples across a ±band, for exact minutes-to-boundary. */
  ascendantSamples?: Array<{ offsetMinutes: number; longitude: number }>,
): string {
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

  // The D9/D10 readings need lordship and natal house, not just divisional signs.
  const natalVargaCtx = {
    ascendantRashi: ascIndex,
    planetRashis: Object.fromEntries(chart.planets.map(p => [titleCase(p.planet), p.rashiIndex])),
    planetLongitudes: longitudes,
    planetRetro: retro,
  };

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

  // ── What the birth time can support ───────────────────────────────────
  //
  // Placed before the chart rather than after it. A reading that turns out to rest
  // on an indeterminate ascendant needs to say so before the reader has absorbed
  // twelve house placements, not in a footnote underneath them.
  if (moon) {
    const confidence = assessChartConfidence(asc.longitude, moon.longitude, ascendantSamples);
    if (confidence.warnings.length) {
      push('## Confidence — read this first');
      push();
      push(
        `Overall: **${confidence.overall}**. The positions below are computed exactly; what is uncertain is ` +
        'whether the recorded birth time puts them on the side of a boundary this reading assumes.',
      );
      push();
      for (const w of confidence.warnings) push(`- ${w}`);
      push();
    } else {
      push(`_Birth-time confidence: **${confidence.overall}** — ascendant and Moon are both clear of their boundaries._`);
      push();
    }
  }

  // ── D1 planetary table ────────────────────────────────────────────────
  //
  // Dignity and condition belong in this table, not only in the per-planet
  // panels. A debilitated combust lord that appears here as a plain sign and
  // degree drops out of every summary built from the export, and whoever reads
  // it downstream has no way to know it was ever there.
  const sunLon = sun?.longitude;
  const signByPlanet: Record<string, number> = {};
  for (const p of chart.planets) signByPlanet[titleCase(p.planet)] = p.rashiIndex;

  const analyses = chart.planets.map(p => ({
    p,
    a: analyzePlanet(
      p.planet, p.rashiIndex, ascIndex, p.isRetrograde, p.rashiDegree,
      { longitude: p.longitude, sunLongitude: sunLon, signByPlanet, nakshatraName: p.nakshatra },
    ),
  }));

  push('## Planetary Positions (D1 / Rashi)');
  push();
  push('| Planet | Sign | Degree | House | Nakshatra | Pada | Retro | Dignity | From Sun | Condition |');
  push('| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |');
  for (const { p, a } of analyses) {
    const flags: string[] = [];
    if (a.combustion?.isCombust) flags.push(`**Combust** (asta, orb ${a.combustion.limit}°)`);
    if (a.gandanta) flags.push(`**Gandanta** (${a.gandanta.severity}, ${a.gandanta.fromJunction.toFixed(2)}° from junction)`);
    if (a.neechaBhanga?.applies) flags.push(a.neechaBhanga.cancelled ? '**Neecha Bhanga** (cancelled)' : 'debilitation not cancelled');
    if (a.moolatrikona) flags.push('Moolatrikona');
    const fromSun = a.combustion ? `${a.combustion.separation.toFixed(2)}°` : '—';
    push(
      `| ${titleCase(p.planet)} | ${p.rashi} | ${p.rashiDegree.toFixed(2)}° | ${houseFrom(p.rashiIndex, ascIndex)} ` +
      `| ${p.nakshatra} | ${p.nakshatraPada} | ${p.isRetrograde ? 'R' : '—'} | ${dignityLabel(a.dignity)} ` +
      `| ${fromSun} | ${flags.length ? flags.join('; ') : '—'} |`,
    );
  }
  push();

  // ── Conditions worth naming outright ─────────────────────────────────
  const conditions: string[] = [];
  for (const { p, a } of analyses) {
    const name = titleCase(p.planet);
    const lordship = a.functional.rulesHouses.length
      ? ` (lord of the ${a.functional.rulesHouses.map(h => `${h}${ordSuffix(h)}`).join(' & ')})`
      : '';
    if (a.dignity === 'debilitated') {
      conditions.push(
        `**${name} is debilitated**${lordship} in ${p.rashi} ${p.rashiDegree.toFixed(2)}°. ` +
        (a.neechaBhanga?.cancelled
          ? `Neecha Bhanga applies — ${a.neechaBhanga.reasons[0]} — so the weakness converts into strength late rather than early, typically through crisis rather than initiative.`
          : 'No classical cancellation applies.'),
      );
    }
    if (a.combustion?.isCombust) {
      conditions.push(
        `**${name} is combust**${lordship} — ${a.combustion.separation.toFixed(2)}° from the Sun, inside the ${a.combustion.limit}° orb. ` +
        'Outward results are burnt even where dignity is sound.',
      );
    }
    if (a.gandanta) {
      conditions.push(
        `**${name} is gandanta** — ${p.rashi} ${p.rashiDegree.toFixed(2)}°, ${p.nakshatra} pada ${p.nakshatraPada}, ` +
        `${a.gandanta.fromJunction.toFixed(2)}° from the water–fire sign junction (${a.gandanta.severity}). ` +
        'A karmic knot around what this planet governs.',
      );
    }
    if (a.combustion && !a.combustion.isCombust && a.combustion.separation - a.combustion.limit < 1) {
      conditions.push(
        `${name} **clears combustion by ${(a.combustion.separation - a.combustion.limit).toFixed(2)}°** ` +
        `(${a.combustion.separation.toFixed(2)}° against a ${a.combustion.limit}° orb) — a fine margin, but it stands.`,
      );
    }
  }
  if (conditions.length) {
    push('### Conditions');
    push();
    push('The states that sign and degree alone do not show — debilitation, combustion (asta), sign-junction knots, and any cancellation of them.');
    push();
    for (const c of conditions) push(`- ${c}`);
    push();
  }

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
  push('**Marriage reading:**');
  push();
  for (const ins of marriageInsights(vargas, natalVargaCtx)) push(`- **${ins.title}** (${ins.tone}) — ${ins.text}`);
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
  push('**Career reading:**');
  push();
  for (const ins of careerInsights(vargas, natalVargaCtx)) push(`- **${ins.title}** (${ins.tone}) — ${ins.text}`);
  push();

  // ── Cross-varga standing ──────────────────────────────────────────────
  //
  // Read one chart at a time, the vargas cannot answer the question they exist
  // to answer: which planet actually holds this chart together. A planet
  // unremarkable in D1 but dignified across the divisions is the real engine of
  // a life, and that pattern only appears when the vargas are scored together.
  const backbone = assessVargaBackbone({ chart: vargas, longitudes });

  push('## Cross-Varga Standing (Vimsopaka Bala)');
  push();
  push(
    'Vimsopaka Bala scores each planet across the Saptavarga (D1, D2, D3, D7, D9, D12, D30) out of 20, ' +
    'weighting each division classically. The dignity column beside it counts the four charts practice leans on ' +
    'most for life direction — D1, D9, D10, D30 — because a planet holding its own across those is making a ' +
    'structural statement no single chart reveals.',
  );
  push();
  push('| Planet | Vimsopaka /20 | Grade | Own sign / exalted in | Vargottama |');
  push('| --- | --- | --- | --- | --- |');
  for (const p of backbone.planets) {
    push(
      `| ${p.planet} | ${p.vimsopaka.toFixed(1)} | ${titleCase(p.grade)} ` +
      `| ${p.dignifiedIn.length ? p.dignifiedIn.join(', ') : '—'} | ${p.isVargottama ? 'Yes' : '—'} |`,
    );
  }
  push();
  for (const n of backbone.notes) push(`- ${n}`);
  push();

  // ── Other divisional charts (D2, D3, D4, D7, D12, D24, D30, D60) ───────
  // Each carries its full interpretation, not just the sign table, so the
  // export and the chat see exactly what the app shows on screen.
  push('## Other Divisional Charts');
  push();
  push(
    'Each divisional chart magnifies one area of life. The same nine planets are re-sorted to show ' +
    'how they behave in that area alone — so the money chart can read strongly while the study chart reads weakly.',
  );
  push();
  for (const v of EXTRA_VARGAS) {
    const ascR = vargas.ascendants[v.code];
    const plain = VARGA_PLAIN[v.code];
    const karakas = VARGA_KARAKAS[v.code] ?? [];

    push(`### ${v.code} — ${v.name} (${plain?.plainName ?? v.significance})`);
    push();
    if (plain) {
      push(`**Answers:** ${plain.question}`);
      push();
      push(plain.intro);
      push();
    }
    push(`**Lagna:** ${RASHIS[ascR]} (${RASHI_ENGLISH[ascR]})${plain ? ` — ${plain.lagnaMeaning}` : ''}`);
    push();

    if (karakas.length) {
      push(`**Key planet${karakas.length > 1 ? 's' : ''} for this chart:** ` +
        karakas.map(k => `${k.planet} (${k.role})`).join(', '));
      push();
    }

    // Whole-chart verdict — the same judgement the UI card shows.
    const verdict = vargaVerdict(
      v.code,
      vargas.planets.map(p => ({
        planet: p.planet,
        dignity: p.divisions[v.code].dignity,
        house: houseFrom(p.divisions[v.code].rashi, ascR),
      })),
      RASHI_LORDS[ascR],
    );
    push(`**Verdict:** ${verdict.headline} _(${verdict.standing})_`);
    push();
    push(verdict.summary);
    push();
    for (const r of verdict.reasons) push(`- ${r}`);
    push();

    push(`| Planet | ${v.code} Sign | House | Dignity | What it does here |`);
    push('| --- | --- | --- | --- | --- |');
    for (const p of vargas.planets) {
      const cell = p.divisions[v.code];
      const house = houseFrom(cell.rashi, ascR);
      const effect = plain
        ? plainPlanetEffect(p.planet, cell.dignity, p.isRetrograde, v.code).replace(/\|/g, '/')
        : '—';
      push(`| ${p.planet} | ${cell.rashiName} | ${house} | ${dignityLabel(cell.dignity)} | ${effect} |`);
    }
    push();

    if (plain) {
      push(`**What each house means in this chart:**`);
      push();
      for (let h = 1; h <= 12; h++) {
        const rashiOfHouse = (ascR + h - 1) % 12;
        push(`- **${h}. ${RASHIS[rashiOfHouse]}** — ${plain.houses[h]}`);
      }
      push();
    }
  }

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

  // ── Knowledge Graph (current-period entity map) ───────────────────────
  if (prediction) {
    push(buildKnowledgeGraphMarkdown(prediction));
  }

  push('---');
  push();
  push('_Computed locally with Swiss Ephemeris · sidereal Vedic astrology · for reflection, not deterministic prediction._');

  return L.join('\n');
}

/** Trigger a browser download of the chart as a .md file. */
export async function downloadChartMarkdown(chart: Chart): Promise<void> {
  // Best-effort: include the current-period Knowledge Graph; never block the
  // export if the prediction can't be computed.
  let prediction: DashaPredictionData | undefined;
  try {
    prediction = await getCurrentPeriodPrediction(chart.birthData);
  } catch {
    prediction = undefined;
  }
  // Measured rather than estimated: the ascendant's rate varies by more than a
  // factor of two with latitude, and the estimate is worst exactly where a
  // borderline chart most needs a real number.
  let ascendantSamples: Array<{ offsetMinutes: number; longitude: number }> | undefined;
  try {
    const bd = chart.birthData;
    ascendantSamples = await getAscendantSamples(
      bd.date, bd.latitude, bd.longitude, bd.timezone, bd.ayanamsa);
  } catch {
    ascendantSamples = undefined;   // fall back to the nominal-rate estimate
  }
  const md = buildChartMarkdown(chart, prediction, ascendantSamples);
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
