/**
 * How much of this chart the birth time can actually support.
 *
 * Two positions decide whether a reading rests on solid ground, and both can sit
 * arbitrarily close to a boundary without anything in the output saying so:
 *
 *   • **The ascendant.** It moves roughly a degree every four minutes. A chart
 *     with the lagna at 29.06° of a sign is one recorded-to-the-nearest-5-minutes
 *     rounding away from the next sign, and every house placement in it —
 *     therefore every lordship, every dusthana judgement, the whole functional
 *     layout — flips. A confident house-based reading on such a chart is asserting
 *     a coin flip.
 *
 *   • **The Moon's nakshatra.** The entire Vimshottari timeline is keyed to it, so
 *     a Moon within about 0°48' of a nakshatra boundary means every dasha date in
 *     the output could belong to a different sequence of lords.
 *
 * Neither is a defect in the chart. Both are facts about the input that the output
 * has to carry, because the alternative is a reading that sounds equally certain
 * whether it is determinate or not.
 */

import { getNakshatra, NAKSHATRA_SPAN, PADA_SPAN } from './nakshatra';
import { RASHI_ENGLISH } from './rashi';

/** Degrees the ascendant covers per minute of clock time, as a nominal rate. */
const ASC_DEGREES_PER_MINUTE = 0.25;

/**
 * The ascendant is banded in *minutes of birth-time error*, not degrees.
 *
 * Degrees are the wrong unit for the question being asked. Recorded birth times
 * cluster on five-minute increments because that is how someone reads a clock and
 * writes a number down, so "could a plausible recording error move this into the
 * next sign" is answered in minutes. A degree threshold also silently means
 * different things at different latitudes, where the ascendant's rate varies by
 * more than a factor of two.
 */
const ASC_INDETERMINATE_MINUTES = 5;   // within the granularity times are recorded at
const ASC_BORDERLINE_MINUTES = 15;

/** Classical low-confidence band for the Moon against a nakshatra boundary. */
const MOON_NAKSHATRA_BOUNDARY_DEGREES = 0.8;   // 0°48'

export type Confidence = 'determinate' | 'borderline' | 'indeterminate';

export interface BoundaryProximity {
  /** Degrees to the nearest boundary below and above. */
  toPrevious: number;
  toNext: number;
  /** Whichever is closer. */
  nearest: number;
  confidence: Confidence;
}

export interface AscendantConfidence extends BoundaryProximity {
  rashi: number;
  degreeInSign: number;
  /**
   * Minutes of birth-time error that would move the ascendant into the adjacent
   * sign. Derived from measured samples when available, otherwise estimated from
   * the nominal rate — the estimate is coarse because the true rate varies with
   * latitude and sign.
   */
  minutesToPreviousSign: number;
  minutesToNextSign: number;
  estimated: boolean;
  /** The sign the chart would use if the birth time were off by that much. */
  alternateRashi: number | null;
  note: string;
}

export interface MoonConfidence extends BoundaryProximity {
  nakshatra: string;
  pada: number;
  /** True when the Moon is also close to a pada boundary. */
  nearPadaBoundary: boolean;
  /** True when the Moon is close to a rashi boundary as well. */
  nearRashiBoundary: boolean;
  note: string;
}

export interface ChartConfidence {
  ascendant: AscendantConfidence;
  moon: MoonConfidence;
  /** The weakest of the two — what the chart as a whole can support. */
  overall: Confidence;
  /** Ordered warnings, most consequential first. Empty when both are determinate. */
  warnings: string[];
}

const WEAKEST: Confidence[] = ['determinate', 'borderline', 'indeterminate'];
const worse = (a: Confidence, b: Confidence) =>
  WEAKEST.indexOf(a) >= WEAKEST.indexOf(b) ? a : b;

function classify(nearest: number, band: number): Confidence {
  if (nearest <= band / 2) return 'indeterminate';
  if (nearest <= band) return 'borderline';
  return 'determinate';
}

/**
 * Ascendant boundary proximity.
 *
 * `samples` are (offsetMinutes, ascendantLongitude) pairs measured across a band
 * either side of the recorded time. Supplying them matters: the ascendant's rate
 * varies by more than a factor of two with latitude and sign, so the nominal
 * 1°-per-4-minutes estimate can be out by a lot at high latitudes — exactly where
 * a borderline chart most needs an accurate number.
 */
