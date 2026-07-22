/** Wealth details and remedies per dasha lord, in English and Sinhala. */

import type { AreaSpec } from './areaHealth';

export const WEALTH_SPEC: Record<string, AreaSpec> = {
  Sun: {
    details: {
      en: [
        'Income through government contracts, public sector, or authority',
        'Paternal inheritance or support from father figures possible',
        'Professional recognition directly translates to financial rewards',
        'Leadership and administrative roles increase earning capacity',
        'Gold, copper, and government bonds are favorable investments',
      ],
      si: [
        'රජයේ කොන්ත්‍රාත්, රාජ්‍ය අංශය හෝ නිලබලය හරහා ආදායම',
        'පියාගෙන් උරුමයක් හෝ පියා වැනි අයගෙන් සහයක් ලැබිය හැක',
        'වෘත්තීය පිළිගැනීම කෙලින්ම මූල්‍ය ප්‍රතිලාභ බවට හැරේ',
        'නායකත්ව හා පරිපාලන තනතුරු උපයන හැකියාව වැඩි කරයි',
        'රන්, තඹ හා රාජ්‍ය බැඳුම්කර හිතකර ආයෝජන වේ',
      ],
    },
    remedies: {
      en: [
        'Donate wheat and jaggery to the poor on Sundays',
        'Serve your father and elders with respect and generosity',
        'Keep workplace free of ego-driven conflicts to protect income',
        'Wear ruby to attract authority-based financial opportunities',
      ],
      si: [
        'ඉරිදා දිනවල දුප්පතුන්ට තිරිඟු හා හකුරු දන් දෙන්න',
        'ගෞරවයෙන් හා නොමසුරුව පියාට හා වැඩිහිටියන්ට සේවය කරන්න',
        'ආදායම රැක ගැනීමට සේවා ස්ථානය අහංකාරයෙන් හටගන්නා ගැටුම්වලින් තොරව තබා ගන්න',
        'නිලබලය හා බැඳුණු මූල්‍ය අවස්ථා ලබා ගැනීමට මාණික්‍යය පැළඳ ගන්න',
      ],
    },
  },

  Moon: {
    details: {
      en: [
        'Income from public-facing businesses and hospitality industries',
        'Real estate, land, and immovable property gains are favorable',
        'Mother or maternal family may provide financial support',
        'Liquid assets, savings accounts, and silver investments grow',
        'Income levels fluctuate with emotional state and lunar cycles',
      ],
      si: [
        'මහජනතාව හා ගනුදෙනු කරන ව්‍යාපාර හා ආගන්තුක සත්කාර කර්මාන්තවලින් ආදායම',
        'දේපළ, ඉඩම් හා නිශ්චල දේපළවලින් ලාභ ලැබීම හිතකරය',
        'මව හෝ මවගේ පාර්ශ්වයේ නෑදෑයන් මූල්‍ය සහයක් දිය හැක',
        'ද්‍රවශීල වත්කම්, ඉතිරිකිරීමේ ගිණුම් හා රිදී ආයෝජන වර්ධනය වේ',
        'හැඟීම්බර තත්ත්වය හා චන්ද්‍ර චක්‍ර අනුව ආදායම් මට්ටම් උච්චාවචනය වේ',
      ],
    },
    remedies: {
      en: [
        'Donate white rice and milk to those in need on Mondays',
        'Serve your mother and support elderly women in your life',
        'Avoid major financial commitments on new moon days',
        'Keep silver items, sea shells, or moon-related objects at home',
      ],
      si: [
        'සඳුදා දිනවල අවශ්‍යතාවෙන් පසුවන අයට සුදු සහල් හා කිරි දන් දෙන්න',
        'මවට සේවය කර ඔබේ ජීවිතයේ වැඩිහිටි කාන්තාවන්ට සහය දෙන්න',
        'අමාවක දිනවල විශාල මූල්‍ය බැඳීම්වලට එළැඹීමෙන් වළකින්න',
        'රිදී භාණ්ඩ, කරදිය බෙල්ලන් හෝ චන්ද්‍රයා හා සම්බන්ධ දෑ නිවසේ තබා ගන්න',
      ],
    },
  },

  Mars: {
    details: {
      en: [
        'Property, real estate, and land investments are strongly favored',
        'Income through technical fields, engineering, or manufacturing',
        'Brothers or male siblings may create valuable business opportunities',
        'Calculated risk-taking in business ventures is rewarded',
        'Channel competitive energy into profitable business strategies',
      ],
      si: [
        'දේපළ, නිශ්චල දේපළ හා ඉඩම් ආයෝජන බෙහෙවින් හිතකරය',
        'තාක්ෂණික ක්ෂේත්‍ර, ඉංජිනේරු විද්‍යාව හෝ නිෂ්පාදනය හරහා ආදායම',
        'සහෝදරයන් වටිනා ව්‍යාපාරික අවස්ථා නිර්මාණය කර දිය හැක',
        'ව්‍යාපාරවලදී ගණන් බලා ගන්නා අවදානම් ප්‍රතිඵල ගෙන දෙයි',
        'තරඟකාරී ශක්තිය ලාභදායී ව්‍යාපාරික උපාය මාර්ග වෙත යොමු කරන්න',
      ],
    },
    remedies: {
      en: [
        'Donate red lentils and items to the poor on Tuesdays',
        'Maintain harmonious relations with siblings for mutual benefit',
        'Apply courage to business decisions but plan before acting',
        'Invest a portion of income in property and real estate',
      ],
      si: [
        'අඟහරුවාදා දිනවල දුප්පතුන්ට රතු පරිප්පු හා රතු පැහැති දෑ දන් දෙන්න',
        'දෙපාර්ශ්වයේම යහපත සඳහා සහෝදරයන් සමඟ සුහද සම්බන්ධතා පවත්වා ගන්න',
        'ව්‍යාපාරික තීරණවලදී ධෛර්යය යොදන්න, නමුත් ක්‍රියා කිරීමට පෙර සැලසුම් කරන්න',
        'ආදායමෙන් කොටසක් දේපළ හා ඉඩම්වල ආයෝජනය කරන්න',
      ],
    },
  },

  Mercury: {
    details: {
      en: [
        'Business, trade, and commerce bring significant profits',
        'Multiple simultaneous income streams are achievable and sustainable',
        'Communication skills, writing, and advisory work are monetized well',
        'Trading in stocks, commodities, or digital assets can work with knowledge',
        'Short-term investments in fast-moving sectors yield good returns',
      ],
      si: [
        'ව්‍යාපාර, වෙළඳාම හා වාණිජ කටයුතු සැලකිය යුතු ලාභ ගෙන දෙයි',
        'එකවර ආදායම් මාර්ග කිහිපයක් පවත්වා ගැනීම කළ හැකි අතර එය තිරසාරය',
        'සන්නිවේදන කුසලතා, ලේඛන කලාව හා උපදේශන සේවා හොඳ ආදායමක් ගෙන දෙයි',
        'ප්‍රමාණවත් දැනුමක් ඇත්නම් කොටස්, බඩු භාණ්ඩ හෝ ඩිජිටල් වත්කම් වෙළඳාම සාර්ථක වේ',
        'වේගයෙන් වෙනස් වන අංශවල කෙටි කාලීන ආයෝජන හොඳ ප්‍රතිලාභ ගෙන දෙයි',
      ],
    },
    remedies: {
      en: [
        'Donate green moong dal and green items on Wednesdays',
        'Maintain meticulous and accurate financial records always',
        'Continuously acquire new skills relevant to your income source',
        'Avoid lending money to friends or family without formal agreements',
      ],
      si: [
        'බදාදා දිනවල මුං ඇට හා කොළ පැහැති දෑ දන් දෙන්න',
        'මූල්‍ය වාර්තා සැමවිටම නිවැරදිව හා විස්තරාත්මකව පවත්වා ගන්න',
        'ඔබේ ආදායම් මාර්ගයට අදාළ නව කුසලතා නිරන්තරයෙන් ලබා ගන්න',
        'ලිඛිත ගිවිසුමකින් තොරව මිතුරන්ට හෝ නෑදෑයන්ට මුදල් ණයට දීමෙන් වළකින්න',
      ],
    },
  },

  Jupiter: {
    details: {
      en: [
        'Overall wealth expansion and abundance are the hallmarks of this period',
        'Income through teaching, consulting, legal advisory, or finance',
        'Children or younger relatives may bring unexpected financial fortune',
        'Legal disputes if any tend to resolve favorably and profitably',
        'Religious, charitable, or humanitarian work generates surprising abundance',
      ],
      si: [
        'සමස්ත ධන වර්ධනය හා සමෘද්ධිය මෙම කාලයේ ප්‍රධාන ලක්ෂණයයි',
        'ඉගැන්වීම, උපදේශනය, නීති උපදේශනය හෝ මූල්‍ය සේවා හරහා ආදායම',
        'දරුවන් හෝ බාල නෑදෑයන් අනපේක්ෂිත ධන වාසනාවක් ගෙන ආ හැක',
        'නීතිමය ආරවුල් ඇත්නම් ඒවා ඔබට හිතකර ලෙස විසඳී ලාභයක් ගෙන දෙයි',
        'ආගමික, පුණ්‍ය හෝ මානුෂීය කටයුතු පුදුම සහගත සමෘද්ධියක් ගෙන දෙයි',
      ],
    },
    remedies: {
      en: [
        'Donate yellow turmeric, yellow items, and books on Thursdays',
        'Support educational institutions, scholarships, and learning causes',
        'Express genuine respect and gratitude toward teachers and gurus',
        'Consider investing in yellow sapphire to accelerate wealth potential',
      ],
      si: [
        'බ්‍රහස්පතින්දා දිනවල කහ, කහ පැහැති දෑ හා පොත් දන් දෙන්න',
        'අධ්‍යාපන ආයතන, ශිෂ්‍යත්ව හා ඉගෙනීමේ කටයුතුවලට සහය දෙන්න',
        'ගුරුවරුන්ට හා ආචාර්යවරුන්ට අවංක ගෞරවය හා කෘතඥතාව දක්වන්න',
        'ධන හැකියාව වේගවත් කර ගැනීමට පුෂ්පරාග පැළඳීම ගැන සලකා බලන්න',
      ],
    },
  },

  Venus: {
    details: {
      en: [
        'Luxury goods, comfort, and material abundance naturally increase',
        'Arts, entertainment, fashion, beauty, and creative businesses are profitable',
        'Joint income from partnerships and collaborative ventures is favorable',
        'Spouse or romantic partner may bring significant financial resources',
        'Vehicle, jewelry, and property acquisitions are auspicious and favorable',
      ],
      si: [
        'සුඛෝපභෝගී භාණ්ඩ, පහසුව හා භෞතික සම්පත් ස්වභාවිකවම වැඩි වේ',
        'කලා, විනෝදාස්වාදය, විලාසිතා, රූපලාවණ්‍ය හා නිර්මාණශීලී ව්‍යාපාර ලාභදායීය',
        'හවුල්කාරිත්ව හා එක්ව කරන ව්‍යාපාරවලින් ලැබෙන ඒකාබද්ධ ආදායම හිතකරය',
        'කලත්‍රයා හෝ පෙම්වතා/පෙම්වතිය සැලකිය යුතු ධන සම්පතක් ගෙන ආ හැක',
        'වාහන, ස්වර්ණාභරණ හා දේපළ මිලදී ගැනීම සුබදායක හා හිතකරය',
      ],
    },
    remedies: {
      en: [
        'Donate white items — rice, sugar, white cloth — on Fridays',
        'Maintain harmony and beauty in your home and relationships',
        'Invest in arts, creative businesses, and luxury sectors',
        'Keep the home beautiful and aesthetically pleasing for Lakshmi',
      ],
      si: [
        'සිකුරාදා දිනවල සුදු පැහැති දෑ — සහල්, සීනි හා සුදු රෙදි — දන් දෙන්න',
        'ඔබේ නිවසේ හා සම්බන්ධතාවල සමගිය හා සුන්දරත්වය පවත්වා ගන්න',
        'කලා, නිර්මාණශීලී ව්‍යාපාර හා සුඛෝපභෝගී අංශවල ආයෝජනය කරන්න',
        'ලක්ෂ්මී දේවියගේ ආශිර්වාදය පිණිස නිවස සුන්දරව හා පිළිවෙළට තබා ගන්න',
      ],
    },
  },

  Saturn: {
    details: {
      en: [
        'Slow but remarkably steady and durable income growth',
        'Hard work, persistence, and consistent effort are the primary wealth keys',
        'Income from service industries, labor, real estate, or long-term projects',
        'Real estate gains materialize after initial delays and patience',
        'Inheritance, delayed payments, or old dues may finally arrive',
      ],
      si: [
        'මන්දගාමී වුවත් ඉතා ස්ථාවර හා කල් පවතින ආදායම් වර්ධනයක්',
        'වෙහෙස මහන්සිය, නොපසුබට උත්සාහය හා නොකඩවා දරන වෑයම ධනයට ප්‍රධාන යතුරයි',
        'සේවා කර්මාන්ත, ශ්‍රමය, දේපළ හෝ දිගු කාලීන ව්‍යාපෘතිවලින් ආදායම',
        'ආරම්භක ප්‍රමාදයන් හා ඉවසීමෙන් පසු දේපළවලින් ලාභ ලැබේ',
        'උරුමයක්, ප්‍රමාද වූ ගෙවීම් හෝ පැරණි ණය මුදල් අවසානයේ ලැබිය හැක',
      ],
    },
    remedies: {
      en: [
        'Donate black sesame, iron, or black cloth to the poor on Saturdays',
        'Serve poor, disabled, and underprivileged communities generously',
        'Maintain patience with financial timelines; avoid shortcuts',
        'Build disciplined savings habits and systematic investment plans',
      ],
      si: [
        'සෙනසුරාදා දිනවල දුප්පතුන්ට කළු තල, යකඩ හෝ කළු රෙදි දන් දෙන්න',
        'දුප්පත්, ආබාධිත හා අඩු පහසුකම් ලත් ප්‍රජාවන්ට නොමසුරුව සේවය කරන්න',
        'මූල්‍ය කාලසටහන් සම්බන්ධයෙන් ඉවසීමෙන් සිටින්න; කෙටි මං සොයා නොයන්න',
        'විනයගරුක ඉතිරිකිරීමේ පුරුදු හා ක්‍රමවත් ආයෝජන සැලසුම් ගොඩනඟා ගන්න',
      ],
    },
  },

  Rahu: {
    details: {
      en: [
        'Foreign sources of income, exports, or international business are promising',
        'Technology, research, unconventional sectors, and innovation are profitable',
        'Sudden unexpected gains are possible but equally sudden losses can occur',
        'Avoid all speculative investments, gambling, or get-rich-quick schemes',
        'Income from research, analytics, or cutting-edge technology is favored',
      ],
      si: [
        'විදේශ ආදායම් මාර්ග, අපනයන හෝ ජාත්‍යන්තර ව්‍යාපාර පොරොන්දුදායකය',
        'තාක්ෂණය, පර්යේෂණ, සම්ප්‍රදායික නොවන අංශ හා නවෝත්පාදන ලාභදායීය',
        'හදිසි අනපේක්ෂිත ලාභ ලැබිය හැකි නමුත් එලෙසම හදිසි පාඩු ද සිදු විය හැක',
        'සියලු සමපේක්ෂණ ආයෝජන, සූදුව හා ඉක්මනින් පොහොසත් වීමේ ක්‍රම වළක්වා ගන්න',
        'පර්යේෂණ, විශ්ලේෂණ හෝ නවීන තාක්ෂණයෙන් ලැබෙන ආදායම හිතකරය',
      ],
    },
    remedies: {
      en: [
        'Donate at charitable institutions on Saturdays at twilight',
        'Maintain complete transparency in all financial dealings and accounts',
        'Strictly avoid speculation, gambling, and leveraged investments',
        'Diversify investments across sectors for risk management',
      ],
      si: [
        'සෙනසුරාදා දිනවල සන්ධ්‍යා කාලයේ පුණ්‍ය ආයතනවලට දන් දෙන්න',
        'සියලු මූල්‍ය ගනුදෙනු හා ගිණුම්වල පූර්ණ විනිවිදභාවයක් පවත්වා ගන්න',
        'සමපේක්ෂණය, සූදුව හා ණයට ගත් මුදලින් කරන ආයෝජන දැඩිව වළක්වන්න',
        'අවදානම කළමනාකරණය සඳහා ආයෝජන අංශ කිහිපයක් අතර බෙදා හරින්න',
      ],
    },
  },

  Ketu: {
    details: {
      en: [
        'Material wealth may feel emotionally unsatisfying despite adequate income',
        'Spiritual pursuits, healing, or research may become the primary source',
        'Unexpected material losses often carry important karmic lessons',
        'Past-life financial karma is clearing — accept with equanimity',
        'Income from occult, spiritual, alternative medicine, or investigation is possible',
      ],
      si: [
        'ආදායම ප්‍රමාණවත් වුවත් භෞතික ධනයෙන් සිතට තෘප්තියක් නොදැනිය හැක',
        'අධ්‍යාත්මික කටයුතු, සුවකිරීම හෝ පර්යේෂණ ප්‍රධාන ආදායම් මාර්ගය විය හැක',
        'අනපේක්ෂිත භෞතික පාඩු බොහෝ විට වැදගත් කර්ම පාඩම් රැගෙන එයි',
        'පෙර භවවල මූල්‍ය කර්මය ගෙවී යමින් පවතී — එය උපේක්ෂාවෙන් පිළිගන්න',
        'ගුප්ත විද්‍යාව, අධ්‍යාත්මික සේවය, විකල්ප වෛද්‍ය හෝ විමර්ශනවලින් ආදායමක් ලැබිය හැක',
      ],
    },
    remedies: {
      en: [
        'Donate blankets, multicolored items, and sesame generously',
        'Cultivate a deeply spiritual and non-attachment approach to wealth',
        'Avoid becoming financially attached to outcomes; surrender to karma',
        'Practice daily gratitude for what you have rather than what you want',
      ],
      si: [
        'පොරවන, විවිධ වර්ණ දෑ හා තල නොමසුරුව දන් දෙන්න',
        'ධනය කෙරෙහි ගැඹුරු අධ්‍යාත්මික හා නොඇලෙන ආකල්පයක් වර්ධනය කර ගන්න',
        'ප්‍රතිඵලවලට මූල්‍යමය වශයෙන් ඇලුම් නොකරන්න; කර්මයට භාර වන්න',
        'ඔබට අවශ්‍ය දේ ගැන නොව ඔබට ඇති දේ ගැන දිනපතා කෘතඥ වන්න',
      ],
    },
  },
};
