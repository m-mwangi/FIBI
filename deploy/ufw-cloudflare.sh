#!/bin/sh
# Restrict ports 80/443 on this VPS to Cloudflare's edge ranges.
#
#   sudo ./deploy/ufw-cloudflare.sh
#
# WHY: proxying a hostname through Cloudflare only protects the traffic that
# actually goes through Cloudflare. The origin's IP address is easy to find
# (historical DNS records, certificate transparency logs, a stray subdomain that
# is not proxied), and an attacker who has it can point traffic straight at this
# server — past the WAF, past the rate limits, past the DDoS absorption. Closing
# 80/443 to everything except Cloudflare is what makes the proxy a boundary
# rather than a suggestion.
#
# RUN THIS ONLY WHEN ALL OF THE FOLLOWING ARE TRUE:
#   1. The TLS certificate has been issued (./deploy/init-letsencrypt.sh done).
#   2. The DNS records are Proxied (orange cloud) in Cloudflare.
#   3. CLOUDFLARE=true is set in .env and the stack has been restarted.
#
# Running it while the records are "DNS only" makes the site unreachable — from
# your browser and from Let's Encrypt. Recovery is via the Hostinger console:
#   ufw allow 80/tcp && ufw allow 443/tcp
#
# SSH is deliberately untouched. This script never edits the OpenSSH rule, so a
# mistake here cannot lock you out of the server.

set -eu

if [ "$(id -u)" -ne 0 ]; then
  echo "ERROR: run as root (sudo $0)." >&2
  exit 1
fi

command -v ufw >/dev/null 2>&1 || { echo "ERROR: ufw is not installed." >&2; exit 1; }

echo "This will remove the open 80/443 rules and allow those ports only from"
echo "Cloudflare. Confirm the three preconditions in the header first."
printf "Proceed? [y/N] "
read -r reply
case "$reply" in [Yy]*) ;; *) echo "Aborted."; exit 1 ;; esac

V4="$(curl -fsS --max-time 20 https://www.cloudflare.com/ips-v4)"
V6="$(curl -fsS --max-time 20 https://www.cloudflare.com/ips-v6)"
if [ -z "$V4" ] || [ -z "$V6" ]; then
  echo "ERROR: could not fetch Cloudflare ranges; refusing to change the firewall." >&2
  echo "       A partial allow-list would black-hole real traffic." >&2
  exit 1
fi

# Make sure SSH survives whatever else happens below.
ufw allow OpenSSH >/dev/null 2>&1 || ufw allow 22/tcp >/dev/null 2>&1 || true

echo "==> Adding Cloudflare ranges."
for cidr in $V4 $V6; do
  ufw allow proto tcp from "$cidr" to any port 80  comment 'cloudflare' >/dev/null
  ufw allow proto tcp from "$cidr" to any port 443 comment 'cloudflare' >/dev/null
done

echo "==> Removing the world-open web rules (if present)."
ufw delete allow 80/tcp  >/dev/null 2>&1 || true
ufw delete allow 443/tcp >/dev/null 2>&1 || true
ufw delete allow 'Nginx Full' >/dev/null 2>&1 || true

ufw --force enable >/dev/null
ufw reload >/dev/null

echo
echo "Done. Current rules:"
ufw status numbered
echo
echo "Verify from your laptop — the hostname must still work, the raw IP must not:"
echo "  curl -sI https://\$DOMAIN            # expect 200"
echo "  curl -sI --max-time 8 https://\$(curl -s https://api.ipify.org)   # expect a timeout"
echo
echo "Re-run this script after ./deploy/update-cloudflare-ips.sh if Cloudflare"
echo "ever changes its ranges — the firewall list and the nginx list must agree."
