/** Dasha Prediction Engine — enhanced with planet-pair combinations and sookshma-level awareness */

import { bindusToScoreModifier, bindusToLabel, type AshtakavargaResult, type Planet as AVPlanet, PLANETS as AV_PLANETS } from './ashtakavarga';
import { assessPlanetStrength, type PlanetStrength } from './dashaStrength';
import {
  type Lang, pick, pickList, planetName, houseLabel, houseLabelLocative, joinAnd, joinComma,
} from './i18n';
import { SIG_TEXT, HOUSE_TEXT, QUALITY_NOTE_TEXT } from './text/predictionVocab';
import { HEALTH_SPEC } from './text/areaHealth';
import { WEALTH_SPEC } from './text/areaWealth';
import { CAREER_SPEC } from './text/areaCareer';
import { REL_SPEC } from './text/areaRelationships';
import { GENERAL_SPEC } from './text/areaGeneral';
import { FAVORABLE, UNFAVORABLE } from './text/activities';
import { PAIR_EFFECTS, type PairEffect } from './text/pairEffects';
import {
  F_BODY_AREAS, F_HEALTH_CONCERNS, F_CAREER_AREAS, F_KEY_RELATIONSHIPS,
  F_SUB_PERIOD, F_AD_HEALTH_FRIEND, F_AD_HEALTH_ENEMY, F_AD_HEALTH_COMBINED, F_AD_HEALTH_NEUTRAL,
  F_AD_WEALTH_FRIEND, F_AD_WEALTH_ENEMY, F_AD_CAREER_FRIEND, F_AD_CAREER_ENEMY,
  F_AD_REL_FRIEND, F_AD_REL_ENEMY, F_AD_GENERAL_FRIEND, F_AD_GENERAL_ENEMY,
  F_PD_HEALTH_ENEMY, F_PD_HEALTH_FRIEND, F_PD_CAREER_ENEMY, F_PD_CAREER_FRIEND,
  F_PD_REL_ENEMY, F_PD_REL_FRIEND, F_SD_GENERAL_FRIEND,
  F_HEALTH_SUMMARY, F_WEALTH_SUMMARY, F_CAREER_SUMMARY, F_REL_SUMMARY, F_GENERAL_SUMMARY,
  F_THEME_BASE, F_THEME_AD, F_THEME_PD, F_THEME_SD, F_THEME_BINDUS,
  F_THEME_EXALTED, F_THEME_NEECHA_BHANGA, F_THEME_DEBILITATED, F_THEME_YOGAKARAKA,
  F_HOUSE_ANNOTATION, F_LORDSHIP_ANNOTATION, F_LORDED_HOUSE, F_SUB_PERIOD_PREFIX, F_SUB_PERIOD_LORD,
  intensityLabel, binduLabel, BONUS_MARK,
} from './text/predictionFrames';

/** Birth-chart context passed into the engine for chart-specific scoring. */
export interface ChartContext {
  ashtakavarga: AshtakavargaResult;
  /** Whole-sign natal house (1–12) for each planet keyed by canonical name (Sun/Moon/...). */
  planetHouses?: Record<string, number>;
  /** Natal ascendant rashi (0–11). */
  ascendantRashi?: number;
  /** Natal rashi (0–11) per planet — enables dignity / functional-nature scoring. */
  planetRashis?: Record<string, number>;
  /** Sidereal longitudes (0–360) per planet — enables combustion detection. */
  planetLongitudes?: Record<string, number>;
  /** Natal retrograde flags per planet. */
  planetRetro?: Record<string, boolean>;
  /** Natal Moon rashi (0–11) — used for neecha bhanga checks. */
  moonRashi?: number;
  /** Current transit highlights (Sade Sati, Guru transit, nodal axis…). */
  transitNotes?: string[];
  /** Aggregate transit auspiciousness modifier (≈ −1.5 … +1). */
  transitScoreMod?: number;
}

// House quality per bhava (kendra/trikona/…). The display prose (theme,
// emphasis, quality note) lives bilingually in text/predictionVocab; this map
// carries only the structural classification the scoring logic reads.
const HOUSE_QUALITY: Record<number, 'kendra' | 'trikona' | 'dusthana' | 'upachaya' | 'other'> = {
  1: 'kendra', 2: 'other', 3: 'upachaya', 4: 'kendra', 5: 'trikona', 6: 'dusthana',
  7: 'kendra', 8: 'dusthana', 9: 'trikona', 10: 'kendra', 11: 'upachaya', 12: 'dusthana',
};

export interface PredictionResult {
  area: string;
  trend: 'positive' | 'negative' | 'mixed' | 'neutral';
  intensity: string;
  summary: string;
  details: string[];
  remedies: string[];
  keywords: string[];
}

/** Structured natal-condition summary for a dasha lord, for UI display. */
export interface LordStrengthSummary {
  planet: string;
  role: 'mahadasha' | 'antardasha';
  dignity: string | null;
  neechaBhanga: boolean;
  isCombust: boolean;
  isRetrograde: boolean;
  functionalNature: string | null;
  lordedHouses: number[];
  natalHouse: number | null;
  /** Composite chart-strength modifier, −2.5 … +2.5. */
  strengthScore: number;
  notes: string[];
}

