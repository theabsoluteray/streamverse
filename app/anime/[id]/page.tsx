import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getAnimeById, getRecommendedAnime } from "@/lib/anilist";
import { Play, ArrowLeft, Star } from "lucide-react";
import Card, { CardProps } from "@/components/Card";
import AnimeDetailEpisodeList from "@/components/AnimeDetailEpisodeList";

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
  const trailerKey = anime.trailer?.site === "youtube" ? anime.trailer.id : null;

  return (
    <div>
      <div className="relative w-full h-[65vh] min-h-[380px]">
        {trailerKey ? (
          <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none bg-black">
            <iframe
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&loop=1&playlist=${trailerKey}&controls=0&showinfo=0&rel=0&playsinline=1`}
              className="absolute top-1/2 left-1/2 w-[300vw] h-[300vh] md:w-[150vw] md:h-[150vh] -translate-x-1/2 -translate-y-1/2 opacity-40"
              allow="autoplay; encrypted-media"
            />
          </div>
        ) : (
          <Image src={backdrop} alt={title} fill className="object-cover object-center opacity-30" priority sizes="100vw" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

        <Link href="/anime" className="absolute top-20 left-6 z-20 w-8 h-8 rounded-full bg-black/50 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>

        <div className="absolute bottom-8 left-0 right-0 px-6 md:px-12 lg:px-16 z-10">
          <div className="flex items-center gap-3 text-[11px] text-neutral-500 font-medium uppercase tracking-widest mb-3">
            <span>Anime</span>
            {anime.seasonYear && (
              <>
                <span className="text-neutral-700">·</span>
                <span>{anime.seasonYear}</span>
              </>
            )}
            {anime.episodes && (
              <>
                <span className="text-neutral-700">·</span>
                <span>{anime.episodes} Episodes</span>
              </>
            )}
            {anime.averageScore && anime.averageScore > 0 ? (
              <>
                <span className="text-neutral-700">·</span>
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  {(anime.averageScore / 10).toFixed(1)}
                </span>
              </>
            ) : null}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight max-w-2xl">{title}</h1>

          {anime.genres?.length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              {anime.genres.slice(0, 4).map((g: string) => (
                <span key={g} className="text-[11px] text-neutral-500 font-medium">{g}</span>
              ))}
            </div>
          )}

          {anime.description && (
            <p 
              className="text-neutral-500 text-sm max-w-xl mb-5 line-clamp-3 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: anime.description }} 
            />
          )}

          <Link href={`/anime/watch/${anime.id}`} id={`detail-play-${anime.id}`}
            className="inline-flex items-center gap-2 px-5 py-2 bg-white text-black font-semibold rounded-md text-sm transition-all hover:bg-neutral-200">
            <Play className="w-4 h-4 fill-black" /> Play
          </Link>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto w-full">
        {/* Episode List */}
        <div className="px-6 md:px-12 lg:px-16 mt-4">
          <AnimeDetailEpisodeList
            animeId={anime.id}
            totalEpisodes={anime.episodes || 24}
            animeBackdrop={backdrop}
          />
        </div>

        {/* Recommendations */}
        {recommended.length > 0 && (
          <div id="similars" className="px-6 md:px-12 lg:px-16 pb-10 pt-6">
            <h2 className="section-title text-white mb-5">Similar</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {recommended.map((rec) => (
                <Card key={rec.id} {...rec} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
