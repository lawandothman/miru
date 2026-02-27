#!/usr/bin/env bash
set -euo pipefail

# Requires: brew install cloudflared

docker compose up -d --wait

# Start cloudflared in background, write directly to log file (avoids tee buffering)
> /tmp/cloudflared.log
cloudflared tunnel --url http://localhost:3000 >> /tmp/cloudflared.log 2>&1 &
CF_PID=$!

# Wait for tunnel URL to appear in logs
echo "Waiting for tunnel..."
TUNNEL_URL=""
for i in $(seq 1 30); do
  TUNNEL_URL=$(grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' /tmp/cloudflared.log 2>/dev/null | head -1 || true)
  if [ -n "$TUNNEL_URL" ]; then break; fi
  sleep 1
done

if [ -z "$TUNNEL_URL" ]; then
  echo "Failed to start cloudflare tunnel"
  kill $CF_PID 2>/dev/null
  exit 1
fi

echo "Tunnel: $TUNNEL_URL"

# Update env files
sed -i '' "s|BETTER_AUTH_URL=.*|BETTER_AUTH_URL=\"$TUNNEL_URL\"|" apps/web/.env
echo "EXPO_PUBLIC_API_URL=$TUNNEL_URL" > apps/mobile/.env

cleanup() {
  kill $CF_PID 2>/dev/null
  sed -i '' 's|BETTER_AUTH_URL=.*|BETTER_AUTH_URL="http://localhost:3000"|' apps/web/.env
  rm -f apps/mobile/.env
  echo "Cleaned up tunnel config"
}
trap cleanup EXIT

pnpm turbo dev
