# FIBI Payments — Implementation Plan

**Status:** Draft for review · **Owner:** TBD · **Last updated:** 13 August 2026

Scope: replacing the current Stripe-only payment path with a bank-agnostic money
system covering SBM, ABSA, Standard Chartered, Morgan Stanley (E\*Trade) and
Bank of Singapore.

---

## 1. Decisions this plan is built on

| Question | Decision |
|---|---|
| Role of Morgan Stanley & Bank of Singapore | **Custody & treasury only.** They hold pooled funds and portfolio assets. Investors never pay "through" them. |
| Market & currency | **Dual-currency: KES and USD.** Kenyan retail plus international investors. |
| Sequencing | **API-first.** Design directly against Absa and Standard Chartered corporate APIs rather than shipping a manual-only interim. |

### A caveat on the sequencing decision

Corporate bank API access is not a signup — it is a commercial onboarding
(KYB, legal agreements, security review, UAT in the bank's sandbox, production
certification). Three to six months per bank is normal, and it is gated on the
bank, not on us.

This plan therefore does **not** treat reconciliation as a stopgap that API
access removes. Statement reconciliation is a permanent, required component:
even with live APIs, money arrives that no API announced — a mistyped
reference, a correspondent-bank wire, a direct deposit at a branch. Any system
that can only see payments it initiated will silently lose investor money.

Phases 1 and 2 below have **no bank dependency at all** and can start
immediately while onboarding runs in parallel.

---

## 2. The core reality: these are three different kinds of institution

The five names cannot be implemented as five payment gateways. They do not sell
the same thing.

| Institution | What it actually is | Role for FIBI | Integration surface |
|---|---|---|---|
| **SBM Bank (Kenya)** | Commercial bank | KES collection + settlement account | Corporate banking APIs and/or M-Pesa paybill settling to an SBM account. Confirm scope with relationship manager. |
| **ABSA (Absa Bank Kenya)** | Commercial bank | KES collection + settlement | Absa's corporate API programme — payment initiation, account information, direct debit. Contract-gated. |
| **Standard Chartered** | Corporate bank, Kenya + Singapore | **Primary dual-currency rail.** USD and KES collection, payouts, FX | Straight2Bank corporate channel and its API programme; statements as MT940/CAMT.053. Best fit because it spans both jurisdictions. |
| **Morgan Stanley (E\*Trade)** | Brokerage / wealth manager | **Custody of portfolio assets. Not a payment rail.** | No merchant acceptance exists. The public E\*Trade API is retail *trading* on your own account and is irrelevant here. Ingest positions/statements only. |
| **Bank of Singapore** | Private bank (OCBC group) | **USD custody & treasury. Not a payment rail.** | No payments API. SWIFT in/out plus periodic statements. Private-bank relationship minimums apply. |

**Consequence:** three of five are collection rails; two are custody endpoints we
*read from*, never *charge through*. Anyone briefing this as "integrate five
banks' payment APIs" is describing work that cannot be built as specified, and
saying so early is cheaper than discovering it in sprint four.

**Verify before building.** Every capability above is contract-specific and
changes between markets. Treat §8 as a due-diligence checklist to run with each
bank's relationship manager before a line of adapter code is written. Do not
design to a product page.

---

## 3. Two defects in the current schema that must be fixed first

These are not refactors for elegance. Both are load-bearing for correctness, and
both get harder to fix with every row added.

### 3.1 Money is stored as `Float`

`BACKEND/prisma/schema.prisma` — every monetary column is a binary floating-point
double:

```
minInvestment Float · totalFunding Float · currentFunding Float
amountInvested Float · currentValue Float · totalReturns Float
Transaction.amount Float · Payment.amount Float
```

Binary floating point cannot represent most decimal fractions exactly. `0.1 +
0.2 !== 0.3`. Errors accumulate across sums, so a project's `currentFunding`
drifts from the sum of its investments, and a reconciliation engine comparing
our figure to the bank's will throw false breaks forever.

