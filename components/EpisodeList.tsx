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
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {type === "series" && seasons && seasons.length > 0 && (
          <div className="relative">
            <select
              value={activeSeason}
              onChange={(e) => setActiveSeason(Number(e.target.value))}
              className="appearance-none bg-neutral-900 border border-neutral-800 text-neutral-300 text-sm rounded-lg pl-4 pr-10 py-2.5 outline-none hover:border-neutral-700 focus:border-red-500 transition-colors cursor-pointer"
            >
              {seasons
                .filter((s) => s.season_number > 0)
                .map((s) => (
                  <option key={s.season_number} value={s.season_number}>
                    Season {s.season_number}
                  </option>
                ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
          </div>
        )}

        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Search episode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 text-neutral-300 text-sm rounded-lg pl-9 pr-4 py-2.5 outline-none hover:border-neutral-700 focus:border-red-500 transition-colors"
          />
        </div>

        <button
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white hover:border-neutral-700 transition-colors"
        >
          <ArrowDownUp className="w-4 h-4" />
        </button>
      </div>

      {/* Episode List */}
      <div className="flex flex-col gap-2">
        {isLoadingEpisodes ? (
          <div className="py-12 text-center text-neutral-500 text-sm bg-[#0a0a0a] rounded-xl">
            <div className="w-8 h-8 rounded-full border-2 border-red-500/30 border-t-red-500 animate-spin mx-auto mb-3" />
            Loading episodes...
          </div>
        ) : filteredAndSorted.length > 0 ? (
          visibleEpisodes.map((ep) => {
            const isActive =
              type === "anime"
                ? ep.episode_number === currentAnimeEp
                : activeSeason === currentSeason && ep.episode_number === currentEpisode;

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
                className={`group relative flex flex-col sm:flex-row items-stretch gap-4 p-2.5 rounded-xl text-left transition-all overflow-hidden ${
                  isActive
                    ? "bg-[#111] border-r-4 border-red-500"
                    : "bg-[#0a0a0a] hover:bg-[#111] border-r-4 border-transparent"
                }`}
              >
                {/* Thumbnail */}
                <div className="relative w-full sm:w-48 xl:w-56 aspect-[16/9] rounded-lg overflow-hidden flex-shrink-0 bg-neutral-900">
                  <Image
                    src={imageSrc}
                    alt={ep.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  {/* Episode Number overlay */}
                  <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded">
                    {ep.episode_number}
                  </div>
                  {/* Play Overlay */}
                  <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                    <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/30">
                      <div className="w-0 h-0 ml-0.5 border-t-[5px] border-t-transparent border-l-[8px] border-l-white border-b-[5px] border-b-transparent" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 py-1 flex flex-col justify-center">
                  <h3 className={`text-sm md:text-base font-bold truncate ${isActive ? "text-red-400" : "text-neutral-200"}`}>
                    {ep.name || `Episode ${ep.episode_number}`}
                  </h3>
                  {ep.runtime && (
                    <p className="text-xs text-neutral-500 mt-1">{ep.runtime} min</p>
                  )}
                  {ep.overview ? (
                    <p className="text-xs text-neutral-400 mt-2 line-clamp-2 md:line-clamp-3 leading-relaxed w-[90%]">
                      {ep.overview}
                    </p>
                  ) : (
                    <p className="text-xs text-neutral-600 mt-2 italic">
                      No synopsis available.
                    </p>
                  )}
                </div>

                {/* Download Button */}
                <div className="hidden sm:flex items-center justify-center pr-4">
                  <div className="w-8 h-8 rounded-full text-neutral-500 hover:text-white hover:bg-neutral-800 flex items-center justify-center transition-colors">
                    <ArrowDownToLine className="w-4 h-4" />
                  </div>
                </div>
              </button>
            );
          })
        ) : (
          <div className="py-12 text-center text-neutral-500 text-sm bg-[#0a0a0a] rounded-xl">
            No episodes found.
          </div>
        )}

        {!isLoadingEpisodes && displayedCount < filteredAndSorted.length && (
          <div className="flex justify-center mt-4">
            <button 
              onClick={() => setDisplayedCount((prev) => prev + 4)}
              className="px-6 py-2.5 rounded-full border border-neutral-800 text-neutral-400 text-xs font-semibold hover:text-white hover:border-neutral-600 transition-colors bg-[#0a0a0a]">
              Load more
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
