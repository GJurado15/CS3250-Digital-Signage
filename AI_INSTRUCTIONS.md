# AI_INSTRUCTIONS.md — AI Agent Guide

This document is written for an AI assistant picking up this project cold. It contains everything needed to understand, run, and improve the display without re-deriving context from the code.

---

## What This Is

A browser-based digital signage kiosk for Dr. Steve Beaty's office at MSU Denver's CS Department. Runs fullscreen on a Raspberry Pi at **1080×1800 (portrait)**. Static HTML/CSS/JS — no build step, no bundler, no framework. Everything is in five files.

**Key constraint:** This runs in a school. No political content, no editorial opinion that could embarrass the CS department. Sources must be academically credible.

---

## How to Run

```bash
# Always use server.py — NOT python3 -m http.server
# server.py adds a /proxy?url= endpoint needed for RSS fetching
python3 server.py

# Verify it's up
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8000/
```

---

## The Screenshot Loop

This is the primary development workflow. Take a screenshot, look at it, make changes, repeat. Claude Code can run this autonomously.

```bash
chromium-browser --headless --screenshot=/tmp/s.png \
  --window-size=1080,1800 --hide-scrollbars --virtual-time-budget=20000 \
  http://127.0.0.1:8000/ 2>/dev/null
```

Then read it:
```
Read("/tmp/s.png")
```

**Important details:**
- `--virtual-time-budget=20000` gives 20 seconds of simulated JS execution time. This is necessary because the app fetches OG images for articles that don't have feed images — this takes real network time. 8000ms is too short now; use 20000.
- The server must be running before screenshotting. Check with curl first.
- Animations are frozen at the virtual time snapshot — don't design around them.
- After CSS/JS changes, the screenshot reflects them immediately (no cache issue in headless). The *browser* caches aggressively — tell the user to use Ctrl+Shift+R or clear cache in DevTools.

---

## File Map

| File | Role |
|------|------|
| `index.html` | DOM structure and `<template>` for RSS cards. Rarely changes. |
| `styles.css` | All visual design. This is where most work happens. |
| `app.js` | Runtime logic: clock, weather, RSS pipeline, QR codes, quotes, availability. Imports from `utils.js`. |
| `utils.js` | Pure utility functions (no DOM, no network). Imported by `app.js` and tested by Jest. |
| `config.json` | Runtime configuration: name, quotes, feeds, weather coords, proxy chain. |
| `availability.json` | Professor's in/out status. Edited independently by the client. |
| `server.py` | Static file server + `/proxy?url=` CORS proxy endpoint. Replaces `python3 -m http.server`. |

## Tooling

| File | Role |
|------|------|
| `utils.test.js` | Jest unit tests for all 11 functions in `utils.js`. Run with `npm test`. |
| `eslint.config.js` | ESLint 9 flat config. Three environments: browser (`app.js`, `utils.js`), Node (`*.config.js`), Jest (`*.test.js`). |
| `babel.config.js` | Tells Jest to transform ES module `import`/`export` to CommonJS. No effect on the browser. |
| `package.json` | npm scripts (`lint`, `test`, `docs`) and Jest coverage thresholds (90% minimum). |
| `.github/workflows/ci.yml` | GitHub Actions CI: runs `npm run lint` then `npm test` on every push and PR. |
| `.gitignore` | Excludes `node_modules/` and generated `docs/` from git. |

### Running the tools

```bash
npm install       # one-time setup
npm run lint      # ESLint — checks all *.js files
npm test          # Jest — 40 tests, enforces ≥90% coverage
npm run docs      # jsdoc — generates HTML docs in docs/
```

### Why `utils.js` exists

`app.js` is a browser module loaded with `type="module"`. Jest runs in Node.js and cannot access the DOM. To make pure logic testable, 11 functions with no DOM or network dependencies were extracted into `utils.js` with ES module exports. `app.js` imports them. Jest imports them via Babel. The browser loads both natively.

---

## Design System

