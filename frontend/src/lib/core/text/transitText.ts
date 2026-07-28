/**
 * Bilingual transit prose — the Gochara snapshot notes (transits.ts) and the
 * interpretive transit predictions (transitAnalysis.ts).
 */

import { type Lang, planetName, joinAnd } from '../i18n';

// ─── Snapshot notes (transits.ts) ──────────────────────────────────────────

export const TRANSIT_NOTE = {
  sadeSatiPhase: { en: 'Sade Sati phase from Moon', si: 'චන්ද්‍රයාගෙන් සාඩේ සති අවධිය' },
  ashtamaShani: { en: 'Ashtama Shani — pressure on health, hidden matters', si: 'අෂ්ටම ශනි — සෞඛ්‍යයට හා සැඟවුණු කරුණුවලට පීඩනය' },
  kantakaShani: { en: 'Kantaka Shani — stress on home, mother, vehicles', si: 'කණ්ටක ශනි — නිවස, මව හා වාහනවලට ආතතිය' },
  saturnFavourable: { en: 'Favourable Saturn transit (3/6/11 from Moon)', si: 'හිතකර ශනි ගෝචරය (චන්ද්‍රයාගෙන් 3/6/11)' },
  guruAuspicious: { en: 'Auspicious Guru transit from Moon', si: 'චන්ද්‍රයාගෙන් සුබ ගුරු ගෝචරය' },
  guruDemanding: { en: 'Demanding Guru transit — expansion turns to lessons', si: 'දුෂ්කර ගුරු ගෝචරය — ව්‍යාප්තිය පාඩම් බවට හැරේ' },
  nodeSensitive: { en: 'Node on a sensitive axis from Moon — restlessness, hidden currents', si: 'චන්ද්‍රයාගෙන් සංවේදී අක්ෂයක ඡායා ග්‍රහයා — නොසන්සුන්කම, සැඟවුණු ධාරා' },
  marsKuja: { en: 'Mars on a Kuja axis from Lagna — manage temper and conflicts', si: 'ලග්නයෙන් කුජ අක්ෂයක කුජ — කෝපය හා ගැටුම් පාලනය කර ගන්න' },
};

export const SADE_SATI_DESC = {
  rising: (rashi: string, lang: Lang) => lang === 'si'
    ? `සාඩේ සති පළමු අවධිය — ශනි ${rashi} හි (ජන්ම චන්ද්‍රයාගෙන් 12 වන). අභ්‍යන්තර පීඩනය, වියදම්, නින්දේ වෙනස්කම්. වසර 2.5ක් පමණ පවතී.`
    : `Sade Sati first phase — Saturn in ${rashi} (12th from natal Moon). Inner pressure, expenses, sleep changes. Last ~2.5 years.`,
  peak: (rashi: string, lang: Lang) => lang === 'si'
    ? `සාඩේ සති උච්චය — ශනි ඔබේ ජන්ම චන්ද්‍ර රාශියේ (${rashi}). වඩාත්ම තීව්‍ර අවධිය. ඉවසීම, විනය, සරල කිරීම. වසර 2.5ක් පමණ.`
    : `Sade Sati peak — Saturn in your natal Moon rashi (${rashi}). Most intense phase. Patience, discipline, simplification. ~2.5 years.`,
  setting: (rashi: string, lang: Lang) => lang === 'si'
    ? `සාඩේ සති අවසන් අවධිය — ශනි ${rashi} හි (ජන්ම චන්ද්‍රයාගෙන් 2 වන). ධනය/පවුල/වචනය පරීක්ෂාවට ලක් වේ. අවසන් වසර 2.5ක් පමණ.`
    : `Sade Sati closing phase — Saturn in ${rashi} (2nd from natal Moon). Wealth/family/speech tested. Final ~2.5 years.`,
  none: { en: 'Not currently in Sade Sati.', si: 'දැනට සාඩේ සති නොපවතී.' },
};

export const JUPITER_BLESSING = {
  auspicious: (house: number, lang: Lang) => lang === 'si'
    ? `ගුරු ඔබේ චන්ද්‍රයාගෙන් ${house} වන ස්ථානය ගෝචරය කරයි — එම භාවයේ කරුණුවල ව්‍යාප්තියට හිතකර කවුළුවකි.`
    : `Guru is transiting your ${house}th from Moon — supportive window for expansion in matters of that house.`,
  learning: (house: number, lang: Lang) => lang === 'si'
    ? `ගුරු ඔබේ චන්ද්‍රයාගෙන් ${house} වන ස්ථානය ගෝචරය කරයි — එම ක්ෂේත්‍රයේ ලාභයට වඩා පාඩම් ලබන කාලයකි.`
    : `Guru is transiting your ${house}th from Moon — period of learning rather than gain in that area.`,
};

