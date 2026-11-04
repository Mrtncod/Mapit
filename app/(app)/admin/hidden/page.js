import { getHiddenPosts } from "@/lib/db/moderation";
import ModerationCard from "@/components/admin/ModerationCard";
import { EyeOff } from "lucide-react";

export default async function HiddenPage() {
  const rows = await getHiddenPosts();

  return (
    <section className="space-y-5">
      <div>
        <div className="flex items-center gap-2">
          <EyeOff size={19} className="text-accent" />
          <h2 className="text-lg font-bold text-ink">Hidden posts</h2>
          <span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-bold text-accent">
            {rows.length}
          </span>
        </div>
        <p className="mt-1 text-sm text-ink-soft">
          Review hidden experiences and restore posts when appropriate.
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-white/70 bg-white/85 px-5 py-12 text-center shadow-soft">
          <span className="mx-auto mb-3 grid size-12 place-items-center rounded-2xl bg-green-50 text-green-600">
            <EyeOff size={21} />
          </span>
          <h3 className="font-bold text-ink">Nothing is hidden</h3>
          <p className="mt-1 text-sm text-ink-soft">
            All experiences are currently visible.
          </p>
        </div>
      ) : (
        <ul className="grid min-w-0 gap-4">
          {rows.map((r) => (
            <ModerationCard key={r.id} post={r} />
          ))}
        </ul>
      )}
    </section>
  );
}