**Unit:** Always `cqw` (container query width relative to `.signage-stage`). Never `px`, `rem`, or `vw`.
```
1cqw ≈ 10.8px at native 1080px width
```

**Never use `clamp()`** — this is a fixed-ratio display, clamp adds unnecessary complexity.

**Aspect ratio:** `19:30` (width:height). The stage is `width: min(100vw, calc(100vh * 19 / 30))`.

**Layout grid** (`.signage-stage`):
```css
grid-template-rows: 4.5% 38% 1fr;
/* top-bar | hero (clock/quote/weather) | rss-section (headlines) */
```

**Color palette:**
```
--brass:  #c8a848  (gold accent, borders, labels)
--cream:  #f0e8d0  (primary text on dark)
--case:   #1a1814  (deepest dark background)

Hero section:  cream/parchment (#f2ead8 background)
RSS section:   dark brown-black (#211d12 → #151210)
Top bar:       dark charcoal (#2e2a1e)
```

**Filter on stage:** `filter: contrast(1.03) saturate(0.92)` — subtle cinematic grade, applied to whole stage.

**Fonts:**
- UI: Inter (sans-serif, weights 100–900)
- Quotes: Playfair Display (serif, italic)

**Visual theme:** Vintage watch — Mode 1 (Sector Dial, 1930s American two-tone). See planned modes below.

---

## RSS Pipeline

### Feeds (current)

```json
[
  { "feedUrl": "https://feeds.arstechnica.com/arstechnica/technology-lab", "sourceName": "Ars Technica" },
  { "feedUrl": "https://hnrss.org/best",                                   "sourceName": "Hacker News" },
  { "feedUrl": "https://www.quantamagazine.org/computer-science/feed/",    "sourceName": "Quanta Magazine" },
  { "feedUrl": "https://news.mit.edu/topic/mitcomputers-rss.xml",          "sourceName": "MIT News" }
]
```

**Why these four:**
- **Ars Technica** — Deep tech journalism, strong images in `media:content` tags
- **Hacker News `/best`** — Community-curated; the upvote algorithm is a built-in engagement filter. `/best` vs `/frontpage` = less noise.
- **Quanta (CS)** — CS theory and research, academically credible, occasionally writes engaging "why does X work?" pieces
- **MIT News (CS)** — Direct from MIT's CS department. Dry headlines but zero political/editorial risk. Good safety anchor.

**Feeds that were tried and removed:**
- Google News RSS search queries — too noisy, press release heavy
- MIT Technology Review — published political/editorial content, inappropriate for school display
- IEEE Spectrum — consistently dry headlines ("Remembering Gary Gaynor"), pulled last
- The Verge — engaging headlines and images but not academic enough for this context

### Proxy Chain

```json
"proxies": [
  "http://127.0.0.1:8000/proxy?url={url}",      ← local server, always try first
  "https://api.rss2json.com/v1/api.json?rss_url={url}",
  "https://api.codetabs.com/v1/proxy?quest={url}",
  "https://api.allorigins.win/raw?url={url}"
]
```

The local proxy (`server.py`) handles CORS server-side. The public proxies are fallbacks for when the Pi server isn't running during development. `rss2json.com` returns JSON with `thumbnail` fields; the others return raw XML.

### Feed Parsing

`fetchRssFeed()` in `app.js` tries JSON first (rss2json format), then XML via `DOMParser`. Image extraction (`extractFeedImage()`) checks:
1. `media:content` with `medium="image"`
2. `media:thumbnail`
3. `enclosure` with `type^="image/"`
4. First `<img src>` found in content body HTML (catches Atom feeds like The Verge that embed images in `<content>`)

### OG Image Fallback

For items without a feed image, `fetchOgImage()` fetches the article page through the proxy and extracts `og:image` or `twitter:image` meta tags. This runs in parallel for all image-less items before rendering. This is why `--virtual-time-budget=20000` is needed.

### Lead Story Selection (Engagement Scorer)

Instead of pure recency, the lead slot is awarded to the highest-scoring headline. `scoreHeadline()` in `app.js`:

