/**
 * Western Matching Service — assembles both charts and runs the synastry
 * engine. Mirrors `matchingService.ts`'s role on the Vedic side; no
 * Ashtakoot/Porutham equivalent exists for Western technique, so this is
 * synastry alone (see WESTERN_TODO.md §1 for the scope decision).
 */

import { getWesternPositions } from '../core/western/westernEphemeris';
import { buildWesternChart } from '../core/western/chart';
import { runWesternSynastry, type WesternSynastryResult } from '../core/western/synastry';
import type { BirthData } from '../../types/astrology';
import type { WesternChart } from '../../types/westernAstrology';
import type { Lang, TableLang } from '../core/i18n';
import { en2si } from '../core/i18n';


export interface WesternMatchSummary {
  personChart: WesternChart;
  partnerChart: WesternChart;
  synastry: WesternSynastryResult;
}

const LABELS: Record<TableLang, { you: string; them: string }> = {
  en: { you: 'Your', them: 'their' },
  si: { you: 'ඔබේ', them: 'ඔවුන්ගේ' },
};

export async function runWesternMatching(
  person: BirthData, partner: BirthData, lang: Lang = 'en',
): Promise<WesternMatchSummary> {
  const [personRaw, partnerRaw] = await Promise.all([
    getWesternPositions(person.date, person.latitude, person.longitude, person.timezone),
    getWesternPositions(partner.date, partner.latitude, partner.longitude, partner.timezone),
  ]);
  const personChart = buildWesternChart(person, personRaw);
  const partnerChart = buildWesternChart(partner, partnerRaw);
  const { you, them } = LABELS[en2si(lang)];
  const synastry = runWesternSynastry(personChart, partnerChart, you, them, lang);
  return { personChart, partnerChart, synastry };
}
