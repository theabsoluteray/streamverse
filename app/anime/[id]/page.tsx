import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getAnimeById, getRecommendedAnime } from "@/lib/anilist";
import { Play, Plus, ArrowLeft, Star, ArrowDownToLine, LayoutGrid } from "lucide-react";
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
      {/* Cinematic Backdrop */}
      <div className="relative w-full h-[70vh] min-h-[400px]">
        {trailerKey ? (
          <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none bg-black">
            <iframe
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&loop=1&playlist=${trailerKey}&controls=0&showinfo=0&rel=0&playsinline=1`}
              className="absolute top-1/2 left-1/2 w-[300vw] h-[300vh] md:w-[150vw] md:h-[150vh] -translate-x-1/2 -translate-y-1/2 opacity-70"
              allow="autoplay; encrypted-media"
            />
          </div>
        ) : (
          <Image src={backdrop} alt={title} fill className="object-cover object-center" priority sizes="100vw" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />

        <Link href="/anime" className="absolute top-6 left-6 z-20 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/80 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <div className="absolute bottom-10 left-0 right-0 px-6 md:px-12 lg:px-16 pb-8 z-10">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 drop-shadow-lg max-w-2xl">{title}</h1>
          
          {/* Metadata Row */}
          <div className="flex items-center gap-2 flex-wrap text-[11px] md:text-[13px] text-neutral-300 font-medium mb-4 uppercase tracking-wider">
            <div className="flex items-center gap-1 text-yellow-400">
              <Star className="w-4 h-4 fill-current" />
              <span>{((anime.averageScore || 0) / 10).toFixed(1)}</span>
            </div>
            <span className="text-neutral-500">|</span>
            {anime.seasonYear && (
              <>
                <span>{anime.seasonYear}</span>
                <span className="text-neutral-500">|</span>
              </>
            )}
            {anime.episodes && (
              <>
                <span>{anime.episodes} Episodes</span>
                <span className="text-neutral-500">|</span>
              </>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              {anime.genres?.slice(0, 3).map((g: string, i: number) => (
                <span key={g} className="flex items-center gap-2 text-neutral-400">
                  {g}
                  {i < Math.min(anime.genres.length, 3) - 1 && <span className="text-neutral-500">|</span>}
                </span>
              ))}
            </div>
          </div>

          {anime.description && (
            <p 
              className="text-neutral-300 text-xs md:text-sm max-w-2xl mb-6 line-clamp-3 md:line-clamp-4 leading-relaxed drop-shadow-md"
              dangerouslySetInnerHTML={{ __html: anime.description }} 
            />
          )}

          <div className="flex items-center gap-3 flex-wrap">
            <Link href={`/anime/watch/${anime.id}`} id={`detail-play-${anime.id}`}
              className="flex items-center gap-2 px-6 py-2.5 bg-white hover:bg-neutral-200 text-black font-bold rounded-lg text-sm transition-all shadow-lg shadow-white/10">
              <Play className="w-4 h-4 fill-black" /> Play
            </Link>
            <button className="w-10 h-10 rounded-full bg-neutral-800/80 border border-neutral-600 flex items-center justify-center text-white hover:bg-neutral-700 transition-colors backdrop-blur-sm">
              <Plus className="w-5 h-5" />
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-neutral-800/80 border border-neutral-600 text-white font-medium rounded-lg text-sm hover:bg-neutral-700 transition-colors backdrop-blur-sm hidden sm:flex">
              <ArrowDownToLine className="w-4 h-4" />
              Download
            </button>
            <a href="#similars" className="flex items-center gap-2 px-5 py-2.5 bg-neutral-800/80 border border-neutral-600 text-white font-medium rounded-lg text-sm hover:bg-neutral-700 transition-colors backdrop-blur-sm hidden sm:flex">
              <LayoutGrid className="w-4 h-4" />
              Similars
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto w-full">
        {/* Episode List directly on the detail page */}
        <div className="w-full px-6 md:px-12 lg:px-16 mt-6">
          <AnimeDetailEpisodeList
            animeId={anime.id}
            totalEpisodes={anime.episodes || 24}
            animeBackdrop={backdrop}
          />
        </div>

        {recommended.length > 0 && (
          <div id="similars" className="w-full px-6 md:px-12 lg:px-16 pb-12 pt-10">
            <h2 className="section-title text-white mb-6">You may like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
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
