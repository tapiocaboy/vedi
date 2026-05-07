/**
 * API surface — all calculations run locally (no HTTP backend).
 */

import type { BirthData, Chart, DashaTimeline, CurrentDasha } from '../types/astrology';
export type { BirthData } from '../types/astrology';
import { chartService } from '../lib/services/chartService';
import type { YogaResult } from '../lib/core/yogas';
import {
  getMahadashaPrediction as libGetMD,
  getAntardashaPrediction as libGetAD,
  getPratyantardashaPrediction as libGetPD,
  getCurrentPeriodPrediction,
  getTimelineWithPredictions as libGetTimeline,
  getSookshmaPeriodsForCurrent,
  type SookshmaPeriodList,
} from '../lib/services/predictionService';

export type { SookshmaPeriodList };

export type { YogaResult };

// ─── Prediction types ────────────────────────────────────────────────────────

export interface AreaPrediction {
  trend: 'positive' | 'negative' | 'mixed' | 'neutral';
  intensity: string;
  summary: string;
  details: string[];
  remedies: string[];
  keywords: string[];
}

export interface DashaPredictionData {
  dashaLord: string;
  antardasha?: string;
  pratyantardasha?: string;
  sookshmaDasha?: string;
  periodType: string;
  overallTheme: string;
  overallRating: number;
  predictions: {
    health: AreaPrediction;
    wealth: AreaPrediction;
    career: AreaPrediction;
    relationships: AreaPrediction;
    general: AreaPrediction;
  };
  favorableActivities: string[];
  unfavorableActivities: string[];
  remedies: {
    gemstone: string | null;
    mantra: string | null;
    deity: string | null;
  };
  combinationWarning?: string;
  combinationBonus?: string;
  currentPeriods?: {
    mahadasha: { lord: string; start: string; end: string };
    antardasha?: { lord: string; start: string; end: string };
    pratyantardasha?: { lord: string; start: string; end: string };
    sookshmaDasha?: { lord: string; start: string; end: string };
  };
}

// ─── Chart ───────────────────────────────────────────────────────────────────

export async function generateChart(birthData: BirthData): Promise<Chart> {
  return chartService.calculateFullChart(birthData);
}

export async function getDashaTimeline(birthData: BirthData, yearsAhead = 120): Promise<DashaTimeline> {
  return chartService.getDashaTimeline(birthData, yearsAhead);
}

export async function getCurrentDasha(birthData: BirthData, targetDate?: Date): Promise<CurrentDasha> {
  return chartService.getCurrentPeriods(birthData, targetDate);
}

export async function getPlanetPositions(birthData: BirthData) {
  const { planets, ascendant } = chartService.calculatePlanetPositions(birthData);
  return { planets, ascendant };
}

export async function getMoonNakshatra(birthData: BirthData) {
  return chartService.getMoonNakshatra(birthData);
}

export async function getYogas(birthData: BirthData): Promise<YogaResult[]> {
  return chartService.calculateYogas(birthData);
}

export async function healthCheck() {
  return { status: 'ok', version: '1.0.0-client', timestamp: new Date().toISOString() };
}

// ─── Predictions ─────────────────────────────────────────────────────────────

export async function getCurrentPrediction(birthData: BirthData, targetDate?: Date): Promise<DashaPredictionData> {
  return getCurrentPeriodPrediction(birthData, targetDate);
}

export async function getMahadashaPrediction(_birthData: BirthData, dashaLord: string): Promise<DashaPredictionData> {
  return libGetMD(dashaLord);
}

export async function getAntardashaPrediction(_birthData: BirthData, mahadasha: string, antardasha: string): Promise<DashaPredictionData> {
  return libGetAD(mahadasha, antardasha);
}

export async function getPratyantardashaPrediction(_birthData: BirthData, mahadasha: string, antardasha: string, pratyantardasha: string): Promise<DashaPredictionData> {
  return libGetPD(mahadasha, antardasha, pratyantardasha);
}

export async function getSookshmaPeriods(birthData: BirthData): Promise<SookshmaPeriodList | null> {
  return getSookshmaPeriodsForCurrent(birthData);
}

export async function getTimelineWithPredictions(birthData: BirthData, yearsAhead = 80): Promise<unknown[]> {
  return libGetTimeline(birthData, yearsAhead);
}

export async function getRemedies(birthData: BirthData): Promise<{
  currentPeriods: unknown;
  gemstone: string | null;
  mantra: string | null;
  deity: string | null;
  favorableActivities: string[];
  unfavorableActivities: string[];
  areaRemedies: Record<string, string[]>;
  combinationWarning?: string;
  combinationBonus?: string;
}> {
  const pred = await getCurrentPrediction(birthData);
  const areaRemedies: Record<string, string[]> = {};
  for (const [area, p] of Object.entries(pred.predictions)) {
    areaRemedies[area] = p.remedies;
  }
  return {
    currentPeriods: pred.currentPeriods,
    gemstone: pred.remedies.gemstone,
    mantra: pred.remedies.mantra,
    deity: pred.remedies.deity,
    favorableActivities: pred.favorableActivities,
    unfavorableActivities: pred.unfavorableActivities,
    areaRemedies,
    combinationWarning: pred.combinationWarning,
    combinationBonus: pred.combinationBonus,
  };
}
