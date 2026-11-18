"use client";

import { useActionState, useState } from "react";
import { createSpotAction } from "@/app/(app)/experiences/actions";
import { useGeolocation } from "@/lib/useGeolocation";
import LocationPicker from "@/components/map/LocationPicker";
import { useRouter } from "next/navigation";
import { MapPin, LocateFixed, Check, LoaderCircle, X } from "lucide-react";

const SENTIMENTS = [
  { value: "good", label: "Good", icon: "👍" },
  { value: "bad", label: "Bad", icon: "👎" },
  { value: "warning", label: "Warning", icon: "⚠️" },
];

export default function NewSpotForm({ categories }) {
  const [state, formAction, pending] = useActionState(createSpotAction, null);
  const v = state?.values ?? {};

  const geo = useGeolocation();
  const [manualPin, setManualPin] = useState(null);
  const [trigger, setTrigger] = useState(0);

  const pin = manualPin ?? geo.position;
  const accuracy = manualPin ? null : (geo.position?.accuracy ?? null);
  const router = useRouter();

  const groups = categories.reduce((acc, c) => {
    (acc[c.group_label] ??= []).push(c);
    return acc;
  }, {});

  const locationMessage = pin
    ? accuracy != null
      ? `GPS accuracy ±${Math.round(accuracy)} m`
      : "Manual location selected"
    : geo.status === "denied"
      ? "Location access blocked"
      : geo.status === "unsupported"
        ? "Location unavailable"
        : geo.status === "error"
          ? "Couldn't get your location"
          : "Finding your location...";

  return (
    <div className="relative h-full min-h-0 w-full overflow-hidden bg-canvas">
      {/* Full-screen map */}
      <div className="absolute inset-0 z-0">
        <LocationPicker
          pin={pin}
          accuracy={accuracy}
          trigger={trigger}
          onPick={(lat, lng) => setManualPin({ lat, lng })}
        />
      </div>

      {/* Floating form */}
      <form
        action={formAction}
        className="
    absolute z-[500] flex flex-col overflow-hidden
    border border-white/80 bg-white/95 shadow-float
    backdrop-blur-xl
    inset-x-3 bottom-3 h-[60%] max-h-[560px] rounded-3xl
    sm:inset-y-5 sm:left-5 sm:right-auto
    sm:h-auto sm:max-h-none sm:w-[390px]
    lg:left-[calc(var(--sidebar-width)+32px)]
    lg:right-5 lg:w-auto lg:max-w-[390px]
    lg:transition-[left] lg:duration-200
  "
      >
        {/* Header */}
        <div className="shrink-0 border-b border-line px-4 py-3 sm:px-5 sm:py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-accent">
                New spot
              </p>
              <h1 className="mt-0.5 text-base font-bold tracking-tight text-ink sm:text-lg">
                Add experience
              </h1>
            </div>

            <button
              type="button"
              onClick={() => router.push("/explore")}
              aria-label="Close and return to Explore"
              className="grid size-9 shrink-0 place-items-center rounded-xl text-ink-soft transition hover:bg-canvas hover:text-ink"
            >
              <X size={19} />
            </button>
          </div>
        </div>

        {/* Scrollable fields */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3.5 sm:px-5 sm:py-4">
          <div className="space-y-3.5">
            {/* Location */}
            <section className="flex items-center justify-between gap-2 rounded-xl bg-canvas px-3 py-2.5">
              <div className="flex min-w-0 items-center gap-2">
                {pin ? (
                  <Check size={16} className="shrink-0 text-good" />
                ) : (
                  <LoaderCircle
                    size={16}
                    className={`shrink-0 text-ink-soft ${
                      geo.status === "locating" ? "animate-spin" : ""
                    }`}
                  />
                )}

                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-ink">
                    {locationMessage}
                  </p>
                  <p className="text-[10px] text-ink-soft">
                    Tap map or move the pin
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={!geo.position}
                onClick={() => {
                  setManualPin(null);
                  setTrigger((n) => n + 1);
                }}
                className="flex shrink-0 items-center gap-1 rounded-lg px-2 py-2 text-xs font-semibold text-accent transition hover:bg-accent-soft disabled:opacity-40"
              >
                <LocateFixed size={14} />
                GPS
              </button>
            </section>

            <input
              type="hidden"
              name="lat"
              value={pin ? pin.lat.toFixed(6) : ""}
            />
            <input
              type="hidden"
              name="lng"
              value={pin ? pin.lng.toFixed(6) : ""}
            />
            <input
              type="hidden"
              name="accuracyM"
              value={accuracy != null ? Math.round(accuracy) : ""}
            />

            {/* Category */}
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-ink">
                Category
              </span>

              <select
                name="categoryId"
                defaultValue={v.categoryId ?? ""}
                required
                className="field min-h-10 rounded-xl py-2 text-sm"
              >
                <option value="" disabled>
                  Choose a category...
                </option>

                {Object.entries(groups).map(([group, items]) => (
                  <optgroup key={group} label={group}>
                    {items.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {c.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>

            {/* Sentiment */}
            <fieldset>
              <legend className="mb-1.5 text-xs font-semibold text-ink">
                Your experience
              </legend>

              <div className="grid grid-cols-3 gap-2">
                {SENTIMENTS.map((s) => (
                  <label key={s.value} className="cursor-pointer">
                    <input
                      type="radio"
                      name="sentiment"
                      value={s.value}
                      defaultChecked={(v.sentiment ?? "good") === s.value}
                      className="peer sr-only"
                    />

                    <span className="flex min-h-10 items-center justify-center gap-1 rounded-xl border border-line bg-white px-2 text-xs font-medium text-ink-soft transition peer-checked:border-accent peer-checked:bg-accent-soft peer-checked:text-accent">
                      <span>{s.icon}</span>
                      {s.label}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            {/* Title */}
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-ink">
                Title
              </span>

              <input
                name="title"
                defaultValue={v.title ?? ""}
                maxLength={120}
                required
                placeholder="Give your experience a title"
                className="field min-h-10 rounded-xl py-2 text-sm"
              />
            </label>

            {/* Place name */}
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-ink">
                Place name
                <span className="ml-1 font-normal text-ink-soft">
                  · Optional
                </span>
              </span>

              <input
                name="placeName"
                defaultValue={v.placeName ?? ""}
                maxLength={120}
                placeholder="Name of the location"
                className="field min-h-10 rounded-xl py-2 text-sm"
              />
            </label>

            {/* Description */}
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-ink">
                Description
              </span>

              <textarea
                name="description"
                defaultValue={v.description ?? ""}
                maxLength={2000}
                rows={3}
                required
                placeholder="Share what makes this place special..."
                className="field min-h-[76px] resize-y rounded-xl py-2.5 text-sm"
              />
            </label>

            {/* Visibility */}
            <fieldset>
              <legend className="mb-1.5 text-xs font-semibold text-ink">
                Who can see this?
              </legend>

              <div className="grid grid-cols-2 gap-2">
                <label className="relative block cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    value="private"
                    defaultChecked={(v.visibility ?? "private") === "private"}
                    className="peer absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                  />

                  <span className="flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-line bg-white px-2 text-xs font-medium text-ink-soft transition peer-checked:border-accent peer-checked:bg-accent-soft peer-checked:text-accent peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent">
                    🔒 Private
                  </span>
                </label>

                <label className="relative block cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    value="public"
                    defaultChecked={v.visibility === "public"}
                    className="peer absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                  />

                  <span className="flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-line bg-white px-2 text-xs font-medium text-ink-soft transition peer-checked:border-accent peer-checked:bg-accent-soft peer-checked:text-accent peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent">
                    🌍 Public
                  </span>
                </label>
              </div>
            </fieldset>

            {state?.error && (
              <p className="rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-bad">
                {state.error}
              </p>
            )}
          </div>
        </div>

        {/* Persistent action */}
        <div className="shrink-0 border-t border-line bg-white px-4 py-3 sm:px-5">
          <button
            type="submit"
            disabled={!pin || pending}
            className="btn btn-primary w-full min-h-11"
          >
            {pending ? "Saving..." : "Save experience"}
          </button>
        </div>
      </form>
    </div>
  );
}
