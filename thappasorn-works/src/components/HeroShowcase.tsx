"use client";

import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

/** Premium owner showcase for the hero's right side.
 *  Portrait: /owner.png (transparent PNG, ~1000×1250 recommended).
 *  Gracefully falls back to a monogram block if the file is missing. */
const CARDS = [
  { label: "Creative Director", x: "-12%", y: "8%", delay: 1.0 },
  { label: "Graphic Design", x: "70%", y: "18%", delay: 1.15 },
  { label: "Video Editing", x: "-16%", y: "48%", delay: 1.3 },
  { label: "Photography", x: "72%", y: "62%", delay: 1.45 },
  { label: "Content Creator", x: "-6%", y: "84%", delay: 1.6 },
];

export default function HeroShowcase({ ownerImage }: { ownerImage?: string | null }) {
  const ref = useRef<HTMLDivElement>(null);
  const [imgOk, setImgOk] = useState(true);

  // mouse parallax
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 18 });
  const sy = useSpring(my, { stiffness: 60, damping: 18 });
  const imgX = useTransform(sx, [-1, 1], [-14, 14]);
  const imgY = useTransform(sy, [-1, 1], [-10, 10]);
  const glowX = useTransform(sx, [-1, 1], [-30, 30]);
  const cardX = useTransform(sx, [-1, 1], [10, -10]);

  function onMove(e: React.MouseEvent) {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set(((e.clientX - r.left) / r.width) * 2 - 1);
    my.set(((e.clientY - r.top) / r.height) * 2 - 1);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => { mx.set(0); my.set(0); }}
      className="relative mx-auto h-[460px] w-full max-w-[420px] select-none sm:h-[540px] lg:h-[640px] lg:max-w-none"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.1, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* volumetric glow stack */}
      <motion.div style={{ x: glowX }} className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 h-[88%] w-[88%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,#FF6B00,transparent_62%)] opacity-35 blur-3xl hero-breathe" />
        <div className="absolute left-[18%] top-[8%] h-[36%] w-[36%] rounded-full bg-[radial-gradient(circle,#FF8A33,transparent_60%)] opacity-30 blur-2xl hero-float" />
        {/* particles */}
        {[...Array(7)].map((_, i) => (
          <span key={i} className="hero-particle" style={{ left: `${12 + i * 12}%`, top: `${15 + ((i * 23) % 65)}%`, animationDelay: `${i * 1.7}s`, animationDuration: `${9 + (i % 4) * 3}s` }} />
        ))}
      </motion.div>

      {/* portrait — overlaps the frame bottom slightly for the editorial look */}
      <motion.div style={{ x: imgX, y: imgY }} className="hero-float-slow absolute inset-x-0 bottom-0 top-[4%]">
        {imgOk ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={ownerImage || "/owner.png"}
            alt="Thappasorn — creative director"
            onError={() => setImgOk(false)}
            className="absolute bottom-[-3%] left-1/2 h-[104%] w-auto max-w-none -translate-x-1/2 object-contain object-bottom [filter:drop-shadow(0_30px_60px_rgba(0,0,0,.55))_drop-shadow(0_0_42px_rgba(255,107,0,.28))]"
          />
        ) : (
          <div className="absolute bottom-0 left-1/2 grid h-[92%] w-[72%] -translate-x-1/2 place-items-center rounded-[28px] border border-accent/25 bg-gradient-to-b from-white/[0.04] to-transparent">
            <span className="h-display bg-gradient-to-b from-white to-white/30 bg-clip-text text-[120px] text-transparent">T</span>
          </div>
        )}
        {/* rim light */}
        <div className="pointer-events-none absolute inset-x-[12%] bottom-0 top-[6%] rounded-full bg-[radial-gradient(ellipse_at_70%_20%,rgba(255,138,51,.16),transparent_55%)]" />
      </motion.div>

      {/* floating expertise cards */}
      <motion.div style={{ x: cardX }} className="pointer-events-none absolute inset-0 hidden sm:block">
        {CARDS.map((c) => (
          <motion.span
            key={c.label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: c.delay, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            style={{ left: c.x, top: c.y, animationDelay: `${c.delay}s` }}
            className="hero-float pointer-events-auto absolute whitespace-nowrap rounded-full border border-accent/30 bg-white/[0.05] px-4 py-2 text-[12px] font-semibold tracking-wide text-ink backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-accent hover:bg-accent/10 hover:shadow-glow-soft"
          >
            {c.label}
          </motion.span>
        ))}
      </motion.div>

      {/* experience badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.75, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="hero-float absolute bottom-[6%] right-[2%] rounded-2xl border border-white/10 bg-black/55 px-5 py-3.5 backdrop-blur-xl shadow-glow-soft"
      >
        <div className="h-display text-[26px] leading-none text-accent">11+</div>
        <div className="mt-1 text-[11px] uppercase tracking-wider text-white/85">Years Experience</div>
      </motion.div>
    </motion.div>
  );
}
