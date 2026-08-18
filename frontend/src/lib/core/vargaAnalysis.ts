/**
 * Specialised house readings for divisional charts.
 *
 * The same twelve houses carry different meanings depending on the varga:
 * in the Navamsa (D9) every house is read through the lens of marriage,
 * partnership, and dharma; in the Dasamsa (D10) through career, status,
 * and public life. Planet effects are likewise specialised and modulated
 * by the planet's dignity in that varga.
 */

import { RASHI_LORDS, type DignityLevel } from './planetaryAnalysis';
import { RASHIS, RASHI_ENGLISH } from './rashi';
import type { VargaPlanet } from './vargas';
import { type Lang, houseLabel } from './i18n';

export type VargaVariant = 'D9' | 'D10';

interface HouseTheme {
  theme: string;
  keywords: string[];
  reading: string;
}

const D9_HOUSES: HouseTheme[] = [
  {
    theme: 'Self as Partner',
    keywords: ['identity in marriage', 'approach to commitment', 'inner self'],
    reading: 'This is the navamsa lagna region — it describes who you become inside a committed relationship: your temperament as a partner, what you instinctively give, and how marriage matures your inner self.',
  },
  {
    theme: 'Sustenance of the Union',
    keywords: ['family wealth', 'shared values', 'speech at home'],
    reading: 'Governs the material and verbal nourishment of married life — pooled resources, the family you build together, and whether words at home feed or starve the bond.',
  },
  {
    theme: 'Courage Between Partners',
    keywords: ['effort', 'communication', 'siblings-in-law'],
    reading: 'Shows the day-to-day courage the relationship demands — initiative in resolving friction, short journeys together, and the role of siblings and in-laws in the marriage.',
  },
  {
    theme: 'Domestic Happiness',
    keywords: ['home', 'emotional security', 'inner contentment'],
    reading: 'The heart of domestic life — emotional security with the partner, the home you create together, and the depth of inner contentment marriage brings.',
  },
  {
    theme: 'Romance & Progeny',
    keywords: ['love', 'children', 'shared creativity'],
    reading: 'Governs the romantic spark inside commitment, children and what they bring to the union, and the creative projects partners build side by side.',
  },
  {
    theme: 'Frictions & Adjustments',
    keywords: ['conflicts', 'health of the bond', 'service'],
    reading: 'The testing ground of marriage — recurring disputes, adjustments each partner must make, and the quiet acts of service that either heal or erode the relationship.',
  },
  {
    theme: 'The Spouse',
    keywords: ['partner\'s nature', 'the bond itself', 'commitment'],
    reading: 'The most important house of the navamsa — it directly describes the spouse: their character, how they meet you, and the fundamental quality of the partnership itself.',
  },
  {
    theme: 'Depth & Longevity',
    keywords: ['intimacy', 'transformation', 'shared resources'],
    reading: 'Governs the hidden depths of the union — intimacy, joint finances and inheritance, the transformations marriage forces, and the staying power of the bond through crises.',
  },
  {
    theme: 'Shared Dharma',
    keywords: ['fortune', 'beliefs', 'spiritual alignment'],
    reading: 'Shows whether the partners walk the same dharmic road — shared beliefs, the luck that flows (or doesn\'t) after marriage, and growth through teachers and pilgrimage together.',
  },
  {
    theme: 'Marriage in the World',
    keywords: ['public face', 'duties', 'reputation'],
    reading: 'The public face of the union — how the couple is seen, duties marriage adds to your station, and the karmic work the partnership performs in society.',
  },
  {
    theme: 'Gains Through Union',
    keywords: ['fulfilled desires', 'friendships', 'support network'],
    reading: 'Governs what partnership earns you — the friend circle of the couple, elder siblings\' influence, and the desires that marriage helps fulfil.',
  },
  {
    theme: 'Bed Comforts & Sacrifice',
    keywords: ['private life', 'expenses', 'letting go'],
    reading: 'The most private house — bed comforts and conjugal happiness, what each partner silently sacrifices, expenses of married life, and connections to distant lands.',
  },
];

const D10_HOUSES: HouseTheme[] = [
  {
    theme: 'Professional Self',
    keywords: ['drive', 'work identity', 'initiative'],
    reading: 'This is the dasamsa lagna region — it describes your professional persona: the energy you bring to work, how colleagues first read you, and the instinctive style of your ambition.',
  },
  {
    theme: 'Earned Wealth',
    keywords: ['income', 'resources', 'value delivered'],
    reading: 'Governs what your career actually accumulates — salary and savings from work, the resources your profession commands, and how you speak for your value.',
  },
  {
    theme: 'Enterprise & Skill',
    keywords: ['courage', 'communication', 'self-promotion'],
    reading: 'The house of professional courage — pitches, negotiations, skills sharpened by practice, and the bold moves that separate the ambitious from the comfortable.',
  },
  {
    theme: 'Work Environment',
    keywords: ['workplace', 'stability', 'assets'],
    reading: 'Shows the conditions you work best in — office versus field, emotional satisfaction at work, and the fixed assets (property, vehicles) a career builds.',
  },
  {
    theme: 'Creative Authority',
    keywords: ['strategy', 'speculation', 'mentoring others'],
    reading: 'Governs intelligent risk in career — strategy, speculation, creative output, advisory positions, and the recognition that comes from original thinking.',
  },
  {
    theme: 'Service & Competition',
    keywords: ['daily grind', 'rivals', 'problem-solving'],
    reading: 'The battlefield house — competition, office politics, service rendered, debts and obligations, and the daily problems whose solving becomes your reputation.',
  },
  {
    theme: 'Partnerships & Clients',
    keywords: ['business partners', 'contracts', 'the public'],
    reading: 'Governs one-to-one professional bonds — business partners, key clients, contracts and deals, and how skilfully you handle the person across the table.',
  },
  {
    theme: 'Sudden Shifts & Research',
    keywords: ['transformation', 'others\' money', 'depth work'],
    reading: 'The house of professional metamorphosis — sudden career changes, handling other people\'s money, research and depth work, and rebirth after upheaval.',
  },
  {
    theme: 'Mentors & Fortune',
    keywords: ['luck', 'higher learning', 'guidance'],
    reading: 'Shows the grace in your career — mentors who open doors, advanced learning that lifts your trajectory, ethics in business, and long-distance opportunity.',
  },
  {
    theme: 'Karma & Status',
    keywords: ['achievement', 'authority', 'public standing'],
    reading: 'The summit of the dasamsa — your highest professional achievement, the authority you ultimately wield, and the mark your work leaves on the world.',
  },
  {
    theme: 'Income & Networks',
    keywords: ['gains', 'professional circle', 'ambitions'],
    reading: 'Governs the harvest — income streams, the professional network that multiplies your reach, and the steady fulfilment of long-held ambitions.',
  },
  {
    theme: 'Foreign & Behind-the-Scenes',
    keywords: ['overseas work', 'solitary work', 'expenses'],
    reading: 'The house of unseen work — foreign assignments, remote or behind-the-scenes roles, institutional work, costs of doing business, and eventual retreat from the stage.',
  },
];

const D9_PLANET_EFFECTS: Record<string, string> = {
  Sun: 'Brings dignity and authority into the relationship — a partner (or partnership dynamic) with strong self-respect. Ego must be consciously kept out of the bedroom and the kitchen.',
  Moon: 'Brings deep emotional currents — nurturing, moods, and a need to feel at home with the partner. The bond rises and falls with emotional honesty.',
  Mars: 'Brings passion and heat — physical chemistry, but also a quick fuse. Channelled well, it protects the marriage; unchannelled, it sparks recurring flare-ups.',
  Mercury: 'Brings playfulness and conversation — a youthful, communicative flavour. The relationship stays alive as long as the two of you keep genuinely talking.',
  Jupiter: 'Brings wisdom and blessing — growth, generosity, and dharmic protection to the union. One of the best influences a navamsa house can receive.',
  Venus: 'The karaka of marriage itself placed here — love, refinement, and sensual harmony concentrate in this area of the union. Its dignity matters more than any other.',
  Saturn: 'Brings duty and endurance — a mature, serious tone, sometimes delay or an age gap. What it slows down, it also makes nearly unbreakable.',
  Rahu: 'Brings intensity and unconventionality — fascination, foreign or unusual elements, and appetites that can tip into obsession. Needs conscious grounding.',
  Ketu: 'Brings detachment and a spiritual undertone — a feeling of past-life familiarity, but also absent-mindedness toward this area. Connection must be actively practised.',
};

const D10_PLANET_EFFECTS: Record<string, string> = {
  Sun: 'Brings leadership and visibility — authority roles, government or institutional favour, and a career that needs a stage. Recognition is the fuel.',
  Moon: 'Brings public connection — careers facing people: care, hospitality, brands, the public mood. Roles may fluctuate; adaptability is the strength.',
  Mars: 'Brings drive and technical edge — engineering, defence, surgery, sport, competition. Best where decisiveness under pressure is rewarded.',
  Mercury: 'Brings commerce and intellect — writing, analytics, trade, consulting. The career grows on the quality of communication and detail.',
  Jupiter: 'Brings counsel and expansion — teaching, law, finance, advisory. Seniority arrives naturally; wisdom becomes the product.',
  Venus: 'Brings aesthetics and diplomacy — arts, design, luxury, partnerships, negotiation. The career flourishes where taste and relationships matter.',
  Saturn: 'Brings the long climb — structure, persistence, mastery through repetition. Slow early years compound into late, durable authority.',
  Rahu: 'Brings unconventional ascent — technology, foreign companies, new industries, sudden elevations. High reward, but guard against shortcuts.',
  Ketu: 'Brings the specialist\'s path — research, esoteric or technical depth, behind-the-scenes mastery. Influence without the need for spotlight.',
};

/**
 * Translated overlays, same convention as `VARGA_PLAIN_TR` in vargaMeanings.ts:
 * one whole replacement per language, falling back to the English above when
 * a language has no entry.
 */
