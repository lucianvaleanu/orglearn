'use client';

import Image from "next/image";
import Link from "next/link";

type ErrorPageProps = {
  error: Error;
  reset: () => void;
};

export default function ErrorPage({ reset }: ErrorPageProps) {
  return (
    <div className="min-h-screen bg-[#edf1d6]">
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-14">
        <div className="absolute -left-20 top-8 h-52 w-52 rounded-full bg-[#9dc08b]/35 blur-3xl animate-fade-in" />
        <div className="absolute -bottom-10 right-10 h-64 w-64 rounded-full bg-[#609966]/25 blur-[80px] animate-fade-in" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.55),_rgba(237,241,214,0.3),_rgba(237,241,214,0))]" />

        <div className="relative z-10 w-full max-w-xl text-center text-[#40513b]">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-white/70 shadow-[0_24px_50px_rgba(64,81,59,0.2)] animate-rise-in">
            <Image
              src="/logo.svg"
              alt="OrgLearn logo"
              width={64}
              height={64}
              className="h-12 w-12"
              priority
            />
          </div>

          <h1 className="mt-8 text-3xl font-semibold sm:text-4xl animate-rise-in">
            Something went wrong on our end
          </h1>
          <p className="mt-4 text-sm leading-7 text-[#4a5c45] sm:text-base animate-rise-in">
            Our Render backend may be waking up from a cold start or handling a
            temporary hiccup. OrgLearn is a dissertation project in active
            development, so please refresh in a moment while we bring Team
            Management and Communication scenarios back online.
          </p>

          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center animate-rise-in">
            <button
              type="button"
              onClick={() => reset()}
              className="rounded-full border border-[#cdd7c1] px-5 py-3 text-sm font-semibold text-[#40513b] transition hover:border-[#a6b79d] hover:text-[#2d5a3f]"
            >
              Refresh Page
            </button>
            <Link
              href="/"
              className="rounded-full bg-[#2d5a3f] px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(45,90,63,0.25)] transition hover:bg-[#234532]"
            >
              Back to Safety
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