export interface DashaPrediction {
  dashaLord: string;
  antardasha?: string;
  pratyantardasha?: string;
  sookshmaDasha?: string;
  periodType: string;
  overallTheme: string;
  overallRating: number;
  predictions: Record<string, PredictionResult>;
  favorableActivities: string[];
  unfavorableActivities: string[];
  importantTransits: string[];
  lordStrengths?: LordStrengthSummary[];
  gemstone: string | null;
  mantra: string | null;
  deity: string | null;
  combinationWarning?: string;
  combinationBonus?: string;
}

// ─── Planet significations ─────────────────────────────────────────────────

export const PLANET_SIGNIFICATIONS: Record<string, Record<string, unknown>> = {
  Sun:{
    nature:'malefic', element:'fire', gender:'male',
    keywords:['authority','father','government','soul','vitality','ego','leadership'],
    bodyParts:['heart','spine','right eye','bones'],
    diseases:['heart problems','eye issues','fever','blood pressure','bone disorders'],
    professions:['government','politics','medicine','administration','leadership roles'],
    relationships:['father','authority figures','employers'],
    gemstone:'Ruby', mantra:'Om Suryaya Namah', deity:'Surya',
    wealthScore:6, careerScore:8, healthScore:5, relationshipScore:5,
  },
  Moon:{
    nature:'benefic', element:'water', gender:'female',
    keywords:['mind','mother','emotions','nurturing','public','travel','liquids'],
    bodyParts:['mind','breasts','left eye','blood','stomach'],
    diseases:['mental stress','depression','water retention','cold','menstrual issues'],
    professions:['nursing','hospitality','shipping','dairy','public relations'],
    relationships:['mother','wife','public','women in general'],
    gemstone:'Pearl', mantra:'Om Chandraya Namah', deity:'Chandra',
    wealthScore:6, careerScore:6, healthScore:6, relationshipScore:8,
  },
  Mars:{
    nature:'malefic', element:'fire', gender:'male',
    keywords:['energy','courage','brothers','property','surgery','accidents','competition'],
    bodyParts:['muscles','blood','head','marrow','energy'],
    diseases:['injuries','accidents','surgery','blood disorders','inflammation','fever'],
    professions:['military','police','engineering','surgery','sports','real estate'],
    relationships:['siblings','competitors','enemies'],
    gemstone:'Red Coral', mantra:'Om Mangalaya Namah', deity:'Kartikeya',
    wealthScore:5, careerScore:7, healthScore:4, relationshipScore:4,
  },
  Mercury:{
    nature:'benefic', element:'earth', gender:'neutral',
    keywords:['intelligence','communication','business','education','writing','analysis'],
    bodyParts:['nervous system','skin','lungs','speech','hands'],
    diseases:['nervous disorders','skin problems','speech issues','respiratory problems'],
    professions:['writing','teaching','accounting','trading','IT','communication'],
    relationships:['friends','maternal uncle','young people'],
    gemstone:'Emerald', mantra:'Om Budhaya Namah', deity:'Vishnu',
    wealthScore:8, careerScore:8, healthScore:6, relationshipScore:7,
  },
  Jupiter:{
    nature:'benefic', element:'ether', gender:'male',
    keywords:['wisdom','expansion','luck','children','spirituality','teaching','wealth'],
    bodyParts:['liver','fat','hips','thighs','arterial system'],
    diseases:['liver problems','obesity','diabetes','tumors','ear problems'],
    professions:['teaching','law','religion','banking','advisory','philosophy'],
    relationships:['husband','guru','children','elders'],
    gemstone:'Yellow Sapphire', mantra:'Om Gurave Namah', deity:'Brihaspati',
    wealthScore:9, careerScore:8, healthScore:7, relationshipScore:8,
  },
  Venus:{
    nature:'benefic', element:'water', gender:'female',
    keywords:['love','beauty','luxury','arts','marriage','pleasures','vehicles'],
    bodyParts:['reproductive system','face','eyes','throat','kidneys'],
    diseases:['reproductive issues','kidney problems','diabetes','skin conditions'],
    professions:['arts','entertainment','fashion','beauty','hospitality','luxury goods'],
    relationships:['wife','lover','women','artists'],
    gemstone:'Diamond', mantra:'Om Shukraya Namah', deity:'Lakshmi',
    wealthScore:8, careerScore:7, healthScore:6, relationshipScore:9,
  },
  Saturn:{
    nature:'malefic', element:'air', gender:'neutral',
    keywords:['karma','discipline','delay','longevity','labor','service','obstacles'],
    bodyParts:['bones','teeth','knees','joints','nerves'],
    diseases:['chronic diseases','joint pain','arthritis','depression','paralysis'],
    professions:['labor','mining','agriculture','law','real estate','oil/gas'],
    relationships:['servants','elderly','common people','laborers'],
    gemstone:'Blue Sapphire', mantra:'Om Shanaishcharaya Namah', deity:'Shani',
    wealthScore:5, careerScore:6, healthScore:4, relationshipScore:4,
  },
  Rahu:{
    nature:'malefic', element:'air', gender:'neutral',
    keywords:['illusion','foreign','technology','unconventional','obsession','sudden events'],
    bodyParts:['skin','breathing','feet','nervous system'],
    diseases:['mysterious diseases','poisoning','phobias','mental disorders','infections'],
    professions:['technology','foreign trade','research','politics','media','aviation'],
    relationships:['foreigners','outcasts','in-laws'],
    gemstone:'Hessonite (Gomed)', mantra:'Om Rahave Namah', deity:'Durga',
    wealthScore:6, careerScore:6, healthScore:3, relationshipScore:4,
  },
  Ketu:{
    nature:'malefic', element:'fire', gender:'neutral',
    keywords:['liberation','spirituality','past karma','detachment','occult','surgery'],
    bodyParts:['feet','spine','skin'],
    diseases:['mysterious ailments','viral infections','accidents','wounds','surgeries'],
    professions:['spirituality','research','occult','healing','investigation'],
    relationships:['paternal grandfather','spiritual guides'],
    gemstone:"Cat's Eye (Lehsunia)", mantra:'Om Ketave Namah', deity:'Ganesha',
    wealthScore:3, careerScore:4, healthScore:3, relationshipScore:3,
  },
};

