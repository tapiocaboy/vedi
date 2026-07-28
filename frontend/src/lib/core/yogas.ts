/** Yoga detection — comprehensive yoga library with strength scoring */

export interface YogaResult {
  name: string;
  sanskritName: string;
  category: 'rajayoga' | 'mahapurusha' | 'dhana' | 'daridra' | 'spiritual' | 'special';
  planetsInvolved: string[];
  housesInvolved: number[];
  strength: 'very strong' | 'strong' | 'medium' | 'weak';
  strengthScore: number; // 1-10
  effects: string;
  isPresent: boolean;
}

export const NATURAL_BENEFICS = ['JUPITER','VENUS','MERCURY','MOON'];
export const NATURAL_MALEFICS = ['SATURN','MARS','SUN','RAHU','KETU'];

const KENDRAS   = [1,4,7,10];
const DUSTHANAS = [6,8,12];

const SIGN_LORDS: Record<number, string> = {
  0:'MARS', 1:'VENUS', 2:'MERCURY', 3:'MOON',
  4:'SUN',  5:'MERCURY', 6:'VENUS', 7:'MARS',
  8:'JUPITER', 9:'SATURN', 10:'SATURN', 11:'JUPITER',
};

// Exaltation signs for planets
const EXALTATION: Record<string, number> = {
  SUN:0, MOON:1, MARS:9, MERCURY:5, JUPITER:3,
  VENUS:11, SATURN:6, RAHU:1, KETU:7,
};

// Own signs
const OWN_SIGNS: Record<string, number[]> = {
  MARS:[0,7], VENUS:[1,6], MERCURY:[2,5], MOON:[3],
  SUN:[4], JUPITER:[8,11], SATURN:[9,10],
};

/** "2nd", "11th" — house numbers appear inside yoga names. */
function ordinal(n: number): string {
  const v = n % 100;
  if (v >= 11 && v <= 13) return `${n}th`;
  return `${n}${['th', 'st', 'nd', 'rd'][n % 10] ?? 'th'}`;
}

// Debilitation is the sign opposite exaltation for every graha.
const DEBILITATION: Record<string, number> = Object.fromEntries(
  Object.entries(EXALTATION).map(([p, r]) => [p, (r + 6) % 12]),
);

/** Combustion (asta) orbs in degrees from the Sun; tighter when retrograde. */
const COMBUSTION_ORB: Record<string, { direct: number; retro: number }> = {
  MOON:    { direct: 12, retro: 12 },
  MARS:    { direct: 17, retro: 17 },
  MERCURY: { direct: 14, retro: 12 },
  JUPITER: { direct: 11, retro: 11 },
  VENUS:   { direct: 10, retro: 8 },
  SATURN:  { direct: 15, retro: 15 },
};

/**
 * Optional refinements. Yogas are detected from whole-sign positions alone, but
 * their *strength* depends on the condition of the planets forming them — which
 * needs longitudes (combustion) and retrograde flags.
 */
export interface YogaRefinements {
  /** Sidereal longitude (0–360) per planet, keyed as `positions` is. */
  longitudes?: Record<string, number>;
  /** Retrograde flags per planet. */
  retro?: Record<string, boolean>;
}

export class YogaCalculator {
  positions: Record<string, number>; // planet → rashi index 0-11
  ascendantRashi: number;
  houses: Record<string, number>;   // planet → house 1-12
  private _refine: YogaRefinements;

  constructor(positions: Record<string, number>, ascendantRashi: number, refinements: YogaRefinements = {}) {
    this.positions = positions;
    this.ascendantRashi = ascendantRashi;
    this._refine = refinements;
    this.houses = {};
    for (const [planet, rashi] of Object.entries(positions)) {
      this.houses[planet] = ((rashi - ascendantRashi + 12) % 12) + 1;
    }
  }

  private _isDebilitated(planet: string): boolean {
    return DEBILITATION[planet] === (this.positions[planet] ?? -1);
  }

