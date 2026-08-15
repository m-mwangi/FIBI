import { Link } from 'react-router';
import { Wordmark } from './Wordmark';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          
          {/* Brand */}
          <div>
            <div className="flex items-center mb-4">
              <Wordmark size="lg" tone="light" />
            </div>

            <p className="text-sm text-gray-400">
              Fractional land investment platform enabling sustainable wealth creation through collective ownership.
            </p>
          </div>

          {/* Platform Links */}
          <div className="space-y-2 text-sm">
            <div className="h-6"></div> {/* Placeholder for removed title */}
            <ul className="space-y-2">
              <li>
                <Link to="/projects" className="hover:text-emerald-500 transition-colors">
                  Browse Projects
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-emerald-500 transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-emerald-500 transition-colors">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="space-y-2 text-sm">
            <div className="h-6"></div> {/* Placeholder for removed title */}
            <ul className="space-y-2">
              <li>
                <Link to="/" className="hover:text-emerald-500 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-emerald-500 transition-colors">
                  Our Mission
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-emerald-500 transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="space-y-2 text-sm">
            <div className="h-6"></div> {/* Placeholder for removed title */}
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-emerald-500 transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-emerald-500 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-emerald-500 transition-colors">
                  Investment Risks
                </a>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center text-gray-400">
          <p>© 2026 FIBI. All rights reserved. | Investments carry risk. Please read our disclosures carefully.</p>
        </div>
      </div>
    </footer>
  );
}