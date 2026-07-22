/** Bilingual prose for the monthly / upcoming Gochara views (monthlyTransits.ts). */

import { type Lang, planetName, rashiName } from '../i18n';

export const PLANET_SIGNIFIES: Record<string, Record<Lang, string>> = {
  SUN: { en: 'authority, vitality, recognition and the father', si: 'බලය, ජීවශක්තිය, පිළිගැනීම හා පියා' },
  MERCURY: { en: 'communication, commerce, learning and quick thinking', si: 'සන්නිවේදනය, වෙළඳාම, ඉගෙනීම හා ඉක්මන් සිතීම' },
  VENUS: { en: 'love, comfort, money, art and relationships', si: 'ආදරය, පහසුව, මුදල්, කලා හා සම්බන්ධතා' },
  MARS: { en: 'energy, courage, drive, property and conflict', si: 'ශක්තිය, ධෛර්යය, ආශාව, දේපළ හා ගැටුම්' },
  JUPITER: { en: 'wisdom, fortune, growth, dharma and mentors', si: 'ඥානය, වාසනාව, වර්ධනය, ධර්මය හා මඟපෙන්වන්නන්' },
  SATURN: { en: 'discipline, karma, patience, structure and hard work', si: 'විනය, කර්මය, ඉවසීම, ව්‍යුහය හා වෙහෙස මහන්සිය' },
  RAHU: { en: 'ambition, the unconventional, foreign matters and sudden surges', si: 'අභිලාෂය, සම්ප්‍රදායට වෙනස් දෑ, විදේශීය කරුණු හා හදිසි නැගීම්' },
  KETU: { en: 'detachment, spirituality, endings and past-life karma', si: 'වෙන්වීම, අධ්‍යාත්මිකත්වය, අවසන් වීම් හා පෙර භව කර්මය' },
};

export interface HouseThemeText {
  label: Record<Lang, string>;
  favorable: Record<Lang, string>;
  challenging: Record<Lang, string>;
  areas: [Record<Lang, string>, Record<Lang, string>];
}

