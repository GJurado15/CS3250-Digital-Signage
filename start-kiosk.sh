#!/usr/bin/env bash

set -euo pipefail

PORT="${PORT:-8000}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cd "$SCRIPT_DIR"

pkill -f "python3 -m http.server ${PORT}" 2>/dev/null || true
pkill -f "chromium.*localhost:${PORT}" 2>/dev/null || true

python3 -m http.server "$PORT" --bind 127.0.0.1 >/tmp/cs3250-signage-server.log 2>&1 &
SERVER_PID=$!

sleep 2

chromium-browser \
  --kiosk \
  --incognito \
  --disable-infobars \
  --noerrdialogs \
  --check-for-update-interval=31536000 \
  --disable-session-crashed-bubble \
  --autoplay-policy=no-user-gesture-required \
  "http://127.0.0.1:${PORT}/index.html"

kill "$SERVER_PID" 2>/dev/null || true
