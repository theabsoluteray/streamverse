"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Player from "@/components/Player";
import EpisodeList from "@/components/EpisodeList";
import { getAnimeById, AniMedia } from "@/lib/anilist";
export default function AnimeWatchPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const animeId = Number(params.id);

  const [anime, setAnime] = useState<AniMedia | null>(null);
  const [episode, setEpisode] = useState(Number(searchParams.get("ep")) || 1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setIsLoading(true), 0);
    getAnimeById(animeId)
      .then(setAnime)
      .catch(() => router.push("/anime"))
      .finally(() => setIsLoading(false));
  }, [animeId, router]);

  const handleEpSelect = useCallback((ep: number) => {
    setEpisode(ep);
    router.replace(`/anime/watch/${animeId}?ep=${ep}`, { scroll: false });
  }, [animeId, router]);

  const totalEpisodes = anime?.episodes || 100;

  if (isLoading || !anime) {
    return (
      <div className="pt-20 max-w-7xl mx-auto px-4 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-red-500/30 border-t-red-500 animate-spin" />
          <p className="text-neutral-400">Loading...</p>
        </div>
      </div>
    );
  }

  const title = anime.title.english || anime.title.romaji;
  const malId = anime.idMal;

  return (
    <div className="pt-20 pb-12">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-12">
        <button
          id="watch-back-btn"
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-4 text-sm text-neutral-400 hover:text-red-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <h1 className="text-lg font-bold text-white mb-1">{title}</h1>
        <p className="text-neutral-400 text-sm mb-3">Episode {episode}</p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {malId ? (
            <Player
              type="anime"
              malId={malId}
              anilistId={animeId}
              episode={episode}
              onNext={() => handleEpSelect(Math.min(episode + 1, totalEpisodes))}
              onPrev={() => handleEpSelect(Math.max(episode - 1, 1))}
              hasNext={episode < totalEpisodes}
              hasPrev={episode > 1}
            />
          ) : (
            <div className="aspect-video rounded-xl glass flex flex-col items-center justify-center border border-neutral-800/40 gap-4">
              <p className="text-neutral-400 text-sm">No streaming source available for this anime.</p>
              <p className="text-neutral-500 text-xs">MyAnimeList ID not found via AniList.</p>
            </div>
          )}
        </motion.div>

        {/* Episodes List Section */}
        <EpisodeList
          type="anime"
          episodeCount={totalEpisodes}
          currentAnimeEp={episode}
          onSelectAnimeEp={handleEpSelect}
          animeBackdrop={anime.bannerImage || anime.coverImage.extraLarge}
        />
      </div>
    </div>
  );
}
