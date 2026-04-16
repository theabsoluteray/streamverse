"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { ChevronDown, Search, ArrowDownUp } from "lucide-react";
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
  animeBackdrop?: string;
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
  let episodes: TMDBEpisode[] = fetchedEpisodes.length > 0 ? fetchedEpisodes : (activSeasonData?.episodes || []);

  if (type === "anime") {
    const count = episodeCount || 1;
    episodes = Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      name: `Episode ${i + 1}`,
      overview: "",
      still_path: null,
      episode_number: i + 1,
      season_number: 1,
      air_date: "",
      vote_average: 0,
      runtime: 24,
    }));
  }

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

  useEffect(() => {
    setDisplayedCount(4);
  }, [searchQuery, sortOrder, activeSeason]);

  const visibleEpisodes = filteredAndSorted.slice(0, displayedCount);

  return (
    <div className="w-full mt-10 pb-16">
      <h2 className="section-title text-white mb-5">Episodes</h2>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {type === "series" && seasons && seasons.length > 0 && (
          <div className="relative">
            <select
              value={activeSeason}
              onChange={(e) => setActiveSeason(Number(e.target.value))}
              className="appearance-none bg-neutral-900 border border-neutral-800 text-white text-xs font-medium rounded-md pl-3 pr-8 py-2 outline-none focus:border-neutral-600 hover:border-neutral-700 transition-all cursor-pointer"
            >
              {seasons
                .filter((s) => s.season_number > 0)
                .map((s) => (
                  <option key={s.season_number} value={s.season_number} className="bg-neutral-900">
                    Season {s.season_number}
                  </option>
                ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-500 pointer-events-none" />
          </div>
        )}

        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-600" />
          <input
            type="text"
            placeholder="Search episodes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-600 text-xs rounded-md pl-9 pr-3 py-2 outline-none focus:border-neutral-600 transition-all"
          />
        </div>

        <button
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          className="w-8 h-8 rounded-md bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-500 hover:text-white hover:border-neutral-700 transition-all"
          title="Toggle Sort Order"
        >
          <ArrowDownUp className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Episode List */}
      <div className="flex flex-col gap-2">
        {isLoadingEpisodes ? (
          <div className="py-16 text-center text-neutral-600 text-xs">
            <div className="w-6 h-6 rounded-full border border-neutral-700 border-t-white animate-spin mx-auto mb-3" />
            Loading episodes...
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
                className="group flex flex-col sm:flex-row items-stretch gap-4 p-3 rounded-lg text-left transition-all bg-neutral-900/40 border border-neutral-800/40 hover:bg-neutral-900 hover:border-neutral-700"
              >
                {/* Thumbnail */}
                <div className="relative w-full sm:w-48 xl:w-56 aspect-[16/9] rounded-md overflow-hidden flex-shrink-0 bg-black">
                  <Image
                    src={imageSrc}
                    alt={ep.name}
                    fill
                    className="object-cover group-hover:opacity-80 transition-opacity"
                    loading="lazy"
                  />
                  <div className="absolute top-1.5 left-1.5 bg-black/70 text-white text-[10px] font-medium px-1.5 py-0.5 rounded">
                    EP {ep.episode_number}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 py-1 flex flex-col justify-center">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm font-medium truncate text-neutral-300 group-hover:text-white transition-colors">
                      {ep.name || `Episode ${ep.episode_number}`}
                    </h3>
                    {ep.runtime != null && ep.runtime > 0 && (
                      <span className="text-[10px] text-neutral-600 whitespace-nowrap">
                        {ep.runtime}m
                      </span>
                    )}
                  </div>
                  {ep.overview ? (
                    <p className="text-xs text-neutral-600 mt-1.5 line-clamp-2 leading-relaxed max-w-[90%]">
                      {ep.overview}
                    </p>
                  ) : (
                    <p className="text-[11px] text-neutral-700 mt-1 italic">
                      No synopsis available.
                    </p>
                  )}
                </div>
              </button>
            );
          })
        ) : (
          <div className="py-16 text-center text-neutral-600 text-xs">
            No episodes found.
          </div>
        )}

        {!isLoadingEpisodes && displayedCount < filteredAndSorted.length && (
          <div className="flex justify-center mt-6">
            <button 
              onClick={() => setDisplayedCount((prev) => prev + 4)}
              className="px-6 py-2 rounded-md border border-neutral-800 text-neutral-400 text-xs font-medium transition-all hover:border-neutral-600 hover:text-white">
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
