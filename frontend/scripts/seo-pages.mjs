/**
 * Static SEO landing pages.
 *
 * The app is a single-URL SPA whose content only exists after a user fills in a
 * birth-data form. That is close to unindexable: a crawler sees one page with one
 * title and an empty form, so the whole site competes for exactly one query no
 * matter how many distinct things it does. These pages fix that — one indexable
 * URL per query cluster, each with real content, each linking into the app.
 *
 * They are deliberately plain HTML with inlined CSS and no JavaScript:
 *
 *   • they render before the 400 KB app bundle is even requested, so LCP is a
 *     few hundred milliseconds rather than a few seconds, and Core Web Vitals
 *     are a ranking input;
 *   • they are indexable by crawlers that execute little or no JS (Bing,
 *     DuckDuckGo, and most LLM crawlers), which the SPA is not;
 *   • they cannot break when the app's bundle changes.
 *
 * Run from `npm run build` after Vite, writing into dist/. Content lives in
 * PAGES below and the markup in one template, so the landing pages cannot drift
 * apart the way hand-maintained copies would.
 *
 * Close keyword twins share one URL. "Future prediction" and "future prediction
 * astrology" are the same intent; "when will I get a job" belongs on career
 * prediction, not a near-copy. India kundli vocabulary and Western birth-chart
 * vocabulary stay on separate pages.
 */

import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const ORIGIN = 'https://trytellme.xyz';
const OUT = path.resolve(process.argv[2] ?? 'dist');

// ─── Shared chrome ───────────────────────────────────────────────────────────

/**
 * Inlined, so the page paints in one round trip. Theme-aware because the app is,
 * and a landing page that flashes white into a dark app looks broken.
 */
const CSS = `
:root{--accent:#FF2E51;--bg:#0b0e18;--panel:#11141f;--text:#e8eaf0;--muted:#9aa0b0;--line:rgba(255,46,81,.14)}
@media(prefers-color-scheme:light){:root{--bg:#fafbfc;--panel:#fff;--text:#0f172a;--muted:#5a6270;--line:#e2e8f0}}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--text);
  font:16px/1.65 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif}
.wrap{max-width:820px;margin:0 auto;padding:24px 20px 72px}
a{color:var(--accent);text-decoration:none}
a:hover{text-decoration:underline}
header.top{display:flex;align-items:center;gap:10px;padding:6px 0 28px;font-weight:700;letter-spacing:-.01em}
header.top .dot{width:22px;height:22px;border-radius:6px;background:var(--accent);flex:none}
nav.crumbs{font-size:13px;color:var(--muted);margin-bottom:20px}
h1{font-size:clamp(26px,5vw,38px);line-height:1.2;margin:0 0 12px;letter-spacing:-.02em}
h2{font-size:clamp(19px,3.4vw,23px);line-height:1.3;margin:36px 0 10px;letter-spacing:-.01em}
h3{font-size:16px;margin:22px 0 6px}
p,li{color:var(--text)}
.lede{font-size:clamp(17px,2.6vw,19px);color:var(--muted);margin:0 0 26px}
.cta{display:inline-block;background:var(--accent);color:#fff;font-weight:600;
  padding:13px 22px;border-radius:11px;margin:6px 0 4px}
.cta:hover{text-decoration:none;filter:brightness(1.08)}
.note{font-size:13.5px;color:var(--muted);margin-top:10px}
.panel{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:18px 20px;margin:20px 0}
table{width:100%;border-collapse:collapse;margin:16px 0;font-size:14.5px;display:block;overflow-x:auto}
th,td{text-align:left;padding:9px 12px;border-bottom:1px solid var(--line);vertical-align:top}
th{color:var(--muted);font-weight:600;white-space:nowrap}
ul{padding-left:22px}
li{margin:5px 0}
.faq dt{font-weight:600;margin:18px 0 4px}
.faq dd{margin:0;color:var(--muted)}
.links{display:flex;flex-wrap:wrap;gap:10px;margin:18px 0 0;padding:0;list-style:none}
.links li{margin:0}
.links a{display:inline-block;border:1px solid var(--line);border-radius:9px;padding:8px 13px;font-size:14px}
.link-group{margin:18px 0 0}
.link-group h3{font-size:12px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin:0 0 8px}
footer.foot{margin-top:52px;padding-top:18px;border-top:1px solid var(--line);font-size:13px;color:var(--muted)}
footer.foot a{color:var(--muted);text-decoration:underline}
`.trim();

const escapeHtml = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Clustered internal links so 15 pages do not dump as one unsorted chip list. */
const LINK_GROUPS = [
  {
    label: 'Predictions',
    slugs: [
      'future-prediction', 'future-forecast', 'career-prediction',
      'marriage-prediction', 'love-prediction', 'kundli-analysis', 'astrology-2027',
    ],
  },
  {
    label: 'Charts & readings',
    slugs: [
      'birth-chart', 'birth-chart-reading', 'horoscope',
      'personalized-horoscope', 'ai-astrology',
    ],
  },
  {
    label: 'Matching & regions',
    slugs: ['kundli-matching', 'vedic-astrology-india', 'vedic-astrology-europe'],
  },
];

function relatedLinks(currentSlug) {
  const bySlug = new Map(PAGES.map(p => [p.slug, p]));
  const sections = LINK_GROUPS.map(g => {
    const items = g.slugs
      .filter(s => s !== currentSlug && bySlug.has(s))
      .map(s => {
        const p = bySlug.get(s);
        return `<li><a href="/${p.slug}">${escapeHtml(p.linkLabel)}</a></li>`;
      })
      .join('');
    return items
      ? `<div class="link-group"><h3>${escapeHtml(g.label)}</h3><ul class="links">${items}</ul></div>`
      : '';
  }).join('');
  return `<ul class="links"><li><a href="/">Open the calculator</a></li></ul>${sections}`;
}

function jsonLd(page) {
  const url = `${ORIGIN}/${page.slug}`;
  const graph = [
    {
      '@type': 'WebPage',
      '@id': `${url}#page`,
      url,
      name: page.title,
      description: page.description,
      inLanguage: 'en',
      isPartOf: { '@id': `${ORIGIN}/#website` },
      primaryImageOfPage: { '@id': `${ORIGIN}/og-image.png` },
      ...(page.areaServed ? { about: { '@type': 'Thing', name: 'Vedic astrology' } } : {}),
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${url}#breadcrumbs`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${ORIGIN}/` },
        { '@type': 'ListItem', position: 2, name: page.crumb, item: url },
      ],
    },
  ];
  if (page.faq?.length) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      mainEntity: page.faq.map(([q, a]) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a },
      })),
    });
  }
  if (page.howTo) {
    graph.push({
      '@type': 'HowTo',
      '@id': `${url}#howto`,
      name: page.howTo.name,
      totalTime: page.howTo.totalTime,
      step: page.howTo.steps.map((s, i) => ({
        '@type': 'HowToStep', position: i + 1, name: s.name, text: s.text,
      })),
    });
  }
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
}

function render(page) {
  const url = `${ORIGIN}/${page.slug}`;
  const faq = page.faq?.length
    ? `<h2>Common questions</h2><dl class="faq">${page.faq
        .map(([q, a]) => `<dt>${escapeHtml(q)}</dt><dd>${escapeHtml(a)}</dd>`).join('')}</dl>`
    : '';

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(page.title)}</title>
<meta name="description" content="${escapeHtml(page.description)}">
<link rel="canonical" href="${url}">
<meta name="robots" content="index,follow,max-image-preview:large">
<link rel="icon" type="image/svg+xml" href="/logo.svg">
<meta name="theme-color" content="#0b0e18" media="(prefers-color-scheme:dark)">
<meta name="theme-color" content="#fafbfc" media="(prefers-color-scheme:light)">
${page.geoRegion ? `<meta name="geo.region" content="${page.geoRegion}">` : ''}
<meta property="og:type" content="article">
<meta property="og:url" content="${url}">
<meta property="og:site_name" content="trytellme.xyz">
<meta property="og:title" content="${escapeHtml(page.ogTitle ?? page.title)}">
<meta property="og:description" content="${escapeHtml(page.description)}">
<meta property="og:image" content="${ORIGIN}/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="${page.ogLocale ?? 'en_GB'}">
${['en_IN', 'en_GB', 'si_LK'].filter(l => l !== (page.ogLocale ?? 'en_GB')).map(l => `<meta property="og:locale:alternate" content="${l}">`).join('\n')}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(page.ogTitle ?? page.title)}">
<meta name="twitter:description" content="${escapeHtml(page.description)}">
<meta name="twitter:image" content="${ORIGIN}/og-image.png">
<script type="application/ld+json">${jsonLd(page)}</script>
<style>${CSS}</style>
</head>
<body>
<div class="wrap">
<header class="top"><span class="dot"></span><a href="/" style="color:inherit">trytellme.xyz</a></header>
<nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a> › ${escapeHtml(page.crumb)}</nav>
<main>
<h1>${escapeHtml(page.h1)}</h1>
<p class="lede">${escapeHtml(page.lede)}</p>
<p><a class="cta" href="/">${escapeHtml(page.ctaLabel)}</a></p>
<p class="note">Free, no sign-up. Every calculation runs in your browser — your birth date, time and place are never sent to a server.</p>
${page.body}
${faq}
<h2>More on this site</h2>
${relatedLinks(page.slug)}
</main>
<footer class="foot">
<p>trytellme.xyz · Sidereal Vedic astrology computed locally with the Swiss Ephemeris.</p>
<p>For reflection and study, not deterministic prediction. Nothing here is medical, legal, financial or psychological advice.
<a href="/">Open the calculator</a></p>
</footer>
</div>
</body>
</html>
`;
}

// ─── Page content ────────────────────────────────────────────────────────────
//
// Each page describes something the app genuinely computes. Claiming features it
// does not have would rank briefly and then bounce, which is worse for a domain
// than not ranking at all.

const PAGES = [
  {
    slug: 'birth-chart-reading',
    crumb: 'Birth chart reading',
    linkLabel: 'Birth chart reading',
    title: 'Free Vedic Birth Chart Reading & Kundli Calculator (Lahiri, D1–D60)',
    ogTitle: 'Free Vedic Birth Chart Reading & Kundli Calculator',
    description:
      'Cast a full sidereal birth chart from your date, time and place of birth: lagna, all nine grahas, nakshatra and pada, the twelve bhavas, divisional charts D1–D60 and Ashtakavarga. Lahiri, KP or Raman ayanamsa. Free and private.',
    h1: 'Vedic birth chart reading, computed in your browser',
    lede:
      'Your janma kundali — ascendant, planets, houses, nakshatras and sixteen divisional charts — cast from the Swiss Ephemeris to sub-arcsecond accuracy, with every interpretation shown alongside the placement it comes from.',
    ctaLabel: 'Cast my birth chart',
    howTo: {
      name: 'How to read your Vedic birth chart',
      totalTime: 'PT3M',
      steps: [
        { name: 'Enter your birth details', text: 'Date, exact clock time and birth city. Time matters most: a 4-minute error moves the ascendant by roughly one degree, and a two-hour error usually changes the rising sign entirely.' },
        { name: 'Choose an ayanamsa', text: 'Lahiri (true Chitrapaksha) is the default and the Indian government standard. Krishnamurti (KP) and Raman are also available; the choice shifts every position by around one degree.' },
        { name: 'Read the ascendant first', text: 'The lagna sets which sign occupies which house, and therefore which planet rules what in your chart. Every other judgement depends on it.' },
        { name: 'Check dignity and condition', text: 'A planet\'s sign dignity, combustion (proximity to the Sun), retrogression and sign-junction position change its reading completely, and are shown per planet.' },
        { name: 'Cross-check in the divisionals', text: 'The navamsa (D9) and dasamsa (D10) refine marriage and career. A planet dignified across several divisions is load-bearing even when the rashi chart looks unremarkable.' },
      ],
    },
    body: `
