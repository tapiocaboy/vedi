/** Dasha Prediction Engine — enhanced with planet-pair combinations and sookshma-level awareness */

import { bindusToScoreModifier, bindusToLabel, type AshtakavargaResult, type Planet as AVPlanet, PLANETS as AV_PLANETS } from './ashtakavarga';

/** Birth-chart context passed into the engine for chart-specific scoring. */
export interface ChartContext {
  ashtakavarga: AshtakavargaResult;
  /** Whole-sign natal house (1–12) for each planet keyed by canonical name (Sun/Moon/...). */
  planetHouses?: Record<string, number>;
  /** Natal ascendant rashi (0–11). */
  ascendantRashi?: number;
}

// Compact house themes used to colour predictions with the dasha lord's natal placement.
const HOUSE_THEMES: Record<number, { theme: string; quality: 'kendra' | 'trikona' | 'dusthana' | 'upachaya' | 'other'; emphasis: string }> = {
  1:  { theme: 'self, vitality, identity',                          quality: 'kendra',    emphasis: 'personal action and body' },
  2:  { theme: 'wealth, family, speech',                            quality: 'other',     emphasis: 'savings, food, family values' },
  3:  { theme: 'courage, siblings, communication',                  quality: 'upachaya',  emphasis: 'effort, writing, short trips' },
  4:  { theme: 'home, mother, inner peace',                         quality: 'kendra',    emphasis: 'residence, comfort, emotions' },
  5:  { theme: 'creativity, children, romance, intelligence',       quality: 'trikona',   emphasis: 'creative output and recognition' },
  6:  { theme: 'service, competition, health, debts',               quality: 'dusthana',  emphasis: 'hard work, opponents, daily routines' },
  7:  { theme: 'partnerships, marriage, deals',                     quality: 'kendra',    emphasis: 'one-on-one relationships and contracts' },
  8:  { theme: 'transformation, hidden matters, longevity',         quality: 'dusthana',  emphasis: 'research, inheritance, deep change' },
  9:  { theme: 'dharma, fortune, father, higher learning',          quality: 'trikona',   emphasis: 'philosophy, travel, mentors' },
  10: { theme: 'career, status, public action',                     quality: 'kendra',    emphasis: 'profession and public visibility' },
  11: { theme: 'gains, networks, aspirations',                      quality: 'upachaya',  emphasis: 'income, friendships, fulfilled goals' },
  12: { theme: 'expenses, foreign lands, retreat, spirituality',    quality: 'dusthana',  emphasis: 'letting go, foreign matters, inner work' },
};

const QUALITY_NOTE: Record<string, string> = {
  kendra:   'Kendra (angular) — naturally strong, direct expression.',
  trikona:  'Trikona (trine) — auspicious, fortune-conferring.',
  dusthana: 'Dusthana — challenging house; rewards come through difficulty.',
  upachaya: 'Upachaya — improves over time with effort.',
  other:    '',
};

export interface PredictionResult {
  area: string;
  trend: 'positive' | 'negative' | 'mixed' | 'neutral';
  intensity: string;
  summary: string;
  details: string[];
  remedies: string[];
  keywords: string[];
}

export interface DashaPrediction {
  dashaLord: string;
  antardasha?: string;
  pratyantardasha?: string;
  sookshmaDasha?: string;
  periodType: string;
  overallTheme: string;
  overallRating: number;
  predictions: Record<string, PredictionResult>;
  favorableActivities: string[];
  unfavorableActivities: string[];
  importantTransits: string[];
  gemstone: string | null;
  mantra: string | null;
  deity: string | null;
  combinationWarning?: string;
  combinationBonus?: string;
}

// ─── Planet significations ─────────────────────────────────────────────────

export const PLANET_SIGNIFICATIONS: Record<string, Record<string, unknown>> = {
  Sun:{
    nature:'malefic', element:'fire', gender:'male',
    keywords:['authority','father','government','soul','vitality','ego','leadership'],
    bodyParts:['heart','spine','right eye','bones'],
    diseases:['heart problems','eye issues','fever','blood pressure','bone disorders'],
    professions:['government','politics','medicine','administration','leadership roles'],
    relationships:['father','authority figures','employers'],
    gemstone:'Ruby', mantra:'Om Suryaya Namah', deity:'Surya',
    wealthScore:6, careerScore:8, healthScore:5, relationshipScore:5,
  },
  Moon:{
    nature:'benefic', element:'water', gender:'female',
    keywords:['mind','mother','emotions','nurturing','public','travel','liquids'],
    bodyParts:['mind','breasts','left eye','blood','stomach'],
    diseases:['mental stress','depression','water retention','cold','menstrual issues'],
    professions:['nursing','hospitality','shipping','dairy','public relations'],
    relationships:['mother','wife','public','women in general'],
    gemstone:'Pearl', mantra:'Om Chandraya Namah', deity:'Chandra',
    wealthScore:6, careerScore:6, healthScore:6, relationshipScore:8,
  },
  Mars:{
    nature:'malefic', element:'fire', gender:'male',
    keywords:['energy','courage','brothers','property','surgery','accidents','competition'],
    bodyParts:['muscles','blood','head','marrow','energy'],
    diseases:['injuries','accidents','surgery','blood disorders','inflammation','fever'],
    professions:['military','police','engineering','surgery','sports','real estate'],
    relationships:['siblings','competitors','enemies'],
    gemstone:'Red Coral', mantra:'Om Mangalaya Namah', deity:'Kartikeya',
    wealthScore:5, careerScore:7, healthScore:4, relationshipScore:4,
  },
  Mercury:{
    nature:'benefic', element:'earth', gender:'neutral',
    keywords:['intelligence','communication','business','education','writing','analysis'],
    bodyParts:['nervous system','skin','lungs','speech','hands'],
    diseases:['nervous disorders','skin problems','speech issues','respiratory problems'],
    professions:['writing','teaching','accounting','trading','IT','communication'],
    relationships:['friends','maternal uncle','young people'],
    gemstone:'Emerald', mantra:'Om Budhaya Namah', deity:'Vishnu',
    wealthScore:8, careerScore:8, healthScore:6, relationshipScore:7,
  },
  Jupiter:{
    nature:'benefic', element:'ether', gender:'male',
    keywords:['wisdom','expansion','luck','children','spirituality','teaching','wealth'],
    bodyParts:['liver','fat','hips','thighs','arterial system'],
    diseases:['liver problems','obesity','diabetes','tumors','ear problems'],
    professions:['teaching','law','religion','banking','advisory','philosophy'],
    relationships:['husband','guru','children','elders'],
    gemstone:'Yellow Sapphire', mantra:'Om Gurave Namah', deity:'Brihaspati',
    wealthScore:9, careerScore:8, healthScore:7, relationshipScore:8,
  },
  Venus:{
    nature:'benefic', element:'water', gender:'female',
    keywords:['love','beauty','luxury','arts','marriage','pleasures','vehicles'],
    bodyParts:['reproductive system','face','eyes','throat','kidneys'],
    diseases:['reproductive issues','kidney problems','diabetes','skin conditions'],
    professions:['arts','entertainment','fashion','beauty','hospitality','luxury goods'],
    relationships:['wife','lover','women','artists'],
    gemstone:'Diamond', mantra:'Om Shukraya Namah', deity:'Lakshmi',
    wealthScore:8, careerScore:7, healthScore:6, relationshipScore:9,
  },
  Saturn:{
    nature:'malefic', element:'air', gender:'neutral',
    keywords:['karma','discipline','delay','longevity','labor','service','obstacles'],
    bodyParts:['bones','teeth','knees','joints','nerves'],
    diseases:['chronic diseases','joint pain','arthritis','depression','paralysis'],
    professions:['labor','mining','agriculture','law','real estate','oil/gas'],
    relationships:['servants','elderly','common people','laborers'],
    gemstone:'Blue Sapphire', mantra:'Om Shanaishcharaya Namah', deity:'Shani',
    wealthScore:5, careerScore:6, healthScore:4, relationshipScore:4,
  },
  Rahu:{
    nature:'malefic', element:'air', gender:'neutral',
    keywords:['illusion','foreign','technology','unconventional','obsession','sudden events'],
    bodyParts:['skin','breathing','feet','nervous system'],
    diseases:['mysterious diseases','poisoning','phobias','mental disorders','infections'],
    professions:['technology','foreign trade','research','politics','media','aviation'],
    relationships:['foreigners','outcasts','in-laws'],
    gemstone:'Hessonite (Gomed)', mantra:'Om Rahave Namah', deity:'Durga',
    wealthScore:6, careerScore:6, healthScore:3, relationshipScore:4,
  },
  Ketu:{
    nature:'malefic', element:'fire', gender:'neutral',
    keywords:['liberation','spirituality','past karma','detachment','occult','surgery'],
    bodyParts:['feet','spine','skin'],
    diseases:['mysterious ailments','viral infections','accidents','wounds','surgeries'],
    professions:['spirituality','research','occult','healing','investigation'],
    relationships:['paternal grandfather','spiritual guides'],
    gemstone:"Cat's Eye (Lehsunia)", mantra:'Om Ketave Namah', deity:'Ganesha',
    wealthScore:3, careerScore:4, healthScore:3, relationshipScore:3,
  },
};

export const PLANETARY_RELATIONSHIPS: Record<string, Record<string, string[]>> = {
  Sun:     { friends:['Moon','Mars','Jupiter'], enemies:['Saturn','Venus'], neutral:['Mercury'] },
  Moon:    { friends:['Sun','Mercury'], enemies:[], neutral:['Mars','Jupiter','Venus','Saturn'] },
  Mars:    { friends:['Sun','Moon','Jupiter'], enemies:['Mercury'], neutral:['Venus','Saturn'] },
  Mercury: { friends:['Sun','Venus'], enemies:['Moon'], neutral:['Mars','Jupiter','Saturn'] },
  Jupiter: { friends:['Sun','Moon','Mars'], enemies:['Mercury','Venus'], neutral:['Saturn'] },
  Venus:   { friends:['Mercury','Saturn'], enemies:['Sun','Moon'], neutral:['Mars','Jupiter'] },
  Saturn:  { friends:['Mercury','Venus'], enemies:['Sun','Moon','Mars'], neutral:['Jupiter'] },
  Rahu:    { friends:['Venus','Saturn'], enemies:['Sun','Moon','Mars'], neutral:['Mercury','Jupiter'] },
  Ketu:    { friends:['Mars','Jupiter'], enemies:['Moon','Venus'], neutral:['Sun','Mercury','Saturn'] },
};

// ─── Planet-pair combination effects ──────────────────────────────────────
// Key: `${mahadasha}-${antardasha}`  (both Title-cased, Vedic names)

interface PairEffect {
  theme: string;
  health: string;
  wealth: string;
  career: string;
  relationships: string;
  warning?: string;
  bonus?: string;
  ratingMod: number; // -2 to +2
}

