"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { apiRequest } from "../lib/apiClient";
import { useAuth } from "./auth/AuthContext";

type ScenarioRow = {
  scenarioId: string;
  scenarioTitle: string;
  domainTitle: string | null;
  difficultyLevel: number;
  status: string;
  action: string;
};

type ScenarioSelectionResponse = {
  data: ScenarioRow[];
};

const getDifficultyLabel = (level: number) => {
  if (level === 1) {
    return "Beginner";
  }

  if (level === 2) {
    return "Intermediate";
  }

  if (level === 3) {
    return "Advanced";
  }

  return "Unknown";
};

const getDifficultyStars = (level: number) => {
  if (level === 1) {
    return 1;
  }

  if (level === 2) {
    return 2;
  }

  if (level === 3) {
    return 3;
  }

  return 0;
};

function Stars({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-1 text-[#caa33b]">
      {Array.from({ length: 3 }).map((_, index) => (
        <Star
          key={index}
          className="h-4 w-4"
          fill={index < count ? "currentColor" : "none"}
          stroke={index < count ? "currentColor" : "#cdd7c1"}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

export default function ScenarioSelectionTable() {
  const { token, user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [scenarios, setScenarios] = useState<ScenarioRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!token || !user?.id) {
      setIsLoading(false);
      router.replace("/login");
      return;
    }

    const loadScenarios = async () => {
      try {
        setErrorMessage(null);
        const response = await apiRequest<ScenarioSelectionResponse>(
          `/scenarios/selection/${user.id}`,
          { token }
        );
        setScenarios(response.data || []);
      } catch (error) {
        const status = error instanceof Error && "status" in error ? Number(error.status) : 0;
        if (status === 401) {
          router.replace("/login");
          return;
        }
        setErrorMessage("Unable to load scenarios right now.");
      } finally {
        setIsLoading(false);
      }
    };

    loadScenarios();
  }, [token, user?.id, router, isAuthLoading]);

  const hasRows = useMemo(() => scenarios.length > 0, [scenarios]);
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(scenarios.length / pageSize)),
    [scenarios.length, pageSize]
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  const pagedScenarios = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return scenarios.slice(startIndex, endIndex);
  }, [scenarios, currentPage, pageSize]);

  return (
    <section className="rounded-[1rem] border border-[#d9e2d0] bg-white shadow-[0_20px_50px_rgba(64,81,59,0.12)]">
      <div className="grid grid-cols-[2.2fr_minmax(180px,1.2fr)_1.2fr_0.8fr] gap-4 rounded-t-[1rem] bg-[#f3f4f1] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.28em] text-[#6a7a66]">
        <span>Title</span>
        <span>Domain</span>
        <span>Difficulty</span>
        <span className="text-right">Action</span>
      </div>
      <div className="divide-y divide-[#e4eadb]">
        {isLoading ? (
          <div className="px-6 py-6 text-sm text-[#6b7a66]">Loading scenarios...</div>
        ) : errorMessage ? (
          <div className="px-6 py-6 text-sm text-[#8d2f2f]">{errorMessage}</div>
        ) : !hasRows ? (
          <div className="px-6 py-6 text-sm text-[#6b7a66]">
            No scenarios available yet.
          </div>
        ) : (
          pagedScenarios.map((scenario) => (
            <div
              key={scenario.scenarioId}
              className="grid grid-cols-[2.2fr_minmax(180px,1.2fr)_1.2fr_0.8fr] items-center gap-4 px-6 py-4"
            >
              <div className="text-sm font-semibold text-[#1f2c1c]">
                {scenario.scenarioTitle}
              </div>
              <div className="min-w-0">
                <span className="inline-block max-w-full overflow-hidden text-ellipsis whitespace-nowrap rounded-full bg-[#eef1ec] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#2d5a3f]">
                  {scenario.domainTitle ?? "General"}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm text-[#5e6d59]">
                <Stars count={getDifficultyStars(scenario.difficultyLevel)} />
                <span>{getDifficultyLabel(scenario.difficultyLevel)}</span>
              </div>
              <div className="flex justify-end">
                <Link
                  href={`/scenarios/${scenario.scenarioId}`}
                  className="rounded-full bg-[#2d5a3f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#234532]"
                >
                  {scenario.action || "Start"}
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
      {!isLoading && !errorMessage && hasRows && totalPages > 1 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e4eadb] px-6 py-4">
          <p className="text-sm text-[#6b7a66]">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              className="rounded-full border border-[#cdd7c1] px-4 py-2 text-sm font-semibold text-[#40513b] transition hover:border-[#a6b79d] hover:text-[#2d5a3f] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={currentPage === totalPages}
              className="rounded-full border border-[#cdd7c1] px-4 py-2 text-sm font-semibold text-[#40513b] transition hover:border-[#a6b79d] hover:text-[#2d5a3f] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
