/**
 * Chart Service — orchestrates all local calculations.
 * Ephemeris calls are async (Swiss Ephemeris WASM is lazy-loaded).
 */

import { getPlanetPositions, getAyanamsaValue, type PlanetPosition as EphemerisPlanetPosition } from '../core/ephemeris';
import { RASHIS } from '../core/rashi';
import { getNakshatra } from '../core/nakshatra';
import { VimshottariDasha } from '../core/dasha';
import { YogaCalculator, type YogaResult } from '../core/yogas';
import type {
  BirthData, Chart, DashaTimeline, CurrentDasha,
  PlanetPosition, NakshatraInfo, DashaPeriod, AntardashaPeriod,
  PratyantardashaPeriod, DashaWithAntardashas,
} from '../../types/astrology';

function toIso(d: Date): string { return d.toISOString(); }

function toFrontendPosition(name: string, pos: EphemerisPlanetPosition): PlanetPosition {
  const nak = getNakshatra(pos.longitude);
  return {
    planet: name,
    longitude: Math.round(pos.longitude * 1000000) / 1000000,
    latitude: Math.round(pos.latitude * 1000000) / 1000000,
    rashi: RASHIS[pos.rashi],
    rashiIndex: pos.rashi,
    rashiDegree: Math.round(pos.rashiDegree * 10000) / 10000,
    nakshatra: nak.name,
    nakshatraIndex: nak.index,
    nakshatraPada: nak.pada,
    isRetrograde: pos.isRetrograde,
    speed: Math.round(pos.speed * 1000000) / 1000000,
  };
}

function toNakshatraInfo(nakData: ReturnType<typeof getNakshatra>): NakshatraInfo {
  return {
    index: nakData.index,
    name: nakData.name,
    lord: nakData.lord,
    pada: nakData.pada,
    degree: Math.round(nakData.degree * 10000) / 10000,
    deity: nakData.deity,
    symbol: nakData.symbol,
    gana: nakData.gana,
  };
}

export class ChartService {

  async calculatePlanetPositions(bd: BirthData): Promise<{ planets: PlanetPosition[]; ascendant: PlanetPosition }> {
    const positions = await getPlanetPositions(bd.date, bd.latitude, bd.longitude, bd.timezone, bd.ayanamsa);
    const planets: PlanetPosition[] = [];
    let ascendant!: PlanetPosition;
    for (const [name, pos] of Object.entries(positions)) {
      const fp = toFrontendPosition(name, pos);
      if (name === 'ASCENDANT') ascendant = fp;
      else planets.push(fp);
    }
    return { planets, ascendant };
  }

  async getMoonNakshatra(bd: BirthData): Promise<NakshatraInfo> {
    const positions = await getPlanetPositions(bd.date, bd.latitude, bd.longitude, bd.timezone, bd.ayanamsa);
    return toNakshatraInfo(getNakshatra(positions['MOON'].longitude));
  }

  /** Calculate yogas from birth chart positions */
  async calculateYogas(bd: BirthData): Promise<YogaResult[]> {
    const rawPositions = await getPlanetPositions(bd.date, bd.latitude, bd.longitude, bd.timezone, bd.ayanamsa);
    const posMap: Record<string, number> = {};
    for (const [name, pos] of Object.entries(rawPositions)) {
      if (name !== 'ASCENDANT') posMap[name] = pos.rashi;
    }
    const ascendantRashi = rawPositions['ASCENDANT'].rashi;
    const calc = new YogaCalculator(posMap, ascendantRashi);
    return calc.detectAllYogas();
  }

  private async _createDashaCalc(bd: BirthData): Promise<VimshottariDasha> {
    const positions = await getPlanetPositions(bd.date, bd.latitude, bd.longitude, bd.timezone, bd.ayanamsa);
    return new VimshottariDasha(positions['MOON'].longitude, new Date(bd.date));
  }

