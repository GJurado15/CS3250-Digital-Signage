# Watch Dial Creation Guide

## What This Is

The analog clock cycles through 6 CSS-only watch dial archetypes, one per day. Each is scoped to `.analog-clock.watch--<name>` so they override the clock's visuals with zero layout side effects. The active theme is set in `applyWatchTheme()` in `app.js`. Force any theme during development with `?theme=<name>` in the URL.

---

## The 6 Archetypes

| Class | Archetype | Defining traits |
|---|---|---|
| `watch--sector` | Sector / two-tone | Cream inner field + dark outer ring, hairline crosshair, blued steel hands, brass ticks |
| `watch--diver` | Submariner diver | All-black dial, glowing lume pips, inverted-triangle at 12, bezel ring, lume-stripe hands |
| `watch--flieger` | B-Uhr pilot | Matte black, all 12 large Arabic numerals, white triangle at 12, spearhead hands (matte grey-silver, no lume) |
| `watch--dress` | Dress watch | Silver/champagne dial, italic Playfair Display Roman numerals via `::before`, dauphine hands |
| `watch--field` | Field / military | Warm khaki/olive dial (distinctly lighter than flieger), cardinals only, broad arrow hands |
| `watch--chrono` | Panda chronograph | Cream center + dark tachymeter ring, three subdials at 3/6/9 built entirely in CSS gradients |

---

## DOM Structure

```
.analog-clock.watch--<name>       ← the circle; theme class goes here
  .analog-clock__face             ← crystal dome highlight (z-index 20, pointer-events none)
  .analog-clock__ticks            ← 60 spans rotated by --tick-angle, each has ::before tick mark
  .analog-clock__numerals         ← 12 spans positioned by CSS trig (--h: 1–12)
  .analog-clock__hand--hour       ← rotates via --hand-angle CSS custom property
  .analog-clock__hand--minute
  .analog-clock__hand--second
  .analog-clock__center           ← center jewel cap, z-index 10
  ::before                        ← inner bezel ring (position absolute, inset %, border-radius 50%)
  ::after                         ← brand text "AUDEMARS BEATY" at top: 28%
```

All children use `position: absolute; inset: 0` unless noted. Hands use `top: 50%; left: 50%; transform-origin: bottom center; transform: translate(-50%, -100%) rotate(var(--hand-angle, 0deg))`.

**Z-index stacking order (do not change these):**

| Layer | z-index |
|---|---|
| `::before` inner bezel ring | 6 |
| `.analog-clock__hand` (all hands) | 8 |
| `.analog-clock__center` center jewel | 10 |
| `.analog-clock__face` crystal dome | 20 |

Hands must be z-index 8 (above the ring at 6) or the chapter ring will occlude the hands near the dial edge.

---

## Unit System

**Always `cqw`** (container query width relative to `.signage-stage`). Never px, rem, or vw. The clock is `28cqw` wide. `1cqw ≈ 10.8px` at native 1080px width.

Tick positions: `top: X%` on a `::before` inside a full-`inset: 0` span — so `top: 1%` sits just inside the outer edge of the circle.

Numeral positions use CSS trig:
```css
left: calc(50% + 36% * sin(calc(var(--h) * 30deg)));
top:  calc(50% - 36% * cos(calc(var(--h) * 30deg)));
```
36% ≈ 72% of the clock's radius from center — sits in the outer ring of two-tone dials.

---

## What Each Theme Override Must Cover

- `background` — dial colors, gradients, textures, bezel ring, subdials (chrono)
- `box-shadow` — case treatment (brass/steel/matte)
- `::before` — inner bezel ring (inset %, border, box-shadow)
- `::after` — brand text color (cream dials need dark ink override)
- `.analog-clock__ticks span::before` — minor tick color/size
- `.analog-clock__ticks span:nth-child(5n+1)::before` — major hour tick
- `.analog-clock__ticks span:nth-child(1)::before` — 12 o'clock marker (often special)
- `.analog-clock__hand--hour/minute/second` — hand shape, color, clip-path
- `.analog-clock__center` — center jewel size, gradient, shadow
- `.analog-clock__numerals span` — numeral color/font, or `font-size: 0` to hide
- `~ .clock-card__digital .clock-card__time/date` — digital readout colors below clock

---

## Techniques by Archetype

### Luminous pips (diver)
Set numeral spans to `font-size: 0; width: Xpx; height: Xpx` and use `::before` with `radial-gradient` + multi-layer `box-shadow` for glow. For the inverted triangle at 12, use `clip-path: polygon(...)` on `span[style*="--h:12"]::before`. For batons at 3/6/9, override with a taller, narrower `::before`.

### Roman numerals (dress)
Set `font-size: 0 !important; color: transparent !important` on numeral spans, then set content via `nth-child` selectors on `::before`. Use `font-family: "Playfair Display"` italic. Cardinals get a larger font-size override.

