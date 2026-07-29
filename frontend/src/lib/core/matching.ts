/**
 * Layers 1 and 2 of the compatibility engine: Ashtakoot Guna Milan, and the
 * per-chart dosha analysis.
 *
 * Two things about this module are deliberate and easy to undo by accident.
 *
 * **Guna Milan is a gate, not a score.** Classical use of the 36-point count is
 * as a preliminary filter, and it reads one variable only — the Moon. All eight
 * kootas are eight views of the same longitude. So Layer 1 returns a total and a
 * PASS/FAIL gate, and nothing here produces a verdict or a percentage: a 32/36
 * and a 20/36 both route into the deeper layers identically, and presenting the
 * total as a quality measure claims a precision it does not have.
 *
 * **Several kootas are asymmetric.** Varna, Vashya and Gana all score the boy's
 * position against the girl's and give a different answer if swapped. Symmetric
 * approximations of these tables are the most common implementation error in the
 * area, because they look right on the diagonal and quietly disagree everywhere
 * else.
 *
 * Where classical sources diverge, the table used here is stated at the table.
 */

import {
  NAKSHATRA_YONI, YONI_ANIMAL, yoniCell, genderPolarityInverted,
  type Yoni, type YoniCell,
} from './matchYoni';

// ─── Inputs ──────────────────────────────────────────────────────────────────

export interface MatchInput {
  moonRashi: number;          // 0–11
  moonNakshatra: number;      // 0–26
  /**
   * The Moon's degree within its rashi (0–30). Vashya splits Dhanu and Makara
   * at 15°, so a rashi-only input silently mis-scores every Moon in those two
   * signs — which is 1 in 6 charts.
   */
  moonDegreeInSign?: number;
  /** The Moon's pada (1–4). One of the Nadi cancellation conditions needs it. */
  moonPada?: number;
  /** Lord of the Moon's nakshatra — used by the Bhakoot and Nadi cancellations. */
  moonNakshatraLord?: string;
  /** The Moon's navamsa sign (0–11) — used by the Gana cancellation. */
  moonNavamsa?: number;

  marsHouseFromLagna: number; // 1–12 (or 0 if unknown)
  marsHouseFromMoon: number;  // 1–12

  // ── Optional chart context ────────────────────────────────────────────
  // Ashtakoot alone reads only the Moon. These let Layers 2–4 reach the 7th
  // house, the marriage karakas, the Navamsa and the synastry overlay. All
  // optional, so a Moon-only input still produces a valid Layer 1.

  /** Natal ascendant sign (0–11). */
  ascendantRashi?: number;
  /** Ascendant sidereal longitude (0–360) — Layer 4 needs the degree. */
  ascendantLongitude?: number;
  /** Natal D1 sign per planet, keyed Sun/Moon/Mars/…/Ketu. */
  planetRashis?: Record<string, number>;
  /** Sidereal longitude per planet — enables combustion and orb weighting. */
  planetLongitudes?: Record<string, number>;
  /** Retrograde flags per planet. */
  planetRetro?: Record<string, boolean>;
  /** Navamsa (D9) sign per planet. */
  d9Rashis?: Record<string, number>;
  /** Navamsa ascendant sign (0–11). */
  d9Ascendant?: number;
  /** D30 (Trimsamsa) sign per planet — for the cross-varga repetition count. */
  d30Rashis?: Record<string, number>;
}

export interface KootaScore {
  name: string;
  obtained: number;
  max: number;
  passed: boolean;
  reason: string;
  /**
   * The values the koota was computed from, for callers that need them.
   *
   * Downstream prose used to recover these by running regexes over `reason`,
   * which ties the interpretation layer to the exact wording of the scoring
   * layer — reword a sentence and the reading silently loses a fact. Anything
   * needing the inputs reads this.
   */
  detail?: Record<string, string | number | boolean>;
}

/** Three-band severity. Layer 2 emits no numeric score, per the spec. */
export type DoshaSeverity = 'none' | 'mitigated' | 'active';

export interface DoshaResult {
  name: string;
  present: boolean;
  mitigated: boolean;
  severity: DoshaSeverity;
  description: string;
}

export type GunaGate = 'GATE_PASS' | 'GATE_FAIL';

/** The gate threshold. Below this, classical practice does not proceed. */
export const GUNA_GATE_THRESHOLD = 18;

