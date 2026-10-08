import { describe, it, expect } from 'vitest';
import { birthInstant } from './birthInstant';

// These hold whatever timezone the machine running the tests is in — that is
// the point: the result must come from the birthplace's zone, not the viewer's.
describe('birthInstant', () => {
  it('reads the wall-clock time in the birthplace zone (Colombo, UTC+5:30)', () => {
    expect(birthInstant({ date: '1986-09-16T13:22:00', timezone: 'Asia/Colombo' }).toISOString())
      .toBe('1986-09-16T07:52:00.000Z');
  });

  it('crosses midnight correctly for a western birthplace (Honolulu, UTC−10)', () => {
    expect(birthInstant({ date: '1961-08-04T19:24:00', timezone: 'Pacific/Honolulu' }).toISOString())
      .toBe('1961-08-05T05:24:00.000Z');
  });

  it('honours historical offsets, not the zone\'s current one (Sri Lanka: +6:30 mid-1996, +6:00 in 1998)', () => {
    expect(birthInstant({ date: '1996-07-01T12:00:00', timezone: 'Asia/Colombo' }).toISOString())
      .toBe('1996-07-01T05:30:00.000Z');
    expect(birthInstant({ date: '1998-01-01T12:00:00', timezone: 'Asia/Colombo' }).toISOString())
      .toBe('1998-01-01T06:00:00.000Z');
  });
});
