import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";

const mockPushDataLayer = vi.fn();

vi.mock("@lib/gtm/events", () => ({
  pushDataLayer: (...args: unknown[]) => mockPushDataLayer(...args),
}));

import { useDataLayer } from "../useDataLayer";

beforeEach(() => {
  mockPushDataLayer.mockClear();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("useDataLayer", () => {
  describe("pushVirtualPageview", () => {
    it("pushes virtualPageview event with correct shape", () => {
      const { result } = renderHook(() => useDataLayer());
      result.current.pushVirtualPageview({
        virtualPageUrl: "/films/1",
        virtualPageTitle: "Mulholland Drive",
        CE_pageCategory: "film",
        CE_pageType: "detail",
        loginState: "logged_out",
        CE_userTrackingId: "anon",
      });

      expect(mockPushDataLayer).toHaveBeenCalledWith({
        event: "virtualPageview",
        virtualPageUrl: "/films/1",
        virtualPageTitle: "Mulholland Drive",
        CE_pageCategory: "film",
        CE_pageType: "detail",
        loginState: "logged_out",
        CE_userTrackingId: "anon",
      });
    });
  });

  describe("pushProductImpression", () => {
    it("pushes productImpression event with impressions array", () => {
      const { result } = renderHook(() => useDataLayer());
      const product = { name: "Eraserhead", id: 42, brand: "Lynch", category: "auteur", list: "featured", position: 1 };

      result.current.pushProductImpression([product], "Eraserhead");

      expect(mockPushDataLayer).toHaveBeenCalledWith({
        event: "productImpression",
        eventCategory: "Ecommerce",
        eventAction: "Product Impression",
        eventLabel: "Eraserhead",
        ecommerce: { impressions: [product] },
      });
    });

    it("uses empty string as default label", () => {
      const { result } = renderHook(() => useDataLayer());
      result.current.pushProductImpression([]);

      expect(mockPushDataLayer).toHaveBeenCalledWith(
        expect.objectContaining({ eventLabel: "" })
      );
    });
  });

  describe("pushProductClick", () => {
    it("pushes productClick event with products array", () => {
      const { result } = renderHook(() => useDataLayer());
      const product = { name: "Lost Highway", id: 7, brand: "Lynch", category: "deneysel", list: "search", position: 2 };

      result.current.pushProductClick([product], "Lost Highway");

      expect(mockPushDataLayer).toHaveBeenCalledWith({
        event: "productClick",
        eventCategory: "Ecommerce",
        eventAction: "Product Click",
        eventLabel: "Lost Highway",
        ecommerce: { click: { products: [product] } },
      });
    });

    it("uses empty string as default label", () => {
      const { result } = renderHook(() => useDataLayer());
      result.current.pushProductClick([]);

      expect(mockPushDataLayer).toHaveBeenCalledWith(
        expect.objectContaining({ eventLabel: "" })
      );
    });
  });

  describe("pushGAEvent", () => {
    it("pushes GAEvent with correct shape", () => {
      const { result } = renderHook(() => useDataLayer());
      result.current.pushGAEvent({
        eventCategory: "Film",
        eventAction: "Watch",
        eventLabel: "Mulholland Drive",
      });

      expect(mockPushDataLayer).toHaveBeenCalledWith({
        event: "GAEvent",
        eventCategory: "Film",
        eventAction: "Watch",
        eventLabel: "Mulholland Drive",
      });
    });
  });
});