  /**
   * Condition of a planet forming a yoga. A yoga is present or absent on
   * whole-sign geometry alone, but how much it actually delivers depends on the
   * state of the planets making it — so callers weighing a yoga need this
   * separately from `isPresent`.
   */
  planetCondition(planet: string): { combust: boolean; debilitated: boolean } {
    return { combust: this._isCombust(planet), debilitated: this._isDebilitated(planet) };
  }

  /** False (rather than unknown) when longitudes were not supplied. */
  private _isCombust(planet: string): boolean {
    const orb = COMBUSTION_ORB[planet];
    const lons = this._refine.longitudes;
    if (!orb || !lons) return false;
    const pLon = lons[planet], sunLon = lons['SUN'];
    if (pLon == null || sunLon == null) return false;
    const d = Math.abs(pLon - sunLon) % 360;
    const sep = d > 180 ? 360 - d : d;
    return sep <= (this._refine.retro?.[planet] ? orb.retro : orb.direct);
  }

  private _getPlanetsInHouse(house: number): string[] {
    return Object.entries(this.houses).filter(([, h]) => h === house).map(([p]) => p);
  }

  private _getHouseLord(house: number): string {
    const sign = (this.ascendantRashi + house - 1) % 12;
    return SIGN_LORDS[sign];
  }

  private _isInKendra(planet: string): boolean {
    return KENDRAS.includes(this.houses[planet] ?? 0);
  }

  private _isExalted(planet: string): boolean {
    const rashi = this.positions[planet] ?? -1;
    return EXALTATION[planet] === rashi;
  }

  private _isInOwnSign(planet: string): boolean {
    const rashi = this.positions[planet] ?? -1;
    return (OWN_SIGNS[planet] ?? []).includes(rashi);
  }

  private _isMutuallyAspecting(p1: string, p2: string): boolean {
    const h1 = this.houses[p1] ?? 0;
    const h2 = this.houses[p2] ?? 0;
    if (h1 === 0 || h2 === 0) return false;
    const dist1 = ((h2 - h1 + 12) % 12) + 1;
    const dist2 = ((h1 - h2 + 12) % 12) + 1;
    // 7th house mutual aspect
    return dist1 === 7 || dist2 === 7;
  }

  // ─── Raja Yogas ───────────────────────────────────────────────────────────

  detectGajakesariYoga(): YogaResult {
    const moonH = this.houses['MOON'] ?? 0;
    const jupH  = this.houses['JUPITER'] ?? 0;
    const dist = ((jupH - moonH + 12) % 12) + 1;
    const isPresent = [1,4,7,10].includes(dist);
    const jupExalted = this._isExalted('JUPITER');
    const jupKendra  = this._isInKendra('JUPITER');
    const moonExalted = this._isExalted('MOON');
    let strengthScore = 4;
    if (isPresent) {
      strengthScore = 6;
      if (jupExalted || jupKendra) strengthScore += 2;
      if (moonExalted) strengthScore += 1;
      if (jupExalted && moonExalted) strengthScore = 10;
    }
    const strength = strengthScore >= 9 ? 'very strong' : strengthScore >= 7 ? 'strong' : strengthScore >= 5 ? 'medium' : 'weak';
    return {
      name:'Gajakesari Yoga', sanskritName:'Gajakesari Yoga', category:'rajayoga',
      planetsInvolved:['MOON','JUPITER'], housesInvolved:[moonH, jupH],
      strength, strengthScore,
      effects:'Fame, wealth, intelligence, wisdom, leadership ability, and a long-lasting positive reputation',
      isPresent,
    };
  }

