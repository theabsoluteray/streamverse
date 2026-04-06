"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Menu, X, Tv, Film, Play, Sparkles, Loader2 } from "lucide-react";
import Image from "next/image";
import { searchAnime } from "@/lib/anilist";
import { searchMovies, searchSeries, tmdbImg } from "@/lib/tmdb";

const NAV_LINKS = [
  { href: "/", label: "Home", icon: Play },
  { href: "/movies", label: "Movies", icon: Film },
  { href: "/series", label: "TV Shows", icon: Tv },
  { href: "/anime", label: "Anime", icon: Sparkles },
];

interface Suggestion {
  id: number;
  title: string;
  poster: string;
  type: "anime" | "movie" | "series";
  year?: string;
}

function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 300);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearch(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Focus input when search opens
  useEffect(() => {
    if (showSearch) inputRef.current?.focus();
  }, [showSearch]);

  // Live search
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setSuggestions([]);
      return;
    }
    setIsSearching(true);
    setSelectedIdx(-1);
    Promise.allSettled([
      searchAnime(debouncedQuery, 4),
      searchMovies(debouncedQuery, 1),
      searchSeries(debouncedQuery, 1),
    ]).then(([animeRes, moviesRes, seriesRes]) => {
      const results: Suggestion[] = [];
      if (animeRes.status === "fulfilled") {
        animeRes.value.slice(0, 3).forEach((a) =>
          results.push({
            id: a.id,
            title: a.title.english || a.title.romaji,
            poster: a.coverImage.large,
            type: "anime",
            year: a.seasonYear?.toString(),
          })
        );
      }
      if (moviesRes.status === "fulfilled") {
        moviesRes.value.results.slice(0, 3).forEach((m) =>
          results.push({
            id: m.id,
            title: m.title,
            poster: tmdbImg(m.poster_path, "w92"),
            type: "movie",
            year: m.release_date?.slice(0, 4),
          })
        );
      }
      if (seriesRes.status === "fulfilled") {
        seriesRes.value.results.slice(0, 3).forEach((s) =>
          results.push({
            id: s.id,
            title: s.name,
            poster: tmdbImg(s.poster_path, "w92"),
            type: "series",
            year: s.first_air_date?.slice(0, 4),
          })
        );
      }
      setSuggestions(results);
      setIsSearching(false);
    });
  }, [debouncedQuery]);

  const navigateTo = useCallback(
    (s: Suggestion) => {
      const routes: Record<string, string> = { anime: "/anime", movie: "/movies", series: "/series" };
      router.push(`${routes[s.type]}/${s.id}`);
      setShowSearch(false);
      setQuery("");
    },
    [router]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      if (selectedIdx >= 0 && suggestions[selectedIdx]) {
        navigateTo(suggestions[selectedIdx]);
      } else if (query.trim()) {
        router.push(`/search?q=${encodeURIComponent(query)}`);
        setShowSearch(false);
        setQuery("");
      }
    } else if (e.key === "Escape") {
      setShowSearch(false);
      setQuery("");
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/90 to-transparent">
      <div className="px-6 md:px-12 lg:px-16">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-7 h-7 rounded bg-red-500 flex items-center justify-center">
              <Play className="w-3.5 h-3.5 text-white fill-white" />
            </div>
            <span className="text-lg font-black gradient-text hidden sm:block">LostArchive</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                    isActive ? "text-white" : "text-neutral-400 hover:text-white"
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3" ref={searchRef}>
            {/* Search */}
            <AnimatePresence>
              {showSearch ? (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 280, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="relative"
                >
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search..."
                    className="w-full bg-neutral-900/90 border border-neutral-700/50 rounded-lg pl-9 pr-8 py-2 text-sm text-white placeholder-neutral-500 outline-none focus:border-neutral-600"
                  />
                  {isSearching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400 animate-spin" />}
                  {!isSearching && query && (
                    <button
                      onClick={() => setQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}

                  {/* Suggestions dropdown */}
                  {suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-neutral-900/95 border border-neutral-800/60 rounded-lg overflow-hidden shadow-2xl backdrop-blur-xl max-h-80 overflow-y-auto">
                      {suggestions.map((s, i) => (
                        <button
                          key={`${s.type}-${s.id}`}
                          onClick={() => navigateTo(s)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                            i === selectedIdx ? "bg-neutral-800" : "hover:bg-neutral-800/60"
                          }`}
                        >
                          <div className="relative w-8 h-11 rounded overflow-hidden flex-shrink-0 bg-neutral-800">
                            <Image src={s.poster} alt={s.title} fill className="object-cover" sizes="32px" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white truncate">{s.title}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold px-1 py-0.5 rounded bg-neutral-800/80 text-neutral-400 uppercase">
                                {s.type === "movie" ? "Movie" : s.type === "series" ? "Series" : "Anime"}
                              </span>
                              {s.year && <span className="text-xs text-neutral-500">{s.year}</span>}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              ) : (
                <button
                  onClick={() => setShowSearch(true)}
                  className="w-9 h-9 flex items-center justify-center rounded-full text-neutral-300 hover:text-white transition-colors"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}
            </AnimatePresence>

            {/* Mobile menu button */}
            <button
              id="mobile-menu-btn"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden w-9 h-9 flex items-center justify-center text-neutral-300 hover:text-white"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-black/95 border-t border-neutral-800/30 backdrop-blur-xl"
          >
            <div className="px-6 py-4 space-y-1">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 py-3 text-sm font-medium transition-colors ${
                      isActive ? "text-white" : "text-neutral-400"
                    }`}
                  >
                    <link.icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
