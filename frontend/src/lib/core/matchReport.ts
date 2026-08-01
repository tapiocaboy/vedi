/**
 * The four-layer compatibility report, and the conflict detections that are the
 * point of keeping the layers apart.
 *
 * Four independent layers, four independent verdicts, never collapsed into one
 * scalar. The information a couple most needs is *where the layers disagree* —
 * temperament aligning while structure does not, or an overlay that is adverse in
 * one direction and benign in the other — and averaging destroys precisely that.
 * A pair scoring high on Layer 1 and adverse on Layer 4 is a specific, meaningful,
 * explicable result; "82% compatible" is not, and cannot be recovered from.
 *
 * So there is no overall percentage here, and no single verdict. `conflicts` is
 * the most valuable field in the structure.
 */

import {
  computeGunaMilan, analyseChartDoshas, mutualKujaCancellation,
  type MatchInput, type GunaMilanDetail, type ChartDoshas, type DoshaSeverity,
} from './matching';
import { assessMarriagePromise, type MarriagePromise } from './matchPromise';
import { computeSynastry, type SynastryResult } from './matchSynastry';
import { computePoruthams, type PoruthamResult } from './matchPorutham';

export type ConflictCode =
  | 'layer1_strong_layer4_adverse'
  | 'layer1_weak_layer3_strong_both'
  | 'synastry_asymmetric'
  | 'dosha_mutual_cancel'
  | 'layer1_strong_layer3_weak'
  | 'rajju_vs_guna';

export interface Conflict {
  code: ConflictCode;
  /** What the disagreement is, in a sentence a reader can act on. */
  explanation: string;
}

export interface LayeredMatchReport {
  layer1Temperament: GunaMilanDetail;
  /**
   * The four Southern-tradition star checks Ashtakoot cannot see (Rajju, Vedha,
   * Mahendra, Stree-Deergha). Same layer as temperament — all read the Moon's
   * nakshatra — but kept separate because a failed Rajju is a headline result
   * in that tradition, not a deduction from a total.
   */
  poruthams: PoruthamResult;
  layer2Doshas: {
    a: ChartDoshas;
    b: ChartDoshas;
    mutualKuja: { applies: boolean; description: string };
    /** Net three-band severity per party, after mutual cancellation. */
    netA: DoshaSeverity;
    netB: DoshaSeverity;
  };
  layer3Promise: { a: MarriagePromise | null; b: MarriagePromise | null };
  layer4Synastry: SynastryResult;
  conflicts: Conflict[];
  /**
   * Written synthesis across the layers. Prose rather than a number, because the
   * whole point is that the layers do not reduce to one.
   */
  synthesis: string;
}

/** Above this the guna total counts as strong for conflict detection. */
const LAYER1_STRONG = 27;
/** Net valence below this makes an overlay adverse. */
const LAYER4_ADVERSE = -0.5;

const SEVERITY_ORDER: DoshaSeverity[] = ['none', 'mitigated', 'active'];
const worse = (x: DoshaSeverity, y: DoshaSeverity) =>
  SEVERITY_ORDER.indexOf(x) >= SEVERITY_ORDER.indexOf(y) ? x : y;

function promiseIsWeak(p: MarriagePromise | null): boolean {
  if (!p) return false;
  return p.dimensions.filter(d => d.band === 'testing').length
    > p.dimensions.filter(d => d.band === 'supportive').length;
}

function promiseIsStrong(p: MarriagePromise | null): boolean {
  if (!p) return false;
  return p.dimensions.filter(d => d.band === 'supportive').length
    > p.dimensions.filter(d => d.band === 'testing').length;
}

/**
 * `femaleA` / `femaleB` select Jupiter as patikaraka in Layer 3 and set the
 * boy/girl roles the asymmetric kootas need. They are explicit inputs because
 * three of the eight kootas give a different answer when the roles are swapped,
 * and guessing would silently change the score.
 */