const PAIR_EFFECTS: Record<string, PairEffect> = {
  // Jupiter combinations (most benefic)
  'Jupiter-Jupiter': { theme:'Double Guru blessing — peak of wisdom, fortune and spiritual growth', health:'Robust vitality; watch liver and weight', wealth:'Excellent wealth accumulation, legal income, advisory fees', career:'Teaching, consulting, and judicial roles peak', relationships:'Marriage blessings, children flourish, elder respect', bonus:'Strongest benefic combination; major life milestones likely', ratingMod:2 },
  'Jupiter-Venus':   { theme:'Guru-Shukra yoga — prosperity, beauty, and social recognition', health:'Generally good; kidney and throat need care', wealth:'Strong financial gains, luxury, partnership income', career:'Law, arts, hospitality, luxury brands excel', relationships:'Romantic relationships blossom; marriage very favorable', bonus:'Wealth and beauty combine — ideal for creative professions', ratingMod:2 },
  'Jupiter-Mercury': { theme:'Guru-Budha yoga — intellectual and financial brilliance', health:'Nervous system and liver need balance', wealth:'Business acumen at peak; multiple income streams', career:'Writing, teaching, financial advisory all favored', relationships:'Intellectual connections; meaningful conversations', bonus:'Excellent for education, publishing, and commerce', ratingMod:2 },
  'Jupiter-Moon':    { theme:'Gajakesari influence — emotional wisdom and public recognition', health:'Good overall; mental clarity is high', wealth:'Public income, real estate, nurturing businesses', career:'Public-facing roles, consulting, and education thrive', relationships:'Deep family bonds; motherly relationships important', bonus:'Fame and public regard increase significantly', ratingMod:1 },
  'Jupiter-Sun':     { theme:'Guru-Surya — divine authority, leadership and dharmic success', health:'Heart and spine well-supported; vitality strong', wealth:'Government contracts, authority-based income rises', career:'Leadership positions, government roles, academic recognition', relationships:'Relationship with father and authority figures improves', ratingMod:1 },
  'Jupiter-Mars':    { theme:'Guru-Mangal — righteous action and courageous expansion', health:'High energy; avoid excess heat and inflammation', wealth:'Property gains, technical businesses, bold investments pay off', career:'Law, military, technical leadership, entrepreneurship', relationships:'Siblings prosper; loyal friends emerge', ratingMod:1 },
  'Jupiter-Saturn':  { theme:'Guru-Shani — karma, wisdom through discipline and long-term growth', health:'Chronic conditions may arise; joints and liver', wealth:'Slow but solid wealth building; long-term investments', career:'Judiciary, administration, senior management roles', relationships:'Serious commitments; karmic relationships surface', warning:'Progress is slow — patience is essential; avoid shortcuts', ratingMod:0 },
  'Jupiter-Rahu':    { theme:'Guru-Chandal yoga — wisdom challenged by illusion', health:'Mysterious health episodes; watch liver and toxins', wealth:'Foreign income possible; avoid speculative gains', career:'Unconventional teaching, foreign education, media roles', relationships:'Unusual relationships; foreign or non-traditional partners', warning:'Ethics must be guarded — illusion can cloud good judgment', ratingMod:-1 },
  'Jupiter-Ketu':    { theme:'Guru-Ketu — spiritual detachment, past wisdom resurfaces', health:'Mysterious ailments; spiritual healing helps', wealth:'Material detachment; income from spiritual or research work', career:'Research, philosophy, occult, spiritual teaching', relationships:'Past-life connections surface; detachment from worldly bonds', ratingMod:0 },

  // Venus combinations
  'Venus-Venus':   { theme:'Double Shukra — peak of luxury, love and artistic excellence', health:'Reproductive and kidney health watch needed', wealth:'Luxury businesses, arts, entertainment reach new heights', career:'Fashion, beauty, hospitality, arts at peak performance', relationships:'Marriage and romance at pinnacle; social life flourishes', bonus:'Best period for marriage, artistic projects, and luxury', ratingMod:2 },
  'Venus-Jupiter': { theme:'Shukra-Guru — harmonious prosperity and spiritual love', health:'Good vitality; weight and liver moderation needed', wealth:'Major wealth accumulation through partnership and arts', career:'Arts, law, luxury, and finance all excel', relationships:'Marriage extremely favored; spouse brings wealth', bonus:'One of the most auspicious combinations for marriage and wealth', ratingMod:2 },
  'Venus-Mercury': { theme:'Shukra-Budha — creative intelligence and commercial success', health:'Generally fine; skin and nervous system attention', wealth:'Business, media, beauty, and technology income grows', career:'Communication arts, digital media, fashion, and trade', relationships:'Witty, charming social connections; romantic variety', ratingMod:2 },
  'Venus-Moon':    { theme:'Shukra-Chandra — emotional sensitivity and artistic expression', health:'Water balance and reproductive health watch', wealth:'Public-facing businesses, hospitality, dairy, arts', career:'Entertainment, hospitality, public relations', relationships:'Deep romantic bonds; nurturing partnerships', ratingMod:1 },
  'Venus-Saturn':  { theme:'Shukra-Shani — disciplined love and long-term relationships', health:'Chronic reproductive or kidney issues possible', wealth:'Slow steady accumulation; real estate and industrial gains', career:'Long-term creative projects, law, real estate', relationships:'Serious commitments; age-gap relationships possible', warning:'Delays in relationships and pleasures — patience required', ratingMod:0 },
  'Venus-Mars':    { theme:'Shukra-Mangal — passionate energy and creative power', health:'High energy; temper and accident risk rises', wealth:'Property and artistic ventures are profitable', career:'Sports, arts, real estate, engineering all favored', relationships:'Intense romance; passion can lead to conflict', warning:'Manage anger in relationships; avoid impulsive romantic decisions', ratingMod:0 },
  'Venus-Rahu':    { theme:'Shukra-Rahu — obsessive attraction and unconventional pleasures', health:'Reproductive and skin health may fluctuate', wealth:'Foreign luxury goods, technology, unconventional income', career:'Foreign markets, technology arts, media career', relationships:'Unusual or unconventional romantic attractions', warning:'Temptation to overindulge or pursue forbidden pleasures', ratingMod:-1 },
  'Venus-Ketu':    { theme:'Shukra-Ketu — spiritual detachment from material pleasures', health:'Reproductive concerns; spiritual healing recommended', wealth:'Material wealth may feel unsatisfying despite gains', career:'Spiritual arts, healing, research', relationships:'Detachment from relationships; karmic connections', ratingMod:-1 },

  // Saturn combinations
  'Saturn-Saturn': { theme:'Double Shani — intense karma, discipline, and transformation', health:'Chronic issues surface; bones, joints, depression risk', wealth:'Hard work required; slow gains through service industries', career:'Service, labor, mining, agriculture, administration', relationships:'Isolation possible; karmic relationship obligations', warning:'Sade Sati-like pressure — this is a period of hard karmic lessons', ratingMod:-2 },
  'Saturn-Rahu':   { theme:'Shani-Rahu — karmic disruption and sudden obstacles', health:'Mysterious chronic ailments; respiratory and skin issues', wealth:'Unexpected financial reversals; avoid speculation completely', career:'Major upheavals at work; hidden enemies surface', relationships:'Relationship strain; isolation and misunderstandings', warning:'One of the most challenging combinations — extreme caution advised', ratingMod:-2 },
  'Saturn-Ketu':   { theme:'Shani-Ketu — deep karma, losses and spiritual awakening', health:'Chronic and mysterious health issues; hospital risk', wealth:'Financial losses through misfortune; past karma surfaces', career:'Career obstacles; forced changes and restructuring', relationships:'Loss of loved ones or major separations possible', warning:'Significant karmic clearing — spiritual practice is essential', ratingMod:-2 },
  'Saturn-Mars':   { theme:'Shani-Mangal — conflict between effort and obstruction', health:'Accidents, inflammation, and chronic fatigue risk', wealth:'Hard work yields mixed results; property disputes possible', career:'Conflicts with authority; discipline required for progress', relationships:'Arguments and aggression in relationships', warning:'Manage anger and impatience; avoid legal and property disputes', ratingMod:-1 },
  'Saturn-Sun':    { theme:'Shani-Surya — ego meets karma; authority challenged', health:'Vitality may dip; spine and heart need care', wealth:'Government or authority-related financial setbacks', career:'Conflicts with superiors; career restructuring likely', relationships:'Father relationship strained; ego clashes at home', warning:'Avoid power struggles with authority; humility is the key', ratingMod:-1 },
  'Saturn-Moon':   { theme:'Shani-Chandra — emotional suppression and mental challenges', health:'Depression, anxiety, and sleep disorders risk', wealth:'Emotionally-driven financial decisions may backfire', career:'Work feels burdensome; lack of recognition', relationships:'Emotional distance in relationships; mother-figure conflicts', warning:'Mental health must be prioritized — seek support if needed', ratingMod:-1 },
  'Saturn-Jupiter':{ theme:'Shani-Guru — wisdom through discipline and karmic lessons', health:'Liver and joints need attention; moderation in diet', wealth:'Slow but steady; long-term investments and property gains', career:'Senior professional roles; judiciary and administration', relationships:'Serious, dharmic relationships; responsibilities to elders', ratingMod:0 },
  'Saturn-Venus':  { theme:'Shani-Shukra — delayed pleasures and disciplined creativity', health:'Reproductive and kidney health careful monitoring', wealth:'Long-term creative projects pay off eventually', career:'Real estate, arts on long timelines, law', relationships:'Delayed marriage; serious long-term commitments', ratingMod:0 },
  'Saturn-Mercury':{ theme:'Shani-Budha — methodical intelligence and careful planning', health:'Nervous system and skin care important', wealth:'Careful financial planning yields slow but reliable gains', career:'Systematic, detail-oriented work excels', relationships:'Intellectual but emotionally distant connections', ratingMod:0 },

  // Rahu combinations
  'Rahu-Rahu':    { theme:'Double Rahu — intense illusion, ambition and foreign influences', health:'Mysterious and unusual health conditions; phobias', wealth:'Foreign income; speculative gains with high risk', career:'Technology, foreign work, politics, media at peak', relationships:'Obsessive or unusual relationships; in-law complexities', warning:'Reality distortion is high — stay grounded and ethical', ratingMod:-1 },
  'Rahu-Saturn':  { theme:'Rahu-Shani — sudden karmic disruption and chronic obstacles', health:'Chronic mysterious ailments; mental health stress', wealth:'Unexpected losses; avoid all speculation', career:'Hidden enemies, workplace disruption, restructuring', relationships:'Sudden separations; unusual karmic obligations', warning:'Most challenging sub-period — heightened vigilance required', ratingMod:-2 },
  'Rahu-Mars':    { theme:'Rahu-Mangal — explosive energy and reckless ambition', health:'Accidents, infections, and impulsive health choices', wealth:'High-risk ventures; sudden gains and sudden losses', career:'Aggressive career moves; competition is fierce', relationships:'Passionate but volatile; conflicts with siblings', warning:'Impulsive decisions can be costly — think before acting', ratingMod:-1 },
  'Rahu-Ketu':    { theme:'Rahu-Ketu — nodal axis activated; destabilizing transformation', health:'Strange ailments affecting both physical and mental health', wealth:'Financial instability; past karma affecting income', career:'Career direction confusion; sudden unexpected changes', relationships:'Past-life relationship karma surfaces forcefully', warning:'Nodal period brings fated events — surrender and adapt', ratingMod:-1 },
  'Rahu-Jupiter': { theme:'Rahu-Guru — ambition meets wisdom; ethics under pressure', health:'Liver and mysterious conditions; watch for excess', wealth:'Ambitious financial schemes — some succeed, some backfire', career:'Foreign education, unconventional advisory roles', relationships:'Unusual teachers or mentors enter life', warning:'Maintain ethical standards despite tempting shortcuts', ratingMod:0 },
  'Rahu-Venus':   { theme:'Rahu-Shukra — obsessive attraction and material desire', health:'Reproductive and addictive tendency watch', wealth:'Foreign luxury and technology income rises', career:'Media, foreign markets, technology arts', relationships:'Magnetic but potentially obsessive attractions', ratingMod:0 },
  'Rahu-Mercury': { theme:'Rahu-Budha — analytical brilliance meets unconventional thinking', health:'Nervous system under pressure; anxiety possible', wealth:'Technology, foreign trade, unconventional business income', career:'Innovation, foreign communication, digital entrepreneurship', relationships:'Interesting intellectual connections; unusual friends', ratingMod:0 },
  'Rahu-Moon':    { theme:'Rahu-Chandra — emotional turbulence and psychic sensitivity', health:'Mental health, anxiety, and emotional swings', wealth:'Public income with instability; emotional spending risk', career:'Media, public platforms, emotional intelligence roles', relationships:'Intense emotional bonds; mother-figure complications', warning:'Guard mental health carefully; avoid emotional extremes', ratingMod:-1 },
  'Rahu-Sun':     { theme:'Rahu-Surya — eclipse of authority; ambition and ego clash', health:'Heart and vitality fluctuations; mysterious fevers', wealth:'Government-related income uncertain; authority friction', career:'Conflicts with authority; sudden rise or fall in career', relationships:'Father relationship strained; ego conflict with superiors', warning:'Ego must be checked — avoid power struggles with authority', ratingMod:-1 },

  // Ketu combinations
  'Ketu-Ketu':    { theme:'Double Ketu — intense spiritual detachment and karmic completion', health:'Mysterious ailments; surgeries and past-life health karma', wealth:'Material losses; detachment from wealth is the lesson', career:'Career dissolution; spiritual or research calling emerges', relationships:'Isolation from worldly relationships; spiritual bonds', ratingMod:-2 },
  'Ketu-Mars':    { theme:'Ketu-Mangal — sudden accidents and spiritual courage', health:'Injuries, surgeries, and mysterious fevers', wealth:'Property disputes; sudden material losses', career:'Technical and investigative work; sudden career changes', relationships:'Sibling conflicts; past-life competitive karma', warning:'Accidents are more likely — extra physical caution required', ratingMod:-1 },
  'Ketu-Rahu':    { theme:'Ketu-Rahu — nodal reversal; fated disruptions and surrenders', health:'Health unpredictability; stress-related conditions', wealth:'Financial instability from unexpected karmic sources', career:'Career upheavals; role changes or losses', relationships:'Fated meetings and separations; strong past-life pull', warning:'Nodal sub-period in Ketu Mahadasha is especially intense', ratingMod:-1 },
  'Ketu-Jupiter': { theme:'Ketu-Guru — spiritual wisdom and detachment from worldly success', health:'Liver and mysterious conditions; healing through spirituality', wealth:'Wealth from spiritual or research work; material detachment', career:'Spiritual teaching, occult research, healing arts', relationships:'Wise, detached relationships; guru-student connections', bonus:'Excellent for spiritual growth and past-life wisdom retrieval', ratingMod:0 },
  'Ketu-Saturn':  { theme:'Ketu-Shani — karmic clearing through hardship', health:'Chronic and mysterious ailments; isolation risk', wealth:'Material losses as karmic correction', career:'Career restructuring; forced detachment from old roles', relationships:'Loss of relationships through karma', warning:'Most intense karmic combination — spiritual practice is essential', ratingMod:-2 },
  'Ketu-Mercury': { theme:'Ketu-Budha — intuitive intelligence and analytical detachment', health:'Nervous system sensitivity; skin and respiratory issues', wealth:'Income from research, writing, or spiritual services', career:'Research, writing, investigative journalism, occult', relationships:'Intellectual but detached connections', ratingMod:0 },
  'Ketu-Venus':   { theme:'Ketu-Shukra — spiritual detachment from sensual pleasures', health:'Reproductive and mysterious health concerns', wealth:'Material pleasures feel unfulfilling despite income', career:'Spiritual arts, healing, research-based creative work', relationships:'Karmic romantic connections; relationships feel destined but difficult', ratingMod:-1 },
  'Ketu-Sun':     { theme:'Ketu-Surya — ego dissolution and spiritual authority', health:'Vitality fluctuations; mysterious or viral conditions', wealth:'Government or authority-related income affected', career:'Leadership roles may feel hollow; spiritual authority emerges', relationships:'Father relationship karmic; authority figures challenge you', ratingMod:-1 },
  'Ketu-Moon':    { theme:'Ketu-Chandra — emotional detachment and intuitive depths', health:'Mental health, depression, and emotional numbness', wealth:'Emotional spending; public income fluctuates', career:'Healing, research, spiritual counseling roles', relationships:'Emotional distance; mother-karma surfaces', warning:'Guard against depression and emotional isolation', ratingMod:-1 },

  // Sun combinations
  'Sun-Sun':     { theme:'Double Surya — peak authority, recognition and self-expression', health:'Heart and eye health must be monitored carefully', wealth:'Government income, leadership bonuses, gold investments', career:'Leadership, government, and political career at its peak', relationships:'Ego can dominate — practice humility with loved ones', ratingMod:1 },
  'Sun-Moon':    { theme:'Surya-Chandra — balancing ego and emotion; public recognition', health:'Emotional and physical energy fluctuates; rest is key', wealth:'Public-facing income grows; real estate opportunities', career:'Public roles, government, and emotional leadership', relationships:'Family dynamics become important; work-life balance challenge', ratingMod:1 },
  'Sun-Mars':    { theme:'Surya-Mangal — dynamic energy and bold leadership action', health:'Fever, blood pressure, and injury risk; channel energy well', wealth:'Government contracts, property, technical income', career:'Military, sports, government, engineering — all peak', relationships:'Assertive but may be domineering; sibling dynamics active', ratingMod:1 },
  'Sun-Jupiter': { theme:'Surya-Guru — divine blessing on authority and wisdom', health:'Strong vitality; liver and weight moderation needed', wealth:'Government income, advisory fees, dharmic wealth', career:'Academic leadership, judicial roles, government advisory', relationships:'Father and mentor relationships are blessed', bonus:'Excellent for getting recognition and honor in career', ratingMod:1 },
  'Sun-Saturn':  { theme:'Surya-Shani — authority challenged by karma and discipline', health:'Spine, heart, and chronic fatigue risk', wealth:'Hard-earned income; government dealings face delays', career:'Authority conflicts; career requires extra effort', relationships:'Father relationship strained; responsibility burden increases', warning:'Avoid ego clashes with authority figures; humility is essential', ratingMod:-1 },
  'Sun-Mercury': { theme:'Surya-Budha — Budhaditya yoga; intelligence and communication', health:'Eye health and nervous system need attention', wealth:'Communication-based income; government contracts', career:'Writing, government communication, analytical leadership', relationships:'Intellectual connections; younger people bring opportunities', bonus:'Budhaditya yoga — intelligence and fame through communication', ratingMod:1 },
  'Sun-Venus':   { theme:'Surya-Shukra — authority meets art; professional recognition', health:'Heart and kidneys need monitoring; eyes watch', wealth:'Arts income, government recognition, luxury purchases', career:'Arts-government interface, luxury brands, political careers', relationships:'Creative romantic connections; spouse from different background', ratingMod:0 },
  'Sun-Rahu':    { theme:'Surya-Rahu — eclipse energy; ambition and authority clashing', health:'Mysterious fever, eye issues, vitality fluctuations', wealth:'Government income uncertain; foreign income rises', career:'Sudden career changes; ambition exceeds caution', relationships:'Father relationship complicated; authority conflicts', warning:'Eclipse combination — unexpected events and authority friction', ratingMod:-1 },
  'Sun-Ketu':    { theme:'Surya-Ketu — spiritual authority and ego dissolution', health:'Mysterious vitality issues; viral and past-karma ailments', wealth:'Government income affected; spiritual income rises', career:'Leadership feels hollow; transition to dharmic work', relationships:'Father karma; authority figures become spiritual mirrors', ratingMod:-1 },

  // Moon combinations
  'Moon-Moon':    { theme:'Double Chandra — peak of emotional intelligence and public connection', health:'Mental and emotional health excellent; stay hydrated', wealth:'Public business, real estate, hospitality all thrive', career:'Public roles, emotional intelligence leadership', relationships:'Deep family bonds; women bring luck and support', bonus:'Excellent for public communication and emotional creativity', ratingMod:1 },
  'Moon-Sun':     { theme:'Chandra-Surya — public authority and balanced energy', health:'Good vitality; emotional and physical balance needed', wealth:'Public recognition brings financial rewards', career:'Leadership in public domain; government and public service', relationships:'Family harmony; public image matters in relationships', ratingMod:1 },
  'Moon-Mars':    { theme:'Chandra-Mangal — emotional courage and protective instinct', health:'Blood and hormonal balance needs attention', wealth:'Property, real estate, and public business income', career:'Physical and public roles; nursing, military, real estate', relationships:'Protective and passionate; mother-sibling dynamics', ratingMod:0 },
  'Moon-Rahu':    { theme:'Chandra-Rahu — emotional turbulence and psychic intensity', health:'Mental health, anxiety, and psychosomatic issues', wealth:'Emotional financial decisions can backfire', career:'Media, public platforms with instability', relationships:'Obsessive emotional bonds; mother complications', warning:'Guard against anxiety, emotional manipulation and delusions', ratingMod:-1 },
  'Moon-Jupiter': { theme:'Chandra-Guru — Gajakesari yoga energy; wisdom and fame', health:'Strong overall; emotional wisdom supports healing', wealth:'Public wealth expansion; advisory and public income', career:'Public teaching, emotional leadership, advisory roles', relationships:'Family blessed; children bring joy; wise relationships', bonus:'Gajakesari energy — fame, wealth and public recognition', ratingMod:2 },
  'Moon-Saturn':  { theme:'Chandra-Shani — emotional discipline; Vish Yoga influence', health:'Depression, anxiety, and emotional suppression risk', wealth:'Hard emotional labor for slow financial gains', career:'Emotionally demanding work; service and care roles', relationships:'Emotional distance; duty over desire in relationships', warning:'Vish Yoga influence — emotional health requires active care', ratingMod:-1 },
  'Moon-Mercury': { theme:'Chandra-Budha — emotional intelligence and communication', health:'Nervous system and digestive health balance', wealth:'Communication, writing, and public business income', career:'Writing, media, counseling, public communication', relationships:'Communicative and adaptable; variety in social connections', ratingMod:1 },
  'Moon-Venus':   { theme:'Chandra-Shukra — emotional beauty and romantic sensitivity', health:'Reproductive and kidney health attention needed', wealth:'Arts, beauty, hospitality, and public-facing income', career:'Entertainment, arts, emotional sales and hospitality', relationships:'Romantic and nurturing bonds; spouse/partner brings comfort', bonus:'Very favorable for love, creativity and feminine energy', ratingMod:1 },
  'Moon-Ketu':    { theme:'Chandra-Ketu — emotional detachment and spiritual sensitivity', health:'Mental health and mysterious emotional conditions', wealth:'Detachment from wealth; spiritual income', career:'Healing, research, spiritual counseling', relationships:'Emotional distance; past-life bonds surface', warning:'Guard against depression and emotional withdrawal', ratingMod:-1 },

  // Mars combinations
  'Mars-Mars':    { theme:'Double Mangal — explosive energy, courage and property focus', health:'Accidents, fever, blood disorders — physical caution', wealth:'Property, technical business, bold investments', career:'Military, engineering, sports, real estate at peak', relationships:'Passionate but volatile; sibling matters important', warning:'Double Mars energy — control aggression and impulsiveness', ratingMod:0 },
  'Mars-Sun':     { theme:'Mangal-Surya — bold authority and physical leadership', health:'High energy; blood pressure and heat risk', wealth:'Government and technical income; property gains', career:'Military leadership, government, sports, engineering', relationships:'Assertive with father; competitive with authority', ratingMod:1 },
  'Mars-Moon':    { theme:'Mangal-Chandra — emotional courage and protective strength', health:'Blood, hormonal, and emotional health balance', wealth:'Property and public business; emotional financial decisions', career:'Physical and public roles; defense, real estate, nursing', relationships:'Protective intensity; emotional volatility in relationships', ratingMod:0 },
  'Mars-Mercury': { theme:'Mangal-Budha — technical communication and sharp analysis', health:'Nervous system and blood health balance', wealth:'Technical business, trading, and engineering income', career:'Technical writing, engineering, trading, IT', relationships:'Witty and quick; intellectual friendships', ratingMod:1 },
  'Mars-Jupiter': { theme:'Mangal-Guru — righteous courage and expansive action', health:'Energy well-supported; liver and weight care', wealth:'Legal income, property, and business expansion', career:'Law, military leadership, entrepreneurship, sports', relationships:'Courageous relationships; mentor-student bonds', ratingMod:1 },
  'Mars-Venus':   { theme:'Mangal-Shukra — passionate creativity and property-luxury balance', health:'Sexual health and energy management important', wealth:'Property, arts, luxury, and entertainment income', career:'Real estate, arts, hospitality, entertainment', relationships:'Intensely passionate romance; attraction is strong', ratingMod:1 },
  'Mars-Saturn':  { theme:'Mangal-Shani — effort versus obstacle; discipline through hardship', health:'Chronic fatigue, injuries, and inflammation risk', wealth:'Hard work with limited returns initially', career:'Engineering, labor, and physical service under pressure', relationships:'Strained relationships with siblings and authority figures', warning:'Patience is critical — aggression against obstacles will backfire', ratingMod:-1 },
  'Mars-Rahu':    { theme:'Mangal-Rahu — explosive and reckless energy; accidents risk', health:'Accidents, infections, and impulsive health choices', wealth:'High-risk ventures with unpredictable outcomes', career:'Aggressive career moves; sudden rise or fall', relationships:'Volatile, passionate but unstable relationships', warning:'Most accident-prone combination — extreme physical caution needed', ratingMod:-1 },
  'Mars-Ketu':    { theme:'Mangal-Ketu — past karma with siblings and property; accident risk', health:'Surgeries, wounds, mysterious fevers', wealth:'Property disputes and sudden material losses', career:'Technical and investigative work; forced career changes', relationships:'Sibling karma surfaces; competitive past-life dynamics', warning:'Physical accidents more likely — take precautions seriously', ratingMod:-1 },

  // Mercury combinations
  'Mercury-Mercury':{ theme:'Double Budha — peak of intelligence, communication and commerce', health:'Nervous system care critical; avoid mental overload', wealth:'Business, trading, writing, and IT income maximized', career:'All Mercury fields — communication, trade, IT — at peak', relationships:'Witty social connections; intellectual partnerships', bonus:'Excellent for business, education, and publishing launches', ratingMod:2 },
  'Mercury-Sun':    { theme:'Budha-Surya — Budhaditya yoga continuation; leadership through intellect', health:'Eye health and nervous energy balance', wealth:'Government communication, writing income, advisory', career:'Government writing, media, analytical leadership', relationships:'Intellectual authority; positive with younger people', ratingMod:1 },
  'Mercury-Moon':   { theme:'Budha-Chandra — emotional intelligence and public communication', health:'Nervous and digestive health attention', wealth:'Public communication, writing, and trade income', career:'Media, public writing, counseling, hospitality', relationships:'Communicative and emotionally responsive connections', ratingMod:1 },
  'Mercury-Mars':   { theme:'Budha-Mangal — sharp technical mind and decisive action', health:'Nervous and blood health balance', wealth:'Technical business, trading, and engineering income', career:'Technical communication, engineering, IT', relationships:'Decisive and direct; brief but stimulating connections', ratingMod:1 },
  'Mercury-Jupiter':{ theme:'Budha-Guru — intellectual wisdom and business prosperity', health:'Liver and nervous system balance needed', wealth:'Major income from consulting, teaching, and business', career:'Finance, law, education, and advisory roles', relationships:'Wise and generous relationships; mentor connections', bonus:'Exceptional for business expansion and educational achievements', ratingMod:2 },
  'Mercury-Venus':  { theme:'Budha-Shukra — creative intelligence and artistic commerce', health:'Reproductive and nervous health care', wealth:'Arts business, beauty, fashion, and digital income', career:'Creative industries, digital media, fashion, beauty', relationships:'Charming and communicative romantic connections', ratingMod:2 },
  'Mercury-Saturn': { theme:'Budha-Shani — methodical planning and systematic discipline', health:'Nervous and joint health care important', wealth:'Slow methodical income; long-term business planning', career:'Detail-oriented, systematic work and administration', relationships:'Intellectual but emotionally reserved connections', ratingMod:0 },
  'Mercury-Rahu':   { theme:'Budha-Rahu — innovative thinking and unconventional communication', health:'Nervous anxiety and respiratory health attention', wealth:'Technology, foreign trade, digital and unconventional income', career:'Technology innovation, foreign communication, digital entrepreneurship', relationships:'Unusual and intellectually stimulating connections', ratingMod:0 },
  'Mercury-Ketu':   { theme:'Budha-Ketu — intuitive research and spiritual communication', health:'Nervous system and mysterious health sensitivity', wealth:'Research, writing, and spiritual communication income', career:'Research, investigation, spiritual writing and education', relationships:'Intuitive but detached intellectual connections', ratingMod:0 },
};

