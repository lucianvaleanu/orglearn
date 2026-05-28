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

export const fetchScenariosFromDatabase = async (token: string) => {
  const response = await apiRequest<ScenarioResponse>("/scenarios", {
    token,
  });

  if (Array.isArray(response)) {
    return response;
  }

  return Array.isArray(response.data) ? response.data : [];
};