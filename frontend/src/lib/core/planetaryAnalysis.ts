/**
 * Per-planet natal chart analysis — house placement, dignity, retrograde effects
 */

import { PLANET_SIGNIFICATIONS, PLANETARY_RELATIONSHIPS } from './predictions';
import { type Lang, pick, pickList } from './i18n';
import {
  DIGNITY_LABEL, DIGNITY_DESC, FUNCTIONAL_LABEL, VERDICT_LABEL,
  DIG_BALA_FRAMES, FUNCTIONAL_DESC, COMBUSTION_FRAMES, NB_FRAMES,
  strengthSummary, FACTOR_LABEL, ordHouse,
} from './text/planetaryText';
import { PLANET_IN_HOUSE_TEXT, RETROGRADE_TEXT } from './text/planetHouseText';

// ─── House themes ──────────────────────────────────────────────────────────

export const HOUSE_DATA: Record<number, {
  name: string; sanskrit: string;
  theme: string; keywords: string[];
  bodyPart: string; rules: string[];
}> = {
  1:  { name:'1st House', sanskrit:'Lagna',     theme:'Self & Vitality',       keywords:['personality','health','body','appearance','vitality','character'],           bodyPart:'Head & brain',         rules:['self','personality','physical health','constitution','life path'] },
  2:  { name:'2nd House', sanskrit:'Dhana',     theme:'Wealth & Speech',       keywords:['finances','family','speech','food','accumulated wealth','face'],              bodyPart:'Face, throat & eyes', rules:['wealth','family','speech','savings','values','early education'] },
  3:  { name:'3rd House', sanskrit:'Sahaja',    theme:'Courage & Communication',keywords:['siblings','communication','short journeys','courage','skills','neighbors'],  bodyPart:'Arms, shoulders & hands',rules:['courage','siblings','communication','writing','media','short travels'] },
  4:  { name:'4th House', sanskrit:'Sukha',     theme:'Home & Happiness',      keywords:['home','mother','property','vehicles','education','emotional peace'],          bodyPart:'Chest & heart',        rules:['home','mother','real estate','vehicles','inner peace','education'] },
  5:  { name:'5th House', sanskrit:'Putra',     theme:'Intelligence & Creativity',keywords:['children','intellect','creativity','romance','speculation','past merit'],   bodyPart:'Stomach & solar plexus',rules:['children','creativity','intelligence','romance','investments','spiritual merit'] },
  6:  { name:'6th House', sanskrit:'Ripu',      theme:'Obstacles & Service',   keywords:['enemies','debts','illness','competition','service','legal battles'],          bodyPart:'Digestive system',     rules:['enemies','debt','disease','service','employees','competition'] },
  7:  { name:'7th House', sanskrit:'Yuvati',    theme:'Partnerships',          keywords:['marriage','spouse','business partners','public','contracts','open enemies'],   bodyPart:'Lower abdomen & kidneys',rules:['marriage','partnerships','business','public dealings','legal contracts'] },
  8:  { name:'8th House', sanskrit:'Randhra',   theme:'Transformation',        keywords:['longevity','inheritance','occult','transformation','hidden matters','crisis'], bodyPart:'Reproductive & excretory',rules:['longevity','inheritance','occult','sudden events','research','joint finances'] },
  9:  { name:'9th House', sanskrit:'Dharma',    theme:'Fortune & Philosophy',  keywords:['luck','father','religion','higher learning','long travels','philosophy'],     bodyPart:'Thighs & liver',       rules:['fortune','father','religion','philosophy','higher education','long journeys'] },
  10: { name:'10th House',sanskrit:'Karma',     theme:'Career & Status',       keywords:['career','authority','government','reputation','ambition','profession'],       bodyPart:'Knees & skeletal structure',rules:['career','profession','government','public status','authority','ambitions'] },
  11: { name:'11th House',sanskrit:'Labha',     theme:'Gains & Social Circle', keywords:['income','gains','elder siblings','social circle','desires','networking'],     bodyPart:'Calves & ankles',      rules:['income','gains','social networks','elder siblings','hopes','desires'] },
  12: { name:'12th House',sanskrit:'Vyaya',     theme:'Spirituality & Losses', keywords:['expenses','foreign lands','isolation','spirituality','liberation','hospitals'],bodyPart:'Feet & lymphatic system',rules:['expenses','losses','foreign settlement','spirituality','liberation','seclusion'] },
};

