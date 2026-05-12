"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiRequest } from "../../lib/apiClient";

type User = {
  id: string;
  name: string;
  email: string;
  current_rank?: string | null;
};

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (payload: { email: string; password: string }) => Promise<void>;
  signup: (payload: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_STORAGE_KEY = "orglearn_token";

const readToken = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
};

const storeToken = (token: string | null) => {
  if (typeof window === "undefined") {
    return;
  }

  if (token) {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(
    async (activeToken: string) => {
      const data = await apiRequest<{ user: User }>("/api/auth/me", {
        token: activeToken,
      });
      setUser(data.user);
    },
    []
  );

  useEffect(() => {
    const storedToken = readToken();
    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    setToken(storedToken);
    fetchProfile(storedToken)
      .catch(() => {
        setUser(null);
        setToken(null);
        storeToken(null);
      })
      .finally(() => setIsLoading(false));
  }, [fetchProfile]);

  const login = useCallback(
    async ({ email, password }: { email: string; password: string }) => {
      const data = await apiRequest<{ token: string; user: User }>("/api/auth/login", {
        method: "POST",
        body: { email, password },
      });

      setToken(data.token);
      storeToken(data.token);
      setUser(data.user);
    },
    []
  );

  const signup = useCallback(
    async ({ name, email, password }: { name: string; email: string; password: string }) => {
      await apiRequest<{ user: User }>("/api/auth/signup", {
        method: "POST",
        body: { name, email, password },
      });

      await login({ email, password });
    },
    [login]
  );

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    storeToken(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      login,
      signup,
      logout,
    }),
    [user, token, isLoading, login, signup, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
};
