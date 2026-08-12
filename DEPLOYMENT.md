# Deploying FIBI to the Hostinger VPS (fibicommunity.org)

The whole stack runs in Docker. Nothing but Docker itself is installed on the host,
so the VPS stays reproducible and a rebuild never depends on hand-made host config.

```
                  :80  ┌─────────────────────────────────┐
  Internet ──────────► │  proxy (nginx)                  │  TLS, HSTS, rate limits
                 :443  │  terminates TLS for the domain  │
                       └───┬───────────────┬─────────────┘
                           │ /             │ /api/  /uploads/
                     ┌─────▼──────┐   ┌────▼──────┐
                     │  frontend  │   │  backend  │──► postgres (internal only)
                     │  (static)  │   │ (Express) │      + backend_uploads volume
                     └────────────┘   └───────────┘
                            certbot ──► renews the certificate every 12h
```

Only `proxy` publishes ports. Postgres, the API and the static frontend are
reachable only on the internal Docker network — Postgres is never exposed to the
internet.

---

## 1. Prerequisites

**DNS — do this first and let it propagate.** Certificate issuance fails without it.

> **Using Cloudflare?** Follow [CLOUDFLARE.md](CLOUDFLARE.md) instead of this
> section — it covers the nameserver move, the exact records, and the settings
> this stack needs. Come back here at section 2. The short version: create the
> records **unproxied (grey cloud)** so issuance works, then switch them to
> Proxied and set `CLOUDFLARE=true` in `.env`.

Point both records at the VPS IP:

| Type | Name  | Value          |
|------|-------|----------------|
| A    | `@`   | `<YOUR_VPS_IP>` |
| A    | `www` | `<YOUR_VPS_IP>` |

Verify from your laptop before continuing:

```bash
dig +short fibicommunity.org
dig +short www.fibicommunity.org
```

Both must return the VPS IP.

## 2. Prepare the server

SSH in as root, then:

```bash
# Docker Engine + compose plugin
curl -fsSL https://get.docker.com | sh
systemctl enable --now docker

# Firewall: SSH and web only
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
```

Deploying as a non-root user is worth the five minutes:

```bash
adduser fibi && usermod -aG docker fibi
rsync --archive --chown=fibi:fibi ~/.ssh /home/fibi/
# then reconnect as fibi
```

## 3. Get the code

```bash
git clone <REPO_URL> /opt/fibi
cd /opt/fibi
```

## 4. Configure

```bash
cp .env.docker.example .env
chmod 600 .env          # it will hold live secrets
nano .env
```

Every `REPLACE_ME` must be filled in. Generate the two secrets:

```bash
openssl rand -hex 32                            # JWT_SECRET
openssl rand -base64 32 | tr -d '/+=' | head -c 32   # POSTGRES_PASSWORD
```

`POSTGRES_PASSWORD` must also appear inside `DATABASE_URL` — they are the same
password in two places. Keeping it alphanumeric avoids percent-encoding problems
in the URL.

Leave `VITE_API_URL` **empty**. The proxy serves the app and the API from one
origin, so the browser uses relative `/api/v1/...` URLs and never triggers a CORS
preflight.

Leave `CLOUDFLARE=false` for now. It is switched on in
[CLOUDFLARE.md](CLOUDFLARE.md) §4, *after* the certificate exists and the DNS
records are proxied.

## 5. Issue the certificate and start

```bash
./deploy/init-letsencrypt.sh
```

The script plants a temporary self-signed certificate so nginx can boot, brings
the stack up, swaps in the real Let's Encrypt certificate over the ACME challenge,
and reloads. It warns you if DNS does not yet point at this server.

Rehearse first if you like — Let's Encrypt allows only 5 failed validations per
hostname per hour:

```bash
STAGING=1 ./deploy/init-letsencrypt.sh    # untrusted cert, no rate-limit risk
FORCE=1 ./deploy/init-letsencrypt.sh      # then issue the real one
```

## 6. Verify

```bash
docker compose ps                                  # all services Up / healthy
curl -I  http://fibicommunity.org                  # 301 -> https
curl -I  https://fibicommunity.org                 # 200, valid cert
curl -sI https://www.fibicommunity.org             # 301 -> apex
curl -s  https://fibicommunity.org/api/v1/projects # JSON
```

Then create the first admin account:

```bash
docker compose exec backend npm run create-admin
```

## 7. Post-deploy checks

- Grade the TLS setup at <https://www.ssllabs.com/ssltest/?d=fibicommunity.org> — this config should score A.
- If you use Stripe, set the webhook endpoint to
  `https://fibicommunity.org/api/v1/stripe/webhook` and put the signing secret in
  `STRIPE_WEBHOOK_SECRET`. That path is deliberately exempt from rate limiting and
  from request buffering, because Stripe signs the exact bytes it sends.
- If OAuth is enabled, add `https://fibicommunity.org` to the authorised origins
  in the Google and Apple consoles.

## 8. Schedule backups

Do this on day one, not after the first incident. The database and the uploads
volume are both needed for a working restore — a database-only backup gives you
a catalogue full of broken images.

```bash
sudo mkdir -p /var/backups/fibi
crontab -e
```

Add:

```cron
15 3 * * * /opt/fibi/deploy/backup.sh >> /var/log/fibi-backup.log 2>&1
```

Then run it once by hand to confirm it works, and copy the output off the VPS —
a backup stored only on the machine it protects is not a backup:

```bash
./deploy/backup.sh
```

