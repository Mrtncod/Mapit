import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Footprints,
  MapPin,
  Mountain,
  Pencil,
  Route,
  Trash2,
} from "lucide-react";

import { getExperience } from "@/lib/db/experiences";
import { getSession } from "@/lib/session";
import { deleteExperienceAction } from "@/app/(app)/experiences/actions";
import { formatDistance, formatDuration } from "@/lib/format";

import DeleteButton from "@/components/DeleteButton";
import ReportForm from "@/components/ReportForm";
import RecordMap from "@/components/map/RecordMap";
import AppLoading from "@/components/AppLoading";

const SENTIMENT = {
  good: { label: "Good experience", emoji: "👍" },
  bad: { label: "Bad experience", emoji: "👎" },
  warning: { label: "Warning", emoji: "⚠️" },
};

async function Detail({ params }) {
  const { id } = await params;
  const [e, session] = await Promise.all([getExperience(id), getSession()]);

  if (!e) notFound();

  const isOwner = session?.user.id === e.user_id;
  const sentiment = SENTIMENT[e.sentiment];

  // Database path is GeoJSON: { type: "LineString", coordinates: [...] }
  const routePoints =
    e.kind === "route" && e.path?.type === "LineString"
      ? e.path.coordinates
      : [];

  const mapPoint = {
    lat: Number(e.lat),
    lng: Number(e.lng),
  };

  const createdDate = new Date(e.created_at).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="relative h-full min-h-0 w-full overflow-y-auto bg-canvas">
      <div className="mx-auto w-full max-w-4xl space-y-4 px-3 py-4 sm:space-y-6 sm:px-6 sm:py-7">
        {/* Back navigation */}
        <Link
          href="/explore"
          className="inline-flex items-center gap-2 text-sm font-semibold text-ink-soft transition hover:text-accent"
        >
          <ArrowLeft className="size-4" />
          Back to Explore
        </Link>

        {/* Main heading */}
        <section className="rounded-2xl border border-line/70 bg-white p-4 shadow-soft sm:rounded-3xl sm:p-6">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
              {e.kind === "route" ? "Recorded route" : "Place experience"}
            </span>

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                e.visibility === "public"
                  ? "bg-good/10 text-good"
                  : "bg-canvas text-ink-soft"
              }`}
            >
              {e.visibility === "public" ? "🌍 Public" : "🔒 Private"}
            </span>
          </div>

          <h1 className="text-xl font-bold tracking-tight text-ink sm:text-3xl">
            {e.category_icon} {e.title}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-ink-soft sm:text-sm">
            <span>
              {sentiment?.emoji} {sentiment?.label}
            </span>
            <span>·</span>
            <span>{e.category_label}</span>
            <span>·</span>
            <span>by {e.author_name}</span>
          </div>

          <div className="mt-3 flex items-center gap-1.5 text-xs text-ink-soft">
            <CalendarDays className="size-3.5" />
            {createdDate}
          </div>

          {isOwner && (
            <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-4">
              <Link
                href={`/experiences/${e.id}/edit`}
                className="btn btn-secondary inline-flex items-center gap-2"
              >
                <Pencil className="size-4" />
                Edit
              </Link>

              <form action={deleteExperienceAction}>
                <input type="hidden" name="id" value={e.id} />
                <DeleteButton />
              </form>
            </div>
          )}
        </section>

        {/* Route statistics */}
        {e.kind === "route" && (
          <section className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
            <Stat
              icon={Footprints}
              label="Distance"
              value={formatDistance(e.distance_m)}
            />
            <Stat
              icon={Clock3}
              label="Duration"
              value={formatDuration(e.duration_s)}
            />
            <Stat
              icon={Mountain}
              label="Elevation gain"
              value={`${Math.round(e.elevation_gain_m ?? 0)} m`}
            />
          </section>
        )}

        {/* Map */}
        <section className="overflow-hidden rounded-2xl border border-line/70 bg-white shadow-soft sm:rounded-3xl">
          <div className="flex items-center gap-2 border-b border-line/70 px-4 py-3">
            {e.kind === "route" ? (
              <Route className="size-4 text-accent" />
            ) : (
              <MapPin className="size-4 text-accent" />
            )}
            <h2 className="text-sm font-bold text-ink">
              {e.kind === "route" ? "Recorded route" : "Location"}
            </h2>
          </div>

          <div className="h-[280px] w-full sm:h-[420px]">
            {e.kind === "route" && routePoints.length > 1 ? (
              <RecordMap points={routePoints} interactive />
            ) : (
              <DetailLocationMap point={mapPoint} />
            )}
          </div>
        </section>

        {/* Description */}
        <section className="rounded-2xl border border-line/70 bg-white p-4 shadow-soft sm:rounded-3xl sm:p-6">
          <h2 className="mb-3 text-sm font-bold text-ink sm:text-base">
            About this experience
          </h2>

          <p className="whitespace-pre-wrap text-sm leading-7 text-ink-soft">
            {e.description}
          </p>

          {e.place_name && (
            <div className="mt-4 flex items-center gap-2 border-t border-line pt-4 text-sm text-ink-soft">
              <MapPin className="size-4 text-accent" />
              {e.place_name}
            </div>
          )}
        </section>

        {/* Report */}
        {!isOwner && session && (
          <section className="rounded-2xl border border-line/70 bg-white p-4 shadow-soft sm:rounded-3xl sm:p-6">
            <h2 className="mb-3 text-sm font-bold text-ink">
              Report this experience
            </h2>
            <ReportForm id={e.id} />
          </section>
        )}
      </div>
    </main>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="min-w-0 rounded-xl border border-line/70 bg-white p-3 shadow-soft sm:rounded-2xl sm:p-4">
      <div className="mb-2 flex items-center gap-2 text-ink-soft">
        <Icon className="size-4 shrink-0" />
        <span className="text-[10px] font-semibold uppercase tracking-wide sm:text-xs">
          {label}
        </span>
      </div>
      <p className="truncate text-lg font-bold tabular-nums text-ink sm:text-2xl">
        {value}
      </p>
    </div>
  );
}

function DetailLocationMap({ point }) {
  return (
    <div className="h-full w-full">
      <RecordMap points={[[point.lng, point.lat]]} interactive />
    </div>
  );
}

export default function ExperiencePage({ params }) {
  return (
    <Suspense fallback={<AppLoading message="Loading experience..." />}>
      <Detail params={params} />
    </Suspense>
  );
}
