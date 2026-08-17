/**
 * Company facts that only FIBI can supply.
 *
 * Everything here is empty by design. On a YMYL investment domain, named
 * people with checkable credentials are the single strongest trust signal
 * available — and an invented one is a misrepresentation to prospective
 * investors, which is a different category of problem from a placeholder.
 *
 * Each consumer renders nothing at all when its source array is empty, so the
 * site ships honest and incomplete rather than complete and false. Populate
 * these and the About, Contact and schema output fill in automatically.
 */

export type TeamMember = {
  name: string;
  /** Job title as it would appear on a business card. */
  role: string;
  /**
   * Two to three sentences of checkable background: prior institutions,
   * qualifications, years in the field. Vague praise adds nothing — quality
   * raters and answer engines are both looking for verifiable specifics.
   */
  bio: string;
  /** Path under /images, or an absolute URL. */
  photo?: string;
  /** Public professional profile, used for schema `sameAs`. */
  linkedin?: string;
  /** e.g. 'Advocate of the High Court of Kenya', 'CFA'. */
  credentials?: string[];
};

/** REQUIRED before launch. Leadership and anyone making investment decisions. */
export const TEAM: TeamMember[] = [];

export type Milestone = {
  /** 'YYYY' or 'YYYY-MM'. */
  date: string;
  title: string;
  detail: string;
};

/** Operating history. Concrete dated events only — no aspirational entries. */
export const MILESTONES: Milestone[] = [];

export type TrackRecordStat = {
  label: string;
  value: string;
  /** How the figure is measured and as at what date. */
  basis: string;
};

/**
 * Platform track record.
 *
 * Publish only figures you can substantiate on request, each with its basis
 * and as-at date. An unsourced "KES 2B+ invested" is the kind of claim that
 * invites a regulator's attention rather than a reader's trust.
 */
export const TRACK_RECORD: TrackRecordStat[] = [];

export const hasTeam = () => TEAM.length > 0;
export const hasMilestones = () => MILESTONES.length > 0;
export const hasTrackRecord = () => TRACK_RECORD.length > 0;
