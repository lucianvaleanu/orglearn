"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Check, Search, Users } from "lucide-react";
import Header from "../../../components/Header";
import ProtectedRoute from "../../../components/auth/ProtectedRoute";
import PermissionDenied from "../../../components/auth/PermissionDenied";
import { apiRequest } from "../../../lib/apiClient";
import { useAuth } from "../../../components/auth/AuthContext";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  company?: string | null;
  role: "user" | "admin";
  current_rank?: string | null;
};

type UsersResponse = {
  data?: AdminUser[];
  users?: AdminUser[];
};

type CompanyListResponse = {
  data?: string[];
  userIds?: string[];
};

const COMPANY_LIST_STORAGE_KEY = "orglearn_company_list_user_ids";

const SAMPLE_COMPANY_USERS: AdminUser[] = [
  {
    id: "sample-user-1",
    name: "Ariana Ionescu",
    email: "ariana.ionescu@orglearn.example",
    company: "OrgLearn Labs",
    role: "user",
    current_rank: "Trusted Coach",
  },
  {
    id: "sample-user-2",
    name: "Mihai Pop",
    email: "mihai.pop@orglearn.example",
    company: "OrgLearn Labs",
    role: "user",
    current_rank: "Steady Leader",
  },
  {
    id: "sample-user-3",
    name: "Elena Marin",
    email: "elena.marin@orglearn.example",
    company: "Public",
    role: "user",
    current_rank: "Growth Mindset Builder",
  },
  {
    id: "sample-user-4",
    name: "Andrei Dima",
    email: "andrei.dima@northstar.example",
    company: "Northstar Consulting",
    role: "user",
    current_rank: "Strategic Communicator",
  },
];

const normalizeUsers = (payload: UsersResponse | AdminUser[]) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload.data)) {
    return payload.data;
  }

  if (Array.isArray(payload.users)) {
    return payload.users;
  }

  return [] as AdminUser[];
};

const normalizeIds = (payload: CompanyListResponse | string[]) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload.data)) {
    return payload.data;
  }

  if (Array.isArray(payload.userIds)) {
    return payload.userIds;
  }

  return [] as string[];
};

const readStoredSelection = () => {
  if (typeof window === "undefined") {
    return [] as string[];
  }

  try {
    const rawValue = window.localStorage.getItem(COMPANY_LIST_STORAGE_KEY);
    if (!rawValue) {
      return [] as string[];
    }

    const parsed = JSON.parse(rawValue) as unknown;
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === "string") : [];
  } catch {
    return [] as string[];
  }
};

const storeSelection = (selectedIds: string[]) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(COMPANY_LIST_STORAGE_KEY, JSON.stringify(selectedIds));
};

