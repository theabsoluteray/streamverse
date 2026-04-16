import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getSeriesById, tmdbImg } from "@/lib/tmdb";
import { Play, ArrowLeft, Star } from "lucide-react";
import LandscapeCard, { LandscapeCardProps } from "@/components/LandscapeCard";
import SeriesDetailEpisodeList from "@/components/SeriesDetailEpisodeList";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const series = await getSeriesById(Number(id));
    return { title: series.name, description: series.overview?.slice(0, 160) };
  } catch {
    return { title: "Series" };
  }
}

export const revalidate = 3600;

export default async function SeriesDetailPage({ params }: Props) {
  const { id } = await params;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let series: any;
  try {
    series = await getSeriesById(Number(id));
  } catch {
    notFound();
  }

  const cast = series.credits?.cast?.slice(0, 12) || [];
  const recs: LandscapeCardProps[] = (series.recommendations?.results || [])
    .slice(0, 12)
    .map((s: { id: number; name: string; backdrop_path: string | null; vote_average: number }) => ({
      id: s.id,
      title: s.name,
      backdrop: tmdbImg(s.backdrop_path, "w780"),
      rating: s.vote_average,
      type: "series" as const,
    }));

  const trailerObj = series.videos?.results?.find((v: any) => v.site === "YouTube" && v.type === "Trailer");
  const trailerKey = trailerObj?.key;

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
        ) : series.backdrop_path && (
          <Image src={tmdbImg(series.backdrop_path, "original")} alt={series.name} fill className="object-cover object-center opacity-30" priority sizes="100vw" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

        <Link href="/series" className="absolute top-20 left-6 z-20 w-8 h-8 rounded-full bg-black/50 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>

        <div className="absolute bottom-8 left-0 right-0 px-6 md:px-12 lg:px-16 z-10">
          <div className="flex items-center gap-3 text-[11px] text-neutral-500 font-medium uppercase tracking-widest mb-3">
            <span>Series</span>
            {series.first_air_date && (
              <>
                <span className="text-neutral-700">·</span>
                <span>{series.first_air_date.slice(0, 4)}</span>
              </>
            )}
            {series.number_of_seasons > 0 && (
              <>
                <span className="text-neutral-700">·</span>
                <span>{series.number_of_seasons} Season{series.number_of_seasons > 1 ? 's' : ''}</span>
              </>
            )}
            {series.vote_average > 0 && (
              <>
                <span className="text-neutral-700">·</span>
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  {series.vote_average.toFixed(1)}
                </span>
              </>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight max-w-2xl">{series.name}</h1>

          {series.genres?.length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              {series.genres.map((g: any) => (
                <span key={g.id} className="text-[11px] text-neutral-500 font-medium">{g.name}</span>
              ))}
            </div>
          )}

          {series.overview && (
            <p className="text-neutral-500 text-sm max-w-xl mb-5 line-clamp-3 leading-relaxed">
              {series.overview}
            </p>
          )}

          <Link href={`/series/watch/${series.id}`} id={`detail-play-${series.id}`}
            className="inline-flex items-center gap-2 px-5 py-2 bg-white text-black font-semibold rounded-md text-sm transition-all hover:bg-neutral-200">
            <Play className="w-4 h-4 fill-black" /> Play
          </Link>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto w-full">
        {/* Episode list */}
        <div className="px-6 md:px-12 lg:px-16 mt-4">
          <SeriesDetailEpisodeList
            seriesId={series.id}
            seasons={series.seasons || []}
          />
        </div>

        {/* Cast */}
        {cast.length > 0 && (
          <div className="px-6 md:px-12 lg:px-16 py-8">
            <h2 className="section-title text-white mb-4">Cast</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {cast.map((person: { id: number; name: string; character: string; profile_path: string | null }) => (
                <div key={person.id} className="flex items-center gap-3 px-3 py-2 rounded-md bg-neutral-900/40 border border-neutral-800/30">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden bg-neutral-800 flex-shrink-0">
                    {person.profile_path ? (
                      <Image src={tmdbImg(person.profile_path, "w185")} alt={person.name} fill className="object-cover" sizes="32px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-600 text-xs">?</div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-neutral-300 truncate">{person.name}</p>
                    <p className="text-[10px] text-neutral-600 truncate">{person.character}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {recs.length > 0 && (
          <div id="similars" className="px-6 md:px-12 lg:px-16 pb-10 pt-2">
            <h2 className="section-title text-white mb-5">Similar</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3">
              {recs.map((rec) => (
                <LandscapeCard key={rec.id} {...rec} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
