/** Bilingual nakshatra insight content (personality, keynotes, career, symbol,
 * lord/gana/pada/deity themes) — English and Sinhala. */

import type { Bi, BiList, Lang } from '../i18n';

export interface ProfileText {
  personality: Bi;
  keynotes: BiList;
  career: Bi;
  symbolMeaning: Bi;
}

// Indexed 0–26, aligned with NAKSHATRAS in nakshatra.ts.
export const PROFILES: ProfileText[] = [
  { // 0 Ashwini
    personality: {
      en: 'Quick, pioneering, and youthful. You start things with speed and enthusiasm, love to heal or rescue, and dislike being held back. A natural first-mover with a healing touch.',
      si: 'ඉක්මන්, පුරෝගාමී හා තරුණ ගතියක් ඇති. ඔබ දේවල් වේගයෙන් හා උනන්දුවෙන් ආරම්භ කරයි, සුව කිරීමට හෝ බේරා ගැනීමට ප්‍රිය කරයි, බාධා පැමිණීම අකැමැතිය. සුව කිරීමේ හැකියාවක් ඇති ස්වභාවික මුල්පිරුම්කරුවෙකි.',
    },
    keynotes: {
      en: ['Fast starts and fresh initiatives suit you', 'A gift for healing, first-aid, and reviving stalled things', 'Impatience and restlessness are the main lessons'],
      si: ['ඉක්මන් ආරම්භ හා නව මුල පිරීම් ඔබට ගැළපේ', 'සුව කිරීම, ප්‍රථමාධාර හා නතර වූ දේ යළි පණ ගැන්වීමේ දක්ෂතාව', 'නොඉවසිලිමත්කම හා නොසන්සුන්කම ප්‍රධාන පාඩම් වේ'],
    },
    career: {
      en: 'Medicine, healing, transport, sports, emergency work, anything pioneering.',
      si: 'වෛද්‍ය විද්‍යාව, සුව කිරීම, ප්‍රවාහනය, ක්‍රීඩා, හදිසි සේවා හා ඕනෑම පුරෝගාමී කටයුත්තක්.',
    },
    symbolMeaning: {
      en: "The horse's head signals speed, vitality, and the urge to move forward.",
      si: 'අශ්ව හිස වේගය, ජීවශක්තිය හා ඉදිරියට යාමේ ආශාව නිරූපණය කරයි.',
    },
  },
  { // 1 Bharani
    personality: {
      en: 'Intense, creative, and determined. You carry strong desires and the discipline to bear burdens others cannot. Life moves through cycles of holding on and letting go.',
      si: 'තීව්‍ර, නිර්මාණශීලී හා අධිෂ්ඨානශීලී. ඔබ තුළ ප්‍රබල ආශාවන් හා අන් අයට දරාගත නොහැකි බර දැරීමේ විනය පවතී. ජීවිතය අල්ලා ගැනීමේ හා අත්හැරීමේ චක්‍ර හරහා ගමන් කරයි.',
    },
    keynotes: {
      en: ['Great endurance and capacity to carry responsibility', 'Creative and fertile — bringing ideas to life', 'Learning restraint with desires and extremes'],
      si: ['විශිෂ්ට විඳදරාගැනීම හා වගකීම දැරීමේ හැකියාව', 'නිර්මාණශීලී හා ඵලදායී — අදහස් ජීවමාන කරයි', 'ආශාවන් හා අන්තයන් සම්බන්ධයෙන් සංයමය ඉගෙනීම'],
    },
    career: {
      en: 'Creative arts, law, healthcare, anything involving transformation or birth/death cycles.',
      si: 'නිර්මාණශීලී කලා, නීතිය, සෞඛ්‍ය සේවා හා පරිවර්තනය හෝ උපත/මරණ චක්‍ර සම්බන්ධ ඕනෑම දෙයක්.',
    },
    symbolMeaning: {
      en: 'The yoni (womb) signals creation, fertility, restraint, and powerful life-force.',
      si: 'යෝනිය (ගර්භය) නිර්මාණය, සරුබව, සංයමය හා ප්‍රබල ජීව ශක්තිය නිරූපණය කරයි.',
    },
  },
  { // 2 Krittika
    personality: {
      en: 'Sharp, fiery, and purifying. You cut through pretence, demand quality, and have a strong critical eye. A protector who burns away what is false.',
      si: 'තියුණු, තෙජස්වී හා පිරිසිදු කරන ගතියක් ඇති. ඔබ මුහුණුවාද කපා දමයි, ගුණාත්මකභාවය ඉල්ලයි, ප්‍රබල විචාරශීලී දෘෂ්ටියක් ඇත. අසත්‍ය දේ දවා දමන ආරක්ෂකයෙකි.',
    },
    keynotes: {
      en: ['A sharp, discerning, no-nonsense mind', 'Drive for excellence and purity of standards', 'Watch a tendency to be cutting or impatient with others'],
      si: ['තියුණු, විචක්ෂණ, පැහැදිලි මනසක්', 'විශිෂ්ටත්වය හා ප්‍රමිතීන්ගේ පිරිසිදුකම කෙරෙහි ඇති ආශාව', 'අන් අය සමඟ තදින් හෝ නොඉවසිලිමත්ව කටයුතු කිරීමේ නැඹුරුව ගැන සැලකිලිමත් වන්න'],
    },
    career: {
      en: 'Engineering, cooking, military, surgery, criticism, leadership, fire-related fields.',
      si: 'ඉංජිනේරු විද්‍යාව, ආහාර පිසීම, හමුදා සේවය, ශල්‍ය වෛද්‍ය, විචාරය, නායකත්වය හා ගිනි ආශ්‍රිත ක්ෂේත්‍ර.',
    },
    symbolMeaning: {
      en: 'The razor/flame represents cutting away impurity and the power to purify and protect.',
      si: 'දැල්ල/තලය අපිරිසිදුකම කපා ඉවත් කිරීම හා පිරිසිදු කර ආරක්ෂා කිරීමේ බලය නිරූපණය කරයි.',
    },
  },
  { // 3 Rohini
    personality: {
      en: 'Charming, sensual, and creative. The Moon loves this star — you attract beauty, comfort, and material growth, with strong artistic and nurturing instincts.',
      si: 'ආකර්ෂණීය, ඉන්ද්‍රියාශ්‍රිත හා නිර්මාණශීලී. චන්ද්‍රයා මෙම නක්ෂත්‍රයට ප්‍රිය කරයි — ඔබ සුන්දරත්වය, පහසුව හා භෞතික වර්ධනය ඇද ගනී, ප්‍රබල කලාත්මක හා රැකබලා ගැනීමේ නැඹුරුවක් ඇත.',
    },
    keynotes: {
      en: ['Natural charm, beauty, and magnetism', 'Steady material and emotional growth', 'Attachment to comfort and possessions is the lesson'],
      si: ['ස්වභාවික ආකර්ෂණය, සුන්දරත්වය හා චුම්බක ගතිය', 'ස්ථාවර භෞතික හා හැඟීම්බර වර්ධනය', 'පහසුව හා දේපළ කෙරෙහි ඇති ඇල්ම මෙහි පාඩමයි'],
    },
    career: {
      en: 'Arts, agriculture, luxury, fashion, food, finance, anything that grows or nurtures.',
      si: 'කලා, කෘෂිකර්මය, සුඛෝපභෝගය, විලාසිතා, ආහාර, මූල්‍ය හා වැඩෙන හෝ පෝෂණය කරන ඕනෑම දෙයක්.',
    },
    symbolMeaning: {
      en: 'The chariot/ox-cart signals fertile growth, abundance, and the journey of material life.',
      si: 'රථය/ගැල භෞතික වර්ධනය, සමෘද්ධිය හා භෞතික ජීවිතයේ ගමන නිරූපණය කරයි.',
    },
  },
  { // 4 Mrigashira
    personality: {
      en: 'Curious, gentle, and searching. You are forever seeking — knowledge, the perfect thing, the next experience — with a soft, restless, inquisitive nature.',
      si: 'කුතුහලයෙන් යුත්, මෘදු හා සොයන ගතියක් ඇති. ඔබ නිරන්තරයෙන් සොයයි — දැනුම, පරිපූර්ණ දෙය, ඊළඟ අත්දැකීම — මෘදු, නොසන්සුන්, විමසිලිමත් ස්වභාවයකින්.',
    },
    keynotes: {
      en: ['A seeker — research, exploration, and curiosity drive you', 'Gentle, approachable, and adaptable', 'Restlessness and indecision are to be tamed'],
      si: ['ගවේෂකයෙකි — පර්යේෂණ, ගවේෂණය හා කුතුහලය ඔබ මෙහෙයවයි', 'මෘදු, ළං විය හැකි හා හැඩ ගැසෙන සුළු', 'නොසන්සුන්කම හා තීරණ ගත නොහැකි බව හික්මවා ගත යුතුය'],
    },
    career: {
      en: 'Research, writing, travel, real estate, design, anything exploratory.',
      si: 'පර්යේෂණ, ලේඛන, සංචාරක, දේපළ, නිර්මාණකරණය හා ඕනෑම ගවේෂණාත්මක දෙයක්.',
    },
    symbolMeaning: {
      en: "The deer's head signals gentle searching, curiosity, and a sensitive, roaming mind.",
      si: 'මුව හිස මෘදු සෙවීම, කුතුහලය හා සංවේදී, සැරිසරන මනසක් නිරූපණය කරයි.',
    },
  },
  { // 5 Ardra
    personality: {
      en: 'Stormy, sharp, and transformative. You feel deeply and think incisively; turbulence clears the way for renewal. Emotional intensity fuels real change.',
      si: 'කුණාටු සහගත, තියුණු හා පරිවර්තනීය. ඔබ ගැඹුරින් හඟින අතර තියුණුව සිතයි; කැළඹීම නවීකරණයට මඟ පාදයි. හැඟීම්බර තීව්‍රතාව සැබෑ වෙනසකට ඉන්ධන සපයයි.',
    },
    keynotes: {
      en: ['A penetrating, analytical, and original mind', 'Growth through emotional storms and breakthroughs', 'Managing turbulence and harsh moods is key'],
      si: ['විනිවිද යන, විශ්ලේෂණාත්මක හා නව මනසක්', 'හැඟීම්බර කුණාටු හා පෙරළි හරහා වර්ධනය', 'කැළඹීම හා දරුණු මනෝභාවයන් කළමනාකරණය ප්‍රධානයි'],
    },
    career: {
      en: 'Research, technology, psychology, crisis work, anything that breaks and rebuilds.',
      si: 'පර්යේෂණ, තාක්ෂණය, මනෝ විද්‍යාව, අර්බුද කළමනාකරණය හා බිඳ දමා යළි ගොඩනඟන ඕනෑම දෙයක්.',
    },
    symbolMeaning: {
      en: 'The teardrop signals the storm that clears the air — release, then fresh growth.',
      si: 'කඳුළු බිඳුව වාතය පිරිසිදු කරන කුණාටුව නිරූපණය කරයි — මුදා හැරීමෙන් පසු නැවුම් වර්ධනයක්.',
    },
  },
  { // 6 Punarvasu
    personality: {
      en: 'Optimistic, wise, and resilient. You return, renew, and recover — bouncing back from setbacks with faith and generosity. A nurturing, philosophical spirit.',
      si: 'ශුභවාදී, ඥානවන්ත හා ප්‍රතිසන්ධානශීලී. ඔබ නැවත පැමිණේ, අලුත් වේ, යථා තත්ත්වයට පත් වේ — පසුබෑම්වලින් විශ්වාසයෙන් හා නොමසුරුව යළි නැගී සිටී. පෝෂණය කරන, දාර්ශනික ආත්මයකි.',
    },
    keynotes: {
      en: ['Remarkable ability to recover and start again', 'Wisdom, generosity, and contentment', 'Avoiding complacency once comfortable'],
      si: ['යථා තත්ත්වයට පත්ව නැවත ආරම්භ කිරීමේ කැපී පෙනෙන හැකියාව', 'ඥානය, නොමසුරුකම හා සතුට', 'පහසු වූ පසු අලසකමට නොවැටී සිටීම'],
    },
    career: {
      en: 'Teaching, philosophy, hospitality, counselling, writing, spiritual work.',
      si: 'ඉගැන්වීම, දර්ශනය, ආගන්තුක සත්කාරය, උපදේශනය, ලේඛන හා අධ්‍යාත්මික කටයුතු.',
    },
    symbolMeaning: {
      en: 'The bow and quiver signals the return of light and the power to begin anew.',
      si: 'දුන්න හා හීතුණිය ආලෝකයේ නැවත පැමිණීම හා අලුතින් ආරම්භ කිරීමේ බලය නිරූපණය කරයි.',
    },
  },
  { // 7 Pushya
    personality: {
      en: 'Caring, steady, and dutiful. The most nourishing of stars — you support, protect, and provide, with deep loyalty and spiritual grounding.',
      si: 'සැලකිලිමත්, ස්ථාවර හා යුතුකම් ඉටු කරන. නක්ෂත්‍ර අතුරින් වඩාත්ම පෝෂණය කරන — ඔබ ගැඹුරු විශ්වාසවන්තකමින් හා අධ්‍යාත්මික පදනමකින් සහාය දෙයි, ආරක්ෂා කරයි, සපයයි.',
    },
    keynotes: {
      en: ['Nourishing, dependable, and protective by nature', 'Strong sense of duty and service', 'Can become rigid or over-controlling when caring'],
      si: ['ස්වභාවයෙන්ම පෝෂණය කරන, විශ්වාසදායක හා ආරක්ෂාකාරී', 'ප්‍රබල යුතුකම් හා සේවා හැඟීම', 'රැකබලා ගැනීමේදී දැඩි හෝ අධික ලෙස පාලනය කරන්නෙකු විය හැක'],
    },
    career: {
      en: 'Caregiving, public service, food, teaching, religion, government.',
      si: 'රැකවරණය, මහජන සේවය, ආහාර, ඉගැන්වීම, ආගම හා රාජ්‍ය සේවය.',
    },
    symbolMeaning: {
      en: 'The flower/udder signals nourishment, blossoming, and the giving of sustenance.',
      si: 'මල/තන පුඩුව පෝෂණය, පිපීම හා පෝෂ්‍ය දාන දීම නිරූපණය කරයි.',
    },
  },
  { // 8 Ashlesha
    personality: {
      en: 'Magnetic, intuitive, and penetrating. You read people effortlessly and wield subtle influence. Deep insight comes with the need to use power wisely.',
      si: 'චුම්බක ගතියෙන් යුත්, ඉවෙන් දැනගන්නා හා විනිවිද යන. ඔබ මිනිසුන් පහසුවෙන් කියවා සියුම් බලපෑමක් යොදවයි. ගැඹුරු අවබෝධය සමඟ බලය ඥානවන්තව යෙදවීමේ අවශ්‍යතාවක් එයි.',
    },
    keynotes: {
      en: ['Hypnotic insight into people and hidden motives', 'Powerful intuition and persuasion', 'Channelling intensity without manipulation is the lesson'],
      si: ['මිනිසුන් හා සැඟවුණු චේතනා පිළිබඳ මෝහනීය අවබෝධය', 'ප්‍රබල ඉව හා ඒත්තු ගැන්වීමේ හැකියාව', 'උපායශීලී හසුරුවීමකින් තොරව තීව්‍රතාව යොදවා ගැනීම මෙහි පාඩමයි'],
    },
    career: {
      en: 'Psychology, healing, research, politics, occult, anything requiring deep insight.',
      si: 'මනෝ විද්‍යාව, සුව කිරීම, පර්යේෂණ, දේශපාලනය, ගුප්ත විද්‍යාව හා ගැඹුරු අවබෝධයක් අවශ්‍ය ඕනෑම දෙයක්.',
    },
    symbolMeaning: {
      en: 'The coiled serpent signals kundalini wisdom, mesmerising power, and hidden knowledge.',
      si: 'ගුලි වූ සර්පයා කුණ්ඩලිනී ඥානය, මෝහනීය බලය හා සැඟවුණු දැනුම නිරූපණය කරයි.',
    },
  },
  { // 9 Magha
    personality: {
      en: 'Regal, proud, and traditional. You honour roots, ancestors, and legacy, and carry a natural sense of authority and dignity.',
      si: 'රාජකීය, ආඩම්බර හා සම්ප්‍රදායික. ඔබ මූලයන්, පූර්වජයන් හා උරුමය ගරු කරයි, ස්වභාවික බලය හා අභිමානය දරයි.',
    },
    keynotes: {
      en: ['Natural leadership, dignity, and respect for tradition', 'Strong link to ancestry and heritage', 'Pride and entitlement are to be watched'],
      si: ['ස්වභාවික නායකත්වය, අභිමානය හා සම්ප්‍රදායට ගරු කිරීම', 'පෙළපත හා උරුමය සමඟ ප්‍රබල සම්බන්ධයක්', 'ආඩම්බරය හා හිමිකම් හැඟීම ගැන සැලකිලිමත් විය යුතුය'],
    },
    career: {
      en: 'Leadership, government, history, ceremony, family business, public honour.',
      si: 'නායකත්වය, රාජ්‍ය සේවය, ඉතිහාසය, උත්සව, පවුල් ව්‍යාපාර හා මහජන ගෞරවය.',
    },
    symbolMeaning: {
      en: 'The royal throne signals power, lineage, and the honour passed down from ancestors.',
      si: 'රාජ සිංහාසනය බලය, පෙළපත හා පූර්වජයන්ගෙන් ලැබෙන ගෞරවය නිරූපණය කරයි.',
    },
  },
  { // 10 Purva Phalguni
    personality: {
      en: 'Warm, creative, and pleasure-loving. You bring charm, romance, and enjoyment to life, with a generous and playful heart.',
      si: 'උණුසුම්, නිර්මාණශීලී හා සැපට ප්‍රිය. ඔබ ජීවිතයට ආකර්ෂණය, ප්‍රේමය හා විනෝදය ගෙන එයි, නොමසුරු හා සෙල්ලක්කාර හදවතකින්.',
    },
    keynotes: {
      en: ['Charm, creativity, and a love of pleasure', 'Generosity and social warmth', 'Balancing rest and indulgence with effort'],
      si: ['ආකර්ෂණය, නිර්මාණශීලීත්වය හා සැපට ඇති ඇල්ම', 'නොමසුරුකම හා සමාජශීලී උණුසුම', 'විවේකය හා සැපවිඳීම වෑයම සමඟ සමතුලිත කිරීම'],
    },
    career: {
      en: 'Arts, entertainment, hospitality, luxury, design, relationships.',
      si: 'කලා, විනෝදාස්වාදය, ආගන්තුක සත්කාරය, සුඛෝපභෝගය, නිර්මාණකරණය හා සම්බන්ධතා.',
    },
    symbolMeaning: {
      en: 'The front legs of the bed signal rest, pleasure, romance, and creative enjoyment.',
      si: 'ඇඳේ ඉදිරි කකුල් විවේකය, සැපය, ප්‍රේමය හා නිර්මාණශීලී විනෝදය නිරූපණය කරයි.',
    },
  },
  { // 11 Uttara Phalguni
    personality: {
      en: 'Generous, reliable, and kind. You help through steady commitment and genuine friendship, balancing ambition with service.',
      si: 'නොමසුරු, විශ්වාසදායක හා කරුණාවන්ත. ඔබ ස්ථාවර කැපවීමෙන් හා අවංක මිත්‍රත්වයෙන් උදව් කරයි, අභිලාෂය සේවය සමඟ සමතුලිත කරයි.',
    },
    keynotes: {
      en: ['Dependable, generous, and a true friend', 'Success through patient, ethical effort', 'Learning to receive, not only give'],
      si: ['විශ්වාසදායක, නොමසුරු හා සැබෑ මිතුරෙකි', 'ඉවසිලිවන්ත, සදාචාරාත්මක වෑයමෙන් සාර්ථකත්වය', 'දීම පමණක් නොව ලබා ගැනීම ද ඉගෙනීම'],
    },
    career: {
      en: 'Service, philanthropy, contracts, management, healing, partnerships.',
      si: 'සේවය, පරිත්‍යාගශීලීත්වය, ගිවිසුම්, කළමනාකරණය, සුව කිරීම හා හවුල්කාරිත්ව.',
    },
    symbolMeaning: {
      en: 'The back legs of the bed signal stability, rest after effort, and supportive partnership.',
      si: 'ඇඳේ පිටුපස කකුල් ස්ථාවරත්වය, වෙහෙසින් පසු විවේකය හා සහායක හවුල්කාරිත්වය නිරූපණය කරයි.',
    },
  },
  { // 12 Hasta
    personality: {
      en: 'Skilful, clever, and resourceful. Whatever you set your hands to, you master — practical, witty, and quick, with a knack for craft and detail.',
      si: 'දක්ෂ, දක්ෂ බුද්ධියක් ඇති හා සම්පත්දායී. ඔබ අත ගසන ඕනෑම දෙයක් ප්‍රගුණ කරයි — ප්‍රායෝගික, චතුර හා ක්ෂණික, ශිල්ප හා සියුම් විස්තර සඳහා දක්ෂතාවක් ඇත.',
    },
    keynotes: {
      en: ['Skilled hands and a clever, resourceful mind', 'Wit, dexterity, and practical problem-solving', 'Channelling restlessness into finished work'],
      si: ['දක්ෂ අත් හා චතුර, සම්පත්දායී මනසක්', 'චතුරකම, දක්ෂතාව හා ප්‍රායෝගික ගැටලු විසඳීම', 'නොසන්සුන්කම නිම කළ කාර්යයන් වෙත යොමු කිරීම'],
    },
    career: {
      en: 'Crafts, healing, trade, writing, astrology, fine handiwork, comedy.',
      si: 'අත්කම්, සුව කිරීම, වෙළඳාම, ලේඛන, ජ්‍යොතිෂය, සියුම් අත්කම් හා විහිළු කලාව.',
    },
    symbolMeaning: {
      en: 'The hand signals skill, craftsmanship, and the power to grasp and shape reality.',
      si: 'අත දක්ෂතාව, ශිල්පීත්වය හා යථාර්ථය අල්ලා හැඩ ගැස්වීමේ බලය නිරූපණය කරයි.',
    },
  },
  { // 13 Chitra
    personality: {
      en: 'Brilliant, artistic, and magnetic. You create beauty and shine in any setting, with a strong eye for form, design, and self-expression.',
      si: 'දීප්තිමත්, කලාත්මක හා චුම්බක ගතියෙන් යුත්. ඔබ සුන්දරත්වය නිර්මාණය කරයි, ඕනෑම තැනක බබළයි, හැඩය, නිර්මාණය හා ස්වයං ප්‍රකාශනය සඳහා ප්‍රබල දෘෂ්ටියක් ඇත.',
    },
    keynotes: {
      en: ['Striking creativity and an eye for beauty', 'Charisma and a flair for design', 'Vanity and surface-focus are the lessons'],
      si: ['කැපී පෙනෙන නිර්මාණශීලීත්වය හා සුන්දරත්වය දකින දෘෂ්ටිය', 'ආකර්ෂණීය බව හා නිර්මාණකරණය සඳහා දක්ෂතාව', 'මාන්නය හා මතුපිට කෙරෙහි පමණක් අවධානය මෙහි පාඩම් වේ'],
    },
    career: {
      en: 'Architecture, design, fashion, art, engineering, gemmology, media.',
      si: 'ගෘහ නිර්මාණ ශිල්පය, නිර්මාණකරණය, විලාසිතා, කලාව, ඉංජිනේරු විද්‍යාව, මැණික් විද්‍යාව හා මාධ්‍ය.',
    },
    symbolMeaning: {
      en: 'The bright jewel/pearl signals brilliance, artistry, and beauty crafted to perfection.',
      si: 'දිදුලන මැණික/මුතුව දීප්තිය, කලාත්මකභාවය හා පරිපූර්ණ ලෙස නිර්මාණය කළ සුන්දරත්වය නිරූපණය කරයි.',
    },
  },
  { // 14 Swati
    personality: {
      en: 'Independent, adaptable, and graceful. Like a young shoot in the wind, you bend without breaking, valuing freedom, balance, and self-reliance.',
      si: 'ස්වාධීන, හැඩ ගැසෙන සුළු හා අලංකාර. සුළඟේ දෝලනය වන දළු කැඩපතක් මෙන්, ඔබ නොකැඩී නැමෙයි, නිදහස, සමතුලිතතාව හා ස්වයංපෝෂිතභාවය අගය කරයි.',
    },
    keynotes: {
      en: ['Independence and the ability to adapt and thrive alone', 'Diplomacy, balance, and fair dealing', 'Learning interdependence, not just self-sufficiency'],
      si: ['ස්වාධීනත්වය හා තනිව හැඩ ගැසී දියුණු වීමේ හැකියාව', 'රාජ්‍ය තාන්ත්‍රිකභාවය, සමතුලිතතාව හා සාධාරණ ගනුදෙනු', 'ස්වයංපෝෂිතභාවය පමණක් නොව අන්‍යෝන්‍ය යැපීම ද ඉගෙනීම'],
    },
    career: {
      en: 'Business, trade, law, diplomacy, travel, independent ventures.',
      si: 'ව්‍යාපාර, වෙළඳාම, නීතිය, රාජ්‍ය තාන්ත්‍රිකභාවය, සංචාරක හා ස්වාධීන ව්‍යාපෘති.',
    },
    symbolMeaning: {
      en: 'The young shoot blowing in the wind signals flexibility, independence, and self-movement.',
      si: 'සුළඟේ දෝලනය වන දළුව නම්‍යශීලීත්වය, ස්වාධීනත්වය හා ස්වයං චලනය නිරූපණය කරයි.',
    },
  },
  { // 15 Vishakha
    personality: {
      en: 'Ambitious, focused, and goal-driven. You pursue aims with single-minded determination and rise through persistence toward a clear purpose.',
      si: 'අභිලාෂකාමී, අවධානයෙන් යුත් හා ඉලක්ක මත ක්‍රියා කරන. ඔබ ඒකාග්‍ර අධිෂ්ඨානයෙන් අරමුණු පසුපස යයි, පැහැදිලි අරමුණක් වෙත නොපසුබට උත්සාහයෙන් නැගී සිටී.',
    },
    keynotes: {
      en: ['Powerful determination and goal focus', 'Achievement through persistent effort', 'Patience with the journey, not only the prize'],
      si: ['ප්‍රබල අධිෂ්ඨානය හා ඉලක්කය කෙරෙහි අවධානය', 'නොපසුබට වෑයමෙන් ජයග්‍රහණය', 'ත්‍යාගය පමණක් නොව ගමන සම්බන්ධයෙන් ද ඉවසීම'],
    },
    career: {
      en: 'Leadership, research, politics, sales, any goal-driven field.',
      si: 'නායකත්වය, පර්යේෂණ, දේශපාලනය, අලෙවිය හා ඕනෑම ඉලක්ක මත ක්‍රියා කරන ක්ෂේත්‍රයක්.',
    },
    symbolMeaning: {
      en: 'The triumphal arch signals achievement, focused purpose, and the threshold of success.',
      si: 'ජයග්‍රාහී තෝරණය ජයග්‍රහණය, අවධානයෙන් යුත් අරමුණ හා සාර්ථකත්වයේ දොරටුව නිරූපණය කරයි.',
    },
  },
  { // 16 Anuradha
    personality: {
      en: 'Devoted, cooperative, and warm. You build deep friendships and thrive through teamwork, loyalty, and a balance of discipline and love.',
      si: 'භක්තිමත්, සහයෝගශීලී හා උණුසුම්. ඔබ ගැඹුරු මිත්‍රත්ව ගොඩනඟයි, කණ්ඩායම් වැඩ, විශ්වාසවන්තකම හා විනය-ආදරය සමතුලිතතාව හරහා දියුණු වේ.',
    },
    keynotes: {
      en: ['Gift for friendship, loyalty, and cooperation', 'Success through people and devotion', 'Navigating ups and downs without losing heart'],
      si: ['මිත්‍රත්වය, විශ්වාසවන්තකම හා සහයෝගය සඳහා දක්ෂතාව', 'මිනිසුන් හා භක්තිය හරහා සාර්ථකත්වය', 'නැගීම් වැටීම් හමුවේ නොසැලී ඉදිරියට යාම'],
    },
    career: {
      en: 'Teamwork, organisations, counselling, spirituality, foreign relations.',
      si: 'කණ්ඩායම් වැඩ, සංවිධාන, උපදේශනය, අධ්‍යාත්මිකත්වය හා විදේශ සම්බන්ධතා.',
    },
    symbolMeaning: {
      en: 'The lotus signals devotion blossoming through difficulty, and friendship across boundaries.',
      si: 'නෙළුම දුෂ්කරතා හරහා පිපෙන භක්තිය හා සීමා ඉක්මවා යන මිත්‍රත්වය නිරූපණය කරයි.',
    },
  },
  { // 17 Jyeshtha
    personality: {
      en: 'Senior, protective, and capable. You carry responsibility and authority, defending others and bearing heavy loads with quiet strength.',
      si: 'ජ්‍යෙෂ්ඨ, ආරක්ෂාකාරී හා හැකියාවෙන් යුත්. ඔබ වගකීම හා බලය දරයි, අන් අය ආරක්ෂා කරයි, බර දේ නිහඬ ශක්තියෙන් දරයි.',
    },
    keynotes: {
      en: ['Natural seniority, courage, and protectiveness', 'Capability under pressure and responsibility', 'Avoiding isolation, pride, or feeling unappreciated'],
      si: ['ස්වභාවික ජ්‍යෙෂ්ඨත්වය, ධෛර්යය හා ආරක්ෂාකාරී බව', 'පීඩනය හා වගකීම යටතේ හැකියාව', 'හුදෙකලාව, ආඩම්බරය හෝ අගය නොවන හැඟීම වළක්වා ගැනීම'],
    },
    career: {
      en: 'Management, military, protection, research, occult, problem-solving.',
      si: 'කළමනාකරණය, හමුදා සේවය, ආරක්ෂාව, පර්යේෂණ, ගුප්ත විද්‍යාව හා ගැටලු විසඳීම.',
    },
    symbolMeaning: {
      en: 'The circular amulet/earring signals protection, seniority, and hard-won authority.',
      si: 'රවුම් රැකවරණ තිළිණය/කරාබුව ආරක්ෂාව, ජ්‍යෙෂ්ඨත්වය හා වෙහෙසින් දිනාගත් බලය නිරූපණය කරයි.',
    },
  },
  { // 18 Mula
    personality: {
      en: 'Investigative, intense, and uprooting. You dig to the root of things, dismantling illusions to reach truth. Deep transformation runs through life.',
      si: 'විමර්ශනශීලී, තීව්‍ර හා මුලිනුපුටා දමන. ඔබ දේවල මුලට කැණීම් කරයි, සත්‍යයට ළඟා වීමට මිථ්‍යාවන් බිඳ දමයි. ගැඹුරු පරිවර්තනයක් ජීවිතය පුරා ගලා යයි.',
    },
    keynotes: {
      en: ['A truth-seeker who gets to the bottom of things', 'Power to dismantle and rebuild from the roots', 'Riding cycles of loss and renewal is the path'],
      si: ['දේවල පතුලට යන සත්‍ය ගවේෂකයෙකි', 'මුල සිට බිඳ දමා යළි ගොඩනැගීමේ බලය', 'පාඩු හා නවීකරණයේ චක්‍ර හරහා ගමන් කිරීම මෙහි මාර්ගයයි'],
    },
    career: {
      en: 'Research, investigation, medicine, philosophy, spirituality, root-cause work.',
      si: 'පර්යේෂණ, විමර්ශන, වෛද්‍ය විද්‍යාව, දර්ශනය, අධ්‍යාත්මිකත්වය හා මූල හේතු විශ්ලේෂණය.',
    },
    symbolMeaning: {
      en: 'The tied bunch of roots signals getting to the foundation — uprooting to find truth.',
      si: 'බැඳි මුල් පොකුර අත්තිවාරමට යාම නිරූපණය කරයි — සත්‍යය සෙවීමට මුලිනුපුටා දැමීම.',
    },
  },
  { // 19 Purva Ashadha
    personality: {
      en: 'Invincible, persuasive, and proud. You hold conviction and the power to inspire, refusing defeat and carrying others on a tide of optimism.',
      si: 'අජේය, ඒත්තු ගන්වන හා ආඩම්බර. ඔබ තුළ දැඩි විශ්වාසය හා ආශ්වාදනය කිරීමේ බලය පවතී, පරාජය ප්‍රතික්ෂේප කරයි, අන් අය ශුභවාදී රැල්ලක් මත රැගෙන යයි.',
    },
    keynotes: {
      en: ['Unshakeable conviction and persuasive power', 'Optimism that lifts and energises others', 'Tempering pride and stubbornness'],
      si: ['නොසැලෙන විශ්වාසය හා ඒත්තු ගැන්වීමේ බලය', 'අන් අය ඔසවා තබා ශක්තිමත් කරන ශුභවාදිත්වය', 'ආඩම්බරය හා මුරණ්ඩුකම හික්මවා ගැනීම'],
    },
    career: {
      en: 'Debate, law, politics, water/shipping, philosophy, public speaking.',
      si: 'විවාද, නීතිය, දේශපාලනය, ජල/නෞකා කර්මාන්තය, දර්ශනය හා මහජන දේශන.',
    },
    symbolMeaning: {
      en: 'The fan/winnowing basket signals invincibility, purification, and rising optimism.',
      si: 'පවන් යන්ත්‍රය/කුල්ල අජේයභාවය, පිරිසිදු කිරීම හා නැගී එන ශුභවාදිත්වය නිරූපණය කරයි.',
    },
  },
  { // 20 Uttara Ashadha
    personality: {
      en: 'Principled, persevering, and dignified. You win lasting victories through integrity and patience, earning respect that endures.',
      si: 'මූලධර්මවත්, නොපසුබට හා අභිමානවත්. ඔබ අවංකභාවයෙන් හා ඉවසීමෙන් කල් පවතින ජයග්‍රහණ ලබයි, කල් පවතින ගෞරවයක් උපයයි.',
    },
    keynotes: {
      en: ['Lasting success built on integrity', 'Perseverance and natural leadership', 'Balancing high standards with flexibility'],
      si: ['අවංකභාවය මත ගොඩනැගුණු කල් පවතින සාර්ථකත්වය', 'නොපසුබට උත්සාහය හා ස්වභාවික නායකත්වය', 'උසස් ප්‍රමිතීන් නම්‍යශීලීත්වය සමඟ සමතුලිත කිරීම'],
    },
    career: {
      en: 'Leadership, law, government, social causes, pioneering ventures.',
      si: 'නායකත්වය, නීතිය, රාජ්‍ය සේවය, සමාජ කටයුතු හා පුරෝගාමී ව්‍යාපෘති.',
    },
    symbolMeaning: {
      en: 'The elephant tusk/planks signal permanence, lasting victory, and unshakeable foundations.',
      si: 'ඇත් දළ/ලෑලි ස්ථිරභාවය, කල් පවතින ජයග්‍රහණය හා නොසැලෙන අත්තිවාරම් නිරූපණය කරයි.',
    },
  },
  { // 21 Shravana
    personality: {
      en: 'Attentive, learned, and connecting. You listen deeply and gather knowledge, linking people and ideas through wisdom and good counsel.',
      si: 'අවධානයෙන් යුත්, උගත් හා සම්බන්ධ කරන. ඔබ ගැඹුරින් සවන් දෙයි, දැනුම රැස් කරයි, ඥානය හා යහ උපදෙස් හරහා මිනිසුන් හා අදහස් සම්බන්ධ කරයි.',
    },
    keynotes: {
      en: ['A gifted listener and learner', 'Wisdom shared through teaching and counsel', 'Acting on knowledge, not only collecting it'],
      si: ['දක්ෂ සවන්දෙන්නෙකු හා ඉගෙනුම්කරුවෙකි', 'ඉගැන්වීම හා උපදෙස් හරහා බෙදාහරින ඥානය', 'දැනුම එකතු කිරීම පමණක් නොව එය ක්‍රියාවට නැංවීම'],
    },
    career: {
      en: 'Teaching, media, counselling, languages, music, advisory roles.',
      si: 'ඉගැන්වීම, මාධ්‍ය, උපදේශනය, භාෂා, සංගීතය හා උපදේශන කටයුතු.',
    },
    symbolMeaning: {
      en: 'The ear/three footprints signal listening, learning, and connecting across the world.',
      si: 'කන/පා සටහන් තුන සවන්දීම, ඉගෙනීම හා ලොව පුරා සම්බන්ධ වීම නිරූපණය කරයි.',
    },
  },
  { // 22 Dhanishta
    personality: {
      en: 'Rhythmic, prosperous, and capable. You carry natural wealth, musicality, and group leadership, thriving where rhythm and resources meet.',
      si: 'රිද්මයෙන් යුත්, සමෘද්ධිමත් හා හැකියාවෙන් යුත්. ඔබ ස්වභාවික ධනය, සංගීතමය හැකියාව හා කණ්ඩායම් නායකත්වය දරයි, රිද්මය හා සම්පත් හමු වන තැන දියුණු වේ.',
    },
    keynotes: {
      en: ['A gift for prosperity, rhythm, and performance', 'Leadership within groups and teams', 'Softening ambition with warmth'],
      si: ['සමෘද්ධිය, රිද්මය හා ප්‍රසංග සඳහා දක්ෂතාව', 'කණ්ඩායම් හා සමූහ තුළ නායකත්වය', 'අභිලාෂය උණුසුමෙන් මෘදු කිරීම'],
    },
    career: {
      en: 'Music, real estate, finance, management, performance, engineering.',
      si: 'සංගීතය, දේපළ, මූල්‍ය, කළමනාකරණය, ප්‍රසංග කලා හා ඉංජිනේරු විද්‍යාව.',
    },
    symbolMeaning: {
      en: 'The drum signals rhythm, fame, abundance, and the power to set the beat for others.',
      si: 'බෙරය රිද්මය, කීර්තිය, සමෘද්ධිය හා අන් අයට රිද්මය සකසන බලය නිරූපණය කරයි.',
    },
  },
  { // 23 Shatabhisha
    personality: {
      en: 'Independent, mystical, and healing. You are private and unconventional, drawn to hidden truths, healing, and seeing what others miss.',
      si: 'ස්වාධීන, අද්භූත හා සුව කරන. ඔබ පෞද්ගලික හා සම්ප්‍රදායට වෙනස්, සැඟවුණු සත්‍යයන්, සුව කිරීම හා අන් අයට නොපෙනෙන දේ දැකීම කෙරෙහි ඇදෙයි.',
    },
    keynotes: {
      en: ['Healer and seeker of hidden, scientific, or mystical truth', 'Strong independence and originality', 'Opening up rather than isolating'],
      si: ['සැඟවුණු, විද්‍යාත්මක හෝ අද්භූත සත්‍යය සොයන සුව කරන්නෙකි', 'ප්‍රබල ස්වාධීනත්වය හා නවෝත්පාදනශීලීත්වය', 'හුදෙකලා වීම වෙනුවට විවෘත වීම'],
    },
    career: {
      en: 'Medicine, healing, astrology, technology, research, aviation.',
      si: 'වෛද්‍ය විද්‍යාව, සුව කිරීම, ජ්‍යොතිෂය, තාක්ෂණය, පර්යේෂණ හා ගුවන් සේවා.',
    },
    symbolMeaning: {
      en: 'The empty circle / hundred stars signals the cosmic veil, healing, and hidden wholeness.',
      si: 'හිස් රවුම/තරු සියය විශ්ව තිරය, සුව කිරීම හා සැඟවුණු සම්පූර්ණත්වය නිරූපණය කරයි.',
    },
  },
  { // 24 Purva Bhadrapada
    personality: {
      en: 'Intense, idealistic, and fiery. You hold a dual nature — worldly and spiritual — with passion for transformation and a fearless, unconventional edge.',
      si: 'තීව්‍ර, පරමාදර්ශී හා තෙජස්වී. ඔබ ද්විත්ව ස්වභාවයක් දරයි — ලෞකික හා අධ්‍යාත්මික — පරිවර්තනය සඳහා ආශාවක් හා නිර්භීත, සම්ප්‍රදායට වෙනස් ගතියක් සමඟ.',
    },
    keynotes: {
      en: ['Passionate idealism and transformative drive', 'Courage to stand apart for a higher purpose', 'Balancing extremes and intensity'],
      si: ['ආශාවෙන් යුත් පරමාදර්ශීත්වය හා පරිවර්තනීය ආශාව', 'උසස් අරමුණක් වෙනුවෙන් වෙනස්ව සිටීමේ ධෛර්යය', 'අන්තයන් හා තීව්‍රතාව සමතුලිත කිරීම'],
    },
    career: {
      en: 'Research, occult, finance, priesthood, radical or reform work.',
      si: 'පර්යේෂණ, ගුප්ත විද්‍යාව, මූල්‍ය, පූජක සේවය හා රැඩිකල් හෝ ප්‍රතිසංස්කරණ කටයුතු.',
    },
    symbolMeaning: {
      en: 'The funeral cot / two-faced man signals death-and-rebirth and the meeting of two worlds.',
      si: 'මිනී පුටුව / දෙමුහුම් මිනිසා මරණය හා නැවත උපත හා ලෝක දෙකක හමුව නිරූපණය කරයි.',
    },
  },
  { // 25 Uttara Bhadrapada
    personality: {
      en: 'Wise, calm, and deep. You carry quiet spiritual depth, patience, and compassion, offering steady support drawn from inner stillness.',
      si: 'ඥානවන්ත, සන්සුන් හා ගැඹුරු. ඔබ නිහඬ අධ්‍යාත්මික ගැඹුර, ඉවසීම හා කරුණාව දරයි, අභ්‍යන්තර නිශ්චලතාවෙන් ලැබෙන ස්ථාවර සහයක් ලබා දෙයි.',
    },
    keynotes: {
      en: ['Deep calm, wisdom, and compassion', 'Strength that supports others quietly', 'Engaging the world rather than withdrawing'],
      si: ['ගැඹුරු සන්සුන්කම, ඥානය හා කරුණාව', 'අන් අයට නිහඬව සහාය වන ශක්තිය', 'ඉවත් වීම වෙනුවට ලෝකය සමඟ නිරත වීම'],
    },
    career: {
      en: 'Counselling, charity, writing, spirituality, research, healing.',
      si: 'උපදේශනය, පුණ්‍ය කටයුතු, ලේඛන, අධ්‍යාත්මිකත්වය, පර්යේෂණ හා සුව කිරීම.',
    },
    symbolMeaning: {
      en: 'The serpent of the deep / back of the cot signals stillness, depth, and serene wisdom.',
      si: 'ගැඹුරේ සර්පයා / පුටුවේ පිටුපස නිශ්චලතාව, ගැඹුර හා සන්සුන් ඥානය නිරූපණය කරයි.',
    },
  },
  { // 26 Revati
    personality: {
      en: 'Gentle, nourishing, and protective. You guide and shelter others, with a kind, dreamy, and spiritually-attuned nature that loves to see safe arrivals.',
      si: 'මෘදු, පෝෂණය කරන හා ආරක්ෂාකාරී. ඔබ අන් අයට මඟ පෙන්වයි, රැකවරණය දෙයි, කරුණාවන්ත, සිහින දකින හා අධ්‍යාත්මිකව සම්බන්ධිත ස්වභාවයකින් ආරක්ෂිත පැමිණීම් දැකීමට ප්‍රිය කරයි.',
    },
    keynotes: {
      en: ['Compassionate, nurturing, and protective', 'A guiding, safe presence for others', 'Guarding against over-giving and being taken for granted'],
      si: ['කරුණාවන්ත, පෝෂණය කරන හා ආරක්ෂාකාරී', 'අන් අයට මඟ පෙන්වන, ආරක්ෂිත පැවැත්මක්', 'අධික ලෙස දීමෙන් හා නොතකා හරිනු ලැබීමෙන් ආරක්ෂා වීම'],
    },
    career: {
      en: 'Caregiving, travel, hospitality, art, spirituality, animal welfare.',
      si: 'රැකවරණය, සංචාරක, ආගන්තුක සත්කාරය, කලාව, අධ්‍යාත්මිකත්වය හා සත්ත්ව සුබසාධනය.',
    },
    symbolMeaning: {
      en: 'The fish in the sea signals safe passage, nourishment, and guidance to the journey’s end.',
      si: 'මුහුදේ මාළුවා ආරක්ෂිත ගමන, පෝෂණය හා ගමනේ අවසානය දක්වා මඟ පෙන්වීම නිරූපණය කරයි.',
    },
  },
];

