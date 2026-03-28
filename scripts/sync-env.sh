#!/usr/bin/env bash
# sync-env.sh — Sync Doppler prd secrets to Coolify app env vars
#
# Usage:
#   ./scripts/sync-env.sh
#
# Requirements:
#   - doppler CLI authenticated
#   - COOLIFY_API_TOKEN in Doppler (racknerd project, dev config)
#
# This script is the source-of-truth sync between Doppler and Coolify.
# Run it before every deploy to ensure Coolify has the latest secrets.
# Add new secrets to SYNC_KEYS below when the app needs them.

set -euo pipefail

DOPPLER_PROJECT="star-reader"
DOPPLER_CONFIG="prd"
COOLIFY_APP_UUID="zt40ninnaz037fgq67s2vtfx"
COOLIFY_BASE="https://dashboard.johnlawver.com/api/v1"

# Keys to sync from Doppler prd → Coolify
# Add new production secrets here as the app grows
SYNC_KEYS=(
  DATABASE_URL
  AUTH_SECRET
  NEXTAUTH_URL
  NODE_ENV
  RESEND_API_KEY
)

# Fetch Coolify token from Doppler
COOLIFY_TOKEN=$(doppler secrets get COOLIFY_API_TOKEN --plain --project racknerd --config dev 2>/dev/null)
if [[ -z "$COOLIFY_TOKEN" ]]; then
  echo "Error: could not fetch COOLIFY_API_TOKEN from Doppler" >&2
  exit 1
fi

echo "Fetching current Coolify env vars..."
EXISTING=$(curl -sf "$COOLIFY_BASE/applications/$COOLIFY_APP_UUID/envs" \
  -H "Authorization: Bearer $COOLIFY_TOKEN")

upsert_env() {
  local key="$1"
  local value="$2"

  # Check if key already exists in Coolify
  local existing_uuid
  existing_uuid=$(echo "$EXISTING" | python3 -c "
import sys, json
envs = json.load(sys.stdin)
match = next((e for e in envs if e['key'] == '$key' and not e.get('is_preview', False)), None)
print(match['uuid'] if match else '')
" 2>/dev/null)

  if [[ -n "$existing_uuid" ]]; then
    # Update existing
    curl -sf -X PATCH "$COOLIFY_BASE/applications/$COOLIFY_APP_UUID/envs" \
      -H "Authorization: Bearer $COOLIFY_TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"uuid\": \"$existing_uuid\", \"key\": \"$key\", \"value\": $(python3 -c "import json,sys; print(json.dumps(sys.argv[1]))" "$value")}" \
      > /dev/null
    echo "  updated: $key"
  else
    # Create new
    curl -sf -X POST "$COOLIFY_BASE/applications/$COOLIFY_APP_UUID/envs" \
      -H "Authorization: Bearer $COOLIFY_TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"key\": \"$key\", \"value\": $(python3 -c "import json,sys; print(json.dumps(sys.argv[1]))" "$value"), \"is_preview\": false}" \
      > /dev/null
    echo "  created: $key"
  fi
}

echo "Syncing secrets from Doppler ($DOPPLER_PROJECT/$DOPPLER_CONFIG) → Coolify..."
for key in "${SYNC_KEYS[@]}"; do
  # Skip keys that don't exist in Doppler (e.g. RESEND_API_KEY not set yet)
  value=$(doppler secrets get "$key" --plain --project "$DOPPLER_PROJECT" --config "$DOPPLER_CONFIG" 2>/dev/null || true)
  if [[ -z "$value" ]]; then
    echo "  skipped: $key (not set in Doppler)"
    continue
  fi
  upsert_env "$key" "$value"
done

echo ""
echo "Done. Restart the Coolify app to apply changes:"
echo "  curl -X POST $COOLIFY_BASE/applications/$COOLIFY_APP_UUID/restart -H 'Authorization: Bearer \$COOLIFY_TOKEN'"