const D9_HOUSES_TR: Partial<Record<Exclude<Lang, 'en'>, HouseTheme[]>> = {
  ml: [
  {
    theme: 'പങ്കാളിയായുള്ള സ്വയം',
    keywords: ['വിവാഹത്തിലെ സ്വത്വം', 'പ്രതിബദ്ധതയോടുള്ള സമീപനം', 'ആന്തരിക സ്വയം'],
    reading: 'ഇത് നവാംശ ലഗ്ന മേഖലയാണ് — ഒരു പ്രതിബദ്ധതയുള്ള ബന്ധത്തിനുള്ളിൽ നിങ്ങൾ ആരായി മാറുന്നു എന്ന് ഇത് വിവരിക്കുന്നു: ഒരു പങ്കാളി എന്ന നിലയിൽ നിങ്ങളുടെ സ്വഭാവം, നിങ്ങൾ സഹജമായി നൽകുന്നത്, വിവാഹം നിങ്ങളുടെ ആന്തരിക സ്വയത്തെ എങ്ങനെ പക്വമാക്കുന്നു.',
  },
  {
    theme: 'ബന്ധത്തിന്റെ പോഷണം',
    keywords: ['കുടുംബ സമ്പത്ത്', 'പങ്കിട്ട മൂല്യങ്ങൾ', 'വീട്ടിലെ സംസാരം'],
    reading: 'വിവാഹജീവിതത്തിന്റെ ഭൗതികവും വാചികവുമായ പോഷണത്തെ നിയന്ത്രിക്കുന്നു — ഒരുമിച്ചുള്ള വിഭവങ്ങൾ, നിങ്ങൾ ഒരുമിച്ച് കെട്ടിപ്പടുക്കുന്ന കുടുംബം, വീട്ടിലെ വാക്കുകൾ ബന്ധത്തെ പോഷിപ്പിക്കുന്നോ വിശപ്പിക്കുന്നോ എന്നത്.',
  },
  {
    theme: 'പങ്കാളികൾ തമ്മിലുള്ള ധൈര്യം',
    keywords: ['പരിശ്രമം', 'ആശയവിനിമയം', 'അളിയന്മാരും അളിയത്തിമാരും'],
    reading: 'ബന്ധം ആവശ്യപ്പെടുന്ന ദൈനംദിന ധൈര്യം കാണിക്കുന്നു — ഘർഷണം പരിഹരിക്കുന്നതിലെ മുൻകൈ, ഒരുമിച്ചുള്ള ഹ്രസ്വ യാത്രകൾ, വിവാഹത്തിൽ സഹോദരങ്ങളുടെയും ബന്ധുക്കളുടെയും പങ്ക്.',
  },
  {
    theme: 'ഗാർഹിക സന്തോഷം',
    keywords: ['വീട്', 'വൈകാരിക സുരക്ഷിതത്വം', 'ആന്തരിക സംതൃപ്തി'],
    reading: 'ഗാർഹിക ജീവിതത്തിന്റെ ഹൃദയം — പങ്കാളിയുമായുള്ള വൈകാരിക സുരക്ഷിതത്വം, നിങ്ങൾ ഒരുമിച്ച് സൃഷ്ടിക്കുന്ന വീട്, വിവാഹം കൊണ്ടുവരുന്ന ആന്തരിക സംതൃപ്തിയുടെ ആഴം.',
  },
  {
    theme: 'പ്രണയവും സന്താനങ്ങളും',
    keywords: ['സ്നേഹം', 'കുട്ടികൾ', 'പങ്കിട്ട സർഗ്ഗാത്മകത'],
    reading: 'പ്രതിബദ്ധതയ്ക്കുള്ളിലെ പ്രണയ തീപ്പൊരി, കുട്ടികളും അവർ ബന്ധത്തിന് നൽകുന്നതും, പങ്കാളികൾ ഒരുമിച്ച് കെട്ടിപ്പടുക്കുന്ന സൃഷ്ടിപരമായ പദ്ധതികളും നിയന്ത്രിക്കുന്നു.',
  },
  {
    theme: 'ഘർഷണങ്ങളും ക്രമീകരണങ്ങളും',
    keywords: ['സംഘർഷങ്ങൾ', 'ബന്ധത്തിന്റെ ആരോഗ്യം', 'സേവനം'],
    reading: 'വിവാഹത്തിന്റെ പരീക്ഷണ ഭൂമി — ആവർത്തിക്കുന്ന തർക്കങ്ങൾ, ഓരോ പങ്കാളിയും വരുത്തേണ്ട ക്രമീകരണങ്ങൾ, ബന്ധത്തെ സുഖപ്പെടുത്തുകയോ ക്ഷയിപ്പിക്കുകയോ ചെയ്യുന്ന നിശബ്ദ സേവന പ്രവൃത്തികൾ.',
  },
  {
    theme: 'ജീവിതപങ്കാളി',
    keywords: ['പങ്കാളിയുടെ സ്വഭാവം', 'ബന്ധം തന്നെ', 'പ്രതിബദ്ധത'],
    reading: 'നവാംശത്തിലെ ഏറ്റവും പ്രധാനപ്പെട്ട ഭാവം — ഇത് നേരിട്ട് ജീവിതപങ്കാളിയെ വിവരിക്കുന്നു: അവരുടെ സ്വഭാവം, അവർ നിങ്ങളെ എങ്ങനെ കണ്ടുമുട്ടുന്നു, പങ്കാളിത്തത്തിന്റെ അടിസ്ഥാന ഗുണനിലവാരം.',
  },
  {
    theme: 'ആഴവും ദീർഘായുസ്സും',
    keywords: ['അടുപ്പം', 'പരിവർത്തനം', 'പങ്കിട്ട വിഭവങ്ങൾ'],
    reading: 'ബന്ധത്തിന്റെ മറഞ്ഞ ആഴങ്ങളെ നിയന്ത്രിക്കുന്നു — അടുപ്പം, സംയുക്ത ധനകാര്യങ്ങളും അനന്തരാവകാശവും, വിവാഹം നിർബന്ധിക്കുന്ന പരിവർത്തനങ്ങൾ, പ്രതിസന്ധികളിലൂടെ ബന്ധത്തിന്റെ നിലനിൽപ്പ് ശക്തി.',
  },
  {
    theme: 'പങ്കിട്ട ധർമ്മം',
    keywords: ['സൗഭാഗ്യം', 'വിശ്വാസങ്ങൾ', 'ആത്മീയ യോജിപ്പ്'],
    reading: 'പങ്കാളികൾ ഒരേ ധാർമ്മിക പാതയിലാണോ നടക്കുന്നത് എന്ന് കാണിക്കുന്നു — പങ്കിട്ട വിശ്വാസങ്ങൾ, വിവാഹത്തിന് ശേഷം ഒഴുകുന്ന (അല്ലെങ്കിൽ ഒഴുകാത്ത) ഭാഗ്യം, ഗുരുക്കന്മാരിലൂടെയും തീർത്ഥാടനത്തിലൂടെയും ഒരുമിച്ചുള്ള വളർച്ച.',
  },
  {
    theme: 'ലോകത്തിലെ വിവാഹം',
    keywords: ['പൊതു മുഖം', 'കടമകൾ', 'പ്രശസ്തി'],
    reading: 'ബന്ധത്തിന്റെ പൊതു മുഖം — ദമ്പതികളെ എങ്ങനെ കാണുന്നു, വിവാഹം നിങ്ങളുടെ പദവിയിലേക്ക് ചേർക്കുന്ന കടമകൾ, പങ്കാളിത്തം സമൂഹത്തിൽ നിർവഹിക്കുന്ന കാർമിക ജോലി.',
  },
  {
    theme: 'ബന്ധത്തിലൂടെയുള്ള നേട്ടങ്ങൾ',
    keywords: ['സാധിച്ച ആഗ്രഹങ്ങൾ', 'സൗഹൃദങ്ങൾ', 'പിന്തുണാ ശൃംഖല'],
    reading: 'പങ്കാളിത്തം നിങ്ങൾക്ക് നേടിത്തരുന്നത് നിയന്ത്രിക്കുന്നു — ദമ്പതികളുടെ സുഹൃത്ത് വലയം, മുതിർന്ന സഹോദരങ്ങളുടെ സ്വാധീനം, വിവാഹം സാധിക്കാൻ സഹായിക്കുന്ന ആഗ്രഹങ്ങൾ.',
  },
  {
    theme: 'ശയ്യാ സുഖങ്ങളും ത്യാഗവും',
    keywords: ['സ്വകാര്യ ജീവിതം', 'ചെലവുകൾ', 'വിട്ടയക്കൽ'],
    reading: 'ഏറ്റവും സ്വകാര്യമായ ഭാവം — ശയ്യാ സുഖങ്ങളും ദാമ്പത്യ സന്തോഷവും, ഓരോ പങ്കാളിയും നിശബ്ദമായി ത്യജിക്കുന്നത്, വിവാഹിത ജീവിതത്തിന്റെ ചെലവുകൾ, വിദൂര ദേശങ്ങളുമായുള്ള ബന്ധങ്ങൾ.',
  },
],
  ja: [
    {
      theme: 'パートナーとしての自己',
      keywords: ['結婚における自己認識', 'コミットメントへの向き合い方', '内なる自己'],
      reading: 'これはナヴァムシャのラグナ領域です — 真剣な関係の中であなたが誰になるかを描写します：パートナーとしての気質、本能的に与えるもの、そして結婚があなたの内なる自己をどう成熟させるかです。',
    },
    {
      theme: '結びつきを支えるもの',
      keywords: ['家族の財産', '共有する価値観', '家庭内での言葉'],
      reading: '結婚生活の物質的・言葉的な糧を司ります — 共有する資源、共に築く家族、そして家庭内の言葉が絆を育むか損なうかです。',
    },
    {
      theme: 'パートナー間の勇気',
      keywords: ['努力', 'コミュニケーション', '義理の兄弟姉妹'],
      reading: '関係が求める日々の勇気を示します — 摩擦を解決する主体性、共に行う短い旅、そして結婚における兄弟姉妹や義理の家族の役割です。',
    },
    {
      theme: '家庭の幸福',
      keywords: ['家庭', '情緒的な安心感', '内なる満足感'],
      reading: '家庭生活の核心です — パートナーとの情緒的な安心感、共に創る家庭、そして結婚がもたらす内なる満足感の深さです。',
    },
    {
      theme: 'ロマンスと子孫',
      keywords: ['愛', '子ども', '共有する創造性'],
      reading: 'コミットメントの中のロマンチックな輝き、子どもとそれが結びつきにもたらすもの、そしてパートナーが並んで築く創造的なプロジェクトを司ります。',
    },
    {
      theme: '摩擦と調整',
      keywords: ['対立', '絆の健全さ', '奉仕'],
      reading: '結婚の試練の場です — 繰り返される諍い、各パートナーが行うべき調整、そして関係を癒すか蝕むかする静かな奉仕の行為です。',
    },
    {
      theme: '配偶者',
      keywords: ['パートナーの性質', '絆そのもの', 'コミットメント'],
      reading: 'ナヴァムシャで最も重要なハウスです — 配偶者そのものを直接描写します：その人柄、あなたとの出会い方、そしてパートナーシップ自体の根本的な質です。',
    },
    {
      theme: '深さと持続性',
      keywords: ['親密さ', '変容', '共有する資源'],
      reading: '結びつきの隠れた深みを司ります — 親密さ、共同の財産と相続、結婚がもたらす変容、そして危機を通じて絆が持ちこたえる力です。',
    },
    {
      theme: '共有するダルマ',
      keywords: ['幸運', '信念', '精神的な調和'],
      reading: 'パートナーが同じダルマの道を歩んでいるかを示します — 共有する信念、結婚後に流れる（あるいは流れない）幸運、そして共に師や巡礼を通じて成長することです。',
    },
    {
      theme: '世間における結婚',
      keywords: ['公の顔', '義務', '評判'],
      reading: '結びつきの公的な顔です — カップルがどう見られるか、結婚があなたの立場に加える義務、そしてパートナーシップが社会で果たすカルマ的な役割です。',
    },
    {
      theme: '結びつきを通じた利得',
      keywords: ['叶えられた願い', '友情', '支援ネットワーク'],
      reading: 'パートナーシップがあなたにもたらすものを司ります — カップルの友人関係、年上の兄弟姉妹の影響、そして結婚が叶える手助けをする願いです。',
    },
    {
      theme: '閨房の快適さと犠牲',
      keywords: ['私生活', '出費', '手放すこと'],
      reading: '最もプライベートなハウスです — 閨房の快適さと夫婦の幸福、各パートナーが静かに犠牲にするもの、結婚生活の出費、そして遠い土地とのつながりです。',
    },
  ],
  ar: [
    {
      theme: 'الذات كشريك',
      keywords: ['الهوية في الزواج', 'نهج الالتزام', 'الذات الداخلية'],
      reading: 'هذه منطقة لغنة النافامسا — تصف من تصبح داخل علاقة ملتزمة: مزاجك كشريك، ما تمنحه غريزيًا، وكيف ينضج الزواج ذاتك الداخلية.',
    },
    {
      theme: 'إعالة الرابطة',
      keywords: ['ثروة الأسرة', 'القيم المشتركة', 'الحديث في المنزل'],
      reading: 'يحكم التغذية المادية واللفظية للحياة الزوجية — الموارد المجمّعة، الأسرة التي تبنيانها معًا، وما إذا كانت الكلمات في المنزل تغذي الرابطة أو تُجيعها.',
    },
    {
      theme: 'الشجاعة بين الشريكين',
      keywords: ['الجهد', 'التواصل', 'أزواج الإخوة'],
      reading: 'يُظهر الشجاعة اليومية التي تتطلبها العلاقة — المبادرة في حل الاحتكاك، الرحلات القصيرة معًا، ودور الإخوة والأصهار في الزواج.',
    },
    {
      theme: 'السعادة المنزلية',
      keywords: ['المنزل', 'الأمان العاطفي', 'الرضا الداخلي'],
      reading: 'قلب الحياة المنزلية — الأمان العاطفي مع الشريك، المنزل الذي تخلقانه معًا، وعمق الرضا الداخلي الذي يجلبه الزواج.',
    },
    {
      theme: 'الرومانسية والذرية',
      keywords: ['الحب', 'الأطفال', 'الإبداع المشترك'],
      reading: 'يحكم الشرارة الرومانسية داخل الالتزام، الأطفال وما يجلبونه للرابطة، والمشاريع الإبداعية التي يبنيها الشريكان جنبًا إلى جنب.',
    },
    {
      theme: 'الاحتكاكات والتكيّفات',
      keywords: ['النزاعات', 'صحة الرابطة', 'الخدمة'],
      reading: 'أرض اختبار الزواج — النزاعات المتكررة، التكيّفات التي يجب على كل شريك القيام بها، وأفعال الخدمة الهادئة التي إما تشفي العلاقة أو تآكلها.',
    },
    {
      theme: 'الزوج/الزوجة',
      keywords: ['طبيعة الشريك', 'الرابطة نفسها', 'الالتزام'],
      reading: 'أهم بيت في النافامسا — يصف الزوج/الزوجة مباشرة: شخصيته، كيف يلتقي بك، والجودة الأساسية للشراكة نفسها.',
    },
    {
      theme: 'العمق وطول الأمد',
      keywords: ['الحميمية', 'التحول', 'الموارد المشتركة'],
      reading: 'يحكم الأعماق الخفية للرابطة — الحميمية، الأموال المشتركة والميراث، التحولات التي يفرضها الزواج، وقدرة الرابطة على الصمود عبر الأزمات.',
    },
    {
      theme: 'الدارما المشتركة',
      keywords: ['الحظ', 'المعتقدات', 'التوافق الروحي'],
      reading: 'يُظهر ما إذا كان الشريكان يسيران على نفس الطريق الدارمي — المعتقدات المشتركة، الحظ الذي يتدفق (أو لا) بعد الزواج، والنمو من خلال المعلمين والحج معًا.',
    },
    {
      theme: 'الزواج في العالم',
      keywords: ['الوجه العام', 'الواجبات', 'السمعة'],
      reading: 'الوجه العام للرابطة — كيف يُنظر إلى الزوجين، الواجبات التي يضيفها الزواج لمكانتك، والعمل الكارمي الذي تؤديه الشراكة في المجتمع.',
    },
    {
      theme: 'المكاسب من خلال الاتحاد',
      keywords: ['الرغبات المحققة', 'الصداقات', 'شبكة الدعم'],
      reading: 'يحكم ما تكسبه الشراكة لك — دائرة أصدقاء الزوجين، تأثير الإخوة الأكبر، والرغبات التي يساعد الزواج في تحقيقها.',
    },
    {
      theme: 'راحة الفراش والتضحية',
      keywords: ['الحياة الخاصة', 'النفقات', 'التخلي'],
      reading: 'أكثر بيت خصوصية — راحة الفراش والسعادة الزوجية، ما يضحي به كل شريك بصمت، نفقات الحياة الزوجية، والروابط بالأراضي البعيدة.',
    },
  ],
  ko: [
    {
      theme: '파트너로서의 자아',
      keywords: ['결혼 안에서의 정체성', '헌신에 대한 태도', '내면의 자아'],
      reading: '이곳은 나밤샤 라그나 영역입니다 — 헌신적인 관계 안에서 당신이 어떤 사람이 되는지를 설명합니다: 파트너로서의 기질, 본능적으로 주는 것, 그리고 결혼이 당신의 내면 자아를 어떻게 성숙시키는지.',
    },
    {
      theme: '결합의 부양',
      keywords: ['가문의 재산', '공유된 가치관', '가정에서의 언어'],
      reading: '결혼 생활의 물질적, 언어적 자양분을 관장합니다 — 모은 자원, 함께 이루는 가정, 그리고 가정에서의 말이 유대를 살찌우는지 굶기는지.',
    },
    {
      theme: '파트너 사이의 용기',
      keywords: ['노력', '소통', '동서/처남 관계'],
      reading: '관계가 요구하는 일상의 용기를 보여줍니다 — 마찰을 해결하는 주도성, 함께하는 짧은 여행, 그리고 결혼에서 형제자매와 인척의 역할.',
    },
    {
      theme: '가정의 행복',
      keywords: ['가정', '정서적 안정', '내면의 만족'],
      reading: '가정생활의 핵심 — 파트너와의 정서적 안정, 함께 만드는 집, 그리고 결혼이 가져다주는 내면적 만족의 깊이.',
    },
    {
      theme: '로맨스와 자손',
      keywords: ['사랑', '자녀', '공유된 창의성'],
      reading: '헌신 안의 낭만적인 불꽃, 자녀와 그들이 결합에 가져다주는 것, 그리고 파트너가 나란히 쌓아가는 창의적인 프로젝트를 관장합니다.',
    },
    {
      theme: '마찰과 조정',
      keywords: ['갈등', '유대의 건강', '봉사'],
      reading: '결혼의 시험장 — 반복되는 다툼, 각 파트너가 해야 하는 조정, 그리고 관계를 치유하거나 갉아먹는 조용한 봉사의 행위들.',
    },
    {
      theme: '배우자',
      keywords: ["파트너의 본성", '유대 그 자체', '헌신'],
      reading: '나밤샤에서 가장 중요한 하우스 — 배우자를 직접적으로 설명합니다: 그들의 성격, 당신을 만나는 방식, 그리고 파트너십 자체의 근본적인 질.',
    },
    {
      theme: '깊이와 지속성',
      keywords: ['친밀감', '변형', '공유 자원'],
      reading: '결합의 숨겨진 깊이를 관장합니다 — 친밀감, 공동 재정과 상속, 결혼이 강요하는 변형, 그리고 위기 속에서도 지속되는 유대의 힘.',
    },
    {
      theme: '공유된 다르마',
      keywords: ['행운', '신념', '영적 조화'],
      reading: '파트너들이 같은 다르마의 길을 걷는지를 보여줍니다 — 공유된 신념, 결혼 후 흐르는(또는 흐르지 않는) 행운, 그리고 스승과 함께하는 순례를 통한 성장.',
    },
    {
      theme: '세상 속의 결혼',
      keywords: ['대외적 이미지', '의무', '평판'],
      reading: '결합의 대외적인 얼굴 — 커플이 어떻게 보이는지, 결혼이 당신의 지위에 더하는 의무, 그리고 파트너십이 사회에서 수행하는 카르마적 일.',
    },
    {
      theme: '결합을 통한 이득',
      keywords: ['이루어진 소망', '우정', '지지 네트워크'],
      reading: '파트너십이 당신에게 얻게 해주는 것을 관장합니다 — 커플의 친구 관계, 손위 형제자매의 영향, 그리고 결혼이 이루도록 돕는 소망들.',
    },
    {
      theme: '침실의 편안함과 희생',
      keywords: ['사생활', '지출', '놓아주기'],
      reading: '가장 사적인 하우스 — 침실의 편안함과 부부의 행복, 각 파트너가 조용히 희생하는 것, 결혼 생활의 비용, 그리고 먼 곳과의 인연.',
    },
  ],
};
const D10_HOUSES_TR: Partial<Record<Exclude<Lang, 'en'>, HouseTheme[]>> = {
  ml: [
  {
    theme: 'തൊഴിൽപരമായ സ്വയം',
    keywords: ['ചാലകശക്തി', 'തൊഴിൽ സ്വത്വം', 'മുൻകൈ'],
    reading: 'ഇത് ദശാംശ ലഗ്ന മേഖലയാണ് — ഇത് നിങ്ങളുടെ തൊഴിൽപരമായ വ്യക്തിത്വത്തെ വിവരിക്കുന്നു: നിങ്ങൾ ജോലിയിലേക്ക് കൊണ്ടുവരുന്ന ഊർജ്ജം, സഹപ്രവർത്തകർ ആദ്യം നിങ്ങളെ എങ്ങനെ വായിക്കുന്നു, നിങ്ങളുടെ ലക്ഷ്യബോധത്തിന്റെ സഹജ ശൈലി.',
  },
  {
    theme: 'നേടിയ സമ്പത്ത്',
    keywords: ['വരുമാനം', 'വിഭവങ്ങൾ', 'നൽകിയ മൂല്യം'],
    reading: 'നിങ്ങളുടെ കരിയർ യഥാർത്ഥത്തിൽ സ്വരൂപിക്കുന്നത് നിയന്ത്രിക്കുന്നു — ജോലിയിൽ നിന്നുള്ള ശമ്പളവും സമ്പാദ്യവും, നിങ്ങളുടെ തൊഴിൽ കൈകാര്യം ചെയ്യുന്ന വിഭവങ്ങൾ, നിങ്ങളുടെ മൂല്യത്തിന് നിങ്ങൾ എങ്ങനെ വാദിക്കുന്നു.',
  },
  {
    theme: 'സംരംഭവും വൈദഗ്ധ്യവും',
    keywords: ['ധൈര്യം', 'ആശയവിനിമയം', 'സ്വയം പ്രമോഷൻ'],
    reading: 'തൊഴിൽപരമായ ധൈര്യത്തിന്റെ ഭാവം — അവതരണങ്ങൾ, ചർച്ചകൾ, പരിശീലനത്തിലൂടെ മൂർച്ചയാക്കിയ കഴിവുകൾ, ലക്ഷ്യബോധമുള്ളവരെ സൗകര്യപ്രദമായവരിൽ നിന്ന് വേർതിരിക്കുന്ന ധീരമായ നീക്കങ്ങൾ.',
  },
  {
    theme: 'ജോലി അന്തരീക്ഷം',
    keywords: ['ജോലിസ്ഥലം', 'സ്ഥിരത', 'ആസ്തികൾ'],
    reading: 'നിങ്ങൾ ഏറ്റവും നന്നായി ജോലി ചെയ്യുന്ന സാഹചര്യങ്ങൾ കാണിക്കുന്നു — ഓഫീസോ ഫീൽഡോ, ജോലിയിലെ വൈകാരിക സംതൃപ്തി, ഒരു കരിയർ കെട്ടിപ്പടുക്കുന്ന സ്ഥിര ആസ്തികൾ (സ്വത്ത്, വാഹനങ്ങൾ).',
  },
  {
    theme: 'സൃഷ്ടിപരമായ അധികാരം',
    keywords: ['തന്ത്രം', 'ഊഹക്കച്ചവടം', 'മറ്റുള്ളവരെ ഉപദേശിക്കൽ'],
    reading: 'കരിയറിലെ ബുദ്ധിപരമായ അപകടസാധ്യതയെ നിയന്ത്രിക്കുന്നു — തന്ത്രം, ഊഹക്കച്ചവടം, സൃഷ്ടിപരമായ ഉൽപാദനം, ഉപദേശക സ്ഥാനങ്ങൾ, മൗലിക ചിന്തയിൽ നിന്ന് വരുന്ന അംഗീകാരം.',
  },
  {
    theme: 'സേവനവും മത്സരവും',
    keywords: ['ദൈനംദിന അധ്വാനം', 'എതിരാളികൾ', 'പ്രശ്ന പരിഹാരം'],
    reading: 'യുദ്ധഭൂമി ഭാവം — മത്സരം, ഓഫീസ് രാഷ്ട്രീയം, നൽകിയ സേവനം, കടങ്ങളും ബാധ്യതകളും, പരിഹരിക്കുന്നത് നിങ്ങളുടെ പ്രശസ്തിയായി മാറുന്ന ദൈനംദിന പ്രശ്നങ്ങൾ.',
  },
  {
    theme: 'പങ്കാളിത്തങ്ങളും ക്ലയന്റുകളും',
    keywords: ['ബിസിനസ് പങ്കാളികൾ', 'കരാറുകൾ', 'പൊതുജനം'],
    reading: 'ഒന്നിനൊന്ന് തൊഴിൽപരമായ ബന്ധങ്ങളെ നിയന്ത്രിക്കുന്നു — ബിസിനസ് പങ്കാളികൾ, പ്രധാന ക്ലയന്റുകൾ, കരാറുകളും ഇടപാടുകളും, മേശയ്ക്ക് അപ്പുറമുള്ള വ്യക്തിയെ നിങ്ങൾ എത്ര വൈദഗ്ധ്യത്തോടെ കൈകാര്യം ചെയ്യുന്നു.',
  },
  {
    theme: 'പെട്ടെന്നുള്ള മാറ്റങ്ങളും ഗവേഷണവും',
    keywords: ['പരിവർത്തനം', 'മറ്റുള്ളവരുടെ പണം', 'ആഴത്തിലുള്ള ജോലി'],
    reading: 'തൊഴിൽപരമായ രൂപാന്തരണത്തിന്റെ ഭാവം — പെട്ടെന്നുള്ള കരിയർ മാറ്റങ്ങൾ, മറ്റുള്ളവരുടെ പണം കൈകാര്യം ചെയ്യൽ, ഗവേഷണവും ആഴത്തിലുള്ള ജോലിയും, കോളിളക്കത്തിന് ശേഷമുള്ള പുനർജന്മം.',
  },
  {
    theme: 'ഗുരുക്കന്മാരും സൗഭാഗ്യവും',
    keywords: ['ഭാഗ്യം', 'ഉന്നത പഠനം', 'മാർഗ്ഗനിർദ്ദേശം'],
    reading: 'നിങ്ങളുടെ കരിയറിലെ കൃപ കാണിക്കുന്നു — വാതിലുകൾ തുറക്കുന്ന ഗുരുക്കന്മാർ, നിങ്ങളുടെ പാതയെ ഉയർത്തുന്ന ഉന്നത പഠനം, ബിസിനസിലെ ധാർമ്മികത, ദീർഘദൂര അവസരം.',
  },
  {
    theme: 'കർമ്മവും പദവിയും',
    keywords: ['നേട്ടം', 'അധികാരം', 'പൊതു നില'],
    reading: 'ദശാംശത്തിന്റെ കൊടുമുടി — നിങ്ങളുടെ ഏറ്റവും ഉയർന്ന തൊഴിൽപരമായ നേട്ടം, നിങ്ങൾ ആത്യന്തികമായി പ്രയോഗിക്കുന്ന അധികാരം, നിങ്ങളുടെ ജോലി ലോകത്ത് അവശേഷിപ്പിക്കുന്ന അടയാളം.',
  },
  {
    theme: 'വരുമാനവും ശൃംഖലകളും',
    keywords: ['നേട്ടങ്ങൾ', 'തൊഴിൽ വലയം', 'അഭിലാഷങ്ങൾ'],
    reading: 'വിളവെടുപ്പിനെ നിയന്ത്രിക്കുന്നു — വരുമാന സ്രോതസ്സുകൾ, നിങ്ങളുടെ എത്തിച്ചേരൽ വർദ്ധിപ്പിക്കുന്ന തൊഴിൽ ശൃംഖല, ദീർഘകാലമായി കൊണ്ടുനടക്കുന്ന അഭിലാഷങ്ങളുടെ സ്ഥിരമായ പൂർത്തീകരണം.',
  },
  {
    theme: 'വിദേശവും തിരശ്ശീലയ്ക്ക് പിന്നിലും',
    keywords: ['വിദേശ ജോലി', 'ഏകാന്ത ജോലി', 'ചെലവുകൾ'],
    reading: 'അദൃശ്യ ജോലിയുടെ ഭാവം — വിദേശ നിയമനങ്ങൾ, വിദൂരമോ തിരശ്ശീലയ്ക്ക് പിന്നിലുള്ളതോ ആയ റോളുകൾ, സ്ഥാപനപരമായ ജോലി, ബിസിനസ്സ് ചെയ്യുന്നതിന്റെ ചെലവുകൾ, ഒടുവിൽ വേദിയിൽ നിന്നുള്ള പിന്മാറ്റം.',
  },
],
  ja: [
    {
      theme: '職業的な自己',
      keywords: ['活力', '仕事上のアイデンティティ', '主体性'],
      reading: 'これはダシャムシャのラグナ領域です — あなたの職業的なペルソナを描写します：仕事にもたらすエネルギー、同僚が最初にあなたをどう読み取るか、そしてあなたの野心の本能的なスタイルです。',
    },
    {
      theme: '得た財産',
      keywords: ['収入', '資源', '提供する価値'],
      reading: 'あなたのキャリアが実際に蓄積するものを司ります — 仕事からの給与と貯蓄、あなたの職業が持つ資源、そしてあなたが自分の価値をどう主張するかです。',
    },
    {
      theme: '事業と技能',
      keywords: ['勇気', 'コミュニケーション', '自己アピール'],
      reading: '職業的な勇気のハウスです — 提案、交渉、練習によって磨かれたスキル、そして野心的な人と現状に満足する人を分ける大胆な行動です。',
    },
    {
      theme: '仕事環境',
      keywords: ['職場', '安定性', '資産'],
      reading: 'あなたが最もよく働ける条件を示します — オフィスか現場か、仕事での情緒的な満足感、そしてキャリアが築く固定資産（不動産、車両）です。',
    },
    {
      theme: '創造的な権威',
      keywords: ['戦略', '投機', '他者への助言'],
      reading: 'キャリアにおける賢いリスクを司ります — 戦略、投機、創造的な成果、助言的な立場、そして独創的な思考から来る評価です。',
    },
    {
      theme: '奉仕と競争',
      keywords: ['日々の労苦', 'ライバル', '問題解決'],
      reading: '戦場のハウスです — 競争、社内政治、提供する奉仕、負債と義務、そして解決することがあなたの評判となる日々の問題です。',
    },
    {
      theme: 'パートナーシップと顧客',
      keywords: ['ビジネスパートナー', '契約', '一般大衆'],
      reading: '一対一の職業的な絆を司ります — ビジネスパートナー、主要な顧客、契約と取引、そしてテーブルの向こうにいる人をどれだけ巧みに扱うかです。',
    },
    {
      theme: '突然の転換と研究',
      keywords: ['変容', '他者の資金', '深い仕事'],
      reading: '職業的な変身のハウスです — 突然のキャリアの変化、他人の資金を扱うこと、研究と深い仕事、そして激変の後の再生です。',
    },
    {
      theme: 'メンターと幸運',
      keywords: ['幸運', '高等教育', '導き'],
      reading: 'あなたのキャリアにおける恩恵を示します — 道を開いてくれるメンター、軌道を押し上げる高度な学び、ビジネスにおける倫理、そして遠方からの機会です。',
    },
    {
      theme: 'カルマと地位',
      keywords: ['達成', '権威', '社会的地位'],
      reading: 'ダシャムシャの頂点です — あなたの最高の職業的達成、最終的に振るう権威、そしてあなたの仕事が世界に残す足跡です。',
    },
    {
      theme: '収入と人脈',
      keywords: ['利得', '職業上の人脈', '野心'],
      reading: '収穫を司ります — 収入源、あなたの影響力を何倍にもする職業ネットワーク、そして長年抱いてきた野心の着実な実現です。',
    },
    {
      theme: '海外と舞台裏',
      keywords: ['海外での仕事', '孤独な仕事', '経費'],
      reading: '見えない仕事のハウスです — 海外赴任、リモートまたは舞台裏の役割、組織的な仕事、事業を行う費用、そして最終的な舞台からの引退です。',
    },
  ],
  ar: [
    {
      theme: 'الذات المهنية',
      keywords: ['الدافع', 'هوية العمل', 'المبادرة'],
      reading: 'هذه منطقة لغنة الداسامسا — تصف شخصيتك المهنية: الطاقة التي تجلبها للعمل، كيف يقرأك الزملاء لأول مرة، والأسلوب الغريزي لطموحك.',
    },
    {
      theme: 'الثروة المكتسبة',
      keywords: ['الدخل', 'الموارد', 'القيمة المقدَّمة'],
      reading: 'يحكم ما تجمعه مسيرتك المهنية فعليًا — الراتب والمدخرات من العمل، الموارد التي تتحكم بها مهنتك، وكيف تتحدث عن قيمتك.',
    },
    {
      theme: 'المبادرة والمهارة',
      keywords: ['الشجاعة', 'التواصل', 'الترويج الذاتي'],
      reading: 'بيت الشجاعة المهنية — العروض التقديمية، المفاوضات، المهارات المصقولة بالممارسة، والخطوات الجريئة التي تفصل الطموحين عن الراضين.',
    },
    {
      theme: 'بيئة العمل',
      keywords: ['مكان العمل', 'الاستقرار', 'الأصول'],
      reading: 'يُظهر الظروف التي تعمل فيها بأفضل حال — المكتب مقابل الميدان، الرضا العاطفي في العمل، والأصول الثابتة (الممتلكات، المركبات) التي تبنيها المسيرة المهنية.',
    },
    {
      theme: 'السلطة الإبداعية',
      keywords: ['الاستراتيجية', 'المضاربة', 'توجيه الآخرين'],
      reading: 'يحكم المخاطرة الذكية في المسيرة المهنية — الاستراتيجية، المضاربة، الإنتاج الإبداعي، المناصب الاستشارية، والتقدير الذي يأتي من التفكير الأصيل.',
    },
    {
      theme: 'الخدمة والمنافسة',
      keywords: ['الكدح اليومي', 'المنافسون', 'حل المشكلات'],
      reading: 'بيت ساحة المعركة — المنافسة، سياسات المكتب، الخدمة المؤداة، الديون والالتزامات، والمشاكل اليومية التي يصبح حلها سمعتك.',
    },
    {
      theme: 'الشراكات والعملاء',
      keywords: ['شركاء العمل', 'العقود', 'الجمهور'],
      reading: 'يحكم الروابط المهنية الفردية — شركاء العمل، العملاء الرئيسيون، العقود والصفقات، ومدى براعتك في التعامل مع الشخص الجالس أمامك.',
    },
    {
      theme: 'التحولات المفاجئة والبحث',
      keywords: ['التحول', 'أموال الآخرين', 'العمل العميق'],
      reading: 'بيت التحول المهني — تغييرات مهنية مفاجئة، التعامل مع أموال الآخرين، البحث والعمل العميق، وإعادة الميلاد بعد الاضطراب.',
    },
    {
      theme: 'المرشدون والحظ',
      keywords: ['الحظ', 'التعليم العالي', 'التوجيه'],
      reading: 'يُظهر النعمة في مسيرتك المهنية — المرشدون الذين يفتحون الأبواب، التعليم المتقدم الذي يرفع مسارك، الأخلاقيات في العمل، وفرص السفر البعيد.',
    },
    {
      theme: 'الكارما والمكانة',
      keywords: ['الإنجاز', 'السلطة', 'المكانة العامة'],
      reading: 'قمة الداسامسا — أعلى إنجاز مهني لك، السلطة التي تمارسها في النهاية، والأثر الذي يتركه عملك في العالم.',
    },
    {
      theme: 'الدخل والشبكات',
      keywords: ['المكاسب', 'الدائرة المهنية', 'الطموحات'],
      reading: 'يحكم الحصاد — تدفقات الدخل، الشبكة المهنية التي تضاعف مدى وصولك، والتحقيق الثابت للطموحات طويلة الأمد.',
    },
    {
      theme: 'الخارج وخلف الكواليس',
      keywords: ['العمل في الخارج', 'العمل الانفرادي', 'النفقات'],
      reading: 'بيت العمل غير المرئي — المهام في الخارج، الأدوار عن بُعد أو خلف الكواليس، العمل المؤسسي، تكاليف ممارسة الأعمال، والانسحاب النهائي من المسرح.',
    },
  ],
  ko: [
    {
      theme: '직업적 자아',
      keywords: ['추진력', '일에서의 정체성', '주도성'],
      reading: '이곳은 다삼샤 라그나 영역입니다 — 당신의 직업적 페르소나를 설명합니다: 일에 쏟는 에너지, 동료들이 처음 당신을 읽는 방식, 그리고 당신의 야망의 본능적인 스타일.',
    },
    {
      theme: '획득한 부',
      keywords: ['소득', '자원', '제공되는 가치'],
      reading: '당신의 경력이 실제로 축적하는 것을 관장합니다 — 일에서 나오는 급여와 저축, 당신의 직업이 다루는 자원, 그리고 당신의 가치를 말하는 방식.',
    },
    {
      theme: '진취성과 기술',
      keywords: ['용기', '소통', '자기 홍보'],
      reading: '직업적 용기의 하우스 — 제안, 협상, 연습으로 다듬어진 기술, 그리고 야심 있는 사람과 안주하는 사람을 가르는 대담한 행보.',
    },
    {
      theme: '근무 환경',
      keywords: ['일터', '안정성', '자산'],
      reading: '당신이 가장 잘 일하는 조건을 보여줍니다 — 사무실인지 현장인지, 일에서의 정서적 만족, 그리고 경력이 쌓는 고정 자산(부동산, 차량).',
    },
    {
      theme: '창의적 권위',
      keywords: ['전략', '투기', '타인 지도'],
      reading: '경력에서의 지적인 위험 감수를 관장합니다 — 전략, 투기, 창의적 결과물, 자문 직위, 그리고 독창적인 사고에서 오는 인정.',
    },
    {
      theme: '봉사와 경쟁',
      keywords: ['일상의 고됨', '경쟁자', '문제 해결'],
      reading: '전쟁터 하우스 — 경쟁, 사내 정치, 제공한 봉사, 부채와 의무, 그리고 해결하는 것이 곧 당신의 평판이 되는 일상의 문제들.',
    },
    {
      theme: '파트너십과 고객',
      keywords: ['사업 파트너', '계약', '대중'],
      reading: '일대일 직업적 유대를 관장합니다 — 사업 파트너, 핵심 고객, 계약과 거래, 그리고 맞은편 사람을 얼마나 능숙하게 다루는지.',
    },
    {
      theme: '급변과 연구',
      keywords: ['변형', "타인의 돈", '심층 작업'],
      reading: '직업적 변태의 하우스 — 갑작스러운 경력 변화, 타인의 자금을 다루는 것, 연구와 심층 작업, 그리고 격변 후의 재탄생.',
    },
    {
      theme: '멘토와 행운',
      keywords: ['행운', '고등 학문', '지도'],
      reading: '당신 경력의 은총을 보여줍니다 — 문을 열어주는 멘토, 궤적을 끌어올리는 고급 학문, 사업에서의 윤리, 그리고 장거리 기회.',
    },
    {
      theme: '카르마와 지위',
      keywords: ['성취', '권위', '대외적 지위'],
      reading: '다삼샤의 정점 — 당신의 최고 직업적 성취, 당신이 궁극적으로 행사하는 권위, 그리고 당신의 일이 세상에 남기는 흔적.',
    },
    {
      theme: '소득과 네트워크',
      keywords: ['이득', '직업적 서클', '야망'],
      reading: '수확을 관장합니다 — 소득원, 당신의 영향력을 배가시키는 직업적 네트워크, 그리고 오래 품어온 야망의 꾸준한 성취.',
    },
    {
      theme: '해외와 배후 작업',
      keywords: ['해외 근무', '혼자 하는 일', '지출'],
      reading: '보이지 않는 일의 하우스 — 해외 파견, 원격 또는 배후의 역할, 조직 내 업무, 사업 비용, 그리고 결국 무대에서 물러나는 것.',
    },
  ],
};
const D9_PLANET_EFFECTS_TR: Partial<Record<Exclude<Lang, 'en'>, Record<string, string>>> = {
  ml: {
  Sun: 'ബന്ധത്തിലേക്ക് അന്തസ്സും അധികാരവും കൊണ്ടുവരുന്നു — ശക്തമായ ആത്മാഭിമാനമുള്ള ഒരു പങ്കാളി (അല്ലെങ്കിൽ പങ്കാളിത്ത ചലനാത്മകത). അഹം ബോധപൂർവം കിടപ്പുമുറിയിൽ നിന്നും അടുക്കളയിൽ നിന്നും അകറ്റി നിർത്തണം.',
  Moon: 'ആഴമേറിയ വൈകാരിക പ്രവാഹങ്ങൾ കൊണ്ടുവരുന്നു — പരിപോഷണം, മാനസികാവസ്ഥകൾ, പങ്കാളിയോടൊപ്പം വീട്ടിലാണെന്ന് തോന്നാനുള്ള ആവശ്യം. വൈകാരിക സത്യസന്ധതയോടെ ബന്ധം ഉയരുകയും താഴുകയും ചെയ്യുന്നു.',
  Mars: 'അഭിനിവേശവും ചൂടും കൊണ്ടുവരുന്നു — ശാരീരിക രസതന്ത്രം, പക്ഷേ വേഗത്തിലുള്ള കോപവും. നന്നായി ചാലിതമായാൽ അത് വിവാഹത്തെ സംരക്ഷിക്കുന്നു; ചാലിതമല്ലെങ്കിൽ ആവർത്തിച്ചുള്ള പൊട്ടിത്തെറികൾക്ക് കാരണമാകുന്നു.',
  Mercury: 'കുസൃതിയും സംഭാഷണവും കൊണ്ടുവരുന്നു — ഒരു യുവത്വമുള്ള, ആശയവിനിമയപരമായ സ്വാദ്. നിങ്ങൾ ഇരുവരും യഥാർത്ഥത്തിൽ സംസാരിക്കുന്നിടത്തോളം ബന്ധം ജീവനോടെ നിലനിൽക്കുന്നു.',
  Jupiter: 'ജ്ഞാനവും അനുഗ്രഹവും കൊണ്ടുവരുന്നു — ബന്ധത്തിന് വളർച്ച, ഔദാര്യം, ധാർമ്മിക സംരക്ഷണം. നവാംശ ഭാവത്തിന് ലഭിക്കാവുന്ന ഏറ്റവും മികച്ച സ്വാധീനങ്ങളിലൊന്ന്.',
  Venus: 'വിവാഹത്തിന്റെ തന്നെ കാരകൻ ഇവിടെ സ്ഥിതി ചെയ്യുന്നു — സ്നേഹം, മാർദ്ദവം, ഇന്ദ്രിയ യോജിപ്പ് എന്നിവ ബന്ധത്തിന്റെ ഈ മേഖലയിൽ കേന്ദ്രീകരിക്കുന്നു. ഇതിന്റെ ദിഗ്നിറ്റി മറ്റെന്തിനെക്കാളും പ്രധാനമാണ്.',
  Saturn: 'കടമയും സഹനശക്തിയും കൊണ്ടുവരുന്നു — പക്വവും ഗൗരവമേറിയതുമായ സ്വരം, ചിലപ്പോൾ കാലതാമസമോ പ്രായവ്യത്യാസമോ. അത് മന്ദഗതിയിലാക്കുന്നത് ഏതാണ്ട് തകർക്കാനാവാത്തതാക്കുകയും ചെയ്യുന്നു.',
  Rahu: 'തീവ്രതയും അപാരമ്പര്യതയും കൊണ്ടുവരുന്നു — ആകർഷണം, വിദേശമോ അസാധാരണമോ ആയ ഘടകങ്ങൾ, മോഹാവേശത്തിലേക്ക് വഴിമാറാവുന്ന വിശപ്പുകൾ. ബോധപൂർവമായ അടിസ്ഥാനം ആവശ്യമാണ്.',
  Ketu: 'വിരക്തിയും ആത്മീയമായ ഒരു അടിയൊഴുക്കും കൊണ്ടുവരുന്നു — മുൻജന്മ പരിചയത്തിന്റെ ഒരു തോന്നൽ, പക്ഷേ ഈ മേഖലയോട് അശ്രദ്ധയും. ബന്ധം ബോധപൂർവം പരിശീലിക്കേണ്ടതുണ്ട്.',
},
  ja: {
    Sun: '関係に威厳と権威をもたらします — 強い自尊心を持つパートナー（またはパートナーシップの力学）。エゴは意識的に寝室と台所から遠ざける必要があります。',
    Moon: '深い感情の流れをもたらします — 育む力、気分の変化、そしてパートナーと共に安心を感じる必要性です。絆は感情的な誠実さと共に高まり、また揺らぎます。',
    Mars: '情熱と熱をもたらします — 身体的な相性の良さですが、短気でもあります。うまく方向づければ結婚を守りますが、そうでなければ繰り返し衝突の火花を散らします。',
    Mercury: '遊び心と会話をもたらします — 若々しく、コミュニケーション豊かな味わいです。2人が本当に語り合い続ける限り、関係は生き生きとし続けます。',
    Jupiter: '知恵と祝福をもたらします — 結びつきへの成長、寛大さ、そしてダルマ的な保護です。ナヴァムシャのハウスが受けられる最良の影響の一つです。',
    Venus: '結婚そのもののカラカがここに配置されています — 愛、洗練、そして官能的な調和がこの結びつきの領域に集中します。その品位は他の何よりも重要です。',
    Saturn: '義務と忍耐をもたらします — 成熟した、真剣な調子で、時には遅れや年齢差を伴います。遅らせるものは、同時にほぼ壊れないものにもします。',
    Rahu: '強烈さと型破りさをもたらします — 魅了、外国的または異例の要素、そして執着に転じかねない欲求です。意識的な地に足のついた対応が必要です。',
    Ketu: '離脱と精神的な基調をもたらします — 前世からの馴染みのような感覚ですが、この分野への放心状態も伴います。つながりは積極的に実践される必要があります。',
  },
  ar: {
    Sun: 'يجلب الكرامة والسلطة إلى العلاقة — شريك (أو ديناميكية شراكة) بتقدير ذاتي قوي. يجب إبقاء الأنا خارج غرفة النوم والمطبخ بوعي.',
    Moon: 'يجلب تيارات عاطفية عميقة — الرعاية، التقلبات المزاجية، والحاجة للشعور بالراحة مع الشريك. تصعد الرابطة وتهبط مع الصدق العاطفي.',
    Mars: 'يجلب الشغف والحرارة — الانجذاب الجسدي، لكن أيضًا فتيلًا سريع الاشتعال. إذا وُجِّه جيدًا، يحمي الزواج؛ وإن لم يُوجَّه، يشعل توترات متكررة.',
    Mercury: 'يجلب المرح والحوار — نكهة شبابية وتواصلية. تبقى العلاقة حية طالما يستمر الطرفان في الحديث بصدق.',
    Jupiter: 'يجلب الحكمة والبركة — النمو، الكرم، والحماية الدارمية للرابطة. من أفضل التأثيرات التي يمكن أن يستقبلها بيت النافامسا.',
    Venus: 'كاراكا الزواج نفسه واقع هنا — الحب، الرقي، والانسجام الحسي يتركزان في هذا الجانب من الرابطة. كرامته أهم من أي شيء آخر.',
    Saturn: 'يجلب الواجب والصبر — نبرة ناضجة وجادة، أحيانًا تأخير أو فارق عمر. ما يبطئه، يجعله أيضًا شبه غير قابل للكسر.',
    Rahu: 'يجلب التكثيف واللاتقليدية — الافتتان، عناصر أجنبية أو غير عادية، وشهوات قد تتحول إلى هوس. يحتاج تأريضًا واعيًا.',
    Ketu: 'يجلب اللامبالاة ونبرة روحية — شعور بألفة من حياة سابقة، لكن أيضًا شرود ذهني تجاه هذا الجانب. يجب ممارسة الاتصال بفعالية.',
  },
  ko: {
    Sun: '관계에 위엄과 권위를 가져옵니다 — 강한 자존감을 지닌 파트너(또는 파트너십의 역학). 자아는 의식적으로 침실과 부엌에서 배제되어야 합니다.',
    Moon: '깊은 감정의 흐름을 가져옵니다 — 돌봄, 기분 변화, 그리고 파트너와 함께 있을 때 편안함을 느끼고 싶은 욕구. 유대는 정서적 정직함에 따라 오르내립니다.',
    Mars: '열정과 열기를 가져옵니다 — 신체적 케미스트리이지만 급한 성미도 함께 옵니다. 잘 다스려지면 결혼을 보호하고, 다스려지지 않으면 반복되는 다툼을 일으킵니다.',
    Mercury: '장난기와 대화를 가져옵니다 — 젊고 소통적인 분위기. 관계는 두 사람이 진심으로 계속 대화하는 한 살아 있습니다.',
    Jupiter: '지혜와 축복을 가져옵니다 — 결합에 성장, 관대함, 다르마적 보호를 더합니다. 나밤샤 하우스가 받을 수 있는 최고의 영향 중 하나입니다.',
    Venus: '결혼의 카라카 자체가 이곳에 놓입니다 — 사랑, 세련됨, 관능적 조화가 결합의 이 영역에 집중됩니다. 그 디그니티가 다른 무엇보다 중요합니다.',
    Saturn: '의무와 인내를 가져옵니다 — 성숙하고 진지한 어조, 때로는 지연이나 나이 차이. 늦추는 것은 거의 깨지지 않게도 만듭니다.',
    Rahu: '강렬함과 파격을 가져옵니다 — 매혹, 이국적이거나 특이한 요소, 그리고 집착으로 기울 수 있는 욕망. 의식적인 안정이 필요합니다.',
    Ketu: '초연함과 영적인 저류를 가져옵니다 — 전생의 친숙함 같은 느낌이지만 이 영역에 대한 무심함도 함께 옵니다. 연결은 적극적으로 연습되어야 합니다.',
  },
};
const D10_PLANET_EFFECTS_TR: Partial<Record<Exclude<Lang, 'en'>, Record<string, string>>> = {
  ml: {
  Sun: 'നേതൃത്വവും ദൃശ്യതയും കൊണ്ടുവരുന്നു — അധികാര സ്ഥാനങ്ങൾ, സർക്കാർ അല്ലെങ്കിൽ സ്ഥാപന പ്രീതി, ഒരു വേദി ആവശ്യമുള്ള കരിയർ. അംഗീകാരമാണ് ഇന്ധനം.',
  Moon: 'പൊതു ബന്ധം കൊണ്ടുവരുന്നു — ആളുകളെ അഭിമുഖീകരിക്കുന്ന കരിയറുകൾ: പരിചരണം, ആതിഥ്യമര്യാദ, ബ്രാൻഡുകൾ, പൊതു മാനസികാവസ്ഥ. റോളുകൾ ഏറ്റക്കുറച്ചിലുകൾ ഉണ്ടാകാം; പൊരുത്തപ്പെടൽ ശക്തിയാണ്.',
  Mars: 'ചാലകശക്തിയും സാങ്കേതിക മുൻതൂക്കവും കൊണ്ടുവരുന്നു — എഞ്ചിനീയറിംഗ്, പ്രതിരോധം, ശസ്ത്രക്രിയ, കായികം, മത്സരം. സമ്മർദ്ദത്തിൻ കീഴിലുള്ള തീരുമാനശേഷിക്ക് പ്രതിഫലം ലഭിക്കുന്നിടത്ത് ഏറ്റവും മികച്ചത്.',
  Mercury: 'വാണിജ്യവും ബുദ്ധിയും കൊണ്ടുവരുന്നു — എഴുത്ത്, വിശകലനം, വ്യാപാരം, കൺസൾട്ടിംഗ്. ആശയവിനിമയത്തിന്റെയും വിശദാംശങ്ങളുടെയും ഗുണനിലവാരത്തിലാണ് കരിയർ വളരുന്നത്.',
  Jupiter: 'ഉപദേശവും വികാസവും കൊണ്ടുവരുന്നു — അധ്യാപനം, നിയമം, ധനകാര്യം, ഉപദേശക റോളുകൾ. മുതിർന്ന നിലയിലേക്ക് സ്വാഭാവികമായി എത്തുന്നു; ജ്ഞാനം തന്നെ ഉൽപ്പന്നമായി മാറുന്നു.',
  Venus: 'സൗന്ദര്യശാസ്ത്രവും നയതന്ത്രവും കൊണ്ടുവരുന്നു — കല, രൂപകൽപ്പന, ആഡംബരം, പങ്കാളിത്തങ്ങൾ, ചർച്ചകൾ. അഭിരുചിയും ബന്ധങ്ങളും പ്രധാനമായ ഇടങ്ങളിൽ കരിയർ തഴച്ചുവളരുന്നു.',
  Saturn: 'നീണ്ട കയറ്റം കൊണ്ടുവരുന്നു — ഘടന, സ്ഥിരോത്സാഹം, ആവർത്തനത്തിലൂടെയുള്ള വൈദഗ്ധ്യം. മന്ദഗതിയിലുള്ള ആദ്യ വർഷങ്ങൾ പിന്നീട് ദീർഘകാല, ഈടുനിൽക്കുന്ന അധികാരമായി വർദ്ധിക്കുന്നു.',
  Rahu: 'അപാരമ്പര്യമായ ഉയർച്ച കൊണ്ടുവരുന്നു — സാങ്കേതികവിദ്യ, വിദേശ കമ്പനികൾ, പുതിയ വ്യവസായങ്ങൾ, പെട്ടെന്നുള്ള ഉയർച്ചകൾ. ഉയർന്ന പ്രതിഫലം, പക്ഷേ കുറുക്കുവഴികളിൽ നിന്ന് സൂക്ഷിക്കുക.',
  Ketu: 'വിദഗ്ധന്റെ പാത കൊണ്ടുവരുന്നു — ഗവേഷണം, നിഗൂഢമോ സാങ്കേതികമോ ആയ ആഴം, തിരശ്ശീലയ്ക്ക് പിന്നിലുള്ള വൈദഗ്ധ്യം. ശ്രദ്ധയുടെ കേന്ദ്രമാകേണ്ട ആവശ്യമില്ലാതെയുള്ള സ്വാധീനം.',
},
  ja: {
    Sun: 'リーダーシップと存在感をもたらします — 権威ある役割、政府や組織からの支持、そして舞台を必要とするキャリアです。評価が原動力です。',
    Moon: '大衆とのつながりをもたらします — 人と向き合うキャリア：ケア、ホスピタリティ、ブランド、大衆の気分です。役割は変動することがあり、適応力が強みです。',
    Mars: '活力と技術的な鋭さをもたらします — 工学、防衛、外科、スポーツ、競技です。プレッシャーの中での決断力が報われる場所で最も力を発揮します。',
    Mercury: '商業と知性をもたらします — 執筆、分析、貿易、コンサルティングです。キャリアはコミュニケーションと細部の質の上に成長します。',
    Jupiter: '助言と拡大をもたらします — 教育、法律、金融、コンサルティングです。年功は自然に訪れ、知恵そのものが成果となります。',
    Venus: '美意識と外交手腕をもたらします — 芸術、デザイン、贅沢品、パートナーシップ、交渉です。センスと人間関係が重要な場所でキャリアは花開きます。',
    Saturn: '長い登り道をもたらします — 構造、粘り強さ、繰り返しによる熟達です。ゆっくりとした初期の年月が積み重なり、後年の持続的な権威となります。',
    Rahu: '型破りな上昇をもたらします — テクノロジー、外資系企業、新興産業、突然の昇進です。高い報酬がありますが、近道には注意が必要です。',
    Ketu: 'スペシャリストの道をもたらします — 研究、難解または技術的な深さ、舞台裏での熟達です。スポットライトを必要としない影響力です。',
  },
  ar: {
    Sun: 'يجلب القيادة والظهور — أدوار سلطوية، رضا حكومي أو مؤسسي، ومسيرة مهنية تحتاج منصة. التقدير هو الوقود.',
    Moon: 'يجلب اتصالًا عامًا — مسيرات مهنية تواجه الناس: الرعاية، الضيافة، العلامات التجارية، المزاج العام. قد تتقلب الأدوار؛ القدرة على التكيف هي القوة.',
    Mars: 'يجلب الدافع والحدة التقنية — الهندسة، الدفاع، الجراحة، الرياضة، المنافسة. أفضل ما يكون حيث يُكافأ الحسم تحت الضغط.',
    Mercury: 'يجلب التجارة والفكر — الكتابة، التحليلات، التجارة، الاستشارات. تنمو المسيرة المهنية على جودة التواصل والتفاصيل.',
    Jupiter: 'يجلب المشورة والتوسع — التدريس، القانون، المالية، الاستشارة. تصل الأقدمية بشكل طبيعي؛ تصبح الحكمة هي المنتج.',
    Venus: 'يجلب الجماليات والدبلوماسية — الفنون، التصميم، الرفاهية، الشراكات، التفاوض. تزدهر المسيرة المهنية حيث يهم الذوق والعلاقات.',
    Saturn: 'يجلب التسلق الطويل — البنية، المثابرة، الإتقان من خلال التكرار. سنوات بطيئة في البداية تتراكم إلى سلطة متأخرة ودائمة.',
    Rahu: 'يجلب صعودًا غير تقليدي — التكنولوجيا، الشركات الأجنبية، الصناعات الجديدة، الارتقاءات المفاجئة. مكافأة عالية، لكن احذر من الاختصارات.',
    Ketu: 'يجلب طريق المتخصص — البحث، العمق الباطني أو التقني، الإتقان خلف الكواليس. تأثير دون الحاجة لدائرة الضوء.',
  },
  ko: {
    Sun: '리더십과 가시성을 가져옵니다 — 권위 있는 역할, 정부나 기관의 호의, 그리고 무대가 필요한 경력. 인정이 원동력입니다.',
    Moon: '대중과의 연결을 가져옵니다 — 사람을 마주하는 경력: 돌봄, 접객, 브랜드, 대중의 정서. 역할이 변동할 수 있지만 적응력이 강점입니다.',
    Mars: '추진력과 기술적 예리함을 가져옵니다 — 공학, 국방, 외과, 스포츠, 경쟁. 압박 속에서 결단력이 보상받는 곳에서 최적입니다.',
    Mercury: '상업과 지성을 가져옵니다 — 글쓰기, 분석, 무역, 컨설팅. 경력은 소통과 세부사항의 질에 따라 성장합니다.',
    Jupiter: '조언과 확장을 가져옵니다 — 교육, 법률, 금융, 자문. 연륜이 자연스럽게 찾아오며 지혜가 결과물이 됩니다.',
    Venus: '미학과 외교를 가져옵니다 — 예술, 디자인, 럭셔리, 파트너십, 협상. 취향과 관계가 중요한 곳에서 경력이 번창합니다.',
    Saturn: '긴 오르막을 가져옵니다 — 구조, 끈기, 반복을 통한 숙달. 느린 초기 시절이 쌓여 늦지만 오래가는 권위가 됩니다.',
    Rahu: '파격적인 상승을 가져옵니다 — 기술, 외국 기업, 새로운 산업, 갑작스러운 승진. 높은 보상이지만 지름길을 경계해야 합니다.',
    Ketu: '전문가의 길을 가져옵니다 — 연구, 밀교적이거나 기술적인 깊이, 배후에서의 숙달. 스포트라이트 없이도 영향력을 갖습니다.',
  },
};

