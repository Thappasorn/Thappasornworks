"use client";
import { motion, type Variants } from "framer-motion";

type Dir = "up" | "fade" | "scale" | "left" | "right";

const VARIANTS: Record<Dir, Variants> = {
  up:    { hidden: { opacity: 0, y: 48 },          show: { opacity: 1, y: 0 } },
  fade:  { hidden: { opacity: 0 },                  show: { opacity: 1 } },
  scale: { hidden: { opacity: 0, scale: 0.92 },     show: { opacity: 1, scale: 1 } },
  left:  { hidden: { opacity: 0, x: -56 },          show: { opacity: 1, x: 0 } },
  right: { hidden: { opacity: 0, x: 56 },           show: { opacity: 1, x: 0 } },
};

export default function Reveal({
  children, delay = 0, className = "", variant = "up", stagger = false,
}: {
  children: React.ReactNode; delay?: number; className?: string; variant?: Dir; stagger?: boolean;
}) {
  if (stagger) {
    return (
      <motion.div
        className={className}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        transition={{ staggerChildren: 0.08, delayChildren: delay }}
      >
        {children}
      </motion.div>
    );
  }
  return (
    <motion.div
      className={className}
      variants={VARIANTS[variant]}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

/** Child item for use inside <Reveal stagger> */
export function RevealItem({ children, className = "", variant = "up" }: { children: React.ReactNode; className?: string; variant?: Dir }) {
  return <motion.div className={className} variants={VARIANTS[variant]} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>{children}</motion.div>;
}
