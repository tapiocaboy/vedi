/**
 * Gochara Phala — classical transit effects for each planet in each house
 * counted from the natal Moon (janma rashi), condensed to plain language from
 * Brihat Samhita Ch. 104, Phaladeepika Ch. 26 and Jatakaparijata's Gochara
 * chapters, plus a per-zodiac reading that applies these results (with vedha
 * obstruction) to all 12 Moon signs — the traditional "effects of the current
 * sky for each rashi" table, personalised by highlighting the user's own sign.
 */

import type { GocharaSnapshot, PlanetTransit } from './transits';
import { valenceFromMoon } from './transits';
import { VEDHA_FOR_GOOD, VEDHA_EXEMPT } from './transitAnalysis';

/**
 * Classical effect of each planet transiting house 1–12 from the Moon.
 * Index = houseFromMoon − 1. One concise line per placement.
 */
export const GOCHARA_PHALA: Record<string, string[]> = {
  SUN: [
    'Fatigue and irritability rise; health and pride need care — avoid overexertion.',
    'Money matters feel tight and the face/eyes may strain; guard savings and speech.',
    'Victory over rivals, better health and courage — a strong month to push forward.',
    'Home life feels pressured and rest is disturbed; family duties weigh more.',
    'Mental agitation and obstacles around children, romance or studies; keep cool.',
    'Enemies and illness recede; work goes well — one of the Sun’s best positions.',
    'Tiring journeys and friction with the partner; digestion may act up.',
    'Anxiety, health scares and disputes — keep a low profile and rest well.',
    'Setbacks in fortune and father-related matters; humiliation is possible — stay humble.',
    'Recognition, achievement and success in career plans — act with confidence.',
    'Gains of wealth, honours and new income; friends and networks reward you.',
    'Expenses mount and quarrels drain you; protect sleep and reputation.',
  ],
  MOON: [
    'Good food, comfort and emotional buoyancy — a pleasant, light day.',
    'Small losses of money or respect are possible; keep plans modest.',
    'Success, small gains and joy through siblings and friends.',
    'Restlessness and distrust at home; the mind wants reassurance.',
    'Disappointment or sorrow passes through; digestion and mood dip.',
    'Enemies subdued and health improves; comfort returns.',
    'Honours, harmony with the partner and good company.',
    'Anxiety and disturbed sleep; be gentle with yourself today.',
    'Fatigue and mental discomfort; obstacles feel bigger than they are.',
    'Duties get accomplished; a small status boost at work.',
    'Joy, gains and happy meetings — a genuinely good day.',
    'Expense and low spirits; avoid risks and rest more.',
  ],
  MARS: [
    'Heat in body and temper; risk of cuts, burns or conflict — slow down.',
    'Quarrels over money and family friction; throat or face complaints possible.',
    'Courage pays: victories, gains and well-directed energy.',
    'Strife at home and bad news; stomach or chest complaints need attention.',
    'Friction with children, fevers and agitation; postpone big decisions.',
    'Enemies and disputes are defeated; vitality is high — press your advantage.',
    'Discord with spouse or partners; eyes and patience both strain.',
    'Accident and injury risk rises and income blocks appear — drive and act carefully.',
    'Weakness and obstruction in fortune; effort meets resistance.',
    'Strain with authority and exertion without reward at work; pace yourself.',
    'Gains of wealth, property and leadership — energy converts to results.',
    'Expenses, hidden opposition and a short fuse; guard the temper.',
  ],
  MERCURY: [
    'Hasty words and contrary advice mislead; double-check before committing.',
    'Gains through intellect and sweet speech; good for money talks.',
    'New burdens and friction with friends or rivals; mind the details.',
    'Family prosperity, learning and good news at home.',
    'Arguments with spouse or children; the mind runs hot — pause before replying.',
    'Popularity and success; opponents retreat before your reasoning.',
    'Mental fatigue and dull business; disagreements sap focus.',
    'Unexpected gains and success — Mercury is a rare friend of the 8th.',
    'Delays and mental unrest around travel, study or beliefs.',
    'Happiness through work, income and recognition of skill.',
    'Gains, comforts and good company; deals close in your favour.',
    'Humiliation risk through miscommunication; watch expenses and contracts.',
  ],
  JUPITER: [
    'A move or expense-heavy phase; position feels unsettled despite wisdom gained.',
    'Wealth and family happiness grow; domestic gains and good food.',
    'Obstacles and a possible change of place; growth pauses for lessons.',
    'Trouble through relatives and dented pride; patience is tested at home.',
    'Children, creativity and merit flourish; favour from superiors — excellent.',
    'Enemies and worries niggle; expansion turns inward as effort exceeds reward.',
    'Happy partnerships, good journeys and comforts; marriage matters bloom.',
    'Fatigue and misfortune tax you; health and finances both need reserve.',
    'Fortune rises: virtue, recognition and success — Guru’s finest transit.',
    'Position comes under pressure; guard reputation and avoid shortcuts.',
    'Gains, new position and well-being; prosperity flows — excellent.',
    'Grief and expense; spending on good causes softens the drain.',
  ],
  VENUS: [
    'Enjoyments, comforts and pleasures of the senses come easily.',
    'Gains, prosperity and family happiness; money flows in.',
    'Influence grows and enemies subside; prosperity with charm.',
    'Comforts multiply, friends visit, and home feels happy.',
    'Joy through children, gains and honours from patrons.',
    'Dips in charm: disease risk, humiliation and quarrels — keep it simple.',
    'Friction through or with the spouse; romance needs tact.',
    'Gains of wealth, property and comfort — a generous placement.',
    'Fortune, romance and virtue prosper; travel is kind.',
    'Disputes and slights at work are possible; keep vanity out of it.',
    'Gains of wealth, friends, comforts and safety.',
    'Quiet prosperity: gains, comforts of bed and pleasant retreat.',
  ],
  SATURN: [
    'The peak of Sade Sati: pressure on health, mind and vitality — simplify and endure.',
    'Wealth, family and speech are tested (closing Sade Sati); spend and speak with care.',
    'Patience pays: support from subordinates, enemies weaken, steady health.',
    'Kantaka Shani: sorrow at home, worries over mother, property or vehicles.',
    'Confused judgement, worries through children and drained savings; decide slowly.',
    'Debts and enemies recede; slow, steady wins accumulate.',
    'Marriage and partnerships feel heavy; tiring travel and low vitality.',
    'Ashtama Shani: obstacles all round, chronic complaints, losses — patience is the remedy.',
    'Fortune feels blocked and duty burdensome; malice from others is possible.',
    'Hard labour with little credit; position under pressure — persist quietly.',
    'Persistence rewarded: gains of wealth and status arrive at last.',
    'The rising of Sade Sati: expenses, sleep troubles and hidden worries multiply.',
  ],
  RAHU: [
    'Identity churn and restlessness; health puzzles need patient diagnosis.',
    'Turbulence in speech, family and finances; guard savings from schemes.',
    'Bold wins and a competitive edge; foreign or technical matters pay off.',
    'Unease at home; property and vehicle matters get complicated.',
    'Speculation tempts and distracts; children and studies need steadiness.',
    'Rivals outmanoeuvred; gains arrive through unconventional means.',
    'Confusing alliances and tempting partnerships — verify everything.',
    'Sudden events and hidden matters surface; research yes, risk no.',
    'Doubts around faith, mentors and long journeys; mixed foreign results.',
    'Ambition surges; ethical shortcuts will backfire — climb clean.',
    'Strong gains, network expansion and desires fulfilled.',
    'Expenses drift and sleep suffers; watch escapism and foreign entanglements.',
  ],
  KETU: [
    'Detachment and low drive; the sense of self is quietly rewired.',
    'Family and money niggles; blunt speech gets misunderstood.',
    'Quiet courage cuts through obstacles; effort works best unseen.',
    'Home feels unsettled; an inner search overshadows domestic comfort.',
    'Creative and study detours; children’s matters take odd turns.',
    'Healing and release: enemies dissolve and service is rewarded.',
    'Distance in partnerships; a solitary streak strains relating.',
    'Sudden endings and separations; occult interest deepens — mind health signals.',
    'Doubt then deeper faith; pilgrimage and reflection call.',
    'Career direction hazes over; a thankless-work phase — keep serving.',
    'Gains arrive quietly; spiritual friendships support you.',
    'Retreat, meditation and letting go succeed; expenses drift if unwatched.',
  ],
};

