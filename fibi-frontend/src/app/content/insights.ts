/**
 * Editorial corpus for `/insights`.
 *
 * These pages carry the site's informational search demand. The commercial
 * pages answer "should I use FIBI"; nobody types that. People type "how does
 * fractional land ownership work in Kenya" and "what is an official search" —
 * and those are the prompts an answer engine resolves by quoting whoever
 * explained it most precisely.
 *
 * Editorial rules for anything added here:
 *
 *  - Every factual claim is about Kenyan land law or public record, not about
 *    FIBI's commercial terms. Marketing claims belong on the product pages
 *    where a reader expects them.
 *  - Cite the instrument by name (Act, section, article). A named statute is
 *    checkable; "Kenyan law requires" is not, and an unattributed legal claim
 *    on a YMYL page is exactly what quality raters mark down.
 *  - Lead each article with a complete answer in roughly 40-80 words. It has
 *    to make sense lifted out of the page entirely.
 *  - `updated` is a real review date. Land registry practice changes; stale
 *    procedural guidance is actively harmful, so revisit each article's date
 *    when you review it rather than bumping it to look fresh.
 */

export type Block =
  | { kind: 'p'; text: string }
  | { kind: 'h2'; text: string; id: string }
  | { kind: 'h3'; text: string; id: string }
  | { kind: 'ul'; items: string[] }
  | { kind: 'ol'; items: string[] }
  | { kind: 'note'; text: string }
  | { kind: 'facts'; rows: Array<{ label: string; value: string; note?: string }> };

export type Insight = {
  slug: string;
  title: string;
  /** Meta description. Under ~155 characters. */
  description: string;
  /** The extractable lead. Rendered in an AnswerCapsule. */
  answer: string;
  published: string;
  updated: string;
  readingMinutes: number;
  topic: string;
  body: Block[];
};

