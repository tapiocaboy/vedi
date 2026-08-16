/**
 * Sign-essence prose — one bilingual paragraph per sign, reused for all three
 * "Big 3" points (Sun/Moon/Rising) via the frame sentences in `natal.ts`.
 *
 * A sign's core meaning doesn't change with which chart factor expresses it —
 * only the life-area lens does (identity vs. emotional nature vs. outer
 * persona) — so one well-written paragraph per sign, recontextualised by a
 * short frame, gives three genuinely distinct readings without three times
 * the prose to maintain or three times the chance of them drifting apart.
 */

import type { Bi } from '../../i18n';

export const SIGN_ESSENCE: Record<number, Bi> = {
  0: { // Aries
    en: 'direct, quick to act, and energised by a challenge — the fire sign that starts things rather than waits. Ruled by Mars, it moves on instinct before it moves on reflection, and its edge is impatience with anything slow.',
    si: 'ඍජු, ඉක්මනින් ක්‍රියා කරන, අභියෝගවලින් ශක්තිය ලබන ගිනි රාශිය — බලා නොසිට දේවල් ආරම්භ කරන එකයි. කුජගෙන් පාලනය වන එය මෙනෙහි කිරීමට පෙර සහජයෙන් ක්‍රියා කරයි, එහි දුර්වලකම වන්නේ මන්දගාමී ඕනෑම දෙයක් ගැන ඉවසිලිමත් නොවීමයි.',
  },
  1: { // Taurus
    en: 'steady, sensual, and unhurried — the fixed earth sign that builds slowly and holds on once it commits. Ruled by Venus, it trusts what it can touch, taste and keep, and its edge is a stubbornness that resists being rushed.',
    si: 'ස්ථාවර, ඉන්ද්‍රියාශ්‍රිත, නොඉක්මන් — සෙමින් ගොඩනඟා, එකඟ වූ පසු එයට ඇලී සිටින ස්ථිර පෘථිවි රාශිය. ශුක්‍රගෙන් පාලනය වන එය ස්පර්ශ කළ හැකි, රස විඳිය හැකි, තබා ගත හැකි දේ විශ්වාස කරයි, එහි දුර්වලකම වන්නේ ඉක්මන් කරනු ලැබීමට විරුද්ධ මුරණ්ඩුකමයි.',
  },
  2: { // Gemini
    en: 'curious, quick-witted, and hungry for variety — the mutable air sign that thinks in questions. Ruled by Mercury, it gathers and connects information faster than it settles on one answer, and its edge is scattering itself thin.',
    si: 'කුතුහලයෙන් යුත්, ඉක්මන් බුද්ධියක් ඇති, විවිධත්වයට ආශා කරන — ප්‍රශ්නවලින් සිතන ද්විස්වභාව වායු රාශිය. බුධගෙන් පාලනය වන එය එක් පිළිතුරකට එළඹීමට වඩා තොරතුරු එකතු කර සම්බන්ධ කරයි, එහි දුර්වලකම වන්නේ තමාවම විසිර යාමයි.',
  },
  3: { // Cancer
    en: 'protective, deeply feeling, and anchored to home — the cardinal water sign that leads with care. Ruled by the Moon, its moods rise and fall with what\'s around it, and its edge is holding on past the point of letting go.',
    si: 'ආරක්ෂාකාරී, ගැඹුරින් හැඟෙන, නිවසට ඇලී සිටින — රැකවරණයෙන් නායකත්වය දෙන චර ජල රාශිය. චන්ද්‍රයාගෙන් පාලනය වන එහි මනෝභාවයන් අවට දේ අනුව නැඟී වැටේ, එහි දුර්වලකම වන්නේ අත්හැරිය යුතු අවස්ථාවෙන් පසුවත් තදින් අල්ලාගෙන සිටීමයි.',
  },
  4: { // Leo
    en: 'warm, expressive, and unafraid to be seen — the fixed fire sign built to perform and to lead from the heart. Ruled by the Sun, it gives generously and expects to be noticed for it, and its edge is a pride that bruises easily.',
    si: 'උණුසුම්, ප්‍රකාශනශීලී, පෙනී සිටීමට බියක් නැති — රඟපෑමට හා හදවතින් නායකත්වය දීමට සැදුම්ලත් ස්ථිර ගිනි රාශිය. සූර්යයාගෙන් පාලනය වන එය දයාන්විතව දෙන අතර ඒ වෙනුවෙන් සැලකිල්ල අපේක්ෂා කරයි, එහි දුර්වලකම වන්නේ පහසුවෙන් තුවාල වන අභිමානයයි.',
  },
  5: { // Virgo
    en: 'precise, observant, and quietly in service of getting things right — the mutable earth sign that notices what others miss. Ruled by Mercury, it improves everything it touches, and its edge is turning that same scrutiny on itself.',
    si: 'නිරවද්‍ය, නිරීක්ෂණශීලී, දේවල් නිවැරදිව කිරීමට නිහඬව කැපවූ — අන් අය නොදකින දේ දකින ද්විස්වභාව පෘථිවි රාශිය. බුධගෙන් පාලනය වන එය ස්පර්ශ කරන සෑම දෙයක්ම වැඩිදියුණු කරයි, එහි දුර්වලකම වන්නේ එම විමර්ශනයම තමා වෙතට හරවා ගැනීමයි.',
  },
  6: { // Libra
    en: 'diplomatic, fair-minded, and happiest in partnership — the cardinal air sign that weighs both sides before choosing. Ruled by Venus, it seeks harmony and beauty in its surroundings, and its edge is indecision when a choice can\'t please everyone.',
    si: 'රාජ්‍ය තාන්ත්‍රික, සාධාරණ මානසිකත්වයෙන් යුත්, හවුල්කාරිත්වයේ වඩාත් සතුටු වන — තෝරාගැනීමට පෙර දෙපැත්තම කිරන චර වායු රාශිය. ශුක්‍රගෙන් පාලනය වන එය තම වටපිටාවේ සමගිය හා සුන්දරත්වය සොයයි, එහි දුර්වලකම වන්නේ සියල්ලන්ව සතුටු කළ නොහැකි විට තීරණයක් ගැනීමට නොහැකි වීමයි.',
  },
  7: { // Scorpio
    en: 'intense, private, and drawn to what lies beneath the surface — the fixed water sign built for transformation. Ruled by Pluto (traditionally Mars), it commits completely or not at all, and its edge is a guardedness that keeps even allies at a distance.',
    si: 'තීව්‍ර, පෞද්ගලික, මතුපිට යටින් ඇති දේට ආකර්ෂණය වන — පරිවර්තනය සඳහා සැදුම්ලත් ස්ථිර ජල රාශිය. ප්ලූටෝගෙන් (සම්ප්‍රදායිකව කුජගෙන්) පාලනය වන එය සම්පූර්ණයෙන් හෝ කිසිසේත්ම කැපවෙයි, එහි දුර්වලකම වන්නේ මිතුරන්වත් දුරින් තබන ආරක්ෂිත ස්වභාවයයි.',
  },
  8: { // Sagittarius
    en: 'adventurous, philosophical, and always chasing a bigger horizon — the mutable fire sign that needs room to roam. Ruled by Jupiter, it teaches through experience and honesty, and its edge is promising more than it can carry through.',
    si: 'ත්‍යාගශීලී, දාර්ශනික, සැමවිටම විශාල ක්ෂිතිජයක් සොයන — සැරිසැරීමට ඉඩ අවශ්‍ය ද්විස්වභාව ගිනි රාශිය. ගුරුගෙන් පාලනය වන එය අත්දැකීම් හා අවංකකම හරහා ඉගැන්වේ, එහි දුර්වලකම වන්නේ ඉටු කළ හැකි ප්‍රමාණයට වඩා පොරොන්දු වීමයි.',
  },
  9: { // Capricorn
    en: 'ambitious, disciplined, and playing the long game — the cardinal earth sign that builds structures meant to outlast it. Ruled by Saturn, it earns what it has through patient effort, and its edge is measuring its worth only by what it has achieved.',
    si: 'අභිලාෂකාමී, විනයගරුක, දිගු කාලීන ක්‍රීඩාවක නියැලෙන — එයටත් වඩා කල් පවතින ව්‍යුහ ගොඩනඟන චර පෘථිවි රාශිය. ශනිගෙන් පාලනය වන එය ඉවසිලිවන්ත උත්සාහයෙන් තමා සතු දේ උපයයි, එහි දුර්වලකම වන්නේ තම වටිනාකම ජයග්‍රහණවලින් පමණක් මැනීමයි.',
  },
  10: { // Aquarius
    en: 'independent, inventive, and community-minded — the fixed air sign that thinks ahead of its time. Ruled by Uranus (traditionally Saturn), it values the group and the idea over the individual and the convention, and its edge is a detachment that can read as coldness.',
    si: 'ස්වාධීන, නවෝත්පාදනශීලී, ප්‍රජාව ගැන සිතන — තම කාලයට වඩා ඉදිරියෙන් සිතන ස්ථිර වායු රාශිය. යුරේනස්ගෙන් (සම්ප්‍රදායිකව ශනිගෙන්) පාලනය වන එය පුද්ගලයාට හා සම්ප්‍රදායට වඩා කණ්ඩායමට හා අදහසට වටිනාකම් දෙයි, එහි දුර්වලකම වන්නේ සීතලකමක් ලෙස කියවිය හැකි වෙන්වීමයි.',
  },
  11: { // Pisces
    en: 'compassionate, imaginative, and porous to the moods around it — the mutable water sign that dissolves boundaries rather than draws them. Ruled by Neptune (traditionally Jupiter), it feels what others feel almost as its own, and its edge is losing itself in someone else\'s reality.',
    si: 'කරුණාවන්ත, පරිකල්පනාශීලී, අවට මනෝභාවයන්ට විවෘත — මායිම් අඳින්නට වඩා ඒවා දිය කරන ද්විස්වභාව ජල රාශිය. නෙප්චූන්ගෙන් (සම්ප්‍රදායිකව ගුරුගෙන්) පාලනය වන එය අන් අය දැනෙන දේ තමන්ගේම දෙයක් සේ පාහේ දැනගනියි, එහි දුර්වලකම වන්නේ වෙනත් කෙනෙකුගේ යථාර්ථය තුළ තමාවම නැති කර ගැනීමයි.',
  },
};
