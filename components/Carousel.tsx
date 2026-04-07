"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import Card, { CardProps } from "./Card";
import SkeletonCard from "./SkeletonLoader";

interface CarouselProps {
  title: string;
  viewAllHref?: string;
  items: CardProps[];
  isLoading?: boolean;
}

export default function Carousel({ title, viewAllHref, items, isLoading }: CarouselProps) {
  const [prevEl, setPrevEl] = useState<HTMLButtonElement | null>(null);
  const [nextEl, setNextEl] = useState<HTMLButtonElement | null>(null);

  return (
    <section className="py-6 max-w-[1400px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between mb-4 px-6 md:px-12 lg:px-16 gap-4">
        <h2 className="section-title text-white">{title}</h2>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="flex items-center gap-1 text-sm text-neutral-400 hover:text-white font-semibold transition-colors bg-white/5 hover:bg-white/10 px-3 py-1 rounded-md backdrop-blur-sm border border-white/10"
          >
            VIEW ALL
            <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Swiper */}
      <div className="px-6 md:px-12 lg:px-16 relative group">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <Swiper
            modules={[Navigation, A11y]}
            spaceBetween={14}
            slidesPerView={2.2}
            navigation={{ prevEl, nextEl }}
            breakpoints={{
              480: { slidesPerView: 2.5, spaceBetween: 14 },
              640: { slidesPerView: 3.2, spaceBetween: 16 },
              768: { slidesPerView: 4.2, spaceBetween: 16 },
              1024: { slidesPerView: 5.2, spaceBetween: 18 },
              1280: { slidesPerView: 6, spaceBetween: 18 },
            }}
            className=""
          >
            {items.map((item) => (
              <SwiperSlide key={`${item.type}-${item.id}`}>
                <Card {...item} />
              </SwiperSlide>
            ))}
          </Swiper>
        )}

        <button
          ref={setPrevEl}
          className="absolute -left-4 top-1/3 -translate-y-1/2 z-10 w-12 h-12 rounded-full premium-glass hidden md:flex items-center justify-center text-white hover:bg-red-600 hover:scale-110 hover:border-red-500 hover:shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-all duration-300 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 disabled:opacity-0"
          aria-label="Previous"
        >
          <ChevronRight className="w-6 h-6 rotate-180" />
        </button>
        <button
          ref={setNextEl}
          className="absolute -right-4 top-1/3 -translate-y-1/2 z-10 w-12 h-12 rounded-full premium-glass hidden md:flex items-center justify-center text-white hover:bg-red-600 hover:scale-110 hover:border-red-500 hover:shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-all duration-300 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 disabled:opacity-0"
          aria-label="Next"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </section>
  );
}
