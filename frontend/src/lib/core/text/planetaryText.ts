/**
 * Bilingual display layer for planetaryAnalysis: house names/themes/rules,
 * dignity / functional / verdict / dig-bala labels, and the computed-sentence
 * frames (strength summary, combustion, Neecha Bhanga, functional descriptions).
 *
 * The structural HOUSE_DATA / DIGNITY tables in planetaryAnalysis stay English —
 * this file only carries what the UI renders.
 */

import type { Bi, BiList, Lang } from '../i18n';
import { en2si } from '../i18n';

// ─── House display (name / theme / rules) ──────────────────────────────────

export const HOUSE_DISPLAY: Record<number, { name: Bi; theme: Bi; rules: BiList }> = {
  1: { name: { en: '1st House', si: 'පළමු භාවය' }, theme: { en: 'Self & Vitality', si: 'ආත්මය හා ජීවශක්තිය' }, rules: { en: ['self', 'personality', 'physical health', 'constitution', 'life path'], si: ['ආත්මය', 'පෞරුෂය', 'ශාරීරික සෞඛ්‍යය', 'ශරීර ස්වභාවය', 'ජීවන මාර්ගය'] } },
  2: { name: { en: '2nd House', si: 'දෙවන භාවය' }, theme: { en: 'Wealth & Speech', si: 'ධනය හා වචනය' }, rules: { en: ['wealth', 'family', 'speech', 'savings', 'values', 'early education'], si: ['ධනය', 'පවුල', 'වචනය', 'ඉතිරිකිරීම්', 'සාරධර්ම', 'මුල් අධ්‍යාපනය'] } },
  3: { name: { en: '3rd House', si: 'තෙවන භාවය' }, theme: { en: 'Courage & Communication', si: 'ධෛර්යය හා සන්නිවේදනය' }, rules: { en: ['courage', 'siblings', 'communication', 'writing', 'media', 'short travels'], si: ['ධෛර්යය', 'සහෝදරයන්', 'සන්නිවේදනය', 'ලේඛන', 'මාධ්‍ය', 'කෙටි ගමන්'] } },
  4: { name: { en: '4th House', si: 'සිව්වන භාවය' }, theme: { en: 'Home & Happiness', si: 'නිවස හා සතුට' }, rules: { en: ['home', 'mother', 'real estate', 'vehicles', 'inner peace', 'education'], si: ['නිවස', 'මව', 'දේපළ', 'වාහන', 'සිතේ සාමය', 'අධ්‍යාපනය'] } },
  5: { name: { en: '5th House', si: 'පස්වන භාවය' }, theme: { en: 'Intelligence & Creativity', si: 'බුද්ධිය හා නිර්මාණශීලීත්වය' }, rules: { en: ['children', 'creativity', 'intelligence', 'romance', 'investments', 'spiritual merit'], si: ['දරුවන්', 'නිර්මාණශීලීත්වය', 'බුද්ධිය', 'ප්‍රේමය', 'ආයෝජන', 'පින් බලය'] } },
  6: { name: { en: '6th House', si: 'හයවන භාවය' }, theme: { en: 'Obstacles & Service', si: 'බාධක හා සේවය' }, rules: { en: ['enemies', 'debt', 'disease', 'service', 'employees', 'competition'], si: ['සතුරන්', 'ණය', 'රෝග', 'සේවය', 'සේවකයන්', 'තරඟය'] } },
  7: { name: { en: '7th House', si: 'හත්වන භාවය' }, theme: { en: 'Partnerships', si: 'හවුල්කාරිත්ව' }, rules: { en: ['marriage', 'partnerships', 'business', 'public dealings', 'legal contracts'], si: ['විවාහය', 'හවුල්කාරිත්ව', 'ව්‍යාපාර', 'මහජන ගනුදෙනු', 'නීතිමය ගිවිසුම්'] } },
  8: { name: { en: '8th House', si: 'අටවන භාවය' }, theme: { en: 'Transformation', si: 'පරිවර්තනය' }, rules: { en: ['longevity', 'inheritance', 'occult', 'sudden events', 'research', 'joint finances'], si: ['ආයුෂ', 'උරුමය', 'ගුප්ත විද්‍යාව', 'හදිසි සිදුවීම්', 'පර්යේෂණ', 'හවුල් මුදල්'] } },
  9: { name: { en: '9th House', si: 'නවවන භාවය' }, theme: { en: 'Fortune & Philosophy', si: 'වාසනාව හා දර්ශනය' }, rules: { en: ['fortune', 'father', 'religion', 'philosophy', 'higher education', 'long journeys'], si: ['වාසනාව', 'පියා', 'ආගම', 'දර්ශනය', 'උසස් අධ්‍යාපනය', 'දිගු ගමන්'] } },
  10: { name: { en: '10th House', si: 'දහවන භාවය' }, theme: { en: 'Career & Status', si: 'වෘත්තිය හා තත්ත්වය' }, rules: { en: ['career', 'profession', 'government', 'public status', 'authority', 'ambitions'], si: ['වෘත්තිය', 'රැකියාව', 'රාජ්‍ය සේවය', 'මහජන තත්ත්වය', 'බලය', 'අභිලාෂ'] } },
  11: { name: { en: '11th House', si: 'එකොළොස්වන භාවය' }, theme: { en: 'Gains & Social Circle', si: 'ලාභ හා සමාජ කවය' }, rules: { en: ['income', 'gains', 'social networks', 'elder siblings', 'hopes', 'desires'], si: ['ආදායම', 'ලාභ', 'සමාජ ජාල', 'වැඩිමහල් සහෝදරයන්', 'බලාපොරොත්තු', 'ආශාවන්'] } },
  12: { name: { en: '12th House', si: 'දොළොස්වන භාවය' }, theme: { en: 'Spirituality & Losses', si: 'අධ්‍යාත්මිකත්වය හා පාඩු' }, rules: { en: ['expenses', 'losses', 'foreign settlement', 'spirituality', 'liberation', 'seclusion'], si: ['වියදම්', 'පාඩු', 'විදේශ පදිංචිය', 'අධ්‍යාත්මිකත්වය', 'මිදීම', 'හුදෙකලාව'] } },
};

