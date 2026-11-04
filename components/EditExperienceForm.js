"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowLeft, LoaderCircle, Save } from "lucide-react";

const SENTIMENTS = [
  { value: "good", label: "Good", icon: "👍" },
  { value: "bad", label: "Bad", icon: "👎" },
  { value: "warning", label: "Warning", icon: "⚠️" },
];

export default function EditExperienceForm({
  experience: e,
  categories,
  action,
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const v = state?.values ?? {};

  const groups = categories.reduce((acc, c) => {
    (acc[c.group_label] ??= []).push(c);
    return acc;
  }, {});

  const catId = String(v.categoryId ?? e.category_id ?? "");
  const sentiment = v.sentiment ?? e.sentiment;
  const visibility = v.visibility ?? e.visibility;

  return (
    <form
      action={formAction}
      className="
    absolute inset-x-3 bottom-3 top-[88px] z-[510]
    flex min-h-0 flex-col overflow-hidden
    rounded-2xl border border-white/80
    bg-white/95 shadow-float backdrop-blur-xl

    sm:left-auto sm:right-4 sm:top-4 sm:bottom-4
    sm:w-[390px]
  "
    >
      {/* Form heading */}
      <div className="shrink-0 border-b border-line px-4 py-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-accent">
          Experience details
        </p>

        <h2 className="mt-1 text-lg font-bold tracking-tight text-ink">
          Update your experience
        </h2>

        <p className="mt-1 text-xs leading-5 text-ink-soft">
          Make changes to your saved experience.
        </p>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {/* Category */}
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-ink">
            Category
          </span>

          <select
            name="categoryId"
            defaultValue={catId}
            required
            className="field min-h-10 rounded-xl py-2 text-sm"
          >
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
                  defaultChecked={sentiment === s.value}
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
            defaultValue={v.title ?? e.title}
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
            <span className="ml-1 font-normal text-ink-soft">· Optional</span>
          </span>

          <input
            name="placeName"
            defaultValue={v.placeName ?? e.place_name ?? ""}
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
            defaultValue={v.description ?? e.description}
            maxLength={2000}
            rows={5}
            required
            placeholder="Share your experience..."
            className="field min-h-[110px] resize-y rounded-xl py-2.5 text-sm"
          />
        </label>

        {/* Visibility */}
        <fieldset>
          <legend className="mb-1.5 text-xs font-semibold text-ink">
            Who can see this?
          </legend>

          <div className="grid grid-cols-2 gap-2">
            <label className="cursor-pointer">
              <input
                type="radio"
                name="visibility"
                value="private"
                defaultChecked={visibility === "private"}
                className="peer sr-only"
              />

              <span className="flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-line bg-white px-2 text-xs font-medium text-ink-soft transition peer-checked:border-accent peer-checked:bg-accent-soft peer-checked:text-accent">
                🔒 Private
              </span>
            </label>

            <label className="cursor-pointer">
              <input
                type="radio"
                name="visibility"
                value="public"
                defaultChecked={visibility === "public"}
                className="peer sr-only"
              />

              <span className="flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-line bg-white px-2 text-xs font-medium text-ink-soft transition peer-checked:border-accent peer-checked:bg-accent-soft peer-checked:text-accent">
                🌍 Public
              </span>
            </label>
          </div>
        </fieldset>

        {/* Error */}
        {state?.error && (
          <p
            role="alert"
            className="rounded-xl bg-red-50 px-3 py-2.5 text-xs font-medium text-bad"
          >
            {state.error}
          </p>
        )}
      </div>

      {/* Actions */}
      {/* Actions */}
      <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-line bg-white/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/me"
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-line px-4 text-sm font-semibold text-ink-soft transition hover:bg-canvas hover:text-ink"
        >
          <ArrowLeft size={15} />
          Cancel
        </Link>

        <button
          type="submit"
          disabled={pending}
          className="btn btn-primary inline-flex min-h-11 items-center justify-center gap-2 px-5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? (
            <>
              <LoaderCircle size={16} className="animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save size={16} />
              Save changes
            </>
          )}
        </button>
      </div>
    </form>
  );
}
