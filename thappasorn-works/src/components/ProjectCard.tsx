"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { Link } from "@/i18n/routing";
import { grad } from "@/lib/utils";
import type { Project } from "@/lib/types";

/** Bunny: {lib, vid} from iframe url or "lib/vid" shorthand. */
function bunnyIds(url?: string): { lib: string; vid: string } | null {
  if (!url) return null;
  const m = url.match(/(?:mediadelivery\.net\/(?:embed|play)\/|^)(\d{5,7})\/([\w-]{8,})/);
  return m ? { lib: m[1], vid: m[2] } : null;
}
/** Bunny direct CDN host (vz-...-NNN.b-cdn.net/VIDEOID/...) -> WebP + thumb. */
function bunnyCdnAssets(url?: string): { webp: string; thumb: string; mp4: string; mp4hd: string } | null {
  if (!url) return null;
  const m = url.match(/(https?:\/\/[\w-]+\.b-cdn\.net)\/([\w-]{8,})/);
  if (!m) return null;
  return {
    webp: `${m[1]}/${m[2]}/preview.webp`,
    thumb: `${m[1]}/${m[2]}/thumbnail.jpg`,
    mp4: `${m[1]}/${m[2]}/play_480p.mp4`,        // sharp + smooth, still small
    mp4hd: `${m[1]}/${m[2]}/play_720p.mp4`,      // used when sound is on
  };
}

function youtubeId(url?: string): string | null {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  return m ? m[1] : null;
}

/** Sound-on player embed (loaded only when the user taps the speaker). */
function soundEmbed(url?: string): string | null {
  if (!url) return null;
  const yt = youtubeId(url);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&mute=0&controls=0&loop=1&playlist=${yt}&modestbranding=1&playsinline=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1&fs=0`;
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1&muted=0&loop=1`;
  const b = bunnyIds(url);
  if (b) return `https://iframe.mediadelivery.net/embed/${b.lib}/${b.vid}?autoplay=true&loop=true&muted=false&preload=true&responsive=true`;
  const drive = url.match(/drive\.google\.com\/file\/d\/([\w-]+)/);
  if (drive) return `https://drive.google.com/file/d/${drive[1]}/preview`;
  return null;
}

function isDirectVideo(url?: string): boolean {
  return !!url && (/\.(mp4|webm|mov|m4v)(\?|$)/i.test(url) || url.includes("/video/upload/"));
}

const ASPECT: Record<string, string> = {
  landscape: "aspect-video",
  portrait: "aspect-[9/16]",
  square: "aspect-square",
};

export default function ProjectCard({ p }: { p: Project; vertical?: boolean }) {
  const aspect = ASPECT[p.orientation ?? "square"] ?? "aspect-square";
  const videoRef = useRef<HTMLVideoElement>(null);
  const [sound, setSound] = useState(false);

  const direct = isDirectVideo(p.video_url);
  const bunny = bunnyCdnAssets(p.video_url);   // animated WebP available?
  const ytThumb = !p.thumbnail && !bunny ? youtubeId(p.video_url) : null;
  const sEmbed = soundEmbed(p.video_url);
  const hasSound = !!(direct || sEmbed);
  // a "live" preview is always showing if we have a WebP or a direct video
  const livePreview = !!bunny || direct;

  // direct videos: autoplay muted immediately (like clashivfx), all cards at once
  useEffect(() => {
    if (direct && videoRef.current) videoRef.current.play().catch(() => {});
  }, [direct]);

  function toggleSound(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const next = !sound;
    setSound(next);
    if (direct && videoRef.current) {
      videoRef.current.muted = !next;
      videoRef.current.play().catch(() => {});
    }
  }

  return (
    <Link
      href={`/project/${p.slug}`}
      className={`group relative block ${aspect} overflow-hidden rounded-[14px] shadow-2xl transition-transform duration-500 ease-apple hover:-translate-y-1.5`}
    >
      {/* poster layer (under everything) */}
      {p.thumbnail ? (
        <Image src={p.thumbnail} alt={p.title} fill sizes="(max-width:768px) 50vw, 25vw" className="object-cover transition-transform duration-700 ease-apple group-hover:scale-105" />
      ) : bunny ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={bunny.thumb} alt={p.title} className="absolute inset-0 h-full w-full object-cover" />
      ) : ytThumb ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={`https://i.ytimg.com/vi/${ytThumb}/hqdefault.jpg`} alt={p.title} className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0" style={{ background: grad(p.ci) }} />
      )}

      {/* ALWAYS-ON preview (clashivfx-style) — Bunny MP4 480p: sharp + smooth, autoplay muted, loops.
          Poster = sharp thumbnail so there's no blur before it loads. */}
      {bunny && (
        <video
          src={sound ? bunny.mp4hd : bunny.mp4}
          poster={bunny.thumb}
          muted={!sound}
          loop
          playsInline
          autoPlay
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-apple group-hover:scale-105"
        />
      )}

      {/* direct video preview — autoplay muted immediately */}
      {direct && (
        <video ref={videoRef} src={p.video_url} muted={!sound} loop playsInline autoPlay preload="auto"
          className="absolute inset-0 h-full w-full object-cover" />
      )}

      {/* sound ON: load the real player on demand */}
      {sound && !direct && !bunny && sEmbed && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <iframe
            src={sEmbed}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ border: 0, pointerEvents: "none", width: (bunnyIds(p.video_url) || /vimeo/.test(p.video_url ?? "")) ? "102%" : "175%", height: (bunnyIds(p.video_url) || /vimeo/.test(p.video_url ?? "")) ? "102%" : "175%" }}
            allow="autoplay; encrypted-media; picture-in-picture"
            title={p.title}
          />
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 ring-0 ring-accent transition-all duration-500 group-hover:ring-2" />

      {/* title — always visible normally; on cards with a live preview it dims and returns on hover */}
      <div className={`pointer-events-none absolute inset-x-0 bottom-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 pt-10 transition-opacity duration-500 ${livePreview ? "opacity-0 group-hover:opacity-100" : "opacity-100"}`}>
        <div className="h-display line-clamp-2 text-[13px] leading-snug text-white">{p.title}</div>
        <div className="mt-0.5 text-[11px] uppercase tracking-wider text-accent">{p.tags[0] ?? p.category}</div>
      </div>

      {/* sound toggle */}
      {hasSound && (
        <button type="button" onClick={toggleSound} aria-label={sound ? "Mute" : "Unmute"}
          className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-black/55 text-white backdrop-blur-md transition-all duration-300 hover:bg-accent">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
            {sound ? (<><path d="M11 5 6 9H2v6h4l5 4z" /><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M18 6a9 9 0 0 1 0 12" /></>) : (<><path d="M11 5 6 9H2v6h4l5 4z" /><path d="m22 9-6 6M16 9l6 6" /></>)}
          </svg>
        </button>
      )}
    </Link>
  );
}
