/**
 * Dosha checker — Mangal (Kuja), Kaal Sarpa, Pitra, and the Sade Sati timeline.
 *
 * Each check returns whether the dosha is present, its strength, the factors
 * that cause it, and the classical cancellation (bhanga) rules that mitigate it.
 * Rules follow common Parashari practice; doshas describe tendencies to manage,
 * not fixed fates.
 */

import { RASHIS, RASHI_LORDS } from './rashi';
import { type Lang, houseLabel } from './i18n';

export interface DoshaPlanet {
  lon: number;    // sidereal longitude 0–360
  rashi: number;  // 0–11
}

/** Natal snapshot the synchronous checks operate on. */
export interface DoshaPositions {
  lagnaRashi: number;
  planets: Record<string, DoshaPlanet>; // Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu
}

export type DoshaSeverity = 'none' | 'mild' | 'moderate' | 'strong';

export interface DoshaCheck {
  key: 'mangal' | 'kaalsarpa' | 'pitra';
  name: string;
  present: boolean;
  severity: DoshaSeverity;
  summary: string;
  factors: string[];        // why it is flagged
  cancellations: string[];  // mitigating (bhanga) factors found
  remedy: string;
}

function houseFrom(targetRashi: number, refRashi: number): number {
  return ((targetRashi - refRashi + 12) % 12) + 1;
}

function sameRashi(a: DoshaPlanet, b: DoshaPlanet): boolean {
  return a.rashi === b.rashi;
}

// ─── Shared text ─────────────────────────────────────────────────────────────

const DOSHA_NAME: Record<'mangal' | 'kaalsarpa' | 'pitra', Record<Lang, string>> = {
  mangal: {
    en: 'Mangal (Kuja / Manglik) Dosha', si: 'මංගල් (කුජ / මංග්ලික්) දෝෂය', ta: 'மங்கள் (குஜ / மங்களீக்) தோஷம்',
    zh: '曼加尔（库贾/曼格利克）多沙', hi: 'मंगल (कुज / मांगलिक) दोष', ja: 'マンガル（クジャ／マングリク）ドーシャ',
    ko: '망갈 (쿠자/망글리크) 도샤', ar: 'مانجال (كوجا / مانجليك) دوشا', ml: 'മംഗൾ (കുജ / മംഗ്ലിക്) ദോഷം',
  },
  kaalsarpa: {
    en: 'Kaal Sarpa Dosha', si: 'කාල සර්ප දෝෂය', ta: 'கால சர்ப தோஷம்', zh: '卡拉萨尔巴多沙',
    hi: 'काल सर्प दोष', ja: 'カーラ・サルパ・ドーシャ', ko: '칼라 사르파 도샤', ar: 'كال ساربا دوشا', ml: 'കാല സർപ്പ ദോഷം',
  },
  pitra: {
    en: 'Pitra Dosha', si: 'පිත්‍ර දෝෂය', ta: 'பித்ரு தோஷம்', zh: '皮特拉多沙',
    hi: 'पितृ दोष', ja: 'ピトラ・ドーシャ', ko: '피트라 도샤', ar: 'بيترا دوشا', ml: 'പിതൃ ദോഷം',
  },
};

const SEVERITY_WORD: Record<DoshaSeverity, Record<Lang, string>> = {
  none: { en: 'none', si: 'නැත', ta: 'இல்லை', zh: '无', hi: 'नहीं', ja: 'なし', ko: '없음', ar: 'لا يوجد', ml: 'ഇല്ല' },
  mild: { en: 'mild', si: 'මෘදු', ta: 'லேசான', zh: '轻微', hi: 'हल्का', ja: '軽度', ko: '경미', ar: 'خفيف', ml: 'നേരിയ' },
  moderate: { en: 'moderate', si: 'මධ්‍යස්ථ', ta: 'மிதமான', zh: '中度', hi: 'मध्यम', ja: '中程度', ko: '보통', ar: 'متوسط', ml: 'മിതമായ' },
  strong: { en: 'strong', si: 'ප්‍රබල', ta: 'கடுமையான', zh: '强烈', hi: 'गंभीर', ja: '強い', ko: '강함', ar: 'قوي', ml: 'ശക്തമായ' },
};

function severityFromCount(factors: number, cancels: number): DoshaSeverity {
  if (factors === 0) return 'none';
  const net = factors - cancels;
  if (net <= 0) return 'mild';
  if (net === 1) return 'moderate';
  return 'strong';
}

// ─── Mangal (Kuja / Manglik) Dosha ───────────────────────────────────────────

const MANGAL_HOUSES = [1, 2, 4, 7, 8, 12];
// Signs in which Mars in a given dosha-house nullifies the dosha (common table).
const MANGAL_CANCEL_SIGN: Record<number, number[]> = {
  1: [0],          // Aries
  2: [2, 5],       // Gemini, Virgo
  4: [0, 7],       // Aries, Scorpio
  7: [9, 3],       // Capricorn, Cancer
  8: [8, 11],      // Sagittarius, Pisces
  12: [1, 6],      // Taurus, Libra
};