export const HOUSE_THEME: Record<number, HouseThemeText> = {
  1: { label: { en: 'self & vitality', si: 'ආත්මය හා ජීවශක්තිය' }, favorable: { en: 'a fresh sense of direction and presence', si: 'නැවුම් දිශානතියක් හා පැවැත්මක්' }, challenging: { en: 'pressure on health, mood and self-image', si: 'සෞඛ්‍යය, මනෝභාවය හා ස්වයං ප්‍රතිරූපයට පීඩනය' }, areas: [{ en: 'Health & energy', si: 'සෞඛ්‍යය හා ශක්තිය' }, { en: 'Personal initiatives', si: 'පෞද්ගලික මුල පිරීම්' }] },
  2: { label: { en: 'wealth, family & speech', si: 'ධනය, පවුල හා වචනය' }, favorable: { en: 'gains through savings, family and measured words', si: 'ඉතිරිකිරීම්, පවුල හා සමබර වචන හරහා ලාභ' }, challenging: { en: 'strain on finances, food habits and family talk', si: 'මූල්‍ය, ආහාර පුරුදු හා පවුල් කතාබහට ආතතිය' }, areas: [{ en: 'Finances & savings', si: 'මූල්‍ය හා ඉතිරිකිරීම්' }, { en: 'Family & speech', si: 'පවුල හා වචනය' }] },
  3: { label: { en: 'courage, effort & communication', si: 'ධෛර්යය, උත්සාහය හා සන්නිවේදනය' }, favorable: { en: 'bold initiative, supportive siblings and effective communication', si: 'නිර්භීත මුල පිරීම, සහායක සහෝදරයන් හා ඵලදායී සන්නිවේදනය' }, challenging: { en: 'scattered effort and friction with siblings or peers', si: 'විසිර ගිය උත්සාහය හා සහෝදරයන් හෝ සගයන් සමඟ ඝට්ටනය' }, areas: [{ en: 'Courage & initiative', si: 'ධෛර්යය හා මුල පිරීම' }, { en: 'Communication', si: 'සන්නිවේදනය' }] },
  4: { label: { en: 'home, mother & peace', si: 'නිවස, මව හා සාමය' }, favorable: { en: 'comfort at home, property luck and inner calm', si: 'නිවසේ පහසුව, දේපළ වාසනාව හා අභ්‍යන්තර සන්සුන්කම' }, challenging: { en: 'domestic stress, restlessness and matters around mother or vehicles', si: 'ගෘහ ආතතිය, නොසන්සුන්කම හා මව හෝ වාහන ආශ්‍රිත කරුණු' }, areas: [{ en: 'Home & property', si: 'නිවස හා දේපළ' }, { en: 'Inner peace', si: 'අභ්‍යන්තර සාමය' }] },
  5: { label: { en: 'creativity, children & romance', si: 'නිර්මාණශීලීත්වය, දරුවන් හා ප්‍රේමය' }, favorable: { en: 'creative flow, romance, good news around children and smart speculation', si: 'නිර්මාණශීලී ගැලීම, ප්‍රේමය, දරුවන් පිළිබඳ සුබ ආරංචි හා බුද්ධිමත් සමපේක්ෂණය' }, challenging: { en: 'setbacks in romance, speculation or matters of children', si: 'ප්‍රේමය, සමපේක්ෂණය හෝ දරුවන්ගේ කරුණුවල පසුබෑම්' }, areas: [{ en: 'Romance & creativity', si: 'ප්‍රේමය හා නිර්මාණශීලීත්වය' }, { en: 'Children & learning', si: 'දරුවන් හා ඉගෙනීම' }] },
  6: { label: { en: 'work, rivals & health', si: 'වැඩ, තරඟකරුවන් හා සෞඛ්‍යය' }, favorable: { en: 'victory over rivals, debt clearance and steady service', si: 'තරඟකරුවන් මත ජයග්‍රහණය, ණය නිරවුල් කිරීම හා ස්ථාවර සේවය' }, challenging: { en: 'conflicts, debts and small recurring health issues', si: 'ගැටුම්, ණය හා නැවත නැවත එන කුඩා සෞඛ්‍ය ගැටලු' }, areas: [{ en: 'Competition & service', si: 'තරඟය හා සේවය' }, { en: 'Debts & health', si: 'ණය හා සෞඛ්‍යය' }] },
  7: { label: { en: 'partnership & public dealings', si: 'හවුල්කාරිත්වය හා මහජන ගනුදෙනු' }, favorable: { en: 'harmony in partnership and productive deals', si: 'හවුල්කාරිත්වයේ සමගිය හා ඵලදායී ගිවිසුම්' }, challenging: { en: 'tension with spouse or partners and tricky negotiations', si: 'කලත්‍රයා හෝ සහකරුවන් සමඟ ආතතිය හා දුෂ්කර සාකච්ඡා' }, areas: [{ en: 'Marriage & partnership', si: 'විවාහය හා හවුල්කාරිත්වය' }, { en: 'Business deals', si: 'ව්‍යාපාර ගිවිසුම්' }] },
  8: { label: { en: 'transformation & hidden matters', si: 'පරිවර්තනය හා සැඟවුණු කරුණු' }, favorable: { en: 'research insight, inheritance and deep transformation', si: 'පර්යේෂණ අවබෝධය, උරුමය හා ගැඹුරු පරිවර්තනය' }, challenging: { en: 'sudden upheavals, anxiety and hidden obstacles', si: 'හදිසි කැළඹීම්, කනස්සල්ල හා සැඟවුණු බාධක' }, areas: [{ en: 'Sudden change', si: 'හදිසි වෙනස්කම්' }, { en: 'Shared resources & occult', si: 'හවුල් සම්පත් හා ගුප්ත විද්‍යාව' }] },
  9: { label: { en: 'fortune, dharma & higher learning', si: 'වාසනාව, ධර්මය හා උසස් අධ්‍යාපනය' }, favorable: { en: 'luck, blessings, travel and guidance from mentors', si: 'වාසනාව, ආශිර්වාද, ගමන් හා මඟපෙන්වන්නන්ගේ මඟ පෙන්වීම' }, challenging: { en: 'a dip in luck and questioning of beliefs or direction', si: 'වාසනාව අඩුවීම හා විශ්වාස හෝ දිශාව ප්‍රශ්න කිරීම' }, areas: [{ en: 'Luck & dharma', si: 'වාසනාව හා ධර්මය' }, { en: 'Travel & higher study', si: 'ගමන් හා උසස් අධ්‍යාපනය' }] },
  10: { label: { en: 'career, status & action', si: 'වෘත්තිය, තත්ත්වය හා ක්‍රියාව' }, favorable: { en: 'career momentum, visibility and authority', si: 'වෘත්තීය ගම්‍යතාව, පෙනීම හා බලය' }, challenging: { en: 'pressure at work, reputation tests and heavier responsibility', si: 'සේවයේ පීඩනය, කීර්තිය පිළිබඳ පරීක්ෂණ හා බර වගකීම්' }, areas: [{ en: 'Career & status', si: 'වෘත්තිය හා තත්ත්වය' }, { en: 'Public reputation', si: 'මහජන කීර්තිය' }] },
  11: { label: { en: 'gains, income & networks', si: 'ලාභ, ආදායම හා සම්බන්ධතා ජාල' }, favorable: { en: 'income, fulfilled desires and powerful connections', si: 'ආදායම, ඉටු වූ ආශාවන් හා බලවත් සම්බන්ධතා' }, challenging: { en: 'unmet expectations and unreliable gains or friends', si: 'ඉටු නොවූ අපේක්ෂා හා විශ්වාස කළ නොහැකි ලාභ හෝ මිතුරන්' }, areas: [{ en: 'Income & gains', si: 'ආදායම හා ලාභ' }, { en: 'Friends & networks', si: 'මිතුරන් හා සම්බන්ධතා ජාල' }] },
  12: { label: { en: 'expenses, foreign lands & release', si: 'වියදම්, විදේශ රටවල් හා අත්හැරීම' }, favorable: { en: 'spiritual growth, rest and well-spent foreign or charitable expense', si: 'අධ්‍යාත්මික වර්ධනය, විවේකය හා නිසි ලෙස වැය කළ විදේශ හෝ පුණ්‍ය වියදම්' }, challenging: { en: 'rising expenses, isolation, disturbed sleep and losses', si: 'ඉහළ යන වියදම්, හුදෙකලාව, කැළඹුණු නින්ද හා පාඩු' }, areas: [{ en: 'Expenses & loss', si: 'වියදම් හා පාඩු' }, { en: 'Spirituality & rest', si: 'අධ්‍යාත්මිකත්වය හා විවේකය' }] },
};

