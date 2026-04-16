"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Play } from "lucide-react";

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

export default function Card({
  id,
  title,
  poster,
  year,
  type,
}: CardProps) {
  const router = useRouter();
  const href = `${TYPE_ROUTES[type]}/${id}`;

  return (
    <div
      onClick={() => router.push(href)}
      className="cursor-pointer group relative flex flex-col h-full"
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-neutral-900">
        <Image
          src={poster || "/placeholder.jpg"}
          alt={title}
          fill
          className="object-cover transition-opacity duration-300 group-hover:opacity-80"
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 16vw"
          loading="lazy"
        />

        {/* Play icon on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
            <Play className="w-4 h-4 fill-black text-black ml-0.5" />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="mt-2.5 flex-1 flex flex-col">
        <h3 className="text-[13px] font-medium text-neutral-300 line-clamp-1 group-hover:text-white transition-colors">
          {title}
        </h3>
        <span className="text-[11px] text-neutral-600 mt-0.5">{year || "TBA"}</span>
      </div>
    </div>
  );
}
