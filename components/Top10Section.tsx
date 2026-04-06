"use client";

import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { useState } from "react";
import { ChevronRight } from "lucide-react";

interface Top10Item {
  id: number;
  title: string;
  poster: string;
  type: "anime" | "movie" | "series";
}

const TYPE_ROUTES: Record<string, string> = {
  anime: "/anime",
  movie: "/movies",
  series: "/series",
};

export default function Top10Section({ items }: { items: Top10Item[] }) {
  const [prevEl, setPrevEl] = useState<HTMLButtonElement | null>(null);
  const [nextEl, setNextEl] = useState<HTMLButtonElement | null>(null);

  return (
    <section className="py-8">
      {/* Header */}
      <div className="px-6 md:px-12 lg:px-16 mb-6 flex items-center gap-4">
        <h2 className="text-5xl md:text-6xl font-black text-transparent tracking-tight" style={{ WebkitTextStroke: '2px #ef4444', fontStyle: 'italic' }}>
          TOP 10
        </h2>
        <div className="text-sm font-bold text-neutral-400 tracking-[0.3em] uppercase leading-tight">
          <div>Content</div>
          <div>Today</div>
        </div>
      </div>

      {/* Cards with numbers */}
      <div className="px-6 md:px-12 lg:px-16 relative">
        <Swiper
          modules={[Navigation, A11y]}
          spaceBetween={20}
          slidesPerView={2}
          navigation={{ prevEl, nextEl }}
          breakpoints={{
            640: { slidesPerView: 3, spaceBetween: 24 },
            768: { slidesPerView: 4, spaceBetween: 24 },
            1024: { slidesPerView: 5, spaceBetween: 28 },
          }}
          className="!overflow-visible"
        >
          {items.slice(0, 10).map((item, i) => (
            <SwiperSlide key={`top10-${item.id}`}>
              <Link
                href={`${TYPE_ROUTES[item.type]}/${item.id}`}
                className="block relative group"
                id={`top10-${i + 1}`}
              >
                <div className="flex items-end">
                  {/* Number */}
                  <span
                    className="text-[7rem] md:text-[8rem] font-black leading-none text-transparent select-none -mr-4 relative z-0"
                    style={{ WebkitTextStroke: '3px #ef4444', fontStyle: 'italic' }}
                  >
                    {i + 1}
                  </span>
                  {/* Poster */}
                  <div className="relative w-28 md:w-32 aspect-[2/3] rounded-lg overflow-hidden z-10 group-hover:scale-105 transition-transform">
                    <Image
                      src={item.poster}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="128px"
                      loading="lazy"
                    />
                  </div>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>

        <button
          ref={setPrevEl}
          className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/70 border border-neutral-800 flex items-center justify-center text-white hover:bg-red-500/80 transition-all"
          aria-label="Previous"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
        </button>
        <button
          ref={setNextEl}
          className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/70 border border-neutral-800 flex items-center justify-center text-white hover:bg-red-500/80 transition-all"
          aria-label="Next"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}
