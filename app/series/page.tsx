import type { Metadata } from "next";
import { getTrendingSeries, getAiringSeries, getPopularSeries, getTopRatedSeries, tmdbImg } from "@/lib/tmdb";
import LandscapeCarousel from "@/components/LandscapeCarousel";
import { LandscapeCardProps } from "@/components/LandscapeCard";

export const metadata: Metadata = {
  title: "TV Series | StreamVerse",
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

  const toCards = (
    data: { id: number; name: string; backdrop_path: string | null; poster_path: string | null; vote_average: number }[]
  ): LandscapeCardProps[] =>
    data.map((s) => ({
      id: s.id,
      title: s.name,
      backdrop: tmdbImg(s.backdrop_path, "w780"),
      poster: tmdbImg(s.poster_path, "w500"),
      rating: s.vote_average,
      type: "series" as const,
    }));

  return (
    <div className="pt-20">
      <div className="px-6 md:px-12 lg:px-16 py-8">
        <h1 className="text-3xl md:text-4xl font-black text-white section-title mb-2">TV Series</h1>
        <p className="text-neutral-400 text-sm">Discover the best series currently streaming and airing</p>
      </div>
      <LandscapeCarousel title="Trending This Week" items={toCards(trending.status === "fulfilled" ? trending.value : [])} />
      <LandscapeCarousel title="Currently Airing" items={toCards(airing.status === "fulfilled" ? airing.value : [])} />
      <LandscapeCarousel title="Popular Series" items={toCards(popular.status === "fulfilled" ? popular.value : [])} />
      <LandscapeCarousel title="Top Rated" items={toCards(topRated.status === "fulfilled" ? topRated.value : [])} />
    </div>
  );
}
