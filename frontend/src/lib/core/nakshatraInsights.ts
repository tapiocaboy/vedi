/**
 * Nakshatra insight content — turns a Moon nakshatra into a set of clickable,
 * plain-language items (personality, ruling planet, temperament, pada, deity,
 * symbol), each with a detailed explanation a non-astrologer can follow.
 */

import type { NakshatraInfo } from '../../types/astrology';
import type { TranslationKey } from '../../i18n/translations';

export interface NakshatraItem {
  key: 'overview' | 'lord' | 'gana' | 'pada' | 'deity' | 'symbol';
  /** i18n key for the tile label. */
  labelKey: TranslationKey;
  /** Short value shown on the collapsed tile. */
  value: string;
  /** Detailed explanation revealed on click. */
  body: string;
  /** Optional bullet predictions. */
  bullets?: string[];
}

interface Profile {
  personality: string;
  keynotes: string[];
  career: string;
  symbolMeaning: string;
}

// Indexed 0–26, aligned with NAKSHATRAS in nakshatra.ts.
const PROFILES: Profile[] = [
  { // 0 Ashwini
    personality: 'Quick, pioneering, and youthful. You start things with speed and enthusiasm, love to heal or rescue, and dislike being held back. A natural first-mover with a healing touch.',
    keynotes: ['Fast starts and fresh initiatives suit you', 'A gift for healing, first-aid, and reviving stalled things', 'Impatience and restlessness are the main lessons'],
    career: 'Medicine, healing, transport, sports, emergency work, anything pioneering.',
    symbolMeaning: "The horse's head signals speed, vitality, and the urge to move forward.",
  },
  { // 1 Bharani
    personality: 'Intense, creative, and determined. You carry strong desires and the discipline to bear burdens others cannot. Life moves through cycles of holding on and letting go.',
    keynotes: ['Great endurance and capacity to carry responsibility', 'Creative and fertile — bringing ideas to life', 'Learning restraint with desires and extremes'],
    career: 'Creative arts, law, healthcare, anything involving transformation or birth/death cycles.',
    symbolMeaning: 'The yoni (womb) signals creation, fertility, restraint, and powerful life-force.',
  },
  { // 2 Krittika
    personality: 'Sharp, fiery, and purifying. You cut through pretence, demand quality, and have a strong critical eye. A protector who burns away what is false.',
    keynotes: ['A sharp, discerning, no-nonsense mind', 'Drive for excellence and purity of standards', 'Watch a tendency to be cutting or impatient with others'],
    career: 'Engineering, cooking, military, surgery, criticism, leadership, fire-related fields.',
    symbolMeaning: 'The razor/flame represents cutting away impurity and the power to purify and protect.',
  },
  { // 3 Rohini
    personality: 'Charming, sensual, and creative. The Moon loves this star — you attract beauty, comfort, and material growth, with strong artistic and nurturing instincts.',
    keynotes: ['Natural charm, beauty, and magnetism', 'Steady material and emotional growth', 'Attachment to comfort and possessions is the lesson'],
    career: 'Arts, agriculture, luxury, fashion, food, finance, anything that grows or nurtures.',
    symbolMeaning: 'The chariot/ox-cart signals fertile growth, abundance, and the journey of material life.',
  },
  { // 4 Mrigashira
    personality: 'Curious, gentle, and searching. You are forever seeking — knowledge, the perfect thing, the next experience — with a soft, restless, inquisitive nature.',
    keynotes: ['A seeker — research, exploration, and curiosity drive you', 'Gentle, approachable, and adaptable', 'Restlessness and indecision are to be tamed'],
    career: 'Research, writing, travel, real estate, design, anything exploratory.',
    symbolMeaning: "The deer's head signals gentle searching, curiosity, and a sensitive, roaming mind.",
  },
  { // 5 Ardra
    personality: 'Stormy, sharp, and transformative. You feel deeply and think incisively; turbulence clears the way for renewal. Emotional intensity fuels real change.',
    keynotes: ['A penetrating, analytical, and original mind', 'Growth through emotional storms and breakthroughs', 'Managing turbulence and harsh moods is key'],
    career: 'Research, technology, psychology, crisis work, anything that breaks and rebuilds.',
    symbolMeaning: 'The teardrop signals the storm that clears the air — release, then fresh growth.',
  },
  { // 6 Punarvasu
    personality: 'Optimistic, wise, and resilient. You return, renew, and recover — bouncing back from setbacks with faith and generosity. A nurturing, philosophical spirit.',
    keynotes: ['Remarkable ability to recover and start again', 'Wisdom, generosity, and contentment', 'Avoiding complacency once comfortable'],
    career: 'Teaching, philosophy, hospitality, counselling, writing, spiritual work.',
    symbolMeaning: 'The bow and quiver signals the return of light and the power to begin anew.',
  },
  { // 7 Pushya
    personality: 'Caring, steady, and dutiful. The most nourishing of stars — you support, protect, and provide, with deep loyalty and spiritual grounding.',
    keynotes: ['Nourishing, dependable, and protective by nature', 'Strong sense of duty and service', 'Can become rigid or over-controlling when caring'],
    career: 'Caregiving, public service, food, teaching, religion, government.',
    symbolMeaning: 'The flower/udder signals nourishment, blossoming, and the giving of sustenance.',
  },
  { // 8 Ashlesha
    personality: 'Magnetic, intuitive, and penetrating. You read people effortlessly and wield subtle influence. Deep insight comes with the need to use power wisely.',
    keynotes: ['Hypnotic insight into people and hidden motives', 'Powerful intuition and persuasion', 'Channelling intensity without manipulation is the lesson'],
    career: 'Psychology, healing, research, politics, occult, anything requiring deep insight.',
    symbolMeaning: 'The coiled serpent signals kundalini wisdom, mesmerising power, and hidden knowledge.',
  },
  { // 9 Magha
    personality: 'Regal, proud, and traditional. You honour roots, ancestors, and legacy, and carry a natural sense of authority and dignity.',
    keynotes: ['Natural leadership, dignity, and respect for tradition', 'Strong link to ancestry and heritage', 'Pride and entitlement are to be watched'],
    career: 'Leadership, government, history, ceremony, family business, public honour.',
    symbolMeaning: 'The royal throne signals power, lineage, and the honour passed down from ancestors.',
  },
  { // 10 Purva Phalguni
    personality: 'Warm, creative, and pleasure-loving. You bring charm, romance, and enjoyment to life, with a generous and playful heart.',
    keynotes: ['Charm, creativity, and a love of pleasure', 'Generosity and social warmth', 'Balancing rest and indulgence with effort'],
    career: 'Arts, entertainment, hospitality, luxury, design, relationships.',
    symbolMeaning: 'The front legs of the bed signal rest, pleasure, romance, and creative enjoyment.',
  },
  { // 11 Uttara Phalguni
    personality: 'Generous, reliable, and kind. You help through steady commitment and genuine friendship, balancing ambition with service.',
    keynotes: ['Dependable, generous, and a true friend', 'Success through patient, ethical effort', 'Learning to receive, not only give'],
    career: 'Service, philanthropy, contracts, management, healing, partnerships.',
    symbolMeaning: 'The back legs of the bed signal stability, rest after effort, and supportive partnership.',
  },
  { // 12 Hasta
    personality: 'Skilful, clever, and resourceful. Whatever you set your hands to, you master — practical, witty, and quick, with a knack for craft and detail.',
    keynotes: ['Skilled hands and a clever, resourceful mind', 'Wit, dexterity, and practical problem-solving', 'Channelling restlessness into finished work'],
    career: 'Crafts, healing, trade, writing, astrology, fine handiwork, comedy.',
    symbolMeaning: 'The hand signals skill, craftsmanship, and the power to grasp and shape reality.',
  },
  { // 13 Chitra
    personality: 'Brilliant, artistic, and magnetic. You create beauty and shine in any setting, with a strong eye for form, design, and self-expression.',
    keynotes: ['Striking creativity and an eye for beauty', 'Charisma and a flair for design', 'Vanity and surface-focus are the lessons'],
    career: 'Architecture, design, fashion, art, engineering, gemmology, media.',
    symbolMeaning: 'The bright jewel/pearl signals brilliance, artistry, and beauty crafted to perfection.',
  },
  { // 14 Swati
    personality: 'Independent, adaptable, and graceful. Like a young shoot in the wind, you bend without breaking, valuing freedom, balance, and self-reliance.',
    keynotes: ['Independence and the ability to adapt and thrive alone', 'Diplomacy, balance, and fair dealing', 'Learning interdependence, not just self-sufficiency'],
    career: 'Business, trade, law, diplomacy, travel, independent ventures.',
    symbolMeaning: 'The young shoot blowing in the wind signals flexibility, independence, and self-movement.',
  },
  { // 15 Vishakha
    personality: 'Ambitious, focused, and goal-driven. You pursue aims with single-minded determination and rise through persistence toward a clear purpose.',
    keynotes: ['Powerful determination and goal focus', 'Achievement through persistent effort', 'Patience with the journey, not only the prize'],
    career: 'Leadership, research, politics, sales, any goal-driven field.',
    symbolMeaning: 'The triumphal arch signals achievement, focused purpose, and the threshold of success.',
  },
  { // 16 Anuradha
    personality: 'Devoted, cooperative, and warm. You build deep friendships and thrive through teamwork, loyalty, and a balance of discipline and love.',
    keynotes: ['Gift for friendship, loyalty, and cooperation', 'Success through people and devotion', 'Navigating ups and downs without losing heart'],
    career: 'Teamwork, organisations, counselling, spirituality, foreign relations.',
    symbolMeaning: 'The lotus signals devotion blossoming through difficulty, and friendship across boundaries.',
  },
  { // 17 Jyeshtha
    personality: 'Senior, protective, and capable. You carry responsibility and authority, defending others and bearing heavy loads with quiet strength.',
    keynotes: ['Natural seniority, courage, and protectiveness', 'Capability under pressure and responsibility', 'Avoiding isolation, pride, or feeling unappreciated'],
    career: 'Management, military, protection, research, occult, problem-solving.',
    symbolMeaning: 'The circular amulet/earring signals protection, seniority, and hard-won authority.',
  },
  { // 18 Mula
    personality: 'Investigative, intense, and uprooting. You dig to the root of things, dismantling illusions to reach truth. Deep transformation runs through life.',
    keynotes: ['A truth-seeker who gets to the bottom of things', 'Power to dismantle and rebuild from the roots', 'Riding cycles of loss and renewal is the path'],
    career: 'Research, investigation, medicine, philosophy, spirituality, root-cause work.',
    symbolMeaning: 'The tied bunch of roots signals getting to the foundation — uprooting to find truth.',
  },
  { // 19 Purva Ashadha
    personality: 'Invincible, persuasive, and proud. You hold conviction and the power to inspire, refusing defeat and carrying others on a tide of optimism.',
    keynotes: ['Unshakeable conviction and persuasive power', 'Optimism that lifts and energises others', 'Tempering pride and stubbornness'],
    career: 'Debate, law, politics, water/shipping, philosophy, public speaking.',
    symbolMeaning: 'The fan/winnowing basket signals invincibility, purification, and rising optimism.',
  },
  { // 20 Uttara Ashadha
    personality: 'Principled, persevering, and dignified. You win lasting victories through integrity and patience, earning respect that endures.',
    keynotes: ['Lasting success built on integrity', 'Perseverance and natural leadership', 'Balancing high standards with flexibility'],
    career: 'Leadership, law, government, social causes, pioneering ventures.',
    symbolMeaning: 'The elephant tusk/planks signal permanence, lasting victory, and unshakeable foundations.',
  },
  { // 21 Shravana
    personality: 'Attentive, learned, and connecting. You listen deeply and gather knowledge, linking people and ideas through wisdom and good counsel.',
    keynotes: ['A gifted listener and learner', 'Wisdom shared through teaching and counsel', 'Acting on knowledge, not only collecting it'],
    career: 'Teaching, media, counselling, languages, music, advisory roles.',
    symbolMeaning: 'The ear/three footprints signal listening, learning, and connecting across the world.',
  },
  { // 22 Dhanishta
    personality: 'Rhythmic, prosperous, and capable. You carry natural wealth, musicality, and group leadership, thriving where rhythm and resources meet.',
    keynotes: ['A gift for prosperity, rhythm, and performance', 'Leadership within groups and teams', 'Softening ambition with warmth'],
    career: 'Music, real estate, finance, management, performance, engineering.',
    symbolMeaning: 'The drum signals rhythm, fame, abundance, and the power to set the beat for others.',
  },
  { // 23 Shatabhisha
    personality: 'Independent, mystical, and healing. You are private and unconventional, drawn to hidden truths, healing, and seeing what others miss.',
    keynotes: ['Healer and seeker of hidden, scientific, or mystical truth', 'Strong independence and originality', 'Opening up rather than isolating'],
    career: 'Medicine, healing, astrology, technology, research, aviation.',
    symbolMeaning: 'The empty circle / hundred stars signals the cosmic veil, healing, and hidden wholeness.',
  },
  { // 24 Purva Bhadrapada
    personality: 'Intense, idealistic, and fiery. You hold a dual nature — worldly and spiritual — with passion for transformation and a fearless, unconventional edge.',
    keynotes: ['Passionate idealism and transformative drive', 'Courage to stand apart for a higher purpose', 'Balancing extremes and intensity'],
    career: 'Research, occult, finance, priesthood, radical or reform work.',
    symbolMeaning: 'The funeral cot / two-faced man signals death-and-rebirth and the meeting of two worlds.',
  },
  { // 25 Uttara Bhadrapada
    personality: 'Wise, calm, and deep. You carry quiet spiritual depth, patience, and compassion, offering steady support drawn from inner stillness.',
    keynotes: ['Deep calm, wisdom, and compassion', 'Strength that supports others quietly', 'Engaging the world rather than withdrawing'],
    career: 'Counselling, charity, writing, spirituality, research, healing.',
    symbolMeaning: 'The serpent of the deep / back of the cot signals stillness, depth, and serene wisdom.',
  },
  { // 26 Revati
    personality: 'Gentle, nourishing, and protective. You guide and shelter others, with a kind, dreamy, and spiritually-attuned nature that loves to see safe arrivals.',
    keynotes: ['Compassionate, nurturing, and protective', 'A guiding, safe presence for others', 'Guarding against over-giving and being taken for granted'],
    career: 'Caregiving, travel, hospitality, art, spirituality, animal welfare.',
    symbolMeaning: 'The fish in the sea signals safe passage, nourishment, and guidance to the journey’s end.',
  },
];