// Ruling planet → emotional/mind theme + first-dasha note.
export const LORD_THEME: Record<string, Bi> = {
  Ketu: {
    en: 'Ketu rules your mind, seeding intuition, detachment, and a spiritual undercurrent. Your very first life-period (Mahadasha) is Ketu — so early life often centres on letting go, inner searching, and learning not to cling.',
    si: 'කේතු ඔබේ මනස පාලනය කරයි, ඉව, වෙන්වීම හා අධ්‍යාත්මික යටි ධාරාවක් රෝපණය කරයි. ඔබේ පළමු ජීවන කාලය (මහා දශාව) කේතුය — එබැවින් මුල් ජීවිතය බොහෝ විට අත්හැරීම, අභ්‍යන්තර සෙවීම හා නොඇලීම ඉගෙනීම කේන්ද්‍ර කර ගනී.',
  },
  Venus: {
    en: 'Venus rules your mind, colouring it with love, beauty, comfort, and a longing for harmony. Your first Mahadasha is Venus — early life leans toward relationships, art, pleasures, and material ease.',
    si: 'ශුක්‍ර ඔබේ මනස පාලනය කරයි, එය ආදරය, සුන්දරත්වය, පහසුව හා සමගිය සඳහා ආශාවෙන් වර්ණවත් කරයි. ඔබේ පළමු මහා දශාව ශුක්‍රය — මුල් ජීවිතය සම්බන්ධතා, කලා, සැප සම්පත් හා භෞතික පහසුව වෙත නැඹුරු වේ.',
  },
  Sun: {
    en: 'The Sun rules your mind, giving it pride, purpose, and a need for recognition and selfhood. Your first Mahadasha is the Sun — early life revolves around identity, authority, and the father.',
    si: 'සූර්යයා ඔබේ මනස පාලනය කරයි, එයට අභිමානය, අරමුණ හා පිළිගැනීම ද ආත්මභාවය ද අවශ්‍යතාවක් ලබා දෙයි. ඔබේ පළමු මහා දශාව සූර්යයාය — මුල් ජීවිතය අනන්‍යතාව, බලය හා පියා වටා ගමන් කරයි.',
  },
  Moon: {
    en: 'The Moon rules your mind (its own significator), making feeling, care, and connection central. Your first Mahadasha is the Moon — early life is steeped in emotion, the mother, and nurturing.',
    si: 'චන්ද්‍රයා ඔබේ මනස පාලනය කරයි (එහි කාරකයාම), හැඟීම්, රැකවරණය හා සම්බන්ධතාව කේන්ද්‍රීය කරයි. ඔබේ පළමු මහා දශාව චන්ද්‍රයාය — මුල් ජීවිතය හැඟීම්, මව හා පෝෂණයෙන් පිරී පවතී.',
  },
  Mars: {
    en: 'Mars rules your mind, charging it with drive, courage, and a competitive edge. Your first Mahadasha is Mars — early life brings energy, assertiveness, and a push to act.',
    si: 'කුජ ඔබේ මනස පාලනය කරයි, එයට ආශාව, ධෛර්යය හා තරඟකාරී ගතියක් ලබා දෙයි. ඔබේ පළමු මහා දශාව කුජය — මුල් ජීවිතය ශක්තිය, ස්ථිරභාවය හා ක්‍රියා කිරීමට තල්ලුවක් ගෙන එයි.',
  },
  Rahu: {
    en: 'Rahu rules your mind, pulling it toward ambition, the unconventional, and worldly hunger. Your first Mahadasha is Rahu — early life is restless, boundary-pushing, and hungry for experience.',
    si: 'රාහු ඔබේ මනස පාලනය කරයි, එය අභිලාෂය, සම්ප්‍රදායට වෙනස් දෑ හා ලෞකික ආශාව වෙත ඇද ගනී. ඔබේ පළමු මහා දශාව රාහුය — මුල් ජීවිතය නොසන්සුන්, සීමා තල්ලු කරන හා අත්දැකීම් සඳහා ආශාවෙන් පිරී පවතී.',
  },
  Jupiter: {
    en: 'Jupiter rules your mind, blessing it with wisdom, faith, and an urge to grow and understand. Your first Mahadasha is Jupiter — early life favours learning, guidance, and expansion.',
    si: 'ගුරු ඔබේ මනස පාලනය කරයි, එයට ඥානය, විශ්වාසය හා වර්ධනය වී තේරුම් ගැනීමේ ආශාව ලබා දෙයි. ඔබේ පළමු මහා දශාව ගුරුය — මුල් ජීවිතය ඉගෙනීම, මඟ පෙන්වීම හා ව්‍යාප්තියට හිතකරය.',
  },
  Saturn: {
    en: 'Saturn rules your mind, giving it patience, depth, and a serious, responsible cast. Your first Mahadasha is Saturn — early life teaches discipline, endurance, and delayed reward.',
    si: 'ශනි ඔබේ මනස පාලනය කරයි, එයට ඉවසීම, ගැඹුර හා බැරෑරුම්, වගකීම් සහගත ස්වභාවයක් ලබා දෙයි. ඔබේ පළමු මහා දශාව ශනිය — මුල් ජීවිතය විනය, විඳදරාගැනීම හා ප්‍රමාද වූ ත්‍යාග උගන්වයි.',
  },
  Mercury: {
    en: 'Mercury rules your mind, making it quick, curious, communicative, and adaptable. Your first Mahadasha is Mercury — early life sharpens intellect, speech, and learning.',
    si: 'බුධ ඔබේ මනස පාලනය කරයි, එය ඉක්මන්, කුතුහලයෙන් යුත්, සන්නිවේදනශීලී හා හැඩ ගැසෙන සුළු කරයි. ඔබේ පළමු මහා දශාව බුධය — මුල් ජීවිතය බුද්ධිය, කථනය හා ඉගෙනීම තියුණු කරයි.',
  },
};

