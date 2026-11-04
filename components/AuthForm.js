"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export default function AuthForm({ mode }) {
  const router = useRouter();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState("");

  const isSignup = mode === "signup";

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const email = form.get("email");
    const password = form.get("password");

    try {
      const result = isSignup
        ? await authClient.signUp.email({
            name: form.get("name"),
            email,
            password,
            callbackURL: "/explore",
          })
        : await authClient.signIn.email({
            email,
            password,
          });

      if (result.error) {
        setError(
          result.error.status === 403
            ? "Please verify your email first. We just sent you a new link."
            : result.error.message || "Something went wrong.",
        );
        return;
      }

      if (isSignup) {
        setSentTo(email);
        return;
      }

      router.push("/explore");
      router.refresh();
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-dvh flex-col bg-canvas px-5 py-5 sm:h-dvh sm:min-h-0 sm:overflow-hidden sm:px-8 sm:py-4">
      {/* Header */}
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-1">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="grid size-10 place-items-center rounded-xl bg-accent text-lg text-white shadow-sm">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="size-5"
              aria-hidden="true"
            >
              <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
          </span>

          <span className="text-[22px] font-extrabold tracking-tight text-ink">
            mapit<span className="text-accent">.</span>
          </span>
        </Link>

        <Link
          href="/"
          className="inline-flex min-h-10 items-center gap-2 rounded-full border border-line bg-white px-5 py-2 text-sm font-semibold text-ink shadow-sm transition hover:border-accent/30 hover:bg-accent-soft hover:text-accent"
        >
          <span aria-hidden="true">←</span>
          Back to home
        </Link>
      </header>

      {/* Form area */}
      <section className="flex flex-1 items-center justify-center py-8 sm:min-h-0 sm:py-3">
        <div className="w-full max-w-[460px]">
          {sentTo ? (
            /* Email confirmation */
            <div className="rounded-[28px] border border-line bg-surface p-7 shadow-soft sm:p-10">
              <div className="mb-7 grid size-14 place-items-center rounded-2xl bg-green-100 text-2xl text-green-700">
                ✓
              </div>

              <p className="mb-3 text-sm font-bold text-accent">
                ONE LAST STEP
              </p>

              <h1 className="text-3xl font-extrabold tracking-tight text-ink">
                Check your email
              </h1>

              <p className="mt-4 leading-7 text-ink-soft">
                We sent a confirmation link to{" "}
                <strong className="break-all text-ink">{sentTo}</strong>. Click
                the link to activate your account and start exploring.
              </p>

              <Link href="/login" className="btn btn-primary mt-8 w-full">
                Go to log in
                <span aria-hidden="true">→</span>
              </Link>

              <p className="mt-6 text-center text-sm text-ink-soft">
                Didn`&apos;`t receive the email? Check your spam folder.
              </p>
            </div>
          ) : (
            /* Login / Signup */
            <div className="rounded-[28px] border border-line bg-surface p-7 shadow-soft sm:p-10">
              <div className="mb-8">
                {/* <div className="mb-5 grid size-12 place-items-center rounded-2xl bg-accent-soft text-accent">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="size-6"
                    aria-hidden="true"
                  >
                    <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
                    <circle cx="12" cy="10" r="2.5" />
                  </svg>
                </div> */}

                <p className="mb-2 text-sm font-bold text-accent">
                  {isSignup ? "JOIN THE COMMUNITY" : "WELCOME BACK"}
                </p>

                <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-[34px]">
                  {isSignup ? "Create your account" : "Good to see you again."}
                </h1>

                <p className="mt-3 leading-7 text-ink-soft">
                  {isSignup
                    ? "Start discovering places through real experiences. Your map starts here."
                    : "Log in to explore experiences, discover places and share your own."}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="grid gap-5">
                {isSignup && (
                  <div className="grid gap-2">
                    <label
                      htmlFor="name"
                      className="text-sm font-semibold text-ink"
                    >
                      Your name
                    </label>

                    <input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Enter your name"
                      autoComplete="name"
                      className="field"
                      required
                    />
                  </div>
                )}

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
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="field"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <label
                      htmlFor="password"
                      className="text-sm font-semibold text-ink"
                    >
                      Password
                    </label>

                    {!isSignup && (
                      <Link
                        href="/forgot-password"
                        className="text-xs font-semibold text-accent transition hover:text-accent-dark"
                      >
                        Forgot password?
                      </Link>
                    )}
                  </div>

                  <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder={
                      isSignup ? "At least 8 characters" : "Enter your password"
                    }
                    minLength={isSignup ? 8 : undefined}
                    autoComplete={
                      isSignup ? "new-password" : "current-password"
                    }
                    className="field"
                    required
                  />

                  {isSignup && (
                    <p className="text-xs text-ink-soft">
                      Use at least 8 characters.
                    </p>
                  )}
                </div>

                {error && (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
                  >
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary mt-1 w-full"
                >
                  {loading
                    ? "Please wait..."
                    : isSignup
                      ? "Create account"
                      : "Log in"}
                  {!loading && <span aria-hidden="true">→</span>}
                </button>
              </form>

              <div className="mt-8 border-t border-line pt-6 text-center">
                <p className="text-sm text-ink-soft">
                  {isSignup
                    ? "Already have an account?"
                    : "Don't have an account yet?"}{" "}
                  <Link
                    href={isSignup ? "/login" : "/signup"}
                    className="font-bold text-accent transition hover:text-accent-dark"
                  >
                    {isSignup ? "Log in" : "Sign up"}
                  </Link>
                </p>
              </div>
            </div>
          )}

          <p className="mt-7 text-center text-xs text-ink-soft">
            Explore places. Share experiences. Help others discover more.
          </p>
        </div>
      </section>

      <footer className="py-2 text-center text-xs text-ink-soft">
        © {new Date().getFullYear()} Mapit. Explore with confidence.
      </footer>
    </main>
  );
}
