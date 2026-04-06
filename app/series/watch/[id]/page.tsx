"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Player from "@/components/Player";
import EpisodeList from "@/components/EpisodeList";
import { getSeriesById, getSeriesSeason, TMDBSeries, TMDBSeason } from "@/lib/tmdb";

export default function SeriesWatchPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const seriesId = Number(params.id);

  const [series, setSeries] = useState<TMDBSeries | null>(null);
  const [season, setSeason] = useState(Number(searchParams.get("s")) || 1);
  const [episode, setEpisode] = useState(Number(searchParams.get("e")) || 1);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSeasonData, setCurrentSeasonData] = useState<TMDBSeason | null>(null);

  useEffect(() => {
    getSeriesById(seriesId)
      .then(async (data) => {
        setSeries(data);
        const seasonData = await getSeriesSeason(seriesId, season).catch(() => null);
        if (seasonData) setCurrentSeasonData(seasonData);
        setIsLoading(false);
      })
      .catch(() => router.push("/series"));
  }, [seriesId, season, router]);

  const handleEpSelect = useCallback(async (s: number, e: number) => {
    setSeason(s);
    setEpisode(e);
    router.replace(`/series/watch/${seriesId}?s=${s}&e=${e}`, { scroll: false });
  }, [seriesId, router]);

  if (isLoading || !series) {
    return (
      <div className="pt-20 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-red-500/30 border-t-red-500 animate-spin" />
          <p className="text-neutral-400">Loading series...</p>
        </div>
      </div>
    );
  }

  const totalEps = currentSeasonData?.episode_count || 1;

  return (
    <div className="pt-20 pb-12">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-12">
        <button
          id="series-watch-back-btn"
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-4 text-sm text-neutral-400 hover:text-red-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <h1 className="text-lg font-bold text-white mb-1">{series.name}</h1>
        <p className="text-neutral-400 text-sm mb-3">Season {season}, Episode {episode}</p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Player
            type="series"
            tmdbId={seriesId}
            season={season}
            episode={episode}
            onNext={() => {
              if (episode < totalEps) handleEpSelect(season, episode + 1);
            }}
            onPrev={() => {
              if (episode > 1) handleEpSelect(season, episode - 1);
            }}
            hasNext={episode < totalEps}
            hasPrev={episode > 1}
          />
        </motion.div>

        {/* Episodes List Section */}
        <EpisodeList
          type="series"
          seasons={series.seasons}
          currentSeason={season}
          currentEpisode={episode}
          onSelectEpisode={handleEpSelect}
        />
      </div>
    </div>
  );
}