// ─── Dignity data ──────────────────────────────────────────────────────────

// rashiIndex: 0=Mesha, 1=Vrishabha, 2=Mithuna, 3=Karka, 4=Simha, 5=Kanya,
//             6=Tula, 7=Vrischika, 8=Dhanu, 9=Makara, 10=Kumbha, 11=Meena

export const DIGNITY: Record<string, {
  exalted: number; debilitated: number; ownSigns: number[];
}> = {
  Sun:     { exalted:0,  debilitated:6,  ownSigns:[4]       },
  Moon:    { exalted:1,  debilitated:7,  ownSigns:[3]       },
  Mars:    { exalted:9,  debilitated:3,  ownSigns:[0,7]     },
  Mercury: { exalted:5,  debilitated:11, ownSigns:[2,5]     },
  Jupiter: { exalted:3,  debilitated:9,  ownSigns:[8,11]    },
  Venus:   { exalted:11, debilitated:5,  ownSigns:[1,6]     },
  Saturn:  { exalted:6,  debilitated:0,  ownSigns:[9,10]    },
  Rahu:    { exalted:1,  debilitated:7,  ownSigns:[]        },
  Ketu:    { exalted:7,  debilitated:1,  ownSigns:[]        },
};

export const RASHI_LORDS: Record<number, string> = {
  0:'Mars', 1:'Venus', 2:'Mercury', 3:'Moon', 4:'Sun',   5:'Mercury',
  6:'Venus',7:'Mars',  8:'Jupiter', 9:'Saturn',10:'Saturn',11:'Jupiter',
};

export type DignityLevel = 'exalted' | 'own-sign' | 'friend-sign' | 'neutral-sign' | 'enemy-sign' | 'debilitated';

export function getDignity(planet: string, rashiIndex: number): DignityLevel {
  if (planet === 'ASCENDANT') return 'neutral-sign';
  const d = DIGNITY[planet];
  if (!d) return 'neutral-sign';
  if (d.exalted === rashiIndex) return 'exalted';
  if (d.debilitated === rashiIndex) return 'debilitated';
  if (d.ownSigns.includes(rashiIndex)) return 'own-sign';
  const rashiLord = RASHI_LORDS[rashiIndex];
  const rel = PLANETARY_RELATIONSHIPS[planet];
  if (!rel) return 'neutral-sign';
  if (rel.friends?.includes(rashiLord)) return 'friend-sign';
  if (rel.enemies?.includes(rashiLord)) return 'enemy-sign';
  return 'neutral-sign';
}

const DIGNITY_LABELS: Record<DignityLevel, { label: string; strength: number; color: string; desc: string }> = {
  'exalted':      { label:'Exalted',       strength:10, color:'text-emerald-400', desc:'At maximum strength — planet performs at its highest potential, delivering exceptional results in all areas it governs.' },
  'own-sign':     { label:'Own Sign',      strength:8,  color:'text-violet-400',  desc:'In its home sign — planet is comfortable, stable, and performs consistently well throughout life.' },
  'friend-sign':  { label:'Friendly Sign', strength:7,  color:'text-blue-400',    desc:'In a friendly environment — planet operates with ease and delivers generally positive results.' },
  'neutral-sign': { label:'Neutral Sign',  strength:5,  color:'text-white/60',    desc:'In neutral territory — planet delivers average results; outcomes depend heavily on other chart factors.' },
  'enemy-sign':   { label:'Enemy Sign',    strength:3,  color:'text-amber-400',   desc:'In unfriendly environment — planet struggles to express its qualities fully; results are mixed or delayed.' },
  'debilitated':  { label:'Debilitated',   strength:1,  color:'text-rose-400',    desc:'At minimum strength — planet has difficulty expressing its qualities; requires conscious remedial effort.' },
};

// ─── Moolatrikona, Dig Bala, Functional nature, Combined strength ───────────
//
// These add the classical strength factors that sign-dignity alone misses, so
// the verdict reflects Sthana (positional), Dig (directional), functional
// (lordship-from-Lagna) and Cheshta (motional/retrograde) balas together —
// rather than dignity in isolation.

