/** Astrology label helpers — planets, rashis, dignity, trends, etc. */

import { translations, type Lang, type TranslationKey } from './translations';

const LANG_KEY = 'trytellme_lang';
const STORED_LANGS: Lang[] = ['si', 'ta', 'zh', 'hi', 'ja', 'ko', 'ar', 'ml'];

export function getStoredLang(): Lang {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    return saved && (STORED_LANGS as string[]).includes(saved) ? (saved as Lang) : 'en';
  } catch {
    return 'en';
  }
}

export function tKey(key: TranslationKey, lang: Lang): string {
  return translations[lang][key] ?? translations.en[key];
}

const PLANET_KEYS: Record<string, TranslationKey> = {
  SUN: 'planet.sun',
  MOON: 'planet.moon',
  MARS: 'planet.mars',
  MERCURY: 'planet.mercury',
  JUPITER: 'planet.jupiter',
  VENUS: 'planet.venus',
  SATURN: 'planet.saturn',
  RAHU: 'planet.rahu',
  KETU: 'planet.ketu',
  ASCENDANT: 'planet.ascendant',
};

export function labelPlanet(code: string, lang: Lang): string {
  const key = PLANET_KEYS[code.toUpperCase()];
  if (key) return tKey(key, lang);
  const title = code.charAt(0).toUpperCase() + code.slice(1).toLowerCase();
  const titleKey = PLANET_KEYS[title];
  return titleKey ? tKey(titleKey, lang) : code;
}

/** Compact planet labels for tight chart cells (2–4 characters). */
const PLANET_SHORT_EN: Record<string, string> = {
  SUN: 'Su', MOON: 'Mo', MARS: 'Ma', MERCURY: 'Me', JUPITER: 'Ju',
  VENUS: 'Ve', SATURN: 'Sa', RAHU: 'Ra', KETU: 'Ke', ASCENDANT: 'As',
};
const PLANET_SHORT_SI: Record<string, string> = {
  SUN: 'රවි', MOON: 'සඳ', MARS: 'කුජ', MERCURY: 'බුධ', JUPITER: 'ගුරු',
  VENUS: 'සිකු', SATURN: 'ශනි', RAHU: 'රාහු', KETU: 'කේතු', ASCENDANT: 'ලග්',
};
const PLANET_SHORT_TA: Record<string, string> = {
  SUN: 'சூ', MOON: 'சந்', MARS: 'செ', MERCURY: 'பு', JUPITER: 'கு',
  VENUS: 'சுக்', SATURN: 'சனி', RAHU: 'ரா', KETU: 'கே', ASCENDANT: 'லக்',
};
const PLANET_SHORT_ZH: Record<string, string> = {
  SUN: '日', MOON: '月', MARS: '火', MERCURY: '水', JUPITER: '木',
  VENUS: '金', SATURN: '土', RAHU: '罗', KETU: '计', ASCENDANT: '升',
};
const PLANET_SHORT_HI: Record<string, string> = {
  SUN: 'सू', MOON: 'चं', MARS: 'मं', MERCURY: 'बु', JUPITER: 'गु',
  VENUS: 'शु', SATURN: 'श', RAHU: 'रा', KETU: 'के', ASCENDANT: 'ल',
};
const PLANET_SHORT_JA: Record<string, string> = {
  SUN: '太', MOON: '月', MARS: '火', MERCURY: '水', JUPITER: '木',
  VENUS: '金', SATURN: '土', RAHU: 'ラ', KETU: 'ケ', ASCENDANT: 'ア',
};
const PLANET_SHORT_KO: Record<string, string> = {
  SUN: '태', MOON: '달', MARS: '화', MERCURY: '수', JUPITER: '목',
  VENUS: '금', SATURN: '토', RAHU: '라', KETU: '케', ASCENDANT: '어',
};
const PLANET_SHORT_AR: Record<string, string> = {
  SUN: 'شم', MOON: 'قم', MARS: 'مر', MERCURY: 'عط', JUPITER: 'مش',
  VENUS: 'زه', SATURN: 'زح', RAHU: 'را', KETU: 'كي', ASCENDANT: 'طا',
};
const PLANET_SHORT_ML: Record<string, string> = {
  SUN: 'സൂ', MOON: 'ച', MARS: 'ചൊ', MERCURY: 'ബു', JUPITER: 'വ്യാ',
  VENUS: 'ശു', SATURN: 'ശ', RAHU: 'രാ', KETU: 'കേ', ASCENDANT: 'ല',
};

