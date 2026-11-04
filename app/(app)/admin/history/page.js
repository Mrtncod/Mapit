import { getModerationHistory } from "@/lib/db/moderation";
import { History } from "lucide-react";

const LABELS = {
  hide: "Hidden",
  restore: "Restored",
  dismiss: "Reports dismissed",
  auto_hide: "Auto-hidden (3 reports)",
};

export default async function HistoryPage() {
  const rows = await getModerationHistory();

  return (
    <section className="space-y-5">
      <div>
        <div className="flex items-center gap-2">
          <History size={19} className="text-accent" />
          <h2 className="text-lg font-bold text-ink">Moderation history</h2>
          <span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-bold text-accent">
            {rows.length}
          </span>
        </div>
        <p className="mt-1 text-sm text-ink-soft">
          A record of moderation actions taken across the platform.
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-white/70 bg-white/85 px-5 py-12 text-center shadow-soft">
          <span className="mx-auto mb-3 grid size-12 place-items-center rounded-2xl bg-accent-soft text-accent">
            <History size={21} />
          </span>
          <h3 className="font-bold text-ink">No moderation activity yet</h3>
          <p className="mt-1 text-sm text-ink-soft">
            Actions will appear here when moderation takes place.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/70 bg-white/90 shadow-soft backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-canvas/70 text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  <th className="px-4 py-3">When</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Post</th>
                  <th className="px-4 py-3">By</th>
                  <th className="px-4 py-3">Note</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-line/70 last:border-0 hover:bg-canvas/50"
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-ink-soft">
                      {new Date(r.created_at).toLocaleString("de-DE")}
                    </td>

                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-lg bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent">
                        {LABELS[r.action] ?? r.action}
                      </span>
                    </td>

                    <td className="max-w-[240px] px-4 py-3 font-medium text-ink">
                      <span className="block truncate">{r.title_snapshot}</span>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-ink-soft">
                      {r.admin_name ?? "system"}
                    </td>

                    <td className="max-w-[220px] px-4 py-3 text-ink-soft">
                      <span className="block break-words">{r.note || "—"}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
