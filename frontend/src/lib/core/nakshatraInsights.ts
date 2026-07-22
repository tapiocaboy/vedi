/**
 * Nakshatra insight content — turns a Moon nakshatra into a set of clickable,
 * plain-language items (personality, ruling planet, temperament, pada, deity,
 * symbol), each with a detailed explanation a non-astrologer can follow.
 */

import type { NakshatraInfo } from '../../types/astrology';
import type { TranslationKey } from '../../i18n/translations';
import { type Lang, pick, pickList } from './i18n';
import { PROFILES, LORD_THEME, GANA_MEANING, PADA_MEANING, DEITY_THEME, NAK_FRAMES } from './text/nakshatraText';

export interface NakshatraItem {
  key: 'overview' | 'lord' | 'gana' | 'pada' | 'deity' | 'symbol';
  /** i18n key for the tile label. */
  labelKey: TranslationKey;
  /** Short value shown on the collapsed tile. */
  value: string;
  /** Detailed explanation revealed on click. */
  body: string;
  /** Optional bullet predictions. */
  bullets?: string[];
}

export function getNakshatraItems(nak: NakshatraInfo, lang: Lang = 'en'): NakshatraItem[] {
  const profile = PROFILES[nak.index] ?? PROFILES[0];
  const items: NakshatraItem[] = [];

  items.push({
    key: 'overview',
    labelKey: 'nakshatra.personality',
    value: nak.name,
    body: NAK_FRAMES.overviewBody(pick(profile.personality, lang), pick(profile.career, lang), lang),
    bullets: pickList(profile.keynotes, lang),
  });

  items.push({
    key: 'lord',
    labelKey: 'nakshatra.rulingPlanet',
    value: nak.lord,
    body: LORD_THEME[nak.lord] ? pick(LORD_THEME[nak.lord], lang) : NAK_FRAMES.lordFallback(nak.lord, lang),
  });

  if (nak.gana) {
    items.push({
      key: 'gana',
      labelKey: 'nakshatra.nature',
      value: nak.gana,
      body: GANA_MEANING[nak.gana] ? pick(GANA_MEANING[nak.gana], lang) : NAK_FRAMES.ganaFallback(nak.gana, lang),
    });
  }

  items.push({
    key: 'pada',
    labelKey: 'nakshatra.padaTitle',
    value: `${nak.pada} / 4`,
    body: PADA_MEANING[nak.pada] ? pick(PADA_MEANING[nak.pada], lang) : NAK_FRAMES.padaFallback(lang),
  });

  if (nak.deity) {
    const theme = DEITY_THEME[nak.deity] ? pick(DEITY_THEME[nak.deity], lang) : pick(NAK_FRAMES.deityFallback, lang);
    items.push({
      key: 'deity',
      labelKey: 'nakshatra.deity',
      value: nak.deity,
      body: NAK_FRAMES.deityBody(nak.deity, theme, lang),
    });
  }

  if (nak.symbol) {
    items.push({
      key: 'symbol',
      labelKey: 'nakshatra.symbol',
      value: nak.symbol,
      body: pick(profile.symbolMeaning, lang),
    });
  }

  return items;
}
