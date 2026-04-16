"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play } from "lucide-react";

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
  trailerKey?: string | null;
}

interface HeroProps {
  items: HeroItem[];
}

export type { HeroItem };

export default function Hero({ items }: HeroProps) {
  const [current, setCurrent] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);

  useEffect(() => {
    if (items.length <= 1) return;
    const t = setInterval(() => {
      setCurrent((c) => (c + 1) % items.length);
      setIsVideoPlaying(true);
    }, 10000);
    return () => clearInterval(t);
  }, [items.length]);

  if (!items.length) return null;
  const item = items[current];

  return (
    <div className="relative w-full h-[75vh] min-h-[420px] overflow-hidden">
      {/* Backdrop */}
      <AnimatePresence mode="wait">
        <motion.div
          key={item.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0 bg-black"
        >
          {isVideoPlaying && item.trailerKey ? (
            <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
              <iframe
                src={`https://www.youtube.com/embed/${item.trailerKey}?autoplay=1&mute=1&loop=1&playlist=${item.trailerKey}&controls=0&showinfo=0&rel=0&playsinline=1`}
                className="absolute top-1/2 left-1/2 w-[300vw] h-[300vh] md:w-[150vw] md:h-[150vh] -translate-x-1/2 -translate-y-1/2 opacity-50"
                allow="autoplay; encrypted-media"
                frameBorder="0"
              />
            </div>
          ) : (
            <Image
              src={item.backdrop}
              alt={item.title}
              fill
              className="object-cover object-center opacity-40"
              priority
              sizes="100vw"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 pb-16 px-6 md:px-12 lg:px-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-lg"
          >
            {/* Year & Type */}
            <div className="flex items-center gap-3 text-[11px] text-neutral-500 font-medium uppercase tracking-widest mb-3">
              <span>{item.type}</span>
              {item.year && (
                <>
                  <span className="text-neutral-700">·</span>
                  <span>{item.year}</span>
                </>
              )}
              {item.rating > 0 && (
                <>
                  <span className="text-neutral-700">·</span>
                  <span>{item.rating.toFixed(1)}</span>
                </>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4 tracking-tight">
              {item.title}
            </h1>

            {/* Description */}
            <p className="text-neutral-500 text-sm leading-relaxed line-clamp-2 mb-6 max-w-md">
              {item.description?.replace(/<[^>]*>/g, "")}
            </p>

            {/* Buttons */}
            <div className="flex items-center gap-3">
              <Link
                href={item.watchHref}
                id={`hero-watch-${item.id}`}
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-black font-semibold rounded-md text-sm transition-all hover:bg-neutral-200"
              >
                <Play className="w-4 h-4 fill-black" />
                Watch
              </Link>
              <Link
                href={item.detailHref}
                id={`hero-info-${item.id}`}
                className="px-5 py-2.5 border border-neutral-700 text-neutral-300 font-medium rounded-md text-sm transition-all hover:border-neutral-500 hover:text-white"
              >
                Details
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dot indicators */}
      {items.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setCurrent(i);
                setIsVideoPlaying(true);
              }}
              className={`h-[3px] rounded-full transition-all duration-500 ${
                i === current ? "w-6 bg-white" : "w-1.5 bg-neutral-700"
              }`}
            />
          ))}
        </div>
      )}

      {/* Video Toggle */}
      {item.trailerKey && (
        <button
          onClick={() => setIsVideoPlaying(!isVideoPlaying)}
          className="absolute bottom-6 right-6 md:right-12 z-30 w-9 h-9 rounded-full border border-neutral-700 bg-black/60 flex items-center justify-center text-neutral-400 hover:text-white hover:border-neutral-500 transition-all"
          title={isVideoPlaying ? "Pause Video" : "Play Video"}
        >
          {isVideoPlaying ? (
            <div className="flex gap-0.5">
              <span className="w-[2px] h-3 bg-current rounded-sm"></span>
              <span className="w-[2px] h-3 bg-current rounded-sm"></span>
            </div>
          ) : (
            <div className="w-0 h-0 ml-0.5 border-t-[5px] border-t-transparent border-l-[8px] border-l-current border-b-[5px] border-b-transparent" />
          )}
        </button>
      )}
    </div>
  );
}
