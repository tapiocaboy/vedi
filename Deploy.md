# Deploy to Vercel (free tier)

Step-by-step guide to host Vedi on Vercel's free **Hobby** plan.

## TL;DR — required secrets

**None.** This app is 100% client-side: calculations run in the browser via WebAssembly, there's no backend, no database, no API keys. You can deploy it with zero environment variables.

If you later add analytics, error tracking, or any third-party service, see [Environment variables](#environment-variables-optional) below.

---

## Prerequisites

- A **GitHub** (or GitLab / Bitbucket) account with this repo pushed to it.
- A free **Vercel** account — sign up at <https://vercel.com/signup> using your Git provider.
- That's it. No credit card required for the Hobby plan.

---

## Path A — Deploy via the Vercel dashboard (recommended)

### 1. Push the repo to GitHub

```bash
git add vercel.json Deploy.md README.md
git commit -m "Add Vercel deployment config"
git push origin main
```

### 2. Import into Vercel

1. Go to <https://vercel.com/new>.
2. Click **Import** next to your `vedi` repository.
3. **Do not change any settings** — `vercel.json` at the repo root overrides:
   - Build command: `cd frontend && npm run build`
   - Install command: `cd frontend && npm install`
   - Output directory: `frontend/dist`
4. Leave **Environment Variables** empty.
5. Click **Deploy**.

The first build takes ~2–3 minutes (mostly the `npm install`). You'll get a URL like `https://vedi-abc123.vercel.app`.

### 3. Auto-deploys

From this point on:
- Every push to **`main`** redeploys production automatically.
- Every push to **any other branch** gets its own preview URL (auto-shared in PR comments if you connect GitHub).

---

## Path B — Deploy via the Vercel CLI (alternative)

Useful if you want to deploy without a Git remote, or to test a build locally before pushing.

### 1. Install the CLI

```bash
npm i -g vercel
```

### 2. Log in

```bash
vercel login
```

Pick your Git provider, follow the device-auth flow.

### 3. Deploy

From the repo root:

```bash
vercel
```

You'll be prompted to:
- Link to an existing project or create a new one — pick **Create new**.
- Confirm the build settings — accept the defaults (it reads `vercel.json`).
- Wait for the deploy.

The CLI prints the preview URL. To promote to production:

```bash
vercel --prod
```

---

## Environment variables (optional)

The app itself needs **none**. But if you later want to add:

| Use case | Variable name | Where to set |
|----------|--------------|--------------|
| Vercel Web Analytics (free) | *(no variable — enable in dashboard → Analytics tab)* | Vercel dashboard |
| Sentry error tracking | `VITE_SENTRY_DSN` | Vercel → Project Settings → Environment Variables |
| PostHog / Plausible / Umami | `VITE_*` (vendor-specific) | Vercel → Project Settings → Environment Variables |
| Custom API endpoint | `VITE_API_URL` | Vercel → Project Settings → Environment Variables |

**Important Vite convention**: only env vars prefixed with `VITE_` get exposed to the browser bundle. Anything else is build-time-only.

To add a variable via the dashboard:
1. Vercel → your project → **Settings** → **Environment Variables**
2. Name + value, pick the environments (Production / Preview / Development)
3. Save → trigger a redeploy (or wait for next push)

To add via CLI:

```bash
vercel env add VITE_SENTRY_DSN production
# (paste value when prompted)
```

---

## Custom domain (optional, free)

1. In your Vercel project → **Settings** → **Domains** → **Add**.
2. Type your domain (e.g. `vedi.yourdomain.com`).
3. Vercel shows the DNS records to set:
   - **Apex** (`yourdomain.com`): an `A` record pointing to `76.76.21.21`.
   - **Subdomain** (`vedi.yourdomain.com`): a `CNAME` to `cname.vercel-dns.com`.
4. Add those records at your domain registrar.
5. Vercel issues a free Let's Encrypt SSL certificate within minutes.

---

## Post-deploy verification

Once deployed, check that the WASM assets actually serve correctly:

```bash
DEPLOY_URL=https://your-deploy.vercel.app

curl -s -I $DEPLOY_URL/wasm/swisseph.wasm | grep -i 'content-type\|cache-control'
# Expect:
#   content-type: application/wasm
#   cache-control: public, max-age=31536000, immutable

curl -s -I $DEPLOY_URL/wasm/swisseph.data | grep -i 'content-type\|cache-control'
# Expect:
#   content-type: application/octet-stream
#   cache-control: public, max-age=31536000, immutable
```

Then open the URL in a browser, generate a chart with sample birth data:
- Date: `1990-05-15T10:30:00`
- Lat/Lon: `28.6139, 77.2090`
- Timezone: `Asia/Kolkata`
- Ayanamsa: `LAHIRI`

First load takes 5–15 seconds while the 12 MB ephemeris data file downloads. Subsequent visits are instant (cached).

---

## Free-tier limits — what to watch

| Resource | Hobby limit | Our usage |
|----------|------------|-----------|
| **Bandwidth** | 100 GB / month | ~13 MB per cold visit, ~0 cached → **~7,500 cold visits/month** before cap |
| **Build minutes** | 6,000 / month | Each build ~2 min → 3,000 builds/month |
| **Deployments** | Unlimited | ✓ |
| **Serverless function invocations** | 100k / month | We use **0** — no functions |
| **Edge function invocations** | 500k / month | We use **0** |
| **Max single file size** | 100 MB | Our biggest is 12 MB |
| **HTTPS / SSL** | Included | ✓ |
| **Preview deployments** | Unlimited | ✓ |
| **Team members** | 1 (you only) | ✓ |

Vercel emails you at 80% bandwidth — no surprise overage. If you exceed, the site doesn't go down; you're prompted to upgrade.

---

## Rolling back a bad deploy

Vercel keeps every deployment immutable.

1. Project → **Deployments** tab.
2. Find a previous good build.
3. Click **⋯ → Promote to Production**.

Takes ~5 seconds and there's no data loss because this app has no backend state.

---

## Troubleshooting

### Build fails with "command not found: npm"
Vercel auto-detects Node from `package.json`. Make sure `frontend/package.json` exists and is committed.

### Deploy succeeds but page shows a blank screen
Open the browser console. The most common cause is the WASM file failing to load.
- Check the Network tab: `swisseph.wasm` and `swisseph.data` should both be `200`.
- If they're `404`: confirm `vercel.json`'s `outputDirectory` is `frontend/dist` and that the build emitted `dist/wasm/` (it does locally — run `cd frontend && npm run build && ls dist/wasm`).

### `swisseph.data` downloads slowly (>30s) on first visit
This is expected on slow connections — it's a 12 MB file. Two options:
- Accept it (subsequent visits are cached forever).
- Add a loading screen with a progress indicator (not currently implemented).

### "MIME type mismatch" error in console
`vercel.json` already sets `application/wasm` and `application/octet-stream` for the relevant files. If you forked and changed `vercel.json`, double-check those entries are intact.

### Hitting bandwidth cap
The 12 MB data file is the dominant cost. Possible mitigations:
- Already cached for 1 year (`Cache-Control: max-age=31536000, immutable`). Repeat visitors don't count.
- Use Brotli compression — Vercel does this automatically for served assets.
- If you outgrow Hobby (>7,500 unique visitors / month), upgrade to **Pro** ($20/month, 1 TB bandwidth).

### "wrangler.toml at the repo root" warning
The `wrangler.toml` and `wrangler.jsonc` files are leftover Cloudflare Workers config. Vercel ignores them — no action needed. Delete them if you've stopped using Cloudflare.

---

## License reminder

The bundled `swisseph-wasm` is **GPL-3.0-or-later**. Personal hobby hosting on a public Vercel URL is fine. For commercial/closed-source use, obtain a Swiss Ephemeris commercial license from Astrodienst AG: <swisseph@astro.ch>.
