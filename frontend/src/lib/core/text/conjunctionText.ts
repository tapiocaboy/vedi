/**
 * Bilingual display layer for `conjunctions.ts` — the plain-language reading of
 * two planets sharing a house.
 *
 * Everything here is written for a reader with no astrology background: the
 * classical name is kept as a label, but the explanation next to it says what
 * the combination actually does in daily life. The engine supplies the numbers;
 * this file supplies the words.
 */

import type { Bi, Lang } from '../i18n';
import { pick } from '../i18n';

// ─── Pair readings ─────────────────────────────────────────────────────────

export interface PairReading {
  /** Classical name where one exists, otherwise a plain descriptive title. */
  name: Bi;
  /** What the pairing means, in everyday language. */
  plain: Bi;
  /** What it gives the person. */
  gift: Bi;
  /** What it costs them. */
  cost: Bi;
  /** −2 … +2 — the classical polarity of the combination itself. */
  polarity: number;
}

/** Canonical lookup key for a pair, order-independent: `'Jupiter-Moon'`. */
export function pairKey(a: string, b: string): string {
  return [a, b].sort().join('-');
}

/**
 * Every graha pair that can physically share a sign. Rahu–Ketu is omitted: the
 * nodes are always exactly opposite, so they never occupy the same house.
 */
