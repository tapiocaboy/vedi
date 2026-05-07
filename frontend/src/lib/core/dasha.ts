/**
 * Vimshottari Dasha System — 4-level implementation
 * Mahadasha → Antardasha → Pratyantardasha → Sookshma Dasha
 */

import { getNakshatra, NAKSHATRA_SPAN } from './nakshatra';

export const DASHA_YEARS: Record<string, number> = {
  Ketu:7, Venus:20, Sun:6, Moon:10, Mars:7,
  Rahu:18, Jupiter:16, Saturn:19, Mercury:17,
};

export const DASHA_SEQUENCE = ['Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury'];
export const TOTAL_DASHA_YEARS = 120;
export const DAYS_PER_YEAR = 365.25;

export interface DashaPeriodInfo {
  lord: string;
  start: Date;
  end: Date;
  years: number;
  days: number;
  isBirthDasha: boolean;
}

export interface AntardashaPeriodInfo {
  lord: string;
  start: Date;
  end: Date;
  days: number;
  mahadashaLord: string;
}

export interface PratyantardashaPeriodInfo {
  lord: string;
  start: Date;
  end: Date;
  days: number;
  mahadashaLord: string;
  antardashaLord: string;
}

export interface SookshmaDashaPeriodInfo {
  lord: string;
  start: Date;
  end: Date;
  days: number;
  mahadashaLord: string;
  antardashaLord: string;
  pratyantarLord: string;
}

function addDaysToDate(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 86400000);
}

function addYearsToDate(date: Date, years: number): Date {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + Math.floor(years));
  const fracYear = years - Math.floor(years);
  return addDaysToDate(d, fracYear * DAYS_PER_YEAR);
}

function containsDate(start: Date, end: Date, target: Date): boolean {
  return target >= start && target <= end;
}

export class VimshottariDasha {
  moonLongitude: number;
  birthDt: Date;
  nakshatra: ReturnType<typeof getNakshatra>;

  constructor(moonLongitude: number, birthDatetime: Date) {
    this.moonLongitude = moonLongitude;
    this.birthDt = birthDatetime;
    this.nakshatra = getNakshatra(moonLongitude);
  }

  getBirthDashaLord(): string {
    return this.nakshatra.lord;
  }

  getElapsedDashaPortion(): number {
    return this.nakshatra.degree / NAKSHATRA_SPAN;
  }

  calculateDashaBalance(): {
    lord: string; totalYears: number; elapsedFraction: number;
    elapsedYears: number; remainingYears: number; remainingDays: number; endDate: Date;
  } {
    const lord = this.getBirthDashaLord();
    const totalYears = DASHA_YEARS[lord];
    const elapsedFraction = this.getElapsedDashaPortion();
    const remainingYears = totalYears * (1 - elapsedFraction);
    const remainingDays = remainingYears * DAYS_PER_YEAR;
    const endDate = addDaysToDate(this.birthDt, remainingDays);
    return {
      lord, totalYears, elapsedFraction,
      elapsedYears: totalYears * elapsedFraction,
      remainingYears, remainingDays, endDate,
    };
  }

  generateMahadashaTimeline(yearsAhead = 120): DashaPeriodInfo[] {
    const timeline: DashaPeriodInfo[] = [];
    const balance = this.calculateDashaBalance();

    timeline.push({
      lord: balance.lord, start: this.birthDt, end: balance.endDate,
      years: balance.remainingYears, days: balance.remainingDays, isBirthDasha: true,
    });

    const startIdx = DASHA_SEQUENCE.indexOf(balance.lord);
    let currentDate = balance.endDate;
    const maxDate = addYearsToDate(this.birthDt, yearsAhead);

    let cycle = 1;
    while (currentDate < maxDate) {
      const lord = DASHA_SEQUENCE[(startIdx + cycle) % 9];
      const years = DASHA_YEARS[lord];
      const days = years * DAYS_PER_YEAR;
      const endDate = addDaysToDate(currentDate, days);
      timeline.push({ lord, start: currentDate, end: endDate, years, days, isBirthDasha: false });
      currentDate = endDate;
      cycle++;
    }
    return timeline;
  }

  calculateAntardasha(mahadasha: DashaPeriodInfo): AntardashaPeriodInfo[] {
    const antardashas: AntardashaPeriodInfo[] = [];
    const mdLord = mahadasha.lord;
    const mdYears = mahadasha.years;
    const startIdx = DASHA_SEQUENCE.indexOf(mdLord);
    let currentDate = mahadasha.start;

    for (let i = 0; i < 9; i++) {
      const adLord = DASHA_SEQUENCE[(startIdx + i) % 9];
      const adBaseYears = DASHA_YEARS[adLord];
      const adDays = (mdYears * adBaseYears * DAYS_PER_YEAR) / TOTAL_DASHA_YEARS;
      const endDate = addDaysToDate(currentDate, adDays);
      antardashas.push({ lord: adLord, start: currentDate, end: endDate, days: adDays, mahadashaLord: mdLord });
      currentDate = endDate;
    }
    return antardashas;
  }