export function buildLayeredReport(
  a: MatchInput,
  b: MatchInput,
  roles: { aIsFemale: boolean },
): LayeredMatchReport {
  // Layer 1's asymmetric tables are written boy-row, girl-column.
  const boy = roles.aIsFemale ? b : a;
  const girl = roles.aIsFemale ? a : b;
  const layer1Temperament = computeGunaMilan(boy, girl);
  const poruthams = computePoruthams(girl.moonNakshatra, boy.moonNakshatra);

  // Layer 2 is per chart, without reference to the other party.
  const doshaA = analyseChartDoshas(a);
  const doshaB = analyseChartDoshas(b);
  const mutualKuja = mutualKujaCancellation(doshaA.manglik, doshaB.manglik);

  // Mutual cancellation downgrades an active Kuja dosha to mitigated on both
  // sides. It does not touch the other doshas, which have no mutual rule.
  const applyMutual = (d: ChartDoshas): DoshaSeverity => {
    if (!mutualKuja.applies) return d.netSeverity;
    const others = d.doshas
      .filter(x => !x.name.startsWith('Kuja'))
      .reduce<DoshaSeverity>((w, x) => worse(w, x.severity), 'none');
    return worse(others, d.manglik.isManglik ? 'mitigated' : 'none');
  };

  const layer3Promise = {
    a: assessMarriagePromise(a, roles.aIsFemale),
    b: assessMarriagePromise(b, !roles.aIsFemale),
  };

  const layer4Synastry = computeSynastry(a, b);

  // ── Conflicts ──
  const conflicts: Conflict[] = [];
  const l1Strong = layer1Temperament.total >= LAYER1_STRONG;
  const l4Adverse = layer4Synastry.aToB.netValence <= LAYER4_ADVERSE
    || layer4Synastry.bToA.netValence <= LAYER4_ADVERSE;

  if (l1Strong && l4Adverse) {
    conflicts.push({
      code: 'layer1_strong_layer4_adverse',
      explanation:
        `Temperament aligns (${layer1Temperament.total}/36) but the chart overlay does not. ` +
        'The two of you are rhythmically compatible and structurally at odds — which is why a single ' +
        'compatibility figure would read well here and be wrong.',
    });
  }

  if (layer4Synastry.asymmetric) {
    conflicts.push({
      code: 'synastry_asymmetric',
      explanation:
        'The overlay is non-mutual: each party is receiving a different relationship from the one they are giving. ' +
        'Read the two directions separately below rather than looking for one answer.',
    });
  }

  if (mutualKuja.applies) {
    conflicts.push({
      code: 'dosha_mutual_cancel',
      explanation: mutualKuja.description,
    });
  }

  if (layer1Temperament.gate === 'GATE_FAIL' && promiseIsStrong(layer3Promise.a) && promiseIsStrong(layer3Promise.b)) {
    conflicts.push({
      code: 'layer1_weak_layer3_strong_both',
      explanation:
        `The koota total (${layer1Temperament.total}/36) falls below the classical gate, yet both charts are ` +
        'individually well disposed to marriage. Guna matching reads temperament only; on the layer that ' +
        'carries more predictive weight, both of you start from a good position.',
    });
  }

  if (poruthams.rajjuFailed && l1Strong) {
    conflicts.push({
      code: 'rajju_vs_guna',
      explanation:
        `The koota total is strong (${layer1Temperament.total}/36) but both Moons sit on the same rajju rope. ` +
        'A Southern-tradition matcher would flag this pairing on the Rajju check alone, whatever the point total says — ' +
        'the two systems genuinely disagree here, and both readings are given.',
    });
  }

  if (l1Strong && (promiseIsWeak(layer3Promise.a) || promiseIsWeak(layer3Promise.b))) {
    const which = promiseIsWeak(layer3Promise.a) && promiseIsWeak(layer3Promise.b) ? 'both charts'
      : promiseIsWeak(layer3Promise.a) ? 'the first chart' : 'the second chart';
    conflicts.push({
      code: 'layer1_strong_layer3_weak',
      explanation:
        `Temperament aligns, but ${which} carries a weak marriage promise independently of this pairing. ` +
        'That is a property of the chart rather than of the match, and it would show up against any partner.',
    });
  }

  // ── Synthesis ──
  const parts: string[] = [];
  parts.push(
    layer1Temperament.gate === 'GATE_PASS'
      ? `Temperament: ${layer1Temperament.total}/36, above the classical gate. This measures rhythmic fit between two Moons and nothing else.`
      : `Temperament: ${layer1Temperament.total}/36, below the classical gate of 18. On the traditional filter this pairing would not proceed to deeper analysis; the layers below are given anyway, because the filter reads one variable.`,
  );
  const netA = applyMutual(doshaA), netB = applyMutual(doshaB);
  parts.push(`Doshas: ${netA} on the first chart, ${netB} on the second.`);
  if (layer3Promise.a) parts.push(`First chart's own promise — ${layer3Promise.a.synthesis}`);
  if (layer3Promise.b) parts.push(`Second chart's own promise — ${layer3Promise.b.synthesis}`);
  parts.push(layer4Synastry.summary);
  if (conflicts.length) {
    parts.push(
      `${conflicts.length} cross-layer ${conflicts.length === 1 ? 'conflict was' : 'conflicts were'} detected. ` +
      'These are the most useful part of the report: they name where the layers disagree, which is exactly what a single score hides.',
    );
  }

  return {
    layer1Temperament,
    poruthams,
    layer2Doshas: { a: doshaA, b: doshaB, mutualKuja, netA, netB },
    layer3Promise,
    layer4Synastry,
    conflicts,
    synthesis: parts.join(' '),
  };
}
