"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { AlertTriangle, LoaderCircle, LockKeyhole } from "lucide-react";

export default function DeleteAccountForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const form = new FormData(e.currentTarget);

    if (form.get("confirm") !== "DELETE") {
      setError("Type DELETE (in capitals) to confirm.");
      return;
    }

    if (
      !confirm(
        "This permanently deletes your account and all your experiences. Continue?",
      )
    ) {
      return;
    }

    setLoading(true);

    const { error } = await authClient.deleteUser({
      password: form.get("password"),
    });

    setLoading(false);

    if (error) {
      setError(error.message || "Couldn't delete the account.");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50/70 p-4">
        <AlertTriangle size={19} className="mt-0.5 shrink-0 text-bad" />
        <p className="text-sm leading-6 text-ink-soft">
          This permanently deletes your account, all your experiences (public
          and private), and the reports you filed. This action cannot be undone.
        </p>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="delete-password"
          className="text-sm font-semibold text-ink"
        >
          Confirm your password
        </label>

        <div className="relative">
          <LockKeyhole
            size={17}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft"
          />
          <input
            id="delete-password"
            name="password"
            type="password"
            placeholder="Your password"
            required
            autoComplete="current-password"
            className="field pl-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="delete-confirm"
          className="text-sm font-semibold text-ink"
        >
          Type DELETE to confirm
        </label>

        <input
          id="delete-confirm"
          name="confirm"
          placeholder="DELETE"
          required
          autoComplete="off"
          className="field"
        />
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-bad"
        >
          {error}
        </p>
      )}

      <div className="flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-5 text-ink-soft">
          You will be signed out after successful deletion.
        </p>

        <button
          type="submit"
          disabled={loading}
          className="btn min-h-11 shrink-0 border border-red-200 bg-red-50 px-5 text-sm font-semibold text-bad hover:border-red-300 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <LoaderCircle size={16} className="animate-spin" />
              Deleting...
            </>
          ) : (
            <>
              <AlertTriangle size={16} />
              Delete my account
            </>
          )}
        </button>
      </div>
    </form>
  );
}