// Moolatrikona: sign + the degree range (within the sign) where the planet sits
// in its root-trine. Stronger than own-sign, just below exaltation. Requires the
// planet's degree-in-sign; when that is unknown the bonus simply does not apply.
const MOOLATRIKONA: Record<string, { sign: number; from: number; to: number }> = {
  Sun:     { sign: 4,  from: 0,  to: 20 },  // Leo 0°–20°
  Mars:    { sign: 0,  from: 0,  to: 12 },  // Aries 0°–12°
  Mercury: { sign: 5,  from: 16, to: 20 },  // Virgo 16°–20°
  Jupiter: { sign: 8,  from: 0,  to: 10 },  // Sagittarius 0°–10°
  Venus:   { sign: 6,  from: 0,  to: 15 },  // Libra 0°–15°
  Saturn:  { sign: 10, from: 0,  to: 20 },  // Aquarius 0°–20°
  // Moon's Moolatrikona (Taurus) coincides with its exaltation sign, which takes
  // precedence at sign level, so it is intentionally omitted here.
};

export function inMoolatrikona(planet: string, rashiIndex: number, degreeInSign: number, dignity: DignityLevel): boolean {
  if (dignity === 'exalted') return false; // exaltation already outranks Moolatrikona
  const m = MOOLATRIKONA[planet];
  return !!m && m.sign === rashiIndex && degreeInSign >= m.from && degreeInSign < m.to;
}

// Dig Bala: a planet is at full directional strength in one specific house and
// zero in the opposite house, scaling linearly in between. Shadow planets
// (Rahu/Ketu) are not assigned Dig Bala classically.
const DIG_BALA_STRONG: Record<string, number> = {
  Sun: 10, Moon: 4, Mars: 10, Mercury: 1, Jupiter: 1, Venus: 4, Saturn: 7,
};

export interface DigBalaInfo {
  score: number;                                   // 0..1
  level: 'strong' | 'moderate' | 'weak' | 'na';
  strongHouse: number | null;
  desc: string;
}

export function getDigBala(planet: string, house: number, lang: Lang = 'en'): DigBalaInfo {
  const strong = DIG_BALA_STRONG[planet];
  if (!strong) {
    return { score: 0.5, level: 'na', strongHouse: null, desc: pick(DIG_BALA_FRAMES.na, lang) };
  }
  const weak = ((strong - 1 + 6) % 12) + 1;        // house opposite the strong one
  let dist = Math.abs(house - weak);
  dist = Math.min(dist, 12 - dist);                // 0 (at weak) .. 6 (at strong)
  const score = dist / 6;
  const level = score >= 0.66 ? 'strong' : score >= 0.34 ? 'moderate' : 'weak';
  return { score, level, strongHouse: strong, desc: DIG_BALA_FRAMES.desc(strong, house, level, lang) };
}

// Functional (lordship-based) nature — judged from the Ascendant, the single
// biggest factor in whether a planet behaves as a benefic or a malefic.
export type FunctionalNature = 'yogakaraka' | 'benefic' | 'neutral' | 'mixed' | 'malefic' | 'maraka';

const FUNCTIONAL_SCORE: Record<FunctionalNature, number> = {
  'yogakaraka': 1.0, 'benefic': 0.78, 'neutral': 0.5, 'mixed': 0.45, 'malefic': 0.22, 'maraka': 0.3,
};

export interface FunctionalInfo {
  nature: FunctionalNature;
  label: string;
  rulesHouses: number[];
  isYogakaraka: boolean;
  score: number;        // 0..1 benefic weighting
  desc: string;
}

function housesRuledFrom(planet: string, ascIndex: number): number[] {
  const d = DIGNITY[planet];
  if (!d || d.ownSigns.length === 0) return [];   // shadow planets own no sign
  return d.ownSigns.map(sign => ((sign - ascIndex + 12) % 12) + 1).sort((a, b) => a - b);
}

export function getFunctionalNature(planet: string, ascIndex: number, lang: Lang = 'en'): FunctionalInfo {
  const rules = housesRuledFrom(planet, ascIndex);
  if (rules.length === 0) {
    return { nature: 'neutral', label: pick(FUNCTIONAL_LABEL.neutral, lang), rulesHouses: [], isYogakaraka: false, score: 0.5,
      desc: FUNCTIONAL_DESC.shadow('', false, lang) };
  }
  const has = (...hs: number[]) => hs.some(h => rules.includes(h));
  const trikona  = has(5, 9);
  const kendra   = has(4, 7, 10);
  const dusthana = has(6, 8, 12);
  const maraka   = has(2, 7);
  const lagna    = rules.includes(1);
  const isYogakaraka = trikona && kendra;

  let nature: FunctionalNature;
  if (isYogakaraka)             nature = 'yogakaraka';
  else if (trikona && dusthana) nature = 'mixed';
  else if (lagna || trikona)    nature = 'benefic';
  else if (dusthana)            nature = 'malefic';
  else if (maraka)              nature = 'maraka';
  else                          nature = 'neutral';

  const hs = rules.map(h => ordHouse(h, lang)).join(lang === 'si' ? ' හා ' : ' & ');
  const desc = FUNCTIONAL_DESC[nature](hs, rules.length > 1, lang);
  return { nature, label: pick(FUNCTIONAL_LABEL[nature], lang), rulesHouses: rules, isYogakaraka, score: FUNCTIONAL_SCORE[nature], desc };
}

