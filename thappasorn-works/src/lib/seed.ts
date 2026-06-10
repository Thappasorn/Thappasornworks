import type { Project, Review, TrustedBy } from "./types";

const now = (d: number) => new Date(Date.now() - d * 86400000).toISOString();

/** Seed data used as a graceful fallback when Supabase is not configured,
 *  so `npm run dev` shows a complete site out of the box. */
export const SEED_PROJECTS: Project[] = [
  { id: "p1", title: "Aurora Type System", slug: "aurora-type-system", category: "graphics", tags: ["branding","type"], featured: true, gallery: [], ci: 0, created_at: now(2), client: "Aurora Studio", year: "2026", services: ["Brand Identity","Typography"], challenge: "Aurora needed a flexible identity that scaled across film and print.", solution: "A modular type system with a cinematic orange accent and motion-ready logo.", results: "Engagement up 40% after relaunch." },
  { id: "p2", title: "Solstice Festival", slug: "solstice-festival", category: "graphics", tags: ["poster"], featured: false, gallery: [], ci: 2, created_at: now(6) },
  { id: "p3", title: "Citrus Packaging", slug: "citrus-packaging", category: "graphics", tags: ["packaging"], featured: true, gallery: [], ci: 6, created_at: now(9) },
  { id: "p4", title: "City in 60s", slug: "city-in-60s", category: "shot-videos", tags: ["reels"], featured: true, gallery: [], ci: 1, created_at: now(1), video_url: "" },
  { id: "p5", title: "Coffee Ritual", slug: "coffee-ritual", category: "shot-videos", tags: ["brand"], featured: false, gallery: [], ci: 6, created_at: now(4) },
  { id: "p6", title: "The Long Road North", slug: "the-long-road-north", category: "long-form-video", tags: ["documentary"], featured: true, gallery: [], ci: 1, created_at: now(3), client: "North Films", year: "2026", services: ["Direction","Edit","Color"], challenge: "Tell a 13-minute journey with no narration.", solution: "Verité footage cut to a restrained score.", results: "Official selection, two festivals." },
  { id: "p7", title: "Makers of Toyama", slug: "makers-of-toyama", category: "long-form-video", tags: ["documentary"], featured: false, gallery: [], ci: 3, created_at: now(7) },
  { id: "p8", title: "Tokyo Reflections", slug: "tokyo-reflections", category: "filming-photography", tags: ["street"], featured: true, gallery: [], ci: 0, created_at: now(2) },
  { id: "p9", title: "Desert Lines", slug: "desert-lines", category: "filming-photography", tags: ["landscape"], featured: false, gallery: [], ci: 6, created_at: now(5) },
  { id: "p10", title: "Blue Hour Pier", slug: "blue-hour-pier", category: "filming-photography", tags: ["landscape"], featured: false, gallery: [], ci: 1, created_at: now(8) },
];

export const SEED_REVIEWS: Review[] = [
  { id: "r1", client_name: "John Smith", position: "Marketing Director", company: "ABC Company", rating: 5, project_type: "Brand Film", date_completed: "Mar 2026", featured: true, ci: 2, review_text: "Working with Thappasorn was one of the best creative decisions we've made. The quality, communication and attention to detail exceeded expectations." },
  { id: "r2", client_name: "Lalita Chai", position: "Founder & CEO", company: "Verde Naturals", rating: 5, project_type: "Identity + Packaging", date_completed: "Feb 2026", featured: false, ci: 3, review_text: "The rebrand completely changed how customers see us. Every frame felt intentional." },
  { id: "r3", client_name: "Kenji Watanabe", position: "Head of Content", company: "Aurora Studio", rating: 5, project_type: "Documentary", date_completed: "Jan 2026", featured: false, ci: 0, review_text: "A rare combination of storytelling instinct and technical polish. Truly cinematic work." },
];

export const SEED_TRUSTED: TrustedBy[] = [
  { id: "t1", company_name: "AURORA", ci: 0 }, { id: "t2", company_name: "Verde", ci: 3 },
  { id: "t3", company_name: "CITRUS", ci: 6 }, { id: "t4", company_name: "Tide", ci: 8 },
  { id: "t5", company_name: "Solstice", ci: 2 }, { id: "t6", company_name: "EMBER", ci: 5 },
  { id: "t7", company_name: "Mono", ci: 9 }, { id: "t8", company_name: "Velocity", ci: 1 },
];
