# SEO & GEO

How search and answer-engine visibility work in this codebase: what is built, what is
blocked on information only FIBI has, and what happens off the repo.

The starting position was that `fibicommunity.org` served an empty `<div id="root">` to
every crawler. Googlebot renders JavaScript on a deferred second pass; GPTBot,
PerplexityBot and ClaudeBot do not run it at all. The site was invisible to the second
group entirely and slow to index for the first.

---

## 1. Rendering — how pages become crawlable

The app stays a client-rendered Vite SPA. Public routes are **prerendered to static HTML
at build time** instead of being migrated to a server framework.

```
npm run build
├── build:client   vite build                → dist/ (client bundle, empty shell)
├── build:ssr      vite build --ssr          → dist-ssr/entry-server.js
├── prerender      node scripts/prerender.mjs → dist/<route>/index.html
└── sitemap        node scripts/sitemap.mjs   → dist/sitemap.xml, dist/robots.txt
```

`scripts/prerender.mjs` renders each route through `react-dom/server` and splices the
markup and `<head>` into the built shell. No headless browser is involved — every browser
API the app touches sits inside an effect or an event handler, and `renderToString` runs
neither.

**The build fails if a route renders blank or without a `<Seo>` block.** Shipping a silent
blank prerender would restore the original problem while looking fixed.

### Files

| File | Role |
|---|---|
| `src/entry-server.tsx` | SSR render entry. Not shipped to browsers. |
| `src/app/routeConfig.tsx` | Route tree, importable from Node. |
| `src/app/routes.tsx` | Browser router only — calls `window.history`. |
| `src/app/seo/config.ts` | Site constants **and the unverified-facts block**. |
| `src/app/seo/Seo.tsx` | Per-page head. One per page. |
| `src/app/seo/seoStore.ts` | SSR head collection + client-side head updates. |
| `src/app/seo/schema.ts` | JSON-LD builders. |
| `src/app/seo/publicRoutes.ts` | What is crawlable and what belongs in the sitemap. |
| `src/app/seo/prerenderData.ts` | Seeds project data into prerender and hydration. |

### Project detail pages

`/projects/:id` loads its project in an effect, so it would otherwise prerender as a
spinner. The build fetches the live project list and seeds each render, then embeds the
payload so the first client render matches the server markup and hydration holds.

Set the API URL or the pages are skipped:

```bash
PRERENDER_API_URL=https://api.fibicommunity.org npm run build
```

Without it the build still succeeds and warns — project pages stay client-only and remain
invisible to non-JS crawlers.

### Soft 404s

`nginx.conf` previously answered **every** URL with `200` and the SPA shell, so `/anything`
was indexable. It now serves prerendered files directly, rewrites known client routes to
the shell, and returns a real `404` (bodied by `dist/404.html`) for everything else.

Verified against `nginx:alpine` with the built `dist/`:

| URL | Status | Served as |
| --- | --- | --- |
| `/`, `/faq`, `/about`, `/insights/<slug>` | `200` | prerendered file, **no trailing-slash redirect** |
| `/projects/demo-1` | `200` | prerendered from API data |
| `/dashboard`, `/login`, `/admin/users` | `200` | client route, `noindex` |
| `/nonsense-page` | `404` | branded body, was `200` before |
| `/projects/<unknown-id>` | `200` | client route, `noindex` — see below |

Two details worth keeping: `try_files` uses `$uri/index.html` rather than `$uri/`, because
the directory form makes nginx 301 to a trailing slash and every prerendered page would
redirect against its own canonical. And the client-route pattern is a **prefix** match —
anchoring it with `$` made every admin section 404.

`/projects/<unknown-id>` returns `200` because nginx cannot know which ids are valid, and
404-ing all non-prerendered project URLs would break the site whenever the build cannot
reach the API. The page marks itself `noindex`, which is what keeps it out of the index.

The route pattern in `nginx.conf` must be kept in sync with `routeConfig.tsx`.

---

## 2. Metadata

Every page declares one `<Seo>`. It writes into the prerender sink on the server and
mutates `document.head` on client-side navigation — both paths, one declaration.

Authenticated surfaces get `noindex` centrally, not page by page:

- `ProtectedRoute` covers `/dashboard`, `/admin/*`, `/member-hub`, `/membership/apply`, `/membership/billing`
- `Root` covers the four auth screens
- `NotFound` and unresolvable project ids mark themselves

`robots.txt` also disallows those prefixes. Both are needed and they do different jobs:
robots.txt stops crawling, `noindex` removes a URL already indexed — and a disallowed URL
can never be recrawled to discover its `noindex`.

---

## 3. Structured data

One `@graph` per page: `Organization` and `WebSite` sitewide, plus `WebPage`,
`BreadcrumbList`, `FAQPage`, `HowTo` or `Article` as the page warrants.

Two deliberate constraints:

- **No `Product`/`Offer` on investment listings.** It is the obvious mapping and the wrong
  one — those types drive retail shopping results, invite price/availability scrutiny a
  land offering cannot satisfy, and presenting a regulated instrument as e-commerce stock
  is a compliance problem, not an SEO win.
- **Unverified facts are omitted, never guessed.** Anything empty in `UNVERIFIED` is
  dropped from the output rather than emitted blank.

FAQ schema is built only from entries not flagged `needsCompanyReview`, so a placeholder
answer is never asserted as a machine-readable claim.

---

## 4. Content

| Route | Purpose |
|---|---|
| `/about` | Who runs FIBI. **Team list is empty — see §6.** |
| `/contact` | Reachability. Renders only real details. |
| `/how-it-works` | The five-step process, with `HowTo` markup. |
| `/faq` | 17 questions across 5 categories. |
| `/insights` + 3 guides | Kenyan land law explainers. |
| `/legal/risk-disclosure` | Complete and publishable. |
| `/legal/terms`, `/legal/privacy` | Structure only — `noindex` while `LEGAL_DRAFT` is true. |

