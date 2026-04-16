"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Loader2 } from "lucide-react";
import { searchAnime, AniMedia } from "@/lib/anilist";
import { searchMovies, searchSeries, TMDBMovie, TMDBSeries } from "@/lib/tmdb";
import Image from "next/image";
import { tmdbImg } from "@/lib/tmdb";

type Tab = "all" | "anime" | "movies" | "series";

interface SearchBarProps {
  initialQuery?: string;
  onResultsChange?: (hasResults: boolean) => void;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debouncedValue;
}

export default function SearchBar({ initialQuery = "" }: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [tab, setTab] = useState<Tab>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [anime, setAnime] = useState<AniMedia[]>([]);
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [series, setSeries] = useState<TMDBSeries[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 400);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setTimeout(() => {
        setAnime([]); setMovies([]); setSeries([]);
      }, 0);
      return;
    }
    setTimeout(() => setIsLoading(true), 0);
    const controllers = [new AbortController(), new AbortController(), new AbortController()];

    Promise.allSettled([
      searchAnime(debouncedQuery, 8),
      searchMovies(debouncedQuery, 1),
      searchSeries(debouncedQuery, 1),
    ])
      .then(([animeRes, moviesRes, seriesRes]) => {
        if (animeRes.status === "fulfilled") setAnime(animeRes.value.slice(0, 8));
        if (moviesRes.status === "fulfilled") setMovies(moviesRes.value.results.slice(0, 8));
        if (seriesRes.status === "fulfilled") setSeries(seriesRes.value.results.slice(0, 8));
      })
      .finally(() => setIsLoading(false));

    return () => controllers.forEach((c) => c.abort());
  }, [debouncedQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}&tab=${tab}`);
    }
  };

  const TABS: { label: string; key: Tab; count: number }[] = [
    { key: "all", label: "All", count: anime.length + movies.length + series.length },
    { key: "movies", label: "Movies", count: movies.length },
    { key: "series", label: "Series", count: series.length },
    { key: "anime", label: "Anime", count: anime.length },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Search Input */}
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
        <input
          ref={inputRef}
          id="search-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search anime, movies, series..."
          className="w-full bg-neutral-900 border border-neutral-800 focus:border-neutral-600 rounded-lg pl-11 pr-12 py-3 text-neutral-200 placeholder-neutral-600 outline-none transition-all text-sm"
          autoComplete="off"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {isLoading && <Loader2 className="w-3.5 h-3.5 text-neutral-500 animate-spin" />}
          {query && (
            <button type="button" onClick={() => setQuery("")} className="text-neutral-500 hover:text-white transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </form>

      {/* Tabs */}
      {debouncedQuery && (
        <div className="flex gap-1.5 mt-3 overflow-x-auto pb-1 no-scrollbar">
          {TABS.map((t) => (
            <button
              key={t.key}
              id={`search-tab-${t.key}`}
              onClick={() => setTab(t.key)}
              className={`px-3 py-1 rounded text-xs font-medium whitespace-nowrap transition-all ${
                tab === t.key
                  ? "bg-white text-black"
                  : "text-neutral-500 border border-neutral-800 hover:text-white hover:border-neutral-700"
              }`}
            >
              {t.label}
              {t.count > 0 && (
                <span className="ml-1 opacity-60">({t.count})</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      <AnimatePresence>
        {debouncedQuery && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="mt-3 space-y-3"
          >
            {(tab === "all" || tab === "movies") && movies.length > 0 && (
              <ResultSection
                title="Movies"
                items={movies.map((m) => ({
                  id: m.id,
                  title: m.title,
                  poster: tmdbImg(m.poster_path, "w185"),
                  href: `/movies/${m.id}`,
                  year: m.release_date?.slice(0, 4),
                  rating: m.vote_average.toFixed(1),
                  type: "movie" as const,
                }))}
              />
            )}

            {(tab === "all" || tab === "series") && series.length > 0 && (
              <ResultSection
                title="Series"
                items={series.map((s) => ({
                  id: s.id,
                  title: s.name,
                  poster: tmdbImg(s.poster_path, "w185"),
                  href: `/series/${s.id}`,
                  year: s.first_air_date?.slice(0, 4),
                  rating: s.vote_average.toFixed(1),
                  type: "series" as const,
                }))}
              />
            )}

            {(tab === "all" || tab === "anime") && anime.length > 0 && (
              <ResultSection
                title="Anime"
                items={anime.map((a) => ({
                  id: a.id,
                  title: a.title.english || a.title.romaji,
                  poster: a.coverImage.large,
                  href: `/anime/${a.id}`,
                  year: a.seasonYear?.toString(),
                  rating: a.averageScore ? (a.averageScore / 10).toFixed(1) : null,
                  type: "anime" as const,
                }))}
              />
            )}

            {anime.length === 0 && movies.length === 0 && series.length === 0 && (
              <div className="text-center text-neutral-600 py-8 text-xs">
                No results found for &ldquo;{debouncedQuery}&rdquo;
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ResultSection({
  title,
  items,
}: {
  title: string;
  items: { id: number; title: string; poster: string; href: string; year?: string; rating: string | null; type: "anime" | "movie" | "series" }[];
}) {
  return (
    <div className="rounded-lg border border-neutral-800/40 overflow-hidden">
      <div className="px-3 py-1.5 border-b border-neutral-800/40 bg-neutral-900/50">
        <span className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">{title}</span>
      </div>
      <div className="divide-y divide-neutral-800/30">
        {items.map((item) => (
          <a
            key={item.id}
            href={item.href}
            id={`search-result-${item.type}-${item.id}`}
            className="flex items-center gap-3 px-3 py-2 hover:bg-neutral-900/60 transition-colors"
          >
            <div className="relative w-7 h-10 rounded overflow-hidden flex-shrink-0 bg-neutral-800">
              <Image src={item.poster} alt={item.title} fill className="object-cover" sizes="28px" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-neutral-300 truncate">{item.title}</p>
              <p className="text-[10px] text-neutral-600">{item.year}</p>
            </div>
            {item.rating && (
              <span className="text-[10px] text-neutral-500 font-medium flex-shrink-0">★ {item.rating}</span>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}
