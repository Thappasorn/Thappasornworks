"use client";
import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { useTranslations } from "next-intl";

function Counter({ to }: { to: number }) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  useEffect(() => {
    if (!inView) return;
    let raf = 0; const start = performance.now(); const dur = 1100;
    const tick = (t: number) => {
      const p = Math.min((t - start) / dur, 1);
      setN(Math.floor((1 - Math.pow(1 - p, 3)) * to));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);
  return <div ref={ref} className="h-display text-[clamp(34px,5vw,60px)] leading-none">{n}{to >= 100 ? "" : "+"}</div>;
}

export default function Stats() {
  const t = useTranslations("stats");
  const items = [["projects", 248], ["clients", 96], ["countries", 14], ["years", 11]] as const;
  return (
    <div className="container-x grid grid-cols-2 gap-x-6 gap-y-10 border-y border-white/5 py-14 md:grid-cols-4">
      {items.map(([k, v]) => (
        <div key={k}>
          <Counter to={v} />
          <div className="mt-2 text-[13px] font-medium uppercase tracking-wider text-accent/90">{t(k)}</div>
        </div>
      ))}
    </div>
  );
}