export const PAIR_READINGS: Record<string, PairReading> = {
  'Jupiter-Ketu': {
    name: { en: 'Guru–Ketu — the detached teacher', si: 'ගුරු–කේතු — වෙන් වූ ගුරුවරයා' },
    plain: {
      en: 'Your planet of growth and belief sits with the planet of letting go. You learn deeply, but you rarely want to trade what you know for status or money.',
      si: 'වර්ධනය හා විශ්වාසය නියෝජනය කරන ග්‍රහයා, අත්හැරීම නියෝජනය කරන ග්‍රහයා සමඟ එකට සිටී. ඔබ ගැඹුරින් ඉගෙන ගනී; නමුත් එම දැනුම තනතුරු හෝ මුදල් සඳහා හුවමාරු කිරීමට ඔබ කැමති නැත.',
    },
    gift: {
      en: 'Real insight, research ability, and freedom from the need to show off.',
      si: 'සැබෑ අවබෝධය, පර්යේෂණ හැකියාව, හා පෙන්වීමේ අවශ්‍යතාවෙන් නිදහස.',
    },
    cost: {
      en: 'Faith can wobble, and you may walk away from chances you had every right to keep.',
      si: 'විශ්වාසය කලින් කලට සෙලවෙයි; ඔබට හිමි අවස්ථා පවා අත්හැර යාමට ඉඩ ඇත.',
    },
    polarity: 0,
  },
  'Jupiter-Mars': {
    name: { en: 'Guru–Mangala — conviction with force', si: 'ගුරු–කුජ — විශ්වාසය හා ක්‍රියාශීලීත්වය' },
    plain: {
      en: 'Belief and drive travel together. Once you decide something is right, you act on it quickly and hard.',
      si: 'විශ්වාසය හා ක්‍රියාශීලීත්වය එකට ගමන් කරයි. යමක් නිවැරදි යැයි ඔබ තීරණය කළ පසු, ඉතා ඉක්මනින් හා තදින් ඒ සඳහා ක්‍රියා කරයි.',
    },
    gift: {
      en: 'Principled courage — good for law, teaching, engineering, sport and leading people.',
      si: 'ධර්මිෂ්ඨ ධෛර්යය — නීතිය, ඉගැන්වීම, ඉංජිනේරු, ක්‍රීඩා හා නායකත්වයට හොඳයි.',
    },
    cost: {
      en: 'Certainty turns into over-reach and preaching; energy burns on defending positions.',
      si: 'තදබල විශ්වාසය අධික ලෙස ඉදිරියට යාමට හා දේශනා කිරීමට යොමු වේ; තර්ක ආරක්ෂා කිරීමට ශක්තිය නාස්ති වේ.',
    },
    polarity: 1,
  },
  'Jupiter-Mercury': {
    name: { en: 'Guru–Budha — the trained mind', si: 'ගුරු–බුධ — පුහුණු වූ මනස' },
    plain: {
      en: 'Big-picture wisdom sits with everyday cleverness, so you can take something complicated and explain it simply.',
      si: 'පුළුල් ඥානය දෛනික දක්ෂතාව සමඟ එකතු වේ; සංකීර්ණ දෙයක් සරලව පැහැදිලි කිරීමේ හැකියාව ඔබට ඇත.',
    },
    gift: {
      en: 'Learning, teaching, writing, advising, negotiating and trade all come naturally.',
      si: 'ඉගෙනීම, ඉගැන්වීම, ලිවීම, උපදෙස් දීම, සාකච්ඡා හා වෙළඳාම ස්වභාවිකවම හොඳින් සිදු වේ.',
    },
    cost: {
      en: 'Thinking can replace doing; you may over-analyse or promise more than the day holds.',
      si: 'කිරීම වෙනුවට සිතීම ඉදිරියට එයි; අධික විශ්ලේෂණය හෝ දිනකට කළ නොහැකි තරම් පොරොන්දු දීම සිදු විය හැක.',
    },
    polarity: 2,
  },
  'Jupiter-Moon': {
    name: { en: 'Gaja Kesari — the elephant and the lion', si: 'ගජකේසරී යෝගය' },
    plain: {
      en: 'Your feelings and your sense of meaning are joined, so people find you steady and worth trusting.',
      si: 'ඔබේ හැඟීම් හා ජීවිතයේ අරුත පිළිබඳ හැඟීම එකට බැඳී ඇත; නිසා අන් අය ඔබ ස්ථාවර හා විශ්වාස කළ හැකි කෙනෙකු ලෙස දකී.',
    },
    gift: {
      en: 'Public goodwill, calm judgement in a crisis, and help that turns up when it is needed.',
      si: 'මහජන කැමැත්ත, අර්බුදයකදී සන්සුන් තීරණ, හා අවශ්‍ය මොහොතේ ලැබෙන උදව්.',
    },
    cost: {
      en: 'Comfort slides into complacency, and generosity can be taken advantage of.',
      si: 'සුවපහසුව නිසා උත්සාහය අඩු විය හැක; ඔබේ ත්‍යාගශීලීත්වය අනුන් විසින් අවභාවිත කළ හැක.',
    },
    polarity: 2,
  },
  'Jupiter-Rahu': {
    name: { en: 'Guru Chandala — wisdom under pressure', si: 'ගුරු චණ්ඩාල යෝගය' },
    plain: {
      en: 'Your guiding values sit with the planet of hunger and shortcuts, so ambition regularly argues with principle.',
      si: 'ඔබට මඟ පෙන්වන සාරධර්ම, ආශාව හා කෙටි මං නියෝජනය කරන ග්‍රහයා සමඟ එකට සිටී; නිසා අභිලාෂය හා ධර්මතාව නිතර ගැටේ.',
    },
    gift: {
      en: 'Unconventional thinking, foreign connections, and the ability to grow very fast.',
      si: 'සම්ප්‍රදායට වෙනස් චින්තනය, විදේශ සම්බන්ධතා, හා ඉතා වේගයෙන් දියුණු වීමේ හැකියාව.',
    },
    cost: {
      en: 'Advice from the wrong people, inflated plans, and grey areas that cost you later.',
      si: 'නොගැළපෙන අයගෙන් උපදෙස්, ඉතා විශාල ලෙස ඇද ගත් සැලසුම්, හා පසුව මිල ගෙවීමට සිදු වන අවිනිශ්චිත තීරණ.',
    },
    polarity: -1,
  },
  'Jupiter-Saturn': {
    name: { en: 'Guru–Shani — the long build', si: 'ගුරු–ශනි — දිගු කාලීන ගොඩනැගීම' },
    plain: {
      en: 'Hope and hard limits sit together. What you build takes longer than you expect — and then it lasts.',
      si: 'බලාපොරොත්තුව හා දැඩි සීමා එකට පවතී. ඔබ ගොඩනඟන දෙය බලාපොරොත්තු වූවාට වඩා කල් ගත වේ; නමුත් එය කල් පවතී.',
    },
    gift: {
      en: 'Maturity ahead of your years, patience, and authority that is slowly but properly earned.',
      si: 'වයසට වඩා පරිණත බව, ඉවසීම, හා සෙමින් නමුත් නිසි ලෙස උපයාගත් බලය.',
    },
    cost: {
      en: 'Delay, pessimism, and stretches where honest effort seems to buy nothing.',
      si: 'ප්‍රමාදය, අශුභවාදී සිතුවිලි, හා අවංක උත්සාහයට ප්‍රතිඵල නොලැබෙන කාල පරාසයන්.',
    },
    polarity: 0,
  },
  'Jupiter-Sun': {
    name: { en: 'Guru–Surya — teacher and king', si: 'ගුරු–සූර්ය — ගුරුවරයා හා රජු' },
    plain: {
      en: 'Confidence sits with conscience. You want to be respected, but for the right reasons.',
      si: 'ආත්ම විශ්වාසය හෘද සාක්ෂිය සමඟ එකට පවතී. ඔබට ගෞරවය අවශ්‍යයි — නමුත් නිවැරදි හේතු මත.',
    },
    gift: {
      en: 'Natural authority, good mentors, and recognition in teaching, law, government or advice.',
      si: 'ස්වභාවික නායකත්වය, හොඳ ගුරුවරු, හා ඉගැන්වීම, නීතිය, රාජ්‍ය සේවය හෝ උපදේශනයේ පිළිගැනීම.',
    },
    cost: {
      en: 'Pride, moralising, and difficulty taking correction from anyone else.',
      si: 'අහංකාරය, අනුන්ට උපදෙස් දීමේ පුරුද්ද, හා අන් අයගේ නිවැරදි කිරීම් පිළිගැනීමේ අපහසුව.',
    },
    polarity: 1,
  },
  'Jupiter-Venus': {
    name: { en: 'Guru–Shukra — meaning and comfort', si: 'ගුරු–ශුක්‍ර — අරුත හා සුවපහසුව' },
    plain: {
      en: 'The planet of growth sits with the planet of pleasure. Life brings both beauty and abundance — though these two want different things from you.',
      si: 'වර්ධනයේ ග්‍රහයා සැපයේ ග්‍රහයා සමඟ එකට සිටී. ජීවිතයට සුන්දරත්වය හා සමෘද්ධිය දෙකම ලැබේ — නමුත් මේ දෙදෙනා ඔබෙන් ඉල්ලන්නේ වෙනස් දේවල් ය.',
    },
    gift: {
      en: 'Taste, charm, prosperity, and genuine enjoyment of what you earn.',
      si: 'රසඥතාව, ආකර්ෂණය, සමෘද්ධිය, හා උපයන දෙය සැබෑ ලෙස භුක්ති විඳීම.',
    },
    cost: {
      en: 'Indulgence, overspending, and mixed signals about what you actually value.',
      si: 'අධික භුක්ති විඳීම, අධික වියදම්, හා ඔබ ඇත්තටම අගය කරන්නේ කුමක්ද යන්න පිළිබඳ පැටලීම.',
    },
    polarity: 1,
  },

  'Ketu-Mars': {
    name: { en: 'Ketu–Mangala — sharp and sudden', si: 'කේතු–කුජ — තියුණු හා හදිසි' },
    plain: {
      en: 'Raw drive sits with the planet that cuts things away. You act in fast bursts, and lose interest just as fast.',
      si: 'නොසන්සුන් ශක්තිය, කපා දැමීම නියෝජනය කරන ග්‍රහයා සමඟ එකට සිටී. ඔබ හදිසි වේගයෙන් ක්‍රියා කරයි; එතරම්ම ඉක්මනින් උනන්දුව අඩු වේ.',
    },
    gift: {
      en: 'Technical precision, surgical or mechanical skill, and no fear in a crisis.',
      si: 'තාක්ෂණික නිරවද්‍යතාව, ශල්‍ය හෝ යාන්ත්‍රික කුසලතා, හා අර්බුදයකදී බියක් නොමැති බව.',
    },
    cost: {
      en: 'Accidents, sudden temper, and bridges burned that you meant to keep.',
      si: 'අනතුරු, හදිසි කෝපය, හා රැක ගත යුතුව තිබූ සම්බන්ධතා හදිසියේ බිඳී යාම.',
    },
    polarity: -1,
  },
  'Ketu-Mercury': {
    name: { en: 'Ketu–Budha — the quiet analyst', si: 'කේතු–බුධ — නිහඬ විශ්ලේෂකයා' },
    plain: {
      en: 'Your thinking mind sits with the planet of withdrawal. You understand things you cannot always put into words.',
      si: 'ඔබේ චින්තන මනස, ඉවත් වීම නියෝජනය කරන ග්‍රහයා සමඟ එකට සිටී. වචනවලින් පැහැදිලි කළ නොහැකි දේ ඔබට වැටහේ.',
    },
    gift: {
      en: 'Deep research, pattern-spotting, coding, mantra, and skill you taught yourself.',
      si: 'ගැඹුරු පර්යේෂණ, රටා හඳුනා ගැනීම, පරිගණක වැඩ, මන්ත්‍ර, හා තනිව ඉගෙන ගත් කුසලතා.',
    },
    cost: {
      en: 'Communication gaps, nervous overload, and second-guessing your own conclusions.',
      si: 'සන්නිවේදන හිඩැස්, ස්නායු වෙහෙස, හා තමන්ගේම නිගමන ගැන නැවත නැවත සැක කිරීම.',
    },
    polarity: 0,
  },
  'Ketu-Moon': {
    name: { en: 'Ketu–Chandra — the unattached heart', si: 'කේතු–චන්ද්‍ර — නොබැඳුණු හදවත' },
    plain: {
      en: 'Your emotional nature sits with the planet of release. You feel deeply, but a part of you always stays separate.',
      si: 'ඔබේ හැඟීම්බර ස්වභාවය, අත්හැරීමේ ග්‍රහයා සමඟ එකට සිටී. ඔබ ගැඹුරින් දැනේ; නමුත් ඔබේ කොටසක් සැමවිටම වෙන්ව සිටී.',
    },
    gift: {
      en: 'Intuition, spiritual calm, and a clean ability to move on.',
      si: 'අවබෝධය, අධ්‍යාත්මික සන්සුන්කම, හා පිරිසිදු ලෙස ඉදිරියට යාමේ හැකියාව.',
    },
    cost: {
      en: 'Loneliness, mood dips, and a sense that something is missing even in good times.',
      si: 'තනිකම, සිතේ පහත් වීම්, හා හොඳ කාලවලදී පවා යමක් අඩුයි යන හැඟීම.',
    },
    polarity: -1,
  },
  'Ketu-Saturn': {
    name: { en: 'Ketu–Shani — the renunciate road', si: 'කේතු–ශනි — අත්හැරීමේ මාවත' },
    plain: {
      en: 'Duty sits with detachment. You carry responsibilities without expecting much back for them.',
      si: 'යුතුකම, වෙන් වීම සමඟ එකට පවතී. ප්‍රතිලාභ බලාපොරොත්තු නොවී ඔබ වගකීම් දරයි.',
    },
    gift: {
      en: 'Endurance, simplicity, and freedom from needing anyone’s approval.',
      si: 'දරාගැනීමේ හැකියාව, සරල බව, හා අනුන්ගේ අනුමැතිය අවශ්‍ය නොවීම.',
    },
    cost: {
      en: 'Isolation, low motivation, and long stretches that feel joyless.',
      si: 'හුදෙකලාව, උනන්දුව අඩු වීම, හා සතුටක් නොදැනෙන දිගු කාල පරාසයන්.',
    },
    polarity: -1,
  },
  'Ketu-Sun': {
    name: { en: 'Ketu–Surya — the hidden self', si: 'කේතු–සූර්ය — සැඟවුණු ආත්මය' },
    plain: {
      en: 'Your identity sits with the planet that dissolves things, so recognition rarely arrives the ordinary way.',
      si: 'ඔබේ ආත්මය, දේවල් දිය කර හරින ග්‍රහයා සමඟ එකට සිටී; නිසා පිළිගැනීම සාමාන්‍ය මාර්ගයෙන් ලැබෙන්නේ කලාතුරකිනි.',
    },
    gift: {
      en: 'Independence from praise, spiritual depth, and strong research instincts.',
      si: 'ප්‍රශංසාවෙන් නිදහස, අධ්‍යාත්මික ගැඹුර, හා ප්‍රබල පර්යේෂණ නැඹුරුව.',
    },
    cost: {
      en: 'Confidence dips, distance from father or authority, and credit going to other people.',
      si: 'ආත්ම විශ්වාසය අඩු වීම, පියා හෝ ඉහළ නිලධාරීන් සමඟ දුරස්ථභාවය, හා ඔබේ ගෞරවය අන් අයට යාම.',
    },
    polarity: -1,
  },
  'Ketu-Venus': {
    name: { en: 'Ketu–Shukra — love held loosely', si: 'කේතු–ශුක්‍ර — ලිහිල්ව අල්ලාගත් ආදරය' },
    plain: {
      en: 'Pleasure and relationships sit with the planet of letting go, so you want closeness and space at the same time.',
      si: 'සැපය හා සම්බන්ධතා, අත්හැරීමේ ග්‍රහයා සමඟ එකට පවතී; නිසා ළං වීමත් නිදහසත් එකවර අවශ්‍ය වේ.',
    },
    gift: {
      en: 'Original artistic taste, and freedom from needing to impress anybody.',
      si: 'සුවිශේෂී කලාත්මක රසඥතාව, හා අනුන් සතුටු කිරීමේ අවශ්‍යතාවෙන් නිදහස.',
    },
    cost: {
      en: 'An unsettled love life, dissatisfaction with what you have, and on-off attachments.',
      si: 'ස්ථාවර නොවන ප්‍රේම ජීවිතය, ඇති දෙයින් නොසෑහීම, හා නිතර වෙනස් වන බැඳීම්.',
    },
    polarity: -1,
  },

  'Mars-Mercury': {
    name: { en: 'Mangala–Budha — the sharp tongue', si: 'කුජ–බුධ — තියුණු කථාව' },
    plain: {
      en: 'Quick thinking sits with quick action. You decide fast and say what you think.',
      si: 'වේගවත් සිතීම වේගවත් ක්‍රියාව සමඟ එකට පවතී. ඔබ ඉක්මනින් තීරණ ගනී, සිතන දෙය කියයි.',
    },
    gift: {
      en: 'Debate, selling, engineering, surgery, strategy — anything that rewards speed.',
      si: 'තර්ක කිරීම, විකිණීම, ඉංජිනේරු, ශල්‍යකර්ම, උපායමාර්ග — වේගය අවශ්‍ය ඕනෑම දෙයක්.',
    },
    cost: {
      en: 'Arguments, hasty words, and decisions made before all the facts are in.',
      si: 'වාද විවාද, හදිසි වචන, හා සියලු කරුණු දැනගැනීමට පෙර ගන්නා තීරණ.',
    },
    polarity: 0,
  },
  'Mars-Moon': {
    name: { en: 'Chandra–Mangala — feeling with fuel', si: 'චන්ද්‍ර–මංගල යෝගය' },
    plain: {
      en: 'Your emotions come with fuel behind them. When you care about something, you push hard for it.',
      si: 'ඔබේ හැඟීම් පිටුපස ප්‍රබල ශක්තියක් ඇත. යමක් ගැන ඔබ තැකීමක් කරන විට, ඒ සඳහා තදින් උත්සාහ කරයි.',
    },
    gift: {
      en: 'Earning power, initiative, protectiveness, and success in property or trade.',
      si: 'උපයන ශක්තිය, මුල පිරීම, ආරක්ෂාකාරී ස්වභාවය, හා දේපළ හෝ වෙළඳාමේ සාර්ථකත්වය.',
    },
    cost: {
      en: 'Irritability, reactions you regret, and friction at home or over property.',
      si: 'කෝපය, පසුතැවීමට හේතු වන ප්‍රතිචාර, හා නිවසේ හෝ දේපළ සම්බන්ධ ගැටුම්.',
    },
    polarity: 1,
  },
  'Mars-Rahu': {
    name: { en: 'Angaraka — the pressure cooker', si: 'අඟාරක යෝගය — පීඩන කේෂ්ත්‍රය' },
    plain: {
      en: 'Drive sits with obsession. You can achieve an enormous amount in short bursts, at a high level of stress.',
      si: 'ක්‍රියාශීලීත්වය, ලෝභය සමඟ එකට පවතී. කෙටි කාලයකදී විශාල දේ කළ හැක — නමුත් ඉතා ඉහළ පීඩනයක් යටතේ.',
    },
    gift: {
      en: 'Fearless ambition, competitiveness, and the nerve to take big swings.',
      si: 'නිර්භීත අභිලාෂය, තරඟකාරී බව, හා විශාල අවදානම් ගැනීමේ ධෛර්යය.',
    },
    cost: {
      en: 'Accidents, disputes, addictions and burnout; risk-taking gets out of proportion.',
      si: 'අනතුරු, ආරවුල්, ඇබ්බැහි වීම් හා වෙහෙසට පත් වීම; අවදානම් ගැනීම සීමාව ඉක්මවා යයි.',
    },
    polarity: -2,
  },
  'Mars-Saturn': {
    name: { en: 'Mangala–Shani — accelerator and brake', si: 'කුජ–ශනි — ත්වරකය හා තිරිංගය' },
    plain: {
      en: 'Your drive sits with your limits. You push, something pushes back, and progress comes out of that friction.',
      si: 'ඔබේ ක්‍රියාශීලීත්වය ඔබේ සීමා සමඟ එකට පවතී. ඔබ තල්ලු කරයි, යමක් ආපසු තල්ලු කරයි — ප්‍රගතිය එන්නේ එම ඝර්ෂණයෙනි.',
    },
    gift: {
      en: 'Discipline under pressure, stamina, and mastery of genuinely hard technical work.',
      si: 'පීඩනය යටතේ විනය, විඳදරාගැනීම, හා අමාරු තාක්ෂණික වැඩවල ප්‍රවීණත්වය.',
    },
    cost: {
      en: 'Frustration, strain or injury, and a habit of forcing what needs patience.',
      si: 'කලකිරීම, ශාරීරික වෙහෙස හෝ තුවාල, හා ඉවසීම අවශ්‍ය තැන බලෙන් කිරීමේ පුරුද්ද.',
    },
    polarity: -1,
  },
  'Mars-Sun': {
    name: { en: 'Surya–Mangala — the commander', si: 'සූර්ය–කුජ — අණදෙන නායකයා' },
    plain: {
      en: 'Identity and drive sit together. You lead from the front and do not enjoy being told what to do.',
      si: 'ආත්මය හා ක්‍රියාශීලීත්වය එකට පවතී. ඔබ ඉදිරියෙන් සිට නායකත්වය දෙයි; අණ ලැබීමට කැමති නැත.',
    },
    gift: {
      en: 'Courage, authority, physical vitality, and fast decisions.',
      si: 'ධෛර්යය, බලය, ශාරීරික ශක්තිය, හා වේගවත් තීරණ.',
    },
    cost: {
      en: 'Temper, ego clashes with bosses or father, and a tendency to run yourself flat.',
      si: 'කෝපය, ඉහළ නිලධාරීන් හෝ පියා සමඟ ගැටුම්, හා තමන් වෙහෙසට පත් කර ගැනීමේ නැඹුරුව.',
    },
    polarity: 0,
  },
  'Mars-Venus': {
    name: { en: 'Mangala–Shukra — desire and drive', si: 'කුජ–ශුක්‍ර — ආශාව හා ක්‍රියාව' },
    plain: {
      en: 'Attraction sits with action: you go after what — and who — you want.',
      si: 'ආකර්ෂණය ක්‍රියාව සමඟ එකට පවතී: ඔබට අවශ්‍ය දේ හා අවශ්‍ය අය ලුහුබැඳ යයි.',
    },
    gift: {
      en: 'Magnetism, creative energy, and skill in art, design or anything physical.',
      si: 'ආකර්ෂණීය බව, නිර්මාණශීලී ශක්තිය, හා කලා, නිර්මාණ හෝ ශාරීරික ක්ෂේත්‍රවල දක්ෂතාව.',
    },
    cost: {
      en: 'Impulsive relationships, jealousy, and money leaving as fast as it arrives.',
      si: 'හදිසි සම්බන්ධතා, ඊර්ෂ්‍යාව, හා ලැබෙන වේගයෙන්ම මුදල් වැය වීම.',
    },
    polarity: 0,
  },

  'Mercury-Moon': {
    name: { en: 'Budha–Chandra — the talking mind', si: 'බුධ–චන්ද්‍ර — කථා කරන මනස' },
    plain: {
      en: 'Your mind and your feelings are wired together — you think out loud, and you feel through words.',
      si: 'ඔබේ මනස හා හැඟීම් එකට බැඳී ඇත — ඔබ ශබ්ද නඟා සිතයි, වචන හරහා දැනේ.',
    },
    gift: {
      en: 'Communication, empathy, business sense and fast learning.',
      si: 'සන්නිවේදනය, අන් අය තේරුම් ගැනීම, ව්‍යාපාරික බුද්ධිය හා ඉක්මන් ඉගෙනීම.',
    },
    cost: {
      en: 'Overthinking, worry, and real difficulty switching the mind off.',
      si: 'අධික ලෙස සිතීම, කනස්සල්ල, හා මනස නිශ්ශබ්ද කිරීමේ අපහසුව.',
    },
    polarity: 1,
  },
  'Mercury-Rahu': {
    name: { en: 'Budha–Rahu — the clever operator', si: 'බුධ–රාහු — දක්ෂ උපායශීලියා' },
    plain: {
      en: 'Your intelligence sits with ambition and unusual wiring, so you spot angles other people miss.',
      si: 'ඔබේ බුද්ධිය, අභිලාෂය හා අසාමාන්‍ය චින්තනය සමඟ එකට පවතී; අන් අයට නොපෙනෙන මාර්ග ඔබට පෙනේ.',
    },
    gift: {
      en: 'Technology, media, marketing, foreign and modern fields; you pick things up fast.',
      si: 'තාක්ෂණය, මාධ්‍ය, අලෙවිකරණය, විදේශීය හා නවීන ක්ෂේත්‍ර; ඔබ ඉතා ඉක්මනින් දේවල් ග්‍රහණය කරයි.',
    },
    cost: {
      en: 'Overclaiming, scattered focus, anxiety, and shortcuts that create trouble later.',
      si: 'අධික ලෙස පොරොන්දු වීම, අවධානය විසිරීම, කනස්සල්ල, හා පසුව කරදර ගෙන දෙන කෙටි මං.',
    },
    polarity: -1,
  },
  'Mercury-Saturn': {
    name: { en: 'Budha–Shani — the careful mind', si: 'බුධ–ශනි — ප්‍රවේශම් මනස' },
    plain: {
      en: 'Thinking sits with caution. You check things twice, and you rarely say what you have not verified.',
      si: 'සිතීම ප්‍රවේශම සමඟ එකට පවතී. ඔබ දෙවරක් පරීක්ෂා කරයි; තහවුරු නොකළ දෙයක් කියන්නේ නැත.',
    },
    gift: {
      en: 'Precision, structure, research, accounting, law, and long concentration.',
      si: 'නිරවද්‍යතාව, පිළිවෙළ, පර්යේෂණ, ගිණුම්කරණය, නීතිය, හා දිගු වේලාවක් අවධානය තබා ගැනීම.',
    },
    cost: {
      en: 'Slow decisions, self-doubt, and speech that comes across colder than you mean.',
      si: 'මන්දගාමී තීරණ, තමන් ගැන සැකය, හා අදහස් කළාට වඩා සීතල ලෙස ඇසෙන කථාව.',
    },
    polarity: 0,
  },
  'Mercury-Sun': {
    name: { en: 'Budhaditya — the bright intellect', si: 'බුධාදිත්‍ය යෝගය' },
    plain: {
      en: 'Your identity and your intelligence work as one — you are known for how you think and how you speak.',
      si: 'ඔබේ ආත්මය හා බුද්ධිය එකක් ලෙස ක්‍රියා කරයි — ඔබ හඳුනා ගන්නේ ඔබේ සිතීම හා කථාව නිසාය.',
    },
    gift: {
      en: 'Study, writing, analysis, administration, and respect for professional competence.',
      si: 'අධ්‍යයනය, ලේඛනය, විශ්ලේෂණය, පරිපාලනය, හා වෘත්තීය දක්ෂතාවට ලැබෙන ගෞරවය.',
    },
    cost: {
      en: 'Very close to the Sun the ideas get overshadowed by ego, and the nerves run hot.',
      si: 'සූර්යයාට ඉතා ළං වූ විට අදහස් අහංකාරය යටතේ යටපත් වේ; ස්නායු වෙහෙසට පත් වේ.',
    },
    polarity: 1,
  },
  'Mercury-Venus': {
    name: { en: 'Budha–Shukra — taste and skill', si: 'බුධ–ශුක්‍ර — රසඥතාව හා කුසලතාව' },
    plain: {
      en: 'Cleverness sits with charm, so you make things other people find attractive and easy to like.',
      si: 'දක්ෂතාව ආකර්ෂණය සමඟ එකට පවතී; ඔබ නිර්මාණය කරන දේවලට අන් අය ඉක්මනින් කැමති වේ.',
    },
    gift: {
      en: 'Design, writing, media, negotiation, and money made from creative work.',
      si: 'නිර්මාණ, ලේඛනය, මාධ්‍ය, සාකච්ඡා, හා නිර්මාණශීලී වැඩවලින් ලැබෙන ආදායම.',
    },
    cost: {
      en: 'Comfort-seeking, indecision, and telling people what they want to hear.',
      si: 'පහසුව සොයා යාම, තීරණ ගැනීමේ අපහසුව, හා අන් අයට ඇසීමට කැමති දේ කීම.',
    },
    polarity: 2,
  },

  'Moon-Rahu': {
    name: { en: 'Grahana — the restless mind', si: 'ග්‍රහණ යෝගය — නොසන්සුන් මනස' },
    plain: {
      en: 'Your emotional mind sits with the planet of craving, so feelings arrive amplified and hard to place.',
      si: 'ඔබේ හැඟීම්බර මනස, ආශාවේ ග්‍රහයා සමඟ එකට සිටී; නිසා හැඟීම් විශාල වී, හඳුනා ගැනීම අපහසු වේ.',
    },
    gift: {
      en: 'Imagination, magnetism, unusual insight, and success far from where you were born.',
      si: 'පරිකල්පනය, ආකර්ෂණය, අසාමාන්‍ය අවබෝධය, හා උපන් ස්ථානයෙන් ඈත සාර්ථකත්වය.',
    },
    cost: {
      en: 'Anxiety, disturbed sleep, illusions about people, and swings of mood.',
      si: 'කනස්සල්ල, නින්ද කැළඹීම, මිනිසුන් ගැන වැරදි වැටහීම්, හා සිතේ උස් පහත් වීම්.',
    },
    polarity: -2,
  },
  'Moon-Saturn': {
    name: { en: 'Vish Yoga — the heavy heart', si: 'විෂ යෝගය — බර හදවත' },
    plain: {
      en: 'Your feelings sit with the planet of limits. You take life seriously and carry more than you let on.',
      si: 'ඔබේ හැඟීම්, සීමා නියෝජනය කරන ග්‍රහයා සමඟ එකට පවතී. ඔබ ජීවිතය බැරෑරුම් ලෙස ගනී; පෙන්වන දෙයට වඩා බරක් දරයි.',
    },
    gift: {
      en: 'Emotional endurance, realism, and a dependability other people lean on.',
      si: 'හැඟීම් දරාගැනීමේ හැකියාව, යථාර්ථවාදී බව, හා අන් අය විශ්වාස කරන ස්ථාවරත්වය.',
    },
    cost: {
      en: 'Low moods, loneliness, and difficulty either asking for help or feeling satisfied.',
      si: 'මානසික පහත් වීම්, තනිකම, හා උදව් ඉල්ලීමට හෝ සෑහීමට පත් වීමට ඇති අපහසුව.',
    },
    polarity: -2,
  },
  'Moon-Sun': {
    name: { en: 'Amavasya — the new-moon self', si: 'අමාවක සංයෝගය' },
    plain: {
      en: 'Your outer self and your inner self sit together, so who you are and how you feel are hard to separate.',
      si: 'ඔබේ බාහිර ආත්මය හා අභ්‍යන්තර හැඟීම් එකට පවතී; නිසා ඔබ කවුරුන්ද යන්නත් ඔබට දැනෙන දෙයත් වෙන් කිරීම අපහසුය.',
    },
    gift: {
      en: 'Self-honesty, strong instincts, and a clear sense of your own direction.',
      si: 'තමන් ගැන අවංක බව, ප්‍රබල අවබෝධය, හා තමන්ගේ මාර්ගය ගැන පැහැදිලි හැඟීමක්.',
    },
    cost: {
      en: 'Mood governs confidence, emotional reserves run low, and mother and father matters get tangled together.',
      si: 'සිතේ තත්ත්වය අනුව විශ්වාසය වෙනස් වේ, මානසික ශක්තිය අඩු වේ, හා මව හා පියා සම්බන්ධ කරුණු එකට පැටලේ.',
    },
    polarity: -1,
  },
  'Moon-Venus': {
    name: { en: 'Chandra–Shukra — the warm heart', si: 'චන්ද්‍ර–ශුක්‍ර — උණුසුම් හදවත' },
    plain: {
      en: 'Feeling sits with pleasure and love, so comfort, beauty and relationships matter to you deeply.',
      si: 'හැඟීම, සැපය හා ආදරය සමඟ එකට පවතී; නිසා සුවපහසුව, සුන්දරත්වය හා සම්බන්ධතා ඔබට ඉතා වැදගත් වේ.',
    },
    gift: {
      en: 'Charm, popularity, artistic feeling, and comfort that arrives without a fight.',
      si: 'ආකර්ෂණය, ජනප්‍රියත්වය, කලාත්මක හැඟීම, හා අමාරුවකින් තොරව ලැබෙන සුවපහසුව.',
    },
    cost: {
      en: 'Emotional dependence, spending on comfort, and side-stepping hard truths.',
      si: 'හැඟීම් අතින් අන් අය මත රඳා පැවතීම, සුවපහසුව සඳහා වියදම, හා අමාරු සත්‍ය මඟ හැරීම.',
    },
    polarity: 1,
  },

  'Rahu-Saturn': {
    name: { en: 'Shani–Rahu — the long grind', si: 'ශනි–රාහු — දිගු අරගලය' },
    plain: {
      en: 'Ambition sits with restriction. Results do come, but only after genuine hardship and a long wait.',
      si: 'අභිලාෂය, සීමා කිරීම සමඟ එකට පවතී. ප්‍රතිඵල ලැබේ — නමුත් සැබෑ දුෂ්කරතා හා දිගු බලා සිටීමකින් පසුවය.',
    },
    gift: {
      en: 'Extraordinary persistence, and success in large systems, foreign lands or hard industries.',
      si: 'අසාමාන්‍ය නොපසුබට උත්සාහය, හා විශාල ආයතන, විදේශ රටවල් හෝ දුෂ්කර කර්මාන්තවල සාර්ථකත්වය.',
    },
    cost: {
      en: 'Chronic stress, delay, health strain, and deals that cost more than they promised.',
      si: 'නිරන්තර මානසික පීඩනය, ප්‍රමාදය, සෞඛ්‍ය දුර්වලතා, හා පොරොන්දු වූවාට වඩා මිල අධික ගනුදෙනු.',
    },
    polarity: -2,
  },
  'Rahu-Sun': {
    name: { en: 'Grahana — the eclipsed self', si: 'ග්‍රහණ යෝගය — ග්‍රහණයට ලක් වූ ආත්මය' },
    plain: {
      en: 'Your identity sits with the planet of hunger, so recognition matters intensely — and rarely arrives the way you pictured it.',
      si: 'ඔබේ ආත්මය, ආශාවේ ග්‍රහයා සමඟ එකට සිටී; නිසා පිළිගැනීම ඉතා වැදගත් වේ — නමුත් එය ඔබ සිතූ ආකාරයට ලැබෙන්නේ කලාතුරකිනි.',
    },
    gift: {
      en: 'Large ambition, unusual career paths, and pull with crowds or foreign contacts.',
      si: 'විශාල අභිලාෂය, අසාමාන්‍ය වෘත්තීය මාර්ග, හා ජනකායක් හෝ විදේශ සම්බන්ධතා ආකර්ෂණය කර ගැනීමේ හැකියාව.',
    },
    cost: {
      en: 'Reputation risk, confidence swings, and friction with father or authority.',
      si: 'කීර්තියට අවදානම, විශ්වාසය උස් පහත් වීම, හා පියා හෝ ඉහළ නිලධාරීන් සමඟ ගැටුම්.',
    },
    polarity: -2,
  },
  'Rahu-Venus': {
    name: { en: 'Shukra–Rahu — the strong appetite', si: 'ශුක්‍ර–රාහු — තීව්‍ර ආශාව' },
    plain: {
      en: 'Pleasure sits with craving — whatever you enjoy, you want a lot of it.',
      si: 'සැපය, ආශාව සමඟ එකට පවතී — ඔබ කැමති දෙය ඉතා විශාල ප්‍රමාණයකින් අවශ්‍ය වේ.',
    },
    gift: {
      en: 'Magnetism, style, creative flair, and gains from foreign or modern fields.',
      si: 'ආකර්ෂණය, විලාසිතාව, නිර්මාණශීලී හැකියාව, හා විදේශීය හෝ නවීන ක්ෂේත්‍රවලින් ලාභ.',
    },
    cost: {
      en: 'Excess in love, food or spending, and relationships that quietly complicate life.',
      si: 'ආදරය, ආහාර හෝ වියදම්වල අධික බව, හා ජීවිතය සංකීර්ණ කරන සම්බන්ධතා.',
    },
    polarity: -1,
  },
  'Saturn-Sun': {
    name: { en: 'Surya–Shani — the earned crown', si: 'සූර්ය–ශනි — උපයාගත් කිරුළ' },
    plain: {
      en: 'Your confidence sits with your hardest teacher. Nothing arrives free — and what you do get, you keep.',
      si: 'ඔබේ ආත්ම විශ්වාසය, ඔබේ දැඩිම ගුරුවරයා සමඟ එකට පවතී. නොමිලේ කිසිවක් නොලැබේ — නමුත් ලැබෙන දෙය ඔබ සතුව රැඳේ.',
    },
    gift: {
      en: 'Integrity, responsibility, and authority that is earned rather than handed over.',
      si: 'අවංකභාවය, වගකීම, හා දෙනු ලැබීම වෙනුවට උපයාගත් බලය.',
    },
    cost: {
      en: 'Slow recognition, distance from father or bosses, and self-doubt in the early years.',
      si: 'ප්‍රමාද වූ පිළිගැනීම, පියා හෝ ඉහළ නිලධාරීන් සමඟ දුරස්ථභාවය, හා තරුණ කාලයේ තමන් ගැන සැකය.',
    },
    polarity: -1,
  },
  'Saturn-Venus': {
    name: { en: 'Shukra–Shani — love under contract', si: 'ශුක්‍ර–ශනි — කොන්දේසි සහිත ආදරය' },
    plain: {
      en: 'Pleasure sits with duty, so relationships and money both arrive with conditions attached.',
      si: 'සැපය යුතුකම සමඟ එකට පවතී; නිසා සම්බන්ධතා හා මුදල් යන දෙකම කොන්දේසි සහිතව ලැබේ.',
    },
    gift: {
      en: 'Loyalty, staying power, and wealth that builds steadily instead of suddenly.',
      si: 'විශ්වාසවන්තභාවය, දිගු කල් රැඳී සිටීමේ හැකියාව, හා හදිසියේ නොව ක්‍රමයෙන් ගොඩනැගෙන ධනය.',
    },
    cost: {
      en: 'Delayed marriage or affection, coolness, and joy that has to be scheduled.',
      si: 'විවාහය හෝ ආදරය ප්‍රමාද වීම, සීතල බව, හා සැලසුම් කර ලබා ගත යුතු සතුට.',
    },
    polarity: 0,
  },
  'Sun-Venus': {
    name: { en: 'Surya–Shukra — dignity and charm', si: 'සූර්ය–ශුක්‍ර — ගෞරවය හා ආකර්ෂණය' },
    plain: {
      en: 'Your identity sits with the planet of pleasure and partnership, so you shine socially and in creative work.',
      si: 'ඔබේ ආත්මය, සැපය හා හවුල්කාරිත්වයේ ග්‍රහයා සමඟ එකට සිටී; නිසා සමාජයේ හා නිර්මාණශීලී වැඩවල ඔබ බබළයි.',
    },
    gift: {
      en: 'Popularity, artistic ability, good taste, and gains through partners.',
      si: 'ජනප්‍රියත්වය, කලාත්මක හැකියාව, හොඳ රසඥතාව, හා හවුල්කරුවන් හරහා ලාභ.',
    },
    cost: {
      en: 'Ego inside relationships, expensive taste, and pride that takes rejection badly.',
      si: 'සම්බන්ධතාවල අහංකාරය, මිල අධික රුචිකත්වයන්, හා ප්‍රතික්ෂේප වීම දරාගත නොහැකි අභිමානය.',
    },
    polarity: 0,
  },
};