// Combined assessment — a lightweight Shadbala that folds the factors into one
// 0–100 score and a plain-language verdict.
export type StrengthVerdict = 'very-strong' | 'strong' | 'moderate' | 'weak' | 'very-weak';

const CHESHTA_PLANETS = new Set(['Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn']);

export interface StrengthFactor { label: string; value: number; }   // value 0..1
export interface StrengthAssessment {
  score: number;            // 0..100
  verdict: StrengthVerdict;
  verdictLabel: string;
  summary: string;
  factors: StrengthFactor[];
}

export function assessStrength(args: {
  planet: string;
  dignity: DignityLevel;
  moolatrikona: boolean;
  dig: DigBalaInfo;
  functional: FunctionalInfo;
  isRetrograde: boolean;
  combust?: boolean;
  neechaBhanga?: boolean;
  lang?: Lang;
}): StrengthAssessment {
  const { planet, dignity, moolatrikona, dig, functional, isRetrograde, combust = false, neechaBhanga = false, lang = 'en' } = args;

  let sthana = DIGNITY_LABELS[dignity].strength / 10;          // 0.1 .. 1.0
  if (moolatrikona) sthana = Math.min(1, sthana + 0.1);
  if (neechaBhanga) sthana = Math.max(sthana, 0.85);          // cancellation lifts debilitation to Raja-Yoga grade
  const cheshta = (isRetrograde && CHESHTA_PLANETS.has(planet)) ? 1 : 0;

  let score = Math.round(
    5 +                       // base
    sthana * 40 +             // positional (sign dignity + Moolatrikona / Neecha Bhanga)
    dig.score * 20 +          // directional
    functional.score * 25 +   // functional (lordship from Lagna)
    cheshta * 10,             // motional (retrograde Cheshta Bala)
  );
  if (combust) score = Math.max(8, score - 14);               // burnt significations

  const verdict: StrengthVerdict =
    score >= 75 ? 'very-strong' :
    score >= 60 ? 'strong' :
    score >= 45 ? 'moderate' :
    score >= 30 ? 'weak' : 'very-weak';

  const verdictLabel = pick(VERDICT_LABEL[verdict], lang);
  const summary = strengthSummary({
    verdictLabel,
    dignityLabel: pick(DIGNITY_LABEL[dignity], lang),
    moolatrikona, neechaBhanga,
    digLevel: dig.level,
    cheshta: cheshta === 1,
    combust,
    functionalLabel: functional.label,
    functionalScore: functional.score,
    lang,
  });

  const factors: StrengthFactor[] = [
    { label: pick(FACTOR_LABEL.signDignity, lang), value: sthana },
    { label: pick(FACTOR_LABEL.direction, lang),   value: dig.level === 'na' ? 0.5 : dig.score },
    { label: pick(FACTOR_LABEL.function, lang),    value: functional.score },
  ];
  if (cheshta) factors.push({ label: pick(FACTOR_LABEL.motion, lang), value: 1 });

  return { score, verdict, verdictLabel, summary, factors };
}

// Combustion (Astangata) — a planet too close to the Sun is "burnt", weakening
// its outward significations. Orbs are tighter for retrograde Mercury/Venus.
const COMBUSTION_ORB: Record<string, number> = {
  Moon: 12, Mars: 17, Mercury: 14, Jupiter: 11, Venus: 10, Saturn: 15,
};
const COMBUSTION_ORB_RETRO: Record<string, number> = { Mercury: 12, Venus: 8 };

export interface CombustionInfo {
  isCombust: boolean;
  separation: number;   // degrees from the Sun
  limit: number;
  desc: string;
}