// ─── Discrete labels ───────────────────────────────────────────────────────

export const DIGNITY_LABEL: Record<string, Bi> = {
  exalted: { en: 'Exalted', si: 'උච්ච' },
  'own-sign': { en: 'Own Sign', si: 'ස්වක්ෂේත්‍ර' },
  'friend-sign': { en: 'Friendly Sign', si: 'මිත්‍ර රාශිය' },
  'neutral-sign': { en: 'Neutral Sign', si: 'සම රාශිය' },
  'enemy-sign': { en: 'Enemy Sign', si: 'ශතෘ රාශිය' },
  debilitated: { en: 'Debilitated', si: 'නීච' },
};

export const DIGNITY_DESC: Record<string, Bi> = {
  exalted: { en: 'At maximum strength — planet performs at its highest potential, delivering exceptional results in all areas it governs.', si: 'උපරිම ශක්තියෙන් — ග්‍රහයා එහි ඉහළම හැකියාවෙන් ක්‍රියා කරයි, තමා අධිපති සියලු ක්ෂේත්‍රවල අසාමාන්‍ය ප්‍රතිඵල ගෙන දෙයි.' },
  'own-sign': { en: 'In its home sign — planet is comfortable, stable, and performs consistently well throughout life.', si: 'ස්වකීය රාශියේ — ග්‍රහයා සුවපහසු, ස්ථාවර වන අතර ජීවිතය පුරාම නොකඩවා හොඳින් ක්‍රියා කරයි.' },
  'friend-sign': { en: 'In a friendly environment — planet operates with ease and delivers generally positive results.', si: 'මිත්‍ර පරිසරයක — ග්‍රහයා පහසුවෙන් ක්‍රියා කර සාමාන්‍යයෙන් හිතකර ප්‍රතිඵල ගෙන දෙයි.' },
  'neutral-sign': { en: 'In neutral territory — planet delivers average results; outcomes depend heavily on other chart factors.', si: 'සම භූමියක — ග්‍රහයා සාමාන්‍ය ප්‍රතිඵල ගෙන දෙයි; ප්‍රතිඵල බොහෝ දුරට කේන්දරයේ අනෙකුත් සාධක මත රඳා පවතී.' },
  'enemy-sign': { en: 'In unfriendly environment — planet struggles to express its qualities fully; results are mixed or delayed.', si: 'අහිතකර පරිසරයක — ග්‍රහයාට එහි ගුණාංග පූර්ණ ලෙස පළ කිරීමට අපහසුය; ප්‍රතිඵල මිශ්‍ර හෝ ප්‍රමාද වේ.' },
  debilitated: { en: 'At minimum strength — planet has difficulty expressing its qualities; requires conscious remedial effort.', si: 'අවම ශක්තියෙන් — ග්‍රහයාට එහි ගුණාංග පළ කිරීමට අපහසුය; දැනුවත් ප්‍රතිකර්ම වෑයමක් අවශ්‍යය.' },
};

