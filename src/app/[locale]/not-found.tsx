import Link from "next/link";
import { NavBar } from "@components/NavBar";

export default function NotFound() {
  return (
    <>
      <NavBar />
      <main className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
        <div className="relative mb-10">
          <svg
            viewBox="0 0 300 300"
            className="w-[220px] h-[220px]"
            aria-hidden="true"
          >
            <circle
              cx="150"
              cy="150"
              r="130"
              fill="none"
              stroke="#2e2e2e"
              strokeWidth="2"
            />
            <text
              x="150"
              y="210"
              fontFamily="Georgia, serif"
              fontStyle="italic"
              fontSize="200"
              fill="#d8ff3e"
              textAnchor="middle"
            >
              4
            </text>
          </svg>
        </div>

        <p className="mb-3 font-mono text-[11px] tracking-[0.22em] text-[#6a6a68] uppercase">
          404 · Reel Missing
        </p>
        <h1 className="mb-6 font-serif text-[32px] italic leading-[1.2] text-ce-text">
          Bu sahneyi bulamadık.
        </h1>
        <p className="mb-10 max-w-sm text-[14px] leading-[1.75] text-ce-text-secondary">
          Aradığın sayfa mevcut değil ya da taşınmış olabilir.
        </p>
        <Link
          href="/"
          className="font-mono text-[11px] tracking-[0.16em] text-ce-accent uppercase hover:opacity-75 transition-opacity"
        >
          ← Ana Sayfaya Dön
        </Link>
      </main>
    </>
  );
}
