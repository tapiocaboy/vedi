/**
 * The expanded combination library — PRE-REGISTERED.
 *
 * Written on 2026-10-08, before any chart of the 494 new lives in the 550 set was
 * scored against it. Every indicator is a textbook Parashari / Jaimini / gochara
 * rule; none was chosen by looking at the new data. comboEval.ts scores all of
 * them on the DISCOVERY half, carries forward only those that clear the bar
 * below, and tests just those once on the CONFIRMATION half.
 *
 *   Selection on discovery:  |z| >= 3.0 (two-sided p ≈ 0.003), >= 25 events of the
 *                            type, and the indicator present at >= 10 events.
 *   Replication:             same direction on confirmation with one-sided p < 0.05
 *                            after Holm correction over the carried-forward set.
 *
 * Event types and their houses (primary / wide), counted from the Lagna:
 *   A rise / achievement  10        / 1, 10, 11      karakas Sun, Saturn   Jaimini AmK   varga D10
 *   M marriage            7         / 2, 7, 11       karaka  Venus         Jaimini DK    varga D9
 *   C child               5         / 2, 5, 9        karaka  Jupiter       Jaimini PK    varga D7
 *   U upheaval            8         / 6, 8, 12       karakas Saturn, Mars, Rahu, Ketu
 *   D death (validation)  2, 7      / 2, 7, 8        karaka  Saturn        (never shipped)
 *
 * A planet is CONNECTED to a house set when it rules one of the houses, occupies
 * one, aspects one (graha drishti, whole sign), or sits with the lord of one. The
 * nodes rule nothing and are given no aspects; they connect through occupation,
 * sitting with a house lord, or through their sign-dispositor ruling/occupying.
 */
import { RASHI_LORDS, getDignity } from '../src/lib/core/planetaryAnalysis';
import { aspectsRashi } from '../src/lib/core/natalFoundation';
import { lordedHousesFor, functionalNatureFor } from '../src/lib/core/dashaStrength';
import { navamsaRashi, dasamsaRashi, saptamsaRashi } from '../src/lib/core/vargas';
import { YogaCalculator } from '../src/lib/core/yogas';
import { judgeLordPair, naturalRelation } from '../src/lib/core/dashaLordRelation';
import { DASHA_SEQUENCE } from '../src/lib/core/dasha';
import type { Cast } from './lib';

export type EType = 'A' | 'M' | 'C' | 'U' | 'D';
export const TYPES: EType[] = ['A', 'M', 'C', 'U', 'D'];
export const P9 = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'] as const;
const P7 = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'] as const;
const NODES = new Set(['Rahu', 'Ketu']);
const SEPARATIVE = new Set(['Saturn', 'Rahu', 'Ketu']);
const BENEFICS = new Set(['Jupiter', 'Venus', 'Mercury', 'Moon']);

export const PRIMARY: Record<EType, number[]> = { A: [10], M: [7], C: [5], U: [8], D: [2, 7] };
export const WIDE: Record<EType, number[]> = { A: [1, 10, 11], M: [2, 7, 11], C: [2, 5, 9], U: [6, 8, 12], D: [2, 7, 8] };
export const KARAKA: Record<EType, string[]> = {
  A: ['Sun', 'Saturn'], M: ['Venus'], C: ['Jupiter'], U: ['Saturn', 'Mars', 'Rahu', 'Ketu'], D: ['Saturn'],
};
const JAIMINI: Record<EType, Karaka | null> = { A: 'AmK', M: 'DK', C: 'PK', U: null, D: null };
const VARGA: Record<EType, { key: 'd10' | 'd9' | 'd7'; house: number } | null> = {
  A: { key: 'd10', house: 10 }, M: { key: 'd9', house: 7 }, C: { key: 'd7', house: 5 }, U: null, D: null,
};

type Karaka = 'AK' | 'AmK' | 'BK' | 'MK' | 'PK' | 'GK' | 'DK';
const KARAKA_ORDER: Karaka[] = ['AK', 'AmK', 'BK', 'MK', 'PK', 'GK', 'DK'];

// ── natal precomputation ─────────────────────────────────────────────────────

