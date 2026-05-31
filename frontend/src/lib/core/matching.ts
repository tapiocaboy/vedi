/**
 * Horoscope matching — Ashtakoot Milan (Guna Milan) + key doshas.
 *
 * Classical Vedic compatibility scoring from BPHS / Muhurta texts. Eight
 * "kootas" each contribute a weighted score; the total is out of 36.
 *
 *   Varna        1  — spiritual / temperament caste
 *   Vashya       2  — influence and attraction
 *   Tara         3  — birth-star destiny harmony
 *   Yoni         4  — physical / sexual compatibility
 *   Graha Maitri 5  — friendship of the Moon-sign lords
 *   Gana         6  — temperament (Deva / Manushya / Rakshasa)
 *   Bhakoot      7  — emotional and family compatibility
 *   Nadi         8  — health / genetic / progeny
 *
 * In addition: Mangal (Manglik) Dosha check, Bhakoot Dosha, Nadi Dosha.
 *
 * Inputs to the matcher are rashi (0–11) + nakshatra (0–26) for Moon, plus
 * Mars's house from Lagna and from Moon. These are easy to obtain from the
 * existing planet-positions output.
 */

// ─── Inputs ──────────────────────────────────────────────────────────────────

export interface MatchInput {
  moonRashi: number;          // 0–11
  moonNakshatra: number;      // 0–26
  marsHouseFromLagna: number; // 1–12 (or 0 if unknown)
  marsHouseFromMoon: number;  // 1–12
}

export interface KootaScore {
  name: string;
  obtained: number;
  max: number;
  passed: boolean;
  reason: string;
}

export interface DoshaResult {
  name: string;
  present: boolean;
  mitigated: boolean;
  description: string;
}

export interface MatchReport {
  totalObtained: number;
  totalMax: 36;
  percent: number;
  verdict: 'excellent' | 'very good' | 'good' | 'acceptable' | 'not recommended';
  kootas: KootaScore[];
  doshas: DoshaResult[];
  /** Bullet points — what makes this pairing work. */
  whyMatching: string[];
  /** Bullet points — friction or concerns. */
  whyNotMatching: string[];
}

// ─── Reference tables ────────────────────────────────────────────────────────

// 1. Varna — rashi → caste rank (4 highest). Elements: Water=Brahmin, Fire=Kshatriya, Earth=Vaishya, Air=Shudra.
const VARNA_RANK: number[] = [3, 2, 1, 4, 3, 2, 1, 4, 3, 2, 1, 4]; // Aries Tau Gem Can Leo Vir Lib Sco Sag Cap Aqu Pis
const VARNA_NAME: Record<number, string> = { 4: 'Brahmin', 3: 'Kshatriya', 2: 'Vaishya', 1: 'Shudra' };

// 2. Vashya — rashi → vashya category.
type Vashya = 'Chatushpada' | 'Manava' | 'Jalachara' | 'Vanachara' | 'Keeta';
const VASHYA: Vashya[] = [
  'Chatushpada','Chatushpada','Manava','Jalachara','Vanachara','Manava',
  'Manava','Keeta','Manava','Jalachara','Manava','Jalachara',
];

// Vashya friendship table — bidirectional. Pairs that "control" each other.
const VASHYA_FRIENDS: Record<Vashya, Vashya[]> = {
  Chatushpada: ['Chatushpada', 'Manava'],
  Manava:      ['Manava', 'Chatushpada', 'Jalachara'],
  Jalachara:   ['Jalachara', 'Manava'],
  Vanachara:   ['Vanachara'],
  Keeta:       ['Keeta', 'Jalachara'],
};

// 3. Tara — auspicious tara numbers (1 = Janma).
const AUSPICIOUS_TARA = new Set([2, 4, 6, 8, 9]); // Sampat, Kshema, Sadhaka, Mitra, Ati-mitra

