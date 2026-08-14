# Absa Payments Services — integration analysis

Companion to [PAYMENTS.md](PAYMENTS.md). That document plans the payments
architecture across all rails; this one analyses the **Absa Payments Services
v1.0** OpenAPI spec specifically and says how to build the `ABSA` adapter
against it.

Source: `payments_V1.0.0.json` — 5 endpoints, 34 schemas.

---

## 1. What this API actually is

It is a **UK Open Banking (OBIE) payment initiation API**, renamed. Every
structural tell is there: the `Data`/`Risk` request envelope, `Initiation` /
`InstructedAmount` / `RemittanceInformation`, `PaymentContextCode`,
`ReadRefundAccount`, and a two-phase *consent then payment* lifecycle.

That is good news. It means the semantics are documented publicly by OBIE even
where Absa's own spec is silent, and the failure modes are well known.

FIBI acts as the **PISP** (Payment Initiation Service Provider). `ConsentType`
in `SupplementaryData` is a required field and takes `PISP` for this flow.

### Does it do what FIBI needs?

Yes — **collection**, which is the direction that matters. Money moves:

```
DebtorAccount  (the investor)  ──►  CreditorAccount  (FIBI's collection account)
```

FIBI is the creditor. The investor authorises the debit from their own bank.
This is genuinely the right shape for taking investment money in, and it is a
better fit than a card rail for large-ticket amounts.

One structural detail worth noticing: **`DebtorAccount` is not in the required
list** for `Initiation` — only `InstructionIdentification` and
`LocalInstrument` are. That strongly implies the investor picks their own
account inside their Absa banking channel during authorisation. If so, FIBI
never has to ask investors for account numbers, which removes a large amount of
data-entry error and a chunk of PII you would otherwise have to store. **Confirm
this with the relationship manager** — it materially changes the onboarding UX.

---

## 2. The flow, concretely

```
1.  POST /domestic-payment-consents
        → { ConsentId, Status: "AwaitingAuthorisation", Links[] }

2.  ***  Investor authorises out-of-band, in their Absa channel  ***
        The spec does NOT describe this step. See §3.

3.  GET  /domestic-payment-consents/{consentId}
        → poll until Status is authorised (or rejected/expired)

4.  GET  /domestic-payment-consents/{consentId}/funds-confirmation   [optional]
        → { FundsAvailable: bool, FundConfirmationFailureReasons[] }

5.  POST /domestic-payments   { Data: { ConsentId, ... }, Risk }
        → { DomesticPaymentId, Status }

6.  GET  /domestic-payments/{domesticPaymentId}
        → poll until a terminal status
```

Step 4 is a free pre-flight check. Use it: a failed funds check before step 5
turns a hard payment failure into a friendly "insufficient funds" message, and
costs one GET.

---

## 3. What the spec does not tell you — ask before designing

These are blocking. Each maps to an item in PAYMENTS.md §8.

| # | Gap | Why it blocks |
|---|---|---|
| 1 | **No `servers` block.** The spec carries no base URL for sandbox or production. | Cannot call anything. |
| 2 | **No `securitySchemes`.** There is no auth documented at all, yet 401 and 403 are defined responses. | OBIE normally means mTLS **plus** OAuth2 client credentials, often with a detached JWS signature per request. Need the exact model, the certificate type, and who issues certs. |
| 3 | **How does the investor authorise the consent?** No authorisation endpoint, no redirect URL field. `Links[]` in the response may carry one; `Authorisation.CompletionDateTime` implies the TPP learns when it finished. | This is the entire user journey. Without it there is no product. |
| 4 | **Valid `LocalInstrument` values.** `maxLength: 10`, no enum. | Kenya has several rails (RTGS, EFT, PesaLink) with different cut-offs, limits and fees. Wrong value = rejected or expensively routed. |
| 5 | **Valid `ChargeBearer` values.** `maxLength: 1`, no enum, no description of codes. | Decides whether FIBI receives the full `InstructedAmount` or an amount net of fees. Directly drives `partially_settled`. |
| 6 | **Does Absa deduplicate on `InstructionIdentification`?** | This is the difference between a safe retry and a double debit. See §5. |
| 7 | **Any callback/webhook, or is polling the only option?** No callback endpoint exists in the spec. | Determines whether the adapter needs a poller and how aggressive it must be. |
| 8 | **Supported currencies.** "Domestic" implies KES only. | FIBI's `Settings.currency` defaults to `USD` and projects are displayed in USD. See §6. |
| 9 | **What does 412 Precondition Failed mean?** Undocumented on every endpoint. | Almost certainly "consent is not in a state that permits this" — but guessing at a payments error is not acceptable. |
| 10 | Sandbox availability and certification steps to reach production. | PAYMENTS.md §8.2. |
| 11 | Per-transaction and daily limits; fee schedule. | PAYMENTS.md §8.8–8.9. |
| 12 | Statement format and cadence for the collection account (MT940 / CAMT.053 / CSV). | Reconciliation is the real source of truth — §7. |

---

## 4. Mapping onto FIBI's existing model

