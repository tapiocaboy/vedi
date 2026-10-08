/**
 * The human-readable reading of one life area, plus its "astrology behind
 * this" view.
 *
 * Everything is derived from what the engine already computed — the additive
 * score parts (PredictionResult.explanation), the active classical indicators
 * (DashaPrediction.indicators) and the engine's own notes — and from the
 * measured track record in evidenceTable.ts. The builder adds wording, never
 * judgement: the plain "mainly because…" sentence simply names the largest
 * part of the score.
 */
import { type Lang, planetName } from './i18n';
import { AREA_LINE, type TrendKey } from './text/plainSummaryText';
import {
  READING_LABELS, SCORE_LINE, LEVEL_NAME, AREA_NAME, PART_LABEL, LORD_BITS, WHY, EVENT_NAME,
  INDICATOR_EVIDENCE_LINE, VERDICT, SCORE_EVIDENCE_LINE, EVIDENCE_FOOTNOTE, GENERAL_LINE,
} from './text/readingText';
import { INDICATOR_TEXT } from './text/indicatorText';
import { INDICATOR_EVIDENCE, SCORE_EVIDENCE, EVIDENCE_META } from './evidenceTable';
import { INDICATORS, type IndicatorArea, type IndicatorKey } from './classicalIndicators';
import type { AreaExplanation, ScorePart, IndicatorHit } from './predictions';

/**
 * Show the measured track record (evidenceTable.ts) beside each indicator and
 * score. One switch for every reading in the app — off: the user chose not to
 * show it. The evidence table and wording stay in place for when it returns.
 */
export const SHOW_EVIDENCE = false;

/** A difference is called "clear" only at |z| ≥ 3: about 36 indicators are shown side by side. */
const CLEAR_Z = 3;
/** Parts smaller than this do not get to be the headline reason. */
const MIN_WHY_POINTS = 0.15;

export interface ReadingRow {
  /** Signed contribution in points. */
  points: number;
  label: string;
  /** Technical detail line (lordship, placement, dignity…), or null. */
  detail: string | null;
  notes: string[];
}

export interface IndicatorRow {
  key: IndicatorKey;
  tone: 'support' | 'strain';
  text: string;
  /** The measured track record in one sentence, or null when evidence is hidden. */
  evidence: string | null;
  verdict: 'none' | 'more' | 'less' | null;
}

export interface AreaReading {
  area: IndicatorArea;
  /** The plain one-liner for the area, without a "Career:" lead-in. */
  plainLine: string;
  /** "Mainly lifted by…" — the largest part of the score, in plain words. Null when nothing stands out. */
  why: string | null;
  scoreLine: string;
  start: { label: string; value: number };
  rows: ReadingRow[];
  indicators: IndicatorRow[];
  /** Shown when `indicators` is empty. */
  indicatorsEmpty: string;
  /** Shown under the indicators when transit combinations could not be evaluated. */
  noSkyNote: string | null;
  scoreEvidence: string | null;
  footnote: string | null;
  notes: string[];
  labels: { show: string; hide: string; whyRating: string; scoreBuild: string; combos: string; tested: string; notes: string };
}

export interface AreaReadingInput {
  area: IndicatorArea;
  lang: Lang;
  score: number;
  trend: string;
  explanation?: AreaExplanation;
  /** Engine notes for the area (already localised). */
  details?: string[];
  /** Every indicator active for the period; the builder keeps this area's. */
  indicators?: IndicatorHit[];
  /** True when today's sky was available, i.e. transit indicators were evaluated. */
  hasSky: boolean;
  /** Mahadasha lord — names the classical pairing in a sub-period row. */
  mahadasha?: string;
  /** The overall rating (DashaPrediction.overallExplanation) rather than the general area. */
  overall?: boolean;
  /** Override SHOW_EVIDENCE for this reading. */
  showEvidence?: boolean;
}

const fill = (t: string, v: Record<string, string | number>) => t.replace(/\{(\w+)\}/g, (m, k: string) => (k in v ? String(v[k]) : m));
const pct = (x: number) => Math.round(x * 100);
const capitalise = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
const TRENDS: TrendKey[] = ['positive', 'neutral', 'mixed', 'negative'];

