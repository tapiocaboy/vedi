/**
 * Bilingual sentence frames for the dasha prediction engine.
 *
 * Each frame is a function of its interpolated parts rather than a `{}`
 * template string, because Sinhala often needs the pieces in a different order
 * (and different postpositions) than English. Keeping them as functions means
 * the grammar lives with the language instead of at the call site.
 */

import type { Lang } from '../i18n';

type Frame0 = Record<Lang, () => string>;
type Frame1 = Record<Lang, (a: string) => string>;
type Frame2 = Record<Lang, (a: string, b: string) => string>;

// ─── Enumerated-term detail lines ──────────────────────────────────────────

export const F_BODY_AREAS: Frame1 = {
  en: list => `Primary body areas to monitor: ${list}`,
  si: list => `ප්‍රධාන වශයෙන් අවධානය යොමු කළ යුතු ශරීර කොටස්: ${list}`,
};

export const F_HEALTH_CONCERNS: Frame1 = {
  en: list => `Health concerns to watch for: ${list}`,
  si: list => `සැලකිලිමත් විය යුතු සෞඛ්‍ය ගැටලු: ${list}`,
};

export const F_CAREER_AREAS: Frame1 = {
  en: list => `Favorable career areas: ${list}`,
  si: list => `හිතකර වෘත්තීය ක්ෂේත්‍ර: ${list}`,
};

export const F_KEY_RELATIONSHIPS: Frame1 = {
  en: list => `Key relationships highlighted: ${list}`,
  si: list => `ප්‍රමුඛ වන සම්බන්ධතා: ${list}`,
};

// ─── Antardasha (sub-period) lines ─────────────────────────────────────────

/** Named pair effect: "Venus sub-period: <effect text>". */
export const F_SUB_PERIOD: Frame2 = {
  en: (ad, text) => `${ad} sub-period: ${text}`,
  si: (ad, text) => `${ad} අන්තර් දශාව: ${text}`,
};

export const F_AD_HEALTH_FRIEND: Frame1 = {
  en: ad => `${ad} antardasha brings supportive healing energy; recovery improves`,
  si: ad => `${ad} අන්තර් දශාව සුවවීමට උපකාරී ශක්තියක් ගෙන එයි; සුවවීමේ වේගය වැඩි වේ`,
};

export const F_AD_HEALTH_ENEMY: Frame2 = {
  en: (ad, areas) => `${ad} antardasha may amplify health challenges; additional areas: ${areas}`,
  si: (ad, areas) => `${ad} අන්තර් දශාව සෞඛ්‍ය අභියෝග තීව්‍ර කළ හැක; අමතරව අවධානය යොමු කළ යුතු: ${areas}`,
};

export const F_AD_HEALTH_COMBINED: Frame1 = {
  en: list => `Combined risks: ${list}`,
  si: list => `එක්ව ඇති විය හැකි අවදානම්: ${list}`,
};

export const F_AD_HEALTH_NEUTRAL: Frame2 = {
  en: (ad, areas) => `${ad} antardasha adds ${areas} to health focus`,
  si: (ad, areas) => `${ad} අන්තර් දශාව නිසා ${areas} ද සෞඛ්‍ය අවධානයට එකතු වේ`,
};

export const F_AD_WEALTH_FRIEND: Frame1 = {
  en: ad => `${ad} sub-period enhances financial opportunities and income streams`,
  si: ad => `${ad} අන්තර් දශාව මූල්‍ය අවස්ථා හා ආදායම් මාර්ග වර්ධනය කරයි`,
};

export const F_AD_WEALTH_ENEMY: Frame1 = {
  en: ad => `${ad} sub-period may bring financial challenges or unexpected expenses`,
  si: ad => `${ad} අන්තර් දශාව මූල්‍ය අභියෝග හෝ අනපේක්ෂිත වියදම් ගෙන ආ හැක`,
};

export const F_AD_CAREER_FRIEND: Frame1 = {
  en: ad => `${ad} sub-period accelerates career growth and professional recognition`,
  si: ad => `${ad} අන්තර් දශාව වෘත්තීය දියුණුව හා වෘත්තීය පිළිගැනීම වේගවත් කරයි`,
};

export const F_AD_CAREER_ENEMY: Frame1 = {
  en: ad => `${ad} sub-period may bring workplace friction and professional challenges`,
  si: ad => `${ad} අන්තර් දශාව සේවා ස්ථානයේ ගැටුම් හා වෘත්තීය අභියෝග ගෙන ආ හැක`,
};