const PLANET_SHORT_TABLE: Partial<Record<Lang, Record<string, string>>> = {
  si: PLANET_SHORT_SI, ta: PLANET_SHORT_TA, zh: PLANET_SHORT_ZH, hi: PLANET_SHORT_HI,
  ja: PLANET_SHORT_JA, ko: PLANET_SHORT_KO, ar: PLANET_SHORT_AR, ml: PLANET_SHORT_ML,
};

export function labelPlanetShort(code: string, lang: Lang): string {
  const c = code.toUpperCase();
  const table = PLANET_SHORT_TABLE[lang] ?? PLANET_SHORT_EN;
  return table[c] ?? code.slice(0, 2);
}

/** Sanskrit rashi names (Mesha … Meena) */
export const RASHI_SANSKRIT_SI = [
  'මේෂ', 'වෘෂභ', 'මිථුන', 'කටක',
  'සිංහ', 'කන්‍යා', 'තුලා', 'වෘශ්චික',
  'ධනු', 'මකර', 'කුම්භ', 'මීන',
] as const;

export const RASHI_TA = [
  'மேஷம்', 'ரிஷபம்', 'மிதுனம்', 'கடகம்',
  'சிம்மம்', 'கன்னி', 'துலாம்', 'விருச்சிகம்',
  'தனுசு', 'மகரம்', 'கும்பம்', 'மீனம்',
] as const;

export const RASHI_ZH = [
  '白羊座', '金牛座', '双子座', '巨蟹座',
  '狮子座', '处女座', '天秤座', '天蝎座',
  '射手座', '摩羯座', '水瓶座', '双鱼座',
] as const;

export const RASHI_HI = [
  'मेष', 'वृषभ', 'मिथुन', 'कर्क',
  'सिंह', 'कन्या', 'तुला', 'वृश्चिक',
  'धनु', 'मकर', 'कुंभ', 'मीन',
] as const;

export const RASHI_JA = [
  '牡羊座', '牡牛座', '双子座', '蟹座',
  '獅子座', '乙女座', '天秤座', '蠍座',
  '射手座', '山羊座', '水瓶座', '魚座',
] as const;

export const RASHI_KO = [
  '양자리', '황소자리', '쌍둥이자리', '게자리',
  '사자자리', '처녀자리', '천칭자리', '전갈자리',
  '사수자리', '염소자리', '물병자리', '물고기자리',
] as const;

export const RASHI_AR = [
  'الحمل', 'الثور', 'الجوزاء', 'السرطان',
  'الأسد', 'العذراء', 'الميزان', 'العقرب',
  'القوس', 'الجدي', 'الدلو', 'الحوت',
] as const;

export const RASHI_ML = [
  'മേടം', 'ഇടവം', 'മിഥുനം', 'കർക്കടകം',
  'ചിങ്ങം', 'കന്നി', 'തുലാം', 'വൃശ്ചികം',
  'ധനു', 'മകരം', 'കുംഭം', 'മീനം',
] as const;

/** Western zodiac names */
export const RASHI_WESTERN_SI = [
  'ඔව්', 'වෘෂභ', 'මිථුන', 'කටක',
  'සිංහ', 'කන්‍යා', 'තුලා', 'වෘශ්චික',
  'ධනු', 'මකර', 'කුම්භ', 'මීන',
] as const;

const RASHI_BY_LANG: Partial<Record<Lang, readonly string[]>> = {
  si: RASHI_SANSKRIT_SI, ta: RASHI_TA, zh: RASHI_ZH, hi: RASHI_HI,
  ja: RASHI_JA, ko: RASHI_KO, ar: RASHI_AR, ml: RASHI_ML,
};

const RASHI_WESTERN_BY_LANG: Partial<Record<Lang, readonly string[]>> = {
  si: RASHI_WESTERN_SI, ta: RASHI_TA, zh: RASHI_ZH, hi: RASHI_HI,
  ja: RASHI_JA, ko: RASHI_KO, ar: RASHI_AR, ml: RASHI_ML,
};

