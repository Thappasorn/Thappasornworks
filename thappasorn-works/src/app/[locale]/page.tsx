import { setRequestLocale } from "next-intl/server";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import CategorySection from "@/components/CategorySection";
import Reviews from "@/components/Reviews";
import TrustedBy from "@/components/TrustedBy";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { getProjects, getReviews, getTrusted, averageRating, getSettings } from "@/lib/data";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [reviews, trusted, settings] = await Promise.all([
    getReviews(),
    getTrusted(),
    getSettings(),
  ]);
  return (
    <>
      <Hero showreelUrl={settings.showreel_url} />
      <Stats settings={settings} />
      <CategorySection category="graphics" />
      <CategorySection category="shot-videos" />
      <CategorySection category="long-form-video" />
      <CategorySection category="filming-photography" />
      <Reviews reviews={reviews} avg={averageRating(reviews)} />
      <TrustedBy logos={trusted} />
      <Contact />
      <Footer />
    </>
  );
}
