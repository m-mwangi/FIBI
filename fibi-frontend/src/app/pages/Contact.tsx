import { Link } from 'react-router';
import { Mail, MapPin, Phone } from 'lucide-react';
import { Seo } from '../seo/Seo';
import { baseGraph, breadcrumbSchema, webPageSchema } from '../seo/schema';
import { UNVERIFIED, isSet } from '../seo/config';
import {
  AnswerCapsule,
  PageHero,
  Prose,
  Section,
} from '../components/content/ContentPage';

const PATH = '/contact';
const UPDATED = '2026-08-17';

const CRUMBS = [
  { name: 'Home', path: '/' },
  { name: 'Contact', path: PATH },
];

const TITLE = 'Contact FIBI';
const DESCRIPTION =
  'How to reach FIBI about a project, membership or an existing investment, and where the company is registered.';

/**
 * Contact details are rendered only where a real value exists in
 * `seo/config.ts`. A contact page listing a placeholder address is worse than
 * one listing none: on a YMYL site, a checkable business address is a trust
 * signal, and an uncheckable one is a red flag to both readers and raters.
 */
export default function Contact() {
  const hasAddress = isSet(UNVERIFIED.addressLocality);
  const hasEmail = isSet(UNVERIFIED.email);
  const hasPhone = isSet(UNVERIFIED.telephone);
  const hasAnyChannel = hasEmail || hasPhone || hasAddress;

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
        title="Contact FIBI"
        standfirst="Questions about a project, membership, or an investment you already hold."
        crumbs={CRUMBS}
        updated={UPDATED}
      />

      <Prose>
        <AnswerCapsule>
          You can reach FIBI through the channels listed below for questions about a
          specific project, about membership tiers, or about an investment you already
          hold. For questions that come up often — how ownership is structured, when
          returns are paid, what the risks are — the{' '}
          <Link to="/faq" className="text-emerald-800 underline underline-offset-2">
            FAQ
          </Link>{' '}
          is likely to answer faster.
        </AnswerCapsule>

        {hasAnyChannel ? (
          <Section id="reach-us" heading="How do I reach FIBI?">
            <div className="not-prose space-y-4">
              {hasEmail && (
                <div className="flex gap-4 items-start rounded-2xl bg-white p-5 ring-1 ring-slate-200">
                  <Mail className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" aria-hidden="true" />
                  <div>
                    <h3 className="font-semibold text-slate-900">Email</h3>
                    <a
                      href={`mailto:${UNVERIFIED.email}`}
                      className="text-emerald-700 underline underline-offset-2"
                    >
                      {UNVERIFIED.email}
                    </a>
                  </div>
                </div>
              )}
              {hasPhone && (
                <div className="flex gap-4 items-start rounded-2xl bg-white p-5 ring-1 ring-slate-200">
                  <Phone className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" aria-hidden="true" />
                  <div>
                    <h3 className="font-semibold text-slate-900">Phone</h3>
                    <a
                      href={`tel:${UNVERIFIED.telephone}`}
                      className="text-emerald-700 underline underline-offset-2"
                    >
                      {UNVERIFIED.telephone}
                    </a>
                  </div>
                </div>
              )}
              {hasAddress && (
                <div className="flex gap-4 items-start rounded-2xl bg-white p-5 ring-1 ring-slate-200">
                  <MapPin className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" aria-hidden="true" />
                  <div>
                    <h3 className="font-semibold text-slate-900">Registered office</h3>
                    <address className="not-italic text-slate-700">
                      {isSet(UNVERIFIED.streetAddress) && (
                        <>
                          {UNVERIFIED.streetAddress}
                          <br />
                        </>
                      )}
                      {UNVERIFIED.addressLocality}
                      {isSet(UNVERIFIED.addressRegion) && `, ${UNVERIFIED.addressRegion}`}
                      {isSet(UNVERIFIED.postalCode) && ` ${UNVERIFIED.postalCode}`}
                      <br />
                      Kenya
                    </address>
                  </div>
                </div>
              )}
            </div>
          </Section>
        ) : (
          /*
            REQUIRED before launch: populate UNVERIFIED in src/app/seo/config.ts.
            Until then this page deliberately shows no contact channel rather
            than a fabricated one — and an investment platform with no reachable
            contact will not rank, nor should it.
          */
          <Section id="reach-us" heading="How do I reach FIBI?">
            <p>
              Contact details are being finalised. In the meantime, sign in to your
              account to raise a question about an existing investment, or browse the{' '}
              <Link
                to="/faq"
                className="text-emerald-700 underline underline-offset-2 hover:text-emerald-800"
              >
                frequently asked questions
              </Link>
              .
            </p>
          </Section>
        )}

        <Section id="company-details" heading="Company details">
          {isSet(UNVERIFIED.registrationNumber) ? (
            <p>
              FIBI is registered in Kenya under company number{' '}
              <strong>{UNVERIFIED.registrationNumber}</strong>.
            </p>
          ) : (
            <p>
              Company registration details will be published here. If you are
              evaluating an investment and need them before we publish, ask us
              directly — a platform that will not identify its registered entity is
              one you should decline.
            </p>
          )}

          {isSet(UNVERIFIED.regulator) && isSet(UNVERIFIED.licenceNumber) ? (
            <p>
              FIBI is licensed by {UNVERIFIED.regulator} under licence{' '}
              <strong>{UNVERIFIED.licenceNumber}</strong>.
            </p>
          ) : (
            /*
              Do NOT replace this with an implied claim of regulated status.
              Holding out as licensed without a licence is an offence under the
              Capital Markets Act — state the true position, whichever it is.
            */
            <p>
              Details of FIBI’s regulatory status are set out in our{' '}
              <Link
                to="/legal/risk-disclosure"
                className="text-emerald-700 underline underline-offset-2 hover:text-emerald-800"
              >
                risk disclosure
              </Link>
              . Confirm the regulatory position of any platform before committing
              funds, and check the register of the regulator it names.
            </p>
          )}
        </Section>

        <Section id="complaints" heading="How do I raise a complaint?">
          <p>
            Raise the matter with us first, in writing, with your account details and
            the project concerned. If you are not satisfied with the outcome, you may
            be able to escalate to the relevant Kenyan authority depending on the
            nature of the complaint and FIBI’s regulatory status.
          </p>
        </Section>
      </Prose>
    </>
  );
}
