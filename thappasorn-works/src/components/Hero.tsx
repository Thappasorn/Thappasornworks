"use client";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import HeroShowcase from "./HeroShowcase";
import HeroBackdrop from "./HeroBackdrop";

export default function Hero({ showreelUrl }: { showreelUrl?: string | null }) {
  const t = useTranslations("hero");
  const line = { hidden: { y: "110%" }, show: (i: number) => ({ y: 0, transition: { duration: 1, ease: [0.22, 1, 0.36, 1], delay: i * 0.12 } }) };
  return (
    <header className="relative flex min-h-[100svh] items-center overflow-hidden px-5 sm:px-8 lg:px-12">
      <HeroBackdrop url={showreelUrl} />
      {/* cinematic animated backdrop (fallback / accent glow) */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-[8vw] -top-[6vw] h-[55vw] w-[55vw] rounded-full bg-[radial-gradient(circle,#FF6B00,transparent_60%)] opacity-30 blur-3xl" />
        <div className="absolute -right-[6vw] top-[8vw] h-[46vw] w-[46vw] rounded-full bg-[radial-gradient(circle,#FF8A33,transparent_60%)] opacity-20 blur-3xl" />
      </div>
      <div className="container-x grid items-center gap-10 pt-28 lg:grid-cols-[1.05fr_0.95fr] lg:gap-6 lg:pt-24">
        {/* mobile: portrait above the text */}
        <div className="lg:hidden"><HeroShowcase /></div>
        <div>
        <motion.span className="eyebrow mb-7" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <span className="inline-block h-px w-9 bg-accent" />{t("roles")}
        </motion.span>
        <h1 className="h-display max-w-[14ch] text-[clamp(46px,9vw,128px)] leading-[0.95]">
          {[t("l1"), t("l2"), t("l3")].map((l, i) => (
            <span key={i} className="block overflow-hidden">
              <motion.span className={`block ${i === 1 ? "bg-gradient-to-r from-muted to-white bg-clip-text text-transparent" : ""}`} custom={i} variants={line} initial="hidden" animate="show">{l}</motion.span>
            </span>
          ))}
        </h1>
        <motion.p className="mt-8 max-w-[46ch] text-[clamp(17px,2vw,21px)] leading-relaxed text-muted" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}>
          {t("lead")}
        </motion.p>
        <motion.div className="mt-10 flex flex-wrap gap-3.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
          <Link href="/graphics" className="btn-fill">{t("cta1")}
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </Link>
          <Link href="/#contact" className="btn-ghost">{t("cta2")}</Link>
        </motion.div>
        </div>
        {/* desktop: portrait on the right */}
        <div className="hidden lg:block"><HeroShowcase /></div>
      </div>
    </header>
  );
}
