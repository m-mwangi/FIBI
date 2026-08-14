import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import {
  deleteJson,
  getJson,
  postJson,
  MEMBERSHIP_PREFIX,
  type MembershipDto,
} from "@/lib/api";
import {
  defaultMembershipProfile,
  hasTierAccess,
  isMembershipActive,
  membershipStage,
  type FeatureGate,
  type MemberEvent,
  type MembershipApplicationSummary,
  type MembershipInvoice,
  type MembershipPlan,
  type MembershipProfile,
  type MembershipStage,
  type MembershipTier,
} from "@/lib/membership";

type MembershipApplicationPayload = {
  motivation: string;
  interests: string;
  communityContribution: string;
};

type MembershipMeResponse = {
  success: boolean;
  membership: MembershipDto;
  /** Feature keys this membership unlocks, resolved server-side from the gate table. */
  entitlements?: string[];
  latestApplication?: MembershipApplicationSummary | null;
  openInvoice?: MembershipInvoice | null;
};

type ActionResult = { success: boolean; error?: string };

type CheckoutResult = ActionResult & {
  nextAction?: { type: string; url?: string; reference?: string; instructions?: string };
  invoice?: MembershipInvoice;
};

type MembershipContextType = {
  membership: MembershipProfile;
  stage: MembershipStage;
  /** Public catalogue, straight from the plans the admin console edits. */
  plans: MembershipPlan[];
  featureGates: FeatureGate[];
  entitlements: string[];
  latestApplication: MembershipApplicationSummary | null;
  openInvoice: MembershipInvoice | null;
  invoices: MembershipInvoice[];
  events: MemberEvent[];

  /**
   * True once membership state has been resolved for the current user.
   * Gate on this before deciding anyone lacks access — deciding while it is
   * false bounces real members off their own pages.
   */
  ready: boolean;
  loading: boolean;
  error: string | null;

  refreshMembership: () => Promise<void>;
  refreshCatalogue: () => Promise<void>;
  refreshInvoices: () => Promise<void>;
  refreshEvents: () => Promise<void>;

  canAccessTier: (requiredTier: MembershipTier) => boolean;
  canAccessFeature: (feature: string) => boolean;
  minTierForFeature: (feature: string) => MembershipTier | null;

  applyForMembership: (payload: MembershipApplicationPayload) => Promise<ActionResult>;
  startCheckout: (tier: MembershipTier, provider?: string) => Promise<CheckoutResult>;
  cancelMembership: () => Promise<ActionResult>;
  resumeMembership: () => Promise<ActionResult>;
  bookEvent: (eventId: string) => Promise<ActionResult>;
  cancelBooking: (eventId: string) => Promise<ActionResult>;
};

const MembershipContext = createContext<MembershipContextType | undefined>(undefined);

function dtoToProfile(d: MembershipDto | null | undefined): MembershipProfile {
  if (!d) return defaultMembershipProfile();
  return {
    tier: d.tier,
    status: d.status,
    applicationStatus: d.applicationStatus,
    renewalDate: d.renewalDate,
    badgeLabel:
      d.badgeLabel ?? (d.tier === "free" && d.status === "none" ? "Visitor" : "Member"),
    startedAt: d.startedAt ?? null,
    canceledAt: d.canceledAt ?? null,
    pendingTier: d.pendingTier ?? null,
    daysRemaining: d.daysRemaining ?? null,
  };
}