/** The plain one-liner for an area: AREA_LINE without its "Career:" lead-in, or GENERAL_LINE. */
export function plainAreaLine(area: 'career' | 'wealth' | 'relationships' | 'health' | 'general', trend: string, lang: Lang): string {
  const t: TrendKey = TRENDS.includes(trend as TrendKey) ? (trend as TrendKey) : 'neutral';
  if (area === 'general') return GENERAL_LINE[t][lang];
  const body = AREA_LINE[area][t][lang].replace(/^[^:：]{1,24}[:：]\s*/, '');
  return body.charAt(0).toUpperCase() + body.slice(1);
}

function lordDetail(p: ScorePart, lang: Lang): string | null {
  const l = p.lord;
  if (!l) return null;
  const bits: string[] = [];
  if (l.lordedHouses.length) bits.push(fill(LORD_BITS.lordOf[lang], { list: l.lordedHouses.join(', ') }));
  if (l.natalHouse) bits.push(fill(LORD_BITS.inHouse[lang], { n: l.natalHouse }));
  if (l.dignity && l.dignity in LORD_BITS) bits.push(LORD_BITS[l.dignity as 'exalted'][lang]);
  if (l.neechaBhanga) bits.push(LORD_BITS.neechaBhanga[lang]);
  if (l.functionalNature && l.functionalNature !== 'neutral' && l.functionalNature in LORD_BITS) bits.push(LORD_BITS[l.functionalNature as 'yogakaraka'][lang]);
  if (l.combust) bits.push(LORD_BITS.combust[lang]);
  if (l.retrograde && p.planet !== 'Rahu' && p.planet !== 'Ketu') bits.push(LORD_BITS.retrograde[lang]);
  if (l.bindus != null) bits.push(fill(LORD_BITS.bindus[lang], { n: l.bindus }));
  bits.push(fill(LORD_BITS.own[lang], { x: l.areaScore.toFixed(1) }));
  return bits.join(' · ');
}

function partLabel(p: ScorePart, lang: Lang, mahadasha?: string): string {
  const planet = p.planet ? planetName(p.planet, lang) : '';
  switch (p.kind) {
    case 'dasha': return fill(PART_LABEL.dasha[lang], { planet, level: LEVEL_NAME[p.level ?? 0][lang] });
    case 'foundation': return PART_LABEL.foundation[lang];
    case 'activation': return PART_LABEL.activation[lang];
    case 'separative': return fill(PART_LABEL.separative[lang], { planets: (p.planets ?? []).map(x => planetName(x, lang)).join(', ') });
    case 'area': return fill(PART_LABEL.area[lang], { area: AREA_NAME[p.area as keyof typeof AREA_NAME]?.[lang] ?? p.area ?? '' });
    case 'transit': return PART_LABEL.transit[lang];
    case 'subPeriod': {
      const rel = p.relation ?? 'neutral';
      return fill(PART_LABEL[rel][lang], { planet, md: mahadasha ? planetName(mahadasha, lang) : '' });
    }
  }
}

function whySentence(parts: ScorePart[], lang: Lang): string | null {
  const top = [...parts].sort((a, b) => Math.abs(b.points) - Math.abs(a.points))[0];
  if (!top || Math.abs(top.points) < MIN_WHY_POINTS) return null;
  const up = top.points > 0;
  const planet = top.planet ? planetName(top.planet, lang) : '';
  switch (top.kind) {
    case 'dasha': return fill(WHY[up ? 'dashaUp' : 'dashaDown'][lang], { planet, level: LEVEL_NAME[top.level ?? 0][lang] });
    case 'foundation': return WHY[up ? 'foundationUp' : 'foundationDown'][lang];
    case 'activation': return WHY[up ? 'activationUp' : 'activationDown'][lang];
    case 'separative': return fill(WHY.separative[lang], { planets: (top.planets ?? []).map(x => planetName(x, lang)).join(', ') });
    case 'subPeriod': return fill(WHY[up ? 'subUp' : 'subDown'][lang], { planet });
    case 'area': return fill(WHY[up ? 'areaUp' : 'areaDown'][lang], { area: AREA_NAME[top.area as keyof typeof AREA_NAME]?.[lang] ?? '' });
    case 'transit': return WHY[up ? 'transitUp' : 'transitDown'][lang];
  }
}