The guides exist because nobody searches "should I use FIBI". They search "how does
fractional land ownership work in Kenya" and "what is an official search" — and those are
the prompts an answer engine resolves by quoting whoever explained it most precisely.

### GEO conventions

- **Answer capsule.** Each page opens with a complete 40–80 word answer that survives being
  lifted out of context. Extractors take a passage; they do not read to the end.
- **Question-shaped headings**, matching how a prompt arrives.
- **Fact density.** Name the statute, the section, the figure. "Kenyan law requires" is not
  checkable; "Article 65 of the Constitution" is — and unattributed legal claims on a
  money page are exactly what quality raters mark down.
- **Visible `Last updated` dates**, not just metadata.

### Adding a guide

Append to `src/app/content/insights.ts`. Routing, prerendering, `Article` schema and the
sitemap entry all follow from the array — no other file needs touching.

---

## 5. YMYL — why this domain is judged harder

Land investment is "Your Money or Your Life". Google applies markedly stricter E-E-A-T
thresholds here, and the strongest available signals are the ones this repo cannot
manufacture: **named people with checkable credentials, a real registered address, and a
plainly stated regulatory position.**

Every such field is deliberately empty rather than invented. Fabricating a team bio or a
licence number for an investment platform is a misrepresentation to prospective investors,
which is a different category of problem from an unfinished page. The site ships honest
and incomplete instead of complete and false.

---

## 6. Blocked on FIBI — required before launch

Nothing below can be resolved from the codebase.

**`src/app/seo/config.ts` → `UNVERIFIED`**
- Registered office address, support email, phone
- Company registration number, founding date
- Owned social profile URLs (schema `sameAs`)
- **Regulator and licence number — or an explicit statement that there is none.** In Kenya,
  holding out as licensed without a licence is an offence under the Capital Markets Act.

**`src/app/content/company.ts`** — `TEAM` is empty, so the About page renders no team
section. This is the single highest-value trust signal available. Also empty: `MILESTONES`,
`TRACK_RECORD` (publish figures only with a stated basis and as-at date).

**`src/app/content/faq.ts`** — 9 entries flagged `needsCompanyReview` describe FIBI's own
commercial terms. They are visible on the page marked for review in development and
excluded from schema. The fee answer and the custody answer must not go live as written.

**`src/app/pages/legal/`** — Terms and Privacy need drafting by counsel. Flip `LEGAL_DRAFT`
in `draft.tsx` in the same change that lands the text; that makes them indexable and
re-enables their schema.

**Assets** — `public/images/og-default.jpg` (1200×630) and `public/images/logo-512.png`
are referenced by every page's metadata and do not exist yet.

---

## 7. Measurement

Set up before further changes land, so there is a baseline:

- **Google Search Console** — verify the domain, submit `/sitemap.xml`. Use URL Inspection →
  "View Crawled Page" to confirm prerendering independently.
- **Bing Webmaster Tools** — also feeds ChatGPT search.
- Analytics with a Kenyan-traffic view.

Blue-link rank alone no longer describes visibility. Track separately: whether ChatGPT,
Perplexity and Gemini mention FIBI for category prompts ("how to invest in land in Kenya",
"fractional land ownership Kenya"), and how often the guides are cited rather than just
paraphrased.

---

## 8. Off-page — the part that isn't code

Ranking ceiling on a YMYL domain is set by what others say about you, and `fibicommunity.org`
currently has close to no footprint. A search for the domain returns unrelated
organisations with similar names (FIBICC, "families in business" communities, a medical
registry). Brand disambiguation is the first job, not an afterthought.

1. **Consistent identity.** Same legal name, address and contact everywhere. `Organization`
   schema plus matching profiles is what separates FIBI from the name collisions.
2. **Google Business Profile** with the real Kenyan address.
3. **Kenyan directory and registry listings** — company registry, industry bodies,
   startup and property directories.
4. **Earned citations over raw backlinks.** GEO rewards being *quoted* by credible sources.
   The land-law guides are the asset to pitch to Kenyan property and financial press, not
   the commercial pages.
5. **Named authorship.** Once the team exists, attribute the guides to real people with
   credentials and add `author` to `articleSchema`. Anonymous finance content is discounted
   hard.

---

## 9. Known gaps

- **Bundle size: ~1.29 MB JS (366 KB gzipped), single chunk.** Prerendering fixes what
  crawlers *see*; this governs how the page *scores*. LCP and INP are ranking factors and
  this is the biggest remaining technical drag. Route-level code splitting is the fix.
- **No `tsconfig.json` or `tsc`.** The project transpiles without typechecking, so type
  errors reach runtime. Pre-existing, but it means the prerender step is currently the main
  guard on the new code.
- **Hydration is untested in a real browser.** The server and first client render should
  match — auth state starts logged-out on both sides — but this needs one pass through
  DevTools looking for hydration warnings.
- **Main navigation was left alone.** Only the footer links to the new pages. Adding
  How it works / Insights / About to `Navigation.tsx` would strengthen internal linking,
  but it is a designed element and the change is a design decision.
- `/projects` prerenders as its empty-state shell by design — a build-time snapshot of open
  projects would go stale. Crawlers reach individual projects via the sitemap.

---

## Verifying a build

```bash
cd fibi-frontend
PRERENDER_API_URL=<api-url> npm run build

# What a non-JS crawler sees:
grep -o '<title>[^<]*</title>' dist/faq/index.html
grep -c 'application/ld+json' dist/about/index.html

# Structured data: paste into https://validator.schema.org
# Rich results:    https://search.google.com/test/rich-results
```
