/**
 * Natal case-control. Do famous charts score higher than matched ordinary charts
 * on the natal features the app reports?
 *
 * Controls for each famous person: same birthplace, birth instant shifted by a
 * uniform random amount within ±8 years (so decade, generation and outer-planet
 * placements match; time of day is random). The statistic is where the famous
 * chart's value falls among its own 150 controls (0..1, null = 0.5), averaged
 * over people with a person-level bootstrap interval.
 */
import { getPlanetPositions } from '../src/lib/core/ephemeris';
import { buildChartContext } from '../src/lib/services/predictionService';
import { assessNatalFoundation } from '../src/lib/core/natalFoundation';
import { assessPlanetStrength } from '../src/lib/core/dashaStrength';
import { YogaCalculator } from '../src/lib/core/yogas';
import { computeVargas } from '../src/lib/core/vargas';
import { assessVargaBackbone } from '../src/lib/core/vargaStrength';
import { getDignity } from '../src/lib/core/planetaryAnalysis';
import { RASHI_LORDS } from '../src/lib/core/planetaryAnalysis';
import { PEOPLE, YEAR, percentile, clusterMean, mulberry32 } from './lib';

const K = 150;
const BODIES = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

async function natalFeatures(utc: string, lat: number, lon: number) {
  const pos = await getPlanetPositions(utc, lat, lon, 'UTC', 'LAHIRI');
  const ctx = buildChartContext(pos);
  const asc = ctx.ascendantRashi!;
  const f: Record<string, number> = {};

  const fd = assessNatalFoundation(ctx)!;
  for (const a of ['career', 'wealth', 'relationship', 'health'] as const) f[`foundation.${a}`] = fd[a].score;

  const posMap: Record<string, number> = {}, lons: Record<string, number> = {}, retro: Record<string, boolean> = {};
  for (const [k, v] of Object.entries(pos)) if (k !== 'ASCENDANT') { posMap[k] = v.rashi; lons[k] = v.longitude; retro[k] = v.isRetrograde; }
  const ys = new YogaCalculator(posMap, asc, { longitudes: lons, retro }).detectAllYogas();
  f['yogas.total'] = ys.length;
  f['yogas.rajayoga'] = ys.filter(y => y.category === 'rajayoga').length;
  f['yogas.mahapurusha'] = ys.filter(y => y.category === 'mahapurusha').length;
  f['yogas.dhana'] = ys.filter(y => y.category === 'dhana').length;
  f['yogas.daridra'] = ys.filter(y => y.category === 'daridra').length;
  f['yogas.maxStrength'] = Math.max(0, ...ys.filter(y => ['rajayoga', 'mahapurusha', 'dhana'].includes(y.category)).map(y => y.strengthScore));

  let pillar = 0, kendraTrikona = 0, dusthana = 0;
  for (const p of BODIES) {
    const d = getDignity(p, ctx.planetRashis![p]);
    if (d === 'exalted' || d === 'own-sign') pillar++;
    const h = ctx.planetHouses![p];
    if ([1, 4, 5, 7, 9, 10].includes(h)) kendraTrikona++;
    if ([6, 8, 12].includes(h)) dusthana++;
  }
  f['dignity.exaltedOrOwn'] = pillar;
  f['placement.kendraTrikona'] = kendraTrikona;
  f['placement.dusthana'] = dusthana;
  f['placement.in10or11'] = BODIES.filter(p => [10, 11].includes(ctx.planetHouses![p])).length;

  const total = (p: string) => assessPlanetStrength(p, ctx, 'en').total;
  f['strength.lagnaLord'] = total(RASHI_LORDS[asc]);
  f['strength.tenthLord'] = total(RASHI_LORDS[(asc + 9) % 12]);
  f['strength.sun'] = total('Sun');
  f['strength.meanBodies'] = BODIES.reduce((s, p) => s + total(p), 0) / BODIES.length;

  const vargas = computeVargas({ longitudes: ctx.planetLongitudes!, retro: ctx.planetRetro!, ascendantLongitude: pos.ASCENDANT.longitude });
  const vb = assessVargaBackbone({ chart: vargas, longitudes: ctx.planetLongitudes! });
  f['vimsopaka.mean'] = vb.planets.reduce((s, p) => s + p.vimsopaka, 0) / vb.planets.length;
  f['vimsopaka.lagnaLord'] = vb.planets.find(p => p.planet === RASHI_LORDS[asc])?.vimsopaka ?? 0;
  f['vimsopaka.tenthLord'] = vb.planets.find(p => p.planet === RASHI_LORDS[(asc + 9) % 12])?.vimsopaka ?? 0;

  const sav = ctx.ashtakavarga.sarva;
  f['sav.house10'] = sav[(asc + 9) % 12];
  f['sav.house11'] = sav[(asc + 10) % 12];
  f['sav.houses1_10_11'] = (sav[asc] + sav[(asc + 9) % 12] + sav[(asc + 10) % 12]) / 3;
  return f;
}

const rnd = mulberry32(2024);
const store: Record<string, Map<number, number[]>> = {};
for (const p of PEOPLE) {
  const actual = await natalFeatures(p.utcBirth, p.lat, p.lon);
  const ctrl: Record<string, number>[] = [];
  const t0 = new Date(p.utcBirth + 'Z').getTime();
  for (let i = 0; i < K; i++) {
    const shifted = new Date(t0 + (rnd() * 2 - 1) * 8 * YEAR).toISOString().slice(0, 19);
    ctrl.push(await natalFeatures(shifted, p.lat, p.lon));
  }
  for (const k of Object.keys(actual)) {
    const sorted = ctrl.map(c => c[k]).sort((a, b) => a - b);
    (store[k] ??= new Map()).set(p.id, [percentile(sorted, actual[k])]);
  }
}
console.log('feature'.padEnd(26), 'mean pctile  95% CI           odd   even');
for (const [k, m] of Object.entries(store)) {
  const r = clusterMean(m);
  const half = (par: number) => clusterMean(new Map([...m].filter(([id]) => id % 2 === par)), 3, 200).mean.toFixed(3);
  const star = r.lo > 0.5 || r.hi < 0.5 ? ' *' : '';
  console.log(k.padEnd(26), r.mean.toFixed(3).padEnd(12), `[${r.lo.toFixed(3)}, ${r.hi.toFixed(3)}]`.padEnd(16), half(1), half(0), star);
}
