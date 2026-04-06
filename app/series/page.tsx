import type { Metadata } from "next";
import { getTrendingSeries, getAiringSeries, getPopularSeries, getTopRatedSeries, tmdbImg } from "@/lib/tmdb";
import LandscapeCarousel from "@/components/LandscapeCarousel";
import { LandscapeCardProps } from "@/components/LandscapeCard";
import Hero, { HeroItem } from "@/components/Hero";
import Top10Section from "@/components/Top10Section";

export const metadata: Metadata = {
  title: "TV Series | LostArchive",
  description: "Discover the best series currently streaming and airing.",
};

export const revalidate = 3600;

export default async function SeriesPage() {
  const [trending, airing, popular, topRated] = await Promise.allSettled([
    getTrendingSeries("week"),
    getAiringSeries(1),
    getPopularSeries(1),
    getTopRatedSeries(1),
  ]);

  const trendingData = trending.status === "fulfilled" ? trending.value : [];
  const airingData = airing.status === "fulfilled" ? airing.value : [];
  const popularData = popular.status === "fulfilled" ? popular.value : [];
  const topRatedData = topRated.status === "fulfilled" ? topRated.value : [];

  const heroItems: HeroItem[] = trendingData.slice(0, 6).map((s) => ({
    id: s.id,
    type: "series" as const,
    title: s.name,
    description: s.overview,
    backdrop: tmdbImg(s.backdrop_path, "original"),
    poster: tmdbImg(s.poster_path, "w500"),
    rating: s.vote_average,
    genres: [],
    year: s.first_air_date?.slice(0, 4) || "",
    watchHref: `/series/watch/${s.id}`,
    detailHref: `/series/${s.id}`,
  }));

  const top10 = popularData.slice(0, 10).map((s) => ({
    id: s.id,
    title: s.name,
    poster: tmdbImg(s.poster_path, "w500"),
    type: "series" as const,
  }));

  const toCards = (data: any[]): LandscapeCardProps[] =>
    data.map((s) => ({
      id: s.id,
      title: s.name,
      backdrop: tmdbImg(s.backdrop_path, "w780"),
      poster: tmdbImg(s.poster_path, "w500"),
      rating: s.vote_average,
      type: "series",
    }));

  return (
    <>
      <Hero items={heroItems} />
      <Top10Section items={top10} />
      <LandscapeCarousel title="Trending This Week" items={toCards(trendingData)} />
      <LandscapeCarousel title="Currently Airing" items={toCards(airingData)} />
      <LandscapeCarousel title="Popular Series" items={toCards(popularData)} />
      <LandscapeCarousel title="Top Rated" items={toCards(topRatedData)} />
    </>
  );
}
