import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, Clock, Loader2, Receipt, RotateCcw } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useMembership } from "../context/MembershipContext";
import { formatMoney } from "@/lib/money";
import { tierLabel, type MembershipInvoice } from "@/lib/membership";
import { MembershipStatusCard } from "../components/membership/MembershipStatus";
import { PlanGrid } from "../components/membership/PlanGrid";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";

/**
 * Manage membership: change tier, see what's been billed, cancel or resume.
 *
 * This page did not exist — the FAQ promised upgrades, downgrades, and
 * cancellation with nothing behind them.
 */

const INVOICE_STYLES: Record<string, string> = {
  paid: "bg-emerald-100 text-emerald-800",
  pending: "bg-amber-100 text-amber-800",
  failed: "bg-rose-100 text-rose-800",
  canceled: "bg-slate-200 text-slate-600",
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function InvoiceRow({ invoice }: { invoice: MembershipInvoice }) {
  return (
    <tr className="border-b border-slate-100 last:border-0">
      <td className="py-3 pr-4">
        <p className="font-medium text-slate-800">{tierLabel(invoice.tier)}</p>
        <p className="text-xs text-slate-500">
          {formatDate(invoice.periodStart)} – {formatDate(invoice.periodEnd)}
        </p>
      </td>
      <td className="py-3 pr-4 text-right font-medium tabular-nums text-slate-800">
        {formatMoney(invoice.amountMinor, invoice.currency)}
      </td>
      <td className="py-3 pr-4 text-right">
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            INVOICE_STYLES[invoice.status] ?? "bg-slate-100 text-slate-600"
          }`}
        >
          {invoice.status}
        </span>
      </td>
      <td className="hidden py-3 text-right text-xs text-slate-500 sm:table-cell">
        {invoice.paidAt ? formatDate(invoice.paidAt) : formatDate(invoice.createdAt)}
      </td>
    </tr>
  );
}

export default function MembershipBilling() {
  const { isAuthenticated } = useAuth();
  const {
    membership,
    stage,
    plans,
    invoices,
    openInvoice,
    latestApplication,
    refreshInvoices,
    startCheckout,
    cancelMembership,
    resumeMembership,
  } = useMembership();

  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    void refreshInvoices();
  }, [refreshInvoices]);

  const currentPlan = plans.find((p) => p.tier === membership.tier);

  const runCancel = async () => {
    setBusy(true);
    setFlash(null);
    const res = await cancelMembership();
    setBusy(false);
    setFlash(
      res.success
        ? { ok: true, text: "Membership will end when the current period does." }
        : { ok: false, text: res.error ?? "Could not cancel." }
    );
  };

  const runResume = async () => {
    setBusy(true);
    setFlash(null);
    const res = await resumeMembership();
    setBusy(false);
    setFlash(
      res.success
        ? { ok: true, text: "Membership resumed — billing will continue as normal." }
        : { ok: false, text: res.error ?? "Could not resume." }
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-16 pt-24">
      <div className="mx-auto max-w-4xl space-y-6 px-4">
        <div>
          <Link
            to="/membership"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="h-4 w-4" /> Back to membership
          </Link>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">Membership &amp; billing</h1>
          <p className="mt-1 text-slate-600">
            Change your tier, review what you've been charged, and manage renewal.
          </p>
        </div>

        {flash && (
          <p
            className={`rounded-xl border px-4 py-3 text-sm ${
              flash.ok
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-rose-200 bg-rose-50 text-rose-700"
            }`}
          >
            {flash.text}
          </p>
        )}

        <MembershipStatusCard
          membership={membership}
          stage={stage}
          feedback={latestApplication?.adminFeedback}
        />

        {/* A wire can sit unsettled for days; the member needs to see that it is
            in flight rather than assume the payment failed. */}
        {openInvoice && (
          <Card className="border-amber-200 bg-amber-50/60">
            <CardContent className="flex flex-wrap items-center gap-4 py-5">
              <Clock className="h-5 w-5 shrink-0 text-amber-600" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-900">
                  Payment awaiting confirmation ·{" "}
                  {formatMoney(openInvoice.amountMinor, openInvoice.currency)} for{" "}
                  {tierLabel(openInvoice.tier)}
                </p>
                <p className="mt-0.5 text-sm text-slate-600">
                  Your tier activates automatically as soon as the payment settles.
                  {openInvoice.payment ? ` Paid via ${openInvoice.payment.provider}.` : ""}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {membership.status === "active" && currentPlan && (
          <Card>
            <CardHeader>
              <CardTitle>Current plan</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {currentPlan.name}
                  <span className="ml-2 text-base font-normal text-slate-500">
                    {formatMoney(currentPlan.monthlyPriceMinor, currentPlan.currency)}/month
                  </span>
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {membership.canceledAt
                    ? `Access ends ${formatDate(membership.renewalDate)} — no further charges.`
                    : `Renews ${formatDate(membership.renewalDate)}.`}
                </p>
              </div>

              {membership.canceledAt ? (
                <Button
                  variant="outline"
                  disabled={busy}
                  onClick={() => void runResume()}
                  className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                  Resume membership
                </Button>
              ) : (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="border-slate-300 text-slate-700">
                      Cancel membership
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancel your membership?</AlertDialogTitle>
                      <AlertDialogDescription>
                        You'll keep full {tierLabel(membership.tier)} access until{" "}
                        {formatDate(membership.renewalDate)}, and won't be charged again. You can
                        resume any time before then.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep membership</AlertDialogCancel>
                      <AlertDialogAction onClick={() => void runCancel()}>
                        Cancel membership
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </CardContent>
          </Card>
        )}

        <section>
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            {membership.status === "active" ? "Change tier" : "Choose a tier"}
          </h2>
          <PlanGrid
            plans={plans}
            membership={membership}
            stage={stage}
            isAuthenticated={isAuthenticated}
            onCheckout={(tier) => startCheckout(tier)}
          />
        </section>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-emerald-600" />
              Billing history
            </CardTitle>
          </CardHeader>
          <CardContent>
            {invoices.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-500">
                No membership charges yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[420px] text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                      <th className="pb-2 pr-4 font-semibold">Period</th>
                      <th className="pb-2 pr-4 text-right font-semibold">Amount</th>
                      <th className="pb-2 pr-4 text-right font-semibold">Status</th>
                      <th className="hidden pb-2 text-right font-semibold sm:table-cell">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => (
                      <InvoiceRow key={invoice.id} invoice={invoice} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