export function getPairReading(a: string, b: string): PairReading | null {
  return PAIR_READINGS[pairKey(a, b)] ?? null;
}

// ─── Plain house descriptions ──────────────────────────────────────────────

/** What each house covers, written for someone who has never read a chart. */
export const HOUSE_PLAIN: Record<number, Bi> = {
  1: { en: 'your body, personality and the way you start things', si: 'ඔබේ සිරුර, පෞරුෂය හා දේවල් ආරම්භ කරන ආකාරය' },
  2: { en: 'money you keep, family, food and how you speak', si: 'ඔබ රැස් කරන මුදල්, පවුල, ආහාර හා කථා කරන ආකාරය' },
  3: { en: 'effort, courage, siblings and everyday communication', si: 'උත්සාහය, ධෛර්යය, සහෝදරයන් හා දෛනික සන්නිවේදනය' },
  4: { en: 'home, mother, property and peace of mind', si: 'නිවස, මව, දේපළ හා සිතේ සැනසීම' },
  5: { en: 'children, romance, creativity and studies', si: 'දරුවන්, ප්‍රේමය, නිර්මාණශීලීත්වය හා අධ්‍යාපනය' },
  6: { en: 'health, daily work, debts and competition', si: 'සෞඛ්‍යය, දෛනික වැඩ, ණය හා තරඟය' },
  7: { en: 'marriage, business partners and dealings with the public', si: 'විවාහය, ව්‍යාපාරික හවුල්කරුවන් හා මහජන ගනුදෙනු' },
  8: { en: 'sudden change, shared money, secrets and long life', si: 'හදිසි වෙනස්කම්, හවුල් මුදල්, රහස් හා ආයුෂ' },
  9: { en: 'luck, beliefs, higher study, father and long journeys', si: 'වාසනාව, විශ්වාස, උසස් අධ්‍යාපනය, පියා හා දිගු ගමන්' },
  10: { en: 'career, reputation and what you are known for', si: 'වෘත්තිය, කීර්තිය හා ඔබ හඳුනා ගන්නා ආකාරය' },
  11: { en: 'income, friends, networks and things you hope for', si: 'ආදායම, මිතුරන්, සම්බන්ධතා ජාල හා බලාපොරොත්තු' },
  12: { en: 'expenses, rest, foreign places and letting go', si: 'වියදම්, විවේකය, විදේශ ගමන් හා අත්හැරීම' },
};

