# Digital Signage — Fix & Improvement Plan
> Branch: Dustin-Branch-#1 (based on main after PR #1 merge)

---

## Completed

### Part 1 — Hero Layout ✅
- [x] Raised `--hero-height` from `21%` to `42%`
- [x] Removed absolute positioning from `.hero__widgets` and `.quote-card`
- [x] Restructured hero as flexbox column (`justify-content: space-between`)
- [x] Moved quote card between top-row and widgets so nothing overlaps
- [x] Strengthened hero bottom gradient for smooth fade into RSS section

### Part 2 — RSS Feeds ✅
- [x] Diagnosed broken proxies: `codetabs.com` 301, `allorigins.win` 19s timeout
- [x] Added `rss2json` as primary proxy (200 OK in ~0.8s)
- [x] Updated `fetchRssFeed()` in `app.js` to parse both JSON (rss2json) and XML

### Part 3 — Visual / UX Polish ✅
- [x] Clock hands now visible: hour `#e0e0e0`, minute `#ffffff`
- [x] Analog clock sized to `20cqw`, ring added via `box-shadow`
- [x] `HEADLINES` heading reduced from `clamp(2.4rem...)` to `2.2cqw`
- [x] Fixed placeholder display name → `Dr. Steve Beāty`
- [x] All small text sizes bumped to readable `cqw` values

### Universal Scaling Refactor ✅
- [x] All `vw` → `cqw` (container query width, relative to stage)
- [x] All `rem` and `px` sizes → `cqw` equivalents
- [x] `--panel-radius` and `--shadow` moved into `.signage-stage` scope
- [x] All `clamp()` removed — fixed-ratio kiosk doesn't need bounds
- [x] Stage width formula fixed: `0.76` → `calc(19/30)`
- [x] Stale `@media (max-width: 900px)` block removed

### Part 4 — Quality of Life ✅
- [x] Availability card detail added: "Back Monday at 9:00 AM"
- [x] MSU Denver red `#c8102e` applied: second hand, clock center dot, RSS icons, availability status, HEADLINES underline, quote card left border
- [x] Hero spacing tightened (42% height, gradient handles visual weight)
- [x] Committed to `Dustin-Branch-#1`
- [x] Pushed to remote

---

## Self-Screenshot Workflow
Claude can self-screenshot using headless Chromium to iterate without manual input:
```bash
chromium-browser --headless --screenshot=/tmp/signage-preview.png \
  --window-size=1080,1800 --hide-scrollbars --virtual-time-budget=8000 \
  http://127.0.0.1:8000/
```

---

## Still To Do (Future)
- [ ] Article titles truncate mid-word — tune `titleLines` value in `config.json`
- [ ] Add "In Office" green state to availability card (currently only handles "Out of Office")
- [ ] Replace placeholder quotes with professor/CS-department-relevant content
- [ ] Open PR from `Dustin-Branch-#1` into `main`
