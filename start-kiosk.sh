#!/usr/bin/env bash

set -euo pipefail

PORT="${PORT:-8000}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cd "$SCRIPT_DIR"

pkill -f "python3 server.py" 2>/dev/null || true

python3 server.py >/tmp/cs3250-signage-server.log 2>&1 &
SERVER_PID=$!

echo "Waiting for signage server..."
until curl -s -o /dev/null "http://127.0.0.1:${PORT}/"; do
    sleep 1
done
echo "Server ready."

chromium \
  --kiosk \
  --incognito \
  --disable-infobars \
  --noerrdialogs \
  --check-for-update-interval=31536000 \
  --disable-session-crashed-bubble \
  --autoplay-policy=no-user-gesture-required \
  "http://127.0.0.1:${PORT}/"

kill "$SERVER_PID" 2>/dev/null || true
