import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  AUTH_PREFIX,
  getJson,
  postJson,
  type AuthSuccessResponse,
  type AuthUserPayload,
  type MeResponse,
} from "@/lib/api";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "investor" | "admin";
}

export type AuthResult =
  | { success: true; user: User }
  | { success: false; error: string };

export type SignupPayload = {
  name: string;
  email: string;
  password: string;
  dob?: string;
  country?: string;
  idType?: string;
  idNumber?: string;
};

export type OAuthProvider = "google" | "facebook" | "apple";

export type OAuthPayload = {
  idToken?: string;
  accessToken?: string;
  name?: string;
};

export type SimpleResult =
  | { success: true; message: string }
  | { success: false; error: string };

interface AuthContextType {
  user: User | null;
  /** false until initial session check finishes (avoids protected-route flash) */
  authReady: boolean;
  /** Re-fetch `/auth/me` and update context (e.g. after profile name change). */
  refreshUser: () => Promise<void>;
  /**
   * No `role` argument by design: the server decides the role from the stored
   * account and returns it, and the caller routes on `result.user.role`. Asking
   * the client to declare its own role let a caller assert privilege and only
   * ever produced "wrong role" errors for people who picked the wrong tab.
   */
  login: (email: string, password: string) => Promise<AuthResult>;
  signup: (payload: SignupPayload) => Promise<AuthResult>;
  oauthLogin: (provider: OAuthProvider, payload: OAuthPayload) => Promise<AuthResult>;
  requestPasswordReset: (email: string) => Promise<SimpleResult>;
  verifyResetToken: (token: string) => Promise<{ success: true; email: string } | { success: false; error: string }>;
  resetPassword: (token: string, password: string) => Promise<SimpleResult>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const STORAGE_USER = "fibi_user";
const STORAGE_TOKEN = "fibi_token";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function persistSession(user: AuthUserPayload, token: string): User {
  const normalized: User = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
  localStorage.setItem(STORAGE_USER, JSON.stringify(normalized));
  localStorage.setItem(STORAGE_TOKEN, token);
  return normalized;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
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

      const me = await getJson<MeResponse>(`${AUTH_PREFIX}/me`, { token });
      if (cancelled) return;

      if (!me.ok) {
        const fatal =
          me.status === 401 || me.status === 403 || me.status === 404;
        if (fatal) {
          localStorage.removeItem(STORAGE_USER);
          localStorage.removeItem(STORAGE_TOKEN);
          setUser(null);
        } else {
          const raw = localStorage.getItem(STORAGE_USER);
          if (raw) {
            try {
              setUser(JSON.parse(raw) as User);
            } catch {
              setUser(null);
            }
          } else {
            setUser(null);
          }
        }
      } else {
        const u = me.data.user;
        const normalized: User = {
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
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

  const login = async (email: string, password: string): Promise<AuthResult> => {
    const res = await postJson<AuthSuccessResponse>(`${AUTH_PREFIX}/login`, { email, password }, {
      token: null,
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

  const signup = async (payload: SignupPayload): Promise<AuthResult> => {
    const res = await postJson<AuthSuccessResponse>(`${AUTH_PREFIX}/register`, payload, {
      token: null,
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

  const oauthLogin = async (provider: OAuthProvider, payload: OAuthPayload): Promise<AuthResult> => {
    const res = await postJson<AuthSuccessResponse>(`/api/v1/oauth/${provider}`, payload, {
      token: null,
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

  /**
   * The API answers identically whether or not the address is registered, so
   * there is nothing here to branch on — that is deliberate, and the UI must not
   * try to infer existence from the response.
   */
  const requestPasswordReset = async (email: string): Promise<SimpleResult> => {
    const res = await postJson<{ success: boolean; message: string }>(
      `${AUTH_PREFIX}/forgot-password`,
      { email },
      { token: null }
    );
    if (!res.ok) return { success: false, error: res.error };
    return { success: true, message: res.data.message };
  };

  const verifyResetToken = async (token: string) => {
    const res = await getJson<{ success: boolean; email: string }>(
      `${AUTH_PREFIX}/reset-password?token=${encodeURIComponent(token)}`,
      { token: null }
    );
    if (!res.ok) return { success: false as const, error: res.error };
    return { success: true as const, email: res.data.email };
  };

  const resetPassword = async (token: string, password: string): Promise<SimpleResult> => {
    const res = await postJson<{ success: boolean; message: string }>(
      `${AUTH_PREFIX}/reset-password`,
      { token, password },
      { token: null }
    );
    if (!res.ok) return { success: false, error: res.error };

    // The server revoked every existing session for this account, so drop any
    // stale local copy rather than leaving a token that will 401 on next use.
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
      /* ignore network errors */
    }
    setUser(null);
    localStorage.removeItem(STORAGE_USER);
    localStorage.removeItem(STORAGE_TOKEN);
  };

  const refreshUser = async () => {
    const token = localStorage.getItem(STORAGE_TOKEN);
    if (!token) return;
    const me = await getJson<MeResponse>(`${AUTH_PREFIX}/me`, { token });
    if (!me.ok) return;
    const u = me.data.user;
    const normalized: User = {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
    };
    setUser(normalized);
    localStorage.setItem(STORAGE_USER, JSON.stringify(normalized));
  };

  return (
    <AuthContext.Provider
      value={{
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
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