## 9. Cloudflare (if you use it)

Once the certificate is live and the site works direct-to-origin, work through
[CLOUDFLARE.md](CLOUDFLARE.md). It covers the DNS records, Full (strict) TLS, the
cache and WAF rules this app needs (the Stripe webhook must be exempted from bot
challenges or payments go unrecorded), and finally locking the origin's firewall
to Cloudflare's ranges with `deploy/ufw-cloudflare.sh`.

---

## Routine operations

**Deploy a new version**

```bash
cd /opt/fibi
git pull
docker compose up -d --build
```

Migrations run automatically on backend start. Express drains in-flight requests
on SIGTERM, so a redeploy does not drop live responses.

**Logs**

```bash
docker compose logs -f backend        # or proxy / frontend / postgres / certbot
```

Logs rotate at 10 MB × 5 files per service, so they cannot fill the disk.

**Back up** — `deploy/backup.sh` dumps the database *and* the uploads volume,
verifies neither came out empty, and prunes anything older than 14 days. Run it
from cron (section 8), not by hand:

```bash
./deploy/backup.sh                      # default: /var/backups/fibi
RETAIN_DAYS=30 ./deploy/backup.sh /mnt/backups
```

**Restore the database**

```bash
gunzip -c /var/backups/fibi/db-2026-08-12-0315.sql.gz \
  | docker compose exec -T postgres psql -U fibi -d fibi
```

**Restore uploaded images**

```bash
docker run --rm -v fibi_backend_uploads:/data -v /var/backups/fibi:/in alpine \
  tar xzf /in/uploads-2026-08-12-0315.tar.gz -C /data
```

Rehearse a restore into a throwaway `docker compose -p fibirestore` stack at
least once. An untested backup is a guess.

**Certificate renewal** is automatic: certbot checks twice a day and renews inside
the 30-day expiry window; the proxy reloads every 6 hours to pick up new files.
To confirm renewal works:

```bash
docker compose run --rm certbot renew --dry-run
```

---

## Troubleshooting

**`init-letsencrypt.sh` fails to validate the domain.** DNS is the usual cause.
Confirm `dig +short fibicommunity.org` returns this server's IP, and that ports 80
and 443 are open (`ufw status`). Hostinger's own firewall panel is separate from
`ufw` — check both.

**Backend restarts in a loop.** `docker compose logs backend`. Almost always
`DATABASE_URL`: the password must match `POSTGRES_PASSWORD`, and any of
`@ : / ? # [ ]` in it must be percent-encoded.

**Browser shows a stale version after deploy.** Expected only if `index.html` got
cached; it is served `no-store`, and the hashed files under `/assets/` change name
whenever content changes. A hard reload confirms.

**Image uploads fail with EACCES.** The `backend_uploads` volume was created before
the Dockerfile set ownership on `/app/uploads`. Recreate it — this deletes uploaded
images, so back them up first:

```bash
docker compose down && docker volume rm fibi_backend_uploads && docker compose up -d
```

---

## Notes on the security posture

- **HSTS is set to one year** with `includeSubDomains`. Browsers that have seen
  that header will refuse plain HTTP for the domain until it expires. That is the
  point, but it means **do not put the site on HTTPS-only headers until you are
  confident the certificate renews**. `preload` is deliberately not set: submitting
  to the preload list is effectively irreversible.
- **Rate limits** are 10 requests/minute per IP on `/api/v1/auth/` (login and
  registration are the brute-force surface) and 20 r/s on the rest of the API.
  Raise them in `deploy/nginx.conf` if legitimate traffic hits the ceiling; the
  `429` responses will show up in `docker compose logs proxy`.
- **`TRUST_PROXY=1`** tells Express to trust exactly one hop of `X-Forwarded-For`.
  Leave it at 1 even behind Cloudflare: the edge proxy *overwrites*
  `X-Forwarded-For` with the single client address it has already resolved, so
  anything a client sends in that header is discarded and Express only ever has
  one hop to trust. Raising it lets clients forge their own IP.
- **Client IP behind Cloudflare.** `CLOUDFLARE=true` makes nginx trust
  `CF-Connecting-IP`, but only from Cloudflare's published ranges
  (`deploy/cloudflare-realip.conf`). Left `false` while proxying is on, every
  visitor shares a rate-limit bucket with everyone else behind the same edge node
  — the limits become both useless and disruptive. Refresh the ranges with
  `deploy/update-cloudflare-ips.sh` if Cloudflare ever changes them.
- **A CSP is prepared but not enabled.** `deploy/nginx.conf` carries a
  Content-Security-Policy matching the origins this app loads, commented out with
  a Report-Only rollout path. Turning it on blind would break sign-in or checkout
  in a way you would only find out about from a user.
- **No container mounts the Docker socket.** Certificate reloads are handled inside
  the proxy container instead, so nothing in the stack holds root-equivalent
  control of the host.
- **`.env` holds live secrets** and is gitignored. If a secret is ever committed,
  rotate it rather than just deleting the file — git history keeps it.
- **A pre-commit guard blocks credentials from entering git.** Enable it once per
  clone; git will not run hooks from a fresh checkout otherwise:

  ```bash
  git config core.hooksPath .githooks
  ```

  It refuses any commit that stages a `.env`, a private key, a live API key, a
  database URL with a real password, or anything under `node_modules/` or
  `dist/`. `--no-verify` bypasses it, which is worth knowing and not worth using:
  once pushed, the only real remedy for a leaked secret is rotating it.
