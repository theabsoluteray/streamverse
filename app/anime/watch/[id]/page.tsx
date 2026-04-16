"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Player from "@/components/Player";
import { getAnimeById } from "@/lib/anilist";

export default function AnimeWatchPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const animeId = Number(params.id);
  const episode = Number(searchParams.get("ep")) || 1;

  const [malId, setMalId] = useState<number | null>(null);

  useEffect(() => {
    getAnimeById(animeId)
      .then(a => {
        if (a.idMal) setMalId(a.idMal);
        else setMalId(animeId); // fallback
      })
      .catch(() => router.push("/anime"));
  }, [animeId, router]);

  if (!malId) {
    return <div className="fixed inset-0 z-[99999] bg-black isolate flex items-center justify-center">
             <div className="w-8 h-8 border border-neutral-700 border-t-white rounded-full animate-spin"></div>
           </div>;
  }

  return (
    <div className="fixed inset-0 z-[99999] bg-black isolate">
      <Player type="anime" malId={malId} anilistId={animeId} episode={episode} fullScreenOnly={true} />
    </div>
  );
}
