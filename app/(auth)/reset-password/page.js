import { Suspense } from "react";
import ResetPasswordForm from "@/components/ResetPasswordForm";

export default function Page() {
  return (
    <main style={{ padding: 40 }}>
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}