function housesFor(variant: VargaVariant, lang: Lang): HouseTheme[] {
  const base = variant === 'D9' ? D9_HOUSES : D10_HOUSES;
  if (lang === 'en') return base;
  const tr = (variant === 'D9' ? D9_HOUSES_TR : D10_HOUSES_TR)[lang];
  return tr ?? base;
}

function planetEffectsFor(variant: VargaVariant, lang: Lang): Record<string, string> {
  const base = variant === 'D9' ? D9_PLANET_EFFECTS : D10_PLANET_EFFECTS;
  if (lang === 'en') return base;
  const tr = (variant === 'D9' ? D9_PLANET_EFFECTS_TR : D10_PLANET_EFFECTS_TR)[lang];
  return tr ?? base;
}

const STRONG: DignityLevel[] = ['exalted', 'own-sign', 'friend-sign'];
const WEAK: DignityLevel[] = ['enemy-sign', 'debilitated'];

const CLAUSE_AREA: Record<VargaVariant, Record<Lang, string>> = {
  D9: {
    en: 'this side of the marriage', si: 'විවාහයේ මෙම පැත්ත', ta: 'திருமணத்தின் இந்தப் பக்கம்', zh: '婚姻的这一面',
    hi: 'विवाह का यह पक्ष', ja: '結婚のこの側面', ko: '결혼의 이 측면', ar: 'هذا الجانب من الزواج', ml: 'വിവാഹത്തിന്റെ ഈ വശം',
  },
  D10: {
    en: 'this side of the career', si: 'වෘත්තියේ මෙම පැත්ත', ta: 'தொழிலின் இந்தப் பக்கம்', zh: '事业的这一面',
    hi: 'करियर का यह पक्ष', ja: 'キャリアのこの側面', ko: '경력의 이 측면', ar: 'هذا الجانب من المسيرة المهنية', ml: 'കരിയറിന്റെ ഈ വശം',
  },
};

