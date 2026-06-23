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

export async function getDoshaReport(bd: BirthData): Promise<DoshaReport> {
  const positions = await getPlanetPositions(bd.date, bd.latitude, bd.longitude, bd.timezone, bd.ayanamsa);

  const planets: DoshaPositions['planets'] = {};
  for (const k of PLANET_KEYS) {
    const p = positions[k];
    planets[k.charAt(0) + k.slice(1).toLowerCase()] = { lon: p.longitude, rashi: p.rashi };
  }
  const pos: DoshaPositions = { lagnaRashi: positions.ASCENDANT.rashi, planets };

  const doshas = [checkMangalDosha(pos), checkKaalSarpaDosha(pos), checkPitraDosha(pos)];

  // ── Sade Sati: sample Saturn from birth across a lifetime ──────────────
  const [datePart] = bd.date.split('T');
  const [y, m, d] = datePart.split('-').map(Number);
  const dates: Date[] = [];
  let cursor = Date.UTC(y, (m || 1) - 1, d || 1, 12, 0, 0);
  const endMs = Date.UTC(y + SADE_SATI_YEARS, (m || 1) - 1, d || 1, 12, 0, 0);
  const stepMs = SAMPLE_STEP_DAYS * 86_400_000;
  while (cursor <= endMs) { dates.push(new Date(cursor)); cursor += stepMs; }

  const lons = await getBodyLongitudeSeries('SATURN', dates, bd.ayanamsa);
  const samples = dates.map((date, i) => ({ date, rashi: Math.floor(lons[i] / 30) % 12 }));

  const natalMoonRashi = positions.MOON.rashi;
  const periods = buildSadeSatiTimeline(natalMoonRashi, samples);

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
