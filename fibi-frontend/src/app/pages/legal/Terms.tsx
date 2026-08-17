import { Link } from 'react-router';
import { Seo } from '../../seo/Seo';
import { baseGraph, breadcrumbSchema, webPageSchema } from '../../seo/schema';
import {
  PageHero,
  Prose,
  Section,
} from '../../components/content/ContentPage';
import { DraftNotice, LEGAL_DRAFT } from './draft';

const PATH = '/legal/terms';
const UPDATED = '2026-08-17';

const CRUMBS = [
  { name: 'Home', path: '/' },
  { name: 'Legal', path: '/legal/terms' },
  { name: 'Terms of service', path: PATH },
];

const TITLE = 'Terms of service';
const DESCRIPTION =
  'The terms governing use of the FIBI platform, account obligations, and the basis on which projects are offered.';

/**
 * Structure only, pending counsel.
 *
 * The headings below are the ones a Kenyan investment platform's terms need to
 * cover, and they are laid out so drafting can drop straight in. The operative
 * clauses are deliberately absent: invented contract terms would purport to
 * bind real users to obligations nobody drafted, which is a worse outcome than
 * an obviously unfinished page.
 *
 * While `LEGAL_DRAFT` is true this page is `noindex`. Flip it in `draft.ts`
 * once real terms are in place.
 */
export default function Terms() {
  const jsonLd = LEGAL_DRAFT
    ? []
    : [
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
      <Seo
        title={TITLE}
        description={DESCRIPTION}
        path={PATH}
        noindex={LEGAL_DRAFT}
        jsonLd={jsonLd}
      />

      <PageHero
        title="Terms of service"
        standfirst="The agreement between you and FIBI when you use this platform."
        crumbs={CRUMBS}
        updated={UPDATED}
      />

      <Prose>
        <DraftNotice document="terms of service" />

        <Section id="scope" heading="1. Who these terms apply to">
          <p>
            Covers acceptance, the parties, and the relationship between these terms
            and the offer documents for an individual project.
          </p>
        </Section>

        <Section id="eligibility" heading="2. Eligibility and account registration">
          <p>
            Covers minimum age, identity verification and anti-money-laundering
            obligations, the accuracy of information you provide, and the
            constitutional restrictions on non-citizens holding interests in Kenyan
            land.
          </p>
        </Section>

        <Section id="account" heading="3. Your account and security">
          <p>
            Covers credential security, responsibility for activity on the account,
            and notification obligations on suspected compromise.
          </p>
        </Section>

        <Section id="offers" heading="4. How projects are offered">
          <p>
            Covers the status of information on project pages, the precedence of a
            project’s own offer documents over marketing material, and the platform’s
            role as administrator rather than adviser.
          </p>
        </Section>

        <Section id="commitments" heading="5. Commitments, payment and cancellation">
          <p>
            Covers when a commitment becomes binding, accepted payment methods, any
            cooling-off period, and what happens to committed funds if a project does
            not reach its funding target.
          </p>
        </Section>

        <Section id="fees" heading="6. Fees">
          <p>
            Covers every fee charged, its basis of calculation, and how changes are
            notified. Must reconcile exactly with the fees stated on the{' '}
            <Link
              to="/faq"
              className="text-emerald-700 underline underline-offset-2 hover:text-emerald-800"
            >
              FAQ
            </Link>{' '}
            and on project pages.
          </p>
        </Section>

        <Section id="distributions" heading="7. Distributions">
          <p>
            Covers how and when returns are paid, deductions and withholding, and what
            happens where a project underperforms or fails.
          </p>
        </Section>

        <Section id="membership" heading="8. Membership">
          <p>
            Covers tier entitlements, billing and renewal, cancellation, and the
            separation between membership fees and investment commitments.
          </p>
        </Section>

        <Section id="risk" heading="9. Risk acknowledgement">
          <p>
            Covers the user’s acknowledgement of the matters set out in the{' '}
            <Link
              to="/legal/risk-disclosure"
              className="text-emerald-700 underline underline-offset-2 hover:text-emerald-800"
            >
              risk disclosure
            </Link>
            , which is published in full and should be read before committing funds.
          </p>
        </Section>

        <Section id="liability" heading="10. Liability">
          <p>
            Covers the limits of the platform’s liability and the losses excluded,
            subject to the liabilities that cannot lawfully be excluded under Kenyan
            law.
          </p>
        </Section>

        <Section id="termination" heading="11. Suspension and termination">
          <p>
            Covers grounds for suspending or closing an account and the effect of
            closure on investments already made.
          </p>
        </Section>

        <Section id="disputes" heading="12. Governing law and disputes">
          <p>
            Covers governing law, the complaints procedure, and the forum for
            resolving disputes.
          </p>
        </Section>
      </Prose>
    </>
  );
}