/** "own sign" / "friend sign" — only STRONG dignities other than exalted reach this label. */
const CLAUSE_DIGNITY_LABEL: Partial<Record<DignityLevel, Record<Lang, string>>> = {
  'own-sign': {
    en: 'own sign', si: 'ස්වක්ෂේත්‍ර', ta: 'சொந்த ராசி', zh: '本宫', hi: 'स्वराशि',
    ja: '自室', ko: '본좌', ar: 'برجه الخاص', ml: 'സ്വന്തം രാശി',
  },
  'friend-sign': {
    en: 'friend sign', si: 'මිත්‍ර ක්ෂේත්‍ර', ta: 'நட்பு ராசி', zh: '友宫', hi: 'मित्र राशि',
    ja: '友好サイン', ko: '우호 별자리', ar: 'برج صديق', ml: 'മിത്ര രാശി',
  },
};

function dignityClause(planet: string, dignity: DignityLevel, variant: VargaVariant, lang: Lang): string {
  const area = CLAUSE_AREA[variant][lang];
  if (dignity === 'exalted') {
    switch (lang) {
      case 'si': return ` මෙහි උච්ච වූ ${planet}, එහි ඉතාම හොඳම ප්‍රතිඵලය ලබා දෙයි — ${area} සුවිශේෂී ශක්තියක් බවට පත් වේ.`;
      case 'ta': return ` இங்கு உச்சமடைந்துள்ள ${planet}, தனது சிறந்த பலனை அளிக்கிறது — ${area} ஒரு தனித்துவமான பலமாக மாறுகிறது.`;
      case 'zh': return `在此擢升的${planet}，发挥出最好的一面——${area}成为一项标志性的优势。`;
      case 'hi': return ` यहाँ उच्च राशि में, ${planet} अपना सर्वश्रेष्ठ देता है — ${area} एक विशिष्ट शक्ति बन जाता है.`;
      case 'ja': return `ここで高揚している${planet}は最良の力を発揮する——${area}は際立った強みとなる。`;
      case 'ko': return `여기서 고양된 ${planet}은 최고의 결과를 낸다 — ${area}는 뚜렷한 강점이 된다.`;
      case 'ar': return ` مُشرَّف هنا، يقدم ${planet} أفضل ما لديه — يصبح ${area} قوة مميزة.`;
      case 'ml': return ` ഇവിടെ ഉച്ചത്തിലായ ${planet}, അതിന്റെ ഏറ്റവും മികച്ചത് നൽകുന്നു — ${area} ഒരു സവിശേഷ ശക്തിയായി മാറുന്നു.`;
      default: return ` Exalted here, ${planet} delivers its very best — ${area} becomes a signature strength.`;
    }
  }
  if (STRONG.includes(dignity)) {
    const label = CLAUSE_DIGNITY_LABEL[dignity]?.[lang] ?? CLAUSE_DIGNITY_LABEL[dignity]?.en ?? dignity;
    switch (lang) {
      case 'si': return ` මෙහි හොඳින් ස්ථානගත වී ඇත (${label}), එය ${area}ට විශ්වාසදායක ලෙස සහාය වේ.`;
      case 'ta': return ` இங்கு நன்கு அமைந்துள்ளது (${label}), இது ${area} ஐ நம்பகமாக ஆதரிக்கிறது.`;
      case 'zh': return `在此位置良好（${label}），可靠地支持${area}。`;
      case 'hi': return ` यहाँ अच्छी स्थिति में (${label}), यह ${area} को भरोसेमंद ढंग से सहारा देता है.`;
      case 'ja': return `ここで良い位置にあり（${label}）、${area}を確実に支える。`;
      case 'ko': return `여기서 좋은 위치(${label})에 있어, ${area}를 안정적으로 뒷받침한다.`;
      case 'ar': return ` في وضع جيد هنا (${label})، يدعم ${area} بشكل موثوق.`;
      case 'ml': return ` ഇവിടെ നല്ല സ്ഥാനത്താണ് (${label}), ഇത് ${area} നെ വിശ്വസനീയമായി പിന്തുണയ്ക്കുന്നു.`;
      default: return ` Well-placed (${label}), it supports ${area} reliably.`;
    }
  }
  if (dignity === 'debilitated') {
    switch (lang) {
      case 'si': return ` මෙහි නීච වී ඇත, එහි ත්‍යාග එළඹෙන්නේ සවිඥානික නිවැරදි කිරීමේ උත්සාහයෙන් පසුව පමණි — ${area} සමඟ ඉවසිලිවන්ත වන්න.`;
      case 'ta': return ` இங்கு நீசமடைந்துள்ளது, அதன் பலன்கள் உணர்வுபூர்வமான பரிகார முயற்சிக்குப் பிறகே வருகின்றன — ${area} இல் பொறுமையாக இருங்கள்.`;
      case 'zh': return `在此落陷，其恩赐只有在自觉的补救努力之后才会到来——对${area}要有耐心。`;
      case 'hi': return ` यहाँ नीच राशि में, इसके फल सचेत उपचारात्मक प्रयास के बाद ही मिलते हैं — ${area} के साथ धैर्य रखें.`;
      case 'ja': return `ここで減衰しており、その恩恵は意識的な是正努力の後にのみ訪れる——${area}には辛抱強く。`;
      case 'ko': return `여기서 쇠약해져 있어, 그 결실은 의식적인 개선 노력 후에야 찾아온다 — ${area}에 인내심을 가지라.`;
      case 'ar': return ` منحطّ هنا، لا تصل هباته إلا بعد جهد علاجي واعٍ — كن صبورًا مع ${area}.`;
      case 'ml': return ` ഇവിടെ നീചത്തിലാണ്, ബോധപൂർവമായ പരിഹാര പ്രയത്നത്തിനു ശേഷം മാത്രമേ അതിന്റെ സമ്മാനങ്ങൾ എത്തൂ — ${area} യിൽ ക്ഷമയോടെയിരിക്കുക.`;
      default: return ` Debilitated here, its gifts arrive only after conscious remedial effort — be patient with ${area}.`;
    }
  }
  if (WEAK.includes(dignity)) {
    switch (lang) {
      case 'si': return ` සතුරු ක්ෂේත්‍රයක සිටින බැවින්, එහි ප්‍රතිඵල මිශ්‍ර වේ — ${area}ට අමතර හිතාමතා උත්සාහයක් අවශ්‍යයි.`;
      case 'ta': return ` பகை ராசியில் உள்ளதால், அதன் முடிவுகள் கலவையானவை — ${area} கூடுதல் வேண்டுமென்ற முயற்சியைக் கோருகிறது.`;
      case 'zh': return `落入敌宫，结果好坏参半——${area}需要额外的刻意努力。`;
      case 'hi': return ` शत्रु राशि में होने से, इसके परिणाम मिले-जुले हैं — ${area} को अतिरिक्त सोच-समझकर किए प्रयास की ज़रूरत है.`;
      case 'ja': return `敵の座にあるため、結果は入り混じる——${area}にはさらに意識的な努力が必要。`;
      case 'ko': return `적의 별자리에 있어 결과가 엇갈린다 — ${area}는 추가적인 의도적 노력을 요구한다.`;
      case 'ar': return ` في برج عدو، تأتي نتائجه متفاوتة — يتطلب ${area} جهدًا إضافيًا مقصودًا.`;
      case 'ml': return ` ശത്രു രാശിയിലായതിനാൽ, ഫലങ്ങൾ സമ്മിശ്രമാണ് — ${area} ന് അധിക ബോധപൂർവമായ പരിശ്രമം ആവശ്യമാണ്.`;
      default: return ` In an enemy sign, its results are mixed — ${area} asks for extra deliberate work.`;
    }
  }
  return '';
}