export const PLANETARY_RELATIONSHIPS: Record<string, Record<string, string[]>> = {
  Sun:     { friends:['Moon','Mars','Jupiter'], enemies:['Saturn','Venus'], neutral:['Mercury'] },
  Moon:    { friends:['Sun','Mercury'], enemies:[], neutral:['Mars','Jupiter','Venus','Saturn'] },
  Mars:    { friends:['Sun','Moon','Jupiter'], enemies:['Mercury'], neutral:['Venus','Saturn'] },
  Mercury: { friends:['Sun','Venus'], enemies:['Moon'], neutral:['Mars','Jupiter','Saturn'] },
  Jupiter: { friends:['Sun','Moon','Mars'], enemies:['Mercury','Venus'], neutral:['Saturn'] },
  Venus:   { friends:['Mercury','Saturn'], enemies:['Sun','Moon'], neutral:['Mars','Jupiter'] },
  Saturn:  { friends:['Mercury','Venus'], enemies:['Sun','Moon','Mars'], neutral:['Jupiter'] },
  Rahu:    { friends:['Venus','Saturn'], enemies:['Sun','Moon','Mars'], neutral:['Mercury','Jupiter'] },
  Ketu:    { friends:['Mars','Jupiter'], enemies:['Moon','Venus'], neutral:['Sun','Mercury','Saturn'] },
};

function getPairEffect(mahadasha: string, antardasha: string): PairEffect | null {
  return PAIR_EFFECTS[`${mahadasha}-${antardasha}`] ?? null;
}

/**
 * Classical rating shift (−2…+2) for a lord/sub-lord pair, or 0 when the
 * combination carries no special reading. Exposed for the weight engine.
 */
export function pairRatingMod(lord: string, subLord: string): number {
  return getPairEffect(lord, subLord)?.ratingMod ?? 0;
}

/** Theme line for a lord/sub-lord pair, when the combination is a named one. */
export function pairTheme(lord: string, subLord: string, lang: Lang = 'en'): string | null {
  const eff = getPairEffect(lord, subLord);
  return eff ? pick(eff.theme, lang) : null;
}

// ─── Prediction Engine ─────────────────────────────────────────────────────

export class DashaPredictionEngine {
  // Set per-call by generateCompletePrediction so all internal score lookups
  // can pick up bindu strength (and the active language) without changing
  // every internal method signature.
  private _ctx: ChartContext | null = null;
  private _lang: Lang = 'en';
  private _strengthCache = new Map<string, PlanetStrength | null>();

  getPlanetData(planet: string) { return PLANET_SIGNIFICATIONS[planet] ?? {}; }

  getRelationship(p1: string, p2: string): string {
    if (p1 === p2) return 'same';
    const rel = PLANETARY_RELATIONSHIPS[p1] ?? {};
    if ((rel.friends ?? []).includes(p2)) return 'friend';
    if ((rel.enemies ?? []).includes(p2)) return 'enemy';
    return 'neutral';
  }

  private _bindusForLord(planet: string): number | null {
    if (!this._ctx) return null;
    if (!(AV_PLANETS as readonly string[]).includes(planet)) return null;
    return this._ctx.ashtakavarga.selfStrength[planet as AVPlanet];
  }

  private _natalHouseFor(planet: string): number | null {
    return this._ctx?.planetHouses?.[planet] ?? null;
  }

  /** Full chart-aware strength assessment for a planet (cached per prediction call). */
  private _strengthFor(planet: string): PlanetStrength | null {
    if (!this._ctx?.planetRashis) return null;
    if (this._strengthCache.has(planet)) return this._strengthCache.get(planet)!;
    const s = assessPlanetStrength(planet, this._ctx, this._lang);
    this._strengthCache.set(planet, s);
    return s;
  }

