import type { Metadata } from "next";
import {
  getTrendingAnime,
  getPopularAnime,
  getTopRatedAnime,
  getAiringAnime,
} from "@/lib/anilist";
import LandscapeCarousel from "@/components/LandscapeCarousel";
import { LandscapeCardProps } from "@/components/LandscapeCard";
import Hero, { HeroItem } from "@/components/Hero";
import Top10Section from "@/components/Top10Section";

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

  const trendingData = trending.status === "fulfilled" ? trending.value : [];
  const popularData = popular.status === "fulfilled" ? popular.value : [];
  const topRatedData = topRated.status === "fulfilled" ? topRated.value : [];
  const airingData = airing.status === "fulfilled" ? airing.value : [];

  const heroItems: HeroItem[] = trendingData.slice(0, 6).map((a) => ({
    id: a.id,
    type: "anime" as const,
    title: a.title.english || a.title.romaji,
    description: a.description || "",
    backdrop: a.bannerImage || a.coverImage.extraLarge,
    poster: a.coverImage.extraLarge,
    rating: (a.averageScore || 0) / 10,
    genres: a.genres,
    year: a.seasonYear?.toString() || "",
    watchHref: `/anime/watch/${a.id}`,
    detailHref: `/anime/${a.id}`,
  })).filter((h) => h.backdrop);

  const top10 = popularData.slice(0, 10).map((a) => ({
    id: a.id,
    title: a.title.english || a.title.romaji,
    poster: a.coverImage.extraLarge || a.coverImage.large,
    type: "anime" as const,
  }));

  const toCards = (list: any[]): LandscapeCardProps[] => {
    return list.map((a) => ({
      id: a.id,
      title: a.title.english || a.title.romaji,
      backdrop: a.bannerImage || a.coverImage.extraLarge || a.coverImage.large,
      poster: a.coverImage.extraLarge || a.coverImage.large,
      rating: (a.averageScore || 0) / 10,
      type: "anime" as const,
    }));
  };

  return (
    <>
      <Hero items={heroItems} />
      <Top10Section items={top10} />
      <LandscapeCarousel title="🔥 Trending Now" items={toCards(trendingData)} />
      <LandscapeCarousel title="⭐ Popular Anime" items={toCards(popularData)} />
      <LandscapeCarousel title="🏆 Top Rated" items={toCards(topRatedData)} />
      <LandscapeCarousel title="📡 Currently Airing" items={toCards(airingData)} />
    </>
  );
}
