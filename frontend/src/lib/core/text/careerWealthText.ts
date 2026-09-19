/**
 * Bilingual sentence frames for the career / wealth layer (careerWealth.ts).
 *
 * Two kinds of statement live here:
 *
 *   • Signature — what the birth chart itself says about vocation and income
 *     channels (the 10th, the 2nd/11th, the Indu Lagna). Standing facts.
 *   • Activation — why *this* running dasha lord bears on career or money:
 *     it occupies or aspects the relevant house, it fructifies a yoga it forms,
 *     it is the Amatyakaraka, it is well or badly placed in the dasamsa.
 *
 * Same convention as the other frame files: functions, not templates, so the
 * Sinhala can reorder the parts.
 */

import type { TableLang, BiList } from '../i18n';

type F1 = Record<TableLang, (a: string) => string>;
type F2 = Record<TableLang, (a: string, b: string) => string>;
type F3 = Record<TableLang, (a: string, b: string, c: string) => string>;

// ─── Career signature ──────────────────────────────────────────────────────

/** "Career signature: your 10th house is shaped by Mars and Saturn — engineering, real estate…" */
export const F_CAREER_SIGNATURE: F3 = {
  en: (source, planets, fields) =>
    `Career signature of your chart: ${source} is shaped by ${planets}, which points the profession toward ${fields}. This is the chart's own vocation, and it is a better guide than what any single period favours.`,
  si: (source, planets, fields) =>
    `ඔබේ කේන්දරයේ වෘත්තීය ලකුණ: ${source} ${planets} විසින් හැඩගස්වා ඇත, එය වෘත්තිය ${fields} වෙත යොමු කරයි. මෙය කේන්දරයේම වෘත්තීය කැඳවීමයි — කිසියම් තනි දශාවක් හිතකර කරන දේට වඩා හොඳ මඟපෙන්වීමකි.`,
};

/** Source descriptors for the signature frame. */
export const CAREER_SOURCE: Record<'tenth' | 'tenthFromMoon' | 'tenthLord', Record<TableLang, string>> = {
  tenth:         { en: 'your 10th house',                         si: 'ඔබේ 10 වන භාවය' },
  tenthFromMoon: { en: 'the 10th house from your Moon',           si: 'ඔබේ චන්ද්‍රයාගෙන් 10 වන භාවය' },
  tenthLord:     { en: 'the lord of your 10th house',             si: 'ඔබේ 10 වන භාවයේ අධිපතියා' },
};

/** The dasamsa's own 10th — the one divisional statement worth reading aloud. */
export const F_D10_TENTH: F2 = {
  en: (planets, fields) =>
    `In the dasamsa (D10), the career chart proper, the 10th house holds ${planets} — the work itself, as opposed to the status it brings, leans toward ${fields}.`,
  si: (planets, fields) =>
    `වෘත්තිය සඳහාම වන දශාංශ (D10) කේන්දරයේ 10 වන භාවයේ ${planets} සිටී — එය ගෙන දෙන තත්ත්වයට වඩා වැඩ කටයුත්තම ${fields} වෙත නැඹුරු වේ.`,
};

/** The Amatyakaraka named as a standing fact. */
export const F_AMATYAKARAKA: F2 = {
  en: (planet, fields) =>
    `${planet} is your Amatyakaraka — the Jaimini significator of livelihood, the planet second-highest by degree. Its nature (${fields}) runs through whatever career you take, and its periods are the ones that move the profession.`,
  si: (planet, fields) =>
    `${planet} ඔබේ අමාත්‍යකාරකයාය — ජෛමිනි ක්‍රමයේ ජීවනෝපායේ කාරකයා, අංශකයෙන් දෙවැනියට ඉහළම ග්‍රහයා. එහි ස්වභාවය (${fields}) ඔබ ගන්නා ඕනෑම වෘත්තියක් හරහා ගලා යන අතර, වෘත්තිය ඉදිරියට ගෙන යන දශා එහි දශාවලයි.`,
};

// ─── Wealth signature ──────────────────────────────────────────────────────

export const F_WEALTH_SIGNATURE: F2 = {
  en: (planets, channels) =>
    `Income channels in your chart: ${planets} govern your 2nd and 11th houses, so money tends to arrive through ${channels}. Periods that touch these planets are the ones that move income.`,
  si: (planets, channels) =>
    `ඔබේ කේන්දරයේ ආදායම් මාර්ග: ${planets} ඔබේ 2 වන හා 11 වන භාව පාලනය කරන බැවින්, මුදල් බොහෝ විට ${channels} හරහා ලැබේ. මෙම ග්‍රහයන් ස්පර්ශ කරන දශා ආදායම වෙනස් කරන දශාවලයි.`,
};

