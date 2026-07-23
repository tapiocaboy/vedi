/** Bilingual prose for the natal report orchestrator (natal.ts). */

import type { Bi, Lang } from '../i18n';

// ─── Per-sign rising (Lagna) character ─────────────────────────────────────

export const LAGNA_TRAITS: Record<number, Bi> = {
  0: { en: 'With Aries (Mesha) rising you meet life head-on — pioneering, energetic, competitive, and quick to act. A strong Mars makes you a natural starter who thrives on challenge but must temper impatience.', si: 'මේෂ ලග්නයෙන් උපන් ඔබ ජීවිතයට ඍජුව මුහුණ දෙයි — පුරෝගාමී, ශක්තිමත්, තරඟකාරී හා ඉක්මනින් ක්‍රියා කරන. ප්‍රබල කුජ ඔබ අභියෝගවලින් දියුණු වන ස්වභාවික ආරම්භකයෙකු කරන නමුත් නොඉවසිලිමත්කම හික්මවා ගත යුතුය.' },
  1: { en: 'With Taurus (Vrishabha) rising you are steady, patient, and sensual — you value comfort, beauty, and security. Ruled by Venus, you build slowly and lastingly, though stubbornness can set in.', si: 'වෘෂභ ලග්නයෙන් උපන් ඔබ ස්ථාවර, ඉවසිලිවන්ත හා ඉන්ද්‍රියාශ්‍රිතයි — ඔබ පහසුව, සුන්දරත්වය හා සුරක්ෂිතභාවය අගය කරයි. ශුක්‍රගෙන් පාලනය වන ඔබ සෙමින් හා කල් පවතින ලෙස ගොඩනඟයි, එහෙත් මුරණ්ඩුකම ඇති විය හැක.' },
  2: { en: 'With Gemini (Mithuna) rising you are curious, communicative, and adaptable — a quick mind that loves variety. Ruled by Mercury, you excel at words and ideas but can scatter your focus.', si: 'මිථුන ලග්නයෙන් උපන් ඔබ කුතුහලයෙන් යුත්, සන්නිවේදනශීලී හා හැඩ ගැසෙන සුළුයි — විවිධත්වයට ප්‍රිය කරන ඉක්මන් මනසක්. බුධගෙන් පාලනය වන ඔබ වචන හා අදහස්වල විශිෂ්ට වන නමුත් අවධානය විසිර යා හැක.' },
  3: { en: 'With Cancer (Kataka) rising you are sensitive, nurturing, and intuitive — deeply tied to home, family, and emotional security. Ruled by the Moon, your moods colour your whole outlook.', si: 'කටක ලග්නයෙන් උපන් ඔබ සංවේදී, පෝෂණය කරන හා ඉවෙන් දැනගන්නා — නිවස, පවුල හා හැඟීම්බර සුරක්ෂිතභාවය සමඟ ගැඹුරින් බැඳුණු. චන්ද්‍රයාගෙන් පාලනය වන ඔබේ මනෝභාවයන් ඔබේ මුළු දෘෂ්ටියම වර්ණවත් කරයි.' },
  4: { en: 'With Leo (Simha) rising you are dignified, warm, and naturally commanding — you seek recognition and lead from the heart. Ruled by the Sun, pride is your strength and your test.', si: 'සිංහ ලග්නයෙන් උපන් ඔබ අභිමානවත්, උණුසුම් හා ස්වභාවිකවම අණ දෙන — ඔබ පිළිගැනීම සොයන අතර හදවතින් නායකත්වය දෙයි. සූර්යයාගෙන් පාලනය වන ඔබට ආඩම්බරය ඔබේ ශක්තිය මෙන්ම ඔබේ පරීක්ෂණය ද වේ.' },
  5: { en: 'With Virgo (Kanya) rising you are analytical, precise, and service-minded — discerning and health-conscious. Ruled by Mercury, you perfect details but can over-criticise yourself and others.', si: 'කන්‍යා ලග්නයෙන් උපන් ඔබ විශ්ලේෂණාත්මක, නිරවද්‍ය හා සේවා මානසිකත්වයෙන් යුත් — විචක්ෂණ හා සෞඛ්‍යය ගැන සැලකිලිමත්. බුධගෙන් පාලනය වන ඔබ සියුම් විස්තර පරිපූර්ණ කරන නමුත් ඔබවම හා අන් අයවම අධික ලෙස විවේචනය කළ හැක.' },
  6: { en: 'With Libra (Tula) rising you are gracious, diplomatic, and partnership-oriented — you seek balance, beauty, and fairness. Ruled by Venus, harmony matters, though indecision can stall you.', si: 'තුලා ලග්නයෙන් උපන් ඔබ අලංකාර, රාජ්‍ය තාන්ත්‍රික හා හවුල්කාරිත්ව නැඹුරු — ඔබ සමතුලිතතාව, සුන්දරත්වය හා සාධාරණත්වය සොයයි. ශුක්‍රගෙන් පාලනය වන ඔබට සමගිය වැදගත් වුවත් තීරණ ගත නොහැකි වීම ඔබ නතර කළ හැක.' },
  7: { en: 'With Scorpio (Vrischika) rising you are intense, magnetic, and private — driven to probe beneath the surface and transform. Ruled by Mars, your willpower is formidable.', si: 'වෘශ්චික ලග්නයෙන් උපන් ඔබ තීව්‍ර, චුම්බක හා පෞද්ගලික — මතුපිට යටින් සොයා බැලීමට හා පරිවර්තනය වීමට පෙළඹුණු. කුජගෙන් පාලනය වන ඔබේ අධිෂ්ඨාන ශක්තිය බලවත්ය.' },
  8: { en: 'With Sagittarius (Dhanu) rising you are optimistic, philosophical, and freedom-loving — a seeker of meaning and far horizons. Ruled by Jupiter, you inspire but may overpromise.', si: 'ධනු ලග්නයෙන් උපන් ඔබ ශුභවාදී, දාර්ශනික හා නිදහසට ප්‍රිය — අර්ථය හා දුර ක්ෂිතිජ සොයන්නෙක්. ගුරුගෙන් පාලනය වන ඔබ ආශ්වාදනය කරන නමුත් අධික ලෙස පොරොන්දු දිය හැක.' },
  9: { en: 'With Capricorn (Makara) rising you are disciplined, ambitious, and responsible — a patient builder of lasting structures. Ruled by Saturn, you rise through perseverance.', si: 'මකර ලග්නයෙන් උපන් ඔබ විනයගරුක, අභිලාෂකාමී හා වගකීම් සහගත — කල් පවතින ව්‍යුහ ගොඩනඟන ඉවසිලිවන්ත අයෙක්. ශනිගෙන් පාලනය වන ඔබ නොපසුබට උත්සාහයෙන් නැගී සිටී.' },
  10: { en: 'With Aquarius (Kumbha) rising you are independent, humanitarian, and original — drawn to ideas, groups, and reform. Ruled by Saturn, you think ahead of your time.', si: 'කුම්භ ලග්නයෙන් උපන් ඔබ ස්වාධීන, මානුෂීය හා නවෝත්පාදනශීලී — අදහස්, කණ්ඩායම් හා ප්‍රතිසංස්කරණ වෙත ඇදුණු. ශනිගෙන් පාලනය වන ඔබ ඔබේ කාලයට වඩා ඉදිරියෙන් සිතයි.' },
  11: { en: 'With Pisces (Meena) rising you are compassionate, imaginative, and spiritual — porous to the moods around you. Ruled by Jupiter, you dream widely and feel deeply.', si: 'මීන ලග්නයෙන් උපන් ඔබ කරුණාවන්ත, පරිකල්පනාශීලී හා අධ්‍යාත්මික — ඔබ අවට මනෝභාවයන්ට සංවේදී. ගුරුගෙන් පාලනය වන ඔබ පුළුල් ලෙස සිහින දකින අතර ගැඹුරින් හඟියි.' },
};

