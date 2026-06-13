"use client";

import { useState } from "react";

function ytId(url: string) {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  return m ? m[1] : null;
}
function vimeoId(url: string) {
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return m ? m[1] : null;
}
function isFile(url: string) {
  return /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url) || url.includes("/video/upload/");
}

/** Cinematic showreel behind the hero. Falls back to the orange-glow gradient
 *  (rendered by Hero itself) when no URL is set. */
export default function HeroBackdrop({ url }: { url?: string | null }) {
  const [ready, setReady] = useState(false);
  if (!url) return null;

  const yt = ytId(url);
  const vimeo = vimeoId(url);
  const file = isFile(url);

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className={`absolute inset-0 transition-opacity duration-[1200ms] ${ready ? "opacity-100" : "opacity-0"}`}>
        {file ? (
          <video
            src={url}
            autoPlay muted loop playsInline
            onCanPlay={() => setReady(true)}
            className="absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 object-cover"
          />
        ) : yt ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&mute=1&controls=0&loop=1&playlist=${yt}&modestbranding=1&playsinline=1&rel=0&showinfo=0`}
            onLoad={() => setReady(true)}
            className="absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2"
            allow="autoplay; encrypted-media"
            title="Showreel"
          />
        ) : vimeo ? (
          <iframe
            src={`https://player.vimeo.com/video/${vimeo}?autoplay=1&muted=1&loop=1&background=1`}
            onLoad={() => setReady(true)}
            className="absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2"
            allow="autoplay"
            title="Showreel"
          />
        ) : null}
      </div>
      {/* legibility + brand overlays */}
      <div className="absolute inset-0 bg-bg/72" />
      <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/55 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-bg/40" />
      <div className="absolute -left-[8vw] top-[20vh] h-[42vw] w-[42vw] rounded-full bg-[radial-gradient(circle,#FF6B00,transparent_60%)] opacity-25 blur-3xl" />
    </div>
  );
}
