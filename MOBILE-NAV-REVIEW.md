# Commit `a31e688` — mobile header, logo, drawer

**Status:** Analysis, not merged · **Branch:** `origin/fix-mobile-header` · **Author:** Peterkiarie18 · **Committed:** 14 August 2026 · **Reviewed:** 15 August 2026

> _Fix mobile view header/navigation bar, logo pixelation, added drawer for mobile view_

This documents what the commit set out to do, what it actually does, and what
we should take from it — written **before** applying any of it, because `main`
has since fixed the same three defects independently and the two versions
cannot both land.

---

## 1. What it was meant to fix

Three real defects in the marketing header, all of which were genuinely present
at `5da3565a`, the commit it branched from:

| # | Defect | Why it mattered |
|---|---|---|
| 1 | The header had no mobile treatment at any width | On a phone the nav rendered `FIBI · Home · Projects` and ran off the right edge. "Membership", "Log In" and "Join Investment" were in the DOM and unreachable — the signup path was invisible on mobile. |
| 2 | The logo looked soft / "pixelated" in the bar | The wordmark was an `<img>` recoloured with `filter: invert()`, sitting in a bar that also runs `backdrop-blur`. |
| 3 | No drawer to put the links in | Consequence of (1) — there was nowhere for the links to go. |

The diagnosis is correct on all three. The same three defects were found and
fixed independently on `main` in `0a65ade1`.

## 2. Where it sits in history

```
ef9ad118 ─ c2efec82 ─ 5da3565a ─┬─ 64bad418 ─ 0a65ade1   ← origin/main (deployed)
                                │
                                └─ a31e688                ← origin/fix-mobile-header
```

- Branched from `5da3565a` ("payments phase1"); it is **not** an ancestor of `main`.
- `main` has since gained `64bad418` and `0a65ade1`, and `0a65ade1` rewrote
  `Navigation.tsx` end to end.
- Both branches therefore rewrite the same file completely. **A merge will
  conflict across the whole component**, not in a hunk or two.

## 3. File by file

| File | What it does | Verdict |
|---|---|---|
| `components/LogoMark.tsx` (new) | Inlines the wordmark as vector paths, cropped by `viewBox`, coloured with `currentColor` | **Worth taking** |
| `components/Navigation.tsx` | Hides desktop links below `lg`, adds a Radix `Sheet` drawer from the right | Superseded by `main`, one real bug |
| `assets/fibi_logo.svg` | Replaces the vector with a base64 PNG | **Do not take** |
| `package.json`, `package-lock.json` (repo root) | New npm project at the repo root holding only `@types/react` | Accidental |
| `fibi-frontend/package-lock.json` | Drops `"peer": true` markers | Incidental npm-version churn |

### 3.1 `LogoMark.tsx` — the idea worth keeping

The component's own comment states the reasoning:

> Filtering a rasterized SVG image is what was causing the soft/smudged edges in
> the header, especially combined with `backdrop-blur`.

It solves that by inlining the paths and colouring them with `currentColor`, so
`text-white` / `text-black` recolour the mark and no filter is involved.

It also crops the artwork with `viewBox="280 300 700 260"`. That is the same
discovery `main` made — the source SVG is a 1280×853 canvas whose ink occupies
only a middle band, which is why the mark renders far smaller than its height
class implies. **Verified:** the artwork's ink measures x 288–971, y 313.5–522
in that canvas; their viewBox frames exactly that band.

Two solutions to one problem, and theirs is technically the better one:

| | `main` (`Wordmark.tsx`) | `a31e688` (`LogoMark.tsx`) |
|---|---|---|
| Method | Fixed-size window with an oversized `<img>` centred inside | Inline `<svg>` with a cropped `viewBox` |
| Recolour | `filter: invert() brightness()` | `currentColor` |
| Extra markup | Wrapper span + absolute positioning | None |
| Sizes | Five named sizes, used on all six surfaces | Free-form `className`, used in the nav only |

`Wordmark` is applied everywhere; `LogoMark` is the cleaner mechanism. The two
are compatible — see §5.

### 3.2 `Navigation.tsx` — the drawer, and one bug

What it adds: desktop links hidden below `lg`, a `Sheet` drawer from the right
with the links, an auth block at its foot, and `SheetClose` on each item so a
tap closes the panel. A comment records a deliberate performance decision — not
animating the header's own background while the Sheet opens, because doubling
the compositing work was what made the drawer feel sluggish.

**Bug — inverted colour state on non-home pages:**

```tsx
const useLightText = isHomePage ? scrolled : true;
const navLinkClass = `... ${useLightText ? 'text-black ...' : 'text-white ...'}`;
```

The flag reads "use light text" but selects **black** when true. On `/projects`
and `/membership` it is unconditionally `true`, so the links and the logo render
black — and on those pages the bar is transparent over a dark photographic hero,
which the original code handled by forcing white. Rendering is black-on-dark
there. (The name is the tell: it means "the bar is light", not "the text is".)

