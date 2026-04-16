import type { Metadata } from "next";
import SearchBar from "@/components/SearchBar";

interface Props {
  searchParams: Promise<{ q?: string; tab?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Search: ${q}` : "Search",
    description: "Search for Anime, Movies, and TV Series across all categories.",
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const { q = "" } = await searchParams;

  return (
    <div className="pt-24 pb-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-white mb-1">Search</h1>
          <p className="text-neutral-600 text-xs">
            Find anime, movies, or series
          </p>
        </div>

        <SearchBar initialQuery={q} />
      </div>
    </div>
  );
}