export interface VargaPlanetEffect {
  planet: string;
  effect: string;
  dignity: DignityLevel;
  isVargottama: boolean;
  isRetrograde: boolean;
}

export interface VargaHouseAnalysis {
  variant: VargaVariant;
  houseNumber: number; // 1–12 from the varga lagna
  rashiIndex: number;
  rashiName: string;
  rashiEnglish: string;
  rashiLord: string;
  lordHouse: number; // house (from varga lagna) where the lord of this sign sits; 0 if unknown
  theme: string;
  keywords: string[];
  reading: string;
  planetEffects: VargaPlanetEffect[];
  isLagna: boolean;
}

export function analyzeVargaHouse(
  variant: VargaVariant,
  rashiIndex: number,
  vargaAscendant: number,
  planets: VargaPlanet[],
  lang: Lang = 'en',
): VargaHouseAnalysis {
  const houseNumber = ((rashiIndex - vargaAscendant + 12) % 12) + 1;
  const themes = housesFor(variant, lang);
  const effects = planetEffectsFor(variant, lang);
  const theme = themes[houseNumber - 1];

  const rashiOf = (p: VargaPlanet) => (variant === 'D9' ? p.d9Rashi : p.d10Rashi);
  const dignityOf = (p: VargaPlanet) => (variant === 'D9' ? p.d9Dignity : p.d10Dignity);

  const occupants = planets.filter(p => rashiOf(p) === rashiIndex);
  const planetEffects: VargaPlanetEffect[] = occupants.map(p => ({
    planet: p.planet,
    dignity: dignityOf(p),
    isVargottama: p.isVargottama,
    isRetrograde: p.isRetrograde,
    effect: (effects[p.planet] ?? '') + dignityClause(p.planet, dignityOf(p), variant, lang),
  }));

  const lord = RASHI_LORDS[rashiIndex];
  const lordPos = planets.find(p => p.planet === lord);
  const lordHouse = lordPos ? ((rashiOf(lordPos) - vargaAscendant + 12) % 12) + 1 : 0;

  return {
    variant,
    houseNumber,
    rashiIndex,
    rashiName: RASHIS[rashiIndex],
    rashiEnglish: RASHI_ENGLISH[rashiIndex],
    rashiLord: lord,
    lordHouse,
    theme: theme.theme,
    keywords: theme.keywords,
    reading: theme.reading,
    planetEffects,
    isLagna: houseNumber === 1,
  };
}