export const INSIGHTS: Insight[] = [
  {
    slug: 'how-fractional-land-ownership-works-in-kenya',
    title: 'How fractional land ownership works in Kenya',
    description:
      'How several investors jointly hold Kenyan land, the structures used to do it legally, and what each one means for your rights on exit.',
    answer:
      'Fractional land ownership in Kenya means several investors jointly fund one parcel or development and share returns in proportion to their contribution. Because Kenyan land registries record a defined proprietor rather than a pool of contributors, the interest is normally held through a company, a trust, or co-tenancy on the title. The structure chosen determines your legal rights, your exit route, and your tax position.',
    published: '2026-02-10',
    updated: '2026-08-17',
    readingMinutes: 8,
    topic: 'Ownership structures',
    body: [
      {
        kind: 'p',
        text: 'Buying land outright in Kenya prices most people out of the market well before they reach the parcels worth owning. Fractional models exist to close that gap, but "fractional" describes a commercial arrangement, not a legal one — and the legal structure underneath is what actually determines what you own.',
      },
      { kind: 'h2', id: 'structures', text: 'What structures are used to hold land fractionally?' },
      {
        kind: 'p',
        text: 'Kenyan land registries record a registered proprietor. They do not record fifty contributors against one parcel. Fractional arrangements therefore interpose a legal person or a defined co-ownership between the investors and the title. Four structures do most of the work:',
      },
      {
        kind: 'ul',
        items: [
          'Special purpose company. A limited company registered under the Companies Act 2015 holds the title, and investors hold shares. Your interest is a shareholding, transferable by share transfer without touching the land register.',
          'Trust. A trustee holds the legal title for beneficiaries under a trust deed. Common where investors want the asset ring-fenced from an operator\'s own balance sheet.',
          'Co-tenancy on the title. The Land Registration Act 2012 recognises joint tenancy and tenancy in common. Tenancy in common gives each holder a distinct, inheritable share; joint tenancy carries survivorship, where a deceased holder\'s interest passes to the survivors rather than to their estate.',
          'Sectional titles. Under the Sectional Properties Act 2020, a building can be subdivided into individually titled units with shared common property. This produces a real title in your own name, but it applies to units in a development, not to raw land.',
        ],
      },
      {
        kind: 'note',
        text: 'The distinction that matters most: a share in a company that owns land is not land. It is a security. Your protections, your exit mechanics and your tax treatment all follow from that, and they differ substantially from holding a title deed.',
      },
      { kind: 'h2', id: 'what-you-own', text: 'What do you actually own?' },
      {
        kind: 'p',
        text: 'Ask any platform to name the instrument. A credible answer identifies the entity on the title, the document that records your interest, and the register on which that interest appears. If the answer is only that you own "a fraction of the land", the arrangement has not been thought through — or it has, and the detail is unflattering.',
      },
      {
        kind: 'facts',
        rows: [
          {
            label: 'Company shareholding',
            value: 'Interest recorded in the company register',
            note: 'Transferable by share transfer; you are exposed to the company\'s liabilities and governance.',
          },
          {
            label: 'Trust beneficiary',
            value: 'Interest recorded in the trust deed',
            note: 'Assets ring-fenced from the trustee\'s own creditors where the trust is validly constituted.',
          },
          {
            label: 'Tenancy in common',
            value: 'Name appears on the land title',
            note: 'Strongest position; also the least practical above a handful of co-owners.',
          },
          {
            label: 'Contractual profit share',
            value: 'No proprietary interest at all',
            note: 'You are an unsecured creditor of the operator. Treat with caution.',
          },
        ],
      },
      { kind: 'h2', id: 'restrictions', text: 'Who is legally allowed to hold Kenyan land?' },
      {
        kind: 'p',
        text: 'Article 65 of the Constitution of Kenya 2010 limits non-citizens to leasehold interests not exceeding 99 years. A company counts as a citizen for this purpose only if it is wholly owned by Kenyan citizens, so a single foreign shareholder can change the character of the entity holding the title. Agricultural land carries a further layer: transactions in agricultural land require the consent of the relevant Land Control Board under the Land Control Act, and a dealing entered into without that consent becomes void.',
      },
      { kind: 'h2', id: 'exit', text: 'How do you exit a fractional investment?' },
      {
        kind: 'p',
        text: 'This is the question that separates workable arrangements from traps. There is no exchange for fractional land interests in Kenya, so exit depends entirely on a mechanism written into the structure: a buy-back obligation, a permitted transfer to another investor, or a sale of the whole asset at the end of a defined term. Confirm which applies before committing, and confirm it in writing.',
      },
      {
        kind: 'p',
        text: 'Where the answer is a sale of the underlying asset at term end, your capital is committed for that full term. Treat the projected term as a floor rather than an estimate — property disposals in Kenya routinely run past their target date.',
      },
    ],
  },

  {
    slug: 'land-title-verification-kenya-official-search',
    title: 'Verifying a Kenyan land title: the checks that actually matter',
    description:
      'The official search, encumbrance checks, rates and rent clearance, and Land Control Board consent — what each confirms and what it misses.',
    answer:
      'Verifying Kenyan land title starts with an official search at the land registry, which confirms the registered proprietor and any registered encumbrances such as charges, cautions or restrictions. A search alone is not enough: it must be paired with rates and rent clearance certificates, a physical site visit, and, for agricultural land, Land Control Board consent. Each check covers a different failure mode.',
    published: '2026-03-04',
    updated: '2026-08-17',
    readingMinutes: 9,
    topic: 'Due diligence',
    body: [
      {
        kind: 'p',
        text: 'Most Kenyan land disputes that reach court were avoidable at the diligence stage. The checks below are not exotic; they are routine conveyancing practice, and the reason they get skipped is that each one costs time when a deal feels urgent.',
      },
      { kind: 'h2', id: 'official-search', text: 'What is an official search and what does it prove?' },
      {
        kind: 'p',
        text: 'An official search is a request to the land registry for the current entries on a title. It returns the registered proprietor, the tenure and term, the size of the parcel, and any registered encumbrances — charges securing a loan, cautions lodged by a third party claiming an interest, restrictions limiting dealings, and caveats.',
      },
      {
        kind: 'p',
        text: 'Searches are conducted through the Ardhisasa platform for registries that have migrated to it, and manually at the relevant registry for those that have not. A search reflects the register at the moment it is issued and nothing more. It goes stale immediately, which is why conveyancers repeat it just before completion.',
      },
      {
        kind: 'note',
        text: 'An official search proves what is registered. It does not prove that the registration is correct, that the person presenting the deed is the registered proprietor, or that nobody is living on the land. Those are separate checks, and the first two are how title fraud actually works.',
      },
      { kind: 'h2', id: 'beyond-search', text: 'What does a search miss?' },
      {
        kind: 'ol',
        items: [
          'Identity fraud. The register names a proprietor; it does not confirm the person in front of you is that proprietor. Verify identity documents independently against the registered particulars.',
          'Occupation and adverse claims. Unregistered occupiers, tenants and boundary encroachments do not appear on a search. Only a physical site visit finds them.',
          'Historical defects. A title issued irregularly can be revoked. Where the chain includes a subdivision or an allocation of public land, trace it back rather than accepting the current entry at face value.',
          'Unpaid outgoings. Land rates owed to the county and land rent owed to the national government are recovered against the land, not the previous owner.',
        ],
      },
      { kind: 'h2', id: 'clearances', text: 'Which clearances are required before a transfer?' },
      {
        kind: 'facts',
        rows: [
          {
            label: 'Land rates clearance',
            value: 'From the county government',
            note: 'Confirms county rates are paid up. Arrears attach to the land.',
          },
          {
            label: 'Land rent clearance',
            value: 'For leasehold land, from the Ministry of Lands',
            note: 'Applies to leasehold titles where annual ground rent is payable.',
          },
          {
            label: 'Land Control Board consent',
            value: 'For agricultural land, under the Land Control Act',
            note: 'A controlled transaction without consent is void, not merely voidable.',
          },
          {
            label: 'Spousal consent',
            value: 'Where the land is matrimonial property',
            note: 'Required under the Matrimonial Property Act 2013 and the Land Act 2012.',
          },
          {
            label: 'Stamp duty',
            value: '4% urban, 2% rural, on assessed value',
            note: 'Assessed by a government valuer; the assessment can exceed the price paid.',
          },
        ],
      },
      { kind: 'h2', id: 'fractional', text: 'What changes when the investment is fractional?' },
      {
        kind: 'p',
        text: 'You are usually not the party conducting the search — the entity acquiring the land is. That makes the diligence question a governance question: who performed the checks, what did they find, and can you see the documents? A platform that will not show you the official search, the clearance certificates and the consent for a project it is asking you to fund has answered the question by declining to.',
      },
      {
        kind: 'p',
        text: 'Ask for the search dated close to acquisition, not one from months earlier, and check the proprietor named on it against the entity you are being asked to invest in.',
      },
    ],
  },

  {
    slug: 'freehold-vs-leasehold-land-kenya',
    title: 'Freehold vs leasehold land in Kenya: what changes for an investor',
    description:
      'The practical differences between freehold and leasehold tenure in Kenya — term, renewal, ground rent, eligibility and effect on resale value.',
    answer:
      'Freehold land in Kenya is held indefinitely with no ground rent, while leasehold is held for a fixed term — commonly 99 years — from the national or county government, subject to annual land rent and to conditions of user. Non-citizens may hold leasehold only, capped at 99 years under Article 65 of the Constitution. Remaining lease term materially affects both resale value and financeability.',
    published: '2026-04-22',
    updated: '2026-08-17',
    readingMinutes: 7,
    topic: 'Tenure',
    body: [
      {
        kind: 'p',
        text: 'Tenure is the first thing to establish about any Kenyan parcel and the thing most often glossed over in a listing. It determines who may hold it, what it costs to keep, and what it will be worth to the next buyer.',
      },
      { kind: 'h2', id: 'freehold', text: 'What is freehold tenure?' },
      {
        kind: 'p',
        text: 'Freehold confers ownership without a time limit and without ground rent to the state. It is the strongest form of tenure available in Kenya. It is not unconditional — land remains subject to compulsory acquisition, to planning control, and, for agricultural parcels, to the Land Control Act — but there is no expiry date to manage and no annual rent to keep current.',
      },
      { kind: 'h2', id: 'leasehold', text: 'What is leasehold tenure?' },
      {
        kind: 'p',
        text: 'Leasehold grants the right to hold and use land for a defined term, most commonly 99 years, in exchange for annual land rent and compliance with the conditions of user in the grant. Much urban land in Kenya is leasehold. At the end of the term the interest reverts to the grantor unless the lease is extended or renewed, and extension is an application rather than an entitlement.',
      },
      {
        kind: 'facts',
        rows: [
          { label: 'Term', value: 'Freehold: indefinite. Leasehold: fixed, commonly 99 years' },
          { label: 'Annual cost to the state', value: 'Freehold: none. Leasehold: land rent' },
          {
            label: 'Non-citizen eligibility',
            value: 'Freehold: not permitted. Leasehold: permitted up to 99 years',
            note: 'Constitution of Kenya 2010, Article 65.',
          },
          {
            label: 'Conditions of user',
            value: 'Freehold: planning control only. Leasehold: conditions in the grant',
            note: 'Breach of a condition of user can ground forfeiture proceedings.',
          },
          {
            label: 'Effect of short residue',
            value: 'Leasehold value falls as the remaining term shortens',
            note: 'Lenders commonly decline security over leases with a short residual term.',
          },
        ],
      },
      { kind: 'h2', id: 'residue', text: 'Why does the remaining lease term matter so much?' },
      {
        kind: 'p',
        text: 'A leasehold with 90 years left and one with 20 years left are different assets at the same nominal size. As the residue shortens, the pool of buyers narrows, mortgage finance becomes harder to secure against it, and the discount to freehold widens. If a project is built on leasehold land, the residual term at the point you would exit — not the term today — is the figure that matters.',
      },
      {
        kind: 'note',
        text: 'For any leasehold project, ask for the commencement date of the term and calculate the residue yourself. A listing that quotes "99-year lease" without a start date is quoting the original grant, not what remains.',
      },
      { kind: 'h2', id: 'renewal', text: 'Can a leasehold be extended?' },
      {
        kind: 'p',
        text: 'Extension or renewal is applied for through the Ministry of Lands, ordinarily in the later part of the term, and is assessed against compliance with the lease conditions and current planning policy. It is granted in practice in many cases, but it involves a premium, a fresh set of conditions, and an outcome that cannot be assumed in advance. Treat an assumed renewal in a projection as an assumption, and price it accordingly.',
      },
    ],
  },
];

export const insightBySlug = (slug: string): Insight | undefined =>
  INSIGHTS.find((i) => i.slug === slug);

/** Newest review date first — the order a returning reader expects. */
export const insightsByRecency = (): Insight[] =>
  [...INSIGHTS].sort((a, b) => b.updated.localeCompare(a.updated));