/** Indu Lagna — the wealth ascendant of Uttara Kalamrita. */
export const F_INDU_LAGNA: F3 = {
  en: (rashi, lord, occupants) =>
    `Your Indu Lagna (the wealth ascendant of Uttara Kalamrita) falls in ${rashi}, ruled by ${lord}${occupants ? `, with ${occupants} placed there` : ''}. Classically, wealth accumulates in the periods of its lord and of the planets standing in it.`,
  si: (rashi, lord, occupants) =>
    `ඔබේ ඉන්දු ලග්නය (උත්තර කාලාමෘතයේ ධන ලග්නය) ${rashi} රාශියේ පිහිටයි, එහි අධිපති ${lord}${occupants ? `, එහි ${occupants} සිටී` : ''}. සම්භාව්‍ය ලෙස, ධනය රැස් වන්නේ එහි අධිපතියාගේ හා එහි සිටින ග්‍රහයන්ගේ දශාවලය.`,
};

export const F_INDU_STRONG: F1 = {
  en: planet => `${planet}, a benefic, stands in your Indu Lagna in dignity — the classical marker of a chart that accumulates rather than merely earns.`,
  si: planet => `ශුභ ග්‍රහයෙකු වන ${planet} ඔබේ ඉන්දු ලග්නයේ ගෞරවයෙන් සිටී — හුදෙක් උපයනවාට වඩා රැස් කරන කේන්දරයක සම්භාව්‍ය ලකුණයි.`,
};

/**
 * Per-planet channel through which money arrives when that planet governs the
 * wealth houses. Deliberately short noun phrases — they are joined into a list.
 */
export const WEALTH_CHANNEL: Record<string, BiList> = {
  Sun:     { en: ['government or institutional authority', 'the father or paternal line'],           si: ['රාජ්‍ය හෝ ආයතනික බලය', 'පියා හෝ පිය පාර්ශ්වය'] },
  Moon:    { en: ['the public and public-facing work', 'property and liquid assets'],                si: ['මහජනතාව හා මහජන සේවා', 'දේපළ හා ද්‍රවශීල වත්කම්'] },
  Mars:    { en: ['land and property', 'technical or engineering work', 'siblings'],                 si: ['ඉඩම් හා දේපළ', 'තාක්ෂණික හෝ ඉංජිනේරු වැඩ', 'සහෝදරයන්'] },
  Mercury: { en: ['trade and commerce', 'communication and advisory work', 'several streams at once'], si: ['වෙළඳාම හා වාණිජය', 'සන්නිවේදන හා උපදේශන සේවා', 'එකවර ආදායම් මාර්ග කිහිපයක්'] },
  Jupiter: { en: ['teaching, law or finance', 'children and the guru line'],                         si: ['ඉගැන්වීම, නීතිය හෝ මූල්‍ය', 'දරුවන් හා ගුරු පරපුර'] },
  Venus:   { en: ['arts, luxury and comforts', 'the spouse or business partner'],                    si: ['කලා, සුඛෝපභෝගී භාණ්ඩ හා පහසුකම්', 'කලත්‍රයා හෝ ව්‍යාපාරික හවුල්කරු'] },
  Saturn:  { en: ['long service and slow-built assets', 'labour, land and old dues'],                si: ['දිගු සේවය හා සෙමින් ගොඩනැගූ වත්කම්', 'ශ්‍රමය, ඉඩම් හා පැරණි හිඟ මුදල්'] },
  Rahu:    { en: ['foreign sources and technology', 'unconventional or sudden gains'],               si: ['විදේශ මූලාශ්‍ර හා තාක්ෂණය', 'සම්ප්‍රදායික නොවන හෝ හදිසි ලාභ'] },
  Ketu:    { en: ['research, healing or spiritual work', 'unexpected windfalls and losses alike'],   si: ['පර්යේෂණ, සුවකිරීම හෝ අධ්‍යාත්මික සේවය', 'අනපේක්ෂිත ලාභ හා පාඩු දෙකම'] },
};

// ─── Dasha activation — career ─────────────────────────────────────────────

/** (planet, level, house-locative) */
export const F_ACT_IN_HOUSE_CAREER: F2 = {
  en: (planet, level) =>
    `${planet}, holding the ${level}, sits natally in your 10th house — the period acts on career directly rather than through side doors. Expect the work itself, and how it is seen, to be the theme.`,
  si: (planet, level) =>
    `${level} දරන ${planet} ජන්මයේදී ඔබේ 10 වන භාවයේ සිටී — මෙම දශාව වක්‍ර මාර්ගවලින් නොව කෙලින්ම වෘත්තිය මත ක්‍රියා කරයි. වැඩ කටයුත්තම හා එය දකින ආකාරය ප්‍රධාන තේමාව වේ.`,
};

