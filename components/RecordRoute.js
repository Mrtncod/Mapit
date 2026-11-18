"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  Clock3,
  Footprints,
  Mountain,
  Route,
  X,
  Play,
  Square,
  Save,
  Trash2,
  MapPin,
  RotateCcw,
} from "lucide-react";

import { useRouteRecorder } from "@/lib/useRouteRecorder";
import { formatDistance, formatDuration } from "@/lib/format";
import { createRouteAction } from "@/app/(app)/experiences/actions";
import RecordMap from "@/components/map/RecordMap";

const SENTIMENTS = [
  { value: "good", label: "Good", emoji: "👍" },
  { value: "bad", label: "Bad", emoji: "👎" },
  { value: "warning", label: "Warning", emoji: "⚠️" },
];

function Stat({ icon: Icon, label, value, className = "" }) {
  return (
    <div
      className={`min-w-0 rounded-lg border border-line/70 bg-white/75 p-2 sm:rounded-xl sm:p-3 ${className}`}
    >
      <div className="mb-0.5 flex items-center gap-1 text-ink-soft sm:mb-1 sm:gap-1.5">
        <Icon className="size-3 shrink-0 sm:size-3.5" />
        <span className="text-[9px] font-semibold uppercase tracking-wide sm:text-[10px]">
          {label}
        </span>
      </div>
      <p className="truncate text-sm font-bold tabular-nums text-ink sm:text-base">
        {value}
      </p>
    </div>
  );
}

