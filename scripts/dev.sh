#!/usr/bin/env bash
set -euo pipefail

# Ensure Postgres is running
if ! docker compose ps --status running | grep -q postgres; then
  echo "Starting Postgres..."
  docker compose up -d --wait
fi

# Print the LAN IP so it's visible for physical device debugging
LAN_IP=$(ipconfig getifaddr en0 2>/dev/null || echo "unknown")
echo "LAN IP: $LAN_IP — mobile app will connect to http://$LAN_IP:3000"

# Start all dev servers
exec pnpm turbo dev
