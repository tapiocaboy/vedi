Vedic Astrology Software

A full-stack Vedic Astrology application with accurate astronomical calculations for zodiac positions, Vimshottari Dasha, and Antardasha periods using traditional Jyotish methods.

![Vedic Astrology](https://img.shields.io/badge/Vedic-Astrology-saffron)
![Python](https://img.shields.io/badge/Python-3.11+-blue)
![React](https://img.shields.io/badge/React-18+-cyan)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-green)

## Features

- 🌟 **Accurate Planetary Positions** — Swiss Ephemeris (WASM, in-browser) for sub-arcsecond precision
- 🔮 **Sidereal Zodiac** — True Chitrapaksha Lahiri, Krishnamurti, or Raman ayanamsa (Spica-anchored, not linear extrapolation)
- 🌑 **True Lunar Node** — Rahu/Ketu use the osculating node (not the mean node)
- 🌀 **IAU 2006 / Vondrák Precession** — built into Swiss Ephemeris, automatic
- 📊 **Birth Charts** — South Indian and North Indian chart styles
- 🌙 **Nakshatra System** — all 27 lunar mansions with pada calculations
- ⏳ **Vimshottari Dasha** — complete Mahadasha → Antardasha → Pratyantardasha → Sookshma timeline
- 🎨 **Beautiful UI** — modern, responsive design with traditional aesthetics

## Tech Stack

- **Architecture**: 100% client-side — no backend. Calculations run in the browser via WASM.
- **Frontend**: React 18+ with TypeScript
- **Ephemeris**: Swiss Ephemeris compiled to WebAssembly (`swisseph-wasm`), DE431-derived data file (~12 MB)
- **Styling**: Tailwind CSS with custom Vedic theme
- **State Management**: TanStack Query (React Query)

## Quick Start

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

App available at http://localhost:3000.

### Build

```bash
npm run build
```

Outputs to `frontend/dist/`. The Swiss Ephemeris WASM + data files are emitted under `dist/wasm/` by a small Vite plugin in `vite.config.ts` and lazy-loaded on first calculation (preload begins at app startup so the first chart isn't blocked).

## Deploy to Vercel (free)

The repo ships with a `vercel.json` at the root that handles the `frontend/` subdirectory build and sets correct MIME types + long-lived cache headers for the WASM assets.

1. Push the repo to GitHub / GitLab / Bitbucket.
2. In Vercel, click **Add New → Project**, import the repo.
3. **Leave every field at its default** — `vercel.json` overrides the build command (`cd frontend && npm run build`), output directory (`frontend/dist`), and install command.
4. Click **Deploy**.

### What `vercel.json` does

- **Build**: `cd frontend && npm install && npm run build` — runs from the repo root, drops into the actual app, builds with Vite.
- **Output**: `frontend/dist`.
- **Cache**: `swisseph.wasm`, `swisseph.data`, `swisseph.js`, and `/assets/*` get `Cache-Control: public, max-age=31536000, immutable` — first-time visitors download the 12 MB ephemeris file once; repeat visits cost ~0 bandwidth.
- **MIME**: explicit `application/wasm` for the WASM and `application/octet-stream` for the ephemeris data file so all browsers handle them correctly.
- **SPA fallback**: `/(.*)` rewrites to `/index.html` for any client-side navigation (existing static files take precedence, so the WASM URLs aren't intercepted).
- **Security headers**: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, restrictive `Permissions-Policy`.

### Free-tier capacity

Vercel Hobby plan = **100 GB bandwidth/month**. Each cold visit downloads ~13 MB (JS + CSS + WASM + 12 MB data file), so ~7,500 cold visits/month before hitting the cap. Cached visits cost essentially zero.

### Note on the existing `wrangler.*` files

`wrangler.toml` / `wrangler.jsonc` at the repo root are leftover Cloudflare Workers config from a previous deploy target. Vercel ignores them — they can stay or be deleted.

## Public API (client-side)

All calculations are local — there is no backend service. From `src/services/api.ts`:

| Function | Returns |
|----------|---------|
| `generateChart(birthData)` | Full chart (planets, ascendant, nakshatra, current dasha, mahadasha timeline) |
| `getDashaTimeline(birthData, yearsAhead)` | Full Vimshottari timeline with Antardashas |
| `getCurrentDasha(birthData, targetDate?)` | Current running Mahadasha / Antardasha / Pratyantardasha |
| `getPlanetPositions(birthData)` | Planetary positions only |
| `getMoonNakshatra(birthData)` | Moon's nakshatra |
| `getYogas(birthData)` | Detected yogas |

Example:

```ts
import { generateChart } from '@/services/api'

const chart = await generateChart({
  date: '1990-05-15T10:30:00',
  latitude: 28.6139,
  longitude: 77.2090,
  timezone: 'Asia/Kolkata',
  ayanamsa: 'LAHIRI',
})
```

## Project Structure

```
vedi/
└── frontend/
    ├── src/
    │   ├── components/         # Chart, Dasha, Forms
    │   ├── hooks/              # React Query hooks
    │   ├── services/api.ts     # Public async API
    │   ├── lib/
    │   │   ├── core/           # Astronomical calculations
    │   │   │   ├── ephemeris.ts    # Swiss Ephemeris (WASM) wrapper
    │   │   │   ├── rashi.ts        # Zodiac signs
    │   │   │   ├── nakshatra.ts    # Lunar mansions
    │   │   │   ├── dasha.ts        # 4-level Vimshottari
    │   │   │   └── yogas.ts        # Yoga detection
    │   │   └── services/       # chartService, predictionService
    │   ├── types/
    │   └── utils/
    ├── vite.config.ts          # Includes swissephAssets() plugin
    ├── package.json
    └── Dockerfile
```

## Calculations

### Ayanamsa Support

All three use Swiss Ephemeris' true (non-linear) definitions, not extrapolated rates.

| System | Swiss Ephemeris ID | Description |
|--------|---------|-------------|
| Lahiri (True Chitrapaksha) | `SE_SIDM_LAHIRI` | Spica-anchored; Indian government standard |
| Krishnamurti (KP) | `SE_SIDM_KRISHNAMURTI` | K.P. System calculations |
| Raman | `SE_SIDM_RAMAN` | B.V. Raman's ayanamsa |

### Lunar Nodes

Rahu uses the **true (osculating) node** (`SE_TRUE_NODE`). Ketu is the diametric opposite point. Both are reported as retrograde, following classical Vedic convention.

### Precession

IAU 2006 / Vondrák long-term precession model — built into Swiss Ephemeris, applied automatically. No manual extrapolation.

### Vimshottari Dasha Periods

| Planet | Years |
|--------|-------|
| Ketu | 7 |
| Venus | 20 |
| Sun | 6 |
| Moon | 10 |
| Mars | 7 |
| Rahu | 18 |
| Jupiter | 16 |
| Saturn | 19 |
| Mercury | 17 |
| **Total** | **120** |

## Testing

```bash
cd frontend
npm run test:run            # one-shot
npm run test                # watch mode
npm run test:coverage       # with coverage
```

## Accuracy Notes

- **Ephemeris**: Swiss Ephemeris compiled to WASM (`swisseph-wasm`), backed by the bundled `swisseph.data` file derived from JPL DE431
- **Precision**: Sub-arcsecond for planets, ~0.001″ for the Moon, across the bundled date range
- **Ayanamsa**: True (Spica-anchored Chitrapaksha for Lahiri), not linear extrapolation
- **Precession**: IAU 2006 / Vondrák long-term model

## References

- [Swiss Ephemeris](https://www.astro.com/swisseph/)
- [swisseph-wasm](https://github.com/prolaxu/swisseph-wasm) — the WASM build used here
- [Brihat Parashara Hora Shastra](https://en.wikipedia.org/wiki/Brihat_Parashara_Hora_Shastra) — classical reference

## License

MIT for application code.

**Swiss Ephemeris is dual-licensed (GPL or commercial).** The bundled `swisseph-wasm` package is GPL-3.0-or-later. For closed-source commercial use, obtain a commercial Swiss Ephemeris license from Astrodienst AG (swisseph@astro.ch).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

<p align="center">
  <strong>ॐ</strong><br>
  <em>Made with devotion for Jyotish</em>
</p>

