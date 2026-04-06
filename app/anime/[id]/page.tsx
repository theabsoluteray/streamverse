import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getAnimeById, getRecommendedAnime } from "@/lib/anilist";
import { Play, Plus, ArrowLeft } from "lucide-react";
import Carousel from "@/components/Carousel";
import { CardProps } from "@/components/Card";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const anime = await getAnimeById(Number(id));
    return { title: anime.title.english || anime.title.romaji, description: anime.description?.replace(/<[^>]*>/g, "").slice(0, 160) };
  } catch {
    return { title: "Anime" };
  }
}

export const revalidate = 3600;

export default async function AnimeDetailPage({ params }: Props) {
  const { id } = await params;
  const animeId = Number(id);

  let anime;
  try {
    anime = await getAnimeById(animeId);
  } catch {
    notFound();
  }

  let recommended: CardProps[] = [];
  try {
    const recs = await getRecommendedAnime(animeId);
    recommended = recs.map((a) => ({
      id: a.id,
      title: a.title.english || a.title.romaji,
      poster: a.coverImage.extraLarge || a.coverImage.large,
      rating: a.averageScore || 0,
      genres: a.genres,
      year: a.seasonYear?.toString(),
      type: "anime" as const,
      episodes: a.episodes || undefined,
    }));
  } catch {/* ignore */}

  const title = anime.title.english || anime.title.romaji;
  const backdrop = anime.bannerImage || anime.coverImage.extraLarge;

  return (
    <div>
      {/* Cinematic Backdrop */}
      <div className="relative w-full h-[70vh] min-h-[400px]">
        <Image src={backdrop} alt={title} fill className="object-cover object-center" priority sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />

        <Link href="/anime" className="absolute top-6 left-6 z-20 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/80 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <div className="absolute bottom-0 left-0 right-0 px-6 md:px-12 lg:px-16 pb-8">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">{title}</h1>
          <div className="flex items-center gap-3 flex-wrap">
            <Link href={`/anime/watch/${anime.id}`} id={`detail-play-${anime.id}`}
              className="flex items-center gap-2 px-6 py-2.5 bg-white hover:bg-neutral-200 text-black font-bold rounded-lg text-sm transition-all">
              <Play className="w-4 h-4 fill-black" /> Play
            </Link>
            <button className="w-10 h-10 rounded-full border border-neutral-600 flex items-center justify-center text-white hover:border-white transition-colors">
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {recommended.length > 0 && (
        <div className="mt-6">
          <Carousel title="You may like" items={recommended} />
        </div>
      )}
    </div>
  );
}
