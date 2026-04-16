import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "LostArchive — Anime, Movies & Series",
    template: "%s | LostArchive",
  },
  description:
    "Stream your favorite Anime, Movies, and TV Series for free. Powered by AniList and TMDB.",
  keywords: ["anime", "movies", "series", "streaming", "watch online", "free streaming"],
  openGraph: {
    siteName: "LostArchive",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${inter.variable}`} suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-black text-neutral-400 font-[var(--font-inter)] overflow-x-hidden" suppressHydrationWarning>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
