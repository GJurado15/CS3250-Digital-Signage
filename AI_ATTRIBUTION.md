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
