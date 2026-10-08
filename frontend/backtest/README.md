# Backtest: does the engine's timing line up with real lives?

Two rounds: the first 50 lives (below), then 550 lives (`data/famous_people_550.csv`, the 50 plus 500 new) —
see **Round 2** at the end.

50 well-documented lives (`data/famous_people.csv`: birth data, four dated events each, death
date) run through the app's **own, unmodified** engine in Node. Everything is reproducible:

```bash
npm run backtest -- backtest/baseline.ts      # current period scores vs. the 200 events
npm run backtest -- backtest/rulesEval.ts     # pre-registered classical event-timing rules
npm run backtest -- backtest/structEval.ts    # dasha-lord enrichment, boundary proximity (exploratory)
npm run backtest -- backtest/natalCase.ts     # famous charts vs. matched ordinary charts
npm run backtest -- backtest/distribution.ts  # how the 1–10 scale and trend labels are distributed
npm run backtest -- backtest/calibrate.ts 600 40 > backtest/data/calibration.json   # population quantiles
npm run backtest -- backtest/writeCalibration.ts                                    # → src/lib/core/calibrationTable.ts
```

`data/build_people.py` regenerates `data/people.json` from the CSV. Event categories
(**M** marriage, **C** child, **A** achievement, **U** upheaval/ending, **T** transition) were assigned by hand from
the event text alone, *before* any chart was computed, so the labels cannot be tuned to the engine.
Harness check: it reproduces the dasha chains in `datasets/obama.md` and `datasets/steve.md` exactly.

## Method

For an event on date *t*, the statistic is the **mid-rank percentile of the score at *t* within the same person's
own adult life** (age 18 → death, 10–15-day grid). With no timing skill the mean is 0.5. Intervals are
person-level bootstrap (events cluster within people). Odd/even person-id halves expose anything unstable.
Controls are the person's own other dates, so nothing about the person (era, culture, how famous) can leak in.

## Results (n = 128 achievements, 33 marriages, 26 upheavals, 8 births, 32 deaths)

**1. The app's period scores do not discriminate event dates.** Mean percentile at the event: achievement vs
career/overall/wealth score 0.520 / 0.526 / 0.525 (CIs ≈ ±0.055, all include 0.5); marriage vs relationship score
0.499; upheavals vs overall/health (should be < 0.5) 0.497 / 0.497; deaths 0.468 / 0.496.

