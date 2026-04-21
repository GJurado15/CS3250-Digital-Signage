# CS3250 Digital Signage

A browser-based digital signage kiosk for Dr. Steve Beaty's office at MSU Denver's CS Department. Runs fullscreen on a Raspberry Pi at 1080×1800 (portrait). Static HTML/CSS/JS — no build step, no framework.

---

## Running It

```bash
# Start the local server (includes a CORS proxy — required, do not use python3 -m http.server)
python3 server.py

# Open in browser
http://127.0.0.1:8000/
```

The server must be running for the app to load `config.json` and to proxy RSS feeds.

---

## Files

| File | Purpose |
|------|---------|
| `index.html` | Page structure — rarely needs editing |
| `styles.css` | All visual design |
| `app.js` | Clock, weather, RSS, quotes, QR codes |
| `utils.js` | Pure utility functions (no DOM/network) — shared by `app.js` and tests |
| `config.json` | All configurable content — **edit this for day-to-day changes** |
| `server.py` | Local dev/kiosk server with built-in CORS proxy |
| `start-kiosk.sh` | Raspberry Pi launcher |
| `watchcreation.md` | Technical guide to the watch dial system — DOM structure, CSS techniques, pitfalls |

---

## Development

Install dependencies first (one-time):

```bash
npm install
```

| Command | What it does |
|---------|-------------|
| `npm run lint` | Run ESLint across all JS files |
| `npm test` | Run Jest unit tests with coverage report |
| `npm run docs` | Generate JSDoc HTML documentation into `docs/` |

**CI/CD** — GitHub Actions runs lint and tests automatically on every push and pull request. A PR cannot be merged if either check fails. Coverage must stay above 90% or the test run fails.

Tests live in `utils.test.js` and cover the 11 pure utility functions in `utils.js` (date formatting, headline scoring, feed normalization, weather codes, etc.). Functions that require a browser or network are not unit-tested.

---

## Office Hours

Edit **`office-hours.json`** at the root of the project — it's the only thing in that file:

```json
{
  "location": "CN 204",
  "schedule": [
    { "day": "Mon", "time": "10:00–11:00 AM" },
    { "day": "Wed", "time": "10:00–11:00 AM" },
    { "day": "Fri", "time":  "2:00–3:00 PM"  }
  ]
}
```

- Add, remove, or reorder rows in `schedule` to match the current semester.
- Change `location` for the room number.
- Days and times are plain strings — write them however you like (`"Tue/Thu"`, `"By appointment"`, etc.).

---

## Configuration

### `config.json`

Controls display name, logo, quotes, weather location, and RSS feeds. Edit this file — never touch `index.html` — for day-to-day updates.

#### RSS Feeds

```json
"rss": {
  "feeds": [
    { "feedUrl": "...", "sourceName": "Label" }
  ],
  "refreshMinutes": 15
}
```

---

## RSS Feeds (Current)

| Source | Why |
|--------|-----|
| Ars Technica | Deep technical reporting, strong images |
| Hacker News (`/best`) | Community-vetted CS/tech, high engagement |
| Quanta Magazine (CS) | CS theory and research, academic credibility |
| MIT News (CS) | Direct from MIT CS department, zero editorial risk |

Headlines are scored for engagement — a question-formatted or emotionally resonant headline wins the lead slot regardless of which feed it came from.

---

## Raspberry Pi Setup

1. Copy the project folder to the Pi
2. Ensure Python 3 and Chromium are installed
3. Make the launcher executable:

```bash
chmod +x start-kiosk.sh
```

4. Run:

```bash
./start-kiosk.sh
```

This starts `server.py` and opens Chromium in fullscreen kiosk mode.

**Auto-start on boot** — add to `~/.config/lxsession/LXDE-pi/autostart`:

```
@/home/pi/CS3250-Digital-Signage/start-kiosk.sh
```

---

## Watch Themes

The analog clock cycles through 6 vintage watch dial archetypes — one per day, stable across page reloads:

| Theme | Archetype | Key traits |
|---|---|---|
| Sector | 1930s two-tone | Cream inner field + dark outer ring, hairline crosshair, cobalt blued-steel hands |
| Diver | Submariner | All-black dial, multi-layer glowing lume pips, inverted triangle at 12, lume-stripe hands |
| Flieger | B-Uhr pilot | Matte black, all 12 large Arabic numerals, white triangle at 12, sword hands with lume stripe |
| Dress | Dress watch | Silver/champagne dial, Playfair Display italic Roman numerals, dauphine hands |
| Field | Military/field | Warm khaki/olive dial, cardinals only (12/3/6/9), broad arrow hands |
| Chrono | Panda chronograph | Cream center + dark tachymeter ring, three CSS-only subdials at 3/6/9 |

To force a specific theme during development, add `?theme=diver` (or any theme name) to the URL.

Reference screenshots for all 6 themes are saved as `signage-<name>.png` in the project root.

See `watchcreation.md` for the full technical guide to the dial system.

---

## Weather

Uses [Open-Meteo](https://open-meteo.com/) — free, no API key. Location is set in `config.json` as latitude/longitude.

---

See `CLAUDE.md` for full technical and design documentation (intended for AI assistants continuing work on this project).
