"use client";

import { MapPin } from "lucide-react";

export default function MapLoading({ message = "Preparing your map..." }) {
  return (
    <div
      className="absolute inset-0 z-[1000] grid place-items-center overflow-hidden bg-gradient-to-br from-violet-100 via-[#f7f6f2] to-blue-100"
      role="status"
      aria-label={message}
    >
      {/* Soft background effects */}
      <div className="pointer-events-none absolute -left-20 -top-20 size-64 rounded-full bg-violet-300/20 blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute -bottom-24 -right-20 size-72 rounded-full bg-blue-300/20 blur-3xl animate-pulse" />

      <div className="relative flex flex-col items-center gap-5 px-6 text-center">
        {/* Animated map pin */}
        <div className="relative grid size-24 place-items-center">
          <div className="absolute inset-0 animate-ping rounded-full border border-accent/20" />
          <div className="absolute inset-2 animate-pulse rounded-full bg-accent/10" />

          <div className="relative grid size-14 place-items-center rounded-2xl border border-white/80 bg-white/90 text-accent shadow-float">
            <MapPin size={30} strokeWidth={2.2} className="animate-bounce" />
          </div>
        </div>

        <div className="space-y-1.5">
          <h2 className="text-base font-bold tracking-tight text-ink">
            {message}
          </h2>
          <p className="text-xs text-ink-soft">Discovering places around you</p>
        </div>

        {/* Animated progress indicator */}
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((item) => (
            <span
              key={item}
              className="size-1.5 animate-bounce rounded-full bg-accent"
              style={{ animationDelay: `${item * 150}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
