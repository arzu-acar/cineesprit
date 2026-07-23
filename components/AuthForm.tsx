"use client";

import { useState } from "react";
import { signInWithEmail, signUpWithEmail, signInWithGoogle } from "@/app/auth/actions";

type AuthFormProps = {
  initialMode?: "login" | "register";
  initialEmail?: string;
  error?: string;
  success?: string;
  next?: string;
};

type PasswordRules = {
  minLength: boolean;
  hasUppercase: boolean;
  hasNumber: boolean;
};

function validatePassword(password: string): PasswordRules {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  };
}

function allValid(rules: PasswordRules) {
  return rules.minLength && rules.hasUppercase && rules.hasNumber;
}

export function AuthForm({
  initialMode = "login",
  initialEmail = "",
  error,
  success,
  next = "",
}: AuthFormProps) {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [password, setPassword] = useState("");
  const [passwordTouched, setPasswordTouched] = useState(false);
  const isLogin = mode === "login";

  const rules = validatePassword(password);
  const showRules = !isLogin && passwordTouched && password.length > 0;

  const inputClass =
    "w-full border-none outline-none text-[14px] [&:-webkit-autofill]:[box-shadow:0_0_0_1000px_#141414_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:#ffffff]";
  const fieldClass =
    "border border-[#333333] bg-[#141414] px-4 py-[13px] focus-within:border-[#555555] transition-colors";
  const labelClass =
    "mb-[9px] block font-mono text-[10px] tracking-[0.14em] text-ce-muted uppercase";

  function handleSubmit(action: (fd: FormData) => Promise<void>) {
    return async (formData: FormData) => {
      if (!isLogin && !allValid(rules)) return;
      await action(formData);
    };
  }

  return (
    <div className="w-full max-w-[380px]">
      {/* Tab switch */}
      <div className="mb-9 flex border border-ce-border overflow-hidden">
        <button
          type="button"
          onClick={() => { setMode("login"); setPassword(""); setPasswordTouched(false); }}
          className={`flex-1 font-mono text-[11px] tracking-[0.14em] py-[13px] transition-colors ${
            isLogin ? "bg-ce-accent text-ce-bg" : "bg-transparent text-[#8a8a88]"
          }`}
        >
          GİRİŞ
        </button>
        <button
          type="button"
          onClick={() => { setMode("register"); setPassword(""); setPasswordTouched(false); }}
          className={`flex-1 font-mono text-[11px] tracking-[0.14em] py-[13px] transition-colors ${
            !isLogin ? "bg-ce-accent text-ce-bg" : "bg-transparent text-[#8a8a88]"
          }`}
        >
          KAYIT OL
        </button>
      </div>

      <h1 className="mb-2 font-serif text-[32px] italic font-normal leading-none text-ce-text">
        {isLogin ? "Tekrar hoş geldin" : "Hesap oluştur"}
      </h1>
      <p className="mb-8 text-[13px] text-ce-text-secondary">
        {isLogin ? "Kaldığın yerden devam et." : "Sinematek arşivine katıl, ücretsiz."}
      </p>

      {/* Error banner */}
      {error && (
        <div className="mb-6 flex items-start gap-3 border border-[#e0563e] bg-[rgba(224,86,62,0.08)] px-4 py-3">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#e0563e" strokeWidth="2" className="mt-[1px] shrink-0">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="13" /><circle cx="12" cy="16.5" r="0.6" fill="#e0563e" />
          </svg>
          <span className="text-[12.5px] text-[#e88a78] leading-[1.4]">{error}</span>
        </div>
      )}

      {/* Success banner */}
      {success === "confirm" && (
        <div className="mb-6 border border-ce-accent bg-[rgba(216,255,62,0.06)] px-4 py-3">
          <p className="text-[12.5px] text-ce-accent leading-[1.5]">
            Kayıt başarılı! E-postanı kontrol et ve hesabını doğrula.
          </p>
        </div>
      )}

      <form action={handleSubmit(isLogin ? signInWithEmail : signUpWithEmail)} className="space-y-4">
        {next && <input type="hidden" name="next" value={next} />}
        {/* Email */}
        <div>
          <label className={labelClass}>E-Posta</label>
          <div className={fieldClass}>
            <input
              name="email"
              type="email"
              defaultValue={initialEmail}
              placeholder="ornek@sinema.com"
              required
              autoComplete="email"
              className={inputClass}
              style={{ background: "#141414", color: "#ffffff" }}
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className={labelClass}>Şifre</label>
          <div className={fieldClass}>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setPasswordTouched(true)}
              autoComplete={isLogin ? "current-password" : "new-password"}
              className={inputClass}
              style={{ background: "#141414", color: "#ffffff" }}
            />
          </div>

          {/* Şifre kuralları — sadece kayıt modunda */}
          {showRules && (
            <ul className="mt-3 space-y-[6px]">
              <PasswordRule ok={rules.minLength} label="En az 8 karakter" />
              <PasswordRule ok={rules.hasUppercase} label="En az 1 büyük harf" />
              <PasswordRule ok={rules.hasNumber} label="En az 1 rakam" />
            </ul>
          )}

          {/* Kayıt modunda submit denendi ama kurallar sağlanmadı */}
          {!isLogin && passwordTouched && password.length > 0 && !allValid(rules) && (
            <p className="mt-2 font-mono text-[10px] tracking-[0.1em] text-[#e0563e]">
              Şifre koşulları sağlanmadan devam edilemez.
            </p>
          )}
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={!isLogin && passwordTouched && password.length > 0 && !allValid(rules)}
            className="w-full bg-ce-accent text-ce-bg font-sans font-medium text-[13px] tracking-[0.04em] py-[15px] transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isLogin ? "Giriş Yap" : "Kayıt Ol"}
          </button>
        </div>
      </form>

      {/* Divider */}
      <div className="my-7 flex items-center gap-4">
        <div className="flex-1 h-px bg-[#1c1c1c]" />
        <span className="font-mono text-[9px] tracking-[0.16em] text-[#4a4a48] uppercase">Veya</span>
        <div className="flex-1 h-px bg-[#1c1c1c]" />
      </div>

      {/* Google */}
      <form action={signInWithGoogle}>
        {next && <input type="hidden" name="next" value={next} />}
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-3 border border-[#2e2e2e] bg-transparent text-ce-text font-medium text-[13px] py-[14px] transition-colors hover:border-[#3a3a3a]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12 11v3.2h4.5c-.2 1.2-1.4 3.5-4.5 3.5-2.7 0-4.9-2.2-4.9-5s2.2-5 4.9-5c1.5 0 2.6.7 3.2 1.2l2.2-2.1C16.1 3.6 14.3 3 12 3 6.9 3 3 6.9 3 12s3.9 9 9 9c5.2 0 8.6-3.6 8.6-8.8 0-.6 0-1-.2-1.2H12z" />
          </svg>
          Google ile devam et
        </button>
      </form>

      <p className="mt-8 text-center text-[12.5px] text-ce-text-secondary">
        {isLogin ? "Hesabın yok mu? " : "Zaten üye misin? "}
        <button
          type="button"
          onClick={() => { setMode(isLogin ? "register" : "login"); setPassword(""); setPasswordTouched(false); }}
          className="font-mono text-[11px] tracking-[0.06em] text-ce-accent"
        >
          {isLogin ? "KAYIT OL →" : "← GİRİŞ YAP"}
        </button>
      </p>
    </div>
  );
}

function PasswordRule({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2">
      <span
        className="shrink-0 font-mono text-[11px]"
        style={{ color: ok ? "#d8ff3e" : "#555555" }}
      >
        {ok ? "✓" : "○"}
      </span>
      <span
        className="font-mono text-[10px] tracking-[0.08em]"
        style={{ color: ok ? "#d8ff3e" : "#666666" }}
      >
        {label}
      </span>
    </li>
  );
}
