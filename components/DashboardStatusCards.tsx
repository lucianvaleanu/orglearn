"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { BarChart3, Play, Settings, Trophy } from "lucide-react";
import { apiRequest } from "../lib/apiClient";
import { useAuth } from "./auth/AuthContext";

type StatsPayload = {
  currentRank: string;
  overallProgressPercentage: number;
};

type StatsResponse = {
  data: StatsPayload;
};

type NextStepPayload = {
  scenarioId: string;
  scenarioTitle: string;
  status: string;
};

type NextStepResponse = {
  data: NextStepPayload | null;
};

export default function DashboardStatusCards() {
  const { token } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const refreshKey = searchParams.get("refresh");
  const [stats, setStats] = useState<StatsPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [nextStep, setNextStep] = useState<NextStepPayload | null>(null);
  const [isNextStepLoading, setIsNextStepLoading] = useState(true);
  const [nextStepError, setNextStepError] = useState(false);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      router.replace("/login");
      return;
    }

    const loadStats = async () => {
      try {
        const response = await apiRequest<StatsResponse>("/api/user/stats", {
          token,
        });
        setStats(response.data);
      } catch (error) {
        const status = error instanceof Error && "status" in error ? Number(error.status) : 0;
        if (status === 401) {
          router.replace("/login");
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, [token, router, refreshKey]);

  useEffect(() => {
    if (!token) {
      setIsNextStepLoading(false);
      return;
    }

    const loadNextStep = async () => {
      try {
        setNextStepError(false);
        const response = await apiRequest<NextStepResponse>("/api/user/next-step", {
          token,
        });
        setNextStep(response.data ?? null);
      } catch (error) {
        const status = error instanceof Error && "status" in error ? Number(error.status) : 0;
        if (status === 401) {
          router.replace("/login");
          return;
        }
        setNextStep(null);
        setNextStepError(true);
      } finally {
        setIsNextStepLoading(false);
      }
    };

    loadNextStep();
  }, [token, router, refreshKey]);

  const progressPercentage = useMemo(() => {
    if (!stats) {
      return 0;
    }

    return Math.max(0, Math.min(100, stats.overallProgressPercentage));
  }, [stats]);

  return (
    <section className="grid gap-6 lg:grid-cols-3">
      <article className="rounded-[1rem] border-l-4 border-[#2d5a3f] bg-white p-6 shadow-[0_16px_40px_rgba(64,81,59,0.12)]">
        <div className="flex items-start justify-between">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#6e8b77]">
            Current rank
          </p>
          <Trophy className="h-5 w-5 text-[#caa33b]" aria-hidden="true" />
        </div>
        <h3 className="mt-6 text-2xl font-semibold text-[#1f2c1c]">
          {isLoading ? "Loading..." : stats?.currentRank ?? "-"}
        </h3>
        <p className="mt-2 text-sm text-[#6b7a66]">
          {isLoading ? "Fetching rank" : "Keep pushing to unlock the next level"}
        </p>
      </article>

      <article className="rounded-[1rem] border-l-4 border-[#caa33b] bg-white p-6 shadow-[0_16px_40px_rgba(64,81,59,0.12)]">
        <div className="flex items-start justify-between">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#6e8b77]">
            Mastery status
          </p>
          <BarChart3 className="h-5 w-5 text-[#4b6b55]" aria-hidden="true" />
        </div>
        <div className="mt-6 flex items-baseline gap-2">
          <span className="text-3xl font-semibold text-[#1f2c1c]">
            {isLoading ? "--" : `${progressPercentage}%`}
          </span>
          <span className="text-sm text-[#6b7a66]">Overall Progress</span>
        </div>
        <div className="mt-4 h-2 w-full rounded-full bg-[#e6ece0]">
          <div
            className="h-2 rounded-full bg-[#3f6a47]"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </article>

      <article className="relative overflow-hidden rounded-[1rem] bg-[#2d5a3f] p-6 text-white shadow-[0_16px_40px_rgba(64,81,59,0.18)]">
        <Settings
          className="absolute -bottom-4 -right-6 h-24 w-24 text-white/12"
          aria-hidden="true"
        />
        <div className="relative">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/70">
            Next step
          </p>
          {isNextStepLoading ? (
            <div className="mt-6 space-y-4 animate-pulse">
              <div className="h-6 w-3/4 rounded-full bg-white/20" />
              <div className="h-9 w-32 rounded-full bg-white/25" />
            </div>
          ) : nextStep ? (
            <>
              <h3 className="mt-6 text-2xl font-semibold">
                {nextStep.scenarioTitle}
              </h3>
              <Link
                href={`/scenarios/${nextStep.scenarioId}`}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#2d5a3f]"
              >
                {nextStep.status === "in_progress" ? "Resume" : "Start"}
                <Play className="h-4 w-4" aria-hidden="true" />
              </Link>
            </>
          ) : (
            <>
              <h3 className="mt-6 text-2xl font-semibold">Browse Scenarios</h3>
              <p className="mt-3 text-sm text-white/70">
                {nextStepError
                  ? "We could not load your next step right now."
                  : "No next step is available yet."}
              </p>
              <Link
                href="/"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#2d5a3f]"
              >
                Browse Scenarios
                <Play className="h-4 w-4" aria-hidden="true" />
              </Link>
            </>
          )}
        </div>
      </article>
    </section>
  );
}