  detectPanchaMahapurushaYogas(): YogaResult[] {
    const MAHAPURUSHA: Record<string, [string, string, number[], number[]]> = {
      MARS:    ['Ruchaka','Ruchaka',   [0,7],  [9]],
      MERCURY: ['Bhadra', 'Bhadra',   [2,5],  [5]],
      JUPITER: ['Hamsa',  'Hamsa',    [8,11], [3]],
      VENUS:   ['Malavya','Malavya', [1,6],  [11]],
      SATURN:  ['Shasha', 'Shasha',     [9,10], [6]],
    };
    const EFFECTS: Record<string, string> = {
      MARS:   'Exceptional valor, courage, and leadership; military or sports excellence; strong physique and commanding presence',
      MERCURY:'Outstanding intelligence, eloquence, communication mastery, and sharp business acumen',
      JUPITER:'Great wisdom, spirituality, and teaching ability; righteous and ethical conduct; respected guru',
      VENUS:  'Extraordinary beauty, luxury, artistic talents, marital happiness, and refined aesthetic sense',
      SATURN: 'Leadership over masses, institutional authority, longevity, discipline, and deep karmic strength',
    };
    return Object.entries(MAHAPURUSHA).map(([planet, [name, sanskrit, own, exalt]]) => {
      const rashi = this.positions[planet] ?? -1;
      const house = this.houses[planet] ?? 0;
      const inOwn   = own.includes(rashi);
      const inExalt = exalt.includes(rashi);
      const inKendra = KENDRAS.includes(house);
      const isPresent = (inOwn || inExalt) && inKendra;
      let strengthScore = 3;
      if (isPresent) {
        strengthScore = inExalt && inKendra ? 10 : inOwn && inKendra ? 7 : 5;
      }
      const strength = strengthScore >= 9 ? 'very strong' : strengthScore >= 7 ? 'strong' : strengthScore >= 5 ? 'medium' : 'weak';
      return {
        name:`${name} Yoga`, sanskritName:`${sanskrit} Yoga`, category:'mahapurusha' as const,
        planetsInvolved:[planet], housesInvolved:[house],
        strength, strengthScore, effects: EFFECTS[planet], isPresent,
      };
    });
  }

  detectKendraTrikona(): YogaResult[] {
    const yogas: YogaResult[] = [];
    const kendraLords = [1,4,7,10].map(h => this._getHouseLord(h));
    const trikonaLords = [5,9].map(h => this._getHouseLord(h));
    for (const kl of kendraLords) {
      for (const tl of trikonaLords) {
        if (kl === tl) continue;
        const kh = this.houses[kl] ?? 0;
        const th = this.houses[tl] ?? 0;
        const conjunct = kh === th && kh !== 0;
        const mutual = [1,4,7,10].includes(((th - kh + 12) % 12) + 1);
        const mutualAspect = this._isMutuallyAspecting(kl, tl);
        if (conjunct || mutual || mutualAspect) {
          let strengthScore = mutualAspect ? 6 : mutual ? 7 : 9;
          if (this._isExalted(kl) || this._isExalted(tl)) strengthScore = Math.min(10, strengthScore + 1);
          const strength = strengthScore >= 9 ? 'very strong' : strengthScore >= 7 ? 'strong' : strengthScore >= 5 ? 'medium' : 'weak';
          yogas.push({
            name:'Kendra-Trikona Rajayoga', sanskritName:'Kendra-Trikona Rajayoga', category:'rajayoga',
            planetsInvolved:[kl, tl], housesInvolved:[kh, th],
            strength, strengthScore,
            effects:'Power, authority, high social status, success in life, and sustained leadership recognition',
            isPresent:true,
          });
        }
      }
    }
    return yogas;
  }

  detectDhanaYogas(): YogaResult[] {
    const yogas: YogaResult[] = [];
    const check = (h1: number, h2: number, name: string, sanskrit: string, effects: string) => {
      const l1 = this._getHouseLord(h1), l2 = this._getHouseLord(h2);
      const hh1 = this.houses[l1] ?? 0, hh2 = this.houses[l2] ?? 0;
      const conjunct = hh1 === hh2 && hh1 !== 0;
      const connected = [1,4,7,10].includes(((hh2 - hh1 + 12) % 12) + 1);
      const mutual = this._isMutuallyAspecting(l1, l2);
      if (conjunct || connected || mutual) {
        let strengthScore = mutual ? 6 : connected ? 7 : 9;
        if (this._isExalted(l1) || this._isExalted(l2)) strengthScore = Math.min(10, strengthScore + 1);
        const strength = strengthScore >= 9 ? 'very strong' : strengthScore >= 7 ? 'strong' : strengthScore >= 5 ? 'medium' : 'weak';
        yogas.push({ name, sanskritName:sanskrit, category:'dhana', planetsInvolved:[l1,l2], housesInvolved:[h1,h2], strength, strengthScore, effects, isPresent:true });
      }
    };
    check(2,11,'Dhana Yoga (2-11)','Dhana Yoga','Accumulation of wealth, strong financial acumen, and material prosperity');
    check(5,9,'Lakshmi Yoga','Lakshmi Yoga','Divine grace, wealth through merit and fortune, spiritual abundance');
    check(1,2,'Dhana Yoga (1-2)','Dhana Yoga','Personal wealth through self-effort and individual initiative');
    check(9,11,'Dhana Yoga (9-11)','Dhana Yoga','Fortune and income combine — exceptional wealth from dharmic sources');
    yogas.push(...this.detectDhanaLordDeposits());
    return yogas;
  }