export const FUNCTIONAL_LABEL: Record<string, Bi> = {
  yogakaraka: { en: 'Yogakaraka', si: 'යෝගකාරක' },
  benefic: { en: 'Functional Benefic', si: 'ක්‍රියාකාරී ශුභ' },
  neutral: { en: 'Neutral', si: 'සම' },
  mixed: { en: 'Mixed', si: 'මිශ්‍ර' },
  malefic: { en: 'Functional Malefic', si: 'ක්‍රියාකාරී පාප' },
  maraka: { en: 'Maraka', si: 'මාරක' },
};

export const VERDICT_LABEL: Record<string, Bi> = {
  'very-strong': { en: 'Very Strong', si: 'ඉතා ප්‍රබල' },
  strong: { en: 'Strong', si: 'ප්‍රබල' },
  moderate: { en: 'Moderate', si: 'මධ්‍යස්ථ' },
  weak: { en: 'Weak', si: 'දුර්වල' },
  'very-weak': { en: 'Very Weak', si: 'ඉතා දුර්වල' },
};

// ─── Frames for computed sentences ─────────────────────────────────────────

/** Ordinal house, spelled the way each language reads it. */
export function ordHouse(n: number, lang: Lang): string {
  if (lang === 'si') return `${n} වන භාවයේ`;
  const s = ['th', 'st', 'nd', 'rd'], v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]} house`;
}

export const DIG_BALA_FRAMES = {
  na: { en: 'Directional strength (Dig Bala) is not assigned to shadow planets.', si: 'ඡායා ග්‍රහයන්ට දිශා ශක්තිය (දිග් බල) පවරා නැත.' } as Bi,
  levelWord: (level: 'strong' | 'moderate' | 'weak', lang: Lang) =>
    ({ strong: { en: 'strong', si: 'ප්‍රබල' }, moderate: { en: 'moderate', si: 'මධ්‍යස්ථ' }, weak: { en: 'weak', si: 'දුර්වල' } }[level][en2si(lang)]),
  desc: (strongHouse: number, house: number, level: 'strong' | 'moderate' | 'weak', lang: Lang): string => {
    const lvl = DIG_BALA_FRAMES.levelWord(level, lang);
    const outcome = level === 'strong'
      ? (lang === 'si' ? 'කැපී පෙනෙන හා ඵලදායී' : 'prominent and effective')
      : level === 'weak'
        ? (lang === 'si' ? 'මොට වූ හා පහසුවෙන් යටපත් වන' : 'muted and easily overshadowed')
        : (lang === 'si' ? 'මධ්‍යස්ථව පළ වන' : 'moderately expressed');
    return lang === 'si'
      ? `${strongHouse} වන භාවයේ පූර්ණ දිශා ශක්තියක් ඇත. මෙහි ${house} වන භාවයේ එහි දිග් බලය ${lvl}ය, එබැවින් ග්‍රහයාගේ ප්‍රතිඵල ${outcome} ලෙස පෙනේ.`
      : `Fully directionally strong in the ${strongHouse}${ordSuffix(strongHouse)} house. Here in the ${house}${ordSuffix(house)} house its Dig Bala is ${lvl}, so the planet's results come across as ${outcome}.`;
  },
};

function ordSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'], v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

