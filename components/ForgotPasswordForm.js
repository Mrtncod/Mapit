"use client";

import Link from "next/link";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { CheckCircle2, Mail } from "lucide-react";

export default function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);
    setError("");

    const email = new FormData(e.currentTarget).get("email");

    try {
      const result = await authClient.requestPasswordReset({
        email,
        redirectTo: "/reset-password",
      });

      if (result?.error) {
        setError("Something went wrong. Please try again.");
        return;
      }

      setSent(true);
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-dvh flex-col bg-canvas px-4 py-4 sm:h-dvh sm:min-h-0 sm:overflow-hidden sm:px-8 sm:py-4">
      {/* Header */}
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-1">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          {/* Mapit logo */}
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-white shadow-sm">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path
                d="M20 10.2c0 5.1-8 11.3-8 11.3S4 15.3 4 10.2a8 8 0 1 1 16 0Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle
                cx="12"
                cy="10"
                r="2.5"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </span>

          <span className="text-xl font-extrabold tracking-tight text-ink">
            mapit
          </span>
        </Link>

        <Link
          href="/"
          className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border border-line bg-white px-3 py-2 text-xs font-semibold text-ink shadow-sm transition hover:border-accent/30 hover:bg-accent-soft hover:text-accent sm:px-5 sm:text-sm"
        >
          <span aria-hidden="true">←</span>
          Back to home
        </Link>
      </header>

      {/* Form area */}
      <section className="flex flex-1 items-center justify-center py-7 sm:min-h-0 sm:py-3">
        <div className="w-full max-w-[460px]">
          <div className="rounded-[24px] border border-line bg-surface p-5 shadow-soft sm:rounded-[28px] sm:p-10">
            {sent ? (
              <div className="text-center">
                <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 sm:h-16 sm:w-16">
                  <CheckCircle2 className="h-7 w-7 sm:h-8 sm:w-8" />
                </div>

                <p className="mb-2 text-sm font-bold text-accent">
                  PASSWORD RECOVERY
                </p>

                <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-[34px]">
                  Check your email
                </h1>

                <p className="mt-3 text-sm leading-7 text-ink-soft sm:text-base">
                  If an account exists for that address, a reset link is on its
                  way.
                </p>

                <Link
                  href="/login"
                  className="btn btn-primary mt-7 flex w-full items-center justify-center sm:mt-8"
                >
                  Back to log in
                </Link>

                <p className="mt-5 text-xs leading-6 text-ink-soft">
                  Don&apos;t see the email? Check your spam or junk folder.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft text-accent sm:mb-7 sm:h-16 sm:w-16">
                  <Mail className="h-7 w-7 sm:h-8 sm:w-8" />
                </div>

                <p className="mb-2 text-sm font-bold text-accent">
                  ACCOUNT RECOVERY
                </p>

                <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-[34px]">
                  Forgot your password?
                </h1>

                <p className="mt-3 text-sm leading-7 text-ink-soft sm:text-base">
                  No worries. Enter the email address associated with your
                  account and we&apos;ll send you a link to reset your password.
                </p>

                <form
                  onSubmit={handleSubmit}
                  className="mt-7 grid gap-5 sm:mt-8"
                >
                  <div className="grid gap-2">
                    <label
                      htmlFor="email"
                      className="text-sm font-semibold text-ink"
                    >
                      Email address
                    </label>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      required
                      className="field w-full"
                    />
                  </div>

                  {error && (
                    <p
                      role="alert"
                      className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
                    >
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary mt-1 w-full disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Sending reset link..." : "Send reset link"}
                  </button>
                </form>

                <div className="mt-7 border-t border-line pt-5 text-center sm:mt-8 sm:pt-6">
                  <p className="text-sm text-ink-soft">
                    Remember your password?{" "}
                    <Link
                      href="/login"
                      className="font-bold text-accent transition hover:text-accent-dark"
                    >
                      Log in
                    </Link>
                  </p>
                </div>
              </>
            )}
          </div>

          <p className="mt-5 px-2 text-center text-xs leading-6 text-ink-soft sm:mt-7">
            Explore places. Share experiences. Help others discover more.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-2 text-center text-xs text-ink-soft">
        © {new Date().getFullYear()} Mapit. Explore with confidence.
      </footer>
    </main>
  );
}

// "use client";

// import { useState } from "react";
// import { authClient } from "@/lib/auth-client";

// export default function ForgotPasswordForm() {
//   const [sent, setSent] = useState(false);
//   const [loading, setLoading] = useState(false);

//   async function handleSubmit(e) {
//     e.preventDefault();
//     setLoading(true);
//     const email = new FormData(e.currentTarget).get("email");
//     await authClient.requestPasswordReset({
//       email,
//       redirectTo: "/reset-password",
//     });
//     setLoading(false);
//     setSent(true); // same message whether or not the account exists
//   }

//   if (sent)
//     return (
//       <p>If an account exists for that address, a reset link is on its way.</p>
//     );

//   return (
//     <form
//       onSubmit={handleSubmit}
//       style={{ display: "grid", gap: 12, maxWidth: 320 }}
//     >
//       <h1>Forgot password</h1>
//       <input name="email" type="email" placeholder="Email" required />
//       <button disabled={loading}>
//         {loading ? "Please wait..." : "Send reset link"}
//       </button>
//     </form>
//   );
// }
