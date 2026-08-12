#!/bin/sh
# One-time TLS bootstrap for the FIBI stack.
#
#   ./deploy/init-letsencrypt.sh              # issue a real certificate
#   STAGING=1 ./deploy/init-letsencrypt.sh    # dry run against Let's Encrypt staging
#
# Solves the ordering problem: nginx refuses to start without a certificate on
# disk, but Let's Encrypt can only validate the domain once nginx is answering on
# port 80. So we plant a throwaway self-signed cert, start nginx, swap in the real
# certificate, and reload.
#
# Safe to re-run. It will not overwrite a valid certificate unless FORCE=1.

set -eu

cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  echo "ERROR: .env not found. Copy .env.docker.example to .env and fill it in first." >&2
  exit 1
fi

# shellcheck disable=SC1091
. ./.env

: "${DOMAIN:?Set DOMAIN in .env}"
: "${CERTBOT_EMAIL:?Set CERTBOT_EMAIL in .env — Let's Encrypt uses it for expiry warnings}"

STAGING="${STAGING:-0}"
FORCE="${FORCE:-0}"
CERT_PATH="/etc/letsencrypt/live/$DOMAIN"

compose() { docker compose "$@"; }

echo "==> Domain:  $DOMAIN (and www.$DOMAIN)"
echo "==> Contact: $CERTBOT_EMAIL"
[ "$STAGING" = "1" ] && echo "==> MODE: staging (certificate will NOT be trusted by browsers)"

# --- 0. Confirm DNS actually points here, before burning a rate limit ----------
# Let's Encrypt allows only 5 failed validations per hostname per hour, and the
# overwhelmingly common cause of failure is DNS that has not propagated yet.
SERVER_IP="$(curl -fsS --max-time 10 https://api.ipify.org 2>/dev/null || echo '')"
DOMAIN_IP="$(getent hosts "$DOMAIN" 2>/dev/null | awk '{print $1; exit}' || echo '')"
if [ -n "$SERVER_IP" ] && [ -n "$DOMAIN_IP" ] && [ "$SERVER_IP" != "$DOMAIN_IP" ]; then
  if [ "${CLOUDFLARE:-false}" = "true" ]; then
    # Expected with the orange cloud on: the record resolves to a Cloudflare
    # edge address, not this VPS. Issuance still works, because Cloudflare
    # forwards the ACME challenge to the origin over port 80 — but only if the
    # record is proxied AND SSL/TLS mode is Full (strict). If issuance fails
    # here, set the record to "DNS only" (grey cloud), re-run, then re-proxy.
    echo "==> $DOMAIN resolves to $DOMAIN_IP (Cloudflare edge); origin is $SERVER_IP."
    echo "==> Cloudflare mode: the ACME challenge is expected to arrive via Cloudflare."
  else
    echo "WARNING: $DOMAIN resolves to $DOMAIN_IP but this server is $SERVER_IP." >&2
    echo "         Point the A record at $SERVER_IP and wait for propagation." >&2
    echo "         (If Cloudflare proxying is on, set CLOUDFLARE=true in .env.)" >&2
    printf "         Continue anyway? [y/N] "
    read -r reply
    case "$reply" in [Yy]*) ;; *) exit 1 ;; esac
  fi
fi

# --- 1. Volumes and the ACME webroot -----------------------------------------
compose up --no-start >/dev/null 2>&1 || true

# --- 2. Skip if a real certificate is already present -------------------------
if [ "$FORCE" != "1" ] && docker run --rm -v fibi_letsencrypt_certs:/etc/letsencrypt \
     --entrypoint test certbot/certbot:latest -f "$CERT_PATH/fullchain.pem" 2>/dev/null; then
  echo "==> A certificate for $DOMAIN already exists. Re-run with FORCE=1 to replace it."
  echo "==> Starting the stack."
  compose up -d --build
  exit 0
fi

# --- 3. Plant a self-signed placeholder so nginx can boot ---------------------
echo "==> Creating a temporary self-signed certificate so nginx can start."
docker run --rm -v fibi_letsencrypt_certs:/etc/letsencrypt \
  --entrypoint /bin/sh certbot/certbot:latest -c "
    mkdir -p '$CERT_PATH' &&
    openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
      -keyout '$CERT_PATH/privkey.pem' \
      -out '$CERT_PATH/fullchain.pem' \
      -subj '/CN=$DOMAIN' 2>/dev/null"

# --- 4. Bring up nginx so port 80 answers the ACME challenge ------------------
echo "==> Starting the stack."
compose up -d --build
# The proxy waits on the backend and frontend healthchecks, and the backend in
# turn waits on Postgres and then runs migrations, so a cold first boot can take
# a couple of minutes. Allow for that rather than racing ahead to certbot and
# burning a Let's Encrypt validation attempt on a port that is not open yet.
echo "==> Waiting for the proxy to accept connections (up to 4 minutes on a cold start)."
i=0
while [ "$i" -lt 120 ]; do
  if curl -fsS -o /dev/null --max-time 5 "http://localhost/.well-known/acme-challenge/" 2>/dev/null \
     || curl -sS -o /dev/null --max-time 5 "http://localhost/" 2>/dev/null; then
    break
  fi
  i=$((i + 1))
  sleep 2
done

if [ "$i" -ge 120 ]; then
  echo "ERROR: the proxy never started answering on port 80." >&2
  echo "       Check 'docker compose ps' and 'docker compose logs proxy backend'." >&2
  echo "       Not contacting Let's Encrypt — validation would fail and count" >&2
  echo "       against the 5-failures-per-hour limit for this hostname." >&2
  exit 1
fi

# --- 5. Replace the placeholder with the real certificate ---------------------
echo "==> Requesting the certificate from Let's Encrypt."
docker run --rm -v fibi_letsencrypt_certs:/etc/letsencrypt \
  --entrypoint rm certbot/certbot:latest -rf \
  "/etc/letsencrypt/live/$DOMAIN" \
  "/etc/letsencrypt/archive/$DOMAIN" \
  "/etc/letsencrypt/renewal/$DOMAIN.conf"

STAGING_FLAG=""
[ "$STAGING" = "1" ] && STAGING_FLAG="--staging"

# shellcheck disable=SC2086
docker run --rm \
  -v fibi_letsencrypt_certs:/etc/letsencrypt \
  -v fibi_certbot_webroot:/var/www/certbot \
  certbot/certbot:latest certonly \
  --webroot -w /var/www/certbot \
  $STAGING_FLAG \
  -d "$DOMAIN" -d "www.$DOMAIN" \
  --email "$CERTBOT_EMAIL" \
  --agree-tos --no-eff-email \
  --rsa-key-size 4096 \
  --non-interactive \
  --keep-until-expiring

# --- 6. Load the new certificate ---------------------------------------------
echo "==> Reloading nginx."
compose exec -T proxy nginx -s reload

echo
echo "Done. https://$DOMAIN should now serve a valid certificate."
echo "Renewal is automatic — the certbot service checks twice a day."
[ "$STAGING" = "1" ] && echo "NOTE: staging cert issued. Re-run with FORCE=1 and no STAGING to go live."
exit 0