  /** Compact one-liner that places the dasha lord in its natal house. */
  private _houseAnnotation(planet: string): string | null {
    const house = this._natalHouseFor(planet);
    if (!house) return null;
    const lang = this._lang;
    const quality = HOUSE_QUALITY[house];
    return F_HOUSE_ANNOTATION[lang](
      planetName(planet, lang),
      houseLabelLocative(house, lang),
      pick(HOUSE_TEXT[house].theme, lang),
      pick(QUALITY_NOTE_TEXT[quality], lang),
      pick(HOUSE_TEXT[house].emphasis, lang),
    );
  }

  /** One-liner describing which houses the dasha lord rules and so activates. */
  private _lordshipAnnotation(planet: string): string | null {
    const s = this._strengthFor(planet);
    if (!s || s.lordedHouses.length === 0) return null;
    const lang = this._lang;
    const parts = s.lordedHouses.map(h =>
      F_LORDED_HOUSE[lang](houseLabel(h, lang), pick(HOUSE_TEXT[h].theme, lang)));
    return F_LORDSHIP_ANNOTATION[lang](
      planetName(planet, lang),
      joinAnd(parts, lang),
      s.lordedHouses.length > 1,
    );
  }

  /**
   * Area-specific adjustment from the houses a planet rules — e.g. the lord
   * of the 10th activates career during its dasha, the lord of the 7th
   * activates partnerships, dusthana lords bring friction to their areas.
   */
  private _lordshipAreaMod(planet: string, area: string): number {
    const s = this._strengthFor(planet);
    if (!s) return 0;
    const has = (...hs: number[]) => hs.some(h => s.lordedHouses.includes(h));
    switch (area) {
      case 'career':
        return (has(10) ? 0.75 : 0) + (has(6) ? 0.25 : 0) - (has(8) ? 0.5 : 0) - (has(12) ? 0.25 : 0);
      case 'wealth':
        return (has(11) ? 0.75 : 0) + (has(2) ? 0.5 : 0) - (has(12) ? 0.5 : 0) - (has(8) ? 0.25 : 0);
      case 'relationship':
        return (has(7) ? 0.75 : 0) + (has(5) ? 0.25 : 0) - (has(6) ? 0.5 : 0) - (has(8) ? 0.25 : 0);
      case 'health':
        return (has(1) ? 0.5 : 0) - (has(6) ? 0.5 : 0) - (has(8) ? 0.5 : 0) - (has(12) ? 0.25 : 0);
      default:
        return 0;
    }
  }

  private _planetScore(planet: string, area: string): number {
    const pd = PLANET_SIGNIFICATIONS[planet] ?? {};
    const base = (pd[area + 'Score'] as number) ?? 5;
    let adjusted = base;

    // Ashtakavarga self-strength (half weight — dignity & lordship carry more signal).
    const bindus = this._bindusForLord(planet);
    if (bindus != null) adjusted += bindusToScoreModifier(bindus) * 0.5;

    // Chart-aware strength: dignity, combustion, retro, house, functional nature.
    const strength = this._strengthFor(planet);
    if (strength) {
      adjusted += strength.total + this._lordshipAreaMod(planet, area);
    }

    return Math.max(1, Math.min(10, adjusted));
  }

  private _trendFromScore(score: number): PredictionResult['trend'] {
    if (score >= 7) return 'positive';
    if (score >= 5) return 'neutral';
    if (score >= 3) return 'mixed';
    return 'negative';
  }

  private _intensityLabel(rel: string, _area: string, score: number): string {
    let key: string;
    if (score >= 8 && rel === 'friend') key = 'very strong';
    else if (score >= 7 || rel === 'friend') key = 'strong';
    else if (score <= 3 && rel === 'enemy') key = 'very challenging';
    else if (score <= 4 || rel === 'enemy') key = 'challenging';
    else key = 'moderate';
    return intensityLabel(key, this._lang);
  }

  /** Localised enumerated terms (body parts, diseases…) for a planet. */
  private _terms(planet: string, kind: 'bodyParts' | 'diseases' | 'professions' | 'relationships' | 'keywords'): string[] {
    const sig = SIG_TEXT[planet];
    return sig ? pickList(sig[kind], this._lang) : [];
  }

  // ─── Health ──────────────────────────────────────────────────────────────

