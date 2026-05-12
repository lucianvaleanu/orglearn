"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Play, Settings } from "lucide-react";
import { apiRequest } from "../lib/apiClient";
import { useAuth } from "./auth/AuthContext";

type ScenarioOption = {
  text: string;
  is_correct: boolean;
};

type ScenarioStep = {
  context?: string;
  question?: string;
  options?: ScenarioOption[];
  pedagogical_analysis?: string;
  model_response?: string;
  model_strategy?: string;
  actions_of_the_first_month?: string;
};

type ScenarioContent = ScenarioStep & {
  steps?: ScenarioStep[];
};

type ScenarioData = {
  domain: string;
  title: string;
  difficulty_level: number;
  content_data: ScenarioContent;
};

type AttemptStartResponse = {
  data: {
    attemptId: string;
    attemptNumber: number;
    status: string;
    action: string;
  };
};

type NextStepResponse = {
  data: {
    scenarioId: string;
  } | null;
};

type AttemptCompleteResponse = {
  data: {
    id: string;
    status: string;
  };
};

type ScenarioPlayerProps = {
  scenarioId: string;
};

const stripCitations = (value?: string | null) =>
  value ? value.replace(/\s*\[cite:[^\]]+\]/g, "").trim() : "";

const getScenarioIndex = (scenarioId: string, total: number) => {
  let hash = 0;
  for (let index = 0; index < scenarioId.length; index += 1) {
    hash = (hash * 31 + scenarioId.charCodeAt(index)) % total;
  }
  return hash;
};

const getRankForScore = (score: number) => {
  if (score >= 90) {
    return "Strategic Communicator";
  }
  if (score >= 75) {
    return "Trusted Coach";
  }
  if (score >= 60) {
    return "Steady Leader";
  }
  return "Growth Mindset Builder";
};

const getProgressKey = (scenarioId: string) => `orglearn_scenario_${scenarioId}`;

