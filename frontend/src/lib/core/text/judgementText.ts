/** Bilingual prose for the classical antardasha judgement (antardashaJudgement.ts). */

import { type Lang, planetName, rashiName, houseLabel } from '../i18n';

export const DISPOSITION_NOTE: Record<number, (ad: string, md: string, lang: Lang) => string> = {
  1: (ad, md, lang) => lang === 'si' ? `${ad} ${md} හා එකම රාශියේ` : `${ad} sits in the same sign as ${md}`,
  2: (ad, md, lang) => lang === 'si' ? `${ad} ${md} ගෙන් 2 වන` : `${ad} stands in the 2nd from ${md}`,
  3: (ad, md, lang) => lang === 'si' ? `${ad} ${md} ගෙන් 3 වන` : `${ad} stands in the 3rd from ${md}`,
  4: (ad, md, lang) => lang === 'si' ? `${ad} ${md} ගෙන් 4 වන` : `${ad} stands in the 4th from ${md}`,
  5: (ad, md, lang) => lang === 'si' ? `${ad} ${md} ගෙන් 5 වන` : `${ad} stands in the 5th from ${md}`,
  6: (ad, md, lang) => lang === 'si' ? `${ad} ${md} ගෙන් 6 වන` : `${ad} stands in the 6th from ${md}`,
  7: (ad, md, lang) => lang === 'si' ? `${ad} ${md} ගෙන් 7 වන` : `${ad} stands in the 7th from ${md}`,
  8: (ad, md, lang) => lang === 'si' ? `${ad} ${md} ගෙන් 8 වන` : `${ad} stands in the 8th from ${md}`,
  9: (ad, md, lang) => lang === 'si' ? `${ad} ${md} ගෙන් 9 වන` : `${ad} stands in the 9th from ${md}`,
  10: (ad, md, lang) => lang === 'si' ? `${ad} ${md} ගෙන් 10 වන` : `${ad} stands in the 10th from ${md}`,
  11: (ad, md, lang) => lang === 'si' ? `${ad} ${md} ගෙන් 11 වන` : `${ad} stands in the 11th from ${md}`,
  12: (ad, md, lang) => lang === 'si' ? `${ad} ${md} ගෙන් 12 වන` : `${ad} stands in the 12th from ${md}`,
};

export const DISPOSITION_MEANING: Record<number, Record<Lang, string>> = {
  1: { en: "the two lords merge — the sub-period concentrates the mahadasha's own theme rather than varying it", si: 'අධිපතීන් දෙදෙනා එක් වේ — අන්තර් දශාව මහා දශාවේ තේමාව වෙනස් කරනවාට වඩා එය තීව්‍ර කරයි' },
  2: { en: 'a supportive placement for resources, family and accumulated wealth', si: 'සම්පත්, පවුල හා රැස් කළ ධනයට සහායක පිහිටීමකි' },
  3: { en: 'results come through initiative and effort rather than by grace', si: 'ප්‍රතිඵල ලැබෙන්නේ ආශිර්වාදයෙන් නොව මුල පිරීම හා උත්සාහයෙනි' },
  4: { en: 'a settled placement — home, vehicles and inner ground are supported', si: 'ස්ථාවර පිහිටීමකි — නිවස, වාහන හා අභ්‍යන්තර පදනම සහාය ලබයි' },
  5: { en: "one of the most fruitful placements: the mahadasha's promise ripens here", si: 'වඩාත්ම ඵලදායී පිහිටීම්වලින් එකකි: මහා දශාවේ පොරොන්දුව මෙහිදී පැසෙයි' },
  6: { en: 'a difficult placement — obstruction, competition, debt and health friction', si: 'දුෂ්කර පිහිටීමකි — බාධා, තරඟය, ණය හා සෞඛ්‍ය ඝට්ටනය' },
  7: { en: 'an active placement working through partnerships, deals and other people', si: 'හවුල්කාරිත්ව, ගිවිසුම් හා අන් අය හරහා ක්‍රියා කරන සක්‍රිය පිහිටීමකි' },
  8: { en: 'the hardest placement — obstruction, delay, and sudden reversals of intent', si: 'දුෂ්කරම පිහිටීමයි — බාධා, ප්‍රමාද හා අභිප්‍රායේ හදිසි පෙරළි' },
  9: { en: 'a fortunate placement; fortune, mentors and dharma support the period', si: 'වාසනාවන්ත පිහිටීමකි; වාසනාව, මඟපෙන්වන්නන් හා ධර්මය මෙම කාලයට සහාය වේ' },
  10: { en: 'a strongly active placement — career and public standing move', si: 'ප්‍රබලව සක්‍රිය පිහිටීමකි — වෘත්තිය හා මහජන තත්ත්වය චලනය වේ' },
  11: { en: 'the most productive placement of all: gains, fulfilment of desires, income', si: 'සියල්ලෙන් වඩාත්ම ඵලදායී පිහිටීමයි: ලාභ, ආශාවන් ඉටු වීම, ආදායම' },
  12: { en: 'a draining placement — expense, dispersal, foreign matters and letting go', si: 'හීන කරන පිහිටීමකි — වියදම්, විසිරීම, විදේශීය කරුණු හා අත්හැරීම' },
};

