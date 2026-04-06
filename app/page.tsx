import type { Metadata } from "next";
import { getTrendingAnime, getPopularAnime } from "@/lib/anilist";
import { getTrendingMovies, getTrendingSeries, getTopRatedMovies, getTopRatedSeries, tmdbImg } from "@/lib/tmdb";
import Hero, { HeroItem } from "@/components/Hero";
import LandscapeCarousel from "@/components/LandscapeCarousel";
import { LandscapeCardProps } from "@/components/LandscapeCard";
import Top10Section from "@/components/Top10Section";
import Carousel from "@/components/Carousel";
import { CardProps } from "@/components/Card";

export const metadata: Metadata = {
  title: "StreamVerse — Anime, Movies & Series",
  description: "Stream trending Anime, Movies and TV Series for free.",
};

export const revalidate = 3600;

export default async function HomePage() {
  const [trendingAnime, popularAnime, trendingMovies, trendingSeries, topMovies, topSeries] =
    await Promise.allSettled([
      getTrendingAnime(20),
      getPopularAnime(12),
      getTrendingMovies("week"),
      getTrendingSeries("week"),
      getTopRatedMovies(1),
      getTopRatedSeries(1),
    ]);

  const anime = trendingAnime.status === "fulfilled" ? trendingAnime.value : [];
  const popular = popularAnime.status === "fulfilled" ? popularAnime.value : [];
  const movies = trendingMovies.status === "fulfilled" ? trendingMovies.value : [];
  const series = trendingSeries.status === "fulfilled" ? trendingSeries.value : [];
  const topM = topMovies.status === "fulfilled" ? topMovies.value : [];
  const topS = topSeries.status === "fulfilled" ? topSeries.value : [];

  // Hero items
  const heroItems: HeroItem[] = [
    ...movies.slice(0, 3).map((m) => ({
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
    })),
    ...series.slice(0, 2).map((s) => ({
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
    })),
    ...anime.slice(0, 2).map((a) => ({
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
    })),
  ]
    .filter((h) => h.backdrop && h.backdrop !== "/placeholder.jpg")
    .slice(0, 7);

  // Top 10 — movies & series priority
  const top10 = [
    ...movies.slice(0, 5).map((m) => ({
      id: m.id,
      title: m.title,
      poster: tmdbImg(m.poster_path, "w500"),
      type: "movie" as const,
    })),
    ...series.slice(0, 3).map((s) => ({
      id: s.id,
      title: s.name,
      poster: tmdbImg(s.poster_path, "w500"),
      type: "series" as const,
    })),
    ...anime.slice(0, 2).map((a) => ({
      id: a.id,
      title: a.title.english || a.title.romaji,
      poster: a.coverImage.extraLarge || a.coverImage.large,
      type: "anime" as const,
    })),
  ].slice(0, 10);

  // Trending landscape cards
  const trendingCards: LandscapeCardProps[] = [
    ...movies.slice(0, 6).map((m) => ({
      id: m.id,
      title: m.title,
      backdrop: tmdbImg(m.backdrop_path, "w780"),
      poster: tmdbImg(m.poster_path, "w500"),
      rating: m.vote_average,
      type: "movie" as const,
    })),
    ...series.slice(0, 6).map((s) => ({
      id: s.id,
      title: s.name,
      backdrop: tmdbImg(s.backdrop_path, "w780"),
      poster: tmdbImg(s.poster_path, "w500"),
      rating: s.vote_average,
      type: "series" as const,
    })),
  ];

  // Top rated landscape
  const topRatedCards: LandscapeCardProps[] = [
    ...topM.slice(0, 5).map((m) => ({
      id: m.id,
      title: m.title,
      backdrop: tmdbImg(m.backdrop_path, "w780"),
      rating: m.vote_average,
      type: "movie" as const,
    })),
    ...topS.slice(0, 5).map((s) => ({
      id: s.id,
      title: s.name,
      backdrop: tmdbImg(s.backdrop_path, "w780"),
      rating: s.vote_average,
      type: "series" as const,
    })),
  ];

  // Anime portrait cards
  const animeCards: CardProps[] = anime.map((a) => ({
    id: a.id,
    title: a.title.english || a.title.romaji,
    poster: a.coverImage.extraLarge || a.coverImage.large,
    rating: a.averageScore || 0,
    genres: a.genres,
    year: a.seasonYear?.toString(),
    type: "anime",
    episodes: a.episodes || undefined,
    status: a.status,
  }));

  const popularAnimeCards: CardProps[] = popular.map((a) => ({
    id: a.id,
    title: a.title.english || a.title.romaji,
    poster: a.coverImage.extraLarge || a.coverImage.large,
    rating: a.averageScore || 0,
    genres: a.genres,
    year: a.seasonYear?.toString(),
    type: "anime",
    episodes: a.episodes || undefined,
    status: a.status,
  }));

  return (
    <>
      <Hero items={heroItems} />
      <Top10Section items={top10} />
      <LandscapeCarousel
        title="Trending Today"
        items={trendingCards}
        tabs={[{ label: "Movies", key: "movies" }, { label: "Series", key: "series" }]}
        activeTab="movies"
      />
      <LandscapeCarousel title="Top Rated" items={topRatedCards} />
      <Carousel title="Trending Anime" viewAllHref="/anime" items={animeCards} />
      <Carousel title="Popular Anime" viewAllHref="/anime" items={popularAnimeCards} />
    </>
  );
}