const T = (b: Record<Lang, string>, lang: Lang) => b[lang];

export function planetLabelM(planetKey: string, lang: Lang): string {
  return planetName(planetKey.charAt(0).toUpperCase() + planetKey.slice(1).toLowerCase(), lang);
}

export const MONTHLY = {
  ingressTitle: (name: string, toName: string, houseFromMoon: number, lang: Lang) => lang === 'si'
    ? `${name} ${toName} රාශියට පිවිසේ — චන්ද්‍රයාගෙන් ${houseFromMoon} වන`
    : `${name} enters ${toName} — ${houseFromMoon}th from Moon`,
  ingressEffect: (
    name: string, fromName: string, toName: string, newLord: string,
    houseFromMoon: number, houseFromLagna: number,
    signifies: string, themeMLabel: string, orientation: string, themeLLabel: string, valence: number, lang: Lang,
  ) => lang === 'si'
    ? `${name} ${fromName} රාශියෙන් ඉවත්ව ${toName} රාශියට (${newLord} අධිපති) පිවිසෙයි, දැන් ඔබේ ජන්ම චන්ද්‍රයාගෙන් ${houseFromMoon} වන භාවය හා ලග්නයෙන් ${houseFromLagna} වන භාවය ගෝචරය කරයි. මෙය ${signifies} හි අවධානය ${themeMLabel} වෙත හරවා ${orientation} ගෙන එයි. ලග්නයෙන් එය ${themeLLabel} වර්ණවත් කරයි, එබැවින් ${name} මෙම රාශියේ සිටින තාක් එම කරුණු ${valence >= 0 ? 'වැලඳ ගන්න' : 'සම්බන්ධයෙන් සමබරව සිටින්න'}.`
    : `${name} leaves ${fromName} and moves into ${toName} (ruled by ${newLord}), now transiting your ${houseFromMoon}th house from the natal Moon and ${houseFromLagna}th from the Lagna. This shifts the focus of ${signifies} toward ${themeMLabel}, bringing ${orientation}. From the Lagna it colours ${themeLLabel}, so ${valence >= 0 ? 'lean into' : 'stay measured around'} those affairs while ${name} holds this sign.`,
  ingressThemeMain: (area: string, side: string, lang: Lang) => `${area}: ${capitalize(side, lang)}.`,
  ingressThemeSecondary: (area: string, name: string, lang: Lang) => lang === 'si'
    ? `${area}: ${name} මෙහි ගත කරන සති සඳහා පැහැදිලි තේමාවකි.`
    : `${area}: a clear theme for the weeks ${name} spends here.`,
  ingressThemeLagna: (area: string, themeLLabel: string, isCareer: boolean, lang: Lang) => lang === 'si'
    ? `${area} (ලග්නයෙන්): ${themeLLabel} ආශ්‍රිතව ${isCareer ? 'දෘශ්‍යමාන ක්‍රියාකාරකම්' : 'සැලකිය යුතු චලනයක්'}.`
    : `${area} (from Lagna): ${isCareer ? 'visible activity' : 'noticeable movement'} around ${themeLLabel}.`,

  retroTitle: (name: string, sign: string, lang: Lang) => lang === 'si' ? `${name} ${sign} රාශියේ වක්‍ර වේ` : `${name} turns retrograde in ${sign}`,
  retroEffect: (name: string, sign: string, houseFromMoon: number, signifies: string, themeMLabel: string, lang: Lang) => lang === 'si'
    ? `${name} ${sign} රාශියේ, ඔබේ චන්ද්‍රයාගෙන් ${houseFromMoon} වන භාවයේ වක්‍ර වේ. ${themeMLabel} හා ${signifies} හා බැඳුණු කරුණු මන්දගාමී වී, පසුපසට හැරී, යළි සලකා බැලීමට ඉල්ලයි. එය මාර්ගගාමී වන තෙක් මෙම ක්ෂේත්‍රයේ අලුත් කිසිවක් ආරම්භ කරනවාට වඩා යළි සලකා බැලීම, අලුත්වැඩියාව හා නැවත බැලීමට කැමති වන්න.`
    : `${name} stations retrograde in ${sign}, in your ${houseFromMoon}th house from the Moon. Matters of ${signifies} tied to ${themeMLabel} slow down, double back and ask to be revisited. Favour review, repair and revisiting rather than launching anything new in this area until it turns direct.`,
  retroTheme1: (area: string, lang: Lang) => lang === 'si' ? `${area}: අලුතින් ආරම්භ කරනවාට වඩා යළි සලකා බලා පිරිපහදු කරන්න.` : `${area}: revisit and refine rather than start fresh.`,
  retroTheme2: (themeMLabel: string, lang: Lang) => lang === 'si' ? `${themeMLabel} ආශ්‍රිතව ප්‍රමාද හා දෙවන සිතුවිලි අපේක්ෂා කරන්න.` : `Expect delays and second thoughts around ${themeMLabel}.`,

  directTitle: (name: string, sign: string, lang: Lang) => lang === 'si' ? `${name} ${sign} රාශියේ මාර්ගගාමී වේ` : `${name} turns direct in ${sign}`,
  directEffect: (name: string, sign: string, houseFromMoon: number, signifies: string, themeMLabel: string, lang: Lang) => lang === 'si'
    ? `${name} ${sign} රාශියේ, ඔබේ චන්ද්‍රයාගෙන් ${houseFromMoon} වන භාවයේ මාර්ගගාමී වේ. ${themeMLabel} හා ${signifies} ආශ්‍රිත ඉතිරි වූ කටයුතු නිරවුල් වී යළි ඉදිරියට යාමට පටන් ගනී. නතර වී තිබූ සැලසුම් වඩා හොඳ පැහැදිලිකමකින් යළි කරගෙන යා හැක.`
    : `${name} stations direct in ${sign}, in your ${houseFromMoon}th house from the Moon. The backlog around ${themeMLabel} and ${signifies} begins to clear and move forward again. Plans that were stalled can now be re-committed with better clarity.`,
  directTheme1: (area: string, lang: Lang) => lang === 'si' ? `${area}: ගම්‍යතාව නැවත එයි — ඉදිරියට යාමට හරි ආලෝකයයි.` : `${area}: momentum returns — green light to proceed.`,
  directTheme2: (themeMLabel: string, lang: Lang) => lang === 'si' ? `${themeMLabel} ආශ්‍රිත නතර වූ කරුණු විසඳෙන්නට පටන් ගනී.` : `Stalled matters of ${themeMLabel} start resolving.`,

  // Overview
  overviewEmpty: (monthLabel: string, lang: Lang) => lang === 'si'
    ? `${monthLabel} මාසයේ මන්දගාමී ග්‍රහයෝ තම රාශිවල රැඳී සිටිති — මෙම මාසයේ විශාල රාශි මාරුවීම් හෝ වක්‍ර/මාර්ගගාමී වීම් සිදු නොවන නිසා, ඔබේ කේන්දරයේ දැනටමත් ක්‍රියාත්මක තේමා තියුණු හැරවුමකින් තොරව දිගටම පවතී.`
    : `In ${monthLabel} the slow planets hold their signs — no major ingresses or stations land this month, so the themes already running in your chart simply continue without a sharp turn.`,
  overviewTone: (net: number, lang: Lang) => net > 1
    ? (lang === 'si' ? 'සමස්තයක් ලෙස මාසය සහායක පැත්තට නැඹුරුයි — වැසෙනවාට වඩා දොරටු විවර වේ.' : 'Overall the month leans supportive — more doors open than close.')
    : net < -1
      ? (lang === 'si' ? 'සමස්තයක් ලෙස මාසය ඉවසීම හා සැලකිල්ල ඉල්ලයි — ගෝචර කිහිපයක් ප්‍රතිලාභ දීමට පෙර ඝට්ටනය එක් කරයි.' : 'Overall the month asks for patience and care — several transits add friction before they add reward.')
      : (lang === 'si' ? 'සමස්තයක් ලෙස මාසය මිශ්‍රයි — ලාභ හා පරීක්ෂණ දළ වශයෙන් සමව එයි, එබැවින් වේලාව වැදගත් වේ.' : 'Overall the month is mixed — gains and tests arrive in roughly equal measure, so timing matters.'),
  overviewHeavy: (name: string, isIngress: boolean, toName: string, type: string, lang: Lang) => lang === 'si'
    ? ` වඩාත්ම වැදගත් වෙනස වන්නේ ${name} ${isIngress ? `${toName} රාශියට පිවිසීම` : (type === 'retrograde' ? 'වක්‍ර වීම' : 'මාර්ගගාමී වීම')}ය, එය දිගු කලක් ක්‍රියාත්මක තේමාවක් යළි සකසයි.`
    : ` The most significant shift is ${name} ${isIngress ? `entering ${toName}` : `turning ${type}`}, which resets a long-running theme.`,
  overviewMain: (monthLabel: string, count: number, ingresses: number, stations: number, good: number, tough: number, tone: string, heavyLine: string, lang: Lang) => lang === 'si'
    ? `${monthLabel} මාසයේ සැලකිය යුතු ගෝචර ${count}ක් ඇත (රාශි මාරු ${ingresses}ක්, වක්‍ර/මාර්ගගාමී ${stations}ක්): හිතකර ${good}ක් හා වඩා දුෂ්කර ${tough}ක්. ${tone}${heavyLine}`
    : `In ${monthLabel} there ${count === 1 ? 'is' : 'are'} ${count} notable transit${count === 1 ? '' : 's'} (${ingresses} sign change${ingresses === 1 ? '' : 's'}, ${stations} station${stations === 1 ? '' : 's'}): ${good} broadly favourable and ${tough} more demanding. ${tone}${heavyLine}`,
};

export function capitalize(s: string, lang: Lang): string {
  if (lang === 'si') return s; // Sinhala has no letter case
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export { T as pickM };
export function signifies(planetKey: string, lang: Lang): string { return PLANET_SIGNIFIES[planetKey]?.[lang] ?? ''; }
export function houseTheme(house: number, lang: Lang) {
  const h = HOUSE_THEME[house];
  return {
    label: h.label[lang], favorable: h.favorable[lang], challenging: h.challenging[lang],
    areas: [h.areas[0][lang], h.areas[1][lang]] as [string, string],
  };
}
export function monthLabelFor(start: Date, lang: Lang): string {
  return start.toLocaleDateString(lang === 'si' ? 'si-LK' : 'en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}
export function localRashi(index: number, lang: Lang): string { return rashiName(index, lang); }
