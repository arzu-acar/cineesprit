"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center bg-ce-bg">
      <div className="mb-10">
        <svg
          viewBox="0 0 300 300"
          className="w-[200px] h-[200px]"
          aria-hidden="true"
        >
          <path
            d="M150 60 L40 250 L260 250 Z"
            fill="none"
            stroke="#d8ff3e"
            strokeWidth="8"
            strokeLinejoin="miter"
          />
          <line x1="150" y1="130" x2="150" y2="195" stroke="#d8ff3e" strokeWidth="8" />
          <circle cx="150" cy="220" r="5" fill="#d8ff3e" />
        </svg>
      </div>

      <p className="mb-3 font-mono text-[11px] tracking-[0.22em] text-[#6a6a68] uppercase">
        500 · Server Fault
      </p>
      <h1 className="mb-6 font-serif text-[32px] italic leading-[1.2] text-ce-text">
        Bir şeyler ters gitti.
      </h1>
      <p className="mb-10 max-w-sm text-[14px] leading-[1.75] text-ce-text-secondary">
        Sunucu tarafında beklenmeyen bir hata oluştu. Lütfen tekrar dene.
      </p>
      <div className="flex gap-6">
        <button
          onClick={reset}
          className="font-mono text-[11px] tracking-[0.16em] text-ce-accent uppercase hover:opacity-75 transition-opacity"
        >
          Tekrar Dene →
        </button>
        <Link
          href="/"
          className="font-mono text-[11px] tracking-[0.16em] text-ce-muted uppercase hover:text-ce-accent transition-colors"
        >
          Ana Sayfa
        </Link>
      </div>
    </main>
  );
}
