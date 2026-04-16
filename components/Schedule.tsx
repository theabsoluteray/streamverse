"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import type { AiringSchedule } from "@/lib/anilist";

interface ScheduleProps {
  schedules: AiringSchedule[];
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Schedule({ schedules }: ScheduleProps) {
  const today = new Date().getDay();
  const [activeDay, setActiveDay] = useState(today);

  const grouped: Record<number, AiringSchedule[]> = {};
  for (const s of schedules) {
    const date = new Date(s.airingAt * 1000);
    const day = date.getDay();
    if (!grouped[day]) grouped[day] = [];
    grouped[day].push(s);
  }

  const daySchedules = grouped[activeDay] || [];

  return (
    <div>
      {/* Day Tabs */}
      <div className="flex gap-1 mb-5 overflow-x-auto pb-2">
        {DAYS.map((day, i) => {
          const hasContent = !!(grouped[i]?.length);
          const isToday = i === today;
          return (
            <button
              key={day}
              id={`schedule-day-${day}`}
              onClick={() => setActiveDay(i)}
              className={`flex flex-col items-center px-3 py-2 rounded-md text-xs font-medium whitespace-nowrap transition-all min-w-[48px] border ${
                activeDay === i
                  ? "bg-white text-black border-white"
                  : "border-neutral-800 text-neutral-500 hover:text-white hover:border-neutral-700"
              }`}
            >
              {day}
              {isToday && (
                <span className="text-[9px] font-bold mt-0.5">TODAY</span>
              )}
              {hasContent && !isToday && (
                <span className="w-1 h-1 rounded-full bg-neutral-500 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>

      {/* Schedule List */}
      {daySchedules.length === 0 ? (
        <div className="text-center py-14 text-neutral-600">
          <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-xs">No anime scheduled for {DAYS[activeDay]}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {daySchedules.map((s) => {
            const time = new Date(s.airingAt * 1000);
            const title = s.media.title.english || s.media.title.romaji;
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Link
                  href={`/anime/${s.media.id}`}
                  id={`schedule-item-${s.media.id}`}
                  className="flex gap-3 rounded-lg p-3 border border-neutral-800/30 hover:border-neutral-700 transition-all group bg-neutral-900/30"
                >
                  <div className="relative w-12 h-16 rounded overflow-hidden flex-shrink-0">
                    <Image
                      src={s.media.coverImage.large || s.media.coverImage.medium}
                      alt={title}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[10px] font-bold text-white">EP {s.episode}</span>
                      <span className="text-[10px] text-neutral-600">
                        {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <h3 className="text-xs font-medium text-neutral-400 group-hover:text-white transition-colors line-clamp-2 leading-snug">
                      {title}
                    </h3>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