// ─── Generic reading for the minor divisional charts (D2, D3, …, D60) ────────
// Rather than hand-authoring twelve house meanings for every extra varga, the
// reading is composed from the varga's life-area, the universal bhava theme of
// the clicked house, and the planets that occupy it (with their varga dignity).

import { HOUSE_DATA } from './planetaryAnalysis';
import { plainMeaningFor, plainPlanetEffect } from './vargaMeanings';
import type { VargaCode } from './vargas';

const DIGNITY_TONE: Record<DignityLevel, Record<Lang, string>> = {
  'exalted': {
    en: 'and does so with exceptional strength here', si: 'මෙහි අසාමාන්‍ය ශක්තියෙන් එසේ කරයි',
    ta: 'இங்கு விதிவிலக்கான பலத்துடன் அவ்வாறு செய்கிறது', zh: '并在此处以非凡的力量表现出来',
    hi: 'और यहाँ असाधारण शक्ति के साथ ऐसा करता है', ja: 'そしてここでは並外れた力でそれを行う',
    ko: '그리고 여기서 비범한 힘으로 그렇게 한다', ar: 'ويفعل ذلك بقوة استثنائية هنا',
    ml: 'ഇവിടെ അസാധാരണമായ ശക്തിയോടെ അത് ചെയ്യുന്നു',
  },
  'own-sign': {
    en: 'comfortably and reliably here', si: 'මෙහි සුවපහසුව හා විශ්වාසදායක ලෙස',
    ta: 'இங்கு வசதியாகவும் நம்பகமாகவும்', zh: '在此处舒适而可靠',
    hi: 'यहाँ सहजता और भरोसे के साथ', ja: 'ここでは快適かつ確実に',
    ko: '여기서 편안하고 안정적으로', ar: 'براحة وموثوقية هنا',
    ml: 'ഇവിടെ സൗകര്യപ്രദമായും വിശ്വസനീയമായും',
  },
  'friend-sign': {
    en: 'with steady support here', si: 'මෙහි ස්ථාවර සහයෝගයෙන්',
    ta: 'இங்கு நிலையான ஆதரவுடன்', zh: '在此处获得稳定的支持',
    hi: 'यहाँ स्थिर सहारे के साथ', ja: 'ここでは安定した支えとともに',
    ko: '여기서 꾸준한 지지와 함께', ar: 'بدعم ثابت هنا',
    ml: 'ഇവിടെ സ്ഥിരമായ പിന്തുണയോടെ',
  },
  'neutral-sign': {
    en: 'with average results here', si: 'මෙහි සාමාන්‍ය ප්‍රතිඵල සමඟ',
    ta: 'இங்கு சராசரி முடிவுகளுடன்', zh: '在此处结果平平',
    hi: 'यहाँ औसत परिणामों के साथ', ja: 'ここでは平均的な結果とともに',
    ko: '여기서 평범한 결과와 함께', ar: 'بنتائج متوسطة هنا',
    ml: 'ഇവിടെ ശരാശരി ഫലങ്ങളോടെ',
  },
  'enemy-sign': {
    en: 'but is somewhat strained here', si: 'නමුත් මෙහි යම් ලෙස පීඩනයට ලක්ව ඇත',
    ta: 'ஆனால் இங்கு சற்று அழுத்தத்துடன் உள்ளது', zh: '但在此处略显吃力',
    hi: 'पर यहाँ कुछ दबाव में है', ja: 'しかしここではやや苦戦する',
    ko: '하지만 여기서 다소 부담을 느낀다', ar: 'لكنه متوتر إلى حد ما هنا',
    ml: 'എന്നാൽ ഇവിടെ അൽപ്പം സമ്മർദ്ദത്തിലാണ്',
  },
  'debilitated': {
    en: 'though it struggles and needs conscious effort here', si: 'මෙහි අරගල කරන නමුත් සවිඥානික උත්සාහයක් අවශ්‍යයි',
    ta: 'இருப்பினும் இங்கு போராடி உணர்வுபூர்வமான முயற்சி தேவைப்படுகிறது', zh: '但在此处艰难，需要自觉努力',
    hi: 'हालाँकि यहाँ संघर्ष करता है और सचेत प्रयास चाहता है', ja: 'ここでは苦戦し、意識的な努力を必要とするものの',
    ko: '여기서 애를 먹으며 의식적인 노력이 필요하지만', ar: 'رغم أنه يعاني هنا ويحتاج جهدًا واعيًا',
    ml: 'ഇവിടെ പാടുപെടുന്നുവെങ്കിലും ബോധപൂർവമായ പരിശ്രമം ആവശ്യമാണ്',
  },
};