export interface GunaMilanResult {
  kootas: KootaScore[];
  /** Out of 36. A count, not a quality measure — see the module note. */
  total: number;
  gate: GunaGate;
  /** Qualitative flags that carry no numeric weight (e.g. gender polarity). */
  flags: string[];
}

// ─── 2.1 Varna ───────────────────────────────────────────────────────────────

// Brahmin 4: Kataka, Vrischika, Meena · Kshatriya 3: Mesha, Simha, Dhanu
// Vaishya 2: Vrishabha, Kanya, Makara · Shudra 1: Mithuna, Tula, Kumbha
const VARNA_RANK: number[] = [3, 2, 1, 4, 3, 2, 1, 4, 3, 2, 1, 4];
const VARNA_NAME: Record<number, string> = { 4: 'Brahmin', 3: 'Kshatriya', 2: 'Vaishya', 1: 'Shudra' };

// ─── 2.2 Vashya ──────────────────────────────────────────────────────────────

type Vashya = 'Chatushpada' | 'Manava' | 'Jalachara' | 'Vanachara' | 'Keeta';

/**
 * Vashya group. Dhanu and Makara split at 15° of the sign, so this needs the
 * degree; without it the second half of Dhanu and the first half of Makara are
 * assigned to the wrong group.
 */
export function vashyaOf(rashi: number, degreeInSign = 0): Vashya {
  switch (rashi) {
    case 0: case 1: return 'Chatushpada';               // Mesha, Vrishabha
    case 2: case 5: case 6: case 10: return 'Manava';   // Mithuna, Kanya, Tula, Kumbha
    case 3: case 11: return 'Jalachara';                // Kataka, Meena
    case 4: return 'Vanachara';                         // Simha
    case 7: return 'Keeta';                             // Vrischika
    case 8: return degreeInSign < 15 ? 'Manava' : 'Chatushpada';      // Dhanu
    case 9: return degreeInSign < 15 ? 'Chatushpada' : 'Jalachara';   // Makara
    default: return 'Manava';
  }
}

/**
 * Asymmetric score matrix, boy's group as row and girl's as column. Several
 * off-diagonal cells differ between authorities; this is the table given in the
 * project specification, and it must not be mixed with another source's.
 */
const VASHYA_MATRIX: Record<Vashya, Record<Vashya, number>> = {
  Chatushpada: { Chatushpada: 2,   Manava: 1, Jalachara: 1,   Vanachara: 0,   Keeta: 1 },
  Manava:      { Chatushpada: 0.5, Manava: 2, Jalachara: 1,   Vanachara: 0,   Keeta: 1 },
  Jalachara:   { Chatushpada: 1,   Manava: 1, Jalachara: 2,   Vanachara: 0.5, Keeta: 1 },
  Vanachara:   { Chatushpada: 1,   Manava: 0, Jalachara: 0,   Vanachara: 2,   Keeta: 1 },
  Keeta:       { Chatushpada: 1,   Manava: 1, Jalachara: 0.5, Vanachara: 1,   Keeta: 2 },
};

// ─── 2.3 Tara ────────────────────────────────────────────────────────────────

/**
 * Taras 3 (Vipat), 5 (Pratyari) and 7 (Vadha) are the inauspicious ones.
 *
 * Tara 1 (Janma) is auspicious here. Some authorities treat the birth star
 * itself as inauspicious in this koota, which is why identical charts score
 * 33/36 in those implementations rather than 36/36. The specification this
 * engine follows names only 3, 5 and 7, so that is what is encoded.
 */
const INAUSPICIOUS_TARA = new Set([3, 5, 7]);
const TARA_NAME: Record<number, string> = {
  1: 'Janma', 2: 'Sampat', 3: 'Vipat', 4: 'Kshema', 5: 'Pratyari',
  6: 'Sadhaka', 7: 'Vadha', 8: 'Mitra', 9: 'Ati-mitra',
};

// ─── 2.5 Graha Maitri ────────────────────────────────────────────────────────

const RASHI_LORD: string[] = [
  'Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury',
  'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter',
];

/** Naisargika (natural, permanent) relationships. Not temporary or compound. */
const PLANET_FRIENDS: Record<string, string[]> = {
  Sun: ['Moon', 'Mars', 'Jupiter'], Moon: ['Sun', 'Mercury'],
  Mars: ['Sun', 'Moon', 'Jupiter'], Mercury: ['Sun', 'Venus'],
  Jupiter: ['Sun', 'Moon', 'Mars'], Venus: ['Mercury', 'Saturn'],
  Saturn: ['Mercury', 'Venus'],
};
const PLANET_ENEMIES: Record<string, string[]> = {
  Sun: ['Venus', 'Saturn'], Moon: [],
  Mars: ['Mercury'], Mercury: ['Moon'],
  Jupiter: ['Mercury', 'Venus'], Venus: ['Sun', 'Moon'],
  Saturn: ['Sun', 'Moon', 'Mars'],
};

