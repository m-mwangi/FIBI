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

interface AuthContextType {
  user: User | null;
  /** false until initial session check finishes (avoids protected-route flash) */
  authReady: boolean;
  login: (email: string, password: string, role: "investor" | "admin") => Promise<AuthResult>;
  signup: (payload: SignupPayload) => Promise<AuthResult>;
  oauthLogin: (provider: OAuthProvider, payload: OAuthPayload) => Promise<AuthResult>;
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
        localStorage.removeItem(STORAGE_USER);
        localStorage.removeItem(STORAGE_TOKEN);
        setUser(null);
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

  const login = async (
    email: string,
    password: string,
    role: "investor" | "admin"
  ): Promise<AuthResult> => {
    const body = { email, password, role };

    const res = await postJson<AuthSuccessResponse>(`${AUTH_PREFIX}/login`, body, {
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

  return (
    <AuthContext.Provider
      value={{
        user,
        authReady,
        login,
        signup,
        oauthLogin,
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
