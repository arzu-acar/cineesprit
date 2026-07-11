export interface VirtualPageviewEvent {
  event: "virtualPageview";
  virtualPageUrl: string;
  virtualPageTitle: string;
  CE_pageCategory: string;
  CE_pageType: string;
  loginState: "logged_in" | "logged_out";
  CE_userTrackingId: string;
}

export interface ImpressionProduct {
  name: string;
  id: string | number;
  brand: string;
  category: string;
  list: string;
  position: number;
}

export interface ProductImpressionEvent {
  event: "productImpression";
  eventCategory: string;
  eventAction: string;
  eventLabel: string;
  ecommerce: {
    impressions: ImpressionProduct[];
  };
}

export interface ClickProduct {
  name: string;
  id: string | number;
  brand: string;
  category: string;
  list: string;
  position: number;
}

export interface ProductClickEvent {
  event: "productClick";
  eventCategory: string;
  eventAction: string;
  eventLabel: string;
  ecommerce: {
    click: {
      products: ClickProduct[];
    };
  };
}

export interface GAEvent {
  event: "GAEvent";
  eventCategory: string;
  eventAction: string;
  eventLabel: string;
}

export type DataLayerEvent =
  | VirtualPageviewEvent
  | ProductImpressionEvent
  | ProductClickEvent
  | GAEvent;

