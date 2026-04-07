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
    <section className="py-8 max-w-[1400px] mx-auto w-full">
      {/* Header */}
      <div className="px-6 md:px-12 lg:px-16 mb-6 flex items-center gap-4">
        <h2 className="text-5xl md:text-6xl font-black text-transparent tracking-tight leading-none" style={{ WebkitTextStroke: '2px #ef4444', fontStyle: 'italic' }}>
          TOP 10
        </h2>
        <div className="text-sm font-bold text-white tracking-[0.3em] uppercase leading-tight">
          <div>Content</div>
          <div>Today</div>
        </div>
      </div>

      {/* Cards with numbers */}
      <div className="px-6 md:px-12 lg:px-16 relative group">
        <Swiper
          modules={[Navigation, A11y]}
          spaceBetween={20}
          slidesPerView={2.2}
          navigation={{ prevEl, nextEl }}
          breakpoints={{
            480: { slidesPerView: 2.5, spaceBetween: 24 },
            640: { slidesPerView: 3.2, spaceBetween: 24 },
            768: { slidesPerView: 4.2, spaceBetween: 24 },
            1024: { slidesPerView: 5.2, spaceBetween: 28 },
          }}
          className=""
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
                  <span className="top10-number text-[7rem] md:text-[8rem] -mr-4 relative z-0">
                    {i + 1}
                  </span>
                  {/* Poster */}
                  <div className="relative w-28 md:w-32 aspect-[2/3] rounded-xl overflow-hidden z-10 transition-all duration-500 group-hover:scale-[1.03] group-hover:-translate-y-2 group-hover:shadow-[0_15px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(239,68,68,0.2)] ring-1 ring-white/5 group-hover:ring-red-500/30">
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
          className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full premium-glass hidden md:flex items-center justify-center text-white hover:bg-red-600 hover:scale-110 hover:border-red-500 hover:shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-all duration-300 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 disabled:opacity-0"
          aria-label="Previous"
        >
          <ChevronRight className="w-6 h-6 rotate-180" />
        </button>
        <button
          ref={setNextEl}
          className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full premium-glass hidden md:flex items-center justify-center text-white hover:bg-red-600 hover:scale-110 hover:border-red-500 hover:shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-all duration-300 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 disabled:opacity-0"
          aria-label="Next"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </section>
  );
}
