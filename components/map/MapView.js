"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import {
  Search,
  MapPin,
  Route,
  LocateFixed,
  X,
  Clock3,
  Mountain,
} from "lucide-react";
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

const LOCATION_GROUP_RADIUS_METERS = 15;

function distanceBetweenMeters(lat1, lng1, lat2, lng2) {
  const toRadians = (degrees) => (degrees * Math.PI) / 180;
  const earthRadius = 6371000;

  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) ** 2;

  return 2 * earthRadius * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function pinIcon(sentiment, emoji, isMine = false, count = 1) {
  const key = `${sentiment}-${emoji}-${isMine}-${count}`;

  if (!iconCache.has(key)) {
    const size = isMine ? 38 : 34;
    const width = size + 12;
    const height = size + 8;
    const anchor = size / 2;

    const ownershipStyle = isMine
      ? "box-shadow:0 0 0 3px #5b4bff,0 2px 7px rgba(0,0,0,.3);"
      : "box-shadow:0 1px 4px rgba(0,0,0,.4);";

    const countBadge =
      count > 1
        ? `
          <span style="
            position:absolute;
            top:0;
            right:0;
            min-width:19px;
            height:19px;
            padding:0 4px;
            border-radius:999px;
            background:#262626;
            color:#fff;
            border:2px solid #fff;
            font-size:10px;
            font-weight:700;
            line-height:15px;
            text-align:center;
            box-shadow:0 1px 4px rgba(0,0,0,.25);
            transform:translate(20%,-15%);
          ">${count > 99 ? "99+" : count}</span>
        `
        : "";

    iconCache.set(
      key,
      L.divIcon({
        className: "",
        iconSize: [width, height],
        iconAnchor: [anchor, height],
        popupAnchor: [0, -height],

        html: `
          <div style="
            position:relative;
            width:${width}px;
            height:${height}px;
          ">
            <div style="
              position:absolute;
              left:0;
              bottom:0;
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
            ${countBadge}
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

function FocusExperience({
  experiences,
  experienceGroupKeys,
  locationGroups,
  focusExperienceId,
  markerRefs,
}) {
  const map = useMap();
  const lastFocusedId = useRef(null);

  useEffect(() => {
    if (!focusExperienceId) {
      lastFocusedId.current = null;
      return;
    }

    if (lastFocusedId.current === focusExperienceId) return;

    const experience = experiences.find(
      (item) => item.id === focusExperienceId,
    );

    if (!experience) return;

    const groupKey = experienceGroupKeys.get(experience.id);
    const group = locationGroups.find((item) => item.key === groupKey);
    const marker = markerRefs.current.get(groupKey);

    if (!group || !marker) return;

    lastFocusedId.current = focusExperienceId;

    map.flyTo([group.lat, group.lng], 16, { duration: 1 });

    marker.openPopup();
  }, [
    experiences,
    experienceGroupKeys,
    locationGroups,
    focusExperienceId,
    markerRefs,
    map,
  ]);

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

function formatRelativeDate(value) {
  if (!value) return "";

  const date = new Date(value);
  const timestamp = date.getTime();

  if (!Number.isFinite(timestamp)) return "";

  const seconds = (timestamp - Date.now()) / 1000;

  if (Math.abs(seconds) < 60) return "Just now";

  const units = [
    { unit: "year", seconds: 31536000 },
    { unit: "month", seconds: 2592000 },
    { unit: "week", seconds: 604800 },
    { unit: "day", seconds: 86400 },
    { unit: "hour", seconds: 3600 },
    { unit: "minute", seconds: 60 },
  ];

  const formatter = new Intl.RelativeTimeFormat("en", {
    numeric: "auto",
  });

  const selectedUnit = units.find(
    ({ seconds: unitSeconds }) => Math.abs(seconds) >= unitSeconds,
  );

  if (!selectedUnit) return "Just now";

  const valueInUnits = Math.round(seconds / selectedUnit.seconds);

  return formatter.format(valueInUnits, selectedUnit.unit);
}

function formatDistance(meters) {
  if (meters == null) return null;

  const distance = Number(meters);

  if (!Number.isFinite(distance) || distance <= 0) return null;

  return distance >= 1000
    ? `${(distance / 1000).toFixed(1)} km`
    : `${Math.round(distance)} m`;
}

function formatDuration(seconds) {
  if (seconds == null) return null;

  const value = Number(seconds);

  if (!Number.isFinite(value) || value <= 0) return null;

  const totalMinutes = Math.round(value / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours && minutes) return `${hours}h ${minutes}m`;
  if (hours) return `${hours}h`;

  return `${totalMinutes} min`;
}

function formatElevation(meters) {
  if (meters == null) return null;

  const value = Number(meters);

  if (!Number.isFinite(value) || value <= 0) return null;

  return `${Math.round(value)} m`;
}

function ExperiencePopupCard({
  experience: e,
  expandedDescriptions,
  setExpandedDescriptions,
}) {
  const isExpanded = Boolean(expandedDescriptions[e.id]);

  const sentimentStyles = {
    good: "bg-good/10 text-good",
    bad: "bg-bad/10 text-bad",
    warning: "bg-warning/10 text-[#936313]",
  };

  const sentimentLabels = {
    good: "Good",
    bad: "Bad",
    warning: "Warning",
  };

  const author = e.author_name || "Anonymous";
  const postedAt = formatRelativeDate(e.created_at);

  return (
    <article className="min-w-0 bg-white p-2.5">
      <div className="grid gap-2">
        {/* Category and sentiment */}
        <div className="flex min-w-0 items-start justify-between gap-2 pr-6">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex w-12 shrink-0 flex-col items-center gap-1">
              <span className="grid size-8 place-items-center rounded-xl bg-accent-soft text-base">
                {e.category_icon || "📍"}
              </span>

              <span className="w-full text-center text-[10px] font-semibold leading-tight text-accent [overflow-wrap:anywhere]">
                {e.category_label || "Experience"}
              </span>
            </div>

            {e.is_mine && (
              <span className="self-start rounded-full bg-accent-soft px-2 py-1 text-[9px] font-bold text-accent">
                Yours
              </span>
            )}
          </div>

          <span
            className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${
              sentimentStyles[e.sentiment] || sentimentStyles.warning
            }`}
          >
            {sentimentLabels[e.sentiment] || "Warning"}
          </span>
        </div>

        {/* Title */}
        {e.title && (
          <h3 className="break-words text-[13px] font-bold leading-snug text-ink">
            {e.title}
          </h3>
        )}

        {/* Optional place name */}
        {e.place_name && (
          <div className="flex min-w-0 items-center gap-1 text-[11px] text-ink-soft">
            <MapPin className="size-3 shrink-0" />
            <span className="break-words">{e.place_name}</span>
          </div>
        )}

        {/* Description */}
        {e.description && (
          <div className="min-w-0">
            <p
              className={`break-words text-[12px] leading-relaxed text-ink-soft [overflow-wrap:anywhere] ${
                isExpanded ? "whitespace-pre-wrap" : "line-clamp-2"
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
                className="mt-1 text-[11px] font-bold text-accent hover:text-accent-dark"
              >
                {isExpanded ? "Show less ↑" : "Read more ↓"}
              </button>
            )}
          </div>
        )}

        {/* Author and date */}
        <div className="flex min-w-0 items-center justify-between gap-2 border-t border-line pt-1.5">
          <p className="min-w-0 truncate text-[10px] font-semibold text-ink">
            By {author}
          </p>

          {postedAt && (
            <p className="shrink-0 text-[10px] text-ink-soft">{postedAt}</p>
          )}
        </div>

        {/* Report experience */}
        {!e.is_mine && e.visibility === "public" && (
          <div className="border-t border-line pt-2 [&_button]:!text-bad [&_button:hover]:!text-red-700 [&_svg]:text-bad">
            <ReportForm id={e.id} />
          </div>
        )}
      </div>
    </article>
  );
}

function LocationPopup({
  group,
  expandedDescriptions,
  setExpandedDescriptions,
}) {
  const [selectedId, setSelectedId] = useState(null);
  const [showAll, setShowAll] = useState(false);

  // A location with one experience opens its full details immediately.
  if (group.experiences.length === 1) {
    return (
      <div className="mapit-popup-list mapit-popup-detail">
        <ExperiencePopupCard
          experience={group.experiences[0]}
          expandedDescriptions={expandedDescriptions}
          setExpandedDescriptions={setExpandedDescriptions}
        />
      </div>
    );
  }

  const selectedExperience = group.experiences.find(
    (experience) => experience.id === selectedId,
  );

  // Detail view: show the original full experience card.
  if (selectedExperience) {
    return (
      <div className="mapit-popup-list">
        <div className="mapit-popup-header">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setSelectedId(null);
            }}
            className="text-[11px] font-semibold text-accent hover:text-accent-dark"
          >
            ← All experiences
          </button>
        </div>

        <ExperiencePopupCard
          experience={selectedExperience}
          expandedDescriptions={expandedDescriptions}
          setExpandedDescriptions={setExpandedDescriptions}
        />
      </div>
    );
  }

  const visibleExperiences = showAll
    ? group.experiences
    : group.experiences.slice(0, 3);

  return (
    <div className="mapit-popup-list">
      <div className="mapit-popup-header">
        <div>
          <h3 className="text-[13px] font-bold text-ink">Experiences here</h3>
          <p className="text-[10px] text-ink-soft">
            Discover what people shared
          </p>
        </div>

        <span className="shrink-0 rounded-full bg-accent-soft px-2.5 py-1 text-[10px] font-bold text-accent">
          {group.experiences.length}
        </span>
      </div>

      <div className="grid">
        {visibleExperiences.map((experience) => (
          <button
            key={experience.id}
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setSelectedId(experience.id);
            }}
            className="flex w-full min-w-0 items-center gap-2.5 border-b border-line p-2.5 text-left transition hover:bg-canvas"
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-canvas text-base">
              {experience.category_icon || "📍"}
            </span>

            <span className="min-w-0 flex-1">
              <span className="block truncate text-[12px] font-bold text-ink">
                {experience.title}
              </span>

              <span className="mt-1 block truncate text-[10px] text-ink-soft">
                {experience.category_label || "Experience"}
                {" · "}
                {experience.kind === "route" ? "Route" : "Place"}
              </span>

              <span className="mt-1 block truncate text-[10px] text-ink-soft">
                By {experience.author_name || "Anonymous"}
                {" · "}
                {formatRelativeDate(experience.created_at)}
              </span>
            </span>

            <span
              className={`size-2 shrink-0 rounded-full ${
                experience.sentiment === "good"
                  ? "bg-good"
                  : experience.sentiment === "bad"
                    ? "bg-bad"
                    : "bg-warning"
              }`}
              title={experience.sentiment}
            />

            <span className="shrink-0 text-ink-soft">›</span>
          </button>
        ))}
      </div>

      {group.experiences.length > 3 && (
        <button
          type="button"
          onClick={() => setShowAll((value) => !value)}
          className="w-full px-3 py-3 text-center text-[11px] font-bold text-accent transition hover:bg-canvas"
        >
          {showAll
            ? "Show fewer experiences"
            : `See all ${group.experiences.length} experiences`}
        </button>
      )}
    </div>
  );
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

  const { locationGroups, experienceGroupKeys } = useMemo(() => {
    const groups = [];
    const groupsByPlaceRef = new Map();
    const experiencesWithoutPlaceRef = [];

    // First, group experiences that share a known place reference.
    experiences.forEach((experience, index) => {
      const placeRef = experience.place_ref
        ? String(experience.place_ref)
        : null;

      if (!placeRef) {
        experiencesWithoutPlaceRef.push({ experience, index });
        return;
      }

      let group = groupsByPlaceRef.get(placeRef);

      if (!group) {
        group = {
          key: `place:${placeRef}`,
          placeRef,
          anchorLat: Number(experience.lat),
          anchorLng: Number(experience.lng),
          order: index,
          experiences: [],
        };

        groupsByPlaceRef.set(placeRef, group);
        groups.push(group);
      }

      group.experiences.push(experience);
    });

    // Then group experiences without a place reference by proximity.
    for (const { experience, index } of experiencesWithoutPlaceRef) {
      const lat = Number(experience.lat);
      const lng = Number(experience.lng);

      let closestGroup = null;
      let closestDistance = LOCATION_GROUP_RADIUS_METERS;

      for (const group of groups) {
        const distance = distanceBetweenMeters(
          lat,
          lng,
          group.anchorLat,
          group.anchorLng,
        );

        if (distance <= closestDistance) {
          closestDistance = distance;
          closestGroup = group;
        }
      }

      if (closestGroup) {
        closestGroup.experiences.push(experience);
      } else {
        groups.push({
          key: `location:${experience.id}`,
          placeRef: null,
          anchorLat: lat,
          anchorLng: lng,
          order: index,
          experiences: [experience],
        });
      }
    }

    // Preserve the original experience ordering.
    groups.sort((a, b) => a.order - b.order);

    const experienceGroupKeys = new Map();

    const locationGroups = groups.map((group) => {
      const first = group.experiences[0];

      group.experiences.forEach((experience) => {
        experienceGroupKeys.set(experience.id, group.key);
      });

      // Use the average position for the marker.
      const lat =
        group.experiences.reduce(
          (total, experience) => total + Number(experience.lat),
          0,
        ) / group.experiences.length;

      const lng =
        group.experiences.reduce(
          (total, experience) => total + Number(experience.lng),
          0,
        ) / group.experiences.length;

      const sameCategory = group.experiences.every(
        (experience) => experience.category_icon === first.category_icon,
      );

      const sameSentiment = group.experiences.every(
        (experience) => experience.sentiment === first.sentiment,
      );

      return {
        ...group,
        lat,
        lng,
        icon: sameCategory ? first.category_icon : "📍",
        sentiment: sameSentiment ? first.sentiment : "warning",
        isMine: group.experiences.every((experience) => experience.is_mine),
      };
    });

    return { locationGroups, experienceGroupKeys };
  }, [experiences]);

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
          experienceGroupKeys={experienceGroupKeys}
          locationGroups={locationGroups}
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

        {/* Route lines remain individual */}
        {experiences.map((e) =>
          e.kind === "route" && e.path ? (
            <Polyline
              key={`route-${e.id}`}
              positions={e.path.coordinates.map(([lng, lat]) => [lat, lng])}
              pathOptions={{
                color: COLORS[e.sentiment] || COLORS.warning,
                weight: 4,
              }}
            />
          ) : null,
        )}

        {/* One marker per unique location */}
        {locationGroups.map((group) => (
          <Marker
            key={group.key}
            ref={(marker) => {
              if (marker) {
                markerRefs.current.set(group.key, marker);
              } else {
                markerRefs.current.delete(group.key);
              }
            }}
            position={[group.lat, group.lng]}
            icon={pinIcon(
              group.sentiment,
              group.icon,
              group.isMine,
              group.experiences.length,
            )}
          >
            <Popup
              className="mapit-experience-popup"
              autoPan={false}
              closeOnClick={true}
              minWidth={150}
              maxWidth={190}
            >
              <LocationPopup
                group={group}
                expandedDescriptions={expandedDescriptions}
                setExpandedDescriptions={setExpandedDescriptions}
              />
            </Popup>
          </Marker>
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
