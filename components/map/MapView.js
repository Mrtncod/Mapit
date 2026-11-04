"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  CircleMarker,
  Polyline,
  Popup,
  ZoomControl,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { Search, MapPin, Route, LocateFixed, X } from "lucide-react";
import { useGeolocation } from "@/lib/useGeolocation";
import ReportForm from "@/components/ReportForm";
import MapLoading from "./MapLoading";

const COLORS = {
  good: "#16a34a",
  bad: "#dc2626",
  warning: "#f59e0b",
};

const HANNOVER = [52.3759, 9.732];

const iconCache = new Map();

function pinIcon(sentiment, emoji, isMine = false) {
  const key = `${sentiment}-${emoji}-${isMine}`;

  if (!iconCache.has(key)) {
    const size = isMine ? 38 : 34;
    const anchor = size / 2;

    const ownershipStyle = isMine
      ? "box-shadow:0 0 0 3px #5b4bff,0 2px 7px rgba(0,0,0,.3);"
      : "box-shadow:0 1px 4px rgba(0,0,0,.4);";

    iconCache.set(
      key,
      L.divIcon({
        className: "",
        iconSize: [size, size],
        iconAnchor: [anchor, size],
        popupAnchor: [0, -size],
        html: `
          <div style="
            background:${COLORS[sentiment] || COLORS.warning};
            width:${size}px;
            height:${size}px;
            border-radius:50% 50% 50% 0;
            transform:rotate(-45deg);
            border:2px solid #fff;
            ${ownershipStyle}
            display:flex;
            align-items:center;
            justify-content:center;
          ">
            <span style="
              transform:rotate(45deg);
              font-size:16px;
            ">${emoji || "📍"}</span>
          </div>
        `,
      }),
    );
  }

  return iconCache.get(key);
}

function FlyToUser({ position, trigger }) {
  const map = useMap();
  const hasCenteredInitially = useRef(false);
  const previousTrigger = useRef(trigger);

  // Center the map only when the first location becomes available.
  useEffect(() => {
    if (!position || hasCenteredInitially.current) return;

    hasCenteredInitially.current = true;
    map.flyTo([position.lat, position.lng], 16);
  }, [position, map]);

  // Recenter only when the user explicitly requests it.
  useEffect(() => {
    if (trigger === previousTrigger.current) return;

    previousTrigger.current = trigger;

    if (position) {
      map.flyTo([position.lat, position.lng], 16);
    }
  }, [trigger, position, map]);

  return null;
}

function FocusExperience({ experiences, focusExperienceId, markerRefs }) {
  const map = useMap();
  const lastFocusedId = useRef(null);

  useEffect(() => {
    // Allow the same experience to be selected again after clearing focus.
    if (!focusExperienceId) {
      lastFocusedId.current = null;
      return;
    }

    // Do not repeat the animation when nearby data changes.
    if (lastFocusedId.current === focusExperienceId) return;

    const experience = experiences.find(
      (item) => item.id === focusExperienceId,
    );

    const marker = markerRefs.current.get(focusExperienceId);

    if (!experience || !marker) return;

    // Mark it as focused before starting the animation.
    lastFocusedId.current = focusExperienceId;

    map.flyTo([experience.lat, experience.lng], 16, {
      duration: 1,
    });

    marker.openPopup();
  }, [experiences, focusExperienceId, markerRefs, map]);

  return null;
}

function NearbyLoader({ onData, searchQuery, category }) {
  const map = useMap();
  const timer = useRef(null);
  const controller = useRef(null);

  const load = useCallback(() => {
    clearTimeout(timer.current);

    timer.current = setTimeout(async () => {
      controller.current?.abort();
      controller.current = new AbortController();

      const center = map.getCenter();

      const radius = Math.min(
        map.getBounds().getNorthEast().distanceTo(center),
        50000,
      );

      const params = new URLSearchParams({
        lat: center.lat.toString(),
        lng: center.lng.toString(),
        radius: Math.round(radius).toString(),
        q: searchQuery.trim(),
        category,
      });

      try {
        const response = await fetch(
          `/api/experiences/nearby?${params.toString()}`,
          { signal: controller.current.signal },
        );

        if (response.ok) {
          onData(await response.json());
        }
      } catch {
        // Aborted requests or network errors are ignored.
      }
    }, 350);
  }, [map, onData, searchQuery, category]);

  useMapEvents({ moveend: load });

  useEffect(() => {
    load();

    return () => {
      clearTimeout(timer.current);
      controller.current?.abort();
    };
  }, [load]);

  return null;
}

