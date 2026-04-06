import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getSeriesById, tmdbImg } from "@/lib/tmdb";
import { Play, Plus, ArrowLeft } from "lucide-react";
import LandscapeCarousel from "@/components/LandscapeCarousel";
import { LandscapeCardProps } from "@/components/LandscapeCard";

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
    .slice(0, 15)
    .map((s: { id: number; name: string; backdrop_path: string | null; vote_average: number }) => ({
      id: s.id,
      title: s.name,
      backdrop: tmdbImg(s.backdrop_path, "w780"),
      rating: s.vote_average,
      type: "series" as const,
    }));

  return (
    <div>
      <div className="relative w-full h-[70vh] min-h-[400px]">
        {series.backdrop_path && (
          <Image src={tmdbImg(series.backdrop_path, "original")} alt={series.name} fill className="object-cover object-center" priority sizes="100vw" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />

        <Link href="/series" className="absolute top-6 left-6 z-20 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/80 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <div className="absolute bottom-0 left-0 right-0 px-6 md:px-12 lg:px-16 pb-8">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">{series.name}</h1>
          <div className="flex items-center gap-3 flex-wrap">
            <Link href={`/series/watch/${series.id}`} id={`detail-play-${series.id}`}
              className="flex items-center gap-2 px-6 py-2.5 bg-white hover:bg-neutral-200 text-black font-bold rounded-lg text-sm transition-all">
              <Play className="w-4 h-4 fill-black" /> Play
            </Link>
            <button className="w-10 h-10 rounded-full border border-neutral-600 flex items-center justify-center text-white hover:border-white transition-colors">
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-10">
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

      {recs.length > 0 && <LandscapeCarousel title="You may like" items={recs} />}
    </div>
  );
}
