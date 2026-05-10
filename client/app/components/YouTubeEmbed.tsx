"use client";
import { useState } from "react";
import { Play } from "lucide-react";

/**
 * Lazy-loaded, privacy-enhanced YouTube embed. Defers iframe injection until
 * the user clicks play, so the landing page stays fast and avoids the
 * youtube.com cookie cascade until it's actually wanted.
 */
export default function YouTubeEmbed({
  videoId,
  title,
}: {
  videoId: string;
  title: string;
}) {
  const [active, setActive] = useState(false);
  const thumb = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
  const fallbackThumb = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  return (
    <div className="relative w-full aspect-video bg-ink-elevated border border-rule overflow-hidden crop-marks">
      {!active ? (
        <button
          type="button"
          onClick={() => setActive(true)}
          className="group absolute inset-0 w-full h-full"
          aria-label={`Play ${title}`}
        >
          <picture>
            <source srcSet={thumb} />
            <img
              src={fallbackThumb}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
              loading="lazy"
            />
          </picture>
          <div className="absolute inset-0 bg-gradient-to-tr from-black/70 via-black/20 to-transparent" />
          <div
            className="absolute inset-0 grain pointer-events-none"
            style={{ ["--grain-opacity" as string]: 0.08 }}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center transition-transform duration-500 group-hover:scale-110"
              style={{
                background: "radial-gradient(circle at 30% 30%, #c700e7 0%, #6303ff 100%)",
                boxShadow:
                  "0 0 0 1px rgba(255,255,255,0.18) inset, 0 18px 50px -12px rgba(159,3,254,0.65)",
              }}
            >
              <Play className="w-7 h-7 text-paper translate-x-[2px]" strokeWidth={1.6} fill="currentColor" />
            </div>
            <div className="font-mono text-[10px] tracking-widest uppercase text-paper">
              Play demo
            </div>
          </div>
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between font-mono text-[10px] tracking-widest uppercase text-paper">
            <span>LA Hacks 2024 — Demo reel</span>
            <span className="opacity-60">02:14</span>
          </div>
        </button>
      ) : (
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
          title={title}
          frameBorder={0}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      )}
    </div>
  );
}
