import { setRequestLocale } from "next-intl/server";
import CategoryGallery from "@/components/CategoryGallery";
import Footer from "@/components/Footer";
import { getProjects } from "@/lib/data";

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const projects = await getProjects({ category: "graphics" });
  return (
    <>
      <CategoryGallery projects={projects} titleKey="graphics" vertical={false} />
      <Footer />
    </>
  );
}