// Ruling planet → emotional/mind theme + first-dasha note.
const LORD_THEME: Record<string, string> = {
  Ketu: 'Ketu rules your mind, seeding intuition, detachment, and a spiritual undercurrent. Your very first life-period (Mahadasha) is Ketu — so early life often centres on letting go, inner searching, and learning not to cling.',
  Venus: 'Venus rules your mind, colouring it with love, beauty, comfort, and a longing for harmony. Your first Mahadasha is Venus — early life leans toward relationships, art, pleasures, and material ease.',
  Sun: 'The Sun rules your mind, giving it pride, purpose, and a need for recognition and selfhood. Your first Mahadasha is the Sun — early life revolves around identity, authority, and the father.',
  Moon: 'The Moon rules your mind (its own significator), making feeling, care, and connection central. Your first Mahadasha is the Moon — early life is steeped in emotion, the mother, and nurturing.',
  Mars: 'Mars rules your mind, charging it with drive, courage, and a competitive edge. Your first Mahadasha is Mars — early life brings energy, assertiveness, and a push to act.',
  Rahu: 'Rahu rules your mind, pulling it toward ambition, the unconventional, and worldly hunger. Your first Mahadasha is Rahu — early life is restless, boundary-pushing, and hungry for experience.',
  Jupiter: 'Jupiter rules your mind, blessing it with wisdom, faith, and an urge to grow and understand. Your first Mahadasha is Jupiter — early life favours learning, guidance, and expansion.',
  Saturn: 'Saturn rules your mind, giving it patience, depth, and a serious, responsible cast. Your first Mahadasha is Saturn — early life teaches discipline, endurance, and delayed reward.',
  Mercury: 'Mercury rules your mind, making it quick, curious, communicative, and adaptable. Your first Mahadasha is Mercury — early life sharpens intellect, speech, and learning.',
};