const MANGAL_TEXT = {
  factorLagna: (h: string, lang: Lang) => {
    switch (lang) {
      case 'si': return `කුජ ලග්නයේ සිට ${h}හි සිටී.`;
      case 'ta': return `செவ்வாய் லக்னத்திலிருந்து ${h} இல் அமர்ந்துள்ளது.`;
      case 'zh': return `火星位于从上升点起的${h}。`;
      case 'hi': return `मंगल लग्न से ${h} में स्थित है.`;
      case 'ja': return `火星はアセンダントから見て${h}にある。`;
      case 'ko': return `화성은 어센던트에서 ${h}에 위치한다.`;
      case 'ar': return `يقع المريخ في ${h} من الطالع.`;
      case 'ml': return `ചൊവ്വ ലഗ്നത്തിൽ നിന്ന് ${h} ൽ സ്ഥിതി ചെയ്യുന്നു.`;
      default: return `Mars sits in the ${h} from the Ascendant.`;
    }
  },
  factorMoon: (h: string, lang: Lang) => {
    switch (lang) {
      case 'si': return `කුජ චන්ද්‍රයාගේ සිට ${h}හි සිටී.`;
      case 'ta': return `செவ்வாய் சந்திரனிலிருந்து ${h} இல் உள்ளது.`;
      case 'zh': return `火星位于从月亮起的${h}。`;
      case 'hi': return `मंगल चंद्रमा से ${h} में है.`;
      case 'ja': return `火星は月から見て${h}にある。`;
      case 'ko': return `화성은 달에서 ${h}에 있다.`;
      case 'ar': return `المريخ في ${h} من القمر.`;
      case 'ml': return `ചൊവ്വ ചന്ദ്രനിൽ നിന്ന് ${h} ൽ ആണ്.`;
      default: return `Mars is in the ${h} from the Moon.`;
    }
  },
  factorVenus: (h: string, lang: Lang) => {
    switch (lang) {
      case 'si': return `කුජ ශුක්‍රයාගේ සිට ${h}හි සිටී.`;
      case 'ta': return `செவ்வாய் சுக்கிரனிலிருந்து ${h} இல் உள்ளது.`;
      case 'zh': return `火星位于从金星起的${h}。`;
      case 'hi': return `मंगल शुक्र से ${h} में है.`;
      case 'ja': return `火星は金星から見て${h}にある。`;
      case 'ko': return `화성은 금성에서 ${h}에 있다.`;
      case 'ar': return `المريخ في ${h} من الزهرة.`;
      case 'ml': return `ചൊവ്വ ശുക്രനിൽ നിന്ന് ${h} ൽ ആണ്.`;
      default: return `Mars is in the ${h} from Venus.`;
    }
  },
  cancelOwnSign: (lang: Lang) => {
    switch (lang) {
      case 'si': return 'කුජ තමන්ගේම රාශියේ (මේෂ/වෘශ්චික) සිටී — දෝෂය බොහෝ දුරට ස්වයංක්‍රීයව නිෂ්ප්‍රභ වේ.';
      case 'ta': return 'செவ்வாய் தன் சொந்த ராசியில் (மேஷம்/விருச்சிகம்) உள்ளது — தோஷம் பெரும்பாலும் தானாகவே நீக்கப்படுகிறது.';
      case 'zh': return '火星在本宫（白羊座/天蝎座）——多沙基本自我抵消。';
      case 'hi': return 'मंगल अपनी राशि (मेष/वृश्चिक) में है — दोष काफ़ी हद तक स्वयं निष्प्रभावी हो जाता है.';
      case 'ja': return '火星は自室（牡羊座／蠍座）にある——ドーシャはほぼ自己中和される。';
      case 'ko': return '화성이 자신의 별자리(양자리/전갈자리)에 있다 — 도샤가 대부분 자체적으로 상쇄된다.';
      case 'ar': return 'المريخ في برجه الخاص (الحمل/العقرب) — يتم إبطال الدوشا ذاتيًا إلى حد كبير.';
      case 'ml': return 'ചൊവ്വ സ്വന്തം രാശിയിൽ (മേടം/വൃശ്ചികം) ആണ് — ദോഷം സ്വയം ഏറെക്കുറെ നിർവീര്യമാകുന്നു.';
      default: return 'Mars is in its own sign (Aries/Scorpio) — the dosha is largely self-neutralised.';
    }
  },
  cancelExalted: (lang: Lang) => {
    switch (lang) {
      case 'si': return 'කුජ මකරයේ උච්ච වී ඇත — මෙය දෝෂය බෙහෙවින් අවම කරයි.';
      case 'ta': return 'செவ்வாய் மகரத்தில் உச்சமடைந்துள்ளது — இது தோஷத்தை பெரிதும் தணிக்கிறது.';
      case 'zh': return '火星在摩羯座擢升——这大大缓解了多沙。';
      case 'hi': return 'मंगल मकर राशि में उच्च का है — यह दोष को काफ़ी हद तक कम करता है.';
      case 'ja': return '火星は山羊座で高揚している——これがドーシャを大きく緩和する。';
      case 'ko': return '화성이 염소자리에서 고양되어 있다 — 이는 도샤를 크게 완화한다.';
      case 'ar': return 'المريخ في شرفه في الجدي — هذا يخفف الدوشا بشكل كبير.';
      case 'ml': return 'ചൊവ്വ മകരത്തിൽ ഉച്ചത്തിലാണ് — ഇത് ദോഷത്തെ ഗണ്യമായി ലഘൂകരിക്കുന്നു.';
      default: return 'Mars is exalted in Capricorn — this strongly mitigates the dosha.';
    }
  },
  cancelHouseSign: (rashiName: string, h: string, lang: Lang) => {
    switch (lang) {
      case 'si': return `කුජ ${h}හි ${rashiName} හි වාසය කරයි — එම භාවය සඳහා සම්භාව්‍ය නිෂ්ප්‍රභ කිරීමේ රාශියකි.`;
      case 'ta': return `செவ்வாய் ${h} இல் ${rashiName} இல் அமர்ந்துள்ளது — அந்த வீட்டிற்கான பாரம்பரிய நீக்கும் ராசி.`;
      case 'zh': return `火星在${h}占据${rashiName}——这是该宫位的经典化解星座。`;
      case 'hi': return `मंगल ${h} में ${rashiName} में स्थित है — उस भाव के लिए एक शास्त्रीय निष्प्रभावी राशि.`;
      case 'ja': return `火星は${h}で${rashiName}にある——その室にとって古典的な無効化サインである。`;
      case 'ko': return `화성이 ${h}에서 ${rashiName}에 위치한다 — 그 하우스에 대한 고전적인 무효화 별자리이다.`;
      case 'ar': return `يشغل المريخ ${rashiName} في ${h} — برج إبطال كلاسيكي لهذا البيت.`;
      case 'ml': return `ചൊവ്വ ${h} ൽ ${rashiName} ൽ സ്ഥിതി ചെയ്യുന്നു — ആ ഭാവത്തിന് ക്ലാസിക്കൽ നിർവീര്യമാക്കുന്ന രാശി.`;
      default: return `Mars occupies ${rashiName} in the ${h} — a classical nullifying sign for that house.`;
    }
  },
  cancelJupiterConj: (lang: Lang) => {
    switch (lang) {
      case 'si': return 'ගුරු කුජ සමඟ යුතව සිටී — එහි සුබ ආරක්ෂාව දෝෂය අඩු කරයි.';
      case 'ta': return 'குரு செவ்வாயுடன் இணைந்துள்ளார் — அவரது நல்ல பாதுகாப்பு தோஷத்தைக் குறைக்கிறது.';
      case 'zh': return '木星与火星合相——其吉星的守护减轻了多沙。';
      case 'hi': return 'बृहस्पति मंगल के साथ युति में है — इसका शुभ संरक्षण दोष को कम करता है.';
      case 'ja': return '木星が火星と合を成している——その吉的な保護がドーシャを軽減する。';
      case 'ko': return '목성이 화성과 합을 이루고 있다 — 그 길성의 보호가 도샤를 줄여준다.';
      case 'ar': return 'المشتري مقارن للمريخ — حمايته السعيدة تقلل من الدوشا.';
      case 'ml': return 'വ്യാഴം ചൊവ്വയുമായി യോജിച്ചിരിക്കുന്നു — അതിന്റെ ശുഭ സംരക്ഷണം ദോഷം കുറയ്ക്കുന്നു.';
      default: return 'Jupiter is conjunct Mars — its benefic protection reduces the dosha.';
    }
  },
  cancelJupiterAspect: (lang: Lang) => {
    switch (lang) {
      case 'si': return 'ගුරු කුජ දෙස බලයි — එහි කරුණාව දෝෂය මෘදු කරයි.';
      case 'ta': return 'குரு செவ்வாயைப் பார்க்கிறார் — அவரது அருள் தோஷத்தைத் தணிக்கிறது.';
      case 'zh': return '木星相位火星——其恩泽缓和了多沙。';
      case 'hi': return 'बृहस्पति मंगल को देखता है — इसकी कृपा दोष को नरम करती है.';
      case 'ja': return '木星が火星にアスペクトしている——その恩恵がドーシャを和らげる。';
      case 'ko': return '목성이 화성에 어스펙트를 형성한다 — 그 은혜가 도샤를 누그러뜨린다.';
      case 'ar': return 'يُشرف المشتري على المريخ — نعمته تلطف الدوشا.';
      case 'ml': return 'വ്യാഴം ചൊവ്വയെ വീക്ഷിക്കുന്നു — അതിന്റെ കൃപ ദോഷത്തെ ശമിപ്പിക്കുന്നു.';
      default: return 'Jupiter aspects Mars — its grace tempers the dosha.';
    }
  },
  summaryPresent: (severity: string, lang: Lang) => {
    switch (lang) {
      case 'si': return `මංගල් දෝෂය පවතී (${severity}). එය විවාහයේ හා හවුල්කාරිත්වයේ ඝට්ටනය, ප්‍රමාදය හෝ තීව්‍රතාවය සමඟ සම්බන්ධ වේ — ඉවසීම හා ගැලපෙන සහකරුවෙකු සමඟ හොඳින්ම කළමනාකරණය කළ හැක.`;
      case 'ta': return `மங்கள தோஷம் உள்ளது (${severity}). இது திருமணம் மற்றும் கூட்டாண்மைகளில் உராய்வு, தாமதம் அல்லது தீவிரத்துடன் தொடர்புடையது — பொறுமை மற்றும் பொருத்தமான துணையுடன் சிறப்பாக நிர்வகிக்கப்படுகிறது.`;
      case 'zh': return `存在曼加尔多沙（${severity}）。它与婚姻和伴侣关系中的摩擦、延迟或强烈情绪有关——最好以耐心和相配的伴侣来化解。`;
      case 'hi': return `मंगल दोष मौजूद है (${severity}). यह विवाह और साझेदारी में घर्षण, देरी या तीव्रता से जुड़ा है — धैर्य और उपयुक्त जोड़ी के साथ इसे सबसे अच्छी तरह संभाला जाता है.`;
      case 'ja': return `マンガル・ドーシャが存在する（${severity}）。これは結婚やパートナーシップにおける摩擦、遅れ、あるいは激しさと関連する——忍耐と相性の良い相手によって最もうまく対処できる。`;
      case 'ko': return `망갈 도샤가 존재한다 (${severity}). 이는 결혼과 파트너십에서의 마찰, 지연, 또는 강렬함과 관련이 있다 — 인내심과 어울리는 상대를 통해 가장 잘 관리된다.`;
      case 'ar': return `دوشا مانجال موجودة (${severity}). ترتبط بالاحتكاك أو التأخير أو الشدة في الزواج والشراكات — وتُدار على أفضل وجه بالصبر وشريك متوافق.`;
      case 'ml': return `മംഗൾ ദോഷം ഉണ്ട് (${severity}). വിവാഹത്തിലും പങ്കാളിത്തങ്ങളിലും ഘർഷണം, കാലതാമസം അല്ലെങ്കിൽ തീവ്രത എന്നിവയുമായി ഇത് ബന്ധപ്പെട്ടിരിക്കുന്നു — ക്ഷമയോടും അനുയോജ്യമായ പങ്കാളിയോടും കൂടി ഇത് ഏറ്റവും നന്നായി കൈകാര്യം ചെയ്യാം.`;
      default: return `Mangal Dosha is present (${severity}). It is associated with friction, delay, or intensity in marriage and partnerships — best managed with patience and a compatible match.`;
    }
  },
  summaryAbsent: (lang: Lang) => {
    switch (lang) {
      case 'si': return 'මංගල් දෝෂයක් නොමැත — කුජ විවාහය සඳහා සංවේදී භාවයන්හි නොසිටී.';
      case 'ta': return 'மங்கள தோஷம் இல்லை — செவ்வாய் திருமணத்திற்கான உணர்திறன் வீடுகளில் இல்லை.';
      case 'zh': return '无曼加尔多沙——火星未落入婚姻的敏感宫位。';
      case 'hi': return 'कोई मंगल दोष नहीं — मंगल विवाह के लिए संवेदनशील भावों में नहीं है.';
      case 'ja': return 'マンガル・ドーシャなし——火星は結婚に関わる敏感な室に位置していない。';
      case 'ko': return '망갈 도샤 없음 — 화성이 결혼과 관련된 민감한 하우스에 위치하지 않는다.';
      case 'ar': return 'لا توجد دوشا مانجال — لا يشغل المريخ البيوت الحساسة للزواج.';
      case 'ml': return 'മംഗൾ ദോഷമില്ല — വിവാഹത്തിനുള്ള സെൻസിറ്റീവ് ഭാവങ്ങളിൽ ചൊവ്വ ഇല്ല.';
      default: return 'No Mangal Dosha — Mars does not occupy the sensitive houses for marriage.';
    }
  },
  remedy: (lang: Lang) => {
    switch (lang) {
      case 'si': return 'අඟහරුවාදා දිනවල හනුමාන් පූජාව හා හනුමාන් චාලීසා පාරායනය; සමාන කුජ පිහිටීමක් ඇති සහකරුවෙකු සමඟ ගැලපීම සම්ප්‍රදායිකව එය නිෂ්ප්‍රභ කරයි.';
      case 'ta': return 'செவ்வாய்க்கிழமைகளில் அனுமன் வழிபாடு மற்றும் அனுமன் சாலீசா ஓதுதல்; ஒத்த செவ்வாய் அமைவுள்ள துணையுடன் பொருத்தம் பாரம்பரியமாக இதை நீக்குகிறது.';
      case 'zh': return '在星期二供奉哈努曼并诵读《哈努曼契萨》；传统上与火星位置相似的伴侣匹配可以化解此多沙。';
      case 'hi': return 'मंगलवार को हनुमान पूजा और हनुमान चालीसा का पाठ; समान मंगल स्थिति वाले साथी के साथ मिलान पारंपरिक रूप से इसे निष्प्रभावी करता है.';
      case 'ja': return '火曜日にハヌマーンを礼拝しハヌマーン・チャリーサを唱えること。同様の火星配置を持つ相手と組み合わせることが伝統的にこれを中和する。';
      case 'ko': return '화요일에 하누만을 숭배하고 하누만 찰리사를 낭송하는 것; 비슷한 화성 배치를 가진 상대와의 매칭이 전통적으로 이를 상쇄한다.';
      case 'ar': return 'عبادة هانومان وتلاوة هانومان تشاليسا أيام الثلاثاء؛ ويعتقد تقليديًا أن التوافق مع شريك له وضع مماثل للمريخ يبطل تأثيرها.';
      case 'ml': return 'ചൊവ്വാഴ്ചകളിൽ ഹനുമാൻ ആരാധനയും ഹനുമാൻ ചാലീസ ചൊല്ലലും; സമാന ചൊവ്വാ സ്ഥാനമുള്ള പങ്കാളിയുമായി പൊരുത്തപ്പെടുത്തുന്നത് പരമ്പരാഗതമായി ഇത് നിർവീര്യമാക്കുന്നു.';
      default: return 'Hanuman worship and reciting the Hanuman Chalisa on Tuesdays; matching with a partner of similar Mars placement traditionally neutralises it.';
    }
  },
};

