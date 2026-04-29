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
| `setup.sh` | One-time Raspberry Pi setup — installs deps, fixes NTP/certs, wires autostart |
| `start-kiosk.sh` | Raspberry Pi launcher — starts server, waits for it, opens Chromium kiosk |
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

Headlines are sorted by recency — the most recent item from each feed is shown, with the lead slot going to the most recent overall.

---

## Raspberry Pi Setup

Clone the repo on the Pi and run the setup script once:

```bash
git clone https://github.com/GJurado15/CS3250-Digital-Signage.git
cd CS3250-Digital-Signage
bash setup.sh
```

`setup.sh` installs Chromium, fontconfig, and CA certificates; syncs the system clock (fixes SSL issues); and wires `start-kiosk.sh` into LXDE autostart. It reboots automatically after a 5-second countdown.

After the reboot, the kiosk starts on every boot — no manual steps needed. The Pi must be configured to auto-login to the desktop (the default on Raspberry Pi OS).

---

## Watch Themes

The analog clock cycles through 6 vintage watch dial archetypes — one per day, stable across page reloads:

| Theme | Archetype | Key traits |
|---|---|---|
| Sector | 1930s two-tone | Cream inner field + dark outer ring, hairline crosshair, cobalt blued-steel hands |
| Diver | Submariner | All-black dial, multi-layer glowing lume pips, inverted triangle at 12, lume-stripe hands |
| Flieger | B-Uhr pilot | Matte black, all 12 large Arabic numerals, white triangle at 12, spearhead hands (matte grey-silver, no lume) |
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