function getPairEffect(mahadasha: string, antardasha: string): PairEffect | null {
  return PAIR_EFFECTS[`${mahadasha}-${antardasha}`] ?? null;
}

// ─── Prediction Engine ─────────────────────────────────────────────────────

export class DashaPredictionEngine {
  // Set per-call by generateCompletePrediction so all internal score lookups
  // can pick up bindu strength without changing every method signature.
  private _ctx: ChartContext | null = null;

  getPlanetData(planet: string) { return PLANET_SIGNIFICATIONS[planet] ?? {}; }

  getRelationship(p1: string, p2: string): string {
    if (p1 === p2) return 'same';
    const rel = PLANETARY_RELATIONSHIPS[p1] ?? {};
    if ((rel.friends ?? []).includes(p2)) return 'friend';
    if ((rel.enemies ?? []).includes(p2)) return 'enemy';
    return 'neutral';
  }

  private _bindusForLord(planet: string): number | null {
    if (!this._ctx) return null;
    if (!(AV_PLANETS as readonly string[]).includes(planet)) return null;
    return this._ctx.ashtakavarga.selfStrength[planet as AVPlanet];
  }

  private _natalHouseFor(planet: string): number | null {
    return this._ctx?.planetHouses?.[planet] ?? null;
  }

  /** Compact one-liner that places the dasha lord in its natal house. */
  private _houseAnnotation(planet: string): string | null {
    const house = this._natalHouseFor(planet);
    if (!house) return null;
    const h = HOUSE_THEMES[house];
    return `${planet} natally occupies your ${house}${ordinalSuffix(house)} house (${h.theme}). ${QUALITY_NOTE[h.quality]} Period emphasis: ${h.emphasis}.`;
  }

