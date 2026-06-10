"use client";
import { useEffect } from "react";
import { trackProjectView } from "@/lib/analytics";
export default function ViewTracker({ slug }: { slug: string }) {
  useEffect(() => { trackProjectView(slug); }, [slug]);
  return null;
}
