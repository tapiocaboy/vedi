import type { Bi } from '../../i18n';
import type { WesternPatternType } from '../patterns';

export const PATTERN_TEXT: Record<WesternPatternType, { name: Bi; description: Bi }> = {
  stellium: {
    name: { en: 'Stellium', si: 'ග්‍රහ සමූහය' },
    description: {
      en: 'Three or more planets clustered in one sign — that sign\'s themes dominate the chart, concentrated rather than spread across the personality.',
      si: 'එක් රාශියක එකතු වූ ග්‍රහ තුනක් හෝ වැඩි ගණනක් — එම රාශියේ තේමා පෞරුෂය පුරා විසිරී යනවාට වඩා කේන්ද්‍රගත වේ.',
    },
  },
  grandTrine: {
    name: { en: 'Grand Trine', si: 'මහා ත්‍රිකෝණය' },
    description: {
      en: 'Three planets in mutual trine, forming a closed triangle of the same element — a talent that flows so easily it can go undeveloped simply because it never demands effort.',
      si: 'එකම මූලද්‍රව්‍යයේ ග්‍රහ තුනක් අන්‍යෝන්‍ය ත්‍රිකෝණයකින් සම්බන්ධ වී වසා දැමූ ත්‍රිකෝණයක් සාදයි — කිසි විටෙකත් උත්සාහයක් නොඉල්ලන නිසාම වර්ධනය නොවී පවතින හැකි තරම් පහසුවෙන් ගලායන දක්ෂතාවක්.',
    },
  },
  tSquare: {
    name: { en: 'T-Square', si: 'ටී-චතුරස්‍රය' },
    description: {
      en: 'Two planets in opposition, both squaring a third — the apex planet is the pressure point where the whole pattern demands to be worked out, usually through action.',
      si: 'විරුද්ධව සිටින ග්‍රහ දෙකක් තුන්වන ග්‍රහයකට ස්කේවයර් වේ — එම තුන්වන ග්‍රහයයි මුළු රටාවම විසඳා ගැනීමට බලකරන පීඩන ලක්ෂ්‍යය, සාමාන්‍යයෙන් ක්‍රියාව හරහා.',
    },
  },
  grandCross: {
    name: { en: 'Grand Cross', si: 'මහා කුරුසය' },
    description: {
      en: 'Two oppositions locked into four mutual squares — sustained, structural tension across every area it touches, and often an unusual capacity for handling pressure as a result.',
      si: 'අන්‍යෝන්‍ය ස්කේවයර් හතරකින් බැඳුණු විරුද්ධ යුගල දෙකක් — එය ස්පර්ශ කරන සෑම ක්ෂේත්‍රයක්ම හරහා අඛණ්ඩ, ව්‍යුහාත්මක ආතතියක්, ඒ නිසාම බොහෝවිට පීඩනය හැසිරවීමේ අසාමාන්‍ය හැකියාවක්.',
    },
  },
  yod: {
    name: { en: 'Yod (Finger of Fate)', si: 'යෝඩ් (ඉරණම් ඇඟිල්ල)' },
    description: {
      en: 'Two planets sextile each other, both quincunx a third — a specialised, slow-building pressure toward the apex planet that tends to read as a life theme rather than a passing event.',
      si: 'එකිනෙකා සමඟ සෙක්ස්ටයිල් ඇති ග්‍රහ දෙකක් තුන්වන ග්‍රහයකට ක්වින්කන්ක්ස් වේ — ගමන් යන සිදුවීමකට වඩා ජීවන තේමාවක් ලෙස කියවෙන, තුන්වන ග්‍රහය දෙසට සෙමින් ගොඩනැගෙන විශේෂිත පීඩනයක්.',
    },
  },
  kite: {
    name: { en: 'Kite', si: 'රුවල් සරුංගලය' },
    description: {
      en: 'A Grand Trine with a fourth planet opposing one corner — the easy flow of the trine gets a focal point and an outlet, turning raw talent into something that can actually be aimed.',
      si: 'කොනක් ට විරුද්ධව සිටින සිව්වන ග්‍රහයක් සහිත මහා ත්‍රිකෝණයක් — ත්‍රිකෝණයේ පහසු ගලායාමට කේන්ද්‍ර ලක්ෂ්‍යයක් හා නිකුත් වීමේ මාර්ගයක් ලැබෙයි, අමු දක්ෂතාව ඉලක්ක කළ හැකි යමකට හරවයි.',
    },
  },
};