/** Functional-nature descriptions, keyed by nature. `hs` = localised house list. */
export const FUNCTIONAL_DESC: Record<string, (hs: string, plural: boolean, lang: Lang) => string> = {
  shadow: (_hs, _plural, lang) => lang === 'si'
    ? 'ඡායා ග්‍රහයෙක් කිසිදු රාශියකට අධිපති නොවන නිසා අධිපත්‍යය මත පදනම් වූ ස්වභාවයක් නොදරයි. එය රැඳී සිටින භාවයේ, එහි රාශ්‍යාධිපතියාගේ හා එයට එක් වන ඕනෑම ග්‍රහයෙකුගේ ප්‍රතිඵල දෙයි — ඒවා හරහා එය කියවන්න.'
    : 'A shadow planet owns no sign, so it carries no rulership-based nature. It delivers the results of the house it occupies, of its dispositor (the lord of its sign), and of any planet it joins — read it through those.',
  yogakaraka: (hs, _p, lang) => lang === 'si'
    ? `ත්‍රිකෝණයක් හා කේන්ද්‍රයක් යන දෙකටම (${hs}) අධිපති වේ — මෙම ලග්නයට යෝගකාරකයෙකි. මෙය ග්‍රහයෙකුට දැරිය හැකි සුබදායකම භූමිකාවලින් එකකි: එහි දශා කේන්දරයේ තත්ත්වය, ධනය හා සාර්ථකත්වයේ ප්‍රබලම නැගීම් ගෙන එයි.`
    : `Rules both a trine and an angle (the ${hs} houses) — a Yogakaraka for this Ascendant. This is among the most auspicious roles a planet can hold: its periods (dashas) tend to bring the chart's strongest rises in status, wealth, and success.`,
  benefic: (hs, plural, lang) => lang === 'si'
    ? `${hs} ${plural ? 'භාවවලට' : 'භාවයට'} අධිපති වන අතර, එයට ත්‍රිකෝණයක් හෝ ලග්නය ද ඇතුළත් වේ — මෙම ලග්නයට ක්‍රියාකාරී ශුභ ග්‍රහයෙකි. එහි දශා හා ගෝචර සාමාන්‍යයෙන් වර්ධනය, වාසනාව හා යහපැවැත්මට සහාය වේ.`
    : `Rules the ${hs} ${plural ? 'houses' : 'house'}, including a trine or the Ascendant — a functional benefic for this Lagna. Its dasha and transits generally support growth, fortune, and well-being.`,
  neutral: (hs, plural, lang) => lang === 'si'
    ? `${hs} ${plural ? 'භාවවලට' : 'භාවයට'} අධිපති වේ — මෙම ලග්නයට පුළුල් ලෙස සම භූමිකාවකි. එහි ප්‍රතිඵල දිග්නත්වය, භාවය හා එය සමඟ සිටින ග්‍රහයන් මත රඳා පවතී.`
    : `Rules the ${hs} ${plural ? 'houses' : 'house'} — a broadly neutral role for this Lagna. Its outcomes lean on dignity, house, and the company it keeps.`,
  mixed: (hs, _p, lang) => lang === 'si'
    ? `ත්‍රිකෝණයක් හා දුෂ්කර භාවයක් යන දෙකටම (${hs}) අධිපති වේ — මිශ්‍ර ක්‍රියාකාරී ස්වභාවයකි. එය ත්‍රිකෝණයේ කරුණුවලට හිතකර වන අතරම දුෂ්කර භාවයේ කරුණු පරීක්ෂාවට ලක් කළ හැක.`
    : `Rules both a trine and a difficult house (the ${hs} houses) — a mixed functional nature. It can favour the trine's affairs while testing those of the harder house.`,
  malefic: (hs, plural, lang) => lang === 'si'
    ? `${hs} ${plural ? 'භාවවලට' : 'භාවයට'} අධිපති වේ — මෙම ලග්නයට දුස්ථාන (6/8/12) අධිපත්‍යයකි, එබැවින් එය ක්‍රියාකාරී පාප ග්‍රහයෙකු ලෙස ක්‍රියා කරයි. හොඳ සහයක් නොමැති නම් එහි දශා බාධක, ණය හෝ සෞඛ්‍ය හා සම්බන්ධතා ආතති ගෙන ආ හැක.`
    : `Rules the ${hs} ${plural ? 'houses' : 'house'} — a dusthana (6/8/12) lordship for this Lagna, so it acts as a functional malefic. Its periods can bring obstacles, debt, or health and relationship strain unless well supported.`,
  maraka: (hs, plural, lang) => lang === 'si'
    ? `${hs} ${plural ? 'භාවවලට' : 'භාවයට'} අධිපති වේ (2/7 මාරක අධිපත්‍යයකි). ස්වභාවයෙන් පාප නොවුවත්, සම්භාව්‍ය ලෙස සෞඛ්‍යයට සංවේදී කාල සමඟ බැඳී ඇත — එහි දශාවලදී ජීවශක්තිය ගැන අමතර සැලකිල්ලක් අවශ්‍යය.`
    : `Rules the ${hs} ${plural ? 'houses' : 'house'} (a 2nd/7th maraka lordship). Not malefic by nature, but classically tied to health-sensitive timing — its dashas warrant extra care with vitality.`,
};