The schema already has `PaymentProvider.ABSA` and `BankInstitution.ABSA`, so no
migration is needed to start.

### Status mapping

`PaymentStatus` in the spec has six values. Map them to FIBI's enum as follows:

| Absa `PaymentStatus` | FIBI `PaymentStatus` | Terminal? | Notes |
|---|---|---|---|
| `Pending` | `pending` | no | |
| `AcceptedSettlementInProcess` | `awaiting_funds` | no | In flight. |
| `AcceptedWithoutPosting` | `awaiting_funds` | no | Accepted but **not posted to an account**. Not success. |
| `AcceptedSettlementCompleted` | `succeeded` | yes | Debit side completed. |
| `AcceptedCreditSettlementCompleted` | `succeeded` | yes | Credit side confirmed — the stronger signal for a collection. |
| `Rejected` | `failed` | yes | |

Two traps here:

- **`AcceptedWithoutPosting` is not success.** Treating it as settled credits an
  investor for money that has not landed. It is the single most misread status
  in OBIE.
- **`AcceptedSettlementCompleted` confirms the debit, not the credit.** For a
  collection, the value that proves money reached FIBI's account is
  `AcceptedCreditSettlementCompleted` — or, definitively, the bank statement.
  Use API status to drive the investor-facing UX; let reconciliation drive the
  ledger, exactly as PAYMENTS.md §4.3 requires.

### Money — the float boundary

`InstructedAmount.Amount` is `type: number, format: double`. FIBI stores
`BigInt` minor units precisely because floats drift (see `utils/money.js`).

The rule: **convert at the adapter boundary only, and never compute in floats.**

- Outbound: `amountMinor` → decimal string with the currency's exponent, emitted
  as a JSON number. Do not build it by repeated division.
- Inbound: parse `Charges[].Amount` back to minor units immediately, on arrival.
- Reconcile against the integer, never the float.

`maximum` is `9999999999999.99`, far above `Settings.maxInvestmentMinor`
(default 5 000 000 minor = 50 000.00), so the ceiling is not a constraint.

### Reference fields — where the reconciliation key goes

This matters more than it looks, because reconciliation matches on reference.

| Field | Max | Appears on | Use for |
|---|---|---|---|
| `InstructionIdentification` | **20** | — | Idempotency key. See §5. |
| `EndToEndIdentification` | *none* | passed through the chain unchanged | FIBI `Payment.id` (36-char UUID) |
| `RemittanceInformation.Reference` | 40 | **creditor** statement | **The reconciliation key** — a UUID fits in 40 |
| `RemittanceInformation.Unstructured` | 100 | debtor statement | Human narrative the investor sees |

`Reference` lands on FIBI's own statement, so that is the field the statement
matcher in `reconciliation.service.js` should key on. `Unstructured` is what the
investor sees on their statement — make it legible, e.g. `FIBI investment —
Mt. Kenya Avocado Farm`.

### `CreditorAccount.SchemeName`

An enum of four construction rules for the `Identification` string:

```
AccountType.BranchId.AccountNumber
AccountType.SwiftCode.AccountNumber
AccountType.AccountNumber
AccountType.BranchId-RegionCode.BankCode.AccountNumber
```

`Identification` is a single concatenated string whose shape is dictated by the
scheme chosen. Build it in one place with a per-scheme formatter and validate
before sending — a malformed identification is a 400 at best and a misdirected
payment at worst. Note `SecondaryIdentification` (the bank name) is **required**,
which is unusual and easy to miss.

---

## 5. The dangerous part: idempotency and double payment

Read this section twice. It is where real money gets lost.

**`InstructionIdentification` has `maxLength: 20`.** A UUID is 36 characters and
will not fit. A ULID (26) will not fit either. You need a compact scheme —
roughly 17–19 characters of base36 timestamp plus randomness, with a short
prefix.

**The `X-Absa-Nonce` header is single-use and valid 15 minutes.** "Every request
will be processed only once per nonce."

Now consider `POST /domestic-payments` timing out, or returning 502. You do not
know whether the payment was created.

- Retry with the **same nonce** → rejected. Safe, but you learn nothing.
- Retry with a **new nonce** → may create a **second payment**. Catastrophic.

The nonce protects against network-level duplicate delivery. It does **not**
make your retry logic safe, because your retry legitimately carries a new nonce.

**The safe procedure:**

1. Generate `InstructionIdentification` and persist it on the `Payment` row
   **before** the first call. Never regenerate it on retry.
2. On any ambiguous failure (timeout, 502, 500), do **not** blind-retry.
   `GET /domestic-payments/{id}` if you captured an id; otherwise treat the
   payment as in-doubt and resolve it by reconciliation.
