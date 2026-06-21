"use client";
import { useRef } from "react";
import { useTranslations } from "next-intl";
import { grad } from "@/lib/utils";
import type { Review } from "@/lib/types";

function Stars({ n }: { n: number }) {
  return <span className="tracking-[3px] text-accent">{"★★★★★".split("").map((s, i) => <span key={i} className={i < n ? "" : "text-white/20"}>{s}</span>)}</span>;
}

export default function Reviews({ reviews, avg }: { reviews: Review[]; avg: string }) {
  const t = useTranslations("sections");
  const track = useRef<HTMLDivElement>(null);
  const scroll = (d: number) => track.current?.scrollBy({ left: d * 360, behavior: "smooth" });
  if (!reviews.length) return null;
  const sorted = [...reviews].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  return (
    <section id="reviews" className="container-x border-t border-white/5 py-24 md:py-32">
      <div className="mb-12 flex flex-col items-center text-center">
        <div className="h-display bg-gradient-to-r from-accent to-white bg-clip-text text-[clamp(48px,7vw,84px)] leading-none text-transparent">{avg}/5</div>
        <div className="mt-2 text-2xl tracking-[4px] text-accent">★★★★★</div>
        <div className="mt-2 text-sm text-muted">{t("based")} {reviews.length}+ {t("reviewsCount")}</div>
        <span className="eyebrow mt-8">{t("reviews")}</span>
        <h2 className="h-display mt-4 max-w-[20ch] text-[clamp(28px,4.5vw,52px)]">{t("reviewsH")}</h2>
      </div>
      <div className="relative">
        <button onClick={() => scroll(-1)} className="absolute -left-3 top-[42%] z-10 hidden h-12 w-12 place-items-center rounded-full border border-white/10 bg-surface transition-colors hover:bg-accent hover:text-bg md:grid" aria-label="prev">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <button onClick={() => scroll(1)} className="absolute -right-3 top-[42%] z-10 hidden h-12 w-12 place-items-center rounded-full border border-white/10 bg-surface transition-colors hover:bg-accent hover:text-bg md:grid" aria-label="next">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}><path d="M9 18l6-6-6-6" /></svg>
        </button>
        <div ref={track} className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {sorted.map((r) => (
            <article key={r.id} className="card-glass flex min-h-[340px] w-[86%] shrink-0 snap-start flex-col p-7 transition-all duration-500 ease-apple hover:-translate-y-2 hover:shadow-glow sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)]">
              {r.featured && <span className="mb-3 w-fit rounded-full bg-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-bg">★ Featured</span>}
              <Stars n={r.rating} />
              {r.headline && <p className="mt-4 h-display text-[17px] leading-snug text-ink">{r.headline}</p>}
              <p className={`${r.headline ? "mt-2" : "mt-4"} flex-1 leading-relaxed text-ink/90`}>“{r.review_text}”</p>
              {r.signature_image ? <img src={r.signature_image} alt="" className="my-3 h-11 w-auto opacity-90 [filter:brightness(0)_invert(1)]" /> : <div className="my-3 font-[Caveat] text-3xl text-accent">{r.client_name}</div>}
              <div className="mt-3 flex flex-wrap gap-2">
                {r.project_type && <span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-muted"><b className="text-accent">{r.project_type}</b></span>}
                {r.date_completed && <span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-muted">{r.date_completed}</span>}
              </div>
              <div className="mt-3.5 flex items-center gap-3 border-t border-white/5 pt-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full font-bold text-white" style={{ background: grad(r.ci) }}>
                  {r.profile_image ? <img src={r.profile_image} alt="" className="h-full w-full object-cover" /> : r.client_name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                </div>
                <div><div className="text-[15px] font-bold">{r.client_name}</div><div className="text-xs text-muted">{r.position}{r.company ? ` · ${r.company}` : ""}</div></div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
