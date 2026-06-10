import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getProjects } from "@/lib/data";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://thappasornworks.com";
const ROUTES = ["", "/graphics", "/shot-videos", "/long-form-video", "/filming-photography"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getProjects();
  const entries: MetadataRoute.Sitemap = [];
  for (const locale of routing.locales) {
    for (const r of ROUTES) entries.push({ url: `${SITE}/${locale}${r}`, lastModified: new Date(), changeFrequency: "weekly", priority: r === "" ? 1 : 0.8 });
    for (const p of projects) entries.push({ url: `${SITE}/${locale}/project/${p.slug}`, lastModified: new Date(p.created_at), changeFrequency: "monthly", priority: 0.6 });
  }
  return entries;
}
