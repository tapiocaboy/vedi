/**
 * Parity: the app's classical indicators (src/lib/core/classicalIndicators.ts)
 * must fire exactly when the backtested rules they cite (combos.ts) fire —
 * otherwise the evidence shown beside them would describe a different rule.
 *
 *   BT_DATA=people550 TZ=UTC npm run backtest -- backtest/parity.ts
 */
import { getBodyLongitudeSeries } from '../src/lib/core/ephemeris';
import { activeIndicators, INDICATORS } from '../src/lib/core/classicalIndicators';
import { PEOPLE, cast, chainAt, mulberry32, YEAR } from './lib';
import { FEATURES, natalOf, type Sky } from './combos';

const rnd = mulberry32(4242);
const byKey = new Map(FEATURES.map(f => [f.key, f]));
let checks = 0, mismatches = 0;
for (const person of PEOPLE) {
  const c = await cast(person);
  const n = natalOf(c);
  const dates = Array.from({ length: 12 }, () => new Date(c.birth.getTime() + (1 + rnd() * 70) * YEAR));
  const lon: Record<string, number[]> = {};
  for (const b of ['SUN', 'MOON', 'MARS', 'MERCURY', 'JUPITER', 'VENUS', 'SATURN', 'RAHU'] as const) lon[b] = await getBodyLongitudeSeries(b, dates);
  dates.forEach((d, i) => {
    const ch = chainAt(c, d);
    if (!ch) return;
    const sky: Sky = {
      Sun: lon.SUN[i], Moon: lon.MOON[i], Mars: lon.MARS[i], Mercury: lon.MERCURY[i], Jupiter: lon.JUPITER[i],
      Venus: lon.VENUS[i], Saturn: lon.SATURN[i], Rahu: lon.RAHU[i],
      retro: { Mars: false, Mercury: false, Jupiter: false, Venus: false, Saturn: false },
    };
    const state = { md: ch.md, ad: ch.ad, pd: ch.pd, adIndex: 0, dMd: 999, dAd: 999, dPd: 999 };
    // adIndex as the backtest derives it from the antardasha sequence
    const seq = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
    state.adIndex = (seq.indexOf(ch.ad) - seq.indexOf(ch.md) + 9) % 9;
    const app = new Set(activeIndicators([ch.md, ch.ad, ch.pd], c.ctx, {
      Jupiter: Math.floor(sky.Jupiter / 30), Saturn: Math.floor(sky.Saturn / 30), Rahu: Math.floor(sky.Rahu / 30),
    }).map(a => a.def.key));
    for (const def of INDICATORS) {
      const f = byKey.get(def.evidence.slice(2));   // keys like 'A MD|AD …' contain '|' themselves
      if (!f) { console.log('no backtest rule for', def.key, def.evidence); mismatches++; continue; }
      const want = f.f(n, state, sky);
      checks++;
      if (want !== app.has(def.key)) {
        mismatches++;
        if (mismatches <= 20) console.log(`MISMATCH ${person.name} ${d.toISOString().slice(0, 10)} ${def.key}: backtest ${want}, app ${app.has(def.key)}`);
      }
    }
  });
}
console.log(`${checks} indicator checks, ${mismatches} mismatches`);
if (mismatches) process.exit(1);
