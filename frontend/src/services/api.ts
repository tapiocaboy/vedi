/**
 * API surface — all calculations run locally (no HTTP backend).
 */

import type { BirthData, Chart, DashaTimeline, CurrentDasha } from '../types/astrology';
export type { BirthData } from '../types/astrology';
import { type Lang, getStoredLang } from '../lib/core/i18n';
import { chartService } from '../lib/services/chartService';
import type { YogaResult } from '../lib/core/yogas';
import {
  getMahadashaPrediction as libGetMD,
  getAntardashaPrediction as libGetAD,
  getPratyantardashaPrediction as libGetPD,
  getCurrentPeriodPrediction,
  getTimelineWithPredictions as libGetTimeline,
  getSookshmaPeriodsForCurrent,
  getAshtakavargaForChart,
  type SookshmaPeriodList,
} from '../lib/services/predictionService';
import type { AshtakavargaResult } from '../lib/core/ashtakavarga';
import { getPeriodSnapshot, type PeriodSnapshot } from '../lib/services/periodService';
import { getCurrentTransits, type CurrentLocation, type GocharaSnapshot } from '../lib/core/transits';
import { getPlanetPositions as getRawPositions } from '../lib/core/ephemeris';
import { runMatching, type MatchSummary } from '../lib/services/matchingService';
import { getVargaReport, type VargaReport, type VargaInsight } from '../lib/services/vargaService';
import { getPanchangaReport, type PanchangaReport, type ChoghadiyaPeriod } from '../lib/services/panchangaService';
import { getDoshaReport, type DoshaReport } from '../lib/services/doshaService';
import {
  getAntardashaDepth as libGetAntardashaDepth,
  type AntardashaDepthReport,
  type WeightedPratyantardasha,
} from '../lib/services/dashaDepthService';

export type { VargaReport, VargaInsight, PanchangaReport, ChoghadiyaPeriod, DoshaReport };
export type { AntardashaDepthReport, WeightedPratyantardasha };
export type { WeightBand, PeriodTone, WeightFactor } from '../lib/core/dashaWeight';
export type { TransitHit } from '../lib/core/dashaTransits';
export type { PeriodStrategy, StrategyWindow, Stance } from '../lib/core/periodStrategy';
export type { AntardashaJudgement, JudgementFactor, Verdict } from '../lib/core/antardashaJudgement';
export type { VargaChart, VargaPlanet } from '../lib/core/vargas';
export type { DoshaCheck, SadeSatiPeriod, SadeSatiPhase } from '../lib/core/doshas';

export type { PeriodSnapshot, CurrentLocation, MatchSummary, GocharaSnapshot };
export type { PlanetTransit } from '../lib/core/transits';
export type { MatchReport, KootaScore, DoshaResult } from '../lib/core/matching';

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

/** Natal-condition summary of a dasha lord (dignity, lordship, combustion…). */
export interface LordStrengthData {
  planet: string;
  role: 'mahadasha' | 'antardasha';
  dignity: string | null;
  neechaBhanga: boolean;
  isCombust: boolean;
  isRetrograde: boolean;
  functionalNature: string | null;
  lordedHouses: number[];
  natalHouse: number | null;
  strengthScore: number;
  notes: string[];
}

