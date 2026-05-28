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
import {
  fetchScenariosFromDatabase,
  ScenarioData,
} from "../../lib/scenarios";

type User = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  current_rank?: string | null;
};

type AuthContextValue = {
  user: User | null;
  role: "user" | "admin" | null;
  isAdmin: boolean;
  token: string | null;
  isLoading: boolean;
  isScenariosLoading: boolean;
  scenarios: ScenarioData[];
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
  const [isScenariosLoading, setIsScenariosLoading] = useState(true);
  const [scenarios, setScenarios] = useState<ScenarioData[]>([]);

  const fetchProfile = useCallback(
    async (activeToken: string) => {
      const data = await apiRequest<{ user: User }>("/api/auth/me", {
        token: activeToken,
      });
      setUser(data.user);
    },
    []
  );

  const loadScenarios = useCallback(async (activeToken: string) => {
    setIsScenariosLoading(true);

    try {
      const data = await fetchScenariosFromDatabase(activeToken);
      setScenarios(data);
    } catch {
      setScenarios([]);
    } finally {
      setIsScenariosLoading(false);
    }
  }, []);

  useEffect(() => {
    const storedToken = readToken();
    if (!storedToken) {
      setIsLoading(false);
      setIsScenariosLoading(false);
      return;
    }

    setToken(storedToken);
    fetchProfile(storedToken)
      .then(() => loadScenarios(storedToken))
      .catch(() => {
        setUser(null);
        setToken(null);
        setScenarios([]);
        storeToken(null);
        setIsScenariosLoading(false);
      })
      .finally(() => setIsLoading(false));
  }, [fetchProfile, loadScenarios]);

  const login = useCallback(
    async ({ email, password }: { email: string; password: string }) => {
      const data = await apiRequest<{ token: string; user: User }>("/api/auth/login", {
        method: "POST",
        body: { email, password },
      });

      setToken(data.token);
      storeToken(data.token);
      setUser(data.user);
      void loadScenarios(data.token);
    },
    [loadScenarios]
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
    setScenarios([]);
    setIsScenariosLoading(false);
    storeToken(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      role: user?.role ?? null,
      isAdmin: user?.role === "admin",
      token,
      isLoading,
      isScenariosLoading,
      scenarios,
      login,
      signup,
      logout,
    }),
    [user, token, isLoading, isScenariosLoading, scenarios, login, signup, logout]
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