export function checkMangalDosha(pos: DoshaPositions, lang: Lang = 'en'): DoshaCheck {
  const { lagnaRashi, planets } = pos;
  const mars = planets.Mars, moon = planets.Moon, venus = planets.Venus;
  const jup = planets.Jupiter;

  const factors: string[] = [];
  const hL = houseFrom(mars.rashi, lagnaRashi);
  const hM = houseFrom(mars.rashi, moon.rashi);
  const hV = houseFrom(mars.rashi, venus.rashi);
  if (MANGAL_HOUSES.includes(hL)) factors.push(MANGAL_TEXT.factorLagna(houseLabel(hL, lang), lang));
  if (MANGAL_HOUSES.includes(hM)) factors.push(MANGAL_TEXT.factorMoon(houseLabel(hM, lang), lang));
  if (MANGAL_HOUSES.includes(hV)) factors.push(MANGAL_TEXT.factorVenus(houseLabel(hV, lang), lang));

  const cancellations: string[] = [];
  if (mars.rashi === 0 || mars.rashi === 7) cancellations.push(MANGAL_TEXT.cancelOwnSign(lang));
  if (mars.rashi === 9) cancellations.push(MANGAL_TEXT.cancelExalted(lang));
  if (MANGAL_HOUSES.includes(hL) && (MANGAL_CANCEL_SIGN[hL] ?? []).includes(mars.rashi)) {
    cancellations.push(MANGAL_TEXT.cancelHouseSign(RASHIS[mars.rashi], houseLabel(hL, lang), lang));
  }
  if (sameRashi(jup, mars)) cancellations.push(MANGAL_TEXT.cancelJupiterConj(lang));
  else if (aspects(jup, 'Jupiter', mars)) cancellations.push(MANGAL_TEXT.cancelJupiterAspect(lang));

  const present = factors.length > 0;
  const severity = severityFromCount(factors.length, cancellations.length);

  return {
    key: 'mangal',
    name: DOSHA_NAME.mangal[lang],
    present,
    severity,
    summary: present
      ? MANGAL_TEXT.summaryPresent(SEVERITY_WORD[severity][lang], lang)
      : MANGAL_TEXT.summaryAbsent(lang),
    factors,
    cancellations,
    remedy: MANGAL_TEXT.remedy(lang),
  };
}

// Special aspects (graha drishti) as house offsets a planet looks at (incl. 7th).
const ASPECTS: Record<string, number[]> = {
  Mars: [4, 7, 8], Jupiter: [5, 7, 9], Saturn: [3, 7, 10], Rahu: [5, 7, 9], Ketu: [5, 7, 9],
};
function aspects(from: DoshaPlanet, fromName: string, to: DoshaPlanet): boolean {
  const offsets = ASPECTS[fromName] ?? [7];
  return offsets.includes(houseFrom(to.rashi, from.rashi));
}

// ─── Kaal Sarpa Dosha ────────────────────────────────────────────────────────

const KSD_TYPES: Record<number, string> = {
  1: 'Anant', 2: 'Kulik', 3: 'Vasuki', 4: 'Shankhpal', 5: 'Padma', 6: 'Mahapadma',
  7: 'Takshak', 8: 'Karkotak', 9: 'Shankhachur', 10: 'Ghatak', 11: 'Vishdhar', 12: 'Sheshnag',
};
const KSD_PLANETS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