**Fix:** store integer **minor units** (cents, KES cents) in `BigInt`, or use
Prisma's `Decimal`. Integer minor units are the stricter choice and what payment
providers themselves use — Stripe's API is already in cents, so the current code
is converting *away* from a correct representation.

This requires a data migration of existing rows and a pass over every read/write
site. It is the single highest-value item in this plan.

### 3.2 There is no currency on the records that need it

`currency` exists only on `Payment` and as one global default in `Settings`.
`Investment`, `Transaction` and `Project` have **no currency column at all**.

Dual-currency is therefore not currently expressible: a KES investment and a USD
investment are indistinguishable rows, and every total silently adds them
together.

**Fix:** every monetary amount carries its own currency. No exceptions, no
implicit global default. A money value in this system is always the pair
`(minorUnits, currency)`.

---

## 4. Target architecture

```
                    ┌─────────────────────────────────────┐
   investor ──────► │  Collection rails (money in)        │
                    │  ABSA · SBM · Standard Chartered    │
                    │  (+ Stripe/cards, M-Pesa)           │
                    └──────────────┬──────────────────────┘
                                   │ adapter interface
                    ┌──────────────▼──────────────────────┐
                    │  Payment orchestration              │
                    │  intent → authorise → settle        │
                    │  idempotency · webhooks · retries   │
                    └──────────────┬──────────────────────┘
                                   │
                    ┌──────────────▼──────────────────────┐
                    │  DOUBLE-ENTRY LEDGER  (source of    │
                    │  truth; multi-currency; immutable)  │
                    └──────┬───────────────────────┬──────┘
                           │                       │
        ┌──────────────────▼────────┐   ┌──────────▼─────────────────┐
        │  Reconciliation engine    │   │  Custody reporting (read)  │
        │  MT940 / CAMT.053 / CSV   │   │  Bank of Singapore         │
        │  match · break · resolve  │   │  Morgan Stanley (E*Trade)  │
        └───────────────────────────┘   └────────────────────────────┘
```

### 4.1 The ledger is the source of truth

Today, truth is spread across `Investment.amountInvested`,
`Project.currentFunding` and `Transaction.amount`, updated independently. Any
one failing mid-write leaves them disagreeing, with no way to tell which is
right.

Replace with an append-only double-entry ledger:

- Every movement is a **journal entry** of two or more **postings** that sum to
  zero *within a currency*.
- Postings are **never updated or deleted**. A correction is a new reversing
  entry. This is what makes the ledger auditable and what regulators expect.
- Balances are derived from postings (materialised for speed, never authoritative).
- Accounts are typed: investor wallet, project escrow, platform fee income,
  bank settlement, FX suspense.

`Project.currentFunding` becomes a **cached projection** of the ledger, not a
number anyone writes to directly.

### 4.2 One adapter interface, many rails

The current `Payment` model is Stripe-shaped — `stripeCheckoutSessionId` and
`stripePaymentIntentId` are columns on the shared table, and `PaymentProvider`
is an enum with exactly one member. Adding five institutions this way means five
more nullable columns per provider.

Move provider identifiers into a `providerRef` string plus a `providerMeta`
JSON, and define one interface every rail implements:

```js
// Each adapter implements exactly this. Nothing above it knows which bank it is.
{
  initiate(intent) -> { providerRef, nextAction }   // redirect, STK push, wire instructions
  status(providerRef) -> PaymentStatus
  handleCallback(rawRequest) -> NormalisedEvent     // verifies signature; returns canonical shape
  refund(providerRef, amount) -> RefundResult       // may legitimately throw UNSUPPORTED
}
```

Crucially, `initiate` must support rails with **no real-time authorisation**. A
SWIFT wire's "next action" is *display these bank details and a unique reference,
then wait* — possibly for days. The state machine must model that as a first-class
path, not a degraded card payment.

### 4.3 Reconciliation is not optional

For every settlement account, ingest statements (MT940, CAMT.053, or CSV) and
match credits to expected payments on reference, amount and date. Every line
lands in one of three buckets:

- **Matched** — auto-posted to the ledger.
- **Unmatched credit** — money arrived we cannot attribute. Needs an admin queue
  in the console. This is the common case for wires with mistyped references.
- **Missing** — we expected money that never came.

The admin console already has the table, filter, bulk-action and audit-log
primitives this needs (`DataTable`, `AuditFeed`); the reconciliation queue should
be built on them rather than as a new surface.

### 4.4 Idempotency

Non-negotiable, and the existing code already has the right instinct:
`PaymentResponse.providerEventId` is `@unique`, which makes duplicate webhook
delivery a no-op. Keep that pattern for every adapter. Banks retry aggressively
and deliver out of order; a double-credited investor is a far worse bug than a
dropped request.

---

## 5. Data model changes

```prisma
// Money is always (amount, currency). Amount is minor units — cents, never a float.
model LedgerAccount {
  id        String   @id @default(uuid())
  type      LedgerAccountType   // INVESTOR_WALLET | PROJECT_ESCROW | PLATFORM_FEE
                                // | BANK_SETTLEMENT | FX_SUSPENSE | CUSTODY
  currency  String              // ISO-4217; an account holds exactly one currency
  ownerId   String?             // user or project, depending on type
  externalRef String?           // bank account identifier where applicable
  postings  LedgerPosting[]
}

model JournalEntry {
  id          String   @id @default(uuid())
  // Natural-key idempotency: the same source event can never post twice.
  idempotencyKey String @unique
  description String
  occurredAt  DateTime
  createdAt   DateTime @default(now())
  postings    LedgerPosting[]
  paymentId   String?
}

model LedgerPosting {
  id        String   @id @default(uuid())
  entryId   String
  accountId String
  // Signed minor units. Postings within an entry sum to zero per currency.
  amount    BigInt
  currency  String

  entry   JournalEntry  @relation(fields: [entryId], references: [id])
  account LedgerAccount @relation(fields: [accountId], references: [id])

  @@index([accountId])
}
```

Alongside:

- `PaymentProvider` enum → `STRIPE | ABSA | SBM | STANCHART | MPESA | MANUAL_WIRE`
- `Payment`: drop the two `stripe*` columns for `providerRef` + `providerMeta Json`
- `Payment.status`: extend beyond `pending | succeeded | failed` to cover slow
  rails — `awaiting_funds`, `partially_settled`, `reversed`
- New `BankStatement` / `StatementLine` for reconciliation input
- New `CustodyPosition` for Bank of Singapore and Morgan Stanley holdings
- `Investment`, `Transaction`, `Project`: add `currency`; convert amounts to minor units

---

## 6. Phasing

**Phase 1 — Money foundation** *(no bank dependency; start now)*
Convert money to integer minor units. Add currency everywhere. Build the ledger
and post existing Stripe flows through it. Backfill historical rows. Reconcile
the ledger against current `currentFunding` values and investigate every
discrepancy — expect some, given §3.1.

**Phase 2 — Adapter abstraction** *(no bank dependency)*
Define the interface. Refactor Stripe to sit behind it, which is what proves the
abstraction is real rather than a wrapper shaped like Stripe. Build the
`MANUAL_WIRE` adapter — generates a reference, shows bank details, waits for
reconciliation. This alone makes all five institutions usable.

**Phase 3 — Reconciliation engine**
Statement ingestion, matching, and the admin break queue. Required before any
wire-based money moves at volume.

**Phase 4 — Collection bank APIs** *(gated on onboarding)*
ABSA and SBM for KES; Standard Chartered for USD and KES. Each behind the Phase 2
interface, each with sandbox certification before production.

**Phase 5 — Custody reporting** *(read-only)*
Ingest Bank of Singapore and Morgan Stanley statements/positions into
`CustodyPosition`. Surface in the admin console as treasury reporting. No payment
path.

**Phase 6 — Payouts & distributions**
Returns to investors. Higher-risk than collection — outbound money needs maker/
checker approval, limits, and sanctions screening on every beneficiary.

---

## 7. Compliance — treat as blocking, not follow-up

