import { describe, expect, it } from 'vitest';
import { searchPlaces } from './places';

describe('searchPlaces', () => {
  it('waits for two characters', () => {
    expect(searchPlaces('m')).toEqual([]);
  });

  it('ranks a name prefix ahead of a looser match', () => {
    const names = searchPlaces('mum').map(place => place.name);
    expect(names[0]).toBe('Mumbai');
  });

  it('finds a city by an older name', () => {
    expect(searchPlaces('bombay')[0]?.name).toBe('Mumbai');
    expect(searchPlaces('bombay')[0]?.tz).toBe('Asia/Kolkata');
  });

  it('ignores accents', () => {
    expect(searchPlaces('sao paulo')[0]?.name).toBe('São Paulo');
  });

  it('does not invent a city', () => {
    expect(searchPlaces('zzzz')).toEqual([]);
  });
});