export function MembershipProvider({ children }: { children: ReactNode }) {
  const { user, authReady } = useAuth();

  const [membership, setMembership] = useState<MembershipProfile>(defaultMembershipProfile());
  const [entitlements, setEntitlements] = useState<string[]>([]);
  const [latestApplication, setLatestApplication] =
    useState<MembershipApplicationSummary | null>(null);
  const [openInvoice, setOpenInvoice] = useState<MembershipInvoice | null>(null);
  const [invoices, setInvoices] = useState<MembershipInvoice[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [featureGates, setFeatureGates] = useState<FeatureGate[]>([]);
  const [events, setEvents] = useState<MemberEvent[]>([]);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Plans and gates are public, so they load whether or not anyone is signed in. */
  const refreshCatalogue = useCallback(async () => {
    const [planRes, featureRes] = await Promise.all([
      getJson<{ success: boolean; plans: MembershipPlan[] }>(`${MEMBERSHIP_PREFIX}/plans`),
      getJson<{ success: boolean; features: FeatureGate[] }>(`${MEMBERSHIP_PREFIX}/features`),
    ]);
    if (planRes.ok) setPlans(planRes.data.plans ?? []);
    if (featureRes.ok) setFeatureGates(featureRes.data.features ?? []);
  }, []);

  const refreshEvents = useCallback(async () => {
    const res = await getJson<{ success: boolean; events: MemberEvent[] }>(
      `${MEMBERSHIP_PREFIX}/events`
    );
    if (res.ok) setEvents(res.data.events ?? []);
  }, []);

  const refreshInvoices = useCallback(async () => {
    if (!user) {
      setInvoices([]);
      return;
    }
    const res = await getJson<{ success: boolean; invoices: MembershipInvoice[] }>(
      `${MEMBERSHIP_PREFIX}/invoices`
    );
    if (res.ok) setInvoices(res.data.invoices ?? []);
  }, [user]);

  const refreshMembership = useCallback(async () => {
    if (!user) {
      setMembership(defaultMembershipProfile());
      setEntitlements([]);
      setLatestApplication(null);
      setOpenInvoice(null);
      setError(null);
      setReady(true);
      return;
    }
    setLoading(true);
    setError(null);
    const res = await getJson<MembershipMeResponse>(`${MEMBERSHIP_PREFIX}/me`);
    setLoading(false);
    // `ready` flips regardless of outcome: a failed fetch still means we are no
    // longer in the "don't know yet" state, and leaving it false would hang
    // every gated route on a spinner forever.
    setReady(true);
    if (!res.ok) {
      setError(res.error);
      setMembership(defaultMembershipProfile());
      setEntitlements([]);
      return;
    }
    setMembership(dtoToProfile(res.data.membership));
    setEntitlements(res.data.entitlements ?? []);
    setLatestApplication(res.data.latestApplication ?? null);
    setOpenInvoice(res.data.openInvoice ?? null);
  }, [user]);

  useEffect(() => {
    void refreshCatalogue();
  }, [refreshCatalogue]);

  useEffect(() => {
    if (!authReady) return;
    setReady(false);
    void refreshMembership();
    void refreshEvents();
  }, [authReady, user?.id, refreshMembership, refreshEvents]);

  const canAccessTier = useCallback(
    (requiredTier: MembershipTier) =>
      isMembershipActive(membership) && hasTierAccess(membership.tier, requiredTier),
    [membership]
  );

  // Entitlements come from the server's reading of the gate table. The client
  // no longer derives access from a plan's marketing feature list.
  const canAccessFeature = useCallback(
    (feature: string) => entitlements.includes(feature),
    [entitlements]
  );

  const minTierForFeature = useCallback(
    (feature: string) => featureGates.find((g) => g.featureKey === feature)?.minTier ?? null,
    [featureGates]
  );

  const applyForMembership = useCallback(
    async (payload: MembershipApplicationPayload): Promise<ActionResult> => {
      if (!user) return { success: false, error: "Please log in to apply." };
      const res = await postJson<{ success: boolean; membership?: MembershipDto }>(
        `${MEMBERSHIP_PREFIX}/apply`,
        payload
      );
      if (!res.ok) return { success: false, error: res.error };
      await refreshMembership();
      return { success: true };
    },
    [user, refreshMembership]
  );

  const startCheckout = useCallback(
    async (tier: MembershipTier, provider = "STRIPE"): Promise<CheckoutResult> => {
      if (!user) return { success: false, error: "Please log in first." };
      const res = await postJson<{
        success: boolean;
        invoice: MembershipInvoice;
        nextAction?: CheckoutResult["nextAction"];
      }>(`${MEMBERSHIP_PREFIX}/checkout`, { tier, provider });
      if (!res.ok) return { success: false, error: res.error };
      await Promise.all([refreshMembership(), refreshInvoices()]);
      return {
        success: true,
        nextAction: res.data.nextAction,
        invoice: res.data.invoice,
      };
    },
    [user, refreshMembership, refreshInvoices]
  );

  const cancelMembership = useCallback(async (): Promise<ActionResult> => {
    const res = await postJson<{ success: boolean }>(`${MEMBERSHIP_PREFIX}/cancel`, {});
    if (!res.ok) return { success: false, error: res.error };
    await Promise.all([refreshMembership(), refreshInvoices()]);
    return { success: true };
  }, [refreshMembership, refreshInvoices]);

  const resumeMembership = useCallback(async (): Promise<ActionResult> => {
    const res = await postJson<{ success: boolean }>(`${MEMBERSHIP_PREFIX}/resume`, {});
    if (!res.ok) return { success: false, error: res.error };
    await refreshMembership();
    return { success: true };
  }, [refreshMembership]);

  const bookEvent = useCallback(
    async (eventId: string): Promise<ActionResult> => {
      const res = await postJson<{ success: boolean }>(
        `${MEMBERSHIP_PREFIX}/events/${eventId}/book`,
        {}
      );
      if (!res.ok) return { success: false, error: res.error };
      await refreshEvents();
      return { success: true };
    },
    [refreshEvents]
  );

  const cancelBooking = useCallback(
    async (eventId: string): Promise<ActionResult> => {
      const res = await deleteJson<{ success: boolean }>(
        `${MEMBERSHIP_PREFIX}/events/${eventId}/book`
      );
      if (!res.ok) return { success: false, error: res.error };
      await refreshEvents();
      return { success: true };
    },
    [refreshEvents]
  );

  const stage = useMemo(() => membershipStage(membership), [membership]);

  const value = useMemo(
    () => ({
      membership,
      stage,
      plans,
      featureGates,
      entitlements,
      latestApplication,
      openInvoice,
      invoices,
      events,
      ready,
      loading,
      error,
      refreshMembership,
      refreshCatalogue,
      refreshInvoices,
      refreshEvents,
      canAccessTier,
      canAccessFeature,
      minTierForFeature,
      applyForMembership,
      startCheckout,
      cancelMembership,
      resumeMembership,
      bookEvent,
      cancelBooking,
    }),
    [
      membership,
      stage,
      plans,
      featureGates,
      entitlements,
      latestApplication,
      openInvoice,
      invoices,
      events,
      ready,
      loading,
      error,
      refreshMembership,
      refreshCatalogue,
      refreshInvoices,
      refreshEvents,
      canAccessTier,
      canAccessFeature,
      minTierForFeature,
      applyForMembership,
      startCheckout,
      cancelMembership,
      resumeMembership,
      bookEvent,
      cancelBooking,
    ]
  );

  return <MembershipContext.Provider value={value}>{children}</MembershipContext.Provider>;
}

export function useMembership() {
  const context = useContext(MembershipContext);
  if (!context) {
    throw new Error("useMembership must be used within MembershipProvider");
  }
  return context;
}
