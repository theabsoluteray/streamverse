"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, Play } from "lucide-react";

export interface LandscapeCardProps {
  id: number;
  title: string;
  backdrop: string;
  poster?: string;
  rating?: number;
  year?: string;
  type: "anime" | "movie" | "series";
}

const TYPE_ROUTES: Record<string, string> = {
  anime: "/anime",
  movie: "/movies",
  series: "/series",
};

const TYPE_LABELS: Record<string, string> = {
  anime: "ANIME",
  movie: "MOVIE",
  series: "TV SHOW",
};

export default function LandscapeCard({
  id,
  title,
  backdrop,
  rating,
  year,
  type,
}: LandscapeCardProps) {
  const href = `${TYPE_ROUTES[type]}/${id}`;

  return (
    <Link
      href={href}
      id={`lcard-${type}-${id}`}
      className="block group relative rounded-xl overflow-hidden bg-neutral-900 aspect-[16/9] card-hover ring-1 ring-white/5 hover:ring-red-500/30"
    >
      <Image
        src={backdrop}
        alt={title}
        fill
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 25vw"
        loading="lazy"
      />
      
      {/* Background overlay that darkens slightly on hover */}
      <div className="absolute inset-0 bg-transparent group-hover:bg-black/30 transition-colors duration-500" />

      {/* Play button that scales and fades in on hover */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100 z-10">
        <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-red-600/90 backdrop-blur-sm flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.5)]">
          <Play className="w-5 h-5 md:w-6 md:h-6 fill-white text-white ml-1" />
        </div>
      </div>

      {/* Type badge */}
      <span className="absolute top-2 left-2 text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white border border-white/10 uppercase tracking-widest shadow-lg z-10">
        {TYPE_LABELS[type]}
      </span>

      {/* Rating */}
      {rating !== undefined && rating > 0 && (
        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-xs font-bold shadow-lg z-10">
          <Star className="w-3 h-3 fill-yellow-500 text-yellow-500 drop-shadow-[0_0_5px_rgba(234,179,8,0.5)]" />
          <span className="text-white">{type === "anime" ? (rating / 10).toFixed(1) : rating.toFixed(1)}</span>
        </div>
      )}

      {/* Bottom gradient with sliding title and metadata */}
      <div className="absolute bottom-0 left-0 right-0 premium-glass-bottom p-3 md:p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 z-10">
        <h3 className="text-sm md:text-base font-bold text-white line-clamp-1 drop-shadow-lg">{title}</h3>
        <div className="mt-1 opacity-0 h-0 group-hover:opacity-100 group-hover:h-auto overflow-hidden transition-all duration-300 delay-75">
          <span className="text-xs font-medium text-neutral-300">{year || "TBA"}</span>
        </div>
      </div>
    </Link>
  );
}