const KSD_TEXT = {
  factorPresent: (type: string, h: string, lang: Lang) => {
    switch (lang) {
      case 'si': return `ග්‍රහයන් හත්දෙනාම රාහු හා කේතු අතර සිරවී ඇත — සම්පූර්ණ කාල සර්ප යෝගයකි (${type}, රාහු ${h}හි).`;
      case 'ta': return `அனைத்து ஏழு கிரகங்களும் ராகு மற்றும் கேது இடையே அடைபட்டுள்ளன — முழுமையான கால சர்ப யோகம் (${type}, ராகு ${h} இல்).`;
      case 'zh': return `全部七颗行星都被夹在罗睺和计都之间——一个完整的卡拉萨尔巴瑜伽（${type}型，罗睺位于${h}）。`;
      case 'hi': return `सभी सात ग्रह राहु और केतु के बीच घिरे हुए हैं — एक पूर्ण काल सर्प योग (${type}, राहु ${h} में).`;
      case 'ja': return `七つの惑星すべてがラーフとケートゥの間に囲まれている——完全なカーラ・サルパ・ヨーガ（${type}型、ラーフは${h}）。`;
      case 'ko': return `일곱 행성 모두가 라후와 케투 사이에 갇혀 있다 — 완전한 칼라 사르파 요가 (${type} 유형, 라후는 ${h}에 위치).`;
      case 'ar': return `تنحصر الكواكب السبعة كلها بين راهو وكيتو — يوغا كال ساربا كاملة (نوع ${type}، راهو في ${h}).`;
      case 'ml': return `എല്ലാ ഏഴ് ഗ്രഹങ്ങളും രാഹുവിനും കേതുവിനും ഇടയിൽ പെട്ടിരിക്കുന്നു — സമ്പൂർണ്ണ കാല സർപ്പ യോഗം (${type}, രാഹു ${h} ൽ).`;
      default: return `All seven planets are hemmed between Rahu and Ketu — a complete Kaal Sarpa yoga (${type}, Rahu in the ${h}).`;
    }
  },
  factorAbsent: (outsideCount: number, lang: Lang) => {
    switch (lang) {
      case 'si': return `සියලුම ග්‍රහයන් රාහු-කේතු අක්ෂයේ එක් පැත්තකට වැටෙන්නේ නැත (${outsideCount} පිටතින්) — සම්පූර්ණ කාල සර්පයක් නොමැත.`;
      case 'ta': return `அனைத்து கிரகங்களும் ராகு-கேது அச்சின் ஒரு பக்கத்தில் இல்லை (${outsideCount} வெளியே) — முழுமையான கால சர்ப்பம் இல்லை.`;
      case 'zh': return `并非所有行星都落在罗睺—计都轴线的同一侧（${outsideCount}颗在外）——没有完整的卡拉萨尔巴。`;
      case 'hi': return `सभी ग्रह राहु–केतु अक्ष के एक ओर नहीं आते (${outsideCount} बाहर) — कोई पूर्ण काल सर्प नहीं.`;
      case 'ja': return `すべての惑星がラーフ・ケートゥ軸の片側に収まっているわけではない（${outsideCount}個が外側）——完全なカーラ・サルパではない。`;
      case 'ko': return `모든 행성이 라후-케투 축의 한쪽에 있는 것은 아니다 (${outsideCount}개 벗어남) — 완전한 칼라 사르파는 아니다.`;
      case 'ar': return `لا تقع كل الكواكب في جانب واحد من محور راهو–كيتو (${outsideCount} خارج) — لا يوجد كال ساربا كامل.`;
      case 'ml': return `എല്ലാ ഗ്രഹങ്ങളും രാഹു-കേതു അക്ഷത്തിന്റെ ഒരു വശത്ത് വരുന്നില്ല (${outsideCount} പുറത്ത്) — സമ്പൂർണ്ണ കാല സർപ്പം ഇല്ല.`;
      default: return `Not all planets fall on one side of the Rahu–Ketu axis (${outsideCount} outside) — no complete Kaal Sarpa.`;
    }
  },
  cancelNearAxis: (lang: Lang) => {
    switch (lang) {
      case 'si': return 'ග්‍රහයෙක් නෝඩල් අක්ෂයේ අංශක 8ක් ඇතුළත සිටී — "ලූපය" ලිහිල්ව රඳවා ඇති අතර, එය යෝගය දුර්වල කරයි.';
      case 'ta': return 'ஒரு கிரகம் நோடல் அச்சின் 8°க்குள் அமர்ந்துள்ளது — "வளையம்" தளர்வாக பிடிக்கப்பட்டுள்ளது, யோகத்தை பலவீனப்படுத்துகிறது.';
      case 'zh': return '有一颗行星位于交点轴8°以内——"环"松散地成立，削弱了此瑜伽。';
      case 'hi': return 'एक ग्रह नोडल अक्ष के 8° के भीतर है — "लूप" ढीला बना है, जिससे योग कमज़ोर होता है.';
      case 'ja': return 'ある惑星がノーダル軸から8度以内にある——「輪」が緩く保たれており、ヨーガを弱める。';
      case 'ko': return "한 행성이 노드 축에서 8° 이내에 있다 — '고리'가 느슨하게 유지되어 요가가 약해진다.";
      case 'ar': return "يقع كوكب ضمن 8 درجات من محور العقد — 'الحلقة' غير محكمة، مما يضعف اليوغا.";
      case 'ml': return "ഒരു ഗ്രഹം നോഡൽ അക്ഷത്തിന്റെ 8° നുള്ളിൽ ഇരിക്കുന്നു — 'ലൂപ്പ്' അയഞ്ഞ് പിടിക്കപ്പെട്ടിരിക്കുന്നു, ഇത് യോഗത്തെ ദുർബലമാക്കുന്നു.";
      default: return 'A planet sits within 8° of the nodal axis — the "loop" is loosely held, weakening the yoga.';
    }
  },
  cancelEscapes: (lang: Lang) => {
    switch (lang) {
      case 'si': return 'ග්‍රහයෙක් රාහු-කේතු ලූපයෙන් ගැලවෙන බැවින්, සම්භාව්‍ය කාල සර්පය බිඳී ඇත (උපරිම වශයෙන් අර්ධ ප්‍රතිඵලයකි).';
      case 'ta': return 'ஒரு கிரகம் ராகு–கேது வளையத்திலிருந்து தப்பிக்கிறது என்பதால், பாரம்பரிய கால சர்ப்பம் உடைந்துவிட்டது (அதிகபட்சம் ஒரு பகுதி விளைவு).';
      case 'zh': return '由于有一颗行星逃出了罗睺—计都的环，经典的卡拉萨尔巴被打破（最多只有部分效应）。';
      case 'hi': return 'क्योंकि एक ग्रह राहु–केतु लूप से बाहर निकल जाता है, शास्त्रीय काल सर्प टूट जाता है (अधिकतम आंशिक प्रभाव).';
      case 'ja': return 'ある惑星がラーフ・ケートゥの輪から逃れているため、古典的なカーラ・サルパは崩れている（せいぜい部分的な効果）。';
      case 'ko': return '한 행성이 라후-케투 고리를 벗어나므로, 고전적인 칼라 사르파는 깨진다 (최대 부분적 효과).';
      case 'ar': return 'لأن كوكبًا يفلت من حلقة راهو–كيتو، فإن كال ساربا الكلاسيكي مكسور (تأثير جزئي على الأكثر).';
      case 'ml': return 'ഒരു ഗ്രഹം രാഹു-കേതു ലൂപ്പിൽ നിന്ന് രക്ഷപ്പെടുന്നതിനാൽ, ക്ലാസിക്കൽ കാല സർപ്പം തകർന്നിരിക്കുന്നു (പരമാവധി ഭാഗിക പ്രഭാവം).';
      default: return 'Because a planet escapes the Rahu–Ketu loop, the classical Kaal Sarpa is broken (at most a partial effect).';
    }
  },
  summaryPresent: (type: string, lang: Lang) => {
    switch (lang) {
      case 'si': return `කාල සර්ප යෝගය පවතී — ${type} වර්ගය. එය තීව්‍රතාවය, ප්‍රමාද හා හදිසි උස් පහත් වීම් ගෙන එනවා පමණක් නොව, අසාමාන්‍ය උත්සාහයක් හා අවසානයේ ප්‍රවීණත්වයක් ද ගෙන එයි.`;
      case 'ta': return `கால சர்ப யோகம் உள்ளது — ${type} வகை. இது தீவிரம், தாமதங்கள் மற்றும் திடீர் ஏற்ற இறக்கங்களைக் கொண்டு வரலாம், ஆனால் அசாதாரண உந்துதலையும் இறுதி தேர்ச்சியையும் தரும்.`;
      case 'zh': return `存在卡拉萨尔巴瑜伽——${type}型。它可能带来强烈情绪、延迟和突如其来的起伏，但也带来非凡的驱动力和最终的精通。`;
      case 'hi': return `काल सर्प योग मौजूद है — ${type} प्रकार. यह तीव्रता, देरी और अचानक उतार-चढ़ाव ला सकता है, पर साथ ही असाधारण जोश और अंततः महारत भी.`;
      case 'ja': return `カーラ・サルパ・ヨーガが存在する——${type}型。激しさ、遅れ、急な浮き沈みをもたらすことがあるが、並外れた推進力と最終的な熟達ももたらす。`;
      case 'ko': return `칼라 사르파 요가가 존재한다 — ${type} 유형. 강렬함, 지연, 갑작스러운 기복을 가져올 수 있지만, 동시에 비범한 추진력과 궁극적인 숙달도 가져온다.`;
      case 'ar': return `توجد يوغا كال ساربا — من نوع ${type}. يمكن أن تجلب الشدة والتأخير وتقلبات مفاجئة، لكنها تجلب أيضًا دافعًا غير عادي وإتقانًا في النهاية.`;
      case 'ml': return `കാല സർപ്പ യോഗം ഉണ്ട് — ${type} തരം. ഇത് തീവ്രത, കാലതാമസം, പെട്ടെന്നുള്ള കയറ്റിറക്കങ്ങൾ എന്നിവ കൊണ്ടുവന്നേക്കാം, എന്നാൽ അസാധാരണമായ ചാലകശക്തിയും ആത്യന്തിക പ്രാവീണ്യവും കൂടി നൽകും.`;
      default: return `Kaal Sarpa yoga is present — the ${type} type. It can bring intensity, delays, and sudden ups and downs, but also unusual drive and eventual mastery.`;
    }
  },
  summaryAbsent: (lang: Lang) => {
    switch (lang) {
      case 'si': return 'සම්පූර්ණ කාල සර්ප යෝගයක් නොමැත — ග්‍රහයන් නෝඩල් අක්ෂය මගින් සම්පූර්ණයෙන් වට වී නොමැත.';
      case 'ta': return 'முழுமையான கால சர்ப யோகம் இல்லை — கிரகங்கள் நோடல் அச்சால் முழுமையாக மூடப்படவில்லை.';
      case 'zh': return '没有完整的卡拉萨尔巴瑜伽——行星未被交点轴完全包围。';
      case 'hi': return 'कोई पूर्ण काल सर्प योग नहीं — ग्रह नोडल अक्ष से पूरी तरह घिरे नहीं हैं.';
      case 'ja': return '完全なカーラ・サルパ・ヨーガはない——惑星がノーダル軸に完全に囲まれていない。';
      case 'ko': return '완전한 칼라 사르파 요가는 없다 — 행성들이 노드 축에 완전히 둘러싸여 있지 않다.';
      case 'ar': return 'لا توجد يوغا كال ساربا كاملة — الكواكب ليست محاطة بالكامل بمحور العقد.';
      case 'ml': return 'സമ്പൂർണ്ണ കാല സർപ്പ യോഗം ഇല്ല — ഗ്രഹങ്ങൾ നോഡൽ അക്ഷത്താൽ പൂർണ്ണമായി വലയം ചെയ്യപ്പെട്ടിട്ടില്ല.';
      default: return 'No complete Kaal Sarpa yoga — the planets are not fully enclosed by the nodal axis.';
    }
  },
  remedy: (lang: Lang) => {
    switch (lang) {
      case 'si': return 'රාහු-කේතු ශාන්තිය, ශිව දෙවියන් වන්දනාව (මහාමෘත්‍යුඤ්ජය මන්ත්‍රය), හා නාග දේවාල වන්දනා ගමන් සම්ප්‍රදායික පිළියම් වේ.';
      case 'ta': return 'ராகு–கேது சாந்தி, சிவபெருமான் வழிபாடு (மகாமிருத்யுஞ்ஜய மந்திரம்), மற்றும் நாக கோவில்களுக்கு யாத்திரை ஆகியவை பாரம்பரிய பரிகாரங்கள்.';
      case 'zh': return '罗睺—计都平息法会、供奉湿婆神（大战胜死亡真言）以及朝拜蛇神庙是传统的化解方法。';
      case 'hi': return 'राहु–केतु शांति, भगवान शिव की पूजा (महामृत्युंजय मंत्र), और नाग मंदिरों की तीर्थयात्रा पारंपरिक उपाय हैं.';
      case 'ja': return 'ラーフ・ケートゥ・シャーンティ、シヴァ神への礼拝（マハームリティユンジャヤ・マントラ）、そしてナーガ寺院への巡礼が伝統的な対処法である。';
      case 'ko': return '라후-케투 샨티, 시바 신 숭배 (마하므리티윤자야 만트라), 그리고 나가 사원 순례가 전통적인 치유법이다.';
      case 'ar': return 'شانتي راهو–كيتو، وعبادة الإله شيفا (مانترا ماها مريتيونجايا)، والحج إلى معابد ناغا هي العلاجات التقليدية.';
      case 'ml': return 'രാഹു-കേതു ശാന്തി, ശിവ ഭഗവാന്റെ ആരാധന (മഹാമൃത്യുഞ്ജയ മന്ത്രം), നാഗ ക്ഷേത്ര തീർത്ഥാടനം എന്നിവയാണ് പരമ്പരാഗത പരിഹാരങ്ങൾ.';
      default: return 'Rahu–Ketu shanti, worship of Lord Shiva (Mahamrityunjaya mantra), and pilgrimage to Naga shrines are the traditional remedies.';
    }
  },
};

