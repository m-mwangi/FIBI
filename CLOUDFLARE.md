# Cloudflare setup for fibicommunity.org

Cloudflare sits in front of the VPS: it terminates TLS for visitors, absorbs
volumetric attacks, and hides the origin IP. The VPS still runs its own
Let's Encrypt certificate — Cloudflare talks to it over HTTPS and verifies it.
That is the "Full (strict)" mode below, and it is the only mode worth using:
the alternatives leave the Cloudflare↔origin leg either unencrypted or
unauthenticated.

Work through this in order. Sections 1–4 are required; 5–8 are hardening you
should not skip before taking real payments.

---

## 1. Move the domain onto Cloudflare's nameservers

The domain is registered at Hostinger. Cloudflare needs to serve its DNS.

1. Sign up at <https://dash.cloudflare.com> and choose **Add a site**.
2. Enter `fibicommunity.org` (apex only — no `www`, no `https://`).
3. Pick the **Free** plan. Everything in this document works on Free.
4. Cloudflare scans the existing DNS and shows what it found. **Check this list
   against Hostinger's DNS panel before continuing** — the scan is best-effort
   and quietly misses records. Anything missing here stops working the moment
   the nameservers change; the usual casualty is email (`MX`, and the `TXT`
   records that authorise senders).
5. Cloudflare shows two nameservers, e.g. `arya.ns.cloudflare.com` and
   `rob.ns.cloudflare.com`. Yours will differ — use the ones on your screen.
6. In **Hostinger → Domains → fibicommunity.org → DNS / Nameservers**, choose
   **Change nameservers → Use custom nameservers**, replace both entries with
   Cloudflare's, and save.
7. Wait for activation. Usually under an hour; the registrar can take up to 24.
   Cloudflare emails you and the dashboard shows **Active**.

Confirm from your laptop:

```bash
dig +short NS fibicommunity.org      # must list the two cloudflare.com servers
```

Do not continue until that returns Cloudflare's nameservers.

---

## 2. Create the DNS records

**Cloudflare → fibicommunity.org → DNS → Records.**

This deployment serves the site and the API from one origin, so it needs exactly
two records. Substitute your VPS's public IP for `203.0.113.10` — find it with
`curl -s https://api.ipify.org` on the server.

### Required

| Type    | Name  | Content            | Proxy status      | TTL  | What it does |
|---------|-------|--------------------|-------------------|------|--------------|
| `A`     | `@`   | `203.0.113.10`     | **DNS only** → later Proxied | Auto | `fibicommunity.org` — the site and `/api` |
| `CNAME` | `www` | `fibicommunity.org`| **DNS only** → later Proxied | Auto | `www.fibicommunity.org`, which the origin 301s to the apex |

Notes that matter:

- `@` means the apex (`fibicommunity.org` itself). Cloudflare displays it as the
  domain name once saved.
- Use a **CNAME** for `www`, not a second `A` record. Cloudflare flattens it, and
  the VPS IP then lives in exactly one place — so a server migration is a
  one-record change instead of two, with no window where the two disagree.
- **Start both as "DNS only" (grey cloud).** Section 3 issues the certificate,
  which requires Let's Encrypt to reach the origin directly. You switch both to
  Proxied (orange) in section 4.

### Not needed — and why

- **`api.fibicommunity.org`** — the proxy serves `/api/v1/...` from the same
  origin as the app. A separate API hostname would mean cross-origin requests, a
  CORS preflight before every call, and third-party cookie handling for the auth
  session. Only add one if you later split the API onto its own server; if you
  do, set `VITE_API_URL=https://api.fibicommunity.org` and add that origin to
  `FRONTEND_URL` handling in the backend.
- **`cdn.` / `assets.`** — the assets are fingerprinted and served with
  `immutable` caching through Cloudflare already.

### Optional

| Type    | Name      | Content             | Proxy    | When you want it |
|---------|-----------|---------------------|----------|------------------|
| `CNAME` | `staging` | `fibicommunity.org` or a second VPS IP | Proxied | A staging copy of the stack. Needs its own certificate — run `init-letsencrypt.sh` on that box with `DOMAIN=staging.fibicommunity.org`. Put it behind Cloudflare Access or HTTP basic auth so it is not indexed or crawled. |
| `A`     | `mail`    | mail server IP      | **DNS only** | Self-hosted mail. Must never be proxied — Cloudflare does not proxy SMTP, and proxying it leaks nothing useful while breaking delivery. |

> Any record pointing at the VPS that you leave **unproxied** publishes the
> origin IP and undoes the protection in section 6. That is the single most
> common way a Cloudflare-fronted origin gets found.

### Email records — do this even if you never send mail

With no sender policy, anyone can forge `@fibicommunity.org` in an email
header. For a site that takes investments, that is a live phishing risk against
your own users. These three `TXT` records cost nothing:

| Type  | Name     | Content | Purpose |
|-------|----------|---------|---------|
| `TXT` | `@`      | `v=spf1 -all` | No server is authorised to send mail as this domain. |
| `TXT` | `_dmarc` | `v=DMARC1; p=reject; rua=mailto:admin@fibicommunity.org` | Tells receivers to reject forgeries and where to report them. |
| `TXT` | `*._domainkey` | `v=DKIM1; p=` | Revokes any DKIM key for the domain. |

**If you do send mail** (transactional email, Google Workspace, Hostinger
mailboxes), use your provider's published SPF/DKIM values instead of the
`-all` / empty-key versions above, and keep the `MX` records from step 1.4.
Start DMARC at `p=none` and only move to `p=reject` once the reports are clean —
`p=reject` on a misconfigured domain silently destroys your own outbound mail.

---

## 3. Issue the origin certificate (grey cloud)

With both records still **DNS only**, on the VPS:

```bash
cd /opt/fibi
./deploy/init-letsencrypt.sh
```

Let's Encrypt validates over plain HTTP against the origin. Proxying at this
point is the usual cause of a failed first issuance, which is why the records
start grey.

Verify before going further:

```bash
curl -sI https://fibicommunity.org | head -1     # HTTP/2 200
curl -sI https://www.fibicommunity.org | head -1 # 301
```

---

## 4. Turn on proxying and TLS

**a. Switch both records to Proxied.** DNS → Records → edit `@` and `www`,
click the cloud so it turns orange, save.

**b. Tell the origin it is behind Cloudflare.** Without this, every visitor
shares a rate-limit bucket with everyone else arriving through the same
Cloudflare edge node, and your logs record Cloudflare's IPs instead of theirs:

```bash
cd /opt/fibi
nano .env            # set CLOUDFLARE=true
docker compose up -d
```

Leave `TRUST_PROXY=1`. The edge proxy resolves the real client IP itself and
hands Express a single trusted address, so the hop count does not change.

**c. SSL/TLS settings.** Cloudflare → **SSL/TLS → Overview**:

| Setting | Value | Why |
|---------|-------|-----|
| Encryption mode | **Full (strict)** | Encrypts Cloudflare→origin *and* validates the origin's Let's Encrypt certificate. `Flexible` sends that leg in cleartext; `Full` encrypts but accepts any certificate, including an attacker's. |

Then **SSL/TLS → Edge Certificates**:

| Setting | Value | Why |
|---------|-------|-----|
| Always Use HTTPS | **On** | Redirects at the edge, before the request reaches you. |
| Minimum TLS Version | **TLS 1.2** | Matches `deploy/ssl-params.conf`. |
| Opportunistic Encryption | On | Free. |
| TLS 1.3 | On | Free, and one round trip faster. |
| Automatic HTTPS Rewrites | On | Fixes stray `http://` references in content. |
| HSTS | **Leave off** | The origin already sends it (`max-age=31536000; includeSubDomains`). Setting it in both places is not additive, and Cloudflare's UI makes it easy to enable `preload` — which is effectively irreversible for the domain and every subdomain. |

**d. Certificate renewals keep working.** Cloudflare does not redirect
`/.well-known/acme-challenge/` even with Always Use HTTPS on, so certbot's
renewal reaches the origin through the proxy. Prove it rather than assume it:

```bash
docker compose run --rm certbot renew --dry-run
```

If that ever fails, flip the two records to DNS only, run
`FORCE=1 ./deploy/init-letsencrypt.sh`, and flip them back.

---

## 5. Rules Cloudflare needs for this app

Two defaults will break things if left alone.

**a. Never cache the API.** Cloudflare's default cache is extension-based and
mostly leaves `/api/` alone, but a cached authenticated response served to the
wrong user is severe enough to rule out explicitly.

Caching → **Cache Rules** → *Create rule*:
- Name: `Bypass cache for API`
- Expression: `(starts_with(http.request.uri.path, "/api/"))`
- Cache eligibility: **Bypass cache**

**b. Never challenge Stripe.** Bot Fight Mode and the managed WAF issue JS
challenges that Stripe's servers cannot solve, so webhooks silently fail — and a
failed webhook means a payment that succeeded at Stripe but was never recorded
in your database.

Security → **WAF → Custom rules** → *Create rule*:
- Name: `Skip security for Stripe webhooks`
- Expression: `(http.request.uri.path eq "/api/v1/stripe/webhook") or (http.request.uri.path eq "/api/v1/investments/stripe/webhook")`
- Action: **Skip** → tick *All managed rules*, *Bot Fight Mode*, and
  *Rate limiting rules*

The origin still verifies every webhook's Stripe signature, so skipping the edge
checks on those two paths does not make them trusted — it just stops Cloudflare
from rejecting requests that only Stripe can produce.

