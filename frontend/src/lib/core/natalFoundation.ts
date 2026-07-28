/**
 * Natal foundation — the chart's *standing* promise for each life area.
 *
 * The dasha engine answers "what is the sky doing to you now". It cannot, on
 * its own, answer "what did you start with". Two people can run an identical
 * Venus–Saturn period and get opposite results because one has a clean 10th
 * house and the other has a debilitated Mars sitting in it. Without this layer
 * every prediction collapses into a property of the dasha lord alone, and a
 * dignified mahadasha lord makes *every* area read "very strong".
 *
 * So for each area we assess the classical triad:
 *
 *   • Bhava    — the house itself and who occupies it
 *   • Bhavesha — the lord of that house and where it sits
 *   • Karaka   — the natural significator of the matter
 *
 * plus, for health, the condition of the Moon (manas — the mind), which is the
 * single most-cited factor for emotional weather and is invisible to a
 * dasha-lord-only reading.
 *
 * The result is a −3 … +3 modifier per area with human-readable reasons. The
 * prediction engine folds it into every area score, so the same dasha reads
 * differently on different charts — which is the entire point.
 */

import { assessPlanetStrength, type PlanetStrength, type StrengthInput } from './dashaStrength';
import { RASHI_LORDS, getDignity, getGandanta, type DignityLevel } from './planetaryAnalysis';
import { getNakshatra } from './nakshatra';
import { areaYogas } from './areaYogas';
import { type Lang, pick, planetName, houseLabel, houseLabelLocative, joinAnd, nakshatraPadaLabel } from './i18n';
import { HOUSE_TEXT } from './text/predictionVocab';
import {
  F_OCCUPANT_WEAK, F_OCCUPANT_STRONG, F_OCCUPANT_MALEFIC, F_OCCUPANT_UPACHAYA,
  F_LORD_STRONG, F_LORD_WEAK, F_LORD_WEAK_DIGNITY, F_LORD_DUSTHANA, F_LORD_WELL_DEPLOYED,
  F_KARAKA_STRONG, F_KARAKA_WEAK, F_KARAKA_IN_OWN_BHAVA,
  F_YOGA_SUPPORT, F_YOGA_DEFERRED, F_STELLIUM, F_COMBUST_RETENTION, F_MOON_GANDANTA,
  F_MOON_MALEFIC_CONJ, F_MOON_SATURN_ASPECT, F_MOON_MARS_ASPECT, F_MOON_NODE,
  F_MOON_UNSUPPORTED, F_MOON_WANING, F_MOON_STRONG,
  AREA_NAME,
} from './text/foundationText';

export type LifeArea = 'career' | 'wealth' | 'relationship' | 'health';

export interface AreaFoundation {
  area: LifeArea;
  /** −3 … +3. The chart's standing condition for this area, before any dasha. */
  score: number;
  /** Why, in the caller's language — strongest factors first. */
  notes: string[];
  /** True when the chart's own promise here is materially weak (score ≤ −0.75). */
  weak: boolean;
  /** True when the chart's own promise here is materially strong (score ≥ +0.75). */
  strong: boolean;
}

export type NatalFoundation = Record<LifeArea, AreaFoundation>;

// ─── Area → houses / karakas ───────────────────────────────────────────────

/**
 * Primary house carries full weight; the secondary house half. Karakas are
 * listed most-important first and weighted the same way.
 */
const AREA_SPEC: Record<LifeArea, { houses: [number, number]; karakas: Array<[string, number]> }> = {
  career:       { houses: [10, 6],  karakas: [['Sun', 0.8], ['Saturn', 0.4], ['Mercury', 0.4]] },
  wealth:       { houses: [2, 11],  karakas: [['Jupiter', 0.8], ['Venus', 0.4]] },
  // Venus (love) and Jupiter (the partner in a female chart) are both decisive
  // for marriage, so neither is demoted to a secondary voice.
  relationship: { houses: [7, 5],   karakas: [['Venus', 0.6], ['Jupiter', 0.6]] },
  // The Moon is deliberately absent here — its condition enters through the
  // manas assessment below, which reads it far more thoroughly. Listing it as
  // a karaka too would count the same placement twice.
  health:       { houses: [1, 6],   karakas: [['Sun', 0.8]] },
};

