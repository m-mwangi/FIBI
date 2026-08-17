# SEO playbook — what's left

The engineering is done and deployed ([SEO.md](SEO.md) documents the system). What
remains is account setup, information only FIBI holds, and content targeting.

Keyword sections below are **hypotheses grounded in the live project inventory, not
measured volumes.** No keyword tool was run. Validate every term in Google Keyword
Planner and, once Search Console has 4–6 weeks of data, against real impressions —
that data beats any guess made here.

---

## 1. Blocking now

### Missing assets — every share renders blank

All three are referenced by shipped metadata and all three return **404**:

| Asset | Referenced by | Spec |
| --- | --- | --- |
| `/images/og-default.jpg` | `og:image` + `twitter:image` on every page | 1200×630 JPG/PNG |
| `/images/logo-512.png` | `Organization` schema `logo` | 512×512 PNG, square |
| `/favicon.ico` | browsers request it regardless | 32×32 ICO |

Drop them in `fibi-frontend/public/images/` and rebuild. Until then every WhatsApp,
LinkedIn and X share of the site shows no image, and Google has no logo to attach to the
brand — which matters more than usual here, because the brand name is contested (§2).

Project pages already use their own image, so this affects the static pages.

### Search Console + Bing

1. **Google Search Console** — verify by DNS TXT through Cloudflare (fastest, survives
   redeploys). Submit `https://fibicommunity.org/sitemap.xml`. It is a sitemap index, so
   both children get picked up automatically.
2. **Bing Webmaster Tools** — import the GSC property rather than re-verifying. Worth
   doing on its own merits: Bing's index is what ChatGPT search reads.
3. After ~72h, check **Pages → Not indexed** in GSC. Expect `noindex` exclusions for the
   auth and admin routes — that is the system working, not an error.