/**
 * Transit signals read from the Lagna rather than the Moon.
 *
 * A Moon-only summary answers "how does this feel" and nothing else. Whether
 * anything is actually being *offered* is a question about the houses from the
 * Lagna, and the two routinely disagree — which is the single most useful thing
 * a transit reading can say when it happens.
 */
export const LAGNA_TRANSIT = {
  slowMoverDignified: (planet: string, dignity: 'exalted' | 'own', house: string, lang: Lang) => lang === 'si'
    ? `${planet} ගෝචරයේ ${dignity === 'exalted' ? 'උච්ච' : 'ස්වක්ෂේත්‍ර'} වී ඔබේ ලග්නයෙන් ${house} ගමන් කරයි — වර්ෂ ගණනාවකට මෙම කේන්දරය ලබන ප්‍රබලම ගෝචරවලින් එකකි.`
    : `${planet} is transiting ${dignity === 'exalted' ? 'exalted' : 'in its own sign'} through your ${house} from the Lagna — among the strongest transits this chart sees for years.`,

  slowMoverAfflicted: (planet: string, house: string, lang: Lang) => lang === 'si'
    ? `${planet} ගෝචරයේ නීච වී ඔබේ ලග්නයෙන් ${house} ගමන් කරයි — එම භාවයේ කරුණු මෙම කාලයේ අඩු සහායක් ලබයි.`
    : `${planet} is transiting debilitated through your ${house} from the Lagna — that house's affairs get less support while it lasts.`,

  /** A slow mover passing over a group of natal planets. */
  overNatal: (planet: string, natal: string, house: string, lang: Lang) => lang === 'si'
    ? `${planet} ඔබේ ජන්ම ${natal} මතින් (${house}) ගමන් කරයි — එම ග්‍රහයන් දරන කරුණු මෙම කාලයේ සක්‍රීය වේ.`
    : `${planet} is passing over your natal ${natal} in your ${house} — the matters those planets carry are live right now.`,

  /**
   * External conditions and internal state pulling in opposite directions. This
   * is a common, specific and genuinely useful configuration, and a summary that
   * averages the two into one number destroys exactly the information that makes
   * it worth reporting.
   */
  divergence: (outward: string, inward: string, lang: Lang) => lang === 'si'
    ? `මෙම කාලය බෙදී ඇත: ලග්නයෙන් බලන විට බාහිර තත්ත්වය හිතකරයි (${outward}), නමුත් චන්ද්‍රයාගෙන් බලන විට අභ්‍යන්තර තත්ත්වය පීඩනයට ලක්ව ඇත (${inward}). යමක් ලැබෙන්නට ඉඩ ඇති නමුත් එය භාර ගැනීමට උවමනාවක් නොදැනෙන කාලයකි — අවස්ථාව ප්‍රතික්ෂේප නොකර, එය ගැලපෙන වේගයකින් භාර ගන්න.`
    : `This period is split: from the Lagna the outward conditions are unusually good (${outward}), while from the Moon the inner state is under pressure (${inward}). Something significant may well be handed to you in a stretch where you do not much feel like taking it — the useful move is to accept it at a pace that fits, not to decline it.`,
};

export const NODAL_NOTE = (rahu: string, ketu: string, lang: Lang) => lang === 'si'
  ? `වර්තමාන රාහු-කේතු අක්ෂය: ${rahu} / ${ketu} — ඡායා ග්‍රහයෝ මාස 18කට වරක් පමණ රාශිය මාරු කරති.`
  : `Current Rahu-Ketu axis: ${rahu} / ${ketu} — the nodes shift rashi roughly every 18 months.`;

/** "Saturn: <note>" / "<planet>: <note>" prefix used in summary + predictions. */
export const NOTE_PREFIX = (planetKey: string, note: string, lang: Lang) =>
  `${planetName(titleCaseKey(planetKey), lang)}: ${note}`;

function titleCaseKey(k: string): string {
  return k.charAt(0).toUpperCase() + k.slice(1).toLowerCase();
}

// ─── Tara Bala (transitAnalysis.computeTaraBala) ───────────────────────────

