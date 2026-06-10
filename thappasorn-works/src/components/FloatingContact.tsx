"use client";
import { useEffect, useState } from "react";
import { track } from "@/lib/analytics";
import { LINE_URL, EMAIL, PHONE_RAW } from "@/lib/utils";

export default function FloatingContact() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const close = () => setOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);
  const items = [
    { label: "LINE", href: LINE_URL, ext: true, ev: "line_click", line: true },
    { label: PHONE_RAW, href: `tel:${PHONE_RAW}`, ev: "phone_click" },
    { label: "Email", href: `mailto:${EMAIL}`, ev: "email_click" },
  ];
  return (
    <div className="fixed bottom-5 right-5 z-[4000] flex flex-col items-end gap-3" onClick={(e) => e.stopPropagation()}>
      <div className={`flex flex-col items-end gap-3 transition-all duration-300 ${open ? "opacity-100" : "pointer-events-none translate-y-3 opacity-0"}`}>
        {items.map((it) => (
          <a key={it.label} href={it.href} target={it.ext ? "_blank" : undefined} rel="noopener" onClick={() => track(it.ev)} className="flex items-center gap-3">
            <span className="rounded-full border border-white/10 bg-surface px-3.5 py-2 text-[13px] font-semibold shadow-lg">{it.label}</span>
            <span className={`grid h-12 w-12 place-items-center rounded-full border transition-all hover:scale-110 ${it.line ? "border-[#06C755] bg-[#06C755] text-white" : "border-white/10 bg-surface text-ink hover:border-accent hover:bg-accent hover:text-bg"}`}>
              {it.line ? <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M12 3C6.48 3 2 6.62 2 11.08c0 3.99 3.55 7.33 8.35 7.97.32.07.77.21.88.49.1.25.07.64.03.9l-.14.85c-.04.25-.2.99.86.54 1.07-.45 5.74-3.38 7.83-5.79C21.13 14.39 22 12.84 22 11.08 22 6.62 17.52 3 12 3z"/></svg>
                : it.label === "Email" ? <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}><path d="M4 4h16v16H4z"/><path d="M4 6l8 6 8-6"/></svg>
                : <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg>}
            </span>
          </a>
        ))}
      </div>
      <button onClick={() => setOpen((o) => !o)} className="grid h-15 w-15 place-items-center rounded-full bg-accent text-bg shadow-glow transition-transform hover:scale-105" style={{ height: 60, width: 60 }} aria-label="Contact">
        {open ? <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2}><path d="M6 6l12 12M18 6L6 18"/></svg>
          : <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>}
      </button>
    </div>
  );
}
