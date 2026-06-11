import Image from "next/image";
import { Link } from "@/i18n/routing";
import { grad } from "@/lib/utils";
import type { Project } from "@/lib/types";

export default function ProjectCard({ p, vertical = false }: { p: Project; vertical?: boolean }) {
  return (
    <Link href={`/project/${p.slug}`} className="group relative block aspect-square overflow-hidden rounded-[14px] shadow-2xl transition-transform duration-500 ease-apple hover:-translate-y-1.5">
      {p.thumbnail ? (
        <Image src={p.thumbnail} alt={p.title} fill sizes="(max-width:768px) 50vw, 25vw" className="object-cover transition-transform duration-700 ease-apple group-hover:scale-105" />
      ) : (
        <div className="absolute inset-0 transition-transform duration-700 ease-apple group-hover:scale-105" style={{ background: grad(p.ci) }} />
      )}
      <div className="absolute inset-0 ring-0 ring-accent transition-all duration-500 group-hover:ring-2" />
      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 to-transparent p-4">
        <div className="h-display text-[15px] text-white">{p.title}</div>
        <div className="mt-0.5 text-[11px] uppercase tracking-wider text-accent">{p.tags[0] ?? p.category}</div>
      </div>
    </Link>
  );
}