  generateHealthPrediction(mahadasha: string, antardasha?: string, pratyantardasha?: string): PredictionResult {
    const lang = this._lang;
    const bodyParts = this._terms(mahadasha, 'bodyParts');
    const diseases = this._terms(mahadasha, 'diseases');
    let score = this._planetScore(mahadasha, 'health');
    const spec = HEALTH_SPEC[mahadasha] ?? { details: { en: [], si: [] }, remedies: { en: [], si: [] } };
    const details: string[] = [];
    if (bodyParts.length) details.push(F_BODY_AREAS[lang](joinComma(bodyParts)));
    if (diseases.length) details.push(F_HEALTH_CONCERNS[lang](joinComma(diseases.slice(0, 3))));
    details.push(...pickList(spec.details, lang));
    const remedies = pickList(spec.remedies, lang);
    let rel = 'neutral';

    if (antardasha) {
      rel = this.getRelationship(mahadasha, antardasha);
      const adName = planetName(antardasha, lang);
      const adDiseases = this._terms(antardasha, 'diseases');
      const adBodyParts = this._terms(antardasha, 'bodyParts');
      const pairEff = getPairEffect(mahadasha, antardasha);
      if (pairEff) {
        details.push(F_SUB_PERIOD[lang](adName, pick(pairEff.health, lang)));
      } else {
        if (rel === 'friend') {
          details.push(F_AD_HEALTH_FRIEND[lang](adName));
          score = Math.min(10, score + 1);
        } else if (rel === 'enemy') {
          details.push(F_AD_HEALTH_ENEMY[lang](adName, joinComma(adBodyParts.slice(0, 2))));
          if (adDiseases.length) details.push(F_AD_HEALTH_COMBINED[lang](joinComma(adDiseases.slice(0, 2))));
          score = Math.max(1, score - 1);
        } else {
          details.push(F_AD_HEALTH_NEUTRAL[lang](adName, joinComma(adBodyParts.slice(0, 2))));
        }
      }
    }

    if (antardasha) {
      // The sub-lord's own natal condition colours how it delivers within the MD.
      const adStrength = this._strengthFor(antardasha);
      if (adStrength) score = Math.max(1, Math.min(10, score + adStrength.total * 0.25));
    }

    if (pratyantardasha) {
      const pdRel = this.getRelationship(antardasha ?? mahadasha, pratyantardasha);
      const pdName = planetName(pratyantardasha, lang);
      if (pdRel === 'enemy') {
        details.push(F_PD_HEALTH_ENEMY[lang](pdName));
        score = Math.max(1, score - 0.5);
      } else if (pdRel === 'friend') {
        details.push(F_PD_HEALTH_FRIEND[lang](pdName));
      }
    }

    const trend = this._trendFromScore(score);
    const intensity = this._intensityLabel(rel, 'health', score);
    const md = planetName(mahadasha, lang);
    const summary = score >= 7
      ? F_HEALTH_SUMMARY.good[lang](md)
      : score >= 5
        ? F_HEALTH_SUMMARY.balanced[lang](md)
        : F_HEALTH_SUMMARY.priority[lang](md);

    return { area:'health', trend, intensity, summary, details, remedies, keywords:[...bodyParts, ...diseases.slice(0,2)] };
  }

  // ─── Wealth ───────────────────────────────────────────────────────────────

  generateWealthPrediction(mahadasha: string, antardasha?: string, pratyantardasha?: string): PredictionResult {
    const lang = this._lang;
    let score = this._planetScore(mahadasha, 'wealth');
    const spec = WEALTH_SPEC[mahadasha] ?? { details: { en: [], si: [] }, remedies: { en: [], si: [] } };
    const details = pickList(spec.details, lang);
    const remedies = pickList(spec.remedies, lang);
    let rel = 'neutral';

    if (antardasha) {
      rel = this.getRelationship(mahadasha, antardasha);
      const adName = planetName(antardasha, lang);
      const pairEff = getPairEffect(mahadasha, antardasha);
      if (pairEff) {
        details.unshift(pick(pairEff.wealth, lang));
        score = Math.min(10, Math.max(1, score + pairEff.ratingMod * 0.5));
      } else {
        const adScore = this._planetScore(antardasha, 'wealth');
        if (rel === 'friend') { details.push(F_AD_WEALTH_FRIEND[lang](adName)); score = Math.min(10, score + 1); }
        else if (rel === 'enemy') { details.push(F_AD_WEALTH_ENEMY[lang](adName)); score = Math.max(1, score - 1); }
        else { score = (score + adScore) / 2; }
      }
    }

    if (antardasha) {
      const adStrength = this._strengthFor(antardasha);
      if (adStrength) score = Math.max(1, Math.min(10, score + adStrength.total * 0.25));
    }

    if (pratyantardasha) {
      const pdScore = this._planetScore(pratyantardasha, 'wealth');
      score = (score * 0.7) + (pdScore * 0.3);
    }

    const trend = this._trendFromScore(score);
    const intensity = this._intensityLabel(rel, 'wealth', score);
    const md = planetName(mahadasha, lang);
    const summary = score >= 7
      ? F_WEALTH_SUMMARY.strong[lang](md)
      : score >= 5
        ? F_WEALTH_SUMMARY.moderate[lang](md)
        : F_WEALTH_SUMMARY.careful[lang](md);

    return { area:'wealth', trend, intensity, summary, details, remedies, keywords:['money','income','savings','investments','wealth'] };
  }

  // ─── Career ───────────────────────────────────────────────────────────────

