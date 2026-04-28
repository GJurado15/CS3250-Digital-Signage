#!/usr/bin/env bash
# setup.sh — one-time setup for CS3250 Digital Signage kiosk on Raspberry Pi
# Run once from the repo directory: bash setup.sh

set -euo pipefail

REPO_DIR="$(dirname "$(readlink -f "$0")")"

echo ">>> Installing system packages..."
sudo apt update -qq
sudo apt install -y chromium fontconfig ca-certificates

echo ">>> Syncing clock and updating CA certificates..."
sudo timedatectl set-ntp true
sudo update-ca-certificates
fc-cache -fv

echo ">>> Wiring kiosk into LXDE autostart..."
AUTOSTART_DIR="$HOME/.config/lxsession/LXDE-pi"
AUTOSTART_FILE="$AUTOSTART_DIR/autostart"
mkdir -p "$AUTOSTART_DIR"

# Idempotent: only add if not already present
if ! grep -q "start-kiosk.sh" "$AUTOSTART_FILE" 2>/dev/null; then
    echo "@${REPO_DIR}/start-kiosk.sh" >> "$AUTOSTART_FILE"
fi

chmod +x "${REPO_DIR}/start-kiosk.sh"

echo ""
echo ">>> Setup complete! Rebooting in 5 seconds — Ctrl+C to cancel."
sleep 5
sudo reboot
