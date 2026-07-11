import type { DataLayerEvent } from "./types";

export function pushDataLayer(event: DataLayerEvent): void {
  if (typeof window === "undefined") return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dl = (window as any).dataLayer as unknown[];
  if (Array.isArray(dl)) {
    dl.push(event);
  }
}
