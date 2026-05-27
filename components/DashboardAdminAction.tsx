"use client";

import Link from "next/link";
import { useAuth } from "./auth/AuthContext";

export default function DashboardAdminAction() {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="mt-6 flex flex-wrap gap-3">
      <Link
        href="/admin/questionnaires/new"
        className="inline-flex items-center rounded-full bg-[#40513b] px-5 py-3 text-sm font-semibold text-[#f4f7e6] shadow-[0_16px_30px_rgba(64,81,59,0.24)] transition hover:bg-[#334129]"
      >
        Add Questionnaire
      </Link>
    </div>
  );
}