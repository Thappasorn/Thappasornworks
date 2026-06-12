import { redirect } from "next/navigation";
import { createClient, supabaseConfigured } from "@/lib/supabase/server";
import { ADMIN_EMAIL } from "@/lib/utils";
import { getProjects, getReviews, getTrusted } from "@/lib/data";
import { getAnalytics } from "./actions";
import AdminDashboard from "@/components/admin/AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const configured = supabaseConfigured();
  if (configured) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    // Only the single authorized owner may access the dashboard.
    if (!data.user || data.user.email?.toLowerCase() !== ADMIN_EMAIL) {
      redirect("/admin/login?denied=1");
    }
  }
  const [projects, reviews, trusted] = await Promise.all([getProjects(), getReviews(), getTrusted()]);
  let enquiries: import("@/lib/types").Enquiry[] = [];
  if (configured) {
    const supabase = await createClient();
    const { data: enq } = await supabase.from("enquiries").select("*").order("created_at", { ascending: false }).limit(200);
    enquiries = (enq as import("@/lib/types").Enquiry[]) ?? [];
  }
  const analytics = configured
    ? await getAnalytics().catch(() => null)
    : { visitors: 4231, views: 1894, line: 96, email: 54, phone: 38, top: projects.slice(0, 5).map((p) => ({ title: p.title, slug: p.slug, views: p.views ?? 0 })) };
  return <AdminDashboard configured={configured} projects={projects} reviews={reviews} trusted={trusted} analytics={analytics} enquiries={enquiries} />;
}