  generateCareerPrediction(mahadasha: string, antardasha?: string, pratyantardasha?: string): PredictionResult {
    const lang = this._lang;
    let score = this._planetScore(mahadasha, 'career');
    const professions = this._terms(mahadasha, 'professions');
    const spec = CAREER_SPEC[mahadasha] ?? { details: { en: [], si: [] }, remedies: { en: [], si: [] } };
    const details: string[] = professions.length ? [F_CAREER_AREAS[lang](joinComma(professions.slice(0, 4)))] : [];
    details.push(...pickList(spec.details, lang));
    const remedies = pickList(spec.remedies, lang);
    let rel = 'neutral';

    if (antardasha) {
      rel = this.getRelationship(mahadasha, antardasha);
      const adName = planetName(antardasha, lang);
      const pairEff = getPairEffect(mahadasha, antardasha);
      if (pairEff) {
        details.push(F_SUB_PERIOD[lang](adName, pick(pairEff.career, lang)));
        score = Math.min(10, Math.max(1, score + pairEff.ratingMod * 0.5));
      } else {
        if (rel === 'friend') { details.push(F_AD_CAREER_FRIEND[lang](adName)); score = Math.min(10, score + 1); }
        else if (rel === 'enemy') { details.push(F_AD_CAREER_ENEMY[lang](adName)); score = Math.max(1, score - 1); }
      }
    }

    if (antardasha) {
      const adStrength = this._strengthFor(antardasha);
      if (adStrength) score = Math.max(1, Math.min(10, score + adStrength.total * 0.25));
    }

    if (pratyantardasha) {
      const pdRel = this.getRelationship(antardasha ?? mahadasha, pratyantardasha);
      const pdName = planetName(pratyantardasha, lang);
      if (pdRel === 'enemy') details.push(F_PD_CAREER_ENEMY[lang](pdName));
      else if (pdRel === 'friend') details.push(F_PD_CAREER_FRIEND[lang](pdName));
    }

    const trend = this._trendFromScore(score);
    const intensity = this._intensityLabel(rel, 'career', score);
    const md = planetName(mahadasha, lang);
    const summary = score >= 7
      ? F_CAREER_SUMMARY.strong[lang](md)
      : score >= 5
        ? F_CAREER_SUMMARY.steady[lang](md)
        : F_CAREER_SUMMARY.patient[lang](md);

    return { area:'career', trend, intensity, summary, details, remedies, keywords:['job','profession','promotion','business',...professions.slice(0,2)] };
  }

  // ─── Relationships ────────────────────────────────────────────────────────

  generateRelationshipPrediction(mahadasha: string, antardasha?: string, pratyantardasha?: string): PredictionResult {
    const lang = this._lang;
    let score = this._planetScore(mahadasha, 'relationship');
    const relationships = this._terms(mahadasha, 'relationships');
    const spec = REL_SPEC[mahadasha] ?? { details: { en: [], si: [] }, remedies: { en: [], si: [] } };
    const details: string[] = relationships.length ? [F_KEY_RELATIONSHIPS[lang](joinComma(relationships))] : [];
    details.push(...pickList(spec.details, lang));
    const remedies = pickList(spec.remedies, lang);
    let rel = 'neutral';

    if (antardasha) {
      rel = this.getRelationship(mahadasha, antardasha);
      const adName = planetName(antardasha, lang);
      const pairEff = getPairEffect(mahadasha, antardasha);
      if (pairEff) {
        details.push(F_SUB_PERIOD[lang](adName, pick(pairEff.relationships, lang)));
        score = Math.min(10, Math.max(1, score + pairEff.ratingMod * 0.4));
      } else {
        if (rel === 'friend') { details.push(F_AD_REL_FRIEND[lang](adName)); score = Math.min(10, score + 1); }
        else if (rel === 'enemy') { details.push(F_AD_REL_ENEMY[lang](adName)); score = Math.max(1, score - 1); }
      }
    }

    if (antardasha) {
      const adStrength = this._strengthFor(antardasha);
      if (adStrength) score = Math.max(1, Math.min(10, score + adStrength.total * 0.25));
    }

    if (pratyantardasha) {
      const pdRel = this.getRelationship(antardasha ?? mahadasha, pratyantardasha);
      const pdName = planetName(pratyantardasha, lang);
      if (pdRel === 'enemy') details.push(F_PD_REL_ENEMY[lang](pdName));
      else if (pdRel === 'friend') details.push(F_PD_REL_FRIEND[lang](pdName));
    }

    const trend = this._trendFromScore(score);
    const intensity = this._intensityLabel(rel, 'relationship', score);
    const md = planetName(mahadasha, lang);
    const summary = score >= 7
      ? F_REL_SUMMARY.harmony[lang](md)
      : score >= 5
        ? F_REL_SUMMARY.stable[lang](md)
        : F_REL_SUMMARY.challenging[lang](md);

    return { area:'relationships', trend, intensity, summary, details, remedies, keywords:['marriage','spouse','love','family',...relationships.slice(0,2)] };
  }

  // ─── General ─────────────────────────────────────────────────────────────

