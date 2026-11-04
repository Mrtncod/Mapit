"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { distanceBetween } from "./geo";

const STORAGE_KEY = "mapit:recording";
const MAX_ACCURACY_M = 30; // ignore fixes worse than this
const MIN_STEP_M = 8; // add a point only after moving this far
const MAX_POINTS = 10000;
const ELEVATION_STEP_M = 3; // ignore altitude jitter smaller than this

function getSavedRecording() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const data = JSON.parse(raw);

    return Array.isArray(data?.points) && data.points.length >= 2 ? data : null;
  } catch {
    return null;
  }
}

export function useRouteRecorder() {
  const [status, setStatus] = useState("idle"); // idle | recording | stopped
  const [points, setPoints] = useState([]); // [lng, lat] pairs
  const [current, setCurrent] = useState(null);
  const [distanceM, setDistanceM] = useState(0);
  const [elevationGainM, setElevationGainM] = useState(0);
  const [elapsed, setElapsed] = useState(0); // ms
  const [startedAt, setStartedAt] = useState(null);
  const [recovered, setRecovered] = useState(null);
  const [recoveryChecked, setRecoveryChecked] = useState(false);
  const [error, setError] = useState("");

  // Mutable recording data lives in a ref so GPS callbacks never see stale state
  const r = useRef({
    points: [],
    dist: 0,
    gain: 0,
    refAlt: null,
    base: 0,
    resumeTs: 0,
    startedAt: null,
    watchId: null,
    timer: null,
    simTimer: null,
    wakeLock: null,
  });

  const persist = useCallback(() => {
    const s = r.current;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          points: s.points,
          dist: s.dist,
          gain: s.gain,
          startedAt: s.startedAt,
          elapsedMs: s.base + Date.now() - s.resumeTs,
        }),
      );
    } catch {
      // storage full or unavailable: recording still works
    }
  }, []);

  const lockScreen = useCallback(async () => {
    try {
      if ("wakeLock" in navigator && !r.current.wakeLock) {
        const lock = await navigator.wakeLock.request("screen");
        r.current.wakeLock = lock;
        lock.addEventListener("release", () => {
          if (r.current.wakeLock === lock) r.current.wakeLock = null;
        });
      }
    } catch {
      // not supported or denied: ignore
    }
  }, []);

  const releaseLock = useCallback(() => {
    const lock = r.current.wakeLock;
    r.current.wakeLock = null;
    lock?.release().catch(() => {});
  }, []);

  const onPosition = useCallback(
    (p) => {
      const s = r.current;
      const {
        latitude: lat,
        longitude: lng,
        accuracy,
        altitude,
        altitudeAccuracy,
      } = p.coords;

      setError("");
      setCurrent({ lat, lng, accuracy });
      if (accuracy > MAX_ACCURACY_M || s.points.length >= MAX_POINTS) return;

      const last = s.points[s.points.length - 1];
      const step = last
        ? distanceBetween(last[1], last[0], lat, lng)
        : Infinity;
      if (step < MIN_STEP_M) return;

      s.points.push([lng, lat]);
      if (last) s.dist += step;

      if (
        altitude != null &&
        (altitudeAccuracy == null || altitudeAccuracy <= 20)
      ) {
        if (s.refAlt == null) {
          s.refAlt = altitude;
        } else if (Math.abs(altitude - s.refAlt) >= ELEVATION_STEP_M) {
          if (altitude > s.refAlt) s.gain += altitude - s.refAlt;
          s.refAlt = altitude;
        }
      }

      setPoints([...s.points]);
      setDistanceM(s.dist);
      setElevationGainM(s.gain);
      if (s.points.length % 5 === 0) persist();
    },
    [persist],
  );

  const halt = useCallback(() => {
    const s = r.current;
    if (s.watchId != null) navigator.geolocation.clearWatch(s.watchId);
    s.watchId = null;
    clearInterval(s.simTimer);
    s.simTimer = null;
    clearInterval(s.timer);
    s.timer = null;
    releaseLock();
  }, [releaseLock]);

  const begin = useCallback(
    (initial) => {
      if (!("geolocation" in navigator)) {
        setError("This browser has no location support.");
        return;
      }
      const s = r.current;
      setError("");
      s.points = initial?.points ?? [];
      s.dist = initial?.dist ?? 0;
      s.gain = initial?.gain ?? 0;
      s.refAlt = null;
      s.startedAt = initial?.startedAt ?? new Date().toISOString();
      s.base = initial?.elapsedMs ?? 0;
      s.resumeTs = Date.now();
      s.timer = setInterval(() => {
        setElapsed(s.base + Date.now() - s.resumeTs);
      }, 1000);

      setPoints([...s.points]);
      setDistanceM(s.dist);
      setElevationGainM(s.gain);
      setElapsed(s.base);
      setStartedAt(s.startedAt);
      setRecovered(null);
      setStatus("recording");

      const simulate =
        process.env.NODE_ENV !== "production" &&
        new URLSearchParams(window.location.search).has("sim");

      if (simulate) {
        // Dev only: a fake walk near Hannover centre, one fix per second
        let i = 0;
        s.simTimer = setInterval(() => {
          i++;
          onPosition({
            coords: {
              latitude: 52.3759 + i * 0.0001,
              longitude: 9.732 + i * 0.00005 + Math.sin(i / 6) * 0.0004,
              accuracy: 10,
              altitude: 55 + i * 0.8,
              altitudeAccuracy: 5,
            },
          });
        }, 1000);
      } else {
        s.watchId = navigator.geolocation.watchPosition(
          onPosition,
          (err) => {
            if (err.code === 1) setError("Location permission denied.");
            else if (err.code === 2) setError("GPS position unavailable.");
            // code 3 (timeout) just means no new fix yet, so we keep waiting
          },
          { enableHighAccuracy: true, maximumAge: 0, timeout: 30000 },
        );
      }
      lockScreen();
      persist();
    },
    [onPosition, lockScreen, persist],
  );

  const stop = useCallback(() => {
    const s = r.current;
    halt();
    setElapsed(s.base + Date.now() - s.resumeTs);
    setStatus("stopped");
    persist();
  }, [halt, persist]);

  const discard = useCallback(() => {
    halt();
    const s = r.current;
    s.points = [];
    s.dist = 0;
    s.gain = 0;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setPoints([]);
    setDistanceM(0);
    setElevationGainM(0);
    setElapsed(0);
    setStartedAt(null);
    setCurrent(null);
    setRecovered(null);
    setStatus("idle");
  }, [halt]);

  // Offer to continue an unfinished recording found in this browser
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setRecovered(getSavedRecording());
      setRecoveryChecked(true);
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  // Re-acquire the wake lock when returning to the tab; clean up on leave
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible" && r.current.watchId != null)
        lockScreen();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      halt();
    };
  }, [halt, lockScreen]);

  // Warn before closing the tab mid-recording
  useEffect(() => {
    if (status !== "recording") return;
    const warn = (e) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [status]);

  return {
    status,
    points,
    current,
    distanceM,
    elevationGainM,
    elapsed,
    startedAt,
    recovered,
    error,
    start: () => begin(null),
    continueRecovered: () => begin(recovered),
    stop,
    discard,
  };
}
