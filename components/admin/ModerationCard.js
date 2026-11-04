import { moderateAction } from "@/app/(app)/admin/actions";
import { Flag, UserRound, EyeOff } from "lucide-react";

const REASON_LABELS = {
  spam: "Spam",
  offensive: "Offensive",
  false: "False/misleading",
  private_info: "Private info",
  other: "Other",
};

export default function ModerationCard({ post: r }) {
  const buttons = r.hidden
    ? [
        ["restore", "Restore", "secondary"],
        ["dismiss", "Dismiss reports", "secondary"],
      ]
    : [
        ["hide", "Hide post", "danger"],
        ["dismiss", "Dismiss reports", "secondary"],
      ];

  return (
    <li className="min-w-0 overflow-hidden rounded-2xl border border-white/70 bg-white/90 p-4 shadow-soft backdrop-blur-xl sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="break-words text-base font-bold text-ink sm:text-lg">
            {r.title}
          </h3>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-soft">
            <span className="inline-flex items-center gap-1">
              <UserRound size={14} />
              {r.author_name}
            </span>
            <span className="inline-flex items-center gap-1">
              <Flag size={14} />
              {r.report_count} report(s)
            </span>
          </div>
        </div>

        {r.hidden ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
            <EyeOff size={13} />
            Hidden
          </span>
        ) : (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">
            <Flag size={13} />
            Reported
          </span>
        )}
      </div>

      {r.hidden && (
        <p className="mt-3 rounded-xl bg-amber-50/80 px-3 py-2 text-xs text-amber-800">
          Hidden{" "}
          {r.hidden_reason === "auto_reports"
            ? "automatically after reports"
            : "by a moderator"}
          {r.hidden_at &&
            ` · ${new Date(r.hidden_at).toLocaleDateString("de-DE")}`}
        </p>
      )}

      {(r.reasons ?? []).length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold text-ink-soft">
            Report reasons
          </p>
          <div className="flex flex-wrap gap-2">
            {r.reasons.map((reason, i) => (
              <span
                key={`${reason}-${i}`}
                className="rounded-lg bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent"
              >
                {REASON_LABELS[reason] ?? reason}
              </span>
            ))}
          </div>
        </div>
      )}

      {r.details?.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-semibold text-ink-soft">
            Reporter details
          </p>
          {r.details.map((detail, i) => (
            <blockquote
              key={i}
              className="rounded-xl border-l-2 border-accent/30 bg-canvas px-3 py-2 text-sm text-ink-soft"
            >
              {detail}
            </blockquote>
          ))}
        </div>
      )}

      {r.description && (
        <div className="mt-4 rounded-xl bg-canvas/80 p-3">
          <p className="mb-1 text-xs font-semibold text-ink-soft">
            Post description
          </p>
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-ink">
            {r.description}
          </p>
        </div>
      )}

      <form action={moderateAction} className="mt-5 space-y-3">
        <input type="hidden" name="id" value={r.id} />

        <div>
          <label
            htmlFor={`note-${r.id}`}
            className="mb-1.5 block text-xs font-semibold text-ink-soft"
          >
            Moderator note
          </label>
          <input
            id={`note-${r.id}`}
            name="note"
            maxLength={500}
            placeholder="Add an optional note to the moderation log"
            className="field min-h-11 text-sm"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {buttons.map(([action, label, style]) => (
            <button
              key={action}
              type="submit"
              name="action"
              value={action}
              className={`btn min-h-10 px-4 text-sm ${
                style === "danger"
                  ? "bg-red-50 text-red-700 hover:bg-red-100"
                  : "btn-secondary"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </form>
    </li>
  );
}