/** Sentence frames used when a chart has no plain-language reading yet. */
const EXTRA_TEXT = {
  genericEffect: (planet: string, theme: string, area: string, tone: string, lang: Lang): string => {
    switch (lang) {
      case 'si': return `${planet} ${area} තුළ ${theme} මත ක්‍රියා කරයි, ${tone}.`;
      case 'ta': return `${planet} ${area} இல் ${theme} மீது செயல்படுகிறது, ${tone}.`;
      case 'zh': return `${planet}在${area}范围内作用于${theme}，${tone}。`;
      case 'hi': return `${planet} ${area} में ${theme} पर असर डालता है, ${tone}.`;
      case 'ja': return `${planet}は${area}の中で${theme}に作用し、${tone}。`;
      case 'ko': return `${planet}은 ${area} 안에서 ${theme}에 작용하며, ${tone}.`;
      case 'ar': return `يؤثر ${planet} على ${theme} ضمن ${area}، ${tone}.`;
      case 'ml': return `${planet} ${area} ൽ ${theme} ൽ പ്രവർത്തിക്കുന്നു, ${tone}.`;
      default: return `${planet} acts on ${theme} within ${area} ${tone}.`;
    }
  },
  lagnaWithPlain: (lagnaMeaning: string, plainNameLower: string, rashiName: string, lang: Lang): string => {
    switch (lang) {
      case 'si': return `${lagnaMeaning} මෙය ඔබේ ${plainNameLower} හි ආරම්භක ලක්ෂ්‍යයයි — ${rashiName} නැගීම එහි අනෙකුත් සියල්ලට ස්වරය සකසයි.`;
      case 'ta': return `${lagnaMeaning} இது உங்கள் ${plainNameLower} இன் தொடக்கப் புள்ளி — ${rashiName} உதயமாவது அதிலுள்ள மற்ற அனைத்திற்கும் தொனியை அமைக்கிறது.`;
      case 'zh': return `${lagnaMeaning}这是你的${plainNameLower}的起点——${rashiName}上升为其中一切定下基调。`;
      case 'hi': return `${lagnaMeaning} यह आपके ${plainNameLower} का प्रारंभिक बिंदु है — ${rashiName} का उदय इसमें बाकी सब चीज़ों के लिए स्वर तय करता है.`;
      case 'ja': return `${lagnaMeaning}これはあなたの${plainNameLower}の出発点である——${rashiName}が上昇し、その他すべての基調を決める。`;
      case 'ko': return `${lagnaMeaning} 이것은 당신의 ${plainNameLower}의 출발점이다 — ${rashiName}이 떠오르며 그 안의 나머지 모든 것의 기조를 정한다.`;
      case 'ar': return `${lagnaMeaning} هذه نقطة انطلاق ${plainNameLower} الخاص بك — طلوع ${rashiName} يحدد نغمة كل شيء آخر فيه.`;
      case 'ml': return `${lagnaMeaning} ഇത് നിങ്ങളുടെ ${plainNameLower} ന്റെ ആരംഭ പോയിന്റാണ് — ${rashiName} ഉദിക്കുന്നത് അതിലെ മറ്റെല്ലാത്തിനും സ്വരം സജ്ജമാക്കുന്നു.`;
      default: return `${lagnaMeaning} This is the starting point of your ${plainNameLower} — ${rashiName} rising sets the tone for everything else in it.`;
    }
  },
  noPlanetHere: (rashiLord: string, rashiName: string, lang: Lang): string => {
    switch (lang) {
      case 'si': return ` මෙහි ග්‍රහයෙක් නොසිටී, එබැවින් මෙය ${rashiName} හි අධිපති ${rashiLord} හරහා ක්‍රියාත්මක වේ — මෙම කේන්දරයේ වෙනත් තැනක ${rashiLord} කෙසේ සිටිනවාදැයි බලන්න.`;
      case 'ta': return ` இங்கு எந்த கிரகமும் இல்லை, எனவே இது ${rashiName} இன் அதிபதியான ${rashiLord} வழியாக நடைபெறுகிறது — இந்த ஜாதகத்தில் மற்ற இடங்களில் ${rashiLord} எவ்வாறு உள்ளது எனப் பாருங்கள்.`;
      case 'zh': return `此处无行星驻留，因此这方面通过${rashiName}的主宰${rashiLord}来体现——请看${rashiLord}在这张图其他地方的状况。`;
      case 'hi': return ` यहाँ कोई ग्रह नहीं है, इसलिए यह ${rashiName} के स्वामी ${rashiLord} के माध्यम से प्रकट होता है — देखें कि इस कुंडली में अन्यत्र ${rashiLord} कैसा कर रहा है.`;
      case 'ja': return `ここには惑星がないため、${rashiName}のロードである${rashiLord}を通してこれが表れる——このチャートの他の場所で${rashiLord}がどうしているか見てほしい。`;
      case 'ko': return ` 여기에는 행성이 없으므로, ${rashiName}의 로드인 ${rashiLord}를 통해 나타난다 — 이 차트의 다른 곳에서 ${rashiLord}가 어떤 상태인지 보라.`;
      case 'ar': return ` لا يوجد كوكب هنا، لذا يظهر هذا من خلال ${rashiLord}، رب ${rashiName} — انظر كيف حال ${rashiLord} في مكان آخر من هذا المخطط.`;
      case 'ml': return ` ഇവിടെ ഒരു ഗ്രഹവുമില്ല, അതിനാൽ ഇത് ${rashiName} ന്റെ അധിപനായ ${rashiLord} വഴി പ്രവർത്തിക്കുന്നു — ഈ ജാതകത്തിൽ മറ്റെവിടെയെങ്കിലും ${rashiLord} എങ്ങനെയുണ്ടെന്ന് നോക്കുക.`;
      default: return ` No planet sits here, so this plays out through ${rashiLord}, the ruler of ${rashiName} — look at how ${rashiLord} is doing elsewhere in this chart.`;
    }
  },
  lagnaNoPlain: (vargaName: string, code: string, area: string, rashiName: string, lang: Lang): string => {
    switch (lang) {
      case 'si': return `මෙය ${vargaName} ලග්නයයි (${code}) — ${area} කියවන කාචයයි. මෙහි ${rashiName} නැගීම මුළු ${area} කේන්දරයම ප්‍රකාශ වන ආකාරයට ස්වරය සකසයි.`;
      case 'ta': return `இது ${vargaName} லக்னம் (${code}) — ${area} படிக்கப்படும் லென்ஸ். இங்கு ${rashiName} உதயமாவது முழு ${area} ஜாதகமும் வெளிப்படும் விதத்திற்கு தொனியை அமைக்கிறது.`;
      case 'zh': return `这是${vargaName}的上升点（${code}）——解读${area}的透镜。此处${rashiName}上升，为整个${area}星盘的展现方式定下基调。`;
      case 'hi': return `यह ${vargaName} लग्न है (${code}) — जिसके माध्यम से ${area} पढ़ा जाता है. यहाँ ${rashiName} का उदय पूरी ${area} कुंडली के व्यक्त होने के तरीके का स्वर तय करता है.`;
      case 'ja': return `これは${vargaName}のラグナである（${code}）——${area}を読み解くレンズだ。ここで${rashiName}が上昇し、${area}チャート全体がどう表現されるかの基調を決める。`;
      case 'ko': return `이것은 ${vargaName} 라그나이다 (${code}) — ${area}를 읽어내는 렌즈다. 여기서 ${rashiName}이 떠오르며 전체 ${area} 차트가 표현되는 방식의 기조를 정한다.`;
      case 'ar': return `هذا هو طالع ${vargaName} (${code}) — العدسة التي يُقرأ من خلالها ${area}. طلوع ${rashiName} هنا يحدد نغمة كيفية تعبير مخطط ${area} بأكمله عن نفسه.`;
      case 'ml': return `ഇത് ${vargaName} ലഗ്നമാണ് (${code}) — ${area} വായിക്കപ്പെടുന്ന ലെൻസ്. ഇവിടെ ${rashiName} ഉദിക്കുന്നത് മുഴുവൻ ${area} ജാതകവും പ്രകടിപ്പിക്കപ്പെടുന്ന രീതിക്ക് സ്വരം സജ്ജമാക്കുന്നു.`;
      default: return `This is the ${vargaName} lagna (${code}) — the lens through which ${area} is read. ${rashiName} rising here sets the tone for how the whole ${area} chart expresses itself.`;
    }
  },
  houseNoPlain: (vargaName: string, code: string, area: string, houseLbl: string, rashiName: string, rules: string, lang: Lang): string => {
    switch (lang) {
      case 'si': return `${vargaName} කේන්දරයේ (${code}), එය ${area} පරීක්ෂා කරන, මෙය ${rashiName} හි ${houseLbl}. එය ${rules} පාලනය කරයි — විශේෂයෙන් ${area} සම්බන්ධයෙන් කියවන්න.`;
      case 'ta': return `${vargaName} ஜாதகத்தில் (${code}), இது ${area} ஐ ஆராய்கிறது, இது ${rashiName} இல் உள்ள ${houseLbl}. இது ${rules} ஐ ஆளுகிறது — ${area} தொடர்பாக குறிப்பாகப் படியுங்கள்.`;
      case 'zh': return `在${vargaName}图中（${code}），它考察${area}，这是${rashiName}中的${houseLbl}。它主管${rules}——请具体结合${area}来解读。`;
      case 'hi': return `${vargaName} कुंडली में (${code}), जो ${area} की जाँच करती है, यह ${rashiName} में ${houseLbl} है. यह ${rules} पर शासन करता है — विशेष रूप से ${area} के संदर्भ में पढ़ें.`;
      case 'ja': return `${area}を検討する${vargaName}チャート（${code}）において、これは${rashiName}にある${houseLbl}である。これは${rules}を司る——${area}に関わる形で具体的に読み解くこと。`;
      case 'ko': return `${area}를 살펴보는 ${vargaName} 차트(${code})에서, 이는 ${rashiName}에 있는 ${houseLbl}이다. 이는 ${rules}을 관장한다 — ${area}와 관련지어 구체적으로 읽어야 한다.`;
      case 'ar': return `في مخطط ${vargaName} (${code})، الذي يفحص ${area}، هذا هو ${houseLbl} في ${rashiName}. يحكم ${rules} — اقرأه تحديدًا من حيث تأثيره على ${area}.`;
      case 'ml': return `${area} പരിശോധിക്കുന്ന ${vargaName} ജാതകത്തിൽ (${code}), ഇത് ${rashiName} ലെ ${houseLbl} ആണ്. ഇത് ${rules} ഭരിക്കുന്നു — ${area} യുമായി ബന്ധപ്പെടുത്തി പ്രത്യേകം വായിക്കുക.`;
      default: return `In the ${vargaName} chart (${code}), which examines ${area}, this is the ${houseLbl} in ${rashiName}. It governs ${rules} — read specifically as it bears on ${area}.`;
    }
  },
  noPlanetHereSimple: (rashiLord: string, lang: Lang): string => {
    switch (lang) {
      case 'si': return ` මෙහි ග්‍රහයෙක් නොසිටී, එබැවින් එහි ප්‍රතිඵල එහි රාශි අධිපති ${rashiLord} හරහා ගලා යයි.`;
      case 'ta': return ` இங்கு எந்த கிரகமும் இல்லை, எனவே அதன் முடிவுகள் அதன் ராசி அதிபதி ${rashiLord} வழியாக பாய்கின்றன.`;
      case 'zh': return `此处无行星驻留，因此其结果通过其星座主宰${rashiLord}体现。`;
      case 'hi': return ` यहाँ कोई ग्रह नहीं है, इसलिए इसके परिणाम इसके राशि स्वामी ${rashiLord} के माध्यम से प्रवाहित होते हैं.`;
      case 'ja': return `ここには惑星がないため、その結果はサインのロードである${rashiLord}を通して現れる。`;
      case 'ko': return ` 여기에는 행성이 없으므로, 그 결과는 별자리 로드인 ${rashiLord}를 통해 흘러간다.`;
      case 'ar': return ` لا يوجد كوكب هنا، لذا تتدفق نتائجه من خلال رب برجه ${rashiLord}.`;
      case 'ml': return ` ഇവിടെ ഒരു ഗ്രഹവുമില്ല, അതിനാൽ അതിന്റെ ഫലങ്ങൾ അതിന്റെ രാശി അധിപൻ ${rashiLord} വഴി ഒഴുകുന്നു.`;
      default: return ` No planet sits here, so its results flow through its sign lord ${rashiLord}.`;
    }
  },
};

