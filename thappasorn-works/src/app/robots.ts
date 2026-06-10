import type { MetadataRoute } from "next";
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://thappasornworks.com";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/en/admin", "/th/admin", "/cn/admin", "/jp/admin"] }],
    sitemap: `${SITE}/sitemap.xml`,
  };
}
