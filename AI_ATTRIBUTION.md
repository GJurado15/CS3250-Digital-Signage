# AI Attribution

High-level prompting and implementation assistance were used in building and refining this digital signage project.

AI-assisted work in the current version includes:
- layout, typography, and visual styling refinement
- hero/background, clock, weather, availability, quote, and RSS presentation updates
- RSS feed parsing, cleanup, proxy fallback handling, and per-article QR code support
- local quote list and daily rotation support
- availability / out-of-office JSON workflow
- Raspberry Pi kiosk workflow setup
- project cleanup, deployment-oriented file cleanup, and documentation updates

Human review and project-specific decisions are still required before deployment.

AI-assisted work in the current version also includes:
- ESLint, Jest, JSDoc, and GitHub Actions CI/CD setup
- Extraction of pure utility functions into a testable `utils.js` module
- 40 Jest unit tests with 100% statement/function coverage and enforced thresholds

---

## Session — April 10, 2026

AI-assisted work in this session includes:
- Fetched remote branches after identifying that `git branch -a` requires a prior `git fetch` to show remote refs
- Explored and documented the structure and flow of `Guillermo-Branch-#1`
- Installed Chromium via `dnf` on Fedora
- Launched the kiosk via `start-kiosk.sh`
- Created `Dustin-Branch-#1` from `Guillermo-Branch-#1` and pushed to remote
- Created a degraded "presentation" version of the UI (`fertilizer` branch): removed background image, logo, quote card, RSS/headlines section, switched to plain Arial, flat neon 80s color scheme
- Restored `Dustin-Branch-#1` to its original state after branching off the degraded version
- Performed deep code review of the `main` branch as the new baseline for `Dustin-Branch-#1`
- Rewrote `styles.css` entirely: replaced all `px`/`rem` units with `cqw`, fixed stage aspect ratio formula to exact `19/30`, restructured hero section from absolute positioning to flexbox column layout, added MSU Denver red (`#c8102e`) accent color throughout
- Fixed RSS pipeline: identified broken CORS proxies, switched primary to `rss2json.com`, added JSON-format parser path alongside existing XML parser
- Implemented autonomous screenshot workflow using headless Chromium with `--virtual-time-budget=20000` for iterative visual development
- Fixed word-boundary truncation in `clampLines()` and `summarize()` in `app.js`
- Added green/red CSS class toggling for availability states (in office vs. out of office)
- Merged all 33 quotes (original team quotes + new attributed CS quotes) in `config.json`
- Opened PR #2 to `main` with full summary and test plan

---

## Session — April 10, 2026 (continued)

