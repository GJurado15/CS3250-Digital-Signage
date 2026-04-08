# Digital Signage — Fix & Improvement Plan
> Branch: Dustin-Branch-#1 (based on main after PR #1 merge)

---

## Completed

### Part 1 — Hero Layout ✅
- [x] Raised `--hero-height` from `21%` to `45%`
- [x] Removed absolute positioning from `.hero__widgets` and `.quote-card`
- [x] Restructured hero as flexbox column (`justify-content: space-between`)
- [x] Moved quote card between top-row and widgets so nothing overlaps
- [x] Clock, weather, name, availability, and quote no longer overlap

### Part 2 — RSS Feeds ✅
- [x] Diagnosed CORS proxies: `codetabs.com` returning 301, `allorigins.win` timing out after 19s
- [x] Added `rss2json` API as primary proxy (200 OK in ~0.8s)
- [x] Updated `fetchRssFeed()` in `app.js` to detect JSON (rss2json) vs XML responses
- [x] Headlines now load in under 1 second

### Part 3 — Visual / UX Polish ✅
- [x] Fixed clock hand colors — hour (`#e0e0e0`) and minute (`#ffffff`) now visible
- [x] Added ring to analog clock face (`box-shadow` outline)
- [x] Increased analog clock size to `20cqw`
- [x] Reduced oversized `HEADLINES` heading from `clamp(2.4rem...)` to `2.2cqw`
- [x] Fixed placeholder display name — now `Dr. Steve Beāty`
- [x] Bumped all small text sizes (quote, labels, meta, summary) to readable cqw values

### Universal Scaling Refactor ✅
- [x] Replaced all `vw` units with `cqw` (container query width relative to stage)
- [x] Replaced all `rem` and `px` sizing with `cqw` equivalents
- [x] Moved `--panel-radius` and `--shadow` into `.signage-stage` scope where `cqw` is valid
- [x] Removed all `clamp()` functions — fixed-ratio kiosk doesn't need min/max font bounds
- [x] Fixed stage width formula: `0.76` → `calc(19/30)` so stage never overflows viewport height
- [x] Removed stale `@media (max-width: 900px)` block with dead absolute-position overrides

---

## Self-Screenshot Workflow
Claude can now self-screenshot using headless Chromium and iterate without manual input:
```bash
chromium-browser --headless --screenshot=/tmp/signage-preview.png \
  --window-size=600,1000 --hide-scrollbars --virtual-time-budget=8000 \
  http://127.0.0.1:8000/
```
This captures the live page with JS executed and RSS loaded, then reads it back as an image to assess layout and typography before sharing results.

---

## Remaining / In Progress

### Part 4 — Quality of Life
- [ ] Hero has a lot of empty sky between quote and clock row — consider adjusting spacing
- [ ] Availability card — currently "Out of Office" with no detail; update or add return date
- [ ] Consider adding an MSU Denver accent color (red `#c8102e`) to break up the all-gray palette
- [ ] Article titles still truncate with `...` — review `summaryLength` and `titleLines` in config
- [ ] Commit current working state to `Dustin-Branch-#1`
- [ ] Push branch and open PR into main
