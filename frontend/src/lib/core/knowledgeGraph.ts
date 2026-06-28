/**
 * Knowledge-graph text rendering.
 *
 * Turns a current-period prediction (DashaPredictionData) into a structured,
 * plain-English Markdown section describing the entities that shape the current
 * period — the guiding planets (active dashas), the life themes (houses) they
 * activate, the life-area trends, and what needs attention. This is the same
 * information the on-screen Knowledge Graph shows, serialised so it can be
 * exported and fed to the chat model for current-period predictions.
 */

import type { DashaPredictionData, LordStrengthData } from '../../services/api';
import {
  labelPlanet, labelArea, labelDignity, labelTrend,
  labelPlanetTheme, labelHouseTheme, labelHouseCovers, labelDashaScope,
} from '../../i18n/astroLabels';

const DUSTHANA = new Set([6, 8, 12]);

function strengthLabel(score: number): string {
  if (score >= 1) return 'Strong';
  if (score >= 0) return 'Steady';
  if (score >= -1) return 'Under pressure';
  return 'Challenged';
}

function isCritical(ls?: LordStrengthData): boolean {
  if (!ls) return false;
  return (
    ls.strengthScore < 0 || ls.dignity === 'debilitated' || ls.dignity === 'enemy-sign' ||
    ls.isCombust || ls.functionalNature === 'functional-malefic'
  );
}

function isSupportive(ls?: LordStrengthData): boolean {
  if (!ls) return false;
  return (
    ls.strengthScore >= 1 || ls.dignity === 'exalted' || ls.dignity === 'own-sign' ||
    ls.functionalNature === 'yogakaraka' || ls.functionalNature === 'functional-benefic'
  );
}

function outlookWord(rating: number): string {
  if (rating >= 8) return 'Excellent';
  if (rating >= 6) return 'Good';
  if (rating >= 4) return 'Mixed';
  return 'Challenging';
}

function houseThemes(houses: number[]): string {
  return houses.map(h => `${labelHouseTheme(h, 'en')} (${h}H)`).join(', ');
}