export type PlanetRelation = 'friend' | 'enemy' | 'neutral' | 'same';

export function planetRelation(a: string, b: string): PlanetRelation {
  if (a === b) return 'same';
  if ((PLANET_FRIENDS[a] ?? []).includes(b)) return 'friend';
  if ((PLANET_ENEMIES[a] ?? []).includes(b)) return 'enemy';
  return 'neutral';
}

/** Mutual naisargika friendship — the condition several cancellations turn on. */
export function mutualFriends(a: string, b: string): boolean {
  return a === b || (planetRelation(a, b) === 'friend' && planetRelation(b, a) === 'friend');
}

// ─── 2.6 Gana ────────────────────────────────────────────────────────────────

type Gana = 'Deva' | 'Manushya' | 'Rakshasa';
const NAKSHATRA_GANA: Gana[] = [
  'Deva', 'Manushya', 'Rakshasa', 'Manushya', 'Deva', 'Manushya', 'Deva', 'Deva',
  'Rakshasa', 'Rakshasa', 'Manushya', 'Manushya', 'Deva', 'Rakshasa', 'Deva',
  'Rakshasa', 'Deva', 'Rakshasa', 'Rakshasa', 'Manushya', 'Manushya', 'Deva',
  'Rakshasa', 'Rakshasa', 'Manushya', 'Manushya', 'Deva',
];

/**
 * Asymmetric by design: a Rakshasa boy with a Manushya girl scores 3, and the
 * reverse scores 0. Rows are the boy, columns the girl.
 */
const GANA_MATRIX: Record<Gana, Record<Gana, number>> = {
  Deva:     { Deva: 6, Manushya: 5, Rakshasa: 1 },
  Manushya: { Deva: 5, Manushya: 6, Rakshasa: 0 },
  Rakshasa: { Deva: 0, Manushya: 3, Rakshasa: 6 },
};

// ─── 2.8 Nadi ────────────────────────────────────────────────────────────────

type Nadi = 'Adi' | 'Madhya' | 'Antya';
const NAKSHATRA_NADI: Nadi[] = [
  'Adi', 'Madhya', 'Antya', 'Antya', 'Madhya', 'Adi', 'Adi', 'Madhya', 'Antya',
  'Antya', 'Madhya', 'Adi', 'Adi', 'Madhya', 'Antya', 'Antya', 'Madhya', 'Adi',
  'Adi', 'Madhya', 'Antya', 'Antya', 'Madhya', 'Adi', 'Adi', 'Madhya', 'Antya',
];
const NADI_HUMOUR: Record<Nadi, string> = { Adi: 'Vata', Madhya: 'Pitta', Antya: 'Kapha' };

// ─── Koota calculations ──────────────────────────────────────────────────────
//
// `boy` and `girl` are the asymmetric roles the classical tables are written
// for. They are positional roles in the scoring matrices, not a claim about the
// couple; a caller matching any two charts assigns them consistently and reads
// the asymmetric kootas as directional.

function calcVarna(boy: MatchInput, girl: MatchInput): KootaScore {
  const rb = VARNA_RANK[boy.moonRashi], rg = VARNA_RANK[girl.moonRashi];
  const obtained = rb >= rg ? 1 : 0;
  return {
    name: 'Varna',
    obtained, max: 1,
    passed: obtained === 1,
    detail: { boyVarna: VARNA_NAME[rb], girlVarna: VARNA_NAME[rg] },
    reason:
      `Varna: ${VARNA_NAME[rb]} and ${VARNA_NAME[rg]}. ` +
      (obtained
        ? 'The classical condition is met.'
        : 'The classical condition (the first party’s varna ranking at least as high) is not met. ' +
          'This koota encodes a social hierarchy rather than an astronomical correlation, and it carries 1 point of 36.'),
  };
}

