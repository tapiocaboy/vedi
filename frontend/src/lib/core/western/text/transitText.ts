import type { Lang } from '../../i18n';
import { pick } from '../../i18n';
import { westernPlanetName } from './planetText';
import { WESTERN_HOUSE_DISPLAY } from './houseText';
import { composeAspectSentence } from './aspectText';
import type { AspectHit } from '../aspects';

/** "Transiting Saturn is moving through your 10th house — career, reputation, and public standing." */
export function composeTransitHouseSentence(planet: string, house: number, lang: Lang): string {
  const theme = pick(WESTERN_HOUSE_DISPLAY[house].theme, lang);
  const name = westernPlanetName(planet, lang);
  return lang === 'si'
    ? `සංක්‍රාන්ති ${name} දැනට ඔබේ ${house} වන භාවය හරහා ගමන් කරයි — ${theme}.`
    : `Transiting ${name} is moving through your ${house}${ordinal(house)} house — ${theme}.`;
}

/** "Transiting Saturn squares your natal Moon: ..." — reuses the same aspect prose as the natal grid. */
export function composeTransitAspectSentence(hit: AspectHit, lang: Lang): string {
  const base = composeAspectSentence(hit.bodyA, hit.bodyB, hit.type, lang);
  const applying = hit.applying
    ? pick({ en: 'Applying — this is still building toward exact.', si: 'ළඟාවෙමින් — මෙය තවමත් නිවැරදි ලක්ෂ්‍යය දෙසට ගොඩනැගෙමින් පවතී.' }, lang)
    : pick({ en: 'Separating — this is already past its peak.', si: 'දුරස් වෙමින් — මෙය දැනටමත් එහි උච්චතම ලක්ෂ්‍යය පසුකර ඇත.' }, lang);
  return lang === 'si'
    ? `සංක්‍රාන්ති ${base} ${applying}`
    : `Transiting ${base} ${applying}`;
}

function ordinal(n: number): string {
  const v = n % 100;
  if (v >= 11 && v <= 13) return 'th';
  return ['th', 'st', 'nd', 'rd'][n % 10] ?? 'th';
}