  /**
   * A dhana-house lord deposited in another dhana house.
   *
   * Phaladeepika (Ch. 14) treats the 2nd, 5th, 9th and 11th as the
   * wealth-giving quartet: the lord of one of them sitting in another is the
   * plainest wealth combination there is. The pairwise lord-conjunction checks
   * above miss it entirely — they only fire when two *lords* meet, so a 2nd
   * lord parked in the 11th registers as nothing at all.
   *
   * Dignity is folded into the strength rather than the detection, because the
   * combination is present either way: a combust lord in an enemy sign still
   * brings the money in, it just cannot hold it.
   */
  detectDhanaLordDeposits(): YogaResult[] {
    const DHANA_HOUSES = [2, 5, 9, 11];
    const yogas: YogaResult[] = [];
    for (const owned of DHANA_HOUSES) {
      const lord = this._getHouseLord(owned);
      const sits = this.houses[lord] ?? 0;
      if (!sits || sits === owned || !DHANA_HOUSES.includes(sits)) continue;

      let strengthScore = 7;
      if (this._isExalted(lord) || this._isInOwnSign(lord)) strengthScore += 2;
      if (this._isDebilitated(lord)) strengthScore -= 2;
      if (this._isCombust(lord)) strengthScore -= 1;
      strengthScore = Math.max(3, Math.min(10, strengthScore));

      const strength = strengthScore >= 9 ? 'very strong' : strengthScore >= 7 ? 'strong' : strengthScore >= 5 ? 'medium' : 'weak';
      yogas.push({
        name: `Dhana Yoga (${ordinal(owned)} lord in ${ordinal(sits)})`, sanskritName: 'Dhana Yoga', category: 'dhana',
        planetsInvolved: [lord], housesInvolved: [owned, sits],
        strength, strengthScore,
        effects: 'The lord of one wealth house occupies another — income arrives through the affairs of both houses, and the two reinforce each other',
        isPresent: true,
      });
    }
    return yogas;
  }

  detectKemadrumaYoga(): YogaResult {
    const moonH = this.houses['MOON'] ?? 0;
    const h2  = (moonH % 12) + 1;
    const h12 = ((moonH - 2 + 12) % 12) + 1;
    const p2  = this._getPlanetsInHouse(h2).filter(p => !['MOON','RAHU','KETU'].includes(p));
    const p12 = this._getPlanetsInHouse(h12).filter(p => !['MOON','RAHU','KETU'].includes(p));
    const isolated = p2.length === 0 && p12.length === 0;
    const cancelled = ['JUPITER','VENUS','MERCURY'].some(p => this._isInKendra(p));
    const isPresent = isolated && !cancelled;
    const strengthScore = isPresent ? (this._isExalted('MOON') ? 3 : 5) : 2;
    const strength = strengthScore >= 5 ? 'medium' : 'weak';
    return {
      name:'Kemadruma Yoga', sanskritName:'Kemadruma Yoga', category:'daridra',
      planetsInvolved:['MOON'], housesInvolved:[moonH],
      strength, strengthScore,
      effects:'Financial difficulties, emotional instability, and lack of support (cancelled when benefics occupy kendras)',
      isPresent,
    };
  }