/**
 * Houses where an area's own bhavesha is classically *deployed* rather than
 * displaced. The 2nd lord in the 11th is the standard wealth placement, not a
 * weakness — but a scoring pass that only reads dignity and dusthana cannot see
 * that, and ends up describing the best available placement as strain.
 *
 * This applies to the *primary* house's lord only. Extending it to an area's
 * secondary house credits things like a 6th lord in the 3rd as a career asset,
 * which is not a claim any classical source makes.
 */
const AREA_LORD_DEPLOYMENT: Record<LifeArea, number[]> = {
  career: [1, 10, 11],            // self, karma and gains — where work pays off
  wealth: [2, 5, 9, 11],          // the dhana quartet (Phaladeepika Ch. 14)
  relationship: [1, 2, 4, 7, 11], // partnership needs the household houses
  health: [1, 4, 5, 9, 10],       // kendra / trikona sustain the body
};

/** Credit for a bhavesha sitting in one of its area's deployment houses. */
const LORD_DEPLOYMENT_BONUS = 0.4;

/** Weight of the secondary house relative to the primary. */
const SECONDARY_HOUSE_WEIGHT = 0.4;

/** Occupants needed in one upachaya house before it reads as a stellium. */
const STELLIUM_MIN = 3;
const STELLIUM_BONUS = 0.3;

/**
 * When a house has no occupants its lord is the only voice describing it, so
 * that voice carries further.
 */
const EMPTY_HOUSE_LORD_BOOST = 1.4;

/** Karako bhava nashaya — the house each karaka spoils by occupying it. */
const KARAKA_OWN_BHAVA: Record<string, number> = {
  Sun: 10, Moon: 4, Mars: 3, Mercury: 4, Jupiter: 5, Venus: 7, Saturn: 8,
};

const NATURAL_MALEFICS = new Set(['Sun', 'Mars', 'Saturn', 'Rahu', 'Ketu']);
const UPACHAYA = new Set([3, 6, 10, 11]);
const DUSTHANA = new Set([6, 8, 12]);

const DIGNITY_WEIGHT: Record<DignityLevel, number> = {
  'exalted':      0.75,
  'own-sign':     0.6,
  'friend-sign':  0.3,
  'neutral-sign': 0,
  'enemy-sign':  -0.4,
  'debilitated': -0.9,
};

/**
 * Dignity weighs more heavily for a bhavesha or karaka than for a mere
 * occupant: a debilitated house lord is one of the strongest classical
 * statements a chart makes about an area, and it must not be washed out by the
 * lord happening to sit in an angular house.
 */
const RULER_DIGNITY_WEIGHT: Record<DignityLevel, number> = {
  'exalted':      0.9,
  'own-sign':     0.6,
  'friend-sign':  0.3,
  'neutral-sign': 0,
  'enemy-sign':  -0.5,
  'debilitated': -1.2,
};

// ─── Graha drishti (whole-sign aspects) ────────────────────────────────────

/** Extra houses each planet aspects, beyond the universal 7th. */
const SPECIAL_ASPECTS: Record<string, number[]> = {
  Mars: [4, 8],
  Jupiter: [5, 9],
  Saturn: [3, 10],
};

/** Does `planet` in `fromRashi` cast a whole-sign aspect onto `toRashi`? */
export function aspectsRashi(planet: string, fromRashi: number, toRashi: number): boolean {
  const distance = ((toRashi - fromRashi + 12) % 12) + 1;
  if (distance === 7) return true;
  return (SPECIAL_ASPECTS[planet] ?? []).includes(distance);
}

// ─── Helpers ───────────────────────────────────────────────────────────────

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/** 'VENUS' → 'Venus'. The yoga detector works in upper case; prose does not. */
const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