export interface Natal {
  lagna: number; moon: number; moonNak: number; nakLord: string;
  rashi: Record<string, number>; lon: Record<string, number>; retro: Record<string, boolean>;
  house: Record<string, number>;
  dignity: Record<string, string>; fn: Record<string, string>;
  karaka: Record<Karaka, string>;
  d9: Record<string, number>; d10: Record<string, number>;
  vargaLagna: { d9: number; d10: number; d7: number };
  varga: { d9: Record<string, number>; d10: Record<string, number>; d7: Record<string, number> };
  yoga: { raja: Set<string>; dhana: Set<string>; maha: Set<string>; daridra: Set<string> };
  sav: number[]; bav: Record<string, number[]>; self: Record<string, number>;
  combust: Record<string, boolean>;
  /** Per type: is each planet connected to the primary set (Lagna / Moon), the wide set, linked to the karaka, in the varga? */
  conn: Record<EType, { primary: Set<string>; primaryMoon: Set<string>; wide: Set<string>; karakaLink: Set<string>; varga: Set<string>; dispositor: Set<string> }>;
  /** Natal sign of each type's primary-house lords (for transits over the lord). */
  lordSigns: Record<EType, number[]>;
  karakaSigns: Record<EType, number[]>;
  /** Signs of each type's primary houses, counted from the Lagna and from the Moon. */
  hs: Record<EType, { lagna: number[]; moon: number[] }>;
}

const houseFrom = (rashi: number, ref: number) => ((rashi - ref + 12) % 12) + 1;
const signOfHouse = (h: number, ref: number) => (ref + h - 1) % 12;

function connected(n: Omit<Natal, 'conn' | 'lordSigns' | 'karakaSigns' | 'hs'>, planet: string, H: number[], ref: number, depth = 0): boolean {
  const r = n.rashi[planet];
  const signs = H.map(h => signOfHouse(h, ref));
  if (signs.includes(r)) return true;                                           // occupies
  const lordSigns = signs.map(s => n.rashi[RASHI_LORDS[s]]);
  if (lordSigns.includes(r)) return true;                                       // sits with a house lord
  if (!NODES.has(planet)) {
    if (signs.some(s => RASHI_LORDS[s] === planet)) return true;                // rules
    if (signs.some(s => aspectsRashi(planet, r, s))) return true;              // aspects
    return false;
  }
  if (depth > 0) return false;
  const disp = RASHI_LORDS[r];
  return signs.some(s => RASHI_LORDS[s] === disp) || signs.includes(n.rashi[disp]);
}