  private _planetScore(planet: string, area: string): number {
    const pd = PLANET_SIGNIFICATIONS[planet] ?? {};
    const base = (pd[area + 'Score'] as number) ?? 5;
    const bindus = this._bindusForLord(planet);
    if (bindus == null) return base;
    // Apply ±2 strength modifier, clamped to [1, 10].
    const adjusted = base + bindusToScoreModifier(bindus);
    return Math.max(1, Math.min(10, adjusted));
  }

  private _trendFromScore(score: number): PredictionResult['trend'] {
    if (score >= 7) return 'positive';
    if (score >= 5) return 'neutral';
    if (score >= 3) return 'mixed';
    return 'negative';
  }

  private _intensityLabel(rel: string, _area: string, score: number): string {
    if (score >= 8 && rel === 'friend') return 'very strong';
    if (score >= 7 || rel === 'friend') return 'strong';
    if (score <= 3 && rel === 'enemy') return 'very challenging';
    if (score <= 4 || rel === 'enemy') return 'challenging';
    return 'moderate';
  }

  // ─── Health ──────────────────────────────────────────────────────────────

  private _healthSpecifics(planet: string): { details: string[]; remedies: string[] } {
    const s: Record<string, { details: string[]; remedies: string[] }> = {
      Sun:{ details:['Vitality and energy levels may fluctuate with season','Eye health requires periodic checkups','Heart and cardiovascular system needs regular monitoring','Maintain good posture to protect the spine','Adequate morning sun exposure is beneficial'], remedies:['Offer water to the rising Sun daily at dawn','Wear ruby on Sunday in copper ring on right hand','Chant Aditya Hridayam for sustained vitality','Practice Surya Namaskar 12 rounds daily','Increase wheat, jaggery, and saffron in diet'] },
      Moon:{ details:['Mental and emotional health is the primary area to watch','Sleep quality and routine directly affect all health metrics','Adequate hydration and balanced fluid intake essential','Women may experience stronger hormonal fluctuations','Digestive system is linked to emotional state'], remedies:['Wear natural pearl on Monday in silver ring on right little finger','Drink water stored overnight in a silver vessel','Practice nadi shodhana pranayama and yoga nidra','Maintain consistent sleep-wake cycle; avoid daytime sleep','Include milk, rice, white foods, and moonlit water in diet'] },
      Mars:{ details:['Higher accident and injury risk — physical vigilance essential','Blood pressure fluctuations and inflammation are likely','Blood-related disorders need periodic monitoring','Surgeries if medically necessary will proceed successfully','High energy levels — must be channeled through regular exercise'], remedies:['Wear red coral on Tuesday in gold ring on right ring finger','Donate blood if eligible; volunteer at trauma centers','Practice cooling pranayama (sheetali, sheetkari)','Avoid confrontations and manage anger proactively','Include red lentils, beetroot, pomegranate in diet'] },
      Mercury:{ details:['Nervous system is the primary health focus','Skin conditions may emerge or worsen with stress','Speech, hearing, or communication issues are possible','Respiratory health deserves attention, especially in cities','Mental fatigue from constant thinking and multi-tasking'], remedies:['Wear emerald on Wednesday in gold ring on right little finger','Practice oil pulling (gandusha) and tongue scraping daily','Keep the mind engaged in learning to prevent stagnation','Reduce excessive screen time and digital stimulation','Include green vegetables, green moong dal, and mint in diet'] },
      Jupiter:{ details:['Weight management becomes increasingly important','Liver and digestive health requires mindful dietary choices','Blood sugar levels and insulin sensitivity should be monitored','Overall resilience is strong; recovery from illness is good','Hip, thigh, and lower back area may develop issues'], remedies:['Wear yellow sapphire on Thursday in gold ring on right index finger','Fast on Thursdays or practice intermittent fasting','Express gratitude daily and respect teachers and elders','Donate to educational or religious institutions weekly','Include turmeric, yellow foods, and chickpeas in diet'] },
      Venus:{ details:['Reproductive system health needs periodic attention','Kidney and urinary tract infections need early treatment','Skin generally remains healthy with proper self-care','Overindulgence in sweets, fats, or alcohol affects health','Eye and throat health should be monitored routinely'], remedies:['Wear natural diamond or white sapphire on Friday in silver ring','Maintain personal hygiene and cleanliness strictly','Use rose water for eyes, skin toning, and cooling','Reduce excessive sugar, fried foods, and alcohol','Include white foods — dairy, coconut, white rice, fruits — in diet'] },
      Saturn:{ details:['Chronic conditions may surface or worsen during this period','Joint pain, arthritis, and bone density need attention','Dental health requires regular professional care','Mental health — depression, anxiety, and hopelessness possible','Recovery from illness is slow — patience and consistency required'], remedies:['Wear blue sapphire on trial for 3 days before committing','Serve the elderly, disabled, and underprivileged regularly','Fast on Saturdays and donate sesame and black items','Practice daily oil massage (abhyanga) with sesame oil','Include black sesame, iron-rich and whole grain foods in diet'] },
      Rahu:{ details:['Mysterious or diagnostically difficult conditions are possible','Mental health — anxiety, phobias, and obsessive thoughts','Allergies and skin conditions may appear suddenly','Intoxicants and addictive substances must be strictly avoided','Get second medical opinions; avoid self-diagnosis'], remedies:['Wear hessonite (gomed) after careful astrological consultation','Chant Durga Saptashati or Rahu Beej mantra daily','Avoid non-vegetarian food on Saturdays and during eclipses','Keep fennel (saunf) and cloves near the bedside for sleep','Practice grounding exercises and earthing techniques'] },
      Ketu:{ details:['Viral infections and mysterious ailments are more likely','Accidents, especially to lower extremities and spine','Surgeries if required will be necessary and often curative','Spiritual practices, meditation, and yoga improve overall health','Past-life karmic health patterns may surface for resolution'], remedies:["Wear cat's eye (chrysoberyl) after thorough astrological consultation",'Worship Lord Ganesha with red flowers every Tuesday','Donate blankets, sesame, and multicolored items to the needy','Practice deep meditation, kriya yoga, or vipassana','Include bananas, root vegetables, and turmeric in diet'] },
    };
    return s[planet] ?? { details:[], remedies:[] };
  }

