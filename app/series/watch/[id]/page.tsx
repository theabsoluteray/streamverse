"use client";

import { useParams, useSearchParams } from "next/navigation";
import Player from "@/components/Player";

export default function SeriesWatchPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const seriesId = Number(params.id);
  const season = Number(searchParams.get("s")) || 1;
  const episode = Number(searchParams.get("e")) || 1;

  return (
    <div className="fixed inset-0 z-[99999] bg-black isolate">
      <Player type="series" tmdbId={seriesId} season={season} episode={episode} fullScreenOnly={true} />
    </div>
  );
}