<h2>What the chart contains</h2>
<p>A Vedic (sidereal) birth chart is a map of the sky at the moment and place you were born, measured against the fixed stars rather than the seasons. That is the main difference from the Western chart most people meet first: the two disagree by roughly 24 degrees, which is usually a whole sign.</p>
<table>
<tr><th>Layer</th><th>What it answers</th></tr>
<tr><td>Lagna (ascendant)</td><td>Which sign was rising — it fixes the house framework the whole chart is read through</td></tr>
<tr><td>Nine grahas</td><td>Sun through Saturn plus Rahu and Ketu, with sign, degree, house, retrogression and combustion</td></tr>
<tr><td>Twelve bhavas</td><td>The life areas: self, wealth, siblings, home, children, health, partnership, longevity, fortune, career, gains, loss</td></tr>
<tr><td>Nakshatra and pada</td><td>The lunar mansion of each body — finer than the sign, and what the dasha cycle is keyed to</td></tr>
<tr><td>Divisional charts</td><td>D2 wealth, D3 siblings, D4 property, D7 children, D9 marriage, D10 career, D12 parents, D24 learning, D30 adversity, D60 karma</td></tr>
<tr><td>Ashtakavarga</td><td>Bindu counts that grade how supported each sign is, used to weigh transits</td></tr>
<tr><td>Yogas and doshas</td><td>Named planetary combinations, from raja and dhana yogas to Mangal, Kaal Sarpa and Sade Sati</td></tr>
</table>

<h2>Why the condition of a planet matters more than its sign</h2>
<p>Most free chart tools print a sign and a degree and stop there. That omits the states which decide how a placement actually behaves:</p>
<ul>
<li><strong>Combustion (asta)</strong> — a planet within about 8–17° of the Sun, depending on the body, has its outward results burnt away even when its sign dignity is good.</li>
<li><strong>Debilitation and its cancellation</strong> — a debilitated planet meeting a Neecha Bhanga condition behaves very differently from one that does not, and classically rises late rather than early.</li>
<li><strong>Gandanta</strong> — the 3°20′ either side of the three water–fire sign junctions. A planet there can be exalted and still read as a knot.</li>
<li><strong>Retrogression</strong> — extra strength by cheshta bala, but results that arrive through revision and second attempts.</li>
</ul>
<p>All four are computed and shown per planet, with the arithmetic visible, so you can check the reading rather than take it on trust.</p>

<h2>Chart styles and settings</h2>
<ul>
<li>North Indian (diamond) and South Indian (square) layouts</li>
<li>Lahiri, Krishnamurti (KP) and Raman ayanamsa</li>
<li>True (osculating) node for Rahu and Ketu</li>
<li>Whole-sign houses, the standard for Vedic judgement</li>
<li>English and Sinhala throughout</li>
</ul>`,
    faq: [
      ['Is the birth chart calculator free?', 'Yes, completely. There is no sign-up, no payment and no cap on how many charts you can cast. The project is non-commercial.'],
      ['Is my birth data sent anywhere?', 'No. The Swiss Ephemeris runs as WebAssembly inside your browser, so your birth date, time and place never leave your device and are not stored on any server.'],
      ['How exact does my birth time need to be?', 'As exact as you can get it. Roughly four minutes of error moves the ascendant about one degree, and the divisional charts are more sensitive still — the navamsa changes every 3°20′. If you only know the hour, treat the ascendant and all divisional charts as provisional.'],
      ['Which ayanamsa should I use?', 'Lahiri unless you have a reason to prefer another. It is the true Chitrapaksha definition anchored on Spica and the Indian government standard. KP and Raman differ from it by about one degree, which is enough to shift a nakshatra pada near a boundary.'],
      ['Why does this chart differ from my Western horoscope?', 'Because it is sidereal. Western astrology measures from the moving vernal equinox and Vedic astrology from the fixed stars; the gap is currently about 24 degrees, so most people find their Vedic Sun sits in the previous sign.'],
    ],
  },

  {
    slug: 'horoscope',
    crumb: 'Horoscope reading',
    linkLabel: 'Horoscope reading',
    title: 'Vedic Horoscope Reading — Moon Sign, Rashi & Current Transits',
    description:
      'A horoscope read from your own chart rather than a sun-sign column: rashi and lagna, nakshatra, current planetary transits (gochara), Sade Sati, panchanga and the period you are actually in. Free and computed locally.',
    h1: 'A horoscope read from your chart, not your sun sign',
    lede:
      'Twelve generic forecasts cannot describe eight billion people. This reads the actual sky over your actual chart — your Moon sign, your rising sign, and where the slow planets are sitting relative to both right now.',
    ctaLabel: 'Read my horoscope',
    body: `
<h2>Rashi, lagna and why the difference matters</h2>
<p>In Vedic practice a "horoscope" usually means one of three things, and they answer different questions:</p>
<table>
<tr><th>Reference point</th><th>What it describes</th></tr>
<tr><td>Chandra rashi (Moon sign)</td><td>The mind and emotional weather. This is the reference most Indian horoscope columns actually use, and it is what transit judgement (gochara) is measured from.</td></tr>
<tr><td>Lagna (rising sign)</td><td>The body, the self and the house framework. The strongest single factor in how a chart behaves.</td></tr>
<tr><td>Surya rashi (Sun sign)</td><td>Vitality, father, authority. The least informative of the three on its own, and the one Western columns are built on.</td></tr>
</table>
<p>If you have only ever read a Western sun-sign horoscope, expect your Vedic Sun to sit one sign earlier — the two systems differ by about 24 degrees.</p>

<h2>What the current-period reading actually looks at</h2>
<ul>
<li><strong>Gochara (transits)</strong> — where the nine grahas are now, counted from your natal Moon and from your lagna, with the classical vedha obstruction rules applied.</li>
<li><strong>Sade Sati</strong> — Saturn crossing the 12th, 1st and 2nd from your Moon, with the phase named rather than just flagged.</li>
<li><strong>Kantaka and Ashtama Shani</strong> — Saturn in the 4th and 8th from the Moon.</li>
<li><strong>Ashtakavarga support</strong> — how many bindus the transited sign holds in your chart, which decides whether a transit lands hard or glances off.</li>
<li><strong>Tara bala and panchanga</strong> — tithi, nakshatra, yoga, karana and vara for the day, plus Choghadiya windows.</li>
</ul>

<div class="panel">
<h3>One thing most horoscope tools average away</h3>
<p>The outward picture and the inner one frequently disagree. An exalted Jupiter can be crossing the house of gains from your ascendant while Saturn presses your Moon at the same time — good things arriving in a stretch where you do not feel like receiving them. Collapsing that into one score destroys the only useful thing about it, so the two are reported separately.</p>
</div>

