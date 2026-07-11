"use client";

import { useState } from "react";
import { saveOnboarding } from "@/app/onboarding/actions";

type SelectableItem = {
  id: string;
  label: string;
  meta?: string;
};

const CATEGORIES: SelectableItem[] = [
  { id: "auteur", label: "Auteur", meta: "Yönetmen sineması" },
  { id: "bagimsiz", label: "Bağımsız", meta: "Indie & arthouse" },
  { id: "deneysel", label: "Deneysel", meta: "Avant-garde" },
  { id: "belgesel", label: "Belgesel", meta: "Gerçeklik & gözlem" },
  { id: "festival", label: "Festival", meta: "Cannes, Berlin, Venice" },
  { id: "animasyon", label: "Animasyon", meta: "Sanatsal animasyon" },
];

const COUNTRIES: SelectableItem[] = [
  { id: "fr", label: "Fransa" },
  { id: "it", label: "İtalya" },
  { id: "jp", label: "Japonya" },
  { id: "kr", label: "Güney Kore" },
  { id: "ir", label: "İran" },
  { id: "ro", label: "Romanya" },
  { id: "de", label: "Almanya" },
  { id: "ru", label: "Rusya" },
  { id: "cn", label: "Çin" },
  { id: "tr", label: "Türkiye" },
  { id: "us", label: "ABD" },
  { id: "gb", label: "İngiltere" },
];

const DIRECTORS: SelectableItem[] = [
  { id: "bergman", label: "Ingmar Bergman" },
  { id: "godard", label: "Jean-Luc Godard" },
  { id: "tarkovsky", label: "Andrei Tarkovsky" },
  { id: "kubrick", label: "Stanley Kubrick" },
  { id: "fellini", label: "Federico Fellini" },
  { id: "kurosawa", label: "Akira Kurosawa" },
  { id: "lynch", label: "David Lynch" },
  { id: "wong", label: "Wong Kar-wai" },
  { id: "kiarostami", label: "Abbas Kiarostami" },
  { id: "haneke", label: "Michael Haneke" },
  { id: "mungiu", label: "Cristian Mungiu" },
  { id: "ceylan", label: "Nuri Bilge Ceylan" },
];

const STEPS = [
  { key: "categories", title: "Hangi türleri seviyorsun?", subtitle: "İstediğin kadar seç.", items: CATEGORIES },
  { key: "countries", title: "Hangi sinemaları keşfetmek istersin?", subtitle: "Ülke sinemaları.", items: COUNTRIES },
  { key: "directors", title: "Favori yönetmenler?", subtitle: "Beğendiğin isimleri seç.", items: DIRECTORS },
] as const;

type StepKey = typeof STEPS[number]["key"];

export function OnboardingForm() {
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState<Record<StepKey, string[]>>({
    categories: [],
    countries: [],
    directors: [],
  });
  const [isPending, setIsPending] = useState(false);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const selected = selections[current.key];

  function toggle(id: string) {
    setSelections((prev) => {
      const cur = prev[current.key];
      return {
        ...prev,
        [current.key]: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id],
      };
    });
  }

  async function handleNext() {
    if (isLast) {
      setIsPending(true);
      await saveOnboarding(selections);
    } else {
      setStep((s) => s + 1);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-6 border-b border-ce-border">
        <span className="font-serif italic text-[20px] text-ce-text">CineEsprit</span>
        <span className="font-mono text-[10px] tracking-[0.2em] text-ce-muted uppercase">
          KURULUM · TERCİHLER
        </span>
      </header>

      {/* Progress */}
      <div className="flex gap-1 px-8 pt-6">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className="h-[2px] flex-1 transition-colors duration-300"
            style={{ background: i <= step ? "#d8ff3e" : "#242424" }}
          />
        ))}
      </div>

      {/* Content */}
      <main className="flex-1 flex flex-col justify-center px-8 py-12 max-w-3xl mx-auto w-full">
        <p className="mb-2 font-mono text-[10px] tracking-[0.2em] text-ce-muted uppercase">
          Adım {step + 1} / {STEPS.length}
        </p>
        <h1 className="mb-2 font-serif italic text-[42px] leading-[1.1] text-ce-text">
          {current.title}
        </h1>
        <p className="mb-10 text-[14px] text-ce-text-secondary">{current.subtitle}</p>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {current.items.map((item) => {
            const isSelected = selected.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggle(item.id)}
                className="text-left border px-5 py-5 transition-colors duration-150"
                style={{
                  background: isSelected ? "rgba(216,255,62,0.06)" : "#0d0d0d",
                  borderColor: isSelected ? "#d8ff3e" : "#242424",
                }}
              >
                <span
                  className="block font-serif italic text-[18px] leading-none mb-1"
                  style={{ color: isSelected ? "#d8ff3e" : "#e8e8e6" }}
                >
                  {item.label}
                </span>
                {item.meta && (
                  <span className="block font-mono text-[10px] tracking-[0.1em] text-ce-muted">
                    {item.meta}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div className="mt-10 flex items-center gap-4">
          <button
            type="button"
            onClick={handleNext}
            disabled={isPending}
            className="bg-ce-accent text-ce-bg font-sans font-medium text-[13px] tracking-[0.04em] px-8 py-4 transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? "Kaydediliyor..." : isLast ? "Tamamla" : "Devam Et →"}
          </button>

          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="font-mono text-[11px] tracking-[0.12em] text-ce-muted uppercase hover:text-ce-text transition-colors"
            >
              ← Geri
            </button>
          )}

          <button
            type="button"
            onClick={isLast ? handleNext : () => setStep((s) => s + 1)}
            disabled={isPending}
            className="ml-auto font-mono text-[10px] tracking-[0.14em] text-[#444] uppercase hover:text-ce-muted transition-colors"
          >
            Atla
          </button>
        </div>
      </main>
    </div>
  );
}
