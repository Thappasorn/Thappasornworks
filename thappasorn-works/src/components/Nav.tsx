"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import LanguageSwitcher from "./LanguageSwitcher";

const LINKS = [
  { href: "/", key: "home" },
  { href: "/graphics", key: "graphics" },
  { href: "/shot-videos", key: "shorts" },
  { href: "/long-form-video", key: "longs" },
  { href: "/filming-photography", key: "photo" },
  { href: "/#contact", key: "contact" },
] as const;

export default function Nav() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => setOpen(false), [pathname]);

  return (
    <nav className={`fixed inset-x-0 top-0 z-[1000] flex items-center justify-between px-5 py-3 transition-all duration-500 sm:px-8 lg:px-12 ${scrolled ? "border-b border-white/5 bg-bg/70 backdrop-blur-xl" : ""}`}>
      <Link href="/" className="h-display flex items-center gap-2 text-[17px] text-white">
        <span className="h-2.5 w-2.5 rounded-full bg-accent shadow-[0_0_12px_#FF6B00]" />
        THAPPASORN WORKS
      </Link>

      <div className="hidden items-center gap-1 md:flex">
        {LINKS.map((l) => (
          <Link key={l.key} href={l.href} className="rounded-full px-3.5 py-2 text-[13.5px] font-medium text-ink/80 transition-colors hover:bg-accent/10 hover:text-accent">
            {t(l.key)}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-2.5">
        <div className="hidden md:block"><LanguageSwitcher /></div>
        <button onClick={() => setOpen((o) => !o)} className="grid h-9 w-9 place-items-center rounded-full border border-white/10 md:hidden" aria-label="Menu">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}><path d="M4 7h16M4 12h16M4 17h16" /></svg>
        </button>
      </div>

      {/* mobile overlay */}
      <div className={`fixed inset-0 z-[999] flex flex-col items-center justify-center gap-3 bg-bg/95 backdrop-blur-2xl transition-all duration-300 md:hidden ${open ? "visible opacity-100" : "invisible opacity-0"}`}>
        <button onClick={() => setOpen(false)} className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full border border-white/10" aria-label="Close">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
        {LINKS.map((l) => (
          <Link key={l.key} href={l.href} className="h-display text-3xl text-ink hover:text-accent">{t(l.key)}</Link>
        ))}
        <div className="mt-6 scale-125"><LanguageSwitcher /></div>
      </div>
    </nav>
  );
}
