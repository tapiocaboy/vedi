/**
 * Panchanga service — wires the existing Panchanga/Muhurta core (previously
 * unexposed) to live ephemeris positions, plus a NOAA-style sunrise/sunset
 * approximation for Rahu Kaal, Gulika Kaal, Choghadiya, and Abhijit Muhurta.
 */

import { getPlanetPositions } from '../core/ephemeris';
import { Panchanga, MuhurtaSelector, type PanchangaResult } from '../core/panchanga';
import { getNakshatra, type NakshatraData } from '../core/nakshatra';
import type { BirthData } from '../../types/astrology';

// ─── Sunrise / sunset (NOAA simplified) ─────────────────────────────────────

const RAD = Math.PI / 180;

/** Approximate sunrise/sunset (UTC) for a date + location. Null near the poles. */
export function sunriseSunset(date: Date, latitude: number, longitude: number): { sunrise: Date; sunset: Date } | null {
  const dayMs = 86_400_000;
  // Day of year
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const doy = Math.floor((Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - start) / dayMs);

  // Fractional year (radians)
  const gamma = (2 * Math.PI / 365) * (doy - 1);

  // Equation of time (minutes) and solar declination (radians)
  const eqTime = 229.18 * (0.000075 + 0.001868 * Math.cos(gamma) - 0.032077 * Math.sin(gamma)
    - 0.014615 * Math.cos(2 * gamma) - 0.040849 * Math.sin(2 * gamma));
  const decl = 0.006918 - 0.399912 * Math.cos(gamma) + 0.070257 * Math.sin(gamma)
    - 0.006758 * Math.cos(2 * gamma) + 0.000907 * Math.sin(2 * gamma)
    - 0.002697 * Math.cos(3 * gamma) + 0.00148 * Math.sin(3 * gamma);

  // Hour angle for sunrise/sunset (zenith 90.833° includes refraction)
  const cosHa = (Math.cos(90.833 * RAD) - Math.sin(latitude * RAD) * Math.sin(decl))
    / (Math.cos(latitude * RAD) * Math.cos(decl));
  if (cosHa < -1 || cosHa > 1) return null; // polar day / night

  const ha = Math.acos(cosHa) / RAD; // degrees

  const sunriseMin = 720 - 4 * (longitude + ha) - eqTime; // minutes UTC
  const sunsetMin  = 720 - 4 * (longitude - ha) - eqTime;

  const dayStartUtc = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  return {
    sunrise: new Date(dayStartUtc + sunriseMin * 60_000),
    sunset:  new Date(dayStartUtc + sunsetMin * 60_000),
  };
}

// ─── Public report ──────────────────────────────────────────────────────────

export interface ChoghadiyaPeriod {
  name: string;
  nature: string;
  lord: string;
  start: string;
  end: string;
  isGood: boolean;
}

export interface PanchangaReport {
  asOf: string;
  location: { latitude: number; longitude: number };
  panchanga: PanchangaResult;
  moonNakshatra: NakshatraData;
  sunrise: string | null;
  sunset: string | null;
  rahuKaal: { start: string; end: string } | null;
  gulikaKaal: { start: string; end: string } | null;
  abhijitMuhurta: { start: string; end: string; durationMinutes: number } | null;
  choghadiya: ChoghadiyaPeriod[];
}

/**
 * Today's Panchanga sampled at `asOf` (default now) for the birth location.
 * Sun/Moon longitudes come from the live ephemeris; timings use local
 * sunrise/sunset at the given coordinates.
 */
export async function getPanchangaReport(bd: BirthData, asOf?: Date): Promise<PanchangaReport> {
  const now = asOf ?? new Date();
  const dateStr = now.toISOString().slice(0, 19); // UTC "YYYY-MM-DDTHH:mm:ss"

  const positions = await getPlanetPositions(dateStr, bd.latitude, bd.longitude, 'UTC', bd.ayanamsa);
  const sunLon = positions['SUN'].longitude;
  const moonLon = positions['MOON'].longitude;

  const moonNakshatra = getNakshatra(moonLon);
  const sun = sunriseSunset(now, bd.latitude, bd.longitude);

  const panchanga = new Panchanga(sunLon, moonLon).getPanchanga(
    now,
    moonNakshatra as unknown as Record<string, unknown>,
    sun?.sunrise,
    sun?.sunset,
  );

  let abhijit: PanchangaReport['abhijitMuhurta'] = null;
  let choghadiya: ChoghadiyaPeriod[] = [];
  if (sun) {
    const a = MuhurtaSelector.getAbhijitMuhurta(sun.sunrise, sun.sunset);
    abhijit = {
      start: a.start.toISOString(),
      end: a.end.toISOString(),
      durationMinutes: Math.round(a.durationMinutes),
    };
    choghadiya = MuhurtaSelector.getChoghadiya(now.getDay(), sun.sunrise, sun.sunset).map(c => ({
      name: c.name,
      nature: c.nature,
      lord: c.lord,
      start: c.start.toISOString(),
      end: c.end.toISOString(),
      isGood: c.isGood,
    }));
  }

  return {
    asOf: now.toISOString(),
    location: { latitude: bd.latitude, longitude: bd.longitude },
    panchanga,
    moonNakshatra,
    sunrise: sun?.sunrise.toISOString() ?? null,
    sunset: sun?.sunset.toISOString() ?? null,
    rahuKaal: panchanga.rahuKaal
      ? { start: panchanga.rahuKaal[0].toISOString(), end: panchanga.rahuKaal[1].toISOString() }
      : null,
    gulikaKaal: panchanga.gulikaKaal
      ? { start: panchanga.gulikaKaal[0].toISOString(), end: panchanga.gulikaKaal[1].toISOString() }
      : null,
    abhijitMuhurta: abhijit,
    choghadiya,
  };
}
