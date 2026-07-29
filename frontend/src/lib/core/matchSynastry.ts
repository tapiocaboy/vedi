/**
 * Layer 4 — synastry. What happens when these two specific charts are overlaid.
 *
 * The layer with the highest diagnostic value, and the one almost universally
 * absent from matching engines. Two properties of it resist the usual shortcuts.
 *
 * **It is directional.** A onto B is not B onto A. One party's Moon landing on
 * the other's ascendant while the reciprocal Moon lands in the 6th is a
 * structurally non-mutual relationship, and no symmetric compatibility value can
 * represent it — so two directed edge sets are computed and stored, never one
 * blended figure. When the two sets disagree in net valence, that disagreement is
 * usually the single most informative thing the engine has to say.
 *
 * **Contacts are not binary.** A conjunction at 0°30' and one at 8° are not the
 * same event. Without orb decay the rule engine fires on almost every pair and
 * the output stops meaning anything, so every contact carries a Gaussian
 * strength and anything below the floor is discarded rather than reported weakly.
 */

import { RASHI_LORDS } from './planetaryAnalysis';
import { RASHI_ENGLISH } from './rashi';
import type { MatchInput } from './matching';

export type ContactWeight = 'highest' | 'high' | 'medium-high' | 'medium' | 'low-medium';

/** Numeric weight per class, for ranking and for the net-valence comparison. */
const WEIGHT_VALUE: Record<ContactWeight, number> = {
  'highest': 1.0, 'high': 0.75, 'medium-high': 0.6, 'medium': 0.45, 'low-medium': 0.3,
};

export interface SynastryContact {
  /** 'a-to-b' means A's graha evaluated in B's chart. */
  direction: 'a-to-b' | 'b-to-a';
  /** The moving party's graha. */
  graha: string;
  /** What it contacts in the receiving chart. */
  target: string;
  type: string;
  weight: ContactWeight;
  /** Separation in degrees, for degree-based contacts. */
  orb: number | null;
  /** Gaussian decay 0–1. House-based contacts score 1 (whole-sign, no orb). */
  strength: number;
  /** Positive, negative or neutral for the relationship. */
  valence: 'supportive' | 'adverse' | 'neutral';
  interpretation: string;
}

export interface DirectedEdges {
  contacts: SynastryContact[];
  /** Sum of signed weight × strength. Compared across directions, not published alone. */
  netValence: number;
}

export interface SynastryResult {
  aToB: DirectedEdges;
  bToA: DirectedEdges;
  /** The three strongest contacts overall — the defining contacts of the pair. */
  defining: SynastryContact[];
  /** True when the two directed sets differ materially in net valence. */
  asymmetric: boolean;
  summary: string;
}

/** Sigma for the Gaussian, by contact class. Tighter for the decisive contacts. */
const SIGMA = {
  nodeToSeventhLord: 3.0,
  toAscendantDegree: 4.0,
  luminary: 5.0,
  general: 6.0,
};

/** Contacts weaker than this are dropped, not reported faintly. */
const STRENGTH_FLOOR = 0.15;

/** How far apart the two directions must sit before the pair reads non-mutual. */
const ASYMMETRY_THRESHOLD = 0.5;

function decay(orb: number, sigma: number): number {
  return Math.exp(-Math.pow(orb / sigma, 2));
}