**Not fixed:** the desktop account button keeps the original
`border-white text-white` on an outline button whose background is white — the
white-on-white control that made the signed-in user's name invisible over the
hero. `main` replaced that control entirely.

### 3.3 `fibi_logo.svg` — contradicts the commit's own purpose

| | Before (`5da3565a`) | After (`a31e688`) |
|---|---|---|
| Size | 6,847 bytes | 168,375 bytes (**25×**) |
| Vector paths | 28 | **0** |
| `<image>` elements | 0 | **1** — a base64 PNG at 5334×3555 |

The replacement is not an SVG of the logo; it is an SVG wrapper around a
screenshot of it. `LogoMark` carries its own copy of the paths, so the nav is
unaffected — but five other surfaces still load the asset directly
(`Footer`, `AuthLayout`, `NotFound`, `AdminLayout`, `UserDashboard` on that
branch), and all five silently become raster.

**Measured, not assumed:** rendering both assets side by side at 1× and 2× DPI,
through `main`'s current `Wordmark` crop, I could not see a difference — a
5334px-wide PNG downscaled to ~100px holds up, and the crop happens to frame the
new artwork correctly too. So this is not "it looks worse today". The objection
is that it is 25× the bytes on every page load, cannot be recoloured with
`currentColor` (so it still needs the filter the commit set out to remove), and
degrades at any size the design later asks for.

Most likely an accidental commit of a design-tool export.

### 3.4 The stray root `package.json`

A new npm project at the repository root, containing only a `@types/react`
devDependency, plus its lockfile. The root is not a JS project — it holds
`docker-compose.yml`, `BACKEND/` and `fibi-frontend/`. Almost certainly an
`npm install` run in the wrong directory. Should not be merged.

## 4. Overlap with `main` today

| Concern | `a31e688` | `main` (`0a65ade1`, deployed) |
|---|---|---|
| Mobile drawer | Radix `Sheet`, right side | Hand-rolled, right side, animated, body-scroll-locked |
| Desktop links hidden below | `lg` | `lg` |
| Logo | Inline vector + `currentColor`, nav only | `Wordmark` window + filter, all six surfaces |
| Signed-in account control | Unchanged — white-on-white bug remains | `AccountMenu`: avatar, name, tier, membership state |
| Investor portal chrome | — | `InvestorShell` on all member surfaces |
| Logo asset | Replaced with raster | Untouched vector |
| Motion / reduced-motion | — | `motion.css`, `prefers-reduced-motion` respected |
| Verified widths | — | 320–1920 + 2560, audited for overflow |

## 5. Recommendation

**Do not merge the branch.** It would conflict across all of `Navigation.tsx`,
reintroduce the white-on-white account button, add the black-on-dark regression,
and swap a vector asset for a raster one.

Take the one idea worth having:

1. ✅ **Done** — `Wordmark` now uses the inline-vector + `currentColor`
   mechanism from `LogoMark`, keeping its named sizes and `tone` prop so no call
   site changed. See §6.
2. Keep `main`'s drawer, `AccountMenu` and portal chrome.
3. Drop the asset replacement, the root `package.json`, and the lockfile churn.
4. Close `fix-mobile-header` with a note pointing at `0a65ade1`, at this
   document, and at §6, so the work is recorded as adopted rather than lost.

## 6. What was adopted

`Wordmark.tsx` was rewritten around Peter's mechanism and rolled out across the
whole app:

- **Inline paths, `currentColor`, no filter.** `filter: invert()` is gone from
  the codebase — both the `.inv-logo-invert` rule in `portal.css` and
  `.adm-logo-invert` in `admin.css` were deleted with their last callers.
- **Three variants, all measured off the artwork** rather than eyeballed:
  `full` (wordmark + tagline), `mark` (wordmark alone, for heights under ~20px
  where the tagline turns to mush), and `monogram` (the F).
- **Height is the only dimension a caller sets.** Width follows from the
  `viewBox`, so a size change cannot distort the mark.
- **The admin rail joined the system.** It was the last surface still loading
  the raw asset through a filter; collapsed it now shows the `monogram`, which
  is what the 76px rail always wanted — the wordmark at that width would be five
  pixels tall.
- `assets/fibi_logo.svg` stays in the tree as the artwork's source of truth; the
  paths in the component are copied from it verbatim.

Verified at 2× DPI on every surface that renders the mark — site nav over the
hero and scrolled, portal bar, mobile drawer, auth panel, footer, 404 — plus a
re-run of the overflow audit across 320–1920px, logged out and signed in, which
stayed clean.

One gap: the **admin console was not verified signed-in**. Resetting a local
admin password was blocked in this environment, so the two admin configurations
(`full`/`md` expanded, `monogram`/`sm` collapsed) were verified by rendering the
shipped component directly rather than by loading `/admin`. Worth a look on the
next admin login.
