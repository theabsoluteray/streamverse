import Link from "next/link";
import { Play, Heart } from "lucide-react";
import { APP_CONFIG } from "@/lib/app.config";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-neutral-900">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-red-500 flex items-center justify-center">
              <Play className="w-3.5 h-3.5 text-white fill-white" />
            </div>
            <span className="text-lg font-black gradient-text">StreamVerse</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/anime" className="text-sm text-neutral-500 hover:text-white transition-colors">Anime</Link>
            <Link href="/movies" className="text-sm text-neutral-500 hover:text-white transition-colors">Movies</Link>
            <Link href="/series" className="text-sm text-neutral-500 hover:text-white transition-colors">Series</Link>
            <Link href="/search" className="text-sm text-neutral-500 hover:text-white transition-colors">Search</Link>
          </div>
        </div>

        <p className="text-xs text-neutral-700 leading-relaxed max-w-2xl mb-6">
          {APP_CONFIG.disclaimer}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-700">
          <span>© {year} StreamVerse</span>
          <span className="flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-red-500 fill-red-500 mx-0.5" /> using Next.js
          </span>
        </div>
      </div>
    </footer>
  );
}