/** Classical effect line for `planet` transiting `houseFromMoon` (1–12). */
export function gocharaEffect(planet: string, houseFromMoon: number): string {
  return GOCHARA_PHALA[planet]?.[houseFromMoon - 1] ?? '';
}

// ── Per-zodiac reading (all 12 signs as Moon sign) ──────────────────────────────

/** Slow movers dominate a sign's climate; the fast Moon barely registers. */
const ZODIAC_WEIGHT: Record<string, number> = {
  SATURN: 2, JUPITER: 2, RAHU: 1.5, KETU: 1.5, MARS: 1.25,
  SUN: 1, MERCURY: 1, VENUS: 1, MOON: 0.5,
};

export interface ZodiacPlanetEffect {
  planet: string;
  /** House the planet occupies counted from this zodiac sign (1–12). */
  house: number;
  effect: string;
  /** −1 / 0 / +1 after vedha obstruction. */
  valence: number;
  /** Set when an auspicious result is obstructed by another planet. */
  vedhaBy?: string;
  isRetrograde: boolean;
}

export interface ZodiacEffects {
  rashi: number;
  /** Weighted mean valence in [−1, +1]. */
  score: number;
  tone: 'good' | 'bad' | 'neutral';
  effects: ZodiacPlanetEffect[];
}