export function housePlain(n: number, lang: Lang): string {
  const b = HOUSE_PLAIN[n];
  return b ? pick(b, lang) : '';
}

/** Two-word version, for sentences that list several houses at once. */
export const HOUSE_SHORT: Record<number, Bi> = {
  1: { en: 'your body & self', si: 'සිරුර හා ආත්මය' },
  2: { en: 'money & family', si: 'ධනය හා පවුල' },
  3: { en: 'effort & siblings', si: 'උත්සාහය හා සහෝදරයන්' },
  4: { en: 'home & mother', si: 'නිවස හා මව' },
  5: { en: 'children & creativity', si: 'දරුවන් හා නිර්මාණ' },
  6: { en: 'health & rivals', si: 'සෞඛ්‍යය හා තරඟකරුවන්' },
  7: { en: 'marriage & partners', si: 'විවාහය හා හවුල්කරුවන්' },
  8: { en: 'change & shared money', si: 'වෙනස්කම් හා හවුල් මුදල්' },
  9: { en: 'luck & beliefs', si: 'වාසනාව හා විශ්වාස' },
  10: { en: 'career & reputation', si: 'වෘත්තිය හා කීර්තිය' },
  11: { en: 'income & friends', si: 'ආදායම හා මිතුරන්' },
  12: { en: 'expenses & letting go', si: 'වියදම් හා අත්හැරීම' },
};

