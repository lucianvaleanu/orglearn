import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-[#d6dfc9] bg-[#f8faf3]">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <div className="text-base font-semibold tracking-[0.08em] text-[#40513b]">
          Skill Lab
        </div>
        <nav className="hidden items-center gap-8 text-sm font-medium text-[#586856] md:flex">
          <Link href="/" className="transition hover:text-[#40513b]">
            Community
          </Link>
          <Link href="/" className="transition hover:text-[#40513b]">
            Resources
          </Link>
          <Link href="/" className="transition hover:text-[#40513b]">
            Pricing
          </Link>
          <Link href="/" className="transition hover:text-[#40513b]">
            Contact
          </Link>
        </nav>
        <button
          type="button"
          className="rounded-full bg-[#40513b] px-5 py-2 text-sm font-semibold text-[#f4f7e6] shadow-sm transition hover:bg-[#334129]"
        >
          Profile
        </button>
      </div>
    </header>
  );
}
