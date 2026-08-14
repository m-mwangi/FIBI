/**
 * Membership billing.
 *
 * A membership period is bought exactly the way an investment is: an invoice
 * and a Payment row go in together, the rail-specific adapter initiates, and
 * the money is applied later by `settlePayment`. Nothing here knows what Stripe
 * or a bank wire is — that is the adapter's job — which is why a member can pay
 * for Premium by wire and have it activate through the same code path a card
 * uses.
 */

const { prisma } = require("../config/db");
const { getAdapter, usableProviders } = require("../payments");
const { recordMembershipSettled } = require("./ledger.service");
const {
  getOrCreateUserMembership,
  getPlanForTier,
  isTier,
  nextPeriodFor,
  tierRank,
} = require("./membership.service");

/** Errors the controller turns into specific HTTP responses. */
class BillingError extends Error {
  constructor(code, message, status = 400) {
    super(message);
    this.name = "BillingError";
    this.code = code;
    this.status = status;
  }
}

/**
 * Start payment for a membership tier.
 *
 * Returns the invoice plus the adapter's `nextAction`, which is a redirect for
 * a card and bank instructions for a wire. The membership itself does not move
 * until the money lands — `pendingTier` records the intent so the member can
 * see what they are waiting on.
 */
async function startCheckout({ userId, tier, provider = "STRIPE" }) {
  if (!isTier(tier)) {
    throw new BillingError("INVALID_TIER", "Unknown membership tier");
  }
  if (tier === "free") {
    throw new BillingError(
      "FREE_TIER_NOT_BILLABLE",
      "The free tier is not billable. Cancel your membership instead."
    );
  }

  const available = usableProviders();
  if (!available.includes(provider)) {
    throw new BillingError(
      "PROVIDER_UNAVAILABLE",
      `Unsupported payment provider "${provider}". Available: ${available.join(", ") || "(none)"}`
    );
  }

  const plan = await getPlanForTier(tier);
  if (!plan || !plan.active) {
    throw new BillingError("PLAN_UNAVAILABLE", "That membership plan is not available", 404);
  }
  if (plan.monthlyPriceMinor <= 0n) {
    throw new BillingError("PLAN_NOT_PRICED", "That membership plan has no price set");
  }

  const membership = await getOrCreateUserMembership(userId);

  // Membership is application-gated: paying is not a way around review.
  if (membership.applicationStatus !== "approved") {
    throw new BillingError(
      "APPLICATION_REQUIRED",
      "Your membership application must be approved before you can subscribe",
      403
    );
  }

  // One open invoice at a time. Two pending wires for the same member is a
  // reconciliation problem nobody wants to unpick by hand.
  const open = await prisma.membershipInvoice.findFirst({
    where: { userId, status: "pending" },
    orderBy: { createdAt: "desc" },
  });
  if (open) {
    throw new BillingError(
      "INVOICE_ALREADY_OPEN",
      "You already have a membership payment awaiting completion",
      409
    );
  }

  const { periodStart, periodEnd } = nextPeriodFor(membership);
  const currency = (plan.currency || "USD").toUpperCase();

  const { invoice, payment } = await prisma.$transaction(async (tx) => {
    const createdPayment = await tx.payment.create({
      data: {
        userId,
        provider,
        status: "pending",
        amountMinor: plan.monthlyPriceMinor,
        currency,
      },
    });

    const createdInvoice = await tx.membershipInvoice.create({
      data: {
        userId,
        tier,
        amountMinor: plan.monthlyPriceMinor,
        currency,
        status: "pending",
        periodStart,
        periodEnd,
        paymentId: createdPayment.id,
      },
    });

    await tx.userMembership.update({
      where: { userId },
      data: { pendingTier: tier },
    });

    return { invoice: createdInvoice, payment: createdPayment };
  });

  const adapter = getAdapter(provider);

  let result;
  try {
    result = await adapter.initiate({
      payment,
      // Adapters use this for the line-item description on a checkout page or
      // the narrative on a wire instruction.
      projectTitle: `FIBI ${plan.name} membership`,
    });
  } catch (e) {
    // The invoice and payment rows are already committed. Leaving them open
    // would trip the "one open invoice" guard above forever, locking the member
    // out of checkout because of a rail failure they cannot see or fix.
    await prisma
      .$transaction([
        prisma.membershipInvoice.update({
          where: { id: invoice.id },
          data: { status: "failed" },
        }),
        prisma.payment.update({
          where: { id: payment.id },
          data: { status: "failed" },
        }),
        prisma.userMembership.updateMany({
          where: { userId, pendingTier: tier },
          data: { pendingTier: null },
        }),
      ])
      .catch((cleanupError) =>
        console.error("[fibi] membership checkout cleanup failed:", cleanupError.message)
      );

    throw new BillingError(
      "PROVIDER_FAILED",
      `Could not start payment with ${provider}: ${e.message}`,
      502
    );
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      providerRef: result.providerRef || null,
      providerMeta: result.providerMeta || undefined,
      status: result.status || "pending",
    },
  });

  return {
    invoice,
    payment,
    provider,
    status: result.status || "pending",
    nextAction: result.nextAction,
  };
}

/**
 * Apply a settled membership payment.
 *
 * Called from inside `settlePayment`'s transaction, so the invoice, the
 * membership, the transaction record and the ledger entry all commit together.
 * Returns false when this payment does not fund a membership, which is how the
 * caller decides whether to fall through to the investment path.
 */
