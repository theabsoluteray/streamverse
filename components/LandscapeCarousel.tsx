"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import LandscapeCard, { LandscapeCardProps } from "./LandscapeCard";

interface LandscapeCarouselProps {
  title: string;
  items: LandscapeCardProps[];
  tabs?: { label: string; key: string }[];
  onTabChange?: (key: string) => void;
  activeTab?: string;
}

export default function LandscapeCarousel({ title, items, tabs, activeTab }: LandscapeCarouselProps) {
  const [prevEl, setPrevEl] = useState<HTMLButtonElement | null>(null);
  const [nextEl, setNextEl] = useState<HTMLButtonElement | null>(null);

  return (
    <section className="py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-6 md:px-12 lg:px-16">
        <h2 className="section-title text-white">{title}</h2>
        {tabs && (
          <div className="flex items-center gap-4">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                className={`text-sm font-medium pb-1 transition-colors ${
                  activeTab === tab.key ? "tab-active" : "tab-inactive"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Swiper */}
      <div className="px-6 md:px-12 lg:px-16 relative">
        <Swiper
          modules={[Navigation, A11y]}
          spaceBetween={10}
          slidesPerView={1.2}
          navigation={{ prevEl, nextEl }}
          breakpoints={{
            480: { slidesPerView: 2, spaceBetween: 10 },
            640: { slidesPerView: 2.5, spaceBetween: 12 },
            768: { slidesPerView: 3, spaceBetween: 12 },
            1024: { slidesPerView: 4, spaceBetween: 14 },
            1280: { slidesPerView: 5, spaceBetween: 14 },
          }}
          className="!overflow-visible"
        >
          {items.map((item) => (
            <SwiperSlide key={`${item.type}-${item.id}`}>
              <LandscapeCard {...item} />
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
