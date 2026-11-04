"use client";

import { useActionState } from "react";
import { Flag } from "lucide-react";
import { reportExperienceAction } from "@/app/(app)/experiences/actions";

export default function ReportForm({ id }) {
  const [state, formAction, pending] = useActionState(
    reportExperienceAction.bind(null, id),
    null,
  );

  return (
    <details className="mapit-report mt-1.5 border-t border-line pt-2">
      <summary className="flex cursor-pointer list-none items-center gap-1.5 py-1 text-[10px] font-semibold text-ink-soft transition hover:text-accent [&::-webkit-details-marker]:hidden">
        <Flag className="size-3.5 shrink-0" />
        Report experience
      </summary>

      {state?.message ? (
        <p className="mt-2 rounded-lg bg-good/5 p-2 text-[10px] leading-relaxed text-good">
          {state.message}
        </p>
      ) : (
        <form action={formAction} className="mt-2 grid gap-2">
          <select
            name="reason"
            defaultValue=""
            required
            className="w-full min-w-0 min-h-9 rounded-[10px] border border-line bg-[#fdfcf9] px-3 py-2 pr-8 text-[11px] text-ink outline-none transition-colors hover:border-accent/40 hover:bg-white focus:border-accent focus:bg-white focus:ring-2 focus:ring-accent/10"
          >
            <option value="" disabled>
              Select a reason
            </option>
            <option value="spam">Spam or advertising</option>
            <option value="offensive">Offensive or abusive</option>
            <option value="false">False or misleading</option>
            <option value="private_info">Private information</option>
            <option value="other">Something else</option>
          </select>

          <textarea
            name="details"
            maxLength={500}
            rows={2}
            placeholder="Additional details (optional)"
            className="w-full min-w-0 min-h-[58px] resize-y rounded-[10px] border border-line bg-[#fdfcf9] px-3 py-2 text-[11px] leading-relaxed text-ink outline-none transition-colors placeholder:text-ink-soft/60 hover:border-accent/40 hover:bg-white focus:border-accent focus:bg-white focus:ring-2 focus:ring-accent/10"
          />

          {state?.error && (
            <p className="text-[10px] leading-relaxed text-bad">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="btn btn-primary min-h-9 w-full rounded-lg px-3 text-[11px] shadow-sm transition-shadow hover:shadow-md"
          >
            {pending ? "Sending..." : "Submit report"}
          </button>
        </form>
      )}
    </details>
  );
}
