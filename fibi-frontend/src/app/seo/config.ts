/**
 * Single source of truth for site-wide SEO facts.
 *
 * Everything the prerenderer, the sitemap generator and the `<Seo>` component
 * emit traces back to this file, so a brand or domain change is a one-line
 * edit rather than a grep across the codebase.
 *
 * IMPORTANT: values under `UNVERIFIED` are deliberately empty. They are claims
 * about a real company — a registered address, a regulator licence number, a
 * support line — and publishing a guessed one on an investment site is worse
 * than publishing nothing. Fill them in from company records; the schema and
 * contact page omit each field entirely until it has a real value.
 */

/**
 * Canonical origin, no trailing slash. Override per environment so staging
 * never emits canonicals pointing at production (which would deindex it).
 */
export const SITE_URL = (
  import.meta.env.VITE_SITE_URL || 'https://fibicommunity.org'
).replace(/\/$/, '');

export const SITE_NAME = 'FIBI';

/** Used where the bare brand is too ambiguous to stand alone in search results. */
export const SITE_LEGAL_NAME = 'FIBI Community';

export const SITE_TAGLINE =
  'Fractional land investment platform enabling sustainable wealth creation through collective ownership.';

/**
 * Appended to every page title except the homepage. Kept short because Google
 * truncates around 60 characters and the brand is the first thing it drops.
 */
export const TITLE_SUFFIX = ` | ${SITE_NAME}`;

/** Fallback social share image. Replace with a purpose-built 1200x630 asset. */
export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/og-default.jpg`;

export const DEFAULT_LOCALE = 'en_KE';

/** Primary market. Drives hreflang, schema `areaServed` and geo signals. */
export const PRIMARY_COUNTRY = 'KE';

/**
 * Company facts that must come from records, not from inference.
 * Leave a field as an empty string until it is verified — every consumer
 * treats empty as "omit this property" rather than rendering a blank.
 */
export const UNVERIFIED = {
  /** e.g. 'https://www.linkedin.com/company/...' — one entry per owned profile. */
  socialProfiles: [] as string[],
  /** Street address of the registered office. */
  streetAddress: '',
  addressLocality: '',
  addressRegion: '',
  postalCode: '',
  /** Public support address, e.g. 'hello@fibicommunity.org'. */
  email: '',
  /** E.164 format, e.g. '+254...'. */
  telephone: '',
  /** Company registration number as issued by the registrar. */
  registrationNumber: '',
  /**
   * Regulator and licence number, if the platform is licensed. An investment
   * site that cannot state this is held to a much lower trust ceiling — but a
   * fabricated licence is a legal exposure, not an SEO win.
   */
  regulator: '',
  licenceNumber: '',
  /** Year the company was founded, as 'YYYY'. */
  foundingDate: '',
} as const;

/** True when a value in `UNVERIFIED` has been supplied. */
export const isSet = (v: string): boolean => v.trim().length > 0;