function indicatorRow(hit: IndicatorHit, lang: Lang, show: boolean): IndicatorRow {
  const def = INDICATORS.find(d => d.key === hit.key)!;
  const text = fill(INDICATOR_TEXT[hit.key][lang], { planet: hit.planet ? planetName(hit.planet, lang) : '' });
  const ev = INDICATOR_EVIDENCE[def.evidence];
  if (!show || !ev) return { key: hit.key, tone: hit.tone, text, evidence: null, verdict: null };
  const verdict = Math.abs(ev.z) >= CLEAR_Z ? (ev.lift > 1 ? 'more' : 'less') : 'none';
  const event = def.evidence.charAt(0) as 'A' | 'M' | 'U';
  const evidence = fill(INDICATOR_EVIDENCE_LINE[lang], {
    a: pct(ev.eventShare), b: pct(ev.baseShare), n: ev.n, events: EVENT_NAME[event][lang], verdict: VERDICT[verdict][lang],
  });
  return { key: hit.key, tone: hit.tone, text, evidence, verdict };
}

function scoreEvidence(area: IndicatorArea | 'overall', lang: Lang, show: boolean): string | null {
  if (!show) return null;
  const e = SCORE_EVIDENCE[area];
  if (!e) return null;
  const right = e.want === 'high' ? e.lo > 0.5 : e.hi < 0.5;
  const wrong = e.want === 'high' ? e.hi < 0.5 : e.lo > 0.5;
  const verdict = wrong ? 'wrongWay' : right ? 'more' : 'chance';
  return fill(SCORE_EVIDENCE_LINE[lang], { n: e.n, events: EVENT_NAME[e.event][lang], p: pct(e.mean), verdict: VERDICT[verdict][lang] });
}

export function buildAreaReading(input: AreaReadingInput): AreaReading | null {
  const { area, lang, score, trend, explanation, details = [], indicators = [], hasSky, mahadasha, overall, showEvidence = SHOW_EVIDENCE } = input;
  if (!explanation) return null;
  const L = READING_LABELS;
  const rows: ReadingRow[] = explanation.parts.map(p => ({
    points: p.points,
    label: capitalise(partLabel(p, lang, mahadasha)),
    detail: p.kind === 'dasha' ? lordDetail(p, lang) : null,
    notes: p.notes,
  }));
  const mine = indicators.filter(h => h.area === area).map(h => indicatorRow(h, lang, showEvidence));
  // The engine's notes repeat what the score parts already show (foundation and
  // activation lines, lord conditions); keep only the ones that add something.
  const shown = rows.flatMap(r => r.notes);
  const extra = details.filter(d => !shown.some(n => d.includes(n)));
  const anySky = INDICATORS.some(d => d.area === area && d.needsSky);
  const meta = EVIDENCE_META;
  return {
    area,
    plainLine: plainAreaLine(area, trend, lang),
    why: whySentence(explanation.parts, lang),
    scoreLine: fill(SCORE_LINE[lang], { score: score.toFixed(1), p: explanation.percentile }),
    start: { label: L.start[lang], value: explanation.neutral },
    rows,
    indicators: mine,
    indicatorsEmpty: L.combosNone[lang],
    noSkyNote: !hasSky && anySky ? L.combosNoSky[lang] : null,
    scoreEvidence: scoreEvidence(overall ? 'overall' : area, lang, showEvidence),
    footnote: showEvidence
      ? fill(EVIDENCE_FOOTNOTE[lang], { people: meta.people, total: meta.events.A + meta.events.M + meta.events.U })
      : null,
    notes: extra.slice(0, 6),
    labels: {
      show: L.showWhy[lang], hide: L.hideWhy[lang], whyRating: L.whyRating[lang], scoreBuild: L.scoreBuild[lang],
      combos: L.combos[lang], tested: L.tested[lang], notes: L.notes[lang],
    },
  };
}
