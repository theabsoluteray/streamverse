"use client";

import { useRouter } from "next/navigation";
import EpisodeList from "./EpisodeList";

interface Props {
  animeId: number;
  totalEpisodes: number;
  animeBackdrop: string;
}

export default function AnimeDetailEpisodeList({ animeId, totalEpisodes, animeBackdrop }: Props) {
  const router = useRouter();

  const handleEpSelect = (ep: number) => {
    // Navigate directly to the watch page, optionally requesting fullscreen parameter 
    router.push(`/anime/watch/${animeId}?ep=${ep}&fullscreen=false`);
  };

  return (
    <EpisodeList
      type="anime"
      episodeCount={totalEpisodes}
      onSelectAnimeEp={handleEpSelect}
      animeBackdrop={animeBackdrop}
    />
  );
}
