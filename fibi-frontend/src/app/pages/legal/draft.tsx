import { Link } from 'react-router';

/**
 * Gate for legal documents that are structured but not yet drafted.
 *
 * While true, the terms and privacy pages render a visible notice and are
 * emitted `noindex` with no schema. Two reasons to keep them out of the index
 * rather than shipping placeholder clauses:
 *
 *  - An indexed page of headings with no operative terms is thin content on a
 *    domain whose trust profile can least afford it.
 *  - A user who finds it via search has no way to tell a skeleton from the
 *    real agreement, and may act as though terms exist that do not.
 *
 * Flip to `false` in the same change that lands the drafted text.
 */
export const LEGAL_DRAFT = true;

/**
 * Shown to real users, not just developers — someone reaching this page from
 * the footer is entitled to know the document is not yet in force.
 */
export function DraftNotice({ document }: { document: string }) {
  if (!LEGAL_DRAFT) return null;

  return (
    <div
      role="note"
      className="rounded-2xl border border-amber-300 bg-amber-50 p-5 mb-10 text-sm leading-relaxed text-amber-900"
    >
      <strong className="font-semibold">This document is not yet in force.</strong>{' '}
      FIBI’s {document} is being prepared with legal counsel. The headings below show
      what it will cover. Nothing on this page creates rights or obligations, and it
      should not be relied on. For the risks of investing — which are set out in
      full and are current — read the{' '}
      <Link
        to="/legal/risk-disclosure"
        className="underline underline-offset-2 hover:text-amber-950"
      >
        risk disclosure
      </Link>
      .
    </div>
  );
}