// 4. Yoni — nakshatra → animal symbol.
const NAKSHATRA_YONI: string[] = [
  'Horse','Elephant','Sheep','Snake','Snake','Dog','Cat','Sheep','Cat',
  'Rat','Rat','Cow','Buffalo','Tiger','Buffalo','Tiger','Hare','Hare',
  'Dog','Monkey','Mongoose','Monkey','Lion','Horse','Lion','Cow','Elephant',
];

// Mortal enemies — score 0. Anything not paired here that isn't same yoni = neutral 2.
const YONI_ENEMIES: Record<string, string> = {
  Horse:'Buffalo', Elephant:'Lion', Sheep:'Monkey', Snake:'Mongoose',
  Dog:'Hare', Cat:'Rat', Cow:'Tiger',
};
function yoniScore(a: string, b: string): { score: number; note: string } {
  if (a === b) return { score: 4, note: `both ${a} yoni — best physical resonance` };
  if (YONI_ENEMIES[a] === b || YONI_ENEMIES[b] === a) return { score: 0, note: `${a}/${b} are inimical yonis — friction in intimacy` };
  return { score: 2, note: `${a} and ${b} yonis — neutral pairing` };
}

// 5. Graha Maitri — rashi lord per rashi.
const RASHI_LORD: string[] = [
  'Mars','Venus','Mercury','Moon','Sun','Mercury',
  'Venus','Mars','Jupiter','Saturn','Saturn','Jupiter',
];
const PLANET_FRIENDS: Record<string, string[]> = {
  Sun: ['Moon','Mars','Jupiter'],   Moon: ['Sun','Mercury'],
  Mars: ['Sun','Moon','Jupiter'],   Mercury: ['Sun','Venus'],
  Jupiter: ['Sun','Moon','Mars'],   Venus: ['Mercury','Saturn'],
  Saturn: ['Mercury','Venus'],
};
const PLANET_ENEMIES: Record<string, string[]> = {
  Sun: ['Venus','Saturn'],   Moon: [],
  Mars: ['Mercury'],         Mercury: ['Moon'],
  Jupiter: ['Mercury','Venus'], Venus: ['Sun','Moon'],
  Saturn: ['Sun','Moon','Mars'],
};
function planetRelation(a: string, b: string): 'friend' | 'enemy' | 'neutral' | 'same' {
  if (a === b) return 'same';
  const aF = PLANET_FRIENDS[a] ?? [], aE = PLANET_ENEMIES[a] ?? [];
  if (aF.includes(b)) return 'friend';
  if (aE.includes(b)) return 'enemy';
  return 'neutral';
}

// 6. Gana — nakshatra → temperament.
type Gana = 'Deva' | 'Manushya' | 'Rakshasa';
const NAKSHATRA_GANA: Gana[] = [
  'Deva','Manushya','Rakshasa','Manushya','Deva','Manushya','Deva','Deva',
  'Rakshasa','Rakshasa','Manushya','Manushya','Deva','Rakshasa','Deva',
  'Rakshasa','Deva','Rakshasa','Rakshasa','Manushya','Manushya','Deva',
  'Rakshasa','Rakshasa','Manushya','Manushya','Deva',
];