interface Ctx {
  input: StrengthInput;
  lang: Lang;
  ascendantRashi: number;
  strength: (planet: string) => PlanetStrength;
}

/** Whole-sign house (1–12) of a rashi for this ascendant. */
function houseOfRashi(rashi: number, ascendantRashi: number): number {
  return ((rashi - ascendantRashi + 12) % 12) + 1;
}

/** Planets occupying a given whole-sign house. */
function occupantsOf(house: number, ctx: Ctx): string[] {
  const rashis = ctx.input.planetRashis ?? {};
  return Object.entries(rashis)
    .filter(([, r]) => houseOfRashi(r, ctx.ascendantRashi) === house)
    .map(([p]) => p);
}

interface Factor { points: number; note: string | null }

/**
 * Condition of one bhava: its occupants and its lord.
 * Returns points on roughly a −2 … +2 scale.
 */
function assessBhava(house: number, area: LifeArea, ctx: Ctx, isPrimaryHouse: boolean): Factor[] {
  const { lang } = ctx;
  const out: Factor[] = [];
  const hLabel = houseLabelLocative(house, lang);
  const hTheme = pick(HOUSE_TEXT[house].theme, lang);

  // ── Occupants ──
  const occupants = occupantsOf(house, ctx);

  // A crowd in a growth house is a statement in its own right: whatever the
  // individual dignities, the chart's output is concentrated there. Scoring the
  // occupants one by one can only ever subtract, so the concentration itself
  // has to be counted.
  if (UPACHAYA.has(house) && occupants.length >= STELLIUM_MIN) {
    out.push({
      points: STELLIUM_BONUS * (occupants.length - STELLIUM_MIN + 1),
      note: F_STELLIUM[lang](String(occupants.length), hLabel, hTheme),
    });
  }

  for (const planet of occupants) {
    const rashi = ctx.input.planetRashis![planet];
    const dignity = getDignity(planet, rashi);
    const isMalefic = NATURAL_MALEFICS.has(planet);
    let points = DIGNITY_WEIGHT[dignity] ?? 0;
    let note: string | null = null;

    if (isMalefic) {
      // Malefics in upachaya houses are classically constructive — they build
      // slowly rather than damage. Elsewhere they press on the house.
      if (UPACHAYA.has(house)) {
        points += 0.3;
        note = F_OCCUPANT_UPACHAYA[lang](planetName(planet, lang), hLabel, hTheme);
      } else {
        points -= 0.35;
        note = F_OCCUPANT_MALEFIC[lang](planetName(planet, lang), hLabel, hTheme);
      }
    } else if (!DUSTHANA.has(house)) {
      points += 0.25;
    }

    // The nodes are always retrograde, so a retrograde penalty on them would be
    // a constant rather than a signal.
    const isNode = planet === 'Rahu' || planet === 'Ketu';
    if (ctx.input.planetRetro?.[planet] && isMalefic && !isNode) points -= 0.2;
    const s = ctx.strength(planet);
    if (s.isCombust) points -= 0.3;

    // A decisively weak or strong occupant overrides the generic note — it is
    // the more specific, and therefore more useful, thing to say.
    if (dignity === 'debilitated') {
      note = F_OCCUPANT_WEAK[lang](planetName(planet, lang), hLabel, hTheme);
    } else if (dignity === 'exalted' || dignity === 'own-sign') {
      note = F_OCCUPANT_STRONG[lang](planetName(planet, lang), hLabel, hTheme);
    }

    out.push({ points, note });
  }

  // ── Bhavesha (house lord) ──
  const houseRashi = (ctx.ascendantRashi + house - 1) % 12;
  const lord = RASHI_LORDS[houseRashi];
  const lordRashi = ctx.input.planetRashis?.[lord];
  if (lord && lordRashi != null) {
    const s = ctx.strength(lord);
    const lordDignity = getDignity(lord, lordRashi);
    const lordHouse = houseOfRashi(lordRashi, ctx.ascendantRashi);
    // Dignity and overall condition are scored separately so that an angular
    // placement cannot mask a debilitated lord, and vice versa.
    let points = s.total * 0.3 + RULER_DIGNITY_WEIGHT[lordDignity] * 0.6;
    if (!occupants.length) points *= EMPTY_HOUSE_LORD_BOOST;
    let note: string | null = null;

    // The dusthana penalty applies on its own terms; which note gets shown is
    // decided separately, by severity, so a lord that is both debilitated and
    // badly placed reports the debilitation — the stronger statement.
    const lordInDusthana = DUSTHANA.has(lordHouse) && !DUSTHANA.has(house);
    if (lordInDusthana) points -= 0.75;

    // Deployment: the lord standing in a house that serves this area is a
    // positive statement about the area even when the lord itself is weak.
    const deployed = isPrimaryHouse && AREA_LORD_DEPLOYMENT[area].includes(lordHouse) && lordHouse !== house;
    if (deployed) points += LORD_DEPLOYMENT_BONUS;

    const lordWeak = lordDignity === 'debilitated' || s.total <= -0.5;
    if (lordWeak && deployed) {
      // Both true: the placement is right and the planet is not. Naming only
      // the weakness pins it on the placement, which is the wrong diagnosis.
      note = F_LORD_WEAK_DIGNITY[lang](planetName(lord, lang), houseLabel(house, lang), houseLabelLocative(lordHouse, lang));
    } else if (lordWeak) {
      note = F_LORD_WEAK[lang](planetName(lord, lang), houseLabel(house, lang), houseLabelLocative(lordHouse, lang));
    } else if (lordInDusthana) {
      note = F_LORD_DUSTHANA[lang](planetName(lord, lang), houseLabel(house, lang));
    } else if (deployed) {
      note = F_LORD_WELL_DEPLOYED[lang](planetName(lord, lang), houseLabel(house, lang), houseLabelLocative(lordHouse, lang));
    } else if (s.total >= 1) {
      note = F_LORD_STRONG[lang](planetName(lord, lang), houseLabel(house, lang), houseLabelLocative(lordHouse, lang));
    }
    out.push({ points, note });

    // Combustion of the bhavesha is a statement about holding, not getting —
    // and that distinction is the whole difference between "weak area" and
    // "area that produces but leaks".
    if (s.isCombust) {
      out.push({ points: -0.2, note: F_COMBUST_RETENTION[lang](planetName(lord, lang)) });
    }
  }

  return out;
}