export default function CompanyListAdminPage() {
  const { token, isLoading, isAdmin } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (isLoading || !token) {
      return;
    }

    const loadCompanyList = async () => {
      try {
        setErrorMessage(null);
        const [usersResponse, companyListResponse] = await Promise.all([
          apiRequest<UsersResponse | AdminUser[]>("/api/admin/users", { token }),
          apiRequest<CompanyListResponse | string[]>("/api/admin/company-list", {
            token,
          }),
        ]);

        const apiUsers = normalizeUsers(usersResponse);
        const fallbackUsers = apiUsers.length > 0 ? apiUsers : SAMPLE_COMPANY_USERS;
        setUsers(fallbackUsers);

        const apiSelectedIds = normalizeIds(companyListResponse);
        const storedSelection = readStoredSelection();
        setSelectedIds(apiSelectedIds.length > 0 ? apiSelectedIds : storedSelection);
      } catch (error) {
        const status = error instanceof Error && "status" in error ? Number(error.status) : 0;
        if (status === 401) {
          setErrorMessage("Your session expired. Please sign in again.");
        } else if (status === 403) {
          setErrorMessage("You do not have permission to manage the company list.");
        } else {
          setErrorMessage("Using sample company users because the API is unavailable.");
          setUsers(SAMPLE_COMPANY_USERS);
          setSelectedIds(readStoredSelection());
        }
      } finally {
        setIsLoadingUsers(false);
      }
    };

    void loadCompanyList();
  }, [isLoading, token]);

  const filteredUsers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      return users;
    }

    return users.filter((user) => {
      const haystack = `${user.name} ${user.email} ${user.company ?? ""}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [searchTerm, users]);

  const selectedCount = selectedIds.length;

  const toggleUser = (userId: string) => {
    setSelectedIds((current) =>
      current.includes(userId)
        ? current.filter((item) => item !== userId)
        : [...current, userId]
    );
  };

  const selectAllVisible = () => {
    setSelectedIds((current) => {
      const visibleIds = filteredUsers.map((user) => user.id);
      const hasAllVisible = visibleIds.every((userId) => current.includes(userId));

      if (hasAllVisible) {
        return current.filter((userId) => !visibleIds.includes(userId));
      }

      return Array.from(new Set([...current, ...visibleIds]));
    });
  };

  const saveCompanyList = async () => {
    if (!token) {
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      try {
        await apiRequest<{ data?: { userIds: string[] } }>("/api/admin/company-list", {
          method: "POST",
          token,
          body: { userIds: selectedIds },
        });

        setSuccessMessage("Company list updated successfully.");
      } catch {
        storeSelection(selectedIds);
        setSuccessMessage("Saved locally using the sample company list.");
      }
    } catch (error) {
      const status = error instanceof Error && "status" in error ? Number(error.status) : 0;
      if (status === 401) {
        setErrorMessage("Your session expired. Please sign in again.");
      } else if (status === 403) {
        setErrorMessage("You do not have permission to manage the company list.");
      } else {
        setErrorMessage("Unable to save the company list right now.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAdmin) {
    return <PermissionDenied />;
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-[#edf1d6]">
        <Header />

        <main className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-10 lg:px-6">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#6e8b77]">
              Admin tools
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-[#1f2c1c]">
              Company list
            </h1>
            <p className="mt-2 text-sm text-[#6b7a66]">
              Select the users who should appear in the company list and gain access to company questionnaires.
            </p>
          </div>

          <section className="mt-8 rounded-[1.5rem] border border-[#d9e2d0] bg-white p-6 shadow-[0_20px_50px_rgba(64,81,59,0.12)] md:p-8">
            <div className="flex flex-col gap-4 border-b border-[#e6ece0] pb-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold text-[#1f2c1c]">
                  {selectedCount} selected
                </p>
                <p className="mt-1 text-sm text-[#6b7a66]">
                  Toggle users on or off. These users will be shown in the company directory.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <label className="flex items-center gap-2 rounded-full border border-[#d0dcc3] bg-[#f8faf3] px-4 py-2 text-sm text-[#3d4a38]">
                  <Search className="h-4 w-4 text-[#6b7a66]" aria-hidden="true" />
                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className="w-56 bg-transparent outline-none placeholder:text-[#9aa792]"
                    placeholder="Search users"
                  />
                </label>
                <button
                  type="button"
                  onClick={selectAllVisible}
                  className="inline-flex items-center justify-center rounded-full border border-[#cdd7c1] px-4 py-2 text-sm font-semibold text-[#2d5a3f] transition hover:border-[#a6b79d]"
                >
                  Select visible
                </button>
              </div>
            </div>

            {successMessage ? (
              <p className="mt-5 rounded-2xl border border-[#c6d6b8] bg-[#eef4e3] px-4 py-3 text-sm text-[#4f6a41]">
                {successMessage}
              </p>
            ) : null}

            <div className="mt-6 overflow-hidden rounded-3xl border border-[#e6ece0]">
              {isLoadingUsers ? (
                <div className="p-6 text-sm text-[#6b7a66]">Loading users...</div>
              ) : filteredUsers.length > 0 ? (
                <div className="divide-y divide-[#e6ece0]">
                  {filteredUsers.map((user) => {
                    const isSelected = selectedIds.includes(user.id);
                    return (
                      <label
                        key={user.id}
                        className="flex cursor-pointer items-center justify-between gap-4 bg-white px-5 py-4 transition hover:bg-[#f8faf3]"
                      >
                        <div className="flex items-center gap-4">
                          <span
                            className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${
                              isSelected
                                ? "bg-[#2d5a3f] text-white"
                                : "bg-[#e6ece0] text-[#40513b]"
                            }`}
                          >
                            <Users className="h-5 w-5" aria-hidden="true" />
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-[#1f2c1c]">
                              {user.name}
                            </p>
                            <p className="mt-1 text-xs text-[#6b7a66]">
                              {user.email}
                              {user.company ? ` • ${user.company}` : " • Public"}
                            </p>
                          </div>
                        </div>

                        <span className="flex items-center gap-3 text-sm text-[#5b6a56]">
                          {isSelected ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#eef4e3] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#4f6a41]">
                              <Check className="h-3.5 w-3.5" aria-hidden="true" />
                              Included
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full border border-[#d7dfcb] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7a66]">
                              Not included
                            </span>
                          )}
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleUser(user.id)}
                            className="h-4 w-4 rounded border-[#c3d1b4] text-[#609966] accent-[#609966]"
                          />
                        </span>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 text-sm text-[#6b7a66]">
                  {searchTerm.trim()
                    ? "No users matched your search."
                    : "No users available to display."}
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-full border border-[#cdd7c1] px-5 py-3 text-sm font-semibold text-[#40513b] transition hover:border-[#a6b79d]"
              >
                Cancel
              </Link>
              <button
                type="button"
                onClick={saveCompanyList}
                disabled={isSaving}
                className="inline-flex items-center justify-center rounded-full bg-[#40513b] px-5 py-3 text-sm font-semibold text-[#f4f7e6] shadow-[0_16px_30px_rgba(64,81,59,0.24)] transition hover:bg-[#334129] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "Saving..." : "Save company list"}
              </button>
            </div>
          </section>
        </main>
      </div>
    </ProtectedRoute>
  );
}