<h2>What this will not do</h2>
<p>It will not tell you what happens on Tuesday, and it does not produce a daily sun-sign column. Vedic timing works in dasha periods and slow-planet transits — weeks to years, not days. Anything claiming daily precision from a birth chart is inventing it.</p>`,
    faq: [
      ['What is my rashi?', 'Your Moon sign — the sign the Moon occupied at your birth. It needs your birth date, time and place to compute, and it is not the same as the Western sun sign most people know.'],
      ['Is this a daily horoscope?', 'No. It reads your birth chart against the current sky, which moves on a scale of weeks to years for the slow planets. It also shows the daily panchanga, but it does not manufacture a daily forecast, because a birth chart cannot support one.'],
      ['Why is my Vedic sign different from my Western one?', 'Vedic astrology is sidereal — measured against the fixed stars. Western astrology is tropical, measured from the equinox, which drifts. The two are currently about 24 degrees apart, so most people fall in the previous sign.'],
      ['Do I need my exact birth time for a horoscope reading?', 'For the Moon sign, an approximate time is usually enough unless the Moon changed sign that day. For the rising sign and anything house-based, the exact time matters — the ascendant moves through a whole sign roughly every two hours.'],
    ],
  },

  {
    slug: 'future-forecast',
    crumb: 'Future forecast',
    linkLabel: 'Future forecast & dasha timeline',
    title: 'Astrology Future Forecast — Vimshottari Dasha Timeline with Dates',
    ogTitle: 'Astrology Future Forecast — Dasha Timeline with Dates',
    description:
      'Dated future forecast from your birth chart: the full 120-year Vimshottari dasha cycle down to sookshma level, each period judged against your own chart and the transits running over it. Free, private, no sign-up.',
    h1: 'Future forecast with actual dates, not vague predictions',
    lede:
      'Vedic astrology times things. Your Vimshottari cycle divides a notional 120 years into named periods with start and end dates, and each one is judged against your chart rather than described from a generic table.',
    ctaLabel: 'See my dasha timeline',
    howTo: {
      name: 'How to read a dasha forecast',
      totalTime: 'PT5M',
      steps: [
        { name: 'Find the period you are in', text: 'The cycle nests four levels deep: mahadasha (years), antardasha (months to years), pratyantardasha (weeks to months) and sookshma (days to weeks). The deeper levels are what make a forecast dated rather than approximate.' },
        { name: 'Check the lord\'s condition in your chart', text: 'The same Venus period is not the same event in two charts. Dignity, house, combustion, retrogression and which houses the lord rules all change what it delivers.' },
        { name: 'Read the natal foundation for the area', text: 'A supportive period over a weak natal foundation opens doors that still need pushing. The two are scored separately so you can see which is which.' },
        { name: 'Overlay the transits', text: 'Slow-planet transits either reinforce the period or cut against it. Where they disagree with the dasha, that tension is named rather than averaged.' },
      ],
    },
    body: `
<h2>The four levels of the cycle</h2>
<p>Vimshottari is keyed to the nakshatra your Moon occupied at birth, which is why the whole timeline depends on an accurate birth time. Each level subdivides the one above it in the same 120-year proportions.</p>
<table>
<tr><th>Level</th><th>Typical span</th><th>What it describes</th></tr>
<tr><td>Mahadasha</td><td>6–20 years</td><td>The chapter — the overall theme of a stretch of life</td></tr>
<tr><td>Antardasha</td><td>4 months – 3 years</td><td>The sub-plot, and usually the level people actually feel</td></tr>
<tr><td>Pratyantardasha</td><td>2 weeks – 6 months</td><td>Where events cluster</td></tr>
<tr><td>Sookshma</td><td>days – weeks</td><td>Fine timing within a pratyantar window</td></tr>
</table>

<h2>Why two people in the same period get different results</h2>
<p>This is the failure mode of most dasha tools: they describe the period lord from a fixed table, so everyone in a Venus mahadasha reads the same. The lord's actual condition in your chart is what decides the outcome —</p>
<ul>
<li>Sign dignity, and whether a debilitation is cancelled</li>
<li>Which houses the lord rules from your ascendant, so whether it is a functional benefic for you specifically</li>
<li>Combustion, retrogression and Ashtakavarga bindu support</li>
<li>Whether the lord also rules your birth nakshatra or sits in your ascendant — when structural ties stack on one planet, its periods land far harder than the generic description suggests</li>
</ul>

<div class="panel">
<h3>Separative periods delay even when they are strong</h3>
<p>Saturn, Rahu and Ketu work by subtraction first. A well-placed Saturn period still stretches timelines and jams doors that were open; dignity governs whether what finally arrives is durable, not whether it is quick or comfortable. Read a strong Saturn period as "late but built to last", never as "smooth".</p>
</div>

<h2>What a forecast can and cannot claim</h2>
<p>Timing claims are testable — a period either did or did not coincide with the thing. Character claims are not, and are conditioned until they cannot fail. This engine leans on the former: dated windows, the reasoning shown, and the natal weaknesses stated plainly rather than smoothed over. It is a tool for reflection and planning, not a deterministic prediction of events.</p>
<p>If you want the conversion path rather than the dasha explainer — enter a date of birth and read career, marriage and life windows — start at <a href="/future-prediction">future prediction by date of birth</a>.</p>`,
    faq: [
      ['What is a dasha period?', 'A planetary period in the Vimshottari system: a span of time ruled by one of the nine grahas, with a defined start and end date. The full cycle covers 120 years and is keyed to the nakshatra your Moon occupied at birth.'],
      ['How far ahead can I see?', 'The whole 120-year cycle from birth, down to sookshma level for the current window. Most people find the antardasha and pratyantardasha levels the useful ones.'],
      ['Can astrology predict my future?', 'It can time periods and describe their character, and that is a genuinely different claim from predicting events. Treat dated windows as context for decisions you are making anyway — not as a forecast of what will happen to you.'],
      ['Why does my forecast mention a tension between the period and my chart?', 'Because a supportive dasha running over a weak natal foundation is the specific pattern behind "the reading says everything is good but nothing is working". The two are scored separately so that mismatch can be named instead of averaged into one misleading number.'],
    ],
  },

  {
    slug: 'kundli-matching',
    crumb: 'Kundli matching',
    linkLabel: 'Kundli matching',
    title: 'Kundli Matching & Horoscope Compatibility — Four Layers, No Fake Percentage',
    ogTitle: 'Kundli Matching & Horoscope Compatibility',
    description:
      'Free kundli milan with the eight kootas out of 36, plus the three layers most matching tools skip: dosha analysis, each chart\'s own marriage promise, and the directional synastry overlay. No single compatibility percentage.',
    h1: 'Kundli matching in four layers, not one percentage',
    lede:
      'Guna milan reads one variable — the two Moons. That is a useful filter and a poor verdict. This runs it as the gate it classically is, then does the three things a "82% compatible" score hides.',
    ctaLabel: 'Match two charts',
    body: `
<h2>The four layers</h2>
<table>
<tr><th>Layer</th><th>Question it answers</th></tr>
<tr><td>1 · Ashtakoot guna milan</td><td>Are the two temperaments rhythmically compatible? Eight kootas out of 36 — Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot, Nadi — with the classical cancellation rules applied.</td></tr>
<tr><td>2 · Dosha analysis</td><td>Does either chart carry a structural affliction to marriage, independent of the other person? Kuja (Mangal) dosha graded across three reference points, with sign exemptions and mutual cancellation.</td></tr>
<tr><td>3 · Marriage promise</td><td>What does each chart say about partnership before the other person exists? The 7th house and its lord, Venus, the patikaraka, the navamsa, the darakaraka and the Upapada Lagna.</td></tr>
<tr><td>4 · Synastry overlay</td><td>What happens when these two specific charts are laid over each other? Directional, orb-weighted contacts — the layer almost universally missing from matching apps.</td></tr>
</table>

<h2>Why there is no overall percentage</h2>
<p>Because the useful information is <em>where the layers disagree</em>, and averaging destroys exactly that. A pair can score 29.5 out of 36 on temperament and still have an adverse chart overlay; that is a specific, explicable, actionable result. Flattening it into one number throws away the only thing the analysis produced.</p>
<p>So the report names the conflicts instead: temperament aligning while structure does not, a non-mutual overlay, a chart whose own promise is weak regardless of the partner, doshas that cancel each other.</p>

<div class="panel">
<h3>Compatibility is not symmetric</h3>
<p>A onto B is not B onto A. One person's Moon can land on the other's ascendant while the reciprocal Moon lands in their sixth house — one partner feeling met by the relationship while the other does not, with neither doing anything wrong. No symmetric score can represent that, so both directions are computed and shown separately.</p>
</div>

<h2>Guna milan is a gate</h2>
<p>Classically the 36-point count is a preliminary filter: 18 or above and you proceed to the real analysis. It is not a grade. A 32 and a 21 route into the deeper layers identically, and the deeper layers carry more predictive weight — which is why a high koota score with a combust 7th lord is a worse position than a middling score with a clean one.</p>

<h2>Cancellations are not optional</h2>
<p>Omitting the parihara rules is the largest single source of false alarms in matching tools. Gana dosha is void when the Moon-sign lords are mutual friends. Bhakoot is void when they share a lord. Nadi has four separate routes out. Kuja dosha has sign-specific exemptions per house and cancels mutually when both charts carry it. All of them are applied here, and the report says which one fired.</p>`,
    faq: [
      ['What is a good kundli matching score?', '18 out of 36 is the classical threshold to proceed — but treat it as a gate rather than a grade. It measures temperament between two Moon positions and nothing else: not either chart\'s own marriage indications, not afflictions, and not what happens when the two charts are overlaid.'],
      ['Is Mangal dosha a deal-breaker?', 'Less often than it is presented as. It is graded here across three reference points, and it has real cancellations: Mars in its own sign or exalted, a Jupiter or Saturn aspect, sign-specific exemptions per house, and mutual cancellation when both charts carry it.'],
      ['Why does this not give me a compatibility percentage?', 'Because a single figure cannot represent four layers that routinely disagree, and the disagreements are the informative part. A pair with strong temperament and an adverse overlay would read as a high percentage and be actively misleading.'],
      ['Do you need both birth times?', 'For the koota score, only the two Moon positions, so an approximate time often suffices. For layers 2 to 4 — doshas, marriage promise and the overlay — both exact times are needed, because all three depend on the ascendant.'],
    ],
  },

  {
    slug: 'vedic-astrology-india',
    crumb: 'India',
    linkLabel: 'For India',
    geoRegion: 'IN',
    areaServed: 'IN',
    title: 'Free Kundli & Jyotish Calculator for India — IST, Lahiri Ayanamsa',
    ogTitle: 'Free Kundli & Jyotish Calculator for India',
    description:
      'Vedic astrology calculator set up for Indian birth data: IST handling including the pre-1942 offsets, Lahiri ayanamsa as standard, and the regional vocabularies — kundli, jathakam, porutham, jyotish. Free and private.',
    h1: 'Kundli and jyotish, set up for Indian birth data',
    lede:
      'Lahiri ayanamsa as the default, Indian Standard Time handled properly including the historical offsets, and the regional terminology mapped so you can find what you are looking for whichever tradition you grew up with.',
    ctaLabel: 'Cast my kundli',
    body: `
