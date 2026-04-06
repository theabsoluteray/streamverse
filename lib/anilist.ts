// AniList GraphQL API Library
// Endpoint: https://graphql.anilist.co

const ANILIST_URL = "https://graphql.anilist.co";

async function anilistQuery<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const res = await fetch(ANILIST_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`AniList API error: ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json.data as T;
}

const MEDIA_FIELDS = `
  id
  idMal
  title { romaji english native }
  coverImage { extraLarge large medium color }
  bannerImage
  description(asHtml: false)
  genres
  averageScore
  popularity
  trending
  episodes
  duration
  status
  season
  seasonYear
  format
  studios(isMain: true) { nodes { name } }
  nextAiringEpisode { airingAt episode }
  startDate { year month day }
  endDate { year month day }
  trailer { id site }
  tags { name rank isMediaSpoiler }
`;

export interface AniMedia {
  id: number;
  idMal: number | null;
  title: { romaji: string; english: string | null; native: string };
  coverImage: { extraLarge: string; large: string; medium: string; color: string | null };
  bannerImage: string | null;
  description: string | null;
  genres: string[];
  averageScore: number | null;
  popularity: number;
  trending: number;
  episodes: number | null;
  duration: number | null;
  status: string;
  season: string | null;
  seasonYear: number | null;
  format: string;
  studios: { nodes: { name: string }[] };
  nextAiringEpisode: { airingAt: number; episode: number } | null;
  startDate: { year: number; month: number; day: number };
  endDate: { year: number | null; month: number | null; day: number | null };
  trailer: { id: string; site: string } | null;
  tags: { name: string; rank: number; isMediaSpoiler: boolean }[];
}

interface PageData {
  Page: {
    media: AniMedia[];
    pageInfo?: { total: number; currentPage: number; hasNextPage: boolean };
  };
}

export async function getTrendingAnime(perPage = 20, page = 1): Promise<AniMedia[]> {
  const query = `query($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      media(type: ANIME, sort: TRENDING_DESC) { ${MEDIA_FIELDS} }
    }
  }`;
  const data = await anilistQuery<PageData>(query, { page, perPage });
  return data.Page.media;
}

export async function getPopularAnime(perPage = 20, page = 1): Promise<AniMedia[]> {
  const query = `query($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      media(type: ANIME, sort: POPULARITY_DESC) { ${MEDIA_FIELDS} }
    }
  }`;
  const data = await anilistQuery<PageData>(query, { page, perPage });
  return data.Page.media;
}

export async function getTopRatedAnime(perPage = 20, page = 1): Promise<AniMedia[]> {
  const query = `query($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      media(type: ANIME, sort: SCORE_DESC, averageScore_greater: 70) { ${MEDIA_FIELDS} }
    }
  }`;
  const data = await anilistQuery<PageData>(query, { page, perPage });
  return data.Page.media;
}

export async function getAiringAnime(perPage = 20, page = 1): Promise<AniMedia[]> {
  const query = `query($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      media(type: ANIME, status: RELEASING, sort: POPULARITY_DESC) { ${MEDIA_FIELDS} }
    }
  }`;
  const data = await anilistQuery<PageData>(query, { page, perPage });
  return data.Page.media;
}

export async function getAnimeById(id: number): Promise<AniMedia> {
  const query = `query($id: Int) {
    Media(id: $id, type: ANIME) { ${MEDIA_FIELDS} }
  }`;
  const data = await anilistQuery<{ Media: AniMedia }>(query, { id });
  return data.Media;
}

export async function searchAnime(search: string, perPage = 20): Promise<AniMedia[]> {
  const query = `query($search: String, $perPage: Int) {
    Page(perPage: $perPage) {
      media(type: ANIME, search: $search) { ${MEDIA_FIELDS} }
    }
  }`;
  const data = await anilistQuery<PageData>(query, { search, perPage });
  return data.Page.media;
}

export interface AiringSchedule {
  id: number;
  airingAt: number;
  episode: number;
  media: AniMedia;
}

export async function getAnimeSchedule(): Promise<AiringSchedule[]> {
  const now = Math.floor(Date.now() / 1000);
  const weekLater = now + 7 * 24 * 60 * 60;
  const query = `query($from: Int, $to: Int) {
    Page(perPage: 50) {
      airingSchedules(airingAt_greater: $from, airingAt_lesser: $to, sort: TIME) {
        id airingAt episode
        media {
          id idMal
          title { romaji english }
          coverImage { large medium }
          genres averageScore popularity status
          bannerImage description format season seasonYear episodes duration
          studios(isMain: true) { nodes { name } }
          nextAiringEpisode { airingAt episode }
          startDate { year month day }
          endDate { year month day }
          trailer { id site }
          tags { name rank isMediaSpoiler }
          trending
          coverImage { extraLarge large medium color }
        }
      }
    }
  }`;
  const data = await anilistQuery<{ Page: { airingSchedules: AiringSchedule[] } }>(query, { from: now, to: weekLater });
  return data.Page.airingSchedules;
}

export async function getRecommendedAnime(id: number): Promise<AniMedia[]> {
  const query = `query($id: Int) {
    Media(id: $id, type: ANIME) {
      recommendations(perPage: 12, sort: RATING_DESC) {
        nodes {
          mediaRecommendation { ${MEDIA_FIELDS} }
        }
      }
    }
  }`;
  const data = await anilistQuery<{
    Media: { recommendations: { nodes: { mediaRecommendation: AniMedia }[] } }
  }>(query, { id });
  return data.Media.recommendations.nodes
    .map((n) => n.mediaRecommendation)
    .filter(Boolean);
}
