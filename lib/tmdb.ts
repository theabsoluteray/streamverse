// TMDB REST API Library
// Docs: https://developer.themoviedb.org/docs

const BASE = process.env.NEXT_PUBLIC_TMDB_BASE_URL || "https://api.themoviedb.org/3";
const KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || "";
const IMG_BASE = "https://image.tmdb.org/t/p";

export const tmdbImg = (path: string | null, size = "w500"): string =>
  path ? `${IMG_BASE}/${size}${path}` : "/placeholder.jpg";

async function tmdbFetch<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE}${endpoint}`);
  url.searchParams.set("api_key", KEY);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`TMDB API error: ${res.status} ${endpoint}`);
  return res.json() as Promise<T>;
}

export interface TMDBMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  runtime?: number;
  budget?: number;
  revenue?: number;
  tagline?: string;
  status?: string;
  homepage?: string;
  imdb_id?: string;
  adult: boolean;
  video: boolean;
}

export interface TMDBSeries {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  number_of_seasons?: number;
  number_of_episodes?: number;
  tagline?: string;
  status?: string;
  homepage?: string;
  in_production?: boolean;
  networks?: { id: number; name: string; logo_path: string | null }[];
  seasons?: TMDBSeason[];
  episode_run_time?: number[];
  origin_country?: string[];
}

export interface TMDBSeason {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
  overview: string;
  poster_path: string | null;
  air_date: string;
  episodes?: TMDBEpisode[];
}

export interface TMDBEpisode {
  id: number;
  name: string;
  overview: string;
  still_path: string | null;
  episode_number: number;
  season_number: number;
  air_date: string;
  vote_average: number;
  runtime: number | null;
}

export interface TMDBCast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

interface TMDBPageResult<T> {
  results: T[];
  page: number;
  total_pages: number;
  total_results: number;
}

// ─── Movies ───────────────────────────────────────────────────────────────────

export async function getTrendingMovies(timeWindow: "day" | "week" = "week"): Promise<TMDBMovie[]> {
  const data = await tmdbFetch<TMDBPageResult<TMDBMovie>>(`/trending/movie/${timeWindow}`);
  return data.results;
}

export async function getPopularMovies(page = 1): Promise<TMDBMovie[]> {
  const data = await tmdbFetch<TMDBPageResult<TMDBMovie>>("/movie/popular", { page: String(page) });
  return data.results;
}

export async function getTopRatedMovies(page = 1): Promise<TMDBMovie[]> {
  const data = await tmdbFetch<TMDBPageResult<TMDBMovie>>("/movie/top_rated", { page: String(page) });
  return data.results;
}

export async function getNowPlayingMovies(page = 1): Promise<TMDBMovie[]> {
  const data = await tmdbFetch<TMDBPageResult<TMDBMovie>>("/movie/now_playing", { page: String(page) });
  return data.results;
}

export async function getMovieById(id: number): Promise<TMDBMovie> {
  return tmdbFetch<TMDBMovie>(`/movie/${id}`, { append_to_response: "credits,videos,recommendations,images" });
}

export async function searchMovies(query: string, page = 1): Promise<{ results: TMDBMovie[]; total: number }> {
  const data = await tmdbFetch<TMDBPageResult<TMDBMovie>>("/search/movie", { query, page: String(page) });
  return { results: data.results, total: data.total_results };
}

// ─── Series ───────────────────────────────────────────────────────────────────

export async function getTrendingSeries(timeWindow: "day" | "week" = "week"): Promise<TMDBSeries[]> {
  const data = await tmdbFetch<TMDBPageResult<TMDBSeries>>(`/trending/tv/${timeWindow}`);
  return data.results;
}

export async function getPopularSeries(page = 1): Promise<TMDBSeries[]> {
  const data = await tmdbFetch<TMDBPageResult<TMDBSeries>>("/tv/popular", { page: String(page) });
  return data.results;
}

export async function getTopRatedSeries(page = 1): Promise<TMDBSeries[]> {
  const data = await tmdbFetch<TMDBPageResult<TMDBSeries>>("/tv/top_rated", { page: String(page) });
  return data.results;
}

export async function getAiringSeries(page = 1): Promise<TMDBSeries[]> {
  const data = await tmdbFetch<TMDBPageResult<TMDBSeries>>("/tv/on_the_air", { page: String(page) });
  return data.results;
}

export async function getSeriesById(id: number): Promise<TMDBSeries> {
  return tmdbFetch<TMDBSeries>(`/tv/${id}`, { append_to_response: "credits,videos,recommendations,images" });
}

export async function getSeriesSeason(tvId: number, season: number): Promise<TMDBSeason> {
  return tmdbFetch<TMDBSeason>(`/tv/${tvId}/season/${season}`);
}

export async function searchSeries(query: string, page = 1): Promise<{ results: TMDBSeries[]; total: number }> {
  const data = await tmdbFetch<TMDBPageResult<TMDBSeries>>("/search/tv", { query, page: String(page) });
  return { results: data.results, total: data.total_results };
}

export async function getMovieGenres(): Promise<{ id: number; name: string }[]> {
  const data = await tmdbFetch<{ genres: { id: number; name: string }[] }>("/genre/movie/list");
  return data.genres;
}

export async function getTVGenres(): Promise<{ id: number; name: string }[]> {
  const data = await tmdbFetch<{ genres: { id: number; name: string }[] }>("/genre/tv/list");
  return data.genres;
}
