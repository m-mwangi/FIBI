import { Link } from 'react-router';
import { Seo } from '../seo/Seo';
import { baseGraph, breadcrumbSchema, webPageSchema } from '../seo/schema';
import {
  AnswerCapsule,
  PageHero,
  Prose,
  Section,
  RiskNotice,
} from '../components/content/ContentPage';
import { MILESTONES, TEAM, TRACK_RECORD, hasMilestones, hasTeam, hasTrackRecord } from '../content/company';

const PATH = '/about';
const UPDATED = '2026-08-17';

const CRUMBS = [
  { name: 'Home', path: '/' },
  { name: 'About', path: PATH },
];

const TITLE = 'About FIBI';
const DESCRIPTION =
  'FIBI is a Kenyan fractional land investment platform for eco-lodge, solar and agricultural projects. Who runs it, how projects are selected, and how to reach us.';

export default function About() {
  const jsonLd = [
    baseGraph(
      webPageSchema({
        name: TITLE,
        description: DESCRIPTION,
        path: PATH,
        dateModified: UPDATED,
      }),
      breadcrumbSchema(CRUMBS),
    ),
  ];

  return (
    <>
      <Seo title={TITLE} description={DESCRIPTION} path={PATH} jsonLd={jsonLd} />

      <PageHero
        title="About FIBI"
        standfirst="A Kenyan platform for collective investment in land-backed projects."
        crumbs={CRUMBS}
        updated={UPDATED}
      />

      <Prose>
        <AnswerCapsule>
          FIBI is a fractional land investment platform operating in Kenya. It lets
          several investors jointly fund a single land-backed project — eco-lodges,
          solar installations and agricultural developments — and share the returns
          in proportion to what each contributed. FIBI sources and vets projects,
          administers them through their term, and distributes returns to
          contributors.
        </AnswerCapsule>

        <Section id="what-we-do" heading="What does FIBI do?">
          <p>
            Land is the asset most Kenyans want to hold and the one that prices them
            out earliest. A parcel worth owning generally costs more than any single
            first-time investor can commit, which pushes people either into parcels
            too small to appreciate meaningfully or into schemes that promise land and
            deliver a receipt.
          </p>
          <p>
            FIBI addresses the first problem directly: pooling capital so that a group
            can hold an asset none of them could hold alone. It addresses the second by
            publishing what each project is, where it is, what it is projected to
            return, and on what timeline — before anyone commits money.
          </p>
          <p>
            We focus on projects with a productive use rather than raw speculative
            parcels. An eco-lodge, a solar installation or an agricultural development
            generates income during the holding period; bare land held for resale
            depends entirely on the exit price being higher than the entry price.
          </p>
        </Section>

        <Section id="selection" heading="How are projects selected?">
          <p>
            Every project listed on FIBI passes through title verification, commercial
            review and structuring before it appears on the platform. What that means
            in practice for Kenyan land is set out in our guide to{' '}
            <Link
              to="/insights/land-title-verification-kenya-official-search"
              className="text-emerald-700 underline underline-offset-2 hover:text-emerald-800"
            >
              verifying a Kenyan land title
            </Link>
            , and the structures used to hold land fractionally are explained in{' '}
            <Link
              to="/insights/how-fractional-land-ownership-works-in-kenya"
              className="text-emerald-700 underline underline-offset-2 hover:text-emerald-800"
            >
              how fractional land ownership works in Kenya
            </Link>
            .
          </p>
          {/*
            REQUIRED before launch: replace this paragraph with FIBI's actual
            selection criteria and the name of the firm or individual performing
            legal diligence. "Vetted" with no named process behind it is the
            claim every failed land scheme also made, and readers know it.
          */}
          <p>
            Each project page states its funding target, minimum contribution,
            projected return, payout frequency and deadline. Those figures are
            projections based on assumptions specific to that project, not commitments.
          </p>
        </Section>

        {hasTeam() && (
          <Section id="team" heading="Who runs FIBI?">
            <div className="not-prose grid sm:grid-cols-2 gap-5 mb-6">
              {TEAM.map((m) => (
                <div
                  key={m.name}
                  className="rounded-2xl bg-white p-6 ring-1 ring-slate-200 shadow-sm"
                >
                  {m.photo && (
                    <img
                      src={m.photo}
                      alt={`${m.name}, ${m.role} at FIBI`}
                      width={80}
                      height={80}
                      loading="lazy"
                      className="h-20 w-20 rounded-full object-cover mb-4"
                    />
                  )}
                  <h3 className="text-lg font-semibold text-slate-900">{m.name}</h3>
                  <p className="text-sm text-emerald-700 font-medium">{m.role}</p>
                  {m.credentials && m.credentials.length > 0 && (
                    <p className="text-xs text-slate-500 mt-1">
                      {m.credentials.join(' · ')}
                    </p>
                  )}
                  <p className="text-sm text-slate-600 leading-relaxed mt-3">{m.bio}</p>
                  {m.linkedin && (
                    <a
                      href={m.linkedin}
                      rel="noopener noreferrer"
                      target="_blank"
                      className="inline-block mt-3 text-sm text-emerald-700 underline underline-offset-2"
                    >
                      Professional profile
                    </a>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {hasTrackRecord() && (
          <Section id="track-record" heading="What is FIBI’s track record?">
            <dl className="not-prose rounded-2xl bg-slate-50 p-6 ring-1 ring-slate-200 mb-4">
              {TRACK_RECORD.map((s) => (
                <div key={s.label} className="py-3 border-b border-slate-200 last:border-0">
                  <dt className="text-sm text-slate-500">{s.label}</dt>
                  <dd className="text-2xl font-bold text-slate-900">{s.value}</dd>
                  <dd className="text-xs text-slate-500 mt-1">{s.basis}</dd>
                </div>
              ))}
            </dl>
          </Section>
        )}

        {hasMilestones() && (
          <Section id="history" heading="Operating history">
            <ol className="not-prose space-y-4 mb-4">
              {MILESTONES.map((m) => (
                <li key={`${m.date}-${m.title}`} className="flex gap-4">
                  <span className="text-sm font-mono text-emerald-700 w-20 shrink-0 pt-1">
                    {m.date}
                  </span>
                  <div>
                    <h3 className="font-semibold text-slate-900">{m.title}</h3>
                    <p className="text-sm text-slate-600">{m.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Section>
        )}

        <Section id="contact" heading="How do I get in touch?">
          <p>
            Questions about a specific project, about membership, or about how your
            interest would be held are all worth asking before you commit. Our{' '}
            <Link
              to="/contact"
              className="text-emerald-700 underline underline-offset-2 hover:text-emerald-800"
            >
              contact page
            </Link>{' '}
            lists the ways to reach us, and the{' '}
            <Link
              to="/faq"
              className="text-emerald-700 underline underline-offset-2 hover:text-emerald-800"
            >
              FAQ
            </Link>{' '}
            answers the questions we are asked most often.
          </p>
        </Section>

        <RiskNotice />
      </Prose>
    </>
  );
}
