"use client";

import { useState, useEffect } from "react";

/**
 * Detects if the user is on a mobile device using a combination of:
 * - Touch capability
 * - Screen width (< 768px breakpoint)
 * - User agent check as a secondary signal
 *
 * Returns true if the device is considered mobile/touch-primary.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => {
      const hasTouch = navigator.maxTouchPoints > 0;
      const isNarrow = window.innerWidth < 768;
      const uaHint = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
      setIsMobile((hasTouch && isNarrow) || uaHint);
    };

    check();

    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return isMobile;
}
