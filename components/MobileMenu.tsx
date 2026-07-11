"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "./LocaleSwitcher";

type NavLink = { label: string; href: "/films" | "/festivals" | "/auth" | "/profile" };

type MobileMenuProps = {
  navLinks: NavLink[];
  loginLabel: string;
  userSlug?: string;
  currentLocale: string;
};

export function MobileMenu({ navLinks, loginLabel, userSlug, currentLocale }: MobileMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
        className="flex flex-col justify-center gap-[5px] p-1"
      >
        <span
          className={`block h-px w-6 bg-ce-text transition-transform duration-200 ${open ? "translate-y-[6px] rotate-45" : ""}`}
        />
        <span
          className={`block h-px w-6 bg-ce-text transition-opacity duration-200 ${open ? "opacity-0" : ""}`}
        />
        <span
          className={`block h-px w-6 bg-ce-text transition-transform duration-200 ${open ? "-translate-y-[6px] -rotate-45" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 w-full border-b border-ce-border bg-ce-bg/95 backdrop-blur-sm">
          <ul className="mx-auto flex max-w-7xl flex-col px-4 py-6 gap-6">
            {navLinks.map(({ label, href }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setOpen(false)}
                  className="font-mono text-[13px] tracking-[0.14em] text-ce-muted uppercase transition-colors hover:text-ce-text"
                >
                  {label}
                </Link>
              </li>
            ))}
            <li>
              {userSlug ? (
                <Link
                  href="/profile"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 font-mono text-[13px] tracking-[0.14em] text-ce-accent uppercase"
                >
                  <span className="inline-block h-2 w-2 rounded-full bg-ce-accent" />
                  {userSlug}
                </Link>
              ) : (
                <Link
                  href="/auth"
                  onClick={() => setOpen(false)}
                  className="font-mono text-[13px] tracking-[0.14em] text-ce-muted uppercase transition-colors hover:text-ce-text"
                >
                  {loginLabel}
                </Link>
              )}
            </li>
            <li>
              <LocaleSwitcher currentLocale={currentLocale} />
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