export function checkKaalSarpaDosha(pos: DoshaPositions, lang: Lang = 'en'): DoshaCheck {
  const { lagnaRashi, planets } = pos;
  const rahuLon = planets.Rahu.lon;

  // Angular distance of each planet forward from Rahu (0–360).
  const diffs = KSD_PLANETS.map(p => ({ p, d: ((planets[p].lon - rahuLon) % 360 + 360) % 360 }));
  const allForward = diffs.every(x => x.d > 0 && x.d < 180);
  const allBackward = diffs.every(x => x.d > 180 && x.d < 360);
  const present = allForward || allBackward;

  // How close any planet sits to the nodal axis (a near-conjunction can break it).
  const nearAxis = Math.min(...diffs.map(x => Math.min(Math.abs(x.d), Math.abs(180 - x.d), Math.abs(360 - x.d))));
  const outsideCount = present ? 0 : diffs.filter(x => (allForward ? !(x.d > 0 && x.d < 180) : !(x.d > 180 && x.d < 360))).length;

  const rahuHouse = houseFrom(planets.Rahu.rashi, lagnaRashi);
  const type = KSD_TYPES[rahuHouse];

  const factors: string[] = [];
  if (present) {
    factors.push(KSD_TEXT.factorPresent(type, houseLabel(rahuHouse, lang), lang));
  } else {
    factors.push(KSD_TEXT.factorAbsent(outsideCount, lang));
  }

  const cancellations: string[] = [];
  if (present && nearAxis < 8) cancellations.push(KSD_TEXT.cancelNearAxis(lang));
  if (!present) cancellations.push(KSD_TEXT.cancelEscapes(lang));

  const severity: DoshaSeverity = present ? (nearAxis < 8 ? 'moderate' : 'strong') : 'none';

  return {
    key: 'kaalsarpa',
    name: DOSHA_NAME.kaalsarpa[lang],
    present,
    severity,
    summary: present ? KSD_TEXT.summaryPresent(type, lang) : KSD_TEXT.summaryAbsent(lang),
    factors,
    cancellations,
    remedy: KSD_TEXT.remedy(lang),
  };
}

// ─── Pitra Dosha ─────────────────────────────────────────────────────────────