const GANA_MEANING: Record<string, string> = {
  Deva: 'A Deva (divine) temperament — gentle, refined, idealistic, and oriented toward harmony, generosity, and higher values. You generally get along most easily with other Deva and Manushya natures.',
  Manushya: 'A Manushya (human) temperament — balanced and practical, blending material ambition with real sensitivity. You navigate both the worldly and the emotional with even footing.',
  Rakshasa: 'A Rakshasa (intense) temperament — strong-willed, self-reliant, and penetrating, with formidable focus and drive. Your strength is conviction; the lesson is flexibility and patience with others.',
};

const PADA_MEANING: Record<number, string> = {
  1: 'Pada 1 falls in a fiery Navamsa quarter — it adds drive, initiative, and a dharmic, identity-focused flavour to your star’s qualities. You express the nakshatra boldly and personally.',
  2: 'Pada 2 falls in an earthy Navamsa quarter — it adds practicality, resourcefulness, and a material focus. You express the nakshatra in grounded, results-oriented ways.',
  3: 'Pada 3 falls in an airy Navamsa quarter — it adds intellect, sociability, and communication. You express the nakshatra through ideas, connection, and exchange.',
  4: 'Pada 4 falls in a watery Navamsa quarter — it adds emotion, depth, and reflection. You express the nakshatra inwardly, intuitively, and with feeling.',
};

