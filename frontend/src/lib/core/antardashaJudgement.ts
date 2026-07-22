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
import type { PlanetStrength } from './dashaStrength';
import type { ChartContext } from './predictions';
import { type Lang, planetName, rashiName, houseLabel } from './i18n';
import { DISPOSITION_NOTE, DISPOSITION_MEANING, JUDGE } from './text/judgementText';
import { binduLabel } from './text/predictionFrames';

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
  lang?: Lang;
}

export function judgeAntardasha(input: JudgementInput): AntardashaJudgement {
  const { mahadashaLord: md, antardashaLord: ad, ctx, strengthOf, lang = 'en' } = input;
  const mdName = planetName(md, lang);
  const adName = planetName(ad, lang);
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
      label: DISPOSITION_NOTE[houseFromLord](adName, mdName, lang),
      detail: JUDGE.dispositionDetail(
        adName, rashiName(adRashi, lang), mdName, rashiName(mdRashi, lang),
        houseFromLord, houseLabel(houseFromLord, lang),
        DISPOSITION_MEANING[houseFromLord][lang], shashtashtaka, lang,
      ),
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
        label: relationship === 'friend' ? JUDGE.friendlyLabel[lang] : JUDGE.inimicalLabel[lang],
        detail: relationship === 'friend'
          ? JUDGE.friendlyDetail(adName, mdName, lang)
          : JUDGE.inimicalDetail(adName, mdName, lang),
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
      label: adStrength.total > 0 ? JUDGE.subLordGoodLabel(adName, lang) : JUDGE.subLordBadLabel(adName, lang),
      detail: adStrength.notes[0] ??
        (adStrength.total > 0 ? JUDGE.subLordGoodDetail(adName, lang) : JUDGE.subLordBadDetail(adName, lang)),
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
      label: JUDGE.periodLordLabel(mdName, lang),
      detail: JUDGE.periodLordDetail(mdName, mdStrength.total > 0, lang),
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
          label: JUDGE.avLabel(adName, bindus, binduLabel(bindusToLabel(bindus), lang), lang),
          detail: JUDGE.avDetail(adName, bindus, lang),
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
      label: JUDGE.pairLabel(mdName, adName, lang),
      detail: JUDGE.pairDetail(mdName, adName, pairMod, lang),
      points,
    });
  }

  score = Math.max(1, Math.min(10, Math.round(score * 10) / 10));
  const verdict = verdictFor(score);

  // Lead with whichever factor moved the needle most — that is the honest
  // one-line answer to "why does this antardasha read this way".
  const lead = [...factors].sort((a, b) => Math.abs(b.points) - Math.abs(a.points))[0];
  const headline = lead ? lead.detail : JUDGE.fallbackHeadline(mdName, adName, lang);

  return { score, verdict, houseFromLord, shashtashtaka, relationship, factors, headline };
}
