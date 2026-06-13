"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { Link } from "@/i18n/routing";
import { grad } from "@/lib/utils";
import type { Project } from "@/lib/types";

/** Bunny: returns {lib, vid} from an iframe url or "lib/vid" shorthand. */
function bunnyIds(url?: string): { lib: string; vid: string } | null {
  if (!url) return null;
  const m = url.match(/(?:mediadelivery\.net\/(?:embed|play)\/|^)(\d{5,7})\/([\w-]{8,})/);
  return m ? { lib: m[1], vid: m[2] } : null;
}
/** If a Bunny direct CDN host is present (vz-...-NNN.b-cdn.net/VIDEOID/...),
 *  build the animated WebP preview + static thumbnail URLs. */
function bunnyCdnAssets(url?: string): { webp: string; thumb: string } | null {
  if (!url) return null;
  const m = url.match(/(https?:\/\/[\w-]+\.b-cdn\.net)\/([\w-]{8,})/);
  if (!m) return null;
  return { webp: `${m[1]}/${m[2]}/preview.webp`, thumb: `${m[1]}/${m[2]}/thumbnail.jpg` };
}

function youtubeId(url?: string): string | null {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  return m ? m[1] : null;
}

/** Auto-playing, muted, looping preview embed (YouTube/Vimeo/Drive). */
function previewEmbed(url: string | undefined, sound: boolean): string | null {
  if (!url) return null;
  const yt = youtubeId(url);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&mute=${sound ? 0 : 1}&controls=0&loop=1&playlist=${yt}&modestbranding=1&playsinline=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1&fs=0&cc_load_policy=0`;
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1&muted=${sound ? 0 : 1}&loop=1&background=${sound ? 0 : 1}`;
  const drive = url.match(/drive\.google\.com\/file\/d\/([\w-]+)/);
  if (drive) return `https://drive.google.com/file/d/${drive[1]}/preview`;
  // Bunny Stream — accept full iframe url or "libraryId/videoId" shorthand
  const bunny = url.match(/(?:mediadelivery\.net\/(?:embed|play)\/|^)(\d{5,7})\/([\w-]{8,})/);
  if (bunny) return `https://iframe.mediadelivery.net/embed/${bunny[1]}/${bunny[2]}?autoplay=true&loop=true&muted=${sound ? "false" : "true"}&preload=true&responsive=true`;
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
  const ref = useRef<HTMLAnchorElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(false); // autoplay when scrolled into view
  const [sound, setSound] = useState(false);    // tap to enable sound
  const direct = isDirectVideo(p.video_url);
  const embed = previewEmbed(p.video_url, sound);
  const ytThumb = !p.thumbnail ? youtubeId(p.video_url) : null;
  const isBunny = !!bunnyIds(p.video_url);
  const playable = !!(direct || embed);

  // autoplay (muted) only while the card is on screen — saves data, mirrors premium agency sites
  useEffect(() => {
    const el = ref.current;
    if (!el || !playable) return;
    const io = new IntersectionObserver(
      ([e]) => {
        setInView(e.isIntersecting);
        if (direct && videoRef.current) {
          if (e.isIntersecting) videoRef.current.play().catch(() => {});
          else { videoRef.current.pause(); setSound(false); }
        }
      },
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [direct, playable]);

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
      ref={ref}
      href={`/project/${p.slug}`}
      className={`group relative block ${aspect} overflow-hidden rounded-[14px] shadow-2xl transition-transform duration-500 ease-apple hover:-translate-y-1.5`}
    >
      {/* base layer */}
      {p.thumbnail ? (
        <Image src={p.thumbnail} alt={p.title} fill sizes="(max-width:768px) 50vw, 25vw" className="object-cover transition-transform duration-700 ease-apple group-hover:scale-105" />
      ) : ytThumb ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={`https://i.ytimg.com/vi/${ytThumb}/hqdefault.jpg`} alt={p.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-apple group-hover:scale-105" />
      ) : (
        <div className="absolute inset-0 transition-transform duration-700 ease-apple group-hover:scale-105" style={{ background: grad(p.ci) }} />
      )}

      {/* direct video — autoplay muted while in view */}
      {direct && (
        <video ref={videoRef} src={p.video_url} muted={!sound} loop playsInline preload="metadata"
          className="absolute inset-0 h-full w-full object-cover" />
      )}

      {/* embedded platforms — mount while in view */}
      {!direct && embed && inView && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <iframe
            key={String(sound)}
            src={embed}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            // Bunny fills cleanly so only a tiny overscan is needed; YouTube needs more
            // to push its channel/logo bands off-screen. Both get clipped to the card.
            style={{ border: 0, pointerEvents: "none", width: isBunny ? "102%" : "175%", height: isBunny ? "102%" : "175%" }}
            allow="autoplay; encrypted-media; picture-in-picture"
            title={p.title}
          />
          <span className="absolute inset-0" />
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 ring-0 ring-accent transition-all duration-500 group-hover:ring-2" />

      {/* title — fades out once the preview is playing */}
      <div className={`pointer-events-none absolute inset-x-0 bottom-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 pt-10 transition-opacity duration-500 ${playable && inView ? "opacity-0 group-hover:opacity-100" : "opacity-100"}`}>
        <div className="h-display line-clamp-2 text-[13px] leading-snug text-white">{p.title}</div>
        <div className="mt-0.5 text-[11px] uppercase tracking-wider text-accent">{p.tags[0] ?? p.category}</div>
      </div>

      {/* sound toggle (clashivfx-style) — appears once preview is live */}
      {playable && inView && (
        <button type="button" onClick={toggleSound} aria-label={sound ? "Mute" : "Unmute"}
          className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-black/55 text-white backdrop-blur-md transition-all duration-300 hover:bg-accent">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
            {sound ? (
              <><path d="M11 5 6 9H2v6h4l5 4z" /><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M18 6a9 9 0 0 1 0 12" /></>
            ) : (
              <><path d="M11 5 6 9H2v6h4l5 4z" /><path d="m22 9-6 6M16 9l6 6" /></>
            )}
          </svg>
        </button>
      )}
    </Link>
  );
}