export const GANA_MEANING: Record<string, Bi> = {
  Deva: {
    en: 'A Deva (divine) temperament — gentle, refined, idealistic, and oriented toward harmony, generosity, and higher values. You generally get along most easily with other Deva and Manushya natures.',
    si: 'දේව (දිව්‍ය) ස්වභාවයකි — මෘදු, පිරිපහදු, පරමාදර්ශී හා සමගිය, නොමසුරුකම හා උසස් සාරධර්ම වෙත නැඹුරු. ඔබ සාමාන්‍යයෙන් අනෙකුත් දේව හා මනුෂ්‍ය ස්වභාවයන් සමඟ පහසුවෙන් ගැළපේ.',
  },
  Manushya: {
    en: 'A Manushya (human) temperament — balanced and practical, blending material ambition with real sensitivity. You navigate both the worldly and the emotional with even footing.',
    si: 'මනුෂ්‍ය (මානව) ස්වභාවයකි — සමතුලිත හා ප්‍රායෝගික, භෞතික අභිලාෂය සැබෑ සංවේදිතාව සමඟ මුසු කරයි. ඔබ ලෞකික හා හැඟීම්බර දෙකම සමව හසුරුවයි.',
  },
  Rakshasa: {
    en: 'A Rakshasa (intense) temperament — strong-willed, self-reliant, and penetrating, with formidable focus and drive. Your strength is conviction; the lesson is flexibility and patience with others.',
    si: 'රාක්ෂස (තීව්‍ර) ස්වභාවයකි — ප්‍රබල අධිෂ්ඨානයක්, ස්වයංපෝෂිත හා විනිවිද යන, බලවත් අවධානයක් හා ආශාවක් සහිත. ඔබේ ශක්තිය දැඩි විශ්වාසයයි; පාඩම නම්‍යශීලීත්වය හා අන් අය සමඟ ඉවසීමයි.',
  },
};