export function getCombustion(planet: string, planetLongitude: number, sunLongitude: number, isRetrograde: boolean, lang: Lang = 'en'): CombustionInfo | null {
  const base = COMBUSTION_ORB[planet];
  if (base === undefined) return null;             // Sun, Rahu, Ketu — never combust
  let sep = Math.abs(planetLongitude - sunLongitude) % 360;
  if (sep > 180) sep = 360 - sep;
  const limit = (isRetrograde && COMBUSTION_ORB_RETRO[planet]) ? COMBUSTION_ORB_RETRO[planet] : base;
  const isCombust = sep <= limit;
  return {
    isCombust, separation: sep, limit,
    desc: isCombust
      ? COMBUSTION_FRAMES.combust(sep.toFixed(1), limit, lang)
      : COMBUSTION_FRAMES.clear(sep.toFixed(1), limit, lang),
  };
}

// Neecha Bhanga — cancellation of debilitation. When a debilitated planet meets
// any of the classical conditions, its weakness is lifted (and often becomes a
// Raja Yoga: a rise after early struggle).
const isKendra = (sign: number, from: number) => [0, 3, 6, 9].includes(((sign - from + 12) % 12));

export interface NeechaBhangaInfo {
  applies: boolean;     // the planet is debilitated
  cancelled: boolean;
  statusLabel: string;
  reasons: string[];
  desc: string;
}

export function getNeechaBhanga(args: {
  planet: string;
  rashiIndex: number;                      // = the debilitation sign when debilitated
  ascIndex: number;
  isRetrograde: boolean;
  signByPlanet: Record<string, number>;    // planet -> rashiIndex for all grahas
  lang?: Lang;
}): NeechaBhangaInfo {
  const { planet, rashiIndex, ascIndex, isRetrograde, signByPlanet, lang = 'en' } = args;
  if (getDignity(planet, rashiIndex) !== 'debilitated') {
    return { applies: false, cancelled: false, statusLabel: '', reasons: [], desc: '' };
  }

  const debilSign = rashiIndex;
  const moonSign = signByPlanet['Moon'];
  const dispositor = RASHI_LORDS[debilSign];                         // lord of the debilitation sign
  const exaltedHere = Object.keys(DIGNITY).find(p => DIGNITY[p].exalted === debilSign); // planet exalted in this sign
  const reasons: string[] = [];

  const inKendraFromLagnaOrMoon = (sign: number | undefined) =>
    sign !== undefined && (isKendra(sign, ascIndex) || (moonSign !== undefined && isKendra(sign, moonSign)));

  // 1. Lord of the debilitation sign sits in a kendra from Lagna or Moon.
  if (inKendraFromLagnaOrMoon(signByPlanet[dispositor])) {
    reasons.push(NB_FRAMES.reasonDispositorKendra(dispositor, lang));
  }
  // 2. The planet exalted in this sign sits in a kendra from Lagna or Moon.
  if (exaltedHere && inKendraFromLagnaOrMoon(signByPlanet[exaltedHere])) {
    reasons.push(NB_FRAMES.reasonExaltedKendra(exaltedHere, lang));
  }
  // 3. The dispositor is itself exalted or in its own sign.
  const dispSign = signByPlanet[dispositor];
  if (dispSign !== undefined) {
    const dd = getDignity(dispositor, dispSign);
    if (dd === 'exalted' || dd === 'own-sign') {
      reasons.push(NB_FRAMES.reasonDispositorStrong(dispositor, dd === 'exalted', lang));
    }
  }
  // 4. The debilitated planet is conjunct or directly aspected (7th) by its dispositor.
  if (dispSign !== undefined && (dispSign === debilSign || ((dispSign - debilSign + 12) % 12) === 6)) {
    reasons.push(NB_FRAMES.reasonDispositorAspect(dispositor, dispSign === debilSign, lang));
  }
  // 5. The debilitated planet is retrograde.
  if (isRetrograde) {
    reasons.push(NB_FRAMES.reasonRetrograde(lang));
  }

  const cancelled = reasons.length > 0;
  return {
    applies: true,
    cancelled,
    statusLabel: cancelled
      ? (lang === 'si' ? 'භංග විය' : 'Cancelled')
      : (lang === 'si' ? 'සක්‍රියයි' : 'Active'),
    reasons,
    desc: cancelled
      ? NB_FRAMES.cancelled(reasons[0], reasons.length - 1, lang)
      : NB_FRAMES.active(lang),
  };
}

// ─── Public Analysis Function ──────────────────────────────────────────────

