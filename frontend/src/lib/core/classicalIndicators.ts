/**
 * Classical combinations behind each life area — which are active right now.
 *
 * These are the textbook Parashari / Jaimini / gochara indicators an astrologer
 * would cite for a period: the running dasha lords tied to the houses of the
 * matter, the Jaimini and natural significators, Jupiter and Saturn crossing
 * those houses (the "double transit"), Sade Sati, wealth and raja yogas.
 *
 * Each definition is the SAME rule that was scored against the 550-lives
 * backtest (backtest/combos.ts, pre-registered before it ran) — so every
 * indicator can carry its measured track record (see evidenceTable.ts). A
 * parity check (backtest/parity.ts) asserts the two implementations agree.
 *
 * Indicators describe the period in classical terms; they do not change any
 * score. Transit indicators need the current sky and are skipped without it.
 */
import { RASHI_LORDS } from './planetaryAnalysis';
import { aspectsRashi } from './natalFoundation';
import { functionalNatureFor } from './dashaStrength';
import { judgeLordPair } from './dashaLordRelation';
import { DASHA_SEQUENCE } from './dasha';
import { YogaCalculator } from './yogas';
import type { ChartContext } from './predictions';

export type IndicatorArea = 'career' | 'wealth' | 'relationships' | 'health' | 'general';
/** Backtest event type an indicator was scored against: rise, marriage, upheaval. */
export type EvidenceEvent = 'A' | 'M' | 'U';

export type IndicatorKey =
  | 'careerMdLinked' | 'careerAdLinked' | 'careerAmatyakaraka' | 'careerKarakaPeriod'
  | 'careerJupiter' | 'careerSaturn' | 'careerDoubleTransit' | 'careerConvergence'
  | 'marriageMdLinked' | 'marriageAdLinked' | 'marriageDarakaraka' | 'marriageVenusPeriod'
  | 'marriageJupiter' | 'marriageSaturn' | 'marriageDoubleTransit' | 'marriageNodes' | 'marriageConvergence'
  | 'healthMdLinked' | 'healthAdLinked' | 'healthSaturn8th' | 'sadeSatiRising' | 'sadeSatiPeak' | 'sadeSatiSetting'
  | 'ashtamaShani' | 'kantakaShani' | 'healthConvergence'
  | 'wealthDhanaYoga' | 'wealthJupiterFromMoon' | 'wealthJupiterSav'
  | 'pairGood' | 'pairBad' | 'adShadashtaka' | 'adYogakaraka' | 'rajaYogaPeriod' | 'saturnFromMoonGood' | 'chidraAntardasha';

export interface IndicatorDef {
  key: IndicatorKey;
  area: IndicatorArea;
  /** 'support' reads as help for the area; 'strain' as pressure on it. */
  tone: 'support' | 'strain';
  needsSky: boolean;
  /** Evidence row in evidenceTable.ts: `${event}|${backtest key}`. */
  evidence: `${EvidenceEvent}|${string}`;
}