export function houseShort(n: number, lang: Lang): string {
  const b = HOUSE_SHORT[n];
  return b ? pick(b, lang) : '';
}

// ─── Discrete labels ───────────────────────────────────────────────────────

/** How tightly the two planets are joined. */
export const ORB_BAND_LABEL: Record<string, Bi> = {
  yuddha: { en: 'Planetary war', si: 'ග්‍රහ යුද්ධය' },
  exact: { en: 'Locked together', si: 'තදින් බැඳී ඇත' },
  close: { en: 'Closely joined', si: 'ළඟින් බැඳී ඇත' },
  moderate: { en: 'Clearly joined', si: 'පැහැදිලිව බැඳී ඇත' },
  wide: { en: 'Loosely joined', si: 'ලිහිල්ව බැඳී ඇත' },
};

export const ORB_BAND_PLAIN: Record<string, Bi> = {
  yuddha: {
    en: 'Under one degree apart — the two are fighting for the same space, and one of them gives way.',
    si: 'අංශක එකකට වඩා අඩුයි — දෙදෙනාම එකම ඉඩ සඳහා තරඟ කරයි; එක් අයෙකු පසුබසී.',
  },
  exact: {
    en: 'Within a few degrees — these two act as a single force almost all of the time.',
    si: 'අංශක කිහිපයක් ඇතුළත — මේ දෙදෙනා බොහෝ විට එකම බලවේගයක් ලෙස ක්‍රියා කරයි.',
  },
  close: {
    en: 'Close enough that they blend strongly and show up together in most situations.',
    si: 'ප්‍රබල ලෙස මිශ්‍ර වන තරම් ළඟයි; බොහෝ අවස්ථාවලදී එකට පෙනී සිටී.',
  },
  moderate: {
    en: 'Joined, but each keeps some of its own character — they take turns rather than fusing.',
    si: 'බැඳී ඇත; නමුත් එක් එක් අය තම ස්වභාවය රඳවා ගනී — මිශ්‍ර වනවා වෙනුවට වාරයෙන් වාරයට ක්‍රියා කරයි.',
  },
  wide: {
    en: 'They share the same area of life, but at a distance — the blend is real yet mild.',
    si: 'එකම ජීවිත ක්ෂේත්‍රය බෙදා ගනී; නමුත් දුරින් — මිශ්‍රණය සැබෑ නමුත් මෘදුයි.',
  },
};

