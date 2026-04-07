"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { ChevronDown, Search, ArrowDownToLine, ArrowDownUp } from "lucide-react";
import { TMDBSeason, TMDBEpisode } from "@/lib/tmdb";

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w300";

interface EpisodeListProps {
  type: "series" | "anime";
  seriesId?: number;
  seasons?: TMDBSeason[];
  currentSeason?: number;
  currentEpisode?: number;
  onSelectEpisode?: (season: number, episode: number) => void;
  episodeCount?: number;
  currentAnimeEp?: number;
  onSelectAnimeEp?: (ep: number) => void;
  animeBackdrop?: string; // Fallback image for anime
}

export default function EpisodeList({
  type,
  seriesId,
  seasons,
  currentSeason = 1,
  currentEpisode = 1,
  onSelectEpisode,
  episodeCount,
  currentAnimeEp = 1,
  onSelectAnimeEp,
  animeBackdrop,
}: EpisodeListProps) {
  const [activeSeason, setActiveSeason] = useState(currentSeason);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [displayedCount, setDisplayedCount] = useState(4);
  const [fetchedEpisodes, setFetchedEpisodes] = useState<TMDBEpisode[]>([]);
  const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(false);

  // ─── SERIES LOGIC ─────────────────────────────
  // Fetch episodes for the active season if we have a seriesId
  useEffect(() => {
    if (type === "series" && seriesId && activeSeason) {
      setIsLoadingEpisodes(true);
      const url = `https://api.themoviedb.org/3/tv/${seriesId}/season/${activeSeason}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`;
      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          if (data.episodes) {
            setFetchedEpisodes(data.episodes);
          }
        })
        .finally(() => setIsLoadingEpisodes(false));
    }
  }, [type, seriesId, activeSeason]);

  const activSeasonData = seasons?.find((s) => s.season_number === activeSeason);
  // Prefer fetched episodes over static seasons prop
  let episodes: TMDBEpisode[] = fetchedEpisodes.length > 0 ? fetchedEpisodes : (activSeasonData?.episodes || []);

  // ─── ANIME LOGIC ──────────────────────────────
  if (type === "anime") {
    const count = episodeCount || 1;
    // Mock episode objects for anime
    episodes = Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      name: `Episode ${i + 1}`,
      overview: "Anime episodes do not have detailed synopsis available in this version.",
      still_path: null,
      episode_number: i + 1,
      season_number: 1,
      air_date: "",
      vote_average: 0,
      runtime: 24,
    }));
  }

  // Filter and Sort
  const filteredAndSorted = useMemo(() => {
    let result = episodes.filter(
      (ep) =>
        ep.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ep.episode_number.toString() === searchQuery
    );

    if (sortOrder === "desc") {
      result = result.reverse();
    }
    return result;
  }, [episodes, searchQuery, sortOrder]);

  // Reset pagination when filters change
  useEffect(() => {
    setDisplayedCount(4);
  }, [searchQuery, sortOrder, activeSeason]);

  const visibleEpisodes = filteredAndSorted.slice(0, displayedCount);

  return (
    <div className="w-full mt-12 pb-20">
      <h2 className="section-title text-white mb-6 text-xl">Episodes</h2>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-4 mb-8">
        {type === "series" && seasons && seasons.length > 0 && (
          <div className="relative group">
            <select
              value={activeSeason}
              onChange={(e) => setActiveSeason(Number(e.target.value))}
              className="appearance-none bg-neutral-900/50 backdrop-blur-md border border-white/10 text-white font-medium text-sm rounded-xl pl-5 pr-12 py-3 outline-none focus:border-red-500 hover:border-white/20 hover:bg-neutral-800/80 transition-all cursor-pointer shadow-lg"
            >
              {seasons
                .filter((s) => s.season_number > 0)
                .map((s) => (
                  <option key={s.season_number} value={s.season_number} className="bg-neutral-900 text-white">
                    Season {s.season_number}
                  </option>
                ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-hover:text-white transition-colors pointer-events-none" />
          </div>
        )}

        <div className="relative flex-1 max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-red-500 transition-colors" />
          <input
            type="text"
            placeholder="Search episodes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-900/50 backdrop-blur-md border border-white/10 text-white placeholder-neutral-500 text-sm rounded-xl pl-11 pr-4 py-3 outline-none focus:border-red-500 hover:border-white/20 hover:bg-neutral-800/80 transition-all shadow-lg"
          />
        </div>

        <button
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          className="w-12 h-12 rounded-xl bg-neutral-900/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:border-white/20 hover:bg-neutral-800/80 transition-all shadow-lg"
          title="Toggle Sort Order"
        >
          <ArrowDownUp className="w-4 h-4" />
        </button>
      </div>

      {/* Episode List */}
      <div className="flex flex-col gap-3">
        {isLoadingEpisodes ? (
          <div className="py-20 text-center text-neutral-500 text-sm glass rounded-2xl border border-white/5">
            <div className="w-10 h-10 rounded-full border-2 border-red-500/30 border-t-red-500 animate-spin mx-auto mb-4" />
            <p className="font-medium tracking-wide">Loading episodes...</p>
          </div>
        ) : filteredAndSorted.length > 0 ? (
          visibleEpisodes.map((ep) => {
            const imageSrc = ep.still_path
              ? `${TMDB_IMAGE_BASE}${ep.still_path}`
              : animeBackdrop && type === "anime"
              ? animeBackdrop
              : "/placeholder.jpg";

            return (
              <button
                key={ep.id}
                onClick={() => {
                  if (type === "anime") onSelectAnimeEp?.(ep.episode_number);
                  else onSelectEpisode?.(activeSeason, ep.episode_number);
                }}
                className={`group relative flex flex-col sm:flex-row items-stretch gap-4 md:gap-6 p-3 md:p-4 rounded-2xl text-left transition-all duration-500 overflow-hidden bg-neutral-900/40 backdrop-blur-sm border border-white/5 hover:bg-neutral-800/60 hover:border-white/10 hover:shadow-2xl hover:-translate-y-0.5`}
              >
                {/* Background glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />

                {/* Thumbnail */}
                <div className="relative w-full sm:w-56 xl:w-64 aspect-[16/9] rounded-xl overflow-hidden flex-shrink-0 bg-black/50 ring-1 ring-white/10 group-hover:ring-red-500/40 transition-all">
                  <Image
                    src={imageSrc}
                    alt={ep.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Episode Number Badge */}
                  <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] uppercase tracking-widest font-black px-2 py-1 rounded shadow-lg border border-white/10">
                    EP {ep.episode_number}
                  </div>
                  
                  {/* Play Overlay */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity opacity-0 group-hover:opacity-100 backdrop-blur-[2px]">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-red-600/90 backdrop-blur-sm shadow-[0_0_20px_rgba(239,68,68,0.6)] flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-500">
                      <div className="w-0 h-0 ml-1 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 py-2 flex flex-col justify-center z-10">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-base md:text-lg font-black tracking-wide truncate transition-colors duration-300 text-neutral-200 group-hover:text-white">
                      {ep.name || `Episode ${ep.episode_number}`}
                    </h3>
                    {ep.runtime != null && ep.runtime > 0 && (
                      <span className="text-xs font-bold px-2 py-1 bg-black/40 text-neutral-400 rounded-md whitespace-nowrap border border-white/5">
                        {ep.runtime}m
                      </span>
                    )}
                  </div>
                  {ep.overview ? (
                    <p className="text-xs md:text-sm text-neutral-400 mt-2 line-clamp-2 md:line-clamp-3 leading-relaxed max-w-[90%] group-hover:text-neutral-300 transition-colors">
                      {ep.overview}
                    </p>
                  ) : (
                    <p className="text-xs text-neutral-600 mt-2 italic">
                      No synopsis available.
                    </p>
                  )}
                </div>

                {/* Optional Action Button */}
                <div className="hidden sm:flex items-center justify-center px-2 z-10">
                  <div className="w-10 h-10 rounded-full bg-black/30 border border-white/5 text-neutral-400 group-hover:text-white hover:bg-red-600 hover:border-red-500 hover:shadow-[0_0_15px_rgba(239,68,68,0.5)] flex items-center justify-center transition-all duration-300">
                    <ArrowDownToLine className="w-4 h-4" />
                  </div>
                </div>
              </button>
            );
          })
        ) : (
          <div className="py-20 text-center text-neutral-500 text-sm glass rounded-2xl border border-white/5">
            <p className="font-medium">No episodes found matching your criteria.</p>
          </div>
        )}

        {!isLoadingEpisodes && displayedCount < filteredAndSorted.length && (
          <div className="flex justify-center mt-8">
            <button 
              onClick={() => setDisplayedCount((prev) => prev + 4)}
              className="px-8 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-bold tracking-wide transition-all hover:scale-105 hover:border-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]">
              LOAD MORE EPISODES
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
