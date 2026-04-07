"use client";

import { useParams } from "next/navigation";
import Player from "@/components/Player";

export default function MovieWatchPage() {
  const params = useParams<{ id: string }>();
  const movieId = Number(params.id);

  return (
    <div className="fixed inset-0 z-[99999] bg-black isolate">
      <Player type="movie" tmdbId={movieId} fullScreenOnly={true} />
    </div>
  );
}
