"use client";

import Link from "next/link";

type PermissionDeniedProps = {
  title?: string;
  message?: string;
  backHref?: string;
  backLabel?: string;
};

export default function PermissionDenied({
  title = "You do not have access to this page",
  message = "This area is restricted to admins. If you believe this is a mistake, contact an administrator.",
  backHref = "/",
  backLabel = "Back to dashboard",
}: PermissionDeniedProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6 py-12">
      <div className="w-full max-w-xl rounded-[1.5rem] border border-[#e0b4b4] bg-[#fff7f7] px-6 py-8 text-center shadow-[0_18px_40px_rgba(64,81,59,0.12)] sm:px-10">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#9a4a4a]">
          Permission denied
        </p>
        <h1 className="mt-4 text-2xl font-semibold text-[#8d2f2f] sm:text-3xl">
          {title}
        </h1>
        <p className="mt-3 text-sm leading-7 text-[#8a5a5a] sm:text-base">
          {message}
        </p>
        <div className="mt-8 flex justify-center">
          <Link
            href={backHref}
            className="rounded-full bg-[#40513b] px-5 py-3 text-sm font-semibold text-[#f4f7e6] shadow-sm transition hover:bg-[#334129]"
          >
            {backLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}