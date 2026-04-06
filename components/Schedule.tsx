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
      <div className="flex gap-1.5 mb-6 overflow-x-auto pb-2">
        {DAYS.map((day, i) => {
          const hasContent = !!(grouped[i]?.length);
          const isToday = i === today;
          return (
            <button
              key={day}
              id={`schedule-day-${day}`}
              onClick={() => setActiveDay(i)}
              className={`flex flex-col items-center px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all min-w-[60px] border ${
                activeDay === i
                  ? "bg-red-500/20 border-red-500/50 text-red-400"
                  : "border-neutral-800/40 text-neutral-400 hover:text-white hover:border-neutral-700/50"
              }`}
            >
              {day}
              {isToday && (
                <span className="text-[10px] text-red-400 font-bold mt-0.5">TODAY</span>
              )}
              {hasContent && !isToday && (
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-500 mt-1" />
              )}
            </button>
          );
        })}
      </div>

      {/* Schedule List */}
      {daySchedules.length === 0 ? (
        <div className="text-center py-16 text-neutral-500">
          <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No anime scheduled for {DAYS[activeDay]}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  className="flex gap-3 glass rounded-xl p-3 border border-neutral-800/30 hover:border-red-500/30 transition-all group card-hover"
                >
                  <div className="relative w-14 h-20 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={s.media.coverImage.large || s.media.coverImage.medium}
                      alt={title}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-xs font-bold text-red-400">
                        EP {s.episode}
                      </span>
                      <span className="text-[10px] text-neutral-500">
                        {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-neutral-200 group-hover:text-red-400 transition-colors line-clamp-2 leading-snug">
                      {title}
                    </h3>
                    {s.media.genres.length > 0 && (
                      <div className="flex gap-1 mt-1.5 flex-wrap">
                        {s.media.genres.slice(0, 2).map((g) => (
                          <span key={g} className="text-[10px] px-1.5 py-0.5 rounded-full bg-neutral-900/60 text-neutral-400">
                            {g}
                          </span>
                        ))}
                      </div>
                    )}
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
