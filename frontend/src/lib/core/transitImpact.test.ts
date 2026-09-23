import { describe, it, expect } from 'vitest';
import {
  buildSegments, monthlyImpact, aspectedHouses, toneOf,
  overlayKind, happeningHeadline, overlaySentence, skyStory,
  type NatalContext,
} from './transitImpact';

const DAY = 86_400_000;
const start = Date.UTC(2025, 0, 1, 12);
const days = (n: number) => Array.from({ length: n }, (_, i) => new Date(start + i * DAY));

const natal: NatalContext = {
  moonRashi: 11, // Meena
  lagnaRashi: 8, // Dhanu
  natalRashi: { SUN: 5, MOON: 11, SATURN: 7, JUPITER: 2, RAHU: 0, KETU: 6, ASCENDANT: 8 },
};

describe('transitImpact', () => {
  it('splits a longitude series into sign segments with clipped edges', () => {
    const dates = days(100);
    const lons = dates.map((_, i) => 25 + i * 0.1); // crosses 30° on day 50
    const segs = buildSegments('SATURN', dates, lons, natal);
    expect(segs).toHaveLength(2);
    expect(segs[0].rashi).toBe(0);
    expect(segs[0].startClipped).toBe(true);
    expect(segs[0].endClipped).toBe(false);
    expect(segs[1].rashi).toBe(1);
    expect(segs[1].start).toBe(segs[0].end);
    expect(segs[1].endClipped).toBe(true);
  });

  it('detects retrograde spans and skips them for the nodes', () => {
    const dates = days(60);
    const lons = dates.map((_, i) => (i < 20 ? 10 + i * 0.1 : i < 40 ? 12 - (i - 20) * 0.05 : 11 + (i - 40) * 0.1));
    const [sat] = buildSegments('SATURN', dates, lons, natal);
    expect(sat.retroSpans).toHaveLength(1);
    const [rahu] = buildSegments('RAHU', dates, lons, natal);
    expect(rahu.retroSpans).toHaveLength(0);
  });

  it('tags Sade Sati peak when Saturn is on the natal Moon and scores it as testing', () => {
    const dates = days(10);
    const [seg] = buildSegments('SATURN', dates, dates.map(() => 335), natal);
    expect(seg.houseFromMoon).toBe(1);
    expect(seg.tags.map(t => t.label)).toContain('Sade Sati · peak');
    expect(seg.tone).toBe('bad');
    expect(seg.effect.length).toBeGreaterThan(10);
  });

  it('treats Jupiter 9th from the Moon as supportive and tags guru bala', () => {
    const dates = days(10);
    const [seg] = buildSegments('JUPITER', dates, dates.map(() => 7 * 30 + 5), natal);
    expect(seg.houseFromMoon).toBe(9);
    expect(seg.tone).toBe('good');
    expect(seg.tags.some(t => t.label === 'Guru bala')).toBe(true);
  });

  it('links a transit to a dasha run by the same planet', () => {
    const dates = days(10);
    const spans = [{ level: 'Antardasha' as const, lord: 'Saturn', start: new Date(start - 30 * DAY).toISOString(), end: new Date(start + 30 * DAY).toISOString() }];
    const [seg] = buildSegments('SATURN', dates, dates.map(() => 100), natal, spans);
    expect(seg.dasha).toEqual([{ level: 'Antardasha', lord: 'Saturn' }]);
  });

  it('includes the 7th and the special aspects', () => {
    expect(aspectedHouses('SATURN', 1).sort((a, b) => a - b)).toEqual([3, 7, 10]);
    expect(aspectedHouses('JUPITER', 10).sort((a, b) => a - b)).toEqual([2, 4, 6]);
    expect(aspectedHouses('SUN', 12)).toEqual([6]);
  });

  it('bands the score into tones', () => {
    expect(toneOf(0.5)).toBe('good');
    expect(toneOf(0)).toBe('mixed');
    expect(toneOf(-0.4)).toBe('bad');
  });

  it('builds monthly area scores within range with drivers', () => {
    const dates = days(120);
    const segs = buildSegments('SATURN', dates, dates.map(() => 335), natal);
    const months = monthlyImpact(segs, new Date(start), 3);
    expect(months).toHaveLength(3);
    for (const m of months) {
      for (const v of Object.values(m.areas)) expect(Math.abs(v)).toBeLessThanOrEqual(1);
    }
    expect(months[0].areas.health).toBeLessThan(0);
    expect(months[0].drivers.health[0]).toBe(segs[0].id);
  });
});

describe('transit sky overlay copy', () => {
  it('bands overlay strength', () => {
    expect(overlayKind(0.4)).toBe('lifts');
    expect(overlayKind(-0.3)).toBe('tests');
    expect(overlayKind(0.1)).toBe('colours');
    expect(overlayKind(0)).toBe('quiet');
  });

  it('names a happening event in the headline and story', () => {
    const dates = days(10);
    const [seg] = buildSegments('SATURN', dates, dates.map(() => 335), natal);
    expect(happeningHeadline(seg)).toContain('Sade Sati');
    expect(happeningHeadline(seg)).toContain('Saturn in');
    const story = skyStory(seg, 'Saturn–Mercury');
    expect(story).toContain('happening now');
    expect(story).toContain('Saturn–Mercury');
    expect(story).toMatch(/Moon/);
  });

  it('explains how a transit colours a dasha prediction', () => {
    const dates = days(10);
    const [seg] = buildSegments('JUPITER', dates, dates.map(() => 7 * 30 + 5), natal);
    const line = overlaySentence(seg, 'career', 'mixed');
    expect(line).toMatch(/running period looks mixed for career/i);
    expect(line).toMatch(/Jupiter/);
    expect(overlaySentence(seg, 'health')).toMatch(/Jupiter/);
  });
});
