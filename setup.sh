#!/usr/bin/env bash
# setup.sh — one-time setup for CS3250 Digital Signage kiosk on Raspberry Pi
# Run once from the repo directory: bash setup.sh

set -euo pipefail

REPO_DIR="$(dirname "$(readlink -f "$0")")"

echo ">>> Installing system packages..."
sudo apt update -qq
sudo apt install -y \
    chromium \
    fontconfig fonts-liberation fonts-noto-core \
    ca-certificates openssl \
    curl \
    x11-xserver-utils

echo ">>> Syncing clock..."
sudo timedatectl set-ntp true
echo -n "Waiting for NTP sync"
for i in $(seq 1 30); do
    timedatectl show | grep -q "NTPSynchronized=yes" && break
    echo -n "."
    sleep 2
done
echo ""
timedatectl show | grep -q "NTPSynchronized=yes" \
    && echo "Clock synced." \
    || echo "WARNING: NTP sync timed out — SSL handshakes may fail if clock is skewed."

echo ">>> Updating CA certificates..."
sudo update-ca-certificates
sudo c_rehash /etc/ssl/certs 2>/dev/null || true

echo ">>> Rebuilding font cache..."
fc-cache -fv

echo ">>> Wiring kiosk into LXDE autostart..."
AUTOSTART_DIR="$HOME/.config/lxsession/LXDE-pi"
AUTOSTART_FILE="$AUTOSTART_DIR/autostart"
mkdir -p "$AUTOSTART_DIR"

# Seed from system defaults so the desktop environment still initializes
# (pcmanfm, polkit agent, etc.) — without this a bare user file skips them all
if [ ! -f "$AUTOSTART_FILE" ]; then
    cp /etc/xdg/lxsession/LXDE-pi/autostart "$AUTOSTART_FILE" 2>/dev/null \
        || touch "$AUTOSTART_FILE"
fi

# Idempotent: only add if not already present
if ! grep -q "start-kiosk.sh" "$AUTOSTART_FILE"; then
    echo "@${REPO_DIR}/start-kiosk.sh" >> "$AUTOSTART_FILE"
fi

chmod +x "${REPO_DIR}/start-kiosk.sh"

echo ""
echo ">>> Setup complete! Rebooting in 5 seconds — Ctrl+C to cancel."
sleep 5
sudo reboot
