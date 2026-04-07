import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getSeriesById, tmdbImg } from "@/lib/tmdb";
import { Play, Plus, ArrowLeft, Star, ArrowDownToLine, LayoutGrid } from "lucide-react";
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
  const logo = series.images?.logos?.find((l: any) => l.iso_639_1 === "en")?.file_path || series.images?.logos?.[0]?.file_path;
  const recs: LandscapeCardProps[] = (series.recommendations?.results || [])
    .slice(0, 15)
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
      <div className="relative w-full h-[70vh] min-h-[400px]">
        {trailerKey ? (
          <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none bg-black">
            <iframe
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&loop=1&playlist=${trailerKey}&controls=0&showinfo=0&rel=0&playsinline=1`}
              className="absolute top-1/2 left-1/2 w-[300vw] h-[300vh] md:w-[150vw] md:h-[150vh] -translate-x-1/2 -translate-y-1/2 opacity-70"
              allow="autoplay; encrypted-media"
            />
          </div>
        ) : series.backdrop_path && (
          <Image src={tmdbImg(series.backdrop_path, "original")} alt={series.name} fill className="object-cover object-center" priority sizes="100vw" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />

        <Link href="/series" className="absolute top-6 left-6 z-20 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/80 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <div className="absolute bottom-10 left-0 right-0 px-6 md:px-12 lg:px-16 pb-8 z-10">
          {logo ? (
            <div className="relative max-w-xs md:max-w-sm h-20 md:h-28 mb-3">
              <Image src={tmdbImg(logo, "w500")} alt={series.name} fill className="object-contain object-left-bottom drop-shadow-2xl" />
            </div>
          ) : (
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 drop-shadow-lg">{series.name}</h1>
          )}
          
          {/* Metadata Row */}
          <div className="flex items-center gap-2 flex-wrap text-[11px] md:text-[13px] text-neutral-300 font-medium mb-4 uppercase tracking-wider">
            <div className="flex items-center gap-1 text-yellow-400">
              <Star className="w-4 h-4 fill-current" />
              <span>{(series.vote_average || 0).toFixed(1)}</span>
            </div>
            <span className="text-neutral-500">|</span>
            {series.first_air_date && (
              <>
                <span>{series.first_air_date.slice(0, 4)}</span>
                <span className="text-neutral-500">|</span>
              </>
            )}
            {series.number_of_seasons > 0 && (
              <>
                <span>{series.number_of_seasons} Season{series.number_of_seasons > 1 ? 's' : ''}</span>
                <span className="text-neutral-500">|</span>
              </>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              {series.genres?.map((g: any, i: number) => (
                <span key={g.id} className="flex items-center gap-2 text-neutral-400">
                  {g.name}
                  {i < series.genres.length - 1 && <span className="text-neutral-500">|</span>}
                </span>
              ))}
            </div>
          </div>

          {series.overview && (
            <p className="text-neutral-300 text-xs md:text-sm max-w-2xl mb-6 line-clamp-3 md:line-clamp-4 leading-relaxed drop-shadow-md">
              {series.overview}
            </p>
          )}

          <div className="flex items-center gap-3 flex-wrap">
            <Link href={`/series/watch/${series.id}`} id={`detail-play-${series.id}`}
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
        {/* Episode list directly on detail page */}
        <div className="w-full px-6 md:px-12 lg:px-16 mt-6">
          <SeriesDetailEpisodeList
            seriesId={series.id}
            seasons={series.seasons || []}
          />
        </div>

        <div className="w-full px-6 md:px-12 lg:px-16 py-10">
          {cast.length > 0 && (
            <div className="mb-10">
              <h2 className="section-title text-white mb-4">Actors</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {cast.map((person: { id: number; name: string; character: string; profile_path: string | null }) => (
                  <div key={person.id} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-neutral-900/60 border border-neutral-800/40">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-neutral-800 flex-shrink-0">
                      {person.profile_path ? (
                        <Image src={tmdbImg(person.profile_path, "w185")} alt={person.name} fill className="object-cover" sizes="40px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-500 text-lg">👤</div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{person.name}</p>
                      <p className="text-xs text-neutral-500 truncate">{person.character}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {recs.length > 0 && (
          <div id="similars" className="w-full px-6 md:px-12 lg:px-16 pb-12 pt-4">
            <h2 className="section-title text-white mb-6">You may like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
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
