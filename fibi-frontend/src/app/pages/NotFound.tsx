import { Link } from 'react-router';
import { Home, FolderOpen, SearchX } from 'lucide-react';
import { Button } from '../components/ui/button';
import logo from '../../assets/fibi_logo.svg';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-16 bg-gradient-to-b from-slate-50 via-white to-emerald-50/40">
      <Link to="/" className="mb-10 opacity-90 hover:opacity-100 transition-opacity">
        <img src={logo} alt="FIBI" className="h-10 w-auto" />
      </Link>

      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-700 shadow-inner">
          <SearchX className="h-11 w-11" strokeWidth={1.5} />
        </div>
        <p className="text-sm font-semibold uppercase tracking-widest text-emerald-600 mb-2">Error 404</p>
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight mb-3">Page not found</h1>
        <p className="text-slate-600 leading-relaxed mb-10">
          The link may be broken or the page was removed. Head back home or browse our investment
          listings.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            asChild
            className="h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-6"
          >
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Back to home
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-11 rounded-xl border-slate-200 px-6">
            <Link to="/projects">
              <FolderOpen className="mr-2 h-4 w-4" />
              View projects
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