**c. Optional: a login rate limit at the edge.** The origin already limits
`/api/v1/auth/` to 10 requests/minute per IP. A Cloudflare rate-limiting rule on
the same path stops that traffic before it costs you bandwidth:
- Expression: `(starts_with(http.request.uri.path, "/api/v1/auth/"))`
- Rate: 20 requests per minute per IP, action **Block**, duration 10 minutes

Keep the edge limit looser than the origin's so the origin stays the tighter of
the two and you never have to guess which one produced a 429.

---

## 6. Lock the origin to Cloudflare

Until you do this, anyone who learns the VPS IP can bypass every rule above by
connecting to it directly. Once sections 1–5 are verified working:

```bash
sudo ./deploy/ufw-cloudflare.sh
```

It allows 80/443 only from Cloudflare's published ranges and leaves SSH alone.
Confirm the boundary actually holds:

```bash
curl -sI https://fibicommunity.org | head -1                    # 200
curl -sI --max-time 8 http://<VPS_IP>/ ; echo "exit=$?"         # must time out
```

If the second command answers, the origin is still exposed.

---

## 7. Recommended dashboard settings

| Section | Setting | Value |
|---------|---------|-------|
| Security → Settings | Security Level | Medium |
| Security → Settings | Bot Fight Mode | On (the rule in 5b protects Stripe) |
| Security → Settings | Browser Integrity Check | On |
| Speed → Optimization | Brotli | On |
| Speed → Optimization | Early Hints | On |
| Network | HTTP/2, HTTP/3 (QUIC), 0-RTT | On, On, **Off** |
| Network | WebSockets | On |
| Network | IP Geolocation | On |
| Caching | Browser Cache TTL | **Respect Existing Headers** |
| Scrape Shield | Email Address Obfuscation | On |

Two of those are deliberate:

- **0-RTT off.** It lets an attacker replay the first request of a resumed
  connection. Harmless for a static site; not for one with state-changing API
  calls.
- **Browser Cache TTL = Respect Existing Headers.** The app depends on
  `index.html` being `no-store` while `/assets/*` is `immutable`. Overriding
  that at the edge pins visitors to a stale bundle after each deploy.

Also turn on **My Profile → Authentication → Two-Factor Authentication**. The
Cloudflare account can repoint the domain at any server; it is now as sensitive
as the SSH key.

---

## 8. Verify the whole path

```bash
# TLS terminates at Cloudflare
curl -sI https://fibicommunity.org | grep -i '^server:'          # cloudflare

# HTTP redirects, www canonicalises
curl -sI http://fibicommunity.org      | head -1                 # 301
curl -sI https://www.fibicommunity.org | head -1                 # 301

# The API answers and is not cached
curl -sI https://fibicommunity.org/api/v1/projects | grep -i 'cf-cache-status'  # BYPASS/DYNAMIC

# Security headers survive the proxy
curl -sI https://fibicommunity.org | grep -iE 'strict-transport|x-frame|x-content'
```

On the server, confirm real client IPs are arriving — this is the check that
tells you `CLOUDFLARE=true` actually took effect:

```bash
docker compose logs --tail=20 proxy
```

The leading address on each line should be a visitor's IP, not `172.7x.x.x` or
another Cloudflare range. If you see Cloudflare addresses, `CLOUDFLARE=true` is
missing from `.env` or the stack was not restarted after adding it.

Finally, grade the edge at
<https://www.ssllabs.com/ssltest/?d=fibicommunity.org> — expect **A** or better.

---

## Troubleshooting

**`ERR_TOO_MANY_REDIRECTS`.** The encryption mode is `Flexible`. Cloudflare
sends HTTP to the origin, the origin redirects to HTTPS, and the loop repeats.
Set it to **Full (strict)**.

**Error 521 (web server is down).** Cloudflare cannot reach the origin. Either
the stack is down (`docker compose ps`) or `ufw-cloudflare.sh` ran while the
records were still grey-clouded, or Cloudflare's ranges changed since you ran
it — re-run `./deploy/update-cloudflare-ips.sh` and then the ufw script.

**Error 526 (invalid SSL certificate).** Full (strict) is on but the origin
certificate is expired or self-signed. On the VPS:
`docker compose run --rm certbot certificates`. If it still shows the temporary
self-signed placeholder, issuance never completed — re-run
`FORCE=1 ./deploy/init-letsencrypt.sh` with the records set to DNS only.

**Everyone is rate-limited at once.** `CLOUDFLARE=true` is not set, so nginx is
keying its limits on Cloudflare edge IPs. Fix `.env` and
`docker compose up -d`.

**Uploads fail at around 100 MB.** That is Cloudflare's Free-plan request body
cap, and it is below nothing you currently allow — nginx caps request bodies at
25 MB and multer at 10 MB per image, so a genuine 100 MB failure means one of
those limits was raised without raising the other.