/** Display order within each area. */
export const INDICATORS: IndicatorDef[] = [
  { key: 'careerMdLinked', area: 'career', tone: 'support', needsSky: false, evidence: 'A|A MD connected H' },
  { key: 'careerAdLinked', area: 'career', tone: 'support', needsSky: false, evidence: 'A|A AD connected H' },
  { key: 'careerAmatyakaraka', area: 'career', tone: 'support', needsSky: false, evidence: 'A|A MD|AD Jaimini AmK' },
  { key: 'careerKarakaPeriod', area: 'career', tone: 'support', needsSky: false, evidence: 'A|A MD|AD natural karaka' },
  { key: 'careerJupiter', area: 'career', tone: 'support', needsSky: true, evidence: 'A|A Jup on H' },
  { key: 'careerSaturn', area: 'career', tone: 'support', needsSky: true, evidence: 'A|A Sat on H' },
  { key: 'careerDoubleTransit', area: 'career', tone: 'support', needsSky: true, evidence: 'A|A double transit H' },
  { key: 'careerConvergence', area: 'career', tone: 'support', needsSky: true, evidence: 'A|A convergence >= 5' },

  { key: 'marriageMdLinked', area: 'relationships', tone: 'support', needsSky: false, evidence: 'M|M MD connected H' },
  { key: 'marriageAdLinked', area: 'relationships', tone: 'support', needsSky: false, evidence: 'M|M AD connected H' },
  { key: 'marriageDarakaraka', area: 'relationships', tone: 'support', needsSky: false, evidence: 'M|M MD|AD Jaimini DK' },
  { key: 'marriageVenusPeriod', area: 'relationships', tone: 'support', needsSky: false, evidence: 'M|M MD|AD natural karaka' },
  { key: 'marriageJupiter', area: 'relationships', tone: 'support', needsSky: true, evidence: 'M|M Jup on H' },
  { key: 'marriageSaturn', area: 'relationships', tone: 'support', needsSky: true, evidence: 'M|M Sat on H' },
  { key: 'marriageDoubleTransit', area: 'relationships', tone: 'support', needsSky: true, evidence: 'M|M double transit H' },
  { key: 'marriageNodes', area: 'relationships', tone: 'support', needsSky: true, evidence: 'M|M nodes on H axis' },
  { key: 'marriageConvergence', area: 'relationships', tone: 'support', needsSky: true, evidence: 'M|M convergence >= 5' },

  { key: 'healthMdLinked', area: 'health', tone: 'strain', needsSky: false, evidence: 'U|U MD connected H' },
  { key: 'healthAdLinked', area: 'health', tone: 'strain', needsSky: false, evidence: 'U|U AD connected H' },
  { key: 'healthSaturn8th', area: 'health', tone: 'strain', needsSky: true, evidence: 'U|U Sat on H' },
  { key: 'sadeSatiRising', area: 'health', tone: 'strain', needsSky: true, evidence: 'U|* Sade Sati rising' },
  { key: 'sadeSatiPeak', area: 'health', tone: 'strain', needsSky: true, evidence: 'U|* Sade Sati peak' },
  { key: 'sadeSatiSetting', area: 'health', tone: 'strain', needsSky: true, evidence: 'U|* Sade Sati setting' },
  { key: 'ashtamaShani', area: 'health', tone: 'strain', needsSky: true, evidence: 'U|* Ashtama Shani' },
  { key: 'kantakaShani', area: 'health', tone: 'strain', needsSky: true, evidence: 'U|* Kantaka Shani' },
  { key: 'healthConvergence', area: 'health', tone: 'strain', needsSky: true, evidence: 'U|U convergence >= 5' },

  { key: 'wealthDhanaYoga', area: 'wealth', tone: 'support', needsSky: false, evidence: 'A|* AD in dhana yoga' },
  { key: 'wealthJupiterFromMoon', area: 'wealth', tone: 'support', needsSky: true, evidence: 'A|* Jup good from Moon' },
  { key: 'wealthJupiterSav', area: 'wealth', tone: 'support', needsSky: true, evidence: 'A|* Jup sign SAV >= 30' },

  { key: 'pairGood', area: 'general', tone: 'support', needsSky: false, evidence: 'A|* MD-AD pair good' },
  { key: 'pairBad', area: 'general', tone: 'strain', needsSky: false, evidence: 'U|* MD-AD pair bad' },
  { key: 'adShadashtaka', area: 'general', tone: 'strain', needsSky: false, evidence: 'U|* AD 6/8 from MD' },
  { key: 'adYogakaraka', area: 'general', tone: 'support', needsSky: false, evidence: 'A|* AD yogakaraka' },
  { key: 'rajaYogaPeriod', area: 'general', tone: 'support', needsSky: false, evidence: 'A|* MD+AD in raja yoga' },
  { key: 'saturnFromMoonGood', area: 'general', tone: 'support', needsSky: true, evidence: 'A|* Sat good from Moon' },
  { key: 'chidraAntardasha', area: 'general', tone: 'strain', needsSky: false, evidence: 'U|* last AD of MD (chidra)' },
];

/** Signs (0–11) of the current transit planets the indicators read. */
export interface TransitSigns { Jupiter: number; Saturn: number; Rahu: number }

/** TransitSigns from a gochara transit list ('JUPITER' or 'Jupiter' keys); undefined if a body is missing. */
export function transitSignsFrom(transits: { planet: string; rashi: number }[]): TransitSigns | undefined {
  const find = (p: string) => transits.find(t => t.planet.toUpperCase() === p)?.rashi;
  const Jupiter = find('JUPITER'), Saturn = find('SATURN'), Rahu = find('RAHU');
  return Jupiter == null || Saturn == null || Rahu == null ? undefined : { Jupiter, Saturn, Rahu };
}

export interface ActiveIndicator {
  def: IndicatorDef;
  /** The planet the indicator is about, when one is named in its wording. */
  planet?: string;
  /** House number the indicator is about (10th for career…), for the wording. */
  house?: number;
}

