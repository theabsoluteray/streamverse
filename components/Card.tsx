"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Star, Play } from "lucide-react";

export interface CardProps {
  id: number;
  title: string;
  poster: string;
  rating?: number;
  genres?: string[];
  year?: string;
  type: "anime" | "movie" | "series";
  episodes?: number;
  status?: string;
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

export default function Card({
  id,
  title,
  poster,
  rating,
  year,
  type,
  episodes,
}: CardProps) {
  const router = useRouter();
  const href = `${TYPE_ROUTES[type]}/${id}`;
  const displayRating = type === "anime" ? ((rating || 0) / 10).toFixed(1) : (rating || 0).toFixed(1);

  return (
    <div
      onClick={() => router.push(href)}
      className="cursor-pointer group relative flex flex-col h-full card-hover"
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-[#0a0a0a] ring-1 ring-white/5 group-hover:ring-red-500/30 transition-all">
        <Image
          src={poster || "/placeholder.jpg"}
          alt={title}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 16vw"
          loading="lazy"
        />

        {/* Hover darkened background */}
        <div className="absolute inset-0 bg-transparent group-hover:bg-black/40 transition-colors duration-500" />

        {/* Play button overlay */}
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
            <span className="text-white">{displayRating}</span>
          </div>
        )}

        {/* Bottom hover overlay */}
        <div className="absolute inset-0 premium-glass-bottom opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Info Section */}
      <div className="mt-3 flex-1 flex flex-col">
        <h3 className="text-sm font-bold text-neutral-200 line-clamp-1 group-hover:text-white transition-colors duration-300">
          {title}
        </h3>
        <div className="text-xs font-medium text-neutral-500 mt-1 flex items-center gap-2">
           <span>{year || "TBA"}</span>
           {episodes && <span>• {episodes} EPS</span>}
        </div>
      </div>
    </div>
  );
}
