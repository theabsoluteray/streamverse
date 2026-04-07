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
      setIsVideoPlaying(true); // reset video state on slide change
    }, 10000); // 10 seconds per slide gives trailer time to play
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
          className="absolute inset-0 bg-black"
        >
          {isVideoPlaying && item.trailerKey ? (
            <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
              <iframe
                src={`https://www.youtube.com/embed/${item.trailerKey}?autoplay=1&mute=1&loop=1&playlist=${item.trailerKey}&controls=0&showinfo=0&rel=0&playsinline=1`}
                className="absolute top-1/2 left-1/2 w-[300vw] h-[300vh] md:w-[150vw] md:h-[150vh] -translate-x-1/2 -translate-y-1/2 opacity-70"
                allow="autoplay; encrypted-media"
                frameBorder="0"
              />
            </div>
          ) : (
            <Image
              src={item.backdrop}
              alt={item.title}
              fill
              className="object-cover object-center animate-kenburns"
              priority
              sizes="100vw"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-[#030303]/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#030303]/90 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content — bottom left, minimal */}
      <div className="absolute bottom-0 left-0 right-0 pb-16 px-6 md:px-12 lg:px-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={item.id}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.15, delayChildren: 0.2 },
              },
              exit: { opacity: 0 },
            }}
            className="max-w-xl"
          >
            {/* Title */}
            <motion.h1 
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
              }}
              className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-4 drop-shadow-2xl"
            >
              {item.title}
            </motion.h1>

            {/* Meta line */}
            <motion.div 
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
              }}
              className="flex flex-wrap items-center gap-3 text-sm text-neutral-300 mb-4"
            >
              <span className="flex items-center gap-1 text-yellow-500 font-bold bg-neutral-900/50 px-2 py-0.5 rounded-md backdrop-blur-sm border border-white/5">
                <Star className="w-4 h-4 fill-yellow-500" />
                {item.rating.toFixed(1)}
              </span>
              <span className="font-medium px-2 py-0.5 bg-white/10 rounded-md backdrop-blur-sm border border-white/5">{item.year}</span>
              <div className="flex gap-2">
                {item.genres.slice(0, 3).map((g) => (
                  <span key={g} className="text-neutral-400 text-xs uppercase tracking-wider font-semibold">{g}</span>
                ))}
              </div>
            </motion.div>

            {/* Description */}
            <motion.p 
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
              }}
              className="text-neutral-400 text-sm md:text-base leading-relaxed line-clamp-3 mb-6 max-w-lg drop-shadow-md font-medium"
            >
              {item.description?.replace(/<[^>]*>/g, "")}
            </motion.p>

            {/* Compact buttons */}
            <motion.div 
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
              }}
              className="flex items-center gap-4"
            >
              <Link
                href={item.watchHref}
                id={`hero-watch-${item.id}`}
                className="btn-shine-sweep flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-sm transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:shadow-[0_0_30px_rgba(239,68,68,0.6)] hover:scale-105"
              >
                <Play className="w-5 h-5 fill-white" />
                WATCH NOW
              </Link>
              <Link
                href={item.detailHref}
                id={`hero-info-${item.id}`}
                className="flex items-center gap-2 px-6 py-3 premium-glass hover:bg-white/10 text-white font-semibold rounded-xl text-sm transition-all hover:scale-105"
              >
                <Info className="w-5 h-5" />
                DETAILS
              </Link>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Minimal dot indicators */}
      {items.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setCurrent(i);
                setIsVideoPlaying(true);
              }}
              className={`h-1 rounded-full transition-all duration-500 ${
                i === current ? "w-6 bg-red-500" : "w-1.5 bg-neutral-600"
              }`}
            />
          ))}
        </div>
      )}

      {/* Hero Video Toggle Button */}
      {item.trailerKey && (
        <button
          onClick={() => setIsVideoPlaying(!isVideoPlaying)}
          className="absolute bottom-6 right-6 md:right-12 lg:right-16 z-30 w-12 h-12 rounded-full border border-white/20 bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/10 hover:scale-110 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.5)] group"
          title={isVideoPlaying ? "Pause Video" : "Play Video"}
        >
          {isVideoPlaying ? (
            <div className="flex gap-1">
              <span className="w-1 h-3.5 bg-white rounded-sm"></span>
              <span className="w-1 h-3.5 bg-white rounded-sm"></span>
            </div>
          ) : (
            <div className="w-0 h-0 ml-1 border-t-[7px] border-t-transparent border-l-[11px] border-l-white border-b-[7px] border-b-transparent" />
          )}
        </button>
      )}
    </div>
  );
}
