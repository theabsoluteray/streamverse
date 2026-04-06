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
    default: "StreamVerse — Anime, Movies & Series",
    template: "%s | StreamVerse",
  },
  description:
    "Stream your favorite Anime, Movies, and TV Series for free. Powered by AniList and TMDB.",
  keywords: ["anime", "movies", "series", "streaming", "watch online", "free streaming"],
  openGraph: {
    siteName: "StreamVerse",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <body className="antialiased min-h-screen bg-black text-neutral-100 font-[var(--font-inter)]">
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