<h2>Timezone handling for Indian births</h2>
<p>This is where Indian chart calculations most often go wrong. India uses a single offset today, but that is a modern arrangement:</p>
<ul>
<li><strong>IST is UTC+05:30</strong> — a half-hour offset that some tools round to whole hours, which moves the ascendant by up to seven degrees.</li>
<li><strong>Before 1942</strong> Bombay and Calcutta ran their own local times. Births in that era need the historical zone, not the modern one.</li>
<li><strong>1942–1945</strong> India observed a wartime advance of an hour.</li>
</ul>
<p>The calculator resolves the offset from the IANA timezone database for the actual date of birth rather than applying a fixed number, so a 1938 Kolkata birth and a 1998 Kolkata birth are both handled correctly.</p>

<h2>Regional vocabulary</h2>
<p>The same chart goes by different names across India. All of these describe what this tool produces:</p>
<table>
<tr><th>Term</th><th>Where</th><th>What it means here</th></tr>
<tr><td>Kundli, kundali</td><td>North India, Hindi belt</td><td>The birth chart — the North Indian diamond layout</td></tr>
<tr><td>Jathakam, jataka</td><td>Kerala, Tamil Nadu, Karnataka</td><td>The birth chart — the South Indian square layout</td></tr>
<tr><td>Jyotish, jyotisha</td><td>Pan-Indian, Sanskrit</td><td>The discipline itself</td></tr>
<tr><td>Kundli milan, guna milan</td><td>North India</td><td>Ashtakoot compatibility matching</td></tr>
<tr><td>Porutham</td><td>Tamil Nadu, Kerala</td><td>Compatibility matching — ten poruthams overlap the eight kootas</td></tr>
<tr><td>Rashi, raasi</td><td>Pan-Indian</td><td>The Moon sign, which is what most Indian horoscope columns mean</td></tr>
<tr><td>Lagnam</td><td>South India</td><td>The ascendant</td></tr>
</table>

<h2>Settings that match Indian practice</h2>
<ul>
<li><strong>Lahiri (true Chitrapaksha) ayanamsa</strong> by default — the Indian government standard, Spica-anchored rather than linearly extrapolated. Krishnamurti (KP) and Raman are available for practitioners who use them.</li>
<li><strong>Whole-sign houses</strong>, the standard for Parashari judgement, rather than the quadrant systems Western software defaults to.</li>
<li><strong>Both chart layouts</strong> — North Indian diamond and South Indian square.</li>
<li><strong>True node</strong> for Rahu and Ketu, with the mean node available.</li>
<li><strong>Vimshottari dasha</strong> to sookshma level, plus Ashtakavarga, the standard divisionals D1 through D60, and the classical doshas including Mangal, Kaal Sarpa and Sade Sati.</li>
</ul>

<div class="panel">
<h3>Birth time accuracy</h3>
<p>Indian birth certificates often record the hour but not the minute. If that is all you have, the Moon sign and dasha timeline remain broadly usable, but the ascendant and every divisional chart should be treated as provisional — the navamsa changes every 3°20′ of the Moon's motion, which is a matter of minutes.</p>
</div>`,
    faq: [
      ['Is this kundli calculator free?', 'Yes, and there is no sign-up. It is a non-commercial project, and every calculation runs in your browser rather than on a server.'],
      ['Which ayanamsa is used for Indian charts?', 'Lahiri, in the true Chitrapaksha definition anchored on Spica — the Indian government standard. KP and Raman are selectable if your tradition uses them.'],
      ['Does it handle IST and the older Indian time zones?', 'Yes. Offsets are resolved from the IANA timezone database for the actual date of birth, so pre-1942 local times and the 1942–45 wartime advance are applied correctly rather than assuming the modern UTC+05:30.'],
      ['Can I get kundli milan for marriage?', 'Yes — the eight kootas out of 36 with the classical cancellations, plus dosha analysis, each chart\'s own marriage promise and the synastry overlay. It deliberately does not produce a single compatibility percentage.'],
      ['Is my birth data safe?', 'It never leaves your device. The Swiss Ephemeris runs as WebAssembly in your browser, and nothing is uploaded or stored.'],
    ],
  },

  {
    slug: 'vedic-astrology-europe',
    crumb: 'Europe',
    linkLabel: 'For Europe',
    geoRegion: 'EU',
    areaServed: 'EU',
    title: 'Vedic (Sidereal) Astrology for Europe — How It Differs From Your Star Sign',
    ogTitle: 'Vedic (Sidereal) Astrology for Europe',
    description:
      'Vedic astrology for European birth data: why your sidereal sign differs from your Western star sign by about 24°, correct CET/CEST and BST handling with historical DST, and what Jyotish offers that tropical astrology does not.',
    h1: 'Vedic astrology for European birth charts',
    lede:
      'If you know your star sign from a Western horoscope, your Vedic chart will look wrong at first — the Sun usually sits one sign earlier. That is not an error; it is the whole difference between the two systems, and it is worth understanding before you read anything else.',
    ctaLabel: 'Cast my sidereal chart',
    body: `
<h2>Sidereal against tropical: the 24-degree gap</h2>
<p>Western astrology is <strong>tropical</strong>: it measures from the vernal equinox, defining 0° Aries as wherever the Sun is at the spring equinox. Vedic astrology is <strong>sidereal</strong>: it measures against the fixed stars.</p>
<p>The equinox drifts backwards through the constellations by about one degree every 72 years — precession. Over the two millennia since the two systems agreed, the gap has opened to roughly 24 degrees. That difference is the <em>ayanamsa</em>, and subtracting it is what turns a tropical chart into a sidereal one.</p>
<table>
<tr><th>If your Western Sun is</th><th>Your Vedic Sun is usually</th></tr>
<tr><td>Aries (21 Mar – 19 Apr)</td><td>Pisces, or early Aries late in the range</td></tr>
<tr><td>Taurus (20 Apr – 20 May)</td><td>Aries, or early Taurus late in the range</td></tr>
<tr><td>Gemini (21 May – 20 Jun)</td><td>Taurus, or early Gemini late in the range</td></tr>
</table>
<p>The pattern continues around the zodiac: births in roughly the first three weeks of a Western sign fall in the previous sidereal sign. The exact boundary depends on your birth year, because the ayanamsa keeps moving.</p>

<h2>European timezone handling</h2>
<p>European birth data carries more timezone traps than Indian data, and they are the most common source of a wrong ascendant:</p>
<ul>
<li><strong>Summer time</strong> — CEST and BST shift the offset by an hour for part of the year. Whether it applied on your birth date depends on the year and the country; several European states changed their rules repeatedly through the twentieth century.</li>
<li><strong>Double summer time</strong> — Britain ran two hours ahead of GMT in parts of the 1940s, and again 1968–71 with year-round BST.</li>
<li><strong>Wartime and occupation changes</strong> — much of continental Europe was moved onto Berlin time during the 1940s.</li>
<li><strong>Countries that changed zone entirely</strong> — Portugal, Spain and the Baltic states have all shifted.</li>
</ul>
<p>Offsets are resolved from the IANA timezone database for your actual birth date and city, so these are applied rather than assumed. Enter your local clock time exactly as recorded — do not convert it to UTC or adjust for summer time yourself.</p>

<div class="panel">
<h3>High-latitude births</h3>
<p>Above about 60° north — much of Scandinavia, Scotland and the Baltics — quadrant house systems become distorted and can even fail. Vedic astrology sidesteps this by using whole-sign houses, where each house is exactly one sign. Charts for Oslo, Stockholm, Helsinki and Reykjavík are as well defined as charts for Rome.</p>
</div>

<h2>What Jyotish offers that tropical astrology does not</h2>
<ul>
<li><strong>Dated timing.</strong> The Vimshottari dasha system divides life into named periods with start and end dates, nested four levels deep. Western astrology has transits and progressions but no equivalent lifelong period scheme.</li>
<li><strong>Nakshatras.</strong> A 27-fold lunar division finer than the twelve signs, and the thing the whole timing system is keyed to.</li>
<li><strong>Divisional charts.</strong> Sixteen derived charts, each magnifying one area — the navamsa for marriage, the dasamsa for career.</li>
<li><strong>Named combinations.</strong> Several hundred classical yogas and doshas with defined conditions, rather than aspect patterns interpreted case by case.</li>
</ul>