const DEITY_THEME: Record<string, string> = {
  'Ashwini Kumaras': 'the twin celestial physicians — divine healers who bring speed, rescue, and miraculous recovery.',
  Yama: 'the lord of dharma and death — bringing discipline, justice, restraint, and the courage to face limits.',
  Agni: 'the god of fire — purifying, energising, and carrying offerings between worlds; a force that burns away impurity.',
  Brahma: 'the creator — bringing fertility, growth, and the power to bring new things into being.',
  Soma: 'the moon-nectar deity — bringing nourishment, bliss, and the sweetness of life and the mind.',
  Rudra: 'the storm and fierce healer — bringing transformation through upheaval and the clearing power of intensity.',
  Aditi: 'the boundless mother of the gods — bringing renewal, abundance, freedom, and the power to begin again.',
  Brihaspati: 'the guru of the gods — bringing wisdom, faith, good counsel, and benevolent guidance.',
  Nagas: 'the wise serpents — bringing hidden knowledge, intuition, and mesmerising, kundalini power.',
  Pitris: 'the ancestors — bringing lineage, legacy, blessings from the past, and the honour of roots.',
  Bhaga: 'the god of fortune and delight — bringing prosperity, pleasure, marriage, and shared enjoyment.',
  Aryaman: 'the god of contracts and friendship — bringing nobility, generosity, and honourable bonds.',
  Savitar: 'the solar inspirer — bringing skill, vitality, and the creative power that sets life in motion.',
  Vishwakarma: 'the divine architect — bringing craftsmanship, design, and the power to build beauty.',
  Vayu: 'the wind god — bringing movement, independence, breath, and the freedom to roam.',
  'Indra-Agni': 'the combined powers of Indra and Agni — bringing focused force, achievement, and triumphant energy.',
  Mitra: 'the god of friendship and compassion — bringing devotion, cooperation, and warmth across boundaries.',
  Indra: 'the king of the gods — bringing courage, leadership, protection, and victory over obstacles.',
  Nirriti: 'the goddess of dissolution — bringing the power to uproot, transform, and rebuild from the depths.',
  Apas: 'the water deities — bringing purification, vitality, invincibility, and life-giving flow.',
  Vishvadevas: 'the universal gods — bringing integrity, perseverance, and victory earned through righteousness.',
  Vishnu: 'the preserver — bringing protection, listening wisdom, and the power that pervades and sustains all.',
  Vasus: 'the eight gods of abundance — bringing wealth, rhythm, prosperity, and mastery of resources.',
  Varuna: 'the god of cosmic waters and order — bringing healing, mystery, and the power to see hidden truth.',
  'Aja Ekapada': 'the one-footed goat / fiery pillar — bringing spiritual fire, transformation, and dual-natured intensity.',
  'Ahir Budhnya': 'the serpent of the deep — bringing stillness, depth, wisdom, and serene spiritual power.',
  Pushan: 'the nourishing shepherd — bringing safe journeys, guidance, protection, and care for all beings.',
};

