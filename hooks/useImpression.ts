"use client";

import { useEffect, useRef } from "react";

export function useImpression<T extends Element = Element>(
  onImpression: () => void,
  threshold = 0.5
): React.RefObject<T | null> {
  const ref = useRef<T>(null);
  const fired = useRef(false);
  const callbackRef = useRef(onImpression);
  callbackRef.current = onImpression;

  useEffect(() => {
    const el = ref.current;
    if (!el || fired.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !fired.current) {
            fired.current = true;
            callbackRef.current();
            observer.disconnect();
          }
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return ref;
}