- **+5** — title contains `?`
- **+3** — title starts with why/how/what/when/where/can/should/will/is/are/does/do
- **+1 each** — power words: breakthrough, first, never, impossible, finally, actually, secret, revealed, surprising, unexpected, mystery, wrong, discover, real, inside, fear, love, hate, crisis, end of, rise of, death of, future, revolution, warning, new, biggest, worst, best, change
- **-5 each** — boring signals: remembering, quarterly, earnings, devoted, volunteer, obituary, in memoriam, annual report, press release, advisory, q1/q2/q3/q4

The scorer looks at the top 3 most-recent items from each feed (12 candidates total). The winner gets the lead slot. The 3 remaining slots each get the most-recent item from their respective feed.

### HN Description Cleaning

HN via `hnrss.org` wraps descriptions in: `Article URL: <url> Comments URL: <url> Points: N Comments: N`. `normalizeFeedText()` strips all of this plus bare URLs. If the result is under 30 chars, it's discarded as metadata noise.

---

## RSS Card Layout

Each card is a 3-column CSS grid:

```
[ image col ] [ text body ] [ QR col ]
```

- Items **with** a feed or OG image: `grid-template-columns: 17cqw minmax(0,1fr) 12cqw` (class `rss-item--has-image`)
- Items **without** an image: `grid-template-columns: minmax(0,1fr) 12cqw` (image col hidden via `display:none`)
- Lead story (`:first-child`) gets slightly wider columns

The image fills its column edge-to-edge via `object-fit: cover; width: 100%; height: 100%`.

**List grid:** `grid-template-rows: 2.2fr 1fr 1fr 1fr` — lead story gets 2.2× height of secondary items.

**QR codes** are generated via `buildQrCodeUrl()` using an external QR API. Always present when there's a link; the image replaces nothing, they coexist in separate columns.

---

## Clock

SVG analog clock with:
- Sector dial aesthetic: two-tone cream/dark face
- Brass tick marks (generated by `buildClockTicks()` in `app.js`)
- Hour, minute, second hands updated every second via `setInterval`
- Digital time and date displayed below

---

## Weather

Open-Meteo API — free, no API key. Coordinates set in `config.json`. Refreshes on load.

---

## Planned Vintage Watch Modes

The display is designed to eventually rotate between 4 visual themes on a timer. Mode 1 is built. The switcher is not yet implemented.

1. **Sector Dial** ✅ (current) — 1930s American two-tone, cream/charcoal/brass
2. **Dress Watch** — Patek-inspired, cream/ivory, thin gold indices, Playfair Display, extreme whitespace
3. **Diver/Tool Watch** — Submariner-inspired, matte black, aged lume plots, high contrast
4. **Flieger/Pilot** — WWI aviation, dark grey, oversized Arabic numerals, triangle at 12, ultra-legible

To implement: a JS-driven `data-theme` attribute on `.signage-stage`, CSS custom properties scoped per theme, a `setInterval` rotating between them.

---

## Things That Work Well

- CSS `-webkit-line-clamp` for title truncation — more accurate than JS character counting
- OG image scraping via local proxy — gets images for feeds that don't embed them
- `scoreHeadline()` for lead selection — surfaces engaging content without being random
- `normalizeFeedText()` using a throwaway DOM element for entity decoding
- `cqw` units throughout — scales perfectly to any viewport
- `filter: contrast(1.03) saturate(0.92)` on the whole stage — subtle cinematic grade
- Per-feed top-3 candidate pool for lead scoring (not just top-1)

## Things That Don't Work / Pitfalls

- `clamp()` — don't use, this is a fixed-ratio display
- `px` or `rem` — always `cqw`
- Short `--virtual-time-budget` — needs 20000ms now that OG image fetching runs
- `python3 -m http.server` — use `server.py` instead (no CORS proxy)
- Animations in screenshots — headless Chrome freezes at snapshot time
- The browser caches JS/CSS aggressively — tell users Ctrl+Shift+R or disable cache in DevTools
- `0` as a CSS grid track size — causes layout artifacts; use `display:none` on the element instead