export const F_AD_REL_FRIEND: Frame1 = {
  en: ad => `${ad} sub-period enhances relationship harmony and deepens emotional bonds`,
  si: ad => `${ad} අන්තර් දශාව සම්බන්ධතාවල සමගිය වර්ධනය කර හැඟීම්බර බැඳීම් ගැඹුරු කරයි`,
};

export const F_AD_REL_ENEMY: Frame1 = {
  en: ad => `${ad} sub-period may bring relationship friction, conflicts, or misunderstandings`,
  si: ad => `${ad} අන්තර් දශාව සම්බන්ධතාවල ඝට්ටන, ගැටුම් හෝ වැරදි වැටහීම් ගෙන ආ හැක`,
};

export const F_AD_GENERAL_FRIEND: Frame1 = {
  en: ad => `${ad} sub-period amplifies all positive effects of this Mahadasha`,
  si: ad => `${ad} අන්තර් දශාව මෙම මහා දශාවේ සියලු හිතකර ප්‍රතිඵල තීව්‍ර කරයි`,
};

export const F_AD_GENERAL_ENEMY: Frame1 = {
  en: ad => `${ad} sub-period requires more careful navigation of life situations`,
  si: ad => `${ad} අන්තර් දශාව තුළ ජීවිතයේ තත්ත්වයන් වඩාත් ප්‍රවේශමෙන් හැසිරවිය යුතුය`,
};

// ─── Pratyantardasha lines ─────────────────────────────────────────────────

export const F_PD_HEALTH_ENEMY: Frame1 = {
  en: pd => `Pratyantardasha of ${pd} creates short-term health fluctuation — extra care this sub-period`,
  si: pd => `${pd} ප්‍රත්‍යන්තර් දශාව කෙටි කාලීන සෞඛ්‍ය උච්චාවචනයක් ඇති කරයි — මෙම උප කාලය තුළ අමතර සැලකිල්ලක් දක්වන්න`,
};

export const F_PD_HEALTH_FRIEND: Frame1 = {
  en: pd => `${pd} pratyantardasha brings a healing window during this sub-period`,
  si: pd => `${pd} ප්‍රත්‍යන්තර් දශාව මෙම උප කාලය තුළ සුවවීමට හිතකර කවුළුවක් විවර කරයි`,
};

export const F_PD_CAREER_ENEMY: Frame1 = {
  en: pd => `${pd} pratyantardasha creates a short challenging phase — navigate carefully`,
  si: pd => `${pd} ප්‍රත්‍යන්තර් දශාව කෙටි අභියෝගාත්මක අදියරක් ඇති කරයි — ප්‍රවේශමෙන් හැසිරෙන්න`,
};

export const F_PD_CAREER_FRIEND: Frame1 = {
  en: pd => `${pd} pratyantardasha provides a short favorable window for career moves`,
  si: pd => `${pd} ප්‍රත්‍යන්තර් දශාව වෘත්තීය තීරණ සඳහා කෙටි හිතකර කවුළුවක් සපයයි`,
};

export const F_PD_REL_ENEMY: Frame1 = {
  en: pd => `${pd} pratyantardasha creates a short but intense relationship challenge — proceed with awareness`,
  si: pd => `${pd} ප්‍රත්‍යන්තර් දශාව කෙටි නමුත් තීව්‍ර සම්බන්ධතා අභියෝගයක් ඇති කරයි — සිහිකල්පනාවෙන් ඉදිරියට යන්න`,
};

export const F_PD_REL_FRIEND: Frame1 = {
  en: pd => `${pd} pratyantardasha brings a brief but deeply harmonious relationship window`,
  si: pd => `${pd} ප්‍රත්‍යන්තර් දශාව කෙටි නමුත් ගැඹුරින් සමගිකාමී සම්බන්ධතා කාලයක් ගෙන දෙයි`,
};

export const F_SD_GENERAL_FRIEND: Frame1 = {
  en: sd => `${sd} sookshma period brings a brief but highly favorable window of opportunity`,
  si: sd => `${sd} සූක්ෂ්ම දශාව කෙටි නමුත් ඉතා හිතකර අවස්ථා කවුළුවක් ගෙන දෙයි`,
};

// ─── Area summaries ────────────────────────────────────────────────────────

