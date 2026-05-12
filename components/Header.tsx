"use client";

import Link from "next/link";
import { useAuth } from "./auth/AuthContext";

export default function Header() {
  const { user, token, logout } = useAuth();

  return (
    <header className="border-b border-[#d6dfc9] bg-[#f8faf3]">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <div className="text-base font-semibold tracking-[0.08em] text-[#40513b]">
          OrgLearn
        </div>
        <nav className="hidden items-center gap-8 text-sm font-medium text-[#586856] md:flex">
          <Link href="/" className="transition hover:text-[#40513b]">
            Community
          </Link>
          <Link href="/" className="transition hover:text-[#40513b]">
            Resources
          </Link>
          <Link href="/" className="transition hover:text-[#40513b]">
            Contact
          </Link>
        </nav>
        {token ? (
          <div className="flex items-center gap-3">
            <span className="hidden text-sm font-medium text-[#586856] sm:inline">
              {user?.name ?? "Account"}
            </span>
            <button
              type="button"
              onClick={logout}
              className="rounded-full bg-[#40513b] px-5 py-2 text-sm font-semibold text-[#f4f7e6] shadow-sm transition hover:bg-[#334129]"
            >
              Log out
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="rounded-full bg-[#40513b] px-5 py-2 text-sm font-semibold text-[#f4f7e6] shadow-sm transition hover:bg-[#334129]"
          >
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
