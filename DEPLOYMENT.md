# Deploying FIBI to the Hostinger VPS (fibicommunity.org)

The whole stack runs in Docker. Nothing but Docker itself is installed on the host,
so the VPS stays reproducible and a rebuild never depends on hand-made host config.

**fibicommunity.org is behind Cloudflare.** Cloudflare terminates TLS for
visitors and forwards to this VPS over HTTPS, verifying the origin's own
Let's Encrypt certificate (`Full (strict)`). The DNS records, edge settings and
WAF rules live in [CLOUDFLARE.md](CLOUDFLARE.md); this document covers the server.

```
                       ┌──────────────┐
  Internet ──────────► │  Cloudflare  │  edge TLS, WAF, DDoS, caching
                       └──────┬───────┘
                              │ HTTPS, origin cert verified
                  :80  ┌──────▼──────────────────────────┐
                       │  proxy (nginx)                  │  TLS, HSTS, rate limits
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

## How to read this guide

Every step that has a script shows **both** paths:

- **Scripted** — the `deploy/*.sh` command. Shorter, and it checks its own
  preconditions.
- **Manual** — exactly what the script does, as individual commands. Use this
  when you want to see each step, when a script fails halfway and you need to
  resume from the middle, or when you are adapting the deployment to a different
  host.

They are equivalent. The scripts add guard rails — a DNS sanity check before
burning a Let's Encrypt attempt, a partial-file guard on backups — that the
manual commands leave to you.

Throughout: `$DOMAIN` is `fibicommunity.org`. If you are following along with
`.env` loaded (`set -a; . ./.env; set +a`) the manual commands work as written.

---

## 1. DNS (Cloudflare)

Already done — the domain is on Cloudflare's nameservers with the apex and `www`
records in place. [CLOUDFLARE.md §1–2](CLOUDFLARE.md) documents exactly what was
created and why there is no `api.` subdomain.

Confirm before continuing:

```bash
dig +short NS fibicommunity.org      # two *.ns.cloudflare.com servers
dig +short fibicommunity.org         # Cloudflare edge IPs (proxied) or the VPS IP (grey)
```

**One thing to check now:** if you have not yet issued the origin certificate
(step 5), the `@` and `www` records must be temporarily set to **DNS only**
(grey cloud). Let's Encrypt validates against the origin over plain HTTP, and
the proxy in front of it is the usual cause of a failed first issuance. You
switch them back to Proxied in step 7.

## 2. Prepare the server

SSH in as root, then:

```bash
# Docker Engine + compose plugin
curl -fsSL https://get.docker.com | sh
systemctl enable --now docker

# Firewall: SSH and web only. Ports 80/443 are open to the world for now —
# step 9 narrows them to Cloudflare once everything is verified working.
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
openssl rand -hex 32                                 # JWT_SECRET
openssl rand -base64 32 | tr -d '/+=' | head -c 32   # POSTGRES_PASSWORD
```

`POSTGRES_PASSWORD` must also appear inside `DATABASE_URL` — they are the same
password in two places. Keeping it alphanumeric avoids percent-encoding problems
in the URL.

Settings that matter for this deployment:

| Variable | Value | Why |
|----------|-------|-----|
| `CLOUDFLARE` | `true` | Makes nginx trust `CF-Connecting-IP` from Cloudflare's ranges. Safe to set now even while the records are grey-clouded — the trust list simply never matches until traffic actually arrives via Cloudflare. |
| `TRUST_PROXY` | `1` | Stays 1 behind Cloudflare. The proxy overwrites `X-Forwarded-For` with the one address it has already resolved. |
| `VITE_API_URL` | *(empty)* | The proxy serves the app and the API from one origin, so the browser uses relative `/api/v1/...` URLs and never triggers a CORS preflight. |
| `FRONTEND_URL` | `https://fibicommunity.org` | Scheme + host, no trailing slash. The backend refuses to start in production without it. |

## 5. Issue the TLS certificate and start the stack

The ordering problem this solves: nginx will not start without a certificate on
disk, but Let's Encrypt cannot validate the domain until nginx is answering on
port 80. So a throwaway self-signed certificate goes in first, the stack starts,
the real certificate replaces it, and nginx reloads.

> Both DNS records must be **DNS only** (grey cloud) for this step.

### Scripted

```bash
./deploy/init-letsencrypt.sh
```

Rehearse first if you like — Let's Encrypt allows only 5 failed validations per
hostname per hour:

```bash
STAGING=1 ./deploy/init-letsencrypt.sh    # untrusted cert, no rate-limit risk
FORCE=1 ./deploy/init-letsencrypt.sh      # then issue the real one
```

### Manual

```bash
cd /opt/fibi
set -a; . ./.env; set +a          # load DOMAIN, CERTBOT_EMAIL, ...

# 5a. Create the named volumes. (Not `compose up --no-start` — that builds every
#     image first, which is several silent minutes on a fresh clone.)
docker volume create fibi_letsencrypt_certs
docker volume create fibi_certbot_webroot

# 5b. Plant a 1-day self-signed certificate so nginx can boot.
docker run --rm -v fibi_letsencrypt_certs:/etc/letsencrypt \
  --entrypoint /bin/sh certbot/certbot:latest -c "
    mkdir -p /etc/letsencrypt/live/$DOMAIN &&
    openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
      -keyout /etc/letsencrypt/live/$DOMAIN/privkey.pem \
      -out    /etc/letsencrypt/live/$DOMAIN/fullchain.pem \
      -subj '/CN=$DOMAIN' 2>/dev/null"

# 5c. Build and start everything.
docker compose up -d --build

# 5d. Wait until the proxy answers. A cold start takes a couple of minutes:
#     the proxy waits on the backend healthcheck, the backend waits on Postgres
#     and then runs migrations. Repeat until this returns a response.
curl -sI http://localhost/ | head -1

# 5e. Delete the placeholder — certbot will not overwrite a certificate it
#     did not issue, and would otherwise write to a "-0001" directory that
#     nginx is not configured to read.
docker run --rm -v fibi_letsencrypt_certs:/etc/letsencrypt \
  --entrypoint rm certbot/certbot:latest -rf \
  "/etc/letsencrypt/live/$DOMAIN" \
  "/etc/letsencrypt/archive/$DOMAIN" \
  "/etc/letsencrypt/renewal/$DOMAIN.conf"

# 5f. Request the real certificate over the ACME challenge the proxy is serving.
#     Add --staging to rehearse without touching the rate limit.
docker run --rm \
  -v fibi_letsencrypt_certs:/etc/letsencrypt \
  -v fibi_certbot_webroot:/var/www/certbot \
  certbot/certbot:latest certonly \
  --webroot -w /var/www/certbot \
  -d "$DOMAIN" -d "www.$DOMAIN" \
  --email "$CERTBOT_EMAIL" \
  --agree-tos --no-eff-email \
  --rsa-key-size 4096 \
  --non-interactive --keep-until-expiring

# 5g. nginx reads certificates once at startup, so load the new one.
docker compose exec -T proxy nginx -s reload
```

> **Do not reload nginx between 5e and 5f.** There is no certificate on disk in
> that window. The running proxy keeps serving — it loaded the placeholder into
> memory at startup and never re-reads the file — but a reload makes it parse the
> config afresh, that parse fails, and you are left staring at
> `cannot load certificate ... no such file` while the site is, confusingly, still
> up. If it happens: carry on with 5f, then reload. The certificate arriving is
> what fixes it.

## 6. Verify the origin

Test the VPS directly, before Cloudflare is in front of it. `--resolve` forces
the connection to this machine regardless of what DNS says, so these results are
about the origin and nothing else:

```bash
docker compose ps                                   # all services Up / healthy

curl -sI --resolve fibicommunity.org:80:127.0.0.1 \
     http://fibicommunity.org/ | head -1            # 301 -> https
curl -sI --resolve fibicommunity.org:443:127.0.0.1 \
     https://fibicommunity.org/ | head -1           # 200, valid cert
curl -sI --resolve www.fibicommunity.org:443:127.0.0.1 \
     https://www.fibicommunity.org/ | head -1       # 301 -> apex
curl -s  --resolve fibicommunity.org:443:127.0.0.1 \
     https://fibicommunity.org/api/v1/projects      # JSON
```

Security headers should be present on every response:

```bash
curl -sI --resolve fibicommunity.org:443:127.0.0.1 https://fibicommunity.org/ \
  | grep -iE 'strict-transport|x-frame|x-content|referrer|permissions'
```

Then create the first admin account:

```bash
docker compose exec backend npm run create-admin
```

## 7. Put Cloudflare back in front

1. Cloudflare → DNS → Records: set `@` and `www` to **Proxied** (orange cloud).
2. Confirm `CLOUDFLARE=true` in `.env`, then `docker compose up -d`.
3. Work through [CLOUDFLARE.md §4–5](CLOUDFLARE.md) — `Full (strict)` encryption,
   the edge certificate settings, the cache-bypass rule for `/api/`, and the WAF
   skip rule for the Stripe webhook paths.

That last one is not optional if you take payments: Bot Fight Mode issues JS
challenges that Stripe's servers cannot solve, so webhooks fail silently and a
payment succeeds at Stripe while your database never records it.

Confirm real client IPs are now reaching the origin:

```bash
docker compose logs --tail=20 proxy
```

The leading address on each line should be a visitor's IP. If you see
`172.7x.x.x` or other Cloudflare ranges, `CLOUDFLARE=true` is missing from `.env`
or the stack was not restarted.

## 8. Schedule backups

Do this on day one, not after the first incident. The database and the uploads
volume are **both** needed for a working restore — a database-only backup gives
you a catalogue full of broken images.

### Scripted

```bash
sudo mkdir -p /var/backups/fibi
./deploy/backup.sh                       # run once by hand to confirm it works

crontab -e
```

Add:

```cron
15 3 * * * /opt/fibi/deploy/backup.sh >> /var/log/fibi-backup.log 2>&1
```

### Manual

```bash
cd /opt/fibi
set -a; . ./.env; set +a
DEST=/var/backups/fibi
STAMP=$(date +%F-%H%M)
mkdir -p "$DEST" && chmod 700 "$DEST"

# 8a. Database.
docker compose exec -T postgres pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
  | gzip > "$DEST/db-$STAMP.sql.gz"

# 8b. Uploaded images — these live on a Docker volume, not in Postgres.
docker run --rm -v fibi_backend_uploads:/data:ro alpine \
  tar czf - -C /data . > "$DEST/uploads-$STAMP.tar.gz"

chmod 600 "$DEST"/db-$STAMP.sql.gz "$DEST"/uploads-$STAMP.tar.gz

# 8c. Check neither came out empty. A gzip of nothing is about 20 bytes, and a
#     truncated dump is only discovered during a restore, when it is too late.
ls -l "$DEST"/db-$STAMP.sql.gz "$DEST"/uploads-$STAMP.tar.gz

# 8d. Prune.
find "$DEST" -name 'db-*.sql.gz'      -mtime +14 -delete
find "$DEST" -name 'uploads-*.tar.gz' -mtime +14 -delete
```

Copy the output off the VPS. A backup stored only on the machine it protects is
not a backup.

## 9. Lock the origin to Cloudflare

Until this is done, anyone who learns the VPS IP can connect straight to it and
bypass every Cloudflare rule. Do it only once steps 5–8 are verified working and
the records are Proxied.

### Scripted

```bash
sudo ./deploy/ufw-cloudflare.sh
```

### Manual

```bash
# 9a. Never lose SSH.
sudo ufw allow OpenSSH

# 9b. Allow 80/443 from Cloudflare only.
for cidr in $(curl -fsS https://www.cloudflare.com/ips-v4) \
            $(curl -fsS https://www.cloudflare.com/ips-v6); do
  sudo ufw allow proto tcp from "$cidr" to any port 80  comment 'cloudflare'
  sudo ufw allow proto tcp from "$cidr" to any port 443 comment 'cloudflare'
done

# 9c. Remove the world-open rules from step 2.
sudo ufw delete allow 80/tcp
sudo ufw delete allow 443/tcp

sudo ufw reload && sudo ufw status numbered
```

Verify the boundary actually holds — the hostname must work, the raw IP must not:

```bash
curl -sI https://fibicommunity.org | head -1                 # 200
curl -sI --max-time 8 http://<VPS_IP>/ ; echo "exit=$?"      # must time out
```

If the second command answers, the origin is still exposed.

## 10. Post-deploy checks

- Grade the edge at <https://www.ssllabs.com/ssltest/?d=fibicommunity.org> — expect A.
- **Stripe:** set the webhook endpoint to
  `https://fibicommunity.org/api/v1/stripe/webhook` and put the signing secret in
  `STRIPE_WEBHOOK_SECRET`. That path is exempt from rate limiting and from request
  buffering at the origin, because Stripe signs the exact bytes it sends — and it
  needs the Cloudflare WAF skip rule from step 7.
- **OAuth:** add `https://fibicommunity.org` to the authorised origins in the
  Google and Apple consoles.
- Confirm renewal works before you need it: `docker compose run --rm certbot renew --dry-run`.

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

**Back up** — see step 8 for both forms.

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

```bash
docker compose run --rm certbot renew --dry-run     # confirm it works
docker compose run --rm certbot renew               # force a real check
docker compose exec -T proxy nginx -s reload        # load a new cert immediately
```

Cloudflare does not redirect `/.well-known/acme-challenge/`, so renewals reach
the origin through the proxy without any change to the DNS records.

**Refresh Cloudflare's IP ranges** — only needed if Cloudflare changes them,
which is rare. The nginx trust list and the firewall must agree, so do both:

```bash
./deploy/update-cloudflare-ips.sh && docker compose restart proxy
sudo ./deploy/ufw-cloudflare.sh
```

Manually, that means replacing the `set_real_ip_from` lines in
`deploy/cloudflare-realip.conf` with the contents of
<https://www.cloudflare.com/ips-v4> and <https://www.cloudflare.com/ips-v6>, one
`set_real_ip_from <cidr>;` per line, then restarting the proxy and redoing step 9.

---

## Troubleshooting

**Certificate issuance fails to validate the domain.** Almost always DNS or the
orange cloud. Confirm the records are set to **DNS only** during issuance, that
`dig +short fibicommunity.org` returns this server's IP, and that ports 80 and
443 are open (`ufw status`). Hostinger's own firewall panel is separate from
`ufw` — check both. If step 9 has already run, the ranges may have changed.

**Backend restarts in a loop.** `docker compose logs backend`. Almost always
`DATABASE_URL`: the password must match `POSTGRES_PASSWORD`, and any of
`@ : / ? # [ ]` in it must be percent-encoded.

**Cloudflare error 521, 526, or `ERR_TOO_MANY_REDIRECTS`.** These are edge-side
and each has a specific cause — see the troubleshooting section of
[CLOUDFLARE.md](CLOUDFLARE.md).

**Everyone is rate-limited at once.** `CLOUDFLARE=true` is missing from `.env`,
so nginx is keying its limits on Cloudflare edge IPs and every visitor shares a
bucket. Fix `.env` and `docker compose up -d`.

**Browser shows a stale version after deploy.** Expected only if `index.html` got
cached; it is served `no-store`, and the hashed files under `/assets/` change name
whenever content changes. Check that Cloudflare's Browser Cache TTL is set to
**Respect Existing Headers**, then hard reload. Purge the edge cache if needed.

**Image uploads fail with EACCES.** The `backend_uploads` volume was created before
the Dockerfile set ownership on `/app/uploads`. Recreate it — this deletes uploaded
images, so back them up first:

```bash
docker compose down && docker volume rm fibi_backend_uploads && docker compose up -d
```

---

## Notes on the security posture

- **HSTS is set to one year** with `includeSubDomains`, at the origin. Browsers
  that have seen that header will refuse plain HTTP for the domain until it
  expires. That is the point, but it means **do not rely on HTTPS-only headers
  until you are confident the certificate renews**. `preload` is deliberately not
  set: submitting to the preload list is effectively irreversible. Do not also
  enable HSTS in Cloudflare — it is not additive, and that UI makes `preload` a
  single click away.
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
  — the limits become both useless and disruptive.
- **The origin firewall is the boundary, not Cloudflare.** Cloudflare only
  protects traffic that goes through Cloudflare. Step 9 is what stops someone who
  has found the VPS IP from ignoring it entirely. Any DNS record left unproxied
  publishes that IP.
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
- **The Cloudflare account is now as sensitive as the SSH key** — it can repoint
  the domain at any server. Turn on two-factor authentication for it.