  generateGeneralPrediction(mahadasha: string, antardasha?: string, pratyantardasha?: string): PredictionResult {
    const lang = this._lang;
    const pd = this.getPlanetData(mahadasha);
    const nature = (pd.nature as string) ?? 'neutral';
    const keywords = this._terms(mahadasha, 'keywords');
    let score = this._planetScore(mahadasha, 'health'); // balanced proxy
    score = (score + this._planetScore(mahadasha, 'career') + this._planetScore(mahadasha, 'wealth')) / 3;
    const specSrc = GENERAL_SPEC[mahadasha] ?? { details: { en: [], si: [] }, remedies: { en: [], si: [] } };
    const spec = { details: pickList(specSrc.details, lang), remedies: pickList(specSrc.remedies, lang) };
    let rel = 'neutral';

    if (antardasha) {
      rel = this.getRelationship(mahadasha, antardasha);
      const adName = planetName(antardasha, lang);
      const pairEff = getPairEffect(mahadasha, antardasha);
      if (pairEff) {
        score = Math.min(10, Math.max(1, score + pairEff.ratingMod * 0.5));
        if (pairEff.bonus) spec.details.unshift(`${BONUS_MARK}${pick(pairEff.bonus, lang)}`);
      } else {
        if (rel === 'friend') { spec.details.push(F_AD_GENERAL_FRIEND[lang](adName)); score = Math.min(10, score + 0.5); }
        else if (rel === 'enemy') { spec.details.push(F_AD_GENERAL_ENEMY[lang](adName)); }
      }
    }

    const trend = this._trendFromScore(score);
    const intensity = this._intensityLabel(rel, 'general', score);
    const md = planetName(mahadasha, lang);
    const summary = nature === 'benefic'
      ? F_GENERAL_SUMMARY.benefic[lang](md)
      : nature === 'malefic'
        ? F_GENERAL_SUMMARY.malefic[lang](md)
        : F_GENERAL_SUMMARY.neutral[lang](md);

    if (pratyantardasha) {
      const pdRel = this.getRelationship(antardasha ?? mahadasha, pratyantardasha);
      if (pdRel === 'friend') spec.details.push(F_SD_GENERAL_FRIEND[lang](planetName(pratyantardasha, lang)));
    }

    return { area:'general', trend, intensity, summary, details:spec.details, remedies:spec.remedies, keywords:keywords.slice(0,5) };
  }

