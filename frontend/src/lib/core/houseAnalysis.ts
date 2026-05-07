import { HOUSE_DATA, RASHI_LORDS, getDignity } from './planetaryAnalysis';
import { PLANET_SIGNIFICATIONS } from './predictions';
import { RASHIS, RASHI_ENGLISH } from '../../types/astrology';

export { HOUSE_DATA };

// ─── House lord descriptions ───────────────────────────────────────────────

const HOUSE_LORD_IN_HOUSE: Record<number, Record<number, string>> = {
  // Lord of house X placed in house Y → brief reading
  1: {
    1:'Lord of self in 1st — strong vitality, self-reliance, and a clearly defined personality. Health is generally robust.',
    2:'Lord of self in 2nd — wealth and family central to identity. Income through personal effort; speech is a key asset.',
    3:'Lord of self in 3rd — courageous, communicative, and self-driven. Writing, media, or siblings play a defining role.',
    4:'Lord of self in 4th — deep roots in home and homeland. Mother is central; emotional peace is essential to function.',
    5:'Lord of self in 5th — creative intelligence defines the personality. Children and romantic life are life themes.',
    6:'Lord of self in 6th — life shaped by service, competition, and overcoming obstacles. Health requires active management.',
    7:'Lord of self in 7th — partnerships are the mirror of self. Identity is strongly shaped by spouse or close partners.',
    8:'Lord of self in 8th — life involves deep transformation, research, and hidden knowledge. Longevity-focused energy.',
    9:'Lord of self in 9th — fortunate, philosophical, and spiritually oriented. Father is a strong positive influence.',
    10:'Lord of self in 10th — career and public status are central life themes. Strong professional drive.',
    11:'Lord of self in 11th — gains, social networks, and desires drive the personality. Income through personal initiative.',
    12:'Lord of self in 12th — introspective, spiritual, or foreign-oriented. Hidden talents emerge through solitude.',
  },
  2: {
    1:'Wealth lord in 1st — financial prosperity tied to personal effort and health. Self-made wealth accumulation.',
    2:'Wealth lord in own house — strong financial stability, good family, and accumulation over lifetime.',
    3:'Wealth lord in 3rd — income through communication, writing, or siblings. Multiple smaller income streams.',
    4:'Wealth lord in 4th — wealth through property, vehicles, and mother\'s support. Real estate is favorable.',
    5:'Wealth lord in 5th — wealth through creativity, speculation, or children. Investments in education pay off.',
    6:'Wealth lord in 6th — financial challenges through debt or competition; income from service fields.',
    7:'Wealth lord in 7th — financial gains through partnerships and business. Spouse contributes to wealth.',
    8:'Wealth lord in 8th — wealth from hidden sources, inheritance, or joint finances. Sudden gains and losses.',
    9:'Wealth lord in 9th — very auspicious for wealth; fortune and luck amplify financial gains consistently.',
    10:'Wealth lord in 10th — income directly tied to career success. Professional status builds financial security.',
    11:'Wealth lord in 11th — excellent for gains; income multiplies through social networks and long-term effort.',
    12:'Wealth lord in 12th — expenses exceed income; wealth goes to foreign lands, spiritual causes, or hospitals.',
  },
  3: {
    1:'Courage lord in 1st — bold, self-assertive personality. Personal drive and communication are natural strengths.',
    2:'Courage lord in 2nd — siblings contribute to wealth. Income through communication-based family businesses.',
    3:'Courage lord in own house — excellent for communication, writing, skills, and sibling relationships.',
    4:'Courage lord in 4th — connection between home and communication. Mother and siblings closely linked.',
    5:'Courage lord in 5th — creative writing and artistic skills shine. Short journeys lead to romance or creativity.',
    6:'Courage lord in 6th — competitive and courageous in service. Victory over enemies through communication.',
    7:'Courage lord in 7th — siblings or communication connected to marriage. Business partnerships in media.',
    8:'Courage lord in 8th — research, occult writing, and investigative journalism. Short journeys can be risky.',
    9:'Courage lord in 9th — philosophical writing and long-distance communication thrive. Sibling may be a guide.',
    10:'Courage lord in 10th — career in communication, media, or skilled trades. Professional recognition for skills.',
    11:'Courage lord in 11th — gains through communication, siblings, and skilled work. Active social networking.',
    12:'Courage lord in 12th — writing in solitude; foreign communication work. Spiritual journeys and retreats.',
  },
  4: {
    1:'Home lord in 1st — strong connection to homeland and mother. Identity rooted in heritage and property.',
    2:'Home lord in 2nd — family wealth from property and ancestral resources. Beautiful home environment.',
    3:'Home lord in 3rd — short journeys to the homeland; communication with mother and siblings is frequent.',
    4:'Home lord in own house — very auspicious; beautiful home, excellent mother relationship, and peaceful domestic life.',
    5:'Home lord in 5th — creativity born from home environment. Children bring domestic happiness.',
    6:'Home lord in 6th — property disputes or challenges with mother possible. Home maintenance needs attention.',
    7:'Home lord in 7th — spouse connected to home and real estate. Business in property or domestic goods.',
    8:'Home lord in 8th — ancestral property has hidden complications. Transformative home changes across life.',
    9:'Home lord in 9th — very auspicious; fortunate property gains and a wise, positive mother.',
    10:'Home lord in 10th — career in real estate, hospitality, or government. Home and career are linked.',
    11:'Home lord in 11th — gains from property and real estate. Home-based income sources thrive.',
    12:'Home lord in 12th — home may be in a foreign land. Property losses possible; spiritual home practice.',
  },
  5: {
    1:'Intelligence lord in 1st — naturally creative and intelligent personality. Children are life\'s joy.',
    2:'Intelligence lord in 2nd — creative income and family wealth. Artistic or intellectual family tradition.',
    3:'Intelligence lord in 3rd — creative writing and skills. Communication as artistic and intellectual expression.',
    4:'Intelligence lord in 4th — happiness through creative home. Children\'s education is prioritized.',
    5:'Intelligence lord in own house — exceptional creativity, brilliant children, and strong spiritual merit.',
    6:'Intelligence lord in 6th — intelligence applied to service and problem-solving. Competition in creative fields.',
    7:'Intelligence lord in 7th — creative partner; business in arts and creative education.',
    8:'Intelligence lord in 8th — research and occult intelligence. Deeply investigative and transformative thinking.',
    9:'Intelligence lord in 9th — philosophical and dharmic creativity. Blessed children who are spiritually oriented.',
    10:'Intelligence lord in 10th — career through creative intelligence. Professional recognition for mental abilities.',
    11:'Intelligence lord in 11th — gains from creative ventures and children\'s success. Social circle includes artists.',
    12:'Intelligence lord in 12th — creative and spiritual intelligence. Meditation and isolation fuel creativity.',
  },
  6: {
    1:'Obstacle lord in 1st — health challenges require active management. Strong competitive instinct.',
    2:'Obstacle lord in 2nd — financial debts and family disputes possible. Income through healthcare or legal work.',
    3:'Obstacle lord in 3rd — competitive communication and sibling rivalry. Courage through overcoming obstacles.',
    4:'Obstacle lord in 4th — domestic and property disputes. Mother\'s health needs attention.',
    5:'Obstacle lord in 5th — challenges with children or speculative losses. Creativity overcoming difficulties.',
    6:'Obstacle lord in own house — strong in competition and service; enemies are defeated effectively.',
    7:'Obstacle lord in 7th — marriage involves challenges or a partner with health issues. Legal business disputes.',
    8:'Obstacle lord in 8th — viparita raja yoga potential; obstacles transform into hidden strengths over time.',
    9:'Obstacle lord in 9th — father faces challenges; fortune comes through overcoming adversity.',
    10:'Obstacle lord in 10th — career in medicine, law, or competitive fields. Obstacles are professional catalysts.',
    11:'Obstacle lord in 11th — gains through service and competition. Income from healthcare or legal fields.',
    12:'Obstacle lord in 12th — viparita raja yoga; enemies self-destruct; hidden healing abilities emerge.',
  },
  7: {
    1:'Partnership lord in 1st — identity strongly shaped by relationships. Public reputation matters greatly.',
    2:'Partnership lord in 2nd — spouse contributes to family wealth. Business partnerships in financial fields.',
    3:'Partnership lord in 3rd — communication with partner is central. Business partnerships in media or trade.',
    4:'Partnership lord in 4th — spouse connected to home or real estate. Happy domestic married life.',
    5:'Partnership lord in 5th — romantic and creative partnerships. Children come through happy marriage.',
    6:'Partnership lord in 6th — marriage requires extra effort and adjustment. Partner may have health issues.',
    7:'Partnership lord in own house — very favorable for marriage and partnerships. Supportive, well-matched spouse.',
    8:'Partnership lord in 8th — marriage involves transformation and deep karmic connection.',
    9:'Partnership lord in 9th — very auspicious; spouse from good family, fortunate partnership, foreign connections.',
    10:'Partnership lord in 10th — career benefits from partnerships. Spouse supports professional ambitions.',
    11:'Partnership lord in 11th — gains through partnerships and spouse. Business partnerships are financially rewarding.',
    12:'Partnership lord in 12th — foreign spouse or partner; marriage involves sacrifice and spiritual depth.',
  },
  8: {
    1:'Transformation lord in 1st — life involves recurring cycles of transformation. Longevity and resilience are strong.',
    2:'Transformation lord in 2nd — inheritance and hidden wealth are possible. Financial ups and downs through life.',
    3:'Transformation lord in 3rd — research writing and occult communication. Siblings connected to transformation.',
    4:'Transformation lord in 4th — home undergoes repeated transformation. Ancestral property has hidden history.',
    5:'Transformation lord in 5th — speculative and research intelligence. Hidden creative gifts and occult interests.',
    6:'Transformation lord in 6th — viparita raja yoga; hidden enemies self-destruct; strong karmic protection.',
    7:'Transformation lord in 7th — partner connected to occult or research. Marriage involves deep transformation.',
    8:'Transformation lord in own house — powerful for longevity, occult knowledge, and hidden wealth.',
    9:'Transformation lord in 9th — philosophical transformation; fortune through research or hidden knowledge.',
    10:'Transformation lord in 10th — career in research, medicine, insurance, or occult fields.',
    11:'Transformation lord in 11th — gains through research, joint finances, and transformation-related fields.',
    12:'Transformation lord in 12th — viparita raja yoga; hidden strengths emerge; profound spiritual transformation.',
  },
  9: {
    1:'Fortune lord in 1st — naturally lucky and fortunate personality. Father is a positive life force.',
    2:'Fortune lord in 2nd — family wealth and fortune aligned. Speech carries philosophical authority.',
    3:'Fortune lord in 3rd — fortune through writing and communication. Siblings may be philosophical guides.',
    4:'Fortune lord in 4th — fortunate home and mother. Property luck is strong; homeland brings blessings.',
    5:'Fortune lord in 5th — excellent; creative fortune and blessed children. Spiritual merit from past lives rewards.',
    6:'Fortune lord in 6th — fortune through service and overcoming obstacles. Father faces challenges.',
    7:'Fortune lord in 7th — fortunate partnerships and marriage. Business luck through collaborations.',
    8:'Fortune lord in 8th — fortune hidden in research and transformation. Sudden fortunate inheritances.',
    9:'Fortune lord in own house — most auspicious; maximum luck, strong dharma, and philosophical mastery.',
    10:'Fortune lord in 10th — career success brings fortune. Professional achievements align with life purpose.',
    11:'Fortune lord in 11th — exceptional gains; desires are fulfilled; social luck and fortune combined.',
    12:'Fortune lord in 12th — fortune in foreign lands or spiritual pursuit. Moksha-oriented life path.',
  },
  10: {
    1:'Career lord in 1st — career is a central life identity. Professional drive is the core personality trait.',
    2:'Career lord in 2nd — career in family business or finance. Professional income directly builds family wealth.',
    3:'Career lord in 3rd — career in communication, media, or skilled trades. Siblings influence professional path.',
    4:'Career lord in 4th — career in real estate, hospitality, or homeland-based work. Work from home is possible.',
    5:'Career lord in 5th — creative career. Work in arts, education, and entertainment brings recognition.',
    6:'Career lord in 6th — career in service, medicine, law, or competitive fields. Professional challenges sharpen skills.',
    7:'Career lord in 7th — career through partnerships and public dealings. Business partnerships define professional life.',
    8:'Career lord in 8th — career in research, medicine, insurance, or occult fields. Hidden professional talents.',
    9:'Career lord in 9th — dharmic career aligned with philosophy and higher learning. Teaching or law is indicated.',
    10:'Career lord in own house — very powerful for career; exceptional professional success and public recognition.',
    11:'Career lord in 11th — career directly generates income gains. Professional social networks are financially rewarding.',
    12:'Career lord in 12th — career in foreign lands, spirituality, or behind-the-scenes work.',
  },
  11: {
    1:'Gains lord in 1st — gains come through personal initiative. Self-made success and income growth.',
    2:'Gains lord in 2nd — excellent for accumulated wealth. Family and personal financial goals align perfectly.',
    3:'Gains lord in 3rd — gains through communication, siblings, and skilled work. Active networking generates income.',
    4:'Gains lord in 4th — gains through property, mother, and homeland. Real estate is a consistent income source.',
    5:'Gains lord in 5th — gains from creativity, children, and speculation. Creative ventures bring financial rewards.',
    6:'Gains lord in 6th — gains through service and competition. Income from healthcare or legal work is steady.',
    7:'Gains lord in 7th — gains through partnerships and business. Spouse contributes significantly to income goals.',
    8:'Gains lord in 8th — sudden and unexpected gains from research, joint finances, or inheritance.',
    9:'Gains lord in 9th — very auspicious; fortune multiplies gains. Father or guru supports financial goals.',
    10:'Gains lord in 10th — career is the primary source of gains. Professional success directly generates income.',
    11:'Gains lord in own house — most powerful for fulfilling desires and achieving consistent financial gains.',
    12:'Gains lord in 12th — gains go to foreign lands or spiritual causes. Expenses match income growth.',
  },
  12: {
    1:'Liberation lord in 1st — introspective and spiritually oriented personality. Foreign travel shapes identity.',
    2:'Liberation lord in 2nd — expenses from family and wealth resources. Foreign income supplements losses.',
    3:'Liberation lord in 3rd — journeys to isolated places. Writing and communication about spiritual topics.',
    4:'Liberation lord in 4th — home in a foreign land. Property may be in an institution or foreign territory.',
    5:'Liberation lord in 5th — creative and spiritual intelligence. Children may be spiritually oriented.',
    6:'Liberation lord in 6th — viparita raja yoga; hidden enemies lose their power; health improves through service.',
    7:'Liberation lord in 7th — foreign or spiritually oriented partner. Marriage involves sacrifice and transcendence.',
    8:'Liberation lord in 8th — viparita raja yoga potential; deep spiritual transformation brings hidden strength.',
    9:'Liberation lord in 9th — foreign philosophy and spiritual fortune. Father may live abroad or be spiritually inclined.',
    10:'Liberation lord in 10th — career in foreign lands, spirituality, or behind-the-scenes work. Work in institutions.',
    11:'Liberation lord in 11th — gains through foreign sources and spiritual networks. Income from abroad.',
    12:'Liberation lord in own house — powerfully moksha-oriented; spiritual liberation is a central life theme.',
  },
};

