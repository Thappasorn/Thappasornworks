import { getTranslations } from "next-intl/server";
import Reveal from "./Reveal";
import ProjectCard from "./ProjectCard";
import type { Project } from "@/lib/types";

export default async function Featured({ projects }: { projects: Project[] }) {
  const t = await getTranslations("sections");
  if (!projects.length) return null;
  return (
    <section className="container-x py-24 md:py-32">
      <Reveal>
        <span className="eyebrow mb-4"><span className="inline-block h-px w-9 bg-accent" />{t("featured")}</span>
        <h2 className="h-display max-w-[18ch] text-[clamp(32px,5.5vw,64px)] leading-tight">{t("featuredH")}</h2>
      </Reveal>
      <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3">
        {projects.slice(0, 6).map((p, i) => (
          <Reveal key={p.id} delay={(i % 3) * 0.08}><ProjectCard p={p} /></Reveal>
        ))}
      </div>
    </section>
  );
}
