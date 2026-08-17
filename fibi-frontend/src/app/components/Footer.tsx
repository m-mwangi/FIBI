import { Link } from 'react-router';
import { Wordmark } from './Wordmark';

/**
 * Sitewide footer.
 *
 * Also the site's main internal-linking surface: it is the only place every
 * public page is reachable from every other, which is how the content pages
 * get discovered and how link equity reaches them from the homepage. The
 * headings are real headings rather than the spacer divs that were here
 * before — a crawler reads column structure, and a screen reader announces it.
 */

type FooterLink = { label: string; to: string };

const PLATFORM: FooterLink[] = [
  { label: 'Browse projects', to: '/projects' },
  { label: 'How it works', to: '/how-it-works' },
  { label: 'Membership', to: '/membership' },
  { label: 'Insights', to: '/insights' },
];

const COMPANY: FooterLink[] = [
  { label: 'About us', to: '/about' },
  { label: 'Contact', to: '/contact' },
  { label: 'FAQ', to: '/faq' },
];

const LEGAL: FooterLink[] = [
  { label: 'Investment risks', to: '/legal/risk-disclosure' },
  { label: 'Terms of service', to: '/legal/terms' },
  { label: 'Privacy policy', to: '/legal/privacy' },
];

function LinkColumn({ heading, links }: { heading: string; links: FooterLink[] }) {
  return (
    <div className="text-sm">
      <h2 className="font-semibold text-white mb-3">{heading}</h2>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.to}>
            <Link to={l.to} className="hover:text-emerald-500 transition-colors">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <Wordmark size="lg" tone="light" />
            </div>
            <p className="text-sm text-gray-400">
              Fractional land investment platform enabling sustainable wealth creation
              through collective ownership.
            </p>
          </div>

          <LinkColumn heading="Platform" links={PLATFORM} />
          <LinkColumn heading="Company" links={COMPANY} />
          <LinkColumn heading="Legal" links={LEGAL} />
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-gray-400">
          <p className="text-center">
            © {new Date().getFullYear()} FIBI. All rights reserved.
          </p>
          {/*
            The risk warning is a standing obligation on a site that publishes
            projected returns, not a footnote — it links to the full disclosure
            rather than gesturing at one.
          */}
          <p className="text-center mt-2 text-xs text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Capital is at risk. Land investments are illiquid and projected returns are
            estimates, not guarantees. You may get back less than you invest. Read the{' '}
            <Link
              to="/legal/risk-disclosure"
              className="underline underline-offset-2 hover:text-gray-300"
            >
              full risk disclosure
            </Link>{' '}
            before investing.
          </p>
        </div>
      </div>
    </footer>
  );
}