  generateHealthPrediction(mahadasha: string, antardasha?: string, pratyantardasha?: string): PredictionResult {
    const pd = this.getPlanetData(mahadasha);
    const bodyParts = (pd.bodyParts as string[]) ?? [];
    const diseases = (pd.diseases as string[]) ?? [];
    let score = this._planetScore(mahadasha, 'health');
    const spec = this._healthSpecifics(mahadasha);
    const details: string[] = [];
    if (bodyParts.length) details.push(`Primary body areas to monitor: ${bodyParts.join(', ')}`);
    if (diseases.length) details.push(`Health concerns to watch for: ${diseases.slice(0, 3).join(', ')}`);
    details.push(...spec.details);
    const remedies = [...spec.remedies];
    let rel = 'neutral';

    if (antardasha) {
      rel = this.getRelationship(mahadasha, antardasha);
      const adPd = this.getPlanetData(antardasha);
      const adDiseases = (adPd.diseases as string[]) ?? [];
      const adBodyParts = (adPd.bodyParts as string[]) ?? [];
      const pairEff = getPairEffect(mahadasha, antardasha);
      if (pairEff) {
        details.push(`${antardasha} sub-period: ${pairEff.health}`);
      } else {
        if (rel === 'friend') {
          details.push(`${antardasha} antardasha brings supportive healing energy; recovery improves`);
          score = Math.min(10, score + 1);
        } else if (rel === 'enemy') {
          details.push(`${antardasha} antardasha may amplify health challenges; additional areas: ${adBodyParts.slice(0,2).join(', ')}`);
          if (adDiseases.length) details.push(`Combined risks: ${adDiseases.slice(0,2).join(', ')}`);
          score = Math.max(1, score - 1);
        } else {
          details.push(`${antardasha} antardasha adds ${adBodyParts.slice(0,2).join(', ')} to health focus`);
        }
      }
    }

    if (pratyantardasha) {
      const pdRel = this.getRelationship(antardasha ?? mahadasha, pratyantardasha);
      if (pdRel === 'enemy') {
        details.push(`Pratyantardasha of ${pratyantardasha} creates short-term health fluctuation — extra care this sub-period`);
        score = Math.max(1, score - 0.5);
      } else if (pdRel === 'friend') {
        details.push(`${pratyantardasha} pratyantardasha brings a healing window during this sub-period`);
      }
    }

    const trend = this._trendFromScore(score);
    const intensity = this._intensityLabel(rel, 'health', score);
    const summary = score >= 7
      ? `Generally good health during ${mahadasha} period. Preventive care ensures sustained vitality.`
      : score >= 5
        ? `Health requires balanced attention during ${mahadasha} period. Maintain regular health routines.`
        : `Health needs priority focus during ${mahadasha} period. Be proactive and follow remedies.`;

    return { area:'health', trend, intensity, summary, details, remedies, keywords:[...bodyParts, ...diseases.slice(0,2)] };
  }

  // ─── Wealth ───────────────────────────────────────────────────────────────

  private _wealthSpecifics(planet: string): { details: string[]; remedies: string[] } {
    const s: Record<string, { details: string[]; remedies: string[] }> = {
      Sun:{ details:['Income through government contracts, public sector, or authority','Paternal inheritance or support from father figures possible','Professional recognition directly translates to financial rewards','Leadership and administrative roles increase earning capacity','Gold, copper, and government bonds are favorable investments'], remedies:['Donate wheat and jaggery to the poor on Sundays','Serve your father and elders with respect and generosity','Keep workplace free of ego-driven conflicts to protect income','Wear ruby to attract authority-based financial opportunities'] },
      Moon:{ details:['Income from public-facing businesses and hospitality industries','Real estate, land, and immovable property gains are favorable','Mother or maternal family may provide financial support','Liquid assets, savings accounts, and silver investments grow','Income levels fluctuate with emotional state and lunar cycles'], remedies:['Donate white rice and milk to those in need on Mondays','Serve your mother and support elderly women in your life','Avoid major financial commitments on new moon days','Keep silver items, sea shells, or moon-related objects at home'] },
      Mars:{ details:['Property, real estate, and land investments are strongly favored','Income through technical fields, engineering, or manufacturing','Brothers or male siblings may create valuable business opportunities','Calculated risk-taking in business ventures is rewarded','Channel competitive energy into profitable business strategies'], remedies:['Donate red lentils and items to the poor on Tuesdays','Maintain harmonious relations with siblings for mutual benefit','Apply courage to business decisions but plan before acting','Invest a portion of income in property and real estate'] },
      Mercury:{ details:['Business, trade, and commerce bring significant profits','Multiple simultaneous income streams are achievable and sustainable','Communication skills, writing, and advisory work are monetized well','Trading in stocks, commodities, or digital assets can work with knowledge','Short-term investments in fast-moving sectors yield good returns'], remedies:['Donate green moong dal and green items on Wednesdays','Maintain meticulous and accurate financial records always','Continuously acquire new skills relevant to your income source','Avoid lending money to friends or family without formal agreements'] },
      Jupiter:{ details:['Overall wealth expansion and abundance are the hallmarks of this period','Income through teaching, consulting, legal advisory, or finance','Children or younger relatives may bring unexpected financial fortune','Legal disputes if any tend to resolve favorably and profitably','Religious, charitable, or humanitarian work generates surprising abundance'], remedies:['Donate yellow turmeric, yellow items, and books on Thursdays','Support educational institutions, scholarships, and learning causes','Express genuine respect and gratitude toward teachers and gurus','Consider investing in yellow sapphire to accelerate wealth potential'] },
      Venus:{ details:['Luxury goods, comfort, and material abundance naturally increase','Arts, entertainment, fashion, beauty, and creative businesses are profitable','Joint income from partnerships and collaborative ventures is favorable','Spouse or romantic partner may bring significant financial resources','Vehicle, jewelry, and property acquisitions are auspicious and favorable'], remedies:['Donate white items — rice, sugar, white cloth — on Fridays','Maintain harmony and beauty in your home and relationships','Invest in arts, creative businesses, and luxury sectors','Keep the home beautiful and aesthetically pleasing for Lakshmi'] },
      Saturn:{ details:['Slow but remarkably steady and durable income growth','Hard work, persistence, and consistent effort are the primary wealth keys','Income from service industries, labor, real estate, or long-term projects','Real estate gains materialize after initial delays and patience','Inheritance, delayed payments, or old dues may finally arrive'], remedies:['Donate black sesame, iron, or black cloth to the poor on Saturdays','Serve poor, disabled, and underprivileged communities generously','Maintain patience with financial timelines; avoid shortcuts','Build disciplined savings habits and systematic investment plans'] },
      Rahu:{ details:['Foreign sources of income, exports, or international business are promising','Technology, research, unconventional sectors, and innovation are profitable','Sudden unexpected gains are possible but equally sudden losses can occur','Avoid all speculative investments, gambling, or get-rich-quick schemes','Income from research, analytics, or cutting-edge technology is favored'], remedies:['Donate at charitable institutions on Saturdays at twilight','Maintain complete transparency in all financial dealings and accounts','Strictly avoid speculation, gambling, and leveraged investments','Diversify investments across sectors for risk management'] },
      Ketu:{ details:['Material wealth may feel emotionally unsatisfying despite adequate income','Spiritual pursuits, healing, or research may become the primary source','Unexpected material losses often carry important karmic lessons','Past-life financial karma is clearing — accept with equanimity','Income from occult, spiritual, alternative medicine, or investigation is possible'], remedies:['Donate blankets, multicolored items, and sesame generously','Cultivate a deeply spiritual and non-attachment approach to wealth','Avoid becoming financially attached to outcomes; surrender to karma','Practice daily gratitude for what you have rather than what you want'] },
    };
    return s[planet] ?? { details:[], remedies:[] };
  }

  generateWealthPrediction(mahadasha: string, antardasha?: string, pratyantardasha?: string): PredictionResult {
    let score = this._planetScore(mahadasha, 'wealth');
    const spec = this._wealthSpecifics(mahadasha);
    let rel = 'neutral';

    if (antardasha) {
      rel = this.getRelationship(mahadasha, antardasha);
      const pairEff = getPairEffect(mahadasha, antardasha);
      if (pairEff) {
        spec.details.unshift(pairEff.wealth);
        score = Math.min(10, Math.max(1, score + pairEff.ratingMod * 0.5));
      } else {
        const adScore = this._planetScore(antardasha, 'wealth');
        if (rel === 'friend') { spec.details.push(`${antardasha} sub-period enhances financial opportunities and income streams`); score = Math.min(10, score + 1); }
        else if (rel === 'enemy') { spec.details.push(`${antardasha} sub-period may bring financial challenges or unexpected expenses`); score = Math.max(1, score - 1); }
        else { score = (score + adScore) / 2; }
      }
    }

    if (pratyantardasha) {
      const pdScore = this._planetScore(pratyantardasha, 'wealth');
      score = (score * 0.7) + (pdScore * 0.3);
    }

    const trend = this._trendFromScore(score);
    const intensity = this._intensityLabel(rel, 'wealth', score);
    const summary = score >= 7
      ? `${mahadasha} dasha brings strong financial growth, wealth accumulation, and prosperity.`
      : score >= 5
        ? `${mahadasha} dasha brings moderate financial stability. Consistent effort ensures steady progress.`
        : `${mahadasha} dasha requires careful financial management and patience for wealth building.`;

    return { area:'wealth', trend, intensity, summary, details:spec.details, remedies:spec.remedies, keywords:['money','income','savings','investments','wealth'] };
  }

