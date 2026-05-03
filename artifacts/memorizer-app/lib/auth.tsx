// React auth context for the mobile app.
//
// Why this file exists:
// Most screens (and the AppContext for syncing) want a one-stop hook to ask
// "is the user signed in?" and "give me a fresh access token to call the API".
// Rather than letting components import `supabase` directly and re-implement
// session tracking each time, we expose:
//
//   const { user, isLoading, isAuthenticated, login, signUp, logout, getValidToken } = useAuth();
//
// The `user` object's shape comes from the API (`/api/auth/user`), not from
// Supabase directly — that's because every other table in this app stores
// rows under a *local* user UUID (`users.id` in our Postgres) which is a
// different value from Supabase's `auth.users.id`. The API handles linking
// the two; the mobile app just consumes whatever the API returns.

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { getResolvedExpoPublicApiBase } from "./resolveExpoPublicApiBase";
import { supabase } from "./supabase";

export interface AuthUser {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  /**
   * Sign in with email + password. Throws on failure so screens can show the
   * error message inline. Resolves once Supabase has a session *and* the API
   * has returned your Verbitra user row (`/api/auth/user`).
   */
  login: (email: string, password: string) => Promise<void>;
  /**
   * Create a new email + password account. Depending on Supabase's "Confirm
   * email" setting, the user may need to verify before a session is issued —
   * in that case `data.session` from Supabase is null and we leave the app
   * unauthenticated.
   */
  signUp: (email: string, password: string) => Promise<{ needsEmailConfirm: boolean }>;
  logout: () => Promise<void>;
  /**
   * Returns the current Supabase access token (a JWT) or null if there is no
   * session. supabase-js automatically refreshes the token if it is close to
   * expiring, so callers don't need to worry about expiry themselves.
   */
  getValidToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => {},
  signUp: async () => ({ needsEmailConfirm: false }),
  logout: async () => {},
  getValidToken: async () => null,
});

function getApiBaseUrl(): string {
  // EXPO_PUBLIC_API_BASE_URL conventionally ends with "/api" (see README).
  // We strip any trailing /api here because we explicitly write `/api/...` in
  // the fetch URLs below — keeping both forms makes the helper robust to
  // accidentally-doubled prefixes when EAS configs change.
  const apiUrl = getResolvedExpoPublicApiBase();
  if (apiUrl) return apiUrl.replace(/\/api\/?$/, "");
  console.error(
    "[Auth] EXPO_PUBLIC_API_BASE_URL is not set. " +
      "Add it to .env.local for local dev, or to EAS env vars for production builds.",
  );
  return "";
}

/**
 * Fetch the local-DB user row that corresponds to a Supabase access token.
 * Returns null if the API rejects the token or if the network is offline —
 * callers treat that the same as "signed out".
 */
async function fetchLocalUser(accessToken: string): Promise<AuthUser | null> {
  const apiBase = getApiBaseUrl();
  if (!apiBase) return null;

  try {
    const res = await fetch(`${apiBase}/api/auth/user`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { user?: AuthUser | null };
    return data.user ?? null;
  } catch {
    return null;
  }
}

/**
 * Same endpoint as `fetchLocalUser`, but throws with actionable copy for the
 * sign-in / sign-up screens. Background refresh still uses the silent helper.
 */
async function fetchLocalUserForSession(accessToken: string): Promise<AuthUser> {
  const apiBase = getApiBaseUrl();
  if (!apiBase) {
    throw new Error(
      "EXPO_PUBLIC_API_BASE_URL is not set. Copy artifacts/memorizer-app/.env.example to .env.local, " +
        "set the value (e.g. http://localhost:4000/api for local web), and restart Expo.",
    );
  }

  const url = `${apiBase}/api/auth/user`;
  let res: Response;
  try {
    res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } catch {
    throw new Error(
      "Could not reach your Verbitra API. On a physical device use your machine's LAN IP or a public HTTPS URL " +
        "(not localhost). For Android emulator try http://10.0.2.2:PORT/api. Ensure the api-server is running.",
    );
  }

  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (data.error) {
      throw new Error(data.error);
    }
    throw new Error(
      `The API returned HTTP ${res.status} at /api/auth/user. Check the api-server logs and EXPO_PUBLIC_API_BASE_URL.`,
    );
  }

  let data: { user?: AuthUser | null };
  try {
    data = (await res.json()) as { user?: AuthUser | null };
  } catch {
    throw new Error(
      "The API response was not valid JSON. Confirm EXPO_PUBLIC_API_BASE_URL points at your Verbitra API (path should end with /api).",
    );
  }

  const u = data.user ?? null;
  if (!u) {
    throw new Error(
      "The API returned no user for this token. The app's EXPO_PUBLIC_SUPABASE_* values and the api-server's " +
        "SUPABASE_URL / SUPABASE_AUTH_KEY (anon key) must refer to the same Supabase project.",
    );
  }
  return u;
}