export function natalOf(c: Cast): Natal {
  const pos = c.positions;
  const key = (p: string) => p.toUpperCase();
  const rashi: Record<string, number> = {}, lon: Record<string, number> = {}, retro: Record<string, boolean> = {};
  for (const p of P9) { rashi[p] = pos[key(p)].rashi; lon[p] = pos[key(p)].longitude; retro[p] = pos[key(p)].isRetrograde; }
  const lagna = c.lagna, moon = c.moonRashi;
  const house: Record<string, number> = {}, dignity: Record<string, string> = {}, fn: Record<string, string> = {};
  for (const p of P9) {
    house[p] = houseFrom(rashi[p], lagna);
    dignity[p] = getDignity(p, rashi[p]);
    fn[p] = functionalNatureFor(p, lagna);
  }
  const byDeg = [...P7].sort((a, b) => (lon[b] % 30) - (lon[a] % 30));
  const karaka = Object.fromEntries(KARAKA_ORDER.map((k, i) => [k, byDeg[i]])) as Record<Karaka, string>;
  const ascLon = pos.ASCENDANT.longitude;
  const varga = { d9: {} as Record<string, number>, d10: {} as Record<string, number>, d7: {} as Record<string, number> };
  for (const p of P9) { varga.d9[p] = navamsaRashi(lon[p]); varga.d10[p] = dasamsaRashi(lon[p]); varga.d7[p] = saptamsaRashi(lon[p]); }
  const vargaLagna = { d9: navamsaRashi(ascLon), d10: dasamsaRashi(ascLon), d7: saptamsaRashi(ascLon) };

  const posMap: Record<string, number> = {}, lons: Record<string, number> = {}, rets: Record<string, boolean> = {};
  for (const p of P9) { posMap[key(p)] = rashi[p]; lons[key(p)] = lon[p]; rets[key(p)] = retro[p]; }
  const ys = new YogaCalculator(posMap, lagna, { longitudes: lons, retro: rets }).detectAllYogas();
  const tc = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();
  const yset = (cat: string) => new Set(ys.filter(y => y.category === cat).flatMap(y => y.planetsInvolved.map(tc)));
  const yoga = { raja: yset('rajayoga'), dhana: yset('dhana'), maha: yset('mahapurusha'), daridra: yset('daridra') };

  const av = c.ctx.ashtakavarga;
  const bav: Record<string, number[]> = {}, self: Record<string, number> = {};
  for (const p of P7) { bav[p] = av.bhinna[p]; self[p] = av.selfStrength[p]; }
  const combust: Record<string, boolean> = {};
  const ORB: Record<string, number> = { Moon: 12, Mars: 17, Mercury: 13, Jupiter: 11, Venus: 9, Saturn: 15 };
  for (const p of P9) {
    const d = Math.abs(((lon[p] - lon.Sun + 540) % 360) - 180);
    combust[p] = p in ORB && d < ORB[p];
  }
  const nakLord = DASHA_SEQUENCE[Math.floor(lon.Moon / (360 / 27)) % 9];

  const base = {
    lagna, moon, moonNak: Math.floor(lon.Moon / (360 / 27)), nakLord, rashi, lon, retro, house, dignity, fn, karaka,
    d9: varga.d9, d10: varga.d10, vargaLagna, varga, yoga, sav: av.sarva, bav, self, combust,
  };
  const conn = {} as Natal['conn'];
  const lordSigns = {} as Natal['lordSigns'];
  const karakaSigns = {} as Natal['karakaSigns'];
  const hs = {} as Natal['hs'];
  for (const t of TYPES) {
    hs[t] = { lagna: PRIMARY[t].map(h => signOfHouse(h, lagna)), moon: PRIMARY[t].map(h => signOfHouse(h, moon)) };
    const H = PRIMARY[t];
    const primary = new Set<string>(), primaryMoon = new Set<string>(), wide = new Set<string>();
    const karakaLink = new Set<string>(), vargaSet = new Set<string>(), dispositor = new Set<string>();
    const lords = H.map(h => RASHI_LORDS[signOfHouse(h, lagna)]);
    for (const p of P9) {
      if (connected(base, p, H, lagna)) primary.add(p);
      if (connected(base, p, H, moon)) primaryMoon.add(p);
      if (connected(base, p, WIDE[t], lagna)) wide.add(p);
      if (KARAKA[t].some(k => k === p || rashi[k] === rashi[p] || (!NODES.has(p) && aspectsRashi(p, rashi[p], rashi[k])))) karakaLink.add(p);
      const v = VARGA[t];
      if (v) {
        const vl = vargaLagna[v.key], vr = varga[v.key];
        const target = signOfHouse(v.house, vl);
        if (vr[p] === target || vr[p] === vl || RASHI_LORDS[target] === p) vargaSet.add(p);
      }
      if (lords.some(l => RASHI_LORDS[rashi[l]] === p)) dispositor.add(p);
    }
    conn[t] = { primary, primaryMoon, wide, karakaLink, varga: vargaSet, dispositor };
    lordSigns[t] = [...new Set(lords.map(l => rashi[l]))];
    karakaSigns[t] = [...new Set(KARAKA[t].map(k => rashi[k]))];
  }
  return { ...base, conn, lordSigns, karakaSigns, hs };
}

// ── time-varying state ──────────────────────────────────────────────────────

/** Sidereal sky on one day (Ketu = Rahu + 180). */
export interface Sky {
  Sun: number; Moon: number; Mars: number; Mercury: number; Jupiter: number; Venus: number; Saturn: number; Rahu: number;
  retro: { Mars: boolean; Mercury: boolean; Jupiter: boolean; Venus: boolean; Saturn: boolean };
}
export interface ChainState {
  md: string; ad: string; pd: string;
  /** Position of the antardasha within its mahadasha, 0 (lord's own) … 8 (last, the chidra). */
  adIndex: number;
  /** Days to the nearest mahadasha / antardasha / pratyantardasha boundary. */
  dMd: number; dAd: number; dPd: number;
}

const sign = (l: number) => Math.floor(l / 30) % 12;
/** Transiting planet sits in, or aspects, `target` sign. */
const onSign = (planet: string, lon: number, target: number) => {
  const s = sign(lon);
  return s === target || aspectsRashi(planet, s, target);
};
const sep = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180);

