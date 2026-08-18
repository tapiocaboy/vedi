/**
 * Prose for the cross-varga (Vimsopaka Bala) layer, in all nine supported
 * languages.
 *
 * Same convention as the other text modules: functions rather than
 * templates, so each language can reorder or drop clauses rather than being
 * forced into English word order. Varga codes (D1, D9, D30…) and the term
 * "Vimsopaka Bala" itself are left as-is in every language — that is how
 * they are written in every tradition's own astrological material, Vedic or
 * not. "Vargottama" is likewise kept as a transliteration everywhere; only
 * the languages with their own living Vedic-astrology tradition (Sinhala,
 * Tamil, Hindi, Malayalam) render it in their own script.
 */

import type { Lang } from '../i18n';

const GRADE_WORD: Record<string, Record<Lang, string>> = {
  exceptional: { en: 'exceptional', si: 'අසාමාන්‍ය', ta: 'விதிவிலக்கான', zh: '卓越', hi: 'असाधारण', ja: '卓越', ko: '탁월함', ar: 'استثنائي', ml: 'അസാധാരണം' },
  strong:      { en: 'strong',      si: 'ප්‍රබල',    ta: 'பலமான',       zh: '强',   hi: 'प्रबल',    ja: '強い', ko: '강함',   ar: 'قوي',      ml: 'ശക്തം' },
  moderate:    { en: 'moderate',    si: 'මධ්‍යස්ථ',   ta: 'மிதமான',      zh: '中等', hi: 'मध्यम',    ja: '中程度', ko: '보통',   ar: 'متوسط',    ml: 'മിതമായ' },
  weak:        { en: 'weak',        si: 'දුර්වල',     ta: 'பலவீனமான',    zh: '弱',   hi: 'कमज़ोर',   ja: '弱い', ko: '약함',   ar: 'ضعيف',     ml: 'ദുർബലം' },
};

/** "own sign or exalted", the recurring dignity phrase. */
const OWN_OR_EXALTED: Record<Lang, string> = {
  en: 'own sign or exalted', si: 'ස්වක්ෂේත්‍ර හෝ උච්ච', ta: 'சொந்த ராசி அல்லது உச்சம்',
  zh: '本宫或擢升', hi: 'स्वराशि या उच्च', ja: '自室または高揚', ko: '본좌 또는 고양',
  ar: 'في برجه الخاص أو شرفه', ml: 'സ്വന്തം രാശിയിലോ ഉച്ചത്തിലോ',
};

/** "vargottama" itself, transliterated into each script. */
const VARGOTTAMA_WORD: Record<Lang, string> = {
  en: 'vargottama', si: 'වර්ගෝත්තම', ta: 'வர்கோத்தமம்', zh: '瓦尔戈塔玛', hi: 'वर्गोत्तम',
  ja: 'ヴァルゴッタマ', ko: '바르고타마', ar: 'فارغوتاما', ml: 'വർഗോത്തമം',
};

