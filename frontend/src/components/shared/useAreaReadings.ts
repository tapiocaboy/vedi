/**
 * Plain readings for every life area of a prediction (lib/core/areaReading.ts),
 * memoised per prediction and language.
 */
import { useMemo } from 'react';
import type { DashaPredictionData } from '../../services/api';
import { useLang } from '../../i18n/LanguageContext';
import { coreLang } from '../../i18n/translations';
import { buildAreaReading, type AreaReading } from '../../lib/core/areaReading';
import { INDICATORS } from '../../lib/core/classicalIndicators';

export const AREA_ORDER = ['career', 'wealth', 'relationships', 'health', 'general'] as const;
export type AreaOrderKey = (typeof AREA_ORDER)[number];

/**
 * Transit combinations exist only when the prediction was read against a dated
 * sky (the running period, or a date picked in Insights).
 */
export function predictionHasSky(p: DashaPredictionData): boolean {
  return !!p.currentPeriods || !!p.indicators?.some(h => INDICATORS.find(d => d.key === h.key)?.needsSky);
}

export function useAreaReadings(prediction: DashaPredictionData): Partial<Record<AreaOrderKey, AreaReading>> {
  const { lang } = useLang();
  return useMemo(() => {
    const hasSky = predictionHasSky(prediction);
    const out: Partial<Record<AreaOrderKey, AreaReading>> = {};
    for (const area of AREA_ORDER) {
      const p = prediction.predictions[area];
      const r = p && buildAreaReading({
        area, lang: coreLang(lang), score: p.score ?? 5, trend: p.trend, explanation: p.explanation,
        details: p.details, indicators: prediction.indicators, hasSky, mahadasha: prediction.dashaLord,
      });
      if (r) out[area] = r;
    }
    return out;
  }, [prediction, lang]);
}