function calcVashya(boy: MatchInput, girl: MatchInput): KootaScore {
  const vb = vashyaOf(boy.moonRashi, boy.moonDegreeInSign ?? 0);
  const vg = vashyaOf(girl.moonRashi, girl.moonDegreeInSign ?? 0);
  const obtained = VASHYA_MATRIX[vb][vg];
  return {
    name: 'Vashya',
    obtained, max: 2,
    passed: obtained >= 1,
    detail: { boyVashya: vb, girlVashya: vg },
    reason:
      `Vashya groups: ${vb} and ${vg}. ` +
      (obtained === 2 ? 'Same group — natural mutual influence.'
        : obtained >= 1 ? 'Compatible groups.'
        : obtained > 0 ? 'Partial influence in one direction only.'
        : 'The groups do not align — neither party naturally sways the other.'),
  };
}

function calcTara(boy: MatchInput, girl: MatchInput): KootaScore {
  const fwd = ((boy.moonNakshatra - girl.moonNakshatra + 27) % 27) + 1;
  const rev = ((girl.moonNakshatra - boy.moonNakshatra + 27) % 27) + 1;
  const t1 = fwd % 9 === 0 ? 9 : fwd % 9;
  const t2 = rev % 9 === 0 ? 9 : rev % 9;
  const ok1 = !INAUSPICIOUS_TARA.has(t1);
  const ok2 = !INAUSPICIOUS_TARA.has(t2);
  const obtained = ok1 && ok2 ? 3 : ok1 || ok2 ? 1.5 : 0;
  return {
    name: 'Tara',
    obtained, max: 3,
    passed: obtained >= 1.5,
    detail: { taraForward: t1, taraReverse: t2, forwardName: TARA_NAME[t1], reverseName: TARA_NAME[t2] },
    reason:
      `Tara ${t1} (${TARA_NAME[t1]}, ${ok1 ? 'auspicious' : 'inauspicious'}) one way, ` +
      `${t2} (${TARA_NAME[t2]}, ${ok2 ? 'auspicious' : 'inauspicious'}) the other. ` +
      (obtained === 3 ? 'Both directions are auspicious.'
        : obtained > 0 ? 'One direction is auspicious and the other is not, so the support is one-sided.'
        : 'Neither direction is auspicious.'),
  };
}

export interface YoniDetail extends YoniCell {
  boyYoni: Yoni;
  girlYoni: Yoni;
  genderInverted: boolean;
}

function calcYoni(boy: MatchInput, girl: MatchInput): { koota: KootaScore; detail: YoniDetail } {
  const boyYoni = NAKSHATRA_YONI[boy.moonNakshatra].yoni;
  const girlYoni = NAKSHATRA_YONI[girl.moonNakshatra].yoni;
  const cell = yoniCell(boyYoni, girlYoni);
  const genderInverted = genderPolarityInverted(boy.moonNakshatra, girl.moonNakshatra);

  const bandText: Record<YoniCell['band'], string> = {
    identical: 'the same yoni — the tradition’s strongest reading for instinctive compatibility',
    friendly: 'yonis of the same natural group, which reads as easy',
    neutral: 'yonis that neither clash nor especially match',
    inimical: 'yonis in a natural predator-and-prey relation, which reads as friction',
    bitter: 'yonis the tradition names as bitter enemies — the lowest reading in this koota',
  };

  return {
    koota: {
      name: 'Yoni',
      obtained: cell.score, max: 4,
      passed: cell.score >= 2,
      detail: {
        boyYoni, girlYoni, band: cell.band, provenance: cell.provenance,
        boyAnimal: YONI_ANIMAL[boyYoni], girlAnimal: YONI_ANIMAL[girlYoni],
        genderInverted,
      },
      reason:
        `${boyYoni} (${YONI_ANIMAL[boyYoni]}) and ${girlYoni} (${YONI_ANIMAL[girlYoni]}) — ${bandText[cell.band]}.` +
        (cell.provenance === 'derived' && cell.band !== 'neutral'
          ? ' This cell is derived from the same-group / predator-prey rule rather than transcribed from a cited table.'
          : ''),
    },
    detail: { ...cell, boyYoni, girlYoni, genderInverted },
  };
}