/** Combustion description. */
export const COMBUSTION_FRAMES = {
  combust: (sep: string, limit: number, lang: Lang): string => lang === 'si'
    ? `සූර්යයාගෙන් අංශක ${sep}ක් පමණයි (අංශක ${limit} අස්තංගත කක්ෂය තුළ) — ග්‍රහයා අස්තංගතයි. දිග්නත්වය හොඳ වුවත් එහි බාහිර ප්‍රතිඵල අර්ධ වශයෙන් දැවී යයි, එහෙත් එහි අභ්‍යන්තර හා අධ්‍යාත්මික පැත්ත තීව්‍ර විය හැක.`
    : `Only ${sep}° from the Sun (within the ${limit}° combustion orb) — the planet is combust. Its outward results are partly burnt up even where its dignity is good, though its inner and spiritual side can intensify.`,
  clear: (sep: string, limit: number, lang: Lang): string => lang === 'si'
    ? `සූර්යයාගෙන් අංශක ${sep}ක්, අංශක ${limit} අස්තංගත කක්ෂයෙන් ඈත් වී — දැවී නැත.`
    : `${sep}° from the Sun, clear of the ${limit}° combustion orb — not burnt.`,
};

/** Gandanta (sign-junction knot) description. */
export const GANDANTA_FRAMES = {
  severityWord: (s: 'deep' | 'moderate' | 'mild', lang: Lang) =>
    ({
      deep: { en: 'deep', si: 'ගැඹුරු' },
      moderate: { en: 'moderate', si: 'මධ්‍යස්ථ' },
      mild: { en: 'shallow', si: 'නොගැඹුරු' },
    }[s][en2si(lang)]),
  desc: (args: {
    fromJunction: string;
    severity: 'deep' | 'moderate' | 'mild';
    atSignEnd: boolean;
    nakshatra: string;
    lang: Lang;
  }): string => {
    const { fromJunction, severity, atSignEnd, nakshatra, lang } = args;
    const sev = GANDANTA_FRAMES.severityWord(severity, lang);
    if (lang === 'si') {
      return `${nakshatra} නැකතේ, ජල–අග්නි රාශි සන්ධියේ අංශක ${fromJunction} ක් ${atSignEnd ? 'පෙර' : 'පසු'} — ගණ්ඩාන්තයකි (${sev}). සම්භාව්‍ය ලෙස මෙය කාර්මික ගැටයකි: මෙම ග්‍රහයා පාලනය කරන කරුණු ජීවිතයේ මුල් භාගයේ අස්ථිර වන අතර, ලිහා ගැනීමට සවිඥානික වෙහෙසක් අවශ්‍ය වේ.`;
    }
    return `In ${nakshatra}, ${fromJunction}° ${atSignEnd ? 'before' : 'past'} the water–fire sign junction — this is gandanta (${sev}). Classically a karmic knot: what this planet governs feels unstable early in life and asks to be consciously untied rather than simply outgrown.`;
  },
  /** Extra weight when the knot lands on the Moon — the mind's own foundation. */
  moon: (lang: Lang) => lang === 'si'
    ? 'ගණ්ඩාන්තය චන්ද්‍රයා මතම වැටේ — චිත්ත පදනම, මුල් නිවෙස හා මව සමඟ සම්බන්ධය කේන්දරයේ ලිහා ගැනීමට ඇති ප්‍රධාන ගැටයයි.'
    : 'The knot falls on the Moon itself — the emotional foundation, early home, and the relationship with the mother are the chart\'s central thing to untie.',
  /** Extra weight when the knot lands on the lagna — the self. */
  lagna: (lang: Lang) => lang === 'si'
    ? 'ගණ්ඩාන්තය ලග්නය මතම වැටේ — ආත්ම හැඟීම හා ශරීර ස්වභාවය මුල් වර්ෂවල අස්ථිර වේ.'
    : 'The knot falls on the Ascendant itself — the sense of self and the constitution both settle late.',
};

