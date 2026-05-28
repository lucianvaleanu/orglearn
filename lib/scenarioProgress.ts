export type CompletedScenarioScore = {
  scenarioId: string;
  score: number;
  completedAt: string;
};

const COMPLETED_SCORE_PREFIX = "orglearn_completed_scenario_";

export const getCompletedScenarioScoreKey = (scenarioId: string) =>
  `${COMPLETED_SCORE_PREFIX}${scenarioId}`;

export const saveCompletedScenarioScore = (
  scenarioId: string,
  score: number,
  completedAt = new Date().toISOString()
) => {
  if (typeof window === "undefined") {
    return;
  }

  const payload: CompletedScenarioScore = {
    scenarioId,
    score,
    completedAt,
  };

  window.localStorage.setItem(
    getCompletedScenarioScoreKey(scenarioId),
    JSON.stringify(payload)
  );
};

export const loadCompletedScenarioScores = () => {
  if (typeof window === "undefined") {
    return [] as CompletedScenarioScore[];
  }

  return Object.keys(window.localStorage)
    .filter((key) => key.startsWith(COMPLETED_SCORE_PREFIX))
    .map((key) => {
      const rawValue = window.localStorage.getItem(key);
      if (!rawValue) {
        return null;
      }

      try {
        const parsed = JSON.parse(rawValue) as Partial<CompletedScenarioScore>;
        if (
          typeof parsed.scenarioId !== "string" ||
          typeof parsed.score !== "number"
        ) {
          return null;
        }

        return {
          scenarioId: parsed.scenarioId,
          score: parsed.score,
          completedAt:
            typeof parsed.completedAt === "string"
              ? parsed.completedAt
              : new Date(0).toISOString(),
        } satisfies CompletedScenarioScore;
      } catch {
        return null;
      }
    })
    .filter((value): value is CompletedScenarioScore => value !== null)
    .sort(
      (left, right) =>
        new Date(right.completedAt).getTime() - new Date(left.completedAt).getTime()
    );
};