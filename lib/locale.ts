import { headers } from "next/headers";

export async function getLocaleFromHeaders(): Promise<"tr" | "en"> {
  const h = await headers();
  const path = h.get("x-pathname") ?? "";
  const seg = path.split("/")[1];
  return seg === "en" ? "en" : "tr";
}

// With localePrefix: "as-needed", default locale (tr) has no prefix.
export function localePath(locale: "tr" | "en", path: string): string {
  const prefix = locale === "en" ? "/en" : "";
  return `${prefix}${path}`;
}
