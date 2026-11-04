"use client";

import { useEffect, useState } from "react";

export default function FreshMount({ children, fallback = null }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setMounted(true);
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  return mounted ? children : fallback;
}