// ── shared primitives (mirror backtest/combos.ts exactly) ────────────────────

const NODES = new Set(['Rahu', 'Ketu']);
const P9 = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
const P7 = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
const signOfHouse = (h: number, ref: number) => (ref + h - 1) % 12;
const houseFrom = (rashi: number, ref: number) => ((rashi - ref + 12) % 12) + 1;
const onSign = (planet: string, s: number, target: number) => s === target || aspectsRashi(planet, s, target);

/** Rules, occupies, aspects, or sits with the lord of, a house in H (nodes: occupy, sit with a lord, or via their dispositor). */
export function connectedTo(rashi: Record<string, number>, planet: string, H: number[], ref: number, depth = 0): boolean {
  const r = rashi[planet];
  if (r == null) return false;
  const signs = H.map(h => signOfHouse(h, ref));
  if (signs.includes(r)) return true;
  if (signs.map(s => rashi[RASHI_LORDS[s]]).includes(r)) return true;
  if (!NODES.has(planet)) {
    if (signs.some(s => RASHI_LORDS[s] === planet)) return true;
    return signs.some(s => aspectsRashi(planet, r, s));
  }
  if (depth > 0) return false;
  const disp = RASHI_LORDS[r];
  return signs.some(s => RASHI_LORDS[s] === disp) || signs.includes(rashi[disp]);
}

/** Jaimini chara karakas, seven-planet scheme: highest degree-in-sign = Atmakaraka … lowest = Darakaraka. */
export function charaKarakas(longitudes: Record<string, number>): Record<'AK' | 'AmK' | 'BK' | 'MK' | 'PK' | 'GK' | 'DK', string> | null {
  if (!P7.every(p => longitudes[p] != null)) return null;
  const byDeg = [...P7].sort((a, b) => (longitudes[b] % 30) - (longitudes[a] % 30));
  const [AK, AmK, BK, MK, PK, GK, DK] = byDeg;
  return { AK, AmK, BK, MK, PK, GK, DK };
}

const tc = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

/**
 * Which classical indicators are active for the running chain (mahadasha,
 * antardasha, pratyantardasha…) in this chart, optionally under the current sky.
 */
