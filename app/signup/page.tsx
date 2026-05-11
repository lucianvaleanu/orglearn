import Image from "next/image";
import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-[#edf1d6]">
      <main className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#edf1d6] via-[#d9e5c6] to-[#c5d7b1] px-6 py-12 text-center sm:px-10 lg:px-14">
          <div className="absolute -left-12 top-10 h-40 w-40 rounded-full bg-[#9dc08b]/40 blur-3xl" />
          <div className="absolute bottom-6 right-6 h-56 w-56 rounded-full bg-[#609966]/30 blur-3xl" />

          <div className="relative z-10 max-w-xl animate-rise-in">
            <div className="flex items-center justify-center text-[#40513b]">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f6f9e7] shadow-sm">
                <svg
                  width="43"
                  height="43"
                  viewBox="0 0 43 43"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M20.625 42.5618C19.25 42.5618 17.8646 42.4055 16.4688 42.093C15.0729 41.7805 13.6458 41.3326 12.1875 40.7493C12.6875 35.7076 14.1458 30.9993 16.5625 26.6243C18.9792 22.2493 22.0833 18.3951 25.875 15.0618C21.2917 17.3951 17.3229 20.4785 13.9688 24.3118C10.6146 28.1451 8.27083 32.5201 6.9375 37.4368C6.77083 37.3118 6.61458 37.1764 6.46875 37.0305C6.32292 36.8847 6.16667 36.7285 6 36.5618C4.04167 34.6035 2.55208 32.416 1.53125 29.9993C0.510417 27.5826 0 25.0618 0 22.4368C0 19.6035 0.5625 16.8951 1.6875 14.3118C2.8125 11.7285 4.375 9.4368 6.375 7.4368C9.75 4.0618 14.125 1.86388 19.5 0.843048C24.875 -0.177786 32.4167 -0.271536 42.125 0.561798C42.875 10.5201 42.75 18.1139 41.75 23.343C40.75 28.5722 38.5833 32.8535 35.25 36.1868C33.2083 38.2285 30.9271 39.8014 28.4062 40.9055C25.8854 42.0097 23.2917 42.5618 20.625 42.5618Z"
                    fill="#34633D"
                  />
                </svg>
              </span>
            </div>

            <h1 className="mt-8 text-3xl font-semibold leading-tight text-[#40513b] sm:text-4xl">
              Start your learning journey
            </h1>
            <p className="mt-4 max-w-md text-base leading-7 text-[#4a5c45]">
              Create a personal learning space that keeps your goals focused and
              your progress visible.
            </p>
          </div>

          <div className="relative z-10 mt-10 flex max-w-xl items-center justify-center animate-fade-in">
            <div className="rounded-[26px] shadow-[0_30px_70px_rgba(64,81,59,0.22)]">
              <Image
                src="/images/laptop.png"
                alt="OrgLearn workspace preview"
                width={520}
                height={390}
                className="h-auto w-full rounded-[26px] object-cover"
                priority
              />
            </div>
          </div>
        </section>

        <section className="relative flex items-center justify-center bg-[#f8faf3] px-6 py-12 sm:px-10 lg:px-14">
          <div className="absolute -top-20 right-10 h-40 w-40 rounded-full bg-[#9dc08b]/25 blur-3xl" />
          <div className="relative z-10 w-full max-w-md">
            <div className="animate-rise-in" style={{ animationDelay: "80ms" }}>
              <h2 className="text-3xl font-semibold text-[#40513b]">
                Create your account
              </h2>
              <p className="mt-2 text-sm text-[#5c6c57]">
                Set up your profile and continue growing with OrgLearn.
              </p>
            </div>

            <form className="mt-8 space-y-5 animate-rise-in" style={{ animationDelay: "160ms" }}>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#60725c]">
                  Full name
                </span>
                <div className="mt-2 flex items-center gap-3 rounded-2xl border border-[#d0dcc3] bg-white px-4 py-3 shadow-sm">
                  <input
                    type="text"
                    name="name"
                    placeholder="Your full name"
                    className="w-full bg-transparent text-sm text-[#3d4a38] placeholder:text-[#9aa792] focus:outline-none"
                  />
                </div>
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#60725c]">
                  Email address
                </span>
                <div className="mt-2 flex items-center gap-3 rounded-2xl border border-[#d0dcc3] bg-white px-4 py-3 shadow-sm">
                  <input
                    type="email"
                    name="email"
                    placeholder="name@company.com"
                    className="w-full bg-transparent text-sm text-[#3d4a38] placeholder:text-[#9aa792] focus:outline-none"
                  />
                </div>
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#60725c]">
                  Password
                </span>
                <div className="mt-2 flex items-center gap-3 rounded-2xl border border-[#d0dcc3] bg-white px-4 py-3 shadow-sm">
                  <input
                    type="password"
                    name="password"
                    placeholder="Create a password"
                    className="w-full bg-transparent text-sm text-[#3d4a38] placeholder:text-[#9aa792] focus:outline-none"
                  />
                </div>
              </label>

              <label className="flex items-center gap-3 text-sm text-[#5b6a56]">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-[#c3d1b4] text-[#609966] accent-[#609966]"
                />
                I agree to the terms and privacy policy
              </label>

              <button
                type="submit"
                className="w-full rounded-2xl bg-[#40513b] px-5 py-3 text-sm font-semibold text-[#f4f7e6] shadow-[0_16px_30px_rgba(64,81,59,0.28)] transition hover:-translate-y-0.5 hover:bg-[#334129]"
              >
                Create account
              </button>
            </form>

            <div className="mt-8 animate-rise-in" style={{ animationDelay: "240ms" }}>
              <p className="text-center text-sm text-[#5c6c57]">
                Already have an account?{" "}
                <Link href="/" className="font-semibold text-[#609966]">
                  Sign in
                </Link>
              </p>

              <div className="mt-8 flex items-center justify-center gap-6 text-[11px] uppercase tracking-[0.2em] text-[#9aa792]">
                <button type="button">Privacy policy</button>
                <button type="button">Terms of service</button>
                <button type="button">Support</button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
