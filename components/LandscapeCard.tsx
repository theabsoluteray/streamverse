"use client";

import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";

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
  type,
}: LandscapeCardProps) {
  const href = `${TYPE_ROUTES[type]}/${id}`;

  return (
    <Link
      href={href}
      id={`lcard-${type}-${id}`}
      className="block group relative rounded-lg overflow-hidden bg-neutral-900 aspect-[16/9] transition-all hover:ring-1 hover:ring-neutral-700"
    >
      <Image
        src={backdrop}
        alt={title}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 25vw"
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
          <span className="text-white">{type === "anime" ? (rating / 10).toFixed(1) : rating.toFixed(1)}</span>
        </div>
      )}

      {/* Bottom gradient with title */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3 pt-8">
        <h3 className="text-sm font-semibold text-white line-clamp-1">{title}</h3>
      </div>
    </Link>
  );
}