  calculatePratyantardasha(antardasha: AntardashaPeriodInfo): PratyantardashaPeriodInfo[] {
    const pratyantars: PratyantardashaPeriodInfo[] = [];
    const adLord = antardasha.lord;
    const adDays = antardasha.days;
    const startIdx = DASHA_SEQUENCE.indexOf(adLord);
    let currentDate = antardasha.start;

    for (let i = 0; i < 9; i++) {
      const pdLord = DASHA_SEQUENCE[(startIdx + i) % 9];
      const pdBaseYears = DASHA_YEARS[pdLord];
      const pdDays = (adDays * pdBaseYears) / TOTAL_DASHA_YEARS;
      const endDate = addDaysToDate(currentDate, pdDays);
      pratyantars.push({
        lord: pdLord, start: currentDate, end: endDate, days: pdDays,
        mahadashaLord: antardasha.mahadashaLord, antardashaLord: adLord,
      });
      currentDate = endDate;
    }
    return pratyantars;
  }

  /**
   * Sookshma Dasha — 4th level of Vimshottari.
   * Each Pratyantardasha is subdivided by the same 9-planet sequence.
   * Duration formula: pdDays * planetYears / 120
   */
  calculateSookshmaDasha(pratyantardasha: PratyantardashaPeriodInfo): SookshmaDashaPeriodInfo[] {
    const sookshmas: SookshmaDashaPeriodInfo[] = [];
    const pdLord = pratyantardasha.lord;
    const pdDays = pratyantardasha.days;
    const startIdx = DASHA_SEQUENCE.indexOf(pdLord);
    let currentDate = pratyantardasha.start;

    for (let i = 0; i < 9; i++) {
      const sdLord = DASHA_SEQUENCE[(startIdx + i) % 9];
      const sdBaseYears = DASHA_YEARS[sdLord];
      const sdDays = (pdDays * sdBaseYears) / TOTAL_DASHA_YEARS;
      const endDate = addDaysToDate(currentDate, sdDays);
      sookshmas.push({
        lord: sdLord, start: currentDate, end: endDate, days: sdDays,
        mahadashaLord: pratyantardasha.mahadashaLord,
        antardashaLord: pratyantardasha.antardashaLord,
        pratyantarLord: pdLord,
      });
      currentDate = endDate;
    }
    return sookshmas;
  }

  getCurrentPeriods(targetDate?: Date): {
    targetDate: Date;
    mahadasha: { lord: string; start: Date; end: Date; years: number };
    antardasha: { lord: string; start: Date; end: Date; days: number };
    pratyantardasha: { lord: string; start: Date; end: Date; days: number } | null;
    sookshmaDasha: { lord: string; start: Date; end: Date; days: number } | null;
  } | { error: string } {
    const td = targetDate ?? new Date();
    const mahadashas = this.generateMahadashaTimeline();
    const currentMd = mahadashas.find(md => containsDate(md.start, md.end, td));
    if (!currentMd) return { error: 'Target date is outside the dasha timeline' };

    const antardashas = this.calculateAntardasha(currentMd);
    const currentAd = antardashas.find(ad => containsDate(ad.start, ad.end, td));
    if (!currentAd) return { error: 'Could not find current Antardasha' };

    const pratyantars = this.calculatePratyantardasha(currentAd);
    const currentPd = pratyantars.find(pd => containsDate(pd.start, pd.end, td)) ?? null;

    let currentSd: SookshmaDashaPeriodInfo | null = null;
    if (currentPd) {
      const sookshmas = this.calculateSookshmaDasha(currentPd);
      currentSd = sookshmas.find(sd => containsDate(sd.start, sd.end, td)) ?? null;
    }

    return {
      targetDate: td,
      mahadasha: { lord: currentMd.lord, start: currentMd.start, end: currentMd.end, years: currentMd.years },
      antardasha: { lord: currentAd.lord, start: currentAd.start, end: currentAd.end, days: currentAd.days },
      pratyantardasha: currentPd ? { lord: currentPd.lord, start: currentPd.start, end: currentPd.end, days: currentPd.days } : null,
      sookshmaDasha: currentSd ? { lord: currentSd.lord, start: currentSd.start, end: currentSd.end, days: currentSd.days } : null,
    };
  }

  getFullTimelineWithAntardashas(yearsAhead = 120): Array<{
    mahadasha: { lord: string; start: Date; end: Date; years: number; isBirthDasha: boolean };
    antardashas: Array<{ lord: string; start: Date; end: Date; days: number }>;
  }> {
    return this.generateMahadashaTimeline(yearsAhead).map(md => ({
      mahadasha: { lord: md.lord, start: md.start, end: md.end, years: md.years, isBirthDasha: md.isBirthDasha },
      antardashas: this.calculateAntardasha(md).map(ad => ({ lord: ad.lord, start: ad.start, end: ad.end, days: ad.days })),
    }));
  }
}