export function getNakshatraItems(nak: NakshatraInfo): NakshatraItem[] {
  const profile = PROFILES[nak.index] ?? PROFILES[0];
  const items: NakshatraItem[] = [];

  items.push({
    key: 'overview',
    labelKey: 'nakshatra.personality',
    value: nak.name,
    body: `${profile.personality} Best-suited paths: ${profile.career}`,
    bullets: profile.keynotes,
  });

  items.push({
    key: 'lord',
    labelKey: 'nakshatra.rulingPlanet',
    value: nak.lord,
    body: LORD_THEME[nak.lord] ?? `${nak.lord} rules this nakshatra and shapes the tone of your mind and your first life-period.`,
  });

  if (nak.gana) {
    items.push({
      key: 'gana',
      labelKey: 'nakshatra.nature',
      value: nak.gana,
      body: GANA_MEANING[nak.gana] ?? `${nak.gana} describes your basic temperament.`,
    });
  }

  items.push({
    key: 'pada',
    labelKey: 'nakshatra.padaTitle',
    value: `${nak.pada} / 4`,
    body: PADA_MEANING[nak.pada] ?? 'The pada (quarter) fine-tunes the nakshatra through the Navamsa.',
  });

  if (nak.deity) {
    items.push({
      key: 'deity',
      labelKey: 'nakshatra.deity',
      value: nak.deity,
      body: `Your nakshatra is presided over by ${nak.deity} — ${DEITY_THEME[nak.deity] ?? 'a guiding cosmic power.'} Its qualities flow into your inner nature and the blessings you can draw on.`,
    });
  }

  if (nak.symbol) {
    items.push({
      key: 'symbol',
      labelKey: 'nakshatra.symbol',
      value: nak.symbol,
      body: profile.symbolMeaning,
    });
  }

  return items;
}