  // ─── Career ───────────────────────────────────────────────────────────────

  private _careerSpecifics(planet: string): { details: string[]; remedies: string[] } {
    const s: Record<string, { details: string[]; remedies: string[] }> = {
      Sun:{ details:['Leadership, managerial, and authority positions are strongly favored','Government jobs, civil services, and political careers are at their best','Recognition, promotions, and appreciation from superiors are likely','Career transition into heading a team or department is very auspicious','Fame, professional reputation, and public recognition grow steadily'], remedies:['Rise before sunrise and begin work in morning for best productivity','Maintain strict integrity at the workplace at all times','Avoid conflicts with superiors — work with authority, not against it','Seek blessings from your father or a senior mentor for career success'] },
      Moon:{ details:['Public-facing roles, hospitality, and people-oriented careers are favored','Creative, nurturing, and counseling professions are naturally suited','Career changes or role shifts may happen frequently but productively','Businesses in food, dairy, hospitality, or water-related sectors thrive','Work environment and relationships with colleagues significantly affect output'], remedies:['Maintain healthy work-life balance and emotional boundaries','Create an aesthetically pleasant and harmonious workspace','Trust your intuition in career decisions — it is heightened now',"Seek your mother's blessings before important career decisions"] },
      Mars:{ details:['Technical engineering, military, police, and physical careers excel significantly','Real estate, construction, and property-related businesses are highly favorable','Sports, athletics, and competitive professional fields bring achievement','May face workplace conflicts or competition — use energy productively','Action-oriented, initiative-taking approach is well-rewarded this period'], remedies:['Channel all surplus energy into productive work and exercise','Avoid unnecessary arguments and heated confrontations at the workplace','Take bold initiative in career moves but exercise patience strategically','Maintain regular physical exercise to manage the high Martian energy'] },
      Mercury:{ details:['Communication, media, writing, and publishing careers are at their peak','Business, trading, and commercial ventures see remarkable success','Teaching, IT, analytics, and advisory roles bring recognition and growth','May successfully juggle multiple projects or income streams simultaneously','Professional networking and relationship building opens new opportunities'], remedies:['Continuously learn new skills and stay updated in your field','Maintain professional, clear, and precise communication always','Use analytical and logical abilities to maximum professional advantage','Build and nurture a strong professional network systematically'] },
      Jupiter:{ details:['Teaching, advisory, consulting, law, and spiritual careers are strongly favored','Significant business or professional expansion is the hallmark of this period','Legal, financial, and banking sectors bring success and recognition','Mentoring and guiding others becomes a natural and rewarding career role','International connections and opportunities open up significantly'], remedies:['Maintain unwavering ethics and dharma in all professional dealings','Share your knowledge, skills, and resources generously with others','Respect seniors, mentors, and teachers deeply and consistently','Commit to continuous learning and professional development'] },
      Venus:{ details:['Arts, entertainment, fashion, beauty, and creative industries are at their peak','Luxury goods, hospitality, tourism, and lifestyle sectors see excellent results','Professional partnerships and collaborative ventures are particularly successful','Work environment becomes significantly more pleasant and aesthetically refined','Creative projects and initiatives receive recognition and public appreciation'], remedies:['Maintain workplace harmony and resolve conflicts with grace','Present yourself professionally and dress with appropriate elegance','Actively build and maintain positive professional relationships','Add beauty, creativity, and elegance to the quality of your work'] },
      Saturn:{ details:['Career advancement is slow but systematically built on solid foundations','Hard work, discipline, long hours, and dedicated persistence are required','Initial delays and obstacles in career are followed by lasting recognition','Service-oriented, administrative, and detail-focused roles bring satisfaction','Long-term career building, institutional work, and legacy creation are favored'], remedies:['Practice patience and persistence; Saturn rewards long-term effort','Complete all pending tasks, commitments, and professional obligations','Avoid shortcuts, ethical compromises, and quick fixes in career','Respect and treat your subordinates, workers, and peers with dignity'] },
      Rahu:{ details:['Unconventional, innovative, technology-driven, or foreign careers are favored','Foreign companies, international organizations, or global markets bring success','Sudden and unexpected career changes can lead to surprising advancements','Politics, media, technology, and research fields can bring significant fame','Investigation, analysis, and behind-the-scenes professional work excels'], remedies:['Stay grounded, authentic, and humble despite career success and recognition','Avoid office politics, manipulation, and unethical professional strategies','Be completely honest in professional dealings and contract commitments','Keep your long-term career vision clear and do not get distracted by shortcuts'] },
      Ketu:{ details:['Spiritual, healing, research, investigative, and occult careers are well-suited','Past professional skills and hidden talents resurface with new relevance','May experience a gradual loss of interest in the current career trajectory','Professional detachment from material success opens deeper vocational calling','Research, analysis, and investigative roles bring unexpected professional success'], remedies:['Find authentic and deep meaning in your current professional work','Consider transitioning toward a career better aligned with your deeper values','Do not artificially force career ambitions that no longer resonate with you','Focus on professional contribution, mastery, and service over recognition'] },
    };
    return s[planet] ?? { details:[], remedies:[] };
  }

  generateCareerPrediction(mahadasha: string, antardasha?: string, pratyantardasha?: string): PredictionResult {
    let score = this._planetScore(mahadasha, 'career');
    const pd = this.getPlanetData(mahadasha);
    const professions = (pd.professions as string[]) ?? [];
    const spec = this._careerSpecifics(mahadasha);
    const details: string[] = professions.length ? [`Favorable career areas: ${professions.slice(0,4).join(', ')}`] : [];
    details.push(...spec.details);
    let rel = 'neutral';

    if (antardasha) {
      rel = this.getRelationship(mahadasha, antardasha);
      const pairEff = getPairEffect(mahadasha, antardasha);
      if (pairEff) {
        details.push(`${antardasha} sub-period: ${pairEff.career}`);
        score = Math.min(10, Math.max(1, score + pairEff.ratingMod * 0.5));
      } else {
        if (rel === 'friend') { details.push(`${antardasha} sub-period accelerates career growth and professional recognition`); score = Math.min(10, score + 1); }
        else if (rel === 'enemy') { details.push(`${antardasha} sub-period may bring workplace friction and professional challenges`); score = Math.max(1, score - 1); }
      }
    }

    if (pratyantardasha) {
      const pdRel = this.getRelationship(antardasha ?? mahadasha, pratyantardasha);
      if (pdRel === 'enemy') details.push(`${pratyantardasha} pratyantardasha creates a short challenging phase — navigate carefully`);
      else if (pdRel === 'friend') details.push(`${pratyantardasha} pratyantardasha provides a short favorable window for career moves`);
    }

    const trend = this._trendFromScore(score);
    const intensity = this._intensityLabel(rel, 'career', score);
    const summary = score >= 7
      ? `${mahadasha} dasha strongly favors career growth, professional recognition, and success.`
      : score >= 5
        ? `${mahadasha} dasha brings steady career progress with focused and consistent effort.`
        : `${mahadasha} dasha requires patience and discipline in career; long-term perspective is key.`;

    return { area:'career', trend, intensity, summary, details, remedies:spec.remedies, keywords:['job','profession','promotion','business',...professions.slice(0,2)] };
  }

  // ─── Relationships ────────────────────────────────────────────────────────

  private _relSpecifics(planet: string): { details: string[]; remedies: string[] } {
    const s: Record<string, { details: string[]; remedies: string[] }> = {
      Sun:{ details:['Relationship with father becomes a central and significant theme','Ego dynamics may create strain in personal partnerships and marriage','Authority and leadership may unconsciously dominate relationship dynamics','Professional recognition can attract meaningful personal connections','Leadership role naturally assumed in family and social matters'], remedies:['Consciously practice genuine humility in all your close relationships','Give and receive respect equally in partnerships and family','Actively avoid domineering behavior in the home and with loved ones','Invest quality, undivided time and attention in your father relationship'] },
      Moon:{ details:['Emotional bonding with loved ones deepens and becomes more fulfilling',"Mother's wellbeing, health, and influence become central to life",'Nurturing, supportive, and caring relationships naturally flourish','Mood variations and emotional cycles directly affect relationship harmony','Home, family, and domestic life are naturally emphasized and important'], remedies:['Express emotions constructively and openly rather than suppressing them','Actively create emotional security and stability for your loved ones','Spend meaningful, quality time with your mother and maternal family','Create a peaceful, harmonious, and emotionally safe home environment'] },
      Mars:{ details:['Passion, intensity, and physical energy are high in relationships','Potential for conflicts, arguments, and power struggles with partners','Relationship with brothers and male siblings becomes significant and active','Physical attraction and chemistry in romantic relationships intensifies','Courage and directness in addressing relationship issues is well-timed'], remedies:['Actively and consciously control anger and reactive responses in relationships','Channel intense passionate energy into constructive and creative outlets','Maintain and invest in positive, healthy relations with brothers and male relatives','Practice patience and emotional intelligence consistently with your partner'] },
      Mercury:{ details:['Communication quality becomes the foundation and key of strong relationships','Friendships expand and become more intellectually stimulating and varied','Intellectual compatibility and mental rapport are highly valued now','Multiple social connections and diverse social engagements are likely','Youthful, playful, and light-hearted interactions characterize this period'], remedies:['Communicate with clarity, precision, and compassionate intention','Listen deeply and actively to your partner and loved ones','Invest time in nurturing and maintaining your closest friendships','Avoid over-intellectualizing and analyzing emotional relationship dynamics'] },
      Jupiter:{ details:['Marriage, long-term committed relationships, and partnerships are strongly favored','Children bring tremendous joy, blessings, and new dimensions of love','Wisdom, maturity, and generosity naturally improve all relationship quality','May meet or deepen connection with a life partner through education or spirituality','Guru, mentor, or teacher relationships enter life with profound impact'], remedies:['Be genuinely generous, giving, and supportive in all your relationships','Deeply respect your spouse, partner, and elders in all interactions','Guide, mentor, support, and invest in your children with wisdom and patience','Maintain strict ethical standards and dharmic conduct in all relationships'] },
      Venus:{ details:['Romance, love, and deep romantic connections are at their peak','Marriage prospects are at their most auspicious and favorable','Physical, emotional, and aesthetic harmony with a partner is exceptional','Artistic, creative, and beauty-related connections form naturally','Luxury, comfort, and shared pleasures enhance relationship satisfaction'], remedies:['Express love, appreciation, and gratitude freely and frequently','Create and maintain beauty and elegance in your relationship environment','Avoid materialism, surface attraction, and transactional thinking in love','Maintain absolute fidelity, trust, and transparency in committed relationships'] },
      Saturn:{ details:['Relationships are rigorously tested by time, commitment, and responsibility','Marriage or serious long-term commitment may come after a significant delay','Loyalty, duty, responsibility, and endurance are the defining relationship themes','May feel emotionally restricted, burdened by duty, or isolated at times','Long-lasting, durable, karmic bonds form if you remain patient and committed'], remedies:['Practice profound and sustained patience with relationship growth and pace','Accept responsibilities and obligations in relationships willingly and gracefully','Avoid chronic criticism, judgment, and fault-finding in your partner','Serve, support, and give care to elderly relatives as a relationship duty'] },
      Rahu:{ details:['Unconventional, unexpected, or cross-cultural relationships may develop','Partner may come from a different cultural, ethnic, or social background','Intensely obsessive attractions or infatuations are possible and may be misleading','In-law relationships and social image in relationships become complex','Social reputation and public perception in relationships becomes important'], remedies:['Actively avoid deception, manipulation, and dishonesty in relationships','Stay grounded and realistic despite powerful and magnetic attractions','Be completely clear, direct, and transparent about relationship goals','Establish and maintain healthy, firm emotional and personal boundaries'] },
      Ketu:{ details:['Spiritual dimensions, inner growth, and soul-level connections are emphasized','Deep and powerful past-life karmic connections surface and demand attention','Feelings of misunderstanding, isolation, or being unseen in relationships possible','Primary focus naturally turns inward to personal and spiritual growth','Intuitive, psychic, and soul-level bonds are more real than surface connections'], remedies:['Actively seek and cultivate spiritual partnerships and conscious community','Accept and integrate relationship karma gracefully, without resistance or blame','Focus your energy on practicing unconditional love without conditions or expectations','Practice active forgiveness, compassion, and conscious releasing of old relationship patterns'] },
    };
    return s[planet] ?? { details:[], remedies:[] };
  }