function calcGrahaMaitri(boy: MatchInput, girl: MatchInput): KootaScore {
  const lb = RASHI_LORD[boy.moonRashi], lg = RASHI_LORD[girl.moonRashi];
  const rBG = planetRelation(lb, lg);
  const rGB = planetRelation(lg, lb);

  const pairScore = (x: PlanetRelation, y: PlanetRelation): number => {
    if (x === 'same' || y === 'same') return 5;
    if (x === 'friend' && y === 'friend') return 5;
    if ((x === 'friend' && y === 'neutral') || (x === 'neutral' && y === 'friend')) return 4;
    if (x === 'neutral' && y === 'neutral') return 3;
    if ((x === 'friend' && y === 'enemy') || (x === 'enemy' && y === 'friend')) return 1;
    if ((x === 'neutral' && y === 'enemy') || (x === 'enemy' && y === 'neutral')) return 0.5;
    return 0;
  };
  const obtained = pairScore(rBG, rGB);

  return {
    name: 'Graha Maitri',
    obtained, max: 5,
    passed: obtained >= 3,
    detail: { boyLord: lb, girlLord: lg, boyToGirl: rBG, girlToBoy: rGB },
    reason:
      `Moon-sign lords ${lb} and ${lg}` +
      (lb === lg ? ' — the same graha rules both.' : `; ${lb} treats ${lg} as ${rBG}, and ${lg} treats ${lb} as ${rGB}.`) +
      (obtained >= 4 ? ' Strong mental rapport.'
        : obtained >= 3 ? ' Neutral but workable.'
        : ' Mental harmony is strained.'),
  };
}

function calcGana(boy: MatchInput, girl: MatchInput): KootaScore {
  const gb = NAKSHATRA_GANA[boy.moonNakshatra], gg = NAKSHATRA_GANA[girl.moonNakshatra];
  const raw = GANA_MATRIX[gb][gg];

  // Cancellation: void when the Moon rashi lords are mutual friends, or when
  // both Moons fall in the same navamsa.
  const lordsFriendly = mutualFriends(RASHI_LORD[boy.moonRashi], RASHI_LORD[girl.moonRashi]);
  const sameNavamsa = boy.moonNavamsa != null && girl.moonNavamsa != null
    && boy.moonNavamsa === girl.moonNavamsa;
  const cancelled = raw < 6 && (lordsFriendly || sameNavamsa);
  const obtained = cancelled ? 6 : raw;

  const why = lordsFriendly
    ? 'the Moon-sign lords are mutual natural friends'
    : 'both Moons fall in the same navamsa';

  return {
    name: 'Gana',
    obtained, max: 6,
    passed: obtained >= 5,
    detail: { boyGana: gb, girlGana: gg, rawScore: raw, cancelled },
    reason:
      `Ganas: ${gb} and ${gg}. ` +
      (cancelled
        ? `The classical shortfall of ${raw}/6 is cancelled because ${why}.`
        : raw === 6 ? 'Same temperament class.'
        : raw === 5 ? 'Compatible temperament classes.'
        : raw === 3 ? 'A tense mix, and asymmetric — the reverse pairing would score worse.'
        : 'Opposed temperament classes, and no cancellation applies.'),
  };
}

function calcBhakoot(boy: MatchInput, girl: MatchInput): KootaScore {
  const fwd = ((girl.moonRashi - boy.moonRashi + 12) % 12) + 1;
  const rev = ((boy.moonRashi - girl.moonRashi + 12) % 12) + 1;
  const [lo, hi] = fwd <= rev ? [fwd, rev] : [rev, fwd];
  const axis = `${lo}/${hi}`;
  const adverse = axis === '2/12' || axis === '5/9' || axis === '6/8';

  // Cancellation: the two Moon rashi lords are the same graha, or mutual
  // naisargika friends, or the two Moon nakshatra lords are identical.
  const lb = RASHI_LORD[boy.moonRashi], lg = RASHI_LORD[girl.moonRashi];
  const sameLord = lb === lg;
  const lordsFriendly = mutualFriends(lb, lg);
  const sameNakLord = boy.moonNakshatraLord != null && girl.moonNakshatraLord != null
    && boy.moonNakshatraLord === girl.moonNakshatraLord;
  const cancelled = adverse && (sameLord || lordsFriendly || sameNakLord);
  const obtained = adverse && !cancelled ? 0 : 7;

  const axisName = axis === '6/8' ? 'Shadashtak (6–8)'
    : axis === '2/12' ? 'Dwirdwadash (2–12)'
    : axis === '5/9' ? 'Nava-Pancham (5–9)' : null;
  const why = sameLord ? `both Moon signs are ruled by ${lb}`
    : lordsFriendly ? `the Moon-sign lords ${lb} and ${lg} are mutual natural friends`
    : 'both Moons share the same nakshatra lord';

  return {
    name: 'Bhakoot',
    obtained, max: 7,
    passed: obtained === 7,
    detail: { axis, adverse, cancelled, axisName: axisName ?? '' },
    reason: !adverse
      ? `Moon signs on the ${axis} axis — no Bhakoot dosha.`
      : cancelled
        ? `${axisName} Bhakoot, but cancelled: ${why}.`
        : `${axisName} Bhakoot, and no cancellation applies.`,
  };
}