<h2>Language</h2>
<p>The interface is in English throughout, with Sinhala available. Sanskrit terms are used where they are the precise word, and glossed in plain English the first time they appear on each screen.</p>`,
    faq: [
      ['Why is my Vedic sign different from my star sign?', 'Because Vedic astrology is sidereal, measured against the fixed stars, while Western astrology is tropical, measured from the drifting vernal equinox. The two are currently about 24 degrees apart, so most people\'s sidereal Sun falls in the previous sign.'],
      ['Does the calculator handle European summer time?', 'Yes. Offsets come from the IANA timezone database for your actual birth date and city, so historical CEST, BST, British double summer time and the 1968–71 year-round BST period are all applied. Enter your local clock time exactly as recorded.'],
      ['Does it work for high-latitude births in Scandinavia?', 'Yes, and better than quadrant-based Western software. Vedic astrology uses whole-sign houses, where each house is one full sign, so the distortion that affects Placidus and Koch above roughly 60° north does not arise.'],
      ['Can I use it if I only know Western astrology?', 'Yes. Every reading names the placement it comes from, so you can see how a conclusion was reached, and the Sanskrit terms are glossed in English. The main adjustment is the sign shift, which is explained above.'],
      ['Is it free and private?', 'Both. There is no sign-up and no payment, and all calculations run locally in your browser using the Swiss Ephemeris — your birth details are never transmitted or stored, which also means there is no personal data to process under GDPR.'],
    ],
  },

  {
    slug: 'future-prediction',
    crumb: 'Future prediction',
    linkLabel: 'Future prediction by date of birth',
    priority: '0.9',
    ogLocale: 'en_IN',
    title: 'Future Prediction by Date of Birth — Personalized Birth Chart Reading',
    ogTitle: 'Future Prediction by Date of Birth',
    description:
      'Get a personalized future prediction from your birth chart. Enter date, time and place of birth for dated career, marriage, love and life windows — not a sun-sign column. Free and private.',
    h1: 'Future prediction by date of birth',
    lede:
      'A generic horoscope describes a twelfth of the planet. A future prediction from your date, time and place of birth reads the chart you actually have — then times the chapters with start and end dates.',
    ctaLabel: 'Get my future prediction',
    howTo: {
      name: 'How to get a future prediction from your date of birth',
      totalTime: 'PT3M',
      steps: [
        { name: 'Enter date, time and place', text: 'The date sets the sky. The exact clock time sets the ascendant and the dasha start. The place sets the house framework. All three are required for a personal reading.' },
        { name: 'Cast the birth chart', text: 'The engine computes the sidereal chart in your browser: lagna, nine grahas, nakshatras, houses and the running Vimshottari periods.' },
        { name: 'Read the life areas against the current period', text: 'Career, marriage, love, wealth and health are judged from the period you are in and from the natal houses that govern them — not from a one-size forecast.' },
        { name: 'Move the date', text: 'The same chart can be read for a past year or a future one. That is how a 2027 career window or a marriage timing question becomes a dated answer rather than a vibe.' },
      ],
    },
    body: `
<h2>Why date of birth is not enough on its own</h2>
<p>Search results for “future prediction by date of birth” often hide a sun-sign gadget behind that phrase. Date of birth without time and place can guess a Moon sign on a quiet day. It cannot set the rising sign, the houses, or the dasha timeline. Those are what turn a horoscope into a personal future reading.</p>
<table>
<tr><th>What you enter</th><th>What it unlocks</th></tr>
<tr><td>Date of birth</td><td>The planetary sky that day — Sun, and usually the Moon if it did not change sign</td></tr>
<tr><td>Exact birth time</td><td>Lagna, every house, divisional charts, and the start of your 120-year dasha cycle</td></tr>
<tr><td>Birth place</td><td>The local horizon, so the same UTC instant is not treated as the same chart in two cities</td></tr>
</table>

<h2>What the reading actually predicts</h2>
<p>The product proposition is not “read your horoscope.” It is: explore your past and future through your birth chart. The engine scores the period you are in against four life areas — career, relationships, wealth and health — and shows the dated dasha stack (mahadasha down to sookshma) plus the transits running over it.</p>
<ul>
<li><strong>Life prediction</strong> — the overall theme of the running chapter, with a natal-foundation check so a weak house is not sold as a lucky year.</li>
<li><strong>Birth chart future prediction</strong> — the same chart, moved to a date you choose, so 2026, 2027 and later are real sky + period overlays rather than a yearly magazine column.</li>
<li><strong>Astrology future prediction</strong> — timing first. A period either covers a window or it does not. Character claims stay labelled as character.</li>
</ul>

<div class="panel">
<h3>This is not a daily horoscope</h3>
<p>Vedic timing works in weeks to years. Anything that claims Tuesday’s luck from a birth chart is inventing resolution the chart does not have. If you want the daily sky, the panchanga is on the calculator; it is not a personal event forecast.</p>
</div>

<h2>Related readings</h2>
<p>Specific questions belong on their own pages: <a href="/career-prediction">career and job timing</a>, <a href="/marriage-prediction">marriage timing</a>, <a href="/love-prediction">love and relationship astrology</a>, and the dasha explainer at <a href="/future-forecast">future forecast</a>. Indian kundli vocabulary lives on <a href="/kundli-analysis">kundli analysis</a>.</p>`,
    faq: [
      ['Can astrology predict my future from my date of birth?', 'It can time planetary periods and describe their character from your birth chart. That is a different claim from naming events. Treat dated windows as context for decisions you are already making.'],
      ['Why do you ask for birth time and place as well?', 'Date of birth alone cannot set the ascendant or the dasha start. A two-hour error usually changes the rising sign; a few minutes can change a divisional chart. Place fixes the local horizon.'],
      ['Is this a horoscope future prediction or a birth-chart reading?', 'A birth-chart reading. A horoscope column is twelve texts. This casts your chart and reads the period you are actually in.'],
      ['Is the future prediction free and private?', 'Yes. No sign-up. The Swiss Ephemeris runs in your browser, so birth details are not uploaded.'],
    ],
  },

  {
    slug: 'career-prediction',
    crumb: 'Career prediction',
    linkLabel: 'Career prediction',
    priority: '0.9',
    ogLocale: 'en_IN',
    geoRegion: 'IN',
    title: 'Career Prediction by Date of Birth — Job Timing from Your Birth Chart',
    ogTitle: 'Career Prediction by Date of Birth',
    description:
      'Career prediction by date of birth: when will I get a job, promotion windows, and career astrology from your dasha timeline and 10th house — not a generic career horoscope. Free, private, in your browser.',
    h1: 'Career prediction by date of birth',
    lede:
      '“When will I get a job?” is a timing question. Career astrology can date the periods that favour work, interviews and promotion — it cannot mint an offer letter. This reading uses your 10th house, dasamsa and the dasha you are in.',
    ctaLabel: 'See my career prediction',
    howTo: {
      name: 'How to read a career prediction from your chart',
      totalTime: 'PT4M',
      steps: [
        { name: 'Cast the chart from birth details', text: 'Date, exact time and place. Career judgement depends on the 10th house, its lord, Saturn, the Sun and the dasamsa (D10) — all of which move if the time is wrong.' },
        { name: 'Read the natal career foundation', text: 'A strong period over a weak 10th house opens doors that still need pushing. The two scores are shown separately so that mismatch is visible.' },
        { name: 'Find the running work period', text: 'Vimshottari periods of the 10th lord, Saturn, the Sun, Mercury or a well-placed yogakaraka are the usual job and promotion windows.' },
        { name: 'Ask the timing question against a year', text: 'Move the forecast to the year you care about. “Job kab milegi” is answered as a window, not a calendar day.' },
      ],
    },
    body: `
<h2>What career astrology can answer</h2>
<table>
<tr><th>Question people actually type</th><th>What the chart can show</th></tr>
<tr><td>Career prediction by date of birth</td><td>10th house, D10, current dasha and transits judged together</td></tr>
<tr><td>Job prediction by date of birth / job kab milegi</td><td>Whether a work-producing period is running or approaching, and how strong the natal job foundation is</td></tr>
<tr><td>When will I get a job? / date of birth se job kab lagegi</td><td>Dated mahadasha and antardasha windows — weeks to years, not a Tuesday</td></tr>
<tr><td>Promotion prediction / career change</td><td>Whether the same period supports elevation or a change of field, from lordship and transits</td></tr>
<tr><td>Career horoscope / career astrology prediction</td><td>Your chart, not a sun-sign career column for the week</td></tr>
</table>

<h2>The houses and charts that actually govern work</h2>
<ul>
<li><strong>10th house (karma bhava)</strong> — profession, status, what the world pays you to do.</li>
<li><strong>6th house</strong> — service, employment, competition, the daily job rather than the vocation.</li>
<li><strong>2nd and 11th</strong> — income and gains; a job can arrive in a weak 10th if these are firing.</li>
<li><strong>Dasamsa (D10)</strong> — the career divisional. A planet that looks average in D1 and exalted in D10 is a worker; the reverse is a title without traction.</li>
<li><strong>Saturn and the Sun</strong> — endurance and authority. Their periods often coincide with the first real role or the first real promotion.</li>
</ul>

<div class="panel">
<h3>Separative periods delay jobs even when they are “good”</h3>
<p>Saturn, Rahu and Ketu stretch timelines. A well-placed Saturn dasha is a late, durable appointment more often than a sudden one. If the question is “job kab milegi,” a strong Saturn window still means wait — and then stay.</p>
</div>