/** Condition of a karaka for an area. */
function assessKaraka(karaka: string, area: LifeArea, ctx: Ctx): Factor {
  const { lang } = ctx;
  const s = ctx.strength(karaka);
  const rashi = ctx.input.planetRashis?.[karaka];
  const dignity = rashi != null ? getDignity(karaka, rashi) : 'neutral-sign';
  let points = s.total * 0.3 + RULER_DIGNITY_WEIGHT[dignity] * 0.6;
  let note: string | null = null;

  const ownBhava = KARAKA_OWN_BHAVA[karaka];
  if (ownBhava != null && s.natalHouse === ownBhava) {
    points -= 0.5;
    note = F_KARAKA_IN_OWN_BHAVA[lang](planetName(karaka, lang), houseLabel(ownBhava, lang));
  } else if (s.total >= 1) {
    note = F_KARAKA_STRONG[lang](planetName(karaka, lang), pick(AREA_NAME[area], lang));
  } else if (s.total <= -0.5) {
    note = F_KARAKA_WEAK[lang](planetName(karaka, lang), pick(AREA_NAME[area], lang));
  }

  return { points, note };
}

// ─── Manas: the condition of the Moon ──────────────────────────────────────

export interface MoonCondition {
  /** −2 … +1.5, folded into the health foundation. */
  score: number;
  notes: string[];
  /** True when the Moon carries a classical affliction signature. */
  afflicted: boolean;
}

const BENEFICS = ['Jupiter', 'Venus', 'Mercury'];

