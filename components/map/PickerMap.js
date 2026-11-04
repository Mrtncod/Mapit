"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  useMap,
  useMapEvents,
} from "react-leaflet";

const HANNOVER = [52.3759, 9.732];

const pinIcon = L.divIcon({
  className: "",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  html: `<div style="background:#2563eb;width:30px;height:30px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4)"></div>`,
});

function ClickToPlace({ onPick, interactive }) {
  useMapEvents({
    click: (e) => {
      if (interactive) onPick?.(e.latlng.lat, e.latlng.lng);
    },
  });

  return null;
}

// Flies to the pin on the first fix, and again whenever `trigger` changes
function FlyTo({ pin, trigger }) {
  const map = useMap();
  const done = useRef(false);

  useEffect(() => {
    if (pin && !done.current) {
      done.current = true;
      map.flyTo([pin.lat, pin.lng], 17);
    }
  }, [pin, map]);

  useEffect(() => {
    if (trigger > 0 && pin) map.flyTo([pin.lat, pin.lng], 17);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  return null;
}

export default function PickerMap({
  pin,
  accuracy,
  onPick,
  trigger,
  interactive = true,
}) {
  return (
    <MapContainer
      center={pin ? [pin.lat, pin.lng] : HANNOVER}
      zoom={pin ? 17 : 13}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />
      <ClickToPlace onPick={onPick} interactive={interactive} />
      <FlyTo pin={pin} trigger={trigger} />

      {pin && accuracy != null && (
        <Circle
          center={[pin.lat, pin.lng]}
          radius={accuracy}
          pathOptions={{ color: "#2563eb", weight: 1, fillOpacity: 0.12 }}
        />
      )}

      {pin && (
        <Marker
          position={[pin.lat, pin.lng]}
          icon={pinIcon}
          draggable={interactive}
          eventHandlers={
            interactive
              ? {
                  dragend: (e) => {
                    const p = e.target.getLatLng();
                    onPick?.(p.lat, p.lng);
                  },
                }
              : {}
          }
        />
      )}
    </MapContainer>
  );
}
