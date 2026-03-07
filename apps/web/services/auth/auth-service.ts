import { createQueryKeys } from "@lukemorales/query-key-factory";
import { request } from "@/lib/api/request";
import { ROUTES } from "@/lib/api/routes";
import { API_URL } from "@/lib/config";
import type { AuthUser, SignupPayload, LoginPayload } from "./auth-types";

const TOKEN_KEY = "auth_token";

// ── Token storage utilities ───────────────────────────────────────────────────
// These are kept as standalone functions because they are imported by the
// Axios request-interceptor (which must NOT create a circular dependency).

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function saveToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/** @deprecated Use Axios interceptors instead — kept for backward compatibility. */
export function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ── AuthService class ─────────────────────────────────────────────────────────

class AuthService {
  login = async (payload: LoginPayload): Promise<string> => {
    const { access_token } = await request.post<{ access_token: string }>(
      ROUTES.auth.login,
      payload,
    );
    saveToken(access_token);
    return access_token;
  };

  signup = async (payload: SignupPayload): Promise<string> => {
    const { access_token } = await request.post<{ access_token: string }>(
      ROUTES.auth.signup,
      payload,
    );
    saveToken(access_token);
    return access_token;
  };

  getCurrentUser = (): Promise<AuthUser> => request.get<AuthUser>(ROUTES.auth.me);

  logout = (): void => clearToken();

  startGoogleLogin = (): void => {
    window.location.href = `${API_URL}/auth/google`;
  };
}

export const authService = new AuthService();

// ── Named exports for backward compatibility (used by AuthContext.tsx) ────────

export const login = authService.login;
export const signup = authService.signup;
export const getCurrentUser = authService.getCurrentUser;
export const logout = authService.logout;
export const startGoogleLogin = authService.startGoogleLogin;

// ── Query keys ────────────────────────────────────────────────────────────────

export const authQueryKeys = createQueryKeys("auth", {
  currentUser: () => ({
    queryKey: ["me"],
    queryFn: () => authService.getCurrentUser(),
  }),
});
