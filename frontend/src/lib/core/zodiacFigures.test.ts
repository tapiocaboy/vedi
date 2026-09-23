import { describe, it, expect } from 'vitest';
import { ZODIAC_IMAGE_URLS } from './zodiacFigures';

describe('zodiacFigures', () => {
  it('has one pictorial mark for each sign', () => {
    expect(ZODIAC_IMAGE_URLS).toHaveLength(12);
    for (const src of ZODIAC_IMAGE_URLS) expect(src.length).toBeGreaterThan(4);
  });
});
