"use client";

import { useEffect, useState } from "react";

type Mode = "light" | "dark" | "system";

function apply(mode: Mode) {
  const sysDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const dark = mode === "dark" || (mode === "system" && sysDark);
  document.documentElement.classList.toggle("dark", dark);
}

export default function ThemeToggle() {
  const [mode, setMode] = useState<Mode>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = (localStorage.getItem("theme") as Mode) || "system";
    setMode(saved);
    apply(saved);
    // keep "system" in sync if the OS theme changes live
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => { if ((localStorage.getItem("theme") || "system") === "system") apply("system"); };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  function choose(next: Mode) {
    setMode(next);
    localStorage.setItem("theme", next);
    apply(next);
  }

  // cycle: light -> dark -> system -> light
  const order: Mode[] = ["light", "dark", "system"];
  const next = order[(order.indexOf(mode) + 1) % order.length];

  const icon =
    mode === "light" ? (
      <path d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.07 6.07-1.41-1.41M7.34 7.34 5.93 5.93m12.14 0-1.41 1.41M7.34 16.66l-1.41 1.41M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />
    ) : mode === "dark" ? (
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    ) : (
      <path d="M4 5h16v10H4zM2 19h20M9 19v2m6-2v2" />
    );

  const label = mounted ? (mode === "light" ? "Light" : mode === "dark" ? "Dark" : "System") : "";

  return (
    <button
      onClick={() => choose(next)}
      aria-label={`Theme: ${label}. Click for ${next}.`}
      title={`Theme: ${label} (click to switch)`}
      className="grid h-9 w-9 place-items-center rounded-full border border-ink/15 text-ink/80 transition-all duration-300 hover:border-accent hover:text-accent"
    >
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        {icon}
      </svg>
    </button>
  );
}