<h2>Government job, business, career change</h2>
<p>Those are different 10th-house flavours, not different apps. A Saturn- or Sun-ruled 10th with a supportive 6th leans service and government. A Mercury- or Jupiter-ruled 10th with a strong 11th leans business and clients. The calculator names the lords and the period; it does not print a vacancy list.</p>
<p>For marriage or love timing see <a href="/marriage-prediction">marriage prediction</a> and <a href="/love-prediction">love prediction</a>. The parent page is <a href="/future-prediction">future prediction by date of birth</a>.</p>`,
    faq: [
      ['Can astrology tell me when I will get a job?', 'It can show whether a career-producing dasha and supportive transits are running. It cannot name an employer or a joining date. Use the window; do the applications.'],
      ['Is job prediction by date of birth accurate without birth time?', 'Not enough. The 10th house and D10 depend on the ascendant. If you only know the hour, treat the career reading as provisional.'],
      ['What is the difference between a career horoscope and this?', 'A career horoscope is usually twelve paragraphs. This is career astrology from your chart: houses, dashas and the dasamsa.'],
      ['Do you answer “job kab milegi kundli se”?', 'In substance, yes — the kundli’s 10th house and dasha stack. The Hindi phrasing is the same question as “when will I get a job from my birth chart.”'],
    ],
  },

  {
    slug: 'marriage-prediction',
    crumb: 'Marriage prediction',
    linkLabel: 'Marriage prediction',
    priority: '0.9',
    ogLocale: 'en_IN',
    geoRegion: 'IN',
    title: 'Marriage Prediction by Date of Birth — When Will I Get Married?',
    ogTitle: 'Marriage Prediction by Date of Birth',
    description:
      'Marriage prediction by date of birth: when will I get married, marriage timing astrology, and future spouse indications from the 7th house, navamsa and dasha — not a fake wedding date. Free and private.',
    h1: 'Marriage prediction by date of birth',
    lede:
      '“When will I get married?” is the question. Marriage astrology can time the periods that favour a wedding and describe the chart’s own partnership promise. It cannot book a hall.',
    ctaLabel: 'See my marriage prediction',
    howTo: {
      name: 'How to read marriage timing from a birth chart',
      totalTime: 'PT4M',
      steps: [
        { name: 'Need an accurate birth time', text: 'The 7th house, Upapada and navamsa all move if the time is wrong. Marriage timing from date of birth alone is a guess.' },
        { name: 'Read the natal marriage promise first', text: '7th house and lord, Venus, Jupiter (for traditional marriage support), darakaraka, Upapada Lagna and D9. A quiet natal 7th will not become loud just because a Venus dasha started.' },
        { name: 'Find the marriage-producing periods', text: 'Classically, periods of the 7th lord, Venus, Jupiter, the darakaraka or planets in the 7th / navamsa 7th. Overlay transits of Jupiter and Saturn.' },
        { name: 'Match two charts only after that', text: 'Kundli matching answers “these two people.” Marriage prediction answers “this chart.” Do not skip the second when you only wanted the first.' },
      ],
    },
    body: `
<h2>Marriage prediction vs kundli matching</h2>
<p>They are different searches and different jobs. This page is <em>your</em> chart’s marriage timing. <a href="/kundli-matching">Kundli matching</a> is two charts overlaid — guna milan, doshas and synastry. A strong matching score does not create a marriage dasha; a marriage dasha does not fix an adverse overlay.</p>
<table>
<tr><th>Search</th><th>What you get here</th></tr>
<tr><td>Marriage prediction by date of birth</td><td>7th house, navamsa and the dasha windows that favour a wedding</td></tr>
<tr><td>When will I get married? / meri shaadi kab hogi</td><td>Dated periods, not a calendar day. Shaadi kab hogi kundli se is this reading in other words</td></tr>
<tr><td>Marriage astrology / marriage horoscope</td><td>Your chart’s partnership promise plus current timing</td></tr>
<tr><td>Future spouse prediction</td><td>Indications from the 7th, Venus, darakaraka and D9 — character and timing, not a name or photo</td></tr>
<tr><td>Love marriage vs arranged</td><td>Venus/Rahu/5th signatures vs Jupiter/7th/family-house signatures — tendencies, not a verdict</td></tr>
</table>

<h2>Future husband, future wife</h2>
<p>Those queries are the same technique with a gendered label. The chart does not print a passport. It describes the 7th-lord condition, Venus or Jupiter as spouse karaka, and the navamsa. “Future husband prediction astrology” and “future wife prediction astrology” belong here; they are not separate products.</p>

<div class="panel">
<h3>Delay is a pattern, not a curse</h3>
<p>Saturn or Ketu on the 7th, a combust Venus, or a late-marriage dasha stack stretches the wait. That is information about timing, not a life sentence. A delay yoga plus a coming 7th-lord antardasha is a much more useful sentence than “Mangal dosha.”</p>
</div>

<h2>What this will not do</h2>
<p>It will not give a wedding date to the day, and it will not describe a spouse you could pick out of a crowd. Love-life weather without the marriage question lives on <a href="/love-prediction">love prediction</a>. Compatibility with a specific person is <a href="/kundli-matching">kundli matching</a>.</p>`,
    faq: [
      ['When will I get married according to astrology?', 'Look at the running and upcoming periods of the 7th lord, Venus, Jupiter and the navamsa 7th, plus Jupiter/Saturn transits. That yields a window, not a date.'],
      ['Can you predict marriage from date of birth only?', 'Only roughly. Without birth time the 7th house and navamsa are unreliable. Get the time from a certificate or a relative if you can.'],
      ['Is this kundli matching?', 'No. Matching needs two birth data. This page is one chart’s marriage promise and timing.'],
      ['Do you predict love marriage or arranged marriage?', 'The chart can lean — 5th/Venus/Rahu versus 7th/Jupiter/family houses. Plenty of charts show both. Treat it as a tendency.'],
    ],
  },

  {
    slug: 'love-prediction',
    crumb: 'Love prediction',
    linkLabel: 'Love prediction',
    priority: '0.8',
    title: 'Love Prediction by Date of Birth — Relationship Astrology from Your Chart',
    ogTitle: 'Love Prediction by Date of Birth',
    description:
      'Love prediction by date of birth: relationship astrology, love horoscope and love-marriage timing from the 5th and 7th houses, Venus and the dasha you are in — not a daily love column. Free and private.',
    h1: 'Love prediction by date of birth',
    lede:
      'Love astrology is not a daily sun-sign crush forecast. It is the 5th house (romance), Venus, the Moon, and whether the period you are in actually supports meeting someone — plus whether the 7th house is ready if that meeting is meant to last.',
    ctaLabel: 'See my love prediction',
    body: `
<h2>Love prediction is not marriage prediction</h2>
<p>People search both on the same afternoon and they are not the same chart question. <a href="/marriage-prediction">Marriage prediction</a> times a wedding from the 7th and navamsa. Love prediction asks whether romance, attraction and emotional weather are supported <em>now</em> — 5th house, Venus, Moon, Rahu, the running dasha — even when marriage is years away.</p>
<table>
<tr><th>Term</th><th>What it should mean</th></tr>
<tr><td>Love prediction by date of birth</td><td>Your 5th/Venus/Moon against the current dasha, from birth data</td></tr>
<tr><td>Love astrology / relationship astrology</td><td>How you attach, what you chase, where the chart frays under transits</td></tr>
<tr><td>Love horoscope</td><td>Here: your chart. Not “Libra this week”</td></tr>
<tr><td>Love prediction astrology / love marriage prediction</td><td>Whether romance periods and marriage periods overlap — a 5th-lord dasha with a silent 7th is dating, not a wedding</td></tr>
</table>

<h2>What the engine actually looks at</h2>
<ul>
<li><strong>5th house</strong> — romance, speculation, the person you cannot stay sensible about.</li>
<li><strong>Venus</strong> — desire and how you show it; combustion and debility change the plot more than the sign meme.</li>
<li><strong>Moon</strong> — whether you can feel the relationship you are in. A hard Saturn gochara on the Moon makes even a good Venus period feel lonely.</li>
<li><strong>7th house</strong> — whether the romance has a container. Relationship astrology that ignores it describes crushes that never become a life.</li>
<li><strong>Dasha overlay</strong> — the same Venus antardasha is a meet-cute in one chart and a breakup-and-reset in another, depending on lordship and natal condition.</li>
</ul>

<div class="panel">
<h3>Compatibility is a second chart</h3>
<p>Love prediction from one date of birth cannot tell you if <em>this</em> person is the one. For that you need <a href="/kundli-matching">kundli matching</a> or Western synastry — two birth data, both directions. One-chart love readings that name a partner’s appearance are fiction.</p>
</div>

<h2>Love horoscope today</h2>
<p>There is no honest “love horoscope today” from a birth chart. Transits of the Moon change every two and a half days; they colour mood, they do not schedule a confession. Use the calculator’s current-period reading for weeks-to-months, and the panchanga if you want the day’s sky without pretending it is personal fate.</p>`,
    faq: [
      ['Can I get a love prediction from my date of birth?', 'Yes, as a chart reading: 5th house, Venus, Moon and the dasha you are in. Add birth time or the houses are guesswork.'],
      ['Is this the same as a love horoscope?', 'Only if “horoscope” means your chart. It is not a daily love horoscope for your sun sign.'],
      ['Can you predict a love marriage?', 'You can see whether romance periods and marriage periods coincide. That is a tendency, not a certificate.'],
      ['Do I need my partner’s details?', 'Not for your own love timing. You do for compatibility — use kundli matching.'],
    ],
  },

  {
    slug: 'kundli-analysis',
    crumb: 'Kundli analysis',
    linkLabel: 'Kundli analysis',
    priority: '0.9',
    ogLocale: 'en_IN',
    geoRegion: 'IN',
    areaServed: 'IN',
    title: 'Kundli Analysis & Janam Kundli — Kundli Future Prediction Online',
    ogTitle: 'Kundli Analysis & Future Prediction',
    description:
      'Free janam kundli and kundli analysis online: lagna, grahas, dasha, yogas and kundli future prediction from your birth details. Kundali prediction without a fake percentage. Private — runs in your browser.',
    h1: 'Kundli analysis and janam kundli, from your birth details',
    lede:
      'A janam kundli is not a stamp. Kundli analysis means reading the chart you were born with — houses, dashas, yogas — and then asking it the life questions people actually type: future, job, shaadi.',
    ctaLabel: 'Open my janam kundli',
    howTo: {
      name: 'How to use this kundli calculator',
      totalTime: 'PT3M',
      steps: [
        { name: 'Enter janam details', text: 'Date, exact time, place. Indian certificates often omit minutes; say so to yourself and treat lagna and vargas as provisional if you only have the hour.' },
        { name: 'Keep Lahiri unless you practise otherwise', text: 'True Chitrapaksha is the default. KP and Raman are in the settings.' },
        { name: 'Read lagna, then the running dasha', text: 'Kundli prediction that skips the current mahadasha/antardasha is a static portrait. The future question lives in the period.' },
        { name: 'Open the life-area scores', text: 'Career, relationships, wealth and health are judged from this kundli against the period — that is the kundli future prediction, not a separate product.' },
      ],
    },
    body: `
