/**
 * ============================================================
 *  APP CONFIGURATION
 *  Edit this file to update site-wide settings.
 * ============================================================
 */

export const APP_CONFIG = {
  /** Site name shown in navbar, footer, and metadata */
  siteName: "StreamVerse",

  /** Your GitHub repository or profile link */
  githubUrl: "https://github.com",

  /** Short tagline shown in the footer */
  tagline: "Your ultimate streaming destination for Anime, Movies, and TV Series. Free, fast, and beautiful.",

  /** Footer disclaimer text */
  disclaimer:
    "StreamVerse does not host any video content. All streams are provided by third-party embed providers. " +
    "We use the AniList GraphQL API and The Movie Database (TMDB) API for metadata. " +
    "This site is intended for educational and personal use only.",
} as const;
