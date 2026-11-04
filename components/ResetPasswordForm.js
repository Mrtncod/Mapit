"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function ResetPasswordForm() {
  const router = useRouter();
  const token = useSearchParams().get("token");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!token) return <p>This reset link is invalid or has expired.</p>;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const newPassword = new FormData(e.currentTarget).get("password");
    const { error } = await authClient.resetPassword({ newPassword, token });
    setLoading(false);
    if (error)
      return setError(error.message || "This link is invalid or has expired.");
    router.push("/login");
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "grid", gap: 12, maxWidth: 320 }}
    >
      <h1>Choose a new password</h1>
      <input
        name="password"
        type="password"
        placeholder="New password (min 8 characters)"
        minLength={8}
        required
      />
      {error && <p style={{ color: "crimson" }}>{error}</p>}
      <button disabled={loading}>
        {loading ? "Please wait..." : "Save password"}
      </button>
    </form>
  );
}