export function labelRashi(index: number, lang: Lang, sanskritName: string): string {
  if (index >= 0 && index < 12) {
    const t = RASHI_BY_LANG[lang];
    if (t) return t[index];
  }
  return sanskritName;
}

export function labelRashiWestern(index: number, lang: Lang, englishName: string): string {
  if (index >= 0 && index < 12) {
    const t = RASHI_WESTERN_BY_LANG[lang];
    if (t) return t[index];
  }
  return englishName;
}

const DIGNITY_KEYS: Record<string, TranslationKey> = {
  exalted: 'dignity.exalted',
  'own-sign': 'dignity.ownSign',
  'friend-sign': 'dignity.friendly',
  'neutral-sign': 'dignity.neutral',
  'enemy-sign': 'dignity.enemy',
  debilitated: 'dignity.debilitated',
  Exalted: 'dignity.exalted',
  'Own Sign': 'dignity.ownSign',
  Own: 'dignity.ownSign',
  Friendly: 'dignity.friendly',
  Friend: 'dignity.friendly',
  Neutral: 'dignity.neutral',
  'Enemy Sign': 'dignity.enemy',
  Enemy: 'dignity.enemy',
  Debilitated: 'dignity.debilitated',
};

export function labelDignity(key: string, lang: Lang): string {
  const tk = DIGNITY_KEYS[key];
  return tk ? tKey(tk, lang) : key;
}

const TREND_KEYS: Record<string, TranslationKey> = {
  positive: 'trend.favorable',
  favorable: 'trend.favorable',
  Favorable: 'trend.favorable',
  negative: 'trend.challenging',
  challenging: 'trend.challenging',
  Challenging: 'trend.challenging',
  mixed: 'trend.mixed',
  Mixed: 'trend.mixed',
  neutral: 'trend.neutral',
  Neutral: 'trend.neutral',
};

export function labelTrend(key: string, lang: Lang): string {
  const tk = TREND_KEYS[key];
  return tk ? tKey(tk, lang) : key;
}

const AREA_KEYS: Record<string, TranslationKey> = {
  health: 'area.health',
  Health: 'area.health',
  wealth: 'area.wealth',
  Wealth: 'area.wealth',
  career: 'area.career',
  Career: 'area.career',
  relationships: 'area.relationships',
  Relationships: 'area.relationships',
  relations: 'area.relationships',
  Relations: 'area.relationships',
  general: 'area.general',
  General: 'area.general',
};

export function labelArea(key: string, lang: Lang): string {
  const tk = AREA_KEYS[key];
  return tk ? tKey(tk, lang) : key;
}

const DASHA_LEVEL_KEYS: Record<string, TranslationKey> = {
  Mahadasha: 'dasha.mahadasha',
  Antardasha: 'dasha.antardasha',
  Pratyantardasha: 'dasha.pratyantardasha',
  'Sookshma Dasha': 'dasha.sookshma',
};

export function labelDashaLevel(label: string, lang: Lang): string {
  const tk = DASHA_LEVEL_KEYS[label];
  return tk ? tKey(tk, lang) : label;
}