export const PADA_MEANING: Record<number, Bi> = {
  1: {
    en: 'Pada 1 falls in a fiery Navamsa quarter — it adds drive, initiative, and a dharmic, identity-focused flavour to your star’s qualities. You express the nakshatra boldly and personally.',
    si: 'පළමු පාදය තෙජස් නවාංශක කොටසකට වැටේ — එය ඔබේ නක්ෂත්‍රයේ ගුණාංගවලට ආශාව, මුල පිරීම හා ධාර්මික, අනන්‍යතාව කේන්ද්‍ර කරගත් ගතියක් එක් කරයි. ඔබ නක්ෂත්‍රය නිර්භීතව හා පෞද්ගලිකව ප්‍රකාශ කරයි.',
  },
  2: {
    en: 'Pada 2 falls in an earthy Navamsa quarter — it adds practicality, resourcefulness, and a material focus. You express the nakshatra in grounded, results-oriented ways.',
    si: 'දෙවන පාදය භූමිමය නවාංශක කොටසකට වැටේ — එය ප්‍රායෝගිකභාවය, සම්පත්දායීත්වය හා භෞතික අවධානයක් එක් කරයි. ඔබ නක්ෂත්‍රය යථාර්ථවාදී, ප්‍රතිඵල කේන්ද්‍ර කරගත් ලෙස ප්‍රකාශ කරයි.',
  },
  3: {
    en: 'Pada 3 falls in an airy Navamsa quarter — it adds intellect, sociability, and communication. You express the nakshatra through ideas, connection, and exchange.',
    si: 'තෙවන පාදය වායුමය නවාංශක කොටසකට වැටේ — එය බුද්ධිය, සමාජශීලීත්වය හා සන්නිවේදනය එක් කරයි. ඔබ නක්ෂත්‍රය අදහස්, සම්බන්ධතා හා හුවමාරුව හරහා ප්‍රකාශ කරයි.',
  },
  4: {
    en: 'Pada 4 falls in a watery Navamsa quarter — it adds emotion, depth, and reflection. You express the nakshatra inwardly, intuitively, and with feeling.',
    si: 'සිව්වන පාදය ජලමය නවාංශක කොටසකට වැටේ — එය හැඟීම, ගැඹුර හා මෙනෙහි කිරීම එක් කරයි. ඔබ නක්ෂත්‍රය අභ්‍යන්තරව, ඉවෙන් හා හැඟීමෙන් ප්‍රකාශ කරයි.',
  },
};

