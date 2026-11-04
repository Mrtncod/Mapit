"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  CircleMarker,
  useMap,
} from "react-leaflet";

const HANNOVER = [52.3759, 9.732];

function Follow({ current, following }) {
  const map = useMap();
  const first = useRef(true);

  useEffect(() => {
    if (!current) return;

    if (first.current) {
      first.current = false;
      map.flyTo([current.lat, current.lng], 17);
    } else if (following) {
      map.panTo([current.lat, current.lng]);
    }
  }, [current, following, map]);

  return null;
}

function FitRoute({ positions }) {
  const map = useMap();

  useEffect(() => {
    if (positions.length > 1) {
      map.fitBounds(positions, { padding: [40, 40] });
    } else if (positions.length === 1) {
      map.setView(positions[0], 15);
    }
  }, [map, positions]);

  return null;
}

export default function RecordMapView({
  points = [],
  current,
  following = false,
  interactive = true,
}) {
  const line = useMemo(() => points.map(([lng, lat]) => [lat, lng]), [points]);

  return (
    <MapContainer
      center={HANNOVER}
      zoom={13}
      className="h-full w-full"
      scrollWheelZoom={interactive}
      dragging={interactive}
      doubleClickZoom={interactive}
      touchZoom={interactive}
      zoomControl={interactive}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />

      {current && <Follow current={current} following={following} />}

      {!current && <FitRoute positions={line} />}

      {line.length > 1 && (
        <Polyline
          positions={line}
          pathOptions={{
            color: "#5b4bff",
            weight: 5,
            opacity: 0.85,
          }}
        />
      )}

      {line.length > 0 && (
        <>
          <CircleMarker
            center={line[0]}
            radius={7}
            pathOptions={{
              color: "#fff",
              weight: 2,
              fillColor: "#16a34a",
              fillOpacity: 1,
            }}
          />

          {line.length > 1 && (
            <CircleMarker
              center={line[line.length - 1]}
              radius={7}
              pathOptions={{
                color: "#fff",
                weight: 2,
                fillColor: "#dc2626",
                fillOpacity: 1,
              }}
            />
          )}
        </>
      )}

      {current && (
        <CircleMarker
          center={[current.lat, current.lng]}
          radius={8}
          pathOptions={{
            color: "#fff",
            weight: 3,
            fillColor: "#2563eb",
            fillOpacity: 1,
          }}
        />
      )}
    </MapContainer>
  );
}