<h2>Kundli, kundali, janam kundli</h2>
<p>Same chart, different spelling. This page is the Indian vocabulary for what the calculator already is: a sidereal janma kundali with North or South Indian layout, Vimshottari dasha, yogas, doshas and vargas. The Western-facing twin is <a href="/birth-chart">birth chart</a>; the technical reading guide is <a href="/birth-chart-reading">birth chart reading</a>.</p>
<table>
<tr><th>Phrase</th><th>What to open</th></tr>
<tr><td>Janam kundli / kundali</td><td>The D1 chart — lagna, nine grahas, bhavas, nakshatra</td></tr>
<tr><td>Kundli analysis</td><td>Dignity, combustion, retrogression, yogas, doshas, vargas — not just a sign map</td></tr>
<tr><td>Kundli future prediction / kundli prediction / kundali prediction</td><td>Dasha stack + gochara on this kundli, including career and marriage windows</td></tr>
<tr><td>Kundli se job kab milegi / shaadi kab hogi</td><td>The same engine, asked as a timing question — see <a href="/career-prediction">career</a> and <a href="/marriage-prediction">marriage</a></td></tr>
</table>

<h2>What a serious kundli analysis includes</h2>
<ul>
<li>Lagna and house lords, not only planet-in-sign</li>
<li>Nakshatra and pada — the dasha clock is keyed to the Moon’s mansion</li>
<li>Condition: exaltation, debility, Neecha Bhanga, combustion, gandanta, retrogression</li>
<li>Yogas and doshas with the cancellation rules (Mangal, Kaal Sarpa, Sade Sati)</li>
<li>Divisional charts at least through D9 and D10</li>
<li>Ashtakavarga bindus for whether a transit lands or glances off</li>
</ul>

<div class="panel">
<h3>Kundli future prediction is a period reading</h3>
<p>A kundli without dasha is a photograph. Kundli prediction is the photograph plus the chapter you are in. Two people with similar D1 maps get different “future” sentences because their Moon nakshatras started the 120-year clock at different offsets.</p>
</div>

<h2>India setup</h2>
<p>IST including historical offsets, Lahiri default, both chart styles. Longer notes on Indian timezones and regional words (jathakam, porutham, rashi) are on <a href="/vedic-astrology-india">Vedic astrology for India</a>. Matching two kundlis is <a href="/kundli-matching">kundli matching</a>.</p>`,
    faq: [
      ['Is this janam kundli calculator free?', 'Yes. No sign-up, no cap. Calculations run in your browser.'],
      ['What is kundli analysis vs kundli prediction?', 'Analysis is the chart’s structure. Prediction is that structure read through the current dasha and transits. This tool does both.'],
      ['Kundli and kundali — which spelling is right?', 'Both. North Indian usage varies. The chart is the same.'],
      ['Can I ask job kab milegi or shaadi kab hogi from this kundli?', 'Yes — those are career and marriage timing questions on this same janam kundli. Use the life-area reading and the dasha dates, not a single lucky day.'],
    ],
  },

  {
    slug: 'birth-chart',
    crumb: 'Birth chart',
    linkLabel: 'Birth chart',
    priority: '0.9',
    title: 'Free Birth Chart & Natal Chart Calculator — Personal Astrology Reading',
    ogTitle: 'Free Birth Chart & Natal Chart Calculator',
    description:
      'Free birth chart and natal chart calculator: planets, houses, rising sign and a personal reading from your date, time and place of birth. Sidereal or Western. Private — computed in your browser.',
    h1: 'Free birth chart and natal chart calculator',
    lede:
      'A birth chart is the sky at the moment you were born, mapped onto twelve houses. This calculator draws that natal chart from your date, time and place — then reads it, instead of stopping at a pretty wheel.',
    ctaLabel: 'Cast my birth chart',
    howTo: {
      name: 'How to calculate a birth chart',
      totalTime: 'PT2M',
      steps: [
        { name: 'Date, time, place', text: 'Time matters: the rising sign changes roughly every two hours. Place matters: the same instant is a different ascendant in London and in Lisbon.' },
        { name: 'Choose the zodiac', text: 'Western (tropical) or Vedic (sidereal). They differ by about 24°. If you only know your star sign from magazines, start Western; if you want dashas and kundli language, use Vedic.' },
        { name: 'Read rising, Moon and Sun in that order', text: 'Rising sets the houses. Moon is the weather. Sun is vitality. A birth chart that only advertises the Sun is a horoscope column.' },
        { name: 'Open the reading, not only the glyph', text: 'Dignity, house rulership and current timing are the interpretation. The wheel is the index.' },
      ],
    },
    body: `
<h2>Birth chart, natal chart, astrology chart</h2>
<p>Three names for one map. “Natal chart” is the European/US term; “birth chart” is the search most people use; “astrology chart” is the same drawing. This page is the Western-facing calculator. The Vedic how-to is <a href="/birth-chart-reading">birth chart reading</a>; Indian kundli language is <a href="/kundli-analysis">kundli analysis</a>.</p>
<table>
<tr><th>Tool people search</th><th>What you get</th></tr>
<tr><td>Free birth chart / free natal chart</td><td>Full chart, no account</td></tr>
<tr><td>Birth chart calculator / natal chart calculator / astrology chart calculator</td><td>Swiss Ephemeris positions in the browser</td></tr>
<tr><td>Birth chart interpretation / analysis / astrology chart reading</td><td>Placements explained next to the wheel, plus current-period timing on the Vedic side</td></tr>
<tr><td>Moon sign / rising sign / ascendant calculator</td><td>Included in the same chart — they are not separate engines</td></tr>
</table>

<h2>What must be on a real natal chart</h2>
<ul>
<li>All planets (and, in Vedic mode, Rahu and Ketu)</li>
<li>Ascendant (rising sign) and house cusps — whole-sign in Vedic; Western wheel with aspects</li>
<li>Dignity: own sign, exaltation, fall, detriment</li>
<li>A reading path: houses for life areas, then timing (transits; Vimshottari if you use Vedic)</li>
</ul>

<div class="panel">
<h3>Sidereal vs tropical in one sentence</h3>
<p>If your Western Sun is mid-Taurus, your Vedic Sun is usually still in Aries. That 24° gap is precession, not a bug. Pick one system per reading; mixing them in the same sentence is how people decide astrology is random.</p>
</div>

<h2>Birth chart future prediction</h2>
<p>The chart is the map; the future question is the map plus time. On the Vedic side that means dashas you can slide to 2027 and beyond. That conversion path — birth chart future prediction — lives on <a href="/future-prediction">future prediction by date of birth</a>, not a second copy of this page.</p>
<p>Compatibility (two charts) is <a href="/kundli-matching">kundli matching</a>. A sun-sign explainer is not this page; a <a href="/personalized-horoscope">personalized horoscope</a> is.</p>`,
    faq: [
      ['Is the birth chart calculator free?', 'Yes. No sign-up and no limit on charts.'],
      ['What is the difference between a birth chart and a natal chart?', 'None. Natal chart is the same map under the Latin name.'],
      ['Do I need my exact birth time?', 'For the rising sign and houses, yes. Without time you can still see the planets’ signs that day; you cannot honestly house them.'],
      ['Is this a Western or Vedic birth chart?', 'Both modes are in the app. This page explains the shared idea. Vedic vocabulary and dashas are on the kundli and birth-chart-reading guides.'],
    ],
  },

  {
    slug: 'personalized-horoscope',
    crumb: 'Personalized horoscope',
    linkLabel: 'Personalized horoscope',
    priority: '0.8',
    title: 'Personalized Horoscope & Online Astrology Reading from Your Chart',
    ogTitle: 'Personalized Horoscope & Astrology Reading',
    description:
      'Personalized horoscope and online astrology reading from your birth chart — rising sign, Moon, current periods — not a sun-sign column. Personal astrology reading, free and private in your browser.',
    h1: 'Your personalized horoscope, from your birth chart',
    lede:
      'A horoscope that does not use your birth time is a newspaper column. A personalized horoscope is an astrology reading of the chart you actually have — then of the period you are actually in.',
    ctaLabel: 'Get my personalized horoscope',
    body: `
