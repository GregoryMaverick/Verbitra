import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import * as WebBrowser from "expo-web-browser";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

WebBrowser.maybeCompleteAuthSession();

const AUTH_TOKEN_KEY = "auth_session_token";
const APP_REDIRECT = "verbitra://auth-callback";

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
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getValidToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {},
  getValidToken: async () => null,
});

function getApiBaseUrl(): string {
  // EXPO_PUBLIC_API_BASE_URL may include a trailing "/api" path — strip it
  // because the calls below already include /api/* in the path.
  const apiUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (apiUrl) return apiUrl.replace(/\/api\/?$/, "");
  console.error(
    "[Auth] EXPO_PUBLIC_API_BASE_URL is not set. " +
      "Add it to .env.local for local dev, or to EAS secrets for production builds.",
  );
  return "";
}

async function secureGet(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    try {
      return await AsyncStorage.getItem(key);
    } catch {
      return null;
    }
  }
}

async function secureSet(key: string, value: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch {
    try {
      await AsyncStorage.setItem(key, value);
    } catch {
    }
  }
}

async function secureDelete(key: string): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch {
  }
  try {
    await AsyncStorage.removeItem(key);
  } catch {
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const token = await secureGet(AUTH_TOKEN_KEY);
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      const apiBase = getApiBaseUrl();
      const res = await fetch(`${apiBase}/api/auth/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.user) {
        setUser(data.user);
      } else {
        await secureDelete(AUTH_TOKEN_KEY);
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const getValidToken = useCallback(async (): Promise<string | null> => {
    return secureGet(AUTH_TOKEN_KEY);
  }, []);

  const login = useCallback(async () => {
    const apiBase = getApiBaseUrl();
    if (!apiBase) {
      console.error("API base URL is not configured.");
      return;
    }

    const startUrl = `${apiBase}/api/mobile-auth/start?app_redirect=${encodeURIComponent(APP_REDIRECT)}`;

    try {
      const result = await WebBrowser.openAuthSessionAsync(startUrl, APP_REDIRECT);
      if (result.type !== "success" || !result.url) return;

      const queryStart = result.url.indexOf("?");
      const params = new URLSearchParams(
        queryStart >= 0 ? result.url.slice(queryStart + 1) : "",
      );
      const transfer = params.get("transfer");
      if (!transfer) {
        console.error("No transfer code in callback URL");
        return;
      }

      const redeemRes = await fetch(`${apiBase}/api/mobile-auth/redeem-transfer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transfer }),
      });

      if (!redeemRes.ok) {
        console.error("Transfer redeem failed:", redeemRes.status);
        return;
      }

      const data = await redeemRes.json();
      if (data.token) {
        await secureSet(AUTH_TOKEN_KEY, data.token);
        setIsLoading(true);
        await fetchUser();
      }
    } catch (err) {
      console.error("Login error:", err);
    }
  }, [fetchUser]);

  const logout = useCallback(async () => {
    try {
      const token = await secureGet(AUTH_TOKEN_KEY);
      if (token) {
        const apiBase = getApiBaseUrl();
        await fetch(`${apiBase}/api/mobile-auth/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch {
    } finally {
      await secureDelete(AUTH_TOKEN_KEY);
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
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
