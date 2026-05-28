"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Award, Building2, ChevronRight, Trophy } from "lucide-react";
import ProtectedRoute from "../../components/auth/ProtectedRoute";
import Header from "../../components/Header";
import { useAuth } from "../../components/auth/AuthContext";
import { apiRequest } from "../../lib/apiClient";
import {
  loadCompletedScenarioScores,
  type CompletedScenarioScore,
} from "../../lib/scenarioProgress";

type StatsResponse = {
  data: {
    currentRank: string;
    overallProgressPercentage: number;
  };
};

const COMMON_PUBLIC_DOMAINS = new Set([
  "gmail.com",
  "outlook.com",
  "hotmail.com",
  "yahoo.com",
  "icloud.com",
  "proton.me",
  "protonmail.com",
]);

const formatCompanyLabel = (userEmail?: string | null, company?: string | null) => {
  const explicitCompany = company?.trim();
  if (explicitCompany) {
    return explicitCompany;
  }

  if (!userEmail || !userEmail.includes("@")) {
    return "Public";
  }

  const domain = userEmail.split("@")[1]?.toLowerCase().trim();
  if (!domain || COMMON_PUBLIC_DOMAINS.has(domain)) {
    return "Public";
  }

  const root = domain.split(".")[0]?.trim();
  if (!root) {
    return "Public";
  }

  return root.charAt(0).toUpperCase() + root.slice(1);
};

export default function ProfilePage() {
  const { user, scenarios, token } = useAuth();
  const [stats, setStats] = useState<StatsResponse["data"] | null>(null);
  const [scores, setScores] = useState<CompletedScenarioScore[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfileData = async () => {
      const storedScores = loadCompletedScenarioScores();
      setScores(storedScores);

      if (!token) {
        setStats(null);
        setIsLoading(false);
        return;
      }

      try {
        const response = await apiRequest<StatsResponse>("/api/user/stats", {
          token,
        });
        setStats(response.data);
      } catch {
        setStats(null);
      } finally {
        setIsLoading(false);
      }
    };

    void loadProfileData();
  }, [token]);

  const completedScenarioMap = useMemo(
    () => new Map(scenarios.map((scenario) => [scenario.id, scenario])),
    [scenarios]
  );

  const totalScore = useMemo(
    () => scores.reduce((sum, item) => sum + item.score, 0),
    [scores]
  );

  const averageScore = useMemo(() => {
    if (scores.length === 0) {
      return 0;
    }

    return Math.round(totalScore / scores.length);
  }, [scores, totalScore]);

  const companyLabel = formatCompanyLabel(user?.email, user?.company);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#edf1d6]">
        <Header />

        <main className="mx-auto w-full max-w-6xl px-6 py-12">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="overflow-hidden rounded-[28px] border border-[#d7dfcb] bg-gradient-to-br from-[#f8faf3] via-[#eef4e3] to-[#dfe9cf] p-8 shadow-[0_24px_70px_rgba(64,81,59,0.12)]">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#6e8b77]">
                Profile
              </p>
              <h1 className="mt-3 text-4xl font-semibold text-[#1f2c1c]">
                {user?.name ?? "Your profile"}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#61705c]">
                Review the company attached to your registration and the scenario
                scores you have completed so far.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl bg-white/90 p-5 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#6e8b77]">
                    Company
                  </p>
                  <div className="mt-4 flex items-center gap-3 text-[#1f2c1c]">
                    <Building2 className="h-5 w-5 text-[#4b6b55]" aria-hidden="true" />
                    <span className="text-lg font-semibold">{companyLabel}</span>
                  </div>
                </div>

                <div className="rounded-3xl bg-white/90 p-5 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#6e8b77]">
                    Completed
                  </p>
                  <div className="mt-4 flex items-center gap-3 text-[#1f2c1c]">
                    <Award className="h-5 w-5 text-[#caa33b]" aria-hidden="true" />
                    <span className="text-lg font-semibold">{scores.length} scenarios</span>
                  </div>
                </div>

                <div className="rounded-3xl bg-white/90 p-5 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#6e8b77]">
                    Total score
                  </p>
                  <div className="mt-4 flex items-center gap-3 text-[#1f2c1c]">
                    <Trophy className="h-5 w-5 text-[#4b6b55]" aria-hidden="true" />
                    <span className="text-lg font-semibold">{totalScore} pts</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-[#d7dfcb] bg-white p-8 shadow-[0_24px_70px_rgba(64,81,59,0.12)]">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#6e8b77]">
                Performance snapshot
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-[#f8faf3] p-5">
                  <p className="text-sm text-[#60725c]">Average score</p>
                  <p className="mt-3 text-3xl font-semibold text-[#1f2c1c]">
                    {scores.length > 0 ? `${averageScore}/100` : "--"}
                  </p>
                </div>

                <div className="rounded-3xl bg-[#f8faf3] p-5">
                  <p className="text-sm text-[#60725c]">Current rank</p>
                  <p className="mt-3 text-3xl font-semibold text-[#1f2c1c]">
                    {isLoading ? "Loading..." : stats?.currentRank ?? "Unavailable"}
                  </p>
                </div>

              </div>

              <div className="mt-8 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-[#1f2c1c]">
                    Completed scenarios
                  </h2>
                  <p className="mt-1 text-sm text-[#60725c]">
                    Latest completed attempts from this browser session.
                  </p>
                </div>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-full border border-[#cdd7c1] px-4 py-2 text-sm font-semibold text-[#2d5a3f] transition hover:border-[#a6b79d]"
                >
                  Back to dashboard
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>

              <div className="mt-5 space-y-3">
                {scores.length > 0 ? (
                  scores.map((item) => {
                    const scenario = completedScenarioMap.get(item.scenarioId);
                    return (
                      <article
                        key={item.scenarioId}
                        className="flex items-center justify-between gap-4 rounded-3xl border border-[#e1e8d7] bg-[#f8faf3] p-4"
                      >
                        <div>
                          <p className="text-sm font-semibold text-[#1f2c1c]">
                            {scenario?.title ?? "Completed scenario"}
                          </p>
                          <p className="mt-1 text-xs text-[#6b7a66]">
                            {scenario?.domain ?? item.scenarioId}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-[#2d5a3f]">
                            {item.score}/100
                          </p>
                          <p className="text-xs text-[#6b7a66]">
                            {new Date(item.completedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </article>
                    );
                  })
                ) : (
                  <div className="rounded-3xl border border-dashed border-[#d7dfcb] bg-[#f8faf3] p-6 text-sm text-[#60725c]">
                    No completed scenarios yet. Finish a scenario to see your score here.
                  </div>
                )}
              </div>
            </section>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}