export const VS_FRAMES = {
  gradeWord: (grade: string, lang: Lang) => GRADE_WORD[grade][lang],

  /** One planet's cross-varga standing. */
  planet: (a: {
    planet: string; vimsopaka: string; grade: string;
    dignifiedIn: string[]; isVargottama: boolean; lang: Lang;
  }): string => {
    const g = VS_FRAMES.gradeWord(a.grade, a.lang);
    const list = a.dignifiedIn.join(', ');
    const own = OWN_OR_EXALTED[a.lang];
    const varg = VARGOTTAMA_WORD[a.lang];
    switch (a.lang) {
      case 'si':
        return [
          `${a.planet}: විංශෝපක බලය ${a.vimsopaka}/20 (${g}).`,
          a.dignifiedIn.length ? ` ${list} වර්ගවල ${own}.` : '',
          a.isVargottama ? ` ${varg}යි — D1 හා D9 එකම රාශියේ, එබැවින් මෙම පිහිටීම ස්ථිරය.` : '',
        ].join('');
      case 'ta':
        return [
          `${a.planet}: விம்சோபக பலம் ${a.vimsopaka}/20 (${g}).`,
          a.dignifiedIn.length ? ` ${list} வர்கங்களில் ${own}.` : '',
          a.isVargottama ? ` ${varg} — D1 மற்றும் D9 ஒரே ராசியில், எனவே இந்த அமைவு உறுதியானது.` : '',
        ].join('');
      case 'zh':
        return [
          `${a.planet}：维姆索帕卡力 ${a.vimsopaka}/20（${g}）。`,
          a.dignifiedIn.length ? `在 ${list} 中${own}。` : '',
          a.isVargottama ? `是${varg} — D1 与 D9 同宫，此配置因而稳固持久。` : '',
        ].join('');
      case 'hi':
        return [
          `${a.planet}: विंशोपक बल ${a.vimsopaka}/20 (${g}).`,
          a.dignifiedIn.length ? ` ${list} वर्गों में ${own}.` : '',
          a.isVargottama ? ` ${varg} है — D1 और D9 एक ही राशि में, इसलिए यह स्थिति स्थिर है.` : '',
        ].join('');
      case 'ja':
        return [
          `${a.planet}：ヴィムショーパカ・バラ ${a.vimsopaka}/20（${g}）。`,
          a.dignifiedIn.length ? `${list} で${own}。` : '',
          a.isVargottama ? `${varg} — D1 と D9 が同じサインで、この配置は生涯を通じて安定している。` : '',
        ].join('');
      case 'ko':
        return [
          `${a.planet}: 빔쇼파카 발라 ${a.vimsopaka}/20 (${g}).`,
          a.dignifiedIn.length ? ` ${list}에서 ${own}.` : '',
          a.isVargottama ? ` ${varg} — D1과 D9가 같은 별자리에 있어, 이 배치는 평생 확고하게 유지된다.` : '',
        ].join('');
      case 'ar':
        return [
          `${a.planet}: قوة فيمشوباكا بالا ${a.vimsopaka}/20 (${g}).`,
          a.dignifiedIn.length ? ` ${own} في ${list}.` : '',
          a.isVargottama ? ` ${varg} — نفس البرج في D1 وD9، لذا هذا الوضع ثابت مدى الحياة.` : '',
        ].join('');
      case 'ml':
        return [
          `${a.planet}: വിംശോപക ബലം ${a.vimsopaka}/20 (${g}).`,
          a.dignifiedIn.length ? ` ${list} വർഗങ്ങളിൽ ${own}.` : '',
          a.isVargottama ? ` ${varg} — D1 ഉം D9 ഉം ഒരേ രാശിയിൽ, അതിനാൽ ഈ സ്ഥാനം സ്ഥിരമാണ്.` : '',
        ].join('');
      default:
        return [
          `${a.planet}: Vimsopaka Bala ${a.vimsopaka}/20 (${g}).`,
          a.dignifiedIn.length ? ` Own sign or exalted in ${list}.` : '',
          a.isVargottama ? ' Vargottama — same sign in D1 and D9, so this placement is locked in.' : '',
        ].join('');
    }
  },

  /** The chart's structural pillar. */
  pillar: (a: { planet: string; vargas: string[]; vimsopaka: string; lang: Lang }): string => {
    const list = a.vargas.join(', ');
    switch (a.lang) {
      case 'si':
        return `${a.planet} මෙම කේන්දරයේ ව්‍යුහාත්මක කුලුනයි: ${list} යන වර්ගවල ස්වක්ෂේත්‍ර හෝ උච්ච වී, විංශෝපක බලය ${a.vimsopaka}/20. රාශි කේන්දරයේ එය කැපී නොපෙනුණත්, ජීවිතයේ බර උසුලන්නේ එයයි — ක්‍රමයෙන් ගොඩනැගීම, ඉවසීම හා දෙවන වර උත්සාහයෙන් ලැබෙන ඵල.`;
      case 'ta':
        return `${a.planet} இந்த ஜாதகத்தின் கட்டமைப்பு தூணாகும்: ${list} வர்கங்களில் சொந்த ராசி அல்லது உச்சத்தில் இருந்து, விம்சோபக பலம் ${a.vimsopaka}/20. ராசி கட்டத்தில் அது குறிப்பிடத்தக்கதாகத் தெரியாவிட்டாலும், வாழ்க்கையின் சுமையைத் தாங்குவது இதுவே — மெதுவான உருவாக்கம், பொறுமை, இரண்டாவது முயற்சியில் கிடைக்கும் பலன்.`;
      case 'zh':
        return `${a.planet}是这份星盘的结构支柱：在 ${list} 各分宫图中本宫或擢升，维姆索帕卡力达 ${a.vimsopaka}/20。它在本命盘中或许并不显眼，却是真正承重的那一个——缓慢积累、坚韧持久，成果往往在第二次尝试才会到来，而非第一次。`;
      case 'hi':
        return `${a.planet} इस कुंडली का संरचनात्मक स्तंभ है: ${list} वर्गों में स्वराशि या उच्च, विंशोपक बल ${a.vimsopaka}/20. राशि कुंडली में यह भले ही साधारण दिखे, पर भार यही उठाता है — धीमा निर्माण, धैर्य, और परिणाम जो पहले नहीं, दूसरे प्रयास में मिलते हैं.`;
      case 'ja':
        return `${a.planet}はこのホロスコープの構造的な支柱である：${list} の各分割図で自室または高揚し、ヴィムショーパカ・バラは ${a.vimsopaka}/20。出生図では目立たなくても、実際に重みを支えているのはこの惑星であり、ゆっくりとした積み上げ、忍耐、そして一度目ではなく二度目の挑戦で訪れる成果を表す。`;
      case 'ko':
        return `${a.planet}는 이 차트의 구조적 기둥이다: ${list} 바르가들에서 본좌 또는 고양되어 있으며, 빔쇼파카 발라는 ${a.vimsopaka}/20이다. 라시 차트에서는 눈에 띄지 않을 수 있지만, 실제로 무게를 지탱하는 것은 이 행성이다 — 느린 축적, 인내, 그리고 처음이 아니라 두 번째 시도에서 찾아오는 결실.`;
      case 'ar':
        return `${a.planet} هو الركيزة البنيوية لهذا المخطط الفلكي: في برجه الخاص أو شرفه عبر ${list}، بقوة فيمشوباكا بالا ${a.vimsopaka}/20. قد يبدو غير لافت في مخطط الراشي، لكنه من يحمل الثقل الحقيقي — بناء بطيء، وصبر، ونتائج تصل في المحاولة الثانية لا الأولى.`;
      case 'ml':
        return `${a.planet} ഈ ജാതകത്തിന്റെ ഘടനാപരമായ തൂണാണ്: ${list} വർഗങ്ങളിൽ സ്വന്തം രാശിയിലോ ഉച്ചത്തിലോ നിന്ന്, വിംശോപക ബലം ${a.vimsopaka}/20. രാശി ചക്രത്തിൽ ഇത് പ്രകടമായി തോന്നിയില്ലെങ്കിലും, ഭാരം ചുമക്കുന്നത് ഇതാണ് — സാവധാനത്തിലുള്ള കെട്ടിപ്പടുക്കൽ, ക്ഷമ, രണ്ടാം ശ്രമത്തിൽ ലഭിക്കുന്ന ഫലങ്ങൾ.`;
      default:
        return `${a.planet} is this chart's structural pillar: own sign or exalted across ${list}, for a Vimsopaka Bala of ${a.vimsopaka}/20. It may look unremarkable in the rashi chart, but it is what carries the weight — slow consolidation, endurance, and results that arrive on the second attempt rather than the first.`;
    }
  },

  /** The navamsa lagna lord holding up the navamsa. */
  navamsaAnchor: (a: {
    planet: string; navamsaLagna: string; exalted: boolean; inLagna: boolean; lang: Lang;
  }): string => {
    switch (a.lang) {
      case 'si':
        return `නවාංශක ලග්නය ${a.navamsaLagna} වන අතර එහි අධිපති ${a.planet} නවාංශකයේ ${a.exalted ? 'උච්ච' : 'ස්වක්ෂේත්‍ර'} වී ඇත${a.inLagna ? ' — එයද නවාංශක ලග්නයේම' : ''}. සමස්ත වර්ග ව්‍යුහය ${a.planet} වෙතට යළි යොමු වේ.`;
      case 'ta':
        return `நவாம்ச லக்னம் ${a.navamsaLagna}; அதன் அதிபதி ${a.planet} நவாம்சத்தில் ${a.exalted ? 'உச்சம்' : 'சொந்த ராசி'} பெற்றுள்ளார்${a.inLagna ? ' — அதுவும் நவாம்ச லக்னத்திலேயே' : ''}. முழு வர்க அமைப்பும் ${a.planet}-ஐ மையமாகக் கொண்டு திரும்புகிறது.`;
      case 'zh':
        return `那婆姆萨（D9）上升点是 ${a.navamsaLagna}，其主星 ${a.planet} 在那婆姆萨中${a.exalted ? '擢升' : '本宫'}${a.inLagna ? '——且正落在那婆姆萨上升点本身' : ''}。整个分宫图结构最终都归结于 ${a.planet}。`;
      case 'hi':
        return `नवांश लग्न ${a.navamsaLagna} है और उसका स्वामी ${a.planet} नवांश में ${a.exalted ? 'उच्च' : 'स्वराशि'} में है${a.inLagna ? ' — और वह भी नवांश लग्न में ही' : ''}. सम्पूर्ण वर्ग संरचना ${a.planet} पर आकर टिकती है.`;
      case 'ja':
        return `ナヴァムシャ・ラグナは ${a.navamsaLagna} であり、そのロード ${a.planet} はナヴァムシャで${a.exalted ? '高揚' : '自室'}している${a.inLagna ? '——しかもナヴァムシャ・ラグナそのものに在住' : ''}。ヴァルガ全体の構造は最終的に ${a.planet} に帰着する。`;
      case 'ko':
        return `나밤샤 라그나는 ${a.navamsaLagna}이며, 그 지배성 ${a.planet}은 나밤샤에서 ${a.exalted ? '고양' : '본좌'}되어 있다${a.inLagna ? ' — 게다가 나밤샤 라그나 자체에 위치한다' : ''}. 전체 바르가 구조는 결국 ${a.planet}으로 귀결된다.`;
      case 'ar':
        return `طالع النافامسا هو ${a.navamsaLagna}، وربّه ${a.planet} في شرفه${a.exalted ? '' : ' ببرجه الخاص'} في النافامسا${a.inLagna ? ' — بل وواقع في طالع النافامسا نفسه' : ''}. تعود بنية الأبراج الفرعية كلها في النهاية إلى ${a.planet}.`;
      case 'ml':
        return `നവാംശ ലഗ്നം ${a.navamsaLagna} ആണ്; അതിന്റെ അധിപൻ ${a.planet} നവാംശത്തിൽ ${a.exalted ? 'ഉച്ചത്തിൽ' : 'സ്വന്തം രാശിയിൽ'} ആണ്${a.inLagna ? ' — അതും നവാംശ ലഗ്നത്തിൽ തന്നെ' : ''}. മുഴുവൻ വർഗ ഘടനയും ${a.planet}-ലേക്ക് തിരിച്ചെത്തുന്നു.`;
      default:
        return `The navamsa lagna is ${a.navamsaLagna} and its lord ${a.planet} is ${a.exalted ? 'exalted' : 'in its own sign'} in the navamsa${a.inLagna ? ' — and in the navamsa lagna itself' : ''}. The whole varga structure resolves back to ${a.planet}.`;
    }
  },

  /**
   * The strongest planet by Vimsopaka, used when no planet clears both the
   * repetition and the strength bar for pillar status.
   */
  strongest: (a: {
    planet: string; vimsopaka: string; grade: string;
    vargottama: boolean; dignifiedIn: string[]; lang: Lang;
  }): string => {
    const g = VS_FRAMES.gradeWord(a.grade, a.lang);
    const varg = VARGOTTAMA_WORD[a.lang];
    const own = OWN_OR_EXALTED[a.lang];
    const extras: string[] = [];
    switch (a.lang) {
      case 'si':
        if (a.vargottama) extras.push(`${varg}යි`);
        if (a.dignifiedIn.length) extras.push(`${a.dignifiedIn.join(', ')} වල ${own}`);
        return `වර්ග හරහා ප්‍රබලම ග්‍රහයා ${a.planet} ය — විංශෝපක බලය ${a.vimsopaka}/20, ${g}${extras.length ? ` (${extras.join('; ')})` : ''}. කිසිදු ග්‍රහයෙක් වර්ග කිහිපයක පුනරාවර්තනය හා සමස්ත ශක්තිය යන දෙකම එකවර නොදරන බැවින්, මෙම කේන්දරයට එක් පැහැදිලි ව්‍යුහාත්මක කුලුනක් නොමැත.`;
      case 'ta':
        if (a.vargottama) extras.push(varg);
        if (a.dignifiedIn.length) extras.push(`${a.dignifiedIn.join(', ')} இல் ${own}`);
        return `வர்கங்கள் முழுவதும் மிகவும் பலமான கிரகம் ${a.planet} — விம்சோபக பலம் ${a.vimsopaka}/20, ${g}${extras.length ? ` (${extras.join('; ')})` : ''}. எந்தக் கிரகமும் பல வர்கங்களில் மறுபடியும் தோன்றுவதையும் ஒட்டுமொத்த பலத்தையும் ஒரே நேரத்தில் பெறாததால், இந்த ஜாதகத்திற்கு தனித்த கட்டமைப்புத் தூண் இல்லை.`;
      case 'zh':
        if (a.vargottama) extras.push(VARGOTTAMA_WORD.zh);
        if (a.dignifiedIn.length) extras.push(`在 ${a.dignifiedIn.join(', ')} 中${own}`);
        return `${a.planet} 是各分宫图中最强的行星——维姆索帕卡力 ${a.vimsopaka}/20，${g}${extras.length ? `（${extras.join('；')}）` : ''}。没有任何一颗行星同时具备跨分宫图的重复性与整体力量，因此这份星盘没有单一明确的结构支柱。`;
      case 'hi':
        if (a.vargottama) extras.push(`${varg} है`);
        if (a.dignifiedIn.length) extras.push(`${a.dignifiedIn.join(', ')} में ${own}`);
        return `वर्गों में सबसे प्रबल ग्रह ${a.planet} है — विंशोपक बल ${a.vimsopaka}/20, ${g}${extras.length ? ` (${extras.join('; ')})` : ''}. कोई भी ग्रह कई वर्गों में पुनरावृत्ति और समग्र बल दोनों एक साथ नहीं रखता, इसलिए इस कुंडली का कोई एक स्पष्ट संरचनात्मक स्तंभ नहीं है.`;
      case 'ja':
        if (a.vargottama) extras.push(varg);
        if (a.dignifiedIn.length) extras.push(`${a.dignifiedIn.join('、')} で${own}`);
        return `全ヴァルガの中で最も強い惑星は ${a.planet} — ヴィムショーパカ・バラ ${a.vimsopaka}/20、${g}${extras.length ? `（${extras.join('；')}）` : ''}。複数のヴァルガでの反復と全体的な強さの両方を同時に備えた惑星はなく、このホロスコープには単一の明確な構造的支柱は存在しない。`;
      case 'ko':
        if (a.vargottama) extras.push(varg);
        if (a.dignifiedIn.length) extras.push(`${a.dignifiedIn.join(', ')}에서 ${own}`);
        return `모든 바르가에 걸쳐 가장 강한 행성은 ${a.planet} — 빔쇼파카 발라 ${a.vimsopaka}/20, ${g}${extras.length ? ` (${extras.join('; ')})` : ''}. 여러 바르가에서의 반복성과 전체적인 힘을 동시에 갖춘 행성이 없어, 이 차트에는 단일하고 명확한 구조적 기둥이 없다.`;
      case 'ar':
        if (a.vargottama) extras.push(varg);
        if (a.dignifiedIn.length) extras.push(`${own} في ${a.dignifiedIn.join(', ')}`);
        return `أقوى كوكب عبر الأبراج الفرعية هو ${a.planet} — بقوة فيمشوباكا بالا ${a.vimsopaka}/20، ${g}${extras.length ? ` (${extras.join('؛ ')})` : ''}. لا يجمع أي كوكب بين التكرار عبر عدة أبراج فرعية والقوة الإجمالية معًا، لذا لا تملك هذه الخريطة ركيزة بنيوية واحدة واضحة.`;
      case 'ml':
        if (a.vargottama) extras.push(`${varg}ം`);
        if (a.dignifiedIn.length) extras.push(`${a.dignifiedIn.join(', ')} ൽ ${own}`);
        return `വർഗങ്ങളിലുടനീളം ഏറ്റവും ശക്തമായ ഗ്രഹം ${a.planet} ആണ് — വിംശോപക ബലം ${a.vimsopaka}/20, ${g}${extras.length ? ` (${extras.join('; ')})` : ''}. ഒന്നിലധികം വർഗങ്ങളിലെ ആവർത്തനവും മൊത്തത്തിലുള്ള ബലവും ഒരുമിച്ച് ഒരു ഗ്രഹത്തിനും ഇല്ലാത്തതിനാൽ, ഈ ജാതകത്തിന് ഒരൊറ്റ വ്യക്തമായ ഘടനാപരമായ തൂൺ ഇല്ല.`;
      default: {
        if (a.vargottama) extras.push('vargottama');
        if (a.dignifiedIn.length) extras.push(`own sign or exalted in ${a.dignifiedIn.join(', ')}`);
        const tail = extras.length ? ` (${extras.join('; ')})` : '';
        return `${a.planet} is the strongest planet across the vargas — Vimsopaka Bala ${a.vimsopaka}/20, ${g}${tail}. No planet holds both cross-varga repetition and overall strength at once, so this chart has no single structural pillar.`;
      }
    }
  },

  /**
   * Dignified across several divisions but weak on the measure. Reported because
   * the repetition is real, and phrased so it cannot be mistaken for strength.
   */
  repetitionWithoutStrength: (a: { planet: string; vargas: string[]; vimsopaka: string; lang: Lang }): string => {
    const list = a.vargas.join(', ');
    switch (a.lang) {
      case 'si':
        return `${a.planet} ${list} වල ස්වක්ෂේත්‍ර හෝ උච්ච වේ, එහෙත් විංශෝපක බලය ${a.vimsopaka}/20 පමණි — කේන්දරයේ මධ්‍යස්ථ අගයට වඩා පහළ. පුනරාවර්තනය සැබෑ නමුත් එය ශක්තිය නොවේ; මෙය කුලුනක් ලෙස නොකියවන්න.`;
      case 'ta':
        return `${a.planet} ${list} இல் சொந்த ராசி அல்லது உச்சம் பெற்றுள்ளது, ஆனால் விம்சோபக பலம் ${a.vimsopaka}/20 மட்டுமே — இந்த ஜாதகத்தின் நடுநிலை மதிப்பிற்குக் கீழ். மறுபடியும் தோன்றுவது உண்மைதான், ஆனால் அது பலம் அல்ல; இதைத் தூணாகக் கருத வேண்டாம்.`;
      case 'zh':
        return `${a.planet} 在 ${list} 中本宫或擢升，但维姆索帕卡力仅为 ${a.vimsopaka}/20——低于本命盘的中位值。这种重复是真实存在的，但它不等于力量；不要把它当作结构支柱来解读。`;
      case 'hi':
        return `${a.planet} ${list} में स्वराशि या उच्च है, पर विंशोपक बल केवल ${a.vimsopaka}/20 है — इस कुंडली के मध्य मान से नीचे. पुनरावृत्ति वास्तविक है पर वह बल नहीं है; इसे स्तंभ की तरह न पढ़ें.`;
      case 'ja':
        return `${a.planet} は ${list} で自室または高揚しているが、ヴィムショーパカ・バラはわずか ${a.vimsopaka}/20 — このホロスコープの中央値を下回る。反復は本物だが、それは強さではない。これを支柱として読んではならない。`;
      case 'ko':
        return `${a.planet}은 ${list}에서 본좌 또는 고양되어 있지만, 빔쇼파카 발라는 겨우 ${a.vimsopaka}/20 — 이 차트의 중앙값보다 낮다. 반복은 사실이지만 그것이 곧 힘은 아니다. 이를 기둥으로 읽어서는 안 된다.`;
      case 'ar':
        return `${a.planet} ${OWN_OR_EXALTED.ar} في ${list}، لكن قوة فيمشوباكا بالا لا تتجاوز ${a.vimsopaka}/20 — أقل من الوسيط في هذه الخريطة. التكرار حقيقي لكنه ليس قوة؛ لا تقرأ هذا كركيزة بنيوية.`;
      case 'ml':
        return `${a.planet} ${list} ൽ സ്വന്തം രാശിയിലോ ഉച്ചത്തിലോ ആണ്, പക്ഷേ വിംശോപക ബലം ${a.vimsopaka}/20 മാത്രം — ഈ ജാതകത്തിന്റെ ശരാശരി മൂല്യത്തിന് താഴെ. ആവർത്തനം യാഥാർത്ഥ്യമാണ്, പക്ഷേ അത് ബലമല്ല; ഇതിനെ ഒരു തൂണായി വായിക്കരുത്.`;
      default:
        return `${a.planet} holds own sign or exaltation in ${list}, but scores only ${a.vimsopaka}/20 — below this chart's median. The repetition is real and it is not strength; do not read it as a pillar.`;
    }
  },

  vargottamaPresent: (planets: string, plural: boolean, lang: Lang): string => {
    const varg = VARGOTTAMA_WORD[lang];
    switch (lang) {
      case 'si':
        return `${planets} ${varg}යි — D1 හා D9 එකම රාශියේ. ${plural ? 'මෙම පිහිටීම්' : 'මෙම පිහිටීම'} ජීවිතය පුරා ස්ථිරව පවතී.`;
      case 'ta':
        return `${planets} ${varg} — D1 மற்றும் D9 ஒரே ராசியில். ${plural ? 'இந்த அமைவுகள்' : 'இந்த அமைவு'} வாழ்நாள் முழுவதும் உறுதியாக நிலைத்திருக்கும்.`;
      case 'zh':
        return `${planets}${plural ? '均' : ''}是${varg} — D1 与 D9 同宫。${plural ? '这些配置' : '这一配置'}将在一生中稳固持续。`;
      case 'hi':
        return `${planets} ${varg} ${plural ? 'हैं' : 'है'} — D1 और D9 एक ही राशि में. ${plural ? 'ये स्थितियाँ' : 'यह स्थिति'} जीवन भर स्थिर बनी रहती ${plural ? 'हैं' : 'है'}.`;
      case 'ja':
        return `${planets} は${varg} — D1 と D9 が同じサイン。${plural ? 'これらの配置は' : 'この配置は'}生涯を通じて安定して保たれる。`;
      case 'ko':
        return `${planets}은 ${varg} — D1과 D9가 같은 별자리. ${plural ? '이 배치들은' : '이 배치는'} 평생 확고하게 유지된다.`;
      case 'ar':
        return `${planets} ${varg} — نفس البرج في D1 وD9. ${plural ? 'هذه الأوضاع تبقى' : 'هذا الوضع يبقى'} ثابتة مدى الحياة.`;
      case 'ml':
        return `${planets} ${varg}${plural ? 'ങ്ങൾ' : 'ം'} ആണ് — D1 ഉം D9 ഉം ഒരേ രാശിയിൽ. ${plural ? 'ഈ സ്ഥാനങ്ങൾ' : 'ഈ സ്ഥാനം'} ജീവിതകാലം മുഴുവൻ സ്ഥിരമായി തുടരും.`;
      default:
        return `${planets} ${plural ? 'are' : 'is'} vargottama — the same sign in D1 and D9. ${plural ? 'These placements hold' : 'This placement holds'} firm across a lifetime.`;
    }
  },

  vargottamaAbsent: (lang: Lang): string => {
    switch (lang) {
      case 'si':
        return 'කිසිදු ග්‍රහයෙක් වර්ගෝත්තම නොවේ — කිසිවෙක් D1 රාශියම D9 හි නොදරයි. මෙය සෑම පිහිටීමකම ස්ථිර බව අඩු කරයි: ජීවිතය නැවත නැවත ප්‍රතිසංවිධානය වන අතර, කිසිදු එක් තත්ත්වයක් අවසාන ලෙස නොපවතී.';
      case 'ta':
        return 'எந்த கிரகமும் வர்கோத்தமம் இல்லை — யாரும் D1 ராசியையே D9 இல் தாங்கவில்லை. இது ஒவ்வொரு அமைவின் உறுதித்தன்மையையும் குறைக்கிறது: வாழ்க்கை மீண்டும் மீண்டும் மறுசீரமைக்கப்படுகிறது, எந்த ஒரு நிலையும் இறுதியானதாக இல்லை.';
      case 'zh':
        return '没有任何行星是瓦尔戈塔玛——没有一颗行星的 D1 星座与 D9 相同。这削弱了每个配置的稳固程度：人生不断重新调整，没有哪一种状态是最终定局。';
      case 'hi':
        return 'कोई भी ग्रह वर्गोत्तम नहीं है — किसी की भी D1 राशि D9 में नहीं दोहराई जाती. इससे हर स्थिति की स्थिरता कम हो जाती है: जीवन बार-बार पुनर्गठित होता रहता है, कोई एक स्थिति अंतिम नहीं होती.';
      case 'ja':
        return 'どの惑星もヴァルゴッタマではない——D1 のサインを D9 でも保持している惑星がない。これはすべての配置の安定度を下げる：人生は繰り返し再編成され、どの一つの状態も最終的なものにはならない。';
      case 'ko':
        return '어떤 행성도 바르고타마가 아니다 — D1 별자리를 D9에서도 유지하는 행성이 없다. 이는 모든 배치의 안정성을 낮춘다: 삶은 계속해서 재구성되며, 어떤 하나의 상태도 최종적이지 않다.';
      case 'ar':
        return 'لا يوجد كوكب فارغوتاما — لا كوكب يحافظ على برجه في D1 نفسه في D9. هذا يقلل من ثبات كل وضع: تستمر الحياة في إعادة التشكل، ولا تبقى أي حالة نهائية واحدة.';
      case 'ml':
        return 'ഒരു ഗ്രഹവും വർഗോത്തമമല്ല — ആരും D1 രാശി തന്നെ D9 ലും നിലനിർത്തുന്നില്ല. ഇത് ഓരോ സ്ഥാനത്തിന്റെയും സ്ഥിരത കുറയ്ക്കുന്നു: ജീവിതം വീണ്ടും വീണ്ടും പുനഃക്രമീകരിക്കപ്പെടുന്നു, ഒരു അവസ്ഥയും അന്തിമമായി നിലനിൽക്കുന്നില്ല.';
      default:
        return 'No planet is vargottama — none holds its D1 sign in D9. That reduces the lock-in strength of every placement in the chart, and is consistent with a life that keeps reconfiguring rather than settling into one fixed shape.';
    }
  },

  weakest: (planet: string, vimsopaka: string, lang: Lang): string => {
    switch (lang) {
      case 'si':
        return `වර්ග හරහා දුර්වලම ග්‍රහයා ${planet} ය (${vimsopaka}/20) — රාශි කේන්දරයේ තත්ත්වය කුමක් වුවත්, එය පාලනය කරන කරුණු අඩුම සහායක් ලබයි.`;
      case 'ta':
        return `வர்கங்கள் முழுவதும் மிகவும் பலவீனமான கிரகம் ${planet} (${vimsopaka}/20) — ராசி கட்டத்தில் அதன் நிலை எதுவாக இருந்தாலும், அது ஆளும் விஷயங்களுக்குக் குறைந்தபட்ச ஆதரவே கிடைக்கிறது.`;
      case 'zh':
        return `${planet} 是各分宫图中最弱的行星（${vimsopaka}/20）——无论它在本命盘中的地位如何，它所主管的事项获得的深层支持都是最少的。`;
      case 'hi':
        return `वर्गों में सबसे कमज़ोर ग्रह ${planet} है (${vimsopaka}/20) — राशि कुंडली में उसकी स्थिति चाहे जो हो, वह जिन विषयों का स्वामी है उन्हें गहराई में सबसे कम सहारा मिलता है.`;
      case 'ja':
        return `全ヴァルガの中で最も弱い惑星は ${planet}（${vimsopaka}/20）——出生図での地位がどうであれ、それが司る事柄は深いレベルで最も支えが少ない。`;
      case 'ko':
        return `모든 바르가에 걸쳐 가장 약한 행성은 ${planet} (${vimsopaka}/20) — 라시 차트에서의 위치와 무관하게, 그것이 관장하는 영역은 깊은 층위에서 가장 적은 지지를 받는다.`;
      case 'ar':
        return `أضعف كوكب عبر الأبراج الفرعية هو ${planet} (${vimsopaka}/20) — أيًا كانت مكانته في مخطط الراشي، فإن ما يحكمه يحصل على أقل دعم في العمق.`;
      case 'ml':
        return `വർഗങ്ങളിലുടനീളം ഏറ്റവും ദുർബലമായ ഗ്രഹം ${planet} ആണ് (${vimsopaka}/20) — രാശി ചക്രത്തിലെ അതിന്റെ നിലയെന്തായാലും, അത് ഭരിക്കുന്ന കാര്യങ്ങൾക്ക് ആഴത്തിൽ ഏറ്റവും കുറഞ്ഞ പിന്തുണയാണ് ലഭിക്കുന്നത്.`;
      default:
        return `${planet} is the weakest across the vargas (${vimsopaka}/20) — whatever its rashi-chart standing, what it governs gets the least support in depth.`;
    }
  },
};
