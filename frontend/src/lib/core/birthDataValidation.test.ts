/**
 * The two input faults that produced silently wrong reference charts.
 */

import { describe, it, expect } from 'vitest';
import { validateBirthData, canCastChart, offsetHoursAt } from './birthDataValidation';
import type { BirthData } from '../../types/astrology';

const base: BirthData = {
  date: '1961-08-04T19:24:00', latitude: 21.3069, longitude: -157.8583,
  timezone: 'Pacific/Honolulu', ayanamsa: 'LAHIRI',
};

describe('longitude sign errors', () => {
  it('accepts Obama’s correct western longitude', () => {
    expect(validateBirthData(base)).toEqual([]);
  });

  it('rejects the same chart with the longitude sign flipped', () => {
    // The recorded fault: +157.8583 instead of −157.8583 produced a Dhanu lagna
    // rather than Makara and shifted every house by one, while leaving all the
    // planetary longitudes correct so nothing looked wrong.
    const issues = validateBirthData({ ...base, longitude: 157.8583 });
    const lon = issues.find(i => i.field === 'longitude')!;
    expect(lon.severity).toBe('error');
    expect(lon.message).toContain('sign error');
    expect(lon.message).toContain('20.5 hours');
    expect(lon.message).toContain('-157.8583');
    expect(canCastChart(issues)).toBe(false);
  });

  it('explains that positions survive but houses do not', () => {
    const issues = validateBirthData({ ...base, longitude: 157.8583 });
    expect(issues[0].message).toContain('Planetary positions are unaffected');
    expect(issues[0].message).toContain('ascendant');
  });

  it('tolerates places that genuinely sit far from their solar offset', () => {
    // Western China on Beijing time, and Spain on Berlin time — both legitimately
    // several hours from the offset their longitude implies.
    const kashgar = validateBirthData({
      ...base, latitude: 39.47, longitude: 75.99, timezone: 'Asia/Shanghai', date: '1990-06-01T12:00:00',
    });
    expect(kashgar.filter(i => i.field === 'longitude')).toEqual([]);

    const vigo = validateBirthData({
      ...base, latitude: 42.24, longitude: -8.72, timezone: 'Europe/Madrid', date: '1990-06-01T12:00:00',
    });
    expect(vigo.filter(i => i.field === 'longitude')).toEqual([]);
  });

  it('flags an out-of-range coordinate outright', () => {
    expect(validateBirthData({ ...base, latitude: 120 })[0].field).toBe('latitude');
    expect(validateBirthData({ ...base, longitude: -400 })[0].field).toBe('longitude');
  });
});

describe('fixed-offset timezones', () => {
  it('warns on UTC for Diana’s British summer birth', () => {
    // The recorded fault: UTC skipped British Summer Time, casting the chart an
    // hour early and moving the ascendant across a sign boundary at 52° N.
    const issues = validateBirthData({
      date: '1961-07-01T19:45:00', latitude: 52.827015, longitude: 0.515626,
      timezone: 'UTC', ayanamsa: 'LAHIRI',
    });
    const tz = issues.find(i => i.field === 'timezone')!;
    expect(tz.severity).toBe('warning');
    expect(tz.message).toContain('daylight-saving');
    expect(tz.message).toContain('Europe/London');
    // A warning explains; it does not block.
    expect(canCastChart(issues)).toBe(true);
  });

  it('warns on the Etc/GMT family too', () => {
    for (const timezone of ['Etc/GMT+8', 'Etc/GMT-5', 'GMT', 'UTC']) {
      const issues = validateBirthData({ ...base, timezone, longitude: 0, latitude: 51 });
      expect(issues.some(i => i.field === 'timezone'), timezone).toBe(true);
    }
  });

  it('stays quiet for a regional timezone', () => {
    for (const timezone of ['Europe/London', 'Asia/Colombo', 'America/Los_Angeles']) {
      const issues = validateBirthData({
        ...base, timezone, longitude: 0, latitude: 51, date: '1961-07-01T19:45:00',
      });
      expect(issues.filter(i => i.field === 'timezone'), timezone).toEqual([]);
    }
  });
});

describe('historical offsets come from the tz database', () => {
  it('resolves British Summer Time for a July 1961 birth', () => {
    expect(offsetHoursAt('Europe/London', new Date('1961-07-01T18:45:00Z'))).toBe(1);
  });

  it('resolves GMT for a January 1961 birth', () => {
    expect(offsetHoursAt('Europe/London', new Date('1961-01-15T12:00:00Z'))).toBe(0);
  });

  it('resolves half-hour offsets', () => {
    expect(offsetHoursAt('Asia/Colombo', new Date('1987-08-06T03:32:00Z'))).toBe(5.5);
  });

  it('resolves a negative whole-hour offset with no DST in force', () => {
    // California observed no daylight saving in February 1955.
    expect(offsetHoursAt('America/Los_Angeles', new Date('1955-02-25T03:15:00Z'))).toBe(-8);
  });
});