  generateRelationshipPrediction(mahadasha: string, antardasha?: string, pratyantardasha?: string): PredictionResult {
    let score = this._planetScore(mahadasha, 'relationship');
    const pd = this.getPlanetData(mahadasha);
    const relationships = (pd.relationships as string[]) ?? [];
    const spec = this._relSpecifics(mahadasha);
    const details: string[] = relationships.length ? [`Key relationships highlighted: ${relationships.join(', ')}`] : [];
    details.push(...spec.details);
    let rel = 'neutral';

    if (antardasha) {
      rel = this.getRelationship(mahadasha, antardasha);
      const pairEff = getPairEffect(mahadasha, antardasha);
      if (pairEff) {
        details.push(`${antardasha} sub-period: ${pairEff.relationships}`);
        score = Math.min(10, Math.max(1, score + pairEff.ratingMod * 0.4));
      } else {
        if (rel === 'friend') { details.push(`${antardasha} sub-period enhances relationship harmony and deepens emotional bonds`); score = Math.min(10, score + 1); }
        else if (rel === 'enemy') { details.push(`${antardasha} sub-period may bring relationship friction, conflicts, or misunderstandings`); score = Math.max(1, score - 1); }
      }
    }

    if (pratyantardasha) {
      const pdRel = this.getRelationship(antardasha ?? mahadasha, pratyantardasha);
      if (pdRel === 'enemy') details.push(`${pratyantardasha} pratyantardasha creates a short but intense relationship challenge — proceed with awareness`);
      else if (pdRel === 'friend') details.push(`${pratyantardasha} pratyantardasha brings a brief but deeply harmonious relationship window`);
    }

    const trend = this._trendFromScore(score);
    const intensity = this._intensityLabel(rel, 'relationship', score);
    const summary = score >= 7
      ? `${mahadasha} dasha brings harmony, love, and deeply meaningful positive relationships.`
      : score >= 5
        ? `${mahadasha} dasha brings stable relationships with specific dynamics to be mindfully navigated.`
        : `${mahadasha} dasha may bring relationship challenges that ultimately teach profound life lessons.`;

    return { area:'relationships', trend, intensity, summary, details, remedies:spec.remedies, keywords:['marriage','spouse','love','family',...relationships.slice(0,2)] };
  }

  // ─── General ─────────────────────────────────────────────────────────────

  private _generalSpecifics(planet: string): { details: string[]; remedies: string[] } {
    const s: Record<string, { details: string[]; remedies: string[] }> = {
      Sun:{ details:['Confidence, self-expression, and inner authority naturally increase','Recognition, public appreciation, and fame are genuinely possible','Spiritual growth comes powerfully through authentic self-discovery','Government institutions, official matters, and authorities favor you','East direction is highly auspicious for home, office, and travel','Success in competitive endeavors, examinations, and leadership contests','Leadership abilities emerge naturally and are recognized by others'], remedies:['Wake up before sunrise and engage in morning spiritual practice daily','Practice authentic daily gratitude and appreciation for blessings','Engage regularly in acts of genuine generosity and selfless service','Cultivate and maintain a healthy, grounded, and positive self-image'] },
      Moon:{ details:['Emotional intelligence, empathy, and intuition develop strongly','Travel, especially near water bodies and sacred natural sites, is favorable','Public image, social reputation, and community standing improve naturally','Dreams, inner visions, and intuitive insights become heightened and accurate','Northwest direction is favorable for important activities and movement','Feminine energy, creativity, and receptivity are at their peak','Deep connection with nature, the ocean, and natural rhythms is beneficial'], remedies:['Practice mindfulness, present-moment awareness, and daily meditation','Spend regular time near natural water bodies, rivers, lakes, or the ocean','Honor, respect, and actively support the women in your life','Follow and maintain a consistent, regular, and nourishing sleep schedule'] },
      Mars:{ details:['Physical energy, courage, boldness, and vital strength increase significantly','Property matters, real estate, and asset-building deserve focused attention','Competitions, athletic endeavors, and sports bring achievement and recognition','Technical skills, engineering abilities, and mechanical aptitude sharpen','South direction is auspicious for important activities and initiatives','Legal or property-related disputes may require careful and skilled navigation','Physical strength, stamina, and athletic performance are at their peak'], remedies:['Exercise vigorously and consistently to effectively channel high Mars energy','Practice deliberate patience and calm in all disputes and conflicts','Avoid unnecessary arguments and confrontations that deplete your vital energy','Support and invest time and resources in brothers and male relatives'] },
      Mercury:{ details:['Learning, formal education, and skill acquisition are naturally emphasized','Writing, communication skills, and verbal expression improve dramatically','Short-distance travels prove beneficial, stimulating, and intellectually enriching','Business and commercial acumen sharpen to peak performance levels','North direction is highly favorable for important activities and ventures','Analytical, logical, and critical thinking abilities reach their fullest potential','Social circle expands productively with intellectually stimulating new connections'], remedies:['Read diverse, challenging literature and engage in continuous active learning','Practice precise, clear, compassionate, and effective communication daily','Keep a detailed reflective journal or diary to process insights and track growth','Actively help, mentor, and support students and young people around you'] },
      Jupiter:{ details:['Spiritual growth, expanded wisdom, and philosophical understanding increase','Higher education, advanced degrees, and specialized learning are strongly favored','Long-distance travel, especially sacred pilgrimage, is auspicious and transformative','Legal and contractual matters tend to conclude favorably and to your benefit','Northeast direction is especially auspicious for all important activities','Children, students, and young people become sources of genuine joy and blessing','Overall fortune, life luck, and divine grace are remarkably strong'], remedies:['Study sacred scriptures, philosophical works, and wisdom traditions systematically','Teach, share knowledge generously, and mentor those who seek your guidance','Visit temples, ashrams, and sacred places for spiritual inspiration and blessings','Practice consistent generosity, charitable giving, and selfless service to others'] },
      Venus:{ details:['Artistic expression, creative vision, and aesthetic sensitivity flourish greatly','Material comfort, luxury, and sensory pleasures naturally and pleasurably increase','Travel for leisure, pleasure, creative inspiration, and cultural experiences is favored','Natural beauty in people, art, nature, and environments is deeply appreciated','Southeast direction is auspicious for home, workspace, and important activities','Social life becomes vibrant, lively, diverse, and genuinely enjoyable','Material comforts, conveniences, and aesthetic pleasures become naturally abundant'], remedies:['Actively engage in artistic, creative, musical, or aesthetic activities regularly','Consciously appreciate and celebrate beauty in every dimension of daily life','Maintain impeccable personal cleanliness, grooming, and aesthetic presentation','Express sincere and heartfelt gratitude for all material comforts and blessings received'] },
      Saturn:{ details:['Profound and lasting life lessons arrive most powerfully through unavoidable challenges','Discipline, structure, planning, routine, and consistency are absolutely essential','Unresolved karma from the past surfaces urgently and persistently for final resolution','Service to others, community, and the marginalized brings genuine spiritual growth','West direction is particularly significant for activities, movement, and decisions','Elderly, poor, and marginalized people especially need and deserve your active support','Patience, perseverance, acceptance, and endurance are the key virtues of this entire period'], remedies:['Consciously accept all challenges as powerful and necessary opportunities for growth','Practice rigorous discipline and consistent structure in all areas of daily life','Serve the elderly, disabled, and underprivileged with genuine dedication and compassion','Completely avoid laziness, procrastination, and passive resistance to necessary action'] },
      Rahu:{ details:['Profoundly unconventional, surprising, and transformative experiences are likely','Foreign travel, international connections, and cross-cultural experiences are highly possible','Technology, innovation, research, and cutting-edge fields become increasingly important','Illusions, confusion, and clarity alternate with disorienting but revealing frequency','Southwest direction is particularly significant for activities and major decisions','Sudden, unexpected events — both powerfully positive and challenging — are characteristic','Research, investigation, and analytical deep-dive work yields surprising discoveries'], remedies:['Maintain a grounded, humble, and authentic sense of self during rapid changes','Strictly avoid all intoxicants, addictive substances, and addictive behaviors','Practice unwavering truthfulness and ethical integrity in all situations','Maintain consistent and grounding daily spiritual practices throughout this period'] },
      Ketu:{ details:['Profound spiritual awakening, enlightenment, and liberation actively unfold','Past-life karma, patterns, and unresolved issues finally surface for permanent resolution','Natural and growing detachment from the material world and its transient concerns','Psychic abilities, spiritual intuition, and inner knowing increase dramatically','Southwest direction is significantly connected to your important life experiences','Healing abilities and gifts of intuition and perception actively develop','Liberation from outdated, limiting, and no-longer-serving patterns is the primary theme'], remedies:['Practice daily meditation, deep contemplation, and sustained inner awareness','Consciously let go of all attachments to outcomes, possessions, and identities','Serve actively and selflessly at spiritual centers, ashrams, and healing institutions','Focus your energy, attention, and intentions entirely on inner transformation and liberation'] },
    };
    return s[planet] ?? { details:[], remedies:[] };
  }