/** Build the Markdown "Knowledge Graph" section from a current-period prediction. */
export function buildKnowledgeGraphMarkdown(prediction: DashaPredictionData): string {
  const L: string[] = [];
  const push = (s = '') => L.push(s);
  const lords = prediction.lordStrengths ?? [];
  const cp = prediction.currentPeriods;

  const findLs = (lord: string, role: 'mahadasha' | 'antardasha') =>
    lords.find(l => l.planet === lord && l.role === role) ?? lords.find(l => l.planet === lord);

  push('## Knowledge Graph — Current Period');
  push();
  push('_A relationship map of the influences active right now: the guiding planets (running dashas), the life themes (houses) each one activates, and the life-area trends. Use this section for any "current period / right now" questions._');
  push();
  push(`**Overall outlook:** ${outlookWord(prediction.overallRating)} (${prediction.overallRating}/10)`);
  if (prediction.overallTheme) push(`**Theme:** ${prediction.overallTheme}`);
  push();

  // ── Guiding planets (the running dasha chain) ──────────────────────────────
  const chain: { lord: string; role: 'mahadasha' | 'antardasha'; level: string }[] = [];
  if (cp) {
    chain.push({ lord: cp.mahadasha.lord, role: 'mahadasha', level: 'Mahadasha' });
    if (cp.antardasha)      chain.push({ lord: cp.antardasha.lord,      role: 'antardasha', level: 'Antardasha' });
    if (cp.pratyantardasha) chain.push({ lord: cp.pratyantardasha.lord, role: 'antardasha', level: 'Pratyantardasha' });
    if (cp.sookshmaDasha)   chain.push({ lord: cp.sookshmaDasha.lord,   role: 'antardasha', level: 'Sookshma Dasha' });
  }

  if (chain.length) {
    push('### Guiding Planets (active dashas)');
    push();
    push('| Level | Planet | Represents | Dignity | Strength | Status | Activates (life themes) | Sits in |');
    push('| --- | --- | --- | --- | --- | --- | --- | --- |');
    for (const d of chain) {
      const ls = findLs(d.lord, d.role);
      const status = isCritical(ls) ? 'Needs attention' : isSupportive(ls) ? 'Supportive' : 'Steady';
      const strength = ls ? `${ls.strengthScore > 0 ? '+' : ''}${ls.strengthScore.toFixed(1)} (${strengthLabel(ls.strengthScore)})` : '—';
      const dignity = ls?.dignity ? labelDignity(ls.dignity, 'en') : '—';
      const activates = ls?.lordedHouses.length ? houseThemes(ls.lordedHouses) : '—';
      const sitsIn = ls?.natalHouse != null ? `${labelHouseTheme(ls.natalHouse, 'en')} (${ls.natalHouse}H)` : '—';
      const level = `${d.level}${labelDashaScope(d.level, 'en') ? ` — ${labelDashaScope(d.level, 'en')}` : ''}`;
      push(`| ${level} | ${labelPlanet(d.lord, 'en')} | ${labelPlanetTheme(d.lord, 'en')} | ${dignity} | ${strength} | ${status} | ${activates} | ${sitsIn} |`);
    }
    push();
  }

  // ── Life areas ──────────────────────────────────────────────────────────────
  const areaKeys = ['career', 'wealth', 'relationships', 'health'] as const;
  push('### Life Areas (current trend)');
  push();
  push('| Area | Trend | Summary |');
  push('| --- | --- | --- |');
  for (const key of areaKeys) {
    const a = prediction.predictions[key];
    if (!a) continue;
    push(`| ${labelArea(key, 'en')} | ${labelTrend(a.trend, 'en')} | ${a.summary} |`);
  }
  push();

  // ── Needs attention ─────────────────────────────────────────────────────────
  const criticalPlanets = chain
    .map(d => ({ d, ls: findLs(d.lord, d.role) }))
    .filter(x => isCritical(x.ls));
  const criticalHouses = new Set<number>();
  for (const { ls } of chain.map(d => ({ ls: findLs(d.lord, d.role) }))) {
    if (!ls) continue;
    for (const h of ls.lordedHouses) if (DUSTHANA.has(h)) criticalHouses.add(h);
    if (ls.natalHouse != null && DUSTHANA.has(ls.natalHouse)) criticalHouses.add(ls.natalHouse);
  }
  const criticalAreas = areaKeys.filter(k => prediction.predictions[k]?.trend === 'negative');

  if (criticalPlanets.length || criticalHouses.size || criticalAreas.length) {
    push('### Needs Attention This Period');
    push();
    for (const { d, ls } of criticalPlanets) {
      const reasons: string[] = [];
      if (ls && ls.strengthScore < 0) reasons.push('weak in the natal chart');
      if (ls?.dignity === 'debilitated') reasons.push('debilitated');
      if (ls?.dignity === 'enemy-sign') reasons.push('in an enemy sign');
      if (ls?.isCombust) reasons.push('combust');
      if (ls?.functionalNature === 'functional-malefic') reasons.push('a functional malefic here');
      push(`- **${labelPlanet(d.lord, 'en')}** (${d.level} — ${labelPlanetTheme(d.lord, 'en')})${reasons.length ? ` — ${reasons.join(', ')}` : ''}.`);
    }
    for (const h of [...criticalHouses].sort((a, b) => a - b)) {
      push(`- **${labelHouseTheme(h, 'en')} (${h}H)** — a naturally sensitive (dusthana) life theme: ${labelHouseCovers(h, 'en')}.`);
    }
    for (const k of criticalAreas) {
      push(`- **${labelArea(k, 'en')}** — trending challenging: ${prediction.predictions[k].summary}`);
    }
    push();
  }

  // ── Relationships (graph edges) ───────────────────────────────────────────────
  push('### Relationships');
  push();
  for (const d of chain) {
    const ls = findLs(d.lord, d.role);
    if (!ls) continue;
    if (ls.lordedHouses.length)
      push(`- ${labelPlanet(d.lord, 'en')} (${labelPlanetTheme(d.lord, 'en')}) → influences your ${houseThemes(ls.lordedHouses)}.`);
    if (ls.natalHouse != null)
      push(`- ${labelPlanet(d.lord, 'en')} sits in your ${labelHouseTheme(ls.natalHouse, 'en')} (${ls.natalHouse}H) area.`);
  }
  if (chain.length > 1)
    push(`- Dasha sequence (broad → fine): ${chain.map(d => labelPlanet(d.lord, 'en')).join(' → ')}.`);
  push();

  // ── Period guidance ───────────────────────────────────────────────────────────
  const good = prediction.favorableActivities?.slice(0, 5) ?? [];
  const bad = prediction.unfavorableActivities?.slice(0, 5) ?? [];
  if (good.length || bad.length || prediction.combinationBonus || prediction.combinationWarning) {
    push('### Period Guidance');
    push();
    if (good.length) push(`**Favourable now:** ${good.join('; ')}.`);
    if (bad.length) push(`**Best avoided now:** ${bad.join('; ')}.`);
    if (prediction.combinationBonus) push(`**Bonus combination:** ${prediction.combinationBonus}`);
    if (prediction.combinationWarning) push(`**Caution combination:** ${prediction.combinationWarning}`);
    const { gemstone, mantra, deity } = prediction.remedies;
    const remedyBits = [gemstone && `Gemstone: ${gemstone}`, mantra && `Mantra/affirmation: ${mantra}`, deity && `Deity: ${deity}`].filter(Boolean);
    if (remedyBits.length) push(`**Remedies:** ${remedyBits.join(' · ')}.`);
    push();
  }

  return L.join('\n');
}
