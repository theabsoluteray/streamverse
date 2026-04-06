"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Play, Info } from "lucide-react";

interface HeroItem {
  id: number;
  type: "anime" | "movie" | "series";
  title: string;
  description: string;
  backdrop: string;
  poster: string;
  rating: number;
  genres: string[];
  year: string;
  watchHref: string;
  detailHref: string;
  badge?: string;
}

interface HeroProps {
  items: HeroItem[];
}

export type { HeroItem };

export default function Hero({ items }: HeroProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const t = setInterval(() => setCurrent((c) => (c + 1) % items.length), 7000);
    return () => clearInterval(t);
  }, [items.length]);

  if (!items.length) return null;
  const item = items[current];

  return (
    <div className="relative w-full h-[80vh] min-h-[480px] overflow-hidden">
      {/* Backdrop */}
      <AnimatePresence mode="wait">
        <motion.div
          key={item.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          <Image
            src={item.backdrop}
            alt={item.title}
            fill
            className="object-cover object-center"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content — bottom left, minimal */}
      <div className="absolute bottom-0 left-0 right-0 pb-16 px-6 md:px-12 lg:px-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            className="max-w-xl"
          >
            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight mb-3">
              {item.title}
            </h1>

            {/* Meta line */}
            <div className="flex items-center gap-3 text-sm text-neutral-300 mb-3">
              <span className="flex items-center gap-1 text-yellow-400 font-semibold">
                <Star className="w-3.5 h-3.5 fill-yellow-400" />
                {item.rating.toFixed(1)}
              </span>
              <span>{item.year}</span>
              {item.genres.slice(0, 2).map((g) => (
                <span key={g} className="text-neutral-400">{g}</span>
              ))}
            </div>

            {/* Description */}
            <p className="text-neutral-400 text-sm leading-relaxed line-clamp-3 mb-5 max-w-lg">
              {item.description?.replace(/<[^>]*>/g, "")}
            </p>

            {/* Compact buttons */}
            <div className="flex items-center gap-3">
              <Link
                href={item.watchHref}
                id={`hero-watch-${item.id}`}
                className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-neutral-200 text-black font-bold rounded-lg text-sm transition-all"
              >
                <Play className="w-4 h-4 fill-black" />
                Play
              </Link>
              <Link
                href={item.detailHref}
                id={`hero-info-${item.id}`}
                className="flex items-center gap-2 px-5 py-2.5 bg-neutral-800/80 hover:bg-neutral-700/80 text-white font-medium rounded-lg text-sm transition-all border border-neutral-700/50"
              >
                <Info className="w-4 h-4" />
                See More
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Minimal dot indicators */}
      {items.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1 rounded-full transition-all duration-500 ${
                i === current ? "w-6 bg-red-500" : "w-1.5 bg-neutral-600"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
