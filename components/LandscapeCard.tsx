"use client";

import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";

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

export default function LandscapeCard({
  id,
  title,
  backdrop,
  type,
}: LandscapeCardProps) {
  const href = `${TYPE_ROUTES[type]}/${id}`;

  return (
    <Link
      href={href}
      id={`lcard-${type}-${id}`}
      className="block group relative rounded-lg overflow-hidden bg-neutral-900 aspect-[16/9]"
    >
      <Image
        src={backdrop}
        alt={title}
        fill
        className="object-cover transition-opacity duration-300 group-hover:opacity-70"
        sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 25vw"
        loading="lazy"
      />

      {/* Play icon on hover */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
          <Play className="w-4 h-4 fill-black text-black ml-0.5" />
        </div>
      </div>

      {/* Bottom gradient with title */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
        <h3 className="text-sm font-medium text-white line-clamp-1">{title}</h3>
      </div>
    </Link>
  );
}
