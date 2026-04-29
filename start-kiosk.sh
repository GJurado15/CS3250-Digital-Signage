#!/usr/bin/env bash

set -euo pipefail

PORT="${PORT:-8000}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cd "$SCRIPT_DIR"

# Disable screen blanking and DPMS power-save — the Pi has no keyboard/mouse
# input in kiosk mode, so DPMS would turn the screen off after ~10 minutes
xset s off     2>/dev/null || true
xset -dpms     2>/dev/null || true
xset s noblank 2>/dev/null || true

pkill -f "python3 server.py" 2>/dev/null || true
sleep 1  # let the OS fully release the port before rebinding

python3 server.py >/tmp/cs3250-signage-server.log 2>&1 &
SERVER_PID=$!

echo "Waiting for signage server..."
WAITED=0
until curl -s -o /dev/null "http://127.0.0.1:${PORT}/"; do
    sleep 1
    WAITED=$((WAITED + 1))
    if [ "$WAITED" -ge 30 ]; then
        echo "ERROR: server did not start after 30s — check /tmp/cs3250-signage-server.log"
        exit 1
    fi
done
echo "Server ready."

chromium \
  --kiosk \
  --incognito \
  --no-first-run \
  --disable-infobars \
  --noerrdialogs \
  --check-for-update-interval=31536000 \
  --disable-session-crashed-bubble \
  --autoplay-policy=no-user-gesture-required \
  --disable-dev-shm-usage \
  --password-store=basic \
  "http://127.0.0.1:${PORT}/"

kill "$SERVER_PID" 2>/dev/null || true
