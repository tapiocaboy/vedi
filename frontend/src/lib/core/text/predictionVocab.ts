/**
 * Bilingual vocabulary for the dasha prediction engine.
 *
 * Holds the enumerated terms that get spliced into generated sentences
 * (body parts, diseases, professions, keywords…), the house themes, and the
 * sentence frames themselves. The `en` and `si` arrays of every `BiList` are
 * index-aligned so the engine can pick a language and splice identically.
 *
 * Sinhala here follows the vocabulary Sri Lankan almanacs (ලිත්) use, so the
 * astrological terms read as they would to someone used to a printed panchanga.
 */

import type { Bi, BiList } from '../i18n';

// ─── Planet significations ─────────────────────────────────────────────────

export interface SigText {
  keywords: BiList;
  bodyParts: BiList;
  diseases: BiList;
  professions: BiList;
  relationships: BiList;
  gemstone: Bi;
  mantra: Bi;
  deity: Bi;
}

export const SIG_TEXT: Record<string, SigText> = {
  Sun: {
    keywords: {
      en: ['authority', 'father', 'government', 'soul', 'vitality', 'ego', 'leadership'],
      si: ['අධිකාරිය', 'පියා', 'රජය', 'ආත්මය', 'ජීවශක්තිය', 'අහංකාරය', 'නායකත්වය'],
    },
    bodyParts: {
      en: ['heart', 'spine', 'right eye', 'bones'],
      si: ['හෘදය', 'කොඳු ඇට පෙළ', 'දකුණු ඇස', 'අස්ථි'],
    },
    diseases: {
      en: ['heart problems', 'eye issues', 'fever', 'blood pressure', 'bone disorders'],
      si: ['හෘද රෝග', 'අක්ෂි ආබාධ', 'උණ', 'රුධිර පීඩනය', 'අස්ථි ආබාධ'],
    },
    professions: {
      en: ['government', 'politics', 'medicine', 'administration', 'leadership roles'],
      si: ['රාජ්‍ය සේවය', 'දේශපාලනය', 'වෛද්‍ය විද්‍යාව', 'පරිපාලනය', 'නායකත්ව තනතුරු'],
    },
    relationships: {
      en: ['father', 'authority figures', 'employers'],
      si: ['පියා', 'ඉහළ නිලධාරීන්', 'සේවා යෝජකයන්'],
    },
    gemstone: { en: 'Ruby', si: 'මාණික්‍යය' },
    mantra: { en: 'Om Suryaya Namah', si: 'ඕම් සූර්යාය නමඃ' },
    deity: { en: 'Surya', si: 'සූර්ය' },
  },

  Moon: {
    keywords: {
      en: ['mind', 'mother', 'emotions', 'nurturing', 'public', 'travel', 'liquids'],
      si: ['මනස', 'මව', 'හැඟීම්', 'පෝෂණය', 'මහජනතාව', 'ගමන්', 'ද්‍රව'],
    },
    bodyParts: {
      en: ['mind', 'breasts', 'left eye', 'blood', 'stomach'],
      si: ['මනස', 'පියයුරු', 'වම් ඇස', 'ලේ', 'ආමාශය'],
    },
    diseases: {
      en: ['mental stress', 'depression', 'water retention', 'cold', 'menstrual issues'],
      si: ['මානසික ආතතිය', 'මානසික අවපීඩනය', 'ශරීරයේ ජලය රැඳීම', 'සෙම්ප්‍රතිශ්‍යාව', 'ඔසප් ආබාධ'],
    },
    professions: {
      en: ['nursing', 'hospitality', 'shipping', 'dairy', 'public relations'],
      si: ['හෙද සේවය', 'ආගන්තුක සත්කාරය', 'නෞකා ගමනාගමනය', 'කිරි කර්මාන්තය', 'මහජන සම්බන්ධතා'],
    },
    relationships: {
      en: ['mother', 'wife', 'public', 'women in general'],
      si: ['මව', 'බිරිඳ', 'මහජනතාව', 'පොදුවේ කාන්තාවන්'],
    },
    gemstone: { en: 'Pearl', si: 'මුතු' },
    mantra: { en: 'Om Chandraya Namah', si: 'ඕම් චන්ද්‍රාය නමඃ' },
    deity: { en: 'Chandra', si: 'චන්ද්‍ර' },
  },

  Mars: {
    keywords: {
      en: ['energy', 'courage', 'brothers', 'property', 'surgery', 'accidents', 'competition'],
      si: ['ශක්තිය', 'ධෛර්යය', 'සහෝදරයන්', 'දේපළ', 'සැත්කම්', 'අනතුරු', 'තරඟය'],
    },
    bodyParts: {
      en: ['muscles', 'blood', 'head', 'marrow', 'energy'],
      si: ['මාංශ පේශි', 'ලේ', 'හිස', 'ඇට මිදුළු', 'ශක්තිය'],
    },
    diseases: {
      en: ['injuries', 'accidents', 'surgery', 'blood disorders', 'inflammation', 'fever'],
      si: ['තුවාල', 'අනතුරු', 'සැත්කම්', 'රුධිර ආබාධ', 'දැවිල්ල', 'උණ'],
    },
    professions: {
      en: ['military', 'police', 'engineering', 'surgery', 'sports', 'real estate'],
      si: ['හමුදා සේවය', 'පොලිස් සේවය', 'ඉංජිනේරු විද්‍යාව', 'ශල්‍ය වෛද්‍ය', 'ක්‍රීඩා', 'දේපළ වෙළඳාම'],
    },
    relationships: {
      en: ['siblings', 'competitors', 'enemies'],
      si: ['සහෝදර සහෝදරියන්', 'තරඟකරුවන්', 'සතුරන්'],
    },
    gemstone: { en: 'Red Coral', si: 'රතු පබළු' },
    mantra: { en: 'Om Mangalaya Namah', si: 'ඕම් මංගලාය නමඃ' },
    deity: { en: 'Kartikeya', si: 'කාර්තිකේය' },
  },

  Mercury: {
    keywords: {
      en: ['intelligence', 'communication', 'business', 'education', 'writing', 'analysis'],
      si: ['බුද්ධිය', 'සන්නිවේදනය', 'ව්‍යාපාර', 'අධ්‍යාපනය', 'ලේඛන කලාව', 'විශ්ලේෂණය'],
    },
    bodyParts: {
      en: ['nervous system', 'skin', 'lungs', 'speech', 'hands'],
      si: ['ස්නායු පද්ධතිය', 'සම', 'පෙනහළු', 'කථනය', 'අත්'],
    },
    diseases: {
      en: ['nervous disorders', 'skin problems', 'speech issues', 'respiratory problems'],
      si: ['ස්නායු ආබාධ', 'සමේ රෝග', 'කථන ආබාධ', 'ශ්වසන ආබාධ'],
    },
    professions: {
      en: ['writing', 'teaching', 'accounting', 'trading', 'IT', 'communication'],
      si: ['ලේඛන කලාව', 'ඉගැන්වීම', 'ගිණුම්කරණය', 'වෙළඳාම', 'තොරතුරු තාක්ෂණය', 'සන්නිවේදනය'],
    },
    relationships: {
      en: ['friends', 'maternal uncle', 'young people'],
      si: ['මිතුරන්', 'මාමා', 'තරුණ පිරිස'],
    },
    gemstone: { en: 'Emerald', si: 'මරකත' },
    mantra: { en: 'Om Budhaya Namah', si: 'ඕම් බුධාය නමඃ' },
    deity: { en: 'Vishnu', si: 'විෂ්ණු' },
  },

  Jupiter: {
    keywords: {
      en: ['wisdom', 'expansion', 'luck', 'children', 'spirituality', 'teaching', 'wealth'],
      si: ['ඥානය', 'ව්‍යාප්තිය', 'වාසනාව', 'දරුවන්', 'අධ්‍යාත්මිකත්වය', 'ඉගැන්වීම', 'ධනය'],
    },
    bodyParts: {
      en: ['liver', 'fat', 'hips', 'thighs', 'arterial system'],
      si: ['අක්මාව', 'මේදය', 'උකුල්', 'කලවා', 'ධමනි පද්ධතිය'],
    },
    diseases: {
      en: ['liver problems', 'obesity', 'diabetes', 'tumors', 'ear problems'],
      si: ['අක්මා රෝග', 'තරබාරුකම', 'දියවැඩියාව', 'ගෙඩි', 'කන් ආබාධ'],
    },
    professions: {
      en: ['teaching', 'law', 'religion', 'banking', 'advisory', 'philosophy'],
      si: ['ඉගැන්වීම', 'නීතිය', 'ආගමික සේවය', 'බැංකුකරණය', 'උපදේශනය', 'දර්ශනය'],
    },
    relationships: {
      en: ['husband', 'guru', 'children', 'elders'],
      si: ['සැමියා', 'ගුරුවරයා', 'දරුවන්', 'වැඩිහිටියන්'],
    },
    gemstone: { en: 'Yellow Sapphire', si: 'පුෂ්පරාග' },
    mantra: { en: 'Om Gurave Namah', si: 'ඕම් ගුරවේ නමඃ' },
    deity: { en: 'Brihaspati', si: 'බෘහස්පති' },
  },

  Venus: {
    keywords: {
      en: ['love', 'beauty', 'luxury', 'arts', 'marriage', 'pleasures', 'vehicles'],
      si: ['ආදරය', 'සුන්දරත්වය', 'සුඛෝපභෝගය', 'කලා', 'විවාහය', 'සැප සම්පත්', 'වාහන'],
    },
    bodyParts: {
      en: ['reproductive system', 'face', 'eyes', 'throat', 'kidneys'],
      si: ['ප්‍රජනන පද්ධතිය', 'මුහුණ', 'ඇස්', 'උගුර', 'වකුගඩු'],
    },
    diseases: {
      en: ['reproductive issues', 'kidney problems', 'diabetes', 'skin conditions'],
      si: ['ප්‍රජනන ආබාධ', 'වකුගඩු රෝග', 'දියවැඩියාව', 'සමේ රෝග'],
    },
    professions: {
      en: ['arts', 'entertainment', 'fashion', 'beauty', 'hospitality', 'luxury goods'],
      si: ['කලා', 'විනෝදාස්වාදය', 'විලාසිතා', 'රූපලාවණ්‍ය', 'ආගන්තුක සත්කාරය', 'සුඛෝපභෝගී භාණ්ඩ'],
    },
    relationships: {
      en: ['wife', 'lover', 'women', 'artists'],
      si: ['බිරිඳ', 'පෙම්වතා හෝ පෙම්වතිය', 'කාන්තාවන්', 'කලාකරුවන්'],
    },
    gemstone: { en: 'Diamond', si: 'දියමන්ති' },
    mantra: { en: 'Om Shukraya Namah', si: 'ඕම් ශුක්‍රාය නමඃ' },
    deity: { en: 'Lakshmi', si: 'ලක්ෂ්මී' },
  },

  Saturn: {
    keywords: {
      en: ['karma', 'discipline', 'delay', 'longevity', 'labor', 'service', 'obstacles'],
      si: ['කර්මය', 'විනය', 'ප්‍රමාදය', 'ආයුෂ', 'ශ්‍රමය', 'සේවය', 'බාධක'],
    },
    bodyParts: {
      en: ['bones', 'teeth', 'knees', 'joints', 'nerves'],
      si: ['අස්ථි', 'දත්', 'දණහිස්', 'සන්ධි', 'ස්නායු'],
    },
    diseases: {
      en: ['chronic diseases', 'joint pain', 'arthritis', 'depression', 'paralysis'],
      si: ['නිදන්ගත රෝග', 'සන්ධි වේදනාව', 'ආතරයිටිස්', 'මානසික අවපීඩනය', 'අංශභාගය'],
    },
    professions: {
      en: ['labor', 'mining', 'agriculture', 'law', 'real estate', 'oil/gas'],
      si: ['ශ්‍රම කර්මාන්ත', 'පතල් කැණීම', 'කෘෂිකර්මය', 'නීතිය', 'දේපළ වෙළඳාම', 'තෙල් හා ගෑස්'],
    },
    relationships: {
      en: ['servants', 'elderly', 'common people', 'laborers'],
      si: ['සේවකයන්', 'වැඩිහිටියන්', 'සාමාන්‍ය ජනතාව', 'කම්කරුවන්'],
    },
    gemstone: { en: 'Blue Sapphire', si: 'නීලමණි' },
    mantra: { en: 'Om Shanaishcharaya Namah', si: 'ඕම් ශනෛශ්චරාය නමඃ' },
    deity: { en: 'Shani', si: 'ශනි' },
  },

  Rahu: {
    keywords: {
      en: ['illusion', 'foreign', 'technology', 'unconventional', 'obsession', 'sudden events'],
      si: ['මායාව', 'විදේශීය කරුණු', 'තාක්ෂණය', 'සම්ප්‍රදායික නොවන දෑ', 'ඇබ්බැහිය', 'හදිසි සිදුවීම්'],
    },
    bodyParts: {
      en: ['skin', 'breathing', 'feet', 'nervous system'],
      si: ['සම', 'ශ්වසනය', 'පාද', 'ස්නායු පද්ධතිය'],
    },
    diseases: {
      en: ['mysterious diseases', 'poisoning', 'phobias', 'mental disorders', 'infections'],
      si: ['හඳුනාගත නොහැකි රෝග', 'විෂවීම්', 'භීතිකා', 'මානසික ආබාධ', 'ආසාදන'],
    },
    professions: {
      en: ['technology', 'foreign trade', 'research', 'politics', 'media', 'aviation'],
      si: ['තාක්ෂණය', 'විදේශ වෙළඳාම', 'පර්යේෂණ', 'දේශපාලනය', 'මාධ්‍ය', 'ගුවන් සේවා'],
    },
    relationships: {
      en: ['foreigners', 'outcasts', 'in-laws'],
      si: ['විදේශිකයන්', 'සමාජයෙන් කොන් වූවන්', 'විවාහයෙන් ලැබුණු නෑදෑයන්'],
    },
    gemstone: { en: 'Hessonite (Gomed)', si: 'ගෝමේද' },
    mantra: { en: 'Om Rahave Namah', si: 'ඕම් රාහවේ නමඃ' },
    deity: { en: 'Durga', si: 'දුර්ගා' },
  },

  Ketu: {
    keywords: {
      en: ['liberation', 'spirituality', 'past karma', 'detachment', 'occult', 'surgery'],
      si: ['මිදීම', 'අධ්‍යාත්මිකත්වය', 'පෙර කර්මය', 'වෙන්වීම', 'ගුප්ත විද්‍යාව', 'සැත්කම්'],
    },
    bodyParts: {
      en: ['feet', 'spine', 'skin'],
      si: ['පාද', 'කොඳු ඇට පෙළ', 'සම'],
    },
    diseases: {
      en: ['mysterious ailments', 'viral infections', 'accidents', 'wounds', 'surgeries'],
      si: ['හඳුනාගත නොහැකි ආබාධ', 'වෛරස ආසාදන', 'අනතුරු', 'තුවාල', 'සැත්කම්'],
    },
    professions: {
      en: ['spirituality', 'research', 'occult', 'healing', 'investigation'],
      si: ['අධ්‍යාත්මික සේවය', 'පර්යේෂණ', 'ගුප්ත විද්‍යාව', 'සුවකිරීම', 'විමර්ශන'],
    },
    relationships: {
      en: ['paternal grandfather', 'spiritual guides'],
      si: ['පියාගේ පියා', 'අධ්‍යාත්මික මඟපෙන්වන්නන්'],
    },
    gemstone: { en: "Cat's Eye (Lehsunia)", si: 'වෛඩූර්ය' },
    mantra: { en: 'Om Ketave Namah', si: 'ඕම් කේතවේ නමඃ' },
    deity: { en: 'Ganesha', si: 'ගණේෂ' },
  },
};