export const VERDICT_LABEL: Record<string, Bi> = {
  'very-supportive': { en: 'Very supportive', si: 'ඉතා හිතකරයි' },
  supportive: { en: 'Supportive', si: 'හිතකරයි' },
  mixed: { en: 'Mixed', si: 'මිශ්‍රයි' },
  straining: { en: 'Demanding', si: 'අභියෝගාත්මකයි' },
  difficult: { en: 'Difficult', si: 'දුෂ්කරයි' },
};

export const ACTIVATION_LABEL: Record<string, Bi> = {
  peak: { en: 'Running now', si: 'දැන් ක්‍රියාත්මකයි' },
  high: { en: 'Strongly active', si: 'ප්‍රබලව සක්‍රියයි' },
  moderate: { en: 'Partly active', si: 'අර්ධ වශයෙන් සක්‍රියයි' },
  background: { en: 'In the background', si: 'පසුබිමේ පවතී' },
};

export const RELATION_LABEL: Record<string, Bi> = {
  friend: { en: 'Natural friends', si: 'ස්වභාවික මිත්‍රයෝ' },
  neutral: { en: 'Neutral to each other', si: 'එකිනෙකට සමයි' },
  mixed: { en: 'One-sided friendship', si: 'එක් පැත්තකට පමණක් මිත්‍රයි' },
  enemy: { en: 'Natural opposites', si: 'ස්වභාවික සතුරෝ' },
};

