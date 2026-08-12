#!/bin/sh
# Entrypoint for the edge proxy container.
#
# Three jobs:
#   1. Decide whether Cloudflare's real-IP config is active.
#   2. Render deploy/nginx.conf, substituting ${DOMAIN} only.
#   3. Reload nginx periodically so renewed certificates are picked up.
#
# The reload loop lives here rather than in a separate container so that nothing
# in the stack needs the Docker socket mounted — that would grant root-equivalent
# control of the VPS to a container whose only job is sending SIGHUP.

set -eu

: "${DOMAIN:?DOMAIN must be set}"

# nginx.conf unconditionally includes /etc/nginx/conf.d/realip.conf, so the file
# must always exist. When Cloudflare is not in front of this server the file is
# empty and $remote_addr stays the true peer address.
#
# Enabling this when Cloudflare is NOT proxying would be a spoofing hole only if
# the peer were also in Cloudflare's ranges, which it is not — but leaving it off
# keeps the trust list as narrow as the deployment actually requires.
if [ "${CLOUDFLARE:-false}" = "true" ]; then
  echo "==> Cloudflare mode: trusting CF-Connecting-IP from Cloudflare ranges."
  cp /etc/nginx/cloudflare-realip.conf /etc/nginx/conf.d/realip.conf
else
  echo "==> Direct mode: using the connecting peer address as the client IP."
  : > /etc/nginx/conf.d/realip.conf
fi

# Substitute ONLY $DOMAIN. Listing it explicitly stops envsubst from eating
# nginx's own runtime variables ($host, $remote_addr, $request_uri, ...).
envsubst '$DOMAIN' \
  < /etc/nginx/templates/nginx.conf.template \
  > /etc/nginx/nginx.conf

nginx -t

# nginx reads certificates into memory once at startup, so a certbot renewal is
# invisible to clients until a reload. Reloading is graceful — workers finish
# in-flight requests — so doing it on a timer costs nothing.
(
  while :; do
    sleep 6h
    nginx -s reload 2>/dev/null || true
  done
) &

exec nginx -g 'daemon off;'
