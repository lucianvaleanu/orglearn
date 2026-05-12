import Image from "next/image";
import Link from "next/link";

const currentYear = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-[#d9e2d0] bg-gray-50">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-6 px-6 py-6 text-sm text-[#5c6c57] sm:flex-row sm:items-center">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-base font-semibold text-[#2d5a3f]">
            <Image
              src="/logo.svg"
              alt="OrgLearn logo"
              width={28}
              height={28}
              className="h-7 w-7"
            />
            <span>OrgLearn</span>
          </div>
          <p className="text-xs text-[#6b7a66]">
            © {currentYear} OrgLearn. Built for organic growth.
          </p>
          <p className="text-xs text-[#7a8b73]">Made with ❤️ by Someș Laboratories</p>
        </div>

        <nav className="flex flex-wrap items-center gap-6 text-xs font-semibold uppercase tracking-[0.2em] text-[#6b7a66]">
          <Link className="transition hover:text-[#2d5a3f]" href="/privacy">
            Privacy Policy
          </Link>
          <Link className="transition hover:text-[#2d5a3f]" href="/terms">
            Terms of Service
          </Link>
          <Link className="transition hover:text-[#2d5a3f]" href="/support">
            Support
          </Link>
        </nav>
      </div>
    </footer>
  );
}
