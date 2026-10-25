import { describe, it, expect, vi, afterEach } from 'vitest';
import { parseGeocodeResults, mergePlaceChoices, geocodePlaces } from './geocode';
import type { Place } from './places';

const london: Place = {
  name: 'London', country: 'United Kingdom', lat: 51.5074, lng: -0.1278, tz: 'Europe/London', aliases: [],
};

describe('place geocoding', () => {
  afterEach(() => { vi.unstubAllGlobals(); });

  it('reads coordinates, region, and timezone from a lookup', () => {
    const [hit] = parseGeocodeResults({
      results: [{
        name: 'Matara', country: 'Sri Lanka', admin1: 'Southern Province',
        latitude: 5.9549, longitude: 80.555, timezone: 'Asia/Colombo',
      }],
    });
    expect(hit).toMatchObject({
      name: 'Matara', country: 'Sri Lanka', region: 'Southern Province',
      lat: 5.9549, lng: 80.555, tz: 'Asia/Colombo', source: 'remote',
    });
  });

  it('drops hits with no coordinates', () => {
    expect(parseGeocodeResults({ results: [{ name: 'Nowhere' }, null as never] })).toEqual([]);
    expect(parseGeocodeResults({})).toEqual([]);
  });

  it('keeps a bundled city and adds a town the list does not have', () => {
    const remote = parseGeocodeResults({
      results: [
        { name: 'London', country: 'United Kingdom', latitude: 51.5085, longitude: -0.1257, timezone: 'Europe/London' },
        { name: 'Weligama', country: 'Sri Lanka', admin1: 'Southern Province', latitude: 5.975, longitude: 80.429, timezone: 'Asia/Colombo' },
      ],
    });
    const merged = mergePlaceChoices([london], remote);
    expect(merged.map(p => p.name)).toEqual(['London', 'Weligama']);
    expect(merged[0].source).toBe('local');
    expect(merged[1].source).toBe('remote');
  });

  it('returns nothing when the lookup fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    await expect(geocodePlaces('Matara')).resolves.toEqual([]);
  });
});