export interface Feature { key: string; type: EType | '*'; group: 'dasha' | 'transit' | 'combo' | 'moon' | 'natal-dasha'; f: (n: Natal, ch: ChainState, s: Sky) => boolean }
export const FEATURES: Feature[] = [];
const add = (key: string, type: EType | '*', group: Feature['group'], f: Feature['f']) => FEATURES.push({ key, type, group, f });

for (const t of TYPES) {
  const H = PRIMARY[t];
  const Hs = (n: Natal, ref: number) => (ref === n.lagna ? n.hs[t].lagna : ref === n.moon ? n.hs[t].moon : H.map(h => signOfHouse(h, ref)));
  const jai = JAIMINI[t];
  // dasha
  add(`${t} AD rules H`, t, 'dasha', (n, ch) => !NODES.has(ch.ad) && Hs(n, n.lagna).some(s => RASHI_LORDS[s] === ch.ad));
  add(`${t} AD occupies H`, t, 'dasha', (n, ch) => Hs(n, n.lagna).includes(n.rashi[ch.ad]));
  add(`${t} AD aspects H`, t, 'dasha', (n, ch) => !NODES.has(ch.ad) && Hs(n, n.lagna).some(s => aspectsRashi(ch.ad, n.rashi[ch.ad], s)));
  add(`${t} AD connected H`, t, 'dasha', (n, ch) => n.conn[t].primary.has(ch.ad));
  add(`${t} MD connected H`, t, 'dasha', (n, ch) => n.conn[t].primary.has(ch.md));
  add(`${t} PD connected H`, t, 'dasha', (n, ch) => n.conn[t].primary.has(ch.pd));
  add(`${t} MD+AD connected H`, t, 'dasha', (n, ch) => n.conn[t].primary.has(ch.md) && n.conn[t].primary.has(ch.ad));
  add(`${t} MD+AD+PD connected H`, t, 'dasha', (n, ch) => n.conn[t].primary.has(ch.md) && n.conn[t].primary.has(ch.ad) && n.conn[t].primary.has(ch.pd));
  add(`${t} AD connected wide`, t, 'dasha', (n, ch) => n.conn[t].wide.has(ch.ad));
  add(`${t} AD connected H from Moon`, t, 'dasha', (n, ch) => n.conn[t].primaryMoon.has(ch.ad));
  add(`${t} AD natural karaka`, t, 'dasha', (n, ch) => KARAKA[t].includes(ch.ad));
  add(`${t} MD|AD natural karaka`, t, 'dasha', (n, ch) => KARAKA[t].includes(ch.ad) || KARAKA[t].includes(ch.md));
  add(`${t} AD linked to karaka`, t, 'dasha', (n, ch) => n.conn[t].karakaLink.has(ch.ad));
  add(`${t} AD disposits H-lord`, t, 'dasha', (n, ch) => n.conn[t].dispositor.has(ch.ad));
  if (jai) {
    add(`${t} AD Jaimini ${jai}`, t, 'dasha', (n, ch) => n.karaka[jai] === ch.ad);
    add(`${t} MD|AD Jaimini ${jai}`, t, 'dasha', (n, ch) => n.karaka[jai] === ch.ad || n.karaka[jai] === ch.md);
  }
  if (VARGA[t]) {
    add(`${t} AD varga link`, t, 'dasha', (n, ch) => n.conn[t].varga.has(ch.ad));
    add(`${t} MD|AD varga link`, t, 'dasha', (n, ch) => n.conn[t].varga.has(ch.ad) || n.conn[t].varga.has(ch.md));
  }
  // transits
  const jupOnH = (n: Natal, s: Sky, ref: number) => Hs(n, ref).some(x => onSign('Jupiter', s.Jupiter, x));
  const satOnH = (n: Natal, s: Sky, ref: number) => Hs(n, ref).some(x => onSign('Saturn', s.Saturn, x));
  const nodesOnH = (n: Natal, s: Sky, ref: number) => Hs(n, ref).some(x => sign(s.Rahu) === x || sign(s.Rahu + 180) === x);
  add(`${t} Jup in H`, t, 'transit', (n, ch, s) => Hs(n, n.lagna).includes(sign(s.Jupiter)));
  add(`${t} Jup on H`, t, 'transit', (n, ch, s) => jupOnH(n, s, n.lagna));
  add(`${t} Jup on H from Moon`, t, 'transit', (n, ch, s) => jupOnH(n, s, n.moon));
  add(`${t} Sat on H`, t, 'transit', (n, ch, s) => satOnH(n, s, n.lagna));
  add(`${t} Sat on H from Moon`, t, 'transit', (n, ch, s) => satOnH(n, s, n.moon));
  add(`${t} double transit H`, t, 'transit', (n, ch, s) => jupOnH(n, s, n.lagna) && satOnH(n, s, n.lagna));
  add(`${t} double transit H from Moon`, t, 'transit', (n, ch, s) => jupOnH(n, s, n.moon) && satOnH(n, s, n.moon));
  add(`${t} double transit H-lord`, t, 'transit', (n, ch, s) => n.lordSigns[t].some(x => onSign('Jupiter', s.Jupiter, x) && onSign('Saturn', s.Saturn, x)));
  add(`${t} Jup on H-lord`, t, 'transit', (n, ch, s) => n.lordSigns[t].some(x => onSign('Jupiter', s.Jupiter, x)));
  add(`${t} Jup on karaka`, t, 'transit', (n, ch, s) => n.karakaSigns[t].some(x => onSign('Jupiter', s.Jupiter, x)));
  add(`${t} Sat on karaka`, t, 'transit', (n, ch, s) => n.karakaSigns[t].some(x => onSign('Saturn', s.Saturn, x)));
  add(`${t} nodes on H axis`, t, 'transit', (n, ch, s) => nodesOnH(n, s, n.lagna));
  add(`${t} nodes on H axis from Moon`, t, 'transit', (n, ch, s) => nodesOnH(n, s, n.moon));
  add(`${t} Jup on AD lord`, t, 'transit', (n, ch, s) => onSign('Jupiter', s.Jupiter, n.rashi[ch.ad]));
  add(`${t} Sat on AD lord`, t, 'transit', (n, ch, s) => onSign('Saturn', s.Saturn, n.rashi[ch.ad]));
  add(`${t} Mars on H`, t, 'transit', (n, ch, s) => Hs(n, n.lagna).some(x => onSign('Mars', s.Mars, x)));
  add(`${t} Sun in H`, t, 'transit', (n, ch, s) => Hs(n, n.lagna).includes(sign(s.Sun)));
  add(`${t} Moon in H`, t, 'moon', (n, ch, s) => Hs(n, n.lagna).includes(sign(s.Moon)));
  // combinations: dasha promise + transit trigger, and convergence counts
  add(`${t} AD conn + Jup on H`, t, 'combo', (n, ch, s) => n.conn[t].primary.has(ch.ad) && jupOnH(n, s, n.lagna));
  add(`${t} AD conn + double transit`, t, 'combo', (n, ch, s) => n.conn[t].primary.has(ch.ad) && jupOnH(n, s, n.lagna) && satOnH(n, s, n.lagna));
  add(`${t} MD+AD conn + Jup on H`, t, 'combo', (n, ch, s) => n.conn[t].primary.has(ch.md) && n.conn[t].primary.has(ch.ad) && jupOnH(n, s, n.lagna));
  add(`${t} karaka dasha + Jup on H`, t, 'combo', (n, ch, s) => (KARAKA[t].includes(ch.ad) || KARAKA[t].includes(ch.md)) && jupOnH(n, s, n.lagna));
  const votes = (n: Natal, ch: ChainState, s: Sky) =>
    +n.conn[t].primary.has(ch.md) + +n.conn[t].primary.has(ch.ad) + +n.conn[t].primary.has(ch.pd)
    + +(KARAKA[t].includes(ch.ad) || KARAKA[t].includes(ch.md))
    + +(jai != null && (n.karaka[jai] === ch.ad || n.karaka[jai] === ch.md))
    + +jupOnH(n, s, n.lagna) + +satOnH(n, s, n.lagna) + +jupOnH(n, s, n.moon) + +satOnH(n, s, n.moon)
    + +nodesOnH(n, s, n.lagna) + +onSign('Jupiter', s.Jupiter, n.rashi[ch.ad]);
  add(`${t} convergence >= 4`, t, 'combo', (n, ch, s) => votes(n, ch, s) >= 4);
  add(`${t} convergence >= 5`, t, 'combo', (n, ch, s) => votes(n, ch, s) >= 5);
  add(`${t} convergence >= 6`, t, 'combo', (n, ch, s) => votes(n, ch, s) >= 6);
}

