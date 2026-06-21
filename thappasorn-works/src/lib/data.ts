import { createClient, supabaseConfigured } from "./supabase/server";
import { SEED_PROJECTS, SEED_REVIEWS, SEED_TRUSTED } from "./seed";
import type { Category, Project, Review, TrustedBy } from "./types";

/**
 * Data access layer. Reads from Supabase when configured, otherwise returns
 * seed data so the site renders during local development / before setup.
 */

export async function getProjects(opts?: {
  category?: Category;
  limit?: number;
  featured?: boolean;
}): Promise<Project[]> {
  if (!supabaseConfigured()) {
    let list = [...SEED_PROJECTS];
    if (opts?.category) list = list.filter((p) => p.category === opts.category);
    if (opts?.featured) list = list.filter((p) => p.featured);
    list.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
    return opts?.limit ? list.slice(0, opts.limit) : list;
  }
  const supabase = await createClient();
  let q = supabase.from("projects").select("*").order("created_at", { ascending: false });
  if (opts?.category) q = q.eq("category", opts.category);
  if (opts?.featured) q = q.eq("featured", true);
  if (opts?.limit) q = q.limit(opts.limit);
  const { data } = await q;
  return (data as Project[]) ?? [];
}

export async function getProject(slug: string): Promise<Project | null> {
  if (!supabaseConfigured())
    return SEED_PROJECTS.find((p) => p.slug === slug) ?? null;
  const supabase = await createClient();
  const { data } = await supabase.from("projects").select("*").eq("slug", slug).single();
  return (data as Project) ?? null;
}

export async function getReviews(): Promise<Review[]> {
  if (!supabaseConfigured()) return SEED_REVIEWS;
  const supabase = await createClient();
  const { data } = await supabase.from("reviews").select("*").order("created_at", { ascending: false });
  return (data as Review[]) ?? [];
}

export async function getTrusted(): Promise<TrustedBy[]> {
  if (!supabaseConfigured()) return SEED_TRUSTED;
  const supabase = await createClient();
  const { data } = await supabase.from("trusted_by").select("*").order("created_at", { ascending: false });
  return (data as TrustedBy[]) ?? [];
}

export function averageRating(reviews: Review[]): string {
  if (!reviews.length) return "5.0";
  return (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1);
}

const DEFAULT_SETTINGS: import("./types").SiteSettings = {
  stat_projects: 248, stat_clients: 96, stat_countries: 14, stat_years: 11, showreel_url: null, owner_image: null, hero: null,
};

export async function getSettings(): Promise<import("./types").SiteSettings> {
  if (!supabaseConfigured()) return DEFAULT_SETTINGS;
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("site_settings").select("*").eq("id", 1).single();
    if (!data) return DEFAULT_SETTINGS;
    return {
      stat_projects: data.stat_projects ?? DEFAULT_SETTINGS.stat_projects,
      stat_clients: data.stat_clients ?? DEFAULT_SETTINGS.stat_clients,
      stat_countries: data.stat_countries ?? DEFAULT_SETTINGS.stat_countries,
      stat_years: data.stat_years ?? DEFAULT_SETTINGS.stat_years,
      showreel_url: data.showreel_url ?? null,
      owner_image: data.owner_image ?? null,
      hero: (data.hero as import("./types").HeroContent) ?? null,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}
