"use client";

import { pushDataLayer } from "@lib/gtm/events";
import type {
  ImpressionProduct,
  ClickProduct,
  GAEvent,
  VirtualPageviewEvent,
} from "@lib/gtm/types";

export function useDataLayer() {
  function pushVirtualPageview(
    payload: Omit<VirtualPageviewEvent, "event">
  ): void {
    pushDataLayer({ event: "virtualPageview", ...payload });
  }

  function pushProductImpression(
    impressions: ImpressionProduct[],
    label = ""
  ): void {
    pushDataLayer({
      event: "productImpression",
      eventCategory: "Ecommerce",
      eventAction: "Product Impression",
      eventLabel: label,
      ecommerce: { impressions },
    });
  }

  function pushProductClick(products: ClickProduct[], label = ""): void {
    pushDataLayer({
      event: "productClick",
      eventCategory: "Ecommerce",
      eventAction: "Product Click",
      eventLabel: label,
      ecommerce: { click: { products } },
    });
  }

  function pushGAEvent(payload: Omit<GAEvent, "event">): void {
    pushDataLayer({ event: "GAEvent", ...payload });
  }

  return { pushVirtualPageview, pushProductImpression, pushProductClick, pushGAEvent };
}
