/**
 * The real birth instant for a BirthData.
 *
 * `bd.date` is a *naive* local wall-clock string ("1986-09-16T13:22:00") that is
 * only meaningful together with `bd.timezone`. `new Date(bd.date)` ignores the
 * zone and parses it in the viewer's browser timezone instead, so a chart cast
 * for someone born in Kandy but opened from London started its Vimshottari
 * clock several hours off — enough to move a dasha boundary onto the wrong day.
 * Every dasha calculation must start from this instant instead.
 */
import { localToUTC } from './swissEph';
import type { BirthData } from '../../types/astrology';

export function birthInstant(bd: Pick<BirthData, 'date' | 'timezone'>): Date {
  return localToUTC(bd.date, bd.timezone);
}