<h2>Personalized horoscope vs daily horoscope</h2>
<p>Daily, weekly and monthly horoscopes are twelve texts. They can be well written. They cannot be about you. A personal horoscope, a personal astrology reading, an online astrology reading — those phrases only mean something if the page asked for date, time and place and then computed a chart.</p>
<table>
<tr><th>Search</th><th>Honest version</th></tr>
<tr><td>Personalized horoscope / personal horoscope</td><td>Your rising sign, Moon and current transits or dashas</td></tr>
<tr><td>Astrology reading online / online astrologer</td><td>A computed reading you can check, not a chat that flatters</td></tr>
<tr><td>Personal astrology reading / personalized astrology reading</td><td>The same chart, written as a sitting rather than a column</td></tr>
</table>

<h2>What this reading contains</h2>
<ul>
<li>Natal placements with the condition of each planet (dignity, combustion, retrogression on the Vedic side; dignity and aspects on the Western side)</li>
<li>House meanings for career, partnership, money and body</li>
<li>Current timing — gochara and Vimshottari if you use Vedic; transits on the Western wheel</li>
<li>The option to move the date and read a past or future year from the same chart</li>
</ul>

<div class="panel">
<h3>Online astrologer, without the theatre</h3>
<p>An “online astrologer” search is usually a request for a human sitting. This is software: Swiss Ephemeris, published rules, every claim tied to a placement you can see. That is stricter than a vague consultation, and weaker than a good one. Use it as the chart on the table, not as a substitute for judgement.</p>
</div>

<h2>Where to go next</h2>
<p>If you specifically want the Vedic column-vs-chart distinction, use <a href="/horoscope">horoscope</a>. For the wheel itself, <a href="/birth-chart">birth chart</a>. For dated life windows, <a href="/future-prediction">future prediction</a>. For computed Q&amp;A framing, <a href="/ai-astrology">AI astrology</a>.</p>`,
    faq: [
      ['What is a personalized horoscope?', 'A reading from your birth chart — time and place included — rather than a sun-sign paragraph shared with a twelfth of Earth.'],
      ['Is this an online astrologer?', 'It is an online astrology reading generated from your chart. It is not a live human consultation.'],
      ['Do I need my birth time?', 'For a personal reading that uses houses or rising sign, yes. Date alone is a sky that day, not a horoscope of you.'],
      ['Is it free?', 'Yes. The calculator runs locally. Nothing is uploaded.'],
    ],
  },

  {
    slug: 'ai-astrology',
    crumb: 'AI astrology',
    linkLabel: 'AI astrology',
    priority: '0.7',
    title: 'AI Astrology & AI Horoscope — Personalized Predictions from Your Chart',
    ogTitle: 'AI Astrology — Personalized Chart Predictions',
    description:
      'AI astrology and AI horoscope as a computed birth-chart reading: AI birth chart analysis and personalized future prediction from date, time and place — not a static sun-sign bot. Free and private.',
    h1: 'AI astrology: a computed reading, not a static horoscope',
    lede:
      '“AI astrologer” is a search for something that talks back. The useful version is still a birth chart: positions from the ephemeris, rules you can inspect, then language generated from that chart rather than from your sun sign.',
    ctaLabel: 'Generate my AI astrology reading',
    body: `
<h2>What AI astrology should mean</h2>
<p>Most “AI horoscope” products are a language model plus twelve signs. That is a chatbot with a costume. An AI birth chart reading has to do the astronomy first: Swiss Ephemeris in your browser, your lagna, your dashas, your transits — then any prose is grounded in those numbers.</p>
<table>
<tr><th>Phrase</th><th>What this page is</th></tr>
<tr><td>AI astrology / AI astrologer</td><td>Personalized predictions computed from your chart, with the placements shown</td></tr>
<tr><td>AI horoscope</td><td>Not a daily generated column. A chart-based current-period reading</td></tr>
<tr><td>AI birth chart / AI astrology reading</td><td>The same natal map the rest of the site uses, with interpretation attached</td></tr>
<tr><td>AI future prediction</td><td>Dasha + transit overlay you can move through years — see <a href="/future-prediction">future prediction</a></td></tr>
</table>

<h2>Why the chart still comes first</h2>
<p>Language models invent fluent specifics. Ephemerides do not. This site’s differentiator is the second thing: every career, marriage and life sentence is tied to a house, a period lord or a transit you can open. If a hosted chat assistant is not configured, the reading still stands — it is the engine, not the chat window.</p>

<div class="panel">
<h3>AI is the differentiator, not the keyword we are betting the domain on</h3>
<p>Search volume for “AI astrology” is newer and noisier than kundli, birth chart or “when will I get married.” This page exists so the query has a truthful home. The conversion path is still: birth data → chart → dated prediction.</p>
</div>

<h2>What you should not expect</h2>
<p>No guaranteed chatbot on the free hosted build, no fortune about a named person without their birth data, and no daily AI horoscope that pretends the Moon’s two-day sign change is your fate. For a human-shaped sitting in software form, start at <a href="/personalized-horoscope">personalized horoscope</a>.</p>`,
    faq: [
      ['What is an AI astrologer?', 'At best, software that computes your chart and writes from it. At worst, a chatbot that never calculated a planet. This site does the calculation locally first.'],
      ['Is an AI horoscope the same as a daily horoscope?', 'No. A daily AI horoscope is usually generated copy for a sign. This is a chart reading.'],
      ['Do you store my questions or birth data?', 'Birth data stays in the browser for the calculator. Do not paste secrets into any chat field on a shared machine.'],
      ['Why not make AI the homepage keyword?', 'Because people still search kundli, birth chart and specific life questions in much larger numbers. AI is how the reading is produced, not the only thing the site is.'],
    ],
  },

  {
    slug: 'astrology-2027',
    crumb: '2027 predictions',
    linkLabel: '2027 astrology predictions',
    priority: '0.8',
    title: 'Horoscope 2027 & Astrology Predictions 2027 — Your Year from Your Chart',
    ogTitle: 'Astrology Predictions 2027 from Your Birth Chart',
    description:
      'Horoscope 2027 and yearly astrology predictions 2027 from your birth chart: move the forecast to 2027 and read career, marriage and life windows for that year. Not a 12-sign 2027 column.',
    h1: 'Astrology predictions for 2027, from your birth chart',
    lede:
      'A “horoscope 2027” that ignores your birth time is a year-ahead magazine. This is the same personal engine as the rest of the site, with the date set to 2027 — dashas and transits for that year, not one paragraph per sign.',
    ctaLabel: 'Read my 2027 prediction',
    body: `
<h2>Yearly astrology without twelve recycled paragraphs</h2>
<p>Zodiac predictions 2027 and yearly astrology predictions 2027 are enormous search buckets. They are also where sites publish 12×4 essays and hope. You already have a better structure: the chart does not change; the sky and the dasha stack in 2027 do. Set the forecast date forward and read that year.</p>
<table>
<tr><th>Query</th><th>What to do here</th></tr>
<tr><td>Horoscope 2027 / astrology 2027</td><td>Cast your chart, then read 2027’s periods and transits</td></tr>
<tr><td>Yearly astrology predictions 2027</td><td>Career, marriage, love and life scores for windows that fall in 2027</td></tr>
<tr><td>Zodiac predictions 2027</td><td>Still your rising and Moon, not “Aries in 2027” as a nation</td></tr>
</table>

<h2>What actually changes in a future year</h2>
<ul>
<li><strong>Dasha levels</strong> — you may still be in the same mahadasha and a different antardasha or pratyantar. That is usually the year-scale plot twist.</li>
<li><strong>Slow transits</strong> — Saturn, Jupiter, Rahu/Ketu (and outer planets on the Western side) against your natal houses.</li>
<li><strong>Sade Sati and similar long arcs</strong> — they either include 2027 or they do not. That is a yes/no, not a mood.</li>
</ul>

<div class="panel">
<h3>2028, 2029, 2030</h3>
<p>The same action, different year. This URL is the 2027 door because that is what people will type next. There is no honest reason to clone the article for every year; the calculator is the page that scales.</p>
</div>

<h2>Specific 2027 questions</h2>
<p>Career in 2027 is still <a href="/career-prediction">career prediction</a> with the date moved. Marriage in 2027 is <a href="/marriage-prediction">marriage prediction</a>. The general life question is <a href="/future-prediction">future prediction</a>.</p>`,
    faq: [
      ['Can I see my 2027 horoscope from my birth chart?', 'Yes. The natal chart stays put; you read the 2027 dasha and transit overlay. That is a yearly prediction, not a daily 2027 horoscope.'],
      ['Do you publish zodiac predictions for 2027?', 'Not as twelve generic essays. The useful version is your chart in that year.'],
      ['What about 2028 and later?', 'Use the same calculator and change the date. This page targets the 2027 search; the engine is not limited to one year.'],
      ['Is this free?', 'Yes. No sign-up. Computation stays on your device.'],
    ],
  },
];

// ─── Sitemap ─────────────────────────────────────────────────────────────────

function sitemap() {
  const today = new Date().toISOString().slice(0, 10);
  const entry = (loc, priority, changefreq) =>
    `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n` +
    `    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[entry(`${ORIGIN}/`, '1.0', 'weekly'), ...PAGES.map(p => entry(`${ORIGIN}/${p.slug}`, p.priority ?? '0.8', 'monthly'))].join('\n')}
</urlset>
`;
}

// ─── Emit ────────────────────────────────────────────────────────────────────

await mkdir(OUT, { recursive: true });
for (const page of PAGES) {
  await writeFile(path.join(OUT, `${page.slug}.html`), render(page), 'utf8');
}
await writeFile(path.join(OUT, 'sitemap.xml'), sitemap(), 'utf8');

console.log(`seo-pages: wrote ${PAGES.length} landing pages + sitemap.xml to ${OUT}`);
for (const p of PAGES) console.log(`  /${p.slug}`);