/**
 * The classical "gochara phala for each rashi" table: for every zodiac sign
 * taken as the Moon sign, the effect of each currently transiting planet with
 * Moon-relative valence and vedha obstruction applied.
 */
export function computeZodiacEffects(g: GocharaSnapshot): ZodiacEffects[] {
  const out: ZodiacEffects[] = [];
  for (let rashi = 0; rashi < 12; rashi++) {
    // Which planets occupy each house from this hypothetical Moon sign.
    const occupants: Record<number, string[]> = {};
    for (const t of g.transits) {
      const h = ((t.rashi - rashi + 12) % 12) + 1;
      (occupants[h] ??= []).push(t.planet);
    }

    const effects: ZodiacPlanetEffect[] = g.transits.map((t: PlanetTransit) => {
      const house = ((t.rashi - rashi + 12) % 12) + 1;
      let valence = valenceFromMoon(t.planet, house);
      let vedhaBy: string | undefined;
      if (valence > 0) {
        const vHouse = VEDHA_FOR_GOOD[t.planet]?.[house];
        if (vHouse) {
          const obstructor = (occupants[vHouse] ?? []).find(
            q => q !== t.planet && VEDHA_EXEMPT[t.planet] !== q,
          );
          if (obstructor) {
            valence = 0;
            vedhaBy = obstructor;
          }
        }
      }
      return { planet: t.planet, house, effect: gocharaEffect(t.planet, house), valence, vedhaBy, isRetrograde: t.isRetrograde };
    });

    let weighted = 0, totalWeight = 0;
    for (const e of effects) {
      const w = ZODIAC_WEIGHT[e.planet] ?? 1;
      weighted += w * e.valence;
      totalWeight += w;
    }
    const score = totalWeight > 0 ? weighted / totalWeight : 0;
    const tone: ZodiacEffects['tone'] = score >= 0.15 ? 'good' : score <= -0.15 ? 'bad' : 'neutral';

    out.push({ rashi, score, tone, effects });
  }
  return out;
}