async function applySettledMembershipPayment(tx, { payment, eventId, occurredAt = new Date() }) {
  const invoice = await tx.membershipInvoice.findUnique({ where: { paymentId: payment.id } });
  if (!invoice) return false;

  // Idempotency: a replayed webhook must not extend the period twice.
  const claimed = await tx.membershipInvoice.updateMany({
    where: { id: invoice.id, status: "pending" },
    data: { status: "paid", paidAt: occurredAt },
  });
  if (claimed.count !== 1) return true;

  const existing = await tx.userMembership.findUnique({ where: { userId: invoice.userId } });

  await tx.userMembership.upsert({
    where: { userId: invoice.userId },
    create: {
      userId: invoice.userId,
      tier: invoice.tier,
      status: "active",
      applicationStatus: "approved",
      renewalDate: invoice.periodEnd,
      startedAt: occurredAt,
      badgeLabel: "Member",
    },
    update: {
      tier: invoice.tier,
      status: "active",
      renewalDate: invoice.periodEnd,
      // Paying again after cancelling is a resubscribe: clear the cancellation
      // rather than leaving a member marked as leaving.
      canceledAt: null,
      pendingTier: null,
      startedAt: existing?.startedAt ?? occurredAt,
      badgeLabel: "Member",
    },
  });

  await tx.transaction.create({
    data: {
      userId: invoice.userId,
      amountMinor: invoice.amountMinor,
      currency: invoice.currency,
      type: "MEMBERSHIP",
      status: "completed",
      paymentId: payment.id,
    },
  });

  await recordMembershipSettled(tx, {
    idempotencyKey: `membership-settled:${eventId || invoice.id}`,
    userId: invoice.userId,
    tier: invoice.tier,
    amountMinor: invoice.amountMinor,
    currency: invoice.currency,
    paymentId: payment.id,
    occurredAt,
  });

  return true;
}

/**
 * Mark a membership invoice failed when its payment does.
 *
 * Without this a failed card leaves `pendingTier` set forever and the member
 * sees "upgrade pending" on a payment that will never arrive.
 */
async function failMembershipInvoiceFor(tx, payment) {
  const invoice = await tx.membershipInvoice.findUnique({ where: { paymentId: payment.id } });
  if (!invoice || invoice.status !== "pending") return false;

  await tx.membershipInvoice.update({
    where: { id: invoice.id },
    data: { status: "failed" },
  });
  await tx.userMembership.updateMany({
    where: { userId: invoice.userId, pendingTier: invoice.tier },
    data: { pendingTier: null },
  });
  return true;
}

/**
 * Cancel a membership.
 *
 * Access runs to the end of the period already paid for — cancelling is "stop
 * billing me", not "take away what I bought". The expiry sweep flips the status
 * to `canceled` when the period ends.
 */
async function cancelMembership(userId) {
  const membership = await getOrCreateUserMembership(userId);
  if (membership.status !== "active") {
    throw new BillingError("NOT_ACTIVE", "You do not have an active membership to cancel");
  }
  if (membership.canceledAt) {
    throw new BillingError("ALREADY_CANCELED", "Your membership is already set to end");
  }

  const updated = await prisma.userMembership.update({
    where: { userId },
    data: { canceledAt: new Date(), pendingTier: null },
  });

  // Any invoice still waiting on money is void — the member has said they are
  // leaving, so an arriving wire should not silently renew them.
  await prisma.membershipInvoice.updateMany({
    where: { userId, status: "pending" },
    data: { status: "canceled" },
  });

  return updated;
}

/** Undo a cancellation while the period is still running. */
async function resumeMembership(userId) {
  const membership = await getOrCreateUserMembership(userId);
  if (!membership.canceledAt || membership.status !== "active") {
    throw new BillingError("NOT_CANCELED", "There is no scheduled cancellation to resume");
  }
  return prisma.userMembership.update({
    where: { userId },
    data: { canceledAt: null },
  });
}

/** Is `tier` a move up, down, or sideways from the member's current tier? */
function changeDirection(currentTier, nextTier) {
  const delta = tierRank(nextTier) - tierRank(currentTier);
  if (delta > 0) return "upgrade";
  if (delta < 0) return "downgrade";
  return "same";
}

async function listInvoices(userId, limit = 20) {
  return prisma.membershipInvoice.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      payment: { select: { id: true, provider: true, status: true, providerRef: true } },
    },
  });
}

function invoiceToDto(inv) {
  return {
    id: inv.id,
    tier: inv.tier,
    amountMinor: inv.amountMinor,
    currency: inv.currency,
    status: inv.status,
    periodStart: inv.periodStart.toISOString(),
    periodEnd: inv.periodEnd.toISOString(),
    paidAt: inv.paidAt ? inv.paidAt.toISOString() : null,
    createdAt: inv.createdAt.toISOString(),
    payment: inv.payment
      ? {
          id: inv.payment.id,
          provider: inv.payment.provider,
          status: inv.payment.status,
        }
      : null,
  };
}

module.exports = {
  BillingError,
  startCheckout,
  applySettledMembershipPayment,
  failMembershipInvoiceFor,
  cancelMembership,
  resumeMembership,
  changeDirection,
  listInvoices,
  invoiceToDto,
};
