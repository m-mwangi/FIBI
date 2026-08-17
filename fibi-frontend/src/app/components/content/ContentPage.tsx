import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { ChevronRight } from 'lucide-react';

/**
 * Shared furniture for the public content pages (about, FAQ, legal, insights).
 *
 * These pages exist to carry E-E-A-T and to be quotable by AI answer engines,
 * which pushes the markup in a specific direction: real heading hierarchy,
 * visible breadcrumbs that match the emitted `BreadcrumbList`, and a lead
 * paragraph positioned where an extractor will find it.
 */

export type Crumb = { name: string; path: string };

export function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-slate-500">
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          return (
            <li key={c.path} className="flex items-center gap-1">
              {last ? (
                <span aria-current="page" className="text-slate-700 font-medium">
                  {c.name}
                </span>
              ) : (
                <>
                  <Link to={c.path} className="hover:text-emerald-700 transition-colors">
                    {c.name}
                  </Link>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * The direct answer to the question the page title implies, in roughly 40-80
 * words, placed before any supporting detail.
 *
 * Generative engines extract a passage rather than reading to the end, so the
 * complete answer has to survive being lifted out of context. Anything that
 * only makes sense after the following three paragraphs belongs below, not
 * here.
 */
export function AnswerCapsule({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl bg-emerald-50 ring-1 ring-emerald-100 p-6 sm:p-7 mb-10">
      <p className="text-lg leading-relaxed text-slate-800">{children}</p>
    </div>
  );
}

export function PageHero({
  title,
  standfirst,
  crumbs,
  updated,
}: {
  title: string;
  standfirst?: string;
  crumbs: Crumb[];
  /** ISO date. Rendered visibly — freshness is a retrieval signal, and a
   *  date only in metadata is a date the reader cannot check. */
  updated?: string;
}) {
  return (
    <header className="bg-gradient-to-b from-slate-50 to-white border-b border-slate-100">
      <div className="max-w-3xl mx-auto px-4 pt-10 pb-12 sm:pt-14 sm:pb-16">
        <Breadcrumbs crumbs={crumbs} />
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 text-balance">
          {title}
        </h1>
        {standfirst && (
          <p className="mt-4 text-lg text-slate-600 leading-relaxed">{standfirst}</p>
        )}
        {updated && (
          <p className="mt-6 text-sm text-slate-500">
            Last updated{' '}
            <time dateTime={updated}>
              {new Date(`${updated}T00:00:00Z`).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                timeZone: 'UTC',
              })}
            </time>
          </p>
        )}
      </div>
    </header>
  );
}

/** Constrained measure for long-form text. */
export function Prose({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16 [&_p]:text-slate-700 [&_p]:leading-relaxed [&_p]:mb-5 [&_li]:text-slate-700 [&_li]:leading-relaxed">
      {children}
    </div>
  );
}

/**
 * Section heading phrased as a question wherever the content allows.
 *
 * Question-shaped headings match how people prompt an assistant, which is what
 * makes a section retrievable as an answer to that prompt.
 */
export function Section({
  id,
  heading,
  children,
}: {
  id: string;
  heading: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="mb-12">
      <h2
        id={id}
        className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-4 scroll-mt-24"
      >
        {heading}
      </h2>
      {children}
    </section>
  );
}

/**
 * A fact stated with its source and date attached.
 *
 * Fact density is what separates content an answer engine will cite from
 * content it will paraphrase anonymously — a number with a named source and a
 * date is quotable, "significant growth" is not.
 */
export function FactRow({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 py-3 border-b border-slate-100 last:border-0">
      <dt className="text-sm font-medium text-slate-500 sm:w-56 shrink-0">{label}</dt>
      <dd className="text-slate-800">
        {value}
        {note && <span className="block text-sm text-slate-500 mt-0.5">{note}</span>}
      </dd>
    </div>
  );
}

/**
 * Standing risk notice for pages that discuss returns.
 *
 * Present on every page that mentions a projection. Google's quality
 * guidelines treat undisclosed financial risk as a trust failure, and the
 * notice is genuinely owed to the reader regardless.
 */
export function RiskNotice({ className = '' }: { className?: string }) {
  return (
    <aside
      role="note"
      className={`rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-relaxed text-amber-900 ${className}`}
    >
      <strong className="font-semibold">Capital is at risk.</strong> Land and
      infrastructure investments are illiquid, returns are not guaranteed, and
      projected figures are estimates rather than promises. You may get back
      less than you put in. Read the{' '}
      <Link to="/legal/risk-disclosure" className="underline underline-offset-2 hover:text-amber-950">
        full risk disclosure
      </Link>{' '}
      before committing funds.
    </aside>
  );
}