// 8. Nadi — nakshatra → nadi (humour).
type Nadi = 'Adi' | 'Madhya' | 'Antya';
const NAKSHATRA_NADI: Nadi[] = [
  'Adi','Madhya','Antya','Antya','Madhya','Adi','Adi','Madhya','Antya',
  'Antya','Madhya','Adi','Adi','Madhya','Antya','Antya','Madhya','Adi',
  'Adi','Madhya','Antya','Antya','Madhya','Adi','Adi','Madhya','Antya',
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function modCount(from: number, to: number, mod = 12): number {
  return ((to - from + mod) % mod) + 1;
}
function rashiDistance(a: number, b: number): number {
  // Both directions; we care about both for Bhakoot.
  return modCount(a, b);
}

// ─── Koota calculations ─────────────────────────────────────────────────────

function calcVarna(a: MatchInput, b: MatchInput): KootaScore {
  const ra = VARNA_RANK[a.moonRashi], rb = VARNA_RANK[b.moonRashi];
  // Classical: 1 point if A's varna ≥ B's varna.
  const obtained = ra >= rb ? 1 : 0;
  return {
    name: 'Varna',
    obtained, max: 1,
    passed: obtained === 1,
    reason: `Person A is ${VARNA_NAME[ra]}, Person B is ${VARNA_NAME[rb]}. ${obtained ? 'Compatible spiritual disposition.' : "Partner's varna is higher than A's — classical caution."}`,
  };
}

function calcVashya(a: MatchInput, b: MatchInput): KootaScore {
  const va = VASHYA[a.moonRashi], vb = VASHYA[b.moonRashi];
  let obtained = 0;
  if (va === vb) obtained = 2;
  else if ((VASHYA_FRIENDS[va] ?? []).includes(vb) && (VASHYA_FRIENDS[vb] ?? []).includes(va)) obtained = 1;
  else if ((VASHYA_FRIENDS[va] ?? []).includes(vb) || (VASHYA_FRIENDS[vb] ?? []).includes(va)) obtained = 0.5;
  return {
    name: 'Vashya',
    obtained, max: 2,
    passed: obtained >= 1,
    reason: `A's vashya: ${va}; B's vashya: ${vb}. ${obtained === 2 ? 'Same vashya — natural mutual influence.' : obtained >= 1 ? 'Compatible vashyas.' : obtained > 0 ? 'Partial influence.' : 'Vashyas do not align — neither person sways the other naturally.'}`,
  };
}

function calcTara(a: MatchInput, b: MatchInput): KootaScore {
  const aToB = ((b.moonNakshatra - a.moonNakshatra + 27) % 27) + 1;
  const bToA = ((a.moonNakshatra - b.moonNakshatra + 27) % 27) + 1;
  const taraA = ((aToB - 1) % 9) + 1;
  const taraB = ((bToA - 1) % 9) + 1;
  const ok1 = AUSPICIOUS_TARA.has(taraA);
  const ok2 = AUSPICIOUS_TARA.has(taraB);
  const obtained = (ok1 && ok2) ? 3 : (ok1 || ok2) ? 1.5 : 0;
  return {
    name: 'Tara',
    obtained, max: 3,
    passed: obtained >= 1.5,
    reason: `Tara A→B = ${taraA} (${ok1 ? 'auspicious' : 'inauspicious'}), Tara B→A = ${taraB} (${ok2 ? 'auspicious' : 'inauspicious'}). ${obtained === 3 ? 'Birth stars support both directions.' : obtained > 0 ? 'One direction is auspicious.' : 'Neither direction is auspicious — energetic friction in the destiny channel.'}`,
  };
}

function calcYoni(a: MatchInput, b: MatchInput): KootaScore {
  const ya = NAKSHATRA_YONI[a.moonNakshatra], yb = NAKSHATRA_YONI[b.moonNakshatra];
  const { score, note } = yoniScore(ya, yb);
  return {
    name: 'Yoni',
    obtained: score, max: 4,
    passed: score >= 2,
    reason: note,
  };
}

function calcGrahaMaitri(a: MatchInput, b: MatchInput): KootaScore {
  const la = RASHI_LORD[a.moonRashi], lb = RASHI_LORD[b.moonRashi];
  const rAB = planetRelation(la, lb);
  const rBA = planetRelation(lb, la);
  let obtained = 0;
  if (rAB === 'same' || (rAB === 'friend' && rBA === 'friend')) obtained = 5;
  else if ((rAB === 'friend' && rBA === 'neutral') || (rAB === 'neutral' && rBA === 'friend')) obtained = 4;
  else if (rAB === 'neutral' && rBA === 'neutral') obtained = 3;
  else if ((rAB === 'friend' && rBA === 'enemy') || (rAB === 'enemy' && rBA === 'friend')) obtained = 1;
  else if ((rAB === 'neutral' && rBA === 'enemy') || (rAB === 'enemy' && rBA === 'neutral')) obtained = 0.5;
  else obtained = 0;
  return {
    name: 'Graha Maitri',
    obtained, max: 5,
    passed: obtained >= 3,
    reason: `Moon-sign lords: A=${la}, B=${lb}. Relationship: ${rAB}/${rBA}. ${obtained >= 4 ? 'Strong mental and intellectual rapport.' : obtained >= 3 ? 'Neutral but workable mental harmony.' : 'Mental harmony is strained — communication needs deliberate work.'}`,
  };
}

function calcGana(a: MatchInput, b: MatchInput): KootaScore {
  const ga = NAKSHATRA_GANA[a.moonNakshatra], gb = NAKSHATRA_GANA[b.moonNakshatra];
  let obtained = 0;
  if (ga === gb) obtained = 6;
  else if ((ga === 'Deva' && gb === 'Manushya') || (ga === 'Manushya' && gb === 'Deva')) obtained = 5;
  else if ((ga === 'Manushya' && gb === 'Rakshasa') || (ga === 'Rakshasa' && gb === 'Manushya')) obtained = 1;
  else obtained = 0; // Deva + Rakshasa
  return {
    name: 'Gana',
    obtained, max: 6,
    passed: obtained >= 5,
    reason: `Ganas: A=${ga}, B=${gb}. ${obtained === 6 ? 'Same temperament — easy emotional flow.' : obtained === 5 ? 'Compatible temperaments.' : obtained === 1 ? 'Tense temperament mix — periodic clashes likely.' : 'Opposed temperaments — fundamentally different worldviews.'}`,
  };
}

function calcBhakoot(a: MatchInput, b: MatchInput): KootaScore {
  const dAB = rashiDistance(a.moonRashi, b.moonRashi);
  const dBA = rashiDistance(b.moonRashi, a.moonRashi);
  const badPair =
    (dAB === 6 && dBA === 8) || (dAB === 8 && dBA === 6) ||
    (dAB === 2 && dBA === 12) || (dAB === 12 && dBA === 2) ||
    (dAB === 5 && dBA === 9) || (dAB === 9 && dBA === 5);
  const obtained = badPair ? 0 : 7;
  let reason = '';
  if (!badPair) reason = `Moon rashis ${a.moonRashi + 1} and ${b.moonRashi + 1} are at distances ${dAB}/${dBA} — no Bhakoot Dosha. Emotional and family harmony supported.`;
  else if ((dAB === 6 && dBA === 8) || (dAB === 8 && dBA === 6)) reason = 'Shadashtak (6-8) Bhakoot — risk of mutual harm, illness, financial strain.';
  else if ((dAB === 2 && dBA === 12) || (dAB === 12 && dBA === 2)) reason = 'Dwirdwadash (2-12) Bhakoot — wealth tension and emotional drain.';
  else reason = 'Nava-Pancham (5-9) Bhakoot — child/creativity friction; otherwise spiritually compatible.';
  return { name: 'Bhakoot', obtained, max: 7, passed: !badPair, reason };
}

function calcNadi(a: MatchInput, b: MatchInput): KootaScore {
  const na = NAKSHATRA_NADI[a.moonNakshatra], nb = NAKSHATRA_NADI[b.moonNakshatra];
  // Classical exception: same nakshatra OR same rashi cancels Nadi Dosha.
  const sameNakshatra = a.moonNakshatra === b.moonNakshatra;
  const sameRashi = a.moonRashi === b.moonRashi;
  const sameNadi = na === nb;
  const obtained = sameNadi && !sameNakshatra && !sameRashi ? 0 : 8;
  return {
    name: 'Nadi',
    obtained, max: 8,
    passed: obtained === 8,
    reason: sameNadi
      ? (sameNakshatra || sameRashi)
        ? `Both ${na} Nadi — but ${sameNakshatra ? 'same nakshatra' : 'same rashi'} cancels Nadi Dosha.`
        : `Both share ${na} Nadi — Nadi Dosha present. Classical concern for health and progeny; modern view considers other factors.`
      : `A: ${na} Nadi, B: ${nb} Nadi — different. Healthy genetic/constitutional balance.`,
  };
}

// ─── Doshas ──────────────────────────────────────────────────────────────────

function calcManglikDosha(a: MatchInput, b: MatchInput): DoshaResult {
  const isManglik = (m: MatchInput) =>
    [1, 4, 7, 8, 12].includes(m.marsHouseFromLagna) ||
    [1, 4, 7, 8, 12].includes(m.marsHouseFromMoon);
  const aM = isManglik(a), bM = isManglik(b);
  const present = aM || bM;
  const mitigated = aM === bM; // both or neither → cancel
  return {
    name: 'Mangal (Manglik) Dosha',
    present,
    mitigated,
    description: !present
      ? 'Neither person is Manglik — Mars is not in the harmful houses for either chart.'
      : aM && bM
        ? 'Both persons are Manglik — the dosha cancels out. Mars-driven energy is matched on both sides.'
        : `${aM ? 'Person A' : 'Person B'} is Manglik while the other is not — classical concern. Mitigation includes Mars-strengthening remedies and a delayed marriage.`,
  };
}

function bhakootDoshaFrom(score: KootaScore): DoshaResult {
  return {
    name: 'Bhakoot Dosha',
    present: !score.passed,
    mitigated: false,
    description: score.passed
      ? 'No Bhakoot Dosha — Moon rashis are favourably placed.'
      : score.reason,
  };
}

function nadiDoshaFrom(score: KootaScore): DoshaResult {
  return {
    name: 'Nadi Dosha',
    present: score.obtained === 0,
    mitigated: score.reason.includes('cancels'),
    description: score.reason,
  };
}

// ─── Main entry point ────────────────────────────────────────────────────────

function verdictFor(score: number): MatchReport['verdict'] {
  if (score >= 32) return 'excellent';
  if (score >= 28) return 'very good';
  if (score >= 24) return 'good';
  if (score >= 18) return 'acceptable';
  return 'not recommended';
}

export function computeMatch(a: MatchInput, b: MatchInput): MatchReport {
  const kootas: KootaScore[] = [
    calcVarna(a, b),
    calcVashya(a, b),
    calcTara(a, b),
    calcYoni(a, b),
    calcGrahaMaitri(a, b),
    calcGana(a, b),
    calcBhakoot(a, b),
    calcNadi(a, b),
  ];
  const total = kootas.reduce((s, k) => s + k.obtained, 0);

  const doshas: DoshaResult[] = [
    calcManglikDosha(a, b),
    bhakootDoshaFrom(kootas[6]),  // Bhakoot
    nadiDoshaFrom(kootas[7]),     // Nadi
  ];

  const whyMatching = kootas
    .filter(k => k.passed)
    .map(k => `${k.name} (${k.obtained}/${k.max}): ${k.reason}`);
  const whyNotMatching = kootas
    .filter(k => !k.passed)
    .map(k => `${k.name} (${k.obtained}/${k.max}): ${k.reason}`);
  for (const d of doshas) {
    if (d.present && !d.mitigated) whyNotMatching.push(`${d.name}: ${d.description}`);
    else if (!d.present || d.mitigated) whyMatching.push(`${d.name}: ${d.description}`);
  }

  return {
    totalObtained: Math.round(total * 2) / 2, // halves kept (e.g. 24.5)
    totalMax: 36,
    percent: Math.round((total / 36) * 100),
    verdict: verdictFor(total),
    kootas,
    doshas,
    whyMatching,
    whyNotMatching,
  };
}
