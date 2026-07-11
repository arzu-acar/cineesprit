"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { curateFilm } from "./actions";

const inputCls =
  "w-full border border-[#333] bg-[#0d0d0d] px-4 py-3 font-mono text-[13px] text-white outline-none focus:border-[#555] transition-colors";
const labelCls =
  "block mb-2 font-mono text-[10px] tracking-[0.16em] text-ce-muted uppercase";

export function FilmCurateForm() {
  const [tmdbId, setTmdbId] = useState("");
  const [preview, setPreview] = useState<{ title: string; year: string; poster: string } | null>(null);
  const [checking, setChecking] = useState(false);
  const [previewError, setPreviewError] = useState("");

  async function checkTmdb() {
    if (!tmdbId.trim()) return;
    setChecking(true);
    setPreviewError("");
    setPreview(null);
    try {
      const res = await fetch(
        `/api/tmdb/preview?id=${encodeURIComponent(tmdbId)}`
      );
      if (!res.ok) throw new Error("Film bulunamadı.");
      const data = await res.json();
      setPreview(data);
    } catch (e) {
      setPreviewError(e instanceof Error ? e.message : "Hata oluştu.");
    } finally {
      setChecking(false);
    }
  }

  return (
    <form action={curateFilm} className="space-y-6">
      {/* TMDB ID */}
      <div>
        <label className={labelCls}>TMDB Film ID</label>
        <div className="flex gap-2">
          <input
            name="tmdb_id"
            type="number"
            placeholder="örn. 496243"
            required
            value={tmdbId}
            onChange={(e) => setTmdbId(e.target.value)}
            className={inputCls + " flex-1"}
            style={{ color: "#fff" }}
          />
          <button
            type="button"
            onClick={checkTmdb}
            disabled={checking || !tmdbId}
            className="border border-[#333] bg-[#141414] px-5 font-mono text-[10px] tracking-[0.12em] text-ce-muted uppercase hover:border-[#555] hover:text-ce-text transition-colors disabled:opacity-40"
          >
            {checking ? "..." : "Önizle"}
          </button>
        </div>
        <p className="mt-1 font-mono text-[10px] text-ce-muted">
          tmdb.org/movie/[ID] adresinden bulabilirsin
        </p>
      </div>

      {/* Preview */}
      {previewError && (
        <p className="font-mono text-[11px] text-[#e0563e]">{previewError}</p>
      )}
      {preview && (
        <div className="flex items-center gap-4 border border-ce-accent bg-[rgba(216,255,62,0.04)] px-4 py-4">
          {preview.poster && (
            <img src={preview.poster} alt={preview.title} className="w-12 h-auto border border-ce-border" />
          )}
          <div>
            <p className="font-serif italic text-[17px] text-ce-text">{preview.title}</p>
            <p className="font-mono text-[10px] text-ce-muted">{preview.year}</p>
          </div>
          <span className="ml-auto font-mono text-[9px] text-ce-accent uppercase tracking-widest">✓ Doğrulandı</span>
        </div>
      )}

      {/* Curator note */}
      <div>
        <label className={labelCls}>Kürasyon Notu</label>
        <textarea
          name="curator_note"
          rows={3}
          placeholder="Bu filmi neden seçtiniz?"
          className={inputCls + " resize-none"}
          style={{ color: "#fff" }}
        />
      </div>

      {/* Tags */}
      <div>
        <label className={labelCls}>Etiketler</label>
        <input
          name="tags"
          type="text"
          placeholder="auteur, minimalist, distopya (virgülle ayır)"
          className={inputCls}
          style={{ color: "#fff" }}
        />
      </div>

      {/* Featured */}
      <div className="flex items-center gap-3">
        <input
          id="featured"
          name="featured"
          type="checkbox"
          className="w-4 h-4 accent-[#d8ff3e]"
        />
        <label htmlFor="featured" className="font-mono text-[11px] tracking-[0.1em] text-ce-muted uppercase cursor-pointer">
          Ana sayfada öne çıkar
        </label>
      </div>

      <div className="flex gap-3 pt-2">
        <SubmitButton label="Filmi Kaydet" />
        <a
          href="/admin/films"
          className="border border-ce-border px-6 py-4 font-mono text-[11px] tracking-[0.1em] text-ce-muted uppercase hover:border-[#333] hover:text-ce-text transition-colors"
        >
          İptal
        </a>
      </div>
    </form>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-ce-accent text-ce-bg font-sans font-medium text-[13px] px-8 py-4 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? "Kaydediliyor..." : label}
    </button>
  );
}
