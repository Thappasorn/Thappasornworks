import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import Reveal from "./Reveal";
import ProjectCard from "./ProjectCard";
import { getProjects } from "@/lib/data";
import { CATEGORY_META, type Category } from "@/lib/types";

export default async function CategorySection({ category }: { category: Category }) {
  const t = await getTranslations();
  const meta = CATEGORY_META[category];
  const projects = await getProjects({ category, limit: 10 });
  if (!projects.length) return null;
  const vertical = category === "shot-videos";
  return (
    <section id={meta.key} className="container-x border-t border-white/5 py-20 md:py-28">
      <Reveal>
        <div className="flex items-end justify-between gap-6">
          <h2 className="h-display text-[clamp(26px,4vw,44px)]">{t(`nav.${meta.key}`)}</h2>
          <Link href={meta.route} className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-white/10 px-5 py-2.5 text-sm font-semibold transition-all duration-300 ease-apple hover:translate-x-1 hover:border-accent hover:bg-accent hover:text-bg">
            {t("sections.seeAll")}
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </Link>
        </div>
      </Reveal>
      <div className={`mt-10 grid gap-4 ${vertical ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5" : "grid-cols-2 md:grid-cols-4 lg:grid-cols-5"}`}>
        {projects.map((p, i) => (
          <Reveal key={p.id} delay={(i % 5) * 0.05}><ProjectCard p={p} vertical={vertical} /></Reveal>
        ))}
      </div>
    </section>
  );
}