export const F_HEALTH_SUMMARY: Record<'good' | 'balanced' | 'priority', Frame1> = {
  good: {
    en: md => `Generally good health during ${md} period. Preventive care ensures sustained vitality.`,
    si: md => `${md} දශාව තුළ සෞඛ්‍යය සාමාන්‍යයෙන් හොඳය. වැළැක්වීමේ සත්කාර මගින් ජීවශක්තිය දිගටම පවත්වා ගත හැක.`,
  },
  balanced: {
    en: md => `Health requires balanced attention during ${md} period. Maintain regular health routines.`,
    si: md => `${md} දශාව තුළ සෞඛ්‍යයට සමබර අවධානයක් අවශ්‍ය වේ. නිතිපතා සෞඛ්‍ය චර්යාවක් පවත්වා ගන්න.`,
  },
  priority: {
    en: md => `Health needs priority focus during ${md} period. Be proactive and follow remedies.`,
    si: md => `${md} දශාව තුළ සෞඛ්‍යයට ප්‍රමුඛ අවධානයක් අවශ්‍යය. කල් තියා ක්‍රියා කර ප්‍රතිකර්ම අනුගමනය කරන්න.`,
  },
};

export const F_WEALTH_SUMMARY: Record<'strong' | 'moderate' | 'careful', Frame1> = {
  strong: {
    en: md => `${md} dasha brings strong financial growth, wealth accumulation, and prosperity.`,
    si: md => `${md} දශාව ශක්තිමත් මූල්‍ය වර්ධනයක්, ධන රැස්කිරීමක් හා සමෘද්ධියක් ගෙන දෙයි.`,
  },
  moderate: {
    en: md => `${md} dasha brings moderate financial stability. Consistent effort ensures steady progress.`,
    si: md => `${md} දශාව මධ්‍යස්ථ මූල්‍ය ස්ථාවරත්වයක් ගෙන දෙයි. නොකඩවා දරන උත්සාහයෙන් ස්ථාවර ප්‍රගතියක් ලැබේ.`,
  },
  careful: {
    en: md => `${md} dasha requires careful financial management and patience for wealth building.`,
    si: md => `${md} දශාව තුළ ප්‍රවේශම් සහගත මුදල් කළමනාකරණයක් හා ධනය ගොඩනැගීමට ඉවසීමක් අවශ්‍ය වේ.`,
  },
};

export const F_CAREER_SUMMARY: Record<'strong' | 'steady' | 'patient', Frame1> = {
  strong: {
    en: md => `${md} dasha strongly favors career growth, professional recognition, and success.`,
    si: md => `${md} දශාව වෘත්තීය දියුණුවට, වෘත්තීය පිළිගැනීමට හා සාර්ථකත්වයට බෙහෙවින් හිතකරය.`,
  },
  steady: {
    en: md => `${md} dasha brings steady career progress with focused and consistent effort.`,
    si: md => `${md} දශාව අවධානයෙන් හා නොකඩවා දරන උත්සාහයෙන් ස්ථාවර වෘත්තීය ප්‍රගතියක් ගෙන දෙයි.`,
  },
  patient: {
    en: md => `${md} dasha requires patience and discipline in career; long-term perspective is key.`,
    si: md => `${md} දශාව තුළ වෘත්තියේදී ඉවසීම හා විනය අවශ්‍ය වේ; දිගු කාලීන දැක්මක් තිබීම ප්‍රධානය.`,
  },
};

export const F_REL_SUMMARY: Record<'harmony' | 'stable' | 'challenging', Frame1> = {
  harmony: {
    en: md => `${md} dasha brings harmony, love, and deeply meaningful positive relationships.`,
    si: md => `${md} දශාව සමගිය, ආදරය හා ගැඹුරින් අර්ථවත් සම්බන්ධතා ගෙන දෙයි.`,
  },
  stable: {
    en: md => `${md} dasha brings stable relationships with specific dynamics to be mindfully navigated.`,
    si: md => `${md} දශාව ස්ථාවර සම්බන්ධතා ගෙන දෙන අතර ඇතැම් තත්ත්වයන් සිහිකල්පනාවෙන් හැසිරවිය යුතුය.`,
  },
  challenging: {
    en: md => `${md} dasha may bring relationship challenges that ultimately teach profound life lessons.`,
    si: md => `${md} දශාව සම්බන්ධතා පිළිබඳ අභියෝග ගෙන ආ හැකි අතර අවසානයේ ඒවා ගැඹුරු ජීවිත පාඩම් උගන්වයි.`,
  },
};