export function assessMoonCondition(input: StrengthInput, lang: Lang = 'en'): MoonCondition {
  const rashis = input.planetRashis;
  const moonRashi = rashis?.Moon;
  if (!rashis || moonRashi == null) return { score: 0, notes: [], afflicted: false };

  const notes: string[] = [];
  let score = 0;

  // Dignity of the Moon itself.
  const dignity = getDignity('Moon', moonRashi);
  if (dignity === 'exalted' || dignity === 'own-sign') {
    score += 0.75;
    notes.push(F_MOON_STRONG[lang]());
  } else if (dignity === 'debilitated') {
    score -= 1.0;
  } else if (dignity === 'enemy-sign') {
    score -= 0.4;
  }

  // Malefic conjunction — same rashi as the Moon.
  for (const p of ['Mars', 'Saturn', 'Sun', 'Rahu', 'Ketu']) {
    if (rashis[p] === moonRashi) {
      // The Sun conjunct the Moon is amavasya (weak paksha bala), covered below.
      if (p === 'Sun') continue;
      score -= 0.5;
      notes.push(F_MOON_MALEFIC_CONJ[lang](planetName(p, lang)));
    }
  }

  // Malefic aspect onto the Moon.
  if (rashis.Saturn != null && rashis.Saturn !== moonRashi && aspectsRashi('Saturn', rashis.Saturn, moonRashi)) {
    score -= 0.6;
    notes.push(F_MOON_SATURN_ASPECT[lang]());
  }
  if (rashis.Mars != null && rashis.Mars !== moonRashi && aspectsRashi('Mars', rashis.Mars, moonRashi)) {
    score -= 0.4;
    notes.push(F_MOON_MARS_ASPECT[lang]());
  }
  for (const node of ['Rahu', 'Ketu']) {
    const r = rashis[node];
    if (r != null && r !== moonRashi && aspectsRashi(node, r, moonRashi)) {
      score -= 0.4;
      notes.push(F_MOON_NODE[lang](planetName(node, lang)));
      break;
    }
  }

  // Benefic support — conjunction or aspect from Jupiter, Venus or Mercury.
  const supported = BENEFICS.some(b => {
    const r = rashis[b];
    return r != null && (r === moonRashi || aspectsRashi(b, r, moonRashi));
  });
  if (supported) {
    score += 0.5;
  } else {
    score -= 0.5;
    notes.push(F_MOON_UNSUPPORTED[lang]());
  }

  // Paksha bala — a waning Moon is classically weak. Elongation from the Sun
  // above 180° means the Moon is past full and heading to new.
  const lons = input.planetLongitudes;
  if (lons?.Moon != null && lons?.Sun != null) {
    const elongation = ((lons.Moon - lons.Sun) % 360 + 360) % 360;
    if (elongation > 180) {
      score -= 0.4;
      notes.push(F_MOON_WANING[lang]());
    }
  }

  // Gandanta on the Moon. This is invisible to every other check here — a
  // gandanta Moon can be exalted, well aspected and benefic-supported — yet
  // classically it outranks all of them for the mind's own foundation, so it is
  // scored last and its note leads.
  if (lons?.Moon != null) {
    const gan = getGandanta(moonRashi, lons.Moon % 30, '', lang);
    if (gan) {
      score -= gan.severity === 'deep' ? 1.1 : gan.severity === 'moderate' ? 0.8 : 0.55;
      const nak = getNakshatra(lons.Moon);
      const moonHouse = input.ascendantRashi != null
        ? houseOfRashi(moonRashi, input.ascendantRashi)
        : null;
      notes.unshift(F_MOON_GANDANTA[lang](
        nakshatraPadaLabel(nak.name, nak.pada, lang),
        moonHouse != null ? houseLabelLocative(moonHouse, lang) : houseLabelLocative(4, lang),
      ));
    }
  }

  return { score: clamp(score, -2.5, 1.5), notes, afflicted: score <= -0.75 };
}

// ─── Public entry point ────────────────────────────────────────────────────

/**
 * Order the reasons so a truncated list still tells the truth.
 *
 * Sorting purely by magnitude lets a strong area bury its one real weakness
 * below the cut, which is how a chart with a debilitated planet in the 10th
 * ends up described as an unqualified career asset. So the supports and the
 * strains are interleaved strongest-first, and whichever side is bigger leads.
 */
