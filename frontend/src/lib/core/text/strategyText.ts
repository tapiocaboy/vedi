/** Bilingual prose for the antardasha period-strategy playbook (periodStrategy.ts). */

import { type Lang, planetName, houseLabel, joinAnd } from '../i18n';
import { HOUSE_DISPLAY } from './planetaryText';

/** "9th house of fortune and 11th house of gains" — localised. */
export function housePhrase(houses: number[], lang: Lang): string {
  const parts = houses.map(h => {
    const theme = (lang === 'si' ? HOUSE_DISPLAY[h].theme.si : HOUSE_DISPLAY[h].theme.en).toLowerCase();
    return lang === 'si' ? `${theme} වන ${houseLabel(h, lang)}` : `${houseLabel(h, lang)} of ${theme}`;
  });
  return joinAnd(parts, lang);
}

export const DIGNITY_PHRASE: Record<string, Record<Lang, string>> = {
  exalted: { en: 'exalted', si: 'උච්ච' },
  'own-sign': { en: 'in its own sign', si: 'ස්වකීය රාශියේ' },
  'friend-sign': { en: "in a friend's sign", si: 'මිත්‍ර රාශියක' },
  'neutral-sign': { en: 'in a neutral sign', si: 'සම රාශියක' },
  'enemy-sign': { en: "in an enemy's sign", si: 'ශතෘ රාශියක' },
  debilitated: { en: 'debilitated', si: 'නීච' },
};