// ─── Element & modality words ──────────────────────────────────────────────

export const ELEMENT_WORD: Record<string, Bi> = {
  Fire: { en: 'Fire', si: 'ගිනි' }, Earth: { en: 'Earth', si: 'පෘථිවි' },
  Air: { en: 'Air', si: 'වායු' }, Water: { en: 'Water', si: 'ජල' },
};

export const MODALITY_WORD: Record<string, Bi> = {
  Movable: { en: 'Movable', si: 'චර' }, Fixed: { en: 'Fixed', si: 'ස්ථිර' }, Dual: { en: 'Dual', si: 'ද්විස්වභාව' },
};

const ELEMENT_NATURE: Record<string, Bi> = {
  Fire: { en: 'active, inspired and pioneering', si: 'ක්‍රියාශීලී, ආශ්වාදිත හා පුරෝගාමී' },
  Earth: { en: 'grounded, practical and reliable', si: 'යථාර්ථවාදී, ප්‍රායෝගික හා විශ්වාසදායක' },
  Air: { en: 'mental, social and communicative', si: 'මානසික, සමාජශීලී හා සන්නිවේදනශීලී' },
  Water: { en: 'emotional, intuitive and adaptive', si: 'හැඟීම්බර, ඉවෙන් දැනගන්නා හා හැඩ ගැසෙන' },
};

