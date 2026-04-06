import type { Metadata } from "next";
import SearchBar from "@/components/SearchBar";
import { Search } from "lucide-react";

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
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <Search className="w-7 h-7 text-red-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2">Search</h1>
          <p className="text-neutral-400 text-sm">
            Find your next favorite anime, movie, or TV series
          </p>
        </div>

        <SearchBar initialQuery={q} />
      </div>
    </div>
  );
}
