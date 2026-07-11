import Link from "next/link";
import { NavBar } from "@components/NavBar";

export default function FestivalNotFound() {
  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-7xl px-6 py-32 text-center">
        <p className="mb-4 font-mono text-[11px] tracking-[0.2em] text-ce-accent uppercase">
          404
        </p>
        <h1 className="mb-4 font-serif text-[42px] italic text-ce-text">
          Festival bulunamadı.
        </h1>
        <p className="mb-10 text-[14px] text-ce-text-secondary">
          Bu festival takvimde mevcut değil ya da kaldırılmış olabilir.
        </p>
        <Link
          href="/festivals"
          className="border border-ce-border px-6 py-3 font-mono text-[11px] tracking-[0.14em] text-ce-muted uppercase hover:border-[#3a3a3a] hover:text-ce-text transition-colors"
        >
          ← Takvime Dön
        </Link>
      </main>
    </>
  );
}