/** Short labels for the “why” chips under the power / friction meters. */
export const FACTOR_TEXT: Record<string, Bi> = {
  friends: { en: 'They get along naturally', si: 'ස්වභාවිකවම එකඟ වේ' },
  enemies: { en: 'They pull against each other', si: 'එකිනෙකට විරුද්ධව ඇදේ' },
  mixedRel: { en: 'Only one of them cooperates', si: 'සහයෝගය දෙන්නේ එක් අයෙකු පමණයි' },
  bothBenefic: { en: 'Both are gentle planets', si: 'දෙදෙනාම සුබ ග්‍රහයෝ' },
  bothMalefic: { en: 'Both are harsh planets', si: 'දෙදෙනාම පාප ග්‍රහයෝ' },
  mixedNature: { en: 'One gentle, one harsh', si: 'එක් අයෙක් සුබයි, අනෙකා පාපයි' },
  strongDignity: { en: 'Well placed by sign', si: 'රාශිය අනුව හොඳ පිහිටීමක්' },
  weakDignity: { en: 'Weakly placed by sign', si: 'රාශිය අනුව දුර්වල පිහිටීමක්' },
  debilitated: { en: 'One of them is at its weakest', si: 'එක් අයෙක් දුර්වලම තත්ත්වයේ' },
  goodHouse: { en: 'Sits in a supportive house', si: 'හිතකර භාවයක පිහිටා ඇත' },
  hardHouse: { en: 'Sits in a testing house', si: 'අභියෝගාත්මක භාවයක පිහිටා ඇත' },
  yogakaraka: { en: 'One of them is a chart-maker for you', si: 'එක් අයෙක් ඔබට යෝගකාරකයි' },
  functionalMalefic: { en: 'One of them rules difficult ground for you', si: 'එක් අයෙක් ඔබට අපහසු භාව පාලනය කරයි' },
  combust: { en: 'Burnt by the Sun', si: 'සූර්යයා විසින් දහනය වී ඇත' },
  yuddha: { en: 'One planet loses the contest', si: 'එක් ග්‍රහයෙක් තරඟයෙන් පරාජය වේ' },
  retrograde: { en: 'Retrograde — the effect turns inward', si: 'වක්‍රයි — බලපෑම අභ්‍යන්තරයට හැරේ' },
  tightOrb: { en: 'Very tight angle — effects are loud', si: 'ඉතා තියුණු කෝණයක් — බලපෑම් ප්‍රබලයි' },
  wideOrb: { en: 'Wide angle — effects are softened', si: 'පුළුල් කෝණයක් — බලපෑම් මෘදුයි' },
  auspicious: { en: 'A named beneficial combination', si: 'නම් කළ සුබ යෝගයකි' },
  inauspicious: { en: 'A named difficult combination', si: 'නම් කළ අශුබ යෝගයකි' },
};

export function factorText(key: string, lang: Lang): string {
  const b = FACTOR_TEXT[key];
  return b ? pick(b, lang) : key;
}

// ─── Sentence frames ───────────────────────────────────────────────────────

const fmtDeg = (d: number) => `${d.toFixed(2)}°`;

