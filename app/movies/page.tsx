import type { Metadata } from "next";
import { getTrendingMovies, getNowPlayingMovies, getPopularMovies, getTopRatedMovies, tmdbImg } from "@/lib/tmdb";
import LandscapeCarousel from "@/components/LandscapeCarousel";
import { LandscapeCardProps } from "@/components/LandscapeCard";

export const metadata: Metadata = {
  title: "Movies | StreamVerse",
  description: "Watch the latest blockbusters and timeless classics.",
};

export const revalidate = 3600;

export default async function MoviesPage() {
  const [trending, nowPlaying, popular, topRated] = await Promise.allSettled([
    getTrendingMovies("week"),
    getNowPlayingMovies(1),
    getPopularMovies(1),
    getTopRatedMovies(1),
  ]);

  const toCards = (
    data: { id: number; title: string; backdrop_path: string | null; poster_path: string | null; vote_average: number }[]
  ): LandscapeCardProps[] =>
    data.map((m) => ({
      id: m.id,
      title: m.title,
      backdrop: tmdbImg(m.backdrop_path, "w780"),
      poster: tmdbImg(m.poster_path, "w500"),
      rating: m.vote_average,
      type: "movie" as const,
    }));

  return (
    <div className="pt-20">
      <div className="px-6 md:px-12 lg:px-16 py-8">
        <h1 className="text-3xl md:text-4xl font-black text-white section-title mb-2">Movies</h1>
        <p className="text-neutral-400 text-sm">Watch the latest blockbusters and timeless classics</p>
      </div>
      <LandscapeCarousel title="Trending This Week" items={toCards(trending.status === "fulfilled" ? trending.value : [])} />
      <LandscapeCarousel title="Now Playing" items={toCards(nowPlaying.status === "fulfilled" ? nowPlaying.value : [])} />
      <LandscapeCarousel title="Popular Movies" items={toCards(popular.status === "fulfilled" ? popular.value : [])} />
      <LandscapeCarousel title="Top Rated" items={toCards(topRated.status === "fulfilled" ? topRated.value : [])} />
    </div>
  );
}
