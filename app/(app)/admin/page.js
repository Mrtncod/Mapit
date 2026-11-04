import { getAdminStats } from "@/lib/db/moderation";
import {
  Users,
  UserRound,
  MapPin,
  Route,
  Globe,
  ThumbsUp,
  Flag,
  EyeOff,
  TrendingUp,
  BarChart3,
} from "lucide-react";

function Stat({ label, value, hint, icon: Icon }) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/70 bg-white/85 p-4 shadow-soft backdrop-blur-xl sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink-soft">{label}</p>
          <p className="mt-2 break-words text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            {value}
          </p>
        </div>

        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
          <Icon size={19} />
        </span>
      </div>

      {hint && <p className="mt-2 text-xs text-ink-soft">{hint}</p>}
    </div>
  );
}

export default async function AdminDashboard() {
  const { totals: t, categories, daily } = await getAdminStats();
  const max = Math.max(1, ...daily.map((d) => d.count));

  return (
    <div className="space-y-6">
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-ink">Platform overview</h2>
          <p className="text-sm text-ink-soft">
            A snapshot of activity across Mapit.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Stat
            label="Users"
            value={t.users}
            hint={`${t.users_verified} verified · +${t.users_7d} this week`}
            icon={Users}
          />
          <Stat
            label="Active authors"
            value={t.active_authors}
            hint="Users with at least one post"
            icon={UserRound}
          />
          <Stat
            label="Experiences"
            value={t.experiences}
            hint={`+${t.experiences_7d} this week`}
            icon={MapPin}
          />
          <Stat
            label="Spots / Routes"
            value={`${t.spots} / ${t.routes}`}
            hint="Experience types"
            icon={Route}
          />
          <Stat
            label="Public / Private"
            value={`${t.public_count} / ${t.private_count}`}
            hint="Visibility breakdown"
            icon={Globe}
          />
          <Stat
            label="Positive / Negative / Warning"
            value={`${t.good} / ${t.bad} / ${t.warning}`}
            hint="Community sentiment"
            icon={ThumbsUp}
          />
          <Stat
            label="Open reports"
            value={t.open_reports}
            hint={`Across ${t.reported_posts} post(s)`}
            icon={Flag}
          />
          <Stat
            label="Hidden posts"
            value={t.hidden}
            hint="Currently hidden"
            icon={EyeOff}
          />
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div className="min-w-0 rounded-2xl border border-white/70 bg-white/85 p-4 shadow-soft backdrop-blur-xl sm:p-5">
          <div className="mb-5 flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-accent-soft text-accent">
              <TrendingUp size={19} />
            </span>
            <div>
              <h2 className="font-bold text-ink">New experiences</h2>
              <p className="text-xs text-ink-soft">Last 14 days</p>
            </div>
          </div>

          <div className="space-y-3">
            {daily.map((d) => (
              <div
                key={d.label}
                className="grid grid-cols-[42px_minmax(0,1fr)_24px] items-center gap-3"
              >
                <span className="text-xs text-ink-soft">{d.label}</span>

                <div className="h-2.5 overflow-hidden rounded-full bg-canvas">
                  <div
                    className="h-full rounded-full bg-accent transition-all"
                    style={{
                      width: `${(d.count / max) * 100}%`,
                      minWidth: d.count ? 4 : 0,
                    }}
                  />
                </div>

                <span className="text-right text-xs font-semibold tabular-nums text-ink">
                  {d.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="min-w-0 rounded-2xl border border-white/70 bg-white/85 p-4 shadow-soft backdrop-blur-xl sm:p-5">
          <div className="mb-5 flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-accent-soft text-accent">
              <BarChart3 size={19} />
            </span>
            <div>
              <h2 className="font-bold text-ink">Top categories</h2>
              <p className="text-xs text-ink-soft">
                Most-used experience types
              </p>
            </div>
          </div>

          {categories.length === 0 ? (
            <p className="rounded-xl bg-canvas p-4 text-sm text-ink-soft">
              No category data yet.
            </p>
          ) : (
            <div className="space-y-3">
              {categories.map((c) => (
                <div
                  key={c.label}
                  className="flex items-center justify-between gap-3 rounded-xl bg-canvas/80 px-3 py-2.5"
                >
                  <span className="min-w-0 truncate text-sm font-medium text-ink">
                    {c.icon} {c.label}
                  </span>
                  <span className="shrink-0 rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-ink">
                    {c.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