/** Neecha Bhanga description. */
export const NB_FRAMES = {
  cancelled: (firstReason: string, extra: number, lang: Lang): string => lang === 'si'
    ? `${firstReason} නිසා නීචත්වය භංග වී ඇත${extra > 0 ? `, තවත් හේතු ${extra}ක් ද සමඟ` : ''}. ග්‍රහයා නිකම්ම නීච ග්‍රහයෙකුට වඩා බෙහෙවින් හොඳින් ක්‍රියා කරයි — සම්භාව්‍ය ලෙස නීච භංග රාජ යෝගයක්, මුල් වෙහෙසින් පසු ප්‍රබල නැගීමක් දෙයි.`
    : `Debilitation is cancelled because ${firstReason}${extra > 0 ? `, and ${extra} further reason${extra > 1 ? 's' : ''}` : ''}. The planet behaves far better than a raw debilitation — classically a Neecha Bhanga Raja Yoga, giving a strong rise after early struggle.`,
  active: (lang: Lang): string => lang === 'si'
    ? 'ග්‍රහයා නීච වී ඇති අතර සම්භාව්‍ය නීච භංග කිසිදු කොන්දේසියක් සපුරා නැත, එබැවින් එහි දුර්වලකම පවතී. එහි කරුණු සඳහා ප්‍රතිකර්මවලට අවධානය යොමු කිරීම නිර්දේශ කෙරේ.'
    : 'The planet is debilitated and none of the classical cancellation (Neecha Bhanga) conditions are met, so its weakness stands. Remedial focus is advised for its significations.',
  // NB reason fragments
  reasonDispositorKendra: (disp: string, lang: Lang) => lang === 'si'
    ? `නීච රාශියේ අධිපතියා (${disp}) ලග්නයෙන් හෝ චන්ද්‍රයාගෙන් කේන්ද්‍රයක සිටී`
    : `the lord of the debilitation sign (${disp}) is in a kendra from the Lagna or Moon`,
  reasonExaltedKendra: (exalted: string, lang: Lang) => lang === 'si'
    ? `මෙම රාශියේ උච්ච වන ${exalted}, ලග්නයෙන් හෝ චන්ද්‍රයාගෙන් කේන්ද්‍රයක සිටී`
    : `${exalted}, which is exalted in this sign, is in a kendra from the Lagna or Moon`,
  reasonDispositorStrong: (disp: string, exalted: boolean, lang: Lang) => lang === 'si'
    ? `අධිපති ${disp} තමාම ${exalted ? 'උච්ච වී' : 'ස්වකීය රාශියේ'} සිටී`
    : `the dispositor ${disp} is itself ${exalted ? 'exalted' : 'in its own sign'}`,
  reasonDispositorAspect: (disp: string, conjunct: boolean, lang: Lang) => lang === 'si'
    ? `එහි අධිපති ${disp} ${conjunct ? 'එය සමඟ එක්ව සිටී' : '7 වැන්නෙන් එය බලයි'}`
    : `its dispositor ${disp} ${conjunct ? 'is conjunct it' : 'aspects it from the 7th'}`,
  reasonRetrograde: (lang: Lang) => lang === 'si' ? 'ග්‍රහයා වක්‍ර වී ඇත' : 'the planet is retrograde',
};