function calcNadi(boy: MatchInput, girl: MatchInput): KootaScore {
  const nb = NAKSHATRA_NADI[boy.moonNakshatra], ng = NAKSHATRA_NADI[girl.moonNakshatra];
  const sameNadi = nb === ng;

  const sameRashi = boy.moonRashi === girl.moonRashi;
  const sameNakshatra = boy.moonNakshatra === girl.moonNakshatra;
  const samePada = boy.moonPada != null && girl.moonPada != null && boy.moonPada === girl.moonPada;
  const nakLordsFriendly = boy.moonNakshatraLord != null && girl.moonNakshatraLord != null
    && mutualFriends(boy.moonNakshatraLord, girl.moonNakshatraLord);

  // Each classical route out of Nadi dosha needs the pair to differ on the other
  // axis — "same rashi" only cancels when the nakshatras are actually different.
  const routes: string[] = [];
  if (sameRashi && !sameNakshatra) routes.push('the Moons share a rashi but sit in different nakshatras');
  if (sameNakshatra && !sameRashi) routes.push('the Moons share a nakshatra but sit in different rashis');
  if (sameNakshatra && !samePada) routes.push('the Moons share a nakshatra but sit in different padas');
  if (nakLordsFriendly) routes.push('the nakshatra lords are mutual natural friends');

  const cancelled = sameNadi && routes.length > 0;
  const obtained = sameNadi && !cancelled ? 0 : 8;

  return {
    name: 'Nadi',
    obtained, max: 8,
    passed: obtained === 8,
    detail: { boyNadi: nb, girlNadi: ng, sameNadi, cancelled },
    reason: !sameNadi
      ? `${nb} (${NADI_HUMOUR[nb]}) and ${ng} (${NADI_HUMOUR[ng]}) — different nadi, the full 8 points.`
      : cancelled
        ? `Both ${nb} nadi, but Nadi dosha is cancelled: ${routes[0]}.`
        : `Both ${nb} (${NADI_HUMOUR[nb]}) nadi and no cancellation applies — Nadi dosha stands. ` +
          'This is the heaviest single koota, 8 of 36 points.',
  };
}

// ─── Layer 1 entry point ─────────────────────────────────────────────────────

export interface GunaMilanDetail extends GunaMilanResult {
  yoni: YoniDetail;
}

export function computeGunaMilan(boy: MatchInput, girl: MatchInput): GunaMilanDetail {
  const yoni = calcYoni(boy, girl);
  const kootas: KootaScore[] = [
    calcVarna(boy, girl),
    calcVashya(boy, girl),
    calcTara(boy, girl),
    yoni.koota,
    calcGrahaMaitri(boy, girl),
    calcGana(boy, girl),
    calcBhakoot(boy, girl),
    calcNadi(boy, girl),
  ];
  const total = Math.round(kootas.reduce((s, k) => s + k.obtained, 0) * 2) / 2;

  const flags: string[] = [];
  if (yoni.detail.genderInverted) {
    flags.push(
      'Yoni gender polarity is inverted (the female party’s yoni is male and the male party’s female). ' +
      'Classical commentary reads this as a dominance inversion. It carries no numeric weight.',
    );
  }

  return {
    kootas,
    total,
    gate: total >= GUNA_GATE_THRESHOLD ? 'GATE_PASS' : 'GATE_FAIL',
    flags,
    yoni: yoni.detail,
  };
}

// ─── Layer 2: doshas ─────────────────────────────────────────────────────────

/** Houses from a reference point in which Mars is held to cause Kuja dosha. */
const KUJA_HOUSES = [1, 2, 4, 7, 8, 12];

/**
 * Signs in which Kuja dosha does not apply, per afflicted house. A Mars in the
 * 7th in Makara or Kataka is exempt; the same Mars elsewhere is not.
 */
const KUJA_SIGN_EXEMPT: Record<number, number[]> = {
  2:  [2, 5],    // Mithuna, Kanya
  4:  [0, 7],    // Mesha, Vrischika
  7:  [9, 3],    // Makara, Kataka
  8:  [8, 11],   // Dhanu, Meena
  12: [1, 6],    // Vrishabha, Tula
};

