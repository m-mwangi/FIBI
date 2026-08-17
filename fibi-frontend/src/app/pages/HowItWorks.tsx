import { Link } from 'react-router';
import { Seo } from '../seo/Seo';
import {
  baseGraph,
  breadcrumbSchema,
  howToSchema,
  webPageSchema,
} from '../seo/schema';
import {
  AnswerCapsule,
  PageHero,
  Prose,
  Section,
  RiskNotice,
} from '../components/content/ContentPage';

const PATH = '/how-it-works';
const UPDATED = '2026-08-17';

const CRUMBS = [
  { name: 'Home', path: '/' },
  { name: 'How it works', path: PATH },
];

const TITLE = 'How FIBI works';
const DESCRIPTION =
  'The five steps from opening a FIBI account to receiving distributions: verification, choosing a project, committing funds, funding close, and payouts.';

/**
 * Single source for the procedure, rendered visibly and emitted as `HowTo`.
 *
 * `HowTo` is used here because the content is genuinely sequential — a real
 * process with an order that matters. Applying it to a list of selling points
 * would be the abuse that gets structured data ignored wholesale.
 */
const STEPS = [
  {
    name: 'Create an account and complete verification',
    text: 'Register with your name and email, then complete identity verification. Verification is required to satisfy anti-money-laundering obligations and to confirm your eligibility to hold an interest in Kenyan land, which is restricted for non-citizens under Article 65 of the Constitution.',
  },
  {
    name: 'Review the open projects',
    text: 'Each project page states the location, the funding target, the minimum contribution, the projected return, the payout frequency and the funding deadline. Read the projected return as an estimate built on assumptions specific to that project, and check what those assumptions are before relying on the figure.',
  },
  {
    name: 'Commit funds to the projects you choose',
    text: 'Choose how much to contribute, at or above that project’s minimum, and complete payment through a supported method. Your contribution determines your proportional share of that project’s returns.',
  },
  {
    name: 'Wait for the project to reach its funding target',
    text: 'A project proceeds once it reaches its funding target before the deadline. Acquisition, structuring and any required consents are completed at this stage, and the project moves into its operating phase.',
  },
  {
    name: 'Receive distributions over the project term',
    text: 'Returns are distributed on the schedule published for that project — an agricultural project pays on harvest cycles, an operating lodge on trading income. Distributions depend on the project performing, and are not guaranteed.',
  },
];

export default function HowItWorks() {
  const jsonLd = [
    baseGraph(
      webPageSchema({
        name: TITLE,
        description: DESCRIPTION,
        path: PATH,
        dateModified: UPDATED,
      }),
      breadcrumbSchema(CRUMBS),
      howToSchema({
        name: 'How to invest in a FIBI land project',
        description: DESCRIPTION,
        steps: STEPS,
      }),
    ),
  ];

  return (
    <>
      <Seo title={TITLE} description={DESCRIPTION} path={PATH} jsonLd={jsonLd} />

      <PageHero
        title="How FIBI works"
        standfirst="From opening an account to receiving distributions, in five steps."
        crumbs={CRUMBS}
        updated={UPDATED}
      />

      <Prose>
        <AnswerCapsule>
          Investing through FIBI takes five steps: create an account and complete
          identity verification, review the open projects and their published terms,
          commit funds to the projects you choose, wait for the project to reach its
          funding target, then receive distributions on that project’s payout
          schedule. Your share of returns is proportional to what you contributed.
        </AnswerCapsule>

        <Section id="steps" heading="What are the steps to invest?">
          <ol className="not-prose space-y-5 mb-8">
            {STEPS.map((s, i) => (
              <li
                key={s.name}
                className="flex gap-5 rounded-2xl bg-white p-6 ring-1 ring-slate-200 shadow-sm"
              >
                <span
                  aria-hidden="true"
                  className="h-10 w-10 shrink-0 rounded-2xl bg-emerald-600 text-white font-bold flex items-center justify-center"
                >
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-semibold text-slate-900 text-lg mb-1">{s.name}</h3>
                  <p className="text-slate-600 leading-relaxed">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </Section>

        <Section id="what-you-own" heading="What do you own after investing?">
          <p>
            You hold an interest in the entity that owns the project asset, rather than
            a title deed in your own name for a subdivided parcel. Which instrument
            records that interest — a shareholding, a beneficial interest under a
            trust, or a co-tenancy on the title — is set out in each project’s offer
            documents, and it determines your rights on exit.
          </p>
          <p>
            The differences between those structures are substantial and worth
            understanding before you commit. We cover them in{' '}
            <Link
              to="/insights/how-fractional-land-ownership-works-in-kenya"
              className="text-emerald-700 underline underline-offset-2 hover:text-emerald-800"
            >
              how fractional land ownership works in Kenya
            </Link>
            .
          </p>
        </Section>

        <Section id="timeline" heading="How long is my money committed?">
          <p>
            Each project publishes its own term, and fractional land interests are
            illiquid: there is no exchange on which to sell a share, so you should
            plan on your capital being committed for the full term shown at the time
            you invest. Treat the published term as a floor rather than a precise
            estimate — property and infrastructure projects commonly run past their
            target dates.
          </p>
        </Section>

        <Section id="next" heading="Where do I start?">
          <p>
            Browse the{' '}
            <Link
              to="/projects"
              className="text-emerald-700 underline underline-offset-2 hover:text-emerald-800"
            >
              open projects
            </Link>{' '}
            to see what is currently accepting contributions, or read the{' '}
            <Link
              to="/faq"
              className="text-emerald-700 underline underline-offset-2 hover:text-emerald-800"
            >
              FAQ
            </Link>{' '}
            for the questions investors ask most. If you are weighing membership
            tiers, the{' '}
            <Link
              to="/membership"
              className="text-emerald-700 underline underline-offset-2 hover:text-emerald-800"
            >
              membership page
            </Link>{' '}
            lists what each one unlocks.
          </p>
        </Section>

        <RiskNotice />
      </Prose>
    </>
  );
}
