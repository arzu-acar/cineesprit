"use client";

import { useEffect } from "react";

export function IosZoomPreventer() {
  useEffect(() => {
    const prevent = (e: TouchEvent) => {
      if (e.touches.length > 1) e.preventDefault();
    };
    document.addEventListener("touchmove", prevent, { passive: false });
    document.addEventListener("gesturestart", prevent as EventListener, { passive: false });
    return () => {
      document.removeEventListener("touchmove", prevent);
      document.removeEventListener("gesturestart", prevent as EventListener);
    };
  }, []);

  return null;
}