function statusText({ status, position }) {
  if (status === "denied") {
    return "Location access is blocked. Enable it in your browser settings.";
  }

  if (status === "unsupported") {
    return "Your browser does not support location services.";
  }

  if (status === "error") {
    return "Couldn't get your location. Check your device location settings.";
  }

  if (!position) {
    return "Requesting your location...";
  }

  const accuracy = Math.round(position.accuracy);

  return accuracy > 50
    ? `Location accuracy ±${accuracy} m`
    : `Location ready · ±${accuracy} m`;
}

export default function MapView({
  categories = [],
  initialExperiences = [],
  focusExperienceId = null,
  collectionMode = false,
}) {
  const geo = useGeolocation();
  const position = geo.position;

  const [experiences, setExperiences] = useState(initialExperiences);
  const markerRefs = useRef(new Map());
  const [recenter, setRecenter] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("");
  const [mapReady, setMapReady] = useState(false);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});

  const handleNearbyData = useCallback(
    (nearbyExperiences) => {
      // Explore: show only the results matching the current map search.
      if (!collectionMode) {
        setExperiences(nearbyExperiences);
        return;
      }

      // My Experiences: keep all of the user's own experiences,
      // including private ones, while adding nearby public results.
      const merged = new Map(initialExperiences.map((item) => [item.id, item]));

      nearbyExperiences.forEach((item) => {
        merged.set(item.id, item);
      });

      setExperiences([...merged.values()]);
    },
    [collectionMode, initialExperiences],
  );

  useEffect(() => {
    function handleLocateMe() {
      if (position) {
        setRecenter((n) => n + 1);
      }
    }

    window.addEventListener("mapit:locate-me", handleLocateMe);

    return () => {
      window.removeEventListener("mapit:locate-me", handleLocateMe);
    };
  }, [position]);

  const availableCategories = categories.filter(
    (item) =>
      item.applies_to === "both" ||
      item.applies_to === "spot" ||
      item.applies_to === "route",
  );

  return (
    <div className="relative h-full min-h-0 w-full overflow-hidden">
      <MapContainer
        center={HANNOVER}
        zoom={13}
        zoomControl={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
          eventHandlers={{
            load: () => setMapReady(true),
          }}
        />

        <ZoomControl position="bottomright" />

        <FlyToUser position={position} trigger={recenter} />
        <FocusExperience
          experiences={experiences}
          focusExperienceId={focusExperienceId}
          markerRefs={markerRefs}
        />

        <NearbyLoader
          onData={handleNearbyData}
          searchQuery={searchQuery}
          category={category}
        />

        {position && (
          <>
            <Circle
              center={[position.lat, position.lng]}
              radius={position.accuracy}
              pathOptions={{
                color: "#2563eb",
                weight: 1,
                fillOpacity: 0.12,
              }}
            />

            <CircleMarker
              center={[position.lat, position.lng]}
              radius={8}
              pathOptions={{
                color: "#fff",
                weight: 3,
                fillColor: "#2563eb",
                fillOpacity: 1,
              }}
            />
          </>
        )}

        {experiences.map((e) => (
          <div key={e.id}>
            {e.kind === "route" && e.path && (
              <Polyline
                positions={e.path.coordinates.map(([lng, lat]) => [lat, lng])}
                pathOptions={{
                  color: COLORS[e.sentiment],
                  weight: 4,
                }}
              />
            )}

            <Marker
              ref={(marker) => {
                if (marker) {
                  markerRefs.current.set(e.id, marker);
                } else {
                  markerRefs.current.delete(e.id);
                }
              }}
              position={[e.lat, e.lng]}
              icon={pinIcon(e.sentiment, e.category_icon, e.is_mine)}
            >
              <Popup className="mapit-experience-popup" autoPan={false}>
                <div className="grid w-full gap-2 p-2 sm:gap-2.5 sm:p-2.5">
                  {/* Category */}
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-ink-soft/70 ">
                        Category
                      </span>
                      <span className="truncate text-[12px] font-semibold text-[#416448] ">
                        {e.category_icon || "📍"} {e.category_label}
                      </span>
                    </div>

                    {e.is_mine && (
                      <span className="shrink-0 rounded-full bg-accent-soft px-1.5 py-0.5 text-[9px] font-bold text-accent sm:text-[8px]">
                        Yours
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-ink-soft/70 sm:text-[8px]">
                      Title
                    </span>
                    <h3 className="line-clamp-2 text-[12px] font-bold leading-snug text-ink sm:text-xs">
                      {e.title}
                    </h3>
                  </div>

                  {/* Description */}
                  {e.description && (
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-ink-soft/70 sm:text-[8px]">
                        Description
                      </span>

                      <p
                        className={`text-[10px] font-semibold tracking-wide leading-relaxed text-ink-soft ${
                          expandedDescriptions[e.id] ? "" : "line-clamp-2"
                        }`}
                      >
                        {e.description}
                      </p>

                      {e.description.length > 100 && (
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedDescriptions((previous) => ({
                              ...previous,
                              [e.id]: !previous[e.id],
                            }))
                          }
                          className="mt-0.5 w-fit text-[10px] font-bold text-accent transition hover:text-accent-dark"
                        >
                          {expandedDescriptions[e.id] ? "See less" : "See more"}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Sentiment and author */}
                  <div className="grid grid-cols-2 gap-2 border-t border-line pt-1.5">
                    <div className="flex min-w-0 flex-col gap-1">
                      <span className="text-[8px] font-bold uppercase tracking-wider text-ink-soft/70 sm:text-[8px]">
                        Sentiment
                      </span>
                      <span
                        className={`w-fit rounded-full px-1.5 py-0.5 text-[9px] font-bold capitalize sm:text-[9px] ${
                          e.sentiment === "good"
                            ? "bg-good/10 text-good"
                            : e.sentiment === "bad"
                              ? "bg-bad/10 text-bad"
                              : "bg-warning/10 text-[#936313]"
                        }`}
                      >
                        {e.sentiment}
                      </span>
                    </div>

                    <div className="flex min-w-0 flex-col gap-1 text-right">
                      <span className="text-[8px] font-bold uppercase tracking-wider text-ink-soft/70 sm:text-[8px]">
                        Shared by
                      </span>
                      <span className="truncate text-[9px] font-semibold capitalize text-ink">
                        {e.author_name}
                      </span>
                    </div>
                  </div>

                  {!e.is_mine && e.visibility === "public" && (
                    <ReportForm id={e.id} />
                  )}
                </div>
              </Popup>
            </Marker>
          </div>
        ))}
      </MapContainer>

      {/* Initial map loading overlay */}
      <div
        className={`absolute inset-0 z-[1000] transition-opacity duration-500 ${
          mapReady ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
        aria-hidden={mapReady}
      >
        <MapLoading message="Getting your map ready..." />
      </div>

      {/* Search and quick actions */}
      {!collectionMode && (
        <div
          className={`absolute left-3 right-3 z-[500] mx-auto max-w-xl lg:left-1/2 lg:right-auto lg:top-4 lg:w-[min(560px,calc(100%-360px))] lg:-translate-x-1/2 ${
            collectionMode ? "top-3" : "top-[65px]"
          }`}
        >
          <div className="rounded-2xl border border-white/80 bg-white/90 p-1.5 shadow-float backdrop-blur-xl">
            <div className="flex items-center gap-2 rounded-xl border border-line bg-white px-3">
              <Search className="size-5 shrink-0 text-ink-soft" />

              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search experiences, places or categories..."
                className="h-9 min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-soft/70"
                aria-label="Search map experiences"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="rounded-lg p-1.5 text-ink-soft hover:bg-canvas"
                  aria-label="Clear search"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="h-10 min-w-0 flex-1 rounded-xl border border-line bg-white px-3 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                aria-label="Filter by category"
              >
                <option value="">All categories</option>
                {availableCategories.map((item) => (
                  <option key={item.slug} value={item.slug}>
                    {item.icon ? `${item.icon} ` : ""}
                    {item.label}
                  </option>
                ))}
              </select>

              <div className="flex gap-2">
                <Link
                  href="/experiences/new"
                  className="btn btn-secondary min-h-9 flex-1 whitespace-nowrap px-2 text-[11px] sm:min-h-10   sm:text-xs sm:flex-none"
                >
                  <MapPin className="size-3.5" />
                  Add experience
                </Link>

                <Link
                  href="/experiences/record"
                  className="btn btn-primary min-h-9 flex-1 whitespace-nowrap px-2.5 text-[11px] sm:min-h-10 sm:px-3 sm:text-xs sm:flex-none"
                >
                  <Route className="size-3.5" />
                  Record route
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Location status */}
      <div className="absolute bottom-4 left-3 z-[500] max-w-[calc(100%-90px)] lg:left-[100px]">
        <div className="flex items-center gap-2 rounded-xl border border-white/80 bg-white/90 px-3 py-2 text-xs text-ink-soft shadow-soft backdrop-blur-xl">
          <span
            className={`size-2 shrink-0 rounded-full ${
              position ? "bg-good" : "bg-warning"
            }`}
          />
          <span>{statusText(geo)}</span>
        </div>
      </div>

      {/* Locate user */}
      <button
        type="button"
        onClick={() => setRecenter((n) => n + 1)}
        disabled={!position}
        className="absolute bottom-[100px] right-3 z-[500] grid size-10 place-items-center rounded-xl border border-white/80 bg-white/90 text-ink shadow-soft backdrop-blur-xl transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 lg:bottom-[99px] lg:size-11"
        aria-label="Center map on my location"
        title="Locate me"
      >
        <LocateFixed className="size-5" />
      </button>
    </div>
  );
}