export const F_GENERAL_SUMMARY: Record<'benefic' | 'malefic' | 'neutral', Frame1> = {
  benefic: {
    en: md => `${md} period brings growth, meaningful opportunities, and genuinely positive life experiences.`,
    si: md => `${md} දශාව වර්ධනය, අර්ථවත් අවස්ථා හා සැබැවින්ම හිතකර ජීවන අත්දැකීම් ගෙන දෙයි.`,
  },
  malefic: {
    en: md => `${md} period brings transformative challenges that ultimately catalyze profound personal growth.`,
    si: md => `${md} දශාව පරිවර්තනීය අභියෝග ගෙන එන අතර අවසානයේ ඒවා ගැඹුරු පෞද්ගලික වර්ධනයකට මඟ පාදයි.`,
  },
  neutral: {
    en: md => `${md} period brings unique and highly specific life experiences and important karmic lessons.`,
    si: md => `${md} දශාව සුවිශේෂී ජීවන අත්දැකීම් හා වැදගත් කර්ම පාඩම් ගෙන දෙයි.`,
  },
};

// ─── Overall theme ─────────────────────────────────────────────────────────

export const F_THEME_BASE: Record<'benefic' | 'malefic' | 'neutral', Frame1> = {
  benefic: {
    en: md => `${md} brings growth, expansion, and positive life experiences`,
    si: md => `${md} වර්ධනය, ව්‍යාප්තිය හා හිතකර ජීවන අත්දැකීම් ගෙන දෙයි`,
  },
  malefic: {
    en: md => `${md} brings transformative challenges requiring patience and inner strength`,
    si: md => `${md} ඉවසීම හා අභ්‍යන්තර ශක්තිය අවශ්‍ය වන පරිවර්තනීය අභියෝග ගෙන එයි`,
  },
  neutral: {
    en: md => `${md} brings unique karmic experiences and important life lessons`,
    si: md => `${md} සුවිශේෂී කර්ම අත්දැකීම් හා වැදගත් ජීවිත පාඩම් ගෙන දෙයි`,
  },
};

export const F_THEME_AD: Record<'friend' | 'enemy' | 'neutral', Frame1> = {
  friend: {
    en: ad => `, strongly enhanced by the supportive ${ad} sub-period`,
    si: ad => `; සහායක ${ad} අන්තර් දශාව නිසා එය තවත් ශක්තිමත් වේ`,
  },
  enemy: {
    en: ad => `, with significant challenges during the ${ad} sub-period`,
    si: ad => `; ${ad} අන්තර් දශාව තුළ සැලකිය යුතු අභියෝග ද පවතී`,
  },
  neutral: {
    en: ad => `, with ${ad} adding its specific flavor to this period`,
    si: ad => `; ${ad} මෙම කාලයට එහිම සුවිශේෂී ලක්ෂණය එක් කරයි`,
  },
};

export const F_THEME_PD: Frame1 = {
  en: pd => ` — currently in ${pd} Pratyantardasha`,
  si: pd => ` — දැනට ${pd} ප්‍රත්‍යන්තර් දශාව ගත වේ`,
};

export const F_THEME_SD: Frame1 = {
  en: sd => ` (${sd} Sookshma Dasha)`,
  si: sd => ` (${sd} සූක්ෂ්ම දශාව)`,
};

export const F_THEME_BINDUS: Record<Lang, (md: string, bindus: number, label: string) => string> = {
  en: (md, bindus, label) => `. ${md}'s Ashtakavarga in its own rashi: ${bindus}/8 (${label})`,
  si: (md, bindus, label) => `. ${md}ගේ අෂ්ටකවර්ග බින්දු එහිම රාශියේ: ${bindus}/8 (${label})`,
};

export const F_THEME_EXALTED: Frame1 = {
  en: md => `. ${md} is exalted in your natal chart — this period operates near its highest potential`,
  si: md => `. ${md} ඔබේ ජන්ම කේන්දරයේ උච්ච වී ඇත — මෙම දශාව එහි ඉහළම හැකියාවෙන් ක්‍රියාත්මක වේ`,
};

export const F_THEME_NEECHA_BHANGA: Frame1 = {
  en: md => `. ${md} is debilitated but cancelled (Neecha Bhanga) — struggle early, exceptional strength later`,
  si: md => `. ${md} නීච වුවද එය භංග වී ඇත (නීච භංග) — මුලදී වෙහෙසක් ද, පසුව අසාමාන්‍ය ශක්තියක් ද ලැබේ`,
};

