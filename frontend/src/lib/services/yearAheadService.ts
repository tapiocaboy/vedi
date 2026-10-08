/**
 * Data for the Graph tab: the main periods of a whole life ("chapters") and a
 * month-by-month reading of the year ahead.
 *
 * Every month is the app's ordinary current-period reading taken on that date
 * (getCurrentPeriodPrediction: dasha chain, natal foundation, that day's sky,
 * calibrated labels), so the chart says exactly what the Now tab would say on
 * each of those days — nothing is computed differently here.
 */
import { VimshottariDasha } from '../core/dasha';
import { birthInstant } from '../core/birthInstant';
import { getPlanetPositions } from '../core/ephemeris';
import { type Lang, getStoredLang } from '../core/i18n';
import type { PeriodChange } from '../core/yearAhead';
import { getCurrentPeriodPrediction } from './predictionService';
import type { BirthData } from '../../types/astrology';
import type { DashaPredictionData } from '../../services/api';

const YEAR_MS = 365.25 * 86_400_000;
/** How far the chapter strip runs. */
const LIFE_YEARS = 90;

export interface LifeChapter {
  lord: string;
  start: string;
  end: string;
  fromAge: number;
  toAge: number;
  isNow: boolean;
  isPast: boolean;
}

export interface MonthOutlook {
  /** The instant the month was read at (today for the first month, the 15th for the rest). */
  at: string;
  year: number;
  /** 0–11 */
  month: number;
  isNow: boolean;
  prediction: DashaPredictionData;
}

export interface YearAhead {
  chapters: LifeChapter[];
  /** Age today, in years. */
  ageNow: number;
  lifeYears: number;
  months: MonthOutlook[];
  /** Main- and sub-period changes that fall inside the months shown. */
  changes: PeriodChange[];
}

export async function getYearAhead(
  bd: BirthData,
  monthsAhead = 12,
  asOf: Date = new Date(),
  lang: Lang = getStoredLang(),
): Promise<YearAhead> {
  const positions = await getPlanetPositions(bd.date, bd.latitude, bd.longitude, bd.timezone, bd.ayanamsa);
  const birth = birthInstant(bd);
  const dasha = new VimshottariDasha(positions.MOON.longitude, birth);
  const age = (t: Date) => (t.getTime() - birth.getTime()) / YEAR_MS;
  const lifeEnd = new Date(birth.getTime() + LIFE_YEARS * YEAR_MS);

  const timeline = dasha.generateMahadashaTimeline(LIFE_YEARS + 20);
  const chapters: LifeChapter[] = timeline
    .filter(m => m.start < lifeEnd)
    .map(m => {
      const end = m.end > lifeEnd ? lifeEnd : m.end;
      return {
        lord: m.lord, start: m.start.toISOString(), end: m.end.toISOString(),
        fromAge: Math.max(0, age(m.start)), toAge: age(end),
        isNow: m.start <= asOf && asOf < m.end, isPast: m.end <= asOf,
      };
    });

  // One reading per month: today first, then the 15th of each following month.
  const months: MonthOutlook[] = [];
  for (let i = 0; i < monthsAhead; i++) {
    const at = i === 0 ? asOf : new Date(Date.UTC(asOf.getUTCFullYear(), asOf.getUTCMonth() + i, 15, 12));
    const prediction = await getCurrentPeriodPrediction(bd, at, lang);
    months.push({ at: at.toISOString(), year: at.getUTCFullYear(), month: at.getUTCMonth(), isNow: i === 0, prediction });
  }

  // Period changes inside the window.
  const windowEnd = new Date(Date.UTC(asOf.getUTCFullYear(), asOf.getUTCMonth() + monthsAhead, 1));
  const changes: PeriodChange[] = [];
  timeline.forEach((m, mi) => {
    if (m.start > asOf && m.start < windowEnd && mi > 0) {
      changes.push({ date: m.start.toISOString(), level: 'main', from: timeline[mi - 1].lord, to: m.lord });
    }
    if (m.end < asOf || m.start > windowEnd) return;
    const ads = dasha.calculateAntardasha(m);
    ads.forEach((a, ai) => {
      // The first antardasha of a new mahadasha is announced as the main change.
      if (ai === 0 || a.start <= asOf || a.start >= windowEnd) return;
      changes.push({ date: a.start.toISOString(), level: 'sub', from: ads[ai - 1].lord, to: a.lord });
    });
  });
  changes.sort((a, b) => a.date.localeCompare(b.date));

  return { chapters, ageNow: age(asOf), lifeYears: LIFE_YEARS, months, changes };
}
