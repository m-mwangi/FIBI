#!/bin/sh
# Refresh deploy/cloudflare-realip.conf from Cloudflare's published ranges.
#
#   ./deploy/update-cloudflare-ips.sh && docker compose restart proxy
#
# Only needed when Cloudflare changes its edge ranges (rare). The file in git is
# a valid snapshot; this script exists so the list never has to be edited by
# hand. It writes nothing unless both downloads succeed, so a network failure
# cannot leave a truncated allow-list behind — a truncated list would silently
# stop trusting CF-Connecting-IP for the missing ranges.

set -eu

cd "$(dirname "$0")"
TARGET="cloudflare-realip.conf"

V4="$(curl -fsS --max-time 20 https://www.cloudflare.com/ips-v4)"
V6="$(curl -fsS --max-time 20 https://www.cloudflare.com/ips-v6)"

if [ -z "$V4" ] || [ -z "$V6" ]; then
  echo "ERROR: Cloudflare returned an empty range list; keeping the existing $TARGET." >&2
  exit 1
fi

TMP="$(mktemp)"
trap 'rm -f "$TMP"' EXIT

# Preserve the explanatory header; only the directives are regenerated.
sed '/^# --- IPv4 ---$/,$d' "$TARGET" > "$TMP"

{
  echo "# --- IPv4 ---"
  echo "$V4" | sed 's/^/set_real_ip_from /; s/$/;/'
  echo
  echo "# --- IPv6 ---"
  echo "$V6" | sed 's/^/set_real_ip_from /; s/$/;/'
  echo
  echo "# Cloudflare puts the true client address in CF-Connecting-IP and it is a single"
  echo "# address, not a list, so recursive resolution is neither needed nor wanted."
  echo "real_ip_header CF-Connecting-IP;"
  echo "real_ip_recursive off;"
} >> "$TMP"

cp "$TMP" "$TARGET"
echo "Updated $TARGET ($(echo "$V4" | wc -l) IPv4 + $(echo "$V6" | wc -l) IPv6 ranges)."
echo "Apply with: docker compose restart proxy"