export function assessAscendant(
  longitude: number,
  samples?: Array<{ offsetMinutes: number; longitude: number }>,
): AscendantConfidence {
  const lon = ((longitude % 360) + 360) % 360;
  const rashi = Math.floor(lon / 30);
  const degreeInSign = lon % 30;
  const toPrevious = degreeInSign;
  const toNext = 30 - degreeInSign;
  const nearest = Math.min(toPrevious, toNext);

  // Measured: find the smallest |offset| at which the sign differs.
  let minutesToPreviousSign = Infinity;
  let minutesToNextSign = Infinity;
  let estimated = true;

  if (samples?.length) {
    estimated = false;
    const prevRashi = (rashi + 11) % 12;
    const nextRashi = (rashi + 1) % 12;
    for (const s of samples) {
      const r = Math.floor((((s.longitude % 360) + 360) % 360) / 30);
      const mins = Math.abs(s.offsetMinutes);
      if (r === prevRashi) minutesToPreviousSign = Math.min(minutesToPreviousSign, mins);
      else if (r === nextRashi) minutesToNextSign = Math.min(minutesToNextSign, mins);
    }
  }
  if (!Number.isFinite(minutesToPreviousSign)) {
    minutesToPreviousSign = Math.round(toPrevious / ASC_DEGREES_PER_MINUTE);
  }
  if (!Number.isFinite(minutesToNextSign)) {
    minutesToNextSign = Math.round(toNext / ASC_DEGREES_PER_MINUTE);
  }

  const towardsNext = minutesToNextSign <= minutesToPreviousSign;
  const minutes = Math.min(minutesToNextSign, minutesToPreviousSign);
  const confidence: Confidence =
    minutes <= ASC_INDETERMINATE_MINUTES ? 'indeterminate'
      : minutes <= ASC_BORDERLINE_MINUTES ? 'borderline' : 'determinate';
  const alternateRashi = confidence === 'determinate'
    ? null
    : towardsNext ? (rashi + 1) % 12 : (rashi + 11) % 12;

  const note = confidence === 'determinate'
    ? `Ascendant at ${degreeInSign.toFixed(2)}° of ${RASHI_ENGLISH[rashi]}, clear of both sign boundaries. House placements are determinate.`
    : `Ascendant at ${degreeInSign.toFixed(2)}° of ${RASHI_ENGLISH[rashi]}, only ${nearest.toFixed(2)}° from the ` +
      `${towardsNext ? 'next' : 'previous'} sign. A birth-time error of about ${minutes} minute${minutes === 1 ? '' : 's'} ` +
      `${towardsNext ? 'later' : 'earlier'} would make the lagna ${RASHI_ENGLISH[alternateRashi!]} instead` +
      (estimated ? ' (estimated from the nominal rate)' : '') + '. ' +
      'Every house placement, lordship and functional judgement in this chart changes if that happens, so ' +
      'read the house-based sections as conditional on the recorded time being exact to the minute.';

  return {
    rashi, degreeInSign, toPrevious, toNext, nearest, confidence,
    minutesToPreviousSign, minutesToNextSign, estimated, alternateRashi, note,
  };
}

/** Moon boundary proximity — nakshatra first, because the dasha depends on it. */
export function assessMoon(longitude: number): MoonConfidence {
  const lon = ((longitude % 360) + 360) % 360;
  const nak = getNakshatra(lon);
  const withinNak = lon % NAKSHATRA_SPAN;
  const toPrevious = withinNak;
  const toNext = NAKSHATRA_SPAN - withinNak;
  const nearest = Math.min(toPrevious, toNext);
  const confidence = classify(nearest, MOON_NAKSHATRA_BOUNDARY_DEGREES);

  const withinPada = lon % PADA_SPAN;
  const nearPadaBoundary = Math.min(withinPada, PADA_SPAN - withinPada) <= 0.25;
  const degInSign = lon % 30;
  const nearRashiBoundary = Math.min(degInSign, 30 - degInSign) <= 1.0;

  const towardsNext = toNext < toPrevious;
  const note = confidence === 'determinate'
    ? `Moon in ${nak.name} pada ${nak.pada}, clear of the nakshatra boundaries. The dasha timeline is determinate.`
    : `Moon is only ${nearest.toFixed(2)}° from the ${towardsNext ? 'next' : 'previous'} nakshatra boundary. ` +
      'The whole Vimshottari sequence is keyed to this nakshatra, so a birth time out by a couple of minutes ' +
      'would put every dasha date in this reading under a different set of lords. Treat the timeline as provisional.';

  return {
    toPrevious, toNext, nearest, confidence,
    nakshatra: nak.name, pada: nak.pada, nearPadaBoundary, nearRashiBoundary, note,
  };
}

export function assessChartConfidence(
  ascendantLongitude: number,
  moonLongitude: number,
  ascendantSamples?: Array<{ offsetMinutes: number; longitude: number }>,
): ChartConfidence {
  const ascendant = assessAscendant(ascendantLongitude, ascendantSamples);
  const moon = assessMoon(moonLongitude);

  const warnings: string[] = [];
  // The Moon leads when both are compromised: a wrong dasha sequence invalidates
  // every dated claim, whereas a wrong lagna invalidates the house layout but
  // leaves the timeline intact.
  if (moon.confidence !== 'determinate') warnings.push(moon.note);
  if (ascendant.confidence !== 'determinate') warnings.push(ascendant.note);
  if (moon.nearPadaBoundary && moon.confidence === 'determinate') {
    warnings.push(
      `Moon is close to a pada boundary within ${moon.nakshatra}. The nakshatra and the dasha sequence hold, ` +
      'but the navamsa and the pada-level readings could belong to the adjacent pada.');
  }
  if (moon.nearRashiBoundary) {
    warnings.push(
      'Moon is close to a rashi boundary, so the Moon sign itself — and every koota score computed from it — ' +
      'could belong to the adjacent sign.');
  }

  return {
    ascendant,
    moon,
    overall: worse(ascendant.confidence, moon.confidence),
    warnings,
  };
}