  generateGeneralPrediction(mahadasha: string, antardasha?: string, pratyantardasha?: string): PredictionResult {
    const pd = this.getPlanetData(mahadasha);
    const nature = (pd.nature as string) ?? 'neutral';
    const keywords = (pd.keywords as string[]) ?? [];
    let score = this._planetScore(mahadasha, 'health'); // balanced proxy
    score = (score + this._planetScore(mahadasha, 'career') + this._planetScore(mahadasha, 'wealth')) / 3;
    const spec = this._generalSpecifics(mahadasha);
    let rel = 'neutral';

    if (antardasha) {
      rel = this.getRelationship(mahadasha, antardasha);
      const pairEff = getPairEffect(mahadasha, antardasha);
      if (pairEff) {
        score = Math.min(10, Math.max(1, score + pairEff.ratingMod * 0.5));
        if (pairEff.bonus) spec.details.unshift(`✦ ${pairEff.bonus}`);
      } else {
        if (rel === 'friend') { spec.details.push(`${antardasha} sub-period amplifies all positive effects of this Mahadasha`); score = Math.min(10, score + 0.5); }
        else if (rel === 'enemy') { spec.details.push(`${antardasha} sub-period requires more careful navigation of life situations`); }
      }
    }

    const trend = this._trendFromScore(score);
    const intensity = this._intensityLabel(rel, 'general', score);
    const summary = nature === 'benefic'
      ? `${mahadasha} period brings growth, meaningful opportunities, and genuinely positive life experiences.`
      : nature === 'malefic'
        ? `${mahadasha} period brings transformative challenges that ultimately catalyze profound personal growth.`
        : `${mahadasha} period brings unique and highly specific life experiences and important karmic lessons.`;

    if (pratyantardasha) {
      const pdRel = this.getRelationship(antardasha ?? mahadasha, pratyantardasha);
      if (pdRel === 'friend') spec.details.push(`${pratyantardasha} sookshma period brings a brief but highly favorable window of opportunity`);
    }

    return { area:'general', trend, intensity, summary, details:spec.details, remedies:spec.remedies, keywords:keywords.slice(0,5) };
  }

  generateCompletePrediction(
    mahadasha: string,
    antardasha?: string,
    pratyantardasha?: string,
    sookshmaDasha?: string,
    chartCtx?: ChartContext,
  ): DashaPrediction {
    this._ctx = chartCtx ?? null;
    try {
    const pd = this.getPlanetData(mahadasha);
    const periodType = sookshmaDasha ? 'sookshma'
      : pratyantardasha ? 'pratyantardasha'
      : antardasha ? 'antardasha'
      : 'mahadasha';

    const health        = this.generateHealthPrediction(mahadasha, antardasha, pratyantardasha);
    const wealth        = this.generateWealthPrediction(mahadasha, antardasha, pratyantardasha);
    const career        = this.generateCareerPrediction(mahadasha, antardasha, pratyantardasha);
    const relationships = this.generateRelationshipPrediction(mahadasha, antardasha, pratyantardasha);
    const general       = this.generateGeneralPrediction(mahadasha, antardasha, pratyantardasha);

    // Score weighting: career 30%, wealth 25%, relationships 20%, health 15%, general 10%
    const hScore = this._planetScore(mahadasha,'health'), wScore = this._planetScore(mahadasha,'wealth'), cScore = this._planetScore(mahadasha,'career'), rScore = this._planetScore(mahadasha,'relationship');
    let weightedAvg = (cScore * 0.30 + wScore * 0.25 + rScore * 0.20 + hScore * 0.15 + 6 * 0.10);

    const pairEff = antardasha ? getPairEffect(mahadasha, antardasha) : null;
    if (pairEff) weightedAvg = Math.min(10, Math.max(1, weightedAvg + pairEff.ratingMod));

    const overallRating = Math.min(10, Math.max(1, Math.round(weightedAvg)));
    const nature = (pd.nature as string) ?? 'neutral';

    let overallTheme = pairEff
      ? pairEff.theme
      : nature === 'benefic'
        ? `${mahadasha} brings growth, expansion, and positive life experiences`
        : nature === 'malefic'
          ? `${mahadasha} brings transformative challenges requiring patience and inner strength`
          : `${mahadasha} brings unique karmic experiences and important life lessons`;

    if (!pairEff && antardasha) {
      const rel = this.getRelationship(mahadasha, antardasha);
      if (rel === 'friend') overallTheme += `, strongly enhanced by the supportive ${antardasha} sub-period`;
      else if (rel === 'enemy') overallTheme += `, with significant challenges during the ${antardasha} sub-period`;
      else overallTheme += `, with ${antardasha} adding its specific flavor to this period`;
    }

    if (pratyantardasha) overallTheme += ` — currently in ${pratyantardasha} Pratyantardasha`;
    if (sookshmaDasha) overallTheme += ` (${sookshmaDasha} Sookshma Dasha)`;

    // Surface the dasha lord's Ashtakavarga strength when available.
    const lordBindus = this._bindusForLord(mahadasha);
    if (lordBindus != null) {
      overallTheme += `. ${mahadasha}'s Ashtakavarga in its own rashi: ${lordBindus}/8 (${bindusToLabel(lordBindus)})`;
    }

    // Surface the dasha lord's natal house — the most important chart-specific
    // qualifier for any dasha prediction.
    const houseNote = this._houseAnnotation(mahadasha);
    if (houseNote) {
      general.details.unshift(houseNote);
      // If the antardasha lord is also placed, add its house too.
      if (antardasha) {
        const adNote = this._houseAnnotation(antardasha);
        if (adNote) general.details.splice(1, 0, `Sub-period ${adNote.toLowerCase()}`);
      }
    }

    return {
      dashaLord: mahadasha, antardasha, pratyantardasha, sookshmaDasha,
      periodType, overallTheme, overallRating,
      predictions: { health, wealth, career, relationships, general },
      favorableActivities: this._favorable(mahadasha),
      unfavorableActivities: this._unfavorable(mahadasha),
      importantTransits: [],
      gemstone: (pd.gemstone as string) ?? null,
      mantra: (pd.mantra as string) ?? null,
      deity: (pd.deity as string) ?? null,
      combinationWarning: pairEff?.warning,
      combinationBonus: pairEff?.bonus,
    };
    } finally {
      this._ctx = null;
    }
  }

  private _favorable(planet: string): string[] {
    const a: Record<string, string[]> = {
      Sun:['Starting leadership roles or applying for senior positions','Government applications, licenses, and official matters','Medical treatments and seeking diagnosis','Purchasing gold, copper, or orange/red items','Father-related ceremonies and family gatherings','Public appearances, speeches, and recognition events'],
      Moon:['Starting new ventures during bright fortnight (Shukla Paksha)','Real estate transactions and property matters','Long-distance or near-water travel and pilgrimages','Nurturing and charitable activities for women and children','Creative and artistic pursuits requiring emotional depth','Water-related activities and ocean or river rituals'],
      Mars:['Property transactions and real estate investments','Intense sports, physical activities, and martial arts','Medically necessary or elective surgeries','Mechanical work, engineering projects, and technical initiatives','Sibling-related matters and family legal settlements','Competitive examinations and performance challenges'],
      Mercury:['Business venture launches and commercial agreements','Educational pursuits, certifications, and skill upgrades','Writing, publishing, blogging, and media projects','Communication projects and networking events','Short travels and local business trips','Financial planning, budgeting, and investment research'],
      Jupiter:['Marriage ceremonies and engagement announcements','Religious activities, temple visits, and sacred rituals','Higher education admissions and academic pursuits','Legal filings and court-related activities','Teaching, mentoring, and knowledge-sharing activities','Charity donations and humanitarian service projects'],
      Venus:['Marriage ceremonies and romantic commitments','Artistic projects, music, dance, and creative pursuits','Luxury purchases, jewelry, vehicles, and fine items','Beauty treatments, self-care, and wellness activities','Entertainment events and social celebrations','Partnership agreements and collaborative business ventures'],
      Saturn:['Long-term financial and life planning sessions','Real estate investments (with patience for results)','Service and volunteer activities for the underprivileged','Discipline-intensive work requiring sustained effort','Iron, steel, oil, gas, mining industry activities','Agricultural investments and land development projects'],
      Rahu:['Technology ventures and digital business launches','Foreign trade, export-import, and international business','Research projects and investigative journalism','Unconventional paths, startup ventures, and innovation','Political activities and media campaigns','Innovation projects and disruptive technology development'],
      Ketu:['Spiritual practices, meditation retreats, and yoga','Research, investigation, and deep analytical studies','Healing activities, alternative medicine, and energy work','Consciously letting go of old, limiting patterns and relationships','Occult studies, esoteric learning, and spiritual education','Meditation retreats and silent spiritual immersion programs'],
    };
    return a[planet] ?? [];
  }

  private _unfavorable(planet: string): string[] {
    const a: Record<string, string[]> = {
      Sun:['Decisions driven purely by ego and pride','Open conflicts with authority figures, government, or employers','Prolonged overexposure to direct sunlight without protection','Neglecting regular health checkups, especially heart and eyes','Arrogant, dismissive, or domineering behavior with others','Disrespecting, ignoring, or neglecting your father relationship'],
      Moon:['Major irreversible decisions on new moon or dark nights','Purely emotional, reactive, and ungrounded major decisions','Neglecting mental health, emotional wellbeing, and self-care','Chronic dehydration, poor water intake, and irregular eating','Disrespecting, neglecting, or being dismissive of your mother','Irregular, chaotic sleep patterns and chronic sleep deprivation'],
      Mars:['Impulsive, reactive, and unplanned major decisions','Highly risky, unresearched ventures without proper planning','Unnecessary arguments, heated confrontations, and conflicts','Dangerous sports or physical activities without proper safety','Ignoring injuries, wounds, and physical health symptoms','Destructive disputes with siblings or property co-owners'],
      Mercury:['Signing contracts without fully reading and understanding them','Deliberate miscommunication, deception, or manipulation of information','Chronic overthinking, analysis paralysis, and mental overload','Neglecting ongoing education, skill development, and learning','Dishonest, deceptive, or misleading financial or commercial dealings','Excessive, compulsive screen time and digital device addiction'],
      Jupiter:['Unethical professional practices and cutting moral corners','Disrespecting, ignoring, or undermining teachers and gurus','Excessive indulgence in food, drink, pleasure, or comfort','Neglecting spiritual growth, practice, and inner development','Arrogance about knowledge, wisdom, or intellectual attainment','Reckless financial extravagance and excessive material spending'],
      Venus:['Serious overindulgence in sensory pleasures and excess','Extramarital affairs, infidelity, and relationship dishonesty','Excessive luxury spending beyond genuine financial capacity','Neglecting, dismissing, or devaluing your primary partner','Superficial, transactional, and materialistic relationships','Vanity-driven and appearance-obsessed life choices and decisions'],
      Saturn:['Actively avoiding legitimate responsibilities and obligations','Disrespecting, ignoring, or mistreating workers and the poor','Chronic impatience with process, people, and necessary delays','Taking unethical shortcuts and compromising personal integrity','Ignoring and dismissing chronic or slow-developing health issues','Persistent laziness, procrastination, and passive resistance'],
      Rahu:['Get-rich-quick schemes, speculative gambling, and financial fraud','Substance abuse, intoxicants, and compulsive addictive behaviors','Deliberate deception, manipulation, and misleading of others','Consistently ignoring ethical standards and moral principles','Obsessive, addictive, and compulsive behavioral patterns','Reckless, ungrounded ambition far exceeding current capacity'],
      Ketu:['Excessive material attachment when detachment is the clear lesson','Actively ignoring your genuine spiritual calling and deeper purpose','Strong resistance to necessary, inevitable, and growth-producing change','Desperately holding onto people, roles, and situations from the past','Harmful social isolation, withdrawal, and rejection of community support','Consistently ignoring deep intuition, inner knowing, and spiritual guidance'],
    };
    return a[planet] ?? [];
  }
}

function ordinalSuffix(n: number): string {
  const v = n % 100;
  if (v >= 11 && v <= 13) return 'th';
  switch (n % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}
