/**
 * A period in plain words — headline, one sentence on what it is about, where
 * it stands among all periods — with the astrology (theme line, how the overall
 * rating adds up) behind "The astrology behind this".
 */
import type { DashaPredictionData } from '../../services/api';
import { useLang } from '../../i18n/LanguageContext';
import { coreLang } from '../../i18n/translations';
import { AstroDisclosure, AreaWhyBody } from './AreaWhy';
import { plainPeriodHeader } from '../../lib/core/plainSummary';
import { buildAreaReading } from '../../lib/core/areaReading';
import { READING_LABELS } from '../../lib/core/text/readingText';

/** The period in plain words, with the astrology (theme line, rating breakdown) one tap away. */
export function PlainPeriodSummary({ prediction, extraLine, className = 'mt-3' }: {
  prediction: DashaPredictionData;
  /** A further plain sentence under the period line (e.g. what the short period is about). */
  extraLine?: string;
  className?: string;
}) {
  const { lang } = useLang();
  const L = coreLang(lang);
  const p = prediction.currentPeriods;
  const header = plainPeriodHeader({
    lang: L, mahadasha: p?.mahadasha.lord ?? prediction.dashaLord, antardasha: p?.antardasha?.lord ?? prediction.antardasha,
    overallRating: prediction.overallRating, overallPercentile: prediction.overallPercentile,
  });
  const reading = prediction.overallExplanation
    ? buildAreaReading({
        area: 'general', lang: L, score: prediction.overallScore ?? prediction.overallRating, trend: prediction.predictions.general?.trend ?? 'neutral',
        explanation: prediction.overallExplanation, indicators: prediction.indicators, hasSky: true, mahadasha: prediction.dashaLord, overall: true,
      })
    : null;
  return (
    <div className={className}>
      <p className="text-sm font-semibold text-white">{header.headline}</p>
      <p className="text-xs text-white/65 mt-0.5 leading-relaxed">{header.line}</p>
      {extraLine && <p className="text-xs text-white/65 mt-0.5 leading-relaxed">{extraLine}</p>}
      {header.standing && <p className="text-xs text-white/45 mt-1">{header.standing}</p>}
      <AstroDisclosure showLabel={READING_LABELS.showWhy[L]} hideLabel={READING_LABELS.hideWhy[L]}>
        <div className="space-y-4">
          <p className="text-xs text-white/65 leading-relaxed">{prediction.overallTheme}</p>
          {reading && <AreaWhyBody reading={reading} />}
        </div>
      </AstroDisclosure>
    </div>
  );
}

export default PlainPeriodSummary;