/** assessStrength summary — assembled from localised fragments. */
export function strengthSummary(args: {
  verdictLabel: string;
  dignityLabel: string;
  moolatrikona: boolean;
  neechaBhanga: boolean;
  digLevel: 'strong' | 'moderate' | 'weak' | 'na';
  cheshta: boolean;
  combust: boolean;
  gandanta?: 'deep' | 'moderate' | 'mild' | null;
  functionalLabel: string;
  functionalScore: number;
  lang: Lang;
}): string {
  const { verdictLabel, dignityLabel, moolatrikona, neechaBhanga, digLevel, cheshta, combust, gandanta = null, functionalLabel, functionalScore, lang } = args;
  const lean = functionalScore >= 0.7
    ? (lang === 'si' ? 'දැඩි ලෙස සහායක' : 'strongly supportive')
    : functionalScore >= 0.5
      ? (lang === 'si' ? 'පුළුල් ලෙස සම' : 'broadly neutral')
      : (lang === 'si' ? 'අභියෝගාත්මක' : 'challenging');
  const digPhrase = digLevel === 'na'
    ? (lang === 'si' ? 'පවරන ලද දිශා ශක්තියක් නොමැතිව' : 'no assigned directional strength')
    : (lang === 'si' ? `${DIG_BALA_FRAMES.levelWord(digLevel, lang)} දිශා ශක්තියක් සමඟ` : `${digLevel} directional strength`);

  if (lang === 'si') {
    return [
      `සමස්තයක් ලෙස මෙම ග්‍රහයා මෙම කේන්දරයේ ${verdictLabel} වේ.`,
      ` රාශිය අනුව එය ${dignityLabel}${moolatrikona ? ' (මූලත්‍රිකෝණ)' : ''} වේ`,
      neechaBhanga ? ', නමුත් එහි නීචත්වය භංග වී ඇති නිසා (නීච භංග), එය නීච ග්‍රහයෙකුට වඩා බෙහෙවින් හොඳින් ක්‍රියා කරයි' : '',
      `, ${digPhrase}`,
      cheshta ? ', හා එහි වක්‍ර ගමනින් අමතර චලන ශක්තියක් ද ඇත' : '',
      '. ',
      combust ? 'එය අස්තංගතයි — සූර්යයාට ඉතා ළං — එය එහි බාහිර කරුණු දවා දමයි. ' : '',
      gandanta ? `එය රාශි සන්ධියේ (ගණ්ඩාන්ත, ${GANDANTA_FRAMES.severityWord(gandanta, lang)}) සිටී — එහි කරුණු ස්ථාවර වන්නේ ප්‍රමාද වීය. ` : '',
      `මෙම ලග්නයට ${functionalLabel} ග්‍රහයෙකු ලෙස, එහි දශාවලදී එය ${lean} වේ.`,
    ].join('');
  }
  return [
    `Overall this planet is ${verdictLabel.toLowerCase()} in this chart.`,
    ` It is ${dignityLabel.toLowerCase()}${moolatrikona ? ' (Moolatrikona)' : ''} by sign`,
    neechaBhanga ? ', but its debilitation is cancelled (Neecha Bhanga), so it performs far above a debilitated planet' : '',
    `, with ${digPhrase}`,
    cheshta ? ', and extra motional strength from its retrograde motion' : '',
    '. ',
    combust ? 'It is combust — too close to the Sun — which burns its outward significations. ' : '',
    gandanta ? `It sits at a sign junction (gandanta, ${GANDANTA_FRAMES.severityWord(gandanta, lang)}) — what it governs steadies late. ` : '',
    `As a ${functionalLabel.toLowerCase()} for this Ascendant, it leans ${lean} over its periods.`,
  ].join('');
}

/** assessStrength factor labels. */
export const FACTOR_LABEL = {
  signDignity: { en: 'Sign Dignity', si: 'රාශි බලය' } as Bi,
  direction: { en: 'Direction', si: 'දිශාව' } as Bi,
  function: { en: 'Function', si: 'ක්‍රියාකාරිත්වය' } as Bi,
  motion: { en: 'Motion', si: 'චලනය' } as Bi,
};
