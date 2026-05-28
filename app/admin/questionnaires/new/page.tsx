"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "../../../../components/Header";
import ProtectedRoute from "../../../../components/auth/ProtectedRoute";
import PermissionDenied from "../../../../components/auth/PermissionDenied";
import { apiRequest } from "../../../../lib/apiClient";
import { useAuth } from "../../../../components/auth/AuthContext";

type QuestionnaireOption = {
  text: string;
  is_correct: boolean;
};

type QuestionnaireCreatePayload = {
  title: string;
  domain: string;
  difficulty_level: number;
  content_data: {
    context: string;
    question: string;
    options: QuestionnaireOption[];
    pedagogical_analysis: string;
  };
};

const parseOptions = (value: string) => {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const isCorrect =
        line.startsWith("*") ||
        line.startsWith("[correct]") ||
        line.startsWith("[x]") ||
        line.startsWith("✓");
      const text = line
        .replace(/^\*\s*/, "")
        .replace(/^\[correct\]\s*/i, "")
        .replace(/^\[x\]\s*/i, "")
        .replace(/^✓\s*/, "")
        .trim();

      return {
        text,
        is_correct: isCorrect,
      };
    })
    .filter((option) => option.text.length > 0);
};

function QuestionnaireForm() {
  const { token } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  if (!token) {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);
    setPermissionDenied(false);

    const formData = new FormData(event.currentTarget);
    const title = String(formData.get("title") || "").trim();
    const domain = String(formData.get("domain") || "").trim();
    const difficultyLevel = Number(formData.get("difficultyLevel") || 1);
    const context = String(formData.get("context") || "").trim();
    const question = String(formData.get("question") || "").trim();
    const optionsRaw = String(formData.get("options") || "").trim();
    const pedagogicalAnalysis = String(formData.get("pedagogicalAnalysis") || "").trim();

    if (!title || !domain || !context || !question || !pedagogicalAnalysis) {
      setErrorMessage("Please fill in the required fields before submitting.");
      return;
    }

    const options = parseOptions(optionsRaw);
    if (options.some((option) => !option.text)) {
      setErrorMessage("Remove any empty option lines before submitting.");
      return;
    }

    if (options.filter((option) => option.is_correct).length > 1) {
      setErrorMessage("Mark only one option as correct.");
      return;
    }

    const payload: QuestionnaireCreatePayload = {
      title,
      domain,
      difficulty_level: Number.isFinite(difficultyLevel) ? difficultyLevel : 1,
      content_data: {
        context,
        question,
        options,
        pedagogical_analysis: pedagogicalAnalysis,
      },
    };

    try {
      setIsSubmitting(true);
      await apiRequest<{ data: { id: string } }>("/api/admin/questionnaires", {
        method: "POST",
        token,
        body: payload,
      });
      setSuccessMessage("Questionnaire created successfully.");
      event.currentTarget.reset();
      router.refresh();
    } catch (error) {
      const status = error instanceof Error && "status" in error ? Number(error.status) : 0;
      if (status === 401) {
        router.replace("/login");
        return;
      }

      if (status === 403) {
        setPermissionDenied(true);
        return;
      }

      setErrorMessage(
        error instanceof Error ? error.message : "Unable to create the questionnaire."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (permissionDenied) {
    return (
      <PermissionDenied
        title="You cannot add questionnaires"
        message="Your account does not have permission to create admin content."
        backHref="/"
        backLabel="Return to dashboard"
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#edf1d6]">
      <Header />
      <main className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-10 lg:px-6">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#6e8b77]">
            Admin tools
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-[#1f2c1c]">
            Add Questionnaire
          </h1>
          <p className="mt-2 text-sm text-[#6b7a66]">
            Create a new scenario-style questionnaire using the same content shape as the learning flow.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 grid gap-6 rounded-[1.5rem] border border-[#d9e2d0] bg-white p-6 shadow-[0_20px_50px_rgba(64,81,59,0.12)] md:p-8"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#60725c]">
                Title
              </span>
              <input
                name="title"
                required
                className="mt-2 w-full rounded-2xl border border-[#d0dcc3] bg-[#f8faf3] px-4 py-3 text-sm text-[#3d4a38] focus:outline-none focus:ring-2 focus:ring-[#609966]/30"
                placeholder="Communication scenario title"
              />
            </label>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#60725c]">
                Domain
              </span>
              <input
                name="domain"
                required
                className="mt-2 w-full rounded-2xl border border-[#d0dcc3] bg-[#f8faf3] px-4 py-3 text-sm text-[#3d4a38] focus:outline-none focus:ring-2 focus:ring-[#609966]/30"
                placeholder="Team Management"
              />
            </label>
          </div>

          <div className="grid gap-5 md:grid-cols-[1fr_1fr]">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#60725c]">
                Difficulty
              </span>
              <select
                name="difficultyLevel"
                defaultValue={1}
                className="mt-2 w-full rounded-2xl border border-[#d0dcc3] bg-[#f8faf3] px-4 py-3 text-sm text-[#3d4a38] focus:outline-none focus:ring-2 focus:ring-[#609966]/30"
              >
                <option value={1}>Foundational</option>
                <option value={2}>Applied</option>
                <option value={3}>Strategic</option>
              </select>
            </label>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#60725c]">
                Question
              </span>
              <input
                name="question"
                required
                className="mt-2 w-full rounded-2xl border border-[#d0dcc3] bg-[#f8faf3] px-4 py-3 text-sm text-[#3d4a38] focus:outline-none focus:ring-2 focus:ring-[#609966]/30"
                placeholder="What do you do first?"
              />
            </label>
          </div>

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#60725c]">
              Context
            </span>
            <textarea
              name="context"
              required
              rows={5}
              className="mt-2 w-full rounded-2xl border border-[#d0dcc3] bg-[#f8faf3] px-4 py-3 text-sm text-[#3d4a38] focus:outline-none focus:ring-2 focus:ring-[#609966]/30"
              placeholder="Describe the situation the learner is entering..."
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#60725c]">
              Answer options
            </span>
            <textarea
              name="options"
              rows={6}
              className="mt-2 w-full rounded-2xl border border-[#d0dcc3] bg-[#f8faf3] px-4 py-3 text-sm text-[#3d4a38] focus:outline-none focus:ring-2 focus:ring-[#609966]/30"
              placeholder="One option per line. Mark the correct one with * or [correct]."
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#60725c]">
              Pedagogical analysis
            </span>
            <textarea
              name="pedagogicalAnalysis"
              required
              rows={7}
              className="mt-2 w-full rounded-2xl border border-[#d0dcc3] bg-[#f8faf3] px-4 py-3 text-sm text-[#3d4a38] focus:outline-none focus:ring-2 focus:ring-[#609966]/30"
              placeholder="Explain the correct approach and why it matters..."
            />
          </label>

          {errorMessage ? (
            <p className="rounded-2xl border border-[#e0b4b4] bg-[#fff7f7] px-4 py-3 text-sm text-[#8d2f2f]">
              {errorMessage}
            </p>
          ) : null}

          {successMessage ? (
            <p className="rounded-2xl border border-[#c6d6b8] bg-[#eef4e3] px-4 py-3 text-sm text-[#4f6a41]">
              {successMessage}
            </p>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full border border-[#cdd7c1] px-5 py-3 text-sm font-semibold text-[#40513b] transition hover:border-[#a6b79d]"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-full bg-[#40513b] px-5 py-3 text-sm font-semibold text-[#f4f7e6] shadow-[0_16px_30px_rgba(64,81,59,0.24)] transition hover:bg-[#334129] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : "Create questionnaire"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default function NewQuestionnairePage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <QuestionnaireForm />
    </ProtectedRoute>
  );
}