export const F_ACT_ASPECTS_CAREER: F2 = {
  en: (planet, level) =>
    `${planet}, holding the ${level}, casts its aspect onto your 10th house — career is in view this period, coloured by ${planet}'s nature.`,
  si: (planet, level) =>
    `${level} දරන ${planet} ඔබේ 10 වන භාවයට දෘෂ්ටි හෙළයි — මෙම දශාවේ වෘත්තිය ${planet}ගේ ස්වභාවයෙන් වර්ණ ගැන්වී අවධානයට ලක් වේ.`,
};

export const F_ACT_MOON_TENTH: F2 = {
  en: (planet, level) =>
    `${planet}, holding the ${level}, rules or occupies the 10th house counted from your Moon — the Chandra-lagna career house. Classically this times a visible change in work: a move, a new role, or recognition.`,
  si: (planet, level) =>
    `${level} දරන ${planet} ඔබේ චන්ද්‍රයාගෙන් ගණන් කළ 10 වන භාවය — චන්ද්‍ර ලග්න වෘත්තීය භාවය — පාලනය කරයි හෝ එහි සිටී. සම්භාව්‍ය ලෙස මෙය රැකියාවේ දෘශ්‍යමාන වෙනසක් — මාරුවක්, නව තනතුරක් හෝ පිළිගැනීමක් — කාලය නියම කරයි.`,
};

export const F_ACT_AMATYAKARAKA: F2 = {
  en: (planet, level) =>
    `${planet}, your Amatyakaraka, holds the ${level} — the Jaimini livelihood significator is running its own period. Career decisions taken now tend to set the direction for years.`,
  si: (planet, level) =>
    `ඔබේ අමාත්‍යකාරක ${planet} ${level} දරයි — ජෛමිනි ජීවනෝපාය කාරකයා තමාගේම දශාව ගෙන යයි. දැන් ගන්නා වෘත්තීය තීරණ බොහෝ විට වසර ගණනාවකට දිශාව නියම කරයි.`,
};

export const F_ACT_D10_STRONG: F3 = {
  en: (planet, level, dignity) =>
    `${planet}, holding the ${level}, is ${dignity} in the dasamsa (D10) — the divisional chart that governs career. Whatever the rashi chart says of it, the professional results of this period are backed underneath.`,
  si: (planet, level, dignity) =>
    `${level} දරන ${planet} වෘත්තිය පාලනය කරන දශාංශ (D10) කේන්දරයේ ${dignity} වී ඇත. රාශි කේන්දරය එය ගැන කුමක් කීවත්, මෙම දශාවේ වෘත්තීය ඵල යටින් සහාය ලබයි.`,
};

export const F_ACT_D10_WEAK: F3 = {
  en: (planet, level, dignity) =>
    `${planet}, holding the ${level}, is ${dignity} in the dasamsa (D10) — the divisional chart that governs career. Professional gains this period are harder to convert into standing: effort is real, credit lags.`,
  si: (planet, level, dignity) =>
    `${level} දරන ${planet} වෘත්තිය පාලනය කරන දශාංශ (D10) කේන්දරයේ ${dignity} වී ඇත. මෙම දශාවේ වෘත්තීය ලාභ තත්ත්වයක් බවට හැරවීම අපහසුය: වෑයම සැබෑ වුවත් පිළිගැනීම පසුබසී.`,
};

/** (yogaName, planet, level) — a raja / mahapurusha yoga fructifying. */
export const F_ACT_YOGA_CAREER: F3 = {
  en: (yoga, planet, level) =>
    `${yoga} is formed in your chart and ${planet}, one of the planets forming it, holds the ${level}. A yoga gives its results in the periods of the planets that make it — this is one of the windows in which that combination pays out in standing and position.`,
  si: (yoga, planet, level) =>
    `ඔබේ කේන්දරයේ ${yoga} සැදී ඇති අතර එය සාදන ග්‍රහයන්ගෙන් එකෙකු වන ${planet} ${level} දරයි. යෝගයක් ඵල දෙන්නේ එය සාදන ග්‍රහයන්ගේ දශාවලය — මෙය එම සංයෝගය තත්ත්වයෙන් හා තනතුරින් ඵල දෙන කවුළුවලින් එකකි.`,
};

// ─── Dasha activation — wealth ─────────────────────────────────────────────

/** (planet, level, house label) */
export const F_ACT_IN_HOUSE_WEALTH: F3 = {
  en: (planet, level, house) =>
    `${planet}, holding the ${level}, sits natally in your ${house} — a wealth house. The period acts on income directly; what ${planet} signifies is where the money comes from now.`,
  si: (planet, level, house) =>
    `${level} දරන ${planet} ජන්මයේදී ඔබේ ${house} — ධන භාවයක — සිටී. මෙම දශාව ආදායම මත කෙලින්ම ක්‍රියා කරයි; ${planet} නියෝජනය කරන දේ දැන් මුදල් එන තැනයි.`,
};

