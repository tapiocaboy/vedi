/**
 * Dosha service — runs the Mangal / Kaal Sarpa / Pitra checks from the natal
 * chart and builds the full Sade Sati timeline by sampling Saturn across the
 * native's lifetime.
 */

import { getPlanetPositions, getBodyLongitudeSeries } from '../core/ephemeris';
import {
  checkMangalDosha, checkKaalSarpaDosha, checkPitraDosha, buildSadeSatiTimeline,
  type DoshaCheck, type DoshaPositions, type SadeSatiPeriod,
} from '../core/doshas';
import { RASHIS } from '../core/rashi';
import { VimshottariDasha } from '../core/dasha';
import { birthInstant } from '../core/birthInstant';
import {
  assessErashtaka, erashtakaChartFromPositions, erashtakaWindows, type DashaSpanLite,
} from '../core/erashtaka';
import type { Lang } from '../core/i18n';
import type { BirthData } from '../../types/astrology';

export interface DoshaReport {
  doshas: DoshaCheck[];
  sadeSati: {
    natalMoonSign: number;
    natalMoonSignName: string;
    currentlyActive: boolean;
    periods: SadeSatiPeriod[];
  };
}

const PLANET_KEYS = ['SUN', 'MOON', 'MARS', 'MERCURY', 'JUPITER', 'VENUS', 'SATURN', 'RAHU', 'KETU'] as const;
const SADE_SATI_YEARS = 96;
const SAMPLE_STEP_DAYS = 15;

export async function getDoshaReport(bd: BirthData, lang: Lang = 'en'): Promise<DoshaReport> {
  const positions = await getPlanetPositions(bd.date, bd.latitude, bd.longitude, bd.timezone, bd.ayanamsa);

  const planets: DoshaPositions['planets'] = {};
  for (const k of PLANET_KEYS) {
    const p = positions[k];
    planets[k.charAt(0) + k.slice(1).toLowerCase()] = { lon: p.longitude, rashi: p.rashi };
  }
  const pos: DoshaPositions = { lagnaRashi: positions.ASCENDANT.rashi, planets };

  const doshas = [checkMangalDosha(pos, lang), checkKaalSarpaDosha(pos, lang), checkPitraDosha(pos, lang)];

  // ── Sade Sati: sample Saturn from birth across a lifetime ──────────────
  const [datePart] = bd.date.split('T');
  const [y, m, d] = datePart.split('-').map(Number);
  const dates: Date[] = [];
  let cursor = Date.UTC(y, (m || 1) - 1, d || 1, 12, 0, 0);
  const endMs = Date.UTC(y + SADE_SATI_YEARS, (m || 1) - 1, d || 1, 12, 0, 0);
  const stepMs = SAMPLE_STEP_DAYS * 86_400_000;
  while (cursor <= endMs) { dates.push(new Date(cursor)); cursor += stepMs; }

  // Sequential — the WASM ephemeris is a single shared instance.
  const lons = await getBodyLongitudeSeries('SATURN', dates, bd.ayanamsa);
  const jupLons = await getBodyLongitudeSeries('JUPITER', dates, bd.ayanamsa);
  const rahuLons = await getBodyLongitudeSeries('RAHU', dates, bd.ayanamsa);
  const samples = dates.map((date, i) => ({ date, rashi: Math.floor(lons[i] / 30) % 12 }));

  const natalMoonRashi = positions.MOON.rashi;
  const periods = buildSadeSatiTimeline(natalMoonRashi, samples);

  // ── Grade every phase for this chart, and each antardasha inside it ─────
  const chart = erashtakaChartFromPositions(positions);
  const sign = (l: number) => Math.floor(l / 30) % 12;
  const t0 = dates[0].getTime();
  const skyAt = (d: Date) => {
    const i = Math.max(0, Math.min(dates.length - 1, Math.round((d.getTime() - t0) / stepMs)));
    const rahu = sign(rahuLons[i]);
    return { jupiterRashi: sign(jupLons[i]), rahuRashi: rahu, ketuRashi: (rahu + 6) % 12 };
  };
  const calc = new VimshottariDasha(positions.MOON.longitude, birthInstant(bd));
  const spans: DashaSpanLite[] = [];
  for (const md of calc.generateMahadashaTimeline(SADE_SATI_YEARS + 1)) {
    for (const ad of calc.calculateAntardasha(md)) {
      spans.push({ maha: md.lord, antar: ad.lord, start: ad.start.toISOString(), end: ad.end.toISOString() });
    }
  }
  // Saturn's retrograde loops split one transit into several periods; a gap
  // under ~10 years is the same 30-year cycle, not a new one.
  let cycle = 0, lastEnd = -Infinity;
  periods.forEach(p => {
    if (Date.parse(p.start) - lastEnd > 10 * 365.25 * 86_400_000) cycle++;
    lastEnd = Date.parse(p.end);
    p.cycle = cycle;
    for (const ph of p.phases) {
      const a = assessErashtaka({ saturnRashi: ph.sign }, chart, {}, { cycle: p.cycle }, lang);
      if (!a) continue;
      ph.grade = {
        intensity: a.intensity,
        level: a.level,
        levelLabel: a.levelLabel,
        summary: a.summary,
        aggravating: a.aggravating.map(f => f.text),
        mitigating: a.mitigating.map(f => f.text),
        context: a.context,
        windows: erashtakaWindows(ph.start, ph.end, ph.sign, chart, spans, skyAt, { cycle: p.cycle }, lang),
      };
    }
  });

  return {
    doshas,
    sadeSati: {
      natalMoonSign: natalMoonRashi,
      natalMoonSignName: RASHIS[natalMoonRashi],
      currentlyActive: periods.some(p => p.status === 'current'),
      periods,
    },
  };
}
