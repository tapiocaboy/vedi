/**
 * Birth-data sanity checks.
 *
 * Two input defects produced silently wrong charts in reference testing, and
 * neither is detectable from the output — the chart looks completely normal, it is
 * just a chart of a different moment or a different place.
 *
 *   • **Longitude sign.** A western longitude entered positive. 157.86° E instead
 *     of 157.86° W moved a Honolulu chart's ascendant by a full sign and shifted
 *     every house with it. Planetary longitudes were unaffected, so nothing in the
 *     positions table looked wrong.
 *
 *   • **A fixed-offset timezone where a regional one was needed.** Selecting `UTC`
 *     for a British birth in July skips British Summer Time, casting the chart an
 *     hour early. At 52° N that moved the ascendant about 43° — across a sign
 *     boundary — while again leaving every planetary longitude correct.
 *
 * Both are caught here rather than in the UI, so the export and any programmatic
 * caller get them too.
 */

import type { BirthData } from '../../types/astrology';

export type ValidationSeverity = 'error' | 'warning';

export interface ValidationIssue {
  severity: ValidationSeverity;
  /** Which input to look at. */
  field: 'longitude' | 'latitude' | 'timezone' | 'date';
  message: string;
}

/**
 * Hours of disagreement between the offset a longitude implies and the offset the
 * timezone actually uses, beyond which something is worth reporting.
 *
 * Legitimate disagreement goes further than it first seems. China runs a single
 * zone across roughly 60° of longitude, so Kashgar sits about 3 hours from its
 * solar time — and nearly 4 during the DST years of 1986–91. Spain on Berlin time
 * and far-western Alaska are stretched similarly. Five hours clears all of them.
 */
const OFFSET_DISAGREEMENT_LIMIT = 5;

/**
 * A sign error is separable from odd geography, and much more confidently.
 *
 * Flipping the longitude's sign changes the implied offset by twice the longitude
 * in hours, so when the flip turns a large disagreement into a small one, that is
 * a specific diagnosis rather than a guess: Honolulu entered east reads 20.5 hours
 * out and 0.5 hours out flipped. Kashgar, by contrast, gets *worse* when flipped,
 * which is what distinguishes a real place from a typo.
 */
const SIGN_ERROR_RESIDUAL_LIMIT = 2;

/** Timezones that carry no daylight-saving history and no regional rules. */
const FIXED_OFFSET_ZONE = /^(UTC|GMT|Etc\/(GMT|UTC)([+-]\d+)?|[+-]\d{2}:?\d{2})$/i;

/** Actual UTC offset in hours for a zone at a given instant, from the tz database. */
export function offsetHoursAt(timezone: string, at: Date): number | null {
  try {
    const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: timezone, timeZoneName: 'longOffset' });
    const part = fmt.formatToParts(at).find(p => p.type === 'timeZoneName')?.value ?? '';
    // "GMT+05:30" | "GMT-10" | "GMT"
    const m = part.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
    if (!m) return part === 'GMT' ? 0 : null;
    const sign = m[1] === '-' ? -1 : 1;
    return sign * (parseInt(m[2], 10) + (m[3] ? parseInt(m[3], 10) / 60 : 0));
  } catch {
    return null;
  }
}

/**
 * Check birth data for the input faults that produce a plausible-looking but
 * wrong chart. Returns an empty array when nothing is suspect.
 */
export function validateBirthData(bd: BirthData): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!Number.isFinite(bd.latitude) || Math.abs(bd.latitude) > 90) {
    issues.push({ severity: 'error', field: 'latitude', message: 'Latitude must be between −90° and 90°.' });
  }
  if (!Number.isFinite(bd.longitude) || Math.abs(bd.longitude) > 180) {
    issues.push({ severity: 'error', field: 'longitude', message: 'Longitude must be between −180° and 180°.' });
  }

  const birthInstant = new Date(bd.date);
  const validDate = !Number.isNaN(birthInstant.getTime());
  if (!validDate) {
    issues.push({ severity: 'error', field: 'date', message: 'Birth date and time could not be parsed.' });
  }

  // ── Longitude against the timezone's real offset ──
  if (validDate && Number.isFinite(bd.longitude)) {
    const actual = offsetHoursAt(bd.timezone, birthInstant);
    if (actual != null) {
      const impliedBySun = bd.longitude / 15;
      const disagreement = Math.abs(impliedBySun - actual);
      const flipped = Math.abs(-bd.longitude / 15 - actual);
      const preamble =
        `Longitude ${bd.longitude.toFixed(4)}° implies a solar-time offset near ` +
        `UTC${impliedBySun >= 0 ? '+' : ''}${impliedBySun.toFixed(1)}, but ${bd.timezone} was ` +
        `UTC${actual >= 0 ? '+' : ''}${actual} at this date — a disagreement of ${disagreement.toFixed(1)} hours.`;

      if (disagreement > OFFSET_DISAGREEMENT_LIMIT && flipped <= SIGN_ERROR_RESIDUAL_LIMIT) {
        // High confidence: flipping the sign resolves it almost exactly.
        issues.push({
          severity: 'error',
          field: 'longitude',
          message:
            `${preamble} Entering ${(-bd.longitude).toFixed(4)}° instead resolves it to ` +
            `${flipped.toFixed(1)} hours, so this is a sign error — western longitudes are negative. ` +
            'Planetary positions are unaffected by this, but the ascendant and every house placement are wrong.',
        });
      } else if (disagreement > OFFSET_DISAGREEMENT_LIMIT) {
        // Something is off, but flipping does not explain it, so this stays a
        // warning: blocking a legitimate chart is worse than flagging it.
        issues.push({
          severity: 'warning',
          field: 'longitude',
          message: `${preamble} Check that the coordinates and the timezone belong to the same place.`,
        });
      }
    }
  }

  // ── Fixed-offset zone where a regional zone is needed ──
  if (FIXED_OFFSET_ZONE.test(bd.timezone.trim())) {
    issues.push({
      severity: 'warning',
      field: 'timezone',
      message:
        `${bd.timezone} is a fixed offset, so no daylight-saving or historical rule is applied. ` +
        'If the birth place observed summer time on that date — most of Europe and North America, and ' +
        'India before 1942 — the chart is being cast an hour or more away from the real moment, which moves ' +
        'the ascendant far enough to change the rising sign. Select the birth city’s regional timezone ' +
        '(for example Europe/London rather than UTC) so the offset is resolved for the actual date.',
    });
  }

  return issues;
}

/** True when nothing blocks casting the chart. Warnings do not block. */
export function canCastChart(issues: ValidationIssue[]): boolean {
  return !issues.some(i => i.severity === 'error');
}