const PITRA_TEXT = {
  factorSunRahu: (lang: Lang) => {
    switch (lang) {
      case 'si': return 'සූර්ය රාහු සමඟ යුතව සිටී (සූර්ය-රාහු / ග්‍රහණ යෝගය) — සම්භාව්‍ය පිත්‍ර දෝෂ ලක්ෂණයකි.';
      case 'ta': return 'சூரியன் ராகுவுடன் இணைந்துள்ளார் (சூர்ய–ராகு / கிரஹண யோகம்) — ஒரு பாரம்பரிய பித்ரு தோஷ அடையாளம்.';
      case 'zh': return '太阳与罗睺合相（苏利耶—罗睺／格拉汉瑜伽）——皮特拉多沙的典型标志。';
      case 'hi': return 'सूर्य राहु के साथ युति में है (सूर्य–राहु / ग्रहण योग) — एक क्लासिक पितृ दोष संकेत.';
      case 'ja': return '太陽がラーフと合を成している（スーリヤ・ラーフ／グラハン・ヨーガ）——典型的なピトラ・ドーシャの兆候。';
      case 'ko': return '태양이 라후와 합을 이룬다 (수리야-라후 / 그라한 요가) — 전형적인 피트라 도샤의 징표.';
      case 'ar': return 'الشمس مقارنة لراهو (سوريا–راهو / يوغا جراهان) — علامة كلاسيكية على بيترا دوشا.';
      case 'ml': return 'സൂര്യൻ രാഹുവുമായി യോജിച്ചിരിക്കുന്നു (സൂര്യ-രാഹു / ഗ്രഹൺ യോഗം) — ക്ലാസിക്കൽ പിതൃ ദോഷ ലക്ഷണം.';
      default: return 'Sun is conjunct Rahu (Surya–Rahu / a Grahan-yoga) — a classic Pitra Dosha signature.';
    }
  },
  factorSunKetu: (lang: Lang) => {
    switch (lang) {
      case 'si': return 'සූර්ය කේතු සමඟ යුතව සිටී — සූර්ය/පිතෘ කාරකයට හානියකි.';
      case 'ta': return 'சூரியன் கேதுவுடன் இணைந்துள்ளார் — சூரிய/தந்தை காரகத்திற்கு பாதிப்பு.';
      case 'zh': return '太阳与计都合相——太阳／父亲的象征星受损。';
      case 'hi': return 'सूर्य केतु के साथ युति में है — सौर/पैतृक कारक को क्षति.';
      case 'ja': return '太陽がケートゥと合を成している——太陽的／父性的カラカへの障害。';
      case 'ko': return '태양이 케투와 합을 이룬다 — 태양/부성 카라카에 대한 손상.';
      case 'ar': return 'الشمس مقارنة لكيتو — إصابة لدليل الشمس/الأب.';
      case 'ml': return 'സൂര്യൻ കേതുവുമായി യോജിച്ചിരിക്കുന്നു — സൗര/പിതൃ കാരകത്തിന് ബാധ.';
      default: return 'Sun is conjunct Ketu — affliction to the solar/paternal significator.';
    }
  },
  factorSunSaturn: (lang: Lang) => {
    switch (lang) {
      case 'si': return 'සූර්ය ශනි සමඟ යුතව සිටී — පියා හා මුතුන් මිත්තන්ගේ පෙළපත කෙරෙහි පීඩනයකි.';
      case 'ta': return 'சூரியன் சனியுடன் இணைந்துள்ளார் — தந்தை மற்றும் மூதாதையர் வம்சத்திற்கு அழுத்தம்.';
      case 'zh': return '太阳与土星合相——对父亲及祖先血脉造成压力。';
      case 'hi': return 'सूर्य शनि के साथ युति में है — पिता और पूर्वजों की वंशावली पर दबाव.';
      case 'ja': return '太陽が土星と合を成している——父親と祖先の系譜への負担。';
      case 'ko': return '태양이 토성과 합을 이룬다 — 아버지와 조상 계보에 대한 부담.';
      case 'ar': return 'الشمس مقارنة لزحل — ضغط على الأب والسلالة الأسرية.';
      case 'ml': return 'സൂര്യൻ ശനിയുമായി യോജിച്ചിരിക്കുന്നു — അച്ഛനും പിതൃപരമ്പരയ്ക്കും സമ്മർദ്ദം.';
      default: return 'Sun is conjunct Saturn — strain on the father and ancestral line.';
    }
  },
  factorRahu9th: (h: string, lang: Lang) => {
    switch (lang) {
      case 'si': return `රාහු ${h}හි වාසය කරයි — පියා, ධර්මය හා මුතුන් මිත්තන්ගේ භාවය පීඩාවට ලක්ව ඇත.`;
      case 'ta': return `ராகு ${h} இல் அமர்ந்துள்ளார் — தந்தை, தர்மம் மற்றும் மூதாதையர் வீடு பாதிக்கப்பட்டுள்ளது.`;
      case 'zh': return `罗睺占据${h}——象征父亲、法与祖先的宫位受损。`;
      case 'hi': return `राहु ${h} में स्थित है — पिता, धर्म और पूर्वजों का भाव प्रभावित है.`;
      case 'ja': return `ラーフが${h}にある——父・ダルマ・祖先の室が損なわれている。`;
      case 'ko': return `라후가 ${h}에 위치한다 — 아버지, 다르마, 조상의 하우스가 손상되었다.`;
      case 'ar': return `يشغل راهو ${h} — بيت الأب والدارما والأجداد متأثر.`;
      case 'ml': return `രാഹു ${h} ൽ സ്ഥിതി ചെയ്യുന്നു — അച്ഛൻ, ധർമ്മം, പിതൃക്കൾ എന്നിവയുടെ ഭാവം ബാധിക്കപ്പെട്ടിരിക്കുന്നു.`;
      default: return `Rahu occupies the ${h} — the house of father, dharma and ancestors is afflicted.`;
    }
  },
  factorKetu9th: (h: string, lang: Lang) => {
    switch (lang) {
      case 'si': return `කේතු ${h}හි වාසය කරයි — නොවිසඳුණු මුතුන් මිත්තන්ගේ කර්මය දක්වයි.`;
      case 'ta': return `கேது ${h} இல் அமர்ந்துள்ளார் — தீர்க்கப்படாத மூதாதையர் கர்மா குறிக்கப்படுகிறது.`;
      case 'zh': return `计都占据${h}——预示未解决的祖先业力。`;
      case 'hi': return `केतु ${h} में स्थित है — अनसुलझे पैतृक कर्म का संकेत.`;
      case 'ja': return `ケートゥが${h}にある——未解決の祖先のカルマが示されている。`;
      case 'ko': return `케투가 ${h}에 위치한다 — 해결되지 않은 조상의 카르마를 나타낸다.`;
      case 'ar': return `يشغل كيتو ${h} — يشير إلى كارما أسلاف لم تُحل.`;
      case 'ml': return `കേതു ${h} ൽ സ്ഥിതി ചെയ്യുന്നു — പരിഹരിക്കപ്പെടാത്ത പിതൃ കർമ്മം സൂചിപ്പിക്കുന്നു.`;
      default: return `Ketu occupies the ${h} — unresolved ancestral karma is indicated.`;
    }
  },
  factorLordConjunct: (lordName: string, mName: string, lang: Lang) => {
    switch (lang) {
      case 'si': return `9 වන භාවාධිපති (${lordName}) ${mName} සමඟ යුතව සිටී — ධර්ම/මුතුන් මිත්තන්ගේ භාවය පීඩාවට ලක්ව ඇත.`;
      case 'ta': return `9-ஆவது வீட்டு அதிபதி (${lordName}) ${mName} உடன் இணைந்துள்ளார் — தர்மம்/மூதாதையர் வீடு பாதிக்கப்பட்டுள்ளது.`;
      case 'zh': return `第九主星（${lordName}）与${mName}合相——法与祖先之宫受到损害。`;
      case 'hi': return `नवम भाव स्वामी (${lordName}) ${mName} के साथ युति में है — धर्म/पैतृक भाव प्रभावित है.`;
      case 'ja': return `第9室のロード（${lordName}）が${mName}と合を成している——ダルマ／祖先の室が損なわれている。`;
      case 'ko': return `9번째 하우스의 로드 (${lordName})가 ${mName}와 합을 이룬다 — 다르마/조상의 하우스가 손상되었다.`;
      case 'ar': return `رب البيت التاسع (${lordName}) مقارن لـ${mName} — بيت الدارما/الأجداد متأثر.`;
      case 'ml': return `ഒമ്പതാം ഭാവാധിപൻ (${lordName}) ${mName} മായി യോജിച്ചിരിക്കുന്നു — ധർമ്മ/പിതൃ ഭാവം ബാധിക്കപ്പെട്ടിരിക്കുന്നു.`;
      default: return `The 9th lord (${lordName}) is conjunct ${mName} — the dharma/ancestral house is compromised.`;
    }
  },
  factorLordAspect: (mName: string, lordName: string, lang: Lang) => {
    switch (lang) {
      case 'si': return `${mName} 9 වන භාවාධිපති (${lordName}) දෙස බලයි — වාසනාව කෙරෙහි මුතුන් මිත්තන්ගේ පීඩනයකි.`;
      case 'ta': return `${mName} 9-ஆவது வீட்டு அதிபதியை (${lordName}) பார்க்கிறார் — அதிர்ஷ்டத்தில் மூதாதையர் அழுத்தம்.`;
      case 'zh': return `${mName}相位第九主星（${lordName}）——祖先对命运施加压力。`;
      case 'hi': return `${mName} नवम भाव स्वामी (${lordName}) को देखता है — भाग्य पर पैतृक दबाव.`;
      case 'ja': return `${mName}が第9室のロード（${lordName}）にアスペクトしている——幸運への祖先からの重圧。`;
      case 'ko': return `${mName}이 9번째 하우스의 로드 (${lordName})에 어스펙트를 형성한다 — 행운에 대한 조상의 압박.`;
      case 'ar': return `يُشرف ${mName} على رب البيت التاسع (${lordName}) — ضغط الأجداد على الحظ.`;
      case 'ml': return `${mName} ഒമ്പതാം ഭാവാധിപനെ (${lordName}) വീക്ഷിക്കുന്നു — ഭാഗ്യത്തിൽ പിതൃ സമ്മർദ്ദം.`;
      default: return `${mName} aspects the 9th lord (${lordName}) — ancestral pressure on fortune.`;
    }
  },
  cancelJupiterConj: (lang: Lang) => {
    switch (lang) {
      case 'si': return 'ගුරු සූර්ය සමඟ යුතව සිටී — එහි ආශිර්වාදය මුතුන් මිත්තන්ගේ කර්මය සන්සුන් කරයි.';
      case 'ta': return 'குரு சூரியனுடன் இணைந்துள்ளார் — அவரது ஆசி மூதாதையர் கர்மாவை தணிக்கிறது.';
      case 'zh': return '木星与太阳合相——其祝福抚慰了祖先的业力。';
      case 'hi': return 'बृहस्पति सूर्य के साथ युति में है — इसका आशीर्वाद पैतृक कर्म को शांत करता है.';
      case 'ja': return '木星が太陽と合を成している——その祝福が祖先のカルマを和らげる。';
      case 'ko': return '목성이 태양과 합을 이룬다 — 그 축복이 조상의 카르마를 진정시킨다.';
      case 'ar': return 'المشتري مقارن للشمس — بركته تهدئ كارما الأجداد.';
      case 'ml': return 'വ്യാഴം സൂര്യനുമായി യോജിച്ചിരിക്കുന്നു — അതിന്റെ അനുഗ്രഹം പിതൃ കർമ്മത്തെ ശമിപ്പിക്കുന്നു.';
      default: return 'Jupiter is conjunct the Sun — its blessing soothes the ancestral karma.';
    }
  },
  cancelJupiterAspect: (lang: Lang) => {
    switch (lang) {
      case 'si': return 'ගුරු සූර්ය දෙස බලයි — ප්‍රබල ආරක්ෂිත බලපෑමකි.';
      case 'ta': return 'குரு சூரியனைப் பார்க்கிறார் — ஒரு வலுவான பாதுகாப்பு தாக்கம்.';
      case 'zh': return '木星相位太阳——一种强大的保护性影响。';
      case 'hi': return 'बृहस्पति सूर्य को देखता है — एक मज़बूत सुरक्षात्मक प्रभाव.';
      case 'ja': return '木星が太陽にアスペクトしている——強力な保護的影響。';
      case 'ko': return '목성이 태양에 어스펙트를 형성한다 — 강력한 보호적 영향.';
      case 'ar': return 'يُشرف المشتري على الشمس — تأثير حماية قوي.';
      case 'ml': return 'വ്യാഴം സൂര്യനെ വീക്ഷിക്കുന്നു — ശക്തമായ സംരക്ഷണ സ്വാധീനം.';
      default: return 'Jupiter aspects the Sun — a strong protective influence.';
    }
  },
  cancelJupiter9th: (h: string, lang: Lang) => {
    switch (lang) {
      case 'si': return `ගුරු ${h}හි වාසය කරයි — ධර්ම/මුතුන් මිත්තන්ගේ භාවය සඳහා ප්‍රබල ආරක්ෂාවකි.`;
      case 'ta': return `குரு ${h} இல் அமர்ந்துள்ளார் — தர்மம்/மூதாதையர் வீட்டிற்கு சக்திவாய்ந்த பாதுகாப்பு.`;
      case 'zh': return `木星占据${h}——为法与祖先之宫提供强大保护。`;
      case 'hi': return `बृहस्पति ${h} में स्थित है — धर्म/पैतृक भाव के लिए शक्तिशाली सुरक्षा.`;
      case 'ja': return `木星が${h}にある——ダルマ／祖先の室への強力な保護。`;
      case 'ko': return `목성이 ${h}에 위치한다 — 다르마/조상의 하우스에 대한 강력한 보호.`;
      case 'ar': return `يشغل المشتري ${h} — حماية قوية لبيت الدارما/الأجداد.`;
      case 'ml': return `വ്യാഴം ${h} ൽ സ്ഥിതി ചെയ്യുന്നു — ധർമ്മ/പിതൃ ഭാവത്തിന് ശക്തമായ സംരക്ഷണം.`;
      default: return `Jupiter occupies the ${h} — powerful protection for the dharma/ancestral house.`;
    }
  },
  summaryPresent: (severity: string, lang: Lang) => {
    switch (lang) {
      case 'si': return `පිත්‍ර දෝෂය දක්වයි (${severity}) — මුතුන් මිත්තන් හා සම්බන්ධ කාර්මික ණයක් වන අතර, එය වාසනාව, දරු පරපුර හෝ පිතෘ පෙළපතේ බාධක ලෙස මතු විය හැක.`;
      case 'ta': return `பித்ரு தோஷம் குறிக்கப்படுகிறது (${severity}) — மூதாதையருடன் தொடர்புடைய கர்ம கடன், இது அதிர்ஷ்டம், சந்ததி அல்லது தந்தை வழியில் தடைகளாக வெளிப்படலாம்.`;
      case 'zh': return `显示存在皮特拉多沙（${severity}）——与祖先相关的业力债务，可能表现为命运、子嗣或父系方面的障碍。`;
      case 'hi': return `पितृ दोष का संकेत है (${severity}) — पूर्वजों से जुड़ा एक कर्म ऋण जो भाग्य, संतान या पैतृक वंश में बाधाओं के रूप में उभर सकता है.`;
      case 'ja': return `ピトラ・ドーシャが示されている（${severity}）——祖先に結びついたカルマの負債であり、幸運、子孫、あるいは父系に障害として現れることがある。`;
      case 'ko': return `피트라 도샤가 나타난다 (${severity}) — 조상과 관련된 카르마적 부채로, 행운, 자손, 또는 부계 혈통에 장애로 나타날 수 있다.`;
      case 'ar': return `تظهر دوشا بيترا (${severity}) — دين كارمي مرتبط بالأجداد قد يظهر كعقبات في الحظ أو النسل أو خط الأب.`;
      case 'ml': return `പിതൃ ദോഷം സൂചിപ്പിക്കുന്നു (${severity}) — പിതൃക്കളുമായി ബന്ധപ്പെട്ട ഒരു കാർമിക കടം, ഇത് ഭാഗ്യം, സന്താനങ്ങൾ, അല്ലെങ്കിൽ പിതൃപരമ്പര എന്നിവയിൽ തടസ്സങ്ങളായി പ്രത്യക്ഷപ്പെടാം.`;
      default: return `Pitra Dosha is indicated (${severity}) — a karmic debt linked to ancestors that can surface as obstacles in fortune, progeny, or the paternal line.`;
    }
  },
  summaryAbsent: (lang: Lang) => {
    switch (lang) {
      case 'si': return 'පැහැදිලි පිත්‍ර දෝෂයක් නොමැත — සූර්ය හා 9 වන භාවය සාමාන්‍ය පීඩාවලින් නිදහස්ය.';
      case 'ta': return 'தெளிவான பித்ரு தோஷம் இல்லை — சூரியனும் 9-ஆவது வீடும் வழக்கமான பாதிப்புகளிலிருந்து விடுபட்டுள்ளன.';
      case 'zh': return '没有明显的皮特拉多沙——太阳与第九宫都不受常见损害的影响。';
      case 'hi': return 'कोई स्पष्ट पितृ दोष नहीं — सूर्य और नवम भाव सामान्य पीड़ाओं से मुक्त हैं.';
      case 'ja': return '明確なピトラ・ドーシャはない——太陽と第9室は通常の障害を受けていない。';
      case 'ko': return '명확한 피트라 도샤는 없다 — 태양과 9번째 하우스가 일반적인 손상에서 자유롭다.';
      case 'ar': return 'لا توجد دوشا بيترا واضحة — الشمس والبيت التاسع خاليان من الإصابات المعتادة.';
      case 'ml': return 'വ്യക്തമായ പിതൃ ദോഷമില്ല — സൂര്യനും ഒമ്പതാം ഭാവവും സാധാരണ ബാധകളിൽ നിന്ന് മുക്തമാണ്.';
      default: return 'No clear Pitra Dosha — the Sun and the 9th house are free of the usual afflictions.';
    }
  },
  remedy: (lang: Lang) => {
    switch (lang) {
      case 'si': return 'මුතුන් මිත්තන් සඳහා ශ්‍රාද්ධ හා තර්පණ (විශේෂයෙන් පිත්‍ර පක්ෂයේදී), කපුටන් හා බ්‍රාහ්මණයන්ට ආහාර සැපයීම, හා පියාගේ නමින් පුණ්‍ය දීමනා සම්ප්‍රදායික පිළියම් වේ.';
      case 'ta': return 'மூதாதையருக்கான ஸ்ராத்தம் மற்றும் தர்பணம் (குறிப்பாக பித்ரு பக்ஷத்தில்), காகங்கள் மற்றும் பிராமணர்களுக்கு உணவளித்தல், மற்றும் தந்தையின் பெயரில் தானம் ஆகியவை பாரம்பரிய பரிகாரங்கள்.';
      case 'zh': return '为祖先举行沙尔达和达尔潘仪式（尤其在祖先节期间）、施食乌鸦和婆罗门，以及以父亲之名行善是传统的化解方法。';
      case 'hi': return 'पूर्वजों के लिए श्राद्ध और तर्पण (विशेष रूप से पितृ पक्ष में), कौओं और ब्राह्मणों को भोजन कराना, और पिता के नाम पर दान पारंपरिक उपाय हैं.';
      case 'ja': return '祖先へのシュラッダとタルパン（特にピトゥル・パクシャの期間）、カラスやバラモンへの給餌、そして父の名による慈善が伝統的な対処法である。';
      case 'ko': return '조상을 위한 슈라다와 타르판 (특히 피트루 팍샤 기간), 까마귀와 브라만에게 음식 공양, 그리고 아버지의 이름으로 하는 자선이 전통적인 치유법이다.';
      case 'ar': return 'شراددا وتربان للأجداد (خاصة في بيترو باكشا)، وإطعام الغربان والبراهمة، والصدقة باسم الأب هي العلاجات التقليدية.';
      case 'ml': return 'പിതൃക്കൾക്കുള്ള ശ്രാദ്ധവും തർപ്പണവും (പ്രത്യേകിച്ച് പിതൃപക്ഷത്തിൽ), കാക്കകൾക്കും ബ്രാഹ്മണർക്കും ഭക്ഷണം നൽകലും, അച്ഛന്റെ പേരിൽ ദാനധർമ്മവും പരമ്പരാഗത പരിഹാരങ്ങളാണ്.';
      default: return "Shraddha and Tarpan for ancestors (especially in Pitru Paksha), feeding crows and brahmins, and charity in the father's name are the classical remedies.";
    }
  },
};

