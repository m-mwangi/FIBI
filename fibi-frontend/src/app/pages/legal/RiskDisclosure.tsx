import { Link } from 'react-router';
import { Seo } from '../../seo/Seo';
import { baseGraph, breadcrumbSchema, webPageSchema } from '../../seo/schema';
import { UNVERIFIED, isSet } from '../../seo/config';
import {
  AnswerCapsule,
  PageHero,
  Prose,
  Section,
} from '../../components/content/ContentPage';

const PATH = '/legal/risk-disclosure';
const UPDATED = '2026-08-17';

const CRUMBS = [
  { name: 'Home', path: '/' },
  { name: 'Legal', path: '/legal/risk-disclosure' },
  { name: 'Risk disclosure', path: PATH },
];

const TITLE = 'Investment risk disclosure';
const DESCRIPTION =
  'The risks of fractional land investment in Kenya: illiquidity, project execution, title and regulatory risk, concentration, and total loss of capital.';

/**
 * Substantive risk disclosure.
 *
 * Unlike the terms and privacy pages, this content is a plain statement of how
 * land investments can fail — general and verifiable rather than a set of
 * binding contractual terms. It still warrants a read by counsel before
 * launch, but it is honest and complete as written, which is the standard a
 * reader deciding whether to commit money is owed.
 */
export default function RiskDisclosure() {
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
        title="Investment risk disclosure"
        standfirst="Read this before committing funds to any project on this platform."
        crumbs={CRUMBS}
        updated={UPDATED}
      />

      <Prose>
        <AnswerCapsule>
          Fractional land investment can lose you money, including all of it. The
          principal risks are illiquidity — there is no market on which to sell your
          interest before the project term ends — together with project execution
          risk, title and regulatory risk affecting the underlying land, concentration
          risk, and the risk that projected returns are simply not achieved. Projected
          figures are estimates, not commitments.
        </AnswerCapsule>

        <Section id="capital" heading="You can lose your capital">
          <p>
            Every project on this platform puts your capital at risk. Land values can
            fall as well as rise, developments can fail to complete, and operating
            businesses built on land can trade at a loss. You may receive back less
            than you contributed, and in an adverse case you may receive nothing.
          </p>
          <p>
            Do not commit money you cannot afford to lose, and do not commit money you
            expect to need back on a particular date.
          </p>
        </Section>

        <Section id="illiquidity" heading="Your investment is illiquid">
          <p>
            There is no exchange or established secondary market for fractional land
            interests in Kenya. Once you commit funds, you should assume your capital
            is locked in for the full project term, which is commonly measured in
            years. Any transfer or buy-back facility, if one exists at all, will be set
            out in that project’s documents and will operate on terms set there — not
            on demand.
          </p>
        </Section>

        <Section id="projections" heading="Projected returns are estimates, not promises">
          <p>
            A projected return is arithmetic performed on assumptions: yields per
            hectare, occupancy rates, energy output, commodity prices, exit values.
            Each of those assumptions can prove wrong, and they tend to be wrong
            together rather than independently. Past performance of any project,
            whether on this platform or elsewhere, does not indicate future results.
          </p>
        </Section>

        <Section id="execution" heading="Projects can fail to execute">
          <p>
            Construction runs over budget and behind schedule. Agricultural output
            depends on rainfall, pests and input costs. Operating businesses depend on
            demand that may not materialise. Delays compound: a project that returns
            capital three years late has produced a materially worse outcome than the
            same project on time, even if the nominal return is unchanged.
          </p>
        </Section>

        <Section id="title" heading="Title and regulatory risk">
          <p>
            Interests in Kenyan land carry specific legal risks. A title can be
            challenged or revoked where it was irregularly issued. Transactions in
            agricultural land require Land Control Board consent under the Land Control
            Act, and a controlled transaction entered into without that consent is
            void. Article 65 of the Constitution restricts non-citizens to leasehold
            interests capped at 99 years, which limits who may hold certain assets.
          </p>
          <p>
            Leasehold interests decline in value as the residual term shortens, and a
            lease extension is an application rather than an entitlement. These are
            explained further in our guides to{' '}
            <Link
              to="/insights/freehold-vs-leasehold-land-kenya"
              className="text-emerald-700 underline underline-offset-2 hover:text-emerald-800"
            >
              freehold and leasehold tenure
            </Link>{' '}
            and{' '}
            <Link
              to="/insights/land-title-verification-kenya-official-search"
              className="text-emerald-700 underline underline-offset-2 hover:text-emerald-800"
            >
              title verification
            </Link>
            .
          </p>
        </Section>

        <Section id="structure" heading="You may not hold the land directly">
          <p>
            In most fractional arrangements you hold a shareholding, a beneficial
            interest under a trust, or a contractual interest — not a title deed in
            your own name. Your protections follow from that instrument. A contractual
            profit share, in particular, gives you no proprietary interest in the land
            at all and leaves you an unsecured creditor of the operator. Establish
            which instrument applies before you commit.
          </p>
        </Section>

        <Section id="concentration" heading="Concentration and platform risk">
          <p>
            Holding one or two projects concentrates your exposure to specific
            locations, sectors and counterparties. Separately, you are exposed to this
            platform continuing to operate: if project assets are not ring-fenced from
            the operator, an operator failure can affect your investment regardless of
            how the underlying project performs.
          </p>
        </Section>

        <Section id="regulatory-status" heading="Regulatory status and investor protection">
          {isSet(UNVERIFIED.regulator) && isSet(UNVERIFIED.licenceNumber) ? (
            <p>
              FIBI is licensed by {UNVERIFIED.regulator} under licence{' '}
              <strong>{UNVERIFIED.licenceNumber}</strong>. Confirm the current status
              of that licence on the regulator’s public register before investing.
            </p>
          ) : (
            /*
              REQUIRED before launch: replace with a plain statement of the true
              regulatory position. If the platform is unlicensed, say so and say
              what protections are therefore unavailable. Ambiguity here is not a
              drafting choice — it is a misrepresentation risk under the Capital
              Markets Act.
            */
            <p>
              <strong>
                FIBI’s regulatory status is being confirmed and will be stated here in
                full.
              </strong>{' '}
              Do not assume that an investment offered through this platform carries
              statutory investor protection, compensation-scheme cover or an
              ombudsman route. Ask us directly, and verify any regulatory claim
              against the regulator’s own public register rather than the platform’s
              description of it.
            </p>
          )}
        </Section>

        <Section id="tax" heading="Tax">
          <p>
            The tax treatment of your investment depends on your circumstances and on
            how the interest is held — a shareholding, a trust interest and direct
            co-ownership are not taxed alike. Kenyan land disposals may attract capital
            gains tax, and distributions may be subject to withholding. Nothing on this
            site is tax advice. Take your own advice from a qualified adviser before
            investing.
          </p>
        </Section>

        <Section id="not-advice" heading="This is not financial advice">
          <p>
            The information on this platform is general and does not take account of
            your objectives, financial situation or needs. Nothing here is a personal
            recommendation to invest in any project. If you are unsure whether an
            investment is suitable for you, consult an independent financial adviser
            authorised to advise on investments in Kenya.
          </p>
        </Section>
      </Prose>
    </>
  );
}
