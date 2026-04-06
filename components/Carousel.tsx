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
    <section className="py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-6 md:px-12 lg:px-16">
        <h2 className="section-title text-white">{title}</h2>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="flex items-center gap-1 text-sm text-red-400 hover:text-red-300 font-medium transition-colors"
          >
            View All
            <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Swiper */}
      <div className="px-6 md:px-12 lg:px-16 relative">
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
            slidesPerView={2}
            navigation={{ prevEl, nextEl }}
            breakpoints={{
              480: { slidesPerView: 3, spaceBetween: 14 },
              640: { slidesPerView: 3, spaceBetween: 16 },
              768: { slidesPerView: 4, spaceBetween: 16 },
              1024: { slidesPerView: 5, spaceBetween: 18 },
              1280: { slidesPerView: 6, spaceBetween: 18 },
            }}
            className="!overflow-visible"
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
          className="absolute -left-3 top-1/3 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/70 border border-neutral-800 flex items-center justify-center text-white hover:bg-red-500/80 transition-all"
          aria-label="Previous"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
        </button>
        <button
          ref={setNextEl}
          className="absolute -right-3 top-1/3 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/70 border border-neutral-800 flex items-center justify-center text-white hover:bg-red-500/80 transition-all"
          aria-label="Next"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}