  detectViparitraRajayoga(): YogaResult[] {
    const dusthanaHouses = [6,8,12];
    return dusthanaHouses.flatMap(h => {
      const lord = this._getHouseLord(h);
      const lordH = this.houses[lord] ?? 0;
      const isPresent = DUSTHANAS.includes(lordH);
      if (!isPresent) return [];
      const strengthScore = this._isExalted(lord) ? 8 : 6;
      const strength = strengthScore >= 8 ? 'strong' : 'medium';
      return [{
        name:`Viparita Rajayoga (${h}th lord in dusthana)`, sanskritName:'Viparita Rajayoga', category:'rajayoga' as const,
        planetsInvolved:[lord], housesInvolved:[h, lordH],
        strength, strengthScore,
        effects:'Rise through unconventional or unexpected means, gains from obstacles and challenges, triumph over adversity',
        isPresent,
      }];
    });
  }

  detectBudhadityaYoga(): YogaResult {
    const sunH  = this.houses['SUN'] ?? 0;
    const mercH = this.houses['MERCURY'] ?? 0;
    const isConjunct = sunH === mercH && sunH !== 0;
    let strengthScore = 3;
    if (isConjunct) {
      strengthScore = 6;
      if (this._isExalted('SUN') || this._isExalted('MERCURY')) strengthScore = 8;
      if (this._isInKendra('SUN')) strengthScore = Math.min(10, strengthScore + 1);
    }
    const strength = strengthScore >= 9 ? 'very strong' : strengthScore >= 7 ? 'strong' : strengthScore >= 5 ? 'medium' : 'weak';
    return {
      name:'Budhaditya Yoga', sanskritName:'Budhaditya Yoga', category:'rajayoga',
      planetsInvolved:['SUN','MERCURY'], housesInvolved:[sunH, mercH],
      strength, strengthScore,
      effects:'Sharp intelligence, communication brilliance, fame through learning, analytical abilities, and expression',
      isPresent: isConjunct,
    };
  }

  detectChandraAdhiYoga(): YogaResult[] {
    const moonH = this.houses['MOON'] ?? 0;
    if (!moonH) return [];
    const benefics = ['MERCURY','VENUS','JUPITER'];
    const h6 = (moonH % 12) + 1;
    const h7 = ((moonH + 1) % 12) + 1;
    const h8 = ((moonH + 2) % 12) + 1;
    const inNeighbors: string[] = [];
    for (const p of benefics) {
      const ph = this.houses[p] ?? 0;
      if ([h6, h7, h8].includes(ph)) inNeighbors.push(p);
    }
    if (inNeighbors.length === 0) return [];
    let strengthScore = 5 + inNeighbors.length;
    if (inNeighbors.length === 3) strengthScore = 10;
    const strength = strengthScore >= 9 ? 'very strong' : strengthScore >= 7 ? 'strong' : 'medium';
    return [{
      name:'Chandra Adhi Yoga', sanskritName:'Chandra Adhi Yoga', category:'rajayoga',
      planetsInvolved:['MOON', ...inNeighbors], housesInvolved:[moonH, h6, h7, h8].filter((v, i, a) => a.indexOf(v) === i),
      strength, strengthScore,
      effects:'Minister or leader status, pleasant and healthy life, defeat of enemies, long-lasting prosperity',
      isPresent: true,
    }];
  }

  detectSunafaAnafa(): YogaResult[] {
    const moonH = this.houses['MOON'] ?? 0;
    if (!moonH) return [];
    const h2  = (moonH % 12) + 1;
    const h12 = ((moonH - 2 + 12) % 12) + 1;
    const results: YogaResult[] = [];
    const validPlanets = ['SUN','MARS','MERCURY','JUPITER','VENUS','SATURN'];
    const in2nd  = this._getPlanetsInHouse(h2).filter(p => validPlanets.includes(p));
    const in12th = this._getPlanetsInHouse(h12).filter(p => validPlanets.includes(p));
    if (in2nd.length > 0) {
      results.push({
        name:'Sunapha Yoga', sanskritName:'Sunapha Yoga', category:'special',
        planetsInvolved:['MOON', ...in2nd], housesInvolved:[moonH, h2],
        strength:'medium', strengthScore:6,
        effects:'Self-made wealth, intelligent and resourceful personality, respected in society through personal merit',
        isPresent: true,
      });
    }
    if (in12th.length > 0) {
      results.push({
        name:'Anapha Yoga', sanskritName:'Anapha Yoga', category:'special',
        planetsInvolved:['MOON', ...in12th], housesInvolved:[moonH, h12],
        strength:'medium', strengthScore:6,
        effects:'Good name and fame, renunciation and spiritual inclination, and pleasurable comfortable life',
        isPresent: true,
      });
    }
    return results;
  }