**2. Pre-registered classical rules do not either** (`rules.ts`, fixed before scoring: dasha lords' connection to the
event's houses, Jupiter/Saturn "double transit", Moon-based gochara). All same-type rules for achievements, marriages,
births and upheavals have CIs containing 0.5 and odd/even halves that disagree. The only rows that look
"significant" are Jupiter/Saturn triggers on the 2nd/7th/8th houses at the 32 death dates (≈0.58, CI lower bound
0.49–0.53) — one of ~60 tests, not replicated across event types; treated as noise and **not used**.

**3. Dasha-lord enrichment and boundary timing (exploratory, ~130 comparisons):** a few cells clear 95%
(Mars antardasha at achievements 2.2×; Saturn antardasha depleted; events within 30 days of an antardasha change
1.7×) — about what chance produces, and none replicate for another event type. Not used.

**4. Natal "promise" does not separate famous from ordinary charts.** 24 natal features (foundation scores, yogas,
dignities, Vimsopaka, Ashtakavarga) compared against 150 matched controls per person (same place, birth date ±8 y,
random time): every mean percentile is within noise of 0.5 (wealth foundation 0.41, CI 0.33–0.50, is *below*).

**What this does and doesn't say.** With ~130 events a true effect much above 0.05–0.08 in percentile terms would
have shown; anything smaller is undetectable here. So: no evidence of timing skill, and the "very strong / 9 of 10"
language the scores produce is not backed by event data. Small samples, hindsight-famous people and day-level
dates are real limits; more data and the same scripts are the way to revisit it.

## What changed in the app because of it

- **Calibrated labels** (`src/lib/core/calibration.ts`). The raw scores were inflated and area-biased: over 24,000
  random-chart periods the median career score was 7.5 (so "positive at ≥ 7" fired ~60% of the time, 10/10 ~9%) and
  the median health score 4.4 (so health was "positive" ~2% of the time and "mixed or worse" ~68%). Trend,
  intensity and the 1–10 rating now come from population percentiles, so each label means the same share of periods
  in every area (trend 30/35/25/10%; rating = decile). Raw scores are untouched.
- **Birth-instant bug fixed** (`src/lib/core/birthInstant.ts`): dasha clocks started from `new Date(bd.date)`, i.e. the
  *browser's* timezone instead of the birthplace's, shifting boundaries by hours.
- **"In plain words" card** (Now tab; `plainSummary.ts`, nine languages): headline, one line per life area, what suits /
  what to go easy on, exact dates of the main period, sub-period and next change — framed as tendencies, never events.

Deliberately **not** built: dated event windows ("marriage in 2027"), and anything about death timing. The backtest gives
no basis for them.


---

# Round 2: 550 lives (2026-10-08)

`data/famous_people_550.csv` → `data/build_people550.py` → `data/people550.json`. The first 50 rows are the
earlier set and keep their hand labels; the 500 new lives are labelled from the event text alone by fixed keyword
rules plus a hand table for the ~190 events the rules leave open (agreement with the hand labels on the first 50:
171/200). Julian-calendar births (3) and birth times rated below A (3) are dropped → **544 lives, 1,300
achievements, 391 marriages, 226 upheavals, 44 births, 262 deaths**.

The 494 new lives were split once, by a seeded shuffle, into a **discovery** half and a **confirmation** half
(`lib.ts → splitOf`); anything found on discovery is tested once on confirmation. `BT_DATA=people550` loads the set,
`BT_SPLIT=discovery,confirmation` restricts a script to the new lives.

```bash
BT_DATA=people550 BT_SPLIT=discovery,confirmation npm run backtest -- backtest/baseline.ts   # round-1 scripts, unchanged, on new lives
BT_DATA=people550 BT_SPLIT=discovery,confirmation npm run backtest -- backtest/rulesEval.ts
BT_DATA=people550 npm run backtest -- backtest/comboEval.ts        # 295 pre-registered combinations (combos.ts)
BT_DATA=people550 npm run backtest -- backtest/model.ts            # combinations LEARNED on discovery, scored on confirmation
BT_DATA=people550 npm run backtest -- backtest/natalProfession.ts  # does the chart point to the field of fame?
BT_DATA=people550 npm run backtest -- backtest/parity.ts           # app indicators == backtested rules
BT_DATA=people550 npm run backtest -- backtest/writeEvidence.ts    # → src/lib/core/evidenceTable.ts
```
(all with `TZ=UTC`; comboEval must run before model/writeEvidence.)

**Baseline used from here on: each event against the same person's days within ±4 years** (every 3rd day). Comparing
with the whole adult life, as round 1 did, lets age leak in — achievements cluster in mid-life, and anything that
tracks age (Saturn return, the mahadasha sequence) would look predictive.

## Results

| Test | Result |
|---|---|
| Engine period scores, 1,175 new achievements (round-1 script, unchanged) | career 0.501 [0.483, 0.518] — chance, now with a ±0.018 interval |
| Engine relationship score at 360 new marriages | 0.489 [0.463, 0.518] |
| Engine health score at upheavals (should be < 0.5) | 0.555 [0.511, 0.599] — the wrong way round |
| Round-1 "death trigger" (Jupiter/Saturn on 2/7/8 at death, 0.58) | 0.505 / 0.492 — did not replicate, as expected of noise |
| 295 pre-registered classical combinations × event types (647 tests) | discovery: 3 at \|z\| ≥ 3 (1.7 expected by chance); confirmation: **0 of 3 replicated** |
| Convergence counts ("5+ indicators at once"), all 544 pooled | lift 1.02 (achievements), 0.90 (marriages), 0.98 (upheavals) |
| Combinations learned from data (conditional logit, ~4,000 dasha × transit pairs) | in-sample 0.94–1.00, **held-out 0.485–0.527** — fitting the CSV memorises it |
| 21 classical profession signatures (same-day random-time control) | 0 significant; athletes have Mars in a kendra *less* often (lift 0.60) |
| Open planet × house × profession scan (612 tests) | 2 discovery hits, 0 replicated |

`combos.ts` lists every rule with its houses, karakas and selection bar, written before the new lives were scored.

## What changed in the app because of it

- **Nothing was re-weighted or added to the scores.** No rule or fitted combination predicted held-out lives, so
  adding one would only add noise dressed as precision.
- **Readings explain themselves.** Every area score is now returned as additive parts (`PredictionResult.explanation`:
  each dasha lord's share with its lordship, placement, dignity and bindus; birth-chart backing; career/wealth
  activation; delay tone; the sub-period relationship), and the overall rating likewise (`overallExplanation`). The Now
  tab's plain-words card and the Dasha tab's life-area panels open onto "the astrology behind this" — a plain
  "mainly because…" sentence, how the score adds up, the classical combinations active now, and the engine's notes
  (`lib/core/areaReading.ts`, `components/shared/AreaWhy.tsx`, nine languages).
- **36 classical combinations are named when active** (`lib/core/classicalIndicators.ts`): dasha lords tied to the
  10th / 7th / 8th, Amatyakaraka and Darakaraka periods, natural-karaka periods, Jupiter/Saturn/double transits on
  those houses, nodes across the 1–7 axis, Sade Sati phases, Ashtama and Kantaka Shani, dhana and raja yoga periods,
  MD–AD placement, chidra antardasha. `parity.ts` checks they fire exactly when the backtested rules do (235,008
  checks, 0 mismatches).
- **Their track record from this backtest is kept but not shown** (`evidenceTable.ts`, e.g. "present at 35% of 1,300
  career highlights vs 33% of nearby days — no clear difference"; a difference is called clear only at |z| ≥ 3). The
  owner chose not to display it; `SHOW_EVIDENCE` in `areaReading.ts` turns it back on in one place.
- The Now tab now builds its chart context with `predictionService.buildChartContext` (it had a reduced copy without
  the divisional charts and the Moon's nakshatra lord, so its scores differed slightly from the calibrated pipeline).