export const F_ACT_ASPECTS_WEALTH: F3 = {
  en: (planet, level, house) =>
    `${planet}, holding the ${level}, casts its aspect onto your ${house} — a wealth house is in view this period.`,
  si: (planet, level, house) =>
    `${level} දරන ${planet} ඔබේ ${house} වෙත දෘෂ්ටි හෙළයි — මෙම දශාවේ ධන භාවයක් අවධානයට ලක් වේ.`,
};

export const F_ACT_MOON_WEALTH: F3 = {
  en: (planet, level, house) =>
    `${planet}, holding the ${level}, rules or occupies the ${house} counted from your Moon — a Chandra-lagna wealth house. Income timed from the Moon tends to be felt more immediately than income promised from the lagna.`,
  si: (planet, level, house) =>
    `${level} දරන ${planet} ඔබේ චන්ද්‍රයාගෙන් ගණන් කළ ${house} — චන්ද්‍ර ලග්න ධන භාවයක් — පාලනය කරයි හෝ එහි සිටී. චන්ද්‍රයාගෙන් කාලය නියම වන ආදායම ලග්නයෙන් පොරොන්දු වන ආදායමට වඩා ඉක්මනින් දැනේ.`,
};

export const F_ACT_INDU: F2 = {
  en: (planet, level) =>
    `${planet}, holding the ${level}, rules or occupies your Indu Lagna — the wealth ascendant. Uttara Kalamrita names these as the periods in which accumulation, not just earning, happens.`,
  si: (planet, level) =>
    `${level} දරන ${planet} ඔබේ ඉන්දු ලග්නය — ධන ලග්නය — පාලනය කරයි හෝ එහි සිටී. උත්තර කාලාමෘතය මේවා හුදෙක් උපයනවාට වඩා රැස් කිරීම සිදු වන දශා ලෙස නම් කරයි.`,
};

export const F_ACT_BHAGYA: F2 = {
  en: (planet, level) =>
    `${planet}, holding the ${level}, rules your 9th house (bhagya — fortune). Its periods carry the kind of luck that arrives unearned: help, timing, and doors opening from outside.`,
  si: (planet, level) =>
    `${level} දරන ${planet} ඔබේ 9 වන භාවය (භාග්‍ය — වාසනාව) පාලනය කරයි. එහි දශා නොඉපැයූ වාසනාව — උපකාර, කාලය හා පිටතින් විවර වන දොරවල් — ගෙන එයි.`,
};

export const F_ACT_TWELFTH_WEALTH: F2 = {
  en: (planet, level) =>
    `${planet}, holding the ${level}, sits natally in your 12th house (vyaya — expenditure) without ruling a wealth house. Outflow runs ahead of inflow this period: budget for it rather than being surprised by it.`,
  si: (planet, level) =>
    `${level} දරන ${planet} ධන භාවයක් පාලනය නොකර ජන්මයේදී ඔබේ 12 වන භාවයේ (ව්‍යය — වියදම්) සිටී. මෙම දශාවේ වියදම් ආදායමට පෙරාතුව දිවෙයි: පුදුම වීමට වඩා එයට අයවැයක් සකසන්න.`,
};

/** (yogaName, planet, level) — a dhana yoga fructifying. */
export const F_ACT_YOGA_WEALTH: F3 = {
  en: (yoga, planet, level) =>
    `${yoga} is formed in your chart and ${planet}, one of the planets forming it, holds the ${level}. A yoga gives its results in the periods of the planets that make it — this is one of the windows in which that wealth combination pays out.`,
  si: (yoga, planet, level) =>
    `ඔබේ කේන්දරයේ ${yoga} සැදී ඇති අතර එය සාදන ග්‍රහයන්ගෙන් එකෙකු වන ${planet} ${level} දරයි. යෝගයක් ඵල දෙන්නේ එය සාදන ග්‍රහයන්ගේ දශාවලය — මෙය එම ධන සංයෝගය ඵල දෙන කවුළුවලින් එකකි.`,
};

/** (yogaName, planet, level) — a poverty combination (Kemadruma) active. */
export const F_ACT_DARIDRA: F3 = {
  en: (yoga, planet, level) =>
    `${yoga} is present in your chart and ${planet}, the planet it centres on, holds the ${level}. Its constriction is live this period — income may be adequate, but it feels unsupported and is easily disturbed.`,
  si: (yoga, planet, level) =>
    `ඔබේ කේන්දරයේ ${yoga} පවතින අතර එය කේන්ද්‍රගත ග්‍රහයා වන ${planet} ${level} දරයි. එහි සීමා කිරීම මෙම දශාවේ සජීවීය — ආදායම ප්‍රමාණවත් විය හැකි නමුත් එය සහායක් නැති බවක් දැනෙන අතර පහසුවෙන් කැළඹේ.`,
};