### Subdials (chrono)
Rendered entirely in `background` as layered `radial-gradient` entries — no extra HTML. Pattern:
1. Subdial fill + shadow ring: `radial-gradient(circle at X% Y%, <cream> 0%, <cream> 11%, <rim> 13%, transparent 14%)`
2. Tick dots: `radial-gradient(circle at X% Y%, <ink> 0%, <ink> 0.9%, transparent 1%)` — 8 per subdial at cardinals + diagonals
3. Hand line: `linear-gradient(to bottom, transparent A%, <ink> A%, <ink> B%, transparent B%) <x> 0 / <w> 100% no-repeat`
4. Pivot pin: `radial-gradient(circle, <ink> 0%, <ink> 50%, transparent 51%) X% Y% / 3% 3% no-repeat`

Order matters: later layers render under earlier ones in a CSS `background` stack.

### Spearhead hands (flieger)
`clip-path: polygon(50% 0%, 84% 20%, 62% 100%, 38% 100%, 16% 20%)` (hour) and `polygon(50% 0%, 80% 14%, 62% 100%, 38% 100%, 20% 14%)` (minute). Matte grey-silver, no lume stripe. The pentagonal spearhead shape distinguishes flieger from diver's lume-stripe swords.

### Broad arrow hands (field)
`clip-path: polygon(50% 0%, 78% 30%, 65% 30%, 65% 100%, 35% 100%, 35% 30%, 22% 30%)` (hour) and `polygon(50% 0%, 80% 26%, 70% 26%, 70% 100%, 30% 100%, 30% 26%, 20% 26%)` (minute). The arrowhead points **outward** (tip at `50% 0%`), not toward the center.

**Clip-path orientation rule:** In `.analog-clock__hand`, `0%` = the outermost tip (away from dial center), `100%` = the pivot end (toward center). All pointed shapes must place their tip at `50% 0%`. If the arrow points inward, the polygon is inverted.

### Dauphine hands (dress)
`clip-path: polygon(50% 0%, 82% 28%, 65% 100%, 35% 100%, 18% 28%)` (hour) and `polygon(50% 0%, 78% 22%, 63% 100%, 37% 100%, 22% 22%)` (minute). The diamond tip must be at `50% 0%` (outward). The same clip-path orientation rule applies.

---

## Visual Differentiation Rules

These distinctions prevent themes from looking similar:

- **Flieger vs Field**: flieger is near-black `#1c1c1c`; field is warm khaki `#7a7050`. Flieger has all 12 numerals; field has only 12/3/6/9. Flieger has a triangle at 12; field has a thick baton.
- **Diver vs Flieger**: diver has a bezel ring, lume pips (no numerals), green glow, and lume-stripe sword hands; flieger has white Arabic numerals, no glow, and matte grey spearhead hands.
- **Sector vs Dress**: sector is two-tone (cream + dark outer ring); dress is all-silver with no dark ring. Sector has Arabic numerals; dress has Roman.
- **Chrono vs Sector**: chrono has dark outer ring + cream center (inverse of sector) + three visible subdials.

---

## Screenshot Convention

Canonical screenshots live in the **project root** as `signage-<name>.png` — one file per theme, no other sets. Never commit a second set under a different prefix.

| File | Theme |
|---|---|
| `signage-sector.png` | Sector / two-tone |
| `signage-diver.png` | Submariner diver |
| `signage-flieger.png` | B-Uhr pilot |
| `signage-dress.png` | Dress watch |
| `signage-field.png` | Field / military |
| `signage-chrono.png` | Panda chronograph |

**For the screenshot command, server setup, and all caveats — see the Screenshot Loop section in `CLAUDE.md`.**

To refresh all 6 canonical screenshots after a CSS change:

```bash
for theme in sector diver flieger dress field chrono; do
  chromium-browser --headless --screenshot=signage-${theme}.png \
    --window-size=1080,1800 --hide-scrollbars --virtual-time-budget=20000 \
    "http://127.0.0.1:8000/?theme=${theme}" 2>/dev/null
done
```

---

## Known Pitfalls

- `box-shadow` glows on lume pips need `filter: drop-shadow(...)` on the element as well — `box-shadow` alone is clipped by the parent circle's `border-radius`.
- Chrono subdial sizes use gradient percentages relative to the **farthest corner distance** from the gradient center, not the element width. For a circle centered at 30%/50%, `13%` stop ≈ 3.1cqw subdial radius.
- The `::before` inner bezel ring uses `inset: X%` — this percentage is relative to the clock element's dimensions, so `inset: 17%` means 4.76cqw gap from each edge.
- Brand text `::after` defaults to cream — override to dark ink on light-dial themes (sector, dress).
- Tick `::before` `top` values: `0–1%` = outer edge, `3–4%` = recessed minor ticks. The dark outer ring on two-tone dials starts at ~33% of the clock's width from the edge.
- Chrono Arabic numerals must be hidden: `.watch--chrono .analog-clock__numerals span { font-size: 0 !important; color: transparent !important; }`. Without this, the 12 numeral spans appear over the subdials and tachymeter ring, clashing with the radial-gradient tick dots.
- Clip-path hands pointing inward: `0%` in `.analog-clock__hand` is the outermost tip; `100%` is the pivot end. If arrow/spearhead/diamond tips end up pointing toward center, the polygon coordinates are inverted — flip by placing the tip at `50% 0%`.
