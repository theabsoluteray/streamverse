"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";

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
  type,
}: CardProps) {
  const router = useRouter();
  const href = `${TYPE_ROUTES[type]}/${id}`;
  const displayRating = type === "anime" ? ((rating || 0) / 10).toFixed(1) : (rating || 0).toFixed(1);

  return (
    <div
      onClick={() => router.push(href)}
      className="cursor-pointer group relative"
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-neutral-900">
        <Image
          src={poster || "/placeholder.jpg"}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 16vw"
          loading="lazy"
        />

        {/* Type badge */}
        <span className="absolute top-2 left-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-neutral-900/80 text-white border border-neutral-700/40">
          {TYPE_LABELS[type]}
        </span>

        {/* Rating */}
        {rating !== undefined && rating > 0 && (
          <div className="absolute top-2 right-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-neutral-900/80 text-xs font-bold">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-white">{displayRating}</span>
          </div>
        )}

        {/* Bottom hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Title */}
      <h3 className="mt-2 text-sm font-medium text-neutral-200 line-clamp-1 group-hover:text-white transition-colors">
        {title}
      </h3>
    </div>
  );
}
