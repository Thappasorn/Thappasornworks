"use client";
import { useMemo, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import ProjectCard from "./ProjectCard";
import type { Project } from "@/lib/types";
import { trackCategoryVisit, trackSearch } from "@/lib/analytics";

export default function CategoryGallery({ projects, titleKey, vertical }: { projects: Project[]; titleKey: string; vertical?: boolean }) {
  const t = useTranslations();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"new" | "old">("new");
  const [tag, setTag] = useState("All");
  const tags = useMemo(() => ["All", ...Array.from(new Set(projects.flatMap((p) => p.tags)))], [projects]);

  useEffect(() => { trackCategoryVisit(titleKey); }, [titleKey]);
  useEffect(() => {
    if (!q.trim()) return;
    const id = setTimeout(() => trackSearch(q), 600);
    return () => clearTimeout(id);
  }, [q]);

  const list = useMemo(() => {
    let l = projects.filter((p) =>
      (tag === "All" || p.tags.includes(tag)) &&
      (p.title + p.tags.join(" ") + (p.client ?? "")).toLowerCase().includes(q.toLowerCase())
    );
    l = [...l].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
    if (sort === "old") l.reverse();
    return l;
  }, [projects, q, sort, tag]);

  return (
    <section className="container-x pt-32 pb-24">
      <span className="eyebrow"><span className="inline-block h-px w-9 bg-accent" />{t("nav." + titleKey)}</span>
      <h1 className="h-display mt-4 text-[clamp(36px,7vw,80px)]">{t("nav." + titleKey)}</h1>

      <div className="sticky top-[68px] z-20 mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/5 bg-bg/80 py-4 backdrop-blur-xl">
        <div className="flex flex-wrap gap-2">
          {tags.map((c) => (
            <button key={c} onClick={() => setTag(c)} className={`chip ${tag === c ? "chip-on" : ""}`}>{c === "All" ? t("cat.all") : c}</button>
          ))}
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex min-w-[220px] items-center gap-2 rounded-full border border-white/10 px-4 py-2.5">
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-muted" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></svg>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("cat.search")} className="w-full bg-transparent text-sm outline-none" />
          </div>
          <select value={sort} onChange={(e) => setSort(e.target.value as "new" | "old")} className="rounded-full border border-white/10 bg-surface px-3.5 py-2.5 text-sm outline-none">
            <option value="new">{t("cat.newest")}</option>
            <option value="old">{t("cat.oldest")}</option>
          </select>
        </div>
      </div>

      {list.length ? (
        <div className={`mt-8 grid gap-4 ${vertical ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5" : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"}`}>
          {list.map((p) => <ProjectCard key={p.id} p={p} vertical={vertical} />)}
        </div>
      ) : (
        <div className="py-24 text-center text-muted">{t("cat.none")}</div>
      )}
    </section>
  );
}
