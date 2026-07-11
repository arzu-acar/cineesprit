"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { useTransition } from "react";

type Props = { currentLocale: string };

export function LocaleSwitcher({ currentLocale }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function switchLocale(next: string) {
    startTransition(() => {
      router.replace(pathname, { locale: next as "tr" | "en" });
    });
  }

  const other = currentLocale === "tr" ? "en" : "tr";

  return (
    <button
      onClick={() => switchLocale(other)}
      disabled={isPending}
      className="font-mono text-[11px] tracking-[0.14em] text-ce-muted uppercase transition-colors hover:text-ce-text disabled:opacity-50"
    >
      {other.toUpperCase()}
    </button>
  );
}