export function checkPitraDosha(pos: DoshaPositions, lang: Lang = 'en'): DoshaCheck {
  const { lagnaRashi, planets } = pos;
  const sun = planets.Sun, rahu = planets.Rahu, ketu = planets.Ketu, sat = planets.Saturn, jup = planets.Jupiter;

  const factors: string[] = [];
  if (sameRashi(sun, rahu)) factors.push(PITRA_TEXT.factorSunRahu(lang));
  if (sameRashi(sun, ketu)) factors.push(PITRA_TEXT.factorSunKetu(lang));
  if (sameRashi(sun, sat)) factors.push(PITRA_TEXT.factorSunSaturn(lang));

  const rahuH = houseFrom(rahu.rashi, lagnaRashi);
  const ketuH = houseFrom(ketu.rashi, lagnaRashi);
  if (rahuH === 9) factors.push(PITRA_TEXT.factorRahu9th(houseLabel(9, lang), lang));
  if (ketuH === 9) factors.push(PITRA_TEXT.factorKetu9th(houseLabel(9, lang), lang));

  // 9th lord afflicted by Rahu/Ketu/Saturn (conjunction or aspect).
  const ninthRashi = (lagnaRashi + 8) % 12;
  const ninthLordName = RASHI_LORDS[RASHIS[ninthRashi]];
  const ninthLord = planets[ninthLordName];
  if (ninthLord) {
    for (const [mName, m] of [['Rahu', rahu], ['Ketu', ketu], ['Saturn', sat]] as [string, DoshaPlanet][]) {
      if (sameRashi(ninthLord, m)) factors.push(PITRA_TEXT.factorLordConjunct(ninthLordName, mName, lang));
      else if (aspects(m, mName, ninthLord)) factors.push(PITRA_TEXT.factorLordAspect(mName, ninthLordName, lang));
    }
  }

  const cancellations: string[] = [];
  if (sameRashi(jup, sun)) cancellations.push(PITRA_TEXT.cancelJupiterConj(lang));
  else if (aspects(jup, 'Jupiter', sun)) cancellations.push(PITRA_TEXT.cancelJupiterAspect(lang));
  if (houseFrom(jup.rashi, lagnaRashi) === 9) cancellations.push(PITRA_TEXT.cancelJupiter9th(houseLabel(9, lang), lang));

  const present = factors.length > 0;
  const severity = severityFromCount(factors.length, cancellations.length);

  return {
    key: 'pitra',
    name: DOSHA_NAME.pitra[lang],
    present,
    severity,
    summary: present
      ? PITRA_TEXT.summaryPresent(SEVERITY_WORD[severity][lang], lang)
      : PITRA_TEXT.summaryAbsent(lang),
    factors,
    cancellations,
    remedy: PITRA_TEXT.remedy(lang),
  };
}