  detectNeechabangaRajayoga(): YogaResult[] {
    const yogas: YogaResult[] = [];
    const DEBILITATION: Record<string, number> = {
      SUN:6, MOON:9, MARS:3, MERCURY:11, JUPITER:9,
      VENUS:5, SATURN:0,
    };
    for (const [planet, debRashi] of Object.entries(DEBILITATION)) {
      const rashi = this.positions[planet];
      if (rashi !== debRashi) continue;
      const debRashiLord = SIGN_LORDS[debRashi];
      const exaltedRashi = EXALTATION[planet];
      const exaltedRashiLord = SIGN_LORDS[exaltedRashi];
      const cancelled =
        this._isInKendra(debRashiLord) ||
        this._isInKendra(exaltedRashiLord) ||
        this._isExalted(planet) || // shouldn't happen, but guard
        this._isInOwnSign(debRashiLord);
      if (!cancelled) continue;
      yogas.push({
        name:`Neecha Bhanga Rajayoga (${planet})`, sanskritName:'Neecha Bhanga Rajayoga', category:'rajayoga',
        planetsInvolved:[planet, debRashiLord], housesInvolved:[this.houses[planet] ?? 0],
        strength:'strong', strengthScore:8,
        effects:'Debilitated planet\'s weakness is cancelled, transforming adversity into remarkable strength and resilience',
        isPresent: true,
      });
    }
    return yogas;
  }

  detectParivartan(): YogaResult[] {
    const yogas: YogaResult[] = [];
    const planets = Object.keys(this.positions).filter(p => !['RAHU','KETU'].includes(p));
    for (let i = 0; i < planets.length; i++) {
      for (let j = i + 1; j < planets.length; j++) {
        const p1 = planets[i], p2 = planets[j];
        const r1 = this.positions[p1], r2 = this.positions[p2];
        // p1 in p2's sign AND p2 in p1's sign
        const p1InP2Sign = (OWN_SIGNS[p2] ?? []).includes(r1);
        const p2InP1Sign = (OWN_SIGNS[p1] ?? []).includes(r2);
        if (!p1InP2Sign || !p2InP1Sign) continue;
        const h1 = this.houses[p1] ?? 0, h2 = this.houses[p2] ?? 0;
        // Skip if either house is a dusthana for Maha Parivartana (both dusthana = Dainya)
        const bothDusthana = DUSTHANAS.includes(h1) && DUSTHANAS.includes(h2);
        const oneDusthana = DUSTHANAS.includes(h1) || DUSTHANAS.includes(h2);
        const name = bothDusthana ? `Dainya Parivartana Yoga (${p1}-${p2})` : oneDusthana ? `Kahala Parivartana Yoga (${p1}-${p2})` : `Maha Parivartana Yoga (${p1}-${p2})`;
        const strengthScore = bothDusthana ? 4 : oneDusthana ? 6 : 8;
        const strength = strengthScore >= 8 ? 'strong' : strengthScore >= 6 ? 'medium' : 'weak';
        yogas.push({
          name, sanskritName:'Parivartana Yoga', category: bothDusthana ? 'daridra' : 'rajayoga',
          planetsInvolved:[p1, p2], housesInvolved:[h1, h2],
          strength, strengthScore,
          effects: bothDusthana
            ? 'Exchange in dusthanas — challenges and karmic debts come due; requires careful navigation'
            : oneDusthana
              ? 'Mixed exchange — one planet struggles, supporting the other; complex karmic interplay'
              : 'Great exchange yoga — both planets mutually strengthen each other; significant life benefits',
          isPresent: true,
        });
      }
    }
    return yogas;
  }

