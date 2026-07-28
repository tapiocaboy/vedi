/**
 * Bilingual prose for the cross-varga (Vimsopaka Bala) layer.
 *
 * Same convention as the other text modules: functions rather than templates, so
 * Sinhala can reorder the clauses. Varga codes (D1, D9, D30…) are left as-is in
 * both languages — that is how they are written in Sinhala astrological
 * material too.
 */

import type { Lang } from '../i18n';

const GRADE_WORD: Record<string, Record<Lang, string>> = {
  exceptional: { en: 'exceptional', si: 'අසාමාන්‍ය' },
  strong:      { en: 'strong',      si: 'ප්‍රබල' },
  moderate:    { en: 'moderate',    si: 'මධ්‍යස්ථ' },
  weak:        { en: 'weak',        si: 'දුර්වල' },
};

export const VS_FRAMES = {
  gradeWord: (grade: string, lang: Lang) => GRADE_WORD[grade][lang],

  /** One planet's cross-varga standing. */
  planet: (a: {
    planet: string; vimsopaka: string; grade: string;
    dignifiedIn: string[]; isVargottama: boolean; lang: Lang;
  }): string => {
    const g = VS_FRAMES.gradeWord(a.grade, a.lang);
    const list = a.dignifiedIn.join(', ');
    if (a.lang === 'si') {
      return [
        `${a.planet}: විංශෝපක බලය ${a.vimsopaka}/20 (${g}).`,
        a.dignifiedIn.length ? ` ${list} වර්ගවල ස්වක්ෂේත්‍ර හෝ උච්චය.` : '',
        a.isVargottama ? ' වර්ගෝත්තමයි — D1 හා D9 එකම රාශියේ, එබැවින් මෙම පිහිටීම ස්ථිරය.' : '',
      ].join('');
    }
    return [
      `${a.planet}: Vimsopaka Bala ${a.vimsopaka}/20 (${g}).`,
      a.dignifiedIn.length ? ` Own sign or exalted in ${list}.` : '',
      a.isVargottama ? ' Vargottama — same sign in D1 and D9, so this placement is locked in.' : '',
    ].join('');
  },

  /** The chart's structural pillar. */
  pillar: (a: { planet: string; vargas: string[]; vimsopaka: string; lang: Lang }): string => {
    const list = a.vargas.join(', ');
    return a.lang === 'si'
      ? `${a.planet} මෙම කේන්දරයේ ව්‍යුහාත්මක කුලුනයි: ${list} යන වර්ගවල ස්වක්ෂේත්‍ර හෝ උච්ච වී, විංශෝපක බලය ${a.vimsopaka}/20. රාශි කේන්දරයේ එය කැපී නොපෙනුණත්, ජීවිතයේ බර උසුලන්නේ එයයි — ක්‍රමයෙන් ගොඩනැගීම, ඉවසීම හා දෙවන වර උත්සාහයෙන් ලැබෙන ඵල.`
      : `${a.planet} is this chart's structural pillar: own sign or exalted across ${list}, for a Vimsopaka Bala of ${a.vimsopaka}/20. It may look unremarkable in the rashi chart, but it is what carries the weight — slow consolidation, endurance, and results that arrive on the second attempt rather than the first.`;
  },

  /** The navamsa lagna lord holding up the navamsa. */
  navamsaAnchor: (a: {
    planet: string; navamsaLagna: string; exalted: boolean; inLagna: boolean; lang: Lang;
  }): string => {
    if (a.lang === 'si') {
      return `නවාංශක ලග්නය ${a.navamsaLagna} වන අතර එහි අධිපති ${a.planet} නවාංශකයේ ${a.exalted ? 'උච්ච' : 'ස්වක්ෂේත්‍ර'} වී ඇත${a.inLagna ? ' — එයද නවාංශක ලග්නයේම' : ''}. සමස්ත වර්ග ව්‍යුහය ${a.planet} වෙතට යළි යොමු වේ.`;
    }
    return `The navamsa lagna is ${a.navamsaLagna} and its lord ${a.planet} is ${a.exalted ? 'exalted' : 'in its own sign'} in the navamsa${a.inLagna ? ' — and in the navamsa lagna itself' : ''}. The whole varga structure resolves back to ${a.planet}.`;
  },

  vargottamaPresent: (planets: string, plural: boolean, lang: Lang): string => lang === 'si'
    ? `${planets} වර්ගෝත්තමයි — D1 හා D9 එකම රාශියේ. ${plural ? 'මෙම පිහිටීම්' : 'මෙම පිහිටීම'} ජීවිතය පුරා ස්ථිරව පවතී.`
    : `${planets} ${plural ? 'are' : 'is'} vargottama — the same sign in D1 and D9. ${plural ? 'These placements hold' : 'This placement holds'} firm across a lifetime.`,

  vargottamaAbsent: (lang: Lang): string => lang === 'si'
    ? 'කිසිදු ග්‍රහයෙක් වර්ගෝත්තම නොවේ — කිසිවෙක් D1 රාශියම D9 හි නොදරයි. මෙය සෑම පිහිටීමකම ස්ථිර බව අඩු කරයි: ජීවිතය නැවත නැවත ප්‍රතිසංවිධානය වන අතර, කිසිදු එක් තත්ත්වයක් අවසාන ලෙස නොපවතී.'
    : 'No planet is vargottama — none holds its D1 sign in D9. That reduces the lock-in strength of every placement in the chart, and is consistent with a life that keeps reconfiguring rather than settling into one fixed shape.',

  weakest: (planet: string, vimsopaka: string, lang: Lang): string => lang === 'si'
    ? `වර්ග හරහා දුර්වලම ග්‍රහයා ${planet} ය (${vimsopaka}/20) — රාශි කේන්දරයේ තත්ත්වය කුමක් වුවත්, එය පාලනය කරන කරුණු අඩුම සහායක් ලබයි.`
    : `${planet} is the weakest across the vargas (${vimsopaka}/20) — whatever its rashi-chart standing, what it governs gets the least support in depth.`,
};