  async getDashaTimeline(bd: BirthData, yearsAhead = 120): Promise<DashaTimeline> {
    const calc = await this._createDashaCalc(bd);
    const moonNak = await this.getMoonNakshatra(bd);
    const balance = calc.calculateDashaBalance();
    const fullTimeline = calc.getFullTimelineWithAntardashas(yearsAhead);

    const timeline: DashaWithAntardashas[] = fullTimeline.map(item => ({
      mahadasha: {
        lord: item.mahadasha.lord,
        start: toIso(item.mahadasha.start),
        end: toIso(item.mahadasha.end),
        durationYears: item.mahadasha.years,
        durationDays: item.mahadasha.years * 365.25,
        isBirthDasha: item.mahadasha.isBirthDasha,
      },
      antardashas: item.antardashas.map(ad => ({
        lord: ad.lord,
        start: toIso(ad.start),
        end: toIso(ad.end),
        durationDays: ad.days,
        mahadashaLord: item.mahadasha.lord,
      })),
    }));

    return {
      birthData: bd,
      moonNakshatra: moonNak,
      birthDashaLord: balance.lord,
      dashaBalance: {
        totalYears: balance.totalYears,
        elapsedYears: Math.round(balance.elapsedYears * 10000) / 10000,
        remainingYears: Math.round(balance.remainingYears * 10000) / 10000,
        remainingDays: Math.round(balance.remainingDays * 100) / 100,
      },
      timeline,
    };
  }

  async getCurrentPeriods(bd: BirthData, targetDate?: Date): Promise<CurrentDasha> {
    const td = targetDate ?? new Date();
    const calc = await this._createDashaCalc(bd);
    const result = calc.getCurrentPeriods(td);
    if ('error' in result) throw new Error(result.error);

    const mahadasha: DashaPeriod = {
      lord: result.mahadasha.lord,
      start: toIso(result.mahadasha.start),
      end: toIso(result.mahadasha.end),
      durationYears: result.mahadasha.years,
      durationDays: result.mahadasha.years * 365.25,
      isBirthDasha: false,
    };
    const antardasha: AntardashaPeriod = {
      lord: result.antardasha.lord,
      start: toIso(result.antardasha.start),
      end: toIso(result.antardasha.end),
      durationDays: result.antardasha.days,
      mahadashaLord: result.mahadasha.lord,
    };
    let pratyantardasha: PratyantardashaPeriod | undefined;
    if (result.pratyantardasha) {
      pratyantardasha = {
        lord: result.pratyantardasha.lord,
        start: toIso(result.pratyantardasha.start),
        end: toIso(result.pratyantardasha.end),
        durationDays: result.pratyantardasha.days,
        mahadashaLord: result.mahadasha.lord,
        antardashaLord: result.antardasha.lord,
      };
    }
    return { targetDate: toIso(td), mahadasha, antardasha, pratyantardasha };
  }

  async calculateFullChart(bd: BirthData): Promise<Chart> {
    const { planets, ascendant } = await this.calculatePlanetPositions(bd);
    const moonNakshatra = await this.getMoonNakshatra(bd);
    const currentDasha = await this.getCurrentPeriods(bd);
    const calc = await this._createDashaCalc(bd);
    const mahadashas = calc.generateMahadashaTimeline(120);
    const mahadashaTimeline: DashaPeriod[] = mahadashas.map(md => ({
      lord: md.lord,
      start: toIso(md.start),
      end: toIso(md.end),
      durationYears: md.years,
      durationDays: md.days,
      isBirthDasha: md.isBirthDasha,
    }));
    const rawAyanamsa = await getAyanamsaValue(bd.date, bd.timezone, bd.ayanamsa);
    const ayanamsaValue = Math.round(rawAyanamsa * 1000000) / 1000000;
    return { birthData: bd, ayanamsaValue, planets, ascendant, moonNakshatra, currentDasha, mahadashaTimeline };
  }
}

export const chartService = new ChartService();