  generateCompletePrediction(
    mahadasha: string,
    antardasha?: string,
    pratyantardasha?: string,
    sookshmaDasha?: string,
    chartCtx?: ChartContext,
    lang: Lang = 'en',
  ): DashaPrediction {
    this._ctx = chartCtx ?? null;
    this._lang = lang;
    this._strengthCache.clear();
    try {
    const pd = this.getPlanetData(mahadasha);
    const mdName = planetName(mahadasha, lang);
    const periodType = sookshmaDasha ? 'sookshma'
      : pratyantardasha ? 'pratyantardasha'
      : antardasha ? 'antardasha'
      : 'mahadasha';

    const health        = this.generateHealthPrediction(mahadasha, antardasha, pratyantardasha);
    const wealth        = this.generateWealthPrediction(mahadasha, antardasha, pratyantardasha);
    const career        = this.generateCareerPrediction(mahadasha, antardasha, pratyantardasha);
    const relationships = this.generateRelationshipPrediction(mahadasha, antardasha, pratyantardasha);
    const general       = this.generateGeneralPrediction(mahadasha, antardasha, pratyantardasha);

    // Score weighting: career 30%, wealth 25%, relationships 20%, health 15%, general 10%
    const hScore = this._planetScore(mahadasha,'health'), wScore = this._planetScore(mahadasha,'wealth'), cScore = this._planetScore(mahadasha,'career'), rScore = this._planetScore(mahadasha,'relationship');
    let weightedAvg = (cScore * 0.30 + wScore * 0.25 + rScore * 0.20 + hScore * 0.15 + 6 * 0.10);

    const pairEff = antardasha ? getPairEffect(mahadasha, antardasha) : null;
    if (pairEff) weightedAvg = Math.min(10, Math.max(1, weightedAvg + pairEff.ratingMod));

    // Current transits (Sade Sati, Guru blessing…) shift the overall outlook.
    const transitMod = this._ctx?.transitScoreMod ?? 0;
    if (transitMod !== 0) weightedAvg = Math.min(10, Math.max(1, weightedAvg + transitMod));

    const overallRating = Math.min(10, Math.max(1, Math.round(weightedAvg)));
    const nature = (pd.nature as string) ?? 'neutral';

    let overallTheme = pairEff
      ? pick(pairEff.theme, lang)
      : nature === 'benefic'
        ? F_THEME_BASE.benefic[lang](mdName)
        : nature === 'malefic'
          ? F_THEME_BASE.malefic[lang](mdName)
          : F_THEME_BASE.neutral[lang](mdName);

    if (!pairEff && antardasha) {
      const rel = this.getRelationship(mahadasha, antardasha);
      const adName = planetName(antardasha, lang);
      if (rel === 'friend') overallTheme += F_THEME_AD.friend[lang](adName);
      else if (rel === 'enemy') overallTheme += F_THEME_AD.enemy[lang](adName);
      else overallTheme += F_THEME_AD.neutral[lang](adName);
    }

    if (pratyantardasha) overallTheme += F_THEME_PD[lang](planetName(pratyantardasha, lang));
    if (sookshmaDasha) overallTheme += F_THEME_SD[lang](planetName(sookshmaDasha, lang));

    // Surface the dasha lord's Ashtakavarga strength when available.
    const lordBindus = this._bindusForLord(mahadasha);
    if (lordBindus != null) {
      overallTheme += F_THEME_BINDUS[lang](mdName, lordBindus, binduLabel(bindusToLabel(lordBindus), lang));
    }

    // Surface the dasha lord's natal house — the most important chart-specific
    // qualifier for any dasha prediction.
    const houseNote = this._houseAnnotation(mahadasha);
    if (houseNote) {
      general.details.unshift(houseNote);
      // If the antardasha lord is also placed, add its house too.
      if (antardasha) {
        const adNote = this._houseAnnotation(antardasha);
        if (adNote) general.details.splice(1, 0, F_SUB_PERIOD_PREFIX[lang](adNote));
      }
    }

    // Chart-aware strength annotations: dignity, combustion, retrogression,
    // functional nature — these are what make the prediction personal.
    const mdStrength = this._strengthFor(mahadasha);
    if (mdStrength) {
      const lordshipNote = this._lordshipAnnotation(mahadasha);
      if (lordshipNote) general.details.unshift(lordshipNote);
      general.details.unshift(...mdStrength.notes.slice(0, 3));

      // Headline the most decisive natal condition in the theme.
      if (mdStrength.dignity === 'exalted') {
        overallTheme += F_THEME_EXALTED[lang](mdName);
      } else if (mdStrength.dignity === 'debilitated' && mdStrength.neechaBhanga) {
        overallTheme += F_THEME_NEECHA_BHANGA[lang](mdName);
      } else if (mdStrength.dignity === 'debilitated') {
        overallTheme += F_THEME_DEBILITATED[lang](mdName);
      } else if (mdStrength.functionalNature === 'yogakaraka') {
        overallTheme += F_THEME_YOGAKARAKA[lang](mdName);
      }
    }
    if (antardasha) {
      const adStrength = this._strengthFor(antardasha);
      if (adStrength && adStrength.notes.length) {
        general.details.push(F_SUB_PERIOD_LORD[lang](adStrength.notes[0]));
      }
    }

    // Structured strength summaries for UI display.
    const lordStrengths: LordStrengthSummary[] = [];
    const toSummary = (planet: string, role: LordStrengthSummary['role']): LordStrengthSummary | null => {
      const s = this._strengthFor(planet);
      if (!s) return null;
      return {
        planet, role,
        dignity: s.dignity,
        neechaBhanga: s.neechaBhanga,
        isCombust: s.isCombust,
        isRetrograde: s.isRetrograde,
        functionalNature: s.functionalNature,
        lordedHouses: s.lordedHouses,
        natalHouse: s.natalHouse,
        strengthScore: s.total,
        notes: s.notes,
      };
    };
    const mdSummary = toSummary(mahadasha, 'mahadasha');
    if (mdSummary) lordStrengths.push(mdSummary);
    if (antardasha && antardasha !== mahadasha) {
      const adSummary = toSummary(antardasha, 'antardasha');
      if (adSummary) lordStrengths.push(adSummary);
    }

    const sig = SIG_TEXT[mahadasha];
    return {
      dashaLord: mahadasha, antardasha, pratyantardasha, sookshmaDasha,
      periodType, overallTheme, overallRating,
      predictions: { health, wealth, career, relationships, general },
      favorableActivities: this._favorable(mahadasha),
      unfavorableActivities: this._unfavorable(mahadasha),
      importantTransits: this._ctx?.transitNotes ?? [],
      lordStrengths: lordStrengths.length ? lordStrengths : undefined,
      gemstone: sig ? pick(sig.gemstone, lang) : ((pd.gemstone as string) ?? null),
      mantra: sig ? pick(sig.mantra, lang) : ((pd.mantra as string) ?? null),
      deity: sig ? pick(sig.deity, lang) : ((pd.deity as string) ?? null),
      combinationWarning: pairEff?.warning ? pick(pairEff.warning, lang) : undefined,
      combinationBonus: pairEff?.bonus ? pick(pairEff.bonus, lang) : undefined,
    };
    } finally {
      this._ctx = null;
      this._lang = 'en';
      this._strengthCache.clear();
    }
  }

  private _favorable(planet: string): string[] {
    const b = FAVORABLE[planet];
    return b ? pickList(b, this._lang) : [];
  }

  private _unfavorable(planet: string): string[] {
    const b = UNFAVORABLE[planet];
    return b ? pickList(b, this._lang) : [];
  }
}