export const DEITY_THEME: Record<string, Bi> = {
  'Ashwini Kumaras': { en: 'the twin celestial physicians — divine healers who bring speed, rescue, and miraculous recovery.', si: 'නිවුන් දිව්‍ය වෛද්‍යවරු — වේගය, බේරාගැනීම හා ආශ්චර්යමත් සුවය ගෙන එන දිව්‍ය සුව කරන්නෝ.' },
  Yama: { en: 'the lord of dharma and death — bringing discipline, justice, restraint, and the courage to face limits.', si: 'ධර්මයේ හා මරණයේ අධිපතියා — විනය, යුක්තිය, සංයමය හා සීමා හමුවීමේ ධෛර්යය ගෙන දෙයි.' },
  Agni: { en: 'the god of fire — purifying, energising, and carrying offerings between worlds; a force that burns away impurity.', si: 'ගිනි දෙවියා — පිරිසිදු කරන, ශක්තිය දෙන හා ලෝක අතර පූජා රැගෙන යන; අපිරිසිදුකම දවා දමන බලයකි.' },
  Brahma: { en: 'the creator — bringing fertility, growth, and the power to bring new things into being.', si: 'මැවුම්කරු — සරුබව, වර්ධනය හා නව දේ බිහි කිරීමේ බලය ගෙන දෙයි.' },
  Soma: { en: 'the moon-nectar deity — bringing nourishment, bliss, and the sweetness of life and the mind.', si: 'චන්ද්‍ර-අමෘත දෙවියා — පෝෂණය, ප්‍රීතිය හා ජීවිතයේ ද මනසේ ද මිහිර ගෙන දෙයි.' },
  Rudra: { en: 'the storm and fierce healer — bringing transformation through upheaval and the clearing power of intensity.', si: 'කුණාටුව හා දරුණු සුව කරන්නා — කැළඹීම හරහා පරිවර්තනය හා තීව්‍රතාවේ පිරිසිදු කරන බලය ගෙන දෙයි.' },
  Aditi: { en: 'the boundless mother of the gods — bringing renewal, abundance, freedom, and the power to begin again.', si: 'දෙවියන්ගේ අසීමිත මව — නවීකරණය, සමෘද්ධිය, නිදහස හා නැවත ආරම්භ කිරීමේ බලය ගෙන දෙයි.' },
  Brihaspati: { en: 'the guru of the gods — bringing wisdom, faith, good counsel, and benevolent guidance.', si: 'දෙවියන්ගේ ගුරුවරයා — ඥානය, විශ්වාසය, යහ උපදෙස් හා යහපත් මඟ පෙන්වීම ගෙන දෙයි.' },
  Nagas: { en: 'the wise serpents — bringing hidden knowledge, intuition, and mesmerising, kundalini power.', si: 'ඥානවන්ත සර්පයෝ — සැඟවුණු දැනුම, ඉව හා මෝහනීය කුණ්ඩලිනී බලය ගෙන දෙයි.' },
  Pitris: { en: 'the ancestors — bringing lineage, legacy, blessings from the past, and the honour of roots.', si: 'පූර්වජයෝ — පෙළපත, උරුමය, අතීතයේ ආශිර්වාද හා මූලයන්ගේ ගෞරවය ගෙන දෙයි.' },
  Bhaga: { en: 'the god of fortune and delight — bringing prosperity, pleasure, marriage, and shared enjoyment.', si: 'වාසනාවේ හා ප්‍රීතියේ දෙවියා — සමෘද්ධිය, සැපය, විවාහය හා හවුලේ විඳීම ගෙන දෙයි.' },
  Aryaman: { en: 'the god of contracts and friendship — bringing nobility, generosity, and honourable bonds.', si: 'ගිවිසුම් හා මිත්‍රත්වයේ දෙවියා — උතුම්භාවය, නොමසුරුකම හා ගෞරවනීය බැඳීම් ගෙන දෙයි.' },
  Savitar: { en: 'the solar inspirer — bringing skill, vitality, and the creative power that sets life in motion.', si: 'සූර්ය ආශ්වාදකයා — දක්ෂතාව, ජීවශක්තිය හා ජීවිතය චලනය කරවන නිර්මාණශීලී බලය ගෙන දෙයි.' },
  Vishwakarma: { en: 'the divine architect — bringing craftsmanship, design, and the power to build beauty.', si: 'දිව්‍ය ගෘහ නිර්මාණ ශිල්පියා — ශිල්පීත්වය, නිර්මාණකරණය හා සුන්දරත්වය ගොඩනැගීමේ බලය ගෙන දෙයි.' },
  Vayu: { en: 'the wind god — bringing movement, independence, breath, and the freedom to roam.', si: 'වායු දෙවියා — චලනය, ස්වාධීනත්වය, හුස්ම හා සැරිසැරීමේ නිදහස ගෙන දෙයි.' },
  'Indra-Agni': { en: 'the combined powers of Indra and Agni — bringing focused force, achievement, and triumphant energy.', si: 'ඉන්ද්‍ර හා අග්නි එක් වූ බලයන් — අවධානයෙන් යුත් බලය, ජයග්‍රහණය හා ජයග්‍රාහී ශක්තිය ගෙන දෙයි.' },
  Mitra: { en: 'the god of friendship and compassion — bringing devotion, cooperation, and warmth across boundaries.', si: 'මිත්‍රත්වයේ හා කරුණාවේ දෙවියා — භක්තිය, සහයෝගය හා සීමා ඉක්මවා යන උණුසුම ගෙන දෙයි.' },
  Indra: { en: 'the king of the gods — bringing courage, leadership, protection, and victory over obstacles.', si: 'දෙවියන්ගේ රජු — ධෛර්යය, නායකත්වය, ආරක්ෂාව හා බාධක මත ජයග්‍රහණය ගෙන දෙයි.' },
  Nirriti: { en: 'the goddess of dissolution — bringing the power to uproot, transform, and rebuild from the depths.', si: 'විනාශයේ දේවතාවිය — මුලිනුපුටා දැමීමේ, පරිවර්තනය කිරීමේ හා ගැඹුරින් යළි ගොඩනැගීමේ බලය ගෙන දෙයි.' },
  Apas: { en: 'the water deities — bringing purification, vitality, invincibility, and life-giving flow.', si: 'ජල දේවතාවෝ — පිරිසිදු කිරීම, ජීවශක්තිය, අජේයභාවය හා ජීවය දෙන ගැලීම ගෙන දෙයි.' },
  Vishvadevas: { en: 'the universal gods — bringing integrity, perseverance, and victory earned through righteousness.', si: 'විශ්ව දෙවියෝ — අවංකභාවය, නොපසුබට උත්සාහය හා ධර්මය හරහා දිනාගත් ජයග්‍රහණය ගෙන දෙයි.' },
  Vishnu: { en: 'the preserver — bringing protection, listening wisdom, and the power that pervades and sustains all.', si: 'ආරක්ෂකයා — ආරක්ෂාව, සවන්දීමේ ඥානය හා සියල්ල පැතිර පවත්වන බලය ගෙන දෙයි.' },
  Vasus: { en: 'the eight gods of abundance — bringing wealth, rhythm, prosperity, and mastery of resources.', si: 'සමෘද්ධියේ දෙවිවරු අට දෙනා — ධනය, රිද්මය, සමෘද්ධිය හා සම්පත් හසුරුවීමේ දක්ෂතාව ගෙන දෙයි.' },
  Varuna: { en: 'the god of cosmic waters and order — bringing healing, mystery, and the power to see hidden truth.', si: 'විශ්ව ජලයේ හා පිළිවෙළේ දෙවියා — සුව කිරීම, අභිරහස හා සැඟවුණු සත්‍යය දැකීමේ බලය ගෙන දෙයි.' },
  'Aja Ekapada': { en: 'the one-footed goat / fiery pillar — bringing spiritual fire, transformation, and dual-natured intensity.', si: 'එක් පා ඇති එළුවා / තෙජස් කණුව — අධ්‍යාත්මික ගින්න, පරිවර්තනය හා ද්විත්ව ස්වභාවික තීව්‍රතාව ගෙන දෙයි.' },
  'Ahir Budhnya': { en: 'the serpent of the deep — bringing stillness, depth, wisdom, and serene spiritual power.', si: 'ගැඹුරේ සර්පයා — නිශ්චලතාව, ගැඹුර, ඥානය හා සන්සුන් අධ්‍යාත්මික බලය ගෙන දෙයි.' },
  Pushan: { en: 'the nourishing shepherd — bringing safe journeys, guidance, protection, and care for all beings.', si: 'පෝෂණය කරන එඬේරා — ආරක්ෂිත ගමන්, මඟ පෙන්වීම, ආරක්ෂාව හා සියලු සත්ත්වයන් කෙරෙහි රැකවරණය ගෙන දෙයි.' },
};