// ─── Planet combination in a house ────────────────────────────────────────

function planetCombinationEffect(planetNames: string[]): string | null {
  if (planetNames.length < 2) return null;
  const sorted = [...planetNames].sort();
  const pairs: string[] = [];
  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      pairs.push(`${sorted[i]}-${sorted[j]}`);
    }
  }
  const notable: Record<string, string> = {
    'Jupiter-Moon':   'Gajakesari Yoga — Moon-Jupiter conjunction creates fame, wisdom, and public recognition.',
    'Jupiter-Sun':    'Budhaditya-adjacent — Solar wisdom amplified; authority and knowledge combine powerfully.',
    'Mercury-Sun':    'Budhaditya Yoga — intellect and authority united; excellent for communication and leadership.',
    'Mars-Saturn':    'Challenging conjunction — energy meets obstruction; discipline is essential to avoid frustration.',
    'Mars-Rahu':      'High-energy volatile combination — ambition peaks but accidents and recklessness are risks.',
    'Moon-Rahu':      'Grahan influence — emotional turbulence and psychic intensity; mental health needs care.',
    'Moon-Saturn':    'Vish Yoga influence — emotional heaviness; depression risk; requires consistent spiritual practice.',
    'Jupiter-Saturn': 'Dharma-Karma axis — philosophical discipline; slow but profound achievement in life.',
    'Mercury-Venus':  'Artistic intelligence — creative, charming, and communicative; business in arts thrives.',
    'Sun-Saturn':     'Ego meets karma — authority challenged; slow recognition but deeply earned status.',
    'Venus-Rahu':     'Intense desire for beauty and pleasure; unconventional relationships; charisma is magnetic.',
    'Jupiter-Venus':  'Lakshmi Yoga potential — wealth, beauty, and wisdom combine for material and spiritual prosperity.',
    'Ketu-Mars':      'Past-life warrior energy — technical and surgical skills; accident risk intensified.',
    'Moon-Mars':      'Chandra-Mangala Yoga — emotional courage and protective instinct; real estate indicated.',
  };
  for (const pair of pairs) {
    const [a, b] = pair.split('-');
    const key1 = `${a}-${b}`;
    const key2 = `${b}-${a}`;
    if (notable[key1]) return notable[key1];
    if (notable[key2]) return notable[key2];
  }
  if (planetNames.length >= 3) {
    return `${planetNames.length}-planet stellium — concentrated energy in this house amplifies all themes of ${HOUSE_DATA[1]?.name ?? 'this area'}. Focus and intensity characterize all matters of this house throughout life.`;
  }
  return null;
}

