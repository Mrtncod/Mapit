"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const email = new FormData(e.currentTarget).get("email");
    await authClient.requestPasswordReset({
      email,
      redirectTo: "/reset-password",
    });
    setLoading(false);
    setSent(true); // same message whether or not the account exists
  }

  if (sent)
    return (
      <p>If an account exists for that address, a reset link is on its way.</p>
    );

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "grid", gap: 12, maxWidth: 320 }}
    >
      <h1>Forgot password</h1>
      <input name="email" type="email" placeholder="Email" required />
      <button disabled={loading}>
        {loading ? "Please wait..." : "Send reset link"}
      </button>
    </form>
  );
}
