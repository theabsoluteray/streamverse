import type { Metadata } from "next";
import { getTrendingMovies, getNowPlayingMovies, getPopularMovies, getTopRatedMovies, tmdbImg } from "@/lib/tmdb";
import LandscapeCarousel from "@/components/LandscapeCarousel";
import { LandscapeCardProps } from "@/components/LandscapeCard";
import Hero, { HeroItem } from "@/components/Hero";
import Top10Section from "@/components/Top10Section";

export const metadata: Metadata = {
  title: "Movies | LostArchive",
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

  const trendingData = trending.status === "fulfilled" ? trending.value : [];
  const nowPlayingData = nowPlaying.status === "fulfilled" ? nowPlaying.value : [];
  const popularData = popular.status === "fulfilled" ? popular.value : [];
  const topRatedData = topRated.status === "fulfilled" ? topRated.value : [];

  const heroItems: HeroItem[] = trendingData.slice(0, 6).map((m) => ({
    id: m.id,
    type: "movie" as const,
    title: m.title,
    description: m.overview,
    backdrop: tmdbImg(m.backdrop_path, "original"),
    poster: tmdbImg(m.poster_path, "w500"),
    rating: m.vote_average,
    genres: [],
    year: m.release_date?.slice(0, 4) || "",
    watchHref: `/movies/watch/${m.id}`,
    detailHref: `/movies/${m.id}`,
  }));

  const top10 = popularData.slice(0, 10).map((m) => ({
    id: m.id,
    title: m.title,
    poster: tmdbImg(m.poster_path, "w500"),
    type: "movie" as const,
  }));

  const toCards = (data: any[]): LandscapeCardProps[] =>
    data.map((m) => ({
      id: m.id,
      title: m.title,
      backdrop: tmdbImg(m.backdrop_path, "w780"),
      poster: tmdbImg(m.poster_path, "w500"),
      rating: m.vote_average,
      type: "movie",
    }));

  return (
    <>
      <Hero items={heroItems} />
      <Top10Section items={top10} />
      <LandscapeCarousel title="Trending This Week" items={toCards(trendingData)} />
      <LandscapeCarousel title="Now Playing" items={toCards(nowPlayingData)} />
      <LandscapeCarousel title="Popular Movies" items={toCards(popularData)} />
      <LandscapeCarousel title="Top Rated" items={toCards(topRatedData)} />
    </>
  );
}
