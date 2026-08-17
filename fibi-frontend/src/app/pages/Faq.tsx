import { Link } from 'react-router';
import { Seo } from '../seo/Seo';
import {
  baseGraph,
  breadcrumbSchema,
  faqSchema,
  webPageSchema,
} from '../seo/schema';
import {
  AnswerCapsule,
  PageHero,
  Prose,
  RiskNotice,
} from '../components/content/ContentPage';
import {
  FAQS,
  FAQ_CATEGORIES,
  faqEntriesForSchema,
} from '../content/faq';

const PATH = '/faq';
const UPDATED = '2026-08-17';

const CRUMBS = [
  { name: 'Home', path: '/' },
  { name: 'FAQ', path: PATH },
];

const TITLE = 'Frequently asked questions';
const DESCRIPTION =
  'Answers on fractional land investment with FIBI: what you own, how title is verified, how returns are paid, the risks, and membership.';

const isDev = import.meta.env.DEV;

export default function Faq() {
  const jsonLd = [
    baseGraph(
      webPageSchema({
        name: TITLE,
        description: DESCRIPTION,
        path: PATH,
        dateModified: UPDATED,
      }),
      breadcrumbSchema(CRUMBS),
      // Only reviewed answers are asserted as machine-readable claims.
      faqSchema(faqEntriesForSchema),
    ),
  ];

  return (
    <>
      <Seo title={TITLE} description={DESCRIPTION} path={PATH} jsonLd={jsonLd} />

      <PageHero
        title="Frequently asked questions"
        standfirst="What you own, how returns work, and what can go wrong."
        crumbs={CRUMBS}
        updated={UPDATED}
      />

      <Prose>
        <AnswerCapsule>
          Fractional land investment lets several people jointly fund one land-backed
          project and share the returns in proportion to what each contributed. The
          answers below cover what your interest actually consists of, how Kenyan
          title is verified, when distributions are paid, and the risks — including
          illiquidity and the possibility of losing capital.
        </AnswerCapsule>

        {/* Headings render as questions because that is how the query arrives. */}
        {FAQ_CATEGORIES.map((category) => {
          const entries = FAQS.filter((f) => f.category === category);
          if (entries.length === 0) return null;

          return (
            <section key={category} aria-labelledby={`faq-${category}`} className="mb-12">
              <h2
                id={`faq-${category}`}
                className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-5 scroll-mt-24"
              >
                {category}
              </h2>

              <div className="not-prose space-y-4">
                {entries.map((f) => (
                  <article
                    key={f.question}
                    className="rounded-2xl bg-white p-6 ring-1 ring-slate-200 shadow-sm"
                  >
                    <h3 className="font-semibold text-slate-900 text-lg mb-2">
                      {f.question}
                    </h3>
                    <p className="text-slate-600 leading-relaxed">{f.answer}</p>

                    {/*
                      A visible build-time warning beats a silent one. These
                      answers describe FIBI's own commercial terms and must be
                      replaced with real ones before launch — the marker is
                      shown in development only so it cannot ship unnoticed.
                    */}
                    {isDev && f.needsCompanyReview && (
                      <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800 ring-1 ring-amber-200">
                        Needs company review before launch — excluded from FAQ schema.
                      </p>
                    )}
                  </article>
                ))}
              </div>
            </section>
          );
        })}

        <p>
          Still unsure about something?{' '}
          <Link
            to="/contact"
            className="text-emerald-700 underline underline-offset-2 hover:text-emerald-800"
          >
            Get in touch
          </Link>{' '}
          — and read the full{' '}
          <Link
            to="/legal/risk-disclosure"
            className="text-emerald-700 underline underline-offset-2 hover:text-emerald-800"
          >
            risk disclosure
          </Link>{' '}
          before committing funds.
        </p>

        <RiskNotice />
      </Prose>
    </>
  );
}