export function activeIndicators(chain: string[], ctx: ChartContext, sky?: TransitSigns): ActiveIndicator[] {
  const rashi = ctx.planetRashis;
  const lagna = ctx.ascendantRashi;
  const moon = ctx.moonRashi ?? rashi?.Moon;
  if (!rashi || lagna == null || moon == null || !P9.every(p => rashi[p] != null)) return [];
  const [md, ad = md, pd = ad] = chain;
  if (!md) return [];

  const karakas = ctx.planetLongitudes ? charaKarakas(ctx.planetLongitudes) : null;
  const conn = (p: string, h: number, ref = lagna) => connectedTo(rashi, p, [h], ref);
  const hs = (h: number, ref = lagna) => signOfHouse(h, ref);
  const jupOn = (h: number, ref = lagna) => !!sky && onSign('Jupiter', sky.Jupiter, hs(h, ref));
  const satOn = (h: number, ref = lagna) => !!sky && onSign('Saturn', sky.Saturn, hs(h, ref));
  const nodesOn = (h: number, ref = lagna) => !!sky && (sky.Rahu === hs(h, ref) || (sky.Rahu + 6) % 12 === hs(h, ref));

  // the convergence count of combos.ts: eleven votes for one event type
  const votes = (h: number, karaka: string[], jai: string | null) =>
    +conn(md, h) + +conn(ad, h) + +conn(pd, h)
    + +(karaka.includes(ad) || karaka.includes(md))
    + +(jai != null && (jai === ad || jai === md))
    + +jupOn(h) + +satOn(h) + +jupOn(h, moon) + +satOn(h, moon)
    + +nodesOn(h) + +(!!sky && onSign('Jupiter', sky.Jupiter, rashi[ad]));

  let yogas: { raja: Set<string>; dhana: Set<string> } | null = null;
  if (ctx.planetLongitudes) {
    const posMap: Record<string, number> = {}, lons: Record<string, number> = {}, rets: Record<string, boolean> = {};
    for (const p of P9) {
      posMap[p.toUpperCase()] = rashi[p];
      lons[p.toUpperCase()] = ctx.planetLongitudes[p];
      rets[p.toUpperCase()] = ctx.planetRetro?.[p] ?? false;
    }
    const ys = new YogaCalculator(posMap, lagna, { longitudes: lons, retro: rets }).detectAllYogas();
    const set = (cat: string) => new Set(ys.filter(y => y.category === cat).flatMap(y => y.planetsInvolved.map(tc)));
    yogas = { raja: set('rajayoga'), dhana: set('dhana') };
  }

  const fromMoon = (s: number) => houseFrom(s, moon);
  const pair = judgeLordPair(md, ad, rashi[md], rashi[ad]);
  const mdAdDistance = houseFrom(rashi[ad], rashi[md]);
  const adIndex = (DASHA_SEQUENCE.indexOf(ad) - DASHA_SEQUENCE.indexOf(md) + 9) % 9;
  const satMoon = sky ? fromMoon(sky.Saturn) : 0;
  const jupMoon = sky ? fromMoon(sky.Jupiter) : 0;
  const sav = ctx.ashtakavarga?.sarva;

  const on: Partial<Record<IndicatorKey, Omit<ActiveIndicator, 'def'>>> = {};
  const mark = (k: IndicatorKey, cond: boolean, extra: Omit<ActiveIndicator, 'def'> = {}) => { if (cond) on[k] = extra; };

  mark('careerMdLinked', conn(md, 10), { planet: md, house: 10 });
  mark('careerAdLinked', conn(ad, 10), { planet: ad, house: 10 });
  mark('careerAmatyakaraka', !!karakas && (karakas.AmK === md || karakas.AmK === ad), { planet: karakas?.AmK });
  mark('careerKarakaPeriod', ['Sun', 'Saturn'].includes(md) || ['Sun', 'Saturn'].includes(ad), { planet: ['Sun', 'Saturn'].includes(ad) ? ad : md });
  mark('careerJupiter', jupOn(10), { house: 10 });
  mark('careerSaturn', satOn(10), { house: 10 });
  mark('careerDoubleTransit', jupOn(10) && satOn(10), { house: 10 });
  mark('careerConvergence', !!sky && votes(10, ['Sun', 'Saturn'], karakas?.AmK ?? null) >= 5);

  mark('marriageMdLinked', conn(md, 7), { planet: md, house: 7 });
  mark('marriageAdLinked', conn(ad, 7), { planet: ad, house: 7 });
  mark('marriageDarakaraka', !!karakas && (karakas.DK === md || karakas.DK === ad), { planet: karakas?.DK });
  mark('marriageVenusPeriod', md === 'Venus' || ad === 'Venus', { planet: 'Venus' });
  mark('marriageJupiter', jupOn(7), { house: 7 });
  mark('marriageSaturn', satOn(7), { house: 7 });
  mark('marriageDoubleTransit', jupOn(7) && satOn(7), { house: 7 });
  mark('marriageNodes', nodesOn(7), { house: 7 });
  mark('marriageConvergence', !!sky && votes(7, ['Venus'], karakas?.DK ?? null) >= 5);

  mark('healthMdLinked', conn(md, 8), { planet: md, house: 8 });
  mark('healthAdLinked', conn(ad, 8), { planet: ad, house: 8 });
  mark('healthSaturn8th', satOn(8), { house: 8 });
  mark('sadeSatiRising', satMoon === 12);
  mark('sadeSatiPeak', satMoon === 1);
  mark('sadeSatiSetting', satMoon === 2);
  mark('ashtamaShani', satMoon === 8);
  mark('kantakaShani', [4, 7, 10].includes(satMoon));
  mark('healthConvergence', !!sky && votes(8, ['Saturn', 'Mars', 'Rahu', 'Ketu'], null) >= 5);

  mark('wealthDhanaYoga', !!yogas?.dhana.has(ad), { planet: ad });
  mark('wealthJupiterFromMoon', [2, 5, 7, 9, 11].includes(jupMoon), { house: jupMoon });
  mark('wealthJupiterSav', !!sky && !!sav && sav[sky.Jupiter] >= 30);

  mark('pairGood', pair.verdict === 'good');
  mark('pairBad', pair.verdict === 'bad');
  mark('adShadashtaka', mdAdDistance === 6 || mdAdDistance === 8);
  mark('adYogakaraka', functionalNatureFor(ad, lagna) === 'yogakaraka', { planet: ad });
  mark('rajaYogaPeriod', !!yogas && yogas.raja.has(md) && yogas.raja.has(ad));
  mark('saturnFromMoonGood', [3, 6, 11].includes(satMoon), { house: satMoon });
  mark('chidraAntardasha', adIndex === 8, { planet: ad });

  return INDICATORS.filter(d => on[d.key] && (!d.needsSky || sky)).map(def => ({ def, ...on[def.key] }));
}