/** Shortest angular separation between two longitudes, 0–180. */
function separation(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

const VALENCE_SIGN = { supportive: 1, adverse: -1, neutral: 0 };
const NODES = ['Rahu', 'Ketu'];
const BENEFICS = ['Jupiter', 'Venus', 'Mercury', 'Moon'];

/**
 * One direction of the overlay: `mover`'s grahas read in `receiver`'s chart.
 */
function edgesFor(
  mover: MatchInput,
  receiver: MatchInput,
  direction: SynastryContact['direction'],
): DirectedEdges {
  const contacts: SynastryContact[] = [];
  const mRashis = mover.planetRashis;
  const mLons = mover.planetLongitudes;
  const rRashis = receiver.planetRashis;
  const rAsc = receiver.ascendantRashi;
  const rAscLon = receiver.ascendantLongitude;
  if (!mRashis || !rRashis || rAsc == null) return { contacts, netValence: 0 };

  const houseOf = (r: number) => ((r - rAsc + 12) % 12) + 1;
  const seventhRashi = (rAsc + 6) % 12;
  const seventhLord = RASHI_LORDS[seventhRashi];
  const seventhLordRashi = rRashis[seventhLord];
  const seventhLordLon = receiver.planetLongitudes?.[seventhLord];

  const push = (c: Omit<SynastryContact, 'direction'>) => {
    if (c.strength >= STRENGTH_FLOOR) contacts.push({ ...c, direction });
  };

  for (const [graha, rashi] of Object.entries(mRashis)) {
    const lon = mLons?.[graha];
    const house = houseOf(rashi);

    // ── Node on the partner's 7th lord — the heaviest single contact ──
    if (NODES.includes(graha) && seventhLordRashi === rashi) {
      const orb = lon != null && seventhLordLon != null ? separation(lon, seventhLordLon) : null;
      push({
        graha, target: `${seventhLord} (7th lord)`, type: 'node on 7th lord',
        weight: 'highest', orb,
        strength: orb != null ? decay(orb, SIGMA.nodeToSeventhLord) : 1,
        valence: 'adverse',
        interpretation:
          `${graha} falls on the partnership significator ${seventhLord}. ` +
          (graha === 'Rahu'
            ? 'Rahu here binds obsessively — the marriage significator is amplified and distorted rather than supported.'
            : 'Ketu here dissolves — attachment to the marriage significator thins out rather than deepens.'),
      });
    }

    // ── Node on the partner's ascendant degree ──
    if (NODES.includes(graha) && rashi === rAsc) {
      const orb = lon != null && rAscLon != null ? separation(lon, rAscLon) : null;
      push({
        graha, target: 'Ascendant', type: 'node on ascendant',
        weight: 'highest', orb,
        strength: orb != null ? decay(orb, SIGMA.toAscendantDegree) : 1,
        valence: 'adverse',
        interpretation: `${graha} sits on the partner's ascendant — distortion at the level of identity rather than of circumstance.`,
      });
    }

    // ── Moon on the partner's ascendant ──
    if (graha === 'Moon' && rashi === rAsc) {
      const orb = lon != null && rAscLon != null ? separation(lon, rAscLon) : null;
      push({
        graha, target: 'Ascendant', type: 'Moon on ascendant',
        weight: 'high', orb,
        strength: orb != null ? decay(orb, SIGMA.toAscendantDegree) : 1,
        valence: 'supportive',
        interpretation: 'The Moon on the partner’s ascendant — strong attraction, and it is felt as recognition rather than novelty.',
      });
    }

    // ── Saturn on the partner's Moon or Venus ──
    if (graha === 'Saturn') {
      for (const target of ['Moon', 'Venus']) {
        if (rRashis[target] !== rashi) continue;
        const tLon = receiver.planetLongitudes?.[target];
        const orb = lon != null && tLon != null ? separation(lon, tLon) : null;
        push({
          graha, target, type: 'Saturn on Moon/Venus',
          weight: 'high', orb,
          strength: orb != null ? decay(orb, SIGMA.general) : 1,
          valence: 'adverse',
          interpretation: `Saturn lands on the partner's ${target} — suppression and cooling, felt as duty in place of ease.`,
        });
      }
    }

    // ── Mover's graha in the receiver's dusthanas ──
    if ([6, 8, 12].includes(house)) {
      push({
        graha, target: `${house}th house`, type: 'graha in dusthana',
        weight: 'high', orb: null, strength: 1,
        valence: 'adverse',
        interpretation:
          house === 6 ? `${graha} falls in the partner's 6th — friction and competition around what this graha governs.`
          : house === 8 ? `${graha} falls in the partner's 8th — concealment, and matters handled indirectly.`
          : `${graha} falls in the partner's 12th — loss and dissipation around this graha's themes.`,
      });
    }

    // ── 7th lord to 7th lord ──
    if (graha === RASHI_LORDS[((mover.ascendantRashi ?? 0) + 6) % 12] && rashi === seventhLordRashi) {
      push({
        graha, target: `${seventhLord} (7th lord)`, type: '7th lord to 7th lord',
        weight: 'medium-high', orb: null, strength: 1,
        valence: 'supportive',
        interpretation: 'Both partnership axes link directly — the two charts agree about what a partnership is for.',
      });
    }

    // ── Venus / Mars cross contact ──
    if ((graha === 'Venus' && rRashis.Mars === rashi) || (graha === 'Mars' && rRashis.Venus === rashi)) {
      const target = graha === 'Venus' ? 'Mars' : 'Venus';
      const tLon = receiver.planetLongitudes?.[target];
      const orb = lon != null && tLon != null ? separation(lon, tLon) : null;
      push({
        graha, target, type: 'Venus–Mars cross contact',
        weight: 'medium', orb,
        strength: orb != null ? decay(orb, SIGMA.general) : 1,
        valence: 'supportive',
        interpretation: 'Venus and Mars meet across the two charts — straightforward physical attraction.',
      });
    }

    // ── Luminary to luminary ──
    if ((graha === 'Sun' || graha === 'Moon')) {
      for (const target of ['Sun', 'Moon']) {
        if (rRashis[target] !== rashi) continue;
        const tLon = receiver.planetLongitudes?.[target];
        const orb = lon != null && tLon != null ? separation(lon, tLon) : null;
        push({
          graha, target, type: 'luminary to luminary',
          weight: 'medium', orb,
          strength: orb != null ? decay(orb, SIGMA.luminary) : 1,
          valence: 'supportive',
          interpretation: `${graha} meets the partner's ${target} — baseline compatibility of will and feeling.`,
        });
      }
    }

    // ── Jupiter to the partner's Moon or ascendant ──
    if (graha === 'Jupiter' && (rRashis.Moon === rashi || rashi === rAsc)) {
      const target = rRashis.Moon === rashi ? 'Moon' : 'Ascendant';
      const tLon = target === 'Moon' ? receiver.planetLongitudes?.Moon : rAscLon;
      const orb = lon != null && tLon != null ? separation(lon, tLon) : null;
      push({
        graha, target, type: 'Jupiter to Moon/ascendant',
        weight: 'medium', orb,
        strength: orb != null ? decay(orb, SIGMA.general) : 1,
        valence: 'supportive',
        interpretation: `Jupiter reaches the partner's ${target} — protective and expansive, the contact that carries a couple through bad years.`,
      });
    }

    // ── Benefic in a supportive house ──
    if (BENEFICS.includes(graha) && [1, 5, 7, 9, 11].includes(house)) {
      push({
        graha, target: `${house}th house`, type: 'benefic in supportive house',
        weight: 'low-medium', orb: null, strength: 1,
        valence: 'supportive',
        interpretation: `${graha} falls in the partner's ${house}th — generally supportive.`,
      });
    }
  }

  const netValence = contacts.reduce(
    (sum, c) => sum + VALENCE_SIGN[c.valence] * WEIGHT_VALUE[c.weight] * c.strength, 0);

  contacts.sort((x, y) => WEIGHT_VALUE[y.weight] * y.strength - WEIGHT_VALUE[x.weight] * x.strength);
  return { contacts, netValence: Math.round(netValence * 1000) / 1000 };
}

export function computeSynastry(a: MatchInput, b: MatchInput): SynastryResult {
  const aToB = edgesFor(a, b, 'a-to-b');
  const bToA = edgesFor(b, a, 'b-to-a');

  const defining = [...aToB.contacts, ...bToA.contacts]
    .sort((x, y) => WEIGHT_VALUE[y.weight] * y.strength - WEIGHT_VALUE[x.weight] * x.strength)
    .slice(0, 3);

  const asymmetric = Math.abs(aToB.netValence - bToA.netValence) >= ASYMMETRY_THRESHOLD;

  const lead = defining[0];
  const summary = [
    lead
      ? `The defining contact is ${lead.graha} → ${lead.target} (${lead.type}` +
        `${lead.orb != null ? `, orb ${formatOrb(lead.orb)}` : ''}, strength ${lead.strength.toFixed(2)}). ${lead.interpretation}`
      : 'No contact clears the strength floor — the two charts barely touch, which is itself unusual.',
    asymmetric
      ? `The overlay is non-mutual: one direction reads ${aToB.netValence.toFixed(2)} and the other ${bToA.netValence.toFixed(2)}. ` +
        'One party is receiving a materially different relationship from the one they are giving, and a symmetric score cannot show that.'
      : 'The two directions read similarly, so the overlay is broadly mutual.',
  ].join(' ');

  return { aToB, bToA, defining, asymmetric, summary };
}

/** "1°31'" — orbs are conventionally read in degrees and minutes. */
export function formatOrb(orb: number): string {
  const deg = Math.floor(orb);
  const min = Math.round((orb - deg) * 60);
  return min === 60 ? `${deg + 1}°00'` : `${deg}°${String(min).padStart(2, '0')}'`;
}

/** Rashi name helper for callers rendering contacts. */
export function rashiLabel(rashi: number): string {
  return RASHI_ENGLISH[rashi];
}