function orderNotes(factors: Array<Factor & { weight: number }>): string[] {
  const byMagnitude = (a: Factor & { weight: number }, b: Factor & { weight: number }) =>
    Math.abs(b.points * b.weight) - Math.abs(a.points * a.weight);
  const rated = factors.filter(f => f.note);
  const supports = rated.filter(f => f.points > 0).sort(byMagnitude);
  const strains = rated.filter(f => f.points <= 0).sort(byMagnitude);

  const strongestSupport = Math.abs((supports[0]?.points ?? 0) * (supports[0]?.weight ?? 0));
  const strongestStrain = Math.abs((strains[0]?.points ?? 0) * (strains[0]?.weight ?? 0));
  const [first, second] = strongestStrain > strongestSupport ? [strains, supports] : [supports, strains];

  const out: string[] = [];
  for (let i = 0; i < Math.max(first.length, second.length); i++) {
    if (first[i]) out.push(first[i].note!);
    if (second[i]) out.push(second[i].note!);
  }
  return [...new Set(out)];
}

export function assessNatalFoundation(input: StrengthInput, lang: Lang = 'en'): NatalFoundation | null {
  if (input.ascendantRashi == null || !input.planetRashis) return null;

  const cache = new Map<string, PlanetStrength>();
  const ctx: Ctx = {
    input,
    lang,
    ascendantRashi: input.ascendantRashi,
    strength: (planet: string) => {
      let s = cache.get(planet);
      if (!s) { s = assessPlanetStrength(planet, input, lang); cache.set(planet, s); }
      return s;
    },
  };

  const moon = assessMoonCondition(input, lang);
  const yogas = areaYogas({
    planetRashis: input.planetRashis,
    ascendantRashi: input.ascendantRashi,
    planetLongitudes: input.planetLongitudes,
    planetRetro: input.planetRetro,
  });
  const out = {} as NatalFoundation;

  for (const area of Object.keys(AREA_SPEC) as LifeArea[]) {
    const { houses, karakas } = AREA_SPEC[area];
    const factors: Array<Factor & { weight: number }> = [];

    houses.forEach((h, i) => {
      const weight = i === 0 ? 1 : SECONDARY_HOUSE_WEIGHT;
      // Deployment credit is a claim about the area's own lord, so it is offered
      // for the primary house only.
      for (const f of assessBhava(h, area, ctx, i === 0)) factors.push({ ...f, weight });
    });
    for (const [karaka, weight] of karakas) {
      factors.push({ ...assessKaraka(karaka, area, ctx), weight });
    }

    // Yogas enter as ordinary factors so they take part in the same
    // strongest-first ordering as everything else — a decisive combination
    // should lead the reasons, not trail them.
    const areaYoga = yogas?.[area];
    if (areaYoga && areaYoga.yogas.length) {
      const lead = areaYoga.yogas[0];
      const frame = lead.deferred ? F_YOGA_DEFERRED : F_YOGA_SUPPORT;
      factors.push({
        points: areaYoga.points,
        weight: 1,
        note: frame[lang](lead.name, joinAnd(lead.planets.map(p => planetName(titleCase(p), lang)), lang)),
      });
    }

    let score = factors.reduce((sum, f) => sum + f.points * f.weight, 0);

    // The mind is the substrate of health; it colours that area directly.
    if (area === 'health') score += moon.score * 1.2;

    score = clamp(Math.round(score * 100) / 100, -3, 3);

    const factorNotes = orderNotes(factors);
    // For health the mind's condition leads: it is what the person actually
    // feels, and burying it under house-lord bookkeeping is how a reading ends
    // up sounding nothing like the life it describes.
    const notes = area === 'health' ? [...moon.notes, ...factorNotes] : factorNotes;

    out[area] = {
      area,
      score,
      notes: [...new Set(notes)],
      weak: score <= -0.75,
      strong: score >= 0.75,
    };
  }

  return out;
}