AI-assisted work in this session includes:
- Verified all prior TODO items were already completed (clampLines word-boundary fix, availability CSS states, 33 quotes, PR #2 merged)
- Performed two autonomous 20-iteration screenshot-driven design loops with no predetermined plan
- First loop: progressive refinement of existing red/black/white aesthetic (color grading, typography, layout polish)
- Second loop: complete design universe shift to gold/indigo theme — new color palette (#09090f deep indigo + #f0a500 gold + #c8102e MSU red), repositioned hero elements, added glassmorphism nameplate card, vintage watch-style analog clock bezel, Playfair Display serif quotes with giant quotation mark watermark, ghost index numbers on RSS items, diagonal stripe texture on RSS section
- Changed `displayName` from "Dr. Steve Beāty" to "Dr. Steve Beaty" in both `config.json` and as rendered
- Rewrote `TODO.md` entirely to document the screenshot iteration workflow, design system (cqw units, 19:30 aspect ratio, color universe), full session history, and tips for future AI agents
- Updated `CLAUDE.md` to reflect current design system (vintage watch / sector dial theme, color palette, RSS pipeline details, engagement scorer, OG image fallback, planned watch mode rotation)
- Committed all changes with message: "Gold/indigo design overhaul + rewrite TODO.md for future agents"

---

## Session — April 10, 2026 (continued)

AI-assisted work in this session includes:
- Replaced Google News RSS keyword search feeds with four curated academic/technical sources: Ars Technica, Hacker News (`/best`), Quanta Magazine (CS), MIT News (CS)
- Evaluated and removed feeds for editorial/political risk: MIT Technology Review (political content), IEEE Spectrum (dry/irrelevant headlines), The Verge (not academic enough)
- Wrote `server.py` — a custom HTTP server replacing `python3 -m http.server` that adds a `/proxy?url=` CORS proxy endpoint, eliminating dependency on third-party proxy services
- Implemented OG image scraping: for articles without feed images, fetches the article page through the proxy and extracts `og:image` / `twitter:image` meta tags, giving all four cards a photo
- Added `extractFeedImage()` to parse `media:content`, `media:thumbnail`, `enclosure`, and embedded `<img>` tags in content body HTML (for Atom feeds)
- Implemented `scoreHeadline()` engagement scorer: lead slot awarded to highest-scoring headline across top-3 candidates per feed, scoring question marks, editorial framing, and power words; penalizing dry/institutional patterns
- Rewrote RSS card layout from 2-column to 3-column grid: image column | text body | QR column — image and QR coexist in separate columns rather than stacking
- Added `rss-item--has-image` JS class with adaptive CSS grid widths (image-less items collapse to 2-column layout via `display:none`)
- Gave lead story 2.2× card height vs. secondary items; secondary items now show a 1-line summary
- Fixed HN description metadata stripping (Points/Comments/Article URL labels and orphaned numbers cleaned from feed text)
- Fixed HTML entity decoding using a throwaway DOM element in `normalizeFeedText()`
- Switched date display from absolute ("Apr 10") to relative ("2h ago") in brass color
- Switched title truncation from JS character-count (`clampLines`) to CSS `-webkit-line-clamp` for accurate line-based clamping
- Rewrote `README.md` for human readers (setup, config, Pi deployment)
- Replaced `TODO.md` with `CLAUDE.md` — comprehensive AI agent guide covering screenshot loop, design system, feed history, scorer, layout spec, OG image pipeline, planned watch modes, and known pitfalls
- Committed and pushed all changes to `Dustin-Branch-#1`

---

## Session — April 10, 2026 (tooling: ESLint, Jest, JSDoc, CI/CD)

AI-assisted work in this session includes:
- Explained ESLint, Jest, JSDoc, and CI/CD as concept groups with industry context
- Extracted 11 pure utility functions (no DOM/network) from `app.js` into a new `utils.js` ES module, and updated `app.js` to import them — enabling unit testing without a browser
- Added JSDoc `@param` / `@returns` comments to all 11 exported functions in `utils.js`
- Initialized `package.json` via `npm init` and installed dev dependencies: `eslint`, `@eslint/js`, `globals`, `jest`, `babel-jest`, `@babel/core`, `@babel/preset-env`, `jsdoc`
- Created `eslint.config.js` (ESLint 9 flat config) with three separate environments: browser globals for `app.js`/`utils.js`, Node CommonJS for `*.config.js`, and Jest globals for `*.test.js`
- Created `babel.config.js` so Jest can transform ES module `import`/`export` syntax to CommonJS at test time (no effect on the browser)
- Wrote `utils.test.js` with 40 Jest tests covering all 11 utility functions — including edge cases (null input, invalid dates, unknown weather codes, malformed URLs)
- Added Jest coverage thresholds to `package.json` (≥90% statements/functions/lines, ≥85% branches); achieved 100% statement/function coverage
- Created `.github/workflows/ci.yml` — GitHub Actions pipeline that runs `npm run lint` and `npm test` on every push and pull request
- Added `.gitignore` excluding `node_modules/` and `docs/`
- Updated `README.md` with a Development section (commands, CI description, test scope)
- Updated `CLAUDE.md` file map and added a Tooling section documenting all new files and the `utils.js` rationale

---

## Session — April 10, 2026 (vintage watch Sector Dial)

AI-assisted work in this session includes:
- Reviewed TODO.md for context; proposed and discussed vintage watch as the visual theme direction
- Planned a 4-mode rotating watch theme system (Sector Dial, Dress Watch, Diver/Tool, Flieger/Pilot) and added the objective to TODO.md
- Executed ~11 iterations of screenshot-driven development to build Mode 1 (Sector Dial)
- Rewrote `styles.css` to implement cream/charcoal/brass Sector Dial aesthetic: two-tone dial, dark outer ring, brass tick marks, blued steel hands, red seconds hand, crystal dome highlight, sunburst texture in cream field
- Added 60-tick generation (replacing 12) in `app.js` and numeral ring to `index.html`
- Added watchmaker-style inscriptions: "COMPUTER SCIENCE" center field, signed-dial underline on nameplate, "THOUGHT OF THE DAY" complication label on quote card
- Redesigned weather card as a circular subdial
- Refined hero layout to make the clock the true visual centerpiece
- Committed as: "Vintage watch Mode 1: Sector Dial — cream/charcoal/brass theme"
- Opened a live Chromium window during iteration for real-time F5 preview

---

## Session - April 13, 2026

AI-assisted work in this session includes:
- Fixed analog clock hand alignment so the seconds hand rotates from the true visual center of the dial
- Updated clock rotation logic in `app.js` to drive hand angles through the `--hand-angle` CSS custom property instead of replacing the full `transform`
- Refined clock hand positioning in `styles.css` by switching from negative margin offsets to centered `top`/`left` placement with translated rotation
- Darkened decorative watch-theme hero elements for better legibility: the background "COMPUTER SCIENCE" dial text, the top-bar "Department of Computer Science" line, the professor subtitle line, and the hero logo treatment
- Set the professor subtitle color to `#3f3c35` as a final targeted styling adjustment

---

## Session — April 20, 2026 (watch theme system)

AI-assisted work in this session includes:
- Designed and implemented a 6-theme daily-cycling watch dial system; theme is selected by day-of-year index using the existing `getQuoteDayIndex()` function, ensuring stable daily rotation
- Added `?theme=<name>` query parameter for force-previewing any theme during development
- Built 6 complete CSS watch archetypes, each scoped to `.analog-clock.watch--<name>` to avoid any layout side-effects:
  - **Sector** — original cream/brass sector dial; added Omega Railmaster-style hairline crosshair dividing the dial into quadrants
  - **Diver** — Submariner-inspired: matte black dial, luminous round pips at all hours, inverted-triangle marker at 12, vertical batons at 3/6/9, lume-filled silver hands, red seconds, brushed steel bezel ring with minute graduation ticks and numbers at 10/20/30/40/50
  - **Flieger** — B-Uhr pilot watch: pure black dial, all 12 large white Arabic numerals, triangle-at-12 marker, clean sword hands
  - **Dress** — minimal silver/white dial, italic Playfair Display Roman numerals (I–XII) via CSS `::before` content on numeral spans using `nth-child` selectors, hair-thin dauphine hands, ultra-restrained
  - **Field** — Hamilton Khaki-inspired: warm khaki/olive dial (distinct palette from flieger), cardinals-only numerals (12/3/6/9), thick railroad baton markers, broad arrow hands
  - **Chrono** — Speedmaster panda dial: cream center + dark outer tachymeter ring; three recessed subdials at 3/6/9 rendered entirely as layered CSS background radial-gradients; subdial hands and center pivot pins drawn as background linear-gradients at exact subdial coordinates; tick-mark dots around each subdial perimeter
- Replaced all `"MSU · DENVER"` dial text across every theme with `"AUDEMARS BEATY"` — a pun on Audemars Piguet using the professor's surname; repositioned from bottom-of-dial to top-of-dial (correct watchmaking convention, just below 12 o'clock)
- Added per-theme color override for `::after` text on cream dials (sector/dress) so the brand name is legible against the light background
- Saved reference screenshots for all 6 themes in the project root (`signage-<theme>.png`)

---

## Session — April 20, 2026 (watch dial polish)

AI-assisted work in this session includes:
- Executed 5 screenshot-loop polish passes across all 6 watch dial archetypes using headless Chromium at 1080×1800
- Enlarged clock from 26cqw to 28cqw for greater visual presence in the hero
- **Sector**: Strengthened Railmaster crosshair (0.09cqw, 0.22 opacity), added thin gold ring at sector boundary, richer guilloché sunburst, hands recolored to deep cobalt/indigo blued-steel
- **Diver**: Complete lume overhaul — multi-layer `box-shadow` + `filter: drop-shadow()` stack for tritium-style glow on all pips; 12 o'clock triangle enlarged (190% width) with glow; hour/minute hands rebuilt with a center lume-fill stripe; larger brushed-steel center jewel
- **Flieger**: Sword hands rebuilt with lume center stripe and box-shadow; red seconds hand added; center jewel enlarged with polished radial gradient
- **Dress**: Roman numerals made substantially more readable (opacity 0.75→0.92, cardinals 0.85→0.92, font-weight 300→400/600); dial lifted to richer champagne gradient; dauphine hands given proper polished 5-stop gradient and new red seconds
- **Field**: Complete palette lift from near-black (`#3e3a28`) to warm khaki/olive (`#7a7050`) — now unmistakably distinct from flieger; broad arrow hands improved with 5-stop gradient; cardinal numerals brightened; inner ring border made visible
- **Chrono**: Subdials grew from barely-visible 7.5% radius to 13% with a recessed cream fill, outer border ring, 8 tick dots per subdial, and visible hand lines pointing to 12-position; red-ring center jewel (Speedmaster-style); polished dark main hands with 5-stop gradient
- Crystal dome highlight on `.analog-clock__face` upgraded with a rim shimmer ring for sapphire crystal depth
- Global center jewel (sector default) enlarged to 7.5% with richer 4-stop brass gradient and stronger shadow stack
- Created `watchcreation.md` — a technical reference covering DOM structure, CSS techniques (lume pips, Roman numerals, subdials, clip-path hands), visual differentiation rules, and known pitfalls
- Saved polished reference screenshots as `watch-polish-<theme>.png` for all 6 themes

---

## Session — April 21, 2026 (layout redesign + polish)

AI-assisted work in this session includes:
- Committed and pushed 2 previously unpushed watch-theme commits; opened PR #6 for the watch dial system
- Removed the in/out-of-office availability indicator from the nameplate and all supporting JS (`loadAvailability`, `renderAvailability`, related DOM refs, `availabilityUrl` constant)
- Increased hero section row from 38% to 44% of stage height to fix the clock face clipping into the quote card
- Redesigned `.hero__widgets` from a centered flex row to a three-column CSS grid (`1fr auto 1fr`): mock office hours panel on the left, clock centered, weather subdial on the right
- Added static office hours panel (Mon/Wed/Fri schedule + room CN 204) styled as a watch complication card matching the dial aesthetic
- Removed the `.hero::after` "COMPUTER SCIENCE" watermark pseudo-element (redundant with the top bar)
- Fixed vertical alignment of side panels: switched grid to `align-items: start` with `margin-top: 8cqw` on both side panels, placing their visual centers at 14cqw — the same as the 28cqw clock face center
- Iterated on horizontal spacing: landed on `justify-self: center` for both panels, placing each panel's center equidistant from the clock center and its screen edge
- Restructured weather card from a flex stack to absolute positioning within the circle: icon anchored at the top, label hidden, temp+desc group at `translate(-50%, -50%)` from the geometric center so the temperature number is the true visual anchor
- Refreshed all 6 canonical `signage-<theme>.png` screenshots after each layout change

---

## Session — April 21, 2026 (watch dial polish + bug fixes)

AI-assisted work in this session includes:
- Ran 5 screenshot-loop polish passes across all 6 watch dial archetypes, using Apple HIG, Braun/Dieter Rams, Rolex/Omega, and Swiss typography as UX inspiration
- **Sector**: Upgraded `::before` to a double-ring brass chapter ring; richer guilloché sunburst; deeper cobalt blued-steel hands
- **Diver**: Stepped ceramic bezel ring; more intense multi-layer lume glows on all pips; lume-stripe hands centered (gradient peak at exactly `50%`)
- **Flieger**: Larger bolder Arabic numerals (2.5cqw, weight 900); replaced sword hands with distinct pentagonal spearhead hands (matte grey-silver, no lume) to differentiate from diver
- **Dress**: Silk sunray shimmer highlight on dial; Roman numerals enlarged (2.0cqw, weight 700); dauphine hands corrected to point outward
- **Field**: Broad arrow hands corrected to point outward (tip at `50% 0%` in clip-path); warmer khaki dial palette
- **Chrono**: Reverted overlarge subdials (18% → 13% farthest-corner radius); hid all 12 Arabic numerals to eliminate visual noise over tachymeter ring and subdial tick dots
- Fixed z-index stacking bug: `::before` chapter ring was z-index 6, hands were z-index 5 — hands were occluded near dial edges; fixed by raising hands to z-index 8
- Fixed clip-path orientation on field and dress hands: polygons had the arrowhead/diamond tip at `100%` (pivot end) instead of `0%` (outermost tip); corrected by building all pointed shapes with tip at `50% 0%`
- Fixed diver lume stripe off-center: lume `linear-gradient` on hour/minute hands previously peaked at 40%; corrected to peak symmetrically at `50%`
- Confirmed lead story grid row uses `2.2fr` (not `repeat(4, 1fr)`) so the lead card gets 2.2× the height of secondary items
- Regenerated all 6 canonical `signage-<theme>.png` screenshots at end of session
- Updated `watchcreation.md`: flieger archetype description, spearhead hand technique, corrected broad-arrow and dauphine clip-path examples, z-index stacking table, clip-path orientation rule, chrono numerals pitfall
- Updated `README.md`: flieger watch themes table row
- Updated `CLAUDE.md`: z-index stacking and clip-path orientation in "Things That Work Well / Pitfalls"

---

## Session — April 28, 2026 (Pi deployment + codebase sanitization)

AI-assisted work in this session includes:
- Diagnosed Raspberry Pi deployment failures: identified SSL handshake errors caused by wrong system clock, missing fontconfig, and `chromium-browser` binary being renamed to `chromium` in Pi OS Bullseye+
- Created `setup.sh` — one-time Pi setup script: installs chromium/fontconfig/ca-certificates, syncs NTP via `timedatectl`, rebuilds font cache, wires `start-kiosk.sh` into LXDE autostart, reboots with a 5-second cancellable countdown
- Improved `start-kiosk.sh`: replaced `sleep 2` race condition with a `curl` poll loop, fixed `chromium-browser` → `chromium`, removed stale `/index.html` suffix from URL
- Sanitized codebase: removed unused `.availability-card` CSS feature (~50 lines), dead `.hero__identity` and `.rss-item__icon` selectors, orphaned `perFeed` and `titleLines` keys from `config.json`
- Converted 4 stray `border-radius: px` values to `cqw` to match project unit standard
- Fixed `npm run docs` (jsdoc): `sourceName?: string` TypeScript optional syntax is not valid in JSDoc type expressions — removed the `?`
- Corrected `CLAUDE.md`: `chromium-browser` → `chromium` in screenshot loop commands; Lead Story Selection section updated to reflect that `scoreHeadline()` exists in `utils.js` but is not currently wired into the feed pipeline; removed stale bullets from "Things That Work Well"
- Updated `README.md`: Pi Setup section replaced with `setup.sh` one-liner workflow; corrected headline scoring claim to reflect actual timestamp-sort behavior
