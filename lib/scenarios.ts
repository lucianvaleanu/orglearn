import { apiRequest } from "./apiClient";

export type ScenarioOption = {
  text: string;
  is_correct: boolean;
};

export type ScenarioStep = {
  context?: string;
  question?: string;
  options?: ScenarioOption[];
  pedagogical_analysis?: string;
  model_response?: string;
  model_strategy?: string;
  actions_of_the_first_month?: string;
};

export type ScenarioContent = ScenarioStep & {
  steps?: ScenarioStep[];
};

export type ScenarioData = {
  id: string;
  domain: string;
  title: string;
  difficulty_level: number;
  content_data: ScenarioContent;
};

type ScenarioResponse = ScenarioData[] | { data?: ScenarioData[] };

export const fetchScenariosFromDatabase = async (token?: string | null) => {
  // Try API first when a token is provided
  if (token) {
    try {
      const response = await apiRequest<ScenarioResponse>("/scenarios", { token });

      if (Array.isArray(response)) {
        return response;
      }

      if (Array.isArray(response.data)) {
        return response.data;
      }
    } catch (e) {
      // ignore and fallback to local file
    }
  }

  // Fallback to local static JSON in `public/data/scenarios.json`
  try {
    const res = await fetch("/data/scenarios.json");
    if (!res.ok) return [];
    const data = (await res.json()) as ScenarioData[];
    return Array.isArray(data) ? data : [];
  } catch (e) {
    return [];
  }
};