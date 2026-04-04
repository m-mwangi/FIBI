const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

export const AUTH_PREFIX = "/api/v1/auth";

export function getApiBase(): string {
  return API_BASE;
}

export type AuthUserPayload = {
  id: string;
  name: string;
  email: string;
  role: "investor" | "admin";
};

export type MembershipDto = {
  tier: "free" | "basic" | "premium" | "investor_plus";
  status: "none" | "active" | "expired" | "canceled";
  applicationStatus: "none" | "pending" | "approved" | "rejected";
  renewalDate: string | null;
  badgeLabel: string | null;
};

export type AuthSuccessResponse = {
  success: boolean;
  token: string;
  message?: string;
  user: AuthUserPayload;
  membership?: MembershipDto | null;
};

export type MeResponse = {
  success: boolean;
  user: AuthUserPayload;
  membership?: MembershipDto | null;
};

export const MEMBERSHIP_PREFIX = "/api/v1/membership";

function readErrorMessage(data: Record<string, unknown>): string {
  if (typeof data.error === "string") return data.error;
  if (typeof data.message === "string") return data.message;
  return "Request failed";
}

export async function postJson<T>(
  path: string,
  body: unknown,
  init?: { token?: string | null }
): Promise<{ ok: true; data: T } | { ok: false; status: number; error: string }> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token =
    init?.token === undefined ? localStorage.getItem("fibi_token") : init.token;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    credentials: "include",
  });

  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;

  if (!res.ok) {
    return { ok: false, status: res.status, error: readErrorMessage(data) };
  }

  return { ok: true, data: data as T };
}

export async function getJson<T>(
  path: string,
  init?: { token?: string | null }
): Promise<{ ok: true; data: T } | { ok: false; status: number; error: string }> {
  const headers: Record<string, string> = {};
  const token =
    init?.token === undefined ? localStorage.getItem("fibi_token") : init.token;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method: "GET",
    headers,
    credentials: "include",
  });

  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;

  if (!res.ok) {
    return { ok: false, status: res.status, error: readErrorMessage(data) };
  }

  return { ok: true, data: data as T };
}

export async function patchJson<T>(
  path: string,
  body: unknown,
  init?: { token?: string | null }
): Promise<{ ok: true; data: T } | { ok: false; status: number; error: string }> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token =
    init?.token === undefined ? localStorage.getItem("fibi_token") : init.token;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(body),
    credentials: "include",
  });

  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;

  if (!res.ok) {
    return { ok: false, status: res.status, error: readErrorMessage(data) };
  }

  return { ok: true, data: data as T };
}

export async function putJson<T>(
  path: string,
  body: unknown,
  init?: { token?: string | null }
): Promise<{ ok: true; data: T } | { ok: false; status: number; error: string }> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token =
    init?.token === undefined ? localStorage.getItem("fibi_token") : init.token;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(body),
    credentials: "include",
  });

  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;

  if (!res.ok) {
    return { ok: false, status: res.status, error: readErrorMessage(data) };
  }

  return { ok: true, data: data as T };
}

export async function deleteJson<T>(
  path: string,
  init?: { token?: string | null }
): Promise<{ ok: true; data: T } | { ok: false; status: number; error: string }> {
  const headers: Record<string, string> = {};
  const token =
    init?.token === undefined ? localStorage.getItem("fibi_token") : init.token;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method: "DELETE",
    headers,
    credentials: "include",
  });

  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;

  if (!res.ok) {
    return { ok: false, status: res.status, error: readErrorMessage(data) };
  }

  return { ok: true, data: data as T };
}

export async function postFormData<T>(
  path: string,
  formData: FormData,
  init?: { token?: string | null }
): Promise<{ ok: true; data: T } | { ok: false; status: number; error: string }> {
  const headers: Record<string, string> = {};
  const token =
    init?.token === undefined ? localStorage.getItem("fibi_token") : init.token;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers,
    body: formData,
    credentials: "include",
  });

  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;

  if (!res.ok) {
    return { ok: false, status: res.status, error: readErrorMessage(data) };
  }

  return { ok: true, data: data as T };
}

export async function putFormData<T>(
  path: string,
  formData: FormData,
  init?: { token?: string | null }
): Promise<{ ok: true; data: T } | { ok: false; status: number; error: string }> {
  const headers: Record<string, string> = {};
  const token =
    init?.token === undefined ? localStorage.getItem("fibi_token") : init.token;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method: "PUT",
    headers,
    body: formData,
    credentials: "include",
  });

  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;

  if (!res.ok) {
    return { ok: false, status: res.status, error: readErrorMessage(data) };
  }

  return { ok: true, data: data as T };
}
