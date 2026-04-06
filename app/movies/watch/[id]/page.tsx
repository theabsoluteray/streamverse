"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Player from "@/components/Player";
import { getMovieById, TMDBMovie } from "@/lib/tmdb";

export default function MovieWatchPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const movieId = Number(params.id);

  const [movie, setMovie] = useState<TMDBMovie | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setIsLoading(true), 0);
    getMovieById(movieId)
      .then(setMovie)
      .catch(() => router.push("/movies"))
      .finally(() => setIsLoading(false));
  }, [movieId, router]);

  if (isLoading || !movie) {
    return (
      <div className="pt-20 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-red-500/30 border-t-red-500 animate-spin" />
          <p className="text-neutral-400">Loading movie...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-12">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-12">
        <button
          id="movie-watch-back-btn"
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-4 text-sm text-neutral-400 hover:text-red-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <h1 className="text-lg font-bold text-white mb-3">{movie.title}</h1>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Player type="movie" tmdbId={movieId} />
        </motion.div>
      </div>
    </div>
  );
}
