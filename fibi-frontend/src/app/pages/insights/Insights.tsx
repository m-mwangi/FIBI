import { Link } from 'react-router';
import { Clock } from 'lucide-react';
import { Seo } from '../../seo/Seo';
import { baseGraph, breadcrumbSchema, webPageSchema } from '../../seo/schema';
import { SITE_URL } from '../../seo/config';
import {
  AnswerCapsule,
  PageHero,
  Prose,
} from '../../components/content/ContentPage';
import { insightsByRecency } from '../../content/insights';

const PATH = '/insights';

const CRUMBS = [
  { name: 'Home', path: '/' },
  { name: 'Insights', path: PATH },
];

const TITLE = 'Land investment insights';
const DESCRIPTION =
  'Guides to investing in Kenyan land: ownership structures, title verification, freehold versus leasehold, and what each means for investors.';

export default function Insights() {
  const posts = insightsByRecency();
  const newest = posts[0]?.updated;

  const jsonLd = [
    baseGraph(
      webPageSchema({
        name: TITLE,
        description: DESCRIPTION,
        path: PATH,
        dateModified: newest,
      }),
      breadcrumbSchema(CRUMBS),
      // An ItemList makes the hub's contents legible as a set rather than as
      // an incidental collection of links.
      {
        '@type': 'ItemList',
        itemListElement: posts.map((p, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: `${SITE_URL}/insights/${p.slug}`,
          name: p.title,
        })),
      },
    ),
  ];

  return (
    <>
      <Seo title={TITLE} description={DESCRIPTION} path={PATH} jsonLd={jsonLd} />

      <PageHero
        title="Land investment insights"
        standfirst="How Kenyan land ownership actually works, explained without the sales pitch."
        crumbs={CRUMBS}
        updated={newest}
      />

      <Prose>
        <AnswerCapsule>
          These guides cover the mechanics of holding Kenyan land as an investment:
          the structures used to own a parcel collectively, the searches and consents
          that establish whether a title is sound, and how freehold and leasehold
          tenure differ in cost, eligibility and resale value. They describe the law
          and the process, not FIBI’s commercial terms.
        </AnswerCapsule>

        <div className="not-prose space-y-5">
          {posts.map((p) => (
            <article
              key={p.slug}
              className="rounded-2xl bg-white p-6 sm:p-7 ring-1 ring-slate-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-700 mb-2">
                {p.topic}
              </p>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-2">
                <Link to={`/insights/${p.slug}`} className="hover:text-emerald-800">
                  {p.title}
                </Link>
              </h2>
              <p className="text-slate-600 leading-relaxed mb-4">{p.description}</p>
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  {p.readingMinutes} min read
                </span>
                <span>
                  Updated{' '}
                  <time dateTime={p.updated}>
                    {new Date(`${p.updated}T00:00:00Z`).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      timeZone: 'UTC',
                    })}
                  </time>
                </span>
              </div>
            </article>
          ))}
        </div>
      </Prose>
    </>
  );
}
