/**
 * Player server logic — reads from servers.config.ts.
 * Do NOT edit URLs here. Edit lib/servers.config.ts instead.
 */

import {
  PRIMARY_CONFIGS,
  BACKUP_CONFIGS,
  DEFAULT_SERVER_KEY,
  DEFAULT_ANIME_SERVER_KEY,
  type ServerConfig,
} from "./servers.config";

export interface VideoServer {
  name: string;
  key: string;
  isPrimary: boolean;
  getMovieUrl?: (tmdbId: number) => string;
  getSeriesUrl?: (tmdbId: number, season: number, episode: number) => string;
  getAnimeUrl?: (malId: number, episode: number) => string;
  getAnimeUrlByAnilistId?: (anilistId: number, episode: number) => string;
  supportsAnime: boolean;
  animeIdType?: "mal" | "anilist" | "both";
}

/** Replaces template placeholders with actual values */
function buildUrl(
  template: string,
  vars: Record<string, string | number>
): string {
  return Object.entries(vars).reduce(
    (url, [key, val]) => url.replaceAll(`{${key}}`, String(val)),
    template
  );
}

/** Converts a ServerConfig into a live VideoServer */
function fromConfig(cfg: ServerConfig): VideoServer {
  const server: VideoServer = {
    name: cfg.name,
    key: cfg.key,
    isPrimary: cfg.isPrimary,
    supportsAnime: cfg.supportsAnime,
    animeIdType: cfg.animeIdType,
  };

  if (cfg.movie) server.getMovieUrl = (id) => buildUrl(cfg.movie!, { id });
  if (cfg.series) server.getSeriesUrl = (id, s, e) => buildUrl(cfg.series!, { id, s, e });

  if (cfg.supportsAnime && cfg.anime) {
    if (cfg.animeIdType === "anilist") {
      server.getAnimeUrlByAnilistId = (anilistId, e) =>
        buildUrl(cfg.anime!, { anilist: anilistId, e });
    } else {
      // mal (default)
      server.getAnimeUrl = (malId, e) =>
        buildUrl(cfg.anime!, { mal: malId, e });
    }
  }

  return server;
}

export const VIDEO_SERVERS: VideoServer[] = [
  ...PRIMARY_CONFIGS.map(fromConfig),
  ...BACKUP_CONFIGS.map(fromConfig),
];

// ────────────────────────────────────────────────
// URL BUILDERS
// ────────────────────────────────────────────────
export function getMovieServers(tmdbId: number) {
  return VIDEO_SERVERS.filter((s) => s.getMovieUrl).map((s) => ({
    name: s.name,
    key: s.key,
    isPrimary: s.isPrimary,
    url: s.getMovieUrl!(tmdbId),
  }));
}

export function getSeriesServers(tmdbId: number, season: number, episode: number) {
  return VIDEO_SERVERS.filter((s) => s.getSeriesUrl).map((s) => ({
    name: s.name,
    key: s.key,
    isPrimary: s.isPrimary,
    url: s.getSeriesUrl!(tmdbId, season, episode),
  }));
}

export function getAnimeServers(malId: number, episode: number, anilistId?: number) {
  const all = VIDEO_SERVERS.filter((s) => s.supportsAnime)
    .map((s) => {
      let url = "";
      if (s.animeIdType === "anilist" && anilistId && s.getAnimeUrlByAnilistId) {
        url = s.getAnimeUrlByAnilistId(anilistId, episode);
      } else if (s.getAnimeUrl) {
        url = s.getAnimeUrl(malId, episode);
      }
      return { name: s.name, key: s.key, isPrimary: s.isPrimary, url };
    })
    .filter((s) => s.url !== "");

  // Put MegaPlay (default anime server) first
  const idx = all.findIndex((s) => s.key === DEFAULT_ANIME_SERVER_KEY);
  if (idx > 0) {
    const [videasy] = all.splice(idx, 1);
    all.unshift(videasy);
  }
  return all;
}

// ────────────────────────────────────────────────
// STORAGE HELPERS
// ────────────────────────────────────────────────
export const STORAGE_KEY_SERVER = "preferred_server";
export const STORAGE_KEY_PROGRESS = "watch_progress";

export function getSavedServer(contentType?: "anime" | "movie" | "series"): string {
  if (typeof window === "undefined") {
    return contentType === "anime" ? DEFAULT_ANIME_SERVER_KEY : DEFAULT_SERVER_KEY;
  }
  const saved = localStorage.getItem(STORAGE_KEY_SERVER);
  if (saved) return saved;
  return contentType === "anime" ? DEFAULT_ANIME_SERVER_KEY : DEFAULT_SERVER_KEY;
}

export function saveServer(key: string): void {
  if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY_SERVER, key);
}

export function saveProgress(id: string, progress: number): void {
  if (typeof window === "undefined") return;
  const all = getProgress();
  all[id] = progress;
  localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(all));
}

export function getProgress(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_PROGRESS) || "{}");
  } catch {
    return {};
  }
}