Pooling money from multiple investors into shared assets is a **regulated
activity**, not a technical feature. Confirm each of these with counsel before
Phase 4:

- **Licensing.** In Kenya, collective investment schemes fall under the Capital
  Markets Authority. Operating without the right licence is a criminal matter,
  not a compliance ticket. Singapore exposure raises MAS questions.
- **Client-money segregation.** Investor funds must sit in a trust/escrow
  account, legally separated from FIBI operating funds. This shapes the ledger
  account structure — `PROJECT_ESCROW` and platform accounts must never be
  commingled.
- **KYC/AML/CFT.** Identity verification, source-of-funds for large investments,
  sanctions screening (OFAC/UN/EU) at onboarding *and* on every payout
  beneficiary, suspicious-transaction reporting.
- **PCI-DSS.** Avoidable, and worth avoiding: never let card numbers touch our
  servers. Redirect/hosted fields only. The current Stripe Checkout approach is
  correct and should be preserved as the pattern.
- **Data protection.** Kenya's Data Protection Act 2019 for residency and
  subject rights; bank contracts usually add their own residency terms.
- **FX.** Dual-currency means someone bears conversion risk between an
  investor's payment and the project's denomination. Decide explicitly who, and
  post the difference to `FX_SUSPENSE` rather than letting it vanish into a
  rounding difference.

---

## 8. Per-bank due diligence checklist

Run with each relationship manager **before** designing that adapter:

1. Is there a production API, or is this file/SFTP-based? Get the actual spec.
2. Sandbox availability, and what certification is required to reach production.
3. Auth model — mTLS, OAuth2, signed requests, IP allowlisting.
4. Settlement timing and cut-off times per currency.
5. Statement formats and delivery cadence (MT940, CAMT.053, CSV; push or pull).
6. Webhook/callback support — or is polling the only option?
7. Refund and reversal support.
8. Per-transaction and daily limits.
9. Fee schedule, and who bears FX spread.
10. Onboarding timeline and required documentation.
11. Support path and SLA for production incidents.

---

## 9. Open decisions

1. **Which entity holds the escrow account, in which jurisdiction?** Drives
   licensing, tax and which bank is primary.
2. **Are investments denominated per project, or per investor?** A KES investor
   in a USD project needs an explicit answer.
3. **Which bank is the primary settlement account per currency?** Standard
   Chartered is the natural dual-currency candidate but this is commercial.
4. **Do we keep Stripe for cards?** Recommended — it stays the fastest path to
   card acceptance and keeps us out of PCI scope.
5. **M-Pesa: direct via Safaricom Daraja, or through the settlement bank?** For
   Kenyan retail this is likely the highest-volume rail and is not in the
   client's list of five.
6. **Payout approval model** — who authorises outbound money, and at what
   thresholds.

---

## 10. Principal risks

| Risk | Impact | Mitigation |
|---|---|---|
| Bank onboarding slips past plan | Whole feature blocked | Phases 1–3 have no bank dependency; `MANUAL_WIRE` makes all five usable without APIs |
| `Float` money errors already in production data | Balances that cannot be reconciled | Fix in Phase 1, before volume grows; audit existing rows during backfill |
| Regulatory finding mid-build | Project halted | Legal review before Phase 4, not after |
| Unattributed incoming wires | Investor money "lost" | Reconciliation break queue is Phase 3, ahead of wire volume |
| Duplicate webhook credits investor twice | Direct financial loss | Idempotency keys on every adapter, per the existing `providerEventId` pattern |
| Expecting a payment API from MS / Bank of Singapore | Sprint spent on work that cannot exist | Settled in §2 — custody read-only |

---

## 11. Immediate next steps

1. Review and sign off §1 decisions and §9 open questions.
2. Start legal/licensing review — longest lead time, blocks Phase 4.
3. Open onboarding conversations with ABSA, SBM and Standard Chartered; run the
   §8 checklist on each.
4. Begin Phase 1. It needs nothing from any bank and fixes a defect that is
   already accruing.
