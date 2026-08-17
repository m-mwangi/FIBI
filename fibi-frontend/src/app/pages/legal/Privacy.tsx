import { Seo } from '../../seo/Seo';
import { baseGraph, breadcrumbSchema, webPageSchema } from '../../seo/schema';
import { PageHero, Prose, Section } from '../../components/content/ContentPage';
import { DraftNotice, LEGAL_DRAFT } from './draft';

const PATH = '/legal/privacy';
const UPDATED = '2026-08-17';

const CRUMBS = [
  { name: 'Home', path: '/' },
  { name: 'Legal', path: '/legal/privacy' },
  { name: 'Privacy policy', path: PATH },
];

const TITLE = 'Privacy policy';
const DESCRIPTION =
  'How FIBI collects, uses and protects personal data, and your rights under the Kenyan Data Protection Act 2019.';

/**
 * Structure only, pending counsel — see the note in `Terms.tsx`.
 *
 * The section list is shaped by the Data Protection Act 2019, which governs
 * this site's primary market and requires a lawful basis for each processing
 * purpose, not a blanket consent clause.
 */
export default function Privacy() {
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
        title="Privacy policy"
        standfirst="What personal data FIBI holds, why, and what you can ask us to do with it."
        crumbs={CRUMBS}
        updated={UPDATED}
      />

      <Prose>
        <DraftNotice document="privacy policy" />

        <Section id="controller" heading="1. Who is the data controller">
          <p>
            Identifies the registered entity acting as data controller, its
            registration with the Office of the Data Protection Commissioner, and how
            to contact the data protection officer.
          </p>
        </Section>

        <Section id="data" heading="2. What data we collect">
          <p>
            Covers account details, identity and verification documents collected to
            meet anti-money-laundering obligations, payment information, investment
            records, and technical data such as device and usage information.
          </p>
        </Section>

        <Section id="basis" heading="3. Why we process it, and on what lawful basis">
          <p>
            States a lawful basis for each purpose under the Data Protection Act 2019
            — contract performance for administering investments, legal obligation for
            identity verification and record-keeping, legitimate interests for fraud
            prevention, and consent for marketing.
          </p>
        </Section>

        <Section id="sharing" heading="4. Who we share data with">
          <p>
            Covers payment processors, identity verification providers, professional
            advisers, project counterparties, and disclosures required by law or by a
            regulator.
          </p>
        </Section>

        <Section id="transfers" heading="5. Transfers outside Kenya">
          <p>
            Covers any processing outside Kenya and the safeguards relied on, as
            required where personal data leaves the jurisdiction.
          </p>
        </Section>

        <Section id="retention" heading="6. How long we keep it">
          <p>
            Sets retention periods by category, including the statutory minimum
            retention applying to anti-money-laundering records after an account
            closes.
          </p>
        </Section>

        <Section id="rights" heading="7. Your rights">
          <p>
            Covers the rights to be informed, to access, to correction, to erasure, to
            object, and to data portability, how to exercise each, and the right to
            complain to the Office of the Data Protection Commissioner.
          </p>
        </Section>

        <Section id="cookies" heading="8. Cookies and analytics">
          <p>
            Covers cookies set by the platform, any analytics or advertising
            technology in use, and how to control them. Must match what the site
            actually sets — a policy describing tooling that is not deployed, or
            omitting tooling that is, is the most common compliance gap.
          </p>
        </Section>

        <Section id="security" heading="9. How we protect data">
          <p>
            Covers technical and organisational security measures and the breach
            notification procedure.
          </p>
        </Section>

        <Section id="changes" heading="10. Changes to this policy">
          <p>Covers how material changes are notified and where prior versions sit.</p>
        </Section>
      </Prose>
    </>
  );
}
