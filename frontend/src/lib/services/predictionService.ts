/**
 * Prediction Service — local-only, delegates to DashaPredictionEngine
 */

import { getPlanetPositions } from '../core/ephemeris';
import { VimshottariDasha } from '../core/dasha';
import { DashaPredictionEngine, type DashaPrediction } from '../core/predictions';
import type { BirthData } from '../../types/astrology';
import type { DashaPredictionData } from '../../services/api';

function toIso(d: Date): string { return d.toISOString(); }

function formatPrediction(pred: DashaPrediction): DashaPredictionData {
  const predictions = Object.fromEntries(
    Object.entries(pred.predictions).map(([area, p]) => [area, {
      trend: p.trend, intensity: p.intensity, summary: p.summary,
      details: p.details, remedies: p.remedies, keywords: p.keywords,
    }])
  ) as DashaPredictionData['predictions'];

  return {
    dashaLord: pred.dashaLord,
    antardasha: pred.antardasha,
    pratyantardasha: pred.pratyantardasha,
    sookshmaDasha: pred.sookshmaDasha,
    periodType: pred.periodType,
    overallTheme: pred.overallTheme,
    overallRating: pred.overallRating,
    predictions,
    favorableActivities: pred.favorableActivities,
    unfavorableActivities: pred.unfavorableActivities,
    remedies: { gemstone: pred.gemstone, mantra: pred.mantra, deity: pred.deity },
    combinationWarning: pred.combinationWarning,
    combinationBonus: pred.combinationBonus,
  };
}

function getMoonLon(bd: BirthData): number {
  return getPlanetPositions(bd.date, bd.latitude, bd.longitude, bd.timezone, bd.ayanamsa)['MOON'].longitude;
}

const engine = new DashaPredictionEngine();

export function getMahadashaPrediction(dashaLord: string): DashaPredictionData {
  return formatPrediction(engine.generateCompletePrediction(dashaLord));
}

export function getAntardashaPrediction(mahadasha: string, antardasha: string): DashaPredictionData {
  return formatPrediction(engine.generateCompletePrediction(mahadasha, antardasha));
}

export function getPratyantardashaPrediction(mahadasha: string, antardasha: string, pratyantardasha: string): DashaPredictionData {
  return formatPrediction(engine.generateCompletePrediction(mahadasha, antardasha, pratyantardasha));
}

export function getCurrentPeriodPrediction(bd: BirthData, targetDate?: Date): DashaPredictionData {
  const moonLon = getMoonLon(bd);
  const calc = new VimshottariDasha(moonLon, new Date(bd.date));
  const td = targetDate ?? new Date();
  const current = calc.getCurrentPeriods(td);
  if ('error' in current) throw new Error(current.error);

  const pred = engine.generateCompletePrediction(
    current.mahadasha.lord,
    current.antardasha.lord,
    current.pratyantardasha?.lord,
    current.sookshmaDasha?.lord,
  );
  const result = formatPrediction(pred);
  result.currentPeriods = {
    mahadasha: { lord: current.mahadasha.lord, start: toIso(current.mahadasha.start), end: toIso(current.mahadasha.end) },
    antardasha: { lord: current.antardasha.lord, start: toIso(current.antardasha.start), end: toIso(current.antardasha.end) },
    ...(current.pratyantardasha ? {
      pratyantardasha: { lord: current.pratyantardasha.lord, start: toIso(current.pratyantardasha.start), end: toIso(current.pratyantardasha.end) },
    } : {}),
    ...(current.sookshmaDasha ? {
      sookshmaDasha: { lord: current.sookshmaDasha.lord, start: toIso(current.sookshmaDasha.start), end: toIso(current.sookshmaDasha.end) },
    } : {}),
  };
  return result;
}

export interface SookshmaEntry {
  lord: string;
  start: string;
  end: string;
  days: number;
  isCurrent: boolean;
}