// ── type-independent indicators (scored at every event type) ─────────────────
const hcls = (h: number) => (h === 6 || h === 8 || h === 12 ? 'dus' : [1, 4, 7, 10].includes(h) ? 'ken' : h === 5 || h === 9 ? 'tri' : 'oth');
add('* AD in kendra', '*', 'natal-dasha', (n, ch) => hcls(n.house[ch.ad]) === 'ken');
add('* AD in trikona', '*', 'natal-dasha', (n, ch) => hcls(n.house[ch.ad]) === 'tri');
add('* AD in dusthana', '*', 'natal-dasha', (n, ch) => hcls(n.house[ch.ad]) === 'dus');
add('* AD in lagna', '*', 'natal-dasha', (n, ch) => n.house[ch.ad] === 1);
add('* AD 6/8 from MD', '*', 'dasha', (n, ch) => { const d = houseFrom(n.rashi[ch.ad], n.rashi[ch.md]); return d === 6 || d === 8; });
add('* AD 2/12 from MD', '*', 'dasha', (n, ch) => { const d = houseFrom(n.rashi[ch.ad], n.rashi[ch.md]); return d === 2 || d === 12; });
add('* AD kendra from MD', '*', 'dasha', (n, ch) => [1, 4, 7, 10].includes(houseFrom(n.rashi[ch.ad], n.rashi[ch.md])));
add('* AD trine from MD', '*', 'dasha', (n, ch) => [5, 9].includes(houseFrom(n.rashi[ch.ad], n.rashi[ch.md])));
add('* MD-AD pair good', '*', 'dasha', (n, ch) => judgeLordPair(ch.md, ch.ad, n.rashi[ch.md], n.rashi[ch.ad]).verdict === 'good');
add('* MD-AD pair bad', '*', 'dasha', (n, ch) => judgeLordPair(ch.md, ch.ad, n.rashi[ch.md], n.rashi[ch.ad]).verdict === 'bad');
add('* AD friend of MD', '*', 'dasha', (n, ch) => naturalRelation(ch.md, ch.ad) === 'friend');
add('* AD enemy of MD', '*', 'dasha', (n, ch) => naturalRelation(ch.md, ch.ad) === 'enemy');
add('* AD yogakaraka', '*', 'natal-dasha', (n, ch) => n.fn[ch.ad] === 'yogakaraka');
add('* MD yogakaraka', '*', 'natal-dasha', (n, ch) => n.fn[ch.md] === 'yogakaraka');
add('* AD functional benefic', '*', 'natal-dasha', (n, ch) => n.fn[ch.ad] === 'functional-benefic' || n.fn[ch.ad] === 'yogakaraka');
add('* AD functional malefic', '*', 'natal-dasha', (n, ch) => n.fn[ch.ad] === 'functional-malefic');
add('* AD exalted/own', '*', 'natal-dasha', (n, ch) => n.dignity[ch.ad] === 'exalted' || n.dignity[ch.ad] === 'own-sign');
add('* AD debilitated', '*', 'natal-dasha', (n, ch) => n.dignity[ch.ad] === 'debilitated');
add('* AD in raja yoga', '*', 'natal-dasha', (n, ch) => n.yoga.raja.has(ch.ad));
add('* MD in raja yoga', '*', 'natal-dasha', (n, ch) => n.yoga.raja.has(ch.md));
add('* MD+AD in raja yoga', '*', 'natal-dasha', (n, ch) => n.yoga.raja.has(ch.md) && n.yoga.raja.has(ch.ad));
add('* AD in dhana yoga', '*', 'natal-dasha', (n, ch) => n.yoga.dhana.has(ch.ad));
add('* AD in mahapurusha yoga', '*', 'natal-dasha', (n, ch) => n.yoga.maha.has(ch.ad));
add('* AD in daridra yoga', '*', 'natal-dasha', (n, ch) => n.yoga.daridra.has(ch.ad));
add('* MD = Moon nakshatra lord', '*', 'natal-dasha', (n, ch) => ch.md === n.nakLord);
add('* AD = Moon nakshatra lord', '*', 'natal-dasha', (n, ch) => ch.ad === n.nakLord);
add('* AD separative', '*', 'dasha', (n, ch) => SEPARATIVE.has(ch.ad));
add('* MD separative', '*', 'dasha', (n, ch) => SEPARATIVE.has(ch.md));
add('* AD natural benefic', '*', 'dasha', (n, ch) => BENEFICS.has(ch.ad));
add('* AD retrograde natally', '*', 'natal-dasha', (n, ch) => !NODES.has(ch.ad) && n.retro[ch.ad]);
add('* AD combust natally', '*', 'natal-dasha', (n, ch) => n.combust[ch.ad]);
add('* AD vargottama', '*', 'natal-dasha', (n, ch) => n.rashi[ch.ad] === n.d9[ch.ad]);
add('* AD sign SAV >= 28', '*', 'natal-dasha', (n, ch) => n.sav[n.rashi[ch.ad]] >= 28);
add('* AD sign SAV <= 24', '*', 'natal-dasha', (n, ch) => n.sav[n.rashi[ch.ad]] <= 24);
add('* AD own bindus >= 5', '*', 'natal-dasha', (n, ch) => (n.self[ch.ad] ?? -1) >= 5);
add('* AD own bindus <= 2', '*', 'natal-dasha', (n, ch) => n.self[ch.ad] != null && n.self[ch.ad] <= 2);
add('* AD is AK (Atmakaraka)', '*', 'natal-dasha', (n, ch) => n.karaka.AK === ch.ad);
add('* within 180d of MD change', '*', 'dasha', (n, ch) => ch.dMd <= 180);
add('* within 60d of AD change', '*', 'dasha', (n, ch) => ch.dAd <= 60);
add('* within 15d of PD change', '*', 'dasha', (n, ch) => ch.dPd <= 15);
add('* first AD of MD', '*', 'dasha', (n, ch) => ch.adIndex === 0);
add('* last AD of MD (chidra)', '*', 'dasha', (n, ch) => ch.adIndex === 8);
// gochara from the Moon and the slow-planet returns
const fromMoon = (n: Natal, l: number) => houseFrom(sign(l), n.moon);
add('* Jup good from Moon', '*', 'transit', (n, ch, s) => [2, 5, 7, 9, 11].includes(fromMoon(n, s.Jupiter)));
add('* Jup 1/8 from Moon', '*', 'transit', (n, ch, s) => [1, 8].includes(fromMoon(n, s.Jupiter)));
add('* Sat good from Moon', '*', 'transit', (n, ch, s) => [3, 6, 11].includes(fromMoon(n, s.Saturn)));
add('* Sade Sati rising', '*', 'transit', (n, ch, s) => fromMoon(n, s.Saturn) === 12);
add('* Sade Sati peak', '*', 'transit', (n, ch, s) => fromMoon(n, s.Saturn) === 1);
add('* Sade Sati setting', '*', 'transit', (n, ch, s) => fromMoon(n, s.Saturn) === 2);
add('* Ashtama Shani', '*', 'transit', (n, ch, s) => fromMoon(n, s.Saturn) === 8);
add('* Kantaka Shani', '*', 'transit', (n, ch, s) => [4, 7, 10].includes(fromMoon(n, s.Saturn)));
add('* Saturn return', '*', 'transit', (n, ch, s) => sep(s.Saturn, n.lon.Saturn) <= 10);
add('* Saturn opposition', '*', 'transit', (n, ch, s) => sep(s.Saturn, n.lon.Saturn + 180) <= 10);
add('* Jupiter return', '*', 'transit', (n, ch, s) => sign(s.Jupiter) === n.rashi.Jupiter);
add('* Rahu return', '*', 'transit', (n, ch, s) => sign(s.Rahu) === n.rashi.Rahu);
add('* nodes reversed', '*', 'transit', (n, ch, s) => sign(s.Rahu) === n.rashi.Ketu);
add('* Rahu/Ketu on natal Moon', '*', 'transit', (n, ch, s) => sign(s.Rahu) === n.moon || sign(s.Rahu + 180) === n.moon);
add('* Rahu/Ketu on natal Sun', '*', 'transit', (n, ch, s) => sign(s.Rahu) === n.rashi.Sun || sign(s.Rahu + 180) === n.rashi.Sun);
add('* Rahu/Ketu on Lagna axis', '*', 'transit', (n, ch, s) => sign(s.Rahu) === n.lagna || sign(s.Rahu + 180) === n.lagna);
add('* Jup over natal Sun', '*', 'transit', (n, ch, s) => sign(s.Jupiter) === n.rashi.Sun);
add('* Sat over natal Sun', '*', 'transit', (n, ch, s) => sign(s.Saturn) === n.rashi.Sun);
add('* Jup over Lagna', '*', 'transit', (n, ch, s) => sign(s.Jupiter) === n.lagna);
add('* Sat over Lagna', '*', 'transit', (n, ch, s) => sign(s.Saturn) === n.lagna);
add('* Jup sign own bindus >= 5', '*', 'transit', (n, ch, s) => n.bav.Jupiter[sign(s.Jupiter)] >= 5);
add('* Jup sign own bindus <= 2', '*', 'transit', (n, ch, s) => n.bav.Jupiter[sign(s.Jupiter)] <= 2);
add('* Sat sign own bindus >= 4', '*', 'transit', (n, ch, s) => n.bav.Saturn[sign(s.Saturn)] >= 4);
add('* Sat sign own bindus <= 2', '*', 'transit', (n, ch, s) => n.bav.Saturn[sign(s.Saturn)] <= 2);
add('* Jup sign SAV >= 30', '*', 'transit', (n, ch, s) => n.sav[sign(s.Jupiter)] >= 30);
add('* Sat sign SAV <= 25', '*', 'transit', (n, ch, s) => n.sav[sign(s.Saturn)] <= 25);
add('* Jupiter retrograde', '*', 'transit', (n, ch, s) => s.retro.Jupiter);
add('* Saturn retrograde', '*', 'transit', (n, ch, s) => s.retro.Saturn);
add('* Mercury retrograde', '*', 'transit', (n, ch, s) => s.retro.Mercury);
add('* Venus retrograde', '*', 'transit', (n, ch, s) => s.retro.Venus);
add('* Mars retrograde', '*', 'transit', (n, ch, s) => s.retro.Mars);
add('* eclipse season', '*', 'transit', (n, ch, s) => sep(s.Sun, s.Rahu) <= 12 || sep(s.Sun, s.Rahu + 180) <= 12);
add('* Mars over natal Moon', '*', 'transit', (n, ch, s) => sign(s.Mars) === n.moon);
add('* Mars 8th from Moon', '*', 'transit', (n, ch, s) => fromMoon(n, s.Mars) === 8);
// the Moon on the day itself (tara bala, chandrashtama, tithi)
const tara = (n: Natal, s: Sky) => ((Math.floor(s.Moon / (360 / 27)) - n.moonNak + 27) % 27) % 9 + 1;
add('* tara good (2,4,6,8,9)', '*', 'moon', (n, ch, s) => [2, 4, 6, 8, 9].includes(tara(n, s)));
add('* tara bad (3,5,7)', '*', 'moon', (n, ch, s) => [3, 5, 7].includes(tara(n, s)));
add('* janma tara', '*', 'moon', (n, ch, s) => tara(n, s) === 1);
add('* chandrashtama', '*', 'moon', (n, ch, s) => fromMoon(n, s.Moon) === 8);
add('* Moon kendra from Lagna', '*', 'moon', (n, ch, s) => [1, 4, 7, 10].includes(houseFrom(sign(s.Moon), n.lagna)));
add('* Moon dusthana from Lagna', '*', 'moon', (n, ch, s) => [6, 8, 12].includes(houseFrom(sign(s.Moon), n.lagna)));
const tithi = (s: Sky) => Math.floor(((s.Moon - s.Sun + 360) % 360) / 12) + 1;   // 1..30
add('* waxing Moon', '*', 'moon', (n, ch, s) => tithi(s) <= 15);
add('* rikta tithi', '*', 'moon', (n, ch, s) => [4, 9, 14].includes((tithi(s) - 1) % 15 + 1));
add('* near full Moon', '*', 'moon', (n, ch, s) => [14, 15, 16].includes(tithi(s)));
add('* near new Moon', '*', 'moon', (n, ch, s) => [29, 30, 1].includes(tithi(s)));
add('* Sun in 10th', '*', 'transit', (n, ch, s) => houseFrom(sign(s.Sun), n.lagna) === 10);
add('* Sun 10th from Moon', '*', 'transit', (n, ch, s) => fromMoon(n, s.Sun) === 10);

/** The indicators that apply to events of type `t`: its own, plus every type-independent one. */
export const featuresFor = (t: EType) => FEATURES.map((f, i) => ({ f, i })).filter(({ f }) => f.type === t || f.type === '*');