/** Sentence frames tying the item bodies together. */
export const NAK_FRAMES = {
  overviewBody: (personality: string, career: string, lang: Lang): string =>
    lang === 'si' ? `${personality} වඩාත් ගැළපෙන මාර්ග: ${career}` : `${personality} Best-suited paths: ${career}`,
  lordFallback: (lord: string, lang: Lang): string =>
    lang === 'si'
      ? `${lord} මෙම නක්ෂත්‍රය පාලනය කර ඔබේ මනසේ හා පළමු ජීවන කාලයේ ස්වරූපය හැඩ ගස්වයි.`
      : `${lord} rules this nakshatra and shapes the tone of your mind and your first life-period.`,
  ganaFallback: (gana: string, lang: Lang): string =>
    lang === 'si' ? `${gana} ඔබේ මූලික ස්වභාවය විස්තර කරයි.` : `${gana} describes your basic temperament.`,
  padaFallback: (lang: Lang): string =>
    lang === 'si' ? 'පාදය (කාර්තුව) නවාංශකය හරහා නක්ෂත්‍රය සියුම් ලෙස සකසයි.' : 'The pada (quarter) fine-tunes the nakshatra through the Navamsa.',
  deityBody: (deity: string, theme: string, lang: Lang): string =>
    lang === 'si'
      ? `ඔබේ නක්ෂත්‍රය ${deity} විසින් අධිපත්‍යය දරයි — ${theme} එහි ගුණාංග ඔබේ අභ්‍යන්තර ස්වභාවයට හා ඔබට යොදා ගත හැකි ආශිර්වාදවලට ගලා එයි.`
      : `Your nakshatra is presided over by ${deity} — ${theme} Its qualities flow into your inner nature and the blessings you can draw on.`,
  deityFallback: { en: 'a guiding cosmic power.', si: 'මඟ පෙන්වන විශ්ව බලයක්.' } as Bi,
};
