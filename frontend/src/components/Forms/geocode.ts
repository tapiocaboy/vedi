/**
 * Place lookup for towns that are not in the bundled city list.
 *
 * The city name is sent to the Open-Meteo geocoding API, which returns
 * coordinates and a timezone. Birth date and time never leave the device.
 * If the lookup finds nothing, the form's latitude and longitude fields stay
 * editable so the reader can type them.
 */

import type { Place } from './places';

export interface PlaceChoice {
  name: string;
  country: string;
  region?: string;
  lat: number;
  lng: number;
  tz: string;
  source: 'local' | 'remote';
}

interface RawHit {
  name?: string;
  country?: string;
  admin1?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
}

const ENDPOINT = 'https://geocoding-api.open-meteo.com/v1/search';

function fold(value: string): string {
  return value.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
}

export function parseGeocodeResults(data: { results?: RawHit[] | null }): PlaceChoice[] {
  const rows = Array.isArray(data.results) ? data.results : [];
  const out: PlaceChoice[] = [];
  for (const row of rows) {
    if (!row?.name || typeof row.latitude !== 'number' || typeof row.longitude !== 'number') continue;
    if (row.latitude < -90 || row.latitude > 90 || row.longitude < -180 || row.longitude > 180) continue;
    out.push({
      name: row.name,
      country: row.country ?? '',
      region: row.admin1 && row.admin1 !== row.name ? row.admin1 : undefined,
      lat: row.latitude,
      lng: row.longitude,
      tz: row.timezone ?? '',
      source: 'remote',
    });
  }
  return out;
}

/** Local hits first, then remote towns that are not the same place. */
export function mergePlaceChoices(local: Place[], remote: PlaceChoice[], limit = 6): PlaceChoice[] {
  const out: PlaceChoice[] = local.slice(0, limit).map(place => ({
    name: place.name,
    country: place.country,
    lat: place.lat,
    lng: place.lng,
    tz: place.tz,
    source: 'local',
  }));
  for (const hit of remote) {
    if (out.length >= limit) break;
    const same = out.some(place =>
      (fold(place.name) === fold(hit.name) && fold(place.country) === fold(hit.country))
      || (Math.abs(place.lat - hit.lat) < 0.15 && Math.abs(place.lng - hit.lng) < 0.15),
    );
    if (!same) out.push(hit);
  }
  return out;
}

export async function geocodePlaces(query: string, signal?: AbortSignal): Promise<PlaceChoice[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const url = `${ENDPOINT}?name=${encodeURIComponent(q)}&count=8&language=en&format=json`;
  try {
    const res = await fetch(url, { signal });
    if (!res.ok) return [];
    return parseGeocodeResults(await res.json());
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') return [];
    return [];
  }
}
