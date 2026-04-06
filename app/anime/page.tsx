import type { Metadata } from "next";
import {
  getTrendingAnime,
  getPopularAnime,
  getTopRatedAnime,
  getAiringAnime,
} from "@/lib/anilist";
import Carousel from "@/components/Carousel";
import { CardProps } from "@/components/Card";

export const metadata: Metadata = {
  title: "Anime",
  description: "Browse trending, popular, and top-rated anime. Stream episodes online free.",
};

export const revalidate = 3600;

export default async function AnimePage() {
  const [trending, popular, topRated, airing] = await Promise.allSettled([
    getTrendingAnime(20),
    getPopularAnime(20),
    getTopRatedAnime(20),
    getAiringAnime(20),
  ]);

  const toCards = (list: typeof trending): CardProps[] => {
    if (list.status !== "fulfilled") return [];
    return list.value.map((a) => ({
      id: a.id,
      title: a.title.english || a.title.romaji,
      poster: a.coverImage.extraLarge || a.coverImage.large,
      rating: a.averageScore || 0,
      genres: a.genres,
      year: a.seasonYear?.toString(),
      type: "anime" as const,
      episodes: a.episodes || undefined,
      status: a.status,
    }));
  };

  return (
    <div className="pt-20 max-w-7xl mx-auto">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl md:text-4xl font-black text-white section-title mb-2">Anime</h1>
        <p className="text-neutral-400 text-sm">Explore the best anime from trending to all-time classics</p>
      </div>
      <Carousel title="🔥 Trending Now" viewAllHref="/anime/search?sort=trending" items={toCards(trending)} />
      <Carousel title="⭐ Popular Anime" viewAllHref="/anime/search?sort=popular" items={toCards(popular)} />
      <Carousel title="🏆 Top Rated" viewAllHref="/anime/search?sort=top" items={toCards(topRated)} />
      <Carousel title="📡 Currently Airing" viewAllHref="/anime" items={toCards(airing)} />
    </div>
  );
}