export default function ScenarioPlayer({ scenarioId }: ScenarioPlayerProps) {
  const { token, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [scenario, setScenario] = useState<ScenarioData | null>(null);
  const [scenarioError, setScenarioError] = useState<string | null>(null);
  const [isScenarioLoading, setIsScenarioLoading] = useState(true);
  const [stepIndex, setStepIndex] = useState(0);
  const [phase, setPhase] = useState<"challenge" | "feedback" | "complete">("challenge");
  const [selectedOptions, setSelectedOptions] = useState<(number | null)[]>([]);
  const [textResponses, setTextResponses] = useState<string[]>([]);
  const [answerResults, setAnswerResults] = useState<(boolean | null)[]>([]);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [isAttemptLoading, setIsAttemptLoading] = useState(false);
  const [nextScenarioId, setNextScenarioId] = useState<string | null>(null);

  const steps = useMemo<ScenarioStep[]>(() => {
    if (!scenario?.content_data) {
      return [];
    }

    const contentSteps = scenario.content_data.steps;
    if (Array.isArray(contentSteps) && contentSteps.length > 0) {
      return contentSteps;
    }

    return [scenario.content_data];
  }, [scenario]);

  const totalSteps = steps.length || 1;
  const currentStep = steps[stepIndex] ?? steps[0];
  const options = currentStep?.options ?? [];
  const currentSelectedOption = selectedOptions[stepIndex] ?? null;
  const currentResponse = textResponses[stepIndex] ?? "";

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!token) {
      router.replace("/login");
    }
  }, [token, isAuthLoading, router]);

  useEffect(() => {
    let isMounted = true;

    const loadScenario = async () => {
      try {
        setScenarioError(null);
        setIsScenarioLoading(true);
        const response = await fetch("/data/scenarios.json");
        if (!response.ok) {
          throw new Error("Unable to load scenarios.");
        }
        const data = (await response.json()) as ScenarioData[];
        if (!isMounted) {
          return;
        }
        if (data.length === 0) {
          setScenarioError("No scenarios available.");
          setScenario(null);
          return;
        }
        const selectedIndex = getScenarioIndex(scenarioId, data.length);
        setScenario(data[selectedIndex]);
      } catch (error) {
        if (!isMounted) {
          return;
        }
        setScenarioError(
          error instanceof Error ? error.message : "Unable to load scenario."
        );
        setScenario(null);
      } finally {
        if (isMounted) {
          setIsScenarioLoading(false);
        }
      }
    };

    loadScenario();

    return () => {
      isMounted = false;
    };
  }, [scenarioId]);

  useEffect(() => {
    setAttemptId(null);
    setNextScenarioId(null);
  }, [scenarioId]);

  useEffect(() => {
    if (!scenario || steps.length === 0) {
      return;
    }

    setSelectedOptions(Array(steps.length).fill(null));
    setTextResponses(Array(steps.length).fill(""));
    setAnswerResults(Array(steps.length).fill(null));
    setStepIndex(0);
    setPhase("challenge");
  }, [scenario, steps.length]);

  useEffect(() => {
    if (!scenario || steps.length === 0) {
      return;
    }

    const key = getProgressKey(scenarioId);
    const stored = window.localStorage.getItem(key);
    if (!stored) {
      return;
    }

    try {
      const parsed = JSON.parse(stored) as {
        stepIndex?: number;
        selectedOptions?: (number | null)[];
        textResponses?: string[];
        answerResults?: (boolean | null)[];
      };

      if (typeof parsed.stepIndex === "number") {
        setStepIndex(Math.min(parsed.stepIndex, steps.length - 1));
      }
      if (Array.isArray(parsed.selectedOptions)) {
        setSelectedOptions((prev) => {
          const next = [...prev];
          parsed.selectedOptions?.forEach((value, index) => {
            if (index < next.length) {
              next[index] = value;
            }
          });
          return next;
        });
      }
      if (Array.isArray(parsed.textResponses)) {
        setTextResponses((prev) => {
          const next = [...prev];
          parsed.textResponses?.forEach((value, index) => {
            if (index < next.length) {
              next[index] = value || "";
            }
          });
          return next;
        });
      }
      if (Array.isArray(parsed.answerResults)) {
        setAnswerResults((prev) => {
          const next = [...prev];
          parsed.answerResults?.forEach((value, index) => {
            if (index < next.length) {
              next[index] = value ?? null;
            }
          });
          return next;
        });
      }
    } catch {
      window.localStorage.removeItem(key);
    }
  }, [scenarioId, scenario, steps.length]);

  useEffect(() => {
    if (!scenario || steps.length === 0) {
      return;
    }

    const payload = {
      stepIndex,
      selectedOptions,
      textResponses,
      answerResults,
    };
    window.localStorage.setItem(getProgressKey(scenarioId), JSON.stringify(payload));
  }, [scenarioId, scenario, steps.length, stepIndex, selectedOptions, textResponses, answerResults]);

  useEffect(() => {
    if (!token || !scenarioId || !scenario || isAttemptLoading || attemptId) {
      return;
    }

    let isMounted = true;

    const startAttempt = async () => {
      try {
        setIsAttemptLoading(true);
        const response = await apiRequest<AttemptStartResponse>("/api/attempts/start", {
          method: "POST",
          token,
          body: { scenarioId },
        });
        if (isMounted) {
          setAttemptId(response.data.attemptId);
        }
      } catch (error) {
        if (isMounted) {
          const status =
            error instanceof Error && "status" in error ? Number(error.status) : 0;
          if (status === 401) {
            router.replace("/login");
          }
        }
      } finally {
        if (isMounted) {
          setIsAttemptLoading(false);
        }
      }
    };

    startAttempt();

    return () => {
      isMounted = false;
    };
  }, [token, scenarioId, scenario, isAttemptLoading, attemptId, router]);

  const canConfirm = useMemo(() => {
    if (!currentStep) {
      return false;
    }

    if (options.length > 0) {
      return currentSelectedOption !== null;
    }

    return currentResponse.trim().length > 0;
  }, [currentStep, options.length, currentSelectedOption, currentResponse]);

  const confirmStep = () => {
    if (!canConfirm) {
      return;
    }

    if (options.length > 0 && currentSelectedOption !== null) {
      const isCorrect = options[currentSelectedOption]?.is_correct ?? false;
      setAnswerResults((prev) => {
        const next = [...prev];
        next[stepIndex] = isCorrect;
        return next;
      });
    }

    setPhase("feedback");
  };

  const goToNextStep = async () => {
    if (stepIndex < totalSteps - 1) {
      setPhase("challenge");
      setStepIndex((prev) => prev + 1);
      return;
    }

    const score = (() => {
      const evaluable = answerResults.filter((value) => value !== null).length;
      if (evaluable === 0) {
        return 85;
      }
      const correct = answerResults.filter((value) => value === true).length;
      return Math.round((correct / evaluable) * 100);
    })();

    setPhase("complete");

    if (token && attemptId) {
      try {
        await apiRequest<AttemptCompleteResponse>(`/api/attempts/${attemptId}/complete`, {
          method: "PATCH",
          token,
          body: { score, status: "completed" },
        });
      } catch (error) {
        const status =
          error instanceof Error && "status" in error ? Number(error.status) : 0;
        if (status === 401) {
          router.replace("/login");
        }
      }
    }

    if (token) {
      try {
        const response = await apiRequest<NextStepResponse>("/api/user/next-step", {
          token,
        });
        setNextScenarioId(response.data?.scenarioId ?? null);
      } catch {
        setNextScenarioId(null);
      }
    }
  };

  const resetScenario = () => {
    setPhase("challenge");
    setStepIndex(0);
    setSelectedOptions(Array(steps.length).fill(null));
    setTextResponses(Array(steps.length).fill(""));
    setAnswerResults(Array(steps.length).fill(null));
    setAttemptId(null);
    setNextScenarioId(null);
    window.localStorage.removeItem(getProgressKey(scenarioId));
  };

  const takeaways = useMemo(() => {
    const analysis = stripCitations(currentStep?.pedagogical_analysis);
    if (!analysis) {
      return [];
    }

    const sentences = analysis
      .split(/\.\s+/)
      .map((sentence) => sentence.trim())
      .filter(Boolean);
    return sentences.slice(0, 3).map((sentence) =>
      sentence.endsWith(".") ? sentence : `${sentence}.`
    );
  }, [currentStep?.pedagogical_analysis]);

  const score = useMemo(() => {
    const evaluable = answerResults.filter((value) => value !== null).length;
    if (evaluable === 0) {
      return 85;
    }
    const correct = answerResults.filter((value) => value === true).length;
    return Math.round((correct / evaluable) * 100);
  }, [answerResults]);

  if (isScenarioLoading) {
    return (
      <div className="min-h-screen bg-[#edf1d6] px-6 py-10">
        <div className="mx-auto max-w-6xl rounded-[1rem] border border-[#d9e2d0] bg-white p-8 shadow-[0_20px_50px_rgba(64,81,59,0.12)]">
          <div className="h-4 w-48 rounded-full bg-[#e6ece0]" />
          <div className="mt-6 h-6 w-2/3 rounded-full bg-[#eef1ec]" />
          <div className="mt-4 h-4 w-full rounded-full bg-[#eef1ec]" />
          <div className="mt-2 h-4 w-5/6 rounded-full bg-[#eef1ec]" />
        </div>
      </div>
    );
  }

  if (scenarioError || !scenario || !currentStep) {
    return (
      <div className="min-h-screen bg-[#edf1d6] px-6 py-10">
        <div className="mx-auto max-w-3xl rounded-[1rem] border border-[#d9e2d0] bg-white p-8 text-center shadow-[0_20px_50px_rgba(64,81,59,0.12)]">
          <h2 className="text-2xl font-semibold text-[#1f2c1c]">
            Scenario unavailable
          </h2>
          <p className="mt-3 text-sm text-[#6b7a66]">
            {scenarioError || "We could not load this scenario."}
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#2d5a3f] px-5 py-3 text-sm font-semibold text-white"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#edf1d6] px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#6b7a66]">
          <div>
            Domain: {stripCitations(scenario.domain)} | Scenario: {stripCitations(scenario.title)}
          </div>
          <div>
            Progress: Step {Math.min(stepIndex + 1, totalSteps)} of {totalSteps}
          </div>
        </div>

        <div className="grid gap-8 rounded-[1rem] border border-[#d9e2d0] bg-white p-8 shadow-[0_20px_50px_rgba(64,81,59,0.12)] lg:grid-cols-[1.15fr_0.85fr]">
          <div
            className={`space-y-6 transition-all duration-300 ${
              phase === "feedback" ? "blur-sm opacity-60" : "blur-0 opacity-100"
            }`}
          >
            <h1 className="text-2xl font-semibold text-[#1f2c1c] sm:text-3xl">
              {stripCitations(scenario.title)}
            </h1>
            <div className="space-y-4 text-sm text-[#2f3d2c]">
              <p>{stripCitations(currentStep.context)}</p>
              {currentStep.model_response ? (
                <p>{stripCitations(currentStep.model_response)}</p>
              ) : null}
              {currentStep.model_strategy ? (
                <p>{stripCitations(currentStep.model_strategy)}</p>
              ) : null}
              {currentStep.actions_of_the_first_month ? (
                <p>{stripCitations(currentStep.actions_of_the_first_month)}</p>
              ) : null}
            </div>
            <div className="rounded-[0.75rem] bg-[#f3f4f1] p-4 text-sm font-semibold text-[#2d5a3f]">
              {stripCitations(currentStep.question)}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -top-8 right-0 text-xs font-semibold uppercase tracking-[0.2em] text-[#6b7a66]">
              {phase === "challenge" ? "Choose your path" : phase === "feedback" ? "Feedback" : "Outcome"}
            </div>

            {phase !== "complete" ? (
              <div className="flex h-full flex-col justify-between gap-6">
                <div className="space-y-3">
                  {phase === "feedback" ? (
                    <div className="rounded-[0.8rem] border border-[#e4eadb] bg-white px-4 py-4 text-sm text-[#3b4a36]">
                      <p className="font-semibold text-[#2d5a3f]">Pedagogical analysis</p>
                      <p className="mt-2 whitespace-pre-line">
                        {stripCitations(currentStep.pedagogical_analysis)}
                      </p>
                    </div>
                  ) : options.length > 0 ? (
                    options.map((option, index) => {
                      const isSelected = currentSelectedOption === index;
                      return (
                        <button
                          key={option.text}
                          type="button"
                          onClick={() =>
                            setSelectedOptions((prev) => {
                              const next = [...prev];
                              next[stepIndex] = index;
                              return next;
                            })
                          }
                          className={`flex w-full items-center justify-between rounded-[0.8rem] border px-4 py-3 text-left text-sm font-semibold transition ${
                            isSelected
                              ? "border-[#2d5a3f] bg-[#e8f0df] text-[#2d5a3f]"
                              : "border-[#e4eadb] bg-[#f7f8f4] text-[#4a5c45] hover:border-[#cdd7c1]"
                          }`}
                        >
                          <span>{stripCitations(option.text)}</span>
                          <span className="ml-4 text-xs text-[#7a8b73]">Option {String.fromCharCode(65 + index)}</span>
                        </button>
                      );
                    })
                  ) : (
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-[#2d5a3f]">
                        Your strategy
                      </label>
                      <textarea
                        value={currentResponse}
                        onChange={(event) =>
                          setTextResponses((prev) => {
                            const next = [...prev];
                            next[stepIndex] = event.target.value;
                            return next;
                          })
                        }
                        rows={5}
                        placeholder="Outline your response in a few sentences..."
                        className="w-full rounded-[0.8rem] border border-[#e4eadb] bg-[#f7f8f4] px-4 py-3 text-sm text-[#4a5c45] focus:outline-none focus:ring-2 focus:ring-[#2d5a3f]/40"
                      />
                      <p className="text-xs text-[#7a8b73]">
                        Your response is saved locally while you work through the scenario.
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={phase === "feedback" ? goToNextStep : confirmStep}
                    disabled={!canConfirm && phase !== "feedback"}
                    className="inline-flex items-center gap-2 rounded-full bg-[#2d5a3f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#234532] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {phase === "feedback" ? "Next Step" : "Confirm"}
                    <Play className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex h-full flex-col justify-between gap-6">
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-[#2d5a3f]">
                      Scenario Complete!
                    </div>
                    <div className="mt-6 flex flex-col items-center gap-4">
                      <div className="relative flex h-32 w-32 items-center justify-center">
                        <div
                          className="absolute inset-0 rounded-full"
                          style={{
                            background: `conic-gradient(#6d8f61 ${score * 3.6}deg, #e6ece0 0deg)`,
                          }}
                        />
                        <div className="absolute inset-3 rounded-full bg-white" />
                        <div className="relative text-lg font-semibold text-[#2d5a3f]">
                          {score}/100
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-[#2d5a3f]">
                        Rank: {getRankForScore(score)}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[0.8rem] border border-[#e4eadb] bg-[#f7f8f4] px-4 py-4">
                    <p className="text-sm font-semibold text-[#2d5a3f]">Key Takeaways</p>
                    <ul className="mt-3 space-y-2 text-sm text-[#3b4a36]">
                      {takeaways.length > 0 ? (
                        takeaways.map((takeaway) => (
                          <li key={takeaway}>{takeaway}</li>
                        ))
                      ) : (
                        <li>Reflect on how the feedback aligns with calm, strategic leadership.</li>
                      )}
                    </ul>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-4">
                  <button
                    type="button"
                    onClick={resetScenario}
                    className="inline-flex items-center gap-2 rounded-full border border-[#cdd7c1] px-4 py-2 text-sm font-semibold text-[#2d5a3f] transition hover:border-[#a6b79d]"
                  >
                    Try Again
                    <Settings className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <Link
                    href={nextScenarioId ? `/scenarios/${nextScenarioId}` : "/"}
                    className="inline-flex items-center gap-2 rounded-full bg-[#2d5a3f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#234532]"
                  >
                    Next Scenario
                    <Play className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
