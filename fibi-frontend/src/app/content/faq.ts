import type { FaqEntry } from '../seo/schema';

/**
 * The FAQ corpus, rendered visibly on `/faq` and emitted as `FAQPage` schema
 * from the same array.
 *
 * One array, two consumers, on purpose: schema whose answers differ from the
 * visible page is a spam signal, and keeping two copies in sync by hand is how
 * that happens.
 *
 * Answers are written to survive extraction — each one is complete on its own,
 * because an answer engine will lift a single entry away from everything
 * around it.
 *
 * REVIEW REQUIRED: entries tagged `needsCompanyReview` describe FIBI's own
 * commercial terms. They are written in the shape the answer should take but
 * deliberately avoid asserting specific figures, because inventing a fee or a
 * minimum on an investment site is a misrepresentation rather than a
 * placeholder. Replace the bracketed prompts with real terms before launch.
 */

export type FibiFaq = FaqEntry & {
  /** Grouping shown on the page and used to order the schema output. */
  category: 'Getting started' | 'Ownership & legal' | 'Money' | 'Risk' | 'Membership';
  /** Blocks publication until a human confirms the commercial detail. */
  needsCompanyReview?: boolean;
};

export const FAQS: FibiFaq[] = [
  {
    category: 'Getting started',
    question: 'What is fractional land investment?',
    answer:
      'Fractional land investment lets several people jointly fund a single land or infrastructure project and share the returns in proportion to what each contributed. Instead of buying a whole parcel alone, you buy a defined share of one project. It lowers the entry cost of land exposure and spreads a single buyer’s risk across more than one asset, but the shares are not traded on an exchange and cannot be sold on demand.',
  },
  {
    category: 'Getting started',
    question: 'How does FIBI work?',
    answer:
      'FIBI lists vetted land-backed projects in Kenya — eco-lodges, solar installations and agricultural developments. You browse open projects, review each one’s funding target, projected return and timeline, then commit funds to the projects you choose. FIBI administers the project and distributes returns to contributors according to the payout schedule published on that project’s page.',
  },
  {
    category: 'Getting started',
    question: 'Who can invest through FIBI?',
    answer:
      'You need to create an account, complete identity verification and meet the eligibility conditions attached to the specific project you want to join. Verification exists to satisfy anti-money-laundering obligations and to confirm you are entitled to hold an interest in Kenyan land, which is subject to constitutional restrictions on non-citizen ownership.',
    needsCompanyReview: true,
  },
  {
    category: 'Getting started',
    question: 'What is the minimum amount needed to start?',
    answer:
      'Each project sets its own minimum contribution, shown on that project’s page before you commit. [REVIEW: state the platform-wide floor, e.g. "Minimums currently start from KES X." Do not publish without confirming.]',
    needsCompanyReview: true,
  },

  {
    category: 'Ownership & legal',
    question: 'What exactly do I own when I invest in a project?',
    answer:
      'You hold a contractual interest in the project entity that owns the underlying land or asset, not a title deed in your own name for a subdivided parcel. The specific instrument, the entity that holds the title and your rights on exit are set out in that project’s offer documents, which you should read in full before committing.',
    needsCompanyReview: true,
  },
  {
    category: 'Ownership & legal',
    question: 'How is land title verified before a project is listed?',
    answer:
      'Title verification for Kenyan land involves an official search at the relevant land registry to confirm the registered proprietor and any encumbrances, confirmation of rates and rent clearance, and confirmation that any required land control board consent can be obtained. [REVIEW: describe FIBI’s actual due-diligence steps and who performs them — an unattributed process claim carries no weight.]',
    needsCompanyReview: true,
  },
  {
    category: 'Ownership & legal',
    question: 'Can non-Kenyans invest in FIBI projects?',
    answer:
      'Kenya’s Constitution restricts non-citizens to leasehold interests capped at 99 years, and freehold agricultural land cannot be held by non-citizens. Whether a given project is open to non-citizens therefore depends on how that project’s land is held. Check the eligibility section on each project page.',
    needsCompanyReview: true,
  },

  {
    category: 'Money',
    question: 'What fees does FIBI charge?',
    answer:
      '[REVIEW: state every fee — platform fee, management fee, performance share, exit or transfer fees — with the exact basis of calculation. Undisclosed fees are both a trust failure and a regulatory exposure. This answer must not go live in placeholder form.]',
    needsCompanyReview: true,
  },
  {
    category: 'Money',
    question: 'How and when are returns paid out?',
    answer:
      'Each project publishes its own payout frequency and expected first distribution date on its project page, because returns follow the underlying asset — an agricultural project pays on harvest cycles, a lodge on operating income. Distributions are made to the payout method registered on your account and are subject to the project performing as projected.',
  },
  {
    category: 'Money',
    question: 'Are returns on FIBI projects guaranteed?',
    answer:
      'No. Figures shown as projected returns are estimates based on assumptions about yield, occupancy, commodity prices or energy output, and those assumptions can prove wrong. Returns may be lower than projected, delayed, or absent entirely, and you may lose some or all of the capital you commit.',
  },
  {
    category: 'Money',
    question: 'How is my money handled between commitment and project funding?',
    answer:
      '[REVIEW: describe the actual custody arrangement — which regulated institution holds committed funds before a project closes, and what happens to your money if the project fails to reach its funding target. This is the question a cautious investor asks first.]',
    needsCompanyReview: true,
  },

  {
    category: 'Risk',
    question: 'What are the main risks of fractional land investment?',
    answer:
      'The principal risks are illiquidity, because there is no ready secondary market and you may be unable to exit before the project term ends; project execution risk, where construction or agricultural operations run over budget or behind schedule; title and regulatory risk affecting the underlying land; concentration risk if you hold few projects; and total loss of capital. Land values can fall as well as rise.',
  },
  {
    category: 'Risk',
    question: 'Can I sell my share early or withdraw before the project ends?',
    answer:
      'Fractional land interests are illiquid by nature and should be treated as committed for the full project term shown at the time you invest. [REVIEW: state whether any secondary transfer or buy-back mechanism exists, and on what terms. If none exists, say so plainly — that is the honest answer and it is what a careful investor needs.]',
    needsCompanyReview: true,
  },
  {
    category: 'Risk',
    question: 'What happens if a project fails or FIBI ceases to operate?',
    answer:
      '[REVIEW: describe the actual insolvency and wind-down arrangements — whether project assets are ring-fenced from the platform operator, and who administers a project if FIBI stops trading. Investors are entitled to this answer before they commit.]',
    needsCompanyReview: true,
  },
  {
    category: 'Risk',
    question: 'Is FIBI regulated?',
    answer:
      '[REVIEW: state the regulator and licence number if FIBI is licensed, or state plainly that the platform is not licensed and what that means for investor protection. Do not publish an implied or ambiguous claim of regulated status — in Kenya that is an offence under the Capital Markets Act, not merely an SEO problem.]',
    needsCompanyReview: true,
  },

  {
    category: 'Membership',
    question: 'What does FIBI membership include?',
    answer:
      'Membership tiers control which projects and platform features you can access, and each tier’s entitlements are listed on the membership page. Membership is separate from any individual investment — paying for membership does not itself buy you a share in a project.',
  },
  {
    category: 'Membership',
    question: 'Do I need to be a member to invest?',
    answer:
      'Some projects are open to any verified account while others are limited to members at a given tier. The access conditions are shown on each project page, and the membership page lists which tier unlocks what.',
    needsCompanyReview: true,
  },
];

/** Entries safe to publish as-is. */
export const publishableFaqs = FAQS.filter((f) => !f.needsCompanyReview);

/**
 * Schema is built from the publishable subset only.
 *
 * Emitting an answer that reads "[REVIEW: …]" as a machine-readable claim
 * would be worse than emitting no schema at all.
 */
export const faqEntriesForSchema: FaqEntry[] = publishableFaqs.map(
  ({ question, answer }) => ({ question, answer }),
);

export const FAQ_CATEGORIES = [
  'Getting started',
  'Ownership & legal',
  'Money',
  'Risk',
  'Membership',
] as const;
