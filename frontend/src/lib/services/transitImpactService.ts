/**
 * Transit Impact service — samples the major transiting bodies once a day over
 * a window around today and scores every sign segment against the natal chart
 * and dasha timeline.
 */

import { getPlanetPositions, getBodyLongitudeSeries } from '../core/ephemeris';
import { computeAshtakavarga } from '../core/ashtakavarga';
import { chartService } from './chartService';
import {
  buildSegments, monthlyImpact,
  type TransitSegment, type MonthImpact, type NatalContext, type DashaSpan,
} from '../core/transitImpact';
import type { BirthData } from '../../types/astrology';

export interface TransitImpactReport {
  asOf: string;
  windowStart: string;
  windowEnd: string;
  moonRashi: number;
  lagnaRashi: number;
  segments: TransitSegment[];
  months: MonthImpact[];
  dasha: DashaSpan[];
}

const YEARS_BACK = 2;
const YEARS_AHEAD = 6;
const DAY = 86_400_000;

export async function getTransitImpactReport(bd: BirthData, asOf: Date = new Date()): Promise<TransitImpactReport> {
  const positions = await getPlanetPositions(bd.date, bd.latitude, bd.longitude, bd.timezone, bd.ayanamsa);

  const av = computeAshtakavarga({
    Lagna: positions.ASCENDANT.rashi,
    Sun: positions.SUN.rashi,
    Moon: positions.MOON.rashi,
    Mars: positions.MARS.rashi,
    Mercury: positions.MERCURY.rashi,
    Jupiter: positions.JUPITER.rashi,
    Venus: positions.VENUS.rashi,
    Saturn: positions.SATURN.rashi,
  });

  const natal: NatalContext = {
    moonRashi: positions.MOON.rashi,
    lagnaRashi: positions.ASCENDANT.rashi,
    natalRashi: Object.fromEntries(Object.entries(positions).map(([k, p]) => [k, p.rashi])),
    bhinna: av.bhinna,
    sarva: av.sarva,
  };

  const start = new Date(Date.UTC(asOf.getUTCFullYear() - YEARS_BACK, asOf.getUTCMonth(), 1, 12));
  const end = new Date(Date.UTC(asOf.getUTCFullYear() + YEARS_AHEAD, asOf.getUTCMonth(), 1, 12));
  const dates: Date[] = [];
  for (let t = start.getTime(); t <= end.getTime(); t += DAY) dates.push(new Date(t));

  const timeline = await chartService.getDashaTimeline(bd);
  const dasha: DashaSpan[] = [];
  for (const item of timeline.timeline) {
    const md = item.mahadasha;
    if (Date.parse(md.end) < start.getTime() || Date.parse(md.start) > end.getTime()) continue;
    dasha.push({ level: 'Mahadasha', lord: md.lord, start: md.start, end: md.end });
    for (const ad of item.antardashas) {
      if (Date.parse(ad.end) < start.getTime() || Date.parse(ad.start) > end.getTime()) continue;
      dasha.push({ level: 'Antardasha', lord: ad.lord, start: ad.start, end: ad.end });
    }
  }

  const bodies: Array<'SATURN' | 'JUPITER' | 'RAHU' | 'MARS' | 'SUN'> = ['SATURN', 'JUPITER', 'RAHU', 'MARS', 'SUN'];
  const segments: TransitSegment[] = [];
  for (const body of bodies) {
    const lons = await getBodyLongitudeSeries(body, dates, bd.ayanamsa);
    segments.push(...buildSegments(body, dates, lons, natal, dasha));
    if (body === 'RAHU') {
      const ketu = lons.map(l => (l + 180) % 360);
      segments.push(...buildSegments('KETU', dates, ketu, natal, dasha));
    }
  }

  const monthCount = (YEARS_BACK + YEARS_AHEAD) * 12;
  return {
    asOf: asOf.toISOString(),
    windowStart: start.toISOString(),
    windowEnd: end.toISOString(),
    moonRashi: natal.moonRashi,
    lagnaRashi: natal.lagnaRashi,
    segments,
    months: monthlyImpact(segments, start, monthCount),
    dasha,
  };
}