export type ManglikSeverity = 'none' | 'mild' | 'moderate' | 'strong';

export interface ManglikDetail {
  isManglik: boolean;
  /** How many of the three reference points (Lagna, Moon, Venus) are afflicted. */
  intensity: number;
  severity: ManglikSeverity;
  fromLagna: boolean;
  fromMoon: boolean;
  fromVenus: boolean;
  /** Mars's house from each reference; 0 when the reference is unknown. */
  houses: { lagna: number; moon: number; venus: number };
  /** Classical exemptions (Kuja Dosha Bhanga) that apply to this chart alone. */
  cancellations: string[];
  /** Sign-based exemptions that suppressed a reference point outright. */
  exemptions: string[];
}

function signDistance(from: number, to: number): number {
  return ((to - from + 12) % 12) + 1;
}

/**
 * Kuja (Mangal) dosha, graded rather than binary.
 *
 * Three reference points are checked independently — the Lagna, the Moon and
 * Venus — because Mars afflicting from all three is materially different from
 * Mars afflicting from one, and a boolean cannot say which.
 */
export function analyseManglik(m: MatchInput): ManglikDetail {
  const rashis = m.planetRashis;
  const marsRashi = rashis?.Mars;
  const venusRashi = rashis?.Venus;
  const jupiterRashi = rashis?.Jupiter;
  const saturnRashi = rashis?.Saturn;

  const venusHouse = marsRashi != null && venusRashi != null ? signDistance(venusRashi, marsRashi) : 0;
  const houses = { lagna: m.marsHouseFromLagna, moon: m.marsHouseFromMoon, venus: venusHouse };

  // A sign exemption removes the affliction from that reference point entirely,
  // so it must be applied before counting intensity rather than as a mitigation
  // afterwards — otherwise an exempt Mars still reads as afflicted.
  const exemptions: string[] = [];
  const afflicts = (house: number, label: string): boolean => {
    if (!KUJA_HOUSES.includes(house)) return false;
    if (marsRashi != null && (KUJA_SIGN_EXEMPT[house] ?? []).includes(marsRashi)) {
      exemptions.push(`Mars in the ${house}th from ${label} is sign-exempt in this rashi.`);
      return false;
    }
    return true;
  };

  const fromLagna = afflicts(houses.lagna, 'the Ascendant');
  const fromMoon = afflicts(houses.moon, 'the Moon');
  const fromVenus = afflicts(houses.venus, 'Venus');
  const intensity = [fromLagna, fromMoon, fromVenus].filter(Boolean).length;

  const cancellations: string[] = [];
  if (marsRashi != null) {
    if (marsRashi === 0 || marsRashi === 7) {
      cancellations.push('Mars is in its own sign, which classical texts treat as voiding the dosha.');
    } else if (marsRashi === 9) {
      cancellations.push('Mars is exalted, so it acts constructively rather than destructively.');
    } else if (marsRashi === 3) {
      cancellations.push('Mars is debilitated, which substantially reduces its capacity to afflict.');
    }
    for (const [name, rashi] of [['Jupiter', jupiterRashi], ['Saturn', saturnRashi]] as const) {
      if (rashi == null) continue;
      if (rashi === marsRashi) {
        cancellations.push(`${name} sits with Mars, the classical neutraliser of this dosha.`);
      } else if (name === 'Jupiter' && [5, 7, 9].includes(signDistance(rashi, marsRashi))) {
        cancellations.push('Jupiter aspects Mars, which classical practice treats as cancelling the dosha.');
      } else if (name === 'Saturn' && [3, 7, 10].includes(signDistance(rashi, marsRashi))) {
        cancellations.push('Saturn aspects Mars, which classical practice treats as cancelling the dosha.');
      }
    }
    for (const node of ['Rahu', 'Ketu'] as const) {
      if (rashis?.[node] === marsRashi) {
        cancellations.push(`Mars is conjunct ${node}, which several authorities treat as reducing the dosha.`);
        break;
      }
    }
  }

  const isManglik = intensity > 0;
  let severity: ManglikSeverity = 'none';
  if (isManglik) {
    severity = intensity >= 3 ? 'strong' : intensity === 2 ? 'moderate' : 'mild';
    for (let i = 0; i < cancellations.length && severity !== 'mild'; i++) {
      severity = severity === 'strong' ? 'moderate' : 'mild';
    }
  }

  return { isManglik, intensity, severity, fromLagna, fromMoon, fromVenus, houses, cancellations, exemptions };
}

