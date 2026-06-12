"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { uploadMedia } from "@/lib/cloudinary";
import { slugify, ADMIN_EMAIL } from "@/lib/utils";
import type { Project, Review, TrustedBy } from "@/lib/types";

async function requireOwner() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user || data.user.email?.toLowerCase() !== ADMIN_EMAIL) {
    throw new Error("Access denied — not the authorized owner.");
  }
  return supabase;
}

/** Upload a base64 data URI to Cloudinary, return the secure URL. */
export async function uploadAction(dataUri: string, type: "image" | "video" = "image") {
  await requireOwner();
  return uploadMedia(dataUri, "thappasorn-works", type);
}

export async function saveProject(p: Partial<Project>) {
  const supabase = await requireOwner();
  // slugify() strips non-Latin characters, so Thai titles would produce an
  // empty slug; fall back to a unique timestamp slug in that case.
  const base = slugify(p.title || "");
  const slug = p.slug || base || `project-${Date.now().toString(36)}`;
  // Only send columns that actually exist in the DB (drop UI-only fields like `ci`).
  const row = {
    title: p.title ?? "Untitled",
    slug,
    description: p.description ?? null,
    category: p.category,
    tags: p.tags ?? [],
    client: p.client ?? null,
    year: p.year ?? null,
    services: p.services ?? [],
    challenge: p.challenge ?? null,
    solution: p.solution ?? null,
    results: p.results ?? null,
    featured: p.featured ?? false,
    thumbnail: p.thumbnail ?? null,
    gallery: p.gallery ?? [],
    video_url: p.video_url ?? null,
    orientation: p.orientation ?? "square",
  };
  const { error } = p.id
    ? await supabase.from("projects").update(row).eq("id", p.id)
    : await supabase.from("projects").insert(row);
  if (error) throw new Error(`Save failed: ${error.message}`);
  revalidatePath("/", "layout");
}
export async function deleteProject(id: string) {
  const supabase = await requireOwner();
  await supabase.from("projects").delete().eq("id", id);
  revalidatePath("/", "layout");
}
export async function toggleFeatured(id: string, featured: boolean) {
  const supabase = await requireOwner();
  await supabase.from("projects").update({ featured }).eq("id", id);
  revalidatePath("/", "layout");
}

export async function saveReview(r: Partial<Review>) {
  const supabase = await requireOwner();
  const { error } = r.id
    ? await supabase.from("reviews").update(r).eq("id", r.id)
    : await supabase.from("reviews").insert(r);
  if (error) throw new Error(`Save failed: ${error.message}`);
  revalidatePath("/", "layout");
}
export async function deleteReview(id: string) {
  const supabase = await requireOwner();
  await supabase.from("reviews").delete().eq("id", id);
  revalidatePath("/", "layout");
}

export async function saveLogo(l: Partial<TrustedBy>) {
  const supabase = await requireOwner();
  const { error } = await supabase.from("trusted_by").insert(l);
  if (error) throw new Error(`Save failed: ${error.message}`);
  revalidatePath("/", "layout");
}
export async function deleteLogo(id: string) {
  const supabase = await requireOwner();
  await supabase.from("trusted_by").delete().eq("id", id);
  revalidatePath("/", "layout");
}

export async function getAnalytics() {
  const supabase = await requireOwner();
  const count = async (type: string) =>
    (await supabase.from("analytics_events").select("*", { count: "exact", head: true }).eq("type", type)).count ?? 0;
  const [visitors, views, line, email, phone] = await Promise.all([
    count("visit"), count("project_view"), count("line_click"), count("email_click"), count("phone_click"),
  ]);
  const { data: top } = await supabase.from("projects").select("title,slug,views").order("views", { ascending: false }).limit(5);
  return { visitors, views, line, email, phone, top: top ?? [] };
}

/* ============================== BACKUP / EXPORT ============================== */
/**
 * Owner-only data export. Returns plain table rows (no secrets, no env, no tokens).
 * `table = "all"` returns a full snapshot of every content table.
 */
export async function exportTable(
  table: "projects" | "reviews" | "trusted_by" | "analytics_events" | "all"
) {
  const supabase = await requireOwner();
  const exportedAt = new Date().toISOString();
  if (table === "all") {
    const [projects, reviews, trusted_by, analytics_events] = await Promise.all([
      supabase.from("projects").select("*"),
      supabase.from("reviews").select("*"),
      supabase.from("trusted_by").select("*"),
      supabase.from("analytics_events").select("*"),
    ]);
    return {
      exportedAt,
      projects: projects.data ?? [],
      reviews: reviews.data ?? [],
      trusted_by: trusted_by.data ?? [],
      analytics_events: analytics_events.data ?? [],
    };
  }
  const { data } = await supabase.from(table).select("*");
  return { exportedAt, table, rows: data ?? [] };
}

/* ---------------- Enquiries (contact inbox) ---------------- */
export async function markEnquiryRead(id: string, read: boolean) {
  const supabase = await requireOwner();
  const { error } = await supabase.from("enquiries").update({ read }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function deleteEnquiry(id: string) {
  const supabase = await requireOwner();
  const { error } = await supabase.from("enquiries").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}