export const JUDGE = {
  dispositionDetail: (ad: string, adRashi: string, md: string, mdRashi: string, _house: number, houseLabel: string, meaning: string, shash: boolean, lang: Lang) => {
    const base = lang === 'si'
      ? `ජන්මයේදී ${ad} ${adRashi} හි ද ${md} ${mdRashi} හි ද සිටී, එමගින් ${ad} දශා අධිපතියාගෙන් ${houseLabel} තබයි — ${meaning}.`
      : `Natally ${ad} is in ${adRashi} and ${md} in ${mdRashi}, putting ${ad} in the ${houseLabel} from the period lord — ${meaning}.`;
    const shashNote = shash
      ? (lang === 'si'
          ? ' අධිපතීන් දෙදෙනා 6-8 අක්ෂයේ (ෂෂ්ටාෂ්ටක) සිටී, එය අන්තර් දශාවකට තිබිය හැකි වඩාත්ම බාධිත සම්බන්ධය ලෙස සම්භාව්‍ය ග්‍රන්ථ හඳුනා ගනී.'
          : ` The two lords stand on the 6-8 axis (shashtashtaka), which the classics single out as the most obstructed relationship a sub-period can have.`)
      : '';
    return base + shashNote;
  },
  friendlyLabel: { en: 'Friendly lords', si: 'මිත්‍ර අධිපතීන්' },
  inimicalLabel: { en: 'Inimical lords', si: 'ශතෘ අධිපතීන්' },
  friendlyDetail: (ad: string, md: string, lang: Lang) => lang === 'si'
    ? `${ad} යනු ${md}ගේ ස්වභාවික මිතුරෙකි, එබැවින් අන්තර් දශාව මහා දශාවට එරෙහි නොවී එය සමඟ සහයෝගයෙන් කටයුතු කරයි.`
    : `${ad} is a natural friend of ${md}, so the sub-period cooperates with the mahadasha instead of fighting it.`,
  inimicalDetail: (ad: string, md: string, lang: Lang) => lang === 'si'
    ? `${ad} යනු ${md}ගේ ස්වභාවික සතුරෙකි. අන්තර් දශාව මහා දශාවේ දිශාවට එරෙහිව අදින අතර, ප්‍රගතියට අරමුණු දෙක හිතාමතා සමගි කිරීම අවශ්‍ය වේ.`
    : `${ad} is a natural enemy of ${md}. The sub-period pulls against the mahadasha's direction, and progress needs deliberate reconciliation of the two agendas.`,
  subLordGoodLabel: (ad: string, lang: Lang) => lang === 'si' ? `${ad} ජන්මයේදී හොඳින් පිහිටා ඇත` : `${ad} is well placed natally`,
  subLordBadLabel: (ad: string, lang: Lang) => lang === 'si' ? `${ad} ජන්ම පීඩනයට ලක්ව ඇත` : `${ad} is under natal pressure`,
  subLordGoodDetail: (ad: string, lang: Lang) => lang === 'si'
    ? `${ad}ගේ ජන්ම තත්ත්වය නිසා එහිම අන්තර් දශාවේදී එහි කරුණු පිරිසිදුව ලබා දිය හැක.`
    : `${ad}'s natal condition lets it deliver its significations cleanly during its own sub-period.`,
  subLordBadDetail: (ad: string, lang: Lang) => lang === 'si'
    ? `${ad}ගේ ජන්ම තත්ත්වය නිසා එය ඝට්ටනය හරහා ඵල දෙයි — එහි අන්තර් දශාව ඵල දීමට පෙර උත්සාහය ඉල්ලයි.`
    : `${ad}'s natal condition means it delivers through friction — its sub-period asks for effort before it concedes.`,
  periodLordLabel: (md: string, lang: Lang) => lang === 'si' ? `${md} අඩංගු තත්ත්වයන් සකසයි` : `${md} sets the containing conditions`,
  periodLordDetail: (md: string, good: boolean, lang: Lang) => lang === 'si'
    ? `මහා දශා අධිපතියා එය තුළ ඇති සෑම අන්තර් දශාවක්ම රාමුගත කරයි. ${md}ගේ ජන්ම තත්ත්වය මෙම අන්තර් දශාවට නිපදවිය හැකි දෑ ${good ? 'සඳහා සීමාව ඉහළ නංවයි' : 'සීමා කරයි'}.`
    : `The mahadasha lord frames every sub-period inside it. ${md}'s natal condition ${good ? 'raises the ceiling for' : 'constrains'} what this antardasha can produce.`,
  avLabel: (ad: string, bindus: number, binduLabel: string, lang: Lang) => lang === 'si'
    ? `${ad} හට බින්දු ${bindus}/8 ඇත (${binduLabel})`
    : `${ad} has ${bindus}/8 bindus (${binduLabel})`,
  avDetail: (ad: string, bindus: number, lang: Lang) => {
    const support = bindus >= 5
      ? (lang === 'si' ? 'ප්‍රතිඵල පහසුවෙන් දීමට තරම් සහායක' : 'enough support to give results readily')
      : bindus <= 3
        ? (lang === 'si' ? 'දුර්වල සහායක, එබැවින් ප්‍රතිඵල සෙමින් හා අර්ධ වශයෙන් එයි' : 'thin support, so results come slowly and partially')
        : (lang === 'si' ? 'සාමාන්‍ය සහායක' : 'average support');
    return lang === 'si'
      ? `තමාගේම භින්නාෂ්ටකවර්ගයේ ${ad} එය රැඳී සිටින රාශියේ බින්දු 8න් ${bindus}ක් දරයි — ${support}.`
      : `In its own Bhinnashtakavarga ${ad} carries ${bindus} of 8 bindus in the sign it occupies — ${support}.`;
  },
  pairLabel: (md: string, ad: string, lang: Lang) => lang === 'si'
    ? `${md}–${ad} නම් කළ එකතුවකි`
    : `${md}–${ad} is a named combination`,
  pairDetail: (md: string, ad: string, mod: number, lang: Lang) => lang === 'si'
    ? `${md}–${ad} හි සම්භාව්‍ය කියවීම ${mod > 0 ? 'හිතකරයි' : 'ආතති ලක්ෂ්‍යයකි'} (සම්ප්‍රදායික පරිමාණයේ ${mod > 0 ? '+' : ''}${mod}).`
    : `The classical reading of ${md}–${ad} is ${mod > 0 ? 'favourable' : 'a stress point'} (${mod > 0 ? '+' : ''}${mod} on the traditional scale).`,
  fallbackHeadline: (md: string, ad: string, lang: Lang) => lang === 'si'
    ? `${md}–${ad} හි තීරණාත්මක සම්භාව්‍ය ලකුණක් නොමැත — එය මහා දශාවේම මූලික මට්ටමට ආසන්නව ගමන් කරයි.`
    : `${md}–${ad} carries no decisive classical marker — it runs close to the mahadasha's own baseline.`,
};

export function jPlanet(p: string, lang: Lang): string { return planetName(p, lang); }
export function jRashi(i: number, lang: Lang): string { return rashiName(i, lang); }
export function jHouse(n: number, lang: Lang): string { return houseLabel(n, lang); }