export const STRATEGY = {
  dispositionClause: (md: string, ad: string, _house: number, houseLabelStr: string, shash: boolean, lang: Lang) => {
    if (shash) {
      return lang === 'si'
        ? ` හේතුව ව්‍යුහාත්මකයි: ${ad} ඔබේ කේන්දරයේ ${md}ගෙන් ${houseLabelStr} සිටී, එමගින් අධිපතීන් දෙදෙනා සම්භාව්‍ය ග්‍රන්ථ වඩාත්ම බාධිත ලෙස සලකන 6-8 අක්ෂයේ තබයි.`
        : ` The reason is structural: ${ad} sits in the ${houseLabelStr} from ${md}, putting the two lords on the 6-8 axis that the classics treat as the most obstructed pairing.`;
    }
    return lang === 'si'
      ? ` හේතුව ව්‍යුහාත්මකයි: ${ad} ඔබේ කේන්දරයේ ${md}ගෙන් ${houseLabelStr} සිටී, එය අන්තර් දශාවක් ඵල දෙන ආකාරය තීරණය කරයි.`
      : ` The reason is structural: ${ad} sits in the ${houseLabelStr} from ${md} in your chart, which is what governs how a sub-period delivers.`;
  },

  consolidateHeadline: { en: 'Consolidation, not accumulation', si: 'රැස්කිරීම නොව තහවුරු කිරීම' },
  accumulateHeadline: { en: 'Acquisition is supported — press the advantage', si: 'ලබා ගැනීමට සහාය ඇත — වාසිය භාවිත කරන්න' },
  mixedHeadline: { en: 'Mixed current — selectivity beats volume', si: 'මිශ්‍ර ධාරාව — ප්‍රමාණයට වඩා තෝරා බේරා ගැනීම වැදගත්' },

  separativeNote: (planets: string[], lang: Lang) => {
    if (planets.length === 0) return '';
    const subj = planets.length === 2
      ? (lang === 'si' ? `${planets[0]} හා ${planets[1]} දෙකම` : `Both ${planets[0]} and ${planets[1]} are`)
      : (lang === 'si' ? `${planets[0]}` : `${planets[0]} is`);
    return lang === 'si'
      ? `${subj} ස්වභාවයෙන් වෙන් කරන ග්‍රහයෝ — එකතු කරනවාට වඩා අඩු කරති. `
      : `${subj} separative by nature — subtracting rather than adding. `;
  },

  consolidateBody: (md: string, ad: string, score: number, sepNote: string, dispClause: string, lang: Lang) => lang === 'si'
    ? `${md}–${ad} ලබා ගැනීමට හිතකර නැත (සම්භාව්‍ය කියවීමේ ${score}/10). ${sepNote}මෙම ධාරාවට එරෙහිව අමු ලාභ සඳහා තල්ලු කිරීම සාමාන්‍යයෙන් කලකිරීම හා බලහත්කාර පාඩු ඇති කරයි.${dispClause} මෙහි ලාභයේ බුද්ධිමත් අර්ථය නම් තහවුරු කිරීම හා ස්ථානගත වීමයි: ඔබ දැන් තැන්පත් කරන පදනම ඊළඟ කාලයේ ප්‍රතිඵල දෙයි. මෙය අස්වැන්න නෙළන තැන නොව, ක්ෂේත්‍රය පිරිසිදු කර බීජ රෝපණය කරන තැනයි.`
    : `${md}–${ad} does not favour acquisition (${score}/10 on the classical reading). ${sepNote}Pushing for raw gain against this current usually produces frustration and forced losses.${dispClause} The intelligent definition of profit here is consolidation and positioning: you bank ground now that pays out in the next period. This is where you clear the field and plant, not where you harvest.`,

  accumulateBody: (md: string, ad: string, score: number, houseNote: string, dispClause: string, lang: Lang) => lang === 'si'
    ? `${md}–${ad} ධාරාවට එරෙහිව නොව එය සමඟ ගමන් කරයි (සම්භාව්‍ය කියවීමේ ${score}/10).${dispClause}${houseNote} මෙය මැළිකම් නොකර කැපවිය යුතු කාලයකි. මෙහි අවදානම පාඩුව නොව අඩුවෙන් භාවිත කිරීමයි: මෙවැනි කාල වැසී යන අතර, ඒවා තුළ ඔබ ආරම්භ නොකළ දේ පසුව සැලකිය යුතු ලෙස දුෂ්කර වේ.`
    : `${md}–${ad} runs with the current rather than against it (${score}/10 on the classical reading).${dispClause}${houseNote} This is a period to commit rather than hedge. The risk here is not loss but under-use: periods like this close, and what you did not start during them becomes considerably harder afterwards.`,

  accumulateHouseNote: (ad: string, phrase: string, lang: Lang) => lang === 'si'
    ? ` ${ad} ඔබේ ${phrase} අධිපති වන නිසා, ලාභය විශේෂයෙන් එහි ලැබේ.`
    : ` ${ad} rules your ${phrase}, so the gain lands there specifically.`,

  mixedBody: (md: string, ad: string, score: number, dispClause: string, lang: Lang) => lang === 'si'
    ? `${md}–${ad} දිශා දෙකකට අදියි (සම්භාව්‍ය කියවීමේ ${score}/10): එහි කොටස් සැබවින්ම ලබා ගැනීමට සහාය වන අතර කොටස් අඩු කරයි.${dispClause} සම්පූර්ණ ශුභවාදය හා සම්පූර්ණ ප්‍රවේශම යන දෙකම මෙහි වැරදිය. ප්‍රයෝජනවත් උපාය නම් තෝරා බේරා ගැනීමයි — පහත සහායක කවුළු තුළ තීරණාත්මක පියවර සංකේන්ද්‍රණය කර, බර කවුළු පාඩු වැළැක්වීම ලාභය වන ආරක්ෂක බිම් ලෙස සලකන්න.`
    : `${md}–${ad} pulls in two directions (${score}/10 on the classical reading): parts of it genuinely support acquisition and parts of it subtract.${dispClause} Blanket optimism and blanket caution are both wrong here. The usable strategy is selectivity — concentrate decisive moves inside the supported windows below, and treat the heavy windows as defensive ground where the profit is what you avoid losing.`,

  actionReason: (bits: string[], lang: Lang) => {
    const joined = joinAnd(bits, lang);
    return lang === 'si'
      ? `${joined} — මෙම කවුළුව හරහා ක්‍රියා කරන්න: තීරණ අවසන් කරන්න, අත්සන් කළ යුතු දේ අත්සන් කරන්න, ගොඩනැගූ දේ නිකුත් කරන්න.`
      : `${joined} — act through this window: finalise decisions, sign what needs signing, ship what you have built.`;
  },
  actionBitDignity: (lord: string, dignity: string, lang: Lang) => lang === 'si' ? `${lord} ජන්මයේදී ${dignity} වේ` : `${lord} is ${dignity} natally`,
  actionBitYogakaraka: { en: 'it is your yogakaraka', si: 'එය ඔබේ යෝගකාරකයාය' },
  actionBitRules: (phrase: string, lang: Lang) => lang === 'si' ? `එය ඔබේ ${phrase} අධිපතියාය` : `it rules your ${phrase}`,
  actionBitClean: (lord: string, lang: Lang) => lang === 'si' ? `${lord} මෙහි ජන්ම දෝෂයකින් තොරව ගමන් කරයි` : `${lord} runs without natal affliction here`,

  defensiveReasonSep: (lord: string, lang: Lang) => lang === 'si'
    ? `${lord} එකතු කරනවාට වඩා අඩු කරයි. ලැබෙන ලාභය සැබෑ නමුත් ආරක්ෂකයි: මළ බර ඉවත් කරන්න, තවදුරටත් වටිනාකමක් නැති බැඳීම්වලින් ඉවත් වන්න, මූල්‍ය පිරිසිදු කරන්න, කාලය හෝ මුදල් නාස්ති කරන බැඳීම් අවසන් කරන්න. ඔබ නවත්වන පාඩුව මෙම කවුළුවේ ලාභයයි.`
    : `${lord} subtracts rather than adds. The gain available is real but defensive: cut dead weight, exit obligations that no longer earn their keep, clean up finances, close commitments that leak time or money. What you stop losing is this window's profit.`,
  defensiveReasonPile: (lang: Lang) => lang === 'si'
    ? `මෙහි එකවර ස්තර කිහිපයක් එක් වන නිසා, දින දර්ශනය යෝජනා කරනවාට වඩා සිදුවීම් තදින් වැදෙයි. සංචිත තබා ගන්න, ආපසු හැරවිය නොහැකි බැඳීම් වළක්වන්න, ප්‍රාග්ධනය හෝ විශ්වසනීයත්වය යළි කැප කිරීමට පෙර කවුළුව පහ වී යාමට ඉඩ දෙන්න.`
    : `Several layers converge here at once, so events land harder than the calendar suggests. Hold reserves, avoid irreversible commitments, and let the window pass before re-committing capital or credibility.`,

  deepWorkFocus: {
    Saturn: { en: 'sustained, unglamorous mastery — the hard problem you keep deferring, structured and finished', si: 'අඛණ්ඩ, විචිත්‍ර නොවන ප්‍රවීණත්වය — ඔබ නිතර කල් දමන දුෂ්කර ගැටලුව, ව්‍යුහගත කර නිම කරන ලද' },
    Ketu: { en: 'research, investigation, and specialisation to the point where you are the person who knows', si: 'ඔබ දන්නා තැනැත්තා වන තෙක් පර්යේෂණ, විමර්ශන හා විශේෂීකරණය' },
    Mercury: { en: 'writing, systems, documentation, and anything that turns know-how into a transferable asset', si: 'ලේඛන, පද්ධති, ප්‍රලේඛන හා දැනුම මාරු කළ හැකි වත්කමක් බවට හරවන ඕනෑම දෙයක්' },
    Jupiter: { en: 'teaching, advisory depth, and formalising what you know into something others can be charged for', si: 'ඉගැන්වීම, උපදේශන ගැඹුර හා ඔබ දන්නා දේ අන් අයගෙන් ගාස්තු අය කළ හැකි දෙයක් බවට විධිමත් කිරීම' },
  } as Record<string, Record<Lang, string>>,

  buildReason: (lord: string, focus: string | null, lang: Lang) => {
    const specialist = lord === 'Ketu'
      ? (lang === 'si' ? 'කේතු ඔබ විශේෂඥයෙකු කරයි' : 'Ketu makes you a specialist')
      : (lang === 'si' ? 'මෙතැනදී විශේෂීකරණය සෑදේ' : 'This is where specialisation forms');
    return lang === 'si'
      ? `දිගු ${lord} කවුළුවක් ගැඹුරු, තනි කාර්යයට ගැළපේ${focus ? `: ${focus}` : ''}. ${specialist}, දැන් ඔබ ගැඹුරින් යෙදෙන ඕනෑම දෙයක් ඊළඟ කාලය දක්වා සංයුක්ත වේ. එය මෙම කාලය ලබා දෙන වඩාත්ම විශ්වාසදායක ලාභයයි.`
      : `A long ${lord} window suits deep, solitary work${focus ? `: ${focus}` : ''}. ${specialist}, and anything you go deep on now compounds into the next period. It is the most reliable profit the stretch offers.`;
  },

  protectDisease: (lord: string, area: string, lang: Lang) => lang === 'si'
    ? `${lord} ${area} වෙහෙසට පත් කරයි — නින්ද, ව්‍යායාම හා දිනචරියාව සුඛෝපභෝගී දෑ නොව ඵලදායිතා යටිතල පහසුකම් ලෙස සලකන්න.`
    : `${lord} taxes ${area} — treat sleep, movement and routine as productivity infrastructure, not luxuries.`,
  protectSeverance: { en: 'Do not make impulsive severances in frustration — cutting under pressure is the characteristic failure mode of separative periods, and it usually cuts the wrong thing.', si: 'කලකිරීමෙන් හදිසි වෙන්වීම් නොකරන්න — පීඩනය යටතේ කැපීම වෙන් කරන කාලවල ලාක්ෂණික අසාර්ථක ක්‍රමය වන අතර, එය සාමාන්‍යයෙන් වැරදි දේ කපා දමයි.' },
  protectReserves: { en: "Keep reserves liquid and avoid over-leverage. Avoided losses are this period's clearest profit.", si: 'සංචිත ද්‍රවශීලව තබා අධික ණය ගැනීමෙන් වළකින්න. වැළැක්වූ පාඩු මෙම කාලයේ පැහැදිලිම ලාභයයි.' },

  harvestGain: (lord: string, phrase: string, lang: Lang) => lang === 'si'
    ? `${lord} ඔබේ ${phrase} අධිපති වේ — වර්තමාන කාලය ස්ථානගත වන කවුළුව එයයි. දැන් තැන්පත් කළ පදනම එහිදී පරිවර්තනය වේ.`
    : `${lord} rules your ${phrase} — that is the window the current period is positioning toward. Ground banked now converts there.`,
  harvestHouses: (lord: string, phrase: string, date: string, lang: Lang) => lang === 'si'
    ? `${lord} ඔබේ ${phrase} අධිපති වන නිසා, ${date} සිට අවධානය එම ක්ෂේත්‍ර වෙත මාරු වේ.`
    : `${lord} rules your ${phrase}, so the emphasis shifts to those areas from ${date}.`,
  harvestPlain: (md: string, lord: string, date: string, lang: Lang) => lang === 'si'
    ? `${md}–${lord} ${date} දින විවෘත වී එතැන් සිට තේමාව භාර ගනී.`
    : `${md}–${lord} opens on ${date} and takes over the theme from there.`,
  harvestPositionSuffix: { en: ' Position now; win there.', si: ' දැන් ස්ථානගත වන්න; එහිදී ජය ගන්න.' },

  peaks: (windows: string, lang: Lang) => lang === 'si'
    ? `බලය ${windows} හි සංකේන්ද්‍රණය වේ. ඒවා සැලසුම් කළ යුතු කවුළු වේ; කාලයේ ඉතිරි කොටස එහි කීර්තියට වඩා නිහඬව ගමන් කරයි.`
    : `Force concentrates in ${windows}. Those are the windows to plan around; the rest of the period runs quieter than its reputation.`,
  peakWindow: (md: string, ad: string, lord: string, start: string, end: string) => `${md}–${ad}–${lord} (${start} – ${end})`,

  oneLineConsolidate: (md: string, ad: string, nextLord: string, phrase: string, lang: Lang) => lang === 'si'
    ? `${md}–${ad} තුළ ජය ගැනීමට උත්සාහ නොකරන්න — ${md}–${nextLord} ඔබේ ${phrase} විවෘත කරන විට ජය ගැනීමට මෙතැන ස්ථානගත වන්න.`
    : `Don't try to win inside ${md}–${ad} — position here so you win when ${md}–${nextLord} opens your ${phrase} house.`,
  oneLineAccumulate: (md: string, ad: string, windowPhrase: string, lang: Lang) => lang === 'si'
    ? `${md}–${ad} උත්සාහය ප්‍රතිඵලයක් බවට හරවයි — කලින් කැපවී, ආපසු හැරවිය නොහැකි ඕනෑම දෙයකට ${windowPhrase} භාවිත කරන්න.`
    : `${md}–${ad} converts effort into result — commit early, and use ${windowPhrase} for anything irreversible.`,
  oneLineActionWindow: (lord: string, lang: Lang) => lang === 'si' ? `${lord} කවුළුව` : `the ${lord} window`,
  oneLineSupportedWindows: { en: 'the supported windows', si: 'සහායක කවුළු' },
  oneLineMixed: (md: string, ad: string, lang: Lang) => lang === 'si'
    ? `${md}–${ad} තුළ තෝරා බේරා ගන්න: සහායක කවුළු තුළ තීරණාත්මකව ක්‍රියා කරන්න, බර ඒවා තුළ පදනම රැක ගන්න, ඉතිරිය පහ වී යාමට ඉඩ දෙන්න.`
    : `Be selective inside ${md}–${ad}: act decisively in the supported windows, hold ground in the heavy ones, and let the rest pass.`,
  oneLineNextFallback: { en: 'next', si: 'ඊළඟ' },
};

export function sPlanet(p: string, lang: Lang): string { return planetName(p, lang); }