// ─── Public API ────────────────────────────────────────────────────────────

export interface HouseAnalysis {
  houseNumber: number;
  rashiIndex: number;
  rashiName: string;
  rashiEnglish: string;
  houseData: typeof HOUSE_DATA[1];
  rashiLord: string;
  lordDignity: ReturnType<typeof getDignity>;
  lordHouse: number;
  lordHouseDesc: string;
  planetsInHouse: string[];
  planetEffects: Array<{ planet: string; effect: string; isRetrograde: boolean }>;
  combinationEffect: string | null;
  isAscendant: boolean;
  isEmpty: boolean;
}

export function analyzeHouse(
  houseNumber: number,
  ascendantRashiIndex: number,
  planets: Array<{ planet: string; rashiIndex: number; isRetrograde: boolean }>,
  allPlanetRashiMap: Record<string, number>,
): HouseAnalysis {
  const rashiIndex = (ascendantRashiIndex + houseNumber - 1) % 12;
  const rashiName: string = RASHIS[rashiIndex] ?? '';
  const rashiEnglish: string = (RASHI_ENGLISH as readonly string[])[rashiIndex] ?? '';
  const houseData = HOUSE_DATA[houseNumber] ?? HOUSE_DATA[1];
  const rashiLord = RASHI_LORDS[rashiIndex] ?? 'Unknown';

  // Where is the rashi lord placed?
  const lordRashiIndex = allPlanetRashiMap[rashiLord] ?? -1;
  const lordHouse = lordRashiIndex >= 0
    ? ((lordRashiIndex - ascendantRashiIndex + 12) % 12) + 1
    : 0;
  const lordDignity = lordRashiIndex >= 0 ? getDignity(rashiLord, lordRashiIndex) : 'neutral-sign';

  const lordHouseDesc = (HOUSE_LORD_IN_HOUSE[houseNumber]?.[lordHouse])
    ?? `${rashiLord} (lord of house ${houseNumber}) is placed in house ${lordHouse}.`;

  // Planets in this house
  const planetsInHouse = planets
    .filter(p => p.rashiIndex === rashiIndex && p.planet !== 'ASCENDANT')
    .map(p => p.planet);

  const planetEffects = planetsInHouse.map(pName => {
    const pd = PLANET_SIGNIFICATIONS[pName] ?? {};
    const keywords = (pd.keywords as string[] | undefined)?.slice(0, 3).join(', ') ?? '';
    const isRetro = planets.find(p => p.planet === pName)?.isRetrograde ?? false;
    return {
      planet: pName,
      isRetrograde: isRetro,
      effect: `${pName} brings ${keywords} into ${houseData.theme.toLowerCase()}${isRetro ? ' — but turned inward due to retrograde motion' : ''}.`,
    };
  });

  const combinationEffect = planetEffects.length >= 2
    ? planetCombinationEffect(planetsInHouse)
    : null;

  return {
    houseNumber,
    rashiIndex,
    rashiName,
    rashiEnglish,
    houseData,
    rashiLord,
    lordDignity,
    lordHouse,
    lordHouseDesc,
    planetsInHouse,
    planetEffects,
    combinationEffect,
    isAscendant: rashiIndex === ascendantRashiIndex,
    isEmpty: planetsInHouse.length === 0,
  };
}