export interface PlanetAnalysis {
  planet: string;
  house: number;
  houseData: typeof HOUSE_DATA[1];
  dignity: DignityLevel;
  dignityInfo: typeof DIGNITY_LABELS[DignityLevel];
  isRetrograde: boolean;
  retrogradeEffect: {
    general: string; health: string; wealth: string; career: string; relationships: string;
    intensified: string[]; remedies: string[];
  } | null;
  placement: { effect: string; strengths: string[]; challenges: string[]; keynote: string } | null;
  moolatrikona: boolean;
  digBala: DigBalaInfo;
  functional: FunctionalInfo;
  combustion: CombustionInfo | null;
  neechaBhanga: NeechaBhangaInfo | null;
  strength: StrengthAssessment;
  keywords: string[];
  bodyParts: string[];
  gemstone: string | null;
  mantra: string | null;
}

/** Optional chart-wide context that unlocks combustion + Neecha Bhanga. */
export interface ChartContext {
  longitude?: number;                    // this planet's absolute longitude (0–360)
  sunLongitude?: number;                 // the Sun's absolute longitude (0–360)
  signByPlanet?: Record<string, number>; // every graha -> its rashiIndex
}

export function analyzePlanet(
  planet: string,
  rashiIndex: number,
  ascendantRashiIndex: number,
  isRetrograde: boolean,
  degreeInSign?: number,
  context?: ChartContext,
  lang: Lang = 'en',
): PlanetAnalysis {
  const house = ((rashiIndex - ascendantRashiIndex + 12) % 12) + 1;
  const houseData = HOUSE_DATA[house] ?? HOUSE_DATA[1];
  const dignity = getDignity(planet, rashiIndex);
  const dignityInfo = {
    ...DIGNITY_LABELS[dignity],
    label: pick(DIGNITY_LABEL[dignity], lang),
    desc: pick(DIGNITY_DESC[dignity], lang),
  };

  const pd = PLANET_SIGNIFICATIONS[planet] ?? {};
  const planetKey = planet.charAt(0).toUpperCase() + planet.slice(1).toLowerCase();

  const retroText = isRetrograde ? (RETROGRADE_TEXT[planetKey] ?? null) : null;
  const retrogradeEffect = retroText ? {
    general: pick(retroText.general, lang),
    health: pick(retroText.health, lang),
    wealth: pick(retroText.wealth, lang),
    career: pick(retroText.career, lang),
    relationships: pick(retroText.relationships, lang),
    intensified: pickList(retroText.intensified, lang),
    remedies: pickList(retroText.remedies, lang),
  } : null;

  const placementText = PLANET_IN_HOUSE_TEXT[planetKey]?.[house] ?? null;
  const placement = placementText ? {
    effect: pick(placementText.effect, lang),
    strengths: pickList(placementText.strengths, lang),
    challenges: pickList(placementText.challenges, lang),
    keynote: pick(placementText.keynote, lang),
  } : null;

  const moolatrikona = degreeInSign !== undefined
    ? inMoolatrikona(planetKey, rashiIndex, degreeInSign, dignity)
    : false;
  const digBala = getDigBala(planetKey, house, lang);
  const functional = getFunctionalNature(planetKey, ascendantRashiIndex, lang);

  const combustion = (context?.longitude !== undefined && context?.sunLongitude !== undefined)
    ? getCombustion(planetKey, context.longitude, context.sunLongitude, isRetrograde, lang)
    : null;
  const neechaBhanga = (dignity === 'debilitated' && context?.signByPlanet)
    ? getNeechaBhanga({ planet: planetKey, rashiIndex, ascIndex: ascendantRashiIndex, isRetrograde, signByPlanet: context.signByPlanet, lang })
    : null;

  const strength = assessStrength({
    planet: planetKey, dignity, moolatrikona, dig: digBala, functional, isRetrograde,
    combust: combustion?.isCombust ?? false,
    neechaBhanga: neechaBhanga?.cancelled ?? false,
    lang,
  });

  return {
    planet,
    house,
    houseData,
    dignity,
    dignityInfo,
    isRetrograde,
    retrogradeEffect,
    placement,
    moolatrikona,
    digBala,
    functional,
    combustion,
    neechaBhanga,
    strength,
    keywords: (pd.keywords as string[]) ?? [],
    bodyParts: (pd.bodyParts as string[]) ?? [],
    gemstone: (pd.gemstone as string) ?? null,
    mantra: (pd.mantra as string) ?? null,
  };
}
