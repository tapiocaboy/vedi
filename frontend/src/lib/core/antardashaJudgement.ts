/**
 * Classical judgement of an antardasha (BPHS, Vimshottari antardasha phala).
 *
 * The prediction engine scores a period almost entirely from the mahadasha
 * lord, which makes every antardasha inside a mahadasha read the same. That is
 * not how the classics judge a sub-period. The governing rule is the
 * *mutual disposition*: where the antardasha lord sits counted from the
 * mahadasha lord's own sign.
 *
 *   • 2, 5, 9, 11 from the mahadasha lord — the sub-period yields; gains,
 *     recognition, and the mahadasha's promise actually materialising.
 *   • 1, 4, 7, 10 (kendras) — strong and active, direct expression.
 *   • 3 — results through effort rather than grace.
 *   • 6, 8, 12 — the difficult trio. The 6-8 axis between the two lords
 *     (shashtashtaka) is specifically inauspicious in the classical texts.
 *
 * Layered on top: the natural friendship between the two lords, the antardasha
 * lord's own natal condition (it dominates the lived experience of the
 * sub-period), the mahadasha lord's condition as the containing field, the
 * antardasha lord's Ashtakavarga bindus, and the named planet-pair effect.
 */

import { bindusToLabel, bindusToScoreModifier, PLANETS as AV_PLANETS, type Planet as AVPlanet } from './ashtakavarga';
import { pairRatingMod, PLANETARY_RELATIONSHIPS } from './predictions';
import { RASHIS } from './rashi';
import type { PlanetStrength } from './dashaStrength';
import type { ChartContext } from './predictions';

export type Verdict = 'excellent' | 'good' | 'mixed' | 'difficult' | 'testing';

export interface JudgementFactor {
  kind: 'disposition' | 'relationship' | 'sub-lord' | 'period-lord' | 'ashtakavarga' | 'pair';
  label: string;
  detail: string;
  /** Signed contribution to the score. */
  points: number;
}

export interface AntardashaJudgement {
  /** 1–10, specific to this mahadasha/antardasha pair. */
  score: number;
  verdict: Verdict;
  /** House of the antardasha lord counted from the mahadasha lord (1–12). */
  houseFromLord: number | null;
  /** True when the two lords stand 6/8 from each other. */
  shashtashtaka: boolean;
  relationship: 'friend' | 'enemy' | 'neutral' | 'same';
  factors: JudgementFactor[];
  /** One-line classical summary for the UI. */
  headline: string;
}

// ─── Mutual disposition (the governing rule) ───────────────────────────────

const DISPOSITION_MOD: Record<number, number> = {
  1: 0.25, 2: 0.75, 3: 0.25, 4: 0.75, 5: 1.25, 6: -1.5,
  7: 0.5, 8: -1.75, 9: 1.25, 10: 1.0, 11: 1.5, 12: -1.25,
};

const DISPOSITION_NOTE: Record<number, string> = {
  1:  'sits in the same sign as',
  2:  'stands in the 2nd from',
  3:  'stands in the 3rd from',
  4:  'stands in the 4th from',
  5:  'stands in the 5th from',
  6:  'stands in the 6th from',
  7:  'stands in the 7th from',
  8:  'stands in the 8th from',
  9:  'stands in the 9th from',
  10: 'stands in the 10th from',
  11: 'stands in the 11th from',
  12: 'stands in the 12th from',
};

const DISPOSITION_MEANING: Record<number, string> = {
  1:  'the two lords merge — the sub-period concentrates the mahadasha\'s own theme rather than varying it',
  2:  'a supportive placement for resources, family and accumulated wealth',
  3:  'results come through initiative and effort rather than by grace',
  4:  'a settled placement — home, vehicles and inner ground are supported',
  5:  'one of the most fruitful placements: the mahadasha\'s promise ripens here',
  6:  'a difficult placement — obstruction, competition, debt and health friction',
  7:  'an active placement working through partnerships, deals and other people',
  8:  'the hardest placement — obstruction, delay, and sudden reversals of intent',
  9:  'a fortunate placement; fortune, mentors and dharma support the period',
  10: 'a strongly active placement — career and public standing move',
  11: 'the most productive placement of all: gains, fulfilment of desires, income',
  12: 'a draining placement — expense, dispersal, foreign matters and letting go',
};

// ─── Verdict bands ─────────────────────────────────────────────────────────

function verdictFor(score: number): Verdict {
  if (score >= 7.5) return 'excellent';
  if (score >= 6.2) return 'good';
  if (score >= 4.5) return 'mixed';
  if (score >= 3) return 'difficult';
  return 'testing';
}

function relationshipOf(a: string, b: string): AntardashaJudgement['relationship'] {
  if (a === b) return 'same';
  const rel = PLANETARY_RELATIONSHIPS[a] ?? {};
  if ((rel.friends ?? []).includes(b)) return 'friend';
  if ((rel.enemies ?? []).includes(b)) return 'enemy';
  return 'neutral';
}

export interface JudgementInput {
  mahadashaLord: string;
  antardashaLord: string;
  ctx: ChartContext;
  /** Natal condition lookup; null when the chart is unavailable. */
  strengthOf: (planet: string) => PlanetStrength | null;
}