export interface SookshmaPeriodList {
  mahadasha: string;
  antardasha: string;
  pratyantardasha: string;
  pratyantarStart: string;
  pratyantarEnd: string;
  sookshmas: SookshmaEntry[];
  currentSookshmaLord: string | null;
}

export function getSookshmaPeriodsForCurrent(bd: BirthData, targetDate?: Date): SookshmaPeriodList | null {
  const moonLon = getMoonLon(bd);
  const calc = new VimshottariDasha(moonLon, new Date(bd.date));
  const td = targetDate ?? new Date();
  const current = calc.getCurrentPeriods(td);
  if ('error' in current || !current.pratyantardasha) return null;

  const mahadashas = calc.generateMahadashaTimeline();
  const currentMd = mahadashas.find(md => md.lord === current.mahadasha.lord && md.start <= td && md.end >= td);
  if (!currentMd) return null;
  const antardashas = calc.calculateAntardasha(currentMd);
  const currentAd = antardashas.find(ad => ad.lord === current.antardasha.lord && ad.start <= td && ad.end >= td);
  if (!currentAd) return null;
  const pratyantars = calc.calculatePratyantardasha(currentAd);
  const currentPd = pratyantars.find(pd => pd.lord === current.pratyantardasha!.lord && pd.start <= td && pd.end >= td);
  if (!currentPd) return null;

  const sookshmas = calc.calculateSookshmaDasha(currentPd);

  return {
    mahadasha: current.mahadasha.lord,
    antardasha: current.antardasha.lord,
    pratyantardasha: current.pratyantardasha.lord,
    pratyantarStart: toIso(currentPd.start),
    pratyantarEnd: toIso(currentPd.end),
    currentSookshmaLord: current.sookshmaDasha?.lord ?? null,
    sookshmas: sookshmas.map(sd => ({
      lord: sd.lord,
      start: toIso(sd.start),
      end: toIso(sd.end),
      days: Math.round(sd.days * 10) / 10,
      isCurrent: sd.lord === current.sookshmaDasha?.lord &&
        new Date(toIso(sd.start)) <= td && new Date(toIso(sd.end)) >= td,
    })),
  };
}

export function getTimelineWithPredictions(bd: BirthData, yearsAhead = 80): unknown[] {
  const moonLon = getMoonLon(bd);
  const calc = new VimshottariDasha(moonLon, new Date(bd.date));
  const mahadashas = calc.generateMahadashaTimeline(yearsAhead);

  return mahadashas.map(md => {
    const prediction = engine.generateCompletePrediction(md.lord);
    const antardashas = calc.calculateAntardasha(md);

    return {
      lord: md.lord,
      start: toIso(md.start),
      end: toIso(md.end),
      years: Math.round(md.years * 100) / 100,
      isBirthDasha: md.isBirthDasha,
      prediction: formatPrediction(prediction),
      antardashas: antardashas.map(ad => {
        const adPred = engine.generateCompletePrediction(md.lord, ad.lord);
        return {
          lord: ad.lord,
          start: toIso(ad.start),
          end: toIso(ad.end),
          days: Math.round(ad.days * 10) / 10,
          predictionSummary: {
            overallTheme: adPred.overallTheme,
            overallRating: adPred.overallRating,
            health: { trend: adPred.predictions.health.trend, summary: adPred.predictions.health.summary },
            wealth: { trend: adPred.predictions.wealth.trend, summary: adPred.predictions.wealth.summary },
            career: { trend: adPred.predictions.career.trend, summary: adPred.predictions.career.summary },
            relationships: { trend: adPred.predictions.relationships.trend, summary: adPred.predictions.relationships.summary },
            favorableActivities: adPred.favorableActivities.slice(0, 3),
            remedies: { gemstone: adPred.gemstone, mantra: adPred.mantra, deity: adPred.deity },
            combinationWarning: adPred.combinationWarning,
            combinationBonus: adPred.combinationBonus,
          },
        };
      }),
    };
  });
}
