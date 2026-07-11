"use client";

import { useFormStatus } from "react-dom";
import { createFestival, updateFestival } from "./actions";

const inputCls =
  "w-full border border-[#333] bg-[#0d0d0d] px-4 py-3 font-mono text-[13px] text-white outline-none focus:border-[#555] transition-colors";
const labelCls =
  "block mb-2 font-mono text-[10px] tracking-[0.16em] text-ce-muted uppercase";

type FestivalData = {
  id: string;
  name: string;
  country: string;
  location: string;
  start_date: string;
  end_date: string;
  description?: string | null;
  cover_url?: string | null;
};

export function FestivalForm({ festival }: { festival?: FestivalData }) {
  const isEdit = !!festival;
  const action = isEdit
    ? updateFestival.bind(null, festival.id)
    : createFestival;

  return (
    <form action={action} className="space-y-5">
      <div>
        <label className={labelCls}>Festival Adı *</label>
        <input name="name" required defaultValue={festival?.name} placeholder="Cannes Film Festivali" className={inputCls} style={{ color: "#fff" }} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Ülke *</label>
          <input name="country" required defaultValue={festival?.country} placeholder="Fransa" className={inputCls} style={{ color: "#fff" }} />
        </div>
        <div>
          <label className={labelCls}>Konum *</label>
          <input name="location" required defaultValue={festival?.location} placeholder="Cannes, Côte d'Azur" className={inputCls} style={{ color: "#fff" }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Başlangıç Tarihi *</label>
          <input name="start_date" type="date" required defaultValue={festival?.start_date} className={inputCls} style={{ color: "#fff", colorScheme: "dark" }} />
        </div>
        <div>
          <label className={labelCls}>Bitiş Tarihi *</label>
          <input name="end_date" type="date" required defaultValue={festival?.end_date} className={inputCls} style={{ color: "#fff", colorScheme: "dark" }} />
        </div>
      </div>

      <div>
        <label className={labelCls}>Açıklama</label>
        <textarea
          name="description"
          rows={3}
          defaultValue={festival?.description ?? ""}
          placeholder="Festival hakkında kısa bilgi..."
          className={inputCls + " resize-none"}
          style={{ color: "#fff" }}
        />
      </div>

      <div>
        <label className={labelCls}>Kapak Görseli URL</label>
        <input
          name="cover_url"
          type="url"
          defaultValue={festival?.cover_url ?? ""}
          placeholder="https://..."
          className={inputCls}
          style={{ color: "#fff" }}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <SubmitButton label={isEdit ? "Güncelle" : "Festival Ekle"} />
        <a
          href="/admin/festivals"
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