export const TARA_DESC: Record<number, { name: string; desc: Record<Lang, string> }> = {
  1: { name: 'Janma', desc: { en: 'the birth-star day — body and mind are sensitive; routine over risk.', si: 'ජන්ම නක්ෂත්‍ර දිනය — සිරුර හා මනස සංවේදීයි; අවදානමට වඩා දිනචරියාව.' } },
  2: { name: 'Sampat', desc: { en: 'a wealth star — favourable for gains, purchases and beginnings.', si: 'ධන නක්ෂත්‍රයකි — ලාභ, මිලදී ගැනීම් හා ආරම්භවලට හිතකරයි.' } },
  3: { name: 'Vipat', desc: { en: 'a danger star — avoid risks, journeys and confrontation.', si: 'අනතුරු නක්ෂත්‍රයකි — අවදානම්, ගමන් හා ගැටුම් වළක්වන්න.' } },
  4: { name: 'Kshema', desc: { en: 'a well-being star — protective and prosperous; good for most matters.', si: 'සුවතා නක්ෂත්‍රයකි — ආරක්ෂාකාරී හා සමෘද්ධිමත්; බොහෝ කරුණුවලට හොඳයි.' } },
  5: { name: 'Pratyak', desc: { en: 'an obstacle star — plans meet resistance; postpone what can wait.', si: 'බාධක නක්ෂත්‍රයකි — සැලසුම් විරෝධයට මුහුණ දෙයි; ඉවසිය හැකි දේ කල් දමන්න.' } },
  6: { name: 'Sadhana', desc: { en: 'an achievement star — efforts succeed; act on goals.', si: 'ජයග්‍රහණ නක්ෂත්‍රයකි — වෑයම් සාර්ථක වේ; ඉලක්ක වෙනුවෙන් ක්‍රියා කරන්න.' } },
  7: { name: 'Naidhana', desc: { en: 'the most adverse star — keep the day light and defer key decisions.', si: 'වඩාත්ම අහිතකර නක්ෂත්‍රයයි — දිනය සැහැල්ලුව තබා ප්‍රධාන තීරණ කල් දමන්න.' } },
  8: { name: 'Mitra', desc: { en: 'a friendly star — cooperation, meetings and support flow.', si: 'මිත්‍ර නක්ෂත්‍රයකි — සහයෝගය, හමුවීම් හා සහාය ගලා යයි.' } },
  9: { name: 'Parama Mitra', desc: { en: 'the best-friend star — highly supportive for anything important.', si: 'පරම මිත්‍ර නක්ෂත්‍රයයි — වැදගත් ඕනෑම දෙයකට ඉතා සහායකයි.' } },
};

// ─── Retrograde review text (transitAnalysis RETRO_TEXT) ───────────────────

export const RETRO_TEXT: Record<string, Record<Lang, string>> = {
  MERCURY: { en: 'review communication, contracts, travel and devices — double-check details before committing.', si: 'සන්නිවේදනය, ගිවිසුම්, ගමන් හා උපකරණ නැවත පරීක්ෂා කරන්න — කැප වීමට පෙර විස්තර දෙවරක් පරීක්ෂා කරන්න.' },
  VENUS: { en: 'revisit relationships, finances and values; reconnect and refine rather than starting anew.', si: 'සම්බන්ධතා, මූල්‍ය හා සාරධර්ම නැවත සලකා බලන්න; අලුතින් ආරම්භ කරනවාට වඩා නැවත සම්බන්ධ වී පිරිපහදු කරන්න.' },
  MARS: { en: 'channel energy with care; avoid impulsive conflict and rushed decisions.', si: 'ශක්තිය ප්‍රවේශමෙන් යොදවන්න; හදිසි ගැටුම් හා ඉක්මන් තීරණ වළක්වන්න.' },
  JUPITER: { en: 'turn growth inward — reflect on beliefs, learning and long-term direction.', si: 'වර්ධනය අභ්‍යන්තරයට හරවන්න — විශ්වාස, ඉගෙනීම හා දිගු කාලීන දිශාව මෙනෙහි කරන්න.' },
  SATURN: { en: 'revisit duties and structures; consolidate and complete rather than expand.', si: 'යුතුකම් හා ව්‍යුහ නැවත සලකා බලන්න; ව්‍යාප්ත කරනවාට වඩා තහවුරු කර නිම කරන්න.' },
};

