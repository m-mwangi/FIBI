/**
 * JSON-LD builders.
 *
 * Two rules shape everything here:
 *
 *  1. **Never assert an unverified fact.** Properties sourced from
 *     `UNVERIFIED` are dropped when empty rather than emitted blank. Schema is
 *     a machine-readable claim about a real company; a wrong one is a
 *     liability, and Google penalises structured data that contradicts the
 *     visible page.
 *
 *  2. **No `Product`/`Offer` on investment listings.** It is the obvious
 *     mapping and it is the wrong one: those types drive retail shopping rich
 *     results, they invite price/availability scrutiny that a land offering
 *     cannot satisfy, and presenting a regulated financial instrument as
 *     e-commerce stock is a compliance problem. Project pages use
 *     `BreadcrumbList` plus a descriptive `WebPage` instead.
 */

import {
  PRIMARY_COUNTRY,
  SITE_LEGAL_NAME,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
  UNVERIFIED,
  isSet,
} from './config';

type Json = Record<string, unknown>;

/** Drops keys whose value is empty, null or an empty array. */
function compact(obj: Json): Json {
  const out: Json = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === null || v === undefined) continue;
    if (typeof v === 'string' && v.trim() === '') continue;
    if (Array.isArray(v) && v.length === 0) continue;
    out[k] = v;
  }
  return out;
}

/** Stable @id so every other node can reference one organisation entity. */
export const ORG_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

/**
 * The organisation behind the site. Emitted once, sitewide, and referenced by
 * `@id` elsewhere rather than repeated — duplicated entities are the most
 * common reason Google ignores an Organization block.
 */
export function organizationSchema(): Json {
  const address = compact({
    '@type': 'PostalAddress',
    streetAddress: UNVERIFIED.streetAddress,
    addressLocality: UNVERIFIED.addressLocality,
    addressRegion: UNVERIFIED.addressRegion,
    postalCode: UNVERIFIED.postalCode,
    addressCountry: PRIMARY_COUNTRY,
  });

  // A lone `addressCountry` is not an address; it adds no trust signal and
  // reads as padding. Require at least a locality before emitting.
  const hasRealAddress = isSet(UNVERIFIED.addressLocality);

  const contactPoint = isSet(UNVERIFIED.email) || isSet(UNVERIFIED.telephone)
    ? compact({
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: UNVERIFIED.email,
        telephone: UNVERIFIED.telephone,
        areaServed: PRIMARY_COUNTRY,
        availableLanguage: ['en', 'sw'],
      })
    : null;

  return compact({
    '@type': 'Organization',
    '@id': ORG_ID,
    name: SITE_NAME,
    legalName: SITE_LEGAL_NAME,
    url: `${SITE_URL}/`,
    description: SITE_TAGLINE,
    logo: compact({
      '@type': 'ImageObject',
      url: `${SITE_URL}/images/logo-512.png`,
      width: 512,
      height: 512,
    }),
    areaServed: { '@type': 'Country', name: 'Kenya' },
    address: hasRealAddress ? address : null,
    contactPoint,
    sameAs: UNVERIFIED.socialProfiles,
    foundingDate: UNVERIFIED.foundingDate,
    identifier: isSet(UNVERIFIED.registrationNumber)
      ? UNVERIFIED.registrationNumber
      : null,
  });
}

/**
 * Sitewide `WebSite` node. The `SearchAction` is claimed only because
 * `/projects` genuinely accepts a `q` parameter — declaring a sitelinks
 * searchbox the site cannot serve gets the whole block discarded.
 */
export function websiteSchema(): Json {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: `${SITE_URL}/`,
    name: SITE_NAME,
    description: SITE_TAGLINE,
    publisher: { '@id': ORG_ID },
    inLanguage: 'en',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/projects?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Wraps nodes in a single `@graph`. One script per page beats several
 * disconnected ones: entities can cross-reference by `@id`, and Google reads
 * the page as one coherent claim rather than several competing ones.
 */
export function graph(...nodes: Array<Json | null>): Json {
  return {
    '@context': 'https://schema.org',
    '@graph': nodes.filter((n): n is Json => n !== null),
  };
}

/** Sitewide identity, included on every indexable page. */
export function baseGraph(...extra: Array<Json | null>): Json {
  return graph(organizationSchema(), websiteSchema(), ...extra);
}

export type Crumb = { name: string; path: string };

/**
 * Breadcrumbs mirror the visible trail. Google cross-checks the two and drops
 * the markup when they disagree, so callers pass the same labels the UI shows.
 */
export function breadcrumbSchema(crumbs: Crumb[]): Json {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: `${SITE_URL}${c.path === '/' ? '/' : c.path.replace(/\/+$/, '')}`,
    })),
  };
}

export type FaqEntry = { question: string; answer: string };

/**
 * FAQ markup. Every entry must be visible on the page — hidden-only FAQ
 * schema is a manual-action risk, and since 2023 Google shows FAQ rich results
 * mainly for authoritative sites, so treat this as an AI-extraction aid first
 * and a rich-result play second.
 */
export function faqSchema(entries: FaqEntry[]): Json | null {
  if (entries.length === 0) return null;
  return {
    '@type': 'FAQPage',
    mainEntity: entries.map((e) => ({
      '@type': 'Question',
      name: e.question,
      acceptedAnswer: { '@type': 'Answer', text: e.answer },
    })),
  };
}

/**
 * Generic page node, used where a more specific type would overclaim.
 * `primaryImageOfPage` is what feeds AI Overview thumbnails.
 */
export function webPageSchema(opts: {
  name: string;
  description: string;
  path: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
}): Json {
  const url = `${SITE_URL}${opts.path === '/' ? '/' : opts.path.replace(/\/+$/, '')}`;
  return compact({
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: opts.name,
    description: opts.description,
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': ORG_ID },
    inLanguage: 'en',
    primaryImageOfPage: opts.image
      ? { '@type': 'ImageObject', url: opts.image }
      : null,
    datePublished: opts.datePublished,
    dateModified: opts.dateModified,
  });
}

/**
 * Editorial content. `Article` is what lets an AI system attribute a claim to
 * a named author, which is the whole point of publishing explainers on a
 * YMYL site — anonymous finance content is discounted hard.
 */
export function articleSchema(opts: {
  headline: string;
  description: string;
  path: string;
  datePublished: string;
  dateModified?: string;
  authorName?: string;
  image?: string;
}): Json {
  const url = `${SITE_URL}${opts.path.replace(/\/+$/, '')}`;
  return compact({
    '@type': 'Article',
    '@id': `${url}#article`,
    headline: opts.headline,
    description: opts.description,
    mainEntityOfPage: url,
    datePublished: opts.datePublished,
    dateModified: opts.dateModified || opts.datePublished,
    author: opts.authorName
      ? { '@type': 'Person', name: opts.authorName }
      : { '@id': ORG_ID },
    publisher: { '@id': ORG_ID },
    image: opts.image,
    inLanguage: 'en',
  });
}

/**
 * Step-by-step markup for genuinely procedural content only. Applying `HowTo`
 * to a marketing list of benefits is the single most common structured-data
 * abuse and it gets ignored at best.
 */
export function howToSchema(opts: {
  name: string;
  description: string;
  steps: Array<{ name: string; text: string }>;
}): Json {
  return {
    '@type': 'HowTo',
    name: opts.name,
    description: opts.description,
    step: opts.steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  };
}
