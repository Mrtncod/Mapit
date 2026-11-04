import { Suspense } from "react";
import Link from "next/link";
import { getCategories, getMyExperiences } from "@/lib/db/experiences";
import {
  deleteExperienceAction,
  setVisibilityAction,
} from "@/app/(app)/experiences/actions";
import DeleteButton from "@/components/DeleteButton";
import ExploreMap from "@/components/map/ExploreMap";
import {
  Plus,
  MapPin,
  Eye,
  EyeOff,
  Pencil,
  CalendarDays,
  AlertTriangle,
  ArrowLeft,
  ExternalLink,
  Search,
  X,
} from "lucide-react";

const SENTIMENT = {
  good: { label: "Good", icon: "👍", color: "bg-good/10 text-good" },
  bad: { label: "Bad", icon: "👎", color: "bg-bad/10 text-bad" },
  warning: {
    label: "Warning",
    icon: "⚠️",
    color: "bg-warning/10 text-[#936313]",
  },
};

function formatDate(date) {
  return new Date(date).toLocaleDateString("de-DE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function LoadingState() {
  return (
    <div className="grid h-full place-items-center">
      <p className="text-sm text-ink-soft">Loading your experiences...</p>
    </div>
  );
}

async function MyExperiences({ rows, focusId }) {
  if (rows.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-5 py-10 text-center">
        <div className="grid size-12 place-items-center rounded-2xl bg-accent-soft text-accent">
          <MapPin size={23} />
        </div>

        <h2 className="mt-4 text-base font-bold text-ink">
          No experiences found
        </h2>

        <p className="mt-2 max-w-xs text-sm leading-6 text-ink-soft">
          Try another search term or clear your search to see all your
          experiences.
        </p>

        <Link
          href="/me"
          scroll={false}
          className="btn btn-secondary mt-5 min-h-10 px-4 text-sm"
        >
          Clear search
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-3">
      {rows.map((e) => {
        const next = e.visibility === "public" ? "private" : "public";
        const sentiment = SENTIMENT[e.sentiment] ?? SENTIMENT.good;
        const isFocused = focusId === e.id;

        return (
          <article
            key={e.id}
            id={`experience-${e.id}`}
            className={`rounded-2xl border bg-white p-3 shadow-soft transition ${
              isFocused ? "border-accent ring-2 ring-accent/15" : "border-line"
            }`}
          >
            {/* Category and visibility */}
            <div className="flex items-center justify-between gap-2">
              <span className="flex min-w-0 items-center gap-1.5 text-xs font-semibold text-[#416448]">
                <span className="text-base">{e.category_icon || "📍"}</span>
                <span className="truncate">{e.category_label}</span>
              </span>

              <span
                className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold ${
                  e.visibility === "public"
                    ? "bg-good/10 text-good"
                    : "bg-canvas text-ink-soft"
                }`}
              >
                {e.visibility === "public" ? (
                  <Eye size={11} />
                ) : (
                  <EyeOff size={11} />
                )}
                {e.visibility === "public" ? "Public" : "Private"}
              </span>
            </div>

            {/* Title and description */}
            <h2 className="mt-2 text-sm font-bold leading-snug text-ink">
              {e.title}
            </h2>

            {e.description && (
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-soft">
                {e.description}
              </p>
            )}

            {e.place_name && (
              <p className="mt-1 truncate text-xs text-ink-soft">
                <MapPin size={11} className="mr-1 inline" />
                {e.place_name}
              </p>
            )}

            {/* Sentiment and date */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-2 py-1 text-[10px] font-bold ${sentiment.color}`}
              >
                {sentiment.icon} {sentiment.label}
              </span>

              <span className="inline-flex items-center gap-1 text-[10px] text-ink-soft">
                <CalendarDays size={11} />
                {formatDate(e.created_at)}
              </span>

              {e.kind === "route" && (
                <span className="rounded-full bg-canvas px-2 py-1 text-[10px] font-semibold text-ink-soft">
                  Route
                </span>
              )}
            </div>

            {e.hidden && (
              <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-2 text-[10px] leading-4 text-amber-800">
                <AlertTriangle size={12} className="shrink-0" />
                Hidden pending moderator review
              </div>
            )}

            {/* Actions */}
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-line pt-3">
              <Link
                href={`/me?focus=${encodeURIComponent(e.id)}`}
                scroll={false}
                className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl bg-accent-soft px-2 text-xs font-semibold text-accent transition hover:bg-accent hover:text-white"
              >
                <MapPin size={13} />
                View on map
              </Link>

              <Link
                href={`/experiences/${e.id}/edit`}
                className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl border border-line px-2 text-xs font-semibold text-ink transition hover:bg-canvas"
              >
                <Pencil size={13} />
                Edit
              </Link>

              <form action={setVisibilityAction}>
                <input type="hidden" name="id" value={e.id} />
                <input type="hidden" name="visibility" value={next} />
                <button
                  type="submit"
                  className="inline-flex min-h-9 w-full items-center justify-center gap-1.5 rounded-xl border border-line px-2 text-xs font-semibold text-ink-soft transition hover:bg-canvas"
                >
                  {next === "public" ? <Eye size={13} /> : <EyeOff size={13} />}
                  Make {next}
                </button>
              </form>

              <form action={deleteExperienceAction}>
                <input type="hidden" name="id" value={e.id} />
                <div className="flex min-h-9 items-center justify-center">
                  <DeleteButton />
                </div>
              </form>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export default async function MePage({ searchParams }) {
  const [{ focus, q }, categories, rows] = await Promise.all([
    searchParams,
    getCategories(),
    getMyExperiences(),
  ]);

  const focusId = typeof focus === "string" ? focus : null;
  const query = typeof q === "string" ? q.trim() : "";
  const normalizedQuery = query.toLocaleLowerCase();

  const filteredRows = normalizedQuery
    ? rows.filter((e) =>
        [e.title, e.place_name, e.description, e.category_label].some((value) =>
          (value || "").toLocaleLowerCase().includes(normalizedQuery),
        ),
      )
    : rows;

  return (
    <main className="relative h-full min-h-0 overflow-hidden">
      {/* Existing map, reused behind the collection panel */}
      <div className="absolute inset-0">
        <ExploreMap
          categories={categories}
          initialExperiences={rows}
          focusExperienceId={focusId}
          collectionMode
        />
      </div>

      {/* Floating collection panel */}
      <section
        className={`absolute inset-x-3 bottom-3 top-[88px] z-[510] flex min-h-0 flex-col overflow-hidden rounded-2xl border border-white/80 bg-white/95 shadow-float backdrop-blur-xl sm:left-auto sm:right-4 sm:top-4 sm:bottom-4 sm:w-[390px] ${
          focusId ? "hidden sm:flex" : "flex"
        }`}
      >
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-line px-4 py-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-accent">
              <MapPin size={12} />
              Your collection
            </div>

            <h1 className="mt-0.5 text-lg font-extrabold tracking-tight text-ink">
              My experiences
            </h1>

            <p className="text-xs text-ink-soft">
              Manage your saved places and routes
            </p>
          </div>

          <Link
            href="/explore"
            className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-xl border border-line px-3 text-xs font-semibold text-ink-soft transition hover:bg-canvas"
          >
            <ArrowLeft size={14} />
            Exit
          </Link>
        </header>
        <form
          action="/me"
          method="GET"
          className="flex shrink-0 items-center gap-2 border-b border-line px-3 py-3"
        >
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-line bg-white px-3">
            <Search className="size-4 shrink-0 text-ink-soft" />

            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search your experiences..."
              className="h-10 min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-soft/70"
              aria-label="Search your experiences"
            />
          </div>

          <button
            type="submit"
            className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent text-white transition hover:opacity-90"
            aria-label="Search"
          >
            <Search size={17} />
          </button>

          {query && (
            <Link
              href="/me"
              scroll={false}
              className="grid size-10 shrink-0 place-items-center rounded-xl border border-line text-ink-soft transition hover:bg-canvas"
              aria-label="Clear search"
            >
              <X size={16} />
            </Link>
          )}
        </form>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <Suspense fallback={<LoadingState />}>
            <MyExperiences rows={filteredRows} focusId={focusId} />
          </Suspense>
        </div>

        <footer className="flex shrink-0 items-center justify-between border-t border-line bg-white/80 px-4 py-2">
          <span className="text-[10px] text-ink-soft">
            {rows.length} {rows.length === 1 ? "experience" : "experiences"}
          </span>
          <Link
            href="/explore"
            className="inline-flex items-center gap-1 text-[10px] font-semibold text-accent hover:underline"
          >
            Explore map
            <ExternalLink size={11} />
          </Link>
        </footer>
      </section>
      {focusId && (
        <Link
          href="/me"
          scroll={false}
          className="absolute left-3 top-3 z-[520] inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/80 bg-white/95 px-3 text-xs font-semibold text-ink shadow-float backdrop-blur-xl transition hover:bg-white sm:hidden"
        >
          <ArrowLeft size={15} />
          My experiences
        </Link>
      )}
    </main>
  );
}