const MODALITY_NATURE: Record<string, Bi> = {
  Movable: { en: 'initiate easily and prefer momentum and change', si: 'පහසුවෙන් මුල පුරන අතර ගම්‍යතාව හා වෙනස්කම්වලට කැමතියි' },
  Fixed: { en: 'hold firm, build steadily and resist being rushed', si: 'ස්ථිරව සිට, ස්ථාවරව ගොඩනඟා, ඉක්මන් කරනු ලැබීමට විරෝධය දක්වයි' },
  Dual: { en: 'adapt, mediate and move fluidly between options', si: 'හැඩ ගැසී, මැදිහත් වී, විකල්ප අතර නම්‍යශීලීව චලනය වේ' },
};

export function elementLabel(el: string, lang: Lang): string { return ELEMENT_WORD[el] ? (lang === 'si' ? ELEMENT_WORD[el].si : ELEMENT_WORD[el].en) : el; }
export function modalityLabel(m: string, lang: Lang): string { return MODALITY_WORD[m] ? (lang === 'si' ? MODALITY_WORD[m].si : MODALITY_WORD[m].en) : m; }

// ─── Section headings ──────────────────────────────────────────────────────

export const H = {
  risingSign: { en: 'Your rising sign', si: 'ඔබේ ලග්න රාශිය' } as Bi,
  elementMode: { en: 'Element & mode', si: 'මූලද්‍රව්‍යය හා ස්වභාවය' } as Bi,
  chartRuler: { en: 'Your chart ruler', si: 'ඔබේ කේන්දර අධිපතියා' } as Bi,
  whyBirthStar: { en: 'Why your birth star matters', si: 'ඔබේ ජන්ම නක්ෂත්‍රය වැදගත් වන්නේ ඇයි' } as Bi,
  whatItGoverns: { en: 'What it governs', si: 'එය පාලනය කරන දෑ' } as Bi,
  strengthsToLean: { en: 'Strengths to lean on', si: 'රැඳී සිටිය හැකි ශක්තීන්' } as Bi,
  whatToWatch: { en: 'What to watch', si: 'අවධානය යොමු කළ යුතු දෑ' } as Bi,
  strengthInChart: { en: 'Strength in your chart', si: 'ඔබේ කේන්දරයේ ශක්තිය' } as Bi,
  dignityRole: { en: 'Dignity & role', si: 'බලය හා භූමිකාව' } as Bi,
  retrogradeEffect: { en: 'Retrograde effect', si: 'වක්‍ර බලපෑම' } as Bi,
  combustion: { en: 'Combustion', si: 'අස්තංගතය' } as Bi,
  debilitationCancelled: { en: 'Debilitation cancelled', si: 'නීචත්වය භංග විය' } as Bi,
  supportiveRemedy: { en: 'Supportive remedy', si: 'සහායක ප්‍රතිකර්මය' } as Bi,
  whatAreaCovers: { en: 'What this area of life covers', si: 'මෙම ජීවන ක්ෂේත්‍රය ආවරණය කරන දෑ' } as Bi,
  signOnHouse: { en: 'The sign on this house', si: 'මෙම භාවයේ රාශිය' } as Bi,
  planetsPlacedHere: { en: 'Planets placed here', si: 'මෙහි පිහිටි ග්‍රහයෝ' } as Bi,
  combinedEffect: { en: 'Combined effect', si: 'ඒකාබද්ධ බලපෑම' } as Bi,
};

