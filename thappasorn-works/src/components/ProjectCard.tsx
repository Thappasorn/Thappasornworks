"use client";

import Image from "next/image";
import { useState, useRef } from "react";
import { Link } from "@/i18n/routing";
import { grad } from "@/lib/utils";
import type { Project } from "@/lib/types";

/** Build an autoplaying, muted, looping preview embed for hover. Returns null
 *  if the URL can't be auto-previewed (we then fall back to thumbnail). */
function previewEmbed(url?: string): string | null {
  if (!url) return null;
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=1&mute=1&controls=0&loop=1&playlist=${yt[1]}&modestbranding=1&playsinline=1`;
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1&muted=1&loop=1&background=1`;
  const drive = url.match(/drive\.google\.com\/file\/d\/([\w-]+)/);
  if (drive) return `https://drive.google.com/file/d/${drive[1]}/preview`;
  return null; // TikTok/Facebook don't reliably autoplay-on-hover; keep thumbnail
}

/** Direct video file? (mp4/webm/mov, e.g. uploaded to Cloudinary) */
function isDirectVideo(url?: string): boolean {
  return !!url && (/\.(mp4|webm|mov|m4v)(\?|$)/i.test(url) || url.includes("/video/upload/"));
}

export default function ProjectCard({ p }: { p: Project; vertical?: boolean }) {
  const [hover, setHover] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const embed = previewEmbed(p.video_url);
  const direct = isDirectVideo(p.video_url);

  return (
    <Link
      href={`/project/${p.slug}`}
      onMouseEnter={() => { setHover(true); if (videoRef.current) { videoRef.current.currentTime = 0; videoRef.current.play().catch(() => {}); } }}
      onMouseLeave={() => { setHover(false); videoRef.current?.pause(); }}
      className="group relative block aspect-square overflow-hidden rounded-[14px] shadow-2xl transition-transform duration-500 ease-apple hover:-translate-y-1.5"
    >
      {/* base layer: thumbnail or gradient */}
      {p.thumbnail ? (
        <Image src={p.thumbnail} alt={p.title} fill sizes="(max-width:768px) 50vw, 25vw" className="object-cover transition-transform duration-700 ease-apple group-hover:scale-105" />
      ) : (
        <div className="absolute inset-0 transition-transform duration-700 ease-apple group-hover:scale-105" style={{ background: grad(p.ci) }} />
      )}

      {/* hover preview: direct video file */}
      {direct && (
        <video
          ref={videoRef}
          src={p.video_url}
          muted loop playsInline preload="metadata"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${hover ? "opacity-100" : "opacity-0"}`}
        />
      )}

      {/* hover preview: embeddable platforms (YouTube/Vimeo/Drive) — only mounts on hover to save data */}
      {!direct && embed && hover && (
        <iframe
          src={embed}
          className="absolute inset-0 h-full w-full"
          allow="autoplay; encrypted-media; picture-in-picture"
          style={{ border: 0, pointerEvents: "none" }}
          title={p.title}
        />
      )}

      <div className="pointer-events-none absolute inset-0 ring-0 ring-accent transition-all duration-500 group-hover:ring-2" />
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 to-transparent p-4">
        <div className="h-display text-[15px] text-white">{p.title}</div>
        <div className="mt-0.5 text-[11px] uppercase tracking-wider text-accent">{p.tags[0] ?? p.category}</div>
      </div>

      {/* little "video" badge so users know it's playable */}
      {(embed || direct) && (
        <div className={`pointer-events-none absolute right-3 top-3 rounded-full bg-black/60 px-2 py-1 text-[10px] uppercase tracking-wide text-white transition-opacity duration-300 ${hover ? "opacity-0" : "opacity-100"}`}>▶ Preview</div>
      )}
    </Link>
  );
}