3. Only retry the POST when you have positively established that no payment
   exists — which requires knowing whether Absa dedupes on
   `InstructionIdentification` (gap #6 in §3).
4. Persist every attempt's `X-Absa-ClientInteractionId` in
   `Payment.providerMeta`. It is the correlation id Absa support will ask for,
   and without it an incident is unresolvable.

Store `DomesticPaymentId` in `Payment.providerRef` — the existing
`@@index([provider, providerRef])` is exactly the lookup the poller and the
statement matcher need.

For inbound de-duplication, keep using `PaymentResponse.providerEventId`
(`@unique`), per PAYMENTS.md §4.4.

---

## 6. Currency

The API is **domestic**, which in Kenya means **KES**. FIBI's `Settings.currency`
defaults to `USD`, and the admin console and project pages render dollars.

`utils/money.js` already handles both (`USD: 2`, `KES: 2`) and deliberately
refuses to add amounts across currencies. That guard will now fire in anger.

Someone has to answer PAYMENTS.md §9.2 — *are investments denominated per
project or per investor?* — before this adapter can settle a single payment. A
KES collection against a USD-denominated project needs an explicit FX policy,
an FX suspense account, and a decision on who bears the spread. This is a
commercial decision, not an engineering one, and it blocks go-live.

---

## 7. Polling and reconciliation

The spec defines **no callbacks**. Every state transition must be discovered by
polling, which shapes the adapter:

- `handleCallback` from the PAYMENTS.md §4.2 interface is **unsupported** for
  this rail. Its role is taken by statement ingestion.
- A poller walks non-terminal payments on a backoff schedule. Respect the
  `Retry-After` header on **429** — it is defined on every endpoint and is in
  seconds.
- Consents expire. `CutOffDateTime` is returned on the consent; a consent that
  is never authorised must be reaped, not polled forever.
- Bank statements remain the source of truth for the ledger. The existing
  `reconciliation.service.js` and `statementParser.service.js` are where an Absa
  credit is finally confirmed, matched on `RemittanceInformation.Reference`.

Handle the full error set — `400, 401, 403, 412, 429, 500, 502` — distinctly.
`401`/`403` mean the credential or certificate is wrong and retrying is
pointless; `429` means back off; `502`/`500` are ambiguous and must go through
the in-doubt path in §5, never a blind retry.

---

## 8. Adapter shape

Conforming to the PAYMENTS.md §4.2 interface:

```js
// services/payments/absa.adapter.js
{
  // Creates the consent, persists InstructionIdentification + ConsentId,
  // returns the authorisation step as the next action.
  initiate(intent) -> { providerRef, nextAction: { type: 'AUTHORISE', ... } },

  // GET consent status until authorised, then GET payment status.
  status(providerRef) -> PaymentStatus,

  // Unsupported: this API has no callbacks. Statement ingestion replaces it.
  handleCallback() -> throw UNSUPPORTED,

  // Not present in the spec at all — no refund or reversal endpoint exists.
  refund() -> throw UNSUPPORTED,
}
```

Note the last line. **There is no refund or reversal endpoint in this API.**
A mistaken or duplicated collection can only be undone by a manual outbound
process at the bank. Confirm the operational path for that before taking real
money, and make sure `PaymentStatus.reversed` can be set by an admin action.

---

## 9. Defects and inconsistencies in the spec

Worth raising with Absa — several suggest the document is generated and
unreviewed, which lowers confidence in the parts that are not testable:

1. `DomesticPaymentStatusResultRisk` is an **empty object** (`additionalProperties:
   false`, no properties), while the other three `*Risk` schemas carry
   `MerchantCategoryCode`, `PaymentContextCode` and `Address`. Almost certainly a
   generation bug.
2. **Date types are inconsistent.** `CompletionDateTime` and
   `FundsAvailableDateTime` are `format: date-time`; `StatusUpdateDateTime`,
   `CutOffDateTime`, `ExpectedExecutionDateTime`, `ExpectedSettlementDateTime`
   and `CreationDateTime` are bare strings. Parse all of them defensively.
3. No `servers`, no `securitySchemes` (§3).
4. `ChargeBearer` is `maxLength: 1` with no enum — a single-character code with
   no legend.
5. `Metadatum.Value` has **no type at all**.
6. `PaymentContextCode` documents its valid values in prose only, not as an enum.
7. `SupplementaryData` descriptions contain mojibake — `â+â`, `âââ` — where
   quotes and dashes were mis-encoded. The embedded regex `^[0-9-+ ()]+$` is
   readable, but the surrounding text is corrupted.
8. **`additionalProperties: false` is set on every schema.** Sending any field
   the spec does not define is a 400. Do not pass through extra keys.

---

## 10. What to do next

1. **Send §3 to the relationship manager as a single list.** Items 1–3 block
   any implementation at all; nothing should be built before they are answered.
2. **Get FX and denomination settled** (§6, PAYMENTS.md §9.2). Commercial
   decision, long lead time, blocks go-live rather than build.
3. **Build against a sandbox only after items 1–3 land.** Until then the useful
   work is rail-independent: the ledger, the adapter interface, and the
   reconciliation queue — PAYMENTS.md Phases 1–3, none of which depend on Absa.
4. When implementation starts, write the status-mapping table in §4 as a pure
   function with unit tests covering all six values. The `AcceptedWithoutPosting`
   and `AcceptedSettlementCompleted` cases are the ones that will be got wrong.

Until Absa is live, `MANUAL_WIRE` already makes the Absa relationship usable —
per PAYMENTS.md §10, no bank API is on the critical path.