// ─── Sade Sati timeline ──────────────────────────────────────────────────────

export type SadeSatiPhaseName = 'rising' | 'peak' | 'setting';

export interface SadeSatiPhase {
  phase: SadeSatiPhaseName;
  sign: number;
  signName: string;
  houseFromMoon: number; // 12, 1, or 2
  start: string;         // ISO
  end: string;           // ISO
}

export interface SadeSatiPeriod {
  start: string;
  end: string;
  phases: SadeSatiPhase[];
  status: 'past' | 'current' | 'upcoming';
}

const PHASE_BY_HOUSE: Record<number, SadeSatiPhaseName> = { 12: 'rising', 1: 'peak', 2: 'setting' };

/**
 * Build Sade Sati periods from a Saturn rashi time-series. `samples` must be in
 * ascending date order and dense enough to catch each sign change (≈30-day
 * steps work — Saturn holds a sign ≈2.5 years).
 */
export function buildSadeSatiTimeline(
  natalMoonRashi: number,
  samples: { date: Date; rashi: number }[],
  now: Date = new Date(),
): SadeSatiPeriod[] {
  const inZone = (rashi: number) => [12, 1, 2].includes(houseFrom(rashi, natalMoonRashi));

  const periods: SadeSatiPeriod[] = [];
  let cur: { phases: SadeSatiPhase[]; phaseStartIdx: number } | null = null;
  let phaseHouse = -1;
  let phaseStart: Date | null = null;
  let phaseSign = -1;

  const closePhase = (endDate: Date) => {
    if (cur && phaseStart && phaseHouse !== -1) {
      cur.phases.push({
        phase: PHASE_BY_HOUSE[phaseHouse],
        sign: phaseSign,
        signName: RASHIS[phaseSign],
        houseFromMoon: phaseHouse,
        start: phaseStart.toISOString(),
        end: endDate.toISOString(),
      });
    }
  };

  for (let i = 0; i < samples.length; i++) {
    const s = samples[i];
    const active = inZone(s.rashi);
    const house = houseFrom(s.rashi, natalMoonRashi);

    if (active) {
      if (!cur) { cur = { phases: [], phaseStartIdx: i }; phaseHouse = -1; }
      if (house !== phaseHouse) {
        closePhase(s.date);
        phaseHouse = house;
        phaseStart = s.date;
        phaseSign = s.rashi;
      }
    } else if (cur) {
      closePhase(s.date);
      const start = cur.phases[0]?.start ?? samples[cur.phaseStartIdx].date.toISOString();
      const end = cur.phases[cur.phases.length - 1]?.end ?? s.date.toISOString();
      periods.push({ start, end, phases: cur.phases, status: 'past' });
      cur = null; phaseHouse = -1; phaseStart = null;
    }
  }
  // Close an open period running past the sample window.
  if (cur) {
    closePhase(samples[samples.length - 1].date);
    const start = cur.phases[0]?.start ?? samples[cur.phaseStartIdx].date.toISOString();
    const end = cur.phases[cur.phases.length - 1]?.end ?? samples[samples.length - 1].date.toISOString();
    periods.push({ start, end, phases: cur.phases, status: 'past' });
  }

  // Tag each period relative to now.
  const nowMs = now.getTime();
  for (const p of periods) {
    const s = new Date(p.start).getTime();
    const e = new Date(p.end).getTime();
    p.status = nowMs < s ? 'upcoming' : nowMs > e ? 'past' : 'current';
  }
  return periods;
}
