"use client";

import { useEffect, useState } from "react";

export function useGeolocation() {
  const [state, setState] = useState({
    status: "locating",
    position: null,
  });

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setState({
        status: "unsupported",
        position: null,
      });
      return;
    }

    // watchPosition keeps updating as GPS accuracy improves.
    const id = navigator.geolocation.watchPosition(
      (p) =>
        setState({
          status: "ready",
          position: {
            lat: p.coords.latitude,
            lng: p.coords.longitude,
            accuracy: p.coords.accuracy,
          },
        }),
      (err) =>
        setState((s) => ({
          ...s,
          status: err.code === 1 ? "denied" : "error",
        })),
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 20000,
      },
    );

    return () => navigator.geolocation.clearWatch(id);
  }, []);

  return state;
}
