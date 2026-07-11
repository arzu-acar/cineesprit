"use client";

import { useState, useTransition } from "react";
import { deleteUser } from "./actions";

export function DeleteUserButton({ userId, email }: { userId: string; email?: string }) {
  const [showModal, setShowModal] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      await deleteUser(userId);
      setShowModal(false);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="font-mono text-[10px] tracking-[0.1em] text-[#e0563e] uppercase hover:opacity-70 transition-opacity"
      >
        Sil
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => !isPending && setShowModal(false)}
          />

          {/* Modal */}
          <div className="relative z-10 w-full max-w-[420px] border border-[#333] bg-[#0d0d0d] p-8">
            {/* İkon */}
            <div className="mb-5 flex h-10 w-10 items-center justify-center border border-[#e0563e]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e0563e" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14H6L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4h6v2" />
              </svg>
            </div>

            <h2 className="mb-2 font-serif italic text-[22px] text-ce-text">
              Kullanıcıyı sil
            </h2>
            <p className="mb-1 text-[13px] text-ce-text-secondary">
              Bu işlem geri alınamaz. Aşağıdaki kullanıcı ve tüm verileri kalıcı olarak silinecek:
            </p>
            <p className="mb-6 font-mono text-[11px] text-[#e0563e] break-all">
              {email ?? userId}
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isPending}
                className="flex-1 bg-[#e0563e] text-white font-sans font-medium text-[13px] py-3 hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isPending ? "Siliniyor..." : "Evet, sil"}
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                disabled={isPending}
                className="flex-1 border border-ce-border text-ce-muted font-mono text-[11px] tracking-[0.1em] uppercase py-3 hover:border-[#333] hover:text-ce-text transition-colors disabled:opacity-50"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