export const NAK_ITEM_HEADING: Record<string, Bi> = {
  overview: { en: 'Your personality', si: 'ඔබේ පෞරුෂය' },
  lord: { en: 'Ruling planet', si: 'අධිපති ග්‍රහයා' },
  gana: { en: 'Temperament (Gana)', si: 'ස්වභාවය (ගණ)' },
  pada: { en: 'Birth quarter (Pada)', si: 'ජන්ම කාර්තුව (පාද)' },
  deity: { en: 'Presiding deity', si: 'අධිපති දෙවියා' },
  symbol: { en: 'Symbol', si: 'සංකේතය' },
};

// ─── Sentence frames ───────────────────────────────────────────────────────

export const NATAL = {
  lagnaTitle: (english: string, sanskrit: string, lang: Lang) =>
    lang === 'si' ? `ලග්නය — ${sanskrit} (${english}) උදය වේ` : `Ascendant — ${english} (${sanskrit}) rising`,
  lagnaSubtitle: (lord: string, element: string, modality: string, lang: Lang) =>
    lang === 'si' ? `කේන්දර අධිපති ${lord} · ${element} · ${modality}` : `Chart ruler ${lord} · ${element} · ${modality}`,
  rulerBadge: (lord: string, lang: Lang) => lang === 'si' ? `අධිපති: ${lord}` : `Ruler: ${lord}`,
  lagnaSummary: (english: string, modality: string, element: string, lang: Lang) =>
    lang === 'si'
      ? `ඔබේ උදය රාශිය ඔබ ලෝකයට මුහුණ දෙන දෘෂ්ටිකෝණය සකසන අතර අනෙක් සෑම භාවයක්ම රාමුගත කරයි. ${english} ඔබට ${modality} ${element} ස්වභාවයක් ලබා දෙයි.`
      : `Your rising sign sets the lens through which you meet the world and frames every other house. ${english} gives you a ${modality.toLowerCase()} ${element.toLowerCase()} nature.`,
  elementModeBody: (element: string, modality: string, lang: Lang) => {
    const elLabel = elementLabel(element, lang);
    const elNature = ELEMENT_NATURE[element] ? (lang === 'si' ? ELEMENT_NATURE[element].si : ELEMENT_NATURE[element].en) : '';
    const mLabel = modalityLabel(modality, lang);
    const mNature = MODALITY_NATURE[modality] ? (lang === 'si' ? MODALITY_NATURE[modality].si : MODALITY_NATURE[modality].en) : '';
    return lang === 'si'
      ? `${elLabel} රාශියක් ඔබේ මූලික ආශාව ${elNature} කරයි. ${mLabel} වීම යනු ඔබ ${mNature} බවයි.`
      : `A ${elLabel} sign makes your core drive ${elNature}. Being ${mLabel} means you ${mNature}.`;
  },
  chartRulerBody: (lord: string, house: string, dignity: string, lang: Lang) =>
    lang === 'si'
      ? `${lord} ඔබේ ලග්නයට අධිපති වන අතර එය ඔබේ කේන්දරයේ වැදගත්ම ග්‍රහයා වේ. එය ඔබේ ${house} සිටින අතර ${dignity}ය — එබැවින් ${house} කරුණු ඔබේ ජීවිත දිශාවට කේන්ද්‍රීය වන අතර ${lord}ගේ තත්ත්වය ඔබේ සමස්ත ජීවශක්තියට හා වාසනාවට ප්‍රබලව බලපායි.`
      : `${lord} rules your Ascendant and is the single most important planet in your chart. It sits in your ${house} and is ${dignity.toLowerCase()} — so the affairs of the ${house} become central to your life direction, and ${lord}'s condition strongly colours your overall vitality and fortune.`,
  nakTitle: (name: string, pada: number, lang: Lang) => lang === 'si' ? `${name} නක්ෂත්‍රයේ චන්ද්‍රයා (පාද ${pada})` : `Moon in ${name} (Pada ${pada})`,
  nakSubtitle: (lord: string, rashi: string, lang: Lang) => lang === 'si' ? `ජන්ම නක්ෂත්‍රය · ${lord}ගෙන් පාලනය · ${rashi}` : `Birth star · ruled by ${lord} · ${rashi}`,
  nakLordBadge: (lord: string, lang: Lang) => lang === 'si' ? `අධිපති: ${lord}` : `Lord: ${lord}`,
  nakPadaBadge: (pada: number, lang: Lang) => lang === 'si' ? `පාද ${pada}` : `Pada ${pada}`,
  nakSummary: (lang: Lang) => lang === 'si'
    ? 'ඔබේ චන්ද්‍රයාගේ නක්ෂත්‍රය ඔබේ හැඟීම්බර ස්වභාවය හා සහජ මනස විස්තර කරන අතර, ඔබේ ජීවිතයේ පරිච්ඡේද සකසන මුළු විංශෝත්තරී දශා කාලරේඛාවම එයින් රෝපණය වේ.'
    : "Your Moon's nakshatra describes your emotional nature and instinctive mind, and it seeds the entire Vimshottari Dasha timeline that schedules your life's chapters.",
  nakWhyBody: (name: string, symbol: string, deity: string, lang: Lang) => lang === 'si'
    ? `චන්ද්‍රයා ${name} හි පිහිටා ඇත, එහි සංකේතය ${symbol} වන අතර අධිපති දෙවියා ${deity} වේ. මෙම නක්ෂත්‍රය ඔබේ හැඟීම්බර ස්වභාවය හා සහජ මනස හැඩ ගසන අතර, ඔබේ ජීවිතයේ පරිච්ඡේද සකසන මුළු විංශෝත්තරී දශා කාලරේඛාවම එයින් රෝපණය වේ.`
    : `The Moon occupies ${name}, symbolised by the ${symbol.toLowerCase()} and presided over by ${deity}. This star shapes your emotional nature and instinctive mind, and it seeds the entire Vimshottari Dasha timeline that schedules your life's chapters.`,
  planetTitle: (planet: string, rashi: string, houseName: string, lang: Lang) => lang === 'si' ? `${rashi} හි ${planet} · ${houseName}` : `${planet} in ${rashi} · ${houseName}`,
  planetSubtitle: (english: string, deg: string, dignity: string, retro: boolean, lang: Lang) =>
    lang === 'si' ? `${english} ${deg}° · ${dignity}${retro ? ' · වක්‍ර' : ''}` : `${english} ${deg}° · ${dignity}${retro ? ' · Retrograde' : ''}`,
  planetSummary: (planet: string, keywords: string, houseName: string, verdict: string, functional: string, lang: Lang) =>
    lang === 'si'
      ? `${planet} ${keywords} දරයි. ඔබේ ${houseName} පිහිටා, එය ${verdict} වන අතර ඔබේ ලග්නයට ${functional} ග්‍රහයෙකු ලෙස ක්‍රියා කරයි.`
      : `${planet} carries ${keywords}. Placed in your ${houseName}, it is ${verdict.toLowerCase()} and acts as a ${functional.toLowerCase()} for your Ascendant.`,
  whyMattersHeading: (houseName: string, lang: Lang) => lang === 'si' ? `ඔබේ ${houseName} තුළ එය වැදගත් වන්නේ ඇයි` : `Why it matters in your ${houseName}`,
  inYourHouseHeading: (houseName: string, lang: Lang) => lang === 'si' ? `ඔබේ ${houseName} තුළ` : `In your ${houseName}`,
  inYourHouseBody: (planet: string, houseName: string, theme: string, keywords: string, rules: string, lang: Lang) =>
    lang === 'si'
      ? `${planet} ඔබේ ${houseName} (${theme}) පිහිටා, එහි ${keywords} ශක්තිය ${rules} වෙත යොමු කරයි.`
      : `${planet} sits in your ${houseName} (${theme}), directing its energy of ${keywords} into ${rules}.`,
  dignityRoleBody: (dignityDesc: string, functionalDesc: string) => `${dignityDesc} ${functionalDesc}`,
  supportiveRemedyBody: (parts: string[]) => parts.join(' · '),
  gemstoneLabel: (v: string, lang: Lang) => lang === 'si' ? `මැණික: ${v}` : `Gemstone: ${v}`,
  mantraLabel: (v: string, lang: Lang) => lang === 'si' ? `මන්ත්‍රය: ${v}` : `Mantra: ${v}`,
  retrogradeBadge: { en: 'Retrograde', si: 'වක්‍ර' } as Bi,
  combustBadge: { en: 'Combust', si: 'අස්තංගත' } as Bi,
  neechaBhangaBadge: { en: 'Neecha Bhanga', si: 'නීච භංග' } as Bi,
  // House line
  signOnHouseBody: (rashi: string, english: string, houseLabel: string, lord: string, lang: Lang) =>
    lang === 'si'
      ? `${rashi} (${english}) ඔබේ ${houseLabel} වැටෙන නිසා, එහි අධිපති ${lord} මෙම කරුණු පාලනය කරයි. ${lord} පිහිටා ඇති ආකාරය මෙම කරුණු ඉදිරියට යන ආකාරය තීරණය කරයි.`
      : `${rashi} (${english}) falls on your ${houseLabel}, so its ruler ${lord} governs these matters. The way ${lord} is placed decides how these affairs unfold.`,
  whereRulerHeading: (lord: string, lang: Lang) => lang === 'si' ? `අධිපතියා (${lord}) ගිය තැන` : `Where the ruler (${lord}) went`,
  whereRulerBody: (lordHouseDesc: string, dignity: string, tone: 'good' | 'bad' | 'neutral', lang: Lang) => {
    const effect = tone === 'good'
      ? (lang === 'si' ? 'සහාය දී ශක්තිමත් කරයි' : 'supports and strengthens')
      : tone === 'bad'
        ? (lang === 'si' ? 'පරීක්ෂාවට ලක් කර සංකීර්ණ කරයි' : 'tests and complicates')
        : (lang === 'si' ? 'මිශ්‍ර ප්‍රතිඵල දෙයි' : 'gives mixed results to');
    return lang === 'si'
      ? `${lordHouseDesc} එහි එහි බලය ${dignity}ය, එය මෙම භාවයේ තේමා ${effect}.`
      : `${lordHouseDesc} Its dignity there is ${dignity.replace('-', ' ')}, which ${effect} this house's themes.`;
  },
  planetHereBullet: (planet: string, effect: string) => `${planet}: ${effect}`,
  noPlanetBody: (lord: string, lang: Lang) => lang === 'si'
    ? `මෙම භාවයේ කිසිදු ග්‍රහයෙක් නොමැති නිසා, එහි ප්‍රතිඵල ප්‍රධාන වශයෙන් එහි අධිපති ${lord} (ඉහත විස්තර කර ඇත) හා එය බලන ඕනෑම ග්‍රහයෙකු හරහා ගලා යයි. හිස් භාවයක් දුර්වල භාවයක් නොවේ — එය එහි අධිපතියා හරහා කියවන්න.`
    : `No planet occupies this house, so its results flow mainly through its ruler ${lord} (described above) and any planets aspecting it. An empty house is not a weak house — read it through its lord.`,
  houseTitle: (name: string, theme: string, lang: Lang) => lang === 'si' ? `${name} — ${theme}` : `${name} — ${theme}`,
  houseSubtitle: (rashi: string, lord: string, planets: string | null, lang: Lang) =>
    lang === 'si'
      ? `${rashi} · ${lord}ගෙන් පාලනය${planets ? ` · ${planets}` : ' · හිස්'}`
      : `${rashi} · ruled by ${lord}${planets ? ` · ${planets}` : ' · empty'}`,
  houseSummary: (houseName: string, rules: string, rashi: string, lord: string, lordHouseOrdinal: string, lang: Lang) =>
    lang === 'si'
      ? `ඔබේ ${houseName} ${rules} ආවරණය කරයි. මෙහි ${rashi} සමඟ, එහි අධිපති ${lord} ${lordHouseOrdinal} සිටී.`
      : `Your ${houseName} covers ${rules}. With ${rashi} here, its ruler ${lord} sits in the ${lordHouseOrdinal}.`,
  rulerHouseBadge: (lord: string, houseOrd: string, lang: Lang) => lang === 'si' ? `අධිපති ${lord} → ${houseOrd}` : `Ruler ${lord} → ${houseOrd}`,
  planetsCountBadge: (count: number, lang: Lang) => lang === 'si' ? `ග්‍රහයෝ ${count}` : `${count} planet${count > 1 ? 's' : ''}`,
  emptyOrdinal: { en: '—', si: '—' } as Bi,
  sameHouseWord: { en: 'same', si: 'එම' } as Bi,
};

/** "10th house" — ordinal house label matching what natal.ts used inline. */
export function houseOrdinal(n: number, lang: Lang): string {
  if (n < 1 || n > 12) return '';
  if (lang === 'si') return `${n} වන භාවය`;
  const en = ['', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];
  return `${en[n]} House`;
}

export function houseOrdinalShort(n: number, lang: Lang): string {
  if (n < 1 || n > 12) return '';
  if (lang === 'si') return `${n} වන`;
  const en = ['', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];
  return en[n];
}