// ─── Interpretive predictions (buildTransitPredictions) ────────────────────
// Grammar helpers: join a list of planet keys and agree the verb with count.

export function joinPlanets(keys: string[], lang: Lang): string {
  return joinAnd(keys.map(k => planetName(titleCaseKey(k), lang)), lang);
}
export function isAre(count: number, lang: Lang): string {
  if (lang === 'si') return 'ය';
  return count > 1 ? 'are' : 'is';
}
export function theirIts(count: number, lang: Lang): string {
  if (lang === 'si') return count > 1 ? 'ඒවායේ' : 'එහි';
  return count > 1 ? 'their' : 'its';
}

const P = (k: string, lang: Lang) => planetName(titleCaseKey(k), lang);

export const TP = {
  // 1. Overall climate
  overallTitle: { en: 'Overall transit climate', si: 'සමස්ත ගෝචර තත්ත්වය' },
  overallPlainTitle: { en: 'The overall weather right now', si: 'දැන් පවතින සමස්ත තත්ත්වය' },
  overallPlain: (net: number, lang: Lang) => net >= 2
    ? (lang === 'si' ? 'ඔබ පරීක්ෂා කරනවාට වඩා වැඩි ග්‍රහ සංඛ්‍යාවක් ඔබට උදව් කරයි — දේ ආරම්භ කිරීමට හා එකඟ වීමට හොඳ කාලයකි.' : 'More planets are helping you than testing you — a good time to start things and say yes.')
    : net <= -2
      ? (lang === 'si' ? 'ඔබට උදව් කරනවාට වඩා වැඩි ග්‍රහ සංඛ්‍යාවක් ඔබ පරීක්ෂා කරයි — ජීවිතය සරලව තබා අමතර අරගලවලට නොයන්න.' : 'More planets are testing you than helping — keep life simple and don’t take on extra battles.')
      : (lang === 'si' ? 'අහස මිශ්‍රයි — සමහර දේ ගලා යයි, සමහර දේ ඇදෙයි. ඔබේ මොහොත තෝරා ගන්න.' : 'The sky is mixed — some things flow, some drag. Pick your moments.'),
  overallText: (net: number, good: number, bad: number, lang: Lang) => net >= 2
    ? (lang === 'si' ? `පුළුල් ලෙස සහායක කාලයකි — ග්‍රහ ${good}ක් හිතකර ගෝචරයක සිටින අතර ${bad}ක් පීඩනයට ලක්ව ඇත. සැලසුම් ආරම්භ කිරීමට හොඳ ගම්‍යතාවකි.` : `A broadly supportive period — ${good} planets are in favourable transit versus ${bad} under pressure. Good momentum for initiating plans.`)
    : net <= -2
      ? (lang === 'si' ? `දුෂ්කර කාලයකි — ග්‍රහ ${bad}ක් අභියෝගාත්මක ගෝචරයක සිටින අතර ${good}ක් හිතකරයි. අත්‍යවශ්‍ය දේ කෙරෙහි අවධානය යොමු කර ඉක්මවා නොයන්න.` : `A demanding stretch — ${bad} planets are in challenging transit versus ${good} favourable. Focus on essentials and avoid overreach.`)
      : (lang === 'si' ? `මිශ්‍ර කාලයකි — හිතකර ගෝචර ${good}ක් හා අභියෝගාත්මක ${bad}ක්. ඔබේ මොහොත තෝරා ගෙන නම්‍යශීලීව සිටින්න.` : `A mixed period — ${good} favourable and ${bad} challenging transits. Pick your moments and stay flexible.`),

  // 1b. Dasha–Gochara
  dashaTitle: (role: string, lord: string, lang: Lang) => lang === 'si' ? `${roleName(role, lang)} අධිපති ${lord} ගෝචරයේ` : `${role} lord ${lord} in transit`,
  dashaPlainTitle: (lord: string, lang: Lang) => lang === 'si' ? `${lord} — ඔබේ වර්තමාන ජීවිත පරිච්ඡේදය ගෙනයන ග්‍රහයා` : `${lord}, the planet running your current life chapter`,
  dashaPlain: (lord: string, kind: 'good' | 'bad' | 'neutral', lang: Lang) => kind === 'good'
    ? (lang === 'si' ? `${lord} දැන් ප්‍රබල ස්ථානයක සිටී — ඔබේ වර්තමාන කාලයේ තේමාවලට අනුබල ලැබේ. ඒවා වෙනුවෙන් ක්‍රියා කරන්න.` : `${lord} is in a strong position right now — the themes of your current period get a green light. Act on them.`)
    : kind === 'bad'
      ? (lang === 'si' ? `${lord} දැන් අහසේ දුෂ්කර තත්ත්වයක සිටී — ඔබේ වර්තමාන කාලයේ ප්‍රතිඵල මන්දගාමී ලෙස දැනිය හැක. බලෙන් නොකරන්න.` : `${lord} is having a hard time in the sky right now — results from your current period may feel slow. Don’t force it.`)
      : (lang === 'si' ? `${lord} සුමටව ගමන් කරයි — ඔබේ වර්තමාන කාලය ස්ථාවරව ගමන් කරයි, විශාල තල්ලුවක් නැත.` : `${lord} is coasting — your current period runs steadily, with no big push either way.`),

  // 2. Sade Sati
  sadeSatiTitle: { en: 'Sade Sati active', si: 'සාඩේ සති සක්‍රියයි' },
  sadeSatiPlainTitle: { en: 'Saturn’s long 7½-year test is on', si: 'ශනිගේ දිගු වසර 7½ පරීක්ෂණය ක්‍රියාත්මකයි' },
  sadeSatiPlain: { en: 'Life feels heavier and slower than usual in this phase. It passes — keep routines simple, rest well and avoid shortcuts.', si: 'මෙම අවධියේ ජීවිතය සුපුරුදු පරිදි නොව බර හා මන්දගාමී ලෙස දැනේ. එය පහ වී යයි — දිනචරියාව සරලව තබා, හොඳින් විවේක ගෙන, කෙටි මං වළක්වන්න.' },

  // 3. Jupiter blessing
  guruTitle: { en: 'Jupiter (Guru) transit', si: 'ගුරු ගෝචරය' },
  guruPlainTitle: { en: 'Jupiter — your luck and growth planet', si: 'ගුරු — ඔබේ වාසනා හා වර්ධන ග්‍රහයා' },
  guruPlain: (auspicious: boolean, lang: Lang) => auspicious
    ? (lang === 'si' ? 'ගුරු දැන් ඔබට හිතවත්ව සිටී — වර්ධනය, අවස්ථා හා අන් අයගේ උදව් පහසුවෙන් ලැබේ. මෙම කවුළුව භාවිත කරන්න.' : 'Jupiter is smiling on you right now — growth, opportunities and help from others come easier. Use this window.')
    : (lang === 'si' ? 'ගුරු දීමනා ලබා දෙනවාට වඩා ඉගැන්වීමේ ස්වභාවයක සිටී — වර්ධනය වාසනාවෙන් නොව පාඩම් හරහා එයි. ඉගෙන ගන්න, පසුපස නොයන්න.' : 'Jupiter is in teaching mode rather than gifting mode — growth comes through lessons, not luck. Learn, don’t chase.'),

  // 4/5. Aspects
  lagnaAspectTitle: (planet: string, pct: number, lang: Lang) => lang === 'si' ? `${planet} ඔබේ ලග්නය බලයි (${pct}%)` : `${planet} aspects your Lagna (${pct}%)`,
  lagnaAspectPlainTitle: (planet: string, lang: Lang) => lang === 'si' ? `${planet} ඔබේ සිරුරට හා විශ්වාසයට බලපායි` : `${planet} is shining on your body & confidence`,
  lagnaAspectPlain: (planet: string, benefic: boolean, lang: Lang) => benefic
    ? (lang === 'si' ? `${planet}ගේ දෘෂ්ටිය ඔබේ ශක්තිය හා පැවැත්ම වර්ධනය කරයි — පෙනී සිට, කතා කර, මුල පිරීමට හොඳ කාලයකි.` : `${planet}’s gaze boosts your energy and presence — a good stretch to be seen, speak up and take initiative.`)
    : (lang === 'si' ? `${planet}ගේ දෘෂ්ටිය ඔබේ ශක්තිය හා ස්වයං ප්‍රතිරූපයට පීඩනය කරයි — වේගය පාලනය කර, ප්‍රමාණවත් නින්දක් ලබා, අධික ලෙස භාර නොගන්න.` : `${planet}’s gaze presses on your energy and self-image — pace yourself, sleep enough and don’t overcommit.`),
  lagnaAspectText: (planet: string, benefic: boolean, lang: Lang) => benefic
    ? (lang === 'si' ? `${planet} ඔබේ ලග්නය මත ප්‍රබල දෘෂ්ටියක් හෙළයි — ජීවශක්තිය, විශ්වාසය හා ඔබ පෙනී සිටින ආකාරයට සහාය වේ. ඔබ ඉදිරිපත් වීමට කවුළුවකි.` : `${planet} casts a strong aspect on your ascendant — supports vitality, confidence and how you show up. A window to put yourself forward.`)
    : (lang === 'si' ? `${planet} ඔබේ ලග්නය මත ප්‍රබල දෘෂ්ටියක් හෙළයි — සෞඛ්‍යය, ශක්තිය හා ස්වයං ප්‍රතිරූපයට පීඩනය එක් කරයි. වේගය පාලනය කර ඔබේ යහපැවැත්ම ආරක්ෂා කර ගන්න.` : `${planet} casts a strong aspect on your ascendant — adds pressure to health, energy and self-image. Pace yourself and protect your wellbeing.`),
  moonAspectTitle: (planet: string, pct: number, lang: Lang) => lang === 'si' ? `${planet} ඔබේ චන්ද්‍ර රාශිය බලයි (${pct}%)` : `${planet} aspects your Moon sign (${pct}%)`,
  moonAspectPlainTitle: (planet: string, lang: Lang) => lang === 'si' ? `${planet} ඔබේ මනෝභාවයට බලපායි` : `${planet} is influencing your mood`,
  moonAspectPlain: (planet: string, benefic: boolean, lang: Lang) => benefic
    ? (lang === 'si' ? `${planet}ගේ බලපෑම ඔබේ හැඟීම් ස්ථාවර කරයි — දැන් සම්බන්ධතා හා සිතේ සාමය පහසු ලෙස දැනේ.` : `${planet}’s influence steadies your emotions — relationships and peace of mind feel easier now.`)
    : (lang === 'si' ? `${planet}ගේ බලපෑම ඔබේ හැඟීම් කලඹයි — සුපුරුදුට වඩා වැඩි ආතතියක් අපේක්ෂා කරන්න; නින්ද ආරක්ෂා කර මොහොතේ ප්‍රතික්‍රියා නොකරන්න.` : `${planet}’s influence stirs your emotions — expect more stress than usual; protect sleep and don’t react in the moment.`),
  moonAspectText: (planet: string, benefic: boolean, lang: Lang) => benefic
    ? (lang === 'si' ? `${planet} ඔබේ ජන්ම චන්ද්‍රයා බලයි — හැඟීම්බර ස්ථාවරත්වය හා සහාය; මනෝභාවය හා සම්බන්ධතා පහසු ලෙස දැනේ.` : `${planet} aspects your natal Moon — emotional steadiness and support; mood and relationships feel easier.`)
    : (lang === 'si' ? `${planet} ඔබේ ජන්ම චන්ද්‍රයා බලයි — සිතේ සාමය පරීක්ෂාවට ලක් වේ; ආතතිය, හදිසි ප්‍රතික්‍රියා හා බිඳුණු නින්දෙන් ආරක්ෂා වන්න.` : `${planet} aspects your natal Moon — peace of mind is tested; guard against stress, reactivity and broken sleep.`),

  // 6. Saturn special
  saturnTitle: { en: 'Saturn transit', si: 'ශනි ගෝචරය' },
  saturnPlainTitle: { en: 'Saturn — the discipline planet', si: 'ශනි — විනය ග්‍රහයා' },
  saturnPlain: (good: boolean, lang: Lang) => good
    ? (lang === 'si' ? 'ශනි දැන් ඔබ පැත්තේ සිටී — ස්ථාවර, ඉවසිලිවන්ත වෑයමට ප්‍රතිඵල ලැබේ. දිගටම කරගෙන යන්න.' : 'Saturn is on your side for now — steady, patient effort gets rewarded. Keep showing up.')
    : (lang === 'si' ? 'ශනි ජීවිතයේ එක් ක්ෂේත්‍රයක ඔබ පරීක්ෂා කරයි — එහි ප්‍රමාද අපේක්ෂා කර, බලයට නොව ඉවසීමට යොමු වන්න.' : 'Saturn is testing you in one area of life — expect delays there and answer with patience, not force.'),

  // 7. Retrograde
  retroTitle: (planets: string, lang: Lang) => lang === 'si' ? `වක්‍ර: ${planets}` : `Retrograde: ${planets}`,
  retroPlainTitle: { en: 'Some planets are in “review mode”', si: 'සමහර ග්‍රහයෝ “යළි සලකා බැලීමේ” ස්වභාවයක සිටිති' },
  retroPlain: { en: 'A backward-moving planet favours finishing, fixing and double-checking over brand-new starts in its areas.', si: 'පසුපසට ගමන් කරන ග්‍රහයෙක් එහි ක්ෂේත්‍රවල අලුත් ආරම්භවලට වඩා නිම කිරීම, නිවැරදි කිරීම හා දෙවරක් පරීක්ෂා කිරීම වෙනුවෙන් හිතකරයි.' },

  // 8. Gandanta
  gandantaTitle: { en: 'Gandanta (sign junction)', si: 'ගණ්ඩාන්ත (රාශි සන්ධිය)' },
  gandantaPlainTitle: (planets: string, lang: Lang) => lang === 'si' ? `${planets} සියුම් හැරවුම් ලක්ෂ්‍යයක` : `${planets} at a delicate turning point`,
  gandantaPlain: { en: 'Things connected to this planet feel shaky for a few days — hold off on big commitments there until it settles.', si: 'මෙම ග්‍රහයාට සම්බන්ධ දේ දින කිහිපයක් අස්ථිර ලෙස දැනේ — එය සන්සුන් වන තෙක් එහි විශාල බැඳීම්වලින් වළකින්න.' },
  gandantaText: (planets: string, multi: boolean, lang: Lang) => lang === 'si'
    ? `${planets} ගණ්ඩාන්තයේ සිටී — කර්මය හා බැඳුණු ජල-ගිනි සන්ධිය. ${multi ? 'මෙම ග්‍රහයන්' : 'මෙම ග්‍රහයා'} විසින් පාලනය වන කරුණු දැන් අස්ථිර හා සියුම්ව දැනේ; ${multi ? 'ඒවා' : 'එය'} හරහා විශාල බැඳීම් වළක්වන්න.`
    : `${planets} ${multi ? 'are' : 'is'} in gandanta — the karmic water–fire junction. Matters ruled by ${multi ? 'these planets' : 'this planet'} feel unstable and tender now; avoid major commitments through ${multi ? 'them' : 'it'}.`,

  // 9. Planetary war
  warTitle: { en: 'Planetary war (Graha Yuddha)', si: 'ග්‍රහ යුද්ධය' },
  warPlainTitle: (pairs: string, lang: Lang) => lang === 'si' ? `${pairs} අහසේ ගැටෙති` : `${pairs} are clashing in the sky`,
  warPlain: { en: 'Two planets are crowding each other, so the things they stand for pull in opposite directions for a short while — expect friction there.', si: 'ග්‍රහයන් දෙදෙනෙක් එකිනෙකා තදකරයි, එබැවින් ඔවුන් නියෝජනය කරන දේ කෙටි කලකට ප්‍රතිවිරුද්ධ දිශාවලට අදියි — එහි ඝට්ටනයක් අපේක්ෂා කරන්න.' },
  warText: (pairs: string, multi: boolean, lang: Lang) => lang === 'si'
    ? `${pairs} අංශක 1ක් ඇතුළත සිටී — ග්‍රහ යුද්ධයකි. ඔවුන්ගේ කරුණු ගැටෙන අතර, මෙතරම් ළං සිටින තාක් දුර්වල ග්‍රහයාගේ ප්‍රතිඵල දුර්වල වේ.`
    : `${pairs} ${multi ? 'are' : 'is'} within 1° — a planetary war. Their significations clash and the weaker planet's results are compromised while they stay this close.`,

  // Ashtakavarga support
  avTitle: { en: 'Ashtakavarga support', si: 'අෂ්ටකවර්ග සහාය' },
  avPlainTitle: { en: 'How much backing each planet has from your birth chart', si: 'ඔබේ ජන්ම කේන්දරයෙන් එක් එක් ග්‍රහයාට ලැබෙන පිටුබලය' },

  // Transit strength
  strengthTitle: { en: 'Transit strength & state', si: 'ගෝචර ශක්තිය හා තත්ත්වය' },
  strengthPlainTitle: { en: 'Which planets are strong or weak right now', si: 'දැන් ප්‍රබල හෝ දුර්වල ග්‍රහයෝ කවුරුද' },

  // Transit → Natal
  tnTitle: { en: 'Transit → Natal contacts', si: 'ගෝචර → ජන්ම සම්බන්ධතා' },
  tnPlainTitle: { en: 'Planets touching sensitive spots in your birth chart', si: 'ඔබේ ජන්ම කේන්දරයේ සංවේදී ස්ථාන ස්පර්ශ කරන ග්‍රහයෝ' },
  tnPlain: { en: 'When a moving planet touches a planet you were born with, real events tend to follow in that part of life — these are the contacts to watch.', si: 'චලනය වන ග්‍රහයෙක් ඔබ උපන් ග්‍රහයෙකු ස්පර්ශ කරන විට, ජීවිතයේ එම කොටසේ සැබෑ සිදුවීම් සිදු වීමට නැඹුරු වේ — මේවා අවධානය යොමු කළ යුතු සම්බන්ධතා වේ.' },

  // Daily Moon
  moonTitle: (tithi: string, paksha: string, lang: Lang) => lang === 'si' ? `චන්ද්‍රයා: ${tithi} (${paksha} පක්ෂය)` : `Moon: ${tithi} (${paksha} paksha)`,
  moonPlainTitle: { en: 'Today’s Moon — your day-to-day mood', si: 'අද චන්ද්‍රයා — ඔබේ දෛනික මනෝභාවය' },

  // Tara Bala
  taraTitle: (name: string, ord: string, lang: Lang) => lang === 'si' ? `තාරා බල: ${name} (${ord} තාරාව)` : `Tara Bala: ${name} (${ord} tara)`,
  taraPlainTitleGood: { en: 'Today’s star is friendly to you', si: 'අද නක්ෂත්‍රය ඔබට හිතවත්ය' },
  taraPlainTitleBad: { en: 'Today’s star is not on your side', si: 'අද නක්ෂත්‍රය ඔබ පැත්තේ නැත' },
  taraPlain: (fav: boolean, lang: Lang) => fav
    ? (lang === 'si' ? 'ඔබේ පෞද්ගලික දින-නක්ෂත්‍ර චක්‍රය අනුව, අද වැදගත් තීරණවලට හිතකරයි — අත්සන් කරන්න, වෙන්කරවා ගන්න, අසන්න, ආරම්භ කරන්න.' : 'By your personal day-star cycle, today favours important moves — sign, book, ask, begin.')
    : (lang === 'si' ? 'ඔබේ පෞද්ගලික දින-නක්ෂත්‍ර චක්‍රය අනුව, අද අවදානමට වඩා දිනචරියාවට හොඳයි — විශාල තීරණ දිනක් දෙකක් ඉවසිය හැක.' : 'By your personal day-star cycle, today is better for routine than risk — big decisions can wait a day or two.'),

  // Vedha
  vedhaTitle: { en: 'Vedha (obstruction)', si: 'වේධ (බාධාව)' },
  vedhaPlainTitle: { en: 'A good influence is temporarily on hold', si: 'හිතකර බලපෑමක් තාවකාලිකව නතර වී ඇත' },
  vedhaPlain: (planets: string, _multi: boolean, lang: Lang) => lang === 'si'
    ? `${planets} සාමාන්‍යයෙන් දැන් ඔබට උදව් කරන නමුත්, තවත් ග්‍රහයෙක් එම ප්‍රතිලාභය අවහිර කරයි — බාධාව පහ වන තෙක් එය මත රඳා නොසිටින්න.`
    : `${planets} would normally be helping you now, but another planet is blocking the benefit — don’t count on it until the block passes.`,

  // Nodes
  nodesTitle: { en: 'Rahu–Ketu axis', si: 'රාහු-කේතු අක්ෂය' },
  nodesPlainTitle: { en: 'Where obsession and letting-go live right now', si: 'දැන් ඇබ්බැහිය හා අත්හැරීම පවතින තැන' },
  nodesPlain: { en: 'Rahu marks where life pulls hardest at your ambition; Ketu marks what you’re being asked to release. They stay put for about 18 months.', si: 'රාහු ඔබේ අභිලාෂය දැඩිම ලෙස ඇදෙන තැන සලකුණු කරයි; කේතු ඔබෙන් අත්හැරීමට ඉල්ලන දේ සලකුණු කරයි. ඔවුන් මාස 18ක් පමණ එතැනම රැඳී සිටිති.' },
};

function roleName(role: string, lang: Lang): string {
  if (lang !== 'si') return role;
  return role === 'Mahadasha' ? 'මහා දශා' : 'අන්තර් දශා';
}

export { P as transitPlanet };
