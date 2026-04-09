# Digital Signage — AI Agent Guide

This document explains how this project was built and how a future AI agent should continue working on it.

---

## What This Project Is

A browser-based digital signage kiosk display designed for a professor's office (Dr. Steve Beaty, MSU Denver CS Department). It runs fullscreen on a Raspberry Pi at 1080×1800 resolution. Everything is static HTML/CSS/JS — no build step, no framework.

**Files that matter:**
- `index.html` — structure, rarely needs changing
- `styles.css` — where all the design work happens
- `app.js` — runtime logic (clock, weather, RSS, quotes, availability)
- `config.json` — all configurable content (name, quotes, RSS feeds, weather)
- `availability.json` — professor's in/out-of-office status (edit this to change status)

---

## How to Run It

```bash
# Start a local server (from the project root)
python3 -m http.server 8000

# Verify it's up
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8000/
```

---

## The Screenshot Iteration Loop

This is the most powerful way to improve the UI. The core idea: take a headless screenshot, look at it, make changes, repeat. Claude Code can do this autonomously without any human in the loop.

**The command:**
```bash
chromium-browser --headless --screenshot=/tmp/s.png \
  --window-size=1080,1800 --hide-scrollbars --virtual-time-budget=8000 \
  http://127.0.0.1:8000/ 2>/dev/null
```

Then read the screenshot:
```
Read("/tmp/s.png")
```

**The loop in practice:**
1. Take screenshot
2. Read it visually — what looks bad? what's working? what's boring?
3. Make CSS/HTML changes
4. Repeat

The `--virtual-time-budget=8000` flag gives the page 8 seconds of simulated time so async JS (clock, weather, RSS) has time to render before the screenshot is taken.

**Important:** The server must be running before screenshotting. If the screenshot shows a "site can't be reached" error, restart the server with `python3 -m http.server 8000 &`.

---

## Design System

All sizing uses `cqw` (container query width) relative to `.signage-stage`. Never use `px`, `rem`, or `vw` for layout dimensions — the stage is a fixed-ratio container and everything must scale against it.

```
1cqw = 1% of stage width = ~10.8px at native resolution
```

The stage is `19:30` aspect ratio (width:height), constrained to fit the viewport.

**Current color universe (as of last major redesign):**
- Background: deep indigo-black (`#09090f`)
- Primary accent: MSU Red (`#c8102e`)
- Secondary accent: Gold (`#f0a500`)
- Quote font: Playfair Display (serif, italic)
- UI font: Inter (sans-serif, weights 100–900)
- Stage has `filter: contrast(1.04) saturate(1.12)` for cinematic grade

---

## What Was Done (History)

This project went through **60+ AI-driven screenshot iterations** across three sessions:

**Session 1 (Dustin, manual):** Fixed broken RSS proxies, layout bugs, analog clock visibility, availability card detail, MSU red accent colors.

**Session 2 (Claude, planned 20-iteration loop):**
- Switched from Ubuntu to Inter font
- Full-width frosted quote card
- Cinematic hero gradient
- Clock tick marks
- Availability pill badge with glowing dot
- RSS cards: left red accent stripe, source pill badges
- Weather: big temperature number
- Headlines header: fading ruled lines
- Glassmorphism panels
- First story featured treatment
- Stage outer ring

**Session 3 (Claude, planned 20-iteration loop, aggressive):**
- Added MSU red top bar with school/dept name
- Quote card: frosted glass band, giant quotation mark
- Newspaper masthead HEADLINES bar
- Name moved left under logo
- Hero photo made vivid with minimal overlay
- Clock: double-ring gold bezel, gold tick marks
- RSS: borderless cards with dividing lines, lead story gradient

**Session 4 (Claude, free-form unplanned 20-iteration loop):**
- Completely abandoned red/black for gold + deep indigo universe
- Clock centered as hero centerpiece (not bottom-left)
- Floating frosted nameplate card (right side of hero)
- Playfair Display serif for quote text
- Giant Playfair quotation mark glyph (55% opacity gold)
- Ghost index numbers (1–4) watermarked in RSS card backgrounds
- Rounded stage corners with gold ring + red/purple glow
- `filter: contrast(1.04) saturate(1.12)` on whole stage
- Zebra-striped RSS rows with indigo tint
- Lead story: gradient sweep from gold-tinted left to transparent
- Page shell: tri-radial gradient (red upper-left, purple lower-right, deep indigo center)
- Serif/sans-serif typographic contrast system

---

## Tips for a Future Agent

**Be aggressive.** Timid changes produce timid results. The best iterations came from completely rewriting the color universe, repositioning major elements, or adding unexpected visual elements (ghost numbers, watch bezels, diagonal textures).

**The free-form loop works better than a plan.** When given a plan, the agent tends to make conservative targeted fixes. When told to just look and react, it makes bolder creative choices. Tell the agent: *"Look at the screenshot and make aggressive changes. No plan. Just react."*

**What to look for in screenshots:**
- Is the hero photo visible or buried under overlays? (Reduce gradient opacity)
- Does the composition feel balanced? (Center the clock, use the full width)
- Is there typographic contrast? (Mix weights: 100 vs 800, serif vs sans)
- Are the dark areas interesting or just flat black? (Add color gradients, radial glows)
- Does it feel premium or cheap? (Add bezels, rings, borders, inner glows)

**Things that worked well:**
- Serif (Playfair Display) for the pull-quote, sans (Inter) for everything else
- Ghost large numbers/text in RSS card backgrounds as decorative elements
- `filter: contrast() saturate()` on the whole stage for a camera-grade feel
- Centered clock as hero centerpiece rather than bottom-left widget
- Frosted glass nameplate floating over the hero photo

**Things that don't work:**
- `clamp()` — this is a fixed-ratio display, use fixed `cqw` values
- `px` or `rem` — always `cqw`
- Animations in screenshots — headless Chrome freezes at the virtual time budget snapshot

**The server dies between sessions.** Always check with `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8000/` before screenshotting and restart if needed.

---

## Current Branch

`Dustin-Branch-#1` — all work has been done here and merged/pushed to remote.