function refList(d: ManglikDetail): string {
  const refs = [d.fromLagna && 'the Ascendant', d.fromMoon && 'the Moon', d.fromVenus && 'Venus']
    .filter(Boolean) as string[];
  if (refs.length === 0) return '';
  if (refs.length === 1) return refs[0];
  return `${refs.slice(0, -1).join(', ')} and ${refs[refs.length - 1]}`;
}

/** Per-chart dosha list. Computed for one chart, without reference to the other. */
export interface ChartDoshas {
  manglik: ManglikDetail;
  doshas: DoshaResult[];
  /** Worst severity across this chart's doshas. */
  netSeverity: DoshaSeverity;
}

export function analyseChartDoshas(m: MatchInput): ChartDoshas {
  const manglik = analyseManglik(m);
  const doshas: DoshaResult[] = [];

  const severity: DoshaSeverity = !manglik.isManglik
    ? 'none'
    : manglik.cancellations.length > 0 ? 'mitigated' : 'active';

  doshas.push({
    name: 'Kuja (Mangal) Dosha',
    present: manglik.isManglik,
    mitigated: severity === 'mitigated',
    severity,
    description: !manglik.isManglik
      ? 'Mars avoids the afflicting houses from the Ascendant, the Moon and Venus' +
        (manglik.exemptions.length ? `, once sign exemptions are applied: ${manglik.exemptions.join(' ')}` : '.')
      : `Mars afflicts from ${refList(manglik)} (${manglik.intensity} of 3 reference points, ${manglik.severity}).` +
        (manglik.cancellations.length ? ` Mitigated: ${manglik.cancellations.join(' ')}` : ' No cancellation applies.') +
        (manglik.exemptions.length ? ` Sign exemptions applied: ${manglik.exemptions.join(' ')}` : ''),
  });

  // Shrapit yoga — Saturn conjunct Rahu. Relevant to marriage when it falls in
  // or aspects the 7th, so the house is part of the test rather than a footnote.
  const rashis = m.planetRashis;
  if (rashis?.Saturn != null && rashis?.Rahu != null && m.ascendantRashi != null) {
    const conjunct = rashis.Saturn === rashis.Rahu;
    if (conjunct) {
      const house = signDistance(m.ascendantRashi, rashis.Saturn);
      const touchesSeventh = house === 7 || signDistance(rashis.Saturn, (m.ascendantRashi + 6) % 12) === 7;
      doshas.push({
        name: 'Shrapit Yoga',
        present: touchesSeventh,
        mitigated: false,
        severity: touchesSeventh ? 'active' : 'none',
        description: touchesSeventh
          ? `Saturn is conjunct Rahu in the ${house}th and the combination reaches the 7th — a karmic weight on partnership.`
          : `Saturn is conjunct Rahu in the ${house}th, away from the 7th, so it does not bear on marriage directly.`,
      });
    }
  }

  // A node in the 7th is deliberately NOT emitted here. It is a well attested
  // affliction but not a classically named dosha, and promoting it to one makes
  // every such chart read as carrying an active dosha — which then survives
  // mutual Kuja cancellation and reports a mitigated pair as afflicted. It
  // belongs to Layer 3, where the 7th house's occupants are already assessed.

  const order: DoshaSeverity[] = ['none', 'mitigated', 'active'];
  const netSeverity = doshas.reduce<DoshaSeverity>(
    (worst, d) => (order.indexOf(d.severity) > order.indexOf(worst) ? d.severity : worst), 'none');

  return { manglik, doshas, netSeverity };
}

/**
 * Mutual Kuja cancellation — the pair-level rule. Both charts carrying the dosha
 * is the classical cancellation; a one-sided dosha is only mitigated by that
 * chart's own exemptions.
 */
export function mutualKujaCancellation(a: ManglikDetail, b: ManglikDetail): {
  applies: boolean;
  description: string;
} {
  const both = a.isManglik && b.isManglik;
  return {
    applies: both,
    description: both
      ? `Both charts carry Kuja dosha (${a.severity} and ${b.severity}), which classical practice treats as mutual cancellation — ` +
        'neither party is overwhelmed by the other’s Mars.'
      : a.isManglik || b.isManglik
        ? 'Only one chart carries Kuja dosha, so mutual cancellation does not apply. ' +
          'Any mitigation has to come from that chart’s own exemptions.'
        : 'Neither chart carries Kuja dosha.',
  };
}
