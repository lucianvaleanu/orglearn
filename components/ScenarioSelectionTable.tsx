"use client";

import { RefreshCcw, Star, Users, MessageSquare, LineChart } from "lucide-react";

const scenarios = [
  {
    id: "heated-stakeholder",
    title: "The Heated Stakeholder",
    domain: "Communication",
    difficulty: "Beginner",
    stars: 1,
    status: "in_progress",
    icon: MessageSquare,
  },
  {
    id: "team-misalignment",
    title: "Team Misalignment",
    domain: "Conflict Resolution",
    difficulty: "Intermediate",
    stars: 2,
    status: "not_started",
    icon: Users,
  },
  {
    id: "vision-casting",
    title: "Vision Casting 2025",
    domain: "Leadership",
    difficulty: "Advanced",
    stars: 3,
    status: "completed",
    icon: LineChart,
  },
] as const;

type Scenario = (typeof scenarios)[number];

type ScenarioStatus = Scenario["status"];

type ActionConfig = {
  label: string;
  className: string;
  icon?: typeof RefreshCcw;
};

const actionMap: Record<ScenarioStatus, ActionConfig> = {
  in_progress: {
    label: "Continue",
    className:
      "bg-[#2d5a3f] text-white hover:bg-[#234532] border border-transparent",
  },
  not_started: {
    label: "Redo",
    className:
      "border border-[#cdd7c1] text-[#40513b] hover:border-[#a6b79d] hover:text-[#2d5a3f]",
  },
  completed: {
    label: "Repeat",
    className: "text-[#2d5a3f] hover:text-[#1f3c2c]",
    icon: RefreshCcw,
  },
};

function renderAction(status: ScenarioStatus) {
  const config = actionMap[status];
  const Icon = config.icon;

  if (status === "completed" && Icon) {
    return (
      <button
        type="button"
        className={`inline-flex items-center gap-2 text-sm font-semibold ${config.className}`}
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
        {config.label}
      </button>
    );
  }

  return (
    <button
      type="button"
      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${config.className}`}
    >
      {config.label}
    </button>
  );
}

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
  return (
    <section className="rounded-[1rem] border border-[#d9e2d0] bg-white shadow-[0_20px_50px_rgba(64,81,59,0.12)]">
      <div className="grid grid-cols-[2.2fr_1.2fr_1.4fr_0.8fr] gap-4 rounded-t-[1rem] bg-[#f3f4f1] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.28em] text-[#6a7a66]">
        <span>Scenario Title</span>
        <span>Domain Tag</span>
        <span>Difficulty</span>
        <span className="text-right">Action</span>
      </div>
      <div className="divide-y divide-[#e4eadb]">
        {scenarios.map((scenario) => {
          const Icon = scenario.icon;

          return (
            <div
              key={scenario.id}
              className="grid grid-cols-[2.2fr_1.2fr_1.4fr_0.8fr] items-center gap-4 px-6 py-4"
            >
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-[#dfe8cc] text-[#2d5a3f]">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="text-sm font-semibold text-[#1f2c1c]">
                  {scenario.title}
                </span>
              </div>
              <div>
                <span className="rounded-full bg-[#eef1ec] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#2d5a3f]">
                  {scenario.domain}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm text-[#5e6d59]">
                <Stars count={scenario.stars} />
                <span>{scenario.difficulty}</span>
              </div>
              <div className="flex justify-end">
                {renderAction(scenario.status)}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