4. Run the homepage and `/faq` through the
   [Rich Results Test](https://search.google.com/test/rich-results) to confirm
   `Organization`, `FAQPage` and `BreadcrumbList` parse.

### The Cloudflare decision

Cloudflare Managed Content currently prepends `Disallow: /` for `GPTBot`, `ClaudeBot`,
`Google-Extended`, `CCBot` and others, contradicting the repo's `robots.txt`. Two
coherent options — the current state is neither:

- **Want AI citation** (the reason `/insights` exists): turn Managed Content off in
  Cloudflare → AI Crawl Control. The repo's policy then applies.
- **Don't want it**: set `disallowAiCrawlers: true` in `scripts/sitemap.mjs` so the file
  stops contradicting itself.

Keep the `Content-Signal: search=yes, ai-train=no, use=reference` line either way — it
reserves training rights while permitting citation, which is the defensible middle.

### Google Business Profile

Needs the real registered address (§3). Primary category: *Investment service* or *Real
estate agency*. This is the strongest single lever on the brand-confusion problem.

---

## 2. The brand problem

`FIBI` collides in search with FIBICC, "families in business" communities, and a medical
registry. Assume **no** branded search equity today.

Fixes, in order of leverage: Google Business Profile → consistent name/address/phone
everywhere → owned social profiles listed in `sameAs` (`seo/config.ts`) → Kenyan
directory listings.

Use the fuller **"FIBI Community"** in profile names and directories. The bare acronym is
too short to disambiguate.

---

## 3. Information only FIBI can supply

Recap of [SEO.md §6](SEO.md) — unchanged, and gating both trust and several pages:

- `seo/config.ts` → `UNVERIFIED`: address, email, phone, registration number, social
  profiles, **regulatory status**
- `content/company.ts` → `TEAM` (highest-value trust signal on a YMYL domain),
  `MILESTONES`, `TRACK_RECORD`
- `content/faq.ts` → 9 answers flagged `needsCompanyReview`; the **fee** and **custody**
  answers must not ship as written
- `pages/legal/` → Terms and Privacy need counsel, then flip `LEGAL_DRAFT`

---

## 4. Keywords

### Tier A — Brand (own these)

`FIBI` · `FIBI Kenya` · `FIBI Community` · `fibicommunity` · `FIBI land investment`

Nothing to write; §2 is the work.

### Tier B — Category head terms (hard, 6–18 months)

`fractional land ownership Kenya` · `land investment Kenya` · `invest in land Kenya` ·
`fractional real estate Kenya` · `land investment platform Kenya` ·
`group land buying Kenya` · `collective land investment Kenya`

**Kenya-specific and under-served — prioritise these:**

- `chama land investment` · `how chamas buy land` · `chama investment groups Kenya`
- `SACCO land investment`

Chamas are how group investing actually happens in Kenya. The whole product is a
digital chama for land, and none of the current copy uses the word. This is the single
biggest vocabulary gap between the site and its market.

- `diaspora land investment Kenya` · `buying land in Kenya from abroad` — Kenyans abroad
  are a high-value segment with a specific fear (being defrauded remotely) the existing
  title-verification guide already answers.

### Tier C — Location (highest conversion, lowest competition)

Drawn from live inventory. Coastal and agricultural split cleanly:

| Cluster | Counties in inventory | Terms |
| --- | --- | --- |
| Coastal | Kwale, Kilifi, Mombasa | `Vipingo land for sale` · `Mtwapa land` · `Msambweni land` · `Kwale land investment` · `Diani land` · `coastal land investment Kenya` · `beach plots Kenya` |
| SEZ | Mombasa | `Dongo Kundu SEZ investment` · `Dongo Kundu land` |
| Central | Murang'a, Kirinyaga, Nyeri | `Makuyu land for sale` · `Murang'a land` · `Kirinyaga land investment` |
| Rift/West | Kericho, Kisumu, Kajiado | `Koru land` · `Muhoroni sugarcane farm` · `Magadi land` · `Kajiado land for sale` |

`Dongo Kundu SEZ` deserves its own page — it is a live government infrastructure programme
with independent search demand, and FIBI holds 940 acres there.

### Tier D — Informational / GEO

Already published: fractional ownership · title verification · freehold vs leasehold.

Highest-value gaps, roughly in priority order:

1. `how to buy land in Kenya` — the category's biggest informational query
2. `how to avoid land fraud in Kenya` — high intent, and answering it well *is* the trust
   argument for using a platform
3. `land buying process in Kenya step by step` — `HowTo` schema applies
4. `Ardhisasa land search how to` — procedural, currently poorly served
5. `stamp duty on land in Kenya` — concrete, citable, 4% urban / 2% rural
6. `land rates vs land rent Kenya` — routinely confused
7. `land succession Kenya` / `transfer land to family Kenya`
8. `is land a good investment in Kenya`
9. `avocado farming investment Kenya` — matches the Mt Kenya project; live export topic
10. `sugarcane farming profitability Kenya` — matches Muhoroni and Koru
11. `eco-lodge investment Kenya` — matches Kirinyaga

Adding one is appending to `src/app/content/insights.ts`; routing, `Article` schema and
the sitemap follow automatically.

### Tier E — Comparison

`best land investment companies in Kenya` · `land buying companies Kenya reviews` ·
`fractional land investment vs REIT Kenya`

The incumbents are **Optiven**, **Username Investments** and **Fanaka Real Estate**. You
will not outrank them on brand terms. The realistic play is being *included* in the
third-party listicles that already rank for "best land companies Kenya" — which is
outreach, not on-page work.

---

## 5. The biggest content gap: no landing pages

Project pages are ephemeral — they fund, close, and stop being commercially relevant.
Ranking authority earned by `/projects/<uuid>` largely dies with the project. There is
currently **nothing durable** between the generic `/projects` list and individual
listings.

Build persistent pages that outlive any single project:

- **By location** — `/land-investment/kwale`, `/land-investment/kilifi`,
  `/land-investment/dongo-kundu`
- **By category** — `/land-investment/coastal`, `/land-investment/agricultural`,
  `/land-investment/eco-lodge`

Each: a genuine guide to investing in that place or asset class, plus a live list of
current FIBI projects there. Targets Tier C, accumulates authority permanently, and
gives closed projects somewhere to redirect.

This is the highest-ROI remaining content work.

---

## 6. Also worth doing

- **Main navigation** still doesn't link How it works, Insights or About — only the
  footer does. Nav links carry more weight and drive discovery. It is a design decision,
  which is why it was left alone.
- **Bundle: 1.29 MB in one chunk.** LCP/INP are ranking factors; this is the largest
  remaining technical drag. Route-level code splitting is the fix.
- **Hydration** has not been checked in a browser. One DevTools pass on a prerendered
  page, watching for hydration warnings.
- **Rebuild after deleting a project** — its prerendered file otherwise serves stale
  content to non-JS crawlers until the next deploy.

---

## 7. Measurement

**Weekly:** GSC impressions/clicks by query; new terms appearing; coverage errors.

**Monthly:** rankings for the Tier C location terms (they should move first — lowest
competition, and the inventory genuinely matches the query).

**AI visibility** — no reliable tooling exists; do it manually. Once a month, ask
ChatGPT, Claude, Gemini and Perplexity:

- "How does fractional land ownership work in Kenya?"
- "How do I verify a land title in Kenya?"
- "What are the best ways to invest in land in Kenya?"

Record whether FIBI is cited, paraphrased, or absent. That is the GEO scoreboard, and it
will stay at zero for the AI engines while Cloudflare blocks their crawlers (§1).

**Expectations:** informational pages move in 4–8 weeks. Commercial head terms on a YMYL
domain with no backlink profile take 6–18 months, and are gated on §3 far more than on
anything technical.