export const F_THEME_DEBILITATED: Frame1 = {
  en: md => `. ${md} is debilitated natally — remedies and patience are essential this period`,
  si: md => `. ${md} ජන්ම කේන්දරයේ නීච වී ඇත — මෙම දශාවේදී ප්‍රතිකර්ම හා ඉවසීම අත්‍යවශ්‍යය`,
};

export const F_THEME_YOGAKARAKA: Frame1 = {
  en: md => `. ${md} is your yogakaraka — one of the most productive periods of your life`,
  si: md => `. ${md} ඔබේ යෝගකාරකයාය — මෙය ඔබේ ජීවිතයේ ඵලදායීම කාලවලින් එකකි`,
};

// ─── Chart-specific annotations ────────────────────────────────────────────

export const F_HOUSE_ANNOTATION: Record<
  Lang,
  (planet: string, house: string, theme: string, quality: string, emphasis: string) => string
> = {
  en: (planet, house, theme, quality, emphasis) =>
    `${planet} natally occupies your ${house} (${theme}). ${quality} Period emphasis: ${emphasis}.`,
  si: (planet, house, theme, quality, emphasis) =>
    `${planet} ඔබේ ජන්ම කේන්දරයේ ${house} (${theme}) සිටී. ${quality} මෙම දශාවේ අවධානය: ${emphasis}.`,
};

export const F_LORDSHIP_ANNOTATION: Record<Lang, (planet: string, houses: string, multiple: boolean) => string> = {
  en: (planet, houses, multiple) =>
    `${planet} rules your ${houses} — this period directly activates ${multiple ? 'those life areas' : 'that life area'}.`,
  si: (planet, houses, multiple) =>
    `${planet} ඔබේ ${houses} අධිපතියාය — මෙම දශාව ${multiple ? 'එම ජීවන ක්ෂේත්‍ර' : 'එම ජීවන ක්ෂේත්‍රය'} කෙලින්ම සක්‍රිය කරයි.`,
};

/** "10th house (career, status…)" — one entry of the lordship list. */
export const F_LORDED_HOUSE: Frame2 = {
  en: (house, theme) => `${house} (${theme})`,
  si: (house, theme) => `${house} (${theme})`,
};

/** Prefix applied to the antardasha lord's house annotation. */
export const F_SUB_PERIOD_PREFIX: Frame1 = {
  en: note => `Sub-period ${note.charAt(0).toLowerCase()}${note.slice(1)}`,
  si: note => `අන්තර් දශාව — ${note}`,
};

export const F_SUB_PERIOD_LORD: Frame1 = {
  en: note => `Sub-period lord: ${note}`,
  si: note => `අන්තර් දශා අධිපතියා: ${note}`,
};

// ─── Discrete labels ───────────────────────────────────────────────────────

export const INTENSITY_LABEL: Record<string, Record<Lang, string>> = {
  'very strong':      { en: 'very strong',      si: 'ඉතා ප්‍රබලයි' },
  strong:             { en: 'strong',           si: 'ප්‍රබලයි' },
  moderate:           { en: 'moderate',         si: 'මධ්‍යස්ථයි' },
  challenging:        { en: 'challenging',      si: 'අභියෝගාත්මකයි' },
  'very challenging': { en: 'very challenging', si: 'ඉතා අභියෝගාත්මකයි' },
};

/** Ashtakavarga bindu strength labels (from `bindusToLabel`). */
export const BINDU_LABEL: Record<string, Record<Lang, string>> = {
  weak:            { en: 'weak',            si: 'දුර්වලයි' },
  'below average': { en: 'below average',   si: 'සාමාන්‍යයට වඩා අඩුයි' },
  average:         { en: 'average',         si: 'සාමාන්‍යයි' },
  good:            { en: 'good',            si: 'හොඳයි' },
  strong:          { en: 'strong',          si: 'ප්‍රබලයි' },
};

export function intensityLabel(key: string, lang: Lang): string {
  return INTENSITY_LABEL[key]?.[lang] ?? key;
}

export function binduLabel(key: string, lang: Lang): string {
  return BINDU_LABEL[key]?.[lang] ?? key;
}

/** Bonus lines are prefixed with a marker in both languages. */
export const BONUS_MARK = '✦ ';

export type { Frame0, Frame1, Frame2 };