/** The birth chart's standing condition for one life area, before any dasha. */
export interface FoundationData {
  area: 'career' | 'wealth' | 'relationship' | 'health';
  /** −3 … +3. */
  score: number;
  weak: boolean;
  strong: boolean;
  notes: string[];
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
  importantTransits?: string[];
  lordStrengths?: LordStrengthData[];
  natalFoundation?: FoundationData[];
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
  const { planets, ascendant } = await chartService.calculatePlanetPositions(birthData);
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

export async function getCurrentPrediction(birthData: BirthData, targetDate?: Date, lang?: Lang): Promise<DashaPredictionData> {
  return getCurrentPeriodPrediction(birthData, targetDate, lang ?? getStoredLang());
}

export async function getMahadashaPrediction(birthData: BirthData, dashaLord: string, lang?: Lang): Promise<DashaPredictionData> {
  return libGetMD(birthData, dashaLord, lang ?? getStoredLang());
}

export async function getAntardashaPrediction(birthData: BirthData, mahadasha: string, antardasha: string, lang?: Lang): Promise<DashaPredictionData> {
  return libGetAD(birthData, mahadasha, antardasha, lang ?? getStoredLang());
}

export async function getPratyantardashaPrediction(birthData: BirthData, mahadasha: string, antardasha: string, pratyantardasha: string, lang?: Lang): Promise<DashaPredictionData> {
  return libGetPD(birthData, mahadasha, antardasha, pratyantardasha, lang ?? getStoredLang());
}

/**
 * Pratyantardasha-level breakdown of one antardasha: per-window weight, the
 * transits that reinforce it, and how to work the period profitably.
 * `antardashaStart` is the ISO start of the exact antardasha instance.
 */
export async function getAntardashaDepth(
  birthData: BirthData,
  antardashaStart: string,
  asOf?: Date,
  lang?: Lang,
): Promise<AntardashaDepthReport | null> {
  return libGetAntardashaDepth(birthData, antardashaStart, asOf, lang ?? getStoredLang());
}

export async function getAshtakavarga(birthData: BirthData): Promise<AshtakavargaResult> {
  return getAshtakavargaForChart(birthData);
}

/** Ashtakoot Milan + dosha report between two birth charts. */
export async function getMatchReport(person: BirthData, partner: BirthData): Promise<MatchSummary> {
  return runMatching(person, partner);
}

/** Full snapshot for the "Now" tab: dasha tree + chart-aware prediction + transits + optional relocation + playbook. */
export async function getCurrentPeriodSnapshot(
  birthData: BirthData,
  currentLocation?: CurrentLocation,
  asOf?: Date,
  lang?: Lang,
): Promise<PeriodSnapshot> {
  return getPeriodSnapshot(birthData, currentLocation, asOf, lang ?? getStoredLang());
}

export async function getSookshmaPeriods(birthData: BirthData, targetDate?: Date): Promise<SookshmaPeriodList | null> {
  return getSookshmaPeriodsForCurrent(birthData, targetDate);
}

/** Gochara (planetary transits) for a chart at a given date (defaults to now). */
export async function getGochara(birthData: BirthData, asOf?: Date, lang?: Lang): Promise<GocharaSnapshot> {
  const positions = await getRawPositions(birthData.date, birthData.latitude, birthData.longitude, birthData.timezone, birthData.ayanamsa);
  return getCurrentTransits(birthData.ayanamsa, positions['MOON'].rashi, positions['ASCENDANT'].rashi, asOf, undefined, positions, lang ?? getStoredLang());
}

/** Divisional charts: Navamsa (D9) + Dasamsa (D10) with marriage/career insights. */
export async function getVargas(birthData: BirthData): Promise<VargaReport> {
  return getVargaReport(birthData);
}

/** Dosha checker: Mangal, Kaal Sarpa, Pitra + the full Sade Sati timeline. */
export async function getDoshas(birthData: BirthData): Promise<DoshaReport> {
  return getDoshaReport(birthData);
}

/** Today's Panchanga + Muhurta timings for the birth location. */
export async function getPanchanga(birthData: BirthData, asOf?: Date): Promise<PanchangaReport> {
  return getPanchangaReport(birthData, asOf);
}

export async function getTimelineWithPredictions(birthData: BirthData, yearsAhead = 80, lang?: Lang): Promise<unknown[]> {
  return libGetTimeline(birthData, yearsAhead, lang ?? getStoredLang());
}

export async function getRemedies(birthData: BirthData, lang?: Lang): Promise<{
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
  const pred = await getCurrentPrediction(birthData, undefined, lang);
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