type RefreshUserOptions = {
  /** When set, skip the network round-trip (caller already loaded this user). */
  preverifiedUser?: AuthUser;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // We keep a ref so the onAuthStateChange callback can compare the new
  // access token with the previous one and avoid re-fetching the user when
  // only the refresh-token changed (which Supabase fires every hour).
  const lastTokenRef = useRef<string | null>(null);
  const userRef = useRef<AuthUser | null>(null);
  // Monotonic id so overlapping /api/auth/user fetches cannot apply out of order
  // and wipe a successful login with a slower stale response.
  const refreshEpochRef = useRef(0);

  const refreshUserFromToken = useCallback(
    async (accessToken: string | null, options?: RefreshUserOptions): Promise<AuthUser | null> => {
      const epoch = ++refreshEpochRef.current;

      if (!accessToken) {
        lastTokenRef.current = null;
        userRef.current = null;
        setUser(null);
        return null;
      }

      if (options?.preverifiedUser) {
        lastTokenRef.current = accessToken;
        userRef.current = options.preverifiedUser;
        setUser(options.preverifiedUser);
        return options.preverifiedUser;
      }

      if (lastTokenRef.current === accessToken && userRef.current) {
        return userRef.current;
      }

      lastTokenRef.current = accessToken;
      const tokenWeFetched = accessToken;
      const localUser = await fetchLocalUser(accessToken);

      if (epoch !== refreshEpochRef.current) {
        return localUser;
      }
      if (lastTokenRef.current !== tokenWeFetched) {
        return localUser;
      }

      userRef.current = localUser;
      setUser(localUser);
      return localUser;
    },
    [],
  );

  useEffect(() => {
    // On mount, hydrate from whatever session AsyncStorage already has.
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      await refreshUserFromToken(data.session?.access_token ?? null);
      if (!cancelled) setIsLoading(false);
    })();

    // Subscribe to future session changes (sign-in, sign-out, token refresh).
    // This is the single source of truth — anywhere we want to react to auth
    // state, we go through this listener instead of polling.
    const { data: sub } = supabase.auth.onAuthStateChange(
      (_event: string, session: Session | null) => {
        void refreshUserFromToken(session?.access_token ?? null);
      },
    );

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [refreshUserFromToken]);

  const getValidToken = useCallback(async (): Promise<string | null> => {
    // `getSession` is cheap when the in-memory session is still valid, and
    // triggers a refresh under the hood when the access token is close to
    // expiry. That's exactly the behaviour API callers want.
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const token = data.session?.access_token ?? null;
      if (!token) {
        throw new Error(
          "Sign-in returned no session. If email confirmation is required in Supabase, confirm your email first.",
        );
      }
      try {
        const localUser = await fetchLocalUserForSession(token);
        await refreshUserFromToken(token, { preverifiedUser: localUser });
      } catch (err) {
        await supabase.auth.signOut();
        await refreshUserFromToken(null);
        throw err;
      }
    },
    [refreshUserFromToken],
  );

  const signUp = useCallback(
    async (email: string, password: string): Promise<{ needsEmailConfirm: boolean }> => {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      // If "Confirm email" is enabled in the Supabase dashboard, signUp returns
      // a user but no session — the user has to click the email link before
      // they can sign in.
      if (!data.session) {
        return { needsEmailConfirm: true };
      }
      try {
        const localUser = await fetchLocalUserForSession(data.session.access_token);
        await refreshUserFromToken(data.session.access_token, { preverifiedUser: localUser });
      } catch (err) {
        await supabase.auth.signOut();
        await refreshUserFromToken(null);
        throw err;
      }
      return { needsEmailConfirm: false };
    },
    [refreshUserFromToken],
  );

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    await refreshUserFromToken(null);
  }, [refreshUserFromToken]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signUp,
        logout,
        getValidToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