export interface ExtraVargaPlanetEffect {
  planet: string;
  dignity: DignityLevel;
  isRetrograde: boolean;
  effect: string;
}

export interface ExtraVargaHouseAnalysis {
  code: VargaCode;
  vargaName: string;
  significance: string;
  houseNumber: number;
  rashiIndex: number;
  rashiName: string;
  rashiEnglish: string;
  rashiLord: string;
  houseTheme: string;
  keywords: string[];
  reading: string;
  planetEffects: ExtraVargaPlanetEffect[];
  isLagna: boolean;
  /** What this house means inside this specific chart, in ordinary words. */
  plainMeaning: string;
  /** Everyday name of the chart, e.g. "Money chart". */
  plainChartName: string;
  /** The question this chart answers. */
  question: string;
}

export function analyzeExtraVargaHouse(
  code: VargaCode,
  vargaName: string,
  significance: string,
  rashiIndex: number,
  vargaAscendant: number,
  planets: VargaPlanet[],
  lang: Lang = 'en',
): ExtraVargaHouseAnalysis {
  const houseNumber = ((rashiIndex - vargaAscendant + 12) % 12) + 1;
  const bhava = HOUSE_DATA[houseNumber] ?? HOUSE_DATA[1];
  const area = significance.toLowerCase();
  const rashiName = RASHIS[rashiIndex];
  const rashiLord = RASHI_LORDS[rashiIndex];

  const plain = plainMeaningFor(code, lang);
  const occupants = planets.filter(p => p.divisions[code].rashi === rashiIndex);
  const planetEffects: ExtraVargaPlanetEffect[] = occupants.map(p => {
    const dignity = p.divisions[code].dignity;
    return {
      planet: p.planet,
      dignity,
      isRetrograde: p.isRetrograde,
      // Plain language when we have it for this chart; the technical phrasing
      // remains the fallback so no varga is left without a reading.
      effect: plain
        ? plainPlanetEffect(p.planet, dignity, p.isRetrograde, code, lang)
        : EXTRA_TEXT.genericEffect(p.planet, bhava.theme.toLowerCase(), area, DIGNITY_TONE[dignity][lang], lang),
    };
  });

  const isLagna = houseNumber === 1;
  const plainMeaning = plain?.houses[houseNumber] ?? '';

  // Lead with what this box actually means for the reader, then the mechanics.
  const reading = plain
    ? (isLagna
        ? EXTRA_TEXT.lagnaWithPlain(plain.lagnaMeaning, plain.plainName.toLowerCase(), rashiName, lang)
        : plainMeaning) +
      (occupants.length ? '' : EXTRA_TEXT.noPlanetHere(rashiLord, rashiName, lang))
    : isLagna
      ? EXTRA_TEXT.lagnaNoPlain(vargaName, code, area, rashiName, lang)
      : EXTRA_TEXT.houseNoPlain(vargaName, code, area, houseLabel(houseNumber, lang), rashiName, bhava.rules.slice(0, 4).join(', '), lang) +
        (occupants.length ? '' : EXTRA_TEXT.noPlanetHereSimple(rashiLord, lang));

  return {
    code, vargaName, significance,
    houseNumber, rashiIndex,
    rashiName,
    rashiEnglish: RASHI_ENGLISH[rashiIndex],
    rashiLord,
    houseTheme: bhava.theme,
    keywords: bhava.keywords,
    reading,
    planetEffects,
    isLagna,
    plainMeaning,
    plainChartName: plain?.plainName ?? vargaName,
    question: plain?.question ?? significance,
  };
}
