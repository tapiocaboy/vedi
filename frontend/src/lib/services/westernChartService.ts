/**
 * Western Chart Service — orchestrates the tropical ephemeris + calculation
 * library into a full `WesternChart`. Mirrors `chartService.ts`'s role on
 * the Vedic side.
 */

import { getWesternPositions } from '../core/western/westernEphemeris';
import { buildWesternChart } from '../core/western/chart';
import type { BirthData } from '../../types/astrology';
import type { WesternChart } from '../../types/westernAstrology';

export class WesternChartService {
  async calculateFullChart(bd: BirthData): Promise<WesternChart> {
    const raw = await getWesternPositions(bd.date, bd.latitude, bd.longitude, bd.timezone);
    return buildWesternChart(bd, raw);
  }
}

export const westernChartService = new WesternChartService();
