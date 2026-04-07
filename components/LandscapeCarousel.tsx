"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
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

export default function LandscapeCarousel({ title, items, tabs, activeTab, onTabChange }: LandscapeCarouselProps) {
  const [prevEl, setPrevEl] = useState<HTMLButtonElement | null>(null);
  const [nextEl, setNextEl] = useState<HTMLButtonElement | null>(null);

  return (
    <section className="py-6 max-w-[1400px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between mb-4 px-6 md:px-12 lg:px-16 gap-4">
        <h2 className="section-title text-white">{title}</h2>
        {tabs && (
          <div className="flex items-center gap-2 bg-white/5 p-1 rounded-lg backdrop-blur-md border border-white/10">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => onTabChange && onTabChange(tab.key)}
                className={`relative px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${
                  activeTab === tab.key ? "text-white" : "text-neutral-400 hover:text-white"
                }`}
              >
                {activeTab === tab.key && (
                  <motion.div
                    layoutId={`tab-indicator-${title}`}
                    className="absolute inset-0 bg-red-600 rounded-md shadow-[0_0_15px_rgba(239,68,68,0.4)] z-0"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Swiper */}
      <div className="px-6 md:px-12 lg:px-16 relative group">
        <Swiper
          modules={[Navigation, A11y]}
          spaceBetween={10}
          slidesPerView={1.2}
          navigation={{ prevEl, nextEl }}
          breakpoints={{
            480: { slidesPerView: 1.5, spaceBetween: 10 },
            640: { slidesPerView: 2.2, spaceBetween: 12 },
            768: { slidesPerView: 3.2, spaceBetween: 12 },
            1024: { slidesPerView: 4.2, spaceBetween: 14 },
            1280: { slidesPerView: 5, spaceBetween: 14 },
          }}
          className=""
        >
          {items.map((item) => (
            <SwiperSlide key={`${item.type}-${item.id}`}>
              <LandscapeCard {...item} />
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
