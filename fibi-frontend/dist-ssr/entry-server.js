import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { renderToString } from "react-dom/server";
import { useNavigate, Link, useLocation, NavLink, Outlet, useParams, Navigate, useSearchParams, createStaticHandler, createStaticRouter, StaticRouterProvider } from "react-router";
import { ChevronDown, BadgeCheck, LayoutDashboard, Sparkles, CreditCard, Settings as Settings$1, ExternalLink, LogOut, Home as Home$1, FolderOpen, Menu, X, ArrowUpRight, ArrowRight, Leaf, Users as Users$1, TrendingUp, Shield, ChevronLeft, ChevronRight, Loader2, MapPin, Calendar, ArrowLeft, CheckCircle2, Landmark, Check, Copy, Circle, XIcon, CalendarX2, ShieldAlert, Clock, UserPlus, DollarSign, Briefcase, Wallet, TrendingDown, PieChart, Eye, Inbox, ArrowDownRight, Bell, CalendarClock, SearchIcon, ChartColumn, CircleUser, Plus, RefreshCw, Download, Scale, ChevronsRight, ChevronsLeft, Search, ShieldCheck, SlidersHorizontal, Trash2, PenLine, UserMinus, CircleDollarSign, Coins, ArrowDownLeft, Trophy, CheckIcon, ArrowUp, ArrowDown, ChevronsUpDown, TriangleAlert, Activity, CalendarDays, Mail, ChevronDownIcon, ChevronUpIcon, Target, Image, Pencil, UserCheck, Repeat, Save, CalendarPlus, Receipt, Lock, Store, User, History, RotateCcw, Building2, Upload, CircleHelp, Ban, FileUp, EyeOff, AlertCircle, Globe2, MailCheck, CircleAlert, SearchX, Crown, Quote, Settings2, MessageSquare, Video, Phone } from "lucide-react";
import { createContext, useContext, useState, useEffect, useCallback, useMemo, useId, useRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import * as LabelPrimitive from "@radix-ui/react-label";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Area, PieChart as PieChart$1, Pie, Cell, BarChart, Legend, Bar } from "recharts";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Command as Command$1 } from "cmdk";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import * as SelectPrimitive from "@radix-ui/react-select";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
const API_BASE = "http://localhost:5000".replace(/\/$/, "");
const AUTH_PREFIX = "/api/v1/auth";
function getApiBase() {
  return API_BASE;
}
const MEMBERSHIP_PREFIX = "/api/v1/membership";
function readErrorMessage(data) {
  if (typeof data.error === "string") return data.error;
  if (typeof data.message === "string") return data.message;
  return "Request failed";
}
function networkFailureResult(e) {
  if (e instanceof TypeError) {
    return {
      ok: false,
      status: 0,
      error: "Cannot reach the API. Start the BACKEND server and ensure VITE_API_URL matches its URL (e.g. http://localhost:5000)."
    };
  }
  if (e instanceof Error) {
    return { ok: false, status: 0, error: e.message };
  }
  return { ok: false, status: 0, error: "Network error" };
}
async function jsonBodyResult(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { ok: false, status: res.status, error: readErrorMessage(data) };
  }
  return { ok: true, data };
}
async function postJson(path, body, init) {
  const headers = {
    "Content-Type": "application/json"
  };
  const token = (init == null ? void 0 : init.token) === void 0 ? localStorage.getItem("fibi_token") : init.token;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      credentials: "include"
    });
    return jsonBodyResult(res);
  } catch (e) {
    return networkFailureResult(e);
  }
}
async function getJson(path, init) {
  const headers = {};
  const token = (init == null ? void 0 : init.token) === void 0 ? localStorage.getItem("fibi_token") : init.token;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "GET",
      headers,
      credentials: "include"
    });
    return jsonBodyResult(res);
  } catch (e) {
    return networkFailureResult(e);
  }
}
async function patchJson(path, body, init) {
  const headers = {
    "Content-Type": "application/json"
  };
  const token = localStorage.getItem("fibi_token");
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(body),
      credentials: "include"
    });
    return jsonBodyResult(res);
  } catch (e) {
    return networkFailureResult(e);
  }
}
async function putJson(path, body, init) {
  const headers = {
    "Content-Type": "application/json"
  };
  const token = localStorage.getItem("fibi_token");
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
      credentials: "include"
    });
    return jsonBodyResult(res);
  } catch (e) {
    return networkFailureResult(e);
  }
}
async function deleteJson(path, init) {
  const headers = {};
  const token = localStorage.getItem("fibi_token");
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "DELETE",
      headers,
      credentials: "include"
    });
    return jsonBodyResult(res);
  } catch (e) {
    return networkFailureResult(e);
  }
}
async function postFormData(path, formData, init) {
  const headers = {};
  const token = localStorage.getItem("fibi_token");
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers,
      body: formData,
      credentials: "include"
    });
    return jsonBodyResult(res);
  } catch (e) {
    return networkFailureResult(e);
  }
}
async function putFormData(path, formData, init) {
  const headers = {};
  const token = localStorage.getItem("fibi_token");
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "PUT",
      headers,
      body: formData,
      credentials: "include"
    });
    return jsonBodyResult(res);
  } catch (e) {
    return networkFailureResult(e);
  }
}
const STORAGE_USER = "fibi_user";
const STORAGE_TOKEN = "fibi_token";
const AuthContext = createContext(void 0);
function persistSession(user, token) {
  const normalized = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
  localStorage.setItem(STORAGE_USER, JSON.stringify(normalized));
  localStorage.setItem(STORAGE_TOKEN, token);
  return normalized;
}
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = localStorage.getItem(STORAGE_TOKEN);
      if (!token) {
        localStorage.removeItem(STORAGE_USER);
        if (!cancelled) {
          setUser(null);
          setAuthReady(true);
        }
        return;
      }
      const me = await getJson(`${AUTH_PREFIX}/me`, { token });
      if (cancelled) return;
      if (!me.ok) {
        const fatal = me.status === 401 || me.status === 403 || me.status === 404;
        if (fatal) {
          localStorage.removeItem(STORAGE_USER);
          localStorage.removeItem(STORAGE_TOKEN);
          setUser(null);
        } else {
          const raw = localStorage.getItem(STORAGE_USER);
          if (raw) {
            try {
              setUser(JSON.parse(raw));
            } catch {
              setUser(null);
            }
          } else {
            setUser(null);
          }
        }
      } else {
        const u = me.data.user;
        const normalized = {
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role
        };
        setUser(normalized);
        localStorage.setItem(STORAGE_USER, JSON.stringify(normalized));
      }
      setAuthReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  const login = async (email, password) => {
    const res = await postJson(`${AUTH_PREFIX}/login`, { email, password }, {
      token: null
    });
    if (!res.ok) {
      return { success: false, error: res.error };
    }
    const { token, user: u } = res.data;
    if (!token || !u) {
      return { success: false, error: "Invalid response from server" };
    }
    const normalized = persistSession(u, token);
    setUser(normalized);
    return { success: true, user: normalized };
  };
  const signup = async (payload) => {
    const res = await postJson(`${AUTH_PREFIX}/register`, payload, {
      token: null
    });
    if (!res.ok) {
      return { success: false, error: res.error };
    }
    const { token, user: u } = res.data;
    if (!token || !u) {
      return { success: false, error: "Invalid response from server" };
    }
    const normalized = persistSession(u, token);
    setUser(normalized);
    return { success: true, user: normalized };
  };
  const oauthLogin = async (provider, payload) => {
    const res = await postJson(`/api/v1/oauth/${provider}`, payload, {
      token: null
    });
    if (!res.ok) {
      return { success: false, error: res.error };
    }
    const { token, user: u } = res.data;
    if (!token || !u) {
      return { success: false, error: "Invalid response from server" };
    }
    const normalized = persistSession(u, token);
    setUser(normalized);
    return { success: true, user: normalized };
  };
  const requestPasswordReset = async (email) => {
    const res = await postJson(
      `${AUTH_PREFIX}/forgot-password`,
      { email },
      { token: null }
    );
    if (!res.ok) return { success: false, error: res.error };
    return { success: true, message: res.data.message };
  };
  const verifyResetToken = async (token) => {
    const res = await getJson(
      `${AUTH_PREFIX}/reset-password?token=${encodeURIComponent(token)}`,
      { token: null }
    );
    if (!res.ok) return { success: false, error: res.error };
    return { success: true, email: res.data.email };
  };
  const resetPassword = async (token, password) => {
    const res = await postJson(
      `${AUTH_PREFIX}/reset-password`,
      { token, password },
      { token: null }
    );
    if (!res.ok) return { success: false, error: res.error };
    localStorage.removeItem(STORAGE_USER);
    localStorage.removeItem(STORAGE_TOKEN);
    setUser(null);
    return { success: true, message: res.data.message };
  };
  const logout = async () => {
    const token = localStorage.getItem(STORAGE_TOKEN);
    try {
      await postJson(`${AUTH_PREFIX}/logout`, {}, { token });
    } catch {
    }
    setUser(null);
    localStorage.removeItem(STORAGE_USER);
    localStorage.removeItem(STORAGE_TOKEN);
  };
  const refreshUser = async () => {
    const token = localStorage.getItem(STORAGE_TOKEN);
    if (!token) return;
    const me = await getJson(`${AUTH_PREFIX}/me`, { token });
    if (!me.ok) return;
    const u = me.data.user;
    const normalized = {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role
    };
    setUser(normalized);
    localStorage.setItem(STORAGE_USER, JSON.stringify(normalized));
  };
  return /* @__PURE__ */ jsx(
    AuthContext.Provider,
    {
      value: {
        user,
        authReady,
        refreshUser,
        login,
        signup,
        oauthLogin,
        requestPasswordReset,
        verifyResetToken,
        resetPassword,
        logout,
        isAuthenticated: !!user
      },
      children
    }
  );
}
function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline: "border bg-background text-foreground hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9 rounded-md"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "button";
  return /* @__PURE__ */ jsx(
    Comp,
    {
      "data-slot": "button",
      className: cn(buttonVariants({ variant, size, className })),
      ...props
    }
  );
}
const MEMBERSHIP_TIER_ORDER = [
  "free",
  "basic",
  "premium",
  "investor_plus"
];
const TIER_LABELS = {
  free: "Free",
  basic: "Basic",
  premium: "Premium",
  investor_plus: "Investor+"
};
function tierLabel(tier) {
  return TIER_LABELS[tier] ?? tier.replace(/_/g, " ");
}
const MEMBERSHIP_FEATURE_LABELS = {
  exclusive_content: "Exclusive guides, media and strategy briefs",
  member_events: "Member-only events and workshops",
  community_groups: "Private community groups and networking",
  premium_services: "Premium support and concierge services",
  investment_opportunities: "Early and higher-tier investment opportunities",
  founder_qa: "Direct founder Q&A sessions",
  priority_booking: "Priority event booking and reservations"
};
function featureLabel(key) {
  return MEMBERSHIP_FEATURE_LABELS[key] ?? key.replace(/[_-]/g, " ").replace(/^./, (c) => c.toUpperCase());
}
function membershipTierRank(tier) {
  return MEMBERSHIP_TIER_ORDER.indexOf(tier);
}
function hasTierAccess(current, required) {
  return membershipTierRank(current) >= membershipTierRank(required);
}
function defaultMembershipProfile() {
  return {
    tier: "free",
    status: "none",
    applicationStatus: "none",
    renewalDate: null,
    badgeLabel: "Visitor",
    startedAt: null,
    canceledAt: null,
    pendingTier: null,
    daysRemaining: null
  };
}
function isMembershipActive(profile) {
  return profile.status === "active";
}
function membershipStage(profile) {
  if (profile.status === "active") return profile.canceledAt ? "ending" : "active";
  if (profile.status === "expired") return "expired";
  if (profile.status === "canceled") return "canceled";
  if (profile.applicationStatus === "approved") return "awaiting_payment";
  if (profile.applicationStatus === "pending") return "pending";
  if (profile.applicationStatus === "rejected") return "rejected";
  return "visitor";
}
const STAGE_COPY = {
  visitor: {
    label: "Not a member",
    blurb: "Apply to join — every application is reviewed by the membership team."
  },
  pending: {
    label: "Under review",
    blurb: "Your application is with the membership team. We'll email you when there's a decision."
  },
  rejected: {
    label: "Not accepted",
    blurb: "This application wasn't accepted. You're welcome to apply again."
  },
  awaiting_payment: {
    label: "Approved — activate",
    blurb: "You're approved. Choose a tier to activate your membership."
  },
  active: { label: "Active", blurb: "Your membership is active." },
  ending: {
    label: "Ending",
    blurb: "Your membership is set to end. You keep full access until then."
  },
  expired: { label: "Expired", blurb: "Your membership period ended. Renew to restore access." },
  canceled: { label: "Cancelled", blurb: "Your membership has ended. You can rejoin any time." }
};
const MembershipContext = createContext(void 0);
function dtoToProfile(d) {
  if (!d) return defaultMembershipProfile();
  return {
    tier: d.tier,
    status: d.status,
    applicationStatus: d.applicationStatus,
    renewalDate: d.renewalDate,
    badgeLabel: d.badgeLabel ?? (d.tier === "free" && d.status === "none" ? "Visitor" : "Member"),
    startedAt: d.startedAt ?? null,
    canceledAt: d.canceledAt ?? null,
    pendingTier: d.pendingTier ?? null,
    daysRemaining: d.daysRemaining ?? null
  };
}
function MembershipProvider({ children }) {
  const { user, authReady } = useAuth();
  const [membership, setMembership] = useState(defaultMembershipProfile());
  const [entitlements, setEntitlements] = useState([]);
  const [latestApplication, setLatestApplication] = useState(null);
  const [openInvoice, setOpenInvoice] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [plans, setPlans] = useState([]);
  const [featureGates, setFeatureGates] = useState([]);
  const [events, setEvents] = useState([]);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const refreshCatalogue = useCallback(async () => {
    const [planRes, featureRes] = await Promise.all([
      getJson(`${MEMBERSHIP_PREFIX}/plans`),
      getJson(`${MEMBERSHIP_PREFIX}/features`)
    ]);
    if (planRes.ok) setPlans(planRes.data.plans ?? []);
    if (featureRes.ok) setFeatureGates(featureRes.data.features ?? []);
  }, []);
  const refreshEvents = useCallback(async () => {
    const res = await getJson(
      `${MEMBERSHIP_PREFIX}/events`
    );
    if (res.ok) setEvents(res.data.events ?? []);
  }, []);
  const refreshInvoices = useCallback(async () => {
    if (!user) {
      setInvoices([]);
      return;
    }
    const res = await getJson(
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
    const res = await getJson(`${MEMBERSHIP_PREFIX}/me`);
    setLoading(false);
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
  }, [authReady, user == null ? void 0 : user.id, refreshMembership, refreshEvents]);
  const canAccessTier = useCallback(
    (requiredTier) => isMembershipActive(membership) && hasTierAccess(membership.tier, requiredTier),
    [membership]
  );
  const canAccessFeature = useCallback(
    (feature) => entitlements.includes(feature),
    [entitlements]
  );
  const minTierForFeature = useCallback(
    (feature) => {
      var _a;
      return ((_a = featureGates.find((g) => g.featureKey === feature)) == null ? void 0 : _a.minTier) ?? null;
    },
    [featureGates]
  );
  const applyForMembership = useCallback(
    async (payload) => {
      if (!user) return { success: false, error: "Please log in to apply." };
      const res = await postJson(
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
    async (tier, provider = "STRIPE") => {
      if (!user) return { success: false, error: "Please log in first." };
      const res = await postJson(`${MEMBERSHIP_PREFIX}/checkout`, { tier, provider });
      if (!res.ok) return { success: false, error: res.error };
      await Promise.all([refreshMembership(), refreshInvoices()]);
      return {
        success: true,
        nextAction: res.data.nextAction,
        invoice: res.data.invoice
      };
    },
    [user, refreshMembership, refreshInvoices]
  );
  const cancelMembership = useCallback(async () => {
    const res = await postJson(`${MEMBERSHIP_PREFIX}/cancel`, {});
    if (!res.ok) return { success: false, error: res.error };
    await Promise.all([refreshMembership(), refreshInvoices()]);
    return { success: true };
  }, [refreshMembership, refreshInvoices]);
  const resumeMembership = useCallback(async () => {
    const res = await postJson(`${MEMBERSHIP_PREFIX}/resume`, {});
    if (!res.ok) return { success: false, error: res.error };
    await refreshMembership();
    return { success: true };
  }, [refreshMembership]);
  const bookEvent = useCallback(
    async (eventId) => {
      const res = await postJson(
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
    async (eventId) => {
      const res = await deleteJson(
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
      cancelBooking
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
      cancelBooking
    ]
  );
  return /* @__PURE__ */ jsx(MembershipContext.Provider, { value, children });
}
function useMembership() {
  const context = useContext(MembershipContext);
  if (!context) {
    throw new Error("useMembership must be used within MembershipProvider");
  }
  return context;
}
function DropdownMenu({
  ...props
}) {
  return /* @__PURE__ */ jsx(DropdownMenuPrimitive.Root, { "data-slot": "dropdown-menu", ...props });
}
function DropdownMenuTrigger({
  ...props
}) {
  return /* @__PURE__ */ jsx(
    DropdownMenuPrimitive.Trigger,
    {
      "data-slot": "dropdown-menu-trigger",
      ...props
    }
  );
}
function DropdownMenuContent({
  className,
  sideOffset = 4,
  ...props
}) {
  return /* @__PURE__ */ jsx(DropdownMenuPrimitive.Portal, { children: /* @__PURE__ */ jsx(
    DropdownMenuPrimitive.Content,
    {
      "data-slot": "dropdown-menu-content",
      sideOffset,
      className: cn(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md",
        className
      ),
      ...props
    }
  ) });
}
function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}) {
  return /* @__PURE__ */ jsx(
    DropdownMenuPrimitive.Item,
    {
      "data-slot": "dropdown-menu-item",
      "data-inset": inset,
      "data-variant": variant,
      className: cn(
        "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      ),
      ...props
    }
  );
}
function DropdownMenuLabel({
  className,
  inset,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    DropdownMenuPrimitive.Label,
    {
      "data-slot": "dropdown-menu-label",
      "data-inset": inset,
      className: cn(
        "px-2 py-1.5 text-sm font-medium data-[inset]:pl-8",
        className
      ),
      ...props
    }
  );
}
function DropdownMenuSeparator({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    DropdownMenuPrimitive.Separator,
    {
      "data-slot": "dropdown-menu-separator",
      className: cn("bg-border -mx-1 my-1 h-px", className),
      ...props
    }
  );
}
function inDays(days) {
  if (days === null || days < 0) return null;
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  return `in ${days} days`;
}
function memberStatus(membership, stage) {
  const when = inDays(membership.daysRemaining);
  switch (stage) {
    case "active":
      return {
        label: tierLabel(membership.tier),
        detail: when ? `Renews ${when}` : "Membership active",
        tone: "brand",
        action: null
      };
    case "ending":
      return {
        label: tierLabel(membership.tier),
        detail: when ? `Access ends ${when}` : "Access ends at period end",
        tone: "amber",
        action: { label: "Resume", to: "/membership/billing" }
      };
    case "awaiting_payment":
      return {
        label: "Approved",
        detail: "Choose a tier to activate",
        tone: "sky",
        action: { label: "Activate", to: "/membership/billing" }
      };
    case "pending":
      return {
        label: "Under review",
        detail: "We'll email you a decision",
        tone: "amber",
        action: null
      };
    case "expired":
      return {
        label: "Expired",
        detail: "Renew to restore access",
        tone: "slate",
        action: { label: "Renew", to: "/membership/billing" }
      };
    case "canceled":
      return {
        label: "Cancelled",
        detail: "Rejoin any time",
        tone: "slate",
        action: { label: "Rejoin", to: "/membership" }
      };
    case "rejected":
      return {
        label: "Not accepted",
        detail: "You can apply again",
        tone: "slate",
        action: { label: "Apply", to: "/membership/apply" }
      };
    case "visitor":
    default:
      return {
        label: "Investor",
        detail: "Not a member yet",
        tone: "slate",
        action: { label: "Apply", to: "/membership/apply" }
      };
  }
}
const STATUS_TONE_ON_DARK = {
  brand: "bg-emerald-400/15 text-emerald-200 ring-emerald-300/25",
  amber: "bg-amber-400/15 text-amber-200 ring-amber-300/25",
  sky: "bg-sky-400/15 text-sky-200 ring-sky-300/25",
  slate: "bg-white/10 text-slate-200 ring-white/15"
};
const STATUS_TONE_ON_LIGHT = {
  brand: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  sky: "bg-sky-50 text-sky-700 ring-sky-200",
  slate: "bg-slate-100 text-slate-600 ring-slate-200"
};
const TINTS = [
  "from-emerald-400 to-teal-500",
  "from-sky-400 to-indigo-500",
  "from-amber-400 to-orange-500",
  "from-violet-400 to-fuchsia-500",
  "from-rose-400 to-pink-500",
  "from-teal-400 to-cyan-500"
];
function initials$1(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}
function tint(seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = hash * 31 + seed.charCodeAt(i) >>> 0;
  return TINTS[hash % TINTS.length];
}
function MemberAvatar({
  name,
  seed,
  size = "md",
  className = ""
}) {
  const dims = size === "sm" ? "h-8 w-8 text-[0.6875rem]" : size === "lg" ? "h-11 w-11 text-sm" : "h-9 w-9 text-xs";
  return /* @__PURE__ */ jsx(
    "span",
    {
      "aria-hidden": "true",
      className: `flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-semibold text-white ${dims} ${tint(
        seed || name
      )} ${className}`,
      children: initials$1(name)
    }
  );
}
function AccountMenu({
  tone = "onDark",
  /** Hide the name/tier column — used where the bar is tight. */
  compact: compact2 = false
}) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { membership, stage } = useMembership();
  if (!user) return null;
  const status = memberStatus(membership, stage);
  const isAdmin = user.role === "admin";
  const isMember = stage === "active" || stage === "ending";
  const handleLogout = () => {
    void logout().then(() => navigate("/", { replace: true }));
  };
  const trigger = tone === "onDark" ? "border-white/15 bg-white/12 text-white backdrop-blur-sm hover:bg-white/20" : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50";
  const triggerSub = tone === "onDark" ? "text-emerald-200/80" : "text-slate-500";
  const triggerChevron = tone === "onDark" ? "text-white/50" : "text-slate-400";
  return /* @__PURE__ */ jsxs(DropdownMenu, { children: [
    /* @__PURE__ */ jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        "aria-label": "Account menu",
        className: `inv-focus flex items-center gap-2.5 rounded-full border py-1 pl-1 pr-2 transition-colors sm:pr-3 ${trigger}`,
        children: [
          /* @__PURE__ */ jsx(MemberAvatar, { name: user.name, seed: user.id, size: "sm" }),
          !compact2 && /* @__PURE__ */ jsxs("span", { className: "hidden min-w-0 text-left sm:block", children: [
            /* @__PURE__ */ jsx("span", { className: "block max-w-[9rem] truncate text-sm font-medium leading-tight", children: user.name }),
            /* @__PURE__ */ jsx("span", { className: `block max-w-[9rem] truncate text-[0.6875rem] leading-tight ${triggerSub}`, children: isAdmin ? "Administrator" : status.label })
          ] }),
          /* @__PURE__ */ jsx(ChevronDown, { className: `hidden h-4 w-4 shrink-0 sm:block ${triggerChevron}` })
        ]
      }
    ) }),
    /* @__PURE__ */ jsxs(DropdownMenuContent, { align: "end", sideOffset: 10, className: "w-72 rounded-2xl p-0", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 px-3 py-3", children: [
        /* @__PURE__ */ jsx(MemberAvatar, { name: user.name, seed: user.id, size: "lg" }),
        /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsx("p", { className: "truncate text-sm font-semibold text-slate-900", children: user.name }),
          /* @__PURE__ */ jsx("p", { className: "truncate text-xs text-slate-500", children: user.email })
        ] })
      ] }),
      !isAdmin && /* @__PURE__ */ jsxs("div", { className: "border-y border-slate-100 bg-slate-50/70 px-3 py-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2", children: [
          /* @__PURE__ */ jsxs(
            "span",
            {
              className: `inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${STATUS_TONE_ON_LIGHT[status.tone]}`,
              children: [
                /* @__PURE__ */ jsx(BadgeCheck, { className: "h-3.5 w-3.5" }),
                status.label
              ]
            }
          ),
          status.action && /* @__PURE__ */ jsx(
            Link,
            {
              to: status.action.to,
              className: "text-xs font-semibold text-emerald-700 underline-offset-2 hover:underline",
              children: status.action.label
            }
          )
        ] }),
        /* @__PURE__ */ jsx("p", { className: "inv-num mt-1.5 text-xs text-slate-500", children: status.detail })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "p-1.5", children: [
        isAdmin ? /* @__PURE__ */ jsx(DropdownMenuItem, { asChild: true, children: /* @__PURE__ */ jsxs(Link, { to: "/admin", children: [
          /* @__PURE__ */ jsx(LayoutDashboard, { className: "h-4 w-4" }),
          " Admin console"
        ] }) }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(DropdownMenuItem, { asChild: true, children: /* @__PURE__ */ jsxs(Link, { to: "/dashboard", children: [
            /* @__PURE__ */ jsx(LayoutDashboard, { className: "h-4 w-4" }),
            " Portfolio"
          ] }) }),
          isMember && /* @__PURE__ */ jsx(DropdownMenuItem, { asChild: true, children: /* @__PURE__ */ jsxs(Link, { to: "/member-hub", children: [
            /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4" }),
            " Member hub"
          ] }) }),
          /* @__PURE__ */ jsx(DropdownMenuItem, { asChild: true, children: /* @__PURE__ */ jsxs(Link, { to: "/membership/billing", children: [
            /* @__PURE__ */ jsx(CreditCard, { className: "h-4 w-4" }),
            " Membership & billing"
          ] }) }),
          /* @__PURE__ */ jsx(DropdownMenuItem, { asChild: true, children: /* @__PURE__ */ jsxs(Link, { to: "/dashboard#settings", children: [
            /* @__PURE__ */ jsx(Settings$1, { className: "h-4 w-4" }),
            " Account settings"
          ] }) })
        ] }),
        /* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
        /* @__PURE__ */ jsx(DropdownMenuItem, { asChild: true, children: /* @__PURE__ */ jsxs(Link, { to: "/", children: [
          /* @__PURE__ */ jsx(ExternalLink, { className: "h-4 w-4" }),
          " Public site"
        ] }) }),
        /* @__PURE__ */ jsxs(DropdownMenuItem, { variant: "destructive", onSelect: handleLogout, children: [
          /* @__PURE__ */ jsx(LogOut, { className: "h-4 w-4" }),
          " Log out"
        ] })
      ] })
    ] })
  ] });
}
const VIEWBOX = {
  /** Wordmark over the "For Investors By Investors" line. The default lockup. */
  full: "284 309.5 691 216.4",
  /** Wordmark alone — for heights under ~20px, where the tagline turns to mush. */
  mark: "284 309.5 653.1 107.6",
  /** Single F. For rails and tiles too narrow to carry the wordmark. */
  monogram: "284 309.5 155 107.6"
};
const SIZES = {
  xs: "h-5",
  sm: "h-6",
  md: "h-[1.875rem]",
  lg: "h-10",
  xl: "h-14"
};
const TONES = {
  dark: "text-black",
  light: "text-white"
};
function Wordmark({
  size = "md",
  /** `light` for placement on a dark surface. Ignored if `className` sets a text colour. */
  tone = "dark",
  variant = "full",
  className = ""
}) {
  return /* @__PURE__ */ jsx(
    "svg",
    {
      viewBox: VIEWBOX[variant],
      className: `w-auto shrink-0 ${SIZES[size]} ${TONES[tone]} ${className}`,
      fill: "currentColor",
      role: "img",
      "aria-label": "FIBI",
      preserveAspectRatio: "xMidYMid meet",
      xmlns: "http://www.w3.org/2000/svg",
      children: /* @__PURE__ */ jsxs("g", { transform: "translate(0,853) scale(0.1,-0.1)", stroke: "none", children: [
        /* @__PURE__ */ jsx("path", { d: "M2880 5389 c0 -12 158 -159 171 -159 8 0 263 0 568 0 393 0 559 4\n575 12 23 12 156 138 156 147 0 3 -331 6 -735 6 -404 0 -735 -3 -735 -6z" }),
        /* @__PURE__ */ jsx("path", { d: "M5368 5392 l-78 -3 0 -495 0 -495 88 3 87 3 0 494 c0 322 -3 495 -10\n496 -5 0 -45 -1 -87 -3z" }),
        /* @__PURE__ */ jsx("path", { d: "M6603 5392 l-43 -3 0 -80 0 -79 43 -1 c23 0 310 0 637 0 445 0 604\n-3 630 -12 l35 -12 3 -89 c5 -140 82 -126 -690 -126 l-658 0 0 -295 0 -295\n720 0 c697 0 722 1 759 20 66 33 81 80 81 244 0 153 -7 179 -62 217 -18 12\n-35 24 -37 25 -2 2 10 15 27 29 40 34 55 106 50 239 -4 116 -24 170 -74 198\n-29 17 -80 18 -705 21 -371 1 -693 1 -716 -1z m1316 -608 c17 -21 21 -41 21\n-96 0 -120 68 -108 -610 -108 l-590 0 0 115 0 115 579 0 580 0 20 -26z" }),
        /* @__PURE__ */ jsx("path", { d: "M9233 5392 l-73 -3 0 -495 0 -495 85 3 85 3 1 494 c0 405 -2 495 -13\n495 -7 1 -46 0 -85 -2z" }),
        /* @__PURE__ */ jsx("path", { d: "M2880 4695 l0 -295 90 0 90 0 0 205 0 205 526 0 c378 0 531 3 547 12\n24 12 170 145 175 159 2 5 -302 9 -712 9 l-716 0 0 -295z" }),
        /* @__PURE__ */ jsx("path", { d: "M2880 3615 l0 -195 30 0 30 0 0 80 0 80 75 0 c73 0 75 1 75 25 0 24\n-2 25 -75 25 l-75 0 0 65 0 65 90 0 c89 0 90 0 90 25 l0 25 -120 0 -120 0 0\n-195z" }),
        /* @__PURE__ */ jsx("path", { d: "M3880 3615 l0 -195 30 0 30 0 0 195 0 195 -30 0 -30 0 0 -195z" }),
        /* @__PURE__ */ jsx("path", { d: "M6500 3615 l0 -195 106 0 c141 0 184 26 184 109 0 32 -34 81 -56 81\n-20 0 -17 8 13 34 22 19 28 32 27 65 -2 76 -48 101 -184 101 l-90 0 0 -195z\nm177 134 c47 -18 57 -55 23 -89 -16 -16 -33 -20 -80 -20 l-60 0 0 60 0 60 44\n0 c25 0 57 -5 73 -11z m31 -175 c22 -15 29 -57 14 -82 -11 -17 -67 -32 -119\n-32 l-43 0 0 65 0 65 63 0 c40 0 70 -5 85 -16z" }),
        /* @__PURE__ */ jsx("path", { d: "M7322 3618 l3 -193 28 -3 27 -3 0 195 0 196 -30 0 -30 0 2 -192z" }),
        /* @__PURE__ */ jsx("path", { d: "M5317 3774 c-4 -4 -7 -22 -7 -40 0 -27 -5 -35 -25 -40 -16 -4 -25\n-13 -25 -25 0 -14 7 -19 25 -19 25 0 25 -1 25 -91 0 -50 5 -99 11 -110 23 -43\n129 -50 129 -9 0 16 -7 20 -35 20 -24 0 -37 6 -45 19 -11 22 -13 92 -4 140 6\n27 10 31 40 31 27 0 34 4 34 19 0 16 -8 20 -37 23 -36 3 -37 4 -37 43 -1 32\n-5 41 -21 43 -12 2 -24 0 -28 -4z" }),
        /* @__PURE__ */ jsx("path", { d: "M8751 3763 c-10 -20 -11 -24 -11 -53 0 -15 -7 -20 -25 -20 -18 0 -25\n-5 -25 -20 0 -15 7 -20 25 -20 25 0 25 -1 25 -85 0 -46 5 -95 11 -109 22 -47\n129 -59 129 -16 0 14 -9 20 -37 22 l-38 3 -3 92 -3 92 38 3 c26 2 39 8 41 20\n2 13 -5 17 -35 20 -37 3 -38 4 -41 46 -3 34 -7 42 -22 42 -11 0 -24 -8 -29\n-17z" }),
        /* @__PURE__ */ jsx("path", { d: "M3228 3679 c-51 -26 -71 -68 -66 -136 4 -42 11 -60 33 -83 69 -72\n196 -55 240 30 65 126 -79 257 -207 189z m131 -46 c44 -37 43 -126 -1 -158\n-33 -23 -82 -19 -115 9 -23 20 -28 32 -28 71 0 39 5 51 28 71 34 29 85 32 116\n7z" }),
        /* @__PURE__ */ jsx("path", { d: "M3630 3689 c-14 -5 -31 -17 -37 -26 -12 -15 -13 -15 -13 5 0 32 -50\n32 -51 0 0 -13 -1 -74 -3 -135 l-2 -113 28 0 28 0 0 90 c0 100 13 125 70 137\n23 4 30 11 30 29 0 26 -10 28 -50 13z" }),
        /* @__PURE__ */ jsx("path", { d: "M4133 3680 c-27 -16 -33 -17 -33 -5 0 10 -10 15 -30 15 l-30 0 0\n-135 0 -135 30 0 30 0 0 95 c0 82 3 98 20 115 23 23 94 28 107 8 4 -7 10 -58\n13 -113 l5 -100 28 -3 27 -3 0 100 c0 56 -5 112 -12 126 -24 53 -98 70 -155\n35z" }),
        /* @__PURE__ */ jsx("path", { d: "M4745 3681 c-58 -35 -70 -58 -70 -126 0 -57 3 -67 30 -95 50 -52 130\n-61 198 -22 29 17 36 39 14 47 -7 3 -30 -4 -51 -15 -25 -12 -49 -17 -65 -13\n-34 7 -71 42 -71 65 0 16 10 18 105 18 l105 0 0 39 c0 92 -114 152 -195 102z\nm121 -44 c7 -6 15 -22 19 -34 6 -23 5 -23 -74 -23 -84 0 -90 4 -70 41 20 38\n96 48 125 16z" }),
        /* @__PURE__ */ jsx("path", { d: "M5049 3685 c-14 -7 -31 -26 -37 -40 -19 -42 3 -75 63 -98 75 -29 80\n-32 80 -58 0 -37 -43 -47 -93 -21 -29 15 -43 17 -51 9 -19 -19 -13 -27 35 -48\n34 -15 56 -19 86 -14 46 8 88 43 88 74 0 33 -42 70 -100 89 -47 15 -55 21 -55\n42 0 36 40 48 88 25 59 -28 80 1 25 35 -38 23 -92 25 -129 5z" }),
        /* @__PURE__ */ jsx("path", { d: "M5569 3680 c-51 -27 -73 -65 -73 -125 0 -64 30 -108 92 -132 81 -30\n170 10 193 88 39 128 -92 232 -212 169z m136 -55 c19 -18 25 -35 25 -70 0 -61\n-32 -95 -89 -95 -72 0 -113 79 -76 150 17 33 27 38 78 39 28 1 45 -6 62 -24z" }),
        /* @__PURE__ */ jsx("path", { d: "M5958 3684 c-16 -8 -28 -20 -29 -27 0 -7 -4 -2 -9 11 -6 15 -18 22\n-35 22 l-25 0 0 -135 0 -135 30 0 30 0 0 90 c0 83 2 93 25 115 13 14 36 25 50\n25 20 0 25 5 25 25 0 29 -20 32 -62 9z" }),
        /* @__PURE__ */ jsx("path", { d: "M6115 3688 c-30 -16 -45 -39 -45 -70 0 -38 29 -64 94 -83 63 -18 78\n-41 46 -67 -28 -23 -37 -22 -85 2 -34 17 -41 18 -53 6 -20 -19 -9 -32 43 -51\n96 -37 189 21 159 100 -7 19 -65 50 -111 59 -40 9 -54 43 -27 63 23 17 42 16\n78 -2 32 -17 56 -14 56 8 0 34 -111 59 -155 35z" }),
        /* @__PURE__ */ jsx("path", { d: "M7066 3678 c-7 -13 -28 -60 -46 -106 -18 -46 -36 -79 -40 -75 -4 4\n-24 50 -45 101 -35 86 -40 92 -66 92 -16 0 -29 -2 -29 -4 0 -2 22 -54 50 -114\n61 -137 65 -153 47 -188 -8 -16 -18 -39 -22 -52 -6 -21 -4 -23 20 -20 24 3 33\n17 89 148 35 80 70 159 79 177 10 18 17 39 17 48 0 23 -38 18 -54 -7z" }),
        /* @__PURE__ */ jsx("path", { d: "M7573 3680 c-30 -18 -37 -18 -34 3 0 4 -12 7 -29 7 l-30 0 0 -135 0\n-135 30 0 30 0 0 95 c0 113 13 135 80 135 53 0 60 -16 60 -134 l0 -96 30 0 30\n0 0 94 c0 117 -12 154 -56 172 -45 19 -73 18 -111 -6z" }),
        /* @__PURE__ */ jsx("path", { d: "M8181 3683 c-51 -26 -73 -67 -69 -133 3 -35 11 -66 23 -83 28 -37 89\n-60 142 -52 40 6 93 37 93 55 0 17 -34 20 -57 5 -28 -19 -81 -22 -110 -7 -11\n6 -26 25 -31 42 l-11 30 105 0 c120 0 127 5 103 74 -26 76 -111 107 -188 69z\nm113 -44 c14 -11 26 -29 26 -40 0 -17 -8 -19 -75 -19 -66 0 -75 2 -75 18 0 19\n24 45 50 55 29 10 47 7 74 -14z" }),
        /* @__PURE__ */ jsx("path", { d: "M8500 3693 c-30 -11 -60 -47 -60 -73 0 -36 35 -67 98 -85 57 -17 66\n-26 57 -54 -10 -31 -59 -36 -102 -11 -33 19 -38 20 -52 6 -14 -14 -13 -17 4\n-31 78 -59 205 -29 205 50 0 39 -29 64 -96 83 -47 14 -67 32 -58 55 9 24 51\n29 89 11 58 -27 77 3 23 36 -32 19 -76 24 -108 13z" }),
        /* @__PURE__ */ jsx("path", { d: "M9010 3684 c-51 -21 -80 -69 -80 -132 0 -43 5 -57 30 -86 38 -42 86\n-60 141 -51 140 24 163 215 32 271 -41 18 -78 17 -123 -2z m123 -54 c33 -26\n43 -80 22 -119 -36 -70 -124 -70 -161 1 -46 89 60 180 139 118z" }),
        /* @__PURE__ */ jsx("path", { d: "M9395 3688 c-11 -6 -26 -18 -32 -26 -11 -14 -13 -13 -13 6 0 18 -6\n22 -30 22 l-30 0 0 -135 0 -135 29 0 29 0 4 96 c3 104 11 119 71 131 20 4 27\n11 27 29 0 26 -21 31 -55 12z" }),
        /* @__PURE__ */ jsx("path", { d: "M9551 3689 c-57 -23 -68 -83 -22 -122 16 -13 49 -29 74 -35 64 -17\n74 -52 20 -73 -20 -7 -35 -5 -67 11 -36 17 -42 18 -55 5 -13 -13 -13 -17 4\n-30 35 -26 95 -38 135 -26 50 15 72 41 68 83 -3 34 -8 38 -113 85 -48 21 -54\n53 -14 67 19 6 36 4 63 -9 26 -13 40 -15 48 -7 15 15 1 32 -38 48 -38 16 -69\n17 -103 3z" }),
        /* @__PURE__ */ jsx("path", { d: "M4408 3555 c55 -134 57 -136 86 -133 27 3 32 11 82 128 30 69 54 129\n54 133 0 5 -12 7 -26 5 -23 -3 -31 -15 -65 -98 -22 -52 -40 -99 -42 -104 -1\n-4 -21 38 -44 95 -38 98 -42 104 -71 107 l-30 3 56 -136z" }),
        /* @__PURE__ */ jsx("path", { d: "M7809 3643 c93 -229 87 -218 120 -218 31 0 33 3 86 127 30 71 55 131\n55 134 0 3 -12 4 -27 2 -25 -3 -32 -13 -67 -100 -21 -54 -41 -98 -45 -98 -3 0\n-23 45 -44 100 -36 95 -40 100 -68 100 l-29 0 19 -47z" })
      ] })
    }
  );
}
const LINKS = [
  { to: "/", label: "Home", icon: Home$1 },
  { to: "/projects", label: "Projects", icon: FolderOpen },
  { to: "/membership", label: "Membership", icon: BadgeCheck }
];
function Navigation() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const { user, isAuthenticated, authReady } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);
  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);
  const onLightBar = isHomePage && scrolled;
  const linkClass = `text-base transition-colors ${onLightBar ? "text-black hover:bg-black/10" : "text-white hover:bg-white/20"}`;
  const portalPath = (user == null ? void 0 : user.role) === "admin" ? "/admin" : "/dashboard";
  const portalLabel = (user == null ? void 0 : user.role) === "admin" ? "Admin" : "Portfolio";
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      "nav",
      {
        className: `fixed top-0 left-0 w-full z-50 transition-all duration-300 ${!isHomePage && scrolled ? "opacity-0 pointer-events-none" : isHomePage && scrolled ? "bg-white/70 backdrop-blur-md border-b border-white/20 shadow-sm" : "bg-transparent"}`,
        children: /* @__PURE__ */ jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3 h-16", children: [
          /* @__PURE__ */ jsx(Link, { to: "/", className: "flex items-center", "aria-label": "FIBI home", children: /* @__PURE__ */ jsx(Wordmark, { size: "md", tone: onLightBar ? "dark" : "light", className: "transition-all" }) }),
          /* @__PURE__ */ jsxs("div", { className: "hidden lg:flex items-center gap-1", children: [
            LINKS.map(({ to, label, icon: Icon }) => /* @__PURE__ */ jsx(Link, { to, children: /* @__PURE__ */ jsxs(Button, { variant: "ghost", className: linkClass, children: [
              /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4 mr-2" }),
              label
            ] }) }, to)),
            authReady && isAuthenticated && user && /* @__PURE__ */ jsx(Link, { to: portalPath, children: /* @__PURE__ */ jsxs(Button, { variant: "ghost", className: linkClass, children: [
              /* @__PURE__ */ jsx(LayoutDashboard, { className: "h-4 w-4 mr-2" }),
              portalLabel
            ] }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            !authReady ? (
              // Reserve the width so the bar does not reflow when auth resolves.
              /* @__PURE__ */ jsx("div", { className: "h-10 w-10 lg:w-40", "aria-hidden": true })
            ) : isAuthenticated ? /* @__PURE__ */ jsx(AccountMenu, { tone: onLightBar ? "onLight" : "onDark" }) : /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Link, { to: "/login", className: "hidden sm:block", children: /* @__PURE__ */ jsx(Button, { variant: "ghost", className: linkClass, children: "Log In" }) }),
              /* @__PURE__ */ jsx(Link, { to: "/signup", className: "hidden sm:block", children: /* @__PURE__ */ jsx(Button, { className: "bg-emerald-600 hover:bg-emerald-700 text-white", children: "Join Investment" }) })
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => setMenuOpen(true),
                "aria-label": "Open menu",
                "aria-expanded": menuOpen,
                className: `rounded-xl p-2 transition-colors lg:hidden ${onLightBar ? "text-slate-800 hover:bg-black/10" : "text-white hover:bg-white/20"}`,
                children: /* @__PURE__ */ jsx(Menu, { className: "h-6 w-6" })
              }
            )
          ] })
        ] }) })
      }
    ),
    menuOpen && /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-[60] lg:hidden", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          "aria-label": "Close menu",
          onClick: () => setMenuOpen(false),
          className: "fx-fade-in absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        }
      ),
      /* @__PURE__ */ jsxs("aside", { className: "fx-drawer-right absolute inset-y-0 right-0 flex w-[min(20rem,88vw)] flex-col bg-white shadow-2xl", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex h-16 shrink-0 items-center justify-between border-b border-slate-100 px-4", children: [
          /* @__PURE__ */ jsx(Wordmark, { size: "sm" }),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => setMenuOpen(false),
              "aria-label": "Close menu",
              className: "rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700",
              children: /* @__PURE__ */ jsx(X, { className: "h-5 w-5" })
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("nav", { "aria-label": "Site", className: "flex-1 space-y-1 overflow-y-auto p-3", children: [
          LINKS.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to;
            return /* @__PURE__ */ jsxs(
              Link,
              {
                to,
                className: `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${active ? "bg-emerald-50 text-emerald-900" : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"}`,
                children: [
                  /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4 shrink-0" }),
                  label
                ]
              },
              to
            );
          }),
          authReady && isAuthenticated && user && /* @__PURE__ */ jsxs(
            Link,
            {
              to: portalPath,
              className: "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900",
              children: [
                /* @__PURE__ */ jsx(LayoutDashboard, { className: "h-4 w-4 shrink-0" }),
                portalLabel
              ]
            }
          )
        ] }),
        authReady && !isAuthenticated && /* @__PURE__ */ jsxs("div", { className: "shrink-0 space-y-2 border-t border-slate-100 p-4", children: [
          /* @__PURE__ */ jsx(Link, { to: "/signup", className: "block", children: /* @__PURE__ */ jsx(Button, { className: "h-11 w-full rounded-xl bg-emerald-600 text-white hover:bg-emerald-700", children: "Join Investment" }) }),
          /* @__PURE__ */ jsx(Link, { to: "/login", className: "block", children: /* @__PURE__ */ jsx(Button, { variant: "outline", className: "h-11 w-full rounded-xl border-slate-200", children: "Log In" }) })
        ] })
      ] })
    ] })
  ] });
}
const PLATFORM = [
  { label: "Browse projects", to: "/projects" },
  { label: "How it works", to: "/how-it-works" },
  { label: "Membership", to: "/membership" },
  { label: "Insights", to: "/insights" }
];
const COMPANY = [
  { label: "About us", to: "/about" },
  { label: "Contact", to: "/contact" },
  { label: "FAQ", to: "/faq" }
];
const LEGAL = [
  { label: "Investment risks", to: "/legal/risk-disclosure" },
  { label: "Terms of service", to: "/legal/terms" },
  { label: "Privacy policy", to: "/legal/privacy" }
];
function LinkColumn({ heading, links }) {
  return /* @__PURE__ */ jsxs("div", { className: "text-sm", children: [
    /* @__PURE__ */ jsx("h2", { className: "font-semibold text-white mb-3", children: heading }),
    /* @__PURE__ */ jsx("ul", { className: "space-y-2", children: links.map((l) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Link, { to: l.to, className: "hover:text-emerald-500 transition-colors", children: l.label }) }, l.to)) })
  ] });
}
function Footer() {
  return /* @__PURE__ */ jsx("footer", { className: "bg-gray-900 text-gray-300 mt-auto", children: /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto px-4 py-12", children: [
    /* @__PURE__ */ jsxs("div", { className: "grid md:grid-cols-4 gap-8", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { className: "flex items-center mb-4", children: /* @__PURE__ */ jsx(Wordmark, { size: "lg", tone: "light" }) }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-400", children: "Fractional land investment platform enabling sustainable wealth creation through collective ownership." })
      ] }),
      /* @__PURE__ */ jsx(LinkColumn, { heading: "Platform", links: PLATFORM }),
      /* @__PURE__ */ jsx(LinkColumn, { heading: "Company", links: COMPANY }),
      /* @__PURE__ */ jsx(LinkColumn, { heading: "Legal", links: LEGAL })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "border-t border-gray-800 mt-8 pt-8 text-sm text-gray-400", children: [
      /* @__PURE__ */ jsxs("p", { className: "text-center", children: [
        "© ",
        (/* @__PURE__ */ new Date()).getFullYear(),
        " FIBI. All rights reserved."
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "text-center mt-2 text-xs text-gray-500 max-w-2xl mx-auto leading-relaxed", children: [
        "Capital is at risk. Land investments are illiquid and projected returns are estimates, not guarantees. You may get back less than you invest. Read the",
        " ",
        /* @__PURE__ */ jsx(
          Link,
          {
            to: "/legal/risk-disclosure",
            className: "underline underline-offset-2 hover:text-gray-300",
            children: "full risk disclosure"
          }
        ),
        " ",
        "before investing."
      ] })
    ] })
  ] }) });
}
const DESKTOP_LINK = "inv-focus flex items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-medium transition-colors";
function InvestorShell({ children }) {
  const location = useLocation();
  const { user } = useAuth();
  const { membership, stage } = useMembership();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const status = memberStatus(membership, stage);
  const isMember = stage === "active" || stage === "ending";
  const nav = [
    { to: "/dashboard", label: "Portfolio", icon: LayoutDashboard, end: true },
    { to: "/projects", label: "Opportunities", icon: FolderOpen, end: true },
    ...isMember ? [{ to: "/member-hub", label: "Member hub", icon: Sparkles, end: true }] : [],
    isMember ? { to: "/membership/billing", label: "Membership", icon: CreditCard } : { to: "/membership", label: "Membership", icon: BadgeCheck, end: true }
  ];
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);
  useEffect(() => {
    if (!drawerOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [drawerOpen]);
  return /* @__PURE__ */ jsxs("div", { className: "inv-shell flex min-h-screen flex-col bg-[var(--inv-canvas)]", children: [
    /* @__PURE__ */ jsx(
      "a",
      {
        href: "#main-content",
        className: "sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-emerald-800 focus:shadow-lg",
        children: "Skip to content"
      }
    ),
    /* @__PURE__ */ jsx(
      "header",
      {
        role: "banner",
        className: "fixed inset-x-0 top-0 z-50 h-16 border-b border-[var(--inv-bar-line)] bg-gradient-to-r from-[var(--inv-bar)] via-[var(--inv-bar)] to-[var(--inv-bar-2)] shadow-lg shadow-emerald-950/20",
        children: /* @__PURE__ */ jsxs("div", { className: "mx-auto flex h-full max-w-7xl items-center gap-3 px-4 sm:px-6", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => setDrawerOpen(true),
              "aria-label": "Open menu",
              className: "inv-focus -ml-1 rounded-xl p-2 text-[var(--inv-bar-ink)] transition-colors hover:bg-white/10 hover:text-white lg:hidden",
              children: /* @__PURE__ */ jsx(Menu, { className: "h-5 w-5" })
            }
          ),
          /* @__PURE__ */ jsxs(Link, { to: "/dashboard", className: "inv-focus flex shrink-0 items-center gap-3", "aria-label": "FIBI portal", children: [
            /* @__PURE__ */ jsx(Wordmark, { size: "md", tone: "light" }),
            /* @__PURE__ */ jsxs("span", { className: "hidden items-center gap-3 xl:flex", children: [
              /* @__PURE__ */ jsx("span", { className: "h-6 w-px bg-white/15" }),
              /* @__PURE__ */ jsx("span", { className: "text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--inv-bar-ink)]", children: "Investor portal" })
            ] })
          ] }),
          /* @__PURE__ */ jsx("nav", { "aria-label": "Portal", className: "ml-4 hidden items-center gap-1 lg:flex", children: nav.map((item) => /* @__PURE__ */ jsxs(
            NavLink,
            {
              to: item.to,
              end: item.end,
              className: ({ isActive }) => `${DESKTOP_LINK} ${isActive ? "bg-white/12 text-[var(--inv-bar-ink-hi)] shadow-inner shadow-white/5" : "text-[var(--inv-bar-ink)] hover:bg-white/8 hover:text-[var(--inv-bar-ink-hi)]"}`,
              children: [
                /* @__PURE__ */ jsx(item.icon, { className: "h-4 w-4" }),
                item.label
              ]
            },
            item.to
          )) }),
          /* @__PURE__ */ jsxs("div", { className: "ml-auto flex items-center gap-2 sm:gap-3", children: [
            /* @__PURE__ */ jsxs(
              "div",
              {
                className: `hidden items-center gap-2 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset md:flex ${STATUS_TONE_ON_DARK[status.tone]}`,
                children: [
                  /* @__PURE__ */ jsx(BadgeCheck, { className: "h-3.5 w-3.5 shrink-0" }),
                  /* @__PURE__ */ jsx("span", { children: status.label }),
                  /* @__PURE__ */ jsxs("span", { className: "inv-num hidden font-normal opacity-70 xl:inline", children: [
                    "· ",
                    status.detail
                  ] }),
                  status.action && /* @__PURE__ */ jsxs(
                    Link,
                    {
                      to: status.action.to,
                      className: "inv-focus ml-0.5 inline-flex items-center gap-0.5 rounded-full bg-white/15 px-2 py-0.5 text-[0.6875rem] font-semibold text-white transition-colors hover:bg-white/25",
                      children: [
                        status.action.label,
                        /* @__PURE__ */ jsx(ArrowUpRight, { className: "h-3 w-3" })
                      ]
                    }
                  )
                ]
              }
            ),
            /* @__PURE__ */ jsx(AccountMenu, { tone: "onDark" })
          ] })
        ] })
      }
    ),
    drawerOpen && /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-[60] lg:hidden", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          "aria-label": "Close menu",
          onClick: () => setDrawerOpen(false),
          className: "fx-fade-in absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        }
      ),
      /* @__PURE__ */ jsxs("aside", { className: "fx-drawer-left absolute inset-y-0 left-0 flex w-[min(20rem,85vw)] flex-col bg-white shadow-2xl", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex h-16 items-center justify-between border-b border-slate-100 px-4", children: [
          /* @__PURE__ */ jsx(Wordmark, { size: "sm" }),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => setDrawerOpen(false),
              "aria-label": "Close menu",
              className: "inv-focus rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700",
              children: /* @__PURE__ */ jsx(X, { className: "h-5 w-5" })
            }
          )
        ] }),
        user && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 border-b border-slate-100 px-4 py-4", children: [
          /* @__PURE__ */ jsx(MemberAvatar, { name: user.name, seed: user.id, size: "lg" }),
          /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsx("p", { className: "truncate text-sm font-semibold text-slate-900", children: user.name }),
            /* @__PURE__ */ jsx("p", { className: "truncate text-xs text-slate-500", children: user.email })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("nav", { "aria-label": "Portal", className: "flex-1 space-y-1 overflow-y-auto p-3", children: [
          nav.map((item) => /* @__PURE__ */ jsxs(
            NavLink,
            {
              to: item.to,
              end: item.end,
              className: ({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? "bg-emerald-50 text-emerald-900" : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"}`,
              children: [
                /* @__PURE__ */ jsx(item.icon, { className: "h-4 w-4 shrink-0" }),
                item.label
              ]
            },
            item.to
          )),
          /* @__PURE__ */ jsxs("div", { className: "!mt-4 rounded-xl border border-slate-200 p-3", children: [
            /* @__PURE__ */ jsxs(
              "span",
              {
                className: `inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${STATUS_TONE_ON_LIGHT[status.tone]}`,
                children: [
                  /* @__PURE__ */ jsx(BadgeCheck, { className: "h-3.5 w-3.5" }),
                  status.label
                ]
              }
            ),
            /* @__PURE__ */ jsx("p", { className: "inv-num mt-2 text-xs text-slate-500", children: status.detail }),
            status.action && /* @__PURE__ */ jsxs(
              Link,
              {
                to: status.action.to,
                className: "mt-2 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:underline",
                children: [
                  status.action.label,
                  /* @__PURE__ */ jsx(ArrowUpRight, { className: "h-3 w-3" })
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "border-t border-slate-100 p-3", children: [
          /* @__PURE__ */ jsxs(
            Link,
            {
              to: "/",
              className: "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50",
              children: [
                /* @__PURE__ */ jsx(ArrowUpRight, { className: "h-4 w-4" }),
                " Public site"
              ]
            }
          ),
          /* @__PURE__ */ jsx(LogoutRow, {})
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("main", { id: "main-content", className: "fx-page flex-1", children }, location.pathname),
    /* @__PURE__ */ jsx("footer", { className: "border-t border-[var(--inv-line)] bg-white", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6", children: [
      /* @__PURE__ */ jsxs("p", { children: [
        "© ",
        (/* @__PURE__ */ new Date()).getFullYear(),
        " FIBI · For Investors By Investors"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-x-5 gap-y-2", children: [
        /* @__PURE__ */ jsx(Link, { to: "/projects", className: "hover:text-emerald-700", children: "Opportunities" }),
        /* @__PURE__ */ jsx(Link, { to: "/membership", className: "hover:text-emerald-700", children: "Membership" }),
        /* @__PURE__ */ jsx(Link, { to: "/", className: "hover:text-emerald-700", children: "Public site" }),
        /* @__PURE__ */ jsx("a", { href: "mailto:support@fibi.co.ke", className: "hover:text-emerald-700", children: "Support" })
      ] })
    ] }) })
  ] });
}
function LogoutRow() {
  const { logout } = useAuth();
  return /* @__PURE__ */ jsxs(
    "button",
    {
      type: "button",
      onClick: () => {
        void logout().then(() => {
          window.location.assign("/");
        });
      },
      className: "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50",
      children: [
        /* @__PURE__ */ jsx(LogOut, { className: "h-4 w-4" }),
        " Log out"
      ]
    }
  );
}
const isServer = typeof window === "undefined";
let sink = null;
function resetSeoSink() {
  sink = null;
}
function collectSeo(data) {
  sink = data;
}
function readSeoSink() {
  return sink;
}
function escapeHtml(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function escapeJsonLd(value) {
  return value.replace(/</g, "\\u003c");
}
function renderSeoToHtml(data, siteName, locale) {
  const tags = [];
  const esc = escapeHtml;
  tags.push(`<title>${esc(data.title)}</title>`);
  tags.push(`<meta name="description" content="${esc(data.description)}" />`);
  if (data.noindex) {
    tags.push(`<meta name="robots" content="noindex, nofollow" />`);
  } else {
    tags.push(`<meta name="robots" content="index, follow, max-image-preview:large" />`);
    tags.push(`<link rel="canonical" href="${esc(data.canonical)}" />`);
  }
  tags.push(`<meta property="og:type" content="${esc(data.type)}" />`);
  tags.push(`<meta property="og:site_name" content="${esc(siteName)}" />`);
  tags.push(`<meta property="og:locale" content="${esc(locale)}" />`);
  tags.push(`<meta property="og:title" content="${esc(data.title)}" />`);
  tags.push(`<meta property="og:description" content="${esc(data.description)}" />`);
  tags.push(`<meta property="og:url" content="${esc(data.canonical)}" />`);
  if (data.image) tags.push(`<meta property="og:image" content="${esc(data.image)}" />`);
  tags.push(`<meta name="twitter:card" content="summary_large_image" />`);
  tags.push(`<meta name="twitter:title" content="${esc(data.title)}" />`);
  tags.push(`<meta name="twitter:description" content="${esc(data.description)}" />`);
  if (data.image) tags.push(`<meta name="twitter:image" content="${esc(data.image)}" />`);
  for (const block of data.jsonLd) {
    const json = escapeJsonLd(JSON.stringify(block));
    tags.push(`<script type="application/ld+json">${json}<\/script>`);
  }
  return tags.join("\n    ");
}
const MANAGED = "data-seo-managed";
function upsertMeta(selector, attrs) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(MANAGED, "");
    document.head.appendChild(el);
  }
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
}
function applySeoToDocument(data, siteName, locale) {
  document.title = data.title;
  upsertMeta('meta[name="description"]', { name: "description", content: data.description });
  upsertMeta('meta[name="robots"]', {
    name: "robots",
    content: data.noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large"
  });
  const og = [
    ["og:type", data.type],
    ["og:site_name", siteName],
    ["og:locale", locale],
    ["og:title", data.title],
    ["og:description", data.description],
    ["og:url", data.canonical]
  ];
  if (data.image) og.push(["og:image", data.image]);
  for (const [property, content] of og) {
    upsertMeta(`meta[property="${property}"]`, { property, content });
  }
  const tw = [
    ["twitter:card", "summary_large_image"],
    ["twitter:title", data.title],
    ["twitter:description", data.description]
  ];
  if (data.image) tw.push(["twitter:image", data.image]);
  for (const [name, content] of tw) {
    upsertMeta(`meta[name="${name}"]`, { name, content });
  }
  const existingCanonical = document.head.querySelector('link[rel="canonical"]');
  if (data.noindex) {
    existingCanonical == null ? void 0 : existingCanonical.remove();
  } else if (existingCanonical) {
    existingCanonical.href = data.canonical;
  } else {
    const link = document.createElement("link");
    link.setAttribute(MANAGED, "");
    link.rel = "canonical";
    link.href = data.canonical;
    document.head.appendChild(link);
  }
  document.head.querySelectorAll('script[type="application/ld+json"]').forEach((node) => node.remove());
  for (const block of data.jsonLd) {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute(MANAGED, "");
    script.textContent = JSON.stringify(block);
    document.head.appendChild(script);
  }
}
const SITE_URL = "https://fibicommunity.org".replace(/\/$/, "");
const SITE_NAME = "FIBI";
const SITE_LEGAL_NAME = "FIBI Community";
const SITE_TAGLINE = "Fractional land investment platform enabling sustainable wealth creation through collective ownership.";
const TITLE_SUFFIX = ` | ${SITE_NAME}`;
const DEFAULT_OG_IMAGE = `${SITE_URL}/images/og-default.jpg`;
const DEFAULT_LOCALE = "en_KE";
const PRIMARY_COUNTRY = "KE";
const UNVERIFIED = {
  /** e.g. 'https://www.linkedin.com/company/...' — one entry per owned profile. */
  socialProfiles: [],
  /** Street address of the registered office. */
  streetAddress: "",
  addressLocality: "",
  addressRegion: "",
  postalCode: "",
  /** Public support address, e.g. 'hello@fibicommunity.org'. */
  email: "",
  /** E.164 format, e.g. '+254...'. */
  telephone: "",
  /** Company registration number as issued by the registrar. */
  registrationNumber: "",
  /**
   * Regulator and licence number, if the platform is licensed. An investment
   * site that cannot state this is held to a much lower trust ceiling — but a
   * fabricated licence is a legal exposure, not an SEO win.
   */
  regulator: "",
  licenceNumber: "",
  /** Year the company was founded, as 'YYYY'. */
  foundingDate: ""
};
const isSet = (v) => v.trim().length > 0;
function absolute(pathOrUrl) {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  const normalized = path === "/" ? "/" : path.replace(/\/+$/, "");
  return `${SITE_URL}${normalized}`;
}
function Seo({
  title,
  description = SITE_TAGLINE,
  path,
  image = DEFAULT_OG_IMAGE,
  noindex = false,
  type = "website",
  jsonLd = [],
  bareTitle = false
}) {
  const data = {
    title: bareTitle ? title : `${title}${TITLE_SUFFIX}`,
    description,
    canonical: absolute(path),
    image,
    noindex,
    type,
    jsonLd
  };
  if (isServer) collectSeo(data);
  const fingerprint = JSON.stringify(data);
  useEffect(() => {
    applySeoToDocument(JSON.parse(fingerprint), SITE_NAME, DEFAULT_LOCALE);
  }, [fingerprint]);
  return null;
}
function NoIndexSeo({ title, path }) {
  return /* @__PURE__ */ jsx(Seo, { title, path, noindex: true, description: SITE_TAGLINE });
}
const PORTAL_PATHS = /* @__PURE__ */ new Set([
  "/dashboard",
  "/member-hub",
  "/membership",
  "/membership/apply",
  "/membership/billing",
  "/projects"
]);
function Root() {
  const location = useLocation();
  const { user, isAuthenticated, authReady } = useAuth();
  const AUTH_PATHS = ["/login", "/signup", "/forgot-password", "/reset-password"];
  const isAuthPage = AUTH_PATHS.includes(location.pathname);
  const showPortal = authReady && isAuthenticated && (user == null ? void 0 : user.role) === "investor" && PORTAL_PATHS.has(location.pathname);
  if (showPortal) {
    return /* @__PURE__ */ jsx(InvestorShell, { children: /* @__PURE__ */ jsx(Outlet, {}) });
  }
  const hideNavigation = isAuthPage || location.pathname.startsWith("/projects/") && location.pathname !== "/projects" || location.pathname.startsWith("/admin") || // Only reachable by an admin — an investor here is inside the portal above.
  location.pathname === "/dashboard";
  const hideFooter = isAuthPage || location.pathname.startsWith("/admin");
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col min-h-screen", children: [
    isAuthPage && /* @__PURE__ */ jsx(NoIndexSeo, { title: "Sign in", path: location.pathname }),
    !hideNavigation && /* @__PURE__ */ jsx(Navigation, {}),
    /* @__PURE__ */ jsx("main", { className: "flex-1", children: /* @__PURE__ */ jsx(Outlet, {}) }),
    !hideFooter && /* @__PURE__ */ jsx(Footer, {})
  ] });
}
function Card({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "card",
      className: cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border",
        className
      ),
      ...props
    }
  );
}
function CardHeader({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "card-header",
      className: cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      ),
      ...props
    }
  );
}
function CardTitle({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "h4",
    {
      "data-slot": "card-title",
      className: cn("leading-none", className),
      ...props
    }
  );
}
function CardContent({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "card-content",
      className: cn("px-6 [&:last-child]:pb-6", className),
      ...props
    }
  );
}
function compact(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === null || v === void 0) continue;
    if (typeof v === "string" && v.trim() === "") continue;
    if (Array.isArray(v) && v.length === 0) continue;
    out[k] = v;
  }
  return out;
}
const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;
function organizationSchema() {
  const address = compact({
    "@type": "PostalAddress",
    streetAddress: UNVERIFIED.streetAddress,
    addressLocality: UNVERIFIED.addressLocality,
    addressRegion: UNVERIFIED.addressRegion,
    postalCode: UNVERIFIED.postalCode,
    addressCountry: PRIMARY_COUNTRY
  });
  const hasRealAddress = isSet(UNVERIFIED.addressLocality);
  const contactPoint = isSet(UNVERIFIED.email) || isSet(UNVERIFIED.telephone) ? compact({
    "@type": "ContactPoint",
    contactType: "customer support",
    email: UNVERIFIED.email,
    telephone: UNVERIFIED.telephone,
    areaServed: PRIMARY_COUNTRY,
    availableLanguage: ["en", "sw"]
  }) : null;
  return compact({
    "@type": "Organization",
    "@id": ORG_ID,
    name: SITE_NAME,
    legalName: SITE_LEGAL_NAME,
    url: `${SITE_URL}/`,
    description: SITE_TAGLINE,
    logo: compact({
      "@type": "ImageObject",
      url: `${SITE_URL}/images/logo-512.png`,
      width: 512,
      height: 512
    }),
    areaServed: { "@type": "Country", name: "Kenya" },
    address: hasRealAddress ? address : null,
    contactPoint,
    sameAs: UNVERIFIED.socialProfiles,
    foundingDate: UNVERIFIED.foundingDate,
    identifier: isSet(UNVERIFIED.registrationNumber) ? UNVERIFIED.registrationNumber : null
  });
}
function websiteSchema() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: `${SITE_URL}/`,
    name: SITE_NAME,
    description: SITE_TAGLINE,
    publisher: { "@id": ORG_ID },
    inLanguage: "en",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/projects?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };
}
function graph(...nodes) {
  return {
    "@context": "https://schema.org",
    "@graph": nodes.filter((n) => n !== null)
  };
}
function baseGraph(...extra) {
  return graph(organizationSchema(), websiteSchema(), ...extra);
}
function breadcrumbSchema(crumbs) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `${SITE_URL}${c.path === "/" ? "/" : c.path.replace(/\/+$/, "")}`
    }))
  };
}
function faqSchema(entries) {
  if (entries.length === 0) return null;
  return {
    "@type": "FAQPage",
    mainEntity: entries.map((e) => ({
      "@type": "Question",
      name: e.question,
      acceptedAnswer: { "@type": "Answer", text: e.answer }
    }))
  };
}
function webPageSchema(opts) {
  const url = `${SITE_URL}${opts.path === "/" ? "/" : opts.path.replace(/\/+$/, "")}`;
  return compact({
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: opts.name,
    description: opts.description,
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": ORG_ID },
    inLanguage: "en",
    primaryImageOfPage: opts.image ? { "@type": "ImageObject", url: opts.image } : null,
    datePublished: opts.datePublished,
    dateModified: opts.dateModified
  });
}
function articleSchema(opts) {
  const url = `${SITE_URL}${opts.path.replace(/\/+$/, "")}`;
  return compact({
    "@type": "Article",
    "@id": `${url}#article`,
    headline: opts.headline,
    description: opts.description,
    mainEntityOfPage: url,
    datePublished: opts.datePublished,
    dateModified: opts.dateModified || opts.datePublished,
    author: opts.authorName ? { "@type": "Person", name: opts.authorName } : { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
    image: opts.image,
    inLanguage: "en"
  });
}
function howToSchema(opts) {
  return {
    "@type": "HowTo",
    name: opts.name,
    description: opts.description,
    step: opts.steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text
    }))
  };
}
const SEO_TITLE$1 = "FIBI — Fractional Land Investment in Kenya";
const SEO_DESCRIPTION$1 = "Invest from a fraction of the cost in vetted Kenyan land projects — eco-lodges, solar and agriculture. Transparent terms, published returns, collective ownership.";
const HERO_IMAGES$1 = [
  "/images/capsule12.jpeg",
  "/images/avo3.jpg",
  "/images/solar2.jpg"
];
function Home() {
  const { isAuthenticated, authReady } = useAuth();
  const [currentImage, setCurrentImage] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => {
      setCurrentImage((p) => (p + 1) % HERO_IMAGES$1.length);
    }, 4e3);
    return () => window.clearInterval(t);
  }, []);
  const features = [
    {
      icon: Leaf,
      title: "Sustainable focus",
      body: "Eco-friendly development and long-term environmental impact on every project.",
      ring: "ring-emerald-300",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600"
    },
    {
      icon: Users$1,
      title: "Fractional ownership",
      body: "Low minimums so you pool capital with others and diversify your portfolio.",
      ring: "ring-emerald-300",
      iconBg: "bg-teal-100",
      iconColor: "text-teal-700"
    },
    {
      icon: TrendingUp,
      title: "Passive income",
      body: "Monthly or quarterly returns from operational income as projects mature.",
      ring: "ring-emerald-300",
      iconBg: "bg-cyan-100",
      iconColor: "text-cyan-700"
    },
    {
      icon: Shield,
      title: "Vetted projects",
      body: "Each listing is researched and verified by our team before it goes live.",
      ring: "ring-emerald-300",
      // updated to match green
      iconBg: "bg-slate-100",
      iconColor: "text-slate-700"
    }
  ];
  const steps = [
    { n: 1, t: "Browse", d: "Review returns, timelines, and documents for each project." },
    { n: 2, t: "Invest", d: "Contribute alongside others with clear minimums and terms." },
    { n: 3, t: "Build", d: "Sustainable structures and operations on the ground." },
    { n: 4, t: "Earn", d: "Receive distributions on the schedule defined for each deal." }
  ];
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-white", children: [
    /* @__PURE__ */ jsx(
      Seo,
      {
        title: SEO_TITLE$1,
        bareTitle: true,
        description: SEO_DESCRIPTION$1,
        path: "/",
        jsonLd: [
          baseGraph(
            webPageSchema({
              name: SEO_TITLE$1,
              description: SEO_DESCRIPTION$1,
              path: "/"
            }),
            breadcrumbSchema([{ name: "Home", path: "/" }])
          )
        ]
      }
    ),
    /* @__PURE__ */ jsxs("section", { className: "relative min-h-[100svh] flex items-center justify-center overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0", children: HERO_IMAGES$1.map((src, i) => /* @__PURE__ */ jsx(
        "div",
        {
          className: `absolute inset-0 bg-cover bg-center transition-opacity duration-[1200ms] ${i === currentImage ? "opacity-100" : "opacity-0"}`,
          style: { backgroundImage: `url(${src})` }
        },
        src
      )) }),
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-emerald-950/20" }),
      /* @__PURE__ */ jsxs("div", { className: "relative z-10 text-center max-w-4xl mx-auto px-4 text-white pt-16 pb-24", children: [
        /* @__PURE__ */ jsxs("p", { className: "inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm text-emerald-100 backdrop-blur-md mb-6", children: [
          /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4 text-emerald-300" }),
          "Kenyan land & sustainability, together"
        ] }),
        /* @__PURE__ */ jsxs("h1", { className: "text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 text-balance", children: [
          "Invest together.",
          /* @__PURE__ */ jsx("span", { className: "text-emerald-500", children: " Profit together." })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-lg sm:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed mb-10", children: "FIBI connects you to vetted eco-lodges, solar, and agriculture—transparent, fractional, built for long-term returns." }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row items-center justify-center gap-3", children: [
          /* @__PURE__ */ jsx(Link, { to: "/projects", children: /* @__PURE__ */ jsxs(
            Button,
            {
              size: "lg",
              className: "h-12 px-8 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow-lg shadow-emerald-950/40",
              children: [
                "View opportunities",
                /* @__PURE__ */ jsx(ArrowRight, { className: "ml-2 h-4 w-4" })
              ]
            }
          ) }),
          authReady && (isAuthenticated ? /* @__PURE__ */ jsx(Link, { to: "/dashboard", children: /* @__PURE__ */ jsx(
            Button,
            {
              size: "lg",
              variant: "outline",
              className: "h-12 px-8 rounded-full border-white/35 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm",
              children: "My portfolio"
            }
          ) }) : /* @__PURE__ */ jsx(Link, { to: "/signup", children: /* @__PURE__ */ jsx(
            Button,
            {
              size: "lg",
              variant: "outline",
              className: "h-12 px-8 rounded-full border-white/35 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm",
              children: "Create account"
            }
          ) })),
          /* @__PURE__ */ jsx(Link, { to: "/membership", children: /* @__PURE__ */ jsx(
            Button,
            {
              size: "lg",
              variant: "outline",
              className: "h-12 px-8 rounded-full border-white/35 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm",
              children: "Join membership"
            }
          ) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex justify-center gap-2 mt-14", children: HERO_IMAGES$1.map((_, i) => /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            "aria-label": `Slide ${i + 1}`,
            onClick: () => setCurrentImage(i),
            className: `h-1.5 rounded-full transition-all ${i === currentImage ? "w-8 bg-emerald-600" : "w-1.5 bg-white/35 hover:bg-white/55"}`
          },
          i
        )) })
      ] })
    ] }),
    /* @__PURE__ */ jsx("section", { className: "py-20 sm:py-28 px-4 bg-gradient-to-b from-slate-50 to-white", children: /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center max-w-2xl mx-auto mb-14", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight", children: "Why FIBI?" }),
        /* @__PURE__ */ jsx("p", { className: "mt-3 text-slate-600 text-lg", children: "Clarity, impact, and access to real asset-backed opportunities." })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid sm:grid-cols-2 gap-5 sm:gap-6", children: features.map((f) => /* @__PURE__ */ jsx(
        Card,
        {
          className: `border-0 rounded-2xl shadow-lg shadow-slate-200/40 ring-1 ${f.ring} hover:shadow-xl transition-shadow duration-300`,
          children: /* @__PURE__ */ jsxs(CardContent, { className: "p-6 sm:p-8", children: [
            /* @__PURE__ */ jsx(
              "div",
              {
                className: `w-14 h-14 rounded-2xl ${f.iconBg} flex items-center justify-center mb-5`,
                children: /* @__PURE__ */ jsx(f.icon, { className: `h-7 w-7 ${f.iconColor}` })
              }
            ),
            /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold text-slate-900 mb-2", children: f.title }),
            /* @__PURE__ */ jsx("p", { className: "text-slate-600 leading-relaxed", children: f.body })
          ] })
        },
        f.title
      )) })
    ] }) }),
    /* @__PURE__ */ jsx("section", { className: "py-20 sm:py-28 px-4 bg-slate-50 border-y border-slate-100", children: /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-center text-3xl sm:text-4xl font-bold text-slate-900 mb-4", children: "How it works" }),
      /* @__PURE__ */ jsx("p", { className: "text-center text-slate-600 max-w-2xl mx-auto mb-14 text-lg", children: "From discovery to distributions—simple steps for serious participation." }),
      /* @__PURE__ */ jsx("div", { className: "grid sm:grid-cols-2 lg:grid-cols-4 gap-5", children: steps.map((s) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: "rounded-2xl bg-white p-6 text-center shadow-md shadow-slate-200/40 transition-transform duration-300 hover:scale-105 hover:-translate-y-2",
          children: [
            /* @__PURE__ */ jsx("div", { className: "w-12 h-12 mx-auto mb-4 rounded-2xl bg-emerald-600 text-white font-bold flex items-center justify-center shadow-md", children: s.n }),
            /* @__PURE__ */ jsx("h3", { className: "font-semibold text-slate-900 text-lg mb-2", children: s.t }),
            /* @__PURE__ */ jsx("p", { className: "text-slate-600 text-sm leading-relaxed", children: s.d })
          ]
        },
        s.n
      )) })
    ] }) }),
    /* @__PURE__ */ jsxs("section", { className: "relative py-24 sm:py-32 px-4 overflow-hidden", children: [
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "absolute inset-0 bg-cover bg-center",
          style: { backgroundImage: "url('/images/hero3.png')" }
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-black/70 via-black/45 to-black/40" }),
      /* @__PURE__ */ jsxs("div", { className: "relative z-10 max-w-7xl mx-auto flex flex-col lg:flex-row items-stretch gap-10 lg:gap-16", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col justify-center text-center lg:text-left text-white", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4", children: "Ready to start?" }),
          /* @__PURE__ */ jsx("p", { className: "text-lg text-white/85 max-w-xl mx-auto lg:mx-0 leading-relaxed", children: "Open projects show funding progress, targets, and timelines—so you decide with confidence." })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "w-full max-w-md lg:max-w-lg mx-auto lg:mx-0 shrink-0", children: /* @__PURE__ */ jsxs("div", { className: "rounded-3xl p-8 sm:p-10 shadow-2xl bg-emerald-600 text-white", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold uppercase tracking-wider mb-1", children: "Next step" }),
          /* @__PURE__ */ jsx("h3", { className: "text-2xl font-bold mb-3", children: "Explore the marketplace" }),
          /* @__PURE__ */ jsx("p", { className: "mb-6 leading-relaxed", children: "Compare minimums and projected ROI across all live listings." }),
          /* @__PURE__ */ jsx(Link, { to: "/projects", className: "block", children: /* @__PURE__ */ jsxs(Button, { className: "w-full h-12 rounded-xl bg-white text-black shadow-lg hover:bg-slate-100 hover:shadow-xl hover:scale-105 hover:text-black transition-all duration-200", children: [
            "Browse opportunities",
            /* @__PURE__ */ jsx(ArrowRight, { className: "ml-2 h-4 w-4" })
          ] }) }),
          authReady && !isAuthenticated && /* @__PURE__ */ jsxs("p", { className: "text-center text-sm mt-4", children: [
            "New?",
            " ",
            /* @__PURE__ */ jsx(
              Link,
              {
                to: "/signup",
                className: "text-white font-bold underline hover:text-emerald-100 transition-colors",
                children: "Sign up free"
              }
            )
          ] })
        ] }) })
      ] })
    ] })
  ] });
}
function resolveMediaUrl(pathOrUrl) {
  if (!pathOrUrl) return "";
  const s = pathOrUrl.trim();
  if (!s) return "";
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  const base = getApiBase().replace(/\/$/, "");
  const path = s.startsWith("/") ? s : `/${s}`;
  return `${base}${path}`;
}
function dedupeUrls(urls) {
  return [...new Set(urls.filter(Boolean))];
}
function mapTimelineStatus(status) {
  if (status === "in_progress" || status === "in-progress") return "in-progress";
  if (status === "completed") return "completed";
  return "upcoming";
}
function mapProjectStatus(status) {
  if (status === "open" || status === "funded" || status === "active" || status === "closed") {
    return status;
  }
  return "open";
}
function normalizeApiProject(raw) {
  const primaryRaw = raw.imageUrl || "";
  const fromRows = (raw.projectImages ?? []).map((r) => r.imageUrl);
  const orderedRaw = dedupeUrls([primaryRaw, ...fromRows]);
  const images = orderedRaw.map((url) => resolveMediaUrl(url));
  const imageUrl = resolveMediaUrl(primaryRaw) || images[0] || "";
  const deadline = typeof raw.fundingDeadline === "string" ? raw.fundingDeadline : new Date(raw.fundingDeadline).toISOString();
  return {
    id: raw.id,
    title: raw.title,
    location: raw.location,
    category: raw.category,
    minInvestmentMinor: Number(raw.minInvestmentMinor),
    totalFundingMinor: Number(raw.totalFundingMinor),
    currentFundingMinor: Number(raw.currentFundingMinor),
    currency: raw.currency || "USD",
    investors: Number(raw.investorsCount ?? 0),
    projectedROI: Number(raw.projectedROI),
    payoutFrequency: raw.payoutFrequency,
    fundingDeadline: deadline,
    description: raw.description ?? "",
    features: Array.isArray(raw.features) ? raw.features : [],
    imageUrl,
    images: images.length > 0 ? images : imageUrl ? [imageUrl] : [],
    status: mapProjectStatus(raw.status),
    timeline: (raw.timeline ?? []).map((t) => ({
      phase: t.phase,
      status: mapTimelineStatus(t.status)
    }))
  };
}
const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary: "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive: "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline: "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function Badge({
  className,
  variant,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "span";
  return /* @__PURE__ */ jsx(
    Comp,
    {
      "data-slot": "badge",
      className: cn(badgeVariants({ variant }), className),
      ...props
    }
  );
}
function Progress({
  className,
  value,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    ProgressPrimitive.Root,
    {
      "data-slot": "progress",
      className: cn(
        "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
        className
      ),
      ...props,
      children: /* @__PURE__ */ jsx(
        ProgressPrimitive.Indicator,
        {
          "data-slot": "progress-indicator",
          className: "bg-primary h-full w-full flex-1 transition-all",
          style: { transform: `translateX(-${100 - (value || 0)}%)` }
        }
      )
    }
  );
}
const SEO_TITLE = "Land investment projects in Kenya";
const SEO_DESCRIPTION = "Browse open FIBI projects — eco-lodge, solar and agricultural developments in Kenya, each with its funding target, minimum contribution, projected return and deadline.";
const SLIDER = [
  "/images/hero5.jpeg",
  "/images/hero6.jpg",
  "/images/hero7.png",
  "/images/hero8.jpg"
];
function Projects$1() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const [projects, setProjects] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState("");
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setListLoading(true);
      setListError("");
      const result = await getJson("/api/v1/projects");
      if (cancelled) return;
      if (!result.ok) {
        setListError(result.error || "Could not load projects.");
        setProjects([]);
      } else {
        setProjects((result.data.projects ?? []).map(normalizeApiProject));
      }
      setListLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  const [slide, setSlide] = useState(0);
  const [fade, setFade] = useState(false);
  const withFade = useCallback((fn) => {
    setFade(true);
    window.setTimeout(() => {
      fn();
      setFade(false);
    }, 220);
  }, []);
  useEffect(() => {
    const id = window.setInterval(() => {
      withFade(() => setSlide((p) => (p + 1) % SLIDER.length));
    }, 6e3);
    return () => window.clearInterval(id);
  }, [withFade]);
  const formatCurrency2 = (minorUnits) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
    minorUnits / 100
  );
  const categoryLabel = (c) => ({ "eco-lodge": "Eco lodge", "solar-roof": "Solar", agriculture: "Agriculture" })[c] || c;
  const statusClass = {
    open: "bg-emerald-500 hover:bg-emerald-600 border-0 text-white",
    funded: "bg-sky-600 hover:bg-sky-700 border-0 text-white",
    active: "bg-violet-600 hover:bg-violet-700 border-0 text-white",
    closed: "bg-slate-600 hover:bg-slate-700 border-0 text-white"
  };
  const statusLabel = (s) => {
    if (s === "open") return "Open";
    if (s === "funded") return "Funded";
    if (s === "closed") return "Closed";
    return "Active";
  };
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/35", children: [
    /* @__PURE__ */ jsx(
      Seo,
      {
        title: SEO_TITLE,
        description: SEO_DESCRIPTION,
        path: "/projects",
        jsonLd: [
          baseGraph(
            webPageSchema({
              name: SEO_TITLE,
              description: SEO_DESCRIPTION,
              path: "/projects"
            }),
            breadcrumbSchema([
              { name: "Home", path: "/" },
              { name: "Projects", path: "/projects" }
            ])
          )
        ]
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "relative h-[min(400px,52vh)] min-h-[280px]", children: [
      /* @__PURE__ */ jsx(
        "img",
        {
          src: SLIDER[slide],
          alt: "",
          className: `absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${fade ? "opacity-0" : "opacity-100"}`
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black/40" }),
      /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 z-10 flex flex-col items-center justify-center px-4 text-center sm:px-20", children: [
        /* @__PURE__ */ jsx("p", { className: "text-emerald-200/90 text-xs font-semibold uppercase tracking-[0.2em] mb-2", children: "Investor marketplace" }),
        /* @__PURE__ */ jsx("h1", { className: "text-4xl sm:text-5xl font-bold text-white tracking-tight", children: "Opportunities" }),
        /* @__PURE__ */ jsx("p", { className: "mt-3 text-white/85 max-w-xl text-sm sm:text-base", children: "Vetted projects—funding, ROI, and timelines in one place." }),
        /* @__PURE__ */ jsxs("p", { className: "mt-4 inline-flex items-center gap-2 text-white/70 text-sm", children: [
          /* @__PURE__ */ jsx(Users$1, { className: "h-4 w-4" }),
          projects.length,
          " listings"
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          "aria-label": "Previous",
          onClick: () => withFade(() => setSlide((p) => p === 0 ? SLIDER.length - 1 : p - 1)),
          className: "absolute left-3 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border border-white/10 bg-black/40 p-2.5 text-white backdrop-blur-sm transition-colors hover:bg-black/55 sm:block",
          children: /* @__PURE__ */ jsx(ChevronLeft, { className: "h-5 w-5" })
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          "aria-label": "Next",
          onClick: () => withFade(() => setSlide((p) => (p + 1) % SLIDER.length)),
          className: "absolute right-3 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border border-white/10 bg-black/40 p-2.5 text-white backdrop-blur-sm transition-colors hover:bg-black/55 sm:block",
          children: /* @__PURE__ */ jsx(ChevronRight, { className: "h-5 w-5" })
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2", children: SLIDER.map((_, i) => /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          "aria-label": `Slide ${i + 1}`,
          onClick: () => withFade(() => setSlide(i)),
          className: `h-2 rounded-full transition-all ${i === slide ? "w-8 bg-emerald-400" : "w-2 bg-white/45"}`
        },
        i
      )) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-10", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight", children: "All projects" }),
          /* @__PURE__ */ jsx("p", { className: "text-slate-600 mt-1 text-sm sm:text-base", children: "Compare minimums, funding, and returns." })
        ] }),
        /* @__PURE__ */ jsx(Link, { to: "/", children: /* @__PURE__ */ jsx(Button, { variant: "outline", className: "rounded-xl border-slate-200 w-full sm:w-auto", children: "Home" }) })
      ] }),
      listError && /* @__PURE__ */ jsx("p", { className: "mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900", children: listError }),
      listLoading ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-24 text-slate-500 gap-3", children: [
        /* @__PURE__ */ jsx(Loader2, { className: "h-10 w-10 animate-spin text-emerald-600" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm", children: "Loading projects…" })
      ] }) : /* @__PURE__ */ jsx("div", { className: "grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3", children: projects.map((project) => {
        const pct = project.totalFundingMinor > 0 ? Math.min(100, project.currentFundingMinor / project.totalFundingMinor * 100) : 0;
        return /* @__PURE__ */ jsxs(
          Card,
          {
            className: "group fx-lift overflow-hidden rounded-2xl border-0 shadow-lg shadow-slate-200/50 ring-1 ring-slate-100 transition-all hover:ring-emerald-200/60 hover:shadow-xl",
            children: [
              /* @__PURE__ */ jsxs("div", { className: "relative aspect-[16/10] overflow-hidden bg-slate-100", children: [
                /* @__PURE__ */ jsx(
                  "img",
                  {
                    src: project.imageUrl,
                    alt: "",
                    className: "h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  }
                ),
                /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/45 to-transparent opacity-80" }),
                /* @__PURE__ */ jsx(Badge, { className: `absolute right-3 top-3 ${statusClass[project.status] ?? "bg-slate-600"}`, children: statusLabel(project.status) }),
                /* @__PURE__ */ jsx(Badge, { className: "absolute left-3 top-3 border-0 bg-white/95 capitalize text-slate-800 shadow-sm", children: categoryLabel(project.category) })
              ] }),
              /* @__PURE__ */ jsxs(CardHeader, { className: "space-y-1 px-5 pt-5 pb-0", children: [
                /* @__PURE__ */ jsx("h3", { className: "line-clamp-2 text-lg font-semibold leading-snug text-slate-900", children: project.title }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center text-sm text-slate-500", children: [
                  /* @__PURE__ */ jsx(MapPin, { className: "mr-1 h-4 w-4 shrink-0 text-emerald-600" }),
                  project.location
                ] })
              ] }),
              /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4 px-5 pb-5 pt-4", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5", children: [
                  /* @__PURE__ */ jsxs("span", { className: "flex items-center text-sm text-slate-600", children: [
                    /* @__PURE__ */ jsx(TrendingUp, { className: "mr-2 h-4 w-4 text-emerald-600" }),
                    "Projected ROI"
                  ] }),
                  /* @__PURE__ */ jsxs("span", { className: "text-lg font-bold text-emerald-600", children: [
                    project.projectedROI,
                    "%"
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsxs("div", { className: "mb-2 flex justify-between text-sm", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-slate-600", children: "Funding" }),
                    /* @__PURE__ */ jsxs("span", { className: "font-semibold tabular-nums text-slate-900", children: [
                      pct.toFixed(0),
                      "%"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsx(
                    Progress,
                    {
                      value: pct,
                      className: "h-2.5 bg-slate-100 [&>[data-slot=progress-indicator]]:bg-emerald-600"
                    }
                  ),
                  /* @__PURE__ */ jsxs("div", { className: "mt-1.5 flex justify-between text-xs text-slate-500", children: [
                    /* @__PURE__ */ jsxs("span", { children: [
                      formatCurrency2(project.currentFundingMinor),
                      " raised"
                    ] }),
                    /* @__PURE__ */ jsxs("span", { children: [
                      formatCurrency2(project.totalFundingMinor),
                      " goal"
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 border-t border-slate-100 pt-3 text-sm text-slate-600", children: [
                  /* @__PURE__ */ jsx(Calendar, { className: "h-4 w-4 text-slate-400" }),
                  "Min.",
                  " ",
                  /* @__PURE__ */ jsx("span", { className: "font-semibold text-slate-900", children: formatCurrency2(project.minInvestmentMinor) })
                ] }),
                /* @__PURE__ */ jsx(Link, { to: `/projects/${project.id}`, className: "block", children: /* @__PURE__ */ jsx(Button, { className: "h-11 w-full rounded-xl bg-emerald-600 hover:bg-emerald-700", children: "View details" }) })
              ] })
            ]
          },
          project.id
        );
      }) })
    ] })
  ] });
}
function Input({ className, type, ...props }) {
  return /* @__PURE__ */ jsx(
    "input",
    {
      type,
      "data-slot": "input",
      className: cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base bg-input-background transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      ),
      ...props
    }
  );
}
function Label({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    LabelPrimitive.Root,
    {
      "data-slot": "label",
      className: cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      ),
      ...props
    }
  );
}
function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    SeparatorPrimitive.Root,
    {
      "data-slot": "separator-root",
      decorative,
      orientation,
      className: cn(
        "bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
        className
      ),
      ...props
    }
  );
}
const GLOBAL_KEY = "__FIBI_PRERENDER__";
let serverPayload = {};
function setPrerenderPayload(payload) {
  serverPayload = payload;
}
function resetPrerenderPayload() {
  serverPayload = {};
}
function getPrerenderPayload() {
  if (typeof window === "undefined") return serverPayload;
  return window[GLOBAL_KEY] ?? {};
}
function consumePrerenderPayload() {
  const payload = getPrerenderPayload();
  if (typeof window !== "undefined") delete window[GLOBAL_KEY];
  return payload;
}
function serializePrerenderPayload(payload) {
  if (!payload || Object.keys(payload).length === 0) return "";
  const json = JSON.stringify(payload).replace(/</g, "\\u003c");
  return `<script>window.${GLOBAL_KEY}=${json};<\/script>`;
}
function ProjectDetail() {
  var _a;
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [seededProject] = useState(() => {
    const seeded = consumePrerenderPayload().project ?? null;
    return seeded && String(seeded.id) === String(id) ? seeded : null;
  });
  const [project, setProject] = useState(seededProject);
  const [loadState, setLoadState] = useState(
    seededProject ? "ready" : "loading"
  );
  const [loadError, setLoadError] = useState("");
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState("STRIPE");
  const [wireInstructions, setWireInstructions] = useState(null);
  const [copiedRef, setCopiedRef] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  useEffect(() => {
    if (!id) {
      setProject(null);
      setLoadState("error");
      setLoadError("Missing project id.");
      return;
    }
    let cancelled = false;
    const alreadyShowing = seededProject && String(seededProject.id) === String(id);
    if (!alreadyShowing) setLoadState("loading");
    setLoadError("");
    setCurrentImage(0);
    (async () => {
      const result = await getJson(`/api/v1/projects/${id}`);
      if (cancelled) return;
      if (!result.ok) {
        setProject(null);
        setLoadState("error");
        setLoadError(result.error || "Project not found.");
        return;
      }
      setProject(normalizeApiProject(result.data.project));
      setLoadState("ready");
    })();
    return () => {
      cancelled = true;
    };
  }, [id, seededProject]);
  const images = ((_a = project == null ? void 0 : project.images) == null ? void 0 : _a.length) ? project.images : project ? [project.imageUrl] : [];
  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    (async () => {
      const res = await getJson("/api/v1/payments/methods");
      if (cancelled || !res.ok) return;
      const methods = res.data.methods ?? [];
      setPaymentMethods(methods);
      if (methods.length > 0 && !methods.some((m) => m.provider === selectedProvider)) {
        setSelectedProvider(methods[0].provider);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);
  if (loadState === "loading") {
    return /* @__PURE__ */ jsxs("div", { className: "min-h-[70vh] flex flex-col items-center justify-center px-4 bg-gradient-to-b from-slate-50 to-emerald-50/30 gap-3", children: [
      /* @__PURE__ */ jsx(Loader2, { className: "h-10 w-10 animate-spin text-emerald-600" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-600", children: "Loading project…" })
    ] });
  }
  if (!project || loadState === "error") {
    return /* @__PURE__ */ jsxs("div", { className: "min-h-[70vh] flex flex-col items-center justify-center px-4 bg-gradient-to-b from-slate-50 to-emerald-50/30", children: [
      /* @__PURE__ */ jsx(Seo, { title: "Project not found", path: `/projects/${id ?? ""}`, noindex: true }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-3xl bg-white p-10 text-center shadow-xl ring-1 ring-slate-100 max-w-md", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-slate-900 mb-2", children: "Project not found" }),
        /* @__PURE__ */ jsx("p", { className: "text-slate-600 mb-6 text-sm", children: loadError || "This listing may have moved. Browse all opportunities." }),
        /* @__PURE__ */ jsx(Link, { to: "/projects", children: /* @__PURE__ */ jsx(Button, { className: "rounded-xl bg-emerald-600 hover:bg-emerald-700", children: "Back to projects" }) })
      ] })
    ] });
  }
  const fundingPct = project.totalFundingMinor > 0 ? Math.min(100, project.currentFundingMinor / project.totalFundingMinor * 100) : 0;
  const remaining = project.totalFundingMinor - project.currentFundingMinor;
  const formatCurrency2 = (minorUnits) => new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(minorUnits / 100);
  const categoryLabel = (category) => ({ "eco-lodge": "Eco lodge", "solar-roof": "Solar roof", agriculture: "Agriculture" })[category] || category;
  const statusIcon = (status) => {
    switch (status) {
      case "completed":
        return /* @__PURE__ */ jsx(CheckCircle2, { className: "h-5 w-5 text-emerald-600" });
      case "in-progress":
        return /* @__PURE__ */ jsx(Circle, { className: "h-5 w-5 fill-teal-500 text-teal-600" });
      default:
        return /* @__PURE__ */ jsx(Circle, { className: "h-5 w-5 text-slate-300" });
    }
  };
  const projectedReturn = () => {
    const major = parseFloat(investmentAmount);
    if (Number.isNaN(major) || major <= 0) return 0;
    return Math.round(major * 100 * (project.projectedROI / 100));
  };
  const statusBadge = project.status === "open" ? "bg-emerald-500 text-white border-0" : project.status === "funded" ? "bg-sky-600 text-white border-0" : project.status === "closed" ? "bg-slate-600 text-white border-0" : "bg-violet-600 text-white border-0";
  const statusHeadline = project.status === "open" ? "Open" : project.status === "funded" ? "Funded" : project.status === "closed" ? "Closed" : "Active";
  const handleInvest = async () => {
    setSubmitError("");
    setSubmitSuccess("");
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    const amountMajor = Number(investmentAmount);
    if (!Number.isFinite(amountMajor) || amountMajor <= 0) {
      setSubmitError("Enter a valid investment amount.");
      return;
    }
    const amountMinor = Math.round(amountMajor * 100);
    if (amountMinor < project.minInvestmentMinor) {
      setSubmitError(`Minimum investment is ${formatCurrency2(project.minInvestmentMinor)}.`);
      return;
    }
    setIsSubmitting(true);
    const result = await postJson("/api/v1/investments", {
      projectId: project.id,
      amountInvestedMinor: amountMinor,
      provider: selectedProvider
    });
    setIsSubmitting(false);
    if (!result.ok) {
      setSubmitError(result.error || "Unable to complete investment.");
      return;
    }
    const nextAction = result.data.nextAction;
    if ((nextAction == null ? void 0 : nextAction.type) === "bank_transfer") {
      setWireInstructions({
        reference: nextAction.reference,
        account: nextAction.account,
        instructions: nextAction.instructions
      });
      setInvestmentAmount("");
      return;
    }
    const redirectUrl = (nextAction == null ? void 0 : nextAction.type) === "redirect" ? nextAction.url : result.data.checkoutUrl;
    if (!redirectUrl) {
      setSubmitError(result.data.message || "Unable to initiate payment.");
      return;
    }
    setSubmitSuccess(result.data.message || "Redirecting to payment…");
    setInvestmentAmount("");
    window.location.href = redirectUrl;
  };
  const copyReference = () => {
    var _a2;
    if (!wireInstructions) return;
    void ((_a2 = navigator.clipboard) == null ? void 0 : _a2.writeText(wireInstructions.reference).then(() => {
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 1800);
    }));
  };
  const projectPath = `/projects/${project.id}`;
  const categoryName = categoryLabel(project.category);
  const seoDescription = `${categoryName} project in ${project.location}, Kenya. Targeting ${project.projectedROI}% projected ROI with ${project.payoutFrequency} payouts. ` + `${project.description || ""}`.trim().slice(0, 300);
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/25", children: [
    /* @__PURE__ */ jsx(
      Seo,
      {
        title: `${project.title} — ${categoryName} in ${project.location}`,
        description: seoDescription,
        path: projectPath,
        image: project.imageUrl || void 0,
        jsonLd: [
          baseGraph(
            webPageSchema({
              name: project.title,
              description: seoDescription,
              path: projectPath,
              image: project.imageUrl || void 0
            }),
            breadcrumbSchema([
              { name: "Home", path: "/" },
              { name: "Projects", path: "/projects" },
              { name: project.title, path: projectPath }
            ])
          )
        ]
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "border-b border-slate-100 bg-white/80 backdrop-blur-md", children: /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center gap-2 text-sm text-slate-600", children: [
      /* @__PURE__ */ jsxs(Link, { to: "/", className: "hover:text-emerald-700 flex items-center gap-1", children: [
        /* @__PURE__ */ jsx(Home$1, { className: "h-4 w-4" }),
        "Home"
      ] }),
      /* @__PURE__ */ jsx(ChevronRight, { className: "h-4 w-4 text-slate-300" }),
      /* @__PURE__ */ jsx(Link, { to: "/projects", className: "hover:text-emerald-700", children: "Projects" }),
      /* @__PURE__ */ jsx(ChevronRight, { className: "h-4 w-4 text-slate-300" }),
      /* @__PURE__ */ jsx("span", { className: "text-slate-900 font-medium truncate max-w-[200px] sm:max-w-md", children: project.title })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10", children: [
      /* @__PURE__ */ jsxs(
        Link,
        {
          to: "/projects",
          className: "inline-flex items-center gap-2 text-sm font-medium text-emerald-700 hover:text-emerald-800 mb-6",
          children: [
            /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
            "All projects"
          ]
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-8 lg:grid-cols-3 lg:gap-10", children: [
        /* @__PURE__ */ jsxs("div", { className: "lg:col-span-2 space-y-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "relative aspect-[16/10] sm:h-[min(480px,55vh)] overflow-hidden rounded-3xl bg-slate-100 shadow-xl ring-1 ring-slate-200/80", children: [
            /* @__PURE__ */ jsx(
              "img",
              {
                src: images[currentImage],
                alt: "",
                className: "h-full w-full object-cover"
              }
            ),
            images.length > 1 && /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  "aria-label": "Previous image",
                  onClick: () => setCurrentImage((p) => p === 0 ? images.length - 1 : p - 1),
                  className: "absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/45 p-3 text-white backdrop-blur-sm hover:bg-black/60",
                  children: /* @__PURE__ */ jsx(ChevronLeft, { className: "h-5 w-5" })
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  "aria-label": "Next image",
                  onClick: () => setCurrentImage((p) => (p + 1) % images.length),
                  className: "absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/45 p-3 text-white backdrop-blur-sm hover:bg-black/60",
                  children: /* @__PURE__ */ jsx(ChevronRight, { className: "h-5 w-5" })
                }
              ),
              /* @__PURE__ */ jsx("div", { className: "absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2", children: images.map((_, idx) => /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  "aria-label": `Image ${idx + 1}`,
                  onClick: () => setCurrentImage(idx),
                  className: `h-2 rounded-full transition-all ${currentImage === idx ? "w-7 bg-emerald-400" : "w-2 bg-white/50"}`
                },
                idx
              )) })
            ] })
          ] }),
          /* @__PURE__ */ jsxs(Card, { className: "border-0 rounded-2xl shadow-lg shadow-slate-200/40 ring-1 ring-slate-100", children: [
            /* @__PURE__ */ jsx(CardHeader, { className: "space-y-4 pb-2", children: /* @__PURE__ */ jsx("div", { className: "flex flex-wrap items-start justify-between gap-3", children: /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
              /* @__PURE__ */ jsxs("div", { className: "mb-2 flex flex-wrap gap-2", children: [
                /* @__PURE__ */ jsx(Badge, { className: statusBadge, children: statusHeadline }),
                /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "capitalize border-slate-200 text-slate-700", children: categoryLabel(project.category) })
              ] }),
              /* @__PURE__ */ jsx(CardTitle, { className: "text-2xl sm:text-3xl font-bold leading-tight text-slate-900", children: project.title }),
              /* @__PURE__ */ jsxs("div", { className: "mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-600", children: [
                /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsx(MapPin, { className: "h-4 w-4 text-emerald-600" }),
                  project.location
                ] }),
                /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsx(Users$1, { className: "h-4 w-4 text-slate-400" }),
                  project.investors,
                  " investors"
                ] }),
                /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsx(Calendar, { className: "h-4 w-4 text-slate-400" }),
                  "Deadline ",
                  new Date(project.fundingDeadline).toLocaleDateString()
                ] })
              ] })
            ] }) }) }),
            /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("p", { className: "leading-relaxed text-slate-700", children: project.description }) })
          ] }),
          /* @__PURE__ */ jsxs(Card, { className: "border-0 rounded-2xl shadow-lg shadow-slate-200/40 ring-1 ring-slate-100", children: [
            /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "text-lg font-semibold", children: "Key features" }) }),
            /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("ul", { className: "space-y-3", children: project.features.map((feature, i) => /* @__PURE__ */ jsxs("li", { className: "flex gap-3", children: [
              /* @__PURE__ */ jsx(CheckCircle2, { className: "mt-0.5 h-5 w-5 shrink-0 text-emerald-600" }),
              /* @__PURE__ */ jsx("span", { className: "text-slate-700", children: feature })
            ] }, i)) }) })
          ] }),
          /* @__PURE__ */ jsxs(Card, { className: "border-0 rounded-2xl shadow-lg shadow-slate-200/40 ring-1 ring-slate-100", children: [
            /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "text-lg font-semibold", children: "Development timeline" }) }),
            /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("div", { className: "relative space-y-0 pl-2", children: [
              /* @__PURE__ */ jsx("div", { className: "absolute left-[11px] top-2 bottom-2 w-0.5 bg-emerald-100", "aria-hidden": true }),
              project.timeline.map((phase, index) => /* @__PURE__ */ jsxs("div", { className: "relative flex gap-4 pb-8 last:pb-0", children: [
                /* @__PURE__ */ jsx("div", { className: "relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white ring-2 ring-emerald-100", children: statusIcon(phase.status) }),
                /* @__PURE__ */ jsxs("div", { className: "min-w-0 pt-0.5", children: [
                  /* @__PURE__ */ jsx("h4", { className: "font-semibold text-slate-900", children: phase.phase }),
                  /* @__PURE__ */ jsx("p", { className: "text-sm capitalize text-slate-500", children: phase.status.replace("-", " ") })
                ] })
              ] }, index))
            ] }) })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs(Card, { className: "sticky top-6 border-0 rounded-2xl shadow-xl shadow-slate-200/50 ring-1 ring-slate-100 overflow-hidden", children: [
          /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-br from-emerald-600 to-teal-700 px-5 py-4 text-white", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs font-medium uppercase tracking-wider text-emerald-100", children: "Invest" }),
            /* @__PURE__ */ jsxs("p", { className: "mt-1 text-2xl font-bold", children: [
              formatCurrency2(project.minInvestmentMinor),
              " min"
            ] })
          ] }),
          /* @__PURE__ */ jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsx(CardTitle, { className: "text-base font-semibold text-slate-900", children: "Deal terms" }) }),
          /* @__PURE__ */ jsxs(CardContent, { className: "space-y-5", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between rounded-xl bg-slate-50 px-3 py-3", children: [
              /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2 text-sm text-slate-600", children: [
                /* @__PURE__ */ jsx(TrendingUp, { className: "h-4 w-4 text-emerald-600" }),
                "Projected ROI"
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "text-xl font-bold text-emerald-600", children: [
                project.projectedROI,
                "%"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "text-sm text-slate-600", children: [
              "Payouts: ",
              /* @__PURE__ */ jsx("span", { className: "font-medium text-slate-900", children: project.payoutFrequency })
            ] }),
            /* @__PURE__ */ jsx(Separator, {}),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("div", { className: "mb-2 flex justify-between text-sm", children: [
                /* @__PURE__ */ jsx("span", { className: "text-slate-600", children: "Funding" }),
                /* @__PURE__ */ jsxs("span", { className: "font-semibold tabular-nums", children: [
                  fundingPct.toFixed(0),
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ jsx(
                Progress,
                {
                  value: fundingPct,
                  className: "h-2.5 bg-slate-100 [&>[data-slot=progress-indicator]]:bg-emerald-600"
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "mt-2 grid grid-cols-2 gap-3 text-sm", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("p", { className: "text-slate-500", children: "Raised" }),
                  /* @__PURE__ */ jsx("p", { className: "font-semibold text-slate-900", children: formatCurrency2(project.currentFundingMinor) })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("p", { className: "text-slate-500", children: "Remaining" }),
                  /* @__PURE__ */ jsx("p", { className: "font-semibold text-slate-900", children: formatCurrency2(remaining) })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsx(Separator, {}),
            wireInstructions ? /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsx("div", { className: "rounded-xl border border-emerald-200 bg-emerald-50/70 p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2", children: [
                /* @__PURE__ */ jsx(Landmark, { className: "mt-0.5 h-4 w-4 shrink-0 text-emerald-700" }),
                /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                  /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-emerald-900", children: "Transfer details ready" }),
                  /* @__PURE__ */ jsx("p", { className: "mt-0.5 text-xs text-emerald-800", children: "Your investment is reserved. It is confirmed once the transfer reaches us." })
                ] })
              ] }) }),
              /* @__PURE__ */ jsxs("div", { className: "rounded-xl border-2 border-dashed border-emerald-300 bg-white p-4 text-center", children: [
                /* @__PURE__ */ jsx("p", { className: "text-xs font-medium uppercase tracking-wide text-slate-500", children: "Payment reference — quote this exactly" }),
                /* @__PURE__ */ jsx("p", { className: "mt-1 font-mono text-xl font-bold tracking-wider text-slate-900", children: wireInstructions.reference }),
                /* @__PURE__ */ jsxs(
                  "button",
                  {
                    type: "button",
                    onClick: copyReference,
                    className: "mt-2 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-50",
                    children: [
                      copiedRef ? /* @__PURE__ */ jsx(Check, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsx(Copy, { className: "h-3.5 w-3.5" }),
                      copiedRef ? "Copied" : "Copy reference"
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsx("dl", { className: "divide-y divide-slate-100 rounded-xl border border-slate-200", children: [
                ["Bank", wireInstructions.account.bankName],
                ["Account name", wireInstructions.account.accountName],
                ["Account number", wireInstructions.account.accountNumber],
                ["SWIFT / BIC", wireInstructions.account.swiftCode],
                ["Branch", wireInstructions.account.branch],
                ["Currency", wireInstructions.account.currency]
              ].filter(([, value]) => Boolean(value)).map(([label, value]) => /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3 px-4 py-2.5", children: [
                /* @__PURE__ */ jsx("dt", { className: "text-xs text-slate-500", children: label }),
                /* @__PURE__ */ jsx("dd", { className: "text-right text-sm font-medium text-slate-800", children: value })
              ] }, label)) }),
              /* @__PURE__ */ jsx("p", { className: "text-xs leading-relaxed text-slate-500", children: wireInstructions.instructions }),
              /* @__PURE__ */ jsx(
                Button,
                {
                  variant: "outline",
                  className: "h-11 w-full rounded-xl",
                  onClick: () => setWireInstructions(null),
                  children: "Make another investment"
                }
              )
            ] }) : /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsxs(Label, { htmlFor: "investment", className: "text-slate-700", children: [
                "Investment amount (",
                project.currency,
                ")"
              ] }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "investment",
                  type: "number",
                  placeholder: `Min. ${formatCurrency2(project.minInvestmentMinor)}`,
                  value: investmentAmount,
                  onChange: (e) => setInvestmentAmount(e.target.value),
                  className: "rounded-xl border-slate-200",
                  min: project.minInvestmentMinor / 100
                }
              ),
              /* @__PURE__ */ jsxs("p", { className: "text-xs text-slate-500", children: [
                "Minimum ",
                formatCurrency2(project.minInvestmentMinor)
              ] }),
              investmentAmount && parseFloat(investmentAmount) * 100 >= project.minInvestmentMinor && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-emerald-200 bg-emerald-50/80 p-4", children: [
                /* @__PURE__ */ jsx("p", { className: "text-xs font-medium text-emerald-800 uppercase tracking-wide", children: "Est. annual return" }),
                /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-emerald-700", children: formatCurrency2(projectedReturn()) }),
                /* @__PURE__ */ jsxs("p", { className: "mt-1 text-xs text-slate-600", children: [
                  "Based on ",
                  project.projectedROI,
                  "% ROI (illustrative)"
                ] })
              ] }),
              paymentMethods.length > 1 && /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx("p", { className: "text-xs font-medium uppercase tracking-wide text-slate-500", children: "Payment method" }),
                /* @__PURE__ */ jsx("div", { className: "space-y-2", children: paymentMethods.map((m) => {
                  const active = selectedProvider === m.provider;
                  return /* @__PURE__ */ jsxs(
                    "button",
                    {
                      type: "button",
                      onClick: () => setSelectedProvider(m.provider),
                      "aria-pressed": active,
                      className: `flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors ${active ? "border-emerald-500 bg-emerald-50/60" : "border-slate-200 hover:border-slate-300"}`,
                      children: [
                        /* @__PURE__ */ jsx(
                          "span",
                          {
                            className: `mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${active ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"}`,
                            children: m.provider === "MANUAL_WIRE" ? /* @__PURE__ */ jsx(Landmark, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(CreditCard, { className: "h-4 w-4" })
                          }
                        ),
                        /* @__PURE__ */ jsxs("span", { className: "min-w-0 flex-1", children: [
                          /* @__PURE__ */ jsx("span", { className: "block text-sm font-medium text-slate-800", children: m.label }),
                          /* @__PURE__ */ jsx("span", { className: "block text-xs text-slate-500", children: m.description }),
                          /* @__PURE__ */ jsx(
                            "span",
                            {
                              className: `mt-1 inline-block rounded-md px-1.5 py-0.5 text-[0.6875rem] font-medium ${m.settlement === "instant" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"}`,
                              children: m.settlement === "instant" ? "Confirmed instantly" : "Confirmed in 1-3 business days"
                            }
                          )
                        ] })
                      ]
                    },
                    m.provider
                  );
                }) })
              ] }),
              project.status === "open" ? /* @__PURE__ */ jsx(
                Button,
                {
                  className: "h-12 w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-base",
                  onClick: () => void handleInvest(),
                  disabled: isSubmitting,
                  children: isSubmitting ? "Processing..." : selectedProvider === "MANUAL_WIRE" ? "Get transfer details" : "Invest now"
                }
              ) : /* @__PURE__ */ jsx(Button, { className: "h-12 w-full rounded-xl", size: "lg", disabled: true, variant: "secondary", children: project.status === "funded" ? "Fully funded" : project.status === "closed" ? "Closed" : "Unavailable" }),
              submitError && /* @__PURE__ */ jsx("p", { className: "text-center text-xs text-red-600", children: submitError }),
              submitSuccess && /* @__PURE__ */ jsx("p", { className: "text-center text-xs text-emerald-700", children: submitSuccess }),
              /* @__PURE__ */ jsx("p", { className: "text-center text-[11px] text-slate-400", children: "Subject to terms and eligibility." })
            ] })
          ] })
        ] }) })
      ] })
    ] })
  ] });
}
function Dialog({
  ...props
}) {
  return /* @__PURE__ */ jsx(DialogPrimitive.Root, { "data-slot": "dialog", ...props });
}
function DialogPortal({
  ...props
}) {
  return /* @__PURE__ */ jsx(DialogPrimitive.Portal, { "data-slot": "dialog-portal", ...props });
}
function DialogOverlay({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    DialogPrimitive.Overlay,
    {
      "data-slot": "dialog-overlay",
      className: cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      ),
      ...props
    }
  );
}
function DialogContent({
  className,
  children,
  ...props
}) {
  return /* @__PURE__ */ jsxs(DialogPortal, { "data-slot": "dialog-portal", children: [
    /* @__PURE__ */ jsx(DialogOverlay, {}),
    /* @__PURE__ */ jsxs(
      DialogPrimitive.Content,
      {
        "data-slot": "dialog-content",
        className: cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
          className
        ),
        ...props,
        children: [
          children,
          /* @__PURE__ */ jsxs(DialogPrimitive.Close, { className: "ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", children: [
            /* @__PURE__ */ jsx(XIcon, {}),
            /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Close" })
          ] })
        ]
      }
    )
  ] });
}
function DialogHeader({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "dialog-header",
      className: cn("flex flex-col gap-2 text-center sm:text-left", className),
      ...props
    }
  );
}
function DialogFooter({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "dialog-footer",
      className: cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      ),
      ...props
    }
  );
}
function DialogTitle({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    DialogPrimitive.Title,
    {
      "data-slot": "dialog-title",
      className: cn("text-lg leading-none font-semibold", className),
      ...props
    }
  );
}
function DialogDescription({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    DialogPrimitive.Description,
    {
      "data-slot": "dialog-description",
      className: cn("text-muted-foreground text-sm", className),
      ...props
    }
  );
}
const USERS_PREFIX = "/api/v1/users";
function apiIdTypeToFormValue(t) {
  if (t === "national_id") return "national-id";
  if (t === "drivers_license") return "drivers-license";
  if (t === "passport") return "passport";
  return "";
}
function formValueToApiIdType(v) {
  const s = v.trim();
  if (!s) return void 0;
  return s;
}
const STAGE_STYLES = {
  visitor: {
    icon: UserPlus,
    ring: "border-slate-200 bg-white",
    chip: "bg-slate-100 text-slate-700",
    iconWrap: "bg-slate-100 text-slate-500"
  },
  pending: {
    icon: Clock,
    ring: "border-amber-200 bg-amber-50/60",
    chip: "bg-amber-100 text-amber-800",
    iconWrap: "bg-amber-100 text-amber-700"
  },
  rejected: {
    icon: ShieldAlert,
    ring: "border-rose-200 bg-rose-50/60",
    chip: "bg-rose-100 text-rose-800",
    iconWrap: "bg-rose-100 text-rose-700"
  },
  awaiting_payment: {
    icon: CreditCard,
    ring: "border-sky-200 bg-sky-50/60",
    chip: "bg-sky-100 text-sky-800",
    iconWrap: "bg-sky-100 text-sky-700"
  },
  active: {
    icon: BadgeCheck,
    ring: "border-emerald-200 bg-emerald-50/60",
    chip: "bg-emerald-100 text-emerald-800",
    iconWrap: "bg-emerald-100 text-emerald-700"
  },
  ending: {
    icon: CalendarX2,
    ring: "border-amber-200 bg-amber-50/60",
    chip: "bg-amber-100 text-amber-800",
    iconWrap: "bg-amber-100 text-amber-700"
  },
  expired: {
    icon: CalendarX2,
    ring: "border-slate-200 bg-slate-50",
    chip: "bg-slate-200 text-slate-700",
    iconWrap: "bg-slate-200 text-slate-600"
  },
  canceled: {
    icon: CalendarX2,
    ring: "border-slate-200 bg-slate-50",
    chip: "bg-slate-200 text-slate-700",
    iconWrap: "bg-slate-200 text-slate-600"
  }
};
function formatDate$2(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}
function TierBadge({
  membership,
  className = ""
}) {
  const isActive = membership.status === "active";
  return /* @__PURE__ */ jsxs(
    "span",
    {
      className: `inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"} ${className}`,
      children: [
        /* @__PURE__ */ jsx(Sparkles, { className: "h-3.5 w-3.5" }),
        tierLabel(membership.tier),
        !isActive && " · inactive"
      ]
    }
  );
}
function MembershipStatusCard({
  membership,
  stage,
  feedback,
  compact: compact2 = false
}) {
  const copy = STAGE_COPY[stage];
  const style = STAGE_STYLES[stage];
  const Icon = style.icon;
  const detail = (() => {
    switch (stage) {
      case "active":
        return membership.renewalDate ? `${tierLabel(membership.tier)} · renews ${formatDate$2(membership.renewalDate)}${membership.daysRemaining != null ? ` (${membership.daysRemaining} days)` : ""}` : tierLabel(membership.tier);
      case "ending":
        return `${tierLabel(membership.tier)} · access until ${formatDate$2(membership.renewalDate)}`;
      case "awaiting_payment":
        return membership.pendingTier ? `Approved for ${tierLabel(membership.pendingTier)}` : "Approved — choose a tier";
      case "expired":
      case "canceled":
        return `Last tier: ${tierLabel(membership.tier)} · ended ${formatDate$2(membership.renewalDate)}`;
      default:
        return null;
    }
  })();
  const action = (() => {
    switch (stage) {
      case "visitor":
      case "rejected":
        return { to: "/membership/apply", label: "Apply for membership" };
      case "awaiting_payment":
        return { to: "/membership/billing", label: "Activate membership" };
      case "expired":
      case "canceled":
        return { to: "/membership/billing", label: "Renew membership" };
      case "ending":
        return { to: "/membership/billing", label: "Manage membership" };
      case "active":
        return { to: "/member-hub", label: "Open member hub" };
      default:
        return null;
    }
  })();
  return /* @__PURE__ */ jsx("div", { className: `rounded-2xl border ${style.ring} ${compact2 ? "p-4" : "p-5 sm:p-6"}`, children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4 sm:flex-row sm:items-start", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex min-w-0 flex-1 items-start gap-4", children: [
      /* @__PURE__ */ jsx("span", { className: `flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${style.iconWrap}`, children: /* @__PURE__ */ jsx(Icon, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: `rounded-full px-2.5 py-0.5 text-xs font-semibold ${style.chip}`, children: copy.label }),
          detail && /* @__PURE__ */ jsx("span", { className: "text-xs text-slate-500", children: detail })
        ] }),
        /* @__PURE__ */ jsx("p", { className: `mt-2 text-slate-700 ${compact2 ? "text-sm" : ""}`, children: copy.blurb }),
        feedback && stage === "rejected" && /* @__PURE__ */ jsx("blockquote", { className: "mt-3 rounded-lg border-l-2 border-rose-300 bg-white/70 px-3 py-2 text-sm text-slate-600", children: feedback })
      ] })
    ] }),
    action && /* @__PURE__ */ jsx(Link, { to: action.to, className: "shrink-0 max-sm:w-full", children: /* @__PURE__ */ jsx(Button, { className: "h-11 w-full bg-emerald-600 hover:bg-emerald-700 sm:h-9 sm:w-auto", children: action.label }) })
  ] }) });
}
const PIE_COLORS = ["#059669", "#0d9488", "#6366f1", "#d97706", "#64748b"];
function transactionTypeLabel(type) {
  switch (type) {
    case "DEPOSIT":
      return "Deposit";
    case "WITHDRAWAL":
      return "Withdrawal";
    case "INVESTMENT":
      return "Investment";
    case "PAYOUT":
      return "Payout";
    default:
      return type;
  }
}
function formatCategory(slug) {
  return slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}
function UserDashboard() {
  var _a;
  const { user, logout, refreshUser } = useAuth();
  const { membership, stage: membershipStage2, refreshMembership } = useMembership();
  const navigate = useNavigate();
  const location = useLocation();
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawBusy, setWithdrawBusy] = useState(false);
  const [withdrawError, setWithdrawError] = useState("");
  const [depositOpen, setDepositOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositBusy, setDepositBusy] = useState(false);
  const [depositError, setDepositError] = useState("");
  const [depositSuccess, setDepositSuccess] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsProfileLoading, setSettingsProfileLoading] = useState(false);
  const [settingsProfileError, setSettingsProfileError] = useState("");
  const [settingsEmail, setSettingsEmail] = useState("");
  const [formName, setFormName] = useState("");
  const [formCountry, setFormCountry] = useState("");
  const [formDob, setFormDob] = useState("");
  const [formIdType, setFormIdType] = useState("");
  const [formIdNumber, setFormIdNumber] = useState("");
  const [settingsSaveBusy, setSettingsSaveBusy] = useState(false);
  const [settingsSaveMsg, setSettingsSaveMsg] = useState("");
  const [pwCurrent, setPwCurrent] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [pwBusy, setPwBusy] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [investments, setInvestments] = useState([]);
  const [isLoadingInvestments, setIsLoadingInvestments] = useState(true);
  const [investmentsError, setInvestmentsError] = useState("");
  const [walletTransactions, setWalletTransactions] = useState([]);
  const [walletTransactionsError, setWalletTransactionsError] = useState("");
  const [platformProjects, setPlatformProjects] = useState([]);
  const [supportContactEmail, setSupportContactEmail] = useState("support@fibi.com");
  const handleLogout = () => {
    void logout().then(() => navigate("/", { replace: true }));
  };
  useEffect(() => {
    if (location.hash !== "#settings") return;
    setSettingsOpen(true);
    navigate(`${location.pathname}${location.search}`, { replace: true });
  }, [location.hash, location.pathname, location.search, navigate]);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoadingInvestments(true);
      setInvestmentsError("");
      setWalletTransactionsError("");
      const [invResult, txResult] = await Promise.all([
        getJson("/api/v1/investments"),
        getJson("/api/v1/transactions/user")
      ]);
      if (cancelled) return;
      if (!invResult.ok) {
        setInvestmentsError(invResult.error || "Failed to load investments.");
        setInvestments([]);
      } else {
        setInvestments(invResult.data.investments ?? []);
      }
      if (!txResult.ok) {
        setWalletTransactionsError(txResult.error || "Failed to load wallet activity.");
        setWalletTransactions([]);
      } else {
        setWalletTransactions(txResult.data.transactions ?? []);
      }
      setIsLoadingInvestments(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await getJson("/api/v1/settings/public");
      if (cancelled || !res.ok) return;
      if (res.data.supportEmail) {
        setSupportContactEmail(res.data.supportEmail);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await getJson("/api/v1/projects");
      if (cancelled) return;
      if (result.ok) {
        setPlatformProjects((result.data.projects ?? []).map(normalizeApiProject));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  useEffect(() => {
    if (!settingsOpen) return;
    let cancelled = false;
    setSettingsProfileError("");
    setSettingsSaveMsg("");
    setPwError("");
    setPwSuccess("");
    (async () => {
      setSettingsProfileLoading(true);
      const res = await getJson(`${USERS_PREFIX}/profile`);
      if (cancelled) return;
      setSettingsProfileLoading(false);
      if (!res.ok) {
        setSettingsProfileError(res.error || "Could not load profile.");
        setSettingsEmail((user == null ? void 0 : user.email) ?? "");
        setFormName((user == null ? void 0 : user.name) ?? "");
        setFormCountry("");
        setFormDob("");
        setFormIdType("passport");
        setFormIdNumber("");
        return;
      }
      const p = res.data.data;
      setSettingsEmail(p.email);
      setFormName(p.name);
      setFormCountry(p.country ?? "");
      setFormDob(p.dob ? p.dob.slice(0, 10) : "");
      setFormIdType(apiIdTypeToFormValue(p.idType) || "passport");
      setFormIdNumber(p.idNumber ?? "");
    })();
    return () => {
      cancelled = true;
    };
  }, [settingsOpen, user == null ? void 0 : user.email, user == null ? void 0 : user.name]);
  const handleSaveProfile = async () => {
    setSettingsSaveMsg("");
    setSettingsProfileError("");
    setSettingsSaveBusy(true);
    const body = {
      name: formName.trim(),
      country: formCountry.trim() === "" ? null : formCountry.trim(),
      dob: formDob.trim() === "" ? null : formDob,
      idType: formValueToApiIdType(formIdType),
      idNumber: formIdNumber.trim() === "" ? null : formIdNumber.trim()
    };
    const res = await putJson(`${USERS_PREFIX}/profile`, body);
    setSettingsSaveBusy(false);
    if (!res.ok) {
      setSettingsProfileError(res.error);
      return;
    }
    setSettingsSaveMsg("Profile saved.");
    void refreshUser();
  };
  const handleChangePassword = async () => {
    setPwError("");
    setPwSuccess("");
    if (pwNew !== pwConfirm) {
      setPwError("New passwords do not match.");
      return;
    }
    if (pwNew.length < 6) {
      setPwError("New password must be at least 6 characters.");
      return;
    }
    setPwBusy(true);
    const res = await putJson(`${USERS_PREFIX}/change-password`, {
      currentPassword: pwCurrent,
      newPassword: pwNew
    });
    setPwBusy(false);
    if (!res.ok) {
      setPwError(res.error);
      return;
    }
    setPwSuccess(res.data.message || "Password updated.");
    setPwCurrent("");
    setPwNew("");
    setPwConfirm("");
  };
  const userInvestments = useMemo(
    () => investments.map((inv) => {
      var _a2;
      return {
        ...inv,
        currentValueMinor: inv.currentValueMinor ?? inv.amountInvestedMinor,
        totalReturnsMinor: inv.totalReturnsMinor ?? 0,
        projectTitle: ((_a2 = inv.project) == null ? void 0 : _a2.title) ?? "Project"
      };
    }),
    [investments]
  );
  const totals = useMemo(() => {
    const totalInvested2 = userInvestments.reduce((sum, inv) => sum + inv.amountInvestedMinor, 0);
    const totalCurrentValue2 = userInvestments.reduce((sum, inv) => sum + inv.currentValueMinor, 0);
    const totalReturns2 = userInvestments.reduce((sum, inv) => sum + inv.totalReturnsMinor, 0);
    const totalGain2 = totalCurrentValue2 - totalInvested2;
    const totalGainPercentage2 = totalInvested2 > 0 ? (totalGain2 / totalInvested2 * 100).toFixed(2) : "0.00";
    return {
      totalInvested: totalInvested2,
      totalCurrentValue: totalCurrentValue2,
      totalReturns: totalReturns2,
      totalGain: totalGain2,
      totalGainPercentage: totalGainPercentage2
    };
  }, [userInvestments]);
  const { totalInvested, totalCurrentValue, totalReturns, totalGain, totalGainPercentage } = totals;
  const formatCurrency2 = (minorUnits) => new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(minorUnits / 100);
  const portfolioData = useMemo(() => {
    const { totalInvested: inv, totalCurrentValue: cur } = totals;
    if (inv <= 0 && cur <= 0) {
      return [
        { month: "Nov 25", value: 0 },
        { month: "Dec 25", value: 0 },
        { month: "Jan 26", value: 0 },
        { month: "Feb 26", value: 0 }
      ];
    }
    const t1 = Math.round(inv * 0.25);
    const t2 = Math.round(inv * 0.55);
    const t3 = Math.round((inv + cur) / 2);
    return [
      { month: "Nov 25", value: 0 },
      { month: "Dec 25", value: Math.min(t1, cur) },
      { month: "Jan 26", value: Math.min(t2, cur) },
      { month: "Feb 26", value: Math.min(Math.max(t3, t2), cur) },
      { month: "Mar 26", value: cur }
    ];
  }, [totals]);
  const allocationData = useMemo(() => {
    const byCat = {};
    userInvestments.forEach((inv) => {
      var _a2;
      const key = ((_a2 = inv.project) == null ? void 0 : _a2.category) ?? "other";
      byCat[key] = (byCat[key] ?? 0) + inv.amountInvestedMinor;
    });
    return Object.entries(byCat).map(([name, value]) => ({
      name: formatCategory(name),
      value
    }));
  }, [userInvestments]);
  const investedIds = useMemo(
    () => new Set(userInvestments.map((i) => i.projectId)),
    [userInvestments]
  );
  const suggestedProjects = useMemo(() => {
    const open = platformProjects.filter((p) => p.status === "open");
    const notInvested = open.filter((p) => !investedIds.has(p.id));
    if (notInvested.length > 0) return notInvested.slice(0, 3);
    if (open.length > 0) return open.slice(0, 3);
    return platformProjects.slice(0, 3);
  }, [investedIds, platformProjects]);
  const upcomingPayouts = useMemo(
    () => [
      {
        id: "1",
        project: "Capsule Houses Eco-Lodge",
        date: /* @__PURE__ */ new Date("2026-04-01"),
        amount: 125
      },
      {
        id: "2",
        project: "Solar Roofs Initiative",
        date: /* @__PURE__ */ new Date("2026-04-15"),
        amount: 98
      },
      {
        id: "3",
        project: "Capsule Houses Eco-Lodge",
        date: /* @__PURE__ */ new Date("2026-05-01"),
        amount: 125
      }
    ],
    []
  );
  const hasInvestments = userInvestments.length > 0;
  const hasWalletActivity = walletTransactions.length > 0;
  const reloadWalletTransactions = async () => {
    const txResult = await getJson("/api/v1/transactions/user");
    if (txResult.ok) {
      setWalletTransactions(txResult.data.transactions ?? []);
      setWalletTransactionsError("");
    }
  };
  const statCards = [
    {
      title: "Total invested",
      value: formatCurrency2(totalInvested),
      hint: hasInvestments ? `Across ${userInvestments.length} project${userInvestments.length === 1 ? "" : "s"}` : "Start by browsing open projects",
      icon: DollarSign,
      accent: "text-emerald-600",
      iconBg: "bg-emerald-50"
    },
    {
      title: "Current value",
      value: formatCurrency2(totalCurrentValue),
      hint: `${totalGain >= 0 ? "+" : ""}${totalGainPercentage}% vs. invested`,
      icon: TrendingUp,
      accent: "text-teal-600",
      iconBg: "bg-teal-50",
      hintClass: totalGain >= 0 ? "text-emerald-600 font-medium" : "text-red-600 font-medium"
    },
    {
      title: "Total returns",
      value: formatCurrency2(totalReturns),
      hint: "Paid & accrued to date",
      icon: Sparkles,
      accent: "text-emerald-600",
      iconBg: "bg-emerald-50",
      valueClass: "text-emerald-600"
    },
    {
      title: "Active projects",
      value: String(userInvestments.length),
      hint: `${userInvestments.filter((inv) => inv.status === "active").length} generating returns`,
      icon: Briefcase,
      accent: "text-slate-700",
      iconBg: "bg-slate-100"
    }
  ];
  const supportFooter = /* @__PURE__ */ jsxs("p", { className: "text-center text-xs text-slate-400 mt-10 max-w-2xl mx-auto px-4", children: [
    "Need help?",
    " ",
    /* @__PURE__ */ jsx("a", { href: `mailto:${supportContactEmail}`, className: "text-emerald-600 hover:underline", children: supportContactEmail })
  ] });
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/40 pt-16", children: [
    /* @__PURE__ */ jsx(
      Dialog,
      {
        open: withdrawOpen,
        onOpenChange: (open) => {
          setWithdrawOpen(open);
          if (!open) {
            setWithdrawAmount("");
            setWithdrawError("");
            setWithdrawBusy(false);
          }
        },
        children: /* @__PURE__ */ jsxs(DialogContent, { className: "sm:max-w-md rounded-2xl", children: [
          /* @__PURE__ */ jsxs(DialogHeader, { children: [
            /* @__PURE__ */ jsx(DialogTitle, { children: "Withdraw funds" }),
            /* @__PURE__ */ jsx(DialogDescription, { children: "Record a withdrawal request amount. This updates your activity log; bank or mobile payouts are processed separately by the platform." })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-3 py-2", children: [
            withdrawError && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2", children: withdrawError }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "withdraw-amt", children: "Amount (USD)" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "withdraw-amt",
                  type: "number",
                  min: 0,
                  step: "0.01",
                  placeholder: "0",
                  value: withdrawAmount,
                  onChange: (e) => setWithdrawAmount(e.target.value),
                  className: "rounded-xl border-slate-200"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs(DialogFooter, { className: "gap-2 sm:gap-0", children: [
            /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setWithdrawOpen(false), disabled: withdrawBusy, children: "Cancel" }),
            /* @__PURE__ */ jsx(
              Button,
              {
                className: "bg-emerald-600 hover:bg-emerald-700",
                disabled: withdrawBusy,
                onClick: async () => {
                  setWithdrawError("");
                  const n = Number(withdrawAmount);
                  if (!Number.isFinite(n) || n <= 0) {
                    setWithdrawError("Enter a valid positive amount.");
                    return;
                  }
                  setWithdrawBusy(true);
                  const res = await postJson("/api/v1/transactions", {
                    // The user types major units; the API takes minor units.
                    amountMinor: Math.round(n * 100),
                    type: "WITHDRAWAL"
                  });
                  setWithdrawBusy(false);
                  if (!res.ok) {
                    setWithdrawError(res.error);
                    return;
                  }
                  setWithdrawOpen(false);
                  setWithdrawAmount("");
                  void reloadWalletTransactions();
                },
                children: withdrawBusy ? "Submitting…" : "Submit withdrawal"
              }
            )
          ] })
        ] })
      }
    ),
    /* @__PURE__ */ jsx(
      Dialog,
      {
        open: depositOpen,
        onOpenChange: (open) => {
          setDepositOpen(open);
          if (!open) {
            setDepositAmount("");
            setDepositError("");
            setDepositSuccess("");
            setDepositBusy(false);
          }
        },
        children: /* @__PURE__ */ jsxs(DialogContent, { className: "sm:max-w-md rounded-2xl", children: [
          /* @__PURE__ */ jsxs(DialogHeader, { children: [
            /* @__PURE__ */ jsx(DialogTitle, { children: "Add funds" }),
            /* @__PURE__ */ jsx(DialogDescription, { children: "Record a deposit to your FIBI wallet. This appears in your activity and the admin transaction list." })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-3 py-2", children: [
            depositError && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2", children: depositError }),
            depositSuccess && /* @__PURE__ */ jsx("p", { className: "text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2", children: depositSuccess }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "deposit-amt", children: "Amount (USD)" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "deposit-amt",
                  type: "number",
                  min: 0,
                  step: "0.01",
                  placeholder: "0",
                  value: depositAmount,
                  onChange: (e) => setDepositAmount(e.target.value),
                  className: "rounded-xl border-slate-200"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs(DialogFooter, { className: "gap-2 sm:gap-0", children: [
            /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setDepositOpen(false), disabled: depositBusy, children: "Cancel" }),
            /* @__PURE__ */ jsx(
              Button,
              {
                className: "bg-emerald-600 hover:bg-emerald-700",
                disabled: depositBusy,
                onClick: async () => {
                  setDepositError("");
                  setDepositSuccess("");
                  const n = Number(depositAmount);
                  if (!Number.isFinite(n) || n <= 0) {
                    setDepositError("Enter a valid positive amount.");
                    return;
                  }
                  setDepositBusy(true);
                  const res = await postJson("/api/v1/transactions", {
                    // The user types major units; the API takes minor units.
                    amountMinor: Math.round(n * 100),
                    type: "DEPOSIT"
                  });
                  setDepositBusy(false);
                  if (!res.ok) {
                    setDepositError(res.error);
                    return;
                  }
                  setDepositSuccess("Deposit recorded.");
                  setDepositAmount("");
                  void reloadWalletTransactions();
                },
                children: depositBusy ? "Submitting…" : "Add funds"
              }
            )
          ] })
        ] })
      }
    ),
    /* @__PURE__ */ jsx(
      Dialog,
      {
        open: settingsOpen,
        onOpenChange: (open) => {
          setSettingsOpen(open);
          if (!open) {
            setSettingsSaveMsg("");
            setSettingsProfileError("");
            setPwError("");
            setPwSuccess("");
            setPwCurrent("");
            setPwNew("");
            setPwConfirm("");
          }
        },
        children: /* @__PURE__ */ jsxs(DialogContent, { className: "sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl", children: [
          /* @__PURE__ */ jsxs(DialogHeader, { children: [
            /* @__PURE__ */ jsx(DialogTitle, { children: "Account settings" }),
            /* @__PURE__ */ jsx(DialogDescription, { children: "Update your profile and password. Your email is tied to your login and cannot be changed here." })
          ] }),
          settingsProfileLoading ? /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500 py-6", children: "Loading profile…" }) : /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            settingsProfileError && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2", children: settingsProfileError }),
            settingsSaveMsg && /* @__PURE__ */ jsx("p", { className: "text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2", children: settingsSaveMsg }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "set-name", children: "Full name" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "set-name",
                  value: formName,
                  onChange: (e) => setFormName(e.target.value),
                  className: "rounded-xl border-slate-200"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "set-email", children: "Email" }),
              /* @__PURE__ */ jsx(Input, { id: "set-email", value: settingsEmail, disabled: true, className: "rounded-xl border-slate-200 bg-slate-50" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "set-country", children: "Country" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "set-country",
                  value: formCountry,
                  onChange: (e) => setFormCountry(e.target.value),
                  className: "rounded-xl border-slate-200"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "set-dob", children: "Date of birth" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "set-dob",
                  type: "date",
                  value: formDob,
                  onChange: (e) => setFormDob(e.target.value),
                  className: "rounded-xl border-slate-200"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "set-id-type", children: "ID type" }),
              /* @__PURE__ */ jsxs(
                "select",
                {
                  id: "set-id-type",
                  value: formIdType,
                  onChange: (e) => setFormIdType(e.target.value),
                  className: "flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30",
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "passport", children: "Passport" }),
                    /* @__PURE__ */ jsx("option", { value: "national-id", children: "National ID" }),
                    /* @__PURE__ */ jsx("option", { value: "drivers-license", children: "Driver's license" })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "set-id-num", children: "ID number" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "set-id-num",
                  value: formIdNumber,
                  onChange: (e) => setFormIdNumber(e.target.value),
                  className: "rounded-xl border-slate-200"
                }
              )
            ] }),
            /* @__PURE__ */ jsx(
              Button,
              {
                type: "button",
                className: "w-full bg-emerald-600 hover:bg-emerald-700",
                disabled: settingsSaveBusy || !formName.trim(),
                onClick: () => void handleSaveProfile(),
                children: settingsSaveBusy ? "Saving…" : "Save profile"
              }
            ),
            /* @__PURE__ */ jsx(Separator, { className: "my-2" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-slate-800", children: "Change password" }),
            pwError && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2", children: pwError }),
            pwSuccess && /* @__PURE__ */ jsx("p", { className: "text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2", children: pwSuccess }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "pw-current", children: "Current password" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "pw-current",
                  type: "password",
                  autoComplete: "current-password",
                  value: pwCurrent,
                  onChange: (e) => setPwCurrent(e.target.value),
                  className: "rounded-xl border-slate-200"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "pw-new", children: "New password" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "pw-new",
                  type: "password",
                  autoComplete: "new-password",
                  value: pwNew,
                  onChange: (e) => setPwNew(e.target.value),
                  className: "rounded-xl border-slate-200"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "pw-confirm", children: "Confirm new password" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "pw-confirm",
                  type: "password",
                  autoComplete: "new-password",
                  value: pwConfirm,
                  onChange: (e) => setPwConfirm(e.target.value),
                  className: "rounded-xl border-slate-200"
                }
              )
            ] }),
            /* @__PURE__ */ jsx(
              Button,
              {
                type: "button",
                variant: "outline",
                className: "w-full border-emerald-200 text-emerald-800 hover:bg-emerald-50",
                disabled: pwBusy,
                onClick: () => void handleChangePassword(),
                children: pwBusy ? "Updating…" : "Update password"
              }
            )
          ] }),
          /* @__PURE__ */ jsx(DialogFooter, { children: /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setSettingsOpen(false), children: "Close" }) })
        ] })
      }
    ),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("div", { className: "relative overflow-hidden border-b border-emerald-100/60 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\\'60\\' height=\\'60\\' viewBox=\\'0 0 60 60\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'none\\' fill-rule=\\'evenodd\\'%3E%3Cg fill=\\'%23ffffff\\' fill-opacity=\\'0.06\\'%3E%3Cpath d=\\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-80" }),
        /* @__PURE__ */ jsxs("div", { className: "relative max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12", children: [
          /* @__PURE__ */ jsx("p", { className: "text-emerald-100 text-sm font-medium uppercase tracking-wider mb-1", children: "Investor portfolio" }),
          /* @__PURE__ */ jsxs("h1", { className: "text-3xl sm:text-4xl font-bold tracking-tight", children: [
            "Welcome back, ",
            ((_a = user == null ? void 0 : user.name) == null ? void 0 : _a.split(" ")[0]) ?? "Investor"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 text-emerald-100/95 max-w-xl text-sm sm:text-base", children: "Track performance, allocation, payouts, and every project you support—on any device." }),
          (hasInvestments || hasWalletActivity) && /* @__PURE__ */ jsxs("div", { className: "mt-6 flex flex-wrap gap-3", children: [
            hasInvestments && /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm backdrop-blur-sm", children: [
                /* @__PURE__ */ jsx(Wallet, { className: "h-4 w-4 shrink-0" }),
                /* @__PURE__ */ jsxs("span", { children: [
                  "Net gain ",
                  formatCurrency2(totalGain)
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm backdrop-blur-sm", children: [
                /* @__PURE__ */ jsx(Calendar, { className: "h-4 w-4 shrink-0" }),
                /* @__PURE__ */ jsx("span", { children: "Next payout soon" })
              ] })
            ] }),
            !hasInvestments && hasWalletActivity && /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm backdrop-blur-sm", children: [
              /* @__PURE__ */ jsx(Wallet, { className: "h-4 w-4 shrink-0" }),
              /* @__PURE__ */ jsx("span", { children: "Wallet activity on file" })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 pb-16", children: isLoadingInvestments ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg rounded-2xl ring-1 ring-slate-100 max-w-lg mx-auto text-center p-10 sm:p-12", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-slate-900", children: "Loading investments..." }),
          /* @__PURE__ */ jsx("p", { className: "text-slate-600 mt-2 text-sm leading-relaxed", children: "Fetching your live portfolio from the backend." })
        ] }),
        supportFooter
      ] }) : investmentsError ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg rounded-2xl ring-1 ring-slate-100 max-w-lg mx-auto text-center p-10 sm:p-12", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-slate-900", children: "Unable to load investments" }),
          /* @__PURE__ */ jsx("p", { className: "text-red-600 mt-2 text-sm leading-relaxed", children: investmentsError }),
          /* @__PURE__ */ jsx(
            Button,
            {
              className: "mt-8 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700",
              onClick: () => window.location.reload(),
              children: "Retry"
            }
          )
        ] }),
        supportFooter
      ] }) : !hasInvestments && !hasWalletActivity ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg rounded-2xl ring-1 ring-slate-100 max-w-lg mx-auto text-center p-10 sm:p-12", children: [
          /* @__PURE__ */ jsx("div", { className: "mx-auto w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mb-6", children: /* @__PURE__ */ jsx(Briefcase, { className: "h-7 w-7 text-emerald-700" }) }),
          /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-slate-900", children: "No investments yet" }),
          /* @__PURE__ */ jsx("p", { className: "text-slate-600 mt-2 text-sm leading-relaxed", children: "Explore vetted land and sustainability projects. When you invest, your portfolio, charts, and payouts will appear here." }),
          /* @__PURE__ */ jsxs("div", { className: "mt-8 flex flex-col sm:flex-row gap-3 justify-center", children: [
            /* @__PURE__ */ jsx(
              Button,
              {
                type: "button",
                variant: "outline",
                className: "h-11 rounded-xl border-slate-200",
                onClick: () => setDepositOpen(true),
                children: "Add funds"
              }
            ),
            /* @__PURE__ */ jsx(Button, { className: "h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700", asChild: true, children: /* @__PURE__ */ jsx(Link, { to: "/projects", children: "Browse open projects" }) })
          ] })
        ] }),
        supportFooter
      ] }) : !hasInvestments && hasWalletActivity ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto space-y-6", children: [
          walletTransactionsError && /* @__PURE__ */ jsx("p", { className: "text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3", children: walletTransactionsError }),
          /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg rounded-2xl ring-1 ring-slate-100 overflow-hidden", children: [
            /* @__PURE__ */ jsxs(CardHeader, { className: "border-b border-slate-100 bg-slate-50/50", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx(Wallet, { className: "h-5 w-5 text-emerald-600" }),
                /* @__PURE__ */ jsx(CardTitle, { className: "text-lg font-semibold text-slate-900", children: "Wallet activity" })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500 font-normal", children: "Deposits, withdrawals, and project investments" })
            ] }),
            /* @__PURE__ */ jsx(CardContent, { className: "p-4 sm:p-6 space-y-3", children: walletTransactions.map((tx) => /* @__PURE__ */ jsxs(
              "div",
              {
                className: "flex flex-wrap items-baseline justify-between gap-2 rounded-xl border border-slate-100 bg-white px-3 py-3 text-sm",
                children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("p", { className: "font-medium text-slate-900", children: transactionTypeLabel(tx.type) }),
                    /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500 mt-0.5", children: new Date(tx.createdAt).toLocaleString() })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
                    /* @__PURE__ */ jsxs(
                      "p",
                      {
                        className: `font-semibold tabular-nums ${tx.type === "WITHDRAWAL" || tx.type === "INVESTMENT" ? "text-red-600" : "text-emerald-700"}`,
                        children: [
                          tx.type === "WITHDRAWAL" || tx.type === "INVESTMENT" ? "−" : "+",
                          formatCurrency2(tx.amountMinor)
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "mt-1 capitalize text-xs", children: tx.status })
                  ] })
                ]
              },
              tx.id
            )) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-3", children: [
            /* @__PURE__ */ jsx(
              Button,
              {
                type: "button",
                className: "h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700",
                onClick: () => setDepositOpen(true),
                children: "Add funds"
              }
            ),
            /* @__PURE__ */ jsx(
              Button,
              {
                type: "button",
                variant: "outline",
                className: "h-11 rounded-xl border-slate-200",
                onClick: () => setWithdrawOpen(true),
                children: "Withdraw funds"
              }
            ),
            /* @__PURE__ */ jsx(Button, { type: "button", variant: "outline", className: "h-11 rounded-xl border-slate-200", asChild: true, children: /* @__PURE__ */ jsx(Link, { to: "/projects", children: "Browse projects" }) })
          ] })
        ] }),
        supportFooter
      ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("div", { className: "fx-stagger grid sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 mb-8 sm:mb-10", children: statCards.map((card) => /* @__PURE__ */ jsxs(
          Card,
          {
            className: "fx-lift border-0 shadow-md shadow-slate-200/60 rounded-2xl bg-white overflow-hidden ring-1 ring-slate-100/80 hover:ring-emerald-200/60 transition-all duration-200",
            children: [
              /* @__PURE__ */ jsxs(CardHeader, { className: "flex flex-row items-start justify-between space-y-0 pb-2 pt-5 px-5", children: [
                /* @__PURE__ */ jsx(CardTitle, { className: "text-xs font-semibold uppercase tracking-wide text-slate-500", children: card.title }),
                /* @__PURE__ */ jsx("div", { className: `rounded-xl p-2.5 ${card.iconBg}`, children: /* @__PURE__ */ jsx(card.icon, { className: `h-4 w-4 ${card.accent}` }) })
              ] }),
              /* @__PURE__ */ jsxs(CardContent, { className: "px-5 pb-5", children: [
                /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: `text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 ${"valueClass" in card ? card.valueClass : ""}`,
                    children: card.value
                  }
                ),
                /* @__PURE__ */ jsxs(
                  "p",
                  {
                    className: `text-xs mt-2 flex items-center gap-1 ${"hintClass" in card && card.hintClass ? card.hintClass : "text-slate-500"}`,
                    children: [
                      card.title === "Current value" && (totalGain >= 0 ? /* @__PURE__ */ jsx(ArrowUpRight, { className: "h-3.5 w-3.5 shrink-0" }) : /* @__PURE__ */ jsx(TrendingDown, { className: "h-3.5 w-3.5 shrink-0" })),
                      card.hint
                    ]
                  }
                )
              ] })
            ]
          },
          card.title
        )) }),
        /* @__PURE__ */ jsxs("div", { className: "grid lg:grid-cols-3 gap-6 lg:gap-8", children: [
          /* @__PURE__ */ jsxs("div", { className: "lg:col-span-2 space-y-6", children: [
            /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg shadow-slate-200/50 rounded-2xl ring-1 ring-slate-100 overflow-hidden", children: [
              /* @__PURE__ */ jsxs(CardHeader, { className: "border-b border-slate-100 bg-slate-50/50 pb-4", children: [
                /* @__PURE__ */ jsx(CardTitle, { className: "text-lg font-semibold text-slate-900", children: "Portfolio growth" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500 font-normal", children: "Estimated portfolio value over time" })
              ] }),
              /* @__PURE__ */ jsx(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsx("div", { className: "h-[280px] sm:h-[300px] w-full min-h-[240px]", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(
                AreaChart,
                {
                  data: portfolioData,
                  margin: { top: 8, right: 8, left: 0, bottom: 0 },
                  children: [
                    /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", { id: "investorArea", x1: "0", y1: "0", x2: "0", y2: "1", children: [
                      /* @__PURE__ */ jsx("stop", { offset: "5%", stopColor: "#059669", stopOpacity: 0.25 }),
                      /* @__PURE__ */ jsx("stop", { offset: "95%", stopColor: "#059669", stopOpacity: 0 })
                    ] }) }),
                    /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#e2e8f0", vertical: false }),
                    /* @__PURE__ */ jsx(
                      XAxis,
                      {
                        dataKey: "month",
                        stroke: "#64748b",
                        tick: { fontSize: 12 },
                        axisLine: false,
                        tickLine: false
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      YAxis,
                      {
                        stroke: "#64748b",
                        tick: { fontSize: 12 },
                        axisLine: false,
                        tickLine: false,
                        tickFormatter: (value) => `$${value}`
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      Tooltip,
                      {
                        formatter: (value) => [formatCurrency2(value), "Value"],
                        contentStyle: {
                          backgroundColor: "white",
                          border: "1px solid #e2e8f0",
                          borderRadius: "12px",
                          boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.08)"
                        }
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      Area,
                      {
                        type: "monotone",
                        dataKey: "value",
                        stroke: "#059669",
                        strokeWidth: 2,
                        fillOpacity: 1,
                        fill: "url(#investorArea)"
                      }
                    )
                  ]
                }
              ) }) }) })
            ] }),
            allocationData.length > 0 && /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg shadow-slate-200/50 rounded-2xl ring-1 ring-slate-100 overflow-hidden", children: [
              /* @__PURE__ */ jsx(CardHeader, { className: "border-b border-slate-100 bg-slate-50/50 pb-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx(PieChart, { className: "h-5 w-5 text-emerald-600" }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx(CardTitle, { className: "text-lg font-semibold text-slate-900", children: "Allocation by category" }),
                  /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500 font-normal", children: "How your capital is split across themes" })
                ] })
              ] }) }),
              /* @__PURE__ */ jsx(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row items-center gap-8", children: [
                /* @__PURE__ */ jsx("div", { className: "h-[220px] w-full sm:w-[240px] shrink-0", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(PieChart$1, { children: [
                  /* @__PURE__ */ jsx(
                    Pie,
                    {
                      data: allocationData,
                      dataKey: "value",
                      nameKey: "name",
                      cx: "50%",
                      cy: "50%",
                      innerRadius: 52,
                      outerRadius: 88,
                      paddingAngle: 2,
                      children: allocationData.map((_, i) => /* @__PURE__ */ jsx(
                        Cell,
                        {
                          fill: PIE_COLORS[i % PIE_COLORS.length],
                          stroke: "white",
                          strokeWidth: 2
                        },
                        i
                      ))
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    Tooltip,
                    {
                      formatter: (v) => formatCurrency2(v),
                      contentStyle: { borderRadius: 12 }
                    }
                  )
                ] }) }) }),
                /* @__PURE__ */ jsx("ul", { className: "flex-1 w-full space-y-3", children: allocationData.map((row, i) => /* @__PURE__ */ jsxs(
                  "li",
                  {
                    className: "flex items-center justify-between gap-3 text-sm",
                    children: [
                      /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2 min-w-0", children: [
                        /* @__PURE__ */ jsx(
                          "span",
                          {
                            className: "h-2.5 w-2.5 rounded-full shrink-0",
                            style: {
                              backgroundColor: PIE_COLORS[i % PIE_COLORS.length]
                            }
                          }
                        ),
                        /* @__PURE__ */ jsx("span", { className: "text-slate-700 truncate", children: row.name })
                      ] }),
                      /* @__PURE__ */ jsx("span", { className: "font-semibold text-slate-900 tabular-nums shrink-0", children: formatCurrency2(row.value) })
                    ]
                  },
                  row.name
                )) })
              ] }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
            /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-md shadow-slate-200/50 rounded-2xl ring-1 ring-slate-100 overflow-hidden", children: [
              /* @__PURE__ */ jsxs(CardHeader, { className: "border-b border-slate-100 bg-white pb-3", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx(Calendar, { className: "h-5 w-5 text-emerald-600" }),
                  /* @__PURE__ */ jsx(CardTitle, { className: "text-lg font-semibold", children: "Upcoming payouts" })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500 font-normal", children: "Scheduled distributions" })
              ] }),
              /* @__PURE__ */ jsx(CardContent, { className: "pt-4 space-y-4", children: upcomingPayouts.map((p) => /* @__PURE__ */ jsxs(
                "div",
                {
                  className: "rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-3",
                  children: [
                    /* @__PURE__ */ jsx("p", { className: "text-xs font-medium text-emerald-700 uppercase tracking-wide", children: p.date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    }) }),
                    /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-slate-900 mt-1 line-clamp-2", children: p.project }),
                    /* @__PURE__ */ jsx("p", { className: "text-sm text-emerald-600 font-medium mt-1", children: formatCurrency2(p.amount) })
                  ]
                },
                p.id
              )) })
            ] }),
            /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-md shadow-slate-200/50 rounded-2xl ring-1 ring-slate-100 overflow-hidden", children: [
              /* @__PURE__ */ jsxs(CardHeader, { className: "border-b border-slate-100 bg-white pb-3", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx(Wallet, { className: "h-5 w-5 text-emerald-600" }),
                  /* @__PURE__ */ jsx(CardTitle, { className: "text-lg font-semibold", children: "Wallet activity" })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500 font-normal", children: "Recent movements" })
              ] }),
              /* @__PURE__ */ jsxs(CardContent, { className: "pt-4 space-y-3", children: [
                walletTransactionsError && /* @__PURE__ */ jsx("p", { className: "text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-2 py-2", children: walletTransactionsError }),
                walletTransactions.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500", children: "No transactions yet." }) : walletTransactions.slice(0, 8).map((tx) => {
                  const out = tx.type === "WITHDRAWAL" || tx.type === "INVESTMENT";
                  return /* @__PURE__ */ jsxs(
                    "div",
                    {
                      className: "rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2.5 text-sm",
                      children: [
                        /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-2", children: [
                          /* @__PURE__ */ jsx("span", { className: "font-medium text-slate-800", children: transactionTypeLabel(tx.type) }),
                          /* @__PURE__ */ jsxs(
                            "span",
                            {
                              className: `font-semibold tabular-nums shrink-0 ${out ? "text-red-600" : "text-emerald-700"}`,
                              children: [
                                out ? "−" : "+",
                                formatCurrency2(tx.amountMinor)
                              ]
                            }
                          )
                        ] }),
                        /* @__PURE__ */ jsxs("p", { className: "text-xs text-slate-500 mt-1", children: [
                          new Date(tx.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                          }),
                          " ",
                          "·",
                          " ",
                          /* @__PURE__ */ jsx("span", { className: "capitalize", children: tx.status })
                        ] })
                      ]
                    },
                    tx.id
                  );
                })
              ] })
            ] }),
            /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-md shadow-slate-200/50 rounded-2xl ring-1 ring-slate-100", children: [
              /* @__PURE__ */ jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsx(CardTitle, { className: "text-lg font-semibold", children: "Quick actions" }) }),
              /* @__PURE__ */ jsxs(CardContent, { className: "space-y-3", children: [
                /* @__PURE__ */ jsx(Link, { to: "/projects", className: "block", children: /* @__PURE__ */ jsx(Button, { className: "w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm", children: "Browse projects" }) }),
                /* @__PURE__ */ jsx(
                  Button,
                  {
                    type: "button",
                    variant: "outline",
                    className: "w-full h-11 rounded-xl border-slate-200",
                    onClick: () => setDepositOpen(true),
                    children: "Add funds"
                  }
                ),
                /* @__PURE__ */ jsx(
                  Button,
                  {
                    type: "button",
                    variant: "outline",
                    className: "w-full h-11 rounded-xl border-slate-200",
                    onClick: () => setWithdrawOpen(true),
                    children: "Withdraw funds"
                  }
                ),
                /* @__PURE__ */ jsx(
                  Button,
                  {
                    type: "button",
                    variant: "outline",
                    className: "w-full h-11 rounded-xl border-slate-200",
                    onClick: () => setSettingsOpen(true),
                    children: "Account settings"
                  }
                ),
                /* @__PURE__ */ jsx(Separator, { className: "my-1" }),
                /* @__PURE__ */ jsxs(
                  Button,
                  {
                    type: "button",
                    variant: "ghost",
                    className: "w-full h-11 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50",
                    onClick: handleLogout,
                    children: [
                      /* @__PURE__ */ jsx(LogOut, { className: "h-4 w-4 mr-2" }),
                      "Log out"
                    ]
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-md shadow-slate-200/50 rounded-2xl ring-1 ring-slate-100", children: [
              /* @__PURE__ */ jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsx(CardTitle, { className: "text-lg font-semibold", children: "Membership" }) }),
              /* @__PURE__ */ jsxs(CardContent, { className: "space-y-3", children: [
                /* @__PURE__ */ jsx(MembershipStatusCard, { membership, stage: membershipStage2, compact: true }),
                /* @__PURE__ */ jsxs("p", { className: "text-xs text-slate-500", children: [
                  "Tier: ",
                  /* @__PURE__ */ jsx("span", { className: "font-medium", children: tierLabel(membership.tier) }),
                  membership.renewalDate && membership.status === "active" && /* @__PURE__ */ jsxs(Fragment, { children: [
                    " · renews ",
                    new Date(membership.renewalDate).toLocaleDateString()
                  ] })
                ] }),
                /* @__PURE__ */ jsx(Button, { type: "button", variant: "outline", className: "w-full h-10 rounded-xl", asChild: true, children: /* @__PURE__ */ jsx(Link, { to: "/membership/billing", children: "Membership & billing" }) }),
                /* @__PURE__ */ jsx(
                  Button,
                  {
                    type: "button",
                    variant: "outline",
                    className: "w-full h-10 rounded-xl",
                    onClick: () => void refreshMembership(),
                    children: "Refresh status"
                  }
                )
              ] })
            ] })
          ] })
        ] }),
        suggestedProjects.length > 0 && /* @__PURE__ */ jsxs("section", { className: "mt-10", "aria-labelledby": "discover-heading", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-end justify-between gap-4 mb-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(
                "h2",
                {
                  id: "discover-heading",
                  className: "text-lg font-semibold text-slate-900 tracking-tight",
                  children: "Discover more projects"
                }
              ),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500 mt-0.5", children: suggestedProjects.some((p) => !investedIds.has(p.id)) ? "Diversify with open opportunities on FIBI" : "Featured projects on the platform" })
            ] }),
            /* @__PURE__ */ jsxs(
              Link,
              {
                to: "/projects",
                className: "text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5 shrink-0",
                children: [
                  "View all",
                  /* @__PURE__ */ jsx(ChevronRight, { className: "h-4 w-4" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsx("div", { className: "grid sm:grid-cols-2 lg:grid-cols-3 gap-4", children: suggestedProjects.map((p) => {
            const pct = Math.min(
              100,
              Math.round(p.currentFundingMinor / p.totalFundingMinor * 100)
            );
            return /* @__PURE__ */ jsxs(
              Card,
              {
                className: "border-0 shadow-md rounded-2xl ring-1 ring-slate-100 overflow-hidden group hover:ring-emerald-200/70 transition-all",
                children: [
                  /* @__PURE__ */ jsxs("div", { className: "aspect-[16/10] bg-slate-100 overflow-hidden relative", children: [
                    /* @__PURE__ */ jsx(
                      "img",
                      {
                        src: resolveMediaUrl(p.imageUrl),
                        alt: "",
                        className: "w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                      }
                    ),
                    /* @__PURE__ */ jsx(Badge, { className: "absolute top-3 left-3 bg-white/95 text-slate-800 hover:bg-white shadow-sm capitalize", children: formatCategory(p.category) })
                  ] }),
                  /* @__PURE__ */ jsxs(CardContent, { className: "p-4", children: [
                    /* @__PURE__ */ jsx("h3", { className: "font-semibold text-slate-900 line-clamp-2 leading-snug", children: p.title }),
                    /* @__PURE__ */ jsxs("p", { className: "flex items-center gap-1 text-xs text-slate-500 mt-2", children: [
                      /* @__PURE__ */ jsx(MapPin, { className: "h-3.5 w-3.5 shrink-0" }),
                      p.location
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "mt-3 space-y-1.5", children: [
                      /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs text-slate-600", children: [
                        /* @__PURE__ */ jsx("span", { children: "Funding" }),
                        /* @__PURE__ */ jsxs("span", { className: "font-medium text-slate-900", children: [
                          pct,
                          "%"
                        ] })
                      ] }),
                      /* @__PURE__ */ jsx(Progress, { value: pct, className: "h-2 bg-slate-100 [&>[data-slot=progress-indicator]]:bg-emerald-600" })
                    ] }),
                    /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", className: "w-full mt-4 rounded-xl", asChild: true, children: /* @__PURE__ */ jsx(Link, { to: `/projects/${p.id}`, children: "View details" }) })
                  ] })
                ]
              },
              p.id
            );
          }) })
        ] }),
        /* @__PURE__ */ jsx("section", { className: "mt-10", "aria-labelledby": "investments-heading", children: /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg shadow-slate-200/50 rounded-2xl ring-1 ring-slate-100 overflow-hidden", children: [
          /* @__PURE__ */ jsxs(CardHeader, { className: "border-b border-slate-100 bg-slate-50/50", children: [
            /* @__PURE__ */ jsx("h2", { id: "investments-heading", className: "text-lg font-semibold text-slate-900", children: "Your investments" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500 font-normal", children: "Live positions and project funding progress" })
          ] }),
          /* @__PURE__ */ jsxs(CardContent, { className: "p-4 sm:p-6", children: [
            /* @__PURE__ */ jsx("div", { className: "space-y-5", children: userInvestments.map((investment) => {
              const project = investment.project;
              const gain = investment.currentValueMinor - investment.amountInvestedMinor;
              const gainPercentage = investment.amountInvestedMinor > 0 ? (gain / investment.amountInvestedMinor * 100).toFixed(2) : "0";
              const fundPct = project ? Math.min(
                100,
                Math.round(project.currentFundingMinor / project.totalFundingMinor * 100)
              ) : 0;
              return /* @__PURE__ */ jsx(
                "article",
                {
                  className: "rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm hover:shadow-md hover:border-emerald-100/80 transition-all duration-200",
                  children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row", children: [
                    project && /* @__PURE__ */ jsx("div", { className: "sm:w-44 md:w-52 shrink-0 aspect-[4/3] sm:aspect-auto sm:min-h-[200px] bg-slate-100", children: /* @__PURE__ */ jsx(
                      "img",
                      {
                        src: resolveMediaUrl(project.imageUrl),
                        alt: "",
                        className: "w-full h-full object-cover"
                      }
                    ) }),
                    /* @__PURE__ */ jsx("div", { className: "flex-1 p-4 sm:p-5 min-w-0", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4", children: [
                      /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2 sm:gap-3 mb-2", children: [
                          /* @__PURE__ */ jsx("h3", { className: "text-base sm:text-lg font-semibold text-slate-900", children: investment.projectTitle }),
                          /* @__PURE__ */ jsx(
                            Badge,
                            {
                              className: investment.status === "active" ? "bg-emerald-500 hover:bg-emerald-600" : investment.status === "pending" ? "bg-amber-500 hover:bg-amber-600" : "bg-slate-500 hover:bg-slate-600",
                              children: investment.status
                            }
                          ),
                          project && /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "capitalize text-slate-600", children: formatCategory(project.category) })
                        ] }),
                        project && /* @__PURE__ */ jsxs("p", { className: "flex items-center gap-1 text-xs text-slate-500 mb-3", children: [
                          /* @__PURE__ */ jsx(MapPin, { className: "h-3.5 w-3.5" }),
                          project.location
                        ] }),
                        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-sm", children: [
                          /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-slate-50 px-3 py-2", children: [
                            /* @__PURE__ */ jsx("div", { className: "text-slate-500 text-xs font-medium uppercase tracking-wide", children: "Invested" }),
                            /* @__PURE__ */ jsx("div", { className: "font-semibold text-slate-900 mt-0.5 tabular-nums", children: formatCurrency2(investment.amountInvestedMinor) })
                          ] }),
                          /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-slate-50 px-3 py-2", children: [
                            /* @__PURE__ */ jsx("div", { className: "text-slate-500 text-xs font-medium uppercase tracking-wide", children: "Current value" }),
                            /* @__PURE__ */ jsx("div", { className: "font-semibold text-slate-900 mt-0.5 tabular-nums", children: formatCurrency2(investment.currentValueMinor) })
                          ] }),
                          /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-slate-50 px-3 py-2", children: [
                            /* @__PURE__ */ jsx("div", { className: "text-slate-500 text-xs font-medium uppercase tracking-wide", children: "Returns" }),
                            /* @__PURE__ */ jsx("div", { className: "font-semibold text-emerald-600 mt-0.5 tabular-nums", children: formatCurrency2(investment.totalReturnsMinor) })
                          ] }),
                          /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-slate-50 px-3 py-2", children: [
                            /* @__PURE__ */ jsx("div", { className: "text-slate-500 text-xs font-medium uppercase tracking-wide", children: "Gain" }),
                            /* @__PURE__ */ jsxs(
                              "div",
                              {
                                className: `font-semibold mt-0.5 tabular-nums ${gain >= 0 ? "text-emerald-600" : "text-red-600"}`,
                                children: [
                                  gain >= 0 ? "+" : "",
                                  gainPercentage,
                                  "%"
                                ]
                              }
                            )
                          ] })
                        ] }),
                        project && /* @__PURE__ */ jsxs("div", { className: "mt-4 pt-4 border-t border-slate-100", children: [
                          /* @__PURE__ */ jsx("p", { className: "text-xs font-medium text-slate-600 mb-2", children: "Project funding progress" }),
                          /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs text-slate-500 mb-1", children: [
                            /* @__PURE__ */ jsxs("span", { children: [
                              formatCurrency2(project.currentFundingMinor),
                              " raised"
                            ] }),
                            /* @__PURE__ */ jsxs("span", { children: [
                              fundPct,
                              "% of goal"
                            ] })
                          ] }),
                          /* @__PURE__ */ jsx(
                            Progress,
                            {
                              value: fundPct,
                              className: "h-2 bg-slate-100 [&>[data-slot=progress-indicator]]:bg-teal-600"
                            }
                          ),
                          /* @__PURE__ */ jsxs("p", { className: "text-xs text-slate-500 mt-3", children: [
                            "Invested on",
                            " ",
                            new Date(investment.investmentDate).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric"
                              }
                            )
                          ] })
                        ] })
                      ] }),
                      project && /* @__PURE__ */ jsx(
                        Link,
                        {
                          to: `/projects/${project.id}`,
                          className: "shrink-0 self-start sm:self-center",
                          children: /* @__PURE__ */ jsxs(
                            Button,
                            {
                              variant: "outline",
                              size: "sm",
                              className: "rounded-xl border-slate-200",
                              children: [
                                /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4 mr-2" }),
                                "View project"
                              ]
                            }
                          )
                        }
                      )
                    ] }) })
                  ] })
                },
                investment.id
              );
            }) }),
            /* @__PURE__ */ jsx("div", { className: "mt-8 pt-6 border-t border-slate-100", children: /* @__PURE__ */ jsx(Link, { to: "/projects", children: /* @__PURE__ */ jsx(Button, { variant: "outline", className: "w-full h-11 rounded-xl border-slate-200", children: "Explore more opportunities" }) }) })
          ] })
        ] }) }),
        supportFooter
      ] }) })
    ] })
  ] });
}
const SETTINGS_API = "/api/v1/settings";
const PROJECTS_API = "/api/v1/projects";
const TRANSACTIONS_ALL_API = "/api/v1/transactions/all";
const INVESTMENTS_ALL_API = "/api/v1/investments/all";
const AUDIT_API = "/api/v1/admin/audit";
const MEMBERSHIP_APPLICATIONS_API = "/api/v1/membership/admin/applications";
const BANK_ACCOUNTS_API = "/api/v1/admin/bank-accounts";
const CUSTODY_ONLY_INSTITUTIONS = ["MORGAN_STANLEY", "BANK_OF_SINGAPORE"];
const INSTITUTION_LABEL = {
  SBM: "SBM Bank",
  ABSA: "ABSA",
  STANCHART: "Standard Chartered",
  MORGAN_STANLEY: "Morgan Stanley (E*Trade)",
  BANK_OF_SINGAPORE: "Bank of Singapore",
  OTHER: "Other"
};
const STATEMENTS_API = "/api/v1/admin/statements";
const STATEMENT_LINES_API = "/api/v1/admin/statement-lines";
const AdminDataContext = createContext(void 0);
const emptyResource = (data) => ({ data, loading: true, error: "" });
function AdminDataProvider({ children }) {
  const [users, setUsersState] = useState(emptyResource([]));
  const [projects, setProjectsState] = useState(emptyResource([]));
  const [transactions, setTransactions] = useState(emptyResource([]));
  const [investments, setInvestments] = useState(emptyResource([]));
  const [applications, setApplications] = useState(
    emptyResource([])
  );
  const [audit, setAudit] = useState(emptyResource([]));
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const loadUsers = useCallback(async () => {
    setUsersState((r) => ({ ...r, loading: true, error: "" }));
    const res = await getJson(USERS_PREFIX);
    setUsersState(
      res.ok ? { data: res.data.data ?? [], loading: false, error: "" } : { data: [], loading: false, error: res.error || "Failed to load users." }
    );
  }, []);
  const loadProjects = useCallback(async () => {
    setProjectsState((r) => ({ ...r, loading: true, error: "" }));
    const res = await getJson(PROJECTS_API);
    setProjectsState(
      res.ok ? { data: (res.data.projects ?? []).map(normalizeApiProject), loading: false, error: "" } : { data: [], loading: false, error: res.error || "Failed to load projects." }
    );
  }, []);
  const loadTransactions = useCallback(async () => {
    setTransactions((r) => ({ ...r, loading: true, error: "" }));
    const res = await getJson(TRANSACTIONS_ALL_API);
    setTransactions(
      res.ok ? { data: res.data.transactions ?? [], loading: false, error: "" } : { data: [], loading: false, error: res.error || "Failed to load transactions." }
    );
  }, []);
  const loadInvestments = useCallback(async () => {
    setInvestments((r) => ({ ...r, loading: true, error: "" }));
    const res = await getJson(INVESTMENTS_ALL_API);
    setInvestments(
      res.ok ? { data: res.data.investments ?? [], loading: false, error: "" } : { data: [], loading: false, error: res.error || "Failed to load investments." }
    );
  }, []);
  const loadApplications = useCallback(async () => {
    setApplications((r) => ({ ...r, loading: true, error: "" }));
    const res = await getJson(
      MEMBERSHIP_APPLICATIONS_API
    );
    setApplications(
      res.ok ? { data: res.data.applications ?? [], loading: false, error: "" } : { data: [], loading: false, error: res.error || "Failed to load applications." }
    );
  }, []);
  const loadAudit = useCallback(async () => {
    setAudit((r) => ({ ...r, loading: true, error: "" }));
    const res = await getJson(`${AUDIT_API}?limit=50`);
    setAudit(
      res.ok ? { data: res.data.entries ?? [], loading: false, error: "" } : { data: [], loading: false, error: res.error || "Failed to load activity." }
    );
  }, []);
  const refreshAll = useCallback(async () => {
    await Promise.all([
      loadUsers(),
      loadProjects(),
      loadTransactions(),
      loadInvestments(),
      loadApplications(),
      loadAudit()
    ]);
    setLastSyncedAt(/* @__PURE__ */ new Date());
  }, [loadUsers, loadProjects, loadTransactions, loadInvestments, loadApplications, loadAudit]);
  useEffect(() => {
    void refreshAll();
  }, [refreshAll]);
  const setUsers = useCallback((updater) => {
    setUsersState((r) => ({ ...r, data: updater(r.data) }));
  }, []);
  const setProjects = useCallback((updater) => {
    setProjectsState((r) => ({ ...r, data: updater(r.data) }));
  }, []);
  const value = useMemo(
    () => ({
      users,
      projects,
      transactions,
      investments,
      applications,
      audit,
      lastSyncedAt,
      refreshUsers: loadUsers,
      refreshProjects: loadProjects,
      refreshApplications: loadApplications,
      refreshAudit: loadAudit,
      refreshAll,
      setUsers,
      setProjects
    }),
    [
      users,
      projects,
      transactions,
      investments,
      applications,
      audit,
      lastSyncedAt,
      loadUsers,
      loadProjects,
      loadApplications,
      loadAudit,
      refreshAll,
      setUsers,
      setProjects
    ]
  );
  return /* @__PURE__ */ jsx(AdminDataContext.Provider, { value, children });
}
function useAdminData() {
  const ctx = useContext(AdminDataContext);
  if (!ctx) throw new Error("useAdminData must be used inside AdminDataProvider");
  return ctx;
}
function overdueProjects(projects, now = Date.now()) {
  return projects.filter(
    (p) => p.status === "open" && new Date(p.fundingDeadline).getTime() < now
  );
}
function pendingTransactions(transactions) {
  return transactions.filter((t) => t.status === "pending");
}
function pendingApplications(applications) {
  return applications.filter((a) => a.status === "pending");
}
function buildQueue({
  projects,
  transactions,
  applications,
  now = Date.now()
}) {
  var _a, _b;
  const items = [];
  for (const p of overdueProjects(projects, now)) {
    const daysLate = Math.max(
      1,
      Math.round((now - new Date(p.fundingDeadline).getTime()) / 864e5)
    );
    items.push({
      id: `project-${p.id}`,
      kind: "project-overdue",
      label: p.title,
      detail: `Deadline passed ${daysLate} day${daysLate === 1 ? "" : "s"} ago — still open`,
      to: "/admin/projects?f=open",
      priority: 0
    });
  }
  const pendingTx = pendingTransactions(transactions);
  for (const t of pendingTx) {
    items.push({
      id: `transaction-${t.id}`,
      kind: "transaction-pending",
      label: ((_a = t.user) == null ? void 0 : _a.name) ?? "Unknown investor",
      detail: `${t.type.toLowerCase()} awaiting settlement`,
      to: "/admin/transactions?f=pending",
      priority: 1
    });
  }
  for (const a of pendingApplications(applications)) {
    items.push({
      id: `application-${a.id}`,
      kind: "application-pending",
      label: ((_b = a.user) == null ? void 0 : _b.name) ?? "Unknown applicant",
      detail: "Membership application awaiting review",
      to: "/admin/memberships",
      priority: 2
    });
  }
  return items.sort((a, b) => a.priority - b.priority);
}
const CURRENCY_EXPONENT$1 = {
  USD: 2,
  KES: 2,
  EUR: 2,
  GBP: 2,
  SGD: 2,
  ZAR: 2,
  JPY: 0,
  KRW: 0,
  UGX: 0,
  RWF: 0
};
function minorToMajor$1(minorUnits, currency = "USD") {
  const exponent = CURRENCY_EXPONENT$1[currency.toUpperCase()] ?? 2;
  return (Number.isFinite(minorUnits) ? minorUnits : 0) / 10 ** exponent;
}
function majorToMinor$1(value, currency = "USD") {
  const exponent = CURRENCY_EXPONENT$1[currency.toUpperCase()] ?? 2;
  const major = typeof value === "number" ? value : Number.parseFloat(value);
  if (!Number.isFinite(major)) return 0;
  return Math.round(major * 10 ** exponent);
}
function formatCurrency(minorUnits, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(minorToMajor$1(minorUnits, currency));
}
function formatCompact(minorUnits, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 1
  }).format(minorToMajor$1(minorUnits, currency));
}
function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(Number.isFinite(value) ? value : 0);
}
function formatDate$1(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}
function formatDateTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}
function formatRelative(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  const diffMs = Date.now() - d.getTime();
  const mins = Math.round(diffMs / 6e4);
  if (Math.abs(mins) < 1) return "just now";
  if (Math.abs(mins) < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (Math.abs(hours) < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (Math.abs(days) < 30) return `${days}d ago`;
  return formatDate$1(value);
}
function fundingPercent(current, total) {
  if (!total || total <= 0) return 0;
  return Math.min(100, Math.max(0, current / total * 100));
}
const CHART_COLORS = [
  "#059669",
  // emerald-600
  "#0891b2",
  // cyan-600
  "#7c3aed",
  // violet-600
  "#d97706",
  // amber-600
  "#e11d48",
  // rose-600
  "#0d9488",
  // teal-600
  "#4f46e5"
  // indigo-600
];
function Sparkline({
  values,
  color = "#059669",
  width = 96,
  height = 32,
  fill = true,
  className = ""
}) {
  const gradientId = useId().replace(/:/g, "");
  const points = values.filter((v) => Number.isFinite(v));
  if (points.length < 2) return null;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min;
  const pad = 1.5;
  const usableHeight = height - pad * 2;
  const coords = points.map((value, i) => {
    const x = i / (points.length - 1) * width;
    const y = range === 0 ? height / 2 : pad + (1 - (value - min) / range) * usableHeight;
    return { x, y };
  });
  const line = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(2)},${c.y.toFixed(2)}`).join(" ");
  const area = `${line} L${width},${height} L0,${height} Z`;
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      width,
      height,
      viewBox: `0 0 ${width} ${height}`,
      fill: "none",
      className,
      "aria-hidden": "true",
      preserveAspectRatio: "none",
      children: [
        fill && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", { id: gradientId, x1: "0", y1: "0", x2: "0", y2: "1", children: [
            /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: color, stopOpacity: "0.22" }),
            /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: color, stopOpacity: "0" })
          ] }) }),
          /* @__PURE__ */ jsx("path", { d: area, fill: `url(#${gradientId})` })
        ] }),
        /* @__PURE__ */ jsx(
          "path",
          {
            d: line,
            stroke: color,
            strokeWidth: 1.75,
            strokeLinecap: "round",
            strokeLinejoin: "round",
            vectorEffect: "non-scaling-stroke"
          }
        ),
        /* @__PURE__ */ jsx("circle", { cx: coords[coords.length - 1].x - 1, cy: coords[coords.length - 1].y, r: 2, fill: color })
      ]
    }
  );
}
function PageHeader({
  title,
  description,
  eyebrow,
  actions,
  children
}) {
  return /* @__PURE__ */ jsxs("div", { className: "mb-6 sm:mb-7", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
        eyebrow && /* @__PURE__ */ jsx("div", { className: "mb-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-emerald-600", children: eyebrow }),
        /* @__PURE__ */ jsx("h1", { className: "text-[1.6rem] font-bold leading-tight tracking-[-0.02em] text-slate-900 sm:text-[2rem]", children: title }),
        description && /* @__PURE__ */ jsx("p", { className: "mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-500", children: description })
      ] }),
      actions && /* @__PURE__ */ jsx("div", { className: "flex shrink-0 flex-wrap items-center gap-2", children: actions })
    ] }),
    children && /* @__PURE__ */ jsx("div", { className: "mt-5", children })
  ] });
}
const STAT_TONES = {
  brand: { chip: "bg-emerald-50 text-emerald-600", spark: "#059669" },
  sky: { chip: "bg-sky-50 text-sky-600", spark: "#0284c7" },
  violet: { chip: "bg-violet-50 text-violet-600", spark: "#7c3aed" },
  amber: { chip: "bg-amber-50 text-amber-600", spark: "#d97706" },
  neutral: { chip: "bg-slate-100 text-slate-500", spark: "#64748b" }
};
function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  delta,
  series,
  tone = "brand",
  loading
}) {
  const palette = STAT_TONES[tone];
  const showSpark = Array.isArray(series) && series.length > 1 && series.some((v) => v !== 0);
  return /* @__PURE__ */ jsxs("div", { className: "group relative overflow-hidden rounded-2xl border border-[var(--adm-line)] bg-white p-5 shadow-[var(--adm-e1)] transition-shadow duration-200 hover:shadow-[var(--adm-e2)]", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
      /* @__PURE__ */ jsx("p", { className: "text-[0.8125rem] font-medium text-slate-500", children: label }),
      /* @__PURE__ */ jsx("span", { className: `flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${palette.chip}`, children: /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4" }) })
    ] }),
    loading ? /* @__PURE__ */ jsx("div", { className: "mt-3.5 h-8 w-28 animate-pulse rounded-md bg-slate-100" }) : /* @__PURE__ */ jsx("p", { className: "adm-num mt-3.5 text-[1.75rem] font-bold leading-none text-slate-900", children: value }),
    /* @__PURE__ */ jsxs("div", { className: "mt-3 flex items-end justify-between gap-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex min-w-0 items-center gap-2", children: [
        /* @__PURE__ */ jsx(Trend, { value: delta }),
        hint && /* @__PURE__ */ jsx("p", { className: "truncate text-xs text-slate-400", children: hint })
      ] }),
      showSpark && !loading && /* @__PURE__ */ jsx(Sparkline, { values: series, color: palette.spark, width: 72, height: 26, className: "shrink-0" })
    ] })
  ] });
}
function Trend({ value, suffix = "" }) {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const positive = value >= 0;
  return /* @__PURE__ */ jsxs(
    "span",
    {
      className: `adm-num inline-flex shrink-0 items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-semibold ${positive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`,
      children: [
        positive ? /* @__PURE__ */ jsx(ArrowUpRight, { className: "h-3 w-3" }) : /* @__PURE__ */ jsx(ArrowDownRight, { className: "h-3 w-3" }),
        Math.abs(value).toFixed(0),
        "%",
        suffix
      ]
    }
  );
}
function Panel({
  title,
  description,
  actions,
  footer,
  children,
  padded = true,
  className = ""
}) {
  return /* @__PURE__ */ jsxs(
    "section",
    {
      className: `overflow-hidden rounded-2xl border border-[var(--adm-line)] bg-white shadow-[var(--adm-e1)] ${className}`,
      children: [
        (title || actions) && /* @__PURE__ */ jsxs("header", { className: "flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-5 py-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
            title && /* @__PURE__ */ jsx("h2", { className: "font-semibold tracking-[-0.01em] text-slate-900", children: title }),
            description && /* @__PURE__ */ jsx("p", { className: "mt-0.5 text-sm text-slate-500", children: description })
          ] }),
          actions && /* @__PURE__ */ jsx("div", { className: "shrink-0", children: actions })
        ] }),
        /* @__PURE__ */ jsx("div", { className: padded ? "p-5" : "", children }),
        footer && /* @__PURE__ */ jsx("div", { className: "border-t border-slate-100 bg-slate-50/60 px-5 py-3", children: footer })
      ]
    }
  );
}
const STATUS_STYLES = {
  // Projects
  open: { pill: "bg-emerald-50 text-emerald-700 ring-emerald-200", dot: "bg-emerald-500" },
  funded: { pill: "bg-sky-50 text-sky-700 ring-sky-200", dot: "bg-sky-500" },
  active: { pill: "bg-violet-50 text-violet-700 ring-violet-200", dot: "bg-violet-500" },
  closed: { pill: "bg-slate-100 text-slate-600 ring-slate-200", dot: "bg-slate-400" },
  // Transactions / applications
  completed: { pill: "bg-emerald-50 text-emerald-700 ring-emerald-200", dot: "bg-emerald-500" },
  approved: { pill: "bg-emerald-50 text-emerald-700 ring-emerald-200", dot: "bg-emerald-500" },
  paid: { pill: "bg-emerald-50 text-emerald-700 ring-emerald-200", dot: "bg-emerald-500" },
  pending: { pill: "bg-amber-50 text-amber-700 ring-amber-200", dot: "bg-amber-500" },
  failed: { pill: "bg-rose-50 text-rose-700 ring-rose-200", dot: "bg-rose-500" },
  rejected: { pill: "bg-rose-50 text-rose-700 ring-rose-200", dot: "bg-rose-500" },
  expired: { pill: "bg-slate-100 text-slate-600 ring-slate-200", dot: "bg-slate-400" },
  canceled: { pill: "bg-slate-100 text-slate-600 ring-slate-200", dot: "bg-slate-400" },
  none: { pill: "bg-slate-100 text-slate-500 ring-slate-200", dot: "bg-slate-300" },
  // Roles
  admin: { pill: "bg-indigo-50 text-indigo-700 ring-indigo-200", dot: "bg-indigo-500" },
  investor: { pill: "bg-slate-100 text-slate-700 ring-slate-200", dot: "bg-slate-400" },
  // Membership tiers
  free: { pill: "bg-slate-100 text-slate-600 ring-slate-200", dot: "bg-slate-400" },
  basic: { pill: "bg-teal-50 text-teal-700 ring-teal-200", dot: "bg-teal-500" },
  premium: { pill: "bg-amber-50 text-amber-800 ring-amber-200", dot: "bg-amber-500" },
  investor_plus: { pill: "bg-violet-50 text-violet-700 ring-violet-200", dot: "bg-violet-500" }
};
const FALLBACK_STATUS = { pill: "bg-slate-100 text-slate-600 ring-slate-200", dot: "bg-slate-400" };
function StatusPill({ status, className = "" }) {
  const key = String(status || "").toLowerCase();
  const styles = STATUS_STYLES[key] ?? FALLBACK_STATUS;
  return /* @__PURE__ */ jsxs(
    "span",
    {
      className: `inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize ring-1 ring-inset ${styles.pill} ${className}`,
      children: [
        /* @__PURE__ */ jsx("span", { className: `h-1.5 w-1.5 shrink-0 rounded-full ${styles.dot}` }),
        String(status || "—").replace(/[_-]/g, " ")
      ]
    }
  );
}
function FundingBar({
  current,
  total,
  showLabel = true
}) {
  const pct = fundingPercent(current, total);
  const complete = pct >= 100;
  return /* @__PURE__ */ jsxs("div", { className: "min-w-[110px]", children: [
    showLabel && /* @__PURE__ */ jsx("div", { className: "mb-1 flex items-baseline justify-between gap-2", children: /* @__PURE__ */ jsxs("span", { className: "adm-num text-xs font-semibold text-slate-700", children: [
      pct.toFixed(0),
      "%"
    ] }) }),
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "h-1.5 w-full overflow-hidden rounded-full bg-slate-100",
        role: "progressbar",
        "aria-valuenow": Math.round(pct),
        "aria-valuemin": 0,
        "aria-valuemax": 100,
        children: /* @__PURE__ */ jsx(
          "div",
          {
            className: `h-full rounded-full transition-all duration-500 ${complete ? "bg-sky-500" : "bg-emerald-500"}`,
            style: { width: `${pct}%` }
          }
        )
      }
    )
  ] });
}
function Ring({
  current,
  total,
  size = 44,
  stroke = 4
}) {
  const pct = fundingPercent(current, total);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const complete = pct >= 100;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "relative shrink-0",
      style: { width: size, height: size },
      role: "progressbar",
      "aria-valuenow": Math.round(pct),
      "aria-valuemin": 0,
      "aria-valuemax": 100,
      children: [
        /* @__PURE__ */ jsxs("svg", { width: size, height: size, className: "-rotate-90", children: [
          /* @__PURE__ */ jsx("circle", { cx: size / 2, cy: size / 2, r: radius, fill: "none", stroke: "#eef1f5", strokeWidth: stroke }),
          /* @__PURE__ */ jsx(
            "circle",
            {
              cx: size / 2,
              cy: size / 2,
              r: radius,
              fill: "none",
              stroke: complete ? "#0284c7" : "#059669",
              strokeWidth: stroke,
              strokeLinecap: "round",
              strokeDasharray: circumference,
              strokeDashoffset: circumference * (1 - pct / 100),
              className: "transition-[stroke-dashoffset] duration-700"
            }
          )
        ] }),
        /* @__PURE__ */ jsx("span", { className: "adm-num absolute inset-0 flex items-center justify-center text-[0.7rem] font-bold text-slate-700", children: pct.toFixed(0) })
      ]
    }
  );
}
function Segmented({
  options,
  value,
  onChange,
  size = "md",
  className = ""
}) {
  const pad = size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-[0.8125rem]";
  return /* @__PURE__ */ jsx(
    "div",
    {
      role: "tablist",
      className: `inline-flex gap-0.5 rounded-xl border border-[var(--adm-line)] bg-white p-1 ${className}`,
      children: options.map((opt) => {
        const active = opt.value === value;
        return /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            role: "tab",
            "aria-selected": active,
            onClick: () => onChange(opt.value),
            className: `adm-focus rounded-lg font-medium transition-colors ${pad} ${active ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`,
            children: [
              opt.label,
              opt.count !== void 0 && /* @__PURE__ */ jsx("span", { className: `adm-num ml-1.5 ${active ? "text-white/60" : "text-slate-400"}`, children: opt.count })
            ]
          },
          String(opt.value)
        );
      })
    }
  );
}
const AVATAR_TINTS = [
  "bg-emerald-100 text-emerald-700",
  "bg-sky-100 text-sky-700",
  "bg-violet-100 text-violet-700",
  "bg-amber-100 text-amber-800",
  "bg-rose-100 text-rose-700",
  "bg-teal-100 text-teal-700",
  "bg-indigo-100 text-indigo-700"
];
function avatarTint(seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = hash * 31 + seed.charCodeAt(i) | 0;
  }
  return AVATAR_TINTS[Math.abs(hash) % AVATAR_TINTS.length];
}
function initials(name) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => {
    var _a;
    return ((_a = part[0]) == null ? void 0 : _a.toUpperCase()) ?? "";
  }).join("") || "?";
}
function Avatar({
  name,
  seed,
  size = "md",
  className = ""
}) {
  const dims = size === "sm" ? "h-8 w-8 text-[0.6875rem]" : size === "lg" ? "h-12 w-12 text-sm" : "h-9 w-9 text-xs";
  return /* @__PURE__ */ jsx(
    "span",
    {
      "aria-hidden": "true",
      className: `flex shrink-0 items-center justify-center rounded-full font-semibold ${dims} ${avatarTint(
        seed || name
      )} ${className}`,
      children: initials(name)
    }
  );
}
function Flash({ type, children }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      role: "status",
      className: `mb-5 rounded-xl border px-4 py-3 text-sm ${type === "ok" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-800"}`,
      children
    }
  );
}
function EmptyChart({ message, height = 280 }) {
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 text-center",
      style: { height },
      children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-slate-600", children: "Not enough data yet" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 max-w-xs px-4 text-sm text-slate-400", children: message })
      ]
    }
  );
}
function EmptyState({
  title,
  body,
  icon: Icon = Inbox,
  action,
  className = ""
}) {
  return /* @__PURE__ */ jsxs("div", { className: `flex flex-col items-center justify-center px-4 py-12 text-center ${className}`, children: [
    /* @__PURE__ */ jsx("span", { className: "mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100", children: /* @__PURE__ */ jsx(Icon, { className: "h-5 w-5 text-slate-400" }) }),
    /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-slate-700", children: title }),
    body && /* @__PURE__ */ jsx("p", { className: "mt-1 max-w-sm text-sm text-slate-500", children: body }),
    action && /* @__PURE__ */ jsx("div", { className: "mt-4", children: action })
  ] });
}
function Skeleton({ className = "" }) {
  return /* @__PURE__ */ jsx("div", { className: `animate-pulse rounded-lg bg-slate-100 ${className}` });
}
function KeyValue({
  label,
  children,
  icon: Icon
}) {
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-4 py-2", children: [
    /* @__PURE__ */ jsxs("dt", { className: "flex items-center gap-2 text-sm text-slate-500", children: [
      Icon && /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4 text-slate-400" }),
      label
    ] }),
    /* @__PURE__ */ jsx("dd", { className: "min-w-0 text-right text-sm font-medium text-slate-800", children })
  ] });
}
function Popover({
  ...props
}) {
  return /* @__PURE__ */ jsx(PopoverPrimitive.Root, { "data-slot": "popover", ...props });
}
function PopoverTrigger({
  ...props
}) {
  return /* @__PURE__ */ jsx(PopoverPrimitive.Trigger, { "data-slot": "popover-trigger", ...props });
}
function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}) {
  return /* @__PURE__ */ jsx(PopoverPrimitive.Portal, { children: /* @__PURE__ */ jsx(
    PopoverPrimitive.Content,
    {
      "data-slot": "popover-content",
      align,
      sideOffset,
      className: cn(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden",
        className
      ),
      ...props
    }
  ) });
}
const KIND_STYLE = {
  "project-overdue": { icon: CalendarClock, chip: "bg-amber-50 text-amber-600" },
  "transaction-pending": { icon: Wallet, chip: "bg-sky-50 text-sky-600" },
  "application-pending": { icon: BadgeCheck, chip: "bg-violet-50 text-violet-600" }
};
const VISIBLE_LIMIT = 8;
function ActionQueue() {
  const { projects, transactions, applications } = useAdminData();
  const [open, setOpen] = useState(false);
  const items = useMemo(
    () => buildQueue({
      projects: projects.data,
      transactions: transactions.data,
      applications: applications.data
    }),
    [projects.data, transactions.data, applications.data]
  );
  const shown = items.slice(0, VISIBLE_LIMIT);
  const overflow = items.length - shown.length;
  return /* @__PURE__ */ jsxs(Popover, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        "aria-label": `Action queue, ${items.length} item${items.length === 1 ? "" : "s"}`,
        className: "adm-focus relative rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800",
        children: [
          /* @__PURE__ */ jsx(Bell, { className: "h-[18px] w-[18px]" }),
          items.length > 0 && /* @__PURE__ */ jsx("span", { className: "adm-num absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[0.625rem] font-bold text-white ring-2 ring-white", children: items.length > 99 ? "99+" : items.length })
        ]
      }
    ) }),
    /* @__PURE__ */ jsxs(
      PopoverContent,
      {
        align: "end",
        sideOffset: 10,
        className: "w-[22rem] rounded-2xl border-[var(--adm-line)] p-0 shadow-[var(--adm-e3)]",
        children: [
          /* @__PURE__ */ jsxs("header", { className: "flex items-center justify-between border-b border-slate-100 px-4 py-3", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-slate-900", children: "Needs attention" }),
            /* @__PURE__ */ jsx("span", { className: "adm-num rounded-md bg-slate-100 px-1.5 py-0.5 text-xs font-semibold text-slate-600", children: items.length })
          ] }),
          items.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center px-4 py-9 text-center", children: [
            /* @__PURE__ */ jsx(CheckCircle2, { className: "mb-2 h-7 w-7 text-emerald-500" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-slate-700", children: "All clear" }),
            /* @__PURE__ */ jsx("p", { className: "mt-0.5 text-sm text-slate-500", children: "No overdue projects, pending money or waiting applications." })
          ] }) : /* @__PURE__ */ jsx("ul", { className: "max-h-[22rem] overflow-y-auto py-1", children: shown.map((item) => {
            const style = KIND_STYLE[item.kind];
            return /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
              Link,
              {
                to: item.to,
                onClick: () => setOpen(false),
                className: "group flex items-start gap-3 px-4 py-2.5 transition-colors hover:bg-slate-50",
                children: [
                  /* @__PURE__ */ jsx(
                    "span",
                    {
                      className: `mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${style.chip}`,
                      children: /* @__PURE__ */ jsx(style.icon, { className: "h-3.5 w-3.5" })
                    }
                  ),
                  /* @__PURE__ */ jsxs("span", { className: "min-w-0 flex-1", children: [
                    /* @__PURE__ */ jsx("span", { className: "block truncate text-sm font-medium text-slate-800", children: item.label }),
                    /* @__PURE__ */ jsx("span", { className: "block truncate text-xs capitalize text-slate-500", children: item.detail })
                  ] }),
                  /* @__PURE__ */ jsx(ArrowRight, { className: "mt-1.5 h-3.5 w-3.5 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500" })
                ]
              }
            ) }, item.id);
          }) }),
          overflow > 0 && /* @__PURE__ */ jsx("footer", { className: "border-t border-slate-100 px-4 py-2.5", children: /* @__PURE__ */ jsxs(
            Link,
            {
              to: "/admin",
              onClick: () => setOpen(false),
              className: "text-xs font-medium text-emerald-600 hover:text-emerald-700",
              children: [
                "+",
                overflow,
                " more on the dashboard"
              ]
            }
          ) })
        ]
      }
    )
  ] });
}
function Command({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    Command$1,
    {
      "data-slot": "command",
      className: cn(
        "bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-md",
        className
      ),
      ...props
    }
  );
}
function CommandDialog({
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
  ...props
}) {
  return /* @__PURE__ */ jsxs(Dialog, { ...props, children: [
    /* @__PURE__ */ jsxs(DialogHeader, { className: "sr-only", children: [
      /* @__PURE__ */ jsx(DialogTitle, { children: title }),
      /* @__PURE__ */ jsx(DialogDescription, { children: description })
    ] }),
    /* @__PURE__ */ jsx(DialogContent, { className: "overflow-hidden p-0", children: /* @__PURE__ */ jsx(Command, { className: "[&_[cmdk-group-heading]]:text-muted-foreground **:data-[slot=command-input-wrapper]:h-12 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5", children }) })
  ] });
}
function CommandInput({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxs(
    "div",
    {
      "data-slot": "command-input-wrapper",
      className: "flex h-9 items-center gap-2 border-b px-3",
      children: [
        /* @__PURE__ */ jsx(SearchIcon, { className: "size-4 shrink-0 opacity-50" }),
        /* @__PURE__ */ jsx(
          Command$1.Input,
          {
            "data-slot": "command-input",
            className: cn(
              "placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
              className
            ),
            ...props
          }
        )
      ]
    }
  );
}
function CommandList({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    Command$1.List,
    {
      "data-slot": "command-list",
      className: cn(
        "max-h-[300px] scroll-py-1 overflow-x-hidden overflow-y-auto",
        className
      ),
      ...props
    }
  );
}
function CommandEmpty({
  ...props
}) {
  return /* @__PURE__ */ jsx(
    Command$1.Empty,
    {
      "data-slot": "command-empty",
      className: "py-6 text-center text-sm",
      ...props
    }
  );
}
function CommandGroup({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    Command$1.Group,
    {
      "data-slot": "command-group",
      className: cn(
        "text-foreground [&_[cmdk-group-heading]]:text-muted-foreground overflow-hidden p-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium",
        className
      ),
      ...props
    }
  );
}
function CommandSeparator({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    Command$1.Separator,
    {
      "data-slot": "command-separator",
      className: cn("bg-border -mx-1 h-px", className),
      ...props
    }
  );
}
function CommandItem({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    Command$1.Item,
    {
      "data-slot": "command-item",
      className: cn(
        "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      ),
      ...props
    }
  );
}
const SECTIONS$1 = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, keywords: "dashboard home summary" },
  { to: "/admin/users", label: "Users", icon: Users$1, keywords: "accounts investors admins people" },
  { to: "/admin/projects", label: "Projects", icon: FolderOpen, keywords: "land listings funding" },
  { to: "/admin/transactions", label: "Transactions", icon: ChartColumn, keywords: "money deposits withdrawals ledger" },
  { to: "/admin/analytics", label: "Analytics", icon: TrendingUp, keywords: "charts growth reports" },
  { to: "/admin/memberships", label: "Memberships", icon: BadgeCheck, keywords: "tiers applications features" },
  { to: "/admin/settings", label: "Settings", icon: Settings$1, keywords: "configuration platform account" }
];
const RESULTS_PER_GROUP = 6;
function CommandPalette({
  open,
  onOpenChange,
  onRefresh,
  onLogout
}) {
  const navigate = useNavigate();
  const { users, projects, transactions } = useAdminData();
  const run = (fn) => {
    onOpenChange(false);
    setTimeout(fn, 0);
  };
  const topUsers = useMemo(() => users.data.slice(0, 40), [users.data]);
  const topProjects = useMemo(() => projects.data.slice(0, 40), [projects.data]);
  const topTransactions = useMemo(
    () => [...transactions.data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 30),
    [transactions.data]
  );
  return /* @__PURE__ */ jsxs(
    CommandDialog,
    {
      open,
      onOpenChange,
      title: "Command palette",
      description: "Search sections, records and actions",
      children: [
        /* @__PURE__ */ jsx(CommandInput, { placeholder: "Search sections, users, projects, transactions…" }),
        /* @__PURE__ */ jsxs(CommandList, { className: "max-h-[420px]", children: [
          /* @__PURE__ */ jsx(CommandEmpty, { children: "No matches." }),
          /* @__PURE__ */ jsx(CommandGroup, { heading: "Go to", children: SECTIONS$1.map((s) => /* @__PURE__ */ jsxs(
            CommandItem,
            {
              value: `${s.label} ${s.keywords}`,
              onSelect: () => run(() => navigate(s.to)),
              children: [
                /* @__PURE__ */ jsx(s.icon, { className: "h-4 w-4 text-slate-400" }),
                /* @__PURE__ */ jsx("span", { children: s.label })
              ]
            },
            s.to
          )) }),
          topUsers.length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(CommandSeparator, {}),
            /* @__PURE__ */ jsx(CommandGroup, { heading: "Users", children: topUsers.slice(0, RESULTS_PER_GROUP * 4).map((u) => /* @__PURE__ */ jsxs(
              CommandItem,
              {
                value: `user ${u.name} ${u.email}`,
                onSelect: () => run(() => navigate(`/admin/users?focus=${u.id}`)),
                children: [
                  /* @__PURE__ */ jsx(CircleUser, { className: "h-4 w-4 text-slate-400" }),
                  /* @__PURE__ */ jsx("span", { className: "truncate", children: u.name }),
                  /* @__PURE__ */ jsx("span", { className: "ml-auto truncate pl-3 text-xs text-slate-400", children: u.email })
                ]
              },
              u.id
            )) })
          ] }),
          topProjects.length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(CommandSeparator, {}),
            /* @__PURE__ */ jsx(CommandGroup, { heading: "Projects", children: topProjects.slice(0, RESULTS_PER_GROUP * 4).map((p) => /* @__PURE__ */ jsxs(
              CommandItem,
              {
                value: `project ${p.title} ${p.location} ${p.category}`,
                onSelect: () => run(() => navigate(`/admin/projects?focus=${p.id}`)),
                children: [
                  /* @__PURE__ */ jsx(FolderOpen, { className: "h-4 w-4 text-slate-400" }),
                  /* @__PURE__ */ jsx("span", { className: "truncate", children: p.title }),
                  /* @__PURE__ */ jsx("span", { className: "ml-auto truncate pl-3 text-xs text-slate-400", children: p.location })
                ]
              },
              p.id
            )) })
          ] }),
          topTransactions.length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(CommandSeparator, {}),
            /* @__PURE__ */ jsx(CommandGroup, { heading: "Recent transactions", children: topTransactions.slice(0, RESULTS_PER_GROUP).map((t) => {
              var _a, _b;
              return /* @__PURE__ */ jsxs(
                CommandItem,
                {
                  value: `transaction ${((_a = t.user) == null ? void 0 : _a.name) ?? ""} ${t.type} ${t.status}`,
                  onSelect: () => run(() => navigate("/admin/transactions")),
                  children: [
                    /* @__PURE__ */ jsx(ChartColumn, { className: "h-4 w-4 text-slate-400" }),
                    /* @__PURE__ */ jsx("span", { className: "truncate", children: ((_b = t.user) == null ? void 0 : _b.name) ?? "Unknown" }),
                    /* @__PURE__ */ jsxs("span", { className: "adm-num ml-auto pl-3 text-xs text-slate-400", children: [
                      formatCurrency(t.amountMinor),
                      " · ",
                      formatDate$1(t.createdAt)
                    ] })
                  ]
                },
                t.id
              );
            }) })
          ] }),
          /* @__PURE__ */ jsx(CommandSeparator, {}),
          /* @__PURE__ */ jsxs(CommandGroup, { heading: "Actions", children: [
            /* @__PURE__ */ jsxs(
              CommandItem,
              {
                value: "new project create add",
                onSelect: () => run(() => navigate("/admin/projects?new=1")),
                children: [
                  /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 text-slate-400" }),
                  "New project"
                ]
              }
            ),
            /* @__PURE__ */ jsxs(CommandItem, { value: "refresh reload sync data", onSelect: () => run(onRefresh), children: [
              /* @__PURE__ */ jsx(RefreshCw, { className: "h-4 w-4 text-slate-400" }),
              "Refresh all data"
            ] }),
            /* @__PURE__ */ jsxs(
              CommandItem,
              {
                value: "export transactions csv download",
                onSelect: () => run(() => navigate("/admin/transactions?export=1")),
                children: [
                  /* @__PURE__ */ jsx(Download, { className: "h-4 w-4 text-slate-400" }),
                  "Export transactions"
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              CommandItem,
              {
                value: "public site homepage view",
                onSelect: () => run(() => navigate("/")),
                children: [
                  /* @__PURE__ */ jsx(ExternalLink, { className: "h-4 w-4 text-slate-400" }),
                  "View public site"
                ]
              }
            ),
            /* @__PURE__ */ jsxs(CommandItem, { value: "log out sign out", onSelect: () => run(onLogout), children: [
              /* @__PURE__ */ jsx(LogOut, { className: "h-4 w-4 text-slate-400" }),
              "Log out"
            ] })
          ] })
        ] })
      ]
    }
  );
}
const NAV_GROUPS = [
  {
    label: "Monitor",
    items: [
      { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
      { to: "/admin/analytics", label: "Analytics", icon: TrendingUp }
    ]
  },
  {
    label: "Manage",
    items: [
      { to: "/admin/users", label: "Users", icon: Users$1 },
      { to: "/admin/projects", label: "Projects", icon: FolderOpen },
      { to: "/admin/transactions", label: "Transactions", icon: ChartColumn, badge: "transactions" },
      { to: "/admin/memberships", label: "Memberships", icon: BadgeCheck, badge: "applications" },
      { to: "/admin/reconciliation", label: "Reconciliation", icon: Scale }
    ]
  },
  {
    label: "Configure",
    items: [
      { to: "/admin/banking", label: "Banking", icon: Landmark },
      { to: "/admin/settings", label: "Settings", icon: Settings$1 }
    ]
  }
];
const ALL_NAV = NAV_GROUPS.flatMap((g) => g.items);
const COLLAPSE_KEY = "fibi.admin.railCollapsed";
function RailContent({
  collapsed,
  badges,
  onNavigate
}) {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("div", { className: `flex items-center py-6 ${collapsed ? "justify-center px-3" : "px-5"}`, children: /* @__PURE__ */ jsx(Link, { to: "/", onClick: onNavigate, className: "adm-focus inline-block", "aria-label": "FIBI home", children: /* @__PURE__ */ jsx(
      Wordmark,
      {
        size: collapsed ? "sm" : "md",
        tone: "light",
        variant: collapsed ? "monogram" : "full"
      }
    ) }) }),
    /* @__PURE__ */ jsx("nav", { className: "adm-rail-scroll flex-1 overflow-y-auto px-3 pb-4", children: NAV_GROUPS.map((group) => /* @__PURE__ */ jsxs("div", { className: "mb-5 last:mb-0", children: [
      !collapsed && /* @__PURE__ */ jsx("p", { className: "mb-1.5 px-3 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-slate-500", children: group.label }),
      collapsed && /* @__PURE__ */ jsx("div", { className: "mx-3 mb-2 h-px bg-[var(--adm-rail-line)]" }),
      /* @__PURE__ */ jsx("div", { className: "space-y-0.5", children: group.items.map((item) => {
        const count = item.badge ? badges[item.badge] : 0;
        return /* @__PURE__ */ jsx(
          NavLink,
          {
            to: item.to,
            end: item.end,
            onClick: onNavigate,
            title: collapsed ? item.label : void 0,
            className: ({ isActive }) => `adm-focus group relative flex items-center rounded-xl text-sm font-medium transition-colors ${collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"} ${isActive ? "bg-white/[0.07] text-[var(--adm-rail-ink-hi)]" : "text-[var(--adm-rail-ink)] hover:bg-white/[0.04] hover:text-slate-200"}`,
            children: ({ isActive }) => /* @__PURE__ */ jsxs(Fragment, { children: [
              isActive && /* @__PURE__ */ jsx("span", { className: "absolute -left-3 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[var(--adm-brand-hi)]" }),
              /* @__PURE__ */ jsx(
                item.icon,
                {
                  className: `h-[18px] w-[18px] shrink-0 ${isActive ? "text-[var(--adm-brand-hi)]" : "text-slate-500 group-hover:text-slate-400"}`
                }
              ),
              !collapsed && /* @__PURE__ */ jsx("span", { className: "flex-1 truncate", children: item.label }),
              count > 0 && (collapsed ? /* @__PURE__ */ jsx("span", { className: "absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-amber-400" }) : /* @__PURE__ */ jsx("span", { className: "adm-num rounded-md bg-amber-400/15 px-1.5 py-0.5 text-[0.6875rem] font-bold text-amber-300", children: count }))
            ] })
          },
          item.to
        );
      }) })
    ] }, group.label)) }),
    /* @__PURE__ */ jsx("div", { className: "border-t border-[var(--adm-rail-line)] p-3", children: /* @__PURE__ */ jsxs(
      Link,
      {
        to: "/",
        onClick: onNavigate,
        title: collapsed ? "View public site" : void 0,
        className: `adm-focus flex items-center rounded-xl text-sm font-medium text-slate-500 transition-colors hover:bg-white/[0.04] hover:text-slate-300 ${collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"}`,
        children: [
          /* @__PURE__ */ jsx(ExternalLink, { className: "h-[18px] w-[18px] shrink-0" }),
          !collapsed && "View public site"
        ]
      }
    ) })
  ] });
}
function AdminChrome() {
  const { user, logout } = useAuth();
  const {
    refreshAll,
    users,
    projects,
    transactions,
    investments,
    applications,
    lastSyncedAt
  } = useAdminData();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(COLLAPSE_KEY) === "1";
  });
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);
  useEffect(() => {
    if (!drawerOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [drawerOpen]);
  useEffect(() => {
    window.localStorage.setItem(COLLAPSE_KEY, collapsed ? "1" : "0");
  }, [collapsed]);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setPaletteOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const anyLoading = users.loading || projects.loading || transactions.loading || investments.loading || applications.loading;
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshAll();
    setRefreshing(false);
  }, [refreshAll]);
  const handleLogout = useCallback(() => {
    void logout().then(() => navigate("/", { replace: true }));
  }, [logout, navigate]);
  const badges = useMemo(
    () => ({
      transactions: pendingTransactions(transactions.data).length,
      applications: pendingApplications(applications.data).length
    }),
    [transactions.data, applications.data]
  );
  const current = ALL_NAV.find(
    (n) => n.end ? location.pathname === n.to : location.pathname.startsWith(n.to)
  );
  const railWidth = collapsed ? "lg:w-[76px]" : "lg:w-64";
  const railPad = collapsed ? "lg:pl-[76px]" : "lg:pl-64";
  return /* @__PURE__ */ jsxs("div", { className: "adm-shell min-h-screen bg-[var(--adm-canvas)]", children: [
    /* @__PURE__ */ jsx(
      "aside",
      {
        className: `fixed inset-y-0 left-0 z-30 hidden flex-col bg-[var(--adm-rail)] transition-[width] duration-200 lg:flex ${railWidth}`,
        children: /* @__PURE__ */ jsx(RailContent, { collapsed, badges })
      }
    ),
    drawerOpen && /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-50 lg:hidden", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          "aria-label": "Close menu",
          onClick: () => setDrawerOpen(false),
          className: "absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
        }
      ),
      /* @__PURE__ */ jsxs("aside", { className: "absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-[var(--adm-rail)] shadow-2xl", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => setDrawerOpen(false),
            "aria-label": "Close menu",
            className: "absolute right-3 top-5 rounded-lg p-2 text-slate-500 hover:bg-white/5 hover:text-slate-300",
            children: /* @__PURE__ */ jsx(X, { className: "h-5 w-5" })
          }
        ),
        /* @__PURE__ */ jsx(RailContent, { collapsed: false, badges, onNavigate: () => setDrawerOpen(false) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: `transition-[padding] duration-200 ${railPad}`, children: [
      /* @__PURE__ */ jsxs("header", { className: "sticky top-0 z-20 flex h-16 items-center gap-2 border-b border-[var(--adm-line)] bg-white/85 px-4 backdrop-blur-md sm:gap-3 sm:px-6", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => setDrawerOpen(true),
            "aria-label": "Open menu",
            className: "adm-focus rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 lg:hidden",
            children: /* @__PURE__ */ jsx(Menu, { className: "h-5 w-5" })
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => setCollapsed((c) => !c),
            "aria-label": collapsed ? "Expand navigation" : "Collapse navigation",
            className: "adm-focus hidden rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 lg:block",
            children: collapsed ? /* @__PURE__ */ jsx(ChevronsRight, { className: "h-[18px] w-[18px]" }) : /* @__PURE__ */ jsx(ChevronsLeft, { className: "h-[18px] w-[18px]" })
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "min-w-0 flex-1", children: /* @__PURE__ */ jsxs("nav", { "aria-label": "Breadcrumb", className: "flex items-center gap-1.5 text-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "hidden text-slate-400 sm:inline", children: "Admin" }),
          /* @__PURE__ */ jsx("span", { className: "hidden text-slate-300 sm:inline", children: "/" }),
          /* @__PURE__ */ jsx("span", { className: "truncate font-semibold text-slate-800", children: (current == null ? void 0 : current.label) ?? "Console" })
        ] }) }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: () => setPaletteOpen(true),
            className: "adm-focus hidden items-center gap-2 rounded-xl border border-[var(--adm-line)] bg-white px-3 py-2 text-sm text-slate-400 transition-colors hover:border-slate-300 hover:text-slate-600 md:flex",
            children: [
              /* @__PURE__ */ jsx(Search, { className: "h-4 w-4" }),
              /* @__PURE__ */ jsx("span", { className: "pr-6", children: "Search…" }),
              /* @__PURE__ */ jsx("kbd", { className: "rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-sans text-[0.6875rem] font-semibold text-slate-500", children: "⌘K" })
            ]
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => setPaletteOpen(true),
            "aria-label": "Search",
            className: "adm-focus rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 md:hidden",
            children: /* @__PURE__ */ jsx(Search, { className: "h-[18px] w-[18px]" })
          }
        ),
        lastSyncedAt && /* @__PURE__ */ jsxs("span", { className: "hidden whitespace-nowrap text-xs text-slate-400 xl:inline", children: [
          "synced ",
          formatRelative(lastSyncedAt.toISOString())
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => void handleRefresh(),
            disabled: refreshing || anyLoading,
            "aria-label": "Refresh data",
            className: "adm-focus rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 disabled:opacity-40",
            children: /* @__PURE__ */ jsx(RefreshCw, { className: `h-[18px] w-[18px] ${refreshing || anyLoading ? "animate-spin" : ""}` })
          }
        ),
        /* @__PURE__ */ jsx(ActionQueue, {}),
        /* @__PURE__ */ jsx("div", { className: "ml-1 border-l border-slate-200 pl-2 sm:pl-3", children: /* @__PURE__ */ jsxs(DropdownMenu, { children: [
          /* @__PURE__ */ jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              className: "adm-focus flex items-center gap-2.5 rounded-xl p-1 transition-colors hover:bg-slate-100",
              children: [
                /* @__PURE__ */ jsx(Avatar, { name: (user == null ? void 0 : user.name) ?? "Admin", seed: user == null ? void 0 : user.id, size: "sm" }),
                /* @__PURE__ */ jsxs("span", { className: "hidden min-w-0 text-left sm:block", children: [
                  /* @__PURE__ */ jsx("span", { className: "block truncate text-sm font-medium leading-tight text-slate-800", children: user == null ? void 0 : user.name }),
                  /* @__PURE__ */ jsx("span", { className: "block truncate text-xs leading-tight text-slate-400", children: "Administrator" })
                ] })
              ]
            }
          ) }),
          /* @__PURE__ */ jsxs(DropdownMenuContent, { align: "end", className: "w-56 rounded-xl", children: [
            /* @__PURE__ */ jsxs(DropdownMenuLabel, { className: "font-normal", children: [
              /* @__PURE__ */ jsx("span", { className: "block text-sm font-medium text-slate-800", children: user == null ? void 0 : user.name }),
              /* @__PURE__ */ jsx("span", { className: "block truncate text-xs text-slate-400", children: user == null ? void 0 : user.email })
            ] }),
            /* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
            /* @__PURE__ */ jsxs(DropdownMenuItem, { onSelect: () => navigate("/admin/settings"), children: [
              /* @__PURE__ */ jsx(Settings$1, { className: "h-4 w-4" }),
              " Settings"
            ] }),
            /* @__PURE__ */ jsxs(DropdownMenuItem, { onSelect: () => navigate("/"), children: [
              /* @__PURE__ */ jsx(ExternalLink, { className: "h-4 w-4" }),
              " View public site"
            ] }),
            /* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
            /* @__PURE__ */ jsxs(DropdownMenuItem, { variant: "destructive", onSelect: handleLogout, children: [
              /* @__PURE__ */ jsx(LogOut, { className: "h-4 w-4" }),
              " Log out"
            ] })
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsx("main", { className: "adm-fade-in p-4 sm:p-6 lg:p-8", children: /* @__PURE__ */ jsx(Outlet, {}) }, location.pathname)
    ] }),
    /* @__PURE__ */ jsx(
      CommandPalette,
      {
        open: paletteOpen,
        onOpenChange: setPaletteOpen,
        onRefresh: () => void handleRefresh(),
        onLogout: handleLogout
      }
    )
  ] });
}
function AdminLayout() {
  const { user, authReady } = useAuth();
  if (!authReady) return null;
  if (!user) return /* @__PURE__ */ jsx(Navigate, { to: "/login", replace: true });
  if (user.role !== "admin") return /* @__PURE__ */ jsx(Navigate, { to: "/dashboard", replace: true });
  return /* @__PURE__ */ jsx(AdminDataProvider, { children: /* @__PURE__ */ jsx(AdminChrome, {}) });
}
function lastMonths(count, now = /* @__PURE__ */ new Date()) {
  const out = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
    out.push({
      label: d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      end
    });
  }
  return out;
}
function toTime(value) {
  if (!value) return null;
  const t = new Date(value).getTime();
  return Number.isFinite(t) ? t : null;
}
function cumulativeCountByMonth(items, getDate, months = 6, now = /* @__PURE__ */ new Date()) {
  const times = items.map(getDate).map(toTime).filter((t) => t !== null);
  return lastMonths(months, now).map(({ label, end }) => ({
    month: label,
    value: times.filter((t) => t <= end.getTime()).length
  }));
}
function cumulativeSumByMonth(items, getDate, getAmount, months = 6, now = /* @__PURE__ */ new Date()) {
  const rows = items.map((item) => ({ t: toTime(getDate(item)), amount: getAmount(item) || 0 })).filter((r) => r.t !== null);
  return lastMonths(months, now).map(({ label, end }) => ({
    month: label,
    value: rows.reduce((sum, r) => r.t <= end.getTime() ? sum + r.amount : sum, 0)
  }));
}
function sumPerMonth(items, getDate, getAmount, months = 6, now = /* @__PURE__ */ new Date()) {
  const buckets = lastMonths(months, now);
  const rows = items.map((item) => ({ t: toTime(getDate(item)), amount: getAmount(item) || 0 })).filter((r) => r.t !== null);
  return buckets.map(({ label, end }, i) => {
    const start = i === 0 ? -Infinity : buckets[i - 1].end.getTime();
    return {
      month: label,
      value: rows.reduce(
        (sum, r) => r.t > start && r.t <= end.getTime() ? sum + r.amount : sum,
        0
      )
    };
  });
}
function trendDelta(series) {
  if (series.length < 2) return null;
  const prev = series[series.length - 2].value;
  const curr = series[series.length - 1].value;
  if (prev === 0) return curr === 0 ? null : null;
  return (curr - prev) / prev * 100;
}
function isEmptySeries(series) {
  return series.every((p) => p.value === 0);
}
function countPerMonth(items, getDate, months = 6, now = /* @__PURE__ */ new Date()) {
  const buckets = lastMonths(months, now);
  const times = items.map(getDate).map(toTime).filter((t) => t !== null);
  return buckets.map(({ label, end }, i) => {
    const start = i === 0 ? -Infinity : buckets[i - 1].end.getTime();
    return {
      month: label,
      value: times.filter((t) => t > start && t <= end.getTime()).length
    };
  });
}
function netFlowPerMonth(items, getDate, getAmount, getDirection, months = 6, now = /* @__PURE__ */ new Date()) {
  const buckets = lastMonths(months, now);
  const rows = items.map((item) => ({
    t: toTime(getDate(item)),
    amount: Math.abs(getAmount(item) || 0),
    dir: getDirection(item)
  })).filter((r) => r.t !== null);
  return buckets.map(({ label, end }, i) => {
    const start = i === 0 ? -Infinity : buckets[i - 1].end.getTime();
    const inWindow = rows.filter((r) => r.t > start && r.t <= end.getTime());
    const inflow = inWindow.filter((r) => r.dir > 0).reduce((sum, r) => sum + r.amount, 0);
    const outflow = inWindow.filter((r) => r.dir < 0).reduce((sum, r) => sum + r.amount, 0);
    return { month: label, inflow, outflow, net: inflow - outflow };
  });
}
function topByAmount(items, getKey, getLabel, getAmount, limit = 5) {
  const totals = /* @__PURE__ */ new Map();
  for (const item of items) {
    const key = getKey(item);
    if (!key) continue;
    const existing = totals.get(key);
    const amount = getAmount(item) || 0;
    if (existing) {
      existing.value += amount;
      existing.count += 1;
    } else {
      totals.set(key, { label: getLabel(item), value: amount, count: 1 });
    }
  }
  return [...totals.entries()].map(([key, v]) => ({ key, ...v })).sort((a, b) => b.value - a.value).slice(0, limit);
}
function sumByKey(items, getKey, getAmount) {
  const totals = /* @__PURE__ */ new Map();
  for (const item of items) {
    const key = getKey(item) || "Uncategorised";
    totals.set(key, (totals.get(key) ?? 0) + (getAmount(item) || 0));
  }
  return [...totals.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
}
const ACTION_META = {
  "user.delete": { verb: "deleted the account", icon: UserMinus, chip: "bg-rose-50 text-rose-600" },
  "project.create": { verb: "created the project", icon: FolderOpen, chip: "bg-emerald-50 text-emerald-600" },
  "project.update": { verb: "edited the project", icon: PenLine, chip: "bg-sky-50 text-sky-600" },
  "project.delete": { verb: "deleted the project", icon: Trash2, chip: "bg-rose-50 text-rose-600" },
  "settings.update": { verb: "changed", icon: SlidersHorizontal, chip: "bg-violet-50 text-violet-600" },
  "membership.application.approve": {
    verb: "approved the application from",
    icon: BadgeCheck,
    chip: "bg-emerald-50 text-emerald-600"
  },
  "membership.application.reject": {
    verb: "rejected the application from",
    icon: BadgeCheck,
    chip: "bg-rose-50 text-rose-600"
  },
  "membership.update": { verb: "changed the membership of", icon: BadgeCheck, chip: "bg-violet-50 text-violet-600" },
  "membership.features.update": {
    verb: "updated",
    icon: ShieldCheck,
    chip: "bg-amber-50 text-amber-600"
  }
};
const FALLBACK = { verb: "performed", icon: PenLine, chip: "bg-slate-100 text-slate-500" };
function summarise(entry) {
  const meta = entry.metadata;
  if (!meta) return null;
  const changes = meta.changes;
  if (Array.isArray(changes)) {
    const names = changes.map((c) => c && typeof c === "object" ? String(c.featureKey ?? "") : "").filter(Boolean);
    if (names.length === 0) return null;
    return names.length <= 2 ? names.map((n) => n.replace(/[_-]/g, " ")).join(", ") : `${names.slice(0, 2).map((n) => n.replace(/[_-]/g, " ")).join(", ")} +${names.length - 2} more`;
  }
  if (changes && typeof changes === "object") {
    const keys = Object.keys(changes);
    if (keys.length === 0) return null;
    const readable = keys.map((k) => k.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase());
    return readable.length <= 2 ? readable.join(" and ") : `${readable.slice(0, 2).join(", ")} +${readable.length - 2} more`;
  }
  const from = meta.from;
  const to = meta.to;
  if ((from == null ? void 0 : from.tier) && (to == null ? void 0 : to.tier) && from.tier !== to.tier) {
    return `${from.tier.replace(/_/g, " ")} → ${to.tier.replace(/_/g, " ")}`;
  }
  return null;
}
function AuditFeed({
  entries,
  loading,
  error,
  limit,
  emptyBody = "Deletions, project edits and settings changes will appear here."
}) {
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "space-y-2.5", children: Array.from({ length: 4 }).map((_, i) => /* @__PURE__ */ jsx(Skeleton, { className: "h-12" }, i)) });
  }
  if (error) {
    return /* @__PURE__ */ jsx(EmptyState, { title: "Could not load activity", body: error, icon: ShieldCheck });
  }
  const shown = limit ? entries.slice(0, limit) : entries;
  if (shown.length === 0) {
    return /* @__PURE__ */ jsx(EmptyState, { title: "No admin activity yet", body: emptyBody, icon: ShieldCheck });
  }
  return /* @__PURE__ */ jsx("ul", { className: "divide-y divide-slate-100", children: shown.map((entry) => {
    var _a;
    const meta = ACTION_META[entry.action] ?? FALLBACK;
    const detail = summarise(entry);
    const actorName = ((_a = entry.actor) == null ? void 0 : _a.name) ?? entry.actorEmail ?? "A deleted admin";
    return /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-3 py-3 first:pt-0 last:pb-0", children: [
      /* @__PURE__ */ jsx("span", { className: `mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${meta.chip}`, children: /* @__PURE__ */ jsx(meta.icon, { className: "h-4 w-4" }) }),
      /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-sm leading-snug text-slate-700", children: [
          /* @__PURE__ */ jsx("span", { className: "font-medium text-slate-900", children: actorName }),
          " ",
          meta.verb,
          " ",
          /* @__PURE__ */ jsx("span", { className: "font-medium text-slate-900", children: entry.targetLabel ?? entry.targetType })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "mt-0.5 truncate text-xs text-slate-400", children: [
          detail ? `${detail} · ` : "",
          formatRelative(entry.createdAt)
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        Avatar,
        {
          name: actorName,
          seed: entry.actorId ?? entry.actorEmail,
          size: "sm",
          className: "hidden sm:flex"
        }
      )
    ] }, entry.id);
  }) });
}
const RANGES$1 = [
  { value: 3, label: "3M" },
  { value: 6, label: "6M" },
  { value: 12, label: "12M" }
];
const QUEUE_STYLE = {
  "project-overdue": { icon: CalendarClock, chip: "bg-amber-50 text-amber-600" },
  "transaction-pending": { icon: Wallet, chip: "bg-sky-50 text-sky-600" },
  "application-pending": { icon: BadgeCheck, chip: "bg-violet-50 text-violet-600" }
};
const INFLOW_TYPES = /* @__PURE__ */ new Set(["DEPOSIT", "PAYOUT"]);
function greeting(hour) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
const tooltipStyle$2 = {
  borderRadius: 12,
  border: "1px solid #e4e8ee",
  fontSize: 13,
  boxShadow: "0 8px 24px rgb(15 23 42 / 0.10)"
};
function Overview() {
  var _a;
  const { user } = useAuth();
  const { users, projects, transactions, investments, applications, audit, lastSyncedAt } = useAdminData();
  const [months, setMonths] = useState(6);
  const now = useMemo(() => /* @__PURE__ */ new Date(), []);
  const totalRaised = projects.data.reduce((sum, p) => sum + p.currentFundingMinor, 0);
  const openProjects = projects.data.filter((p) => p.status === "open").length;
  const investorCount = users.data.filter((u) => u.role === "investor").length;
  const userGrowth = useMemo(
    () => cumulativeCountByMonth(users.data, (u) => u.createdAt, months),
    [users.data, months]
  );
  const signupsPerMonth = useMemo(
    () => countPerMonth(users.data, (u) => u.createdAt, months),
    [users.data, months]
  );
  const userDelta = trendDelta(signupsPerMonth);
  const capitalGrowth = useMemo(
    () => cumulativeSumByMonth(
      transactions.data.filter((t) => t.type === "INVESTMENT" && t.status === "completed"),
      (t) => t.createdAt,
      (t) => t.amountMinor,
      months
    ),
    [transactions.data, months]
  );
  const combined = useMemo(
    () => userGrowth.map((point, i) => {
      var _a2;
      return {
        month: point.month,
        accounts: point.value,
        capital: ((_a2 = capitalGrowth[i]) == null ? void 0 : _a2.value) ?? 0
      };
    }),
    [userGrowth, capitalGrowth]
  );
  const queue = useMemo(
    () => buildQueue({
      projects: projects.data,
      transactions: transactions.data,
      applications: applications.data,
      now: now.getTime()
    }),
    [projects.data, transactions.data, applications.data, now]
  );
  const recentActivity = useMemo(
    () => [...transactions.data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6),
    [transactions.data]
  );
  const nearlyFunded = useMemo(
    () => [...projects.data].filter((p) => p.totalFundingMinor > 0 && p.status === "open").sort((a, b) => b.currentFundingMinor / b.totalFundingMinor - a.currentFundingMinor / a.totalFundingMinor).slice(0, 5),
    [projects.data]
  );
  const topInvestors = useMemo(
    () => topByAmount(
      investments.data,
      (i) => i.userId,
      (i) => {
        var _a2;
        return ((_a2 = i.user) == null ? void 0 : _a2.name) ?? "Unknown investor";
      },
      (i) => i.amountInvestedMinor,
      5
    ),
    [investments.data]
  );
  const categoryMix = useMemo(() => {
    const rows = sumByKey(
      projects.data,
      (p) => p.category,
      (p) => p.currentFundingMinor
    ).filter((d) => d.value > 0);
    const total = rows.reduce((sum, r) => sum + r.value, 0);
    return { rows: rows.slice(0, 6), total };
  }, [projects.data]);
  const chartsLoading = users.loading || transactions.loading;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      PageHeader,
      {
        eyebrow: lastSyncedAt ? `Synced ${formatRelative(lastSyncedAt.toISOString())}` : "Loading…",
        title: `${greeting(now.getHours())}, ${((_a = user == null ? void 0 : user.name) == null ? void 0 : _a.split(" ")[0]) ?? "Admin"}`,
        description: now.toLocaleDateString("en-US", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric"
        }),
        actions: /* @__PURE__ */ jsxs(
          Link,
          {
            to: "/admin/analytics",
            className: "adm-focus inline-flex items-center gap-1.5 rounded-xl border border-[var(--adm-line)] bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300",
            children: [
              "Full analytics",
              /* @__PURE__ */ jsx(ArrowRight, { className: "h-3.5 w-3.5" })
            ]
          }
        )
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4", children: [
      /* @__PURE__ */ jsx(
        StatCard,
        {
          label: "Total users",
          value: formatNumber(users.data.length),
          icon: Users$1,
          delta: userDelta,
          series: signupsPerMonth.map((p) => p.value),
          hint: `${formatNumber(investorCount)} investors`,
          loading: users.loading
        }
      ),
      /* @__PURE__ */ jsx(
        StatCard,
        {
          label: "Capital raised",
          value: formatCurrency(totalRaised),
          icon: CircleDollarSign,
          tone: "sky",
          series: capitalGrowth.map((p) => p.value),
          hint: "Across all projects",
          loading: projects.loading
        }
      ),
      /* @__PURE__ */ jsx(
        StatCard,
        {
          label: "Open projects",
          value: formatNumber(openProjects),
          icon: FolderOpen,
          tone: "violet",
          hint: `of ${formatNumber(projects.data.length)} total`,
          loading: projects.loading
        }
      ),
      /* @__PURE__ */ jsx(
        StatCard,
        {
          label: "Platform revenue",
          value: formatCurrency(totalRaised * 0.02),
          icon: TrendingUp,
          tone: "amber",
          hint: "2% of capital raised",
          loading: projects.loading
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-5 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsxs(
        Panel,
        {
          title: "Platform growth",
          description: "Accounts registered and capital invested, at each month end",
          className: "lg:col-span-2",
          actions: /* @__PURE__ */ jsx(
            Segmented,
            {
              size: "sm",
              options: RANGES$1,
              value: months,
              onChange: setMonths
            }
          ),
          children: [
            chartsLoading ? /* @__PURE__ */ jsx(Skeleton, { className: "h-[300px]" }) : isEmptySeries(userGrowth) && isEmptySeries(capitalGrowth) ? /* @__PURE__ */ jsx(EmptyChart, { message: "No accounts or completed investments have been recorded yet.", height: 300 }) : /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: 300, children: /* @__PURE__ */ jsxs(AreaChart, { data: combined, margin: { top: 8, right: 8, bottom: 4, left: 0 }, children: [
              /* @__PURE__ */ jsxs("defs", { children: [
                /* @__PURE__ */ jsxs("linearGradient", { id: "ovAccounts", x1: "0", y1: "0", x2: "0", y2: "1", children: [
                  /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: CHART_COLORS[0], stopOpacity: 0.24 }),
                  /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: CHART_COLORS[0], stopOpacity: 0 })
                ] }),
                /* @__PURE__ */ jsxs("linearGradient", { id: "ovCapital", x1: "0", y1: "0", x2: "0", y2: "1", children: [
                  /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: CHART_COLORS[1], stopOpacity: 0.2 }),
                  /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: CHART_COLORS[1], stopOpacity: 0 })
                ] })
              ] }),
              /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#eef1f5", vertical: false }),
              /* @__PURE__ */ jsx(
                XAxis,
                {
                  dataKey: "month",
                  tick: { fontSize: 12, fill: "#94a3b8" },
                  tickLine: false,
                  axisLine: { stroke: "#e4e8ee" }
                }
              ),
              /* @__PURE__ */ jsx(
                YAxis,
                {
                  yAxisId: "left",
                  tick: { fontSize: 12, fill: "#94a3b8" },
                  tickLine: false,
                  axisLine: false,
                  allowDecimals: false,
                  width: 40
                }
              ),
              /* @__PURE__ */ jsx(
                YAxis,
                {
                  yAxisId: "right",
                  orientation: "right",
                  tick: { fontSize: 12, fill: "#94a3b8" },
                  tickLine: false,
                  axisLine: false,
                  width: 62,
                  tickFormatter: (v) => formatCompact(v)
                }
              ),
              /* @__PURE__ */ jsx(
                Tooltip,
                {
                  contentStyle: tooltipStyle$2,
                  formatter: (value, name) => name === "capital" ? [formatCurrency(value), "Capital invested"] : [formatNumber(value), "Accounts"]
                }
              ),
              /* @__PURE__ */ jsx(
                Area,
                {
                  yAxisId: "left",
                  type: "monotone",
                  dataKey: "accounts",
                  stroke: CHART_COLORS[0],
                  strokeWidth: 2.5,
                  fill: "url(#ovAccounts)"
                }
              ),
              /* @__PURE__ */ jsx(
                Area,
                {
                  yAxisId: "right",
                  type: "monotone",
                  dataKey: "capital",
                  stroke: CHART_COLORS[1],
                  strokeWidth: 2.5,
                  fill: "url(#ovCapital)"
                }
              )
            ] }) }),
            /* @__PURE__ */ jsxs("div", { className: "mt-3 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-3", children: [
              /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2 text-xs text-slate-500", children: [
                /* @__PURE__ */ jsx("span", { className: "h-2 w-2 rounded-full", style: { background: CHART_COLORS[0] } }),
                "Accounts"
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2 text-xs text-slate-500", children: [
                /* @__PURE__ */ jsx("span", { className: "h-2 w-2 rounded-full", style: { background: CHART_COLORS[1] } }),
                "Capital invested"
              ] })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsx(
        Panel,
        {
          title: "Needs attention",
          description: queue.length === 0 ? "Nothing is waiting on you" : `${queue.length} open item${queue.length === 1 ? "" : "s"}`,
          padded: false,
          children: queue.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center px-5 py-14 text-center", children: [
            /* @__PURE__ */ jsx(CheckCircle2, { className: "mb-3 h-9 w-9 text-emerald-500" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-slate-700", children: "All clear" }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 max-w-[16rem] text-sm text-slate-500", children: "No overdue projects, no pending money, no waiting applications." })
          ] }) : /* @__PURE__ */ jsx("ul", { className: "max-h-[356px] divide-y divide-slate-50 overflow-y-auto", children: queue.slice(0, 10).map((item) => {
            const style = QUEUE_STYLE[item.kind];
            return /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
              Link,
              {
                to: item.to,
                className: "group flex items-start gap-3 px-5 py-3 transition-colors hover:bg-slate-50",
                children: [
                  /* @__PURE__ */ jsx("span", { className: `mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${style.chip}`, children: /* @__PURE__ */ jsx(style.icon, { className: "h-3.5 w-3.5" }) }),
                  /* @__PURE__ */ jsxs("span", { className: "min-w-0 flex-1", children: [
                    /* @__PURE__ */ jsx("span", { className: "block truncate text-sm font-medium text-slate-800", children: item.label }),
                    /* @__PURE__ */ jsx("span", { className: "block truncate text-xs capitalize text-slate-500", children: item.detail })
                  ] }),
                  /* @__PURE__ */ jsx(ArrowRight, { className: "mt-1 h-3.5 w-3.5 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500" })
                ]
              }
            ) }, item.id);
          }) })
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-5 grid gap-5 lg:grid-cols-2", children: [
      /* @__PURE__ */ jsx(
        Panel,
        {
          title: "Recent money movement",
          description: "The latest transactions across the platform",
          actions: /* @__PURE__ */ jsxs(
            Link,
            {
              to: "/admin/transactions",
              className: "inline-flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700",
              children: [
                "All",
                /* @__PURE__ */ jsx(ArrowRight, { className: "h-3.5 w-3.5" })
              ]
            }
          ),
          children: transactions.loading ? /* @__PURE__ */ jsx("div", { className: "space-y-2.5", children: Array.from({ length: 5 }).map((_, i) => /* @__PURE__ */ jsx(Skeleton, { className: "h-12" }, i)) }) : recentActivity.length === 0 ? /* @__PURE__ */ jsx(
            EmptyState,
            {
              title: "No transactions yet",
              body: transactions.error || "Money movement will appear here once investors start transacting.",
              icon: Coins
            }
          ) : /* @__PURE__ */ jsx("ul", { className: "divide-y divide-slate-50", children: recentActivity.map((t) => {
            var _a2;
            const inflow = INFLOW_TYPES.has(t.type);
            return /* @__PURE__ */ jsxs("li", { className: "flex items-center gap-3 py-2.5 first:pt-0 last:pb-0", children: [
              /* @__PURE__ */ jsx(
                "span",
                {
                  className: `flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${inflow ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`,
                  children: inflow ? /* @__PURE__ */ jsx(ArrowDownLeft, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(ArrowUpRight, { className: "h-4 w-4" })
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
                /* @__PURE__ */ jsx("p", { className: "truncate text-sm font-medium text-slate-800", children: ((_a2 = t.user) == null ? void 0 : _a2.name) ?? "Unknown user" }),
                /* @__PURE__ */ jsxs("p", { className: "truncate text-xs capitalize text-slate-500", children: [
                  t.type.toLowerCase(),
                  " · ",
                  formatRelative(t.createdAt)
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex shrink-0 flex-col items-end gap-1", children: [
                /* @__PURE__ */ jsxs(
                  "span",
                  {
                    className: `adm-num text-sm font-semibold ${inflow ? "text-emerald-600" : "text-slate-700"}`,
                    children: [
                      inflow ? "+" : "−",
                      formatCurrency(t.amountMinor)
                    ]
                  }
                ),
                /* @__PURE__ */ jsx(StatusPill, { status: t.status })
              ] })
            ] }, t.id);
          }) })
        }
      ),
      /* @__PURE__ */ jsx(
        Panel,
        {
          title: "Closest to funding",
          description: "Open projects ranked by share of target raised",
          actions: /* @__PURE__ */ jsxs(
            Link,
            {
              to: "/admin/projects",
              className: "inline-flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700",
              children: [
                "All",
                /* @__PURE__ */ jsx(ArrowRight, { className: "h-3.5 w-3.5" })
              ]
            }
          ),
          children: projects.loading ? /* @__PURE__ */ jsx("div", { className: "space-y-2.5", children: Array.from({ length: 4 }).map((_, i) => /* @__PURE__ */ jsx(Skeleton, { className: "h-12" }, i)) }) : nearlyFunded.length === 0 ? /* @__PURE__ */ jsx(
            EmptyState,
            {
              title: "No open projects",
              body: projects.error || "Projects open for investment will be ranked here.",
              icon: FolderOpen
            }
          ) : /* @__PURE__ */ jsx("ul", { className: "divide-y divide-slate-50", children: nearlyFunded.map((p) => /* @__PURE__ */ jsxs("li", { className: "flex items-center gap-4 py-2.5 first:pt-0 last:pb-0", children: [
            /* @__PURE__ */ jsx(Ring, { current: p.currentFundingMinor, total: p.totalFundingMinor, size: 40 }),
            /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
              /* @__PURE__ */ jsx("p", { className: "truncate text-sm font-medium text-slate-800", children: p.title }),
              /* @__PURE__ */ jsxs("p", { className: "adm-num truncate text-xs text-slate-500", children: [
                formatCompact(p.currentFundingMinor),
                " of ",
                formatCompact(p.totalFundingMinor),
                " · ",
                p.location
              ] })
            ] })
          ] }, p.id)) })
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-5 grid gap-5 lg:grid-cols-2", children: [
      /* @__PURE__ */ jsx(Panel, { title: "Top investors", description: "By total capital committed", children: investments.loading ? /* @__PURE__ */ jsx("div", { className: "space-y-2.5", children: Array.from({ length: 4 }).map((_, i) => /* @__PURE__ */ jsx(Skeleton, { className: "h-11" }, i)) }) : topInvestors.length === 0 ? /* @__PURE__ */ jsx(
        EmptyState,
        {
          title: "No investments yet",
          body: investments.error || "The biggest backers will be listed here once investments are recorded.",
          icon: Trophy
        }
      ) : /* @__PURE__ */ jsx("ul", { className: "divide-y divide-slate-50", children: topInvestors.map((row, i) => /* @__PURE__ */ jsxs("li", { className: "flex items-center gap-3 py-2.5 first:pt-0 last:pb-0", children: [
        /* @__PURE__ */ jsx("span", { className: "adm-num w-4 shrink-0 text-sm font-bold text-slate-300", children: i + 1 }),
        /* @__PURE__ */ jsx(Avatar, { name: row.label, seed: row.key, size: "sm" }),
        /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsx("p", { className: "truncate text-sm font-medium text-slate-800", children: row.label }),
          /* @__PURE__ */ jsxs("p", { className: "adm-num text-xs text-slate-500", children: [
            row.count,
            " investment",
            row.count === 1 ? "" : "s"
          ] })
        ] }),
        /* @__PURE__ */ jsx("span", { className: "adm-num shrink-0 text-sm font-semibold text-slate-900", children: formatCurrency(row.value) })
      ] }, row.key)) }) }),
      /* @__PURE__ */ jsx(Panel, { title: "Where capital sits", description: "Funding raised by project category", children: projects.loading ? /* @__PURE__ */ jsx("div", { className: "space-y-2.5", children: Array.from({ length: 4 }).map((_, i) => /* @__PURE__ */ jsx(Skeleton, { className: "h-11" }, i)) }) : categoryMix.rows.length === 0 ? /* @__PURE__ */ jsx(
        EmptyState,
        {
          title: "No funded projects",
          body: "Once projects take funding, the category split appears here.",
          icon: CircleDollarSign
        }
      ) : /* @__PURE__ */ jsx("ul", { className: "space-y-3.5", children: categoryMix.rows.map((row, i) => {
        const pct = categoryMix.total > 0 ? row.value / categoryMix.total * 100 : 0;
        return /* @__PURE__ */ jsxs("li", { children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-1.5 flex items-baseline justify-between gap-3", children: [
            /* @__PURE__ */ jsx("span", { className: "truncate text-sm font-medium capitalize text-slate-700", children: row.name.replace(/-/g, " ") }),
            /* @__PURE__ */ jsxs("span", { className: "adm-num shrink-0 text-sm text-slate-500", children: [
              formatCompact(row.value),
              /* @__PURE__ */ jsxs("span", { className: "ml-2 text-xs text-slate-400", children: [
                pct.toFixed(0),
                "%"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "h-2 w-full overflow-hidden rounded-full bg-slate-100", children: /* @__PURE__ */ jsx(
            "div",
            {
              className: "h-full rounded-full transition-all duration-700",
              style: {
                width: `${pct}%`,
                background: CHART_COLORS[i % CHART_COLORS.length]
              }
            }
          ) })
        ] }, row.name);
      }) }) })
    ] }),
    /* @__PURE__ */ jsx(
      Panel,
      {
        title: "Recent admin activity",
        description: "Every change made through this console",
        className: "mt-5",
        actions: /* @__PURE__ */ jsxs(
          Link,
          {
            to: "/admin/settings#activity",
            className: "inline-flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700",
            children: [
              "Full log",
              /* @__PURE__ */ jsx(ArrowRight, { className: "h-3.5 w-3.5" })
            ]
          }
        ),
        children: /* @__PURE__ */ jsx(
          AuditFeed,
          {
            entries: audit.data,
            loading: audit.loading,
            error: audit.error,
            limit: 6
          }
        )
      }
    )
  ] });
}
function useTableState(namespace = "", defaults = {}) {
  const [params, setParams] = useSearchParams();
  const defaultFilter = defaults.filter ?? "all";
  const key = useCallback((name) => namespace ? `${namespace}_${name}` : name, [namespace]);
  const state = useMemo(() => {
    const rawPage = Number.parseInt(params.get(key("page")) ?? "", 10);
    const rawDir = params.get(key("dir"));
    return {
      query: params.get(key("q")) ?? "",
      filter: params.get(key("f")) ?? defaultFilter,
      sortKey: params.get(key("sort")) ?? "",
      sortDir: rawDir === "desc" ? "desc" : "asc",
      // URLs are 1-based for humans; the table is 0-based internally.
      page: Number.isFinite(rawPage) && rawPage > 0 ? rawPage - 1 : 0
    };
  }, [params, key, defaultFilter]);
  const patch = useCallback(
    (updates) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [name, value] of Object.entries(updates)) {
            if (value === null || value === "") next.delete(name);
            else next.set(name, value);
          }
          return next;
        },
        { replace: true }
      );
    },
    [setParams]
  );
  const setters = useMemo(
    () => ({
      // Any change to what is being filtered resets paging — page 4 of a
      // 3-page result set shows nothing.
      setQuery: (value) => patch({ [key("q")]: value || null, [key("page")]: null }),
      setFilter: (value) => patch({ [key("f")]: value === defaultFilter ? null : value, [key("page")]: null }),
      setSort: (sortKey, dir) => patch({
        [key("sort")]: dir ? sortKey : null,
        [key("dir")]: dir === "desc" ? "desc" : null,
        [key("page")]: null
      }),
      setPage: (page) => patch({ [key("page")]: page > 0 ? String(page + 1) : null }),
      reset: () => patch({
        [key("q")]: null,
        [key("f")]: null,
        [key("sort")]: null,
        [key("dir")]: null,
        [key("page")]: null
      })
    }),
    [patch, key, defaultFilter]
  );
  return [state, setters];
}
function Checkbox({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    CheckboxPrimitive.Root,
    {
      "data-slot": "checkbox",
      className: cn(
        "peer border bg-input-background dark:bg-input/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className
      ),
      ...props,
      children: /* @__PURE__ */ jsx(
        CheckboxPrimitive.Indicator,
        {
          "data-slot": "checkbox-indicator",
          className: "flex items-center justify-center text-current transition-none",
          children: /* @__PURE__ */ jsx(CheckIcon, { className: "size-3.5" })
        }
      )
    }
  );
}
function DataTable({
  rows,
  columns,
  rowKey,
  loading = false,
  error = "",
  searchable,
  searchPlaceholder = "Search…",
  filters,
  toolbarAction,
  toolbarExtra,
  emptyTitle = "Nothing here yet",
  emptyBody = "Records will appear as soon as there are any.",
  pageSize = 10,
  onRowClick,
  bulkActions,
  urlKey = ""
}) {
  const [state, set] = useTableState(urlKey);
  const [selected, setSelected] = useState(/* @__PURE__ */ new Set());
  const { query, sortKey, sortDir } = state;
  const selectable = Array.isArray(bulkActions) && bulkActions.length > 0;
  const filtered = useMemo(() => {
    if (!searchable || !query.trim()) return rows;
    const q = query.trim().toLowerCase();
    return rows.filter((row) => searchable(row).toLowerCase().includes(q));
  }, [rows, searchable, query]);
  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const col = columns.find((c) => c.key === sortKey);
    if (!(col == null ? void 0 : col.sortValue)) return filtered;
    return [...filtered].sort((a, b) => {
      const av = col.sortValue(a);
      const bv = col.sortValue(b);
      const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv), void 0, { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir, columns]);
  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(state.page, pageCount - 1);
  const pageRows = sorted.slice(safePage * pageSize, safePage * pageSize + pageSize);
  const liveKeys = useMemo(() => new Set(rows.map(rowKey)), [rows, rowKey]);
  useEffect(() => {
    setSelected((prev) => {
      if (prev.size === 0) return prev;
      const next = new Set([...prev].filter((id) => liveKeys.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [liveKeys]);
  const selectedRows = useMemo(
    () => rows.filter((row) => selected.has(rowKey(row))),
    [rows, rowKey, selected]
  );
  const toggleSort = (key) => {
    if (sortKey !== key) return set.setSort(key, "asc");
    if (sortDir === "asc") return set.setSort(key, "desc");
    return set.setSort(key, null);
  };
  const toggleRow = (id) => setSelected((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  });
  const allFilteredKeys = useMemo(() => sorted.map(rowKey), [sorted, rowKey]);
  const allSelected = allFilteredKeys.length > 0 && allFilteredKeys.every((id) => selected.has(id));
  const someSelected = allFilteredKeys.some((id) => selected.has(id));
  const toggleAll = () => setSelected((prev) => {
    if (allSelected) {
      const next = new Set(prev);
      allFilteredKeys.forEach((id) => next.delete(id));
      return next;
    }
    return /* @__PURE__ */ new Set([...prev, ...allFilteredKeys]);
  });
  const showToolbar = Boolean(searchable || filters || toolbarAction || toolbarExtra);
  const columnCount = columns.length + (selectable ? 1 : 0);
  return /* @__PURE__ */ jsxs("div", { className: "overflow-hidden rounded-2xl border border-[var(--adm-line)] bg-white shadow-[var(--adm-e1)]", children: [
    selectable && selected.size > 0 ? /* @__PURE__ */ jsxs("div", { className: "adm-slide-down flex flex-wrap items-center gap-3 border-b border-slate-100 bg-slate-900 px-4 py-3", children: [
      /* @__PURE__ */ jsxs("span", { className: "adm-num text-sm font-semibold text-white", children: [
        selected.size,
        " selected"
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => setSelected(/* @__PURE__ */ new Set()),
          className: "adm-focus rounded-lg p-1 text-slate-400 transition-colors hover:bg-white/10 hover:text-white",
          "aria-label": "Clear selection",
          children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" })
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "ml-auto flex flex-wrap items-center gap-2", children: bulkActions.map((action) => /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          disabled: action.disabled,
          onClick: () => action.onClick(selectedRows),
          className: `adm-focus inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-40 ${action.tone === "danger" ? "bg-rose-500 text-white hover:bg-rose-600" : "bg-white/10 text-white hover:bg-white/20"}`,
          children: [
            action.icon,
            action.label
          ]
        },
        action.label
      )) })
    ] }) : showToolbar && /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center lg:justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-1 flex-col gap-3 sm:flex-row sm:items-center", children: [
        searchable && /* @__PURE__ */ jsxs("div", { className: "relative sm:max-w-xs sm:flex-1", children: [
          /* @__PURE__ */ jsx(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              value: query,
              onChange: (e) => set.setQuery(e.target.value),
              placeholder: searchPlaceholder,
              className: "h-10 rounded-xl border-slate-200 bg-white pl-9 text-sm"
            }
          ),
          query && /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => set.setQuery(""),
              "aria-label": "Clear search",
              className: "absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600",
              children: /* @__PURE__ */ jsx(X, { className: "h-3.5 w-3.5" })
            }
          )
        ] }),
        filters && /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1.5", children: filters.options.map((opt) => {
          const active = filters.value === opt.value;
          return /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              onClick: () => filters.onChange(opt.value),
              className: `adm-focus rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${active ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`,
              children: [
                opt.label,
                opt.count !== void 0 && /* @__PURE__ */ jsx("span", { className: `adm-num ml-1.5 ${active ? "text-white/60" : "text-slate-400"}`, children: opt.count })
              ]
            },
            opt.value
          );
        }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex shrink-0 items-center gap-2", children: [
        toolbarExtra,
        toolbarAction
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[640px] border-collapse text-sm", children: [
      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-slate-100 bg-slate-50/70", children: [
        selectable && /* @__PURE__ */ jsx("th", { scope: "col", className: "w-10 px-4 py-3", children: /* @__PURE__ */ jsx(
          Checkbox,
          {
            checked: allSelected ? true : someSelected ? "indeterminate" : false,
            onCheckedChange: toggleAll,
            "aria-label": "Select all rows",
            className: "translate-y-[1px]"
          }
        ) }),
        columns.map((col) => {
          const isSorted = sortKey === col.key;
          return /* @__PURE__ */ jsx(
            "th",
            {
              scope: "col",
              className: `px-4 py-3 text-left text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-slate-500 ${col.headerClassName ?? ""}`,
              "aria-sort": isSorted ? sortDir === "asc" ? "ascending" : "descending" : "none",
              children: col.sortValue ? /* @__PURE__ */ jsxs(
                "button",
                {
                  type: "button",
                  onClick: () => toggleSort(col.key),
                  className: "adm-focus group inline-flex items-center gap-1 transition-colors hover:text-slate-800",
                  children: [
                    col.header,
                    isSorted ? sortDir === "asc" ? /* @__PURE__ */ jsx(ArrowUp, { className: "h-3 w-3 text-slate-700" }) : /* @__PURE__ */ jsx(ArrowDown, { className: "h-3 w-3 text-slate-700" }) : /* @__PURE__ */ jsx(ChevronsUpDown, { className: "h-3 w-3 opacity-0 transition-opacity group-hover:opacity-40" })
                  ]
                }
              ) : col.header
            },
            col.key
          );
        })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { children: loading ? (
        // Skeleton rows rather than a spinner: the table keeps its shape,
        // so the layout does not jump when data lands.
        Array.from({ length: 5 }).map((_, i) => /* @__PURE__ */ jsxs("tr", { className: "border-b border-slate-50", children: [
          selectable && /* @__PURE__ */ jsx("td", { className: "px-4 py-4" }),
          columns.map((col) => /* @__PURE__ */ jsx("td", { className: "px-4 py-4", children: /* @__PURE__ */ jsx("div", { className: "h-3.5 w-full max-w-[160px] animate-pulse rounded bg-slate-100" }) }, col.key))
        ] }, i))
      ) : error ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsxs("td", { colSpan: columnCount, className: "px-4 py-14 text-center", children: [
        /* @__PURE__ */ jsx(TriangleAlert, { className: "mx-auto mb-3 h-8 w-8 text-amber-500" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-slate-700", children: "Could not load this data" }),
        /* @__PURE__ */ jsx("p", { className: "mx-auto mt-1 max-w-sm text-sm text-slate-500", children: error })
      ] }) }) : pageRows.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsxs("td", { colSpan: columnCount, className: "px-4 py-14 text-center", children: [
        /* @__PURE__ */ jsx(Inbox, { className: "mx-auto mb-3 h-8 w-8 text-slate-300" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-slate-700", children: query ? "No matches" : emptyTitle }),
        /* @__PURE__ */ jsx("p", { className: "mx-auto mt-1 max-w-sm text-sm text-slate-500", children: query ? `Nothing matches “${query}”.` : emptyBody })
      ] }) }) : pageRows.map((row) => {
        const id = rowKey(row);
        const isSelected = selected.has(id);
        return /* @__PURE__ */ jsxs(
          "tr",
          {
            onClick: onRowClick ? () => onRowClick(row) : void 0,
            className: `border-b border-slate-50 transition-colors last:border-0 ${isSelected ? "bg-emerald-50/40" : onRowClick ? "cursor-pointer hover:bg-slate-50" : "hover:bg-slate-50/60"}`,
            children: [
              selectable && /* @__PURE__ */ jsx("td", { className: "px-4 py-3.5", onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsx(
                Checkbox,
                {
                  checked: isSelected,
                  onCheckedChange: () => toggleRow(id),
                  "aria-label": "Select row",
                  className: "translate-y-[1px]"
                }
              ) }),
              columns.map((col) => /* @__PURE__ */ jsx("td", { className: `px-4 py-3.5 align-middle ${col.className ?? ""}`, children: col.cell(row) }, col.key))
            ]
          },
          id
        );
      }) })
    ] }) }),
    !loading && !error && sorted.length > pageSize && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-4 border-t border-slate-100 px-4 py-3", children: [
      /* @__PURE__ */ jsxs("p", { className: "adm-num text-xs text-slate-500", children: [
        safePage * pageSize + 1,
        "–",
        Math.min((safePage + 1) * pageSize, sorted.length),
        " of",
        " ",
        sorted.length
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => set.setPage(Math.max(0, safePage - 1)),
            disabled: safePage === 0,
            className: "adm-focus rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:pointer-events-none disabled:opacity-40",
            "aria-label": "Previous page",
            children: /* @__PURE__ */ jsx(ChevronLeft, { className: "h-4 w-4" })
          }
        ),
        /* @__PURE__ */ jsxs("span", { className: "adm-num px-2 text-xs font-medium text-slate-600", children: [
          safePage + 1,
          " / ",
          pageCount
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => set.setPage(Math.min(pageCount - 1, safePage + 1)),
            disabled: safePage >= pageCount - 1,
            className: "adm-focus rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:pointer-events-none disabled:opacity-40",
            "aria-label": "Next page",
            children: /* @__PURE__ */ jsx(ChevronRight, { className: "h-4 w-4" })
          }
        )
      ] })
    ] })
  ] });
}
function Tabs({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    TabsPrimitive.Root,
    {
      "data-slot": "tabs",
      className: cn("flex flex-col gap-2", className),
      ...props
    }
  );
}
function TabsList({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    TabsPrimitive.List,
    {
      "data-slot": "tabs-list",
      className: cn(
        "bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-xl p-[3px] flex",
        className
      ),
      ...props
    }
  );
}
function TabsTrigger({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    TabsPrimitive.Trigger,
    {
      "data-slot": "tabs-trigger",
      className: cn(
        "data-[state=active]:bg-card dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-xl border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      ),
      ...props
    }
  );
}
function TabsContent({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    TabsPrimitive.Content,
    {
      "data-slot": "tabs-content",
      className: cn("flex-1 outline-none", className),
      ...props
    }
  );
}
const DAY_MS = 864e5;
function csvEscape$1(value) {
  const s = String(value ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
function Users() {
  var _a;
  const { user: currentUser } = useAuth();
  const { users, transactions, investments, setUsers, refreshAudit } = useAdminData();
  const [state, set] = useTableState();
  const [params, setParams] = useSearchParams();
  const [selected, setSelected] = useState(null);
  const [pendingDelete, setPendingDelete] = useState([]);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [flash, setFlash] = useState(null);
  const roleFilter = state.filter;
  const focusId = params.get("focus");
  useEffect(() => {
    if (!focusId) return;
    const match = users.data.find((u) => u.id === focusId);
    if (match) setSelected(match);
  }, [focusId, users.data]);
  const closeDrawer = () => {
    setSelected(null);
    if (params.has("focus")) {
      const next = new URLSearchParams(params);
      next.delete("focus");
      setParams(next, { replace: true });
    }
  };
  const filtered = useMemo(
    () => roleFilter === "all" ? users.data : users.data.filter((u) => u.role === roleFilter),
    [users.data, roleFilter]
  );
  const counts = useMemo(
    () => ({
      all: users.data.length,
      investor: users.data.filter((u) => u.role === "investor").length,
      admin: users.data.filter((u) => u.role === "admin").length
    }),
    [users.data]
  );
  const signups = useMemo(
    () => countPerMonth(users.data, (u) => u.createdAt, 6),
    [users.data]
  );
  const newThisMonth = ((_a = signups[signups.length - 1]) == null ? void 0 : _a.value) ?? 0;
  const activeThisWeek = useMemo(() => {
    const cutoff = Date.now() - 7 * DAY_MS;
    return users.data.filter((u) => {
      if (!u.lastLoginAt) return false;
      const t = new Date(u.lastLoginAt).getTime();
      return Number.isFinite(t) && t >= cutoff;
    }).length;
  }, [users.data]);
  const selectedActivity = useMemo(() => {
    if (!selected) return null;
    const userTx = transactions.data.filter((t) => t.userId === selected.id);
    const userInv = investments.data.filter((i) => i.userId === selected.id);
    return {
      transactions: userTx,
      investments: userInv,
      invested: userInv.reduce((sum, i) => sum + (i.amountInvestedMinor || 0), 0)
    };
  }, [selected, transactions.data, investments.data]);
  const handleDelete = async () => {
    if (pendingDelete.length === 0) return;
    setDeleting(true);
    const results = await Promise.allSettled(
      pendingDelete.map((u) => deleteJson(`${USERS_PREFIX}/${u.id}`))
    );
    const removed = [];
    let failures = 0;
    results.forEach((result, i) => {
      if (result.status === "fulfilled" && result.value.ok) removed.push(pendingDelete[i].id);
      else failures += 1;
    });
    setDeleting(false);
    if (removed.length > 0) {
      const removedSet = new Set(removed);
      setUsers((prev) => prev.filter((u) => !removedSet.has(u.id)));
      if (selected && removedSet.has(selected.id)) closeDrawer();
      void refreshAudit();
    }
    setFlash(
      failures === 0 ? { type: "ok", text: `${removed.length} account${removed.length === 1 ? "" : "s"} removed.` } : {
        type: "err",
        text: removed.length > 0 ? `Removed ${removed.length}, but ${failures} could not be deleted.` : "None of the selected accounts could be deleted."
      }
    );
    setPendingDelete([]);
  };
  const exportCsv = (rows) => {
    const header = ["Name", "Email", "Role", "Joined", "Last login"];
    const lines = rows.map(
      (u) => [u.name, u.email, u.role, u.createdAt, u.lastLoginAt ?? ""].map(csvEscape$1).join(",")
    );
    const blob = new Blob([[header.join(","), ...lines].join("\n")], {
      type: "text/csv;charset=utf-8"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fibi-users-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1e3);
  };
  const copyId = (id) => {
    var _a2;
    void ((_a2 = navigator.clipboard) == null ? void 0 : _a2.writeText(id).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    }));
  };
  const columns = [
    {
      key: "name",
      header: "Account",
      sortValue: (u) => u.name.toLowerCase(),
      cell: (u) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx(Avatar, { name: u.name, seed: u.id }),
        /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsx("p", { className: "truncate font-medium text-slate-800", children: u.name }),
          /* @__PURE__ */ jsx("p", { className: "truncate text-xs text-slate-500", children: u.email })
        ] })
      ] })
    },
    {
      key: "role",
      header: "Role",
      sortValue: (u) => u.role,
      cell: (u) => /* @__PURE__ */ jsx(StatusPill, { status: u.role })
    },
    {
      key: "joined",
      header: "Joined",
      sortValue: (u) => new Date(u.createdAt).getTime(),
      className: "adm-num text-slate-600",
      headerClassName: "hidden md:table-cell",
      cell: (u) => /* @__PURE__ */ jsx("span", { className: "hidden md:inline", children: formatDate$1(u.createdAt) })
    },
    {
      key: "active",
      header: "Last active",
      // Never-logged-in sorts to the bottom rather than pretending to be 1970.
      sortValue: (u) => u.lastLoginAt ? new Date(u.lastLoginAt).getTime() : 0,
      className: "text-slate-600",
      cell: (u) => u.lastLoginAt ? /* @__PURE__ */ jsx("span", { className: "adm-num text-sm", children: formatRelative(u.lastLoginAt) }) : /* @__PURE__ */ jsx("span", { className: "text-sm text-slate-400", children: "Never" })
    },
    {
      key: "actions",
      header: "",
      headerClassName: "text-right",
      className: "text-right",
      cell: (u) => {
        const isSelf = u.id === (currentUser == null ? void 0 : currentUser.id);
        return /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            disabled: isSelf,
            title: isSelf ? "You cannot delete your own account" : "Delete user",
            onClick: (e) => {
              e.stopPropagation();
              setPendingDelete([u]);
            },
            className: "adm-focus rounded-lg p-2 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:pointer-events-none disabled:opacity-30",
            children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" })
          }
        );
      }
    }
  ];
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      PageHeader,
      {
        title: "Users",
        description: "Every account on the platform. Select a row to inspect its full record."
      }
    ),
    flash && /* @__PURE__ */ jsx(Flash, { type: flash.type, children: flash.text }),
    /* @__PURE__ */ jsxs("div", { className: "mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4", children: [
      /* @__PURE__ */ jsx(
        StatCard,
        {
          label: "Total accounts",
          value: counts.all,
          icon: Users$1,
          series: signups.map((p) => p.value),
          delta: trendDelta(signups),
          hint: `${counts.investor} investors · ${counts.admin} admins`,
          loading: users.loading
        }
      ),
      /* @__PURE__ */ jsx(
        StatCard,
        {
          label: "New this month",
          value: newThisMonth,
          icon: UserPlus,
          tone: "sky",
          hint: "Accounts created since the 1st",
          loading: users.loading
        }
      ),
      /* @__PURE__ */ jsx(
        StatCard,
        {
          label: "Active this week",
          value: activeThisWeek,
          icon: Activity,
          tone: "violet",
          hint: "Signed in within 7 days",
          loading: users.loading
        }
      ),
      /* @__PURE__ */ jsx(
        StatCard,
        {
          label: "Administrators",
          value: counts.admin,
          icon: ShieldCheck,
          tone: "amber",
          hint: "With console access",
          loading: users.loading
        }
      )
    ] }),
    /* @__PURE__ */ jsx(
      DataTable,
      {
        rows: filtered,
        columns,
        rowKey: (u) => u.id,
        loading: users.loading,
        error: users.error,
        onRowClick: setSelected,
        searchable: (u) => `${u.name} ${u.email} ${u.role}`,
        searchPlaceholder: "Search name or email…",
        filters: {
          value: roleFilter,
          onChange: set.setFilter,
          options: [
            { value: "all", label: "All", count: counts.all },
            { value: "investor", label: "Investors", count: counts.investor },
            { value: "admin", label: "Admins", count: counts.admin }
          ]
        },
        toolbarAction: /* @__PURE__ */ jsxs(
          Button,
          {
            variant: "outline",
            className: "rounded-xl border-slate-200",
            onClick: () => exportCsv(filtered),
            disabled: filtered.length === 0,
            children: [
              /* @__PURE__ */ jsx(Download, { className: "h-4 w-4" }),
              " Export"
            ]
          }
        ),
        bulkActions: [
          {
            label: "Export selected",
            icon: /* @__PURE__ */ jsx(Download, { className: "h-3.5 w-3.5" }),
            onClick: exportCsv
          },
          {
            label: "Delete",
            icon: /* @__PURE__ */ jsx(Trash2, { className: "h-3.5 w-3.5" }),
            tone: "danger",
            // Your own account cannot be deleted server-side, so it is filtered
            // out of the request rather than being sent and rejected.
            onClick: (rows) => setPendingDelete(rows.filter((u) => u.id !== (currentUser == null ? void 0 : currentUser.id)))
          }
        ],
        emptyTitle: "No accounts",
        emptyBody: "Registered users will appear here."
      }
    ),
    selected && /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-50 flex justify-end", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          "aria-label": "Close details",
          onClick: closeDrawer,
          className: "absolute inset-0 bg-slate-950/30 backdrop-blur-sm"
        }
      ),
      /* @__PURE__ */ jsxs("aside", { className: "relative flex h-full w-full max-w-md flex-col overflow-y-auto bg-white shadow-[var(--adm-e3)]", children: [
        /* @__PURE__ */ jsxs("header", { className: "sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-100 bg-white px-6 py-5", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex min-w-0 items-center gap-3", children: [
            /* @__PURE__ */ jsx(Avatar, { name: selected.name, seed: selected.id, size: "lg" }),
            /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsx("p", { className: "truncate font-semibold text-slate-900", children: selected.name }),
              /* @__PURE__ */ jsx("p", { className: "truncate text-sm text-slate-500", children: selected.email })
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: closeDrawer,
              "aria-label": "Close",
              className: "adm-focus rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600",
              children: /* @__PURE__ */ jsx(X, { className: "h-5 w-5" })
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "px-6 py-5", children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-5 grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-[var(--adm-line)] bg-slate-50/60 p-4", children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs font-medium text-slate-500", children: "Invested" }),
              /* @__PURE__ */ jsx("p", { className: "adm-num mt-1 text-lg font-bold text-slate-900", children: formatCurrency((selectedActivity == null ? void 0 : selectedActivity.invested) ?? 0) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-[var(--adm-line)] bg-slate-50/60 p-4", children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs font-medium text-slate-500", children: "Transactions" }),
              /* @__PURE__ */ jsx("p", { className: "adm-num mt-1 text-lg font-bold text-slate-900", children: (selectedActivity == null ? void 0 : selectedActivity.transactions.length) ?? 0 })
            ] })
          ] }),
          /* @__PURE__ */ jsxs(Tabs, { defaultValue: "profile", children: [
            /* @__PURE__ */ jsxs(TabsList, { className: "mb-4 grid w-full grid-cols-3 rounded-xl", children: [
              /* @__PURE__ */ jsx(TabsTrigger, { value: "profile", className: "rounded-lg text-xs", children: "Profile" }),
              /* @__PURE__ */ jsx(TabsTrigger, { value: "investments", className: "rounded-lg text-xs", children: "Investments" }),
              /* @__PURE__ */ jsx(TabsTrigger, { value: "transactions", className: "rounded-lg text-xs", children: "Money" })
            ] }),
            /* @__PURE__ */ jsx(TabsContent, { value: "profile", children: /* @__PURE__ */ jsxs("dl", { className: "divide-y divide-slate-100", children: [
              /* @__PURE__ */ jsx(KeyValue, { label: "Role", icon: ShieldCheck, children: /* @__PURE__ */ jsx(StatusPill, { status: selected.role }) }),
              /* @__PURE__ */ jsx(KeyValue, { label: "Joined", icon: CalendarDays, children: /* @__PURE__ */ jsx("span", { className: "adm-num", children: formatDateTime(selected.createdAt) }) }),
              /* @__PURE__ */ jsx(KeyValue, { label: "Last sign-in", icon: Activity, children: /* @__PURE__ */ jsx("span", { className: "adm-num", children: selected.lastLoginAt ? formatDateTime(selected.lastLoginAt) : "Never" }) }),
              /* @__PURE__ */ jsx(KeyValue, { label: "Account ID", icon: Mail, children: /* @__PURE__ */ jsxs(
                "button",
                {
                  type: "button",
                  onClick: () => copyId(selected.id),
                  className: "adm-focus inline-flex max-w-[13rem] items-center gap-1.5 rounded-md px-1.5 py-0.5 font-mono text-xs text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700",
                  title: "Copy account ID",
                  children: [
                    /* @__PURE__ */ jsx("span", { className: "truncate", children: selected.id }),
                    copied ? /* @__PURE__ */ jsx(Check, { className: "h-3 w-3 shrink-0 text-emerald-600" }) : /* @__PURE__ */ jsx(Copy, { className: "h-3 w-3 shrink-0" })
                  ]
                }
              ) })
            ] }) }),
            /* @__PURE__ */ jsx(TabsContent, { value: "investments", children: !selectedActivity || selectedActivity.investments.length === 0 ? /* @__PURE__ */ jsx(
              EmptyState,
              {
                title: "No investments",
                body: "This account has not backed any project yet.",
                icon: Wallet
              }
            ) : /* @__PURE__ */ jsx("ul", { className: "divide-y divide-slate-100 rounded-xl border border-[var(--adm-line)]", children: selectedActivity.investments.slice(0, 8).map((inv) => {
              var _a2;
              return /* @__PURE__ */ jsxs("li", { className: "flex items-center justify-between gap-3 px-4 py-3", children: [
                /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                  /* @__PURE__ */ jsx("p", { className: "truncate text-sm font-medium text-slate-800", children: ((_a2 = inv.project) == null ? void 0 : _a2.title) ?? "Unknown project" }),
                  /* @__PURE__ */ jsx("p", { className: "adm-num text-xs text-slate-500", children: formatDate$1(inv.investmentDate) })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "shrink-0 text-right", children: [
                  /* @__PURE__ */ jsx("p", { className: "adm-num text-sm font-semibold text-slate-800", children: formatCurrency(inv.amountInvestedMinor) }),
                  /* @__PURE__ */ jsx(StatusPill, { status: inv.status })
                ] })
              ] }, inv.id);
            }) }) }),
            /* @__PURE__ */ jsx(TabsContent, { value: "transactions", children: !selectedActivity || selectedActivity.transactions.length === 0 ? /* @__PURE__ */ jsx(
              EmptyState,
              {
                title: "No transactions",
                body: "No money has moved on this account.",
                icon: Wallet
              }
            ) : /* @__PURE__ */ jsx("ul", { className: "divide-y divide-slate-100 rounded-xl border border-[var(--adm-line)]", children: selectedActivity.transactions.slice(0, 8).map((t) => /* @__PURE__ */ jsxs("li", { className: "flex items-center justify-between gap-3 px-4 py-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsx("p", { className: "truncate text-sm font-medium capitalize text-slate-800", children: t.type.toLowerCase() }),
                /* @__PURE__ */ jsx("p", { className: "adm-num text-xs text-slate-500", children: formatDate$1(t.createdAt) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "shrink-0 text-right", children: [
                /* @__PURE__ */ jsx("p", { className: "adm-num text-sm font-semibold text-slate-800", children: formatCurrency(t.amountMinor) }),
                /* @__PURE__ */ jsx(StatusPill, { status: t.status })
              ] })
            ] }, t.id)) }) })
          ] }),
          selected.id !== (currentUser == null ? void 0 : currentUser.id) && /* @__PURE__ */ jsxs("div", { className: "mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4", children: [
            /* @__PURE__ */ jsxs("p", { className: "flex items-center gap-2 text-sm font-semibold text-rose-900", children: [
              /* @__PURE__ */ jsx(TriangleAlert, { className: "h-4 w-4" }),
              " Danger zone"
            ] }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-rose-700", children: "Deleting removes the account and its investments and transactions." }),
            /* @__PURE__ */ jsxs(
              Button,
              {
                variant: "destructive",
                className: "mt-3 rounded-xl",
                onClick: () => setPendingDelete([selected]),
                children: [
                  /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }),
                  " Delete account"
                ]
              }
            )
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      Dialog,
      {
        open: pendingDelete.length > 0,
        onOpenChange: (open) => !open && setPendingDelete([]),
        children: /* @__PURE__ */ jsxs(DialogContent, { className: "rounded-2xl sm:max-w-md", children: [
          /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: pendingDelete.length === 1 ? `Delete ${pendingDelete[0].name}?` : `Delete ${pendingDelete.length} accounts?` }) }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm leading-relaxed text-slate-600", children: [
            "This permanently removes",
            " ",
            pendingDelete.length === 1 ? "the account" : "these accounts",
            " together with their investments and transactions. This cannot be undone."
          ] }),
          pendingDelete.length > 1 && /* @__PURE__ */ jsx("ul", { className: "max-h-32 overflow-y-auto rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600", children: pendingDelete.map((u) => /* @__PURE__ */ jsxs("li", { className: "truncate py-0.5", children: [
            u.name,
            " · ",
            u.email
          ] }, u.id)) }),
          /* @__PURE__ */ jsxs(DialogFooter, { className: "mt-4 gap-2", children: [
            /* @__PURE__ */ jsx(Button, { variant: "outline", className: "rounded-xl", onClick: () => setPendingDelete([]), children: "Cancel" }),
            /* @__PURE__ */ jsx(
              Button,
              {
                variant: "destructive",
                className: "rounded-xl",
                disabled: deleting,
                onClick: () => void handleDelete(),
                children: deleting ? "Deleting…" : "Delete"
              }
            )
          ] })
        ] })
      }
    )
  ] });
}
function Textarea({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "textarea",
    {
      "data-slot": "textarea",
      className: cn(
        "resize-none border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-input-background px-3 py-2 text-base transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      ),
      ...props
    }
  );
}
function Select({
  ...props
}) {
  return /* @__PURE__ */ jsx(SelectPrimitive.Root, { "data-slot": "select", ...props });
}
function SelectValue({
  ...props
}) {
  return /* @__PURE__ */ jsx(SelectPrimitive.Value, { "data-slot": "select-value", ...props });
}
function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}) {
  return /* @__PURE__ */ jsxs(
    SelectPrimitive.Trigger,
    {
      "data-slot": "select-trigger",
      "data-size": size,
      className: cn(
        "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-full items-center justify-between gap-2 rounded-md border bg-input-background px-3 py-2 text-sm whitespace-nowrap transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      ),
      ...props,
      children: [
        children,
        /* @__PURE__ */ jsx(SelectPrimitive.Icon, { asChild: true, children: /* @__PURE__ */ jsx(ChevronDownIcon, { className: "size-4 opacity-50" }) })
      ]
    }
  );
}
function SelectContent({
  className,
  children,
  position = "popper",
  ...props
}) {
  return /* @__PURE__ */ jsx(SelectPrimitive.Portal, { children: /* @__PURE__ */ jsxs(
    SelectPrimitive.Content,
    {
      "data-slot": "select-content",
      className: cn(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border shadow-md",
        position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      ),
      position,
      ...props,
      children: [
        /* @__PURE__ */ jsx(SelectScrollUpButton, {}),
        /* @__PURE__ */ jsx(
          SelectPrimitive.Viewport,
          {
            className: cn(
              "p-1",
              position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1"
            ),
            children
          }
        ),
        /* @__PURE__ */ jsx(SelectScrollDownButton, {})
      ]
    }
  ) });
}
function SelectItem({
  className,
  children,
  ...props
}) {
  return /* @__PURE__ */ jsxs(
    SelectPrimitive.Item,
    {
      "data-slot": "select-item",
      className: cn(
        "focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className
      ),
      ...props,
      children: [
        /* @__PURE__ */ jsx("span", { className: "absolute right-2 flex size-3.5 items-center justify-center", children: /* @__PURE__ */ jsx(SelectPrimitive.ItemIndicator, { children: /* @__PURE__ */ jsx(CheckIcon, { className: "size-4" }) }) }),
        /* @__PURE__ */ jsx(SelectPrimitive.ItemText, { children })
      ]
    }
  );
}
function SelectScrollUpButton({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    SelectPrimitive.ScrollUpButton,
    {
      "data-slot": "select-scroll-up-button",
      className: cn(
        "flex cursor-default items-center justify-center py-1",
        className
      ),
      ...props,
      children: /* @__PURE__ */ jsx(ChevronUpIcon, { className: "size-4" })
    }
  );
}
function SelectScrollDownButton({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    SelectPrimitive.ScrollDownButton,
    {
      "data-slot": "select-scroll-down-button",
      className: cn(
        "flex cursor-default items-center justify-center py-1",
        className
      ),
      ...props,
      children: /* @__PURE__ */ jsx(ChevronDownIcon, { className: "size-4" })
    }
  );
}
const STATUSES$1 = ["open", "funded", "active", "closed"];
function defaultFundingDeadline() {
  const d = /* @__PURE__ */ new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
}
const emptyForm$1 = () => ({
  title: "",
  category: "",
  location: "",
  minInvestment: 100,
  totalFunding: 0,
  currentFunding: 0,
  currency: "USD",
  investors: 0,
  projectedROI: 10,
  payoutFrequency: "Quarterly",
  fundingDeadline: defaultFundingDeadline(),
  description: "",
  featuresText: "",
  status: "open"
});
const formFromProject = (p) => ({
  title: p.title,
  category: p.category,
  location: p.location,
  // FormState is in MAJOR units because that is what an operator types. The
  // conversion back to minor units happens once, on submit.
  minInvestment: minorToMajor$1(p.minInvestmentMinor, p.currency),
  totalFunding: minorToMajor$1(p.totalFundingMinor, p.currency),
  currentFunding: minorToMajor$1(p.currentFundingMinor, p.currency),
  currency: p.currency,
  investors: p.investors,
  projectedROI: p.projectedROI,
  payoutFrequency: p.payoutFrequency,
  fundingDeadline: p.fundingDeadline.slice(0, 10),
  description: p.description,
  featuresText: p.features.join("\n"),
  status: p.status
});
const inputClass$2 = "h-11 rounded-xl border-slate-200";
function FormSection({
  title,
  description,
  children
}) {
  return /* @__PURE__ */ jsxs("section", { className: "border-t border-slate-100 pt-5 first:border-0 first:pt-0", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-3", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-slate-900", children: title }),
      description && /* @__PURE__ */ jsx("p", { className: "mt-0.5 text-xs text-slate-500", children: description })
    ] }),
    children
  ] });
}
function CoverImage({ url, className = "" }) {
  const [failed, setFailed] = useState(false);
  if (!url || failed) {
    return /* @__PURE__ */ jsx("div", { className: `flex h-full w-full items-center justify-center bg-slate-100 ${className}`, children: /* @__PURE__ */ jsx(Image, { className: "h-6 w-6 text-slate-300" }) });
  }
  return /* @__PURE__ */ jsx(
    "img",
    {
      src: url,
      alt: "",
      loading: "lazy",
      onError: () => setFailed(true),
      className: `h-full w-full object-cover ${className}`
    }
  );
}
function ProjectCard({
  project,
  onEdit,
  onDelete
}) {
  const cover = resolveMediaUrl(project.imageUrl);
  const overdue = project.status === "open" && new Date(project.fundingDeadline).getTime() < Date.now();
  return /* @__PURE__ */ jsxs("article", { className: "group overflow-hidden rounded-2xl border border-[var(--adm-line)] bg-white shadow-[var(--adm-e1)] transition-shadow hover:shadow-[var(--adm-e2)]", children: [
    /* @__PURE__ */ jsxs("div", { className: "relative h-36 overflow-hidden bg-slate-100", children: [
      /* @__PURE__ */ jsx(CoverImage, { url: cover, className: "transition-transform duration-500 group-hover:scale-[1.03]" }),
      /* @__PURE__ */ jsx("div", { className: "absolute left-3 top-3", children: /* @__PURE__ */ jsx(StatusPill, { status: project.status, className: "bg-white/95 backdrop-blur" }) }),
      overdue && /* @__PURE__ */ jsx("span", { className: "absolute right-3 top-3 rounded-full bg-amber-500 px-2 py-0.5 text-[0.6875rem] font-semibold text-white", children: "Past due" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "p-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsx("h3", { className: "truncate font-semibold text-slate-900", children: project.title }),
          /* @__PURE__ */ jsxs("p", { className: "mt-0.5 flex items-center gap-1 truncate text-xs text-slate-500", children: [
            /* @__PURE__ */ jsx(MapPin, { className: "h-3 w-3 shrink-0" }),
            project.location
          ] })
        ] }),
        /* @__PURE__ */ jsx(Ring, { current: project.currentFundingMinor, total: project.totalFundingMinor, size: 42 })
      ] }),
      /* @__PURE__ */ jsxs("dl", { className: "adm-num mt-3 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-center", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("dt", { className: "text-[0.6875rem] text-slate-400", children: "Raised" }),
          /* @__PURE__ */ jsx("dd", { className: "text-sm font-semibold text-slate-800", children: formatCompact(project.currentFundingMinor) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("dt", { className: "text-[0.6875rem] text-slate-400", children: "Target" }),
          /* @__PURE__ */ jsx("dd", { className: "text-sm font-semibold text-slate-800", children: formatCompact(project.totalFundingMinor) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("dt", { className: "text-[0.6875rem] text-slate-400", children: "ROI" }),
          /* @__PURE__ */ jsxs("dd", { className: "text-sm font-semibold text-emerald-600", children: [
            project.projectedROI,
            "%"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-3", children: [
        /* @__PURE__ */ jsxs("span", { className: "adm-num flex items-center gap-1.5 text-xs text-slate-500", children: [
          /* @__PURE__ */ jsx(Users$1, { className: "h-3.5 w-3.5" }),
          formatNumber(project.investors),
          " investors"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => onEdit(project),
              "aria-label": `Edit ${project.title}`,
              className: "adm-focus rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600",
              children: /* @__PURE__ */ jsx(Pencil, { className: "h-4 w-4" })
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => onDelete(project),
              "aria-label": `Delete ${project.title}`,
              className: "adm-focus rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600",
              children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" })
            }
          )
        ] })
      ] })
    ] })
  ] });
}
function Projects() {
  const { projects, setProjects, refreshAudit } = useAdminData();
  const [state, set] = useTableState();
  const [params, setParams] = useSearchParams();
  const [view, setView] = useState("table");
  const [editing, setEditing] = useState(
    null
  );
  const [form, setForm] = useState(emptyForm$1());
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const [pendingDelete, setPendingDelete] = useState([]);
  const [flash, setFlash] = useState(null);
  const statusFilter = state.filter;
  const filtered = useMemo(
    () => statusFilter === "all" ? projects.data : projects.data.filter((p) => p.status === statusFilter),
    [projects.data, statusFilter]
  );
  const counts = useMemo(() => {
    const base = { all: projects.data.length };
    for (const s of STATUSES$1) base[s] = projects.data.filter((p) => p.status === s).length;
    return base;
  }, [projects.data]);
  const stats = useMemo(() => {
    const raised = projects.data.reduce((sum, p) => sum + p.currentFundingMinor, 0);
    const target = projects.data.reduce((sum, p) => sum + p.totalFundingMinor, 0);
    const investors = projects.data.reduce((sum, p) => sum + p.investors, 0);
    return { raised, target, investors, coverage: target > 0 ? raised / target * 100 : 0 };
  }, [projects.data]);
  const set2 = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const openCreate = () => {
    setForm(emptyForm$1());
    setCoverFile(null);
    setCoverPreview("");
    setGalleryFiles([]);
    setFormError("");
    setEditing({ mode: "create" });
  };
  const openEdit = (project) => {
    setForm(formFromProject(project));
    setCoverFile(null);
    setCoverPreview(resolveMediaUrl(project.imageUrl));
    setGalleryFiles([]);
    setFormError("");
    setEditing({ mode: "edit", project });
  };
  const focusId = params.get("focus");
  const wantsNew = params.get("new");
  useEffect(() => {
    if (!focusId && !wantsNew) return;
    if (wantsNew) {
      openCreate();
    } else if (focusId) {
      const match = projects.data.find((p) => p.id === focusId);
      if (!match) return;
      openEdit(match);
    }
    const next = new URLSearchParams(params);
    next.delete("focus");
    next.delete("new");
    setParams(next, { replace: true });
  }, [focusId, wantsNew, projects.data]);
  useEffect(() => {
    if (!coverFile) return;
    const url = URL.createObjectURL(coverFile);
    setCoverPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [coverFile]);
  const appendFields = (fd, features) => {
    fd.append("title", form.title.trim());
    fd.append("location", form.location.trim());
    fd.append("category", form.category.trim());
    fd.append("minInvestmentMinor", String(majorToMinor$1(form.minInvestment, form.currency)));
    fd.append("totalFundingMinor", String(majorToMinor$1(form.totalFunding, form.currency)));
    fd.append("currentFundingMinor", String(majorToMinor$1(form.currentFunding, form.currency)));
    fd.append("currency", form.currency);
    fd.append("investorsCount", String(form.investors));
    fd.append("projectedROI", String(form.projectedROI));
    fd.append("payoutFrequency", form.payoutFrequency);
    fd.append("fundingDeadline", form.fundingDeadline);
    fd.append("description", form.description.trim() || "—");
    fd.append("features", JSON.stringify(features));
    fd.append("status", form.status);
  };
  const handleSubmit = async () => {
    if (!editing) return;
    setFormError("");
    if (!form.title.trim()) {
      setFormError("Title is required.");
      return;
    }
    if (editing.mode === "create" && !coverFile) {
      setFormError("A primary cover image is required by the server.");
      return;
    }
    const features = form.featuresText.split("\n").map((s) => s.trim()).filter(Boolean);
    setBusy(true);
    if (editing.mode === "create") {
      const fd = new FormData();
      appendFields(fd, features);
      fd.append("timeline", JSON.stringify([{ phase: "Kickoff", status: "upcoming" }]));
      fd.append("image", coverFile);
      galleryFiles.forEach((f) => fd.append("images", f));
      const res2 = await postFormData(PROJECTS_API, fd);
      setBusy(false);
      if (!res2.ok) {
        setFormError(res2.error);
        return;
      }
      setProjects((prev) => [normalizeApiProject(res2.data.project), ...prev]);
      setFlash({ type: "ok", text: `“${form.title.trim()}” created.` });
      setEditing(null);
      void refreshAudit();
      return;
    }
    const id = editing.project.id;
    let res;
    if (coverFile || galleryFiles.length > 0) {
      const fd = new FormData();
      appendFields(fd, features);
      if (coverFile) fd.append("image", coverFile);
      galleryFiles.forEach((f) => fd.append("images", f));
      res = await putFormData(`${PROJECTS_API}/${id}`, fd);
    } else {
      res = await putJson(`${PROJECTS_API}/${id}`, {
        title: form.title.trim(),
        location: form.location.trim(),
        category: form.category.trim(),
        minInvestmentMinor: majorToMinor$1(form.minInvestment, form.currency),
        totalFundingMinor: majorToMinor$1(form.totalFunding, form.currency),
        currentFundingMinor: majorToMinor$1(form.currentFunding, form.currency),
        currency: form.currency,
        investorsCount: form.investors,
        projectedROI: form.projectedROI,
        payoutFrequency: form.payoutFrequency,
        fundingDeadline: form.fundingDeadline,
        description: form.description.trim() || "—",
        features,
        status: form.status
      });
    }
    setBusy(false);
    if (!res.ok) {
      setFormError(res.error);
      return;
    }
    const updated = normalizeApiProject(res.data.project);
    setProjects((prev) => prev.map((p) => p.id === id ? updated : p));
    setFlash({ type: "ok", text: `“${updated.title}” updated.` });
    setEditing(null);
    void refreshAudit();
  };
  const handleDelete = async () => {
    if (pendingDelete.length === 0) return;
    setBusy(true);
    const results = await Promise.allSettled(
      pendingDelete.map((p) => deleteJson(`${PROJECTS_API}/${p.id}`))
    );
    const removed = [];
    let failures = 0;
    results.forEach((result, i) => {
      if (result.status === "fulfilled" && result.value.ok) removed.push(pendingDelete[i].id);
      else failures += 1;
    });
    setBusy(false);
    if (removed.length > 0) {
      const removedSet = new Set(removed);
      setProjects((prev) => prev.filter((p) => !removedSet.has(p.id)));
      void refreshAudit();
    }
    setFlash(
      failures === 0 ? { type: "ok", text: `${removed.length} project${removed.length === 1 ? "" : "s"} deleted.` } : {
        type: "err",
        text: removed.length > 0 ? `Deleted ${removed.length}, but ${failures} could not be removed.` : "None of the selected projects could be deleted."
      }
    );
    setPendingDelete([]);
  };
  const columns = [
    {
      key: "title",
      header: "Project",
      sortValue: (p) => p.title.toLowerCase(),
      cell: (p) => {
        const cover = resolveMediaUrl(p.imageUrl);
        return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("span", { className: "block h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100", children: /* @__PURE__ */ jsx(CoverImage, { url: cover }) }),
          /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsx("p", { className: "truncate font-medium text-slate-800", children: p.title }),
            /* @__PURE__ */ jsx("p", { className: "truncate text-xs text-slate-500", children: p.location })
          ] })
        ] });
      }
    },
    {
      key: "category",
      header: "Category",
      sortValue: (p) => p.category,
      headerClassName: "hidden lg:table-cell",
      className: "hidden lg:table-cell",
      cell: (p) => /* @__PURE__ */ jsx("span", { className: "inline-flex rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium capitalize text-slate-600", children: p.category.replace(/-/g, " ") })
    },
    {
      key: "funding",
      header: "Funding",
      sortValue: (p) => p.totalFundingMinor > 0 ? p.currentFundingMinor / p.totalFundingMinor : 0,
      cell: (p) => /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(FundingBar, { current: p.currentFundingMinor, total: p.totalFundingMinor }),
        /* @__PURE__ */ jsxs("p", { className: "adm-num mt-1 text-xs text-slate-400", children: [
          formatCompact(p.currentFundingMinor),
          " / ",
          formatCompact(p.totalFundingMinor)
        ] })
      ] })
    },
    {
      key: "investors",
      header: "Investors",
      sortValue: (p) => p.investors,
      className: "adm-num text-slate-600 hidden md:table-cell",
      headerClassName: "hidden md:table-cell",
      cell: (p) => formatNumber(p.investors)
    },
    {
      key: "deadline",
      header: "Deadline",
      sortValue: (p) => new Date(p.fundingDeadline).getTime(),
      cell: (p) => {
        const overdue = p.status === "open" && new Date(p.fundingDeadline).getTime() < Date.now();
        return /* @__PURE__ */ jsxs("span", { className: overdue ? "text-sm font-medium text-amber-600" : "text-sm text-slate-600", children: [
          /* @__PURE__ */ jsx("span", { className: "adm-num", children: formatDate$1(p.fundingDeadline) }),
          overdue && /* @__PURE__ */ jsx("span", { className: "block text-xs", children: "past due" })
        ] });
      }
    },
    {
      key: "status",
      header: "Status",
      sortValue: (p) => p.status,
      cell: (p) => /* @__PURE__ */ jsx(StatusPill, { status: p.status })
    },
    {
      key: "actions",
      header: "",
      headerClassName: "text-right",
      className: "text-right",
      cell: (p) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-1", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: (e) => {
              e.stopPropagation();
              openEdit(p);
            },
            "aria-label": `Edit ${p.title}`,
            className: "adm-focus rounded-lg p-2 text-slate-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600",
            children: /* @__PURE__ */ jsx(Pencil, { className: "h-4 w-4" })
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: (e) => {
              e.stopPropagation();
              setPendingDelete([p]);
            },
            "aria-label": `Delete ${p.title}`,
            className: "adm-focus rounded-lg p-2 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600",
            children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" })
          }
        )
      ] })
    }
  ];
  const viewToggle = /* @__PURE__ */ jsx(
    Segmented,
    {
      size: "sm",
      value: view,
      onChange: setView,
      options: [
        { value: "table", label: "Table" },
        { value: "grid", label: "Grid" }
      ]
    }
  );
  const newButton = /* @__PURE__ */ jsxs(Button, { className: "rounded-xl bg-emerald-600 hover:bg-emerald-700", onClick: openCreate, children: [
    /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
    " New project"
  ] });
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      PageHeader,
      {
        title: "Projects",
        description: "Create, edit and retire the land projects investors can back.",
        actions: /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("span", { className: "hidden sm:block", children: viewToggle }),
          newButton
        ] })
      }
    ),
    flash && /* @__PURE__ */ jsx(Flash, { type: flash.type, children: flash.text }),
    /* @__PURE__ */ jsxs("div", { className: "mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4", children: [
      /* @__PURE__ */ jsx(
        StatCard,
        {
          label: "Projects",
          value: counts.all,
          icon: FolderOpen,
          hint: `${counts.open} open · ${counts.funded} funded`,
          loading: projects.loading
        }
      ),
      /* @__PURE__ */ jsx(
        StatCard,
        {
          label: "Capital raised",
          value: formatCurrency(stats.raised),
          icon: CircleDollarSign,
          tone: "sky",
          hint: `of ${formatCompact(stats.target)} targeted`,
          loading: projects.loading
        }
      ),
      /* @__PURE__ */ jsx(
        StatCard,
        {
          label: "Target coverage",
          value: `${stats.coverage.toFixed(0)}%`,
          icon: Target,
          tone: "violet",
          hint: "Raised across all targets",
          loading: projects.loading
        }
      ),
      /* @__PURE__ */ jsx(
        StatCard,
        {
          label: "Investor positions",
          value: formatNumber(stats.investors),
          icon: Users$1,
          tone: "amber",
          hint: "Summed across projects",
          loading: projects.loading
        }
      )
    ] }),
    view === "table" ? /* @__PURE__ */ jsx(
      DataTable,
      {
        rows: filtered,
        columns,
        rowKey: (p) => p.id,
        loading: projects.loading,
        error: projects.error,
        onRowClick: openEdit,
        searchable: (p) => `${p.title} ${p.location} ${p.category} ${p.status}`,
        searchPlaceholder: "Search title, location or category…",
        filters: {
          value: statusFilter,
          onChange: set.setFilter,
          options: [
            { value: "all", label: "All", count: counts.all },
            ...STATUSES$1.map((s) => ({
              value: s,
              label: s[0].toUpperCase() + s.slice(1),
              count: counts[s]
            }))
          ]
        },
        toolbarExtra: /* @__PURE__ */ jsx("span", { className: "sm:hidden", children: viewToggle }),
        bulkActions: [
          {
            label: "Delete",
            icon: /* @__PURE__ */ jsx(Trash2, { className: "h-3.5 w-3.5" }),
            tone: "danger",
            onClick: setPendingDelete
          }
        ],
        emptyTitle: "No projects",
        emptyBody: "Create your first project to open it for investment."
      }
    ) : /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-4 flex flex-wrap items-center gap-1.5", children: [
        [
          { value: "all", label: "All", count: counts.all },
          ...STATUSES$1.map((s) => ({
            value: s,
            label: s[0].toUpperCase() + s.slice(1),
            count: counts[s]
          }))
        ].map((opt) => {
          const active = statusFilter === opt.value;
          return /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              onClick: () => set.setFilter(opt.value),
              className: `adm-focus rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${active ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`,
              children: [
                opt.label,
                /* @__PURE__ */ jsx("span", { className: `adm-num ml-1.5 ${active ? "text-white/60" : "text-slate-400"}`, children: opt.count })
              ]
            },
            opt.value
          );
        }),
        /* @__PURE__ */ jsx("span", { className: "ml-auto sm:hidden", children: viewToggle })
      ] }),
      projects.loading ? /* @__PURE__ */ jsx("div", { className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-3", children: Array.from({ length: 6 }).map((_, i) => /* @__PURE__ */ jsx(Skeleton, { className: "h-72 rounded-2xl" }, i)) }) : filtered.length === 0 ? /* @__PURE__ */ jsx("div", { className: "rounded-2xl border border-[var(--adm-line)] bg-white", children: /* @__PURE__ */ jsx(
        EmptyState,
        {
          title: projects.error ? "Could not load projects" : "No projects",
          body: projects.error || "Create your first project to open it for investment.",
          icon: FolderOpen,
          action: newButton
        }
      ) }) : /* @__PURE__ */ jsx("div", { className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-3", children: filtered.map((p) => /* @__PURE__ */ jsx(
        ProjectCard,
        {
          project: p,
          onEdit: openEdit,
          onDelete: (project) => setPendingDelete([project])
        },
        p.id
      )) })
    ] }),
    /* @__PURE__ */ jsx(Dialog, { open: !!editing, onOpenChange: (open) => !open && setEditing(null), children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-h-[92vh] overflow-y-auto rounded-2xl sm:max-w-3xl", children: [
      /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: (editing == null ? void 0 : editing.mode) === "edit" ? "Edit project" : "New project" }) }),
      formError && /* @__PURE__ */ jsx("p", { className: "rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800", children: formError }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-6 py-2", children: [
        /* @__PURE__ */ jsx(FormSection, { title: "Identity", description: "How the project appears to investors", children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "pf-title", children: "Project title" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "pf-title",
                value: form.title,
                onChange: (e) => set2("title", e.target.value),
                className: inputClass$2
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "pf-category", children: "Category" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "pf-category",
                  value: form.category,
                  onChange: (e) => set2("category", e.target.value),
                  placeholder: "agriculture",
                  className: inputClass$2
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "pf-location", children: "Location" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "pf-location",
                  value: form.location,
                  onChange: (e) => set2("location", e.target.value),
                  placeholder: "Nyeri County, Kenya",
                  className: inputClass$2
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "pf-status", children: "Status" }),
              /* @__PURE__ */ jsxs(Select, { value: form.status, onValueChange: (v) => set2("status", v), children: [
                /* @__PURE__ */ jsx(SelectTrigger, { id: "pf-status", className: "h-11 rounded-xl", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select status" }) }),
                /* @__PURE__ */ jsx(SelectContent, { children: STATUSES$1.map((s) => /* @__PURE__ */ jsx(SelectItem, { value: s, className: "capitalize", children: s }, s)) })
              ] })
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxs(FormSection, { title: "Economics", description: "Targets, returns and payout cadence", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "pf-total", children: "Funding target" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "pf-total",
                  type: "number",
                  value: form.totalFunding,
                  onChange: (e) => set2("totalFunding", Number(e.target.value)),
                  className: inputClass$2
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "pf-current", children: "Raised so far" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "pf-current",
                  type: "number",
                  value: form.currentFunding,
                  onChange: (e) => set2("currentFunding", Number(e.target.value)),
                  className: inputClass$2
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "pf-min", children: "Minimum investment" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "pf-min",
                  type: "number",
                  value: form.minInvestment,
                  onChange: (e) => set2("minInvestment", Number(e.target.value)),
                  className: inputClass$2
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "pf-roi", children: "Projected ROI (%)" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "pf-roi",
                  type: "number",
                  step: "0.1",
                  value: form.projectedROI,
                  onChange: (e) => set2("projectedROI", Number(e.target.value)),
                  className: inputClass$2
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "pf-investors", children: "Investors count" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "pf-investors",
                  type: "number",
                  value: form.investors,
                  onChange: (e) => set2("investors", Number(e.target.value)),
                  className: inputClass$2
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "pf-payout", children: "Payout frequency" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "pf-payout",
                  value: form.payoutFrequency,
                  onChange: (e) => set2("payoutFrequency", e.target.value),
                  className: inputClass$2
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "pf-deadline", children: "Funding deadline" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "pf-deadline",
                  type: "date",
                  value: form.fundingDeadline,
                  onChange: (e) => set2("fundingDeadline", e.target.value),
                  className: inputClass$2
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4 rounded-xl border border-[var(--adm-line)] bg-slate-50/70 p-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-4", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-xs font-medium text-slate-500", children: "Funding progress" }),
                /* @__PURE__ */ jsxs("p", { className: "adm-num mt-0.5 text-sm text-slate-700", children: [
                  formatCurrency(majorToMinor$1(form.currentFunding, form.currency), form.currency),
                  " of",
                  " ",
                  formatCurrency(majorToMinor$1(form.totalFunding, form.currency), form.currency)
                ] })
              ] }),
              /* @__PURE__ */ jsx(Ring, { current: form.currentFunding, total: form.totalFunding, size: 46 })
            ] }),
            form.totalFunding > 0 && form.currentFunding > form.totalFunding && /* @__PURE__ */ jsxs("p", { className: "mt-2 text-xs font-medium text-amber-600", children: [
              "Raised exceeds the target by",
              " ",
              formatCurrency(form.currentFunding - form.totalFunding),
              "."
            ] }),
            fundingPercent(form.currentFunding, form.totalFunding) >= 100 && form.status === "open" && /* @__PURE__ */ jsx("p", { className: "mt-2 text-xs font-medium text-sky-600", children: "This project is fully funded but still marked open." })
          ] })
        ] }),
        /* @__PURE__ */ jsx(FormSection, { title: "Media", description: "Cover image and gallery shown on the public site", children: /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-[auto_1fr]", children: [
          /* @__PURE__ */ jsx("div", { className: "h-28 w-40 shrink-0 overflow-hidden rounded-xl border border-[var(--adm-line)] bg-slate-100", children: coverPreview ? /* @__PURE__ */ jsx("img", { src: coverPreview, alt: "", className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsx("div", { className: "flex h-full items-center justify-center", children: /* @__PURE__ */ jsx(Image, { className: "h-6 w-6 text-slate-300" }) }) }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxs(Label, { htmlFor: "pf-cover", children: [
                "Cover image",
                (editing == null ? void 0 : editing.mode) === "create" ? " (required)" : " (optional)"
              ] }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "pf-cover",
                  type: "file",
                  accept: "image/jpeg,image/png,image/gif,image/webp",
                  onChange: (e) => {
                    var _a;
                    return setCoverFile(((_a = e.target.files) == null ? void 0 : _a[0]) ?? null);
                  },
                  className: "h-11 rounded-xl py-2"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "pf-gallery", children: "Gallery images (optional)" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "pf-gallery",
                  type: "file",
                  accept: "image/jpeg,image/png,image/gif,image/webp",
                  multiple: true,
                  onChange: (e) => setGalleryFiles(e.target.files ? Array.from(e.target.files) : []),
                  className: "h-11 rounded-xl py-2"
                }
              ),
              galleryFiles.length > 0 && /* @__PURE__ */ jsxs("p", { className: "text-xs text-slate-500", children: [
                galleryFiles.length,
                " image",
                galleryFiles.length === 1 ? "" : "s",
                " queued."
              ] })
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(FormSection, { title: "Narrative", description: "What investors read on the project page", children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "pf-desc", children: "Description" }),
            /* @__PURE__ */ jsx(
              Textarea,
              {
                id: "pf-desc",
                className: "min-h-[100px] rounded-xl",
                value: form.description,
                onChange: (e) => set2("description", e.target.value)
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "pf-features", children: "Features" }),
            /* @__PURE__ */ jsx(
              Textarea,
              {
                id: "pf-features",
                className: "min-h-[90px] rounded-xl",
                placeholder: "One feature per line",
                value: form.featuresText,
                onChange: (e) => set2("featuresText", e.target.value)
              }
            ),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-400", children: "One per line." })
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs(DialogFooter, { className: "gap-2 border-t border-slate-100 pt-4", children: [
        /* @__PURE__ */ jsx(Button, { variant: "outline", className: "rounded-xl", onClick: () => setEditing(null), children: "Cancel" }),
        /* @__PURE__ */ jsx(
          Button,
          {
            className: "rounded-xl bg-emerald-600 hover:bg-emerald-700",
            disabled: busy,
            onClick: () => void handleSubmit(),
            children: busy ? "Saving…" : (editing == null ? void 0 : editing.mode) === "edit" ? "Save changes" : "Create project"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(Dialog, { open: pendingDelete.length > 0, onOpenChange: (open) => !open && setPendingDelete([]), children: /* @__PURE__ */ jsxs(DialogContent, { className: "rounded-2xl sm:max-w-md", children: [
      /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: pendingDelete.length === 1 ? `Delete “${pendingDelete[0].title}”?` : `Delete ${pendingDelete.length} projects?` }) }),
      /* @__PURE__ */ jsxs("p", { className: "text-sm leading-relaxed text-slate-600", children: [
        "This permanently removes",
        " ",
        pendingDelete.length === 1 ? "the project and its images" : "these projects and their images",
        ". Investors who already backed ",
        pendingDelete.length === 1 ? "it" : "them",
        " will lose the linked record. This cannot be undone."
      ] }),
      pendingDelete.length > 1 && /* @__PURE__ */ jsx("ul", { className: "max-h-32 overflow-y-auto rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600", children: pendingDelete.map((p) => /* @__PURE__ */ jsx("li", { className: "truncate py-0.5", children: p.title }, p.id)) }),
      /* @__PURE__ */ jsxs(DialogFooter, { className: "mt-4 gap-2", children: [
        /* @__PURE__ */ jsx(Button, { variant: "outline", className: "rounded-xl", onClick: () => setPendingDelete([]), children: "Cancel" }),
        /* @__PURE__ */ jsx(
          Button,
          {
            variant: "destructive",
            className: "rounded-xl",
            disabled: busy,
            onClick: () => void handleDelete(),
            children: busy ? "Deleting…" : "Delete"
          }
        )
      ] })
    ] }) })
  ] });
}
const TYPES = ["DEPOSIT", "WITHDRAWAL", "INVESTMENT", "PAYOUT"];
const TYPE_META = {
  DEPOSIT: { icon: ArrowDownLeft, chip: "bg-emerald-50 text-emerald-600", inflow: true },
  WITHDRAWAL: { icon: ArrowUpRight, chip: "bg-rose-50 text-rose-600", inflow: false },
  INVESTMENT: { icon: Coins, chip: "bg-sky-50 text-sky-600", inflow: false },
  PAYOUT: { icon: Wallet, chip: "bg-violet-50 text-violet-600", inflow: true }
};
const STATUSES = ["all", "completed", "pending", "failed"];
function csvEscape(value) {
  const s = String(value ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
const tooltipStyle$1 = {
  borderRadius: 12,
  border: "1px solid #e4e8ee",
  fontSize: 13,
  boxShadow: "0 8px 24px rgb(15 23 42 / 0.10)"
};
function Transactions() {
  const { transactions } = useAdminData();
  const [state, set] = useTableState();
  const [params, setParams] = useSearchParams();
  const [statusFilter, setStatusFilter] = useState("all");
  const typeFilter = state.filter;
  const filtered = useMemo(() => {
    let rows = transactions.data;
    if (typeFilter === "pending") rows = rows.filter((t) => t.status === "pending");
    else if (typeFilter !== "all") rows = rows.filter((t) => t.type === typeFilter);
    if (statusFilter !== "all") rows = rows.filter((t) => t.status === statusFilter);
    return rows;
  }, [transactions.data, typeFilter, statusFilter]);
  const totals = useMemo(() => {
    const completed = transactions.data.filter((t) => t.status === "completed");
    const sum = (type) => completed.filter((t) => t.type === type).reduce((acc, t) => acc + (t.amountMinor || 0), 0);
    const deposits = sum("DEPOSIT");
    const withdrawals = sum("WITHDRAWAL");
    return {
      deposits,
      withdrawals,
      invested: sum("INVESTMENT"),
      payouts: sum("PAYOUT"),
      net: deposits - withdrawals,
      pending: transactions.data.filter((t) => t.status === "pending").length
    };
  }, [transactions.data]);
  const counts = useMemo(() => {
    const base = {
      all: transactions.data.length,
      pending: transactions.data.filter((t) => t.status === "pending").length
    };
    for (const t of TYPES) base[t] = transactions.data.filter((x) => x.type === t).length;
    return base;
  }, [transactions.data]);
  const statusCounts = useMemo(
    () => ({
      all: transactions.data.length,
      completed: transactions.data.filter((t) => t.status === "completed").length,
      pending: transactions.data.filter((t) => t.status === "pending").length,
      failed: transactions.data.filter((t) => t.status === "failed").length
    }),
    [transactions.data]
  );
  const flow = useMemo(
    () => netFlowPerMonth(
      transactions.data.filter((t) => t.status === "completed"),
      (t) => t.createdAt,
      (t) => t.amountMinor,
      (t) => {
        var _a;
        return ((_a = TYPE_META[t.type]) == null ? void 0 : _a.inflow) ? 1 : -1;
      },
      6
    ),
    [transactions.data]
  );
  const flowIsEmpty = flow.every((f) => f.inflow === 0 && f.outflow === 0);
  const exportCsv = (rows) => {
    const header = ["Date", "Name", "Email", "Type", "Amount", "Status"];
    const lines = rows.map(
      (t) => {
        var _a, _b;
        return [
          new Date(t.createdAt).toISOString(),
          ((_a = t.user) == null ? void 0 : _a.name) ?? "",
          ((_b = t.user) == null ? void 0 : _b.email) ?? "",
          t.type,
          t.amountMinor,
          t.status
        ].map(csvEscape).join(",");
      }
    );
    const blob = new Blob([[header.join(","), ...lines].join("\n")], {
      type: "text/csv;charset=utf-8"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fibi-transactions-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1e3);
  };
  useEffect(() => {
    if (params.get("export") !== "1") return;
    const next = new URLSearchParams(params);
    next.delete("export");
    setParams(next, { replace: true });
    if (filtered.length > 0) exportCsv(filtered);
  }, [params]);
  const columns = [
    {
      key: "user",
      header: "Investor",
      sortValue: (t) => {
        var _a;
        return (((_a = t.user) == null ? void 0 : _a.name) ?? "").toLowerCase();
      },
      cell: (t) => {
        var _a, _b, _c;
        return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(Avatar, { name: ((_a = t.user) == null ? void 0 : _a.name) ?? "Unknown", seed: t.userId, size: "sm" }),
          /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsx("p", { className: "truncate font-medium text-slate-800", children: ((_b = t.user) == null ? void 0 : _b.name) ?? "Unknown" }),
            /* @__PURE__ */ jsx("p", { className: "truncate text-xs text-slate-500", children: ((_c = t.user) == null ? void 0 : _c.email) ?? "—" })
          ] })
        ] });
      }
    },
    {
      key: "type",
      header: "Type",
      sortValue: (t) => t.type,
      cell: (t) => {
        const meta = TYPE_META[t.type] ?? { icon: Coins, chip: "bg-slate-100 text-slate-500" };
        return /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-2 text-sm capitalize text-slate-700", children: [
          /* @__PURE__ */ jsx("span", { className: `flex h-7 w-7 items-center justify-center rounded-lg ${meta.chip}`, children: /* @__PURE__ */ jsx(meta.icon, { className: "h-3.5 w-3.5" }) }),
          t.type.toLowerCase()
        ] });
      }
    },
    {
      key: "amount",
      header: "Amount",
      sortValue: (t) => t.amountMinor,
      headerClassName: "text-right",
      className: "text-right",
      cell: (t) => {
        var _a;
        const inflow = ((_a = TYPE_META[t.type]) == null ? void 0 : _a.inflow) ?? false;
        return /* @__PURE__ */ jsxs(
          "span",
          {
            className: `adm-num text-sm font-semibold ${inflow ? "text-emerald-600" : "text-slate-800"}`,
            children: [
              inflow ? "+" : "−",
              formatCurrency(t.amountMinor)
            ]
          }
        );
      }
    },
    {
      key: "date",
      header: "Date",
      sortValue: (t) => new Date(t.createdAt).getTime(),
      className: "adm-num text-slate-600 hidden md:table-cell",
      headerClassName: "hidden md:table-cell",
      cell: (t) => formatDateTime(t.createdAt)
    },
    {
      key: "status",
      header: "Status",
      sortValue: (t) => t.status,
      cell: (t) => /* @__PURE__ */ jsx(StatusPill, { status: t.status })
    }
  ];
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      PageHeader,
      {
        title: "Transactions",
        description: "Every deposit, withdrawal, investment and payout on the platform.",
        actions: /* @__PURE__ */ jsxs(
          Button,
          {
            variant: "outline",
            className: "rounded-xl border-slate-200",
            onClick: () => exportCsv(filtered),
            disabled: filtered.length === 0,
            children: [
              /* @__PURE__ */ jsx(Download, { className: "h-4 w-4" }),
              " Export CSV"
            ]
          }
        )
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4", children: [
      /* @__PURE__ */ jsx(
        StatCard,
        {
          label: "Deposits in",
          value: formatCurrency(totals.deposits),
          icon: ArrowDownLeft,
          hint: "Completed only",
          loading: transactions.loading
        }
      ),
      /* @__PURE__ */ jsx(
        StatCard,
        {
          label: "Withdrawals out",
          value: formatCurrency(totals.withdrawals),
          icon: ArrowUpRight,
          tone: "neutral",
          hint: "Completed only",
          loading: transactions.loading
        }
      ),
      /* @__PURE__ */ jsx(
        StatCard,
        {
          label: "Net position",
          value: formatCurrency(totals.net),
          icon: Scale,
          tone: totals.net >= 0 ? "sky" : "amber",
          hint: "Deposits less withdrawals",
          loading: transactions.loading
        }
      ),
      /* @__PURE__ */ jsx(
        StatCard,
        {
          label: "Pending",
          value: totals.pending,
          icon: Wallet,
          tone: "amber",
          hint: "Awaiting settlement",
          loading: transactions.loading
        }
      )
    ] }),
    /* @__PURE__ */ jsx(
      Panel,
      {
        title: "Monthly cash flow",
        description: "Completed money in and out, by month",
        className: "mb-5",
        children: transactions.loading ? /* @__PURE__ */ jsx(Skeleton, { className: "h-[260px]" }) : flowIsEmpty ? /* @__PURE__ */ jsx(EmptyChart, { message: "No completed transactions have been recorded yet.", height: 260 }) : /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: 260, children: /* @__PURE__ */ jsxs(BarChart, { data: flow, margin: { top: 8, right: 8, bottom: 4, left: 0 }, children: [
          /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#eef1f5", vertical: false }),
          /* @__PURE__ */ jsx(
            XAxis,
            {
              dataKey: "month",
              tick: { fontSize: 12, fill: "#94a3b8" },
              tickLine: false,
              axisLine: { stroke: "#e4e8ee" }
            }
          ),
          /* @__PURE__ */ jsx(
            YAxis,
            {
              tick: { fontSize: 12, fill: "#94a3b8" },
              tickLine: false,
              axisLine: false,
              width: 62,
              tickFormatter: (v) => formatCompact(v)
            }
          ),
          /* @__PURE__ */ jsx(
            Tooltip,
            {
              contentStyle: tooltipStyle$1,
              cursor: { fill: "#f8fafc" },
              formatter: (value, name) => [
                formatCurrency(value),
                name === "inflow" ? "Money in" : "Money out"
              ]
            }
          ),
          /* @__PURE__ */ jsx(
            Legend,
            {
              iconType: "circle",
              wrapperStyle: { fontSize: 12, paddingTop: 8 },
              formatter: (value) => value === "inflow" ? "Money in" : "Money out"
            }
          ),
          /* @__PURE__ */ jsx(Bar, { dataKey: "inflow", fill: "#059669", radius: [6, 6, 0, 0], maxBarSize: 28 }),
          /* @__PURE__ */ jsx(Bar, { dataKey: "outflow", fill: "#cbd5e1", radius: [6, 6, 0, 0], maxBarSize: 28 })
        ] }) })
      }
    ),
    /* @__PURE__ */ jsx(
      DataTable,
      {
        rows: filtered,
        columns,
        rowKey: (t) => t.id,
        loading: transactions.loading,
        error: transactions.error,
        searchable: (t) => {
          var _a, _b;
          return `${((_a = t.user) == null ? void 0 : _a.name) ?? ""} ${((_b = t.user) == null ? void 0 : _b.email) ?? ""} ${t.type} ${t.status}`;
        },
        searchPlaceholder: "Search investor, type or status…",
        filters: {
          value: typeFilter,
          onChange: set.setFilter,
          options: [
            { value: "all", label: "All", count: counts.all },
            ...TYPES.map((t) => ({
              value: t,
              label: t[0] + t.slice(1).toLowerCase(),
              count: counts[t]
            }))
          ]
        },
        toolbarExtra: /* @__PURE__ */ jsx(
          Segmented,
          {
            size: "sm",
            value: statusFilter,
            onChange: setStatusFilter,
            options: STATUSES.map((s) => ({
              value: s,
              label: s === "all" ? "Any status" : s[0].toUpperCase() + s.slice(1),
              count: statusCounts[s]
            }))
          }
        ),
        bulkActions: [
          {
            label: "Export selected",
            icon: /* @__PURE__ */ jsx(Download, { className: "h-3.5 w-3.5" }),
            onClick: exportCsv
          }
        ],
        emptyTitle: "No transactions",
        emptyBody: "Money movement will appear here once investors start transacting."
      }
    )
  ] });
}
const RANGES = [
  { value: 6, label: "6 months" },
  { value: 12, label: "12 months" },
  { value: 24, label: "24 months" }
];
const axisTick = { fontSize: 12, fill: "#94a3b8" };
const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid #e4e8ee",
  fontSize: 13,
  boxShadow: "0 8px 24px rgb(15 23 42 / 0.10)"
};
function Analytics() {
  const { users, projects, transactions, investments } = useAdminData();
  const [months, setMonths] = useState(6);
  const userGrowth = useMemo(
    () => cumulativeCountByMonth(users.data, (u) => u.createdAt, months),
    [users.data, months]
  );
  const signups = useMemo(
    () => countPerMonth(users.data, (u) => u.createdAt, months),
    [users.data, months]
  );
  const completedInvestments = useMemo(
    () => transactions.data.filter((t) => t.type === "INVESTMENT" && t.status === "completed"),
    [transactions.data]
  );
  const capitalGrowth = useMemo(
    () => cumulativeSumByMonth(
      completedInvestments,
      (t) => t.createdAt,
      (t) => t.amountMinor,
      months
    ),
    [completedInvestments, months]
  );
  const velocity = useMemo(
    () => sumPerMonth(
      completedInvestments,
      (t) => t.createdAt,
      (t) => t.amountMinor,
      months
    ),
    [completedInvestments, months]
  );
  const byProject = useMemo(
    () => [...projects.data].filter((p) => p.currentFundingMinor > 0).sort((a, b) => b.currentFundingMinor - a.currentFundingMinor).slice(0, 8),
    [projects.data]
  );
  const byCategory = useMemo(
    () => sumByKey(
      projects.data,
      (p) => p.category,
      (p) => p.currentFundingMinor
    ).filter((d) => d.value > 0),
    [projects.data]
  );
  const categoryTotal = byCategory.reduce((sum, c) => sum + c.value, 0);
  const funnel = useMemo(() => {
    const counts = /* @__PURE__ */ new Map();
    for (const inv of investments.data) {
      counts.set(inv.userId, (counts.get(inv.userId) ?? 0) + 1);
    }
    const invested = counts.size;
    const repeat = [...counts.values()].filter((n) => n > 1).length;
    return [
      { label: "Registered accounts", value: users.data.length, tone: CHART_COLORS[0] },
      { label: "Made an investment", value: invested, tone: CHART_COLORS[1] },
      { label: "Invested more than once", value: repeat, tone: CHART_COLORS[2] }
    ];
  }, [users.data, investments.data]);
  const totalRaised = projects.data.reduce((sum, p) => sum + p.currentFundingMinor, 0);
  const avgInvestment = investments.data.length > 0 ? investments.data.reduce((sum, i) => sum + (i.amountInvestedMinor || 0), 0) / investments.data.length : 0;
  const loading = users.loading || projects.loading || transactions.loading;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      PageHeader,
      {
        title: "Analytics",
        description: "Every series below is derived from record timestamps — nothing here is illustrative.",
        actions: /* @__PURE__ */ jsx(Segmented, { size: "sm", options: RANGES, value: months, onChange: setMonths })
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4", children: [
      /* @__PURE__ */ jsx(
        StatCard,
        {
          label: "Accounts",
          value: formatNumber(users.data.length),
          icon: Users$1,
          series: signups.map((p) => p.value),
          delta: trendDelta(signups),
          hint: "Total registered",
          loading: users.loading
        }
      ),
      /* @__PURE__ */ jsx(
        StatCard,
        {
          label: "Capital raised",
          value: formatCurrency(totalRaised),
          icon: CircleDollarSign,
          tone: "sky",
          series: capitalGrowth.map((p) => p.value),
          hint: "Across all projects",
          loading: projects.loading
        }
      ),
      /* @__PURE__ */ jsx(
        StatCard,
        {
          label: "Investing accounts",
          value: formatNumber(funnel[1].value),
          icon: UserCheck,
          tone: "violet",
          hint: `${funnel[2].value} invested more than once`,
          loading: investments.loading
        }
      ),
      /* @__PURE__ */ jsx(
        StatCard,
        {
          label: "Average investment",
          value: formatCurrency(avgInvestment),
          icon: Activity,
          tone: "amber",
          hint: `${formatNumber(investments.data.length)} positions`,
          loading: investments.loading
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-5 lg:grid-cols-2", children: [
      /* @__PURE__ */ jsx(Panel, { title: "Account growth", description: "Total registered accounts at each month end", children: loading ? /* @__PURE__ */ jsx(Skeleton, { className: "h-[280px]" }) : isEmptySeries(userGrowth) ? /* @__PURE__ */ jsx(EmptyChart, { message: "No accounts have been created yet." }) : /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: 280, children: /* @__PURE__ */ jsxs(AreaChart, { data: userGrowth, margin: { top: 8, right: 12, bottom: 4, left: 0 }, children: [
        /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", { id: "anAccounts", x1: "0", y1: "0", x2: "0", y2: "1", children: [
          /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: CHART_COLORS[0], stopOpacity: 0.26 }),
          /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: CHART_COLORS[0], stopOpacity: 0 })
        ] }) }),
        /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#eef1f5", vertical: false }),
        /* @__PURE__ */ jsx(XAxis, { dataKey: "month", tick: axisTick, tickLine: false, axisLine: { stroke: "#e4e8ee" } }),
        /* @__PURE__ */ jsx(YAxis, { tick: axisTick, tickLine: false, axisLine: false, allowDecimals: false, width: 44 }),
        /* @__PURE__ */ jsx(Tooltip, { contentStyle: tooltipStyle, formatter: (v) => [formatNumber(v), "Accounts"] }),
        /* @__PURE__ */ jsx(
          Area,
          {
            type: "monotone",
            dataKey: "value",
            stroke: CHART_COLORS[0],
            strokeWidth: 2.5,
            fill: "url(#anAccounts)"
          }
        )
      ] }) }) }),
      /* @__PURE__ */ jsx(Panel, { title: "Capital invested", description: "Cumulative completed investment transactions", children: loading ? /* @__PURE__ */ jsx(Skeleton, { className: "h-[280px]" }) : isEmptySeries(capitalGrowth) ? /* @__PURE__ */ jsx(EmptyChart, { message: "No completed investment transactions have been recorded yet." }) : /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: 280, children: /* @__PURE__ */ jsxs(AreaChart, { data: capitalGrowth, margin: { top: 8, right: 12, bottom: 4, left: 0 }, children: [
        /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", { id: "anCapital", x1: "0", y1: "0", x2: "0", y2: "1", children: [
          /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: CHART_COLORS[1], stopOpacity: 0.26 }),
          /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: CHART_COLORS[1], stopOpacity: 0 })
        ] }) }),
        /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#eef1f5", vertical: false }),
        /* @__PURE__ */ jsx(XAxis, { dataKey: "month", tick: axisTick, tickLine: false, axisLine: { stroke: "#e4e8ee" } }),
        /* @__PURE__ */ jsx(
          YAxis,
          {
            tick: axisTick,
            tickLine: false,
            axisLine: false,
            width: 68,
            tickFormatter: (v) => formatCompact(v)
          }
        ),
        /* @__PURE__ */ jsx(Tooltip, { contentStyle: tooltipStyle, formatter: (v) => [formatCurrency(v), "Invested"] }),
        /* @__PURE__ */ jsx(
          Area,
          {
            type: "monotone",
            dataKey: "value",
            stroke: CHART_COLORS[1],
            strokeWidth: 2.5,
            fill: "url(#anCapital)"
          }
        )
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsx(
      Panel,
      {
        title: "Funding velocity",
        description: "Capital invested within each month, rather than the running total",
        className: "mt-5",
        children: loading ? /* @__PURE__ */ jsx(Skeleton, { className: "h-[260px]" }) : isEmptySeries(velocity) ? /* @__PURE__ */ jsx(EmptyChart, { message: "No completed investments to break down by month.", height: 260 }) : /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: 260, children: /* @__PURE__ */ jsxs(BarChart, { data: velocity, margin: { top: 8, right: 12, bottom: 4, left: 0 }, children: [
          /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#eef1f5", vertical: false }),
          /* @__PURE__ */ jsx(XAxis, { dataKey: "month", tick: axisTick, tickLine: false, axisLine: { stroke: "#e4e8ee" } }),
          /* @__PURE__ */ jsx(
            YAxis,
            {
              tick: axisTick,
              tickLine: false,
              axisLine: false,
              width: 68,
              tickFormatter: (v) => formatCompact(v)
            }
          ),
          /* @__PURE__ */ jsx(
            Tooltip,
            {
              contentStyle: tooltipStyle,
              cursor: { fill: "#f8fafc" },
              formatter: (v) => [formatCurrency(v), "Invested this month"]
            }
          ),
          /* @__PURE__ */ jsx(Bar, { dataKey: "value", fill: CHART_COLORS[0], radius: [6, 6, 0, 0], maxBarSize: 40 })
        ] }) })
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "mt-5 grid gap-5 lg:grid-cols-2", children: [
      /* @__PURE__ */ jsx(Panel, { title: "Funding by project", description: "Capital raised per project, highest first", children: loading ? /* @__PURE__ */ jsx("div", { className: "space-y-3", children: Array.from({ length: 6 }).map((_, i) => /* @__PURE__ */ jsx(Skeleton, { className: "h-11" }, i)) }) : byProject.length === 0 ? /* @__PURE__ */ jsx(EmptyChart, { message: "No project has received funding yet.", height: 240 }) : (
        // A table with inline bars rather than a bar chart: project titles
        // are long, and as axis labels they either collided or were
        // truncated past the point of being identifiable.
        /* @__PURE__ */ jsx("ul", { className: "divide-y divide-slate-50", children: byProject.map((p) => /* @__PURE__ */ jsxs("li", { className: "py-3 first:pt-0 last:pb-0", children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-1.5 flex items-baseline justify-between gap-3", children: [
            /* @__PURE__ */ jsx("span", { className: "truncate text-sm font-medium text-slate-800", children: p.title }),
            /* @__PURE__ */ jsx("span", { className: "adm-num shrink-0 text-sm font-semibold text-slate-900", children: formatCompact(p.currentFundingMinor) })
          ] }),
          /* @__PURE__ */ jsx(FundingBar, { current: p.currentFundingMinor, total: p.totalFundingMinor, showLabel: false }),
          /* @__PURE__ */ jsxs("p", { className: "adm-num mt-1 text-xs text-slate-400", children: [
            "of ",
            formatCompact(p.totalFundingMinor),
            " target · ",
            p.location
          ] })
        ] }, p.id)) })
      ) }),
      /* @__PURE__ */ jsx(Panel, { title: "Funding by category", description: "Where capital is concentrated", children: loading ? /* @__PURE__ */ jsx(Skeleton, { className: "h-[280px]" }) : byCategory.length === 0 ? /* @__PURE__ */ jsx(EmptyChart, { message: "No funded projects to break down by category." }) : /* @__PURE__ */ jsxs("div", { className: "grid items-center gap-4 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: 220, children: /* @__PURE__ */ jsxs(PieChart$1, { children: [
          /* @__PURE__ */ jsx(
            Pie,
            {
              data: byCategory,
              dataKey: "value",
              nameKey: "name",
              innerRadius: 54,
              outerRadius: 92,
              paddingAngle: 2,
              children: byCategory.map((_, i) => /* @__PURE__ */ jsx(
                Cell,
                {
                  fill: CHART_COLORS[i % CHART_COLORS.length],
                  stroke: "#fff",
                  strokeWidth: 2
                },
                i
              ))
            }
          ),
          /* @__PURE__ */ jsx(Tooltip, { contentStyle: tooltipStyle, formatter: (v) => formatCurrency(v) })
        ] }) }),
        /* @__PURE__ */ jsx("ul", { className: "divide-y divide-slate-50", children: byCategory.map((c, i) => {
          const pct = categoryTotal > 0 ? c.value / categoryTotal * 100 : 0;
          return /* @__PURE__ */ jsxs("li", { className: "flex items-center gap-2.5 py-2", children: [
            /* @__PURE__ */ jsx(
              "span",
              {
                className: "h-2.5 w-2.5 shrink-0 rounded-full",
                style: { background: CHART_COLORS[i % CHART_COLORS.length] }
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "flex-1 truncate text-sm capitalize text-slate-700", children: c.name.replace(/-/g, " ") }),
            /* @__PURE__ */ jsx("span", { className: "adm-num text-sm font-semibold text-slate-900", children: formatCompact(c.value) }),
            /* @__PURE__ */ jsxs("span", { className: "adm-num w-10 text-right text-xs text-slate-400", children: [
              pct.toFixed(0),
              "%"
            ] })
          ] }, c.name);
        }) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx(
      Panel,
      {
        title: "Investor conversion",
        description: "How far accounts travel from sign-up to repeat investment",
        className: "mt-5",
        children: loading ? /* @__PURE__ */ jsx("div", { className: "space-y-4", children: Array.from({ length: 3 }).map((_, i) => /* @__PURE__ */ jsx(Skeleton, { className: "h-12" }, i)) }) : funnel[0].value === 0 ? /* @__PURE__ */ jsx(EmptyChart, { message: "No accounts have registered yet.", height: 200 }) : /* @__PURE__ */ jsx("ul", { className: "space-y-4", children: funnel.map((stage, i) => {
          const base = funnel[0].value;
          const pct = base > 0 ? stage.value / base * 100 : 0;
          const previous = i === 0 ? null : funnel[i - 1].value;
          const stepPct = previous && previous > 0 ? stage.value / previous * 100 : null;
          return /* @__PURE__ */ jsxs("li", { children: [
            /* @__PURE__ */ jsxs("div", { className: "mb-1.5 flex flex-wrap items-baseline justify-between gap-2", children: [
              /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2 text-sm font-medium text-slate-700", children: [
                i === 2 && /* @__PURE__ */ jsx(Repeat, { className: "h-3.5 w-3.5 text-slate-400" }),
                stage.label
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "adm-num text-sm text-slate-500", children: [
                /* @__PURE__ */ jsx("span", { className: "font-semibold text-slate-900", children: formatNumber(stage.value) }),
                stepPct !== null && /* @__PURE__ */ jsxs("span", { className: "ml-2 text-xs text-slate-400", children: [
                  stepPct.toFixed(0),
                  "% of previous step"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "h-2.5 w-full overflow-hidden rounded-full bg-slate-100", children: /* @__PURE__ */ jsx(
              "div",
              {
                className: "h-full rounded-full transition-all duration-700",
                style: { width: `${Math.max(pct, stage.value > 0 ? 2 : 0)}%`, background: stage.tone }
              }
            ) })
          ] }, stage.label);
        }) })
      }
    )
  ] });
}
const CURRENCY_EXPONENT = {
  USD: 2,
  KES: 2,
  EUR: 2,
  GBP: 2,
  SGD: 2,
  ZAR: 2,
  JPY: 0,
  KRW: 0,
  UGX: 0,
  RWF: 0
};
function exponentFor(currency = "USD") {
  return CURRENCY_EXPONENT[currency.toUpperCase()] ?? 2;
}
function minorToMajor(minorUnits, currency = "USD") {
  return (Number.isFinite(minorUnits) ? minorUnits : 0) / 10 ** exponentFor(currency);
}
function majorToMinor(value, currency = "USD") {
  const major = typeof value === "number" ? value : Number.parseFloat(value);
  if (!Number.isFinite(major)) return 0;
  return Math.round(major * 10 ** exponentFor(currency));
}
function formatMoney(minorUnits, currency = "USD") {
  const major = minorToMajor(minorUnits, currency);
  const hasFraction = Math.abs(major % 1) > Number.EPSILON;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: hasFraction ? 2 : 0
  }).format(major);
}
function Switch({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    SwitchPrimitive.Root,
    {
      "data-slot": "switch",
      className: cn(
        "peer data-[state=checked]:bg-primary data-[state=unchecked]:bg-switch-background focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-input/80 inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className
      ),
      ...props,
      children: /* @__PURE__ */ jsx(
        SwitchPrimitive.Thumb,
        {
          "data-slot": "switch-thumb",
          className: cn(
            "bg-card dark:data-[state=unchecked]:bg-card-foreground dark:data-[state=checked]:bg-primary-foreground pointer-events-none block size-4 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0"
          )
        }
      )
    }
  );
}
function toDraft(plan) {
  return {
    name: plan.name,
    price: String(minorToMajor(plan.monthlyPriceMinor, plan.currency)),
    currency: plan.currency,
    description: plan.description,
    active: plan.active
  };
}
function PlansPanel({ onSaved }) {
  const [plans, setPlans] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingTier, setSavingTier] = useState(null);
  const [flash, setFlash] = useState(null);
  const load = useCallback(async () => {
    setLoading(true);
    const res = await getJson(
      `${MEMBERSHIP_PREFIX}/admin/plans`
    );
    setLoading(false);
    if (!res.ok) {
      setFlash({ type: "err", text: res.error });
      return;
    }
    const rows = res.data.plans ?? [];
    setPlans(rows);
    setDrafts(Object.fromEntries(rows.map((p) => [p.tier, toDraft(p)])));
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  const dirty = (plan) => {
    const d = drafts[plan.tier];
    if (!d) return false;
    return d.name !== plan.name || majorToMinor(d.price, d.currency) !== plan.monthlyPriceMinor || d.currency !== plan.currency || d.description !== plan.description || d.active !== plan.active;
  };
  const save = async (plan) => {
    const d = drafts[plan.tier];
    if (!d) return;
    setSavingTier(plan.tier);
    setFlash(null);
    const res = await putJson(`${MEMBERSHIP_PREFIX}/admin/plans`, {
      tier: plan.tier,
      name: d.name,
      // Money crosses the wire as integer minor units; the operator types major.
      monthlyPriceMinor: majorToMinor(d.price, d.currency),
      currency: d.currency,
      description: d.description,
      active: d.active
    });
    setSavingTier(null);
    if (!res.ok) {
      setFlash({ type: "err", text: res.error });
      return;
    }
    setFlash({ type: "ok", text: `${d.name} plan saved.` });
    await load();
    onSaved == null ? void 0 : onSaved();
  };
  const patch = (tier, next) => setDrafts((prev) => ({ ...prev, [tier]: { ...prev[tier], ...next } }));
  return /* @__PURE__ */ jsxs(
    Panel,
    {
      title: "Plans and pricing",
      description: "What members are charged. Changes take effect on the public pricing page immediately.",
      children: [
        flash && /* @__PURE__ */ jsx(Flash, { type: flash.type, children: flash.text }),
        loading ? /* @__PURE__ */ jsx("div", { className: "space-y-3", children: Array.from({ length: 3 }).map((_, i) => /* @__PURE__ */ jsx("div", { className: "h-24 animate-pulse rounded-xl bg-slate-100" }, i)) }) : plans.length === 0 ? /* @__PURE__ */ jsx(EmptyState, { title: "No plans", body: "Membership plans will appear here once seeded." }) : /* @__PURE__ */ jsx("div", { className: "space-y-3", children: MEMBERSHIP_TIER_ORDER.map((tier) => {
          const plan = plans.find((p) => p.tier === tier);
          if (!plan) return null;
          const d = drafts[tier];
          if (!d) return null;
          const isDirty = dirty(plan);
          return /* @__PURE__ */ jsxs(
            "div",
            {
              className: `rounded-xl border p-4 transition-colors ${d.active ? "border-[var(--adm-line)]" : "border-dashed border-slate-300 bg-slate-50/60"}`,
              children: [
                /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
                  /* @__PURE__ */ jsx("span", { className: "rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600", children: tierLabel(tier) }),
                  /* @__PURE__ */ jsx(
                    Input,
                    {
                      value: d.name,
                      onChange: (e) => patch(tier, { name: e.target.value }),
                      className: "h-9 w-44 rounded-lg",
                      placeholder: "Plan name"
                    }
                  ),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
                    /* @__PURE__ */ jsx(
                      Input,
                      {
                        value: d.currency,
                        onChange: (e) => patch(tier, { currency: e.target.value.toUpperCase() }),
                        className: "h-9 w-20 rounded-lg uppercase",
                        maxLength: 3
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      Input,
                      {
                        value: d.price,
                        onChange: (e) => patch(tier, { price: e.target.value }),
                        inputMode: "decimal",
                        className: "h-9 w-28 rounded-lg text-right",
                        placeholder: "0"
                      }
                    ),
                    /* @__PURE__ */ jsx("span", { className: "text-xs text-slate-500", children: "/mo" })
                  ] }),
                  /* @__PURE__ */ jsxs("label", { className: "ml-auto flex items-center gap-2 text-xs text-slate-600", children: [
                    /* @__PURE__ */ jsx(
                      Switch,
                      {
                        checked: d.active,
                        onCheckedChange: (checked) => patch(tier, { active: checked })
                      }
                    ),
                    d.active ? "Listed" : "Hidden"
                  ] }),
                  /* @__PURE__ */ jsxs(
                    Button,
                    {
                      size: "sm",
                      className: "rounded-xl bg-emerald-600 hover:bg-emerald-700",
                      disabled: !isDirty || savingTier !== null,
                      onClick: () => void save(plan),
                      children: [
                        savingTier === tier ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(Save, { className: "h-4 w-4" }),
                        isDirty ? "Save" : "Saved"
                      ]
                    }
                  )
                ] }),
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    value: d.description,
                    onChange: (e) => patch(tier, { description: e.target.value }),
                    className: "mt-3 h-9 rounded-lg",
                    placeholder: "Short description shown on the pricing card"
                  }
                ),
                /* @__PURE__ */ jsxs("p", { className: "mt-2 text-xs text-slate-400", children: [
                  "Feature list: ",
                  plan.features.length > 0 ? plan.features.join(", ") : "—",
                  " · edit what each tier actually unlocks in the feature access matrix below."
                ] })
              ]
            },
            tier
          );
        }) })
      ]
    }
  );
}
const EMPTY_FORM = {
  title: "",
  description: "",
  startsAt: "",
  endsAt: "",
  location: "",
  minTier: "basic",
  capacity: ""
};
function EventsPanel() {
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [openEventId, setOpenEventId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [flash, setFlash] = useState(null);
  const load = useCallback(async () => {
    setLoading(true);
    const res = await getJson(
      `${MEMBERSHIP_PREFIX}/admin/events`
    );
    setLoading(false);
    if (!res.ok) {
      setFlash({ type: "err", text: res.error });
      return;
    }
    setEvents(res.data.events ?? []);
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  const loadRegistrations = async (eventId) => {
    if (openEventId === eventId) {
      setOpenEventId(null);
      return;
    }
    setOpenEventId(eventId);
    const res = await getJson(
      `${MEMBERSHIP_PREFIX}/admin/event-registrations?eventId=${encodeURIComponent(eventId)}`
    );
    if (res.ok) setRegistrations(res.data.registrations ?? []);
  };
  const create = async () => {
    setBusy(true);
    setFlash(null);
    const res = await postJson(`${MEMBERSHIP_PREFIX}/admin/events`, {
      title: form.title,
      description: form.description || null,
      startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : "",
      endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
      location: form.location || null,
      minTier: form.minTier,
      capacity: form.capacity === "" ? null : Number(form.capacity)
    });
    setBusy(false);
    if (!res.ok) {
      setFlash({ type: "err", text: res.error });
      return;
    }
    setFlash({ type: "ok", text: "Event created." });
    setForm(EMPTY_FORM);
    setCreating(false);
    await load();
  };
  const setTier = async (event, minTier) => {
    setBusy(true);
    const res = await patchJson(`${MEMBERSHIP_PREFIX}/admin/events/${event.id}`, { minTier });
    setBusy(false);
    if (!res.ok) {
      setFlash({ type: "err", text: res.error });
      return;
    }
    await load();
  };
  const cancelEvent = async (event) => {
    setBusy(true);
    const res = await deleteJson(`${MEMBERSHIP_PREFIX}/admin/events/${event.id}`);
    setBusy(false);
    if (!res.ok) {
      setFlash({ type: "err", text: res.error });
      return;
    }
    setFlash({ type: "ok", text: `"${event.title}" cancelled — bookings are kept for the record.` });
    await load();
  };
  const { upcoming, past } = useMemo(() => {
    const now = Date.now();
    return {
      upcoming: events.filter((e) => new Date(e.startsAt).getTime() >= now),
      past: events.filter((e) => new Date(e.startsAt).getTime() < now)
    };
  }, [events]);
  const canCreate = form.title.trim().length > 0 && form.startsAt !== "";
  const renderEvent = (event) => /* @__PURE__ */ jsxs(
    "div",
    {
      className: `rounded-xl border p-4 ${event.active ? "border-[var(--adm-line)]" : "border-dashed border-slate-300 bg-slate-50/60"}`,
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-slate-800", children: event.title }),
              !event.active && /* @__PURE__ */ jsx("span", { className: "rounded-full bg-slate-200 px-2 py-0.5 text-[0.6875rem] font-semibold text-slate-600", children: "Cancelled" })
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "mt-0.5 flex flex-wrap gap-x-4 text-xs text-slate-500", children: [
              /* @__PURE__ */ jsx("span", { children: formatDate$1(event.startsAt) }),
              event.location && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1", children: [
                /* @__PURE__ */ jsx(MapPin, { className: "h-3 w-3" }),
                " ",
                event.location
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1", children: [
                /* @__PURE__ */ jsx(Users$1, { className: "h-3 w-3" }),
                event.registrationCount,
                event.capacity != null ? ` / ${event.capacity}` : "",
                " booked"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs(Select, { value: event.minTier, onValueChange: (v) => void setTier(event, v), children: [
            /* @__PURE__ */ jsx(SelectTrigger, { className: "h-9 w-[140px] rounded-lg text-xs", children: /* @__PURE__ */ jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsx(SelectContent, { children: MEMBERSHIP_TIER_ORDER.map((t) => /* @__PURE__ */ jsxs(SelectItem, { value: t, children: [
              tierLabel(t),
              "+"
            ] }, t)) })
          ] }),
          /* @__PURE__ */ jsx(
            Button,
            {
              size: "sm",
              variant: "outline",
              className: "rounded-xl",
              onClick: () => void loadRegistrations(event.id),
              children: openEventId === event.id ? "Hide" : "Attendees"
            }
          ),
          event.active && /* @__PURE__ */ jsxs(
            Button,
            {
              size: "sm",
              variant: "outline",
              className: "rounded-xl border-rose-200 text-rose-700 hover:bg-rose-50",
              disabled: busy,
              onClick: () => void cancelEvent(event),
              children: [
                /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }),
                " Cancel"
              ]
            }
          )
        ] }),
        openEventId === event.id && /* @__PURE__ */ jsx("div", { className: "mt-3 rounded-lg bg-slate-50 p-3", children: registrations.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500", children: "No bookings yet." }) : /* @__PURE__ */ jsx("ul", { className: "space-y-1.5", children: registrations.map((r) => /* @__PURE__ */ jsxs("li", { className: "flex items-center justify-between gap-3 text-sm", children: [
          /* @__PURE__ */ jsxs("span", { className: "min-w-0 truncate text-slate-700", children: [
            r.user.name,
            " ",
            /* @__PURE__ */ jsxs("span", { className: "text-slate-400", children: [
              "· ",
              r.user.email
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            "span",
            {
              className: `shrink-0 rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold ${r.status === "confirmed" ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"}`,
              children: r.status
            }
          )
        ] }, r.id)) }) })
      ]
    },
    event.id
  );
  return /* @__PURE__ */ jsxs(
    Panel,
    {
      title: "Member events",
      description: "Create events, set the tier that unlocks them, and see who has booked.",
      actions: /* @__PURE__ */ jsxs(
        Button,
        {
          className: "rounded-xl bg-emerald-600 hover:bg-emerald-700",
          onClick: () => setCreating((v) => !v),
          children: [
            /* @__PURE__ */ jsx(CalendarPlus, { className: "h-4 w-4" }),
            creating ? "Close" : "New event"
          ]
        }
      ),
      children: [
        flash && /* @__PURE__ */ jsx(Flash, { type: flash.type, children: flash.text }),
        creating && /* @__PURE__ */ jsxs("div", { className: "mb-5 rounded-xl border border-[var(--adm-line)] bg-slate-50/60 p-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "sm:col-span-2", children: [
              /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Title" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  value: form.title,
                  onChange: (e) => setForm({ ...form, title: e.target.value }),
                  className: "mt-1 h-9 rounded-lg",
                  placeholder: "Founder AMA"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Starts" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  type: "datetime-local",
                  value: form.startsAt,
                  onChange: (e) => setForm({ ...form, startsAt: e.target.value }),
                  className: "mt-1 h-9 rounded-lg"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Ends (optional)" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  type: "datetime-local",
                  value: form.endsAt,
                  onChange: (e) => setForm({ ...form, endsAt: e.target.value }),
                  className: "mt-1 h-9 rounded-lg"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Location" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  value: form.location,
                  onChange: (e) => setForm({ ...form, location: e.target.value }),
                  className: "mt-1 h-9 rounded-lg",
                  placeholder: "Nairobi · Kilimani studio"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Minimum tier" }),
                /* @__PURE__ */ jsxs(
                  Select,
                  {
                    value: form.minTier,
                    onValueChange: (v) => setForm({ ...form, minTier: v }),
                    children: [
                      /* @__PURE__ */ jsx(SelectTrigger, { className: "mt-1 h-9 rounded-lg text-xs", children: /* @__PURE__ */ jsx(SelectValue, {}) }),
                      /* @__PURE__ */ jsx(SelectContent, { children: MEMBERSHIP_TIER_ORDER.map((t) => /* @__PURE__ */ jsx(SelectItem, { value: t, children: tierLabel(t) }, t)) })
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Capacity" }),
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    value: form.capacity,
                    onChange: (e) => setForm({ ...form, capacity: e.target.value }),
                    inputMode: "numeric",
                    className: "mt-1 h-9 rounded-lg",
                    placeholder: "Unlimited"
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "sm:col-span-2", children: [
              /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Description" }),
              /* @__PURE__ */ jsx(
                Textarea,
                {
                  value: form.description,
                  onChange: (e) => setForm({ ...form, description: e.target.value }),
                  className: "mt-1 min-h-[72px] rounded-lg",
                  placeholder: "What happens, who it's for."
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-3 flex gap-2", children: [
            /* @__PURE__ */ jsxs(
              Button,
              {
                className: "rounded-xl bg-emerald-600 hover:bg-emerald-700",
                disabled: !canCreate || busy,
                onClick: () => void create(),
                children: [
                  busy && /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }),
                  " Create event"
                ]
              }
            ),
            /* @__PURE__ */ jsx(Button, { variant: "outline", className: "rounded-xl", onClick: () => setCreating(false), children: "Cancel" })
          ] })
        ] }),
        loading ? /* @__PURE__ */ jsx("div", { className: "space-y-3", children: Array.from({ length: 2 }).map((_, i) => /* @__PURE__ */ jsx("div", { className: "h-20 animate-pulse rounded-xl bg-slate-100" }, i)) }) : events.length === 0 ? /* @__PURE__ */ jsx(
          EmptyState,
          {
            title: "No events yet",
            body: "Create your first member event — it appears on the member hub straight away.",
            icon: CalendarPlus
          }
        ) : /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxs("p", { className: "text-xs font-semibold uppercase tracking-wide text-slate-400", children: [
              "Upcoming (",
              upcoming.length,
              ")"
            ] }),
            upcoming.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500", children: "Nothing scheduled." }) : upcoming.map(renderEvent)
          ] }),
          past.length > 0 && /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxs("p", { className: "text-xs font-semibold uppercase tracking-wide text-slate-400", children: [
              "Past (",
              past.length,
              ")"
            ] }),
            past.map(renderEvent)
          ] })
        ] })
      ]
    }
  );
}
function InvoicesPanel() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true);
    const res = await getJson(
      `${MEMBERSHIP_PREFIX}/admin/invoices`
    );
    setLoading(false);
    if (res.ok) setInvoices(res.data.invoices ?? []);
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  const totals = useMemo(() => {
    const paid = invoices.filter((i) => i.status === "paid");
    const byCurrency = /* @__PURE__ */ new Map();
    for (const inv of paid) {
      byCurrency.set(inv.currency, (byCurrency.get(inv.currency) ?? 0) + inv.amountMinor);
    }
    return {
      collected: [...byCurrency.entries()],
      pending: invoices.filter((i) => i.status === "pending").length
    };
  }, [invoices]);
  const columns = [
    {
      key: "member",
      header: "Member",
      sortValue: (i) => {
        var _a;
        return (((_a = i.user) == null ? void 0 : _a.name) ?? "").toLowerCase();
      },
      cell: (i) => {
        var _a, _b, _c, _d;
        return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(Avatar, { name: ((_a = i.user) == null ? void 0 : _a.name) ?? "Unknown", seed: ((_b = i.user) == null ? void 0 : _b.id) ?? i.id, size: "sm" }),
          /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsx("p", { className: "truncate font-medium text-slate-800", children: ((_c = i.user) == null ? void 0 : _c.name) ?? "Unknown" }),
            /* @__PURE__ */ jsx("p", { className: "truncate text-xs text-slate-500", children: ((_d = i.user) == null ? void 0 : _d.email) ?? "—" })
          ] })
        ] });
      }
    },
    {
      key: "tier",
      header: "Tier",
      sortValue: (i) => i.tier,
      cell: (i) => /* @__PURE__ */ jsx(StatusPill, { status: i.tier })
    },
    {
      key: "amount",
      header: "Amount",
      sortValue: (i) => i.amountMinor,
      className: "adm-num text-right font-medium text-slate-800",
      headerClassName: "text-right",
      cell: (i) => formatMoney(i.amountMinor, i.currency)
    },
    {
      key: "status",
      header: "Status",
      sortValue: (i) => i.status,
      cell: (i) => /* @__PURE__ */ jsx(StatusPill, { status: i.status })
    },
    {
      key: "period",
      header: "Period",
      sortValue: (i) => new Date(i.periodStart).getTime(),
      className: "text-slate-600 hidden md:table-cell",
      headerClassName: "hidden md:table-cell",
      cell: (i) => `${formatDate$1(i.periodStart)} – ${formatDate$1(i.periodEnd)}`
    },
    {
      key: "provider",
      header: "Via",
      sortValue: (i) => {
        var _a;
        return ((_a = i.payment) == null ? void 0 : _a.provider) ?? "";
      },
      className: "text-slate-500 hidden lg:table-cell",
      headerClassName: "hidden lg:table-cell",
      cell: (i) => {
        var _a;
        return ((_a = i.payment) == null ? void 0 : _a.provider) ?? "—";
      }
    }
  ];
  return /* @__PURE__ */ jsx(
    Panel,
    {
      title: "Membership invoices",
      description: totals.collected.length > 0 ? `Collected: ${totals.collected.map(([currency, minor]) => formatMoney(minor, currency)).join(" · ")}${totals.pending > 0 ? ` · ${totals.pending} awaiting payment` : ""}` : "Every membership charge, settled or in flight.",
      padded: false,
      children: !loading && invoices.length === 0 ? /* @__PURE__ */ jsx("div", { className: "p-5", children: /* @__PURE__ */ jsx(
        EmptyState,
        {
          title: "No membership invoices",
          body: "Invoices appear here when an approved member starts checkout.",
          icon: Receipt
        }
      ) }) : /* @__PURE__ */ jsx("div", { className: "p-5 pt-0", children: /* @__PURE__ */ jsx(
        DataTable,
        {
          rows: invoices,
          columns,
          rowKey: (i) => i.id,
          loading,
          searchable: (i) => {
            var _a, _b;
            return `${((_a = i.user) == null ? void 0 : _a.name) ?? ""} ${((_b = i.user) == null ? void 0 : _b.email) ?? ""} ${i.tier} ${i.status}`;
          },
          searchPlaceholder: "Search invoices…",
          emptyTitle: "No invoices",
          emptyBody: "Nothing matches that search."
        }
      ) })
    }
  );
}
const TIER_LABEL = {
  free: "Free",
  basic: "Basic",
  premium: "Premium",
  investor_plus: "Investor Plus"
};
const TABS = [
  { value: "review", label: "Members" },
  { value: "plans", label: "Plans" },
  { value: "events", label: "Events" },
  { value: "invoices", label: "Invoices" }
];
function Memberships() {
  const { refreshMembership, refreshCatalogue } = useMembership();
  const [tab, setTab] = useState("review");
  const { applications: sharedApplications, refreshApplications, refreshAudit } = useAdminData();
  const [state, set] = useTableState();
  const [memberships, setMemberships] = useState([]);
  const [features, setFeatures] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [flash, setFlash] = useState(null);
  const [featuresDirty, setFeaturesDirty] = useState(false);
  const [approveTier, setApproveTier] = useState({});
  const [feedback, setFeedback] = useState({});
  const [comp, setComp] = useState({});
  const tierFilter = state.filter;
  const loadAll = useCallback(async () => {
    setLoading(true);
    setError("");
    const [appsRes, memRes, featRes] = await Promise.all([
      getJson(
        `${MEMBERSHIP_PREFIX}/admin/applications`
      ),
      getJson(
        `${MEMBERSHIP_PREFIX}/admin/memberships`
      ),
      getJson(`${MEMBERSHIP_PREFIX}/admin/features`)
    ]);
    setLoading(false);
    if (appsRes.ok) setApplications(appsRes.data.applications ?? []);
    else setError(appsRes.error);
    if (memRes.ok) setMemberships(memRes.data.memberships ?? []);
    if (featRes.ok) setFeatures(featRes.data.features ?? []);
    setFeaturesDirty(false);
  }, []);
  useEffect(() => {
    void loadAll();
  }, [loadAll]);
  useEffect(() => {
    if (applications.length === 0 && sharedApplications.data.length > 0) {
      setApplications(sharedApplications.data);
    }
  }, [sharedApplications.data]);
  const pending = useMemo(
    () => applications.filter((a) => a.status === "pending"),
    [applications]
  );
  const stats = useMemo(
    () => ({
      total: memberships.length,
      active: memberships.filter((m) => m.status === "active").length,
      paid: memberships.filter((m) => m.tier !== "free").length,
      pending: pending.length
    }),
    [memberships, pending]
  );
  const tierMix = useMemo(
    () => MEMBERSHIP_TIER_ORDER.map((tier, i) => ({
      tier,
      label: TIER_LABEL[tier] ?? tier,
      count: memberships.filter((m) => m.tier === tier).length,
      color: CHART_COLORS[i % CHART_COLORS.length]
    })),
    [memberships]
  );
  const afterWrite = async () => {
    await loadAll();
    await refreshMembership();
    void refreshApplications();
    void refreshAudit();
  };
  const review = async (id, action, tier) => {
    var _a;
    setBusy(true);
    setFlash(null);
    const res = await patchJson(
      `${MEMBERSHIP_PREFIX}/admin/applications/${id}`,
      {
        action,
        ...action === "approve" && tier ? { tier } : {},
        // Approval normally grants entry and leaves the member to pay.
        // Complimentary activates the tier outright, for staff and comps.
        ...action === "approve" && comp[id] ? { complimentary: true } : {},
        ...((_a = feedback[id]) == null ? void 0 : _a.trim()) ? { adminFeedback: feedback[id].trim() } : {}
      }
    );
    setBusy(false);
    if (!res.ok) {
      setFlash({ type: "err", text: res.error });
      return;
    }
    setFlash({
      type: "ok",
      text: action === "approve" ? comp[id] ? "Approved and activated — no charge." : "Approved. The applicant has been emailed to activate and pay." : "Application rejected — the applicant has been emailed."
    });
    setFeedback((prev) => ({ ...prev, [id]: "" }));
    await afterWrite();
  };
  const updateTier = async (userId, tier, status) => {
    setBusy(true);
    setFlash(null);
    const res = await patchJson(`${MEMBERSHIP_PREFIX}/admin/memberships/${userId}`, {
      tier,
      status
    });
    setBusy(false);
    if (!res.ok) {
      setFlash({ type: "err", text: res.error });
      return;
    }
    setFlash({ type: "ok", text: "Membership updated." });
    await afterWrite();
  };
  const saveFeatures = async () => {
    setBusy(true);
    setFlash(null);
    const res = await putJson(`${MEMBERSHIP_PREFIX}/admin/features`, {
      features: features.map((f) => ({ featureKey: f.featureKey, minTier: f.minTier }))
    });
    setBusy(false);
    if (!res.ok) {
      setFlash({ type: "err", text: res.error });
      return;
    }
    setFlash({ type: "ok", text: "Feature access map saved." });
    setFeaturesDirty(false);
    await loadAll();
    void refreshAudit();
  };
  const setMinTier = (featureKey, tier) => {
    setFeatures(
      (prev) => prev.map((f) => f.featureKey === featureKey ? { ...f, minTier: tier } : f)
    );
    setFeaturesDirty(true);
  };
  const filteredMemberships = useMemo(
    () => tierFilter === "all" ? memberships : memberships.filter((m) => m.tier === tierFilter),
    [memberships, tierFilter]
  );
  const memberColumns = [
    {
      key: "user",
      header: "Member",
      sortValue: (m) => {
        var _a;
        return (((_a = m.user) == null ? void 0 : _a.name) ?? "").toLowerCase();
      },
      cell: (m) => {
        var _a, _b, _c;
        return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(Avatar, { name: ((_a = m.user) == null ? void 0 : _a.name) ?? "Unknown", seed: m.userId, size: "sm" }),
          /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsx("p", { className: "truncate font-medium text-slate-800", children: ((_b = m.user) == null ? void 0 : _b.name) ?? "Unknown" }),
            /* @__PURE__ */ jsx("p", { className: "truncate text-xs text-slate-500", children: ((_c = m.user) == null ? void 0 : _c.email) ?? "—" })
          ] })
        ] });
      }
    },
    {
      key: "tier",
      header: "Tier",
      sortValue: (m) => MEMBERSHIP_TIER_ORDER.indexOf(m.tier),
      cell: (m) => /* @__PURE__ */ jsx(StatusPill, { status: m.tier })
    },
    {
      key: "status",
      header: "Status",
      sortValue: (m) => m.status,
      cell: (m) => /* @__PURE__ */ jsx(StatusPill, { status: m.status })
    },
    {
      key: "renewal",
      header: "Renews",
      sortValue: (m) => m.renewalDate ? new Date(m.renewalDate).getTime() : 0,
      className: "adm-num text-slate-600 hidden md:table-cell",
      headerClassName: "hidden md:table-cell",
      cell: (m) => formatDate$1(m.renewalDate)
    },
    {
      key: "change",
      header: "Change tier",
      headerClassName: "text-right",
      className: "text-right",
      cell: (m) => /* @__PURE__ */ jsxs(
        Select,
        {
          value: m.tier,
          onValueChange: (tier) => void updateTier(m.userId, tier, m.status === "none" ? "active" : m.status),
          children: [
            /* @__PURE__ */ jsx(SelectTrigger, { className: "ml-auto h-9 w-[140px] rounded-lg text-xs", children: /* @__PURE__ */ jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsx(SelectContent, { children: MEMBERSHIP_TIER_ORDER.map((t) => /* @__PURE__ */ jsx(SelectItem, { value: t, children: TIER_LABEL[t] ?? t }, t)) })
          ]
        }
      )
    }
  ];
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      PageHeader,
      {
        title: "Memberships",
        description: "Review applications, set tiers, and control which features each tier unlocks."
      }
    ),
    flash && /* @__PURE__ */ jsx(Flash, { type: flash.type, children: flash.text }),
    error && /* @__PURE__ */ jsxs("div", { className: "mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3", children: [
      /* @__PURE__ */ jsx(TriangleAlert, { className: "mt-0.5 h-4 w-4 shrink-0 text-amber-600" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-amber-900", children: error })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4", children: [
      /* @__PURE__ */ jsx(StatCard, { label: "Members", value: stats.total, icon: Users$1, hint: "With a membership record", loading }),
      /* @__PURE__ */ jsx(StatCard, { label: "Active", value: stats.active, icon: BadgeCheck, tone: "sky", hint: "Currently subscribed", loading }),
      /* @__PURE__ */ jsx(StatCard, { label: "Paid tiers", value: stats.paid, icon: Sparkles, tone: "violet", hint: "Above free", loading }),
      /* @__PURE__ */ jsx(StatCard, { label: "Pending review", value: stats.pending, icon: Clock, tone: "amber", hint: "Applications waiting", loading })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mb-5", children: /* @__PURE__ */ jsx(Segmented, { options: TABS, value: tab, onChange: setTab }) }),
    tab === "plans" && /* @__PURE__ */ jsx(PlansPanel, { onSaved: () => void refreshCatalogue() }),
    tab === "events" && /* @__PURE__ */ jsx(EventsPanel, {}),
    tab === "invoices" && /* @__PURE__ */ jsx(InvoicesPanel, {}),
    tab === "review" && stats.total > 0 && /* @__PURE__ */ jsxs(Panel, { title: "Tier distribution", description: "How the member base splits across tiers", className: "mb-5", children: [
      /* @__PURE__ */ jsx("div", { className: "flex h-3 w-full overflow-hidden rounded-full bg-slate-100", children: tierMix.map(
        (t) => t.count === 0 ? null : /* @__PURE__ */ jsx(
          "div",
          {
            className: "h-full transition-all duration-700",
            style: { width: `${t.count / stats.total * 100}%`, background: t.color },
            title: `${t.label}: ${t.count}`
          },
          t.tier
        )
      ) }),
      /* @__PURE__ */ jsx("ul", { className: "mt-3 flex flex-wrap gap-x-5 gap-y-2", children: tierMix.map((t) => /* @__PURE__ */ jsxs("li", { className: "flex items-center gap-2 text-sm", children: [
        /* @__PURE__ */ jsx("span", { className: "h-2.5 w-2.5 rounded-full", style: { background: t.color } }),
        /* @__PURE__ */ jsx("span", { className: "text-slate-600", children: t.label }),
        /* @__PURE__ */ jsx("span", { className: "adm-num font-semibold text-slate-900", children: t.count })
      ] }, t.tier)) })
    ] }),
    tab === "review" && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(
        Panel,
        {
          title: "Pending applications",
          description: pending.length === 0 ? "Nothing waiting on you." : `${pending.length} awaiting review`,
          className: "mb-5",
          children: loading ? /* @__PURE__ */ jsx("div", { className: "space-y-3", children: Array.from({ length: 2 }).map((_, i) => /* @__PURE__ */ jsx("div", { className: "h-32 animate-pulse rounded-xl bg-slate-100" }, i)) }) : pending.length === 0 ? /* @__PURE__ */ jsx(
            EmptyState,
            {
              title: "No applications waiting",
              body: "New membership applications will appear here for review.",
              icon: BadgeCheck
            }
          ) : /* @__PURE__ */ jsx("ul", { className: "space-y-4", children: pending.map((a) => {
            const tier = approveTier[a.id] ?? "basic";
            return /* @__PURE__ */ jsxs("li", { className: "rounded-xl border border-[var(--adm-line)] p-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
                /* @__PURE__ */ jsx(Avatar, { name: a.user.name, seed: a.user.id, size: "sm" }),
                /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                  /* @__PURE__ */ jsx("p", { className: "truncate font-medium text-slate-800", children: a.user.name }),
                  /* @__PURE__ */ jsx("p", { className: "truncate text-xs text-slate-500", children: a.user.email })
                ] }),
                /* @__PURE__ */ jsx("span", { className: "ml-auto text-xs text-slate-400", children: formatRelative(a.createdAt) })
              ] }),
              /* @__PURE__ */ jsx("dl", { className: "mt-4 grid gap-4 text-sm sm:grid-cols-3", children: [
                { label: "Motivation", value: a.motivation },
                { label: "Interests", value: a.interests },
                { label: "Contribution", value: a.communityContribution }
              ].map((field) => /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-slate-50/70 p-3", children: [
                /* @__PURE__ */ jsx("dt", { className: "text-[0.6875rem] font-semibold uppercase tracking-wide text-slate-400", children: field.label }),
                /* @__PURE__ */ jsx("dd", { className: "mt-1 text-slate-600", children: field.value || "—" })
              ] }, field.label)) }),
              /* @__PURE__ */ jsx(
                Textarea,
                {
                  value: feedback[a.id] ?? "",
                  onChange: (e) => setFeedback((prev) => ({ ...prev, [a.id]: e.target.value })),
                  placeholder: "Note to the applicant (emailed with the decision) — optional",
                  className: "mt-4 min-h-[60px] rounded-lg text-sm"
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "mt-3 flex flex-wrap items-center gap-2", children: [
                /* @__PURE__ */ jsxs(
                  Select,
                  {
                    value: tier,
                    onValueChange: (v) => setApproveTier((prev) => ({ ...prev, [a.id]: v })),
                    children: [
                      /* @__PURE__ */ jsx(SelectTrigger, { className: "h-9 w-[150px] rounded-lg text-xs", children: /* @__PURE__ */ jsx(SelectValue, {}) }),
                      /* @__PURE__ */ jsx(SelectContent, { children: MEMBERSHIP_TIER_ORDER.map((t) => /* @__PURE__ */ jsx(SelectItem, { value: t, children: TIER_LABEL[t] ?? t }, t)) })
                    ]
                  }
                ),
                /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 rounded-lg border border-[var(--adm-line)] px-3 py-1.5 text-xs text-slate-600", children: [
                  /* @__PURE__ */ jsx(
                    Switch,
                    {
                      checked: comp[a.id] ?? false,
                      onCheckedChange: (checked) => setComp((prev) => ({ ...prev, [a.id]: checked }))
                    }
                  ),
                  "Complimentary"
                ] }),
                /* @__PURE__ */ jsxs(
                  Button,
                  {
                    size: "sm",
                    className: "rounded-xl bg-emerald-600 hover:bg-emerald-700",
                    disabled: busy,
                    onClick: () => void review(a.id, "approve", tier),
                    children: [
                      /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" }),
                      " Approve"
                    ]
                  }
                ),
                /* @__PURE__ */ jsxs(
                  Button,
                  {
                    size: "sm",
                    variant: "outline",
                    className: "rounded-xl border-rose-200 text-rose-700 hover:bg-rose-50",
                    disabled: busy,
                    onClick: () => void review(a.id, "reject"),
                    children: [
                      /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }),
                      " Reject"
                    ]
                  }
                ),
                /* @__PURE__ */ jsx("p", { className: "ml-auto text-xs text-slate-400", children: comp[a.id] ? `Activates ${tierLabel(tier)} immediately, no charge` : `Approved for ${tierLabel(tier)} — activates when they pay` })
              ] })
            ] }, a.id);
          }) })
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "mb-5", children: /* @__PURE__ */ jsx(
        DataTable,
        {
          rows: filteredMemberships,
          columns: memberColumns,
          rowKey: (m) => m.userId,
          loading,
          searchable: (m) => {
            var _a, _b;
            return `${((_a = m.user) == null ? void 0 : _a.name) ?? ""} ${((_b = m.user) == null ? void 0 : _b.email) ?? ""} ${m.tier} ${m.status}`;
          },
          searchPlaceholder: "Search members…",
          filters: {
            value: tierFilter,
            onChange: set.setFilter,
            options: [
              { value: "all", label: "All", count: memberships.length },
              ...MEMBERSHIP_TIER_ORDER.map((t) => ({
                value: t,
                label: TIER_LABEL[t] ?? t,
                count: memberships.filter((m) => m.tier === t).length
              }))
            ]
          },
          emptyTitle: "No members",
          emptyBody: "Membership records appear once investors apply or are assigned a tier."
        }
      ) }),
      /* @__PURE__ */ jsx(
        Panel,
        {
          title: "Feature access",
          description: "Click a cell to set the minimum tier a feature requires",
          padded: false,
          actions: /* @__PURE__ */ jsx(
            Button,
            {
              className: "rounded-xl bg-emerald-600 hover:bg-emerald-700",
              disabled: busy || !featuresDirty,
              onClick: () => void saveFeatures(),
              children: busy ? "Saving…" : featuresDirty ? "Save changes" : "Saved"
            }
          ),
          children: loading ? /* @__PURE__ */ jsx("div", { className: "space-y-2 p-5", children: Array.from({ length: 4 }).map((_, i) => /* @__PURE__ */ jsx("div", { className: "h-12 animate-pulse rounded-lg bg-slate-100" }, i)) }) : features.length === 0 ? /* @__PURE__ */ jsx(
            EmptyState,
            {
              title: "No feature mappings",
              body: "Feature gates appear here once the platform defines them.",
              icon: Lock
            }
          ) : /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[560px] border-collapse text-sm", children: [
            /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-slate-100 bg-slate-50/70", children: [
              /* @__PURE__ */ jsx("th", { className: "px-5 py-3 text-left text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-slate-500", children: "Feature" }),
              MEMBERSHIP_TIER_ORDER.map((t) => /* @__PURE__ */ jsx(
                "th",
                {
                  className: "px-3 py-3 text-center text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-slate-500",
                  children: TIER_LABEL[t] ?? t
                },
                t
              ))
            ] }) }),
            /* @__PURE__ */ jsx("tbody", { children: features.map((f) => {
              const minIndex = MEMBERSHIP_TIER_ORDER.indexOf(f.minTier);
              return /* @__PURE__ */ jsxs("tr", { className: "border-b border-slate-50 last:border-0", children: [
                /* @__PURE__ */ jsx("td", { className: "px-5 py-3 font-medium capitalize text-slate-700", children: f.featureKey.replace(/[_-]/g, " ") }),
                MEMBERSHIP_TIER_ORDER.map((t, i) => {
                  const included = minIndex >= 0 && i >= minIndex;
                  const isThreshold = i === minIndex;
                  return /* @__PURE__ */ jsx("td", { className: "px-3 py-3 text-center", children: /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => setMinTier(f.featureKey, t),
                      "aria-label": `Require ${TIER_LABEL[t] ?? t} for ${f.featureKey}`,
                      "aria-pressed": isThreshold,
                      title: isThreshold ? `${TIER_LABEL[t] ?? t} is the minimum tier` : `Set minimum tier to ${TIER_LABEL[t] ?? t}`,
                      className: `adm-focus mx-auto flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${isThreshold ? "bg-emerald-600 text-white" : included ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" : "bg-slate-100 text-slate-300 hover:bg-slate-200 hover:text-slate-400"}`,
                      children: included ? /* @__PURE__ */ jsx(Check, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsx(Lock, { className: "h-3 w-3" })
                    }
                  ) }, t);
                })
              ] }, f.featureKey);
            }) })
          ] }) })
        }
      )
    ] })
  ] });
}
const MIN_LENGTH = 8;
const PASSPHRASE_LENGTH = 12;
const MAX_LENGTH = 72;
const BANNED = /* @__PURE__ */ new Set([
  "password",
  "password1",
  "password123",
  "passw0rd",
  "12345678",
  "123456789",
  "1234567890",
  "qwerty123",
  "qwertyuiop",
  "letmein",
  "welcome1",
  "admin123",
  "iloveyou",
  "sunshine",
  "princess",
  "football",
  "baseball",
  "trustno1",
  "starwars",
  "whatever",
  "zaq12wsx",
  "abc12345",
  "monkey123",
  "dragon123",
  "fibi1234",
  "fibipassword",
  "changeme",
  "secret123",
  "test1234"
]);
function validatePassword(password, { email, name } = {}) {
  var _a;
  if (!password) return { ok: false, error: "Password is required" };
  if (password.length < MIN_LENGTH) {
    return { ok: false, error: `Password must be at least ${MIN_LENGTH} characters` };
  }
  if (new Blob([password]).size > MAX_LENGTH) {
    return { ok: false, error: `Password must be at most ${MAX_LENGTH} characters` };
  }
  const lower = password.toLowerCase();
  if (BANNED.has(lower)) {
    return { ok: false, error: "That password is too common. Choose something less predictable." };
  }
  const localPart = email ? email.split("@")[0].toLowerCase() : "";
  if (localPart.length >= 4 && lower.includes(localPart)) {
    return { ok: false, error: "Password must not contain your email address" };
  }
  const firstName = name ? ((_a = name.trim().split(/\s+/)[0]) == null ? void 0 : _a.toLowerCase()) ?? "" : "";
  if (firstName.length >= 4 && lower.includes(firstName)) {
    return { ok: false, error: "Password must not contain your name" };
  }
  if (/^(.)\1+$/.test(password)) {
    return { ok: false, error: "Password must not be a single repeated character" };
  }
  if (password.length >= PASSPHRASE_LENGTH) return { ok: true };
  const classes = (/[a-z]/.test(password) ? 1 : 0) + (/[A-Z]/.test(password) ? 1 : 0) + (/\d/.test(password) ? 1 : 0) + (/[^A-Za-z0-9]/.test(password) ? 1 : 0);
  if (classes < 3) {
    return {
      ok: false,
      error: `Passwords under ${PASSPHRASE_LENGTH} characters need at least three of: lowercase, uppercase, number, symbol.`
    };
  }
  return { ok: true };
}
function policyChecklist(password) {
  const classes = (/[a-z]/.test(password) ? 1 : 0) + (/[A-Z]/.test(password) ? 1 : 0) + (/\d/.test(password) ? 1 : 0) + (/[^A-Za-z0-9]/.test(password) ? 1 : 0);
  return [
    { label: `At least ${MIN_LENGTH} characters`, met: password.length >= MIN_LENGTH },
    {
      label: `3 of lower/upper/number/symbol — or ${PASSPHRASE_LENGTH}+ characters`,
      met: password.length >= PASSPHRASE_LENGTH || classes >= 3
    },
    // Only the banned-list check is possible here; the server additionally
    // rejects reuse of the current password, which the client cannot see.
    { label: "Not a commonly used password", met: password.length > 0 && !BANNED.has(password.toLowerCase()) }
  ];
}
const SECTIONS = [
  { id: "platform", label: "Platform", icon: Store },
  { id: "investment", label: "Investment rules", icon: SlidersHorizontal },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: ShieldCheck },
  { id: "account", label: "Your account", icon: User },
  { id: "activity", label: "Admin activity", icon: History }
];
function Toggle({
  label,
  description,
  checked,
  onChange,
  disabled
}) {
  return /* @__PURE__ */ jsxs("label", { className: "flex cursor-pointer items-start justify-between gap-4 py-3", children: [
    /* @__PURE__ */ jsxs("span", { className: "min-w-0", children: [
      /* @__PURE__ */ jsx("span", { className: "block text-sm font-medium text-slate-700", children: label }),
      description && /* @__PURE__ */ jsx("span", { className: "mt-0.5 block text-xs text-slate-400", children: description })
    ] }),
    /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        role: "switch",
        "aria-checked": checked,
        "aria-label": label,
        disabled,
        onClick: () => onChange(!checked),
        className: `adm-focus relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50 ${checked ? "bg-emerald-600" : "bg-slate-300"}`,
        children: /* @__PURE__ */ jsx(
          "span",
          {
            className: `absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm ring-1 ring-slate-900/5 transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`
          }
        )
      }
    )
  ] });
}
function Field({
  id,
  label,
  hint,
  children
}) {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
    /* @__PURE__ */ jsx(Label, { htmlFor: id, className: "text-sm font-medium text-slate-700", children: label }),
    children,
    hint && /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-400", children: hint })
  ] });
}
const inputClass$1 = "h-11 rounded-xl border-slate-200 bg-white";
function Settings() {
  const { user, refreshUser } = useAuth();
  const { audit, refreshAudit } = useAdminData();
  const [saved, setSaved] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState(null);
  const [activeSection, setActiveSection] = useState("platform");
  const [profileName, setProfileName] = useState("");
  const [profileBusy, setProfileBusy] = useState(false);
  const [pwCurrent, setPwCurrent] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [pwBusy, setPwBusy] = useState(false);
  const [pwFlash, setPwFlash] = useState(null);
  const containerRef = useRef(null);
  const load = useCallback(async () => {
    setLoading(true);
    const res = await getJson(SETTINGS_API);
    setLoading(false);
    if (!res.ok) {
      setFlash({ type: "err", text: res.error || "Failed to load settings." });
      return;
    }
    const { id: _id, ...rest } = res.data.settings;
    setSaved(rest);
    setForm(rest);
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    if (user) setProfileName(user.name);
  }, [user]);
  useEffect(() => {
    if (loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        var _a;
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if ((_a = visible[0]) == null ? void 0 : _a.target.id) setActiveSection(visible[0].target.id);
      },
      { rootMargin: "-88px 0px -66% 0px", threshold: 0 }
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [loading]);
  useEffect(() => {
    var _a;
    if (loading || window.location.hash !== "#activity") return;
    (_a = document.getElementById("activity")) == null ? void 0 : _a.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [loading]);
  const dirty = useMemo(
    () => !!form && !!saved && JSON.stringify(form) !== JSON.stringify(saved),
    [form, saved]
  );
  const set = (key, value) => setForm((prev) => prev ? { ...prev, [key]: value } : prev);
  const handleSave = async () => {
    if (!form) return;
    setFlash(null);
    if (!form.platformName.trim()) {
      setFlash({ type: "err", text: "Platform name is required." });
      return;
    }
    if (form.maxInvestmentMinor > 0 && form.minInvestmentMinor > form.maxInvestmentMinor) {
      setFlash({ type: "err", text: "Minimum investment cannot exceed the maximum." });
      return;
    }
    setSaving(true);
    const res = await putJson(SETTINGS_API, {
      ...form,
      platformName: form.platformName.trim(),
      supportEmail: form.supportEmail.trim(),
      contactPhone: form.contactPhone.trim(),
      currency: form.currency.trim() || "USD"
    });
    setSaving(false);
    if (!res.ok) {
      setFlash({ type: "err", text: res.error });
      return;
    }
    const { id: _id, ...rest } = res.data.settings;
    setSaved(rest);
    setForm(rest);
    setFlash({ type: "ok", text: "Settings saved." });
    void refreshAudit();
  };
  const handleProfileSave = async () => {
    setProfileBusy(true);
    setFlash(null);
    const res = await putJson(`${USERS_PREFIX}/profile`, { name: profileName.trim() });
    setProfileBusy(false);
    if (!res.ok) {
      setFlash({ type: "err", text: res.error });
      return;
    }
    setFlash({ type: "ok", text: "Profile updated." });
    await refreshUser();
  };
  const handlePasswordChange = async () => {
    setPwFlash(null);
    const policy = validatePassword(pwNew, { email: user == null ? void 0 : user.email, name: user == null ? void 0 : user.name });
    if (!policy.ok) {
      setPwFlash({ type: "err", text: policy.error });
      return;
    }
    if (pwNew !== pwConfirm) {
      setPwFlash({ type: "err", text: "New passwords do not match." });
      return;
    }
    setPwBusy(true);
    const res = await putJson(`${USERS_PREFIX}/change-password`, {
      currentPassword: pwCurrent,
      newPassword: pwNew
    });
    setPwBusy(false);
    if (!res.ok) {
      setPwFlash({ type: "err", text: res.error });
      return;
    }
    setPwFlash({ type: "ok", text: "Password updated." });
    setPwCurrent("");
    setPwNew("");
    setPwConfirm("");
  };
  if (loading || !form) {
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(PageHeader, { title: "Settings", description: "Platform configuration and your admin account." }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-5 lg:grid-cols-[220px_1fr]", children: [
        /* @__PURE__ */ jsx(Skeleton, { className: "hidden h-64 lg:block" }),
        /* @__PURE__ */ jsx("div", { className: "space-y-5", children: Array.from({ length: 3 }).map((_, i) => /* @__PURE__ */ jsx(Skeleton, { className: "h-56 rounded-2xl" }, i)) })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Settings", description: "Platform configuration and your admin account." }),
    flash && /* @__PURE__ */ jsx(Flash, { type: flash.type, children: flash.text }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-6 lg:grid-cols-[216px_1fr]", children: [
      /* @__PURE__ */ jsx("nav", { className: "hidden lg:block", children: /* @__PURE__ */ jsx("div", { className: "sticky top-24 space-y-0.5", children: SECTIONS.map((s) => {
        const active = activeSection === s.id;
        return /* @__PURE__ */ jsxs(
          "a",
          {
            href: `#${s.id}`,
            className: `adm-focus flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${active ? "bg-white text-slate-900 shadow-[var(--adm-e1)]" : "text-slate-500 hover:bg-white/60 hover:text-slate-800"}`,
            children: [
              /* @__PURE__ */ jsx(s.icon, { className: `h-4 w-4 ${active ? "text-emerald-600" : "text-slate-400"}` }),
              s.label
            ]
          },
          s.id
        );
      }) }) }),
      /* @__PURE__ */ jsxs("div", { ref: containerRef, className: "min-w-0 space-y-5", children: [
        /* @__PURE__ */ jsx("div", { id: "platform", className: "scroll-mt-24", children: /* @__PURE__ */ jsx(Panel, { title: "Platform", description: "Public identity and support contacts", children: /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsx(Field, { id: "s-name", label: "Platform name", children: /* @__PURE__ */ jsx(
            Input,
            {
              id: "s-name",
              value: form.platformName,
              onChange: (e) => set("platformName", e.target.value),
              className: inputClass$1
            }
          ) }),
          /* @__PURE__ */ jsx(Field, { id: "s-email", label: "Support email", children: /* @__PURE__ */ jsx(
            Input,
            {
              id: "s-email",
              type: "email",
              value: form.supportEmail,
              onChange: (e) => set("supportEmail", e.target.value),
              className: inputClass$1
            }
          ) }),
          /* @__PURE__ */ jsx(Field, { id: "s-phone", label: "Contact phone", children: /* @__PURE__ */ jsx(
            Input,
            {
              id: "s-phone",
              value: form.contactPhone,
              onChange: (e) => set("contactPhone", e.target.value),
              className: inputClass$1
            }
          ) }),
          /* @__PURE__ */ jsx(Field, { id: "s-currency", label: "Currency", hint: "ISO code, e.g. USD or KES.", children: /* @__PURE__ */ jsx(
            Input,
            {
              id: "s-currency",
              value: form.currency,
              onChange: (e) => set("currency", e.target.value.toUpperCase()),
              className: inputClass$1
            }
          ) })
        ] }) }) }),
        /* @__PURE__ */ jsx("div", { id: "investment", className: "scroll-mt-24", children: /* @__PURE__ */ jsx(Panel, { title: "Investment rules", description: "Limits applied to every project", children: /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-3", children: [
          /* @__PURE__ */ jsx(Field, { id: "s-min", label: `Minimum investment (${form.currency})`, children: /* @__PURE__ */ jsx(
            Input,
            {
              id: "s-min",
              type: "number",
              step: "0.01",
              value: minorToMajor$1(form.minInvestmentMinor, form.currency),
              onChange: (e) => set("minInvestmentMinor", majorToMinor$1(e.target.value, form.currency)),
              className: inputClass$1
            }
          ) }),
          /* @__PURE__ */ jsx(Field, { id: "s-max", label: `Maximum investment (${form.currency})`, children: /* @__PURE__ */ jsx(
            Input,
            {
              id: "s-max",
              type: "number",
              step: "0.01",
              value: minorToMajor$1(form.maxInvestmentMinor, form.currency),
              onChange: (e) => set("maxInvestmentMinor", majorToMinor$1(e.target.value, form.currency)),
              className: inputClass$1
            }
          ) }),
          /* @__PURE__ */ jsx(Field, { id: "s-fee", label: "Platform fee (%)", children: /* @__PURE__ */ jsx(
            Input,
            {
              id: "s-fee",
              type: "number",
              step: "0.1",
              value: form.platformFee,
              onChange: (e) => set("platformFee", Number(e.target.value)),
              className: inputClass$1
            }
          ) })
        ] }) }) }),
        /* @__PURE__ */ jsx("div", { id: "payments", className: "scroll-mt-24", children: /* @__PURE__ */ jsx(Panel, { title: "Payments", description: "Control money movement platform-wide", children: /* @__PURE__ */ jsxs("div", { className: "divide-y divide-slate-100", children: [
          /* @__PURE__ */ jsx(
            Toggle,
            {
              label: "Enable deposits",
              description: "Investors can add funds",
              checked: form.depositsEnabled,
              onChange: (v) => set("depositsEnabled", v)
            }
          ),
          /* @__PURE__ */ jsx(
            Toggle,
            {
              label: "Enable withdrawals",
              description: "Investors can cash out",
              checked: form.withdrawalsEnabled,
              onChange: (v) => set("withdrawalsEnabled", v)
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "pt-4", children: /* @__PURE__ */ jsx(Field, { id: "s-txfee", label: "Transaction fee (%)", children: /* @__PURE__ */ jsx(
            Input,
            {
              id: "s-txfee",
              type: "number",
              step: "0.1",
              value: form.transactionFee,
              onChange: (e) => set("transactionFee", Number(e.target.value)),
              className: `${inputClass$1} sm:max-w-xs`
            }
          ) }) })
        ] }) }) }),
        /* @__PURE__ */ jsx("div", { id: "notifications", className: "scroll-mt-24", children: /* @__PURE__ */ jsxs(Panel, { title: "Notifications", description: "Which emails the platform sends", children: [
          /* @__PURE__ */ jsxs("div", { className: "divide-y divide-slate-100", children: [
            /* @__PURE__ */ jsx(
              Toggle,
              {
                label: "Email notifications",
                description: "Master switch for all outbound email",
                checked: form.emailNotifications,
                onChange: (v) => set("emailNotifications", v)
              }
            ),
            /* @__PURE__ */ jsx(
              Toggle,
              {
                label: "Investment confirmations",
                description: "Receipt after each investment",
                checked: form.investmentEmails,
                onChange: (v) => set("investmentEmails", v),
                disabled: !form.emailNotifications
              }
            ),
            /* @__PURE__ */ jsx(
              Toggle,
              {
                label: "Admin alerts",
                description: "Notify admins of platform events",
                checked: form.adminAlerts,
                onChange: (v) => set("adminAlerts", v),
                disabled: !form.emailNotifications
              }
            )
          ] }),
          !form.emailNotifications && /* @__PURE__ */ jsx("p", { className: "mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800", children: "The master switch is off, so no email is sent regardless of the settings below it." })
        ] }) }),
        /* @__PURE__ */ jsx("div", { id: "security", className: "scroll-mt-24", children: /* @__PURE__ */ jsx(Panel, { title: "Security", description: "Session and authentication policy", children: /* @__PURE__ */ jsxs("div", { className: "divide-y divide-slate-100", children: [
          /* @__PURE__ */ jsx(
            Toggle,
            {
              label: "Two-factor authentication",
              description: "Require a second factor for admin sign-in",
              checked: form.twoFactorAuth,
              onChange: (v) => set("twoFactorAuth", v)
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "pt-4", children: /* @__PURE__ */ jsx(
            Field,
            {
              id: "s-timeout",
              label: "Session timeout (minutes)",
              hint: "How long an idle admin session stays valid.",
              children: /* @__PURE__ */ jsx(
                Input,
                {
                  id: "s-timeout",
                  type: "number",
                  value: form.sessionTimeout,
                  onChange: (e) => set("sessionTimeout", Number(e.target.value)),
                  className: `${inputClass$1} sm:max-w-xs`
                }
              )
            }
          ) })
        ] }) }) }),
        /* @__PURE__ */ jsx("div", { id: "account", className: "scroll-mt-24", children: /* @__PURE__ */ jsx(Panel, { title: "Your account", description: "Your own admin profile and password", children: /* @__PURE__ */ jsxs("div", { className: "grid gap-6 lg:grid-cols-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-slate-900", children: "Profile" }),
            /* @__PURE__ */ jsx(Field, { id: "s-profile-name", label: "Display name", children: /* @__PURE__ */ jsx(
              Input,
              {
                id: "s-profile-name",
                value: profileName,
                onChange: (e) => setProfileName(e.target.value),
                className: inputClass$1
              }
            ) }),
            /* @__PURE__ */ jsx(
              Field,
              {
                id: "s-profile-email",
                label: "Email",
                hint: "Your login address cannot be changed here.",
                children: /* @__PURE__ */ jsx(
                  Input,
                  {
                    id: "s-profile-email",
                    value: (user == null ? void 0 : user.email) ?? "",
                    disabled: true,
                    className: `${inputClass$1} bg-slate-50`
                  }
                )
              }
            ),
            /* @__PURE__ */ jsxs(
              Button,
              {
                variant: "outline",
                className: "rounded-xl border-slate-200",
                disabled: profileBusy || !profileName.trim() || profileName.trim() === (user == null ? void 0 : user.name),
                onClick: () => void handleProfileSave(),
                children: [
                  /* @__PURE__ */ jsx(User, { className: "h-4 w-4" }),
                  profileBusy ? "Saving…" : "Update profile"
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-4 border-t border-slate-100 pt-6 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0", children: [
            /* @__PURE__ */ jsxs("h3", { className: "flex items-center gap-2 text-sm font-semibold text-slate-900", children: [
              /* @__PURE__ */ jsx(Lock, { className: "h-4 w-4 text-slate-400" }),
              " Change password"
            ] }),
            pwFlash && /* @__PURE__ */ jsx(
              "p",
              {
                className: `rounded-xl border px-4 py-3 text-sm ${pwFlash.type === "ok" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-800"}`,
                children: pwFlash.text
              }
            ),
            /* @__PURE__ */ jsx(Field, { id: "s-pw-current", label: "Current password", children: /* @__PURE__ */ jsx(
              Input,
              {
                id: "s-pw-current",
                type: "password",
                autoComplete: "current-password",
                value: pwCurrent,
                onChange: (e) => setPwCurrent(e.target.value),
                className: inputClass$1
              }
            ) }),
            /* @__PURE__ */ jsx(Field, { id: "s-pw-new", label: "New password", children: /* @__PURE__ */ jsx(
              Input,
              {
                id: "s-pw-new",
                type: "password",
                autoComplete: "new-password",
                value: pwNew,
                onChange: (e) => setPwNew(e.target.value),
                className: inputClass$1
              }
            ) }),
            /* @__PURE__ */ jsx(Field, { id: "s-pw-confirm", label: "Confirm new password", children: /* @__PURE__ */ jsx(
              Input,
              {
                id: "s-pw-confirm",
                type: "password",
                autoComplete: "new-password",
                value: pwConfirm,
                onChange: (e) => setPwConfirm(e.target.value),
                className: inputClass$1
              }
            ) }),
            /* @__PURE__ */ jsxs(
              Button,
              {
                variant: "outline",
                className: "rounded-xl border-slate-200",
                disabled: pwBusy || !pwCurrent || !pwNew || !pwConfirm,
                onClick: () => void handlePasswordChange(),
                children: [
                  /* @__PURE__ */ jsx(Lock, { className: "h-4 w-4" }),
                  pwBusy ? "Updating…" : "Update password"
                ]
              }
            )
          ] })
        ] }) }) }),
        /* @__PURE__ */ jsx("div", { id: "activity", className: "scroll-mt-24", children: /* @__PURE__ */ jsx(
          Panel,
          {
            title: "Admin activity",
            description: "Every change made through this console, newest first",
            children: /* @__PURE__ */ jsx(
              AuditFeed,
              {
                entries: audit.data,
                loading: audit.loading,
                error: audit.error,
                limit: 30,
                emptyBody: "Deletions, project edits, membership decisions and settings changes are recorded here."
              }
            )
          }
        ) })
      ] })
    ] }),
    dirty && /* @__PURE__ */ jsxs("div", { className: "sticky bottom-4 z-10 mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--adm-line)] bg-slate-900 px-4 py-3 shadow-[var(--adm-e3)]", children: [
      /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-white", children: "You have unsaved changes" }),
      /* @__PURE__ */ jsxs("div", { className: "ml-auto flex items-center gap-2", children: [
        /* @__PURE__ */ jsxs(
          Button,
          {
            variant: "ghost",
            className: "rounded-xl text-slate-300 hover:bg-white/10 hover:text-white",
            disabled: saving,
            onClick: () => saved && setForm(saved),
            children: [
              /* @__PURE__ */ jsx(RotateCcw, { className: "h-4 w-4" }),
              " Discard"
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          Button,
          {
            className: "rounded-xl bg-emerald-600 hover:bg-emerald-700",
            disabled: saving,
            onClick: () => void handleSave(),
            children: [
              /* @__PURE__ */ jsx(Save, { className: "h-4 w-4" }),
              saving ? "Saving…" : "Save changes"
            ]
          }
        )
      ] })
    ] })
  ] });
}
const INSTITUTIONS = [
  "SBM",
  "ABSA",
  "STANCHART",
  "MORGAN_STANLEY",
  "BANK_OF_SINGAPORE",
  "OTHER"
];
const emptyForm = () => ({
  label: "",
  institution: "SBM",
  purpose: "COLLECTION",
  bankName: "",
  accountName: "",
  accountNumber: "",
  swiftCode: "",
  branch: "",
  currency: "USD",
  instructions: "",
  active: true
});
const formFrom = (a) => ({
  label: a.label,
  institution: a.institution,
  purpose: a.purpose,
  bankName: a.bankName,
  accountName: a.accountName,
  accountNumber: a.accountNumber,
  swiftCode: a.swiftCode ?? "",
  branch: a.branch ?? "",
  currency: a.currency,
  instructions: a.instructions ?? "",
  active: a.active
});
const inputClass = "h-11 rounded-xl border-slate-200";
const isCustodyOnly = (institution) => CUSTODY_ONLY_INSTITUTIONS.includes(institution);
function Banking() {
  const { refreshAudit } = useAdminData();
  const [state, set] = useTableState();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [formError, setFormError] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);
  const purposeFilter = state.filter;
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const res = await getJson(BANK_ACCOUNTS_API);
    setLoading(false);
    if (!res.ok) {
      setError(res.error || "Failed to load bank accounts.");
      return;
    }
    setAccounts(res.data.accounts ?? []);
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  const filtered = useMemo(
    () => purposeFilter === "all" ? accounts : accounts.filter((a) => a.purpose === purposeFilter),
    [accounts, purposeFilter]
  );
  const stats = useMemo(() => {
    const collection = accounts.filter((a) => a.purpose === "COLLECTION");
    const activeCollection = collection.filter((a) => a.active);
    return {
      total: accounts.length,
      collection: collection.length,
      custody: accounts.filter((a) => a.purpose === "CUSTODY").length,
      currencies: new Set(activeCollection.map((a) => a.currency)).size
    };
  }, [accounts]);
  const currenciesWithoutCollection = useMemo(() => {
    const configured = new Set(
      accounts.filter((a) => a.purpose === "COLLECTION" && a.active).map((a) => a.currency)
    );
    return [...new Set(accounts.map((a) => a.currency))].filter((c) => !configured.has(c));
  }, [accounts]);
  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const openCreate = () => {
    setForm(emptyForm());
    setFormError("");
    setEditing({ mode: "create" });
  };
  const openEdit = (account) => {
    setForm(formFrom(account));
    setFormError("");
    setEditing({ mode: "edit", account });
  };
  const handleSubmit = async () => {
    if (!editing) return;
    setFormError("");
    for (const [field, label] of [
      ["label", "Label"],
      ["bankName", "Bank name"],
      ["accountName", "Account name"],
      ["accountNumber", "Account number"]
    ]) {
      if (!form[field].trim()) {
        setFormError(`${label} is required.`);
        return;
      }
    }
    if (form.purpose === "COLLECTION" && isCustodyOnly(form.institution)) {
      setFormError(
        `${INSTITUTION_LABEL[form.institution]} is a custody institution — it holds funds but cannot accept investor payments.`
      );
      return;
    }
    setBusy(true);
    const payload = {
      ...form,
      currency: form.currency.trim().toUpperCase(),
      swiftCode: form.swiftCode.trim() || null,
      branch: form.branch.trim() || null,
      instructions: form.instructions.trim() || null
    };
    const res = editing.mode === "create" ? await postJson(BANK_ACCOUNTS_API, payload) : await putJson(`${BANK_ACCOUNTS_API}/${editing.account.id}`, payload);
    setBusy(false);
    if (!res.ok) {
      setFormError(res.error);
      return;
    }
    setFlash({
      type: "ok",
      text: `${payload.label} ${editing.mode === "create" ? "added" : "updated"}.`
    });
    setEditing(null);
    await load();
    void refreshAudit();
  };
  const handleDelete = async () => {
    if (!pendingDelete) return;
    setBusy(true);
    const res = await deleteJson(`${BANK_ACCOUNTS_API}/${pendingDelete.id}`);
    setBusy(false);
    if (!res.ok) {
      setFlash({ type: "err", text: res.error });
      setPendingDelete(null);
      return;
    }
    setFlash({ type: "ok", text: `${pendingDelete.label} deleted.` });
    setPendingDelete(null);
    await load();
    void refreshAudit();
  };
  const columns = [
    {
      key: "label",
      header: "Account",
      sortValue: (a) => a.label.toLowerCase(),
      cell: (a) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx(
          "span",
          {
            className: `flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${a.purpose === "COLLECTION" ? "bg-emerald-50 text-emerald-600" : "bg-violet-50 text-violet-600"}`,
            children: a.purpose === "COLLECTION" ? /* @__PURE__ */ jsx(Wallet, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(ShieldCheck, { className: "h-4 w-4" })
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsx("p", { className: "truncate font-medium text-slate-800", children: a.label }),
          /* @__PURE__ */ jsx("p", { className: "truncate text-xs text-slate-500", children: INSTITUTION_LABEL[a.institution] ?? a.institution })
        ] })
      ] })
    },
    {
      key: "purpose",
      header: "Purpose",
      sortValue: (a) => a.purpose,
      cell: (a) => /* @__PURE__ */ jsx(
        "span",
        {
          className: `inline-flex rounded-lg px-2 py-1 text-xs font-medium capitalize ${a.purpose === "COLLECTION" ? "bg-emerald-50 text-emerald-700" : "bg-violet-50 text-violet-700"}`,
          children: a.purpose.toLowerCase()
        }
      )
    },
    {
      key: "currency",
      header: "Currency",
      sortValue: (a) => a.currency,
      className: "adm-num font-medium text-slate-700",
      cell: (a) => a.currency
    },
    {
      key: "account",
      header: "Details",
      headerClassName: "hidden lg:table-cell",
      className: "hidden lg:table-cell",
      cell: (a) => /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsx("p", { className: "truncate text-sm text-slate-700", children: a.bankName }),
        /* @__PURE__ */ jsxs("p", { className: "adm-num truncate text-xs text-slate-500", children: [
          a.accountNumber,
          a.swiftCode ? ` · ${a.swiftCode}` : ""
        ] })
      ] })
    },
    {
      key: "status",
      header: "Status",
      sortValue: (a) => String(a.active),
      cell: (a) => /* @__PURE__ */ jsx(StatusPill, { status: a.active ? "active" : "closed" })
    },
    {
      key: "added",
      header: "Added",
      sortValue: (a) => new Date(a.createdAt).getTime(),
      headerClassName: "hidden md:table-cell",
      className: "adm-num hidden md:table-cell text-slate-600",
      cell: (a) => formatDate$1(a.createdAt)
    },
    {
      key: "actions",
      header: "",
      headerClassName: "text-right",
      className: "text-right",
      cell: (a) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-1", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: (e) => {
              e.stopPropagation();
              openEdit(a);
            },
            "aria-label": `Edit ${a.label}`,
            className: "adm-focus rounded-lg p-2 text-slate-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600",
            children: /* @__PURE__ */ jsx(Pencil, { className: "h-4 w-4" })
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: (e) => {
              e.stopPropagation();
              setPendingDelete(a);
            },
            "aria-label": `Delete ${a.label}`,
            className: "adm-focus rounded-lg p-2 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600",
            children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" })
          }
        )
      ] })
    }
  ];
  const custodySelected = isCustodyOnly(form.institution);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      PageHeader,
      {
        title: "Banking",
        description: "The accounts behind the platform: where investor money is collected, and where pooled funds are custodied.",
        actions: /* @__PURE__ */ jsxs(Button, { className: "rounded-xl bg-emerald-600 hover:bg-emerald-700", onClick: openCreate, children: [
          /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
          " Add account"
        ] })
      }
    ),
    flash && /* @__PURE__ */ jsx(Flash, { type: flash.type, children: flash.text }),
    error && /* @__PURE__ */ jsxs("div", { className: "mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3", children: [
      /* @__PURE__ */ jsx(TriangleAlert, { className: "mt-0.5 h-4 w-4 shrink-0 text-amber-600" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-amber-900", children: error })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4", children: [
      /* @__PURE__ */ jsx(StatCard, { label: "Accounts", value: stats.total, icon: Landmark, hint: "Across all institutions", loading }),
      /* @__PURE__ */ jsx(StatCard, { label: "Collection", value: stats.collection, icon: Wallet, tone: "sky", hint: "Can receive investor funds", loading }),
      /* @__PURE__ */ jsx(StatCard, { label: "Custody", value: stats.custody, icon: ShieldCheck, tone: "violet", hint: "Hold pooled funds only", loading }),
      /* @__PURE__ */ jsx(
        StatCard,
        {
          label: "Currencies live",
          value: stats.currencies,
          icon: Building2,
          tone: "amber",
          hint: "With an active collection account",
          loading
        }
      )
    ] }),
    !loading && currenciesWithoutCollection.length > 0 && /* @__PURE__ */ jsxs("div", { className: "mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3", children: [
      /* @__PURE__ */ jsx(TriangleAlert, { className: "mt-0.5 h-4 w-4 shrink-0 text-amber-600" }),
      /* @__PURE__ */ jsxs("p", { className: "text-sm text-amber-900", children: [
        "No active collection account for",
        " ",
        /* @__PURE__ */ jsx("span", { className: "font-semibold", children: currenciesWithoutCollection.join(", ") }),
        ". Investors paying in ",
        currenciesWithoutCollection.length === 1 ? "that currency" : "those currencies",
        " ",
        "will not be offered bank transfer."
      ] })
    ] }),
    accounts.length === 0 && !loading && !error ? /* @__PURE__ */ jsx(Panel, { children: /* @__PURE__ */ jsx(
      EmptyState,
      {
        title: "No bank accounts yet",
        body: "Add a collection account so investors can pay by bank transfer, and custody accounts to record where pooled funds are held.",
        icon: Landmark,
        action: /* @__PURE__ */ jsxs(Button, { className: "rounded-xl bg-emerald-600 hover:bg-emerald-700", onClick: openCreate, children: [
          /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
          " Add account"
        ] })
      }
    ) }) : /* @__PURE__ */ jsx(
      DataTable,
      {
        rows: filtered,
        columns,
        rowKey: (a) => a.id,
        loading,
        error,
        onRowClick: openEdit,
        searchable: (a) => `${a.label} ${a.bankName} ${a.accountName} ${a.accountNumber} ${a.currency} ${a.institution}`,
        searchPlaceholder: "Search label, bank or account…",
        filters: {
          value: purposeFilter,
          onChange: set.setFilter,
          options: [
            { value: "all", label: "All", count: accounts.length },
            { value: "COLLECTION", label: "Collection", count: stats.collection },
            { value: "CUSTODY", label: "Custody", count: stats.custody }
          ]
        },
        emptyTitle: "No accounts",
        emptyBody: "Bank accounts will appear here once added."
      }
    ),
    /* @__PURE__ */ jsx(Dialog, { open: !!editing, onOpenChange: (open) => !open && setEditing(null), children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-h-[92vh] overflow-y-auto rounded-2xl sm:max-w-2xl", children: [
      /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: (editing == null ? void 0 : editing.mode) === "edit" ? "Edit bank account" : "Add bank account" }) }),
      formError && /* @__PURE__ */ jsx("p", { className: "rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800", children: formError }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-5 py-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "ba-label", children: "Label" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "ba-label",
                value: form.label,
                onChange: (e) => setField("label", e.target.value),
                placeholder: "SBM Kenya — USD collections",
                className: inputClass
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "ba-currency", children: "Currency" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "ba-currency",
                value: form.currency,
                onChange: (e) => setField("currency", e.target.value.toUpperCase()),
                placeholder: "USD",
                maxLength: 3,
                className: inputClass
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "ba-institution", children: "Institution" }),
            /* @__PURE__ */ jsxs(
              Select,
              {
                value: form.institution,
                onValueChange: (v) => {
                  setField("institution", v);
                  if (isCustodyOnly(v)) setField("purpose", "CUSTODY");
                },
                children: [
                  /* @__PURE__ */ jsx(SelectTrigger, { id: "ba-institution", className: "h-11 rounded-xl", children: /* @__PURE__ */ jsx(SelectValue, {}) }),
                  /* @__PURE__ */ jsx(SelectContent, { children: INSTITUTIONS.map((i) => /* @__PURE__ */ jsx(SelectItem, { value: i, children: INSTITUTION_LABEL[i] }, i)) })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "ba-purpose", children: "Purpose" }),
            /* @__PURE__ */ jsxs(
              Select,
              {
                value: form.purpose,
                onValueChange: (v) => setField("purpose", v),
                disabled: custodySelected,
                children: [
                  /* @__PURE__ */ jsx(SelectTrigger, { id: "ba-purpose", className: "h-11 rounded-xl", children: /* @__PURE__ */ jsx(SelectValue, {}) }),
                  /* @__PURE__ */ jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsx(SelectItem, { value: "COLLECTION", children: "Collection" }),
                    /* @__PURE__ */ jsx(SelectItem, { value: "CUSTODY", children: "Custody" })
                  ] })
                ]
              }
            ),
            custodySelected && /* @__PURE__ */ jsxs("p", { className: "text-xs text-amber-700", children: [
              INSTITUTION_LABEL[form.institution],
              " holds funds but does not accept investor payments, so it can only be a custody account."
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "ba-bank", children: "Bank name" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "ba-bank",
                value: form.bankName,
                onChange: (e) => setField("bankName", e.target.value),
                className: inputClass
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "ba-accname", children: "Account name" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "ba-accname",
                value: form.accountName,
                onChange: (e) => setField("accountName", e.target.value),
                placeholder: "FIBI Investor Trust Account",
                className: inputClass
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "ba-accnum", children: "Account number" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "ba-accnum",
                value: form.accountNumber,
                onChange: (e) => setField("accountNumber", e.target.value),
                className: `${inputClass} adm-num`
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "ba-swift", children: "SWIFT / BIC" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "ba-swift",
                value: form.swiftCode,
                onChange: (e) => setField("swiftCode", e.target.value.toUpperCase()),
                className: `${inputClass} adm-num`
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2 sm:col-span-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "ba-branch", children: "Branch" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "ba-branch",
                value: form.branch,
                onChange: (e) => setField("branch", e.target.value),
                className: inputClass
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "ba-instructions", children: "Transfer instructions" }),
          /* @__PURE__ */ jsx(
            Textarea,
            {
              id: "ba-instructions",
              className: "min-h-[80px] rounded-xl",
              value: form.instructions,
              onChange: (e) => setField("instructions", e.target.value),
              placeholder: "Shown to the investor alongside their payment reference. Leave blank for the default."
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-[var(--adm-line)] p-4", children: [
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("span", { className: "block text-sm font-medium text-slate-700", children: "Active" }),
            /* @__PURE__ */ jsx("span", { className: "mt-0.5 block text-xs text-slate-500", children: "Only one collection account per currency can be active at a time." })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              role: "switch",
              "aria-checked": form.active,
              "aria-label": "Active",
              onClick: () => setField("active", !form.active),
              className: `adm-focus relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors ${form.active ? "bg-emerald-600" : "bg-slate-300"}`,
              children: /* @__PURE__ */ jsx(
                "span",
                {
                  className: `absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm ring-1 ring-slate-900/5 transition-transform ${form.active ? "translate-x-5" : "translate-x-0"}`
                }
              )
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs(DialogFooter, { className: "gap-2 border-t border-slate-100 pt-4", children: [
        /* @__PURE__ */ jsx(Button, { variant: "outline", className: "rounded-xl", onClick: () => setEditing(null), children: "Cancel" }),
        /* @__PURE__ */ jsx(
          Button,
          {
            className: "rounded-xl bg-emerald-600 hover:bg-emerald-700",
            disabled: busy,
            onClick: () => void handleSubmit(),
            children: busy ? "Saving…" : (editing == null ? void 0 : editing.mode) === "edit" ? "Save changes" : "Add account"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(Dialog, { open: !!pendingDelete, onOpenChange: (open) => !open && setPendingDelete(null), children: /* @__PURE__ */ jsxs(DialogContent, { className: "rounded-2xl sm:max-w-md", children: [
      /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsxs(DialogTitle, { children: [
        "Delete “",
        pendingDelete == null ? void 0 : pendingDelete.label,
        "”?"
      ] }) }),
      /* @__PURE__ */ jsx("p", { className: "text-sm leading-relaxed text-slate-600", children: (pendingDelete == null ? void 0 : pendingDelete.purpose) === "COLLECTION" ? "Investors will no longer be offered bank transfer in this currency. Payments already awaiting funds keep their reference, but reconciling them will need this account restored." : "This removes the custody record. Holdings reported against it will lose their linked account." }),
      /* @__PURE__ */ jsxs(DialogFooter, { className: "mt-4 gap-2", children: [
        /* @__PURE__ */ jsx(Button, { variant: "outline", className: "rounded-xl", onClick: () => setPendingDelete(null), children: "Cancel" }),
        /* @__PURE__ */ jsx(
          Button,
          {
            variant: "destructive",
            className: "rounded-xl",
            disabled: busy,
            onClick: () => void handleDelete(),
            children: busy ? "Deleting…" : "Delete"
          }
        )
      ] })
    ] }) })
  ] });
}
const EMPTY_SUMMARY = {
  unmatched: 0,
  matched: 0,
  ignored: 0,
  unattributedCredits: 0,
  unattributedAmountMinor: 0
};
function Reconciliation() {
  var _a, _b;
  const { refreshAudit } = useAdminData();
  const [state, set] = useTableState();
  const [lines, setLines] = useState([]);
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [flash, setFlash] = useState(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importAccount, setImportAccount] = useState("");
  const [importFile, setImportFile] = useState(null);
  const [importError, setImportError] = useState("");
  const fileRef = useRef(null);
  const [settling, setSettling] = useState(null);
  const [ignoring, setIgnoring] = useState(null);
  const [ignoreReason, setIgnoreReason] = useState("");
  const statusFilter = state.filter === "all" ? "unmatched" : state.filter;
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const [linesRes, accountsRes] = await Promise.all([
      getJson(`${STATEMENT_LINES_API}?status=${statusFilter}`),
      getJson(BANK_ACCOUNTS_API)
    ]);
    setLoading(false);
    if (!linesRes.ok) {
      setError(linesRes.error || "Failed to load statement lines.");
      return;
    }
    setLines(linesRes.data.lines ?? []);
    setSummary(linesRes.data.summary ?? EMPTY_SUMMARY);
    if (accountsRes.ok) setAccounts(accountsRes.data.accounts ?? []);
  }, [statusFilter]);
  useEffect(() => {
    void load();
  }, [load]);
  const collectionAccounts = useMemo(
    () => accounts.filter((a) => a.purpose === "COLLECTION"),
    [accounts]
  );
  const handleImport = async () => {
    setImportError("");
    if (!importAccount) {
      setImportError("Choose the account this statement belongs to.");
      return;
    }
    if (!importFile) {
      setImportError("Choose a statement file.");
      return;
    }
    setBusy(true);
    const buffer = await importFile.arrayBuffer();
    let binary = "";
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    const contentBase64 = btoa(binary);
    const res = await postJson(STATEMENTS_API, {
      bankAccountId: importAccount,
      filename: importFile.name,
      contentBase64
    });
    setBusy(false);
    if (!res.ok) {
      setImportError(res.error);
      return;
    }
    const { match, statement } = res.data;
    setFlash({
      type: "ok",
      text: `Imported ${statement.lineCount} ${statement.format} lines — ${match.auto} matched automatically, ${match.review} need review, ${match.none} unattributed.`
    });
    setImportOpen(false);
    setImportFile(null);
    if (fileRef.current) fileRef.current.value = "";
    await load();
    void refreshAudit();
  };
  const handleSettle = async () => {
    if (!settling) return;
    setBusy(true);
    const res = await postJson(`${STATEMENT_LINES_API}/${settling.id}/settle`, {});
    setBusy(false);
    if (!res.ok) {
      setFlash({ type: "err", text: res.error });
      setSettling(null);
      return;
    }
    setFlash({ type: "ok", text: "Payment settled and posted to the ledger." });
    setSettling(null);
    await load();
    void refreshAudit();
  };
  const handleIgnore = async () => {
    if (!ignoring) return;
    if (!ignoreReason.trim()) return;
    setBusy(true);
    const res = await postJson(`${STATEMENT_LINES_API}/${ignoring.id}/ignore`, {
      reason: ignoreReason.trim()
    });
    setBusy(false);
    if (!res.ok) {
      setFlash({ type: "err", text: res.error });
      return;
    }
    setFlash({ type: "ok", text: "Line marked as ignored." });
    setIgnoring(null);
    setIgnoreReason("");
    await load();
    void refreshAudit();
  };
  const columns = [
    {
      key: "date",
      header: "Value date",
      sortValue: (l) => new Date(l.valueDate).getTime(),
      className: "adm-num text-slate-600",
      cell: (l) => formatDate$1(l.valueDate)
    },
    {
      key: "detail",
      header: "Statement line",
      cell: (l) => /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsx("p", { className: "truncate font-medium text-slate-800", children: l.reference || l.description || "(no reference)" }),
        /* @__PURE__ */ jsxs("p", { className: "truncate text-xs text-slate-500", children: [
          l.counterparty ? `${l.counterparty} · ` : "",
          l.statement.bankAccount.bankName
        ] })
      ] })
    },
    {
      key: "amount",
      header: "Amount",
      sortValue: (l) => l.amountMinor,
      headerClassName: "text-right",
      className: "text-right",
      cell: (l) => {
        const credit = l.amountMinor > 0;
        return /* @__PURE__ */ jsxs(
          "span",
          {
            className: `adm-num inline-flex items-center gap-1 text-sm font-semibold ${credit ? "text-emerald-600" : "text-slate-500"}`,
            children: [
              credit ? /* @__PURE__ */ jsx(ArrowDownLeft, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsx(ArrowUpRight, { className: "h-3.5 w-3.5" }),
              formatCurrency(Math.abs(l.amountMinor), l.currency)
            ]
          }
        );
      }
    },
    {
      key: "suggestion",
      header: "Matched to",
      headerClassName: "hidden lg:table-cell",
      className: "hidden lg:table-cell",
      cell: (l) => {
        var _a2, _b2;
        return l.suggestedPayment ? /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsx("p", { className: "truncate text-sm font-medium text-slate-800", children: ((_a2 = l.suggestedPayment.user) == null ? void 0 : _a2.name) ?? "Unknown investor" }),
          /* @__PURE__ */ jsxs("p", { className: "adm-num truncate text-xs text-slate-500", children: [
            formatCurrency(l.suggestedPayment.amountMinor, l.suggestedPayment.currency),
            " ·",
            " ",
            ((_b2 = l.suggestedPayment.project) == null ? void 0 : _b2.title) ?? "—"
          ] })
        ] }) : /* @__PURE__ */ jsx("span", { className: "text-xs text-slate-400", children: l.matchNote || "No candidate" });
      }
    },
    {
      key: "status",
      header: "Status",
      sortValue: (l) => l.status,
      cell: (l) => /* @__PURE__ */ jsx(StatusPill, { status: l.status === "unmatched" ? "pending" : l.status === "matched" ? "completed" : "closed" })
    },
    {
      key: "actions",
      header: "",
      headerClassName: "text-right",
      className: "text-right",
      cell: (l) => {
        if (l.status !== "unmatched") {
          return /* @__PURE__ */ jsx("span", { className: "text-xs text-slate-400", children: l.matchNote ? "" : "—" });
        }
        const canSettle = l.amountMinor > 0 && !!l.suggestedPayment;
        return /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-1", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              disabled: !canSettle,
              title: canSettle ? "Settle this payment" : "No candidate payment to settle against",
              onClick: (e) => {
                e.stopPropagation();
                setSettling(l);
              },
              className: "adm-focus rounded-lg p-2 text-slate-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600 disabled:pointer-events-none disabled:opacity-30",
              children: /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" })
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: (e) => {
                e.stopPropagation();
                setIgnoring(l);
                setIgnoreReason("");
              },
              title: "Not an investor payment",
              className: "adm-focus rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600",
              children: /* @__PURE__ */ jsx(Ban, { className: "h-4 w-4" })
            }
          )
        ] });
      }
    }
  ];
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      PageHeader,
      {
        title: "Reconciliation",
        description: "Match incoming bank credits to the payments they belong to.",
        actions: /* @__PURE__ */ jsxs(
          Button,
          {
            className: "rounded-xl bg-emerald-600 hover:bg-emerald-700",
            onClick: () => {
              setImportError("");
              setImportOpen(true);
              if (collectionAccounts.length === 1) setImportAccount(collectionAccounts[0].id);
            },
            children: [
              /* @__PURE__ */ jsx(Upload, { className: "h-4 w-4" }),
              " Import statement"
            ]
          }
        )
      }
    ),
    flash && /* @__PURE__ */ jsx(Flash, { type: flash.type, children: flash.text }),
    error && /* @__PURE__ */ jsxs("div", { className: "mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3", children: [
      /* @__PURE__ */ jsx(TriangleAlert, { className: "mt-0.5 h-4 w-4 shrink-0 text-amber-600" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-amber-900", children: error })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4", children: [
      /* @__PURE__ */ jsx(
        StatCard,
        {
          label: "Unattributed credits",
          value: formatCurrency(summary.unattributedAmountMinor),
          icon: CircleHelp,
          tone: summary.unattributedCredits > 0 ? "amber" : "brand",
          hint: `${summary.unattributedCredits} credit${summary.unattributedCredits === 1 ? "" : "s"} unmatched`,
          loading
        }
      ),
      /* @__PURE__ */ jsx(StatCard, { label: "Open lines", value: summary.unmatched, icon: Scale, tone: "sky", hint: "Awaiting a decision", loading }),
      /* @__PURE__ */ jsx(StatCard, { label: "Matched", value: summary.matched, icon: Check, hint: "Settled against a payment", loading }),
      /* @__PURE__ */ jsx(StatCard, { label: "Ignored", value: summary.ignored, icon: Ban, tone: "neutral", hint: "Not investor payments", loading })
    ] }),
    collectionAccounts.length === 0 && !loading && /* @__PURE__ */ jsxs("div", { className: "mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3", children: [
      /* @__PURE__ */ jsx(Landmark, { className: "mt-0.5 h-4 w-4 shrink-0 text-amber-600" }),
      /* @__PURE__ */ jsxs("p", { className: "text-sm text-amber-900", children: [
        "No collection accounts configured. Add one under ",
        /* @__PURE__ */ jsx("strong", { children: "Banking" }),
        " before importing a statement — a statement has to belong to an account."
      ] })
    ] }),
    lines.length === 0 && !loading && !error ? /* @__PURE__ */ jsx(Panel, { children: /* @__PURE__ */ jsx(
      EmptyState,
      {
        title: statusFilter === "unmatched" ? "Nothing to reconcile" : "No lines here",
        body: statusFilter === "unmatched" ? "Every imported credit has been attributed. Import a statement to check for new payments." : "Lines will appear here once statements are imported.",
        icon: FileUp
      }
    ) }) : /* @__PURE__ */ jsx(
      DataTable,
      {
        rows: lines,
        columns,
        rowKey: (l) => l.id,
        loading,
        error,
        searchable: (l) => {
          var _a2, _b2;
          return `${l.reference ?? ""} ${l.description ?? ""} ${l.counterparty ?? ""} ${((_b2 = (_a2 = l.suggestedPayment) == null ? void 0 : _a2.user) == null ? void 0 : _b2.name) ?? ""}`;
        },
        searchPlaceholder: "Search reference, payer or description…",
        filters: {
          value: statusFilter,
          onChange: set.setFilter,
          options: [
            { value: "unmatched", label: "Open", count: summary.unmatched },
            { value: "matched", label: "Matched", count: summary.matched },
            { value: "ignored", label: "Ignored", count: summary.ignored }
          ]
        },
        emptyTitle: "No statement lines",
        emptyBody: "Import a bank statement to begin reconciling."
      }
    ),
    /* @__PURE__ */ jsx(Dialog, { open: importOpen, onOpenChange: (open) => !open && setImportOpen(false), children: /* @__PURE__ */ jsxs(DialogContent, { className: "rounded-2xl sm:max-w-lg", children: [
      /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: "Import bank statement" }) }),
      importError && /* @__PURE__ */ jsx("p", { className: "rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800", children: importError }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4 py-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "rec-account", children: "Bank account" }),
          /* @__PURE__ */ jsxs(Select, { value: importAccount, onValueChange: setImportAccount, children: [
            /* @__PURE__ */ jsx(SelectTrigger, { id: "rec-account", className: "h-11 rounded-xl", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Which account is this statement for?" }) }),
            /* @__PURE__ */ jsx(SelectContent, { children: collectionAccounts.map((a) => /* @__PURE__ */ jsxs(SelectItem, { value: a.id, children: [
              a.label,
              " (",
              a.currency,
              ")"
            ] }, a.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "rec-file", children: "Statement file" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "rec-file",
              ref: fileRef,
              type: "file",
              accept: ".csv,.txt,.sta,.xml",
              onChange: (e) => {
                var _a2;
                return setImportFile(((_a2 = e.target.files) == null ? void 0 : _a2[0]) ?? null);
              },
              className: "h-11 rounded-xl py-2"
            }
          ),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-400", children: "CSV, MT940 (.sta) or CAMT.053 (.xml). The format is detected automatically, and re-importing the same file is rejected rather than duplicating its credits." })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(DialogFooter, { className: "gap-2", children: [
        /* @__PURE__ */ jsx(Button, { variant: "outline", className: "rounded-xl", onClick: () => setImportOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsx(
          Button,
          {
            className: "rounded-xl bg-emerald-600 hover:bg-emerald-700",
            disabled: busy,
            onClick: () => void handleImport(),
            children: busy ? "Importing…" : "Import"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(Dialog, { open: !!settling, onOpenChange: (open) => !open && setSettling(null), children: /* @__PURE__ */ jsxs(DialogContent, { className: "rounded-2xl sm:max-w-md", children: [
      /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: "Settle this payment?" }) }),
      (settling == null ? void 0 : settling.suggestedPayment) && /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-sm leading-relaxed text-slate-600", children: [
          "This credits",
          " ",
          /* @__PURE__ */ jsx("span", { className: "font-semibold text-slate-900", children: ((_a = settling.suggestedPayment.user) == null ? void 0 : _a.name) ?? "the investor" }),
          " ",
          "with",
          " ",
          /* @__PURE__ */ jsx("span", { className: "adm-num font-semibold text-slate-900", children: formatCurrency(settling.amountMinor, settling.currency) }),
          ", activates their investment and posts the movement to the ledger."
        ] }),
        /* @__PURE__ */ jsx("dl", { className: "divide-y divide-slate-100 rounded-xl border border-[var(--adm-line)] text-sm", children: [
          ["Reference", settling.reference || "—"],
          ["Project", ((_b = settling.suggestedPayment.project) == null ? void 0 : _b.title) ?? "—"],
          [
            "Payment total",
            formatCurrency(settling.suggestedPayment.amountMinor, settling.suggestedPayment.currency)
          ],
          ["Value date", formatDate$1(settling.valueDate)]
        ].map(([label, value]) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3 px-4 py-2.5", children: [
          /* @__PURE__ */ jsx("dt", { className: "text-xs text-slate-500", children: label }),
          /* @__PURE__ */ jsx("dd", { className: "text-right font-medium text-slate-800", children: value })
        ] }, label)) }),
        settling.matchNote && /* @__PURE__ */ jsx("p", { className: "rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600", children: settling.matchNote })
      ] }),
      /* @__PURE__ */ jsxs(DialogFooter, { className: "mt-4 gap-2", children: [
        /* @__PURE__ */ jsx(Button, { variant: "outline", className: "rounded-xl", onClick: () => setSettling(null), children: "Cancel" }),
        /* @__PURE__ */ jsx(
          Button,
          {
            className: "rounded-xl bg-emerald-600 hover:bg-emerald-700",
            disabled: busy,
            onClick: () => void handleSettle(),
            children: busy ? "Settling…" : "Settle payment"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(Dialog, { open: !!ignoring, onOpenChange: (open) => !open && setIgnoring(null), children: /* @__PURE__ */ jsxs(DialogContent, { className: "rounded-2xl sm:max-w-md", children: [
      /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: "Ignore this line?" }) }),
      /* @__PURE__ */ jsx("p", { className: "text-sm leading-relaxed text-slate-600", children: "Use this for lines that are not investor payments — bank charges, interest, internal transfers. The line is kept and the reason recorded in the audit log." }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "rec-reason", children: "Reason" }),
        /* @__PURE__ */ jsx(
          Textarea,
          {
            id: "rec-reason",
            className: "min-h-[72px] rounded-xl",
            value: ignoreReason,
            onChange: (e) => setIgnoreReason(e.target.value),
            placeholder: "e.g. Monthly account maintenance charge"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs(DialogFooter, { className: "mt-4 gap-2", children: [
        /* @__PURE__ */ jsx(Button, { variant: "outline", className: "rounded-xl", onClick: () => setIgnoring(null), children: "Cancel" }),
        /* @__PURE__ */ jsx(
          Button,
          {
            variant: "destructive",
            className: "rounded-xl",
            disabled: busy || !ignoreReason.trim(),
            onClick: () => void handleIgnore(),
            children: busy ? "Saving…" : "Ignore line"
          }
        )
      ] })
    ] }) })
  ] });
}
const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        destructive: "text-destructive bg-card [&>svg]:text-current *:data-[slot=alert-description]:text-destructive/90"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function Alert({
  className,
  variant,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "alert",
      role: "alert",
      className: cn(alertVariants({ variant }), className),
      ...props
    }
  );
}
function AlertDescription({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "alert-description",
      className: cn(
        "text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed",
        className
      ),
      ...props
    }
  );
}
const PANEL_IMAGES = ["/images/capsule12.jpeg", "/images/solar2.jpg", "/images/avo3.jpg"];
const PILLARS = [
  {
    icon: Users$1,
    title: "Fractional ownership",
    body: "Pool capital with other investors and start from a low minimum."
  },
  {
    icon: ShieldCheck,
    title: "Vetted projects",
    body: "Every listing is researched and verified before it goes live."
  },
  {
    icon: TrendingUp,
    title: "Passive income",
    body: "Distributions from eco-lodges, solar, and agriculture as projects mature."
  }
];
function AuthLayout({
  eyebrow,
  title,
  subtitle,
  children,
  wide = false
}) {
  const [slide, setSlide] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setSlide((p) => (p + 1) % PANEL_IMAGES.length), 6e3);
    return () => window.clearInterval(t);
  }, []);
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-white lg:grid lg:grid-cols-[1.05fr_1fr] xl:grid-cols-[1.15fr_1fr]", children: [
    /* @__PURE__ */ jsxs("aside", { className: "relative hidden overflow-hidden lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:justify-between lg:p-12 xl:p-16", children: [
      PANEL_IMAGES.map((src, i) => /* @__PURE__ */ jsx(
        "div",
        {
          className: `absolute inset-0 bg-cover bg-center transition-opacity duration-[1500ms] ${i === slide ? "opacity-100" : "opacity-0"}`,
          style: { backgroundImage: `url(${src})` }
        },
        src
      )),
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-emerald-950/85 via-emerald-950/55 to-emerald-900/35" }),
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/30" }),
      /* @__PURE__ */ jsx("div", { className: "relative z-10", children: /* @__PURE__ */ jsx(Link, { to: "/", className: "inline-block", children: /* @__PURE__ */ jsx(Wordmark, { size: "xl", tone: "light" }) }) }),
      /* @__PURE__ */ jsxs("div", { className: "relative z-10 max-w-lg", children: [
        /* @__PURE__ */ jsxs("p", { className: "inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-medium text-emerald-100 backdrop-blur-md", children: [
          /* @__PURE__ */ jsx(Leaf, { className: "h-3.5 w-3.5 text-emerald-300" }),
          "Kenyan land & sustainability, together"
        ] }),
        /* @__PURE__ */ jsxs("h2", { className: "mt-6 text-4xl font-bold leading-tight tracking-tight text-white xl:text-5xl", children: [
          "Invest together.",
          /* @__PURE__ */ jsx("span", { className: "block text-emerald-400", children: "Profit together." })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "mt-4 text-base leading-relaxed text-white/75", children: "FIBI turns vetted land projects into shares you can actually afford — with transparent funding progress, timelines, and returns." }),
        /* @__PURE__ */ jsx("ul", { className: "mt-10 space-y-5", children: PILLARS.map((p) => /* @__PURE__ */ jsxs("li", { className: "flex gap-4", children: [
          /* @__PURE__ */ jsx("span", { className: "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 backdrop-blur-sm", children: /* @__PURE__ */ jsx(p.icon, { className: "h-5 w-5 text-emerald-300" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-semibold text-white", children: p.title }),
            /* @__PURE__ */ jsx("p", { className: "text-sm leading-relaxed text-white/65", children: p.body })
          ] })
        ] }, p.title)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "relative z-10 flex items-center justify-between", children: [
        /* @__PURE__ */ jsx("div", { className: "flex gap-2", children: PANEL_IMAGES.map((src, i) => /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            "aria-label": `Background ${i + 1}`,
            onClick: () => setSlide(i),
            className: `h-1.5 rounded-full transition-all ${i === slide ? "w-8 bg-emerald-400" : "w-1.5 bg-white/35 hover:bg-white/60"}`
          },
          src
        )) }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-white/50", children: [
          "© ",
          (/* @__PURE__ */ new Date()).getFullYear(),
          " FIBI"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "relative flex min-h-screen flex-col", children: [
      /* @__PURE__ */ jsxs("div", { className: "relative overflow-hidden bg-emerald-950 px-5 py-6 lg:hidden", children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "absolute inset-0 bg-cover bg-center opacity-30",
            style: { backgroundImage: `url(${PANEL_IMAGES[slide]})` }
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-emerald-950 via-emerald-950/85 to-emerald-900/70" }),
        /* @__PURE__ */ jsxs("div", { className: "relative flex items-center justify-between", children: [
          /* @__PURE__ */ jsx(Link, { to: "/", children: /* @__PURE__ */ jsx(Wordmark, { size: "md", tone: "light" }) }),
          /* @__PURE__ */ jsxs(
            Link,
            {
              to: "/",
              className: "inline-flex items-center gap-1.5 text-sm font-medium text-emerald-100/90 transition-colors hover:text-white",
              children: [
                /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
                "Home"
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex flex-1 items-center justify-center px-5 py-10 sm:px-8 sm:py-14", children: /* @__PURE__ */ jsxs("div", { className: `w-full ${wide ? "max-w-xl" : "max-w-md"}`, children: [
        /* @__PURE__ */ jsxs("header", { className: "mb-8", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700", children: eyebrow }),
          /* @__PURE__ */ jsx("h1", { className: "mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl", children: title }),
          /* @__PURE__ */ jsx("p", { className: "mt-2.5 text-[15px] leading-relaxed text-slate-500", children: subtitle })
        ] }),
        children
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "hidden px-8 pb-8 lg:block", children: /* @__PURE__ */ jsxs(
        Link,
        {
          to: "/",
          className: "inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-emerald-700",
          children: [
            /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
            "Back to home"
          ]
        }
      ) })
    ] })
  ] });
}
const authInputClass = "h-11 rounded-xl border-slate-200 bg-white text-[15px] shadow-sm transition-shadow placeholder:text-slate-400 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20";
const authLabelClass = "text-sm font-medium text-slate-700";
function PasswordField({
  id,
  label,
  value,
  onChange,
  disabled,
  autoComplete = "current-password",
  minLength,
  placeholder = "••••••••",
  hint,
  labelAccessory
}) {
  const [visible, setVisible] = useState(false);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-baseline justify-between gap-3", children: [
      /* @__PURE__ */ jsx(Label, { htmlFor: id, className: authLabelClass, children: label }),
      labelAccessory
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsx(Lock, { className: "pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" }),
      /* @__PURE__ */ jsx(
        Input,
        {
          id,
          type: visible ? "text" : "password",
          placeholder,
          value,
          onChange: (e) => onChange(e.target.value),
          required: true,
          minLength,
          disabled,
          autoComplete,
          className: `${authInputClass} pl-11 pr-11`
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => setVisible((v) => !v),
          disabled,
          className: "absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:pointer-events-none disabled:opacity-50",
          "aria-label": visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`,
          children: visible ? /* @__PURE__ */ jsx(EyeOff, { className: "h-4 w-4", "aria-hidden": true }) : /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4", "aria-hidden": true })
        }
      )
    ] }),
    hint
  ] });
}
const LEVELS = [
  { label: "Too weak", bar: "bg-rose-500", text: "text-rose-600" },
  { label: "Weak", bar: "bg-orange-500", text: "text-orange-600" },
  { label: "Fair", bar: "bg-amber-500", text: "text-amber-600" },
  { label: "Strong", bar: "bg-emerald-500", text: "text-emerald-600" },
  { label: "Excellent", bar: "bg-emerald-600", text: "text-emerald-700" }
];
function scorePassword(pw) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= MIN_LENGTH) score += 1;
  if (pw.length >= PASSPHRASE_LENGTH) score += 1;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score += 1;
  if (/\d/.test(pw)) score += 1;
  if (/[^A-Za-z0-9]/.test(pw)) score += 1;
  return Math.min(score, 5);
}
function PasswordStrength({ password }) {
  if (!password) return null;
  const score = scorePassword(password);
  const level = LEVELS[Math.max(0, score - 1)];
  const checklist = policyChecklist(password);
  return /* @__PURE__ */ jsxs("div", { className: "pt-1.5", children: [
    /* @__PURE__ */ jsx("div", { className: "flex gap-1.5", children: [1, 2, 3, 4, 5].map((i) => /* @__PURE__ */ jsx(
      "span",
      {
        className: `h-1 flex-1 rounded-full transition-colors ${i <= score ? level.bar : "bg-slate-200"}`
      },
      i
    )) }),
    /* @__PURE__ */ jsx("p", { className: `mt-1.5 text-xs font-medium ${level.text}`, children: level.label }),
    /* @__PURE__ */ jsx("ul", { className: "mt-2 space-y-1", children: checklist.map((rule) => /* @__PURE__ */ jsxs(
      "li",
      {
        className: `flex items-start gap-1.5 text-xs ${rule.met ? "text-emerald-600" : "text-slate-400"}`,
        children: [
          rule.met ? /* @__PURE__ */ jsx(Check, { className: "mt-0.5 h-3 w-3 shrink-0", "aria-hidden": true }) : /* @__PURE__ */ jsx(Circle, { className: "mt-0.5 h-3 w-3 shrink-0", "aria-hidden": true }),
          rule.label
        ]
      },
      rule.label
    )) })
  ] });
}
function GoogleIcon() {
  return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", className: "h-[18px] w-[18px]", "aria-hidden": true, children: [
    /* @__PURE__ */ jsx(
      "path",
      {
        fill: "#4285F4",
        d: "M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.44a5.5 5.5 0 0 1-2.39 3.62v3h3.86c2.26-2.09 3.58-5.17 3.58-8.86Z"
      }
    ),
    /* @__PURE__ */ jsx(
      "path",
      {
        fill: "#34A853",
        d: "M12 24c3.24 0 5.95-1.08 7.94-2.91l-3.87-3c-1.07.72-2.44 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A11.99 11.99 0 0 0 12 24Z"
      }
    ),
    /* @__PURE__ */ jsx(
      "path",
      {
        fill: "#FBBC05",
        d: "M5.27 14.29a7.2 7.2 0 0 1 0-4.58V6.62H1.29a12 12 0 0 0 0 10.76l3.98-3.09Z"
      }
    ),
    /* @__PURE__ */ jsx(
      "path",
      {
        fill: "#EA4335",
        d: "M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.69 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75Z"
      }
    )
  ] });
}
function FacebookIcon() {
  return /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", className: "h-[18px] w-[18px]", "aria-hidden": true, children: /* @__PURE__ */ jsx(
    "path",
    {
      fill: "#1877F2",
      d: "M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c-.02-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.96h-1.51c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07Z"
    }
  ) });
}
function AppleIcon() {
  return /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", className: "h-[18px] w-[18px]", "aria-hidden": true, children: /* @__PURE__ */ jsx(
    "path",
    {
      fill: "currentColor",
      d: "M17.05 12.74c-.03-2.75 2.25-4.07 2.35-4.13-1.28-1.87-3.27-2.13-3.98-2.16-1.7-.17-3.31 1-4.17 1-.86 0-2.18-.98-3.58-.95-1.84.03-3.54 1.07-4.49 2.72-1.91 3.32-.49 8.24 1.38 10.93.91 1.32 2 2.8 3.42 2.75 1.37-.06 1.89-.89 3.55-.89 1.65 0 2.13.89 3.58.86 1.48-.02 2.42-1.34 3.32-2.67 1.05-1.53 1.48-3.01 1.5-3.09-.03-.01-2.88-1.1-2.91-4.37M14.3 4.63c.75-.92 1.26-2.19 1.12-3.46-1.09.05-2.4.73-3.18 1.64-.7.81-1.31 2.11-1.15 3.35 1.21.09 2.45-.62 3.21-1.53"
    }
  ) });
}
const PROVIDERS = [
  { id: "google", label: "Google", icon: GoogleIcon },
  { id: "facebook", label: "Facebook", icon: FacebookIcon },
  { id: "apple", label: "Apple", icon: AppleIcon }
];
function SocialAuthButtons({
  onSelect,
  disabled,
  label
}) {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsx("span", { className: "h-px flex-1 bg-slate-200" }),
      /* @__PURE__ */ jsx("span", { className: "text-xs font-medium uppercase tracking-wider text-slate-400", children: label }),
      /* @__PURE__ */ jsx("span", { className: "h-px flex-1 bg-slate-200" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-3 gap-3", children: PROVIDERS.map(({ id, label: name, icon: Icon }) => /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        onClick: () => onSelect(id),
        disabled,
        className: "flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 hover:shadow disabled:pointer-events-none disabled:opacity-50",
        children: [
          /* @__PURE__ */ jsx(Icon, {}),
          /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: name })
        ]
      },
      id
    )) })
  ] });
}
const GOOGLE_SCRIPT_ID = "google-identity-services";
const FACEBOOK_SCRIPT_ID = "facebook-jssdk";
const APPLE_SCRIPT_ID = "apple-signin-sdk";
function loadScript(src, id) {
  return new Promise((resolve, reject) => {
    const existing = document.getElementById(id);
    if (existing) {
      if (existing.dataset.loaded === "true") {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}
function requireEnv(name, value) {
  {
    throw new Error(`${name} is missing. Add it to frontend env config.`);
  }
}
async function startGoogleOAuth() {
  const clientId = requireEnv("VITE_GOOGLE_CLIENT_ID");
  await loadScript("https://accounts.google.com/gsi/client", GOOGLE_SCRIPT_ID);
  return new Promise((resolve, reject) => {
    var _a, _b;
    if (!((_b = (_a = window.google) == null ? void 0 : _a.accounts) == null ? void 0 : _b.oauth2)) {
      reject(new Error("Google SDK not available."));
      return;
    }
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: "openid email profile",
      callback: (response) => {
        if ((response == null ? void 0 : response.error) || !(response == null ? void 0 : response.access_token)) {
          reject(new Error("Google authorization failed."));
          return;
        }
        resolve({ accessToken: response.access_token });
      }
    });
    tokenClient.requestAccessToken({ prompt: "consent" });
  });
}
async function startFacebookOAuth() {
  const appId = requireEnv("VITE_FACEBOOK_APP_ID");
  await loadScript("https://connect.facebook.net/en_US/sdk.js", FACEBOOK_SCRIPT_ID);
  return new Promise((resolve, reject) => {
    window.fbAsyncInit = () => {
      window.FB.init({
        appId,
        cookie: true,
        xfbml: false,
        version: "v20.0"
      });
      window.FB.login(
        (response) => {
          var _a;
          const accessToken = (_a = response == null ? void 0 : response.authResponse) == null ? void 0 : _a.accessToken;
          if (!accessToken) {
            reject(new Error("Facebook authorization cancelled."));
            return;
          }
          resolve({ accessToken });
        },
        { scope: "public_profile,email" }
      );
    };
    if (window.FB) {
      window.fbAsyncInit();
    }
  });
}
async function startAppleOAuth() {
  var _a, _b, _c, _d, _e, _f;
  const clientId = requireEnv("VITE_APPLE_CLIENT_ID");
  const redirectUri = requireEnv("VITE_APPLE_REDIRECT_URI");
  await loadScript("https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js", APPLE_SCRIPT_ID);
  if (!((_a = window.AppleID) == null ? void 0 : _a.auth)) {
    throw new Error("Apple SDK not available.");
  }
  window.AppleID.auth.init({
    clientId,
    scope: "name email",
    redirectURI: redirectUri,
    usePopup: true
  });
  const response = await window.AppleID.auth.signIn();
  const idToken = (_b = response == null ? void 0 : response.authorization) == null ? void 0 : _b.id_token;
  const givenName = (_d = (_c = response == null ? void 0 : response.user) == null ? void 0 : _c.name) == null ? void 0 : _d.firstName;
  const familyName = (_f = (_e = response == null ? void 0 : response.user) == null ? void 0 : _e.name) == null ? void 0 : _f.lastName;
  const name = [givenName, familyName].filter(Boolean).join(" ").trim();
  if (!idToken) {
    throw new Error("Apple authorization failed.");
  }
  return { idToken, name: name || void 0 };
}
async function startOAuth(provider) {
  if (provider === "google") return startGoogleOAuth();
  if (provider === "facebook") return startFacebookOAuth();
  return startAppleOAuth();
}
function Login() {
  var _a, _b;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, oauthLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const fromPath = (_b = (_a = location.state) == null ? void 0 : _a.from) == null ? void 0 : _b.pathname;
  const destinationFor = (role) => {
    const defaultPath = role === "admin" ? "/admin" : "/dashboard";
    const canUseFrom = fromPath && (role === "admin" && fromPath.startsWith("/admin") || role === "investor" && (fromPath.startsWith("/dashboard") || fromPath.startsWith("/membership") || fromPath.startsWith("/member-hub")));
    return canUseFrom ? fromPath : defaultPath;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        navigate(destinationFor(result.user.role), { replace: true });
      } else {
        setError(result.error);
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  const handleOAuthLogin = async (provider) => {
    setError("");
    setIsLoading(true);
    try {
      const payload = await startOAuth(provider);
      const result = await oauthLogin(provider, payload);
      if (result.success) {
        navigate(destinationFor(result.user.role), { replace: true });
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "OAuth login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  return /* @__PURE__ */ jsx(
    AuthLayout,
    {
      eyebrow: "Welcome back",
      title: "Sign in to FIBI",
      subtitle: "Track your portfolio, review funding progress, and back new projects.",
      children: /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-5", children: [
          error && /* @__PURE__ */ jsxs(Alert, { variant: "destructive", className: "rounded-xl border-rose-200 bg-rose-50 text-rose-800", children: [
            /* @__PURE__ */ jsx(AlertCircle, { className: "h-4 w-4" }),
            /* @__PURE__ */ jsx(AlertDescription, { children: error })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "login-email", className: authLabelClass, children: "Email address" }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx(Mail, { className: "pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "login-email",
                  type: "email",
                  placeholder: "you@example.com",
                  value: email,
                  onChange: (e) => setEmail(e.target.value),
                  required: true,
                  disabled: isLoading,
                  autoComplete: "email",
                  className: `${authInputClass} pl-11`
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            PasswordField,
            {
              id: "login-password",
              label: "Password",
              value: password,
              onChange: setPassword,
              disabled: isLoading,
              autoComplete: "current-password",
              labelAccessory: /* @__PURE__ */ jsx(
                Link,
                {
                  to: "/forgot-password",
                  className: "text-sm font-medium text-emerald-600 underline-offset-4 transition-colors hover:text-emerald-700 hover:underline",
                  children: "Forgot password?"
                }
              )
            }
          ),
          /* @__PURE__ */ jsx(
            Button,
            {
              type: "submit",
              className: "group h-12 w-full rounded-xl bg-emerald-600 text-base font-semibold shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-700 hover:shadow-emerald-600/30",
              disabled: isLoading,
              children: isLoading ? /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx("span", { className: "h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" }),
                "Signing in…"
              ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                "Sign in",
                /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4 transition-transform group-hover:translate-x-0.5" })
              ] })
            }
          )
        ] }),
        /* @__PURE__ */ jsx(SocialAuthButtons, { label: "or continue with", onSelect: handleOAuthLogin, disabled: isLoading }),
        /* @__PURE__ */ jsxs("p", { className: "text-center text-sm text-slate-500", children: [
          "New to FIBI?",
          " ",
          /* @__PURE__ */ jsx(
            Link,
            {
              to: "/signup",
              className: "font-semibold text-emerald-600 underline-offset-4 transition-colors hover:text-emerald-700 hover:underline",
              children: "Create an account"
            }
          )
        ] })
      ] })
    }
  );
}
const STEPS$1 = [
  { id: 0, label: "Account" },
  { id: 1, label: "Identity" },
  { id: 2, label: "Security" }
];
const COUNTRY_SUGGESTIONS = [
  "Kenya",
  "Uganda",
  "Tanzania",
  "Rwanda",
  "Nigeria",
  "Ghana",
  "South Africa",
  "United Kingdom",
  "United States",
  "Canada",
  "United Arab Emirates"
];
const ID_TYPES = [
  { value: "national-id", label: "National ID" },
  { value: "passport", label: "Passport" },
  { value: "drivers-license", label: "Driver's license" }
];
function Signup() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [dob, setDob] = useState("");
  const [country, setCountry] = useState("");
  const [idType, setIdType] = useState("national-id");
  const [idNumber, setIdNumber] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signup, oauthLogin } = useAuth();
  const navigate = useNavigate();
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const validateStep = (target) => {
    if (target >= 1) {
      if (!name.trim()) return "Please enter your full name.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Please enter a valid email address.";
    }
    if (target >= 2) {
      if (!dob) return "Please enter your date of birth.";
      const age = (Date.now() - new Date(dob).getTime()) / 315576e5;
      if (age < 18) return "You must be at least 18 years old to invest.";
      if (!country.trim()) return "Please enter your country of residence.";
      if (!idNumber.trim()) return "Please enter your ID document number.";
    }
    return "";
  };
  const goNext = () => {
    const message = validateStep(step + 1);
    if (message) {
      setError(message);
      return;
    }
    setError("");
    setStep((s) => Math.min(s + 1, STEPS$1.length - 1));
  };
  const goBack = () => {
    setError("");
    setStep((s) => Math.max(s - 1, 0));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step < STEPS$1.length - 1) {
      goNext();
      return;
    }
    setError("");
    const policy = validatePassword(password, { email, name });
    if (!policy.ok) {
      setError(policy.error);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!acceptTerms) {
      setError("Please accept the terms to continue.");
      return;
    }
    setIsLoading(true);
    try {
      const result = await signup({
        name,
        email,
        password,
        dob: dob || void 0,
        country: country || void 0,
        idType,
        idNumber: idNumber || void 0
      });
      if (result.success) {
        navigate("/dashboard", { replace: true });
      } else {
        setError(result.error);
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  const handleOAuthSignup = async (provider) => {
    setError("");
    setIsLoading(true);
    try {
      const payload = await startOAuth(provider);
      const result = await oauthLogin(provider, payload);
      if (result.success) {
        navigate("/dashboard", { replace: true });
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "OAuth signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  return /* @__PURE__ */ jsx(
    AuthLayout,
    {
      wide: true,
      eyebrow: "Create account",
      title: "Join FIBI",
      subtitle: "Three quick steps and you can start backing vetted land projects.",
      children: /* @__PURE__ */ jsxs("div", { className: "space-y-7", children: [
        /* @__PURE__ */ jsx("ol", { className: "flex items-center", children: STEPS$1.map((s, i) => {
          const done = step > s.id;
          const active = step === s.id;
          return /* @__PURE__ */ jsxs("li", { className: `flex items-center ${i < STEPS$1.length - 1 ? "flex-1" : ""}`, children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5", children: [
              /* @__PURE__ */ jsx(
                "span",
                {
                  className: `flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-all ${done ? "bg-emerald-600 text-white" : active ? "bg-emerald-600 text-white ring-4 ring-emerald-100" : "border border-slate-200 bg-white text-slate-400"}`,
                  children: done ? /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" }) : s.id + 1
                }
              ),
              /* @__PURE__ */ jsx(
                "span",
                {
                  className: `hidden text-sm font-medium sm:block ${active ? "text-slate-900" : done ? "text-slate-600" : "text-slate-400"}`,
                  children: s.label
                }
              )
            ] }),
            i < STEPS$1.length - 1 && /* @__PURE__ */ jsx(
              "span",
              {
                className: `mx-3 h-px flex-1 transition-colors ${done ? "bg-emerald-500" : "bg-slate-200"}`
              }
            )
          ] }, s.id);
        }) }),
        /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, noValidate: true, className: "space-y-6", children: [
          error && /* @__PURE__ */ jsxs(Alert, { variant: "destructive", className: "rounded-xl border-rose-200 bg-rose-50 text-rose-800", children: [
            /* @__PURE__ */ jsx(AlertCircle, { className: "h-4 w-4" }),
            /* @__PURE__ */ jsx(AlertDescription, { children: error })
          ] }),
          step === 0 && /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "su-name", className: authLabelClass, children: "Full name" }),
              /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                /* @__PURE__ */ jsx(User, { className: "pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" }),
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    id: "su-name",
                    type: "text",
                    placeholder: "Jane Wanjiku",
                    value: name,
                    onChange: (e) => setName(e.target.value),
                    disabled: isLoading,
                    autoComplete: "name",
                    className: `${authInputClass} pl-11`
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "su-email", className: authLabelClass, children: "Email address" }),
              /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                /* @__PURE__ */ jsx(Mail, { className: "pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" }),
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    id: "su-email",
                    type: "email",
                    placeholder: "you@example.com",
                    value: email,
                    onChange: (e) => setEmail(e.target.value),
                    disabled: isLoading,
                    autoComplete: "email",
                    className: `${authInputClass} pl-11`
                  }
                )
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-400", children: "We use this for project updates and distribution notices." })
            ] })
          ] }),
          step === 1 && /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
            /* @__PURE__ */ jsxs("p", { className: "flex items-start gap-2.5 rounded-xl border border-emerald-100 bg-emerald-50/70 px-4 py-3 text-xs leading-relaxed text-emerald-800", children: [
              /* @__PURE__ */ jsx(BadgeCheck, { className: "mt-0.5 h-4 w-4 shrink-0 text-emerald-600" }),
              "Land ownership is regulated — we verify identity before any investment is finalised. Your documents are stored securely."
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid gap-5 sm:grid-cols-2", children: [
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx(Label, { htmlFor: "su-dob", className: authLabelClass, children: "Date of birth" }),
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    id: "su-dob",
                    type: "date",
                    value: dob,
                    max: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
                    onChange: (e) => setDob(e.target.value),
                    disabled: isLoading,
                    className: authInputClass
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx(Label, { htmlFor: "su-country", className: authLabelClass, children: "Country of residence" }),
                /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                  /* @__PURE__ */ jsx(Globe2, { className: "pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" }),
                  /* @__PURE__ */ jsx(
                    Input,
                    {
                      id: "su-country",
                      type: "text",
                      list: "su-country-options",
                      placeholder: "Kenya",
                      value: country,
                      onChange: (e) => setCountry(e.target.value),
                      disabled: isLoading,
                      autoComplete: "country-name",
                      className: `${authInputClass} pl-11`
                    }
                  ),
                  /* @__PURE__ */ jsx("datalist", { id: "su-country-options", children: COUNTRY_SUGGESTIONS.map((c) => /* @__PURE__ */ jsx("option", { value: c }, c)) })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { className: authLabelClass, children: "ID document type" }),
              /* @__PURE__ */ jsx("div", { className: "grid gap-2 sm:grid-cols-3", children: ID_TYPES.map((t) => /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: () => setIdType(t.value),
                  disabled: isLoading,
                  "aria-pressed": idType === t.value,
                  className: `rounded-xl border px-3 py-2.5 text-sm font-medium transition-all ${idType === t.value ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"}`,
                  children: t.label
                },
                t.value
              )) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "su-idnum", className: authLabelClass, children: "Document number" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "su-idnum",
                  type: "text",
                  placeholder: "e.g. 12345678",
                  value: idNumber,
                  onChange: (e) => setIdNumber(e.target.value),
                  disabled: isLoading,
                  className: authInputClass
                }
              )
            ] })
          ] }),
          step === 2 && /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
            /* @__PURE__ */ jsx(
              PasswordField,
              {
                id: "su-pass",
                label: "Password",
                value: password,
                onChange: setPassword,
                disabled: isLoading,
                autoComplete: "new-password",
                minLength: MIN_LENGTH,
                hint: /* @__PURE__ */ jsx(PasswordStrength, { password })
              }
            ),
            /* @__PURE__ */ jsx(
              PasswordField,
              {
                id: "su-pass2",
                label: "Confirm password",
                value: confirmPassword,
                onChange: setConfirmPassword,
                disabled: isLoading,
                autoComplete: "new-password",
                hint: confirmPassword ? /* @__PURE__ */ jsxs(
                  "p",
                  {
                    className: `flex items-center gap-1.5 pt-1 text-xs font-medium ${passwordsMatch ? "text-emerald-600" : "text-rose-600"}`,
                    children: [
                      passwordsMatch ? /* @__PURE__ */ jsx(Check, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsx(X, { className: "h-3.5 w-3.5" }),
                      passwordsMatch ? "Passwords match" : "Passwords do not match"
                    ]
                  }
                ) : null
              }
            ),
            /* @__PURE__ */ jsxs("label", { className: "flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3.5 transition-colors hover:bg-slate-50", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "checkbox",
                  checked: acceptTerms,
                  onChange: (e) => setAcceptTerms(e.target.checked),
                  disabled: isLoading,
                  className: "mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 accent-emerald-600"
                }
              ),
              /* @__PURE__ */ jsx("span", { className: "text-sm leading-relaxed text-slate-600", children: "I confirm the details above are accurate and I accept FIBI's investor terms and risk disclosure." })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            step > 0 && /* @__PURE__ */ jsxs(
              Button,
              {
                type: "button",
                variant: "outline",
                onClick: goBack,
                disabled: isLoading,
                className: "h-12 rounded-xl border-slate-200 px-5 text-slate-600 hover:bg-slate-50",
                children: [
                  /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
                  "Back"
                ]
              }
            ),
            /* @__PURE__ */ jsx(
              Button,
              {
                type: "submit",
                className: "group h-12 flex-1 rounded-xl bg-emerald-600 text-base font-semibold shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-700 hover:shadow-emerald-600/30",
                disabled: isLoading,
                children: isLoading ? /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx("span", { className: "h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" }),
                  "Creating account…"
                ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                  step === STEPS$1.length - 1 ? "Create account" : "Continue",
                  /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4 transition-transform group-hover:translate-x-0.5" })
                ] })
              }
            )
          ] })
        ] }),
        step === 0 && /* @__PURE__ */ jsx(SocialAuthButtons, { label: "or sign up with", onSelect: handleOAuthSignup, disabled: isLoading }),
        /* @__PURE__ */ jsxs("p", { className: "text-center text-sm text-slate-500", children: [
          "Already registered?",
          " ",
          /* @__PURE__ */ jsx(
            Link,
            {
              to: "/login",
              className: "font-semibold text-emerald-600 underline-offset-4 transition-colors hover:text-emerald-700 hover:underline",
              children: "Sign in"
            }
          )
        ] })
      ] })
    }
  );
}
function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { requestPasswordReset } = useAuth();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const result = await requestPasswordReset(email);
      if (result.success) {
        setSent(true);
      } else {
        setError(result.error);
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  if (sent) {
    return /* @__PURE__ */ jsx(
      AuthLayout,
      {
        eyebrow: "Check your inbox",
        title: "Reset link sent",
        subtitle: "If an account exists for that address, the link is on its way.",
        children: /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/70 px-5 py-5", children: [
            /* @__PURE__ */ jsx(MailCheck, { className: "mt-0.5 h-5 w-5 shrink-0 text-emerald-600" }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2 text-sm leading-relaxed text-emerald-900", children: [
              /* @__PURE__ */ jsxs("p", { children: [
                "We sent instructions to ",
                /* @__PURE__ */ jsx("strong", { className: "font-semibold", children: email }),
                " if it matches a FIBI account."
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-emerald-800/80", children: "The link expires in 30 minutes and can only be used once. Check your spam folder if it does not arrive within a few minutes." })
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            Button,
            {
              type: "button",
              variant: "outline",
              onClick: () => {
                setSent(false);
                setError("");
              },
              className: "h-12 w-full rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50",
              children: "Use a different email"
            }
          ),
          /* @__PURE__ */ jsx("p", { className: "text-center text-sm text-slate-500", children: /* @__PURE__ */ jsx(
            Link,
            {
              to: "/login",
              className: "font-semibold text-emerald-600 underline-offset-4 transition-colors hover:text-emerald-700 hover:underline",
              children: "Back to sign in"
            }
          ) })
        ] })
      }
    );
  }
  return /* @__PURE__ */ jsx(
    AuthLayout,
    {
      eyebrow: "Account recovery",
      title: "Forgot your password?",
      subtitle: "Enter the email on your account and we'll send you a link to choose a new password.",
      children: /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [
        error && /* @__PURE__ */ jsxs(Alert, { variant: "destructive", className: "rounded-xl border-rose-200 bg-rose-50 text-rose-800", children: [
          /* @__PURE__ */ jsx(AlertCircle, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsx(AlertDescription, { children: error })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "fp-email", className: authLabelClass, children: "Email address" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(Mail, { className: "pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "fp-email",
                type: "email",
                placeholder: "you@example.com",
                value: email,
                onChange: (e) => setEmail(e.target.value),
                required: true,
                disabled: isLoading,
                autoComplete: "email",
                autoFocus: true,
                className: `${authInputClass} pl-11`
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          Button,
          {
            type: "submit",
            className: "group h-12 w-full rounded-xl bg-emerald-600 text-base font-semibold shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-700 hover:shadow-emerald-600/30",
            disabled: isLoading,
            children: isLoading ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("span", { className: "h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" }),
              "Sending link…"
            ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
              "Send reset link",
              /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4 transition-transform group-hover:translate-x-0.5" })
            ] })
          }
        ),
        /* @__PURE__ */ jsx("p", { className: "text-center", children: /* @__PURE__ */ jsxs(
          Link,
          {
            to: "/login",
            className: "inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-emerald-700",
            children: [
              /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
              "Back to sign in"
            ]
          }
        ) })
      ] })
    }
  );
}
function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [tokenState, setTokenState] = useState({ status: "checking" });
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);
  const { verifyResetToken, resetPassword } = useAuth();
  const navigate = useNavigate();
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const verifyRef = useRef(verifyResetToken);
  verifyRef.current = verifyResetToken;
  useEffect(() => {
    let cancelled = false;
    if (!token) {
      setTokenState({ status: "invalid", error: "This reset link is missing its token." });
      return;
    }
    (async () => {
      const result = await verifyRef.current(token);
      if (cancelled) return;
      setTokenState(
        result.success ? { status: "valid", email: result.email } : { status: "invalid", error: result.error }
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const policy = validatePassword(password, {
      email: tokenState.status === "valid" ? tokenState.email : void 0
    });
    if (!policy.ok) {
      setError(policy.error);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setIsLoading(true);
    try {
      const result = await resetPassword(token, password);
      if (result.success) {
        setDone(true);
      } else {
        setError(result.error);
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  if (done) {
    return /* @__PURE__ */ jsx(
      AuthLayout,
      {
        eyebrow: "All set",
        title: "Password updated",
        subtitle: "Your new password is active on your account.",
        children: /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/70 px-5 py-5", children: [
            /* @__PURE__ */ jsx(ShieldCheck, { className: "mt-0.5 h-5 w-5 shrink-0 text-emerald-600" }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-1.5 text-sm leading-relaxed text-emerald-900", children: [
              /* @__PURE__ */ jsx("p", { className: "font-semibold", children: "You have been signed out everywhere." }),
              /* @__PURE__ */ jsx("p", { className: "text-emerald-800/80", children: "Every existing session on every device was ended, so anyone using your old password no longer has access." })
            ] })
          ] }),
          /* @__PURE__ */ jsxs(
            Button,
            {
              onClick: () => navigate("/login", { replace: true }),
              className: "group h-12 w-full rounded-xl bg-emerald-600 text-base font-semibold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700",
              children: [
                "Sign in with new password",
                /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4 transition-transform group-hover:translate-x-0.5" })
              ]
            }
          )
        ] })
      }
    );
  }
  if (tokenState.status === "checking") {
    return /* @__PURE__ */ jsx(AuthLayout, { eyebrow: "Account recovery", title: "Checking your link", subtitle: "One moment…", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-5 text-sm text-slate-500", children: [
      /* @__PURE__ */ jsx("span", { className: "h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-600" }),
      "Verifying reset link…"
    ] }) });
  }
  if (tokenState.status === "invalid") {
    return /* @__PURE__ */ jsx(
      AuthLayout,
      {
        eyebrow: "Account recovery",
        title: "Link no longer valid",
        subtitle: "Reset links expire after 30 minutes and can only be used once.",
        children: /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex gap-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-5", children: [
            /* @__PURE__ */ jsx(CircleAlert, { className: "mt-0.5 h-5 w-5 shrink-0 text-amber-600" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm leading-relaxed text-amber-900", children: tokenState.error })
          ] }),
          /* @__PURE__ */ jsx(Link, { to: "/forgot-password", className: "block", children: /* @__PURE__ */ jsxs(Button, { className: "group h-12 w-full rounded-xl bg-emerald-600 text-base font-semibold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700", children: [
            "Request a new link",
            /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4 transition-transform group-hover:translate-x-0.5" })
          ] }) }),
          /* @__PURE__ */ jsx("p", { className: "text-center text-sm text-slate-500", children: /* @__PURE__ */ jsx(
            Link,
            {
              to: "/login",
              className: "font-semibold text-emerald-600 underline-offset-4 transition-colors hover:text-emerald-700 hover:underline",
              children: "Back to sign in"
            }
          ) })
        ] })
      }
    );
  }
  return /* @__PURE__ */ jsx(
    AuthLayout,
    {
      eyebrow: "Account recovery",
      title: "Choose a new password",
      subtitle: `Setting a new password for ${tokenState.email}.`,
      children: /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, noValidate: true, className: "space-y-6", children: [
        error && /* @__PURE__ */ jsxs(Alert, { variant: "destructive", className: "rounded-xl border-rose-200 bg-rose-50 text-rose-800", children: [
          /* @__PURE__ */ jsx(AlertCircle, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsx(AlertDescription, { children: error })
        ] }),
        /* @__PURE__ */ jsx(
          PasswordField,
          {
            id: "rp-pass",
            label: "New password",
            value: password,
            onChange: setPassword,
            disabled: isLoading,
            autoComplete: "new-password",
            hint: /* @__PURE__ */ jsx(PasswordStrength, { password })
          }
        ),
        /* @__PURE__ */ jsx(
          PasswordField,
          {
            id: "rp-pass2",
            label: "Confirm new password",
            value: confirmPassword,
            onChange: setConfirmPassword,
            disabled: isLoading,
            autoComplete: "new-password",
            hint: confirmPassword ? /* @__PURE__ */ jsxs(
              "p",
              {
                className: `flex items-center gap-1.5 pt-1 text-xs font-medium ${passwordsMatch ? "text-emerald-600" : "text-rose-600"}`,
                children: [
                  passwordsMatch ? /* @__PURE__ */ jsx(Check, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsx(X, { className: "h-3.5 w-3.5" }),
                  passwordsMatch ? "Passwords match" : "Passwords do not match"
                ]
              }
            ) : null
          }
        ),
        /* @__PURE__ */ jsx(
          Button,
          {
            type: "submit",
            className: "group h-12 w-full rounded-xl bg-emerald-600 text-base font-semibold shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-700 hover:shadow-emerald-600/30",
            disabled: isLoading,
            children: isLoading ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("span", { className: "h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" }),
              "Updating password…"
            ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
              "Update password",
              /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4 transition-transform group-hover:translate-x-0.5" })
            ] })
          }
        ),
        /* @__PURE__ */ jsx("p", { className: "text-center text-sm text-slate-500", children: /* @__PURE__ */ jsx(
          Link,
          {
            to: "/login",
            className: "font-semibold text-emerald-600 underline-offset-4 transition-colors hover:text-emerald-700 hover:underline",
            children: "Back to sign in"
          }
        ) })
      ] })
    }
  );
}
function NotFound() {
  return /* @__PURE__ */ jsxs("div", { className: "min-h-[80vh] flex flex-col items-center justify-center px-4 py-16 bg-gradient-to-b from-slate-50 via-white to-emerald-50/40", children: [
    /* @__PURE__ */ jsx(NoIndexSeo, { title: "Page not found", path: "/404" }),
    /* @__PURE__ */ jsx(Link, { to: "/", className: "mb-10 opacity-90 hover:opacity-100 transition-opacity", children: /* @__PURE__ */ jsx(Wordmark, { size: "lg" }) }),
    /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-700 shadow-inner", children: /* @__PURE__ */ jsx(SearchX, { className: "h-11 w-11", strokeWidth: 1.5 }) }),
      /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold uppercase tracking-widest text-emerald-600 mb-2", children: "Error 404" }),
      /* @__PURE__ */ jsx("h1", { className: "text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight mb-3", children: "Page not found" }),
      /* @__PURE__ */ jsx("p", { className: "text-slate-600 leading-relaxed mb-10", children: "The link may be broken or the page was removed. Head back home or browse our investment listings." }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-3 justify-center", children: [
        /* @__PURE__ */ jsx(
          Button,
          {
            asChild: true,
            className: "h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-6",
            children: /* @__PURE__ */ jsxs(Link, { to: "/", children: [
              /* @__PURE__ */ jsx(Home$1, { className: "mr-2 h-4 w-4" }),
              "Back to home"
            ] })
          }
        ),
        /* @__PURE__ */ jsx(Button, { asChild: true, variant: "outline", className: "h-11 rounded-xl border-slate-200 px-6", children: /* @__PURE__ */ jsxs(Link, { to: "/projects", children: [
          /* @__PURE__ */ jsx(FolderOpen, { className: "mr-2 h-4 w-4" }),
          "View projects"
        ] }) })
      ] })
    ] })
  ] });
}
function ProtectedRoute({
  children,
  allowedRoles,
  requireMembershipTier
}) {
  const { isAuthenticated, user, authReady } = useAuth();
  const { canAccessTier, ready: membershipReady } = useMembership();
  const location = useLocation();
  if (!authReady) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center bg-gray-50", children: /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-sm", children: "Loading session…" }) });
  }
  if (!isAuthenticated || !user) {
    return /* @__PURE__ */ jsx(Navigate, { to: "/login", state: { from: location }, replace: true });
  }
  if ((allowedRoles == null ? void 0 : allowedRoles.length) && !allowedRoles.includes(user.role)) {
    const fallback = user.role === "admin" ? "/admin" : "/dashboard";
    return /* @__PURE__ */ jsx(Navigate, { to: fallback, replace: true });
  }
  if (requireMembershipTier) {
    if (!membershipReady) {
      return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center bg-gray-50", children: /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-sm", children: "Checking your membership…" }) });
    }
    if (!canAccessTier(requireMembershipTier)) {
      return /* @__PURE__ */ jsx(Navigate, { to: "/membership", state: { from: location }, replace: true });
    }
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(NoIndexSeo, { title: "FIBI account", path: location.pathname }),
    children
  ] });
}
function PlanGrid({
  plans,
  membership,
  stage,
  isAuthenticated,
  onCheckout
}) {
  var _a;
  const [busyTier, setBusyTier] = useState(null);
  const [error, setError] = useState(null);
  const [instructions, setInstructions] = useState(null);
  const paidPlans = plans.filter((p) => p.monthlyPriceMinor > 0);
  const highlightTier = paidPlans.length > 1 ? (_a = paidPlans[Math.floor((paidPlans.length - 1) / 2)]) == null ? void 0 : _a.tier : void 0;
  const pay = async (tier) => {
    var _a2;
    if (!onCheckout) return;
    setBusyTier(tier);
    setError(null);
    setInstructions(null);
    const res = await onCheckout(tier);
    setBusyTier(null);
    if (!res.success) {
      setError(res.error ?? "Could not start checkout.");
      return;
    }
    if (((_a2 = res.nextAction) == null ? void 0 : _a2.type) === "redirect" && res.nextAction.url) {
      window.location.href = res.nextAction.url;
      return;
    }
    setInstructions(res.nextAction ?? { type: "none" });
  };
  if (plans.length === 0) {
    return /* @__PURE__ */ jsx("div", { className: "rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500", children: "Membership plans are being set up. Check back shortly." });
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    error && /* @__PURE__ */ jsx("p", { className: "rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700", children: error }),
    instructions && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900", children: [
      /* @__PURE__ */ jsx("p", { className: "font-semibold", children: "Payment started" }),
      instructions.reference && /* @__PURE__ */ jsxs("p", { className: "mt-1", children: [
        "Reference: ",
        /* @__PURE__ */ jsx("span", { className: "font-mono font-semibold", children: instructions.reference })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-sky-800", children: instructions.instructions ?? "Your membership activates as soon as the payment is confirmed." })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid gap-4 lg:grid-cols-4", children: plans.map((plan) => {
      const isCurrent = membership.tier === plan.tier && membership.status === "active";
      const isPending = membership.pendingTier === plan.tier && stage === "awaiting_payment";
      const isHighlighted = plan.tier === highlightTier;
      const direction = membershipTierRank(plan.tier) - membershipTierRank(membership.tier);
      const free = plan.monthlyPriceMinor === 0;
      return /* @__PURE__ */ jsxs(
        "div",
        {
          className: `relative flex flex-col rounded-2xl border bg-white p-5 transition-shadow hover:shadow-md ${isCurrent ? "border-emerald-400 ring-2 ring-emerald-200" : isHighlighted ? "border-emerald-300 ring-1 ring-emerald-100" : "border-slate-200"}`,
          children: [
            isHighlighted && !isCurrent && /* @__PURE__ */ jsx("span", { className: "absolute -top-2.5 left-5 rounded-full bg-emerald-600 px-2.5 py-0.5 text-[0.6875rem] font-semibold text-white", children: "Most popular" }),
            isCurrent && /* @__PURE__ */ jsx("span", { className: "absolute -top-2.5 left-5 rounded-full bg-emerald-700 px-2.5 py-0.5 text-[0.6875rem] font-semibold text-white", children: "Your tier" }),
            /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-slate-900", children: plan.name }),
            /* @__PURE__ */ jsxs("p", { className: "mt-2", children: [
              /* @__PURE__ */ jsx("span", { className: "text-3xl font-bold tracking-tight text-slate-900", children: free ? "Free" : formatMoney(plan.monthlyPriceMinor, plan.currency) }),
              !free && /* @__PURE__ */ jsx("span", { className: "text-sm text-slate-500", children: " /month" })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "mt-2 min-h-[2.5rem] text-sm text-slate-600", children: plan.description }),
            /* @__PURE__ */ jsx("ul", { className: "mt-4 flex-1 space-y-2", children: plan.features.length === 0 ? /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2 text-sm text-slate-500", children: [
              /* @__PURE__ */ jsx(Lock, { className: "mt-0.5 h-4 w-4 shrink-0 text-slate-400" }),
              "Public access only"
            ] }) : plan.features.map((feature) => /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2 text-sm text-slate-700", children: [
              /* @__PURE__ */ jsx(Check, { className: "mt-0.5 h-4 w-4 shrink-0 text-emerald-600" }),
              featureLabel(feature)
            ] }, feature)) }),
            /* @__PURE__ */ jsx("div", { className: "mt-5", children: free ? /* @__PURE__ */ jsx(Button, { variant: "outline", className: "w-full", disabled: true, children: "Included for everyone" }) : !isAuthenticated ? /* @__PURE__ */ jsx(Link, { to: "/login", className: "block", children: /* @__PURE__ */ jsx(Button, { variant: isHighlighted ? "default" : "outline", className: "w-full", children: "Log in to join" }) }) : !onCheckout || stage === "visitor" || stage === "rejected" || stage === "pending" ? /* @__PURE__ */ jsx(Link, { to: "/membership/apply", className: "block", children: /* @__PURE__ */ jsx(
              Button,
              {
                variant: isHighlighted ? "default" : "outline",
                className: `w-full ${isHighlighted ? "bg-emerald-600 hover:bg-emerald-700" : ""}`,
                disabled: stage === "pending",
                children: stage === "pending" ? "Application under review" : "Apply to join"
              }
            ) }) : isCurrent ? /* @__PURE__ */ jsx(Button, { variant: "outline", className: "w-full", disabled: true, children: "Current tier" }) : /* @__PURE__ */ jsx(
              Button,
              {
                className: `w-full ${isHighlighted ? "bg-emerald-600 hover:bg-emerald-700" : ""}`,
                variant: isHighlighted ? "default" : "outline",
                disabled: busyTier !== null,
                onClick: () => void pay(plan.tier),
                children: busyTier === plan.tier ? /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }),
                  " Starting…"
                ] }) : isPending ? /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4" }),
                  " Activate ",
                  plan.name
                ] }) : membership.status === "active" && direction > 0 ? `Upgrade to ${plan.name}` : membership.status === "active" && direction < 0 ? `Switch to ${plan.name}` : `Join ${plan.name}`
              }
            ) }),
            isPending && /* @__PURE__ */ jsxs("p", { className: "mt-2 text-center text-xs text-sky-700", children: [
              "Approved for ",
              tierLabel(plan.tier)
            ] })
          ]
        },
        plan.tier
      );
    }) })
  ] });
}
function Accordion({
  ...props
}) {
  return /* @__PURE__ */ jsx(AccordionPrimitive.Root, { "data-slot": "accordion", ...props });
}
function AccordionItem({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    AccordionPrimitive.Item,
    {
      "data-slot": "accordion-item",
      className: cn("border-b last:border-b-0", className),
      ...props
    }
  );
}
function AccordionTrigger({
  className,
  children,
  ...props
}) {
  return /* @__PURE__ */ jsx(AccordionPrimitive.Header, { className: "flex", children: /* @__PURE__ */ jsxs(
    AccordionPrimitive.Trigger,
    {
      "data-slot": "accordion-trigger",
      className: cn(
        "focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180",
        className
      ),
      ...props,
      children: [
        children,
        /* @__PURE__ */ jsx(ChevronDownIcon, { className: "text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200" })
      ]
    }
  ) });
}
function AccordionContent({
  className,
  children,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    AccordionPrimitive.Content,
    {
      "data-slot": "accordion-content",
      className: "data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm",
      ...props,
      children: /* @__PURE__ */ jsx("div", { className: cn("pt-0 pb-4", className), children })
    }
  );
}
const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=80"
];
const EXPERIENCE_IMAGES = [
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80"
];
const TESTIMONIALS = [
  {
    quote: "This is my reset zone. I get real focus time, high-level conversations, and practical support every week.",
    name: "Amina K",
    role: "Verified Member"
  },
  {
    quote: "The private events and founder calls are worth it on their own. You feel like you're building with insiders.",
    name: "Brian O",
    role: "Premium Member"
  }
];
const FAQ = [
  {
    q: "How do I apply?",
    a: "Submit the online application. The membership team reviews every application and emails you a decision. Once approved, you choose a tier and activate."
  },
  {
    q: "When am I charged?",
    a: "Only after you're approved and choose a tier. Approval alone costs nothing, and no tier is granted until a payment settles."
  },
  {
    q: "Can I upgrade, downgrade, or cancel?",
    a: "Yes, all from the billing page. Upgrades take effect once payment settles. Cancelling stops future billing and you keep full access to the end of the period you already paid for."
  },
  {
    q: "What happens when my membership expires?",
    a: "Access to member-only features and events ends at the period date. Your account and history stay intact, and you can renew at any time."
  },
  {
    q: "Are there member-only events?",
    a: "Yes. Each event sets a minimum tier. You'll see upcoming events on the member hub, with full details and booking for the ones your tier covers."
  }
];
function MembershipLanding() {
  const { isAuthenticated } = useAuth();
  const { membership, stage, plans, featureGates, latestApplication } = useMembership();
  const [heroIndex, setHeroIndex] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, []);
  const entryPlan = plans.filter((p) => p.monthlyPriceMinor > 0).sort(
    (a, b) => a.monthlyPriceMinor - b.monthlyPriceMinor
  )[0];
  const applyHref = isAuthenticated ? "/membership/apply" : "/login";
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-white", children: [
    /* @__PURE__ */ jsx(
      Seo,
      {
        title: "FIBI membership",
        description: "FIBI membership tiers and what each one unlocks — project access, platform features and member events. Membership is separate from any individual investment.",
        path: "/membership",
        jsonLd: [
          baseGraph(
            webPageSchema({
              name: "FIBI membership",
              description: "Membership tiers, entitlements and how to apply for FIBI membership.",
              path: "/membership"
            }),
            breadcrumbSchema([
              { name: "Home", path: "/" },
              { name: "Membership", path: "/membership" }
            ])
          )
        ]
      }
    ),
    /* @__PURE__ */ jsxs("section", { className: "relative flex min-h-[78vh] items-center overflow-hidden pt-20", children: [
      /* @__PURE__ */ jsxs("div", { className: "absolute inset-0", children: [
        HERO_IMAGES.map((image, index) => /* @__PURE__ */ jsx(
          "div",
          {
            className: `absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${index === heroIndex ? "opacity-100" : "opacity-0"}`,
            style: { backgroundImage: `url(${image})` }
          },
          image
        )),
        /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-slate-950/60" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "relative mx-auto max-w-5xl px-4 text-center text-white", children: [
        /* @__PURE__ */ jsx(Badge, { className: "border border-white/30 bg-white/15 text-white hover:bg-white/20", children: "Application-only membership" }),
        /* @__PURE__ */ jsx("h1", { className: "mt-4 text-4xl font-bold tracking-tight md:text-6xl", children: "Become a FIBI Member" }),
        /* @__PURE__ */ jsx("p", { className: "mx-auto mt-4 max-w-2xl text-lg text-white/90", children: "Exclusive spaces, member-only events, and weekly founder calls — with every application reviewed so the room stays worth being in." }),
        entryPlan && /* @__PURE__ */ jsxs("p", { className: "mt-3 text-sm text-white/70", children: [
          "Tiers from ",
          tierLabel(entryPlan.tier),
          " · reviewed before activation"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-8 flex flex-wrap justify-center gap-3", children: [
          /* @__PURE__ */ jsx(Link, { to: applyHref, children: /* @__PURE__ */ jsx(Button, { className: "bg-emerald-600 px-8 hover:bg-emerald-700", children: isAuthenticated ? "Apply for membership" : "Log in to apply" }) }),
          /* @__PURE__ */ jsx("a", { href: "#plans", children: /* @__PURE__ */ jsx(Button, { variant: "outline", className: "border-white bg-white/10 text-white hover:bg-white/20", children: "Compare tiers" }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-6xl px-4 py-14", children: [
      isAuthenticated && /* @__PURE__ */ jsx("section", { className: "mb-12", children: /* @__PURE__ */ jsx(
        MembershipStatusCard,
        {
          membership,
          stage,
          feedback: latestApplication == null ? void 0 : latestApplication.adminFeedback
        }
      ) }),
      /* @__PURE__ */ jsxs("section", { className: "text-center", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold text-slate-900", children: "How it works" }),
        /* @__PURE__ */ jsx("div", { className: "mt-8 grid gap-4 md:grid-cols-3", children: [
          {
            step: "1",
            title: "Apply",
            body: "Tell us your goals, the experiences you want, and how you'll contribute."
          },
          {
            step: "2",
            title: "Get reviewed",
            body: "The membership team reviews fit and community alignment, then emails a decision."
          },
          {
            step: "3",
            title: "Activate",
            body: "Choose your tier and pay. Access to spaces, events, and channels opens immediately."
          }
        ].map((item) => /* @__PURE__ */ jsxs(Card, { className: "text-left", children: [
          /* @__PURE__ */ jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsx("span", { className: "flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-sm font-bold text-emerald-700", children: item.step }),
            /* @__PURE__ */ jsx(CardTitle, { className: "mt-2 text-lg", children: item.title })
          ] }),
          /* @__PURE__ */ jsx(CardContent, { className: "text-sm text-slate-600", children: item.body })
        ] }, item.step)) })
      ] }),
      /* @__PURE__ */ jsx("section", { className: "mt-14 grid gap-4 md:grid-cols-3", children: [
        {
          icon: ShieldCheck,
          title: "Application-only entry",
          body: "Every applicant is reviewed before any tier is granted, which is what keeps the community's quality and trust."
        },
        {
          icon: Users$1,
          title: "Community-first value",
          body: "Verified groups, private channels, and events with peers who are building the same kinds of things."
        },
        {
          icon: Crown,
          title: "Tiered progression",
          body: "Move up as you go, from member basics through to Investor+ deal flow — change tiers whenever you like."
        }
      ].map((item) => /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2 text-lg", children: [
          /* @__PURE__ */ jsx(item.icon, { className: "h-5 w-5 text-emerald-600" }),
          item.title
        ] }) }),
        /* @__PURE__ */ jsx(CardContent, { className: "text-sm text-slate-600", children: item.body })
      ] }, item.title)) }),
      /* @__PURE__ */ jsxs("section", { className: "mt-14", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-center text-3xl font-bold text-slate-900", children: "Your place to step away from the noise" }),
        /* @__PURE__ */ jsx("p", { className: "mx-auto mt-3 max-w-3xl text-center text-slate-600", children: "Fresh air, open space, and a focused community help reduce stress, improve clarity, and make work feel meaningful again." }),
        /* @__PURE__ */ jsx("div", { className: "mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4", children: EXPERIENCE_IMAGES.map((image) => /* @__PURE__ */ jsx("div", { className: "overflow-hidden rounded-2xl border", children: /* @__PURE__ */ jsx(
          "img",
          {
            src: image,
            alt: "Membership experience",
            loading: "lazy",
            className: "h-52 w-full object-cover transition-transform duration-500 hover:scale-105"
          }
        ) }, image)) })
      ] }),
      /* @__PURE__ */ jsxs("section", { id: "plans", className: "mt-16 scroll-mt-24", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold text-slate-900", children: "Choose your tier" }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 text-slate-600", children: "Every tier is billed monthly. Applications are reviewed before activation." })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-8", children: /* @__PURE__ */ jsx(
          PlanGrid,
          {
            plans,
            membership,
            stage,
            isAuthenticated
          }
        ) })
      ] }),
      featureGates.length > 0 && /* @__PURE__ */ jsx("section", { className: "mt-14", children: /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "What each tier unlocks" }) }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("ul", { className: "grid gap-x-8 gap-y-3 sm:grid-cols-2", children: featureGates.map((gate) => /* @__PURE__ */ jsxs("li", { className: "flex items-start justify-between gap-3", children: [
          /* @__PURE__ */ jsxs("span", { className: "flex items-start gap-2 text-sm text-slate-700", children: [
            /* @__PURE__ */ jsx(CheckCircle2, { className: "mt-0.5 h-4 w-4 shrink-0 text-emerald-600" }),
            featureLabel(gate.featureKey)
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600", children: [
            tierLabel(gate.minTier),
            "+"
          ] })
        ] }, gate.featureKey)) }) })
      ] }) }),
      /* @__PURE__ */ jsx("section", { className: "mt-14 grid gap-4 md:grid-cols-2", children: TESTIMONIALS.map((testimonial) => /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "pt-6", children: [
        /* @__PURE__ */ jsx(Quote, { className: "mb-2 h-5 w-5 text-emerald-600" }),
        /* @__PURE__ */ jsxs("p", { className: "text-slate-700", children: [
          '"',
          testimonial.quote,
          '"'
        ] }),
        /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm font-semibold text-slate-900", children: testimonial.name }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500", children: testimonial.role })
      ] }) }, testimonial.name)) }),
      /* @__PURE__ */ jsxs("section", { className: "mt-14", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-center text-3xl font-bold text-slate-900", children: "Frequently asked" }),
        /* @__PURE__ */ jsx(Accordion, { type: "single", collapsible: true, className: "mx-auto mt-6 max-w-3xl", children: FAQ.map((item) => /* @__PURE__ */ jsxs(AccordionItem, { value: item.q, children: [
          /* @__PURE__ */ jsx(AccordionTrigger, { className: "text-left text-base font-medium", children: item.q }),
          /* @__PURE__ */ jsx(AccordionContent, { className: "text-slate-600", children: item.a })
        ] }, item.q)) })
      ] }),
      /* @__PURE__ */ jsx("section", { className: "mt-14", children: /* @__PURE__ */ jsx(Card, { className: "border-emerald-200 bg-emerald-50/60", children: /* @__PURE__ */ jsxs(CardContent, { className: "flex flex-col items-center gap-4 py-10 text-center", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-2xl font-bold text-slate-900", children: "Ready to join?" }),
        /* @__PURE__ */ jsx("p", { className: "max-w-xl text-slate-600", children: "Applications take a few minutes. You'll hear back from the membership team by email." }),
        /* @__PURE__ */ jsx(Link, { to: applyHref, children: /* @__PURE__ */ jsx(Button, { className: "bg-emerald-600 px-8 hover:bg-emerald-700", children: isAuthenticated ? "Start your application" : "Log in to apply" }) })
      ] }) }) })
    ] })
  ] });
}
const MIN_ANSWER = 20;
const MAX_ANSWER = 2e3;
const QUESTIONS = [
  {
    key: "motivation",
    label: "Why do you want to join?",
    hint: "What are you hoping membership changes for you?",
    placeholder: "I'm building a climate-tech startup and want a room of people who've done it…"
  },
  {
    key: "interests",
    label: "Which member experiences interest you most?",
    hint: "Events, founder sessions, the private channels, deal flow — tell us what you'd actually use.",
    placeholder: "Mostly the founder Q&As and the in-person workshops…"
  },
  {
    key: "contribution",
    label: "How will you contribute to the community?",
    hint: "Members are chosen partly on what they bring, not only what they want.",
    placeholder: "I've run growth at two marketplaces and can help members with early distribution…"
  }
];
function MembershipApplication() {
  const navigate = useNavigate();
  const { applyForMembership, membership, stage, latestApplication } = useMembership();
  const [form, setForm] = useState({ motivation: "", interests: "", contribution: "" });
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const locked = stage === "pending" || stage === "awaiting_payment" || membership.status === "active";
  const tooShort = (value) => value.trim().length > 0 && value.trim().length < MIN_ANSWER;
  const complete = QUESTIONS.every(({ key }) => form[key].trim().length >= MIN_ANSWER);
  const submit = async () => {
    setError("");
    setBusy(true);
    const res = await applyForMembership({
      motivation: form.motivation,
      interests: form.interests,
      communityContribution: form.contribution
    });
    setBusy(false);
    if (!res.success) {
      setError(res.error ?? "Application failed.");
      return;
    }
    setSubmitted(true);
  };
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-slate-50 pb-16 pt-24", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-3xl px-4", children: [
    /* @__PURE__ */ jsxs(
      Link,
      {
        to: "/membership",
        className: "inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800",
        children: [
          /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
          " Back to membership"
        ]
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsx(
      MembershipStatusCard,
      {
        membership,
        stage,
        feedback: latestApplication == null ? void 0 : latestApplication.adminFeedback
      }
    ) }),
    submitted ? /* @__PURE__ */ jsx(Card, { className: "mt-6 border-emerald-200", children: /* @__PURE__ */ jsxs(CardContent, { className: "flex flex-col items-center gap-3 py-12 text-center", children: [
      /* @__PURE__ */ jsx(CheckCircle2, { className: "h-10 w-10 text-emerald-600" }),
      /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-slate-900", children: "Application submitted" }),
      /* @__PURE__ */ jsx("p", { className: "max-w-md text-slate-600", children: "The membership team reviews every application by hand. You'll get an email as soon as there's a decision — usually within a few days." }),
      /* @__PURE__ */ jsxs("div", { className: "mt-2 flex gap-3", children: [
        /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => navigate("/membership"), children: "Back to membership" }),
        /* @__PURE__ */ jsx(Link, { to: "/dashboard", children: /* @__PURE__ */ jsx(Button, { className: "bg-emerald-600 hover:bg-emerald-700", children: "Go to dashboard" }) })
      ] })
    ] }) }) : locked ? /* @__PURE__ */ jsx(Card, { className: "mt-6", children: /* @__PURE__ */ jsxs(CardContent, { className: "py-10 text-center", children: [
      /* @__PURE__ */ jsx("p", { className: "text-slate-700", children: stage === "pending" ? "Your application is already under review — there's nothing more to submit." : "You're already approved. Head to billing to pick your tier." }),
      /* @__PURE__ */ jsxs("div", { className: "mt-4 flex justify-center gap-3", children: [
        /* @__PURE__ */ jsx(Link, { to: "/membership/billing", children: /* @__PURE__ */ jsx(Button, { className: "bg-emerald-600 hover:bg-emerald-700", children: "Go to billing" }) }),
        /* @__PURE__ */ jsx(Link, { to: "/membership", children: /* @__PURE__ */ jsx(Button, { variant: "outline", children: "Back to membership" }) })
      ] })
    ] }) }) : /* @__PURE__ */ jsxs(Card, { className: "mt-6", children: [
      /* @__PURE__ */ jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsx(CardTitle, { children: "Membership application" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-600", children: "Three questions. Applications are read by a person, so specifics help far more than length." })
      ] }),
      /* @__PURE__ */ jsxs(CardContent, { className: "space-y-6", children: [
        error && /* @__PURE__ */ jsx("p", { className: "rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700", children: error }),
        QUESTIONS.map((question) => {
          const value = form[question.key];
          const short = tooShort(value);
          return /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { className: "text-base", children: question.label }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500", children: question.hint }),
            /* @__PURE__ */ jsx(
              Textarea,
              {
                value,
                maxLength: MAX_ANSWER,
                placeholder: question.placeholder,
                onChange: (e) => setForm((prev) => ({ ...prev, [question.key]: e.target.value })),
                className: `min-h-[110px] ${short ? "border-amber-300" : ""}`
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs", children: [
              /* @__PURE__ */ jsxs("span", { className: short ? "text-amber-600" : "text-transparent", children: [
                "At least ",
                MIN_ANSWER,
                " characters"
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "text-slate-400", children: [
                value.trim().length,
                "/",
                MAX_ANSWER
              ] })
            ] })
          ] }, question.key);
        }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-3 border-t pt-4", children: [
          /* @__PURE__ */ jsx(
            Button,
            {
              onClick: () => void submit(),
              disabled: busy || !complete,
              className: "bg-emerald-600 hover:bg-emerald-700",
              children: busy ? /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }),
                " Submitting…"
              ] }) : "Submit application"
            }
          ),
          /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => navigate("/membership"), children: "Cancel" }),
          !complete && /* @__PURE__ */ jsx("p", { className: "self-center text-xs text-slate-500", children: "Answer all three questions to submit." })
        ] })
      ] })
    ] })
  ] }) });
}
function AlertDialog({
  ...props
}) {
  return /* @__PURE__ */ jsx(AlertDialogPrimitive.Root, { "data-slot": "alert-dialog", ...props });
}
function AlertDialogTrigger({
  ...props
}) {
  return /* @__PURE__ */ jsx(AlertDialogPrimitive.Trigger, { "data-slot": "alert-dialog-trigger", ...props });
}
function AlertDialogPortal({
  ...props
}) {
  return /* @__PURE__ */ jsx(AlertDialogPrimitive.Portal, { "data-slot": "alert-dialog-portal", ...props });
}
function AlertDialogOverlay({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    AlertDialogPrimitive.Overlay,
    {
      "data-slot": "alert-dialog-overlay",
      className: cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      ),
      ...props
    }
  );
}
function AlertDialogContent({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxs(AlertDialogPortal, { children: [
    /* @__PURE__ */ jsx(AlertDialogOverlay, {}),
    /* @__PURE__ */ jsx(
      AlertDialogPrimitive.Content,
      {
        "data-slot": "alert-dialog-content",
        className: cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
          className
        ),
        ...props
      }
    )
  ] });
}
function AlertDialogHeader({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "alert-dialog-header",
      className: cn("flex flex-col gap-2 text-center sm:text-left", className),
      ...props
    }
  );
}
function AlertDialogFooter({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "alert-dialog-footer",
      className: cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      ),
      ...props
    }
  );
}
function AlertDialogTitle({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    AlertDialogPrimitive.Title,
    {
      "data-slot": "alert-dialog-title",
      className: cn("text-lg font-semibold", className),
      ...props
    }
  );
}
function AlertDialogDescription({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    AlertDialogPrimitive.Description,
    {
      "data-slot": "alert-dialog-description",
      className: cn("text-muted-foreground text-sm", className),
      ...props
    }
  );
}
function AlertDialogAction({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    AlertDialogPrimitive.Action,
    {
      className: cn(buttonVariants(), className),
      ...props
    }
  );
}
function AlertDialogCancel({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    AlertDialogPrimitive.Cancel,
    {
      className: cn(buttonVariants({ variant: "outline" }), className),
      ...props
    }
  );
}
const INVOICE_STYLES = {
  paid: "bg-emerald-100 text-emerald-800",
  pending: "bg-amber-100 text-amber-800",
  failed: "bg-rose-100 text-rose-800",
  canceled: "bg-slate-200 text-slate-600"
};
function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}
function InvoiceRow({ invoice }) {
  return /* @__PURE__ */ jsxs("tr", { className: "border-b border-slate-100 last:border-0", children: [
    /* @__PURE__ */ jsxs("td", { className: "py-3 pr-4", children: [
      /* @__PURE__ */ jsx("p", { className: "font-medium text-slate-800", children: tierLabel(invoice.tier) }),
      /* @__PURE__ */ jsxs("p", { className: "text-xs text-slate-500", children: [
        formatDate(invoice.periodStart),
        " – ",
        formatDate(invoice.periodEnd)
      ] })
    ] }),
    /* @__PURE__ */ jsx("td", { className: "py-3 pr-4 text-right font-medium tabular-nums text-slate-800", children: formatMoney(invoice.amountMinor, invoice.currency) }),
    /* @__PURE__ */ jsx("td", { className: "py-3 pr-4 text-right", children: /* @__PURE__ */ jsx(
      "span",
      {
        className: `rounded-full px-2.5 py-0.5 text-xs font-semibold ${INVOICE_STYLES[invoice.status] ?? "bg-slate-100 text-slate-600"}`,
        children: invoice.status
      }
    ) }),
    /* @__PURE__ */ jsx("td", { className: "hidden py-3 text-right text-xs text-slate-500 sm:table-cell", children: invoice.paidAt ? formatDate(invoice.paidAt) : formatDate(invoice.createdAt) })
  ] });
}
function MembershipBilling() {
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
    resumeMembership
  } = useMembership();
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState(null);
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
      res.success ? { ok: true, text: "Membership will end when the current period does." } : { ok: false, text: res.error ?? "Could not cancel." }
    );
  };
  const runResume = async () => {
    setBusy(true);
    setFlash(null);
    const res = await resumeMembership();
    setBusy(false);
    setFlash(
      res.success ? { ok: true, text: "Membership resumed — billing will continue as normal." } : { ok: false, text: res.error ?? "Could not resume." }
    );
  };
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-slate-50 pb-16 pt-24", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-4xl space-y-6 px-4", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs(
        Link,
        {
          to: "/membership",
          className: "inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800",
          children: [
            /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
            " Back to membership"
          ]
        }
      ),
      /* @__PURE__ */ jsx("h1", { className: "mt-3 text-3xl font-bold text-slate-900", children: "Membership & billing" }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-slate-600", children: "Change your tier, review what you've been charged, and manage renewal." })
    ] }),
    flash && /* @__PURE__ */ jsx(
      "p",
      {
        className: `rounded-xl border px-4 py-3 text-sm ${flash.ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-700"}`,
        children: flash.text
      }
    ),
    /* @__PURE__ */ jsx(
      MembershipStatusCard,
      {
        membership,
        stage,
        feedback: latestApplication == null ? void 0 : latestApplication.adminFeedback
      }
    ),
    openInvoice && /* @__PURE__ */ jsx(Card, { className: "border-amber-200 bg-amber-50/60", children: /* @__PURE__ */ jsxs(CardContent, { className: "flex flex-wrap items-center gap-4 py-5", children: [
      /* @__PURE__ */ jsx(Clock, { className: "h-5 w-5 shrink-0 text-amber-600" }),
      /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxs("p", { className: "font-medium text-slate-900", children: [
          "Payment awaiting confirmation ·",
          " ",
          formatMoney(openInvoice.amountMinor, openInvoice.currency),
          " for",
          " ",
          tierLabel(openInvoice.tier)
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "mt-0.5 text-sm text-slate-600", children: [
          "Your tier activates automatically as soon as the payment settles.",
          openInvoice.payment ? ` Paid via ${openInvoice.payment.provider}.` : ""
        ] })
      ] })
    ] }) }),
    membership.status === "active" && currentPlan && /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Current plan" }) }),
      /* @__PURE__ */ jsxs(CardContent, { className: "flex flex-wrap items-end justify-between gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("p", { className: "text-2xl font-bold text-slate-900", children: [
            currentPlan.name,
            /* @__PURE__ */ jsxs("span", { className: "ml-2 text-base font-normal text-slate-500", children: [
              formatMoney(currentPlan.monthlyPriceMinor, currentPlan.currency),
              "/month"
            ] })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-slate-600", children: membership.canceledAt ? `Access ends ${formatDate(membership.renewalDate)} — no further charges.` : `Renews ${formatDate(membership.renewalDate)}.` })
        ] }),
        membership.canceledAt ? /* @__PURE__ */ jsxs(
          Button,
          {
            variant: "outline",
            disabled: busy,
            onClick: () => void runResume(),
            className: "border-emerald-300 text-emerald-700 hover:bg-emerald-50",
            children: [
              busy ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(RotateCcw, { className: "h-4 w-4" }),
              "Resume membership"
            ]
          }
        ) : /* @__PURE__ */ jsxs(AlertDialog, { children: [
          /* @__PURE__ */ jsx(AlertDialogTrigger, { asChild: true, children: /* @__PURE__ */ jsx(Button, { variant: "outline", className: "border-slate-300 text-slate-700", children: "Cancel membership" }) }),
          /* @__PURE__ */ jsxs(AlertDialogContent, { children: [
            /* @__PURE__ */ jsxs(AlertDialogHeader, { children: [
              /* @__PURE__ */ jsx(AlertDialogTitle, { children: "Cancel your membership?" }),
              /* @__PURE__ */ jsxs(AlertDialogDescription, { children: [
                "You'll keep full ",
                tierLabel(membership.tier),
                " access until",
                " ",
                formatDate(membership.renewalDate),
                ", and won't be charged again. You can resume any time before then."
              ] })
            ] }),
            /* @__PURE__ */ jsxs(AlertDialogFooter, { children: [
              /* @__PURE__ */ jsx(AlertDialogCancel, { children: "Keep membership" }),
              /* @__PURE__ */ jsx(AlertDialogAction, { onClick: () => void runCancel(), children: "Cancel membership" })
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { children: [
      /* @__PURE__ */ jsx("h2", { className: "mb-4 text-xl font-semibold text-slate-900", children: membership.status === "active" ? "Change tier" : "Choose a tier" }),
      /* @__PURE__ */ jsx(
        PlanGrid,
        {
          plans,
          membership,
          stage,
          isAuthenticated,
          onCheckout: (tier) => startCheckout(tier)
        }
      )
    ] }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Receipt, { className: "h-5 w-5 text-emerald-600" }),
        "Billing history"
      ] }) }),
      /* @__PURE__ */ jsx(CardContent, { children: invoices.length === 0 ? /* @__PURE__ */ jsx("p", { className: "py-6 text-center text-sm text-slate-500", children: "No membership charges yet." }) : /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[420px] text-sm", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500", children: [
          /* @__PURE__ */ jsx("th", { className: "pb-2 pr-4 font-semibold", children: "Period" }),
          /* @__PURE__ */ jsx("th", { className: "pb-2 pr-4 text-right font-semibold", children: "Amount" }),
          /* @__PURE__ */ jsx("th", { className: "pb-2 pr-4 text-right font-semibold", children: "Status" }),
          /* @__PURE__ */ jsx("th", { className: "hidden pb-2 text-right font-semibold sm:table-cell", children: "Date" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { children: invoices.map((invoice) => /* @__PURE__ */ jsx(InvoiceRow, { invoice }, invoice.id)) })
      ] }) }) })
    ] })
  ] }) });
}
function formatWhen(startsAt, endsAt) {
  const start = new Date(startsAt);
  const date = start.toLocaleDateString(void 0, {
    weekday: "short",
    month: "short",
    day: "numeric"
  });
  const time = start.toLocaleTimeString(void 0, { hour: "numeric", minute: "2-digit" });
  if (!endsAt) return `${date} · ${time}`;
  const end = new Date(endsAt);
  const endTime = end.toLocaleTimeString(void 0, { hour: "numeric", minute: "2-digit" });
  return `${date} · ${time}–${endTime}`;
}
function EventList({
  events,
  onBook,
  onCancel
}) {
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState(null);
  const run = async (eventId, action) => {
    setBusyId(eventId);
    setError(null);
    const res = await action(eventId);
    setBusyId(null);
    if (!res.success) setError(res.error ?? "Something went wrong.");
  };
  if (events.length === 0) {
    return /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-dashed border-slate-300 p-8 text-center", children: [
      /* @__PURE__ */ jsx(CalendarClock, { className: "mx-auto h-6 w-6 text-slate-300" }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 font-medium text-slate-700", children: "No upcoming events" }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-slate-500", children: "New member events are announced here as they're scheduled." })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
    error && /* @__PURE__ */ jsx("p", { className: "rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700", children: error }),
    events.map((event) => {
      const full = event.seatsLeft === 0 && !event.registered;
      return /* @__PURE__ */ jsxs(
        "div",
        {
          className: `flex flex-wrap items-start gap-4 rounded-xl border p-4 ${event.locked ? "border-slate-200 bg-slate-50/70" : "border-slate-200 bg-white"}`,
          children: [
            /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
                /* @__PURE__ */ jsx("p", { className: "font-medium text-slate-900", children: event.title }),
                event.locked && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-slate-200 px-2 py-0.5 text-[0.6875rem] font-semibold text-slate-600", children: [
                  /* @__PURE__ */ jsx(Lock, { className: "h-3 w-3" }),
                  tierLabel(event.minTier),
                  "+"
                ] }),
                event.registered && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[0.6875rem] font-semibold text-emerald-800", children: [
                  /* @__PURE__ */ jsx(Check, { className: "h-3 w-3" }),
                  " Reserved"
                ] })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-slate-500", children: formatWhen(event.startsAt, event.endsAt) }),
              event.locked ? /* @__PURE__ */ jsxs("p", { className: "mt-2 text-sm text-slate-500", children: [
                "Details unlock at the ",
                tierLabel(event.minTier),
                " tier."
              ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                event.description && /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-slate-600", children: event.description }),
                /* @__PURE__ */ jsxs("div", { className: "mt-2 flex flex-wrap gap-4 text-xs text-slate-500", children: [
                  event.location && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1", children: [
                    /* @__PURE__ */ jsx(MapPin, { className: "h-3.5 w-3.5" }),
                    " ",
                    event.location
                  ] }),
                  event.seatsLeft != null && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1", children: [
                    /* @__PURE__ */ jsx(Users$1, { className: "h-3.5 w-3.5" }),
                    event.seatsLeft,
                    " of ",
                    event.capacity,
                    " seats left"
                  ] })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "shrink-0", children: event.locked ? /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", disabled: true, children: [
              /* @__PURE__ */ jsx(Lock, { className: "h-4 w-4" }),
              " Locked"
            ] }) : event.registered ? /* @__PURE__ */ jsxs(
              Button,
              {
                variant: "outline",
                size: "sm",
                disabled: busyId === event.id,
                onClick: () => void run(event.id, onCancel),
                children: [
                  busyId === event.id ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : null,
                  "Cancel booking"
                ]
              }
            ) : /* @__PURE__ */ jsxs(
              Button,
              {
                size: "sm",
                className: "bg-emerald-600 hover:bg-emerald-700",
                disabled: busyId === event.id || full,
                onClick: () => void run(event.id, onBook),
                children: [
                  busyId === event.id ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : null,
                  full ? "Full" : "Reserve seat"
                ]
              }
            ) })
          ]
        },
        event.id
      );
    })
  ] });
}
const FEATURE_CARDS = [
  {
    featureKey: "exclusive_content",
    icon: Sparkles,
    title: "Exclusive content",
    body: "Deep dives, premium guides, and the member-only media library."
  },
  {
    featureKey: "community_groups",
    icon: MessageSquare,
    title: "Community rooms",
    body: "Private forums, small member circles, and priority discussion channels."
  },
  {
    featureKey: "founder_qa",
    icon: Video,
    title: "Founder access",
    body: "Monthly calls and Q&A sessions with the founders building on FIBI."
  },
  {
    featureKey: "investment_opportunities",
    icon: Sparkles,
    title: "Deal flow",
    body: "Early access to investment opportunities before they open publicly."
  }
];
function MemberHub() {
  const {
    membership,
    stage,
    events,
    entitlements,
    canAccessFeature,
    minTierForFeature,
    bookEvent,
    cancelBooking
  } = useMembership();
  const upcomingBooked = events.filter((e) => e.registered).length;
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-slate-50 pb-16 pt-24", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-6xl space-y-6 px-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-start justify-between gap-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold text-slate-900", children: "Member hub" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-slate-600", children: "Exclusive content, member events, and private community experiences." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx(TierBadge, { membership }),
        /* @__PURE__ */ jsx(Link, { to: "/membership/billing", children: /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", children: [
          /* @__PURE__ */ jsx(Settings2, { className: "h-4 w-4" }),
          " Manage"
        ] }) })
      ] })
    ] }),
    stage !== "active" && /* @__PURE__ */ jsx(MembershipStatusCard, { membership, stage, compact: true }),
    /* @__PURE__ */ jsx("div", { className: "fx-stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-4", children: FEATURE_CARDS.map((card) => {
      const unlocked = canAccessFeature(card.featureKey);
      const needed = minTierForFeature(card.featureKey);
      return /* @__PURE__ */ jsxs(
        Card,
        {
          className: unlocked ? "fx-lift" : "border-dashed bg-slate-50/70",
          children: [
            /* @__PURE__ */ jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2 text-base", children: [
              /* @__PURE__ */ jsx(
                card.icon,
                {
                  className: `h-5 w-5 ${unlocked ? "text-emerald-600" : "text-slate-400"}`
                }
              ),
              card.title
            ] }) }),
            /* @__PURE__ */ jsxs(CardContent, { className: "text-sm text-slate-600", children: [
              /* @__PURE__ */ jsx("p", { children: card.body }),
              /* @__PURE__ */ jsx("p", { className: "mt-3", children: unlocked ? /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 text-xs font-semibold text-emerald-700", children: [
                /* @__PURE__ */ jsx(Check, { className: "h-3.5 w-3.5" }),
                " Included in your tier"
              ] }) : /* @__PURE__ */ jsxs(
                Link,
                {
                  to: "/membership/billing",
                  className: "inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-emerald-700",
                  children: [
                    /* @__PURE__ */ jsx(Lock, { className: "h-3.5 w-3.5" }),
                    needed ? `Needs ${tierLabel(needed)}` : "Not in your tier"
                  ]
                }
              ) })
            ] })
          ]
        },
        card.featureKey
      );
    }) }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "flex flex-wrap items-center justify-between gap-2", children: [
        /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(CalendarClock, { className: "h-5 w-5 text-emerald-600" }),
          "Upcoming member events"
        ] }),
        upcomingBooked > 0 && /* @__PURE__ */ jsxs("span", { className: "rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800", children: [
          upcomingBooked,
          " reserved"
        ] })
      ] }) }),
      /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx(EventList, { events, onBook: bookEvent, onCancel: cancelBooking }) })
    ] }),
    entitlements.length > 0 && /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Everything your tier unlocks" }) }),
      /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("ul", { className: "grid gap-2 sm:grid-cols-2", children: entitlements.map((key) => /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2 text-sm text-slate-700", children: [
        /* @__PURE__ */ jsx(Check, { className: "mt-0.5 h-4 w-4 shrink-0 text-emerald-600" }),
        featureLabel(key)
      ] }, key)) }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-3", children: [
      /* @__PURE__ */ jsx(Link, { to: "/membership", children: /* @__PURE__ */ jsx(Button, { variant: "outline", children: "Compare tiers" }) }),
      /* @__PURE__ */ jsx(Link, { to: "/membership/billing", children: /* @__PURE__ */ jsx(Button, { className: "bg-emerald-600 hover:bg-emerald-700", children: "Change tier" }) })
    ] })
  ] }) });
}
function Breadcrumbs({ crumbs }) {
  return /* @__PURE__ */ jsx("nav", { "aria-label": "Breadcrumb", className: "mb-6", children: /* @__PURE__ */ jsx("ol", { className: "flex flex-wrap items-center gap-1 text-sm text-slate-500", children: crumbs.map((c, i) => {
    const last = i === crumbs.length - 1;
    return /* @__PURE__ */ jsx("li", { className: "flex items-center gap-1", children: last ? /* @__PURE__ */ jsx("span", { "aria-current": "page", className: "text-slate-700 font-medium", children: c.name }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(Link, { to: c.path, className: "hover:text-emerald-700 transition-colors", children: c.name }),
      /* @__PURE__ */ jsx(ChevronRight, { className: "h-3.5 w-3.5 text-slate-400", "aria-hidden": "true" })
    ] }) }, c.path);
  }) }) });
}
function AnswerCapsule({ children }) {
  return /* @__PURE__ */ jsx("div", { className: "rounded-2xl bg-emerald-50 ring-1 ring-emerald-100 p-6 sm:p-7 mb-10", children: /* @__PURE__ */ jsx("p", { className: "text-lg leading-relaxed text-slate-800", children }) });
}
function PageHero({
  title,
  standfirst,
  crumbs,
  updated
}) {
  return /* @__PURE__ */ jsx("header", { className: "bg-gradient-to-b from-slate-50 to-white border-b border-slate-100", children: /* @__PURE__ */ jsxs("div", { className: "max-w-3xl mx-auto px-4 pt-10 pb-12 sm:pt-14 sm:pb-16", children: [
    /* @__PURE__ */ jsx(Breadcrumbs, { crumbs }),
    /* @__PURE__ */ jsx("h1", { className: "text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 text-balance", children: title }),
    standfirst && /* @__PURE__ */ jsx("p", { className: "mt-4 text-lg text-slate-600 leading-relaxed", children: standfirst }),
    updated && /* @__PURE__ */ jsxs("p", { className: "mt-6 text-sm text-slate-500", children: [
      "Last updated",
      " ",
      /* @__PURE__ */ jsx("time", { dateTime: updated, children: (/* @__PURE__ */ new Date(`${updated}T00:00:00Z`)).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC"
      }) })
    ] })
  ] }) });
}
function Prose({ children }) {
  return /* @__PURE__ */ jsx("div", { className: "max-w-3xl mx-auto px-4 py-12 sm:py-16 [&_p]:text-slate-700 [&_p]:leading-relaxed [&_p]:mb-5 [&_li]:text-slate-700 [&_li]:leading-relaxed", children });
}
function Section({
  id,
  heading,
  children
}) {
  return /* @__PURE__ */ jsxs("section", { "aria-labelledby": id, className: "mb-12", children: [
    /* @__PURE__ */ jsx(
      "h2",
      {
        id,
        className: "text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-4 scroll-mt-24",
        children: heading
      }
    ),
    children
  ] });
}
function FactRow({
  label,
  value,
  note
}) {
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 py-3 border-b border-slate-100 last:border-0", children: [
    /* @__PURE__ */ jsx("dt", { className: "text-sm font-medium text-slate-500 sm:w-56 shrink-0", children: label }),
    /* @__PURE__ */ jsxs("dd", { className: "text-slate-800", children: [
      value,
      note && /* @__PURE__ */ jsx("span", { className: "block text-sm text-slate-500 mt-0.5", children: note })
    ] })
  ] });
}
function RiskNotice({ className = "" }) {
  return /* @__PURE__ */ jsxs(
    "aside",
    {
      role: "note",
      className: `rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-relaxed text-amber-900 ${className}`,
      children: [
        /* @__PURE__ */ jsx("strong", { className: "font-semibold", children: "Capital is at risk." }),
        " Land and infrastructure investments are illiquid, returns are not guaranteed, and projected figures are estimates rather than promises. You may get back less than you put in. Read the",
        " ",
        /* @__PURE__ */ jsx(Link, { to: "/legal/risk-disclosure", className: "underline underline-offset-2 hover:text-amber-950", children: "full risk disclosure" }),
        " ",
        "before committing funds."
      ]
    }
  );
}
const TEAM = [];
const MILESTONES = [];
const TRACK_RECORD = [];
const hasTeam = () => TEAM.length > 0;
const hasMilestones = () => MILESTONES.length > 0;
const hasTrackRecord = () => TRACK_RECORD.length > 0;
const PATH$7 = "/about";
const UPDATED$6 = "2026-08-17";
const CRUMBS$7 = [
  { name: "Home", path: "/" },
  { name: "About", path: PATH$7 }
];
const TITLE$7 = "About FIBI";
const DESCRIPTION$7 = "FIBI is a Kenyan fractional land investment platform for eco-lodge, solar and agricultural projects. Who runs it, how projects are selected, and how to reach us.";
function About() {
  const jsonLd = [
    baseGraph(
      webPageSchema({
        name: TITLE$7,
        description: DESCRIPTION$7,
        path: PATH$7,
        dateModified: UPDATED$6
      }),
      breadcrumbSchema(CRUMBS$7)
    )
  ];
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Seo, { title: TITLE$7, description: DESCRIPTION$7, path: PATH$7, jsonLd }),
    /* @__PURE__ */ jsx(
      PageHero,
      {
        title: "About FIBI",
        standfirst: "A Kenyan platform for collective investment in land-backed projects.",
        crumbs: CRUMBS$7,
        updated: UPDATED$6
      }
    ),
    /* @__PURE__ */ jsxs(Prose, { children: [
      /* @__PURE__ */ jsx(AnswerCapsule, { children: "FIBI is a fractional land investment platform operating in Kenya. It lets several investors jointly fund a single land-backed project — eco-lodges, solar installations and agricultural developments — and share the returns in proportion to what each contributed. FIBI sources and vets projects, administers them through their term, and distributes returns to contributors." }),
      /* @__PURE__ */ jsxs(Section, { id: "what-we-do", heading: "What does FIBI do?", children: [
        /* @__PURE__ */ jsx("p", { children: "Land is the asset most Kenyans want to hold and the one that prices them out earliest. A parcel worth owning generally costs more than any single first-time investor can commit, which pushes people either into parcels too small to appreciate meaningfully or into schemes that promise land and deliver a receipt." }),
        /* @__PURE__ */ jsx("p", { children: "FIBI addresses the first problem directly: pooling capital so that a group can hold an asset none of them could hold alone. It addresses the second by publishing what each project is, where it is, what it is projected to return, and on what timeline — before anyone commits money." }),
        /* @__PURE__ */ jsx("p", { children: "We focus on projects with a productive use rather than raw speculative parcels. An eco-lodge, a solar installation or an agricultural development generates income during the holding period; bare land held for resale depends entirely on the exit price being higher than the entry price." })
      ] }),
      /* @__PURE__ */ jsxs(Section, { id: "selection", heading: "How are projects selected?", children: [
        /* @__PURE__ */ jsxs("p", { children: [
          "Every project listed on FIBI passes through title verification, commercial review and structuring before it appears on the platform. What that means in practice for Kenyan land is set out in our guide to",
          " ",
          /* @__PURE__ */ jsx(
            Link,
            {
              to: "/insights/land-title-verification-kenya-official-search",
              className: "text-emerald-700 underline underline-offset-2 hover:text-emerald-800",
              children: "verifying a Kenyan land title"
            }
          ),
          ", and the structures used to hold land fractionally are explained in",
          " ",
          /* @__PURE__ */ jsx(
            Link,
            {
              to: "/insights/how-fractional-land-ownership-works-in-kenya",
              className: "text-emerald-700 underline underline-offset-2 hover:text-emerald-800",
              children: "how fractional land ownership works in Kenya"
            }
          ),
          "."
        ] }),
        /* @__PURE__ */ jsx("p", { children: "Each project page states its funding target, minimum contribution, projected return, payout frequency and deadline. Those figures are projections based on assumptions specific to that project, not commitments." })
      ] }),
      hasTeam() && /* @__PURE__ */ jsx(Section, { id: "team", heading: "Who runs FIBI?", children: /* @__PURE__ */ jsx("div", { className: "not-prose grid sm:grid-cols-2 gap-5 mb-6", children: TEAM.map((m) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: "rounded-2xl bg-white p-6 ring-1 ring-slate-200 shadow-sm",
          children: [
            m.photo && /* @__PURE__ */ jsx(
              "img",
              {
                src: m.photo,
                alt: `${m.name}, ${m.role} at FIBI`,
                width: 80,
                height: 80,
                loading: "lazy",
                className: "h-20 w-20 rounded-full object-cover mb-4"
              }
            ),
            /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-slate-900", children: m.name }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-emerald-700 font-medium", children: m.role }),
            m.credentials && m.credentials.length > 0 && /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500 mt-1", children: m.credentials.join(" · ") }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-600 leading-relaxed mt-3", children: m.bio }),
            m.linkedin && /* @__PURE__ */ jsx(
              "a",
              {
                href: m.linkedin,
                rel: "noopener noreferrer",
                target: "_blank",
                className: "inline-block mt-3 text-sm text-emerald-700 underline underline-offset-2",
                children: "Professional profile"
              }
            )
          ]
        },
        m.name
      )) }) }),
      hasTrackRecord() && /* @__PURE__ */ jsx(Section, { id: "track-record", heading: "What is FIBI’s track record?", children: /* @__PURE__ */ jsx("dl", { className: "not-prose rounded-2xl bg-slate-50 p-6 ring-1 ring-slate-200 mb-4", children: TRACK_RECORD.map((s) => /* @__PURE__ */ jsxs("div", { className: "py-3 border-b border-slate-200 last:border-0", children: [
        /* @__PURE__ */ jsx("dt", { className: "text-sm text-slate-500", children: s.label }),
        /* @__PURE__ */ jsx("dd", { className: "text-2xl font-bold text-slate-900", children: s.value }),
        /* @__PURE__ */ jsx("dd", { className: "text-xs text-slate-500 mt-1", children: s.basis })
      ] }, s.label)) }) }),
      hasMilestones() && /* @__PURE__ */ jsx(Section, { id: "history", heading: "Operating history", children: /* @__PURE__ */ jsx("ol", { className: "not-prose space-y-4 mb-4", children: MILESTONES.map((m) => /* @__PURE__ */ jsxs("li", { className: "flex gap-4", children: [
        /* @__PURE__ */ jsx("span", { className: "text-sm font-mono text-emerald-700 w-20 shrink-0 pt-1", children: m.date }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "font-semibold text-slate-900", children: m.title }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-600", children: m.detail })
        ] })
      ] }, `${m.date}-${m.title}`)) }) }),
      /* @__PURE__ */ jsx(Section, { id: "contact", heading: "How do I get in touch?", children: /* @__PURE__ */ jsxs("p", { children: [
        "Questions about a specific project, about membership, or about how your interest would be held are all worth asking before you commit. Our",
        " ",
        /* @__PURE__ */ jsx(
          Link,
          {
            to: "/contact",
            className: "text-emerald-700 underline underline-offset-2 hover:text-emerald-800",
            children: "contact page"
          }
        ),
        " ",
        "lists the ways to reach us, and the",
        " ",
        /* @__PURE__ */ jsx(
          Link,
          {
            to: "/faq",
            className: "text-emerald-700 underline underline-offset-2 hover:text-emerald-800",
            children: "FAQ"
          }
        ),
        " ",
        "answers the questions we are asked most often."
      ] }) }),
      /* @__PURE__ */ jsx(RiskNotice, {})
    ] })
  ] });
}
const PATH$6 = "/contact";
const UPDATED$5 = "2026-08-17";
const CRUMBS$6 = [
  { name: "Home", path: "/" },
  { name: "Contact", path: PATH$6 }
];
const TITLE$6 = "Contact FIBI";
const DESCRIPTION$6 = "How to reach FIBI about a project, membership or an existing investment, and where the company is registered.";
function Contact() {
  const hasAddress = isSet(UNVERIFIED.addressLocality);
  const hasEmail = isSet(UNVERIFIED.email);
  const hasPhone = isSet(UNVERIFIED.telephone);
  const hasAnyChannel = hasEmail || hasPhone || hasAddress;
  const jsonLd = [
    baseGraph(
      webPageSchema({
        name: TITLE$6,
        description: DESCRIPTION$6,
        path: PATH$6,
        dateModified: UPDATED$5
      }),
      breadcrumbSchema(CRUMBS$6)
    )
  ];
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Seo, { title: TITLE$6, description: DESCRIPTION$6, path: PATH$6, jsonLd }),
    /* @__PURE__ */ jsx(
      PageHero,
      {
        title: "Contact FIBI",
        standfirst: "Questions about a project, membership, or an investment you already hold.",
        crumbs: CRUMBS$6,
        updated: UPDATED$5
      }
    ),
    /* @__PURE__ */ jsxs(Prose, { children: [
      /* @__PURE__ */ jsxs(AnswerCapsule, { children: [
        "You can reach FIBI through the channels listed below for questions about a specific project, about membership tiers, or about an investment you already hold. For questions that come up often — how ownership is structured, when returns are paid, what the risks are — the",
        " ",
        /* @__PURE__ */ jsx(Link, { to: "/faq", className: "text-emerald-800 underline underline-offset-2", children: "FAQ" }),
        " ",
        "is likely to answer faster."
      ] }),
      hasAnyChannel ? /* @__PURE__ */ jsx(Section, { id: "reach-us", heading: "How do I reach FIBI?", children: /* @__PURE__ */ jsxs("div", { className: "not-prose space-y-4", children: [
        hasEmail && /* @__PURE__ */ jsxs("div", { className: "flex gap-4 items-start rounded-2xl bg-white p-5 ring-1 ring-slate-200", children: [
          /* @__PURE__ */ jsx(Mail, { className: "h-5 w-5 text-emerald-600 mt-0.5 shrink-0", "aria-hidden": "true" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { className: "font-semibold text-slate-900", children: "Email" }),
            /* @__PURE__ */ jsx(
              "a",
              {
                href: `mailto:${UNVERIFIED.email}`,
                className: "text-emerald-700 underline underline-offset-2",
                children: UNVERIFIED.email
              }
            )
          ] })
        ] }),
        hasPhone && /* @__PURE__ */ jsxs("div", { className: "flex gap-4 items-start rounded-2xl bg-white p-5 ring-1 ring-slate-200", children: [
          /* @__PURE__ */ jsx(Phone, { className: "h-5 w-5 text-emerald-600 mt-0.5 shrink-0", "aria-hidden": "true" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { className: "font-semibold text-slate-900", children: "Phone" }),
            /* @__PURE__ */ jsx(
              "a",
              {
                href: `tel:${UNVERIFIED.telephone}`,
                className: "text-emerald-700 underline underline-offset-2",
                children: UNVERIFIED.telephone
              }
            )
          ] })
        ] }),
        hasAddress && /* @__PURE__ */ jsxs("div", { className: "flex gap-4 items-start rounded-2xl bg-white p-5 ring-1 ring-slate-200", children: [
          /* @__PURE__ */ jsx(MapPin, { className: "h-5 w-5 text-emerald-600 mt-0.5 shrink-0", "aria-hidden": "true" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { className: "font-semibold text-slate-900", children: "Registered office" }),
            /* @__PURE__ */ jsxs("address", { className: "not-italic text-slate-700", children: [
              isSet(UNVERIFIED.streetAddress) && /* @__PURE__ */ jsxs(Fragment, { children: [
                UNVERIFIED.streetAddress,
                /* @__PURE__ */ jsx("br", {})
              ] }),
              UNVERIFIED.addressLocality,
              isSet(UNVERIFIED.addressRegion) && `, ${UNVERIFIED.addressRegion}`,
              isSet(UNVERIFIED.postalCode) && ` ${UNVERIFIED.postalCode}`,
              /* @__PURE__ */ jsx("br", {}),
              "Kenya"
            ] })
          ] })
        ] })
      ] }) }) : (
        /*
          REQUIRED before launch: populate UNVERIFIED in src/app/seo/config.ts.
          Until then this page deliberately shows no contact channel rather
          than a fabricated one — and an investment platform with no reachable
          contact will not rank, nor should it.
        */
        /* @__PURE__ */ jsx(Section, { id: "reach-us", heading: "How do I reach FIBI?", children: /* @__PURE__ */ jsxs("p", { children: [
          "Contact details are being finalised. In the meantime, sign in to your account to raise a question about an existing investment, or browse the",
          " ",
          /* @__PURE__ */ jsx(
            Link,
            {
              to: "/faq",
              className: "text-emerald-700 underline underline-offset-2 hover:text-emerald-800",
              children: "frequently asked questions"
            }
          ),
          "."
        ] }) })
      ),
      /* @__PURE__ */ jsxs(Section, { id: "company-details", heading: "Company details", children: [
        isSet(UNVERIFIED.registrationNumber) ? /* @__PURE__ */ jsxs("p", { children: [
          "FIBI is registered in Kenya under company number",
          " ",
          /* @__PURE__ */ jsx("strong", { children: UNVERIFIED.registrationNumber }),
          "."
        ] }) : /* @__PURE__ */ jsx("p", { children: "Company registration details will be published here. If you are evaluating an investment and need them before we publish, ask us directly — a platform that will not identify its registered entity is one you should decline." }),
        isSet(UNVERIFIED.regulator) && isSet(UNVERIFIED.licenceNumber) ? /* @__PURE__ */ jsxs("p", { children: [
          "FIBI is licensed by ",
          UNVERIFIED.regulator,
          " under licence",
          " ",
          /* @__PURE__ */ jsx("strong", { children: UNVERIFIED.licenceNumber }),
          "."
        ] }) : (
          /*
            Do NOT replace this with an implied claim of regulated status.
            Holding out as licensed without a licence is an offence under the
            Capital Markets Act — state the true position, whichever it is.
          */
          /* @__PURE__ */ jsxs("p", { children: [
            "Details of FIBI’s regulatory status are set out in our",
            " ",
            /* @__PURE__ */ jsx(
              Link,
              {
                to: "/legal/risk-disclosure",
                className: "text-emerald-700 underline underline-offset-2 hover:text-emerald-800",
                children: "risk disclosure"
              }
            ),
            ". Confirm the regulatory position of any platform before committing funds, and check the register of the regulator it names."
          ] })
        )
      ] }),
      /* @__PURE__ */ jsx(Section, { id: "complaints", heading: "How do I raise a complaint?", children: /* @__PURE__ */ jsx("p", { children: "Raise the matter with us first, in writing, with your account details and the project concerned. If you are not satisfied with the outcome, you may be able to escalate to the relevant Kenyan authority depending on the nature of the complaint and FIBI’s regulatory status." }) })
    ] })
  ] });
}
const PATH$5 = "/how-it-works";
const UPDATED$4 = "2026-08-17";
const CRUMBS$5 = [
  { name: "Home", path: "/" },
  { name: "How it works", path: PATH$5 }
];
const TITLE$5 = "How FIBI works";
const DESCRIPTION$5 = "The five steps from opening a FIBI account to receiving distributions: verification, choosing a project, committing funds, funding close, and payouts.";
const STEPS = [
  {
    name: "Create an account and complete verification",
    text: "Register with your name and email, then complete identity verification. Verification is required to satisfy anti-money-laundering obligations and to confirm your eligibility to hold an interest in Kenyan land, which is restricted for non-citizens under Article 65 of the Constitution."
  },
  {
    name: "Review the open projects",
    text: "Each project page states the location, the funding target, the minimum contribution, the projected return, the payout frequency and the funding deadline. Read the projected return as an estimate built on assumptions specific to that project, and check what those assumptions are before relying on the figure."
  },
  {
    name: "Commit funds to the projects you choose",
    text: "Choose how much to contribute, at or above that project’s minimum, and complete payment through a supported method. Your contribution determines your proportional share of that project’s returns."
  },
  {
    name: "Wait for the project to reach its funding target",
    text: "A project proceeds once it reaches its funding target before the deadline. Acquisition, structuring and any required consents are completed at this stage, and the project moves into its operating phase."
  },
  {
    name: "Receive distributions over the project term",
    text: "Returns are distributed on the schedule published for that project — an agricultural project pays on harvest cycles, an operating lodge on trading income. Distributions depend on the project performing, and are not guaranteed."
  }
];
function HowItWorks() {
  const jsonLd = [
    baseGraph(
      webPageSchema({
        name: TITLE$5,
        description: DESCRIPTION$5,
        path: PATH$5,
        dateModified: UPDATED$4
      }),
      breadcrumbSchema(CRUMBS$5),
      howToSchema({
        name: "How to invest in a FIBI land project",
        description: DESCRIPTION$5,
        steps: STEPS
      })
    )
  ];
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Seo, { title: TITLE$5, description: DESCRIPTION$5, path: PATH$5, jsonLd }),
    /* @__PURE__ */ jsx(
      PageHero,
      {
        title: "How FIBI works",
        standfirst: "From opening an account to receiving distributions, in five steps.",
        crumbs: CRUMBS$5,
        updated: UPDATED$4
      }
    ),
    /* @__PURE__ */ jsxs(Prose, { children: [
      /* @__PURE__ */ jsx(AnswerCapsule, { children: "Investing through FIBI takes five steps: create an account and complete identity verification, review the open projects and their published terms, commit funds to the projects you choose, wait for the project to reach its funding target, then receive distributions on that project’s payout schedule. Your share of returns is proportional to what you contributed." }),
      /* @__PURE__ */ jsx(Section, { id: "steps", heading: "What are the steps to invest?", children: /* @__PURE__ */ jsx("ol", { className: "not-prose space-y-5 mb-8", children: STEPS.map((s, i) => /* @__PURE__ */ jsxs(
        "li",
        {
          className: "flex gap-5 rounded-2xl bg-white p-6 ring-1 ring-slate-200 shadow-sm",
          children: [
            /* @__PURE__ */ jsx(
              "span",
              {
                "aria-hidden": "true",
                className: "h-10 w-10 shrink-0 rounded-2xl bg-emerald-600 text-white font-bold flex items-center justify-center",
                children: i + 1
              }
            ),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h3", { className: "font-semibold text-slate-900 text-lg mb-1", children: s.name }),
              /* @__PURE__ */ jsx("p", { className: "text-slate-600 leading-relaxed", children: s.text })
            ] })
          ]
        },
        s.name
      )) }) }),
      /* @__PURE__ */ jsxs(Section, { id: "what-you-own", heading: "What do you own after investing?", children: [
        /* @__PURE__ */ jsx("p", { children: "You hold an interest in the entity that owns the project asset, rather than a title deed in your own name for a subdivided parcel. Which instrument records that interest — a shareholding, a beneficial interest under a trust, or a co-tenancy on the title — is set out in each project’s offer documents, and it determines your rights on exit." }),
        /* @__PURE__ */ jsxs("p", { children: [
          "The differences between those structures are substantial and worth understanding before you commit. We cover them in",
          " ",
          /* @__PURE__ */ jsx(
            Link,
            {
              to: "/insights/how-fractional-land-ownership-works-in-kenya",
              className: "text-emerald-700 underline underline-offset-2 hover:text-emerald-800",
              children: "how fractional land ownership works in Kenya"
            }
          ),
          "."
        ] })
      ] }),
      /* @__PURE__ */ jsx(Section, { id: "timeline", heading: "How long is my money committed?", children: /* @__PURE__ */ jsx("p", { children: "Each project publishes its own term, and fractional land interests are illiquid: there is no exchange on which to sell a share, so you should plan on your capital being committed for the full term shown at the time you invest. Treat the published term as a floor rather than a precise estimate — property and infrastructure projects commonly run past their target dates." }) }),
      /* @__PURE__ */ jsx(Section, { id: "next", heading: "Where do I start?", children: /* @__PURE__ */ jsxs("p", { children: [
        "Browse the",
        " ",
        /* @__PURE__ */ jsx(
          Link,
          {
            to: "/projects",
            className: "text-emerald-700 underline underline-offset-2 hover:text-emerald-800",
            children: "open projects"
          }
        ),
        " ",
        "to see what is currently accepting contributions, or read the",
        " ",
        /* @__PURE__ */ jsx(
          Link,
          {
            to: "/faq",
            className: "text-emerald-700 underline underline-offset-2 hover:text-emerald-800",
            children: "FAQ"
          }
        ),
        " ",
        "for the questions investors ask most. If you are weighing membership tiers, the",
        " ",
        /* @__PURE__ */ jsx(
          Link,
          {
            to: "/membership",
            className: "text-emerald-700 underline underline-offset-2 hover:text-emerald-800",
            children: "membership page"
          }
        ),
        " ",
        "lists what each one unlocks."
      ] }) }),
      /* @__PURE__ */ jsx(RiskNotice, {})
    ] })
  ] });
}
const FAQS = [
  {
    category: "Getting started",
    question: "What is fractional land investment?",
    answer: "Fractional land investment lets several people jointly fund a single land or infrastructure project and share the returns in proportion to what each contributed. Instead of buying a whole parcel alone, you buy a defined share of one project. It lowers the entry cost of land exposure and spreads a single buyer’s risk across more than one asset, but the shares are not traded on an exchange and cannot be sold on demand."
  },
  {
    category: "Getting started",
    question: "How does FIBI work?",
    answer: "FIBI lists vetted land-backed projects in Kenya — eco-lodges, solar installations and agricultural developments. You browse open projects, review each one’s funding target, projected return and timeline, then commit funds to the projects you choose. FIBI administers the project and distributes returns to contributors according to the payout schedule published on that project’s page."
  },
  {
    category: "Getting started",
    question: "Who can invest through FIBI?",
    answer: "You need to create an account, complete identity verification and meet the eligibility conditions attached to the specific project you want to join. Verification exists to satisfy anti-money-laundering obligations and to confirm you are entitled to hold an interest in Kenyan land, which is subject to constitutional restrictions on non-citizen ownership.",
    needsCompanyReview: true
  },
  {
    category: "Getting started",
    question: "What is the minimum amount needed to start?",
    answer: 'Each project sets its own minimum contribution, shown on that project’s page before you commit. [REVIEW: state the platform-wide floor, e.g. "Minimums currently start from KES X." Do not publish without confirming.]',
    needsCompanyReview: true
  },
  {
    category: "Ownership & legal",
    question: "What exactly do I own when I invest in a project?",
    answer: "You hold a contractual interest in the project entity that owns the underlying land or asset, not a title deed in your own name for a subdivided parcel. The specific instrument, the entity that holds the title and your rights on exit are set out in that project’s offer documents, which you should read in full before committing.",
    needsCompanyReview: true
  },
  {
    category: "Ownership & legal",
    question: "How is land title verified before a project is listed?",
    answer: "Title verification for Kenyan land involves an official search at the relevant land registry to confirm the registered proprietor and any encumbrances, confirmation of rates and rent clearance, and confirmation that any required land control board consent can be obtained. [REVIEW: describe FIBI’s actual due-diligence steps and who performs them — an unattributed process claim carries no weight.]",
    needsCompanyReview: true
  },
  {
    category: "Ownership & legal",
    question: "Can non-Kenyans invest in FIBI projects?",
    answer: "Kenya’s Constitution restricts non-citizens to leasehold interests capped at 99 years, and freehold agricultural land cannot be held by non-citizens. Whether a given project is open to non-citizens therefore depends on how that project’s land is held. Check the eligibility section on each project page.",
    needsCompanyReview: true
  },
  {
    category: "Money",
    question: "What fees does FIBI charge?",
    answer: "[REVIEW: state every fee — platform fee, management fee, performance share, exit or transfer fees — with the exact basis of calculation. Undisclosed fees are both a trust failure and a regulatory exposure. This answer must not go live in placeholder form.]",
    needsCompanyReview: true
  },
  {
    category: "Money",
    question: "How and when are returns paid out?",
    answer: "Each project publishes its own payout frequency and expected first distribution date on its project page, because returns follow the underlying asset — an agricultural project pays on harvest cycles, a lodge on operating income. Distributions are made to the payout method registered on your account and are subject to the project performing as projected."
  },
  {
    category: "Money",
    question: "Are returns on FIBI projects guaranteed?",
    answer: "No. Figures shown as projected returns are estimates based on assumptions about yield, occupancy, commodity prices or energy output, and those assumptions can prove wrong. Returns may be lower than projected, delayed, or absent entirely, and you may lose some or all of the capital you commit."
  },
  {
    category: "Money",
    question: "How is my money handled between commitment and project funding?",
    answer: "[REVIEW: describe the actual custody arrangement — which regulated institution holds committed funds before a project closes, and what happens to your money if the project fails to reach its funding target. This is the question a cautious investor asks first.]",
    needsCompanyReview: true
  },
  {
    category: "Risk",
    question: "What are the main risks of fractional land investment?",
    answer: "The principal risks are illiquidity, because there is no ready secondary market and you may be unable to exit before the project term ends; project execution risk, where construction or agricultural operations run over budget or behind schedule; title and regulatory risk affecting the underlying land; concentration risk if you hold few projects; and total loss of capital. Land values can fall as well as rise."
  },
  {
    category: "Risk",
    question: "Can I sell my share early or withdraw before the project ends?",
    answer: "Fractional land interests are illiquid by nature and should be treated as committed for the full project term shown at the time you invest. [REVIEW: state whether any secondary transfer or buy-back mechanism exists, and on what terms. If none exists, say so plainly — that is the honest answer and it is what a careful investor needs.]",
    needsCompanyReview: true
  },
  {
    category: "Risk",
    question: "What happens if a project fails or FIBI ceases to operate?",
    answer: "[REVIEW: describe the actual insolvency and wind-down arrangements — whether project assets are ring-fenced from the platform operator, and who administers a project if FIBI stops trading. Investors are entitled to this answer before they commit.]",
    needsCompanyReview: true
  },
  {
    category: "Risk",
    question: "Is FIBI regulated?",
    answer: "[REVIEW: state the regulator and licence number if FIBI is licensed, or state plainly that the platform is not licensed and what that means for investor protection. Do not publish an implied or ambiguous claim of regulated status — in Kenya that is an offence under the Capital Markets Act, not merely an SEO problem.]",
    needsCompanyReview: true
  },
  {
    category: "Membership",
    question: "What does FIBI membership include?",
    answer: "Membership tiers control which projects and platform features you can access, and each tier’s entitlements are listed on the membership page. Membership is separate from any individual investment — paying for membership does not itself buy you a share in a project."
  },
  {
    category: "Membership",
    question: "Do I need to be a member to invest?",
    answer: "Some projects are open to any verified account while others are limited to members at a given tier. The access conditions are shown on each project page, and the membership page lists which tier unlocks what.",
    needsCompanyReview: true
  }
];
const publishableFaqs = FAQS.filter((f) => !f.needsCompanyReview);
const faqEntriesForSchema = publishableFaqs.map(
  ({ question, answer }) => ({ question, answer })
);
const FAQ_CATEGORIES = [
  "Getting started",
  "Ownership & legal",
  "Money",
  "Risk",
  "Membership"
];
const PATH$4 = "/faq";
const UPDATED$3 = "2026-08-17";
const CRUMBS$4 = [
  { name: "Home", path: "/" },
  { name: "FAQ", path: PATH$4 }
];
const TITLE$4 = "Frequently asked questions";
const DESCRIPTION$4 = "Answers on fractional land investment with FIBI: what you own, how title is verified, how returns are paid, the risks, and membership.";
const isDev = false;
function Faq() {
  const jsonLd = [
    baseGraph(
      webPageSchema({
        name: TITLE$4,
        description: DESCRIPTION$4,
        path: PATH$4,
        dateModified: UPDATED$3
      }),
      breadcrumbSchema(CRUMBS$4),
      // Only reviewed answers are asserted as machine-readable claims.
      faqSchema(faqEntriesForSchema)
    )
  ];
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Seo, { title: TITLE$4, description: DESCRIPTION$4, path: PATH$4, jsonLd }),
    /* @__PURE__ */ jsx(
      PageHero,
      {
        title: "Frequently asked questions",
        standfirst: "What you own, how returns work, and what can go wrong.",
        crumbs: CRUMBS$4,
        updated: UPDATED$3
      }
    ),
    /* @__PURE__ */ jsxs(Prose, { children: [
      /* @__PURE__ */ jsx(AnswerCapsule, { children: "Fractional land investment lets several people jointly fund one land-backed project and share the returns in proportion to what each contributed. The answers below cover what your interest actually consists of, how Kenyan title is verified, when distributions are paid, and the risks — including illiquidity and the possibility of losing capital." }),
      FAQ_CATEGORIES.map((category) => {
        const entries = FAQS.filter((f) => f.category === category);
        if (entries.length === 0) return null;
        return /* @__PURE__ */ jsxs("section", { "aria-labelledby": `faq-${category}`, className: "mb-12", children: [
          /* @__PURE__ */ jsx(
            "h2",
            {
              id: `faq-${category}`,
              className: "text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-5 scroll-mt-24",
              children: category
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "not-prose space-y-4", children: entries.map((f) => /* @__PURE__ */ jsxs(
            "article",
            {
              className: "rounded-2xl bg-white p-6 ring-1 ring-slate-200 shadow-sm",
              children: [
                /* @__PURE__ */ jsx("h3", { className: "font-semibold text-slate-900 text-lg mb-2", children: f.question }),
                /* @__PURE__ */ jsx("p", { className: "text-slate-600 leading-relaxed", children: f.answer }),
                isDev
              ]
            },
            f.question
          )) })
        ] }, category);
      }),
      /* @__PURE__ */ jsxs("p", { children: [
        "Still unsure about something?",
        " ",
        /* @__PURE__ */ jsx(
          Link,
          {
            to: "/contact",
            className: "text-emerald-700 underline underline-offset-2 hover:text-emerald-800",
            children: "Get in touch"
          }
        ),
        " ",
        "— and read the full",
        " ",
        /* @__PURE__ */ jsx(
          Link,
          {
            to: "/legal/risk-disclosure",
            className: "text-emerald-700 underline underline-offset-2 hover:text-emerald-800",
            children: "risk disclosure"
          }
        ),
        " ",
        "before committing funds."
      ] }),
      /* @__PURE__ */ jsx(RiskNotice, {})
    ] })
  ] });
}
const PATH$3 = "/legal/risk-disclosure";
const UPDATED$2 = "2026-08-17";
const CRUMBS$3 = [
  { name: "Home", path: "/" },
  { name: "Legal", path: "/legal/risk-disclosure" },
  { name: "Risk disclosure", path: PATH$3 }
];
const TITLE$3 = "Investment risk disclosure";
const DESCRIPTION$3 = "The risks of fractional land investment in Kenya: illiquidity, project execution, title and regulatory risk, concentration, and total loss of capital.";
function RiskDisclosure() {
  const jsonLd = [
    baseGraph(
      webPageSchema({
        name: TITLE$3,
        description: DESCRIPTION$3,
        path: PATH$3,
        dateModified: UPDATED$2
      }),
      breadcrumbSchema(CRUMBS$3)
    )
  ];
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Seo, { title: TITLE$3, description: DESCRIPTION$3, path: PATH$3, jsonLd }),
    /* @__PURE__ */ jsx(
      PageHero,
      {
        title: "Investment risk disclosure",
        standfirst: "Read this before committing funds to any project on this platform.",
        crumbs: CRUMBS$3,
        updated: UPDATED$2
      }
    ),
    /* @__PURE__ */ jsxs(Prose, { children: [
      /* @__PURE__ */ jsx(AnswerCapsule, { children: "Fractional land investment can lose you money, including all of it. The principal risks are illiquidity — there is no market on which to sell your interest before the project term ends — together with project execution risk, title and regulatory risk affecting the underlying land, concentration risk, and the risk that projected returns are simply not achieved. Projected figures are estimates, not commitments." }),
      /* @__PURE__ */ jsxs(Section, { id: "capital", heading: "You can lose your capital", children: [
        /* @__PURE__ */ jsx("p", { children: "Every project on this platform puts your capital at risk. Land values can fall as well as rise, developments can fail to complete, and operating businesses built on land can trade at a loss. You may receive back less than you contributed, and in an adverse case you may receive nothing." }),
        /* @__PURE__ */ jsx("p", { children: "Do not commit money you cannot afford to lose, and do not commit money you expect to need back on a particular date." })
      ] }),
      /* @__PURE__ */ jsx(Section, { id: "illiquidity", heading: "Your investment is illiquid", children: /* @__PURE__ */ jsx("p", { children: "There is no exchange or established secondary market for fractional land interests in Kenya. Once you commit funds, you should assume your capital is locked in for the full project term, which is commonly measured in years. Any transfer or buy-back facility, if one exists at all, will be set out in that project’s documents and will operate on terms set there — not on demand." }) }),
      /* @__PURE__ */ jsx(Section, { id: "projections", heading: "Projected returns are estimates, not promises", children: /* @__PURE__ */ jsx("p", { children: "A projected return is arithmetic performed on assumptions: yields per hectare, occupancy rates, energy output, commodity prices, exit values. Each of those assumptions can prove wrong, and they tend to be wrong together rather than independently. Past performance of any project, whether on this platform or elsewhere, does not indicate future results." }) }),
      /* @__PURE__ */ jsx(Section, { id: "execution", heading: "Projects can fail to execute", children: /* @__PURE__ */ jsx("p", { children: "Construction runs over budget and behind schedule. Agricultural output depends on rainfall, pests and input costs. Operating businesses depend on demand that may not materialise. Delays compound: a project that returns capital three years late has produced a materially worse outcome than the same project on time, even if the nominal return is unchanged." }) }),
      /* @__PURE__ */ jsxs(Section, { id: "title", heading: "Title and regulatory risk", children: [
        /* @__PURE__ */ jsx("p", { children: "Interests in Kenyan land carry specific legal risks. A title can be challenged or revoked where it was irregularly issued. Transactions in agricultural land require Land Control Board consent under the Land Control Act, and a controlled transaction entered into without that consent is void. Article 65 of the Constitution restricts non-citizens to leasehold interests capped at 99 years, which limits who may hold certain assets." }),
        /* @__PURE__ */ jsxs("p", { children: [
          "Leasehold interests decline in value as the residual term shortens, and a lease extension is an application rather than an entitlement. These are explained further in our guides to",
          " ",
          /* @__PURE__ */ jsx(
            Link,
            {
              to: "/insights/freehold-vs-leasehold-land-kenya",
              className: "text-emerald-700 underline underline-offset-2 hover:text-emerald-800",
              children: "freehold and leasehold tenure"
            }
          ),
          " ",
          "and",
          " ",
          /* @__PURE__ */ jsx(
            Link,
            {
              to: "/insights/land-title-verification-kenya-official-search",
              className: "text-emerald-700 underline underline-offset-2 hover:text-emerald-800",
              children: "title verification"
            }
          ),
          "."
        ] })
      ] }),
      /* @__PURE__ */ jsx(Section, { id: "structure", heading: "You may not hold the land directly", children: /* @__PURE__ */ jsx("p", { children: "In most fractional arrangements you hold a shareholding, a beneficial interest under a trust, or a contractual interest — not a title deed in your own name. Your protections follow from that instrument. A contractual profit share, in particular, gives you no proprietary interest in the land at all and leaves you an unsecured creditor of the operator. Establish which instrument applies before you commit." }) }),
      /* @__PURE__ */ jsx(Section, { id: "concentration", heading: "Concentration and platform risk", children: /* @__PURE__ */ jsx("p", { children: "Holding one or two projects concentrates your exposure to specific locations, sectors and counterparties. Separately, you are exposed to this platform continuing to operate: if project assets are not ring-fenced from the operator, an operator failure can affect your investment regardless of how the underlying project performs." }) }),
      /* @__PURE__ */ jsx(Section, { id: "regulatory-status", heading: "Regulatory status and investor protection", children: isSet(UNVERIFIED.regulator) && isSet(UNVERIFIED.licenceNumber) ? /* @__PURE__ */ jsxs("p", { children: [
        "FIBI is licensed by ",
        UNVERIFIED.regulator,
        " under licence",
        " ",
        /* @__PURE__ */ jsx("strong", { children: UNVERIFIED.licenceNumber }),
        ". Confirm the current status of that licence on the regulator’s public register before investing."
      ] }) : (
        /*
          REQUIRED before launch: replace with a plain statement of the true
          regulatory position. If the platform is unlicensed, say so and say
          what protections are therefore unavailable. Ambiguity here is not a
          drafting choice — it is a misrepresentation risk under the Capital
          Markets Act.
        */
        /* @__PURE__ */ jsxs("p", { children: [
          /* @__PURE__ */ jsx("strong", { children: "FIBI’s regulatory status is being confirmed and will be stated here in full." }),
          " ",
          "Do not assume that an investment offered through this platform carries statutory investor protection, compensation-scheme cover or an ombudsman route. Ask us directly, and verify any regulatory claim against the regulator’s own public register rather than the platform’s description of it."
        ] })
      ) }),
      /* @__PURE__ */ jsx(Section, { id: "tax", heading: "Tax", children: /* @__PURE__ */ jsx("p", { children: "The tax treatment of your investment depends on your circumstances and on how the interest is held — a shareholding, a trust interest and direct co-ownership are not taxed alike. Kenyan land disposals may attract capital gains tax, and distributions may be subject to withholding. Nothing on this site is tax advice. Take your own advice from a qualified adviser before investing." }) }),
      /* @__PURE__ */ jsx(Section, { id: "not-advice", heading: "This is not financial advice", children: /* @__PURE__ */ jsx("p", { children: "The information on this platform is general and does not take account of your objectives, financial situation or needs. Nothing here is a personal recommendation to invest in any project. If you are unsure whether an investment is suitable for you, consult an independent financial adviser authorised to advise on investments in Kenya." }) })
    ] })
  ] });
}
const LEGAL_DRAFT = true;
function DraftNotice({ document: document2 }) {
  return /* @__PURE__ */ jsxs(
    "div",
    {
      role: "note",
      className: "rounded-2xl border border-amber-300 bg-amber-50 p-5 mb-10 text-sm leading-relaxed text-amber-900",
      children: [
        /* @__PURE__ */ jsx("strong", { className: "font-semibold", children: "This document is not yet in force." }),
        " ",
        "FIBI’s ",
        document2,
        " is being prepared with legal counsel. The headings below show what it will cover. Nothing on this page creates rights or obligations, and it should not be relied on. For the risks of investing — which are set out in full and are current — read the",
        " ",
        /* @__PURE__ */ jsx(
          Link,
          {
            to: "/legal/risk-disclosure",
            className: "underline underline-offset-2 hover:text-amber-950",
            children: "risk disclosure"
          }
        ),
        "."
      ]
    }
  );
}
const PATH$2 = "/legal/terms";
const UPDATED$1 = "2026-08-17";
const CRUMBS$2 = [
  { name: "Home", path: "/" },
  { name: "Legal", path: "/legal/terms" },
  { name: "Terms of service", path: PATH$2 }
];
const TITLE$2 = "Terms of service";
const DESCRIPTION$2 = "The terms governing use of the FIBI platform, account obligations, and the basis on which projects are offered.";
function Terms() {
  const jsonLd = [];
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      Seo,
      {
        title: TITLE$2,
        description: DESCRIPTION$2,
        path: PATH$2,
        noindex: LEGAL_DRAFT,
        jsonLd
      }
    ),
    /* @__PURE__ */ jsx(
      PageHero,
      {
        title: "Terms of service",
        standfirst: "The agreement between you and FIBI when you use this platform.",
        crumbs: CRUMBS$2,
        updated: UPDATED$1
      }
    ),
    /* @__PURE__ */ jsxs(Prose, { children: [
      /* @__PURE__ */ jsx(DraftNotice, { document: "terms of service" }),
      /* @__PURE__ */ jsx(Section, { id: "scope", heading: "1. Who these terms apply to", children: /* @__PURE__ */ jsx("p", { children: "Covers acceptance, the parties, and the relationship between these terms and the offer documents for an individual project." }) }),
      /* @__PURE__ */ jsx(Section, { id: "eligibility", heading: "2. Eligibility and account registration", children: /* @__PURE__ */ jsx("p", { children: "Covers minimum age, identity verification and anti-money-laundering obligations, the accuracy of information you provide, and the constitutional restrictions on non-citizens holding interests in Kenyan land." }) }),
      /* @__PURE__ */ jsx(Section, { id: "account", heading: "3. Your account and security", children: /* @__PURE__ */ jsx("p", { children: "Covers credential security, responsibility for activity on the account, and notification obligations on suspected compromise." }) }),
      /* @__PURE__ */ jsx(Section, { id: "offers", heading: "4. How projects are offered", children: /* @__PURE__ */ jsx("p", { children: "Covers the status of information on project pages, the precedence of a project’s own offer documents over marketing material, and the platform’s role as administrator rather than adviser." }) }),
      /* @__PURE__ */ jsx(Section, { id: "commitments", heading: "5. Commitments, payment and cancellation", children: /* @__PURE__ */ jsx("p", { children: "Covers when a commitment becomes binding, accepted payment methods, any cooling-off period, and what happens to committed funds if a project does not reach its funding target." }) }),
      /* @__PURE__ */ jsx(Section, { id: "fees", heading: "6. Fees", children: /* @__PURE__ */ jsxs("p", { children: [
        "Covers every fee charged, its basis of calculation, and how changes are notified. Must reconcile exactly with the fees stated on the",
        " ",
        /* @__PURE__ */ jsx(
          Link,
          {
            to: "/faq",
            className: "text-emerald-700 underline underline-offset-2 hover:text-emerald-800",
            children: "FAQ"
          }
        ),
        " ",
        "and on project pages."
      ] }) }),
      /* @__PURE__ */ jsx(Section, { id: "distributions", heading: "7. Distributions", children: /* @__PURE__ */ jsx("p", { children: "Covers how and when returns are paid, deductions and withholding, and what happens where a project underperforms or fails." }) }),
      /* @__PURE__ */ jsx(Section, { id: "membership", heading: "8. Membership", children: /* @__PURE__ */ jsx("p", { children: "Covers tier entitlements, billing and renewal, cancellation, and the separation between membership fees and investment commitments." }) }),
      /* @__PURE__ */ jsx(Section, { id: "risk", heading: "9. Risk acknowledgement", children: /* @__PURE__ */ jsxs("p", { children: [
        "Covers the user’s acknowledgement of the matters set out in the",
        " ",
        /* @__PURE__ */ jsx(
          Link,
          {
            to: "/legal/risk-disclosure",
            className: "text-emerald-700 underline underline-offset-2 hover:text-emerald-800",
            children: "risk disclosure"
          }
        ),
        ", which is published in full and should be read before committing funds."
      ] }) }),
      /* @__PURE__ */ jsx(Section, { id: "liability", heading: "10. Liability", children: /* @__PURE__ */ jsx("p", { children: "Covers the limits of the platform’s liability and the losses excluded, subject to the liabilities that cannot lawfully be excluded under Kenyan law." }) }),
      /* @__PURE__ */ jsx(Section, { id: "termination", heading: "11. Suspension and termination", children: /* @__PURE__ */ jsx("p", { children: "Covers grounds for suspending or closing an account and the effect of closure on investments already made." }) }),
      /* @__PURE__ */ jsx(Section, { id: "disputes", heading: "12. Governing law and disputes", children: /* @__PURE__ */ jsx("p", { children: "Covers governing law, the complaints procedure, and the forum for resolving disputes." }) })
    ] })
  ] });
}
const PATH$1 = "/legal/privacy";
const UPDATED = "2026-08-17";
const CRUMBS$1 = [
  { name: "Home", path: "/" },
  { name: "Legal", path: "/legal/privacy" },
  { name: "Privacy policy", path: PATH$1 }
];
const TITLE$1 = "Privacy policy";
const DESCRIPTION$1 = "How FIBI collects, uses and protects personal data, and your rights under the Kenyan Data Protection Act 2019.";
function Privacy() {
  const jsonLd = [];
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      Seo,
      {
        title: TITLE$1,
        description: DESCRIPTION$1,
        path: PATH$1,
        noindex: LEGAL_DRAFT,
        jsonLd
      }
    ),
    /* @__PURE__ */ jsx(
      PageHero,
      {
        title: "Privacy policy",
        standfirst: "What personal data FIBI holds, why, and what you can ask us to do with it.",
        crumbs: CRUMBS$1,
        updated: UPDATED
      }
    ),
    /* @__PURE__ */ jsxs(Prose, { children: [
      /* @__PURE__ */ jsx(DraftNotice, { document: "privacy policy" }),
      /* @__PURE__ */ jsx(Section, { id: "controller", heading: "1. Who is the data controller", children: /* @__PURE__ */ jsx("p", { children: "Identifies the registered entity acting as data controller, its registration with the Office of the Data Protection Commissioner, and how to contact the data protection officer." }) }),
      /* @__PURE__ */ jsx(Section, { id: "data", heading: "2. What data we collect", children: /* @__PURE__ */ jsx("p", { children: "Covers account details, identity and verification documents collected to meet anti-money-laundering obligations, payment information, investment records, and technical data such as device and usage information." }) }),
      /* @__PURE__ */ jsx(Section, { id: "basis", heading: "3. Why we process it, and on what lawful basis", children: /* @__PURE__ */ jsx("p", { children: "States a lawful basis for each purpose under the Data Protection Act 2019 — contract performance for administering investments, legal obligation for identity verification and record-keeping, legitimate interests for fraud prevention, and consent for marketing." }) }),
      /* @__PURE__ */ jsx(Section, { id: "sharing", heading: "4. Who we share data with", children: /* @__PURE__ */ jsx("p", { children: "Covers payment processors, identity verification providers, professional advisers, project counterparties, and disclosures required by law or by a regulator." }) }),
      /* @__PURE__ */ jsx(Section, { id: "transfers", heading: "5. Transfers outside Kenya", children: /* @__PURE__ */ jsx("p", { children: "Covers any processing outside Kenya and the safeguards relied on, as required where personal data leaves the jurisdiction." }) }),
      /* @__PURE__ */ jsx(Section, { id: "retention", heading: "6. How long we keep it", children: /* @__PURE__ */ jsx("p", { children: "Sets retention periods by category, including the statutory minimum retention applying to anti-money-laundering records after an account closes." }) }),
      /* @__PURE__ */ jsx(Section, { id: "rights", heading: "7. Your rights", children: /* @__PURE__ */ jsx("p", { children: "Covers the rights to be informed, to access, to correction, to erasure, to object, and to data portability, how to exercise each, and the right to complain to the Office of the Data Protection Commissioner." }) }),
      /* @__PURE__ */ jsx(Section, { id: "cookies", heading: "8. Cookies and analytics", children: /* @__PURE__ */ jsx("p", { children: "Covers cookies set by the platform, any analytics or advertising technology in use, and how to control them. Must match what the site actually sets — a policy describing tooling that is not deployed, or omitting tooling that is, is the most common compliance gap." }) }),
      /* @__PURE__ */ jsx(Section, { id: "security", heading: "9. How we protect data", children: /* @__PURE__ */ jsx("p", { children: "Covers technical and organisational security measures and the breach notification procedure." }) }),
      /* @__PURE__ */ jsx(Section, { id: "changes", heading: "10. Changes to this policy", children: /* @__PURE__ */ jsx("p", { children: "Covers how material changes are notified and where prior versions sit." }) })
    ] })
  ] });
}
const INSIGHTS = [
  {
    slug: "how-fractional-land-ownership-works-in-kenya",
    title: "How fractional land ownership works in Kenya",
    description: "How several investors jointly hold Kenyan land, the structures used to do it legally, and what each one means for your rights on exit.",
    answer: "Fractional land ownership in Kenya means several investors jointly fund one parcel or development and share returns in proportion to their contribution. Because Kenyan land registries record a defined proprietor rather than a pool of contributors, the interest is normally held through a company, a trust, or co-tenancy on the title. The structure chosen determines your legal rights, your exit route, and your tax position.",
    published: "2026-02-10",
    updated: "2026-08-17",
    readingMinutes: 8,
    topic: "Ownership structures",
    body: [
      {
        kind: "p",
        text: 'Buying land outright in Kenya prices most people out of the market well before they reach the parcels worth owning. Fractional models exist to close that gap, but "fractional" describes a commercial arrangement, not a legal one — and the legal structure underneath is what actually determines what you own.'
      },
      { kind: "h2", id: "structures", text: "What structures are used to hold land fractionally?" },
      {
        kind: "p",
        text: "Kenyan land registries record a registered proprietor. They do not record fifty contributors against one parcel. Fractional arrangements therefore interpose a legal person or a defined co-ownership between the investors and the title. Four structures do most of the work:"
      },
      {
        kind: "ul",
        items: [
          "Special purpose company. A limited company registered under the Companies Act 2015 holds the title, and investors hold shares. Your interest is a shareholding, transferable by share transfer without touching the land register.",
          "Trust. A trustee holds the legal title for beneficiaries under a trust deed. Common where investors want the asset ring-fenced from an operator's own balance sheet.",
          "Co-tenancy on the title. The Land Registration Act 2012 recognises joint tenancy and tenancy in common. Tenancy in common gives each holder a distinct, inheritable share; joint tenancy carries survivorship, where a deceased holder's interest passes to the survivors rather than to their estate.",
          "Sectional titles. Under the Sectional Properties Act 2020, a building can be subdivided into individually titled units with shared common property. This produces a real title in your own name, but it applies to units in a development, not to raw land."
        ]
      },
      {
        kind: "note",
        text: "The distinction that matters most: a share in a company that owns land is not land. It is a security. Your protections, your exit mechanics and your tax treatment all follow from that, and they differ substantially from holding a title deed."
      },
      { kind: "h2", id: "what-you-own", text: "What do you actually own?" },
      {
        kind: "p",
        text: 'Ask any platform to name the instrument. A credible answer identifies the entity on the title, the document that records your interest, and the register on which that interest appears. If the answer is only that you own "a fraction of the land", the arrangement has not been thought through — or it has, and the detail is unflattering.'
      },
      {
        kind: "facts",
        rows: [
          {
            label: "Company shareholding",
            value: "Interest recorded in the company register",
            note: "Transferable by share transfer; you are exposed to the company's liabilities and governance."
          },
          {
            label: "Trust beneficiary",
            value: "Interest recorded in the trust deed",
            note: "Assets ring-fenced from the trustee's own creditors where the trust is validly constituted."
          },
          {
            label: "Tenancy in common",
            value: "Name appears on the land title",
            note: "Strongest position; also the least practical above a handful of co-owners."
          },
          {
            label: "Contractual profit share",
            value: "No proprietary interest at all",
            note: "You are an unsecured creditor of the operator. Treat with caution."
          }
        ]
      },
      { kind: "h2", id: "restrictions", text: "Who is legally allowed to hold Kenyan land?" },
      {
        kind: "p",
        text: "Article 65 of the Constitution of Kenya 2010 limits non-citizens to leasehold interests not exceeding 99 years. A company counts as a citizen for this purpose only if it is wholly owned by Kenyan citizens, so a single foreign shareholder can change the character of the entity holding the title. Agricultural land carries a further layer: transactions in agricultural land require the consent of the relevant Land Control Board under the Land Control Act, and a dealing entered into without that consent becomes void."
      },
      { kind: "h2", id: "exit", text: "How do you exit a fractional investment?" },
      {
        kind: "p",
        text: "This is the question that separates workable arrangements from traps. There is no exchange for fractional land interests in Kenya, so exit depends entirely on a mechanism written into the structure: a buy-back obligation, a permitted transfer to another investor, or a sale of the whole asset at the end of a defined term. Confirm which applies before committing, and confirm it in writing."
      },
      {
        kind: "p",
        text: "Where the answer is a sale of the underlying asset at term end, your capital is committed for that full term. Treat the projected term as a floor rather than an estimate — property disposals in Kenya routinely run past their target date."
      }
    ]
  },
  {
    slug: "land-title-verification-kenya-official-search",
    title: "Verifying a Kenyan land title: the checks that actually matter",
    description: "The official search, encumbrance checks, rates and rent clearance, and Land Control Board consent — what each confirms and what it misses.",
    answer: "Verifying Kenyan land title starts with an official search at the land registry, which confirms the registered proprietor and any registered encumbrances such as charges, cautions or restrictions. A search alone is not enough: it must be paired with rates and rent clearance certificates, a physical site visit, and, for agricultural land, Land Control Board consent. Each check covers a different failure mode.",
    published: "2026-03-04",
    updated: "2026-08-17",
    readingMinutes: 9,
    topic: "Due diligence",
    body: [
      {
        kind: "p",
        text: "Most Kenyan land disputes that reach court were avoidable at the diligence stage. The checks below are not exotic; they are routine conveyancing practice, and the reason they get skipped is that each one costs time when a deal feels urgent."
      },
      { kind: "h2", id: "official-search", text: "What is an official search and what does it prove?" },
      {
        kind: "p",
        text: "An official search is a request to the land registry for the current entries on a title. It returns the registered proprietor, the tenure and term, the size of the parcel, and any registered encumbrances — charges securing a loan, cautions lodged by a third party claiming an interest, restrictions limiting dealings, and caveats."
      },
      {
        kind: "p",
        text: "Searches are conducted through the Ardhisasa platform for registries that have migrated to it, and manually at the relevant registry for those that have not. A search reflects the register at the moment it is issued and nothing more. It goes stale immediately, which is why conveyancers repeat it just before completion."
      },
      {
        kind: "note",
        text: "An official search proves what is registered. It does not prove that the registration is correct, that the person presenting the deed is the registered proprietor, or that nobody is living on the land. Those are separate checks, and the first two are how title fraud actually works."
      },
      { kind: "h2", id: "beyond-search", text: "What does a search miss?" },
      {
        kind: "ol",
        items: [
          "Identity fraud. The register names a proprietor; it does not confirm the person in front of you is that proprietor. Verify identity documents independently against the registered particulars.",
          "Occupation and adverse claims. Unregistered occupiers, tenants and boundary encroachments do not appear on a search. Only a physical site visit finds them.",
          "Historical defects. A title issued irregularly can be revoked. Where the chain includes a subdivision or an allocation of public land, trace it back rather than accepting the current entry at face value.",
          "Unpaid outgoings. Land rates owed to the county and land rent owed to the national government are recovered against the land, not the previous owner."
        ]
      },
      { kind: "h2", id: "clearances", text: "Which clearances are required before a transfer?" },
      {
        kind: "facts",
        rows: [
          {
            label: "Land rates clearance",
            value: "From the county government",
            note: "Confirms county rates are paid up. Arrears attach to the land."
          },
          {
            label: "Land rent clearance",
            value: "For leasehold land, from the Ministry of Lands",
            note: "Applies to leasehold titles where annual ground rent is payable."
          },
          {
            label: "Land Control Board consent",
            value: "For agricultural land, under the Land Control Act",
            note: "A controlled transaction without consent is void, not merely voidable."
          },
          {
            label: "Spousal consent",
            value: "Where the land is matrimonial property",
            note: "Required under the Matrimonial Property Act 2013 and the Land Act 2012."
          },
          {
            label: "Stamp duty",
            value: "4% urban, 2% rural, on assessed value",
            note: "Assessed by a government valuer; the assessment can exceed the price paid."
          }
        ]
      },
      { kind: "h2", id: "fractional", text: "What changes when the investment is fractional?" },
      {
        kind: "p",
        text: "You are usually not the party conducting the search — the entity acquiring the land is. That makes the diligence question a governance question: who performed the checks, what did they find, and can you see the documents? A platform that will not show you the official search, the clearance certificates and the consent for a project it is asking you to fund has answered the question by declining to."
      },
      {
        kind: "p",
        text: "Ask for the search dated close to acquisition, not one from months earlier, and check the proprietor named on it against the entity you are being asked to invest in."
      }
    ]
  },
  {
    slug: "freehold-vs-leasehold-land-kenya",
    title: "Freehold vs leasehold land in Kenya: what changes for an investor",
    description: "The practical differences between freehold and leasehold tenure in Kenya — term, renewal, ground rent, eligibility and effect on resale value.",
    answer: "Freehold land in Kenya is held indefinitely with no ground rent, while leasehold is held for a fixed term — commonly 99 years — from the national or county government, subject to annual land rent and to conditions of user. Non-citizens may hold leasehold only, capped at 99 years under Article 65 of the Constitution. Remaining lease term materially affects both resale value and financeability.",
    published: "2026-04-22",
    updated: "2026-08-17",
    readingMinutes: 7,
    topic: "Tenure",
    body: [
      {
        kind: "p",
        text: "Tenure is the first thing to establish about any Kenyan parcel and the thing most often glossed over in a listing. It determines who may hold it, what it costs to keep, and what it will be worth to the next buyer."
      },
      { kind: "h2", id: "freehold", text: "What is freehold tenure?" },
      {
        kind: "p",
        text: "Freehold confers ownership without a time limit and without ground rent to the state. It is the strongest form of tenure available in Kenya. It is not unconditional — land remains subject to compulsory acquisition, to planning control, and, for agricultural parcels, to the Land Control Act — but there is no expiry date to manage and no annual rent to keep current."
      },
      { kind: "h2", id: "leasehold", text: "What is leasehold tenure?" },
      {
        kind: "p",
        text: "Leasehold grants the right to hold and use land for a defined term, most commonly 99 years, in exchange for annual land rent and compliance with the conditions of user in the grant. Much urban land in Kenya is leasehold. At the end of the term the interest reverts to the grantor unless the lease is extended or renewed, and extension is an application rather than an entitlement."
      },
      {
        kind: "facts",
        rows: [
          { label: "Term", value: "Freehold: indefinite. Leasehold: fixed, commonly 99 years" },
          { label: "Annual cost to the state", value: "Freehold: none. Leasehold: land rent" },
          {
            label: "Non-citizen eligibility",
            value: "Freehold: not permitted. Leasehold: permitted up to 99 years",
            note: "Constitution of Kenya 2010, Article 65."
          },
          {
            label: "Conditions of user",
            value: "Freehold: planning control only. Leasehold: conditions in the grant",
            note: "Breach of a condition of user can ground forfeiture proceedings."
          },
          {
            label: "Effect of short residue",
            value: "Leasehold value falls as the remaining term shortens",
            note: "Lenders commonly decline security over leases with a short residual term."
          }
        ]
      },
      { kind: "h2", id: "residue", text: "Why does the remaining lease term matter so much?" },
      {
        kind: "p",
        text: "A leasehold with 90 years left and one with 20 years left are different assets at the same nominal size. As the residue shortens, the pool of buyers narrows, mortgage finance becomes harder to secure against it, and the discount to freehold widens. If a project is built on leasehold land, the residual term at the point you would exit — not the term today — is the figure that matters."
      },
      {
        kind: "note",
        text: 'For any leasehold project, ask for the commencement date of the term and calculate the residue yourself. A listing that quotes "99-year lease" without a start date is quoting the original grant, not what remains.'
      },
      { kind: "h2", id: "renewal", text: "Can a leasehold be extended?" },
      {
        kind: "p",
        text: "Extension or renewal is applied for through the Ministry of Lands, ordinarily in the later part of the term, and is assessed against compliance with the lease conditions and current planning policy. It is granted in practice in many cases, but it involves a premium, a fresh set of conditions, and an outcome that cannot be assumed in advance. Treat an assumed renewal in a projection as an assumption, and price it accordingly."
      }
    ]
  }
];
const insightBySlug = (slug) => INSIGHTS.find((i) => i.slug === slug);
const insightsByRecency = () => [...INSIGHTS].sort((a, b) => b.updated.localeCompare(a.updated));
const PATH = "/insights";
const CRUMBS = [
  { name: "Home", path: "/" },
  { name: "Insights", path: PATH }
];
const TITLE = "Land investment insights";
const DESCRIPTION = "Guides to investing in Kenyan land: ownership structures, title verification, freehold versus leasehold, and what each means for investors.";
function Insights() {
  var _a;
  const posts = insightsByRecency();
  const newest = (_a = posts[0]) == null ? void 0 : _a.updated;
  const jsonLd = [
    baseGraph(
      webPageSchema({
        name: TITLE,
        description: DESCRIPTION,
        path: PATH,
        dateModified: newest
      }),
      breadcrumbSchema(CRUMBS),
      // An ItemList makes the hub's contents legible as a set rather than as
      // an incidental collection of links.
      {
        "@type": "ItemList",
        itemListElement: posts.map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `${SITE_URL}/insights/${p.slug}`,
          name: p.title
        }))
      }
    )
  ];
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Seo, { title: TITLE, description: DESCRIPTION, path: PATH, jsonLd }),
    /* @__PURE__ */ jsx(
      PageHero,
      {
        title: "Land investment insights",
        standfirst: "How Kenyan land ownership actually works, explained without the sales pitch.",
        crumbs: CRUMBS,
        updated: newest
      }
    ),
    /* @__PURE__ */ jsxs(Prose, { children: [
      /* @__PURE__ */ jsx(AnswerCapsule, { children: "These guides cover the mechanics of holding Kenyan land as an investment: the structures used to own a parcel collectively, the searches and consents that establish whether a title is sound, and how freehold and leasehold tenure differ in cost, eligibility and resale value. They describe the law and the process, not FIBI’s commercial terms." }),
      /* @__PURE__ */ jsx("div", { className: "not-prose space-y-5", children: posts.map((p) => /* @__PURE__ */ jsxs(
        "article",
        {
          className: "rounded-2xl bg-white p-6 sm:p-7 ring-1 ring-slate-200 shadow-sm hover:shadow-md transition-shadow",
          children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs font-medium uppercase tracking-wide text-emerald-700 mb-2", children: p.topic }),
            /* @__PURE__ */ jsx("h2", { className: "text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-2", children: /* @__PURE__ */ jsx(Link, { to: `/insights/${p.slug}`, className: "hover:text-emerald-800", children: p.title }) }),
            /* @__PURE__ */ jsx("p", { className: "text-slate-600 leading-relaxed mb-4", children: p.description }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 text-sm text-slate-500", children: [
              /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsx(Clock, { className: "h-3.5 w-3.5", "aria-hidden": "true" }),
                p.readingMinutes,
                " min read"
              ] }),
              /* @__PURE__ */ jsxs("span", { children: [
                "Updated",
                " ",
                /* @__PURE__ */ jsx("time", { dateTime: p.updated, children: (/* @__PURE__ */ new Date(`${p.updated}T00:00:00Z`)).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  timeZone: "UTC"
                }) })
              ] })
            ] })
          ]
        },
        p.slug
      )) })
    ] })
  ] });
}
function BlockView({ block }) {
  switch (block.kind) {
    case "p":
      return /* @__PURE__ */ jsx("p", { children: block.text });
    case "h2":
      return /* @__PURE__ */ jsx(
        "h2",
        {
          id: block.id,
          className: "text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-10 mb-4 scroll-mt-24",
          children: block.text
        }
      );
    case "h3":
      return /* @__PURE__ */ jsx(
        "h3",
        {
          id: block.id,
          className: "text-xl font-semibold text-slate-900 mt-8 mb-3 scroll-mt-24",
          children: block.text
        }
      );
    case "ul":
      return /* @__PURE__ */ jsx("ul", { className: "list-disc pl-6 space-y-2 mb-5", children: block.items.map((item) => /* @__PURE__ */ jsx("li", { children: item }, item)) });
    case "ol":
      return /* @__PURE__ */ jsx("ol", { className: "list-decimal pl-6 space-y-2 mb-5", children: block.items.map((item) => /* @__PURE__ */ jsx("li", { children: item }, item)) });
    case "note":
      return /* @__PURE__ */ jsx(
        "aside",
        {
          role: "note",
          className: "not-prose rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5 mb-6 text-slate-700 leading-relaxed",
          children: block.text
        }
      );
    case "facts":
      return /* @__PURE__ */ jsx("dl", { className: "not-prose rounded-2xl bg-white ring-1 ring-slate-200 p-6 mb-6", children: block.rows.map((r) => /* @__PURE__ */ jsx(FactRow, { label: r.label, value: r.value, note: r.note }, r.label)) });
  }
}
function InsightPost() {
  const { slug } = useParams();
  const post = slug ? insightBySlug(slug) : void 0;
  if (!post) return /* @__PURE__ */ jsx(NotFound, {});
  const path = `/insights/${post.slug}`;
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Insights", path: "/insights" },
    { name: post.title, path }
  ];
  const jsonLd = [
    baseGraph(
      articleSchema({
        headline: post.title,
        description: post.description,
        path,
        datePublished: post.published,
        dateModified: post.updated
      }),
      breadcrumbSchema(crumbs)
    )
  ];
  const related = INSIGHTS.filter((i) => i.slug !== post.slug).slice(0, 2);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      Seo,
      {
        title: post.title,
        description: post.description,
        path,
        type: "article",
        jsonLd
      }
    ),
    /* @__PURE__ */ jsx(PageHero, { title: post.title, crumbs, updated: post.updated }),
    /* @__PURE__ */ jsxs(Prose, { children: [
      /* @__PURE__ */ jsxs("p", { className: "not-prose flex items-center gap-4 text-sm text-slate-500 mb-8", children: [
        /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsx(Clock, { className: "h-3.5 w-3.5", "aria-hidden": "true" }),
          post.readingMinutes,
          " min read"
        ] }),
        /* @__PURE__ */ jsx("span", { children: post.topic })
      ] }),
      /* @__PURE__ */ jsx(AnswerCapsule, { children: post.answer }),
      post.body.map((block, i) => /* @__PURE__ */ jsx(BlockView, { block }, `${block.kind}-${i}`)),
      /* @__PURE__ */ jsx("div", { className: "mt-12", children: /* @__PURE__ */ jsx(RiskNotice, {}) }),
      related.length > 0 && /* @__PURE__ */ jsxs("section", { "aria-labelledby": "related", className: "mt-12", children: [
        /* @__PURE__ */ jsx(
          "h2",
          {
            id: "related",
            className: "text-xl font-bold text-slate-900 tracking-tight mb-4",
            children: "Related guides"
          }
        ),
        /* @__PURE__ */ jsx("ul", { className: "not-prose space-y-3", children: related.map((r) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(
          Link,
          {
            to: `/insights/${r.slug}`,
            className: "text-emerald-700 underline underline-offset-2 hover:text-emerald-800",
            children: r.title
          }
        ) }, r.slug)) })
      ] })
    ] })
  ] });
}
const routeConfig = [
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "projects", Component: Projects$1 },
      { path: "projects/:id", Component: ProjectDetail },
      { path: "membership", Component: MembershipLanding },
      // Public content. These carry the site's E-E-A-T weight: on a YMYL
      // investment domain, an unattributed platform with no about, contact or
      // risk page has a hard ceiling on how far it can rank.
      { path: "about", Component: About },
      { path: "contact", Component: Contact },
      { path: "how-it-works", Component: HowItWorks },
      { path: "faq", Component: Faq },
      { path: "insights", Component: Insights },
      { path: "insights/:slug", Component: InsightPost },
      { path: "legal/risk-disclosure", Component: RiskDisclosure },
      { path: "legal/terms", Component: Terms },
      { path: "legal/privacy", Component: Privacy },
      {
        path: "membership/apply",
        element: /* @__PURE__ */ jsx(ProtectedRoute, { children: /* @__PURE__ */ jsx(MembershipApplication, {}) })
      },
      {
        // Auth-only, not tier-gated: an expired or approved-but-unpaid member
        // needs this page precisely because they have no tier yet.
        path: "membership/billing",
        element: /* @__PURE__ */ jsx(ProtectedRoute, { children: /* @__PURE__ */ jsx(MembershipBilling, {}) })
      },
      {
        path: "member-hub",
        element: /* @__PURE__ */ jsx(ProtectedRoute, { requireMembershipTier: "basic", children: /* @__PURE__ */ jsx(MemberHub, {}) })
      },
      // User dashboard route
      {
        path: "dashboard",
        element: /* @__PURE__ */ jsx(ProtectedRoute, { allowedRoles: ["investor"], children: /* @__PURE__ */ jsx(UserDashboard, {}) })
      },
      // Admin portal. Each section is its own route so tabs are linkable,
      // survive a refresh, and can be opened directly from a notification.
      {
        path: "admin",
        element: /* @__PURE__ */ jsx(ProtectedRoute, { allowedRoles: ["admin"], children: /* @__PURE__ */ jsx(AdminLayout, {}) }),
        children: [
          { index: true, Component: Overview },
          { path: "users", Component: Users },
          { path: "projects", Component: Projects },
          { path: "transactions", Component: Transactions },
          { path: "analytics", Component: Analytics },
          { path: "memberships", Component: Memberships },
          { path: "banking", Component: Banking },
          { path: "reconciliation", Component: Reconciliation },
          { path: "settings", Component: Settings }
        ]
      },
      { path: "login", Component: Login },
      { path: "signup", Component: Signup },
      { path: "forgot-password", Component: ForgotPassword },
      { path: "reset-password", Component: ResetPassword },
      { path: "*", Component: NotFound }
    ]
  }
];
const STATIC_PUBLIC_ROUTES = [
  { path: "/", indexable: true, priority: 1, changefreq: "weekly" },
  { path: "/projects", indexable: true, priority: 0.9, changefreq: "daily" },
  { path: "/membership", indexable: true, priority: 0.8, changefreq: "monthly" },
  { path: "/how-it-works", indexable: true, priority: 0.8, changefreq: "monthly", lastmod: "2026-08-17" },
  { path: "/about", indexable: true, priority: 0.7, changefreq: "monthly", lastmod: "2026-08-17" },
  { path: "/faq", indexable: true, priority: 0.7, changefreq: "monthly", lastmod: "2026-08-17" },
  { path: "/insights", indexable: true, priority: 0.7, changefreq: "weekly" },
  { path: "/contact", indexable: true, priority: 0.6, changefreq: "yearly", lastmod: "2026-08-17" },
  {
    path: "/legal/risk-disclosure",
    indexable: true,
    priority: 0.5,
    changefreq: "yearly",
    lastmod: "2026-08-17"
  },
  // Prerendered so crawlers receive the `noindex`, but kept out of the sitemap
  // while they are unsigned skeletons. Both flip together via LEGAL_DRAFT.
  { path: "/legal/terms", indexable: !LEGAL_DRAFT, priority: 0.3, changefreq: "yearly" },
  { path: "/legal/privacy", indexable: !LEGAL_DRAFT, priority: 0.3, changefreq: "yearly" }
];
const insightRoutes = () => INSIGHTS.map((i) => ({
  path: `/insights/${i.slug}`,
  indexable: true,
  priority: 0.6,
  changefreq: "monthly",
  lastmod: i.updated
}));
const buildTimeRoutes = () => [
  ...STATIC_PUBLIC_ROUTES,
  ...insightRoutes()
];
const PRIVATE_ROUTE_PREFIXES = [
  "/admin",
  "/dashboard",
  "/member-hub",
  "/membership/apply",
  "/membership/billing",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password"
];
async function render(pathname, options = {}) {
  const handler = createStaticHandler(routeConfig);
  const request = new Request(`${SITE_URL}${pathname}`, { method: "GET" });
  const context = await handler.query(request);
  if (context instanceof Response) {
    return {
      appHtml: "",
      headHtml: "",
      payloadScript: "",
      redirectedTo: context.headers.get("Location") ?? "(unknown)",
      missingSeo: true
    };
  }
  const router = createStaticRouter(routeConfig, context);
  const payload = options.rawProject ? { project: normalizeApiProject(options.rawProject) } : {};
  resetSeoSink();
  setPrerenderPayload(payload);
  let appHtml;
  try {
    appHtml = renderToString(
      /* @__PURE__ */ jsx(AuthProvider, { children: /* @__PURE__ */ jsx(MembershipProvider, { children: /* @__PURE__ */ jsx(StaticRouterProvider, { router, context }) }) })
    );
  } finally {
    resetPrerenderPayload();
  }
  const seo = readSeoSink();
  return {
    appHtml,
    headHtml: seo ? renderSeoToHtml(seo, SITE_NAME, DEFAULT_LOCALE) : "",
    payloadScript: serializePrerenderPayload(payload),
    missingSeo: seo === null
  };
}
export {
  PRIVATE_ROUTE_PREFIXES,
  SITE_URL,
  STATIC_PUBLIC_ROUTES,
  buildTimeRoutes,
  render
};