export function judgeAntardasha(input: JudgementInput): AntardashaJudgement {
  const { mahadashaLord: md, antardashaLord: ad, ctx, strengthOf } = input;
  const factors: JudgementFactor[] = [];
  let score = 5;

  // ── 1. Mutual disposition — the governing classical rule ──
  const mdRashi = ctx.planetRashis?.[md];
  const adRashi = ctx.planetRashis?.[ad];
  let houseFromLord: number | null = null;
  let shashtashtaka = false;

  if (mdRashi != null && adRashi != null) {
    houseFromLord = ((adRashi - mdRashi + 12) % 12) + 1;
    shashtashtaka = houseFromLord === 6 || houseFromLord === 8;
    const points = DISPOSITION_MOD[houseFromLord];
    score += points;
    factors.push({
      kind: 'disposition',
      label: `${ad} ${DISPOSITION_NOTE[houseFromLord]} ${md}`,
      detail:
        `Natally ${ad} is in ${RASHIS[adRashi]} and ${md} in ${RASHIS[mdRashi]}, putting ${ad} in the ` +
        `${houseFromLord}${ordinal(houseFromLord)} from the period lord — ${DISPOSITION_MEANING[houseFromLord]}.` +
        (shashtashtaka
          ? ` The two lords stand on the 6-8 axis (shashtashtaka), which the classics single out as the ` +
            `most obstructed relationship a sub-period can have.`
          : ''),
      points,
    });
  }

  // ── 2. Natural friendship between the two lords ──
  const relationship = relationshipOf(md, ad);
  if (relationship !== 'same') {
    const points = relationship === 'friend' ? 0.75 : relationship === 'enemy' ? -0.75 : 0;
    if (points !== 0) {
      score += points;
      factors.push({
        kind: 'relationship',
        label: relationship === 'friend' ? 'Friendly lords' : 'Inimical lords',
        detail:
          relationship === 'friend'
            ? `${ad} is a natural friend of ${md}, so the sub-period cooperates with the mahadasha instead of fighting it.`
            : `${ad} is a natural enemy of ${md}. The sub-period pulls against the mahadasha's direction, and progress needs deliberate reconciliation of the two agendas.`,
        points,
      });
    }
  }

  // ── 3. The antardasha lord's own natal condition (dominant) ──
  const adStrength = strengthOf(ad);
  if (adStrength && adStrength.total !== 0) {
    const points = Math.round(adStrength.total * 0.7 * 100) / 100;
    score += points;
    factors.push({
      kind: 'sub-lord',
      label: adStrength.total > 0 ? `${ad} is well placed natally` : `${ad} is under natal pressure`,
      detail: adStrength.notes[0] ??
        (adStrength.total > 0
          ? `${ad}'s natal condition lets it deliver its significations cleanly during its own sub-period.`
          : `${ad}'s natal condition means it delivers through friction — its sub-period asks for effort before it concedes.`),
      points,
    });
  }

  // ── 4. The mahadasha lord as the containing field ──
  const mdStrength = strengthOf(md);
  if (mdStrength && mdStrength.total !== 0) {
    const points = Math.round(mdStrength.total * 0.3 * 100) / 100;
    score += points;
    factors.push({
      kind: 'period-lord',
      label: `${md} sets the containing conditions`,
      detail:
        `The mahadasha lord frames every sub-period inside it. ${md}'s natal condition ` +
        `${mdStrength.total > 0 ? 'raises the ceiling for' : 'constrains'} what this antardasha can produce.`,
      points,
    });
  }

  // ── 5. Ashtakavarga strength of the antardasha lord ──
  if ((AV_PLANETS as readonly string[]).includes(ad)) {
    const bindus = ctx.ashtakavarga?.selfStrength?.[ad as AVPlanet];
    if (bindus != null) {
      const points = bindusToScoreModifier(bindus) * 0.25;
      if (points !== 0) {
        score += points;
        factors.push({
          kind: 'ashtakavarga',
          label: `${ad} has ${bindus}/8 bindus (${bindusToLabel(bindus)})`,
          detail:
            `In its own Bhinnashtakavarga ${ad} carries ${bindus} of 8 bindus in the sign it occupies — ` +
            `${bindus >= 5 ? 'enough support to give results readily' : bindus <= 3 ? 'thin support, so results come slowly and partially' : 'average support'}.`,
          points,
        });
      }
    }
  }

  // ── 6. The named classical combination, if there is one ──
  const pairMod = pairRatingMod(md, ad);
  if (pairMod !== 0) {
    const points = pairMod * 0.4;
    score += points;
    factors.push({
      kind: 'pair',
      label: `${md}–${ad} is a named combination`,
      detail: `The classical reading of ${md}–${ad} is ${pairMod > 0 ? 'favourable' : 'a stress point'} (${pairMod > 0 ? '+' : ''}${pairMod} on the traditional scale).`,
      points,
    });
  }

  score = Math.max(1, Math.min(10, Math.round(score * 10) / 10));
  const verdict = verdictFor(score);

  // Lead with whichever factor moved the needle most — that is the honest
  // one-line answer to "why does this antardasha read this way".
  const lead = [...factors].sort((a, b) => Math.abs(b.points) - Math.abs(a.points))[0];
  const headline = lead
    ? lead.detail
    : `${md}–${ad} carries no decisive classical marker — it runs close to the mahadasha's own baseline.`;

  return { score, verdict, houseFromLord, shashtashtaka, relationship, factors, headline };
}

function ordinal(n: number): string {
  const v = n % 100;
  if (v >= 11 && v <= 13) return 'th';
  switch (n % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}