const ORDINAL_SI = ['', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

export function labelOrdinalHouse(n: number, lang: Lang): string {
  if (lang === 'si') return `${ORDINAL_SI[n]} වන ගෘහ`;
  if (lang === 'ta') return `${n}-ஆம் பாவம்`;
  if (lang === 'zh') return `第 ${n} 宫`;
  if (lang === 'hi') return `${n}वाँ भाव`;
  if (lang === 'ja') return `第${n}ハウス`;
  if (lang === 'ko') return `제${n}하우스`;
  if (lang === 'ar') return `البيت رقم ${n}`;
  if (lang === 'ml') return `${n}-ാം ഭാവം`;
  const en = ['', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];
  return `${en[n]} House`;
}

const YOGA_CAT_KEYS: Record<string, { label: TranslationKey; desc: TranslationKey }> = {
  rajayoga:    { label: 'yogas.cat.rajayoga',    desc: 'yogas.cat.rajayogaDesc' },
  mahapurusha: { label: 'yogas.cat.mahapurusha', desc: 'yogas.cat.mahapurushaDesc' },
  dhana:       { label: 'yogas.cat.dhana',       desc: 'yogas.cat.dhanaDesc' },
  spiritual:   { label: 'yogas.cat.spiritual',   desc: 'yogas.cat.spiritualDesc' },
  special:     { label: 'yogas.cat.special',     desc: 'yogas.cat.specialDesc' },
  daridra:     { label: 'yogas.cat.daridra',     desc: 'yogas.cat.daridraDesc' },
};

export function labelYogaCategory(cat: string, lang: Lang): { label: string; description: string } {
  const cfg = YOGA_CAT_KEYS[cat] ?? YOGA_CAT_KEYS.special;
  return { label: tKey(cfg.label, lang), description: tKey(cfg.desc, lang) };
}

const YOGA_STRENGTH_KEYS: Record<string, TranslationKey> = {
  'very strong': 'yogas.strength.veryStrong',
  strong: 'yogas.strength.strong',
  medium: 'yogas.strength.medium',
  weak: 'yogas.strength.weak',
};

export function labelYogaStrength(strength: string, lang: Lang): string {
  const tk = YOGA_STRENGTH_KEYS[strength];
  return tk ? tKey(tk, lang) : strength;
}

// ── Plain-language meanings (for the Knowledge Graph / general audience) ─────────

/** One-line plain meaning of each planet — what it represents in everyday life. */
const PLANET_THEME: Record<string, Partial<Record<Lang, string>> & { en: string }> = {
  SUN:     { en: 'Identity, vitality & leadership',        si: 'ආත්මය, ජීවය හා නායකත්වය',              ta: 'அடையாளம், உயிர்ச்சக்தி & தலைமை',            zh: '自我、活力与领导力',   hi: 'पहचान, प्राणशक्ति और नेतृत्व',
    ja: '自己同一性、活力とリーダーシップ', ko: '정체성, 활력과 리더십', ar: 'الهوية والحيوية والقيادة', ml: 'സ്വത്വം, ജീവശക്തി & നേതൃത്വം' },
  MOON:    { en: 'Emotions, mind & comfort',               si: 'හැඟීම්, මනස හා සැනසීම',                 ta: 'உணர்வுகள், மனம் & ஆறுதல்',                   zh: '情绪、心灵与安适',     hi: 'भावनाएँ, मन और सुख-चैन',
    ja: '感情、心と安らぎ', ko: '감정, 마음과 안락함', ar: 'المشاعر والعقل والراحة', ml: 'വികാരങ്ങൾ, മനസ്സ് & ആശ്വാസം' },
  MARS:    { en: 'Energy, drive & courage',                si: 'ශක්තිය, ධෛර්යය හා නිර්භීතභාවය',        ta: 'ஆற்றல், உந்துதல் & துணிச்சல்',               zh: '能量、干劲与勇气',     hi: 'ऊर्जा, उद्यम और साहस',
    ja: 'エネルギー、推進力と勇気', ko: '에너지, 추진력과 용기', ar: 'الطاقة والاندفاع والشجاعة', ml: 'ഊർജ്ജം, മുന്നേറ്റം & ധൈര്യം' },
  MERCURY: { en: 'Communication & intellect',              si: 'සන්නිවේදනය හා බුද්ධිය',                 ta: 'தொடர்பு & அறிவு',                            zh: '沟通与才智',           hi: 'संवाद और बुद्धि',
    ja: 'コミュニケーションと知性', ko: '소통과 지성', ar: 'التواصل والفكر', ml: 'ആശയവിനിമയവും ബുദ്ധിയും' },
  JUPITER: { en: 'Growth, wisdom & good fortune',          si: 'වර්ධනය, ඥානය හා වාසනාව',               ta: 'வளர்ச்சி, ஞானம் & நல்லதிர்ஷ்டம்',            zh: '成长、智慧与好运',     hi: 'विकास, ज्ञान और सौभाग्य',
    ja: '成長、知恵と幸運', ko: '성장, 지혜와 행운', ar: 'النمو والحكمة وحسن الحظ', ml: 'വളർച്ച, ജ്ഞാനം & ഭാഗ്യം' },
  VENUS:   { en: 'Love, beauty & pleasures',               si: 'ආදරය, සුන්දරත්වය හා සැප සම්පත්',       ta: 'அன்பு, அழகு & இன்பங்கள்',                    zh: '爱、美与享乐',         hi: 'प्रेम, सौंदर्य और सुख',
    ja: '愛、美と喜び', ko: '사랑, 아름다움과 즐거움', ar: 'الحب والجمال والمتعة', ml: 'സ്നേഹം, സൗന്ദര്യം & ആനന്ദങ്ങൾ' },
  SATURN:  { en: 'Discipline, patience & life lessons',    si: 'විනය, ඉවසීම හා ජීවිත පාඩම්',            ta: 'ஒழுக்கம், பொறுமை & வாழ்க்கைப் பாடங்கள்',     zh: '纪律、耐心与人生课题', hi: 'अनुशासन, धैर्य और जीवन के पाठ',
    ja: '規律、忍耐と人生の教訓', ko: '규율, 인내와 삶의 교훈', ar: 'الانضباط والصبر ودروس الحياة', ml: 'അച്ചടക്കം, ക്ഷമ & ജീവിത പാഠങ്ങൾ' },
  RAHU:    { en: 'Ambition & worldly desires',             si: 'අභිලාෂය හා ලෞකික ආශාවන්',              ta: 'லட்சியம் & உலக ஆசைகள்',                      zh: '野心与世俗欲望',       hi: 'महत्वाकांक्षा और सांसारिक इच्छाएँ',
    ja: '野心と世俗的な欲望', ko: '야망과 세속적 욕망', ar: 'الطموح والرغبات الدنيوية', ml: 'മോഹവും ലൗകിക ആഗ്രഹങ്ങളും' },
  KETU:    { en: 'Detachment & spirituality',              si: 'වෙන්වීම හා අධ්‍යාත්මිකත්වය',            ta: 'பற்றின்மை & ஆன்மீகம்',                       zh: '超脱与灵性',           hi: 'वैराग्य और आध्यात्मिकता',
    ja: '離脱と精神性', ko: '초연함과 영성', ar: 'اللامبالاة والروحانية', ml: 'വിരക്തിയും ആത്മീയതയും' },
};

export function labelPlanetTheme(code: string, lang: Lang): string {
  const t = PLANET_THEME[code.toUpperCase()];
  return t ? (t[lang] ?? t.en) : '';
}

/** Short one-word theme for each house (1–12) — for compact graph labels. */
const HOUSE_THEME: Record<number, Partial<Record<Lang, string>> & { en: string }> = {
  1:  { en: 'Self',       si: 'ආත්මය',      ta: 'சுயம்',        zh: '自我', hi: 'स्वयं',       ja: '自己',     ko: '자아',   ar: 'الذات',     ml: 'സ്വയം' },
  2:  { en: 'Money',      si: 'ධනය',        ta: 'பணம்',         zh: '钱财', hi: 'धन',          ja: 'お金',     ko: '재물',   ar: 'المال',     ml: 'ധനം' },
  3:  { en: 'Courage',    si: 'ධෛර්යය',     ta: 'துணிவு',       zh: '勇气', hi: 'साहस',        ja: '勇気',     ko: '용기',   ar: 'الشجاعة',   ml: 'ധൈര്യം' },
  4:  { en: 'Home',       si: 'නිවස',       ta: 'வீடு',         zh: '家庭', hi: 'घर',          ja: '家庭',     ko: '가정',   ar: 'المنزل',    ml: 'വീട്' },
  5:  { en: 'Creativity', si: 'නිර්මාණ',    ta: 'படைப்பு',      zh: '创造', hi: 'सृजन',        ja: '創造性',   ko: '창의성', ar: 'الإبداع',   ml: 'സർഗ്ഗാത്മകത' },
  6:  { en: 'Health',     si: 'සෞඛ්‍යය',    ta: 'ஆரோக்கியம்',   zh: '健康', hi: 'स्वास्थ्य',   ja: '健康',     ko: '건강',   ar: 'الصحة',     ml: 'ആരോഗ്യം' },
  7:  { en: 'Partners',   si: 'සහකරු',      ta: 'துணை',         zh: '伴侣', hi: 'साथी',        ja: 'パートナー', ko: '파트너', ar: 'الشركاء', ml: 'പങ്കാളികൾ' },
  8:  { en: 'Change',     si: 'පරිවර්තනය',  ta: 'மாற்றம்',      zh: '变化', hi: 'परिवर्तन',    ja: '変化',     ko: '변화',   ar: 'التغيير',   ml: 'മാറ്റം' },
  9:  { en: 'Luck',       si: 'වාසනාව',     ta: 'அதிர்ஷ்டம்',   zh: '福运', hi: 'भाग्य',       ja: '幸運',     ko: '행운',   ar: 'الحظ',      ml: 'ഭാഗ്യം' },
  10: { en: 'Career',     si: 'වෘත්තිය',    ta: 'தொழில்',       zh: '事业', hi: 'करियर',       ja: 'キャリア', ko: '경력',   ar: 'المسيرة المهنية', ml: 'കരിയർ' },
  11: { en: 'Gains',      si: 'ලාභ',        ta: 'லாபம்',        zh: '收获', hi: 'लाभ',         ja: '利益',     ko: '이득',   ar: 'المكاسب',   ml: 'നേട്ടങ്ങൾ' },
  12: { en: 'Release',    si: 'මිදීම',      ta: 'விடுதலை',      zh: '放下', hi: 'मोक्ष',       ja: '解放',     ko: '해방',   ar: 'التحرر',    ml: 'മോചനം' },
};

export function labelHouseTheme(n: number, lang: Lang): string {
  const t = HOUSE_THEME[n];
  return t ? (t[lang] ?? t.en) : '';
}

/** Fuller plain description of what each house governs. */
const HOUSE_COVERS: Record<number, Partial<Record<Lang, string>> & { en: string }> = {
  1:  { en: 'Personality, body & fresh starts',          si: 'පෞරුෂය, සිරුර හා නව ආරම්භ',                    ta: 'ஆளுமை, உடல் & புதிய தொடக்கங்கள்',            zh: '人格、身体与新开端',         hi: 'व्यक्तित्व, शरीर और नई शुरुआत',
    ja: '人格、身体と新たな始まり', ko: '성격, 몸과 새로운 시작', ar: 'الشخصية والجسد والبدايات الجديدة', ml: 'വ്യക്തിത്വം, ശരീരം & പുതിയ തുടക്കങ്ങൾ' },
  2:  { en: 'Income, savings, food & family',            si: 'ආදායම, ඉතිරිකිරීම්, ආහාර හා පවුල',            ta: 'வருமானம், சேமிப்பு, உணவு & குடும்பம்',        zh: '收入、储蓄、饮食与家庭',     hi: 'आय, बचत, भोजन और परिवार',
    ja: '収入、貯蓄、食事と家族', ko: '수입, 저축, 음식과 가족', ar: 'الدخل والادخار والطعام والأسرة', ml: 'വരുമാനം, സമ്പാദ്യം, ഭക്ഷണം & കുടുംബം' },
  3:  { en: 'Effort, communication & siblings',          si: 'උත්සාහය, සන්නිවේදනය හා සහෝදරයන්',             ta: 'முயற்சி, தொடர்பு & உடன்பிறந்தோர்',            zh: '努力、沟通与手足',           hi: 'प्रयास, संवाद और भाई-बहन',
    ja: '努力、コミュニケーションと兄弟姉妹', ko: '노력, 소통과 형제자매', ar: 'الجهد والتواصل والإخوة', ml: 'പരിശ്രമം, ആശയവിനിമയം & സഹോദരങ്ങൾ' },
  4:  { en: 'Home, mother, property & peace of mind',     si: 'නිවස, මව, දේපළ හා සිතේ සැනසීම',               ta: 'வீடு, தாய், சொத்து & மன அமைதி',               zh: '家宅、母亲、房产与内心安宁', hi: 'घर, माता, संपत्ति और मन की शांति',
    ja: '家庭、母、財産と心の平安', ko: '가정, 어머니, 재산과 마음의 평화', ar: 'المنزل والأم والممتلكات وراحة البال', ml: 'വീട്, അമ്മ, സ്വത്ത് & മനഃസമാധാനം' },
  5:  { en: 'Romance, children, creativity & studies',   si: 'ආදරය, දරුවන්, නිර්මාණශීලීත්වය හා අධ්‍යාපනය',  ta: 'காதல், குழந்தைகள், படைப்பாற்றல் & கல்வி',     zh: '恋爱、子女、创造力与学业',   hi: 'प्रेम, संतान, सृजनशीलता और विद्या',
    ja: '恋愛、子供、創造性と学業', ko: '연애, 자녀, 창의성과 학업', ar: 'الرومانسية والأطفال والإبداع والدراسة', ml: 'പ്രണയം, കുട്ടികൾ, സർഗ്ഗാത്മകത & പഠനം' },
  6:  { en: 'Health, daily work, debts & rivals',        si: 'සෞඛ්‍යය, දෛනික වැඩ, ණය හා තරඟකරුවන්',         ta: 'ஆரோக்கியம், தினசரி வேலை, கடன்கள் & எதிரிகள்', zh: '健康、日常工作、债务与对手', hi: 'स्वास्थ्य, दैनिक कार्य, ऋण और प्रतिद्वंद्वी',
    ja: '健康、日々の仕事、負債とライバル', ko: '건강, 일상 업무, 부채와 경쟁자', ar: 'الصحة والعمل اليومي والديون والمنافسين', ml: 'ആരോഗ്യം, ദൈനംദിന ജോലി, കടങ്ങൾ & എതിരാളികൾ' },
  7:  { en: 'Marriage, partnerships & the public',        si: 'විවාහය, හවුල්කාරිත්ව හා මහජනතාව',             ta: 'திருமணம், கூட்டாண்மை & பொதுமக்கள்',           zh: '婚姻、合作与公众',           hi: 'विवाह, साझेदारी और जन-संपर्क',
    ja: '結婚、パートナーシップと世間', ko: '결혼, 파트너십과 대중', ar: 'الزواج والشراكات والجمهور', ml: 'വിവാഹം, പങ്കാളിത്തങ്ങൾ & പൊതുജനം' },
  8:  { en: 'Change, shared money, secrets & longevity',  si: 'වෙනස්වීම්, හවුල් මුදල්, රහස් හා ආයුෂ',        ta: 'மாற்றம், கூட்டுப் பணம், ரகசியங்கள் & ஆயுள்',  zh: '变动、共有钱财、秘密与寿元', hi: 'परिवर्तन, साझा धन, रहस्य और आयु',
    ja: '変化、共有財産、秘密と長寿', ko: '변화, 공유 자금, 비밀과 장수', ar: 'التغيير والمال المشترك والأسرار وطول العمر', ml: 'മാറ്റം, പങ്കിട്ട പണം, രഹസ്യങ്ങൾ & ദീർഘായുസ്സ്' },
  9:  { en: 'Fortune, higher learning, travel & beliefs', si: 'වාසනාව, උසස් අධ්‍යාපනය, ගමන් හා විශ්වාස',     ta: 'அதிர்ஷ்டம், உயர்கல்வி, பயணம் & நம்பிக்கைகள்', zh: '福运、高等教育、远行与信仰', hi: 'भाग्य, उच्च शिक्षा, यात्रा और आस्था',
    ja: '幸運、高等教育、旅行と信念', ko: '행운, 고등 교육, 여행과 신념', ar: 'الحظ والتعليم العالي والسفر والمعتقدات', ml: 'ഭാഗ്യം, ഉന്നത വിദ്യാഭ്യാസം, യാത്ര & വിശ്വാസങ്ങൾ' },
  10: { en: 'Career, reputation & achievement',           si: 'වෘත්තිය, කීර්තිය හා සාර්ථකත්වය',              ta: 'தொழில், புகழ் & சாதனை',                       zh: '事业、声誉与成就',           hi: 'करियर, प्रतिष्ठा और उपलब्धि',
    ja: 'キャリア、評判と達成', ko: '경력, 명성과 성취', ar: 'المسيرة المهنية والسمعة والإنجاز', ml: 'കരിയർ, പ്രശസ്തി & നേട്ടം' },
  11: { en: 'Income, goals, networks & friends',          si: 'ආදායම, ඉලක්ක, සම්බන්ධතා හා මිතුරන්',          ta: 'வருமானம், இலக்குகள், தொடர்புகள் & நண்பர்கள்', zh: '进账、目标、人脉与朋友',     hi: 'लाभ, लक्ष्य, संपर्क और मित्र',
    ja: '収入、目標、人脈と友人', ko: '수입, 목표, 인맥과 친구', ar: 'الدخل والأهداف والعلاقات والأصدقاء', ml: 'വരുമാനം, ലക്ഷ്യങ്ങൾ, ബന്ധങ്ങൾ & സുഹൃത്തുക്കൾ' },
  12: { en: 'Letting go, expenses, rest & spirituality',  si: 'අත්හැරීම, වියදම්, විවේකය හා අධ්‍යාත්මිකත්වය', ta: 'விடுதல், செலவுகள், ஓய்வு & ஆன்மீகம்',         zh: '放下、支出、休憩与灵性',     hi: 'त्याग, व्यय, विश्राम और आध्यात्मिकता',
    ja: '手放すこと、支出、休息と精神性', ko: '내려놓음, 지출, 휴식과 영성', ar: 'التخلي والنفقات والراحة والروحانية', ml: 'ഉപേക്ഷിക്കൽ, ചെലവുകൾ, വിശ്രമം & ആത്മീയത' },
};

export function labelHouseCovers(n: number, lang: Lang): string {
  const t = HOUSE_COVERS[n];
  return t ? (t[lang] ?? t.en) : '';
}

/** Plain explanation of how long each dasha level lasts. */
const DASHA_SCOPE: Record<string, Partial<Record<Lang, string>> & { en: string }> = {
  'Mahadasha':       { en: 'Main life chapter (several years)',       si: 'ප්‍රධාන ජීවිත පරිච්ඡේදය (වසර කිහිපයක්)',        ta: 'முக்கிய வாழ்க்கை அத்தியாயம் (பல ஆண்டுகள்)',            zh: '人生主篇章（数年）',       hi: 'जीवन का मुख्य अध्याय (कई वर्ष)',
    ja: '人生の主要な章（数年間）', ko: '인생의 주요 장 (여러 해)', ar: 'الفصل الرئيسي في الحياة (عدة سنوات)', ml: 'പ്രധാന ജീവിത അധ്യായം (നിരവധി വർഷങ്ങൾ)' },
  'Antardasha':      { en: 'Current sub-phase (months to years)',     si: 'වර්තමාන උප-අදියර (මාස කිහිපයක සිට වසර දක්වා)',  ta: 'நடப்புத் துணைக் கட்டம் (மாதங்கள் முதல் ஆண்டுகள் வரை)', zh: '当前子阶段（数月至数年）', hi: 'वर्तमान उप-चरण (महीनों से वर्षों तक)',
    ja: '現在の副段階（数ヶ月から数年）', ko: '현재의 하위 단계 (몇 달에서 몇 년)', ar: 'المرحلة الفرعية الحالية (أشهر إلى سنوات)', ml: 'നിലവിലെ ഉപഘട്ടം (മാസങ്ങൾ മുതൽ വർഷങ്ങൾ വരെ)' },
  'Pratyantardasha': { en: 'Short window (weeks to months)',          si: 'කෙටි කාලය (සති සිට මාස දක්වා)',                 ta: 'குறுகிய காலம் (வாரங்கள் முதல் மாதங்கள் வரை)',          zh: '短期窗口（数周至数月）',   hi: 'छोटी अवधि (हफ़्तों से महीनों तक)',
    ja: '短い期間（数週間から数ヶ月）', ko: '짧은 기간 (몇 주에서 몇 달)', ar: 'فترة قصيرة (أسابيع إلى أشهر)', ml: 'ഹ്രസ്വ കാലയളവ് (ആഴ്ചകൾ മുതൽ മാസങ്ങൾ വരെ)' },
  'Sookshma Dasha':  { en: 'Fine-tuning phase (days to weeks)',       si: 'සියුම් අදියර (දින සිට සති දක්වා)',              ta: 'நுண்ணிய கட்டம் (நாட்கள் முதல் வாரங்கள் வரை)',          zh: '微调阶段（数天至数周）',   hi: 'सूक्ष्म चरण (दिनों से हफ़्तों तक)',
    ja: '微調整の段階（数日から数週間）', ko: '미세 조정 단계 (며칠에서 몇 주)', ar: 'مرحلة الضبط الدقيق (أيام إلى أسابيع)', ml: 'സൂക്ഷ്മ ക്രമീകരണ ഘട്ടം (ദിവസങ്ങൾ മുതൽ ആഴ്ചകൾ വരെ)' },
};

export function labelDashaScope(label: string, lang: Lang): string {
  const t = DASHA_SCOPE[label];
  return t ? (t[lang] ?? t.en) : '';
}
