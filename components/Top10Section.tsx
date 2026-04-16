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
      <div className="px-6 md:px-12 lg:px-16 mb-5 flex items-center gap-3">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest">Top 10</h2>
        <span className="text-[11px] text-neutral-600 font-medium">Today</span>
      </div>

      {/* Cards */}
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
                  <span className="top10-number text-[6rem] md:text-[7rem] -mr-3 relative z-0">
                    {i + 1}
                  </span>
                  {/* Poster */}
                  <div className="relative w-24 md:w-28 aspect-[2/3] rounded-lg overflow-hidden z-10 transition-all duration-300 group-hover:opacity-80">
                    <Image
                      src={item.poster}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="112px"
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
          className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/80 border border-neutral-800 hidden md:flex items-center justify-center text-neutral-400 hover:text-white hover:border-neutral-600 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0"
          aria-label="Previous"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
        </button>
        <button
          ref={setNextEl}
          className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/80 border border-neutral-800 hidden md:flex items-center justify-center text-neutral-400 hover:text-white hover:border-neutral-600 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0"
          aria-label="Next"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}
