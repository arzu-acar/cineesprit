"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useDataLayer } from "@hooks/useDataLayer";

type PageMeta = {
  title: string;
  category: string;
  type: string;
};

function resolvePageMeta(pathname: string): PageMeta {
  if (pathname === "/") {
    return { title: "Ana Sayfa", category: "Home", type: "homepage" };
  }
  if (/^\/films\/\d+/.test(pathname)) {
    return { title: "Film Detay", category: "Film Detail", type: "detail" };
  }
  if (pathname.startsWith("/films")) {
    return { title: "Film Listesi", category: "Film List", type: "listing" };
  }
  if (/^\/festivals\/[^/]+/.test(pathname)) {
    return { title: "Festival Detay", category: "Festival", type: "detail" };
  }
  if (pathname.startsWith("/festivals")) {
    return { title: "Festival Takvimi", category: "Festival", type: "listing" };
  }
  if (pathname.startsWith("/profile")) {
    return { title: "Profil", category: "User", type: "profile" };
  }
  return { title: "Sayfa", category: "Other", type: "other" };
}

type Props = {
  isLoggedIn: boolean;
  userId: string;
};

export function VirtualPageviewTracker({ isLoggedIn, userId }: Props) {
  const pathname = usePathname();
  const { pushVirtualPageview } = useDataLayer();

  useEffect(() => {
    const { title, category, type } = resolvePageMeta(pathname);
    pushVirtualPageview({
      virtualPageUrl: pathname,
      virtualPageTitle: title,
      CE_pageCategory: category,
      CE_pageType: type,
      loginState: isLoggedIn ? "logged_in" : "logged_out",
      CE_userTrackingId: userId,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return null;
}