export default function RecordRoute({ categories }) {
  const router = useRouter();
  const rec = useRouteRecorder();

  const [visibility, setVisibility] = useState("private");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const groups = categories.reduce((acc, category) => {
    (acc[category.group_label] ??= []).push(category);
    return acc;
  }, {});

  const enough = rec.points.length >= 2;
  const isRecording = rec.status === "recording";
  const isStopped = rec.status === "stopped";
  const isIdle = rec.status === "idle";

  // Keep the normal recorder card small.
  // Expand it only when the user needs to complete the save form.
  const mobilePanelHeight =
    isStopped && enough
      ? "h-[85%]"
      : isIdle && rec.recovered
        ? "h-auto max-h-[62%]"
        : "h-auto max-h-[42%]";

  function handleClose() {
    if (isRecording) {
      const confirmed = window.confirm(
        "Leave the route recorder? Your current recording will be stopped and saved locally so you can try to recover it later.",
      );

      if (!confirmed) return;
      rec.stop();
    }

    router.push("/explore");
  }

  function handleSave(e) {
    e.preventDefault();
    setError("");

    const form = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createRouteAction({
        categoryId: form.get("categoryId"),
        sentiment: form.get("sentiment"),
        title: form.get("title"),
        description: form.get("description"),
        visibility,
        path: rec.points,
        distanceM: Math.round(rec.distanceM),
        durationS: Math.round(rec.elapsed / 1000),
        elevationGainM: Math.round(rec.elevationGainM),
        startedAt: rec.startedAt,
      });

      if (result?.error) {
        setError(result.error);
        return;
      }

      rec.discard();
      rec.discard();
      router.push("/explore");
    });
  }

  return (
    <div className="relative h-full min-h-0 w-full overflow-hidden bg-canvas">
      {/* Full-screen map */}
      <div className="absolute inset-0 z-0">
        <RecordMap
          points={rec.points}
          current={rec.current}
          following={isRecording}
        />
      </div>

      {/* Floating recording panel */}
      <section
        className={`absolute inset-x-2 bottom-2 z-[500] flex ${mobilePanelHeight} min-h-0 flex-col overflow-hidden rounded-3xl border border-white/80 bg-white/95 shadow-float backdrop-blur-xl sm:inset-y-5 sm:left-5 sm:right-auto sm:h-auto sm:max-h-none sm:w-[390px] lg:left-[calc(var(--sidebar-width)+32px)] lg:right-5 lg:w-auto lg:max-w-[390px] lg:transition-[left,width] lg:duration-200`}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center gap-2 border-b border-line/60 px-3 py-2.5 sm:gap-3 sm:px-5 sm:py-3.5">
          <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent sm:size-10 sm:rounded-xl">
            <Route className="size-4 sm:size-5" />
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xs font-bold text-ink sm:text-sm">
              Record a route
            </h1>
            <p className="text-[10px] text-ink-soft sm:text-xs">
              {isRecording
                ? "Recording your journey"
                : isStopped
                  ? "Review your recorded route"
                  : "Track a new journey"}
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="grid size-8 shrink-0 place-items-center rounded-lg text-ink-soft transition hover:bg-canvas hover:text-ink sm:size-9 sm:rounded-xl"
            aria-label="Close route recorder"
            title="Back to Explore"
          >
            <X className="size-4 sm:size-5" />
          </button>
        </div>

        {/* Content: no internal scrolling on mobile */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2.5 sm:p-5">
          <div className="grid gap-2 sm:gap-4">
            {/* Recovered recording */}
            {isIdle && rec.recovered && (
              <div className="rounded-xl border border-warning/30 bg-warning/5 p-2.5 sm:rounded-2xl sm:p-3.5">
                <div className="mb-1.5 flex items-center gap-2 sm:mb-2">
                  <RotateCcw className="size-3.5 text-[#936313] sm:size-4" />
                  <p className="text-xs font-bold text-ink sm:text-sm">
                    Unfinished route found
                  </p>
                </div>

                <p className="mb-2 text-[11px] leading-relaxed text-ink-soft sm:mb-3 sm:text-xs">
                  We found a previous recording with{" "}
                  <strong className="text-ink">
                    {formatDistance(rec.recovered.dist)}
                  </strong>{" "}
                  recorded. Would you like to continue?
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={rec.continueRecovered}
                    className="flex min-h-9 items-center justify-center gap-2 rounded-lg bg-accent px-2 text-xs font-semibold text-white transition hover:opacity-90 sm:min-h-10 sm:rounded-xl sm:px-3"
                  >
                    <Play className="size-3.5" />
                    Continue
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("Discard this recovered recording?")) {
                        rec.discard();
                      }
                    }}
                    className="flex min-h-9 items-center justify-center gap-2 rounded-lg border border-line bg-white px-2 text-xs font-semibold text-ink-soft transition hover:bg-canvas sm:min-h-10 sm:rounded-xl sm:px-3"
                  >
                    <Trash2 className="size-3.5" />
                    Discard
                  </button>
                </div>
              </div>
            )}

            {/* Route statistics */}
            <div>
              <div className="mb-1.5 flex items-center justify-between sm:mb-2">
                <h2 className="text-[10px] font-bold uppercase tracking-wider text-ink-soft sm:text-xs">
                  Route statistics
                </h2>

                {isRecording && (
                  <span className="flex items-center gap-1 rounded-full bg-good/10 px-2 py-0.5 text-[9px] font-bold text-good sm:gap-1.5 sm:py-1 sm:text-[10px]">
                    <span className="size-1.5 animate-pulse rounded-full bg-good" />
                    Recording
                  </span>
                )}

                {isStopped && (
                  <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[9px] font-bold text-accent sm:py-1 sm:text-[10px]">
                    Completed
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                <Stat
                  icon={Footprints}
                  label="Distance"
                  value={formatDistance(rec.distanceM)}
                />
                <Stat
                  icon={Clock3}
                  label="Duration"
                  value={formatDuration(rec.elapsed / 1000)}
                />

                {/* Extra statistics remain visible on desktop */}
                <Stat
                  className="hidden sm:block"
                  icon={Mountain}
                  label="Elevation"
                  value={`${Math.round(rec.elevationGainM)} m`}
                />
                <Stat
                  className="hidden sm:block"
                  icon={MapPin}
                  label="GPS points"
                  value={rec.points.length.toLocaleString()}
                />
              </div>

              {rec.current && (
                <p className="mt-1.5 hidden text-[10px] text-ink-soft sm:block sm:text-[11px]">
                  GPS accuracy: ±{Math.round(rec.current.accuracy)} m
                </p>
              )}
            </div>

            {/* GPS / recorder errors */}
            {(rec.error || error) && (
              <div
                role="alert"
                className="rounded-lg border border-bad/20 bg-bad/5 p-2.5 text-[11px] leading-relaxed text-bad sm:rounded-xl sm:p-3 sm:text-xs"
              >
                {rec.error || error}
              </div>
            )}

            {/* Idle state */}
            {isIdle && !rec.recovered && (
              <div className="grid gap-2 sm:gap-3">
                <div className="rounded-lg bg-canvas/80 p-2.5 sm:rounded-xl sm:p-3">
                  <div className="mb-1 flex items-center gap-2">
                    <Activity className="size-3.5 text-accent sm:size-4" />
                    <p className="text-[11px] font-semibold text-ink sm:text-xs">
                      Ready to explore?
                    </p>
                  </div>
                  <p className="text-[11px] leading-relaxed text-ink-soft sm:text-xs">
                    Start recording to track your route using GPS. Keep this
                    page open and your screen on while recording.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={rec.start}
                  className="flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-accent px-3 text-xs font-bold text-white shadow-sm transition hover:opacity-90 active:scale-[0.99] sm:min-h-12 sm:rounded-xl sm:px-4 sm:text-sm"
                >
                  <Play className="size-3.5 fill-current sm:size-4" />
                  Start recording
                </button>
              </div>
            )}

            {/* Recording state */}
            {isRecording && (
              <div className="grid gap-2 sm:gap-3">
                <div className="rounded-lg border border-good/20 bg-good/5 p-2.5 sm:rounded-xl sm:p-3">
                  <p className="text-[11px] font-semibold text-ink sm:text-xs">
                    Your route is being recorded
                  </p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-ink-soft sm:mt-1 sm:text-xs">
                    Keep this tab open and the screen on. GPS tracking may pause
                    if your browser runs in the background.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={rec.stop}
                  className="flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-bad px-3 text-xs font-bold text-white shadow-sm transition hover:opacity-90 active:scale-[0.99] sm:min-h-12 sm:rounded-xl sm:px-4 sm:text-sm"
                >
                  <Square className="size-3.5 fill-current sm:size-4" />
                  Stop recording
                </button>
              </div>
            )}

            {/* Stopped, but not enough points */}
            {isStopped && !enough && (
              <div className="grid gap-2 sm:gap-3">
                <div className="rounded-lg border border-warning/30 bg-warning/5 p-2.5 sm:rounded-xl sm:p-3">
                  <p className="text-[11px] font-semibold text-ink sm:text-xs">
                    Not enough movement recorded
                  </p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-ink-soft sm:mt-1 sm:text-xs">
                    At least two GPS points are needed to save a route. You can
                    discard this recording and try again.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Discard this recording?")) {
                      rec.discard();
                    }
                  }}
                  className="flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-line bg-white px-3 text-xs font-semibold text-ink-soft transition hover:bg-canvas sm:min-h-11 sm:rounded-xl sm:px-4 sm:text-sm"
                >
                  <Trash2 className="size-3.5 sm:size-4" />
                  Discard recording
                </button>
              </div>
            )}

            {/* Save route form */}
            {isStopped && enough && (
              <form onSubmit={handleSave} className="grid gap-2 sm:gap-4">
                <div className="border-t border-line pt-2 sm:pt-4">
                  <h2 className="text-xs font-bold text-ink sm:text-sm">
                    Save your experience
                  </h2>
                  <p className="mt-0.5 text-[10px] text-ink-soft sm:mt-1 sm:text-xs">
                    Add some details before sharing your route.
                  </p>
                </div>

                {/* Activity */}
                <label className="grid gap-1 text-[11px] font-semibold text-ink sm:gap-1.5 sm:text-xs">
                  Activity
                  <select
                    name="categoryId"
                    defaultValue=""
                    required
                    className="h-8 w-full rounded-lg border border-line bg-white px-2.5 text-xs font-normal text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 sm:h-11 sm:rounded-xl sm:px-3 sm:text-sm"
                  >
                    <option value="" disabled>
                      Choose an activity...
                    </option>

                    {Object.entries(groups).map(([group, items]) => (
                      <optgroup key={group} label={group}>
                        {items.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.icon} {category.label}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </label>

                {/* Sentiment */}
                <fieldset className="grid gap-1 sm:gap-2">
                  <legend className="text-[11px] font-semibold text-ink sm:text-xs">
                    How was this experience?
                  </legend>

                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                    {SENTIMENTS.map((sentiment) => (
                      <label
                        key={sentiment.value}
                        className="flex min-h-8 cursor-pointer items-center justify-center gap-1 rounded-lg border border-line bg-white px-1.5 text-[10px] font-medium text-ink-soft transition has-[:checked]:border-accent has-[:checked]:bg-accent-soft has-[:checked]:text-accent sm:min-h-10 sm:rounded-xl sm:px-2 sm:text-xs"
                      >
                        <input
                          type="radio"
                          name="sentiment"
                          value={sentiment.value}
                          defaultChecked={sentiment.value === "good"}
                          className="sr-only"
                        />
                        <span>{sentiment.emoji}</span>
                        <span>{sentiment.label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                {/* Title */}
                <label className="grid gap-1 text-[11px] font-semibold text-ink sm:gap-1.5 sm:text-xs">
                  Title
                  <input
                    name="title"
                    maxLength={120}
                    required
                    placeholder="Give your route a title"
                    className="h-8 w-full rounded-lg border border-line bg-white px-2.5 text-xs font-normal text-ink outline-none transition placeholder:text-ink-soft/60 focus:border-accent focus:ring-2 focus:ring-accent/20 sm:h-11 sm:rounded-xl sm:px-3 sm:text-sm"
                  />
                </label>

                {/* Description */}
                <label className="grid gap-1 text-[11px] font-semibold text-ink sm:gap-1.5 sm:text-xs">
                  Your experience
                  <textarea
                    name="description"
                    maxLength={2000}
                    rows={2}
                    required
                    placeholder="Tell others about your journey..."
                    className="h-12 w-full resize-none rounded-lg border border-line bg-white px-2.5 py-1.5 text-xs font-normal text-ink outline-none transition placeholder:text-ink-soft/60 focus:border-accent focus:ring-2 focus:ring-accent/20 sm:h-auto sm:resize-y sm:rounded-xl sm:px-3 sm:py-2.5 sm:text-sm"
                  />
                </label>

                {/* Visibility */}
                <fieldset className="grid gap-1 sm:gap-2">
                  <legend className="text-[11px] font-semibold text-ink sm:text-xs">
                    Who can see this?
                  </legend>

                  <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                    <label className="relative block cursor-pointer">
                      <input
                        type="radio"
                        name="visibility"
                        value="private"
                        checked={visibility === "private"}
                        onChange={() => setVisibility("private")}
                        className="peer absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                      />

                      <span
                        className={`flex min-h-8 items-center justify-center gap-1.5 rounded-lg border px-2 text-[11px] font-semibold transition sm:min-h-11 sm:gap-2 sm:rounded-xl sm:px-3 sm:text-xs ${
                          visibility === "private"
                            ? "border-accent bg-accent-soft text-accent"
                            : "border-line bg-white text-ink-soft"
                        } peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent`}
                      >
                        🔒 Private
                      </span>
                    </label>

                    <label className="relative block cursor-pointer">
                      <input
                        type="radio"
                        name="visibility"
                        value="public"
                        checked={visibility === "public"}
                        onChange={() => setVisibility("public")}
                        className="peer absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                      />

                      <span
                        className={`flex min-h-8 items-center justify-center gap-1.5 rounded-lg border px-2 text-[11px] font-semibold transition sm:min-h-11 sm:gap-2 sm:rounded-xl sm:px-3 sm:text-xs ${
                          visibility === "public"
                            ? "border-accent bg-accent-soft text-accent"
                            : "border-line bg-white text-ink-soft"
                        } peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent`}
                      >
                        🌍 Public
                      </span>
                    </label>
                  </div>

                  {visibility === "public" && (
                    <p className="rounded-lg border border-warning/30 bg-warning/5 p-2 text-[10px] leading-relaxed text-[#936313] sm:rounded-xl sm:p-3 sm:text-xs">
                      Public routes show their exact start and end points. If
                      you started at home or another private place, choose
                      Private.
                    </p>
                  )}
                </fieldset>

                {error && (
                  <p role="alert" className="text-xs text-bad">
                    {error}
                  </p>
                )}

                {/* Save and discard */}
                <div className="grid grid-cols-2 gap-1.5 border-t border-line pt-2 sm:gap-2 sm:pt-4">
                  <button
                    type="submit"
                    disabled={pending}
                    className="flex min-h-9 items-center justify-center gap-1.5 rounded-lg bg-accent px-2 text-xs font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-11 sm:gap-2 sm:rounded-xl sm:px-3 sm:text-sm"
                  >
                    <Save className="size-3.5 sm:size-4" />
                    {pending ? "Saving..." : "Save route"}
                  </button>

                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => {
                      if (window.confirm("Discard this recording?")) {
                        rec.discard();
                      }
                    }}
                    className="flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-line bg-white px-2 text-xs font-semibold text-ink-soft transition hover:bg-canvas disabled:opacity-50 sm:min-h-11 sm:gap-2 sm:rounded-xl sm:px-3 sm:text-sm"
                  >
                    <Trash2 className="size-3.5 sm:size-4" />
                    Discard
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