  detectAmalaYoga(): YogaResult[] {
    // 10th from lagna or moon has only benefic planets
    const h10 = 10;
    const h10FromMoon = ((this.houses['MOON'] ?? 1) + 9 - 1) % 12 + 1;
    const planetsIn10 = this._getPlanetsInHouse(h10);
    const planetsIn10Moon = this._getPlanetsInHouse(h10FromMoon);
    const results: YogaResult[] = [];
    if (planetsIn10.length > 0 && planetsIn10.every(p => NATURAL_BENEFICS.includes(p))) {
      results.push({
        name:'Amala Yoga (from Lagna)', sanskritName:'Amala Yoga', category:'special',
        planetsInvolved:planetsIn10, housesInvolved:[h10],
        strength:'strong', strengthScore:8,
        effects:'Spotless reputation, virtuous character, lasting fame and honor, success through ethical conduct',
        isPresent: true,
      });
    }
    if (h10FromMoon !== h10 && planetsIn10Moon.length > 0 && planetsIn10Moon.every(p => NATURAL_BENEFICS.includes(p))) {
      results.push({
        name:'Amala Yoga (from Moon)', sanskritName:'Amala Yoga', category:'special',
        planetsInvolved:planetsIn10Moon, housesInvolved:[h10FromMoon],
        strength:'medium', strengthScore:7,
        effects:'Virtuous reputation and fame growing through time; ethical success and social recognition',
        isPresent: true,
      });
    }
    return results;
  }

  detectAllYogas(): YogaResult[] {
    const all: YogaResult[] = [];
    const add = (y: YogaResult | YogaResult[]) => {
      const arr = Array.isArray(y) ? y : [y];
      all.push(...arr.filter(r => r.isPresent));
    };
    add(this.detectGajakesariYoga());
    add(this.detectPanchaMahapurushaYogas());
    add(this.detectKendraTrikona());
    add(this.detectDhanaYogas());
    add(this.detectKemadrumaYoga());
    add(this.detectViparitraRajayoga());
    add(this.detectBudhadityaYoga());
    add(this.detectChandraAdhiYoga());
    add(this.detectSunafaAnafa());
    add(this.detectNeechabangaRajayoga());
    add(this.detectParivartan());
    add(this.detectAmalaYoga());

    // De-duplicate: the same yoga can be detected more than once — e.g. a planet
    // ruling two kendras yields the identical Kendra-Trikona Rajayoga (same name
    // + same planet pair) for each. Collapse those to a single, strongest entry.
    // Distinct yogas (different name OR different planets) are preserved.
    const byKey = new Map<string, YogaResult>();
    for (const y of all) {
      const key = `${y.name}|${[...y.planetsInvolved].sort().join(',')}`;
      const prev = byKey.get(key);
      if (!prev || y.strengthScore > prev.strengthScore) byKey.set(key, y);
    }
    // Sort by strength score descending
    return [...byKey.values()].sort((a, b) => b.strengthScore - a.strengthScore);
  }

  /** Returns all yogas checked, including those not present — for a full analysis report */
  detectAllYogasReport(): YogaResult[] {
    const all: YogaResult[] = [];
    all.push(this.detectGajakesariYoga());
    all.push(...this.detectPanchaMahapurushaYogas());
    all.push(...this.detectKendraTrikona());
    all.push(...this.detectDhanaYogas());
    all.push(this.detectKemadrumaYoga());
    all.push(...this.detectViparitraRajayoga());
    all.push(this.detectBudhadityaYoga());
    all.push(...this.detectChandraAdhiYoga());
    all.push(...this.detectSunafaAnafa());
    all.push(...this.detectNeechabangaRajayoga());
    all.push(...this.detectParivartan());
    all.push(...this.detectAmalaYoga());
    return all.sort((a, b) => (b.isPresent ? 1 : 0) - (a.isPresent ? 1 : 0) || b.strengthScore - a.strengthScore);
  }
}
