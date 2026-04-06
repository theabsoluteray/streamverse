"use client";

import { useRouter } from "next/navigation";
import EpisodeList from "./EpisodeList";
import { TMDBSeason } from "@/lib/tmdb";

interface Props {
  seriesId: number;
  seasons: TMDBSeason[];
}

export default function SeriesDetailEpisodeList({ seriesId, seasons }: Props) {
  const router = useRouter();

  const handleEpSelect = (season: number, ep: number) => {
    // Navigate directly to the watch page, optionally requesting fullscreen parameter 
    router.push(`/series/watch/${seriesId}?s=${season}&e=${ep}&fullscreen=true`);
  };

  return (
    <EpisodeList
      type="series"
      seriesId={seriesId}
      seasons={seasons}
      onSelectEpisode={handleEpSelect}
    />
  );
}