// ─── House themes ──────────────────────────────────────────────────────────

export interface HouseText { theme: Bi; emphasis: Bi }

export const HOUSE_TEXT: Record<number, HouseText> = {
  1: {
    theme:    { en: 'self, vitality, identity',                       si: 'ආත්මය, ජීවශක්තිය හා අනන්‍යතාව' },
    emphasis: { en: 'personal action and body',                       si: 'පෞද්ගලික ක්‍රියාව හා සිරුර' },
  },
  2: {
    theme:    { en: 'wealth, family, speech',                         si: 'ධනය, පවුල හා වචනය' },
    emphasis: { en: 'savings, food, family values',                   si: 'ඉතිරිකිරීම්, ආහාර හා පවුලේ සාරධර්ම' },
  },
  3: {
    theme:    { en: 'courage, siblings, communication',               si: 'ධෛර්යය, සහෝදරයන් හා සන්නිවේදනය' },
    emphasis: { en: 'effort, writing, short trips',                   si: 'උත්සාහය, ලේඛන හා කෙටි ගමන්' },
  },
  4: {
    theme:    { en: 'home, mother, inner peace',                      si: 'නිවස, මව හා සිතේ සාමය' },
    emphasis: { en: 'residence, comfort, emotions',                   si: 'වාසස්ථානය, පහසුව හා හැඟීම්' },
  },
  5: {
    theme:    { en: 'creativity, children, romance, intelligence',    si: 'නිර්මාණශීලීත්වය, දරුවන්, ප්‍රේමය හා බුද්ධිය' },
    emphasis: { en: 'creative output and recognition',                si: 'නිර්මාණ හා ඒ සඳහා ලැබෙන පිළිගැනීම' },
  },
  6: {
    theme:    { en: 'service, competition, health, debts',            si: 'සේවය, තරඟය, සෞඛ්‍යය හා ණය' },
    emphasis: { en: 'hard work, opponents, daily routines',           si: 'වෙහෙස මහන්සිය, විරුද්ධවාදීන් හා දෛනික චර්යාව' },
  },
  7: {
    theme:    { en: 'partnerships, marriage, deals',                  si: 'හවුල්කාරිත්ව, විවාහය හා ගිවිසුම්' },
    emphasis: { en: 'one-on-one relationships and contracts',         si: 'පුද්ගලික සම්බන්ධතා හා ගිවිසුම්' },
  },
  8: {
    theme:    { en: 'transformation, hidden matters, longevity',      si: 'පරිවර්තනය, සැඟවුණු කරුණු හා ආයුෂ' },
    emphasis: { en: 'research, inheritance, deep change',             si: 'පර්යේෂණ, උරුමය හා ගැඹුරු වෙනස්කම්' },
  },
  9: {
    theme:    { en: 'dharma, fortune, father, higher learning',       si: 'ධර්මය, වාසනාව, පියා හා උසස් අධ්‍යාපනය' },
    emphasis: { en: 'philosophy, travel, mentors',                    si: 'දර්ශනය, ගමන් හා මඟපෙන්වන්නන්' },
  },
  10: {
    theme:    { en: 'career, status, public action',                  si: 'වෘත්තිය, තත්ත්වය හා ප්‍රසිද්ධ ක්‍රියාව' },
    emphasis: { en: 'profession and public visibility',               si: 'වෘත්තිය හා ප්‍රසිද්ධියේ පෙනී සිටීම' },
  },
  11: {
    theme:    { en: 'gains, networks, aspirations',                   si: 'ලාභ, සම්බන්ධතා ජාල හා අභිලාෂ' },
    emphasis: { en: 'income, friendships, fulfilled goals',           si: 'ආදායම, මිත්‍රත්වය හා ඉටු වන ඉලක්ක' },
  },
  12: {
    theme:    { en: 'expenses, foreign lands, retreat, spirituality', si: 'වියදම්, විදේශ ගමන්, විවේකය හා අධ්‍යාත්මිකත්වය' },
    emphasis: { en: 'letting go, foreign matters, inner work',        si: 'අත්හැරීම, විදේශීය කරුණු හා අභ්‍යන්තර වැඩ' },
  },
};

export const QUALITY_NOTE_TEXT: Record<string, Bi> = {
  kendra: {
    en: 'Kendra (angular) — naturally strong, direct expression.',
    si: 'කේන්ද්‍ර ස්ථානයකි — ස්වභාවයෙන්ම බලවත් වන අතර ඍජුව ප්‍රතිඵල දෙයි.',
  },
  trikona: {
    en: 'Trikona (trine) — auspicious, fortune-conferring.',
    si: 'ත්‍රිකෝණ ස්ථානයකි — සුබදායක වන අතර වාසනාව ගෙන දෙයි.',
  },
  dusthana: {
    en: 'Dusthana — challenging house; rewards come through difficulty.',
    si: 'දුස්ථාන භාවයකි — අභියෝගාත්මක වන අතර ප්‍රතිඵල ලැබෙන්නේ දුෂ්කරතා හරහාය.',
  },
  upachaya: {
    en: 'Upachaya — improves over time with effort.',
    si: 'උපචය භාවයකි — උත්සාහය සමඟ කලින් කලට වැඩිදියුණු වේ.',
  },
  other: { en: '', si: '' },
};
