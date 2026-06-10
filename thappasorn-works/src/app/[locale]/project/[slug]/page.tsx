import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import Footer from "@/components/Footer";
import ProjectCard from "@/components/ProjectCard";
import ViewTracker from "@/components/ViewTracker";
import { getProject, getProjects } from "@/lib/data";
import { grad } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProject(slug);
  if (!p) return {};
  return { title: `${p.title} — THAPPASORN WORKS`, description: p.description ?? p.challenge ?? p.title, openGraph: { title: p.title, images: p.thumbnail ? [p.thumbnail] : ["/og.jpg"] } };
}

export default async function ProjectPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("project");
  const p = await getProject(slug);
  if (!p) notFound();
  const related = (await getProjects({ category: p.category, limit: 5 })).filter((r) => r.id !== p.id).slice(0, 4);

  return (
    <>
      <ViewTracker slug={p.slug} />
      <article className="container-x pt-28 pb-24">
        <Link href={p.category === "graphics" ? "/graphics" : p.category === "shot-videos" ? "/shot-videos" : p.category === "long-form-video" ? "/long-form-video" : "/filming-photography"} className="text-sm text-muted hover:text-accent">← {t("back")}</Link>
        <h1 className="h-display mt-4 max-w-[20ch] text-[clamp(36px,7vw,84px)] leading-[0.95]">{p.title}</h1>

        <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {p.client && <Meta k={t("client")} v={p.client} />}
          {p.year && <Meta k={t("year")} v={p.year} />}
          {p.services?.length ? <Meta k={t("services")} v={p.services.join(", ")} /> : null}
        </div>

        <div className="relative mt-10 aspect-video overflow-hidden rounded-[22px]">
          {p.thumbnail ? <Image src={p.thumbnail} alt={p.title} fill className="object-cover" /> : <div className="absolute inset-0" style={{ background: grad(p.ci) }} />}
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-3">
          {p.challenge && <Block k={t("challenge")} v={p.challenge} />}
          {p.solution && <Block k={t("solution")} v={p.solution} />}
          {p.results && <Block k={t("results")} v={p.results} />}
        </div>

        {p.gallery?.length ? (
          <div className="mt-16">
            <h2 className="h-display mb-6 text-2xl">{t("gallery")}</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {p.gallery.map((src, i) => (
                <div key={i} className="relative aspect-[4/3] overflow-hidden rounded-xl">
                  <Image src={src} alt="" fill className="object-cover" />
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {related.length ? (
          <div className="mt-20 border-t border-white/5 pt-14">
            <h2 className="h-display mb-6 text-2xl">{t("related")}</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {related.map((r) => <ProjectCard key={r.id} p={r} />)}
            </div>
          </div>
        ) : null}
      </article>
      <Footer />
    </>
  );
}

function Meta({ k, v }: { k: string; v: string }) {
  return <div className="rounded-2xl border border-white/5 p-4"><div className="text-[11px] uppercase tracking-wider text-accent">{k}</div><div className="mt-1 font-semibold">{v}</div></div>;
}
function Block({ k, v }: { k: string; v: string }) {
  return <div><div className="eyebrow mb-3">{k}</div><p className="leading-relaxed text-ink/85">{v}</p></div>;
}