export const PAIR_FRAMES = {
  /** One-line headline: "Mars and Saturn sit 4.20° apart in your 7th house." */
  headline: (a: string, b: string, sep: number, house: number, lang: Lang): string =>
    lang === 'si'
      ? `${a} හා ${b} ඔබේ ${house} වන භාවයේ අංශක ${sep.toFixed(2)}ක් දුරින් එකට පිහිටා ඇත.`
      : `${a} and ${b} sit ${fmtDeg(sep)} apart in your ${house}${ordSuffix(house)} house.`,

  /** Which planet is ahead in the sign. */
  order: (leader: string, follower: string, lang: Lang): string =>
    lang === 'si'
      ? `රාශිය තුළ ${leader} ඉදිරියෙන් ද ${follower} පසුපසින් ද සිටී.`
      : `${leader} is ahead of ${follower} in the sign.`,

  /** Applying (still closing in) vs separating (drifting apart). */
  motion: (applying: boolean, lang: Lang): string =>
    applying
      ? (lang === 'si'
        ? 'උපත් මොහොතේ ඔවුන් තව තවත් ළං වෙමින් සිටියේය — බලපෑම වර්ධනය වන ස්වභාවයේ, ජීවිතය පුරා තීව්‍ර වේ.'
        : 'At your birth they were still closing in on each other, so this blend keeps building through life.')
      : (lang === 'si'
        ? 'උපත් මොහොතේ ඔවුන් එකිනෙකින් ඉවත් වෙමින් සිටියේය — බලපෑම මුල් කාලයේ තදින් දැනී ක්‍රමයෙන් සමනය වේ.'
        : 'At your birth they were drifting apart, so the blend hits hardest early and mellows with time.'),

  /** What the two planets fuse, in terms of the life areas each of them runs. */
  fusion: (aName: string, aAreas: string, bName: string, bAreas: string, lang: Lang): string =>
    lang === 'si'
      ? `ඔබේ කේන්ද්‍රයේ ${aName} ${aAreas} පාලනය කරයි; ${bName} ${bAreas} පාලනය කරයි. ඔවුන් එකට සිටින නිසා මෙම ජීවිත ක්ෂේත්‍ර එකිනෙකට බැඳී ඇත — එකක් වෙනස් වන විට අනෙකත් වෙනස් වේ.`
      : `In your chart ${aName} runs ${aAreas}, and ${bName} runs ${bAreas}. Because they sit together, these parts of life are tied to each other — when one moves, the other moves with it.`,

  /** Same, when one of the pair rules nothing (Rahu / Ketu). */
  fusionShadow: (aName: string, aAreas: string, bName: string, lang: Lang): string =>
    lang === 'si'
      ? `${aName} ${aAreas} පාලනය කරයි. ${bName}ට රාශියක් අයිති නැත — එය තමන් සිටින භාවයේ කරුණු විශාලනය කරයි.`
      : `${aName} runs ${aAreas}. ${bName} owns no sign of its own — it simply magnifies whatever house it sits in.`,

  /** Combustion note. */
  combust: (planet: string, sep: number, limit: number, lang: Lang): string =>
    lang === 'si'
      ? `${planet} සූර්යයාගෙන් අංශක ${sep.toFixed(2)}ක් ඇතුළත (සීමාව ${limit}°) — එබැවින් එය දහනය වී ඇත. ${planet}ගේ ගුණාංග තුළින් ක්‍රියා කරයි; පිටතට පෙනෙන ප්‍රතිඵල අඩුයි.`
      : `${planet} is only ${fmtDeg(sep)} from the Sun (the limit is ${limit}°), so it is burnt. It still works inside you, but shows far less on the outside.`,

  /** Graha yuddha note. */
  yuddha: (winner: string, loser: string, lang: Lang): string =>
    lang === 'si'
      ? `අංශකයකට වඩා අඩු නිසා මෙය ග්‍රහ යුද්ධයකි. ${winner} ජය ගනී; ${loser} දුර්වල වී එහි ප්‍රතිඵල ප්‍රමාද වේ.`
      : `Under one degree apart, this counts as a planetary war. ${winner} wins it; ${loser} is weakened and its results come late or partly.`,

  /** Now-window sentence. */
  nowPeak: (a: string, b: string, endDate: string, lang: Lang): string =>
    lang === 'si'
      ? `${a} හා ${b} යන දෙදෙනාම ඔබේ වර්තමාන දශා චක්‍රයේ ක්‍රියාත්මක වේ. එබැවින් මෙම එකතුව දැන් සම්පූර්ණයෙන් ක්‍රියාත්මකයි — ${endDate} දක්වා.`
      : `Both ${a} and ${b} are running in your current planetary period, so this combination is switched fully on right now — until ${endDate}.`,
  nowHigh: (planet: string, level: string, endDate: string, lang: Lang): string =>
    lang === 'si'
      ? `${planet} දැන් ඔබේ ${level} ලෙස ක්‍රියාත්මකයි (${endDate} දක්වා). එබැවින් මෙම එකතුවේ එක් පැත්තක් ප්‍රබලව ක්‍රියාත්මක වේ.`
      : `${planet} is running as your ${level} right now (until ${endDate}), so one half of this pair is strongly live.`,
  nowBackground: (a: string, b: string, lang: Lang): string =>
    lang === 'si'
      ? `${a} හෝ ${b} දැන් ඔබේ දශා චක්‍රයේ නොමැත. එබැවින් මෙම එකතුව පසුබිමේ පවතී — එය තවමත් ඔබේ ස්වභාවයේ කොටසකි; නමුත් දැන් සිදු වන දේ තීරණය කරන්නේ නැත.`
      : `Neither ${a} nor ${b} is running in your current period, so this pair sits in the background — still part of who you are, but not what is driving events today.`,
  nextWindow: (label: string, start: string, end: string, lang: Lang): string =>
    lang === 'si'
      ? `මීළඟට එය සම්පූර්ණයෙන් ක්‍රියාත්මක වන්නේ ${label} කාලයේදීය — ${start} සිට ${end} දක්වා.`
      : `The next time it switches fully on is ${label}, from ${start} to ${end}.`,

  /** Lifetime maturity sentence. */
  maturity: (first: string, firstAge: number, second: string, secondAge: number, lang: Lang): string =>
    lang === 'si'
      ? `සම්ප්‍රදාය අනුව ${first} වයස අවුරුදු ${firstAge}දී ද ${second} වයස අවුරුදු ${secondAge}දී ද පරිණත වේ. එබැවින් මෙම එකතුවේ මුල් සලකුණු අවුරුදු ${firstAge} පමණ දක්වා පෙනී, අවුරුදු ${secondAge}න් පසු එය සම්පූර්ණයෙන් ක්‍රියාත්මක වේ.`
      : `Classically ${first} matures at age ${firstAge} and ${second} at age ${secondAge}. So the early signs of this blend show from around ${firstAge}, and it works at full strength after ${secondAge}.`,
  maturitySame: (planetPair: string, age: number, lang: Lang): string =>
    lang === 'si'
      ? `${planetPair} වයස අවුරුදු ${age} පමණ වන විට පරිණත වේ; ඉන් පසු මෙම එකතුව සම්පූර්ණයෙන් ක්‍රියාත්මකයි.`
      : `${planetPair} mature around age ${age}; from then on this blend runs at full strength.`,

  /** Whole-life summary line, tuned by verdict. */
  lifetime: (verdict: string, house: number, plainHouse: string, lang: Lang): string => {
    const en: Record<string, string> = {
      'very-supportive': `This is one of the reliable engines of your chart. Across your whole life it quietly improves ${plainHouse}, and it pays out most in the periods listed below.`,
      supportive: `Over a lifetime this works for you more often than against you, especially in matters of ${plainHouse}. It rewards you when you use it deliberately rather than waiting on it.`,
      mixed: `This pairing gives and takes in roughly equal measure. Expect ${plainHouse} to be an area of repeated lessons — good years and hard years both come from here.`,
      straining: `This is a demanding part of your chart. Matters of ${plainHouse} ask real effort from you, and the results you get there are earned rather than given.`,
      difficult: `This is one of the harder knots in your chart. Matters of ${plainHouse} repeat until you handle them differently — but handled well, this same pressure becomes your strongest skill.`,
    };
    const si: Record<string, string> = {
      'very-supportive': `මෙය ඔබේ කේන්ද්‍රයේ විශ්වාසවන්ත බලවේගයකි. ජීවිත කාලය පුරාම එය ${plainHouse} වැඩිදියුණු කරයි; පහත සඳහන් කාලවලදී වැඩිම ප්‍රතිඵල ලැබේ.`,
      supportive: `ජීවිත කාලය පුරාම මෙය ඔබට විරුද්ධව වඩා ඔබ වෙනුවෙන් ක්‍රියා කරයි — විශේෂයෙන් ${plainHouse} සම්බන්ධ කරුණුවලදී. බලා සිටිනවා වෙනුවට දැනුවත්ව භාවිත කළ විට එය ප්‍රතිඵල දෙයි.`,
      mixed: `මෙම එකතුව දෙන තරමටම ගන්නවා ද කරයි. ${plainHouse} යනු නැවත නැවත පාඩම් ලබා දෙන ක්ෂේත්‍රයක් වේ — හොඳ අවුරුදු හා අමාරු අවුරුදු දෙකම මෙතැනින් එයි.`,
      straining: `මෙය ඔබේ කේන්ද්‍රයේ ඉල්ලීම් කරන කොටසකි. ${plainHouse} සම්බන්ධ කරුණු ඔබෙන් සැබෑ උත්සාහයක් ඉල්ලයි; එහි ලැබෙන ප්‍රතිඵල නොමිලේ නොව උපයාගත් ඒවාය.`,
      difficult: `මෙය ඔබේ කේන්ද්‍රයේ අමාරුම ගැටයන්ගෙන් එකකි. ${plainHouse} සම්බන්ධ කරුණු ඔබ ඒවා වෙනස් ලෙස හසුරුවන තුරු නැවත නැවත එයි — නමුත් හොඳින් හැසිරවූ විට එම පීඩනයම ඔබේ ප්‍රබලම කුසලතාව බවට පත් වේ.`,
    };
    void house;
    return lang === 'si' ? (si[verdict] ?? si.mixed) : (en[verdict] ?? en.mixed);
  },

  /** Fallback reading for a pair with no named entry (should not normally hit). */
  genericPlain: (a: string, b: string, lang: Lang): string =>
    lang === 'si'
      ? `${a} හා ${b} එකම භාවයේ සිටී; නිසා ඔවුන්ගේ ගුණාංග එකට මිශ්‍ර වී ක්‍රියා කරයි.`
      : `${a} and ${b} share one house, so their qualities work as a blend rather than separately.`,

  /** Group headline when three or more planets crowd one house. */
  stellium: (count: number, plainHouse: string, lang: Lang): string =>
    lang === 'si'
      ? `ග්‍රහයන් ${count} දෙනෙකු මෙම භාවයේ එකතු වී ඇත. ${plainHouse} ඔබේ ජීවිතයේ ප්‍රධාන කථාව බවට පත් වේ — එහි ඉතා ඉහළ ශක්තියක් ද, එකට ක්‍රියා කරන බලවේග කිහිපයක් ද ඇත.`
      : `${count} planets are stacked in this one house, which makes ${plainHouse} a main storyline of your life — a lot of energy in one place, with several forces working through it at once.`,
};

function ordSuffix(n: number): string {
  const v = n % 100;
  if (v >= 11 && v <= 13) return 'th';
  switch (n % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}
