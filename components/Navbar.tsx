"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Loader2, Menu } from "lucide-react";
import Image from "next/image";
import { searchAnime } from "@/lib/anilist";
import { searchMovies, searchSeries, tmdbImg } from "@/lib/tmdb";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/movies", label: "Movies" },
  { href: "/series", label: "Series" },
  { href: "/anime", label: "Anime" },
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
      searchMovies(debouncedQuery, 1),
      searchSeries(debouncedQuery, 1),
      searchAnime(debouncedQuery, 4),
    ]).then(([moviesRes, seriesRes, animeRes]) => {
      const results: Suggestion[] = [];
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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/[0.04]">
      <div className="px-6 md:px-12 lg:px-16">
        <div className="flex items-center justify-between h-14">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="text-sm font-semibold text-white tracking-wide">LostArchive</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-[13px] font-medium transition-colors ${
                    isActive ? "text-white" : "text-neutral-500 hover:text-white"
                  }`}
                >
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
                  animate={{ width: 260, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="relative"
                >
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search..."
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-9 pr-8 py-2 text-sm text-white placeholder-neutral-600 outline-none focus:border-neutral-600"
                  />
                  {isSearching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 animate-spin" />}
                  {!isSearching && query && (
                    <button
                      onClick={() => setQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Suggestions dropdown */}
                  {suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden shadow-2xl max-h-80 overflow-y-auto">
                      {suggestions.map((s, i) => (
                        <button
                          key={`${s.type}-${s.id}`}
                          onClick={() => navigateTo(s)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                            i === selectedIdx ? "bg-neutral-800" : "hover:bg-neutral-800/60"
                          }`}
                        >
                          <div className="relative w-7 h-10 rounded overflow-hidden flex-shrink-0 bg-neutral-800">
                            <Image src={s.poster} alt={s.title} fill className="object-cover" sizes="28px" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white truncate">{s.title}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-medium text-neutral-500 uppercase">
                                {s.type === "movie" ? "Movie" : s.type === "series" ? "Series" : "Anime"}
                              </span>
                              {s.year && <span className="text-[10px] text-neutral-600">{s.year}</span>}
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
                  className="w-8 h-8 flex items-center justify-center text-neutral-500 hover:text-white transition-colors"
                >
                  <Search className="w-4 h-4" />
                </button>
              )}
            </AnimatePresence>

            {/* Mobile menu button */}
            <button
              id="mobile-menu-btn"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-white"
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
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
            className="md:hidden bg-black border-t border-white/[0.04]"
          >
            <div className="px-6 py-4 space-y-1">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block py-2.5 text-sm font-medium transition-colors ${
                      isActive ? "text-white" : "text-neutral-500"
                    }`}
                  >
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
