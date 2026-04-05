# CS3250-Digital-Signage

Static digital signage layout for a vertical Chromium display, designed to run locally on a Raspberry Pi in kiosk mode.

**Files**
- `index.html`: page structure
- `styles.css`: layout, typography, and visual styling
- `app.js`: clock, weather, RSS, quotes, QR codes, and availability logic
- `config.json`: editable signage content and feed settings
- `availability.json`: optional plug-and-play office status
- `start-kiosk.sh`: Raspberry Pi launcher for local server + Chromium kiosk mode
- `AI_ATTRIBUTION.md`: AI attribution and implementation note

**Current Features**
- Analog + digital clock
- Weather panel using Open-Meteo
- RSS headlines with per-article QR codes
- Daily rotating quote from a local quote list
- Availability / out-of-office card driven by a separate JSON file
- Raspberry Pi-friendly kiosk startup script

**Client-Editable Files**
- `config.json`
- `availability.json`

The client should not need to edit `index.html`, `styles.css`, or `app.js` for normal day-to-day updates.

**Config Notes**
- `config.json` controls display name, logo, weather, RSS feeds, quotes, and refresh timing.
- `availability.json` controls whether the availability card is shown and what it says.
- RSS feeds currently use Google News RSS search feeds plus proxy fallbacks.

Availability example:

```json
{
  "enabled": true,
  "status": "Out of Office",
  "detail": "Back Monday at 9:00 AM"
}
```

**Run Locally**
1. Edit `config.json` as needed.
2. Edit `availability.json` as needed.
3. Start a local web server and open the site in Chromium.

Why a local server is needed:
- The app uses `fetch()` to load `config.json` and `availability.json`.
- Opening `index.html` with `file://` can fail in Chromium because of local file restrictions.

**Raspberry Pi Setup**
1. Copy this project folder onto the Raspberry Pi.
2. Make sure Chromium and Python 3 are installed.
3. Make the launcher executable:

```bash
chmod +x start-kiosk.sh
```

4. Start the signage:

```bash
./start-kiosk.sh
```

The launcher:
- starts a tiny local server on `http://127.0.0.1:8000`
- opens Chromium in kiosk mode
- avoids local file fetch issues

**Optional Auto-Start On Boot**
1. Add this line to the Pi user's autostart file:

```bash
@/home/pi/CS3250-Digital-Signage/start-kiosk.sh
```

2. A common autostart file location is:

```bash
~/.config/lxsession/LXDE-pi/autostart
```

**RSS Notes**
- If a feed blocks direct browser access, adjust `rss.proxy` or `rss.proxies` in `config.json`.
- If a feed still fails through public proxies, use a different feed source or a private server-side proxy.

**Customization**
- Logos and local images should be placed in the `image/` folder.
- The hero section currently uses `image/background.jpg`.
- Quotes are stored locally in `config.json`.

See `AI_ATTRIBUTION.md` for attribution details.
