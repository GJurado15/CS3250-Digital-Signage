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

The server must be running for the app to load `config.json`, `availability.json`, and to proxy RSS feeds.

---

## Files

| File | Purpose |
|------|---------|
| `index.html` | Page structure — rarely needs editing |
| `styles.css` | All visual design |
| `app.js` | Clock, weather, RSS, quotes, QR codes, availability |
| `utils.js` | Pure utility functions (no DOM/network) — shared by `app.js` and tests |
| `config.json` | All configurable content — **edit this for day-to-day changes** |
| `availability.json` | Office in/out status — **edit this to update availability** |
| `server.py` | Local dev/kiosk server with built-in CORS proxy |
| `start-kiosk.sh` | Raspberry Pi launcher |

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

## Configuration

### `availability.json`

```json
{
  "enabled": true,
  "status": "Out of Office",
  "detail": "Back Monday at 9:00 AM"
}
```

Set `"enabled": false` to hide the availability card entirely.

### `config.json`

Controls display name, logo, quotes, weather location, and RSS feeds. The RSS section is the most commonly changed part:

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

## Weather

Uses [Open-Meteo](https://open-meteo.com/) — free, no API key. Location is set in `config.json` as latitude/longitude.

---

See `CLAUDE.md` for full technical and design documentation (intended for AI assistants continuing work on this project).
