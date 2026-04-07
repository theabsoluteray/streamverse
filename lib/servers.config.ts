/**
 * ============================================================
 *  STREAMING SERVER CONFIGURATION
 *  Edit this file to update server URLs without touching logic.
 * ============================================================
 *
 * URL placeholders:
 *   {id}      → TMDB ID (movies / series)
 *   {s}       → Season number
 *   {e}       → Episode number
 *   {mal}     → MyAnimeList ID
 *   {anilist} → AniList ID
 *
 * To add a new server:
 *   1. Add an entry to PRIMARY_CONFIGS or BACKUP_CONFIGS
 *   2. Fill in movie / series / anime URLs
 *   3. Set supportsAnime + animeIdType as appropriate
 * ============================================================
 */

export type AnimeIdType = "mal" | "anilist";

export interface ServerConfig {
  /** Display name shown in the UI */
  name: string;
  /** Unique key used internally and stored in localStorage */
  key: string;
  /** Whether this server is primary (HD badge) or backup */
  isPrimary: boolean;

  // ── URL templates ────────────────────────────────────────
  movie?: string;       // e.g. "https://example.com/embed/movie/{id}"
  series?: string;      // e.g. "https://example.com/embed/tv/{id}/{s}/{e}"
  anime?: string;      // optional — only if server supports anime

  supportsAnime: boolean;
  animeIdType?: AnimeIdType;  // which ID the anime URL expects
}

// ─────────────────────────────────────────────────────────────
//  PRIMARY SERVERS  (shown first, HD badge in UI)
// ─────────────────────────────────────────────────────────────
export const PRIMARY_CONFIGS: ServerConfig[] = [
  {
    name: "VidKing",
    key: "vidking",
    isPrimary: true,
    movie:  "https://www.vidking.net/embed/movie/{id}",
    series: "https://www.vidking.net/embed/tv/{id}/{s}/{e}",
    supportsAnime: false,
  },
  {
    name: "VidEasy",
    key: "videasy",
    isPrimary: true,
    anime:  "https://player.videasy.net/anime/{anilist}/{e}",
    supportsAnime: true,
    animeIdType: "anilist",
  },
];

// ─────────────────────────────────────────────────────────────
//  BACKUP SERVERS  (fallback when primary fails)
// ─────────────────────────────────────────────────────────────
export const BACKUP_CONFIGS: ServerConfig[] = [];

/** Default server key loaded when no preference is saved */
export const DEFAULT_SERVER_KEY = "vidking";

/** Default server key for anime content — VidEasy has best anime support */
export const DEFAULT_ANIME_SERVER_KEY = "videasy";
